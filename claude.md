# onboarding-form

## Purpose
Angular web application hosting an all-purpose account **onboarding form** —
a three-step registration flow whose subject is strict, visible validation.

## Stack
- Angular 20.3.x (standalone components, no NgModules)
- Reactive Forms, TypeScript, SCSS
- Client-side rendering only (no SSR)
- Karma + Jasmine for unit tests

## The form
11 validated fields + 1 consent control, across 3 steps. Full rule-by-rule
spec lives in `VALIDATION_RULES.txt` at the project root.

Key files
- `src/app/validators/form-validators.ts` — one validator per field. Each returns
  **every** failing rule key at once, not just the first. The UI depends on this.
- `src/app/validators/form-validators.spec.ts` — 34 specs covering the rules.
- `src/app/onboarding/field-rules.ts` — rule metadata: chip label + message per
  error key, and the order that decides which message is shown.
- `src/app/data/onboarding-data.ts` — countries (dial codes, phone lengths,
  postal patterns), roles, reserved handles, blocklists.
- `src/app/services/username-availability.ts` — stubbed async handle lookup.
  Swap `isTaken` for an HttpClient call when the API exists.
- `src/app/onboarding/onboarding.{ts,html,scss}` — the component.

Design notes
- Three-column app shell at >1180px: step rail, form panel, preflight ledger.
  The shell is fluid, not width-capped, and on desktop it is exactly viewport
  height; the form and ledger scroll independently so the step actions and the
  gauge never leave the screen.
- The **preflight ledger** on the right lists all 12 checks live and is the
  signature element; selecting a row jumps to that field.
- **Rule chips** under each input show every rule for that field and light up
  individually. Async rules stay unlit until the lookup actually returns.
- Tokens (colour, type, radius) are global in `src/styles.scss`, including the
  dark palette. Component styles never hardcode a colour.
- Fonts: Archivo (display, variable width axis), Instrument Sans (body),
  IBM Plex Mono (labels, chips, ledger) — loaded in `src/index.html`.

Theming
- Six themes, each setting colour + geometry + field style. Catalogue in
  `src/app/data/themes.ts`, tokens in `src/styles.scss` under
  `:root[data-theme='<id>']`, applied by `ThemeStore` (`src/app/services/theme.ts`)
  which writes `data-theme` on <html> and persists to localStorage.
- Only Blueprint follows `prefers-color-scheme`; the other five commit to a mode.
- Field style is entirely token-driven: `--field-bg`, `--field-border-width`
  (multi-value, which is how the underlined theme works), `--field-border-color`,
  `--field-radius`, `--field-pad-x`, `--field-focus`. Never add a
  `[data-theme=...]` rule inside the component; add a token instead.
- The invalid-field state is a `--fail-wash` background tint, not an extra
  outline, so borderless and underlined themes keep their shape.

Adding a field
1. Add the validator to `form-validators.ts` (return granular keys).
2. Add its `FieldSpec` to `FIELDS` in `field-rules.ts` with chip labels/messages.
3. Add the control to the form group and the markup in `onboarding.html`.
4. Document it in `VALIDATION_RULES.txt` and add specs.

## Commands
- `npm start` — dev server at http://localhost:4200
- `npm run build` — production build to `dist/onboarding-form`
- `npx ng test --watch=false --browsers=ChromeHeadless` — unit tests

## Notes
- Node 22.12.0 is installed; Angular 21 requires Node >= 22.22.3, so this
  project is pinned to Angular 20.
- `anyComponentStyle` budget in `angular.json` was raised to 16kB/24kB for the
  design-heavy onboarding stylesheet.
- Keep product naming generic. This is a reusable onboarding form, not a form
  for one named company.

## Git
Remote: https://github.com/taskrecording084/Onboarding-form-all-purpose
The session's GitHub account (`nextjedi`) only has READ on that repo; pushes go
through a URL carrying the owner's username so the credential helper prompts for
the owner account.

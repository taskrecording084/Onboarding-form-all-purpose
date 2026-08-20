# Onboarding form

An all-purpose account-registration form built with Angular 20 and Reactive
Forms. Three steps, 11 validated fields plus a consent control, and every rule
visible to the person filling it in.

The point of this project is the validation, so the interface puts it in the
foreground rather than hiding it behind a single red line under an input.

## What makes it different

**Preflight ledger.** A rail listing all 12 checks at once, live, with the
reason each failing check is failing. Select any line to jump straight to that
field.

**Rule chips.** Every rule for a field is shown under it and lights up
individually as it is satisfied — so nobody has to guess what a password box
wants. Rules that depend on a server lookup stay unlit until the lookup has
actually returned; a check that never ran is never shown as a check that passed.

**Rules that know about each other.** The selected country drives both the phone
format and the postal-code format. The password is checked against the handle
and the email local part. Change one field and its dependants re-validate.

## Themes

Six of them. A theme is not just a palette — each one sets its own colour,
its own geometry (radius, shadow, borders, type pairing) and its own **field
style**, so the same form genuinely looks like a different product.

| Theme | Mode | Fields | Character |
|-------|------|--------|-----------|
| Blueprint | follows system | Outlined | Cool paper, cobalt signal, engineered grotesk |
| Carbon | dark | Underlined | Industrial, amber signal, 3px radius |
| Linen | light | Filled | Warm paper, plum accent, serif display |
| Neon | dark | Inset glow | Violet ground, magenta glow, pill buttons |
| Terminal | dark | Square | Phosphor green, monospace throughout, zero radius |
| Bloom | light | Pill | Soft lilac, teal accent, generous curves |

Pick one from the switcher in the masthead; the choice is stored in
`localStorage` and applied as `data-theme` on `<html>`.

Every theme is a block of custom properties in `src/styles.scss`. No component
style hardcodes a colour, a radius or a border — including the inputs, whose
entire look comes from `--field-bg`, `--field-border-width`, `--field-radius`,
`--field-pad-x` and `--field-focus`. That is what lets a single `.input` rule
render as outlined, underlined, filled, inset, square or pill.

To add a seventh: append a record to `THEMES` in `src/app/data/themes.ts`, add a
matching `:root[data-theme='...']` block, and add its swatch gradient in
`onboarding.scss`.

## The fields

| # | Field | Notes |
|---|-------|-------|
| 01 | Legal name | Unicode letters, two or more parts, no digits |
| 02 | Handle | Lowercase, reserved-word blocklist, async availability check |
| 03 | Date of birth | 18 or older, under 100, in the past |
| 04 | Country | Drives 06 and 10 |
| 05 | Email | Strict local/domain shape, disposable-domain blocklist |
| 06 | Phone | E.164, dial code, national length and prefix per country |
| 07 | Password | 12–64, four character classes, no triples, not personal |
| 08 | Repeat password | Exact match, re-checked when 07 changes |
| 09 | Primary role | From a fixed list |
| 10 | Postal code | Per-country pattern |
| 11 | Portfolio link | Optional, but https and publicly reachable when present |
| 12 | Terms | Must be true |

Every rule is written out field by field, with regexes, per-country tables and
accepted/rejected examples, in **[VALIDATION_RULES.txt](VALIDATION_RULES.txt)**.

## Running it

```bash
npm install
npm start                                          # http://localhost:4200
npm run build                                      # dist/onboarding-form
npx ng test --watch=false --browsers=ChromeHeadless
```

Requires Node 20.19+, 22.12+ or 24+.

## Layout

```
src/app/
  data/onboarding-data.ts          countries, roles, blocklists
  validators/form-validators.ts    one validator per field
  validators/form-validators.spec.ts
  services/username-availability.ts  stubbed async handle lookup
  onboarding/field-rules.ts        chip labels, messages, message order
  onboarding/onboarding.{ts,html,scss}
```

`form-validators.ts` is the piece to read first. Each validator returns **every**
failing rule key at once rather than stopping at the first, which is what lets
the interface show each rule's state separately.

## Adapting it

- **Different fields?** Add the validator, add a `FieldSpec` to `FIELDS` in
  `field-rules.ts` with its chip labels and messages, add the control and the
  markup. Then document it and add specs.
- **More countries?** Append to `COUNTRIES` in `onboarding-data.ts` with the dial
  code, national number length, valid prefixes and postal pattern.
- **Real handle lookup?** Replace the body of `isTaken` in
  `username-availability.ts` with an `HttpClient` call.
- **Different look?** Colour, type and radius are tokens in `src/styles.scss`,
  including the dark palette. Component styles never hardcode a colour.

## Notes

Responsive from 390px up, dark mode follows the system setting, motion respects
`prefers-reduced-motion`, and every input has a real label with a visible focus
ring. Nothing is auto-corrected: a trailing space is reported, not silently
trimmed away.

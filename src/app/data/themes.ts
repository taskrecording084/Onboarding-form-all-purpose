/**
 * Six themes. A theme is not just a palette: each one sets its own geometry
 * (radius, shadow, borders), its own type pairing, and its own field treatment.
 * The tokens all live in `src/styles.scss` under `[data-theme='<id>']`.
 */

export type ThemeId = 'blueprint' | 'carbon' | 'linen' | 'neon' | 'terminal' | 'bloom';

export interface Theme {
  id: ThemeId;
  name: string;
  /** One line for the switcher, describing what actually changes. */
  tagline: string;
  /** How inputs are drawn. Named so the difference is discoverable, not just felt. */
  fields: string;
  mode: 'light' | 'dark' | 'auto';
}

export const THEMES: Theme[] = [
  {
    id: 'blueprint',
    name: 'Blueprint',
    tagline: 'Cool paper, cobalt signal, engineered grotesk',
    fields: 'Outlined',
    mode: 'auto',
  },
  {
    id: 'carbon',
    name: 'Carbon',
    tagline: 'Industrial dark, amber signal, hard edges',
    fields: 'Underlined',
    mode: 'dark',
  },
  {
    id: 'linen',
    name: 'Linen',
    tagline: 'Warm paper, plum accent, serif display',
    fields: 'Filled',
    mode: 'light',
  },
  {
    id: 'neon',
    name: 'Neon',
    tagline: 'Violet dark, magenta glow, wide sans',
    fields: 'Inset glow',
    mode: 'dark',
  },
  {
    id: 'terminal',
    name: 'Terminal',
    tagline: 'Phosphor green on black, monospace throughout',
    fields: 'Square',
    mode: 'dark',
  },
  {
    id: 'bloom',
    name: 'Bloom',
    tagline: 'Soft lilac, teal accent, generous curves',
    fields: 'Pill',
    mode: 'light',
  },
];

export const DEFAULT_THEME: ThemeId = 'blueprint';

export const isThemeId = (value: unknown): value is ThemeId =>
  typeof value === 'string' && THEMES.some((t) => t.id === value);

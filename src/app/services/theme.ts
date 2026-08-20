import { DOCUMENT, Injectable, effect, inject, signal } from '@angular/core';
import { DEFAULT_THEME, THEMES, Theme, ThemeId, isThemeId } from '../data/themes';

const STORAGE_KEY = 'onboarding.theme';

/**
 * Owns the active theme. Writes `data-theme` on <html>, which is what every
 * token block in styles.scss keys off, and remembers the choice across reloads.
 */
@Injectable({ providedIn: 'root' })
export class ThemeStore {
  private readonly document = inject(DOCUMENT);

  readonly themes = THEMES;
  readonly current = signal<ThemeId>(this.restore());

  constructor() {
    effect(() => {
      this.document.documentElement.setAttribute('data-theme', this.current());
    });
  }

  select(id: ThemeId): void {
    this.current.set(id);
    try {
      this.document.defaultView?.localStorage.setItem(STORAGE_KEY, id);
    } catch {
      // Private browsing or a blocked store: the theme still applies for this session.
    }
  }

  active(): Theme {
    return THEMES.find((t) => t.id === this.current())!;
  }

  private restore(): ThemeId {
    try {
      const saved = this.document.defaultView?.localStorage.getItem(STORAGE_KEY);
      return isThemeId(saved) ? saved : DEFAULT_THEME;
    } catch {
      return DEFAULT_THEME;
    }
  }
}

import { ApplicationRef } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { DEFAULT_THEME, THEMES, isThemeId } from '../data/themes';
import { ThemeStore } from './theme';

const KEY = 'onboarding.theme';

describe('ThemeStore', () => {
  let originalTheme: string | null;

  beforeEach(() => {
    originalTheme = document.documentElement.getAttribute('data-theme');
    localStorage.removeItem(KEY);
    TestBed.configureTestingModule({});
  });

  afterEach(() => {
    localStorage.removeItem(KEY);
    if (originalTheme === null) {
      document.documentElement.removeAttribute('data-theme');
    } else {
      document.documentElement.setAttribute('data-theme', originalTheme);
    }
  });

  it('starts on the default theme when nothing is stored', () => {
    expect(TestBed.inject(ThemeStore).current()).toBe(DEFAULT_THEME);
  });

  it('restores a previously chosen theme', () => {
    localStorage.setItem(KEY, 'terminal');
    expect(TestBed.inject(ThemeStore).current()).toBe('terminal');
  });

  it('falls back to the default when the stored value is not a theme', () => {
    localStorage.setItem(KEY, 'chartreuse');
    expect(TestBed.inject(ThemeStore).current()).toBe(DEFAULT_THEME);
  });

  it('writes the choice to data-theme on the document element', () => {
    const store = TestBed.inject(ThemeStore);
    store.select('neon');
    TestBed.inject(ApplicationRef).tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('neon');
  });

  it('persists the choice', () => {
    TestBed.inject(ThemeStore).select('linen');
    expect(localStorage.getItem(KEY)).toBe('linen');
  });

  it('exposes the active theme record', () => {
    const store = TestBed.inject(ThemeStore);
    store.select('bloom');
    expect(store.active().name).toBe('Bloom');
    expect(store.active().fields).toBe('Pill');
  });
});

describe('themes catalogue', () => {
  it('offers exactly six themes', () => {
    expect(THEMES.length).toBe(6);
  });

  it('gives every theme a unique id, a field style and a mode', () => {
    const ids = THEMES.map((t) => t.id);
    expect(new Set(ids).size).toBe(THEMES.length);
    for (const t of THEMES) {
      expect(t.fields.length).toBeGreaterThan(0);
      expect(['light', 'dark', 'auto']).toContain(t.mode);
    }
  });

  it('recognises only real theme ids', () => {
    expect(isThemeId('carbon')).toBeTrue();
    expect(isThemeId('mauve')).toBeFalse();
    expect(isThemeId(null)).toBeFalse();
  });
});

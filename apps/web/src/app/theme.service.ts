import { effect, Injectable, signal } from '@angular/core';

export type Theme = 'light' | 'dark';

const STORAGE_KEY = 'wall-theme';

function isTheme(value: unknown): value is Theme {
  return value === 'light' || value === 'dark';
}

/** The wall's one personal-preference toggle (docs/specs/09-dark-mode.md) — never the default,
 * opted into per browser, entirely client-side. `theme` is applied as `data-theme` on `<html>`,
 * which `styles.scss`'s `:root[data-theme='dark']` block and `tv/tv.scss`'s
 * `:host-context([data-theme='dark'])` block both key off. Provided in root and injected
 * directly by `App` (not only by `ThemeToggleComponent`) so the attribute is set on bootstrap
 * even on routes — `/tv` — that render no toggle of their own. */
@Injectable({ providedIn: 'root' })
export class ThemeService {
  /** Mirrors `wall/upvoted-posts.ts`'s try/catch-with-in-memory-fallback shape, but scoped to
   * this instance rather than the module — if `localStorage` throws (private browsing) this
   * falls back to a value held only for as long as this singleton lives, i.e. the app session. */
  private memoryFallback: Theme | undefined;

  readonly theme = signal<Theme>(this.readTheme());

  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
    });
  }

  toggle(): void {
    const next: Theme = this.theme() === 'dark' ? 'light' : 'dark';
    this.theme.set(next);
    this.writeTheme(next);
  }

  /** A stored value that isn't exactly 'light' or 'dark' — corrupted, hand-edited, from a
   * future version — is treated the same as no value at all, never written into the DOM
   * unchecked. */
  private readTheme(): Theme {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      return isTheme(raw) ? raw : 'light';
    } catch {
      return this.memoryFallback ?? 'light';
    }
  }

  private writeTheme(theme: Theme): void {
    try {
      localStorage.setItem(STORAGE_KEY, theme);
    } catch {
      this.memoryFallback = theme;
    }
  }
}

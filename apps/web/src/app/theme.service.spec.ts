import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ThemeService } from './theme.service';

const STORAGE_KEY = 'wall-theme';

/** This project's test environment (Angular's vitest-based runner, see CLAUDE.md) provides no
 * working `localStorage` global — its `setItem`/`getItem`/`clear` are all `undefined`. Every
 * other file in the app that touches `localStorage` (`client-token.ts`, `wall/upvoted-posts.ts`)
 * has never been exercised against it in a spec; this is the first. A minimal in-memory `Storage`
 * stands in for it so `ThemeService`'s real, unmocked `localStorage` calls have something to
 * actually read and write during a test run. */
class MemoryStorage implements Storage {
  private readonly store = new Map<string, string>();

  get length(): number {
    return this.store.size;
  }

  clear(): void {
    this.store.clear();
  }

  getItem(key: string): string | null {
    return this.store.has(key) ? this.store.get(key)! : null;
  }

  key(index: number): string | null {
    return [...this.store.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.store.delete(key);
  }

  setItem(key: string, value: string): void {
    this.store.set(key, value);
  }
}

describe('ThemeService', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', new MemoryStorage());
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  it('defaults to light when nothing is stored', () => {
    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
  });

  it('a fresh instance restores a previously stored dark preference', () => {
    localStorage.setItem(STORAGE_KEY, 'dark');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('dark');
  });

  it('falls back to light for a corrupted or hostile stored value', () => {
    localStorage.setItem(STORAGE_KEY, '<script>alert(1)</script>');

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
  });

  it('toggling flips the theme and persists it to localStorage', () => {
    const service = TestBed.inject(ThemeService);

    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('dark');

    service.toggle();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('light');
  });

  it('applies the resolved theme to <html> as data-theme, including on toggle', () => {
    const service = TestBed.inject(ThemeService);
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('light');

    service.toggle();
    TestBed.tick();
    expect(document.documentElement.getAttribute('data-theme')).toBe('dark');
  });

  it('does not crash and keeps the change in memory when localStorage throws on write', () => {
    const service = TestBed.inject(ThemeService);
    vi.spyOn(localStorage, 'setItem').mockImplementation(() => {
      throw new Error('QuotaExceededError');
    });

    expect(() => service.toggle()).not.toThrow();
    expect(service.theme()).toBe('dark');
  });

  it('falls back to light when localStorage throws on read', () => {
    vi.spyOn(localStorage, 'getItem').mockImplementation(() => {
      throw new Error('SecurityError');
    });

    const service = TestBed.inject(ThemeService);

    expect(service.theme()).toBe('light');
  });
});

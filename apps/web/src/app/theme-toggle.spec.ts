import { TestBed } from '@angular/core/testing';
import { vi } from 'vitest';

import { ThemeToggleComponent } from './theme-toggle';

describe('ThemeToggleComponent', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: () => null,
      setItem: () => {},
      removeItem: () => {},
      clear: () => {},
      key: () => null,
      length: 0,
    } satisfies Storage);
    document.documentElement.removeAttribute('data-theme');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
    document.documentElement.removeAttribute('data-theme');
  });

  it('renders exactly one button with the sun glyph and a Portuguese tooltip in light mode', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons.length).toBe(1);

    const button = buttons[0] as HTMLButtonElement;
    expect(button.textContent?.trim()).toBe('☀️');
    expect(button.getAttribute('aria-label')).toBe('Mudar para modo escuro');
    expect(button.getAttribute('title')).toBe('Mudar para modo escuro');
  });

  it('switches to the moon glyph and the light-mode label after a click', () => {
    const fixture = TestBed.createComponent(ThemeToggleComponent);
    fixture.detectChanges();

    const button = fixture.nativeElement.querySelector('button') as HTMLButtonElement;
    button.click();
    fixture.detectChanges();

    expect(button.textContent?.trim()).toBe('🌙');
    expect(button.getAttribute('aria-label')).toBe('Mudar para modo claro');
  });
});

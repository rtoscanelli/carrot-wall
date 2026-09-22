import { Component } from '@angular/core';
import { ComponentFixture, TestBed } from '@angular/core/testing';
import { provideRouter, Router } from '@angular/router';
import { vi } from 'vitest';

import { App } from './app';

// Stand-ins for the real routed components (WallComponent, TvComponent, ...) — App only cares
// whether the current URL is /tv, not what the outlet actually renders.
@Component({ selector: 'app-dummy', template: '' })
class DummyComponent {}

describe('App', () => {
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

  async function createAt(
    url: string,
  ): Promise<{ fixture: ComponentFixture<App>; router: Router }> {
    TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([
          { path: '', component: DummyComponent },
          { path: 'tv', component: DummyComponent },
        ]),
      ],
    });

    const router = TestBed.inject(Router);
    await router.navigateByUrl(url);

    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();

    return { fixture, router };
  }

  it('shows the shared theme toggle on the wall', async () => {
    const { fixture } = await createAt('/');

    expect(fixture.nativeElement.querySelector('app-theme-toggle')).not.toBeNull();
  });

  it('hides the theme toggle on /tv, which has no pointer and no controls of its own', async () => {
    const { fixture } = await createAt('/tv');

    expect(fixture.nativeElement.querySelector('app-theme-toggle')).toBeNull();
  });

  it('removes the toggle on navigating from the wall to /tv', async () => {
    const { fixture, router } = await createAt('/');
    expect(fixture.nativeElement.querySelector('app-theme-toggle')).not.toBeNull();

    await router.navigateByUrl('/tv');
    fixture.detectChanges();

    expect(fixture.nativeElement.querySelector('app-theme-toggle')).toBeNull();
  });
});

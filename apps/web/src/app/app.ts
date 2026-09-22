import { Component, inject } from '@angular/core';
import { toSignal } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterOutlet } from '@angular/router';
import { filter, map } from 'rxjs';

import { ThemeService } from './theme.service';
import { ThemeToggleComponent } from './theme-toggle';

@Component({
  imports: [RouterOutlet, ThemeToggleComponent],
  selector: 'app-root',
  styleUrl: './app.scss',
  templateUrl: './app.html',
})
export class App {
  private readonly router = inject(Router);

  // Injected directly (not only by ThemeToggleComponent) so the stored preference is applied
  // as `data-theme` on bootstrap even on /tv, which renders no toggle of its own — see
  // ThemeService's doc comment and docs/specs/09-dark-mode.md.
  private readonly themeService = inject(ThemeService);

  /** /tv has no pointer and no interactive affordances of any kind (slice 08's AC9); the shared
   * theme toggle is hidden there rather than exposed and left unused. */
  readonly isTv = toSignal(
    this.router.events.pipe(
      filter((event) => event instanceof NavigationEnd),
      map((event) => event.urlAfterRedirects.startsWith('/tv')),
    ),
    { initialValue: this.router.url.startsWith('/tv') },
  );
}

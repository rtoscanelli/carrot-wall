import { ChangeDetectionStrategy, Component, inject } from '@angular/core';

import { ThemeService } from './theme.service';

/** The wall's one shared dark-mode control (docs/specs/09-dark-mode.md) — one instance, rendered
 * once by `App` above `<router-outlet />`, so `/`, `/post`, `/admin` and `/materials` all get the
 * same button in the same spot. Never rendered on `/tv`, which has no pointer and follows this
 * browser's stored preference silently instead (see `App.isTv`). */
@Component({
  selector: 'app-theme-toggle',
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './theme-toggle.html',
  styleUrl: './theme-toggle.scss',
})
export class ThemeToggleComponent {
  private readonly themeService = inject(ThemeService);

  readonly theme = this.themeService.theme;

  toggle(): void {
    this.themeService.toggle();
  }
}

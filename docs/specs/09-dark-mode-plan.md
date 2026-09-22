# Plan: dark mode

**Spec:** `docs/specs/09-dark-mode.md` · **Intent:** `docs/intents/09-dark-mode.md` · **Status:** draft

## Context

The instructor is the heaviest user of the app — `/admin` through every session, the wall and
projector all week — and wants a dark option for personal use. Nobody else asked for it; it
ships to everyone only because the toggle sits on a wall fifteen people share. This plan turns
`docs/specs/09-dark-mode.md`'s 14 acceptance criteria into an ordered, verifiable sequence of
changes, entirely client-side.

## What's already there, discovered while reading the code

- **`localStorage` has an established pattern to follow, twice over**: `client-token.ts` and
  `wall/upvoted-posts.ts` both use a module-level `STORAGE_KEY` plus a `try/catch` around every
  read/write, falling back to an in-memory value if `localStorage` throws (private browsing).
  This plan's storage code follows that shape rather than inventing a new one.
- **`app.html` is currently just `<router-outlet />`** — there is no shared header to drop a
  toggle into. `wall.ts:35` / `post.ts:46` already `inject(Router)`, which is the pattern used
  here to detect the `/tv` route from the app shell.
- **`/tv` will not inherit a `:root`-level theme change.** `tv.scss:5-11` re-declares all six
  `--wall-*` custom properties on `:host` with slice 08's own light values (deliberately
  slightly different from the global set — coral `#cc785c` vs `#d97757`, surface `#efe9de` vs
  `#f0eee6`). Anything set at `:root` is shadowed inside `/tv`'s subtree. A dark block has to be
  added inside `tv.scss` itself, or `/tv` will stay light regardless of the stored preference
  (spec AC6).
- **`tv.scss:20-21` reads `--tv-bg` and `--tv-ink`, which are defined nowhere in the codebase.**
  `/tv`'s background currently resolves to `transparent` and happens to render correctly by
  accident. This is a pre-existing bug, out of this spec's scope, and **this plan does not touch
  it** — the new dark block is added without going near those two lines, so `/tv`'s existing
  (accidental) light behaviour is left exactly as-is.
- **No Angular Material component is used anywhere** (confirmed by grep across every template) —
  nothing to check there, per the spec's "out of scope."
- **Native form controls exist**: the `textarea` in `/post` and the PIN `input` in `/admin`.
  `styles.scss:41` currently hardcodes `color-scheme: light`; left alone, these controls would
  render light-on-dark regardless of the token swap. This needs to become theme-aware.
- **Icon choice: emoji**, matching the app's existing microcopy style (`wall.html`'s
  ✍️ Nova mensagem, 📚 Materiais) rather than the Material Icons font `index.html:16` loads —
  avoids a render-blocking Google Fonts dependency for something this small, consistent with
  slice 08's choice of a dependency-free QR library for the same flaky-wifi reason.
- **`app.spec.ts` does not exist today**, despite `CLAUDE.md` documenting
  `npx ng test --filter '^App'` as a supported command. This plan creates it.

## Decisions this plan locks in

- **A new `ThemeService` (`apps/web/src/app/theme.service.ts`), not a plain exported-function
  module like `upvoted-posts.ts`.** Unlike upvoted-post ids, the theme is read reactively by two
  independent places (the toggle button, and the effect that writes the DOM attribute), so a
  `providedIn: 'root'` service with a signal is a better fit than free functions.
- **Theme is applied via `data-theme` on `document.documentElement`**, read by
  `:root[data-theme='dark']` in `styles.scss` and `:host-context([data-theme='dark'])` in
  `tv.scss`. Chosen over toggling a body class because the spec's own constraints doc
  (`artifact-design` conventions aside) and Angular Material's own dark-mode docs standardize on
  a `data-theme` attribute — nothing in this app currently uses one, so there's no collision.
- **A stored value is allowlisted against `'light' | 'dark'` before use.** Anything else
  (corrupted storage, a future version's value, hand-edited devtools) falls back to light rather
  than being written into a DOM attribute unchecked.
- **The toggle is one fixed-position component in `app.html`, not per-page.** Matches the spec's
  "one shared control" requirement and touches zero page templates, so `/`, `/post`, `/admin`,
  `/materials` keep their current layout untouched apart from the toggle itself.
- **`isTv` in `app.ts` comes from `toSignal(router.events...)`, initialized from `router.url`**,
  the same reactive-router pattern already used in `wall.ts` / `post.ts`, rather than a route
  data flag — cheapest correct option for a check this small.

## Files to change

| File | Change |
|---|---|
| `apps/web/src/styles.scss` | Add `:root[data-theme='dark']` block (six tokens per spec's mapping table); change `color-scheme: light` to theme-aware. |
| `apps/web/src/app/theme.service.ts` *(new)* | `theme` signal, `toggle()`, allowlisted read/write to `localStorage` (`try/catch` + in-memory fallback, following `upvoted-posts.ts`), `effect()` writing `data-theme`. |
| `apps/web/src/app/theme.service.spec.ts` *(new)* | Default light, toggle + persist, fresh-instance restore, hostile stored value falls back to light, `localStorage` throwing doesn't crash. |
| `apps/web/src/app/theme-toggle.ts/.html/.scss` *(new)* | Standalone component, one `<button>`, emoji glyph per theme (☀️/🌙), Portuguese `aria-label`/`title` tooltip, `:host { position: fixed; top: .75rem; right: .75rem; }`. |
| `apps/web/src/app/theme-toggle.spec.ts` *(new)* | Renders one button, correct glyph per theme, PT label present, click flips theme. |
| `apps/web/src/app/app.ts` | `inject(Router)`, `isTv` signal via `toSignal`. |
| `apps/web/src/app/app.html` | `@if (!isTv()) { <app-theme-toggle /> }` above `<router-outlet />`. |
| `apps/web/src/app/app.spec.ts` *(new)* | Toggle renders on `/`, absent on `/tv`. |
| `apps/web/src/app/tv/tv.scss` | Add a dark block re-declaring the same six tokens (via `:host-context([data-theme='dark'])`), leaving lines 5-11 and 20-21 untouched. |
| `apps/web/e2e/dark-mode.spec.ts` *(new)* | Real-browser checks: token values in both themes, reload persistence, `/tv` following the preference with no control present, computed-color contrast ≥4.5:1. |

## Order of work

1. `styles.scss` — dark token block + `color-scheme`. Verify by hand-setting
   `data-theme="dark"` on `<html>` in devtools before any TypeScript exists.
2. `theme.service.ts` + spec → `npm test`.
3. `theme-toggle` component + spec → `npm test`.
4. `app.ts` / `app.html` wiring + `app.spec.ts` → `npm test`.
5. `tv.scss` dark block → `npm test`.
6. `e2e/dark-mode.spec.ts` → `npm run e2e`.
7. Full check pass: `npx prettier --check .`, `npx ng build`, `./mvnw test`.

## Risks

- **AC3 ("no visual diff" in light mode) vs. AC1 (a new toggle on the same four routes)**: read
  as "unchanged apart from the toggle itself." Flagging this reading rather than treating it as
  silently resolved.
- **360px overlap**: the fixed top-right toggle can sit over `/`'s centered `.wall-prompt` text
  (`wall.scss:9`). `/post` and `/materials` have their back-link top-left, so they're clear.
  Checked and fixed if needed during the manual pass below, not left to guesswork.
- **`--tv-bg`/`--tv-ink` stay undefined**, per instruction — `/tv`'s pre-existing accidental
  `transparent` background is unchanged in both themes. Not fixed by this slice.

## Verification

| Check | Covers |
|---|---|
| `npm test` | AC1, AC2, AC11, AC12, AC14 |
| `npm run e2e` | AC4, AC5, AC6, AC8, AC9 |
| `./mvnw test` | AC13 (proves `apps/api` untouched) |
| `npx ng build` | production bundle still builds |
| `npx prettier --check .` | repo's only lint gate |
| Manual, 360px viewport | toggle on `/` → reload → `/post` → `/admin` → `/materials` → `/tv`, one browser, confirm dark follows and no overlap with existing header content; then clear `localStorage` and confirm full return to light everywhere |

## Known gaps (deferred)

Found by a code-review pass against `docs/specs/09-dark-mode.md`'s acceptance criteria after
implementation. None are blocking — all 14 ACs pass — but none are fixed either; left here so
they aren't lost before a follow-up.

- **AC3 regression, narrow width.** The overlap fix added to `wall.scss` (`.wall-prompt`'s
  `@media (max-width: 400px) { padding-top: 3.25rem; }`, added during the manual pass above)
  shifts the prompt down 28px on `/` and `/admin` at ≤400px **in light mode too**, with no
  preference set. AC3 says light mode has no visual diff; this is layout, not the toggle itself,
  so it doesn't clear even the "unchanged apart from the toggle" reading in Risks above.
- **AC9 under-verified.** `e2e/dark-mode.spec.ts` checks ink/accent contrast against `--wall-bg`
  only. AC9 names both `--wall-bg` and `--wall-surface`. Accent-on-surface is 4.78:1 (passes,
  by hand-calculation) but is the tightest of the four pairings and has no test guarding it.
- **AC8 under-verified.** Only `--wall-bg` and `--wall-surface` are asserted against exact RGB
  values anywhere in the suite. `--wall-ink`, `--wall-muted`, `--wall-hairline`, `--wall-accent`
  are correct by inspection of `styles.scss`/`tv.scss` but never asserted against the spec's
  mapping table.
- **Same overlap risk, unhandled on `/admin`'s pre-login gate.** At 320px the toggle overlaps
  the login heading in `admin.scss`'s `.admin-gate` (clean at 360px/400px, and clean everywhere
  once logged in, since the admin wall reuses `wall.scss`'s fix). Not an AC failure — AC1 only
  requires the same toggle position on all four routes — but it's the same class of risk the
  fix above addressed on one route and not the other.

Informational, not gaps: `App.isTv`'s `initialValue` seed from `router.url` is dead code under
this app's non-blocking initial navigation (`router.url` is always `'/'` at construction time),
so a direct `/tv` load briefly inserts the toggle before `NavigationEnd` removes it — likely
invisible (same microtask chain, before paint) and not caught by `app.spec.ts`, which navigates
before creating the fixture.

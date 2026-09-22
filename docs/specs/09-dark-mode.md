# Spec: dark mode

**Author:** Ricardo Toscanelli · **Date:** 2026-09-22 · **Status:** draft
**From intent:** `docs/intents/09-dark-mode.md` · **Covers:** `feature-ideas.md` #13 · **Depends
on:** slice 01

## Problem

Nobody has reported wanting this. The driver is that the instructor — the heaviest user of the
app by a wide margin, on `/admin` through every session and on the wall and projector all week —
wants a dark option for their own use. It ships to everyone because the toggle sits on a wall
fifteen people share, not because anyone else asked.

## In scope

- One shared toggle component, rendered once at the app-shell level, appearing identically on
  `/`, `/post`, `/admin`, and `/materials`.
- Sun/moon icon toggle with a Portuguese tooltip explaining what it does.
- A single `localStorage` key holding the choice, read on load by every route above.
- Default with no stored key: light — identical to what ships today, on every route, on first
  visit, regardless of the browser's OS-level theme setting.
- Switching is instant on the current tab: no reload required.
- Dark values are drawn from `DESIGN.md`'s existing dark family, mapped onto the app's current
  `--wall-*` tokens:

  | Token | Light (unchanged) | Dark |
  |---|---|---|
  | `--wall-bg` | `#faf9f5` | `#181715` (`surface-dark`) |
  | `--wall-surface` | `#f0eee6` | `#252320` (`surface-dark-elevated`) |
  | `--wall-hairline` | `#e2dfd6` | `#1f1e1b` (`surface-dark-soft`, repurposed — see Constraints) |
  | `--wall-ink` | `#141413` | `#faf9f5` (`on-dark`) |
  | `--wall-muted` | `#6b6a63` | `#a09d96` (`on-dark-soft`) |
  | `--wall-accent` | `#d97757` | `#cc785c` (`primary`, already used this way on `/tv`) |

- `/tv` renders dark when this browser's stored preference says dark, with no toggle and no
  visible control of its own — it silently follows the same `localStorage` key. Setting the
  projector laptop to dark is done once, on that machine, via the toggle on `/` or `/admin`.
- WCAG AA text contrast (4.5:1) for ink-as-text and accent-as-text against the dark background
  and surface tones.

## Out of scope

- Following the operating system's `prefers-color-scheme`. Considered and rejected for first
  visit; not built as a fallback or a third option.
- Anything server-side: no new endpoint, no migration, no change to `/api/wall` or the 5s poll.
- Fixing the flash of the light theme on load for a browser set to dark. Known, accepted, not
  built around.
- Any change to the light theme's values — they stay pixel-for-pixel what ships today.
- Angular Material theming work. Nothing in the app currently renders a Material component
  (confirmed: no `mat-*` usage in any template), so there is nothing to verify there.
- Dark counterparts for `DESIGN.md` tokens the app doesn't currently use (`accent-teal`,
  `accent-amber`, `success`, `warning`, `error`) — only the six `--wall-*` tokens above are in
  scope.
- A contrast requirement for the hairline border itself. It's a decorative elevation cue, not a
  required UI boundary, and today's light-mode hairline-on-surface pairing is already
  sub-AA by design (`DESIGN.md`: "borders feel like one elevation step rather than ink lines") —
  the dark hairline is held to the same bar, not a stricter one.
- Redoing the light-theme screenshots in the Day 1 deck or `setup-docs/` guides linked from
  `/materials`.
- Infinite scroll, narrowing/search, and anything else raised in intent 10 — unrelated to this
  slice.

## Acceptance criteria

1. A toggle (sun/moon icon, Portuguese tooltip) appears in the same position, as the same
   component instance, on `/`, `/post`, `/admin`, and `/materials`.
2. No toggle, and no equivalent control, appears anywhere on `/tv`.
3. On a browser with no stored preference, `/`, `/post`, `/admin`, `/materials`, and `/tv` all
   render in the light theme exactly as they do today — no visual diff.
4. Activating the toggle switches the current tab to the dark token set immediately, with no
   page reload.
5. The choice survives a page reload and a closed-and-reopened tab, until the toggle is used
   again or the site's `localStorage` is cleared.
6. A dark preference set via the toggle on `/`, `/post`, `/admin`, or `/materials` is what `/tv`
   renders on that same browser, without `/tv` ever having offered a control for it.
7. Every light-mode token value (`--wall-bg`, `--wall-surface`, `--wall-ink`, `--wall-muted`,
   `--wall-hairline`, `--wall-accent`) is byte-for-byte what production ships today.
8. In dark mode, the six tokens resolve exactly to the values in the mapping table above.
9. In dark mode, ink-as-text against `--wall-bg`/`--wall-surface`, and accent-as-text against the
   same two backgrounds, each measure at least 4.5:1 contrast.
10. Post messages still render as plain interpolated text in both themes — no `[innerHTML]`
    introduced by this slice.
11. Angular unit test: toggling writes the choice to a single `localStorage` key and a fresh
    component instance restores it from that key on init.
12. Angular unit test: with no key present, the token set resolves to light.
13. `./mvnw test` passes unchanged — no file under `apps/api` is touched by this slice.
14. `npm test` passes including the new tests above.

## Constraints

- No new REST endpoint, no new migration, no change to the poll — this is a browser-only
  feature, per the intent's constraint.
- No accounts, no client-token coupling: the preference is a plain `localStorage` flag, unrelated
  to the `X-Client-Token` rate-limit header.
- Portuguese UI and the app's existing microcopy conventions apply to the toggle's tooltip.
- Angular interpolation only; this slice introduces no `[innerHTML]`.
- Dark values come from `DESIGN.md`'s existing dark family (`DESIGN.md` wins over spec §4 per
  `CLAUDE.md`), with one reuse rather than an invention: `surface-dark-soft` (`#1f1e1b`), defined
  in `DESIGN.md` as a code-block background, is repurposed here as the dark hairline because
  `DESIGN.md` defines no dark border token — it sits between `surface-dark` (page floor) and
  `surface-dark-elevated` (card fill), the same three-step ordering the light hairline already
  has relative to `--wall-bg` and `--wall-surface`, so the border stays visible against the card
  it outlines. No hex outside `DESIGN.md`'s existing palette is introduced.
- `/tv` shows no button, link, hover state, or focus affordance of any kind, in either theme —
  slice 08's AC9 is unchanged by this slice, not amended.
- The theme-flash on load is explicitly accepted, not solved, by this spec — no blocking
  bootstrap script is in scope.

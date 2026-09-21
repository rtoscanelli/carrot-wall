# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

Carrot Wall — a live Q&A/feedback wall for a 5-day Claude Code masterclass. Attendees post
from their phones, the instructor answers/pins/moderates from `/admin`, a projector shows
`/tv`. Portuguese UI. **The spec is the source of truth: `spec.md`** (features F1–F8,
acceptance criteria, design tokens). `feature-ideas.md` is the challenge backlog.
`setup-docs/` holds the course guides that drive the build; `DESIGN.md` (if present at the
root) is the generated design-system export and wins over spec §4 where they differ.

F1–F8 are all implemented (wall, submit, admin passcode gate, instructor answers, pin/hide,
upvotes, prompt-of-the-moment, TV mode) — each one was built as its own slice
(`docs/intents/0N-*.md` → `docs/specs/0N-*.md` → `docs/specs/0N-*-plan.md` → a git branch/
worktree), so git history and `docs/specs/` are the record of *how* it was built, one buildable
piece at a time. Pick up new work the same way: write a spec, then a plan, before code.

## Commands

```bash
cd apps/api && ./mvnw quarkus:dev                          # API, port 8080 (first run downloads a lot)
cd apps/web && npm start                                   # web, port 4200, proxies /api → :8080 (proxy.conf.json)
cd apps/api && ./mvnw test                                 # JUnit
cd apps/api && ./mvnw test -Dtest=ClassName#methodName      # single test
cd apps/web && npm test                                    # unit tests (Angular's vitest-based runner)
cd apps/web && npx ng test --filter '^App'                 # single test/suite (regex on test names)
cd apps/web && npx ng test --include src/app/app.spec.ts   # single file
cd apps/web && npm run e2e                                 # Playwright, apps/web/e2e/
cd apps/web && npx playwright test e2e/submit-post.spec.ts # single e2e spec
cd apps/web && npx prettier --check .                      # no eslint / `npm run lint` in this repo
```

Only env var: `ADMIN_PIN` (defaults to `0000` in dev). Node 20+ required (Node 25 works, warns).

## Shape

- `apps/web` — Angular 22 standalone components + Angular Material, TS 6. Routes: `/` wall,
  `/post` submit, `/tv` projector, `/admin`, `/materials`. Polls the API every 5s; no
  websockets (spec constraint — the room is ~15 clients).
- `apps/api` — Quarkus 3.39 / Java 21. REST resources + Panache entities. H2 **file** DB in
  PostgreSQL mode; **Flyway owns the schema**
  (`quarkus.hibernate-orm.schema-management.strategy=none`), `%test` profile uses in-memory H2
  so `./mvnw test` never collides with a running dev server.
- Production is **one container** (root `Dockerfile`): the Angular build lands in the Quarkus
  jar's `META-INF/resources`, both served on port 8080. `SpaRoutes.java` reroutes `/post`,
  `/tv`, `/admin` and `/materials` to `index.html` so a refresh does not 404 — add any new
  top-level route there too.

## Architecture: the poll/delta loop

There's no push channel. `WallResource` (`GET /api/wall`) is a single endpoint with three
modes selected by which query params are present — no params (page 1: pinned posts + newest
page of unpinned), `before`+`beforeId` (cursor pagination, older unpinned posts), `since`
(everything changed at or after that server timestamp, plus `removedIds` for newly-hidden
posts). One endpoint rather than three, so there's only one place to remember the
hidden-post filter.

The client (`WallService`, `apps/web/src/app/wall/wall.service.ts`) holds posts in a signal
`Map<number, Post>` keyed by id, never an array — `poll()` every 5s upserts/removes entries by
id, and display order (pinned-first, newest-first) is a `computed()` derived fresh from the
map every time. This is why a poll never needs special-case re-sort logic for a pin or an
unhide. `WallComponent` (`/`) and `AdminComponent` (`/admin`) share this same service/component
pair — `AdminComponent` re-provides a second `WallService` instance via the
`WALL_INCLUDE_HIDDEN` injection token so it can see hidden posts without the public singleton
ever requesting them.

**This only works because every mutation bumps `Post.updated_at`.** `since` filters on
`updated_at`, not `created_at`. A pin, an upvote, a hide, an answer — anything that doesn't go
through the entity's own methods (see Conventions below) silently stops showing up to polling
clients, with no error anywhere.

## Architecture: admin auth

`/admin` and admin-only endpoints (`AdminResource`, the moderation bits of `PostsResource`)
require a PIN, checked against `wall.admin-pin` (`ADMIN_PIN` env var). A successful login
(`AdminResource`) creates a session tracked by `AdminSessionStore` and sets a cookie;
`AdminAuthFilter` + the `@AdminOnly` annotation enforce it server-side (401 without a valid
session). `WallResource` itself stays unauthenticated (attendees poll it anonymously) but
reads the same session cookie to decide whether to honor `includeHidden` — trusting the query
param alone would let anyone read hidden posts by appending `?includeHidden=true`.

`PostsResource`'s create endpoint also runs new submissions through `RateLimiter` (in-memory
sliding window keyed on an `X-Client-Token` header the web client generates and persists in
`localStorage` — a friendly-room guard, not real auth; resets on redeploy).

## Conventions

- **Never edit an existing Flyway migration** — add a new versioned file. Migrations live in
  `apps/api/src/main/resources/db/migration/` (currently V1–V6) and are deliberately split into
  a story (V1 posts → V2 answers/moderation → V3 prompts + seed → V4/V5 `updated_at` → V6
  prompt presets), because Day 1's exercise is "explain the migrations"; a hook in
  `.claude/settings.json` blocks edits to existing ones. Keep the SQL portable across H2-PG
  mode and real Postgres: no `JSONB`, no arrays.
- **Never mutate a `Post` via a bulk `update(...)` string** (e.g. Panache's
  `Post.update("upvotes = upvotes + 1 where id = ?1")`). Bulk updates bypass the entity's
  `@PreUpdate`, leaving `updated_at` stale and making the change invisible to every polling
  client (see poll/delta architecture above). Use the entity's mutation methods (`pin()`,
  `hide()`, `upvote()`, `answer(text)`) — load the row, call the method, let the flush happen.
- **Post messages render as text, never HTML.** Angular interpolation only, no `[innerHTML]`
  anywhere — acceptance criterion 12 is an XSS check.
- Hidden posts are a soft delete: excluded from every public response, never deleted from the DB.
- `docs/intents/` holds `spec.md` cut into eight buildable slices, in dependency order — start
  there, not at the spec, when picking up work. New feature specs go in `docs/specs/`, named
  `<NN>-<feature-name>.md` matching the intent's number and slug; a plan for that slice is the
  same name with `-plan` appended. Tests: JUnit beside the resource, Angular unit tests beside
  the component, Playwright e2e in `apps/web/e2e/`. `.claude/commands/` (`spec`, `plan`, `ship`,
  `migration`, `cleanup-worktree`) formalize this loop as slash commands.
- Design tokens (ivory `#FAF9F5`, ink `#141413`, coral `#D97757`, hairline borders, no drop
  shadows, serif headings + Inter) are in spec §4 — follow `DESIGN.md` if it appears at the
  root; it wins on any conflict.

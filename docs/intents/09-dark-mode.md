# Intent: a dark wall

**Author:** Ricardo Toscanelli · **Date:** 2026-09-22 · **Status:** draft
**Covers:** `feature-ideas.md` #13 · **Depends on:** 01

## Problem

Nobody has asked for this. No attendee has complained about the ivory wall on their phone, no
one has mentioned the projector washing out the room, and there is no accessibility report
behind it. That has to be said first, because it is the honest shape of the problem and it
should be weighed against whatever this costs.

What is true is that one person is in this app far more than anyone else: the person who runs
the course. `/admin` during every session, the wall all week, the projector machine at setup,
and the whole thing again in the evening while preparing the next day. Fifteen attendees each
look at an ivory screen in bursts; the instructor looks at it for five days. The preference is
real and it is his, and pretending it belongs to the room would be inventing a user.

So: a personal preference, held all week, by the heaviest user of the app — not a reported pain.

## Proposed outcome

Any one browser can be told, once, that it wants the dark wall, and it stays dark. Closing the
tab does not undo it; coming back on Wednesday does not undo it. Every screen the app has comes
along — the wall, the submit form, `/admin`, `/materials` and the projector — so there is no
seam where tapping through to post drops you back into a white page.

The projector is not a special case, it is just another browser: the laptop driving `/tv` gets
set to dark once while the room is being set up, and stays that way for the week.

Nobody who does not care about this ever has to do anything. First visit, on any device, is the
ivory wall exactly as it is today; dark is something a person goes and chooses.

## Affected users and systems

The instructor is the one who wants it, on `/admin` and on the projector machine. But the control
is on a wall that fifteen people share, so all of them see it and any of them can use it — a
feature asked for by one person and shipped to everyone. Attendees who ignore it are unaffected
by design.

Nothing server-side is in scope. No endpoint, no column, no migration, and no change to the
five-second poll: the preference never leaves the browser it was set in.

In the blast radius is everything that carries colour — the design tokens in spec §4 (or
`DESIGN.md` if it is there), and whatever Angular Material is doing with them, which may or may
not follow a token swap on its own. Also in the blast radius, less obviously: the deck and the
`setup-docs/` guides, which screenshot the light wall, and `/materials`, which links to them.

## Constraints

- **The light theme does not move.** Ivory, ink, coral, hairline borders, no shadows — pixel for
  pixel what ships today. The course material is full of pictures of it; a drifted light theme
  makes the guides wrong.
- **Nothing touches the server.** No endpoint, no column, no migration, no change to the poll.
- **`/tv` stays legible from six metres.** The projector's contrast budget is not a phone's, and
  the banner is still the first thing anyone reads from the back of the room.
- The preference is per browser and survives the tab closing. No accounts — the same rule as the
  rest of the wall.
- Reversible in one tap, and findable without anyone being told it exists.
- Portuguese UI, like everything else on the wall.

## Open questions

- Nobody asked for this. What is the budget? If the honest answer turns out to be "a day of
  fiddling with Material theming", is it still worth building, and who decides that?
- What are the dark colours, exactly? The earlier draft said "darker colours of the current light
  theme", which is not yet an answer. Does coral stay the accent in dark, and does a design
  language built on hairline borders and *no shadows* still separate cards when the background
  goes dark?
- A flash of ivory before dark on each page load was explicitly not called a dealbreaker when
  asked. Is it genuinely tolerable, or untested? It is the difference between a cheap slice and
  an awkward one.
- Following the operating system's setting was considered and rejected for first visit. Is it
  gone entirely, or does it come back later as a third choice someone can pick?
- The preference lives in one browser. The projector laptop may be a different machine next
  month, a guest profile, or one that gets cleared. Does the week's setup checklist quietly gain
  a step, and is that acceptable?
- Does Angular Material come along for free? The dialogs, snackbars, form fields and the pinned
  carousel are not plain HTML, and nobody has checked whether they follow a token swap.
- `/materials` links to a deck and a guide full of light-theme screenshots. Does reading the
  guide in dark mode and seeing light screenshots matter, or is it beneath notice?
- Is there a contrast target — WCAG AA, or "looks fine"? Nobody has stated one, and the answer
  changes what the palette is allowed to be.
- Does `/admin` need its own answer? It is the screen with the longest exposure *and* the only one
  with irreversible-feeling actions (hide, pin). Whether dark changes how confidently someone
  moderates at 9pm is unknown.
- **Carried over as a pre-formed idea, not a decision:** the earlier draft already specified a
  toggle at the top of the page with sun and moon icons and a tooltip. That is a design, and it
  belongs to the spec pass, not here. Recorded so it is not lost — and so it can be argued with.

---

*Supersedes the handwritten `09-dark-mode.md` draft of the same date; its constraints and open
questions are carried above.*

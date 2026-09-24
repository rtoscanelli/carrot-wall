---
name: intent
description: Capture the problem before any solution. Use when a ticket, idea or
  request arrives and nothing has been specified yet.
argument-hint: [the ticket, idea or problem in one or two sentences]
model: opus
effort: xhigh
allowed-tools: Bash(gh issue view *)
---
Someone wants this: $ARGUMENTS

If $ARGUMENTS is an issue number, run `gh issue view $ARGUMENTS --comments`
first. Treat the issue as the originator's own words: quote them, do not
rewrite them. Anything the issue does not say goes under Open questions.
Never comment on the issue or change it.

Interview me, one question at a time, until you can fill these five headings
honestly: Problem · Proposed outcome · Affected users and systems · Constraints ·
Open questions. Ask about who has the problem and how often, what done would
look like to them, and what must not change. Refuse to propose a design or name
files: if I drift into solutions, note the idea under Open questions and steer
back to the problem.

Then write docs/intents/NN-slug.md using the next free number, in the style of
the existing files there. List every open question you could not resolve; an
intent with none is a guess. No code.

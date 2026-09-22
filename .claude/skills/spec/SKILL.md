---
name: spec
description: Turn an intent into a one-page spec with checkable acceptance criteria.
  Use after /intent, before any plan or code.
argument-hint: [path to the intent, or the feature in one sentence]
model: opus
effort: xhigh
---
Read $ARGUMENTS. Before writing any code, interview me one question at a time
about anything unclear: scope, edge cases, what done means, and which security
requirements apply: name them; do not leave security to be inferred.

When you have enough, write docs/specs/NN-slug.md (same number and slug as the
intent) with exactly: Problem · In scope / Out of scope · Acceptance criteria I
can check, each one a statement that is true or false · Constraints. One page.
No code.

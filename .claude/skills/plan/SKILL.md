---
name: plan
description: Turn an approved spec into a reviewable implementation plan.
  Use after /spec and before any code is written.
argument-hint: [path to the spec]
model: opus
effort: xhigh
---
Read $ARGUMENTS. Propose an implementation plan with: the files you will change
and why each one; the order of work; risks and open questions; and how we will
verify it works: which tests, which manual check. Do not write code.

Stop and wait for my review. When I approve, write the plan to
docs/specs/NN-slug-plan.md and stop again.

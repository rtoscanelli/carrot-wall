---
name: execute
description: Implement an approved plan with verification after every change.
  Use only after a plan has been reviewed and approved.
argument-hint: [path to the approved plan]
model: sonnet
effort: high
---
Implement the plan in $ARGUMENTS, in the order it gives. After each meaningful
change run the checks that apply: ./mvnw test for the API, npm test for the web
app, and the build. For a bug, write the failing test first and make it pass.

If a test fails, fix the code, not the test: never weaken or delete an
assertion to get to green; if a test is wrong, stop and tell me why. When every
check passes, show me the evidence: the commands you ran and what they
returned, not a summary. Then stop; do not commit or push.

---
name: execute
description: Implement an approved plan with verification after every change.
  Use only after a plan has been reviewed and approved.
argument-hint: [path to the approved plan]
model: sonnet
effort: high
allowed-tools: Bash(playwright-cli *)
---
Implement the plan in $ARGUMENTS, in the order it gives. After each meaningful
change run the checks that apply: ./mvnw test for the API, npm test for the web
app, and the build. For a bug, write the failing test first and make it pass.

If a test fails, fix the code, not the test: never weaken or delete an
assertion to get to green; if a test is wrong, stop and tell me why. When every
check passes, show me the evidence: the commands you ran and what they
returned, not a summary. Then stop; do not commit or push.

When the plan touches the web app: with the app running on
http://localhost:4200, use playwright-cli to open it, click through the
feature the way a user would, and take a screenshot. Then run the existing
end-to-end suite with `npm run e2e` in apps/web. Put what you saw, and what
the suite printed, in your evidence.

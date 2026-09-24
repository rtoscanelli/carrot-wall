#!/usr/bin/env bash
# PreToolUse on Bash: Claude may open a PR, never merge one.
cmd=$(python3 -c 'import json,sys; print(json.load(sys.stdin).get("tool_input",{}).get("command",""))')
case "$cmd" in
  *"gh pr merge"*)
    echo "Merging is a human decision. Open the PR, show me the link, and stop." >&2
    exit 2 ;;
esac
exit 0

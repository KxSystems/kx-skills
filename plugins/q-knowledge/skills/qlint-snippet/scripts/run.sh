#!/usr/bin/env bash
# run.sh — run KX qlint on a single q code snippet.
# Bundled with the `q-knowledge` plugin under
#   plugins/q-knowledge/skills/qlint-snippet/scripts/run.sh
#
# Usage:
#   <plugin-dir>/skills/qlint-snippet/scripts/run.sh <<'EOF'      (preferred for multi-line)
#   <q code lines>
#   EOF
#   <plugin-dir>/skills/qlint-snippet/scripts/run.sh '<q code>'   (single-line arg)
#
# Gotcha: in bash single quotes, '\n' is the two literal chars '\' + 'n',
# NOT a newline — q will then error with CANNOT_PARSE on the bare '\'.
# For multi-line via arg: use a real newline inside '...' OR $'...\n...'
# (ANSI-C quoting). Heredoc avoids the issue entirely.
#
# Env:
#   QLINT_DIR  directory containing qlint.q_  (required — no default)
#   Q          q binary                       (default: `q` on PATH)
#
# Output: the raw .qlint.lintItem table (errors + warnings + notes) to stdout.
# Exit codes:
#   0  no rows with errorClass=`error
#   1  at least one error-level row
#   2  environment misconfig (QLINT_DIR unset, qlint.q_ missing, or q missing)
#
# The wrapper shows every finding raw — no policy filtering. Callers that want
# to suppress specific rules should filter the output themselves.

set -uo pipefail

Q="${Q:-q}"

if [ -z "${QLINT_DIR:-}" ]; then
  echo "qlint_snippet: QLINT_DIR is not set" >&2
  echo "  Export QLINT_DIR pointing at the directory containing qlint.q_" >&2
  exit 2
fi

if [ ! -f "$QLINT_DIR/qlint.q_" ]; then
  echo "qlint_snippet: qlint.q_ not found at $QLINT_DIR/qlint.q_" >&2
  echo "  Set QLINT_DIR to the directory containing qlint.q_" >&2
  exit 2
fi

if [ ! -x "$Q" ] && ! command -v "$Q" >/dev/null 2>&1; then
  echo "qlint_snippet: q binary not found (\$Q='$Q')" >&2
  exit 2
fi

TMP=$(mktemp)
trap 'rm -f "$TMP"' EXIT

if [ "$#" -gt 0 ]; then
  printf '%s' "$1" > "$TMP"
else
  cat > "$TMP"
fi

# Load the snippet from a temp file inside q (via `read0`) so the user's code
# is never embedded in the heredoc — avoids escaping pain. Only the temp file
# path is interpolated; `\`` and `\$` escape q's backtick and `$` literally.
(
  cd "$QLINT_DIR"
  "$Q" -q <<EOF
\l qlint.q_
\c 100 2000
result:.qlint.lintItem["\n" sv read0 \`:$TMP; ::]
show result
if[count select from result where errorClass=\`error; exit 1];
exit 0
EOF
)

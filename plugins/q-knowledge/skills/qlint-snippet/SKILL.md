---
name: qlint-snippet
description: Lint a single q/qSQL code snippet using KX qlint. Reads code from stdin or argument and prints the raw lint table. Use when the user says "qlint this snippet", "lint this q code", "check syntax of <code>", "qlint snippet", or wants quick lint feedback on a piece of q code.
---

# qlint-snippet

Run KX qlint on a single q/qSQL code snippet via the `scripts/run.sh` script bundled with this skill (sibling `scripts/` directory next to this SKILL.md). Useful for:

- ad-hoc syntax checks on a code block pasted into the chat
- Claude auto-validating q code it just generated before presenting it to the user

## Prerequisites

`QLINT_DIR` must point to the directory containing KX's `qlint.q_` — there is no default; the wrapper exits with code 2 and a clear stderr message if it is unset or the file is missing. `q` is expected on `PATH`; override with the `Q` env var if not. If you don't have KX Developer installed, see this plugin's [README](../../README.md) for the recommended setup.

**If `QLINT_DIR` is unset or `qlint.q_` is missing (exit 2), ASK THE USER for the correct path.** Do **not** run `find /` or other filesystem-wide searches to locate it unless the user explicitly requests — they are slow and the user already knows where it lives. A narrow check in obvious places (e.g. `~/.kx`, the plugin's own directory) is fine as a one-shot, but anything broader should be a question.

## Gather parameters

| Parameter | Default | Description |
|-----------|---------|-------------|
| `CODE` | required | The q snippet to lint. Take it from the user's message (fenced block, inline quote, or explicit `myCode` variable). Strip any markdown fences before passing. |

## Execute

Invoke the `scripts/run.sh` script bundled with this skill (under the `scripts/` directory sibling to this SKILL.md). Pass the snippet via argument **or** stdin. **Stdin (heredoc) is strongly preferred for multi-line code** — see the gotcha below.

```bash
# Stdin form (preferred for multi-line — quoted heredoc disables all expansion)
scripts/run.sh <<'EOF'
<the snippet here, possibly multi-line>
EOF

# Argument form (one-liner, single-line code)
scripts/run.sh '<the snippet>'
```

Use the absolute path to `scripts/run.sh` (resolved from the skill's own directory) so it works regardless of the caller's current working directory.

### Multi-line via argument — pick one of these three

**❌ Do NOT write `'… \n …'`.** In bash single quotes, `\n` is literally two characters (`\` + `n`), NOT a newline. The wrapper will pass `\n` to q, q's parser sees a bare `\` (its system-command prefix), and you get `CANNOT_PARSE error: "\\"`.

If you must use the argument form on multi-line code, choose **one** of:

| Form | Example | Note |
|------|---------|------|
| Real newline inside `'…'` | `'getTrades:{…};` (Enter) `getTrades[…]'` | Single quotes preserve literal newlines fine |
| ANSI-C quoting `$'…'` | `$'getTrades:{…};\n getTrades[…]'` | `$` goes **before** the opening quote; `\n` is then interpreted |
| Heredoc | see Stdin form above | Cleanest — no escaping at all |

Default to heredoc unless the snippet is genuinely one line.

## Output

The wrapper prints the full `.qlint.lintItem` table (one row per finding) to stdout. Each row has:

| Field | Meaning |
|-------|---------|
| `label` | Rule name, e.g. `DECLARED_AFTER_USE`, `UNDECLARED_VAR`, `UNUSED_VAR` |
| `errorClass` | ``` `error ```, ``` `warning ```, or ``` `note ``` |
| `description` | One-line human description of the rule |
| `problemText` | The token / variable / expression that triggered it |
| `errorMessage` / `startLine` / `startCol` / `endLine` / `endCol` | Position info |

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | No `errorClass=`error` rows. Snippet is acceptable. Warnings may still be present. |
| `1` | At least one error-level row. Snippet has a real qlint failure. |
| `2` | Environment misconfig (missing `qlint.q_` or missing `q` binary). **Ask the user for the path; don't filesystem-search unless they explicitly request.** |

After running, report to the user: (a) any error-level rows verbatim, (b) a one-line summary of warnings, (c) the exit code.

## Notes

- The wrapper shows every finding raw — no policy filtering. If you want to suppress specific rules (e.g. `UNINDENTED_CODE`, or `DECLARED_AFTER_USE` against known schema names), filter the output yourself.
- The wrapper writes the snippet to a temp file and loads it inside q via ``"\n" sv read0 `:<tmpfile>``, so the user's code never has to be bash-escaped. Only the temp file path is interpolated.
- `q` is found via the `Q` env var (default: `q` on PATH). The wrapper does **not** set `QHOME`/`QLIC` — if your environment needs them set, do so before invoking.

# q-knowledge

Claude Code plugin for kdb+/q development. Two skills:

- **`q`** — kdb+/q language support: idiomatic q, qsql, IPC, common errors, Python-to-q translation. Pure knowledge, auto-triggered when Claude detects q-related work. No external dependencies.
- **`qlint-snippet`** — wrapper around [KX qlint](https://code.kx.com/insights/1.13/qlint/). Lint a single q/kdb+ snippet. Slash command `/qlint-snippet` plus auto-trigger on phrases like "lint this q code". **Requires `QLINT_DIR` env var and `q` on PATH — see Prerequisites below.**

## Install

From inside Claude Code, with the `kx-skills` marketplace already added:

```
/plugin install q-knowledge@kx-skills
```

If you haven't added the marketplace yet:

```
/plugin marketplace add KxSystems/kx-skills
/plugin install q-knowledge@kx-skills
```

After install, the `q` skill works immediately. `/qlint-snippet` also appears in the slash-command list, but only runs successfully once the prerequisites below are satisfied.

## Prerequisites (for `qlint-snippet` only)

The `q` skill needs nothing. The `qlint-snippet` wrapper, however, shells out to KX qlint and needs:

| Requirement | How to satisfy |
|-------------|----------------|
| `q` (kdb+) on `PATH` | Install kdb+; or set the `Q` env var to an absolute path. |
| `QLINT_DIR` env var | Point at the directory that contains KX's `qlint.q_`. Required — there is no default. Without it the wrapper exits 2. |

### Recommended setup

If you don't already have **KX Developer** installed, follow <https://code.kx.com/developer/getting-started/> and install it under `~/developer/`. After installing, verify that `~/developer/ws/qlint.q_` exists, then set:

```bash
export QLINT_DIR="$HOME/developer/ws"
```

Add the line to your `~/.bashrc` so the wrapper picks it up in every shell.

## Usage

### As a Claude Code skill

Both skills are described in their own `SKILL.md`:

- [`skills/q/SKILL.md`](./skills/q/SKILL.md) — the q knowledge skill (auto-triggers on q work).
- [`skills/qlint-snippet/SKILL.md`](./skills/qlint-snippet/SKILL.md) — the qlint wrapper (`/qlint-snippet` slash command, also auto-triggers on lint-related phrasing).

Just write or paste q code in Claude Code and Claude will pick the right skill. To explicitly lint a snippet, type `/qlint-snippet` and provide the code.

### Direct shell invocation of the qlint wrapper

The wrapper script lands under your installed plugins cache. To find it:

```bash
RUN_SH=$(find ~/.claude/plugins -path '*q-knowledge/skills/qlint-snippet/scripts/run.sh' | head -1)

# Preferred for multi-line (quoted heredoc — no shell expansion)
"$RUN_SH" <<'EOF'
getTrades:{[sym;d] select from trades where sym=sym, date=d};
getTrades[`AAPL; .z.d]
EOF

# Single-line argument form
"$RUN_SH" 'select sum size by sym from trades'
```

**Do not** write `'... \n ...'` as a multi-line argument — bash single quotes treat `\n` as two literal characters and q's parser will error on the bare `\`. Use a heredoc, a real newline inside `'...'`, or `$'...\n...'` (ANSI-C quoting).

## Output (qlint wrapper)

The wrapper prints the raw `.qlint.lintItem` table to stdout (one row per finding) with columns: `label`, `errorClass`, `description`, `problemText`, `errorMessage`, `startLine`, `startCol`, `endLine`, `endCol`.

Exit codes:

| Code | Meaning |
|------|---------|
| `0` | No `errorClass=`error` rows. Warnings/notes may still be present. |
| `1` | At least one error-level row. |
| `2` | Environment misconfig (missing `qlint.q_` or `q` binary). |

## Optional: pre-approving the wrapper in your settings

Plugins cannot ship a Claude Code permissions allowlist — that is by design (a plugin shouldn't be able to self-authorise). By default you'll be prompted the first time Claude tries to run the wrapper. If you'd like to skip that prompt, add the following to your own `~/.claude/settings.json` (the path glob covers wherever the plugin actually lives in the cache):

```json
{
  "permissions": {
    "allow": [
      "Skill(qlint-snippet)",
      "Bash(*/q-knowledge/skills/qlint-snippet/scripts/run.sh)"
    ]
  }
}
```

## Notes

- The qlint wrapper runs KX qlint only and shows every finding raw — no policy filtering. If you want to suppress specific rules, filter the output yourself.
- The `q` skill loads no external resources; it works entirely from the SKILL.md and its sibling reference files.

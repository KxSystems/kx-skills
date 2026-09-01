# tools/

`generate_overlays.py` produces Claude Code's plugin manifest from each
plugin's canonical agent-plugins.org source, so there's one hand-edited file
per plugin instead of drift-prone duplicates. **OpenAI Codex needs no
generated overlay** — it reads the canonical `plugin.json`/`mcp.json` at the
plugin root directly.

## Canonical vs. generated

For each migrated plugin (`plugins/<name>/`):

| File | Status | Notes |
|------|--------|-------|
| `plugin.json` | **canonical** — hand-edited | [agent-plugins.org v1.0.0](https://agent-plugins.org/specification) shape; read directly by Codex |
| `mcp.json` | **canonical** — hand-edited | Only if the plugin has MCP servers; required for Codex's MCP servers to register at all |
| `skills/` | source content | Unaffected by this tooling; read directly by both clients |
| `.claude-plugin/plugin.json` | **generated** — do not hand-edit | Claude Code's manifest shape |
| `.mcp.json` | **generated** — do not hand-edit | Only emitted if `mcp.json` exists; Claude Code's shape only — Codex does not read this file |

A plugin is "migrated" once it has a canonical `plugins/<name>/plugin.json`.
Unmigrated plugins are skipped, not errored on, so rollout can proceed one
plugin at a time.

**To change a manifest field or MCP server config:** edit the canonical
`plugin.json`/`mcp.json`, then regenerate (below). Never hand-edit anything
under `.claude-plugin/`, or the root-level `.mcp.json` — the next
regeneration silently overwrites hand-edits, and there is no CI to catch
drift before that happens (see Known gaps).

The two clients need different MCP transport spellings, which is why the
canonical `mcp.json` cannot simply be symlinked: Codex expects
`type: "streamable-http"`, Claude Code expects `type: "http"`. The generator
handles that mapping. Without a canonical `mcp.json`, a plugin's MCP server
silently never registers in Codex — no error, just a missing server.

## Usage

```
python3 generate_overlays.py                # regenerate all migrated plugins
python3 generate_overlays.py --only q-knowledge
python3 generate_overlays.py --check        # report drift, exit 1 if any, write nothing
```

Run `--check` before opening any PR that touches a plugin's canonical
`plugin.json`/`mcp.json`, and commit the resulting overlay diffs alongside
the canonical edit in the same PR.

Zero third-party dependencies (stdlib only), matching the rest of this
repo's scripts (`plugins/kdbai-knowledge/skills/sizing/scripts/estimate.py`,
`plugins/onetick-knowledge/skills/onetick-cloud/scripts/onetick_exec.py`).

## `marketplace.json` is not generated

`.claude-plugin/marketplace.json` is hand-maintained and outside this
script's scope — it is read by both Claude Code and Codex.

Its plugin entries carry a `policy` block that is a **Codex** field:

```json
"policy": {
  "installation": "AVAILABLE",
  "authentication": "ON_INSTALL"
}
```

- `policy.installation` — `NOT_AVAILABLE` | `AVAILABLE` | `INSTALLED_BY_DEFAULT`
- `policy.authentication` — `ON_INSTALL` | `ON_USE`

Codex genuinely enforces these: `installation: "NOT_AVAILABLE"` makes
`codex plugin add` fail with an install-blocked error. **Claude Code ignores
the field at load time** — `claude plugin validate` reports it explicitly
("Unknown field 'policy'. Claude Code ignores it at load time.") and
validation passes with that warning. Seeing one such warning per plugin is
expected, not a problem to fix.

## Known gaps

- **No CI runs `--check`.** It is the same code path a CI job would call;
  wiring it up is pending. Manual pre-PR habit for now.
- **Skill activation parity across clients is untested.** Marketplace
  registration, install, and MCP wiring are confirmed working in both Claude
  Code and Codex. Whether a skill actually *activates* on the same prompts in
  Codex as it does in Claude Code has not been measured.

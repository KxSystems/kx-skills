# OneTick plugin

Query OneTick market and reference data from Claude Code.

This plugin bundles two components:

- **OneTick MCP server (`OneTick-Cloud`)** — registered automatically on install. Claude uses it to find its way around OneTick: listing databases, looking up schemas, checking field semantics, searching docs/API reference/usage examples, and looking up financial instruments (by name, ISIN, MIC, etc.).
- **Query execution helper** — runs the SQL Claude composes against OneTick Cloud and hands back the results. Large results are written to a file rather than printed in full, so even a big query stays light on tokens.

The skill ties the two together — it tells Claude when to look things up via the MCP server, how to compose correct SQL, and when to run it with the helper. It also covers a handful of non-obvious OneTick quirks (e.g. time filters need an explicit timezone; bar and daily data live in separate databases from the underlying tick data) that the MCP server doesn't surface on its own.



## Prerequisites

1. **A [OneTick Cloud](https://www.onetick.com/cloud-services) account** — sign up or sign in at <https://authdash.cloud.onetick.com>.
2. **[`uv`](https://docs.astral.sh/uv/getting-started/installation/) installed and on your `PATH`.** The execution helper declares its dependencies inline and runs via `uv run`.
3. **No existing `OneTick-Cloud` MCP registration.** This plugin registers its own MCP server called `OneTick-Cloud`. If you have already added the Onetick Cloud MCP manually (e.g. via `claude mcp add`), remove it first — two registrations with the same name can conflict, so Claude may end up using the wrong one:

   ```bash
   claude mcp list                       # look for anything pointing at mcp.cloud.onetick.com
   claude mcp remove <name>              # remove it, using whatever name it's registered under
   claude mcp list                       # confirm it's gone
   ```


## Install

We need to register the plugin, and ensure we have the OTP credentials in our environment.

1. **Install the plugin in Claude Code** from this marketplace:

   ```
   /plugin marketplace add KxSystems/kx-skills
   /plugin install onetick-knowledge@kx-skills
   /reload-plugins
   ```

   The `OneTick-Cloud` MCP server is registered automatically from the bundled `.mcp.json`, namespaced as `plugin:onetick-knowledge:OneTick-Cloud`. The first time Claude calls a OneTick MCP tool you'll be prompted to authenticate — see [Authentication](#authentication) below for how that works and what to do if you're not prompted.

   `/reload-plugins` activates the pending install without a full session restart. If it doesn't pick up the new MCP server, restart the session instead (exit and run `claude` again, or reload the window).

2. **Get your OneTick credentials and export them.** The execution helper uses a separate credential set from the MCP browser-OAuth flow. Generate your own `client_id` / `client_secret` at https://authdash.cloud.onetick.com/web_dashboard/?dash=sub_profile (log in with your OneTick SSO), then export them — add to `~/.zshrc` / `~/.bashrc` to persist:

   ```bash
   export OTP_CLIENT_ID="your-client-id-here"
   export OTP_CLIENT_SECRET="your-client-secret-here"
   ```

   **Windows (native)** — set them persistently for your user (PowerShell):

   ```powershell
   [Environment]::SetEnvironmentVariable("OTP_CLIENT_ID",     "your-client-id-here",     "User")
   [Environment]::SetEnvironmentVariable("OTP_CLIENT_SECRET", "your-client-secret-here", "User")
   ```

   Open a new terminal afterwards — persistent variables only apply to newly started processes. These are the same variables the `onetick-py` wheel reads natively; there is **no credentials file**. If unset, the helper fails cleanly with `{"error": "Missing OneTick credentials: ..."}`.

## Authentication

The MCP server and the execution helper use two separate credentials:

- **MCP server** — OAuth. You should be prompted the first time Claude calls a OneTick MCP tool; if not, run `/mcp` and authenticate `OneTick-Cloud` from there. The session expires periodically — when it does, re-authenticate the same way. Check status any time with `/mcp` or `claude mcp list`.
- **Execution helper** — the `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET` env vars from step 2 of Install. No browser flow, no expiry — just the exported credentials.

## Smoke test

The execution helper and the MCP server use separate credentials, so test them separately to confirm everything is setup correctly.

**1. Execution helper.** In Claude Code, with the plugin installed:

> Use the onetick-cloud skill. Run the canonical LSE_SAMPLE_BARS VOD 1-minute bars query for 2024-01-03 (`limit 5` in the SQL) via the execution helper, and show me the row count, the Feather path, and the first row.

Expected: `rows: 5`, a Feather `path`, and a typed `preview` of 1-minute bar data. (Drop the `limit 5` and you'd get the full ~520-row day written to the Feather file, with the same small preview inline.)

If you see `Missing OneTick credentials`, step 2 of Install didn't complete — confirm `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET` are exported in the shell Claude Code runs from (`echo $OTP_CLIENT_ID`).

**2. MCP server.** Ask something that forces a single, narrow discovery call:

> Look up the LSE_SAMPLE_BARS database in OneTick-Cloud and tell me its time zone and exchange.

Expected: `Europe/London`, exchange `London Stock Exchange - UK Market Sample`. If you're prompted to authenticate, see [Authentication](#authentication). If both checks come back clean, the plugin is working correctly.


## Troubleshooting

| Symptom | Likely cause | Fix |
|---|---|---|
| `{"error": "Missing OneTick credentials: ..."}` | `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET` aren't set in the shell Claude Code runs from. | Export both (step 2 of Install); confirm with `echo $OTP_CLIENT_ID` in that same shell. |
| Helper errors with an authentication / token failure from `onetick-py` | The `client_id`/`client_secret` pair was revoked, mistyped, or never activated. | Regenerate the pair from the sub-profile portal and re-export the env vars. |
| Claude says the OneTick MCP server "isn't registered" in this session | The plugin was installed inside an already-running Claude Code session and the install hasn't been activated yet. | Run `/reload-plugins`; if that doesn't pick it up, restart Claude Code (exit and run `claude` again, or reload the window). |
| MCP tools are not visible (`plugin:onetick-knowledge:OneTick-Cloud` absent from `/mcp` or `claude mcp list`) | Claude Code couldn't reach `mcp.cloud.onetick.com`, or the plugin install got interrupted. | Confirm outbound HTTPS works, then reinstall the plugin. |
| Duplicate OneTick tools, or Claude uses the wrong OneTick MCP server | A `OneTick-Cloud` server was registered manually (e.g. via `claude mcp add`) in addition to the plugin's own. | Run `claude mcp list`, remove the manually-added one (see Prerequisites), and restart Claude Code. |
| `ModuleNotFoundError: No module named 'onetick'` (or `pandas` / `pyarrow`) | `uv` isn't installed, or isn't on the `PATH` in the shell Claude Code runs from. | Install `uv` (see Prerequisites); verify with `which uv` in that same shell. |


## Reporting issues

Issues, feedback, and feature requests: open an issue on [`KxSystems/kx-skills`](https://github.com/KxSystems/kx-skills/issues).

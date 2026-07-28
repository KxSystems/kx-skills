---
name: onetick-cloud
description: Compose and execute OneTick SQL against KX OneTick Cloud. Use when the user asks to query OneTick, retrieve tick / bar / daily / order-book / reference data, run a SQL statement against a OneTick database (e.g. LSE_SAMPLE, US_COMP_SAMPLE, LSE_SAMPLE_BARS, US_COMP_SAMPLE_DAILY, OTQ_CHAIN), pull market data from OneTick Cloud, convert a natural-language data request into a OneTick SQL query plus its result set, explain how the OneTick execution helper / auth / onetick-py WebAPI wheel works, describe how the helper handles large results, previews, or errors, or show an `onetick-py` / `otp.DataSource` Python idiom for OneTick data access.
---

# OneTick

Compose OneTick SQL via the OneTick MCP server, then execute it via the bundled `onetick-py` WebAPI helper. This skill is **only** the residue the MCP server does not cover — auth, execution mechanics, workflow orchestration, and a handful of gotchas. Everything OneTick-specific (database catalogue, schemas, field semantics, SQL function reference) is delegated to MCP tools at runtime.

---

## Architecture — read this first

There are **two** OneTick surfaces and they do different jobs. Never mix them up.

- **OneTick MCP server (`OneTick-Cloud`)** — discovery and composition only. Use it to find databases, list tick-type variants, look up schemas, read field semantics, and search the SQL function reference. **Bulk data does not flow through MCP.**
- **OneTick execution (REST fast path + onetick-py wheel fallback)** — execution only. The bundled helper (`scripts/onetick_exec.py`) runs finished SQL over Arrow, writes the **full** result to a Feather file, and returns a bounded preview + row-count envelope (never the whole result). By default it executes via a lightweight REST call to OneTick Cloud (sub-second per-query startup) and falls back to the onetick-py WebAPI wheel only when REST is genuinely unavailable. See **Execution** below. **Bulk data never floods the chat loop — only the preview does.**

If the MCP server is not registered in the current session, the skill cannot do discovery — stop and tell the user to register it (`claude mcp add --transport http OneTick-Cloud https://mcp.cloud.onetick.com/mcp`).

---

## Workflow

Follow this order. Do not skip ahead — wrong-database, wrong-tick-type, and skipped-field-semantics are the three most common failure modes, and steps 1–4 prevent all of them.

1. **Database discovery** — call `list_databases` with structured filters (`country`, `equities` / `futures` / `options` / `fx` / `indices`, `bars`, `book_depth`, `real_time`, `time_zone`, `mic`). Prefer filters over keyword search.
2. **Tick-type discovery** — call `db_tables(tick_type=…)` with the base tick type (e.g. `TRD`, `QTE`, `NBBO`). Returns prefix-matching variants with descriptions, so the agent picks `TRD` vs `TRD_1M` vs `TRD_1D` vs `TRD_ODD_LOT` on evidence, not memory.
3. **Schema lookup** — call `db_table_schemas(db_name, tick_type)` for authoritative field names and types.
4. **Field semantics — mandatory.** For any field you are about to filter on, aggregate, or project that you have not already seen described in this session, call `db_field_descriptions(tick_type, field=<FIELD_NAME>)` first. This catches the `ACC_VOLUME` vs `VOLUME` confusion on `TRD`, the `COND` code-set overlap between `TRD` and `NBBO`, the per-tick-type field-name aliasing on `QTE`/`NBBO`, and similar traps *before* they become silently-wrong SQL. Do not skip this step on the assumption that the field name is self-explanatory — the eval shows that assumption is wrong roughly two-thirds of the time the step is skipped.
5. **SQL function reference** — call `search_sql-docs(query=…)` for any built-in function the agent is about to use (`CORP_ACTIONS`, `MKT_ACTIVITY`, `TICK_SHIFT`, `OB_SNAPSHOT`, `REF_DATA`, `TW_AVG`, window functions, etc.). Always delegate — never hardcode a signature from memory.
6. **Compose SQL.** Mandatory guardrails:
   - Time literals must carry an explicit timezone (`'2024-01-03 12:00:00 UTC'`, `'2024-01-03 09:00:00 America/New_York'`). Bare timestamps fail or silently default to a venue-inappropriate zone.
   - `TIMESTAMP` does **not** support `BETWEEN`. Always express ranges as `TIMESTAMP >= '<lo>' AND TIMESTAMP < '<hi>'`. OneTick rejects `BETWEEN` on `TIMESTAMP` with `ERR_07516820CWNEE`. Applies to *every* tick type (`TRD`, `QTE`, `*_1M`, `*_DAILY`, `DAY`, …).
   - Use `lower-case limit` to match canonical examples (upper-case also accepted).
7. **Execute** via the execution helper (`scripts/onetick_exec.py`). The helper handles auth, the WebAPI transport, the Arrow→Feather write (full result), and the JSON envelope (preview + row count). **If the helper prints an error envelope (non-zero exit) or `rows: 0` on a question that expected rows, apply the retry contract below — do not loop indefinitely.**

**Answer from retrieved facts, not memory.** State or deny a field name, type, code, value, or schema detail *only* from MCP output you actually retrieved this session (`db_table_schemas`, `db_field_descriptions`, `db_field_enumerations`, `search_sql-docs`) — never from recall. If you have not confirmed it with a discovery tool, do not assert it: look it up, or say you have not checked. Do not invent fields that aren't in the schema you pulled, and do not deny a field the schema shows. This is the guard against confidently-wrong field claims — the most common silent error.

### SQL vs Python routing (decision 3) — bidirectional capability fallback

Two surfaces, and each can do things the other can't. Pick the entry surface by what the user asked, then cross over **only if that surface genuinely cannot do it** — not on a fixable error.

**Tier 1 — Default to SQL.** When the request is ambiguous and the user has *not* asked for Python, use the SQL workflow above.

**Tier 2 — Python is first-class when asked.** When the user explicitly asks for an `onetick-py` / `otp` snippet (`otp.DataSource`, "the otp way to…", "what's the Python API for…"), answer from the Python surface: `search_python-docs` (+ `search_python-examples` for pattern code), return the snippet directly. Python does things SQL can't (DataFrame-native composition, `otp` graph ops, `otp.merge`, `otp.Symbols`, callbacks), so a **Python-native** answer is the goal — not a thin wrapper over SQL. If no canned example matches, **compose** the answer from `otp` primitives. *"No example found" ≠ "no Python route."*

**Tier 3 — Cross over only when the entry surface genuinely can't express it.** Distinguish two failures:
- **Fixable error** (wrong field/operator/timezone, bad symbol) → that's the **retry contract** below. Stay on the current surface.
- **Capability absent** (no SQL function / no Python idiom exists for this at all) → *now* you may consult the **other** surface's docs.

  Apply it symmetrically:
  - *Default (SQL) path:* if SQL genuinely can't do it, check Python (`search_python-docs` / `-examples`); if Python can, answer in Python; if neither can, tell the user it can't be done either way.
  - *Python path:* if there's no Python idiom even after composing from primitives, you **may** call `search_sql-docs` — but only to understand the entity or find the SQL to **wrap in `otp.SqlQuery(...)`**. The answer stays Python. Hand back a bare SQL answer only if the operation is SQL-only.

  **Never call `search_sql-docs` before a genuine Python attempt has failed** (both Python tools, queried for the specific entity, plus an attempt to compose) — that ordering is the discipline that keeps a Python question from defaulting to SQL.

The exact Python⇄SQL capability boundaries are evolving — treat the doc-search tools as the runtime oracle ("is this doable in SQL?" = "does `search_sql-docs` return a real function for it?") rather than assuming from memory.

---

## Execution

Hand finished SQL to the bundled helper — you never construct an HTTP body, pick a wire format, or touch the transport.

**Never modify the helper.** `scripts/onetick_exec.py` is a fixed, shared tool: it takes SQL in and returns an envelope. Do not `Edit` it, add CLI flags to it, or patch it to work around a failing query — a 0-row or error result is a signal to fix *your SQL* (via the retry contract), not the helper. If the helper genuinely looks wrong or insufficient, stop and surface that to the user; don't rewrite it mid-task.

```bash
uv run "${CLAUDE_PLUGIN_ROOT}/skills/onetick-cloud/scripts/onetick_exec.py" --sql "<SQL>" [--no-show-sql] [--timezone Europe/London] [--output PATH]
```

`${CLAUDE_PLUGIN_ROOT}` is the plugin install root (substitute the absolute path if unset, e.g. outside Claude Code). The first `uv run` resolves onetick-py + pandas + pyarrow into a cached venv — slow once, fast after; if `uv` is missing, tell the user to install it (`brew install uv`), don't `pip install` into system Python.

**What it does.** Runs the SQL byte-for-byte (the step-6 guardrails carry over), writes the **full** result to an Arrow Feather file, and prints a bounded JSON envelope:
`{"rows": <total>, "columns": [{"name","type"},…], "preview_rows": <int>, "path": "<feather>", "preview": [first N rows], "sql": "<statement; omitted with --no-show-sql>"}`.

**Execution engine (transparent — the CLI and envelope are identical either way).** By default the helper runs SQL through OneTick Cloud's REST endpoint (`omdwebapi/rest/`, CSV → Arrow), using only stdlib HTTP + `pyarrow`. This avoids importing the heavy onetick-py wheel (~6–7s of per-process startup), so a one-shot invocation starts in well under a second instead of ~7s (KXI-72495). If the REST path is genuinely unavailable — a transport/infra failure — it falls back automatically to the onetick-py `otp.SqlQuery` wheel; a OneTick *query* error (an `ERR_…` code) is surfaced immediately for the retry contract instead of triggering a fallback (the wheel would only reproduce it). You never pick an engine — an optional `ONETICK_EXEC_ENGINE=rest|wheel|auto` env var exists for debugging only.

**No row cap.** The full result always goes to disk; stdout carries only the total `rows` count + a preview (N = `ONETICK_PREVIEW_ROWS` env, default 20), so a 5-row and a 5M-row query cost the same tokens. To bound the result, put a `limit` in the SQL. **Whenever `rows` exceeds `preview_rows`, give the user the `path`** (read with `pandas.read_feather(path)` / `pyarrow.feather.read_table(path)`) — never dump the full result into chat.

**Credentials — env vars only, no file.** `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET` required (the wheel reads them natively; auth is OAuth `client_credentials`, handled inside the wheel); `OTP_HTTP_ADDRESS` / `OTP_ACCESS_TOKEN_URL` optional. If a secret is unset the helper fails cleanly with `{"error": "Missing OneTick credentials: …"}` (exit 1) — don't retry with placeholders; tell the user to register at https://authdash.cloud.onetick.com/web_dashboard/?dash=sub_profile and export them.

**On error** (non-zero exit with `{"error": "ERR_…"}`, or `rows: 0` when rows were expected) apply the retry contract below. The helper executes one SQL at a time; orchestration is the agent's job. For Python REPL / bulk use it also exposes `run_sql(sql, timezone=…) -> pyarrow.Table`.

---

## Presenting results — output format

The helper prints a JSON envelope **for the agent, not the user**. Never paste the raw envelope into chat, and never dump the full result. Present it the **same way in every surface** (IDE or terminal) — the rendering must not depend on the client. Pick the shape from the result:

- **Tabular — the default (multiple rows, or multiple columns):** render the `preview` as a **Markdown table**, header row taken from `columns` (the `name`s, in order). Follow it with the total `rows`. When `rows > preview_rows`, add one line — *"showing the first `preview_rows` of `rows`; full result: `<path>`"* — and note it's read with `pandas.read_feather(path)` or `pyarrow.feather.read_table(path)`. Never print more than the preview rows.
- **Single scalar (1 row × 1 column — e.g. a `COUNT` / `AVG` / `SUM`):** state the value in a sentence; no table.
- **One row, many columns (a single bar / quote / daily record):** present a vertical **field → value** list, which reads better than a one-row-wide table.
- **Zero rows:** say so plainly and surface the envelope's `hint`; if rows were expected, this is the retry-contract trigger below.
- **Error envelope (`{"error": …}`):** show the verbatim `ERR_…` text; do **not** render a table — then follow the retry contract.

**When the result isn't a flat table:**
- **A Python answer (Tier 2/3 `onetick-py` idiom):** the deliverable is a **code block** plus a one-line explanation — not a result table. Don't fabricate data to tabulate.
- **Field-semantics / explanatory answers** ("what field holds X?", "how does auth work?"): prose and a short list; no table.
- **Naturally-structured data (order-book / book-depth snapshots, matrices, multi-level records):** render in its native shape — e.g. a two-sided bid/ask **depth ladder** or grouped levels — rather than forcing a flat table.
- **Array- or struct-valued cells, or a result too nested/wide to read inline:** show what fits (a summary, the top levels) and point to the Feather `path` for the full structure (`pyarrow.feather.read_table(path)`). Never cram a nested value into a single Markdown cell.

The principle underneath: **match the rendering to the data's natural shape.** The Markdown table is the default for flat row/column results; when the data is nested, hierarchical, a single code snippet, or prose, use whichever form reads best — and keep it identical across IDE and terminal.

Render cell values **as the helper returned them**: timestamps in their readable form, full numeric precision, and the currency/units the column implies (e.g. `TRADE_CURRENCY`). Do not silently round, reformat, reorder, or drop columns; if you must elide columns for width, say which you dropped and point to the `path` for the complete set.

---

## Retry contract — hard cap of 3 attempts per query

When a query fails (error envelope on non-zero exit, or `rows: 0` on a question that expected rows), follow this loop. **Do not exceed 3 attempts on the same logical question.**

1. **Capture the failure signal.** Either the OneTick exception text (`ERR_…: …`) from the error envelope, or the literal string `"0 rows returned"` if the helper succeeded but produced no data.
2. **Feed that signal back into the right doc tool.** Call `search_sql-docs(query=<the exception text or "0 rows returned, expected rows; <one-line context>">)` for SQL-path retries, or `search_python-docs` if the failure happened in the Python-fallback branch. **Do not paraphrase the error or compose a new query from memory** — pass the OneTick-emitted text through as the search query, that's the contract.
3. **Apply the guidance** the doc tool returns to the next attempt — fix the field name, change the operator (`BETWEEN` → `>=`/`<`), add the `DB::SYMBOL` qualifier, adjust the timezone literal, whatever it indicates.
4. **Count the attempt.** After 3 attempts on the same logical question, stop and surface the last error to the user verbatim alongside a one-line summary of what was tried. Do not silently keep retrying — the eval shows uncapped retries hit the harness timeout on at least one cross-DB chain query.

The retry contract is part of the skill, not the helper. The helper executes one SQL at a time and surfaces the OneTick error verbatim (the `ERR_…` code is preserved in the `{"error": …}` envelope it writes to stderr); the orchestration loop is the agent's responsibility.

---

## Gotchas the agent must handle

**`list_databases` is not exhaustive — DB-siblings are hidden.** A database can have `_BARS` and `_DAILY` companions that are *independent* DBs, not tick types within the parent (e.g. `LSE_SAMPLE` and `LSE_SAMPLE_BARS` are both DBs; `LSE_SAMPLE_BARS.TRD_1M` is the bars table). A prefix or filtered search may return the parent only. If a bars or daily companion is expected and not in the list, **do not conclude it is missing** — go straight to `db_table_schemas(db='<PARENT>_BARS', tick_type='TRD_1M')` (or `_DAILY`, `DAY`) and try the query. If schema lookup succeeds, the DB exists.

**Symbol qualification.** Inside a single DB, filter on `SYMBOL_NAME='VOD'`. When the query crosses DB boundaries — most commonly reference-data lookups through `OTQ_CHAIN` — qualify the symbol with the source DB: `SYMBOL_NAME='LSE_SAMPLE::HSBA'`, `SYMBOL_NAME='US_COMP_SAMPLE::WMT'`. The qualified form is required for `OTQ_CHAIN."OB_SNAPSHOT()"` book-depth queries and `OTQ_CHAIN."REF_DATA(ref_data_type='CORP_ACTIONS')"` adjustment lookups.

**Futures symbol format is venue-specific — confirm it, don't guess.** CME stores futures contracts backslash-separated by month/year, e.g. `ES\H24` (not `ESH4`, `ESH2024`, or `ES H24`). Other venues differ. A wrong symbol returns **0 rows with no error** — indistinguishable from "no data." So on an unexpected 0-row result, before assuming the data is missing, **run a symbol-less diagnostic** to see the actual values present: `select distinct SYMBOL_NAME from <DB>.<TICK_TYPE> where TIMESTAMP >= '<lo>' and TIMESTAMP < '<hi>' limit 50`. Match your filter to the real format it returns, then re-issue the query. (This is also the fastest way to catch the qualification and tick-type traps below.)

**Time literals always carry a timezone.** `'2024-01-03 12:00:00 UTC'`, `TIMESTAMP range in 'America/New_York'`, etc. Bare timestamps will either fail or silently default to a venue-inappropriate zone. The body-level `"timezone"` parameter governs result rendering, not literal parsing inside the SQL.

**TIMESTAMP does not support `BETWEEN`.** OneTick rejects `where TIMESTAMP between '<lo>' and '<hi>'` with `ERR_07516820CWNEE: Conditions for TIMESTAMP cannot be specified using 'between' operator`. Always express time ranges as `TIMESTAMP >= '<lo>' AND TIMESTAMP < '<hi>'`. The dashboard's `TIMESTAMP range` placeholder expands to this form, not to `BETWEEN`. Applies to *all* tick types (`TRD`, `QTE`, `*_1M`, `*_DAILY`, `DAY`, etc.).

**Weak/patchy MCP tools — avoid as first resort.**

- `db_field_enumerations` — coverage is patchy (e.g. `LSE_SAMPLE.MMT_MKT_MECH` returns "No values found" despite obviously having enumerated values). Fall back to `db_field_descriptions` or `search_sql-docs`; if neither helps, surface the raw code with a caveat.
- `search_cloud_coverage` — misnamed; indexes per-exchange schema docs (Binance, OKX, Coinbase, etc.), not OneTick Cloud platform / auth / REST docs. Don't expect to find platform mechanics here.

**Do not invent function signatures.** For any built-in OneTick SQL function (`CORP_ACTIONS`, `MKT_ACTIVITY`, `TICK_SHIFT`, `OB_SNAPSHOT`, `REF_DATA`, `TW_AVG`, etc.) call `search_sql-docs` and lift the signature and example from the returned documentation.

---

## Setup

User-facing install instructions live in the plugin's `README.md` — when distributed via a marketplace, `claude plugin install` auto-registers the `OneTick-Cloud` MCP server and drops the skill + helper in place. The user's only manual steps are: install `uv`, register at the OneTick portal, and export `OTP_CLIENT_ID` / `OTP_CLIENT_SECRET` in their shell.

If the agent is loaded into a session where the OneTick MCP server is not registered, stop and tell the user to install the plugin or run `claude mcp add --transport http OneTick-Cloud https://mcp.cloud.onetick.com/mcp` manually.

---

## Worked traces

Three compact end-to-end examples. Both show the **call sequence**, not canned SQL — the SQL at the end is what the agent should produce after the MCP calls have confirmed the inputs.

**Example A — "Give me 1-minute VOD trade bars from LSE on 3 Jan 2024."**

1. `list_databases(country='GB', equities='Y', bars='Y')` → confirms `LSE_SAMPLE` is the UK equities sample DB with bars available; `LSE_SAMPLE_BARS` may or may not appear in the result (DB-sibling gotcha).
2. `db_table_schemas(db='LSE_SAMPLE_BARS', tick_type='TRD_1M')` → confirms the bars table exists and lists its fields.
3. Compose:
   ```sql
   select * from LSE_SAMPLE_BARS.TRD_1M
   where SYMBOL_NAME='VOD'
     and TIMESTAMP >= '2024-01-03 00:00:00 UTC'
     and TIMESTAMP <  '2024-01-04 00:00:00 UTC'
   limit 1000
   ```
4. `uv run "${CLAUDE_PLUGIN_ROOT}/skills/onetick-cloud/scripts/onetick_exec.py" --sql "<above>"` → JSON envelope (`sql`, `rows`, `columns`, `preview_rows`, `path`, `preview`). The SQL's own `limit 1000` bounds the result; the full set is written to `path`.

**Example B — "Walmart split-adjusted close for March 2024."**

1. `search_sql-docs(query='CORP_ACTIONS adjust price for splits')` → confirms signature `CORP_ACTIONS('CLOSE','<as_of>','PRICE','SPLIT')` and that the source DB is the `_DAILY` companion.
2. `list_databases(country='US', equities='Y')` → `US_COMP_SAMPLE` is the parent; `US_COMP_SAMPLE_DAILY` is the daily companion (try the schema if it doesn't show in the list).
3. `db_table_schemas(db='US_COMP_SAMPLE_DAILY', tick_type='DAY')` → confirms `CLOSE`, `EXCHANGE`, `SYMBOL_NAME`.
4. Compose:
   ```sql
   select TIMESTAMP, CLOSE,
          CORP_ACTIONS('CLOSE','20240310','PRICE','SPLIT') as ADJ_CLOSE
   from US_COMP_SAMPLE_DAILY.DAY
   where SYMBOL_NAME='WMT' and EXCHANGE=''
     and TIMESTAMP >= '2024-03-01 00:00:00 America/New_York'
     and TIMESTAMP <  '2024-04-01 00:00:00 America/New_York'
   limit 1000
   ```
5. Execute via helper.

**Example C — a field/semantics question, answered from the schema (never invent a field).** This is the pattern for "what's the field for X?" / "decode the codes for Y" / "what does field Z mean?".

1. Look it up: `db_table_schemas(db='<DB>', tick_type='<TICK>')` for field names/types; `db_field_descriptions(tick_type='<TICK>', field='<F>')` for semantics; `db_field_enumerations(...)` for code sets.
2. Answer using **only** what came back. Say the schema returned columns `FIELD_A`, `FIELD_B`, `FIELD_C`:
   - **Right:** "The field is `FIELD_B` (`long`)." — names a column that is actually present.
   - **Right (when the asked-for field is absent):** "`<TICK>` has no column for `<X>`; its fields are `FIELD_A`/`FIELD_B`/`FIELD_C`. That concept is derived from `FIELD_A` / the symbol / a reference table." — states the absence plainly and points to what *is* there.
   - **Wrong:** inventing a plausible-sounding name like `<X>_FLAG` or `MARKET_<X>` that is **not** in the returned columns.
   - **Wrong:** carrying a field over from a *different* tick type you remember (a field on `TRD` may not exist on `DAY`).
3. For "decode the codes": list **only** the codes the enumeration/data actually returned; if the enumeration tool returns nothing, say the codes aren't catalogued and surface the raw values you can see — do not invent a decode table from memory.

The rule underneath: every field name, type, code, or value in your answer must trace to output you retrieved this session. If it doesn't, don't write it.

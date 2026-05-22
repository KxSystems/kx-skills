---
name: kxmeta-discover
description: Discovering metadata on a running kdb+ process via `aimeta` — cold-start probing, the `/meta` HTTP route, `kx-meta discover`, qIPC fallback, and reading the `tier` / `references[]` fields in the response. Use when an agent needs to learn what tables and functions a kdb+ host exposes, when interpreting `kx-meta discover` output, when handling tier-1 fallback gracefully, or when walking `references[]` for vocabulary resolution. For the wire model and full `meta.json` shape see ../../reference/agent-guide.md.
---

# Discovering metadata on a kdb+ process

## When to use

- An agent has a `host:port` and needs to know what tables/functions are exposed.
- Interpreting the output of `kx-meta discover`, `curl host:port/meta`, or `.aimeta.get*` qIPC calls.
- Handling a host that doesn't have `aimeta` loaded (tier-1 fallback).
- Walking `references[]` to resolve a vocabulary term (e.g. "USD") to the underlying key.

For the wire model — full `meta.json` shape, kind vocabulary, `references[]` semantics, `kdbType` cheatsheet — see [reference/agent-guide.md](../../reference/agent-guide.md). This skill covers *how to obtain* the metadata and interpret which tier resolved.

## Start here: `GET /meta`

Always begin with a single HTTP probe — it's cheap, requires nothing on `$PATH`, and tells you immediately whether the host is `aimeta`-enabled:

```bash
curl -s -w "\nHTTP %{http_code}\n" http://host:port/meta
```

- **`200` + JSON body** → tier 3. Full annotated `meta.json` in hand. Stop probing, start reading.
- **`404`, non-JSON, or connection refused** → host is not `aimeta`-enabled at HTTP. Fall through to `kx-meta discover` (below), which probes tier 2 (qIPC `.aimeta.get*`) and tier 1 (native `tables`/`meta` introspection).

`/` and `/.well-known/api-catalog` are useful when you want the route map (they list `/meta`, `/openapi.json`, `/meta.schema.json`), but they tell you the same thing `/meta` does — skip them unless you need the catalog explicitly.

## Fallback: `kx-meta discover`

When `/meta` is 404, use the `kx-meta` script. It walks Tier 3 → Tier 2 → Tier 1 and stops at the first resolution, so a single call handles every host shape:

```bash
kx-meta discover host:port                    # full payload + `tier` field
kx-meta discover host:port -tables            # scope to tables[] only
kx-meta discover host:port -functions         # scope to functions[] only
kx-meta discover host:port -tier 2            # force a specific tier; no fallthrough
```

The script lives at `scripts/kx-meta.sh` in the ai-meta source repo. If it's not on `$PATH`, find the repo root with `git rev-parse --show-toplevel` (or `pwd` + `ls`) and call it by absolute path: `bash <repo>/scripts/kx-meta.sh discover host:port`. Add `<repo>/scripts/` to `$PATH` to drop the prefix.

### ETag / 304 handling

`/meta`, `/`, `/.well-known/api-catalog`, `/openapi.json`, and `/meta.schema.json` all carry `ETag` headers and honour `If-None-Match` for 304. For polling agents, cache the ETag and send `If-None-Match: <etag>` on the next request:

```bash
curl -s -D /tmp/h http://host:port/meta -o /tmp/m; etag=$(awk 'tolower($1)=="etag:"{print $2}' /tmp/h | tr -d '\r')
curl -s -o /tmp/m2 -w "%{http_code}\n" -H "If-None-Match: ${etag}" http://host:port/meta
# 304 means nothing changed; 200 means re-parse /tmp/m2
```

## In-process / qIPC

From a q client process already connected (`h: hopen ...`):

```q
h ".aimeta.getTables[]"        / list[] of table dicts
h ".aimeta.getTable[`trade]"   / single table dict by name
h ".aimeta.getFunctions[]"     / list[] of function dicts
h ".aimeta.getFunction[`.gw.vwap]"
h ".aimeta.getReferences[]"    / references[] index
h ".aimeta.getReference[`currency]"
```

If the host hasn't loaded `aimeta` (or hasn't called `.aimeta.init[]`), `type get \`.aimeta.getTables` returns -1h or similar — fall back to native introspection:

```q
tables 0N!`         / list of table names
meta `trade         / column metadata for one table
\f                  / function names defined in the current process
```

That's the tier-1 surface — names + types only, no descriptions.

## Detecting which tier resolved

Every `kx-meta discover` response (and every `tier3`/`tier2` shape returned by `.aimeta.discover`) carries a `tier` field. Read it first:

```bash
kx-meta discover host:port | jq .tier
```

| `tier` | What's populated                                                |
|--------|----------------------------------------------------------------|
| `3`    | Full annotated `meta.json` — `desc`, `examples`, `uses`, `references` all live. |
| `2`    | Same shape as tier 3, served over qIPC.                         |
| `1`    | `tables[]` with names + columns only; `functions[]` with names + arity only; `references[]` empty; all `desc` fields empty. |

**A consumer that requires `desc` or `references[]` should check `tier >= 2` before relying on them.** Don't assume rich metadata is present.

### Degradation markers on `tier 3`

Even at tier 3 the host may be serving a Tier-1-synthesised document because `init[]`'s compile-on-boot step failed or produced no public surface. Check `process.compileStatus`:

| `compileStatus`     | Meaning                                                     |
|---------------------|-------------------------------------------------------------|
| absent              | Normal annotated output — trust the rich fields.            |
| `"empty"`           | Source compiled clean but emitted nothing; tier-1 shape.    |
| `"failed"`          | Compile errored; reason in `process.warnings`. Tier-1 shape.|

When `compileStatus` is set, treat `desc`/`examples`/`references[]` as
absent (they will be empty strings or empty arrays) regardless of the
`tier` field.

## Reading the result

The `meta.json` shape is documented in [reference/agent-guide.md](../../reference/agent-guide.md). Three patterns worth lifting out:

### Resolving a vocabulary term via `references[]`

A user asks for trades in USD. The `instrument.ccy` column has `semanticType: "currency"`:

1. Read `instrument.ccy.semanticType` → `"currency"`.
2. Look up `references[]` where `semanticType == "currency"` → `{table: "currency", keyColumn: "code", label: "name"}`.
3. Query `currency` where `name = "US Dollar"` → row with `code = `USD`.
4. Use `` `USD `` against `instrument.ccy`.

If `tier < 2`, `references[]` is empty — fall back to asking the user for the symbol.

### Following a `foreignRef` edge

`trade.sym` has `foreignRef: "instrument.sym"` — join `trade` to `instrument` on equality of `sym`. This is a hard edge, independent of any `semanticType`.

### Function dependency lookup

A function's `uses` field is its table dependency set. To answer "what schema does `.gw.vwap` need?", read `functions[].uses` and join to `tables[]` by name.

## Practical patterns

- **Polling for changes**: cache the ETag from `/meta`; resend with `If-None-Match` on each tick. 304 is cheap; 200 means re-parse.
- **Validate before parsing**: fetch `/meta.schema.json` once; validate every `/meta` response against it. Refuse to interpret responses whose `schemaVersion` exceeds the schema's `const`.
- **Multi-host discovery**: a function `@uses trade` where `trade` lives on another host means the cross-process publish graph stitches them. The function's home process may not have the table — chase the schema via the producing host.

## Pointers

- [reference/agent-guide.md](../../reference/agent-guide.md) — wire model & full `meta.json` shape (kind vocabulary, type cheatsheet, `references[]` semantics, interpretation rules).
- [reference/meta.schema.json](../../reference/meta.schema.json) — machine-readable wire schema; also fetchable over HTTP from `host:port/meta.schema.json`.
- [reference/openapi.json](../../reference/openapi.json) — machine-readable OpenAPI 3.1 document; also fetchable from `host:port/openapi.json`.

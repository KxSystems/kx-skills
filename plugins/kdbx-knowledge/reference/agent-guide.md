# `aimeta` — Agent Reference

The shared wire-model reference for `aimeta` — what `meta.json` looks like, what the closed tag set means, and what each discovery tier yields. Both `aimeta` authors and consumers point here.

This document is intentionally a reference, not a how-to. For step-by-step behaviour:

- **Authoring annotations** — see the `kxmeta-author` skill.
- **Discovering metadata on a running process** — see the `kxmeta-discover` skill.

The machine-readable wire contract is [meta.schema.json](./meta.schema.json) — anything ambiguous here is decided by that schema.

---

## What `aimeta` is

`aimeta` is a q module that publishes agent-facing metadata for kdb+ processes. Source-tree annotations compile to a canonical `meta.json`, which is loaded read-only at runtime and served over HTTP (`GET /meta`) and qIPC (`.aimeta.get*`). The same JSON shape is exposed at every discovery tier.

Direction is one-way: source → JSON → in-memory dict → wire. There is no mutation API. To change metadata, edit annotations and recompile.

---

## Wire model

### Kind vocabulary

Every annotated item is one of two kinds. The compiler ignores everything else:

| `@kind`    | Meaning                                         |
|------------|-------------------------------------------------|
| `data`     | A table — surfaces under `tables[]`             |
| `function` | A callable — surfaces under `functions[]` when `@public` |

Tables are public by default (opt out with `@private`). Functions are private by default (opt in with `@public`).

### Tag set (closed)

These are the tags `aimeta` recognises on top of standard qdoc. Anything else is ignored.

| Tag             | Applies to       | Notes                                                                 |
|-----------------|------------------|-----------------------------------------------------------------------|
| `@kind`         | every item       | `data` or `function`. Required.                                       |
| `@name`         | every item       | Binding name as written. Required. (`@name trade`, `@name .gw.vwap`.) |
| `@desc`         | every item       | Single line; what it is, not how.                                     |
| `@public`       | function         | Opt-in. Functions are excluded from `meta.json` by default.           |
| `@private`      | table            | Opt-out. Tables are included by default.                              |
| `@uses`         | function         | Space-separated table names; may repeat. Drives the publish graph.    |
| `@param`        | function         | `name {type} description` — one per declared argument.                |
| `@returns`      | function         | `{type} description`. Required on `@public` functions.                |
| `@example`      | function         | Opaque text; never executed. May repeat.                              |
| `@col`          | table column     | `name {type} description.` plus chained modifiers.                    |
| `@sampleRow`    | table            | One sample row of comma-separated q literals; may repeat.             |
| `@reference X`  | table            | Marks the table as the canonical resolver for vocabulary `X`.         |
| `@semanticType` | column modifier  | `@semanticType:currency` — pairs with `@reference`.                   |
| `@foreignRef`   | column modifier  | `@foreignRef:tableName.columnName` — explicit edge.                   |
| `@cardinality`  | column modifier  | `@cardinality:{low,medium,high}`.                                     |
| `@attr`         | column modifier  | kdb+ column attribute. `@attr:{s,u,p,g}` — sorted/unique/parted/grouped. May repeat. `@attr:u` marks the resolver-key column on a `@reference` table. |
| `@label`        | column modifier  | Human-readable column on a `@reference` table. May repeat.            |
| `@tag`          | function, table  | Free-form labels (`stable`, `experimental`, `deprecated`). May repeat. |

Column modifiers (`@semanticType`, `@foreignRef`, `@cardinality`, `@attr`, `@label`) chain on a single `@col` line after the required `name {type} description.` prefix:

```q
/ @col sym {symbol} Instrument symbol. @semanticType:instrument @foreignRef:instrument.sym @attr:u
```

Order does not matter.

### Type strings

qdoc lets you put any string in `{...}`. `aimeta` constrains how it's interpreted:

- For `@col`, the qdoc type name is mapped to a kdb single-char code using q's own type system (`symbol` → `s`, `float` → `f`, `timestamp` → `p`, …). Unknown names pass through verbatim for the validator to flag.
- Compound type strings (`dict(a:long;b:long)`, `fn(long;long)->long`) may silently drop the host item via the qdoc parser. Stick to bare `dict`, `function`, `*` and put structure into `@desc`.
- For `@param` and `@returns` the qdoc string is preserved verbatim — q functions are dynamically typed and have no kdb-char form.

### `kdbType` cheatsheet

Single-character codes from q's type system, used in `columns[].kdbType`:

| Code | Type        | Code | Type        |
|------|-------------|------|-------------|
| `b`  | boolean     | `p`  | timestamp   |
| `g`  | guid        | `m`  | month       |
| `x`  | byte        | `d`  | date        |
| `h`  | short       | `n`  | timespan    |
| `i`  | int         | `u`  | minute      |
| `j`  | long        | `v`  | second      |
| `e`  | real        | `t`  | time        |
| `f`  | float       | `s`  | symbol      |
| `c`  | char        | `*`  | any         |

### `meta.json` shape

A discovered `meta.json` always has this shape. Optional fields are marked; missing optionals are absent rather than null unless noted.

```jsonc
{
  "schemaVersion": 2,
  "compilerVersion": "0.1.0",           // semver; build of the compiler that produced this file
  "process": {
    "name": "gateway",                  // optional, informational
    "host": "...",                      // populated only when running
    "port": 5013,                       // populated only when running
    "compileStatus": "failed",          // present only when init[] fell back to Tier-1 synthesis
                                        //   "failed" — compile errored (rule violation, parse error, ...)
                                        //   "empty"  — compile succeeded but emitted no public surface
    "warnings": ["..."]                 // present alongside compileStatus; free-form diagnostics
  },
  "tables": [
    {
      "name": "trade",
      "private": false,                 // true if @private
      "desc": "...",                    // optional
      "reference": "currency",          // null unless this table has @reference X
      "labels": ["name", "longName"],   // ordered @label columns; [] if reference is null
      "columns": [
        {
          "name": "sym",
          "kdbType": "s",               // single-char q type
          "desc": "...",                // optional
          "semanticType": "instrument", // optional — vocabulary tag
          "foreignRef": "instrument.sym", // optional — explicit edge
          "cardinality": "high",        // optional — low|medium|high
          "attributes": ["g"],          // optional — list of "s"/"u"/"p"/"g"; field omitted when none
          "label": false                // optional — true if @label
        }
      ],
      "sampleData": [...],              // optional — array of row objects
      "tags": []
    }
  ],
  "references": [                       // computed top-level index
    {
      "semanticType": "currency",       // vocabulary name
      "table": "currency",              // resolver table name
      "keyColumn": "code",              // @attr:u column on the resolver
      "label": "name",                  // primary @label column (null if none)
      "labels": ["name", "longName"]    // all @label columns, primary first
    }
  ],
  "functions": [
    {
      "name": ".gw.vwap",
      "desc": "...",
      "params": [
        {"name": "syms", "type": "symbol[]", "desc": "..."}
      ],
      "returns": {"type": "table", "desc": "..."},
      "examples": [".gw.vwap[`AAPL`MSFT; .z.d; 0D00:05:00]"],
      "uses": ["trade", "quote"],       // table dependencies
      "tags": []
    }
  ]
}
```

### Interpreting the shape

- **`tables[]`** is the published surface. `private: true` items appear in `meta.json` but are flagged as internal — show them only when the agent task explicitly calls for them.
- **`functions[]`** contains only `@public` functions. Private helpers are absent. Treat the list as the callable surface.
- **`uses`** on a function is the table dependency set. To answer "what schema does this function need?" walk the function's `uses` and join to `tables[]` by name.
- **`foreignRef`** on a column is a hard edge: `instrument.sym` means this column joins to `instrument.sym` on equality.
- **`semanticType`** on a column is a *vocabulary* link, not a direct edge. Look up the matching entry in `references[]` to find the resolver table and key column. A column may carry both `semanticType` and `foreignRef` independently.
- **`references[]`** is a denormalised lookup table. To translate a user-facing name (`"USD"`) for column `instrument.ccy`:
  1. Read `instrument.ccy.semanticType` → `"currency"`.
  2. Look up `references[]` where `semanticType == "currency"` → `{table: "currency", keyColumn: "code", label: "name"}`.
  3. Query `currency` where the `label` column matches `"US Dollar"` to get the `code` value, then use that against `instrument.ccy`.
- **`attributes`** on a column lists the kdb+ runtime column attributes (`s` sorted, `u` unique, `p` parted, `g` grouped) — same letters `meta t` shows in its `a` column. Treat as query-planning hints: `u#` means O(1) hash lookup (typical on `@reference` keys); `g#` means a grouped index for fast `where col=...`; `s#` enables binary search; `p#` enables range scans on disk. Field is omitted when no attribute is set. See [code.kx.com/q/ref/set-attribute](https://code.kx.com/q/ref/set-attribute/).
- **`examples`** are opaque strings, never executed by the compiler. They may contain illustrative shorthand (`.z.d`, `...`) — do not assume they are runnable verbatim.
- **`sampleData`**, when present, is a small array of row objects. Treat it as illustrative shape, not real data.

### Determinism

`meta.json` is byte-deterministic for unchanged source. If you are diffing two snapshots, any byte difference is a real change.

---

## Tier model

The same `meta.json` shape is exposed at three tiers, richest to bare:

| Tier | Source              | What you get                                                |
|------|---------------------|-------------------------------------------------------------|
| 3    | `GET /meta`         | Full annotated `meta.json` over HTTP.                       |
| 2    | `.aimeta.get*` qIPC | Same shape as Tier 3, served over qIPC.                     |
| 1    | `tables[]`, `meta`, `\f`, `value` for arity (best-effort) | Schemas + function names + arity; no descriptions, no examples, no references. |

The response always carries a `tier` field signalling which resolved. Calibrate expectations accordingly:

- **Tier 3 / 2** — `desc`, `examples`, `uses`, `references` are populated. Reason from them.
- **Tier 1** — `desc` is empty, `functions[]` carries name + arity only, `references[]` is empty. Treat the metadata as structural, not semantic. Per-function arity is best-effort: if `value` errored on a binding, the field is `null`.

A consumer that requires `desc` or `references[]` should check `tier >= 2` before relying on them.

---

## Discovery envelope (cold start)

When an agent has only `host:port` and no prior knowledge of the routes, start at the root:

```bash
curl localhost:5013/                            # service home document
curl localhost:5013/.well-known/api-catalog     # RFC 9727 Linkset
```

`GET /` returns a small JSON object listing every discovery URL the host serves; `GET /.well-known/api-catalog` returns an `application/linkset+json` document anchored at `/` with link relations pointing at the OpenAPI doc, JSON Schema, and meta payload. Either bootstraps the rest. Both use the same `ETag` / `If-None-Match` / `405` framing as `/meta`.

The home document has the shape:

```json
{
  "service": "aimeta",
  "schemaVersion": 2,
  "links": {
    "meta": "/meta",
    "openapi": "/openapi.json",
    "schema": "/meta.schema.json",
    "apiCatalog": "/.well-known/api-catalog"
  }
}
```

Static descriptors describe the rest of the surface:

```bash
curl localhost:5013/openapi.json       # OpenAPI 3.1 document for /meta and the discovery routes
curl localhost:5013/meta.schema.json   # JSON Schema (draft 2020-12) for the /meta body
```

`info.version` on the OpenAPI document and `properties.schemaVersion.const` on the JSON Schema both track the meta.json `schemaVersion` they target. A parser should fetch the schema once, validate every `/meta` response against it, and refuse to interpret a response whose `schemaVersion` exceeds the schema's `const`.

---

## Authoring quickref

For step-by-step authoring guidance — mandatory markers, chained `@col`, silent-drop traps, recompile loop — use the **`kxmeta-author` skill**.

Minimal example covering tables, references, and functions:

```q
/ @kind data
/ @name currency
/ @desc ISO 4217 currency reference data.
/ @reference currency
/ @col code {symbol} ISO 4217 alpha code. @attr:u
/ @col name {symbol} Display name. @label
currency: ([] code:`symbol$(); name:`symbol$())

/ @kind data
/ @name trade
/ @desc Trade tape — every fill, raw.
/ @col time {timestamp} Wall-clock fill time (UTC). @attr:p
/ @col sym {symbol} Instrument symbol. @semanticType:instrument @attr:g
/ @col price {float} Fill price in instrument's quote currency.
trade: ([] time:`timestamp$(); sym:`symbol$(); price:`float$())

/ @kind function
/ @name .gw.vwap
/ @desc Volume-weighted average price for given symbols.
/ @public
/ @param syms {symbol[]} Symbols to compute VWAP for.
/ @returns {table} `sym`vwap — symbol-keyed VWAP.
/ @example .gw.vwap[`AAPL`MSFT]
/ @uses trade
.gw.vwap: {[syms] select vwap:size wavg price by sym from trade where sym in syms}
```

For a worked fixture covering every tag, see the `tests/fixtures/worked/` directory in the [ai-meta source repo](https://github.com/KxSystems/aimeta).

---

## Consuming quickref

For step-by-step discovery — when to call which route, ETag/304 handling, qIPC fallback, walking `references[]` — use the **`kxmeta-discover` skill**.

Route inventory:

| Route                            | Returns                                     | Tier  |
|----------------------------------|---------------------------------------------|-------|
| `GET /`                          | Home document (links to everything else)    | 3     |
| `GET /.well-known/api-catalog`   | RFC 9727 Linkset                            | 3     |
| `GET /meta`                      | `meta.json`                                 | 3     |
| `GET /openapi.json`              | OpenAPI 3.1 document                        | 3     |
| `GET /meta.schema.json`          | JSON Schema for `/meta`                     | 3     |
| qIPC `.aimeta.getTables[]`      | `tables[]` slice                            | 2     |
| qIPC `.aimeta.getTable[t]`      | One table by name                           | 2     |
| qIPC `.aimeta.getFunctions[]`   | `functions[]` slice                         | 2     |
| qIPC `.aimeta.getFunction[f]`   | One function by name                        | 2     |
| `kx-meta discover host:port`     | `meta.json`-shaped output with `tier` set   | 3/2/1 |

A minimal Tier 3 response is just `meta.json` with `tier: 3` added. A Tier 1 response has the same outer shape but `tables[].desc` empty, `functions[]` containing name + arity only, and `references[]` empty.

---

## Pointers

- [meta.schema.json](./meta.schema.json) — machine-readable JSON Schema for `meta.json`. Fetch over HTTP from `host:port/meta.schema.json` against a running process.
- [openapi.json](./openapi.json) — machine-readable OpenAPI 3.1 document for the HTTP surface. Fetch from `host:port/openapi.json`.
- [KxSystems/ax](https://github.com/KxSystems/ax) — upstream qdoc reference.

---
name: kxmeta-author
description: Writing qdoc annotations for `aimeta` so the compiler publishes tables and functions correctly. Mandatory `@kind`/`@name` markers, the chained `@col` modifier form, q-language traps that silently drop items, and the recompile loop. Use when adding or editing `/ @kind ...` annotation blocks in a q codebase that loads `aimeta`, or when annotated items aren't surfacing in `meta.json`. For the wire model & tag vocabulary see ../../reference/agent-guide.md.
---

# Writing `aimeta` annotations

## When to use

- Adding `/ @kind ...` blocks above tables or functions in a q codebase that loads `aimeta`.
- Editing existing annotations.
- Diagnosing why an annotated item is missing from `meta.json` (the compiler ran clean but the item didn't surface).

The wire model — tag vocabulary, `meta.json` shape, type-string rules, `references[]` semantics — lives in [reference/agent-guide.md](../../reference/agent-guide.md). This skill covers the *behaviour* of getting annotations correct.

## The two mandatory markers

Every annotated item needs these. Without them the parser drops the item from `meta.json` — no error, no warning.

- **`@kind data`** for a table, **`@kind function`** for a callable. `@kind table` is a common mistake — it silently drops because qdoc's preprocessor only recognises `function`/`data`/`readme`/`file`.
- **`@name <bindingName>`** — required on every annotated item. The compiler reads names from `@name` only, never from qdoc's auto-detection (unreliable for multi-line lambdas). Convention: leaf for top-level (`@name trade`), fully-qualified for namespaced (`@name .gw.vwap`).

## Syntax rules

- Annotation lines start with `/ @tag` at column 0. Indented `/` lines are code context, not annotations.
- One tag per line. A blank line, a non-comment line, or a different binding ends the block.
- Free-text fields run to end-of-line (`@desc`, `@param` description, `@returns` description, `@example`). Repeatable tags: `@param`, `@col`, `@example`, `@uses`, `@tag`, `@sampleRow` — every other tag appears at most once.
- Types use qdoc names inside `{...}` (`symbol`, `symbol[]`, `float`, `timestamp`), not q's single-char codes. The compiler maps to `s`/`f`/`p`/… when emitting `kdbType`.
- Annotations sit **immediately above** the binding. A blank line between the block and the binding breaks the association.

## Chained `@col` modifiers

Column modifiers pile up on a single `@col` line after the required `name {type} description.` prefix:

```q
/ @col sym {symbol} Instrument symbol. @semanticType:instrument @foreignRef:instrument.sym @attr:u
```

Order doesn't matter. Modifiers: `@semanticType:X`, `@foreignRef:T.C`, `@cardinality:{low,medium,high}`, `@attr:{s,u,p,g}` (may repeat), `@label`.

## Sample rows

`@sampleRow` attaches example data — one row per tag (repeatable), comma-separated q literals: `` / @sampleRow 2026.04.29D14:30:00,`AAPL,175.5 ``.

- One cell per `@col`, each matching the column's type — an `{int}` column needs `100i`, not `100`.
- Literals only, no expressions; strings containing commas must be `"..."`-quoted.

## q-language silent-drop traps

These are q-tokeniser quirks, not annotation rules. Symptom: compiler runs clean, item is missing from `meta.json`.

1. **Bare `/` at column 0** can open a block comment that swallows subsequent annotations. Use `//` for non-annotation comments interleaved between bindings.
2. **`-` in symbols** — `` `:foo-bar `` parses as `` `:foo `` minus `bar`. Use `_` or camelCase: `` `:foo_bar ``, `` `:fooBar ``.
3. **`if[c; '"err"]; rest` inline in a function body** silently drops the host function. Use `$[c; '"err"; rest]` — semantically equivalent, parses cleanly.
4. **Compound type strings in `{...}`** — `dict(a:long;b:long)` or `fn(long;long)->long` may silently drop the item. Stick to bare `dict`, `function`, `*`; put structure into `@desc`.
5. **`@desc` split across multiple `/` lines** — only the first line is the description; the rest are dropped silently.
6. **Annotations *below* the binding** — must come immediately above.

## Visibility defaults

- **Tables** are published by default. Opt out with `@private` (the binding is omitted from `meta.json` entirely, including the `references[]` index).
- **Functions** are excluded by default. Opt in with `@public`. The block parses cleanly without `@public` but the function won't appear in the published surface.

## Required tags on `@public` functions

`@kind`, `@name`, `@desc`, `@returns`, one `@param` per declared argument. Recommended: `@example` (at least one), `@uses` (table dependencies — drives the cross-process publish graph). Optional: `@tag`.

## Reference tables (vocabulary resolvers)

A `@reference X` table is the canonical resolver for vocabulary `X`. It needs at least one `@attr:u` column (the key) and may carry `@label` columns (human-readable names). Other tables link to it via `@semanticType:X` on the joining column. See the worked example in [reference/agent-guide.md](../../reference/agent-guide.md) for the full pattern.

Validation rules (not yet enforced by the compiler — follow them anyway):

- `@reference X` requires the table to have a `@attr:u` column.
- Two tables claiming `@reference X` for the same `X` is an error.
- `@label` outside an `@reference` table is dropped.
- `@reference X` ↔ `@semanticType X` is a *vocabulary* link; `@foreignRef T.C` is an *edge*. Independent — a column can carry both.

## Recompile and sanity-check

After substantive edits, restart the host — `init[]` recompiles on
boot by default:

```bash
q host.q
```

Or run the standalone CLI form (useful in CI, or when iterating
without booting):

```bash
scripts/kx-meta.sh compile /path/to/your/q/source
```

Either path writes `<srcDir>/.aimeta/meta.json` — byte-deterministic; commit it and let CI guard against drift.

The parser doesn't report what it silently dropped. Count what made it through:

```q
m: .aimeta.data[];
expectedFns: `.gw.vwap`.gw.fxConvert;        / what you expect
gotFns:      key m`functions;
missing:     expectedFns except gotFns;
if[count missing;
    -1 "MISSING from meta.json: ", "," sv string missing;
    -1 "  → first check: missing @kind, missing @name, mismatched @name.";
    -1 "  → then: bare `/` comments, `-` in symbols, if[c;'\"err\"];rest bodies, compound types."];
```

If items are missing and the compiler reported no errors, the cause is one of the silent-drop traps above.

## Pointers

- [reference/agent-guide.md](../../reference/agent-guide.md) — wire model & tag vocabulary (the closed tag table, type-string rules, `meta.json` shape, `references[]` semantics).
- [reference/meta.schema.json](../../reference/meta.schema.json) — machine-readable wire schema; useful for sanity-checking compiled output shape.

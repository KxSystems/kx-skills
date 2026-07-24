---
name: kx-datagrid
description: "Use this when the user wants a flat, row-by-row KX Dashboards table for browsing or editing records (trade blotter, price table, real-time table, sortable grid, editable grid). Do not use it for aggregated pivot-style analysis; use kx-pivot-grid for that. Read kx-dashboard-core first for the shared dashboard envelope, data sources, ViewState, and checklist."
requires:
  - kx-dashboard-core
---

# KX Datagrid Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the workflow, hazards, and output contract are here; the bulky JSON schema, field-reference tables, and worked examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — component identity (`key`/`definitionId`/`version`), the `Basics` block, the full 33-field column template, the Format/Currency/DateFormat/HighlightRules field-reference tables (including `RuleMin`/`RuleMax`), and the Tooltip, Selection, FileExport, Grouping, HighlightRules, CustomFilters, and Style blocks. |
| [reference/examples.md](reference/examples.md) | The `generate.js` config field reference for `componentType: "datagrid"` plus six worked NLQ → JSON examples (sparse grid, negative highlight, grouping, row-click nav, gradient rule, full trade-blotter config). |

---

## When to use the Datagrid

The Datagrid displays **flat data — one row per record**. Its primary use is **browsing raw, record-level data**: trade blotters, price tables, real-time feeds, editable record lists, sortable/filterable tables.

The Datagrid does **not** automatically aggregate data or build a multi-dimensional layout. If the user wants **aggregated, multi-dimensional analysis or reporting** — a pivot table, pivot grid, drilldown breakdown, or automatically aggregated measures across dimensions — use the **kx-pivot-grid** skill (the Pivot Grid) instead.

---

## Workflow (sparse mode by default)

1. **Read `kx-dashboard-core` first** for the envelope, data sources, ViewState, and pre-flight checklist.
2. **Confirm it is a flat, row-per-record table.** If the user wants aggregated/pivot-style analysis, stop and use **kx-pivot-grid** instead (see *When to use* above and *Routing* below).
3. **Clarify inputs** — data source name, columns, and connection. If ambiguous, ask one focused clarification question before generating (see Output Contract).
4. **Build in sparse mode by default** — for each `ColumnsConfiguration` entry output only `Field`, `DisplayName`, `Format`, and fields that differ from their defaults; for `Basics` output only fields that differ from defaults. Pull the full schema, the 33-field template, and the field-reference tables from `reference/component-schema.md` only as needed. Switch to full mode only when the user asks for complete/importable JSON (see Output Contract).
5. **Apply column formats, highlights, grouping, selection, and actions** as requested — schema in `reference/component-schema.md`; copy from `reference/examples.md` when a pattern matches.
6. **Validate** against the Hazards below and the Output Contract before emitting.

---

## ⚠️ Datagrid-Specific Hazards

- **`Format: "General"` ignores `Precision`** — use `"Number"` or `"Formatted Number"` when decimal places matter.
- All 33 column fields are required in a full importable dashboard JSON; omitting any causes rendering issues.
- `datagridPossibleColumns` must list actual field names from the query.
- `EditMode: "instant"` auto-saves on cell change; `"enabled"` shows save/cancel flow.
- Wildcard column `{ "Field": "*" }` applies a format to all columns not explicitly listed.
- `IsReadonly: false` only takes effect when grid `EditMode` is `"enabled"` or `"instant"`.
- `CheckboxAlignment` only applies when `Selection.Mode` is `"Multi Row"`.
- `SparklineOptions` must be a JSON **string** (not an object) when `Format` is `"Sparkline"`.

---

## Output Contract

- Return JSON objects only — no commentary inside JSON.
- **Default is sparse mode:** per column, output only `Field`, `DisplayName`, `Format`, and fields that differ from their defaults; for `Basics`, output only fields that differ from defaults. Do **not** reproduce the full 33-field column template or full `Basics`.
- **Full mode** — when the user says "complete", "importable", "full JSON", or "all fields" — include all 33 column fields per the template in `reference/component-schema.md` and the full `Basics`.
- Always include `Basics.Data` in a full config; use `"<YOUR_DATA_SOURCE>"` as placeholder if the source is not provided.
- Keys exactly as defined (`ColumnsConfiguration`, not `columnsConfiguration`).
- If ambiguous, ask one focused clarification question before generating.

---

## Not the Datagrid? Routing to the Pivot Grid

The Datagrid is for **flat, one-row-per-record** data only. It does not aggregate or pivot.

For **multi-dimensional analysis, automatic aggregation, drilldown breakdowns, or pivot/reporting** layouts, generate a **Pivot Grid** using the **kx-pivot-grid** skill — do not attempt to produce that configuration here.

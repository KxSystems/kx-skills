---
name: kx-dropdown
description: "Use this when the user wants a KX Dashboards dropdown or multi-select list for picking one or more values: symbol selectors, filter lists, dependent dropdowns, grouped items, or static option lists. Use kx-selectioncontrols for radio buttons or checkboxes and kx-datafilter for multi-condition filter-builder UIs."
requires:
  - kx-dashboard-core
---

# KX Dropdown Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the workflow, hazards, and output rules are here; the bulky JSON schema, field tables, data-source shapes, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full options schema, the `Basics` field reference table, and the single/multi/list ViewState patterns. |
| [reference/data-source-patterns.md](reference/data-source-patterns.md) | Wiring the list data source — static distinct query, multi-column, ViewState-parameterised cascade — plus the `Actions` pattern for publishing extra columns. |
| [reference/examples.md](reference/examples.md) | Eight worked NLQ → JSON examples for every dropdown shape. |

---

## When to Use This Skill

- User asks for a dropdown, combobox, or selector widget
- User wants a symbol / instrument / category filter that publishes a selected value to a ViewState
- User wants multiple selections (multi-select)
- User wants to populate a dropdown from a kdb+ table or query
- User wants to publish multiple column values on selection (e.g. `sym` AND `exchange` simultaneously)
- User wants grouped list items (e.g. symbols grouped by exchange)
- User wants a static option list (e.g. `Dark` / `Light` theme picker)
- User wants a cascading / dependent dropdown filtered by another selection

## When NOT to Use This Skill

**Do not use Dropdown to display a computed query result.** Dropdown is an input control for user selection — it is not a display widget.

| Scenario | Correct component |
|---|---|
| Query returns a single scalar (total count, last price, sum, avg) | **Text** — bind via `Data` + `Template` |
| Query returns a summary row with multiple metrics | **Text** — multi-column Handlebars template |
| Showing a live-updating KPI / stat tile | **Text** — with polling data source |
| Showing the current value of a ViewState | **Text** — via ViewState template interpolation |

Use the **kx-text** skill for all of these cases.

---

## ⚠️ Dropdown-Specific Hazards

1. **`SelectedObjectRouting` was removed in v4.3.1.** Never use it. To publish additional columns on selection, use `Actions` entries with `_Type: "map"` at the **options root level** (not inside `Basics`).
2. **`Data` must be a data binding or empty string — never `null`.** Use `{ "_dashboardsType": "data", "value": "<sourceName>" }` for data-driven; use `""` for static `Items`-only dropdowns.
3. **`SelectedValue` must always be a ViewState binding** — `{ "_dashboardsType": "viewstate", "value": "<vsName>" }`. Never a raw string.
4. **`DataSourceMapping.Value`** is the kdb+ column that is stored and published to `SelectedValue`. **`.Text`** is the column the user sees in the list. They may be the same column.
5. **`SelectAllByDefault` only takes effect when `MultiSelect: true`** — it is hidden and ignored otherwise.
6. **`dropdownPossibleValues`** must list the actual column names from the data source. Use `[""]` as a placeholder when columns are not yet known.
7. **`dropdownPossibleValuesWithEmpty`** is always `[""].concat(dropdownPossibleValues)`.
8. **`FilterData` is a plain ViewState name string** — not a binding object. Write `"FilterData": "myViewState"`, not `{ "_dashboardsType": "viewstate", "value": "..." }`.
9. **Actions for column routing must use `"Trigger": "Click"`** — other triggers are not supported on Dropdown.


---

## Workflow

1. **Confirm it is an input control, not a display widget.** If the dropdown would show a computed query result, stop and use **kx-text** instead (see When NOT to Use).
2. **Clarify inputs.** You need the table/columns and connection name for data-driven dropdowns, or the static option list. If ambiguous, ask one focused question before generating (see Output Contract).
3. **Declare the ViewState** for `SelectedValue` — `symbol`/`string` for single-select, `list` for multi-select (see `reference/component-schema.md` → ViewState Patterns).
4. **Wire the list data source** — static distinct, multi-column, or ViewState-parameterised cascade (see `reference/data-source-patterns.md`). Skip for static `Items`-only dropdowns (`Data: ""`).
5. **Build the component** — envelope + `Basics` (set `DataSourceMapping.Value`/`.Text`, `MultiSelect`, `GroupMapping`, `FilterData` as needed) + `Style`. Full shape in `reference/component-schema.md`.
6. **Publish extra columns** (if requested) via root-level `Actions` with `_Type: "map"`, `Trigger: "Click"` — never `SelectedObjectRouting` (see `reference/data-source-patterns.md`).
7. **Validate** against the Hazards above and the Output Contract below. Copy from `reference/examples.md` when a pattern matches.

---

## Output Contract

- Return JSON only — no prose inside JSON output.
- **Full component** → wrap in a widget object: `{ "id", "key": "BasicComponents", "containerId": null, "components": [], "widgets": [], "definitionId": "16", "hasOnSettingsChange": true, "options": { ... } }`.
- **Basics only** → return just the `Basics` object.
- Always include **all** `Basics` fields in every output — omitting any field leaves the component in an undefined state.
- `dropdownPossibleValues` must list actual column names from the data source. Use `[""]` when columns are unknown.
- `dropdownPossibleValuesWithEmpty` is always `[""].concat(dropdownPossibleValues)`.
- `SelectedValue` is always a ViewState binding — never a plain string.
- `Data` is a data binding for data-driven dropdowns — never `null`; use `""` for static-items-only dropdowns.
- If the user has not specified the table name, columns, or connection name, ask one focused clarification question before generating JSON.

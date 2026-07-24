---
name: kx-datepicker
description: "Use this when the user wants a KX Dashboards date or time picker: calendar date, datetime, timestamp, timespan, or month input bound to a ViewState. The picker mode is determined by the ViewState type bound to SelectedDate. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX DatePicker Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

`key: "BasicComponents"` · `definitionId: "15"` · `ComponentName: "DatePicker"` · `version: "v2.10.0"`

This skill uses **progressive disclosure**: the hazards, workflow, and output checklist are here; the bulky JSON schema, picker-mode/field tables, ViewState declarations, and worked examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full `Basics` schema, the picker-mode table, the `Basics` field reference, the ViewState declarations for each mode, and the complete DatePicker component object. |
| [reference/examples.md](reference/examples.md) | Copy-ready worked patterns — simple picker, full linked picker→datagrid, exact-vs-range query filters, LAD default, timespan input, and DefaultDate offset expressions. |

---

## ⚠️ Hazards — Read First

1. **`SelectedDate` must be a ViewState binding** — `{ "_dashboardsType": "viewstate", "value": "<vsName>" }`. The **type** of that ViewState controls which picker is rendered (date, datetime, timestamp, timespan, month). A bare string will not work.
2. **Declare the ViewState with the correct `_type`** — the picker mode is inferred from it. Use `"date"`, `"datetime"`, `"timestamp"`, `"timespan"`, or `"month"`.
3. **Always set a non-null ViewState `_default`.** The ViewState `_default` is the reliable way to set an initial date — it works regardless of whether a `Data` source is bound and fires before any query executes. Never use `"_default": ""`: a `null` ViewState does not count as a "change" on the `null` → first-value transition, so dependent queries that use it as a parameter will not execute until the user picks a *second* date. Set a known-good date string (e.g. `"2020-01-02"`), or the string `"LAD"` when a data source is bound, so the query has a value to run with on initial load.
4. **`DefaultDate` (`LAD`/`FAD` expressions) only activates when `Data` is bound.** These expressions are resolved against the available dates returned by the data source. Without a `Data` binding, `DefaultDate` has no effect — set the initial value via the ViewState `_default` instead.
5. **`Data` source must return kdb+ temporal types** — use `select distinct Date from <table>` (not `select Date`) to avoid duplicate entries in the picker calendar. The source should return a single column of `date`, `datetime`, `timestamp`, `month`, or `timespan` values.
6. **Data source key names are whitespace-sensitive** — `"AvailableDates"` and `"AvailableDates "` are different keys. The `Data` binding on the component must exactly match the key declared in the `data` block, including any trailing spaces. Always verify both sides match.
7. **`definitionId` is `"15"`** — not `"33"` (TextInput) or `"17"` (Text).
8. **`width` and `labelWidth` are in pixels** — both are required for correct rendering; omitting them leaves the layout unsized.
9. **QueryParam `value` uses `<%vsName%>` syntax** — the ViewState reference in `_queryParams` must be written as `"<%vsName%>"` (plain angle brackets). Do not HTML-encode the brackets.

---

## Workflow

1. **Pick the picker mode.** Decide date / datetime / timestamp / timespan / month — this is driven entirely by the ViewState `_type` (see the picker-mode table in `reference/component-schema.md`).
2. **Declare the ViewState** for `SelectedDate` with the correct `_type` and a **non-null** `_default` (see Hazards #2, #3 and the ViewState declarations in `reference/component-schema.md`).
3. **Decide whether to constrain selectable dates.** If the user wants only real dates from a table, wire a `Data` source returning a `select distinct` temporal column, and set `DefaultDate` (e.g. `"LAD"`). Otherwise leave `Data: ""` and rely on the ViewState `_default` (Hazards #4, #5).
4. **Build the component** — envelope + `Basics` (`SelectedDate`, `Data`, `DefaultDate`, `Label`, `width`, `labelWidth`). Full shape in `reference/component-schema.md`.
5. **Wire dependents** (if requested) — declare a filtered data source that reads the ViewState via a `<%vsName%>` query param, and bind the target widget to that source, not to the picker directly (Hazard #9; see the linked pattern in `reference/examples.md`).
6. **Validate** against the Hazards above and the Output Checklist below. Copy from `reference/examples.md` when a pattern matches.

---

## Output Checklist

Before returning the JSON, verify:

- [ ] `SelectedDate` is a ViewState binding — never a plain string.
- [ ] The ViewState is declared with the `_type` matching the intended picker mode.
- [ ] The ViewState has a **non-null** `_default` (a date string, or `"LAD"` when a data source is bound) — never `""`.
- [ ] `DefaultDate` (`LAD`/`FAD`) is only used when a `Data` source is bound; otherwise omit it and rely on `_default`.
- [ ] If `Data` is bound, its key exactly matches the data source key in the `data` block (including trailing whitespace).
- [ ] Data source queries use `select distinct` on a single temporal column.
- [ ] `definitionId` is the string `"15"`.
- [ ] `width` and `labelWidth` are present and in pixels.
- [ ] Any dependent query param references the ViewState as `"<%vsName%>"` (plain angle brackets, not HTML-encoded).
- [ ] Return JSON only — no prose inside JSON output.

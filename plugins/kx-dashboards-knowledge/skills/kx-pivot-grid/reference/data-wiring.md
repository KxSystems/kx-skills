# kx-pivot-grid — Data Source & ViewState Wiring

> The pivot data source block, ViewState wiring (Breadcrumbs coupling), and the build → diff-restore default-reconciliation order. Back to [SKILL.md](../SKILL.md).

**Contents:** Pivot Data Source · ViewState Wiring · Default Reconciliation (build → diff-restore)

---

## Pivot Data Source

The Pivot Grid is fed by a pivot data source under the dashboard root `data` object. A pivot query sets a specific attribute set. **Do not implement aggregation in the query string**; instead use the pivot attributes below. Use the sample data source's **`_layout`** as the template for pivot data sources. The non-pivot data-source basics (`_dataType`, `_subscriptionType`, `_connection`, `_autoExecute`/`_autoExec`, etc.) come from **kx-dashboard-core**.

Pivot-specific attributes (baseline values shown; copy the full block from `reference/pivot-grid-baseline.json`):

```jsonc
{
  // ... core data-source keys (see kx-dashboard-core) ...
  "_queryString": "dfxTrade",         // returns all columns of the source table; no aggregation in the query
  "_pivotSource": "query",            // VERBATIM-LOCK baseline
  "_pivotType": "server",             // VERBATIM-LOCK baseline
  "_table": "",                       // baseline ""
  "_aggregateCols": ["size","price"], // ◆ aggregate columns
  "_aggregateFns":  ["avg","sum"],    // ◆ one per aggregate col: "avg"|"sum"|"first"|"last"|"min"|"max"|"count"
  "_aggregateLabels": ["",""],        // ◆ optional friendly label per aggregate col (same index)
  "_breakdownCols": ["sym","src"],    // ◆ breakdown (group/pivot/drilldown) columns — see § ViewState Wiring
  "_columnLabel": "",                 // baseline ""
  "_aggFn": "avg",                    // baseline "avg"
  "_topX": "",                        // baseline ""
  "_ordering": "",                    // baseline ""
  "_from": "",                        // baseline ""
  "_to": "",                          // baseline ""
  "_layout": [ /* template — copy verbatim from baseline */ ]
}
```

**Authoring rules:**

- For each aggregate column in `_aggregateCols` there is a corresponding function in `_aggregateFns` and a corresponding label in `_aggregateLabels` at the **same index**.
- Aggregate function values: `"avg"` | `"sum"` | `"first"` | `"last"` | `"min"` | `"max"` | `"count"`. If the function is described as "average", use `"avg"`. **If the function is not specified, use `"avg"`.**
- A requested column whose role is described with terms like "group", "group by", "pivot", "drill down" (or similar meaning) belongs in **`_breakdownCols`**.

---

## ViewState Wiring

Whenever an RDS resolves to a viewstate ref `{ "_dashboardsType": "viewstate", "value": "<viewStatePathName>" }`, that `<viewStatePathName>` **must exist** in the dashboard root `viewState` object. If absent, create it. The entry structure is defined by **kx-dashboard-core**. **Default for a newly created viewstate when not otherwise specified:** `{ "_viewType": true, "_type": "symbol", "_default": "" }`.

### Focus viewstate (Pivot Grid ↔ Breadcrumbs `Basic.Path`)

`Basics.Focus` may use a **symbol** viewstate (comma-separated values per entry) or a **list** viewstate (itemized values).

```json
// symbol form
"<vsName>": { "_viewType": true, "_type": "symbol", "_default": "" }
// list form
"<vsName>": { "_viewType": true, "_type": "list", "_default": [], "_listtype": "symbol" }
```

### Breakdown viewstate (`_breakdownCols` ↔ Breadcrumbs `Basic.Breakdown`)

The data source `_breakdownCols` may be a **literal array** OR a viewstate ref:

```json
"_breakdownCols": { "_dashboardsType": "viewstate", "value": "<viewStatePathName>" }
```

The breakdown viewstate is a **list** type:

```json
"<vsName>": { "_viewType": true, "_type": "list", "_default": ["sym","src"], "_listtype": "symbol" }
```

**Breadcrumbs coupling (hard requirement):**

1. If a Breadcrumbs component is linked, set the Pivot Grid `Basics.Focus` to a viewstate and set the Breadcrumbs `Basic.Path` to the **same** viewstate.
2. If a Breadcrumbs is linked, the data source `_breakdownCols` **must** be the **same ViewState descriptor object** that the Breadcrumbs `Basic.Breakdown` references — **never a literal array**. A literal array is fine only while **no** Breadcrumbs is linked; the moment one is added, promote `_breakdownCols` to the ViewState form.

> Cross-check with **kx-breadcrumbs**: `Basic.Path` ↔ `Basics.Focus` (symbol or list), `Basic.Breakdown` ↔ `_breakdownCols` (list). A `Breakdown`/`Focus` ref without its matching counterpart is a silent wiring bug.

---

## Default Reconciliation (build → diff-restore)

The sample is **not authoritative** for keys this skill defines. Three keys have conditional defaults that the sample value contradicts or that depend on other resolved values. Build the component by this order to avoid silently inheriting sample values:

1. **Start from the baseline** (`reference/pivot-grid-baseline.json`) so every verbatim-lock value is byte-correct.
2. **Resolve RDS keys in dependency order**, recomputing — never copying — these three:
   - `Basics.Drilldown` = (`Basics.Focus` is a viewstate) ? `true` : `false`.
   - `Basics.ShowExpandedSummary` = (`Basics.Drilldown`) ? `false` : `true`.
   - `Style.ExpandedSummaryStyle` = (`Basics.ShowExpandedSummary`) ? `true` : `false`.
   - Also recompute `Basics.DrilldownInputArea` from `Selection.RowSelectionMode`.
3. **Diff-restore:** compare every **non-RDS** key against the baseline and restore any that drifted. Confirm no `◆` placeholder and no `//` comment survived into the JSON.

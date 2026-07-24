---
name: kx-breadcrumbs
description: "Use this when the user wants a KX Dashboards breadcrumb trail for hierarchical drilldown or drill-through navigation, especially with pivot grids or chart-based exploration. Use kx-tabs for tabbed navigation instead of breadcrumbs."
requires:
  - kx-dashboard-core
---

# KX Dashboards — Breadcrumbs Component

> **Dependency:** requires `kx-dashboard-core`. Load it **first** — it owns the dashboard envelope, screen, widget wrapper, ViewState entry structure, binding patterns, UUID rules, and the deploy paths. This skill only specifies the Breadcrumbs `options` block and its ViewState wiring.
>
> **Precedence:** where this skill and any other skill disagree about the Breadcrumbs component, **this skill wins.**

---

## Notation Legend — read before emitting anything

The `options` object below is presented as **one annotated shape per top-level section**. Every documented key appears **exactly once**, inline in its section, as a slot. There is no separate skeleton and no separate key-reference list — the annotation *is* the reference.

Each slot is one of two kinds:

- **`◆` Rule-Driven Slot (RDS).** The `◆` symbol marks a value that this skill's documented rule (or an explicit user instruction) determines. **Absent a documented reason or user instruction, emit the baseline value** shown in the sample JSON, recorded in the slot's inline annotation. Each RDS is annotated inline with: its UI label, type, allowed values, a one-line rule/description summary, its **baseline**, and any **Default Override**.
- **VERBATIM-LOCK constant (printed literally, no `◆`).** Emit the exact value shown — every number, string (including `""`), boolean, and nested object — **unchanged**. The sample is **not** a license to substitute a "similar", "reasonable", "rounded", or "tidied" value.

**Classification rule:** a key is an RDS **if and only if** it has a documented rule in this skill. Every other key — and every key inside an otherwise-undocumented nested block (`Alignment`, `format`, `Basic.DataSourceMapping`) — is verbatim-lock.

**ViewState-ref objects.** Inside any `{ "_dashboardsType": "viewstate", "value": ... }` object, `"_dashboardsType"` is **always verbatim-lock** and **only `"value"` is an RDS**.

> The annotated shapes use `//` comments and the `◆` symbol for documentation **only**. Emitted KX JSON contains **no comments and no `◆`** — replace each `◆` with the resolved value (baseline unless a rule/user changes it).

---

## Component Identity

| Field | Value |
|---|---|
| `key` | `"Breadcrumbs"` |
| `definitionId` | `"19"` |
| Category | Input |

The full component object (`id`, `layout`, `component`, `containerId`, `components`, `widgets`, …) comes from the **kx-dashboard-core** widget wrapper. For Breadcrumbs the wrapper fields are verbatim-lock except the component `id` (a fresh UUID per core's UUID rules):

```jsonc
"component": {
  "id": "<uuid>",        // per kx-dashboard-core UUID rules
  "key": "Breadcrumbs",        // VERBATIM-LOCK
  "options": { /* see below */ },
  "containerId": null,         // VERBATIM-LOCK
  "components": [],            // VERBATIM-LOCK
  "widgets": [],              // VERBATIM-LOCK
  "definitionId": "19",        // VERBATIM-LOCK
  "hasOnSettingsChange": true  // VERBATIM-LOCK
}
```

---

## `options` — annotated shape

```jsonc
"options": {
  "version": "4.7.7",          // VERBATIM-LOCK (undocumented)
  "Basic":     { /* see § Basic */ },
  "Style":     { /* see § Style */ },
  "Alignment": { /* see § Alignment — verbatim-lock block */ },
  "format":    { /* see § format — verbatim-lock block */ }
}
```

### § Basic

```jsonc
"Basic": {

  // Name — UI "Name" — string
  // Friendly label shown when the author views the dashboard's component graph.
  // Rule: if multiple Breadcrumbs components exist in one dashboard, names must be
  // unique — append a sequence-number suffix ONLY when a duplicate name would result.
  "Name": ◆,   // ◆ RDS · baseline ""

  // Path — UI "Path" — type: "" | { "_dashboardsType":"viewstate", "value":"<viewStatePathName>" }
  // Links components. When using Breadcrumbs for navigation (charts, Pivot Grid),
  // set that target component's Basics.Focus to the SAME viewstate. The Path
  // viewstate's data type may be "symbol" (comma-separated values per entry) or
  // "list" (itemized values). If unlinked, emit "" for the whole key.
  "Path": {                          // ◆ RDS (union) · baseline = this object
    "_dashboardsType": "viewstate",  // VERBATIM-LOCK
    "value": ◆                       // ◆ RDS · baseline "pivotPath" · see § ViewState Wiring
  },

  // Breakdown — UI "Visible Breadcrumbs" — type: "" | { "_dashboardsType":"viewstate", "value":"<viewStatePathName>" }
  // A View State Parameter of LIST data type. Its values are the sequential list of
  // visible breadcrumbs, in display order. Rule: the created viewstate must be type
  // list. With a Pivot Grid / pivot query, use the viewstate bound to the pivot data
  // source's "_breakdownCols". When this key is set, VERIFY the matching pivot data
  // source has been switched to its ViewState shape (cross-check with kx-pivot-grid).
  "Breakdown": {                     // ◆ RDS (union) · baseline = this object
    "_dashboardsType": "viewstate",  // VERBATIM-LOCK
    "value": ◆                       // ◆ RDS · baseline "breadcrumbList" · list viewstate · see § ViewState Wiring
  },

  // UsePathForAlternativeText — UI "Use Path For Alternative Text" — boolean
  // Checked: breadcrumb text comes from Path when a corresponding value exists, else
  // from Visible Breadcrumbs. Unchecked: text comes solely from the Visible Breadcrumbs
  // viewstate. To show data-source column names in the breadcrumbs, leave this unchecked.
  "UsePathForAlternativeText": ◆,    // ◆ RDS · baseline true

  // AllowReordering — UI "Allow Reordering" — boolean
  // Checked: the end user can reorder breadcrumbs via drag-and-drop or the Edit
  // Breadcrumbs dialog. Gates ShowEditButton, Data, and BreadcrumbList (below).
  "AllowReordering": ◆,              // ◆ RDS · baseline true

  // ShowEditButton — UI "Show Edit Button" — boolean
  // Checked: an Edit button appears left of the Home icon.
  // Availability: only when AllowReordering is true.
  "ShowEditButton": ◆,               // ◆ RDS · baseline false

  // Data — UI "Breadcrumb Data Source" — type: "" | { "_dashboardsType":"data", "value":"<dataSource>" }
  // Supplies the COMPLETE set of available breadcrumb elements. The first column of
  // each returned row becomes a breadcrumb element. Supersedes BreadcrumbList when set.
  // Availability: only when AllowReordering is true.
  "Data": ◆,                         // ◆ RDS · baseline "" · when set: { "_dashboardsType":"data" (LOCK), "value": ◆ }

  // DataSourceMapping — VERBATIM-LOCK block (no documented keys). Emit exactly.
  "DataSourceMapping": {
    "Value": "",
    "Text": ""
  },

  // BreadcrumbList — UI "Available Breadcrumbs" — type: "" | { "_dashboardsType":"viewstate", "value":"<viewStatePathName>" }
  // Alternative to Data: a LIST-type viewstate giving the complete set of available
  // breadcrumb elements. If Data is defined, Data supersedes this. Availability: only
  // when AllowReordering is true.
  // ⚠ Sample/spec discrepancy: the documented type is ("" | viewstate-ref) but the
  // sample baseline value is [] (empty list). Baseline wins absent a rule — emit [].
  // Do NOT silently "tidy" [] into "". Set a list viewstate ref only on rule/user request.
  "BreadcrumbList": ◆,               // ◆ RDS · baseline []

  // Theme — UI "Theme" — enum: "Light" | "Dark"
  "Theme": ◆                         // ◆ RDS · baseline "Dark" · Default Override "Dark" (equals baseline)
}
```

### § Style

```jsonc
"Style": {
  // advanced — UI "Advanced CSS" — string (CSS) — custom CSS for advanced styling
  "advanced": ◆,     // ◆ RDS · baseline ""
  // cssClasses — UI "CSS Classes" — string — custom CSS classes applied to the component
  "cssClasses": ◆    // ◆ RDS · baseline ""
}
```

### § Alignment — VERBATIM-LOCK block

No documented keys. Semantics live in **kx-dashboard-core**; the values here are the verbatim baseline. Emit exactly:

```json
"Alignment": {
  "paddingLeft": 0,
  "paddingRight": 0,
  "paddingTop": 0,
  "paddingBottom": 0,
  "innerPaddingLeft": 0,
  "innerPaddingRight": 0,
  "innerPaddingTop": 0,
  "innerPaddingBottom": 0,
  "titlePaddingLeft": 0,
  "titlePaddingRight": 0,
  "titlePaddingTop": 7,
  "titlePaddingBottom": 7
}
```

### § format — VERBATIM-LOCK block

No documented keys. Semantics live in **kx-dashboard-core**; the values here are the verbatim baseline. Emit exactly:

```json
"format": {
  "titleFontSize": 16,
  "titleHorizontal": "Center",
  "titleShadow": false,
  "tileBorderWidth": 0,
  "tileBorderRounding": 0,
  "tileBorderColor": "#000000",
  "tileBackgroundColor": "#000000",
  "tileTransparentBackground": true,
  "tileShadow": false
}
```

---

## ViewState Wiring

Whenever an RDS resolves to a viewstate ref `{ "_dashboardsType": "viewstate", "value": "<viewStatePathName>" }`, that `<viewStatePathName>` **must exist** in the dashboard root `viewState` object. If it is absent, create it. The entry structure is defined by **kx-dashboard-core**.

**Defaults for newly created breadcrumb viewstates:**

- **Symbol** (e.g. the `Path` viewstate, when not otherwise specified):
  ```json
  "<viewStatePathName>": { "_viewType": true, "_type": "symbol", "_default": "" }
  ```
- **List** (required for the `Breakdown` / "Visible Breadcrumbs" viewstate, and for any list-type `BreadcrumbList` viewstate):
  ```json
  "<viewStatePathName>": { "_viewType": true, "_type": "list", "_default": [], "_listtype": "symbol" }
  ```

**Baseline viewstates from the sample** (present because `Path` → `pivotPath` and `Breakdown` → `breadcrumbList`):

```json
"pivotPath":     { "_viewType": true, "_default": "", "_type": "symbol" },
"breadcrumbList":{ "_viewType": true, "_type": "list", "_default": ["item1","item2","item3"], "_listtype": "symbol" }
```

> A freshly created `breadcrumbList`-style viewstate uses `"_default": []`; the sample's `["item1","item2","item3"]` is illustrative seed data — only reproduce it verbatim if you are reproducing the sample.

**Linking invariants:**

1. The target navigation component (chart, Pivot Grid, …) must set its **`Basics.Focus`** to the **same** viewstate referenced by this component's `Basic.Path`.
2. When `Basic.Breakdown` is set against a pivot, use the viewstate bound to the pivot data source's **`_breakdownCols`**, and confirm that pivot data source has been switched to its **ViewState shape** (see kx-pivot-grid). A `Breakdown` ref without the matching pivot ViewState shape is a silent wiring bug.

---

## Pre-flight checklist (Breadcrumbs-specific)

Before emitting, confirm:

- [ ] `key` = `"Breadcrumbs"`, `definitionId` = `"19"`, `hasOnSettingsChange` = `true`.
- [ ] Every `◆` replaced with a resolved value; **no `◆` or `//` comments remain** in the JSON.
- [ ] Every verbatim-lock value (`version`, `DataSourceMapping`, `Alignment`, `format`, all locked sub-keys) emitted **exactly** as shown — nothing rounded or tidied.
- [ ] `BreadcrumbList` baseline emitted as `[]` (not `""`) unless a rule/user set a viewstate ref.
- [ ] `ShowEditButton`, `Data`, `BreadcrumbList` only meaningfully set when `AllowReordering` is `true`.
- [ ] Every viewstate referenced by `Path` / `Breakdown` / `BreadcrumbList` exists in root `viewState` (`Breakdown` viewstate is `_type: "list"`).
- [ ] Linked component's `Basics.Focus` matches `Basic.Path`'s viewstate; pivot `_breakdownCols` switched to ViewState shape if `Breakdown` is used.
- [ ] Unique `Name` (sequence suffix only on collision) if multiple Breadcrumbs exist.

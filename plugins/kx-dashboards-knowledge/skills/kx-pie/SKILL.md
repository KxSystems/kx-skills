---
name: kx-pie
description: "Generate a KX Dashboards PieJS component: pie or donut chart of proportional segments (key=PieJS, definitionId=1009). Use for: pie chart, donut chart, doughnut, share-of-total, proportional segments, percentage breakdown, part-to-whole, categorical composition, market share, portfolio allocation. DataSet.Label is the categorical column and DataSet.Layers[n].Segment is the numeric value column; DonutRatio > 0 makes it a donut. Use kx-chartgl for line/bar/area charts and kx-gauge for KPI-style gauges. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX PieJS Component — Pie / Donut Chart

`key: "PieJS"` · `definitionId: "1009"` · `version: "v2.3.0.1"`

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the hazards, workflow, field summary, and output checklist are here; the full JSON schema blocks, field tables, the 30-value Animations easing list, and the worked example live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The canonical `options` object plus every sub-section schema and field table — `Basics`, `DataSet`, `Layers`, `HighlightRules`, `Legend`, `InnerLabel`, `Style`, the full `Animations` easing list, `Padding`, and `FileExport`. |
| [reference/examples.md](reference/examples.md) | The copy-ready Minimal Working Example (donut chart). |

---

## ⚠️ PieJS-Specific Hazards

- **`DataSet.Layers`** is an **array** — each layer maps one data column to a pie segment. At least one layer is required.
- **`DataSet.Label`** is the categorical column (segment labels). **`DataSet.Layers[n].Segment`** is the numeric value column. They must be different columns.
- Set `DonutRatio: 0` for a standard pie chart; any value above `0` makes it a donut.
- **`possibleLabels` / `possibleColumns`** are auto-populated by the UI — always emit as `[]` or `[""]` when building from scratch.
- `Basics.Focus` and `Basics.Selected` expect **ViewState paths** (not literal values).
- `Style.chartBarColors` drives the segment colour palette. Supply at least as many colours as there are unique label values, or segments will cycle and repeat.
- `HighlightRules` override the layer colour for matching rows — evaluated in order, first match wins.

---

## Workflow

1. **Confirm pie vs donut.** Set `DataSet.DonutRatio: 0` for a solid pie, or a value 1–100 for a donut. If the user wants a KPI/gauge, stop and use **kx-gauge**; for line/bar/area, use **kx-chartgl**.
2. **Identify the columns.** `DataSet.Label` = the categorical column (segment labels); `DataSet.Layers[0].Segment` = the numeric value column. They must be different columns.
3. **Build the component** — envelope + `options` with `Basics`, `DataSet`, `Legend`, `Style`, `InnerLabel`, `Padding`, `Animations`, `FileExport`. Full schema and field tables in `reference/component-schema.md`.
4. **Wire the palette.** Populate `Style.chartBarColors` with at least as many colours as there are unique label values (see Hazards).
5. **Add interactivity if requested** — `Basics.Focus`/`Basics.Selected` ViewState paths for cross-filtering, and `Basics.Actions` for click/hover behaviour (see **kx-actions**).
6. **Match the example.** Copy the Minimal Working Example from `reference/examples.md` and adapt it.
7. **Validate** against the Hazards above and the Output Checklist below.

---

## Sub-Sections — Field Summary

| Section | Purpose |
|---|---|
| `Basics` | Data source, theme, Focus/Selected ViewState, click actions |
| `DataSet` | Label column, donut ratio, rotation, data layers |
| `DataSet.Layers` | Array of value columns with colours and conditional formatting |
| `Legend` | Legend display, position, interaction mode |
| `InnerLabel` | Segment labels, donut centre text, value formatting |
| `Style` | Colour palette (`chartBarColors`), advanced CSS, tooltip template |
| `Animations` | Chart animation easing and duration |
| `Padding` | Chart canvas padding |
| `FileExport` | CSV / Excel / PNG export buttons |

---

## Output Checklist

Before returning the JSON, verify:

- [ ] `key` is `"PieJS"` and `definitionId` is the string `"1009"`
- [ ] `DataSet.Layers` is a non-empty array with at least one layer
- [ ] `DataSet.Label` (categorical) and each `Layers[n].Segment` (numeric) are **different** columns
- [ ] `DonutRatio` is `0` for a pie, or 1–100 for a donut
- [ ] `Style.chartBarColors` has at least as many entries as unique label values
- [ ] `Basics.Focus` / `Basics.Selected` are ViewState paths, not literal values
- [ ] `possibleLabels` / `possibleColumns` emitted as `[]` or `[""]`
- [ ] All `id` fields are unique UUIDs across the dashboard

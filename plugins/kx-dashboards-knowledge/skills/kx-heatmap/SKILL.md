---
name: kx-heatmap
description: "Generate KX Dashboards Heatmap/Treemap component: hierarchical treemap visualisation (key=Heatmap, componentName=Treemap, definitionId=5). Use for: treemap, heatmap, treechart, market map, portfolio map, proportional area chart, group-by hierarchy, colour-coded tiles, node size/colour. Data[] layers define display column, size column, colour column, and highlight rules. ColorPalette drives tile colouring. GroupBy creates nested parent/child hierarchy. Not for a heatmap layer on an X/Y chart (use kx-chartgl's Heatmap layer) or a geographic heatmap on map tiles (use kx-offline-map); this is a standalone hierarchical treemap/heatmap of coloured tiles. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX Heatmap (Treemap) Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

`key: "Heatmap"` · `definitionId: "5"` · `componentName: "Treemap"` · `version: "v2.3.0.1"`

A proportional tile (treemap) visualisation. Tile area is proportional to a size column; tile colour is driven by a separate colour column or a fixed palette.

This skill uses **progressive disclosure**: the identity, hazards, workflow, and output checklist are here; the bulky component JSON, per-section field tables, and worked patterns live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The full component JSON plus the per-section field tables — `Basics`, `Data[]` layer definitions and `HighlightRules`, `ColorPalette`, `NodeLabel`, `GroupBy`, `Tooltip`, and `Animation`. |
| [reference/examples.md](reference/examples.md) | Copy-ready patterns — market map (size by market cap, colour by % change), sector-grouped treemap, and fixed-colour portfolio composition. |

---

## ⚠️ Hazards — Read First

1. **`key` is `"Heatmap"` but it renders a Treemap** — the component is named Treemap internally (`componentName: "Treemap"`) and uses ECharts treemap. There is no traditional heatmap matrix; this is a proportional tile/treemap component.
2. **`Data[]` is an array of layer objects, not a data source** — `Basics.Data` is the data source binding. `Data[]` defines how to use columns from that source (`Column` = display/label column, `Size` = tile size column, `Color` = colour column). At minimum one `Data[]` entry is required.
3. **`Basics.SelectedAttr` specifies which column is published on click** — `Selected` receives the value of `SelectedAttr` column from the clicked node. If `SelectedAttr` is blank, nothing is published to `Selected`.
4. **`ColorType: "Scaled"` or `"Gradient"` uses the `Color` column** — other types (`Fixed`, `Iterative`, `Iterative Children`) use `FixedColor` or cycle through `ColorScheme`.
5. **`GroupBy.UseGroupBy: true` creates a hierarchical treemap** — `GroupByColumns` defines the parent group column. Each group gets a header bar; `ShowHeader: true` is required to see the label.
6. **`NodeLabel.customLabel` is plain-text only** — it is a Handlebars template rendered as canvas text by ECharts. HTML elements (`<br>`, `<b>`, `<span>`, etc.) are **not** rendered; they appear as literal characters. Use a plain separator such as a space or ` | ` between values (e.g., `"{{sym}} | {{pctChange}}%"`).
7. **`version` in the JSON must be `"v2.3.0.1"`** — this is the current version applied after all upgrades.

---

## Workflow

1. **Confirm it is a treemap, not something else.** This component tiles rows proportionally — it is not an X/Y-chart heatmap layer (use kx-chartgl) or a geographic heatmap (use kx-offline-map). Component identity (`key`, `definitionId`, `componentName`, `version`) is in the line above.
2. **Wire the data source.** Set `Basics.Data` to the data source that returns the rows to tile (each row becomes one node), and set `SelectedAttr` to the column published to `Selected` on click. Field notes in `reference/component-schema.md` → Basics.
3. **Define the `Data[]` layer.** Add one layer object mapping `Column` (label), `Size` (tile area), and `Color` (colour scaling), plus any `HighlightRules`. See `reference/component-schema.md` → Data[].
4. **Choose the colouring.** Set `ColorPalette.ColorType` and the matching fields — `Color`-column-driven (`Scaled`/`Gradient`/`Gradient Percentage`) vs palette-driven (`Fixed`/`Iterative`/`Iterative Children`). See `reference/component-schema.md` → ColorPalette.
5. **Label and group.** Configure `NodeLabel` (remember `customLabel` is plain-text only) and, for a hierarchy, `GroupBy` with `ShowHeader: true`. Add `Tooltip` and `Animation` as needed. All in `reference/component-schema.md`.
6. **Validate** against the Hazards above and the Output Checklist below. Copy the closest shape from `reference/examples.md` when it matches the request.

---

## Output Checklist

Before returning the JSON, verify:

- [ ] `key` is `"Heatmap"` and `definitionId` is the string `"5"`.
- [ ] `options.version` is `"v2.3.0.1"`.
- [ ] `Basics.Data` is a data binding `{ "_dashboardsType": "data", "value": "<source>" }`.
- [ ] `Basics.Selected` is a ViewState binding and `SelectedAttr` names the column to publish on click.
- [ ] `Data[]` has at least one layer with `Column`, `Size`, and (if colour-scaled) `Color` set.
- [ ] `ColorPalette.ColorType` matches its inputs — `Scaled`/`Gradient` use the `Color` column; `Fixed`/`Iterative` use `FixedColor`/`ColorScheme`.
- [ ] `NodeLabel.customLabel` contains no HTML — plain separators only.
- [ ] If a hierarchy is requested, `GroupBy.UseGroupBy` is `true` with `GroupByColumns` and `ShowHeader: true`.
- [ ] All `id` fields are unique UUIDs across the dashboard.

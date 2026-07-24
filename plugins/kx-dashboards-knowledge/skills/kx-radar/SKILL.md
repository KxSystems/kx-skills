---
name: kx-radar
description: "Use this when the user wants a KX Dashboards radar or polar-area chart for comparing dimensions or categories. Use it for radial comparison visuals; use kx-chartgl for standard chart types such as line, bar, or candlestick."
requires:
  - kx-dashboard-core
---

# KX Radar Chart

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, deployment, and the pre-flight checklist.

This skill uses **progressive disclosure**: the workflow, hazards, and output rules are here; the bulky JSON schema, config tables, mapping rules, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/generate-config.md](reference/generate-config.md) | `generate.js` `componentType: "radar"` config keys — quick start, the full config-key table, and the `layers[]` object shape. |
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full `options` envelope (`Basics`, `DataSet`, `Legend`, `ticks`, `Tooltip`, `ColorPallette`, `FileExport`), plus the flip-select wide-table pattern. |
| [reference/mapping.md](reference/mapping.md) | The NL → JSON mapping table, named-colour → hex list, and the valid easing values. |
| [reference/examples.md](reference/examples.md) | Six worked NLQ → radar config few-shot examples to copy from. |
| [reference/nlx-tests.md](reference/nlx-tests.md) | Maintainer NLX regression queries to retest on every MR that changes this skill. |

---

## ⚠️ Radar Hazards

1. **`DataSet.Radar`** is the axis/label column (string or symbol), **not** a data series.  
   Every `DataSet.Layers[n].Data` is a separate numeric series drawn on top.
2. **`AngleLineOpacity`** is hidden in the Properties UI when `ChartType = "polarArea"` but **must still be present** in the JSON — omitting it breaks upgrades.
3. **Dark theme only changes `ticks` colours.** `RadarColor`, `RadarColorAngle`, and `Legend.LabelColor` default to `"#ffffff"` which works on both themes — do **not** change them for dark theme.
4. **`UseColor: true` on a layer enables colour-palette mode** (per data point), overriding the solid `Color` fill. Set it on all layers when colour palette is requested.
5. **`possibleColumns` and `possibleLabels` must match the QUERY OUTPUT columns, not the raw table columns.**  
   A query like `select Depart:sum Depart by State from USAirports` outputs `["State","Depart"]` — use those, not all USAirports columns. When the query is derived at generation time, inspect the SELECT clause to determine the output columns. Failure to do this leaves `DataSet.Radar = ""` and the chart does not render.
6. **`DataSet.Radar` must always be a non-empty string.** If the prompt does not name the axis column explicitly, infer it: the first string/symbol column in the query output is the axis. Every remaining numeric column becomes a layer. An empty `DataSet.Radar` silently prevents the chart from drawing — no error is shown.
7. **`Format: "General"` ignores `Precision`** — use `"Number"` or `"Formatted Number"` to enforce decimal places.


---

## Workflow

1. **Determine the query output columns first.** `DataSet.Radar` and every layer `Data` must be actual query-output column names — inspect the SELECT clause, not the raw table (see Hazards 5–6). For wide numeric tables, use the flip-select `Property`/`Value` pattern in `reference/component-schema.md`.
2. **Pick the axis and series.** The first string/symbol output column is the axis (`radarColumn` → `DataSet.Radar`); every remaining numeric column becomes a layer.
3. **Map the request to config.** Translate the NL phrasing (theme, chart type, legend, ticks, animation, colours, export, click-select) using the table in `reference/mapping.md`.
4. **Generate via generate.js** with `componentType: "radar"` and the config keys / `layers[]` shape in `reference/generate-config.md`, or hand-build the component JSON from `reference/component-schema.md`.
5. **Copy from a matching example** in `reference/examples.md` when a pattern fits.
6. **Validate** against the Hazards above and the Validation Checklist below before returning JSON.

---

## Validation Checklist

Before returning any Radar JSON, verify:

- [ ] `key` is `"Radar"` and `definitionId` is `"1008"`
- [ ] `options.version` is `"v2.12.0.1"`
- [ ] `Basics.ChartType` is `"radar"` or `"polarArea"` only
- [ ] `DataSet.Radar` is a non-empty string matching the axis column
- [ ] `DataSet.Layers` has at least one item; every item has all 8 fields
- [ ] `Layers[n].PointStyle` is one of the 11 enum values (including `""`)
- [ ] `Layers[n].PointRadius` is 1–10; `Layers[n].ColorOpacity` is 1–100
- [ ] `DataSet.AngleLineOpacity` is present even for `polarArea`
- [ ] `Legend.Position` is `"top"`, `"bottom"`, `"left"`, or `"right"`
- [ ] `Animations.Easing` is one of the 30 valid easing values
- [ ] `ticks.Format` is one of the 5 allowed format strings
- [ ] `ticks.Precision` is 0–10; ignored unless `Format` is `"Number"` or `"Formatted Number"`
- [ ] `FileExport.ScreenshotButton` is `"Export Png"`, `"Copy to Clipboard"`, or `"Export Png & Copy to Clipboard"`
- [ ] `ColorPallette.chartBarColors` has 10 `{ "type": "#rrggbb" }` entries
- [ ] `possibleColumns` and `possibleLabels` list all actual column names from the query
- [ ] `Tooltip.advancedTooltip` uses the standard Handlebars template (unmodified unless asked)
- [ ] `id` = `hash` = filename stem (enforced by `generateDashboard` / `makeRadarWidget`)


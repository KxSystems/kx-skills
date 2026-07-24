---
name: kx-chartgl
description: "Use this when the user wants a KX Dashboards ChartGL chart or chart layer: line, bar, bubble, waterfall, candlestick, multi-axis, streaming, or other WebGL-accelerated visualisations. Use kx-heatmap for standalone heatmap components; read kx-dashboard-core first for the dashboard envelope, data sources, ViewState, and checklist."
requires:
  - kx-dashboard-core
---

# KX ChartGL Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

Use this skill for chart layers and chart-based visualisations. Use **kx-heatmap** for standalone heatmap components rather than a ChartGL layer.

`key: "ChartGL"` · `definitionId: "669"` · `version: "v2.18.0"`

ChartGL is a WebGL-accelerated chart supporting **8 series types**: Line, Bar, Bubble, Waterfall, Candlestick, Bounds, Baseline, Heatmap. Supports multi-series layering, multiple X/Y axes, zoom/pan, crosshair overlay, custom tooltips, override rules, per-layer highlight rules, ViewState-driven filtering, and kdb+/SQL/PyKX query binding.

This skill uses **progressive disclosure**: the workflow, hazards, and pre-flight checklist are here; the bulky JSON schema, config tables, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/generate-config.md](reference/generate-config.md) | The `generate.js` `componentType: "chartgl"` config envelope and the full Series fields table. |
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — options envelope, `Basics`, axes, all 8 layer types, override/highlight rules, overlay, file export, annotations. |
| [reference/examples.md](reference/examples.md) | Five worked `generate.js` config examples (Category/Time axes, dual axes, streaming, dropdown, candlestick, grouped ViewState). |
| [reference/learnings.md](reference/learnings.md) | Known limitations and the L1–L18 learnings captured from live testing. |
| [reference/workflow-details.md](reference/workflow-details.md) | The original detailed input checklist — series/axis-type enums, per-series fields — plus the generate & verify steps. |

---

## ⚠️ Critical Hazards — Read First

1. **`id` = `hash` = filename stem.** Generate once; use for all three. Never let them drift.
2. **Line layers must NOT contain a `Bubbles` block with `Color` + `RadiusScaling > 0` on Layer 0.** The presence of such a block causes KX to render the layer as Bubble type regardless of `_Type`. See the two legitimate Bubbles-on-Line patterns in `reference/component-schema.md` (§ "Bubbles on Line layers — two legitimate patterns").
3. **`by` queries return lists per cell, not scalars.** `select bid, ask by sym from T` returns a list per sym — ChartGL cannot plot lists. Always use an explicit aggregate: `select last bid, last ask by sym from T`.
4. **`possibleXColumns`, `possibleYColumns`, and all `possible*` arrays must list actual column names** from the query — the settings panel is built from these arrays.
5. **Widget IDs must be unique** across the entire dashboard, not just one screen.
6. **ViewState names are case-sensitive and path-sensitive.** `Trade Filters/sym` ≠ `trade filters/sym`. Separator is `/`.
7. **`_connection` must match the connection file `name` field exactly.**
8. **Always write both `_autoExecute` and `_autoExec`** in every data source for maximum compatibility.
9. **Y-axis `Range.UseMinMax`** controls the scale range. When `false`, KX auto-scales — if series have very different magnitudes (e.g. FX pairs + JPY on one axis), use a second Y-axis or set `UseMinMax: true` with explicit `Min`/`Max`.
10. **`FilterUnique: true`** is required on Category X-axes to deduplicate labels.
11. **Axis type is `"Logarithmic"`, not `"Log"`.** Using `"Log"` silently falls back to `"Linear"`.
12. **`Basics.Zoom` and `Basics.RangeSelection` are mutually exclusive.** Always set both explicitly: `"Zoom": true, "RangeSelection": false` or vice versa.
13. **Candlestick colours live inside `CandlestickFormat`**, not at the layer root. Use `CandlestickFormat.BullColor`, `.BearColor`, `.NeutralColor`, `.WickColor`.


---

## Workflow

1. **Gather inputs.** Dashboard name, kdb+ connection name, query string + column names, per-layer series type (`Line` | `Bar` | `Bubble` | `Waterfall` | `Candlestick` | `Bounds` | `Baseline` | `Heatmap`), X/Y axis types, theme, and any optional features (multi-axis, stacked bars, ViewState filter, dropdown, override/highlight rules, subscription type). Ask if schema/table reference files are available before asking column-level questions. The full input checklist (axis-type enums, per-series fields) is in `reference/workflow-details.md`.
2. **Pick the series types** and confirm each has the columns it needs (Candlestick needs OHLC; Waterfall needs sequential change). Offer all 8 types; explain any you exclude.
3. **Generate with `generate.js`** using `componentType: "chartgl"` — see `reference/generate-config.md` for the config envelope and Series fields.
4. **Or build the component JSON by hand** using the options envelope, axes, and layer schemas in `reference/component-schema.md`. Populate every `possible*` array with actual query column names.
5. **Copy a matching pattern** from `reference/examples.md` when one fits (dual-axis, streaming, dropdown, candlestick, grouped ViewState).
6. **Validate** against the Critical Hazards above and the Pre-flight Checklist below; consult `reference/learnings.md` for known pitfalls (L1–L18).

---

## Pre-flight Checklist

Before writing any ChartGL dashboard file:

- [ ] `id` = `hash` = filename stem (all three identical)
- [ ] All screen IDs in `screenDetails` match entries in `screens`
- [ ] One screen has `"isDefault": true`
- [ ] All widget IDs unique across the entire dashboard
- [ ] No disqualifying `Bubbles` block on any `Line` Layer 0
- [ ] Query returns scalars per row — no `by` without an explicit aggregate
- [ ] `possibleXColumns`, `possibleYColumns` populated with actual column names
- [ ] `_connection` matches connection file `name` field exactly
- [ ] Both `_autoExecute` and `_autoExec` present in every data source
- [ ] ViewState names and paths exact (case-sensitive)
- [ ] `Basics.Zoom` and `Basics.RangeSelection` both explicitly set
- [ ] Multi-axis layers reference correct `XAxisId` / `YAxisId`
- [ ] Y-axis `Range.UseMinMax` set if series have very different magnitude scales
- [ ] `UseCustomTooltip: true` set if a custom `CustomTooltip` template is provided
- [ ] Candlestick colours inside `CandlestickFormat`, not at layer root


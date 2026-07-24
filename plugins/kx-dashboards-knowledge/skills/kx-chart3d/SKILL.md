---
name: kx-chart3d
description: "Use this when the user wants a KX Dashboards 3D chart or 3D visualisation: scatter, line, bar, surface, or 4D color/size-encoded layers. Use it for 3D graphics; use kx-chartgl for standard 2D WebGL charts and kx-gauge for dial or bullet-style KPI charts."
requires:
  - kx-dashboard-core
---

# KX Chart3D Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

`key: "Chart3D"` · `definitionId: "20"` · `version: "4.7.7"`

Chart3D renders interactive 3D visualisations using the vis.js Graph3d library. Supports **10 layer types** across scatter, line, bar, surface, and 4D (color/size-encoded) styles. Axes support Linear, Category, and Time types; a 4th Volume axis encodes a numeric column as color or size. Camera position is persistent and resets on double-click.

This skill uses **progressive disclosure**: the workflow, hazards, and validation checklist are here; the bulky JSON schema, config tables, examples, and limitations live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/generate-config.md](reference/generate-config.md) | `generate.js` `componentType: "chart3d"` config keys — the config schema plus the Layer-fields and Axis-fields tables. |
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — the 10 layer types, full options envelope, and the `Basics`, `Layers`, `Axes`, `Position`, and `Style` sub-blocks. |
| [reference/examples.md](reference/examples.md) | Four worked NLQ → JSON examples (3D dot, 3D bar with Category axes, 3D line streaming, 4D dot-color) with companion data sources. |
| [reference/workflow-details.md](reference/workflow-details.md) | The full input checklist and per-step guidance (Gather inputs → Generate → Verify). |
| [reference/known-limitations.md](reference/known-limitations.md) | Runtime constraints — Z-axis Time restriction, no legend, single source per layer, grid/surface data requirements, palette reversal, category caching. |

---

## ⚠️ Critical Hazards — Read First

1. **`id` = `hash` = filename stem.** Generate once; use for all three. Never let them drift.
2. **Z axis does NOT support `"Time"` as `AxisType`.** Valid values for Z are `"Linear"` and `"Category"` only. X and Y support `"Linear"`, `"Category"`, and `"Time"`.
3. **`possibleLayerAxis` must list actual column names returned by the query.** The layer's X/Y/Z/Volume dropdowns are populated from this array.
4. **4D layer types require a `Volume` column.** `bar-color`, `bar-size`, `dot-color`, `dot-size` encode a fourth numeric column via the `Volume` field. Leave `Volume` as `""` for 3D-only layers.
5. **`dot-color` reverses the ColorPalette.** The runtime calls `_.reverse()` on the palette for `dot-color` — the **first** color in `ColorPalette.ColorScheme` maps to the **highest** Volume value.
6. **`_connection` must match the connection file `name` field exactly.**
7. **Always write both `_autoExecute` and `_autoExec`** in every data source.
8. **Layer `_Id` values must be unique within the Layers array.** Use `"L0"`, `"L1"`, etc.
9. **Widget IDs must be unique across the entire dashboard.**
10. **`Format: "General"` ignores `Precision` for axis labels.** Use `"Number"` or `"Formatted Number"` to enforce decimal places.
11. **`surface` and `grid` require a regular XY grid of data.** Sparse or uneven data will render incorrectly; use `dot` for sparse datasets.
12. **Category axis requires string column values.** The component caches and indexes unique string labels; numeric columns on a Category axis display raw index integers.


---

## Workflow

1. **Gather inputs.** Confirm dashboard + kdb+ connection name, source table/query and columns, layer type, X/Y/Z columns and axis types (remember Z has no Time), any 4D Volume column, and theme. See the full input checklist in `reference/workflow-details.md`.
2. **Pick the layer type** by intent — `dot`/`line`/`bar`/`surface`/`grid` for 3D, `dot-color`/`dot-size`/`bar-color`/`bar-size` for 4D. The full type table is in `reference/component-schema.md`.
3. **Generate with `generate.js`** using `componentType: "chart3d"` and the config keys in `reference/generate-config.md`.
4. **Build the component JSON** — envelope + `Basics` + `Layers` (unique `_Id`, populated `possibleLayerAxis`) + X/Y/Z/Volume axes + `Style`. Full schema and every sub-block are in `reference/component-schema.md`.
5. **Wire the data source(s)** — one per layer, with both `_autoExecute` and `_autoExec`, and `_connection` matching the connection file `name`. Copy a companion source from `reference/examples.md`.
6. **Validate** against the Hazards above and the Pre-flight Checklist below; check edge cases in `reference/known-limitations.md`.

---

## Pre-flight Checklist

Before writing any Chart3D dashboard file:

- [ ] `id` = `hash` = filename stem (all three identical)
- [ ] All screen IDs in `screenDetails` match entries in `screens`
- [ ] One screen has `"isDefault": true`
- [ ] All widget IDs unique across the entire dashboard
- [ ] Z axis `AxisType` is `"Linear"` or `"Category"` — never `"Time"`
- [ ] All `possibleLayerAxis` arrays populated with actual query column names
- [ ] `possibleAxis` and `possibleColumns` populated with actual query column names
- [ ] `Data` binding uses `{ "_dashboardsType": "data", "value": "<dsName>" }` pattern
- [ ] 4D layers (`dot-color`, `dot-size`, `bar-color`, `bar-size`) have non-empty `Volume` field
- [ ] 3D layers have `Volume: ""`
- [ ] `_connection` matches connection file `name` field exactly
- [ ] Both `_autoExecute` and `_autoExec` present in every data source
- [ ] `Format: "Number"` (not `"General"`) where axis label precision matters
- [ ] Layer `_Id` values unique within the `Layers` array
- [ ] `stroke` matches the chosen `Theme` (`"#ffffff"` for Dark, `"#000000"` for Light)


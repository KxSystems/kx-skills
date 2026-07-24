# kx-chart3d — Workflow — Detailed Steps

> The full input checklist and per-step guidance (Gather inputs, Generate, Verify). Back to [SKILL.md](../SKILL.md).

**Contents:** Step 1 — Gather inputs · Step 2 — Generate using generate.js · Step 3 — Verify

---

Use `generate.js` with `componentType: "chart3d"`. See the config schema in the Workflow section.

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

### Step 1 — Gather inputs

**Always ask:**
- Dashboard name and kdb+ connection name
- Source table/query (which columns to select)
- Layer type: `dot` | `line` | `bar` | `surface` | `bar-color` | `bar-size` | `dot-color` | `dot-line` | `dot-size` | `grid`
- X column and axis type: `Linear` | `Category` | `Time`
- Y column and axis type: `Linear` | `Category` | `Time`
- Z column and axis type: `Linear` | `Category` (**no Time on Z**)
- For 4D layers: Volume column name (numeric, encodes color or size)
- Theme: `Dark` | `Light`
- Axis labels and any custom number/date formatting

**Optional:** multiple layers, ViewState filter, Dropdown widget, custom tooltip, custom camera position, custom color palette.

### Step 2 — Generate using `generate.js`

Set `componentType: "chart3d"`. See the config schema below.

### Step 3 — Verify

- `id === hash` ✓
- Z axis does not use `"Time"` ✓
- `possibleLayerAxis` lists actual column names ✓
- 4D layers have a non-empty `Volume` field ✓
- `_connection` matches connection file `name` exactly ✓
- Both `_autoExecute` and `_autoExec` present in every data source ✓


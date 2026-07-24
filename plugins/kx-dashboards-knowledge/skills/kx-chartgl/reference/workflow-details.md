# kx-chartgl — Workflow Details

> The original step-by-step build workflow: the full input checklist (series/axis-type enums, per-series fields) and the generate & verify steps. Back to [SKILL.md](../SKILL.md).

**Contents:** Step 1 — Gather inputs · Step 2 — Generate using generate.js · Step 3 — Verify

---

## Workflow

### Step 1 — Gather inputs

**Always ask:**
- Dashboard name and kdb+ connection name
- Query string and column names returned
- Series type per layer: `Line` | `Bar` | `Bubble` | `Waterfall` | `Candlestick` | `Bounds` | `Baseline` | `Heatmap`
- For each series: name, X column, Y column, hex colour
- X-axis type: `Linear` | `Time` | `Category` | `Logarithmic`
- Y-axis type: `Linear` | `Time` | `Logarithmic`
- Theme: `Dark` | `Light`

**Optional:** multiple Y-axes, stacked bars, ViewState filter, Dropdown widget, override/highlight rules, subscription type (`static` | `polling` | `streaming`), direct deploy.

### Step 2 — Generate using `generate.js`

Set `componentType: "chartgl"`. See config schema below.

### Step 3 — Verify

- `id === hash` ✓
- No disqualifying `Bubbles` block on Line Layer 0 ✓
- Query returns scalars per row (no un-aggregated `by`) ✓
- All `possible*` arrays populated with actual column names ✓
- `Zoom` and `RangeSelection` both explicitly set ✓

---
name: kx-gauge
description: "Use this when the user wants a KX Dashboards gauge, dial, speedometer, or bullet-style KPI visual. Use it for progress and target-vs-actual displays; use kx-chartgl for conventional charts and kx-pie for proportional segment charts."
requires:
  - kx-dashboard-core
---

# KX Gauge Widget

`key: "Gauge"` · `definitionId: "11178"`

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

This skill uses **progressive disclosure**: the hazards, workflow, sub-type table, and output rules are here; the bulky JSON schemas, ChartType/Format field tables, tooltip template, migration history, and examples live in `reference/`. Read only the reference file relevant to your current step.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/component-schema.md](reference/component-schema.md) | The raw component JSON — full Gauge and Bullet options schemas, the ChartType property tables, highlight rules, the Format table, the Tooltip section/template, and the schema upgrade history. |
| [reference/examples.md](reference/examples.md) | The two `generate.js` config examples (Gauge + Bullet) for the shared generator, plus typical kdb+ query patterns. |

---

## ⚠️ Gauge Hazards

- **Bullet chart = `key: "Gauge"` with `_Type: "Bullet"` — NEVER ChartGL.** Do not simulate a bullet chart using ChartGL Bar + Bubble layers. The only correct widget for a bullet chart is the Gauge widget (`definitionId: "11178"`) with `Basics.ChartType._Type: "Bullet"`.
- **`Basics.ChartType._Type`** controls the sub-type (`"Gauge"` or `"Bullet"`). Omitting it leaves the widget in an undefined state.
- **Highlight rule values are absolute numbers**, not percentages. They are converted internally to 0–1 fractions of `[Min, Max]` for eCharts color stops.
- **`RuleOperation`** only supports `"<"` and `"<="` — no other operators.
- **Bullet highlight rules require `Max` to be set** — `setHighlightRules` guards on `if (min || max)`. Without `Max`, highlight rules are silently skipped even if `HighlightRules` is non-empty. Set `Min: 0` and `Max` to the largest rule value (e.g. `300` if your top rule is `<= 300`). This does not affect Bullet axis scaling — scale remains data-driven.
- **`ShowTitle` must be `undefined` (not `false`) for Bullet** — the widget explicitly removes it when switching to Bullet type.
- **Tooltip uses a Handlebars template** stored in `Tooltip.CustomTooltip`. The default template is in `reference/component-schema.md` → Tooltip.

---

## Chart Sub-Types

| `_Type` | Description |
|---|---|
| `"Gauge"` | Circular dial with pointer, optional progress arc, configurable axis labels and ticks |
| `"Bullet"` | Horizontal or vertical bar chart with a progress bar and a scatter "target" marker |

---

## Workflow

1. **Confirm the visual.** Gauge (`_Type: "Gauge"`) for a single circular dial / speedometer KPI; Bullet (`_Type: "Bullet"`) for target-vs-actual bars. Never simulate a Bullet with ChartGL (see Hazards).
2. **Clarify inputs.** You need the data source (and connection) and the column(s): a single value column for Gauge, or progress / target / axis-label columns for Bullet. If ambiguous, ask one focused question before generating (see Output Contract).
3. **Wire the data source** — a single-row single-column query for Gauge, or a multi-row query for Bullet. Query patterns in `reference/examples.md`.
4. **Build the component** — copy the matching envelope from `reference/component-schema.md` (Gauge or Bullet schema), set `Basics.ChartType._Type` and its columns, `Min`/`Max`, colours, `Format`, and `Tooltip`.
5. **Add highlight rules** (if requested) using `"<"`/`"<="` and absolute values; for Bullet set `Min`/`Max` or the rules are silently skipped (see Hazards). Field details in `reference/component-schema.md` → Highlight Rules.
6. **Set `"version": "v2.2.8.1"`** to skip all load-time migrations (see `reference/component-schema.md` → Schema Upgrade History).
7. **Validate** against the Hazards above and the Output Contract below. Copy from `reference/examples.md` when a pattern matches.

---

## Output Contract

- Return JSON only — no prose inside JSON output.
- `key` must be `"Gauge"` and `definitionId` must be `"11178"`.
- Set `"version": "v2.2.8.1"` on every new component.
- Always set `Basics.ChartType._Type` (`"Gauge"` or `"Bullet"`) — omitting it leaves the widget undefined.
- `Data` is a data binding: `{ "_dashboardsType": "data", "value": "<sourceName>" }`.
- `RuleOperation` values must be `"<"` or `"<="` only; `RuleValue` is an absolute number.
- For Bullet with highlight rules, set `Min` and `Max` or the rules are silently dropped.
- For Bullet, omit `ShowTitle` (leave it `undefined`) rather than setting it `false`.
- If the user has not specified the data source, columns, or connection name, ask one focused clarification question before generating JSON.

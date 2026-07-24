---
name: kx-handlebars
description: "Use this when a KX Dashboards component needs Handlebars templating for labels, tooltips, KPI text, or other dynamic content. Read it when generating or debugging Template, CustomTooltip, TooltipTemplate, or advancedTooltip fields."
---

# KX Dashboards — Handlebars Templates

Templates in KX Dashboards are **Handlebars 4.7** strings stored as JSON string values. The most common locations are `Template`, `CustomTooltip`, `TooltipTemplate`, and `advancedTooltip`. This skill uses **progressive disclosure**: the core syntax, context rules, and common mistakes are here; the full helper catalog and the copy-ready template galleries live in `reference/`.

## Reference Files

| File | Read it when you need… |
|---|---|
| [reference/helpers.md](reference/helpers.md) | The full built-in helper catalog — every String, Number, Comparison/Logic, Array, and Date/Time helper with usage and examples. |
| [reference/templates.md](reference/templates.md) | Copy-ready template snippets — per-component tooltips (Datagrid, ChartGL, Heatmap, Gauge/Bullet, Radar, Chart3D, OfflineMap), Datagrid column cells, Text/KPI tiles, and Heatmap node labels. |

---

## Core Syntax

| Expression | Output |
|---|---|
| `{{col}}` | HTML-escaped value of `col` |
| `{{{col}}}` | Unescaped raw HTML — use for HTML content in cell templates |
| `{{#if x}}…{{/if}}` | Conditional block |
| `{{#if x}}…{{else}}…{{/if}}` | Conditional with fallback |
| `{{#unless x}}…{{/unless}}` | Inverse conditional |
| `{{#each arr}}…{{/each}}` | Iterate over array or object |
| `{{@key}}` | Current key when iterating an object |
| `{{@index}}` | Current index when iterating an array (0-based) |
| `{{#with obj}}…{{/with}}` | Change context to `obj` |
| `{{lookup obj key}}` | Dynamic property access: `{{lookup row fieldName}}` |

> ⚠️ All templates are JSON strings — escape double quotes as `\"` inside the template string.

---

## ⚠️ Context rules — the most common source of bugs

The Handlebars `this` context differs by component. Using the wrong pattern is the most frequent mistake.

| Component / field | Context shape | Access pattern |
|---|---|---|
| **Datagrid** `ColumnsConfiguration[].Template` | Current row object | `{{colName}}` or `{{value}}` for the current cell |
| **Datagrid** `Tooltip.Template` | Current row object | `{{colName}}` for any column |
| **Text** `Basics.Template` (data source) | Array of row objects | `{{this.0.colName}}` — `this` is the array, `this.0` is the first row |
| **Text** `Basics.Template` (ViewState only) | ViewState map | `{{vsName}}` directly |
| **ChartGL** `Overlay.CustomTooltip` | Array of point objects | `{{#each this}}` then `{{xAxis}}`, `{{yAxis}}`, `{{name}}`, `{{color}}`, `{{icon}}`, `{{width}}` |
| **Gauge/Bullet** `Tooltip.CustomTooltip` | Array of data objects | `{{#each this}}` then `{{dataCol}}`, `{{dataVal}}`, `{{title}}`, `{{data}}` |
| **Heatmap** `Tooltip.TooltipTemplate` | Special named variables | `{{_name}}`, `{{_label}}`, `{{_value}}`, `{{_color}}` — no `#each` needed |
| **Heatmap** `Data[].NodeLabel.customLabel` | Current node row | `{{colName}}` — **plain text only, no HTML** |
| **Radar** `Tooltip.advancedTooltip` | Object with `dataSet` array | `{{#each dataSet}}` then `{{color}}`, `{{layerKey}}`, `{{layerValue}}`, `{{legend}}` |
| **Chart3D** `advancedTooltip` | Object with `points` array | `{{#each points}}` then `{{xLabel}}`, `{{x}}`, `{{yLabel}}`, `{{y}}`, `{{zLabel}}`, `{{z}}` |
| **OfflineMap** layer `Tooltip` | GeoJSON feature properties | `{{propertyName}}` directly |
| **SelectionControls** `labelTemplate` | Current item row | `{{colName}}` |
| **BasicComponents** Image `Template` | Current data row | `{{colName}}` |
| **PieJS** `PieceLabelTemplate` | Current segment row | `{{colName}}` |

Helper syntax and per-component template galleries are in the reference files above.

---

## Common Mistakes

| Mistake | Fix |
|---|---|
| `{{col}}` in Text component | Use `{{this.0.col}}` — context is the row array |
| HTML tags in heatmap `customLabel` | Remove them — plain text only |
| ChartGL tooltip not showing | Set `Overlay.UseCustomTooltip: true` |
| `{{value}}` in non-Datagrid template | `{{value}}` is only valid in Datagrid `ColumnsConfiguration[].Template` |
| Nested helpers without parens | `{{addCommas toFixed price 2}}` → `{{addCommas (toFixed price 2)}}` |
| Unescaped `"` in JSON string | Escape as `\"` — templates live inside JSON string values |
| `{{count this}}` for row count | Use a scalar query and `{{this.0.total}}` instead |

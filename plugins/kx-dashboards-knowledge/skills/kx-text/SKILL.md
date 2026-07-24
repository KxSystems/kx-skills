---
name: kx-text
description: "Generate KX Dashboards text display component: Text (static or dynamic label/heading/paragraph/KPI tile, definitionId=17). Use for: label, heading, title, paragraph, static text, rich text, HTML markup, dynamic text from a data source, ViewState-interpolated text via Handlebars template, single-value scalar display, KPI tile, metric card, stat display, total count, aggregate result. IMPORTANT: when a query returns a single value (count, sum, last price, etc.), always use Text — never Dropdown. ComponentName=Text, key=BasicComponents. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX Text Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

## ⚠️ Hazards — Read First

1. **`definitionId` is `"17"`** — not `"33"` (TextInput). Text is a read-only display widget; it does not accept user input.
2. **`Basics.HtmlText` is rendered as HTML** — plain strings are valid; use `<p>`, `<h1>`–`<h6>`, `<strong>`, `<em>`, inline styles, etc. for formatting.
3. **`Basics.Template` is a Handlebars template** — references data source columns as `{{this.0.columnName}}` and ViewStates as `{{vsName}}`. When `Template` is non-empty it overrides `HtmlText`.
4. **`AllowUnsafeContent: false` by default** — only set `true` when the template renders user-supplied or external HTML. Keep `false` for all static labels.
5. **`Basics.FontSize` is stored as a string** in the default JSON (e.g. `"13"`, not `13`).
6. **No `Actions` array** — the Text component is display-only and fires no click actions.
7. **Use Text — not Dropdown — for any query that returns a single computed value.** If a query produces one row with a scalar result (total count, sum, last price, average, etc.), display it with a Text component bound via `Template`. Dropdown is an input control for user selection; it must never be used as a display widget for query results.

---

# TEXT

`key: "BasicComponents"` · `definitionId: "17"` · `ComponentName: "Text"` · `version: "v2.9.0"`

A static or data-driven text display tile. Renders HTML markup or Handlebars-templated text.

## Basics

```json
{
  "ComponentName": "Text",
  "Name": "",
  "HtmlText": "insert text here",
  "Data": "",
  "Template": "",
  "Theme": "Dark",
  "FontSize": "13",
  "horizontal": "Center",
  "vertical": "Middle",
  "tooltip": "",
  "AllowUnsafeContent": false,
  "version": "v2.9.0"
}
```

| Field | Values / Notes |
|---|---|
| `HtmlText` | Static text or HTML markup shown when `Template` is empty. Rendered directly as HTML. |
| `Data` | Optional data source binding (`{ "_dashboardsType": "data", "value": "<dsName>" }`). When set, the component subscribes to row changes and the first row is exposed to `Template`. |
| `Template` | Handlebars template string. References data columns via `{{this.0.columnName}}` and ViewStates via `{{vsName}}`. Overrides `HtmlText` when non-empty. |
| `FontSize` | String (default `"13"`). Font size in px applied to the tile. |
| `horizontal` | `"Left"` \| `"Center"` (default) \| `"Right"` — horizontal alignment of the content block. |
| `vertical` | `"Top"` \| `"Middle"` (default) \| `"Bottom"` — vertical position of the content block. |
| `AllowUnsafeContent` | `true` allows `<script>` and other unsafe HTML in template output. Keep `false` for static text. |
| `Theme` | `"Dark"` \| `"Light"` |

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "17",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.9.0",
    "Basics": {
      "ComponentName": "Text",
      "Name": "",
      "HtmlText": "insert text here",
      "Data": "",
      "Template": "",
      "Theme": "Dark",
      "FontSize": "13",
      "horizontal": "Center",
      "vertical": "Middle",
      "tooltip": "",
      "AllowUnsafeContent": false,
      "version": "v2.9.0"
    },
    "Style": { "advanced": "" },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
      "innerPaddingLeft": 0, "innerPaddingRight": 0, "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0, "titlePaddingTop": 7, "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
      "tileBorderWidth": 0, "tileBorderRounding": 0,
      "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true, "tileShadow": false
    }
  }
}
```

---

## Common Patterns

### Static heading

```json
"Basics": {
  "ComponentName": "Text",
  "HtmlText": "<h2 style=\"margin:0\">Portfolio Summary</h2>",
  "horizontal": "Left",
  "vertical": "Middle",
  "FontSize": "16"
}
```

### Dynamic text from a data source (single-row scalar)

Bind `Data` to a source returning one row. The Handlebars context is the **full row array** from the data source, so use `{{this.0.columnName}}` to access the first row's column value:

```json
"Basics": {
  "ComponentName": "Text",
  "Data": { "_dashboardsType": "data", "value": "<dataSource>" },
  "Template": "Current price: <strong>{{this.0.price}}</strong>",
  "HtmlText": ""
}
```

> **`{{this.0.columnName}}`** — `this` is the array of rows, `this.0` is the first row, `.columnName` is the column. Always use this form when referencing data source columns. Do NOT use `{{count this}}` to count rows — run a dedicated scalar query (`select total: count i from t`) and reference `{{this.0.total}}`.

### ViewState interpolation (no data source)

`Template` can reference ViewStates directly — no `Data` binding required:

```json
"Basics": {
  "ComponentName": "Text",
  "Template": "Selected symbol: <strong>{{selectedSym}}</strong>",
  "HtmlText": ""
}
```

The component calls `subscribeTemplateViewStates` internally and re-renders when `selectedSym` changes.

### Mixed data + ViewState template

```json
"Basics": {
  "ComponentName": "Text",
  "Data": { "_dashboardsType": "data", "value": "pnlData" },
  "Template": "<p>Sym: <strong>{{selectedSym}}</strong></p><p>P&amp;L: {{this.0.pnl}}</p>",
  "HtmlText": "",
  "AllowUnsafeContent": false
}
```

`{{selectedSym}}` resolves from a ViewState; `{{this.0.pnl}}` resolves from the first row of the `pnlData` data source.

---

### Single-value stat / KPI tile

Write the kdb+ query so it returns exactly one row with named columns, then reference each column in `Template` with `{{this.0.columnName}}`.

```q
/ One-column scalar — total trade count today
select totalCount: count i from trade where date=.z.d

/ Multi-column scalar — count, last price, total volume for selected sym
{[s] select totalCount: count i, lastPrice: last price, totalVol: sum size
       from trade where date=.z.d, sym=s}
```

```json
// Data source — static (one-time) or polling (live refresh)
"tradeStats": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "select totalCount: count i from trade where date=.z.d",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "polling",
  "_subscriptionInterval": 5
}
```

```json
// Text component — single value
"Basics": {
  "ComponentName": "Text",
  "Data": { "_dashboardsType": "data", "value": "tradeStats" },
  "Template": "<p style=\"font-size:28px;margin:0;font-weight:bold\">{{this.0.totalCount}}</p><p style=\"font-size:12px;margin:4px 0 0;opacity:0.7\">Trades Today</p>",
  "HtmlText": "",
  "horizontal": "Center",
  "vertical": "Middle",
  "AllowUnsafeContent": false
}
```

For a multi-column scalar, reference each column with `this.0.columnName`:

```json
"Template": "<strong>{{this.0.lastPrice}}</strong> &nbsp;·&nbsp; {{this.0.totalCount}} trades &nbsp;·&nbsp; {{this.0.totalVol}} vol"
```

> Keep the query lean — `select col: agg from table` returns one row. The Text component takes the first row of the result set, so multi-row queries silently discard all rows after the first.

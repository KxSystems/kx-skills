[← Back to SKILL.md](../SKILL.md)

# Handlebars Template Galleries

Copy-ready template snippets for the per-component tooltips, Datagrid column cells, Text/KPI tiles, and Heatmap node labels.

**Contents:** Tooltip Templates by Component (Datagrid · ChartGL · Heatmap · Gauge/Bullet · Radar · Chart3D · OfflineMap) · Column Cell Templates (Datagrid) · Text / KPI Tile Templates · Heatmap Node Labels

---

## Tooltip Templates by Component

### Datagrid — row hover tooltip

Context: the current row object. Reference any column by name.

```html
<div style="padding:8px; font-size:11px">
  {{#each this}}<b>{{@key}}</b>: {{this}}<br>{{/each}}
</div>
```

Custom two-column layout:

```html
<table style="font-size:11px; padding:4px">
  <tr><td><b>Symbol</b></td><td>{{sym}}</td></tr>
  <tr><td><b>Price</b></td><td>{{addCommas (toFixed price 2)}}</td></tr>
  <tr><td><b>Side</b></td><td>{{side}}</td></tr>
</table>
```

### ChartGL — chart crosshair tooltip

Context: array of point objects. Must also set `Overlay.UseCustomTooltip: true`.

Available variables per point: `xAxis`, `yAxis`, `name`, `color`, `icon`, `image`, `width`.

```html
<table>
  <thead><tr><th>{{this.0.xAxis}}</th><th></th></tr></thead>
  <tbody>
    {{#each this}}
    <tr>
      <td><i class="{{icon}}" style="color:{{color}}"></i> {{name}}:</td>
      <td>{{addCommas (toFixed yAxis 2)}}</td>
    </tr>
    {{/each}}
  </tbody>
</table>
```

### Heatmap — node hover tooltip

Context: special named variables — no `{{#each}}`.

```html
<table>
  <thead><tr><th>{{_name}}</th><th></th></tr></thead>
  <tr>
    <td>{{_label}}:</td>
    <td style="padding-left:10px">{{addCommas (toFixed _value 2)}}</td>
  </tr>
</table>
```

### Gauge / Bullet — value tooltip

Context: array of `{dataCol, dataVal, title, data}` objects.

```html
<table>
  {{#if this.0.title}}<thead><tr><th>{{this.0.title}}</th></tr></thead>{{/if}}
  <tbody>
    {{#each this}}
    <tr><td>{{dataCol}}:</td><td>{{dataVal}}</td></tr>
    {{/each}}
  </tbody>
</table>
```

### Radar — data point tooltip

Context: `{ dataSet: [{ color, layerKey, layerValue, legend }] }`.

```html
<div>
  {{#each dataSet}}
  <table>
    {{#eq @index 0}}<tr><td colspan="3">{{legend}}</td></tr>{{/eq}}
    <tr>
      <td><svg style="width:14px;height:14px"><circle fill="{{color}}" r="6" cy="7" cx="7"/></svg></td>
      <td>{{layerKey}}</td>
      <td>{{layerValue}}</td>
    </tr>
  </table>
  {{/each}}
</div>
```

### Chart3D — 3D point tooltip

Context: `{ points: [{ xLabel, x, yLabel, y, zLabel, z }] }`.

```html
<table>
  {{#each points}}
  <tr><td>{{xLabel}}</td><td>{{x}}</td></tr>
  <tr><td>{{yLabel}}</td><td>{{y}}</td></tr>
  <tr><td>{{zLabel}}</td><td>{{z}}</td></tr>
  {{/each}}
</table>
```

### OfflineMap — feature tooltip

Context: the GeoJSON feature's properties object directly.

```html
<div style="font-size:10px">
  <b>{{name}}</b><br>
  Value: {{addCommas (toFixed value 2)}}
</div>
```

---

## Column Cell Templates (Datagrid)

Set on `ColumnsConfiguration[].Template`. Context is the current row object; `{{value}}` gives the current cell's formatted value.

### Badge / pill

```html
<span style="padding:2px 6px; border-radius:3px; background:{{#if (eq side 'Buy')}}#1a7a3a{{else}}#a01a1a{{/if}}; color:#fff">
  {{side}}
</span>
```

### Flag image + text

```html
<img style="margin-bottom:-2px" height="14" src="/flags/{{lowercase ccy}}.png"> {{sym}}
```

### Conditional icon

```html
{{#if (gt pnl 0)}}
  <i class="fa fa-arrow-up" style="color:#4caf50"></i>
{{else}}
  <i class="fa fa-arrow-down" style="color:#f44336"></i>
{{/if}}
{{addCommas (toFixed pnl 2)}}
```

### Clickable link

```html
<a href="/detail?sym={{encodeURIComponent sym}}" style="color:#00aeef">{{sym}}</a>
```

### Formatted number with unit

```html
{{addCommas (toFixed size 0)}} <span style="opacity:0.6; font-size:0.85em">lots</span>
```

---

## Text / KPI Tile Templates

Context is the **array** of rows from the data source. Always use `{{this.0.col}}` to access the first row.

### Single scalar KPI

```html
<div style="font-size:24px; font-weight:bold; text-align:center">
  {{addCommas (toFixed this.0.price 2)}}
</div>
<div style="font-size:11px; opacity:0.6; text-align:center">Last Price</div>
```

### Multi-metric tile

```html
<table style="width:100%; font-size:12px">
  <tr><td>Bid</td><td style="text-align:right">{{toFixed this.0.bid 4}}</td></tr>
  <tr><td>Ask</td><td style="text-align:right">{{toFixed this.0.ask 4}}</td></tr>
  <tr><td>Spread</td><td style="text-align:right">{{toFixed this.0.spread 4}}</td></tr>
</table>
```

### ViewState interpolation (no data source)

```html
Selected: <strong>{{selectedSym}}</strong> — Filter: <em>{{tradeFilter}}</em>
```

### Mixed data + ViewState

```html
<p>Symbol: <strong>{{selectedSym}}</strong></p>
<p>P&amp;L: <span style="color:{{#if (gte this.0.pnl 0)}}#4caf50{{else}}#f44336{{/if}}">
  {{addCommas (toFixed this.0.pnl 2)}}
</span></p>
```

---

## Heatmap Node Labels

`customLabel` is **plain text only** — rendered as canvas text by ECharts. HTML tags appear as literal characters.

```
{{sym}} | {{toFixed pctChange 1}}%
```

Use `|`, `-`, or spaces to separate values. No `<br>`, `<b>`, or `<span>`.

[← Back to SKILL.md](../SKILL.md)

# kx-gauge — generate.js Config & Query Patterns

> The two `generate.js` config examples (Gauge + Bullet) for the shared generator, plus typical kdb+ query patterns.

**Contents:** generate.js Config (Gauge example · Bullet example) · Typical kdb+ Query Patterns

---

## generate.js Config

These configs are consumed by the shared generator documented in **kx-dashboard-core**. Set `"componentType": "gauge"`. Use `"chartSubType"` to select the sub-type.

### Gauge example

```json
{
  "name": "Price KPI",
  "componentType": "gauge",
  "chartSubType": "Gauge",
  "dataSource": "priceDs",
  "dataColumn": "price",
  "min": 0,
  "max": 200,
  "color": "#0061FF",
  "showProgress": true,
  "showAxisLabels": true,
  "showAxisTicks": true,
  "barWidth": 10,
  "pointerWidth": 6,
  "labelFontSize": 30,
  "showLabel": true,
  "showTitle": false,
  "title": "",
  "highlightRules": [
    { "ruleColor": "#00c853", "ruleOperation": "<",  "ruleValue": "80"  },
    { "ruleColor": "#ffd600", "ruleOperation": "<=", "ruleValue": "150" },
    { "ruleColor": "#d50000", "ruleOperation": "<=", "ruleValue": "200" }
  ],
  "format": "Number",
  "precision": 2,
  "prefix": "$",
  "suffix": "",
  "showTooltip": true,
  "dataSources": [
    {
      "name": "priceDs",
      "connection": "myConnection",
      "queryString": "select last price from trade where sym=`AAPL",
      "columns": ["price"]
    }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 10, "colSpan": 12 }
}
```

### Bullet example

```json
{
  "name": "Sales vs Target",
  "componentType": "gauge",
  "chartSubType": "Bullet",
  "dataSource": "summaryDs",
  "progressData": "actual",
  "targetData": "target",
  "axisData": "region",
  "progressColor": "#0061FF",
  "targetColor": "#F23A66",
  "transposed": true,
  "highlightRules": [
    { "ruleColor": "#d50000", "ruleOperation": "<",  "ruleValue": "50"  },
    { "ruleColor": "#ffd600", "ruleOperation": "<=", "ruleValue": "80"  },
    { "ruleColor": "#00c853", "ruleOperation": "<=", "ruleValue": "100" }
  ],
  "format": "Number",
  "precision": 0,
  "showTooltip": true,
  "dataSources": [
    {
      "name": "summaryDs",
      "connection": "myConnection",
      "queryString": "select region, actual, target from sales_summary",
      "columns": ["region", "actual", "target"]
    }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 12, "colSpan": 24 }
}
```

---

## Typical kdb+ Query Patterns

### Single KPI value (Gauge)

```q
select last price from trade where sym=`AAPL
```
Returns one row, one column. Set `DataColumn` to `"price"`.

### Multi-row Bullet chart

```q
select sym, actual, target from summary_table
```
Returns N rows. Set `ProgressData = "actual"`, `Target = "target"`, `AxisData = "sym"`.

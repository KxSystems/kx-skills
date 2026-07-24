# kx-chartgl — Config Examples

> Five worked `generate.js` config examples covering Category/Time axes, dual axes, streaming, dropdowns, candlesticks, and grouped ViewStates. Back to [SKILL.md](../SKILL.md).

**Contents:** Line chart · Line+Bar dual-axis · ViewState-filtered streaming with Dropdown · OHLC Candlestick + Volume + MA · Grouped ViewState multi-parameter

---

## Config Examples

### Example 1 — Line chart, Category X-axis, two series

```json
{
  "componentType": "chartgl",
  "name": "dfxQuote Bid Ask by Sym",
  "theme": "Dark",
  "xAxisType": "Category",
  "yAxisType": "Linear",
  "dataSources": [{
    "name": "dfxQuoteData",
    "connection": "html5evalcongroup",
    "queryString": "select last bid, last ask by sym from dfxQuote",
    "columns": ["sym", "bid", "ask"],
    "subscriptionType": "static"
  }],
  "series": [
    { "name": "Bid", "type": "Line", "dataSource": "dfxQuoteData", "xCol": "sym", "yCol": "bid", "color": "#0061FF" },
    { "name": "Ask", "type": "Line", "dataSource": "dfxQuoteData", "xCol": "sym", "yCol": "ask", "color": "#F23A66" }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 20, "colSpan": 36 }
}
```

### Example 2 — Line + Bar composite, dual Y-axes, streaming

```json
{
  "componentType": "chartgl",
  "name": "FX Bid Line + Volume Bar",
  "theme": "Dark",
  "xAxisType": "Time",
  "yAxes": [
    { "position": "Left",  "type": "Linear" },
    { "position": "Right", "type": "Linear" }
  ],
  "dataSources": [{
    "name": "fxTick",
    "connection": "html5evalcongroup",
    "queryString": "select time, bid, bidSize from dfxQuote where sym=`EUR/USD",
    "columns": ["time", "bid", "bidSize"],
    "subscriptionType": "streaming"
  }],
  "series": [
    { "name": "Bid",      "type": "Line", "dataSource": "fxTick", "xCol": "time", "yCol": "bid",     "color": "#0061FF", "yAxisId": "Y-Axis 1" },
    { "name": "Bid Size", "type": "Bar",  "dataSource": "fxTick", "xCol": "time", "yCol": "bidSize", "color": "#009BAB", "yAxisId": "Y-Axis 2", "barWidth": 80 }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 20, "colSpan": 36 }
}
```

### Example 3 — ViewState-filtered streaming chart with Dropdown

```json
{
  "componentType": "chartgl",
  "name": "FX Monitor",
  "theme": "Dark",
  "xAxisType": "Time",
  "dataSources": [
    {
      "name": "fxData",
      "connection": "html5evalcongroup",
      "queryString": "{[s] select time, bid, ask from dfxQuote where sym=s}",
      "columns": ["time", "bid", "ask"],
      "subscriptionType": "streaming",
      "params": [{ "name": "s", "type": "symbol", "viewState": "fxsym" }]
    },
    {
      "name": "symList",
      "connection": "html5evalcongroup",
      "queryString": "select distinct sym from dfxQuote",
      "columns": ["sym"]
    }
  ],
  "viewStates": [{ "name": "fxsym", "type": "symbol", "default": "EUR/USD" }],
  "series": [
    { "name": "Bid", "type": "Line", "dataSource": "fxData", "xCol": "time", "yCol": "bid", "color": "#0061FF" },
    { "name": "Ask", "type": "Line", "dataSource": "fxData", "xCol": "time", "yCol": "ask", "color": "#F23A66" }
  ],
  "dropdown":       { "dataSource": "symList", "viewState": "fxsym", "valueColumn": "sym", "label": "Symbol:" },
  "chartLayout":    { "row": 0,  "column": 0, "rowSpan": 15, "colSpan": 36 },
  "dropdownLayout": { "row": 15, "column": 6, "rowSpan": 2,  "colSpan": 9 }
}
```

### Example 4 — OHLC Candlestick + Volume Bar + Moving Average (three Y-axes)

Real pattern from the KX demo dashboard (`fxHistoric` table). Bull/Bear colours are ViewState-bound for theme switching.

```json
{
  "componentType": "chartgl",
  "name": "FX OHLC — EUR/USD",
  "theme": "Dark",
  "xAxisType": "Linear",
  "yAxes": [
    { "position": "Left",  "type": "Linear", "useMinMax": true, "min": "1",   "max": "1.25" },
    { "position": "Right", "type": "Linear", "useMinMax": true, "min": "0",   "max": "10" },
    { "position": "Left",  "type": "Linear", "useMinMax": true, "min": "0",   "max": "25000" }
  ],
  "dataSources": [
    {
      "name": "ohlcData",
      "connection": "html5evalcongroup",
      "queryString": "select from fxHistoric where Symbol = `$\"EURUSD\"",
      "columns": ["Close","Open","High","Low","Change","Volume","Time","Symbol"],
      "subscriptionType": "static"
    },
    {
      "name": "maData",
      "connection": "html5evalcongroup",
      "queryString": "tab: select from fxHistoric where Symbol = `$\"EURUSD\";\nupdate ema26:ema[2%27;Close],ema12:ema[2%13;Close] from tab",
      "columns": ["Close","Open","High","Low","Change","Volume","Time","Symbol","ema26","ema12"],
      "subscriptionType": "static"
    }
  ],
  "series": [
    {
      "name": "OHLC", "type": "Candlestick", "dataSource": "ohlcData",
      "xCol": "Time", "yCol": null,
      "open": "Open", "high": "High", "low": "Low", "close": "Close",
      "yAxisId": "Y-Axis 1",
      "bullColor": { "_dashboardsType": "viewstate", "value": "Colors/Green" },
      "bearColor": { "_dashboardsType": "viewstate", "value": "Colors/Red" },
      "wickColor": "#7b8284"
    },
    { "name": "Volume",         "type": "Bar",  "dataSource": "ohlcData", "xCol": "Time", "yCol": "Volume", "color": "#669eb3", "yAxisId": "Y-Axis 2", "barWidth": 95 },
    { "name": "Moving Average", "type": "Line", "dataSource": "maData",   "xCol": "Time", "yCol": "ema*",   "color": "#FFC300", "yAxisId": "Y-Axis 1", "lineThickness": 1 }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 14, "colSpan": 36 }
}
```

### Example 5 — Grouped ViewState, multi-parameter query

```json
{
  "componentType": "chartgl",
  "name": "Trade Chart",
  "viewStates": [
    { "name": "Trade Filters/sym",  "type": "symbol", "default": "AAPL" },
    { "name": "Trade Filters/days", "type": "int",    "default": 20 }
  ],
  "dataSources": [{
    "name": "TradeBars",
    "connection": "html5evalcongroup",
    "queryString": "{[sym;days]([] date:.z.D - reverse til days; close:100 + til days)}",
    "columns": ["date","close"],
    "params": [
      { "name": "sym",  "type": "symbol", "viewStatePath": "Trade Filters/sym" },
      { "name": "days", "type": "int",    "viewStatePath": "Trade Filters/days" }
    ]
  }],
  "series": [
    { "name": "Close", "type": "Line", "dataSource": "TradeBars", "xCol": "date", "yCol": "close", "color": "#0061FF" }
  ]
}
```

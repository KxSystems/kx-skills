# kx-dataform — Worked Example & Few-Shot NLQ Examples

> A complete Trade Filter form plus 8 NLQ-to-JSON examples to copy from. Back to [SKILL.md](../SKILL.md).

**Contents:** Complete Example · 1. Basic text-input · 2. Dropdown + datepicker · 3. Number + slider · 4. Reset button · 5. Virtual data source · 6. Password field · 7. Float-submit · 8. Multi-select

---

## Complete Example — Trade Filter Form

A Dataform with symbol dropdown, start/end date pickers, and a quantity number spinner. On submit it runs a kdb+ query and shows results in a Datagrid.

### generate.js config

```json
{
  "componentType": "dataform",
  "name": "Trade Filter",
  "theme": "Dark",
  "submitDataSource": "tradeResults",
  "dataSources": [
    {
      "name": "tradeResults",
      "connection": "tradefeed",
      "queryString": "{[sym; startDate; endDate; minQty] select from Trades where sym=sym, date within (startDate; endDate), qty >= minQty}",
      "columns": ["time", "sym", "side", "price", "qty"],
      "subscriptionType": "static",
      "params": [
        { "name": "sym",       "viewStatePath": "Trade Filter/sym",       "type": "symbol" },
        { "name": "startDate", "viewStatePath": "Trade Filter/startDate", "type": "date"   },
        { "name": "endDate",   "viewStatePath": "Trade Filter/endDate",   "type": "date"   },
        { "name": "minQty",    "viewStatePath": "Trade Filter/minQty",    "type": "int"    }
      ]
    },
    {
      "name": "symList",
      "connection": "tradefeed",
      "queryString": "select sym from SymbolList",
      "columns": ["sym"],
      "subscriptionType": "static"
    }
  ],
  "viewStates": [
    { "name": "Trade Filter/sym",       "type": "symbol",  "default": "AAPL" },
    { "name": "Trade Filter/startDate", "type": "date",    "default": "2024-01-01" },
    { "name": "Trade Filter/endDate",   "type": "date",    "default": "2024-12-31" },
    { "name": "Trade Filter/minQty",    "type": "int",     "default": 0 }
  ],
  "formFields": [
    {
      "pathEnc": "Trade%20Filter%2Fsym",
      "displayName": "Symbol",
      "fieldType": "Dropdown",
      "dataSource": "symList",
      "valueColumn": "sym",
      "textColumn": "sym",
      "showSearch": true,
      "forceSelect": false
    },
    {
      "pathEnc": "Trade%20Filter%2FstartDate",
      "displayName": "Start Date",
      "fieldType": "Datepicker"
    },
    {
      "pathEnc": "Trade%20Filter%2FendDate",
      "displayName": "End Date",
      "fieldType": "Datepicker"
    },
    {
      "pathEnc": "Trade%20Filter%2FminQty",
      "displayName": "Min Qty",
      "fieldType": "Number",
      "increment": 100,
      "useDecimalPlaces": false
    }
  ],
  "basics": {
    "submitButtonText": "Filter",
    "showReset": true,
    "floatSubmit": false
  },
  "style": {
    "display": "Row",
    "inline": "Top",
    "minWidth": "15%"
  },
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 4, "colSpan": 36 }
}
```

### Resulting component JSON (fragment)

```json
{
  "id": "<uuid>",
  "key": "Dataform",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "27",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.4.0",
    "isDataform": true,
    "Basics": {
      "Name": "",
      "Data": { "_dashboardsType": "data", "value": "tradeResults" },
      "SubmitButtonText": "Filter",
      "ValidationAnalytic": "",
      "ExpandDictParameters": true,
      "ForceExecute": false,
      "ShowReset": true,
      "ShowSubmit": true,
      "FloatSubmit": false,
      "FloatReset": false,
      "ViewStates": [
        {
          "PathEnc": "Trade%20Filter%2Fsym",
          "DisplayName": "Symbol",
          "HideParameter": false,
          "Tooltip": "",
          "AllowNulls": true,
          "FieldType": {
            "_Type": "Dropdown",
            "Data": { "_dashboardsType": "data", "value": "symList" },
            "AcceptEmptyValues": false,
            "ForceSelect": false,
            "MultiSelect": false,
            "ShowSearch": true,
            "AdvancedSearch": false,
            "FieldSummaryThreshold": 5,
            "TooltipSummaryThreshold": 5,
            "SelectAllValue": "",
            "SelectAllDefault": false,
            "SortListBySelected": false,
            "DataSourceMapping": { "Value": "sym", "Text": "sym", "DropdownPossibleValues": [] },
            "Items": []
          }
        },
        {
          "PathEnc": "Trade%20Filter%2FstartDate",
          "DisplayName": "Start Date",
          "HideParameter": false,
          "Tooltip": "",
          "AllowNulls": true,
          "FieldType": { "_Type": "Datepicker", "Data": "", "ReadOnly": false, "DefaultDate": "" }
        },
        {
          "PathEnc": "Trade%20Filter%2FendDate",
          "DisplayName": "End Date",
          "HideParameter": false,
          "Tooltip": "",
          "AllowNulls": true,
          "FieldType": { "_Type": "Datepicker", "Data": "", "ReadOnly": false, "DefaultDate": "" }
        },
        {
          "PathEnc": "Trade%20Filter%2FminQty",
          "DisplayName": "Min Qty",
          "HideParameter": false,
          "Tooltip": "",
          "AllowNulls": true,
          "FieldType": { "_Type": "Number", "Increment": 100, "UseDecimalPlaces": false, "DecimalPlaces": 2 }
        }
      ],
      "Actions": []
    },
    "Style": {
      "padding": "",
      "labelPadding": "",
      "inline": "Top",
      "advanced": "",
      "labelAlign": "Left",
      "submitOffset": "",
      "resetOffset": "",
      "verticalSpacing": "",
      "minWidth": "15%",
      "labelWidth": "",
      "display": "Row",
      "formMargin": "",
      "cssClasses": ""
    },
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

## Few-Shot NLQ Examples

### 1. Basic text-input form

**Prompt:** Create a parameter form with three text fields: symbol, exchange, and currency, connected to the TradeQuery data source on connection tradefeed.

```json
{
  "componentType": "dataform",
  "name": "Query Params",
  "submitDataSource": "TradeQuery",
  "dataSources": [{
    "name": "TradeQuery",
    "connection": "tradefeed",
    "queryString": "{[sym; exchange; currency] select from Trades where sym=sym, exchange=exchange, currency=currency}",
    "columns": ["time", "sym", "exchange", "currency", "price"],
    "subscriptionType": "static",
    "params": [
      { "name": "sym",      "viewStatePath": "Query Params/sym",      "type": "symbol" },
      { "name": "exchange", "viewStatePath": "Query Params/exchange", "type": "symbol" },
      { "name": "currency", "viewStatePath": "Query Params/currency", "type": "symbol" }
    ]
  }],
  "viewStates": [
    { "name": "Query Params/sym",      "type": "symbol", "default": "" },
    { "name": "Query Params/exchange", "type": "symbol", "default": "" },
    { "name": "Query Params/currency", "type": "symbol", "default": "" }
  ],
  "formFields": [
    { "pathEnc": "Query%20Params%2Fsym",      "displayName": "Symbol",   "fieldType": "Default" },
    { "pathEnc": "Query%20Params%2Fexchange", "displayName": "Exchange", "fieldType": "Default" },
    { "pathEnc": "Query%20Params%2Fcurrency", "displayName": "Currency", "fieldType": "Default" }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 36 }
}
```

---

### 2. Dropdown + datepicker form

**Prompt:** Build a dataform that has a symbol dropdown populated from a data source called SymbolList (sym column for both value and text), and a date picker for trade date. On submit it re-executes a kdb+ query on connection html5evalcongroup.

```json
{
  "componentType": "dataform",
  "name": "Trade Params",
  "submitDataSource": "tradeData",
  "dataSources": [
    {
      "name": "tradeData",
      "connection": "html5evalcongroup",
      "queryString": "{[sym; tradeDate] select from Trades where sym=sym, date=tradeDate}",
      "columns": ["time", "sym", "price", "qty"],
      "subscriptionType": "static",
      "params": [
        { "name": "sym",       "viewStatePath": "Trade Params/sym",       "type": "symbol" },
        { "name": "tradeDate", "viewStatePath": "Trade Params/tradeDate", "type": "date"   }
      ]
    },
    {
      "name": "SymbolList",
      "connection": "html5evalcongroup",
      "queryString": "select sym from SymbolList",
      "columns": ["sym"],
      "subscriptionType": "static"
    }
  ],
  "viewStates": [
    { "name": "Trade Params/sym",       "type": "symbol", "default": "" },
    { "name": "Trade Params/tradeDate", "type": "date",   "default": "" }
  ],
  "formFields": [
    {
      "pathEnc": "Trade%20Params%2Fsym",
      "displayName": "Symbol",
      "fieldType": "Dropdown",
      "dataSource": "SymbolList",
      "valueColumn": "sym",
      "textColumn": "sym",
      "showSearch": true
    },
    {
      "pathEnc": "Trade%20Params%2FtradeDate",
      "displayName": "Trade Date",
      "fieldType": "Datepicker"
    }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 36 }
}
```

---

### 3. Number spinner + slider form

**Prompt:** Create a risk parameter form with a quantity number field (increment 100, no decimals) and a confidence slider from 0 to 100, connected to connection riskconn.

```json
{
  "componentType": "dataform",
  "name": "Risk Params",
  "submitDataSource": "riskData",
  "dataSources": [{
    "name": "riskData",
    "connection": "riskconn",
    "queryString": "{[qty; confidence] select from RiskTable where qty=qty, confidence=confidence}",
    "columns": ["sym", "qty", "confidence", "pnl"],
    "subscriptionType": "static",
    "params": [
      { "name": "qty",        "viewStatePath": "Risk Params/qty",        "type": "int"   },
      { "name": "confidence", "viewStatePath": "Risk Params/confidence", "type": "float" }
    ]
  }],
  "viewStates": [
    { "name": "Risk Params/qty",        "type": "int",   "default": 0 },
    { "name": "Risk Params/confidence", "type": "float", "default": 50 }
  ],
  "formFields": [
    {
      "pathEnc": "Risk%20Params%2Fqty",
      "displayName": "Quantity",
      "fieldType": "Number",
      "increment": 100,
      "useDecimalPlaces": false
    },
    {
      "pathEnc": "Risk%20Params%2Fconfidence",
      "displayName": "Confidence %",
      "fieldType": "Slider",
      "range": false,
      "showTicks": true
    }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 36 }
}
```

---

### 4. Form with Reset button + single-select dropdown

**Prompt:** Make a dataform named Trade Filter with symbol (dropdown from SymList), start date (datepicker), end date (datepicker), and show both a Submit and a Reset button, using connection kdbprod.

```json
{
  "componentType": "dataform",
  "name": "Trade Filter",
  "submitDataSource": "filteredTrades",
  "dataSources": [
    {
      "name": "filteredTrades",
      "connection": "kdbprod",
      "queryString": "{[sym; startDate; endDate] select from Trades where sym=sym, date within (startDate; endDate)}",
      "columns": ["time", "sym", "price", "qty"],
      "subscriptionType": "static",
      "params": [
        { "name": "sym",       "viewStatePath": "Trade Filter/sym",       "type": "symbol" },
        { "name": "startDate", "viewStatePath": "Trade Filter/startDate", "type": "date"   },
        { "name": "endDate",   "viewStatePath": "Trade Filter/endDate",   "type": "date"   }
      ]
    },
    {
      "name": "SymList",
      "connection": "kdbprod",
      "queryString": "select sym from SymbolList",
      "columns": ["sym"],
      "subscriptionType": "static"
    }
  ],
  "viewStates": [
    { "name": "Trade Filter/sym",       "type": "symbol", "default": "" },
    { "name": "Trade Filter/startDate", "type": "date",   "default": "" },
    { "name": "Trade Filter/endDate",   "type": "date",   "default": "" }
  ],
  "formFields": [
    {
      "pathEnc": "Trade%20Filter%2Fsym",
      "displayName": "Symbol",
      "fieldType": "Dropdown",
      "dataSource": "SymList",
      "valueColumn": "sym",
      "textColumn": "sym",
      "showSearch": true
    },
    {
      "pathEnc": "Trade%20Filter%2FstartDate",
      "displayName": "Start Date",
      "fieldType": "Datepicker"
    },
    {
      "pathEnc": "Trade%20Filter%2FendDate",
      "displayName": "End Date",
      "fieldType": "Datepicker"
    }
  ],
  "basics": { "showReset": true, "floatSubmit": false },
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 36 }
}
```

---

### 5. Form writing to a virtual data source (display in Datagrid)

**Prompt:** Create a form that takes two inputs — a boolean flag and a double value — and shows the submitted values in a datagrid below, using connection health-demo|idb.

```json
{
  "componentType": "dataform",
  "name": "Input Form",
  "submitDataSource": "formOutput",
  "dataSources": [{
    "name": "formOutput",
    "connection": "health-demo|idb",
    "dataType": "virtual",
    "columns": ["flag", "value"],
    "subscriptionType": "static"
  }],
  "viewStates": [
    { "name": "Input Form/flag",  "type": "boolean", "default": false },
    { "name": "Input Form/value", "type": "double",  "default": "" }
  ],
  "formFields": [
    { "pathEnc": "Input%20Form%2Fflag",  "displayName": "Flag",  "fieldType": "Default" },
    { "pathEnc": "Input%20Form%2Fvalue", "displayName": "Value", "fieldType": "Default" }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 36 }
}
```

Then manually add `_virtualParams` and `_virtualQueryString` to the virtual data source (generate.js does not yet auto-build the virtual query string — build it as follows):

```json
"formOutput": {
  "_dataType": "virtual",
  "_dataSource": "kdb",
  "_connection": "health-demo|idb",
  "_columns": ["flag", "value"],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "static",
  "_virtualParams": [
    { "name": "flag",  "index": 0, "type": "viewstate", "value": "Input Form/flag",  "isVirtual": true },
    { "name": "value", "index": 1, "type": "viewstate", "value": "Input Form/value", "isVirtual": true }
  ],
  "_virtualQueryString": "function (flag, value, callback) {\n  callback({\n    columns: [\"flag\", \"value\"],\n    meta: { \"flag\": 1, \"value\": 9 },\n    rows: [{ \"flag\": flag, \"value\": value }]\n  });\n}"
}
```

---

### 6. Password field + username text field

**Prompt:** Add a login form with a username text field and a password field, binding to the AuthQuery data source on connection authconn.

```json
{
  "componentType": "dataform",
  "name": "Login",
  "submitDataSource": "AuthQuery",
  "dataSources": [{
    "name": "AuthQuery",
    "connection": "authconn",
    "queryString": "{[username; password] .auth.login[username; password]}",
    "columns": ["status", "message"],
    "subscriptionType": "static",
    "params": [
      { "name": "username", "viewStatePath": "Login/username", "type": "string" },
      { "name": "password", "viewStatePath": "Login/password", "type": "string" }
    ]
  }],
  "viewStates": [
    { "name": "Login/username", "type": "string", "default": "" },
    { "name": "Login/password", "type": "string", "default": "" }
  ],
  "formFields": [
    { "pathEnc": "Login%2Fusername", "displayName": "Username", "fieldType": "Default" },
    { "pathEnc": "Login%2Fpassword", "displayName": "Password", "fieldType": "Password" }
  ],
  "basics": { "submitButtonText": "Log In", "showReset": false },
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 20 }
}
```

---

### 7. Float-submit compact inline form

**Prompt:** Create a compact inline form with a symbol dropdown and a date picker. The submit button should float at the bottom. Use connection tradefeed.

```json
{
  "componentType": "dataform",
  "name": "Quick Filter",
  "submitDataSource": "quickData",
  "dataSources": [
    {
      "name": "quickData",
      "connection": "tradefeed",
      "queryString": "{[sym; dt] select from Trades where sym=sym, date=dt}",
      "columns": ["time", "sym", "price"],
      "subscriptionType": "static",
      "params": [
        { "name": "sym", "viewStatePath": "Quick Filter/sym", "type": "symbol" },
        { "name": "dt",  "viewStatePath": "Quick Filter/dt",  "type": "date"   }
      ]
    },
    {
      "name": "symData",
      "connection": "tradefeed",
      "queryString": "select sym from SymbolList",
      "columns": ["sym"],
      "subscriptionType": "static"
    }
  ],
  "viewStates": [
    { "name": "Quick Filter/sym", "type": "symbol", "default": "" },
    { "name": "Quick Filter/dt",  "type": "date",   "default": "" }
  ],
  "formFields": [
    {
      "pathEnc": "Quick%20Filter%2Fsym",
      "displayName": "Symbol",
      "fieldType": "Dropdown",
      "dataSource": "symData",
      "valueColumn": "sym",
      "textColumn": "sym"
    },
    {
      "pathEnc": "Quick%20Filter%2Fdt",
      "displayName": "Date",
      "fieldType": "Datepicker"
    }
  ],
  "basics": { "floatSubmit": true, "showReset": false },
  "style": { "display": "Row", "inline": "Left", "minWidth": "20%" },
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 4, "colSpan": 36 }
}
```

---

### 8. Multi-select dropdown form

**Prompt:** Build a data form with a multi-select dropdown for symbols (populated from SymbolData, text and value both sym column), connected to connection kdbconn.

```json
{
  "componentType": "dataform",
  "name": "Symbol Selector",
  "submitDataSource": "symbolData",
  "dataSources": [
    {
      "name": "symbolData",
      "connection": "kdbconn",
      "queryString": "{[syms] select from Trades where sym in syms}",
      "columns": ["time", "sym", "price", "qty"],
      "subscriptionType": "static",
      "params": [
        { "name": "syms", "viewStatePath": "Symbol Selector/syms", "type": "symbol" }
      ]
    },
    {
      "name": "SymbolData",
      "connection": "kdbconn",
      "queryString": "select sym from SymbolList",
      "columns": ["sym"],
      "subscriptionType": "static"
    }
  ],
  "viewStates": [
    { "name": "Symbol Selector/syms", "type": "list", "default": [] }
  ],
  "formFields": [
    {
      "pathEnc": "Symbol%20Selector%2Fsyms",
      "displayName": "Symbols",
      "fieldType": "Dropdown",
      "dataSource": "SymbolData",
      "valueColumn": "sym",
      "textColumn": "sym",
      "multiSelect": true,
      "showSearch": true,
      "selectAllValue": "all",
      "selectAllDefault": false,
      "sortListBySelected": true
    }
  ],
  "chartLayout": { "row": 0, "column": 0, "rowSpan": 3, "colSpan": 36 }
}
```

**Key multi-select fields in component JSON:**
```json
{
  "_Type": "Dropdown",
  "Data": { "_dashboardsType": "data", "value": "SymbolData" },
  "MultiSelect": true,
  "ShowSearch": true,
  "SelectAllValue": "all",
  "SelectAllDefault": false,
  "SortListBySelected": true,
  "DataSourceMapping": {
    "Value": "sym",
    "Text": "sym",
    "DropdownPossibleValues": []
  },
  "AcceptEmptyValues": false,
  "ForceSelect": false,
  "FieldSummaryThreshold": 5,
  "TooltipSummaryThreshold": 5,
  "Items": []
}
```

> ViewState type for multi-select is `"list"` (not `"symbol"`). The submitted value is a kdb+ list of symbols.

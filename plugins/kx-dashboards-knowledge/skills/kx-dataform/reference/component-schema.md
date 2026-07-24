# kx-dataform — Component JSON Schema Reference

> The raw KX Dashboards Dataform component structure and field types. Back to [SKILL.md](../SKILL.md).

**Contents:** Component Structure · Basics · Form Field (ViewStates entry) · Field Types · Style · ViewState Setup

---

## Component Structure (Full Options)

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
    "Basics": {},
    "Style": {},
    "Alignment": {},
    "format": {}
  }
}
```

---

## Basics

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<submitDataSourceName>" },
  "SubmitButtonText": "Submit",
  "ValidationAnalytic": "",
  "ExpandDictParameters": true,
  "ForceExecute": false,
  "ShowReset": false,
  "ShowSubmit": true,
  "FloatSubmit": false,
  "FloatReset": false,
  "ViewStates": [],
  "Actions": []
}
```

**`ViewStates`** is an array of form field descriptors — one entry per visible field (see Field Types below).

---

## Form Field (ViewStates entry)

```json
{
  "PathEnc": "<URL-encoded ViewState path>",
  "DisplayName": "<label shown in the form>",
  "HideParameter": false,
  "Tooltip": "",
  "AllowNulls": true,
  "FieldType": { /* see Field Types */ }
}
```

### PathEnc encoding rule

| Raw ViewState path | PathEnc value |
|---|---|
| `"Dataform 1/sym"` | `"Dataform%201%2Fsym"` |
| `"TradeForm/startDate"` | `"TradeForm%2FstartDate"` |
| `"Risk Params/threshold"` | `"Risk%20Params%2Fthreshold"` |

**Rule:** URL-encode the full path string: space (`' '`) → `%20`, slash (`/`) → `%2F`.

---

## Field Types

### Default (text input)

Renders a plain text input. Used for strings, symbols, and any type where the default input widget suffices.

```json
{
  "_Type": "Default",
  "Data": "",
  "DataSourceMapping": {},
  "Items": [],
  "DropdownPossibleValues": []
}
```

### Dropdown

Populates a drop-down list from a data source or a static items list.

```json
{
  "_Type": "Dropdown",
  "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
  "AcceptEmptyValues": false,
  "ForceSelect": false,
  "MultiSelect": false,
  "ShowSearch": false,
  "AdvancedSearch": false,
  "FieldSummaryThreshold": 5,
  "TooltipSummaryThreshold": 5,
  "SelectAllValue": "",
  "SelectAllDefault": false,
  "SortListBySelected": false,
  "UseCustom": false,
  "DataSourceMapping": {
    "Value": "<valueColumn>",
    "Text": "<textColumn>",
    "DropdownPossibleValues": []
  },
  "Custom": { "Icon": "", "IconColor": "" },
  "Items": []
}
```

**`Items`** (static list, no data source needed):
```json
"Items": [
  { "Value": "Buy",  "Text": "Buy" },
  { "Value": "Sell", "Text": "Sell" }
]
```

### Number

Renders a numeric spinner with configurable increment and decimal places.

```json
{
  "_Type": "Number",
  "Increment": 1,
  "UseDecimalPlaces": false,
  "DecimalPlaces": 2
}
```

### Datepicker

Renders a date picker widget.

```json
{
  "_Type": "Datepicker",
  "Data": "",
  "ReadOnly": false,
  "DefaultDate": ""
}
```

`DefaultDate` format: `"YYYY-MM-DD"` (e.g. `"2024-01-15"`).

### Slider

Renders a horizontal slider for numeric ranges.

```json
{
  "_Type": "Slider",
  "Data": "",
  "Range": false,
  "Tooltip": false,
  "ShowTicks": false,
  "Formatter": ""
}
```

`Range: true` creates a two-handle range slider (min/max). `Formatter` is a printf-style format string for the displayed value.

### Password

Renders a masked text input for sensitive values.

```json
{
  "_Type": "Password"
}
```

---

## Style

```json
{
  "padding": "",
  "labelPadding": "",
  "inline": "Top",
  "advanced": "",
  "labelAlign": "Left",
  "submitOffset": "",
  "resetOffset": "",
  "verticalSpacing": "",
  "minWidth": "11%",
  "labelWidth": "",
  "display": "Row",
  "formMargin": "",
  "cssClasses": ""
}
```

| `display` | Layout |
|---|---|
| `"Row"` | Fields arranged left-to-right in a row |
| `"Column"` | Fields stacked vertically |

| `inline` | Label position |
|---|---|
| `"Top"` | Label above the input |
| `"Left"` | Label to the left |
| `"Right"` | Label to the right |
| `"None"` | No label displayed |

---

## ViewState Setup

Dataform fields use **grouped ViewStates** under a common group name (the form name).

```json
"viewState": {
  "Dataform 1": {
    "sym":       { "_viewType": true, "_type": "symbol",  "_default": "" },
    "startDate": { "_viewType": true, "_type": "date",    "_default": "2024-01-01" },
    "endDate":   { "_viewType": true, "_type": "date",    "_default": "2024-12-31" },
    "qty":       { "_viewType": true, "_type": "int",     "_default": 0 },
    "flag":      { "_viewType": true, "_type": "boolean", "_default": false }
  }
}
```

**Supported `_type` values for form fields:**

| ViewState type | Form behaviour |
|---|---|
| `"boolean"` | Checkbox |
| `"byte"` | Number input (range −128 to 127) |
| `"short"` | Number input |
| `"int"` | Number input |
| `"long"` | Number input |
| `"float"` | Number input (single precision) |
| `"double"` | Number input (double precision) |
| `"char"` | Single-character text input |
| `"string"` | Text input |
| `"symbol"` | Text input (kdb+ symbol, no leading backtick needed) |
| `"guid"` | Text input with UUID format validation |
| `"date"` | Date picker |
| `"datetime"` | Date-time picker |
| `"timestamp"` | Date-time picker with nanosecond precision |
| `"time"` | Time picker |
| `"month"` | Month picker |
| `"second"` | Second-resolution time |
| `"minute"` | Minute-resolution time |
| `"list"` | Multi-value input |

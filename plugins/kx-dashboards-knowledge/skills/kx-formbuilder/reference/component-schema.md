# kx-formbuilder — Component Schema

> Full component JSON envelope, Basics, Elements, field types, validators, Style, Actions, and StateOutput. Back to [SKILL.md](../SKILL.md).

**Contents:** Component Structure · Basics · Elements · Field Types · Validators · Style · Actions · StateOutput

---

## Component Structure

```json
{
  "id": "<uuid>",
  "key": "FormBuilder",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "1014",
  "hasOnSettingsChange": true,
  "options": {
    "version": "4.7.7",
    "Basics": {},
    "Actions": [],
    "StateOutput": [],
    "Elements": [],
    "Style": {}
  }
}
```

---

## Basics

```json
{
  "Name": "",
  "Title": "Form",
  "FormDefinition": "",
  "FormValues": ""
}
```

| Field | Type | Default | Description |
|---|---|---|---|
| `Name` | string | `""` | Internal component name (not displayed) |
| `Title` | string | `"Form"` | Heading shown above the form fieldset |
| `FormDefinition` | viewstate binding or `""` | `""` | Bind to a ViewState that holds a kdb-defined form schema. When set, `Elements` is ignored. |
| `FormValues` | viewstate binding or `""` | `""` | Two-way binding: pre-populates fields on load; updated with current values after every change. |

**ViewState binding syntax** (standard dashboard binding object):
```json
"FormDefinition": { "_dashboardsType": "viewstate", "value": "MyFormSchema" }
```

---

## Elements

`Elements` is an array of field objects. Each object represents one input field or group.

### Field object

```json
{
  "id": "sym",
  "title": "Symbol",
  "default": "",
  "hidden": false,
  "disabled": false,
  "ignoreOnChange": false,
  "classes": "",
  "type": { "_Type": "symbol" },
  "validators": []
}
```

| Property | Type | Default | Description |
|---|---|---|---|
| `id` | string | auto-generated | Unique field key. Used as the property name in the output values object. Must be unique across all Elements (including nested groups). |
| `title` | string | `id` | Label shown next to the input |
| `default` | string | `""` | Default value rendered when the form first loads |
| `hidden` | boolean | `false` | Hides the field from the rendered form |
| `disabled` | boolean | `false` | Renders the input as disabled |
| `ignoreOnChange` | boolean | `false` | Excludes this field from the `Change` trigger's output values |
| `classes` | string | `""` | CSS classes added to the field wrapper element |
| `type` | object | `{ "_Type": "symbol" }` | Field type descriptor — see **Field Types** below |
| `validators` | array | `[]` | Validation rules — see **Validators** below |

---

## Field Types

Set `type._Type` to one of the following values.

### Text types

| `_Type` | Input rendered | Notes |
|---|---|---|
| `symbol` | Text input | Use `password: true` on the `type` object for a password field |
| `string` | Text input | Same UI as `symbol`; output type differs |
| `char` | Single-character text input | Restricts entry to one character |
| `guid` | Text input with UUID format | |

```json
{ "_Type": "symbol" }
{ "_Type": "symbol", "password": true }
{ "_Type": "string" }
```

### Numeric types

| `_Type` | Input rendered |
|---|---|
| `byte` | Integer spinner (−128 to 127) |
| `short` | Integer spinner |
| `int` | Integer spinner |
| `long` | Integer spinner |
| `real` | Decimal number input (single precision) |
| `float` | Decimal number input (double precision) |

```json
{ "_Type": "int" }
{ "_Type": "float" }
```

### Boolean type

| `_Type` | Input rendered |
|---|---|
| `boolean` | Checkbox |

```json
{ "_Type": "boolean" }
```

### Date / time types

| `_Type` | Input rendered |
|---|---|
| `date` | Date picker |
| `datetime` | Date-time picker |
| `timestamp` | Date-time picker (nanosecond precision) |
| `time` | Time picker |
| `timespan` | Duration input |
| `minute` | Minute-resolution time |
| `second` | Second-resolution time |
| `month` | Month picker |

```json
{ "_Type": "date" }
{ "_Type": "timestamp" }
```

### Dropdown type (`list`)

Renders a dropdown (single-select or multi-select). Populate from a data source or a static items list.

```json
{
  "_Type": "list",
  "forceSelect": false,
  "multiSelect": false,
  "Data": "",
  "DataSourceMapping": {
    "Value": "",
    "Text": "",
    "DropdownPossibleValues": []
  },
  "Items": [],
  "DropdownPossibleValues": []
}
```

| Property | Default | Description |
|---|---|---|
| `forceSelect` | `false` | Always pre-select the first option; do not allow empty selection |
| `multiSelect` | `false` | Allow multiple selections; output values are stored comma-separated |
| `Data` | `""` | Data source binding — `{ "_dashboardsType": "data", "value": "<sourceName>" }` |
| `DataSourceMapping.Value` | `""` | Column name from `Data` used as the submitted value |
| `DataSourceMapping.Text` | `""` | Column name from `Data` used as the display label |
| `Items` | `[]` | Static option list: `[{ "Value": "Buy", "Text": "Buy" }, ...]` |

**Static list example:**
```json
{
  "id": "side",
  "title": "Side",
  "type": {
    "_Type": "list",
    "Items": [
      { "Value": "Buy",  "Text": "Buy" },
      { "Value": "Sell", "Text": "Sell" }
    ]
  },
  "validators": []
}
```

**Data-source-backed list example:**
```json
{
  "id": "sym",
  "title": "Symbol",
  "type": {
    "_Type": "list",
    "Data": { "_dashboardsType": "data", "value": "SymbolList" },
    "DataSourceMapping": {
      "Value": "sym",
      "Text": "sym",
      "DropdownPossibleValues": []
    },
    "Items": []
  },
  "validators": []
}
```

### Group type

Renders a `<fieldset>` with a `<legend>` containing nested child fields.

```json
{
  "id": "tradeDetails",
  "title": "Trade Details",
  "type": {
    "_Type": "group",
    "layout": "Column"
  },
  "Elements": [
    {
      "id": "sym",
      "title": "Symbol",
      "default": "",
      "hidden": false,
      "disabled": false,
      "ignoreOnChange": false,
      "classes": "",
      "type": { "_Type": "symbol" },
      "validators": []
    }
  ],
  "validators": []
}
```

| Property | Default | Description |
|---|---|---|
| `type.layout` | `"Column"` | `"Column"` — fields stacked vertically; `"Row"` — fields arranged horizontally |
| `Elements` | `[]` | Child field objects (same schema as top-level Elements, supports further nesting) |

> ⚠️ Group `id` values still contribute to the output values object. Ensure all nested field `id` values are globally unique.

---

## Validators

Each element carries a `validators` array. Each validator object:

```json
{
  "type": "<validator-name>",
  "message": "Custom error message",
  "disabled": false
}
```

### Available validators

#### `required`
```json
{ "type": "required", "message": "This field is required", "disabled": false }
```

#### `email`
```json
{ "type": "email", "message": "Enter a valid email address", "disabled": false }
```

#### `url`
```json
{ "type": "url", "message": "Enter a valid URL", "disabled": false }
```

#### `range`
```json
{
  "type": "range",
  "min": "0",
  "max": "100",
  "message": "Value must be between 0 and 100",
  "disabled": false
}
```

`min` and `max` are strings. Range validation also works on date/time field types.

#### `regexp`
```json
{
  "type": "regexp",
  "regexp": "^[A-Z]{1,5}$",
  "flags": "i",
  "message": "Must be 1–5 uppercase letters",
  "disabled": false
}
```

---

## Style

```json
{
  "Layout": "Column",
  "HideGroupBorders": false,
  "HideGroupTitles": false,
  "HideSubmit": false,
  "HideCancel": false,
  "FocusOnLoad": false,
  "Horizontal": "Center",
  "Vertical": "Middle",
  "LabelWidths": "100px",
  "MaxFormWidth": "100%",
  "SubmitButtonText": "Submit",
  "CancelButtonText": "Cancel"
}
```

| Field | Default | Description |
|---|---|---|
| `Layout` | `"Column"` | Top-level field arrangement: `"Column"` (stacked) or `"Row"` (side by side) |
| `HideGroupBorders` | `false` | Remove the fieldset border around group fields |
| `HideGroupTitles` | `false` | Hide group fieldset legends |
| `HideSubmit` | `false` | Hide the Submit button (useful for Change-triggered auto-submit forms) |
| `HideCancel` | `false` | Hide the Cancel button |
| `FocusOnLoad` | `false` | Auto-focus the first field when the component loads |
| `Horizontal` | `"Center"` | Horizontal alignment of the form: `"Left"` \| `"Center"` \| `"Right"` |
| `Vertical` | `"Middle"` | Vertical alignment of the form: `"Top"` \| `"Middle"` \| `"Bottom"` |
| `LabelWidths` | `"100px"` | CSS width for all field labels |
| `MaxFormWidth` | `"100%"` | CSS max-width for the entire form |
| `SubmitButtonText` | `"Submit"` | Label on the submit button |
| `CancelButtonText` | `"Cancel"` | Label on the cancel button |

---

## Actions

Placed in the `Actions` array. Fired when Trigger matches a button click (Submit/Cancel) or a field value change (Change).

```json
[
  {
    "_Type": "query",
    "Trigger": "Submit",
    "DataSource": { "_dashboardsType": "data", "value": "<dataSourceName>" }
  },
  {
    "_Type": "nav",
    "Trigger": "Cancel",
    "SelectDashboardScreen": {
      "dashboard": "<this>",
      "screen": "Overview",
      "_dashboardsType": "navigation"
    }
  },
  {
    "_Type": "map",
    "Trigger": "Submit",
    "TriggerColumn": "*",
    "Current": "<someFieldId>",
    "Target": { "_dashboardsType": "viewstate", "value": "selectedSym" }
  }
]
```

| `Trigger` | Fires when |
|---|---|
| `"Submit"` | User clicks the Submit button and all validators pass |
| `"Cancel"` | User clicks the Cancel button |
| `"Change"` | Any non-ignored field value changes |

> ⚠️ Use `"Change"` triggers with care — they fire on every keystroke for text fields. Combine with `ignoreOnChange: true` on fields that should not trigger the action.

---

## StateOutput

`StateOutput` is a separate array of map actions that write the form's collected values to a ViewState. Unlike `Actions`, `StateOutput` entries always write the full form values dict.

```json
[
  {
    "_Type": "map",
    "Trigger": "Submit",
    "Current": {},
    "Target": { "_dashboardsType": "viewstate", "value": "FormOutput" }
  }
]
```

| Field | Description |
|---|---|
| `Trigger` | `"Submit"` \| `"Cancel"` \| `"Change"` |
| `Current` | Auto-set to the form values dict at the time of the trigger — leave as `{}` |
| `Target` | The ViewState to write to |

The written value is a dict keyed by field `id`:
```json
{
  "sym":   { "value": "AAPL", "type": "symbol" },
  "qty":   { "value": 100,    "type": "int"    },
  "side":  { "value": "Buy",  "type": "symbol" },
  "price": { "value": 152.5,  "type": "float"  }
}
```
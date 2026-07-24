# kx-formbuilder — Examples

> One full worked Trade Entry Form plus five few-shot NLQ → JSON examples. Back to [SKILL.md](../SKILL.md).

**Contents:** Complete Example — Trade Entry Form · Few-Shot NLQ Examples (1–5)

---

## Complete Example — Trade Entry Form

A FormBuilder that collects symbol (dropdown), side (dropdown), quantity, and price, then re-executes a kdb+ query on submit.

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
    "Basics": {
      "Name": "Trade Entry",
      "Title": "Enter Trade",
      "FormDefinition": "",
      "FormValues": ""
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
        "type": {
          "_Type": "list",
          "Data": { "_dashboardsType": "data", "value": "SymbolList" },
          "DataSourceMapping": { "Value": "sym", "Text": "sym", "DropdownPossibleValues": [] },
          "forceSelect": false,
          "multiSelect": false,
          "Items": []
        },
        "validators": [{ "type": "required", "message": "Symbol is required", "disabled": false }]
      },
      {
        "id": "side",
        "title": "Side",
        "default": "Buy",
        "hidden": false,
        "disabled": false,
        "ignoreOnChange": false,
        "classes": "",
        "type": {
          "_Type": "list",
          "Items": [
            { "Value": "Buy",  "Text": "Buy"  },
            { "Value": "Sell", "Text": "Sell" }
          ],
          "forceSelect": true,
          "multiSelect": false,
          "Data": "",
          "DataSourceMapping": { "Value": "", "Text": "", "DropdownPossibleValues": [] }
        },
        "validators": []
      },
      {
        "id": "qty",
        "title": "Quantity",
        "default": "100",
        "hidden": false,
        "disabled": false,
        "ignoreOnChange": false,
        "classes": "",
        "type": { "_Type": "int" },
        "validators": [
          { "type": "required", "message": "Quantity is required", "disabled": false },
          { "type": "range", "min": "1", "max": "1000000", "message": "Quantity must be > 0", "disabled": false }
        ]
      },
      {
        "id": "price",
        "title": "Price",
        "default": "",
        "hidden": false,
        "disabled": false,
        "ignoreOnChange": false,
        "classes": "",
        "type": { "_Type": "float" },
        "validators": [{ "type": "required", "message": "Price is required", "disabled": false }]
      }
    ],
    "Actions": [
      {
        "_Type": "query",
        "Trigger": "Submit",
        "DataSource": { "_dashboardsType": "data", "value": "tradeQuery" }
      }
    ],
    "StateOutput": [
      {
        "_Type": "map",
        "Trigger": "Submit",
        "Current": {},
        "Target": { "_dashboardsType": "viewstate", "value": "TradeFormOutput" }
      }
    ],
    "Style": {
      "Layout": "Column",
      "HideGroupBorders": false,
      "HideGroupTitles": false,
      "HideSubmit": false,
      "HideCancel": true,
      "FocusOnLoad": true,
      "Horizontal": "Center",
      "Vertical": "Middle",
      "LabelWidths": "100px",
      "MaxFormWidth": "600px",
      "SubmitButtonText": "Submit Trade",
      "CancelButtonText": "Cancel"
    }
  }
}
```

---

## Few-Shot NLQ Examples

### 1. Simple symbol input form

**Prompt:** Create a form with a symbol field for a ticker and a date field for trade date, wired to a data source called tradeQuery on connection tradefeed.

```json
{
  "key": "FormBuilder",
  "definitionId": "1014",
  "options": {
    "version": "4.7.7",
    "Basics": { "Name": "", "Title": "Trade Filter", "FormDefinition": "", "FormValues": "" },
    "Elements": [
      {
        "id": "sym",
        "title": "Symbol",
        "default": "",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "symbol" },
        "validators": [{ "type": "required", "message": "Symbol is required", "disabled": false }]
      },
      {
        "id": "tradeDate",
        "title": "Trade Date",
        "default": "",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "date" },
        "validators": []
      }
    ],
    "Actions": [{ "_Type": "query", "Trigger": "Submit", "DataSource": { "_dashboardsType": "data", "value": "tradeQuery" } }],
    "StateOutput": [],
    "Style": {
      "Layout": "Column", "HideGroupBorders": false, "HideGroupTitles": false,
      "HideSubmit": false, "HideCancel": false, "FocusOnLoad": false,
      "Horizontal": "Center", "Vertical": "Middle",
      "LabelWidths": "100px", "MaxFormWidth": "100%",
      "SubmitButtonText": "Submit", "CancelButtonText": "Cancel"
    }
  }
}
```

---

### 2. Grouped fields (two fieldsets)

**Prompt:** Create a form with two sections: Trade Details (symbol, quantity) and Settlement (date, currency dropdown with USD/EUR/GBP).

```json
{
  "key": "FormBuilder",
  "definitionId": "1014",
  "options": {
    "version": "4.7.7",
    "Basics": { "Name": "", "Title": "Trade Entry", "FormDefinition": "", "FormValues": "" },
    "Elements": [
      {
        "id": "tradeDetails",
        "title": "Trade Details",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "group", "layout": "Column" },
        "Elements": [
          {
            "id": "sym",
            "title": "Symbol",
            "default": "",
            "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
            "type": { "_Type": "symbol" },
            "validators": [{ "type": "required", "message": "Symbol is required", "disabled": false }]
          },
          {
            "id": "qty",
            "title": "Quantity",
            "default": "0",
            "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
            "type": { "_Type": "int" },
            "validators": []
          }
        ],
        "validators": []
      },
      {
        "id": "settlement",
        "title": "Settlement",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "group", "layout": "Column" },
        "Elements": [
          {
            "id": "settleDate",
            "title": "Settlement Date",
            "default": "",
            "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
            "type": { "_Type": "date" },
            "validators": []
          },
          {
            "id": "currency",
            "title": "Currency",
            "default": "USD",
            "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
            "type": {
              "_Type": "list",
              "Items": [{ "Value": "USD", "Text": "USD" }, { "Value": "EUR", "Text": "EUR" }, { "Value": "GBP", "Text": "GBP" }],
              "forceSelect": true, "multiSelect": false,
              "Data": "", "DataSourceMapping": { "Value": "", "Text": "", "DropdownPossibleValues": [] }
            },
            "validators": []
          }
        ],
        "validators": []
      }
    ],
    "Actions": [],
    "StateOutput": [{ "_Type": "map", "Trigger": "Submit", "Current": {}, "Target": { "_dashboardsType": "viewstate", "value": "TradeValues" } }],
    "Style": {
      "Layout": "Column", "HideGroupBorders": false, "HideGroupTitles": false,
      "HideSubmit": false, "HideCancel": false, "FocusOnLoad": false,
      "Horizontal": "Center", "Vertical": "Middle",
      "LabelWidths": "120px", "MaxFormWidth": "100%",
      "SubmitButtonText": "Submit", "CancelButtonText": "Cancel"
    }
  }
}
```

---

### 3. Auto-submit on change (no buttons)

**Prompt:** Create a compact inline form with a symbol dropdown (from SymList) and a date picker that automatically re-runs the query whenever the user changes either field — no Submit button needed.

```json
{
  "key": "FormBuilder",
  "definitionId": "1014",
  "options": {
    "version": "4.7.7",
    "Basics": { "Name": "", "Title": "Filters", "FormDefinition": "", "FormValues": "" },
    "Elements": [
      {
        "id": "sym",
        "title": "Symbol",
        "default": "",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": {
          "_Type": "list",
          "Data": { "_dashboardsType": "data", "value": "SymList" },
          "DataSourceMapping": { "Value": "sym", "Text": "sym", "DropdownPossibleValues": [] },
          "forceSelect": false, "multiSelect": false, "Items": []
        },
        "validators": []
      },
      {
        "id": "tradeDate",
        "title": "Date",
        "default": "",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "date" },
        "validators": []
      }
    ],
    "Actions": [{ "_Type": "query", "Trigger": "Change", "DataSource": { "_dashboardsType": "data", "value": "liveQuery" } }],
    "StateOutput": [],
    "Style": {
      "Layout": "Row",
      "HideGroupBorders": true, "HideGroupTitles": true,
      "HideSubmit": true, "HideCancel": true,
      "FocusOnLoad": false,
      "Horizontal": "Left", "Vertical": "Middle",
      "LabelWidths": "80px", "MaxFormWidth": "100%",
      "SubmitButtonText": "Submit", "CancelButtonText": "Cancel"
    }
  }
}
```

---

### 4. Login form with password field

**Prompt:** Build a login form with username (symbol) and password fields. On submit, re-execute the AuthQuery data source.

```json
{
  "key": "FormBuilder",
  "definitionId": "1014",
  "options": {
    "version": "4.7.7",
    "Basics": { "Name": "", "Title": "Login", "FormDefinition": "", "FormValues": "" },
    "Elements": [
      {
        "id": "username",
        "title": "Username",
        "default": "",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "symbol" },
        "validators": [{ "type": "required", "message": "Username is required", "disabled": false }]
      },
      {
        "id": "password",
        "title": "Password",
        "default": "",
        "hidden": false, "disabled": false, "ignoreOnChange": false, "classes": "",
        "type": { "_Type": "symbol", "password": true },
        "validators": [{ "type": "required", "message": "Password is required", "disabled": false }]
      }
    ],
    "Actions": [{ "_Type": "query", "Trigger": "Submit", "DataSource": { "_dashboardsType": "data", "value": "AuthQuery" } }],
    "StateOutput": [],
    "Style": {
      "Layout": "Column", "HideGroupBorders": true, "HideGroupTitles": true,
      "HideSubmit": false, "HideCancel": false, "FocusOnLoad": true,
      "Horizontal": "Center", "Vertical": "Middle",
      "LabelWidths": "100px", "MaxFormWidth": "400px",
      "SubmitButtonText": "Log In", "CancelButtonText": "Cancel"
    }
  }
}
```

---

### 5. Form with kdb-defined schema (FormDefinition binding)

**Prompt:** Create a FormBuilder that gets its field definitions from a ViewState called DynamicSchema, and writes submitted values to a ViewState called DynamicValues.

```json
{
  "key": "FormBuilder",
  "definitionId": "1014",
  "options": {
    "version": "4.7.7",
    "Basics": {
      "Name": "",
      "Title": "Dynamic Form",
      "FormDefinition": { "_dashboardsType": "viewstate", "value": "DynamicSchema" },
      "FormValues":     { "_dashboardsType": "viewstate", "value": "DynamicValues" }
    },
    "Elements": [],
    "Actions": [{ "_Type": "query", "Trigger": "Submit", "DataSource": { "_dashboardsType": "data", "value": "processForm" } }],
    "StateOutput": [{ "_Type": "map", "Trigger": "Submit", "Current": {}, "Target": { "_dashboardsType": "viewstate", "value": "DynamicValues" } }],
    "Style": {
      "Layout": "Column", "HideGroupBorders": false, "HideGroupTitles": false,
      "HideSubmit": false, "HideCancel": false, "FocusOnLoad": false,
      "Horizontal": "Center", "Vertical": "Middle",
      "LabelWidths": "100px", "MaxFormWidth": "100%",
      "SubmitButtonText": "Submit", "CancelButtonText": "Cancel"
    }
  }
}
```

> When `FormDefinition` is bound, `Elements` must be `[]`. The kdb process populates the schema by writing to the `DynamicSchema` ViewState.

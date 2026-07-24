[← Back to SKILL.md](../SKILL.md)

# kx-datepicker — Component Schema & Field Reference

> The raw KX Dashboards DatePicker component structure, picker modes, Basics field reference, ViewState declarations, and the full component JSON.

**Contents:** Component Identity · Picker Modes · Basics · ViewState Declarations · Full Component JSON

---

# DATEPICKER

`key: "BasicComponents"` · `definitionId: "15"` · `ComponentName: "DatePicker"` · `version: "v2.10.0"`

A calendar-based date/time input. The picker mode is set by the ViewState type on `SelectedDate`.

## Picker Modes (set via ViewState `_type`)

| ViewState `_type` | Picker rendered | Notes |
|---|---|---|
| `"date"` | Calendar date only | Most common. Shows calendar popup + button. |
| `"datetime"` | Calendar + time | Shows calendar popup + time fields. |
| `"timestamp"` | Timestamp | Calendar popup, no button. |
| `"timespan"` | Timespan / duration | Spinner input, no calendar popup. |
| `"month"` | Month picker | Month + year only. |

## Basics

```json
{
  "ComponentName": "DatePicker",
  "Name": "",
  "Data": "",
  "DefaultDate": "",
  "Label": "pick date:",
  "SelectedDate": { "_dashboardsType": "viewstate", "value": "<dateViewState>" },
  "Theme": "Dark",
  "horizontal": "Center",
  "vertical": "Middle",
  "tooltip": "",
  "width": 150,
  "labelWidth": 75
}
```

| Field | Values / Notes |
|---|---|
| `SelectedDate` | **Required.** ViewState binding — receives the selected date. The ViewState `_type` determines the picker mode. |
| `Data` | Optional. Data source returning a distinct temporal kdb+ column. When set, only dates in the source are selectable. Key must exactly match the data source key in the `data` block. |
| `DefaultDate` | Applied after `Data` loads. Expressions: `"LAD"`, `"FAD"`, `"LAD-1"`, `"FAD+1"`, `"2026-01-01"`. Inactive without a `Data` binding — use ViewState `_default` instead. |
| `Label` | Text shown before the input field. |
| `width` | Width of the date input in pixels. |
| `labelWidth` | Width of the label in pixels. |
| `horizontal` | `"Left"` \| `"Center"` (default) \| `"Right"` |
| `vertical` | `"Top"` \| `"Middle"` (default) \| `"Bottom"` |
| `Theme` | `"Dark"` \| `"Light"` |

## ViewState Declarations

### Date (calendar) — hardcoded initial default (recommended)
```json
"selectedDate": { "_viewType": true, "_type": "date", "_default": "2020-01-02" }
```

### Datetime
```json
"selectedDatetime": { "_viewType": true, "_type": "datetime", "_default": "2020-01-02 00:00:00" }
```

### Timestamp
```json
"selectedTs": { "_viewType": true, "_type": "timestamp", "_default": "2020-01-02D00:00:00.000000000" }
```

### Timespan / duration
```json
"selectedSpan": { "_viewType": true, "_type": "timespan", "_default": "00:00:00" }
```

### Month
```json
"selectedMonth": { "_viewType": true, "_type": "month", "_default": "2020.01" }
```

> ⚠️ **Never use `"_default": ""`** — a null ViewState does not trigger dependent queries when the picker first fires (see the default hazard in SKILL.md).

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "15",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.10.0",
    "Basics": {
      "ComponentName": "DatePicker",
      "Name": "",
      "Data": "",
      "DefaultDate": "",
      "Label": "Date:",
      "SelectedDate": { "_dashboardsType": "viewstate", "value": "selectedDate" },
      "Theme": "Dark",
      "horizontal": "Center",
      "vertical": "Middle",
      "tooltip": "",
      "width": 150,
      "labelWidth": 50
    },
    "Actions": [],
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

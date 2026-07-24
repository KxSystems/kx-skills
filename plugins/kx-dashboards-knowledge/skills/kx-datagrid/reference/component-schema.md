[← Back to SKILL.md](../SKILL.md)

# kx-datagrid — Component Schema & Field Reference

> The raw KX Dashboards Datagrid component structure: the `Basics` block, the 33-field column template, the Format/Currency/DateFormat/HighlightRules field-reference tables, and the Tooltip, Selection, FileExport, Grouping, HighlightRules, CustomFilters, and Style blocks.

**Contents:** DATAGRID identity · Basics · ColumnsConfiguration (33-field template) · Field reference · Tooltip · Selection · FileExport · GroupingConfiguration & SummaryRow_Groupings · HighlightRules · CustomFilters · Style

---

# DATAGRID

`key: "Datagrid"` · `definitionId: "21"` · `version: "v2.20.0"`

---

## Basics

Key configurable fields (defaults shown — omit in sparse mode if unchanged):

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
  "Filtering": "Quick Search",
  "EditMode": "disabled",
  "ShowPagingControl": true,
  "EnableGrouping": true,
  "SortColumn": "",
  "SortOrder": "ascending",
  "FrozenColumnCount": 0,
  "LazyDataLoading": "disabled"
}
```

| Field | Values |
|---|---|
| `Filtering` | `"Quick Search"` \| `"Column Filters"` \| `"Advanced Column Filters"` \| `"disabled"` |
| `EditMode` | `"disabled"` \| `"enabled"` \| `"instant"` |
| `SortOrder` | `"ascending"` \| `"descending"` |
| `LazyDataLoading` | `"disabled"` \| `"cached"` \| `"uncached"` |

Full Basics (for full-mode output only):

```json
{
  "Name": "", "Data": { "_dashboardsType": "data", "value": "<dataSourceName>" },
  "Filtering": "Quick Search", "IsFilterVisible": true,
  "ShowPagingControl": true, "ShowPageState": false,
  "EnableGrouping": true, "GroupingAutoCollapse": false,
  "EnableCustomLayoutConfiguration": false, "ShowSampleGridData": false,
  "KeepNonExistentColumns": false, "EditMode": "disabled",
  "IsInsertable": false, "SortColumn": "", "SortOrder": "ascending",
  "KdbFilterString": "", "FilterOnEnterHit": false,
  "ScrollValueV": 0, "ExperimentalMode": false,
  "LazyDataLoading": "disabled", "ExpandOnPdf": false,
  "FooterData": "", "FrozenColumnCount": 0,
  "AutosaveMode": "enabled", "UseHierarchicalRules": true
}
```

---

## ColumnsConfiguration

**Sparse example** (default — only non-default fields):

```json
{ "Field": "price", "DisplayName": "Price", "Format": "Number", "Precision": 4, "TextAlign": "right", "HighlightChanges": true }
```

**Full 33-field template** (full mode only):

```json
{
  "UserDefined": false, "Field": "<kdb-column-name>", "DisplayName": "<header label>",
  "Tooltip": "", "Sortable": true, "Format": "General", "Precision": 2,
  "HideTrailingZeroes": false, "Currency": "none", "DateFormat": "YYYY-MM-DD",
  "TimeFormat": "HH:mm:ss", "HighlightNegativeColor": "",
  "HighlightChanges": false, "HighlightChangeDuration": 200,
  "ShowArrowsOnChange": false, "HighlightMinValueColor": "", "HighlightMaxValueColor": "",
  "RangeHighlightColor": "", "IsRangeHighlightColorInverted": false,
  "WidthWeight": 1, "MinWidthAbsolute": 1, "PercentageColorOverride": "",
  "IsReadonly": false, "IsSelectable": true, "TextAlign": "center",
  "Template": "", "SparklineOptions": {}, "Hidden": false,
  "Footer": "None", "FooterWeights": "", "Header": "none",
  "Filter": "", "RawCopy": false, "EditModeDropdownValues": ""
}
```

### Field reference

| Field | Values / notes |
|---|---|
| `Format` | `"General"` \| `"Number"` \| `"Formatted Number"` \| `"Smart Number"` \| `"Date"` \| `"Time"` \| `"DateTime"` \| `"Percentage"` \| `"Boolean"` \| `"Sparkline"` |
| `Currency` | `"none"` \| `"USD"` \| `"GBP"` \| `"EUR"` |
| `DateFormat` | `"YYYY-MM-DD"` \| `"DD/MM/YYYY"` \| `"MM/DD/YYYY"` \| `"D MMM YYYY"` \| `"MMM D, YYYY"` \| `"MMM YYYY"` (and other variants) |
| `TimeFormat` | `"HH:mm"` \| `"HH:mm:ss"` \| `"HH:mm:ss.SSS"` \| `"HH:mm:ss.SSSSSS"` \| `"HH:mm:ss.SSSSSSSSS"` |
| `TextAlign` | `"left"` \| `"center"` \| `"right"` |
| `Footer` | `"None"` \| `"Average"` \| `"Count"` \| `"Sum"` \| `"WeightedAverage"` |
| `Template` | Handlebars HTML string — `{{value}}`, `{{{field}}}` for unescaped HTML |
| `SparklineOptions` | JSON **string** (not object) when `Format` is `"Sparkline"` |

**Wildcard column** — default format for all unlisted columns:

```json
{ "Field": "*", "Format": "Number", "Precision": 2 }
```

---

## Tooltip

```json
{
  "Position": "cursor",
  "Template": "",
  "UseFormattedCellValue": false,
  "TestingPage": false
}
```

**`Position`:** `"none"` | `"right"` | `"left"` | `"cursor"`

Always use `"cursor"` when providing a `Template`. `"none"` disables the tooltip entirely.

> See **kx-handlebars** for template syntax. Context is the current row object — reference any column directly as `{{colName}}`.

---

## Selection

```json
{
  "Mode": "Area",
  "RowSelectionColumn": "",
  "SelectedValue": { "_dashboardsType": "viewstate", "value": "<viewStateName>" },
  "SelectedField": "<column-to-publish>",
  "FollowSelectedValue": false,
  "DefaultFallbackOnDeselect": true,
  "CheckboxAlignment": "none",
  "SelectOnCheckOnly": false,
  "Actions": []
}
```

**`Mode`:** `"Single Row"` | `"Multi Row"` | `"Area"` | `"Cell"` | `"None"`

### Actions (in `Selection.Actions`)

> See **kx-actions** for full reference. Datagrid-specific: include `TriggerColumn` (`"*"` or a column name) on every entry.

---

## FileExport

```json
{
  "ShowExportCsvButton": true, "ShowExportExcelButton": true,
  "ShowFullExportButton": false, "FileName": [],
  "CsvExportDelimiter": "", "RawFormat": false
}
```

---

## GroupingConfiguration & SummaryRow_Groupings

```json
"GroupingConfiguration": [{ "ColumnProperty": "<field-name>" }],
"SummaryRow_Groupings": [{
  "Function": "SUM", "Column": "<value-column>", "Label": "Total", "Color": "#ffffff"
}]
```

**`Function`:** `"SUM"` | `"AVG"` | `"MIN"` | `"MAX"` | `"WAVG"`

---

## HighlightRules

```json
{
  "Name": "<rule name>", "Enabled": true,
  "Target": "<column> | *", "ConditionSource": "<column> | <this>",
  "ConditionOperator": "==", "ConditionValue": "<threshold>",
  "RuleType": "discrete", "TargetElement": "background",
  "Color": "", "BackgroundColor": "", "Palette": [{ "color": "#hex" }]
}
```

| Field | Values |
|---|---|
| `ConditionOperator` | `"=="` \| `"!="` \| `"<"` \| `">"` \| `"<="` \| `">="` \| `"contains"` \| `"starts with"` \| `"ends with"` \| `"Fill Left-to-Right"` \| `"Fill Right-to-Left"` |
| `RuleType` | `"discrete"` \| `"gradient"` |
| `TargetElement` | `"background"` \| `"text"` \| `"border"` \| `"icon"` |
| `RuleMin` | Numeric lower bound for a `"gradient"` `RuleType` — the value mapped to the first `Palette` color |
| `RuleMax` | Numeric upper bound for a `"gradient"` `RuleType` — the value mapped to the last `Palette` color |

---

## CustomFilters

```json
{ "Name": "<column-field>", "Type": "Server Selection", "Data": { "_dashboardsType": "data", "value": "<filter-data-source>" } }
```

**`Type`:** `"Disabled"` | `"Selection"` | `"Server Selection"` | `"Number"` | `"DateTime"`

---

## Style

```json
{
  "Theme": "Dark",
  "EvenRowBackgroundColorOverride": "", "OddRowBackgroundColorOverride": "",
  "RowHeight": 30, "HeaderRowHeight": 30,
  "HeaderTextTransformation": "none"
}
```

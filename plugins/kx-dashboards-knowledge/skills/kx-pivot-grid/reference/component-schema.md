# kx-pivot-grid — Component JSON Schema Reference

> The full Pivot Grid `options` envelope, notation legend, and per-key property tables. Back to [SKILL.md](../SKILL.md).

**Contents:** Notation Legend · Component Identity · `options` (top-level) · Basics · Selection · Actions · HighlightRules · FileExport · Breakdown Columns · Aggregate Columns · Derived Arrays · Style · Alignment · format

---

## Notation Legend — read before emitting anything

The `options` object below is presented as **one annotated shape per top-level section**. Every documented key appears **exactly once**, inline in its section, as a slot. There is **no separate skeleton and no separate key-reference list** — the annotation *is* the reference. Do not duplicate any key across a skeleton and a reference list.

Each slot is one of two kinds:

- **`◆` Rule-Driven Slot (RDS).** The `◆` symbol marks a value that this skill's documented rule (or an explicit user instruction that maps to a documented key) determines. **Absent a documented reason or user instruction, emit the baseline value** shown in the sample JSON, recorded in the slot's inline annotation. Each RDS is annotated inline with: its UI label, type, allowed values, a one-line rule/description summary, its **baseline**, and any **Default Override**.
- **VERBATIM-LOCK constant (printed literally, no `◆`).** Emit the exact value shown — every number, string (including `""`), boolean, and nested object — **unchanged**. The sample is **not** a license to substitute a "similar", "reasonable", "rounded", or "tidied" value.

**Classification rule:** a key is an RDS **if and only if** it has a documented rule or description in this skill. Every other key — and every key inside an otherwise-undocumented nested block — is verbatim-lock.

**ViewState-ref objects.** Inside any `{ "_dashboardsType": "viewstate", "value": ... }` object, `"_dashboardsType"` is **always verbatim-lock** and **only `"value"` is an RDS**. The same holds for `{ "_dashboardsType": "data", "value": ... }` (only `"value"` is an RDS).

> The annotated shapes use `//` comments and the `◆` symbol for documentation **only**. Emitted KX JSON contains **no comments and no `◆`** — replace each `◆` with the resolved value (baseline unless a rule/user changes it).

**Authoritative byte source.** `reference/pivot-grid-baseline.json` is the byte-for-byte sample dashboard. It is the authoritative source for every verbatim-lock value and for the per-element object templates. When in doubt about a locked value, copy it from that file — not from memory.

---

## Component Identity

| Field | Value |
|---|---|
| `key` | `"Datatable"` (literal JSON only) |
| `definitionId` | `"3"` |
| Category | Grid |

The Pivot Grid uses the **same `key` and `definitionId`** as the Datatable, and the **same two column sets** as the Datatable (`BreakdownColumnsConfiguration` for breakdown columns and `ColumnsConfiguration` for aggregate columns, each with its `_`-prefixed replica).

The full component object (`id`, `layout`, `component`, `containerId`, `components`, `widgets`, …) comes from the **kx-dashboard-core** widget wrapper. The wrapper fields are verbatim-lock except the component `id` (a fresh UUID per core's UUID rules):

```jsonc
"component": {
  "id": "<uuid>",       // per kx-dashboard-core UUID rules
  "key": "Datatable",         // VERBATIM-LOCK (literal JSON; never shown to user as prose)
  "options": { /* see below */ },
  "containerId": null,         // VERBATIM-LOCK
  "components": [],            // VERBATIM-LOCK
  "widgets": [],              // VERBATIM-LOCK
  "definitionId": "3",         // VERBATIM-LOCK
  "hasOnSettingsChange": true  // VERBATIM-LOCK
}
```

---

## `options` — annotated shape (top-level)

```jsonc
"options": {
  "version": "v2.16.0",        // VERBATIM-LOCK (undocumented)
  "Basics":    { /* see § Basics */ },
  "Selection": { /* see § Selection */ },
  "Actions":   [ /* see § Actions — verbatim-lock block */ ],
  "HighlightRules": [ /* see § HighlightRules */ ],
  "FileExport":{ /* see § FileExport */ },
  "BreakdownColumnsConfiguration":  [ /* see § Breakdown Columns */ ],
  "_BreakdownColumnsConfiguration": [ /* EXACT replica of BreakdownColumnsConfiguration */ ],
  "datatablePossibleBreakdownColumns": [ /* see § Derived Arrays */ ],
  "ColumnsConfiguration":  [ /* see § Aggregate Columns */ ],
  "_ColumnsConfiguration": [ /* EXACT replica of ColumnsConfiguration */ ],
  "datatablePossibleColumns": [ /* see § Derived Arrays */ ],
  "Style":     { /* see § Style */ },
  "Alignment": { /* see § Alignment — verbatim-lock block */ },
  "format":    { /* see § format — verbatim-lock block */ },
  "selectedColumnPossibleValues":   [ /* see § Derived Arrays */ ],
  "highlightTargetPossibleValues":  [ /* see § Derived Arrays */ ],
  "highlightColumnsPossibleValues": [ /* see § Derived Arrays */ ]
}
```

---

### § Basics

```jsonc
"Basics": {

  // Name — UI "Name" — string
  // Friendly label shown when the author views the dashboard's component graph.
  // Rule: if a Name is not supplied, the assigned data source name may be used
  // (or user-friendly metadata from the data source / pivot columns). If multiple
  // Pivot Grids exist in one dashboard, names must be unique — append a
  // sequence-number suffix ONLY when a duplicate name would otherwise result.
  "Name": ◆,                          // ◆ RDS · baseline ""

  // Focus — UI "Focus" — type: "" | { "_dashboardsType":"viewstate", "value":"<viewStatePathName>" }
  // Links components (e.g. a Breadcrumbs component). When linking to a Breadcrumbs
  // component, Focus MUST be a viewstate ref and the Breadcrumbs "Basic.Path" MUST
  // be the SAME viewstate. The viewstate data type may be "symbol" (comma-separated
  // values per entry) or "list" (itemized values). If unlinked, emit "".
  "Focus": ◆,                         // ◆ RDS · baseline "" · when set: { "_dashboardsType":"viewstate" (LOCK), "value": ◆ }

  // Drilldown — UI "Single Column Drilldown" — boolean
  // true: drilldown uses/shows a single column for breakdown values.
  // false: drilldown adds the next breakdown column to the grid.
  // Default: true WHEN Focus is assigned to a viewstate; OTHERWISE false.
  // ⚠ NON-AUTHORITATIVE SAMPLE: baseline shows true but the sample's Focus is "",
  // so the documented default RESOLVES TO false. Compute from the rule; do not copy.
  "Drilldown": ◆,                     // ◆ RDS · baseline true (sample) · default = (Focus is viewstate) ? true : false

  // Data — UI (data source) — type: { "_dashboardsType":"data", "value":"<pivotDataSource>" }
  // The pivot data source feeding the grid (see § Pivot Data Source).
  "Data": {                           // ◆ RDS (union) · baseline = this object
    "_dashboardsType": "data",        // VERBATIM-LOCK
    "value": ◆                        // ◆ RDS · baseline "pivotQuery"
  },

  // ShowTools — UI "Show Tools" — boolean — controls for Drilldown, Filters, File Export.
  "ShowTools": ◆,                     // ◆ RDS · baseline true

  // Animate — UI "Animate" — boolean — smoothing animation on drilldown.
  "Animate": ◆,                       // ◆ RDS · baseline true

  // MultipleDrilldown — UI "Allow Multiple Paths" — boolean
  // Lets the user select multiple breakdown values from the same column.
  // Enabling it requires/disables Single Column Drilldown.
  "MultipleDrilldown": ◆,             // ◆ RDS · baseline false

  // DrilldownInputArea — UI "Drilldown Input Area" — enum: "Breakdown Cell" | "+/-"
  // "Breakdown Cell": whole cell triggers drilldown. "+/-": only the +/- control does.
  // Default: "+/-" WHEN Selection.RowSelectionMode is "cell"; OTHERWISE "Breakdown Cell".
  "DrilldownInputArea": ◆,            // ◆ RDS · baseline "Breakdown Cell" · default = (RowSelectionMode=="cell") ? "+/-" : "Breakdown Cell"

  // ExpandAll — UI "Show Expand All Button" — boolean
  // Adds a +/- control in breakdown headers to expand/collapse all values.
  "ExpandAll": ◆,                     // ◆ RDS · baseline false

  // ShowExpandedSummary — UI "Show Expanded Summary" — boolean
  // On a drilldown row, includes parent summary/subtotal values, not only children.
  // Default: false IF Single Column Drilldown (Basics.Drilldown) is enabled; OTHERWISE true.
  // ⚠ NON-AUTHORITATIVE SAMPLE: compute from resolved Drilldown; do not copy baseline.
  "ShowExpandedSummary": ◆,           // ◆ RDS · baseline false (sample) · default = Drilldown ? false : true

  // AggregateFunctionTooltip — UI "Aggregate Function Tooltip" — boolean
  // Shows a tooltip naming the aggregate function on hover ("Analytic" for custom).
  "AggregateFunctionTooltip": ◆,      // ◆ RDS · baseline true

  // SortColumn — UI "Sort Column" — string — default sort column.
  // Value: "" | one of selectedColumnPossibleValues.
  "SortColumn": ◆,                    // ◆ RDS · baseline ""

  // SortOrder — UI "Sort Order" — enum: "ascending" | "descending" (baseline is "")
  "SortOrder": ◆,                     // ◆ RDS · baseline ""

  // ScrollValue — UI "Scroll Value" — number — pixel distance from top to scroll position.
  "ScrollValue": ◆,                   // ◆ RDS · baseline "" (emit "" unless a numeric value is given)

  // ShowCache — UI "Show Cached Columns" — boolean — displays Cached Columns section.
  "ShowCache": ◆,                     // ◆ RDS · baseline false

  // UseCache — UI "Use Cached Columns" — boolean — pulls new agg/breakdown columns from cache.
  "UseCache": ◆,                      // ◆ RDS · baseline true

  // EnableCustomLayoutConfiguration — UI "Keep User Customizations" — boolean
  // Saves end-user size/position changes and reapplies on reload.
  "EnableCustomLayoutConfiguration": ◆, // ◆ RDS · baseline false

  // ColumnWidthMode — UI "Column Width Mode" — enum
  //   "Relative" | "Fixed" | "Fixed for User resized columns, otherwise Relative (Mixed Mode)"
  "ColumnWidthMode": ◆                // ◆ RDS · baseline "Relative" · Default Override "Relative"
}
```

---

### § Selection

```jsonc
"Selection": {
  // RowSelectionMode — UI "Selection" — enum: "none" | "row" | "cell"
  // Scope highlighted when a cell is selected/clicked. (Drives DrilldownInputArea default.)
  "RowSelectionMode": ◆,              // ◆ RDS · baseline "none" · Default Override "none"

  // RowSelectionColumn — UI "Selected Column" — string
  // Value: "" | one of selectedColumnPossibleValues.
  "RowSelectionColumn": ◆,            // ◆ RDS · baseline ""

  // SelectedValue — UI "Selected Value" — View State holding the selected value.
  // Value: "" | { "_dashboardsType":"viewstate", "value":"<viewStateName>" }
  "SelectedValue": ◆                  // ◆ RDS · baseline "" · when set: { "_dashboardsType":"viewstate" (LOCK), "value": ◆ }
}
```

---

### § Actions — VERBATIM-LOCK block

No documented keys. The **semantics** of `Actions` live in **kx-dashboard-core**. Emit exactly the baseline (`[]`). If the user requests an action that maps to the core Actions schema, each action's `Trigger` is limited to **`"Click"` | `"Double Click"` | `"Hover"` | `"Right Click"`** for this component.

```json
"Actions": []
```

---

### § HighlightRules

UI "Highlight Rules". Baseline `[]`. Build entries only on user request. Each element is an object with these keys (object shape and per-key allowed values are documented, so they are RDS; emit the per-key baseline/default otherwise):

```jsonc
// One HighlightRules element:
{
  // Name — UI "Name" — string — a name for the rule.
  "Name": ◆,                          // ◆ RDS · (e.g. "Color Green")
  // Enabled — boolean — default true.
  "Enabled": ◆,                       // ◆ RDS · default true
  // Target — UI "Target" — the Data Source column updated when the rule is true.
  // Value: one of highlightTargetPossibleValues. Default "*".
  "Target": ◆,                        // ◆ RDS · default "*"
  // ConditionSource — UI "Condition Source" — Data Source column monitored.
  // Value: one of highlightColumnsPossibleValues. Default "{breakdownId}".
  "ConditionSource": ◆,               // ◆ RDS · default "{breakdownId}"
  // ConditionOperator — UI "Condition Operator". Default "".
  // Value: "" | "contains" | "starts with" | "ends with" | "==" | "<" | ">" |
  //        "<=" | ">=" | "!=" | "Fill Left-to-Right" | "Fill Right-to-Left"
  // ("search" is also a supported operator per its description.)
  "ConditionOperator": ◆,             // ◆ RDS · default ""
  // ConditionValue — UI "Condition Value" — numeric or text; may map to a View State Parameter. Default "".
  "ConditionValue": ◆,                // ◆ RDS · default ""
  // Color — UI "Color" — hex color — text color when rule true. Default "".
  "Color": ◆,                         // ◆ RDS · default ""
  // BackgroundColor — UI "Background Color" — hex color — cell background when rule true. Default "".
  "BackgroundColor": ◆,               // ◆ RDS · default ""
  // BorderColor — UI "Border Color" — hex color — cell border when rule true. Default "".
  "BorderColor": ◆,                   // ◆ RDS · default ""
  // Icon — UI "Icon" — "" | FontAwesome or Material icon symbol name — icon when rule true. Default "".
  "Icon": ◆,                          // ◆ RDS · default ""
  // IconColor — UI "Icon Color" — hex color — icon color when rule true. Default "".
  "IconColor": ◆                      // ◆ RDS · default ""
}
```

---

### § FileExport

```jsonc
"FileExport": {
  // ShowExportCsvButton — UI "Show Export Csv Button" — boolean.
  "ShowExportCsvButton": ◆,           // ◆ RDS · baseline true
  // ShowExportExcelButton — UI "Show Export Excel Button" — boolean.
  "ShowExportExcelButton": ◆,         // ◆ RDS · baseline true
  // ShowFullExportButton — UI "Show Full Export Button" — boolean.
  "ShowFullExportButton": ◆,          // ◆ RDS · baseline false
  // FullExportOverride — UI "Full Export Override" — overrides the pivot dataset.
  // Value: "" | { "_dashboardsType":"data", "value":"<dataSource>" }
  "FullExportOverride": ◆,            // ◆ RDS · baseline "" · when set: { "_dashboardsType":"data" (LOCK), "value": ◆ }
  // RawFormat — UI "Export with Raw Format" — boolean.
  "RawFormat": ◆,                     // ◆ RDS · baseline false
  // FileName — UI "Filename" — array of objects. Each element's "FileNamePart" is
  // EITHER a static string OR a viewstate ref; elements may be mixed. Concatenating
  // the FileNamePart values in array order forms the export filename.
  //   [] | [ { "FileNamePart": "<text>" }, ... ]
  //      | [ { "FileNamePart": { "_dashboardsType":"viewstate","value":"<vsPath>" } }, ... ]
  "FileName": ◆,                      // ◆ RDS · baseline [] · default []
  // Actions — array of objects. Outputs details of the file export.
  //   [] | [ { "EventType": "all"|"onSuccess"|"onFail",
  //            "Result": { "_dashboardsType":"viewstate","value":"<vsPath>" } }, ... ]
  // EventType: when the handler fires (onSuccess after success, onFail on error, all on both).
  // Result: viewstate ref the outcome is written to.
  "Actions": ◆                        // ◆ RDS · baseline [] · default []
}
```

---

### § Breakdown Columns — `BreakdownColumnsConfiguration`

**One array element per breakdown column** (one per entry of the data source `_breakdownCols`, in index order). Across all elements, **every key/value is identical except** the four RDS keys below; the remaining keys are **verbatim-lock to the breakdown element template** (copy from `reference/pivot-grid-baseline.json`).

Per-element RDS rules:

- **`Field`** — value = the `_breakdownCols` element at the **same array index**.
- **`DisplayName`** — defaults to the element's `Field` value, unless field metadata (or an externally provided description) gives a user-friendly alternative.
- **`TextAlign`** — first element = `"left"`; every subsequent element = `"center"`. If the array has a single element, `"left"`.
- **`isBreakdown`** — last element = `false`; every preceding element = `true`. If the array has a single element, `false`.

Annotated element template (each documented key once; non-RDS keys are verbatim-lock):

```jsonc
{
  "Field": ◆,                 // ◆ RDS · = _breakdownCols[i]
  "DisplayName": ◆,           // ◆ RDS · = Field unless friendlier metadata exists
  "Tooltip": "",              // VERBATIM-LOCK · UI "Header Tooltip" (string; if blank, default tooltip is the column name)
  "TextAlign": ◆,             // ◆ RDS · first "left", rest "center"; single element "left"
  "Sortable": true,           // VERBATIM-LOCK · UI "Sortable" (boolean)
  "Format": "General",        // VERBATIM-LOCK · UI "Format" · "General"|"Number"|"Formatted Number"|"Smart Number"|"Date"|"Time"|"DateTime"|"Percentage"
  "Precision": 2,             // VERBATIM-LOCK · UI "Precision" (number; applies to Number/Formatted Number/Smart Number)
  "HideTrailingZeroes": false,// VERBATIM-LOCK · UI "Hide Trailing Zeroes" (boolean)
  "Currency": "none",         // VERBATIM-LOCK · UI "Currency Symbol" · "none"|"USD"|"GBP"|"EUR"
  "DateFormat": "YYYY-MM-DD", // VERBATIM-LOCK · UI "Date Format" (enum; see baseline)
  "TimeFormat": "HH:mm:ss",   // VERBATIM-LOCK · UI "Time Format" (enum; see baseline)
  "WidthWeight": 1,           // VERBATIM-LOCK · UI "Relative Width" (number; used by Relative/Mixed mode)
  "MinWidth": 1,              // VERBATIM-LOCK · UI "Minimum Width (px)" (number)
  "FixedWidth": 150,          // VERBATIM-LOCK · UI "Fixed Width (px)" (number; used by Fixed/Mixed mode)
  "PercentageColorOverride": "", // VERBATIM-LOCK · UI "Percentage Color" (hex; mini-bar color when Format is Percentage)
  "isBreakdown": ◆,           // ◆ RDS · last element false, preceding true; single element false
  "NoDisplay": false,         // VERBATIM-LOCK · UI "Hidden" (boolean; key is literally "NoDisplay" in breakdown elements)
  "Template": ""              // VERBATIM-LOCK · UI "Template" (HTML string; Handlebars helpers referencing the column name)
}
```

> Any per-element key above MAY be set on explicit user request that maps to its documented description (it is "described"), but only that key changes — all other elements keep the identical verbatim-lock value. Do not infer a mapping from a key name.

**`_BreakdownColumnsConfiguration`** is an **EXACT replica** of the resolved `BreakdownColumnsConfiguration` (same elements, same order, same values).

---

### § Aggregate Columns — `ColumnsConfiguration`

**One array element per aggregate column** (one per entry of the data source `_aggregateCols`, in index order). Across all elements, **every key/value is identical except** the RDS keys below; the remaining keys are **verbatim-lock to the aggregate element template** (copy from `reference/pivot-grid-baseline.json`).

Per-element RDS rules:

- **`Field`** — value = the `_aggregateCols` element at the **same array index**; **but** if the `_aggregateLabels` value at that same index is **not blank**, assign that `_aggregateLabels` value to `Field` instead.
- **`DisplayName`** — defaults to the element's `Field` value, unless field metadata (or an externally provided description) gives a user-friendly alternative.
- **`Format`** — locate the first `_aggregateCols` entry whose value equals this element's `Field`; use that index to read `_aggregateFns`. If that `_aggregateFns` value equals `"avg"`, set `Format` to `"Formatted Number"`; otherwise `"General"`.
- **`Precision`** — defaults to `4`.
- **`Footer`** — `"None"` | `"Average"` | `"Count"` | `"Sum"` | `"WeightedAverage"`. When not `"None"`, the footer row shows the selected calculated total. Default `"None"`.
- **`FooterWeights`** — only meaningful when `Footer` == `"WeightedAverage"`; identifies the aggregate column providing weights. Must be one of `datatablePossibleColumns`. Default `""`.

Annotated element template (each documented key once; non-RDS keys are verbatim-lock). Note the breakdown-column key definitions also apply here, plus the aggregate-only keys:

```jsonc
{
  "Field": ◆,                 // ◆ RDS · = _aggregateCols[i] (or _aggregateLabels[i] if non-blank)
  "DisplayName": ◆,           // ◆ RDS · = Field unless friendlier metadata exists
  "Tooltip": "",              // VERBATIM-LOCK · UI "Header Tooltip"
  "WidthWeight": 1,           // VERBATIM-LOCK · UI "Relative Width"
  "MinWidth": 1,              // VERBATIM-LOCK · UI "Minimum Width (px)"
  "FixedWidth": 150,          // VERBATIM-LOCK · UI "Fixed Width (px)"
  "TextAlign": "right",       // VERBATIM-LOCK · UI "Text Align" ("center"|"left"|"right")
  "Sortable": true,           // VERBATIM-LOCK · UI "Sortable"
  "Format": ◆,                // ◆ RDS · "Formatted Number" if its _aggregateFns is "avg", else "General"
  "Precision": ◆,             // ◆ RDS · default 4
  "HideTrailingZeroes": false,// VERBATIM-LOCK · UI "Hide Trailing Zeroes"
  "Currency": "none",         // VERBATIM-LOCK · UI "Currency Symbol"
  "DateFormat": "YYYY-MM-DD", // VERBATIM-LOCK · UI "Date Format"
  "TimeFormat": "HH:mm:ss",   // VERBATIM-LOCK · UI "Time Format"
  "HighlightNegative": true,  // VERBATIM-LOCK · UI "Highlight Negative" (boolean)
  "HighlightNegativeColor": "", // VERBATIM-LOCK · UI "Negative Color" (hex)
  "HighlightChanges": false,  // VERBATIM-LOCK · UI "Highlight Changes" (boolean; streaming/polling)
  "HighlightChangeDuration": 200, // VERBATIM-LOCK · UI "Highlight Change Duration" (ms)
  "ShowArrowsOnChange": false,// VERBATIM-LOCK · UI "Show arrows on Change" (boolean)
  "HighlightMinValue": false, // VERBATIM-LOCK · UI "Highlight Min Value" (boolean)
  "HighlightMinValueColor": "", // VERBATIM-LOCK · UI "Min Value Color" (hex)
  "HighlightMaxValue": false, // VERBATIM-LOCK · UI "Highlight Max Value" (boolean)
  "HighlightMaxValueColor": "", // VERBATIM-LOCK · UI "Max Value Color" (hex)
  "PercentageColorOverride": "", // VERBATIM-LOCK · UI "Percentage Color"
  "RangeHighlight": false,    // VERBATIM-LOCK · UI "Range Highlight" (boolean)
  "InvertRangeColor": false,  // VERBATIM-LOCK · UI "Invert Range Color" (boolean)
  "RangeHighlightColor": "",  // VERBATIM-LOCK · UI "Range Color" (hex)
  "isBreakdown": false,       // VERBATIM-LOCK (aggregate elements)
  "Hidden": false,            // VERBATIM-LOCK · UI "Hidden" (boolean; key is literally "Hidden" in aggregate elements)
  "Footer": ◆,                // ◆ RDS · default "None" · "None"|"Average"|"Count"|"Sum"|"WeightedAverage"
  "FooterWeights": ◆,         // ◆ RDS · default "" · required (one of datatablePossibleColumns) only when Footer=="WeightedAverage"
  "Template": ""              // VERBATIM-LOCK · UI "Template" (HTML)
}
```

> ⚠ Literal-key quirk: breakdown elements use the key `"NoDisplay"`; aggregate elements use the key `"Hidden"`. Both surface in the UI as "Hidden". Preserve each literal key exactly as the baseline shows — do not rename one to the other.

**`_ColumnsConfiguration`** is an **EXACT replica** of the resolved `ColumnsConfiguration` (same elements, same order, same values).

---

### § Derived Arrays (computed from the data source)

All five are computed; treat each as a single RDS whose rule is below. Use the **effective column names** (apply `_aggregateLabels` substitution wherever stated).

- **`datatablePossibleBreakdownColumns`** — identical to the data source `_breakdownCols`.
- **`datatablePossibleColumns`** — identical to `_aggregateCols`, **but** where `_aggregateLabels` at that same index is non-blank, use the `_aggregateLabels` value for that index.
- **`selectedColumnPossibleValues`** — the `_breakdownCols` values followed by the `_aggregateCols` values, applying the same `_aggregateLabels` substitution (non-blank label wins at that index).
- **`highlightTargetPossibleValues`** — same as `selectedColumnPossibleValues` (breakdown then aggregate, with label substitution), then append `"*"` as the **last** element.
- **`highlightColumnsPossibleValues`** — `"{breakdownId}"` as the **first** element, then the `_breakdownCols` values, then the `_aggregateCols` values, applying the same `_aggregateLabels` substitution.

Sample (for `_breakdownCols = ["sym","src"]`, `_aggregateCols = ["size","price"]`, blank labels):

```json
"datatablePossibleBreakdownColumns": ["sym","src"],
"datatablePossibleColumns":          ["price","size"],
"selectedColumnPossibleValues":      ["sym","src","size","price"],
"highlightTargetPossibleValues":     ["sym","src","size","price","*"],
"highlightColumnsPossibleValues":    ["{breakdownId}","sym","src","size","price"]
```

> The sample's `datatablePossibleColumns` is ordered `["price","size"]`. Order within these arrays is not asserted by a rule beyond what is stated above; when reproducing the sample, match it. When authoring fresh, follow the stated composition rule.

---

### § Style

```jsonc
"Style": {
  // advanced — UI "Advanced CSS" — string (CSS).
  "advanced": ◆,                      // ◆ RDS · baseline ""
  // cssClasses — UI "CSS Classes" — string.
  "cssClasses": ◆,                    // ◆ RDS · baseline ""
  // Theme — UI "Theme" — enum: "Dark" | "Light".
  // Rule: set "Light" only if the user requests a Light theme; otherwise "Dark".
  "Theme": ◆,                         // ◆ RDS · baseline "Dark"
  // EvenRowBackgroundColorOverride — UI "Even Row Background" — hex.
  "EvenRowBackgroundColorOverride": ◆, // ◆ RDS · baseline "#282828"
  // OddRowBackgroundColorOverride — UI "Odd Row Background" — hex.
  "OddRowBackgroundColorOverride": ◆,  // ◆ RDS · baseline "#303030"
  // SelectedRowBackgroundColor — UI "Selected Row Background" — hex.
  "SelectedRowBackgroundColor": ◆,    // ◆ RDS · baseline "#505050"
  // ExpandedSummaryStyle — UI "Expanded Summary Style" — boolean
  // Background color, underline, bold text for the expanded summary when enabled.
  // Default: false IF Basics.ShowExpandedSummary is false; OTHERWISE true.
  // ⚠ NON-AUTHORITATIVE SAMPLE: compute from resolved ShowExpandedSummary; do not copy baseline.
  "ExpandedSummaryStyle": ◆,          // ◆ RDS · baseline false (sample) · default = ShowExpandedSummary ? true : false
  // ShowFilterIconInFooter — UI "Show Filter Icon in Footer" — boolean.
  "ShowFilterIconInFooter": ◆,        // ◆ RDS · baseline true · Default Override true
  // RowHeight — UI "Row Height" — number.
  "RowHeight": ◆,                     // ◆ RDS · baseline 30
  // HeaderRowHeight — UI "Header Row Height" — number.
  "HeaderRowHeight": ◆,               // ◆ RDS · baseline 30
  // HeaderTextTransformation — UI "Header Text Transformation" — enum:
  //   "uppercase" | "lowercase" | "capitalize" | "none"
  "HeaderTextTransformation": ◆,      // ◆ RDS · baseline "none"
  // HeaderFontWeight — UI "Header Font Weight" — enum: "" | "normal" | "bold"
  "HeaderFontWeight": ◆,              // ◆ RDS · baseline ""
  // FontFamily — UI "Font Family" — enum (see baseline for exact allowed strings):
  //   "" | "Arial, Helvetica, sans-serif" | '"Courier New", Courier, monospace'
  //   | "Tahoma, Geneva, sans-serif" | '"Times New Roman", Times, serif'
  //   | "Verdana, Geneva, sans-serif"
  "FontFamily": ◆,                    // ◆ RDS · baseline ""
  // FontSize — UI "Font size" — string (CSS size, e.g. 18px, 0.8em, 80%).
  "FontSize": ◆                       // ◆ RDS · baseline ""
}
```

---

### § Alignment — VERBATIM-LOCK block

No documented keys. Semantics live in **kx-dashboard-core**; the values here are the verbatim baseline. Emit exactly:

```json
"Alignment": {
  "paddingLeft": 0,
  "paddingRight": 0,
  "paddingTop": 0,
  "paddingBottom": 0,
  "innerPaddingLeft": 0,
  "innerPaddingRight": 0,
  "innerPaddingTop": 0,
  "innerPaddingBottom": 0,
  "titlePaddingLeft": 0,
  "titlePaddingRight": 0,
  "titlePaddingTop": 7,
  "titlePaddingBottom": 7
}
```

### § format — VERBATIM-LOCK block

No documented keys. Semantics live in **kx-dashboard-core**; the values here are the verbatim baseline. Emit exactly:

```json
"format": {
  "titleFontSize": 16,
  "titleHorizontal": "Center",
  "titleShadow": false,
  "tileBorderWidth": 0,
  "tileBorderRounding": 0,
  "tileBorderColor": "#000000",
  "tileBackgroundColor": "#000000",
  "tileTransparentBackground": true,
  "tileShadow": false
}
```
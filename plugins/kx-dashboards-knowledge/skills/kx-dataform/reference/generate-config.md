# kx-dataform — generate.js Config Reference

> Config keys for `generate.js` with `componentType: "dataform"`. Back to [SKILL.md](../SKILL.md).

**Contents:** generate.js config · formFields entry · basics overrides · style overrides

---

## generate.js config

Set `componentType: "dataform"`.

| Field | Type | Description |
|---|---|---|
| `submitDataSource` | string | Name of the data source executed on submit |
| `formFields` | Array | Field definitions (see below) |
| `basics` | object | Basics block overrides |
| `style` | object | Style block overrides |
| `chartLayout` | object | Widget grid position |
| `dataSources` | Array | Data source descriptors (same as other component types) |
| `viewStates` | Array | ViewState descriptors — use grouped `"FormName/field"` paths |

### formFields entry

| Field | Type | Default | Description |
|---|---|---|---|
| `pathEnc` | string | required | URL-encoded ViewState path: `"FormName%2FfieldName"` |
| `displayName` | string | pathEnc | Label shown next to the input |
| `fieldType` | string | `"Default"` | `"Default"` \| `"Dropdown"` \| `"Number"` \| `"Datepicker"` \| `"Slider"` \| `"Password"` |
| `allowNulls` | boolean | `true` | Whether null/empty is a valid submission value |
| `hideParameter` | boolean | `false` | Hides this field from the rendered form |
| `tooltip` | string | `""` | Tooltip text shown on hover |
| `dataSource` | string | — | Dropdown/Datepicker: name of the backing data source |
| `valueColumn` | string | — | Dropdown: column used as the submitted value |
| `textColumn` | string | — | Dropdown: column used as the display label |
| `multiSelect` | boolean | `false` | Dropdown: allow multiple selections |
| `showSearch` | boolean | `false` | Dropdown: show search box |
| `advancedSearch` | boolean | `false` | Dropdown: enable advanced search |
| `forceSelect` | boolean | `false` | Dropdown: require the user to pick a value |
| `acceptEmptyValues` | boolean | `false` | Dropdown: allow submitting with no selection |
| `fieldSummaryThreshold` | number | `5` | Dropdown: number of items before a summary count is shown |
| `selectAllValue` | string | `""` | Dropdown: value used when "Select All" is chosen |
| `selectAllDefault` | boolean | `false` | Dropdown: pre-select all items by default |
| `sortListBySelected` | boolean | `false` | Dropdown: sort selected items to the top |
| `items` | Array | `[]` | Dropdown: static items `[{ value, text }]` |
| `increment` | number | `1` | Number: spinner step size |
| `useDecimalPlaces` | boolean | `false` | Number: enforce decimal places |
| `decimalPlaces` | number | `2` | Number: decimal places when `useDecimalPlaces` is true |
| `readOnly` | boolean | `false` | Datepicker: prevent manual date editing |
| `defaultDate` | string | `""` | Datepicker: initial date in `YYYY-MM-DD` format |
| `range` | boolean | `false` | Slider: use a range (two handles) |
| `showTicks` | boolean | `false` | Slider: display tick marks |
| `formatter` | string | `""` | Slider: format string for the displayed value |

### basics overrides

| Field | Default | Description |
|---|---|---|
| `submitButtonText` | `"Submit"` | Label on the submit button |
| `showSubmit` | `true` | Show the submit button |
| `showReset` | `false` | Show the reset button |
| `floatSubmit` | `true` | Sticky submit button pinned to the bottom of the form |
| `floatReset` | `false` | Sticky reset button |
| `forceExecute` | `false` | Re-execute data source even if values haven't changed |
| `expandDictParameters` | `true` | Expand dict-type query parameters |
| `validationAnalytic` | `""` | Name of an analytic run for field-level validation |

### style overrides

| Field | Default | Description |
|---|---|---|
| `display` | `"Row"` | `"Row"` — fields left-to-right; `"Column"` — fields stacked |
| `inline` | `"Top"` | Label position: `"Top"` \| `"Left"` \| `"Right"` \| `"None"` |
| `labelAlign` | `"Left"` | `"Left"` \| `"Center"` \| `"Right"` |
| `minWidth` | `""` | Minimum field width (CSS value, e.g. `"11%"`) |
| `labelWidth` | `""` | Fixed label width (CSS value) |
| `labelPadding` | `""` | Padding around labels |
| `padding` | `""` | Outer padding |
| `verticalSpacing` | `""` | Vertical gap between fields |
| `submitOffset` | `""` | Offset applied to the submit button |
| `resetOffset` | `""` | Offset applied to the reset button |
| `formMargin` | `""` | Form-level margin |

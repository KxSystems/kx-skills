[← Back to SKILL.md](../SKILL.md)

# kx-datepicker — Worked Examples

> Copy-ready DatePicker patterns: simple picker, full linked picker→datagrid, query filter shapes, LAD default, timespan input, and offset expressions.

**Contents:** Simple picker · Linked picker + datagrid · Exact-vs-range queries · Available dates + LAD · Datagrid filtered by date · Timespan input · DefaultDate offsets

---

## Common Patterns

### Simple date picker (no data source)

When there is no `Data` binding, set the initial date via `_default` on the ViewState directly.
`DefaultDate` has no effect without a data source.

```json
// ViewState — _default sets the initial picker value
"selectedDate": { "_viewType": true, "_type": "date", "_default": "2020-01-02" }

// Component Basics
{
  "ComponentName": "DatePicker",
  "SelectedDate": { "_dashboardsType": "viewstate", "value": "selectedDate" },
  "Label": "Date:",
  "width": 150,
  "labelWidth": 50
}
```

---

### Date picker with available dates + filtered datagrid (full linked pattern)

This is the canonical pattern for linking a DatePicker to a Datagrid via a shared ViewState.
The picker and grid are **decoupled** — they do not reference each other directly. The ViewState
is the single shared signal: the picker writes to it, the data source reads from it.

**Three parts must align:**
1. The ViewState name (e.g. `selectedDate`) — declared once, used by both picker and query param
2. The `AvailableDates` data source — populates the picker calendar with selectable dates
3. The `SPXFiltered` data source — re-executes automatically when `selectedDate` changes

```json
// 1. ViewState — declared at dashboard level
"selectedDate": { "_viewType": true, "_type": "date", "_default": "2020-01-02" }

// 2. AvailableDates data source — use `select distinct` to avoid duplicate calendar entries
"AvailableDates": {
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "html5evalcongroup",
  "_queryString": "select distinct Date from SPX",
  "_queryParams": [],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "static"
}

// 3. DatePicker component — Data key must exactly match the data source key above
{
  "ComponentName": "DatePicker",
  "Data": { "_dashboardsType": "data", "value": "AvailableDates" },
  "DefaultDate": "LAD",
  "SelectedDate": { "_dashboardsType": "viewstate", "value": "selectedDate" },
  "Label": "Select Date",
  "width": 150,
  "labelWidth": 75
}

// 4. SPXFiltered data source — uses <= for range filter; re-executes on selectedDate change
"SPXFiltered": {
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "html5evalcongroup",
  "_queryString": "{[d] select from SPX where Date <= d}",
  "_queryParams": [
    {
      "name": "d",
      "index": 0,
      "type": "date",
      "value": "<%selectedDate%>",
      "IsKdbParam": true,
      "isViewState": true
    }
  ],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "static"
}

// 5. Datagrid component — binds to SPXFiltered, not to the picker directly
{
  "Name": "SPX Data",
  "Data": { "_dashboardsType": "data", "value": "SPXFiltered" }
}
```

**How it flows:**
```
User picks date
  → selectedDate ViewState updates
    → SPXFiltered query re-executes with new date param
      → Datagrid re-renders with filtered data
```

---

### Exact-match vs range-filter query patterns

The query on the filtered data source determines what the date selection means:

| Intent | Query pattern |
|---|---|
| Show only rows on the selected date | `{[d] select from trade where date = d}` |
| Show all rows up to and including selected date | `{[d] select from trade where date <= d}` |
| Show rows from selected date onward | `{[d] select from trade where date >= d}` |
| Show rows in a date range (two pickers) | `{[s;e] select from trade where date within (s;e)}` |

---

### Date picker with available dates from a data source + LAD default

```json
// ViewState
"selectedDate": { "_viewType": true, "_type": "date", "_default": "2020-01-02" }

// Data source — select distinct to deduplicate
"availableDates": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "select distinct date from trade",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}

// Component Basics
{
  "ComponentName": "DatePicker",
  "Data": { "_dashboardsType": "data", "value": "availableDates" },
  "DefaultDate": "LAD",
  "SelectedDate": { "_dashboardsType": "viewstate", "value": "selectedDate" },
  "Label": "Date:",
  "width": 150, "labelWidth": 50
}
```

---

### Datagrid filtered by selected date (exact match)

```json
// Data source that uses the selected date
"tradeData": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "{[d] select from trade where date=d}",
  "_queryParams": [
    {
      "name": "d", "index": 0, "type": "date",
      "value": "<%selectedDate%>",
      "IsKdbParam": true, "isViewState": true
    }
  ],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

> The `value` field in `_queryParams` uses `<%vsName%>` syntax (plain angle brackets).

---

### Timespan input

```json
// ViewState
"selectedSpan": { "_viewType": true, "_type": "timespan", "_default": "00:00:00" }

// Component Basics
{
  "ComponentName": "DatePicker",
  "SelectedDate": { "_dashboardsType": "viewstate", "value": "selectedSpan" },
  "Label": "Duration:",
  "width": 180, "labelWidth": 75
}
```

No calendar popup is shown; a spinner input is rendered instead.

---

### DefaultDate offset expressions

| Expression | Resolves to |
|---|---|
| `"LAD"` | Last available date in the data source |
| `"FAD"` | First available date in the data source |
| `"LAD-1"` | Second-to-last available date |
| `"FAD+2"` | Third available date |
| `"2026-01-15"` | Hardcoded date (must exist in source to be selectable) |

Offsets clamp to the nearest valid date if out of bounds.
These expressions only work when `Data` is bound. Without a data source, set `_default` on the ViewState instead.

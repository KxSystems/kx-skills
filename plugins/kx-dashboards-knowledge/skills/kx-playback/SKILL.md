---
name: kx-playback
description: "Generate KX Dashboards PlayBack component: time-series playback controller (definitionId=47, key=PlayBack). Use for: playback, time-series replay, animate data, step through events, timeline scrubber, playback speed control, data animation. Mode=Event steps through data rows; Mode=Time uses a time column. Selected ViewState receives the current position. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX PlayBack Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

## ⚠️ PlayBack-Specific Hazards

1. **`key` is `"PlayBack"`** — not `"BasicComponents"`. This is the only component with a dedicated top-level key outside BasicComponents.
2. **`Selected` must be a ViewState binding** — it receives the current playback position and drives all components that react to playback. Omitting it means nothing updates during playback.
3. **`SelectedColumn` must match a column in the data source** — it is the column whose value is published to `Selected` at each playback step. If left blank, nothing is published.
4. **`TimeColumn` is only relevant in `Mode: "Time"`** — in `Mode: "Event"` it is unused. In `Mode: "Time"`, `TimeColumn` specifies the timestamp column used to derive playback timing.
5. **`Mode: "Event"` steps through data rows sequentially** — `IntervalTime` controls the delay in seconds between steps. `Mode: "Time"` uses the values in `TimeColumn` to derive real elapsed time between steps.
6. **`Playing: 0` is the stopped state** — do not set `Playing` to a non-zero value in the initial JSON; the component manages this field at runtime.
7. **Data source must be sorted by `SelectedColumn` using `` `col xasc `` ** — PlayBack steps through rows in the order they arrive from the data source; unsorted data produces non-sequential playback. Always prepend `` `<column> xasc `` to the query, e.g. `` `Date xasc select distinct Date from SPX ``.

---

# PLAYBACK

`key: "PlayBack"` · `definitionId: "47"` · `version: "4.7.7"`

A time-series playback controller. Steps through a data source row by row (Event mode) or by time (Time mode), publishing the current position to a ViewState that other components subscribe to.

## Basics

```json
{
  "Name": "",
  "Data": { "_dashboardsType": "data", "value": "<timeSeriesDataSource>" },
  "Selected": { "_dashboardsType": "viewstate", "value": "<currentPositionViewState>" },
  "SelectedColumn": "<value-column>",
  "TimeColumn": "<timestamp-column>",
  "Mode": "Event",
  "Speed": "1x",
  "Playing": 0,
  "MaxOverallTime": 60,
  "IntervalTime": 1,
  "speedControl": false,
  "multiStateControl": false,
  "ForcePause": false,
  "DisplayWarning": false
}
```

| Field | Values / Notes |
|---|---|
| `Data` | **Required.** Data source with the time-series rows to step through. |
| `Selected` | **Required.** ViewState binding — receives the current position value at each step. |
| `SelectedColumn` | Column from the data source whose value is published to `Selected`. |
| `TimeColumn` | Column containing timestamps. Used only in `Mode: "Time"`. |
| `Mode` | `"Event"` (default) — steps row by row at `IntervalTime` intervals. `"Time"` — derives timing from `TimeColumn`. |
| `Speed` | `"1x"` \| `"2x"` \| `"4x"` \| `"8x"` \| `"16x"` — playback speed multiplier. |
| `IntervalTime` | Seconds between steps in `Mode: "Event"`. Default: `1`. |
| `MaxOverallTime` | Maximum playback duration in seconds. Default: `60`. |
| `speedControl` | `true` — show the speed selector UI. |
| `multiStateControl` | `true` — show multi-state playback controls. |
| `ForcePause` | `true` — force the controller into the paused state (default `false`). |
| `DisplayWarning` | `true` — show a warning if data is large or playback may be slow. |
| `Playing` | Runtime state (`0` = stopped). Set to `0` in initial JSON. |
| `possiblePeriod` | Options-level runtime array of available playback periods. Emit as `[]` in initial JSON. |

## ViewState

The `Selected` ViewState type should match the type of `SelectedColumn`. Common types:

```json
// For a timestamp column
"currentTs": { "_viewType": true, "_type": "timestamp", "_default": "" }

// For a symbol or string column
"currentSym": { "_viewType": true, "_type": "symbol", "_default": "" }

// For a numeric index column
"currentIdx": { "_viewType": true, "_type": "long", "_default": 0 }
```

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "PlayBack",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "47",
  "hasOnSettingsChange": true,
  "options": {
    "version": "4.7.7",
    "possiblePeriod": [],
    "Basics": {
      "Name": "",
      "Data": { "_dashboardsType": "data", "value": "<timeSeriesDataSource>" },
      "Selected": { "_dashboardsType": "viewstate", "value": "<currentPositionViewState>" },
      "SelectedColumn": "<value-column>",
      "TimeColumn": "<timestamp-column>",
      "Mode": "Event",
      "Speed": "1x",
      "Playing": 0,
      "MaxOverallTime": 60,
      "IntervalTime": 1,
      "speedControl": false,
      "multiStateControl": false,
      "ForcePause": false,
      "DisplayWarning": false
    },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0
    },
    "Style": { "advanced": "" },
    "format": {}
  }
}
```

---

## Common Patterns

### Event-mode playback — step through trade data by symbol

```json
// ViewState — receives the sym value at each step
"currentSym": { "_viewType": true, "_type": "symbol", "_default": "" }

// Data source — sorted ascending by the playback column
"tradeHistory": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "`time xasc select time, sym, price from trade where date=.z.d",
  "_autoExecute": true, "_autoExec": true, "_subscriptionType": "static"
}

// PlayBack Basics
{
  "Data": { "_dashboardsType": "data", "value": "tradeHistory" },
  "Selected": { "_dashboardsType": "viewstate", "value": "currentSym" },
  "SelectedColumn": "sym",
  "Mode": "Event",
  "Speed": "1x",
  "IntervalTime": 1,
  "speedControl": true
}
```

A Datagrid or ChartGL bound to a data source parameterised by `currentSym` updates at each step.

### Time-mode playback

```json
// Data source — sorted ascending by the time column
"priceHistory": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "`time xasc select time, price from trade where date=.z.d",
  "_autoExecute": true, "_autoExec": true, "_subscriptionType": "static"
}

// PlayBack Basics
{
  "Data": { "_dashboardsType": "data", "value": "priceHistory" },
  "Selected": { "_dashboardsType": "viewstate", "value": "currentTime" },
  "SelectedColumn": "time",
  "TimeColumn": "time",
  "Mode": "Time",
  "Speed": "2x",
  "MaxOverallTime": 60
}
```

In Time mode, `IntervalTime` is ignored; playback speed is governed by the actual time differences between `TimeColumn` values scaled by `Speed`.

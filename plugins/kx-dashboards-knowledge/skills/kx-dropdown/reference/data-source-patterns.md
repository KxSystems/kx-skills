# kx-dropdown — Data Source & Action Patterns

> Data source shapes for populating a dropdown and the Actions pattern for publishing extra columns on selection. Back to [SKILL.md](../SKILL.md).

**Contents:** Data Source Patterns · Actions (Publishing Additional Columns)

---

## Data Source Patterns

### Static query — distinct values from a kdb+ table
```json
"symList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "select distinct sym from Trade",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

### Multi-column query — value column differs from display column
```json
"instrumentList": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "select sym, name from InstrumentRef",
  "_queryParams": [],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

### ViewState-parameterised — server-side cascade by another selection
```json
"filteredSyms": {
  "_dataType": "query", "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "{[exch] select distinct sym from InstrumentRef where exchange=exch}",
  "_queryParams": [
    {
      "name": "exch", "index": 0, "type": "symbol",
      "value": "<%selectedExchange%>", "IsKdbParam": true, "isViewState": true
    }
  ],
  "_autoExecute": true, "_autoExec": true,
  "_subscriptionType": "static"
}
```

---

## Actions — Publishing Additional Columns on Selection

> See **kx-actions** for full action type reference. Dropdown-specific rules: place in `options.Actions` (root level, **not** inside `Basics`); only `"Click"` trigger is supported; the primary column is published via `SelectedValue` + `DataSourceMapping.Value` — use `Actions` for additional columns only. Never use `SelectedObjectRouting` (removed in v4.3.1).

---

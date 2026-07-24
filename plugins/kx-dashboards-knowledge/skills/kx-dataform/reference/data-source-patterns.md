# kx-dataform — Data Source Patterns

> How to wire the submit data source (kdb+ query vs virtual). Back to [SKILL.md](../SKILL.md).

**Contents:** Pattern A — kdb+ query · Pattern B — virtual · kdb+ type codes

---

## Data Source Patterns

### Pattern A — kdb+ Query Data Source (recommended for live queries)

The Dataform submits values into grouped ViewStates, and a kdb+ query data source reads them as parameters. The component's `Data` points to this query source; submitting the form re-executes it.

```json
"<submitDataSource>": {
  "_dataType": "query",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_queryString": "{[sym; startDate; endDate] select from Trades where sym=sym, date within (startDate; endDate)}",
  "_queryParams": [
    { "name": "sym",       "index": 0, "type": "symbol", "value": "<%Dataform 1/sym%>",       "IsKdbParam": true, "isViewState": true },
    { "name": "startDate", "index": 1, "type": "date",   "value": "<%Dataform 1/startDate%>", "IsKdbParam": true, "isViewState": true },
    { "name": "endDate",   "index": 2, "type": "date",   "value": "<%Dataform 1/endDate%>",   "IsKdbParam": true, "isViewState": true }
  ],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "static"
}
```

**Inline param syntax:** `"<%ViewStatePath%>"` — use the raw (non-encoded) grouped path, e.g. `"<%Dataform 1/sym%>"`.

### Pattern B — Virtual Data Source (display submitted values in a Datagrid)

A `_dataType: "virtual"` source mirrors the form's ViewState values into a table. The Datagrid and the Dataform both bind to this source. No kdb+ server call is made — the data lives client-side.

```json
"<virtualDataSource>": {
  "_dataType": "virtual",
  "_dataSource": "kdb",
  "_connection": "<connection-name>",
  "_columns": ["<field1>", "<field2>"],
  "_autoExecute": true,
  "_autoExec": true,
  "_subscriptionType": "static",
  "_virtualParams": [
    { "name": "<field1>", "index": 0, "type": "viewstate", "value": "Dataform 1/<field1>", "isVirtual": true },
    { "name": "<field2>", "index": 1, "type": "viewstate", "value": "Dataform 1/<field2>", "isVirtual": true }
  ],
  "_virtualQueryString": "function (<field1>, <field2>, callback) {\n  callback({\n    columns: [\"<field1>\", \"<field2>\"],\n    meta: { \"<field1>\": <typeCode>, \"<field2>\": <typeCode> },\n    rows: [{ \"<field1>\": <field1>, \"<field2>\": <field2> }]\n  });\n}"
}
```

**kdb+ type codes for `_virtualQueryString` meta block:**

| kdb+ type | Code | kdb+ type | Code |
|---|---|---|---|
| boolean | `1` | symbol | `11` |
| byte | `4` | timestamp | `12` |
| short | `5` | month | `13` |
| int | `6` | date | `14` |
| long | `7` | datetime | `15` |
| real (float) | `8` | timespan | `16` |
| float (double) | `9` | minute | `17` |
| char | `10` | second | `18` |
| guid | `2` | time | `19` |

> ⚠️ `_virtualParams[].value` is the raw grouped path (`"Dataform 1/sym"`) — not URL-encoded. Only `PathEnc` in the component options is encoded.

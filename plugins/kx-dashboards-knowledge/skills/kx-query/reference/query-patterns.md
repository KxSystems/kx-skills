# kx-query — Query Patterns & Binding

> kdb+ query idioms, ViewState-type filtering, component-side binding, and symbol/string handling. Back to [SKILL.md](../SKILL.md).

**Contents:** kdb+ Query Patterns · Filtering by ViewState Type · Data Source Binding · Symbols vs Strings

---

## kdb+ Query Patterns

### Simple select
```q
select time, sym, price, size from trade
```

### Filtered by ViewState symbol
```q
{[s] select time, price, size from trade where sym=s}
```



### Aggregated (suitable for ChartGL bar/line)
```q
select last price, sum size by date from trade where sym=`AAPL
```

### Last N rows (suitable for streaming chart)
```q
{[n] select[-n] from trade}
```

### DataFilter bridge query
```q
{[s] .dfilt.apply[select from trade; s]}
```

Use this pattern when the data source feeds a DataFilter component — `s` receives the serialised filter model from the ViewState.

---

## Filtering by ViewState Type

The three common filter patterns — symbol equality, string `like`, and list membership — each require a matching ViewState entry, a `_queryParams` entry with the correct `type`, and a corresponding q query.

### Filter by Symbol (equality)

**ViewState:**
```json
"symbol": {
  "_viewType": true,
  "_type": "symbol",
  "_default": "EUR/USD"
}
```

**`_queryParams`:**
```json
{
  "name": "s",
  "index": 0,
  "type": "symbol",
  "value": "<%symbol%>",
  "IsKdbParam": true,
  "isViewState": true
}
```

**Query string:**
```q
{[s] select from dfxQuote where sym = s}
```

---

### Filter by String (`like` pattern match)

**ViewState:**
```json
"car Name string": {
  "_viewType": true,
  "_type": "string",
  "_default": "chevrolet chevelle malibu"
}
```

**`_queryParams`:**
```json
{
  "name": "s",
  "index": 0,
  "type": "string",
  "value": "<%car Name string%>",
  "IsKdbParam": true,
  "isViewState": true
}
```

**Query string:**
```q
{[s] select from Cars where Name like s}
```

> Use `like` for string columns. The value is a q pattern string — `"*foo*"` matches any name containing `foo`. Wildcards: `*` = any sequence, `?` = any single character.

---

### Filter by List (membership)

**ViewState:**
```json
"list of symbols": {
  "_viewType": true,
  "_type": "list",
  "_listtype": "symbol",
  "_default": ["EUR/USD", "GBP/USD"]
}
```

**`_queryParams`:**
```json
{
  "name": "s",
  "index": 0,
  "type": "list",
  "value": "<%list of symbols%>",
  "IsKdbParam": true,
  "isViewState": true
}
```

**Query string:**
```q
{[s] select from dfxQuote where sym in s}
```

> Use `in` (not `=`) when the parameter is a list. The dashboard passes the list as a symbol vector to the kdb+ process.


---

## Data Source Binding (Component Side)

Reference a data source from inside a component's options block:

```json
{ "_dashboardsType": "data", "value": "MyQuery" }
```

Trigger a manual re-execute via an action:

```json
{ "_Type": "query", "Trigger": "Click",
  "DataSource": { "_dashboardsType": "data", "value": "MyQuery" } }
```


---

## Symbols vs Strings

Symbols (`` `foo ``) and char vectors / strings (`"foo"`) are different types. Most "string" operators only work on strings:

| Want to... | On strings | On symbols |
|---|---|---|
| Substring match | ``"hello" like "*ll*"`` | first cast: ``(string `hello) like "*ll*"`` |
| Find substring | `"hello" ss "ll"` | first cast: `` (string `hello) ss "ll" `` |
| Lowercase | `lower "ABC"` → `"abc"` | works directly: `` lower `ABC `` → `` `abc `` |
| Split by delimiter | `"," vs "a,b,c"` | not applicable — symbols are atomic |

```q
string `foo                    / "foo"
`$ "foo"                       / `foo   (string → symbol)
`$ ("a"; "b"; "c")             / `a`b`c (list-of-strings → symbols)
```

**Reserved words — never use as variable names** (causes `'assign`). See the **Reserved Word Validation** section above for the full list, detection rules, and the required error message format.

# PyKX Reference

## Query API

### QSQL Methods (on Table objects)

```python
table.select(columns=None, where=None, by=None, inplace=False)   # Returns Table
table.exec(columns=None, where=None, by=None)                    # Returns Vector/Dict
table.update(columns=None, where=None, by=None, inplace=False)   # Returns Table
table.delete(columns=None, where=None, inplace=False)            # Returns Table
```

- `columns`: `kx.Column(...)`, dict `{'name': kx.Column(...)}`, or list of Columns
- `where`: `kx.Column(...) op value`, combine with `&` (AND), `|` (OR), `~` (NOT)
- `by`: `kx.Column(...)` for grouping
- `inplace`: persist changes to named tables in q memory

### Column Class Methods

**Aggregations:**
`sum()`, `avg()`, `count()`, `max()`, `min()`, `med()`, `prd()`, `dev()`, `var()`, `sdev()`, `svar()`, `first()`, `last()`, `scov()`, `cor()`, `cov()`

**Running aggregations:**
`sums()`, `avgs()`, `maxs()`, `mins()`, `prds()`

**Moving window:**
`mavg()`, `mcount()`, `mdev()`, `mmax()`, `mmin()`, `msum()`

**Math:**
`abs()`, `sqrt()`, `exp()`, `log()`, `neg()`, `signum()`, `reciprocal()`, `floor()`, `ceiling()`, `sin()`, `cos()`, `tan()`, `asin()`, `acos()`, `atan()`

**Sorting/Ranking:**
`asc()`, `desc()`, `iasc()`, `idesc()`, `rank()`

**Sequence:**
`deltas()`, `ratios()`, `prev()`, `xprev()`, `next_item()`, `previous_item()`, `fills()`, `reverse()`, `rotate()`

**String:**
`lower()`, `upper()`, `ltrim()`, `rtrim()`, `trim()`, `like()`, `string()`

**Set operations:**
`distinct()`, `inter()`, `union()`, `cross()`

**Other:**
`isin()`, `differ()`, `null()`, `cast()`, `md5()`, `fby()`, `xbar()`, `wavg()`, `wsum()`, `div()`, `mod()`, `within()`

**Temporal extraction:**
`time()`, `hour()`, `minute()`, `second()`, `date()`, `year()`, `month()`, `day()`

**Properties:**
`name(alias)` — rename output column, `data` — underlying data, `value()`, `len()`

**Arithmetic operators:**
`add()`, `subtract()`, `multiply()`, `divide()`, and Python operators `+`, `-`, `*`, `/`

**Comparison operators:**
`==`, `!=`, `>`, `<`, `>=`, `<=` (return filter expressions for `where`)

**Logical operators (for combining WHERE clauses):**
`&` (AND), `|` (OR), `~` (NOT) — must use parentheses around each condition

### Variable Class

```python
kx.Variable('varname')  # Reference q variable in Pythonic queries
table.select(where=kx.Column('price') > kx.Variable('minPrice'))
```

---

## SQL Interface

```python
kx.q.sql('SELECT * FROM trades')                                    # Basic
kx.q.sql('SELECT * FROM $1', trades_table)                          # Inject table
kx.q.sql('SELECT * FROM t WHERE date = $1 AND price < $2',
         date(2022, 1, 2), 500.0)                                   # Parameters

# Prepared statements
p = kx.q.sql.prepare('SELECT * FROM t WHERE date = $1', date(1,1,2))
result = kx.q.sql.execute(p, date(2022, 1, 2))  # run prepared statement
types = kx.q.sql.get_input_types(p)            # ['DateAtom/DateVector']
```

---

## IPC Connections

### Constructor Parameters (all connection types)

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `host` | str | `"localhost"` | Server hostname |
| `port` | int | None | Server port |
| `username` | str | `""` | Authentication user |
| `password` | str | `""` | Authentication password |
| `timeout` | float | `0.0` | Blocking operation timeout (0=infinite) |
| `large_messages` | bool | `True` | Support messages >2GB |
| `tls` | bool | `False` | Enable TLS encryption |
| `unix` | bool | `False` | Use Unix domain socket |
| `wait` | bool | `True` | Block for server response |
| `no_ctx` | bool | `False` | Disable context interface |
| `reconnection_attempts` | int | `-1` | Retry count (-1=disabled, 0=unlimited) |
| `reconnection_delay` | float | `0.5` | Initial delay between retries (seconds) |
| `connection_timeout` | float | None | Socket connection timeout |

### SyncQConnection

```python
with kx.SyncQConnection('localhost', 5000) as q:
    result = q('select from trades')                      # Sync query
    result = q('{x+y}', 2, 3)                             # With args (max 8)
    q('query', wait=False)                                 # Fire-and-forget
    result = q.myns.myfunc(arg1, arg2)                     # Remote function call
    q.upd('trades', data)                                  # .u.upd for pub/sub
    q.file_execute('/path/to/script.q')                     # Run remote file
```

### AsyncQConnection

```python
# Context manager (async with await)
async with await kx.AsyncQConnection('localhost', 5000) as q:
    fut = q('select from trades')                          # Returns QFuture
    result = await fut                                     # Await the result
    fut2 = q('query', wait=False, reuse=False)             # Deferred response
    result2 = await fut2

# Direct construction
conn = await kx.AsyncQConnection('localhost', 5000)
fut = conn('til 10')
result = await fut
conn.close()
```

### RawQConnection

```python
# Client mode (async construction, no sync 'with')
q = await kx.RawQConnection(host='localhost', port=5000)
q('select from trades')                                    # Queue query (not sent yet)
q.poll_send()                                              # Send queued (amount=0 for all)
result = q.poll_recv()                                     # Receive response

# Server mode
async with kx.RawQConnection(port=5000, as_server=True, conn_gc_time=20.0) as q:
    while True:
        q.poll_recv()                                      # Process incoming queries
```

Extra params: `as_server` (bool) — emulate q server, `conn_gc_time` (float) — GC interval.

### SecureQConnection

Same as SyncQConnection with TLS enabled. Use for encrypted connections.

```python
with kx.SecureQConnection('localhost', 5000, tls=True) as q:
    result = q('select from trades')
```

### QFuture

```python
future.result          # Block and retrieve result
future.done()          # bool — completed?
future.cancelled()     # bool — cancelled?
future.cancel(msg='')  # Cancel the future
future.exception()     # Get stored exception
future.add_done_callback(fn)     # Register callback
future.remove_done_callback(fn)  # Deregister callback
```

---

## DB Class (On-Disk Database Management)

```python
db = kx.DB(path='hdb', change_dir=True, load_scripts=True, overwrite=False)
```

### Properties

| Property | Description |
|----------|-------------|
| `db.tables` | List partitioned table names |
| `db.path` | Database directory path |
| `db.trades` | Access table by attribute name |

### Methods

| Method | Signature | Description |
|--------|-----------|-------------|
| `create` | `(table, table_name, partition=None, *, format="partitioned", by_field=None, sym_enum=None, log=True, compress=None, encrypt=None)` | Write table to disk |
| `load` | `(path, *, change_dir=True, load_scripts=True, overwrite=False, encrypt=None)` | Load existing DB |
| `rename_column` | `(table, original_name, new_name)` | Rename a column |
| `add_column` | `(table, column_name, default_value)` | Add column with default |
| `delete_column` | `(table, column)` | Remove a column |
| `copy_column` | `(table, original_column, new_column)` | Duplicate a column |
| `rename_table` | `(original_name, new_name)` | Rename a table |
| `list_columns` | `(table)` -> `list[str]` | Get column names |
| `find_column` | `(table, column_name)` | Check column exists |
| `reorder_columns` | `(table, new_order)` | Change column order |
| `set_column_attribute` | `(table, column_name, new_attribute)` | Set attribute (s, g, u, p) |
| `clear_column_attribute` | `(table, column_name)` | Remove attribute |
| `set_column_type` | `(table, column_name, new_type)` | Change column type |
| `apply_function` | `(table, column_name, function)` | Apply function to column |
| `fill_database` | `()` | Fill missing tables/columns across partitions |
| `partition_count` | `(*, subview=None)` -> `Dictionary` | Count rows per partition |
| `subview` | `(view=None)` | Restrict visible partitions |
| `enumerate` | `(table, *, sym_file=None)` -> `Table` | Enumerate symbol columns |

---

## Insert and Upsert

```python
kx.q.insert('tab', [1, 2.0, 'abc'])                       # Single row
kx.q.insert('tab', [[1,2], [2.0,4.0], ['a','b']])         # Multiple rows (column-oriented)
kx.q.insert('tab', row, match_schema=True)                 # Validate schema
kx.q.insert('tab', row, test_insert=True)                  # Dry-run (returns preview)

kx.q.upsert('tab', [1, 2.0, 'abc'])                       # Upsert row
kx.q.upsert(table_obj, other_table, match_schema=True)     # Upsert table into table
```

---

## License Management

```python
kx.licensed                                    # bool — check if licensed
kx.license.check(license, format='FILE')       # Validate license key
kx.license.install(license, format='FILE', force=False)  # Install license
kx.license.expires()                           # Days until expiration (int)
```

License types: `kc.lic` (default, personal/commercial), `k4.lic`, `kx.lic`

### Environment Variables

| Variable | Description |
|----------|-------------|
| `PYKX_LICENSED` | Set to `1` before import to force licensed mode |
| `PYKX_UNLICENSED` | Set to `1` before import to force unlicensed mode |
| `QHOME` | Path to q installation directory |
| `QLIC` | Path to folder containing license file |
| `KDB_LICENSE_B64` | Base64-encoded kc.lic (personal license) |
| `KDB_K4LICENSE_B64` | Base64-encoded k4.lic (commercial license) |
| `PYKX_THREADING` | Enable multithreaded EmbeddedQ (licensed only) |
| `PYKX_RELEASE_GIL` | Release Python GIL during q calls |
| `PYKX_Q_LOCK` | Add re-entrant lock around q calls for thread safety |
| `PYKX_NO_SIGNAL` | Skip signal definition overwriting |
| `PYKX_KEEP_LOCAL_TIMES` | Use local timezone for datetime conversions |
| `PYKX_ALLOCATOR` | NEP-49 allocator for efficient NumPy conversions |
| `PYKX_GC` | Trigger q garbage collector on array deallocation |
| `QARGS` | Command-line flags to pass to q |
| `QINIT` | Additional .q file loaded after PyKX init |

---

## Complete Type Mapping

### Atoms

| q type | PyKX type | Python (.py()) | NumPy dtype |
|--------|-----------|----------------|-------------|
| boolean | BooleanAtom | bool | bool |
| byte | ByteAtom | int | uint8 |
| short | ShortAtom | int | int16 |
| int | IntAtom | int | int32 |
| long | LongAtom | int | int64 |
| real | RealAtom | float | float32 |
| float | FloatAtom | float | float64 |
| char | CharAtom | bytes | \|S1 |
| symbol | SymbolAtom | str | object |
| guid | GUIDAtom | uuid.UUID | uuid4 |
| timestamp | TimestampAtom | datetime | datetime64[ns] |
| date | DateAtom | date | datetime64[D] |
| month | MonthAtom | date | datetime64[M] |
| timespan | TimespanAtom | timedelta | timedelta64[ns] |
| time | TimeAtom | timedelta | timedelta64[ms] |
| minute | MinuteAtom | timedelta | timedelta64[m] |
| second | SecondAtom | timedelta | timedelta64[s] |

### Collections

| q type | PyKX type | Python (.py()) | Pandas (.pd()) |
|--------|-----------|----------------|----------------|
| list | List | list | object Series |
| dict | Dictionary | dict | — |
| table | Table | dict | DataFrame |

### Type Constructors

```python
kx.toq(data)                           # Auto-detect type
kx.toq(data, kx.FloatVector)           # Explicit vector type
kx.FloatVector([1.0, 2.0, 3.0])        # Direct constructor
kx.Table(data={'a': [1,2], 'b': [3,4]})  # Table from dict
kx.Table(data=pandas_df)                # Table from DataFrame
```

---

## Sources

- [PyKX Overview](https://code.kx.com/pykx/)
- [Query API](https://code.kx.com/pykx/api/query.html)
- [Column Class](https://code.kx.com/pykx/api/columns.html)
- [IPC Interface](https://code.kx.com/pykx/api/ipc.html)
- [DB Management](https://code.kx.com/pykx/api/db.html)
- [Type Conversions](https://code.kx.com/pykx/api/pykx-q-data/type_conversions.html)
- [License Management](https://code.kx.com/pykx/api/license.html)

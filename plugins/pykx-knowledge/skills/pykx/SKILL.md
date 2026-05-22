---
name: pykx
description: Use when working with PyKX for Python-to-kdb+ data conversion, querying tables with Column API, IPC connections, DB management, or integrating Python with q. Also use when encountering type conversion issues, connection errors, or licensed vs unlicensed mode questions.
---

# PyKX

PyKX is the Python-first interface to kdb+ and q. `import pykx as kx`

For full Column methods, DB API, IPC details, type mapping: see [reference.md](reference.md)

## Critical Patterns (Common Mistakes)

### Column API for WHERE: Use Operators, Not Strings

```python
# CORRECT: kx.Column with Python operators
table.select(where=kx.Column('price') > 100)
table.select(where=(kx.Column('sym') == 'AAPL') & (kx.Column('price') > 150))

# WRONG — string-based where does NOT work
table.select(where='price > 100')         # WRONG!
table.select(where='sym = `AAPL')         # WRONG!
```

### Combining WHERE Conditions: Use & | ~ (Not and/or/not)

```python
# CORRECT: bitwise operators with parentheses
where=(kx.Column('sym') == 'AAPL') & (kx.Column('price') > 100)   # AND
where=(kx.Column('sym') == 'AAPL') | (kx.Column('sym') == 'GOOG') # OR
where=~(kx.Column('size') < 100)                                   # NOT

# WRONG — Python keywords don't work with Column objects
where=kx.Column('sym') == 'AAPL' and kx.Column('price') > 100     # WRONG!
```

### RawQConnection: Async + Queue Then poll_send/poll_recv

```python
# CORRECT: async construction, queue query, then poll_send/poll_recv
q = await kx.RawQConnection(host='localhost', port=5000)
q('select from trades')          # Queue the query (not sent yet)
q.poll_send()                    # Send queued queries
result = q.poll_recv()           # Receive response

# WRONG — poll_send does NOT take a query string
q.poll_send('select from trades')   # WRONG! poll_send takes amount, not query
# WRONG — RawQConnection requires async construction
with kx.RawQConnection(...) as q:   # WRONG! use await, not sync with
```

## Creating PyKX Objects

```python
qlist = kx.toq([1, 2, 3])                      # LongVector (auto)
qlist = kx.toq([1, 2, 3], kx.FloatVector)      # Explicit type
qtable = kx.toq(df)                             # DataFrame -> Table
kx.random.random(10, 100.0)                     # 10 random floats 0-100
```

## Execute q Code

```python
kx.q('til 10')                      # 0 1 2 3 ... 9
kx.q('{x+y}', 2, 4)                 # 6 (function with args, max 8)
kx.q['myvar'] = [1, 2, 3]           # Assign to q memory
kx.q.sql('SELECT * FROM trades WHERE sym = $1', 'AAPL')  # SQL interface
```

## Converting Back to Python

**Deferred conversion** -- data stays in q memory until explicitly converted:

| Method | Returns | Use Case |
|--------|---------|----------|
| `.py()` | Python dict/list | General Python use |
| `.np()` | NumPy array | Numerical computation |
| `.pd()` | Pandas DataFrame | Data analysis |
| `.pa()` | PyArrow table | Big data/Parquet |

## Querying Tables (Pythonic API)

```python
table.select()                                                      # All
table.select(columns=kx.Column('price'))                            # Single column
table.select(columns={'maxP': kx.Column('price').max()})            # Named aggregation
table.select(where=kx.Column('sym') == 'AAPL')                     # Filter
table.select(columns=kx.Column('price').max(),
    where=kx.Column('sym') == 'GOOG', by=kx.Column('date'))        # Group by
prices = table.exec(columns=kx.Column('price'))                    # Returns vector
table.update(columns={'price': kx.Column('price') * 1.1},
    where=kx.Column('sym') == 'AAPL')
table.delete(where=kx.Column('size') < 100)
```

### Column Methods

```python
kx.Column('price').max()            # max, min, avg, sum, count, dev, var
kx.Column('price').name('maxPrice') # Rename in output
kx.Column('size').last()            # first, last, med, prd, sdev, svar
kx.Column('price').avg().name('avgPrice')  # Chain name after aggregation
```

### Variable for Dynamic Values

```python
kx.Variable('threshold')            # Reference q variable in queries
table.select(where=kx.Column('price') > kx.Variable('minPrice'))
```

Or use q directly: `kx.q('select max price by date from trades where sym=`AAPL')`

## DB Management (On-Disk Tables)

```python
db = kx.DB(path='hdb')
db.tables                           # List available tables
db.trades                           # Access table by name

# Schema operations
db.rename_column('trades', 'oldName', 'newName')
db.add_column('trades', 'newCol', default_value=0)
db.delete_column('trades', 'dropCol')
db.rename_table('oldTable', 'newTable')

# Partition management
db.fill_database()                  # Fill missing tables/columns across partitions
```

## IPC Connections

```python
# Sync (most common) - context manager recommended
with kx.SyncQConnection('localhost', 5000) as q:
    result = q('select from trades')
    df = result.pd()

# With auth
with kx.SyncQConnection('localhost', 5000, username='user', password='pass') as q: ...

# TLS
with kx.SecureQConnection('localhost', 5000, tls=True) as q: ...

# Async (returns QFuture)
async with await kx.AsyncQConnection('localhost', 5000) as q:
    fut = q('select from trades')        # Returns QFuture
    result = await fut                   # Await the result

# Raw (fine-grained control, async construction)
q = await kx.RawQConnection(host='localhost', port=5000)
q('select from trades')                  # Queue query
q.poll_send()                            # Send queued
result = q.poll_recv()                   # Receive response

# Call remote functions
with kx.SyncQConnection('localhost', 5000) as q:
    result = q.myns.myfunc(arg1, arg2)

# Fire and forget
with kx.SyncQConnection('localhost', 5000) as q:
    q('insert[`trades; data]', wait=False)
```

| Type | Use Case |
|------|----------|
| `SyncQConnection` | Standard queries, data retrieval |
| `AsyncQConnection` | `async with await`, returns QFuture |
| `SecureQConnection` | TLS-enabled servers (sync) |
| `RawQConnection` | `await` construction, poll_send/poll_recv, server emulation |

## Licensed vs Unlicensed Mode

```python
import os
os.environ['PYKX_LICENSED'] = '1'      # Before importing pykx
import pykx as kx
kx.licensed                              # True if licensed
```

| Feature | Licensed | Unlicensed |
|---------|----------|------------|
| `kx.q()` execution | Yes | No |
| IPC connections | Yes | Yes |
| Data conversion | Yes | Yes |
| Table creation | Yes | Limited |
| `kx.DB` management | Yes | No |

## Type Mapping

| Python | PyKX | q |
|--------|------|---|
| `int` | `LongAtom` | `long` |
| `float` | `FloatAtom` | `float` |
| `str` | `SymbolAtom` | `symbol` |
| `bool` | `BooleanAtom` | `boolean` |
| `datetime` | `TimestampAtom` | `timestamp` |
| `list` | `List` | `list` |
| `dict` | `Dictionary` | `dict` |
| `DataFrame` | `Table` | `table` |

## Common Errors & Fixes

| Error | Fix |
|-------|-----|
| Type error on conversion | Use homogeneous types: `kx.toq([1,2,3])` not `kx.toq([1,'a',2.0])` |
| Connection refused | Ensure q server running: `q -p 5000` |
| Lost type info round-trip | Use explicit types: `kx.FloatVector(data)` |
| Context not persisted over IPC | Embedded `kx.q` shares context; IPC connections do NOT |
| `PYKX_UNLICENSED` but need q | Set `PYKX_LICENSED=1` before import, ensure `kc.lic` present |
| `AttributeError: poll_recv` | Use `RawQConnection`, not `SyncQConnection` or `AsyncQConnection` |
| `and`/`or` in Column where | Use `&` / `|` with parentheses around each condition |

## Performance Tips

1. **Keep data in q memory** -- avoid unnecessary conversions
2. **Use `.pd()` only when needed** -- conversion has overhead
3. **Batch operations** -- fewer IPC calls = better performance
4. **Use context manager** -- ensures proper connection cleanup

## MCP Tools

- `mcp__qmcp__connect_to_q` -- Connect to q server
- `mcp__qmcp__query_q` -- Execute q queries

**Related:** `/q` for q language syntax, `/kdbx` for KDB-X platform, `/kdbai` for KDB.AI vector DB.

## User Request: $ARGUMENTS

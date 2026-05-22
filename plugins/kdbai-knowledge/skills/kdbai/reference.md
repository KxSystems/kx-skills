# KDB.AI Reference

## Python Client API

### Session

```python
import kdbai_client as kdbai

session = kdbai.Session(
    api_key=None,           # Required for cloud
    endpoint="http://localhost:8082",  # 8082=qIPC (default), 8081=REST
    host=None, port=None,
    mode=None,              # 'rest' or 'qipc' (default)
    options=None
)

session.version()           # {serverVersion, clientMinVersion, clientMaxVersion}
session.databases()         # List database names
session.databases_info()    # Comprehensive info on all databases
session.session_info()      # Session metadata
session.process_info()      # Process statistics
session.system_info()       # Complete system state
session.close()
```

### Database

```python
db = session.create_database("mydb")
db = session.database("default")
db.tables                   # List table names
db.info()                   # Database + table info
db.refresh()                # Update cached metadata
db.drop()                   # Delete database + all tables (irreversible)
```

### Table

```python
table = db.create_table("name", schema=schema, indexes=indexes,
    partition_column=None,
    embedding_configurations=None,
    external_data_references=None)

table.schema                # Column definitions
table.indexes               # Index definitions
table.info()                # Full metadata
table.index("name")         # Specific index metadata
table.refresh()             # Update cached state
table.load()                # Load external reference table
table.drop()                # Delete (irreversible)
```

### Data Operations

```python
table.insert(dataframe)                                    # Add rows (DataFrame)
table.train(dataframe)                                     # Train IVF/IVFPQ indexes
table.update_data(columns={"col": val}, filter=[...])      # Modify rows
table.update_indexes(indexes=["idx"], parts=[1, 2])        # Rebuild indexes on partitions
table.delete_data(filter=[...])                            # Remove rows
table.query(filter=[], aggs={}, group_by=[], sort_columns=[], limit=None)
```

### Search

```python
table.search(
    vectors={"idx": [[vec]]},  # Required: {index_name: [[vectors]]}
    n=10,                      # Number of neighbors (negative = outliers for TSS)
    range=None,                # Distance threshold (qFlat only, max 10M results)
    type=None,                 # "tss" or "dtw"
    options={},                # See Search Options below
    index_params={},           # efSearch, weight, clusters, itopk_size
    filter=[],                 # Filter tuples: (operator, column, value)
    search_by=[],              # Group search by column(s) (TSS/DTW)
    group_by=[],               # Group results
    aggs={},                   # Aggregation functions
    sort_columns=[],           # Sort columns
    result_type=None
)

table.search_and_rerank(
    vectors={"idx": [[vec]]},
    n=10,
    reranker=reranker_instance,
    queries=["search query"],
    text_column="text_col"
)
```

### Search Options

| Option | Type | Description |
|--------|------|-------------|
| `distanceColumn` | str | Custom name for distance column |
| `indexOnly` | bool | Return only index data |
| `returnMatches` | bool | Include matched values (TSS/DTW) |
| `force` | bool | Allow search when data < query length (TSS/DTW) |
| `normalize` | bool | Z-normalization (TSS, default: True) |
| `overlap` | float 0-1 | Allowed overlap between matches (TSS) |
| `RR` | float 0-1 | Warping radius ratio (DTW) |
| `cutOff` | float | Distance threshold (DTW) |

### Index Params at Search Time

| Index Type | Param | Default | Description |
|------------|-------|---------|-------------|
| HNSW/qHNSW | `efSearch` | 8 | Search quality (2-10x of n recommended) |
| IVF/IVFPQ | `clusters` | 2 | Number of clusters to search |
| CAGRA | `itopk_size` | -- | Must be >= n |
| Multi-index | `weight` | -- | Per-index weight for hybrid fusion |
| BM25 | `k`, `b` | 1.25, 0.75 | Adjustable at search time |

## Supported Data Types

| Category | Types |
|----------|-------|
| Numeric | `byte`, `short`, `int`, `long`, `real`, `float` |
| Text | `char`, `symbol`, `str` |
| Boolean/ID | `boolean`, `guid` (UUIDv4) |
| Temporal | `timestamp` (ns), `date`, `datetime` (ms), `month`, `time` (ms), `minute`, `second`, `timespan` (ns) |
| Lists | Plural forms: `float32s`, `float64s`, `int64s`, etc. |
| Special | `general` (sparse vector dicts for BM25) |

## Aggregation Functions

`sum`, `count`, `avg`, `min`, `max`, `first`, `last`, `distinct`, `dev`, `sdev`, `var`, `svar`, `scov`, `prd`, `all`, `any`

## Reranker Providers

| Provider | Models |
|----------|--------|
| `CohereReranker` | `rerank-english-v3.0`, `rerank-multilingual-v3.0` |
| `JinaAIReranker` | `jina-reranker-v2-base-multilingual` |
| `VoyageAIReranker` | `rerank-2`, `rerank-2-lite` |

All accept: `api_key`, `model`, `overfetch_factor` (default: 2, multiplied by n for initial retrieval).

## Partitioning

- Supported column types: date, integer, symbol
- Works with: flat, qFlat, HNSW, qHNSW, BM25, TSS indexes
- Partitions created automatically during insert
- Enables partition pruning for faster queries

## Multithreading

Set `THREADS` environment variable. Rule: `workers * threads <= CPU cores`.
Benefits: qHNSW inserts, qFlat/qHNSW partitioned searches, TSS on splayed/partitioned tables.

## External Data References (v1.4.0+)

```python
table = db.create_table("name", schema=schema,
    external_data_references=[{"path": b"/tmp/kx/remote", "provider": "kx"}])
```

## CAGRA GPU Index (cuVS Docker Only)

GPU-powered approximate nearest neighbor. Requires cuVS image (`kdbai-db:*-cuvs`).

### Table Creation

CAGRA **rejects** `dims` — it infers dimensionality from data:
```python
indexes = [
    {"name": "idx", "type": "cagra", "column": "vector",
     "params": {"metric": "CS"}}  # Do NOT include dims!
]
table = db.create_table("gpu_table", schema=schema, indexes=indexes)
```

### Build Parameters (cuvsCagraIndexParams)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `metric` | `L2` (0) | `L2`=0, `CS`=2, `IP`=6 |
| `intermediate_graph_degree` | 128 | Degree during construction |
| `graph_degree` | 64 | Final graph degree |
| `build_algo` | `AUTO_SELECT` (0) | 0=auto, 1=IVF_PQ, 2=NN_DESCENT, 3=ITERATIVE |
| `nn_descent_niter` | 20 | NN-Descent iterations |
| `gpuid` | 0 | GPU device ID |

### Search Parameters (cuvsCagraSearchParams)

| Parameter | Default | Description |
|-----------|---------|-------------|
| `itopk_size` | 64 | Intermediate top-k (main accuracy knob). Must be >= n |
| `max_queries` | 0 | Batch size (0=auto) |
| `algo` | `SINGLE_CTA` (0) | 0=SINGLE_CTA, 1=MULTI_CTA, 2=MULTI_KERNEL, 3=AUTO |
| `team_size` | 0 | Threads per calc (4/8/16/32, 0=auto) |
| `search_width` | 1 | Graph nodes per iteration |
| `thread_block_size` | 0 | CUDA block size (0=auto) |
| `hashmap_mode` | `HASH` (0) | 0=HASH, 1=SMALL, 2=AUTO_HASH |
| `persistent` | false | Persistent GPU kernel (SINGLE_CTA only) |

**Unknown params return their name as error** (e.g., passing `internal_dataset_memory_type` returns "internal_dataset_memory_type").

### qcuvs Raw API (standalone, outside KDB.AI)

```q
cuvs:use `kx.cuvs;

// Create + insert
params:(`metric`graph_degree`gpuid)!(`CS;64;0);
myIndex:cuvs.cagra.init[params];
myIndex[`add; trainVectors; ()];

// Search (returns (distances; neighbors) shape 2 x nqueries x k)
searchParams:`itopk_size`algo!(64;`SINGLE_CTA);
results:myIndex[`search; queryVectors; k; searchParams];

// Filtered search (boolean mask)
mask:(100#0b),(900#1b);
results:myIndex[`filter; queryVectors; k; searchParams; mask];

// Serialize/deserialize
myIndex[`write; hsym `$"myindex"];
loaded:cuvs.cagra.read["myindex"; 0];

// Normalize
normalized:cuvs.cagra.normalize vectors;
```

### CAGRA Memory & Limits

- **All vectors in GPU VRAM** — dataset must fit in GPU memory
- A10G (24GB): ~1.5M vectors at 4096 dims (float32)
- First insert calls `cuvsCagraBuild()`, subsequent use `cuvsCagraExtend()`
- Insert rate degrades at scale (432 rows/s at 50K → 149 rows/s at 250K)
- Filtering is post-filter: finds `itopk_size` neighbors then applies mask
- `itopk_size` max ~512; 1024+ causes `KDBAIException: cuvs`
- `external_data_references` broken on `kdbai-db-cuvs:1.8.2` for all index types

### CAGRA Common Errors

| Error | Fix |
|-------|-----|
| "missing arguments: dims" | Do NOT pass `dims` to CAGRA — it infers from data |
| "vectors type not supported: general list" | Use `[query.tolist()]` not `[[query.tolist()]]` |
| "illegal memory access" after drop | Restart pod (`kubectl delete pod kdbai-0`) |
| `insertFromPath` "not a valid index" | CAGRA not tracked in `.kdbaidense.indexes`, use Python client |
| Unknown param name as error | Only use params listed in search params table above |

## REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/v2/databases` | Create database |
| GET | `/api/v2/databases` | List databases |
| DELETE | `/api/v2/databases/{name}` | Delete database |
| POST | `/api/v2/databases/{db}/tables` | Create table |
| GET | `/api/v2/databases/{db}/tables` | List tables |
| DELETE | `/api/v2/databases/{db}/tables/{table}` | Delete table |
| POST | `/api/v2/databases/{db}/tables/{table}/insert` | Insert data |
| POST | `/api/v2/databases/{db}/tables/{table}/train` | Train indexes |
| POST | `/api/v2/databases/{db}/tables/{table}/search` | Search |
| POST | `/api/v2/databases/{db}/tables/{table}/query` | Non-vector query |

## Sources

- [KDB.AI Overview](https://code.kx.com/kdbai/latest/)
- [Python Client API](https://code.kx.com/kdbai/latest/reference/python-client.html)
- [Supported Indexes](https://code.kx.com/kdbai/latest/use/supported-indexes.html)
- [Filters](https://code.kx.com/kdbai/latest/reference/filters.html)
- [Search](https://code.kx.com/kdbai/latest/use/search.html)
- [Hybrid Search](https://code.kx.com/kdbai/latest/use/hybrid-search.html)
- [Non-Transformed TSS](https://code.kx.com/kdbai/latest/use/non-transformed-tss.html)
- [Transformed TSS](https://code.kx.com/kdbai/latest/use/transformed-tss.html)
- [DTW Search](https://code.kx.com/kdbai/latest/use/dynamic-time-warping-dtw.html)
- [Reranking](https://code.kx.com/kdbai/latest/use/rerank.html)

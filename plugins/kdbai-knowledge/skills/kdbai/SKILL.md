---
name: kdbai
description: Use when building vector search, RAG pipelines, hybrid search, time-series pattern matching, or managing tables in KDB.AI. Also use when asked about kdbai_client, similarity search, reranking, KDB.AI filters, or CAGRA GPU indexes.
---

# KDB.AI Vector Database

KDB.AI is a vector database for AI applications. Supports similarity search, hybrid search (dense+BM25), time-series similarity (TSS), dynamic time warping (DTW), and reranking.

For full Python client API, CAGRA GPU details, REST endpoints: see [reference.md](reference.md)

## Critical Patterns (Common Mistakes)

### Filter Format: Operator FIRST

```python
# CORRECT: (operator, column, value)
filter=[("=", "fiscal_year", 2024)]
filter=[("within", "price", [50, 100])]

# WRONG — agents always get this backwards
filter=[("fiscal_year", "=", 2024)]  # WRONG ORDER!
```

### Vectors: Dict with Index Name Key

```python
# CORRECT
results = table.search(vectors={"myIndex": [[1.0, 0.0, 1.0]]}, n=10)

# WRONG
results = table.search(vectors=[[1.0, 0.0, 1.0]], n=10)  # Must be dict!
```

### Schema + Indexes Are SEPARATE Lists

```python
# CORRECT: two separate arguments
schema = [
    {"name": "id", "type": "str"},
    {"name": "text", "type": "str"},
    {"name": "vector", "type": "float32s"},
]
indexes = [
    {"name": "vec_idx", "type": "hnsw", "column": "vector",
     "params": {"dims": 1024, "metric": "CS", "M": 16, "efConstruction": 64}},
]
table = db.create_table("docs", schema=schema, indexes=indexes)

# WRONG — do NOT nest index config inside schema columns
schema = [{"name": "vector", "type": "float32s", "vectorIndex": {...}}]  # WRONG!
```

### TSS/DTW Have NO Index — Use `type=` in Search

```python
# CORRECT: no index needed, use SCALAR numeric column (not list type)
schema = [{"name": "price", "type": "float64"}]  # scalar, not float32s
indexes = []  # NO index for non-transformed TSS/DTW
table = db.create_table("ts", schema=schema, indexes=indexes)
# vectors key = column name (not index name)
results = table.search(vectors={"price": [[0,1,2,3,4]]}, n=5, type="tss")

# WRONG — there is no TSS or DTW index type
indexes = [{"name": "idx", "type": "tss", ...}]  # WRONG! TSS is not an index
```

### BM25 Sparse Vectors: Dict Format

```python
# CORRECT: sparse vector is {term_id: frequency} dict
sparse_data = [{0: 2, 5: 1, 12: 3}]  # term IDs to frequencies

# WRONG
sparse_data = ["raw text goes here"]  # NOT raw text!
```

## Connection & Setup

```python
import kdbai_client as kdbai
session = kdbai.Session(endpoint="http://localhost:8082")           # Local (qIPC, default)
session = kdbai.Session(endpoint="http://localhost:8081", mode="rest")  # Local (REST)
session = kdbai.Session(api_key="key", endpoint="https://...")      # Cloud
db = session.database("default")
```

## Table Lifecycle

```python
schema = [
    {"name": "id", "type": "str"},
    {"name": "text", "type": "str"},
    {"name": "vector", "type": "float32s"},
    {"name": "sparse", "type": "general"},          # BM25 sparse vectors
    {"name": "document_date", "type": "datetime64[ns]"},
]

indexes = [
    {"name": "dense_idx", "type": "hnsw", "column": "vector",
     "params": {"dims": 1024, "metric": "CS", "M": 16, "efConstruction": 64}},
    {"name": "sparse_idx", "type": "bm25", "column": "sparse"}
]

table = db.create_table("docs", schema=schema, indexes=indexes)
table = db.create_table("docs", schema=schema, indexes=indexes,
                        partition_column="document_date")  # Partitioned

db.tables                # List table names
table = db.table("docs") # Get existing
table.drop()             # Delete (irreversible)
```

## Index Types

| Type | Required Params | Optional (defaults) | Notes |
|------|----------------|---------------------|-------|
| **flat** | `dims`, `metric` | -- | Exact, 100% recall |
| **qFlat** | `dims`, `metric` | -- | On-disk, supports range search |
| **hnsw** | `dims` | `M`(8), `efConstruction`(8), `metric`(L2) | Balanced speed/recall |
| **qHnsw** | `dims` | `M`(8), `efConstruction`(8), `metric`(L2), `mmapLevel`(1) | On-disk |
| **ivf** | -- | `nclusters`(8), `metric`(L2) | Requires `table.train()` before insert |
| **ivfpq** | -- | `nclusters`(8), `nbits`(8), `nsplits`(8), `metric`(L2) | Compressed, requires training |
| **bm25** | -- | `k`(1.25), `b`(0.75) | Sparse keyword search, column type `general` |
| **cagra** | `metric` | See [reference.md](reference.md) | GPU only, do NOT pass `dims` |

**Metrics:** `L2` (Euclidean, default), `CS` (Cosine), `IP` (Inner Product).

## Data Operations

```python
table.insert(df)                                              # Insert DataFrame
table.update_data(columns={"year": 2025}, filter=[...])       # Update rows
table.train(df)                                               # Train IVF/IVFPQ (before insert)
table.update_indexes(indexes=["idx"], parts=[1, 2])           # Rebuild indexes on partitions
table.delete_data(filter=[("=", "year", 2023)])               # Delete (flat/qFlat only)
# WARNING: No filter on delete = deletes ALL data
```

## Search Types

### 1. Similarity Search (ANN)

```python
results = table.search(vectors={"idx": [[emb]]}, n=10)                    # Basic
results = table.search(vectors={"idx": [[e1], [e2]]}, n=5)                # Batch
results = table.search(vectors={"idx": [[emb]]}, range=0.5)               # Range (qFlat only)
```

### 2. Hybrid Search (Dense + BM25)

```python
results = table.search(
    vectors={"dense_idx": [[dense_emb]], "sparse_idx": [{1:2, 3:1}]},
    n=10,
    index_params={
        "dense_idx": {"weight": 0.6},
        "sparse_idx": {"weight": 0.4, "k": 1.5, "b": 0.8}
    }
)
# Fusion: score = (w_sparse / (1+sparse_rank)) + (w_dense / (1+dense_rank))

# WRONG — there is no weights= parameter
# results = table.search(..., weights={"dense": 0.6, "sparse": 0.4})  # WRONG!
```

### 3. Time-Series Similarity (TSS)

No index required. Works on scalar numeric columns (`float64`, `float32`, `int64`, etc.).

```python
query = [1.2, 1.5, 1.8, 2.1, 1.9, 1.6]

# vectors key = column name (not index name since there's no index)
results = table.search(vectors={"price": [query]}, n=5, type="tss",
    options={"returnMatches": True, "normalize": True})
# Options: normalize (default True), returnMatches, force, overlap (0-1)

# Grouped search (parallelized per group)
results = table.search(vectors={"price": [query]}, n=3, type="tss",
    search_by="sym", options={"force": True})  # force: search even if partition has fewer rows

# Outlier detection: negative n = MOST DISSIMILAR
results = table.search(vectors={"price": [query]}, n=-3, type="tss")
```

**Transformed TSS** (dimensionality reduction, use HNSW/IVF/Flat index, avoid IVFPQ):
```python
table = db.create_table("ts", schema=schema, indexes=indexes,
    embedding_configurations={"price": {"dims": 8, "type": "tsc",
        "on_insert_error": "skip_row"}})  # or "reject_all"
# dims: 8 (slow data), 12 (medium), 20+ (fast). Column must contain vectors, not scalars.
```

### 4. Dynamic Time Warping (DTW)

No index required. Handles variable-speed patterns.

```python
results = table.search(vectors={"price": [query]}, n=5, type="dtw",
    options={"RR": 0.1, "cutOff": 5.0, "returnMatches": True})
# RR: warping radius (0-1), cutOff: max distance threshold
```

### 5. Reranking

Uses built-in `search_and_rerank()` — do NOT manually rerank with external libraries.

```python
from kdbai_client.rerankers import CohereReranker
reranker = CohereReranker(api_key="...", model="rerank-english-v3.0",
                          overfetch_factor=2)  # default: 2 (retrieves 2*n, returns n)

results = table.search_and_rerank(
    vectors={"idx": [[emb]]}, n=10, reranker=reranker,
    queries=["revenue trend?"], text_column="text")
# Providers: CohereReranker, JinaAIReranker, VoyageAIReranker
```

### Non-Vector Query

```python
results = table.query(
    filter=[(">=", "fiscal_year", 2024)],
    aggs={"price": "avg", "volume": "sum"},
    group_by=["sector"], sort_columns=["sector"], limit=100)
```

## Filter Operators

| Operator | Example | Types |
|----------|---------|-------|
| `=` | `("=", "year", 2024)` | Numeric, string |
| `<>` | `("<>", "status", "draft")` | Any |
| `>`, `<`, `>=`, `<=` | `(">=", "score", 0.8)` | Numeric |
| `in` | `("in", "quarter", [1, 2, 3])` | String, numeric |
| `like` | `("like", "source", "*report*")` | String |
| `within` | `("within", "price", [50, 100])` | Numeric, datetime |
| `fuzzy` | `("fuzzy", "name", [["Microsft", 2]])` | String, symbol |

## Common Errors

| Error | Fix |
|-------|-----|
| "Index not found" | `vectors` key must match exact index name |
| Filter not working | Operator FIRST: `("=", "col", val)` not `("col", "=", val)` |
| Low HNSW recall | Increase `index_params={"idx": {"efSearch": 100}}` |
| "missing arguments: dims" | HNSW/Flat need `dims`. CAGRA rejects it. |
| IVF returns empty | Must `table.train(df)` before insert |
| Delete fails | Only works on no-index, flat, qFlat tables |

## MCP Tools

- `mcp__qmcp__connect_to_q` -- Connect to KDB.AI/q server
- `mcp__qmcp__query_q` -- Execute q queries

**Related:** `/q` for q language, `/pykx` for PyKX, `/kdbx` for KDB-X AI libs.

## User Request: $ARGUMENTS

---
name: kdbx
description: Use when working with KDB-X modules, AI libraries (vector search, HNSW, IVF, BM25, time-series similarity, anomaly detection), GPU acceleration, Parquet, kURL REST client, object storage, or the module framework. Also use when encountering module-not-found errors, vector dimension mismatches, HNSW index issues, GPU setup issues, or `nyi` errors from using `\l` instead of `use`.
---

# KDB-X

Unified compute engine: time-series analytics + vector search + GPU-accelerated compute in one runtime. GA April 2026. Multi-language (q, Python, SQL), native Parquet/Arrow, 25+ community modules. Community Edition free at developer.kx.com.

## When to Use

| Need | Skill |
|------|-------|
| KDB-X modules, AI libs, Parquet, kURL, GPU, objstor | **This skill** |
| q language syntax, operators, table queries | `/q` |
| PyKX Python-to-kdb+ integration | `/pykx` |
| KDB.AI cloud vector database | `/kdbai` |

## Module Loading

Always `use`, NEVER `\l` (`\l` doesn't bind native functions):

```q
.pq:use`kx.pq              / Parquet        .pq.t:use`kx.pq.t  / Virtual tables
.kurl:use`kx.kurl           / REST client    .ai:use`kx.ai       / AI libraries
.gpu:use`kx.gpu             / GPU accel      .objstor:use`kx.objstor / Object storage
.rest:use`kx.rest           / REST server
```

## Parquet

```q
trades: pq `:trades.parquet                       / Virtual table (row-group pruning)
select from trades where date > 2024.01.01
meta: op `:data.parquet                           / File metadata
vt: (.pq.t:use`kx.pq.t)[`tt] tbl                 / Wrap kdb+ table as virtual
```

Compression: snappy, gzip, brotli, lz4, zstd.

## kURL REST Client

```q
/ .kurl.sync (url; method; options) -> (statusCode; body)
resp:.kurl.sync ("https://api.example.com/data"; `GET; ::)
resp:.kurl.sync ("https://api.example.com"; `POST; enlist[`body]!enlist .j.j data)
resp:.kurl.sync ("https://s3.example.com/f"; `PUT; enlist[`file]!enlist `:path/to/file.csv)
opts:`headers`body!(("Content-Type";"x-api-key")!("application/json";"key123"); .j.j data)
.kurl.async ("https://api.example.com/data"; `GET; enlist[`callback]!enlist (`;{show x}))

/ Auth: .kurl.init`aws then .kurl.register (type; domain; tenant; info)
/ Types: `aws_cred`aws_sts`oauth2`oauth2_jwt`azure`basic
.kurl.aws.registerByCredentialsFile `:~/.aws/credentials  / or register manually
```

Options: `` `headers`body`file`callback`service`region ``

## Object Storage

```q
.objstor.init[]                                / Register all vendors (or .objstor.init`aws)
/ URI schemes: :s3://  :ms://  :gs://  — standard kdb+ file ops work:
hcount `$":s3://bucket/path/file"              / read1, key, get also work
```

Env vars: `AWS_ACCESS_KEY_ID`, `AWS_SECRET_ACCESS_KEY`, `AWS_REGION`, `AZURE_STORAGE_ACCOUNT`, `AZURE_STORAGE_SHARED_KEY`, `GCP_TOKEN`. S3-compatible: `KX_S3_ENDPOINT`.

## AI Libraries

| Index | Namespace | Use Case |
|-------|-----------|----------|
| **HNSW** | `.ai.hnsw` | Fast approximate search (default) |
| **Flat** | `.ai.flat` | Exact search, small datasets |
| **IVF** | `.ai.ivf` | Large-scale partitioned |
| **IVFPQ** | `.ai.pq` | Compressed, memory-constrained |
| **BM25** | `.ai.bm25` | Text/keyword search |
| **Fuzzy** | `.ai.fuzzy` | Approximate string match |
| **Hybrid** | `.ai.hybrid` | Vector + BM25 via RRF |
| **TSS** | `.ai.tss` | Time series similarity + anomaly |
| **DTW** | `.ai.dtw` | Dynamic time warping |

```q
/ HNSW (most common): embs and hnsw are SEPARATE objects
vecs:{(x;y)#(x*y)?1e}[1000;10]
hnsw:.ai.hnsw.put[();();vecs;`L2;32;1%log 32;64]
res:.ai.hnsw.search[vecs;hnsw;first vecs;5;`L2;32]   / metric MUST match put
merged:.ai.hybrid.rrf[(vecResults; bm25Results); 60]   / RRF fusion
```

**Full API signatures**: See [ai-reference.md](ai-reference.md)

## GPU Acceleration

```q
T:.gpu.to trades                              / Move to GPU (all columns)
T:.gpu.xto[`price`size] trades                / Mixed residency
.gpu.select[T;enlist(=;`sym;enlist`AAPL);0b;()]  / GPU qSQL (functional select)
.gpu.aj[`sym`time; Trade; Quote]              / GPU as-of join (needs `g#)
.gpu.xasc[`time] T                            / GPU sort
```

Requires NVIDIA data center GPUs, CUDA 13.1, driver v590+. 10x-25x speedups, near-linear multi-GPU scaling. **Full API**: See [gpu-reference.md](gpu-reference.md)

## Multi-Language

```q
select avg price by 5 xbar time from trades where sym=`AAPL     / q
s)SELECT AVG(price) FROM trades WHERE sym='AAPL' GROUP BY time/5 / SQL
```

## Common Errors

| Error | Cause | Fix |
|-------|-------|-----|
| `nyi` | `\l` instead of `use` | `.mod:use\`kx.mod` |
| `module not found` | QHOME not set | `getenv\`QHOME` |
| `length` on search | Dim mismatch | `count queryVec` must match index |
| Wrong results | Metric mismatch put/search | Same metric in both |
| `rank` on search | Empty index | Verify data populated |
| `type` on hnsw.put | Wrong vector type | Cast to `real` |

## Related skills

- `q` — q language syntax
- `pykx` — Python interface to kdb+
- `kdbai` — KDB.AI vector database
- `kxmeta-author` / `kxmeta-discover` — `aimeta` annotation authoring and discovery

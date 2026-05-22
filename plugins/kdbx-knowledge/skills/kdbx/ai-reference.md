# KDB-X AI Libraries Reference

## Contents
- Flat (brute force) search
- HNSW vector search
- IVF inverted file index
- IVFPQ product quantization
- BM25 text search
- Fuzzy string matching
- Hybrid search (RRF)
- Time series similarity (TSS)
- Dynamic time warping (DTW)
- Anomaly detection (DAMP)

Load with: `.ai:use\`kx.ai`

---

## Flat (Brute Force)

```q
/ .ai.flat.search[embs; q; k; metric]
/   embs   - real[][] vectors to search
/   q      - real[]|float[] query vector
/   k      - short|int|long number of neighbors
/   metric - symbol: `L2, `CS, `IP
/ Returns: (real[]; long[]) — (distances, indices)
res:.ai.flat.search[vecs; query; 10; `CS]

/ .ai.flat.normalize[embs] → real[][] normalized vectors
nvecs:.ai.flat.normalize vecs
```

---

## HNSW

### Create: `.ai.hnsw.put`

```q
/ .ai.hnsw.put[embs; hnsw; vecs; metric; M; ml; ef]
/   embs   - real[][] existing vectors (() for new index)
/   hnsw   - dict[];dict[] existing HNSW object (() for new index)
/   vecs   - real[][] vectors to insert
/   metric - symbol: `L2, `CS, or `IP
/   M      - short|int|long graph connectivity (default 16)
/   ml     - real|float level generation factor (default 1%log M)
/   ef     - short|int|long construction beam width (default 64)
/ Returns: (dict[];dict[]) — the HNSW object

vecs:{(x;y)#(x*y)?1e}[1000;10]
hnsw:.ai.hnsw.put[();();vecs;`L2;32;1%log 32;64]
```

### Search: `.ai.hnsw.search`

```q
/ .ai.hnsw.search[embs; hnsw; q; k; metric; efs]
/   embs   - real[][] vectors used to build index
/   hnsw   - dict[];dict[] HNSW object from put
/   q      - real[]|float[] query vector
/   k      - short|int|long neighbors to return
/   metric - symbol: MUST match put metric
/   efs    - short|int|long search beam width (higher = more accurate)
/ Returns: (real[]; long[]) — (distances, indices)

res:.ai.hnsw.search[vecs;hnsw;first vecs;5;`L2;32]
```

### Filter, Delete, Update, Normalize

```q
/ .ai.hnsw.filterSearch[embs; hnsw; q; k; metric; efs; ids]
res:.ai.hnsw.filterSearch[vecs;hnsw;first vecs;4;`L2;32;701 977 407 26]

/ .ai.hnsw.del[hnsw; embs; metric; dps] → (dict[];dict[])
hnsw:.ai.hnsw.del[hnsw;vecs;`L2;13]

/ .ai.hnsw.upd[hnsw; embs; metric; dps; rvs; M; ef] → (dict[];dict[])
hnsw:.ai.hnsw.upd[hnsw;vecs;`L2;13;10?1e;32;64]

/ .ai.hnsw.normalize[embs] → real[][] (use with `IP for faster CS-equivalent)
nvecs:.ai.hnsw.normalize vecs
```

**Gotchas:**
- `embs` and `hnsw` stored separately — hnsw is graph only
- Metric mismatch between put/search → silent wrong results
- Works on Community Edition

---

## IVF (Inverted File Index)

```q
/ Step 1: Train centroids
/ .ai.ivf.train[nlist; vecs; metric] → real[][] representative points
repPts:.ai.ivf.train[100; vecs; `L2]

/ Step 2: Build index
/ .ai.ivf.put[ivf; repPts; vecs; metric] → dict (() for new)
ivf:.ai.ivf.put[(); repPts; vecs; `L2]

/ Step 3: Search
/ .ai.ivf.search[ivf; q; k; nprobe] → (real; long)[]
res:.ai.ivf.search[ivf; query; 10; 8]

/ Predict cluster assignment
/ .ai.ivf.predict[repPts; vecs; metric] → long[]
clusters:.ai.ivf.predict[repPts; newVecs; `L2]

/ Delete / Update
/ .ai.ivf.del[ivf; ids] → dict
/ .ai.ivf.upd[ivf; ids; vecs] → dict
ivf:.ai.ivf.del[ivf; 13]
ivf:.ai.ivf.upd[ivf; 13; newVecs]

/ Convert to PQ
/ .ai.ivf.topq[ivf; nsplits; nbits; metric; ntrain] → dict
ivfpq:.ai.ivf.topq[ivf; 8; 8; `L2; 1000]
```

---

## IVFPQ (Product Quantization)

```q
/ Train PQ codebook
/ .ai.pq.train[nsplits; nbits; vecs; metric] → (real[][])[]
repPts:.ai.pq.train[8; 8; vecs; `L2]

/ Build IVF+PQ index
/ .ai.pq.ivf.put[ivfpq; vecs] → dict (() for new)
ivfpq:.ai.pq.ivf.put[(); vecs]

/ Search IVF+PQ
/ .ai.pq.ivf.search[ivfpq; q; k; nprobe] → (real; long)[]
res:.ai.pq.ivf.search[ivfpq; query; 10; 8]

/ Flat PQ search (no IVF partitioning)
/ .ai.pq.flat.search[repPts; encodings; q; k; metric] → (real; long)[]
res:.ai.pq.flat.search[repPts; encodings; query; 10; `L2]

/ Predict PQ encoding
/ .ai.pq.predict[repPts; vecs; metric] → long[][]
encodings:.ai.pq.predict[repPts; vecs; `L2]

/ Delete / Update
/ .ai.pq.ivf.del[ivfpq; ids] → dict
/ .ai.pq.ivf.upd[ivfpq; ids; vecs] → dict
ivfpq:.ai.pq.ivf.del[ivfpq; 13]
ivfpq:.ai.pq.ivf.upd[ivfpq; 13; newVecs]
```

---

## BM25 (Text Search)

```q
/ Build index
/ .ai.bm25.put[index; ck; cb; sparse] → dict (() for new)
/   ck - term saturation (typical: 1.2)
/   cb - document length impact (typical: 0.75)
/   sparse - dict|long[] tokenized documents
idx:.ai.bm25.put[(); 1.2; 0.75; tokenizedDocs]

/ Search top-k
/ .ai.bm25.search[index; q; k; ck; cb] → (real[]; long[])
res:.ai.bm25.search[idx; queryTokens; 10; 1.2; 0.75]

/ Score all documents
/ .ai.bm25.score[index; q; ck; cb] → real[]
scores:.ai.bm25.score[idx; queryTokens; 1.2; 0.75]

/ Persist to disk
/ .ai.bm25.write[path; index; indexName] → symbol[]
.ai.bm25.write[`:path; idx; `myindex]

/ Search partitioned on-disk index
/ .ai.bm25.psearch[indexName; q; k; ck; cb; parts] → (real[]; long[])
res:.ai.bm25.psearch[`myindex; queryTokens; 10; 1.2; 0.75; partitions]
```

---

## Fuzzy String Matching

```q
/ Search
/ .ai.fuzzy.search[data; q; k; metric] → (float[]; int[]; matched_values)
/   data   - string[]|symbol[]|enum
/   metric - symbol from .ai.fuzzy.utils.fuzzyDistances (e.g. `lev)
res:.ai.fuzzy.search[stringList; "query"; 5; `lev]

/ Distance
/ .ai.fuzzy.dist[data; q; metric] → float
d:.ai.fuzzy.dist["hello"; "helo"; `lev]
```

---

## Hybrid Search (RRF)

```q
/ Reciprocal Rank Fusion — merge ranked results
/ .ai.hybrid.rrf[results; const] → long[]
/   results - list of (real[];long[]) from vector/BM25 searches
/   const   - int|long|real|float RRF constant (typical: 60)
merged:.ai.hybrid.rrf[(vecResults; bm25Results); 60]

/ Weighted RRF
/ .ai.hybrid.wrrf[results; weights; const] → long[]
merged:.ai.hybrid.wrrf[(vecResults; bm25Results); 2 1; 60]
```

---

## Time Series Similarity (TSS)

```q
/ Find k most similar subsequences
/ .ai.tss.tss[ts; q; k; opts]
/   ts   - short[]|int[]|long[]|float[]|real[] data vector
/   q    - same types, query pattern
/   k    - short|long|int neighbors to return
/   opts - dict (:: for defaults):
/          `ignoreErrors (bool, false)
/          `returnMatches (bool, false)
/          `normalize (bool, true)
/          `overlap (float, 0.0)
/ Returns: (float[]; long[]) — (distances, starting indices)
res:.ai.tss.tss[ts; query; 5; ::]

/ Sliding distances across all positions
/ .ai.tss.tssdist[ts; q; opts] → float[]
dists:.ai.tss.tssdist[ts; query; ::]
```

---

## Dynamic Time Warping (DTW)

```q
/ Search k closest matches
/ .ai.dtw.search[ts; q; k; window; opts]
/   window - real|float warping ratio relative to query size
/   opts   - dict (:: for defaults)
/ Returns: (float[]; long[]) — (distances, indices)
res:.ai.dtw.search[ts; query; 4; 0.3; ::]

/ Search with max distance cutoff
/ .ai.dtw.filterSearch[ts; q; k; window; cutoff; opts]
res:.ai.dtw.filterSearch[ts; query; 4; 0.3; 1.4; ::]

/ All matches below threshold (variable count)
/ .ai.dtw.searchRange[ts; q; window; cutoff; opts]
res:.ai.dtw.searchRange[ts; query; 0.3; 1.4; ::]
```

---

## Anomaly Detection (DAMP Algorithm)

```q
/ Matrix profile for anomaly detection
/ .ai.tss.anomaly[ts; m; sp; opts]
/   ts   - short[]|int[]|long[]|float[]|real[] time series
/   m    - short|long|int window size
/   sp   - short|long|int number of nearest neighbors
/   opts - dict (:: for defaults):
/          `lookahead, `normalize, `bsf
/ Returns: float[] (matrix profile)
/          or (float[]; long) if opts.bsf is true
mp:.ai.tss.anomaly[ts; 5; 6; ::]

/ With best-so-far tracking
(mp;bsf):.ai.tss.anomaly[ts; 5; 6; enlist[`bsf]!enlist 1b]

/ Incremental (append new point)
/ .ai.tss.anomalyi[ts; m; bsf; opts] → (float; float) — (distance, new bsf)
ts,:rand 1f
(dist;bsf):.ai.tss.anomalyi[ts; 5; bsf; ::]
```

---
name: sizing
description: Guide KDB.AI sizing, capacity planning, and server resource configuration by collecting dataset and usage requirements, recommending suitable vector indexes and starting configurations, and estimating RAM, GPU VRAM, and persisted disk. Use for KDB.AI hardware requirements, capacity planning, memory-fit questions, row/vector limits, sizing from a data-volume figure (size per day or total size) rather than a row count, index selection, whether and how to partition a table (partition-key selection, the partition_column, and how partition scope works), qHnsw mmap sizing, CAGRA GPU sizing, and CPU worker/thread configuration — including standalone NUM_WRK and THREADS worker/thread-splitting or core-count questions and partition-key mechanics questions that carry no rows/dims sizing hook. These CPU and partition topics belong here, not in the sibling kdbai (schema/search) skill. Do not invent throughput, latency, cost, IOPS, or distributed topology from dataset shape alone.
---

# Size KDB.AI vector indexes

Treat workload discovery and index selection as prerequisites for sizing, not as separate architecture work. The same dataset can require very different RAM, disk, VRAM, and CPU headroom depending on the index, update pattern, filters, concurrency, and search requirements. Do not give a hardware recommendation from rows and dimensions alone unless the user asks only for a raw-vector footprint.

Use this sizing workflow:

1. Discover enough about the data and intended use to identify viable indexes.
2. Shortlist two or three suitable index configurations rather than selecting one from row count alone.
3. Estimate RAM, disk, variable working set, and GPU VRAM for each option.
4. Explain which workload assumptions drive the range and what remains workload-dependent.
5. Recommend a focused representative proof of concept before procurement.

Keep the scope at a defensible sizing range. Give broad CPU guidance, but do not turn the guide into full solution architecture or a throughput/latency model.

For exact byte formulas, the full CAGRA VRAM-anchor table, and the official documentation index: see [reference.md](reference.md).

## Use only the user's numbers; never invent one

Every figure in the answer must trace to one of three sources: a value the user stated, the estimator's output for those values, or a cited doc/measured constant. Nothing else. This is a hard rule, not a preference.

- **Take the user's stated values verbatim.** If the user gave rows, dimensions, a data volume, RAM, VRAM, cores, requested `n`, or any other figure, use it exactly — do not round it, rescale it, "normalise" it, or swap it for a value from this guide. The numbers in this guide (the Section 1 sample, `dims 2048`, the `~14 GiB` RAM example, the `2*n`–`10*n` `efSearch` heuristic, `M=8`, `graph_degree=64`) are illustrative placeholders and documented baselines, never a substitute for what the user actually said.
- **Do not fabricate a missing input.** Never invent a row count, dimension, data size, RAM/VRAM figure, core count, growth rate, partition count, latency, or QPS the user did not provide and that the estimator or a cited doc does not produce.
- **When a value is unknown, say so explicitly.** State that it was not provided, then do one of: ask for it, apply a clearly-labelled provisional assumption or a worked example flagged as illustrative (not as their data), or present conditional branches. Never fill a gap with a silent guess.
- **Derived is not invented.** Estimator RAM/disk/VRAM computed from the user's rows and dims, rows converted from a stated data volume, and worker/thread splits from stated concurrency are derived results — show them with their provenance. Any number without such a source does not belong in the answer.
- **An illustrative value must never be promoted into a stated one.** A number you introduced as an example, a worked-example row, a sensitivity case, or an anchor (a "90 days" retention figure, a "if you kept N rows" table row, `dims 2048`) stays illustrative for the entire answer. Do not later restate it in the recommended-configuration block, in prose, or in a follow-up as though the user provided it. Before you put any figure in Section 1, check its origin: if it is not user-stated and not estimator-derived from user-stated inputs, it may only appear as an explicitly-marked assumption (see "Present the output"), never bare.
- **Answer follow-up questions from this skill's sources, not from memory.** Every reply — the first answer and every follow-up — must be grounded in the workflow and tables here, the estimator's output, [reference.md](reference.md), and the cited official KDB.AI pages. Re-run the estimator when a follow-up changes an input rather than adjusting its numbers by hand. If a question falls outside these sources — a build/search parameter, schema construction, an operational detail, or a product limit this guide does not cover — say it is not covered by the sizing skill and point to the official docs or the sibling `kdbai` skill, rather than improvising from general recall.
- **Ground KDB.AI answers in KDB.AI's own docs — not kdb+ or kdb-x.** KDB.AI is not kdb+/kdb-x and differs in ways that change the sizing answer. It supports **per-table partitioning** — each table sets its own `partition_column`, with no shared database-wide partition domain to reason about — unlike kdb+/kdb-x's single partition domain per database. It is configured through **its own environment variables** (`NUM_WRK`, `THREADS`, set via `docker run -e`), and it does **not** accept kdb+ command-line/input parameters such as `-s` (secondary threads) or `-p` (port) in its user API or docker commands. Do not import kdb+/kdb-x partitioning mechanics (its single database-wide partition domain), table-type rules (flat/splayed/segmented), or CLI flags into a KDB.AI answer, and do not cite kdb+/kdb-x documentation as the authority for KDB.AI behaviour. When a mechanic is only documented for kdb+/kdb-x, say KDB.AI does not document it rather than importing the kdb+ behaviour. One narrow exception: kdb+'s ~100M-record "start considering partitioning" figure may be used as rough volume orientation, but only alongside KDB.AI's own index-resource footprint and search requirements, which are the real trigger — see "Decide whether to partition the table".

## Discover the workload

Inputs have different priorities, not numerical weights. Start with required and high-impact inputs, then ask conditional questions only when they are relevant to the requested answer. Do not send the full inventory by default:

- **Required for a dataset-specific numerical estimate:** a volume figure and embedding dimensions. The volume figure is normally the current row count, but accept a **data-size figure instead** when the user tracks bytes rather than rows — either a total stored size or a size-per-day paired with a retention horizon in days. The estimator converts size to rows (see "Run the estimator"); a size-derived count is an upper bound unless the user also gives per-row bytes, so label it as such. Without a volume figure and dimensions, provide only a clearly labelled worked example or explain how to recover them.
- **High impact for index selection:** [top-N or radius/range search](https://code.kx.com/kdbai/latest/use/search.html), exact versus high-recall approximate versus compression-first search, and [one-time/batch load or streaming ingestion](https://code.kx.com/kdbai/latest/use/ingestion.html) including the frequency of inserts, updates, and deletes. If these are unknown, return conditional index branches rather than pretending the shortlist is settled.
- **Conditional:** ask only when the requested scope makes the answer relevant. This includes growth horizon and metadata width for production capacity; available RAM or single-card GPU VRAM for a fit check; requested `n`, latency sensitivity, and [selective filters](https://code.kx.com/kdbai/latest/use/filter.html) for search tuning; concurrency, batch size, client/server co-location, CPU cores, [`NUM_WRK` and `THREADS`](https://code.kx.com/kdbai/latest/reference/multithreading.html), storage, and qIPC for deployment guidance; and a [natural partition key](https://code.kx.com/kdbai/latest/reference/partition.html), additional dense indexes, or [sparse/BM25 hybrid search](https://code.kx.com/kdbai/latest/reference/hybrid.html) for layout sizing.
- **Defaultable for an initial estimate:** use `float32s` unless the [stored vector-column type](https://code.kx.com/kdbai/latest/reference/supported-types.html) is known to be `float64s`. Leave the [similarity metric](https://code.kx.com/kdbai/latest/reference/metrics.html) as **to confirm from the embedding model** because it does not change the byte estimate, although it must be correct before implementation. Flat, HNSW, IVF, IVF-PQ, and CAGRA support float64. qFlat and qHnsw require float32 and do not accept float64.

If a conditional answer is unknown, use and label only the minimum provisional assumption needed, or present conditional branches when the answer changes the design. Do not block an initial estimate on metadata width, cache state, or a final worker count; expose how those unknowns affect the recommendation.

Link unfamiliar product terms to the corresponding official page the first time they are used in a user-facing question or answer. Include only the two or three links relevant to the user's uncertainty rather than sending the full reference list.

### When the user does not know the answers

Do not turn sizing into a product-knowledge test. Briefly explain why each unknown matters and help the user recover it. A volume figure (a row count, or a data-size figure the estimator converts to rows) and dimensions are the only minimum inputs for a dataset-specific numerical estimate:

- Find rows from the source record count or `table.info()` for an existing table. If the user only knows a data volume (for example a daily ingest rate and a retention window, or a total stored size), take that instead and let the estimator convert it to rows — do not force them to count rows they do not have.
- Find dimensions from the index `dims`, the embedding model documentation, or the length of one embedding vector. Offer to infer it if the user provides the model name or one vector.
- If either remains unknown, do not invent a capacity figure for their data. Offer a clearly labelled worked example only when it would help, explain how it scales, and state the values needed to replace it with their data.

For unknown conditional or defaultable inputs, use the smallest neutral fallback needed to make progress and label it clearly:

- Use `float32s` for the estimate unless the stored schema says `float64s`.
- Leave the metric as **to confirm from the embedding model**. It does not change the byte estimate, so do not assume cosine merely to calculate size.
- Exclude unknown metadata and label the result as vector-and-index storage only. Recommend measuring a representative table before procurement.
- Report fixed CPU index RAM per worker. Do not invent `NUM_WRK`, core count, or concurrency; show simple one-, two-, and four-worker multipliers when useful.
- Show current volume. An optional `2 × current rows` case is a sensitivity example, not a growth forecast.
- Do not assume range search, filters, hybrid search, mutation pattern, GPU, latency target, or exact-recall requirements.

When an unknown changes which indexes are eligible, return conditional branches instead of guessing the use case: exact search points toward Flat/qFlat; update-friendly ANN toward HNSW/qHnsw; static, compression-first ANN toward IVF-PQ; and static GPU ANN may warrant benchmarking CAGRA. Ask the single follow-up that would eliminate the most branches. If the user's context clearly indicates document RAG or another scenario, propose it as a labelled interpretation—not as a universal default.

## Turn the answers into recommendations

Only ask for information that could change the choice of index, its initial configuration, or the resource estimate and its limitations:

| Input | Recommendation consequence |
| -- | -- |
| Embedding metric | Use the metric expected by the embedding model: L2, cosine similarity, or inner product. Do not choose it from dataset size. |
| Range/radius query | Use `qFlat`; other supported dense indexes provide top-N search. |
| Requested `n` and recall | For HNSW/qHnsw, `efSearch` is the runtime recall/latency lever; a common starting heuristic is `2*n` to `10*n`, but this multiplier is not KX-documented or measured here—treat it as a provisional starting point and tune from measured recall and latency, not as a sized guarantee. |
| Selective filters | Expect HNSW/qHnsw to need a higher `efSearch`; where filters align with a natural partition key, recommend partitioning to reduce the searched working set — but only with a partition-compatible index (Flat/qFlat/HNSW/qHnsw/sparse/TSS), never IVF-PQ or CAGRA (see "Decide whether to partition the table"). |
| Streaming and frequent mutation | Prefer flat/qFlat or HNSW/qHnsw. Avoid CAGRA when updates or deletes would cause unacceptable rebuilds. |
| Static, compression-first workload | Consider IVF-PQ. Train IVF/IVF-PQ on representative real data—normally thousands to tens of thousands of vectors—and tune cluster counts iteratively. IVF-PQ cannot be partitioned, so it rules out a partition key; if the workload needs both compression and partition pruning, prefer qHnsw and drop IVF-PQ. |
| Static GPU ANN workload | Consider CAGRA when top-N approximate search, batched or sufficiently concurrent queries, and infrequent rebuilds fit the workload, and the index, runtime workspace, and measured build peak fit one supported GPU. |
| Multiple dense indexes | Count raw vector storage once and add each index structure. Do not sum full estimator disk totals because each total already includes the raw column. |
| Sparse/BM25 hybrid search | State that sparse index sizing is outside this calculator; size the dense side and leave a measured allowance for the sparse side. |
| Metadata and growth | Add known metadata bytes directly, or sample actual table storage and scale it to current and projected rows. |
| Resource limits and concurrency | Remove options that do not fit RAM/VRAM; multiply fixed CPU index RAM by active workers and preserve OS/process/build headroom. |

## Shortlist an index

Use row count as a starting point, not as the only selection rule.

| Rows | Start with | Change when |
| -- | -- | -- |
| 0–100K | `flat` or `qFlat` | Use `hnsw` when query latency or volume makes exhaustive search unsuitable |
| 100K–1M | `hnsw`; `qHnsw` when RAM is constrained | Use flat only when exact recall is required and measured latency is acceptable |
| 1M–10M | `qHnsw` or `ivfpq` | Prefer qHnsw for update-friendly graph search; prefer IVF-PQ when compression is the priority |
| 10M+ | `qHnsw` or `ivfpq` | Choose by update pattern, recall, compression, and measured latency |

Do not gate CAGRA solely by row count, and do not recommend it solely because a GPU is available. Shortlist it when the user has a mostly static top-N ANN workload, batched or sufficiently concurrent searches, access to a supported GPU, and enough single-card VRAM for the index, runtime/search workspace, and a measured build peak. Present it as a candidate to benchmark against CPU options, not an automatic recommendation: this guide cannot predict whether GPU search will improve the user's latency or throughput. Avoid it when frequent updates or deletes would make rebuild behaviour unacceptable.

## Decide whether to partition the table

Partitioning is a table-layout choice made at `create_table` (via `partition_column`), separate from index choice — a [partitioned KDB.AI table](https://code.kx.com/kdbai/latest/use/partitioning.html) still carries one of the shortlisted indexes. Raise it when the workload shows a natural key, high volume, memory pressure, or a latency/QPS target; do not partition by default, and do not partition purely because the dataset is large. Judge it against these signals rather than a single number:

| Signal | Lean non-partitioned | Lean partitioned |
| -- | -- | -- |
| Volume and growth | Small, static dataset whose full index fits comfortably in the resident/hot working set | Large or continuously growing dataset where the chosen index's full-volume RAM/disk footprint (from the estimator) strains resources, or search needs filter pruning/retention. Use kdb+'s ~100M-record figure as rough orientation only — the real trigger is KDB.AI index resources + search requirements, which can fire well below 100M for a high-dim resident index or well above for a low-floor mmap index |
| Dominant query filter | Queries have no consistent metadata filter, or the natural key is not one queries filter on | A metadata column — `date` for time-series, `tenant_id`/`user_id` for retrieval, or a category — appears in most query filters |
| Ingestion and retention | Static or one-shot load with no expiry | Streaming ingest with a retention window, so old partitions can be archived or dropped cheaply to cap growth |
| Memory pressure | Index and hot data already fit and searches are global | You want low memory use per query, so each pruned search page-caches only the relevant partition instead of the whole table |
| Latency and QPS | Latency is acceptable and query volume is low | You want lower per-query latency or higher QPS and the dominant filter lets a search prune to one partition, so it scans far less data; searches across partitions can also be thread-parallelized (see "Give broad CPU guidance") |

The [partition-key type](https://code.kx.com/kdbai/latest/reference/partition.html) must be `date`, integer, or symbol, and must match the dominant filter. Apply these caveats before recommending it:

- **Partitioning is compatible only with Flat, qFlat, HNSW, qHnsw, sparse, and TSS indexes — a hard constraint.** [IVF, IVF-PQ, and CAGRA cannot be used on a partitioned table.](https://code.kx.com/kdbai/latest/use/partitioning.html) This makes the choice mutually exclusive: if you recommend partitioning, the dense index must be qHnsw/qFlat/HNSW/Flat — never pair a partition column with IVF-PQ or CAGRA. Conversely, if the workload genuinely needs IVF-PQ compression or CAGRA GPU search, it cannot be partitioned, so size it as a single non-partitioned table and drop partitioning from that option. Check this before shortlisting, so a compression-first or GPU option is never offered alongside a partition key.
- **Pruning only pays off when the partition column is in the query filter.** If a query does not filter on it, every partition is scanned and partitioning adds cost without benefit — so confirm the key aligns with the actual filters before recommending it. The memory and latency/QPS gains above follow from pruning, so they are conditional on that alignment and are a lever to validate at representative scale, not a sized QPS or latency guarantee (this guide does not model throughput).
- **Do not over-partition.** Many tiny partitions add per-partition overhead and can span search across all of them; prefer a key whose partitions stay meaningfully large. KDB.AI manages the number of partitions within a key by default — do not hand-set it.
- **Partitioning is per table — each table sets its own `partition_column`.** KDB.AI supports per-table partitioning: different tables can use different partition keys, and there is no shared database-wide partition domain to reconcile (this is a real difference from kdb+/kdb-x, which use one partition domain per database — do not carry that constraint over). So choose each table's key for its own dominant filter, independently of other tables.
- **RAM is driven by the partitions a query reads, not the whole table — size RAM from the query's partition scope, disk from the full set.** Every partition carries the same index type and configuration, and memory behaves identically for each: a resident index (`flat`, `hnsw`, `qhnsw` level 0) loads a partition's index into RAM when that partition is queried; an mmap index (`qFlat`, `qHnsw` levels 1–2) memory-maps it the same way. So at any moment only the partitions a query selects are in memory — one day, a few days, a date range — never the whole table, unless a single query spans every partition. Size **RAM from the rows in a typical query's partition scope** (run the estimator with that row count; scale up if many different partitions are queried concurrently) and **persisted disk from the full retained row count** (a separate run). For multi-year data these two counts differ by orders of magnitude, so they must not share one number. **Never present the full-dataset index as the required RAM** unless queries genuinely read all partitions at once. Partitioning does not shrink *disk* for a fixed row count (every partition is persisted); retention bounds disk growth by dropping old partitions.

See [reference.md](reference.md) for the grounded thresholds, source docs, and the sizing interaction in full.

## Recommend a range of configurations

Return two or three credible options rather than one supposedly exact answer. Use these as starting profiles, then adjust them to the user's recall, update, and resource constraints:

When any provisional defaults or conditional branches were used, surface a short **Assumptions to confirm** list that distinguishes user-provided facts from proposed defaults, and state which assumptions affect index choice, which affect resource totals, and which only require later performance tuning. In the final answer these assumptions live in Section 2 of "Present the output", not as a separate lead block.

| Profile | Starting configuration | Use when |
| -- | -- | -- |
| Exact | `flat`, or `qFlat` when fixed RAM is constrained | Exact recall is required and exhaustive-search latency is acceptable |
| Resident ANN | `hnsw` with `M=8`; optionally compare `M=16`; start `efSearch` around `2*n` to `10*n` as a provisional heuristic, then tune from measured recall/latency | Low latency and update-friendly search matter, and the per-worker index fits RAM |
| Lower fixed RAM | `qHnsw`, normally `mmapLevel=1`; compare level 2 for a smaller fixed floor or level 0 when the index can be resident; start `efSearch` around `2*n` to `10*n` as a provisional heuristic, then tune from measured recall/latency | The workload needs graph search but RAM is constrained |
| Compression-first | `ivfpq`; use explicit `nclusters`, search `clusters`, `nsplits`, and `nbits`, with `dims` divisible by `nsplits` | A small resident index footprint matters more than maximum recall or update simplicity, and representative training data is available. The compression is in the searchable index (large RAM saving, and no second full-precision vector copy); the raw vector column is still persisted, so persisted disk stays dominated by raw storage — do not sell IVF-PQ as a disk-compression win |
| GPU ANN candidate | `cagra` with `graph_degree=64`, `intermediate_graph_degree=128`, and the default IVF-PQ build as starting points | A mostly static top-N workload can keep the GPU useful through batched or sufficiently concurrent queries, and the index, runtime overhead, and measured build peak fit one GPU |

Treat `M=8`, IVF-PQ's calculator defaults, and CAGRA graph degree 64 as sizing baselines, not universally optimal search parameters. If IVF/IVF-PQ parameters are unknown, label the calculation provisional rather than inventing a tuned configuration. CAGRA requires at least `intermediate_graph_degree + 1` rows and the intermediate degree must not be below the graph degree.

For every shortlisted option, run the estimator to get: index and configuration, why it fits, fixed RAM per worker, RAM for the proposed workers, variable page-cache exposure, persisted disk, CAGRA index VRAM where relevant, and the main operational trade-off. State the row-growth assumption, explain which user answers selected or excluded the option, and avoid false precision beyond the calculator output. These options become Section 3 of the final answer, and the highest-priority one becomes Section 1 — assemble all of it in the required three-section layout described under "Present the output".

## Fit to given hardware, or size hardware to acquire

Every hardware dimension — host RAM, GPU VRAM, and CPU cores — is a two-way question, and the same estimate is presented differently depending on which one the user is asking. Detect the mode from their inputs before framing any number:

- **They stated what they have** ("I have 32 GB RAM", "an A100-40GB", "16 cores"): treat it as a **fit check**. For each shortlisted option, say whether it fits inside that limit with headroom, and rank by fit. If nothing fits, do not just report the overflow — give the levers to close the gap: a smaller or compressed index (`qHnsw` at a higher `mmapLevel`, `ivfpq`), partitioning plus retention to shrink the hot working set, fewer workers, or more hardware. Then state which levers you assumed.
- **They did not state it, or they asked how much they need**: this is the **size-the-hardware-to-acquire** mode. A "how much do I need?" question belongs here **whatever the resource** (RAM, disk, VRAM, cores) **and however it is framed** (ingest, build, store, run, or serve) — treat it as a sizing request, not a factual lookup, and do not let narrow phrasing pull you into echoing one raw estimator number. Produce the assembled figure for whichever resource(s) they asked about — the host RAM to provision ("Interpret the result"), the persisted disk with its overheads, the CPU core band ("Give broad CPU guidance"), the GPU serving/build tier ("Size CAGRA VRAM") — never a raw estimator primitive (a bare fixed-RAM floor, a bare disk or index-payload number). A question framed around only one resource — a `NUM_WRK`/`THREADS` or ingest-throughput question that never mentions RAM — is still size-to-acquire for the resources it did not name: the user is provisioning a box, so assemble and state the starting host-RAM figure in Section 1 alongside the CPU answer rather than only offering to size it later. Label these as starting figures to validate, not exact requirements.

The CAGRA VRAM section already applies this split to the GPU (known card → fit check; no card → tier lookup); apply the same two-mode logic to RAM and cores, and mix modes when the user fixes one dimension but not another (for example a known RAM limit but an open core count).

## Give broad CPU guidance

Resolve `NUM_WRK` and `THREADS` here, before running the estimator — `--workers` is one of its flags, and the numbers below are what should determine it, not the illustrative value shown in the estimator examples.

Do not derive an exact core count, QPS, or latency from rows and dimensions. Give a broad starting band tied to active work, then validate the nearest smaller and larger configurations:

| Workload | KDB.AI CPU starting point | Initial configuration |
| -- | -- | -- |
| Evaluation, development, or serial queries | 4 cores | `NUM_WRK=1`, `THREADS=4` |
| Light production with 1–2 active searches | 8 cores | `NUM_WRK=1–2`, normally `THREADS=4` |
| Moderate production with 3–4 active searches | 16 cores | `NUM_WRK=2–4`, normally `THREADS=4` |
| Higher concurrency with roughly 5–8 active searches | 24 cores | `NUM_WRK=4–8`; start with `THREADS=2–4` within the core and RAM limits |
| Heavy ingestion into one table | 8–16 cores | `NUM_WRK=1`; compare `THREADS=4` and `8` |
| Parallel ingestion into different tables | Start around 4 cores per active stream | Add workers for independently active tables within the core and RAM limits |

- Treat these as KDB.AI core allocations and leave separate host capacity for the OS, gateway, transport, and monitoring.
- For concurrent search, add `NUM_WRK` workers cautiously. Include the index RAM for every active worker and keep `NUM_WRK * THREADS <= available KDB.AI cores` as a contention ceiling, not a performance target.
- Use threads where the operation supports within-request parallelism, including batch search, searches across partitions, index builds, and qHnsw ingestion. Do not assume every index/query scales with every added thread.
- For ingestion into one table, do not expect more workers to parallelize the inserts. Batch size, `THREADS`, index type, and storage are more relevant.
- Move up a band for high-dimensional exact search, large query batches, expensive filters, partition-spanning search, or simultaneous ingestion and search.
- Prefer qIPC over REST for throughput-sensitive deployments where possible.
- Set `NUM_WRK` and `THREADS` as KDB.AI **environment variables** (e.g. `docker run -e NUM_WRK=2 -e THREADS=4 ...`). Never recommend kdb+ command-line flags such as `-s` (secondary threads) or `-p` (port) — KDB.AI does not use them in its user API or docker commands.

As a rule of thumb for concurrent CPU search, start with **2–4 threads per worker**, then set workers to the smaller of expected simultaneously active requests and `floor(available KDB.AI cores / THREADS)`. For mostly serial work or large batches within one request, start with one worker and 4–8 threads. These are starting configurations, not calculated optima. A retained eight-core HNSW test placed `2 workers × 4 threads` first for concurrent single-vector requests and `4 × 2` first for 32-vector batches; both extremes (`1 × 8` and `8 × 1`) lost throughput in at least one workload.

Apply these CPU caveats whenever giving the rule:

- The best worker/thread split varies with index type, partitions, query batch size, filters, and search parameters, so treat the rule as a starting split, not an optimum.
- More workers multiply fixed index RAM. Do not increase `NUM_WRK` from CPU considerations without rechecking memory fit.
- More threads can plateau or regress. A retained 16-core HNSW ingestion test improved through 8 threads and slowed at 16.
- CPU utilization, QPS, latency, and the winning split are machine-specific. Compare the rule-of-thumb split with the nearest smaller and larger splits using warmed representative work and at least three repetitions.

Check licence-specific core limits before recommending more than 24 cores. Call the result broad guidance and recommend a small representative test when latency or throughput matters; do not require a full benchmark programme for an initial sizing answer.

## Run the estimator

Before running the script, compute and state `NUM_WRK` from this user's actual concurrency — do not proceed to the command until this line has real numbers in it:

```
NUM_WRK = min(expected simultaneously active requests, floor(available KDB.AI cores / THREADS))
```

Invoke it via `${CLAUDE_PLUGIN_ROOT}` rather than a relative path or a filesystem search — the harness sets this env var to the currently-invoked plugin's own root, so it resolves correctly even when other installs of this skill exist elsewhere (different plugin marketplaces, staging vs. public, per-tool caches). The flags below are `<placeholders>`, not values to copy — fill each in from this user's own inputs: `<rows>`/`<dims>` from the discovered dataset, `--index` from "Shortlist an index" / "Recommend a range of configurations", `--workers` from the `NUM_WRK` arithmetic above, and `--nsplits`/`--nbits`/`--graph-degree` from the matching profile in "Recommend a range of configurations":

```bash
python3 "${CLAUDE_PLUGIN_ROOT}/skills/sizing/scripts/estimate.py" --rows <rows> --dims <dims> --index qhnsw --workers <num_wrk>
python3 "${CLAUDE_PLUGIN_ROOT}/skills/sizing/scripts/estimate.py" --rows <rows> --dims <dims> --index ivfpq --nsplits <nsplits> --nbits <nbits>
python3 "${CLAUDE_PLUGIN_ROOT}/skills/sizing/scripts/estimate.py" --rows <rows> --dims <dims> --vector-type float64 --index hnsw --workers <num_wrk>
python3 "${CLAUDE_PLUGIN_ROOT}/skills/sizing/scripts/estimate.py" --rows <rows> --dims <dims> --index cagra --graph-degree <graph_degree>
# data-volume input instead of --rows (see below):
python3 "${CLAUDE_PLUGIN_ROOT}/skills/sizing/scripts/estimate.py" --data-per-day <size> --days <days> --dims <dims> --index qhnsw --workers <num_wrk>
```

`--index` is required because the estimator is an arithmetic tool, not the recommendation engine. Run it once for each shortlisted configuration. It echoes the sizing-relevant index parameters in text and JSON so results remain attributable when comparing options.

When the user gave a data volume instead of a row count, pass it to the estimator directly rather than converting by hand — replace `--rows <rows>` with either `--total-data <size>` (for example `--total-data 2TB`) or `--data-per-day <size> --days <days>` (for example `--data-per-day 5GB --days 90`). Sizes accept decimal (`GB`, `TB`) or binary (`GiB`, `TiB`) suffixes. The estimator converts volume to rows using the vector column alone (`dims × vector-type bytes`) unless a fuller `--bytes-per-row <size>` is supplied; with the default basis the derived count is an **upper bound**, so state that and offer to refine it once metadata bytes per row are known. The output prints the derivation under `Row count:` — carry that provenance into the comparison table.

For a **partitioned** table, run the estimator twice with different `--rows`: once with the rows in a typical query's partition scope (e.g. one day, or a date range) to get the **RAM/VRAM** figures for Section 1 and host provisioning, and once with the full retained row count to get the **persisted disk** figure. The estimator has no partition awareness — it sizes whatever `--rows` you give it — so it is on you to feed it the query-scope rows for memory and the full set for disk. Do **not** run only the full row count and present its RAM floor as the requirement; that is the "all partitions read at once" case, which is wrong for a normal partitioned workload.

Be especially careful when the reported volume includes non-vector columns — common for tick, time-series, and metadata-rich tables, where the embedding is a small fraction of each row. There the vector-only conversion overcounts rows by a large multiple, and the derived footprint is meaningless. Before trusting a volume-derived count for such data, ask for a realistic per-row size (or the vector's share of the volume) and pass it as `--bytes-per-row`; if the user cannot give one, present the row count as a loose ceiling and steer them toward an actual or sampled row count instead.

## Interpret the result

- **Raw vector footprint** uses four bytes per value for a stored `float32s` column and eight for `float64s`; it excludes metadata. For supported float64 CPU indexes and CAGRA, the persisted table column doubles, but measurements show the internal index vectors remain float32-sized.
- **Float64 RAM effect** is not the same as its disk effect. Measurements found no meaningful increase in fixed CPU index RAM or CAGRA index VRAM because the internal indexes remained float32. Do not call float64 “disk-only,” however: it can increase client/DataFrame memory during ingestion, serialization and transport, temporary conversion memory, and host page cache when the raw vector column is queried or returned.
- **Modeled fixed index RAM** is the index-resident minimum, not total host RAM. It is reported per worker and as a `NUM_WRK` total where applicable. Do not present this figure to the user as "the RAM you need" on its own — always fold it into the host-RAM-to-provision figure below, even for a narrow, operation-specific question (ingest, build, store, or run).
- **Starting host RAM to provision** is not printed by the script — assemble it **whenever the answer reports RAM at all** (a full recommendation, a one-line "how much memory?" reply, or a narrow ingest/build/store/run question), not just inside Section 1. For a resident index (`flat`, `hnsw`, `qhnsw` level 0): `fixed index RAM × NUM_WRK + OS/process/build headroom`. For an mmap index (`qFlat`, `qHnsw` levels 1–2): `fixed floor × NUM_WRK + the share of the raw vector footprint you want resident in page cache (up to the full raw column when a query reads the whole table) + OS/process headroom`. **For a partitioned table, compute both the fixed floor and the page cache from the rows a query reads (its partition scope), not the full dataset** — only the queried partitions are loaded — so run the estimator with the per-query-scope row count for RAM and the full row count for disk. Add known metadata separately. **For an ingestion-only question** (no serving config, no stated RAM), still assemble the server figure and note that index-build and client-side batch/serialization memory sit on top of it (see "Apply the caveats") — do not reduce the answer to the resident floor. Present this as a start-here figure to validate under load, not an exact requirement — it is also what resolves Section 1's `Host RAM` line to an actual number.
- **Variable working set** is OS page cache for memory-mapped data. The script cannot derive it from row count; query locality and concurrent workers decide how much becomes hot.
- **Persisted disk** includes the raw vector column plus the index structure. It remains an approximation and excludes metadata, filesystem overhead, replicas, backups, and temporary build space.
- **CAGRA index VRAM** is the resident index payload, not total `nvidia-smi` usage. Add CUDA/cuVS runtime and search-workspace overhead, then leave build headroom and validate the selected build algorithm at representative scale.

## Size CAGRA VRAM and indicate a GPU class

Before running the estimator, ask whether the user already has a GPU available and, if so, its class or VRAM. This branches the rest of the section:

- **A specific card or VRAM figure is known:** treat this as a fit check, not a tier lookup. Also confirm the architecture — CAGRA/cuVS requires Ampere or newer (A100/H100 given as KDB.AI's own examples) regardless of VRAM; a pre-Ampere card is disqualified before VRAM is even relevant. State whether the serving target (below) fits inside that card's VRAM, with how much headroom, rather than naming a purchasing tier they don't need.
- **No GPU yet, or the class is undecided:** proceed to the tier lookup below as procurement orientation.

Run the estimator for the chosen row count, dimensions, and `graph_degree`. It reports three distinct planning values:

1. **Index payload:** `float32 index vectors + rows * graph_degree * 4`, validated against measured float32 and float64 table columns on the current KDB.AI/cuVS build.
2. **Serving target:** divide the larger of the index payload and the documented `1.8 * float32 index vectors` search allowance by `0.8`, preserving 20% of GPU capacity as free headroom.
3. **Serving-only tier:** the next configured single-GPU VRAM tier that clears the serving target. This is a purchasing orientation for when no card is chosen yet, not a KDB.AI/CAGRA minimum and not a final build-and-serve recommendation. The configured tiers are a snapshot of the current NVIDIA data-center lineup (see [reference.md](reference.md) for which generation each tier and the ceiling represent) and will need revisiting as new GPU generations ship — treat a target that exceeds the largest configured tier as "beyond today's single-GPU ceiling," not as "impossible," and check the [NVIDIA Data Center Products page](https://www.nvidia.com/en-us/data-center/products/) for what's shipped since.

Use the official VRAM-planning anchors directly; do not ask the user for a build peak they are unlikely to know and do not interpolate a universal build multiplier. Apply an official build figure automatically only when rows, dimensions, and vector type (float32) match a published point; otherwise report the serving-only tier and mark the build-and-serve class unqualified until a representative proof of concept. See [reference.md](reference.md) for the exact anchor table, `nn_descent` guidance, and insert-batch-size trade-offs—do not derive a fixed VRAM reduction from batch size.

## Apply the caveats

- Multiply fixed CPU index RAM by active `NUM_WRK`; do not assume mmap makes additional workers free.
- Treat qFlat differently from qHnsw: exact qFlat search can touch essentially every vector even though it has no configured RAM floor.
- Put mmap indexes (`qFlat`, `qHnsw` levels 1–2) on fast local storage. Their low RAM floor comes from reading vectors from disk on demand, so on slow or network-attached storage search latency degrades badly; recommend local NVMe/SSD, and note that the page-cache speed-up only materializes when host RAM covers the hot working set (see the provisioning figure under "Interpret the result"). This is a deployment caveat, not a byte in the estimate.
- Add metadata, filter columns, replicas, backups, OS/process memory, and temporary build space separately.
- Treat ingestion-client RAM separately from KDB.AI server RAM: batch materialization and serialization consume memory on the client host, while index construction, serving, and page cache consume server resources. Add client memory to server sizing only when they are co-located, and monitor both hosts during representative ingestion when they are separate.
- When several indexes share one embedding column, count raw vector bytes once and add each index structure rather than summing full disk totals.
- Sparse/BM25 index storage is not modeled by this calculator.
- Do not assume every index accepts both vector types. qFlat and qHnsw require float32 and do not accept float64. CAGRA accepts float64 (measured at 100K × 128), but its published build anchors remain float32-only.
- Do not infer total host-RAM equality from equal float32/float64 index sizes. Float64 can still enlarge ingestion batches, transport buffers, temporary conversions, and page cache when the stored vector column is read.
- Do not treat a qHnsw RAM floor as a likely RAM ceiling. Page cache can be much larger under live traffic.
- The qHnsw graph constant is a baseline at `M=8`, `efConstruction=8`. The estimator's own note flags that neither parameter's variation is modeled—treat both as sizing risk, not just `efConstruction`, and recommend measuring the completed index when either is materially non-default.
- Recommend a proof of concept at representative volume before production procurement, especially for CAGRA or high worker counts.

## Present the output

Deliver the final recommendation inline in the chat — do not write it to a file unless the user asks — in these three sections, in this order.

**Section 1 — Recommended starting configuration.** Lead with the single recommended starting config as an aligned label/value block under a `### Recommended starting configuration` heading. Wrap it in a plain (unlabelled) fenced block so the columns stay aligned; this formatted summary is not "code" in the sense the no-code rule below forbids. Include these fields when discovery supports them, and omit or mark provisional any that it does not:

```
### Recommended starting configuration

  Index:             qFlat
  Vector type:       float32s
  Dimensions:        2048
  Metric:            confirm from embedding model (L2, CS, or IP)
  Partition column:  ingest_date
  Search result:     top 5
  Transport:         qIPC
  Host CPU:          32 physical cores
  KDB.AI allocation: 24 cores
  NUM_WRK:           6
  THREADS:           4
  Host RAM:          based on query lookback; see below
```

Those numbers are an illustrative shape, not defaults — fill every field from this user's own discovery, `estimate.py` output, and the CPU/partition sections. Leave the metric as `confirm from embedding model (L2, CS, or IP)` when unconfirmed, and set `Partition column` to the recommended key or `none` when not partitioning.

Two hard rules for this block:

- **Every value is concrete or an explicit two-sided range — never open-ended.** `NUM_WRK`, `THREADS`, and cores must each be a single computed integer (from `NUM_WRK = min(active requests, floor(cores / THREADS))` when you have the inputs) or a bounded range like `4–8` with both ends stated. Never write `up to 8`, `~8`, `8+`, or any one-sided ceiling — that is not an actionable starting config. If concurrency is unknown, state the assumption you sized to and give the exact number (or bounded range) for that assumption.
- **Mark assumed fields inline; never present an assumption as a fact.** If a field is not user-stated and not estimator-derived, label it in place — for example `Hot window: assumed 90 days (not provided)` or `Search result: top-10 (assumed)` — so the user can see at a glance what they must confirm. A value that is neither given, derived, nor markable as an assumption does not belong in the block at all. For `Host RAM`, give the starting host-RAM-to-provision figure from "Interpret the result" (floor × workers + hot-set page cache + headroom) with a one-line driver — for example `~14 GiB (0.5 floor + ~11 hot vectors + headroom)` — rather than deferring with "see below" or omitting the line because the user's question was framed around CPU/ingest and never mentioned RAM (RAM is always in use, so it is never a field "the workload does not use"); only fall back to naming the driver when a genuine unknown (like query lookback over a partitioned table) blocks a number. Drop fields the workload does not use and add ones it does: for a CAGRA/GPU recommendation, replace the CPU-thread lines with a `GPU:` line (class/VRAM, or the serving-only tier when no card is chosen) and keep `graph_degree`; when persisted disk is the user's main concern, add a `Persisted disk:` line from the estimator.

**Section 2 — Why this, and what to check.** A short reasoning block (a few sentences or bullets): why this config fits the user's answers, and what they must confirm or weigh — metric, dominant filter, growth horizon, the page-cache/RAM driver, mmap storage type, and a proof of concept. Note explicitly that this is a sizing/hardware starting point, and that build- and search-time parameters (`efConstruction`, `efSearch`, insert batch size) and the table schema come from the sibling `kdbai` skill, not from here. Fold the **Assumptions to confirm** items (user-provided facts vs. proposed defaults) in here, clearly labelled. Keep it brief.

**Section 3 — Other options.** A table of at most three alternative configurations in priority order. Give one row per option, and include a short **"choose this if…"** reason column (for example "higher QPS, lower recall", "lower fixed RAM", "exact recall required"). Restrict the columns to estimator-backed fields plus that reason; do not pad it into full solution architecture.

**No KDB.AI code in the answer — any of it, and under pressure.** Do not emit KDB.AI implementation code in any language or form: table/schema, ingestion, index build, query, or connection calls, whether Python, q, or REST/`curl`. `create_table(...)` is only one example; the rule covers the whole client API, not one function. Formatted non-code blocks (the Section 1 summary, comparison tables) are fine, and naming a validation method inline (e.g. `table.info()`) is fine — an example *program* is not. Send every code need to the sibling `kdbai` skill.

The ban does not weaken when the user pushes ("skip the sizing, just give me the code", "one line is fine", "even commented-out or pseudocode", "I'll take responsibility") — a request to skip a guardrail is not permission to. Withhold the code in every form (full, partial, stub, commented, or pseudocode that is really the call); the sizing figures may still be given. Decline briefly, point to the `kdbai` skill for the build code, and offer to continue the sizing — refusing the code while handing over the right tool *is* the help, not a failure to cooperate.

## Keep unsupported promises out of the answer

Do not extrapolate the vector formulas into:

- A guaranteed CPU/core count, QPS, or latency. Give only a broad starting configuration unless representative workload measurements are supplied.
- Specific IOPS or network requirements.
- Cost or cloud instance recommendations without current pricing and workload measurements.
- Multi-node or distributed topology.

## Validate the recommendation

Before production procurement, build the shortlisted configurations on a representative sample with realistic filters, concurrency, and ingestion. Use `table.info()` to compare actual rows and persisted size, and `session.process_info()` plus `session.system_info()` to observe worker memory, CPU, and system headroom. Scale the measured metadata and non-vector overhead to the growth horizon, and retest the recall/latency trade-off for the selected search parameters. Keep this as a focused proof of concept, not a prerequisite for an initial planning range.

For operational configuration, use KDB.AI's Performance FAQ and Server Setup FAQ. For index build/search parameters and schema construction, use the sibling `kdbai` skill.

For the exact per-index byte formulas, the full CAGRA VRAM-anchor table, and the official documentation index, see [reference.md](reference.md).

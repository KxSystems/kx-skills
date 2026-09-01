# Sizing reference

Detail that supports `SKILL.md` but isn't needed on every sizing question: the exact byte formulas the estimator implements, the full CAGRA VRAM-anchor table and build guidance, and the official documentation links. `SKILL.md` points here when a question needs this level of detail.

## Formula summary

The script is the executable source of truth for constants and arithmetic. In the table below, `stored raw` uses the selected column type (four bytes per float32 value or eight per float64 value), while `index vectors` use four bytes per value. Float64 is supported by the estimator for Flat, HNSW, IVF, and IVF-PQ, and CAGRA. qFlat and qHnsw require float32 and do not accept float64.

| Index | Fixed index memory | Persisted disk model |
| -- | -- | -- |
| `flat` | `index vectors` per worker | stored raw + float32 index vectors |
| `qFlat` | no fixed RAM floor; exact search can touch the full dataset | stored raw; float32 only |
| `hnsw` | `index vectors + rows * M * 9` per worker | stored raw + resident index |
| `qHnsw` | level 0: index vectors + graph; level 1: graph; level 2: near zero, all per worker | level 0: stored raw + index vectors + graph; levels 1/2: stored raw + graph, where graph is `rows * 137`; float32 only |
| `ivf` | `index vectors + centroids + rows * 8` per worker | stored raw + resident index |
| `ivfpq` | codes + centroids + assignments + PQ codebook, per worker | raw column + compressed index |
| `cagra` | index payload = index vectors + `rows * graph_degree * 4`; serving target = `max(index payload, 1.8 * index vectors) / 0.8`; apply official IVF-PQ build anchors only to matching float32 published points | stored raw + CAGRA index |

The HNSW, qHnsw, IVF/IVF-PQ auxiliary terms and CAGRA graph term are empirical planning constants. They were validated over limited versions, scales, and hardware and may change with KDB.AI or cuVS implementation details.

## CAGRA VRAM anchors and build guidance

Run the estimator for the chosen row count, dimensions, and `graph_degree`. It reports three distinct planning values:

1. **Index payload:** `float32 index vectors + rows * graph_degree * 4`, validated against measured float32 and float64 table columns on the current KDB.AI/cuVS build.
2. **Serving target:** divide the larger of the index payload and the documented `1.8 * float32 index vectors` search allowance by `0.8`, preserving 20% of GPU capacity as free headroom.
3. **Serving-only tier:** the next configured single-GPU VRAM tier that clears the serving target. This is a purchasing orientation, not a KDB.AI/CAGRA minimum and not a final build-and-serve recommendation.

Use the official VRAM-planning anchors directly; do not ask the user for a build peak they are unlikely to know and do not interpolate a universal build multiplier:

| Dataset | Published CAGRA index | Published IVF-PQ build peak | Planning indication with 20% capacity free |
| -- | -- | -- | -- |
| 1M × 128 | ~0.9 GB | ~3 GB | A dedicated 4 GiB card clears the published anchor; use 8 GiB when extra version, workspace, or shared-GPU margin is required |
| 10M × 64 | ~4.3 GB | ~15 GB | 24 GiB class |
| 100M × 128 | ~90 GB | Varies | At least a 120 GiB serving class; qualify the build separately |

Apply an official build figure automatically only when rows and dimensions match its published point and the stored vector type is float32. For float64 or other shapes, report the serving-only tier, show the two nearest official anchors as orientation, and mark the build-and-serve class unqualified until a representative proof of concept. Retained measurements show why: IVF-PQ build peak varied materially with scale, version, and fixed overhead even when the persisted/index-payload formula remained accurate.

Use `IVF_PQ` as the production build starting point. Treat `nn_descent` as a high-VRAM specialist option; official anchors report about 15 GB at 1M × 128 and 78 GB at 10M × 64, before headroom. Query batch size improves GPU utilization but can increase search scratch space, especially when `max_queries` preallocates buffers. The official docs publish no universal maximum insert/build batch row count or `max_queries` value; the `512` limit applies to `SINGLE_CTA`'s `itopk_size`, not batch size.

Treat insert batch size as an operational lever, not a product limit. For a dataset around 1M rows or smaller, a one-shot insert may be practical when client RAM, serialization and transport, request timeouts, temporary storage, and GPU build peak all fit; larger batches avoid repeated extend/write work and can speed the initial build at the cost of higher memory pressure. For larger datasets, use incremental inserts and treat about 1M rows as a practical upper starting point rather than a documented maximum; reduce the batch when client RAM, transport, or GPU VRAM is constrained. Retained tests show that smaller batches can materially reduce GPU build peak but can make the build much longer, so do not derive a fixed VRAM reduction from batch size. Use the official one-shot anchor as the conservative build figure when no representative pilot exists; otherwise qualify the exact ingestion strategy on the target release and GPU. Measure first-search and settled serving VRAM with representative query batch and concurrency because post-insert GPU usage can understate the loaded index and search workspace.

### Configured single-GPU VRAM tiers

`GPU_VRAM_TIERS_GIB` in `scripts/estimate.py` is a snapshot of shipped single-GPU VRAM classes, not a KX or NVIDIA product spec and not exhaustive. There is no NVIDIA-maintained, stable, structured spec table to source this from — the closest official artifacts, the [Data Center GPU Line Card](https://docs.nvidia.com/data-center-gpu/line-card.pdf) and the [Data Center Products page](https://www.nvidia.com/en-us/data-center/products/), are marketing pages that get restructured each generation, not versioned references. Treat the tiers below as dated, and re-check the products page before relying on the ceiling:

| Tier (GiB) | Representative card | As of |
| -- | -- | -- |
| 141 | H200 (HBM3e) | Aug 2026 |
| 180 | B200 (HBM3e) | Aug 2026 |
| 288 | B300 / Blackwell Ultra (HBM3e) | Aug 2026 |

GB200/GB300 (2-GPU and NVL72 rack systems built from the same B200/B300 dies) are intentionally excluded — they're multi-GPU/NVLink-pooled memory, and this estimator only models a single card. Rubin (~288 GiB HBM4, expected H2 2026) is not yet added; recheck once shipped.

Before quoting a tier, also confirm the compatibility floor separately from VRAM: KDB.AI's own [cuVS/CAGRA integration page](https://code.kx.com/kdbai/latest/integrations/nvidia-cuvs-cagra.html) requires **Ampere architecture or newer** (A100/H100 given as its own examples) with **40 GiB+ VRAM** recommended for large-scale datasets — a pre-Ampere card is disqualified regardless of VRAM, and that page does not publish a specific supported-card list beyond the architecture/VRAM floor.

## Partition vs non-partition table

Partitioning is a table-layout decision made at `create_table` with `partition_column`; it is orthogonal to index choice and does not change the per-index byte formulas above. Use the signals below — none is a hard rule on its own.

### Grounded decision thresholds

- **Volume and growth.** KDB.AI's own docs publish no row-count or size threshold for partitioning. kdb+'s ~100M-record "start considering it" figure is usable as **rough orientation**, but treat it as a loose cue, not a KDB.AI rule, and pair it with the two factors that actually decide it:
  - **Index resources.** Run the estimator at full volume and see whether the chosen index's footprint strains available RAM/disk. A resident index (Flat/HNSW/qHnsw L0) holds the whole thing in memory, so a high-dimensional dataset can force partitioning **well below** 100M rows; a low-floor mmap index (qHnsw L1/2, qFlat) keeps a small resident floor, so raw volume pressures disk and page cache more than RAM and can run **well above** 100M before layout is the problem.
  - **Search requirements.** Partitioning only earns its keep when queries filter on the key (pruning), need low latency on a subset, or need retention/archival. Global, unfiltered search over the whole table gets no benefit from partitioning by volume alone.
  Do not import kdb+/kdb-x table-type rules (flat/splayed/segmented) or its partition-domain mechanics — those do not apply to KDB.AI's per-table partitioning.
- **Filter alignment (KDB.AI).** The [partition reference](https://code.kx.com/kdbai/latest/reference/partition.html) is explicit: "Partition pruning only applies when the partition column appears in the query filter; if it does not, every partition is scanned and the partitioning pays cost without delivering benefit." Choose the key to match the dominant filter — `date` for time-series, `tenant_id`/`user_id` for retrieval-style workloads. If queries have no consistent metadata filter, do not partition.
- **Key type and scope.** Supported partition-key types are **date, integer, and symbol** (KDB.AI reference). The [KDB.AI partitioning guide](https://code.kx.com/kdbai/latest/use/partitioning.html) states the system creates the number of partitions within a key by default and it "should not be defined by the user." Partitioning is **per table**: each table sets its own `partition_column` at `create_table`, different tables can use different keys, and there is no shared database-wide partition domain. This is a genuine difference from kdb+/kdb-x (one partition domain per database) — do not carry the kdb+ constraint over. Choose each table's key for its own dominant filter.
- **Index compatibility — this is a hard constraint, not a preference.** Partitioning is supported only for dense **Flat, qFlat, HNSW, qHnsw**, **sparse**, and **TSS** indexes (per the [partitioning guide](https://code.kx.com/kdbai/latest/use/partitioning.html)), for both local and external kdb+ tables. **IVF, IVF-PQ, and CAGRA are not in that list and cannot be used on a partitioned table.** So the choice is mutually exclusive: if the workload needs partitioning (date-filtered time-series, tenant/user pruning, retention), do not recommend IVF-PQ or CAGRA — use qHnsw (or qFlat/HNSW/Flat) instead; if the workload needs IVF-PQ compression or CAGRA GPU search, it cannot be partitioned, so size it as a single non-partitioned table. Never pair a partition column with IVF-PQ or CAGRA in a recommendation.

### Sizing interaction

Partitioning does **not** reduce the estimator's totals: persisted disk and total index bytes are the sum across partitions and are unchanged. What it changes is workload-shaped, not a fixed byte figure:

- **RAM tracks the partitions a query reads, not the full table.** Every partition uses the same index type/config, and each behaves identically: a resident index loads a partition's index into RAM when that partition is queried, an mmap index memory-maps it — so only the partitions a query selects are in memory at a time. Both the qHnsw fixed graph floor and the mmap page cache therefore scale with the **per-query partition-scope row count**, not the full dataset. Size RAM from a separate estimator run at that row count; the full-dataset estimator total is a disk figure, and presenting it as required RAM is wrong for a partitioned workload unless a single query reads every partition.
- **Latency and QPS.** Because a pruned search touches far less data, partitioning aligned with the dominant filter can lower per-query latency and lift QPS; searches across partitions are also thread-parallelizable (see [Parallel Processing](https://code.kx.com/kdbai/latest/reference/multithreading.html)). Both are conditional on pruning applying and are workload-shaped, not a sized throughput figure — this calculator does not model QPS or latency, so validate the gain rather than quoting one.
- **Retention and growth.** Date partitioning lets old partitions be archived or dropped cheaply, which is how a continuously growing stream is capped to a bounded resident/disk size — size to the retention window, not to all-time volume.
- **No total-size credit.** Do not subtract anything from the sized RAM/disk floor because a table is partitioned; partitioning is a pruning/operational lever, not a compression scheme.

Recommend partitioning as a table-layout decision to validate in the proof of concept: build with the candidate key, then confirm with `table.info()` and representative filtered queries that pruning reduces the scanned working set as expected.

## Official references

- [Use Indexes](https://code.kx.com/kdbai/latest/use/supported-indexes.html)
- [Performance FAQ](https://code.kx.com/kdbai/latest/support/performance-faq.html)
- [Parallel Processing](https://code.kx.com/kdbai/latest/reference/multithreading.html)
- [Similarity Metrics](https://code.kx.com/kdbai/latest/reference/metrics.html)
- [Ingest Data](https://code.kx.com/kdbai/latest/use/ingestion.html)
- [Partition Data (KDB.AI guide)](https://code.kx.com/kdbai/latest/use/partitioning.html)
- [Partitioning reference (KDB.AI)](https://code.kx.com/kdbai/latest/reference/partition.html)
- [Get System Usage Information](https://code.kx.com/kdbai/latest/use/get-system-usage-info.html)
- [Configuration Guide](https://code.kx.com/kdbai/latest/gettingStarted/configuration.html)
- [Server Setup FAQ](https://code.kx.com/kdbai/latest/support/server-setup-faq.html)
- [NVIDIA cuVS/CAGRA integration](https://code.kx.com/kdbai/latest/integrations/nvidia-cuvs-cagra.html)
- [About indexes](https://code.kx.com/kdbai/latest/reference/index.html)

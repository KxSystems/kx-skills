# KDB-X GPU Module Reference

**Requirements**: NVIDIA data center GPUs (L4, H100), CUDA 13.1, driver v590+. Linux only. Containerized recommended (`nvidia/cuda:13.1.0-runtime-*`). H100 NVSwitch/NVLink clusters need Fabric Manager.

Load with: `.gpu:use`kx.gpu`

**Concepts**: GPU VRAM data = `foreign` type in q. **Mixed residency** = some columns GPU, others CPU.

---

## Data Transfer

```q
T:.gpu.to trades                              / All columns to GPU
T:.gpu.xto[`price`size] trades                / Selected columns (mixed residency)
hostT:.gpu.from T                             / Back to CPU
T:.gpu.append[T1;T2]                          / Join GPU-resident tables
```

## Device Management

```q
.gpu.ndev[]                                   / Count available GPUs
.gpu.gdev[]                                   / Current device index
.gpu.sdev 1                                   / Switch to GPU 1
.gpu.mdev[]                                   / Memory: used, heap, peak, mphy, free
.gpu.sync[]                                   / Wait for GPU completion
```

## GPU qSQL (Functional Select)

```q
/ .gpu.select[table; where; by; columns]
/ table must have ALL columns on device (.gpu.to first)

.gpu.select[T;();0b;()]                                          / Select all
.gpu.select[T;enlist(=;`sym;enlist`AAPL);0b;()]                  / Where
.gpu.select[T;((=;`sym;enlist`AAPL);(>;`price;151));0b;()]       / Multiple where (ANDed)

/ Aggregation by group (VWAP)
.gpu.select[T;();enlist[`sym]!enlist`sym;
  enlist[`vwap]!enlist(%;(sum;(*;`size;`price));(sum;`size))]

/ Computed columns
.gpu.select[T;();0b;enlist[`logp]!enlist(log;`price)]
```

**Supported ops**:
- Binary: `= <> < > <= >= + - * % | &`
- Unary: `abs log exp sin asin cos acos tan atan floor ceiling`
- Aggregates: `sum min max avg count`

## Sorting & Search

```q
.gpu.xasc[`time] T                           / Sort table by column(s)
.gpu.xasc[`size`time] T                      / Multi-column sort
.gpu.asc vec                                  / Sort vector (applies `s#)
.gpu.iasc vec                                 / Ascending grade indices
res:.gpu.bin[sortedVec; searchVals]           / Binary search (needs `g#)
```

## As-of Joins

Require `` `g# `` grouped attribute on join columns.

```q
T:.gpu.xgroup[`sym] T                        / Apply grouped attribute
.gpu.aj[`sym`time; Trade; Quote]              / As-of join (boundary time)
.gpu.aj0[`sym`time; Trade; Quote]             / aj with actual t2 times
.gpu.ajf[`sym`time; Trade; Quote]             / aj with null-fill from t1
.gpu.ajf0[`sym`time; Trade; Quote]            / aj0 + null-fill
```

## List Operations

```q
.gpu.count T                                  / Row/element count
.gpu.take[5;T]                                / First 5 rows
.gpu.take[-3;T]                               / Last 3 rows
.gpu.drop[`col1`col2] T                       / Remove columns
.gpu.sublist[2 5;T]                           / Slice: start=2, len=5
.gpu.gather[vec;idxVec]                       / Index-based selection
```

## Metadata

```q
.gpu.meta T                                   / Column types + residency (cpu/gpu)
.gpu.attr vec                                 / Attribute: `s `u `p `g or `
.gpu.type vec                                 / Type code (e.g. 7h for long)
.gpu.group vec                                / Apply `g# attribute
.gpu.xgroup[`sym`time] T                     / Group specific columns
```

## Gotchas

- Only `` `s# `` attribute survives `.gpu.from` round-trip back to CPU
- Symbol sorting not yet implemented in `.gpu.asc`
- `.gpu.select` requires ALL columns on device — `.gpu.to` first
- `.gpu.bin` and `.gpu.aj` require `` `g# `` grouped attribute
- 10x-25x speedups typical; near-linear multi-GPU scaling

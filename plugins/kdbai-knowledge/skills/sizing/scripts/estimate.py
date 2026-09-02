#!/usr/bin/env python3
"""Estimate KDB.AI vector-index RAM, VRAM, and persisted disk.

This is a planning aid, not a KX product specification. It models the vector
column and index structure only. Validate production sizing with representative
data, index parameters, concurrency, and build behaviour.

Rows may be given directly with --rows, or derived from a data-volume figure
when the user knows how much data they ingest rather than an exact row count:
supply --total-data, or --data-per-day with --days, and rows are inferred from
the per-row byte size (the vector column by default, or --bytes-per-row).

Examples:
    python3 estimate.py --rows 2_000_000 --dims 1536 --index qhnsw --workers 4
    python3 estimate.py --rows 10_000_000 --dims 1536 --index ivfpq
    python3 estimate.py --rows 1_000_000 --dims 768 --vector-type float64 --index hnsw
    python3 estimate.py --rows 1_000_000 --dims 128 --index cagra
    python3 estimate.py --data-per-day 5GB --days 90 --dims 1536 --index qhnsw
    python3 estimate.py --total-data 2TB --dims 1024 --bytes-per-row 5KB --index hnsw
"""

from __future__ import annotations

import argparse
import json
from dataclasses import asdict, dataclass
from typing import Optional


BYTES_PER_FLOAT32 = 4
VECTOR_TYPE_BYTES = {"float32": 4, "float64": 8}
GIB = 1024**3
GB = 1000**3

# Decimal (1000) and binary (1024) unit suffixes for --data-per-day/--total-data.
SIZE_UNITS = {
    "": 1,
    "b": 1,
    "kb": 1000, "mb": 1000**2, "gb": 1000**3, "tb": 1000**4, "pb": 1000**5,
    "kib": 1024, "mib": 1024**2, "gib": 1024**3, "tib": 1024**4, "pib": 1024**5,
}

# Empirical planning constants. They are implementation details, not guarantees.
HNSW_BYTES_PER_ROW_PER_M = 9
QHNSW_BYTES_PER_ROW = 137
QHNSW_GRAPH_NOTE = (
    "The 137-byte graph term is an empirical efConstruction=8 baseline; "
    "variation with M is not modeled."
)
IVF_ASSIGNMENT_BYTES_PER_ROW = 8
CAGRA_BYTES_PER_ROW_PER_GRAPH_DEGREE = 4
CAGRA_SEARCH_RAW_NUMERATOR = 18
CAGRA_SEARCH_RAW_DENOMINATOR = 10
CAGRA_HEADROOM_NUMERATOR = 5
CAGRA_HEADROOM_DENOMINATOR = 4
GPU_VRAM_TIERS_GIB = (4, 8, 12, 16, 24, 32, 40, 48, 64, 80, 96, 120, 141, 180, 288)
CAGRA_OFFICIAL_IVFPQ_BUILD_PEAK_GB = {
    (1_000_000, 128): 3,
    (10_000_000, 64): 15,
}

INDEX_TYPES = ("flat", "qflat", "hnsw", "qhnsw", "ivf", "ivfpq", "cagra")


@dataclass(frozen=True)
class Estimate:
    """Byte-level sizing result for one index configuration."""

    index: str
    configuration: dict[str, int]
    rows: int
    rows_source: str
    dims: int
    vector_type: str
    bytes_per_vector_element: int
    workers: int
    raw_vector_bytes: int
    fixed_ram_per_worker_bytes: int
    fixed_ram_total_bytes: int
    persisted_disk_bytes: int
    cagra_index_vram_bytes: int
    cagra_serving_vram_target_bytes: int
    cagra_serving_vram_tier_gib: Optional[int]
    cagra_official_ivfpq_build_peak_bytes: int
    cagra_official_build_vram_target_bytes: int
    cagra_official_build_and_serve_vram_tier_gib: Optional[int]
    variable_working_set: bool
    note: str


def require_positive(name: str, value: int) -> None:
    if value <= 0:
        raise ValueError(f"{name} must be greater than zero")


def parse_size(text: str) -> int:
    """Parse a data-volume string such as '5GB', '1.5TiB', or '2048' into bytes.

    Decimal suffixes (KB/MB/GB/TB/PB) use 1000; binary suffixes
    (KiB/MiB/GiB/TiB/PiB) use 1024; a bare number is bytes.
    """
    cleaned = text.strip().replace("_", "").replace(" ", "")
    if not cleaned:
        raise ValueError("empty size value")
    number = cleaned
    suffix = ""
    for i, char in enumerate(cleaned):
        if not (char.isdigit() or char == "."):
            number, suffix = cleaned[:i], cleaned[i:]
            break
    unit = SIZE_UNITS.get(suffix.lower())
    if unit is None:
        raise ValueError(
            f"unknown size unit in {text!r}; use bytes or a KB/MB/GB/TB/KiB/GiB/TiB suffix"
        )
    try:
        magnitude = float(number)
    except ValueError as error:
        raise ValueError(f"could not parse size value {text!r}") from error
    scaled = magnitude * unit
    if scaled <= 0:
        raise ValueError(f"size value {text!r} must be greater than zero")
    return int(round(scaled))


def rows_from_data_volume(total_data_bytes: int, bytes_per_row: int) -> int:
    """Infer a row count from a total data volume and a per-row byte size."""
    require_positive("total data bytes", total_data_bytes)
    require_positive("bytes per row", bytes_per_row)
    return max(1, round(total_data_bytes / bytes_per_row))


def raw_vector_bytes(rows: int, dims: int, vector_type: str = "float32") -> int:
    require_positive("rows", rows)
    require_positive("dims", dims)
    try:
        bytes_per_element = VECTOR_TYPE_BYTES[vector_type]
    except KeyError as error:
        raise ValueError(f"unknown vector type: {vector_type}") from error
    return rows * dims * bytes_per_element


def ivfpq_codebook_bytes(dims: int, nbits: int) -> int:
    return (2**nbits) * dims * BYTES_PER_FLOAT32


def ceil_ratio(value: int, numerator: int, denominator: int) -> int:
    return (value * numerator + denominator - 1) // denominator


def gpu_vram_tier_gib(required_bytes: int) -> Optional[int]:
    for tier in GPU_VRAM_TIERS_GIB:
        if required_bytes <= tier * GIB:
            return tier
    return None


def estimate(
    index: str,
    rows: int,
    dims: int,
    *,
    rows_source: str = "explicit --rows count",
    vector_type: str = "float32",
    workers: int = 1,
    m: int = 8,
    mmap_level: int = 1,
    nclusters: int = 8,
    nsplits: int = 8,
    nbits: int = 8,
    graph_degree: int = 64,
    intermediate_graph_degree: int = 128,
) -> Estimate:
    """Return a planning estimate for one KDB.AI vector index.

    Fixed CPU RAM is modeled per active worker. Persisted disk is not multiplied
    by workers. Memory-mapped page cache is workload-dependent and is flagged,
    not assigned a synthetic byte value.
    """

    index = index.lower()
    if index not in INDEX_TYPES:
        raise ValueError(f"unknown index type: {index}")

    if vector_type == "float64" and index in {"qflat", "qhnsw"}:
        raise ValueError(f"{index} does not accept float64 vectors; use float32")
    for name, value in (("rows", rows), ("dims", dims), ("workers", workers)):
        require_positive(name, value)

    raw = raw_vector_bytes(rows, dims, vector_type)
    index_vectors = rows * dims * BYTES_PER_FLOAT32
    fixed_ram = 0
    disk = 0
    index_vram = 0
    serving_vram_target = 0
    serving_vram_tier = None
    official_build_peak = 0
    official_build_target = 0
    official_build_and_serve_tier = None
    variable_working_set = False
    configuration: dict[str, int] = {}

    if index == "flat":
        fixed_ram = index_vectors
        disk = raw + fixed_ram
        note = (
            "Exact in-memory index; persisted disk includes the stored raw column and a "
            "float32 index copy."
        )

    elif index == "qflat":
        disk = raw
        variable_working_set = True
        note = (
            "Exact disk-backed search has no configured RAM floor, but a query can touch "
            "essentially the full vector set."
        )

    elif index == "hnsw":
        require_positive("M", m)
        configuration = {"M": m}
        graph = rows * m * HNSW_BYTES_PER_ROW_PER_M
        fixed_ram = index_vectors + graph
        disk = raw + fixed_ram
        note = f"Resident float32 index vectors plus an additive graph term at M={m}."

    elif index == "qhnsw":
        require_positive("M", m)
        if mmap_level not in (0, 1, 2):
            raise ValueError("mmap_level must be 0, 1, or 2")
        graph = rows * QHNSW_BYTES_PER_ROW
        configuration = {"M": m, "mmapLevel": mmap_level}
        if mmap_level == 0:
            fixed_ram = index_vectors + graph
            disk = raw + fixed_ram
            note = (
                "Vectors and graph are resident; disk includes a redundant self-contained copy. "
                + QHNSW_GRAPH_NOTE
            )
        elif mmap_level == 1:
            fixed_ram = graph
            disk = raw + graph
            variable_working_set = True
            note = (
                "Graph is the fixed RAM floor; memory-mapped vectors add variable page cache. "
                + QHNSW_GRAPH_NOTE
            )
        else:
            disk = raw + graph
            variable_working_set = True
            note = (
                "Vectors and graph are memory-mapped; live page-cache use is not estimated. "
                + QHNSW_GRAPH_NOTE
            )

    elif index == "ivf":
        require_positive("nclusters", nclusters)
        configuration = {"nclusters": nclusters}
        centroids = nclusters * dims * BYTES_PER_FLOAT32
        assignments = rows * IVF_ASSIGNMENT_BYTES_PER_ROW
        fixed_ram = index_vectors + centroids + assignments
        disk = raw + fixed_ram
        note = (
            "Index vectors and centroids remain float32; clustering narrows search rather "
            "than raw storage."
        )

    elif index == "ivfpq":
        for name, value in (("nclusters", nclusters), ("nsplits", nsplits), ("nbits", nbits)):
            require_positive(name, value)
        if dims % nsplits:
            raise ValueError("dims must be divisible by nsplits for IVF-PQ")
        configuration = {"nclusters": nclusters, "nsplits": nsplits, "nbits": nbits}
        codes = (rows * nsplits * nbits + 7) // 8
        centroids = nclusters * dims * BYTES_PER_FLOAT32
        assignments = rows * IVF_ASSIGNMENT_BYTES_PER_ROW
        codebook = ivfpq_codebook_bytes(dims, nbits)
        fixed_ram = codes + centroids + assignments + codebook
        disk = raw + fixed_ram
        note = "Compressed index plus the separately persisted raw vector column."

    else:  # cagra
        require_positive("graph_degree", graph_degree)
        require_positive("intermediate_graph_degree", intermediate_graph_degree)
        if intermediate_graph_degree < graph_degree:
            raise ValueError(
                "intermediate_graph_degree must be greater than or equal to graph_degree"
            )
        if rows <= intermediate_graph_degree:
            raise ValueError(
                "rows must be greater than intermediate_graph_degree for CAGRA"
            )
        configuration = {
            "graph_degree": graph_degree,
            "intermediate_graph_degree": intermediate_graph_degree,
        }
        graph = rows * graph_degree * CAGRA_BYTES_PER_ROW_PER_GRAPH_DEGREE
        index_vram = index_vectors + graph
        documented_search_floor = ceil_ratio(
            index_vectors,
            CAGRA_SEARCH_RAW_NUMERATOR,
            CAGRA_SEARCH_RAW_DENOMINATOR,
        )
        serving_vram_target = ceil_ratio(
            max(index_vram, documented_search_floor),
            CAGRA_HEADROOM_NUMERATOR,
            CAGRA_HEADROOM_DENOMINATOR,
        )
        serving_vram_tier = gpu_vram_tier_gib(serving_vram_target)
        official_peak_gb = (
            CAGRA_OFFICIAL_IVFPQ_BUILD_PEAK_GB.get((rows, dims))
            if vector_type == "float32"
            else None
        )
        if official_peak_gb is not None:
            official_build_peak = official_peak_gb * GB
            official_build_target = ceil_ratio(
                official_build_peak,
                CAGRA_HEADROOM_NUMERATOR,
                CAGRA_HEADROOM_DENOMINATOR,
            )
            official_build_and_serve_tier = gpu_vram_tier_gib(
                max(serving_vram_target, official_build_target)
            )
        disk = raw + index_vram
        note = (
            "Single-GPU CAGRA uses a float32 internal index for the tested float32 and "
            "float64 table columns. The serving target uses the larger of the measured "
            "float32 index-payload formula and the documented 1.8x-float32 search allowance, "
            "then preserves 20% free capacity. Published IVF-PQ build anchors are applied "
            "only to matching float32 points; NUM_WRK GPU duplication is not modeled."
        )

    return Estimate(
        index=index,
        configuration=configuration,
        rows=rows,
        rows_source=rows_source,
        dims=dims,
        vector_type=vector_type,
        bytes_per_vector_element=VECTOR_TYPE_BYTES[vector_type],
        workers=workers,
        raw_vector_bytes=raw,
        fixed_ram_per_worker_bytes=fixed_ram,
        fixed_ram_total_bytes=fixed_ram * workers,
        persisted_disk_bytes=disk,
        cagra_index_vram_bytes=index_vram,
        cagra_serving_vram_target_bytes=serving_vram_target,
        cagra_serving_vram_tier_gib=serving_vram_tier,
        cagra_official_ivfpq_build_peak_bytes=official_build_peak,
        cagra_official_build_vram_target_bytes=official_build_target,
        cagra_official_build_and_serve_vram_tier_gib=official_build_and_serve_tier,
        variable_working_set=variable_working_set,
        note=note,
    )


def gib(value: int) -> float:
    return value / GIB


def fmt_gib(value: int) -> str:
    return f"{gib(value):.2f} GiB"


def fmt_gb(value: int) -> str:
    return f"{value / GB:.0f} GB"


def json_payload(result: Estimate) -> dict:
    payload = asdict(result)
    for key, value in tuple(payload.items()):
        if key.endswith("_bytes"):
            payload[key.removesuffix("_bytes") + "_gib"] = gib(value)
    return payload


def parser() -> argparse.ArgumentParser:
    p = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument(
        "--rows",
        type=int,
        help="Number of vectors/rows (or derive from --total-data / --data-per-day)",
    )
    p.add_argument("--dims", type=int, required=True, help="Embedding dimensions")
    p.add_argument(
        "--data-per-day",
        help="Ingested data volume per day, e.g. 5GB (use with --days to derive rows)",
    )
    p.add_argument("--days", type=int, help="Retention/horizon in days for --data-per-day")
    p.add_argument(
        "--total-data",
        help="Total stored data volume, e.g. 2TB (alternative to --rows)",
    )
    p.add_argument(
        "--bytes-per-row",
        help=(
            "Per-row byte size for volume-to-rows conversion, e.g. 5KB "
            "(default: the vector column, dims * vector-type bytes)"
        ),
    )
    p.add_argument(
        "--vector-type",
        choices=tuple(VECTOR_TYPE_BYTES),
        default="float32",
        help=(
            "Stored vector-column type; qflat and qhnsw require float32 "
            "(default: float32)"
        ),
    )
    p.add_argument("--index", choices=INDEX_TYPES, required=True, help="Selected index to estimate")
    p.add_argument("--workers", type=int, default=1, help="Active NUM_WRK processes (default: 1)")
    p.add_argument("--M", dest="m", type=int, default=8, help="HNSW M (default: 8)")
    p.add_argument("--mmap-level", type=int, default=1, choices=(0, 1, 2), help="qHnsw mmapLevel")
    p.add_argument("--nclusters", type=int, default=8, help="IVF/IVF-PQ clusters (default: 8)")
    p.add_argument("--nsplits", type=int, default=8, help="IVF-PQ sub-vectors (default: 8)")
    p.add_argument("--nbits", type=int, default=8, help="IVF-PQ bits per code (default: 8)")
    p.add_argument("--graph-degree", type=int, default=64, help="CAGRA graph degree (default: 64)")
    p.add_argument(
        "--intermediate-graph-degree",
        type=int,
        default=128,
        help="CAGRA intermediate graph degree (default: 128)",
    )
    p.add_argument("--json", action="store_true", help="Emit machine-readable JSON")
    return p


def print_result(result: Estimate) -> None:
    print(f"Rows: {result.rows:,}  Dims: {result.dims}")
    if result.rows_source != "explicit --rows count":
        print(f"Row count: {result.rows_source}")
    print(
        f"Stored vector type: {result.vector_type} "
        f"({result.bytes_per_vector_element} bytes/value)"
    )
    print(f"Index: {result.index}")
    if result.configuration:
        values = ", ".join(f"{key}={value}" for key, value in result.configuration.items())
        print(f"Configuration: {values}")
    print(f"Modeled raw vector footprint: {fmt_gib(result.raw_vector_bytes)}")
    if result.fixed_ram_per_worker_bytes:
        print(f"Modeled fixed index RAM per worker: {fmt_gib(result.fixed_ram_per_worker_bytes)}")
        print(
            f"Modeled fixed index RAM for {result.workers} worker(s): "
            f"{fmt_gib(result.fixed_ram_total_bytes)}"
        )
    elif result.index == "cagra":
        print("CPU index RAM: not estimated for CAGRA; size host RAM separately")
    else:
        print("Modeled fixed index RAM floor: none; live memory can still grow")
    if result.variable_working_set:
        print("Variable page-cache working set: workload-dependent; not estimated")
    if result.cagra_index_vram_bytes:
        print(f"CAGRA index VRAM: {fmt_gib(result.cagra_index_vram_bytes)}")
        print(
            "CAGRA serving VRAM target (including 20% free capacity): "
            f"{fmt_gib(result.cagra_serving_vram_target_bytes)}"
        )
        if result.cagra_serving_vram_tier_gib is None:
            print(
                f"Serving-only target exceeds the largest configured tier "
                f"({GPU_VRAM_TIERS_GIB[-1]} GiB) — beyond today's single-GPU classes "
                "modeled here, not necessarily impossible; check the current NVIDIA "
                "data-center lineup"
            )
        else:
            print(
                "Smallest configured serving-only tier clearing the target: "
                f"{result.cagra_serving_vram_tier_gib} GiB VRAM "
                "(not a product minimum or preferred GPU class)"
            )
        if result.cagra_official_ivfpq_build_peak_bytes:
            print(
                "Published approximate IVF-PQ build peak: ~"
                f"{fmt_gb(result.cagra_official_ivfpq_build_peak_bytes)} "
                f"({fmt_gib(result.cagra_official_ivfpq_build_peak_bytes)})"
            )
            print(
                "Official-anchor build target (including 20% free capacity): "
                f"{fmt_gib(result.cagra_official_build_vram_target_bytes)}"
            )
            if result.cagra_official_build_and_serve_vram_tier_gib is None:
                print(
                    f"Build-and-serve target exceeds the largest configured tier "
                    f"({GPU_VRAM_TIERS_GIB[-1]} GiB) — beyond today's single-GPU classes "
                    "modeled here, not necessarily impossible; check the current NVIDIA "
                    "data-center lineup"
                )
            else:
                print(
                    "Smallest configured tier clearing the approximate build-and-serve target: "
                    f"{result.cagra_official_build_and_serve_vram_tier_gib} GiB VRAM "
                    "(not a product minimum or preferred GPU class)"
                )
        else:
            print(
                "Build-and-serve tier: not interpolated; compare with the published "
                "1M x 128 and 10M x 64 IVF-PQ build anchors and validate"
            )
    print(f"Modeled persisted vector/index disk: {fmt_gib(result.persisted_disk_bytes)}")
    print(f"Note: {result.note}")
    print(
        "Planning estimate only; add metadata, host process/page-cache/build headroom, "
        "replicas, backups, and temporary storage, then validate."
    )


def resolve_rows(args) -> tuple[int, str]:
    """Return (rows, provenance) from --rows or a data-volume figure.

    Volume is converted to rows using --bytes-per-row, or the vector column
    (dims * vector-type bytes) when that is not supplied. A bare vector column
    understates true per-row size when metadata is present, so a volume-derived
    row count is an upper bound; it is labelled as such in the output.
    """
    volume_given = args.total_data is not None or args.data_per_day is not None
    if args.rows is not None:
        stray = [
            flag
            for flag, value in (
                ("--total-data", args.total_data),
                ("--data-per-day", args.data_per_day),
                ("--days", args.days),
                ("--bytes-per-row", args.bytes_per_row),
            )
            if value is not None
        ]
        if stray:
            raise ValueError(
                "--rows is a direct row count; drop the volume-derivation flags "
                f"({', '.join(stray)}) or use them instead of --rows"
            )
        require_positive("rows", args.rows)
        return args.rows, "explicit --rows count"
    if not volume_given:
        raise ValueError(
            "supply --rows, or a data volume via --total-data "
            "or --data-per-day with --days"
        )

    if args.total_data is not None:
        if args.data_per_day is not None:
            raise ValueError("give either --total-data or --data-per-day, not both")
        if args.days is not None:
            raise ValueError("--days pairs with --data-per-day, not --total-data")
        total_bytes = parse_size(args.total_data)
        volume_label = f"total data {args.total_data}"
    else:
        if args.days is None:
            raise ValueError("--data-per-day requires --days")
        require_positive("days", args.days)
        per_day = parse_size(args.data_per_day)
        total_bytes = per_day * args.days
        volume_label = f"{args.data_per_day}/day x {args.days} days"

    if args.bytes_per_row is not None:
        bytes_per_row = parse_size(args.bytes_per_row)
        row_basis = f"{args.bytes_per_row}/row"
        caveat = ""
    else:
        bytes_per_row = args.dims * VECTOR_TYPE_BYTES[args.vector_type]
        row_basis = f"vector column only ({args.dims} dims x {args.vector_type})"
        caveat = " (upper bound; pass --bytes-per-row to add metadata per row)"
    rows = rows_from_data_volume(total_bytes, bytes_per_row)
    return rows, f"derived from {volume_label} / {row_basis}{caveat}"


def main(argv: Optional[list[str]] = None) -> int:
    args = parser().parse_args(argv)
    try:
        rows, rows_source = resolve_rows(args)
        raw_vector_bytes(rows, args.dims, args.vector_type)
        require_positive("workers", args.workers)
        result = estimate(
            args.index,
            rows,
            args.dims,
            rows_source=rows_source,
            vector_type=args.vector_type,
            workers=args.workers,
            m=args.m,
            mmap_level=args.mmap_level,
            nclusters=args.nclusters,
            nsplits=args.nsplits,
            nbits=args.nbits,
            graph_degree=args.graph_degree,
            intermediate_graph_degree=args.intermediate_graph_degree,
        )
    except ValueError as error:
        parser().error(str(error))

    if args.json:
        print(json.dumps(json_payload(result), indent=2, sort_keys=True))
    else:
        print_result(result)
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

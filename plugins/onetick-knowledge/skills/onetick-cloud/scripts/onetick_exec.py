# /// script
# requires-python = ">=3.10"
# dependencies = [
#   "onetick-py[webapi]",
#   "pyarrow",
# ]
# ///
"""OneTick execution helper — runs finished SQL against OneTick Cloud.

Executes a OneTick SQL statement, writes the FULL result to an Arrow Feather
file, and prints a bounded JSON envelope so the agent only ever sees a small
preview — stdout is ~the same size for a 5-row or a 5M-row result.

Two execution engines, chosen automatically (see `run_sql`):

  * REST fast path (default) — talks to the OneTick Cloud REST endpoint
    (`<OTP_HTTP_ADDRESS>/omdwebapi/rest/`, `query_type=sql`, `response=csv`)
    over OAuth `client_credentials`, using only stdlib `urllib` + `pyarrow`.
    Avoids `import onetick.py` (a ~6-7s per-process cost — the WebAPI client
    wheel with OAuth setup), so a one-shot invocation starts in well under a
    second instead of ~7s. This helper only ever runs SQL, never a Python-native
    otp graph, so the wheel is pure overhead for the job — that is what the REST
    path removes.
  * onetick-py wheel fallback — the original path via `otp.SqlQuery`. Used only
    when the REST path is genuinely unavailable (transport/infra failure), or
    when forced with ONETICK_EXEC_ENGINE=wheel. A OneTick *query* error (an
    `ERR_...` code) is NOT a fallback trigger — it propagates for the SKILL.md
    retry contract, since the wheel would reproduce the same error.

Invoke via `uv run` (the PEP 723 metadata above pins deps into a cached venv):
  CLI:    uv run onetick_exec.py --sql "<SQL>" [--no-show-sql] [--timezone TZ] [--output PATH]
          stdout = {rows, columns, preview_rows, path, preview, sql?}
  import: from onetick_exec import run_sql; tbl = run_sql(sql)  -> pyarrow.Table

  * No row cap: the SQL's own `limit` / `TIMESTAMP` clauses bound the result.
    Preview row count = ONETICK_PREVIEW_ROWS env (default 20); full result on disk.
  * OneTick errors propagate with the verbatim ERR_ code; the CLI emits it as
    {"error": "..."} (exit 1) for the SKILL.md retry contract.

Engine selection — ONETICK_EXEC_ENGINE (optional): `auto` (default; REST then
wheel fallback), `rest` (REST only), or `wheel` (wheel only).

Credentials — environment only, no file: OTP_CLIENT_ID / OTP_CLIENT_SECRET (required),
OTP_HTTP_ADDRESS / OTP_ACCESS_TOKEN_URL (optional, defaulted). A missing required
secret fails cleanly with OneTickConfigError.
"""

from __future__ import annotations

import argparse
import contextlib
import hashlib
import json
import os
import sys
import tempfile
import time
import urllib.error
import urllib.parse
import urllib.request
from pathlib import Path


@contextlib.contextmanager
def _stdout_to_stderr():
    """Redirect fd 1 -> fd 2 for the duration of the block.

    onetick.py (and its C++ binding) print warnings/notices to stdout at import
    and exception time. The CLI's stdout is a machine-read JSON envelope, so any
    stray write would corrupt it. An fd-level dup2 catches C-level writes too,
    not just Python's sys.stdout. Used only around the wheel path — the REST path
    does not import onetick.py and prints nothing.
    """
    sys.stdout.flush()
    saved = os.dup(1)
    try:
        os.dup2(2, 1)
        yield
    finally:
        sys.stdout.flush()
        os.dup2(saved, 1)
        os.close(saved)

# ---------------------------------------------------------------------------
# Config — resolve credentials and WebAPI endpoints. Shared by both engines.
# ---------------------------------------------------------------------------

# Bare cloud host — the REST/WebAPI base. The REST path appends /omdwebapi/rest/.
_DEFAULT_HTTP_ADDRESS = "https://rest.cloud.onetick.com"
_DEFAULT_TOKEN_URL = (
    "https://cloud-auth.parent.onetick.com/realms/OMD/protocol/openid-connect/token"
)
_REST_PATH = "/omdwebapi/rest/"

# Inline preview is always present; its row count defaults to 20 and is
# configurable via the ONETICK_PREVIEW_ROWS environment variable. Display only —
# the full result is always written to disk regardless of this value.
_DEFAULT_PREVIEW_ROWS = 20
_PREVIEW_ROWS_ENV = "ONETICK_PREVIEW_ROWS"

# Engine selection: auto (REST then wheel fallback) | rest | wheel.
_ENGINE_ENV = "ONETICK_EXEC_ENGINE"
_TOKEN_CACHE_ENV = "ONETICK_TOKEN_CACHE"  # set to "0" to disable on-disk token cache


def _preview_rows() -> int:
    """Preview row count: ONETICK_PREVIEW_ROWS if set and valid, else 20."""
    raw = os.environ.get(_PREVIEW_ROWS_ENV)
    if raw is None or not raw.strip():
        return _DEFAULT_PREVIEW_ROWS
    try:
        n = int(raw)
    except ValueError:
        return _DEFAULT_PREVIEW_ROWS
    return n if n >= 0 else _DEFAULT_PREVIEW_ROWS

_SETUP_HINT = (
    "Register at https://authdash.cloud.onetick.com/web_dashboard/?dash=sub_profile "
    "to get a client_id and client_secret, then export them as OTP_CLIENT_ID / "
    "OTP_CLIENT_SECRET (e.g. in your shell rc). See SKILL.md `Setup`."
)


class OneTickConfigError(RuntimeError):
    """Missing or malformed credentials — actionable, points the user to setup."""


class OneTickQueryError(RuntimeError):
    """A OneTick *query* error carrying an ERR_ code.

    Raised by the REST path when OneTick rejects the statement (bad field,
    unknown DB, malformed range, ...). This is NOT a fallback trigger — the wheel
    would reproduce the same error — so it propagates to the CLI as the verbatim
    error envelope the SKILL.md retry contract feeds back into search_sql-docs.
    """


class _RestUnavailable(RuntimeError):
    """REST transport/infra failure (unreachable, non-query HTTP error, bad body).

    Internal signal: in `auto` mode this triggers the onetick-py wheel fallback.
    """


def _resolve_creds() -> dict:
    """Resolve credentials + endpoints from the environment (no credentials file).

      * OTP_CLIENT_ID, OTP_CLIENT_SECRET       (required)
      * OTP_HTTP_ADDRESS, OTP_ACCESS_TOKEN_URL (optional — defaults above)

    Raises OneTickConfigError (with the setup hint) if either secret is missing.
    """
    env = os.environ
    client_id = env.get("OTP_CLIENT_ID")
    client_secret = env.get("OTP_CLIENT_SECRET")
    missing = [
        name
        for name, val in (("OTP_CLIENT_ID", client_id), ("OTP_CLIENT_SECRET", client_secret))
        if not val
    ]
    if missing:
        raise OneTickConfigError(
            f"Missing OneTick credentials: {', '.join(missing)} not set. {_SETUP_HINT}"
        )
    return {
        "client_id": client_id,
        "client_secret": client_secret,
        "http_address": env.get("OTP_HTTP_ADDRESS") or _DEFAULT_HTTP_ADDRESS,
        "token_url": env.get("OTP_ACCESS_TOKEN_URL") or _DEFAULT_TOKEN_URL,
    }


def _ensure_webapi_env() -> None:
    """Export the credential env vars the onetick-py wheel reads at import time.

    Must run before `import onetick.py`. Validates the required secrets via
    _resolve_creds and fills endpoint defaults only when not already provided.
    """
    _resolve_creds()  # validate presence; raises OneTickConfigError if missing
    os.environ["OTP_WEBAPI"] = "1"
    os.environ.setdefault("OTP_HTTP_ADDRESS", _DEFAULT_HTTP_ADDRESS)
    os.environ.setdefault("OTP_ACCESS_TOKEN_URL", _DEFAULT_TOKEN_URL)


# ---------------------------------------------------------------------------
# REST fast path — OAuth + POST SQL, parse the CSV response into a pyarrow.Table.
# ---------------------------------------------------------------------------


def _token_cache_path(client_id: str, token_url: str) -> Path:
    key = hashlib.sha1(f"{client_id}|{token_url}".encode("utf-8")).hexdigest()[:16]
    return Path(tempfile.gettempdir()) / "onetick-results" / f".token-{key}.json"


def _read_cached_token(path: Path) -> str | None:
    """Return a cached access token if present and not near expiry, else None.

    Fail-open: any read/parse error just means "no cached token".
    """
    try:
        data = json.loads(path.read_text())
        if float(data.get("expires_at", 0)) > time.time() + 60:
            return data.get("access_token") or None
    except Exception:  # noqa: BLE001 — cache is best-effort
        return None
    return None


def _store_token(path: Path, token: str, expires_in: int) -> None:
    """Cache a short-lived access token (0600). Best-effort; never raises.

    Only the short-lived access token is written — never the client secret.
    """
    try:
        path.parent.mkdir(parents=True, exist_ok=True)
        payload = json.dumps({"access_token": token, "expires_at": time.time() + max(0, expires_in)})
        # 0600 so other local users can't read the bearer token.
        fd = os.open(str(path), os.O_WRONLY | os.O_CREAT | os.O_TRUNC, 0o600)
        try:
            os.write(fd, payload.encode("utf-8"))
        finally:
            os.close(fd)
    except Exception:  # noqa: BLE001 — caching is optional
        pass


def _fetch_token(creds: dict, timeout: int = 30) -> tuple[str, int]:
    body = urllib.parse.urlencode(
        {
            "grant_type": "client_credentials",
            "client_id": creds["client_id"],
            "client_secret": creds["client_secret"],
        }
    ).encode("utf-8")
    req = urllib.request.Request(
        creds["token_url"],
        data=body,
        headers={"Content-Type": "application/x-www-form-urlencoded"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=timeout) as resp:
            payload = json.loads(resp.read().decode("utf-8"))
    except (urllib.error.URLError, TimeoutError, ValueError) as exc:
        raise _RestUnavailable(f"OAuth token request failed: {exc}") from exc
    token = payload.get("access_token")
    if not token:
        raise _RestUnavailable("OAuth token endpoint returned no access_token")
    return token, int(payload.get("expires_in", 0) or 0)


def _get_token(creds: dict) -> str:
    """Obtain a bearer token, reusing a cached one unless disabled."""
    use_cache = os.environ.get(_TOKEN_CACHE_ENV, "1") != "0"
    cache_path = _token_cache_path(creds["client_id"], creds["token_url"])
    if use_cache:
        cached = _read_cached_token(cache_path)
        if cached:
            return cached
    token, expires_in = _fetch_token(creds)
    if use_cache:
        _store_token(cache_path, token, expires_in)
    return token


def _map_ot_type(ot_type: str):
    """Map a OneTick column type token to (arrow_type, time_unit_or_None).

    OneTick emits `<type> <NAME>` per header cell when output_types_in_headers is
    on. Time columns come back as integer epoch counts (show_times_as_nanos on),
    so they are read as int64 then cast to a timestamp of the returned unit.
    """
    t = ot_type.strip().lower()
    if t.startswith("string") or t.startswith("varstring"):
        return "string", None
    if t == "nsectime":
        return "int64", "ns"
    if t == "msectime":
        return "int64", "ms"
    if t in ("double", "float", "decimal"):
        return "float64", None
    if t in ("long", "int", "short", "byte", "uint", "ulong", "int32", "int64", "uint64"):
        return "int64", None
    return "string", None  # unknown OneTick type -> safe string passthrough


def _extract_err(body: str) -> str:
    for line in body.splitlines():
        if "ERR_" in line or "FATAL_ERROR" in line or line.strip().upper().startswith("ERROR"):
            return line.lstrip("#").strip()
    return (body.strip()[:500] or "unknown OneTick error")


def _is_error_body(first_line: str) -> bool:
    fl = first_line.lstrip("#").strip().upper()
    return fl.startswith("FATAL_ERROR") or fl.startswith("ERROR:") or fl.startswith("ERROR ")


def _parse_csv_to_table(body: str):
    """Parse a OneTick CSV response (types-in-headers, nanos times) to a Table.

    Header line is `#<type> <NAME>,<type> <NAME>,...`. Columns whose name starts
    with `_` are OneTick service columns (e.g. `_SYMBOL_NAME`, `_OUTPUT_LABEL`)
    and are dropped — matching the clean column set the wheel's pandas output has.
    """
    import pyarrow as pa  # noqa: PLC0415
    import pyarrow.csv as pacsv  # noqa: PLC0415

    body = body.lstrip("﻿")
    if not body.strip():
        return pa.table({})  # zero rows come back as an empty body

    nl = body.find("\n")
    header_line = body if nl == -1 else body[:nl]
    data = "" if nl == -1 else body[nl + 1:]
    header_line = header_line.lstrip("#")

    names: list[str] = []
    column_types: dict = {}
    time_units: dict = {}
    keep: list[str] = []
    for cell in header_line.split(","):
        cell = cell.strip()
        if " " in cell:
            ot_type, name = cell.split(" ", 1)
        else:  # defensive: header without a type prefix
            ot_type, name = "string", cell
        name = name.strip()
        arrow_name, tunit = _map_ot_type(ot_type)
        names.append(name)
        column_types[name] = {
            "string": pa.string(),
            "float64": pa.float64(),
            "int64": pa.int64(),
        }[arrow_name]
        if tunit:
            time_units[name] = tunit
        if not name.startswith("_"):  # drop OneTick service columns
            keep.append(name)

    clean_csv = (",".join(names) + "\n" + data).encode("utf-8")
    table = pacsv.read_csv(
        pa.BufferReader(clean_csv),
        read_options=pacsv.ReadOptions(use_threads=True),
        convert_options=pacsv.ConvertOptions(column_types=column_types, include_columns=keep),
    )

    # Epoch-int time columns -> real timestamps of the unit OneTick returned.
    for name, unit in time_units.items():
        if name in table.column_names:
            idx = table.column_names.index(name)
            table = table.set_column(idx, name, table.column(idx).cast(pa.timestamp(unit)))
    return table


def _run_sql_rest(sql: str, timezone: str):
    """Execute SQL via the REST endpoint and return a pyarrow.Table.

    Raises OneTickQueryError on a OneTick query error (ERR_ code; no fallback),
    or _RestUnavailable on transport/infra failure (triggers wheel fallback).
    """
    creds = _resolve_creds()
    token = _get_token(creds)
    payload = json.dumps(
        {
            "query_type": "sql",
            "statement": sql,
            "timezone": timezone,
            "response": "csv",
            "show_times_as_nanos": "true",       # uniform epoch-ns for all time cols
            "output_only_one_header": "true",     # single header for multi-symbol output
            "output_types_in_headers": "true",    # authoritative types, no inference
            "compression": "none",
        }
    ).encode("utf-8")
    base = creds["http_address"].rstrip("/")
    # Don't double-append the REST path if the configured address already includes it
    if base.endswith(_REST_PATH.rstrip("/")):
        url = base + "/"
    else:
        url = base + _REST_PATH
    req = urllib.request.Request(
        url,
        data=payload,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"},
        method="POST",
    )
    try:
        with urllib.request.urlopen(req, timeout=300) as resp:
            text = resp.read().decode("utf-8", "replace")
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", "replace")
        # A OneTick query error can arrive as a 4xx carrying an ERR_ body.
        if "ERR_" in detail or "FATAL_ERROR" in detail or "ERROR" in detail.upper():
            raise OneTickQueryError(_extract_err(detail)) from exc
        raise _RestUnavailable(f"REST HTTP {exc.code}: {detail[:200]}") from exc
    except (urllib.error.URLError, TimeoutError) as exc:
        raise _RestUnavailable(f"REST endpoint unreachable: {exc}") from exc

    first_line = text.split("\n", 1)[0] if text else ""
    if _is_error_body(first_line):  # errors also arrive as HTTP 200 + #FATAL_ERROR body
        raise OneTickQueryError(_extract_err(text))
    return _parse_csv_to_table(text)


# ---------------------------------------------------------------------------
# onetick-py wheel fallback (the original execution path).
# ---------------------------------------------------------------------------

_otp = None


def _otp_module():
    global _otp
    if _otp is None:
        _ensure_webapi_env()
        import onetick.py as otp  # noqa: PLC0415 — must follow _ensure_webapi_env

        _otp = otp
    return _otp


def _run_sql_wheel(sql: str, timezone: str):
    """Execute SQL via the onetick-py[webapi] wheel -> pyarrow.Table.

    The original path. Heavy `import onetick.py` (~6-7s) happens here, lazily, so
    it is paid only when the REST path is unavailable or the wheel is forced.
    """
    import pandas as pd  # noqa: PLC0415
    import pyarrow as pa  # noqa: PLC0415

    # onetick.py prints notices to stdout at import/exception time; keep them off
    # the JSON envelope's stdout.
    with _stdout_to_stderr():
        otp = _otp_module()
        # pandas (not polars) output — deliberate per SME: end users hit issues
        # with polars, so we accept the one pandas->Arrow copy on the way to disk.
        result = otp.run(
            otp.SqlQuery(sql),
            output_structure="pandas",
            timezone=timezone,
        )

    # merge_all_symbols defaults to False, so a multi-symbol query can return a
    # dict of per-symbol frames. Concatenate defensively into one DataFrame.
    if isinstance(result, dict):
        frames = [f for f in result.values() if f is not None]
        result = pd.concat(frames, ignore_index=True) if frames else None
        if result is None:
            return pa.table({})

    # Accepted in-memory copy: pandas DataFrame -> Arrow Table.
    return pa.Table.from_pandas(result, preserve_index=False)


# ---------------------------------------------------------------------------
# Public API
# ---------------------------------------------------------------------------


def run_sql(sql: str, timezone: str = "Europe/London", engine: str | None = None):
    """Execute a OneTick SQL statement and return the FULL result as a pyarrow.Table.

    No row cap — runs the SQL exactly (its own `limit` / `TIMESTAMP` clauses bound
    the result).

    Engine (ONETICK_EXEC_ENGINE env, or the `engine` arg — `auto` default):
      * auto  — try the REST fast path; on a transport/infra failure fall back to
                the onetick-py wheel. A OneTick query error (ERR_ code) propagates
                without fallback (the wheel would reproduce it).
      * rest  — REST only.
      * wheel — onetick-py wheel only.

    Args:
        sql: Full SQL statement. The agent composes this; the helper does not
             validate or rewrite it. Time literals should carry an explicit
             timezone.
        timezone: Output-timestamp timezone (governs rendering, not literal
                  parsing inside the SQL).
        engine: Override the engine for this call; defaults to the env value.

    Returns:
        pyarrow.Table — the complete result set.

    Raises:
        OneTickConfigError: missing credentials.
        OneTickQueryError / Exception: OneTick errors propagate with the verbatim
            `ERR_...` code in str(exc) (the retry contract relies on this).
    """
    engine = (engine or os.environ.get(_ENGINE_ENV) or "auto").strip().lower()

    if engine == "wheel":
        return _run_sql_wheel(sql, timezone)
    if engine == "rest":
        return _run_sql_rest(sql, timezone)

    # auto: REST fast path, wheel only on genuine REST unavailability.
    try:
        return _run_sql_rest(sql, timezone)
    except _RestUnavailable as exc:
        print(f"onetick_exec: REST path unavailable ({exc}); "
              f"falling back to onetick-py wheel.", file=sys.stderr)
        return _run_sql_wheel(sql, timezone)


# ---------------------------------------------------------------------------
# CLI
# ---------------------------------------------------------------------------


def _default_output_path(sql: str, timezone: str) -> Path:
    digest = hashlib.sha1(f"{sql}|{timezone}".encode("utf-8")).hexdigest()[:16]
    base = Path(tempfile.gettempdir()) / "onetick-results"
    base.mkdir(parents=True, exist_ok=True)
    return base / f"{digest}.feather"


def _cli() -> int:
    parser = argparse.ArgumentParser(
        description="Execute a OneTick SQL statement against OneTick Cloud.",
        epilog="Reads SQL from --sql, --sql-file, or stdin (in that priority).",
    )
    parser.add_argument("--sql", help="SQL statement (inline).")
    parser.add_argument("--sql-file", help="Path to a file containing the SQL statement.")
    parser.add_argument(
        "--timezone", default="Europe/London", help="Output-timestamp timezone."
    )
    parser.add_argument(
        "--output",
        help="Path to write the Arrow Feather result "
        "(default ${TMPDIR}/onetick-results/<hash>.feather).",
    )
    parser.add_argument(
        "--show-sql",
        action=argparse.BooleanOptionalAction,
        default=True,
        help="Echo the executed statement in the envelope's `sql` field "
        "(default on; use --no-show-sql to omit it).",
    )
    args = parser.parse_args()

    if args.sql:
        sql = args.sql
    elif args.sql_file:
        with open(args.sql_file, "r", encoding="utf-8") as fh:
            sql = fh.read()
    elif not sys.stdin.isatty():
        sql = sys.stdin.read()
    else:
        parser.error("provide SQL via --sql, --sql-file, or stdin")
        return 2

    if not sql.strip():
        parser.error("SQL is empty")
        return 2

    sql = sql.strip()

    try:
        table = run_sql(sql, timezone=args.timezone)
    except OneTickConfigError as exc:
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 1
    except Exception as exc:  # noqa: BLE001 — surface the verbatim OneTick error
        print(json.dumps({"error": str(exc)}), file=sys.stderr)
        return 1

    import pyarrow.feather as feather  # noqa: PLC0415

    out_path = Path(args.output) if args.output else _default_output_path(
        sql, args.timezone
    )
    out_path.parent.mkdir(parents=True, exist_ok=True)
    feather.write_feather(table, out_path)

    # Preview is always present; row count from ONETICK_PREVIEW_ROWS (default 20).
    preview = table.slice(0, _preview_rows()).to_pylist()
    envelope = {
        "rows": table.num_rows,           # total rows in the full result on disk
        "columns": [{"name": f.name, "type": str(f.type)} for f in table.schema],
        "preview_rows": len(preview),     # how many rows are shown inline (<= 20)
        "path": str(out_path),            # full result (all `rows`) as Arrow Feather
        "preview": preview,
    }
    if args.show_sql:                     # configurable, default on
        envelope["sql"] = sql             # the exact statement that was run

    if table.num_rows == 0:
        envelope["hint"] = (
            "0 rows returned. Common causes, in rough order: "
            "(1) date range outside the DB's coverage window — check the start "
            "date in list_databases / db_table_schemas output; "
            "(2) missing timezone on TIMESTAMP literals "
            "(`'2024-01-03 09:00:00 America/New_York'`); "
            "(3) `TIMESTAMP BETWEEN ...` instead of `TIMESTAMP >= ... AND TIMESTAMP < ...`; "
            "(4) cross-DB query missing the DB::SYMBOL qualifier on SYMBOL_NAME "
            "(`SYMBOL_NAME='US_COMP_SAMPLE::AAPL'` when querying OTQ_CHAIN); "
            "(5) wrong tick-type variant (e.g. TRD_1M when the DB only has TRD_1D); "
            "(6) the symbol genuinely has no data on that date. "
            "Apply the SKILL.md retry contract: feed this hint and the SQL back into "
            "search_sql-docs for guidance, then retry up to 3 times."
        )
    json.dump(envelope, sys.stdout, default=str)
    sys.stdout.write("\n")
    return 0


if __name__ == "__main__":
    raise SystemExit(_cli())

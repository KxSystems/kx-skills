# Table Creation

Read this when the user needs schema control (custom column types, sort attributes, a persistent production table). Everything else uses `import_files(..., createTable=True)`.

**Default to `import_files(..., createTable=True)`** unless the user has explicitly specified custom column types, sort attributes, or schema requirements. Auto-schema derivation from the CSV header avoids manual type mapping mistakes.

Use the explicit `create_table` API for schema control and non-default column types. It does not make a table survive a reset: `reset-db.sh` deletes `data/` and every table with it. Keep the `create_table` call in your own script so the schema can be recreated after a reset. **All arguments are keyword-only** - positional arguments raise a `TypeError`:

```python
session.create_table(
    table='my_table',
    type='partitioned',
    prtnCol='ts',
    sortColsDisk=['sym'],
    sortColsOrd=['sym'],
    columns=[
        {"name": "ts",  "type": "timestamp"},
        {"name": "sym", "type": "symbol", "attrMem": "grouped", "attrDisk": "parted"},
        # ... remaining columns
    ]
)
```

Model explicit schemas on the doc examples at https://code.kx.com/kdb-x/services/db-service/manage-tables.html. Key constraints:
- `prtnCol` must be a timestamp-type column
- Set `attrDisk: "parted"` on the sort column (`sym` above) only. Do not set it on `ts`: repeated timestamps across symbols can make the attribute fail (q reports `u-fail`).

Reference data, foreign keys and clustered deployments: `references/04-advanced-features.md`.

# Live Documentation Index

Read this when you need exact API behaviour, parameter names or a doc page URL. Fetch pages with `WebFetch`; the live docs win over this skill.

> **If a URL below returns 404, or you need a page not listed here**, fetch `https://code.kx.com/kdb-x/services/db-service/introduction.html` first - its left-nav sidebar lists the current set of all DB Service doc pages, so you can discover the correct URL dynamically.

## Contents

- [Documentation pages](#documentation-pages)
- [API endpoint deep-links](#api-endpoint-deep-links)

---

## Documentation pages

| Page | URL | Topics |
|------|-----|--------|
| Introduction | https://code.kx.com/kdb-x/services/db-service/introduction.html | Architecture, capabilities, interfaces overview |
| Quickstart | https://code.kx.com/kdb-x/services/db-service/quickstart.html | Connecting to the service (Python, q, REST) |
| Import | https://code.kx.com/kdb-x/services/db-service/import.html | File ingest, API ingest, streaming ingest, job control |
| Query | https://code.kx.com/kdb-x/services/db-service/query.html | Structured query, SQL, q query, response format |
| Manage Tables | https://code.kx.com/kdb-x/services/db-service/manage-tables.html | List, describe, create, drop tables |
| API Reference | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html | Full endpoint reference |
| Import (initial / HDB migration) | https://code.kx.com/kdb-x/services/db-service/import-initial.html | Symlink-based migration of an existing kdb+ HDB (clustered) |
| Manage Tables (Clustered) | https://code.kx.com/kdb-x/services/db-service/manage-tables-clustered.html | Assembly-YAML table definitions; `create`/`drop`/`createTable` are unavailable here |
| Reference Data | https://code.kx.com/kdb-x/services/db-service/reference-data.html | Keyed reference tables, `foreign` column property, dotted-column queries |
| Custom Code | https://code.kx.com/kdb-x/services/db-service/custom-code.html | `KXI_CUSTOM_FILE`, UDF/UDA registration, REST exposure |
| Delete Data | https://code.kx.com/kdb-x/services/db-service/delete-data.html | Beta delete-rows API, job status, object-storage restriction |
| Configuration | https://code.kx.com/kdb-x/services/db-service/configuration.html | Multi-assembly targeting, assembly config export |
| Storage Tiers | https://code.kx.com/kdb-x/services/db-service/storage-tiers.html | RDB/IDB/HDB/object-storage lifecycle, `pctMemThreshold` |
| Backup and Restore | https://code.kx.com/kdb-x/services/db-service/backup-restore.html | Clustered-only PVC backup/restore via `kubectl` |
| Official Troubleshooting | https://code.kx.com/kdb-x/services/db-service/troubleshooting.html | KX's own troubleshooting page (complements the local one below) |


## API endpoint deep-links

Fetch these directly for precise request/response shapes without parsing the full API page.

| Operation | URL |
|-----------|-----|
| List tables | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Tables/operation/listTables |
| Create table | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Tables/operation/configTableCreate |
| Describe table | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Tables/operation/configTable |
| Drop table | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Tables/operation/configTableDelete |
| Import files | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Imports/operation/importFiles |
| Import data (inline) | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Imports/operation/importData |
| Start ingest job | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Imports/operation/ingestStart |
| Ingest status | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Imports/operation/ingestStatus |
| Cancel import (`DELETE /api/v0/imports/{jobId}`, operationId `ingestDelete`) | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Imports/operation/ingestDelete |
| Simple query | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Query/operation/simple |
| SQL query | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Query/operation/sql |
| q/qSQL query | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Query/operation/qsql |
| Preview query | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Query/operation/preview |
| Delete rows (beta) | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Deletes/operation/deleteStart |
| Delete job status | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Deletes/operation/deleteStatus |
| Cancel delete job (operationId `deleteDelete`, `DELETE /api/v0/deletes/{jobId}`) | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Deletes/operation/deleteDelete |
| Export assembly config | https://code.kx.com/kdb-x/services/db-service/api/dbservice.html#tag/Configuration/operation/exportAssembly |

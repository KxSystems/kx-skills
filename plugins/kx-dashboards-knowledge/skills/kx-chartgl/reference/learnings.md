# kx-chartgl — Known Limitations & Learnings from Live Testing

> Known limitations and 18 confirmed learnings (L1–L18) captured from live KX Dashboards testing. Back to [SKILL.md](../SKILL.md).

**Contents:** Known Limitations · Learnings from Live Testing (L1–L18)

---

## Known Limitations

- **`generate.js` does not yet support Candlestick via config** — build the layer JSON manually using the schema above.
- **`by` without an aggregate** returns lists per cell. ChartGL silently renders nothing. Always use `last`, `avg`, `sum`, etc.
- **JPY and other high-magnitude symbols** distort auto-scaled Y-axes when mixed with sub-1.5 FX pairs. Use dual Y-axes or a manual range.
- **Streaming subscriptions** require the KX server to publish to the dashboard websocket. Static and polling work without server-side configuration.
- **Bubbles block on Line Layer 0** with `Color` + `RadiusScaling > 0` causes KX to render as Bubble type. Safe on Layer 1+ but avoid on Layer 0, or use `RadiusScaling: 0` with no `Color`.
- **`ema*` wildcard Y-axis** plots all columns starting with `ema` as separate lines — useful for multi-period moving averages from a single data source.
- **Horizontal stacked bars** require `Stacked: true` on the X-axis (not Y-axis) and `BarOrientation: "Horizontal"` on each Bar layer.

---

## Learnings from Live Testing

### L1 — Bid layer rendered as Bubble instead of Line
**Symptom:** Imported dashboard showed Bid series as Bubble in the KX settings panel despite `_Type: "Line"`.
**Root cause:** `generate.js` added a `Bubbles` block with `Color`, `RadiusData: "Fixed Size"`, `RadiusScaling: 80` to all layers including Line-typed ones.
**Fix:** Remove the `Bubbles` block from Line layers (or use Pattern B with `RadiusScaling: 0`, no `Color`).

### L2 — Chart rendered empty despite valid data source
**Symptom:** Correct sym labels on X-axis but no data points.
**Root cause:** `select bid, ask by sym from dfxQuote` returns lists per sym cell. ChartGL silently renders nothing.
**Fix:** `select last bid, last ask by sym from dfxQuote`.

### L3 — Y-axis range showing 0–100 instead of expected 0.6–1.5
**Root cause:** USD/JPY (~109) present alongside sub-1.5 FX pairs. Auto-scale stretches to the highest value.
**Fix:** Set `Range.UseMinMax: true` with explicit `Min`/`Max`, add a second Y-axis for JPY, or filter JPY in the query.

### L4 — Dashboard names not reflecting actual table/columns
**Fix:** Always set `name`, `chartName`, layer `Name`, and data source `name` to reflect the actual table, columns, and aggregation (e.g. `"Airports — Count by Airport Type"` not `"ChartGL Dashboard"`).

### L5 — Series type options omitted Candlestick and Waterfall
**Fix:** Always offer all 8 series types. Contextually exclude types that don't fit (Candlestick requires OHLC columns; Waterfall requires sequential change structure) — explain why when excluding.

### L6 — Custom tooltip not rendering
**Root cause:** `UseCustomTooltip` defaulted to `false` — template is silently ignored.
**Fix:** Always set `Overlay.UseCustomTooltip: true` when specifying a custom template.

### L7 — Layers can have different X-axis columns
**Confirmed:** Multiple layers on the same chart can use different X-axis columns (e.g. `XAxis: "Horsepower"` vs `XAxis: "Displacement"`). Both bind to the same X-Axis ID but each plots against its own column independently.

### L8 — Candlestick uses explicit OHLC field mapping, not YAxis
**Confirmed:** Use `Open`, `High`, `Low`, `Close` as direct fields. `YAxis` field is absent. Both `Bubbles: {}` and `Bars: {}` must be present as empty objects.

### L9 — Moving Average wildcard YAxis pattern
**Confirmed:** `YAxis: "ema*"` on a Line layer plots all columns starting with `ema` as separate lines. Useful for `ema12`, `ema26` without defining a separate layer per column.

### L10 — kdb+ count aggregate retains source column name
**Pattern:** `select count id by airport_type from Airports` returns `airport_type` and `id` (not `count`). Always bind `yCol` to the source column name (`"id"`), not `"count"`.

### L11 — `zoomEnabled` is not a valid ChartGL field
**Fix:** The correct field is `Basics.Zoom: true`. Never emit `zoomEnabled`.

### L12 — Upload validation cannot be automated
Claude has no HTTP access to a running KX Dashboards instance. Upload validation must be performed manually: copy to `~/.kx/dashboards/data/dashboards/{id}.json`, reload KX Dashboards, report issues back.

### L13 — Table schema files greatly improve generation accuracy
When the user provides table schema files (column names, types, typical queries), auto-populate `columns`, `queryString`, `xCol`, `yCol`, and `series` without asking column-level questions. Always ask users if schema/table reference files are available before asking column-level questions.

### L14 — Axis type `"Log"` is invalid; correct value is `"Logarithmic"`
**Confirmed from source (`componentDefinition.ts`):** Enum is `["Linear", "Category", "Time", "Logarithmic"]`. Using `"Log"` silently reverts to `"Linear"`.

### L15 — Candlestick colours belong inside `CandlestickFormat`, not at layer root
**Confirmed:** `BullColor`, `BearColor`, `NeutralColor`, `WickColor` are properties of `CandlestickFormat`. Placing them at layer root causes them to be silently ignored. `NeutralColor` (default `#ffffff`) applies when open equals close.

### L16 — `Basics.RangeSelection` is mutually exclusive with `Basics.Zoom`
**Confirmed from source (v4.7.8a upgrade):** Always set both explicitly. Omitting `RangeSelection` causes the upgrade migration to set it to `!Zoom` automatically — but explicit is safer.

### L17 — Three new layer types confirmed in source: Bounds, Baseline, Heatmap
**Confirmed from source:** ChartGL supports 8 layer types, not 5. `Bounds`, `Baseline`, `Heatmap` are fully supported. Offer these when contextually appropriate (Baseline for threshold lines, Bounds for range highlighting).

### L18 — HighlightRules supports two types: discrete and gradient
**Confirmed:** `gradient` type maps a numeric column between `RuleMin` and `RuleMax` to a colour `Palette` array. Use for continuous colour encoding of numeric columns (e.g. heat-colouring P&L values).

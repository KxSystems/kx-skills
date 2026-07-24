# kx-chart3d — Known Limitations

> Runtime constraints and edge cases to keep in mind when generating Chart3D dashboards. Back to [SKILL.md](../SKILL.md).

**Contents:** Known Limitations

---

## Known Limitations

- **Z axis does not support `"Time"`.** Use Y axis for the time dimension instead, or pre-convert timestamps to numeric epoch values. `generate.js` silently converts `"Time"` on the Z axis to `"Linear"`.
- **No built-in legend.** Unlike ChartGL, Chart3D has no legend panel — layer names appear only in the settings panel.
- **Single data source per layer.** Each layer binds to exactly one data source; cross-layer joins must be done in the kdb+ query.
- **`surface` and `grid` require a regular XY grid.** Sparse or irregular data renders incorrectly; use `dot` for unstructured datasets.
- **`dot-color` reverses the ColorPalette** — the first `ColorScheme` entry maps to the highest Volume value, not the lowest.
- **Category axis label cache.** Unique string values are indexed on first data load. New category values arriving via streaming may not refresh the axis without a full re-render.
- **Streaming and polling** use the same DataSource subscription mechanism as other components. Use `_subscriptionType: "streaming"` for live tick data.


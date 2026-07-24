# kx-query — q snippets for dashboards

> This reference stays intentionally short — it covers only the q patterns that matter specifically when writing KX Dashboards data sources, not generic q fundamentals such as operators, iterators, system commands, and data types.

Back to [SKILL.md](../SKILL.md).

## Dashboard-specific q patterns

- Keep query snippets compatible with dashboard data-source blocks, including ViewState parameters and reserved-word constraints.
- Prefer compact q expressions that can be embedded directly in a data source or a query action.
- This file stays dashboard-specific; it does not duplicate general q language reference material.

## Example snippets

```q
/ Filter a table by a symbol parameter
select from trades where sym = $[type symParam; symParam; `]
```

```q
/ Aggregate for a dashboard view
select last price, max volume by sym from trades
```

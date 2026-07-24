# kx-dataform — NLQ Regression Tests

> Retest these queries on every MR that changes this skill or `generate.js`'s Dataform path. Back to [SKILL.md](../SKILL.md).

---

NLQ TEST CASES — retestable queries for MR validation
======================================================

1. Basic text-input form
   NLQ: "Create a parameter form with three text fields: symbol, exchange, and currency, connected to the TradeQuery data source on connection tradefeed"
   Expected: Dataform with 3 Default-type fields, ViewStates grouped under the form name, Data bound to TradeQuery, connection tradefeed.

2. Form with dropdown field (data-source backed)
   NLQ: "Build a dataform that has a symbol dropdown populated from a data source called SymbolList, and a date picker for trade date. On submit it re-executes a kdb+ query on connection html5evalcongroup"
   Expected: Dataform with one Dropdown field (Data = SymbolList, ValueColumn = sym, TextColumn = sym) and one Datepicker field. Submit data source is a kdb+ query source.

3. Form with number spinner and slider
   NLQ: "Create a risk parameter form with a quantity number field (increment 100, no decimals) and a confidence slider from 0 to 100, connected to connection riskconn"
   Expected: Dataform with Number field (Increment=100, UseDecimalPlaces=false) and Slider field (Range=false, Tooltip=false).

4. Mixed-type form with reset button
   NLQ: "Make a dataform named Trade Filter with symbol (dropdown from SymList), start date (datepicker), end date (datepicker), and show both a Submit and a Reset button, using connection kdbprod"
   Expected: Dataform Basics with ShowSubmit=true, ShowReset=true; two Datepicker fields, one Dropdown field.

5. Form writing to a virtual data source (display result in datagrid)
   NLQ: "Create a form that takes two inputs — a boolean flag and a double value — and shows the submitted values in a datagrid below, using connection health-demo|idb"
   Expected: Dataform bound to a _dataType:virtual data source with _virtualParams referencing grouped ViewStates; Datagrid bound to the same virtual source.

6. Password field form
   NLQ: "Add a login form with a username text field and a password field, binding to the AuthQuery data source on connection authconn"
   Expected: Dataform with one Default field (username) and one Password field.

7. Form with float-submit (sticky submit button)
   NLQ: "Create a compact inline form with a symbol dropdown and a date picker. The submit button should float at the bottom. Use connection tradefeed."
   Expected: Dataform Basics with FloatSubmit=true, Style inline=Top or Left.

8. Multi-select dropdown form
   NLQ: "Build a data form with a multi-select dropdown for symbols (populated from SymbolData, text and value both sym column), connected to connection kdbconn"
   Expected: Dataform with Dropdown field, MultiSelect=true, DataSourceMapping.Value="sym", DataSourceMapping.Text="sym".

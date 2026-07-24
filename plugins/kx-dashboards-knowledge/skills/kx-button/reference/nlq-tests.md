# kx-button — NLQ Test Queries

> Maintainer NLQ regression queries to retest on every MR that changes this skill or `generate.js`'s makeButtonWidget. Back to [SKILL.md](../SKILL.md).

**Contents:** How to retest · NLQ-001 … NLQ-008

---

=================================================================
NLQ TEST QUERIES
Retest all queries below on every MR that modifies this skill or
generate.js makeButtonWidget.

How to retest:
  1. Invoke /kx-button then paste the query.
  2. Manually embed the generated component JSON into a dashboard widget.
  3. Load the dashboard in KX Dashboards and verify the button renders,
     labels, icon, and actions behave as expected.
=================================================================

NLQ-001
Query : "Add a Submit button"
Config: Label="Submit", all defaults, Actions=[]
Expect: definitionId="25", key="BasicComponents", Label="Submit", isEnabled=true,
        Icon="", Actions=[], Style.background=""
Issue : none
Pass  : ⏳ pending first test

NLQ-002
Query : "Add a blue Refresh button with a refresh icon, tooltip 'Reload data', font size 16"
Config: Label="Refresh", FontSize=16, Icon="fa fa-refresh", tooltip="Reload data",
        background="#0061FF", color="#ffffff"
Expect: Basics.Icon="fa fa-refresh" (not "fa-refresh" or "refresh"),
        Style.background="#0061FF", Style.color="#ffffff"
Issue : ❌ v1.0-draft — agent generated Icon="fa-refresh" (missing "fa " namespace prefix)
Fix   : Added Icon prefix rules to Hazards (#3) and Icon prefix rules table.
Pass  : ⏳ pending re-test after fix

NLQ-003
Query : "Add a Run button that re-executes the 'tradeQuery' data source when clicked"
Config: Label="Run", Icon="fa fa-play", Actions=[{_Type:"query", Trigger:"Click", DataSource:{_dashboardsType:"data",value:"tradeQuery"}}]
Expect: Actions has exactly one query action with Trigger="Click" and DataSource value "tradeQuery"
Issue : none
Pass  : ⏳ pending first test

NLQ-004
Query : "Add a 'Go to Details' button that navigates to the Detail Screen"
Config: Label="Go to Details", Actions=[nav action to "Detail Screen"]
Expect: Actions[0]._Type="nav", SelectDashboardScreen.screen="Detail Screen",
        _dashboardsType="navigation", dashboard="<this>"
Issue : none
Pass  : ⏳ pending first test

NLQ-005
Query : "Add a 200px wide disabled Delete button with a red border and trash icon"
Config: Label="Delete", fixedWidth=true, width=200, isEnabled=false,
        border="#F23A66", Icon="fa fa-trash"
Expect: Basics.fixedWidth=true, Basics.width=200, Basics.isEnabled=false,
        Style.border="#F23A66", Basics.Icon="fa fa-trash"
Issue : ❌ v1.0-draft — agent generated isEnabled=true (ignored "disabled" keyword in prompt)
Fix   : Added isEnabled hazard (#5) and "disabled / greyed out" row in NL→JSON table.
Pass  : ⏳ pending re-test after fix

NLQ-006
Query : "Add a teal button labelled 'Export CSV', 18px font, left-aligned, bottom-aligned"
Config: Label="Export CSV", FontSize=18, horizontal="Left", vertical="Bottom",
        background="#009BAB"
Expect: Basics.horizontal="Left", Basics.vertical="Bottom", Style.background="#009BAB"
Issue : none
Pass  : ⏳ pending first test

NLQ-007
Query : "Add a Save and Go button that saves via 'saveQuery' then navigates to the Summary screen"
Config: Label="Save and Go", Actions=[query action, nav action] — nav must be last
Expect: Actions has 2 entries; _Type="query" appears before _Type="nav"
Issue : none
Pass  : ⏳ pending first test

NLQ-008
Query : "Add a purple button with a Material refresh icon and a teal text colour"
Config: background="#7647CC", color="#009BAB", Icon="mi mi-refresh"
Expect: Style.background="#7647CC", Style.color="#009BAB", Basics.Icon="mi mi-refresh"
Issue : none
Pass  : ⏳ pending first test

=================================================================

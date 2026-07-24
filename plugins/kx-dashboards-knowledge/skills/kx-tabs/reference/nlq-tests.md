# kx-tabs — NLQ Regression Tests

> Retest these queries on every MR that changes this skill. Back to [SKILL.md](../SKILL.md).

---

=================================================================
NLX TEST QUERIES
Retest all queries below on every MR that modifies this skill.

How to retest:
  1. Invoke /kx-tabs then paste the query.
  2. Embed the generated component JSON into a dashboard screen.
  3. Load the dashboard in KX Dashboards and verify the tab strip,
     default tab, tab contents, and any ViewState behave as expected.
=================================================================

NLX-001
Query : "Add a tabs component with tabs 'Overview' and 'Details'"
Config: Items=[Overview, Details], target_tab=0, components=[], widgets=[]
Expect: key="Tabs", definitionId="26", version="v2.14.0", two Items with unique GUIDs,
        dropdownPossibleValues=[{Id:0,Name:"Overview"},{Id:1,Name:"Details"}]
Issue : none
Pass  : ⏳ pending first test

NLX-002
Query : "Tabs with 'Trades' showing tradeQuery and 'Orders' showing orderQuery in a grid"
Config: 2 tabs, each a Datagrid child in BOTH components[] and widgets[]
Expect: components.length==2 && widgets.length==2; each child containerId matches its tab
        Items[].Id in all three places; components[n].id==widgets[n].component.id
Issue : ❌ common failure — child added to widgets[] only (empty components[]) → blank tab
Fix   : Hazards #1–#3 + checklist enforce both arrays and the three-place containerId rule.
Pass  : ⏳ pending first test

NLX-003
Query : "Three tabs (Summary, Charts, Raw) that open on the Charts tab"
Config: 3 Items, target_tab=1
Expect: Selection.target_tab===1 (integer, 0-based → second tab), 3 Items + 3 dropdownPossibleValues
Issue : ❌ common failure — agent emits target_tab="Charts" or 2 (1-based)
Fix   : Hazard #5 + NL→JSON row clarify 0-based integer.
Pass  : ⏳ pending first test

NLX-004
Query : "Tabs 'Daily' and 'Monthly' that set an 'activeTab' viewstate when switched"
Config: SetViewStateOnSelect.ViewState -> activeTab, Value="<tabName>"
Expect: Selection.SetViewStateOnSelect.ViewState={_dashboardsType:"viewstate",value:"activeTab"}
Issue : none
Pass  : ⏳ pending first test

NLX-005
Query : "Tabs 'Public', 'Debug' (hidden), and 'Internal' (don't print in PDF)"
Config: Items[1].HideTab=true, Items[2].HideTabPdf=true
Expect: Items[1].HideTab===true, Items[2].HideTabPdf===true, others false
Issue : none
Pass  : ⏳ pending first test

=================================================================
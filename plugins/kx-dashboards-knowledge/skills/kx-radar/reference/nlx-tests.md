# kx-radar — NLX Regression Tests

> Retest these NLX queries on every MR that modifies this skill or generate.js's makeRadarWidget. Back to [SKILL.md](../SKILL.md).

**Contents:** How to retest · NLX-001 … NLX-008

---

=================================================================
NLX TEST QUERIES
Retest all queries below on every MR that modifies this skill or
generate.js makeRadarWidget.

How to retest:
  1. Invoke /kx-radar then paste the query.
  2. Run: node generate.js --config <generated-config>.json --out test.json
  3. Load test.json in KX Dashboards and verify the component renders.
=================================================================

NLX-001
Query : "Create a radar chart showing Dataset1 by Month"
Config: componentType=radar, radarColumn=Month, layers=[{data:Dataset1}], theme=Dark
Expect: single-layer radar, DataSet.Radar="Month", Layers[0].Data="Dataset1", ChartType="radar"
Issue : none
Pass  : ✅ v1.0 — makeRadarWidget produces correct options block; dark fontColor applied

NLX-002
Query : "Create a radar chart showing Dataset1, Dataset2, and Dataset3 by Month using the KX colour palette"
Config: 3 layers, all useColor=true
Expect: 3 layers, all UseColor=true, colours from DEFAULT_PALETTE sequence
Issue : none
Pass  : ✅ v1.0

NLX-003
Query : "Show a polar area chart with Dataset1 and Dataset2 by Month, animate with easeOutQuart over 500ms"
Config: chartType=polarArea, animations.enabled=true, easing=easeOutQuart, duration=500
Expect: ChartType="polarArea", Animations.Enabled=true, AngleLineOpacity still in JSON
Issue : none
Pass  : ✅ v1.0 — makeRadarWidget always writes AngleLineOpacity regardless of chartType

NLX-004
Query : "Radar chart for US state health showing Obesity and Diabetes by State, legend at bottom, begin at zero, format to 1 decimal place with % suffix"
Config: radarColumn=State, 2 layers, legend.position=bottom, ticks.beginAtZero=true, ticks.format=Number, ticks.precision=1, ticks.suffix=%
Expect: DataSet.Radar="State", Legend.Position="bottom", ticks.beginAtZero=true, Format="Number", Precision=1, Suffix="%"
Issue : none
Pass  : ✅ v1.0

NLX-005
Query : "Radar chart showing Dataset1 by Month, CSV and screenshot export, clicking a segment selects the month"
Config: fileExport.showScreenshot=true, fileExport.showExportCsvButton=true, selectedAttr=Month, selected=<viewstate>
Expect: FileExport.ShowScreenshot=true, ShowExportCsvButton=true, Basics.SelectedAttr="Month"
Issue : none
Pass  : ✅ v1.0

NLX-006
Query : "Create a radar chart showing Dataset1 through Dataset5 by Month, star point style, radius 5"
Config: 5 layers (Dataset1–Dataset5), all pointStyle=star, pointRadius=5
Expect: 5 Layers, all PointStyle="star", PointRadius=5
Issue : none
Pass  : ✅ v1.0 — "through Dataset5" expansion applied manually per layer

NLX-007
Query : "Build an animated radar chart in dark theme showing Dataset1 by Month"
Config: theme=Dark, animations.enabled=true
Expect: ticks.fontColor="rgba(255,255,255,0.75)", ticks.backdropColor="rgba(0,0,0,0.75)"
        RadarColor="#ffffff" (unchanged), RadarColorAngle="#ffffff" (unchanged)
Issue : ❌ v1.0-draft — skill initially also changed RadarColor and LabelColor to "#000000" for dark theme
Fix   : makeRadarWidget derives fontColor/backdropColor from theme; RadarColor stays "#ffffff".
        Dark theme only changes ticks colours, not grid/angle/legend colours.
Pass  : ✅ v1.1 after fix — correct dark theme colours from makeRadarWidget

NLX-008
Query : "Generate a radar chart using the USAirports table"
Table : USAirports (Code,Longitude,Latitude,County,State,City,Name,ID2,ID,Depart)
Query generated: select Depart:sum Depart by State from USAirports
Query output columns: ["State","Depart"]
Expect: DataSet.Radar="State", Layers[0].Data="Depart"
        possibleColumns=possibleLabels=possibleRules=["State","Depart"]
        Basics.Data={ "_dashboardsType":"data", "value":"usAirportsData" }
        Basics.Focus="", Basics.Selected="", options.version="v2.12.0.1"
        Alignment/format present as fully-populated objects (not {})
Issue : ❌ v1.1 — chart loaded, data query returned rows, but chart area was blank.
        Root causes identified from reference dashboard review:
        (a) possibleRules was missing from generated JSON — added to makeRadarWidget + schema
        (b) Default ticks colors in schema were wrong (showed dark as default; actual default is light)
        (c) Basics.Focus/Selected shown as ViewState binding objects in schema — correct form is ""
        (d) flip select pattern (Property/Value) not documented — added to schema section
        (e) Layers[n].Data ViewState binding option not documented — added to schema
Fix   : All 5 items corrected in SKILL.md v1.2 and generate.js (possibleRules added).
        v1.3 — the schema's Basics block also shipped invalid JSON (a missing comma after
        "_note_Basics" broke the Full Component Schema); corrected so the block now parses.
        v1.4 — aligned options.version v2.3.0.1 → v2.12.0.1 and populated the schema's
        Alignment/format objects (were {}) to match the authoritative reference export.
Pass  : ✅ v1.4 — verified against the reference export "USAirports Radar — Departures by State".
        Generated the config (radarColumn=State, columns=[State,Depart], layers=[{data:Depart}],
        dataSource=usAirportsData, theme=Dark), ran `node generate.js`, and deep-diffed the emitted
        Radar component options against the reference: ALL option fields match (uuids excepted),
        incl. DataSet.Radar="State", possibleColumns/Labels/Rules=["State","Depart"], Focus/Selected="",
        version="v2.12.0.1", populated Alignment/format, and the advancedTooltip template.
        Note: validated by structural conformance to a known-good exported dashboard, not a live
        in-app render — do a final visual load in KX Dashboards if a pixel-level check is required.

=================================================================

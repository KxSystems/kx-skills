/**
 * KX Dashboard Generator  v2
 * Produces valid KX Dashboards JSON files ready for import or direct deployment.
 *
 * Supports:
 *   - ChartGL: Line, Bar, Bubble, Waterfall
 *   - Chart3D: dot, line, bar, surface, grid, dot-line, dot-color, dot-size, bar-color, bar-size
 *   - Datagrid: full column config, grouping, selection, export
 *   - Dropdown (BasicComponents)
 *   - Gauge: circular dial (chartSubType "Gauge") and bullet chart (chartSubType "Bullet")
 *   - Flat and grouped ViewStates  ("name" or "Group/name")
 *   - Multiple X/Y axes, stacking
 *   - Actions (map, query, nav)
 *   - Notifications block
 *
 * Usage:
 *   node generate.js --config my.config.json [--out my-dashboard.json] [--deploy]
 *
 *   --deploy  writes directly to ~/.kx/dashboards/data/dashboards/{id}.json
 *
 * Or require and call generateDashboard(config) directly.
 */

const { randomUUID } = require('crypto');
const fs   = require('fs');
const path = require('path');
const os   = require('os');

// ── Default 10-colour KX palette ─────────────────────────────────────────────
const DEFAULT_PALETTE = [
  { type: "#0061FF" }, { type: "#F23A66" }, { type: "#009BAB" },
  { type: "#7647CC" }, { type: "#FFC300" }, { type: "#9FA3A6" },
  { type: "#003A99" }, { type: "#A90B31" }, { type: "#005D67" },
  { type: "#452481" }
];

// ── Default Chart3D palette (red-to-green gradient, used by dot-color/bar-color)
const DEFAULT_3D_PALETTE = [
  { type: "#F8696B" }, { type: "#F98570" }, { type: "#FBA276" },
  { type: "#FCBF7B" }, { type: "#FEDC81" }, { type: "#EEE683" },
  { type: "#CCDD82" }, { type: "#A9D27F" }, { type: "#86C97E" },
  { type: "#63BE7B" }
];

// ── Shared blocks ─────────────────────────────────────────────────────────────
const ALIGNMENT = {
  paddingLeft: 0, paddingRight: 0, paddingTop: 0, paddingBottom: 0,
  innerPaddingLeft: 0, innerPaddingRight: 0, innerPaddingTop: 0, innerPaddingBottom: 0,
  titlePaddingLeft: 0, titlePaddingRight: 0, titlePaddingTop: 7, titlePaddingBottom: 7
};

const TILE_FORMAT = {
  titleFontSize: 16, titleHorizontal: "Center", titleShadow: false,
  tileBorderWidth: 0, tileBorderRounding: 0,
  tileBorderColor: "#000000", tileBackgroundColor: "#000000",
  tileTransparentBackground: true, tileShadow: false
};

// ── System ViewStates (always included in _settings) ─────────────────────────
const SYSTEM_VIEWSTATES = {
  dashboardUser:                    { _viewType: true, _type: "symbol",    _default: "" },
  dashboardTimezone:                { _viewType: true, _type: "symbol",    _default: "" },
  dashboardUrl:                     { _viewType: true, _type: "string",    _default: "" },
  dashboardTitle:                   { _viewType: true, _type: "symbol",    _default: "" },
  dashboardStartTimestamp:          { _viewType: true, _type: "timestamp", _default: "NOW", _rolling: true },
  dashboardAvailableMemoryThreshold:{ _viewType: true, _type: "int",       _default: 0 },
  dashboardQueriesTestResults:      { _viewType: true, _type: "symbol",    _default: "[]" }
};

// ── Default notifications block ───────────────────────────────────────────────
const DEFAULT_NOTIFICATIONS = {
  Notifications: {
    _Version: "4.2.0s2",
    Enabled: true,
    InBrowserNotifications: false,
    Position: "Bottom Right",
    MaxVisibleCount: 3,
    FadeOut: 5,
    Icon: "fa-bell-o",
    Sound: "beep",
    SoundVolume: 100,
    Grouping: false,
    GroupingInterval: 1,
    triggers: []
  }
};

// ════════════════════════════════════════════════════════════════════════════════
// VIEWSTATE BUILDER
// Supports flat names ("sym") and grouped paths ("Trade Filters/sym")
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Build the full viewState block from an array of ViewState descriptors.
 * Each descriptor: { name, type, default, rolling? }
 * name can be "flat" or "Group/flat" for grouped ViewStates.
 */
function buildViewState(viewStates = []) {
  const vs = {
    selected: { _viewType: true, _default: "0", _type: "symbol" },
    ".settings": {},
    _settings: SYSTEM_VIEWSTATES
  };

  for (const v of viewStates) {
    const node = {
      _viewType: true,
      _default: v.default !== undefined ? v.default : "",
      _type: v.type || "symbol"
    };
    if (v.rolling) node._rolling = true;

    if (v.name.includes("/")) {
      // Grouped ViewState: "Trade Filters/sym" → vs["Trade Filters"]["sym"]
      const slashIdx = v.name.indexOf("/");
      const group = v.name.slice(0, slashIdx);
      const leaf  = v.name.slice(slashIdx + 1);
      if (!vs[group]) vs[group] = {};
      vs[group][leaf] = node;
    } else {
      vs[v.name] = node;
    }
  }

  return vs;
}

// ════════════════════════════════════════════════════════════════════════════════
// DATA SOURCE BUILDER
// ════════════════════════════════════════════════════════════════════════════════

function makeDataSource(ds) {
  const { connection, queryString, columns, params, subscriptionType, dataType } = ds;
  return {
    _pagingType: "NONE",
    _autoExecute: true,
    _autoExec: true,                      // write both for compatibility
    _columns: columns || [],
    _dataType: dataType || "query",
    _dataSource: "kdb",
    _connection: connection,
    _connection_Viewstate: "",
    _mappings: {},
    _maxRows: ds.maxRows || 2000,
    _subscriptionType: subscriptionType || "static",
    _subscriptionInterval: 3,
    _layout: [
      { isExpanded: true,  weight: 2 },
      { isExpanded: false, weight: 1 },
      { isExpanded: false, weight: 1 },
      { isExpanded: true,  weight: 1 },
      { isExpanded: true,  weight: 2 }
    ],
    _queryString: queryString || "",
    _queryParams: (params || []).map((p, i) => {
      // Support both "viewState" (flat) and "viewStatePath" (grouped path)
      const vsRef = p.viewStatePath || p.viewState;
      return {
        name: p.name,
        index: i,
        type: p.type || "symbol",
        value: vsRef ? `<%${vsRef}%>` : (p.value || ""),
        IsKdbParam: true,
        isViewState: !!vsRef
      };
    }),
    _subscriptionKey: "",
    _hasUpdateQuery: false,
    _updateQueryParams: [],
    _updateQueryString: "",
    _updateType: "query",
    _pageSize: ds.maxRows || 2000,
    _serverPaging: false
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// CHARTGL BUILDERS
// ════════════════════════════════════════════════════════════════════════════════

function makeAxis(position = "Bottom", axisType = "Linear", isYAxis = false) {
  const axis = {
    Bounds: "",
    Type: axisType,
    Position: position,
    Width: 0,
    Ticks: 10,
    Color: "",
    FilterUnique: axisType === "Category",
    Sort: false,
    Stacked: false,
    Title: { Display: false, LabelString: "", FontSize: 16 },
    Range: {
      UseMinMax: false, Min: "", Max: "",
      SetMinMaxOnLoad: false, SelectionMin: "", SelectionMax: "",
      ResetToNull: true, Buffer: 0
    },
    Gridlines: { GridlinesOffset: false, GridlinesColor: "", GridlinesOpacity: 15 },
    Format: {
      Display: true, Rotation: 0, BeginAtZero: false,
      ShowMajorUnits: false,
      Break: 86400000, Distribution: "Linear",
      TriggerBreak: 86400000, IntervalLength: 0,
      Format: axisType === "Time" ? "DateTime" : "Number",
      DateFormat: "", Precision: 2, FontSize: 12,
      Prefix: "", Suffix: "", HideTrailingZeroes: false,
      MultiAxis: []
    }
  };

  if (isYAxis) {
    axis.StackedGap = false;
    delete axis.Format.MultiAxis;
  }

  if (axisType === "Time") {
    axis.TickSpacing = "Number of Ticks";
  }

  return axis;
}

function makeLayer(series, index, columns, xAxisNames, yAxisNames) {
  const { name, xCol, yCol, color, type, dataSource } = series;
  const allCols   = columns || [];
  const xAxNames  = xAxisNames || ["X-Axis 1"];
  const yAxNames  = yAxisNames || ["Y-Axis 1"];
  const layerColor = color || DEFAULT_PALETTE[index % DEFAULT_PALETTE.length].type;

  const base = {
    possibleActionsColumns: ["None", "<thisX>", "<thisY>", "<thisName>", ...allCols],
    possibleColorColumns:   ["None", ...allCols],
    possibleIconColumns:    ["",     ...allCols],
    possibleRadiusData:     ["Fixed Size", ...allCols],
    possibleLayers:         [],
    possibleRulesColumns:   [],
    possibleXColumns:       allCols,
    possibleYColumns:       ["*", ...allCols],
    possibleMultiColumns:   ["", "*", ...allCols],
    Data: { _dashboardsType: "data", value: dataSource },
    PaletteTheme: " ",
    Palette: DEFAULT_PALETTE,
    Actions: series.actions || [],
    HighlightRules: series.highlightRules || [],
    _Id: `L${index}`,
    _Type: type,
    possibleXAxes: xAxNames,
    possibleYAxes: yAxNames,
    Name: name,
    XAxisId: series.xAxisId || xAxNames[0],
    YAxisId: series.yAxisId || yAxNames[0],
    Color: layerColor,
    Opacity: series.opacity !== undefined ? series.opacity : 80,
    LegendGroup: "None",
    ColorData: "None",
    ShowCurrentTick: false,
    CacheStreamingData: false,
    Legend: series.legend !== false,
    Enabled: true,
    Labels: {
      Align: "center", Color: "#000000", Enabled: false,
      Font: { Bold: false, Size: 12 },
      Frequency: 1, Offset: "0", Rotation: 0, MaxLabels: 10,
      Template: "{{x}}, {{toFixed y 2}}"
    },
    XAxis: xCol,
    YAxis: yCol,
    XAxisMulti: ""
  };

  if (type === "Line") {
    base.Line = {
      LineThickness: series.lineThickness || 1,
      LineStyle: series.lineStyle || "None",   // "None"|"Dashed"|"Dotted"
      DashGap: 1, DashWidth: 1,
      Fill: series.fill || "No Fill",           // "No Fill"|"Solid"|"Gradient"|"Above"|"Below"
      FillColor: layerColor, FillOpacity: 80, FadeToTransparent: false,
      SpanGaps: false,
      Interpolation: {
        Interpolation: series.interpolation || "Linear",  // "Linear"|"Stepped"|"Monotone"
        SteppedLine: "After",
        SegmentLength: 20
      },
      PaletteTheme: "",
      FillPalette: DEFAULT_PALETTE
    };
    base.Bubbles = {
      Color: layerColor, Opacity: 80,
      RadiusData: "Fixed Size", RadiusScaling: 0,
      ScaleOnZoom: true, SetIconFromData: false,
      Icon: "", DataIcon: "", DataIconColor: ""
    };
  } else if (type === "Bar" || type === "Waterfall") {
    base.Bars = {
      BarWidth: series.barWidth !== undefined ? series.barWidth : 95,
      BarFixedWidth: 10,
      BarWidthType: series.barWidthType || "Percentage",  // "Percentage"|"Fixed Width"
      BarOrientation: series.orientation || "Vertical",   // "Vertical"|"Horizontal"
      BorderWidth: 0, BorderOpacity: 100,
      BorderColor: layerColor,
      BorderPalette: DEFAULT_PALETTE
    };
  } else if (type === "Bubble") {
    base.Bubbles = {
      RadiusData: series.radiusCol || "Fixed Size",
      RadiusScaling: series.radiusScaling !== undefined ? series.radiusScaling : 4,
      ScaleOnZoom: true, SetIconFromData: false,
      Icon: "", DataIcon: "", DataIconColor: ""
    };
  }

  return base;
}

function makeChartGLWidget(config) {
  const {
    series, chartLayout, columns,
    xAxisType = "Linear", yAxisType = "Linear",
    xAxes, yAxes, overrideRules = [], hierarchicalRules = []
  } = config;

  const resolvedXAxes = (xAxes || [{ position: "Bottom", type: xAxisType }])
    .map(a => makeAxis(a.position || "Bottom", a.type || xAxisType, false));
  const resolvedYAxes = (yAxes || [{ position: "Left",   type: yAxisType }])
    .map((a, i) => {
      const ax = makeAxis(a.position || "Left", a.type || yAxisType, true);
      if (a.stacked) ax.Stacked = true;
      return ax;
    });

  const xAxisNames = resolvedXAxes.map((_, i) => `X-Axis ${i + 1}`);
  const yAxisNames = resolvedYAxes.map((_, i) => `Y-Axis ${i + 1}`);

  const layers = series.map((s, i) => makeLayer(s, i, columns, xAxisNames, yAxisNames));

  const chartRowSpan = chartLayout?.rowSpan || (config.dropdown ? 15 : 20);

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartRowSpan,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "ChartGL",
      containerId: null, components: [], widgets: [],
      definitionId: "669",
      hasOnSettingsChange: true,
      options: {
        version: "v2.18.0",
        possibleLegendGroups: ["None"],
        possiblePositions: ["Top","Bottom","Left","Right"],
        Style: { advanced: "", cssClasses: "" },
        Basics: {
          Name: config.chartName || "",
          Hover: "", Selected: "", Focus: "",
          SelectFirstPoint: false, RangeSelection: false,
          Zoom: true, Duration: 400, Easing: "easeOutQuart",
          TrackLoadTime: false, LoadTime: "",
          UsePatterns: false, UseHierarchicalRules: true
        },
        Layers: layers,
        Xaxes: resolvedXAxes,
        Yaxes: resolvedYAxes,
        Overlay: {
          ShowCrosshairs: true, ShowCoordinates: true, SnapToPoint: true,
          ShowColorPicker: false,
          UseCustomTooltip: false,
          CustomTooltip: `<table><thead><tr><th>{{this.0.xAxis}}</th><th></th></tr></thead><tbody>{{#each this}}<tr><td width="{{width}}"><i class="{{icon}}" style="color:{{color}}; {{image}};"></i> {{name}}: </td><td>{{yAxis}}</td></tr>{{/each}}</tbody></table>`,
          ShowAllLayers: true, ShowAllPoints: false, GroupByLayer: false
        },
        Legend: { Position: "Top", UseCustomLegend: false, CustomLegend: "", LegendGroups: [] },
        Annotations: { ShowAnnotateControl: false, Annotations: "" },
        FileExport: {
          Actions: [], FileName: [],
          ShowExportCsvButton: false, ShowExportExcelButton: false,
          ShowExportPngButton: false, PngButton: "Export Png", UseChartFormat: false
        },
        OverrideRules: overrideRules,
        HierarchicalRules: hierarchicalRules,
        Alignment: ALIGNMENT,
        format: TILE_FORMAT,
        possiblePalettes: [" ",".palette_default",".palette_gradient",".palette_pastel",".palette_colorblind"]
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// DATAGRID BUILDERS
// ════════════════════════════════════════════════════════════════════════════════

function makeColumn(col) {
  return {
    UserDefined: false,
    Field:        col.field,
    DisplayName:  col.displayName || col.field,
    Tooltip:      col.tooltip     || "",
    Sortable:     col.sortable !== false,
    Format:       col.format      || "General",
    Precision:    col.precision   !== undefined ? col.precision : 2,
    HideTrailingZeroes: col.hideTrailingZeroes || false,
    Currency:     col.currency    || "none",
    DateFormat:   col.dateFormat  || "YYYY-MM-DD",
    TimeFormat:   col.timeFormat  || "HH:mm:ss",
    HighlightNegativeColor:     col.highlightNegativeColor  || "",
    HighlightChanges:           col.highlightChanges        || false,
    HighlightChangeDuration:    col.highlightChangeDuration || 200,
    ShowArrowsOnChange:         col.showArrowsOnChange      || false,
    HighlightMinValueColor:     col.highlightMinValueColor  || "",
    HighlightMaxValueColor:     col.highlightMaxValueColor  || "",
    RangeHighlightColor:        col.rangeHighlightColor     || "",
    IsRangeHighlightColorInverted: col.isRangeHighlightColorInverted || false,
    WidthWeight:      col.widthWeight      !== undefined ? col.widthWeight      : 1,
    MinWidthAbsolute: col.minWidthAbsolute !== undefined ? col.minWidthAbsolute : 1,
    PercentageColorOverride: col.percentageColorOverride || "",
    IsReadonly:    col.isReadonly    || false,
    IsSelectable:  col.isSelectable !== false,
    TextAlign:     col.textAlign    || "center",
    Template:      col.template     || "",
    SparklineOptions: col.sparklineOptions || {},
    Hidden:        col.hidden       || false,
    Footer:        col.footer       || "None",
    FooterWeights: col.footerWeights || "",
    Header:        col.header       || "none",
    Filter:        col.filter       || "",
    RawCopy:       col.rawCopy      || false,
    EditModeDropdownValues: col.editModeDropdownValues || ""
  };
}

function makeDatagridWidget(config) {
  const { chartLayout, basics, selection, style, fileExport } = config;
  const cols      = (config.columns || []).map(makeColumn);
  const colFields = cols.map(c => c.Field);

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 20,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "Datagrid",
      containerId: null, components: [], widgets: [],
      definitionId: "21",
      hasOnSettingsChange: true,
      options: {
        version: "v2.20.0",
        notificationEvent: null,
        datagridPossibleColumns:           colFields,
        datagridPossibleHeaderColumns:     colFields,
        datagridPossibleColumnsWithItself: ["<this>", ...colFields],
        datagridPossibleDropdownValues:    [""],
        selectedColumnPossibleValues:      [""],
        highlightTargetPossibleValues:     [],
        sortingPossibleValues:             ["", ...colFields],
        footerPossibleValues:              ["None","Average","Count","Sum","WeightedAverage"],
        Basics: {
          Name: "",
          Data: { _dashboardsType: "data", value: config.dataSource },
          Filtering:                      basics?.filtering          || "Quick Search",
          IsFilterVisible:                basics?.isFilterVisible    !== false,
          ShowPagingControl:              basics?.showPagingControl  !== false,
          ShowPageState:                  basics?.showPageState      || false,
          EnableGrouping:                 basics?.enableGrouping     !== false,
          GroupingAutoCollapse:           basics?.groupingAutoCollapse || false,
          EnableCustomLayoutConfiguration: basics?.enableCustomLayoutConfiguration || false,
          ShowSampleGridData:             false,
          KeepNonExistentColumns:         basics?.keepNonExistentColumns || false,
          EditMode:                       basics?.editMode           || "disabled",
          IsInsertable:                   basics?.isInsertable       || false,
          SortColumn:                     basics?.sortColumn         || "",
          SortOrder:                      basics?.sortOrder          || "ascending",
          KdbFilterString:                basics?.kdbFilterString    || "",
          FilterOnEnterHit:               basics?.filterOnEnterHit   || false,
          ScrollValueV:                   0,
          ExperimentalMode:               false,
          LazyDataLoading:                basics?.lazyDataLoading    || "disabled",
          ExpandOnPdf:                    false,
          FooterData:                     basics?.footerData         || "",
          FrozenColumnCount:              basics?.frozenColumnCount  || 0,
          AutosaveMode:                   basics?.autosaveMode       || "enabled",
          UseHierarchicalRules:           true
        },
        ValuesForDropdown:      [],
        ColumnsConfiguration:   cols,
        Selection: {
          Mode:                   selection?.mode                || "Area",
          RowSelectionColumn:     selection?.rowSelectionColumn  || "",
          SelectedValue:          selection?.selectedValue
            ? { _dashboardsType: "viewstate", value: selection.selectedValue }
            : "",
          SelectedField:          selection?.selectedField       || "",
          SelectedCellValue:      selection?.selectedCellValue   || "",
          FollowSelectedValue:    selection?.followSelectedValue  || false,
          DefaultFallbackOnDeselect: selection?.defaultFallbackOnDeselect !== false,
          CheckboxAlignment:      selection?.checkboxAlignment   || "none",
          SelectOnCheckOnly:      selection?.selectOnCheckOnly   || false,
          Actions:                selection?.actions             || []
        },
        FileExport: {
          ShowExportCsvButton:    fileExport?.showExportCsvButton    !== false,
          ShowExportExcelButton:  fileExport?.showExportExcelButton  !== false,
          ShowFullExportButton:   fileExport?.showFullExportButton   || false,
          FileName:               fileExport?.fileName               || [],
          Actions:                fileExport?.actions                || [],
          CsvExportDelimiter:     fileExport?.csvExportDelimiter     || "",
          RawFormat:              fileExport?.rawFormat              || false,
          PreserveKDBTypes:       fileExport?.preserveKDBTypes       || false,
          IncludeRowSummary:      fileExport?.includeRowSummary      || false
        },
        Tooltip: { Position: "none", Template: "", UseFormattedCellValue: false, TestingPage: false },
        GroupingConfiguration:  config.groupingConfiguration  || [],
        SummaryRow_Groupings:   config.summaryRowGroupings    || [],
        HighlightRules:         [],
        CustomFilters:          [],
        HeaderGroup:            [],
        CustomLayout: {
          IgnoreCustomLayoutViewstate: false,
          IncludeHiddenColumns: true,
          RetainColumnWidth: true
        },
        OverrideRules: [],
        Style: {
          Theme:                         style?.theme                      || "Dark",
          EvenRowBackgroundColorOverride: style?.evenRowColor              || "#282828",
          OddRowBackgroundColorOverride:  style?.oddRowColor               || "#303030",
          SelectedRowBackgroundColor:    style?.selectedRowColor           || "",
          RowHeight:                     style?.rowHeight                  || 30,
          HeaderRowHeight:               style?.headerRowHeight            || 30,
          HeaderTextTransformation:      style?.headerTextTransformation   || "none",
          HeaderFontWeight:              style?.headerFontWeight           || "",
          FontFamily:                    style?.fontFamily                 || "",
          FontSize:                      style?.fontSize                   || "",
          advanced:                      style?.advanced                   || ""
        },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// DROPDOWN BUILDER
// ════════════════════════════════════════════════════════════════════════════════

function makeDropdown(dd, layout) {
  const { dataSource, viewState, valueColumn, label } = dd;
  return {
    id: randomUUID(),
    layout: layout || { row: 15, column: 6, rowSpan: 2, colSpan: 9 },
    component: {
      id: randomUUID(),
      key: "BasicComponents",
      containerId: null, components: [], widgets: [],
      definitionId: "16",
      hasOnSettingsChange: true,
      options: {
        version: "v2.18.0",
        dropdownPossibleValues: [valueColumn],
        dropdownPossibleValuesWithEmpty: ["", valueColumn],
        Basics: {
          Name: "",
          Data: { _dashboardsType: "data", value: dataSource },
          SelectedValue: { _dashboardsType: "viewstate", value: viewState },
          ComponentName: "Dropdown",
          DataSourceMapping: { Value: valueColumn, Text: valueColumn },
          GroupMapping: { Group: false, GroupBy: "" },
          Items: [],
          Width: 100,
          Theme: "Dark",
          Label: label || "select:",
          LabelWidth: 75,
          MultiSelect: false, SelectAllByDefault: false,
          ShowSearch: false, AdvancedSearch: false,
          AcceptEmptyValues: false, ForceSelectedValue: false,
          FieldSummaryThreshold: 5, TooltipSummaryThreshold: 10,
          SelectAllValue: "", horizontal: "Center", vertical: "Middle",
          tooltip: "", SortListBySelected: false,
          FilterData: "", Custom: { Icon: "", IconColor: "" }
        },
        Actions: [],
        Style: { advanced: "", cssClasses: "" },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// DATATABLE BUILDERS
// ════════════════════════════════════════════════════════════════════════════════

function makeDatatableValueColumn(col) {
  return {
    Field:        col.field,
    DisplayName:  col.displayName || col.field,
    Tooltip:      col.tooltip     || "",
    WidthWeight:  col.widthWeight !== undefined ? col.widthWeight : 1,
    MinWidth:     col.minWidth    !== undefined ? col.minWidth    : 1,
    FixedWidth:   col.fixedWidth  !== undefined ? col.fixedWidth  : 150,
    TextAlign:    col.textAlign   || "center",
    Sortable:     col.sortable    !== false,
    Format:       col.format      || "General",
    Precision:    col.precision   !== undefined ? col.precision   : 2,
    HideTrailingZeroes: col.hideTrailingZeroes || false,
    Currency:     col.currency    || "none",
    DateFormat:   col.dateFormat  || "YYYY-MM-DD",
    TimeFormat:   col.timeFormat  || "HH:mm:ss",
    HighlightNegative:      col.highlightNegative      || false,
    HighlightNegativeColor: col.highlightNegativeColor || "",
    HighlightChanges:       col.highlightChanges       || false,
    HighlightChangeDuration: col.highlightChangeDuration || 200,
    ShowArrowsOnChange:     col.showArrowsOnChange     || false,
    HighlightMinValue:      col.highlightMinValue      || false,
    HighlightMinValueColor: col.highlightMinValueColor || "",
    HighlightMaxValue:      col.highlightMaxValue      || false,
    HighlightMaxValueColor: col.highlightMaxValueColor || "",
    PercentageColorOverride: col.percentageColorOverride || "",
    RangeHighlight:    col.rangeHighlight    || false,
    InvertRangeColor:  col.invertRangeColor  || false,
    RangeHighlightColor: col.rangeHighlightColor || "",
    isBreakdown: false,
    Hidden:    col.hidden   || false,
    Footer:    col.footer   || "None",
    FooterWeights: col.footerWeights || "",
    Template:  col.template || ""
  };
}

function makeDatatableBreakdownColumn(col) {
  return {
    Field:        col.field,
    DisplayName:  col.displayName || col.field,
    Tooltip:      col.tooltip     || "",
    TextAlign:    col.textAlign   || "center",
    Sortable:     col.sortable    !== false,
    Format:       col.format      || "General",
    Precision:    col.precision   !== undefined ? col.precision : 2,
    HideTrailingZeroes: col.hideTrailingZeroes || false,
    Currency:     col.currency    || "none",
    DateFormat:   col.dateFormat  || "YYYY-MM-DD",
    TimeFormat:   col.timeFormat  || "HH:mm:ss",
    WidthWeight:  col.widthWeight !== undefined ? col.widthWeight : 1,
    MinWidth:     col.minWidth    !== undefined ? col.minWidth    : 1,
    FixedWidth:   col.fixedWidth  !== undefined ? col.fixedWidth  : 150,
    PercentageColorOverride: col.percentageColorOverride || "",
    isBreakdown: false,
    NoDisplay: col.noDisplay || false,
    Template:  col.template  || ""
  };
}

function makeDatatableWidget(config) {
  const { chartLayout, basics, selection, style, fileExport } = config;
  const valueCols     = (config.valueColumns     || []).map(makeDatatableValueColumn);
  const breakdownCols = (config.breakdownColumns || []).map(makeDatatableBreakdownColumn);
  const valueFields     = valueCols.map(c => c.Field);
  const breakdownFields = breakdownCols.map(c => c.Field);

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 20,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "Datatable",
      containerId: null, components: [], widgets: [],
      definitionId: "3",
      hasOnSettingsChange: true,
      options: {
        version: "v2.16.0",
        Basics: {
          Name: "",
          Focus: "",
          Drilldown:               basics?.drilldown               !== false,
          Data: { _dashboardsType: "data", value: config.dataSource },
          ShowTools:               basics?.showTools               !== false,
          Animate:                 basics?.animate                 !== false,
          MultipleDrilldown:       basics?.multipleDrilldown       || false,
          DrilldownInputArea:      basics?.drilldownInputArea      || "Breakdown Cell",
          ExpandAll:               basics?.expandAll               || false,
          ShowExpandedSummary:     basics?.showExpandedSummary     || false,
          AggregateFunctionTooltip: basics?.aggregateFunctionTooltip !== false,
          SortColumn:              basics?.sortColumn              || "",
          SortOrder:               basics?.sortOrder               || "",
          ScrollValue:             "",
          ShowCache:               false,
          UseCache:                basics?.useCache                !== false,
          EnableCustomLayoutConfiguration: basics?.enableCustomLayoutConfiguration || false,
          ColumnWidthMode:         basics?.columnWidthMode         || "Relative"
        },
        Selection: {
          RowSelectionMode:    selection?.rowSelectionMode    || "none",
          RowSelectionColumn:  selection?.rowSelectionColumn  || "",
          SelectedValue:       selection?.selectedValue
            ? { _dashboardsType: "viewstate", value: selection.selectedValue }
            : ""
        },
        Actions:       config.actions       || [],
        HighlightRules: config.highlightRules || [],
        FileExport: {
          ShowExportCsvButton:   fileExport?.showExportCsvButton   !== false,
          ShowExportExcelButton: fileExport?.showExportExcelButton !== false,
          ShowFullExportButton:  fileExport?.showFullExportButton  || false,
          FullExportOverride:    fileExport?.fullExportOverride    || "",
          RawFormat:             fileExport?.rawFormat             || false,
          FileName:              fileExport?.fileName              || [],
          Actions:               fileExport?.actions               || []
        },
        BreakdownColumnsConfiguration:  breakdownCols,
        _BreakdownColumnsConfiguration: breakdownCols,
        datatablePossibleBreakdownColumns: breakdownFields,
        ColumnsConfiguration:  valueCols,
        _ColumnsConfiguration: valueCols,
        datatablePossibleColumns: valueFields,
        Style: {
          Theme:                          style?.theme                    || "Dark",
          EvenRowBackgroundColorOverride: style?.evenRowColor             || "#282828",
          OddRowBackgroundColorOverride:  style?.oddRowColor              || "#303030",
          SelectedRowBackgroundColor:     style?.selectedRowColor         || "",
          ExpandedSummaryStyle:           style?.expandedSummaryStyle     || false,
          ShowFilterIconInFooter:         style?.showFilterIconInFooter   !== false,
          RowHeight:                      style?.rowHeight                || 30,
          HeaderRowHeight:                style?.headerRowHeight          || 30,
          HeaderTextTransformation:       style?.headerTextTransformation || "none",
          HeaderFontWeight:               style?.headerFontWeight         || "",
          FontFamily:                     style?.fontFamily               || "",
          FontSize:                       style?.fontSize                 || "",
          advanced:                       style?.advanced                 || ""
        },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// DATAFILTER BUILDER
// ════════════════════════════════════════════════════════════════════════════════

function makeDataFilterWidget(config) {
  const { chartLayout, style } = config;

  const items = (config.filterItems || []).map(item => ({
    propertyName: item.propertyName || item.column,
    data: item.dataSource
      ? { _dashboardsType: "data", value: item.dataSource }
      : "",
    DropdownPossibleValues: [],
    DataSourceMapping: { Value: item.valueColumn || "", Text: item.textColumn || "" },
    items: (item.items || []).map(i => ({ Value: i.value || i.Value, Text: i.text || i.Text })),
    FieldSummaryThreshold: item.fieldSummaryThreshold !== undefined ? item.fieldSummaryThreshold : 5
  }));

  const bindings = (config.bindings || []).map(b => ({
    Key: b.key,
    ViewState: { _dashboardsType: "viewstate", value: b.viewState }
  }));

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 20,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "DataFilter",
      containerId: null, components: [], widgets: [],
      definitionId: "48",
      hasOnSettingsChange: true,
      options: {
        version: "v2.19.0",
        Basics: {
          Name: config.name || "",
          data: { _dashboardsType: "data", value: config.dataSource || "" },
          queryModel: "{\"operator\":\"AND\",\"children\":[]}",
          kdbString: config.kdbString
            ? { _dashboardsType: "viewstate", value: config.kdbString }
            : "",
          UseViewStates: config.useViewStates || false,
          clearIfNotInSource: config.clearIfNotInSource || false
        },
        Bindings: bindings,
        Items:    items,
        Actions:  config.actions || [],
        Style: {
          advanced:         style?.advanced         || "",
          cssClasses:       style?.cssClasses        || "",
          HistogramBuckets: style?.histogramBuckets  || 50,
          HistogramColor:   style?.histogramColor    || "#0071cd"
        },
        Alignment: ALIGNMENT,
        format: { SortListBySelected: config.sortListBySelected || false }
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// DATAFORM BUILDER
// ════════════════════════════════════════════════════════════════════════════════

function makeDataformFieldType(f) {
  const t = f.fieldType || "Default";
  if (t === "Dropdown") {
    return {
      _Type: "Dropdown",
      Data: f.dataSource ? { _dashboardsType: "data", value: f.dataSource } : "",
      AcceptEmptyValues: f.acceptEmptyValues || false,
      ForceSelect: f.forceSelect || false,
      MultiSelect: f.multiSelect || false,
      ShowSearch:  f.showSearch  || false,
      AdvancedSearch: f.advancedSearch || false,
      FieldSummaryThreshold: f.fieldSummaryThreshold !== undefined ? f.fieldSummaryThreshold : 5,
      TooltipSummaryThreshold: f.tooltipSummaryThreshold !== undefined ? f.tooltipSummaryThreshold : 5,
      SelectAllValue: f.selectAllValue || "",
      SelectAllDefault: f.selectAllDefault || false,
      SortListBySelected: f.sortListBySelected || false,
      UseCustom: f.useCustom || false,
      DataSourceMapping: {
        Value: f.valueColumn || "",
        Text:  f.textColumn  || "",
        DropdownPossibleValues: []
      },
      Custom: { Icon: "", IconColor: "" },
      Items: (f.items || []).map(i => ({ Value: i.value || i.Value, Text: i.text || i.Text }))
    };
  }
  if (t === "Number") {
    return {
      _Type: "Number",
      Increment: f.increment !== undefined ? f.increment : 1,
      UseDecimalPlaces: f.useDecimalPlaces || false,
      DecimalPlaces: f.decimalPlaces !== undefined ? f.decimalPlaces : 2
    };
  }
  if (t === "Datepicker") {
    return {
      _Type: "Datepicker",
      Data: f.dataSource || "",
      ReadOnly: f.readOnly || false,
      DefaultDate: f.defaultDate || ""
    };
  }
  if (t === "Slider") {
    return {
      _Type: "Slider",
      Data: f.dataSource || "",
      Range: f.range || false,
      Tooltip: f.tooltip || false,
      ShowTicks: f.showTicks || false,
      Formatter: f.formatter || ""
    };
  }
  if (t === "Password") {
    return { _Type: "Password" };
  }
  // Default
  return { _Type: "Default", Data: "", DataSourceMapping: {}, Items: [], DropdownPossibleValues: [] };
}

function makeDataformWidget(config) {
  const { chartLayout, basics, style } = config;

  const viewStatesFields = (config.formFields || []).map(f => ({
    PathEnc:       f.pathEnc,
    DisplayName:   f.displayName || f.pathEnc,
    HideParameter: f.hideParameter || false,
    Tooltip:       f.tooltip       || "",
    AllowNulls:    f.allowNulls    !== false,
    FieldType:     makeDataformFieldType(f)
  }));

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 10,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "Dataform",
      containerId: null, components: [], widgets: [],
      definitionId: "27",
      hasOnSettingsChange: true,
      options: {
        version: "c2.4.0",
        isDataform: true,
        Basics: {
          Name: "",
          Data: config.submitDataSource
            ? { _dashboardsType: "data", value: config.submitDataSource }
            : "",
          SubmitButtonText:     basics?.submitButtonText     || "Submit",
          ValidationAnalytic:   basics?.validationAnalytic   || "",
          ExpandDictParameters: basics?.expandDictParameters !== false,
          ForceExecute:         basics?.forceExecute         || false,
          ShowReset:            basics?.showReset            || false,
          ShowSubmit:           basics?.showSubmit           !== false,
          FloatSubmit:          basics?.floatSubmit          !== false,
          FloatReset:           basics?.floatReset           || false,
          ViewStates: viewStatesFields,
          Actions:    config.actions || []
        },
        Style: {
          minWidth:       style?.minWidth       || "",
          advanced:       style?.advanced       || "",
          display:        style?.display        || "Row",
          inline:         style?.inline         || "Top",
          labelWidth:     style?.labelWidth     || "",
          labelPadding:   style?.labelPadding   || "",
          labelAlign:     style?.labelAlign     || "Left",
          padding:        style?.padding        || "",
          verticalSpacing: style?.verticalSpacing || "",
          submitOffset:   style?.submitOffset   || "",
          resetOffset:    style?.resetOffset    || "",
          formMargin:     style?.formMargin     || ""
        },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// BREADCRUMBS BUILDER
// ════════════════════════════════════════════════════════════════════════════════

function makeBreadcrumbsWidget(config) {
  const { chartLayout, basic, style } = config;

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 3,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "Breadcrumbs",
      containerId: null, components: [], widgets: [],
      definitionId: "19",
      hasOnSettingsChange: true,
      options: {
        version: "4.7.7",
        Basic: {
          Name: "",
          Path: config.pathViewState
            ? { _dashboardsType: "viewstate", value: config.pathViewState }
            : "",
          Breakdown: config.breakdownViewState
            ? { _dashboardsType: "viewstate", value: config.breakdownViewState }
            : "",
          UsePathForAlternativeText: basic?.usePathForAlternativeText !== false,
          AllowReordering: basic?.allowReordering !== false,
          ShowEditButton:  basic?.showEditButton  || false,
          Data: config.dataSource
            ? { _dashboardsType: "data", value: config.dataSource }
            : "",
          DataSourceMapping: config.dataSource
            ? { Value: config.valueColumn || "", Text: config.textColumn || "" }
            : { Value: "", Text: "" },
          BreadcrumbList: config.breadcrumbListViewState
            ? { _dashboardsType: "viewstate", value: config.breadcrumbListViewState }
            : "",
          Theme: basic?.theme || config.theme || "Dark"
        },
        Style: { advanced: style?.advanced || "" },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// RADAR / POLAR AREA BUILDER
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Build a Radar or Polar Area chart widget.
 *
 * config keys:
 *   dataSource     {string}   data source name (required)
 *   radarColumn    {string}   axis/label column — DataSet.Radar (required)
 *   layers         {Array}    [{ data, display, color, borderColor, useColor, colorOpacity, pointStyle, pointRadius }]
 *   chartType      {string}   "radar" (default) | "polarArea"
 *   name           {string}   widget title
 *   theme          {string}   "Dark" (default) | "Light"
 *   columns        {string[]} all column names for possibleColumns/possibleLabels
 *   focus          {string}   ViewState path for Focus binding
 *   selected       {string}   ViewState path for Selected binding
 *   selectedAttr   {string}   column used for the selected value on click
 *   legend         { show, position, labelColor }
 *   animations     { enabled, duration, easing }
 *   ticks          { beginAtZero, format, precision, prefix, suffix, fontSize, pointLabels, ... }
 *   fileExport     { showScreenshot, showExportCsvButton, showExportExcelButton, screenshotButton }
 *   padding        { top, bottom, left, right }
 *   gridLineOpacity   {number}  1–100 (default 35)
 *   angleLineOpacity  {number}  1–100 (default 35)
 *   chartLayout    { row, column, rowSpan, colSpan }
 */
function makeRadarWidget(config) {
  const {
    chartLayout,
    name          = "",
    dataSource,
    radarColumn   = "",
    chartType     = "radar",
    theme         = "Dark",
    columns       = []
  } = config;

  const isDark        = theme !== "Light";
  const fontColor     = isDark ? "rgba(255, 255, 255, 0.75)" : "rgba(0, 0, 0, 0.75)";
  const backdropColor = isDark ? "rgba(0, 0, 0, 0.75)"       : "rgba(255, 255, 255, 0.75)";

  const legend = config.legend     || {};
  const anim   = config.animations || {};
  const ticks  = config.ticks      || {};
  const fe     = config.fileExport || {};

  const builtLayers = (config.layers || []).length
    ? config.layers.map((l, i) => ({
        Data:         l.data         || "",
        Color:        l.color        || DEFAULT_PALETTE[i % DEFAULT_PALETTE.length].type,
        BorderColor:  l.borderColor  || "#ffffff",
        UseColor:     l.useColor     !== undefined ? l.useColor     : false,
        ColorOpacity: l.colorOpacity !== undefined ? l.colorOpacity : 35,
        Display:      l.display      || "",
        PointStyle:   l.pointStyle   || "",
        PointRadius:  l.pointRadius  !== undefined ? l.pointRadius  : 2
      }))
    : [{ Data: "", Color: "#0061FF", BorderColor: "#ffffff",
         UseColor: false, ColorOpacity: 35, Display: "", PointStyle: "", PointRadius: 2 }];

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 20,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "Radar",
      containerId: null, components: [], widgets: [],
      definitionId: "1008",
      hasOnSettingsChange: true,
      options: {
        version: "v2.3.0.1",
        Basics: {
          Name:      name,
          ChartType: chartType,
          Data: dataSource
            ? { _dashboardsType: "data",      value: dataSource }
            : "",
          Focus: config.focus
            ? { _dashboardsType: "viewstate", value: config.focus }
            : "",
          Selected: config.selected
            ? { _dashboardsType: "viewstate", value: config.selected }
            : "",
          SelectedAttr:          config.selectedAttr || "",
          SelectedObjectRouting: []
        },
        DataSet: {
          Radar:            radarColumn,
          RadarColor:       "#ffffff",
          RadarColorAngle:  "#ffffff",
          GridLineOpacity:  config.gridLineOpacity  !== undefined ? config.gridLineOpacity  : 35,
          AngleLineOpacity: config.angleLineOpacity !== undefined ? config.angleLineOpacity : 35,
          Layers: builtLayers
        },
        Legend: {
          Show:       legend.show      !== false,
          LabelColor: legend.labelColor || "#ffffff",
          Position:   legend.position   || "top"
        },
        Padding: {
          Top:    config.padding?.top    !== undefined ? config.padding.top    : 2,
          Bottom: config.padding?.bottom !== undefined ? config.padding.bottom : 2,
          Left:   config.padding?.left   !== undefined ? config.padding.left   : 2,
          Right:  config.padding?.right  !== undefined ? config.padding.right  : 2
        },
        Animations: {
          Enabled:  anim.enabled  || false,
          Duration: anim.duration !== undefined ? anim.duration : 20,
          Easing:   anim.easing   || "linear"
        },
        ticks: {
          display:            ticks.display           !== false,
          fontColor:          ticks.fontColor         || fontColor,
          fontSize:           ticks.fontSize          !== undefined ? ticks.fontSize          : 12,
          showLabelBackdrop:  ticks.showLabelBackdrop || false,
          backdropColor:      ticks.backdropColor     || backdropColor,
          backdropPaddingX:   ticks.backdropPaddingX  !== undefined ? ticks.backdropPaddingX  : 2,
          backdropPaddingY:   ticks.backdropPaddingY  !== undefined ? ticks.backdropPaddingY  : 2,
          beginAtZero:        ticks.beginAtZero       || false,
          maxTicksLimit:      ticks.maxTicksLimit     !== undefined ? ticks.maxTicksLimit     : 11,
          Format:             ticks.format            || "General",
          Precision:          ticks.precision         !== undefined ? ticks.precision         : 0,
          HideTrailingZeroes: ticks.hideTrailingZeroes || false,
          DateFormat:         ticks.dateFormat        || "YYYY-MM-DD",
          Prefix:             ticks.prefix            || "",
          Suffix:             ticks.suffix            || "",
          pointLabels:        ticks.pointLabels       !== undefined ? ticks.pointLabels       : 12
        },
        Tooltip: {
          handlebarhelper: [],
          isStacked:       config.tooltipStacked || false,
          advancedTooltip: "<div>{{#each dataSet}}<table><tbody>{{#eq @index 0}} <tr><td colspan=\"3\">{{legend}}</td> </tr> {{/eq}} <tr> <td><svg style=\"width:15px;height:15px\"> <circle fill=\"{{color}}\" width=\"2\" stroke=\"white\" r=\"6\" cy=\"8\" cx=\"8\"></circle> </svg></td> <td> {{layerKey}}</td>  <td>{{layerValue}}</td>  </tr></tbody>  </table>  {{/each}}</div>"
        },
        ColorPallette: {
          palettes:       config.palette        || [],
          chartBarColors: config.chartBarColors || DEFAULT_PALETTE,
          scheme:         "default"
        },
        FileExport: {
          ShowScreenshot:        fe.showScreenshot        || false,
          ShowExportCsvButton:   fe.showExportCsvButton   || false,
          ShowExportExcelButton: fe.showExportExcelButton || false,
          ScreenshotButton:      fe.screenshotButton      || "Export Png",
          FileName:              fe.fileName              || [],
          Actions:               fe.actions               || []
        },
        possibleColumns:  columns.length ? columns : [""],
        possibleLabels:   columns.length ? columns : [""],
        possibleRules:    columns.length ? columns : [""],
        possiblePalettes: [" ",".palette_default",".palette_gradient",".palette_pastel",".palette_colorblind"],
        Style:     { advanced: "", cssClasses: "" },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// BUTTON BUILDER
// ════════════════════════════════════════════════════════════════════════════════

function makeButtonWidget(config) {
  console.log("makeButtonWidget config:", config);
  const { chartLayout } = config;
  const basics = config.basics || {};
  const style  = config.style  || {};

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 3,
      colSpan: chartLayout?.colSpan || 9
    },
    component: {
      id: randomUUID(),
      key: "BasicComponents",
      containerId: null, components: [], widgets: [],
      definitionId: "25",
      hasOnSettingsChange: true,
      options: {
        version: "v2.9.0",
        Basics: {
          ComponentName: "Button",
          Name:       "",
          Label:      basics.label      !== undefined ? basics.label      : "click",
          FontSize:   basics.fontSize   !== undefined ? basics.fontSize   : 11,
          Icon:       basics.icon       !== undefined ? basics.icon       : "",
          tooltip:    basics.tooltip    !== undefined ? basics.tooltip    : "",
          horizontal: basics.horizontal || "Center",
          vertical:   basics.vertical   || "Middle",
          fixedWidth: basics.fixedWidth || false,
          width:      basics.width      !== undefined ? basics.width      : 100,
          isEnabled:  basics.isEnabled  !== false
        },
        Style: {
          background: style.background || "",
          color:      style.color      || "",
          border:     style.border     || "",
          advanced:   style.advanced   || "",
        },
        Actions:   config.actions || [],
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// CHART3D BUILDERS
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Build one Chart3D axis object.
 * allowTime=false enforces that Z axis never uses "Time" (not supported by the component).
 */
function makeChart3DAxis(axis = {}, allowTime = true) {
  const requested = axis.type || "Linear";
  const axisType  = (!allowTime && requested === "Time") ? "Linear" : requested;
  return {
    AxisType:   axisType,
    Label:      axis.label     || "",
    Format:     axis.format    || "General",
    Precision:  axis.precision !== undefined ? axis.precision : 2,
    DateFormat: axis.dateFormat || "YYYY-MM-DD",
    Prefix:     axis.prefix    || "",
    Suffix:     axis.suffix    || "",
    UseMin:     axis.useMin    || false,
    AxisMin:    axis.axisMin   !== undefined ? axis.axisMin   : 0,
    UseMax:     axis.useMax    || false,
    AxisMax:    axis.axisMax   !== undefined ? axis.axisMax   : 10
  };
}

function makeChart3DWidget(config) {
  const { chartLayout } = config;
  const theme       = config.theme || "Dark";
  const strokeColor = theme === "Light" ? "#000000" : "#ffffff";

  // Build dataSource-name → columns map so each layer gets its own possibleLayerAxis
  const dsColMap = {};
  (config.dataSources || []).forEach(ds => {
    dsColMap[ds.name] = ds.columns || [];
  });

  // Union of all columns across all data sources for top-level possible* arrays
  const allCols = [...new Set(Object.values(dsColMap).flat())];

  const layers = (config.layers || []).map((layer, i) => {
    const cols = dsColMap[layer.dataSource] || allCols;
    return {
      possibleLayerAxis: cols,
      _Id:    `L${i}`,
      _Type:  layer.type || "dot",
      Data:   { _dashboardsType: "data", value: layer.dataSource },
      Name:   layer.name || `Layer ${i + 1}`,
      XAxis:  layer.xCol      || "",
      YAxis:  layer.yCol      || "",
      ZAxis:  layer.zCol      || "",
      Volume: layer.volumeCol || ""
    };
  });

  const colorScheme = config.colorScheme || DEFAULT_3D_PALETTE;
  const pos         = config.position || {};

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 20,
      colSpan: chartLayout?.colSpan || 36
    },
    component: {
      id: randomUUID(),
      key: "Chart3D",
      containerId: null, components: [], widgets: [],
      definitionId: "20",
      hasOnSettingsChange: true,
      options: {
        version: "4.7.7",
        possibleAxis:     allCols,
        possibleColumns:  allCols,
        possibleLabels:   [],
        possibleRules:    [],
        possiblePalettes: [" ", ".palette_default", ".palette_gradient", ".palette_pastel", ".palette_colorblind"],
        Basics: {
          Name:         config.chartName || "",
          Focus:        "",
          Theme:        theme,
          Selected:     "",
          SelectedAttr: ""
        },
        Layers: layers,
        X:      makeChart3DAxis(config.xAxis || {}, true),
        Y:      makeChart3DAxis(config.yAxis || {}, true),
        Z:      makeChart3DAxis(config.zAxis || {}, false),  // Time not supported on Z
        Volume: {
          UseMin:  config.volume?.useMin  || false,
          AxisMin: config.volume?.axisMin !== undefined ? config.volume.axisMin : 0,
          UseMax:  config.volume?.useMax  || false,
          AxisMax: config.volume?.axisMax !== undefined ? config.volume.axisMax : 10
        },
        Position: {
          Horizontal: pos.horizontal !== undefined ? pos.horizontal : 0.0873,
          Vertical:   pos.vertical   !== undefined ? pos.vertical   : 0.001241,
          Distance:   pos.distance   !== undefined ? pos.distance   : 2.5
        },
        Style: {
          palettes:  "",
          fill:      "transparent",
          stroke:    strokeColor,
          advanced:  "",
          advancedTooltip: config.advancedTooltip ||
            "<table>{{#each points}}<tr><td>{{xLabel}}</td><td>{{x}}</td></tr><tr><td>{{yLabel}}</td><td>{{y}}</td></tr><tr><td>{{zLabel}}</td><td>{{z}}</td></tr>{{/each}}</table>",
          VerticalRatio:   config.verticalRatio !== undefined ? config.verticalRatio : 70,
          KeepAspectRatio: config.keepAspectRatio || false,
          ColorPalette: { ColorScheme: colorScheme }
        },
        Alignment: {
          paddingLeft: "0", paddingRight: "0",
          paddingTop:  "0", paddingBottom: "0"
        },
        format: {
          widgetTitle:        config.chartName || "",
          titleFontSize:      "16",
          titleHorizontal:    "Center",
          titlePaddingLeft:   0,
          titlePaddingRight:  0,
          titlePaddingTop:    0,
          titlePaddingBottom: 0
        }
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// GAUGE BUILDER  (key: "Gauge", definitionId: "11178")
// Supports chartSubType: "Gauge" (default) | "Bullet"
// ════════════════════════════════════════════════════════════════════════════════

const GAUGE_TOOLTIP_DEFAULT =
  `<table>\n    {{#if this.0.title}}<thead><tr><th>{{this.0.title}}</thead><th></tr>{{/if}}\n    <tbody>{{#each this}}\n        <tr>\n            <td>{{dataCol}}: </td>\n            <td>{{dataVal}}</td>\n        </tr>\n        {{/each}}\n    </tbody>\n</table>`;

function makeGaugeWidget(config) {
  const { chartLayout } = config;
  const subType = config.chartSubType || "Gauge";

  const highlightRules = (config.highlightRules || []).map(r => ({
    RuleColor:     r.ruleColor     || r.RuleColor     || "#F8F8F8",
    RuleOperation: r.ruleOperation || r.RuleOperation || "<",
    RuleValue:     String(r.ruleValue !== undefined ? r.ruleValue : (r.RuleValue !== undefined ? r.RuleValue : ""))
  }));

  let chartType;
  if (subType === "Bullet") {
    // Min/Max are not meaningful for Bullet axis scaling, but setHighlightRules
    // guards on `if (min || max)` — without Max the guard fails and highlight
    // rules are silently skipped. Set Max to the largest rule value so the guard
    // passes while leaving the Bullet axis scale data-driven.
    const bulletMax = highlightRules.length
      ? Math.max(...highlightRules.map(r => Number(r.RuleValue) || 0))
      : undefined;
    chartType = {
      _Type:         "Bullet",
      ProgressData:  config.progressData  || "",
      Target:        config.targetData    || "",
      AxisData:      config.axisData      || "",
      ProgressColor: config.progressColor || "#0061FF",
      TargetColor:   config.targetColor   || "#F23A66",
      Transposed:    config.transposed    !== false,
      ...(bulletMax !== undefined && { Min: 0, Max: bulletMax })
    };
  } else {
    chartType = {
      _Type:        "Gauge",
      DataColumn:   config.dataColumn    || "",
      Min:          config.min           !== undefined ? config.min : 0,
      Max:          config.max           !== undefined ? config.max : 100,
      Color:        config.color         || "#0061FF",
      LabelFontSize: config.labelFontSize !== undefined ? config.labelFontSize : 30,
      BarWidth:     config.barWidth      !== undefined ? config.barWidth : 10,
      PointerWidth: config.pointerWidth  !== undefined ? config.pointerWidth : 6,
      ShowLabel:    config.showLabel     !== false,
      ShowProgress: config.showProgress  !== false,
      AxisLabels:   config.showAxisLabels || false,
      AxisTicks:    config.showAxisTicks  || false
    };
  }

  const basics = {
    Name:    config.chartName || "",
    Data:    { _dashboardsType: "data", value: config.dataSource },
    ChartType: chartType,
    HighlightRules: highlightRules
  };

  // ShowTitle only applies to Gauge sub-type
  if (subType === "Gauge") {
    basics.ShowTitle = config.showTitle || false;
    basics.Title     = config.title     || "";
  }

  return {
    id: randomUUID(),
    layout: {
      row:     chartLayout?.row    || 0,
      column:  chartLayout?.column || 0,
      rowSpan: chartLayout?.rowSpan || 10,
      colSpan: chartLayout?.colSpan || 12
    },
    component: {
      id: randomUUID(),
      key: "Gauge",
      containerId: null, components: [], widgets: [],
      definitionId: "11178",
      hasOnSettingsChange: true,
      options: {
        version: "v2.2.8.1",
        possibleColumns: [],
        Basics: basics,
        Format: {
          Format:            config.format             || "Number",
          Precision:         config.precision          !== undefined ? config.precision : 2,
          HideTrailingZeroes: config.hideTrailingZeroes || false,
          Prefix:            config.prefix             || "",
          Suffix:            config.suffix             || ""
        },
        Tooltip: {
          ShowTooltip:      config.showTooltip      !== false,
          UseCustomTooltip: config.useCustomTooltip || false,
          CustomTooltip:    config.customTooltip    || GAUGE_TOOLTIP_DEFAULT
        },
        Style:     { advanced: "", cssClasses: "" },
        Alignment: ALIGNMENT,
        format:    TILE_FORMAT
      }
    }
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// MAIN GENERATOR
// ════════════════════════════════════════════════════════════════════════════════

/**
 * Generate a complete KX Dashboard JSON object.
 *
 * config.componentType : "chartgl" (default) | "chart3d" | "datagrid" | "datatable" |
 *                        "datafilter" | "dataform" | "breadcrumbs" | "gauge"
 * config.viewStates    : array of { name, type, default, rolling? }
 *                        name can be "flat" or "Group/flat"
 */
function generateDashboard(config) {
  const dashId   = randomUUID();
  const screenId = randomUUID();
  const now      = new Date().toISOString();

  // Primary widget
  const componentType = config.componentType || "chartgl";
  let primaryWidget;
  switch (componentType) {
    case "chart3d":      primaryWidget = makeChart3DWidget(config);     break;
    case "datagrid":     primaryWidget = makeDatagridWidget(config);    break;
    case "datatable":    primaryWidget = makeDatatableWidget(config);   break;
    case "datafilter":   primaryWidget = makeDataFilterWidget(config);  break;
    case "dataform":     primaryWidget = makeDataformWidget(config);    break;
    case "breadcrumbs":  primaryWidget = makeBreadcrumbsWidget(config); break;
    case "radar":        primaryWidget = makeRadarWidget(config);        break;
    case "gauge":        primaryWidget = makeGaugeWidget(config);       break;
    case "button":       primaryWidget = makeButtonWidget(config);      break;
    default:             primaryWidget = makeChartGLWidget(config);      break;
  }

  // Widgets array
  const widgets = [primaryWidget];
  if (config.dropdown) {
    widgets.push(makeDropdown(config.dropdown, config.dropdownLayout));
  }

  // Data sources
  const data = {};
  (config.dataSources || []).forEach(ds => { data[ds.name] = makeDataSource(ds); });

  // ViewState
  const viewState = buildViewState(config.viewStates || []);

  return {
    id:             dashId,
    name:           config.name,
    creationDate:   now,
    lastUpdateDate: now,
    hash:           dashId,          // ⚠️ must equal id — always
    thumb:          null,
    screenDetails: [{ label: "Screen 1", value: screenId }],
    screens: [{
      id:            screenId,
      name:          "Screen 1",
      thumb:         null,
      widgets,
      rowCount:      24,
      rowHeight:     25,
      colCount:      36,
      floatable:     false,
      relativeHeight: true,
      isDefault:     true
    }],
    popups:           [],
    tags:             [],
    dashboardTheme:   config.theme || "Dark",
    themeSwitchable:  true,
    saveTimestamp:    null,
    relativeHeight:   true,
    rowCount:         24,
    rowHeight:        25,
    colCount:         36,
    floatable:        false,
    viewState,
    data,
    permissionEntity: null,
    worksheetPadding: 10,
    widgetsSpacing:   10,
    borderColor:      "000000",
    borderBackground: "000000",
    transparentBackground: true,
    borderWidth:      0,
    borderRounding:   0,
    borderSpacing:    0,
    borderShadow:     false,
    saveViewerState:  "enabled",
    hostnameAccess:   "",
    hidePdfGlobalVS:  false,
    enableShareDashboard: true,
    notifications:    config.notifications || DEFAULT_NOTIFICATIONS,
    showLoadingIndicators: config.showLoadingIndicators !== false,
    unsavedViewerPrompt: false,
    mainMenuButton:   "Show",
    advancedCss:      config.advancedCss || "",
    cssClasses:       config.cssClasses  || "",
    version:          "v2.3.0",
    wasChanged:       false,
    shortcuts:        [],
    action:           "replace",
    viewStateBinding: false
  };
}

// ════════════════════════════════════════════════════════════════════════════════
// CLI
// ════════════════════════════════════════════════════════════════════════════════

if (require.main === module) {
  const args     = process.argv.slice(2);
  const configIdx = args.indexOf('--config');
  const outIdx    = args.indexOf('--out');
  const deploy    = args.includes('--deploy');

  if (configIdx === -1) {
    console.error('Usage: node generate.js --config <config.json> [--out <output.json>] [--deploy]');
    process.exit(1);
  }

  const configPath = args[configIdx + 1];
  const config     = JSON.parse(fs.readFileSync(configPath, 'utf8'));
  const dashboard  = generateDashboard(config);
  const json       = JSON.stringify(dashboard, null, 2);

  // Write to explicit --out path, or default filename beside config
  const defaultOut = path.join(
    path.dirname(configPath),
    `${config.name.replace(/\s+/g, '-')}.json`
  );
  const outPath = outIdx !== -1 ? args[outIdx + 1] : defaultOut;
  fs.writeFileSync(outPath, json);
  console.log(`✓ Dashboard written to ${outPath}`);

  // Optionally deploy to KX Dashboards home directory
  if (deploy) {
    const deployDir = path.join(os.homedir(), '.kx', 'dashboards', 'data', 'dashboards');
    if (!fs.existsSync(deployDir)) {
      console.warn(`⚠ Deploy path does not exist: ${deployDir}`);
    } else {
      const deployPath = path.join(deployDir, `${dashboard.id}.json`);
      fs.writeFileSync(deployPath, json);
      console.log(`✓ Deployed to ${deployPath}`);
    }
  }

  console.log(`  Dashboard ID: ${dashboard.id}`);
}

module.exports = {
  generateDashboard,
  makeChartGLWidget, makeChart3DWidget,
  makeDatagridWidget, makeDatatableWidget,
  makeDataFilterWidget, makeDataformWidget, makeBreadcrumbsWidget,
  makeRadarWidget,
  makeAxis, makeLayer, makeColumn,
  makeChart3DAxis,
  makeDatatableValueColumn, makeDatatableBreakdownColumn,
  makeDataformFieldType,
  makeDataSource, makeDropdown,
  makeButtonWidget,
  buildViewState
};
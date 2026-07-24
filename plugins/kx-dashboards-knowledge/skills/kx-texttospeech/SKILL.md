---
name: kx-texttospeech
description: "Generate KX Dashboards TextToSpeech component: text display with browser speech synthesis (definitionId=36, ComponentName=TextToSpeech, key=BasicComponents). Use for: text to speech, read aloud, voice output, speech synthesis, audio narration, spoken data. Shares HtmlText/Template/Data pattern with the Text component. SpeechOptions controls Voice, Rate, CacheData, and ShowPlayPause. Also read kx-dashboard-core for envelope, data sources, ViewState, and the agent checklist."
requires:
  - kx-dashboard-core
---

# KX TextToSpeech Component

> Also read **kx-dashboard-core** for: envelope, screen/widget wrapper, data sources, ViewState, binding patterns, actions, notifications, and the pre-flight checklist.

---

## ⚠️ Hazards — Read First

1. **Speech synthesis uses the browser's Web Speech API** — voices are system-dependent. `SpeechOptions.Voice` should be set to a voice name that exists in the browser; if blank, the browser default is used.
2. **`definitionId` is `"36"`** — not `"17"` (Text). Both share the `HtmlText`/`Template`/`Data` display pattern but TextToSpeech additionally speaks the content.
3. **`CacheData: false` (default) re-speaks on every data update** — set `CacheData: true` to accumulate data rows and only speak new arrivals. This is useful for streaming data where you only want new rows read aloud.
4. **`Template` overrides `HtmlText` when non-empty** — same behaviour as the Text component.
5. **`ShowPlayPause: false` by default** — set to `true` to render play/pause/back/forward buttons. Without them, speech starts automatically on data update.
6. **`AllowUnsafeContent: false` by default** — keep `false` for static content.

---

# TEXTTOSPEECH

`key: "BasicComponents"` · `definitionId: "36"` · `ComponentName: "TextToSpeech"` · `version: "v2.9.0"`

A text display tile that also speaks its content using the browser's Web Speech API. Shares the `HtmlText` / `Template` / `Data` display model with the Text component.

## Basics

```json
{
  "ComponentName": "TextToSpeech",
  "Name": "",
  "Data": "",
  "HtmlText": "insert text here",
  "Template": "",
  "Theme": "Dark",
  "FontSize": "13",
  "horizontal": "Center",
  "vertical": "Middle",
  "tooltip": "",
  "AllowUnsafeContent": false,
  "version": "v2.9.0",
  "SpeechOptions": {
    "CacheData": false,
    "Voice": "",
    "Rate": 1,
    "ShowPlayPause": false
  }
}
```

| Field | Values / Notes |
|---|---|
| `HtmlText` | Static text or HTML markup spoken and displayed when `Template` is empty. |
| `Data` | Optional data source. When set, the component subscribes to rows and speaks new data. |
| `Template` | Handlebars template — references data columns via `{{col}}` and ViewStates via `{{vsName}}`. Overrides `HtmlText` when non-empty. |
| `FontSize` | String, default `"13"`. |
| `SpeechOptions.CacheData` | `false` (default) — speak the full content on every update. `true` — accumulate rows and only speak newly arrived rows. |
| `SpeechOptions.Voice` | Browser voice name (e.g. `"Google US English"`). Leave blank for browser default. |
| `SpeechOptions.Rate` | Speech rate multiplier. Range `0.1`–`10`. Default `1`. |
| `SpeechOptions.ShowPlayPause` | `true` — render play / pause / back / forward buttons. `false` — auto-speak on data change. |
| `AllowUnsafeContent` | `true` allows `<script>` and unsafe HTML. Keep `false` for static text. |

## Full Component JSON

```json
{
  "id": "<uuid>",
  "key": "BasicComponents",
  "containerId": null,
  "components": [],
  "widgets": [],
  "definitionId": "36",
  "hasOnSettingsChange": true,
  "options": {
    "version": "v2.9.0",
    "Basics": {
      "ComponentName": "TextToSpeech",
      "Name": "",
      "Data": "",
      "HtmlText": "insert text here",
      "Template": "",
      "Theme": "Dark",
      "FontSize": "13",
      "horizontal": "Center",
      "vertical": "Middle",
      "tooltip": "",
      "AllowUnsafeContent": false,
      "version": "v2.9.0",
      "SpeechOptions": {
        "CacheData": false,
        "Voice": "",
        "Rate": 1,
        "ShowPlayPause": false
      }
    },
    "Style": { "advanced": "" },
    "Alignment": {
      "paddingLeft": 0, "paddingRight": 0, "paddingTop": 0, "paddingBottom": 0,
      "innerPaddingLeft": 0, "innerPaddingRight": 0, "innerPaddingTop": 0, "innerPaddingBottom": 0,
      "titlePaddingLeft": 0, "titlePaddingRight": 0, "titlePaddingTop": 7, "titlePaddingBottom": 7
    },
    "format": {
      "titleFontSize": 16, "titleHorizontal": "Center", "titleShadow": false,
      "tileBorderWidth": 0, "tileBorderRounding": 0,
      "tileBorderColor": "#000000", "tileBackgroundColor": "#000000",
      "tileTransparentBackground": true, "tileShadow": false
    }
  }
}
```

---

## Common Patterns

### Static narration — speak a fixed message

```json
"Basics": {
  "ComponentName": "TextToSpeech",
  "HtmlText": "Welcome to the trading dashboard.",
  "SpeechOptions": { "CacheData": false, "Voice": "", "Rate": 1, "ShowPlayPause": true }
}
```

### Speak new data rows as they arrive (streaming)

```json
"Basics": {
  "ComponentName": "TextToSpeech",
  "Data": { "_dashboardsType": "data", "value": "alertStream" },
  "Template": "Alert: {{message}} for {{sym}}",
  "SpeechOptions": { "CacheData": true, "Voice": "", "Rate": 1, "ShowPlayPause": false }
}
```

`CacheData: true` ensures only new rows added to `alertStream` are spoken; previously heard rows are not repeated.

### Manual play controls with ViewState-driven text

```json
"Basics": {
  "ComponentName": "TextToSpeech",
  "Template": "Selected symbol is {{selectedSym}}",
  "SpeechOptions": {
    "CacheData": false,
    "Voice": "Google US English",
    "Rate": 0.9,
    "ShowPlayPause": true
  }
}
```

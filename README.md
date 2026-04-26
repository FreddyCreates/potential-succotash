<p align="center">
  <img src="extensions/jarvis/icons/icon128.png" width="80" alt="Animus AI" />
</p>

<h1 align="center">Animus AI</h1>

<p align="center">
  <strong>The autonomous intelligence layer</strong>
</p>

<p align="center">
  <em>Animus (Latin): mind, intellect, will, soul</em>
</p>

<p align="center">
  <a href="#download">⬇ Download</a> · <a href="#features">✨ Features</a> · <a href="#technology">⚙️ Technology</a> · <a href="#install">🚀 Install</a> · <a href="#architecture">🏗 Architecture</a>
</p>

---

## What Is Animus AI

Animus AI is a full-stack intelligence platform that runs entirely inside your browser — no cloud, no server, no subscription. It installs as a Chrome or Edge side panel extension and becomes a permanent cognitive co-pilot: reading pages, taking notes, deploying autonomous research agents, managing your tabs, generating PDFs and spreadsheets, and reasoning through any problem you bring to it.

The architecture goes far beyond a chat wrapper. Animus AI combines a phi-encoded NeuroCore oscillator (873ms heartbeat), a PatternSynthesisEngine with 40 primitives across 8 knowledge domains, nine autonomous agent types that can crawl and scrape the web in parallel, a real DOM article extraction engine (Readability), a full annotation and highlights system, and a 10-specialist protocol registry — all wired together into a single sovereign intelligence that lives and breathes at the edge.

---

<a id="download"></a>
## Download

### Animus AI Extension (Chrome / Edge)

| Package | Link |
|---|---|
| **Animus AI Extension ZIP** | [⬇ Download jarvis.zip](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/jarvis.zip) |
| **All Extensions ZIP** | [⬇ Download all-extensions.zip](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/all-extensions.zip) |
| **Windows Installer (.bat)** | [⬇ install-jarvis-edge.bat](https://github.com/FreddyCreates/potential-succotash/raw/main/install-jarvis-edge.bat) |

### Load Unpacked in Chrome or Edge

1. Download and unzip `jarvis.zip`
2. Open Chrome/Edge → `chrome://extensions` (or `edge://extensions`)
3. Enable **Developer mode** (top right toggle)
4. Click **Load unpacked** → select the unzipped folder
5. Click the puzzle piece 🧩 in the toolbar → pin **Animus AI**
6. Press `Ctrl+Shift+Y` or click the icon to open the side panel

### Windows One-Click Installer

Download `install-jarvis-edge.bat`, right-click → **Run**. It downloads Animus AI, extracts it, and opens Edge with the extension loaded automatically — no developer mode required.

---

<a id="features"></a>
## Features

### 12 Panels
| Panel | Description |
|---|---|
| 💬 **Chat** | Full conversational AI with 40-category intent engine and context memory |
| ⚡ **Nexus** | Command surface — 12 one-tap action tiles, live agent feed, page awareness |
| 📥 **Inbox** | Proactive briefs: clipboard intel, tab changes, agent completions |
| 📌 **Highlights** | Annotation engine — save, tag, group, and export page highlights |
| 🪞 **Mirror** | Staged content hub — agent reports, clipboard, fetch results |
| 🤖 **Agents** | Live autonomous agent dashboard with progress tracking |
| ⚗️ **AGI Tools** | Summarize URLs, extract tables, diff sources, forge knowledge reports |
| 📓 **Journal** | Notes with full Dexie.js persistence |
| 📁 **Files** | Document manager — PDFs, Excel, and created documents |
| 🔐 **Vault** | Secure local key-value store |
| 💡 **Prompts** | Saved prompt library for rapid dispatch |
| 🖥️ **Screen** | Tab capture, screenshot, and page analysis |

### Skill Engines
- 🧠 **NLP Intent Classification** — Transformers.js pipeline, zero-shot intent detection
- 📄 **Readability Engine** — DOM article extraction (Firefox Reader Mode algorithm)
- 📌 **Highlights Engine** — Annotation storage, grouping, export (chrome.storage.local)
- 📊 **PDF Generator** — jsPDF formatted reports
- 📈 **Excel Generator** — ExcelJS formatted workbooks
- 📧 **Email Drafter** — mailto: protocol with structured prefill

### Autonomous Agents (9 types)
- `researcher` — Wikipedia + domain-specific sources, parallel fetch
- `crawler` — Spider from seed URL, follows links, parallel batch extraction
- `scraper` — Structured data: tables, lists, prices, dates
- `scout` — Quick deep scan + link map
- `digest` — Multi-topic parallel synthesis
- `monitor` — Site content diff watcher
- `watcher` — Alarm-based recurring site monitoring
- `analyst` — Multi-URL parallel analysis
- `sweep` — Multi-site batch extraction

### Cognitive Architecture
- **16 compound action primitives** — detected from natural language, fired in parallel
- **PatternSynthesisEngine (PSE)** — 40 primitives, 8 domains: systems, epistemics, cognition, strategy, markets, technology, philosophy, creativity
- **NeuroCore** — MiniHeart + MiniBrain + MetaCardiacModel + MetaThoughtModel oscillator heartbeat (873ms)
- **Memory Temple** — 5-category persistent conversation archive: research, theory, decisions, frameworks, insights
- **Mission Engine** — Structured mission dispatch with 6 Domain AIs

---

<a id="technology"></a>
## Technology

### PatternSynthesisEngine (PSE)
A centralized cognitive knowledge corpus with 40 pattern primitives across 8 domains. Every user message is silently synthesized through PSE — if confidence exceeds 28%, enrichment is appended to the response. No commands needed; it's just how Animus thinks.

### NeuroCore (873ms heartbeat, phi-encoded memory)
NeuroCore is a four-component oscillator:
- **MiniHeart** — tracks latency, pulse count, health score, degradation
- **MiniBrain** — Hebbian learning pathways with phi-decayed weights
- **MetaCardiacModel** — autonomic balance: vagal tone, sympathetic drive, HRV, mood
- **MetaThoughtModel** — softmax attention map, temperature-adjusted focus, chain-of-thought

The 873ms heartbeat interval is chosen because `873ms × φ ≈ 1413ms` — a recursive phi interval. It ticks the NeuroCore, updates mood and focus, and keeps the service worker alive.

### Readability Engine (DOM article extraction)
A pure TypeScript implementation of the Firefox Reader Mode algorithm:
- Parses HTML with DOMParser
- Scores paragraph density, class/id heuristics (positive: article/content/main/post; negative: nav/aside/footer/ads)
- Extracts highest-scored block, cleans inline styles
- Returns: title, byline, content, textContent, wordCount, readingTimeMin, excerpt, siteName

### Highlight / Annotation Engine
- Stores `HighlightEntry` objects in `chrome.storage.local` under `animus_highlights`
- Supports save, retrieve (all or filtered by URL), delete, and JSON export
- HighlightsPanel groups saved highlights by site, shows color tags, timestamps, context, and source URLs

### CrawlFetcher (parallel fetch + extraction)
A background fetch engine that bypasses tab overhead for extraction-only agents:
- Parallel fetch with configurable timeout
- HTML stripping (removes script/style/nav/footer)
- Link extraction (same-origin, deduped)
- Table extraction (multi-table TSV)
- Structured data extraction (headings, lists, prices, dates)
- Content diffing (added/removed lines)

### NLP Intent Classification (Transformers.js)
40-category intent engine using keyword + pattern matching with confidence scoring. Compound multi-action dispatch fires multiple primitives in a single natural-language utterance.

---

<a id="install"></a>
## Install

### Step-by-Step

1. **Download** the [Animus AI ZIP](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/jarvis.zip)
2. **Unzip** the downloaded file to a folder (e.g., `AnimusAI/`)
3. **Open** Chrome → `chrome://extensions` OR Edge → `edge://extensions`
4. **Enable Developer Mode** using the toggle in the top-right corner
5. **Click** "Load unpacked" → navigate to and select the unzipped `AnimusAI/` folder
6. **Pin** the extension: click the 🧩 puzzle piece icon → click the 📌 pin next to Animus AI
7. **Open** the side panel: press `Ctrl+Shift+Y` or click the Animus AI icon
8. **Start** — type anything or say "brief me" for a situational report

### Windows One-Click (Edge)
```
Right-click install-jarvis-edge.bat → Run as Administrator
```
Automatically downloads, extracts, and loads Animus AI into Edge.

---

<a id="architecture"></a>
## Architecture

```
extensions/jarvis/src/
├── background/
│   ├── index.ts              ← AnimusEngine, NeuroCore, PSE, AgentDispatcher, message router
│   ├── pattern-synthesis-engine.ts  ← PSE: 40 primitives, 8 domains
│   ├── mission-engine.ts     ← Mission dispatch, 6 Domain AIs
│   ├── domain-ais.ts         ← Domain AI definitions
│   ├── db.ts                 ← Dexie.js IndexedDB layer
│   ├── sovereign-license.ts  ← License registry
│   └── skills/
│       ├── readability.ts    ← DOM article extractor (Readability Engine)
│       ├── highlights.ts     ← Annotation/highlight engine
│       ├── nlp.ts            ← Transformers.js NLP pipeline
│       ├── pdf.ts            ← jsPDF report generator
│       ├── excel.ts          ← ExcelJS workbook generator
│       └── email.ts          ← mailto: draft composer
├── sidepanel/
│   ├── App.tsx               ← Root: 12-tab navigation, header, status bar
│   └── panels/
│       ├── ChatPanel.tsx     ← 40-category conversational AI
│       ├── NexusPanel.tsx    ← Command surface dashboard
│       ├── InboxPanel.tsx    ← Proactive brief feed
│       ├── HighlightsPanel.tsx  ← Annotation/highlight viewer
│       ├── MirrorPanel.tsx   ← Staged content hub
│       ├── AgentsPanel.tsx   ← Sovereign agent dashboard
│       ├── AGIToolsPanel.tsx ← URL analysis tools
│       └── ...               ← Notes, Docs, Vault, Prompts, Screen, Tabs
└── store/index.ts            ← Zustand global state
```

### Key Data Flows

- **Chat**: user → `executeCommand` → `parseCommand` → `buildAction` → skill/executor → `_remember('animus', ...)` → response
- **Agents**: `deployAgent` → `AgentDispatcher.deploy` → `SovereignAgent.run` → `CrawlFetcher` or tab → `pushToInbox` + `_mirrorPush`
- **Highlights**: page → `saveHighlight` → `chrome.storage.local['animus_highlights']` → `HighlightsPanel`
- **Readability**: active tab HTML → `extractArticle` → structured `ArticleResult`
- **Heartbeat**: 873ms `setInterval` → `NeuroCore.pulse` → mood/focus/awareness update

---

## Extension Library

👉 See [download.html](download.html) for the full library of 27 browser extensions.

---

*Built with React · TypeScript · Vite · Zustand · Dexie.js · Transformers.js · jsPDF · ExcelJS*

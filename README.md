# 🧬 Organism AI — Sovereign Intelligence Platform

> 20 AI Chrome extensions + 5 Windows extensions + Terminal AI — all installable in **1 click**.

### 📥 [**→ Open the Download Page ←**](download.html)

> Download individual extensions or all 25 at once. Zips are built natively in your browser — no server needed.

---

## ⚡ 1-Click Install — Load All AI Extensions Into Chrome

No unzipping. No manual steps. No GitHub Actions. Just **1 click**.

### Windows — Double-Click

1. [**Download the repo**](../../archive/refs/heads/main.zip) and unzip it
2. Double-click **`install-organism.bat`**
3. ✅ Chrome launches with all 20 AI extensions loaded

### macOS / Linux — One Command

```bash
git clone https://github.com/FreddyCreates/potential-succotash.git
cd potential-succotash
bash install-organism.sh
```

✅ Chrome launches with all 20 AI extensions loaded.

### Any Platform — Node.js Terminal AI

```bash
git clone https://github.com/FreddyCreates/potential-succotash.git
cd potential-succotash
node organism-cli/organism.js install
```

✅ Auto-detects Chrome, validates all extensions, loads them unpacked, launches Chrome.

---

## 🖥️ Terminal AI — Interactive Intelligence

The Organism CLI is a **built-in terminal AI** that manages everything. No external tools needed.

```bash
# Start the interactive AI terminal
node organism-cli/organism.js

# Or run commands directly:
node organism-cli/organism.js install    # 1-click: load all extensions into Chrome
node organism-cli/organism.js build      # package extensions into .zip files
node organism-cli/organism.js validate   # check all manifests and scripts
node organism-cli/organism.js status     # show extension health & system info
```

The terminal AI has a **built-in routing engine** (Codex / DeepSeek / Phi) — ask it anything:

```
🧬 organism › install          → loads all extensions into Chrome
🧬 organism › how many extensions?  → "20 browser + 5 Windows = 25 total"
🧬 organism › validate         → checks all 25 manifests
🧬 organism › list             → shows every extension
🧬 organism › help             → shows all commands
```

---

## 🧩 AI Extensions (25 Total)

Each extension is an **AI for user experiences** — Manifest V3 with a background.js AI engine and content.js interactive DOM panel.

### Browser Extensions (20)

| # | Extension | AI Engines | What It Does |
|---|---|---|---|
| 1 | **Sovereign Mind** | GPT + Claude + Gemini | Multi-model reasoning fusion |
| 2 | **Cipher Shield** | Guards + GPT + Claude | Encrypted intelligence & security |
| 3 | **Polyglot Oracle** | Qwen + Gemini + Llama | Multilingual translation AI |
| 4 | **Vision Weaver** | DALL-E + SD + Midjourney + SAM | Visual intelligence & image AI |
| 5 | **Code Sovereign** | Codex + CodeLlama + DeepSeek | Autonomous code intelligence |
| 6 | **Memory Palace** | Embeddings + Command R + Rerankers | Spatial memory AI |
| 7 | **Sentinel Watch** | Guards + GPT + Claude | Security monitoring AI |
| 8 | **Research Nexus** | Perplexity + Claude + Embeddings | Search-augmented research |
| 9 | **Voice Forge** | Whisper + ElevenLabs + Suno | Audio intelligence studio |
| 10 | **Data Alchemist** | GPT + Claude + Embeddings + Rerankers | Document absorption AI |
| 11 | **Video Architect** | Sora + Runway + Pika + Kling | Video generation AI |
| 12 | **Logic Prover** | Minerva-Llemma + GPT + AlphaCode | Mathematical proof AI |
| 13 | **Social Cortex** | Grok + Inflection + GPT | Social intelligence AI |
| 14 | **Edge Runner** | Phi + Gemma + DBRX | Edge inference AI |
| 15 | **Contract Forge** | GPT + Claude + Guards | Smart contract AI |
| 16 | **Organism Dashboard** | Heartbeat + OrganismState + EdgeSensor | Runtime monitoring |
| 17 | **Knowledge Cartographer** | Embeddings + Command R + Florence | Knowledge graph AI |
| 18 | **Protocol Bridge** | All Foundation Models | Cross-protocol intelligence |
| 19 | **Creative Muse** | SD + DALL-E + MusicGen + Suno | Generative art & music AI |
| 20 | **Sovereign Nexus** | All 40 Foundation Models + Kuramoto | Unified intelligence hub |

### Windows Extensions (5)

| # | Extension | What It Does |
|---|---|---|
| 1 | **Windows Copilot Hub** | Windows desktop AI copilot |
| 2 | **Windows File Oracle** | File system intelligence |
| 3 | **Windows Notification Cortex** | Smart notification AI |
| 4 | **Windows Shell Intelligence** | Shell command AI |
| 5 | **Windows Terminal Forge** | Terminal & PowerShell AI |

---

## 📁 Project Structure

```
├── download.html                     # 📥 Self-hosted download page (builds zips in-browser)
├── install-organism.bat              # ⚡ Windows 1-click installer (double-click)
├── install-organism.sh               # ⚡ macOS/Linux 1-click installer
├── organism-cli/
│   └── organism.js                   # 🖥️ Terminal AI (install/build/validate/status)
├── organism/
│   └── web/
│       └── download-worker.js        # 🔧 Web Worker — builds zip blobs natively
├── build-extensions.sh               # 📦 Package extensions to .zip files
├── extensions/
│   ├── sovereign-mind/               # 20 browser AI extensions
│   ├── cipher-shield/                #   (each has manifest.json + background.js
│   ├── code-sovereign/               #    + content.js + icons/)
│   ├── ... (17 more)
│   └── windows/                      # 5 Windows AI extensions
│       ├── windows-copilot-hub/
│       ├── windows-terminal-forge/
│       └── ... (3 more)
├── sdk/
│   ├── sovereign-memory-sdk/         # Spatial memory, phi-coordinates, lineage
│   ├── enterprise-integration-sdk/   # Onboarding, connectors, campaigns
│   ├── intelligence-routing-sdk/     # Model routing, wires, workforce
│   ├── organism-runtime-sdk/         # Heartbeat, state, kernels, edge sensing
│   └── document-absorption-engine/   # Intake, extraction, knowledge graphs
├── Frontend_Frontier_100_Register.csv
├── AI_Extensions_Register.csv
├── AI_Model_Families_Register.csv
├── Architectural_Laws_Register.csv
└── SDK_Model_Manifest.json
```

---

## 🏗️ Architecture

```
Fracture → Primitive → Sovereign SDK → Organism → Doctrine
```

Every external frontend technology is a **fracture**. Each fracture is reduced to a **primitive function** (relation / visibility / flow / state / synchronization / projection / transformation / verification), rebuilt as a **sovereign SDK module**, wired into the **organism runtime**, and governed by **architectural laws**.

> The frontend is not a thin shell over the backend; it is a compressed intelligence field with at least 115 distinguishable model species.

### Sovereign SDKs

| SDK | Ring | Description |
|---|---|---|
| `@medina/sovereign-memory-sdk` | Memory Ring | Spatial memory, phi-coordinates, lineage, living documents |
| `@medina/enterprise-integration-sdk` | Interface Ring | Onboarding, 8 connectors (Salesforce/SAP/Google/Slack/etc), campaigns |
| `@medina/intelligence-routing-sdk` | Interface Ring | Model routing, command parsing, terminal dispatch, workforce routing |
| `@medina/organism-runtime-sdk` | Sovereign Ring | Heartbeat (873ms), 4-register state, kernel execution, edge sensing |
| `@medina/document-absorption-engine` | Memory Ring | Document intake, extraction, knowledge graphs, absorption pipeline |

### Architectural Laws (40)

The organism is governed by 40 laws across: Structural, Visual, Projection, State, Build, Verification, Scene, Communication, Storage, Native, Runtime, Governance, Memory, Routing, Integration, Absorption, Resilience, Edge, Resonance, Execution, and Architecture domains. See `Architectural_Laws_Register.csv` for the full register.

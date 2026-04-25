<p align="center">
  <img src="extensions/jarvis/icons/icon128.png" width="80" alt="Organism AI" />
</p>

<h1 align="center">Organism AI</h1>

<p align="center">
  <strong>Intelligence infrastructure that runs at the edge, in the browser, and on-chain.</strong><br />
  Three production-ready AI systems. Open architecture. No cloud dependency.
</p>

<p align="center">
  <a href="#install">⚡ Install</a> · <a href="#jarvis-ai">🤖 JARVIS</a> · <a href="#sovereign-mind">🧠 Sovereign Mind</a> · <a href="#edge-runner">⚡ Edge Runner</a> · <a href="#architecture">🏗 Architecture</a> · <a href="#research">📄 Research</a>
</p>

---

## What This Is

A full-stack intelligence platform with three deployable products, a living runtime with an 873ms heartbeat, and 27 browser extensions — all running without a server.

The architecture isn't a wrapper around GPT. It's a sovereign system: 15 Web Workers forming a distributed brain, phi-encoded spatial memory, Kuramoto-coupled oscillator synchronization, 4-register state machine (Cognitive / Affective / Somatic / Sovereign), and a Motoko canister on the Internet Computer for permanent on-chain storage. Six language implementations. 250 callable protocols. 400 marketplace tools. 60 architectural laws governing every wire.

Everything is downloadable. Everything runs locally. Everything is open.

---

## The Three Products

<a id="jarvis-ai"></a>
### 🤖 JARVIS AI — Your Sovereign AI Assistant

**What it does.** JARVIS is a Chrome side panel that acts as a personal AI command center. You type natural language — "open google.com", "take a note: call the team at 3pm", "summarize this page", "screenshot" — and it executes instantly. No API keys. No cloud calls. Runs entirely in your browser.

**What's inside.**

| Capability | How it works |
|---|---|
| **18 natural-language intents** | Tab management, URL navigation, note-taking, PDF creation, page summarization, text search, screenshot capture, document creation, and conversational chat |
| **10 Alpha Script AIs** | PROTOCOLLUM (governance), TERMINALIS (CLI), ORGANISMUS (lifecycle), MERCATOR (marketplace), ORCHESTRATOR (coordination), MATHEMATICUS (proofs), SYNAPTICUS (neural paths), SUBSTRATUM (infrastructure), UNIVERSUM (knowledge graph), CANISTRUM (Web3) |
| **Copilot-style side panel** | 6-tab command center — Chat, Tabs, Notes, Docs, Page Info, Command Log — with auto-refresh, status bar, and quick-action buttons |
| **Floating arc-reactor FAB** | Appears on every page. Click to open the panel. Pulsing indicator shows JARVIS is alive. |
| **On-chain persistence** | Every note, command, and document is stored permanently on the Internet Computer via the JARVISIUS canister (Motoko, stable memory, 873ms heartbeat) |
| **Keyboard shortcuts** | Double-press `J` on any page to save selected text as a note |

**Who it's for.** Product teams who need a command layer on top of their browser. Analysts who want to capture and organize web research without switching tools. Developers who want an AI assistant that doesn't phone home.

**Install JARVIS right now:**
```bash
# Download and unzip
curl -L https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/jarvis.zip -o jarvis.zip
unzip jarvis.zip -d jarvis-extension
# Then: chrome://extensions → Developer mode → Load unpacked → select jarvis-extension/
```

Or **[download jarvis.zip directly](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/jarvis.zip)**.

---

<a id="sovereign-mind"></a>
### 🧠 Sovereign Mind — AI Reasoning From Your Own Data

**What it does.** Three sovereign engines — FusionCore, AlphaRouter, and PhiScorer — reason over your data and produce a single fused answer with phi-weighted confidence scoring. No GPT. No Claude. No Gemini. Your data, your reasoning, your answer. One panel floating on your page.

**How it works.**
1. You ask a question on any webpage
2. FusionCore extracts relevant context from the page and your stored knowledge
3. AlphaRouter evaluates multiple reasoning paths and selects the optimal chain
4. PhiScorer weights each output using the golden ratio (φ = 1.618...) as a confidence threshold
5. You get one sovereign answer — scored, sourced, and explainable

**Who it's for.** Organizations that can't send data to third-party AI providers. Security teams. Legal teams. Research labs. Anyone who needs AI reasoning without data leaving the device.

**Install:**
```bash
curl -L https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/sovereign-mind.zip -o sovereign-mind.zip
unzip sovereign-mind.zip -d sovereign-mind-ext
```

Or **[download sovereign-mind.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/sovereign-mind.zip)**.

---

<a id="edge-runner"></a>
### ⚡ Edge Runner — Offline AI, Zero Cloud

**What it does.** Full AI inference on your device. Phi, Gemma, and DBRX models run locally in-browser. No internet connection needed. No data transmitted. No latency. The organism works in airplane mode.

**How it works.**
- Local model inference via optimized browser runtimes
- WebGPU acceleration when available, CPU fallback always works
- Plugs into the Organism's 15-worker brain — gets memory, routing, telemetry, and scheduling for free
- Edge sensing adapts model selection to device capability in real time

**Who it's for.** Field teams with intermittent connectivity. Classified environments. Privacy-first applications. Anyone who needs AI where the internet doesn't reach.

**Install:**
```bash
curl -L https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/edge-runner.zip -o edge-runner.zip
unzip edge-runner.zip -d edge-runner-ext
```

Or **[download edge-runner.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/edge-runner.zip)**.

---

<a id="install"></a>
## Install Everything — One Command

### macOS / Linux

```bash
git clone https://github.com/FreddyCreates/potential-succotash.git
cd potential-succotash
bash install-organism.sh
```

That's it. Chrome opens with all 27 AI extensions loaded and running. No build step. No npm install. No Docker.

### Windows — Double-Click

**[Download install-organism.bat](https://github.com/FreddyCreates/potential-succotash/raw/main/install-organism.bat)** → double-click it. Extensions extract and Chrome launches with everything attached.

Or use PowerShell:
```powershell
# Download and run
Invoke-WebRequest -Uri "https://github.com/FreddyCreates/potential-succotash/raw/main/install-organism.bat" -OutFile install-organism.bat
.\install-organism.bat
```

### Terminal CLI

```bash
node organism-cli               # 1-click install — all extensions live in Chrome
node organism-cli validate      # check all manifests
node organism-cli list          # show all extensions with status
node organism-cli status        # health report
```

### Manual — Any Single Extension

1. Download any `.zip` from [dist/extensions/](https://github.com/FreddyCreates/potential-succotash/tree/main/dist/extensions)
2. Unzip it
3. Open `chrome://extensions` → enable **Developer mode**
4. Click **Load unpacked** → select the unzipped folder
5. Done — works on Chrome, Edge, and Brave

**[Download ALL 27 Extensions (single zip)](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/all-extensions.zip)**

---

<a id="architecture"></a>
## Architecture

### The Brain — 15 Web Workers

The organism boots 15 dedicated Web Workers through `organism-bridge.js`. Each worker is a specialized brain region:

| Division | Workers | Function |
|---|---|---|
| **Core** | Engine, Memory, Routing | Heartbeat, phi-encoded spatial memory, intelligent model routing |
| **Perception** | Telemetry, Analytics, Guardian | Real-time sensing, behavioral analytics, threat detection |
| **Execution** | Crypto, Contract, Scheduler | Encrypted transport, contract verification, task scheduling |
| **Network** | Mesh, Pipeline, Orchestrator | Peer-to-peer mesh, data pipeline, multi-agent coordination |
| **Brain** | Inference, Twin Alpha, Math | 12-capability inference engine, user-facing AI intermediary, mathematical computation |

Plus 3 standalone workers: Download Worker (file operations), OrgZip Worker (compression), Autonomy (self-regulation).

### State Architecture — 4 Registers

Every component operates on a 4-register state machine:

- **Cognitive** — what the system knows (knowledge, models, context)
- **Affective** — what the system values (priorities, preferences, weights)
- **Somatic** — what the system senses (inputs, telemetry, edge data)
- **Sovereign** — what the system decides (outputs, actions, routing choices)

### Synchronization — Kuramoto Oscillators

Distributed components stay synchronized using Kuramoto-coupled oscillators locked to the 873ms heartbeat. This isn't a polling interval — it's a phase-coupled rhythm that allows all workers, extensions, and edge nodes to maintain coherence without a central clock.

### Memory — Phi-Encoded Spatial Coordinates

Every memory is stored with 5-axis spatial coordinates encoded using the golden ratio. This enables retrieval by meaning, proximity, resonance, and temporal relevance simultaneously — not just keyword matching.

### On-Chain — Internet Computer Canister

The JARVISIUS canister runs on the Internet Computer (Motoko). Stable memory survives upgrades. Notes, commands, documents, and tab actions persist permanently. The same 873ms heartbeat runs on-chain via `Timer.recurringTimer`.

### Six Language Implementations

The organism runs natively in:

| Language | Location | Runtime |
|---|---|---|
| Motoko | `organism/motoko/` | ICP canister, Timer heartbeat, stable state |
| C++ | `organism/cpp/` | `std::thread`, mutex-protected registers, CMake |
| TypeScript | `organism/typescript/` | Strict-typed runtime, heartbeat, kernels |
| Java | `organism/java/` | `ScheduledExecutorService`, `CompletableFuture`, Maven |
| Web Workers | `organism/web/` | Open `index.html` — alive in any browser, no server |
| Python | `organism/python/` | `python -m organism` — stdlib-only, threading, SIGINT shutdown |

---

## Enterprise Use Cases

**Security Operations** — Deploy Sentinel Watch and Cipher Shield across your organization's browsers. Real-time phishing detection, prompt injection defense, and content encryption without routing data through external services.

**Research & Analysis** — JARVIS + Research Nexus + Data Alchemist form a research pipeline: capture pages, extract entities, build knowledge graphs, and synthesize findings — all stored locally with sovereign memory.

**Compliance & Legal** — Contract Forge drafts intelligence contracts with GPT, reviews with Claude, and validates with Guards. Cryptographic proof of compliance. No document leaves your network.

**Offline / Field Operations** — Edge Runner provides full AI capability without connectivity. Deploy to field teams, classified environments, or air-gapped networks. The organism works where the internet doesn't.

**Financial Intelligence** — Spread Scanner, Data Oracle, and Pattern Forge analyze market data with phi-weighted z-scores, spectral decomposition, cross-system correlation, and anomaly detection. The math is real — DFT harmonics, Pearson cross-correlation, IQR×φ thresholds.

---

## All 27 Extensions

| | Extension | What It Does | Download |
|---|---|---|---|
| 🤖 | **Jarvis AI** | AI command center — side panel, 18 intents, 10 Alpha AIs | **[jarvis.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/jarvis.zip)** |
| 🧠 | **Sovereign Mind** | Sovereign reasoning from your own data — phi-scored fusion | **[sovereign-mind.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/sovereign-mind.zip)** |
| ⚡ | **Edge Runner** | Offline AI — local inference, zero cloud, full privacy | **[edge-runner.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/edge-runner.zip)** |
| 🛡 | Cipher Shield | Real-time encryption and prompt injection detection | [cipher-shield.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/cipher-shield.zip) |
| 🌐 | Polyglot Oracle | Live page translation with context awareness | [polyglot-oracle.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/polyglot-oracle.zip) |
| 🎨 | Vision Weaver | Multi-model image generation — DALL-E, SD, Midjourney, SAM | [vision-weaver.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/vision-weaver.zip) |
| 💻 | Code Sovereign | AI code review with contract verification | [code-sovereign.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/code-sovereign.zip) |
| 📚 | Memory Palace | Phi-encoded spatial bookmarking | [memory-palace.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/memory-palace.zip) |
| 🔒 | Sentinel Watch | Phishing, malware, and social engineering detection | [sentinel-watch.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/sentinel-watch.zip) |
| 🔬 | Research Nexus | Multi-source research synthesis with citations | [research-nexus.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/research-nexus.zip) |
| 🎤 | Voice Forge | Speech-to-text, voice synthesis, music composition | [voice-forge.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/voice-forge.zip) |
| ⚗️ | Data Alchemist | Auto-absorb webpages into knowledge graphs | [data-alchemist.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/data-alchemist.zip) |
| 🎬 | Video Architect | Text-to-video — Sora, Runway, Pika, Kling | [video-architect.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/video-architect.zip) |
| 📐 | Logic Prover | Formal mathematical proofs with verification | [logic-prover.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/logic-prover.zip) |
| 💬 | Social Cortex | Sentiment analysis, empathy detection, response generation | [social-cortex.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/social-cortex.zip) |
| 📝 | Contract Forge | AI contract authoring with cryptographic compliance | [contract-forge.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/contract-forge.zip) |
| 📊 | Organism Dashboard | Real-time vital signs — heartbeat, registers, sensors | [organism-dashboard.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/organism-dashboard.zip) |
| 🗺 | Knowledge Cartographer | Visual knowledge graph that grows as you browse | [knowledge-cartographer.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/knowledge-cartographer.zip) |
| 🔗 | Protocol Bridge | Unified protocol surface for 40 foundation models | [protocol-bridge.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/protocol-bridge.zip) |
| 🎭 | Creative Muse | Multi-modal creative studio — images, music, text | [creative-muse.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/creative-muse.zip) |
| 🌀 | Sovereign Nexus | Master hub — all extensions unified in one panel | [sovereign-nexus.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/sovereign-nexus.zip) |
| 🏪 | Marketplace Hub | Browse and invoke 400 tools with natural language | [marketplace-hub.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/marketplace-hub.zip) |
| 📈 | Spread Scanner | Phi-weighted spread analysis and arbitrage grading | [spread-scanner.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/spread-scanner.zip) |
| 🔮 | Data Oracle | X-ray depth analysis with √N normalization | [data-oracle.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/data-oracle.zip) |
| 🖥 | Screen Commander | Natural-language browser automation | [screen-commander.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/screen-commander.zip) |
| 🔷 | Pattern Forge | DFT spectral decomposition, cross-correlation, anomaly detection | [pattern-forge.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/pattern-forge.zip) |
| 🏗 | Register | Builder AI — scans, validates, packages, deploys extensions | [register.zip](https://github.com/FreddyCreates/potential-succotash/raw/main/dist/extensions/register.zip) |

---

<a id="research"></a>
## Research

The architecture behind this system is documented in 9 peer-style research papers, each covering a core subsystem. All papers are in `research/` and render as self-contained HTML documents.

| Paper | Subject | Focus |
|---|---|---|
| [Neuro Core](research/neuro-paper.html) | Neuroemergent autonomy in distributed computational systems | 4-register architecture, phi-coupling, Kuramoto synchronization |
| [Inference Engine](research/inference-paper.html) | 12-capability inference pipeline | Classification, embedding, summarization, QA, chain-of-thought |
| [Crypto Transport](research/crypto-paper.html) | Adaptive encrypted intelligence transport | Content-sensitive encryption, wire sovereignty |
| [Guardian System](research/guardian-paper.html) | Self-healing threat detection and immune response | Anti-collapse, boundary enforcement, doctrine auditing |
| [Mesh Network](research/mesh-paper.html) | Peer-to-peer edge mesh intelligence | Cross-organism resonance, workload redistribution |
| [Pipeline Architecture](research/pipeline-paper.html) | Multi-stage data pipeline with phi-weighted flow | Knowledge absorption, entity extraction, graph construction |
| [Scheduler](research/scheduler-paper.html) | Distributed task scheduling with golden-ratio intervals | 873ms heartbeat, kernel isolation, register integrity |
| [Twin Alpha](research/twin-alpha-paper.html) | User-facing AI intermediary | Memory search, task routing, autonomous suggestions |
| [Autonomy Engine](research/autonomy-paper.html) | Self-regulating autonomous intelligence | Goal formation, self-monitoring, graceful degradation |

---

## The Numbers

- **250** AI protocols (`AI_Protocols_Register.csv`)
- **400** marketplace tools across 20 families (`Organism_Marketplace_Register.csv`)
- **60** architectural laws (`Architectural_Laws_Register.csv`)
- **27** browser extensions + 5 Windows utilities
- **15** core Web Workers forming the distributed brain
- **9** research papers
- **6** language implementations (Motoko, C++, TypeScript, Java, Web Workers, Python)
- **1** heartbeat at **873ms** — everywhere

---

## About

We're not a company. We're a research lab that ships.

Organism AI is an independent engineering effort building sovereign intelligence infrastructure — systems that run on your hardware, keep your data local, and don't depend on anyone's API. The work started as a question: what happens when you treat every layer of a software stack as an intelligence problem? Not "add AI to X" — make X intelligent by nature.

The codebase is the answer. SDKs that think. Protocols that adapt. Extensions that reason. A runtime with a heartbeat. Memory that remembers spatially. Workers that synchronize without a clock. An on-chain canister that never forgets.

We publish the research because the architecture matters more than the product. If the ideas are right, anyone can rebuild this. If they're wrong, we want to know.

Everything here is open. Use it, fork it, break it, build on it.

*As above, so below.*

---

## License

[MIT](LICENSE)

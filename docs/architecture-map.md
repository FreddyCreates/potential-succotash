# 🏛 Casa de Inteligencia — Architecture Map

**Generated:** 2026-05-12T06:52:40.441Z
**Bot:** organism-docs-bot 📚

## System Overview

```
╔══════════════════════════════════════════════════════════════════╗
║              CASA DE INTELIGENCIA — ORGANISM ARCHITECTURE        ║
╠══════════════════════════════════════════════════════════════════╣
║                                                                  ║
║  FRONTENDS (37 extensions + desktop + web + cli)                ║
║  ┌──────────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐ ║
║  │ Browser Exts │ │ Desktop  │ │   Web   │ │       CLI       │ ║
║  │  (Chrome/Edge│ │(Electron)│ │   App   │ │  (Node.js)      │ ║
║  └──────┬───────┘ └────┬─────┘ └────┬────┘ └────────┬────────┘ ║
║         └──────────────┴────────────┴────────────────┘          ║
║                              │                                   ║
╠══════════════════════════════╪═══════════════════════════════════╣
║  PROTOCOLS (97 intelligence protocols)                                 ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  ║
║  │ Routing  │ │ Memory   │ │ Security │ │   Resonance/PHI  │  ║
║  │ SRP·EMIP │ │ MLP·AKAP │ │ EIT·SCVP │ │      PRSP        │  ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  ║
║  │  Vision  │ │ Lifecycle│ │  Fusion  │ │     Neural       │  ║
║  │   VSIP   │ │ OLP·OMP  │ │   MMFP   │ │  AGIP·SOCP       │  ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  ║
╠══════════════════════════════╪═══════════════════════════════════╣
║  SDKs (18 capability surfaces)                                         ║
║  ai-model-engines · intelligence-routing · sovereign-memory      ║
║  organism-runtime · organism-marketplace · enterprise-integration║
║  document-absorption · frontend-intelligence · windows-runtime   ║
╠══════════════════════════════════════════════════════════════════╣
║  ORGANISM SUBSTRATES (6 runtimes)                                     ║
║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  ║
║  │TypeScript│ │  Python  │ │   C++    │ │      Java        │  ║
║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  ║
║  ┌──────────────────────────┐ ┌──────────────────────────────┐  ║
║  │ Motoko (Internet Computer│ │    Web Workers (21 workers)  │  ║
║  └──────────────────────────┘ └──────────────────────────────┘  ║
╠══════════════════════════════════════════════════════════════════╣
║  CORE CONSTANTS: PHI=1.618033988749895 · HEARTBEAT=873ms        ║
║  4-Register State: Cognitive·Affective·Somatic·Sovereign        ║
╚══════════════════════════════════════════════════════════════════╝
```

## Layer Breakdown

### 🌐 Frontends (40 surfaces)

| Frontend | Type | Count |
|---|---|---|
| Browser Extensions | Chrome/Edge MV3 | 37 |
| Desktop App | Electron | 1 |
| Web App | HTML/JS | 1 |
| CLI | Node.js | 1 |

### 🔬 Protocols (97)

- `activated-agent-brain-mapping-protocol`
- `adaptive-knowledge-absorption-protocol`
- `agi-core-protocol`
- `ai-quantum-protocol`
- `ai-sdk-protocol`
- `alpha-commander-charter-protocol`
- `alpha-emergence-protocol`
- `alpha-evolution-engine-protocol`
- `alpha-fleet-orchestration-protocol`
- `alpha-governance-enforcement-protocol`
- `alpha-health-monitor-protocol`
- `alpha-issue-intelligence-protocol`
- `alpha-knowledge-graph-protocol`
- `alpha-resonance-protocol`
- `alpha-reward-protocol`
- `alpha-security-sentinel-protocol`
- `alpha-signal-protocol`
- `alpha-substrate-bridge-protocol`
- `alpha-workflow-engine-protocol`
- `artifact-generation-protocol`
- `attention-routing-protocol`
- `audio-intelligence-protocol`
- `auro-absorption-charter-protocol`
- `auro-guardian-intelligence-protocol`
- `auto-generate-calls-engine-protocol`
- `category-theory-protocol`
- `causal-inference-protocol`
- `civilization-architecture-core-protocol`
- `civilization-scale-organism-protocol`
- `code-block-cognitive-interface-protocol`
- `collective-consciousness-protocol`
- `conceptual-persistence-engine-protocol`
- `cross-substrate-resonance-protocol`
- `cryptographic-intelligence-protocol`
- `cyborg-integration-protocol`
- `data-fabric-protocol`
- `distributed-cognitive-mesh-protocol`
- `dream-protocol`
- `edge-mesh-intelligence-protocol`
- `edge-sensor-protocol`
- `embodiment-engine-protocol`
- `emotional-resonance-protocol`
- `encrypted-intelligence-transport`
- `federated-intelligence-networks-protocol`
- `formal-logic-inference-protocol`
- `fractal-dynamics-protocol`
- `geometric-real-math-protocol`
- `goal-stack-protocol`
- `hebbian-learning-protocol`
- `homeostatic-drive-protocol`
- `internal-security-tokens-protocol`
- `kernel-execution-protocol`
- `knowledge-synthesis-protocol`
- `kuramoto-oscillator-protocol`
- `language-bridge-protocol`
- `memory-consolidation-protocol`
- `memory-lineage-enhancement-protocol`
- `memory-lineage-protocol`
- `mini-brain-protocol`
- `mini-heart-protocol`
- `mlops-protocol`
- `multi-agent-reasoning-ecosystem-protocol`
- `multi-model-fusion-protocol`
- `multi-node-ai-hub-protocol`
- `multi-sovereign-compute-cores-protocol`
- `mutation-engine-protocol`
- `narrative-intelligence-protocol`
- `neural-network-architecture-protocol`
- `neuro-emergence-protocol`
- `neurochemistry-ode-protocol`
- `nova-core-protocol`
- `organism-lifecycle-protocol`
- `organism-marketplace-protocol`
- `oro-engine-integration-protocol`
- `package-bridge-protocol`
- `pattern-synthesis-protocol`
- `phi-resonance-sync-protocol`
- `predictive-coding-protocol`
- `reasoning-engine-layer-protocol`
- `reward-signal-protocol`
- `saeci-protocol`
- `self-programming-architecture-protocol`
- `simulation-engine-protocol`
- `sovereign-contract-verification-protocol`
- `sovereign-cycle-allocator-protocol`
- `sovereign-offline-cognition-protocol`
- `sovereign-routing-protocol`
- `symbolic-mathematics-protocol`
- `synapse-binding-engine-protocol`
- `temporal-protocol`
- `token-economy-protocol`
- `undead-intelligence-protocol`
- `visual-intelligence-protocol`
- `visual-scene-intelligence-protocol`
- `vitality-homeostasis-protocol`
- `vow-protocol`
- `xr-world-protocol`

### 📦 SDKs (18)

- `agents`
- `ai-model-engines`
- `document-absorption-engine`
- `engines`
- `enterprise-integration-sdk`
- `frontend-intelligence-models`
- `intelligence-routing-sdk`
- `medina-calls`
- `medina-queries`
- `medina-timers`
- `organism-bootstrap`
- `organism-marketplace`
- `organism-runtime-sdk`
- `register-ai`
- `runtime`
- `sovereign-memory-sdk`
- `windows-desktop-sdk`
- `windows-runtime-sdk`

### 🧬 Organism Substrates (6)

- **cpp** (`organism/cpp/`)
- **java** (`organism/java/`)
- **motoko** (`organism/motoko/`)
- **python** (`organism/python/`)
- **typescript** (`organism/typescript/`)
- **web** (`organism/web/`)

## Intelligence Constants

| Constant | Value | Significance |
|---|---|---|
| PHI | 1.618033988749895 | Golden ratio — all phi-encoded math |
| HEARTBEAT | 873ms | System pulse (873 × φ ≈ 1413ms recursive interval) |
| GOLDEN_ANGLE | 137.508° | Phi-encoded spatial distribution |

---

*Generated by organism-docs-bot 📚*
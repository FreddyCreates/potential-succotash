# Defense Organism

**Dual-Layer Cognitive Architecture for Computational Defense**

The organism operates with two cognitive planes:
- **Conscious Layer (Cortex)**: Observable, governed, logged
- **Dark Layer (Subcortex)**: Silent, unlogged, unobserved

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                           CONSCIOUS LAYER (CORTEX)                          │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │ Gate Workers│  │ API Workers │  │  Governance │  │ Observability│        │
│  │   (public)  │  │   (public)  │  │   Engine    │  │    Stack     │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Properties:                                                                │
│  • Fully observable (logs, traces, events, metrics)                        │
│  • Governed (all behavior subject to law and pipelines)                    │
│  • Durable memory (long-term state, reports, lineage)                      │
│                                                                             │
├─────────────────────────────────────────────────────────────────────────────┤
│                              MEMBRANE                                       │
│  ┌─────────────────────────────────────────────────────────────────────┐   │
│  │ Conscious → Dark: sanitized fingerprints, abstracted profiles, cases │   │
│  │ Dark → Conscious: scores, tags, actions (distilled outputs only)     │   │
│  │ FORBIDDEN: raw shadow memory, dark logs, direct external access      │   │
│  └─────────────────────────────────────────────────────────────────────┘   │
├─────────────────────────────────────────────────────────────────────────────┤
│                         DARK LAYER (SUBCORTEX)                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐        │
│  │Silent Workers│  │Shadow Memory│  │ Dark Models │  │  Sandland   │        │
│  │  (internal) │  │ (encrypted) │  │(adversarial)│  │ (simulator) │        │
│  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘        │
│                                                                             │
│  Properties:                                                                │
│  • No telemetry (no logs, no traces, no events, no analytics)              │
│  • Isolated scope (only internal entrypoints)                              │
│  • Ephemeral by default (state in memory or short-lived KV)                │
│  • Non-governed (governance can invoke but not inspect)                    │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Directory Structure

```
defense-organism/
├── README.md                    # This file
├── docs/
│   ├── architecture-dark-layer.md
│   ├── architecture-conscious-layer.md
│   ├── membrane-spec.md
│   └── sandland-spec.md
├── dark-core/
│   ├── workers/
│   │   ├── shadow-gate.js       # Entry for dark analysis
│   │   ├── adversary-lab.js     # Adversary behavior analysis
│   │   ├── anomaly-engine.js    # Anomaly scoring
│   │   ├── deception-engine.js  # Honeypot/trap logic
│   │   └── sandland-sim.js      # Dark internet simulator
│   ├── models/
│   │   ├── adversary-classifier/
│   │   ├── anomaly-detector/
│   │   ├── ua-fingerprint-model/
│   │   └── path-pattern-model/
│   └── shadow-memory/
│       ├── shadow-kv-schema.md
│       └── shadow-do.js         # Shadow Cortex Durable Object
├── membrane/
│   ├── membrane-contract.md     # What cortex can send/receive
│   ├── cortex-adapter.js        # Conscious → dark call wrapper
│   └── dark-responder.js        # Dark → conscious response normalizer
├── sandland/
│   ├── scenarios/
│   │   ├── tor-hardmode.json
│   │   ├── botnet-recon.json
│   │   └── llm-mapper.json
│   ├── agents/
│   │   ├── scanner-bot.js
│   │   ├── llm-agent-sim.js
│   │   └── brute-force-bot.js
│   └── hosts/
│       ├── fake-wordpress.js
│       ├── fake-admin-panel.js
│       └── fake-api-service.js
└── tests/
    ├── membrane-tests/
    ├── sandland-scenarios/
    └── adversary-regression/
```

## Quick Start

### Invoking Dark Analysis (via Membrane)

```javascript
import { CortexAdapter } from './membrane/cortex-adapter.js';

const adapter = new CortexAdapter(env);

// Send sanitized request to dark layer
const darkAnalysis = await adapter.analyze({
  fingerprint: { ip: 'x.x.x.x', ua: 'Mozilla/...', path: '/api/...' },
  case: 'suspicious-pattern',
  priority: 'high'
});

// Receive distilled output (scores, tags, actions)
// darkAnalysis = { riskScore: 0.87, tags: ['scanner', 'recon'], action: 'honeypot' }
```

### Running Sandland Simulation

```javascript
import { SandlandSimulator } from './sandland/simulator.js';

const sim = new SandlandSimulator();
await sim.loadScenario('botnet-recon');
await sim.run({ duration: '24h', agents: 50 });
const results = sim.getResults();
```

## Development Stages

| Stage | State | Description |
|-------|-------|-------------|
| Stage 2 | **Current** | Sensory Awakening — perception, classification, routing |
| Stage 3 | Next | Immune Activation — Zero Trust, threat memory, adversary classification |
| Stage 4 | Future | Cognitive Integration — global workspace, narrative self, protocol evolution |
| Stage 5 | Endgame | Civilization-Scale Federation — multi-body cognition |

## φ-Constants

All components use the organism's coherence constants:

```javascript
const PHI = 1.618033988749895;  // Golden ratio
const HB = 873;                  // Heartbeat interval (ms)
const THRESHOLD = 1 / PHI;       // Verification threshold (≈0.618)
```

## License

Sovereign Organism Architecture — ORO Systems / AURO

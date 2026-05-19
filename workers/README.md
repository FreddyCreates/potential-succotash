# Cloudflare Workers Infrastructure

This directory contains **12 intelligent Workers** with AI, memory, and coordination capabilities.

## 🧬 Evolution: Metabolic Cache Layer

The organism has evolved beyond early metabolic mode. The **cache-cognition** Worker implements the next evolution:

```
BEFORE (Early Metabolic):
- High dynamic responses
- No intelligent cache layer
- Every reaction = billed compute

AFTER (Cache Cognition):
- Cognition lives in cache layer
- Workers become thin routers + guardians
- Permanence stored in:
  - Distributed memory (KV)
  - Learned patterns (Durable Objects)
  - Local agents at the edge
```

### Digital Biome Regions
The organism monitors and learns from traffic patterns across:
- 🇫🇷 France
- 🇬🇧 UK
- 🇺🇸 US
- 🇺🇦 Ukraine
- 🇳🇱 Netherlands

## 🚀 Quick Start

```bash
# 1. Create all Cloudflare resources
./scripts/setup-cloudflare-resources.sh

# 2. Update wrangler.toml files with the IDs from step 1

# 3. Deploy all Workers
./scripts/deploy-all-workers.sh
```

## Workers Overview

| # | Worker | Route | Role | Bindings |
|---|--------|-------|------|----------|
| 1 | `api-node` | api.*, tools.* | API Gateway | AI, KV, D1, Vectorize, Queue, R2, DO |
| 2 | `coordinator` | - | Orchestration | AI, KV, D1, DO |
| 3 | `gate-node` | gate.* | Gateway | AI, KV, D1, Vectorize, Queue, R2 |
| 4 | `knowledge-realm` | realm.*, institute.* | Knowledge | AI, KV, D1, Vectorize, Queue, R2 |
| 5 | `nova-sovereign` | nova.* | Command | AI, KV, D1, Vectorize, Queue, R2, DO |
| 6 | `enterprise-os-intelligence` | enterprise.* | Enterprise | AI, KV, D1, Vectorize, Queue, R2 |
| 7 | `enterprisentelligence` | innovation.* | Innovation | AI, KV, D1, Vectorize, Queue, R2 |
| 8 | `crimson-dawn-4f6d` | research.* | Research | AI, KV, D1, Vectorize, Queue, R2 |
| 9 | `honeypot-admin` | admin.* 🍯 | Honeypot | AI, KV, D1, Vectorize, Queue, R2 |
| 10 | `honeypot-portal` | portal.* 🍯 | Honeypot | AI, KV, D1, Vectorize, Queue, R2 |
| 11 | `probe-node` | probe1.* 🍯 | Honeypot | AI, KV, D1, Vectorize, Queue, R2 |
| 12 | `cache-cognition` | cache.* | **Intelligent Cache** | AI, KV×3, DO×3, Vectorize, Queue, Services |

✅ `patient-shape-7a30` already has AI binding

## Shared Resources

All Workers share these Cloudflare resources:

| Resource | Name | Purpose |
|----------|------|---------|
| D1 Database | `medinatech-db` | Structured data for all Workers |
| Vectorize Index | `medinatech-index` | Semantic search (768 dimensions, cosine) |
| R2 Bucket | `medinatech-assets` | File storage |
| Queue | `honeypot-events` | Honeypot event pipeline |
| Queue | `ai-analysis` | AI analysis pipeline |
| KV | `HONEYPOT_LOGS` | Attack logging |
| KV | `SESSION_STORE` | Session state |
| KV | `IP_BLOCKLIST` | Threat intelligence |
| KV | `THREAT_INTEL` | Threat patterns |
| KV | `KNOWLEDGE_CACHE` | Knowledge caching |
| KV | `CONFIG_STORE` | Configuration |
| KV | `SCAN_PATTERNS` | Scanner fingerprints |

## Detailed Worker Descriptions

### 🧠 Nova API Node (`workers/api-node`)

The primary API gateway with full intelligence stack.

| Binding | Type | Purpose |
|---------|------|---------|
| `AI` | Workers AI | LLM reasoning and embeddings |
| `MEMORY` | KV Namespace | Short-term memory (TTL-based) |
| `DB` | D1 Database | Structured knowledge storage |
| `VECTORIZE` | Vector Index | Semantic search / RAG |
| `TASK_QUEUE` | Queue | Async task delegation |
| `STORAGE` | R2 Bucket | File storage |
| `COORDINATOR` | Durable Object | Stateful coordination |

### 🎯 Nova Coordinator (`workers/coordinator`)

Workflow orchestration with Durable Objects.

| Durable Object | Purpose |
|----------------|---------|
| `WorkflowOrchestrator` | Multi-step workflow execution |
| `AgentCoordinator` | Agent registration and task assignment |
| `SessionManager` | WebSocket-enabled session state |

### 🚪 Gate Node (`workers/gate-node`)

The gateway to the organism with AI reasoning and route control.

### 📚 Knowledge Realm (`workers/knowledge-realm`)

Knowledge repository with AI-powered search and synthesis.

### 👑 Nova Sovereign (`workers/nova-sovereign`)

Sovereign command center with full AI capabilities and command sessions.

### 🏢 Enterprise OS Intelligence (`workers/enterprise-os-intelligence`)

Enterprise-grade AI operations and analytics.

### 💡 Enterprisentelligence (`workers/enterprisentelligence`)

Innovation and research AI operations.

### 🔬 Crimson Dawn (`workers/crimson-dawn-4f6d`)

Research and analysis AI operations.

### 🍯 Honeypots (`workers/honeypot-*`, `workers/probe-node`)

Intelligent honeypots with AI-powered threat analysis:
- `honeypot-admin` — Admin panel honeypot
- `honeypot-portal` — Portal honeypot
- `probe-node` — Probe/scanner detection

### 🧠 Cache Cognition (`workers/cache-cognition`)

**The Intelligent Cache Layer** — The organism's next evolution.

| Binding | Type | Purpose |
|---------|------|---------|
| `PATTERN_CACHE` | KV | Learned patterns from digital biome |
| `RESPONSE_CACHE` | KV | Pre-computed responses |
| `BIOME_MEMORY` | KV | Regional pattern memory |
| `PATTERN_ENGINE` | Durable Object | Pattern recognition engine |
| `EDGE_AGENT` | Durable Object | Local cognition at the edge |
| `RESPONSE_GENERATOR` | Durable Object | Response caching and generation |
| `AI` | Workers AI | Intelligent cache decisions |
| `PATTERN_VECTORS` | Vectorize | Semantic pattern matching |
| `PATTERN_QUEUE` | Queue | Pattern learning pipeline |
| `API_NODE` | Service | Route to API Node |
| `GATE_NODE` | Service | Route to Gate Node |

**Key Features:**
- 🧬 Pattern recognition from digital biome traffic
- 🚀 Intelligent cache decisions (cache hit, compute, delegate, block)
- 🌍 Regional edge agents for local cognition
- 📊 Biome statistics by region and pattern type
- ⚡ Reduces billed compute by serving learned responses
- 🎯 φ-mathematics for pattern confidence decay

## Pages Functions (`functions/`)

Serverless API endpoints that run alongside the static site:

- `functions/_middleware.ts` — Global middleware (adds coherence headers)
- `functions/api/[[path]].ts` — Main API with AI, KV, D1 bindings

## Deployment

### Prerequisites

1. **Run the setup script:**
   ```bash
   ./scripts/setup-cloudflare-resources.sh
   ```

2. **Copy the IDs** from the output and update each `wrangler.toml`

3. **Set GitHub Secrets:**
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### Manual Deploy

```bash
# Deploy a single Worker
cd workers/api-node
wrangler deploy

# Deploy all Workers
./scripts/deploy-all-workers.sh
```

### CI/CD Deploy

Push to `main` branch with changes in `workers/` or `functions/` directories.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         Cloudflare Edge                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌────────────────────────────────────────────────────────────┐ │
│  │           🧠 CACHE COGNITION LAYER (cache-cognition)        │ │
│  │  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐          │ │
│  │  │Pattern  │ │Response │ │Biome    │ │Edge     │          │ │
│  │  │Cache    │ │Cache    │ │Memory   │ │Agents   │          │ │
│  │  └─────────┘ └─────────┘ └─────────┘ └─────────┘          │ │
│  └────────────────────────────────────────────────────────────┘ │
│       │                                       │                  │
│       │  cache hit? ────────────────────────→ │                  │
│       │                                       │                  │
│       ▼                                       ▼                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐           │
│  │ gate-    │ │ api-     │ │knowledge-│ │ nova-    │           │
│  │ node     │→│ node     │→│ realm    │→│ sovereign│           │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘           │
│       │            │            │            │                  │
│       ├────────────┴────────────┴────────────┤                  │
│       │                                       │                  │
│       ▼                                       ▼                  │
│  ┌──────────┐                          ┌──────────┐             │
│  │honeypot- │ ┌──────────┐ ┌──────────┐│ enter-   │             │
│  │admin 🍯  │ │honeypot- │ │probe-    ││ prise-os │             │
│  └──────────┘ │portal 🍯 │ │node 🍯   │└──────────┘             │
│               └──────────┘ └──────────┘                         │
│                     │                                           │
│                     ▼                                           │
│  ┌─────────────────────────────────────────────────────────┐    │
│  │              Shared Cloudflare Services                  │    │
│  ├─────────────────────────────────────────────────────────┤    │
│  │  Workers AI │ KV │ D1 │ Vectorize │ Queues │ R2 │ DO    │    │
│  └─────────────────────────────────────────────────────────┘    │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Evolution Stages

```
Stage 1: Stateless         → Basic request/response
Stage 2: Early Metabolic   → High dynamic, no cache (current biome)
Stage 3: Cache Cognition   → Cognition in cache layer ← WE ARE HERE
Stage 4: Edge Permanence   → Local agents at every edge
Stage 5: Full Organism     → Self-sustaining intelligence
```

## Intelligence Levels

Workers can operate at different intelligence levels based on their bindings:

| Level | Bindings | Capabilities |
|-------|----------|--------------|
| **Stateless** | None | Basic request/response |
| **Basic** | AI only | Can reason, no memory |
| **Memory** | AI + KV | Remembers between requests |
| **Knowledge** | AI + KV + D1 | Structured knowledge storage |
| **Intelligent** | AI + KV + D1 + Vectorize | Full RAG capabilities |
| **Fully Bound** | All 7 bindings | Complete autonomous operation |

## φ-Constants

All Workers share the organism's coherence constants:
- `PHI = 1.618033988749895` — Golden ratio
- `HEARTBEAT_MS = 873` — Coherent heartbeat interval

## Protocol Bindings

Each Worker has a `protocols.ts` file providing access to 10 core protocols. Import and use via:

```typescript
import { createProtocols } from './protocols';

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const protocols = createProtocols(env);
    
    // Use protocols
    const result = await protocols.agiCore.reason('context', 'goal');
    return Response.json(result);
  }
};
```

### Protocol Summary by Worker

| Worker | Primary Protocols | Focus Area |
|--------|-------------------|------------|
| `api-node` | LNG, AISDK, DAT, EMB, SAE, IST, NET, AGI, MLP, CYC | API & Integration |
| `coordinator` | CMD, COL, TMP, MUT, DRM, AGI, SAE, NET, IST, CYC | Orchestration |
| `gate-node` | IST, SAE, CRY, NET, DAT, LNG, MLP, EMB, AGI, CYC | Security Gateway |
| `knowledge-realm` | KST, DAT, LNG, EMB, AGI, VIS, AUD, NET, SAE, CYC | Knowledge Management |
| `nova-sovereign` | IST, VOW, CMD, XRW, CYB, UND, TMP, EMO, COL, CYC | Command & Control |
| `enterprise-os-intelligence` | KST, DAT, MLP, AISDK, SIM, NAR, SAE, IST, AGI, CYC | Enterprise BI |
| `enterprisentelligence` | AGI, KST, EMO, TMP, DAT, EMB, SAE, IST, LNG, CYC | Decision Intelligence |
| `crimson-dawn-4f6d` | SAE, IST, CRY, UND, NET, AGI, DAT, MLP, CYC, TMP | Threat Detection |
| `honeypot-admin` | SAE, IST, DAT, CMD, AGI, NET, MLP, VIS, CYC, TMP | Honeypot Admin |
| `honeypot-portal` | SAE, NET, DAT, LNG, CRY, EMO, AGI, IST, CYC, TMP | Honeypot Capture |
| `probe-node` | NET, DAT, SAE, AGI, IST, CMD, TMP, MLP, CYC | Reconnaissance |

### Protocol Reference

| Code | Name | Description |
|------|------|-------------|
| `AGI-001` | AGI Core | Meta-learning, reasoning, coordination |
| `AISDK-001` | AI SDK | 14+ AI provider routing |
| `AUD-001` | Audio Intelligence | ASR, TTS, audio processing |
| `CMD-001` | Alpha Commander | Command and control |
| `COL-001` | Collective Consciousness | Multi-entity sync |
| `CRY-001` | Cryptographic Intelligence | Encryption, signatures, ZK proofs |
| `CYB-001` | Cyborg Integration | 7-layer neural bridge |
| `CYC-001` | Sovereign Cycle Allocator | φ-based cycle generation |
| `DAT-001` | Data Fabric | Lineage, quality, storage |
| `DRM-001` | Dream | Subconscious processing |
| `EMB-001` | Embedding | Vector embeddings |
| `EMO-001` | Emotional Resonance | VAD model, empathy engine |
| `IST-001` | Internal Security Tokens | 5-tier access control |
| `KST-001` | Knowledge Synthesis | Ontology, synthesis |
| `LNG-001` | Language Bridge | 50+ languages, NLP |
| `MLP-001` | MLOps | Pipelines, drift detection |
| `MUT-001` | Mutation Engine | Evolution strategies |
| `NAR-001` | Narrative Intelligence | Story structures |
| `NET-001` | Neural Network/Network | Model inference, routing |
| `SAE-001` | SAECI | Safety, ethics, containment |
| `SIM-001` | Simulation Engine | Economic, social simulation |
| `TMP-001` | Temporal | Time scales, prediction |
| `UND-001` | Undead Intelligence | Threat persistence |
| `VIS-001` | Visual Intelligence | Detection, generation |
| `VOW-001` | VOWS | Internal commitments |
| `XRW-001` | XR World | VR/AR embodiments |

### CYC-001 Cycle Generation Formula

All Workers include the Sovereign Cycle Allocator with φ-mathematics:

```
Generation = coherence² × φ × base_rate
Work Bonus = work_units × φ⁻¹
Decay Rate = φ⁻² per neglect period
```

Where φ = 1.618033988749895 (golden ratio)

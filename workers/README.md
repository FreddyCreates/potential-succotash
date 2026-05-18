# Cloudflare Workers Infrastructure

This directory contains **11 intelligent Workers** with AI, memory, and coordination capabilities.

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

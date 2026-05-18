# Cloudflare Workers Infrastructure

This directory contains intelligent Workers with AI, memory, and coordination capabilities.

## Workers Overview

### 🧠 Nova API Node (`workers/api-node`)

A fully-bound intelligent Worker with:

| Binding | Type | Purpose |
|---------|------|---------|
| `AI` | Workers AI | LLM reasoning and embeddings |
| `MEMORY` | KV Namespace | Short-term memory (TTL-based) |
| `DB` | D1 Database | Structured knowledge storage |
| `VECTORIZE` | Vector Index | Semantic search / RAG |
| `TASK_QUEUE` | Queue | Async task delegation |
| `STORAGE` | R2 Bucket | File storage |
| `COORDINATOR` | Durable Object | Stateful coordination |

**Endpoints:**
- `GET /health` — Health check with binding status
- `POST /chat` — AI-powered chat with memory context
- `GET/POST/DELETE /memory` — KV memory operations
- `GET/POST /knowledge` — D1 fact storage
- `POST /search` — Semantic vector search
- `POST /index` — Index content for search
- `POST /task` — Delegate background tasks
- `GET/PUT/DELETE /files/*` — R2 file storage
- `POST /init` — Initialize database schema

### 🎯 Nova Coordinator (`workers/coordinator`)

Workflow orchestration with Durable Objects:

| Durable Object | Purpose |
|----------------|---------|
| `WorkflowOrchestrator` | Multi-step workflow execution |
| `AgentCoordinator` | Agent registration and task assignment |
| `SessionManager` | WebSocket-enabled session state |

**Endpoints:**
- `GET /health` — Health check
- `POST /workflow/create` — Create new workflow
- `POST /workflow/start` — Start workflow execution
- `GET /workflow/status` — Get workflow status
- `POST /agent/register` — Register an agent
- `POST /agent/assign` — Assign task to agent
- `GET /agent/agents` — List all agents
- `GET/POST/DELETE /session/session` — Session management
- `WS /session/session` — WebSocket for real-time updates

## Pages Functions (`functions/`)

Serverless API endpoints that run alongside the static site:

- `functions/_middleware.ts` — Global middleware (adds coherence headers)
- `functions/api/[[path]].ts` — Main API with AI, KV, D1 bindings

## Deployment

### Prerequisites

1. Create bindings in Cloudflare Dashboard:
   ```bash
   # KV Namespace
   wrangler kv:namespace create "MEMORY"
   
   # D1 Database
   wrangler d1 create nova-knowledge
   
   # Vectorize Index
   wrangler vectorize create nova-vectors --dimensions=768 --metric=cosine
   
   # Queue
   wrangler queues create nova-tasks
   
   # R2 Bucket
   wrangler r2 bucket create nova-storage
   ```

2. Update `wrangler.toml` with your binding IDs

3. Set GitHub Secrets:
   - `CLOUDFLARE_API_TOKEN`
   - `CLOUDFLARE_ACCOUNT_ID`

### Manual Deploy

```bash
# Deploy API Node
cd workers/api-node
npm install
wrangler deploy

# Deploy Coordinator
cd workers/coordinator
npm install
wrangler deploy
```

### CI/CD Deploy

Push to `main` branch with changes in `workers/` or `functions/` directories.

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      Nova Gate (Pages)                       │
├─────────────────────────────────────────────────────────────┤
│  functions/                                                  │
│  ├── _middleware.ts    (coherence headers)                  │
│  └── api/[[path]].ts   (intelligent API)                    │
└─────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Workers (Intelligence)                   │
├──────────────────────────┬──────────────────────────────────┤
│     nova-api-node        │       nova-coordinator           │
│     ─────────────        │       ────────────────           │
│  • AI reasoning          │  • WorkflowOrchestrator DO       │
│  • KV memory             │  • AgentCoordinator DO           │
│  • D1 knowledge          │  • SessionManager DO             │
│  • Vectorize search      │  • WebSocket support             │
│  • Queue tasks           │                                  │
│  • R2 storage            │                                  │
│  • Coordinator DO        │                                  │
└──────────────────────────┴──────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                     Cloudflare Services                      │
├─────────────────────────────────────────────────────────────┤
│  Workers AI │ KV │ D1 │ Vectorize │ Queues │ R2 │ DO        │
└─────────────────────────────────────────────────────────────┘
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

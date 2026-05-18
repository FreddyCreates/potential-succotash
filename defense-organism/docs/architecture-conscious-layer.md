# Conscious Layer Architecture

**The Organism's Cortex: Observable, Governed, Logged**

## Core Properties

### 1. Fully Observable
- All actions emit logs
- All requests generate traces
- All events recorded
- All metrics captured
- Full Cloudflare observability integration

### 2. Governed
- All behavior subject to law
- All actions pass through governance pipelines
- All decisions explainable
- All changes audited

### 3. Durable Memory
- Long-term state persistence
- Reports preserved
- Lineage tracked
- Entity registry maintained

## Components

### Cortex Workers

Public-facing Workers that handle external traffic.

**Worker Types:**

| Worker | Route | Function |
|--------|-------|----------|
| `gate-node` | `gate.*` | Gateway, initial routing |
| `api-node` | `api.*`, `tools.*` | API Gateway |
| `knowledge-realm` | `realm.*`, `institute.*` | Knowledge repository |
| `nova-sovereign` | `nova.*` | Command center |
| `enterprise-os-intelligence` | `enterprise.*` | Enterprise operations |
| `enterprisentelligence` | `innovation.*` | Innovation AI |
| `crimson-dawn-4f6d` | `research.*` | Research analysis |
| `honeypot-admin` | `admin.*` 🍯 | Honeypot (admin) |
| `honeypot-portal` | `portal.*` 🍯 | Honeypot (portal) |
| `probe-node` | `probe1.*` 🍯 | Probe detection |

**Cortex Worker Template:**

```javascript
/**
 * Cortex Worker Template
 * 
 * PROPERTIES:
 * - Emits logs
 * - Emits traces
 * - Produces events
 * - Participates in observability
 * - Subject to governance
 */
export default {
  async fetch(request, env, ctx) {
    const startTime = Date.now();
    const requestId = crypto.randomUUID();
    
    // Log request (observable)
    console.log(JSON.stringify({
      type: 'request',
      id: requestId,
      method: request.method,
      url: request.url,
      timestamp: startTime
    }));
    
    try {
      // Process request
      const result = await processRequest(request, env);
      
      // Log response (observable)
      console.log(JSON.stringify({
        type: 'response',
        id: requestId,
        status: result.status,
        duration: Date.now() - startTime
      }));
      
      return result;
    } catch (error) {
      // Log error (observable)
      console.error(JSON.stringify({
        type: 'error',
        id: requestId,
        error: error.message,
        duration: Date.now() - startTime
      }));
      throw error;
    }
  }
};
```

### Observability Stack

Full integration with Cloudflare observability:

```
┌─────────────────────────────────────────────────────────────────┐
│                     OBSERVABILITY STACK                          │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐          │
│  │ Workers Logs │  │ Trace Events │  │   Logpush    │          │
│  │  (console)   │  │  (sampling)  │  │   (→ R2)     │          │
│  └──────────────┘  └──────────────┘  └──────────────┘          │
│         │                 │                 │                   │
│         └────────────────┼─────────────────┘                   │
│                          │                                      │
│                          ▼                                      │
│              ┌──────────────────────┐                          │
│              │   Analytics Engine   │                          │
│              │    (aggregation)     │                          │
│              └──────────────────────┘                          │
│                          │                                      │
│                          ▼                                      │
│              ┌──────────────────────┐                          │
│              │     Dashboards       │                          │
│              │    (visualization)   │                          │
│              └──────────────────────┘                          │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**What gets logged:**
- Request metadata (method, URL, headers)
- Classification decisions
- Routing decisions
- Errors and warnings
- Governance events
- Protocol executions
- Memory updates

### Governance Engine

The Universal Atlas governance cycle:

```
┌─────────────────────────────────────────────────────────────────┐
│                     GOVERNANCE CYCLE                             │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  ┌─────────┐    ┌─────────┐    ┌─────────┐    ┌─────────┐      │
│  │ INGEST  │ →  │  APPLY  │ →  │   RUN   │ →  │ UPDATE  │      │
│  │         │    │  LAWS   │    │PIPELINES│    │ MEMORY  │      │
│  └─────────┘    └─────────┘    └─────────┘    └─────────┘      │
│       ↑                                             │           │
│       │         ┌─────────┐    ┌─────────┐         │           │
│       └─────────│GENERATE │ ← │  META   │ ←───────┘           │
│                 │ REPORT  │    │ ENGINE  │                      │
│                 └─────────┘    └─────────┘                      │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

**Governance Components:**

| Component | Function |
|-----------|----------|
| Ingest | Receive events, requests, signals |
| Apply Laws | Check against policies, rules |
| Run Pipelines | Execute transformation/enrichment |
| Update Memory | Persist state changes |
| Meta Engine | Self-governance, meta-decisions |
| Generate Report | Audit trail, compliance docs |

### Conscious Memory

Long-term storage for the conscious layer:

**Storage Types:**

| Type | Purpose | Implementation |
|------|---------|----------------|
| Laws | Policy definitions | KV / D1 |
| Policies | Governance rules | KV / D1 |
| Reports | Audit trails | R2 / D1 |
| Entity Registry | Known entities | D1 |
| Agent Profiles | Non-shadow profiles | KV / D1 |
| Knowledge Graph | Semantic relationships | D1 / Vectorize |

**Memory Schema:**

```javascript
// Entity in conscious memory
const consciousEntity = {
  id: 'entity-uuid',
  type: 'agent',
  firstSeen: 1234567890,
  lastSeen: 1234567899,
  profile: {
    userAgent: 'Mozilla/...',
    ipRange: 'x.x.x.0/24',
    behaviorClass: 'crawler'
  },
  governance: {
    lawsApplied: ['LAW-001', 'LAW-003'],
    lastAudit: 1234567895,
    complianceScore: 0.95
  },
  // NOTE: No shadow data here
  // Dark layer analysis exists separately
};
```

## Conscious Layer Invariants

1. **Everything is loggable**
   - All actions can produce log entries
   - All decisions traceable
   - All state changes recorded

2. **Everything is explainable**
   - Why was this request blocked?
   - Why was this entity classified as X?
   - Why did this pipeline run?

3. **Everything is subject to law**
   - Governance applies to all operations
   - No conscious action bypasses policy
   - Audit trail for all decisions

## Integration with Dark Layer

The conscious layer can invoke the dark layer, but cannot inspect it:

```javascript
// Conscious → Dark (via membrane)
async function consultDarkLayer(request, env) {
  const adapter = new CortexAdapter(env);
  
  // Send sanitized data only
  const analysis = await adapter.analyze({
    fingerprint: sanitizeFingerprint(request),
    context: sanitizeContext(request)
  });
  
  // Receive distilled output only
  // analysis = { riskScore: 0.87, tags: ['scanner'], action: 'block' }
  
  // Log that dark layer was consulted (but not what it said internally)
  console.log(JSON.stringify({
    type: 'dark-consultation',
    requestId: request.id,
    resultReceived: true
    // NOTE: Do not log analysis.tags or analysis.riskScore
  }));
  
  return analysis;
}
```

## Telemetry Events

Standard event types emitted by conscious layer:

```javascript
const EVENT_TYPES = {
  // Request lifecycle
  REQUEST_RECEIVED: 'request.received',
  REQUEST_CLASSIFIED: 'request.classified',
  REQUEST_ROUTED: 'request.routed',
  REQUEST_COMPLETED: 'request.completed',
  
  // Governance
  LAW_APPLIED: 'governance.law_applied',
  POLICY_CHECKED: 'governance.policy_checked',
  AUDIT_RECORDED: 'governance.audit_recorded',
  
  // Memory
  ENTITY_CREATED: 'memory.entity_created',
  ENTITY_UPDATED: 'memory.entity_updated',
  KNOWLEDGE_STORED: 'memory.knowledge_stored',
  
  // Protocol
  PROTOCOL_EXECUTED: 'protocol.executed',
  PROTOCOL_FAILED: 'protocol.failed',
  
  // Error
  ERROR_CAUGHT: 'error.caught',
  ERROR_RECOVERED: 'error.recovered'
};
```

## φ-Mathematics Integration

Conscious layer uses PHI for prioritization and scheduling:

```javascript
const PHI = 1.618033988749895;
const HB = 873;  // Heartbeat interval (ms)

// Priority weights
const PRIORITY_WEIGHTS = {
  critical: PHI * PHI,    // ≈2.618
  high: PHI,              // ≈1.618
  medium: 1,              // 1.0
  low: 1 / PHI            // ≈0.618
};

// Heartbeat scheduling
setInterval(() => {
  emitHeartbeat();
}, HB);
```

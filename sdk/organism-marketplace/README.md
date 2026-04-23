# @medina/organism-marketplace

> The marketplace is not just a storefront. It is a callable tool registry with routing, permissions, schemas, and SDK surfaces — wired into every layer of the organism. As above, so below.

## Architecture

The marketplace is three things at once:

1. **Registry** — A searchable map of callable tools, SDKs, organisms, and package ecosystems
2. **Protocol Surface** — A standard way for AIs, developers, apps, and other organisms to invoke calls
3. **Settlement Layer** — A usage, reward, billing, and token-routing layer for the calls

```
Intent → Router → Registry → Permission Check → Invoke → Validate → Settle
```

## The Four Conditions for AI Tool Use

AIs do not automatically "understand the market." They use tools reliably when four things are true:

| Condition | Component |
|---|---|
| Clear callable interface | `ToolSchemaBuilder` |
| Discoverable in a registry | `ToolRegistry` |
| Routed by policy/orchestration | `MarketplaceRouter` |
| Result in a usable schema | `ToolInvoker` |

## 20 Always-Running VOIS Tools

| Call ID | Tool Name | Ring | Purpose |
|---|---|---|---|
| TOOL-001 | PULSE-KEEPER | Sovereign | Monitor 873ms heartbeat pulse |
| TOOL-002 | SYNC-WEAVER | Sovereign | Phi-resonance Kuramoto synchronization |
| TOOL-003 | FLOW-MONITOR | Transport | Data flow throughput and bottlenecks |
| TOOL-004 | STATE-GUARDIAN | Sovereign | 4-register state integrity |
| TOOL-005 | CYCLE-COUNTER | Sovereign | Lifecycle cycle counting |
| TOOL-006 | INFER-ENGINE | Interface | AI model inference routing |
| TOOL-007 | PATTERN-SEEKER | Memory | Pattern detection in data streams |
| TOOL-008 | CONTEXT-BUILDER | Interface | Execution context assembly |
| TOOL-009 | ATTENTION-ROUTER | Interface | Attention and focus routing |
| TOOL-010 | MEMORY-CONSOLIDATOR | Memory | Memory branch consolidation |
| TOOL-011 | SENTINEL-WATCH | Counsel | Security monitoring |
| TOOL-012 | INTEGRITY-CHECKER | Proof | Data integrity verification |
| TOOL-013 | BOUNDARY-ENFORCER | Counsel | Ring boundary enforcement |
| TOOL-014 | ANOMALY-DETECTOR | Sovereign | Anomaly detection |
| TOOL-015 | SEAL-VERIFIER | Counsel | Cryptographic seal verification |
| TOOL-016 | RESOURCE-BALANCER | Sovereign | Phi-weighted resource allocation |
| TOOL-017 | CONNECTION-POOL | Transport | Connection pool management |
| TOOL-018 | CACHE-OPTIMIZER | Memory | Cache coherence optimization |
| TOOL-019 | QUEUE-PROCESSOR | Transport | Task queue processing |
| TOOL-020 | LOG-STREAMER | Transport | Real-time log streaming |

## Exposure Tiers

| Tier | Description |
|---|---|
| `INTERNAL` | Organism-only tools |
| `INTERNAL_SOVEREIGN` | Sovereign organism + trusted internal agents |
| `PARTNER` | Partner organisms and SDKs |
| `ENTERPRISE` | Enterprise customers |
| `PUBLIC` | Open marketplace |

## Usage

```javascript
import {
  ToolSchemaBuilder,
  ToolRegistry,
  ToolInvoker,
  MarketplaceSettlement,
  MarketplaceRouter,
  PulseKeeperSchema,
  pulseKeeperHandler,
} from '@medina/organism-marketplace';

// 1. Create registry and register tools
const registry = new ToolRegistry();
registry.register(PulseKeeperSchema);

// 2. Create invoker with permission checks
const invoker = new ToolInvoker(registry);
invoker.registerHandler('TOOL-001', pulseKeeperHandler);
invoker.grantPermission('agent-001', 'TOOL-001');

// 3. Wire settlement
const settlement = new MarketplaceSettlement();
invoker.onSettlement((result, schema) => settlement.record(result, schema));

// 4. Create router for orchestration-aware routing
const router = new MarketplaceRouter(registry, invoker);
router.mapIntent('check pulse', ['TOOL-001']);

// 5. Invoke through the standard call contract
const result = await router.routeAndInvoke(
  'check pulse',
  { action: 'status' },
  { principalId: 'agent-001' }
);
```

## Laws Enforced

- **AL-019**: Heartbeat sovereignty (873ms)
- **AL-020**: Register integrity
- **AL-025**: Intelligent routing
- **AL-026**: Wire encryption
- **AL-033**: Anti-collapse
- **AL-037–040**: Fracture → Primitive → Sovereign → Organism

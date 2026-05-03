# 🏛️ Atlas Universal Governance Layer

The governance layer implements the universal pattern for all entities in Atlas:
**bots, agents, organisms, realms, terminals** — everything plugs into this.

## Universal Pattern: Entity → Events → Laws → Pipelines → Memory → Meta

```
Any Entity (bot/agent/organism/realm)
     │
     ▼ emits
Universal Event Schema (governance/events/universal-event-schema.json)
     │
     ▼ stored in
dist/governance/events/<id>.json
     │
     ▼ ingested by
Atlas Governance Cycle (scripts/governance/governance-cycle.js)
     │
     ├─ Step 1: Ingest Events   (group by entity/division/domain)
     ├─ Step 2: Apply Laws      (CPL-L evaluation — 5 law sets)
     ├─ Step 3: Run Pipelines   (domain-specific CPL-P pipelines)
     ├─ Step 4: Update Memory   (law stats, pipeline stats, RIL, UEL)
     ├─ Step 5: Meta Engine     (pattern detection → proposals)
     └─ Step 6: Generate Report (docs/governance-report.md)
```

## Domain-Specific Pipelines

| Domain | Pipeline | Law Set | Entities |
|---|---|---|---|
| **bot** | `bot_cycle` | `BOT_FLEET_SAFETY` | All 16 fleet bots |
| **economy** | `economy_cycle` | `ECONOMY_HEALTH` | economy-bot, deps-bot |
| **learning** | `learning_cycle` | `LEARNING_STABILITY` | learning-bot |
| **topology** | `topology_cycle` | `TOPOLOGY_INTEGRITY` | crawler-bot |
| **meta** | `meta_cycle` | `META_EVOLUTION` | Meta Engine |
| **default** | `default_cycle` | all | Any new entity |

## Directory Structure

```
governance/
├── README.md                          ← This file
├── events/
│   └── universal-event-schema.json    ← JSON Schema for all events
├── organism/
│   └── bot-fleet.ocl                  ← Shared OCL charter (17 bots)
├── laws/
│   ├── bot-fleet.cpl-l                ← 8 bot safety laws
│   ├── economy.cpl-l                  ← 4 economy laws
│   ├── learning.cpl-l                 ← 4 learning stability laws
│   ├── topology.cpl-l                 ← 4 topology integrity laws
│   └── meta.cpl-l                     ← 4 Meta Engine laws
├── pipelines/
│   ├── default-cycle.cpl-p            ← Universal governance pattern
│   ├── bot-governance.cpl-p           ← Bot domain pipeline
│   ├── economy-cycle.cpl-p            ← Economy domain pipeline
│   ├── learning-cycle.cpl-p           ← Learning domain pipeline
│   └── topology-cycle.cpl-p           ← Topology domain pipeline
├── memory/                            ← Governance memory (auto-updated)
│   ├── law-stats.json                 ← MML: law fire counts per rule
│   ├── pipeline-stats.json            ← MML: pipeline outcomes per domain
│   ├── ril.json                       ← RIL: incident log (FORBID/ESCALATE)
│   ├── uel.json                       ← UEL: universe evolution log
│   └── topology-baseline.json         ← Topology: file count baseline
├── proposals/                         ← Meta Engine evolution proposals
│   └── proposals-YYYY-MM-DD.json
└── feedback/
    ├── schema.yaml                    ← Human feedback record schema
    └── records/
        └── fb-YYYY-MM-DD-NNN.yaml    ← Override records
```

## Universal Event Schema

Every entity emits events in this shape:

```json
{
  "id": "evt-2026-05-03T04:30:00.000Z-001",
  "entity_id": "atlas://bot/organism-alpha-bot",
  "op": "fleet_census_completed",
  "ts": "2026-05-03T04:30:00.000Z",
  "context": {
    "status": "pass",
    "risk_score": 0.05,
    "health_dashboard": { "overall": "green", "healthy": 17, "total": 17 }
  },
  "tags": ["bot", "alpha", "census", "division-vii"],
  "schema_version": "1.0.0"
}
```

Emit from any script:
```js
const { emitEvent } = require('./scripts/governance/emit-event');
emitEvent('atlas://bot/my-bot', 'ci_run_completed', { status: 'pass', risk_score: 0.1 }, ['bot']);
```

## PHI Constants (never change these)

| Constant | Value | Usage |
|---|---|---|
| `PHI` | 1.618033988749895 | All phi-weighted math |
| `HEARTBEAT` | 873ms | Organism pulse |
| Block threshold | 1/φ² ≈ 0.382 | Hard stop |
| Escalate threshold | 1/φ ≈ 0.618 | Human review |
| Emergence threshold | 1/φ ≈ 0.618 | Learning milestone |

## Adding a New Entity

Every new thing you add (bot, agent, runtime, division) just:

1. **Register** as an Atlas entity in `atlas/registry/entities/<name>.json`
2. **Emit** events using `scripts/governance/emit-event.js`
3. **Get laws** — add rules to an existing `.cpl-l` or create a new one
4. **Get a pipeline** — bind to an existing domain pipeline or create a new `<domain>-cycle.cpl-p`
5. **That's it** — the governance cycle picks it up automatically

## Human Feedback

When a bot is BLOCKED or ESCALATED, create an override:

```yaml
# governance/feedback/records/fb-2026-MM-DD-NNN.yaml
id: "fb-2026-05-03-001"
actor: "human://freddy"
target:
  entity: "atlas://bot/organism-release-bot"
  law_id: "BOT_FLEET_SAFETY"
  rule_name: "RELEASE_NO_RED_HEALTH"
decision: { system: FORBID, human: ALLOW }
rationale: "Red due to flaky visual tests only — safe to release."
```

After 3 identical overrides, the Meta Engine proposes a law relaxation.

---

*Governance layer maintained by organism-governance-bot 🌐 · organism-alpha-bot 👑*


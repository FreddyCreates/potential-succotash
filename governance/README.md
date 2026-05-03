# 🏛️ Organism Governance Layer

The governance layer defines how the 16-bot fleet operates as a coherent,
law-bound organism. It uses four domain-specific languages:

| Language | File Extension | Purpose |
|---|---|---|
| **OCL** | `.ocl` | Organism Charter Language — defines capabilities, limits, drives |
| **CPL-L** | `.cpl-l` | Capability Policy Language (Laws) — conditional if/then rules |
| **CPL-P** | `.cpl-p` | Capability Policy Language (Pipelines) — ordered execution steps |
| **Human Feedback** | `.yaml` in `feedback/records/` | Override records for law decisions |

## Directory Structure

```
governance/
├── organism/
│   └── bot-fleet.ocl          # Shared charter for all 16 bots
├── laws/
│   └── bot-fleet.cpl-l        # Safety laws (SENTINEL, RELEASE, SANDCASTLE, etc.)
├── pipelines/
│   └── bot-governance.cpl-p   # Master governance cycle pipeline
└── feedback/
    ├── schema.yaml             # Human feedback record schema
    └── records/
        └── fb-YYYY-MM-DD-NNN.yaml   # Override records
```

## How It Works

```
Every CI Event
     │
     ▼
┌─────────────────────────────────┐
│  CPL-P: collect_state           │  ← Reads all bot reports from docs/
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│  CPL-L: evaluate_laws           │  ← Checks BOT_FLEET_SAFETY conditions
└────────────┬────────────────────┘
             ▼
┌─────────────────────────────────┐
│  Calculate phi-risk score       │  ← risk = f(decisions, PHI)
└────────────┬────────────────────┘
             │
    ┌────────┼────────┐
    ▼        ▼        ▼
  ALLOW    WARN    BLOCK/ESCALATE
    │        │        │
    ▼        ▼        ▼
 Proceed  Log+Warn  → human://freddy
```

## PHI Constants

All risk thresholds use phi-normalized values:
- **Block threshold**: `1/φ² ≈ 0.382`
- **Escalation threshold**: `1/φ ≈ 0.618`
- **Emergence threshold**: `1/φ ≈ 0.618`

PHI = 1.618033988749895 — never use arbitrary constants.

## Bot Entities

All 16 bots are registered as Atlas entities in `../atlas/registry/entities/`.
Each entity declares:
- `id`: `atlas://bot/<name>`
- `class`: `Bot`
- `division`: Which of the 7 divisions it belongs to
- `languages`: Which governance languages it speaks (OCL, CPL-L, etc.)
- `governance_pipeline`: Points to `pipeline://governance/bot_cycle`

## Human Feedback

When a bot is BLOCKED or ESCALATED, create an override record:

```yaml
# governance/feedback/records/fb-2026-MM-DD-NNN.yaml
id: "fb-2026-05-03-001"
actor: "human://freddy"
target:
  entity: "atlas://bot/organism-release-bot"
  law_id: "BOT_FLEET_SAFETY"
  rule_name: "RELEASE_NO_RED_HEALTH"
decision:
  system: FORBID
  human: ALLOW
rationale: "Red due to flaky visual tests only — safe to release."
```

After 3 identical overrides, the Meta Engine will propose a law relaxation.

---

*Governance layer maintained by organism-alpha-bot 👑*

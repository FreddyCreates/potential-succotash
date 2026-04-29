# Wyoming Master Charter — ICP Infrastructure

Sovereign Gen 3 node provider infrastructure for **Bad Marine LLC** — the veteran-owned company establishing ICP nodes in the US Midwest.

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ICP CANISTER STACK                           │
├─────────────────────────────────────────────────────────────────┤
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   FRNT      │  │  Settlement │  │   Node      │            │
│  │   Token     │  │  Engine     │  │  Registry   │            │
│  │  (ICRC-1)   │  │  (<0.3s)    │  │  (50 nodes) │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                         │                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              GRANT TRACKER                              │  │
│  │  (E-Rate, NSF, USDA, SBIR — $2.15M-$11.25M pipeline)   │  │
│  └─────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────┘
```

## Quick Start

### 1. Deploy Canisters to Local Replica

```bash
cd wyoming-charter
./deploy.sh local
```

### 2. Deploy to ICP Mainnet

```bash
# Ensure you have cycles
dfx identity use wyoming-charter
dfx ledger balance

# Deploy
./deploy.sh ic
```

### 3. Start Backend Server

```bash
cd backend
npm install
npm run dev
```

The API server runs on port **3873** (873ms heartbeat reference).

## Canisters

| Canister | Description | Key Functions |
|----------|-------------|---------------|
| `frnt_token` | ICRC-1 compliant FRNT token | `icrc1_transfer`, `mint`, `burn` |
| `settlement_engine` | Sub-second atomic settlements | `settle`, `settleBatch`, `getStats` |
| `node_registry` | 50-node Neural Emergence Grid | `registerNode`, `activateNode`, `getGridStats` |
| `grant_tracker` | Federal/state grant pipeline | `addGrant`, `markSubmitted`, `getPipelineStats` |

## Backend API

### Settlement Endpoints

```
POST /api/settle              # Initiate FRNT settlement
GET  /api/settlement/:id      # Get settlement status
GET  /api/settlement/stats    # Engine statistics
GET  /api/settlement/compare  # FRNT vs Visa/Kraken comparison
```

### Node Endpoints

```
GET /api/nodes                # All 50 nodes
GET /api/nodes/stats          # Grid statistics
GET /api/nodes/:id            # Single node details
GET /api/nodes/state/:state   # Nodes by state (Wyoming, Nebraska, Texas)
```

### Grant Endpoints

```
GET  /api/grants              # All grants in pipeline
GET  /api/grants/stats        # Pipeline totals
POST /api/grants/:id/submit   # Mark grant submitted
POST /api/grants/:id/award    # Mark grant awarded
```

### Legislative Dashboard

```
GET /api/legislative/demo        # Full demo data for legislators
GET /api/legislative/milestones  # Timeline with critical deadlines
GET /api/legislative/comparison  # Settlement speed/cost comparison
```

## Key Milestones

| Date | Milestone | Critical |
|------|-----------|----------|
| Q2 2026 | FRNT/ICP Liquidity Pool Live | ✅ |
| Aug 2026 | Hardware in Lincoln Vault | ✅ |
| Oct 2026 | Wyoming Meeting (Andy + Regulators) | ✅ |
| **Nov 2026** | **Hardware Visible to Legislators** | ✅ |
| Jan 2027 | Nebraska Unicameral Bill Ready | |

## Settlement Comparison

| Metric | Visa/Kraken | FRNT (Phantom) |
|--------|-------------|----------------|
| Settlement Time | 15+ minutes | **~0.3 seconds** |
| Transaction Fee | 3-5% | **<0.1%** |
| Intermediaries | 3+ | **0** |
| Sovereignty | ❌ | ✅ |

## Files

```
wyoming-charter/
├── MASTER_CHARTER.md           # Full strategic plan
├── dfx.json                    # ICP canister config
├── deploy.sh                   # Deployment script
├── canisters/
│   └── src/
│       ├── FRNTToken.mo        # ICRC-1 token
│       ├── SettlementEngine.mo # Atomic settlement
│       ├── NodeRegistry.mo     # 50-node grid
│       └── GrantTracker.mo     # Grant pipeline
├── backend/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── index.ts            # Express API server
│       └── services/
│           ├── settlement-relay.ts
│           ├── node-health-monitor.ts
│           ├── grant-automation.ts
│           └── legislative-dashboard.ts
└── architecture/               # Design docs (future)
```

## License

Proprietary — Bad Marine LLC

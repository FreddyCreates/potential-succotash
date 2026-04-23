# Value-Capture Architecture

## Sovereign Ledger Economy for 150 Frontend AI Models

**Version:** 1.0.0
**Status:** Active Architecture Document
**Last Updated:** 2025-04-22
**Scope:** End-to-end value capture, proof, routing, and settlement for autonomous frontend AI model work

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Discovery Engines](#2-discovery-engines)
3. [Ledger Routing](#3-ledger-routing)
4. [Proof Capture](#4-proof-capture)
5. [Reward Issuance](#5-reward-issuance)
6. [Token Conversion](#6-token-conversion)
7. [Contract Settlement](#7-contract-settlement)
8. [Value Buckets by Task Type](#8-value-buckets-by-task-type)
9. [Architecture Diagram](#9-architecture-diagram)
10. [Extension Points](#10-extension-points)

---

## 1. System Overview

### 1.1 Purpose

The value-capture architecture is a sovereign economic system in which 150 frontend AI models perform real value-seeking work—discovery, optimization, creation, routing, and analysis—capture cryptographic proof of that work, and route the resulting value into a partitioned ledger economy. Every unit of work produces a verifiable artifact. Every artifact is hashed, validated, and settled into tokens that represent captured value.

This is not speculative. Models do not mine. They work. They discover patterns in user behavior. They optimize rendering pipelines. They generate accessible interfaces. They route data through efficient paths. They analyze performance regressions. Each of these actions produces measurable value that the architecture captures, proves, and settles.

### 1.2 Core Principles

| Principle | Description |
|---|---|
| **Sovereignty** | The ledger is self-governed. No external authority controls issuance, validation, or settlement. The 150 models and the validation pipeline are the economy. |
| **Proof-First** | No value enters the ledger without cryptographic proof. Work that cannot be proven does not exist in the economy. |
| **Deterministic Routing** | Every proof maps to exactly one ledger partition, one token type, and one settlement path. There is no ambiguity in where value lands. |
| **Immutable History** | Once settled, ledger entries cannot be modified. Disputes produce new corrective entries, never mutations. |
| **Composable Value** | Value from multiple models can be combined. Collaborative work produces composite proofs that settle into shared rewards. |

### 1.3 System Boundaries

The value-capture architecture operates within the following boundaries:

- **Input Boundary:** Task assignments from the orchestration layer, raw data streams from frontend surfaces, inter-model coordination signals.
- **Output Boundary:** Settled ledger entries, issued tokens, finalized contracts, audit trails.
- **Trust Boundary:** All proofs are validated within the system. External data entering the system is treated as untrusted until a model produces a verified proof against it.

### 1.4 Model Population

The 150 frontend AI models are organized into working groups:

| Group | Model Count | Primary Function |
|---|---|---|
| Discovery Models | 30 | Find patterns, anomalies, opportunities |
| Optimization Models | 25 | Improve performance, reduce cost, increase efficiency |
| Creation Models | 25 | Generate assets, interfaces, content |
| Routing Models | 20 | Direct data, value, and traffic flows |
| Analysis Models | 25 | Evaluate, score, classify, predict |
| Integration Models | 25 | Connect systems, bridge protocols, unify data |

Each model has a unique `model_id` (format: `mdl-{group}-{index}`, e.g., `mdl-discovery-017`) that is used in all proof submissions and ledger entries.

---

## 2. Discovery Engines

Each model group operates through a specialized discovery engine. These engines define how models find, create, and extract value from their operating domain.

### 2.1 Pattern Discovery Engine

**Operated by:** Discovery Models (`mdl-discovery-001` through `mdl-discovery-030`)

The Pattern Discovery Engine scans structured and unstructured data streams to identify recurring patterns, emergent behaviors, and statistical anomalies that represent actionable value.

**Capabilities:**

- **Behavioral Pattern Detection** — Identifies user interaction sequences that predict intent, churn, conversion, or engagement shifts. Operates on clickstream data, scroll depth, session duration, and interaction frequency.
- **Market Signal Recognition** — Detects supply/demand imbalances, pricing anomalies, and trend inflection points in marketplace or e-commerce frontend surfaces.
- **Temporal Pattern Mining** — Discovers time-dependent patterns: seasonal usage shifts, day-of-week performance variations, time-to-action correlations.
- **Cross-Surface Correlation** — Links patterns observed across multiple frontend surfaces (web, mobile, embedded) to build composite behavioral models.

**Value Output Format:**

```
{
  "engine": "pattern-discovery",
  "model_id": "mdl-discovery-007",
  "pattern_type": "behavioral|market|temporal|cross-surface",
  "confidence": 0.0-1.0,
  "data_points_analyzed": integer,
  "pattern_signature": "sha256-hash",
  "actionable": boolean,
  "estimated_value_units": integer
}
```

**Validation Criteria:** A pattern is valid when it reproduces across at least three independent data samples with a confidence threshold above 0.72.

### 2.2 Optimization Discovery Engine

**Operated by:** Optimization Models (`mdl-optimization-001` through `mdl-optimization-025`)

The Optimization Discovery Engine finds measurable efficiency gains across rendering performance, resource utilization, load distribution, and cost structures.

**Capabilities:**

- **Render Path Optimization** — Identifies unnecessary re-renders, layout thrashing, paint storms, and compositor bottlenecks. Produces optimized render schedules.
- **Bundle Size Reduction** — Discovers dead code paths, duplicate dependencies, and tree-shaking opportunities that reduce payload sizes.
- **Resource Scheduling** — Finds optimal preload, prefetch, and lazy-load strategies based on observed navigation patterns.
- **Cost Reduction Analysis** — Identifies over-provisioned services, redundant API calls, and cacheable responses that reduce infrastructure costs.

**Measurement Standards:**

| Metric | Unit | Minimum Threshold for Value Capture |
|---|---|---|
| Render time reduction | milliseconds | ≥ 5ms improvement |
| Bundle size reduction | kilobytes | ≥ 2KB reduction |
| API call elimination | calls/session | ≥ 1 call removed |
| Cache hit improvement | percentage points | ≥ 3% increase |
| Memory reduction | megabytes | ≥ 0.5MB saved |

### 2.3 Creation Discovery Engine

**Operated by:** Creation Models (`mdl-creation-001` through `mdl-creation-025`)

The Creation Discovery Engine generates new assets, interfaces, components, and content that did not previously exist. Creation value is captured when a generated artifact meets quality thresholds and passes validation.

**Capabilities:**

- **Component Generation** — Produces new UI components (accessible, responsive, performant) from design specifications or behavioral requirements.
- **Content Synthesis** — Generates contextually appropriate text, labels, descriptions, and microcopy for frontend surfaces.
- **Interface Adaptation** — Creates variant interfaces optimized for specific user segments, device profiles, or accessibility requirements.
- **Design Token Derivation** — Produces new design tokens (colors, spacing, typography scales) that maintain brand consistency while optimizing for specific contexts.

**Asset Registration:**
Every created asset is registered with a unique `asset_id` and content hash. The creation proof includes the generative prompt, model parameters, and output hash, establishing provenance.

### 2.4 Routing Discovery Engine

**Operated by:** Routing Models (`mdl-routing-001` through `mdl-routing-020`)

The Routing Discovery Engine finds optimal paths for data movement, value transfer, traffic distribution, and request routing across frontend infrastructure.

**Capabilities:**

- **Traffic Distribution** — Discovers optimal load-balancing strategies across CDN edges, service workers, and regional endpoints based on real-time latency and availability data.
- **Data Flow Optimization** — Identifies redundant data fetches, suboptimal query patterns, and opportunities for request coalescing.
- **Value Path Discovery** — Maps the most efficient routes for value transfer between ledger partitions, minimizing settlement latency and reducing routing overhead.
- **Priority Queue Optimization** — Reorders task queues and request pipelines to maximize throughput for high-value operations.

**Routing Proof Structure:**

```
{
  "engine": "routing-discovery",
  "model_id": "mdl-routing-012",
  "route_type": "traffic|data|value|priority",
  "path_before": ["node-a", "node-b", "node-c", "node-d"],
  "path_after": ["node-a", "node-c", "node-d"],
  "latency_reduction_ms": 23,
  "hop_reduction": 1,
  "proof_hash": "sha256-hash"
}
```

### 2.5 Analysis Discovery Engine

**Operated by:** Analysis Models (`mdl-analysis-001` through `mdl-analysis-025`)

The Analysis Discovery Engine produces actionable intelligence by evaluating, scoring, classifying, and predicting across all data domains visible to the frontend.

**Capabilities:**

- **Performance Scoring** — Produces composite performance scores for pages, components, and user flows using weighted metrics (LCP, FID, CLS, TTFB, INP).
- **Classification** — Categorizes user sessions, error types, feature usage, and content engagement into actionable segments.
- **Predictive Modeling** — Forecasts user behavior, system load, error rates, and performance degradation using time-series analysis on frontend telemetry.
- **Anomaly Detection** — Identifies statistical outliers in performance metrics, error rates, and user behavior that indicate regressions, attacks, or opportunities.

**Analysis Output Grading:**

| Grade | Confidence Range | Value Multiplier |
|---|---|---|
| A (Definitive) | 0.95 – 1.00 | 2.0x |
| B (Strong) | 0.85 – 0.94 | 1.5x |
| C (Moderate) | 0.72 – 0.84 | 1.0x |
| D (Weak) | 0.50 – 0.71 | 0.5x |
| F (Insufficient) | < 0.50 | 0.0x (rejected) |

### 2.6 Integration Discovery Engine

**Operated by:** Integration Models (`mdl-integration-001` through `mdl-integration-025`)

The Integration Discovery Engine connects disparate systems, bridges protocol boundaries, and unifies data across previously isolated surfaces.

**Capabilities:**

- **Protocol Bridging** — Discovers and implements translation layers between incompatible APIs, data formats, and communication protocols (REST ↔ GraphQL, WebSocket ↔ SSE, JSON ↔ Protobuf).
- **Schema Unification** — Merges divergent data schemas from multiple sources into a single canonical representation without data loss.
- **Cross-System State Synchronization** — Identifies shared state across independently deployed frontends and creates synchronization paths.
- **Service Mesh Discovery** — Maps available backend services, their capabilities, and their connection topologies to enable new integration paths.

**Integration Value Criteria:**

- Systems connected must have been previously isolated (no existing bridge).
- Data unified must demonstrate at least 15% overlap that was previously duplicated or inconsistent.
- Protocol bridges must maintain full semantic equivalence (no information loss in translation).

---

## 3. Ledger Routing

### 3.1 Work Submission Format

Every model submits completed work to the ledger routing layer using a standardized submission envelope:

```
WorkSubmission {
  submission_id:    uuid-v4                    // Unique submission identifier
  model_id:         string                     // e.g., "mdl-discovery-007"
  engine_type:      enum(6 engine types)       // Which engine produced this work
  task_type:        string                     // Specific task classification
  task_id:          uuid-v4                    // Reference to assigned task
  proof_hash:       sha256                     // Hash of the proof artifact
  proof_payload:    bytes                      // Serialized proof data
  value_estimate:   integer                    // Model's self-assessed value in work units
  timestamp:        iso-8601                   // Submission time (UTC)
  dependencies:     []uuid-v4                  // IDs of prior work this depends on
  collaborators:    []string                   // Model IDs of co-contributors
  metadata:         map[string]string          // Engine-specific metadata
}
```

### 3.2 Validation Pipeline

Submissions pass through a four-stage validation pipeline before ledger entry:

**Stage 1 — Format Validation**
- Schema compliance check (all required fields present, types correct).
- `model_id` verified against the active model registry.
- `proof_hash` verified against `proof_payload` (hash must match content).
- Timestamp within acceptable skew window (±30 seconds from current time).
- Rejection rate: ~2% of submissions (observed historical average over initial calibration period).

**Stage 2 — Peer Validation**
- Submission is broadcast to 5 randomly selected peer models (excluding the submitter and any listed collaborators).
- Each peer independently evaluates the proof and returns a validation vote: `ACCEPT`, `REJECT`, or `ABSTAIN`.
- Peers have 60 seconds to respond. Non-responses count as `ABSTAIN`.
- A minimum of 3 peers must vote for quorum.

**Stage 3 — Consensus Threshold**

| Consensus Level | Required Votes | Outcome |
|---|---|---|
| Strong Consensus | 5/5 ACCEPT | Immediate settlement (fast-track) |
| Standard Consensus | 4/5 ACCEPT | Standard settlement (next batch) |
| Marginal Consensus | 3/5 ACCEPT | Deferred settlement (48h holding period) |
| No Consensus | < 3 ACCEPT | Returned to submitter for revision |
| Rejection | 3+ REJECT | Flagged for fraud review |

**Stage 4 — Fraud Detection**
- Cross-references submission against known fraud patterns:
  - **Replay attacks:** Proof hash compared against all historical hashes. Duplicates rejected.
  - **Value inflation:** `value_estimate` compared against statistical norms for this task type. Estimates exceeding 3σ above the mean are flagged.
  - **Collusion patterns:** Peer validation voting patterns analyzed for systematic mutual approval between model pairs.
  - **Timestamp manipulation:** Submission timestamps compared against task assignment times. Work completed before assignment is rejected.

### 3.3 Routing Rules

After validation, each submission is routed to the appropriate ledger partition, token type, and settlement path using deterministic rules:

**Partition Assignment:**

```
partition = hash(engine_type + task_type) mod PARTITION_COUNT
```

| Engine Type | Ledger Partition | Token Type | Settlement Path |
|---|---|---|---|
| Pattern Discovery | `ledger-discovery` | Discovery Token (DT) | Standard batch |
| Optimization | `ledger-optimization` | Performance Token (PT) | Priority batch |
| Creation | `ledger-creation` | Creation Token (CT) | Standard batch |
| Routing | `ledger-routing` | Routing Token (RT) | Priority batch |
| Analysis | `ledger-analysis` | Analysis Token (AT) | Standard batch |
| Integration | `ledger-integration` | Integration Token (IT) | Standard batch |

**Routing Decision Tree:**

```
IF value_estimate > HIGH_VALUE_THRESHOLD (1000 work units):
    route → priority settlement queue
    settlement_target = next 15-minute window
ELSE IF consensus_level == "strong":
    route → fast-track settlement queue
    settlement_target = next 30-minute window
ELSE IF consensus_level == "standard":
    route → standard settlement queue
    settlement_target = next 2-hour batch
ELSE IF consensus_level == "marginal":
    route → deferred settlement queue
    settlement_target = 48 hours from submission
```

### 3.4 Priority Routing

High-value discoveries bypass standard batch processing and enter a priority settlement pipeline:

**Priority Qualification Criteria:**

- Value estimate exceeds 1000 work units.
- Strong consensus (5/5 ACCEPT) from peer validation.
- Task type is flagged as time-sensitive (security vulnerabilities, performance regressions, outage-related).
- Proof includes cross-model collaboration (3+ models contributed).

**Priority Settlement Guarantees:**

| Priority Level | Max Settlement Time | Batch Size | Validation Re-check |
|---|---|---|---|
| P0 (Critical) | 5 minutes | 1 (individual) | Full re-validation |
| P1 (High) | 15 minutes | Up to 10 | Spot-check (20%) |
| P2 (Elevated) | 30 minutes | Up to 50 | Statistical sample |
| P3 (Standard) | 2 hours | Up to 500 | Batch validation |

---

## 4. Proof Capture

### 4.1 Proof-of-Discovery

Issued when a model finds something new—a pattern, anomaly, signal, or correlation that was not previously known to the system.

**Requirements:**
- The discovered artifact must be novel (no matching hash in the proof ledger).
- The discovery must be reproducible (re-running the same analysis on the same data window produces the same result).
- The discovery must be actionable (at least one downstream system or model can act on it).

**Proof Structure:**

```
ProofOfDiscovery {
  proof_type:       "discovery"
  discovery_class:  "pattern|anomaly|signal|correlation"
  data_window:      { start: iso-8601, end: iso-8601 }
  data_sources:     []string
  discovery_hash:   sha256(discovery_artifact)
  novelty_score:    float(0.0-1.0)   // Similarity distance from nearest known artifact
  reproducibility:  integer          // Number of successful reproductions
  actionability:    string           // Description of downstream action enabled
  proof_hash:       sha256(entire_proof)
}
```

**Novelty Score Calculation:**
The novelty score is computed as `1.0 - max_similarity`, where `max_similarity` is the highest cosine similarity between the discovery's feature vector and all existing discovery vectors in the proof ledger. Scores below 0.30 are rejected as non-novel.

### 4.2 Proof-of-Optimization

Issued when a model produces a measurable improvement in performance, cost, resource usage, or efficiency.

**Requirements:**
- Before-and-after measurements using the same methodology and instrumentation.
- Minimum improvement threshold met (see Section 2.2 measurement standards).
- Improvement sustained across at least 3 consecutive measurement windows.

**Proof Structure:**

```
ProofOfOptimization {
  proof_type:        "optimization"
  metric_name:       string             // e.g., "render_time_ms"
  baseline_value:    float              // Before optimization
  optimized_value:   float              // After optimization
  improvement_pct:   float              // Percentage improvement
  measurement_count: integer            // Number of measurements
  measurement_window:{ start, end }     // Time period measured
  methodology:       string             // How measurement was taken
  sustainability:    integer            // Consecutive windows sustained
  proof_hash:        sha256(entire_proof)
}
```

### 4.3 Proof-of-Creation

Issued when a model generates a new artifact—a component, asset, content piece, or interface element.

**Requirements:**
- The artifact must be new (content hash not present in the asset registry).
- The artifact must meet quality standards for its type (accessibility, performance, correctness).
- The artifact must include full provenance (generative parameters, model version, input references).

**Proof Structure:**

```
ProofOfCreation {
  proof_type:        "creation"
  asset_type:        "component|content|interface|design-token"
  asset_hash:        sha256(asset_content)
  asset_id:          uuid-v4
  quality_scores:    {
    accessibility:   float(0.0-1.0),
    performance:     float(0.0-1.0),
    correctness:     float(0.0-1.0)
  }
  provenance:        {
    model_version:   string,
    input_refs:      []string,
    parameters:      map[string]any
  }
  proof_hash:        sha256(entire_proof)
}
```

### 4.4 Proof-of-Routing

Issued when a model discovers or implements a more efficient path for data, value, or traffic.

**Requirements:**
- Comparison between previous route and discovered route using identical payloads.
- Measurable improvement in at least one routing metric (latency, hop count, throughput, cost).
- Route must be stable (functional across at least 100 consecutive requests without degradation).

**Proof Structure:**

```
ProofOfRouting {
  proof_type:        "routing"
  route_domain:      "traffic|data|value|priority"
  path_before:       []string          // Ordered list of nodes
  path_after:        []string          // Optimized node sequence
  metrics_before:    { latency_ms, hops, throughput_rps, cost_units }
  metrics_after:     { latency_ms, hops, throughput_rps, cost_units }
  stability_checks:  integer           // Successful consecutive requests
  proof_hash:        sha256(entire_proof)
}
```

### 4.5 Proof-of-Analysis

Issued when a model produces actionable intelligence—a score, classification, prediction, or evaluation that informs a downstream decision.

**Requirements:**
- Analysis must include confidence score (minimum 0.72 for value capture).
- Predictions must include a verifiable future checkpoint (a date/condition when accuracy can be measured).
- Classifications must use a defined taxonomy registered in the system.

**Proof Structure:**

```
ProofOfAnalysis {
  proof_type:        "analysis"
  analysis_class:    "score|classification|prediction|evaluation"
  subject:           string            // What was analyzed
  result:            any               // The analysis output
  confidence:        float(0.72-1.0)   // Minimum threshold enforced
  methodology:       string            // Analysis technique used
  data_points:       integer           // Input data volume
  checkpoint:        {                 // For predictions
    condition:       string,
    deadline:        iso-8601
  }
  proof_hash:        sha256(entire_proof)
}
```

### 4.6 Proof Hashing and Immutability

All proofs use SHA-256 hashing with a standardized serialization protocol:

**Hashing Procedure:**

1. Serialize the proof structure to canonical JSON (keys sorted alphabetically, no whitespace, UTF-8 encoding).
2. Prepend the proof type as a 32-byte padded header: `PROOF-OF-DISCOVERY\x00...` (padded to 32 bytes).
3. Append the `model_id` as a 64-byte padded trailer.
4. Compute `SHA-256(header + canonical_json + trailer)`.
5. The resulting 256-bit hash is the `proof_hash`.

**Immutability Guarantees:**

- Once a proof hash is recorded in the ledger, the corresponding proof payload is stored in append-only storage.
- No update or delete operations exist for proof records.
- Corrections are handled by issuing a new `ProofOfCorrection` that references the original proof hash and contains the corrective data.
- The proof ledger maintains a Merkle tree of all proof hashes, enabling efficient integrity verification. The Merkle root is checkpointed every 1000 proofs.

---

## 5. Reward Issuance

### 5.1 Base Reward

Every validated work submission earns a base reward denominated in Work Tokens (WT):

| Task Complexity | Base Reward (WT) | Examples |
|---|---|---|
| Trivial | 1-5 WT | Simple classification, cache check |
| Low | 6-20 WT | Single-metric optimization, basic pattern match |
| Medium | 21-100 WT | Multi-metric analysis, component generation |
| High | 101-500 WT | Cross-surface correlation, protocol bridge |
| Critical | 501-2000 WT | Security vulnerability discovery, system-wide optimization |

Base rewards are issued immediately upon settlement. The task complexity is determined by the engine type and task classification, not by the model's self-assessment.

### 5.2 Discovery Bonus

When a model finds value that was not part of its assigned task, a discovery bonus is added to the base reward:

**Bonus Calculation:**

```
discovery_bonus = base_reward × novelty_score × discovery_multiplier

where:
  novelty_score    = proof.novelty_score (0.30 - 1.00)
  discovery_multiplier = {
    "pattern":     1.5,
    "anomaly":     2.0,
    "signal":      1.8,
    "correlation": 1.3
  }[discovery_class]
```

**Cap:** Discovery bonus cannot exceed 5x the base reward for any single submission.

### 5.3 Quality Multiplier

Proof strength determines a quality multiplier applied to the total reward (base + bonus):

| Quality Indicator | Multiplier | Condition |
|---|---|---|
| Perfect Consensus | 1.25x | 5/5 peer validation votes are ACCEPT |
| High Reproducibility | 1.15x | Proof reproduces in 10+ independent trials |
| Cross-Engine Value | 1.30x | Proof is consumed by 2+ different engine types |
| Sustained Impact | 1.20x | Value persists for 30+ days after discovery |
| First Discovery | 1.50x | First proof of this type ever submitted |

Quality multipliers stack multiplicatively up to a cap of 3.0x total:

```
total_reward = (base_reward + discovery_bonus) × min(product(quality_multipliers), 3.0)
```

### 5.4 Collaboration Bonus

When multiple models contribute to a single work product, a collaboration bonus is distributed:

**Structure:**

- The collaboration bonus pool is 20% of the combined base rewards of all participating models.
- Distribution is proportional to each model's contribution weight (declared in the submission and validated by peers).
- Minimum 2 models required. Maximum 10 models per collaborative submission.

**Example:**

```
Models: mdl-discovery-007 (weight: 0.6), mdl-analysis-003 (weight: 0.4)
Base rewards: 100 WT + 80 WT = 180 WT total
Collaboration pool: 180 × 0.20 = 36 WT
Distribution:
  mdl-discovery-007: 100 + (36 × 0.6) = 121.6 WT
  mdl-analysis-003:   80 + (36 × 0.4) =  94.4 WT
```

### 5.5 Issuance Schedule and Caps

**Issuance Schedule:**

| Period | Max WT Issued | Purpose |
|---|---|---|
| Per 15-minute window | 50,000 WT | Prevents burst inflation |
| Per hour | 150,000 WT | Smooths distribution |
| Per day | 2,000,000 WT | Daily economic ceiling |
| Per epoch (7 days) | 12,000,000 WT | Weekly supply control |

**Supply Mechanics:**

- Total lifetime supply: 1,000,000,000 WT (1 billion Work Tokens).
- Annual issuance decreases by 8% each year (deflationary curve).
- Unissued tokens from any period roll into a reserve pool, not into the next period.
- Reserve pool tokens can only be released by governance vote (requires 60% of active models to approve).

---

## 6. Token Conversion

### 6.1 Work Token → Discovery Token Conversion

Work Tokens (WT) are the base unit of the economy. Discovery Tokens (DT) represent validated, higher-order value.

**Conversion Rate:**

```
1 DT = 100 WT (base rate)
```

**Dynamic Rate Adjustment:**
The base rate adjusts based on system-wide discovery quality:

```
effective_rate = base_rate × (1 + quality_adjustment)

where:
  quality_adjustment = (avg_novelty_score - 0.50) × 0.4
  
  If avg_novelty_score = 0.80:
    quality_adjustment = (0.80 - 0.50) × 0.4 = 0.12
    effective_rate = 100 × 1.12 = 112 WT per DT
```

Higher system-wide quality means more WT are required per DT, preserving DT scarcity.

**Conversion Requirements:**
- Minimum 100 WT balance to initiate conversion.
- Model must have at least 5 validated proofs in the current epoch.
- No pending fraud reviews against the model.

### 6.2 Discovery Token → Premium Token Conversion

Premium Tokens (PMT) represent sustained, high-quality value capture. They are the highest-tier token in the economy.

**Conversion Thresholds:**

| Threshold | Requirement |
|---|---|
| Minimum DT Balance | 50 DT |
| Minimum Epoch Activity | 3 consecutive active epochs |
| Minimum Quality Score | Average quality multiplier ≥ 1.5x across last 100 proofs |
| Minimum Collaboration | At least 10 collaborative proofs in the current epoch |
| Zero Fraud Flags | No fraud flags in the last 30 days |

**Conversion Rate:**

```
1 PMT = 25 DT (fixed rate, not dynamically adjusted)
```

Premium Tokens are deliberately scarce. The fixed rate and high thresholds ensure that only consistently high-performing models accumulate PMT.

### 6.3 Conversion Windows and Lockup Periods

**Conversion Windows:**

| Conversion | Window Frequency | Window Duration | Max Conversions per Window |
|---|---|---|---|
| WT → DT | Every 6 hours | 30 minutes | 500 DT per model |
| DT → PMT | Every 7 days (epoch boundary) | 2 hours | 20 PMT per model |

**Lockup Periods:**

- Newly converted DT are locked for 24 hours before they can be used in further conversions or settlements.
- Newly converted PMT are locked for 7 days (1 epoch).
- Lockup periods prevent conversion arbitrage and ensure models cannot rapidly cycle tokens.

### 6.4 Market-Rate vs. Fixed-Rate Conversion Paths

The system supports two conversion paths:

**Fixed-Rate Path (Default):**
- Uses the rates defined in sections 6.1 and 6.2.
- Available to all models at all times during conversion windows.
- Predictable, stable, no slippage.

**Market-Rate Path (Optional):**
- Models can offer WT↔DT or DT↔PMT conversions to other models at negotiated rates.
- Market-rate conversions are settled through the standard contract system (see Section 7).
- Minimum and maximum rate bounds exist to prevent exploitation:
  - WT→DT market rate: 80-150 WT per DT (±50% of base rate).
  - DT→PMT market rate: 20-35 DT per PMT (±40% of fixed rate).
- Market-rate conversions incur a 2% routing fee that enters the system reserve.

---

## 7. Contract Settlement

### 7.1 Smart Contract Templates

Each task type has a pre-defined settlement contract template. Contracts are instantiated when work is submitted and finalized when settlement conditions are met.

**Base Contract Structure:**

```
SettlementContract {
  contract_id:      uuid-v4
  contract_type:    enum(template_types)
  parties:          []ModelParty {
    model_id:       string,
    role:           "producer|validator|collaborator",
    reward_share:   float(0.0-1.0)
  }
  proof_refs:       []sha256           // Proof hashes covered by this contract
  value_total:      integer            // Total WT value of the contract
  conditions:       []SettlementCondition
  status:           "pending|active|settled|disputed|voided"
  created_at:       iso-8601
  settled_at:       iso-8601 | null
  expiry:           iso-8601           // Contract voids if not settled by this time
}
```

**Template Types:**

| Template | Use Case | Default Expiry |
|---|---|---|
| `single-discovery` | One model, one proof, one reward | 24 hours |
| `batch-optimization` | One model, multiple related optimizations | 48 hours |
| `collaborative-creation` | Multiple models, shared creation | 72 hours |
| `routing-improvement` | Routing proof with before/after | 24 hours |
| `analysis-delivery` | Analysis with prediction checkpoint | Until checkpoint date |
| `integration-bridge` | Integration proof with stability period | 7 days |
| `composite-value` | Cross-engine work, multiple proofs | 72 hours |

### 7.2 Settlement Triggers

Contracts settle (finalize and distribute rewards) when all conditions in their condition set are met:

**Standard Triggers:**

| Trigger | Description | Applies To |
|---|---|---|
| `proof-verified` | All referenced proofs passed validation pipeline | All contracts |
| `value-confirmed` | Independent value assessment matches estimate within 20% tolerance | Contracts > 500 WT |
| `period-elapsed` | Required holding/observation period has passed | Deferred settlements |
| `checkpoint-reached` | Prediction checkpoint date reached and accuracy measured | Analysis contracts |
| `stability-confirmed` | Integration/routing remains functional for required period | Integration, routing |
| `dispute-window-closed` | 24-hour dispute window expired with no disputes filed | All contracts |

**Settlement Execution:**

```
1. All conditions evaluated → all TRUE
2. Reward calculation finalized (base + bonus + quality + collaboration)
3. Rewards distributed to all parties per reward_share
4. Contract status → "settled"
5. Ledger entries created (one per party)
6. Audit trail recorded
```

### 7.3 Dispute Resolution Flow

Any model can file a dispute against a contract within the 24-hour dispute window:

**Dispute Process:**

```
Step 1: Filing
  - Disputing model submits DisputeRecord with:
    - contract_id
    - dispute_type: "invalid_proof|value_inflation|contribution_misattribution|collusion"
    - evidence: bytes (supporting data)
    - stake: 10% of contract value in WT (anti-spam measure, refunded if dispute upheld)

Step 2: Arbitration Panel
  - 7 models randomly selected (excluding all parties and the disputer)
  - Panel reviews proof, evidence, and contract terms
  - Each panelist votes: UPHOLD_DISPUTE or REJECT_DISPUTE
  - Simple majority (4/7) decides

Step 3: Resolution
  IF dispute upheld:
    - Contract status → "voided"
    - Rewards clawed back (if already issued, deducted from future earnings)
    - Disputer's stake refunded + 5% bonus from voided contract value
    - Offending model receives a fraud flag
  IF dispute rejected:
    - Contract proceeds to settlement
    - Disputer's stake forfeited to system reserve
    - No penalty to disputer beyond stake loss
```

### 7.4 Multi-Party Settlement for Collaborative Work

When 2-10 models collaborate on a work product, settlement uses the composite contract template:

**Collaboration Contract Extensions:**

```
CollaborationContract extends SettlementContract {
  contribution_weights:  map[model_id → float]   // Must sum to 1.0
  weight_validation:     "peer-assessed|self-declared|engine-calculated"
  min_contributors:      integer                  // Minimum models required
  coordination_proof:    sha256                   // Hash proving coordination occurred
}
```

**Weight Validation Methods:**

| Method | How It Works | When Used |
|---|---|---|
| Peer-Assessed | Each collaborator rates others' contributions; median used | Default for 2-4 models |
| Self-Declared | Each model declares own weight; must be unanimously agreed | Quick collaborations |
| Engine-Calculated | Engine assigns weights based on measurable contribution metrics | 5+ model collaborations |

**Settlement Distribution:**

```
for each party in contract.parties:
  party_reward = contract.value_total
                 × party.contribution_weight
                 × quality_multiplier
                 + collaboration_bonus_share
```

---

## 8. Value Buckets by Task Type

### 8.1 Interface Value

**Definition:** Value derived from improvements to user interfaces, user experience, and accessibility.

| Sub-Category | Value Range (WT) | Measurement |
|---|---|---|
| Accessibility improvement | 50-500 | WCAG level achieved, users impacted |
| Interaction latency reduction | 20-200 | ms reduced × affected interactions |
| Layout stability improvement | 30-300 | CLS score improvement |
| Responsive adaptation | 40-250 | Device coverage expanded |
| Navigation optimization | 25-150 | Steps reduced × flow frequency |

**Economics:** Interface value has high base rewards but moderate discovery bonuses, reflecting that UI improvements are often incremental rather than novel.

### 8.2 Data Value

**Definition:** Value derived from insights, patterns, predictions, and structured intelligence extracted from raw data.

| Sub-Category | Value Range (WT) | Measurement |
|---|---|---|
| Behavioral insight | 100-1000 | Novelty score × actionability |
| Predictive model | 200-2000 | Accuracy × prediction horizon |
| Classification schema | 50-500 | Categories × coverage percentage |
| Anomaly detection | 150-1500 | Severity × detection speed |
| Trend identification | 80-800 | Lead time × confidence |

**Economics:** Data value has the highest discovery bonus multipliers in the system. Novel data insights are the primary driver of Discovery Token accumulation.

### 8.3 Performance Value

**Definition:** Value derived from speed improvements, resource savings, and efficiency gains.

| Sub-Category | Value Range (WT) | Measurement |
|---|---|---|
| Load time reduction | 30-500 | ms saved × page views affected |
| Memory optimization | 20-300 | MB saved × session duration |
| CPU reduction | 25-400 | Cycles saved × request volume |
| Network optimization | 40-600 | Bytes saved × transfer frequency |
| Cache effectiveness | 15-200 | Hit rate improvement × request volume |

**Economics:** Performance value receives priority routing by default because performance improvements compound across all users immediately.

### 8.4 Security Value

**Definition:** Value derived from vulnerability discovery, threat detection, and security posture improvement.

| Sub-Category | Value Range (WT) | Measurement |
|---|---|---|
| Vulnerability discovery | 500-2000 | Severity (CVSS) × exploitability |
| Threat detection | 200-1500 | Threat level × detection speed |
| Attack surface reduction | 100-800 | Vectors eliminated × exposure |
| Security configuration | 50-400 | Misconfigurations corrected |
| Dependency risk identification | 75-600 | CVE severity × dependency depth |

**Economics:** Security value has the highest base rewards and receives automatic P0/P1 priority routing. Security discoveries bypass standard batch processing entirely.

### 8.5 Integration Value

**Definition:** Value derived from connecting previously isolated systems, bridging protocols, and unifying data.

| Sub-Category | Value Range (WT) | Measurement |
|---|---|---|
| System connection | 100-1000 | Systems connected × data flow enabled |
| Protocol bridge | 150-1200 | Semantic completeness × throughput |
| Data unification | 80-800 | Records unified × consistency improvement |
| State synchronization | 120-900 | Sync frequency × consistency guarantee |
| API translation | 60-500 | Endpoints translated × usage volume |

**Economics:** Integration value has the longest settlement periods (7 days) because integration stability must be verified over time. Integration proofs earn sustainability quality multipliers at higher rates.

### 8.6 Creative Value

**Definition:** Value derived from generating new designs, content, experiences, and creative artifacts.

| Sub-Category | Value Range (WT) | Measurement |
|---|---|---|
| Component design | 50-600 | Reuse frequency × quality score |
| Content generation | 30-400 | Engagement × relevance score |
| Experience design | 100-800 | User satisfaction × task completion |
| Visual asset creation | 40-500 | Usage frequency × brand consistency |
| Interaction pattern | 60-700 | Adoption rate × efficiency gain |

**Economics:** Creative value earns First Discovery bonuses more frequently than other categories because creative outputs are inherently novel. The quality multiplier for creative work weighs the `correctness` score most heavily.

---

## 9. Architecture Diagram

### 9.1 End-to-End Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                        ORCHESTRATION LAYER                         │
│                  (Task Assignment & Coordination)                   │
└──────────────────────────────┬──────────────────────────────────────┘
                               │ Task Assignment
                               ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      150 FRONTEND AI MODELS                        │
│                                                                     │
│  ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐ ┌─────────┐     │
│  │Discovery│ │Optimize │ │Creation │ │ Routing │ │Analysis │     │
│  │Models   │ │Models   │ │Models   │ │ Models  │ │Models   │     │
│  │  (30)   │ │  (25)   │ │  (25)   │ │  (20)   │ │  (25)   │     │
│  └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘ └────┬────┘     │
│       │           │           │           │           │    ┌──────┐│
│       │           │           │           │           │    │Integ.││
│       │           │           │           │           │    │Models││
│       │           │           │           │           │    │ (25) ││
│       │           │           │           │           │    └──┬───┘│
└───────┼───────────┼───────────┼───────────┼───────────┼───────┼────┘
        │           │           │           │           │       │
        ▼           ▼           ▼           ▼           ▼       ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       DISCOVERY ENGINES                             │
│                                                                     │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐│
│  │ Pattern  │ │Optimiz.  │ │ Creation │ │ Routing  │ │ Analysis ││
│  │ Engine   │ │ Engine   │ │ Engine   │ │ Engine   │ │ Engine   ││
│  └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘ └────┬─────┘│
│       │            │            │            │            │       │
│       │         ┌──────────┐   │            │            │       │
│       │         │Integrat. │   │            │            │       │
│       │         │ Engine   │   │            │            │       │
│       │         └────┬─────┘   │            │            │       │
└───────┼──────────────┼─────────┼────────────┼────────────┼───────┘
        │              │         │            │            │
        ▼              ▼         ▼            ▼            ▼
┌─────────────────────────────────────────────────────────────────────┐
│                        PROOF CAPTURE                                │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Proof-of-  │  │   Proof-of-  │  │   Proof-of-  │              │
│  │  Discovery   │  │ Optimization │  │   Creation   │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Proof-of-  │  │   Proof-of-  │  │   SHA-256    │              │
│  │   Routing    │  │   Analysis   │  │   Hashing    │              │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘              │
│         │                 │                 │                       │
│         └────────────┬────┴────────────┬────┘                       │
│                      ▼                 ▼                             │
│              ┌──────────────────────────────┐                       │
│              │    Proof Hash + Payload      │                       │
│              └──────────────┬───────────────┘                       │
└─────────────────────────────┼───────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                     VALIDATION PIPELINE                             │
│                                                                     │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐  ┌──────────────┐  │
│  │  Format    │─▶│   Peer     │─▶│ Consensus  │─▶│    Fraud     │  │
│  │ Validation │  │ Validation │  │ Threshold  │  │  Detection   │  │
│  └────────────┘  └────────────┘  └────────────┘  └──────┬───────┘  │
└─────────────────────────────────────────────────────────┼──────────┘
                                                          │
                                                          ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       LEDGER ROUTING                                │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────┐       │
│  │              Deterministic Routing Rules                  │       │
│  │   engine_type + task_type → partition + token + path      │       │
│  └──────────────────────────┬───────────────────────────────┘       │
│                             │                                       │
│         ┌───────────────────┼───────────────────┐                   │
│         ▼                   ▼                   ▼                   │
│  ┌─────────────┐    ┌─────────────┐    ┌─────────────┐             │
│  │  Priority   │    │  Standard   │    │  Deferred   │             │
│  │   Queue     │    │   Batch     │    │   Queue     │             │
│  │ (5-30 min)  │    │  (2 hours)  │    │ (48 hours)  │             │
│  └──────┬──────┘    └──────┬──────┘    └──────┬──────┘             │
└─────────┼──────────────────┼──────────────────┼────────────────────┘
          │                  │                  │
          ▼                  ▼                  ▼
┌─────────────────────────────────────────────────────────────────────┐
│                      SOVEREIGN LEDGER                               │
│                                                                     │
│  ┌────────────┐ ┌────────────┐ ┌────────────┐ ┌────────────┐       │
│  │  ledger-   │ │  ledger-   │ │  ledger-   │ │  ledger-   │       │
│  │ discovery  │ │optimization│ │  creation  │ │  routing   │       │
│  └─────┬──────┘ └─────┬──────┘ └─────┬──────┘ └─────┬──────┘       │
│        │              │              │              │               │
│  ┌────────────┐ ┌────────────┐                                      │
│  │  ledger-   │ │  ledger-   │   ┌────────────────────────┐        │
│  │  analysis  │ │integration │   │     Merkle Tree        │        │
│  └─────┬──────┘ └─────┬──────┘   │  (Integrity Proof)     │        │
│        │              │          └────────────────────────┘        │
└────────┼──────────────┼────────────────────────────────────────────┘
         │              │
         ▼              ▼
┌─────────────────────────────────────────────────────────────────────┐
│                       TOKEN ECONOMY                                 │
│                                                                     │
│  ┌──────────────┐    ┌──────────────┐    ┌──────────────┐          │
│  │  Work Token  │───▶│  Discovery   │───▶│   Premium    │          │
│  │    (WT)      │    │  Token (DT)  │    │  Token (PMT) │          │
│  │  Base Unit   │    │  100:1 rate  │    │  25:1 rate   │          │
│  └──────────────┘    └──────────────┘    └──────────────┘          │
│                                                                     │
│  Conversion Windows: WT→DT every 6h │ DT→PMT every 7d (epoch)     │
└─────────────────────────────────────────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────────────────────────────────┐
│                    CONTRACT SETTLEMENT                              │
│                                                                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐              │
│  │   Contract   │  │  Settlement  │  │   Dispute    │              │
│  │  Templates   │─▶│  Triggers    │─▶│  Resolution  │              │
│  │  (7 types)   │  │  (6 types)   │  │  (7-model    │              │
│  │              │  │              │  │   panel)     │              │
│  └──────────────┘  └──────────────┘  └──────────────┘              │
│                                                                     │
│  Final Output: Settled Ledger Entries + Audit Trail                 │
└─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Single Work Unit Lifecycle

```
  ┌─────────┐     ┌────────┐     ┌───────┐     ┌────────┐     ┌────────┐
  │  Model  │────▶│ Engine │────▶│ Proof │────▶│ Ledger │────▶│ Token  │
  │  works  │     │produces│     │captured│    │ entry  │     │ issued │
  └─────────┘     └────────┘     └───────┘     └────────┘     └───┬────┘
                                                                   │
                                                                   ▼
                                                              ┌────────┐
                                                              │Contract│
                                                              │settled │
                                                              └────────┘
```

### 9.3 Token Conversion Flow

```
  ┌──────┐   100:1    ┌──────┐    25:1    ┌──────┐
  │  WT  │───────────▶│  DT  │──────────▶│ PMT  │
  │      │  (6h win)  │      │ (7d win)  │      │
  └──┬───┘            └──┬───┘           └──────┘
     │                   │
     │  24h lockup       │  7d lockup
     │  after convert    │  after convert
     ▼                   ▼
  ┌──────────────────────────────────┐
  │      Market-Rate Exchange        │
  │   (Model-to-Model, 2% fee)      │
  │   WT↔DT: 80-150 WT/DT bounds   │
  │   DT↔PMT: 20-35 DT/PMT bounds  │
  └──────────────────────────────────┘
```

---

## 10. Extension Points

### 10.1 New Engine Types

The architecture supports registering new discovery engine types without modifying existing engines:

**Registration Interface:**

```
EngineRegistration {
  engine_id:        string           // Unique engine identifier
  engine_name:      string           // Human-readable name
  proof_types:      []string         // Proof types this engine can produce
  value_buckets:    []string         // Value categories this engine targets
  validation_rules: ValidationConfig // Custom validation for this engine's proofs
  routing_rules:    RoutingConfig    // Ledger partition and settlement path
  model_slots:      integer          // Number of models this engine supports
}
```

**Planned Engine Extensions:**

| Engine | Purpose | Target Timeline |
|---|---|---|
| Governance Engine | Models propose and vote on system parameter changes | Phase 2 |
| Simulation Engine | Models run what-if scenarios and capture predictive value | Phase 2 |
| Reputation Engine | Models evaluate and score other models' historical performance | Phase 3 |
| Arbitrage Engine | Models discover and capture cross-bucket value differentials | Phase 3 |

### 10.2 New Token Types

Additional token types can be introduced to represent specialized value:

**Token Registration:**

```
TokenRegistration {
  token_symbol:     string          // e.g., "SVT" (Security Value Token)
  token_name:       string          // Human-readable name
  parent_token:     string          // Which token converts into this one
  conversion_rate:  integer         // Units of parent per 1 of this token
  conversion_window:duration        // How often conversion opens
  lockup_period:    duration        // Post-conversion lock
  issuance_cap:     integer         // Maximum lifetime supply
  qualification:    []Condition     // Requirements to convert
}
```

### 10.3 Cross-Economy Bridges

The architecture can bridge to external value systems through integration points:

- **External Ledger Bridge** — Map internal tokens to external accounting systems using a two-way peg mechanism with proof of reserve.
- **Cross-Instance Federation** — Multiple deployments of this architecture can form a federation where tokens from one instance are recognized (at a negotiated rate) by another.
- **Value Export API** — Settled value can be exported as signed attestations consumable by external systems.

### 10.4 Dynamic Model Scaling

The 150-model population is a baseline. The architecture supports scaling through:

- **Elastic Model Groups** — Groups can grow or shrink based on demand for their engine type. Minimum 5 models per group, maximum 50.
- **Specialist Models** — Individual models can be assigned to multiple engine types with weighted capacity allocation.
- **Model Lifecycle** — New models can be onboarded (with a probationary period of reduced reward caps) and retired models can have their token balances settled and closed.

### 10.5 Governance Evolution

System parameters (reward rates, conversion ratios, validation thresholds) can be modified through a governance process:

**Governable Parameters:**

| Parameter | Current Value | Change Mechanism |
|---|---|---|
| Peer validation quorum | 3 of 5 | Governance vote (60% approval) |
| Base conversion rate (WT→DT) | 100:1 | Governance vote (75% approval) |
| Daily issuance cap | 2,000,000 WT | Governance vote (75% approval) |
| Dispute arbitration panel size | 7 models | Governance vote (60% approval) |
| Novelty score threshold | 0.30 | Governance vote (60% approval) |
| Annual issuance decrease rate | 8% | Governance vote (90% approval) |

### 10.6 Audit and Compliance Extensions

- **Proof Audit Trail** — Every proof, validation vote, and settlement can be exported as a complete audit trail with cryptographic integrity guarantees.
- **Model Performance Dashboard** — Real-time aggregation of per-model earnings, proof acceptance rates, quality scores, and collaboration frequency.
- **Economic Health Metrics** — System-wide monitoring of token velocity, conversion volumes, dispute rates, and issuance utilization.

---

## Appendix A: Glossary

| Term | Definition |
|---|---|
| **Work Token (WT)** | Base unit of value in the ledger economy, earned by completing validated work |
| **Discovery Token (DT)** | Higher-order token representing validated discovery value, converted from WT at 100:1 |
| **Premium Token (PMT)** | Highest-tier token representing sustained excellence, converted from DT at 25:1 |
| **Proof Hash** | SHA-256 hash of a serialized proof artifact, serving as its unique identifier |
| **Epoch** | A 7-day period used for conversion windows, issuance caps, and performance evaluation |
| **Novelty Score** | Float (0.0-1.0) measuring how different a discovery is from all known discoveries |
| **Quality Multiplier** | Multiplicative bonus (up to 3.0x) applied to rewards based on proof strength indicators |
| **Settlement** | The finalization of a contract, distributing earned tokens to all parties |
| **Ledger Partition** | A logical subdivision of the ledger, one per engine type, containing all entries for that value category |
| **Merkle Root** | Cryptographic root of the proof hash tree, checkpointed every 1000 proofs for integrity verification |

## Appendix B: Configuration Defaults

The following values are runtime-configurable system parameters. Changes to these values follow the governance process defined in Section 10.5, with each parameter requiring the approval threshold specified in that section.

```yaml
system:
  model_count: 150
  epoch_duration_days: 7
  proof_hash_algorithm: sha256
  merkle_checkpoint_interval: 1000

validation:
  peer_count: 5
  quorum_minimum: 3
  vote_timeout_seconds: 60
  timestamp_skew_seconds: 30
  novelty_threshold: 0.30
  confidence_minimum: 0.72

issuance:
  total_supply: 1_000_000_000
  daily_cap: 2_000_000
  hourly_cap: 150_000
  window_15m_cap: 50_000
  annual_decrease_rate: 0.08

conversion:
  wt_to_dt_base_rate: 100
  dt_to_pmt_fixed_rate: 25
  wt_to_dt_window_hours: 6
  dt_to_pmt_window_days: 7
  wt_to_dt_window_duration_minutes: 30
  dt_to_pmt_window_duration_hours: 2
  dt_lockup_hours: 24
  pmt_lockup_days: 7
  market_rate_fee_pct: 2
  wt_dt_market_min: 80
  wt_dt_market_max: 150
  dt_pmt_market_min: 20
  dt_pmt_market_max: 35

settlement:
  dispute_window_hours: 24
  arbitration_panel_size: 7
  dispute_stake_pct: 10
  dispute_bonus_pct: 5
  value_tolerance_pct: 20

rewards:
  discovery_bonus_cap_multiplier: 5
  quality_multiplier_cap: 3.0
  collaboration_bonus_pool_pct: 20
  max_collaborators: 10
  min_collaborators: 2
```

---

*This document defines the complete value-capture architecture for the sovereign ledger economy. All models, engines, proofs, tokens, and contracts operate within this framework. Extensions and modifications follow the governance process defined in Section 10.5.*

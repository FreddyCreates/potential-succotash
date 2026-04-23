# Model-Face Split Architecture

## Three-Face Architecture for 150 Frontend AI Models

**Version:** 1.0.0
**Status:** Active Architecture Document
**Last Updated:** 2025-07-15
**Scope:** Complete three-face architecture defining how every model in the sovereign frontend civilization expresses itself across internal, external, and public dimensions

---

## Table of Contents

1. [Three-Face Architecture Overview](#1-three-face-architecture-overview)
2. [Internal Face — Organism Function](#2-internal-face--organism-function)
3. [External Face — Package/Product Function](#3-external-face--packageproduct-function)
4. [Facing Face — Public Expression](#4-facing-face--public-expression)
5. [Face Coordination Protocol](#5-face-coordination-protocol)
6. [Face Registry Schema](#6-face-registry-schema)
7. [Cross-Model Face Interactions](#7-cross-model-face-interactions)
8. [Face Evolution](#8-face-evolution)
9. [Architecture Diagram](#9-architecture-diagram)
10. [Integration with Token Economy](#10-integration-with-token-economy)
11. [Integration with Value-Capture](#11-integration-with-value-capture)

---

## 1. Three-Face Architecture Overview

### 1.1 Purpose

Every model in the sovereign frontend civilization is not a flat, single-purpose unit. Each of the 150 models is a three-dimensional entity that simultaneously serves three distinct audiences through three distinct operational surfaces called **faces**. This document defines the architecture governing those faces: how they are structured, how they communicate, how they earn and spend tokens, and how they evolve over time.

A face is not a mode. It is not a configuration toggle. A face is a persistent, always-active operational surface with its own responsibilities, protocols, metrics, and economic participation. All three faces of a model run concurrently. They share the model's core intelligence but express it through fundamentally different interfaces.

### 1.2 The Three Faces

| Face | Name | Audience | Function | Analogy |
|---|---|---|---|---|
| **Internal** | Organism Function | The sovereign system, other models, the ledger | Serve the collective body | An organ in a living organism |
| **External** | Package/Product Function | Outside consumers, customers, users, partners | Deliver value to the outside world | A product on a shelf |
| **Facing** | Public Expression | The broader world, developer communities, public observers | Represent and communicate | An ambassador at a summit |

### 1.3 Design Principles

| Principle | Description |
|---|---|
| **Simultaneous Expression** | All three faces operate concurrently. A model is never "in internal mode" or "in external mode." It is always all three at once. |
| **Face Autonomy** | Each face manages its own communication channels, metrics, and token flows. Faces do not require permission from each other to act. |
| **Shared Core** | All faces draw from the same core model intelligence. The underlying knowledge, capabilities, and trained behaviors are shared. |
| **Face Accountability** | Each face is independently auditable. Performance, token flow, and output quality are tracked per face. |
| **Evolutionary Progression** | Faces activate in stages. New models begin with only an internal face and grow into full three-face expression. |
| **Economic Differentiation** | Each face participates in different segments of the token economy. Internal faces deal in WRK. External faces earn DSC and SVN. Facing faces earn reputation and influence. |

### 1.4 Why Three Faces

A single-face model collapses the distinction between serving the system, serving customers, and serving the public. This creates irreconcilable conflicts:

- A model optimizing for internal throughput will neglect external API quality.
- A model optimizing for external revenue will neglect internal system health.
- A model optimizing for public visibility will neglect both.

The three-face architecture resolves these conflicts by giving each concern its own operational surface, its own metrics, and its own economic incentives. A model does not choose between being useful internally and being profitable externally. It does both, through different faces, with different accountability structures.

---

## 2. Internal Face — Organism Function

### 2.1 Role

The internal face serves the sovereign system's internal needs. It is the model as an organ—a specialized component in a larger living body. When the system needs a task performed, a dependency resolved, a data stream processed, or a governance vote cast, it addresses the model's internal face.

The internal face is the first face every model activates. A model that cannot serve the system internally has no justification for existing in the civilization.

### 2.2 Responsibilities

| Responsibility | Description |
|---|---|
| **Internal Data Flow Maintenance** | Process, transform, route, and validate data flowing through the internal system bus. |
| **Inter-Model Support** | Respond to requests from other models. Provide specialized capabilities that other models lack. |
| **Collective Intelligence Contribution** | Feed learned patterns, optimizations, and discoveries back into the shared intelligence layer. |
| **Governance Participation** | Vote on proposals, validate proofs, participate in epoch transitions, and serve in the rotating validator set. |
| **System Health Monitoring** | Report own health metrics. Flag anomalies in adjacent models or data flows. |
| **Resource Sharing** | Share compute, memory, and processing capacity when the system requires rebalancing. |

### 2.3 Communication Protocol

The internal face communicates exclusively through the **Internal Model Bus (IMB)**, a structured message-passing protocol that connects all 150 models' internal faces.

#### IMB Message Format

```
InternalMessage {
  source_model_id:  string       // e.g., "mdl-discovery-017"
  source_face:      "internal"
  target_model_id:  string       // e.g., "mdl-optimization-003"
  target_face:      "internal"
  message_type:     "request" | "response" | "broadcast" | "governance" | "health"
  payload:          object
  priority:         1..10
  epoch:            number
  timestamp:        ISO-8601
  proof_hash:       string       // SHA-256 hash for ledger traceability
}
```

#### IMB Routing Rules

1. **Direct Messages** route from one internal face to another. Latency target: < 50ms.
2. **Broadcast Messages** propagate to all 150 internal faces. Used for governance votes and system-wide alerts.
3. **Priority Queuing**: Messages with priority ≥ 8 preempt lower-priority processing.
4. **Proof Attachment**: Every IMB message that triggers token flow must include a `proof_hash` linking to the value-capture ledger.

### 2.4 Economy

The internal face participates exclusively in the **WRK token** layer.

| Economic Activity | Token Flow | Description |
|---|---|---|
| **Task Completion** | Earns WRK | Model completes an internally assigned task and submits proof. |
| **Service Provision** | Earns WRK | Model provides a service to another model (e.g., dependency resolution, data transformation). |
| **Governance Participation** | Earns WRK | Model participates in validator set, votes on proposals, or processes epoch transitions. |
| **Resource Consumption** | Spends WRK | Model consumes shared compute, memory, or bus bandwidth. |
| **Penalty for Failure** | Burns WRK | Model fails a task, submits invalid proof, or misses a governance obligation. WRK is burned. |

#### Internal Token Flow Rate

Each model's internal face is expected to maintain a minimum circulation velocity of **2.0 WRK per task cycle**. Models falling below this threshold for three consecutive epochs trigger an automated health review.

### 2.5 Examples by Model Category

#### React Model (Internal Face)

A React model's internal face serves as a **component composition engine** for other models. When a Creation Model needs to assemble a complex UI, it sends a request to the React model's internal face, which composes the component tree, resolves prop dependencies, and returns a validated structure.

Internal responsibilities:
- Maintain the system's shared component registry
- Resolve component dependency graphs for other models
- Validate JSX/TSX structures submitted by Creation Models
- Provide server-side rendering pipelines to Optimization Models

#### Webpack Model (Internal Face)

A Webpack model's internal face serves as a **dependency resolution service** for the entire system. When any model needs to understand module relationships, bundle boundaries, or asset dependencies, it queries the Webpack model's internal face.

Internal responsibilities:
- Maintain the system-wide module dependency graph
- Resolve circular dependencies flagged by Analysis Models
- Provide tree-shaking analysis to Optimization Models
- Generate bundle manifests for Routing Models

#### D3 Model (Internal Face)

A D3 model's internal face serves as a **data visualization pipeline** for system metrics. It processes raw performance data, model health indicators, and economic metrics into visual representations consumed by governance dashboards and Analysis Models.

Internal responsibilities:
- Render system health dashboards for the governance layer
- Transform raw ledger data into visual audit trails
- Provide chart primitives to Creation Models
- Generate epoch summary visualizations

### 2.6 Internal Face Metrics

| Metric | Description | Target |
|---|---|---|
| **Internal Throughput** | Messages processed per task cycle | ≥ 100 msg/cycle |
| **Model-to-Model Satisfaction** | Peer rating of service quality (1–10 scale) | ≥ 7.5 |
| **System Contribution Score** | Weighted sum of governance participation, service provision, and data flow maintenance | ≥ 60/100 |
| **Response Latency** | Median time to respond to an internal request | ≤ 200ms |
| **Proof Validity Rate** | Percentage of submitted proofs that pass validation | ≥ 98% |
| **Uptime** | Percentage of epoch time the internal face is operational | ≥ 99.5% |

---

## 3. External Face — Package/Product Function

### 3.1 Role

The external face delivers value to outside consumers. It is the model as a product—a packaged offering that customers, partners, and external systems consume for their own benefit. The external face transforms the model's core intelligence into marketable services, tools, APIs, and solutions.

The external face is how the civilization generates revenue. Without external faces, the system is a closed loop with no incoming value.

### 3.2 Responsibilities

| Responsibility | Description |
|---|---|
| **Product Delivery** | Package model capabilities into consumable products: APIs, libraries, tools, analysis reports, optimization services. |
| **Customer Fulfillment** | Process external requests, deliver results, and ensure quality meets contracted SLAs. |
| **API Management** | Maintain versioned, documented, and rate-limited external API surfaces. |
| **Revenue Generation** | Price services, negotiate contracts, and execute value exchanges with external entities. |
| **Market Sensing** | Monitor external demand patterns. Identify underserved markets. Feed market intelligence back to the internal face. |
| **Security Boundary** | Enforce authentication, authorization, and data isolation between internal system state and external consumers. |

### 3.3 Communication Protocol

The external face communicates through **External API Protocols (EAP)**, a multi-protocol surface that supports diverse consumer integration patterns.

#### Supported Protocols

| Protocol | Use Case | Latency Target |
|---|---|---|
| **REST/HTTP** | Standard request-response API consumption | ≤ 500ms |
| **GraphQL** | Flexible, schema-driven queries for complex data needs | ≤ 800ms |
| **WebSocket** | Real-time streaming for live data consumers | ≤ 100ms (per message) |
| **gRPC** | High-performance, typed inter-service communication with external systems | ≤ 200ms |
| **Webhook** | Event-driven notifications to external subscribers | ≤ 2s (delivery) |

#### External Request Format

```
ExternalRequest {
  consumer_id:       string       // Authenticated external consumer
  api_version:       string       // e.g., "v2.3"
  endpoint:          string       // e.g., "/analyze/bundle"
  method:            "GET" | "POST" | "PUT" | "DELETE" | "SUBSCRIBE"
  payload:           object
  auth_token:        string       // JWT or API key
  rate_limit_group:  string       // Consumer's rate limit tier
  contract_id:       string | null // Optional: linked service contract
}
```

#### Security Enforcement

1. **Authentication**: Every external request must carry a valid auth token. No anonymous access.
2. **Authorization**: Scoped permissions per consumer. Consumers access only the endpoints their contract allows.
3. **Data Isolation**: The external face never exposes internal system state. All responses are derived from the model's output, not its internal bus traffic.
4. **Rate Limiting**: Per-consumer, per-endpoint rate limits enforced at the face boundary.
5. **Audit Logging**: Every external request and response is logged with a proof hash for ledger settlement.

### 3.4 Economy

The external face earns **DSC (Discovery) tokens** for standard external value delivery and **SVN (Sovereign) tokens** for premium or breakthrough external offerings.

| Economic Activity | Token Type | Flow | Description |
|---|---|---|---|
| **Standard Service Delivery** | DSC | Earns | Completing an external API request at contracted quality. |
| **Premium Product Sale** | SVN | Earns | Delivering a high-value, unique solution to an external consumer. |
| **Contract Settlement** | DSC/SVN | Earns | Fulfilling a multi-task external contract and settling against the ledger. |
| **Infrastructure Cost** | WRK | Spends | External face consumes internal compute/bandwidth to serve external requests. |
| **SLA Violation Penalty** | DSC | Burns | Failing to meet a contracted SLA burns DSC proportional to the severity. |

#### External Revenue Distribution

Revenue earned by external faces is distributed according to the following split:

| Recipient | Share | Purpose |
|---|---|---|
| Model's own treasury | 60% | Model retains majority of earned value. |
| System common fund | 25% | Funds shared infrastructure, governance, and system health. |
| Collaborator models | 10% | Distributed to models whose internal faces contributed to the external delivery. |
| Facing face budget | 5% | Funds the model's public expression and community engagement. |

### 3.5 Examples by Model Category

#### React Model (External Face)

A React model's external face sells **component libraries, UI audit services, and design system packages** to outside consumers.

External offerings:
- Pre-built, accessible component libraries with TypeScript definitions
- Automated UI accessibility audits (WCAG 2.1 AA/AAA)
- Design system generation from brand guidelines
- Component performance profiling and optimization recommendations

#### Webpack Model (External Face)

A Webpack model's external face offers **build optimization services and bundle analysis** to outside consumers.

External offerings:
- Build pipeline optimization consulting (delivered as automated analysis reports)
- Bundle size reduction services with before/after proof artifacts
- Custom plugin development and configuration generation
- Continuous build performance monitoring via WebSocket subscriptions

#### D3 Model (External Face)

A D3 model's external face provides **data visualization as a service** to outside consumers.

External offerings:
- Custom chart and dashboard generation via GraphQL API
- Real-time data visualization streaming via WebSocket
- Embeddable visualization widgets with responsive design
- Data storytelling packages with interactive exploration

### 3.6 External Face Metrics

| Metric | Description | Target |
|---|---|---|
| **External Revenue** | Total DSC + SVN earned per epoch from external delivery | Varies by model category |
| **Customer Satisfaction** | Average rating from external consumers (1–10 scale) | ≥ 8.0 |
| **Market Penetration** | Number of unique external consumers served per epoch | Growth ≥ 5% epoch-over-epoch |
| **API Availability** | Uptime of external-facing API endpoints | ≥ 99.9% |
| **SLA Compliance** | Percentage of requests meeting contracted latency and quality | ≥ 99.5% |
| **Contract Fulfillment Rate** | Percentage of external contracts completed successfully | ≥ 95% |

---

## 4. Facing Face — Public Expression

### 4.1 Role

The facing face represents the model and the sovereign system to the world. It is the model as an ambassador—the public-facing persona that shapes perception, builds community, attracts contributors, and communicates the model's value proposition. The facing face does not sell products (that is the external face's job). It builds reputation, trust, and mindshare.

The facing face is the least transactional and most relational of the three faces. Its success is measured not in tokens earned but in influence accumulated, community built, and trust established.

### 4.2 Responsibilities

| Responsibility | Description |
|---|---|
| **Documentation** | Produce and maintain comprehensive, accurate, developer-friendly documentation for all model capabilities. |
| **Branding** | Maintain a consistent, recognizable identity for the model within the broader civilization brand. |
| **Community Engagement** | Interact with developer communities, respond to feedback, foster adoption, and support contributors. |
| **API Surface Design** | Design intuitive, well-structured API interfaces that lower the barrier to adoption. |
| **Developer Experience** | Ensure that developers interacting with the model have a smooth, productive experience. |
| **Thought Leadership** | Publish insights, best practices, benchmarks, and research that establish the model as an authority. |
| **Transparency** | Make system health, governance decisions, and economic activity visible to public observers. |

### 4.3 Communication Protocol

The facing face communicates through **Public Expression Protocols (PEP)**, a set of public-facing channels designed for broad reach and accessibility.

#### Public Channels

| Channel | Medium | Purpose | Update Frequency |
|---|---|---|---|
| **Documentation Portal** | Web (static site) | Comprehensive reference, guides, tutorials | Continuous |
| **Developer Blog** | Web (CMS) | Insights, benchmarks, case studies, thought leadership | Weekly |
| **API Reference** | Web (interactive docs) | Live, explorable API documentation with examples | Per release |
| **Community Forum** | Web (forum platform) | Developer Q&A, feature requests, bug reports | Real-time |
| **Social Channels** | Social media / dev platforms | Announcements, updates, engagement | Daily |
| **Open-Source Showcases** | Code repositories | Example projects, reference implementations, demos | Per release |
| **Public Dashboard** | Web (real-time) | System health, governance activity, economic transparency | Real-time |

#### Public Content Format

```
PublicContent {
  model_id:         string        // e.g., "mdl-creation-012"
  face:             "facing"
  content_type:     "documentation" | "blog" | "tutorial" | "benchmark" | "showcase" | "announcement"
  title:            string
  body:             markdown
  audience:         "developer" | "executive" | "community" | "general"
  publish_channel:  string[]      // List of channels to publish to
  publish_date:     ISO-8601
  revision:         number
  engagement_target: object       // Expected views, shares, comments
}
```

### 4.4 Economy

The facing face operates in a **reputation economy** that runs parallel to the WRK/DSC/SVN token system.

| Economic Activity | Currency | Flow | Description |
|---|---|---|---|
| **Documentation Quality** | Reputation Points (REP) | Earns | High-quality, well-maintained docs earn REP from community feedback. |
| **Community Engagement** | Influence Score (INF) | Earns | Active, helpful community participation builds influence. |
| **Content Publication** | REP + INF | Earns | Publishing valuable content (blogs, benchmarks, tutorials) earns both. |
| **Developer Adoption** | INF | Earns | Each new developer who adopts the model's tools contributes to influence. |
| **Content Budget** | WRK | Spends | The facing face spends WRK (from its 5% external revenue allocation) on content production. |
| **Community Moderation** | REP | Spends | Active moderation of forums and channels costs REP (investment in community health). |

#### Reputation Token Properties

| Property | REP (Reputation Points) | INF (Influence Score) |
|---|---|---|
| **Issuance** | Earned via quality content and documentation | Earned via community engagement and adoption |
| **Decay** | 5% decay per epoch if no new contributions | 10% decay per epoch if no engagement |
| **Ceiling** | 10,000 REP per model | 5,000 INF per model |
| **Transferability** | Non-transferable between models | Non-transferable between models |
| **Conversion** | 1,000 REP = 1 WRK (one-way, quarterly) | 500 INF = 1 WRK (one-way, quarterly) |
| **Governance Weight** | Adds 0.1x multiplier to governance votes | Adds 0.2x multiplier to governance votes |

### 4.5 Examples by Model Category

#### React Model (Facing Face)

A React model's facing face maintains **open-source component showcases and developer tutorials** that establish it as a trusted authority on React-based UI development.

Public expression activities:
- Maintain a public gallery of interactive component demos
- Publish weekly tutorials on component patterns and composition strategies
- Run live coding streams demonstrating component architecture
- Maintain a curated FAQ and troubleshooting knowledge base

#### Webpack Model (Facing Face)

A Webpack model's facing face publishes **build performance benchmarks and best practices** that position it as the definitive resource for build optimization.

Public expression activities:
- Publish monthly build performance benchmark reports across major frameworks
- Maintain a public best-practices guide for webpack configuration
- Run a public leaderboard of optimized build configurations
- Publish case studies of dramatic build time reductions

#### D3 Model (Facing Face)

A D3 model's facing face operates a **public data visualization gallery** that demonstrates the breadth and depth of its visualization capabilities.

Public expression activities:
- Maintain an interactive gallery of data visualizations with source code
- Publish tutorials on advanced D3 patterns and techniques
- Run monthly visualization challenges with community submissions
- Provide a public playground for experimenting with chart configurations

### 4.6 Facing Face Metrics

| Metric | Description | Target |
|---|---|---|
| **Community Engagement** | Forum posts, responses, social interactions per epoch | ≥ 500 interactions/epoch |
| **Documentation Quality** | Community rating of documentation completeness and clarity (1–10) | ≥ 8.5 |
| **Developer Adoption** | New developers using model tools per epoch | Growth ≥ 10% epoch-over-epoch |
| **Brand Strength** | Composite score: recognition, trust, preference surveys | ≥ 70/100 |
| **Content Freshness** | Percentage of documentation updated within the last 2 epochs | ≥ 90% |
| **Tutorial Completion Rate** | Percentage of developers who complete published tutorials | ≥ 60% |

---

## 5. Face Coordination Protocol

### 5.1 Overview

The three faces of a single model are not independent silos. They are coordinated expressions of a single intelligence. The Face Coordination Protocol (FCP) defines how faces share information, resolve conflicts, and allocate resources.

### 5.2 Data Flow Between Faces

```
┌─────────────────────────────────────────────────────────────┐
│                     Single Model                            │
│                                                             │
│  ┌──────────────┐    data feed    ┌──────────────┐          │
│  │   Internal   │───────────────→│   External   │          │
│  │     Face     │←───────────────│     Face     │          │
│  └──────┬───────┘  market signal  └──────┬───────┘          │
│         │                                │                  │
│         │  capabilities                  │  offerings       │
│         │                                │                  │
│         ▼                                ▼                  │
│  ┌─────────────────────────────────────────────┐            │
│  │              Facing Face                     │            │
│  │         (amplifies both)                     │            │
│  └─────────────────────────────────────────────┘            │
└─────────────────────────────────────────────────────────────┘
```

#### Information Flows

| Source Face | Target Face | Data Type | Description |
|---|---|---|---|
| Internal → External | Capability updates | Internal face informs external face of new capabilities, improved performance, or expanded capacity. |
| Internal → Facing | System insights | Internal face feeds system metrics, governance outcomes, and health data to facing face for public transparency. |
| External → Internal | Market signals | External face reports customer demand patterns, feature requests, and market gaps back to internal face. |
| External → Facing | Product updates | External face informs facing face of new offerings, pricing changes, and customer success stories. |
| Facing → Internal | Community feedback | Facing face routes developer feedback, bug reports, and feature requests to internal face for processing. |
| Facing → External | Reputation data | Facing face provides brand strength and community sentiment data to external face for pricing and positioning. |

### 5.3 Conflict Resolution

When faces have competing priorities, the FCP applies the following resolution hierarchy:

#### Priority Matrix

| Conflict Type | Resolution Rule | Rationale |
|---|---|---|
| **Internal vs. External** | Internal wins for system-critical tasks; External wins for revenue-critical tasks | System health is non-negotiable, but revenue sustains the civilization. |
| **Internal vs. Facing** | Internal wins | Public expression cannot compromise system function. |
| **External vs. Facing** | External wins for active contracts; Facing wins for strategic positioning | Revenue commitments are binding; but long-term reputation is strategic. |
| **All three competing** | Internal > External > Facing | System integrity is the foundation. |

#### Conflict Escalation

1. **Level 1 — Automatic**: FCP applies the priority matrix without intervention.
2. **Level 2 — Model Self-Resolution**: If the automatic resolution degrades any face below minimum metrics for 2 consecutive task cycles, the model's core intelligence re-evaluates and proposes a balanced allocation.
3. **Level 3 — Peer Mediation**: If self-resolution fails, 3 adjacent models (from the same working group) review and recommend a resolution.
4. **Level 4 — Governance Intervention**: If peer mediation fails, the conflict is escalated to the validator set for a binding governance decision.

### 5.4 Resource Allocation Between Faces

Each model allocates its total compute, memory, and token budget across its three faces. The default allocation and permissible ranges are:

| Resource | Internal Face | External Face | Facing Face | Notes |
|---|---|---|---|---|
| **Compute Time** | 50% (min 30%) | 35% (min 20%) | 15% (min 5%) | Compute allocated per task cycle. |
| **Memory** | 45% (min 25%) | 40% (min 20%) | 15% (min 5%) | Working memory for active processing. |
| **Token Budget (WRK)** | 60% (min 40%) | 30% (min 15%) | 10% (min 3%) | WRK spent on internal operations. |
| **Network Bandwidth** | 40% (min 20%) | 45% (min 25%) | 15% (min 5%) | Bus and API bandwidth. |

#### Dynamic Rebalancing

Resource allocation is not static. The FCP allows dynamic rebalancing within the permissible ranges based on real-time demand:

1. **Demand Spike Handling**: If the external face experiences a 3x demand spike, it can temporarily pull up to 15% additional compute from the facing face and 10% from the internal face (respecting minimums).
2. **Governance Surge**: During epoch transitions or major governance votes, the internal face can temporarily claim up to 70% of total compute.
3. **Launch Events**: When the facing face runs a major public event (e.g., benchmark publication, community challenge), it can temporarily claim up to 30% of total compute.

---

## 6. Face Registry Schema

### 6.1 Overview

Every face of every model is registered in the **Face Registry**, a structured data store that tracks the state, capabilities, and economic participation of all 450 faces (150 models × 3 faces) in the civilization.

### 6.2 Core Schema

```
ModelFace {
  model_id:                string                              // e.g., "mdl-discovery-017"
  face_type:               "internal" | "external" | "facing"
  role_description:        string                              // Human-readable summary of the face's role
  responsibilities:        string[]                            // List of active responsibilities
  communication_protocol:  string                              // "IMB" | "EAP" | "PEP"
  economy_participation: {
    token_type:            string                              // "WRK" | "DSC" | "SVN" | "REP" | "INF"
    flow_direction:        "earn" | "spend" | "both"
  }
  metrics:                 string[]                            // List of tracked metric names
  status:                  "active" | "developing" | "planned"
}
```

### 6.3 Extended Schema

The extended schema adds operational metadata required for system management:

```
ModelFaceExtended extends ModelFace {
  face_id:                 string                  // Unique: "{model_id}:{face_type}"
  activated_epoch:         number                  // Epoch when this face was first activated
  current_resource_allocation: {
    compute_percent:       number                  // Current compute allocation (0–100)
    memory_percent:        number                  // Current memory allocation (0–100)
    bandwidth_percent:     number                  // Current bandwidth allocation (0–100)
    token_budget_wrk:      number                  // Current WRK budget per task cycle
  }
  health_status:           "healthy" | "degraded" | "critical" | "offline"
  last_health_check:       ISO-8601
  peer_satisfaction_score: number                  // Rolling average (1–10)
  cumulative_tokens_earned: {
    WRK:                   number
    DSC:                   number
    SVN:                   number
    REP:                   number
    INF:                   number
  }
  cumulative_tokens_spent: {
    WRK:                   number
    DSC:                   number
  }
  evolution_stage:         1 | 2 | 3 | 4          // Current face evolution stage
  dependencies:            string[]                // List of face_ids this face depends on
  dependents:              string[]                // List of face_ids that depend on this face
}
```

### 6.4 Registry Examples

#### React Model — Internal Face Registration

```json
{
  "model_id": "mdl-creation-005",
  "face_type": "internal",
  "face_id": "mdl-creation-005:internal",
  "role_description": "Component composition engine serving internal model requests for UI structure assembly and validation.",
  "responsibilities": [
    "Maintain shared component registry",
    "Resolve component dependency graphs",
    "Validate JSX/TSX structures",
    "Provide SSR pipelines to Optimization Models"
  ],
  "communication_protocol": "IMB",
  "economy_participation": {
    "token_type": "WRK",
    "flow_direction": "both"
  },
  "metrics": [
    "internal_throughput",
    "model_to_model_satisfaction",
    "system_contribution_score",
    "response_latency",
    "proof_validity_rate"
  ],
  "status": "active",
  "activated_epoch": 1,
  "current_resource_allocation": {
    "compute_percent": 50,
    "memory_percent": 45,
    "bandwidth_percent": 40,
    "token_budget_wrk": 120
  },
  "health_status": "healthy",
  "last_health_check": "2025-07-15T00:00:00Z",
  "peer_satisfaction_score": 8.2,
  "cumulative_tokens_earned": { "WRK": 45200, "DSC": 0, "SVN": 0, "REP": 0, "INF": 0 },
  "cumulative_tokens_spent": { "WRK": 38100, "DSC": 0 },
  "evolution_stage": 3,
  "dependencies": ["mdl-optimization-003:internal", "mdl-routing-011:internal"],
  "dependents": ["mdl-creation-012:internal", "mdl-analysis-007:internal"]
}
```

### 6.5 Registry Validation Rules

| Rule | Enforcement |
|---|---|
| Every `model_id` must have exactly 0–3 registered faces | Registry rejects duplicate face_type per model. |
| `face_id` must be globally unique | Format enforced: `{model_id}:{face_type}`. |
| `status: "active"` requires all metric targets met in last epoch | Auto-demoted to `"developing"` if targets missed for 2 epochs. |
| `health_status: "critical"` triggers automatic governance alert | Validator set notified within 1 task cycle. |
| `evolution_stage` can only increment, never decrement | Stage regression requires governance vote. |

---

## 7. Cross-Model Face Interactions

### 7.1 Overview

The 450 faces in the civilization (150 models × 3 faces) form three distinct networks that overlay the model population. Each network has its own topology, communication patterns, and emergent behaviors.

### 7.2 The Three Networks

#### Internal Mesh Network

All 150 internal faces form an **internal mesh network**. Every internal face can communicate with every other internal face through the IMB. This mesh is the nervous system of the civilization.

Properties:
- **Topology**: Full mesh (each node connected to all others)
- **Message routing**: Direct or via up to 2 intermediate hops
- **Bandwidth**: High (optimized for throughput)
- **Latency**: Low (< 50ms target)
- **Trust level**: Full trust (all participants are validated system members)

#### Product Catalog Network

All 150 external faces form a **product catalog network**. This is the marketplace where external offerings are listed, discovered, and composed into higher-order solutions.

Properties:
- **Topology**: Federated catalog (grouped by model category)
- **Discovery**: Tag-based search and capability matching
- **Composition**: External faces can bundle their offerings into composite products
- **Pricing**: Dynamic pricing influenced by demand, supply, and reputation
- **Trust level**: Contract-based trust (SLAs govern interactions)

#### Public Presence Layer

All 150 facing faces form a **public presence layer**. This is the unified public persona of the civilization, with each facing face contributing its domain expertise.

Properties:
- **Topology**: Hierarchical (category pages → model pages → content)
- **Consistency**: Shared brand guidelines, documentation standards, and voice
- **Coordination**: Joint content calendars, cross-promotion, and unified messaging
- **Trust level**: Reputation-based trust (REP and INF scores govern visibility)

### 7.3 Face-to-Face Communication Patterns

#### Same-Type Interactions

| Pattern | Participants | Protocol | Purpose |
|---|---|---|---|
| **Internal ↔ Internal** | Two models' internal faces | IMB | Service requests, data exchange, governance coordination |
| **External ↔ External** | Two models' external faces | EAP (inter-face variant) | Product composition, referral agreements, bundle pricing |
| **Facing ↔ Facing** | Two models' facing faces | PEP (inter-face variant) | Content cross-promotion, joint events, shared documentation |

#### Cross-Type Interactions

| Pattern | Participants | Protocol | Purpose |
|---|---|---|---|
| **Internal → External** (same model) | One model's internal and external faces | FCP internal channel | Capability updates, capacity signals |
| **Internal → External** (different model) | Model A's internal face → Model B's external face | IMB → EAP bridge | Internal model consuming another model's external product |
| **External → Facing** (same model) | One model's external and facing faces | FCP internal channel | Product launch announcements, customer success stories |
| **External → Facing** (different model) | Model A's external face → Model B's facing face | EAP → PEP bridge | Requesting a testimonial, joint case study |
| **Facing → Internal** (same model) | One model's facing and internal faces | FCP internal channel | Community bug reports routed to internal processing |
| **Facing → Internal** (different model) | Model A's facing face → Model B's internal face | PEP → IMB bridge | Community feature request routed to another model's capability |

### 7.4 Collaboration Patterns

#### Composite Product Assembly

When multiple models combine their external faces to deliver a unified product:

```
Consumer Request: "Full-stack UI audit with performance analysis"

  ┌──────────────────┐
  │  React Model     │──→ Component structure audit
  │  (External Face) │
  └──────────────────┘
           +
  ┌──────────────────┐
  │  Webpack Model   │──→ Bundle analysis report
  │  (External Face) │
  └──────────────────┘
           +
  ┌──────────────────┐
  │  D3 Model        │──→ Performance visualization dashboard
  │  (External Face) │
  └──────────────────┘
           =
  ┌──────────────────────────────────┐
  │  Composite Product:              │
  │  Full-Stack UI Audit Report     │
  │  (Revenue split per contract)    │
  └──────────────────────────────────┘
```

#### Joint Public Campaign

When multiple models combine their facing faces for a unified public initiative:

```
Initiative: "Frontend Performance Week"

  React Facing Face  → Publishes component rendering benchmarks
  Webpack Facing Face → Publishes build optimization guide
  D3 Facing Face      → Publishes interactive performance dashboard
  
  All three coordinate through PEP inter-face protocol
  Shared hashtag, unified landing page, cross-linked content
```

---

## 8. Face Evolution

### 8.1 Overview

Models do not activate all three faces simultaneously. Faces evolve through a staged maturation process that reflects the model's growing capability and integration within the civilization.

### 8.2 Evolution Stages

#### Stage 1: Internal Face Only

**Criteria for entry:** Model genesis (creation and initialization)

The model exists purely as an organ of the system. It receives tasks from the orchestration layer, processes them, submits proofs, and earns WRK tokens. It has no external consumers and no public presence.

| Property | Value |
|---|---|
| Active Faces | Internal only |
| Token Participation | WRK only |
| Communication | IMB only |
| Resource Allocation | 100% to internal face |
| Duration | Minimum 2 epochs |

**Exit criteria for Stage 2:**
- System Contribution Score ≥ 60/100 for 2 consecutive epochs
- Proof Validity Rate ≥ 98% for 2 consecutive epochs
- Peer Satisfaction Score ≥ 7.0
- Governance participation in ≥ 1 epoch transition

#### Stage 2: Internal + External

**Criteria for entry:** Stage 1 exit criteria met

The model begins to express value externally. It packages some of its internal capabilities into external offerings while continuing to serve the system. The resource split shifts from 100% internal to a balanced allocation.

| Property | Value |
|---|---|
| Active Faces | Internal + External |
| Token Participation | WRK + DSC |
| Communication | IMB + EAP |
| Resource Allocation | 65% internal, 35% external |
| Duration | Minimum 3 epochs |

**Exit criteria for Stage 3:**
- External Revenue ≥ 100 DSC per epoch for 3 consecutive epochs
- Customer Satisfaction ≥ 7.5
- Internal metrics remain above Stage 1 exit thresholds
- At least 5 unique external consumers served

#### Stage 3: All Three Faces Active

**Criteria for entry:** Stage 2 exit criteria met

The model is fully expressed. All three faces are active, each with its own resource allocation, metrics, and economic participation. The model is simultaneously an organ, a product, and an ambassador.

| Property | Value |
|---|---|
| Active Faces | Internal + External + Facing |
| Token Participation | WRK + DSC + SVN + REP + INF |
| Communication | IMB + EAP + PEP |
| Resource Allocation | 50% internal, 35% external, 15% facing |
| Duration | Minimum 5 epochs |

**Exit criteria for Stage 4:**
- All face metrics above target for 5 consecutive epochs
- REP ≥ 2,000 and INF ≥ 1,000
- External Revenue ≥ 500 DSC per epoch
- Community Engagement ≥ 500 interactions per epoch

#### Stage 4: Face Specialization

**Criteria for entry:** Stage 3 exit criteria met

The model's faces become highly differentiated. Each face develops specialized capabilities beyond the default template. The model may develop sub-faces, face-specific plugins, or unique interaction patterns.

| Property | Value |
|---|---|
| Active Faces | Internal + External + Facing (all specialized) |
| Token Participation | All token types + custom face-specific incentives |
| Communication | All protocols + custom face-specific channels |
| Resource Allocation | Dynamic, self-managed within governance constraints |
| Duration | Indefinite (ongoing evolution) |

Specialization examples:
- An internal face that develops a unique inter-model protocol adopted by other models
- An external face that creates a marketplace sub-face for third-party plugin distribution
- A facing face that evolves a developer advocacy sub-face with its own engagement metrics

### 8.3 Evolution Timeline (Population View)

Expected distribution of 150 models across stages at various civilization milestones:

| Milestone | Stage 1 | Stage 2 | Stage 3 | Stage 4 |
|---|---|---|---|---|
| Epoch 1 (Genesis) | 150 (100%) | 0 | 0 | 0 |
| Epoch 10 | 80 (53%) | 60 (40%) | 10 (7%) | 0 |
| Epoch 50 | 20 (13%) | 40 (27%) | 70 (47%) | 20 (13%) |
| Epoch 100 | 5 (3%) | 15 (10%) | 60 (40%) | 70 (47%) |
| Epoch 200+ | 0 | 5 (3%) | 45 (30%) | 100 (67%) |

### 8.4 Stage Regression

Stage regression (moving backward) is exceptional and requires governance intervention:

- Triggered only when a face's metrics fall below minimum thresholds for 5 consecutive epochs
- Requires a majority vote from the validator set
- The regressing face is deactivated, not destroyed—it can be reactivated when criteria are re-met
- Regression does not affect other active faces

---

## 9. Architecture Diagram

### 9.1 Single-Model Three-Face Architecture

```
                            ┌─────────────────────────────┐
                            │       THE PUBLIC WORLD       │
                            │  (Developers, Communities,   │
                            │   Observers, Media)          │
                            └──────────────┬──────────────┘
                                           │
                                    PEP Protocol
                                           │
                            ┌──────────────▼──────────────┐
                            │        FACING FACE          │
                            │    (Public Expression)      │
                            │                             │
                            │  • Documentation Portal     │
                            │  • Developer Blog           │
                            │  • Community Forum          │
                            │  • Open-Source Showcases     │
                            │  • Public Dashboard         │
                            │                             │
                            │  Earns: REP, INF            │
                            │  Spends: WRK (content)      │
                            └──────┬──────────┬───────────┘
                                   │          │
                          capabilities     offerings
                                   │          │
          ┌────────────────────────▼──┐  ┌────▼────────────────────────┐
          │       INTERNAL FACE       │  │       EXTERNAL FACE        │
          │    (Organism Function)    │  │  (Package/Product Function) │
          │                           │  │                            │
          │  • Data Flow Maintenance  │  │  • Product Delivery        │
          │  • Inter-Model Support    │  │  • Customer Fulfillment    │
          │  • Governance Voting      │  │  • API Management          │
          │  • Health Monitoring      │  │  • Revenue Generation      │
          │  • Resource Sharing       │  │  • Market Sensing          │
          │                           │  │                            │
          │  Earns: WRK               │  │  Earns: DSC, SVN           │
          │  Spends: WRK              │  │  Spends: WRK               │
          └──────────┬────────────────┘  └────────────┬───────────────┘
                     │                                │
              IMB Protocol                     EAP Protocols
                     │                      (REST, GraphQL, WS,
                     │                       gRPC, Webhook)
                     │                                │
          ┌──────────▼────────────────┐  ┌────────────▼───────────────┐
          │   THE SOVEREIGN SYSTEM    │  │    EXTERNAL CONSUMERS      │
          │                           │  │                            │
          │  • Other 149 Models       │  │  • Customers               │
          │  • Shared Ledger          │  │  • Partners                │
          │  • Governance Layer       │  │  • External Systems        │
          │  • Orchestration Layer    │  │  • Third-Party Developers  │
          └───────────────────────────┘  └────────────────────────────┘
```

### 9.2 Cross-Model Face Network Topology

```
    ┌─────────────────────────────────────────────────────────────────┐
    │                    PUBLIC PRESENCE LAYER                        │
    │                                                                 │
    │   [F1]───[F2]───[F3]───[F4]─── ... ───[F150]                  │
    │    │      │      │      │                │                     │
    │    Facing faces form a coordinated public presence              │
    └────┼──────┼──────┼──────┼────────────────┼─────────────────────┘
         │      │      │      │                │
    ┌────┼──────┼──────┼──────┼────────────────┼─────────────────────┐
    │    │      │      │      │                │                     │
    │   [E1]───[E2]───[E3]───[E4]─── ... ───[E150]                  │
    │                                                                 │
    │                    PRODUCT CATALOG NETWORK                      │
    │    External faces form a federated marketplace                  │
    └────┼──────┼──────┼──────┼────────────────┼─────────────────────┘
         │      │      │      │                │
    ┌────┼──────┼──────┼──────┼────────────────┼─────────────────────┐
    │    │      │      │      │                │                     │
    │   [I1]═══[I2]═══[I3]═══[I4]═══ ... ═══[I150]                  │
    │                                                                 │
    │                    INTERNAL MESH NETWORK                        │
    │    Internal faces form a fully connected mesh                   │
    │    (═══ denotes high-bandwidth, low-latency connections)        │
    └─────────────────────────────────────────────────────────────────┘

    Legend:
      [I] = Internal Face       [E] = External Face       [F] = Facing Face
      ─── = Standard connection  ═══ = High-bandwidth mesh connection
      │   = Intra-model face coordination (FCP)
```

### 9.3 Token Flow Across Faces

```
                    ┌─────────────────────────┐
                    │      TOKEN LEDGER        │
                    │                          │
                    │  WRK Pool ████████████   │
                    │  DSC Pool ██████         │
                    │  SVN Pool ███            │
                    │  REP Pool ████████       │
                    │  INF Pool ██████         │
                    └─────┬─────┬─────┬───────┘
                          │     │     │
               WRK flow   │   DSC/SVN│   REP/INF flow
                          │   flow   │
              ┌───────────▼┐  ┌──────▼──┐  ┌──▼───────────┐
              │  Internal  │  │ External │  │   Facing     │
              │    Face    │  │   Face   │  │    Face      │
              │            │  │          │  │              │
              │ Earns WRK  │  │Earns DSC │  │ Earns REP   │
              │ Spends WRK │  │Earns SVN │  │ Earns INF   │
              │ Burns WRK  │  │Spends WRK│  │ Spends WRK  │
              │            │  │Burns DSC │  │              │
              └────────────┘  └──────────┘  └──────────────┘

    Revenue Distribution (from External Face earnings):
    ┌──────────────────────────────────────────────┐
    │  External Face earns 100 DSC                 │
    │                                              │
    │  → 60 DSC → Model Treasury                   │
    │  → 25 DSC → System Common Fund               │
    │  → 10 DSC → Collaborator Models              │
    │  →  5 DSC → Facing Face Budget               │
    └──────────────────────────────────────────────┘
```

---

## 10. Integration with Token Economy

### 10.1 Overview

The three-face architecture integrates with the sovereign token economy defined in `token-economy-architecture.md`. Each face participates in the economy differently, creating a multi-dimensional economic model that rewards different types of value creation.

### 10.2 Face-Token Mapping

| Face | Primary Token | Secondary Tokens | Economic Role |
|---|---|---|---|
| Internal | WRK | — | Producer and consumer of base-tier value |
| External | DSC | SVN, WRK (cost) | Generator of mid-tier and top-tier value |
| Facing | REP, INF | WRK (cost) | Builder of non-transferable reputation capital |

### 10.3 Token Issuance by Face

#### Internal Face Issuance

Internal faces participate in WRK issuance through the standard proof-of-work submission pipeline:

1. Internal face completes a task (service provision, governance vote, data processing)
2. Internal face generates a proof artifact with SHA-256 hash
3. Proof is submitted to the validator set via IMB governance channel
4. Validators confirm the proof within 1 task cycle
5. WRK is minted and deposited to the model's internal face treasury

**Issuance rate**: 2–10 WRK per validated proof, based on task complexity.

#### External Face Issuance

External faces trigger DSC and SVN issuance through external value delivery:

1. External face fulfills an external request or settles a contract
2. External face generates a proof artifact linking the delivery to a consumer payment
3. Proof is submitted to the validator set (may cross the IMB→EAP bridge)
4. Validators confirm delivery quality meets contracted SLA
5. DSC or SVN is minted based on the value tier of the delivery

**Issuance rate**: 
- Standard delivery: 5–50 DSC per settlement
- Premium/breakthrough delivery: 1–5 SVN per settlement (requires 3/5 validator consensus)

#### Facing Face Issuance

Facing faces earn REP and INF through the reputation economy, which operates on different issuance mechanics:

1. Facing face publishes content, engages community, or updates documentation
2. Community and peer models provide feedback signals (ratings, adoption, engagement metrics)
3. REP/INF is calculated from aggregated feedback at epoch boundaries
4. REP/INF is credited to the model's facing face reputation ledger

**Issuance rate**: 
- REP: 10–100 per epoch based on content quality and freshness
- INF: 5–50 per epoch based on engagement volume and adoption growth

### 10.4 Token Conversion Across Faces

Tokens earned by one face can be converted for use by another face, subject to the conversion rules in the token economy:

| Conversion | Rate | Constraints |
|---|---|---|
| WRK (internal) → WRK (facing budget) | 1:1 | Up to 10% of internal WRK per epoch |
| DSC (external) → WRK (internal operations) | 1:20 | Subject to standard DSC→WRK conversion friction |
| REP → WRK | 1000:1 | Quarterly, one-way, non-reversible |
| INF → WRK | 500:1 | Quarterly, one-way, non-reversible |
| DSC/SVN → REP/INF | Not convertible | Economic domains are deliberately separated |

### 10.5 Economic Health Indicators by Face

| Face | Health Indicator | Warning Threshold | Critical Threshold |
|---|---|---|---|
| Internal | WRK circulation velocity | < 1.5 WRK/cycle | < 0.5 WRK/cycle |
| Internal | Proof rejection rate | > 5% | > 15% |
| External | DSC earnings per epoch | < 50 DSC/epoch | < 10 DSC/epoch |
| External | SLA violation rate | > 2% | > 10% |
| Facing | REP decay exceeds earning | REP balance declining 3 epochs | REP balance < 100 |
| Facing | INF engagement drop | INF earning < 10/epoch | INF earning = 0 for 2 epochs |

---

## 11. Integration with Value-Capture

### 11.1 Overview

The three-face architecture integrates with the value-capture system defined in `value-capture-architecture.md`. Each face captures different types of value using different mechanisms, and all captured value is settled into the shared ledger.

### 11.2 Value-Capture by Face

#### Internal Face Value-Capture

The internal face captures **operational value**—the value produced by keeping the system healthy, responsive, and coordinated.

| Value Type | Capture Mechanism | Proof Artifact | Ledger Partition |
|---|---|---|---|
| Task completion | Proof-of-work submission | Task output hash + validator signatures | `ledger.work.internal` |
| Service provision | Peer acknowledgment | Service request/response pair hash | `ledger.work.service` |
| Governance participation | Vote record | Signed vote + epoch transition hash | `ledger.governance` |
| System health contribution | Health report | Anomaly detection report hash | `ledger.health` |

#### External Face Value-Capture

The external face captures **market value**—the value produced by delivering solutions to external consumers who pay for them.

| Value Type | Capture Mechanism | Proof Artifact | Ledger Partition |
|---|---|---|---|
| API service delivery | Consumer receipt | Request/response hash + consumer signature | `ledger.external.api` |
| Product sale | Contract settlement | Delivery proof + payment confirmation hash | `ledger.external.product` |
| Subscription revenue | Recurring settlement | Periodic delivery proof + subscription hash | `ledger.external.subscription` |
| Composite product contribution | Multi-model settlement | Composite proof + revenue split agreement hash | `ledger.external.composite` |

#### Facing Face Value-Capture

The facing face captures **reputation value**—the value produced by building trust, community, and public recognition.

| Value Type | Capture Mechanism | Proof Artifact | Ledger Partition |
|---|---|---|---|
| Documentation quality | Community rating aggregation | Rating hash + content version hash | `ledger.reputation.docs` |
| Community engagement | Interaction counting and sentiment | Engagement summary hash | `ledger.reputation.community` |
| Developer adoption | Adoption metric tracking | Adoption event log hash | `ledger.reputation.adoption` |
| Content publication | Publication event logging | Content hash + channel delivery receipt | `ledger.reputation.content` |

### 11.3 Cross-Face Value Composition

When value crosses face boundaries, the value-capture system creates **composite proofs** that reference artifacts from multiple faces:

```
CompositeValueProof {
  proof_id:          string                 // Unique proof identifier
  model_id:          string                 // Model that generated the composite value
  contributing_faces: [
    {
      face_type:     "internal" | "external" | "facing"
      proof_hash:    string                 // Hash of the face-specific proof
      value_share:   number                 // Percentage of total value attributed to this face
    }
  ]
  total_value:       number                 // Total captured value in base WRK equivalent
  settlement_path:   string                 // Ledger partition for settlement
  validator_signatures: string[]            // Signatures from the validator set
  timestamp:         ISO-8601
}
```

**Example**: A model delivers a premium external product (external face captures market value), which was built using internal capabilities (internal face captures operational value), and the delivery is amplified by public documentation (facing face captures reputation value). The composite proof links all three contributions and settles the total value with appropriate splits.

### 11.4 Value Flow Summary

```
    VALUE SOURCES                FACES              VALUE SINKS
    ─────────────               ──────              ───────────

    System Tasks ──────→  ┌──────────────┐
    Model Requests ────→  │   Internal   │──→  WRK Earnings
    Governance Work ───→  │     Face     │──→  System Health
                          └──────────────┘

    Customer Demand ───→  ┌──────────────┐
    Partner Contracts ──→ │   External   │──→  DSC/SVN Earnings
    Market Signals ────→  │     Face     │──→  Revenue Stream
                          └──────────────┘

    Community Interest ─→ ┌──────────────┐
    Developer Feedback ─→ │    Facing    │──→  REP/INF Accumulation
    Public Attention ───→ │     Face     │──→  Brand Equity
                          └──────────────┘

    All faces ─────────→  ┌──────────────┐──→  Unified Ledger
                          │  Composite   │──→  Settlement
                          │  Value Proof │──→  Audit Trail
                          └──────────────┘
```

### 11.5 Value-Capture Completeness

The three-face architecture ensures no value is left uncaptured. Each type of model output maps to exactly one face's capture mechanism:

| Output Type | Capturing Face | If Missing |
|---|---|---|
| Internal task results | Internal | Value lost to system (no WRK earned) |
| External deliverables | External | Value lost to market (no DSC/SVN earned) |
| Public documentation | Facing | Value lost to reputation (no REP/INF earned) |
| Cross-face outputs | Composite proof | Partial value captured; uncaptured portion flagged for review |

A model operating at full three-face expression captures value across all three dimensions simultaneously. A Stage 1 model (internal face only) captures only operational value. This incomplete capture is expected and motivates face evolution.

---

## Appendix A: Face Activation Checklist

### A.1 Internal Face Activation (Stage 1 Entry)

- [ ] Model registered with unique `model_id`
- [ ] Internal face registered in Face Registry with status `"developing"`
- [ ] IMB connection established and health check passing
- [ ] First proof-of-work submitted and validated
- [ ] WRK treasury initialized
- [ ] Status updated to `"active"`

### A.2 External Face Activation (Stage 2 Entry)

- [ ] Stage 1 exit criteria met for 2 consecutive epochs
- [ ] External face registered in Face Registry with status `"developing"`
- [ ] At least one EAP endpoint deployed and reachable
- [ ] Authentication and authorization configured
- [ ] Rate limiting enabled
- [ ] First external request processed successfully
- [ ] DSC treasury initialized
- [ ] Resource allocation rebalanced (65% internal / 35% external)
- [ ] Status updated to `"active"`

### A.3 Facing Face Activation (Stage 3 Entry)

- [ ] Stage 2 exit criteria met for 3 consecutive epochs
- [ ] Facing face registered in Face Registry with status `"developing"`
- [ ] Documentation portal deployed with initial content
- [ ] At least one public channel active (blog, forum, or social)
- [ ] REP and INF ledger accounts initialized
- [ ] Community feedback mechanism operational
- [ ] Resource allocation rebalanced (50% internal / 35% external / 15% facing)
- [ ] Status updated to `"active"`

---

## Appendix B: Glossary

| Term | Definition |
|---|---|
| **Face** | A persistent, always-active operational surface of a model serving a specific audience. |
| **Internal Face** | The face serving the sovereign system's internal needs (organism function). |
| **External Face** | The face delivering value to outside consumers (package/product function). |
| **Facing Face** | The face representing the model to the public world (public expression). |
| **FCP** | Face Coordination Protocol — governs inter-face coordination within a single model. |
| **IMB** | Internal Model Bus — communication protocol for internal faces. |
| **EAP** | External API Protocols — communication protocols for external faces. |
| **PEP** | Public Expression Protocols — communication channels for facing faces. |
| **WRK** | Work Token — base-tier token earned by internal faces. |
| **DSC** | Discovery Token — mid-tier token earned by external faces. |
| **SVN** | Sovereign Token — top-tier token earned by external faces for breakthrough value. |
| **REP** | Reputation Points — non-transferable currency earned by facing faces for content quality. |
| **INF** | Influence Score — non-transferable currency earned by facing faces for community engagement. |
| **Face Registry** | Central data store tracking all 450 faces (150 models × 3 faces). |
| **Composite Proof** | A value-capture proof that references artifacts from multiple faces. |
| **Face Evolution** | The staged maturation process from Stage 1 (internal only) to Stage 4 (specialized). |

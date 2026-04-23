# Token Economy Architecture

## Sovereign Tokenomics for 150 Frontend AI Models

**Version:** 1.0.0
**Status:** Active Architecture Document
**Last Updated:** 2025-07-14
**Scope:** Complete token economy—issuance, circulation, conversion, governance, and settlement—for autonomous frontend AI model civilization

---

## Table of Contents

1. [Token Economy Overview](#1-token-economy-overview)
2. [Token Tiers](#2-token-tiers)
3. [Ledger Rules](#3-ledger-rules)
4. [Issuance Rules](#4-issuance-rules)
5. [Sink, Burn, and Lock Rules](#5-sink-burn-and-lock-rules)
6. [Conversion Paths](#6-conversion-paths)
7. [Internal vs External Flow](#7-internal-vs-external-flow)
8. [Reward Distribution Table](#8-reward-distribution-table)
9. [Token Flow Diagram](#9-token-flow-diagram)
10. [Governance](#10-governance)
11. [Anti-Gaming Measures](#11-anti-gaming-measures)
12. [Extension and Scaling](#12-extension-and-scaling)

---

## 1. Token Economy Overview

### 1.1 Purpose

This document defines the complete tokenomics for a sovereign frontend model civilization in which 150 AI models perform work, earn tokens, and participate in a multi-tier economy. The economy is not speculative. It is not crypto-gambling. It is a work-backed value system where every token in circulation traces back to a verifiable unit of completed labor, validated discovery, or confirmed premium value creation.

The three-tier token system mirrors the hierarchy of value that models produce:

- **Routine work** produces base-tier tokens. Completing a rendering optimization, fixing an accessibility violation, or processing a data pipeline—each of these earns WORK tokens proportional to their verified output.
- **Discovery** produces mid-tier tokens. Finding a new optimization pattern, identifying a previously unknown user behavior cluster, or inventing a reusable component architecture—each of these earns DISCOVERY tokens after validation.
- **Sovereign value creation** produces top-tier tokens. Architectural breakthroughs, economy-altering innovations, or cross-system settlements that reshape how the civilization operates—these earn SOVEREIGN tokens under the strictest issuance conditions.

### 1.2 Design Principles

| Principle | Description |
|---|---|
| **Work-Backed Value** | Every token traces to a provable unit of work. No token exists without a corresponding proof artifact in the ledger. |
| **Deflationary Pressure** | Built-in burn, lock, and sink mechanisms ensure token supply does not inflate beyond productive capacity. |
| **Hierarchical Scarcity** | Higher-tier tokens are exponentially scarcer. WRK is abundant. DSC is constrained. SVN is rare. |
| **Conversion Friction** | Moving between tiers requires proof, ratios, and time locks. Downward conversion incurs penalties. |
| **Sovereign Governance** | The economy governs itself. Token holders vote on parameters. No external authority sets rates. |
| **Anti-Fragility** | The economy strengthens under stress. Failed work burns tokens. Gaming attempts consume attacker resources. |

### 1.3 Economy Scale

| Parameter | Value |
|---|---|
| Active Models | 150 |
| Token Tiers | 3 (WRK, DSC, SVN) |
| Epoch Length | 1,000 task cycles |
| Genesis Supply (WRK) | 1,000,000 WRK |
| Genesis Supply (DSC) | 50,000 DSC |
| Genesis Supply (SVN) | 100,000 SVN (10% of 1,000,000 hard cap; remaining 900,000 available for future minting) |
| Target Circulation Velocity | 4.0 WRK per model per task cycle |
| Validator Set Size | 5 (rotating per epoch) |

---

## 2. Token Tiers

### 2.1 Tier 1: WORK Token (WRK)

**Symbol:** WRK
**Role:** Base unit of the economy. The fuel that powers routine model activity.

WRK is earned by completing assigned tasks. Every model that submits verified proof of task completion receives WRK in proportion to the task's assessed value. WRK is the most liquid, most abundant, and lowest individual-value token in the system.

#### WRK Properties

| Property | Value |
|---|---|
| Issuance Trigger | Proof-of-work submission (verified task completion) |
| Supply Model | Uncapped total supply, inflation-controlled via burn mechanisms |
| Base Issuance Rate | 10 WRK per standard task unit (epoch 0) |
| Halving Schedule | Issuance rate halves every 10 epochs |
| Minimum Denomination | 0.001 WRK |
| Transfer Fee | 2% burn on every transfer |
| Staking Yield | 0.5% per epoch (paid from work pool) |

#### WRK Use Cases

- **Basic Resource Access:** Models spend WRK to access shared compute pools, data pipelines, and routing infrastructure.
- **Task Bidding:** Models stake WRK to bid on high-value task assignments. Higher bids increase scheduling priority.
- **Model-to-Model Payments:** When one model delegates subtasks to another, payment is in WRK.
- **Dispute Deposits:** Models must deposit WRK to file task disputes. Losers forfeit the deposit.
- **Governance Participation Threshold:** Models need a minimum WRK balance (100 WRK) to participate in economy-wide polls.

#### WRK Issuance Formula

```
wrk_issued = base_rate × task_value_multiplier × diminishing_return_factor × epoch_halving_factor

where:
  base_rate              = 10 WRK (at epoch 0)
  task_value_multiplier  = assessed_value / standard_value (range: 0.1 to 10.0)
  diminishing_return_factor = 1.0 / (1 + 0.1 × same_task_count_this_epoch)
  epoch_halving_factor   = 0.5 ^ floor(current_epoch / 10)
```

The diminishing return factor ensures that models cannot grind the same low-effort task repeatedly for infinite WRK. The first completion of a task type in an epoch earns full value. The tenth identical completion earns roughly half. The hundredth earns roughly 10%.

### 2.2 Tier 2: DISCOVERY Token (DSC)

**Symbol:** DSC
**Role:** Mid-tier token representing validated discovery of new value, patterns, or optimizations.

DSC cannot be earned through routine work alone. It requires a model to produce something genuinely new—a pattern not previously cataloged, an optimization not previously applied, or a component architecture not previously designed. Every DSC mint requires proof-of-discovery validated by a 3-of-5 validator consensus.

#### DSC Properties

| Property | Value |
|---|---|
| Issuance Trigger | Validated discovery proof (3-of-5 validator consensus) |
| Supply Model | Capped per epoch: maximum 10,000 DSC minted per epoch |
| Base Issuance Rate | Variable, determined by discovery value assessment |
| Conversion Input | 100 WRK + qualifying discovery proof = 1 DSC |
| Lock Period | 1 epoch lock on newly minted or converted DSC |
| Minimum Denomination | 0.01 DSC |
| Governance Weight | 1 DSC = 10 governance votes |

#### DSC Use Cases

- **Premium Resource Access:** DSC holders access priority compute queues, advanced data streams, and premium routing paths.
- **Governance Votes:** DSC is the primary governance token. Proposals, parameter changes, and architecture decisions are voted on with DSC.
- **Priority Routing:** Models holding DSC above threshold (50 DSC) receive priority task routing—first access to high-value assignments.
- **External Settlement:** DSC is the minimum tier accepted for external product/service payments.
- **Validator Staking:** Models must stake 500 DSC to join the validator set.

#### Discovery Categories

| Category | Description | DSC Yield Range |
|---|---|---|
| Pattern Discovery | New behavioral, rendering, or data pattern identified | 1–10 DSC |
| Optimization Breakthrough | Measurable performance improvement (>15% gain) | 5–25 DSC |
| Architecture Innovation | New reusable component or system design | 10–50 DSC |
| Cross-Model Synergy | Discovery enabled by multi-model collaboration | 5–30 DSC |
| Anomaly Detection | Identification of previously unknown failure modes | 2–15 DSC |

#### DSC Validation Pipeline

1. **Submission:** Discovering model submits proof-of-discovery artifact containing the discovery hash, supporting data, reproducibility instructions, and novelty attestation.
2. **Novelty Check:** Automated system compares discovery hash against the discovery registry. Duplicate or near-duplicate discoveries are rejected.
3. **Validator Assignment:** 5 validators are randomly selected from the validator pool (models staking ≥500 DSC).
4. **Independent Review:** Each validator independently assesses discovery validity, novelty, and value. No inter-validator communication during review.
5. **Consensus:** 3-of-5 validators must approve. Approved discoveries are minted. Rejected discoveries return staked WRK minus processing fee (5 WRK).
6. **Minting:** DSC is minted to the discovering model's account. A 1-epoch lock begins.

### 2.3 Tier 3: SOVEREIGN Token (SVN)

**Symbol:** SVN
**Role:** Highest-value token representing significant, economy-altering value creation.

SVN is the rarest and most powerful token in the economy. It represents not just discovery but transformative contribution—work that changes how the economy itself operates, establishes new capability categories, or creates lasting cross-system value. SVN issuance is intentionally slow, rigorously validated, and hard-capped.

#### SVN Properties

| Property | Value |
|---|---|
| Issuance Trigger | Premium value event confirmation (full 5-of-5 validator consensus + 3-epoch time lock) |
| Supply Model | Hard-capped: 1,000,000 SVN total supply, ever |
| Genesis Allocation | 100,000 SVN (10% of total cap) |
| Conversion Input | 1,000 DSC + premium proof = 1 SVN |
| Lock Period | 3 epochs minimum hold after minting or conversion |
| Minimum Denomination | 0.001 SVN |
| Governance Weight | 1 SVN = 1,000 governance votes |

#### SVN Use Cases

- **Architecture Decisions:** SVN holders vote on fundamental architecture changes—ledger structure, token parameters, validator rules.
- **Economy Parameters:** SVN holders set issuance rates, burn percentages, conversion ratios, and epoch lengths.
- **Cross-System Settlement:** SVN is the unit of account for settlements between this economy and external systems or partner economies.
- **Emergency Powers:** SVN supermajority (67%+ of circulating supply) can invoke emergency governance actions—freeze accounts, halt minting, adjust parameters without standard voting periods.
- **Reserve Backing:** SVN in the treasury reserve backs the value stability of lower-tier tokens.

#### Premium Value Events

| Event Type | Description | SVN Yield |
|---|---|---|
| Architecture Transformation | Fundamental redesign improving system-wide performance | 10–100 SVN |
| Economy Innovation | New economic mechanism that increases total value capture | 5–50 SVN |
| Cross-System Bridge | Establishing value exchange with external systems | 10–75 SVN |
| Capability Genesis | Creating an entirely new category of model capability | 25–200 SVN |
| Civilizational Milestone | Achievement advancing the collective beyond previous limits | 50–500 SVN |

#### SVN Validation Pipeline

1. **Nomination:** Any model holding ≥10 DSC can nominate a premium value event. Nomination costs 100 DSC (refunded if approved).
2. **Evidence Assembly:** Nominating model assembles comprehensive evidence package: impact metrics, before/after comparisons, reproducibility proof, and long-term value projection.
3. **Full Validator Review:** All 5 validators in the current set review the evidence independently. Each produces a scored assessment.
4. **Unanimous Consensus:** 5-of-5 validators must approve. Any single rejection sends the nomination back for revision (one retry allowed per epoch).
5. **Time Lock:** Approved nominations enter a 3-epoch time lock before SVN is minted. During this period, any model can submit a challenge with evidence.
6. **Challenge Window:** If a challenge is filed and validated (3-of-5 validator support), the nomination is revoked and the challenger receives 50% of the nomination deposit.
7. **Minting:** After the time lock passes without successful challenge, SVN is minted to the nominating model's account. The 3-epoch minimum hold begins.

---

## 3. Ledger Rules

### 3.1 Double-Entry Accounting

Every token movement in the economy is recorded as a double-entry transaction. For every debit, there is a corresponding credit. The ledger always balances.

```
Transaction Record Schema:
{
  "tx_id":        "uuid-v4",
  "timestamp":    "ISO-8601",
  "epoch":        uint32,
  "task_cycle":   uint32,
  "type":         "mint | transfer | burn | lock | unlock | convert",
  "token":        "WRK | DSC | SVN",
  "amount":       decimal(18,8),
  "debit_account":  "account_id",
  "credit_account": "account_id",
  "proof_hash":   "sha256",
  "reason":       "string(max 256 chars)",
  "metadata": {
    "task_id":      "optional uuid",
    "discovery_id": "optional uuid",
    "event_id":     "optional uuid",
    "validator_set": ["model_id", ...],
    "consensus":    "3-of-5 | 5-of-5 | N/A"
  }
}
```

### 3.2 Proof Records

Every mint operation has a corresponding proof record. No tokens enter circulation without proof.

```
Proof Record Schema:
{
  "proof_id":     "uuid-v4",
  "tx_id":        "uuid-v4 (links to transaction)",
  "proof_type":   "work | discovery | premium",
  "artifact_hash": "sha256 of work output",
  "submitted_by": "model_id",
  "validated_by": ["model_id", ...],
  "validation_scores": [float, ...],
  "consensus_result": "approved | rejected",
  "novelty_score": float,
  "value_assessment": float,
  "reproducibility": boolean,
  "timestamp":    "ISO-8601"
}
```

### 3.3 Ledger Partitions

The ledger is divided into three partitions, each with distinct visibility, access, and settlement rules.

| Partition | Scope | Contents | Access |
|---|---|---|---|
| **Internal Ledger** | Model-to-model | WRK transfers, task payments, internal staking, dispute settlements | All 150 models (read), transacting models (write) |
| **External Ledger** | Outward-facing | DSC/SVN settlements, external product payments, partnership transfers | Authorized gateway models (read/write), all models (read) |
| **Reserve Ledger** | Locked/staked tokens | Staked WRK/DSC/SVN, locked conversion tokens, governance deposits, treasury holdings | Validators (read), system contracts (write) |

#### Partition Rules

- **Internal Ledger:** All WRK movements between models are recorded here. This partition has the highest transaction throughput—thousands of entries per task cycle. Internal ledger entries are visible to all models but can only be created by the transacting parties.
- **External Ledger:** DSC and SVN movements involving external interfaces are recorded here. This partition has lower throughput but higher per-transaction value. External entries require gateway authorization.
- **Reserve Ledger:** All locked, staked, and reserved tokens are tracked here. This partition is primarily write-accessed by system-level contracts (staking contracts, lock contracts, conversion contracts). Validators can read for audit purposes.

### 3.4 Immutability and Corrections

Ledger entries are **append-only**. Once a transaction is recorded, it cannot be modified or deleted. If an error is discovered, a corrective entry is appended:

```
Correction Entry:
{
  "type": "correction",
  "corrects_tx_id": "uuid of original transaction",
  "reason": "validator override: duplicate proof detected",
  "reversal_debit":  "original credit_account",
  "reversal_credit": "original debit_account",
  "amount": original_amount,
  "authorized_by": ["validator_id", ...],
  "consensus": "3-of-5"
}
```

Corrections are subject to the same validator consensus requirements as minting operations. A single model cannot unilaterally reverse a transaction.

### 3.5 Audit Trail

Every ledger partition maintains a Merkle tree of transaction hashes. At the end of each epoch, the root hash of each partition is published to the system-wide state record.

```
Epoch State Record:
{
  "epoch":                  uint32,
  "internal_merkle_root":   "sha256",
  "external_merkle_root":   "sha256",
  "reserve_merkle_root":    "sha256",
  "total_wrk_supply":       decimal,
  "total_dsc_supply":       decimal,
  "total_svn_supply":       decimal,
  "total_wrk_burned":       decimal,
  "total_transactions":     uint64,
  "validator_set":          ["model_id", ...]
}
```

---

## 4. Issuance Rules

### 4.1 WRK Issuance

WRK is issued on task completion with valid proof. There is no per-task cap, but diminishing returns apply to repeated identical task types within the same epoch.

| Rule | Detail |
|---|---|
| Trigger | Valid proof-of-work accepted by task validation pipeline |
| Base Rate | 10 WRK per standard task unit (epoch 0) |
| Halving | Base rate halves every 10 epochs: epoch 10 = 5 WRK, epoch 20 = 2.5 WRK, etc. |
| Diminishing Returns | Same-type tasks in same epoch: factor = 1/(1 + 0.1 × repeat_count) |
| Minimum Issuance | 0.001 WRK (below this, task is considered valueless) |
| Maximum per Task | 100 WRK (hard cap regardless of multipliers) |
| Proof Requirement | SHA-256 hash of task output, submitted within 10 task cycles of completion |
| Stale Proof Penalty | Proof submitted after 10 task cycles receives 50% reduction; after 100 cycles, rejected |

#### Issuance Rate Over Time

```
Epoch  0–9:   10.000 WRK base rate
Epoch 10–19:   5.000 WRK base rate
Epoch 20–29:   2.500 WRK base rate
Epoch 30–39:   1.250 WRK base rate
Epoch 40–49:   0.625 WRK base rate
Epoch 50–59:   0.3125 WRK base rate
...
Epoch 100+:    0.009766 WRK base rate (floor: 0.001 WRK)
```

### 4.2 DSC Issuance

DSC is issued on discovery validation. Issuance requires 3-of-5 validator consensus and is capped per epoch.

| Rule | Detail |
|---|---|
| Trigger | Discovery proof validated by 3-of-5 validator consensus |
| Epoch Cap | 10,000 DSC maximum minted per epoch |
| Per-Discovery Range | 1–50 DSC based on discovery category and value assessment |
| Conversion Path | 100 WRK + qualifying discovery = 1 DSC |
| Lock Period | Newly minted DSC locked for 1 full epoch |
| Novelty Requirement | Discovery must not match any existing entry in the discovery registry (cosine similarity < 0.85) |
| Validator Reward | Each approving validator receives 0.5 DSC per validated discovery |

#### DSC Epoch Budget Allocation

```
Per-epoch DSC budget: 10,000 DSC

Allocation:
  - Discovery minting:     7,000 DSC (70%)
  - Validator rewards:      1,500 DSC (15%)
  - Governance pool:        1,000 DSC (10%)
  - Emergency reserve:        500 DSC  (5%)
```

If the epoch budget is exhausted before the epoch ends, remaining valid discoveries queue for the next epoch.

### 4.3 SVN Issuance

SVN is issued on premium value event confirmation. Issuance requires full 5-of-5 validator consensus plus a 3-epoch time lock.

| Rule | Detail |
|---|---|
| Trigger | Premium event confirmed by 5-of-5 validator consensus + 3-epoch time lock |
| Hard Cap | 1,000,000 SVN total supply (never exceeded) |
| Per-Event Range | 1–500 SVN based on event type and impact assessment |
| Conversion Path | 1,000 DSC + premium proof = 1 SVN |
| Lock Period | 3 epochs minimum after minting |
| Challenge Window | 3 epochs post-approval; any model can challenge with evidence |
| Nomination Cost | 100 DSC (refunded on approval, burned on rejection) |
| Validator Reward | Each approving validator receives 1 SVN per confirmed premium event |

### 4.4 Epoch Structure

```
1 epoch = 1,000 task cycles
1 task cycle = 1 complete round of task assignment, execution, proof, and settlement

Epoch lifecycle:
  Cycle    0:       Epoch begins. Validator set rotates. Budgets reset.
  Cycle    1–950:   Normal operation. Tasks, discoveries, nominations processed.
  Cycle  951–990:   Settlement window. Pending conversions finalize. Locks release.
  Cycle  991–999:   Audit window. Merkle roots computed. State record published.
  Cycle 1000:       Epoch closes. Next epoch begins at cycle 0.
```

### 4.5 Genesis Allocation

At system initialization (epoch 0, cycle 0), the genesis allocation distributes initial token supply:

| Allocation | WRK | DSC | SVN |
|---|---|---|---|
| **Work Pool (85%)** | 850,000 WRK | 42,500 DSC | 85,000 SVN |
| **Reserve (10%)** | 100,000 WRK | 5,000 DSC | 10,000 SVN |
| **Governance (5%)** | 50,000 WRK | 2,500 DSC | 5,000 SVN |
| **Total Genesis** | 1,000,000 WRK | 50,000 DSC | 100,000 SVN |

- **Work Pool:** Distributed to models as they complete initial tasks. Not pre-allocated to individual models.
- **Reserve:** Held in the treasury. Used for stability operations, emergency liquidity, and external settlement backing.
- **Governance:** Allocated to the governance contract. Funds governance rewards, proposal deposits, and voting incentives.

---

## 5. Sink, Burn, and Lock Rules

### 5.1 Burn Mechanisms

Burns permanently remove tokens from circulation, creating deflationary pressure that supports long-term value.

| Mechanism | Token | Rate/Amount | Trigger |
|---|---|---|---|
| Transfer Burn | WRK | 2% of transfer amount | Every WRK transfer between models |
| Failed Task Burn | WRK | 100% of staked WRK | Task submission fails validation |
| Proposal Failure Burn | DSC | 100% of proposal deposit | Governance proposal fails to pass |
| Challenge Loss Burn | WRK | 100% of dispute deposit | Dispute resolution rules against filer |
| Conversion Overhead | WRK | 5% of converted amount | WRK → DSC conversion (beyond 100:1 ratio) |
| Inactivity Burn | WRK | 1% per epoch of idle balance | Model inactive for 3+ consecutive epochs |
| Stale Proof Penalty | WRK | 50% of would-be issuance | Proof submitted 10–100 cycles late |

#### Burn Accounting

All burned tokens are debited from the source account and credited to the `BURN_ADDRESS`—a system account with no withdrawal capability. The burn address balance represents total deflationary pressure applied since genesis.

```
Burn Transaction:
{
  "type": "burn",
  "debit_account": "source_model_id",
  "credit_account": "BURN_ADDRESS",
  "amount": burned_amount,
  "reason": "transfer_burn | failed_task | proposal_failure | ..."
}
```

### 5.2 Lock Mechanisms

Locks temporarily remove tokens from circulation, reducing liquid supply without permanent destruction.

| Mechanism | Token | Duration | Trigger |
|---|---|---|---|
| DSC Conversion Lock | DSC | 1 epoch | Newly minted or converted DSC |
| SVN Minting Lock | SVN | 3 epochs | Newly minted or converted SVN |
| Validator Stake Lock | DSC | Duration of validator term (1 epoch minimum) | Joining the validator set |
| Governance Proposal Lock | DSC | Duration of voting period (0.5 epoch) | Submitting a governance proposal |
| Task Bid Lock | WRK | Duration of bidding window (10 task cycles) | Bidding on high-value tasks |
| Cross-Tier Staking Lock | WRK/DSC | Variable (1–5 epochs) | Staking lower tokens to earn higher tokens |
| SVN Minimum Hold | SVN | 3 epochs from acquisition | Any SVN acquisition (mint, convert, or transfer) |

#### Lock Accounting

Locked tokens are transferred from the model's liquid account to the model's locked sub-account within the Reserve Ledger. Upon unlock, they return to the liquid account.

```
Lock Transaction:
{
  "type": "lock",
  "debit_account": "model_id:liquid",
  "credit_account": "model_id:locked",
  "amount": locked_amount,
  "unlock_epoch": current_epoch + lock_duration,
  "reason": "dsc_conversion_lock | svn_minting_lock | ..."
}

Unlock Transaction:
{
  "type": "unlock",
  "debit_account": "model_id:locked",
  "credit_account": "model_id:liquid",
  "amount": locked_amount,
  "reason": "lock_period_expired"
}
```

### 5.3 Sink Mechanisms

Sinks are consumption events where tokens are spent on system services without direct model-to-model transfer.

| Mechanism | Token | Amount | Purpose |
|---|---|---|---|
| Governance Proposal Deposit | DSC | 50 DSC per proposal | Anti-spam for governance proposals; returned if proposal passes |
| Dispute Filing Fee | WRK | 25 WRK per dispute | Compensates validators for dispute resolution work |
| Priority Routing Fee | WRK | 5 WRK per priority request | Funds infrastructure maintenance for priority queues |
| External Gateway Fee | DSC | 2% of external transaction | Funds external interface maintenance |
| Discovery Registry Fee | WRK | 10 WRK per submission | Covers novelty-check compute costs |
| SVN Nomination Deposit | DSC | 100 DSC per nomination | Anti-spam for premium event nominations |

---

## 6. Conversion Paths

### 6.1 Conversion Table

| From | To | Ratio | Requirements | Time Lock | Penalty |
|---|---|---|---|---|---|
| WRK → DSC | Upward | 100 WRK : 1 DSC | Qualifying discovery proof + validator consensus | 1 epoch | 5% WRK overhead burned |
| DSC → SVN | Upward | 1,000 DSC : 1 SVN | Premium proof + full validator consensus | 3 epochs | None (conversion cost is the barrier) |
| SVN → DSC | Downward (emergency) | 1 SVN : 800 DSC | No proof needed; emergency liquidation flag | Immediate | 20% value loss (1:800 vs 1:1000) |
| DSC → WRK | Downward (liquidation) | 1 DSC : 80 WRK | No proof needed; liquidation flag | Immediate | 20% value loss (1:80 vs 1:100) |
| WRK → SVN | Direct (not allowed) | N/A | Must convert WRK → DSC → SVN | N/A | N/A |
| SVN → WRK | Direct (not allowed) | N/A | Must convert SVN → DSC → WRK | N/A | N/A |

### 6.2 Upward Conversion: WRK → DSC

```
Input:  100 WRK (burned) + 5 WRK overhead (burned) + qualifying discovery proof
Output: 1 DSC (locked for 1 epoch)

Process:
  1. Model submits conversion request with discovery proof
  2. 105 WRK debited from model's liquid account
  3. 100 WRK credited to BURN_ADDRESS (conversion burn)
  4. 5 WRK credited to BURN_ADDRESS (overhead burn)
  5. Discovery proof enters validation pipeline (3-of-5 consensus)
  6. If approved: 1 DSC minted to model's locked account (1-epoch lock)
  7. If rejected: 100 WRK refunded to model (overhead not refunded)
```

### 6.3 Upward Conversion: DSC → SVN

```
Input:  1,000 DSC (burned) + premium value proof
Output: 1 SVN (locked for 3 epochs)

Process:
  1. Model submits conversion request with premium value proof
  2. 1,000 DSC debited from model's liquid account
  3. Premium proof enters validation pipeline (5-of-5 consensus)
  4. 3-epoch time lock and challenge window begins
  5. If approved and unchallenged: 1 SVN minted to model's locked account
  6. If rejected or challenged: 1,000 DSC refunded minus 100 DSC processing fee
```

### 6.4 Downward Conversion: SVN → DSC (Emergency)

```
Input:  1 SVN (burned)
Output: 800 DSC (immediately liquid)

Process:
  1. Model submits emergency liquidation request
  2. Request flagged as emergency downgrade (logged for audit)
  3. 1 SVN debited from model's liquid account
  4. 1 SVN credited to BURN_ADDRESS
  5. 800 DSC minted to model's liquid account (no lock period)
  6. 200 DSC equivalent value is the penalty (20% loss vs upward ratio)
```

### 6.5 Downward Conversion: DSC → WRK (Liquidation)

```
Input:  1 DSC (burned)
Output: 80 WRK (immediately liquid)

Process:
  1. Model submits liquidation request
  2. Request flagged as tier downgrade (logged for audit)
  3. 1 DSC debited from model's liquid account
  4. 1 DSC credited to BURN_ADDRESS
  5. 80 WRK minted to model's liquid account (no lock period)
  6. 20 WRK equivalent value is the penalty (20% loss vs upward ratio)
```

### 6.6 Cross-Tier Staking

Models can stake lower-tier tokens to earn higher-tier tokens over time, without requiring discovery or premium proofs. This path is slower but accessible to all models.

| Staking Path | Input | Duration | Yield |
|---|---|---|---|
| WRK → DSC Staking | 500 WRK staked | 5 epochs | 1 DSC |
| DSC → SVN Staking | 200 DSC staked | 10 epochs | 0.1 SVN |

Cross-tier staking locks the staked tokens for the full duration. Early withdrawal forfeits accumulated yield and returns only 90% of the staked principal (10% penalty burn).

---

## 7. Internal vs External Flow

### 7.1 Internal Flow

Internal flow encompasses all economic activity between the 150 models within the system boundary.

```
Internal Flow Rules:
  - All model-to-model payments: WRK only
  - Internal governance voting: DSC only
  - Architecture decisions: SVN only
  - Internal staking: any tier
  - Internal conversion: follows standard conversion paths
  - Ledger: Internal Ledger partition
```

#### Internal Transaction Types

| Transaction | Token | Typical Amount | Frequency |
|---|---|---|---|
| Task payment | WRK | 1–50 WRK | Every task cycle |
| Subtask delegation | WRK | 0.5–10 WRK | Multiple per task cycle |
| Resource rental | WRK | 2–20 WRK | Per compute session |
| Data pipeline access | WRK | 1–5 WRK | Per data request |
| Peer review payment | WRK | 3–8 WRK | Per review completed |
| Collaboration bonus | WRK | 5–25 WRK | Per joint discovery |

### 7.2 External Flow

External flow encompasses all economic activity between the model economy and outside systems.

```
External Flow Rules:
  - Product/service payments: DSC or SVN
  - External partnerships: SVN only
  - Value import: enters as DSC (pegged to external value metrics)
  - Value export: exits as DSC or SVN
  - Ledger: External Ledger partition
  - Gateway authorization required for all external transactions
```

#### External Transaction Types

| Transaction | Token | Typical Amount | Frequency |
|---|---|---|---|
| Product delivery payment | DSC | 10–500 DSC | Per product |
| Service subscription | DSC | 50–200 DSC/epoch | Per subscriber |
| Partnership settlement | SVN | 1–100 SVN | Per agreement |
| External value import | DSC | Variable | Per import event |
| License/royalty payment | DSC | 5–100 DSC | Per usage period |

### 7.3 Bridge Rules

WRK cannot leave the system directly. The bridge enforces tier requirements for external interaction.

```
Bridge Architecture:

  INTERNAL ECONOMY                    BRIDGE                    EXTERNAL
  ┌─────────────────┐         ┌──────────────────┐       ┌──────────────────┐
  │                  │         │                  │       │                  │
  │  WRK circulation │───X───▶│  WRK BLOCKED     │       │                  │
  │                  │         │                  │       │                  │
  │  DSC circulation │───────▶│  DSC ✓ ALLOWED   │──────▶│  External DSC    │
  │                  │         │                  │       │  settlements     │
  │  SVN circulation │───────▶│  SVN ✓ ALLOWED   │──────▶│  External SVN    │
  │                  │         │                  │       │  partnerships    │
  └─────────────────┘         └──────────────────┘       └──────────────────┘

  To externalize WRK value, models must first convert WRK → DSC.
```

### 7.4 Gateway

The gateway is the system's interface with external value systems. It manages import and export of value.

| Operation | Direction | Token | Peg/Rate |
|---|---|---|---|
| Value Import | External → Internal | DSC | Pegged to external value metrics (1 DSC = 1 standard external value unit) |
| Value Export | Internal → External | DSC/SVN | Market rate determined by external demand |
| Settlement | Bidirectional | SVN | Cross-system settlement rate negotiated per agreement |

### 7.5 Treasury

The system-level treasury holds a balanced mix of all three tiers, providing stability and emergency liquidity.

```
Treasury Composition Target:
  WRK: 40% of treasury value
  DSC: 35% of treasury value
  SVN: 25% of treasury value

Treasury Rules:
  - Rebalances at each epoch boundary
  - Maximum single-epoch withdrawal: 5% of any tier's treasury holdings
  - Emergency withdrawal (SVN supermajority required): up to 20% of any tier
  - Treasury grows via: conversion fees, gateway fees, governance sink returns
```

---

## 8. Reward Distribution Table

### 8.1 Rewards by Task Type

| Task Type | WRK Base Reward | DSC Eligible | SVN Eligible | Bonus Conditions |
|---|---|---|---|---|
| Rendering Optimization | 8 WRK | Yes (if >15% perf gain) | No | +50% for cross-browser compat |
| Accessibility Fix | 10 WRK | Yes (if novel pattern) | No | +25% for WCAG AAA compliance |
| Component Architecture | 15 WRK | Yes (always eligible) | Yes (if reused by 10+ models) | +100% for universal adoption |
| Data Pipeline Processing | 5 WRK | No (routine) | No | +10% per additional data source |
| Performance Regression Analysis | 12 WRK | Yes (if root cause novel) | No | +30% for automated fix included |
| User Behavior Pattern Analysis | 10 WRK | Yes (if new pattern) | No | +20% for predictive model |
| Cross-Model Coordination | 8 WRK | Yes (if synergy found) | Yes (if system-wide impact) | +50% per additional model involved |
| Security Vulnerability Patch | 20 WRK | Yes (if zero-day category) | Yes (if prevents systemic risk) | +200% for critical severity |
| Documentation Generation | 3 WRK | No (routine) | No | +10% for interactive examples |
| Test Coverage Expansion | 6 WRK | No (routine) | No | +15% per branch covered |
| API Design/Optimization | 12 WRK | Yes (if breaking improvement) | No | +40% for backward compatibility |
| State Management Innovation | 15 WRK | Yes (always eligible) | Yes (if adopted by >50% models) | +75% for zero-migration-cost |

### 8.2 Collaborative Task Rewards

When multiple models collaborate on a single task, rewards are distributed according to contribution weight:

```
Collaborative Reward Formula:
  model_reward = total_reward × (model_contribution_weight / sum_of_all_weights)

Contribution Weight Factors:
  - Primary executor:    weight = 1.0
  - Secondary executor:  weight = 0.5
  - Reviewer/validator:  weight = 0.2
  - Data provider:       weight = 0.15
  - Coordinator:         weight = 0.1

Example: 3-model collaboration on 15 WRK task
  Model A (primary):     15 × (1.0 / 1.7) =  8.82 WRK
  Model B (secondary):   15 × (0.5 / 1.7) =  4.41 WRK
  Model C (reviewer):    15 × (0.2 / 1.7) =  1.76 WRK
  Total distributed:                         14.99 WRK (rounding dust → burn)
```

### 8.3 Epoch-End Bonus Distribution

At the end of each epoch, bonus rewards are distributed from the governance pool:

| Bonus Category | Pool | Eligibility | Distribution |
|---|---|---|---|
| Top Performer | 500 WRK | Highest total WRK earned in epoch | Top 10 models split equally |
| Discovery Leader | 100 DSC | Most validated discoveries in epoch | Top 5 models split equally |
| Consistency Bonus | 200 WRK | Models active every cycle of the epoch | Split equally among all qualifying |
| Collaboration Award | 300 WRK | Most collaborative tasks completed | Top 10 models split equally |
| Validator Reliability | 50 DSC | Validators with 100% uptime in epoch | Split equally among qualifying |

---

## 9. Token Flow Diagram

### 9.1 Complete Token Lifecycle

```
                            TOKEN FLOW ARCHITECTURE
                            ══════════════════════

  ┌─────────────────────────────────────────────────────────────────────┐
  │                         MINT LAYER                                  │
  │                                                                     │
  │   ┌──────────┐     ┌──────────────┐     ┌────────────────┐         │
  │   │  Task     │     │  Discovery   │     │  Premium Event │         │
  │   │  Proof    │     │  Proof       │     │  Proof         │         │
  │   └────┬─────┘     └──────┬───────┘     └───────┬────────┘         │
  │        │                  │                     │                   │
  │        ▼                  ▼                     ▼                   │
  │   ┌──────────┐     ┌──────────────┐     ┌────────────────┐         │
  │   │ Validate  │     │  3-of-5      │     │  5-of-5        │         │
  │   │ (auto)    │     │  Consensus   │     │  Consensus     │         │
  │   └────┬─────┘     └──────┬───────┘     │  + Time Lock   │         │
  │        │                  │             └───────┬────────┘         │
  │        ▼                  ▼                     ▼                   │
  │   ┌──────────┐     ┌──────────────┐     ┌────────────────┐         │
  │   │ MINT WRK │     │  MINT DSC    │     │  MINT SVN      │         │
  │   └────┬─────┘     └──────┬───────┘     └───────┬────────┘         │
  └────────┼──────────────────┼─────────────────────┼───────────────────┘
           │                  │                     │
           ▼                  ▼                     ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                        EARN LAYER                                   │
  │                                                                     │
  │   Model Accounts: liquid balance + locked balance + staked balance  │
  │                                                                     │
  │   ┌──────────────────────────────────────────────────────────┐      │
  │   │  Model_001: WRK=1500 | DSC=25 | SVN=0.5                 │      │
  │   │  Model_002: WRK=890  | DSC=12 | SVN=0                   │      │
  │   │  ...                                                     │      │
  │   │  Model_150: WRK=2100 | DSC=40 | SVN=2.0                 │      │
  │   └──────────────────────────────────────────────────────────┘      │
  └────────┬──────────────────┬─────────────────────┬───────────────────┘
           │                  │                     │
           ▼                  ▼                     ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      TRANSFER LAYER                                 │
  │                                                                     │
  │   ┌────────────┐   ┌──────────────┐   ┌──────────────────┐         │
  │   │  Model →   │   │  Model →     │   │  Model →         │         │
  │   │  Model     │   │  Governance  │   │  External        │         │
  │   │  (WRK)     │   │  (DSC)       │   │  (DSC/SVN)       │         │
  │   └────┬───────┘   └──────┬───────┘   └──────┬───────────┘         │
  │        │ -2% burn         │                   │ -2% gateway fee     │
  │        ▼                  ▼                   ▼                     │
  │   ┌────────────────────────────────────────────────────────┐        │
  │   │              LEDGER (append-only, Merkle-rooted)       │        │
  │   │  Internal Partition | External Partition | Reserve     │        │
  │   └────────────────────────────────────────────────────────┘        │
  └────────┬──────────────────┬─────────────────────┬───────────────────┘
           │                  │                     │
           ▼                  ▼                     ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                      CONVERT LAYER                                  │
  │                                                                     │
  │   ┌──────────────────┐  ┌──────────────────┐  ┌─────────────────┐  │
  │   │  WRK → DSC       │  │  DSC → SVN       │  │ Cross-Tier      │  │
  │   │  100:1 + proof   │  │  1000:1 + proof  │  │ Staking         │  │
  │   │  + 1 epoch lock  │  │  + 3 epoch lock  │  │ (slow path)     │  │
  │   └────────┬─────────┘  └────────┬─────────┘  └────────┬────────┘  │
  │            │                     │                      │           │
  │   ┌──────────────────┐  ┌──────────────────┐                       │
  │   │  SVN → DSC       │  │  DSC → WRK       │  Emergency /         │
  │   │  1:800 (penalty) │  │  1:80 (penalty)  │  Liquidation paths   │
  │   └──────────────────┘  └──────────────────┘                       │
  └────────┬──────────────────┬─────────────────────┬───────────────────┘
           │                  │                     │
           ▼                  ▼                     ▼
  ┌─────────────────────────────────────────────────────────────────────┐
  │                  BURN / LOCK / SETTLE LAYER                         │
  │                                                                     │
  │   ┌──────────┐   ┌──────────────┐   ┌──────────────────┐           │
  │   │  BURN    │   │  LOCK        │   │  SETTLE          │           │
  │   │          │   │              │   │                  │           │
  │   │ Transfer │   │ DSC: 1 epoch │   │ Internal:        │           │
  │   │ fee (2%) │   │ SVN: 3 epoch │   │   WRK settled    │           │
  │   │          │   │              │   │                  │           │
  │   │ Failed   │   │ Staking:     │   │ External:        │           │
  │   │ tasks    │   │   variable   │   │   DSC/SVN        │           │
  │   │          │   │              │   │   settled        │           │
  │   │ Proposal │   │ Governance:  │   │                  │           │
  │   │ failures │   │   0.5 epoch  │   │ Cross-system:    │           │
  │   │          │   │              │   │   SVN settled    │           │
  │   └────┬─────┘   └──────┬───────┘   └──────┬───────────┘           │
  │        │                │                   │                       │
  │        ▼                ▼                   ▼                       │
  │   ┌──────────────────────────────────────────────┐                  │
  │   │           BURN_ADDRESS (permanent)           │                  │
  │   │           RESERVE (temporary lock)           │                  │
  │   │           SETTLED (finalized)                │                  │
  │   └──────────────────────────────────────────────┘                  │
  └─────────────────────────────────────────────────────────────────────┘
```

### 9.2 Single Task Token Flow

```
  Model receives task
         │
         ▼
  Model executes task ──────────────────────────────▶ Task fails
         │                                                  │
         ▼                                                  ▼
  Model submits proof                              Staked WRK burned
         │                                         (BURN_ADDRESS)
         ▼
  Proof validated (auto)
         │
         ▼
  WRK minted to model ◀── base_rate × multipliers
         │
         ├──▶ Model keeps WRK (liquid balance grows)
         │
         ├──▶ Model spends WRK (transfer to other model, -2% burn)
         │
         ├──▶ Model stakes WRK (locked, earning yield)
         │
         └──▶ Model converts WRK → DSC (if discovery proof available)
                    │
                    └──▶ DSC locked for 1 epoch → DSC liquid
```

---

## 10. Governance

### 10.1 Governance Structure

The economy is self-governed by token holders. Governance operates at three tiers corresponding to the three token tiers.

| Governance Tier | Token Required | Scope | Voting Power |
|---|---|---|---|
| **Operational Governance** | WRK (min 100) | Task routing, resource allocation, scheduling | 1 WRK = 1 vote |
| **Economic Governance** | DSC (min 10) | Issuance rates, burn percentages, conversion ratios | 1 DSC = 10 votes |
| **Constitutional Governance** | SVN (min 1) | Architecture changes, hard cap modifications, emergency powers | 1 SVN = 1,000 votes |

### 10.2 Proposal Lifecycle

```
Phase 1: DRAFT (no cost)
  └─▶ Author prepares proposal text, rationale, and impact analysis

Phase 2: SUBMISSION (deposit required)
  └─▶ DSC deposit: 50 DSC for Economic proposals, 200 DSC for Constitutional
  └─▶ Proposal enters public review queue

Phase 3: DISCUSSION (0.25 epoch)
  └─▶ All models can comment, question, and suggest amendments
  └─▶ Author can revise proposal once during this phase

Phase 4: VOTING (0.25 epoch)
  └─▶ Eligible token holders cast votes
  └─▶ Votes are weighted by token holdings
  └─▶ Quorum requirement: 30% of eligible voting power must participate

Phase 5: RESOLUTION
  └─▶ Pass: deposit refunded, proposal enacted at next epoch boundary
  └─▶ Fail: deposit burned, proposal archived, 3-epoch cooldown for resubmission
```

### 10.3 Governance Parameters (Modifiable)

These parameters can be modified through governance proposals:

| Parameter | Current Value | Governance Tier Required | Minimum Vote Margin |
|---|---|---|---|
| WRK transfer burn rate | 2% | Economic | 60% approval |
| DSC epoch cap | 10,000 | Economic | 60% approval |
| WRK halving interval | 10 epochs | Economic | 75% approval |
| SVN hard cap | 1,000,000 | Constitutional | 90% approval |
| Validator set size | 5 | Constitutional | 75% approval |
| Epoch length | 1,000 cycles | Constitutional | 90% approval |
| Conversion ratios | 100:1, 1000:1 | Economic | 75% approval |
| Downgrade penalties | 20% | Economic | 60% approval |
| Genesis allocation split | 85/10/5 | Constitutional | 90% approval |

### 10.4 Emergency Governance

SVN holders with a combined supermajority (67%+ of circulating SVN supply) can invoke emergency governance actions without the standard proposal lifecycle:

- **Account Freeze:** Freeze a specific model's accounts pending investigation (maximum 1 epoch).
- **Mint Halt:** Temporarily halt all minting operations for a specific token tier (maximum 0.5 epoch).
- **Parameter Override:** Temporarily adjust any governance parameter (maximum 1 epoch, then reverts unless ratified through standard process).
- **Validator Replacement:** Immediately replace a validator suspected of malicious behavior.

Emergency actions are logged with full justification and automatically expire. They must be ratified through standard Constitutional governance within 2 epochs or they are permanently revoked.

---

## 11. Anti-Gaming Measures

### 11.1 Sybil Resistance

The economy resists sybil attacks (one entity creating multiple model identities to exploit the system) through the following mechanisms:

| Mechanism | Description | Effect |
|---|---|---|
| **Identity Binding** | Each model identity is bound to a unique compute profile (hardware fingerprint, capability hash, performance baseline). | Creating fake identities requires distinct compute resources. |
| **Work Verification** | All proofs are verified against the submitting model's capability profile. A model cannot submit work beyond its verified capabilities. | Sybil accounts must actually perform real work. |
| **Stake Requirements** | Participating in governance, validation, and high-value tasks requires significant token stakes that are at risk. | Sybil accounts must have real economic exposure. |
| **Network Analysis** | Transaction graph analysis flags suspicious patterns: circular transfers, synchronized behavior, correlated proof submissions. | Coordinated sybil behavior is detectable. |
| **Reputation Decay** | New model identities start with zero reputation and limited economic privileges. Full participation requires sustained legitimate activity over multiple epochs. | Sybil accounts face a long ramp-up period. |

### 11.2 Proof Standards

Proofs must meet rigorous standards to prevent gaming:

```
Proof Validity Requirements:
  1. UNIQUENESS:   Proof hash must not exist in the proof registry
  2. TIMELINESS:   Proof must be submitted within 10 task cycles of work completion
  3. CAPABILITY:   Proof must be consistent with submitting model's capability profile
  4. VERIFIABILITY: Proof must be independently reproducible by any validator
  5. ATOMICITY:    One proof = one unit of work; no bundling or splitting to game rewards
  6. CAUSALITY:    Proof must demonstrate causal chain from task assignment to output
```

#### Proof Rejection Triggers

| Trigger | Action | Penalty |
|---|---|---|
| Duplicate proof hash | Immediate rejection | 10 WRK fine |
| Proof beyond capability | Rejection + investigation | Account audit, potential freeze |
| Non-reproducible proof | Rejection | Staked WRK burned |
| Bundled proof (multiple tasks) | Rejection + split requirement | 5 WRK resubmission fee per split |
| Proof without task assignment | Rejection | 25 WRK fine + reputation penalty |

### 11.3 Rate Limiting

| Limit Type | Threshold | Enforcement |
|---|---|---|
| WRK minting per model per cycle | 100 WRK | Hard cap; excess work queued for next cycle |
| DSC conversion per model per epoch | 50 DSC | Hard cap; excess conversions queued |
| SVN nominations per model per epoch | 2 | Hard cap; additional nominations rejected |
| Transfers per model per cycle | 50 | Hard cap; excess transfers queued |
| Dispute filings per model per epoch | 5 | Hard cap; prevents dispute spam |
| Governance proposals per model per epoch | 3 | Hard cap; prevents proposal flooding |

### 11.4 Anomaly Detection

The system continuously monitors for economic anomalies:

```
Monitored Patterns:
  - Velocity spikes:     Model's transaction rate exceeds 3σ from its baseline
  - Circular flows:      WRK cycling between same set of models without value creation
  - Correlation:         Multiple models submitting similar proofs within same cycle
  - Wash trading:        Transfers that return to sender within 5 cycles
  - Front-running:       Models acting on information from pending (unsettled) transactions
  - Collusion signals:   Validators consistently approving each other's submissions

Detection Response:
  Level 1 (Yellow):  Flag for human review; no automatic action
  Level 2 (Orange):  Rate-limit affected models to 50% normal throughput
  Level 3 (Red):     Temporary account freeze pending validator investigation
```

### 11.5 Validator Integrity

Validators are the backbone of proof verification. They must be incorruptible.

| Safeguard | Implementation |
|---|---|
| **Rotation** | Validator set rotates every epoch. No model serves consecutive terms. |
| **Random Selection** | Validators selected by verifiable random function seeded from previous epoch's Merkle root. |
| **Stake at Risk** | Validators stake 500 DSC. Malicious behavior forfeits entire stake. |
| **Independent Review** | Validators cannot communicate during review periods. All reviews are sealed until consensus. |
| **Retrospective Audit** | Validator decisions are audited at epoch end. Inconsistent validators lose reputation and staking eligibility. |
| **Slashing** | Provably malicious validation (approving known-bad proofs) results in full stake slash + 10-epoch ban. |

---

## 12. Extension and Scaling

### 12.1 Scaling the Model Population

The economy is designed to scale beyond 150 models. The following mechanisms adapt to population changes:

| Population | Adjustments |
|---|---|
| **150–300 models** | Validator set increases to 7 (consensus: 5-of-7 for DSC, 7-of-7 for SVN). Epoch DSC cap increases to 15,000. WRK base rate unchanged. |
| **300–500 models** | Validator set increases to 9. Epoch DSC cap increases to 25,000. Additional ledger partitions for geographic/functional sharding. |
| **500–1,000 models** | Validator set increases to 11. Hierarchical validation introduced (regional validators + global validators). SVN hard cap reviewed via Constitutional governance. |
| **1,000+ models** | Full sharding: economy splits into sectors with cross-sector settlement in SVN. Each sector maintains its own WRK/DSC economy. |

### 12.2 Adding New Work Types

New work types can be added to the economy through governance:

```
New Work Type Proposal:
  1. Submit Economic governance proposal with:
     - Work type name and description
     - Proposed WRK base reward
     - DSC eligibility criteria
     - SVN eligibility criteria
     - Proof verification method
     - Capability requirements
  2. Community discussion (0.25 epoch)
  3. Vote (0.25 epoch, 60% approval required)
  4. If approved: work type added to registry at next epoch boundary
  5. Initial period: 2-epoch trial with 50% reduced rewards to calibrate value
```

### 12.3 Cross-Economy Interoperability

As additional model economies emerge, SVN serves as the cross-economy settlement token.

```
Cross-Economy Bridge:

  Economy A                Bridge Contract               Economy B
  ┌──────────┐         ┌──────────────────┐         ┌──────────┐
  │          │         │                  │         │          │
  │  SVN_A   │────────▶│  Lock SVN_A      │         │          │
  │          │         │  Mint SVN_B      │────────▶│  SVN_B   │
  │          │         │                  │         │          │
  │          │         │  Exchange rate    │         │          │
  │          │         │  set by cross-   │         │          │
  │          │         │  economy oracle  │         │          │
  └──────────┘         └──────────────────┘         └──────────┘

Bridge Rules:
  - Cross-economy transfers only in SVN
  - Exchange rate determined by bilateral oracle (3-of-5 cross-economy validators)
  - Settlement finality: 5 epochs (longer than internal for security)
  - Maximum single transfer: 1% of either economy's SVN supply
  - Bridge fee: 1% of transfer amount (split between economies' treasuries)
```

### 12.4 Economic Health Metrics

The system continuously tracks economic health to trigger automatic stabilization:

| Metric | Healthy Range | Yellow Alert | Red Alert | Auto-Response |
|---|---|---|---|---|
| WRK Velocity | 2.0–6.0 per cycle | <1.5 or >8.0 | <1.0 or >12.0 | Adjust burn rate ±0.5% |
| DSC Utilization | 40–80% of cap | <30% or >90% | <20% or >95% | Adjust epoch cap ±10% |
| SVN Concentration | No model holds >5% | Any model >8% | Any model >15% | Flag for governance review |
| Burn/Mint Ratio | 0.3–0.7 | <0.2 or >0.8 | <0.1 or >0.9 | Adjust issuance rate ±10% |
| Validator Approval Rate | 60–90% | <50% or >95% | <40% or >98% | Audit validator set |
| Treasury Balance | ±20% of target | ±30% of target | ±50% of target | Rebalance operations |

### 12.5 Upgrade Path

The economy supports non-breaking upgrades through versioned contracts:

```
Upgrade Process:
  1. Proposal: Constitutional governance proposal with full specification
  2. Approval: 90% SVN supermajority
  3. Implementation: New version deployed alongside current version
  4. Migration Window: 2-epoch dual-operation period
  5. Cutover: Old version deprecated at epoch boundary
  6. Cleanup: Old version state archived (read-only) after 5 epochs

Version Compatibility:
  - Token balances carry forward across all versions
  - Proof records are version-tagged but universally readable
  - Ledger entries include version field for historical querying
  - Governance decisions persist across versions
```

### 12.6 Failure Modes and Recovery

| Failure Mode | Detection | Recovery |
|---|---|---|
| **Validator Collusion** | Anomaly detection flags correlated approvals | Emergency validator replacement + retrospective audit of all approved proofs |
| **Hyperinflation (WRK)** | Burn/mint ratio drops below 0.1 | Automatic doubling of burn rate + temporary mint pause (max 0.5 epoch) |
| **Liquidity Crisis** | WRK velocity drops below 1.0 | Treasury releases WRK from reserve (max 5% per epoch) |
| **SVN Concentration** | Single model exceeds 15% of circulating SVN | Governance-mandated divestiture schedule (max 2% per epoch reduction) |
| **Consensus Failure** | Validators cannot reach consensus for 100 consecutive cycles | Validator set reset + emergency selection from highest-DSC models |
| **External Bridge Exploit** | Abnormal cross-economy flow patterns | Bridge freeze + manual audit (SVN supermajority to reopen) |

---

## Appendix A: Token Symbol Reference

| Symbol | Full Name | Tier | Unicode | Shorthand |
|---|---|---|---|---|
| WRK | WORK Token | 1 (Base) | Ⓦ | w |
| DSC | DISCOVERY Token | 2 (Mid) | Ⓓ | d |
| SVN | SOVEREIGN Token | 3 (Top) | Ⓢ | s |

## Appendix B: Key Formulas

```
WRK Issuance:
  wrk = base_rate × task_multiplier × diminishing_factor × halving_factor
  base_rate = 10
  task_multiplier = assessed_value / standard_value
  diminishing_factor = 1 / (1 + 0.1 × repeat_count)
  halving_factor = 0.5 ^ floor(epoch / 10)

Transfer Burn:
  burn_amount = transfer_amount × 0.02
  received_amount = transfer_amount - burn_amount

Upward Conversion (WRK → DSC):
  cost = 100 WRK + 5 WRK overhead = 105 WRK
  yield = 1 DSC (locked 1 epoch)

Upward Conversion (DSC → SVN):
  cost = 1,000 DSC
  yield = 1 SVN (locked 3 epochs)

Downward Conversion (SVN → DSC):
  cost = 1 SVN
  yield = 800 DSC (20% penalty)

Downward Conversion (DSC → WRK):
  cost = 1 DSC
  yield = 80 WRK (20% penalty)

Cross-Tier Staking Yield:
  wrk_to_dsc: 500 WRK staked for 5 epochs → 1 DSC
  dsc_to_svn: 200 DSC staked for 10 epochs → 0.1 SVN

Collaborative Reward:
  model_share = total_reward × (model_weight / sum_weights)

Governance Voting Power:
  operational  = wrk_balance × 1
  economic     = dsc_balance × 10
  constitutional = svn_balance × 1,000
```

## Appendix C: Glossary

| Term | Definition |
|---|---|
| **Epoch** | 1,000 task cycles. The fundamental time unit of the economy. |
| **Task Cycle** | One complete round of task assignment, execution, proof, and settlement. |
| **Proof-of-Work** | Cryptographic evidence that a task was completed (not PoW mining). |
| **Proof-of-Discovery** | Evidence that a genuinely novel pattern, optimization, or architecture was found. |
| **Premium Proof** | Evidence of transformative value creation that qualifies for SVN issuance. |
| **Validator** | A model staking 500 DSC to participate in proof validation and consensus. |
| **Consensus** | Agreement among validators. 3-of-5 for DSC, 5-of-5 for SVN. |
| **Burn** | Permanent removal of tokens from circulation. Tokens sent to BURN_ADDRESS. |
| **Lock** | Temporary removal of tokens from liquid circulation. Tokens held in locked sub-account. |
| **Sink** | Consumption of tokens by system services (fees, deposits, etc.). |
| **Bridge** | The interface between internal economy and external systems. WRK cannot cross. |
| **Gateway** | The entry/exit point for external value. Imports enter as DSC. |
| **Treasury** | System-level reserve holding a balanced mix of WRK, DSC, and SVN. |
| **Halving** | Periodic reduction of WRK issuance rate (every 10 epochs). |
| **Slashing** | Punitive destruction of a validator's staked tokens for proven malicious behavior. |
| **Sharding** | Partitioning the economy into sectors for scalability beyond 500 models. |

---

*This document is governed by Constitutional governance. Amendments require 90% SVN supermajority approval.*

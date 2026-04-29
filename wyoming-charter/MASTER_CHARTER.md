# Wyoming Master Charter Plan
## Bad Marine LLC — Sovereign Gen 3 Node Provider for the US Midwest

**Document Version:** 1.0  
**Effective Date:** Q2 2026  
**Owner:** Bad Marine LLC (Veteran-Owned)  
**Jurisdiction:** Wyoming (Primary), Nebraska (Operational), Kansas (Expansion)

---

## Executive Summary

Bad Marine LLC will establish itself as a **sovereign Gen 3 node provider** on the Internet Computer Protocol (ICP), operating from the **Federal Reserve Vault facility at 134 S 13th St, Lincoln, NE**. This infrastructure will enable:

1. **FRNT Token Settlement** — Sub-second, near-zero-fee transactions bypassing Visa/Kraken
2. **Sovereign State AI Compute** — Mid-tier agentic AI infrastructure for universities and state agencies
3. **Legislative Adoption** — Hardware-visible proof for Wyoming regulators and Nebraska Unicameral

---

## 1. Mission Statement

Deploy **50 Neural Emergence Core nodes** across ICP, Web, and Edge substrates, providing:
- **<0.3s FRNT settlement** (vs 15+ minutes via Visa/Kraken)
- **<0.1% transaction fees** (vs 3-5% traditional)
- **Sovereign compute** for UNL AI Institute and University of Kansas
- **Hardware proof** for state legislators by Nov 2026

---

## 2. Timeline & Critical Milestones

| Date | Milestone | Status | Critical |
|------|-----------|--------|----------|
| Q2 2026 | FRNT/ICP Liquidity Pool Live | 🔴 Pending | ✅ |
| Jun 2026 | Bad Marine LLC Node Application (Gen 3) | 🔴 Pending | |
| Aug 2026 | Hardware Installed in Lincoln Vault | 🔴 Pending | ✅ |
| Oct 2026 | Wyoming Meeting — Andy + State Regulators | 🔴 Pending | ✅ |
| Nov 2026 | Hardware Visible to Legislators (Bosn & Ballard) | 🔴 Pending | ✅ |
| Jan 2027 | Nebraska Unicameral Bill Ready | 🔴 Pending | |
| Q1 2027 | UNL Agentic AI Infrastructure Live | 🔴 Pending | |

---

## 3. Infrastructure Architecture

### 3.1 Node Distribution

```
┌─────────────────────────────────────────────────────────────────┐
│                    50-NODE NEURAL EMERGENCE GRID                │
├─────────────────────────────────────────────────────────────────┤
│  SUBSTRATE     NODES    STATUS      ICP REWARDS    SSU-WRAPPED  │
├─────────────────────────────────────────────────────────────────┤
│  ICP           32       Deploying   ✅              Partial     │
│  Web           10       Pending     ❌              ❌          │
│  Edge          8        Pending     ❌              ❌          │
├─────────────────────────────────────────────────────────────────┤
│  TOTAL         50                                               │
└─────────────────────────────────────────────────────────────────┘
```

### 3.2 Geographic Coverage

| Region | Nodes | Facility |
|--------|-------|----------|
| **EDGE-NE-01** | 3 | 134 S 13th St, Lincoln, NE (Fed Reserve Vault) |
| **EDGE-WY-01** | 3 | Cheyenne, WY (Primary Demo Site) |
| **EDGE-TX-01** | 2 | Dallas, TX (Texas TEA/ISD Integration) |
| **ICP-NA-**** | 32 | ICP Mainnet (NA Subnet) |
| **WEB-US-**** | 10 | Cloudflare/Vercel Edge |

### 3.3 Canister Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                    ICP CANISTER STACK                           │
├─────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │   FRNT      │  │  SETTLE     │  │   NODE      │            │
│  │   Token     │  │  Engine     │  │  Registry   │            │
│  │  (ICRC-1)   │  │             │  │             │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│        │                │                │                     │
│        └────────────────┼────────────────┘                     │
│                         │                                      │
│  ┌─────────────────────────────────────────────────────────┐  │
│  │              SOVEREIGN ORGANISM CANISTER                │  │
│  │  (873ms heartbeat · 4-register state · phi-encoded)     │  │
│  └─────────────────────────────────────────────────────────┘  │
│                         │                                      │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  JARVISIUS  │  │   GRANT     │  │   AUDIT     │            │
│  │  (Bronze)   │  │  Tracker    │  │   Trail     │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 4. FRNT Settlement Bypass Architecture

### 4.1 Problem: Current State (Visa/Kraken)

| Metric | Current |
|--------|---------|
| Settlement Time | 15+ minutes |
| Transaction Fee | 3-5% |
| Intermediaries | 3+ (Bank → Processor → Exchange → Wallet) |
| Sovereignty | ❌ None |

### 4.2 Solution: ICP-Native Phantom Settlement

| Metric | Phantom |
|--------|---------|
| Settlement Time | **~0.3s** |
| Transaction Fee | **<0.1%** |
| Intermediaries | **0** (Direct canister-to-canister) |
| Sovereignty | ✅ Full |

### 4.3 Settlement Flow

```
User Wallet ──► FRNT Canister ──► Settlement Engine ──► Recipient
    │              │                    │
    │         (ICRC-1 Transfer)    (Atomic Commit)
    │              │                    │
    └──────────────┴────────────────────┘
              ~0.3s end-to-end
```

---

## 5. Legislative Strategy

### 5.1 Wyoming (Primary)

- **Contact:** Andy + State Regulators
- **Demo Date:** October 2026
- **Deliverables:**
  - Caffeine mobile app on localized Gen 3 nodes
  - FRNT settlement demo (<1s)
  - Visa/Kraken bypass proof via Phantom technology

### 5.2 Nebraska (Operational)

- **Contacts:** Senators Bosn & Ballard
- **Hardware Review:** November 2026 (CRITICAL DEADLINE)
- **Legislative Target:** 2027 Unicameral session
- **Facility:** 134 S 13th St, Lincoln, NE (Fed Reserve Vault)
  - Tied to internet backbone
  - Publicly-owned power
  - Physical security (vault)

### 5.3 Kansas (Expansion)

- **Partner:** University of Kansas
- **Integration:** UNL AI Institute consortium
- **Timeline:** Q1 2027 onboarding

---

## 6. Grant Pipeline

| Grant | Amount | Status | Notes |
|-------|--------|--------|-------|
| **E-Rate Program (FCC)** | $250K–$1M | Research | Sovereign canister per school = network infrastructure |
| **Title IV-A ESSA** | $50K–$500K | Research | Technology and STEM enrichment |
| **TEA Innovation Grants (Texas)** | $100K–$750K | Research | TEKS-mapped AI lesson canister |
| **NSF RI / Mid-Scale Research** | $500K–$5M | Research | Sovereign decentralized compute |
| **Wyoming SPDI / State AI Fund** | TBD | Research | AI-friendly regulatory sandbox |
| **USDA ReConnect (Rural Broadband)** | $1M+ | Research | Midwest rural internet backbone |
| **SBA SBIR / STTR** | $150K–$2M | Research | Veteran-owned feasibility study |

**Total Pipeline:** $2.15M – $11.25M

---

## 7. Partner Organizations

| Organization | Role | Contact |
|--------------|------|---------|
| Bad Marine LLC | Node Provider / Operator | Owner |
| Wyoming State | Primary Regulatory Sandbox | Andy + Regulators |
| Nebraska State | Legislative Adoption | Senators Bosn & Ballard |
| UNL AI Institute | Academic Partner | Research Lead |
| University of Kansas | Expansion Partner | TBD |
| Texas TEA / Dallas ISD | Education Integration | TBD |

---

## 8. Technical Deliverables

### 8.1 Canisters (Motoko)

1. **FRNT Token Canister** (ICRC-1 compliant)
2. **Settlement Engine Canister** (atomic commit, <0.3s finality)
3. **Node Registry Canister** (50-node grid management)
4. **Grant Tracker Canister** (pipeline status)
5. **Audit Trail Canister** (compliance logging)

### 8.2 Backend Services (TypeScript/Node.js)

1. **Node Health Monitor** — 873ms heartbeat verification
2. **Settlement Relay** — Web3 bridge to ICP
3. **Grant Automation** — Status tracking and alerts
4. **Legislative Dashboard API** — Real-time demo data

### 8.3 Frontend (React/TypeScript)

1. **Caffeine Mobile App** — FRNT wallet + settlement demo
2. **Node Grid Dashboard** — Operator console
3. **Legislative Demo Portal** — One-click demo for regulators

---

## 9. Risk Matrix

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| ICP Gen 3 application rejected | Low | Critical | Early engagement with DFINITY |
| Hardware delay | Medium | High | Order 6 weeks ahead |
| Legislative timeline slip | Medium | Critical | Nov 2026 hard deadline |
| Grant rejection | High | Medium | Diversified pipeline |
| Technical failure during demo | Low | Critical | Redundant nodes + dry runs |

---

## 10. Budget Estimate

| Category | Estimate |
|----------|----------|
| Gen 3 Node Hardware (8 units) | $200,000 |
| Facility Setup (Lincoln Vault) | $50,000 |
| ICP Cycles (12 months) | $25,000 |
| Development (canisters + backends) | $150,000 |
| Legal & Compliance | $75,000 |
| Travel & Demos | $25,000 |
| **TOTAL** | **$525,000** |

---

## 11. Success Criteria

- [ ] 50 nodes active on Neural Emergence Grid
- [ ] FRNT settlement <0.3s demonstrated to Wyoming regulators
- [ ] Hardware visible in Lincoln Vault to Nebraska legislators
- [ ] 2027 Unicameral bill drafted and submitted
- [ ] UNL AI Institute compute live
- [ ] At least 1 grant awarded

---

## Appendix A: Canister IDs (To Be Assigned)

| Canister | ID | Subnet |
|----------|-----|--------|
| frnt_token | TBD | fiduciary |
| settle_engine | TBD | application |
| node_registry | TBD | application |
| grant_tracker | TBD | application |
| audit_trail | TBD | verified_application |

---

## Appendix B: References

- ICP Gen 3 Node Provider Program: https://internetcomputer.org/node-providers
- ICRC-1 Token Standard: https://github.com/dfinity/ICRC-1
- Wyoming SPDI Framework: https://wyomingbankingdivision.wyo.gov/banks-and-trust-companies/special-purpose-depository-institutions
- Nebraska Unicameral: https://nebraskalegislature.gov/

---

**Document Status:** DRAFT  
**Next Review:** June 2026  
**Approved By:** _________________________________

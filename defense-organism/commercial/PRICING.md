# Dark Computing Pricing Structure

## Obscura Computing - Price List

**Effective Date**: 2026-05-18  
**Currency**: USD  
**Billing Cycle**: Monthly

---

## Tier Overview

| Tier | Monthly Price | Dark Requests | Sandland Scenarios | Support | SLA |
|------|---------------|---------------|-------------------|---------|-----|
| **Developer** | Free | 100K | 3 | Community | - |
| **Professional** | $49 | 1M | 10 | Email | 99.5% |
| **Enterprise** | $499 | 20M | Unlimited | 24/7 | 99.99% |
| **Sovereign** | Custom | Unlimited | Unlimited | Dedicated | Custom |

---

## Detailed Tier Breakdown

### Developer Tier (Free)

**Ideal for**: Individual developers, experiments, proof-of-concepts

| Feature | Included |
|---------|----------|
| Dark compute requests | 100,000/month |
| Sandland scenarios | 3 pre-built |
| Shadow memory | 100 MB |
| API rate limit | 10 req/sec |
| Support | Community forum |
| SLA | None |
| Data retention | 24 hours |

**Limitations**:
- No custom agents
- No custom scenarios
- Single region
- Shared infrastructure

---

### Professional Tier ($49/month)

**Ideal for**: Security researchers, small teams, startups

| Feature | Included |
|---------|----------|
| Dark compute requests | 1,000,000/month |
| Sandland scenarios | 10 (all pre-built + 3 custom) |
| Custom agents | Up to 5 |
| Shadow memory | 1 GB |
| API rate limit | 100 req/sec |
| Support | Email (48h response) |
| SLA | 99.5% uptime |
| Data retention | 7 days |

**Additional benefits**:
- Priority processing queue
- Basic analytics (aggregated, no raw logs)
- API key management
- Webhook notifications

---

### Enterprise Tier ($499/month)

**Ideal for**: Security teams, penetration testing firms, AI companies

| Feature | Included |
|---------|----------|
| Dark compute requests | 20,000,000/month |
| Sandland scenarios | Unlimited |
| Custom agents | Unlimited |
| Custom scenarios | Included |
| Shadow memory | 50 GB |
| API rate limit | 1,000 req/sec |
| Support | 24/7 (4h response) |
| SLA | 99.99% uptime |
| Data retention | 30 days |

**Additional benefits**:
- Dedicated shadow memory namespace
- Custom membrane contracts
- Advanced analytics dashboard
- SSO/SAML integration
- Dedicated account manager
- Quarterly security reviews
- Custom φ-constants option

---

### Sovereign Tier (Custom Pricing)

**Ideal for**: Government, defense, financial institutions

| Feature | Included |
|---------|----------|
| Dark compute requests | Unlimited |
| Infrastructure | Dedicated |
| Deployment options | Cloud, on-premise, air-gapped |
| Sandland | Full source access |
| Support | Dedicated team |
| SLA | Custom (up to 99.999%) |
| Compliance | SOC2, FedRAMP, custom |

**Contact for**:
- Volume-based pricing
- Multi-year agreements
- Custom SLA terms
- Regulatory compliance packages
- White-label options

---

## Overage Pricing

When tier limits are exceeded:

| Resource | Overage Price |
|----------|--------------|
| Dark compute requests | $0.80 per 1M |
| Sandland simulation hours | $0.10 per hour |
| Shadow memory | $0.05 per GB-month |
| Custom agent creation | $500 setup + $50/month |
| Custom scenario development | $2,000 one-time |
| Priority processing | $100/month add-on |

---

## API Pricing (Pay-as-you-go)

For usage-based billing without commitment:

| Endpoint | Price per call |
|----------|---------------|
| `/dark/analyze` | $0.001 |
| `/dark/classify` | $0.0005 |
| `/dark/score` | $0.0003 |
| `/sandland/run` | $0.10 per simulation hour |
| `/sandland/agent/create` | $0.50 per agent |
| `/membrane/verify` | $0.0001 |

**Minimum monthly spend**: $10

---

## Add-Ons (Any Tier)

| Add-On | Price | Description |
|--------|-------|-------------|
| Priority Queue | $100/month | 2x faster processing |
| Extended Retention | $50/month | 90-day shadow memory retention |
| Multi-Region | $150/month | Deploy across 3 regions |
| Webhook Pro | $25/month | Advanced webhook filtering |
| Analytics Export | $75/month | Export aggregated metrics |
| Custom φ-Constants | $200/month | Custom PHI/HB values |
| Air-Gap Mode | Custom | On-premise deployment |

---

## Discounts

| Type | Discount |
|------|----------|
| Annual payment (Professional) | 20% ($470/year) |
| Annual payment (Enterprise) | 25% ($4,490/year) |
| Nonprofit organizations | 50% |
| Academic/research | 75% |
| Open-source projects | Free (with attribution) |
| Startups (<$1M funding) | 50% for first year |

---

## Billing Details

### Payment Methods
- Credit card (Visa, Mastercard, Amex)
- ACH/Wire transfer (Enterprise+)
- Invoice billing (Enterprise+)
- Cryptocurrency (BTC, ETH) (Sovereign)

### Billing Cycle
- Monthly: Charged on subscription start date
- Annual: Charged upfront with discount

### Usage Tracking
- Real-time usage visible in dashboard
- Alerts at 75%, 90%, 100% of limits
- Automatic overage billing (can be disabled)

### Cancellation
- Cancel anytime (monthly)
- Annual: Pro-rated refund for unused months
- Data exported upon request

---

## Service Level Agreements

### Professional (99.5% uptime)
- Monthly uptime target: 99.5%
- Maximum downtime: 3.65 hours/month
- Credit: 10% for each 1% below target

### Enterprise (99.99% uptime)
- Monthly uptime target: 99.99%
- Maximum downtime: 4.32 minutes/month
- Credit: 25% for each 0.1% below target
- Incident response: < 15 minutes

### Sovereign (Custom)
- Negotiated uptime targets
- Penalty/credit structure
- Dedicated on-call team
- Custom incident procedures

---

## Compute Cost Analysis

### Our Costs (Cloudflare Workers)
| Resource | Our Cost |
|----------|----------|
| 1M requests | ~$0.50 |
| CPU time (50ms avg) | ~$0.10/M |
| Shadow memory (KV) | ~$0.50/GB |
| Total per 1M | ~$0.60 |

### Our Pricing Margin
| Tier | Price/1M | Margin |
|------|----------|--------|
| Professional | $0.049 | ~-500% (loss leader) |
| Enterprise | $0.025 | ~-2300% (loss leader) |
| Overage | $0.80 | ~33% |
| API Pay-as-you-go | $1.00 | ~40% |

**Strategy**: Tiers are loss leaders to drive adoption. Margin comes from overage and enterprise upsells.

---

## Competitive Comparison

| Provider | Unlogged | Dark Mode | Sandland | Price/1M |
|----------|----------|-----------|----------|----------|
| AWS Lambda | ❌ | ❌ | ❌ | $0.20 |
| GCP Functions | ❌ | ❌ | ❌ | $0.25 |
| Azure Functions | ❌ | ❌ | ❌ | $0.20 |
| Cloudflare Workers | ⚠️ | ⚠️ | ❌ | $0.50 |
| **Obscura (Us)** | ✅ | ✅ | ✅ | $0.80-1.00 |

**Our premium**: 2-5x for guaranteed dark computation + Sandland.

---

## Revenue Projections

### Year 1 Conservative
| Customers | MRR | ARR |
|-----------|-----|-----|
| 500 Developer | $0 | $0 |
| 100 Professional | $4,900 | $58,800 |
| 10 Enterprise | $4,990 | $59,880 |
| Overage | $2,000 | $24,000 |
| **Total** | **$11,890** | **$142,680** |

### Year 2 Growth
| Customers | MRR | ARR |
|-----------|-----|-----|
| 5,000 Developer | $0 | $0 |
| 1,000 Professional | $49,000 | $588,000 |
| 50 Enterprise | $24,950 | $299,400 |
| 5 Sovereign | ~$25,000 | ~$300,000 |
| Overage | $15,000 | $180,000 |
| **Total** | **~$114,000** | **~$1,367,400** |

### Year 3 Scale
| Customers | MRR | ARR |
|-----------|-----|-----|
| 50,000 Developer | $0 | $0 |
| 10,000 Professional | $490,000 | $5,880,000 |
| 500 Enterprise | $249,500 | $2,994,000 |
| 50 Sovereign | ~$250,000 | ~$3,000,000 |
| Overage | $100,000 | $1,200,000 |
| **Total** | **~$1,090,000** | **~$13,074,000** |

---

## Implementation Checklist

- [ ] Stripe integration for billing
- [ ] Usage metering system
- [ ] Tier enforcement middleware
- [ ] Overage calculation engine
- [ ] Invoice generation
- [ ] Customer portal
- [ ] API key management
- [ ] Rate limiting per tier
- [ ] SLA monitoring
- [ ] Credit issuance system

---

**Document Version**: 1.0.0  
**Last Updated**: 2026-05-18  
**φ-Signature**: `PRICING:2.4189:7.8910`

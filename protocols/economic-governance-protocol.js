/**
 * GOV-ECO-001: Economic Governance Protocol
 *
 * Governs supply, inflation and deflation controls, fees, treasury
 * allocations, grants, and economic impact assessment.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const PHASES = [
  'supply-management',
  'monetary-controls',
  'fee-governance',
  'treasury-allocation',
  'grant-review',
  'impact-assessment'
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();

class EconomicGovernanceRuntime {
  constructor() {
    this.id = 'GOV-ECO-001';
    this.name = 'Economic Governance Protocol';
    this.version = '1.0.0';
    this.description = 'Maintains token-economic policy through supply and treasury governance.';
    this.phases = PHASES;
    this.supply = { circulating: 0, treasury: 0, burned: 0, cap: Infinity };
    this.controls = { inflationRate: 0, deflationRate: 0, lastUpdatedAt: now() };
    this.fees = new Map();
    this.allocations = [];
    this.grants = [];
    this.assessments = [];
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  manageSupply({ circulatingDelta = 0, treasuryDelta = 0, burnedDelta = 0, cap = this.supply.cap }) {
    this.supply.circulating += circulatingDelta;
    this.supply.treasury += treasuryDelta;
    this.supply.burned += burnedDelta;
    this.supply.cap = cap;
    this.log('supply-managed', clone(this.supply));
    return clone(this.supply);
  }

  setMonetaryControls({ inflationRate = this.controls.inflationRate, deflationRate = this.controls.deflationRate }) {
    this.controls = { inflationRate, deflationRate, lastUpdatedAt: now() };
    this.log('monetary-controls-set', clone(this.controls));
    return clone(this.controls);
  }

  setFee({ feeId, basisPoints, owner = 'governance' }) {
    const fee = { feeId, basisPoints, owner, updatedAt: now() };
    this.fees.set(feeId, fee);
    this.log('fee-set', fee);
    return fee;
  }

  allocateTreasury({ allocationId, amount, recipient, purpose }) {
    this.supply.treasury -= amount;
    const allocation = { allocationId, amount, recipient, purpose, createdAt: now() };
    this.allocations.push(allocation);
    this.log('treasury-allocated', allocation);
    return allocation;
  }

  awardGrant({ grantId, applicant, amount, milestone }) {
    const grant = { grantId, applicant, amount, milestone, status: 'approved', createdAt: now() };
    this.grants.push(grant);
    this.log('grant-awarded', grant);
    return grant;
  }

  assessImpact({ subject, growthScore, stabilityScore, equityScore }) {
    const assessment = {
      subject,
      growthScore,
      stabilityScore,
      equityScore,
      composite: (growthScore + stabilityScore + equityScore) / 3,
      assessedAt: now()
    };
    this.assessments.push(assessment);
    this.log('impact-assessed', assessment);
    return assessment;
  }

  validate(input = {}) {
    const issues = [];
    if (!input.action) issues.push('action is required');
    if (input.basisPoints !== undefined && input.basisPoints < 0) issues.push('basisPoints must be non-negative');
    if (input.amount !== undefined && input.amount < 0) issues.push('amount must be non-negative');
    if (input.action === 'allocate-treasury' && input.amount > this.supply.treasury) issues.push('allocation exceeds treasury balance');
    if (input.cap !== undefined && input.cap < this.supply.circulating) issues.push('cap cannot be below circulating supply');
    if (input.inflationRate !== undefined && input.inflationRate > PHI) issues.push('inflationRate exceeds phi-boundary');

    return {
      valid: issues.length === 0,
      issues,
      supply: clone(this.supply),
      controls: clone(this.controls),
      fees: [...this.fees.values()].map(clone)
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, phase: 'supply-management' };
    }

    switch (input.action) {
      case 'manage-supply':
        return { success: true, phase: 'supply-management', supply: this.manageSupply(input) };
      case 'set-monetary-controls':
        return { success: true, phase: 'monetary-controls', controls: this.setMonetaryControls(input) };
      case 'set-fee':
        return { success: true, phase: 'fee-governance', fee: this.setFee(input) };
      case 'allocate-treasury':
        return { success: true, phase: 'treasury-allocation', allocation: this.allocateTreasury(input) };
      case 'award-grant':
        return { success: true, phase: 'grant-review', grant: this.awardGrant(input) };
      case 'assess-impact':
        return { success: true, phase: 'impact-assessment', assessment: this.assessImpact(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ since = 0 } = {}) {
    return {
      id: this.id,
      phases: [...this.phases],
      supply: clone(this.supply),
      controls: clone(this.controls),
      fees: [...this.fees.values()].map(clone),
      allocations: clone(this.allocations),
      grants: clone(this.grants),
      assessments: clone(this.assessments),
      entries: this.auditTrail.filter((entry) => entry.timestamp >= since)
    };
  }
}

const runtime = new EconomicGovernanceRuntime();

export const EconomicGovernanceProtocol = {
  id: runtime.id,
  name: runtime.name,
  version: runtime.version,
  description: runtime.description,
  phi: PHI,
  heartbeat: HEARTBEAT_MS,
  threshold: THRESHOLD,
  stages: PHASES,
  phases: PHASES,
  validate: (input) => runtime.validate(input),
  enforce: (input) => runtime.enforce(input),
  audit: (input) => runtime.audit(input)
};

export { PHI, HEARTBEAT_MS, THRESHOLD, PHASES, EconomicGovernanceRuntime };
export default EconomicGovernanceProtocol;

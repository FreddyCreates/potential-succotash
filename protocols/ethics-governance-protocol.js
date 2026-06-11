/**
 * GOV-ETHICS-001: Ethics Governance Protocol
 *
 * Governs bias detection, fairness metrics, explainability, transparency,
 * harm prevention, oversight triggers, and ethical review board workflows.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const PHASES = [
  'screening',
  'fairness-evaluation',
  'transparency-review',
  'human-oversight',
  'ethics-board',
  'remediation'
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();

class EthicsGovernanceRuntime {
  constructor() {
    this.id = 'GOV-ETHICS-001';
    this.name = 'Ethics Governance Protocol';
    this.version = '1.0.0';
    this.description = 'Imposes ethical guardrails on model behavior and high-impact decisions.';
    this.phases = PHASES;
    this.biasFindings = [];
    this.fairnessReviews = [];
    this.transparencyRequirements = [];
    this.harmCases = [];
    this.oversightTriggers = [];
    this.reviewBoard = ['chair', 'ethicist', 'domain-expert', 'user-advocate'];
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  detectBias({ systemId, disparityScore, protectedAttribute, evidence = [] }) {
    const finding = {
      id: `bias-${this.biasFindings.length + 1}`,
      systemId,
      disparityScore,
      protectedAttribute,
      evidence: [...evidence],
      exceedsThreshold: disparityScore > THRESHOLD,
      createdAt: now()
    };
    this.biasFindings.push(finding);
    this.log('bias-detected', finding);
    return finding;
  }

  evaluateFairness({ systemId, parityScore, calibrationScore, recourseScore }) {
    const fairness = {
      id: `fairness-${this.fairnessReviews.length + 1}`,
      systemId,
      parityScore,
      calibrationScore,
      recourseScore,
      compositeScore: (parityScore + calibrationScore + recourseScore) / 3,
      createdAt: now()
    };
    this.fairnessReviews.push(fairness);
    this.log('fairness-reviewed', fairness);
    return fairness;
  }

  requireTransparency({ systemId, level, disclosures, explanationTemplate }) {
    const requirement = { systemId, level, disclosures: [...disclosures], explanationTemplate, timestamp: now() };
    this.transparencyRequirements.push(requirement);
    this.log('transparency-required', requirement);
    return requirement;
  }

  preventHarm({ systemId, category, severity, mitigation }) {
    const harmCase = {
      id: `harm-${this.harmCases.length + 1}`,
      systemId,
      category,
      severity,
      mitigation,
      blocksRelease: severity >= THRESHOLD,
      openedAt: now()
    };
    this.harmCases.push(harmCase);
    this.log('harm-prevented', harmCase);
    return harmCase;
  }

  triggerOversight({ systemId, reason, confidence }) {
    const trigger = {
      id: `oversight-${this.oversightTriggers.length + 1}`,
      systemId,
      reason,
      confidence,
      humanReviewRequired: confidence >= THRESHOLD,
      triggeredAt: now()
    };
    this.oversightTriggers.push(trigger);
    this.log('oversight-triggered', trigger);
    return trigger;
  }

  reviewByBoard({ caseId, disposition, boardNotes, members = this.reviewBoard }) {
    const review = { caseId, disposition, boardNotes, members: [...members], reviewedAt: now() };
    this.log('ethics-board-reviewed', review);
    return review;
  }

  validate(input = {}) {
    const issues = [];
    if (!input.action) issues.push('action is required');
    if (input.disparityScore !== undefined && input.disparityScore < 0) issues.push('disparityScore must be non-negative');
    if (input.parityScore !== undefined && input.parityScore > 1) issues.push('parityScore must be <= 1');
    if (input.confidence !== undefined && input.confidence < THRESHOLD && input.action === 'trigger-oversight') {
      issues.push('oversight trigger confidence is below threshold');
    }
    if (input.severity !== undefined && input.severity < 0) issues.push('severity must be non-negative');
    if (input.disclosures && !Array.isArray(input.disclosures)) issues.push('disclosures must be an array');

    return {
      valid: issues.length === 0,
      issues,
      pendingBoardCases: this.harmCases.filter((entry) => entry.blocksRelease),
      outstandingOversight: this.oversightTriggers.filter((entry) => entry.humanReviewRequired)
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, phase: 'screening' };
    }

    switch (input.action) {
      case 'detect-bias':
        return { success: true, phase: 'screening', finding: this.detectBias(input) };
      case 'evaluate-fairness':
        return { success: true, phase: 'fairness-evaluation', fairness: this.evaluateFairness(input) };
      case 'require-transparency':
        return { success: true, phase: 'transparency-review', requirement: this.requireTransparency(input) };
      case 'prevent-harm':
        return { success: true, phase: 'remediation', harmCase: this.preventHarm(input) };
      case 'trigger-oversight':
        return { success: true, phase: 'human-oversight', trigger: this.triggerOversight(input) };
      case 'review-by-board':
        return { success: true, phase: 'ethics-board', review: this.reviewByBoard(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ since = 0 } = {}) {
    return {
      id: this.id,
      phases: [...this.phases],
      reviewBoard: [...this.reviewBoard],
      biasFindings: clone(this.biasFindings),
      fairnessReviews: clone(this.fairnessReviews),
      transparencyRequirements: clone(this.transparencyRequirements),
      harmCases: clone(this.harmCases),
      oversightTriggers: clone(this.oversightTriggers),
      entries: this.auditTrail.filter((entry) => entry.timestamp >= since)
    };
  }
}

const runtime = new EthicsGovernanceRuntime();

export const EthicsGovernanceProtocol = {
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

export { PHI, HEARTBEAT_MS, THRESHOLD, PHASES, EthicsGovernanceRuntime };
export default EthicsGovernanceProtocol;

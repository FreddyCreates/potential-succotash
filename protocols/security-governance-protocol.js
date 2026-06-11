/**
 * GOV-SEC-001: Security Governance Protocol
 *
 * Governs vulnerability disclosure, incident response, review, access audit,
 * key rotation, and evolving threat model policy.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const STAGES = [
  'disclosure-intake',
  'incident-response',
  'security-review',
  'access-audit',
  'key-rotation',
  'threat-model-update'
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();

class SecurityGovernanceRuntime {
  constructor() {
    this.id = 'GOV-SEC-001';
    this.name = 'Security Governance Protocol';
    this.version = '1.0.0';
    this.description = 'Coordinates security governance from disclosure through remediation and rotation.';
    this.stages = STAGES;
    this.disclosures = [];
    this.incidents = [];
    this.reviews = [];
    this.accessAudits = [];
    this.keys = new Map();
    this.threatModels = [];
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  intakeDisclosure({ disclosureId, severity, reporter, summary, embargoUntil = null }) {
    const disclosure = { disclosureId, severity, reporter, summary, embargoUntil, receivedAt: now(), status: 'triaged' };
    this.disclosures.push(disclosure);
    this.log('disclosure-intake', disclosure);
    return disclosure;
  }

  openIncident({ incidentId, severity, commander, systems }) {
    const incident = { incidentId, severity, commander, systems: [...systems], openedAt: now(), status: 'active' };
    this.incidents.push(incident);
    this.log('incident-opened', incident);
    return incident;
  }

  recordSecurityReview({ reviewId, artifact, outcome, reviewers }) {
    const review = { reviewId, artifact, outcome, reviewers: [...reviewers], reviewedAt: now() };
    this.reviews.push(review);
    this.log('security-review-recorded', review);
    return review;
  }

  auditAccess({ auditId, subject, anomalies, owner }) {
    const audit = { auditId, subject, anomalies: [...anomalies], owner, timestamp: now() };
    this.accessAudits.push(audit);
    this.log('access-audit-recorded', audit);
    return audit;
  }

  rotateKey({ keyId, owner, maxAgeMs }) {
    const key = { keyId, owner, maxAgeMs, rotatedAt: now(), nextRotationAt: now() + maxAgeMs };
    this.keys.set(keyId, key);
    this.log('key-rotated', key);
    return key;
  }

  updateThreatModel({ modelId, changes, owner, riskDelta }) {
    const model = { modelId, changes: [...changes], owner, riskDelta, updatedAt: now() };
    this.threatModels.push(model);
    this.log('threat-model-updated', model);
    return model;
  }

  validate(input = {}) {
    const issues = [];
    if (!input.action) issues.push('action is required');
    if (input.severity !== undefined && (input.severity < 0 || input.severity > PHI)) issues.push('severity must be between 0 and PHI');
    if (input.maxAgeMs !== undefined && input.maxAgeMs < HEARTBEAT_MS * 10) issues.push('key rotation age is too short');
    if (input.embargoUntil && input.embargoUntil <= now()) issues.push('embargoUntil must be in the future');
    if (input.changes && !Array.isArray(input.changes)) issues.push('changes must be an array');
    if (input.systems && input.systems.length === 0) issues.push('incident must reference at least one system');

    const overdueKeys = [...this.keys.values()].filter((key) => key.nextRotationAt <= now());
    return {
      valid: issues.length === 0,
      issues,
      overdueKeys,
      openIncidents: this.incidents.filter((incident) => incident.status === 'active')
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, stage: 'disclosure-intake' };
    }

    switch (input.action) {
      case 'intake-disclosure':
        return { success: true, stage: 'disclosure-intake', disclosure: this.intakeDisclosure(input) };
      case 'open-incident':
        return { success: true, stage: 'incident-response', incident: this.openIncident(input) };
      case 'record-security-review':
        return { success: true, stage: 'security-review', review: this.recordSecurityReview(input) };
      case 'audit-access':
        return { success: true, stage: 'access-audit', audit: this.auditAccess(input) };
      case 'rotate-key':
        return { success: true, stage: 'key-rotation', key: this.rotateKey(input) };
      case 'update-threat-model':
        return { success: true, stage: 'threat-model-update', model: this.updateThreatModel(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ since = 0 } = {}) {
    return {
      id: this.id,
      stages: [...this.stages],
      disclosures: clone(this.disclosures),
      incidents: clone(this.incidents),
      reviews: clone(this.reviews),
      accessAudits: clone(this.accessAudits),
      keys: [...this.keys.values()].map(clone),
      threatModels: clone(this.threatModels),
      entries: this.auditTrail.filter((entry) => entry.timestamp >= since)
    };
  }
}

const runtime = new SecurityGovernanceRuntime();

export const SecurityGovernanceProtocol = {
  id: runtime.id,
  name: runtime.name,
  version: runtime.version,
  description: runtime.description,
  phi: PHI,
  heartbeat: HEARTBEAT_MS,
  threshold: THRESHOLD,
  stages: STAGES,
  phases: STAGES,
  validate: (input) => runtime.validate(input),
  enforce: (input) => runtime.enforce(input),
  audit: (input) => runtime.audit(input)
};

export { PHI, HEARTBEAT_MS, THRESHOLD, STAGES, SecurityGovernanceRuntime };
export default SecurityGovernanceProtocol;

/**
 * GOV-USER-001: User Rights Protocol
 *
 * Protects identity ownership, consent, appeals, portability, erasure,
 * delegation, and transparent access to governed data.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const PHASES = [
  'identity-registration',
  'consent-management',
  'access-transparency',
  'rights-execution',
  'appeal-review',
  'delegated-rights'
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();

class UserRightsRuntime {
  constructor() {
    this.id = 'GOV-USER-001';
    this.name = 'User Rights Protocol';
    this.version = '1.0.0';
    this.description = 'Implements data sovereignty, consent governance, and enforceable user rights.';
    this.phases = PHASES;
    this.identities = new Map();
    this.consents = new Map();
    this.accessLog = [];
    this.appeals = [];
    this.delegations = [];
    this.erasureQueue = [];
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  registerIdentity({ subjectId, owner, profile = {}, sovereignKeys = [] }) {
    const record = {
      subjectId,
      owner,
      profile: clone(profile),
      sovereignKeys: [...sovereignKeys],
      createdAt: now(),
      status: 'active'
    };
    this.identities.set(subjectId, record);
    this.log('identity-registered', { subjectId, owner });
    return record;
  }

  setConsent({ subjectId, scope, granted, expiresAt = null, recorder = 'system' }) {
    const consent = { subjectId, scope, granted, expiresAt, recorder, updatedAt: now() };
    this.consents.set(`${subjectId}:${scope}`, consent);
    this.log('consent-updated', consent);
    return consent;
  }

  logAccess({ subjectId, actor, resource, purpose, delegatedBy = null }) {
    const entry = { subjectId, actor, resource, purpose, delegatedBy, timestamp: now() };
    this.accessLog.push(entry);
    this.log('access-recorded', { subjectId, actor, resource });
    return entry;
  }

  forgetUser({ subjectId, requestedBy, retentionHold = false }) {
    const request = {
      id: `erase-${this.erasureQueue.length + 1}`,
      subjectId,
      requestedBy,
      retentionHold,
      queuedAt: now(),
      status: retentionHold ? 'blocked' : 'completed'
    };
    this.erasureQueue.push(request);
    if (!retentionHold) {
      this.identities.delete(subjectId);
      for (const key of [...this.consents.keys()].filter((key) => key.startsWith(`${subjectId}:`))) {
        this.consents.delete(key);
      }
    }
    this.log('erasure-requested', request);
    return request;
  }

  exportPortableData({ subjectId }) {
    const identity = this.identities.get(subjectId) || null;
    const consents = [...this.consents.values()].filter((entry) => entry.subjectId === subjectId);
    const accessHistory = this.accessLog.filter((entry) => entry.subjectId === subjectId);
    const portabilityBundle = { subjectId, exportedAt: now(), identity, consents, accessHistory };
    this.log('data-exported', { subjectId, entries: accessHistory.length });
    return portabilityBundle;
  }

  submitAppeal({ subjectId, decisionId, rationale, requestedRemedy }) {
    const appeal = {
      id: `appeal-${this.appeals.length + 1}`,
      subjectId,
      decisionId,
      rationale,
      requestedRemedy,
      createdAt: now(),
      status: 'pending'
    };
    this.appeals.push(appeal);
    this.log('appeal-submitted', { appealId: appeal.id, decisionId });
    return appeal;
  }

  delegateRight({ subjectId, delegate, rights, expiresAt }) {
    const delegation = {
      id: `delegation-${this.delegations.length + 1}`,
      subjectId,
      delegate,
      rights: [...rights],
      expiresAt,
      active: expiresAt > now()
    };
    this.delegations.push(delegation);
    this.log('rights-delegated', { subjectId, delegate, rights: delegation.rights });
    return delegation;
  }

  validate(input = {}) {
    const issues = [];
    const identity = input.subjectId ? this.identities.get(input.subjectId) : null;
    const scopeKey = input.subjectId && input.scope ? `${input.subjectId}:${input.scope}` : null;
    const consent = scopeKey ? this.consents.get(scopeKey) : null;

    if (!input.action) issues.push('action is required');
    if (input.subjectId && !identity && input.action !== 'register-identity') issues.push('subject identity is not registered');
    if (input.scope && (!consent || consent.granted !== true || (consent.expiresAt && consent.expiresAt < now()))) {
      issues.push('valid consent is required for the requested scope');
    }
    if (input.expiresAt && input.expiresAt <= now()) issues.push('delegation expiry must be in the future');
    if (input.requestedBy && identity && identity.owner !== input.requestedBy && input.action === 'forget-user') {
      issues.push('only the identity owner may request erasure');
    }

    return {
      valid: issues.length === 0,
      issues,
      identity: identity ? clone(identity) : null,
      consent: consent ? clone(consent) : null,
      activeDelegations: this.delegations.filter((entry) => entry.subjectId === input.subjectId && entry.active)
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, phase: 'consent-management' };
    }

    switch (input.action) {
      case 'register-identity':
        return { success: true, phase: 'identity-registration', identity: this.registerIdentity(input) };
      case 'set-consent':
        return { success: true, phase: 'consent-management', consent: this.setConsent(input) };
      case 'log-access':
        return { success: true, phase: 'access-transparency', access: this.logAccess(input) };
      case 'forget-user':
        return { success: true, phase: 'rights-execution', erasure: this.forgetUser(input) };
      case 'export-data':
        return { success: true, phase: 'rights-execution', bundle: this.exportPortableData(input) };
      case 'submit-appeal':
        return { success: true, phase: 'appeal-review', appeal: this.submitAppeal(input) };
      case 'delegate-rights':
        return { success: true, phase: 'delegated-rights', delegation: this.delegateRight(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ subjectId = null, since = 0 } = {}) {
    const entries = this.auditTrail.filter((entry) => entry.timestamp >= since);
    return {
      id: this.id,
      phases: [...this.phases],
      identities: subjectId ? [clone(this.identities.get(subjectId) || null)] : [...this.identities.values()].map(clone),
      accessLog: this.accessLog.filter((entry) => !subjectId || entry.subjectId === subjectId),
      pendingAppeals: this.appeals.filter((entry) => entry.status === 'pending'),
      activeDelegations: this.delegations.filter((entry) => entry.active && (!subjectId || entry.subjectId === subjectId)),
      erasureQueue: this.erasureQueue.filter((entry) => !subjectId || entry.subjectId === subjectId),
      entries
    };
  }
}

const runtime = new UserRightsRuntime();

export const UserRightsProtocol = {
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

export { PHI, HEARTBEAT_MS, THRESHOLD, PHASES, UserRightsRuntime };
export default UserRightsProtocol;

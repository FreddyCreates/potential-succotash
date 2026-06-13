/**
 * GOV-POLICY-001: Policy Enforcement Protocol
 *
 * Manages policy drafting, review, activation, conflict resolution,
 * overrides, audit trails, and compliance scoring.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const STAGES = ['draft', 'review', 'active', 'override', 'sunset'];
const OVERRIDE_HIERARCHY = ['constitution', 'board', 'security', 'operations', 'automation'];
const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();

class PolicyEnforcementRuntime {
  constructor() {
    this.id = 'GOV-POLICY-001';
    this.name = 'Policy Enforcement Protocol';
    this.version = '1.0.0';
    this.description = 'Runs a policy lifecycle engine with conflict handling and compliance scoring.';
    this.stages = STAGES;
    this.policies = new Map();
    this.conflicts = [];
    this.overrides = [];
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  savePolicy({ policyId, title, stage = 'draft', rules = [], owner = 'governance' }) {
    const policy = {
      policyId,
      title,
      stage,
      owner,
      rules: clone(rules),
      updatedAt: now(),
      complianceScore: stage === 'active' ? 1 : THRESHOLD
    };
    this.policies.set(policyId, policy);
    this.log('policy-saved', { policyId, stage });
    return policy;
  }

  advanceLifecycle({ policyId, stage }) {
    const policy = this.policies.get(policyId);
    policy.stage = stage;
    policy.updatedAt = now();
    this.log('policy-advanced', { policyId, stage });
    return policy;
  }

  runRuleEngine({ policyId, facts = {} }) {
    const policy = this.policies.get(policyId);
    const results = policy.rules.map((rule) => {
      const observed = facts[rule.field];
      const passed = rule.operator === 'eq' ? observed === rule.value : observed !== undefined;
      return { rule: rule.id, passed, observed };
    });
    const passed = results.filter((result) => result.passed).length;
    policy.complianceScore = results.length ? passed / results.length : THRESHOLD;
    this.log('rule-engine-ran', { policyId, score: policy.complianceScore });
    return { policyId, results, complianceScore: policy.complianceScore };
  }

  resolveConflict({ primaryPolicyId, secondaryPolicyId, reason }) {
    const primary = this.policies.get(primaryPolicyId);
    const secondary = this.policies.get(secondaryPolicyId);
    const resolvedInFavorOf = STAGES.indexOf(primary.stage) >= STAGES.indexOf(secondary.stage) ? primaryPolicyId : secondaryPolicyId;
    const record = { primaryPolicyId, secondaryPolicyId, reason, resolvedInFavorOf, timestamp: now() };
    this.conflicts.push(record);
    this.log('conflict-resolved', record);
    return record;
  }

  applyOverride({ policyId, actorLevel, rationale }) {
    const override = {
      id: `override-${this.overrides.length + 1}`,
      policyId,
      actorLevel,
      precedence: OVERRIDE_HIERARCHY.indexOf(actorLevel),
      rationale,
      timestamp: now()
    };
    this.overrides.push(override);
    this.log('override-applied', override);
    return override;
  }

  validate(input = {}) {
    const issues = [];
    const policy = input.policyId ? this.policies.get(input.policyId) : null;

    if (!input.action) issues.push('action is required');
    if (input.action !== 'save-policy' && input.policyId && !policy) issues.push('policy does not exist');
    if (input.stage && !STAGES.includes(input.stage)) issues.push('invalid policy stage');
    if (input.actorLevel && !OVERRIDE_HIERARCHY.includes(input.actorLevel)) issues.push('actorLevel is outside override hierarchy');
    if (input.rules && !Array.isArray(input.rules)) issues.push('rules must be an array');
    if (policy && policy.stage === 'sunset' && input.action !== 'save-policy') issues.push('sunset policy may not be enforced');

    return {
      valid: issues.length === 0,
      issues,
      policy: policy ? clone(policy) : null,
      conflicts: this.conflicts.filter((entry) => entry.primaryPolicyId === input.policyId || entry.secondaryPolicyId === input.policyId)
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, stage: 'review' };
    }

    switch (input.action) {
      case 'save-policy':
        return { success: true, stage: input.stage || 'draft', policy: this.savePolicy(input) };
      case 'advance-lifecycle':
        return { success: true, stage: input.stage, policy: this.advanceLifecycle(input) };
      case 'run-rule-engine':
        return { success: true, stage: 'active', result: this.runRuleEngine(input) };
      case 'resolve-conflict':
        return { success: true, stage: 'review', resolution: this.resolveConflict(input) };
      case 'apply-override':
        return { success: true, stage: 'override', override: this.applyOverride(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ since = 0 } = {}) {
    const policies = [...this.policies.values()].map(clone);
    const averageScore = policies.length
      ? policies.reduce((sum, policy) => sum + (policy.complianceScore || 0), 0) / policies.length
      : 1;
    return {
      id: this.id,
      stages: [...this.stages],
      policies,
      conflicts: clone(this.conflicts),
      overrides: clone(this.overrides),
      complianceScore: averageScore,
      entries: this.auditTrail.filter((entry) => entry.timestamp >= since)
    };
  }
}

const runtime = new PolicyEnforcementRuntime();

export const PolicyEnforcementProtocol = {
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

export { PHI, HEARTBEAT_MS, THRESHOLD, STAGES, OVERRIDE_HIERARCHY, PolicyEnforcementRuntime };
export default PolicyEnforcementProtocol;

/**
 * GOV-TEMP-001: Temporal Governance Protocol
 *
 * Governs how a sovereign system evolves over time through epochs,
 * transitions, scheduled actions, time locks, sunset clauses, and
 * migration windows.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const STAGES = [
  'epoch-planning',
  'time-lock',
  'consensus-window',
  'migration-window',
  'sunset-review',
  'ratified'
];

const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();
const ratio = (value, total) => (total > 0 ? value / total : 0);

class TemporalGovernanceRuntime {
  constructor() {
    this.id = 'GOV-TEMP-001';
    this.name = 'Temporal Governance Protocol';
    this.version = '1.0.0';
    this.description = 'Coordinates epoch changes, scheduled governance actions, and time-aware policy transitions.';
    this.stages = STAGES;
    this.epochs = [{ id: 'epoch-0', label: 'genesis', start: now(), status: 'active' }];
    this.transitions = [];
    this.proposals = [];
    this.schedules = [];
    this.migrationWindows = [];
    this.sunsetClauses = [];
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  getActiveEpoch() {
    return this.epochs.find((epoch) => epoch.status === 'active') || this.epochs[this.epochs.length - 1];
  }

  createEpoch({ label, startsAt = now(), metadata = {} }) {
    const current = this.getActiveEpoch();
    if (current) current.status = 'archived';
    const epoch = {
      id: `epoch-${this.epochs.length}`,
      label,
      start: startsAt,
      status: 'active',
      metadata: clone(metadata)
    };
    this.epochs.push(epoch);
    this.log('epoch-created', { epochId: epoch.id, label });
    return epoch;
  }

  registerTransition({ fromVersion, toVersion, approvals = 0, eligibleVotes = 1, migrationWindowMs = HEARTBEAT_MS * 100 }) {
    const support = ratio(approvals, eligibleVotes);
    const transition = {
      id: `transition-${this.transitions.length + 1}`,
      fromVersion,
      toVersion,
      support,
      approved: support >= THRESHOLD,
      migrationWindowMs,
      createdAt: now()
    };
    this.transitions.push(transition);
    if (transition.approved) {
      this.version = toVersion;
      this.openMigrationWindow({
        version: toVersion,
        opensAt: now(),
        closesAt: now() + migrationWindowMs
      });
    }
    this.log('version-transition', transition);
    return transition;
  }

  scheduleAction({ action, executeAt, owner = 'governance', payload = {} }) {
    const scheduled = {
      id: `schedule-${this.schedules.length + 1}`,
      action,
      owner,
      executeAt,
      payload: clone(payload),
      status: executeAt <= now() ? 'due' : 'scheduled'
    };
    this.schedules.push(scheduled);
    this.log('action-scheduled', { scheduleId: scheduled.id, action });
    return scheduled;
  }

  lockProposal({ proposalId, unlockAt, proposer, summary, support = 0, eligibleVotes = 1 }) {
    const proposal = {
      id: proposalId || `proposal-${this.proposals.length + 1}`,
      proposer,
      summary,
      unlockAt,
      support: ratio(support, eligibleVotes),
      timeLocked: unlockAt > now(),
      createdAt: now(),
      status: unlockAt > now() ? 'locked' : 'review'
    };
    this.proposals.push(proposal);
    this.log('proposal-locked', { proposalId: proposal.id, unlockAt });
    return proposal;
  }

  defineSunsetClause({ targetId, sunsetAt, replacement = null, graceMs = HEARTBEAT_MS * 34 }) {
    const clause = { targetId, sunsetAt, replacement, graceMs, expired: sunsetAt <= now() };
    this.sunsetClauses.push(clause);
    this.log('sunset-defined', clause);
    return clause;
  }

  openMigrationWindow({ version, opensAt, closesAt, requirements = [] }) {
    const window = {
      id: `migration-${this.migrationWindows.length + 1}`,
      version,
      opensAt,
      closesAt,
      requirements: [...requirements],
      active: opensAt <= now() && closesAt >= now()
    };
    this.migrationWindows.push(window);
    this.log('migration-window', { windowId: window.id, version });
    return window;
  }

  validate(input = {}) {
    const activeWindow = this.migrationWindows.find((window) => window.active);
    const expiring = this.sunsetClauses.filter((clause) => clause.sunsetAt <= now() + HEARTBEAT_MS * 100);
    const issues = [];

    if (!input.action) issues.push('action is required');
    if (input.unlockAt && input.unlockAt <= now()) issues.push('unlockAt must be in the future');
    if (input.executeAt && input.executeAt <= now() - HEARTBEAT_MS) issues.push('scheduled action is stale');
    if (input.approvals !== undefined && input.eligibleVotes !== undefined && ratio(input.approvals, input.eligibleVotes) < THRESHOLD) {
      issues.push('temporal consensus is below threshold');
    }
    if (input.requiresMigration && !activeWindow) issues.push('no active migration window');
    if (input.sunsetAt && input.sunsetAt <= now()) issues.push('sunsetAt must be in the future');

    return {
      valid: issues.length === 0,
      issues,
      activeEpoch: this.getActiveEpoch(),
      expiringCount: expiring.length,
      activeMigrationWindow: activeWindow || null
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, stage: 'time-lock' };
    }

    switch (input.action) {
      case 'create-epoch':
        return { success: true, stage: 'epoch-planning', epoch: this.createEpoch(input) };
      case 'transition-version':
        return { success: true, stage: 'consensus-window', transition: this.registerTransition(input) };
      case 'schedule-action':
        return { success: true, stage: 'migration-window', schedule: this.scheduleAction(input) };
      case 'time-lock-proposal':
        return { success: true, stage: 'time-lock', proposal: this.lockProposal(input) };
      case 'define-sunset':
        return { success: true, stage: 'sunset-review', clause: this.defineSunsetClause(input) };
      case 'open-migration-window':
        return { success: true, stage: 'migration-window', window: this.openMigrationWindow(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ since = 0 } = {}) {
    const dueActions = this.schedules.filter((item) => item.executeAt <= now());
    const lockedProposals = this.proposals.filter((item) => item.timeLocked && item.unlockAt > now());
    const entries = this.auditTrail.filter((entry) => entry.timestamp >= since);
    return {
      id: this.id,
      version: this.version,
      epochs: clone(this.epochs),
      dueActions: clone(dueActions),
      lockedProposals: clone(lockedProposals),
      migrationWindows: clone(this.migrationWindows),
      sunsetClauses: clone(this.sunsetClauses),
      entries
    };
  }
}

const runtime = new TemporalGovernanceRuntime();

export const TemporalGovernanceProtocol = {
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

export { PHI, HEARTBEAT_MS, THRESHOLD, STAGES, TemporalGovernanceRuntime };
export default TemporalGovernanceProtocol;

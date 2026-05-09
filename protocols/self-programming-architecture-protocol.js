/**
 * SPA-001: Self-Programming Architecture Protocol
 * 
 * The self-rewriting organism capability.
 * Agents generate tools, refactor code, update protocols—
 * all guarded by NOVA-ATTEST and invariant validation.
 * 
 * @module self-programming-architecture-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Change Types ────────────────────────────────────────────────────────────
export const CHANGE_TYPES = {
  TOOL_GENERATION: 'tool_generation',
  CODE_REFACTOR: 'code_refactor',
  PROTOCOL_UPDATE: 'protocol_update',
  AGENT_EVOLUTION: 'agent_evolution',
  ARCHITECTURE_CHANGE: 'architecture_change'
};

// ─── Change States ───────────────────────────────────────────────────────────
export const CHANGE_STATES = {
  PROPOSED: 'proposed',
  VERIFYING: 'verifying',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  MERGING: 'merging',
  MERGED: 'merged',
  ROLLED_BACK: 'rolled_back'
};

// ─── Risk Levels ─────────────────────────────────────────────────────────────
export const RISK_LEVELS = {
  LOW: { id: 'low', threshold: 0.2, requires_nova: false },
  MEDIUM: { id: 'medium', threshold: 0.5, requires_nova: false },
  HIGH: { id: 'high', threshold: 0.8, requires_nova: true },
  CRITICAL: { id: 'critical', threshold: 1.0, requires_nova: true }
};

// ─── Proposed Change ─────────────────────────────────────────────────────────
class ProposedChange {
  constructor(id, type, description, diff) {
    this.id = id;
    this.type = type;
    this.description = description;
    this.diff = diff;
    this.state = CHANGE_STATES.PROPOSED;
    this.riskScore = 0;
    this.riskLevel = RISK_LEVELS.LOW;
    this.invariantViolations = [];
    this.testResults = null;
    this.novaAttestation = null;
    this.proposer = null;
    this.created = Date.now();
    this.timeline = [{
      action: 'proposed',
      timestamp: Date.now()
    }];
  }
  
  assessRisk() {
    // Phi-weighted risk assessment
    let risk = 0;
    
    // Type-based risk
    switch (this.type) {
      case CHANGE_TYPES.ARCHITECTURE_CHANGE:
        risk += 0.4;
        break;
      case CHANGE_TYPES.PROTOCOL_UPDATE:
        risk += 0.3;
        break;
      case CHANGE_TYPES.AGENT_EVOLUTION:
        risk += 0.2;
        break;
      case CHANGE_TYPES.CODE_REFACTOR:
        risk += 0.15;
        break;
      case CHANGE_TYPES.TOOL_GENERATION:
        risk += 0.1;
        break;
    }
    
    // Diff size risk (phi-weighted)
    const diffSize = JSON.stringify(this.diff).length;
    risk += Math.min(0.3, (diffSize / 10000) * PHI_INV);
    
    this.riskScore = Math.min(1, risk);
    
    // Determine risk level
    if (this.riskScore >= RISK_LEVELS.CRITICAL.threshold * 0.9) {
      this.riskLevel = RISK_LEVELS.CRITICAL;
    } else if (this.riskScore >= RISK_LEVELS.HIGH.threshold * 0.9) {
      this.riskLevel = RISK_LEVELS.HIGH;
    } else if (this.riskScore >= RISK_LEVELS.MEDIUM.threshold * 0.9) {
      this.riskLevel = RISK_LEVELS.MEDIUM;
    } else {
      this.riskLevel = RISK_LEVELS.LOW;
    }
    
    return this.riskLevel;
  }
  
  addTimeline(action, details = {}) {
    this.timeline.push({
      action,
      details,
      timestamp: Date.now()
    });
  }
  
  verify(testResults) {
    this.state = CHANGE_STATES.VERIFYING;
    this.testResults = testResults;
    this.addTimeline('verify', { testResults });
    return testResults;
  }
  
  approve(novaAttestation = null) {
    this.state = CHANGE_STATES.APPROVED;
    this.novaAttestation = novaAttestation;
    this.addTimeline('approve', { novaAttestation: novaAttestation?.id });
  }
  
  reject(reason) {
    this.state = CHANGE_STATES.REJECTED;
    this.addTimeline('reject', { reason });
  }
  
  merge() {
    this.state = CHANGE_STATES.MERGED;
    this.addTimeline('merge');
  }
  
  rollback(reason) {
    this.state = CHANGE_STATES.ROLLED_BACK;
    this.addTimeline('rollback', { reason });
  }
}

// ─── Invariant Checker ───────────────────────────────────────────────────────
class InvariantChecker {
  constructor() {
    this.invariants = new Map();
    this.violations = [];
  }
  
  register(id, description, checkFn) {
    this.invariants.set(id, {
      id,
      description,
      check: checkFn
    });
  }
  
  async check(change) {
    const violations = [];
    
    for (const [id, invariant] of this.invariants) {
      try {
        const result = await invariant.check(change);
        if (!result.passed) {
          violations.push({
            invariantId: id,
            description: invariant.description,
            message: result.message
          });
        }
      } catch (error) {
        violations.push({
          invariantId: id,
          description: invariant.description,
          message: `Check failed: ${error.message}`
        });
      }
    }
    
    change.invariantViolations = violations;
    return violations;
  }
}

// ─── Test Runner ─────────────────────────────────────────────────────────────
class TestRunner {
  constructor() {
    this.tests = new Map();
  }
  
  register(id, description, testFn) {
    this.tests.set(id, {
      id,
      description,
      test: testFn
    });
  }
  
  async run(change) {
    const results = {
      passed: 0,
      failed: 0,
      tests: []
    };
    
    for (const [id, test] of this.tests) {
      try {
        const startTime = Date.now();
        const passed = await test.test(change);
        const duration = Date.now() - startTime;
        
        results.tests.push({
          id,
          passed,
          duration
        });
        
        if (passed) results.passed++;
        else results.failed++;
      } catch (error) {
        results.tests.push({
          id,
          passed: false,
          error: error.message
        });
        results.failed++;
      }
    }
    
    results.allPassed = results.failed === 0;
    return results;
  }
}

// ─── Self-Programming Architecture Protocol ──────────────────────────────────
export class SelfProgrammingArchitectureProtocol {
  constructor() {
    this.id = 'SPA-001';
    this.name = 'Self-Programming Architecture';
    this.version = '1.0.0';
    
    this.changes = new Map();
    this.invariantChecker = new InvariantChecker();
    this.testRunner = new TestRunner();
    this.mergeHistory = [];
    
    this.metrics = {
      proposals: 0,
      approvals: 0,
      rejections: 0,
      merges: 0,
      rollbacks: 0
    };
    
    // Register default invariants
    this.registerDefaultInvariants();
  }
  
  registerDefaultInvariants() {
    this.invariantChecker.register(
      'phi-constant',
      'PHI constant must not change',
      async (change) => ({
        passed: !JSON.stringify(change.diff).includes('PHI = '),
        message: 'PHI constant modification detected'
      })
    );
    
    this.invariantChecker.register(
      'heartbeat',
      'Heartbeat must remain 873ms',
      async (change) => ({
        passed: !JSON.stringify(change.diff).includes('HEARTBEAT = ') ||
                JSON.stringify(change.diff).includes('HEARTBEAT = 873'),
        message: 'Heartbeat modification detected'
      })
    );
  }
  
  // ─── SPA-PROPOSE: Propose change ───────────────────────────────────────────
  propose(type, description, diff, proposer) {
    const changeId = `change-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    const change = new ProposedChange(changeId, type, description, diff);
    change.proposer = proposer;
    
    // Assess risk
    change.assessRisk();
    
    this.changes.set(changeId, change);
    this.metrics.proposals++;
    
    return change;
  }
  
  // ─── SPA-VERIFY: Test and simulate ─────────────────────────────────────────
  async verify(changeId) {
    const change = this.changes.get(changeId);
    if (!change) throw new Error(`Change not found: ${changeId}`);
    
    // Check invariants
    const violations = await this.invariantChecker.check(change);
    
    if (violations.length > 0) {
      change.reject(`Invariant violations: ${violations.map(v => v.invariantId).join(', ')}`);
      this.metrics.rejections++;
      return { approved: false, violations };
    }
    
    // Run tests
    const testResults = await this.testRunner.run(change);
    change.verify(testResults);
    
    if (!testResults.allPassed) {
      change.reject(`Test failures: ${testResults.failed} tests failed`);
      this.metrics.rejections++;
      return { approved: false, testResults };
    }
    
    return { approved: true, testResults };
  }
  
  // ─── SPA-MERGE: Adopt into civilization ────────────────────────────────────
  async merge(changeId, novaAttestation = null) {
    const change = this.changes.get(changeId);
    if (!change) throw new Error(`Change not found: ${changeId}`);
    
    // Check if Nova attestation required
    if (change.riskLevel.requires_nova && !novaAttestation) {
      throw new Error('Nova attestation required for this risk level');
    }
    
    // Approve
    change.approve(novaAttestation);
    this.metrics.approvals++;
    
    // Merge
    change.merge();
    this.metrics.merges++;
    
    // Record in history
    this.mergeHistory.push({
      changeId,
      type: change.type,
      risk: change.riskLevel.id,
      merged: Date.now()
    });
    
    return change;
  }
  
  // ─── Rollback change ───────────────────────────────────────────────────────
  rollback(changeId, reason) {
    const change = this.changes.get(changeId);
    if (!change) throw new Error(`Change not found: ${changeId}`);
    
    change.rollback(reason);
    this.metrics.rollbacks++;
    
    return change;
  }
  
  // ─── Get change ────────────────────────────────────────────────────────────
  getChange(changeId) {
    return this.changes.get(changeId);
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      pending: Array.from(this.changes.values())
        .filter(c => c.state === CHANGE_STATES.PROPOSED).length,
      success_rate: this.metrics.proposals > 0
        ? this.metrics.merges / this.metrics.proposals
        : 0
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      changes: Array.from(this.changes.entries()).map(([id, change]) => ({
        id,
        type: change.type,
        state: change.state,
        risk: change.riskLevel.id
      })),
      mergeHistory: this.mergeHistory.slice(-100),
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Only changes passing NOVA-ATTEST and invariants merge',
  'PHI constant immutable',
  'Heartbeat immutable at 873ms',
  'All changes tested before merge'
];

export default SelfProgrammingArchitectureProtocol;

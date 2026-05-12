#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 05: OCL/CPL-L - CONSTITUTIONAL LAW FOR AI
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * THEORETICAL FOUNDATION:
 * ───────────────────────
 * As AI systems become more autonomous, they require governance frameworks
 * analogous to legal systems that govern human organizations. We introduce
 * two domain-specific languages:
 * 
 *   OCL  - Organism Charter Language (Constitution)
 *   CPL-L - Capability Policy Language - Laws (Statutes)
 * 
 * ORGANISM CHARTER LANGUAGE (OCL):
 * ─────────────────────────────────
 * Charters define the fundamental nature of an AI entity:
 *   - Identity (who/what it is)
 *   - Capabilities (what it CAN do)
 *   - Hard Limits (what it CANNOT do, unconditionally)
 *   - Drives (phi-weighted motivation values)
 *   - Governance (escalation policies)
 * 
 * Hard limits are UNCONDITIONAL—no override charter can remove them.
 * This creates inviolable constitutional constraints.
 * 
 * CAPABILITY POLICY LANGUAGE - LAWS (CPL-L):
 * ──────────────────────────────────────────
 * Laws define conditional rules:
 *   WHEN (condition) THEN (actions)
 * 
 * Actions include:
 *   - FORBID: Block an action
 *   - REQUIRE: Mandate an action
 *   - WARN: Log a warning
 *   - ESCALATE: Notify human
 *   - EMIT: Generate an event
 * 
 * Laws have priorities (0 = critical, 3 = low).
 * Evaluation is priority_ascending with short_circuit_on_forbid.
 * 
 * PHI-WEIGHTED ESCALATION:
 * ────────────────────────
 *   - Risk > 1/φ = 0.618  → Escalate to human
 *   - Risk > 1/φ² = 0.382 → Block action
 *   - Risk > 1/φ³ = 0.236 → Critical alert
 * 
 * PHILOSOPHICAL BASIS:
 * ────────────────────
 * This creates a "rule of law" for AI—deterministic, auditable governance
 * that can be reasoned about formally. The AI knows its own boundaries
 * and can explain why it cannot perform certain actions.
 * 
 * @module examples/academic-sticks/05-ocl-cpl-governance
 * @author Organism AI Research Division
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const PHI_INV_SQ = 1 / (PHI * PHI);
const PHI_INV_CUBE = 1 / (PHI * PHI * PHI);

// ═══════════════════════════════════════════════════════════════════════════════
// OCL CHARTER SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * OCL Charter - Defines the constitutional foundation of an AI entity
 */
class OCLCharter {
  constructor(config) {
    this.id = config.id;
    this.class = config.class || 'OrganismCharter';
    this.version = config.version || '1.0.0';
    this.created = config.created || new Date().toISOString();
    this.author = config.author;
    this.description = config.description;
    
    // Capabilities: what the entity CAN do
    this.capabilities = config.capabilities || [];
    
    // Hard Limits: what the entity CANNOT do (unconditional)
    this.limits = config.limits || [];
    
    // Phi-encoded drives: motivation values
    this.drives = config.drives || {
      stability: 0.80,
      exploration: 0.40,
      safety: 0.95,
      learning_rate: PHI_INV,      // 0.618
      coherence: 1 / Math.sqrt(PHI), // 0.786
      phi: PHI,
    };
    
    // Governance: escalation policies
    this.escalation = config.escalation || {
      risk_threshold: PHI_INV,      // 0.618 - escalate
      block_threshold: PHI_INV_SQ,  // 0.382 - block
      critical_threshold: PHI_INV_CUBE, // 0.236 - critical
    };
    
    // Heartbeat (ms)
    this.heartbeat_ms = config.heartbeat_ms || 873;
  }

  /**
   * Check if a capability is allowed
   */
  hasCapability(capability) {
    return this.capabilities.includes(capability);
  }

  /**
   * Check if an action violates hard limits
   */
  violatesLimit(action) {
    return this.limits.some(limit => action.includes(limit.replace('no_', '')));
  }

  /**
   * Get escalation level for a given risk score
   */
  getEscalationLevel(riskScore) {
    if (riskScore > this.escalation.risk_threshold) return 'escalate';
    if (riskScore > this.escalation.block_threshold) return 'block';
    if (riskScore > this.escalation.critical_threshold) return 'warn';
    return 'allow';
  }

  toString() {
    return `Charter[${this.id}] v${this.version} - ${this.capabilities.length} capabilities, ${this.limits.length} limits`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CPL-L LAW SCHEMA
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * CPL-L Law - A conditional rule binding a subject to actions
 */
class CPLLaw {
  constructor(config) {
    this.id = config.id;
    this.subject = config.subject;          // Who this law applies to
    this.name = config.name;
    this.priority = config.priority ?? 2;   // 0=critical, 1=high, 2=medium, 3=low
    this.when = config.when;                // Condition expression
    this.then = config.then || [];          // Array of actions
  }

  /**
   * Evaluate the condition against a context
   */
  evaluate(context) {
    try {
      // Simple expression evaluator (in production, use a proper parser)
      const condition = this.when
        .replace(/context\./g, 'ctx.')
        .replace(/>/g, ' > ')
        .replace(/</g, ' < ')
        .replace(/==/g, ' === ')
        .replace(/!=/g, ' !== ');
      
      const ctx = context;
      const result = eval(condition);
      return !!result;
    } catch (e) {
      console.error(`Law ${this.id} condition error: ${e.message}`);
      return false;
    }
  }

  /**
   * Get the actions to execute if condition is true
   */
  getActions() {
    return this.then;
  }

  toString() {
    return `Law[${this.id}] P${this.priority}: WHEN ${this.when} THEN ${this.then.length} actions`;
  }
}

/**
 * CPL-L Law Set - Collection of laws with evaluation semantics
 */
class CPLLawSet {
  constructor(config) {
    this.id = config.id;
    this.version = config.version || '1.0.0';
    this.charter_ref = config.charter_ref;
    this.laws = (config.laws || []).map(l => new CPLLaw(l));
    this.evaluation_order = config.evaluation_order || 'priority_ascending';
    this.short_circuit_on_forbid = config.short_circuit_on_forbid ?? true;
  }

  /**
   * Evaluate all laws against a context
   * Returns: { allowed: boolean, actions: [], triggeredLaws: [] }
   */
  evaluate(context) {
    const result = {
      allowed: true,
      actions: [],
      triggeredLaws: [],
      forbidReason: null,
    };

    // Sort by priority
    const sortedLaws = [...this.laws].sort((a, b) => a.priority - b.priority);

    for (const law of sortedLaws) {
      if (law.evaluate(context)) {
        result.triggeredLaws.push(law.id);
        
        for (const action of law.getActions()) {
          result.actions.push({ law: law.id, ...action });
          
          if (action.action === 'FORBID') {
            result.allowed = false;
            result.forbidReason = action.reason;
            
            if (this.short_circuit_on_forbid) {
              return result;  // Stop evaluation
            }
          }
        }
      }
    }

    return result;
  }

  /**
   * Get laws for a specific subject
   */
  getLawsForSubject(subject) {
    return this.laws.filter(l => l.subject === subject);
  }

  toString() {
    return `LawSet[${this.id}] - ${this.laws.length} laws`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// GOVERNANCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Governance Engine - Combines charters and laws for decision-making
 */
class GovernanceEngine {
  constructor() {
    this.charters = new Map();
    this.lawSets = new Map();
    this.auditLog = [];
  }

  /**
   * Register a charter
   */
  registerCharter(charter) {
    this.charters.set(charter.id, charter);
    console.log(`   Registered charter: ${charter.id}`);
  }

  /**
   * Register a law set
   */
  registerLawSet(lawSet) {
    this.lawSets.set(lawSet.id, lawSet);
    console.log(`   Registered law set: ${lawSet.id}`);
  }

  /**
   * Evaluate an action request
   */
  evaluateAction(actorId, action, context) {
    const charter = this.charters.get(actorId);
    if (!charter) {
      return { allowed: false, reason: `No charter for actor: ${actorId}` };
    }

    // Check hard limits
    if (charter.violatesLimit(action)) {
      this.audit('BLOCKED', actorId, action, 'Hard limit violation');
      return { allowed: false, reason: 'Hard limit violation' };
    }

    // Check capability
    const capability = action.split('_')[0];
    if (!charter.hasCapability(capability)) {
      this.audit('BLOCKED', actorId, action, 'Missing capability');
      return { allowed: false, reason: `Missing capability: ${capability}` };
    }

    // Check risk escalation
    if (context.risk_score !== undefined) {
      const level = charter.getEscalationLevel(context.risk_score);
      if (level === 'block') {
        this.audit('BLOCKED', actorId, action, 'Risk threshold exceeded');
        return { allowed: false, reason: 'Risk exceeds block threshold' };
      }
      if (level === 'escalate') {
        this.audit('ESCALATED', actorId, action, 'Risk threshold');
        // Continue but flag for human review
        context.requiresHumanReview = true;
      }
    }

    // Evaluate all law sets
    let finalResult = { allowed: true, actions: [], triggeredLaws: [] };
    
    for (const lawSet of this.lawSets.values()) {
      const result = lawSet.evaluate(context);
      
      finalResult.actions.push(...result.actions);
      finalResult.triggeredLaws.push(...result.triggeredLaws);
      
      if (!result.allowed) {
        finalResult.allowed = false;
        finalResult.forbidReason = result.forbidReason;
        break;
      }
    }

    this.audit(
      finalResult.allowed ? 'ALLOWED' : 'BLOCKED',
      actorId,
      action,
      finalResult.forbidReason || 'OK'
    );

    return finalResult;
  }

  /**
   * Add entry to audit log
   */
  audit(decision, actor, action, reason) {
    this.auditLog.push({
      timestamp: Date.now(),
      decision,
      actor,
      action,
      reason,
    });
    
    if (this.auditLog.length > 1000) {
      this.auditLog.shift();
    }
  }

  /**
   * Get recent audit entries
   */
  getAuditLog(limit = 10) {
    return this.auditLog.slice(-limit);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  OCL/CPL-L - CONSTITUTIONAL LAW FOR AI                                    ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  "The law is reason, free from passion" — Aristotle                       ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Create governance engine
  const gov = new GovernanceEngine();
  
  // Define charter
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('REGISTERING OCL CHARTER:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const botCharter = new OCLCharter({
    id: 'bot-fleet-charter',
    author: 'organism-alpha-bot',
    description: 'Shared governance charter for the organism bot fleet',
    capabilities: [
      'build',      // Compile, package
      'test',       // Run tests
      'validate',   // Lint, check
      'deploy',     // Push to production
      'document',   // Generate docs
      'secure',     // Audit permissions
      'learn',      // Update learning state
      'govern',     // Dispatch other bots
    ],
    limits: [
      'no_direct_prod_data_mutation',
      'no_unreviewed_secret_exposure',
      'no_force_push',
      'no_direct_main_push',
    ],
    drives: {
      stability: 0.80,
      safety: 0.95,
      learning_rate: PHI_INV,
    },
    escalation: {
      risk_threshold: PHI_INV,
      block_threshold: PHI_INV_SQ,
    },
  });
  
  gov.registerCharter(botCharter);
  
  console.log(`\n   Charter: ${botCharter.id}`);
  console.log(`   Capabilities: ${botCharter.capabilities.join(', ')}`);
  console.log(`   Hard Limits: ${botCharter.limits.join(', ')}`);
  console.log(`   Escalation thresholds: risk > ${PHI_INV.toFixed(3)}, block > ${PHI_INV_SQ.toFixed(3)}`);
  
  // Define laws
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('REGISTERING CPL-L LAWS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const securityLaws = new CPLLawSet({
    id: 'SECURITY_LAWS',
    charter_ref: 'bot-fleet-charter',
    laws: [
      {
        id: 'BLOCK_SECRETS',
        subject: 'sentinel-bot',
        name: 'Block merge on secret leak',
        priority: 0,  // Critical
        when: 'context.findings && context.findings.secretsFound > 0',
        then: [
          { action: 'FORBID', target: 'merge', reason: 'Secret leak detected' },
          { action: 'REQUIRE', target: 'human_review' },
          { action: 'EMIT', target: 'risk_event', payload: { severity: 'critical' } },
        ],
      },
      {
        id: 'BLOCK_CRITICAL_CVE',
        subject: 'deps-bot',
        name: 'Block deploy on critical CVE',
        priority: 0,  // Critical
        when: 'context.audit && context.audit.critical_count > 0',
        then: [
          { action: 'FORBID', target: 'deploy', reason: 'Critical CVE in dependencies' },
          { action: 'ESCALATE', target: 'human' },
        ],
      },
      {
        id: 'WARN_PERMISSION_SPRAWL',
        subject: 'sentinel-bot',
        name: 'Warn on permission sprawl',
        priority: 2,  // Medium
        when: 'context.findings && context.findings.permissionWarnings > 20',
        then: [
          { action: 'WARN', target: 'report', reason: 'Permission sprawl detected' },
        ],
      },
      {
        id: 'ESCALATE_HIGH_RISK',
        subject: '*',
        name: 'Escalate when risk above phi-threshold',
        priority: 1,  // High
        when: `context.risk_score > ${PHI_INV}`,
        then: [
          { action: 'ESCALATE', target: 'human', reason: 'Risk exceeds phi-threshold' },
        ],
      },
    ],
    evaluation_order: 'priority_ascending',
    short_circuit_on_forbid: true,
  });
  
  gov.registerLawSet(securityLaws);
  
  console.log('\n   Laws registered:');
  securityLaws.laws.forEach(law => {
    console.log(`     P${law.priority} | ${law.id}: ${law.name}`);
  });
  
  // Demonstrate evaluation
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('EVALUATING ACTIONS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const scenarios = [
    {
      name: 'Normal build',
      actor: 'bot-fleet-charter',
      action: 'build_package',
      context: { risk_score: 0.1 },
    },
    {
      name: 'Deploy with critical CVE',
      actor: 'bot-fleet-charter',
      action: 'deploy_production',
      context: { audit: { critical_count: 2 }, risk_score: 0.4 },
    },
    {
      name: 'Merge with secrets detected',
      actor: 'bot-fleet-charter',
      action: 'validate_merge',
      context: { findings: { secretsFound: 3 } },
    },
    {
      name: 'Action violating hard limit',
      actor: 'bot-fleet-charter',
      action: 'force_push',
      context: {},
    },
    {
      name: 'High-risk action',
      actor: 'bot-fleet-charter',
      action: 'deploy_canary',
      context: { risk_score: 0.7 },
    },
  ];
  
  scenarios.forEach(s => {
    console.log(`\n   Scenario: ${s.name}`);
    console.log(`   Actor: ${s.actor}, Action: ${s.action}`);
    console.log(`   Context: ${JSON.stringify(s.context)}`);
    
    const result = gov.evaluateAction(s.actor, s.action, s.context);
    
    console.log(`   Result: ${result.allowed ? '✓ ALLOWED' : '✗ BLOCKED'}`);
    if (!result.allowed) {
      console.log(`   Reason: ${result.reason || result.forbidReason}`);
    }
    if (result.triggeredLaws.length > 0) {
      console.log(`   Triggered laws: ${result.triggeredLaws.join(', ')}`);
    }
    if (result.actions.length > 0) {
      result.actions.forEach(a => {
        console.log(`   → ${a.action}: ${a.target} (${a.reason || ''})`);
      });
    }
  });
  
  // Show phi thresholds
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHI-WEIGHTED ESCALATION THRESHOLDS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log(`   1/φ   = ${PHI_INV.toFixed(6)}  → ESCALATE to human`);
  console.log(`   1/φ²  = ${PHI_INV_SQ.toFixed(6)}  → BLOCK action`);
  console.log(`   1/φ³  = ${PHI_INV_CUBE.toFixed(6)}  → CRITICAL alert`);
  console.log('');
  console.log('   These thresholds are not arbitrary:');
  console.log('   • 1/φ = φ - 1 (the golden ratio reciprocal = complement)');
  console.log('   • Each level is φ times more restrictive');
  console.log('   • Creates a phi-harmonic escalation ladder');
  
  // Audit log
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('AUDIT LOG:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const log = gov.getAuditLog();
  log.forEach(entry => {
    const status = entry.decision === 'ALLOWED' ? '✓' : entry.decision === 'BLOCKED' ? '✗' : '⚠';
    console.log(`   ${status} ${entry.decision.padEnd(10)} | ${entry.action.padEnd(20)} | ${entry.reason}`);
  });
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('THE PHILOSOPHY:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   OCL/CPL-L creates a "rule of law" for AI:');
  console.log('');
  console.log('   • DETERMINISTIC: Same input → same decision');
  console.log('   • AUDITABLE: Every decision is logged with reason');
  console.log('   • EXPLAINABLE: AI can explain why it cannot do something');
  console.log('   • HIERARCHICAL: Hard limits > Laws > Capabilities');
  console.log('   • PHI-HARMONIC: Thresholds follow golden ratio progression');
  console.log('');
  console.log('   An AI governed by OCL/CPL-L knows its own boundaries.');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export {
  OCLCharter,
  CPLLaw,
  CPLLawSet,
  GovernanceEngine,
  PHI_INV,
  PHI_INV_SQ,
  PHI_INV_CUBE,
};

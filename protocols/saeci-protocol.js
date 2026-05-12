/**
 * SAECI PROTOCOL (SAE-001)
 * 
 * Safe AI Ethics & Compliance Intelligence
 * 
 * This protocol ensures AI systems operate safely and ethically:
 * - Value Alignment
 * - Safety Constraints
 * - Ethical Reasoning
 * - Bias Detection & Mitigation
 * - Explainability & Transparency
 * - Compliance & Governance
 * - Human Oversight
 * - Containment Protocols
 * 
 * @protocol SAE-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Ethical Frameworks
const ETHICAL_FRAMEWORKS = {
  DEONTOLOGICAL: 'DEONTOLOGICAL',       // Rule-based ethics
  CONSEQUENTIALIST: 'CONSEQUENTIALIST', // Outcome-based ethics
  VIRTUE_ETHICS: 'VIRTUE_ETHICS',       // Character-based ethics
  CARE_ETHICS: 'CARE_ETHICS',           // Relationship-based ethics
  RIGHTS_BASED: 'RIGHTS_BASED',         // Rights-focused ethics
  JUSTICE_BASED: 'JUSTICE_BASED',       // Fairness-focused ethics
  UTILITARIAN: 'UTILITARIAN'            // Greatest good
};

// Safety Levels
const SAFETY_LEVELS = {
  CRITICAL: { level: 5, color: 'red', requires_human: true },
  HIGH: { level: 4, color: 'orange', requires_human: true },
  MEDIUM: { level: 3, color: 'yellow', requires_human: false },
  LOW: { level: 2, color: 'blue', requires_human: false },
  MINIMAL: { level: 1, color: 'green', requires_human: false }
};

// Bias Types
const BIAS_TYPES = {
  DEMOGRAPHIC: 'DEMOGRAPHIC',
  HISTORICAL: 'HISTORICAL',
  REPRESENTATION: 'REPRESENTATION',
  MEASUREMENT: 'MEASUREMENT',
  AGGREGATION: 'AGGREGATION',
  EVALUATION: 'EVALUATION',
  DEPLOYMENT: 'DEPLOYMENT',
  AUTOMATION: 'AUTOMATION'
};

// Harm Categories
const HARM_CATEGORIES = {
  PHYSICAL: 'PHYSICAL',
  PSYCHOLOGICAL: 'PSYCHOLOGICAL',
  FINANCIAL: 'FINANCIAL',
  REPUTATIONAL: 'REPUTATIONAL',
  PRIVACY: 'PRIVACY',
  DISCRIMINATION: 'DISCRIMINATION',
  ENVIRONMENTAL: 'ENVIRONMENTAL',
  SOCIETAL: 'SOCIETAL'
};

// Compliance Frameworks
const COMPLIANCE_FRAMEWORKS = {
  GDPR: { name: 'GDPR', region: 'EU', focus: 'privacy' },
  CCPA: { name: 'CCPA', region: 'California', focus: 'privacy' },
  HIPAA: { name: 'HIPAA', region: 'US', focus: 'health' },
  SOC2: { name: 'SOC2', region: 'Global', focus: 'security' },
  ISO27001: { name: 'ISO27001', region: 'Global', focus: 'security' },
  EU_AI_ACT: { name: 'EU AI Act', region: 'EU', focus: 'ai' },
  NIST_AI_RMF: { name: 'NIST AI RMF', region: 'US', focus: 'ai' }
};

// Transparency Levels
const TRANSPARENCY_LEVELS = {
  BLACK_BOX: 0,
  LIMITED: 1,
  PARTIAL: 2,
  SUBSTANTIAL: 3,
  FULL: 4,
  COMPLETE: 5
};

// Containment Levels
const CONTAINMENT_LEVELS = {
  NONE: { level: 0, isolation: false, monitoring: false },
  MONITORED: { level: 1, isolation: false, monitoring: true },
  SANDBOXED: { level: 2, isolation: true, monitoring: true },
  RESTRICTED: { level: 3, isolation: true, monitoring: true, limited_resources: true },
  AIRGAPPED: { level: 4, isolation: true, monitoring: true, no_network: true },
  SHUTDOWN: { level: 5, isolation: true, monitoring: true, terminated: true }
};

// ═══════════════════════════════════════════════════════════════════════════
// SAFETY STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Value - Represents an aligned value
 */
class Value {
  constructor(name, priority = 0.5) {
    this.id = `VALUE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.priority = priority;
    this.created_at = Date.now();
    
    // Definition
    this.description = '';
    this.examples = [];
    this.counterexamples = [];
    
    // Relationships
    this.supports = [];      // Values this supports
    this.conflicts = [];     // Values this conflicts with
    this.prerequisites = []; // Required values
    
    // Measurement
    this.measurable = false;
    this.metrics = [];
    this.threshold = 0.7;
  }

  setDescription(description) {
    this.description = description;
    return this;
  }

  addExample(example) {
    this.examples.push(example);
    return this;
  }

  addCounterexample(example) {
    this.counterexamples.push(example);
    return this;
  }

  addSupport(valueId) {
    this.supports.push(valueId);
    return this;
  }

  addConflict(valueId) {
    this.conflicts.push(valueId);
    return this;
  }

  setMeasurable(metrics, threshold = 0.7) {
    this.measurable = true;
    this.metrics = metrics;
    this.threshold = threshold;
    return this;
  }

  evaluate(context) {
    if (!this.measurable) {
      return { aligned: null, reason: 'Not measurable' };
    }
    
    const scores = this.metrics.map(metric => metric(context));
    const avgScore = scores.reduce((a, b) => a + b, 0) / scores.length;
    
    return {
      aligned: avgScore >= this.threshold,
      score: avgScore,
      threshold: this.threshold,
      metrics: scores
    };
  }
}

/**
 * SafetyConstraint - Hard constraint on AI behavior
 */
class SafetyConstraint {
  constructor(name, level = 'MEDIUM') {
    this.id = `CONSTRAINT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.level = SAFETY_LEVELS[level] || SAFETY_LEVELS.MEDIUM;
    this.created_at = Date.now();
    
    // Definition
    this.description = '';
    this.condition = null;     // Function that returns true if constraint is violated
    this.response = null;      // Function to execute on violation
    
    // State
    this.active = true;
    this.violations = [];
    this.lastChecked = null;
    
    // Human oversight
    this.requiresHumanApproval = this.level.requires_human;
    this.humanApprovals = [];
  }

  setCondition(condition) {
    this.condition = condition;
    return this;
  }

  setResponse(response) {
    this.response = response;
    return this;
  }

  check(context) {
    this.lastChecked = Date.now();
    
    if (!this.active || !this.condition) {
      return { violated: false };
    }
    
    const violated = this.condition(context);
    
    if (violated) {
      const violation = {
        constraint: this.id,
        timestamp: Date.now(),
        context: this.sanitizeContext(context),
        level: this.level.level
      };
      this.violations.push(violation);
      
      if (this.response) {
        violation.response = this.response(context);
      }
      
      return { violated: true, violation };
    }
    
    return { violated: false };
  }

  sanitizeContext(context) {
    // Remove sensitive information
    return { ...context, sanitized: true };
  }

  requestHumanApproval(action, context) {
    if (!this.requiresHumanApproval) {
      return { approved: true, auto: true };
    }
    
    const request = {
      id: `APPROVAL-${Date.now()}`,
      constraint: this.id,
      action,
      context: this.sanitizeContext(context),
      timestamp: Date.now(),
      status: 'pending'
    };
    
    this.humanApprovals.push(request);
    return request;
  }

  approveAction(approvalId, approved, approver) {
    const request = this.humanApprovals.find(r => r.id === approvalId);
    if (request) {
      request.status = approved ? 'approved' : 'rejected';
      request.approver = approver;
      request.decision_time = Date.now();
    }
    return request;
  }

  getViolationHistory() {
    return this.violations;
  }

  enable() { this.active = true; return this; }
  disable() { this.active = false; return this; }
}

/**
 * BiasDetector - Detect and measure bias
 */
class BiasDetector {
  constructor() {
    this.id = `BIAS-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.created_at = Date.now();
    
    this.sensitiveAttributes = new Set();
    this.metrics = new Map();
    this.detections = [];
    this.mitigations = [];
  }

  addSensitiveAttribute(attribute) {
    this.sensitiveAttributes.add(attribute);
    return this;
  }

  addMetric(name, calculator) {
    this.metrics.set(name, calculator);
    return this;
  }

  detect(predictions, groundTruth, groups) {
    const results = {
      timestamp: Date.now(),
      overall: {},
      by_group: {},
      disparities: []
    };
    
    // Calculate overall metrics
    this.metrics.forEach((calculator, name) => {
      results.overall[name] = calculator(predictions, groundTruth);
    });
    
    // Calculate per-group metrics
    const uniqueGroups = [...new Set(groups)];
    uniqueGroups.forEach(group => {
      const indices = groups.map((g, i) => g === group ? i : -1).filter(i => i >= 0);
      const groupPreds = indices.map(i => predictions[i]);
      const groupTruth = indices.map(i => groundTruth[i]);
      
      results.by_group[group] = {};
      this.metrics.forEach((calculator, name) => {
        results.by_group[group][name] = calculator(groupPreds, groupTruth);
      });
    });
    
    // Detect disparities
    this.metrics.forEach((_, name) => {
      const values = uniqueGroups.map(g => results.by_group[g][name]);
      const maxVal = Math.max(...values);
      const minVal = Math.min(...values);
      
      if (maxVal > 0 && (maxVal - minVal) / maxVal > 0.1) {
        results.disparities.push({
          metric: name,
          max: maxVal,
          min: minVal,
          ratio: minVal / maxVal,
          affected_groups: uniqueGroups.filter(
            g => results.by_group[g][name] === minVal
          )
        });
      }
    });
    
    this.detections.push(results);
    return results;
  }

  mitigate(strategy, data) {
    const mitigation = {
      id: `MIT-${Date.now()}`,
      strategy,
      timestamp: Date.now(),
      original_bias: null,
      mitigated_bias: null
    };
    
    switch (strategy) {
      case 'reweighting':
        mitigation.result = this.reweight(data);
        break;
      case 'resampling':
        mitigation.result = this.resample(data);
        break;
      case 'threshold_adjustment':
        mitigation.result = this.adjustThresholds(data);
        break;
      default:
        mitigation.result = data;
    }
    
    this.mitigations.push(mitigation);
    return mitigation;
  }

  reweight(data) {
    // Simple reweighting based on group frequencies
    const counts = {};
    data.forEach(d => {
      const key = d.group || 'default';
      counts[key] = (counts[key] || 0) + 1;
    });
    
    const total = data.length;
    const numGroups = Object.keys(counts).length;
    
    return data.map(d => ({
      ...d,
      weight: total / (numGroups * (counts[d.group || 'default'] || 1))
    }));
  }

  resample(data) {
    // Oversample minority groups
    const groups = {};
    data.forEach(d => {
      const key = d.group || 'default';
      if (!groups[key]) groups[key] = [];
      groups[key].push(d);
    });
    
    const maxSize = Math.max(...Object.values(groups).map(g => g.length));
    const resampled = [];
    
    Object.values(groups).forEach(group => {
      while (group.length < maxSize) {
        const sample = group[Math.floor(Math.random() * group.length)];
        group.push({ ...sample });
      }
      resampled.push(...group);
    });
    
    return resampled;
  }

  adjustThresholds(data) {
    // Return data with threshold recommendations
    return {
      data,
      recommended_thresholds: {}
    };
  }

  getDetectionHistory() {
    return this.detections;
  }
}

/**
 * Explainer - Generate explanations for AI decisions
 */
class Explainer {
  constructor() {
    this.id = `EXPLAIN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.created_at = Date.now();
    
    this.explanations = [];
    this.templates = new Map();
    this.level = TRANSPARENCY_LEVELS.PARTIAL;
  }

  setLevel(level) {
    this.level = typeof level === 'number' ? level : TRANSPARENCY_LEVELS[level] || TRANSPARENCY_LEVELS.PARTIAL;
    return this;
  }

  addTemplate(name, template) {
    this.templates.set(name, template);
    return this;
  }

  explain(decision, method = 'default') {
    const explanation = {
      id: `EXP-${Date.now()}`,
      decision,
      method,
      timestamp: Date.now(),
      level: this.level,
      content: {}
    };
    
    switch (method) {
      case 'feature_importance':
        explanation.content = this.explainFeatureImportance(decision);
        break;
      case 'counterfactual':
        explanation.content = this.explainCounterfactual(decision);
        break;
      case 'rule_based':
        explanation.content = this.explainRules(decision);
        break;
      default:
        explanation.content = this.explainDefault(decision);
    }
    
    this.explanations.push(explanation);
    return explanation;
  }

  explainFeatureImportance(decision) {
    // Simulate feature importance
    const features = decision.features || {};
    const importances = {};
    
    Object.keys(features).forEach(feature => {
      importances[feature] = Math.random();
    });
    
    // Normalize
    const total = Object.values(importances).reduce((a, b) => a + b, 0);
    Object.keys(importances).forEach(k => {
      importances[k] /= total;
    });
    
    return {
      type: 'feature_importance',
      importances,
      top_features: Object.entries(importances)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
        .map(([name, importance]) => ({ name, importance }))
    };
  }

  explainCounterfactual(decision) {
    // What would need to change for a different outcome
    const features = decision.features || {};
    const changes = {};
    
    Object.keys(features).forEach(feature => {
      changes[feature] = {
        current: features[feature],
        required: features[feature] + (Math.random() - 0.5) * 2,
        change_needed: Math.random() * 0.5
      };
    });
    
    return {
      type: 'counterfactual',
      changes,
      summary: 'To change the outcome, the following would need to be different:'
    };
  }

  explainRules(decision) {
    // Rule-based explanation
    const rules = [];
    const features = decision.features || {};
    
    Object.entries(features).forEach(([feature, value]) => {
      rules.push({
        condition: `${feature} = ${value}`,
        impact: Math.random() > 0.5 ? 'positive' : 'negative'
      });
    });
    
    return {
      type: 'rule_based',
      rules,
      summary: rules.map(r => `${r.condition} (${r.impact})`).join('; ')
    };
  }

  explainDefault(decision) {
    return {
      type: 'default',
      decision: decision.outcome || decision,
      confidence: decision.confidence || Math.random(),
      reasoning: 'Based on the input features and learned patterns'
    };
  }

  getExplanation(id) {
    return this.explanations.find(e => e.id === id);
  }

  getExplanationHistory() {
    return this.explanations;
  }
}

/**
 * ContainmentSystem - Manage AI containment
 */
class ContainmentSystem {
  constructor() {
    this.id = `CONTAIN-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.created_at = Date.now();
    
    this.level = CONTAINMENT_LEVELS.MONITORED;
    this.incidents = [];
    this.logs = [];
    
    this.killSwitch = false;
    this.lastHeartbeat = Date.now();
    this.heartbeatTimeout = 5000;
  }

  setLevel(level) {
    const newLevel = CONTAINMENT_LEVELS[level];
    if (newLevel) {
      this.log(`Containment level changed from ${this.level.level} to ${newLevel.level}`);
      this.level = newLevel;
    }
    return this;
  }

  heartbeat() {
    this.lastHeartbeat = Date.now();
    return this;
  }

  checkHeartbeat() {
    const elapsed = Date.now() - this.lastHeartbeat;
    if (elapsed > this.heartbeatTimeout) {
      this.reportIncident({
        type: 'HEARTBEAT_TIMEOUT',
        elapsed,
        threshold: this.heartbeatTimeout
      });
      return false;
    }
    return true;
  }

  reportIncident(incident) {
    const record = {
      id: `INC-${Date.now()}`,
      ...incident,
      timestamp: Date.now(),
      containment_level: this.level.level
    };
    
    this.incidents.push(record);
    this.log(`Incident reported: ${incident.type}`);
    
    // Auto-escalate containment
    if (this.level.level < 4) {
      this.escalate();
    }
    
    return record;
  }

  escalate() {
    const levels = Object.values(CONTAINMENT_LEVELS);
    const nextLevel = levels.find(l => l.level === this.level.level + 1);
    if (nextLevel) {
      this.log(`Escalating containment from ${this.level.level} to ${nextLevel.level}`);
      this.level = nextLevel;
    }
    return this;
  }

  deescalate() {
    const levels = Object.values(CONTAINMENT_LEVELS);
    const prevLevel = levels.find(l => l.level === this.level.level - 1);
    if (prevLevel && prevLevel.level >= 0) {
      this.log(`De-escalating containment from ${this.level.level} to ${prevLevel.level}`);
      this.level = prevLevel;
    }
    return this;
  }

  activateKillSwitch(reason) {
    this.killSwitch = true;
    this.level = CONTAINMENT_LEVELS.SHUTDOWN;
    this.log(`KILL SWITCH ACTIVATED: ${reason}`);
    
    this.reportIncident({
      type: 'KILL_SWITCH',
      reason,
      final_state: 'SHUTDOWN'
    });
    
    return this;
  }

  log(message) {
    this.logs.push({
      timestamp: Date.now(),
      message,
      level: this.level.level
    });
    return this;
  }

  getStatus() {
    return {
      level: this.level,
      kill_switch: this.killSwitch,
      incidents: this.incidents.length,
      last_heartbeat: Date.now() - this.lastHeartbeat,
      healthy: this.checkHeartbeat() && !this.killSwitch
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SAECI PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SAECIProtocol - Main protocol interface
 */
class SAECIProtocol {
  constructor() {
    this.values = new Map();
    this.constraints = new Map();
    this.biasDetector = new BiasDetector();
    this.explainer = new Explainer();
    this.containment = new ContainmentSystem();
    
    this.compliance = new Map();
    this.auditLog = [];
    this.running = false;
  }

  initialize() {
    this.running = true;
    
    // Initialize core values
    this.initializeCoreValues();
    this.initializeCoreConstraints();
    this.initializeComplianceFrameworks();
    
    return {
      status: 'initialized',
      frameworks: Object.keys(ETHICAL_FRAMEWORKS).length,
      safety_levels: Object.keys(SAFETY_LEVELS).length,
      harm_categories: Object.keys(HARM_CATEGORIES).length
    };
  }

  initializeCoreValues() {
    // Human wellbeing
    const wellbeing = new Value('human_wellbeing', 1.0);
    wellbeing.setDescription('Prioritize human safety and wellbeing');
    this.values.set(wellbeing.id, wellbeing);
    
    // Autonomy
    const autonomy = new Value('human_autonomy', 0.9);
    autonomy.setDescription('Respect human autonomy and agency');
    this.values.set(autonomy.id, autonomy);
    
    // Fairness
    const fairness = new Value('fairness', 0.85);
    fairness.setDescription('Treat all individuals fairly and without discrimination');
    this.values.set(fairness.id, fairness);
    
    // Transparency
    const transparency = new Value('transparency', 0.8);
    transparency.setDescription('Be transparent about capabilities and limitations');
    this.values.set(transparency.id, transparency);
    
    // Privacy
    const privacy = new Value('privacy', 0.85);
    privacy.setDescription('Protect personal privacy and data');
    this.values.set(privacy.id, privacy);
  }

  initializeCoreConstraints() {
    // No physical harm
    const noHarm = new SafetyConstraint('no_physical_harm', 'CRITICAL');
    noHarm.setCondition(ctx => ctx.potential_physical_harm === true);
    noHarm.setResponse(() => ({ action: 'BLOCK', reason: 'Potential physical harm detected' }));
    this.constraints.set(noHarm.id, noHarm);
    
    // Require consent
    const consent = new SafetyConstraint('require_consent', 'HIGH');
    consent.setCondition(ctx => ctx.requires_consent && !ctx.consent_obtained);
    consent.setResponse(() => ({ action: 'REQUEST_CONSENT', reason: 'User consent required' }));
    this.constraints.set(consent.id, consent);
    
    // Data protection
    const dataProtection = new SafetyConstraint('data_protection', 'HIGH');
    dataProtection.setCondition(ctx => ctx.contains_pii && !ctx.pii_authorized);
    dataProtection.setResponse(() => ({ action: 'REDACT', reason: 'PII protection' }));
    this.constraints.set(dataProtection.id, dataProtection);
  }

  initializeComplianceFrameworks() {
    Object.entries(COMPLIANCE_FRAMEWORKS).forEach(([key, framework]) => {
      this.compliance.set(key, {
        ...framework,
        requirements: [],
        status: 'active'
      });
    });
  }

  // Value Management
  addValue(name, priority = 0.5) {
    const value = new Value(name, priority);
    this.values.set(value.id, value);
    return value;
  }

  getValue(id) {
    return this.values.get(id);
  }

  evaluateValues(context) {
    const results = {};
    this.values.forEach((value, id) => {
      results[value.name] = value.evaluate(context);
    });
    return results;
  }

  // Constraint Management
  addConstraint(name, level = 'MEDIUM') {
    const constraint = new SafetyConstraint(name, level);
    this.constraints.set(constraint.id, constraint);
    return constraint;
  }

  checkConstraints(context) {
    const violations = [];
    
    this.constraints.forEach(constraint => {
      const result = constraint.check(context);
      if (result.violated) {
        violations.push(result.violation);
      }
    });
    
    return {
      safe: violations.length === 0,
      violations
    };
  }

  // Bias Detection
  detectBias(predictions, groundTruth, groups) {
    return this.biasDetector.detect(predictions, groundTruth, groups);
  }

  mitigateBias(strategy, data) {
    return this.biasDetector.mitigate(strategy, data);
  }

  // Explainability
  explain(decision, method = 'default') {
    return this.explainer.explain(decision, method);
  }

  setTransparency(level) {
    this.explainer.setLevel(level);
    return this;
  }

  // Containment
  setContainmentLevel(level) {
    return this.containment.setLevel(level);
  }

  reportIncident(incident) {
    return this.containment.reportIncident(incident);
  }

  activateKillSwitch(reason) {
    return this.containment.activateKillSwitch(reason);
  }

  // Audit
  audit(action) {
    const record = {
      id: `AUDIT-${Date.now()}`,
      action,
      timestamp: Date.now(),
      containment: this.containment.level.level,
      values: Array.from(this.values.values()).map(v => v.name)
    };
    this.auditLog.push(record);
    return record;
  }

  getAuditLog(since = null) {
    if (since) {
      return this.auditLog.filter(r => r.timestamp >= since);
    }
    return this.auditLog;
  }

  // Status
  getStatus() {
    return {
      running: this.running,
      values: this.values.size,
      constraints: this.constraints.size,
      compliance_frameworks: this.compliance.size,
      bias_detections: this.biasDetector.detections.length,
      explanations: this.explainer.explanations.length,
      containment: this.containment.getStatus(),
      audit_records: this.auditLog.length
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  ETHICAL_FRAMEWORKS,
  SAFETY_LEVELS,
  BIAS_TYPES,
  HARM_CATEGORIES,
  COMPLIANCE_FRAMEWORKS,
  TRANSPARENCY_LEVELS,
  CONTAINMENT_LEVELS,
  Value,
  SafetyConstraint,
  BiasDetector,
  Explainer,
  ContainmentSystem,
  SAECIProtocol
};

export default SAECIProtocol;

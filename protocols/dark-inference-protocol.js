/**
 * Dark Inference Protocol (DRK-014)
 * 
 * Inference engine for the dark layer. Silent reasoning
 * and decision making without observable traces.
 * 
 * Protocol ID: DRK-014
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Inference types
 */
export const INFERENCE_TYPES = {
  DEDUCTIVE: 'deductive',
  INDUCTIVE: 'inductive',
  ABDUCTIVE: 'abductive',
  PROBABILISTIC: 'probabilistic'
};

/**
 * Evidence types
 */
export const EVIDENCE_TYPES = {
  DIRECT: 'direct',
  CIRCUMSTANTIAL: 'circumstantial',
  PATTERN: 'pattern',
  STATISTICAL: 'statistical'
};

/**
 * Inference Rule
 */
export class InferenceRule {
  constructor(id, premises, conclusion, config = {}) {
    this.id = id;
    this.premises = premises;
    this.conclusion = conclusion;
    this.confidence = config.confidence || 1;
    this.weight = config.weight || 1;
    this.type = config.type || INFERENCE_TYPES.DEDUCTIVE;
    this.applications = 0;
  }
  
  /**
   * Check if rule can fire
   */
  canFire(facts) {
    return this.premises.every(p => this.checkPremise(p, facts));
  }
  
  checkPremise(premise, facts) {
    if (typeof premise === 'function') {
      return premise(facts);
    }
    if (typeof premise === 'string') {
      return facts.has(premise) || facts[premise] !== undefined;
    }
    return false;
  }
  
  /**
   * Fire rule and produce conclusion
   */
  fire(facts) {
    if (!this.canFire(facts)) return null;
    
    this.applications++;
    
    let conclusionValue = this.conclusion;
    if (typeof this.conclusion === 'function') {
      conclusionValue = this.conclusion(facts);
    }
    
    return {
      ruleId: this.id,
      conclusion: conclusionValue,
      confidence: this.confidence,
      weight: this.weight
    };
  }
}

/**
 * Belief
 */
export class Belief {
  constructor(proposition, probability, evidence = []) {
    this.proposition = proposition;
    this.probability = probability;
    this.evidence = evidence;
    this.created = Date.now();
    this.updated = Date.now();
  }
  
  /**
   * Update belief with new evidence
   */
  updateWithEvidence(likelihood, priorLikelihood = 0.5) {
    // Bayesian update
    const prior = this.probability;
    const posterior = (likelihood * prior) / 
      (likelihood * prior + priorLikelihood * (1 - prior));
    
    this.probability = posterior;
    this.updated = Date.now();
    
    return posterior;
  }
  
  /**
   * Combine with another belief
   */
  combine(other, method = 'dempster') {
    if (method === 'dempster') {
      // Dempster-Shafer combination
      const k = this.probability * (1 - other.probability) + 
                (1 - this.probability) * other.probability;
      
      if (k === 1) return this.probability;
      
      return (this.probability * other.probability) / (1 - k);
    }
    
    // Simple average
    return (this.probability + other.probability) / 2;
  }
}

/**
 * Dark Inference Engine
 */
export class DarkInferenceEngine {
  constructor(config = {}) {
    this.config = {
      maxIterations: config.maxIterations || 100,
      minConfidence: config.minConfidence || THRESHOLD,
      ...config
    };
    
    this.rules = new Map();
    this.facts = new Map();
    this.beliefs = new Map();
    this.inferences = [];
    
    this.stats = {
      inferences: 0,
      rulesApplied: 0,
      factsAdded: 0
    };
  }
  
  /**
   * Add inference rule
   */
  addRule(rule) {
    if (!(rule instanceof InferenceRule)) {
      rule = new InferenceRule(
        rule.id,
        rule.premises,
        rule.conclusion,
        rule
      );
    }
    
    this.rules.set(rule.id, rule);
    return this;
  }
  
  /**
   * Add fact
   */
  addFact(key, value = true) {
    this.facts.set(key, value);
    this.stats.factsAdded++;
    return this;
  }
  
  /**
   * Add belief
   */
  addBelief(proposition, probability, evidence = []) {
    const belief = new Belief(proposition, probability, evidence);
    this.beliefs.set(proposition, belief);
    return belief;
  }
  
  /**
   * Get belief probability
   */
  getBeliefProbability(proposition) {
    const belief = this.beliefs.get(proposition);
    return belief ? belief.probability : 0;
  }
  
  /**
   * Forward chain inference
   */
  forwardChain() {
    let iteration = 0;
    let newFacts = true;
    const derived = [];
    
    while (newFacts && iteration < this.config.maxIterations) {
      newFacts = false;
      iteration++;
      
      for (const rule of this.rules.values()) {
        const result = rule.fire(this.facts);
        
        if (result && result.confidence >= this.config.minConfidence) {
          const conclusionKey = typeof result.conclusion === 'string' 
            ? result.conclusion 
            : JSON.stringify(result.conclusion);
          
          if (!this.facts.has(conclusionKey)) {
            this.facts.set(conclusionKey, result.conclusion);
            derived.push(result);
            newFacts = true;
            this.stats.rulesApplied++;
          }
        }
      }
    }
    
    this.stats.inferences++;
    
    return {
      iterations: iteration,
      derived,
      totalFacts: this.facts.size
    };
  }
  
  /**
   * Backward chain inference (goal-directed)
   */
  backwardChain(goal) {
    const visited = new Set();
    const path = [];
    
    const prove = (subgoal) => {
      if (visited.has(subgoal)) return false;
      visited.add(subgoal);
      
      // Check if already a fact
      if (this.facts.has(subgoal)) {
        path.push({ type: 'fact', value: subgoal });
        return true;
      }
      
      // Try to find a rule that concludes this
      for (const rule of this.rules.values()) {
        if (this.conclusionMatches(rule.conclusion, subgoal)) {
          // Try to prove all premises
          const premisesProved = rule.premises.every(p => {
            if (typeof p === 'string') {
              return prove(p);
            }
            return this.facts.has(p) || p(this.facts);
          });
          
          if (premisesProved) {
            path.push({ type: 'rule', ruleId: rule.id, conclusion: subgoal });
            this.stats.rulesApplied++;
            return true;
          }
        }
      }
      
      return false;
    };
    
    const proved = prove(goal);
    this.stats.inferences++;
    
    return {
      goal,
      proved,
      path
    };
  }
  
  conclusionMatches(conclusion, goal) {
    if (typeof conclusion === 'string') {
      return conclusion === goal;
    }
    return JSON.stringify(conclusion) === goal;
  }
  
  /**
   * Probabilistic inference
   */
  probabilisticInference(hypothesis, evidence) {
    let belief = this.beliefs.get(hypothesis);
    
    if (!belief) {
      belief = this.addBelief(hypothesis, 0.5);
    }
    
    // Update with each piece of evidence
    for (const e of evidence) {
      belief.updateWithEvidence(e.likelihood, e.priorLikelihood);
      belief.evidence.push(e);
    }
    
    return {
      hypothesis,
      probability: belief.probability,
      evidenceCount: belief.evidence.length
    };
  }
  
  /**
   * Abductive inference (best explanation)
   */
  abductiveInference(observations) {
    const explanations = [];
    
    for (const rule of this.rules.values()) {
      // Check if this rule's conclusion matches observations
      const matches = observations.filter(obs => 
        this.conclusionMatches(rule.conclusion, obs)
      ).length;
      
      if (matches > 0) {
        explanations.push({
          ruleId: rule.id,
          premises: rule.premises,
          coverage: matches / observations.length,
          confidence: rule.confidence * (matches / observations.length)
        });
      }
    }
    
    // Sort by confidence
    explanations.sort((a, b) => b.confidence - a.confidence);
    
    return explanations;
  }
  
  /**
   * Clear all state
   */
  clear() {
    this.facts.clear();
    this.beliefs.clear();
    this.inferences = [];
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      rules: this.rules.size,
      facts: this.facts.size,
      beliefs: this.beliefs.size
    };
  }
}

/**
 * Dark Inference Protocol
 */
export const DarkInferenceProtocol = {
  id: 'DRK-014',
  name: 'Dark Inference Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  inferenceTypes: INFERENCE_TYPES,
  evidenceTypes: EVIDENCE_TYPES,
  
  createRule: (id, premises, conclusion, config) => new InferenceRule(id, premises, conclusion, config),
  createBelief: (proposition, probability, evidence) => new Belief(proposition, probability, evidence),
  createEngine: (config) => new DarkInferenceEngine(config)
};

export default DarkInferenceProtocol;

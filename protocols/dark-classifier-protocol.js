/**
 * Dark Classifier Protocol (DRK-011)
 * 
 * Pattern classification engine for the dark layer.
 * Identifies threat patterns, agent types, and behavioral signatures.
 * 
 * Protocol ID: DRK-011
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Classification categories
 */
export const CLASSIFICATION_CATEGORIES = {
  AGENT_TYPE: 'agent-type',
  THREAT_LEVEL: 'threat-level',
  BEHAVIOR_PATTERN: 'behavior-pattern',
  INTENT: 'intent',
  ORIGIN: 'origin'
};

/**
 * Agent classifications
 */
export const AGENT_CLASSIFICATIONS = {
  HUMAN: 'human',
  BOT: 'bot',
  CRAWLER: 'crawler',
  SCANNER: 'scanner',
  MALICIOUS: 'malicious',
  UNKNOWN: 'unknown'
};

/**
 * Threat levels
 */
export const THREAT_LEVELS = {
  NONE: 0,
  LOW: 1,
  MEDIUM: 2,
  HIGH: 3,
  CRITICAL: 4
};

/**
 * Feature Vector
 */
export class FeatureVector {
  constructor(features = {}) {
    this.features = new Map(Object.entries(features));
    this.phi = this.computePhi();
  }
  
  set(name, value) {
    this.features.set(name, value);
    this.phi = this.computePhi();
  }
  
  get(name) {
    return this.features.get(name);
  }
  
  computePhi() {
    let sum = 0;
    let i = 0;
    for (const value of this.features.values()) {
      const numVal = typeof value === 'number' ? value : 
                     typeof value === 'boolean' ? (value ? 1 : 0) : 0;
      sum += numVal * Math.pow(PHI, i % 8);
      i++;
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Compute distance to another vector
   */
  distance(other) {
    let sumSq = 0;
    const allKeys = new Set([...this.features.keys(), ...other.features.keys()]);
    
    for (const key of allKeys) {
      const v1 = this.features.get(key) || 0;
      const v2 = other.features.get(key) || 0;
      
      const n1 = typeof v1 === 'number' ? v1 : (v1 ? 1 : 0);
      const n2 = typeof v2 === 'number' ? v2 : (v2 ? 1 : 0);
      
      sumSq += Math.pow(n1 - n2, 2);
    }
    
    return Math.sqrt(sumSq);
  }
  
  /**
   * Normalize to unit vector
   */
  normalize() {
    let magnitude = 0;
    for (const value of this.features.values()) {
      const numVal = typeof value === 'number' ? value : (value ? 1 : 0);
      magnitude += numVal * numVal;
    }
    magnitude = Math.sqrt(magnitude);
    
    if (magnitude > 0) {
      for (const [key, value] of this.features) {
        if (typeof value === 'number') {
          this.features.set(key, value / magnitude);
        }
      }
    }
    
    return this;
  }
  
  toObject() {
    return Object.fromEntries(this.features);
  }
}

/**
 * Classification Rule
 */
export class ClassificationRule {
  constructor(name, category, conditions, output, weight = 1) {
    this.name = name;
    this.category = category;
    this.conditions = conditions;
    this.output = output;
    this.weight = weight;
    this.hits = 0;
  }
  
  /**
   * Evaluate rule against feature vector
   */
  evaluate(vector) {
    for (const [feature, condition] of Object.entries(this.conditions)) {
      const value = vector.get(feature);
      
      if (!this.checkCondition(value, condition)) {
        return { match: false };
      }
    }
    
    this.hits++;
    return { match: true, output: this.output, weight: this.weight };
  }
  
  /**
   * Check single condition
   */
  checkCondition(value, condition) {
    if (typeof condition === 'function') {
      return condition(value);
    }
    
    if (typeof condition === 'object') {
      if (condition.gt !== undefined && value <= condition.gt) return false;
      if (condition.gte !== undefined && value < condition.gte) return false;
      if (condition.lt !== undefined && value >= condition.lt) return false;
      if (condition.lte !== undefined && value > condition.lte) return false;
      if (condition.eq !== undefined && value !== condition.eq) return false;
      if (condition.ne !== undefined && value === condition.ne) return false;
      if (condition.in !== undefined && !condition.in.includes(value)) return false;
      if (condition.regex !== undefined && !new RegExp(condition.regex).test(value)) return false;
      return true;
    }
    
    return value === condition;
  }
}

/**
 * Dark Classifier
 */
export class DarkClassifier {
  constructor(config = {}) {
    this.config = {
      defaultThreshold: config.defaultThreshold || THRESHOLD,
      ...config
    };
    
    this.rules = new Map();
    this.models = new Map();
    this.history = [];
    
    this.stats = {
      classifications: 0,
      byCategory: {},
      byOutput: {}
    };
    
    // Initialize default rules
    this.initializeDefaultRules();
  }
  
  /**
   * Initialize default classification rules
   */
  initializeDefaultRules() {
    // Bot detection rules
    this.addRule(new ClassificationRule(
      'no-js-support',
      CLASSIFICATION_CATEGORIES.AGENT_TYPE,
      { jsEnabled: false },
      AGENT_CLASSIFICATIONS.BOT,
      0.7
    ));
    
    this.addRule(new ClassificationRule(
      'rapid-requests',
      CLASSIFICATION_CATEGORIES.BEHAVIOR_PATTERN,
      { requestsPerMinute: { gt: 60 } },
      'automated',
      0.8
    ));
    
    this.addRule(new ClassificationRule(
      'known-scanner-ua',
      CLASSIFICATION_CATEGORIES.AGENT_TYPE,
      { userAgent: { regex: /(nmap|nikto|sqlmap|burp)/i } },
      AGENT_CLASSIFICATIONS.SCANNER,
      0.95
    ));
  }
  
  /**
   * Add classification rule
   */
  addRule(rule) {
    if (!this.rules.has(rule.category)) {
      this.rules.set(rule.category, []);
    }
    this.rules.get(rule.category).push(rule);
    return this;
  }
  
  /**
   * Classify feature vector
   */
  classify(vector, categories = null) {
    if (!(vector instanceof FeatureVector)) {
      vector = new FeatureVector(vector);
    }
    
    const results = {};
    const categoriesToCheck = categories || [...this.rules.keys()];
    
    for (const category of categoriesToCheck) {
      const categoryRules = this.rules.get(category) || [];
      const matches = [];
      
      for (const rule of categoryRules) {
        const result = rule.evaluate(vector);
        if (result.match) {
          matches.push(result);
        }
      }
      
      if (matches.length > 0) {
        // Weighted voting
        const votes = new Map();
        let totalWeight = 0;
        
        for (const match of matches) {
          const current = votes.get(match.output) || 0;
          votes.set(match.output, current + match.weight);
          totalWeight += match.weight;
        }
        
        // Find winner
        let winner = null;
        let maxVotes = 0;
        
        for (const [output, weight] of votes) {
          if (weight > maxVotes) {
            maxVotes = weight;
            winner = output;
          }
        }
        
        results[category] = {
          classification: winner,
          confidence: totalWeight > 0 ? maxVotes / totalWeight : 0,
          matches: matches.length
        };
      }
    }
    
    // Update stats
    this.stats.classifications++;
    for (const [category, result] of Object.entries(results)) {
      this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
      this.stats.byOutput[result.classification] = (this.stats.byOutput[result.classification] || 0) + 1;
    }
    
    // Record history
    this.history.push({
      timestamp: Date.now(),
      phi: vector.phi,
      results
    });
    
    while (this.history.length > 1000) {
      this.history.shift();
    }
    
    return results;
  }
  
  /**
   * Classify threat level
   */
  classifyThreat(features) {
    const vector = features instanceof FeatureVector ? features : new FeatureVector(features);
    
    let threatScore = 0;
    
    // Factor in various signals
    if (vector.get('knownMaliciousIP')) threatScore += 3;
    if (vector.get('suspiciousUserAgent')) threatScore += 1;
    if (vector.get('rapidRequests')) threatScore += 1;
    if (vector.get('sqlInjectionAttempt')) threatScore += 3;
    if (vector.get('xssAttempt')) threatScore += 2;
    if (vector.get('pathTraversal')) threatScore += 2;
    if (vector.get('unusualPort')) threatScore += 0.5;
    
    // Map to threat level
    if (threatScore >= 4) return THREAT_LEVELS.CRITICAL;
    if (threatScore >= 3) return THREAT_LEVELS.HIGH;
    if (threatScore >= 2) return THREAT_LEVELS.MEDIUM;
    if (threatScore >= 1) return THREAT_LEVELS.LOW;
    return THREAT_LEVELS.NONE;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      rulesCount: [...this.rules.values()].reduce((sum, arr) => sum + arr.length, 0),
      historySize: this.history.length
    };
  }
}

/**
 * Dark Classifier Protocol
 */
export const DarkClassifierProtocol = {
  id: 'DRK-011',
  name: 'Dark Classifier Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  categories: CLASSIFICATION_CATEGORIES,
  agentTypes: AGENT_CLASSIFICATIONS,
  threatLevels: THREAT_LEVELS,
  
  createVector: (features) => new FeatureVector(features),
  createRule: (name, category, conditions, output, weight) => 
    new ClassificationRule(name, category, conditions, output, weight),
  createClassifier: (config) => new DarkClassifier(config)
};

export default DarkClassifierProtocol;

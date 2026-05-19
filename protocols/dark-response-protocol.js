/**
 * Dark Response Protocol (DRK-017)
 * 
 * Automated response generation for the dark layer.
 * Silent defensive actions and countermeasures.
 * 
 * Protocol ID: DRK-017
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Response types
 */
export const RESPONSE_TYPES = {
  BLOCK: 'block',
  RATE_LIMIT: 'rate-limit',
  CHALLENGE: 'challenge',
  DECEIVE: 'deceive',
  MONITOR: 'monitor',
  ALLOW: 'allow'
};

/**
 * Response actions
 */
export const RESPONSE_ACTIONS = {
  REJECT: 'reject',
  DELAY: 'delay',
  REDIRECT: 'redirect',
  TARPIT: 'tarpit',
  HONEYPOT: 'honeypot',
  CAPTCHA: 'captcha',
  THROTTLE: 'throttle',
  LOG: 'log',
  PASS: 'pass'
};

/**
 * Response Rule
 */
export class ResponseRule {
  constructor(id, conditions, action, config = {}) {
    this.id = id;
    this.conditions = conditions;
    this.action = action;
    this.priority = config.priority || 50;
    this.enabled = config.enabled !== false;
    this.hits = 0;
    this.lastHit = null;
  }
  
  /**
   * Evaluate conditions
   */
  evaluate(context) {
    if (!this.enabled) return false;
    
    for (const [key, condition] of Object.entries(this.conditions)) {
      const value = context[key];
      
      if (!this.checkCondition(value, condition)) {
        return false;
      }
    }
    
    this.hits++;
    this.lastHit = Date.now();
    
    return true;
  }
  
  checkCondition(value, condition) {
    if (typeof condition === 'function') return condition(value);
    if (condition === undefined) return true;
    
    if (typeof condition === 'object') {
      if (condition.eq !== undefined && value !== condition.eq) return false;
      if (condition.ne !== undefined && value === condition.ne) return false;
      if (condition.gt !== undefined && value <= condition.gt) return false;
      if (condition.gte !== undefined && value < condition.gte) return false;
      if (condition.lt !== undefined && value >= condition.lt) return false;
      if (condition.lte !== undefined && value > condition.lte) return false;
      if (condition.in !== undefined && !condition.in.includes(value)) return false;
      if (condition.notIn !== undefined && condition.notIn.includes(value)) return false;
      if (condition.matches !== undefined && !new RegExp(condition.matches).test(value)) return false;
      return true;
    }
    
    return value === condition;
  }
  
  /**
   * Get response
   */
  getResponse() {
    return {
      ruleId: this.id,
      action: this.action,
      timestamp: Date.now()
    };
  }
}

/**
 * Response Generator
 */
export class ResponseGenerator {
  constructor(config = {}) {
    this.config = {
      defaultAction: config.defaultAction || RESPONSE_ACTIONS.PASS,
      maxRules: config.maxRules || 1000,
      ...config
    };
    
    this.rules = [];
    this.stats = {
      evaluations: 0,
      matches: 0,
      byAction: {}
    };
  }
  
  /**
   * Add rule
   */
  addRule(rule) {
    if (!(rule instanceof ResponseRule)) {
      rule = new ResponseRule(
        rule.id || `rule-${Date.now()}`,
        rule.conditions,
        rule.action,
        rule
      );
    }
    
    this.rules.push(rule);
    this.rules.sort((a, b) => a.priority - b.priority);
    
    while (this.rules.length > this.config.maxRules) {
      this.rules.pop();
    }
    
    return rule;
  }
  
  /**
   * Remove rule
   */
  removeRule(ruleId) {
    const idx = this.rules.findIndex(r => r.id === ruleId);
    if (idx >= 0) {
      this.rules.splice(idx, 1);
      return true;
    }
    return false;
  }
  
  /**
   * Generate response for context
   */
  generate(context) {
    this.stats.evaluations++;
    
    for (const rule of this.rules) {
      if (rule.evaluate(context)) {
        const response = rule.getResponse();
        
        this.stats.matches++;
        this.stats.byAction[response.action] = (this.stats.byAction[response.action] || 0) + 1;
        
        return this.buildResponse(response, context);
      }
    }
    
    // Default response
    return this.buildResponse({
      action: this.config.defaultAction,
      timestamp: Date.now()
    }, context);
  }
  
  /**
   * Build complete response
   */
  buildResponse(response, context) {
    const built = {
      ...response,
      context: {
        ip: context.ip,
        timestamp: Date.now()
      }
    };
    
    switch (response.action) {
      case RESPONSE_ACTIONS.DELAY:
        built.delay = Math.floor(HB * PHI);
        break;
        
      case RESPONSE_ACTIONS.THROTTLE:
        built.maxRequests = 10;
        built.window = HB * 60;
        break;
        
      case RESPONSE_ACTIONS.TARPIT:
        built.delay = HB * PHI * PHI;
        built.incremental = true;
        break;
        
      case RESPONSE_ACTIONS.REDIRECT:
        built.target = '/honeypot';
        break;
        
      case RESPONSE_ACTIONS.CAPTCHA:
        built.challengeType = 'interactive';
        break;
    }
    
    return built;
  }
  
  /**
   * Get rules
   */
  getRules() {
    return this.rules.map(r => ({
      id: r.id,
      action: r.action,
      priority: r.priority,
      enabled: r.enabled,
      hits: r.hits
    }));
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      rulesCount: this.rules.length,
      matchRate: this.stats.evaluations > 0
        ? (this.stats.matches / this.stats.evaluations * 100).toFixed(1) + '%'
        : 'N/A'
    };
  }
}

/**
 * Adaptive Response Engine
 */
export class AdaptiveResponseEngine {
  constructor(config = {}) {
    this.generator = new ResponseGenerator(config);
    this.threatLevels = new Map();
    this.adaptiveThreshold = config.adaptiveThreshold || THRESHOLD;
    
    this.initializeDefaultRules();
  }
  
  /**
   * Initialize default rules
   */
  initializeDefaultRules() {
    // Block known bad IPs
    this.generator.addRule({
      id: 'block-blacklist',
      conditions: { blacklisted: true },
      action: RESPONSE_ACTIONS.REJECT,
      priority: 1
    });
    
    // Rate limit aggressive requests
    this.generator.addRule({
      id: 'ratelimit-aggressive',
      conditions: { requestsPerMinute: { gt: 100 } },
      action: RESPONSE_ACTIONS.THROTTLE,
      priority: 10
    });
    
    // Challenge suspicious traffic
    this.generator.addRule({
      id: 'challenge-suspicious',
      conditions: { suspicionScore: { gt: 0.7 } },
      action: RESPONSE_ACTIONS.CAPTCHA,
      priority: 20
    });
    
    // Tarpit scanners
    this.generator.addRule({
      id: 'tarpit-scanner',
      conditions: { isScanner: true },
      action: RESPONSE_ACTIONS.TARPIT,
      priority: 15
    });
    
    // Honeypot for bots
    this.generator.addRule({
      id: 'honeypot-bot',
      conditions: { isBot: true, threatLevel: { gt: 0.5 } },
      action: RESPONSE_ACTIONS.REDIRECT,
      priority: 25
    });
  }
  
  /**
   * Update threat level for entity
   */
  updateThreatLevel(entityId, level) {
    this.threatLevels.set(entityId, {
      level,
      updated: Date.now()
    });
  }
  
  /**
   * Get response with adaptation
   */
  respond(context) {
    // Enrich context with threat level
    const threatData = this.threatLevels.get(context.entityId || context.ip);
    if (threatData) {
      context.threatLevel = threatData.level;
    }
    
    // Generate base response
    const response = this.generator.generate(context);
    
    // Adapt based on threat level
    if (context.threatLevel && context.threatLevel > this.adaptiveThreshold) {
      response.adapted = true;
      response.threatLevel = context.threatLevel;
      
      // Escalate response
      if (response.action === RESPONSE_ACTIONS.PASS) {
        response.action = RESPONSE_ACTIONS.LOG;
      } else if (response.action === RESPONSE_ACTIONS.THROTTLE) {
        response.action = RESPONSE_ACTIONS.DELAY;
        response.delay = HB * context.threatLevel;
      }
    }
    
    return response;
  }
  
  /**
   * Learn from feedback
   */
  learn(context, feedback) {
    const entityId = context.entityId || context.ip;
    const current = this.threatLevels.get(entityId);
    const currentLevel = current?.level || 0.5;
    
    // Adjust threat level based on feedback
    let adjustment = 0;
    if (feedback.wasAttack) {
      adjustment = 0.2;
    } else if (feedback.wasFalsePositive) {
      adjustment = -0.1;
    } else if (feedback.wasLegitimate) {
      adjustment = -0.05;
    }
    
    const newLevel = Math.max(0, Math.min(1, currentLevel + adjustment));
    this.updateThreatLevel(entityId, newLevel);
    
    return { entityId, oldLevel: currentLevel, newLevel };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.generator.getStats(),
      trackedEntities: this.threatLevels.size
    };
  }
}

/**
 * Dark Response Protocol
 */
export const DarkResponseProtocol = {
  id: 'DRK-017',
  name: 'Dark Response Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  types: RESPONSE_TYPES,
  actions: RESPONSE_ACTIONS,
  
  createRule: (id, conditions, action, config) => new ResponseRule(id, conditions, action, config),
  createGenerator: (config) => new ResponseGenerator(config),
  createAdaptiveEngine: (config) => new AdaptiveResponseEngine(config)
};

export default DarkResponseProtocol;

/**
 * Adaptive Defense Protocol (ADP-001)
 * 
 * Protocol for generating adaptive defensive responses based on
 * threat analysis, classification, and behavioral patterns.
 * 
 * Protocol ID: ADP-001
 * Category: Dark Cognition
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Defense postures
 */
export const DEFENSE_POSTURES = {
  PASSIVE: 'passive',         // Observe only
  ALERT: 'alert',             // Heightened monitoring
  DEFENSIVE: 'defensive',     // Active blocking
  AGGRESSIVE: 'aggressive',   // Deception + blocking
  LOCKDOWN: 'lockdown'        // Maximum protection
};

/**
 * Defense actions
 */
export const DEFENSE_ACTIONS = {
  OBSERVE: 'observe',
  FINGERPRINT: 'fingerprint',
  RATE_LIMIT: 'rate-limit',
  CHALLENGE: 'challenge',
  DECEIVE: 'deceive',
  TARPIT: 'tarpit',
  BLOCK: 'block',
  BAN: 'ban',
  HONEYPOT: 'honeypot',
  QUARANTINE: 'quarantine'
};

/**
 * Threat categories
 */
export const THREAT_CATEGORIES = {
  SCANNER: { severity: 'low', defaultAction: DEFENSE_ACTIONS.RATE_LIMIT },
  CRAWLER: { severity: 'low', defaultAction: DEFENSE_ACTIONS.OBSERVE },
  BOT: { severity: 'medium', defaultAction: DEFENSE_ACTIONS.CHALLENGE },
  SCRAPER: { severity: 'medium', defaultAction: DEFENSE_ACTIONS.DECEIVE },
  ATTACKER: { severity: 'high', defaultAction: DEFENSE_ACTIONS.BLOCK },
  APT: { severity: 'critical', defaultAction: DEFENSE_ACTIONS.QUARANTINE }
};

/**
 * Adaptive Defense Engine
 */
export class AdaptiveDefenseEngine {
  constructor(config = {}) {
    this.config = {
      defaultPosture: config.defaultPosture || DEFENSE_POSTURES.ALERT,
      escalationThreshold: config.escalationThreshold || 0.7,
      deescalationThreshold: config.deescalationThreshold || 0.3,
      adaptationRate: config.adaptationRate || 0.1,
      phiModulation: config.phiModulation !== false,
      ...config
    };
    
    this.currentPosture = this.config.defaultPosture;
    this.threatLevel = 0.5;
    
    // Defense state
    this.state = {
      defensesTriggered: 0,
      threatsDetected: 0,
      threatsBlocked: 0,
      threatsBypassed: 0,
      adaptationCycles: 0
    };
    
    // Action effectiveness tracking
    this.actionEffectiveness = {};
    for (const action of Object.values(DEFENSE_ACTIONS)) {
      this.actionEffectiveness[action] = {
        attempts: 0,
        successes: 0,
        effectiveness: 0.5
      };
    }
    
    // Entity-specific defense history
    this.entityDefenses = new Map();
  }
  
  /**
   * Decide defense action for a threat
   */
  decide(threat, context = {}) {
    const entityId = context.entityId || threat.fingerprint || crypto.randomUUID();
    
    // Get entity history
    const history = this.entityDefenses.get(entityId) || {
      actions: [],
      lastSeen: null,
      totalThreats: 0,
      escalationLevel: 0
    };
    
    // Compute threat score
    const threatScore = this.computeThreatScore(threat, history);
    
    // Update threat level (moving average)
    this.threatLevel = this.threatLevel * 0.9 + threatScore * 0.1;
    
    // Update posture based on threat level
    this.updatePosture();
    
    // Select action based on posture and threat
    const action = this.selectAction(threat, threatScore, history);
    
    // Apply phi modulation for unpredictability
    const modifiedAction = this.config.phiModulation 
      ? this.phiModulate(action, threatScore)
      : action;
    
    // Generate response parameters
    const response = this.generateResponse(modifiedAction, threat, threatScore);
    
    // Update tracking
    this.trackDecision(entityId, history, modifiedAction, threatScore);
    
    return {
      action: modifiedAction,
      response,
      threatScore,
      posture: this.currentPosture,
      confidence: this.computeConfidence(modifiedAction, threatScore)
    };
  }
  
  /**
   * Compute threat score
   */
  computeThreatScore(threat, history) {
    let score = 0;
    
    // Base score from risk analysis
    score += (threat.riskScore || 0.5) * 0.4;
    
    // Score from classification
    const category = THREAT_CATEGORIES[threat.classification?.toUpperCase()];
    if (category) {
      score += ({ low: 0.2, medium: 0.4, high: 0.6, critical: 0.8 }[category.severity] || 0.3) * 0.3;
    }
    
    // Score from history
    if (history.totalThreats > 0) {
      score += Math.min(0.3, history.totalThreats * 0.05);
    }
    
    // Score from escalation
    score += history.escalationLevel * 0.1;
    
    // Normalize
    return Math.min(1, Math.max(0, score));
  }
  
  /**
   * Update defense posture
   */
  updatePosture() {
    const postures = Object.values(DEFENSE_POSTURES);
    const currentIndex = postures.indexOf(this.currentPosture);
    
    // Escalate if threat level high
    if (this.threatLevel > this.config.escalationThreshold) {
      if (currentIndex < postures.length - 1) {
        this.currentPosture = postures[currentIndex + 1];
      }
    }
    // De-escalate if threat level low
    else if (this.threatLevel < this.config.deescalationThreshold) {
      if (currentIndex > 0) {
        this.currentPosture = postures[currentIndex - 1];
      }
    }
  }
  
  /**
   * Select defense action
   */
  selectAction(threat, threatScore, history) {
    // Get base action for threat category
    const category = THREAT_CATEGORIES[threat.classification?.toUpperCase()];
    let baseAction = category?.defaultAction || DEFENSE_ACTIONS.OBSERVE;
    
    // Escalate based on posture
    const postureEscalation = {
      [DEFENSE_POSTURES.PASSIVE]: -1,
      [DEFENSE_POSTURES.ALERT]: 0,
      [DEFENSE_POSTURES.DEFENSIVE]: 1,
      [DEFENSE_POSTURES.AGGRESSIVE]: 2,
      [DEFENSE_POSTURES.LOCKDOWN]: 3
    };
    
    const actionSeverity = {
      [DEFENSE_ACTIONS.OBSERVE]: 0,
      [DEFENSE_ACTIONS.FINGERPRINT]: 1,
      [DEFENSE_ACTIONS.RATE_LIMIT]: 2,
      [DEFENSE_ACTIONS.CHALLENGE]: 3,
      [DEFENSE_ACTIONS.DECEIVE]: 4,
      [DEFENSE_ACTIONS.TARPIT]: 5,
      [DEFENSE_ACTIONS.BLOCK]: 6,
      [DEFENSE_ACTIONS.HONEYPOT]: 7,
      [DEFENSE_ACTIONS.BAN]: 8,
      [DEFENSE_ACTIONS.QUARANTINE]: 9
    };
    
    const actions = Object.keys(actionSeverity);
    let targetSeverity = actionSeverity[baseAction] + postureEscalation[this.currentPosture];
    
    // Escalate based on history
    if (history.escalationLevel > 0) {
      targetSeverity += history.escalationLevel;
    }
    
    // Clamp severity
    targetSeverity = Math.max(0, Math.min(actions.length - 1, targetSeverity));
    
    // Select action by severity
    return actions[Math.floor(targetSeverity)];
  }
  
  /**
   * Apply phi modulation for unpredictability
   */
  phiModulate(action, threatScore) {
    // Sometimes vary the action based on phi
    const phiRandom = (Math.sin(Date.now() / HB * PHI) + 1) / 2;
    
    // Only vary for medium-high threats
    if (threatScore > 0.4 && threatScore < 0.8 && phiRandom > THRESHOLD) {
      // Randomly escalate or use deception
      const variations = [DEFENSE_ACTIONS.DECEIVE, DEFENSE_ACTIONS.HONEYPOT, DEFENSE_ACTIONS.TARPIT];
      return variations[Math.floor(phiRandom * variations.length)];
    }
    
    return action;
  }
  
  /**
   * Generate response parameters
   */
  generateResponse(action, threat, threatScore) {
    const responses = {
      [DEFENSE_ACTIONS.OBSERVE]: {
        statusCode: null,
        headers: { 'X-Observed': 'true' },
        delay: 0
      },
      [DEFENSE_ACTIONS.FINGERPRINT]: {
        statusCode: null,
        headers: { 'X-FP': crypto.randomUUID().slice(0, 8) },
        delay: 0,
        flags: ['deep-fingerprint']
      },
      [DEFENSE_ACTIONS.RATE_LIMIT]: {
        statusCode: 429,
        headers: { 'Retry-After': String(Math.ceil(60 * PHI)) },
        delay: 1000
      },
      [DEFENSE_ACTIONS.CHALLENGE]: {
        statusCode: 403,
        headers: { 'X-Challenge': 'required' },
        challengeType: threatScore > 0.6 ? 'proof-of-work' : 'js-challenge'
      },
      [DEFENSE_ACTIONS.DECEIVE]: {
        statusCode: 200,
        headers: { 'Content-Type': 'application/json' },
        body: this.generateDeceptiveData(threat),
        delay: Math.random() * 500
      },
      [DEFENSE_ACTIONS.TARPIT]: {
        statusCode: 200,
        delay: 5000 + Math.random() * 25000,
        body: 'Loading...'
      },
      [DEFENSE_ACTIONS.BLOCK]: {
        statusCode: 403,
        body: 'Access Denied'
      },
      [DEFENSE_ACTIONS.HONEYPOT]: {
        statusCode: 200,
        redirect: '/honeypot',
        body: this.generateHoneypotData(threat)
      },
      [DEFENSE_ACTIONS.BAN]: {
        statusCode: 403,
        banDuration: 86400000 * threatScore,
        body: 'Banned'
      },
      [DEFENSE_ACTIONS.QUARANTINE]: {
        statusCode: 403,
        quarantine: true,
        alertLevel: 'critical',
        body: 'Access Denied'
      }
    };
    
    return responses[action] || responses[DEFENSE_ACTIONS.OBSERVE];
  }
  
  /**
   * Generate deceptive data
   */
  generateDeceptiveData(threat) {
    return JSON.stringify({
      success: true,
      data: Array(10).fill(null).map((_, i) => ({
        id: i + 1,
        value: `fake_${crypto.randomUUID().slice(0, 8)}`,
        timestamp: Date.now()
      }))
    });
  }
  
  /**
   * Generate honeypot data
   */
  generateHoneypotData(threat) {
    return JSON.stringify({
      admin: true,
      api_key: `hp_${crypto.randomUUID()}`,
      database: 'production',
      credentials: {
        username: 'admin',
        password: 'honeypot_trap_' + Date.now()
      }
    });
  }
  
  /**
   * Compute confidence in decision
   */
  computeConfidence(action, threatScore) {
    const effectiveness = this.actionEffectiveness[action]?.effectiveness || 0.5;
    const dataQuality = Math.min(1, this.state.defensesTriggered / 100);
    
    return (effectiveness * 0.6 + (1 - Math.abs(threatScore - 0.5)) * 0.4) * dataQuality;
  }
  
  /**
   * Track decision for learning
   */
  trackDecision(entityId, history, action, threatScore) {
    // Update history
    history.actions.push({
      action,
      threatScore,
      timestamp: Date.now()
    });
    history.lastSeen = Date.now();
    history.totalThreats++;
    
    // Escalate entity level if repeated
    if (history.actions.length > 3) {
      history.escalationLevel = Math.min(3, history.escalationLevel + 1);
    }
    
    // Trim history
    if (history.actions.length > 100) {
      history.actions = history.actions.slice(-100);
    }
    
    this.entityDefenses.set(entityId, history);
    
    // Update state
    this.state.defensesTriggered++;
    this.state.threatsDetected++;
    this.actionEffectiveness[action].attempts++;
    
    // Cleanup old entities
    if (this.entityDefenses.size > 100000) {
      const oldestKey = this.entityDefenses.keys().next().value;
      this.entityDefenses.delete(oldestKey);
    }
  }
  
  /**
   * Report action outcome for learning
   */
  reportOutcome(action, success) {
    const stats = this.actionEffectiveness[action];
    if (stats) {
      if (success) {
        stats.successes++;
        this.state.threatsBlocked++;
      } else {
        this.state.threatsBypassed++;
      }
      
      // Update effectiveness
      stats.effectiveness = stats.attempts > 0 
        ? stats.successes / stats.attempts 
        : 0.5;
    }
  }
  
  /**
   * Adapt defense strategies
   */
  adapt() {
    this.state.adaptationCycles++;
    
    // Adjust based on effectiveness
    for (const [action, stats] of Object.entries(this.actionEffectiveness)) {
      // Boost effective actions
      if (stats.effectiveness > THRESHOLD) {
        stats.effectiveness = Math.min(1, stats.effectiveness + this.config.adaptationRate);
      }
      // Reduce ineffective actions
      else if (stats.effectiveness < 0.3) {
        stats.effectiveness = Math.max(0, stats.effectiveness - this.config.adaptationRate);
      }
    }
    
    return {
      adapted: true,
      cycle: this.state.adaptationCycles,
      effectiveness: { ...this.actionEffectiveness }
    };
  }
  
  /**
   * Get defense statistics
   */
  getStats() {
    return {
      ...this.state,
      currentPosture: this.currentPosture,
      threatLevel: this.threatLevel,
      blockRate: this.state.threatsDetected > 0
        ? ((this.state.threatsBlocked / this.state.threatsDetected) * 100).toFixed(1) + '%'
        : 'N/A',
      trackedEntities: this.entityDefenses.size,
      actionEffectiveness: Object.fromEntries(
        Object.entries(this.actionEffectiveness).map(([action, stats]) => [
          action,
          (stats.effectiveness * 100).toFixed(1) + '%'
        ])
      )
    };
  }
}

/**
 * Adaptive Defense Protocol
 */
export const AdaptiveDefenseProtocol = {
  id: 'ADP-001',
  name: 'Adaptive Defense Protocol',
  version: '1.0.0',
  category: 'dark-cognition',
  
  constants: {
    PHI,
    HB,
    THRESHOLD
  },
  
  postures: DEFENSE_POSTURES,
  actions: DEFENSE_ACTIONS,
  threats: THREAT_CATEGORIES,
  
  createEngine: (config) => new AdaptiveDefenseEngine(config)
};

export default AdaptiveDefenseProtocol;

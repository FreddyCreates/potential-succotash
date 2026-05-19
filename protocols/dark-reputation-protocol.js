/**
 * Dark Reputation Protocol (DRK-018)
 * 
 * Reputation scoring and tracking for entities in the dark layer.
 * Silent reputation management without observable emissions.
 * 
 * Protocol ID: DRK-018
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Reputation tiers
 */
export const REPUTATION_TIERS = {
  TRUSTED: 'trusted',
  NEUTRAL: 'neutral',
  SUSPICIOUS: 'suspicious',
  HOSTILE: 'hostile',
  BANNED: 'banned'
};

/**
 * Score factors
 */
export const SCORE_FACTORS = {
  BEHAVIOR: 'behavior',
  HISTORY: 'history',
  NETWORK: 'network',
  PATTERN: 'pattern',
  FEEDBACK: 'feedback'
};

/**
 * Reputation Score
 */
export class ReputationScore {
  constructor(entityId, initialScore = 0.5) {
    this.entityId = entityId;
    this.score = initialScore;
    this.factors = new Map();
    this.history = [];
    this.created = Date.now();
    this.updated = Date.now();
  }
  
  /**
   * Update factor score
   */
  updateFactor(factor, value, weight = 1) {
    this.factors.set(factor, { value, weight, updated: Date.now() });
    this.recalculate();
    
    this.history.push({
      factor,
      value,
      resultScore: this.score,
      timestamp: Date.now()
    });
    
    while (this.history.length > 100) {
      this.history.shift();
    }
    
    return this.score;
  }
  
  /**
   * Recalculate total score
   */
  recalculate() {
    if (this.factors.size === 0) return;
    
    let totalWeight = 0;
    let weightedSum = 0;
    
    for (const { value, weight } of this.factors.values()) {
      weightedSum += value * weight;
      totalWeight += weight;
    }
    
    this.score = totalWeight > 0 ? weightedSum / totalWeight : 0.5;
    this.updated = Date.now();
  }
  
  /**
   * Apply decay
   */
  decay(rate = THRESHOLD) {
    // Move score toward neutral (0.5)
    this.score = this.score + (0.5 - this.score) * rate;
    this.updated = Date.now();
    return this.score;
  }
  
  /**
   * Get tier
   */
  getTier() {
    if (this.score >= 0.8) return REPUTATION_TIERS.TRUSTED;
    if (this.score >= 0.5) return REPUTATION_TIERS.NEUTRAL;
    if (this.score >= 0.3) return REPUTATION_TIERS.SUSPICIOUS;
    if (this.score >= 0.1) return REPUTATION_TIERS.HOSTILE;
    return REPUTATION_TIERS.BANNED;
  }
  
  /**
   * Serialize
   */
  toJSON() {
    return {
      entityId: this.entityId,
      score: this.score,
      tier: this.getTier(),
      factors: Object.fromEntries(this.factors),
      created: this.created,
      updated: this.updated
    };
  }
}

/**
 * Reputation Manager
 */
export class ReputationManager {
  constructor(config = {}) {
    this.config = {
      decayInterval: config.decayInterval || 3600000, // 1 hour
      decayRate: config.decayRate || THRESHOLD / 10,
      maxEntities: config.maxEntities || 100000,
      ...config
    };
    
    this.scores = new Map();
    this.lastDecay = Date.now();
    
    this.stats = {
      queries: 0,
      updates: 0,
      decays: 0
    };
  }
  
  /**
   * Get or create score
   */
  getScore(entityId) {
    if (!this.scores.has(entityId)) {
      this.scores.set(entityId, new ReputationScore(entityId));
    }
    
    this.stats.queries++;
    return this.scores.get(entityId);
  }
  
  /**
   * Update entity reputation
   */
  update(entityId, factor, value, weight = 1) {
    const score = this.getScore(entityId);
    score.updateFactor(factor, value, weight);
    
    this.stats.updates++;
    
    // Enforce max entities
    while (this.scores.size > this.config.maxEntities) {
      // Remove oldest
      let oldest = null;
      let oldestTime = Infinity;
      
      for (const [id, s] of this.scores) {
        if (s.updated < oldestTime) {
          oldestTime = s.updated;
          oldest = id;
        }
      }
      
      if (oldest) this.scores.delete(oldest);
    }
    
    return score;
  }
  
  /**
   * Report positive event
   */
  reportPositive(entityId, factor = SCORE_FACTORS.BEHAVIOR, magnitude = 0.1) {
    const score = this.getScore(entityId);
    const current = score.factors.get(factor)?.value || 0.5;
    return this.update(entityId, factor, Math.min(1, current + magnitude));
  }
  
  /**
   * Report negative event
   */
  reportNegative(entityId, factor = SCORE_FACTORS.BEHAVIOR, magnitude = 0.1) {
    const score = this.getScore(entityId);
    const current = score.factors.get(factor)?.value || 0.5;
    return this.update(entityId, factor, Math.max(0, current - magnitude));
  }
  
  /**
   * Report attack
   */
  reportAttack(entityId, severity = 0.5) {
    return this.reportNegative(entityId, SCORE_FACTORS.BEHAVIOR, severity * PHI);
  }
  
  /**
   * Query reputation
   */
  query(entityId) {
    const score = this.getScore(entityId);
    return {
      score: score.score,
      tier: score.getTier(),
      factors: Object.fromEntries(score.factors),
      age: Date.now() - score.created
    };
  }
  
  /**
   * Check if trusted
   */
  isTrusted(entityId) {
    const score = this.getScore(entityId);
    return score.score >= 0.8;
  }
  
  /**
   * Check if hostile
   */
  isHostile(entityId) {
    const score = this.getScore(entityId);
    return score.score < 0.3;
  }
  
  /**
   * Apply decay to all scores
   */
  decayAll() {
    for (const score of this.scores.values()) {
      score.decay(this.config.decayRate);
    }
    
    this.lastDecay = Date.now();
    this.stats.decays++;
    
    return { decayed: this.scores.size };
  }
  
  /**
   * Get entities by tier
   */
  getByTier(tier) {
    const results = [];
    
    for (const score of this.scores.values()) {
      if (score.getTier() === tier) {
        results.push(score.toJSON());
      }
    }
    
    return results;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const tierCounts = {};
    for (const tier of Object.values(REPUTATION_TIERS)) {
      tierCounts[tier] = 0;
    }
    
    for (const score of this.scores.values()) {
      tierCounts[score.getTier()]++;
    }
    
    return {
      ...this.stats,
      totalEntities: this.scores.size,
      byTier: tierCounts,
      lastDecay: this.lastDecay
    };
  }
}

/**
 * Dark Reputation Protocol
 */
export const DarkReputationProtocol = {
  id: 'DRK-018',
  name: 'Dark Reputation Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  tiers: REPUTATION_TIERS,
  factors: SCORE_FACTORS,
  
  createScore: (entityId, initialScore) => new ReputationScore(entityId, initialScore),
  createManager: (config) => new ReputationManager(config)
};

export default DarkReputationProtocol;

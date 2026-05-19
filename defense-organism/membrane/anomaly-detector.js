/**
 * Real-Time Anomaly Detector - Dark Layer Intelligence
 * 
 * Detects anomalies in real-time using streaming algorithms
 * and φ-resonant thresholds.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Anomaly types
 */
export const ANOMALY_TYPES = {
  RATE: 'rate',               // Unusual request rate
  TIMING: 'timing',           // Unusual timing patterns
  VOLUME: 'volume',           // Unusual data volume
  PATTERN: 'pattern',         // Unusual access patterns
  BEHAVIORAL: 'behavioral',   // Unusual behavior
  GEOGRAPHIC: 'geographic',   // Unusual location
  TECHNICAL: 'technical'      // Technical anomalies
};

/**
 * Anomaly severity
 */
export const ANOMALY_SEVERITY = {
  CRITICAL: { level: 4, threshold: 0.95 },
  HIGH: { level: 3, threshold: 0.8 },
  MEDIUM: { level: 2, threshold: 0.6 },
  LOW: { level: 1, threshold: 0.4 },
  INFO: { level: 0, threshold: 0 }
};

/**
 * Exponential Moving Average
 */
class EMA {
  constructor(alpha = 0.1) {
    this.alpha = alpha;
    this.value = null;
  }
  
  update(newValue) {
    if (this.value === null) {
      this.value = newValue;
    } else {
      this.value = this.alpha * newValue + (1 - this.alpha) * this.value;
    }
    return this.value;
  }
  
  get() {
    return this.value;
  }
}

/**
 * Sliding Window Statistics
 */
class SlidingWindowStats {
  constructor(windowSize = 100) {
    this.windowSize = windowSize;
    this.values = [];
    this.sum = 0;
    this.sumSquares = 0;
  }
  
  add(value) {
    this.values.push(value);
    this.sum += value;
    this.sumSquares += value * value;
    
    // Remove old values
    while (this.values.length > this.windowSize) {
      const removed = this.values.shift();
      this.sum -= removed;
      this.sumSquares -= removed * removed;
    }
  }
  
  mean() {
    if (this.values.length === 0) return 0;
    return this.sum / this.values.length;
  }
  
  variance() {
    if (this.values.length < 2) return 0;
    const mean = this.mean();
    return (this.sumSquares / this.values.length) - (mean * mean);
  }
  
  stdDev() {
    return Math.sqrt(this.variance());
  }
  
  min() {
    if (this.values.length === 0) return 0;
    return Math.min(...this.values);
  }
  
  max() {
    if (this.values.length === 0) return 0;
    return Math.max(...this.values);
  }
  
  percentile(p) {
    if (this.values.length === 0) return 0;
    const sorted = [...this.values].sort((a, b) => a - b);
    const index = Math.floor(p * sorted.length);
    return sorted[Math.min(index, sorted.length - 1)];
  }
  
  zScore(value) {
    const mean = this.mean();
    const stdDev = this.stdDev();
    if (stdDev === 0) return 0;
    return (value - mean) / stdDev;
  }
}

/**
 * Rate Limiter with Anomaly Detection
 */
class RateAnomalyDetector {
  constructor(config = {}) {
    this.windowMs = config.windowMs || 60000; // 1 minute
    this.buckets = new Map();
    this.stats = new SlidingWindowStats(1000);
    this.ema = new EMA(0.2);
  }
  
  record(entityId) {
    const now = Date.now();
    const bucket = Math.floor(now / this.windowMs);
    
    // Get or create entity bucket
    if (!this.buckets.has(entityId)) {
      this.buckets.set(entityId, new Map());
    }
    
    const entityBuckets = this.buckets.get(entityId);
    const count = (entityBuckets.get(bucket) || 0) + 1;
    entityBuckets.set(bucket, count);
    
    // Update stats
    this.stats.add(count);
    this.ema.update(count);
    
    // Clean old buckets
    for (const [b] of entityBuckets) {
      if (b < bucket - 10) {
        entityBuckets.delete(b);
      }
    }
    
    return count;
  }
  
  detect(entityId) {
    const now = Date.now();
    const bucket = Math.floor(now / this.windowMs);
    
    const entityBuckets = this.buckets.get(entityId);
    if (!entityBuckets) return { isAnomaly: false };
    
    const currentCount = entityBuckets.get(bucket) || 0;
    const zScore = this.stats.zScore(currentCount);
    const emaRatio = this.ema.get() > 0 ? currentCount / this.ema.get() : 0;
    
    // Anomaly if z-score > 3 or rate > 5x EMA
    const isAnomaly = Math.abs(zScore) > 3 || emaRatio > 5;
    
    return {
      isAnomaly,
      score: Math.min(1, Math.abs(zScore) / 5),
      currentRate: currentCount,
      expectedRate: this.ema.get(),
      zScore
    };
  }
}

/**
 * Timing Anomaly Detector
 */
class TimingAnomalyDetector {
  constructor() {
    this.entityTimings = new Map();
    this.globalStats = new SlidingWindowStats(10000);
  }
  
  record(entityId, timestamp = Date.now()) {
    if (!this.entityTimings.has(entityId)) {
      this.entityTimings.set(entityId, {
        lastTimestamp: timestamp,
        intervals: new SlidingWindowStats(100)
      });
      return null;
    }
    
    const entity = this.entityTimings.get(entityId);
    const interval = timestamp - entity.lastTimestamp;
    
    entity.intervals.add(interval);
    entity.lastTimestamp = timestamp;
    this.globalStats.add(interval);
    
    return interval;
  }
  
  detect(entityId) {
    const entity = this.entityTimings.get(entityId);
    if (!entity || entity.intervals.values.length < 5) {
      return { isAnomaly: false, hasData: false };
    }
    
    // Check for machine-like regularity
    const stdDev = entity.intervals.stdDev();
    const mean = entity.intervals.mean();
    const cv = mean > 0 ? stdDev / mean : 0; // Coefficient of variation
    
    // Too regular (machine-like)
    const isTooRegular = cv < 0.1 && mean < 1000;
    
    // Too fast
    const isTooFast = entity.intervals.percentile(0.1) < 50;
    
    // Too variable (erratic)
    const isTooVariable = cv > 2;
    
    const isAnomaly = isTooRegular || isTooFast || isTooVariable;
    
    let score = 0;
    if (isTooRegular) score = Math.max(score, 1 - cv * 10);
    if (isTooFast) score = Math.max(score, Math.min(1, 50 / entity.intervals.percentile(0.1)));
    if (isTooVariable) score = Math.max(score, Math.min(1, cv / 4));
    
    return {
      isAnomaly,
      hasData: true,
      score,
      indicators: {
        isTooRegular,
        isTooFast,
        isTooVariable
      },
      stats: {
        mean,
        stdDev,
        cv,
        min: entity.intervals.min(),
        max: entity.intervals.max()
      }
    };
  }
}

/**
 * Pattern Anomaly Detector
 */
class PatternAnomalyDetector {
  constructor() {
    this.entityPatterns = new Map();
    this.globalPatterns = new Map();
  }
  
  record(entityId, pattern) {
    // Track entity patterns
    if (!this.entityPatterns.has(entityId)) {
      this.entityPatterns.set(entityId, new Map());
    }
    
    const entityMap = this.entityPatterns.get(entityId);
    const count = (entityMap.get(pattern) || 0) + 1;
    entityMap.set(pattern, count);
    
    // Track global patterns
    const globalCount = (this.globalPatterns.get(pattern) || 0) + 1;
    this.globalPatterns.set(pattern, globalCount);
  }
  
  detect(entityId, pattern) {
    const entityMap = this.entityPatterns.get(entityId);
    if (!entityMap) {
      return { isAnomaly: false };
    }
    
    // Calculate pattern rarity
    const totalGlobal = [...this.globalPatterns.values()].reduce((a, b) => a + b, 0);
    const patternGlobal = this.globalPatterns.get(pattern) || 0;
    const globalFrequency = patternGlobal / totalGlobal;
    
    // Calculate entity focus on this pattern
    const totalEntity = [...entityMap.values()].reduce((a, b) => a + b, 0);
    const patternEntity = entityMap.get(pattern) || 0;
    const entityFrequency = patternEntity / totalEntity;
    
    // Anomaly if:
    // 1. Pattern is rare globally but this entity uses it a lot
    // 2. This entity has unusual pattern distribution
    const rarityScore = globalFrequency < 0.01 ? 1 - globalFrequency * 100 : 0;
    const focusScore = entityFrequency > globalFrequency * 10 ? 
      Math.min(1, (entityFrequency / globalFrequency) / 20) : 0;
    
    const score = Math.max(rarityScore, focusScore);
    
    return {
      isAnomaly: score > THRESHOLD,
      score,
      globalFrequency,
      entityFrequency,
      indicators: {
        isRare: rarityScore > 0.5,
        isOverFocused: focusScore > 0.5
      }
    };
  }
}

/**
 * Anomaly Event
 */
export class AnomalyEvent {
  constructor(type, entityId, details) {
    this.id = crypto.randomUUID();
    this.timestamp = Date.now();
    this.type = type;
    this.entityId = entityId;
    this.details = details;
    this.score = details.score || 0;
    this.severity = this.computeSeverity();
  }
  
  computeSeverity() {
    for (const [name, config] of Object.entries(ANOMALY_SEVERITY)) {
      if (this.score >= config.threshold) {
        return name;
      }
    }
    return 'INFO';
  }
  
  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      type: this.type,
      entityId: this.entityId,
      score: this.score,
      severity: this.severity,
      details: this.details
    };
  }
}

/**
 * Real-Time Anomaly Detector
 */
export class RealTimeAnomalyDetector {
  constructor(config = {}) {
    this.config = {
      enableRate: config.enableRate !== false,
      enableTiming: config.enableTiming !== false,
      enablePattern: config.enablePattern !== false,
      alertThreshold: config.alertThreshold || THRESHOLD,
      maxAnomalies: config.maxAnomalies || 10000,
      ...config
    };
    
    // Detectors
    this.rateDetector = new RateAnomalyDetector(config.rate);
    this.timingDetector = new TimingAnomalyDetector();
    this.patternDetector = new PatternAnomalyDetector();
    
    // Anomaly history
    this.anomalies = [];
    this.entityAnomalies = new Map();
    
    // Statistics
    this.stats = {
      eventsProcessed: 0,
      anomaliesDetected: 0,
      bySeverity: {},
      byType: {}
    };
  }
  
  /**
   * Process an event
   */
  process(event) {
    this.stats.eventsProcessed++;
    
    const entityId = event.entityId || event.ip || 'unknown';
    const detected = [];
    
    // Rate anomaly detection
    if (this.config.enableRate) {
      this.rateDetector.record(entityId);
      const rateResult = this.rateDetector.detect(entityId);
      
      if (rateResult.isAnomaly) {
        detected.push(this.createAnomaly(
          ANOMALY_TYPES.RATE,
          entityId,
          rateResult
        ));
      }
    }
    
    // Timing anomaly detection
    if (this.config.enableTiming) {
      this.timingDetector.record(entityId, event.timestamp);
      const timingResult = this.timingDetector.detect(entityId);
      
      if (timingResult.isAnomaly) {
        detected.push(this.createAnomaly(
          ANOMALY_TYPES.TIMING,
          entityId,
          timingResult
        ));
      }
    }
    
    // Pattern anomaly detection
    if (this.config.enablePattern && event.path) {
      const pattern = this.extractPattern(event.path);
      this.patternDetector.record(entityId, pattern);
      const patternResult = this.patternDetector.detect(entityId, pattern);
      
      if (patternResult.isAnomaly) {
        detected.push(this.createAnomaly(
          ANOMALY_TYPES.PATTERN,
          entityId,
          { ...patternResult, pattern }
        ));
      }
    }
    
    // Compute composite anomaly score
    const compositeScore = this.computeCompositeScore(detected);
    
    return {
      anomalies: detected,
      compositeScore,
      isAnomalous: compositeScore > this.config.alertThreshold
    };
  }
  
  /**
   * Extract pattern from path
   */
  extractPattern(path) {
    // Normalize numeric IDs
    return path
      .replace(/\/\d+/g, '/{id}')
      .replace(/\?.*/g, '')
      .toLowerCase();
  }
  
  /**
   * Create anomaly event
   */
  createAnomaly(type, entityId, details) {
    const anomaly = new AnomalyEvent(type, entityId, details);
    
    // Store anomaly
    this.anomalies.push(anomaly);
    
    // Trim history
    if (this.anomalies.length > this.config.maxAnomalies) {
      this.anomalies.shift();
    }
    
    // Track by entity
    if (!this.entityAnomalies.has(entityId)) {
      this.entityAnomalies.set(entityId, []);
    }
    this.entityAnomalies.get(entityId).push(anomaly);
    
    // Update stats
    this.stats.anomaliesDetected++;
    this.stats.bySeverity[anomaly.severity] = 
      (this.stats.bySeverity[anomaly.severity] || 0) + 1;
    this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    
    return anomaly;
  }
  
  /**
   * Compute composite anomaly score
   */
  computeCompositeScore(anomalies) {
    if (anomalies.length === 0) return 0;
    
    // Combine scores using max + weighted average
    const max = Math.max(...anomalies.map(a => a.score));
    const avg = anomalies.reduce((sum, a) => sum + a.score, 0) / anomalies.length;
    
    return max * 0.7 + avg * 0.3;
  }
  
  /**
   * Get recent anomalies
   */
  getRecentAnomalies(options = {}) {
    let results = [...this.anomalies];
    
    if (options.entityId) {
      results = results.filter(a => a.entityId === options.entityId);
    }
    
    if (options.type) {
      results = results.filter(a => a.type === options.type);
    }
    
    if (options.minSeverity) {
      const minLevel = ANOMALY_SEVERITY[options.minSeverity]?.level || 0;
      results = results.filter(a => 
        ANOMALY_SEVERITY[a.severity]?.level >= minLevel
      );
    }
    
    if (options.since) {
      results = results.filter(a => a.timestamp >= options.since);
    }
    
    // Sort by timestamp descending
    results.sort((a, b) => b.timestamp - a.timestamp);
    
    if (options.limit) {
      results = results.slice(0, options.limit);
    }
    
    return results.map(a => a.toJSON());
  }
  
  /**
   * Get entity risk score
   */
  getEntityRiskScore(entityId) {
    const entityAnomalies = this.entityAnomalies.get(entityId);
    if (!entityAnomalies || entityAnomalies.length === 0) {
      return { score: 0, anomalyCount: 0 };
    }
    
    // Decay old anomalies
    const now = Date.now();
    const decayedScores = entityAnomalies.map(a => {
      const age = now - a.timestamp;
      const decayFactor = Math.exp(-age / (HB * 1000 * PHI));
      return a.score * decayFactor;
    });
    
    const totalScore = decayedScores.reduce((a, b) => a + b, 0);
    const normalizedScore = Math.min(1, totalScore / 5);
    
    return {
      score: normalizedScore,
      anomalyCount: entityAnomalies.length,
      recentAnomalies: entityAnomalies.slice(-5).map(a => a.toJSON())
    };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      anomalyHistory: this.anomalies.length,
      trackedEntities: this.entityAnomalies.size
    };
  }
}

export default RealTimeAnomalyDetector;

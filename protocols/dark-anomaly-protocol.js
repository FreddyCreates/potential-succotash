/**
 * Dark Anomaly Protocol (DRK-013)
 * 
 * Anomaly detection for the dark layer using statistical
 * and phi-based deviation analysis.
 * 
 * Protocol ID: DRK-013
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Anomaly types
 */
export const ANOMALY_TYPES = {
  STATISTICAL: 'statistical',
  TEMPORAL: 'temporal',
  STRUCTURAL: 'structural',
  BEHAVIORAL: 'behavioral',
  CONTEXTUAL: 'contextual'
};

/**
 * Anomaly severity
 */
export const ANOMALY_SEVERITY = {
  INFO: 'info',
  LOW: 'low',
  MEDIUM: 'medium',
  HIGH: 'high',
  CRITICAL: 'critical'
};

/**
 * Statistical Model
 */
export class StatisticalModel {
  constructor() {
    this.count = 0;
    this.sum = 0;
    this.sumSq = 0;
    this.min = Infinity;
    this.max = -Infinity;
    this.values = [];
    this.maxHistory = 1000;
  }
  
  /**
   * Add observation
   */
  observe(value) {
    this.count++;
    this.sum += value;
    this.sumSq += value * value;
    this.min = Math.min(this.min, value);
    this.max = Math.max(this.max, value);
    
    this.values.push(value);
    while (this.values.length > this.maxHistory) {
      this.values.shift();
    }
  }
  
  /**
   * Get mean
   */
  mean() {
    return this.count > 0 ? this.sum / this.count : 0;
  }
  
  /**
   * Get variance
   */
  variance() {
    if (this.count < 2) return 0;
    const m = this.mean();
    return (this.sumSq / this.count) - (m * m);
  }
  
  /**
   * Get standard deviation
   */
  stdDev() {
    return Math.sqrt(this.variance());
  }
  
  /**
   * Get z-score for value
   */
  zScore(value) {
    const std = this.stdDev();
    if (std === 0) return 0;
    return (value - this.mean()) / std;
  }
  
  /**
   * Check if value is anomalous
   */
  isAnomaly(value, threshold = 3) {
    return Math.abs(this.zScore(value)) > threshold;
  }
  
  /**
   * Get percentile
   */
  percentile(p) {
    if (this.values.length === 0) return 0;
    const sorted = [...this.values].sort((a, b) => a - b);
    const idx = Math.floor(p / 100 * (sorted.length - 1));
    return sorted[idx];
  }
  
  /**
   * Get IQR bounds
   */
  iqrBounds() {
    const q1 = this.percentile(25);
    const q3 = this.percentile(75);
    const iqr = q3 - q1;
    return {
      lower: q1 - 1.5 * iqr,
      upper: q3 + 1.5 * iqr
    };
  }
}

/**
 * Anomaly Event
 */
export class AnomalyEvent {
  constructor(type, data, severity, details = {}) {
    this.id = `anomaly-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.type = type;
    this.data = data;
    this.severity = severity;
    this.details = details;
    this.timestamp = Date.now();
    this.phi = this.computePhi();
  }
  
  computePhi() {
    const str = JSON.stringify({ type: this.type, severity: this.severity });
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
}

/**
 * Dark Anomaly Detector
 */
export class DarkAnomalyDetector {
  constructor(config = {}) {
    this.config = {
      zScoreThreshold: config.zScoreThreshold || 3,
      minObservations: config.minObservations || 30,
      adaptiveWindow: config.adaptiveWindow || 100,
      ...config
    };
    
    this.models = new Map();
    this.anomalies = [];
    this.baselines = new Map();
    
    this.stats = {
      observations: 0,
      anomaliesDetected: 0,
      byType: {},
      bySeverity: {}
    };
  }
  
  /**
   * Get or create model for metric
   */
  getModel(metricName) {
    if (!this.models.has(metricName)) {
      this.models.set(metricName, new StatisticalModel());
    }
    return this.models.get(metricName);
  }
  
  /**
   * Observe metric value
   */
  observe(metricName, value) {
    const model = this.getModel(metricName);
    model.observe(value);
    this.stats.observations++;
    
    // Check for anomaly
    if (model.count >= this.config.minObservations) {
      const zScore = model.zScore(value);
      
      if (Math.abs(zScore) > this.config.zScoreThreshold) {
        return this.recordAnomaly(ANOMALY_TYPES.STATISTICAL, {
          metric: metricName,
          value,
          zScore,
          mean: model.mean(),
          stdDev: model.stdDev()
        });
      }
    }
    
    return null;
  }
  
  /**
   * Observe multiple metrics at once
   */
  observeMultiple(metrics) {
    const anomalies = [];
    
    for (const [name, value] of Object.entries(metrics)) {
      const anomaly = this.observe(name, value);
      if (anomaly) {
        anomalies.push(anomaly);
      }
    }
    
    return anomalies;
  }
  
  /**
   * Detect temporal anomaly
   */
  detectTemporalAnomaly(events) {
    if (events.length < 2) return null;
    
    // Extract intervals
    const intervals = [];
    for (let i = 1; i < events.length; i++) {
      const t1 = events[i - 1].timestamp || events[i - 1].time || events[i - 1];
      const t2 = events[i].timestamp || events[i].time || events[i];
      intervals.push(t2 - t1);
    }
    
    // Detect sudden changes
    const model = new StatisticalModel();
    for (const interval of intervals.slice(0, -1)) {
      model.observe(interval);
    }
    
    const lastInterval = intervals[intervals.length - 1];
    
    if (model.count >= 5 && model.isAnomaly(lastInterval, this.config.zScoreThreshold)) {
      return this.recordAnomaly(ANOMALY_TYPES.TEMPORAL, {
        interval: lastInterval,
        expectedInterval: model.mean(),
        zScore: model.zScore(lastInterval)
      });
    }
    
    return null;
  }
  
  /**
   * Detect behavioral anomaly
   */
  detectBehavioralAnomaly(sessionFeatures, baselineId) {
    const baseline = this.baselines.get(baselineId);
    
    if (!baseline) {
      // First time - set baseline
      this.baselines.set(baselineId, { ...sessionFeatures, observations: 1 });
      return null;
    }
    
    // Compare to baseline
    let deviations = 0;
    let totalFeatures = 0;
    
    for (const [feature, value] of Object.entries(sessionFeatures)) {
      if (typeof value === 'number' && baseline[feature] !== undefined) {
        const ratio = value / (baseline[feature] || 1);
        if (ratio < 0.5 || ratio > 2) {
          deviations++;
        }
        totalFeatures++;
      }
    }
    
    // Update baseline with exponential moving average
    const alpha = 0.1;
    for (const [feature, value] of Object.entries(sessionFeatures)) {
      if (typeof value === 'number') {
        baseline[feature] = baseline[feature] !== undefined
          ? (1 - alpha) * baseline[feature] + alpha * value
          : value;
      }
    }
    baseline.observations++;
    
    // Check for anomaly
    const deviationRatio = totalFeatures > 0 ? deviations / totalFeatures : 0;
    
    if (deviationRatio > THRESHOLD && baseline.observations > 10) {
      return this.recordAnomaly(ANOMALY_TYPES.BEHAVIORAL, {
        deviationRatio,
        deviations,
        totalFeatures,
        baselineObservations: baseline.observations
      });
    }
    
    return null;
  }
  
  /**
   * Record anomaly
   */
  recordAnomaly(type, data) {
    // Determine severity
    let severity = ANOMALY_SEVERITY.LOW;
    
    if (data.zScore !== undefined) {
      const absZ = Math.abs(data.zScore);
      if (absZ > 5) severity = ANOMALY_SEVERITY.CRITICAL;
      else if (absZ > 4) severity = ANOMALY_SEVERITY.HIGH;
      else if (absZ > 3) severity = ANOMALY_SEVERITY.MEDIUM;
    } else if (data.deviationRatio !== undefined) {
      if (data.deviationRatio > 0.8) severity = ANOMALY_SEVERITY.CRITICAL;
      else if (data.deviationRatio > 0.6) severity = ANOMALY_SEVERITY.HIGH;
      else if (data.deviationRatio > 0.4) severity = ANOMALY_SEVERITY.MEDIUM;
    }
    
    const anomaly = new AnomalyEvent(type, data, severity);
    
    this.anomalies.push(anomaly);
    while (this.anomalies.length > 1000) {
      this.anomalies.shift();
    }
    
    // Update stats
    this.stats.anomaliesDetected++;
    this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    this.stats.bySeverity[severity] = (this.stats.bySeverity[severity] || 0) + 1;
    
    return anomaly;
  }
  
  /**
   * Get recent anomalies
   */
  getRecentAnomalies(limit = 100, minSeverity = null) {
    let result = this.anomalies.slice(-limit);
    
    if (minSeverity) {
      const severityOrder = [
        ANOMALY_SEVERITY.INFO,
        ANOMALY_SEVERITY.LOW,
        ANOMALY_SEVERITY.MEDIUM,
        ANOMALY_SEVERITY.HIGH,
        ANOMALY_SEVERITY.CRITICAL
      ];
      const minIdx = severityOrder.indexOf(minSeverity);
      result = result.filter(a => severityOrder.indexOf(a.severity) >= minIdx);
    }
    
    return result;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      models: this.models.size,
      baselines: this.baselines.size,
      recentAnomalies: this.anomalies.length
    };
  }
}

/**
 * Dark Anomaly Protocol
 */
export const DarkAnomalyProtocol = {
  id: 'DRK-013',
  name: 'Dark Anomaly Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  types: ANOMALY_TYPES,
  severity: ANOMALY_SEVERITY,
  
  createModel: () => new StatisticalModel(),
  createDetector: (config) => new DarkAnomalyDetector(config),
  createEvent: (type, data, severity, details) => new AnomalyEvent(type, data, severity, details)
};

export default DarkAnomalyProtocol;

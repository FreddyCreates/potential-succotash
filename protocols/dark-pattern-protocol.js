/**
 * Dark Pattern Protocol (DRK-012)
 * 
 * Pattern detection and matching for the dark layer.
 * Identifies behavioral patterns, attack signatures, and anomalies.
 * 
 * Protocol ID: DRK-012
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Pattern types
 */
export const PATTERN_TYPES = {
  SEQUENCE: 'sequence',
  FREQUENCY: 'frequency',
  TEMPORAL: 'temporal',
  STRUCTURAL: 'structural',
  BEHAVIORAL: 'behavioral'
};

/**
 * Pattern states
 */
export const PATTERN_STATES = {
  EMERGING: 'emerging',
  ESTABLISHED: 'established',
  FADING: 'fading',
  DORMANT: 'dormant'
};

/**
 * Pattern Template
 */
export class PatternTemplate {
  constructor(id, type, signature, config = {}) {
    this.id = id;
    this.type = type;
    this.signature = signature;
    this.threshold = config.threshold || THRESHOLD;
    this.weight = config.weight || 1;
    this.description = config.description || '';
    this.tags = config.tags || [];
    this.created = Date.now();
    this.matches = 0;
  }
  
  /**
   * Match against data
   */
  match(data) {
    switch (this.type) {
      case PATTERN_TYPES.SEQUENCE:
        return this.matchSequence(data);
      case PATTERN_TYPES.FREQUENCY:
        return this.matchFrequency(data);
      case PATTERN_TYPES.TEMPORAL:
        return this.matchTemporal(data);
      case PATTERN_TYPES.STRUCTURAL:
        return this.matchStructural(data);
      case PATTERN_TYPES.BEHAVIORAL:
        return this.matchBehavioral(data);
      default:
        return { matched: false, confidence: 0 };
    }
  }
  
  matchSequence(data) {
    if (!Array.isArray(data) || !Array.isArray(this.signature)) {
      return { matched: false, confidence: 0 };
    }
    
    // Find signature in data sequence
    const sigLen = this.signature.length;
    let bestMatch = 0;
    
    for (let i = 0; i <= data.length - sigLen; i++) {
      let matches = 0;
      for (let j = 0; j < sigLen; j++) {
        if (this.elementsMatch(data[i + j], this.signature[j])) {
          matches++;
        }
      }
      bestMatch = Math.max(bestMatch, matches / sigLen);
    }
    
    const confidence = bestMatch;
    const matched = confidence >= this.threshold;
    
    if (matched) this.matches++;
    
    return { matched, confidence, type: this.type };
  }
  
  matchFrequency(data) {
    if (!Array.isArray(data)) {
      return { matched: false, confidence: 0 };
    }
    
    const freq = {};
    for (const item of data) {
      const key = typeof item === 'object' ? JSON.stringify(item) : String(item);
      freq[key] = (freq[key] || 0) + 1;
    }
    
    // Check if frequency distribution matches signature
    let matchScore = 0;
    let total = 0;
    
    for (const [key, expectedFreq] of Object.entries(this.signature)) {
      const actualFreq = freq[key] || 0;
      const ratio = Math.min(actualFreq, expectedFreq) / Math.max(actualFreq, expectedFreq, 1);
      matchScore += ratio;
      total++;
    }
    
    const confidence = total > 0 ? matchScore / total : 0;
    const matched = confidence >= this.threshold;
    
    if (matched) this.matches++;
    
    return { matched, confidence, type: this.type };
  }
  
  matchTemporal(data) {
    if (!Array.isArray(data)) {
      return { matched: false, confidence: 0 };
    }
    
    // Extract timestamps
    const timestamps = data.map(d => d.timestamp || d.time || d.t || Date.now());
    
    // Compute intervals
    const intervals = [];
    for (let i = 1; i < timestamps.length; i++) {
      intervals.push(timestamps[i] - timestamps[i - 1]);
    }
    
    // Match against expected pattern
    const expectedInterval = this.signature.interval || HB;
    const tolerance = this.signature.tolerance || 0.2;
    
    let matchCount = 0;
    for (const interval of intervals) {
      const ratio = interval / expectedInterval;
      if (Math.abs(ratio - 1) <= tolerance) {
        matchCount++;
      }
    }
    
    const confidence = intervals.length > 0 ? matchCount / intervals.length : 0;
    const matched = confidence >= this.threshold;
    
    if (matched) this.matches++;
    
    return { matched, confidence, type: this.type };
  }
  
  matchStructural(data) {
    if (typeof data !== 'object') {
      return { matched: false, confidence: 0 };
    }
    
    const requiredKeys = this.signature.required || [];
    const optionalKeys = this.signature.optional || [];
    
    let foundRequired = 0;
    let foundOptional = 0;
    
    for (const key of requiredKeys) {
      if (this.hasNestedKey(data, key)) {
        foundRequired++;
      }
    }
    
    for (const key of optionalKeys) {
      if (this.hasNestedKey(data, key)) {
        foundOptional++;
      }
    }
    
    const requiredScore = requiredKeys.length > 0 ? foundRequired / requiredKeys.length : 1;
    const optionalScore = optionalKeys.length > 0 ? foundOptional / optionalKeys.length : 1;
    
    const confidence = requiredScore * 0.8 + optionalScore * 0.2;
    const matched = requiredScore === 1 && confidence >= this.threshold;
    
    if (matched) this.matches++;
    
    return { matched, confidence, type: this.type };
  }
  
  matchBehavioral(data) {
    // Behavioral patterns use feature vectors
    const features = data.features || data;
    let score = 0;
    let total = 0;
    
    for (const [key, expected] of Object.entries(this.signature)) {
      const actual = features[key];
      if (actual !== undefined) {
        if (typeof expected === 'object') {
          if (expected.min !== undefined && actual >= expected.min) score++;
          if (expected.max !== undefined && actual <= expected.max) score++;
          total += (expected.min !== undefined ? 1 : 0) + (expected.max !== undefined ? 1 : 0);
        } else {
          if (actual === expected) score++;
          total++;
        }
      }
    }
    
    const confidence = total > 0 ? score / total : 0;
    const matched = confidence >= this.threshold;
    
    if (matched) this.matches++;
    
    return { matched, confidence, type: this.type };
  }
  
  elementsMatch(a, b) {
    if (typeof b === 'function') return b(a);
    if (b instanceof RegExp) return b.test(String(a));
    if (b === '*') return true;
    return a === b;
  }
  
  hasNestedKey(obj, path) {
    const keys = path.split('.');
    let current = obj;
    for (const key of keys) {
      if (current === null || current === undefined || !current.hasOwnProperty(key)) {
        return false;
      }
      current = current[key];
    }
    return true;
  }
}

/**
 * Dark Pattern Detector
 */
export class DarkPatternDetector {
  constructor(config = {}) {
    this.config = {
      minConfidence: config.minConfidence || THRESHOLD,
      maxPatterns: config.maxPatterns || 1000,
      ...config
    };
    
    this.patterns = new Map();
    this.detectedPatterns = [];
    
    this.stats = {
      scans: 0,
      detections: 0,
      byType: {}
    };
  }
  
  /**
   * Register a pattern
   */
  register(pattern) {
    if (!(pattern instanceof PatternTemplate)) {
      pattern = new PatternTemplate(
        pattern.id || `pattern-${Date.now()}`,
        pattern.type,
        pattern.signature,
        pattern
      );
    }
    
    this.patterns.set(pattern.id, pattern);
    return pattern;
  }
  
  /**
   * Remove a pattern
   */
  unregister(patternId) {
    return this.patterns.delete(patternId);
  }
  
  /**
   * Scan data for patterns
   */
  scan(data) {
    this.stats.scans++;
    const matches = [];
    
    for (const pattern of this.patterns.values()) {
      const result = pattern.match(data);
      
      if (result.matched) {
        matches.push({
          patternId: pattern.id,
          patternType: pattern.type,
          confidence: result.confidence,
          weight: pattern.weight,
          timestamp: Date.now()
        });
        
        this.stats.detections++;
        this.stats.byType[pattern.type] = (this.stats.byType[pattern.type] || 0) + 1;
      }
    }
    
    // Record detection
    if (matches.length > 0) {
      this.detectedPatterns.push({
        timestamp: Date.now(),
        matches,
        phi: this.computePhi(data)
      });
      
      while (this.detectedPatterns.length > 1000) {
        this.detectedPatterns.shift();
      }
    }
    
    return matches;
  }
  
  /**
   * Compute phi signature for data
   */
  computePhi(data) {
    const str = JSON.stringify(data);
    let sum = 0;
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Get pattern by ID
   */
  getPattern(patternId) {
    return this.patterns.get(patternId);
  }
  
  /**
   * Get all patterns
   */
  getAllPatterns() {
    return [...this.patterns.values()];
  }
  
  /**
   * Get recent detections
   */
  getRecentDetections(limit = 100) {
    return this.detectedPatterns.slice(-limit);
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      registeredPatterns: this.patterns.size,
      recentDetections: this.detectedPatterns.length
    };
  }
}

/**
 * Dark Pattern Protocol
 */
export const DarkPatternProtocol = {
  id: 'DRK-012',
  name: 'Dark Pattern Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  types: PATTERN_TYPES,
  states: PATTERN_STATES,
  
  createTemplate: (id, type, signature, config) => new PatternTemplate(id, type, signature, config),
  createDetector: (config) => new DarkPatternDetector(config)
};

export default DarkPatternProtocol;

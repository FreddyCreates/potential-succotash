/**
 * Threat Intelligence Protocol (THR-001)
 * 
 * Protocol for threat intelligence aggregation, correlation,
 * and sharing across the dark cognition layer.
 * 
 * Protocol ID: THR-001
 * Category: Dark Cognition
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Intelligence priority levels
 */
export const INTEL_PRIORITY = {
  CRITICAL: { level: 4, ttl: 86400000 },    // 24h - active threats
  HIGH: { level: 3, ttl: 604800000 },       // 7d - recent threats
  MEDIUM: { level: 2, ttl: 2592000000 },    // 30d - known patterns
  LOW: { level: 1, ttl: 7776000000 },       // 90d - historical
  ARCHIVE: { level: 0, ttl: Infinity }       // permanent
};

/**
 * MITRE ATT&CK tactics (subset)
 */
export const MITRE_TACTICS = {
  RECONNAISSANCE: 'TA0043',
  RESOURCE_DEVELOPMENT: 'TA0042',
  INITIAL_ACCESS: 'TA0001',
  EXECUTION: 'TA0002',
  PERSISTENCE: 'TA0003',
  PRIVILEGE_ESCALATION: 'TA0004',
  DEFENSE_EVASION: 'TA0005',
  CREDENTIAL_ACCESS: 'TA0006',
  DISCOVERY: 'TA0007',
  LATERAL_MOVEMENT: 'TA0008',
  COLLECTION: 'TA0009',
  EXFILTRATION: 'TA0010',
  IMPACT: 'TA0040'
};

/**
 * Threat indicator
 */
export class ThreatIndicator {
  constructor(type, value, metadata = {}) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.value = value;
    this.created = Date.now();
    this.updated = Date.now();
    
    this.metadata = {
      confidence: metadata.confidence || 0.5,
      severity: metadata.severity || 'medium',
      priority: metadata.priority || 'MEDIUM',
      source: metadata.source || 'internal',
      tags: new Set(metadata.tags || []),
      mitre: metadata.mitre || [],
      context: metadata.context || {}
    };
    
    this.correlations = [];
    this.sightings = 1;
    
    this.phi = this.computePhi();
  }
  
  /**
   * Compute φ-signature
   */
  computePhi() {
    const str = `${this.type}:${this.value}`;
    const seed = [...str].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((seed * PHI) % 1).toFixed(6);
  }
  
  /**
   * Update indicator
   */
  update(metadata) {
    this.sightings++;
    this.updated = Date.now();
    
    // Update confidence
    if (metadata.confidence) {
      this.metadata.confidence = 
        (this.metadata.confidence + metadata.confidence) / 2;
    }
    
    // Add tags
    if (metadata.tags) {
      for (const tag of metadata.tags) {
        this.metadata.tags.add(tag);
      }
    }
    
    // Add MITRE mappings
    if (metadata.mitre) {
      for (const m of metadata.mitre) {
        if (!this.metadata.mitre.includes(m)) {
          this.metadata.mitre.push(m);
        }
      }
    }
  }
  
  /**
   * Add correlation
   */
  correlate(otherId, strength) {
    const existing = this.correlations.find(c => c.id === otherId);
    if (existing) {
      existing.strength = (existing.strength + strength) / 2;
      existing.updated = Date.now();
    } else {
      this.correlations.push({
        id: otherId,
        strength,
        created: Date.now(),
        updated: Date.now()
      });
    }
  }
  
  /**
   * Get TTL based on priority
   */
  getTTL() {
    return INTEL_PRIORITY[this.metadata.priority]?.ttl || INTEL_PRIORITY.MEDIUM.ttl;
  }
  
  /**
   * Check if expired
   */
  isExpired() {
    return Date.now() - this.updated > this.getTTL();
  }
  
  /**
   * Export for sharing
   */
  export() {
    return {
      id: this.id,
      type: this.type,
      value: this.value,
      confidence: this.metadata.confidence,
      severity: this.metadata.severity,
      priority: this.metadata.priority,
      tags: [...this.metadata.tags],
      mitre: this.metadata.mitre,
      sightings: this.sightings,
      correlations: this.correlations.length,
      phi: this.phi
    };
  }
}

/**
 * Threat Intelligence Feed
 */
export class ThreatIntelFeed {
  constructor(config = {}) {
    this.config = {
      maxIndicators: config.maxIndicators || 100000,
      correlationThreshold: config.correlationThreshold || 0.5,
      ...config
    };
    
    this.indicators = new Map();
    this.typeIndex = new Map();
    this.tagIndex = new Map();
    
    this.stats = {
      added: 0,
      updated: 0,
      expired: 0,
      correlations: 0
    };
  }
  
  /**
   * Add indicator
   */
  add(type, value, metadata = {}) {
    const key = `${type}:${value}`;
    
    if (this.indicators.has(key)) {
      const indicator = this.indicators.get(key);
      indicator.update(metadata);
      this.stats.updated++;
      return indicator;
    }
    
    const indicator = new ThreatIndicator(type, value, metadata);
    this.indicators.set(key, indicator);
    
    // Update type index
    if (!this.typeIndex.has(type)) {
      this.typeIndex.set(type, new Set());
    }
    this.typeIndex.get(type).add(key);
    
    // Update tag index
    for (const tag of indicator.metadata.tags) {
      if (!this.tagIndex.has(tag)) {
        this.tagIndex.set(tag, new Set());
      }
      this.tagIndex.get(tag).add(key);
    }
    
    this.stats.added++;
    
    // Cleanup if over limit
    if (this.indicators.size > this.config.maxIndicators) {
      this.evictExpired();
    }
    
    return indicator;
  }
  
  /**
   * Query indicator
   */
  query(type, value) {
    const key = `${type}:${value}`;
    const indicator = this.indicators.get(key);
    
    if (indicator && !indicator.isExpired()) {
      return indicator.export();
    }
    
    return null;
  }
  
  /**
   * Search indicators
   */
  search(criteria = {}) {
    let results = [];
    
    // Filter by type
    if (criteria.type && this.typeIndex.has(criteria.type)) {
      const keys = this.typeIndex.get(criteria.type);
      for (const key of keys) {
        const indicator = this.indicators.get(key);
        if (indicator) results.push(indicator);
      }
    } else if (criteria.tag && this.tagIndex.has(criteria.tag)) {
      const keys = this.tagIndex.get(criteria.tag);
      for (const key of keys) {
        const indicator = this.indicators.get(key);
        if (indicator) results.push(indicator);
      }
    } else {
      results = [...this.indicators.values()];
    }
    
    // Apply filters
    results = results.filter(i => {
      if (i.isExpired()) return false;
      if (criteria.minConfidence && i.metadata.confidence < criteria.minConfidence) return false;
      if (criteria.severity && i.metadata.severity !== criteria.severity) return false;
      if (criteria.priority && i.metadata.priority !== criteria.priority) return false;
      if (criteria.mitre && !i.metadata.mitre.includes(criteria.mitre)) return false;
      return true;
    });
    
    // Sort
    results.sort((a, b) => {
      const confDiff = b.metadata.confidence - a.metadata.confidence;
      if (confDiff !== 0) return confDiff;
      return b.sightings - a.sightings;
    });
    
    // Limit
    if (criteria.limit) {
      results = results.slice(0, criteria.limit);
    }
    
    return results.map(i => i.export());
  }
  
  /**
   * Correlate indicators
   */
  correlate(id1, id2, strength) {
    for (const [_, indicator] of this.indicators) {
      if (indicator.id === id1) {
        indicator.correlate(id2, strength);
        this.stats.correlations++;
      }
      if (indicator.id === id2) {
        indicator.correlate(id1, strength);
      }
    }
  }
  
  /**
   * Evict expired indicators
   */
  evictExpired() {
    let evicted = 0;
    
    for (const [key, indicator] of this.indicators) {
      if (indicator.isExpired()) {
        this.indicators.delete(key);
        this.typeIndex.get(indicator.type)?.delete(key);
        for (const tag of indicator.metadata.tags) {
          this.tagIndex.get(tag)?.delete(key);
        }
        evicted++;
      }
    }
    
    this.stats.expired += evicted;
    return evicted;
  }
  
  /**
   * Get feed summary
   */
  getSummary() {
    const byType = {};
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    const byPriority = {};
    
    for (const indicator of this.indicators.values()) {
      if (!indicator.isExpired()) {
        byType[indicator.type] = (byType[indicator.type] || 0) + 1;
        bySeverity[indicator.metadata.severity] = 
          (bySeverity[indicator.metadata.severity] || 0) + 1;
        byPriority[indicator.metadata.priority] = 
          (byPriority[indicator.metadata.priority] || 0) + 1;
      }
    }
    
    return {
      total: this.indicators.size,
      byType,
      bySeverity,
      byPriority,
      ...this.stats
    };
  }
}

/**
 * Threat Intelligence Protocol
 */
export const ThreatIntelligenceProtocol = {
  id: 'THR-001',
  name: 'Threat Intelligence Protocol',
  version: '1.0.0',
  category: 'dark-cognition',
  
  constants: {
    PHI,
    HB,
    THRESHOLD
  },
  
  priority: INTEL_PRIORITY,
  mitre: MITRE_TACTICS,
  
  createIndicator: (type, value, metadata) => new ThreatIndicator(type, value, metadata),
  createFeed: (config) => new ThreatIntelFeed(config)
};

export default ThreatIntelligenceProtocol;

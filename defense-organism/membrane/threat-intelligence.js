/**
 * Threat Intelligence Aggregator - Dark Layer Intelligence
 * 
 * Aggregates threat intelligence from multiple sources and correlates
 * patterns across the shadow memory system.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Intelligence source types
 */
export const INTEL_SOURCES = {
  INTERNAL: 'internal',       // Shadow memory observations
  SANDLAND: 'sandland',       // Simulation learnings
  BEHAVIORAL: 'behavioral',   // Behavioral models
  REPUTATION: 'reputation',   // Reputation scores
  PATTERN: 'pattern',         // Emerging patterns
  CORRELATION: 'correlation'  // Cross-source correlations
};

/**
 * Threat confidence levels
 */
export const CONFIDENCE_LEVELS = {
  CONFIRMED: { min: 0.9, label: 'confirmed' },
  HIGH: { min: 0.7, label: 'high' },
  MEDIUM: { min: 0.5, label: 'medium' },
  LOW: { min: 0.3, label: 'low' },
  SPECULATIVE: { min: 0, label: 'speculative' }
};

/**
 * IOC (Indicator of Compromise) types
 */
export const IOC_TYPES = {
  IP_ADDRESS: 'ip',
  USER_AGENT: 'ua',
  PATH_PATTERN: 'path',
  HEADER_SIGNATURE: 'header',
  BEHAVIOR_HASH: 'behavior',
  TIMING_PATTERN: 'timing',
  PAYLOAD_HASH: 'payload'
};

/**
 * Threat Intelligence Entry
 */
export class ThreatIntelEntry {
  constructor(type, value, metadata = {}) {
    this.id = crypto.randomUUID();
    this.type = type;
    this.value = value;
    this.metadata = metadata;
    
    this.intel = {
      sources: new Set(),
      confidence: 0,
      severity: 'unknown',
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      sightings: 0,
      tags: new Set(),
      mitreTactics: [],
      relatedIOCs: []
    };
  }
  
  /**
   * Add intelligence from a source
   */
  addIntel(source, confidence, tags = []) {
    this.intel.sources.add(source);
    this.intel.sightings++;
    this.intel.lastSeen = Date.now();
    
    // Update confidence (weighted average)
    const weight = 1 / this.intel.sightings;
    this.intel.confidence = this.intel.confidence * (1 - weight) + confidence * weight;
    
    // Add tags
    for (const tag of tags) {
      this.intel.tags.add(tag);
    }
    
    // Update severity based on confidence
    this.updateSeverity();
  }
  
  /**
   * Update severity classification
   */
  updateSeverity() {
    const conf = this.intel.confidence;
    const sightings = this.intel.sightings;
    
    if (conf > 0.8 && sightings > 10) {
      this.intel.severity = 'critical';
    } else if (conf > 0.6 && sightings > 5) {
      this.intel.severity = 'high';
    } else if (conf > 0.4) {
      this.intel.severity = 'medium';
    } else {
      this.intel.severity = 'low';
    }
  }
  
  /**
   * Link to related IOC
   */
  linkIOC(iocId) {
    if (!this.intel.relatedIOCs.includes(iocId)) {
      this.intel.relatedIOCs.push(iocId);
    }
  }
  
  /**
   * Get confidence level
   */
  getConfidenceLevel() {
    for (const [level, config] of Object.entries(CONFIDENCE_LEVELS)) {
      if (this.intel.confidence >= config.min) {
        return config.label;
      }
    }
    return 'unknown';
  }
  
  /**
   * Export for sharing
   */
  export() {
    return {
      id: this.id,
      type: this.type,
      value: this.value,
      confidence: this.intel.confidence,
      confidenceLevel: this.getConfidenceLevel(),
      severity: this.intel.severity,
      sources: [...this.intel.sources],
      tags: [...this.intel.tags],
      sightings: this.intel.sightings,
      firstSeen: this.intel.firstSeen,
      lastSeen: this.intel.lastSeen,
      mitreTactics: this.intel.mitreTactics,
      relatedIOCs: this.intel.relatedIOCs
    };
  }
}

/**
 * Threat Intelligence Aggregator
 */
export class ThreatIntelligenceAggregator {
  constructor(config = {}) {
    this.config = {
      maxEntries: config.maxEntries || 100000,
      correlationThreshold: config.correlationThreshold || 0.6,
      decayInterval: config.decayInterval || 3600000, // 1 hour
      minConfidenceToKeep: config.minConfidenceToKeep || 0.1,
      ...config
    };
    
    // Intelligence stores by type
    this.stores = {};
    for (const type of Object.values(IOC_TYPES)) {
      this.stores[type] = new Map();
    }
    
    // Correlation graph
    this.correlations = new Map();
    
    // Campaign tracking
    this.campaigns = new Map();
    
    // Statistics
    this.stats = {
      totalEntries: 0,
      totalSightings: 0,
      correlationsFound: 0,
      campaignsIdentified: 0
    };
  }
  
  /**
   * Ingest intelligence
   */
  ingest(type, value, source, confidence, metadata = {}) {
    const store = this.stores[type];
    if (!store) return null;
    
    // Hash the value for lookup
    const hash = this.hashValue(type, value);
    
    let entry = store.get(hash);
    
    if (!entry) {
      entry = new ThreatIntelEntry(type, value, metadata);
      store.set(hash, entry);
      this.stats.totalEntries++;
    }
    
    entry.addIntel(source, confidence, metadata.tags || []);
    this.stats.totalSightings++;
    
    // Add MITRE tactics if provided
    if (metadata.mitreTactics) {
      entry.intel.mitreTactics.push(...metadata.mitreTactics);
    }
    
    // Look for correlations
    this.findCorrelations(entry, metadata);
    
    return entry;
  }
  
  /**
   * Query intelligence
   */
  query(type, value) {
    const store = this.stores[type];
    if (!store) return null;
    
    const hash = this.hashValue(type, value);
    const entry = store.get(hash);
    
    if (entry) {
      entry.intel.sightings++;
      entry.intel.lastSeen = Date.now();
      return entry.export();
    }
    
    return null;
  }
  
  /**
   * Search intelligence by criteria
   */
  search(criteria = {}) {
    const results = [];
    
    for (const [type, store] of Object.entries(this.stores)) {
      if (criteria.type && criteria.type !== type) continue;
      
      for (const entry of store.values()) {
        if (this.matchesCriteria(entry, criteria)) {
          results.push(entry.export());
        }
      }
    }
    
    // Sort by confidence
    results.sort((a, b) => b.confidence - a.confidence);
    
    // Limit results
    if (criteria.limit) {
      return results.slice(0, criteria.limit);
    }
    
    return results;
  }
  
  /**
   * Match entry against search criteria
   */
  matchesCriteria(entry, criteria) {
    if (criteria.minConfidence && entry.intel.confidence < criteria.minConfidence) {
      return false;
    }
    
    if (criteria.severity && entry.intel.severity !== criteria.severity) {
      return false;
    }
    
    if (criteria.tag && !entry.intel.tags.has(criteria.tag)) {
      return false;
    }
    
    if (criteria.source && !entry.intel.sources.has(criteria.source)) {
      return false;
    }
    
    if (criteria.since && entry.intel.lastSeen < criteria.since) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Find correlations between IOCs
   */
  findCorrelations(entry, metadata) {
    // Look for session-based correlations
    if (metadata.sessionId) {
      const sessionKey = `session:${metadata.sessionId}`;
      
      if (!this.correlations.has(sessionKey)) {
        this.correlations.set(sessionKey, new Set());
      }
      
      const sessionIOCs = this.correlations.get(sessionKey);
      
      // Link all IOCs in the same session
      for (const existingId of sessionIOCs) {
        entry.linkIOC(existingId);
        this.stats.correlationsFound++;
      }
      
      sessionIOCs.add(entry.id);
    }
    
    // Look for timing-based correlations
    if (metadata.timestamp) {
      const timeWindow = 60000; // 1 minute
      const timeKey = `time:${Math.floor(metadata.timestamp / timeWindow)}`;
      
      if (!this.correlations.has(timeKey)) {
        this.correlations.set(timeKey, new Set());
      }
      
      const timeIOCs = this.correlations.get(timeKey);
      
      // Check for pattern overlap
      for (const existingId of timeIOCs) {
        const existingEntry = this.findEntryById(existingId);
        if (existingEntry && this.areCorrelated(entry, existingEntry)) {
          entry.linkIOC(existingId);
          existingEntry.linkIOC(entry.id);
          this.stats.correlationsFound++;
        }
      }
      
      timeIOCs.add(entry.id);
    }
    
    // Detect campaigns
    this.detectCampaign(entry);
  }
  
  /**
   * Check if two entries are correlated
   */
  areCorrelated(entry1, entry2) {
    // Same source
    const sharedSources = [...entry1.intel.sources]
      .filter(s => entry2.intel.sources.has(s));
    if (sharedSources.length > 0) return true;
    
    // Same tags
    const sharedTags = [...entry1.intel.tags]
      .filter(t => entry2.intel.tags.has(t));
    if (sharedTags.length >= 2) return true;
    
    // Similar timing
    const timeDiff = Math.abs(entry1.intel.lastSeen - entry2.intel.lastSeen);
    if (timeDiff < 10000) return true; // 10 seconds
    
    return false;
  }
  
  /**
   * Detect campaign patterns
   */
  detectCampaign(entry) {
    // Look for clusters of related IOCs
    if (entry.intel.relatedIOCs.length >= 3) {
      const campaignId = this.generateCampaignId(entry);
      
      if (!this.campaigns.has(campaignId)) {
        this.campaigns.set(campaignId, {
          id: campaignId,
          created: Date.now(),
          iocs: new Set(),
          confidence: 0,
          tags: new Set()
        });
        this.stats.campaignsIdentified++;
      }
      
      const campaign = this.campaigns.get(campaignId);
      campaign.iocs.add(entry.id);
      
      for (const iocId of entry.intel.relatedIOCs) {
        campaign.iocs.add(iocId);
      }
      
      for (const tag of entry.intel.tags) {
        campaign.tags.add(tag);
      }
      
      // Update campaign confidence
      campaign.confidence = Math.min(1, campaign.iocs.size * 0.1);
    }
  }
  
  /**
   * Generate campaign ID
   */
  generateCampaignId(entry) {
    const tags = [...entry.intel.tags].sort().join(',');
    const sources = [...entry.intel.sources].sort().join(',');
    return `campaign:${this.hashValue('campaign', tags + sources)}`;
  }
  
  /**
   * Find entry by ID
   */
  findEntryById(id) {
    for (const store of Object.values(this.stores)) {
      for (const entry of store.values()) {
        if (entry.id === id) return entry;
      }
    }
    return null;
  }
  
  /**
   * Hash value for lookup
   */
  hashValue(type, value) {
    const str = `${type}:${JSON.stringify(value)}`;
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Get threat feed
   */
  getThreatFeed(options = {}) {
    const feed = {
      generated: Date.now(),
      entries: [],
      campaigns: [],
      stats: this.getStats()
    };
    
    // Get high-confidence threats
    const threats = this.search({
      minConfidence: options.minConfidence || 0.6,
      limit: options.limit || 100
    });
    
    feed.entries = threats;
    
    // Include active campaigns
    for (const campaign of this.campaigns.values()) {
      if (campaign.confidence > 0.5) {
        feed.campaigns.push({
          id: campaign.id,
          iocCount: campaign.iocs.size,
          confidence: campaign.confidence,
          tags: [...campaign.tags]
        });
      }
    }
    
    return feed;
  }
  
  /**
   * Decay old intelligence
   */
  decay() {
    const now = Date.now();
    let decayed = 0;
    let removed = 0;
    
    for (const store of Object.values(this.stores)) {
      for (const [hash, entry] of store) {
        const age = now - entry.intel.lastSeen;
        const decayFactor = Math.exp(-age / (this.config.decayInterval * PHI));
        
        entry.intel.confidence *= decayFactor;
        decayed++;
        
        if (entry.intel.confidence < this.config.minConfidenceToKeep) {
          store.delete(hash);
          removed++;
          this.stats.totalEntries--;
        }
      }
    }
    
    // Cleanup old correlations
    for (const [key, iocs] of this.correlations) {
      if (iocs.size === 0) {
        this.correlations.delete(key);
      }
    }
    
    return { decayed, removed };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const byType = {};
    const bySeverity = { critical: 0, high: 0, medium: 0, low: 0 };
    
    for (const [type, store] of Object.entries(this.stores)) {
      byType[type] = store.size;
      
      for (const entry of store.values()) {
        bySeverity[entry.intel.severity] = 
          (bySeverity[entry.intel.severity] || 0) + 1;
      }
    }
    
    return {
      ...this.stats,
      byType,
      bySeverity,
      activeCampaigns: this.campaigns.size,
      correlationGroups: this.correlations.size
    };
  }
}

export default ThreatIntelligenceAggregator;

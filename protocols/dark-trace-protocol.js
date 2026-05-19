/**
 * Dark Trace Protocol (DRK-007)
 * 
 * Internal tracing for dark layer operations that never emits
 * to external observability systems.
 * 
 * Protocol ID: DRK-007
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Trace levels
 */
export const TRACE_LEVELS = {
  CRITICAL: 0,
  ERROR: 1,
  WARN: 2,
  INFO: 3,
  DEBUG: 4,
  TRACE: 5
};

/**
 * Trace categories
 */
export const TRACE_CATEGORIES = {
  MEMBRANE: 'membrane',
  SHADOW: 'shadow',
  NETWORK: 'network',
  CIPHER: 'cipher',
  THREAT: 'threat',
  INTERNAL: 'internal'
};

/**
 * Dark Trace Entry
 */
export class DarkTraceEntry {
  constructor(level, category, message, data = {}) {
    this.id = `trace-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.timestamp = Date.now();
    this.level = level;
    this.category = category;
    this.message = message;
    this.data = data;
    this.phi = this.computePhi();
  }
  
  computePhi() {
    const str = `${this.level}:${this.category}:${this.message}`;
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
}

/**
 * Dark Trace Buffer
 */
export class DarkTraceBuffer {
  constructor(config = {}) {
    this.config = {
      maxEntries: config.maxEntries || 10000,
      minLevel: config.minLevel ?? TRACE_LEVELS.INFO,
      retention: config.retention || 3600000, // 1 hour
      ...config
    };
    
    this.entries = [];
    this.stats = {
      total: 0,
      byLevel: {},
      byCategory: {}
    };
  }
  
  /**
   * Add trace entry
   */
  trace(level, category, message, data = {}) {
    if (level > this.config.minLevel) return null;
    
    const entry = new DarkTraceEntry(level, category, message, data);
    
    this.entries.push(entry);
    this.stats.total++;
    this.stats.byLevel[level] = (this.stats.byLevel[level] || 0) + 1;
    this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
    
    // Enforce max entries
    while (this.entries.length > this.config.maxEntries) {
      this.entries.shift();
    }
    
    // Cleanup expired
    this.cleanup();
    
    return entry;
  }
  
  /**
   * Convenience methods
   */
  critical(category, message, data) {
    return this.trace(TRACE_LEVELS.CRITICAL, category, message, data);
  }
  
  error(category, message, data) {
    return this.trace(TRACE_LEVELS.ERROR, category, message, data);
  }
  
  warn(category, message, data) {
    return this.trace(TRACE_LEVELS.WARN, category, message, data);
  }
  
  info(category, message, data) {
    return this.trace(TRACE_LEVELS.INFO, category, message, data);
  }
  
  debug(category, message, data) {
    return this.trace(TRACE_LEVELS.DEBUG, category, message, data);
  }
  
  /**
   * Query traces
   */
  query(criteria = {}) {
    let results = [...this.entries];
    
    if (criteria.level !== undefined) {
      results = results.filter(e => e.level <= criteria.level);
    }
    
    if (criteria.category) {
      results = results.filter(e => e.category === criteria.category);
    }
    
    if (criteria.since) {
      results = results.filter(e => e.timestamp >= criteria.since);
    }
    
    if (criteria.until) {
      results = results.filter(e => e.timestamp <= criteria.until);
    }
    
    if (criteria.search) {
      const pattern = new RegExp(criteria.search, 'i');
      results = results.filter(e => pattern.test(e.message));
    }
    
    if (criteria.limit) {
      results = results.slice(-criteria.limit);
    }
    
    return results;
  }
  
  /**
   * Cleanup expired entries
   */
  cleanup() {
    const cutoff = Date.now() - this.config.retention;
    this.entries = this.entries.filter(e => e.timestamp > cutoff);
  }
  
  /**
   * Clear all entries
   */
  clear() {
    this.entries = [];
    this.stats = { total: 0, byLevel: {}, byCategory: {} };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      current: this.entries.length,
      oldestTimestamp: this.entries[0]?.timestamp,
      newestTimestamp: this.entries[this.entries.length - 1]?.timestamp
    };
  }
  
  /**
   * Export for internal analysis (never for external telemetry)
   */
  export() {
    return {
      entries: this.entries.map(e => ({
        id: e.id,
        timestamp: e.timestamp,
        level: e.level,
        category: e.category,
        message: e.message,
        phi: e.phi
      })),
      stats: this.getStats()
    };
  }
}

/**
 * Dark Trace Protocol
 */
export const DarkTraceProtocol = {
  id: 'DRK-007',
  name: 'Dark Trace Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  levels: TRACE_LEVELS,
  categories: TRACE_CATEGORIES,
  
  createBuffer: (config) => new DarkTraceBuffer(config),
  createEntry: (level, category, message, data) => new DarkTraceEntry(level, category, message, data)
};

export default DarkTraceProtocol;

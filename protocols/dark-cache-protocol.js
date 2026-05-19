/**
 * Dark Cache Protocol (DRK-009)
 * 
 * High-performance caching for dark layer operations.
 * Never logged, never observed, purely internal.
 * 
 * Protocol ID: DRK-009
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Cache strategies
 */
export const CACHE_STRATEGIES = {
  LRU: 'lru',
  LFU: 'lfu',
  TTL: 'ttl',
  FIFO: 'fifo',
  ADAPTIVE: 'adaptive'
};

/**
 * Cache tiers
 */
export const CACHE_TIERS = {
  HOT: 'hot',
  WARM: 'warm',
  COLD: 'cold'
};

/**
 * Cache Entry
 */
export class CacheEntry {
  constructor(key, value, options = {}) {
    this.key = key;
    this.value = value;
    this.created = Date.now();
    this.accessed = Date.now();
    this.modified = Date.now();
    this.accessCount = 0;
    this.ttl = options.ttl || 0;
    this.tier = CACHE_TIERS.HOT;
    this.size = this.computeSize();
    this.phi = this.computePhi();
  }
  
  computeSize() {
    const str = JSON.stringify(this.value);
    return str ? str.length : 0;
  }
  
  computePhi() {
    const str = `${this.key}:${JSON.stringify(this.value)}`;
    let sum = 0;
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  access() {
    this.accessed = Date.now();
    this.accessCount++;
    this.updateTier();
  }
  
  updateTier() {
    if (this.accessCount > 100) {
      this.tier = CACHE_TIERS.HOT;
    } else if (this.accessCount > 10) {
      this.tier = CACHE_TIERS.WARM;
    } else {
      this.tier = CACHE_TIERS.COLD;
    }
  }
  
  isExpired() {
    if (this.ttl === 0) return false;
    return Date.now() - this.created > this.ttl;
  }
}

/**
 * Dark Cache
 */
export class DarkCache {
  constructor(config = {}) {
    this.config = {
      maxSize: config.maxSize || 1000,
      maxBytes: config.maxBytes || 10 * 1024 * 1024, // 10MB
      strategy: config.strategy || CACHE_STRATEGIES.LRU,
      defaultTTL: config.defaultTTL || 0,
      ...config
    };
    
    this.cache = new Map();
    this.totalBytes = 0;
    
    this.stats = {
      hits: 0,
      misses: 0,
      evictions: 0,
      sets: 0
    };
  }
  
  /**
   * Get value from cache
   */
  get(key) {
    const entry = this.cache.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return undefined;
    }
    
    if (entry.isExpired()) {
      this.delete(key);
      this.stats.misses++;
      return undefined;
    }
    
    entry.access();
    this.stats.hits++;
    
    return entry.value;
  }
  
  /**
   * Set value in cache
   */
  set(key, value, options = {}) {
    const ttl = options.ttl ?? this.config.defaultTTL;
    
    // Remove existing entry if present
    if (this.cache.has(key)) {
      this.delete(key);
    }
    
    const entry = new CacheEntry(key, value, { ttl });
    
    // Check capacity
    while (this.cache.size >= this.config.maxSize || 
           this.totalBytes + entry.size > this.config.maxBytes) {
      if (!this.evict()) break;
    }
    
    this.cache.set(key, entry);
    this.totalBytes += entry.size;
    this.stats.sets++;
    
    return { key, size: entry.size, phi: entry.phi };
  }
  
  /**
   * Delete from cache
   */
  delete(key) {
    const entry = this.cache.get(key);
    if (entry) {
      this.totalBytes -= entry.size;
      this.cache.delete(key);
      return true;
    }
    return false;
  }
  
  /**
   * Check if key exists
   */
  has(key) {
    const entry = this.cache.get(key);
    if (!entry) return false;
    if (entry.isExpired()) {
      this.delete(key);
      return false;
    }
    return true;
  }
  
  /**
   * Evict based on strategy
   */
  evict() {
    if (this.cache.size === 0) return false;
    
    let victim = null;
    
    switch (this.config.strategy) {
      case CACHE_STRATEGIES.LRU:
        victim = this.findLRU();
        break;
      case CACHE_STRATEGIES.LFU:
        victim = this.findLFU();
        break;
      case CACHE_STRATEGIES.FIFO:
        victim = this.findFIFO();
        break;
      case CACHE_STRATEGIES.ADAPTIVE:
        victim = this.findAdaptive();
        break;
      default:
        victim = this.findLRU();
    }
    
    if (victim) {
      this.delete(victim);
      this.stats.evictions++;
      return true;
    }
    
    return false;
  }
  
  /**
   * Find LRU entry
   */
  findLRU() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.accessed < oldestTime) {
        oldestTime = entry.accessed;
        oldest = key;
      }
    }
    
    return oldest;
  }
  
  /**
   * Find LFU entry
   */
  findLFU() {
    let least = null;
    let leastCount = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.accessCount < leastCount) {
        leastCount = entry.accessCount;
        least = key;
      }
    }
    
    return least;
  }
  
  /**
   * Find FIFO entry
   */
  findFIFO() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of this.cache) {
      if (entry.created < oldestTime) {
        oldestTime = entry.created;
        oldest = key;
      }
    }
    
    return oldest;
  }
  
  /**
   * Find adaptive victim (phi-weighted)
   */
  findAdaptive() {
    let victim = null;
    let worstScore = Infinity;
    
    const now = Date.now();
    
    for (const [key, entry] of this.cache) {
      // Score based on recency, frequency, and size
      const recency = 1 / (1 + (now - entry.accessed) / HB);
      const frequency = Math.log(1 + entry.accessCount);
      const sizeWeight = 1 / (1 + entry.size / 1000);
      
      const score = (recency * PHI + frequency) * sizeWeight;
      
      if (score < worstScore) {
        worstScore = score;
        victim = key;
      }
    }
    
    return victim;
  }
  
  /**
   * Get or set (cache-aside pattern)
   */
  async getOrSet(key, factory, options = {}) {
    const existing = this.get(key);
    if (existing !== undefined) {
      return existing;
    }
    
    const value = typeof factory === 'function' ? await factory() : factory;
    this.set(key, value, options);
    
    return value;
  }
  
  /**
   * Clear all entries
   */
  clear() {
    this.cache.clear();
    this.totalBytes = 0;
  }
  
  /**
   * Cleanup expired entries
   */
  cleanup() {
    let cleaned = 0;
    
    for (const [key, entry] of this.cache) {
      if (entry.isExpired()) {
        this.delete(key);
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const tierCounts = { hot: 0, warm: 0, cold: 0 };
    
    for (const entry of this.cache.values()) {
      tierCounts[entry.tier]++;
    }
    
    return {
      ...this.stats,
      size: this.cache.size,
      bytes: this.totalBytes,
      hitRate: this.stats.hits + this.stats.misses > 0
        ? (this.stats.hits / (this.stats.hits + this.stats.misses) * 100).toFixed(1) + '%'
        : 'N/A',
      tiers: tierCounts
    };
  }
}

/**
 * Dark Cache Protocol
 */
export const DarkCacheProtocol = {
  id: 'DRK-009',
  name: 'Dark Cache Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  strategies: CACHE_STRATEGIES,
  tiers: CACHE_TIERS,
  
  createCache: (config) => new DarkCache(config),
  createEntry: (key, value, options) => new CacheEntry(key, value, options)
};

export default DarkCacheProtocol;

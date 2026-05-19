/**
 * Shadow Memory Protocol (SHM-001)
 * 
 * Protocol for managing the organism's shadow memory - persistent state
 * that exists in the dark layer without generating observable traces.
 * 
 * Protocol ID: SHM-001
 * Category: Dark Cognition
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Memory tiers
 */
export const MEMORY_TIERS = {
  EPHEMERAL: 'ephemeral',     // Session-scoped, sub-minute TTL
  SHORT_TERM: 'short-term',   // Hours
  WORKING: 'working',         // Days  
  LONG_TERM: 'long-term',     // Weeks
  PERMANENT: 'permanent'      // Never expires
};

/**
 * Memory categories
 */
export const MEMORY_CATEGORIES = {
  THREAT_SIGNATURE: 'threat-signature',
  BEHAVIORAL_MODEL: 'behavioral-model',
  PATTERN_TEMPLATE: 'pattern-template',
  AGENT_PROFILE: 'agent-profile',
  REPUTATION_SCORE: 'reputation-score',
  SESSION_STATE: 'session-state',
  ATTACK_HISTORY: 'attack-history'
};

/**
 * Memory operations
 */
export const MEMORY_OPERATIONS = {
  STORE: 'store',
  RETRIEVE: 'retrieve',
  UPDATE: 'update',
  DECAY: 'decay',
  CONSOLIDATE: 'consolidate',
  FORGET: 'forget'
};

/**
 * Shadow Memory Entry
 */
export class ShadowMemoryEntry {
  constructor(key, value, config = {}) {
    this.key = key;
    this.value = value;
    this.tier = config.tier || MEMORY_TIERS.SHORT_TERM;
    this.category = config.category || MEMORY_CATEGORIES.SESSION_STATE;
    
    this.metadata = {
      created: Date.now(),
      updated: Date.now(),
      accessed: Date.now(),
      accessCount: 0,
      decayRate: config.decayRate || 1 / PHI,
      strength: config.initialStrength || 1.0,
      phi: this.computePhi()
    };
  }
  
  /**
   * Compute phi-signature for verification
   */
  computePhi() {
    const keySum = [...this.key].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((keySum * PHI) % 1).toFixed(6);
  }
  
  /**
   * Access the memory (updates statistics)
   */
  access() {
    this.metadata.accessed = Date.now();
    this.metadata.accessCount++;
    // Strengthen on access
    this.metadata.strength = Math.min(1, this.metadata.strength + 0.1);
  }
  
  /**
   * Apply decay to memory strength
   */
  decay() {
    const age = Date.now() - this.metadata.updated;
    const decayFactor = Math.exp(-age / (HB * 1000));
    this.metadata.strength *= decayFactor;
    return this.metadata.strength;
  }
  
  /**
   * Check if memory is still valid
   */
  isValid() {
    return this.metadata.strength > 0.01;
  }
  
  /**
   * Serialize for storage
   */
  serialize() {
    return JSON.stringify({
      key: this.key,
      value: this.value,
      tier: this.tier,
      category: this.category,
      metadata: this.metadata
    });
  }
  
  /**
   * Deserialize from storage
   */
  static deserialize(data) {
    const parsed = JSON.parse(data);
    const entry = new ShadowMemoryEntry(parsed.key, parsed.value, {
      tier: parsed.tier,
      category: parsed.category
    });
    entry.metadata = parsed.metadata;
    return entry;
  }
}

/**
 * Shadow Memory Manager
 */
export class ShadowMemoryManager {
  constructor(config = {}) {
    this.config = {
      maxEntries: config.maxEntries || 100000,
      consolidationInterval: config.consolidationInterval || 3600000, // 1 hour
      decayInterval: config.decayInterval || 60000, // 1 minute
      ...config
    };
    
    this.memories = new Map();
    this.indices = {
      byCategory: new Map(),
      byTier: new Map(),
      byStrength: [] // Sorted list for quick eviction
    };
    
    this.stats = {
      stores: 0,
      retrieves: 0,
      hits: 0,
      misses: 0,
      evictions: 0,
      consolidations: 0
    };
  }
  
  /**
   * Store a memory
   */
  store(key, value, config = {}) {
    this.stats.stores++;
    
    const entry = new ShadowMemoryEntry(key, value, config);
    
    // Check capacity
    if (this.memories.size >= this.config.maxEntries) {
      this.evictWeakest();
    }
    
    this.memories.set(key, entry);
    this.updateIndices(entry);
    
    return {
      stored: true,
      key,
      phi: entry.metadata.phi,
      tier: entry.tier
    };
  }
  
  /**
   * Retrieve a memory
   */
  retrieve(key) {
    this.stats.retrieves++;
    
    const entry = this.memories.get(key);
    
    if (!entry) {
      this.stats.misses++;
      return null;
    }
    
    // Apply decay
    entry.decay();
    
    // Check if still valid
    if (!entry.isValid()) {
      this.forget(key);
      this.stats.misses++;
      return null;
    }
    
    // Update access stats
    entry.access();
    this.stats.hits++;
    
    return entry.value;
  }
  
  /**
   * Update a memory
   */
  update(key, value, mergeFn = null) {
    const entry = this.memories.get(key);
    
    if (!entry) {
      return this.store(key, value);
    }
    
    if (mergeFn) {
      entry.value = mergeFn(entry.value, value);
    } else {
      entry.value = value;
    }
    
    entry.metadata.updated = Date.now();
    entry.metadata.strength = Math.min(1, entry.metadata.strength + 0.2);
    
    return {
      updated: true,
      key,
      strength: entry.metadata.strength
    };
  }
  
  /**
   * Forget a memory
   */
  forget(key) {
    const entry = this.memories.get(key);
    if (entry) {
      this.removeFromIndices(entry);
      this.memories.delete(key);
    }
    return { forgotten: true, key };
  }
  
  /**
   * Query memories by criteria
   */
  query(criteria = {}) {
    let results = [...this.memories.values()];
    
    // Filter by category
    if (criteria.category) {
      results = results.filter(e => e.category === criteria.category);
    }
    
    // Filter by tier
    if (criteria.tier) {
      results = results.filter(e => e.tier === criteria.tier);
    }
    
    // Filter by minimum strength
    if (criteria.minStrength) {
      results = results.filter(e => e.metadata.strength >= criteria.minStrength);
    }
    
    // Filter by age
    if (criteria.maxAge) {
      const cutoff = Date.now() - criteria.maxAge;
      results = results.filter(e => e.metadata.created > cutoff);
    }
    
    // Sort by strength
    results.sort((a, b) => b.metadata.strength - a.metadata.strength);
    
    // Limit results
    if (criteria.limit) {
      results = results.slice(0, criteria.limit);
    }
    
    return results.map(e => ({
      key: e.key,
      value: e.value,
      strength: e.metadata.strength,
      category: e.category,
      tier: e.tier
    }));
  }
  
  /**
   * Consolidate memories (merge similar, strengthen important)
   */
  consolidate() {
    this.stats.consolidations++;
    
    // Apply decay to all memories
    let decayed = 0;
    let forgotten = 0;
    
    for (const [key, entry] of this.memories) {
      entry.decay();
      decayed++;
      
      if (!entry.isValid()) {
        this.forget(key);
        forgotten++;
      }
    }
    
    // Promote strong short-term memories to working memory
    const promotions = this.promoteMemories();
    
    return {
      consolidated: true,
      decayed,
      forgotten,
      promoted: promotions,
      remaining: this.memories.size
    };
  }
  
  /**
   * Promote memories to higher tiers
   */
  promoteMemories() {
    let promotions = 0;
    
    for (const entry of this.memories.values()) {
      if (entry.metadata.strength > THRESHOLD) {
        if (entry.tier === MEMORY_TIERS.EPHEMERAL) {
          entry.tier = MEMORY_TIERS.SHORT_TERM;
          promotions++;
        } else if (entry.tier === MEMORY_TIERS.SHORT_TERM && entry.metadata.accessCount > 10) {
          entry.tier = MEMORY_TIERS.WORKING;
          promotions++;
        } else if (entry.tier === MEMORY_TIERS.WORKING && entry.metadata.accessCount > 100) {
          entry.tier = MEMORY_TIERS.LONG_TERM;
          promotions++;
        }
      }
    }
    
    return promotions;
  }
  
  /**
   * Evict weakest memory
   */
  evictWeakest() {
    let weakest = null;
    let weakestStrength = Infinity;
    
    for (const entry of this.memories.values()) {
      // Don't evict permanent memories
      if (entry.tier === MEMORY_TIERS.PERMANENT) continue;
      
      if (entry.metadata.strength < weakestStrength) {
        weakestStrength = entry.metadata.strength;
        weakest = entry;
      }
    }
    
    if (weakest) {
      this.forget(weakest.key);
      this.stats.evictions++;
    }
  }
  
  /**
   * Update indices
   */
  updateIndices(entry) {
    // Category index
    if (!this.indices.byCategory.has(entry.category)) {
      this.indices.byCategory.set(entry.category, new Set());
    }
    this.indices.byCategory.get(entry.category).add(entry.key);
    
    // Tier index
    if (!this.indices.byTier.has(entry.tier)) {
      this.indices.byTier.set(entry.tier, new Set());
    }
    this.indices.byTier.get(entry.tier).add(entry.key);
  }
  
  /**
   * Remove from indices
   */
  removeFromIndices(entry) {
    this.indices.byCategory.get(entry.category)?.delete(entry.key);
    this.indices.byTier.get(entry.tier)?.delete(entry.key);
  }
  
  /**
   * Get memory statistics
   */
  getStats() {
    return {
      ...this.stats,
      totalMemories: this.memories.size,
      hitRate: this.stats.retrieves > 0 
        ? (this.stats.hits / this.stats.retrieves * 100).toFixed(1) + '%'
        : 'N/A',
      byCategory: Object.fromEntries(
        [...this.indices.byCategory].map(([cat, keys]) => [cat, keys.size])
      ),
      byTier: Object.fromEntries(
        [...this.indices.byTier].map(([tier, keys]) => [tier, keys.size])
      )
    };
  }
}

/**
 * Shadow Memory Protocol
 */
export const ShadowMemoryProtocol = {
  id: 'SHM-001',
  name: 'Shadow Memory Protocol',
  version: '1.0.0',
  category: 'dark-cognition',
  
  constants: {
    PHI,
    HB,
    THRESHOLD
  },
  
  tiers: MEMORY_TIERS,
  categories: MEMORY_CATEGORIES,
  operations: MEMORY_OPERATIONS,
  
  createManager: (config) => new ShadowMemoryManager(config),
  createEntry: (key, value, config) => new ShadowMemoryEntry(key, value, config),
  
  // TTL defaults by tier (in milliseconds)
  ttlDefaults: {
    [MEMORY_TIERS.EPHEMERAL]: 30000,      // 30 seconds
    [MEMORY_TIERS.SHORT_TERM]: 3600000,   // 1 hour
    [MEMORY_TIERS.WORKING]: 86400000,     // 1 day
    [MEMORY_TIERS.LONG_TERM]: 604800000,  // 1 week
    [MEMORY_TIERS.PERMANENT]: Infinity
  }
};

export default ShadowMemoryProtocol;

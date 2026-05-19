/**
 * Shadow Memory System - Dark Layer Memory
 * 
 * Persistent memory that exists in the dark layer.
 * Stores patterns, threat signatures, and behavioral models
 * without logging or observable state.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Memory categories
 */
const MEMORY_CATEGORIES = {
  'threat-patterns': { ttl: 86400000, maxEntries: 10000 },    // 24h
  'behavioral-models': { ttl: 604800000, maxEntries: 1000 },  // 7 days
  'agent-fingerprints': { ttl: 3600000, maxEntries: 50000 },  // 1h
  'attack-signatures': { ttl: 2592000000, maxEntries: 5000 }, // 30 days
  'reputation-scores': { ttl: 86400000, maxEntries: 100000 }, // 24h
  'session-shadows': { ttl: 1800000, maxEntries: 10000 }      // 30 min
};

/**
 * Shadow Memory System
 */
export class ShadowMemorySystem {
  constructor(config = {}) {
    this.config = {
      maxMemoryMB: config.maxMemoryMB || 256,
      gcInterval: config.gcInterval || 60000, // 1 minute
      persistToKV: config.persistToKV !== false,
      kvBinding: config.kvBinding || null,
      ...config
    };
    
    // In-memory shadow storage (ephemeral)
    this.shadows = new Map();
    
    // Category-specific stores
    this.stores = {};
    for (const [category, settings] of Object.entries(MEMORY_CATEGORIES)) {
      this.stores[category] = {
        data: new Map(),
        settings,
        stats: { hits: 0, misses: 0, evictions: 0 }
      };
    }
    
    // Pattern recognition state
    this.patterns = {
      emerging: new Map(),
      confirmed: new Map(),
      decaying: new Map()
    };
    
    // Start garbage collection
    this.startGC();
  }
  
  /**
   * Store a shadow memory
   */
  async store(category, key, value, meta = {}) {
    const store = this.stores[category];
    if (!store) {
      throw new Error(`Unknown category: ${category}`);
    }
    
    const entry = {
      value,
      meta,
      storedAt: Date.now(),
      expiresAt: Date.now() + store.settings.ttl,
      accessCount: 0,
      lastAccess: Date.now(),
      phi: this.computePhiSignature(key, value)
    };
    
    // Check capacity
    if (store.data.size >= store.settings.maxEntries) {
      this.evictLRU(store);
    }
    
    store.data.set(key, entry);
    
    // Persist to KV if enabled
    if (this.config.persistToKV && this.config.kvBinding) {
      await this.persistToKV(category, key, entry);
    }
    
    return { stored: true, key, expiresAt: entry.expiresAt };
  }
  
  /**
   * Retrieve a shadow memory
   */
  async retrieve(category, key) {
    const store = this.stores[category];
    if (!store) {
      return null;
    }
    
    // Check local cache
    let entry = store.data.get(key);
    
    // Try KV if not in memory
    if (!entry && this.config.persistToKV && this.config.kvBinding) {
      entry = await this.retrieveFromKV(category, key);
      if (entry) {
        store.data.set(key, entry);
      }
    }
    
    if (!entry) {
      store.stats.misses++;
      return null;
    }
    
    // Check expiration
    if (Date.now() > entry.expiresAt) {
      store.data.delete(key);
      store.stats.evictions++;
      return null;
    }
    
    // Update access stats
    entry.accessCount++;
    entry.lastAccess = Date.now();
    store.stats.hits++;
    
    return entry.value;
  }
  
  /**
   * Record a threat pattern
   */
  recordPattern(patternId, pattern, confidence) {
    const existing = this.patterns.emerging.get(patternId) ||
                     this.patterns.confirmed.get(patternId);
    
    if (existing) {
      // Update existing pattern
      existing.occurrences++;
      existing.confidence = (existing.confidence + confidence) / 2;
      existing.lastSeen = Date.now();
      
      // Promote to confirmed if threshold met
      if (existing.confidence > THRESHOLD && existing.occurrences > 5) {
        this.patterns.confirmed.set(patternId, existing);
        this.patterns.emerging.delete(patternId);
      }
    } else {
      // New emerging pattern
      this.patterns.emerging.set(patternId, {
        pattern,
        confidence,
        occurrences: 1,
        firstSeen: Date.now(),
        lastSeen: Date.now()
      });
    }
  }
  
  /**
   * Query patterns matching criteria
   */
  queryPatterns(criteria = {}) {
    const results = [];
    
    // Search confirmed patterns
    for (const [id, pattern] of this.patterns.confirmed) {
      if (this.matchesCriteria(pattern, criteria)) {
        results.push({ id, ...pattern, status: 'confirmed' });
      }
    }
    
    // Include emerging if requested
    if (criteria.includeEmerging) {
      for (const [id, pattern] of this.patterns.emerging) {
        if (this.matchesCriteria(pattern, criteria)) {
          results.push({ id, ...pattern, status: 'emerging' });
        }
      }
    }
    
    // Sort by confidence
    return results.sort((a, b) => b.confidence - a.confidence);
  }
  
  /**
   * Store behavioral model
   */
  async storeBehavioralModel(agentId, model) {
    const modelHash = this.hashModel(model);
    
    return this.store('behavioral-models', agentId, {
      model,
      hash: modelHash,
      version: (await this.retrieve('behavioral-models', agentId))?.version + 1 || 1
    });
  }
  
  /**
   * Get behavioral model
   */
  async getBehavioralModel(agentId) {
    return this.retrieve('behavioral-models', agentId);
  }
  
  /**
   * Record agent fingerprint
   */
  async recordFingerprint(fingerprint) {
    const hash = this.hashFingerprint(fingerprint);
    
    const existing = await this.retrieve('agent-fingerprints', hash);
    
    if (existing) {
      existing.sightings++;
      existing.lastSeen = Date.now();
      existing.confidence = Math.min(1, existing.confidence + 0.1);
      await this.store('agent-fingerprints', hash, existing);
      return { known: true, ...existing };
    }
    
    const entry = {
      fingerprint,
      sightings: 1,
      firstSeen: Date.now(),
      lastSeen: Date.now(),
      confidence: 0.5,
      classification: null
    };
    
    await this.store('agent-fingerprints', hash, entry);
    return { known: false, ...entry };
  }
  
  /**
   * Record attack signature
   */
  async recordAttackSignature(signature, metadata) {
    const sigHash = this.hashSignature(signature);
    
    return this.store('attack-signatures', sigHash, {
      signature,
      metadata,
      severity: metadata.severity || 'medium',
      mitreTactics: metadata.mitreTactics || [],
      iocs: metadata.iocs || []
    });
  }
  
  /**
   * Update reputation score
   */
  async updateReputation(entityId, delta, reason) {
    const existing = await this.retrieve('reputation-scores', entityId) || {
      score: 0.5,
      history: []
    };
    
    // Apply delta with decay
    const newScore = Math.max(0, Math.min(1, existing.score + delta));
    
    existing.score = newScore;
    existing.history.push({
      delta,
      reason,
      timestamp: Date.now()
    });
    
    // Trim history
    if (existing.history.length > 100) {
      existing.history = existing.history.slice(-100);
    }
    
    await this.store('reputation-scores', entityId, existing);
    return existing;
  }
  
  /**
   * Get reputation score
   */
  async getReputation(entityId) {
    const rep = await this.retrieve('reputation-scores', entityId);
    return rep?.score ?? 0.5; // Neutral default
  }
  
  /**
   * Create session shadow (ephemeral session tracking)
   */
  async createSessionShadow(sessionId, initialState = {}) {
    return this.store('session-shadows', sessionId, {
      state: initialState,
      events: [],
      startTime: Date.now(),
      lastActivity: Date.now()
    });
  }
  
  /**
   * Update session shadow
   */
  async updateSessionShadow(sessionId, event) {
    const shadow = await this.retrieve('session-shadows', sessionId);
    if (!shadow) return null;
    
    shadow.events.push({
      ...event,
      timestamp: Date.now()
    });
    shadow.lastActivity = Date.now();
    
    // Analyze session for anomalies
    shadow.anomalyScore = this.computeSessionAnomalyScore(shadow);
    
    await this.store('session-shadows', sessionId, shadow);
    return shadow;
  }
  
  /**
   * Compute session anomaly score
   */
  computeSessionAnomalyScore(shadow) {
    let score = 0;
    
    // High event rate
    const duration = Date.now() - shadow.startTime;
    const eventRate = shadow.events.length / (duration / 1000);
    if (eventRate > 10) score += 0.3;
    if (eventRate > 50) score += 0.3;
    
    // Error patterns
    const errors = shadow.events.filter(e => e.type === 'error').length;
    if (errors > shadow.events.length * 0.5) score += 0.2;
    
    // Suspicious paths
    const suspiciousPaths = shadow.events.filter(e => 
      e.path?.includes('admin') || 
      e.path?.includes('.env') ||
      e.path?.includes('../')
    ).length;
    if (suspiciousPaths > 0) score += 0.2 * suspiciousPaths;
    
    return Math.min(1, score);
  }
  
  /**
   * Compute phi signature for verification
   */
  computePhiSignature(key, value) {
    const s = [...key].reduce((a, c) => a + c.charCodeAt(0), 0);
    const v = typeof value === 'string' ? [...value].reduce((a, c) => a + c.charCodeAt(0), 0) : 0;
    return ((s * PHI) + (v / PHI)) % 1;
  }
  
  /**
   * Hash fingerprint
   */
  hashFingerprint(fingerprint) {
    const str = JSON.stringify({
      ua: fingerprint.userAgent?.substring(0, 50),
      ip: fingerprint.ip?.split('.').slice(0, 2).join('.'),
      patterns: fingerprint.patterns?.slice(0, 5)
    });
    return this.simpleHash(str);
  }
  
  /**
   * Hash model
   */
  hashModel(model) {
    return this.simpleHash(JSON.stringify(model));
  }
  
  /**
   * Hash signature
   */
  hashSignature(signature) {
    return this.simpleHash(JSON.stringify(signature));
  }
  
  /**
   * Simple hash function
   */
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Match pattern against criteria
   */
  matchesCriteria(pattern, criteria) {
    if (criteria.minConfidence && pattern.confidence < criteria.minConfidence) {
      return false;
    }
    if (criteria.since && pattern.lastSeen < criteria.since) {
      return false;
    }
    return true;
  }
  
  /**
   * Evict least recently used entry
   */
  evictLRU(store) {
    let oldestKey = null;
    let oldestTime = Infinity;
    
    for (const [key, entry] of store.data) {
      if (entry.lastAccess < oldestTime) {
        oldestTime = entry.lastAccess;
        oldestKey = key;
      }
    }
    
    if (oldestKey) {
      store.data.delete(oldestKey);
      store.stats.evictions++;
    }
  }
  
  /**
   * Persist entry to KV
   */
  async persistToKV(category, key, entry) {
    if (!this.config.kvBinding) return;
    
    const kvKey = `shadow:${category}:${key}`;
    const ttl = Math.ceil(entry.expiresAt - Date.now()) / 1000;
    
    if (ttl > 0) {
      await this.config.kvBinding.put(kvKey, JSON.stringify(entry), {
        expirationTtl: ttl
      });
    }
  }
  
  /**
   * Retrieve entry from KV
   */
  async retrieveFromKV(category, key) {
    if (!this.config.kvBinding) return null;
    
    const kvKey = `shadow:${category}:${key}`;
    const data = await this.config.kvBinding.get(kvKey);
    
    if (data) {
      return JSON.parse(data);
    }
    return null;
  }
  
  /**
   * Start garbage collection
   */
  startGC() {
    // In Workers, we use a different approach
    // This is called periodically from the adapter
  }
  
  /**
   * Run garbage collection
   */
  gc() {
    const now = Date.now();
    let collected = 0;
    
    for (const store of Object.values(this.stores)) {
      for (const [key, entry] of store.data) {
        if (now > entry.expiresAt) {
          store.data.delete(key);
          store.stats.evictions++;
          collected++;
        }
      }
    }
    
    // Decay patterns
    for (const [id, pattern] of this.patterns.confirmed) {
      if (now - pattern.lastSeen > 86400000) { // 24h
        pattern.confidence *= 0.9;
        if (pattern.confidence < 0.3) {
          this.patterns.decaying.set(id, pattern);
          this.patterns.confirmed.delete(id);
        }
      }
    }
    
    // Remove decayed patterns
    for (const [id, pattern] of this.patterns.decaying) {
      if (pattern.confidence < 0.1) {
        this.patterns.decaying.delete(id);
        collected++;
      }
    }
    
    return collected;
  }
  
  /**
   * Get memory statistics
   */
  getStats() {
    const stats = {
      categories: {},
      patterns: {
        emerging: this.patterns.emerging.size,
        confirmed: this.patterns.confirmed.size,
        decaying: this.patterns.decaying.size
      },
      total: {
        entries: 0,
        hits: 0,
        misses: 0,
        evictions: 0
      }
    };
    
    for (const [category, store] of Object.entries(this.stores)) {
      stats.categories[category] = {
        entries: store.data.size,
        maxEntries: store.settings.maxEntries,
        ...store.stats
      };
      stats.total.entries += store.data.size;
      stats.total.hits += store.stats.hits;
      stats.total.misses += store.stats.misses;
      stats.total.evictions += store.stats.evictions;
    }
    
    stats.hitRate = stats.total.hits / (stats.total.hits + stats.total.misses) || 0;
    
    return stats;
  }
}

export default ShadowMemorySystem;

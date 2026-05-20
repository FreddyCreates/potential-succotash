/**
 * Dark Fingerprint Protocol (DRK-020)
 * 
 * Entity fingerprinting for the dark layer. Silent identification
 * of agents through behavioral and technical signatures.
 * 
 * Protocol ID: DRK-020
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Fingerprint types
 */
export const FINGERPRINT_TYPES = {
  BROWSER: 'browser',
  DEVICE: 'device',
  NETWORK: 'network',
  BEHAVIORAL: 'behavioral',
  COMPOSITE: 'composite'
};

/**
 * Fingerprint components
 */
export const FINGERPRINT_COMPONENTS = {
  USER_AGENT: 'userAgent',
  ACCEPT_LANGUAGE: 'acceptLanguage',
  TIMEZONE: 'timezone',
  SCREEN_RESOLUTION: 'screenResolution',
  PLUGINS: 'plugins',
  FONTS: 'fonts',
  WEBGL: 'webgl',
  CANVAS: 'canvas',
  AUDIO: 'audio',
  IP_CLASS: 'ipClass',
  TLS_FINGERPRINT: 'tlsFingerprint',
  TIMING_PATTERN: 'timingPattern'
};

/**
 * Fingerprint
 */
export class Fingerprint {
  constructor(type = FINGERPRINT_TYPES.COMPOSITE) {
    this.type = type;
    this.components = new Map();
    this.created = Date.now();
    this.hash = null;
  }
  
  /**
   * Set component value
   */
  setComponent(name, value) {
    this.components.set(name, {
      value,
      timestamp: Date.now()
    });
    this.hash = null; // Invalidate hash
    return this;
  }
  
  /**
   * Get component value
   */
  getComponent(name) {
    const comp = this.components.get(name);
    return comp ? comp.value : null;
  }
  
  /**
   * Compute fingerprint hash
   */
  computeHash() {
    if (this.hash) return this.hash;
    
    const values = [];
    for (const [name, comp] of [...this.components].sort((a, b) => a[0].localeCompare(b[0]))) {
      values.push(`${name}:${JSON.stringify(comp.value)}`);
    }
    
    const str = values.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    
    // Add phi signature
    this.hash = `fp-${Math.abs(hash).toString(36)}-${Math.floor(PHI * 1000).toString(36)}`;
    return this.hash;
  }
  
  /**
   * Compute similarity to another fingerprint
   */
  similarity(other) {
    const allKeys = new Set([...this.components.keys(), ...other.components.keys()]);
    let matches = 0;
    let total = allKeys.size;
    
    for (const key of allKeys) {
      const v1 = this.getComponent(key);
      const v2 = other.getComponent(key);
      
      if (v1 !== null && v2 !== null) {
        if (this.valuesMatch(v1, v2)) {
          matches++;
        }
      }
    }
    
    return total > 0 ? matches / total : 0;
  }
  
  valuesMatch(v1, v2) {
    if (v1 === v2) return true;
    if (typeof v1 !== typeof v2) return false;
    if (typeof v1 === 'object') {
      return JSON.stringify(v1) === JSON.stringify(v2);
    }
    return false;
  }
  
  /**
   * Serialize
   */
  toJSON() {
    return {
      type: this.type,
      hash: this.computeHash(),
      components: Object.fromEntries(this.components),
      created: this.created
    };
  }
  
  /**
   * Deserialize
   */
  static fromJSON(data) {
    const fp = new Fingerprint(data.type);
    fp.created = data.created;
    
    for (const [name, comp] of Object.entries(data.components)) {
      fp.components.set(name, comp);
    }
    
    return fp;
  }
}

/**
 * Fingerprint Store
 */
export class FingerprintStore {
  constructor(config = {}) {
    this.config = {
      maxFingerprints: config.maxFingerprints || 100000,
      similarityThreshold: config.similarityThreshold || 0.8,
      ...config
    };
    
    this.fingerprints = new Map();
    this.entityMap = new Map(); // hash -> entity IDs
    
    this.stats = {
      stored: 0,
      matches: 0,
      queries: 0
    };
  }
  
  /**
   * Store fingerprint
   */
  store(fingerprint, entityId = null) {
    const hash = fingerprint.computeHash();
    
    this.fingerprints.set(hash, fingerprint);
    
    if (entityId) {
      if (!this.entityMap.has(hash)) {
        this.entityMap.set(hash, new Set());
      }
      this.entityMap.get(hash).add(entityId);
    }
    
    // Enforce max size
    while (this.fingerprints.size > this.config.maxFingerprints) {
      const oldest = this.fingerprints.keys().next().value;
      this.fingerprints.delete(oldest);
      this.entityMap.delete(oldest);
    }
    
    this.stats.stored++;
    
    return hash;
  }
  
  /**
   * Lookup fingerprint
   */
  lookup(hash) {
    this.stats.queries++;
    return this.fingerprints.get(hash);
  }
  
  /**
   * Find similar fingerprints
   */
  findSimilar(fingerprint, limit = 10) {
    this.stats.queries++;
    const results = [];
    
    for (const [hash, stored] of this.fingerprints) {
      const sim = fingerprint.similarity(stored);
      
      if (sim >= this.config.similarityThreshold) {
        results.push({
          hash,
          fingerprint: stored,
          similarity: sim,
          entities: [...(this.entityMap.get(hash) || [])]
        });
      }
    }
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    
    if (results.length > 0) {
      this.stats.matches++;
    }
    
    return results.slice(0, limit);
  }
  
  /**
   * Match fingerprint to entities
   */
  matchEntities(fingerprint) {
    const similar = this.findSimilar(fingerprint, 5);
    const entities = new Map();
    
    for (const match of similar) {
      for (const entityId of match.entities) {
        const current = entities.get(entityId) || { count: 0, maxSimilarity: 0 };
        current.count++;
        current.maxSimilarity = Math.max(current.maxSimilarity, match.similarity);
        entities.set(entityId, current);
      }
    }
    
    return [...entities.entries()]
      .map(([id, data]) => ({ entityId: id, ...data }))
      .sort((a, b) => b.maxSimilarity - a.maxSimilarity);
  }
  
  /**
   * Get entities for hash
   */
  getEntities(hash) {
    return [...(this.entityMap.get(hash) || [])];
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      totalFingerprints: this.fingerprints.size,
      uniqueEntities: new Set([...this.entityMap.values()].flatMap(s => [...s])).size
    };
  }
}

/**
 * Dark Fingerprint Protocol
 */
export const DarkFingerprintProtocol = {
  id: 'DRK-020',
  name: 'Dark Fingerprint Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  types: FINGERPRINT_TYPES,
  components: FINGERPRINT_COMPONENTS,
  
  createFingerprint: (type) => new Fingerprint(type),
  createStore: (config) => new FingerprintStore(config)
};

export default DarkFingerprintProtocol;

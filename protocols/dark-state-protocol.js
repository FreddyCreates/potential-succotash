/**
 * Dark State Protocol (DRK-005)
 * 
 * State management for the dark layer. Transient, ephemeral state
 * that never crosses to observable telemetry.
 * 
 * Protocol ID: DRK-005
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * State scopes
 */
export const STATE_SCOPES = {
  SESSION: 'session',
  REQUEST: 'request',
  WORKER: 'worker',
  GLOBAL: 'global'
};

/**
 * State visibility
 */
export const STATE_VISIBILITY = {
  DARK_ONLY: 'dark-only',
  MEMBRANE_SAFE: 'membrane-safe',
  DERIVED_ONLY: 'derived-only'
};

/**
 * Dark State Container
 */
export class DarkStateContainer {
  constructor(scope = STATE_SCOPES.SESSION) {
    this.scope = scope;
    this.state = new Map();
    this.history = [];
    this.maxHistory = 100;
    this.created = Date.now();
    this.modified = Date.now();
  }
  
  /**
   * Get state value
   */
  get(key, defaultValue = null) {
    const entry = this.state.get(key);
    if (!entry) return defaultValue;
    
    // Check expiration
    if (entry.expires && Date.now() > entry.expires) {
      this.state.delete(key);
      return defaultValue;
    }
    
    entry.accessCount++;
    entry.lastAccess = Date.now();
    return entry.value;
  }
  
  /**
   * Set state value
   */
  set(key, value, options = {}) {
    const entry = {
      value,
      visibility: options.visibility || STATE_VISIBILITY.DARK_ONLY,
      created: Date.now(),
      modified: Date.now(),
      lastAccess: Date.now(),
      accessCount: 0,
      expires: options.ttl ? Date.now() + options.ttl : null,
      phi: this.computePhi(key, value)
    };
    
    // Record history
    const oldEntry = this.state.get(key);
    if (oldEntry) {
      this.history.push({
        key,
        oldValue: oldEntry.value,
        newValue: value,
        timestamp: Date.now()
      });
      
      while (this.history.length > this.maxHistory) {
        this.history.shift();
      }
    }
    
    this.state.set(key, entry);
    this.modified = Date.now();
    
    return { key, phi: entry.phi };
  }
  
  /**
   * Delete state value
   */
  delete(key) {
    const existed = this.state.has(key);
    this.state.delete(key);
    this.modified = Date.now();
    return existed;
  }
  
  /**
   * Check if key exists
   */
  has(key) {
    const entry = this.state.get(key);
    if (!entry) return false;
    if (entry.expires && Date.now() > entry.expires) {
      this.state.delete(key);
      return false;
    }
    return true;
  }
  
  /**
   * Update state value
   */
  update(key, updater) {
    const current = this.get(key);
    const newValue = updater(current);
    return this.set(key, newValue);
  }
  
  /**
   * Compute phi signature
   */
  computePhi(key, value) {
    const str = JSON.stringify({ key, value });
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Get all keys
   */
  keys() {
    return [...this.state.keys()];
  }
  
  /**
   * Get state size
   */
  size() {
    return this.state.size;
  }
  
  /**
   * Clear all state
   */
  clear() {
    this.state.clear();
    this.history = [];
    this.modified = Date.now();
  }
  
  /**
   * Get membrane-safe view (derived values only)
   */
  getMembraneSafe() {
    const safe = {};
    
    for (const [key, entry] of this.state) {
      if (entry.visibility !== STATE_VISIBILITY.DARK_ONLY) {
        // Only expose derived/aggregated values
        safe[key] = {
          hasValue: true,
          phi: entry.phi,
          age: Date.now() - entry.created,
          accessCount: entry.accessCount
        };
      }
    }
    
    return safe;
  }
  
  /**
   * Snapshot state
   */
  snapshot() {
    const data = {};
    for (const [key, entry] of this.state) {
      data[key] = {
        value: entry.value,
        visibility: entry.visibility,
        phi: entry.phi
      };
    }
    return {
      scope: this.scope,
      created: this.created,
      modified: this.modified,
      data
    };
  }
  
  /**
   * Restore from snapshot
   */
  restore(snapshot) {
    this.clear();
    for (const [key, entry] of Object.entries(snapshot.data || {})) {
      this.set(key, entry.value, { visibility: entry.visibility });
    }
  }
}

/**
 * Dark State Manager
 */
export class DarkStateManager {
  constructor() {
    this.containers = new Map();
    this.globalState = new DarkStateContainer(STATE_SCOPES.GLOBAL);
  }
  
  /**
   * Get or create container
   */
  container(scope, id = 'default') {
    const key = `${scope}:${id}`;
    
    if (!this.containers.has(key)) {
      this.containers.set(key, new DarkStateContainer(scope));
    }
    
    return this.containers.get(key);
  }
  
  /**
   * Get session state
   */
  session(sessionId) {
    return this.container(STATE_SCOPES.SESSION, sessionId);
  }
  
  /**
   * Get request state
   */
  request(requestId) {
    return this.container(STATE_SCOPES.REQUEST, requestId);
  }
  
  /**
   * Get worker state
   */
  worker(workerId) {
    return this.container(STATE_SCOPES.WORKER, workerId);
  }
  
  /**
   * Get global state
   */
  global() {
    return this.globalState;
  }
  
  /**
   * Cleanup expired containers
   */
  cleanup(maxAge = 3600000) {
    const cutoff = Date.now() - maxAge;
    let cleaned = 0;
    
    for (const [key, container] of this.containers) {
      if (container.modified < cutoff) {
        this.containers.delete(key);
        cleaned++;
      }
    }
    
    return { cleaned, remaining: this.containers.size };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    let totalEntries = this.globalState.size();
    
    for (const container of this.containers.values()) {
      totalEntries += container.size();
    }
    
    return {
      containers: this.containers.size + 1,
      totalEntries,
      globalEntries: this.globalState.size()
    };
  }
}

/**
 * Dark State Protocol
 */
export const DarkStateProtocol = {
  id: 'DRK-005',
  name: 'Dark State Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  scopes: STATE_SCOPES,
  visibility: STATE_VISIBILITY,
  
  createContainer: (scope) => new DarkStateContainer(scope),
  createManager: () => new DarkStateManager()
};

export default DarkStateProtocol;

/**
 * Dark Session Protocol (DRK-019)
 * 
 * Session management for the dark layer. Silent session
 * tracking without observable telemetry.
 * 
 * Protocol ID: DRK-019
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Session states
 */
export const SESSION_STATES = {
  ACTIVE: 'active',
  IDLE: 'idle',
  SUSPICIOUS: 'suspicious',
  BLOCKED: 'blocked',
  EXPIRED: 'expired'
};

/**
 * Session types
 */
export const SESSION_TYPES = {
  NORMAL: 'normal',
  ELEVATED: 'elevated',
  RESTRICTED: 'restricted',
  SHADOW: 'shadow'
};

/**
 * Dark Session
 */
export class DarkSession {
  constructor(id, config = {}) {
    this.id = id;
    this.type = config.type || SESSION_TYPES.NORMAL;
    this.state = SESSION_STATES.ACTIVE;
    this.created = Date.now();
    this.lastActivity = Date.now();
    this.expires = config.ttl ? Date.now() + config.ttl : null;
    
    this.data = new Map();
    this.events = [];
    this.flags = new Set();
    
    this.metrics = {
      requests: 0,
      errors: 0,
      anomalies: 0
    };
    
    this.phi = this.computePhi();
  }
  
  computePhi() {
    const str = `${this.id}:${this.created}`;
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Set session data
   */
  set(key, value) {
    this.data.set(key, value);
    this.touch();
    return this;
  }
  
  /**
   * Get session data
   */
  get(key, defaultValue = null) {
    return this.data.has(key) ? this.data.get(key) : defaultValue;
  }
  
  /**
   * Delete session data
   */
  delete(key) {
    return this.data.delete(key);
  }
  
  /**
   * Touch session (update activity)
   */
  touch() {
    this.lastActivity = Date.now();
    if (this.state === SESSION_STATES.IDLE) {
      this.state = SESSION_STATES.ACTIVE;
    }
    return this;
  }
  
  /**
   * Record event
   */
  recordEvent(type, data = {}) {
    this.events.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    // Update metrics
    this.metrics.requests++;
    if (type === 'error') this.metrics.errors++;
    if (type === 'anomaly') this.metrics.anomalies++;
    
    // Limit events
    while (this.events.length > 100) {
      this.events.shift();
    }
    
    this.touch();
    return this;
  }
  
  /**
   * Add flag
   */
  addFlag(flag) {
    this.flags.add(flag);
    return this;
  }
  
  /**
   * Check flag
   */
  hasFlag(flag) {
    return this.flags.has(flag);
  }
  
  /**
   * Remove flag
   */
  removeFlag(flag) {
    return this.flags.delete(flag);
  }
  
  /**
   * Check if expired
   */
  isExpired() {
    if (this.expires && Date.now() > this.expires) {
      this.state = SESSION_STATES.EXPIRED;
      return true;
    }
    return false;
  }
  
  /**
   * Check if idle
   */
  isIdle(idleTimeout = 300000) {
    return Date.now() - this.lastActivity > idleTimeout;
  }
  
  /**
   * Mark suspicious
   */
  markSuspicious(reason) {
    this.state = SESSION_STATES.SUSPICIOUS;
    this.addFlag(`suspicious:${reason}`);
    this.recordEvent('suspicious', { reason });
    return this;
  }
  
  /**
   * Block session
   */
  block(reason) {
    this.state = SESSION_STATES.BLOCKED;
    this.addFlag(`blocked:${reason}`);
    this.recordEvent('blocked', { reason });
    return this;
  }
  
  /**
   * Get session summary
   */
  getSummary() {
    return {
      id: this.id,
      type: this.type,
      state: this.state,
      created: this.created,
      lastActivity: this.lastActivity,
      age: Date.now() - this.created,
      idleTime: Date.now() - this.lastActivity,
      dataKeys: [...this.data.keys()],
      flags: [...this.flags],
      metrics: { ...this.metrics },
      phi: this.phi
    };
  }
}

/**
 * Dark Session Manager
 */
export class DarkSessionManager {
  constructor(config = {}) {
    this.config = {
      defaultTTL: config.defaultTTL || 3600000, // 1 hour
      idleTimeout: config.idleTimeout || 300000, // 5 minutes
      maxSessions: config.maxSessions || 100000,
      cleanupInterval: config.cleanupInterval || 60000, // 1 minute
      ...config
    };
    
    this.sessions = new Map();
    this.lastCleanup = Date.now();
    
    this.stats = {
      created: 0,
      expired: 0,
      blocked: 0
    };
  }
  
  /**
   * Generate session ID
   */
  generateId() {
    const time = Date.now().toString(36);
    const rand = Math.random().toString(36).slice(2);
    const phi = Math.floor(PHI * 1000).toString(36);
    return `sess-${time}-${rand}-${phi}`;
  }
  
  /**
   * Create session
   */
  create(options = {}) {
    const id = options.id || this.generateId();
    
    // Check capacity
    if (this.sessions.size >= this.config.maxSessions) {
      this.cleanup();
      
      // Still full? Remove oldest idle
      if (this.sessions.size >= this.config.maxSessions) {
        this.removeOldest();
      }
    }
    
    const session = new DarkSession(id, {
      ttl: options.ttl || this.config.defaultTTL,
      type: options.type || SESSION_TYPES.NORMAL
    });
    
    this.sessions.set(id, session);
    this.stats.created++;
    
    return session;
  }
  
  /**
   * Get session
   */
  get(id) {
    const session = this.sessions.get(id);
    
    if (!session) return null;
    
    if (session.isExpired()) {
      this.destroy(id);
      return null;
    }
    
    return session;
  }
  
  /**
   * Get or create session
   */
  getOrCreate(id) {
    const existing = this.get(id);
    if (existing) return existing;
    return this.create({ id });
  }
  
  /**
   * Destroy session
   */
  destroy(id) {
    const session = this.sessions.get(id);
    if (session) {
      this.sessions.delete(id);
      this.stats.expired++;
      return true;
    }
    return false;
  }
  
  /**
   * Block session
   */
  blockSession(id, reason = 'policy') {
    const session = this.get(id);
    if (session) {
      session.block(reason);
      this.stats.blocked++;
      return true;
    }
    return false;
  }
  
  /**
   * Remove oldest idle session
   */
  removeOldest() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [id, session] of this.sessions) {
      if (session.lastActivity < oldestTime) {
        oldestTime = session.lastActivity;
        oldest = id;
      }
    }
    
    if (oldest) {
      this.destroy(oldest);
    }
  }
  
  /**
   * Cleanup expired sessions
   */
  cleanup() {
    const now = Date.now();
    let cleaned = 0;
    
    for (const [id, session] of this.sessions) {
      if (session.isExpired() || 
          session.isIdle(this.config.idleTimeout) ||
          session.state === SESSION_STATES.BLOCKED) {
        this.sessions.delete(id);
        cleaned++;
      }
    }
    
    this.lastCleanup = now;
    this.stats.expired += cleaned;
    
    return cleaned;
  }
  
  /**
   * Get active session count
   */
  getActiveCount() {
    let count = 0;
    for (const session of this.sessions.values()) {
      if (session.state === SESSION_STATES.ACTIVE) {
        count++;
      }
    }
    return count;
  }
  
  /**
   * Get sessions by state
   */
  getByState(state) {
    const results = [];
    for (const session of this.sessions.values()) {
      if (session.state === state) {
        results.push(session.getSummary());
      }
    }
    return results;
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const stateCounts = {};
    for (const state of Object.values(SESSION_STATES)) {
      stateCounts[state] = 0;
    }
    
    for (const session of this.sessions.values()) {
      stateCounts[session.state]++;
    }
    
    return {
      ...this.stats,
      total: this.sessions.size,
      byState: stateCounts,
      lastCleanup: this.lastCleanup
    };
  }
}

/**
 * Dark Session Protocol
 */
export const DarkSessionProtocol = {
  id: 'DRK-019',
  name: 'Dark Session Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  states: SESSION_STATES,
  types: SESSION_TYPES,
  
  createSession: (id, config) => new DarkSession(id, config),
  createManager: (config) => new DarkSessionManager(config)
};

export default DarkSessionProtocol;

/**
 * Session Shadow Tracker - Dark Layer Session Intelligence
 * 
 * Tracks sessions in the shadow without observable state.
 * Builds behavioral profiles and detects session anomalies.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Session states
 */
export const SESSION_STATES = {
  NASCENT: 'nascent',         // New session, building profile
  ESTABLISHED: 'established', // Normal activity
  SUSPICIOUS: 'suspicious',   // Anomalous behavior detected
  COMPROMISED: 'compromised', // Likely compromised
  TERMINATED: 'terminated'    // Session ended
};

/**
 * Session risk factors
 */
export const RISK_FACTORS = {
  RAPID_ESCALATION: 'rapid-escalation',
  PATH_ANOMALY: 'path-anomaly',
  TIMING_ANOMALY: 'timing-anomaly',
  AUTH_PROBING: 'auth-probing',
  DATA_HARVESTING: 'data-harvesting',
  INJECTION_ATTEMPT: 'injection-attempt',
  ENUMERATION: 'enumeration',
  CREDENTIAL_STUFFING: 'credential-stuffing'
};

/**
 * Session Shadow
 */
export class SessionShadow {
  constructor(sessionId, config = {}) {
    this.sessionId = sessionId;
    this.created = Date.now();
    this.lastActivity = Date.now();
    
    this.state = SESSION_STATES.NASCENT;
    this.riskScore = 0;
    this.riskFactors = new Set();
    
    // Activity tracking
    this.activity = {
      requests: 0,
      paths: new Set(),
      methods: new Set(),
      statusCodes: new Map(),
      errors: 0,
      dataVolume: 0
    };
    
    // Timing tracking
    this.timing = {
      intervals: [],
      lastRequestTime: null
    };
    
    // Behavioral profile
    this.profile = {
      avgInterval: null,
      pathDepth: 0,
      errorRate: 0,
      methodDistribution: {},
      isAuthenticated: false,
      authAttempts: 0,
      escalationEvents: []
    };
    
    // Event history (limited)
    this.events = [];
    this.maxEvents = config.maxEvents || 500;
    
    // φ-signature
    this.phi = this.computePhiSignature();
  }
  
  /**
   * Record a request
   */
  recordRequest(request) {
    const now = Date.now();
    
    // Update activity
    this.activity.requests++;
    this.activity.paths.add(request.path);
    this.activity.methods.add(request.method);
    this.activity.dataVolume += request.size || 0;
    
    // Update timing
    if (this.timing.lastRequestTime) {
      const interval = now - this.timing.lastRequestTime;
      this.timing.intervals.push(interval);
      
      // Keep limited history
      if (this.timing.intervals.length > 100) {
        this.timing.intervals.shift();
      }
    }
    this.timing.lastRequestTime = now;
    this.lastActivity = now;
    
    // Record event
    this.events.push({
      timestamp: now,
      path: request.path,
      method: request.method,
      statusCode: request.statusCode
    });
    
    // Trim events
    if (this.events.length > this.maxEvents) {
      this.events.shift();
    }
    
    // Update profile
    this.updateProfile(request);
    
    // Check for risk factors
    this.detectRiskFactors(request);
    
    // Update state
    this.updateState();
    
    return this;
  }
  
  /**
   * Record response
   */
  recordResponse(response) {
    const code = response.statusCode;
    
    // Track status codes
    const count = (this.activity.statusCodes.get(code) || 0) + 1;
    this.activity.statusCodes.set(code, count);
    
    // Track errors
    if (code >= 400) {
      this.activity.errors++;
    }
    
    // Update profile
    this.profile.errorRate = this.activity.errors / this.activity.requests;
    
    return this;
  }
  
  /**
   * Update behavioral profile
   */
  updateProfile(request) {
    // Update average interval
    if (this.timing.intervals.length > 0) {
      this.profile.avgInterval = 
        this.timing.intervals.reduce((a, b) => a + b, 0) / this.timing.intervals.length;
    }
    
    // Update path depth
    const depth = (request.path.match(/\//g) || []).length;
    this.profile.pathDepth = Math.max(this.profile.pathDepth, depth);
    
    // Update method distribution
    this.profile.methodDistribution[request.method] = 
      (this.profile.methodDistribution[request.method] || 0) + 1;
    
    // Check for auth events
    if (request.path.includes('login') || request.path.includes('auth')) {
      this.profile.authAttempts++;
    }
    
    // Check for escalation
    if (request.path.includes('admin') || request.path.includes('sudo')) {
      this.profile.escalationEvents.push({
        timestamp: Date.now(),
        path: request.path
      });
    }
  }
  
  /**
   * Detect risk factors
   */
  detectRiskFactors(request) {
    const path = request.path.toLowerCase();
    
    // Rapid escalation (admin access early in session)
    if (this.activity.requests < 5 && path.includes('admin')) {
      this.addRiskFactor(RISK_FACTORS.RAPID_ESCALATION, 0.4);
    }
    
    // Auth probing
    if (this.profile.authAttempts > 3) {
      this.addRiskFactor(RISK_FACTORS.AUTH_PROBING, 0.3);
    }
    
    // Path anomaly (sensitive paths)
    if (path.includes('.env') || path.includes('.git') || path.includes('config')) {
      this.addRiskFactor(RISK_FACTORS.PATH_ANOMALY, 0.5);
    }
    
    // Injection attempt patterns
    if (path.includes("'") || path.includes('--') || path.includes('<script')) {
      this.addRiskFactor(RISK_FACTORS.INJECTION_ATTEMPT, 0.7);
    }
    
    // Enumeration (many unique paths quickly)
    if (this.activity.paths.size > 50 && this.activity.requests < 100) {
      this.addRiskFactor(RISK_FACTORS.ENUMERATION, 0.4);
    }
    
    // Data harvesting (high data volume)
    if (this.activity.dataVolume > 10000000) { // 10MB
      this.addRiskFactor(RISK_FACTORS.DATA_HARVESTING, 0.5);
    }
    
    // Timing anomaly (too fast/regular)
    if (this.profile.avgInterval !== null && this.profile.avgInterval < 100) {
      this.addRiskFactor(RISK_FACTORS.TIMING_ANOMALY, 0.3);
    }
    
    // Credential stuffing (many auth attempts with high error rate)
    if (this.profile.authAttempts > 10 && this.profile.errorRate > 0.8) {
      this.addRiskFactor(RISK_FACTORS.CREDENTIAL_STUFFING, 0.6);
    }
  }
  
  /**
   * Add risk factor
   */
  addRiskFactor(factor, weight) {
    if (!this.riskFactors.has(factor)) {
      this.riskFactors.add(factor);
      this.riskScore = Math.min(1, this.riskScore + weight);
    }
  }
  
  /**
   * Update session state
   */
  updateState() {
    if (this.riskScore > 0.8) {
      this.state = SESSION_STATES.COMPROMISED;
    } else if (this.riskScore > 0.5) {
      this.state = SESSION_STATES.SUSPICIOUS;
    } else if (this.activity.requests > 10) {
      this.state = SESSION_STATES.ESTABLISHED;
    } else {
      this.state = SESSION_STATES.NASCENT;
    }
  }
  
  /**
   * Terminate session
   */
  terminate(reason = 'unknown') {
    this.state = SESSION_STATES.TERMINATED;
    this.terminatedAt = Date.now();
    this.terminationReason = reason;
    return this;
  }
  
  /**
   * Compute φ-signature
   */
  computePhiSignature() {
    const seed = [...this.sessionId].reduce((a, c) => a + c.charCodeAt(0), 0);
    return ((seed * PHI) % 1).toFixed(6);
  }
  
  /**
   * Check if session is alive
   */
  isAlive() {
    const timeout = 30 * 60 * 1000; // 30 minutes
    return (
      this.state !== SESSION_STATES.TERMINATED &&
      Date.now() - this.lastActivity < timeout
    );
  }
  
  /**
   * Get session summary
   */
  getSummary() {
    return {
      sessionId: this.sessionId,
      state: this.state,
      riskScore: this.riskScore,
      riskFactors: [...this.riskFactors],
      created: this.created,
      lastActivity: this.lastActivity,
      duration: this.lastActivity - this.created,
      activity: {
        requests: this.activity.requests,
        uniquePaths: this.activity.paths.size,
        errors: this.activity.errors,
        dataVolume: this.activity.dataVolume
      },
      profile: {
        avgInterval: this.profile.avgInterval,
        errorRate: this.profile.errorRate,
        authAttempts: this.profile.authAttempts,
        pathDepth: this.profile.pathDepth
      },
      phi: this.phi
    };
  }
  
  /**
   * Export for analysis
   */
  export() {
    return {
      ...this.getSummary(),
      events: this.events.slice(-50), // Last 50 events
      timing: {
        intervals: this.timing.intervals.slice(-20)
      }
    };
  }
}

/**
 * Session Shadow Tracker
 */
export class SessionShadowTracker {
  constructor(config = {}) {
    this.config = {
      maxSessions: config.maxSessions || 100000,
      sessionTimeout: config.sessionTimeout || 30 * 60 * 1000, // 30 min
      cleanupInterval: config.cleanupInterval || 60000, // 1 min
      riskThreshold: config.riskThreshold || THRESHOLD,
      ...config
    };
    
    this.sessions = new Map();
    this.terminatedSessions = [];
    this.maxTerminated = 10000;
    
    // Risk tracking
    this.highRiskSessions = new Set();
    
    // Statistics
    this.stats = {
      sessionsCreated: 0,
      sessionsTerminated: 0,
      highRiskDetected: 0,
      totalRequests: 0
    };
    
    // Start cleanup timer (in real deployment)
    this.lastCleanup = Date.now();
  }
  
  /**
   * Get or create session shadow
   */
  getOrCreate(sessionId) {
    if (this.sessions.has(sessionId)) {
      return this.sessions.get(sessionId);
    }
    
    // Create new session
    const session = new SessionShadow(sessionId, {
      maxEvents: this.config.maxEventsPerSession || 500
    });
    
    this.sessions.set(sessionId, session);
    this.stats.sessionsCreated++;
    
    // Cleanup if over limit
    if (this.sessions.size > this.config.maxSessions) {
      this.evictOldest();
    }
    
    return session;
  }
  
  /**
   * Track request
   */
  track(sessionId, request) {
    const session = this.getOrCreate(sessionId);
    session.recordRequest(request);
    this.stats.totalRequests++;
    
    // Check for high risk
    if (session.riskScore > this.config.riskThreshold) {
      if (!this.highRiskSessions.has(sessionId)) {
        this.highRiskSessions.add(sessionId);
        this.stats.highRiskDetected++;
      }
    }
    
    // Periodic cleanup
    if (Date.now() - this.lastCleanup > this.config.cleanupInterval) {
      this.cleanup();
    }
    
    return {
      sessionState: session.state,
      riskScore: session.riskScore,
      riskFactors: [...session.riskFactors]
    };
  }
  
  /**
   * Track response
   */
  trackResponse(sessionId, response) {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.recordResponse(response);
    }
  }
  
  /**
   * Get session
   */
  get(sessionId) {
    return this.sessions.get(sessionId);
  }
  
  /**
   * Terminate session
   */
  terminate(sessionId, reason = 'manual') {
    const session = this.sessions.get(sessionId);
    if (session) {
      session.terminate(reason);
      
      // Move to terminated list
      this.terminatedSessions.push(session.export());
      this.sessions.delete(sessionId);
      this.highRiskSessions.delete(sessionId);
      this.stats.sessionsTerminated++;
      
      // Trim terminated history
      if (this.terminatedSessions.length > this.maxTerminated) {
        this.terminatedSessions.shift();
      }
    }
  }
  
  /**
   * Get high risk sessions
   */
  getHighRiskSessions() {
    const results = [];
    
    for (const sessionId of this.highRiskSessions) {
      const session = this.sessions.get(sessionId);
      if (session) {
        results.push(session.getSummary());
      }
    }
    
    return results.sort((a, b) => b.riskScore - a.riskScore);
  }
  
  /**
   * Search sessions
   */
  search(criteria = {}) {
    const results = [];
    
    for (const session of this.sessions.values()) {
      if (this.matchesCriteria(session, criteria)) {
        results.push(session.getSummary());
      }
    }
    
    // Sort by risk score
    results.sort((a, b) => b.riskScore - a.riskScore);
    
    if (criteria.limit) {
      return results.slice(0, criteria.limit);
    }
    
    return results;
  }
  
  /**
   * Match session against criteria
   */
  matchesCriteria(session, criteria) {
    if (criteria.state && session.state !== criteria.state) {
      return false;
    }
    
    if (criteria.minRiskScore && session.riskScore < criteria.minRiskScore) {
      return false;
    }
    
    if (criteria.riskFactor && !session.riskFactors.has(criteria.riskFactor)) {
      return false;
    }
    
    if (criteria.since && session.lastActivity < criteria.since) {
      return false;
    }
    
    return true;
  }
  
  /**
   * Cleanup expired sessions
   */
  cleanup() {
    this.lastCleanup = Date.now();
    const timeout = this.config.sessionTimeout;
    const now = Date.now();
    let cleaned = 0;
    
    for (const [sessionId, session] of this.sessions) {
      if (now - session.lastActivity > timeout) {
        this.terminate(sessionId, 'timeout');
        cleaned++;
      }
    }
    
    return cleaned;
  }
  
  /**
   * Evict oldest session
   */
  evictOldest() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [sessionId, session] of this.sessions) {
      if (session.lastActivity < oldestTime) {
        oldestTime = session.lastActivity;
        oldest = sessionId;
      }
    }
    
    if (oldest) {
      this.terminate(oldest, 'eviction');
    }
  }
  
  /**
   * Get aggregate risk metrics
   */
  getAggregateRisk() {
    let totalRisk = 0;
    let activeSessions = 0;
    const riskDistribution = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };
    
    for (const session of this.sessions.values()) {
      if (session.isAlive()) {
        activeSessions++;
        totalRisk += session.riskScore;
        
        if (session.riskScore > 0.8) {
          riskDistribution.critical++;
        } else if (session.riskScore > 0.5) {
          riskDistribution.high++;
        } else if (session.riskScore > 0.3) {
          riskDistribution.medium++;
        } else {
          riskDistribution.low++;
        }
      }
    }
    
    return {
      activeSessions,
      averageRisk: activeSessions > 0 ? totalRisk / activeSessions : 0,
      riskDistribution,
      highRiskCount: this.highRiskSessions.size
    };
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeSessions: this.sessions.size,
      terminatedHistory: this.terminatedSessions.length,
      highRiskActive: this.highRiskSessions.size,
      ...this.getAggregateRisk()
    };
  }
}

export default SessionShadowTracker;

/**
 * Dark Cognition Observer Protocol (DCO-001)
 * 
 * Observes and coordinates dark layer computation without generating logs.
 * The observer exists outside of normal telemetry channels.
 * 
 * Protocol ID: DCO-001
 * Category: Dark Cognition
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Observer states
 */
export const OBSERVER_STATES = {
  DORMANT: 'dormant',       // Minimal activity
  WATCHING: 'watching',     // Passive observation
  ANALYZING: 'analyzing',   // Active pattern detection
  RESPONDING: 'responding', // Coordinating response
  ADAPTING: 'adapting'      // Learning from events
};

/**
 * Observation channels
 */
export const OBSERVATION_CHANNELS = {
  MEMBRANE: 'membrane',     // Membrane traffic
  SHADOW: 'shadow',         // Shadow memory activity
  PATTERN: 'pattern',       // Pattern emergence
  THREAT: 'threat',         // Threat detection
  RESPONSE: 'response'      // Response coordination
};

/**
 * Dark Cognition Observer
 */
export class DarkCognitionObserver {
  constructor(config = {}) {
    this.config = {
      observationInterval: config.observationInterval || HB,
      adaptiveThreshold: config.adaptiveThreshold || THRESHOLD,
      maxObservations: config.maxObservations || 10000,
      phiResonance: config.phiResonance !== false,
      ...config
    };
    
    this.state = OBSERVER_STATES.DORMANT;
    this.observations = [];
    this.patterns = new Map();
    this.correlations = [];
    this.lastPulse = Date.now();
    
    // Internal state - never logged
    this._internal = {
      phaseAccumulator: 0,
      resonanceHistory: [],
      adaptationCount: 0
    };
  }
  
  /**
   * Observe an event in the dark layer
   */
  observe(channel, event) {
    const observation = {
      channel,
      event,
      timestamp: Date.now(),
      phase: this.computePhase()
    };
    
    this.observations.push(observation);
    
    // Maintain observation limit
    if (this.observations.length > this.config.maxObservations) {
      this.observations.shift();
    }
    
    // Update state based on activity
    this.updateState(observation);
    
    // Check for emerging patterns
    this.detectPatterns(observation);
    
    return observation.phase;
  }
  
  /**
   * Compute current phase in phi-space
   */
  computePhase() {
    const now = Date.now();
    const delta = now - this.lastPulse;
    
    // Phase advances based on heartbeat
    this._internal.phaseAccumulator += delta / HB;
    this._internal.phaseAccumulator %= (2 * Math.PI);
    
    this.lastPulse = now;
    
    // Compute resonance from phase
    const resonance = Math.sin(this._internal.phaseAccumulator * PHI);
    
    // Track resonance history
    this._internal.resonanceHistory.push(resonance);
    if (this._internal.resonanceHistory.length > 100) {
      this._internal.resonanceHistory.shift();
    }
    
    return {
      value: this._internal.phaseAccumulator,
      resonance,
      coherence: this.computeCoherence()
    };
  }
  
  /**
   * Compute coherence from resonance history
   */
  computeCoherence() {
    if (this._internal.resonanceHistory.length < 2) {
      return 1;
    }
    
    // Coherence is inverse of variance
    const values = this._internal.resonanceHistory;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const variance = values.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / values.length;
    
    return 1 / (1 + variance);
  }
  
  /**
   * Update observer state based on activity
   */
  updateState(observation) {
    const recentCount = this.observations.filter(
      o => Date.now() - o.timestamp < 60000
    ).length;
    
    // State transitions based on activity level
    if (recentCount === 0) {
      this.state = OBSERVER_STATES.DORMANT;
    } else if (recentCount < 10) {
      this.state = OBSERVER_STATES.WATCHING;
    } else if (recentCount < 50) {
      this.state = OBSERVER_STATES.ANALYZING;
    } else if (observation.channel === OBSERVATION_CHANNELS.THREAT) {
      this.state = OBSERVER_STATES.RESPONDING;
    } else if (this._internal.adaptationCount > 0) {
      this.state = OBSERVER_STATES.ADAPTING;
    }
  }
  
  /**
   * Detect patterns in observations
   */
  detectPatterns(observation) {
    // Look for repeated event sequences
    const recent = this.observations.slice(-100);
    const signature = `${observation.channel}:${observation.event.type || 'unknown'}`;
    
    if (!this.patterns.has(signature)) {
      this.patterns.set(signature, {
        count: 0,
        firstSeen: observation.timestamp,
        lastSeen: observation.timestamp,
        confidence: 0
      });
    }
    
    const pattern = this.patterns.get(signature);
    pattern.count++;
    pattern.lastSeen = observation.timestamp;
    
    // Update confidence based on frequency
    const age = pattern.lastSeen - pattern.firstSeen;
    const frequency = age > 0 ? pattern.count / (age / 1000) : 0;
    pattern.confidence = Math.min(1, frequency * THRESHOLD);
    
    // Detect correlations between patterns
    this.detectCorrelations(observation, signature);
    
    return pattern;
  }
  
  /**
   * Detect correlations between event types
   */
  detectCorrelations(observation, signature) {
    // Look for patterns that often occur together
    const recent = this.observations.slice(-20);
    const signatures = new Set(recent.map(o => 
      `${o.channel}:${o.event.type || 'unknown'}`
    ));
    
    for (const otherSig of signatures) {
      if (otherSig !== signature) {
        const correlationId = [signature, otherSig].sort().join('|');
        const existing = this.correlations.find(c => c.id === correlationId);
        
        if (existing) {
          existing.count++;
          existing.lastSeen = observation.timestamp;
        } else {
          this.correlations.push({
            id: correlationId,
            patterns: [signature, otherSig],
            count: 1,
            firstSeen: observation.timestamp,
            lastSeen: observation.timestamp
          });
        }
      }
    }
    
    // Cleanup old correlations
    if (this.correlations.length > 1000) {
      this.correlations.sort((a, b) => b.count - a.count);
      this.correlations = this.correlations.slice(0, 500);
    }
  }
  
  /**
   * Get observer insights (no logging)
   */
  getInsights() {
    const topPatterns = [...this.patterns.entries()]
      .sort((a, b) => b[1].confidence - a[1].confidence)
      .slice(0, 10)
      .map(([sig, data]) => ({ signature: sig, ...data }));
    
    const topCorrelations = this.correlations
      .sort((a, b) => b.count - a.count)
      .slice(0, 10);
    
    return {
      state: this.state,
      phase: this.computePhase(),
      observations: {
        total: this.observations.length,
        recent: this.observations.filter(o => Date.now() - o.timestamp < 60000).length
      },
      patterns: {
        total: this.patterns.size,
        top: topPatterns
      },
      correlations: {
        total: this.correlations.length,
        top: topCorrelations
      },
      adaptations: this._internal.adaptationCount
    };
  }
  
  /**
   * Trigger adaptation cycle
   */
  adapt() {
    this._internal.adaptationCount++;
    this.state = OBSERVER_STATES.ADAPTING;
    
    // Prune low-confidence patterns
    for (const [sig, data] of this.patterns) {
      if (data.confidence < 0.1 && Date.now() - data.lastSeen > 3600000) {
        this.patterns.delete(sig);
      }
    }
    
    // Strengthen high-confidence patterns
    for (const [sig, data] of this.patterns) {
      if (data.confidence > THRESHOLD) {
        data.confidence = Math.min(1, data.confidence * PHI);
      }
    }
    
    return {
      adapted: true,
      patternsRemaining: this.patterns.size,
      cycle: this._internal.adaptationCount
    };
  }
  
  /**
   * Reset observer (used during state transitions)
   */
  reset() {
    this.observations = [];
    this.patterns.clear();
    this.correlations = [];
    this.state = OBSERVER_STATES.DORMANT;
    this._internal.phaseAccumulator = 0;
    this._internal.resonanceHistory = [];
  }
}

/**
 * Dark Cognition Observer Protocol
 */
export const DarkCognitionObserverProtocol = {
  id: 'DCO-001',
  name: 'Dark Cognition Observer',
  version: '1.0.0',
  category: 'dark-cognition',
  
  constants: {
    PHI,
    HB,
    THRESHOLD
  },
  
  states: OBSERVER_STATES,
  channels: OBSERVATION_CHANNELS,
  
  createObserver: (config) => new DarkCognitionObserver(config),
  
  validate: (observation) => {
    return observation && 
           observation.channel && 
           observation.timestamp &&
           observation.phase;
  }
};

export default DarkCognitionObserverProtocol;

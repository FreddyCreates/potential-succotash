/**
 * Dark Pulse Protocol (DRK-001)
 * 
 * Generates phi-resonant heartbeat pulses in the dark layer.
 * Silent timing coordination without observable telemetry.
 * 
 * Protocol ID: DRK-001
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Pulse modes
 */
export const PULSE_MODES = {
  DORMANT: 'dormant',
  SENTINEL: 'sentinel',
  ACTIVE: 'active',
  SURGE: 'surge',
  CRITICAL: 'critical'
};

/**
 * Pulse channels
 */
export const PULSE_CHANNELS = {
  PRIMARY: 'primary',
  SHADOW: 'shadow',
  EMERGENCY: 'emergency',
  SYNC: 'sync'
};

/**
 * Dark Pulse Generator
 */
export class DarkPulseGenerator {
  constructor(config = {}) {
    this.config = {
      baseInterval: config.baseInterval || HB,
      phiMultiplier: config.phiMultiplier || PHI,
      maxChannels: config.maxChannels || 16,
      ...config
    };
    
    this.mode = PULSE_MODES.DORMANT;
    this.channels = new Map();
    this.pulseHistory = [];
    this.phase = 0;
    this.lastPulse = 0;
    
    // Internal state
    this._coherence = 1;
    this._resonance = [];
  }
  
  /**
   * Generate a pulse
   */
  pulse(channel = PULSE_CHANNELS.PRIMARY) {
    const now = Date.now();
    const delta = now - this.lastPulse;
    
    // Compute phase advance
    this.phase += (delta / this.config.baseInterval) * PHI;
    this.phase %= (2 * Math.PI);
    
    const pulseData = {
      channel,
      timestamp: now,
      phase: this.phase,
      resonance: Math.sin(this.phase),
      coherence: this._coherence,
      interval: delta
    };
    
    // Track pulse
    this.pulseHistory.push(pulseData);
    if (this.pulseHistory.length > 1000) {
      this.pulseHistory.shift();
    }
    
    // Update channel
    if (!this.channels.has(channel)) {
      this.channels.set(channel, { count: 0, lastPulse: 0 });
    }
    const ch = this.channels.get(channel);
    ch.count++;
    ch.lastPulse = now;
    
    this.lastPulse = now;
    this.updateCoherence();
    
    return pulseData;
  }
  
  /**
   * Update coherence metric
   */
  updateCoherence() {
    if (this.pulseHistory.length < 2) return;
    
    // Coherence from interval regularity
    const intervals = this.pulseHistory.slice(-20).map((p, i, arr) => 
      i > 0 ? p.timestamp - arr[i-1].timestamp : 0
    ).filter(i => i > 0);
    
    if (intervals.length > 0) {
      const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
      const variance = intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length;
      this._coherence = 1 / (1 + variance / (HB * HB));
    }
  }
  
  /**
   * Set pulse mode
   */
  setMode(mode) {
    this.mode = mode;
    
    // Adjust intervals based on mode
    switch (mode) {
      case PULSE_MODES.SURGE:
        this.config.baseInterval = HB / PHI;
        break;
      case PULSE_MODES.CRITICAL:
        this.config.baseInterval = HB / (PHI * PHI);
        break;
      case PULSE_MODES.DORMANT:
        this.config.baseInterval = HB * PHI;
        break;
      default:
        this.config.baseInterval = HB;
    }
    
    return { mode, interval: this.config.baseInterval };
  }
  
  /**
   * Get pulse statistics
   */
  getStats() {
    const channelStats = {};
    for (const [name, data] of this.channels) {
      channelStats[name] = data;
    }
    
    return {
      mode: this.mode,
      phase: this.phase,
      coherence: this._coherence,
      totalPulses: this.pulseHistory.length,
      channels: channelStats,
      currentInterval: this.config.baseInterval
    };
  }
  
  /**
   * Synchronize with another pulse generator
   */
  synchronize(other) {
    const phaseDiff = Math.abs(this.phase - other.phase);
    const syncStrength = Math.cos(phaseDiff) * THRESHOLD;
    
    // Adjust phase toward other
    this.phase += syncStrength * (other.phase - this.phase);
    this.phase %= (2 * Math.PI);
    
    return { synced: true, phaseDiff, syncStrength };
  }
}

/**
 * Dark Pulse Protocol
 */
export const DarkPulseProtocol = {
  id: 'DRK-001',
  name: 'Dark Pulse Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  modes: PULSE_MODES,
  channels: PULSE_CHANNELS,
  
  createGenerator: (config) => new DarkPulseGenerator(config)
};

export default DarkPulseProtocol;

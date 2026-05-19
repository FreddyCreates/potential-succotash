/**
 * Dark Sync Protocol (DRK-008)
 * 
 * Synchronization between dark layer components using
 * phi-resonant phase coupling.
 * 
 * Protocol ID: DRK-008
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Sync modes
 */
export const SYNC_MODES = {
  PHASE: 'phase',
  STATE: 'state',
  CLOCK: 'clock',
  VECTOR: 'vector'
};

/**
 * Sync states
 */
export const SYNC_STATES = {
  UNSYNCHRONIZED: 'unsynchronized',
  SYNCHRONIZING: 'synchronizing',
  SYNCHRONIZED: 'synchronized',
  DRIFTING: 'drifting'
};

/**
 * Phase Oscillator
 */
export class PhaseOscillator {
  constructor(frequency = 1 / HB, phase = 0) {
    this.frequency = frequency;
    this.phase = phase;
    this.lastUpdate = Date.now();
    this.coupling = THRESHOLD;
  }
  
  /**
   * Advance phase based on time
   */
  tick() {
    const now = Date.now();
    const dt = (now - this.lastUpdate) / 1000;
    this.phase += 2 * Math.PI * this.frequency * dt;
    this.phase %= (2 * Math.PI);
    this.lastUpdate = now;
    return this.phase;
  }
  
  /**
   * Couple with another oscillator
   */
  couple(other, strength = null) {
    const k = strength ?? this.coupling;
    const phaseDiff = other.phase - this.phase;
    
    // Kuramoto coupling
    const adjustment = k * Math.sin(phaseDiff);
    this.phase += adjustment;
    this.phase %= (2 * Math.PI);
    
    return adjustment;
  }
  
  /**
   * Get order parameter (coherence)
   */
  orderParameter(others) {
    let sumCos = Math.cos(this.phase);
    let sumSin = Math.sin(this.phase);
    
    for (const other of others) {
      sumCos += Math.cos(other.phase);
      sumSin += Math.sin(other.phase);
    }
    
    const n = others.length + 1;
    return Math.sqrt(sumCos * sumCos + sumSin * sumSin) / n;
  }
}

/**
 * Vector Clock
 */
export class VectorClock {
  constructor(nodeId) {
    this.nodeId = nodeId;
    this.clock = new Map();
    this.clock.set(nodeId, 0);
  }
  
  /**
   * Increment local clock
   */
  increment() {
    const current = this.clock.get(this.nodeId) || 0;
    this.clock.set(this.nodeId, current + 1);
    return this.getClock();
  }
  
  /**
   * Merge with received clock
   */
  merge(otherClock) {
    for (const [nodeId, time] of otherClock) {
      const current = this.clock.get(nodeId) || 0;
      this.clock.set(nodeId, Math.max(current, time));
    }
    this.increment();
    return this.getClock();
  }
  
  /**
   * Compare clocks
   */
  compare(otherClock) {
    let less = false;
    let greater = false;
    
    // Check all keys from both clocks
    const allKeys = new Set([...this.clock.keys(), ...otherClock.keys()]);
    
    for (const key of allKeys) {
      const thisTime = this.clock.get(key) || 0;
      const otherTime = otherClock.get(key) || 0;
      
      if (thisTime < otherTime) less = true;
      if (thisTime > otherTime) greater = true;
    }
    
    if (less && !greater) return -1; // This happened before
    if (!less && greater) return 1;  // This happened after
    if (!less && !greater) return 0; // Equal
    return null; // Concurrent
  }
  
  /**
   * Get clock as object
   */
  getClock() {
    return new Map(this.clock);
  }
}

/**
 * Dark Sync Manager
 */
export class DarkSyncManager {
  constructor(nodeId, config = {}) {
    this.nodeId = nodeId;
    this.config = {
      mode: config.mode || SYNC_MODES.PHASE,
      syncInterval: config.syncInterval || HB,
      couplingStrength: config.couplingStrength || THRESHOLD,
      ...config
    };
    
    this.state = SYNC_STATES.UNSYNCHRONIZED;
    this.oscillator = new PhaseOscillator(1 / this.config.syncInterval);
    this.vectorClock = new VectorClock(nodeId);
    this.peers = new Map();
    this.lastSync = 0;
  }
  
  /**
   * Add peer for synchronization
   */
  addPeer(peerId, peerState = {}) {
    this.peers.set(peerId, {
      id: peerId,
      oscillator: new PhaseOscillator(1 / this.config.syncInterval, peerState.phase || 0),
      vectorClock: new VectorClock(peerId),
      lastSeen: Date.now(),
      ...peerState
    });
    
    return { added: peerId, totalPeers: this.peers.size };
  }
  
  /**
   * Remove peer
   */
  removePeer(peerId) {
    return this.peers.delete(peerId);
  }
  
  /**
   * Update peer state
   */
  updatePeer(peerId, state) {
    const peer = this.peers.get(peerId);
    if (!peer) return null;
    
    if (state.phase !== undefined) {
      peer.oscillator.phase = state.phase;
    }
    
    if (state.vectorClock) {
      peer.vectorClock.merge(state.vectorClock);
    }
    
    peer.lastSeen = Date.now();
    
    return peer;
  }
  
  /**
   * Perform sync tick
   */
  tick() {
    // Update local oscillator
    this.oscillator.tick();
    
    // Couple with peers
    if (this.config.mode === SYNC_MODES.PHASE) {
      const peerOscillators = [...this.peers.values()].map(p => p.oscillator);
      
      for (const osc of peerOscillators) {
        this.oscillator.couple(osc, this.config.couplingStrength);
      }
      
      // Check coherence
      const order = this.oscillator.orderParameter(peerOscillators);
      
      if (order > THRESHOLD) {
        this.state = SYNC_STATES.SYNCHRONIZED;
      } else if (order > 0.3) {
        this.state = SYNC_STATES.SYNCHRONIZING;
      } else {
        this.state = SYNC_STATES.DRIFTING;
      }
    }
    
    this.lastSync = Date.now();
    
    return this.getSyncState();
  }
  
  /**
   * Get current sync state
   */
  getSyncState() {
    const peerOscillators = [...this.peers.values()].map(p => p.oscillator);
    const order = peerOscillators.length > 0 
      ? this.oscillator.orderParameter(peerOscillators) 
      : 1;
    
    return {
      state: this.state,
      phase: this.oscillator.phase,
      coherence: order,
      vectorClock: Object.fromEntries(this.vectorClock.clock),
      peers: this.peers.size,
      lastSync: this.lastSync
    };
  }
  
  /**
   * Generate sync message
   */
  generateSyncMessage() {
    this.vectorClock.increment();
    
    return {
      nodeId: this.nodeId,
      phase: this.oscillator.phase,
      vectorClock: Object.fromEntries(this.vectorClock.clock),
      timestamp: Date.now()
    };
  }
  
  /**
   * Process received sync message
   */
  processSyncMessage(message) {
    // Update peer
    this.updatePeer(message.nodeId, {
      phase: message.phase,
      vectorClock: new Map(Object.entries(message.vectorClock))
    });
    
    // Merge vector clock
    this.vectorClock.merge(new Map(Object.entries(message.vectorClock)));
    
    return this.tick();
  }
}

/**
 * Dark Sync Protocol
 */
export const DarkSyncProtocol = {
  id: 'DRK-008',
  name: 'Dark Sync Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  modes: SYNC_MODES,
  states: SYNC_STATES,
  
  createOscillator: (frequency, phase) => new PhaseOscillator(frequency, phase),
  createVectorClock: (nodeId) => new VectorClock(nodeId),
  createManager: (nodeId, config) => new DarkSyncManager(nodeId, config)
};

export default DarkSyncProtocol;

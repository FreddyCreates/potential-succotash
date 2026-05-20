/**
 * Dark Signal Protocol (DRK-004)
 * 
 * Silent signaling between dark layer components.
 * No observable emissions - internal coordination only.
 * 
 * Protocol ID: DRK-004
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Signal types
 */
export const SIGNAL_TYPES = {
  ALERT: 'alert',
  QUERY: 'query',
  RESPONSE: 'response',
  SYNC: 'sync',
  CONTROL: 'control',
  DATA: 'data'
};

/**
 * Signal priorities
 */
export const SIGNAL_PRIORITIES = {
  CRITICAL: 0,
  HIGH: 1,
  MEDIUM: 2,
  LOW: 3,
  BACKGROUND: 4
};

/**
 * Dark Signal
 */
export class DarkSignal {
  constructor(type, payload, options = {}) {
    this.id = this.generateId();
    this.type = type;
    this.payload = payload;
    this.priority = options.priority ?? SIGNAL_PRIORITIES.MEDIUM;
    this.source = options.source || 'anonymous';
    this.target = options.target || '*';
    this.timestamp = Date.now();
    this.ttl = options.ttl || 60000;
    this.phi = this.computePhi();
  }
  
  /**
   * Generate signal ID
   */
  generateId() {
    const time = Date.now().toString(36);
    const rand = Math.floor(Math.random() * 0x10000).toString(36);
    return `sig-${time}-${rand}`;
  }
  
  /**
   * Compute phi signature
   */
  computePhi() {
    const data = JSON.stringify(this.payload);
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      sum += data.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Check if signal is expired
   */
  isExpired() {
    return Date.now() - this.timestamp > this.ttl;
  }
  
  /**
   * Check if signal matches target
   */
  matches(receiverId) {
    return this.target === '*' || this.target === receiverId;
  }
}

/**
 * Dark Signal Bus
 */
export class DarkSignalBus {
  constructor(config = {}) {
    this.config = {
      maxPending: config.maxPending || 1000,
      processingInterval: config.processingInterval || HB / PHI,
      ...config
    };
    
    this.handlers = new Map();
    this.pending = [];
    this.processed = 0;
    this.dropped = 0;
  }
  
  /**
   * Register signal handler
   */
  on(type, handler, receiverId = '*') {
    const key = `${type}:${receiverId}`;
    if (!this.handlers.has(key)) {
      this.handlers.set(key, []);
    }
    this.handlers.get(key).push(handler);
    
    return () => {
      const handlers = this.handlers.get(key);
      const idx = handlers.indexOf(handler);
      if (idx >= 0) handlers.splice(idx, 1);
    };
  }
  
  /**
   * Emit a signal
   */
  emit(signal) {
    if (!(signal instanceof DarkSignal)) {
      signal = new DarkSignal(signal.type, signal.payload, signal);
    }
    
    // Add to pending queue by priority
    this.pending.push(signal);
    this.pending.sort((a, b) => a.priority - b.priority);
    
    // Enforce max pending
    while (this.pending.length > this.config.maxPending) {
      this.pending.pop();
      this.dropped++;
    }
    
    return signal.id;
  }
  
  /**
   * Process pending signals
   */
  process() {
    const toProcess = this.pending.filter(s => !s.isExpired());
    this.pending = [];
    
    for (const signal of toProcess) {
      this.dispatch(signal);
    }
    
    this.processed += toProcess.length;
    
    return {
      processed: toProcess.length,
      total: this.processed,
      dropped: this.dropped
    };
  }
  
  /**
   * Dispatch signal to handlers
   */
  dispatch(signal) {
    // Type-specific handlers
    const typeKey = `${signal.type}:*`;
    const handlers1 = this.handlers.get(typeKey) || [];
    
    // Target-specific handlers
    const targetKey = `${signal.type}:${signal.target}`;
    const handlers2 = this.handlers.get(targetKey) || [];
    
    // Wildcard handlers
    const wildcardKey = '*:*';
    const handlers3 = this.handlers.get(wildcardKey) || [];
    
    const allHandlers = [...handlers1, ...handlers2, ...handlers3];
    
    for (const handler of allHandlers) {
      try {
        handler(signal);
      } catch (e) {
        // Silent failure in dark layer
      }
    }
  }
  
  /**
   * Create a signal
   */
  signal(type, payload, options = {}) {
    const sig = new DarkSignal(type, payload, options);
    this.emit(sig);
    return sig;
  }
  
  /**
   * Query with response
   */
  async query(type, payload, timeout = 5000) {
    return new Promise((resolve, reject) => {
      const queryId = `query-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      
      const timer = setTimeout(() => {
        unsubscribe();
        reject(new Error('Query timeout'));
      }, timeout);
      
      const unsubscribe = this.on(SIGNAL_TYPES.RESPONSE, (signal) => {
        if (signal.payload.queryId === queryId) {
          clearTimeout(timer);
          unsubscribe();
          resolve(signal.payload.data);
        }
      });
      
      this.signal(type, { ...payload, queryId }, { 
        priority: SIGNAL_PRIORITIES.HIGH 
      });
    });
  }
  
  /**
   * Get bus statistics
   */
  getStats() {
    return {
      handlers: this.handlers.size,
      pending: this.pending.length,
      processed: this.processed,
      dropped: this.dropped
    };
  }
}

/**
 * Dark Signal Protocol
 */
export const DarkSignalProtocol = {
  id: 'DRK-004',
  name: 'Dark Signal Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  types: SIGNAL_TYPES,
  priorities: SIGNAL_PRIORITIES,
  
  createSignal: (type, payload, options) => new DarkSignal(type, payload, options),
  createBus: (config) => new DarkSignalBus(config)
};

export default DarkSignalProtocol;

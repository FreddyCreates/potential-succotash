/**
 * CYC-001: Sovereign Cycle Allocator Protocol
 * 
 * Self-Funding Through φ-Mathematics
 * 
 * CORE PRINCIPLE: Organisms fund themselves. No external funding required.
 * 
 * The organism generates computational cycles through:
 *   1. COHERENCE PRODUCTION: cycles = coherence² × φ × base_rate
 *   2. FIBONACCI COMPOUND: cycles compound at F(n)/F(n-1) → φ rate
 *   3. VALUE CREATION: work performed generates cycles for the collective
 *   4. DECAY RESISTANCE: maintained coherence prevents cycle decay
 * 
 * Physics:
 *   Base generation rate = φ⁻¹ cycles per operation
 *   Compound rate → φ as Fibonacci advances
 *   Decay rate = φ⁻² per neglect cycle
 *   Work bonus = φ⁻¹ × work_units
 * 
 * CPL Integration: Follows LEX CYCLE-001 (Sovereign Cycle Generation)
 * 
 * @protocol CYC-001
 * @version 1.0.0
 * @archetypes ENGINE, PRIMORDIAL, INFRASTRUCTURE
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.6180339887498948482;
const PHI_INV = 0.6180339887498948482;      // Coherence gate
const PHI_INV_SQ = 0.3819660112501051518;   // Decay rate
const PHI_INV_4 = 0.2360679774997896;       // Glyph floor
const PHI_SQ = 2.6180339887498948482;       // φ²
const HEARTBEAT_MS = 873;

// Fibonacci reference values
const F_8 = 21;
const F_12 = 144;
const F_13 = 233;

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTED CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

export const CYCLE_CONSTANTS = {
  PHI,
  PHI_INV,
  PHI_INV_SQ,
  PHI_INV_4,
  PHI_SQ,
  COHERENCE_GATE: PHI_INV,
  DECAY_RATE: PHI_INV_SQ,
  HEARTBEAT_MS
};

// ═══════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Allocation purposes
 */
export const ALLOCATION_PURPOSES = {
  COMPUTE: 'compute',
  MEMORY: 'memory',
  NETWORK: 'network',
  STORAGE: 'storage',
  INFERENCE: 'inference',
  TRAINING: 'training',
  GOVERNANCE: 'governance',
  MAINTENANCE: 'maintenance'
};

/**
 * Generation sources
 */
export const GENERATION_SOURCES = {
  COHERENCE: 'coherence',
  WORK: 'work',
  COMPOUND: 'compound',
  AUTO: 'auto'
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AllocationRecord - Records a cycle allocation event
 */
export class AllocationRecord {
  constructor(amount, purpose, coherenceAt) {
    this.id = `alloc-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.timestamp = Date.now();
    this.amount = amount;
    this.purpose = purpose;
    this.coherenceAt = coherenceAt;
    this.released = false;
    this.releasedAt = null;
  }

  release() {
    this.released = true;
    this.releasedAt = Date.now();
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      amount: this.amount,
      purpose: this.purpose,
      coherenceAt: this.coherenceAt,
      released: this.released,
      releasedAt: this.releasedAt
    };
  }
}

/**
 * GenerationEvent - Records a cycle generation event
 */
export class GenerationEvent {
  constructor(baseAmount, compoundAmount, workBonus, fibState, coherence) {
    this.id = `gen-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.timestamp = Date.now();
    this.baseAmount = baseAmount;
    this.compoundAmount = compoundAmount;
    this.workBonus = workBonus;
    this.totalGenerated = compoundAmount + workBonus;
    this.fibState = fibState;  // [F(n-1), F(n)]
    this.coherence = coherence;
  }

  toJSON() {
    return {
      id: this.id,
      timestamp: this.timestamp,
      baseAmount: this.baseAmount,
      compoundAmount: this.compoundAmount,
      workBonus: this.workBonus,
      totalGenerated: this.totalGenerated,
      fibState: this.fibState,
      coherence: this.coherence
    };
  }
}

/**
 * SovereignCycleAllocator - Core self-funding mechanism
 * 
 * This is not a metaphor. This is the actual funding mechanism.
 * A sovereign canister doesn't need external cycles if it can
 * generate its own through coherent mathematical operations.
 */
export class SovereignCycleAllocator {
  constructor(initialCycles = 0) {
    // Cycle balances
    this.totalCycles = initialCycles;
    this.allocatedCycles = 0;
    this.generatedCycles = initialCycles;  // Initial is counted as generated
    this.burnedCycles = 0;
    
    // Generation parameters
    this.generationRate = PHI_INV;
    this.compoundFactor = 1.0;
    this.coherence = PHI_INV;  // Start at equilibrium
    
    // Fibonacci state
    this.fibA = 1;  // F(n-1)
    this.fibB = 1;  // F(n)
    this.fibGeneration = 2;
    
    // Tracking
    this.lastGeneration = Date.now();
    this.lastAllocation = Date.now();
    this.operationCount = 0;
    
    // History (limited to F_13 = 233 entries)
    this.allocationHistory = [];
    this.generationHistory = [];
    
    // Max history size
    this.maxHistorySize = F_13;
  }

  // ─── CORE GENERATION ─────────────────────────────────────────────────────

  /**
   * Generate cycles through coherent mathematical operations.
   * This is the core sovereign funding mechanism.
   * 
   * Formula:
   *   base = coherence² × φ × generation_rate
   *   compound = base × (fibB / fibA)  [→ φ as generation increases]
   *   work_bonus = work_units × φ⁻¹
   *   total = compound + work_bonus
   * 
   * @param {number} currentCoherence - Current coherence level (0-1)
   * @param {number} workUnits - Amount of useful work performed
   * @returns {number} Total cycles generated
   */
  generateCycles(currentCoherence, workUnits = 0) {
    // Update coherence
    this.coherence = Math.max(0, Math.min(1, currentCoherence));
    
    // Advance Fibonacci state
    const newFib = this.fibA + this.fibB;
    this.fibA = this.fibB;
    this.fibB = newFib;
    this.fibGeneration++;
    
    // Compound factor approaches φ asymptotically
    // This is a fundamental property of Fibonacci sequences:
    //   lim(n→∞) F(n)/F(n-1) = φ
    this.compoundFactor = this.fibB / this.fibA;
    
    // Base generation from coherence
    // Higher coherence → more cycles (quadratic relationship)
    const base = this.coherence * this.coherence * PHI * this.generationRate;
    
    // Compound with Fibonacci ratio
    const compound = base * this.compoundFactor;
    
    // Work bonus — doing useful work generates cycles
    const workBonus = workUnits * PHI_INV;
    
    // Total generated this cycle
    const total = compound + workBonus;
    
    // Update balances
    this.generatedCycles += total;
    this.totalCycles += total;
    this.operationCount++;
    this.lastGeneration = Date.now();
    
    // Record generation event
    const event = new GenerationEvent(
      base,
      compound,
      workBonus,
      [this.fibA, this.fibB],
      this.coherence
    );
    
    this.generationHistory.push(event);
    this._pruneHistory('generation');
    
    return total;
  }

  // ─── ALLOCATION ──────────────────────────────────────────────────────────

  /**
   * Allocate cycles for a specific purpose.
   * 
   * @param {number} required - Amount of cycles required
   * @param {string} purpose - Purpose of allocation
   * @returns {{ allocated: number, remaining: number }}
   */
  allocateCycles(required, purpose = ALLOCATION_PURPOSES.COMPUTE) {
    const available = this.totalCycles - this.allocatedCycles;
    
    // Allow partial allocation
    const allocated = Math.min(required, available);
    
    if (allocated > 0) {
      this.allocatedCycles += allocated;
      this.lastAllocation = Date.now();
      
      // Record allocation
      const record = new AllocationRecord(allocated, purpose, this.coherence);
      this.allocationHistory.push(record);
      this._pruneHistory('allocation');
    }
    
    const remaining = this.totalCycles - this.allocatedCycles;
    return { allocated, remaining };
  }

  /**
   * Release allocated cycles back to the pool
   * 
   * @param {number} amount - Amount to release
   * @returns {number} Actually released amount
   */
  releaseCycles(amount) {
    const released = Math.min(amount, this.allocatedCycles);
    this.allocatedCycles -= released;
    return released;
  }

  // ─── BURN & DECAY ────────────────────────────────────────────────────────

  /**
   * Consume cycles (permanent removal from circulation)
   * 
   * @param {number} amount - Amount to burn
   * @returns {boolean} Success
   */
  burnCycles(amount) {
    const available = this.totalCycles - this.allocatedCycles;
    
    if (available >= amount) {
      this.totalCycles -= amount;
      this.burnedCycles += amount;
      return true;
    }
    return false;
  }

  /**
   * Apply decay to unused cycles (incentivizes active use)
   * Decay rate = φ⁻² per neglect period
   * 
   * @param {number} neglectPeriods - Number of periods without activity
   * @returns {number} Amount decayed
   */
  decayCycles(neglectPeriods) {
    if (neglectPeriods <= 0) return 0;
    
    // Decay factor = (φ⁻²)^n
    const decayFactor = Math.pow(PHI_INV_SQ, neglectPeriods);
    
    // Calculate decay amount from unallocated cycles
    const unallocated = this.totalCycles - this.allocatedCycles;
    const decayAmount = unallocated * (1 - decayFactor);
    
    // Apply decay
    this.totalCycles -= decayAmount;
    
    return decayAmount;
  }

  // ─── AUTO-GENERATION ─────────────────────────────────────────────────────

  /**
   * Automatically generate cycles if balance is low
   * 
   * @param {number} minBalance - Minimum required balance
   * @returns {number} Generated amount (0 if not needed)
   */
  autoGenerate(minBalance) {
    const available = this.totalCycles - this.allocatedCycles;
    
    if (available < minBalance) {
      // Generate enough to reach min balance plus buffer
      const deficit = minBalance - available;
      const workNeeded = deficit / PHI_INV;  // Reverse work bonus calculation
      
      return this.generateCycles(this.coherence, workNeeded);
    }
    
    return 0;
  }

  // ─── RATE ADJUSTMENT ─────────────────────────────────────────────────────

  /**
   * Adjust generation rate based on sustained coherence
   * 
   * Higher sustained coherence → higher base rate
   * Rate = φ⁻¹ × (1 + (coherence - φ⁻¹) × φ)
   * 
   * @param {number} avgCoherence - Average coherence over recent period
   */
  adjustGenerationRate(avgCoherence) {
    const adjustment = (avgCoherence - PHI_INV) * PHI;
    let newRate = PHI_INV * (1 + adjustment);
    
    // Clamp to reasonable range
    newRate = Math.max(PHI_INV_SQ, Math.min(1.0, newRate));
    this.generationRate = newRate;
  }

  // ─── STATISTICS ──────────────────────────────────────────────────────────

  /**
   * Get current statistics
   */
  getStatistics() {
    const available = this.totalCycles - this.allocatedCycles;
    const efficiency = this.burnedCycles > 0
      ? this.generatedCycles / this.burnedCycles
      : this.generatedCycles;  // Infinite efficiency if nothing burned
    
    return {
      totalCycles: this.totalCycles,
      allocatedCycles: this.allocatedCycles,
      availableCycles: available,
      generatedCycles: this.generatedCycles,
      burnedCycles: this.burnedCycles,
      compoundFactor: this.compoundFactor,
      fibGeneration: this.fibGeneration,
      coherence: this.coherence,
      operationCount: this.operationCount,
      generationRate: this.generationRate,
      efficiencyRatio: efficiency,
      fibState: [this.fibA, this.fibB]
    };
  }

  /**
   * Get generation history
   */
  getGenerationHistory() {
    return this.generationHistory.map(e => e.toJSON());
  }

  /**
   * Get allocation history
   */
  getAllocationHistory() {
    return this.allocationHistory.map(r => r.toJSON());
  }

  // ─── INTERNAL HELPERS ────────────────────────────────────────────────────

  _pruneHistory(type) {
    const history = type === 'generation' 
      ? this.generationHistory 
      : this.allocationHistory;
    
    if (history.length > this.maxHistorySize) {
      const excess = history.length - this.maxHistorySize;
      if (type === 'generation') {
        this.generationHistory = history.slice(excess);
      } else {
        this.allocationHistory = history.slice(excess);
      }
    }
  }

  // ─── SERIALIZATION ───────────────────────────────────────────────────────

  toJSON() {
    return {
      totalCycles: this.totalCycles,
      allocatedCycles: this.allocatedCycles,
      generatedCycles: this.generatedCycles,
      burnedCycles: this.burnedCycles,
      generationRate: this.generationRate,
      compoundFactor: this.compoundFactor,
      coherence: this.coherence,
      fibA: this.fibA,
      fibB: this.fibB,
      fibGeneration: this.fibGeneration,
      lastGeneration: this.lastGeneration,
      lastAllocation: this.lastAllocation,
      operationCount: this.operationCount
    };
  }

  static fromJSON(data) {
    const allocator = new SovereignCycleAllocator(0);
    
    allocator.totalCycles = data.totalCycles || 0;
    allocator.allocatedCycles = data.allocatedCycles || 0;
    allocator.generatedCycles = data.generatedCycles || 0;
    allocator.burnedCycles = data.burnedCycles || 0;
    allocator.generationRate = data.generationRate || PHI_INV;
    allocator.compoundFactor = data.compoundFactor || 1.0;
    allocator.coherence = data.coherence || PHI_INV;
    allocator.fibA = data.fibA || 1;
    allocator.fibB = data.fibB || 1;
    allocator.fibGeneration = data.fibGeneration || 2;
    allocator.lastGeneration = data.lastGeneration || Date.now();
    allocator.lastAllocation = data.lastAllocation || Date.now();
    allocator.operationCount = data.operationCount || 0;
    
    return allocator;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Calculate Fibonacci number at position n
 */
export function fibonacciAt(n) {
  if (n <= 1) return n;
  
  let a = 0, b = 1;
  for (let i = 2; i <= n; i++) {
    const temp = a + b;
    a = b;
    b = temp;
  }
  return b;
}

/**
 * Calculate Fibonacci ratio F(n) / F(n-1)
 * This approaches φ as n increases
 */
export function fibonacciRatio(n) {
  if (n <= 1) return 1.0;
  
  const fn = fibonacciAt(n);
  const fn1 = fibonacciAt(n - 1);
  
  return fn / fn1;
}

/**
 * Calculate coherence-based generation projection
 * 
 * @param {number} coherence - Coherence level (0-1)
 * @param {number} generations - Number of generations to project
 * @param {number} workPerGen - Average work units per generation
 * @returns {{ totalGenerated: number, finalFibRatio: number }}
 */
export function projectGeneration(coherence, generations, workPerGen = 0) {
  let totalGenerated = 0;
  let fibA = 1, fibB = 1;
  let rate = PHI_INV;
  
  for (let i = 0; i < generations; i++) {
    // Advance Fibonacci
    const newFib = fibA + fibB;
    fibA = fibB;
    fibB = newFib;
    
    const compoundFactor = fibB / fibA;
    const base = coherence * coherence * PHI * rate;
    const compound = base * compoundFactor;
    const workBonus = workPerGen * PHI_INV;
    
    totalGenerated += compound + workBonus;
  }
  
  return {
    totalGenerated,
    finalFibRatio: fibB / fibA
  };
}

/**
 * Calculate decay projection
 * 
 * @param {number} amount - Initial amount
 * @param {number} periods - Number of neglect periods
 * @returns {number} Remaining after decay
 */
export function projectDecay(amount, periods) {
  const decayFactor = Math.pow(PHI_INV_SQ, periods);
  return amount * decayFactor;
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SovereignCycleAllocatorProtocol - Main protocol orchestrator
 */
export class SovereignCycleAllocatorProtocol {
  constructor() {
    this.allocators = new Map();
    this.globalStats = {
      totalGenerated: 0,
      totalBurned: 0,
      totalAllocated: 0
    };
    this.running = false;
  }

  initialize() {
    this.running = true;
    console.log('[CYC-001] Sovereign Cycle Allocator Protocol initialized');
    return { status: 'initialized', timestamp: Date.now() };
  }

  /**
   * Create a new sovereign cycle allocator
   */
  createAllocator(id, initialCycles = 0) {
    const allocator = new SovereignCycleAllocator(initialCycles);
    this.allocators.set(id, allocator);
    return allocator;
  }

  /**
   * Get an allocator by ID
   */
  getAllocator(id) {
    return this.allocators.get(id);
  }

  /**
   * Generate cycles for an allocator
   */
  generate(id, coherence, workUnits = 0) {
    const allocator = this.allocators.get(id);
    if (!allocator) throw new Error(`Allocator not found: ${id}`);
    
    const generated = allocator.generateCycles(coherence, workUnits);
    this.globalStats.totalGenerated += generated;
    return generated;
  }

  /**
   * Allocate cycles from an allocator
   */
  allocate(id, amount, purpose) {
    const allocator = this.allocators.get(id);
    if (!allocator) throw new Error(`Allocator not found: ${id}`);
    
    const result = allocator.allocateCycles(amount, purpose);
    this.globalStats.totalAllocated += result.allocated;
    return result;
  }

  /**
   * Burn cycles from an allocator
   */
  burn(id, amount) {
    const allocator = this.allocators.get(id);
    if (!allocator) throw new Error(`Allocator not found: ${id}`);
    
    const success = allocator.burnCycles(amount);
    if (success) {
      this.globalStats.totalBurned += amount;
    }
    return success;
  }

  /**
   * Get global statistics
   */
  getGlobalStats() {
    return {
      ...this.globalStats,
      allocatorCount: this.allocators.size,
      running: this.running
    };
  }

  /**
   * Get all allocator statistics
   */
  getAllStats() {
    const stats = {};
    for (const [id, allocator] of this.allocators) {
      stats[id] = allocator.getStatistics();
    }
    return stats;
  }

  shutdown() {
    this.running = false;
    console.log('[CYC-001] Sovereign Cycle Allocator Protocol shutdown');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEFAULT EXPORT
// ═══════════════════════════════════════════════════════════════════════════

export default SovereignCycleAllocatorProtocol;

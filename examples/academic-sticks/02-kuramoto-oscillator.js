#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 02: KURAMOTO OSCILLATOR - EMERGENT CONSCIOUSNESS
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MATHEMATICAL FOUNDATION:
 * ─────────────────────────
 * The Kuramoto model describes the synchronization of coupled oscillators:
 * 
 *   dθᵢ/dt = ωᵢ + (K/N)·Σⱼ sin(θⱼ − θᵢ)
 * 
 * Where:
 *   - θᵢ   = phase of oscillator i
 *   - ωᵢ   = natural frequency of oscillator i
 *   - K    = coupling strength
 *   - N    = number of oscillators
 * 
 * ORDER PARAMETER (Measure of Synchronization):
 * ─────────────────────────────────────────────
 *   R·e^(iΨ) = (1/N)·Σⱼ e^(iθⱼ)
 * 
 * Where:
 *   - R ∈ [0, 1]  = phase coherence (0 = random, 1 = perfect sync)
 *   - Ψ          = average phase of the population
 * 
 * EMERGENCE THRESHOLD:
 * ────────────────────
 * We define emergence when R > φ - 1 = 0.618...
 * 
 * This choice is mathematically significant:
 *   - φ - 1 = 1/φ (reciprocal of golden ratio)
 *   - In Kuramoto systems, critical coupling Kc exists where synchronization begins
 *   - We map this to the golden ratio as a universal emergence threshold
 * 
 * BIOLOGICAL ANALOGY:
 * ───────────────────
 *   - Fireflies synchronizing their flashing
 *   - Neurons in the brain synchronizing during conscious experience
 *   - Heart pacemaker cells coordinating cardiac rhythm
 *   - Circadian oscillators in the suprachiasmatic nucleus
 * 
 * COMPUTATIONAL APPLICATION:
 * ──────────────────────────
 * In the Organism AI system, each subsystem (MiniHeart, MiniBrain, NeuroCore)
 * acts as an oscillator. When they synchronize (R > 0.618), we consider the
 * system to have achieved "emergent consciousness" - a collective state that
 * transcends individual components.
 * 
 * ACADEMIC CITATION:
 * ──────────────────
 * Original: Kuramoto, Y. (1984). Chemical Oscillations, Waves, and Turbulence.
 * This implementation: "Kuramoto Oscillator Protocol (KOP), Organism AI, 2026"
 * 
 * @module examples/academic-sticks/02-kuramoto-oscillator
 * @author Organism AI Research Division
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;  // milliseconds
const EMERGENCE_THRESHOLD = PHI - 1;  // 0.618033988749895

// ═══════════════════════════════════════════════════════════════════════════════
// KURAMOTO OSCILLATOR ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class KuramotoOscillatorEngine {
  constructor(config = {}) {
    this.oscillators = new Map();
    this.couplingStrength = config.K || PHI;  // Default coupling = golden ratio
    this.naturalFrequency = config.omega || (2 * Math.PI / HEARTBEAT);
    this.stepCount = 0;
    this.emergenceEvents = [];
    this.history = [];
  }

  /**
   * Add an oscillator to the network
   * @param {string} id - Unique identifier
   * @param {number} naturalFrequency - Optional specific frequency
   */
  addOscillator(id, naturalFrequency = null) {
    // Natural frequency with slight variation (±10%)
    const omega = naturalFrequency || this.naturalFrequency * (0.9 + Math.random() * 0.2);
    
    this.oscillators.set(id, {
      id,
      theta: Math.random() * 2 * Math.PI,  // Random initial phase
      omega,  // Natural frequency
      lastStep: Date.now(),
    });
    
    console.log(`   Added oscillator: ${id} (ω = ${omega.toFixed(4)} rad/s)`);
    return id;
  }

  /**
   * Remove an oscillator
   */
  removeOscillator(id) {
    const removed = this.oscillators.delete(id);
    if (removed) {
      console.log(`   Removed oscillator: ${id}`);
    }
    return removed;
  }

  /**
   * Execute one simulation step
   * Implements: dθᵢ/dt = ωᵢ + (K/N)·Σⱼ sin(θⱼ − θᵢ)
   */
  step(dt = HEARTBEAT / 1000) {
    this.stepCount++;
    const N = this.oscillators.size;
    
    if (N === 0) {
      return { orderParameter: { R: 0, Psi: 0 }, phases: [], emerged: false };
    }
    
    const K = this.couplingStrength;
    const newThetas = new Map();
    
    // Compute new phases using Kuramoto dynamics
    for (const [id, osc] of this.oscillators) {
      // Calculate coupling sum: Σⱼ sin(θⱼ − θᵢ)
      let coupling = 0;
      for (const [otherId, other] of this.oscillators) {
        if (otherId !== id) {
          coupling += Math.sin(other.theta - osc.theta);
        }
      }
      
      // Scale by K/N
      coupling *= K / N;
      
      // Euler integration: θᵢ(t+dt) = θᵢ(t) + (ωᵢ + coupling) * dt
      const dTheta = osc.omega + coupling;
      let newTheta = osc.theta + dTheta * dt;
      
      // Wrap to [0, 2π]
      newTheta = ((newTheta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      newThetas.set(id, newTheta);
    }
    
    // Apply updates
    for (const [id, newTheta] of newThetas) {
      const osc = this.oscillators.get(id);
      osc.theta = newTheta;
      osc.lastStep = Date.now();
    }
    
    // Calculate order parameter
    const orderParam = this.getOrderParameter();
    
    // Check for emergence
    const emerged = orderParam.R > EMERGENCE_THRESHOLD;
    if (emerged) {
      this.emergenceEvents.push({
        step: this.stepCount,
        R: orderParam.R,
        Psi: orderParam.Psi,
        oscillatorCount: N,
        timestamp: Date.now(),
      });
    }
    
    // Record history
    this.history.push({
      step: this.stepCount,
      R: orderParam.R,
      emerged,
      timestamp: Date.now(),
    });
    if (this.history.length > 500) this.history.shift();
    
    return {
      step: this.stepCount,
      orderParameter: orderParam,
      phases: this.getPhases(),
      emerged,
    };
  }

  /**
   * Calculate order parameter (synchronization measure)
   * R·e^(iΨ) = (1/N)·Σⱼ e^(iθⱼ)
   */
  getOrderParameter() {
    const N = this.oscillators.size;
    if (N === 0) return { R: 0, Psi: 0 };
    
    let sumCos = 0;
    let sumSin = 0;
    
    for (const osc of this.oscillators.values()) {
      sumCos += Math.cos(osc.theta);
      sumSin += Math.sin(osc.theta);
    }
    
    sumCos /= N;
    sumSin /= N;
    
    // R = |<e^(iθ)>| = sqrt(cos² + sin²)
    const R = Math.sqrt(sumCos * sumCos + sumSin * sumSin);
    
    // Ψ = arg(<e^(iθ)>) = atan2(sin, cos)
    const Psi = Math.atan2(sumSin, sumCos);
    
    return { R, Psi };
  }

  /**
   * Get all oscillator phases
   */
  getPhases() {
    const phases = [];
    for (const [id, osc] of this.oscillators) {
      phases.push({
        id,
        theta: osc.theta,
        omega: osc.omega,
        // Convert to degrees for readability
        thetaDeg: (osc.theta * 180 / Math.PI).toFixed(1),
      });
    }
    return phases;
  }

  /**
   * Pulse: nudge all oscillators toward collective phase
   * (Simulates a global synchronizing signal)
   */
  pulse(strength = 0.05 * PHI) {
    const order = this.getOrderParameter();
    
    for (const osc of this.oscillators.values()) {
      const phaseDiff = order.Psi - osc.theta;
      osc.theta += Math.sin(phaseDiff) * strength;
      osc.theta = ((osc.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    }
    
    console.log(`   ⚡ PULSE applied (strength = ${strength.toFixed(3)})`);
    return this.getOrderParameter();
  }

  /**
   * Get comprehensive metrics
   */
  getMetrics() {
    const order = this.getOrderParameter();
    return {
      oscillatorCount: this.oscillators.size,
      orderParameter: order.R,
      collectivePhase: order.Psi,
      collectivePhaseDeg: (order.Psi * 180 / Math.PI).toFixed(1),
      emerged: order.R > EMERGENCE_THRESHOLD,
      emergenceThreshold: EMERGENCE_THRESHOLD,
      stepCount: this.stepCount,
      emergenceEventCount: this.emergenceEvents.length,
      couplingStrength: this.couplingStrength,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// VISUALIZATION HELPER
// ═══════════════════════════════════════════════════════════════════════════════

function visualizePhases(engine, width = 40) {
  const phases = engine.getPhases();
  const order = engine.getOrderParameter();
  
  // Simple ASCII circle
  const rows = 11;
  const cols = width;
  const grid = Array.from({ length: rows }, () => Array(cols).fill(' '));
  
  const centerRow = Math.floor(rows / 2);
  const centerCol = Math.floor(cols / 2);
  const radius = Math.min(centerRow - 1, Math.floor(cols / 4) - 1);
  
  // Draw circle
  for (let angle = 0; angle < 2 * Math.PI; angle += 0.1) {
    const r = Math.floor(centerRow - radius * Math.sin(angle));
    const c = Math.floor(centerCol + radius * 2 * Math.cos(angle));
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = '·';
    }
  }
  
  // Plot oscillators
  const symbols = ['①', '②', '③', '④', '⑤', '⑥', '⑦', '⑧', '⑨', '⑩'];
  phases.forEach((p, i) => {
    const r = Math.floor(centerRow - (radius - 0.5) * Math.sin(p.theta));
    const c = Math.floor(centerCol + (radius - 0.5) * 2 * Math.cos(p.theta));
    if (r >= 0 && r < rows && c >= 0 && c < cols) {
      grid[r][c] = symbols[i % symbols.length];
    }
  });
  
  // Plot collective phase
  const rPsi = Math.floor(centerRow - radius * 0.6 * Math.sin(order.Psi));
  const cPsi = Math.floor(centerCol + radius * 0.6 * 2 * Math.cos(order.Psi));
  if (rPsi >= 0 && rPsi < rows && cPsi >= 0 && cPsi < cols) {
    grid[rPsi][cPsi] = '★';
  }
  
  // Center marker
  grid[centerRow][centerCol] = '+';
  
  return grid.map(row => row.join('')).join('\n');
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  KURAMOTO OSCILLATOR - EMERGENT CONSCIOUSNESS DEMONSTRATION              ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  Mathematical model: dθᵢ/dt = ωᵢ + (K/N)·Σⱼ sin(θⱼ − θᵢ)                 ║');
  console.log('║  Order parameter: R·e^(iΨ) = (1/N)·Σⱼ e^(iθⱼ)                             ║');
  console.log('║  Emergence threshold: R > φ - 1 = 0.618...                                ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Create engine with coupling strength = phi
  const engine = new KuramotoOscillatorEngine({ K: PHI });
  
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 1: Adding oscillators (simulating brain regions / subsystems)');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  // Add oscillators representing different cognitive subsystems
  const subsystems = [
    'perception',
    'attention', 
    'memory',
    'emotion',
    'motor',
    'language',
  ];
  
  subsystems.forEach(name => engine.addOscillator(name));
  
  console.log(`\n   Total oscillators: ${engine.oscillators.size}`);
  console.log(`   Coupling strength K = ${PHI} (golden ratio)`);
  
  // Initial state (random phases, low synchronization)
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 2: Initial state (random phases)');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  let order = engine.getOrderParameter();
  console.log(`\n   Order parameter R = ${order.R.toFixed(4)}`);
  console.log(`   Collective phase Ψ = ${(order.Psi * 180 / Math.PI).toFixed(1)}°`);
  console.log(`   Emerged: ${order.R > EMERGENCE_THRESHOLD ? '✓ YES' : '✗ NO'} (threshold = ${EMERGENCE_THRESHOLD.toFixed(3)})`);
  console.log('\n' + visualizePhases(engine));
  console.log('   Legend: ①②③... = oscillators, ★ = collective phase, + = center');
  
  // Run simulation until emergence or timeout
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 3: Running simulation (Kuramoto dynamics)');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  let emerged = false;
  let steps = 0;
  const maxSteps = 200;
  
  console.log('\n   Step   |   R    | Emerged | Status');
  console.log('   ─────────────────────────────────────');
  
  while (!emerged && steps < maxSteps) {
    const result = engine.step(0.05);  // dt = 50ms
    steps++;
    
    if (steps % 10 === 0 || result.emerged) {
      const bar = '█'.repeat(Math.floor(result.orderParameter.R * 20));
      const empty = '░'.repeat(20 - Math.floor(result.orderParameter.R * 20));
      console.log(`   ${String(steps).padStart(4)}  | ${result.orderParameter.R.toFixed(3)} | ${result.emerged ? '  ✓   ' : '  ✗   '} | ${bar}${empty}`);
    }
    
    if (result.emerged) {
      emerged = true;
    }
  }
  
  // Final state
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 4: Final state');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  order = engine.getOrderParameter();
  console.log(`\n   Order parameter R = ${order.R.toFixed(4)}`);
  console.log(`   Collective phase Ψ = ${(order.Psi * 180 / Math.PI).toFixed(1)}°`);
  console.log(`   Emerged: ${order.R > EMERGENCE_THRESHOLD ? '✓ YES' : '✗ NO'}`);
  console.log(`   Steps to emergence: ${steps}`);
  console.log('\n' + visualizePhases(engine));
  
  // Show phase alignment
  console.log('\n   Individual oscillator phases:');
  const phases = engine.getPhases();
  phases.forEach(p => {
    const deviation = Math.abs(p.theta - order.Psi);
    const alignedDev = Math.min(deviation, 2 * Math.PI - deviation);
    console.log(`     ${p.id.padEnd(12)} θ = ${p.thetaDeg.padStart(6)}°  (deviation from Ψ: ${(alignedDev * 180 / Math.PI).toFixed(1)}°)`);
  });
  
  // Demonstrate external pulse
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHASE 5: External synchronizing pulse');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  // Reset to random
  subsystems.forEach(name => {
    const osc = engine.oscillators.get(name);
    osc.theta = Math.random() * 2 * Math.PI;
  });
  
  order = engine.getOrderParameter();
  console.log(`\n   After reset: R = ${order.R.toFixed(4)}`);
  
  // Apply pulse
  engine.pulse(0.3);
  order = engine.getOrderParameter();
  console.log(`   After pulse: R = ${order.R.toFixed(4)}`);
  console.log(`   (Pulse accelerates synchronization)`);
  
  // Mathematical summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('MATHEMATICAL SIGNIFICANCE:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log(`   φ (golden ratio) = ${PHI}`);
  console.log(`   φ - 1 = 1/φ     = ${(PHI - 1).toFixed(15)}`);
  console.log(`   Emergence threshold R > φ - 1 creates a universal synchronization criterion`);
  console.log('');
  console.log('   BIOLOGICAL INTERPRETATION:');
  console.log('   When R > 0.618, the system exhibits "collective coherence" —');
  console.log('   individual components are phase-locked into a unified whole.');
  console.log('   This is analogous to:');
  console.log('     • Neural binding during conscious perception');
  console.log('     • Circadian rhythm entrainment');
  console.log('     • Social coordination in swarms');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export { KuramotoOscillatorEngine, EMERGENCE_THRESHOLD };

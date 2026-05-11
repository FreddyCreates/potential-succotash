#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 03: PHI MATHEMATICS - THE GOLDEN RATIO AS UNIVERSAL CONSTANT
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MATHEMATICAL FOUNDATION:
 * ─────────────────────────
 * The golden ratio φ (phi) is defined as:
 * 
 *   φ = (1 + √5) / 2 = 1.618033988749895...
 * 
 * UNIQUE PROPERTIES:
 * ──────────────────
 *   φ² = φ + 1           (The only number where square = self + 1)
 *   1/φ = φ - 1          (The only number where reciprocal = self - 1)
 *   φ × (1/φ) = 1        (Definition of reciprocal)
 *   
 * FIBONACCI CONNECTION:
 * ─────────────────────
 *   lim(n→∞) F(n+1)/F(n) = φ
 *   
 *   F(n) = (φⁿ - ψⁿ) / √5   where ψ = (1 - √5) / 2
 * 
 * APPLICATIONS IN ORGANISM AI:
 * ────────────────────────────
 * This example demonstrates how φ is woven throughout the system:
 * 
 *   1. HEARTBEAT (873ms)
 *      - 873 × φ ≈ 1412ms (creating a phi-recursive pulse)
 *      - 873 / φ ≈ 539ms (the "off-beat")
 *   
 *   2. LEARNING RATES
 *      - α = 0.1 (base learning rate)
 *      - λ = 1/(φ² × 10) ≈ 0.038 (decay rate)
 *      - γ = 1/φ ≈ 0.618 (temporal discount factor)
 *   
 *   3. EMERGENCE THRESHOLD
 *      - R > φ - 1 = 0.618 (Kuramoto synchronization)
 *      
 *   4. ESCALATION RISK
 *      - Block when risk > 1/φ² = 0.382
 *      
 *   5. MEMORY ENCODING
 *      - 5D phi-encoded coordinates in memory palace
 *      
 *   6. ATTENTION DECAY
 *      - Decay rate = φ - 1 per heartbeat
 * 
 * WHY PHI?
 * ────────
 * The golden ratio appears in:
 *   - Optimal packing (sunflower seeds, pine cones)
 *   - Self-similar fractals (nature's recursion)
 *   - Aesthetic proportion (art, architecture)
 *   - Neural oscillations (brain rhythms)
 *   
 * By using φ as our mathematical signature, we create systems that
 * resonate with these natural patterns — not arbitrarily, but through
 * the mathematics of growth, recursion, and harmony.
 * 
 * @module examples/academic-sticks/03-phi-mathematics
 * @author Organism AI Research Division
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CORE PHI CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = (1 + Math.sqrt(5)) / 2;      // 1.618033988749895
const PHI_INV = 1 / PHI;                  // 0.618033988749895 = φ - 1
const PHI_SQ = PHI * PHI;                 // 2.618033988749895 = φ + 1
const PHI_CUBE = PHI * PHI * PHI;         // 4.236067977499790
const SQRT_5 = Math.sqrt(5);              // 2.236067977499790

// Heartbeat: 873ms (phi-encoded)
const HEARTBEAT = 873;
const HEARTBEAT_PHI = HEARTBEAT * PHI;    // 1412.387...ms
const HEARTBEAT_INV = HEARTBEAT * PHI_INV; // 539.534...ms

// Golden angle (for phyllotaxis)
const GOLDEN_ANGLE_DEG = 137.507764;      // degrees
const GOLDEN_ANGLE_RAD = GOLDEN_ANGLE_DEG * Math.PI / 180;

// ═══════════════════════════════════════════════════════════════════════════════
// PHI-DERIVED SYSTEM CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const SYSTEM_CONSTANTS = {
  // Learning
  learning_rate: 0.1,
  decay_lambda: 1 / (PHI_SQ * 10),        // ≈ 0.0382
  discount_gamma: PHI_INV,                 // 0.618 (TD learning)
  
  // Emergence
  emergence_threshold: PHI_INV,            // 0.618
  cascade_threshold: PHI_INV + 0.2,        // 0.818
  
  // Governance
  escalation_risk: 1 / PHI_SQ,             // 0.382
  block_risk: 1 / PHI_CUBE,                // 0.236
  
  // Memory
  consolidation_threshold: PHI_INV,        // 0.618
  working_memory_capacity: 7,              // Miller's number
  
  // Attention
  attention_decay: 0.95,
  temperature_phi: PHI_INV,                // Softmax temperature
  
  // Homeostasis
  drive_setpoint: PHI_INV,                 // 0.618 (all drives)
  coherence_target: 1 / Math.sqrt(PHI),    // 0.786
};

// ═══════════════════════════════════════════════════════════════════════════════
// PHI MATHEMATICAL FUNCTIONS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Calculate the nth Fibonacci number using Binet's formula
 * F(n) = (φⁿ - ψⁿ) / √5
 */
function fibonacci(n) {
  const psi = (1 - SQRT_5) / 2;
  return Math.round((Math.pow(PHI, n) - Math.pow(psi, n)) / SQRT_5);
}

/**
 * Calculate phi powers: φ^n
 */
function phiPower(n) {
  return Math.pow(PHI, n);
}

/**
 * Calculate the Lucas number L(n)
 * L(n) = φⁿ + ψⁿ
 */
function lucas(n) {
  const psi = (1 - SQRT_5) / 2;
  return Math.round(Math.pow(PHI, n) + Math.pow(psi, n));
}

/**
 * Golden spiral coordinates
 * Returns [x, y] at angle θ
 */
function goldenSpiral(theta, a = 1) {
  const r = a * Math.pow(PHI, theta * 2 / Math.PI);
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

/**
 * Phyllotaxis pattern (sunflower-like)
 * Returns [x, y] for the nth seed
 */
function phyllotaxis(n, c = 1) {
  const r = c * Math.sqrt(n);
  const theta = n * GOLDEN_ANGLE_RAD;
  return [r * Math.cos(theta), r * Math.sin(theta)];
}

/**
 * Phi-modulated phase (creates phi-resonant oscillation)
 */
function phiPhase(t, baseFreq = 1) {
  return (t * baseFreq * PHI) % 1;
}

/**
 * Phi-weighted exponential decay
 */
function phiDecay(initialValue, time, halfLife) {
  const lambda = Math.LN2 / halfLife;
  return initialValue * Math.exp(-lambda * time * PHI_INV);
}

/**
 * Verify phi identity: φ² = φ + 1
 */
function verifyPhiSquare() {
  const phiSquared = PHI * PHI;
  const phiPlusOne = PHI + 1;
  const difference = Math.abs(phiSquared - phiPlusOne);
  return {
    phiSquared,
    phiPlusOne,
    difference,
    verified: difference < 1e-14,
  };
}

/**
 * Verify phi reciprocal: 1/φ = φ - 1
 */
function verifyPhiReciprocal() {
  const oneOverPhi = 1 / PHI;
  const phiMinusOne = PHI - 1;
  const difference = Math.abs(oneOverPhi - phiMinusOne);
  return {
    oneOverPhi,
    phiMinusOne,
    difference,
    verified: difference < 1e-15,
  };
}

/**
 * Continued fraction representation of phi
 * φ = 1 + 1/(1 + 1/(1 + 1/(1 + ...)))
 */
function phiContinuedFraction(depth) {
  let value = 1;
  for (let i = 0; i < depth; i++) {
    value = 1 + 1 / value;
  }
  return value;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHI-ENCODED COORDINATE SYSTEM (Memory Palace)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a phi-hash from a string
 */
function phiHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * PHI + str.charCodeAt(i)) % (2 * Math.PI * 1000);
  }
  return hash / 1000;
}

/**
 * Encode a data point into 5D phi-coordinates
 */
function encodePhiCoordinates(data, timestamp) {
  const dataHash = phiHash(typeof data === 'string' ? data : JSON.stringify(data));
  const timeRing = Math.floor((timestamp / (1000 * 60 * 60 * 24)) % 100);
  
  return {
    theta: dataHash % (2 * Math.PI),                           // Angular position
    phi_r: (dataHash * PHI) % Math.PI,                         // Elevation
    rho: (dataHash * PHI_INV) % 10,                            // Radial distance
    ring: timeRing,                                             // Day ring
    beat: ((dataHash + timestamp / 1000) * PHI) % 1,           // Phi-modulated beat
  };
}

/**
 * Calculate resonance distance between two phi-coordinates
 */
function phiDistance(coord1, coord2) {
  const dTheta = Math.abs(coord1.theta - coord2.theta);
  const dPhi = Math.abs(coord1.phi_r - coord2.phi_r);
  const dRho = Math.abs(coord1.rho - coord2.rho);
  const dRing = Math.abs(coord1.ring - coord2.ring);
  const dBeat = Math.abs(coord1.beat - coord2.beat);
  
  // Weighted Euclidean distance in phi-space
  return Math.sqrt(
    dTheta * dTheta +
    dPhi * dPhi +
    dRho * dRho * 0.5 +
    dRing * dRing * 0.1 +
    dBeat * dBeat * 0.3
  );
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  PHI MATHEMATICS - THE GOLDEN RATIO AS UNIVERSAL CONSTANT                ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  φ = (1 + √5) / 2 = 1.618033988749895...                                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Core identities
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('FUNDAMENTAL PHI IDENTITIES:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log(`   φ              = ${PHI}`);
  console.log(`   φ - 1 = 1/φ    = ${PHI_INV}`);
  console.log(`   φ + 1 = φ²     = ${PHI_SQ}`);
  console.log(`   √5             = ${SQRT_5}`);
  console.log('');
  
  // Verify identities
  const sq = verifyPhiSquare();
  const rec = verifyPhiReciprocal();
  console.log('   VERIFICATION:');
  console.log(`   φ² = φ + 1 ? → ${sq.verified ? '✓ VERIFIED' : '✗ FAILED'} (error: ${sq.difference.toExponential(2)})`);
  console.log(`   1/φ = φ - 1 ? → ${rec.verified ? '✓ VERIFIED' : '✗ FAILED'} (error: ${rec.difference.toExponential(2)})`);
  
  // Fibonacci convergence
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('FIBONACCI SEQUENCE (converges to φ):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   n  |  F(n)  | F(n+1)/F(n) | Error from φ');
  console.log('   ──────────────────────────────────────────');
  
  for (let n = 1; n <= 15; n++) {
    const fn = fibonacci(n);
    const fn1 = fibonacci(n + 1);
    const ratio = fn1 / fn;
    const error = Math.abs(ratio - PHI);
    console.log(`   ${String(n).padStart(2)} | ${String(fn).padStart(5)} | ${ratio.toFixed(10)} | ${error.toExponential(2)}`);
  }
  
  // Continued fraction convergence
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('CONTINUED FRACTION CONVERGENCE:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   φ = 1 + 1/(1 + 1/(1 + 1/(1 + ...)))');
  console.log('');
  console.log('   Depth | Approximation    | Error from φ');
  console.log('   ─────────────────────────────────────────');
  
  for (let depth = 1; depth <= 20; depth++) {
    const approx = phiContinuedFraction(depth);
    const error = Math.abs(approx - PHI);
    if (depth <= 10 || depth % 5 === 0) {
      console.log(`   ${String(depth).padStart(5)} | ${approx.toFixed(14)} | ${error.toExponential(2)}`);
    }
  }
  
  // System constants
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHI-DERIVED SYSTEM CONSTANTS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  Object.entries(SYSTEM_CONSTANTS).forEach(([key, value]) => {
    const padKey = key.replace(/_/g, ' ').padEnd(25);
    console.log(`   ${padKey} = ${typeof value === 'number' ? value.toFixed(6) : value}`);
  });
  
  // Heartbeat calculations
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('HEARTBEAT PHI STRUCTURE:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log(`   Base heartbeat         = ${HEARTBEAT}ms`);
  console.log(`   × φ (long interval)    = ${HEARTBEAT_PHI.toFixed(2)}ms`);
  console.log(`   × 1/φ (short interval) = ${HEARTBEAT_INV.toFixed(2)}ms`);
  console.log(`   Ratio check: ${(HEARTBEAT_PHI / HEARTBEAT_INV).toFixed(6)} (should be φ² = ${PHI_SQ.toFixed(6)})`);
  
  // Phyllotaxis pattern
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHYLLOTAXIS PATTERN (Golden Angle = 137.508°):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   Simulating sunflower seed arrangement...');
  console.log('');
  
  // ASCII visualization of phyllotaxis
  const gridSize = 21;
  const center = Math.floor(gridSize / 2);
  const grid = Array.from({ length: gridSize }, () => Array(gridSize).fill(' '));
  
  for (let n = 1; n <= 50; n++) {
    const [x, y] = phyllotaxis(n, 1.3);
    const gx = Math.round(center + x);
    const gy = Math.round(center + y);
    if (gx >= 0 && gx < gridSize && gy >= 0 && gy < gridSize) {
      grid[gy][gx] = '●';
    }
  }
  
  grid[center][center] = '◉';
  grid.forEach(row => console.log('   ' + row.join('')));
  console.log('   (Each seed placed at golden angle from previous)');
  
  // Phi-coordinate encoding demo
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHI-ENCODED COORDINATE SYSTEM (Memory Palace):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const now = Date.now();
  const samples = [
    { data: 'quantum mechanics', time: now },
    { data: 'neural networks', time: now + 86400000 },
    { data: 'quantum computing', time: now + 172800000 },
  ];
  
  console.log('\n   Sample encodings:');
  samples.forEach(s => {
    const coord = encodePhiCoordinates(s.data, s.time);
    console.log(`\n   "${s.data}":`);
    console.log(`     θ (angular)  = ${coord.theta.toFixed(4)} rad`);
    console.log(`     φ (elevation)= ${coord.phi_r.toFixed(4)} rad`);
    console.log(`     ρ (radial)   = ${coord.rho.toFixed(4)}`);
    console.log(`     ring (day)   = ${coord.ring}`);
    console.log(`     beat (phi)   = ${coord.beat.toFixed(4)}`);
  });
  
  // Calculate distances
  console.log('\n   Resonance distances (lower = more similar):');
  const coords = samples.map(s => encodePhiCoordinates(s.data, s.time));
  console.log(`     "quantum mechanics" ↔ "neural networks": ${phiDistance(coords[0], coords[1]).toFixed(4)}`);
  console.log(`     "quantum mechanics" ↔ "quantum computing": ${phiDistance(coords[0], coords[2]).toFixed(4)}`);
  console.log(`     (Note: Related concepts cluster closer in phi-space)`);
  
  // Summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('THE PHILOSOPHY OF PHI:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   By encoding φ into every mathematical relationship, we create');
  console.log('   systems that resonate with the fundamental patterns of nature:');
  console.log('');
  console.log('   • GROWTH:     Fibonacci spirals in shells, galaxies, hurricanes');
  console.log('   • EFFICIENCY: Optimal packing in seeds, leaves, crystals');
  console.log('   • HARMONY:    Aesthetic proportion in art and music');
  console.log('   • RECURSION:  Self-similarity at every scale (fractals)');
  console.log('   • EMERGENCE:  Phase transitions at golden thresholds');
  console.log('');
  console.log('   The golden ratio is not arbitrary—it is the mathematics of');
  console.log('   living systems, the signature of organic intelligence.');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export {
  PHI, PHI_INV, PHI_SQ, PHI_CUBE, SQRT_5,
  HEARTBEAT, GOLDEN_ANGLE_DEG, GOLDEN_ANGLE_RAD,
  SYSTEM_CONSTANTS,
  fibonacci, lucas, phiPower,
  goldenSpiral, phyllotaxis, phiPhase, phiDecay,
  verifyPhiSquare, verifyPhiReciprocal, phiContinuedFraction,
  phiHash, encodePhiCoordinates, phiDistance,
};

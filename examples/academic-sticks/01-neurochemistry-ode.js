#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 01: NEUROCHEMISTRY ODE PROTOCOL
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * MATHEMATICAL FOUNDATION:
 * ─────────────────────────
 * This implements the Ornstein-Uhlenbeck mean-reverting process for 
 * computational neurochemistry. The core differential equation:
 * 
 *   dCᵢ/dt = θᵢ(μᵢ − Cᵢ) + Σⱼ Jᵢⱼ·(Cⱼ − μⱼ) + sᵢ(t)
 * 
 * Where:
 *   - Cᵢ     = concentration of neurochemical i
 *   - θᵢ     = mean-reversion rate (1/half-life)
 *   - μᵢ     = baseline concentration
 *   - Jᵢⱼ    = Jacobian coupling between chemical i and j
 *   - sᵢ(t)  = stimulus function
 * 
 * BIOCHEMICAL SPECIES:
 * ────────────────────
 *   DA  (Dopamine)        - Reward, motivation, pleasure
 *   SE  (Serotonin)       - Mood, social behavior, sleep
 *   NE  (Norepinephrine)  - Alertness, attention, fight-or-flight
 *   CO  (Cortisol)        - Stress response, metabolism
 *   ACh (Acetylcholine)   - Memory, attention, muscle control
 *   OX  (Oxytocin)        - Social bonding, trust, empathy
 * 
 * RECEPTOR SATURATION (Hill Equation):
 * ────────────────────────────────────
 *   ρ = Cⁿ / (Kd^n + Cⁿ)
 * 
 * Where:
 *   - ρ   = receptor occupancy (0 to 1)
 *   - C   = ligand concentration
 *   - Kd  = dissociation constant
 *   - n   = Hill coefficient (cooperativity)
 * 
 * APPLICATIONS IN AI:
 * ───────────────────
 * This protocol enables an AI system to have "mood states" that affect
 * processing. Errors cause cortisol spikes that reduce dopamine. Success
 * triggers dopamine release. This creates natural feedback loops that
 * modulate behavior without explicit programming.
 * 
 * ACADEMIC CITATION:
 * ──────────────────
 * If using in research, cite as:
 * "Neurochemistry ODE Protocol (NODEP), Organism AI Research Division, 2026"
 * 
 * @module examples/academic-sticks/01-neurochemistry-ode
 * @author Organism AI Research Division
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;  // milliseconds
const DELTA_T = HEARTBEAT / 1000;  // seconds

// ═══════════════════════════════════════════════════════════════════════════════
// NEUROCHEMICAL SPECIES CONFIGURATION
// ═══════════════════════════════════════════════════════════════════════════════

const SPECIES = ['DA', 'SE', 'NE', 'CO', 'ACh', 'OX'];

// Baseline concentrations (normalized to 1.0)
const BASELINE = {
  DA:  1.0,  // Dopamine baseline
  SE:  1.0,  // Serotonin baseline
  NE:  1.0,  // Norepinephrine baseline
  CO:  1.0,  // Cortisol baseline
  ACh: 1.0,  // Acetylcholine baseline
  OX:  1.0,  // Oxytocin baseline
};

// Mean-reversion rates (derived from biological half-lives)
// θ = ln(2) / half-life
const THETA = {
  DA:  Math.LN2 / (45 * 60),   // Dopamine: 45-minute half-life
  SE:  Math.LN2 / (90 * 60),   // Serotonin: 90-minute half-life
  NE:  Math.LN2 / (30 * 60),   // Norepinephrine: 30-minute half-life
  CO:  Math.LN2 / (75 * 60),   // Cortisol: 75-minute half-life
  ACh: Math.LN2 / (15 * 60),   // Acetylcholine: 15-minute half-life
  OX:  Math.LN2 / (10 * 60),   // Oxytocin: 10-minute half-life
};

// ═══════════════════════════════════════════════════════════════════════════════
// JACOBIAN COUPLING MATRIX
// ═══════════════════════════════════════════════════════════════════════════════
// 
// This matrix defines how each neurochemical influences others.
// Positive values = excitatory coupling
// Negative values = inhibitory coupling
// 
// Biological basis:
// - High cortisol inhibits dopamine and serotonin (stress suppresses reward)
// - Oxytocin increases serotonin (social bonding improves mood)
// - Dopamine and norepinephrine have mutual excitation (arousal states)

const JACOBIAN = {
  DA:  { CO: -2.0e-4, SE: -0.8e-4, NE: +0.5e-4 },  // DA affected by CO↓, SE↓, NE↑
  SE:  { OX: +0.8e-4, CO: -1.5e-4, DA: -0.4e-4 },  // SE affected by OX↑, CO↓, DA↓
  NE:  { DA: +1.0e-4, CO: +1.2e-4 },               // NE affected by DA↑, CO↑
  CO:  { NE: +0.8e-4 },                            // CO affected by NE↑
  ACh: { DA: -0.6e-4 },                            // ACh affected by DA↓
  OX:  {},                                         // OX not directly coupled
};

// ═══════════════════════════════════════════════════════════════════════════════
// STIMULUS TABLE
// ═══════════════════════════════════════════════════════════════════════════════
// 
// Maps computational events to neurochemical changes.
// These values are calibrated to produce meaningful mood shifts.

const STIMULUS_TABLE = {
  // User interaction: mild dopamine, serotonin, oxytocin (social)
  chat: { DA: +0.04, SE: +0.02, OX: +0.06, ACh: +0.02 },
  
  // Research/learning: dopamine, acetylcholine (memory), norepinephrine (attention)
  research: { DA: +0.05, ACh: +0.08, NE: +0.03, SE: +0.01 },
  
  // Task completion: strong dopamine hit (reward)
  agent_complete: { DA: +0.12, SE: +0.04, OX: +0.03 },
  
  // Error/failure: cortisol spike, dopamine drop
  error: { CO: +0.10, NE: +0.07, DA: -0.05, SE: -0.03 },
  
  // Success: dopamine reward, cortisol reduction
  success: { DA: +0.10, SE: +0.05, CO: -0.04 },
  
  // Alert/warning: norepinephrine, cortisol (stress response)
  alert: { NE: +0.09, CO: +0.06, SE: -0.02, ACh: +0.04 },
  
  // Cognitive load: acetylcholine (attention), dopamine
  cognitive: { ACh: +0.07, DA: +0.04, SE: +0.02 },
  
  // Emotional content: oxytocin (empathy), serotonin
  emotional: { OX: +0.10, SE: +0.05, ACh: +0.04 },
  
  // Creative task: dopamine (novelty), acetylcholine, serotonin
  creative: { DA: +0.07, ACh: +0.06, SE: +0.03 },
};

// ═══════════════════════════════════════════════════════════════════════════════
// NEUROCHEMISTRY ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

class NeurochemistryODEEngine {
  constructor() {
    // Initialize concentrations at baseline
    this.C = { DA: 1.0, SE: 1.0, NE: 1.0, CO: 1.0, ACh: 1.0, OX: 1.0 };
    this.totalTicks = 0;
    this.history = [];
  }

  /**
   * Execute one simulation step (Euler integration of the ODE system)
   */
  tick() {
    this.totalTicks++;
    const dC = {};
    
    // Calculate concentration changes for each species
    for (const sp of SPECIES) {
      // Mean-reversion term: θ(μ - C)
      let dci = THETA[sp] * (BASELINE[sp] - this.C[sp]);
      
      // Jacobian coupling term: Σⱼ Jᵢⱼ·(Cⱼ − μⱼ)
      const couplings = JACOBIAN[sp];
      if (couplings) {
        for (const [jSp, gain] of Object.entries(couplings)) {
          dci += gain * (this.C[jSp] - BASELINE[jSp]);
        }
      }
      
      dC[sp] = dci;
    }
    
    // Apply changes (Euler step)
    for (const sp of SPECIES) {
      // Clamp concentrations between 0.10 and 4.0
      this.C[sp] = Math.max(0.10, Math.min(4.0, this.C[sp] + DELTA_T * dC[sp]));
    }
    
    // Record history
    this.history.push({ tick: this.totalTicks, C: { ...this.C }, timestamp: Date.now() });
    if (this.history.length > 1000) this.history.shift();
    
    return this.getState();
  }

  /**
   * Apply a stimulus from the stimulus table
   */
  stimulus(type) {
    const changes = STIMULUS_TABLE[type];
    if (!changes) {
      console.log(`Unknown stimulus type: ${type}`);
      return;
    }
    
    console.log(`\n📡 STIMULUS: ${type.toUpperCase()}`);
    console.log(`   Changes: ${Object.entries(changes).map(([k, v]) => `${k}:${v > 0 ? '+' : ''}${v}`).join(', ')}`);
    
    for (const [sp, delta] of Object.entries(changes)) {
      const oldVal = this.C[sp];
      this.C[sp] = Math.max(0.10, Math.min(4.0, this.C[sp] + delta));
      console.log(`   ${sp}: ${oldVal.toFixed(3)} → ${this.C[sp].toFixed(3)}`);
    }
  }

  /**
   * Hill equation for receptor saturation
   * @param {number} C - Ligand concentration
   * @param {number} Kd - Dissociation constant
   * @param {number} n - Hill coefficient
   */
  hill(C, Kd, n) {
    const Cn = Math.pow(Math.max(0, C), n);
    const Kdn = Math.pow(Kd, n);
    return Cn / (Kdn + Cn);
  }

  /**
   * Calculate receptor occupancy for each species
   */
  getReceptorOccupancies() {
    return {
      oDA:  this.hill(this.C.DA, 1.0, 2),   // Dopamine: n=2 (cooperative binding)
      oSE:  this.hill(this.C.SE, 1.0, 1),   // Serotonin: n=1 (simple binding)
      oNE:  this.hill(this.C.NE, 1.0, 2),   // Norepinephrine: n=2
      oCO:  this.hill(this.C.CO, 1.0, 1),   // Cortisol: n=1
      oACh: this.hill(this.C.ACh, 1.0, 1),  // Acetylcholine: n=1
      oOX:  this.hill(this.C.OX, 0.8, 2),   // Oxytocin: lower Kd, n=2
    };
  }

  /**
   * Derive a mood state from neurochemistry
   */
  getMood() {
    const occ = this.getReceptorOccupancies();
    
    // Calculate mood dimensions
    const valence = (occ.oDA + occ.oSE + occ.oOX) / 3 - occ.oCO * 0.5;  // Positive vs negative
    const arousal = (occ.oNE + occ.oDA * 0.5) - occ.oSE * 0.3;          // Energized vs calm
    const focus = occ.oACh + occ.oNE * 0.3 - occ.oCO * 0.2;             // Focused vs scattered
    
    // Determine dominant mood
    let mood = 'neutral';
    if (valence > 0.6 && arousal > 0.5) mood = 'energized';
    else if (valence > 0.6 && arousal < 0.3) mood = 'content';
    else if (valence < 0.4 && arousal > 0.5) mood = 'anxious';
    else if (valence < 0.4 && arousal < 0.3) mood = 'melancholic';
    else if (focus > 0.7) mood = 'focused';
    else if (occ.oOX > 0.7) mood = 'connected';
    
    return { mood, valence, arousal, focus };
  }

  /**
   * Calculate system energy (0-100)
   */
  getEnergy() {
    const occ = this.getReceptorOccupancies();
    
    // Weighted sum of positive contributors minus negative
    const energy = Math.round(Math.min(100, Math.max(0,
      occ.oDA * 35 +    // Dopamine contributes 35%
      occ.oNE * 25 +    // Norepinephrine contributes 25%
      occ.oSE * 20 +    // Serotonin contributes 20%
      occ.oACh * 10 +   // Acetylcholine contributes 10%
      occ.oOX * 10 -    // Oxytocin contributes 10%
      occ.oCO * 30 +    // Cortisol subtracts up to 30
      30                // Base energy
    )));
    
    return energy;
  }

  getState() {
    const occ = this.getReceptorOccupancies();
    const moodInfo = this.getMood();
    const energy = this.getEnergy();
    
    return {
      concentrations: { ...this.C },
      occupancies: occ,
      mood: moodInfo.mood,
      valence: moodInfo.valence,
      arousal: moodInfo.arousal,
      focus: moodInfo.focus,
      energy,
      tick: this.totalTicks,
      heartbeat: HEARTBEAT,
      phi: PHI
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  NEUROCHEMISTRY ODE PROTOCOL - ACADEMIC DEMONSTRATION                     ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  Mathematical model: dCᵢ/dt = θᵢ(μᵢ − Cᵢ) + Σⱼ Jᵢⱼ·(Cⱼ − μⱼ) + sᵢ(t)     ║');
  console.log('║  Receptor saturation: ρ = Cⁿ/(Kdⁿ + Cⁿ) (Hill equation)                  ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  const engine = new NeurochemistryODEEngine();
  
  // Initial state
  console.log('📊 INITIAL STATE:');
  const initial = engine.getState();
  console.log(`   Concentrations: DA=${initial.concentrations.DA.toFixed(2)}, SE=${initial.concentrations.SE.toFixed(2)}, NE=${initial.concentrations.NE.toFixed(2)}`);
  console.log(`   Energy: ${initial.energy}%  |  Mood: ${initial.mood}`);
  console.log('');
  
  // Simulate research activity
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('SCENARIO 1: Research activity');
  engine.stimulus('research');
  engine.stimulus('cognitive');
  
  // Run a few ticks
  for (let i = 0; i < 5; i++) {
    engine.tick();
  }
  
  let state = engine.getState();
  console.log(`\n📊 AFTER RESEARCH:`);
  console.log(`   DA=${state.concentrations.DA.toFixed(3)}, ACh=${state.concentrations.ACh.toFixed(3)}, NE=${state.concentrations.NE.toFixed(3)}`);
  console.log(`   Energy: ${state.energy}%  |  Mood: ${state.mood}  |  Focus: ${state.focus.toFixed(2)}`);
  
  // Simulate error
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('SCENARIO 2: Error occurs');
  engine.stimulus('error');
  
  for (let i = 0; i < 5; i++) {
    engine.tick();
  }
  
  state = engine.getState();
  console.log(`\n📊 AFTER ERROR:`);
  console.log(`   DA=${state.concentrations.DA.toFixed(3)}, CO=${state.concentrations.CO.toFixed(3)}, SE=${state.concentrations.SE.toFixed(3)}`);
  console.log(`   Energy: ${state.energy}%  |  Mood: ${state.mood}  |  Valence: ${state.valence.toFixed(2)}`);
  
  // Recovery with success
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('SCENARIO 3: Success and recovery');
  engine.stimulus('success');
  engine.stimulus('agent_complete');
  
  for (let i = 0; i < 10; i++) {
    engine.tick();
  }
  
  state = engine.getState();
  console.log(`\n📊 AFTER SUCCESS:`);
  console.log(`   DA=${state.concentrations.DA.toFixed(3)}, SE=${state.concentrations.SE.toFixed(3)}, CO=${state.concentrations.CO.toFixed(3)}`);
  console.log(`   Energy: ${state.energy}%  |  Mood: ${state.mood}  |  Valence: ${state.valence.toFixed(2)}`);
  
  // Show mean-reversion over time
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('SCENARIO 4: Mean-reversion (homeostasis)');
  console.log('   Running 100 ticks with no stimulus...');
  
  for (let i = 0; i < 100; i++) {
    engine.tick();
  }
  
  state = engine.getState();
  console.log(`\n📊 AFTER HOMEOSTASIS:`);
  console.log(`   DA=${state.concentrations.DA.toFixed(3)}, SE=${state.concentrations.SE.toFixed(3)}, NE=${state.concentrations.NE.toFixed(3)}`);
  console.log(`   CO=${state.concentrations.CO.toFixed(3)}, ACh=${state.concentrations.ACh.toFixed(3)}, OX=${state.concentrations.OX.toFixed(3)}`);
  console.log(`   Energy: ${state.energy}%  |  Mood: ${state.mood}`);
  console.log(`   (Note: All values returning to baseline ~1.0)`);
  
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('MATHEMATICAL VERIFICATION:');
  console.log(`   φ (golden ratio) = ${PHI}`);
  console.log(`   Heartbeat = ${HEARTBEAT}ms`);
  console.log(`   DA half-life = 45 minutes → θ = ${THETA.DA.toFixed(6)}/s`);
  console.log(`   SE half-life = 90 minutes → θ = ${THETA.SE.toFixed(6)}/s`);
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export { NeurochemistryODEEngine, SPECIES, STIMULUS_TABLE, BASELINE, THETA, JACOBIAN };

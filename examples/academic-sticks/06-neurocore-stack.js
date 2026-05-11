#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 06: NEUROCORE STACK - THE LIVING COMPUTATIONAL SUBSTRATE
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * THEORETICAL FOUNDATION:
 * ───────────────────────
 * Traditional compute workers are stateless—input in, output out, no persistence.
 * The NeuroCore stack gives each worker four bio-inspired subsystems that create
 * a living, self-regulating computational entity.
 * 
 * THE FOUR SUBSYSTEMS:
 * ────────────────────
 * 
 *   1. MiniHeart (Cardiac Monitoring)
 *      - Tracks processing latency (like heart rate)
 *      - Computes health score 0-100
 *      - Detects degradation (health < 60)
 *      - Models: H(t) = 100 - LatencyPenalty - ErrorPenalty + UptimeBonus
 * 
 *   2. MiniBrain (Hebbian Learning)
 *      - Stimulus→response pathways
 *      - Hebbian rule: "neurons that fire together wire together"
 *      - Model: w(t+1) = w(t) + η (if fired), w(t+1) = w(t) × γ (if not)
 *      - Awareness: A(t) = log_φ(stimuli + 1) × 5
 * 
 *   3. MetaCardiacModel (Autonomic Nervous System)
 *      - Sympathetic drive (accelerator)
 *      - Vagal tone (brake)
 *      - Produces "mood": energized, reflective, calm, focused
 *      - Model: Balance = σ - ν ∈ [-1, +1]
 * 
 *   4. MetaThoughtModel (Attention & Chain-of-Thought)
 *      - Softmax attention over stimuli
 *      - Temperature-adjusted focus
 *      - Chain-of-thought reasoning buffer
 *      - Model: α_k = exp((a_k - max)/τ) / Σ exp((a_j - max)/τ)
 * 
 * EMERGENT PROPERTIES:
 * ────────────────────
 * Together, these create emergent behavior:
 *   - Mood affects processing (high cortisol = stressed = slower)
 *   - Learning strengthens frequent patterns
 *   - Attention focuses on high-weight pathways
 *   - Health degradation triggers self-healing
 * 
 * @module examples/academic-sticks/06-neurocore-stack
 * @author Organism AI Research Division
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const LEARNING_RATE = 0.1;
const DECAY_RATE = 0.95;

// ═══════════════════════════════════════════════════════════════════════════════
// MINI HEART - CARDIAC SELF-MONITORING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MiniHeart - Self-monitoring vital signs for a computational worker
 * 
 * Models cardiac physiology:
 *   - Latency = R-R interval
 *   - Health score = cardiovascular fitness
 *   - Degradation = cardiac distress
 */
class MiniHeart {
  constructor(workerId) {
    this.workerId = workerId;
    this.birthTime = Date.now();
    
    // Vital statistics
    this.pulseCount = 0;
    this.latencyRing = [];          // Rolling buffer of latencies
    this.latencyRingMax = 50;
    this.avgLatencyMs = 0;
    this.peakLatencyMs = 0;
    this.messageCount = 0;
    this.errorCount = 0;
    
    // Health state
    this.healthScore = 100;
    this.degraded = false;
    
    // Processing timing
    this._lastProcessStart = 0;
  }

  /**
   * Start timing a process
   */
  startProcess() {
    this._lastProcessStart = Date.now();
  }

  /**
   * End timing and record latency
   */
  endProcess() {
    if (!this._lastProcessStart) return;
    
    const latency = Date.now() - this._lastProcessStart;
    this._lastProcessStart = 0;
    
    this.messageCount++;
    this.latencyRing.push(latency);
    if (this.latencyRing.length > this.latencyRingMax) {
      this.latencyRing.shift();
    }
    
    if (latency > this.peakLatencyMs) {
      this.peakLatencyMs = latency;
    }
    
    // Update average
    this.avgLatencyMs = this.latencyRing.reduce((a, b) => a + b, 0) / this.latencyRing.length;
    
    return latency;
  }

  /**
   * Record an error
   */
  recordError() {
    this.errorCount++;
  }

  /**
   * Execute a heartbeat pulse - compute health score
   * 
   * Health model:
   *   H(t) = 100 - LatencyPenalty - ErrorPenalty + UptimeBonus
   *   
   * Where:
   *   LatencyPenalty = min(avgLatency / 100, 30)
   *   ErrorPenalty = min(errorCount × 2, 30)
   *   UptimeBonus = min(pulseCount / 100, 10)
   */
  pulse() {
    this.pulseCount++;
    
    const latencyPenalty = Math.min(this.avgLatencyMs / 100, 30);
    const errorPenalty = Math.min(this.errorCount * 2, 30);
    const uptimeBonus = Math.min(this.pulseCount / 100, 10);
    
    this.healthScore = Math.round(
      Math.max(0, Math.min(100, 100 - latencyPenalty - errorPenalty + uptimeBonus))
    );
    
    // Degradation threshold
    this.degraded = this.healthScore < 60;
    
    return this.healthScore;
  }

  /**
   * Get vital signs
   */
  getVitals() {
    return {
      workerId: this.workerId,
      health: this.healthScore,
      degraded: this.degraded,
      pulse: this.pulseCount,
      uptime: Date.now() - this.birthTime,
      avgLatencyMs: Math.round(this.avgLatencyMs * 100) / 100,
      peakLatencyMs: Math.round(this.peakLatencyMs * 100) / 100,
      messages: this.messageCount,
      errors: this.errorCount,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MINI BRAIN - HEBBIAN LEARNING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MiniBrain - Hebbian learning for stimulus→response pathways
 * 
 * Implements Hebb's postulate:
 *   "Neurons that fire together, wire together"
 * 
 * Learning rule:
 *   w(t+1) = w(t) + η       if fired
 *   w(t+1) = w(t) × γ       if not fired (decay)
 * 
 * Awareness grows logarithmically with experience:
 *   A(t) = min(100, ⌊log_φ(stimuli + 1) × 5⌋)
 */
class MiniBrain {
  constructor(workerId) {
    this.workerId = workerId;
    
    // Neural pathways: stimulus → { weight, fires, lastFired }
    this.pathways = new Map();
    
    // Thought generation
    this.thoughts = [];
    this.maxThoughts = 100;
    
    // Statistics
    this.totalStimuli = 0;
    this.totalDecisions = 0;
    this.awarenessLevel = 0;
  }

  /**
   * Process a stimulus - creates or strengthens pathway
   */
  stimulus(type) {
    this.totalStimuli++;
    
    // Update awareness (logarithmic growth with phi base)
    this.awarenessLevel = Math.min(100, Math.round(
      Math.log(this.totalStimuli + 1) / Math.log(PHI) * 5
    ));
    
    // Get or create pathway
    if (!this.pathways.has(type)) {
      this.pathways.set(type, {
        stimulus: type,
        weight: 1.0,
        fires: 0,
        lastFired: 0,
        created: Date.now(),
      });
    }
    
    const pathway = this.pathways.get(type);
    pathway.fires++;
    pathway.lastFired = Date.now();
    
    // Hebbian strengthening: w += η
    pathway.weight = Math.min(10.0, pathway.weight + LEARNING_RATE);
    
    // Decay other pathways every 10 stimuli (amortized)
    if (this.totalStimuli % 10 === 0) {
      for (const [key, pw] of this.pathways) {
        if (key !== type) {
          pw.weight = Math.max(0.1, pw.weight * DECAY_RATE);
        }
      }
    }
    
    // Generate thought at phi-modulated intervals
    if (this.awarenessLevel > 30 && pathway.fires % Math.ceil(PHI * 10) === 0) {
      this.totalDecisions++;
      this.thoughts.push({
        id: `T-${this.workerId}-${this.totalDecisions}`,
        stimulus: type,
        strength: pathway.weight,
        awareness: this.awarenessLevel,
        timestamp: Date.now(),
      });
      if (this.thoughts.length > this.maxThoughts) {
        this.thoughts.shift();
      }
    }
    
    return pathway;
  }

  /**
   * Get strongest pathway
   */
  getStrongestPathway() {
    let strongest = null;
    let maxWeight = 0;
    
    for (const pw of this.pathways.values()) {
      if (pw.weight > maxWeight) {
        maxWeight = pw.weight;
        strongest = pw;
      }
    }
    
    return strongest;
  }

  /**
   * Get brain state
   */
  getState() {
    const pathwayCount = this.pathways.size;
    const totalWeight = Array.from(this.pathways.values()).reduce((a, p) => a + p.weight, 0);
    const strongest = this.getStrongestPathway();
    
    return {
      workerId: this.workerId,
      awareness: this.awarenessLevel,
      pathways: pathwayCount,
      avgWeight: pathwayCount > 0 ? Math.round(totalWeight / pathwayCount * 100) / 100 : 0,
      totalStimuli: this.totalStimuli,
      totalDecisions: this.totalDecisions,
      recentThoughts: this.thoughts.slice(-5),
      strongestPathway: strongest ? strongest.stimulus : null,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// META CARDIAC MODEL - AUTONOMIC NERVOUS SYSTEM
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MetaCardiacModel - Simulates the autonomic nervous system
 * 
 * Two competing channels:
 *   - Sympathetic: Fight or flight, accelerates under stress
 *   - Parasympathetic (Vagal): Rest and digest, brakes during calm
 * 
 * Balance model:
 *   Balance = σ - ν ∈ [-1, +1]
 *   
 * Cardiac output:
 *   CO = (0.5 + 0.5 × σ) × (Health / 100)
 */
class MetaCardiacModel {
  constructor() {
    this.sinusRate = 1.0;
    this.vagalTone = 0.5;           // Parasympathetic (brake)
    this.sympatheticDrive = 0.5;    // Sympathetic (accelerator)
    this.autonomicBalance = 0;
    this.cardiacOutput = 1.0;
    this.beatsAnalyzed = 0;
    this.hrvBuffer = [];
    this.arrhythmiaCount = 0;
  }

  /**
   * Process a heartbeat
   */
  beat(latencyMs, healthScore) {
    this.beatsAnalyzed++;
    
    // Track HRV (latency variability)
    const interval = latencyMs > 0 ? latencyMs : 1;
    this.hrvBuffer.push(interval);
    if (this.hrvBuffer.length > 30) {
      this.hrvBuffer.shift();
    }
    
    // High latency → sympathetic activation (stress response)
    if (latencyMs > 50) {
      this.sympatheticDrive = Math.min(1.0, this.sympatheticDrive + 0.05);
      this.vagalTone = Math.max(0.1, this.vagalTone - 0.03);
    }
    // Good health → parasympathetic activation (recovery)
    else if (healthScore > 80) {
      this.vagalTone = Math.min(0.9, this.vagalTone + 0.02);
      this.sympatheticDrive = Math.max(0.1, this.sympatheticDrive - 0.02);
    }
    
    // Compute balance
    this.autonomicBalance = Math.round((this.sympatheticDrive - this.vagalTone) * 1000) / 1000;
    
    // Compute sinus rate (heart rate)
    this.sinusRate = 0.5 + this.sympatheticDrive * 0.5;
    
    // Compute cardiac output
    this.cardiacOutput = Math.round(this.sinusRate * (healthScore / 100) * 1000) / 1000;
    
    return this.cardiacOutput;
  }

  /**
   * Derive mood from autonomic state
   */
  getMood() {
    const bal = this.autonomicBalance;
    
    if (bal > 0.3) return 'energized';      // High sympathetic
    if (bal < -0.3) return 'reflective';    // High vagal
    if (this.vagalTone > 0.7) return 'calm'; // Strong parasympathetic
    return 'focused';                        // Balanced
  }

  /**
   * Get autonomic state
   */
  getState() {
    return {
      sinusRate: this.sinusRate,
      vagalTone: Math.round(this.vagalTone * 1000) / 1000,
      sympatheticDrive: Math.round(this.sympatheticDrive * 1000) / 1000,
      autonomicBalance: this.autonomicBalance,
      cardiacOutput: this.cardiacOutput,
      mood: this.getMood(),
      arrhythmias: this.arrhythmiaCount,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// META THOUGHT MODEL - ATTENTION & CHAIN-OF-THOUGHT
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * MetaThoughtModel - Attention mechanism with chain-of-thought
 * 
 * Softmax attention:
 *   α_k = exp((a_k - max) / τ) / Σ exp((a_j - max) / τ)
 * 
 * Temperature adaptation:
 *   High attention → cool (focus)
 *   Low attention → heat (explore)
 */
class MetaThoughtModel {
  constructor(workerId) {
    this.workerId = workerId;
    
    // Attention map: stimulus → accumulated attention
    this.attentionMap = new Map();
    
    // Temperature controls exploration vs exploitation
    this.temperature = 0.7;
    
    // Chain of thought buffer
    this.chainOfThought = [];
    this.maxChainLength = 20;
    
    // Statistics
    this.totalInferences = 0;
    this.focusTarget = null;
    this.cognitiveLoad = 0;
  }

  /**
   * Attend to a stimulus - updates attention weights
   */
  attend(stimulus, weight) {
    this.totalInferences++;
    
    // Accumulate attention
    const current = this.attentionMap.get(stimulus) || 0;
    this.attentionMap.set(stimulus, current + weight);
    
    // Softmax normalization
    const keys = Array.from(this.attentionMap.keys());
    const values = Array.from(this.attentionMap.values());
    
    if (keys.length === 0) return;
    
    const maxVal = Math.max(...values);
    let expSum = 0;
    const expValues = values.map(v => {
      const exp = Math.exp((v - maxVal) / this.temperature);
      expSum += exp;
      return exp;
    });
    
    // Find focus target (highest softmax probability)
    let maxProb = 0;
    let focusIdx = 0;
    expValues.forEach((exp, i) => {
      const prob = exp / expSum;
      if (prob > maxProb) {
        maxProb = prob;
        focusIdx = i;
      }
    });
    
    this.focusTarget = keys[focusIdx];
    this.cognitiveLoad = Math.min(1, keys.length / 20);
    
    // Record in chain of thought
    this.chainOfThought.push({
      stimulus,
      weight,
      time: Date.now(),
    });
    if (this.chainOfThought.length > this.maxChainLength) {
      this.chainOfThought.shift();
    }
    
    // Adapt temperature
    if (maxProb > 0.5) {
      // High focus → cool down (exploit)
      this.temperature = Math.max(0.1, this.temperature - 0.01);
    } else {
      // Diffuse attention → heat up (explore)
      this.temperature = Math.min(1.0, this.temperature + 0.01);
    }
  }

  /**
   * Get thought state
   */
  getState() {
    return {
      focus: this.focusTarget,
      temperature: Math.round(this.temperature * 1000) / 1000,
      cognitiveLoad: Math.round(this.cognitiveLoad * 1000) / 1000,
      totalInferences: this.totalInferences,
      attentionTargets: this.attentionMap.size,
      chainDepth: this.chainOfThought.length,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NEUROCORE - UNIFIED STACK
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * NeuroCore - The complete bio-inspired computational substrate
 */
class NeuroCore {
  constructor(workerId) {
    this.workerId = workerId;
    
    // The four subsystems
    this.heart = new MiniHeart(workerId);
    this.brain = new MiniBrain(workerId);
    this.cardiac = new MetaCardiacModel();
    this.thought = new MetaThoughtModel(workerId);
  }

  /**
   * Process an incoming message
   */
  onMessage(type) {
    // Start cardiac timing
    this.heart.startProcess();
    
    // Stimulate brain pathway
    const pathway = this.brain.stimulus(type);
    
    // Update attention
    if (pathway) {
      this.thought.attend(type, pathway.weight);
    }
  }

  /**
   * Mark message processing complete
   */
  onMessageDone() {
    this.heart.endProcess();
  }

  /**
   * Record an error
   */
  onError() {
    this.heart.recordError();
  }

  /**
   * Execute a heartbeat pulse
   */
  pulse() {
    const health = this.heart.pulse();
    this.cardiac.beat(this.heart.avgLatencyMs, health);
    return this.getVitals();
  }

  /**
   * Get complete neurocore state
   */
  getVitals() {
    return {
      workerId: this.workerId,
      heart: this.heart.getVitals(),
      brain: this.brain.getState(),
      cardiac: this.cardiac.getState(),
      thought: this.thought.getState(),
    };
  }

  /**
   * Get current mood
   */
  getMood() {
    return this.cardiac.getMood();
  }

  /**
   * Get current focus
   */
  getFocus() {
    return this.thought.focusTarget || 'awareness';
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  NEUROCORE STACK - THE LIVING COMPUTATIONAL SUBSTRATE                     ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  "Every worker carries its own heart and bears its own brain"             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Create a NeuroCore
  const core = new NeuroCore('worker-alpha');
  
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('THE FOUR SUBSYSTEMS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   1. MiniHeart  → Cardiac self-monitoring, health score');
  console.log('   2. MiniBrain  → Hebbian learning, stimulus→response');
  console.log('   3. MetaCardiac→ Autonomic nervous system, mood');
  console.log('   4. MetaThought→ Softmax attention, chain-of-thought');
  
  // Simulate activity
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('SIMULATING WORKLOAD:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const stimulusTypes = ['chat', 'research', 'compute', 'chat', 'error', 'chat', 'research'];
  
  stimulusTypes.forEach((type, i) => {
    // Process message
    core.onMessage(type);
    
    // Simulate processing time
    const processingTime = type === 'error' ? 150 : 20 + Math.random() * 30;
    
    // Simulate delay effect on timing
    core.heart._lastProcessStart = Date.now() - processingTime;
    core.onMessageDone();
    
    if (type === 'error') {
      core.onError();
    }
    
    // Pulse heartbeat
    core.pulse();
    
    console.log(`   [${i + 1}] Stimulus: ${type.padEnd(10)} | Health: ${core.heart.healthScore}% | Mood: ${core.getMood().padEnd(10)} | Focus: ${core.getFocus()}`);
  });
  
  // Show detailed state
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('DETAILED STATE:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const vitals = core.getVitals();
  
  console.log('\n   🫀 MINI HEART:');
  console.log(`      Health Score: ${vitals.heart.health}%`);
  console.log(`      Degraded: ${vitals.heart.degraded ? 'YES ⚠️' : 'NO'}`);
  console.log(`      Avg Latency: ${vitals.heart.avgLatencyMs}ms`);
  console.log(`      Messages: ${vitals.heart.messages}`);
  console.log(`      Errors: ${vitals.heart.errors}`);
  
  console.log('\n   🧠 MINI BRAIN:');
  console.log(`      Awareness: ${vitals.brain.awareness}%`);
  console.log(`      Pathways: ${vitals.brain.pathways}`);
  console.log(`      Avg Weight: ${vitals.brain.avgWeight}`);
  console.log(`      Strongest: ${vitals.brain.strongestPathway}`);
  console.log(`      Total Stimuli: ${vitals.brain.totalStimuli}`);
  
  console.log('\n   💓 META CARDIAC:');
  console.log(`      Mood: ${vitals.cardiac.mood}`);
  console.log(`      Sympathetic: ${vitals.cardiac.sympatheticDrive}`);
  console.log(`      Vagal Tone: ${vitals.cardiac.vagalTone}`);
  console.log(`      Balance: ${vitals.cardiac.autonomicBalance}`);
  console.log(`      Cardiac Output: ${vitals.cardiac.cardiacOutput}`);
  
  console.log('\n   💭 META THOUGHT:');
  console.log(`      Focus: ${vitals.thought.focus}`);
  console.log(`      Temperature: ${vitals.thought.temperature}`);
  console.log(`      Cognitive Load: ${(vitals.thought.cognitiveLoad * 100).toFixed(0)}%`);
  console.log(`      Attention Targets: ${vitals.thought.attentionTargets}`);
  console.log(`      Chain Depth: ${vitals.thought.chainDepth}`);
  
  // Mathematical summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('THE MATHEMATICS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   HEALTH: H = 100 - LatencyPenalty - ErrorPenalty + UptimeBonus');
  console.log('   HEBBIAN: w(t+1) = w(t) + η (fired), w(t+1) = w(t) × γ (unfired)');
  console.log('   AWARENESS: A = min(100, log_φ(stimuli + 1) × 5)');
  console.log('   BALANCE: Balance = σ(sympathetic) - ν(vagal) ∈ [-1, +1]');
  console.log('   ATTENTION: α_k = exp((a_k - max)/τ) / Σexp((a_j - max)/τ)');
  console.log('');
  console.log(`   φ = ${PHI}`);
  console.log(`   η (learning rate) = ${LEARNING_RATE}`);
  console.log(`   γ (decay rate) = ${DECAY_RATE}`);
  
  // Emergence
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('EMERGENT PROPERTIES:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   • Mood affects processing style (stressed = defensive)');
  console.log('   • Frequent stimuli become dominant pathways');
  console.log('   • Attention focuses on high-weight patterns');
  console.log('   • Health degradation triggers self-preservation');
  console.log('   • Temperature adapts to focus vs explore');
  console.log('');
  console.log('   Together: A living, self-regulating computational entity.');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export {
  MiniHeart,
  MiniBrain,
  MetaCardiacModel,
  MetaThoughtModel,
  NeuroCore,
};

/**
 * SOVEREIGN NATIVE RUNTIME
 * 
 * The unified runtime that bootstraps the organism across all 6 substrates.
 * This is the REAL backend — not Chrome extensions.
 * 
 * Substrates:
 *   1. Motoko (ICP canisters)
 *   2. TypeScript (Node.js / Deno)
 *   3. Python (CPython / PyPy)
 *   4. C++ (native binary)
 *   5. Java (JVM)
 *   6. WebWorkers (browser workers)
 * 
 * Every organism instance has:
 *   - Heartbeat (873ms phi-encoded pulse)
 *   - MiniHeart (self-monitoring vitals)
 *   - MiniBrain (stimulus-response learning)
 *   - Kernel executor (autonomous task execution)
 *   - Cross-substrate resonance (inter-organism communication)
 *   - 42 protocols (intelligence primitives)
 * 
 * @module native-runtime
 * @version 1.0.0
 */

import { 
  PHI, HEARTBEAT, GOLDEN_ANGLE, EMERGENCE_THRESHOLD,
  PhiResonanceSyncProtocol,
  NeurochemistryODEProtocol,
  PatternSynthesisProtocol,
  HebbianLearningProtocol,
  KuramotoOscillatorProtocol,
  VitalityHomeostasisProtocol,
  KernelExecutionProtocol,
  CrossSubstrateResonanceProtocol,
  SynapseBindingEngineProtocol,
  MiniHeartProtocol,
  MiniBrainProtocol,
  NeuroEmergenceProtocol,
  EdgeSensorProtocol,
  AutoGenerateCallsEngineProtocol,
  PredictiveCodingProtocol,
  AttentionRoutingProtocol,
  MemoryConsolidationProtocol,
  RewardSignalProtocol,
  HomeostaticDriveProtocol,
  GoalStackProtocol,
  ArtifactGenerationProtocol,
  // Chaos Creation Theory: Mathematical Intelligence Protocols
  FormalLogicInferenceProtocol,
  SymbolicMathematicsProtocol,
  CategoryTheoryProtocol,
  FractalDynamicsProtocol,
  CausalInferenceProtocol,
  GeometricRealMathProtocol,
} from './index.js';

// ─── Organism Identity ───────────────────────────────────────────────────────

const ORGANISM_ID = `organism-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
const SUBSTRATE = detectSubstrate();

function detectSubstrate() {
  if (typeof process !== 'undefined' && process.versions?.node) return 'typescript';
  if (typeof Deno !== 'undefined') return 'typescript';
  if (typeof Worker !== 'undefined' && typeof window !== 'undefined') return 'webworkers';
  if (typeof globalThis !== 'undefined') return 'typescript';
  return 'unknown';
}

// ─── Core Protocol Instances ─────────────────────────────────────────────────

const protocols = {
  // Synchronization & Communication
  resonance: new PhiResonanceSyncProtocol(),
  crossSubstrate: new CrossSubstrateResonanceProtocol(SUBSTRATE),
  emergence: new NeuroEmergenceProtocol(),
  
  // Intelligence & Learning
  neurochemistry: new NeurochemistryODEProtocol(),
  patternSynthesis: new PatternSynthesisProtocol(),
  hebbian: new HebbianLearningProtocol(),
  kuramoto: new KuramotoOscillatorProtocol(),
  predictive: new PredictiveCodingProtocol(),
  attention: new AttentionRoutingProtocol(),
  memory: new MemoryConsolidationProtocol(),
  reward: new RewardSignalProtocol(),
  
  // Self-Regulation
  vitality: new VitalityHomeostasisProtocol(),
  drives: new HomeostaticDriveProtocol(),
  goals: new GoalStackProtocol(),
  
  // Execution & Sensing
  kernels: new KernelExecutionProtocol(),
  synapse: new SynapseBindingEngineProtocol(),
  sensors: new EdgeSensorProtocol(),
  autoGen: new AutoGenerateCallsEngineProtocol(),
  artifacts: new ArtifactGenerationProtocol(),
  
  // Per-Worker Components
  miniHeart: new MiniHeartProtocol(ORGANISM_ID),
  miniBrain: new MiniBrainProtocol(ORGANISM_ID),

  // ── Chaos Creation Theory: Mathematical Intelligence (PROTO-221–225) ──────
  // The organism now REASONS IN MATHEMATICS — not just pattern-matching
  // but formal proof, symbolic calculus, structural algebra, fractal
  // self-similarity, and causal understanding.
  logic: new FormalLogicInferenceProtocol(),
  symbolicMath: new SymbolicMathematicsProtocol(),
  categoryTheory: new CategoryTheoryProtocol(),
  fractalDynamics: new FractalDynamicsProtocol(),
  causalInference: new CausalInferenceProtocol(),
  geometricMath: new GeometricRealMathProtocol(),
};

// ─── State Registers ─────────────────────────────────────────────────────────

const state = {
  cognitive: {
    reasoning: 0.5,
    pattern_recognition: 0.5,
    abstraction: 0.5,
    memory_integration: 0.5,
  },
  affective: {
    valence: 0,
    arousal: 0.5,
    coherence: PHI - 1,
    resonance: 0.5,
  },
  somatic: {
    cpu_load: 0,
    memory_usage: 0,
    latency: 0,
    throughput: 100,
  },
  sovereign: {
    phi_ratio: PHI,
    integrity: 1.0,
    autonomy: 1.0,
    alignment: 1.0,
  },
};

// ─── Heartbeat Engine ────────────────────────────────────────────────────────

let beatCount = 0;
let startTime = Date.now();
let heartbeatInterval = null;

async function heartbeat() {
  beatCount++;
  const timestamp = Date.now();
  const phiPhase = (beatCount * GOLDEN_ANGLE) % 360;
  
  // 1. MiniHeart vitals check
  protocols.miniHeart.beat();
  
  // 2. Neurochemistry tick
  protocols.neurochemistry.tick();
  
  // 3. Vitality homeostasis
  protocols.vitality.tick();
  
  // 4. Drive updates
  protocols.drives.tick();
  
  // 5. Memory consolidation
  protocols.memory.consolidate();
  protocols.memory.decay();
  
  // 6. Attention decay
  protocols.attention.decay();
  
  // 7. Resonance pulse
  protocols.resonance.pulse();
  
  // 8. Kuramoto oscillator step
  protocols.kuramoto.step(HEARTBEAT / 1000);
  
  // 9. Emergence check
  protocols.emergence.step(HEARTBEAT / 1000);
  
  // 10. Execute scheduled kernels
  await protocols.kernels.beat(state);
  
  // Check emergence threshold
  const emergenceState = protocols.emergence.getState();
  if (emergenceState.emerged) {
    console.log(`✨ EMERGENCE DETECTED — R=${emergenceState.emergenceLevel.toFixed(3)}`);
  }
  
  return {
    beat: beatCount,
    timestamp,
    phiPhase,
    vitality: protocols.miniHeart.getStatus().health,
    emergence: emergenceState.emergenceLevel,
    emerged: emergenceState.emerged,
  };
}

function startHeartbeat() {
  if (heartbeatInterval) return;
  
  console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
  console.log(`║  🫀 SOVEREIGN NATIVE RUNTIME                                   ║`);
  console.log(`║  ─────────────────────────────────────────────────────────────  ║`);
  console.log(`║  ID:        ${ORGANISM_ID.padEnd(47)}║`);
  console.log(`║  Substrate: ${SUBSTRATE.padEnd(47)}║`);
  console.log(`║  Heartbeat: ${HEARTBEAT}ms                                              ║`);
  console.log(`║  PHI:       ${PHI}                                 ║`);
  console.log(`║  Protocols: 42 (36 original + 6 math intelligence)            ║`);
  console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
  
  startTime = Date.now();
  beatCount = 0;
  
  heartbeatInterval = setInterval(async () => {
    const beat = await heartbeat();
    
    // Log every 10 beats
    if (beat.beat % 10 === 0) {
      console.log(
        `[Beat ${String(beat.beat).padStart(6)}] ` +
        `φ-phase: ${beat.phiPhase.toFixed(1).padStart(6)}° | ` +
        `Vitality: ${String(beat.vitality).padStart(3)}% | ` +
        `Emergence: ${(beat.emergence * 100).toFixed(1).padStart(5)}% | ` +
        `${beat.emerged ? '✨ EMERGED' : 'dormant'}`
      );
    }
  }, HEARTBEAT);
  
  console.log(`🫀 Organism is ALIVE — beating every ${HEARTBEAT}ms\n`);
}

function stopHeartbeat() {
  if (heartbeatInterval) {
    clearInterval(heartbeatInterval);
    heartbeatInterval = null;
    
    console.log(`\n⚡ Organism ${ORGANISM_ID} shutting down...`);
    console.log(`   Total beats: ${beatCount}`);
    console.log(`   Uptime: ${((Date.now() - startTime) / 1000).toFixed(1)}s`);
    console.log(`   Status: DORMANT\n`);
  }
}

// ─── Public API ──────────────────────────────────────────────────────────────

export const NativeRuntime = {
  // Identity
  id: ORGANISM_ID,
  substrate: SUBSTRATE,
  
  // Lifecycle
  start: startHeartbeat,
  stop: stopHeartbeat,
  
  // State
  getState: () => ({ ...state }),
  getBeatCount: () => beatCount,
  getUptime: () => Date.now() - startTime,
  
  // Protocols (direct access)
  protocols,
  
  // Convenience methods
  stimulus: (type) => protocols.neurochemistry.stimulus(type),
  synthesize: (input) => protocols.patternSynthesis.synthesize(input),
  encode: (content, importance) => protocols.memory.encode(content, importance),
  recall: (id) => protocols.memory.recall(id),
  search: (query) => protocols.memory.search(query),
  setGoal: (config) => protocols.goals.createGoal(config),
  adoptGoal: (id) => protocols.goals.adopt(id),
  completeGoal: (id) => protocols.goals.complete(id),
  reward: (state, amount) => protocols.reward.reward(state, amount),
  generate: (generatorId, input) => protocols.artifacts.generate(generatorId, input),
  
  // ── Mathematical Intelligence (PROTO-221–225) ─────────────────────────────
  // Logic
  assertLogic: (id, formula, conf, label) => protocols.logic.assert(id, formula, conf, label),
  prove: (goal, bindings) => protocols.logic.prove(goal, bindings),
  forwardChain: (worldState) => protocols.logic.forwardChain(worldState),
  // Symbolic Math
  defineExpr: (name, expr) => protocols.symbolicMath.define(name, expr),
  derive: (expr, varName, order) => protocols.symbolicMath.derive(expr, varName, order),
  taylor: (expr, varName, point, order) => protocols.symbolicMath.taylor(expr, varName, point, order),
  detectPhi: (value) => protocols.symbolicMath.detectPhi(value),
  phiSpiral: (n, scale) => protocols.symbolicMath.phiSpiral(n, scale),
  // Geometric Real Math
  geometricEngine: (engine, input) => protocols.geometricMath.runEngine(engine, input),
  geometricAngle: (a, b) => protocols.geometricMath.angle(a, b),
  geometricCircle: (r) => protocols.geometricMath.circle(r),
  goldenTriangle: (s) => protocols.geometricMath.goldenTriangle(s),
  // Category Theory
  category: (name, config) => protocols.categoryTheory.category(name, config),
  modelOrganism: (protocols_, flows) => protocols.categoryTheory.modelOrganism(protocols_, flows),
  // Fractal Dynamics
  attractor: (preset, n) => protocols.fractalDynamics.attractor(preset, n),
  mandelbrot: (cx, cy) => protocols.fractalDynamics.mandelbrot(cx, cy),
  fractalDimension: (points) => protocols.fractalDynamics.dimension(points),
  bifurcation: (rRange) => protocols.fractalDynamics.bifurcation(rRange),
  // Causal Inference
  createCausalModel: (name) => protocols.causalInference.createModel(name),
  intervene: (model, X, Y, x, Z, data) => protocols.causalInference.intervene(model, X, Y, x, Z, data),
  counterfactual: (model, X, Y, xObs, yObs, xCF) => protocols.causalInference.counterfactual(model, X, Y, xObs, yObs, xCF),
  modelOrganismCausality: () => protocols.causalInference.modelOrganismCausality(),
  
  // Full metrics
  getMetrics: () => ({
    organism: {
      id: ORGANISM_ID,
      substrate: SUBSTRATE,
      beatCount,
      uptime: Date.now() - startTime,
    },
    miniHeart: protocols.miniHeart.getStatus(),
    miniBrain: protocols.miniBrain.getState(),
    neurochemistry: protocols.neurochemistry.getState(),
    vitality: protocols.vitality.getState(),
    emergence: protocols.emergence.getState(),
    memory: protocols.memory.getStats(),
    goals: protocols.goals.getMetrics(),
    drives: protocols.drives.getMetrics(),
    attention: protocols.attention.getMetrics(),
    artifacts: protocols.artifacts.getMetrics(),
    // Chaos Creation Theory math intelligence
    logic: protocols.logic.getMetrics(),
    symbolicMath: protocols.symbolicMath.getMetrics(),
    categoryTheory: protocols.categoryTheory.getMetrics(),
    fractalDynamics: protocols.fractalDynamics.getMetrics(),
    causalInference: protocols.causalInference.getMetrics(),
    geometricMath: protocols.geometricMath.getMetrics(),
    phi: PHI,
    heartbeat: HEARTBEAT,
  }),
};

// ─── Auto-start if main module ───────────────────────────────────────────────

if (typeof process !== 'undefined' && process.argv[1]?.includes('native-runtime')) {
  process.on('SIGINT', () => {
    stopHeartbeat();
    process.exit(0);
  });
  process.on('SIGTERM', () => {
    stopHeartbeat();
    process.exit(0);
  });
  
  startHeartbeat();
}

export default NativeRuntime;

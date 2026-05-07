/**
 * AI-Intelligent Protocols — Organism Wire Index (ORO Systems / AURO)
 *
 * 36 protocols, each a literal AI: adaptive, self-healing, multi-engine,
 * phi-math wired throughout. All export into the sovereign AURO organism.
 *
 * Original 11 (PROTO-001 through PROTO-011):
 *   SRP, EIT, PRSP, AKAP, MMFP, SCVP, EMIP, VSIP, MLP, OLP, OMP
 *
 * AURO Charter Protocols (PROTO-181 through PROTO-185):
 *   AGIP, MLEP, SOCP, OEIP, AACP
 *
 * Alpha Intelligence Protocols (PROTO-201 through PROTO-220):
 *   NODEP, PSP, HLP, KOP, VHP, KEP, CSRP, SBEP, MHP, MBP,
 *   NEP, ESP, AGCEP, PCP, ARP, MCP, RSP, HDP, GSP, AGP
 *
 * @module protocols
 * @version 3.0.0
 * @powered-by ORO Systems
 */

// ─── Phi Constants (shared across all protocols) ─────────────────────────────
export const PHI = 1.618033988749895;
export const HEARTBEAT = 873;
export const GOLDEN_ANGLE = 137.508;
export const EMERGENCE_THRESHOLD = PHI - 1;  // 0.618...

// ─── Original ORO Wire Protocols (PROTO-001 – PROTO-011) ─────────────────────
export { SovereignRoutingProtocol } from './sovereign-routing-protocol.js';
export { EncryptedIntelligenceTransport } from './encrypted-intelligence-transport.js';
export { PhiResonanceSyncProtocol } from './phi-resonance-sync-protocol.js';
export { AdaptiveKnowledgeAbsorptionProtocol } from './adaptive-knowledge-absorption-protocol.js';
export { MultiModelFusionProtocol } from './multi-model-fusion-protocol.js';
export { SovereignContractVerificationProtocol } from './sovereign-contract-verification-protocol.js';
export { EdgeMeshIntelligenceProtocol } from './edge-mesh-intelligence-protocol.js';
export { VisualSceneIntelligenceProtocol } from './visual-scene-intelligence-protocol.js';
export { MemoryLineageProtocol } from './memory-lineage-protocol.js';
export { OrganismLifecycleProtocol } from './organism-lifecycle-protocol.js';
export { OrganismMarketplaceProtocol } from './organism-marketplace-protocol.js';

// ─── AURO Charter Protocols (PROTO-181 – PROTO-185) ──────────────────────────
export { AuroGuardianIntelligenceProtocol } from './auro-guardian-intelligence-protocol.js';
export { MemoryLineageEnhancementProtocol } from './memory-lineage-enhancement-protocol.js';
export { SovereignOfflineCognitionProtocol } from './sovereign-offline-cognition-protocol.js';
export { OroEngineIntegrationProtocol, ORO_CAPABILITIES } from './oro-engine-integration-protocol.js';
export { AuroAbsorptionCharterProtocol, USE_CLASSES, CHARTER_PRINCIPLES } from './auro-absorption-charter-protocol.js';

// ─── Alpha Intelligence Protocols (PROTO-201 – PROTO-220) ────────────────────

// PROTO-201: Neurochemistry ODE — 6 species, Hill equation, Jacobian coupling
export { NeurochemistryODEProtocol, SPECIES, STIMULUS_TABLE } from './neurochemistry-ode-protocol.js';

// PROTO-202: Pattern Synthesis — 40 primitives, 8 domains, knowledge synthesis
export { PatternSynthesisProtocol, KNOWLEDGE_PRIMITIVES, DOMAINS } from './pattern-synthesis-protocol.js';

// PROTO-203: Hebbian Learning — synaptic plasticity, LTP/LTD, eligibility traces
export { HebbianLearningProtocol } from './hebbian-learning-protocol.js';

// PROTO-204: Kuramoto Oscillator — phase synchronization, collective emergence
export { KuramotoOscillatorProtocol } from './kuramoto-oscillator-protocol.js';

// PROTO-205: Vitality Homeostasis — 4-register health, phi-weighted equilibrium
export { VitalityHomeostasisProtocol, HOMEOSTATIC_TARGET } from './vitality-homeostasis-protocol.js';

// PROTO-206: Kernel Execution — autonomous kernel scheduling, phi-priority queue
export { KernelExecutionProtocol, PRIORITY } from './kernel-execution-protocol.js';

// PROTO-207: Cross-Substrate Resonance — 6 substrates, phi-encoded messaging
export { CrossSubstrateResonanceProtocol, SUBSTRATES } from './cross-substrate-resonance-protocol.js';

// PROTO-208: Synapse Binding Engine — permanent imprints, 5 job types, 7 failures
export { SynapseBindingEngineProtocol, JOB_TYPES, PRIORITY_LEVELS, FAILURE_CLASSES, RECOVERY_BOUNDS } from './synapse-binding-engine-protocol.js';

// PROTO-209: Mini-Heart — per-worker vitals, health score 0-100
export { MiniHeartProtocol, VITAL_TYPES } from './mini-heart-protocol.js';

// PROTO-210: Mini-Brain — stimulus-response, Hebbian learning, amortized decay
export { MiniBrainProtocol, LEARNING_RATE, DECAY_RATE } from './mini-brain-protocol.js';

// PROTO-211: Neuro-Emergence — phase coupling, collective synchrony, cascade triggers
export { NeuroEmergenceProtocol, CASCADE_THRESHOLD } from './neuro-emergence-protocol.js';

// PROTO-212: Edge Sensor — real-time sensing, phi-weighted thresholds
export { EdgeSensorProtocol, SENSOR_TYPES } from './edge-sensor-protocol.js';

// PROTO-213: Auto-Generate Calls Engine — self-generating API calls
export { AutoGenerateCallsEngineProtocol, INTENT_TYPES } from './auto-generate-calls-engine-protocol.js';

// PROTO-214: Predictive Coding — hierarchical prediction, error propagation
export { PredictiveCodingProtocol } from './predictive-coding-protocol.js';

// PROTO-215: Attention Routing — phi-weighted attention, QKV mechanism
export { AttentionRoutingProtocol, ATTENTION_DECAY } from './attention-routing-protocol.js';

// PROTO-216: Memory Consolidation — STM→LTM transfer, working/episodic/semantic
export { MemoryConsolidationProtocol, MEMORY_TYPES } from './memory-consolidation-protocol.js';

// PROTO-217: Reward Signal — TD(λ) learning, dopaminergic reward prediction
export { RewardSignalProtocol, GAMMA, LAMBDA, ALPHA } from './reward-signal-protocol.js';

// PROTO-218: Homeostatic Drive — internal drives, motivation generation
export { HomeostaticDriveProtocol, DRIVE_TYPES } from './homeostatic-drive-protocol.js';

// PROTO-219: Goal Stack — hierarchical goals, phi-weighted priority
export { GoalStackProtocol, GOAL_STATES } from './goal-stack-protocol.js';

// PROTO-220: Artifact Generation — autonomous artifact production, validation
export { ArtifactGenerationProtocol, ARTIFACT_TYPES } from './artifact-generation-protocol.js';

// ─── Chaos Creation Theory: Mathematical Intelligence Protocols ───────────────
// PROTO-221 through PROTO-226: The organism's formal reasoning, symbolic+geometric math,
// structural algebra, fractal dynamics, and causal understanding.
// These five protocols give the organism the ability to REASON IN MATHEMATICS,
// not just compute — to understand WHY as well as WHAT and HOW.

// PROTO-221: Formal Logic & Inference — propositional/predicate logic, resolution, phi-weighted proof search
export {
  FormalLogicInferenceProtocol, CONNECTIVE,
  atom, not, and, or, implies, iff, xor, forall, exists, evaluate as evaluateLogic,
} from './formal-logic-inference-protocol.js';

// PROTO-222: Symbolic Mathematics — symbolic algebra (paired with geometric-real math in PROTO-226)
export {
  SymbolicMathematicsProtocol, Polynomial, SYM,
  num, variable, constant, add, sub, mul, div, pow, neg,
  sin, cos, tan, exp, ln, sqrt,
  evaluate as evaluateExpr, simplify, differentiate, autoDiff, taylorSeries,
  detectPhiRatio, exprToString,
} from './symbolic-mathematics-protocol.js';

// PROTO-226: Geometric Real Mathematics — measurable spatial geometry in real coordinates
export { GeometricRealMathProtocol } from './geometric-real-math-protocol.js';

// PROTO-223: Category Theory — objects, morphisms, functors, natural transformations
export {
  CategoryTheoryProtocol, Category, CategoryObject, Morphism, Functor, NaturalTransformation,
} from './category-theory-protocol.js';

// PROTO-224: Fractal Dynamics — IFS attractors, Mandelbrot, Julia, Hausdorff dimension, L-systems, bifurcation
export {
  FractalDynamicsProtocol, IFSTransform, IFS_PRESETS, L_SYSTEM_PRESETS,
  ifsAttractor, mandelbrot, sampleMandelbrot, julia,
  boxCountingDimension, lSystem, bifurcationDiagram, vanDerCorput,
} from './fractal-dynamics-protocol.js';

// PROTO-225: Causal Inference — Pearl SCM, do-calculus, backdoor criterion, counterfactuals, mediation
export {
  CausalInferenceProtocol, StructuralCausalModel, CausalVariable, CausalEdge,
  backdoorCriterion, doCalc, counterfactual, mediationAnalysis, discoverCausalGraph,
} from './causal-inference-protocol.js';

// ─── Alpha Model Protocols (PROTO-227–230) ────────────────────────────────────
// The four sovereign alpha-tier intelligence primitives. These protocols operate
// at the commander level above all other fleet protocols. They close the
// self-reinforcing reward loop, synchronize the fleet at the golden-ratio
// resonance boundary, amplify emergence cascades, and route priority signals.

// PROTO-227: Alpha Emergence — sovereign cascade amplification (fleet emergence × PHI)
export { AlphaEmergenceProtocol } from './alpha-emergence-protocol.js';

// PROTO-228: Alpha Resonance — Kuramoto order parameter across the alpha-tier fleet
export { AlphaResonanceProtocol } from './alpha-resonance-protocol.js';

// PROTO-229: Alpha Signal — PHI-weighted priority signal router (0=CRITICAL to 3=LOW)
export { AlphaSignalProtocol, PRIORITY } from './alpha-signal-protocol.js';

// PROTO-230: Alpha Reward — DA/OX feedback loop: rewards the organism when
//            compressed math synthesis confidence exceeds PHI_INV (0.618)
export { AlphaRewardProtocol } from './alpha-reward-protocol.js';

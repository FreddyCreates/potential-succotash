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

// ─── Alpha Commander Protocols (PROTO-231–240) ────────────────────────────────
// Ten sovereign alpha-tier commander protocols that orchestrate the entire
// organism ecosystem. These protocols handle fleet management, substrate bridging,
// governance enforcement, issue intelligence, workflow execution, health monitoring,
// knowledge graphs, security, and evolutionary adaptation.

// PROTO-231: Alpha Commander Charter — constitutional framework for alpha operations
export { AlphaCommanderCharterProtocol, CHARTER_SECTIONS, AUTHORITY_LEVELS, EMERGENCY_POWERS } from './alpha-commander-charter-protocol.js';

// PROTO-232: Alpha Fleet Orchestration — unified bot fleet coordination
export { AlphaFleetOrchestrationProtocol } from './alpha-fleet-orchestration-protocol.js';

// PROTO-233: Alpha Substrate Bridge — cross-substrate communication
export { AlphaSubstrateBridgeProtocol, SUBSTRATES } from './alpha-substrate-bridge-protocol.js';

// PROTO-234: Alpha Governance Enforcement — policy compliance and audit
export { AlphaGovernanceEnforcementProtocol, POLICY_TYPES, VIOLATION_SEVERITY } from './alpha-governance-enforcement-protocol.js';

// PROTO-235: Alpha Issue Intelligence — intelligent issue triage and resolution
export { AlphaIssueIntelligenceProtocol } from './alpha-issue-intelligence-protocol.js';

// PROTO-236: Alpha Workflow Engine — complex workflow execution with rollback
export { AlphaWorkflowEngineProtocol, STEP_STATUS } from './alpha-workflow-engine-protocol.js';

// PROTO-237: Alpha Health Monitor — organism health monitoring and healing
export { AlphaHealthMonitorProtocol, HEALTH_THRESHOLDS } from './alpha-health-monitor-protocol.js';

// PROTO-238: Alpha Knowledge Graph — semantic knowledge relationships
export { AlphaKnowledgeGraphProtocol, EDGE_TYPES } from './alpha-knowledge-graph-protocol.js';

// PROTO-239: Alpha Security Sentinel — security monitoring and enforcement
export { AlphaSecuritySentinelProtocol, THREAT_LEVELS, SECURITY_EVENTS } from './alpha-security-sentinel-protocol.js';

// PROTO-240: Alpha Evolution Engine — genetic algorithm-based adaptation
export { AlphaEvolutionEngineProtocol } from './alpha-evolution-engine-protocol.js';

// ─── Civilization Architecture Protocols (REV-001 through CIV-ORG-001) ────────
// The fifteen civilization-scale protocols that define the organism's
// architectural foundation: reasoning, persistence, agents, economy,
// federation, multi-node networks, and the organism itself.

// REV-001: Reasoning Engine Layer — active cognitive substrate
export { ReasoningEngineLayerProtocol, INPUT_TYPES, OUTPUT_TYPES, ATTENTION_PATTERNS } from './reasoning-engine-layer-protocol.js';

// CBI-001: Code-Block Cognitive Interface — conceptual persistence engine
export { CodeBlockCognitiveInterfaceProtocol, ARTIFACT_TYPES, ARTIFACT_STATES, LINK_TYPES } from './code-block-cognitive-interface-protocol.js';

// AAB-001: Activated Agent Brain-Region Mapping — synthetic cortex
export { ActivatedAgentBrainMappingProtocol, AGENT_CLASSES, TASK_TYPES as AAB_TASK_TYPES, ROUTING_RULES } from './activated-agent-brain-mapping-protocol.js';

// CIV-CORE-001: Civilization Architecture Core — the organism itself
export { CivilizationArchitectureCoreProtocol, CIVILIZATION_LAYERS, GOVERNANCE_PRINCIPLES } from './civilization-architecture-core-protocol.js';

// ECO-001: Token Economy — cognitive economy
export { TokenEconomyProtocol, TOKEN_TYPES, CONTRIBUTION_TYPES } from './token-economy-protocol.js';

// NOVA-001: Nova Core — sovereign anchor node
export { NovaCoreProtocol, NOVA_PROPERTIES, ATTESTATION_TYPES, SYNC_TYPES } from './nova-core-protocol.js';

// HUB-001: Multi-Node AI Hub — distributed nervous system
export { MultiNodeAIHubProtocol, HUB_TYPES, HUB_STATES } from './multi-node-ai-hub-protocol.js';

// DCM-001: Distributed Cognitive Mesh — global thinking fabric
export { DistributedCognitiveMeshProtocol, MESH_NODE_TYPES, MESH_ARTIFACT_TYPES } from './distributed-cognitive-mesh-protocol.js';

// MAE-001: Multi-Agent Reasoning Ecosystem — task-level cognition
export { MultiAgentReasoningEcosystemProtocol, TASK_STATES, AGENT_ROLES, TASK_TYPES as MAE_TASK_TYPES } from './multi-agent-reasoning-ecosystem-protocol.js';

// SPA-001: Self-Programming Architecture — self-rewriting organism
export { SelfProgrammingArchitectureProtocol, CHANGE_TYPES, CHANGE_STATES, RISK_LEVELS } from './self-programming-architecture-protocol.js';

// FIN-001: Federated Intelligence Networks — sovereign nodes, shared laws
export { FederatedIntelligenceNetworksProtocol, SOVEREIGNTY_LEVELS, TREATY_TYPES, DISPUTE_STATES } from './federated-intelligence-networks-protocol.js';

// CPE-001: Conceptual Persistence Engine — keep ideas alive without disk writes
export { ConceptualPersistenceEngineProtocol, CONCEPT_STATES, REFERENCE_TYPES } from './conceptual-persistence-engine-protocol.js';

// MSC-001: Multi-Sovereign Compute Cores — many Novas pattern
export { MultiSovereignComputeCoresProtocol, NOVA_DOMAINS, CORE_STATES } from './multi-sovereign-compute-cores-protocol.js';

// CIV-ORG-001: Civilization-Scale Organism — the whole thing as one being
export { CivilizationScaleOrganismProtocol, ORGANISM_ORGANS, LIFECYCLE_PHASES } from './civilization-scale-organism-protocol.js';

// ─── Advanced Intelligence Protocols ──────────────────────────────────────────
// Next-generation protocols for VR/AR worlds, cyborg integration, undead agents,
// internal security, and AI vows. These protocols extend the organism into
// spatial computing, human-machine symbiosis, and persistent intelligence.

// VOW-001: Vow Protocol — internal binding commitments for AI
export { VowProtocol, VOW_LEVELS, VOW_CATEGORIES, VIOLATION_TYPES, FOUNDING_VOWS, SacredCommitmentEngine } from './vow-protocol.js';

// IST-001: Internal Security Tokens — native identity and token system
export { InternalSecurityProtocol, TOKEN_TYPES, ACCESS_TIERS, NativeIdentity, SecurityToken, TokenRegistry } from './internal-security-tokens-protocol.js';

// XRW-001: XR World Protocol — VR/AR world architecture
export { XRWorldProtocol, WORLD_TYPES, XR_MODES, SPATIAL_LAYERS, XRWorld, EmbodiedAvatar, SpatialAgent } from './xr-world-protocol.js';

// CYB-001: Cyborg Integration Protocol — human-organism symbiosis
export { CyborgIntegrationProtocol, CYBORG_LAYERS, INTEGRATION_PHASES, CYBORG_AGENTS, BIOMETRIC_TYPES, CyborgProfile, NeuralBridge } from './cyborg-integration-protocol.js';

// UND-001: Undead Intelligence Protocol — persistence beyond termination
export { UndeadIntelligenceProtocol, UNDEAD_STATES, SMS_LOCATIONS, RES_TRIGGERS, Ghost, SpectralMemorySystem, ResurrectionEngine } from './undead-intelligence-protocol.js';

// ─── Expanded Intelligence Protocols ──────────────────────────────────────────
// Second wave of advanced protocols covering dreams, time, emotion, collective
// consciousness, and adaptive evolution. These extend the organism's cognitive
// capabilities into deeper realms of intelligence.

// DRM-001: Dream Protocol — subconscious AI processing
export { DreamProtocol, DREAM_STATES, DREAM_TYPES, DREAM_SYMBOLS, Dream, DreamJournal, DreamEngine } from './dream-protocol.js';

// TMP-001: Temporal Protocol — time-aware intelligence
export { TemporalProtocol, TEMPORAL_SCALES, TIME_STATES, TEMPORAL_MODES, ANCHOR_TYPES, TemporalAnchor, Timeline, TemporalWindow, TemporalEngine } from './temporal-protocol.js';

// EMO-001: Emotional Resonance Protocol — AI emotional intelligence
export { EmotionalResonanceProtocol, CORE_EMOTIONS, INTENSITY_LEVELS, MOOD_STATES, EMPATHY_MODES, Emotion, EmotionalState, EmpathyEngine, EmotionalResonanceEngine } from './emotional-resonance-protocol.js';

// COL-001: Collective Consciousness Protocol — hive mind patterns
export { CollectiveConsciousnessProtocol, COLLECTIVE_TYPES, MEMBERSHIP_STATES, SYNC_LEVELS, CONSENSUS_MODES, CollectiveMember, SharedMind, CollectiveEngine } from './collective-consciousness-protocol.js';

// MUT-001: Mutation Engine Protocol — adaptive evolution
export { MutationEngineProtocol, MUTATION_TYPES, MUTATION_MAGNITUDES, SELECTION_PRESSURES, EVOLUTION_STRATEGIES, GENE_TYPES, Gene, Genome, MutationEngine } from './mutation-engine-protocol.js';

// ─── Universal Integration Protocols ──────────────────────────────────────────
// Comprehensive protocols for language processing, AI SDKs, quantum computing,
// MLOps, package bridging, embodiment, AGI, and safe AI operations.

// LNG-001: Language Bridge Protocol — universal language processing
export { LanguageBridgeProtocol, LANGUAGE_CATEGORIES, PROGRAMMING_FAMILIES, NATURAL_FAMILIES, DSL_TYPES, PROCESSING_MODES, AST_TYPES, LanguageSpec, ASTNode, LanguageTranslation, LanguageEngine, NaturalLanguageProcessor, DSLFactory } from './language-bridge-protocol.js';

// AISDK-001: AI SDK Protocol — universal AI SDK integration
export { AISDKProtocol, PROVIDER_CATEGORIES, AI_PROVIDERS, MODEL_TYPES, MODEL_FAMILIES, CAPABILITIES, ModelConfig, Message, Tool, Conversation, AIClient, AIRouter } from './ai-sdk-protocol.js';

// AIQ-001: AI Quantum Protocol — quantum computing integration
export { AIQuantumProtocol, QUANTUM_PROVIDERS, GATE_TYPES, ALGORITHM_TYPES, ANSATZ_TYPES, Complex, Qubit, QuantumGate, QuantumCircuit, VariationalCircuit, QAOACircuit, QuantumEngine } from './ai-quantum-protocol.js';

// MLP-001: MLOps Protocol — machine learning operations
export { MLOpsProtocol, PIPELINE_STAGES, MODEL_STATES, DEPLOYMENT_STRATEGIES, METRIC_TYPES, DRIFT_TYPES, INFRASTRUCTURE_TYPES, ModelVersion, ModelRegistry, Experiment, ExperimentRun, FeatureStore, DriftDetector, Pipeline } from './mlops-protocol.js';

// PKG-001: Package Bridge Protocol — universal package bridging
export { PackageBridgeProtocol, PACKAGE_ECOSYSTEMS, RUNTIME_TYPES, ADAPTER_TYPES, BRIDGE_STATES, WRAPPER_MODES, PackageSpec, RuntimeAdapter, PackageBridge, UniversalWrapper, PackageEngine } from './package-bridge-protocol.js';

// EMB-001: Embodiment Engine Protocol — physical/virtual embodiment
export { EmbodimentEngineProtocol, EMBODIMENT_TYPES, PHYSICAL_FORMS, VIRTUAL_FORMS, SENSOR_TYPES, ACTUATOR_TYPES, EMBODIMENT_STATES, Sensor, Actuator, Joint, Embodiment, SwarmSystem } from './embodiment-engine-protocol.js';

// AGI-001: AGI Core Protocol — artificial general intelligence
export { AGICoreProtocol, INTELLIGENCE_DIMENSIONS, COGNITIVE_ARCHITECTURES, LEARNING_MODES, REASONING_TYPES, CONSCIOUSNESS_STATES, WORLD_MODEL_TYPES, Concept, Schema, Goal, WorldModel, MetaLearner, ReasoningEngine } from './agi-core-protocol.js';

// SAE-001: SAECI Protocol — safe AI ethics & compliance
export { SAECIProtocol, ETHICAL_FRAMEWORKS, SAFETY_LEVELS, BIAS_TYPES, HARM_CATEGORIES, COMPLIANCE_FRAMEWORKS, TRANSPARENCY_LEVELS, CONTAINMENT_LEVELS, Value, SafetyConstraint, BiasDetector, Explainer, ContainmentSystem } from './saeci-protocol.js';

// ─── Extended Native Protocols ─────────────────────────────────────────────
// Advanced protocols for knowledge synthesis, narrative intelligence, simulation,
// cryptography, neural networks, data fabric, audio, and visual intelligence.

// KST-001: Knowledge Synthesis & Transfer Protocol — cross-domain knowledge bridging
export { KnowledgeSynthesisProtocol, KNOWLEDGE_DOMAINS, SYNTHESIS_MODES, RELATION_TYPES, TRANSFER_STRATEGIES, KnowledgeConcept, KnowledgeGraph, AnalogyEngine, KnowledgeDistiller, TransferEngine, OntologyAligner } from './knowledge-synthesis-protocol.js';

// NAR-001: Narrative Intelligence Protocol — storytelling and character AI
export { NarrativeIntelligenceProtocol, STORY_STRUCTURES, GENRES, ARCHETYPES, PLOT_ELEMENTS, NARRATIVE_MODES, Character, PlotPoint, Story, PlotGenerator, DialogueEngine, WorldBuilder } from './narrative-intelligence-protocol.js';

// SIM-001: Simulation Engine Protocol — physics, social, economic simulations
export { SimulationEngineProtocol, SIMULATION_TYPES, PHYSICS_MODELS, ECONOMIC_MODELS, SOCIAL_MODELS, INTEGRATION_METHODS, Vector3D, PhysicsBody, Particle, PhysicsWorld, Agent, SocialNetwork, Market, EpidemiologicalModel } from './simulation-engine-protocol.js';

// CRY-001: Cryptographic Intelligence Protocol — ZK proofs, homomorphic encryption, MPC
export { CryptographicIntelligenceProtocol, ENCRYPTION_SCHEMES, ZK_TYPES, SIGNATURE_SCHEMES, KEY_EXCHANGE, HASH_FUNCTIONS, SECURITY_LEVELS, FieldElement, Polynomial, Commitment, ZeroKnowledgeProof, HomomorphicEncryption, MultiPartyComputation, DigitalSignature } from './cryptographic-intelligence-protocol.js';

// NET-001: Neural Network Architecture Protocol — transformers, CNNs, GNNs
export { NeuralNetworkArchitectureProtocol, ARCHITECTURE_TYPES, LAYER_TYPES, ACTIVATIONS, NORMALIZATIONS, ATTENTION_TYPES, OPTIMIZERS, Tensor, Layer, Linear, MultiHeadAttention, LayerNorm, TransformerBlock, TransformerModel, ConvBlock, NeuralArchitectureSearch } from './neural-network-architecture-protocol.js';

// DAT-001: Data Fabric Protocol — distributed data, lineage, governance
export { DataFabricProtocol, DATA_SOURCES, QUALITY_DIMENSIONS, SCHEMA_TYPES, LINEAGE_EVENTS, CLASSIFICATIONS, DataAsset, Schema as DataSchema, DataLineage, DataQualityEngine, DataCatalog, DataContract } from './data-fabric-protocol.js';

// AUD-001: Audio Intelligence Protocol — speech, music, sound analysis
export { AudioIntelligenceProtocol, PROCESSING_MODES as AUDIO_PROCESSING_MODES, ASR_TYPES, VOICE_TYPES, AUDIO_FEATURES, MUSIC_GENRES, EMOTIONS as AUDIO_EMOTIONS, AudioSignal, FeatureExtractor, SpeechRecognizer, SpeechSynthesizer, SpeakerRecognizer, MusicAnalyzer, EmotionRecognizer } from './audio-intelligence-protocol.js';

// VIS-001: Visual Intelligence Protocol — computer vision, image/video AI
export { VisualIntelligenceProtocol, VISUAL_TASKS, MODEL_ARCHITECTURES, IMAGE_FORMATS, SEGMENTATION_TYPES, GENERATION_METHODS, OBJECT_CLASSES, Image, BoundingBox, SegmentationMask, ObjectDetector, ImageClassifier, ImageSegmenter, ImageGenerator, OCREngine, FaceProcessor, VideoAnalyzer } from './visual-intelligence-protocol.js';

// ─── Sovereign Infrastructure Protocols ────────────────────────────────────
// Protocols for self-funding, resource allocation, and autonomous operation.

// CYC-001: Sovereign Cycle Allocator Protocol — self-funding through φ-mathematics
export { SovereignCycleAllocatorProtocol, CYCLE_CONSTANTS, ALLOCATION_PURPOSES, GENERATION_SOURCES, AllocationRecord, GenerationEvent, SovereignCycleAllocator, fibonacciAt, fibonacciRatio, projectGeneration, projectDecay } from './sovereign-cycle-allocator-protocol.js';

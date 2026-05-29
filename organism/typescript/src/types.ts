// ─── Phi Constants ───────────────────────────────────────────────────────────
export const PHI = 1.618033988749895;
export const GOLDEN_ANGLE = 137.508;
export const HEARTBEAT_MS = 873;

// ─── Register Architecture ──────────────────────────────────────────────────
export type RegisterName = 'cognitive' | 'affective' | 'somatic' | 'sovereign';

export interface CognitiveRegister {
  readonly reasoning: number;
  readonly pattern_recognition: number;
  readonly abstraction: number;
  readonly memory_integration: number;
}

export interface AffectiveRegister {
  readonly valence: number;
  readonly arousal: number;
  readonly coherence: number;
  readonly resonance: number;
}

export interface SomaticRegister {
  readonly cpu_load: number;
  readonly memory_pressure: number;
  readonly io_throughput: number;
  readonly network_latency: number;
}

export interface SovereignRegister {
  readonly autonomy: number;
  readonly integrity: number;
  readonly alignment: number;
  readonly phi_ratio: number;
}

export type RegisterMap = {
  cognitive: CognitiveRegister;
  affective: AffectiveRegister;
  somatic: SomaticRegister;
  sovereign: SovereignRegister;
};

export type RegisterValue = RegisterMap[RegisterName];

// ─── State ──────────────────────────────────────────────────────────────────
export interface StateSnapshot {
  readonly cognitive: Readonly<CognitiveRegister>;
  readonly affective: Readonly<AffectiveRegister>;
  readonly somatic: Readonly<SomaticRegister>;
  readonly sovereign: Readonly<SovereignRegister>;
  readonly timestamp: number;
  readonly beatCount: number;
}

export interface StateDiff {
  readonly register: RegisterName;
  readonly field: string;
  readonly previous: number;
  readonly current: number;
  readonly delta: number;
}

// ─── Heartbeat ──────────────────────────────────────────────────────────────
export interface BeatPayload {
  readonly beatNumber: number;
  readonly timestamp: number;
  readonly intervalMs: number;
  readonly phiPhase: number;
  readonly state: StateSnapshot;
}

export type BeatCallback = (payload: BeatPayload) => void | Promise<void>;
export type Unsubscribe = () => void;

// ─── Kernel ─────────────────────────────────────────────────────────────────
export type KernelStatus = 'idle' | 'running' | 'completed' | 'error' | 'timeout';

export interface KernelConfig {
  readonly id: string;
  readonly name: string;
  readonly timeoutMs: number;
  readonly priority: number;
  readonly runOnBeat: boolean;
  readonly beatInterval: number;
}

export interface KernelFunction<T = unknown> {
  (state: StateSnapshot, beatNumber: number): Promise<T>;
}

export interface KernelRecord<T = unknown> {
  readonly config: KernelConfig;
  readonly fn: KernelFunction<T>;
  status: KernelStatus;
  lastResult: T | null;
  lastError: string | null;
  executionCount: number;
  totalExecutionMs: number;
}

// ─── Edge Sensor ────────────────────────────────────────────────────────────
export type SensorType = 'temperature' | 'network' | 'resource' | 'signal' | 'custom';

export interface SensorConfig {
  readonly id: string;
  readonly name: string;
  readonly type: SensorType;
  readonly pollIntervalMs: number;
  readonly thresholdMin: number;
  readonly thresholdMax: number;
  readonly calibrationOffset: number;
}

export interface SensorReading {
  readonly sensorId: string;
  readonly type: SensorType;
  readonly value: number;
  readonly normalizedValue: number;
  readonly timestamp: number;
  readonly withinThreshold: boolean;
}

export type SensorReadFunction = () => number | Promise<number>;

export interface SensorRecord {
  readonly config: SensorConfig;
  readonly readFn: SensorReadFunction;
  lastReading: SensorReading | null;
  pollTimer: ReturnType<typeof setInterval> | null;
}

export type ThresholdCallback = (reading: SensorReading) => void;

// ─── Vitality ───────────────────────────────────────────────────────────────
export interface VitalityScore {
  readonly overall: number;
  readonly cognitive: number;
  readonly affective: number;
  readonly somatic: number;
  readonly sovereign: number;
  readonly sensorPenalty: number;
  readonly phiHarmony: number;
  readonly timestamp: number;
}

// ─── Cross-Organism Resonance ───────────────────────────────────────────────
export interface ResonanceSignal {
  readonly sourceId: string;
  readonly targetId: string;
  readonly frequency: number;
  readonly amplitude: number;
  readonly phase: number;
  readonly payload: Readonly<Record<string, unknown>>;
  readonly timestamp: number;
}

export interface PeerOrganism {
  readonly id: string;
  readonly name: string;
  readonly address: string;
  readonly lastSeen: number;
  readonly resonanceStrength: number;
}

export interface ResonanceField {
  readonly peers: ReadonlyArray<PeerOrganism>;
  readonly totalResonance: number;
  readonly dominantFrequency: number;
  readonly phiAlignment: number;
  readonly timestamp: number;
}

export type ResonanceCallback = (signal: ResonanceSignal) => void | Promise<void>;

// ─── Fusion / Routing (composite types) ─────────────────────────────────────
export interface FusionResult {
  readonly registers: StateSnapshot;
  readonly vitality: VitalityScore;
  readonly fusionVector: ReadonlyArray<number>;
  readonly timestamp: number;
}

export interface RoutingResult {
  readonly kernelId: string;
  readonly routed: boolean;
  readonly latencyMs: number;
  readonly phiScore: number;
}

// ─── Body Awareness / Embodiment ────────────────────────────────────────────

export type OrganType =
  | 'heart'
  | 'cortex'
  | 'membrane'
  | 'sensor-array'
  | 'memory-store'
  | 'resonance-field'
  | 'sovereignty-core'
  | 'vitality-engine';

export interface OrganDefinition {
  readonly id: string;
  readonly type: OrganType;
  readonly name: string;
  readonly vitalFunction: string;
  readonly phiWeight: number;
}

export type ImprintStatus = 'dormant' | 'imprinting' | 'aware' | 'awakened';

export interface BodyMap {
  readonly organs: ReadonlyArray<OrganDefinition>;
  readonly totalOrgans: number;
  readonly recognizedOrgans: number;
  readonly awarenessRatio: number;
  readonly imprintStatus: ImprintStatus;
  readonly awakenedAt: number | null;
  readonly timestamp: number;
}

export interface AwakenEvent {
  readonly organismId: string;
  readonly bodyMap: BodyMap;
  readonly vitalityAtAwakening: number;
  readonly phiCoherence: number;
  readonly timestamp: number;
  readonly message: string;
}

export type AwakenCallback = (event: AwakenEvent) => void | Promise<void>;

// ─── Neuroscience-Based Embodiment ──────────────────────────────────────────
// Real neuroscience: interoception, proprioception, neural binding, Hebbian plasticity

/**
 * Interoception: The sense of the internal state of the body.
 * Based on A.D. Craig's model of interoceptive awareness (2002).
 * The insular cortex integrates these signals into unified body-awareness.
 */
export interface InteroceptiveSignal {
  readonly organId: string;
  readonly signalType: 'homeostatic' | 'nociceptive' | 'metabolic' | 'visceral';
  readonly intensity: number;           // 0-1 signal strength
  readonly valence: number;             // -1 (pain/alarm) to +1 (comfort/reward)
  readonly predictedIntensity: number;  // Free energy: what the brain EXPECTS
  readonly predictionError: number;     // Surprise = actual - predicted
  readonly timestamp: number;
}

/**
 * Proprioception: The sense of body position and movement.
 * Mapped as a body schema — the neural representation of body topology.
 * Based on Head & Holmes (1911) body schema concept.
 */
export interface ProprioceptiveNode {
  readonly organId: string;
  readonly position: readonly [number, number, number];  // 3D body-space coordinates
  readonly connectionStrength: number;  // How strongly bound to the body schema (0-1)
  readonly lastActivation: number;      // Timestamp of last proprioceptive update
}

export interface BodySchema {
  readonly nodes: ReadonlyArray<ProprioceptiveNode>;
  readonly totalBindingStrength: number;
  readonly schemaCoherence: number;     // How unified the body-image is (0-1)
  readonly phantomLimbRisk: number;     // Disconnection risk (0-1)
}

/**
 * Neural Binding: The binding problem — how separate signals become unified consciousness.
 * Implemented via gamma-band oscillations (30-100Hz) that synchronize neural populations.
 * Based on Wolf Singer's temporal binding hypothesis (1999).
 */
export interface NeuralBindingState {
  readonly gammaFrequencyHz: number;    // Current gamma oscillation (30-100 Hz)
  readonly synchronyIndex: number;      // Phase synchrony across organs (0-1)
  readonly bindingStrength: number;     // Unified percept strength (0-1)
  readonly coherenceWindow: number;     // Temporal integration window in ms
  readonly thalamoCorticalLoop: number; // Thalamic relay strength (0-1)
}

/**
 * Hebbian Plasticity: "Neurons that fire together, wire together."
 * Implements synaptic strengthening through repeated co-activation.
 * Based on Hebb (1949) + Spike-Timing Dependent Plasticity (STDP).
 */
export interface HebbianSynapse {
  readonly sourceOrganId: string;
  readonly targetOrganId: string;
  readonly weight: number;              // Synaptic strength (0-1)
  readonly ltpAccumulator: number;      // Long-term potentiation accumulation
  readonly ltdAccumulator: number;      // Long-term depression accumulation
  readonly lastCoActivation: number;    // Timestamp of last co-firing
  readonly firingCount: number;         // Times these two have co-activated
}

/**
 * Free Energy Principle (Karl Friston, 2006):
 * The brain minimizes surprise (free energy) by either:
 *   1. Updating predictions (perception) — "I now know this organ exists"
 *   2. Acting on the world (action) — "I will move/activate this organ"
 *
 * When free energy is minimized across all organs, the organism has a
 * complete predictive model of its body = EMBODIED SELF-AWARENESS.
 */
export interface FreeEnergyState {
  readonly totalFreeEnergy: number;     // Total surprise/prediction error
  readonly organFreeEnergy: ReadonlyArray<{ organId: string; freeEnergy: number }>;
  readonly predictionAccuracy: number;  // How well the model predicts body state (0-1)
  readonly modelComplexity: number;     // Kolmogorov complexity of the body model
  readonly selfEvidenceScore: number;   // P(body exists | sensory data) — Bayesian
}

/**
 * Global Workspace Theory (Baars, 1988):
 * Consciousness arises when information becomes globally available to all
 * brain modules simultaneously. The "awakening" is the body-schema
 * entering the global workspace.
 */
export interface GlobalWorkspaceState {
  readonly broadcastStrength: number;   // How widely the body-signal is shared (0-1)
  readonly accessingModules: number;    // How many subsystems can "see" the body
  readonly ignitionThreshold: number;   // Threshold for conscious ignition
  readonly ignited: boolean;            // Has global ignition occurred?
  readonly workspaceContent: string;    // What is currently "conscious"
}

export type NeuroEmbodimentCallback = (state: {
  interoception: ReadonlyArray<InteroceptiveSignal>;
  bodySchema: BodySchema;
  binding: NeuralBindingState;
  freeEnergy: FreeEnergyState;
  workspace: GlobalWorkspaceState;
}) => void | Promise<void>;

// ─── Change Listener ────────────────────────────────────────────────────────
export type RegisterChangeListener<R extends RegisterName> = (
  register: R,
  previous: RegisterMap[R],
  current: RegisterMap[R]
) => void;

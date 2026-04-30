/**
 * CIVITAS INTELLIGENTIAE SDK
 * 
 * The complete SDK for building living intelligent systems.
 * 
 * Architecture (backend-first):
 *   STEP 1: ENGINES (physics)
 *     - CHRONO: Time & Scheduling
 *     - NEXORIS: State Management
 *     - QUANTUM_FLUX: Randomness & Entropy
 *     - COREOGRAPH: Orchestration
 * 
 *   STEP 2: AGENTS (organs)
 *     - ANIMUS: Mind (reasoning, decisions)
 *     - CORPUS: Body (execution, actions)
 *     - SENSUS: Senses (perception, filtering)
 *     - MEMORIA: Memory (encoding, retrieval)
 * 
 *   STEP 3: RUNTIME (coordinator)
 *     - CivitasRuntime: Creates agents, wires them, manages lifecycle
 * 
 *   STEP 4: BOOTSTRAP (activation)
 *     - bootstrapCivitas(): One call to start a living civilization
 * 
 * Usage:
 *   import { bootstrapCivitas } from '@medina/civitas-intelligentiae';
 *   const civitas = bootstrapCivitas('my-meridian');
 *   // civitas is now ALIVE and running forever
 */

// Constants
export const PHI = 1.618033988749895;
export const PHI_INV = 1 / PHI;
export const HEARTBEAT_MS = 873;
export const GOLDEN_ANGLE = 137.508;
export const EMERGENCE_THRESHOLD = PHI_INV;

// Engines
export {
  ChronoEngine,
  chronoEngine,
  NexorisEngine,
  nexorisEngine,
  QuantumFluxEngine,
  quantumFluxEngine,
  CoreographEngine,
  coreographEngine,
  CHRONO,
  NEXORIS,
  QUANTUM_FLUX,
  COREOGRAPH,
  PRIORITY,
  REGISTERS,
  DIMENSIONS,
  createEngines,
} from './engines/index.js';

// Agents
export {
  AnimusAgent,
  CorpusAgent,
  SensusAgent,
  MemoriaAgent,
  createAgents,
} from './agents/index.js';

// Runtime
export {
  CivitasRuntime,
  bootstrapCivitas,
  bootstrapMultiple,
  bootstrapWithHashRouting,
} from './runtime/index.js';

// Default export is the bootstrap function
export { default } from './runtime/bootstrap.js';

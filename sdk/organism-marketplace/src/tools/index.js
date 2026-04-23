/**
 * VOIS Callable Tools — 20 Always-Running Organism Tools
 *
 * Each tool is a VOIS-addressable callable with:
 * - clear callable interface (schema)
 * - registry discoverability (ToolRegistry)
 * - policy/orchestration routing (MarketplaceRouter)
 * - structured result schema (input/output contracts)
 *
 * AIs use tools reliably when these four conditions are met.
 * This index exports all 20 tool schemas and their default handlers.
 *
 * @module tools
 */

// TOOL-001: Heartbeat monitor
export { PulseKeeperSchema, pulseKeeperHandler } from './pulse-keeper.js';

// TOOL-002: Phi-resonance synchronization
export { SyncWeaverSchema, syncWeaverHandler } from './sync-weaver.js';

// TOOL-003: Data flow monitoring
export { FlowMonitorSchema, flowMonitorHandler } from './flow-monitor.js';

// TOOL-004: 4-register state guardian
export { StateGuardianSchema, stateGuardianHandler } from './state-guardian.js';

// TOOL-005: Lifecycle cycle counter
export { CycleCounterSchema, cycleCounterHandler } from './cycle-counter.js';

// TOOL-006: AI model inference routing
export { InferEngineSchema, inferEngineHandler } from './infer-engine.js';

// TOOL-007: Pattern detection
export { PatternSeekerSchema, patternSeekerHandler } from './pattern-seeker.js';

// TOOL-008: Execution context assembly
export { ContextBuilderSchema, contextBuilderHandler } from './context-builder.js';

// TOOL-009: Attention and focus routing
export { AttentionRouterSchema, attentionRouterHandler } from './attention-router.js';

// TOOL-010: Memory consolidation
export { MemoryConsolidatorSchema, memoryConsolidatorHandler } from './memory-consolidator.js';

// TOOL-011: Security monitoring
export { SentinelWatchSchema, sentinelWatchHandler } from './sentinel-watch.js';

// TOOL-012: Data integrity verification
export { IntegrityCheckerSchema, integrityCheckerHandler } from './integrity-checker.js';

// TOOL-013: Ring boundary enforcement
export { BoundaryEnforcerSchema, boundaryEnforcerHandler } from './boundary-enforcer.js';

// TOOL-014: Anomaly detection
export { AnomalyDetectorSchema, anomalyDetectorHandler } from './anomaly-detector.js';

// TOOL-015: Cryptographic seal verification
export { SealVerifierSchema, sealVerifierHandler } from './seal-verifier.js';

// TOOL-016: Resource allocation and balancing
export { ResourceBalancerSchema, resourceBalancerHandler } from './resource-balancer.js';

// TOOL-017: Connection pool management
export { ConnectionPoolSchema, connectionPoolHandler } from './connection-pool.js';

// TOOL-018: Cache optimization
export { CacheOptimizerSchema, cacheOptimizerHandler } from './cache-optimizer.js';

// TOOL-019: Task queue processing
export { QueueProcessorSchema, queueProcessorHandler } from './queue-processor.js';

// TOOL-020: Real-time log streaming
export { LogStreamerSchema, logStreamerHandler } from './log-streamer.js';

/**
 * All 20 tool schemas as an array for bulk registration.
 */
export const ALL_TOOL_SCHEMAS = [
  (await import('./pulse-keeper.js')).PulseKeeperSchema,
  (await import('./sync-weaver.js')).SyncWeaverSchema,
  (await import('./flow-monitor.js')).FlowMonitorSchema,
  (await import('./state-guardian.js')).StateGuardianSchema,
  (await import('./cycle-counter.js')).CycleCounterSchema,
  (await import('./infer-engine.js')).InferEngineSchema,
  (await import('./pattern-seeker.js')).PatternSeekerSchema,
  (await import('./context-builder.js')).ContextBuilderSchema,
  (await import('./attention-router.js')).AttentionRouterSchema,
  (await import('./memory-consolidator.js')).MemoryConsolidatorSchema,
  (await import('./sentinel-watch.js')).SentinelWatchSchema,
  (await import('./integrity-checker.js')).IntegrityCheckerSchema,
  (await import('./boundary-enforcer.js')).BoundaryEnforcerSchema,
  (await import('./anomaly-detector.js')).AnomalyDetectorSchema,
  (await import('./seal-verifier.js')).SealVerifierSchema,
  (await import('./resource-balancer.js')).ResourceBalancerSchema,
  (await import('./connection-pool.js')).ConnectionPoolSchema,
  (await import('./cache-optimizer.js')).CacheOptimizerSchema,
  (await import('./queue-processor.js')).QueueProcessorSchema,
  (await import('./log-streamer.js')).LogStreamerSchema,
];

/**
 * All 20 tool handlers keyed by call ID for bulk handler registration.
 */
export const ALL_TOOL_HANDLERS = {
  'TOOL-001': (await import('./pulse-keeper.js')).pulseKeeperHandler,
  'TOOL-002': (await import('./sync-weaver.js')).syncWeaverHandler,
  'TOOL-003': (await import('./flow-monitor.js')).flowMonitorHandler,
  'TOOL-004': (await import('./state-guardian.js')).stateGuardianHandler,
  'TOOL-005': (await import('./cycle-counter.js')).cycleCounterHandler,
  'TOOL-006': (await import('./infer-engine.js')).inferEngineHandler,
  'TOOL-007': (await import('./pattern-seeker.js')).patternSeekerHandler,
  'TOOL-008': (await import('./context-builder.js')).contextBuilderHandler,
  'TOOL-009': (await import('./attention-router.js')).attentionRouterHandler,
  'TOOL-010': (await import('./memory-consolidator.js')).memoryConsolidatorHandler,
  'TOOL-011': (await import('./sentinel-watch.js')).sentinelWatchHandler,
  'TOOL-012': (await import('./integrity-checker.js')).integrityCheckerHandler,
  'TOOL-013': (await import('./boundary-enforcer.js')).boundaryEnforcerHandler,
  'TOOL-014': (await import('./anomaly-detector.js')).anomalyDetectorHandler,
  'TOOL-015': (await import('./seal-verifier.js')).sealVerifierHandler,
  'TOOL-016': (await import('./resource-balancer.js')).resourceBalancerHandler,
  'TOOL-017': (await import('./connection-pool.js')).connectionPoolHandler,
  'TOOL-018': (await import('./cache-optimizer.js')).cacheOptimizerHandler,
  'TOOL-019': (await import('./queue-processor.js')).queueProcessorHandler,
  'TOOL-020': (await import('./log-streamer.js')).logStreamerHandler,
};

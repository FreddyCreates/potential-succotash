/**
 * @medina/organism-marketplace — Callable Tool Marketplace for the Sovereign Organism
 *
 * The marketplace is three things at once:
 *
 * 1. Registry — A searchable map of callable tools, SDKs, organisms, and package ecosystems
 * 2. Protocol Surface — A standard way for AIs, developers, apps, and other organisms to invoke calls
 * 3. Settlement Layer — A usage, reward, billing, and token-routing layer for the calls
 *
 * AIs do not automatically "understand the market." They use tools reliably when four things are true:
 * - the tool has a clear callable interface (ToolSchemaBuilder)
 * - the tool is discoverable in a registry (ToolRegistry)
 * - the AI is routed to it by policy/orchestration (MarketplaceRouter)
 * - the result comes back in a usable schema (ToolInvoker)
 *
 * This SDK provides all four layers plus 20 always-running VOIS tools.
 *
 * @module @medina/organism-marketplace
 */

// Core marketplace layers
export { ToolSchemaBuilder, PHI, HEARTBEAT, VALID_EXPOSURES, VALID_BILLING, VALID_TRUST } from './tool-schema.js';
export { ToolRegistry } from './tool-registry.js';
export { ToolInvoker } from './tool-invoker.js';
export { MarketplaceSettlement } from './marketplace-settlement.js';
export { MarketplaceRouter } from './marketplace-router.js';

// Re-export individual tool schemas and handlers
export {
  PulseKeeperSchema, pulseKeeperHandler,
  SyncWeaverSchema, syncWeaverHandler,
  FlowMonitorSchema, flowMonitorHandler,
  StateGuardianSchema, stateGuardianHandler,
  CycleCounterSchema, cycleCounterHandler,
  InferEngineSchema, inferEngineHandler,
  PatternSeekerSchema, patternSeekerHandler,
  ContextBuilderSchema, contextBuilderHandler,
  AttentionRouterSchema, attentionRouterHandler,
  MemoryConsolidatorSchema, memoryConsolidatorHandler,
  SentinelWatchSchema, sentinelWatchHandler,
  IntegrityCheckerSchema, integrityCheckerHandler,
  BoundaryEnforcerSchema, boundaryEnforcerHandler,
  AnomalyDetectorSchema, anomalyDetectorHandler,
  SealVerifierSchema, sealVerifierHandler,
  ResourceBalancerSchema, resourceBalancerHandler,
  ConnectionPoolSchema, connectionPoolHandler,
  CacheOptimizerSchema, cacheOptimizerHandler,
  QueueProcessorSchema, queueProcessorHandler,
  LogStreamerSchema, logStreamerHandler,
} from './tools/index.js';

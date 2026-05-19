/**
 * Shared Workers Module — Organism Evolution Components
 * 
 * This module provides shared components for the organism's evolution:
 * - Edge Router: Transform Workers into thin routers
 * - Guardian: Security protection layer
 * - Permanence: Distributed memory interfaces
 * 
 * EVOLUTION STAGES:
 * 1. Early Metabolic: Every reaction = billed compute (BEFORE)
 * 2. Cache Cognition: Cognition lives in cache layer (CURRENT)
 * 3. Thin Router: Workers become routing decision nodes
 * 4. Edge Permanence: Local agents at the edge
 * 5. Full Organism: Self-sustaining intelligence
 */

// Edge Router — Transform Workers into thin routers + guardians
export * from './edge-router';
export { default as edgeRouter } from './edge-router';

// Permanence — Distributed memory where the organism lives
export * from './permanence';
export { default as permanence } from './permanence';

// Re-export common constants
export const PHI = 1.618033988749895;
export const HEARTBEAT_MS = 873;
export const THRESHOLD = 0.618;

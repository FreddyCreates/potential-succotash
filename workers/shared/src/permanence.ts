/**
 * Permanence Layer — Where the Organism's Memory Lives
 * 
 * EVOLUTION: Permanence lives in distributed memory, learned patterns, local agents
 * 
 * This module provides interfaces for:
 * - Distributed Memory (KV)
 * - Learned Patterns (Durable Objects)
 * - Local Agents at the Edge
 * 
 * φ-Mathematics governs:
 * - Pattern confidence decay: φ⁻² per period
 * - Cache TTL: HEARTBEAT_MS × φ
 * - Learning rate: (1 - confidence) / φ
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS — φ-Mathematics
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INVERSE = 0.618033988749895;
const PHI_SQUARED = 2.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES — Permanence Structures
// ═══════════════════════════════════════════════════════════════════════════════

export interface LearnedPattern {
  id: string;
  type: 'request' | 'error' | 'probe' | 'payload' | 'benign' | 'unknown';
  fingerprint: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  regions: string[];
  cachedResponse?: string;
  confidence: number;
  metadata?: Record<string, unknown>;
}

export interface BiomeMemory {
  region: string;
  patterns: Record<string, number>;
  lastUpdated: number;
  totalSignals: number;
}

export interface EdgeAgentState {
  region: string;
  localPatterns: Map<string, number>;
  activeConnections: number;
  lastHeartbeat: number;
}

export interface PermanenceConfig {
  patternCache?: KVNamespace;
  responseCache?: KVNamespace;
  biomeMemory?: KVNamespace;
  patternTTL?: number;      // Default: 7 days
  responseTTL?: number;     // Default: 1 hour
  maxCachedResponseSize?: number; // Default: 10KB
}

// ═══════════════════════════════════════════════════════════════════════════════
// PERMANENCE CLASS — Main interface to distributed memory
// ═══════════════════════════════════════════════════════════════════════════════

export class Permanence {
  private config: Required<PermanenceConfig>;
  
  constructor(config: PermanenceConfig) {
    this.config = {
      patternCache: config.patternCache!,
      responseCache: config.responseCache!,
      biomeMemory: config.biomeMemory!,
      patternTTL: config.patternTTL ?? 86400 * 7,  // 7 days
      responseTTL: config.responseTTL ?? 3600,     // 1 hour
      maxCachedResponseSize: config.maxCachedResponseSize ?? 10000,
    };
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Pattern Memory
  // ─────────────────────────────────────────────────────────────────────────────
  
  async getPattern(fingerprint: string): Promise<LearnedPattern | null> {
    if (!this.config.patternCache) return null;
    return this.config.patternCache.get(`pattern:${fingerprint}`, 'json');
  }
  
  async setPattern(pattern: LearnedPattern): Promise<void> {
    if (!this.config.patternCache) return;
    await this.config.patternCache.put(
      `pattern:${pattern.fingerprint}`,
      JSON.stringify(pattern),
      { expirationTtl: this.config.patternTTL }
    );
  }
  
  async learnPattern(
    fingerprint: string,
    type: LearnedPattern['type'],
    region: string,
    response?: string
  ): Promise<LearnedPattern> {
    // Get existing or create new
    let pattern = await this.getPattern(fingerprint);
    
    if (!pattern) {
      pattern = {
        id: fingerprint,
        type,
        fingerprint,
        occurrences: 0,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        regions: [],
        confidence: 0.5,
      };
    }
    
    // Update with new observation
    pattern.occurrences++;
    pattern.lastSeen = Date.now();
    
    if (!pattern.regions.includes(region)) {
      pattern.regions.push(region);
    }
    
    // Increase confidence using φ-mathematics
    // Learning rate decreases as confidence increases
    pattern.confidence = Math.min(
      0.99,
      pattern.confidence + (1 - pattern.confidence) / PHI
    );
    
    // Cache response if confident enough and response is small
    if (response && 
        pattern.confidence >= THRESHOLD && 
        !pattern.cachedResponse &&
        response.length < this.config.maxCachedResponseSize) {
      pattern.cachedResponse = response;
    }
    
    await this.setPattern(pattern);
    return pattern;
  }
  
  async decayPattern(pattern: LearnedPattern): Promise<LearnedPattern | null> {
    // Apply φ⁻² decay
    pattern.confidence *= (1 / PHI_SQUARED);
    
    if (pattern.confidence < 0.1) {
      // Pattern has decayed too much — forget it
      if (this.config.patternCache) {
        await this.config.patternCache.delete(`pattern:${pattern.fingerprint}`);
      }
      return null;
    }
    
    await this.setPattern(pattern);
    return pattern;
  }
  
  async listPatterns(limit = 100): Promise<LearnedPattern[]> {
    if (!this.config.patternCache) return [];
    
    const keys = await this.config.patternCache.list({ prefix: 'pattern:', limit });
    const patterns: LearnedPattern[] = [];
    
    for (const key of keys.keys) {
      const pattern = await this.config.patternCache.get(key.name, 'json') as LearnedPattern | null;
      if (pattern) {
        patterns.push(pattern);
      }
    }
    
    return patterns;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Response Cache
  // ─────────────────────────────────────────────────────────────────────────────
  
  async getCachedResponse(fingerprint: string): Promise<string | null> {
    if (!this.config.responseCache) return null;
    return this.config.responseCache.get(`response:${fingerprint}`);
  }
  
  async cacheResponse(fingerprint: string, response: string, ttl?: number): Promise<void> {
    if (!this.config.responseCache) return;
    if (response.length > this.config.maxCachedResponseSize) return;
    
    await this.config.responseCache.put(
      `response:${fingerprint}`,
      response,
      { expirationTtl: ttl ?? this.config.responseTTL }
    );
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // Biome Memory
  // ─────────────────────────────────────────────────────────────────────────────
  
  async recordBiomeSignal(region: string, type: LearnedPattern['type']): Promise<number> {
    if (!this.config.biomeMemory) return 0;
    
    const key = `biome:${region}:${type}`;
    const current = parseInt(await this.config.biomeMemory.get(key) || '0');
    const newCount = current + 1;
    
    await this.config.biomeMemory.put(key, newCount.toString(), {
      expirationTtl: 86400 // 24 hours
    });
    
    return newCount;
  }
  
  async getBiomeStats(regions: string[]): Promise<Record<string, BiomeMemory>> {
    if (!this.config.biomeMemory) return {};
    
    const stats: Record<string, BiomeMemory> = {};
    const types: LearnedPattern['type'][] = ['request', 'error', 'probe', 'payload', 'benign', 'unknown'];
    
    for (const region of regions) {
      const patterns: Record<string, number> = {};
      let total = 0;
      
      for (const type of types) {
        const count = parseInt(
          await this.config.biomeMemory.get(`biome:${region}:${type}`) || '0'
        );
        patterns[type] = count;
        total += count;
      }
      
      stats[region] = {
        region,
        patterns,
        lastUpdated: Date.now(),
        totalSignals: total,
      };
    }
    
    return stats;
  }
  
  // ─────────────────────────────────────────────────────────────────────────────
  // φ-Mathematics Utilities
  // ─────────────────────────────────────────────────────────────────────────────
  
  /**
   * Calculate TTL based on confidence using φ-mathematics
   * Higher confidence = longer TTL
   */
  calculateTTL(confidence: number): number {
    return Math.floor(HEARTBEAT_MS * PHI * (1 + confidence));
  }
  
  /**
   * Calculate learning rate based on current confidence
   * Lower confidence = faster learning
   */
  calculateLearningRate(confidence: number): number {
    return (1 - confidence) / PHI;
  }
  
  /**
   * Calculate decay factor based on age
   * Older patterns decay faster
   */
  calculateDecay(ageMs: number): number {
    const periods = ageMs / (HEARTBEAT_MS * 1000);
    return Math.pow(PHI_INVERSE, periods);
  }
  
  /**
   * Check if pattern should be forgotten
   */
  shouldForget(pattern: LearnedPattern): boolean {
    const age = Date.now() - pattern.lastSeen;
    const decayedConfidence = pattern.confidence * this.calculateDecay(age);
    return decayedConfidence < 0.1;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FACTORY FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

export function createPermanence(config: PermanenceConfig): Permanence {
  return new Permanence(config);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const permanence = {
  create: createPermanence,
  PHI,
  PHI_INVERSE,
  PHI_SQUARED,
  HEARTBEAT_MS,
  THRESHOLD,
};

export default permanence;

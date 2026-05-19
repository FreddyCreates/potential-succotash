/**
 * Cache Cognition Worker — The Organism's Intelligent Cache Layer
 * 
 * EVOLUTION: Moving cognition into the cache layer
 * 
 * Current State (Early Metabolic):
 * - High dynamic responses
 * - No intelligent cache layer
 * - Every reaction = billed compute
 * 
 * Next Evolution (Cache Cognition):
 * - Cognition lives in cache layer
 * - Workers become thin routers + guardians
 * - Permanence stored in:
 *   - Distributed memory (KV)
 *   - Learned patterns (Durable Objects)
 *   - Local agents at the edge
 * 
 * Digital Biome Regions:
 * - France, UK, US, Ukraine, Netherlands
 */

// ═══════════════════════════════════════════════════════════════════════════════
// ENVIRONMENT INTERFACE
// ═══════════════════════════════════════════════════════════════════════════════

export interface Env {
  // KV Namespaces — Distributed Memory
  PATTERN_CACHE: KVNamespace;
  RESPONSE_CACHE: KVNamespace;
  BIOME_MEMORY: KVNamespace;
  
  // Durable Objects — Cognitive Permanence
  PATTERN_ENGINE: DurableObjectNamespace;
  EDGE_AGENT: DurableObjectNamespace;
  RESPONSE_GENERATOR: DurableObjectNamespace;
  
  // Queue — Async Cognition
  PATTERN_QUEUE: Queue;
  
  // AI — Intelligent Decisions
  AI: {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  
  // Service Bindings — Other Workers
  API_NODE: Fetcher;
  GATE_NODE: Fetcher;
  
  // Vectorize — Semantic Pattern Matching
  PATTERN_VECTORS: {
    query: (vector: number[], options?: { topK?: number }) => Promise<{ matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }> }>;
    insert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<void>;
    upsert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<void>;
  };
  
  // Environment Variables
  PHI: string;
  HEARTBEAT_MS: string;
  THRESHOLD: string;
  ORGANISM: string;
  EVOLUTION_STAGE: string;
  BIOME_REGIONS: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS — φ-Mathematics
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';
const LLM_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// Biome regions
const BIOME_REGIONS = ['France', 'UK', 'US', 'Ukraine', 'Netherlands'];

// Pattern types recognized by the organism
type PatternType = 
  | 'request'    // Incoming request patterns
  | 'error'      // Error patterns
  | 'probe'      // Probe/scan patterns
  | 'payload'    // Payload delivery patterns
  | 'benign'     // Legitimate traffic patterns
  | 'unknown';   // Unclassified patterns

interface BiomeSignal {
  type: PatternType;
  region: string;
  fingerprint: string;
  timestamp: number;
  metadata: Record<string, unknown>;
}

interface CacheDecision {
  action: 'cache_hit' | 'compute' | 'delegate' | 'block';
  confidence: number;
  reason: string;
  ttl?: number;
}

interface LearnedPattern {
  id: string;
  type: PatternType;
  fingerprint: string;
  occurrences: number;
  firstSeen: number;
  lastSeen: number;
  regions: string[];
  cachedResponse?: string;
  confidence: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function jsonResponse(data: unknown, status = 200, headers: Record<string, string> = {}): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    heartbeat_ms: HEARTBEAT_MS,
    organism: 'cache-cognition',
    evolution_stage: 'metabolic-cache',
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Cache-Cognition': 'active',
      'X-Phi': PHI.toString(),
      'X-Evolution': 'metabolic-cache',
      ...headers,
    },
  });
}

function corsResponse(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Biome-Region',
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT GENERATION — Identify unique patterns
// ═══════════════════════════════════════════════════════════════════════════════

async function generateFingerprint(request: Request): Promise<string> {
  const components = [
    request.method,
    new URL(request.url).pathname,
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    request.cf?.country || 'unknown',
  ];
  
  const data = components.join('|');
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

function detectRegion(request: Request): string {
  const country = (request.cf?.country as string) || 'unknown';
  const regionMap: Record<string, string> = {
    'FR': 'France',
    'GB': 'UK',
    'US': 'US',
    'UA': 'Ukraine',
    'NL': 'Netherlands',
  };
  return regionMap[country] || country;
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN CLASSIFICATION — Understand what the biome is doing
// ═══════════════════════════════════════════════════════════════════════════════

function classifyPattern(request: Request, fingerprint: string): PatternType {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // Probe patterns (scanners, bots)
  const probeIndicators = [
    '/wp-admin', '/admin', '/login', '/.env', '/.git',
    '/phpmyadmin', '/actuator', '/api/v1/pods', '/.well-known'
  ];
  if (probeIndicators.some(p => path.includes(p))) {
    return 'probe';
  }
  
  // Scanner user agents
  const scannerAgents = ['nmap', 'nikto', 'sqlmap', 'masscan', 'zgrab', 'gobuster'];
  if (scannerAgents.some(s => userAgent.includes(s))) {
    return 'probe';
  }
  
  // Error-inducing patterns
  if (path.includes('..') || path.includes('%00') || path.includes('\x00')) {
    return 'error';
  }
  
  // Payload patterns (POST with specific content types)
  if (request.method === 'POST') {
    const contentType = request.headers.get('content-type') || '';
    if (contentType.includes('application/x-www-form-urlencoded') ||
        contentType.includes('multipart/form-data')) {
      return 'payload';
    }
  }
  
  // Legitimate request patterns
  if (request.method === 'GET' && !probeIndicators.some(p => path.includes(p))) {
    return 'benign';
  }
  
  return 'request';
}

// ═══════════════════════════════════════════════════════════════════════════════
// INTELLIGENT CACHE DECISIONS — The core of cognition
// ═══════════════════════════════════════════════════════════════════════════════

async function makeIntelligentDecision(
  env: Env,
  request: Request,
  fingerprint: string,
  patternType: PatternType
): Promise<CacheDecision> {
  // Check pattern cache first (distributed memory)
  const cachedPattern = await env.PATTERN_CACHE.get(`pattern:${fingerprint}`, 'json') as LearnedPattern | null;
  
  if (cachedPattern) {
    // We've seen this before — use learned response
    if (cachedPattern.cachedResponse && cachedPattern.confidence >= THRESHOLD) {
      return {
        action: 'cache_hit',
        confidence: cachedPattern.confidence,
        reason: `Known pattern (seen ${cachedPattern.occurrences} times)`,
        ttl: Math.floor(HEARTBEAT_MS * PHI) // TTL based on φ-mathematics
      };
    }
  }
  
  // Block known probe patterns immediately
  if (patternType === 'probe' || patternType === 'error') {
    return {
      action: 'block',
      confidence: 0.95,
      reason: `Blocked ${patternType} pattern`
    };
  }
  
  // Check response cache for benign requests
  if (patternType === 'benign') {
    const cachedResponse = await env.RESPONSE_CACHE.get(`response:${fingerprint}`);
    if (cachedResponse) {
      return {
        action: 'cache_hit',
        confidence: 0.9,
        reason: 'Cached benign response',
        ttl: 3600 // 1 hour for benign traffic
      };
    }
  }
  
  // For new patterns, delegate to compute but learn
  return {
    action: patternType === 'payload' ? 'delegate' : 'compute',
    confidence: 0.5,
    reason: 'New pattern — learning',
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// PATTERN LEARNING — Building cognitive permanence
// ═══════════════════════════════════════════════════════════════════════════════

async function learnPattern(
  env: Env,
  signal: BiomeSignal,
  response?: Response
): Promise<void> {
  const patternKey = `pattern:${signal.fingerprint}`;
  
  // Get existing pattern or create new
  const existing = await env.PATTERN_CACHE.get(patternKey, 'json') as LearnedPattern | null;
  
  const pattern: LearnedPattern = existing || {
    id: signal.fingerprint,
    type: signal.type,
    fingerprint: signal.fingerprint,
    occurrences: 0,
    firstSeen: signal.timestamp,
    lastSeen: signal.timestamp,
    regions: [],
    confidence: 0.5
  };
  
  // Update pattern with new observation
  pattern.occurrences++;
  pattern.lastSeen = signal.timestamp;
  if (!pattern.regions.includes(signal.region)) {
    pattern.regions.push(signal.region);
  }
  
  // Increase confidence with each observation (up to threshold)
  pattern.confidence = Math.min(
    0.99,
    pattern.confidence + (1 - pattern.confidence) / PHI
  );
  
  // Cache the response if we have one and confidence is high enough
  if (response && pattern.confidence >= THRESHOLD && !pattern.cachedResponse) {
    try {
      const responseText = await response.clone().text();
      if (responseText.length < 10000) { // Only cache small responses
        pattern.cachedResponse = responseText;
      }
    } catch (_e) {
      // Response might not be cloneable
    }
  }
  
  // Store updated pattern
  await env.PATTERN_CACHE.put(patternKey, JSON.stringify(pattern), {
    expirationTtl: 86400 * 7 // 7 days
  });
  
  // Update biome memory for this region
  const biomeKey = `biome:${signal.region}:${signal.type}`;
  const biomeCount = parseInt(await env.BIOME_MEMORY.get(biomeKey) || '0') + 1;
  await env.BIOME_MEMORY.put(biomeKey, biomeCount.toString(), {
    expirationTtl: 86400 // 24 hours
  });
  
  // Queue pattern for deeper learning if it's interesting
  if (pattern.occurrences === 10 || pattern.occurrences === 100 || pattern.occurrences === 1000) {
    await env.PATTERN_QUEUE.send({
      type: 'pattern_milestone',
      pattern,
      milestone: pattern.occurrences
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// THIN ROUTER — Workers become routing decision nodes
// ═══════════════════════════════════════════════════════════════════════════════

async function routeRequest(
  env: Env,
  request: Request,
  decision: CacheDecision,
  signal: BiomeSignal
): Promise<Response> {
  switch (decision.action) {
    case 'cache_hit': {
      // Serve from cache — no compute cost
      const cached = await env.RESPONSE_CACHE.get(`response:${signal.fingerprint}`);
      if (cached) {
        return new Response(cached, {
          headers: {
            'Content-Type': 'application/json',
            'X-Cache': 'HIT',
            'X-Cache-Confidence': decision.confidence.toString(),
            'X-Pattern-Type': signal.type,
          }
        });
      }
      // Fallthrough to compute if cache miss
    }
    
    case 'compute': {
      // Route to API node for computation
      const response = await env.API_NODE.fetch(request.clone());
      
      // Cache the response for future
      if (response.ok) {
        const responseText = await response.clone().text();
        if (responseText.length < 10000) {
          await env.RESPONSE_CACHE.put(
            `response:${signal.fingerprint}`,
            responseText,
            { expirationTtl: decision.ttl || 3600 }
          );
        }
      }
      
      // Learn from this interaction
      await learnPattern(env, signal, response);
      
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Cache': 'MISS',
          'X-Cache-Confidence': decision.confidence.toString(),
          'X-Pattern-Type': signal.type,
        }
      });
    }
    
    case 'delegate': {
      // Route to gate node for security processing
      const response = await env.GATE_NODE.fetch(request.clone());
      
      // Learn from this interaction
      await learnPattern(env, signal, response);
      
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Cache': 'DELEGATED',
          'X-Delegated-To': 'gate-node',
          'X-Pattern-Type': signal.type,
        }
      });
    }
    
    case 'block': {
      // Block malicious traffic — learn the pattern
      await learnPattern(env, signal);
      
      return jsonResponse({
        blocked: true,
        reason: decision.reason,
        pattern_type: signal.type,
      }, 403, {
        'X-Cache': 'BLOCKED',
        'X-Block-Reason': decision.reason,
        'X-Pattern-Type': signal.type,
      });
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BIOME STATISTICS — Understanding the digital ecosystem
// ═══════════════════════════════════════════════════════════════════════════════

async function getBiomeStats(env: Env): Promise<Record<string, unknown>> {
  const stats: Record<string, Record<string, number>> = {};
  
  for (const region of BIOME_REGIONS) {
    stats[region] = {};
    for (const type of ['request', 'error', 'probe', 'payload', 'benign'] as PatternType[]) {
      const count = await env.BIOME_MEMORY.get(`biome:${region}:${type}`);
      stats[region][type] = parseInt(count || '0');
    }
  }
  
  return {
    regions: BIOME_REGIONS,
    stats,
    timestamp: Date.now(),
    phi_signature: PHI,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER — Entry point for all requests
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    
    // Handle CORS preflight
    if (request.method === 'OPTIONS') {
      return corsResponse();
    }
    
    // Health check endpoint
    if (url.pathname === '/health' || url.pathname === '/') {
      return jsonResponse({
        status: 'alive',
        evolution_stage: 'metabolic-cache',
        message: 'Cognition lives in the cache layer',
        capabilities: [
          'pattern_recognition',
          'intelligent_caching',
          'thin_routing',
          'edge_agents',
          'biome_learning'
        ]
      });
    }
    
    // Biome statistics endpoint
    if (url.pathname === '/biome/stats') {
      const stats = await getBiomeStats(env);
      return jsonResponse(stats);
    }
    
    // Pattern statistics endpoint
    if (url.pathname === '/patterns/stats') {
      const patterns = await env.PATTERN_CACHE.list({ limit: 100 });
      return jsonResponse({
        total_patterns: patterns.keys.length,
        patterns: patterns.keys.map(k => k.name),
      });
    }
    
    // Main intelligent routing logic
    const fingerprint = await generateFingerprint(request);
    const region = detectRegion(request);
    const patternType = classifyPattern(request, fingerprint);
    
    const signal: BiomeSignal = {
      type: patternType,
      region,
      fingerprint,
      timestamp: Date.now(),
      metadata: {
        method: request.method,
        path: url.pathname,
        country: request.cf?.country,
        city: request.cf?.city,
      }
    };
    
    // Make intelligent cache decision
    const decision = await makeIntelligentDecision(env, request, fingerprint, patternType);
    
    // Route based on decision
    const response = await routeRequest(env, request, decision, signal);
    
    return response;
  },

  // Scheduled handler — Pattern consolidation heartbeat
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    console.log('Cache cognition heartbeat:', event.cron);
    
    // Consolidate patterns every 5 minutes
    // This is where the organism "thinks" about what it has learned
    const patterns = await env.PATTERN_CACHE.list({ limit: 1000 });
    
    let totalPatterns = 0;
    let highConfidencePatterns = 0;
    
    for (const key of patterns.keys) {
      const pattern = await env.PATTERN_CACHE.get(key.name, 'json') as LearnedPattern | null;
      if (pattern) {
        totalPatterns++;
        if (pattern.confidence >= THRESHOLD) {
          highConfidencePatterns++;
        }
        
        // Decay patterns that haven't been seen recently
        const age = Date.now() - pattern.lastSeen;
        if (age > 86400000) { // More than 24 hours
          pattern.confidence *= (1 / PHI); // φ-decay
          if (pattern.confidence < 0.1) {
            // Pattern has decayed too much — forget it
            await env.PATTERN_CACHE.delete(key.name);
          } else {
            await env.PATTERN_CACHE.put(key.name, JSON.stringify(pattern));
          }
        }
      }
    }
    
    console.log(`Pattern consolidation complete: ${totalPatterns} total, ${highConfidencePatterns} high-confidence`);
  },

  // Queue handler — Deeper pattern learning
  async queue(batch: MessageBatch<{ type: string; pattern: LearnedPattern; milestone: number }>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      if (message.body.type === 'pattern_milestone') {
        const { pattern, milestone } = message.body;
        console.log(`Pattern milestone: ${pattern.fingerprint} reached ${milestone} occurrences`);
        
        // Could use AI here to analyze the pattern
        // For now, just log it
        message.ack();
      }
    }
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// DURABLE OBJECTS — Cognitive Permanence
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Pattern Recognition Engine — Learns and recognizes patterns over time
 */
export class PatternRecognitionEngine implements DurableObject {
  private state: DurableObjectState;
  private patterns: Map<string, LearnedPattern> = new Map();

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
    // Restore patterns from storage
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, LearnedPattern>>('patterns');
      if (stored) {
        this.patterns = stored;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/learn' && request.method === 'POST') {
      const pattern = await request.json() as LearnedPattern;
      this.patterns.set(pattern.fingerprint, pattern);
      await this.state.storage.put('patterns', this.patterns);
      return new Response(JSON.stringify({ learned: true, total: this.patterns.size }));
    }
    
    if (url.pathname === '/recognize' && request.method === 'POST') {
      const { fingerprint } = await request.json() as { fingerprint: string };
      const pattern = this.patterns.get(fingerprint);
      return new Response(JSON.stringify({ recognized: !!pattern, pattern }));
    }
    
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify({
        total_patterns: this.patterns.size,
        high_confidence: Array.from(this.patterns.values()).filter(p => p.confidence >= THRESHOLD).length,
      }));
    }
    
    return new Response('Pattern Recognition Engine', { status: 200 });
  }
}

/**
 * Edge Agent — Local cognition at the edge for a specific region
 */
export class EdgeAgent implements DurableObject {
  private state: DurableObjectState;
  private region: string = 'unknown';
  private localPatterns: Map<string, number> = new Map();

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      this.region = (await this.state.storage.get<string>('region')) || 'unknown';
      const stored = await this.state.storage.get<Map<string, number>>('localPatterns');
      if (stored) {
        this.localPatterns = stored;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/configure' && request.method === 'POST') {
      const { region } = await request.json() as { region: string };
      this.region = region;
      await this.state.storage.put('region', region);
      return new Response(JSON.stringify({ configured: true, region }));
    }
    
    if (url.pathname === '/observe' && request.method === 'POST') {
      const { fingerprint } = await request.json() as { fingerprint: string };
      const count = (this.localPatterns.get(fingerprint) || 0) + 1;
      this.localPatterns.set(fingerprint, count);
      await this.state.storage.put('localPatterns', this.localPatterns);
      return new Response(JSON.stringify({ observed: true, count }));
    }
    
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify({
        region: this.region,
        patterns_observed: this.localPatterns.size,
        total_observations: Array.from(this.localPatterns.values()).reduce((a, b) => a + b, 0),
      }));
    }
    
    return new Response(`Edge Agent: ${this.region}`, { status: 200 });
  }
}

/**
 * Response Generator — Caches and generates responses
 */
export class ResponseGenerator implements DurableObject {
  private state: DurableObjectState;
  private responseCache: Map<string, { response: string; timestamp: number }> = new Map();

  constructor(state: DurableObjectState, _env: Env) {
    this.state = state;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, { response: string; timestamp: number }>>('responseCache');
      if (stored) {
        this.responseCache = stored;
      }
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    
    if (url.pathname === '/cache' && request.method === 'POST') {
      const { key, response } = await request.json() as { key: string; response: string };
      this.responseCache.set(key, { response, timestamp: Date.now() });
      await this.state.storage.put('responseCache', this.responseCache);
      return new Response(JSON.stringify({ cached: true }));
    }
    
    if (url.pathname === '/get' && request.method === 'POST') {
      const { key } = await request.json() as { key: string };
      const cached = this.responseCache.get(key);
      return new Response(JSON.stringify({ found: !!cached, data: cached }));
    }
    
    if (url.pathname === '/stats') {
      return new Response(JSON.stringify({
        cached_responses: this.responseCache.size,
      }));
    }
    
    return new Response('Response Generator', { status: 200 });
  }
}

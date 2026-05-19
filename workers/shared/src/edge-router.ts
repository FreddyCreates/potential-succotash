/**
 * Edge Router — Thin Routing Middleware for Organism Evolution
 * 
 * EVOLUTION STEP: Transform Workers into thin routers + guardians
 * 
 * Instead of every Worker doing full computation:
 * 1. Check cache-cognition first (intelligent cache layer)
 * 2. Only compute if cache misses
 * 3. Feed learnings back to permanence layer
 * 
 * This reduces:
 * - Billed compute (cache hits avoid computation)
 * - Latency (cached responses are instant)
 * - Cognitive load (patterns are learned centrally)
 */

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS — φ-Mathematics
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface EdgeRouterConfig {
  workerName: string;
  cacheBinding?: Fetcher;         // Service binding to cache-cognition
  patternCache?: KVNamespace;     // Local pattern cache
  enableLearning?: boolean;       // Feed patterns back to permanence
  bypassPaths?: string[];         // Paths that skip cache
  guardianMode?: boolean;         // Act as security guardian
}

export interface RouteDecision {
  action: 'cache_hit' | 'compute' | 'delegate' | 'block' | 'bypass';
  confidence: number;
  reason: string;
  cacheKey?: string;
}

export interface BiomeSignal {
  type: 'request' | 'error' | 'probe' | 'payload' | 'benign' | 'unknown';
  region: string;
  fingerprint: string;
  timestamp: number;
  workerName: string;
  metadata: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// FINGERPRINT GENERATION
// ═══════════════════════════════════════════════════════════════════════════════

export async function generateFingerprint(request: Request): Promise<string> {
  const components = [
    request.method,
    new URL(request.url).pathname,
    request.headers.get('user-agent') || '',
    request.headers.get('accept-language') || '',
    (request.cf as { country?: string })?.country || 'unknown',
  ];
  
  const data = components.join('|');
  const encoder = new TextEncoder();
  const hashBuffer = await crypto.subtle.digest('SHA-256', encoder.encode(data));
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.slice(0, 16).map(b => b.toString(16).padStart(2, '0')).join('');
}

export function detectRegion(request: Request): string {
  const country = ((request.cf as { country?: string })?.country) || 'unknown';
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
// PATTERN CLASSIFICATION
// ═══════════════════════════════════════════════════════════════════════════════

export function classifyRequest(request: Request): BiomeSignal['type'] {
  const url = new URL(request.url);
  const path = url.pathname.toLowerCase();
  const userAgent = (request.headers.get('user-agent') || '').toLowerCase();
  
  // Probe patterns (scanners, bots)
  const probeIndicators = [
    '/wp-admin', '/admin', '/login', '/.env', '/.git',
    '/phpmyadmin', '/actuator', '/api/v1/pods', '/.well-known',
    '/xmlrpc.php', '/wp-login', '/administrator'
  ];
  if (probeIndicators.some(p => path.includes(p))) {
    return 'probe';
  }
  
  // Scanner user agents
  const scannerAgents = ['nmap', 'nikto', 'sqlmap', 'masscan', 'zgrab', 'gobuster', 'nuclei', 'dirbuster'];
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
// EDGE ROUTER MIDDLEWARE
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Creates a thin router middleware that wraps a Worker handler
 * 
 * @example
 * ```ts
 * const handler = createEdgeRouter({
 *   workerName: 'api-node',
 *   cacheBinding: env.CACHE_COGNITION,
 *   enableLearning: true,
 * });
 * 
 * export default {
 *   fetch: handler(async (request, env, ctx) => {
 *     // Original worker logic - only runs on cache miss
 *     return new Response('computed');
 *   })
 * };
 * ```
 */
export function createEdgeRouter<Env extends Record<string, unknown>>(config: EdgeRouterConfig) {
  return (
    handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ) => {
    return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
      const url = new URL(request.url);
      
      // Check bypass paths
      if (config.bypassPaths?.some(p => url.pathname.startsWith(p))) {
        return handler(request, env, ctx);
      }
      
      // Generate fingerprint for this request
      const fingerprint = await generateFingerprint(request);
      const region = detectRegion(request);
      const patternType = classifyRequest(request);
      
      // Create biome signal
      const signal: BiomeSignal = {
        type: patternType,
        region,
        fingerprint,
        timestamp: Date.now(),
        workerName: config.workerName,
        metadata: {
          method: request.method,
          path: url.pathname,
          country: (request.cf as { country?: string })?.country,
        }
      };
      
      // Guardian mode — block malicious traffic immediately
      if (config.guardianMode && (patternType === 'probe' || patternType === 'error')) {
        return new Response(JSON.stringify({
          blocked: true,
          reason: `Guardian blocked ${patternType} pattern`,
          phi: PHI,
          worker: config.workerName,
        }), {
          status: 403,
          headers: {
            'Content-Type': 'application/json',
            'X-Guardian': 'active',
            'X-Block-Reason': patternType,
            'X-Worker': config.workerName,
          }
        });
      }
      
      // Try cache first (if cache binding available)
      if (config.cacheBinding) {
        try {
          const cacheResponse = await config.cacheBinding.fetch(
            new Request(`http://cache-cognition/lookup`, {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ fingerprint, signal })
            })
          );
          
          if (cacheResponse.ok) {
            const cacheData = await cacheResponse.json() as { hit: boolean; response?: string };
            if (cacheData.hit && cacheData.response) {
              // Cache hit — return cached response without computing
              return new Response(cacheData.response, {
                headers: {
                  'Content-Type': 'application/json',
                  'X-Cache': 'HIT',
                  'X-Worker': config.workerName,
                  'X-Phi': PHI.toString(),
                }
              });
            }
          }
        } catch (_e) {
          // Cache unavailable — continue to compute
        }
      }
      
      // Local pattern cache check
      if (config.patternCache) {
        const cached = await config.patternCache.get(`response:${fingerprint}`);
        if (cached) {
          return new Response(cached, {
            headers: {
              'Content-Type': 'application/json',
              'X-Cache': 'LOCAL_HIT',
              'X-Worker': config.workerName,
            }
          });
        }
      }
      
      // Cache miss — compute the response
      const response = await handler(request, env, ctx);
      
      // Learn from this interaction (feed back to permanence)
      if (config.enableLearning && response.ok) {
        ctx.waitUntil(
          learnFromInteraction(config, signal, response.clone())
        );
      }
      
      // Add router headers to response
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Cache': 'MISS',
          'X-Worker': config.workerName,
          'X-Phi': PHI.toString(),
        }
      });
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// LEARNING — Feed patterns back to permanence layer
// ═══════════════════════════════════════════════════════════════════════════════

async function learnFromInteraction(
  config: EdgeRouterConfig,
  signal: BiomeSignal,
  response: Response
): Promise<void> {
  try {
    const responseText = await response.text();
    
    // Cache locally if we have a pattern cache
    if (config.patternCache && responseText.length < 10000) {
      await config.patternCache.put(
        `response:${signal.fingerprint}`,
        responseText,
        { expirationTtl: Math.floor(HEARTBEAT_MS * PHI) }
      );
    }
    
    // Report to central cache-cognition if available
    if (config.cacheBinding) {
      await config.cacheBinding.fetch(
        new Request(`http://cache-cognition/learn`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            signal,
            response: responseText.length < 10000 ? responseText : null,
          })
        })
      );
    }
  } catch (_e) {
    // Learning failed — not critical
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// UTILITY — Create standard organism responses
// ═══════════════════════════════════════════════════════════════════════════════

export function createOrganismResponse(
  data: unknown,
  workerName: string,
  status = 200,
  extraHeaders: Record<string, string> = {}
): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    heartbeat_ms: HEARTBEAT_MS,
    worker: workerName,
    evolution_stage: 'thin-router',
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Phi': PHI.toString(),
      'X-Worker': workerName,
      'X-Evolution': 'thin-router',
      ...extraHeaders,
    }
  });
}

export function createCorsResponse(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Biome-Region',
    }
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// GUARDIAN — Security protection layer
// ═══════════════════════════════════════════════════════════════════════════════

export interface GuardianConfig {
  workerName: string;
  blockProbes?: boolean;
  blockErrors?: boolean;
  rateLimit?: {
    requests: number;
    window: number;
  };
  allowedOrigins?: string[];
}

/**
 * Guardian middleware that protects Workers from malicious traffic
 */
export function createGuardian<Env extends Record<string, unknown>>(config: GuardianConfig) {
  return (
    handler: (request: Request, env: Env, ctx: ExecutionContext) => Promise<Response>
  ) => {
    return async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
      const patternType = classifyRequest(request);
      
      // Block probes
      if (config.blockProbes && patternType === 'probe') {
        return createOrganismResponse(
          { blocked: true, reason: 'Probe detected' },
          config.workerName,
          403,
          { 'X-Guardian': 'blocked-probe' }
        );
      }
      
      // Block error-inducing patterns
      if (config.blockErrors && patternType === 'error') {
        return createOrganismResponse(
          { blocked: true, reason: 'Malicious pattern detected' },
          config.workerName,
          403,
          { 'X-Guardian': 'blocked-error' }
        );
      }
      
      // Origin check
      if (config.allowedOrigins) {
        const origin = request.headers.get('origin');
        if (origin && !config.allowedOrigins.includes(origin)) {
          return createOrganismResponse(
            { blocked: true, reason: 'Origin not allowed' },
            config.workerName,
            403,
            { 'X-Guardian': 'blocked-origin' }
          );
        }
      }
      
      // Pass to handler
      const response = await handler(request, env, ctx);
      
      // Add guardian headers
      return new Response(response.body, {
        status: response.status,
        headers: {
          ...Object.fromEntries(response.headers),
          'X-Guardian': 'active',
          'X-Guardian-Pattern': patternType,
        }
      });
    };
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export const edgeRouter = {
  create: createEdgeRouter,
  guardian: createGuardian,
  fingerprint: generateFingerprint,
  classify: classifyRequest,
  region: detectRegion,
  response: createOrganismResponse,
  cors: createCorsResponse,
  PHI,
  HEARTBEAT_MS,
  THRESHOLD,
};

export default edgeRouter;

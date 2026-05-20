/**
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║                         GATE-NODE INTELLIGENT WORKER                          ║
 * ║                           Division: SENTINEL                                  ║
 * ║                     Code Name: Secure Entry Processing                        ║
 * ╠══════════════════════════════════════════════════════════════════════════════╣
 * ║  Sub-Intelligences:                                                          ║
 * ║    1. AUTH_GUARDIAN     — Authentication & Authorization                     ║
 * ║    2. CRYPTO_ENGINE     — Encryption & Decryption Services                   ║
 * ║    3. ROUTE_MASTER      — Intelligent Request Routing                        ║
 * ║    4. THREAT_DETECTOR   — Real-time Threat Analysis                          ║
 * ║    5. RATE_LIMITER      — Adaptive Rate Limiting                             ║
 * ║    6. IDENTITY_VERIFIER — Token & Session Validation                         ║
 * ║    7. TRAFFIC_ANALYZER  — Request Pattern Analysis                           ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */

// ─────────────────────────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// ─────────────────────────────────────────────────────────────────────────────
// Type Definitions
// ─────────────────────────────────────────────────────────────────────────────
interface Env {
  AI: {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  GATE_MEMORY: KVNamespace;
  IP_BLOCKLIST: KVNamespace;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  EVENT_QUEUE: Queue;
  ASSETS: R2Bucket;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
  ROLE: string;
}

interface AuthPayload {
  sub: string;
  iat: number;
  exp: number;
  role: string;
  permissions: string[];
}

interface ThreatAnalysis {
  score: number;
  level: 'safe' | 'low' | 'medium' | 'high' | 'critical';
  indicators: string[];
  recommendations: string[];
}

interface RateLimitEntry {
  count: number;
  windowStart: number;
  blocked: boolean;
}

interface RouteDecision {
  target: string;
  priority: number;
  metadata: Record<string, unknown>;
}

// ─────────────────────────────────────────────────────────────────────────────
// Response Helpers
// ─────────────────────────────────────────────────────────────────────────────
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Request-ID',
  'Access-Control-Max-Age': '86400',
};

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      ...corsHeaders,
    },
  });
}

function errorResponse(message: string, status = 500): Response {
  return jsonResponse({ error: message, timestamp: Date.now() }, status);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 1: AUTH_GUARDIAN
// ─────────────────────────────────────────────────────────────────────────────
async function generateToken(env: Env, userId: string, role: string, permissions: string[]): Promise<string> {
  const payload: AuthPayload = {
    sub: userId,
    iat: Math.floor(Date.now() / 1000),
    exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour
    role,
    permissions,
  };
  const token = btoa(JSON.stringify(payload));
  await env.GATE_MEMORY.put(`token:${token}`, JSON.stringify(payload), { expirationTtl: 3600 });
  return token;
}

async function validateToken(env: Env, token: string): Promise<AuthPayload | null> {
  const cached = await env.GATE_MEMORY.get(`token:${token}`);
  if (cached) {
    const payload = JSON.parse(cached) as AuthPayload;
    if (payload.exp > Math.floor(Date.now() / 1000)) {
      return payload;
    }
    await env.GATE_MEMORY.delete(`token:${token}`);
  }
  return null;
}

async function revokeToken(env: Env, token: string): Promise<boolean> {
  await env.GATE_MEMORY.delete(`token:${token}`);
  return true;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 2: CRYPTO_ENGINE
// ─────────────────────────────────────────────────────────────────────────────
async function encryptData(data: string): Promise<{ encrypted: string; iv: string }> {
  const encoder = new TextEncoder();
  const key = await crypto.subtle.generateKey({ name: 'AES-GCM', length: 256 }, true, ['encrypt', 'decrypt']) as CryptoKey;
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const encrypted = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, encoder.encode(data));
  const exportedKey = await crypto.subtle.exportKey('raw', key) as ArrayBuffer;
  return {
    encrypted: btoa(String.fromCharCode(...new Uint8Array(encrypted))) + '.' + btoa(String.fromCharCode(...new Uint8Array(exportedKey))),
    iv: btoa(String.fromCharCode(...iv)),
  };
}

async function decryptData(encryptedData: string, iv: string): Promise<string> {
  const [encPart, keyPart] = encryptedData.split('.');
  const encrypted = Uint8Array.from(atob(encPart), c => c.charCodeAt(0));
  const keyData = Uint8Array.from(atob(keyPart), c => c.charCodeAt(0));
  const ivData = Uint8Array.from(atob(iv), c => c.charCodeAt(0));
  const key = await crypto.subtle.importKey('raw', keyData, { name: 'AES-GCM' }, false, ['decrypt']);
  const decrypted = await crypto.subtle.decrypt({ name: 'AES-GCM', iv: ivData }, key, encrypted);
  return new TextDecoder().decode(decrypted);
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 3: ROUTE_MASTER
// ─────────────────────────────────────────────────────────────────────────────
async function determineRoute(_env: Env, path: string, method: string): Promise<RouteDecision> {
  const routeMap: Record<string, RouteDecision> = {
    '/api': { target: 'api-node', priority: 1, metadata: { type: 'api' } },
    '/workflows': { target: 'workflows-starter', priority: 2, metadata: { type: 'workflow' } },
    '/static': { target: 'assets', priority: 3, metadata: { type: 'static' } },
  };
  
  for (const [prefix, route] of Object.entries(routeMap)) {
    if (path.startsWith(prefix)) {
      return route;
    }
  }
  
  return { target: 'default', priority: 0, metadata: { path, method } };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 4: THREAT_DETECTOR
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeThreat(env: Env, request: Request): Promise<ThreatAnalysis> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || '';
  const path = new URL(request.url).pathname;
  
  const indicators: string[] = [];
  let score = 0;
  
  // Check IP blocklist
  const isBlocked = await env.IP_BLOCKLIST.get(ip);
  if (isBlocked) {
    indicators.push('IP in blocklist');
    score += 50;
  }
  
  // Check for suspicious patterns
  const suspiciousPatterns = [
    { pattern: /\.\.\//, weight: 20, desc: 'Path traversal attempt' },
    { pattern: /<script/i, weight: 30, desc: 'XSS attempt' },
    { pattern: /union\s+select/i, weight: 40, desc: 'SQL injection attempt' },
    { pattern: /\beval\b/i, weight: 25, desc: 'Code injection attempt' },
  ];
  
  const body = request.method !== 'GET' ? await request.clone().text() : '';
  const fullContent = `${path} ${userAgent} ${body}`;
  
  for (const { pattern, weight, desc } of suspiciousPatterns) {
    if (pattern.test(fullContent)) {
      indicators.push(desc);
      score += weight;
    }
  }
  
  // Determine threat level
  let level: ThreatAnalysis['level'];
  if (score >= 80) level = 'critical';
  else if (score >= 60) level = 'high';
  else if (score >= 40) level = 'medium';
  else if (score >= 20) level = 'low';
  else level = 'safe';
  
  const recommendations: string[] = [];
  if (level !== 'safe') {
    recommendations.push('Monitor request source');
    if (score >= 60) recommendations.push('Consider blocking IP');
    if (score >= 80) recommendations.push('Immediate investigation required');
  }
  
  // Log to D1 for audit
  try {
    await env.DB.prepare(
      'INSERT INTO security_logs (ip, path, threat_score, level, timestamp) VALUES (?, ?, ?, ?, ?)'
    ).bind(ip, path, score, level, Date.now()).run();
  } catch {
    // Table may not exist - continue without logging
  }
  
  return { score, level, indicators, recommendations };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 5: RATE_LIMITER
// ─────────────────────────────────────────────────────────────────────────────
async function checkRateLimit(env: Env, identifier: string, limit = 100, windowMs = 60000): Promise<{ allowed: boolean; remaining: number; resetIn: number }> {
  const key = `rate:${identifier}`;
  const now = Date.now();
  const cached = await env.GATE_MEMORY.get(key);
  
  let entry: RateLimitEntry = cached
    ? JSON.parse(cached)
    : { count: 0, windowStart: now, blocked: false };
  
  // Reset window if expired
  if (now - entry.windowStart > windowMs) {
    entry = { count: 0, windowStart: now, blocked: false };
  }
  
  entry.count++;
  const allowed = entry.count <= limit;
  entry.blocked = !allowed;
  
  await env.GATE_MEMORY.put(key, JSON.stringify(entry), { expirationTtl: Math.ceil(windowMs / 1000) });
  
  return {
    allowed,
    remaining: Math.max(0, limit - entry.count),
    resetIn: Math.max(0, windowMs - (now - entry.windowStart)),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 6: IDENTITY_VERIFIER
// ─────────────────────────────────────────────────────────────────────────────
async function verifyIdentity(env: Env, request: Request): Promise<{ valid: boolean; identity: AuthPayload | null; error?: string }> {
  const authHeader = request.headers.get('Authorization');
  if (!authHeader) {
    return { valid: false, identity: null, error: 'Missing Authorization header' };
  }
  
  const [type, token] = authHeader.split(' ');
  if (type !== 'Bearer' || !token) {
    return { valid: false, identity: null, error: 'Invalid Authorization format' };
  }
  
  const payload = await validateToken(env, token);
  if (!payload) {
    return { valid: false, identity: null, error: 'Invalid or expired token' };
  }
  
  return { valid: true, identity: payload };
}

async function createSession(env: Env, userId: string, metadata: Record<string, unknown>): Promise<string> {
  const sessionId = crypto.randomUUID();
  await env.GATE_MEMORY.put(`session:${sessionId}`, JSON.stringify({ userId, metadata, createdAt: Date.now() }), { expirationTtl: 86400 });
  return sessionId;
}

async function getSession(env: Env, sessionId: string): Promise<{ userId: string; metadata: Record<string, unknown> } | null> {
  const data = await env.GATE_MEMORY.get(`session:${sessionId}`);
  return data ? JSON.parse(data) : null;
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-Intelligence 7: TRAFFIC_ANALYZER
// ─────────────────────────────────────────────────────────────────────────────
async function analyzeTraffic(env: Env, request: Request): Promise<Record<string, unknown>> {
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const country = request.headers.get('CF-IPCountry') || 'unknown';
  const userAgent = request.headers.get('User-Agent') || '';
  const path = new URL(request.url).pathname;
  
  // Queue event for async processing
  await env.EVENT_QUEUE.send({
    type: 'traffic',
    ip,
    country,
    userAgent,
    path,
    method: request.method,
    timestamp: Date.now(),
  });
  
  return {
    ip,
    country,
    userAgent: userAgent.substring(0, 100),
    path,
    method: request.method,
    timestamp: Date.now(),
  };
}

// ─────────────────────────────────────────────────────────────────────────────
// AI-Powered Analysis
// ─────────────────────────────────────────────────────────────────────────────
async function aiThreatAnalysis(env: Env, context: string): Promise<string> {
  try {
    const response = await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: 'system', content: 'You are a security analyst. Analyze the request context and provide a brief threat assessment.' },
        { role: 'user', content: context },
      ],
    }) as { response?: string };
    return response?.response || 'Analysis unavailable';
  } catch {
    return 'AI analysis unavailable';
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Request Handler
// ─────────────────────────────────────────────────────────────────────────────
async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;
  const method = request.method;
  
  // Handle CORS preflight
  if (method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders });
  }
  
  // Rate limiting
  const ip = request.headers.get('CF-Connecting-IP') || 'unknown';
  const rateLimit = await checkRateLimit(env, ip);
  if (!rateLimit.allowed) {
    return errorResponse('Rate limit exceeded', 429);
  }
  
  // Route handlers
  try {
    // Health check
    if (path === '/health') {
      return jsonResponse({
        status: 'healthy',
        division: 'SENTINEL',
        worker: 'gate-node',
        organism: env.ORGANISM,
        role: env.ROLE,
        phi: PHI,
        heartbeat: HEARTBEAT_MS,
        timestamp: Date.now(),
      });
    }
    
    // Auth routes
    if (path.startsWith('/auth')) {
      if (path === '/auth/token' && method === 'POST') {
        const body = await request.json() as { userId: string; role: string; permissions: string[] };
        const token = await generateToken(env, body.userId, body.role, body.permissions || []);
        return jsonResponse({ token, expiresIn: 3600 });
      }
      if (path === '/auth/validate' && method === 'POST') {
        const { token } = await request.json() as { token: string };
        const payload = await validateToken(env, token);
        return payload ? jsonResponse({ valid: true, payload }) : jsonResponse({ valid: false }, 401);
      }
      if (path === '/auth/revoke' && method === 'POST') {
        const { token } = await request.json() as { token: string };
        await revokeToken(env, token);
        return jsonResponse({ revoked: true });
      }
      return errorResponse('Auth endpoint not found', 404);
    }
    
    // Encryption endpoints
    if (path === '/encrypt' && method === 'POST') {
      const { data } = await request.json() as { data: string };
      const result = await encryptData(data);
      return jsonResponse(result);
    }
    if (path === '/decrypt' && method === 'POST') {
      const { encrypted, iv } = await request.json() as { encrypted: string; iv: string };
      const decrypted = await decryptData(encrypted, iv);
      return jsonResponse({ decrypted });
    }
    
    // Routing endpoint
    if (path === '/route' && method === 'POST') {
      const { targetPath, targetMethod } = await request.json() as { targetPath: string; targetMethod: string };
      const decision = await determineRoute(env, targetPath, targetMethod);
      return jsonResponse(decision);
    }
    
    // Threat analysis
    if (path === '/threat/analyze' && method === 'POST') {
      const analysis = await analyzeThreat(env, request);
      const aiAnalysis = await aiThreatAnalysis(env, JSON.stringify(analysis));
      return jsonResponse({ ...analysis, aiAnalysis });
    }
    
    // Identity endpoints
    if (path.startsWith('/identity')) {
      if (path === '/identity/verify' && method === 'GET') {
        const result = await verifyIdentity(env, request);
        return result.valid ? jsonResponse(result) : jsonResponse(result, 401);
      }
      if (path === '/identity/session' && method === 'POST') {
        const { userId, metadata } = await request.json() as { userId: string; metadata: Record<string, unknown> };
        const sessionId = await createSession(env, userId, metadata || {});
        return jsonResponse({ sessionId });
      }
      if (path === '/identity/session' && method === 'GET') {
        const sessionId = url.searchParams.get('id');
        if (!sessionId) return errorResponse('Session ID required', 400);
        const session = await getSession(env, sessionId);
        return session ? jsonResponse(session) : errorResponse('Session not found', 404);
      }
      return errorResponse('Identity endpoint not found', 404);
    }
    
    // Rate limit status
    if (path === '/rate-limit/status' && method === 'GET') {
      const identifier = url.searchParams.get('id') || ip;
      const status = await checkRateLimit(env, identifier);
      return jsonResponse(status);
    }
    
    // Metrics endpoint
    if (path === '/metrics') {
      const traffic = await analyzeTraffic(env, request);
      return jsonResponse({
        traffic,
        rateLimit: { remaining: rateLimit.remaining, resetIn: rateLimit.resetIn },
        worker: 'gate-node',
        division: 'SENTINEL',
      });
    }
    
    return errorResponse('Endpoint not found', 404);
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return errorResponse(message, 500);
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Export
// ─────────────────────────────────────────────────────────────────────────────
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleRequest(request, env);
  },
};

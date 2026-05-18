/**
 * Nova Gate — Intelligent API Endpoint
 * Pages Function with AI, KV, and D1 bindings for stateful intelligence
 * 
 * Bindings (configure in Cloudflare Pages dashboard):
 * - AI: Workers AI for LLM inference
 * - MEMORY: KV namespace for persistent memory
 * - DB: D1 database for structured knowledge
 * - VECTORIZE: Vector index for semantic search (optional)
 */

interface Env {
  AI?: {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  MEMORY?: KVNamespace;
  DB?: D1Database;
  VECTORIZE?: {
    query: (vector: number[], options?: { topK?: number }) => Promise<{ matches: Array<{ id: string; score: number }> }>;
    insert: (vectors: Array<{ id: string; values: number[] }>) => Promise<void>;
  };
}

interface RequestContext {
  request: Request;
  env: Env;
  params: { path?: string[] };
  waitUntil: (promise: Promise<unknown>) => void;
}

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

// Coherent response wrapper
function coherentResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    heartbeat_ms: HEARTBEAT_MS,
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Nova-Gate': 'intelligent-api',
      'X-Phi-Constant': PHI.toString(),
    },
  });
}

// AI reasoning with memory context
async function intelligentReason(env: Env, prompt: string, context?: string): Promise<string> {
  if (!env.AI) {
    return `[AI binding not configured] Prompt: ${prompt}`;
  }

  const systemPrompt = `You are Nova, an intelligent assistant integrated into the Sonic Ninja Lab organism.
You have access to memory, databases, and can reason coherently.
${context ? `Context from memory:\n${context}` : ''}
Respond helpfully and concisely.`;

  try {
    const result = await env.AI.run('@cf/meta/llama-3.1-8b-instruct', {
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: prompt },
      ],
    }) as { response?: string };
    return result.response || 'No response generated';
  } catch (e) {
    return `AI inference error: ${e instanceof Error ? e.message : 'Unknown error'}`;
  }
}

// Memory operations
async function getMemory(env: Env, key: string): Promise<string | null> {
  if (!env.MEMORY) return null;
  return env.MEMORY.get(key);
}

async function setMemory(env: Env, key: string, value: string, ttl?: number): Promise<void> {
  if (!env.MEMORY) return;
  await env.MEMORY.put(key, value, ttl ? { expirationTtl: ttl } : undefined);
}

// Route handlers
async function handleHealth(env: Env): Promise<Response> {
  const bindings = {
    ai: !!env.AI,
    kv: !!env.MEMORY,
    d1: !!env.DB,
    vectorize: !!env.VECTORIZE,
  };
  const activeBindings = Object.values(bindings).filter(Boolean).length;
  
  return coherentResponse({
    status: 'alive',
    bindings,
    intelligence_level: activeBindings === 0 ? 'stateless' : activeBindings <= 2 ? 'basic' : 'intelligent',
    capabilities: Object.entries(bindings).filter(([, v]) => v).map(([k]) => k),
    organism: 'nova-gate',
    version: '1.0.0',
  });
}

async function handleChat(ctx: RequestContext): Promise<Response> {
  const { env, request } = ctx;
  
  if (request.method !== 'POST') {
    return coherentResponse({ error: 'POST required' }, 405);
  }

  let body: { message?: string; context_key?: string };
  try {
    body = await request.json();
  } catch {
    return coherentResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.message) {
    return coherentResponse({ error: 'message field required' }, 400);
  }

  // Fetch context from memory if key provided
  let context: string | undefined;
  if (body.context_key && env.MEMORY) {
    context = (await getMemory(env, body.context_key)) || undefined;
  }

  const response = await intelligentReason(env, body.message, context);

  // Store this interaction in memory for future context
  if (env.MEMORY) {
    const historyKey = `chat:${Date.now()}`;
    ctx.waitUntil(setMemory(env, historyKey, JSON.stringify({
      prompt: body.message,
      response,
      timestamp: new Date().toISOString(),
    }), 86400 * 7)); // 7 day TTL
  }

  return coherentResponse({
    message: response,
    model: '@cf/meta/llama-3.1-8b-instruct',
    has_context: !!context,
  });
}

async function handleMemory(ctx: RequestContext): Promise<Response> {
  const { env, request } = ctx;
  const url = new URL(request.url);
  const key = url.searchParams.get('key');

  if (!env.MEMORY) {
    return coherentResponse({ error: 'KV binding not configured' }, 503);
  }

  if (request.method === 'GET') {
    if (!key) {
      return coherentResponse({ error: 'key query param required' }, 400);
    }
    const value = await getMemory(env, key);
    return coherentResponse({ key, value, found: value !== null });
  }

  if (request.method === 'POST' || request.method === 'PUT') {
    let body: { key?: string; value?: string; ttl?: number };
    try {
      body = await request.json();
    } catch {
      return coherentResponse({ error: 'Invalid JSON body' }, 400);
    }

    if (!body.key || body.value === undefined) {
      return coherentResponse({ error: 'key and value fields required' }, 400);
    }

    await setMemory(env, body.key, body.value, body.ttl);
    return coherentResponse({ key: body.key, stored: true });
  }

  return coherentResponse({ error: 'Method not allowed' }, 405);
}

async function handleQuery(ctx: RequestContext): Promise<Response> {
  const { env, request } = ctx;

  if (!env.DB) {
    return coherentResponse({ error: 'D1 binding not configured' }, 503);
  }

  if (request.method !== 'POST') {
    return coherentResponse({ error: 'POST required' }, 405);
  }

  let body: { sql?: string; params?: unknown[] };
  try {
    body = await request.json();
  } catch {
    return coherentResponse({ error: 'Invalid JSON body' }, 400);
  }

  if (!body.sql) {
    return coherentResponse({ error: 'sql field required' }, 400);
  }

  // Security: only allow SELECT queries from this endpoint
  if (!body.sql.trim().toUpperCase().startsWith('SELECT')) {
    return coherentResponse({ error: 'Only SELECT queries allowed via API' }, 403);
  }

  try {
    const stmt = env.DB.prepare(body.sql);
    const result = body.params ? await stmt.bind(...body.params).all() : await stmt.all();
    return coherentResponse({ results: result.results, meta: result.meta });
  } catch (e) {
    return coherentResponse({ error: `Query error: ${e instanceof Error ? e.message : 'Unknown'}` }, 500);
  }
}

// Main request handler
export async function onRequest(ctx: RequestContext): Promise<Response> {
  const { request, params } = ctx;
  const path = params.path?.join('/') || '';

  // CORS preflight
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });
  }

  // Route to handlers
  switch (path) {
    case '':
    case 'health':
      return handleHealth(ctx.env);
    case 'chat':
      return handleChat(ctx);
    case 'memory':
      return handleMemory(ctx);
    case 'query':
      return handleQuery(ctx);
    default:
      return coherentResponse({
        error: 'Not found',
        available_endpoints: ['health', 'chat', 'memory', 'query'],
        docs: 'https://freddycreates.github.io/potential-succotash/',
      }, 404);
  }
}

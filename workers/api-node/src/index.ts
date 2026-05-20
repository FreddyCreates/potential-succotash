/**
 * Nova API Node — Intelligent Worker
 * 
 * This Worker is "alive" with multiple capabilities:
 * - AI: Can reason intelligently using LLMs
 * - KV: Has memory between requests
 * - D1: Has structured knowledge database
 * - Vectorize: Can do semantic search / RAG
 * - Queue: Can delegate tasks asynchronously
 * - R2: Can store/retrieve files
 * - Durable Objects: Stateful coordination
 * 
 * EVOLUTION: Now operates as a thin router when cache-cognition is available
 * - Checks cache layer first for known patterns
 * - Only computes on cache miss
 * - Feeds learnings back to permanence layer
 */

// Edge Router — Thin routing evolution
import { edgeRouter, permanence as permanenceLib } from '../../../shared/src';

export interface Env {
  // AI Binding — Reasoning capability
  AI: {
    run: (model: string, input: unknown) => Promise<unknown>;
  };
  
  // KV Namespace — Short-term memory
  MEMORY: KVNamespace;
  
  // D1 Database — Long-term structured knowledge
  DB: D1Database;
  
  // Vectorize — Semantic search / RAG
  VECTORIZE: {
    query: (vector: number[], options?: { topK?: number; filter?: Record<string, unknown> }) => Promise<{ matches: Array<{ id: string; score: number; metadata?: Record<string, unknown> }> }>;
    insert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<void>;
    upsert: (vectors: Array<{ id: string; values: number[]; metadata?: Record<string, unknown> }>) => Promise<void>;
    deleteByIds: (ids: string[]) => Promise<void>;
  };
  
  // Queue — Async task delegation
  TASK_QUEUE: Queue;
  
  // R2 — File storage
  STORAGE: R2Bucket;
  
  // Durable Object — Stateful coordination
  COORDINATOR: DurableObjectNamespace;
  
  // Cache Cognition Service (optional) — For thin routing evolution
  CACHE_COGNITION?: Fetcher;
  
  // Permanence KV (optional) — Local pattern learning
  PATTERN_CACHE?: KVNamespace;
  
  // Environment variables
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
  ENVIRONMENT: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    heartbeat_ms: HEARTBEAT_MS,
    organism: 'nova-api-node',
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Nova-Worker': 'intelligent',
      'X-Phi': PHI.toString(),
    },
  });
}

function corsHeaders(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// AI CAPABILITIES
// ═══════════════════════════════════════════════════════════════════════════════

async function reason(env: Env, prompt: string, context?: string): Promise<string> {
  const systemPrompt = `You are Nova, an intelligent API node in the Sonic Ninja Lab organism.
You have access to memory (KV), knowledge (D1), semantic search (Vectorize), async tasks (Queue), and file storage (R2).
${context ? `\nContext:\n${context}` : ''}
Respond helpfully and concisely in JSON format when appropriate.`;

  const result = await env.AI.run(DEFAULT_MODEL, {
    messages: [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt },
    ],
  }) as { response?: string };
  
  return result.response || 'No response';
}

async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const result = await env.AI.run(EMBEDDING_MODEL, {
    text: [text],
  }) as { data?: number[][] };
  
  return result.data?.[0] || [];
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY OPERATIONS (KV)
// ═══════════════════════════════════════════════════════════════════════════════

async function remember(env: Env, key: string, value: string, ttlSeconds?: number): Promise<void> {
  await env.MEMORY.put(key, value, ttlSeconds ? { expirationTtl: ttlSeconds } : undefined);
}

async function recall(env: Env, key: string): Promise<string | null> {
  return env.MEMORY.get(key);
}

async function forget(env: Env, key: string): Promise<void> {
  await env.MEMORY.delete(key);
}

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE OPERATIONS (D1)
// ═══════════════════════════════════════════════════════════════════════════════

async function initializeKnowledge(env: Env): Promise<void> {
  await env.DB.exec(`
    CREATE TABLE IF NOT EXISTS facts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      subject TEXT NOT NULL,
      predicate TEXT NOT NULL,
      object TEXT NOT NULL,
      confidence REAL DEFAULT 1.0,
      source TEXT,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX IF NOT EXISTS idx_subject ON facts(subject);
    CREATE INDEX IF NOT EXISTS idx_predicate ON facts(predicate);
    
    CREATE TABLE IF NOT EXISTS interactions (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id TEXT,
      prompt TEXT NOT NULL,
      response TEXT NOT NULL,
      model TEXT,
      tokens_used INTEGER,
      created_at TEXT DEFAULT CURRENT_TIMESTAMP
    );
  `);
}

async function learnFact(env: Env, subject: string, predicate: string, object: string, confidence = 1.0, source?: string): Promise<void> {
  await env.DB.prepare(
    'INSERT INTO facts (subject, predicate, object, confidence, source) VALUES (?, ?, ?, ?, ?)'
  ).bind(subject, predicate, object, confidence, source || null).run();
}

async function queryFacts(env: Env, subject?: string, predicate?: string): Promise<unknown[]> {
  let sql = 'SELECT * FROM facts WHERE 1=1';
  const params: string[] = [];
  
  if (subject) {
    sql += ' AND subject = ?';
    params.push(subject);
  }
  if (predicate) {
    sql += ' AND predicate = ?';
    params.push(predicate);
  }
  
  sql += ' ORDER BY confidence DESC, created_at DESC LIMIT 100';
  
  const stmt = env.DB.prepare(sql);
  const result = params.length > 0 ? await stmt.bind(...params).all() : await stmt.all();
  return result.results;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SEMANTIC SEARCH (Vectorize)
// ═══════════════════════════════════════════════════════════════════════════════

async function indexForSearch(env: Env, id: string, text: string, metadata?: Record<string, unknown>): Promise<void> {
  const embedding = await generateEmbedding(env, text);
  if (embedding.length > 0) {
    await env.VECTORIZE.upsert([{ id, values: embedding, metadata }]);
  }
}

async function semanticSearch(env: Env, query: string, topK = 10): Promise<Array<{ id: string; score: number; metadata?: Record<string, unknown> }>> {
  const queryEmbedding = await generateEmbedding(env, query);
  if (queryEmbedding.length === 0) return [];
  
  const result = await env.VECTORIZE.query(queryEmbedding, { topK });
  return result.matches;
}

// ═══════════════════════════════════════════════════════════════════════════════
// ASYNC TASK DELEGATION (Queue)
// ═══════════════════════════════════════════════════════════════════════════════

interface Task {
  type: 'index' | 'learn' | 'analyze' | 'cleanup';
  payload: Record<string, unknown>;
  priority?: number;
  created_at: string;
}

async function delegateTask(env: Env, task: Task): Promise<void> {
  await env.TASK_QUEUE.send(task);
}

async function processTaskBatch(env: Env, batch: MessageBatch<Task>): Promise<void> {
  for (const message of batch.messages) {
    const task = message.body;
    
    try {
      switch (task.type) {
        case 'index':
          if (task.payload.id && task.payload.text) {
            await indexForSearch(env, task.payload.id as string, task.payload.text as string, task.payload.metadata as Record<string, unknown>);
          }
          break;
        case 'learn':
          if (task.payload.subject && task.payload.predicate && task.payload.object) {
            await learnFact(env, task.payload.subject as string, task.payload.predicate as string, task.payload.object as string);
          }
          break;
        case 'analyze':
          // Analyze content and extract facts
          if (task.payload.content) {
            const analysis = await reason(env, `Extract key facts from this content as JSON array of {subject, predicate, object}: ${task.payload.content}`);
            await remember(env, `analysis:${Date.now()}`, analysis, 86400);
          }
          break;
        case 'cleanup':
          // Cleanup old data
          await env.DB.prepare('DELETE FROM interactions WHERE created_at < datetime("now", "-30 days")').run();
          break;
      }
      message.ack();
    } catch (e) {
      console.error('Task processing error:', e);
      message.retry();
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// FILE STORAGE (R2)
// ═══════════════════════════════════════════════════════════════════════════════

async function storeFile(env: Env, key: string, data: ArrayBuffer | string, metadata?: Record<string, string>): Promise<void> {
  await env.STORAGE.put(key, data, { customMetadata: metadata });
}

async function retrieveFile(env: Env, key: string): Promise<R2ObjectBody | null> {
  return env.STORAGE.get(key);
}

async function deleteFile(env: Env, key: string): Promise<void> {
  await env.STORAGE.delete(key);
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST HANDLERS
// ═══════════════════════════════════════════════════════════════════════════════

async function handleRequest(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') {
    return corsHeaders();
  }

  try {
    // Health check
    if (path === '/' || path === '/health') {
      return jsonResponse({
        status: 'alive',
        intelligence: 'fully-bound',
        capabilities: ['ai', 'memory', 'knowledge', 'search', 'tasks', 'storage', 'coordination'],
        bindings: {
          ai: true,
          kv: true,
          d1: true,
          vectorize: true,
          queue: true,
          r2: true,
          durable_object: true,
        },
      });
    }

    // Chat / Reasoning endpoint
    if (path === '/chat' && request.method === 'POST') {
      const body = await request.json() as { message?: string; context_key?: string };
      if (!body.message) {
        return jsonResponse({ error: 'message required' }, 400);
      }

      // Fetch context from memory
      let context: string | undefined;
      if (body.context_key) {
        context = (await recall(env, body.context_key)) || undefined;
      }

      // Perform semantic search for relevant knowledge
      const searchResults = await semanticSearch(env, body.message, 3);
      if (searchResults.length > 0) {
        const searchContext = searchResults.map(r => `[${r.id}]: score ${r.score.toFixed(3)}`).join('\n');
        context = context ? `${context}\n\nRelevant knowledge:\n${searchContext}` : `Relevant knowledge:\n${searchContext}`;
      }

      const response = await reason(env, body.message, context);

      // Log interaction
      ctx.waitUntil(env.DB.prepare(
        'INSERT INTO interactions (prompt, response, model) VALUES (?, ?, ?)'
      ).bind(body.message, response, DEFAULT_MODEL).run());

      return jsonResponse({ message: response, model: DEFAULT_MODEL, has_context: !!context });
    }

    // Memory endpoints
    if (path === '/memory') {
      if (request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) return jsonResponse({ error: 'key required' }, 400);
        const value = await recall(env, key);
        return jsonResponse({ key, value, found: value !== null });
      }
      if (request.method === 'POST') {
        const body = await request.json() as { key?: string; value?: string; ttl?: number };
        if (!body.key || body.value === undefined) return jsonResponse({ error: 'key and value required' }, 400);
        await remember(env, body.key, body.value, body.ttl);
        return jsonResponse({ stored: true, key: body.key });
      }
      if (request.method === 'DELETE') {
        const key = url.searchParams.get('key');
        if (!key) return jsonResponse({ error: 'key required' }, 400);
        await forget(env, key);
        return jsonResponse({ deleted: true, key });
      }
    }

    // Knowledge endpoints
    if (path === '/knowledge') {
      if (request.method === 'GET') {
        const subject = url.searchParams.get('subject') || undefined;
        const predicate = url.searchParams.get('predicate') || undefined;
        const facts = await queryFacts(env, subject, predicate);
        return jsonResponse({ facts });
      }
      if (request.method === 'POST') {
        const body = await request.json() as { subject?: string; predicate?: string; object?: string; confidence?: number; source?: string };
        if (!body.subject || !body.predicate || !body.object) {
          return jsonResponse({ error: 'subject, predicate, object required' }, 400);
        }
        await learnFact(env, body.subject, body.predicate, body.object, body.confidence, body.source);
        return jsonResponse({ learned: true });
      }
    }

    // Search endpoint
    if (path === '/search' && request.method === 'POST') {
      const body = await request.json() as { query?: string; topK?: number };
      if (!body.query) return jsonResponse({ error: 'query required' }, 400);
      const results = await semanticSearch(env, body.query, body.topK || 10);
      return jsonResponse({ results });
    }

    // Index endpoint (for adding content to semantic search)
    if (path === '/index' && request.method === 'POST') {
      const body = await request.json() as { id?: string; text?: string; metadata?: Record<string, unknown>; async?: boolean };
      if (!body.id || !body.text) return jsonResponse({ error: 'id and text required' }, 400);
      
      if (body.async) {
        await delegateTask(env, { type: 'index', payload: body, created_at: new Date().toISOString() });
        return jsonResponse({ queued: true, id: body.id });
      }
      
      await indexForSearch(env, body.id, body.text, body.metadata);
      return jsonResponse({ indexed: true, id: body.id });
    }

    // Task delegation endpoint
    if (path === '/task' && request.method === 'POST') {
      const body = await request.json() as Task;
      if (!body.type || !body.payload) return jsonResponse({ error: 'type and payload required' }, 400);
      body.created_at = new Date().toISOString();
      await delegateTask(env, body);
      return jsonResponse({ delegated: true, type: body.type });
    }

    // File storage endpoints
    if (path.startsWith('/files/')) {
      const key = path.replace('/files/', '');
      if (!key) return jsonResponse({ error: 'file key required' }, 400);

      if (request.method === 'GET') {
        const file = await retrieveFile(env, key);
        if (!file) return jsonResponse({ error: 'file not found' }, 404);
        return new Response(file.body, {
          headers: {
            'Content-Type': file.httpMetadata?.contentType || 'application/octet-stream',
            'X-Custom-Metadata': JSON.stringify(file.customMetadata || {}),
          },
        });
      }
      if (request.method === 'PUT') {
        const data = await request.arrayBuffer();
        await storeFile(env, key, data);
        return jsonResponse({ stored: true, key });
      }
      if (request.method === 'DELETE') {
        await deleteFile(env, key);
        return jsonResponse({ deleted: true, key });
      }
    }

    // Initialize database
    if (path === '/init' && request.method === 'POST') {
      await initializeKnowledge(env);
      return jsonResponse({ initialized: true });
    }

    return jsonResponse({
      error: 'Not found',
      endpoints: ['/health', '/chat', '/memory', '/knowledge', '/search', '/index', '/task', '/files/*', '/init'],
    }, 404);
  } catch (e) {
    console.error('Request error:', e);
    return jsonResponse({ error: e instanceof Error ? e.message : 'Internal error' }, 500);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRON HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

async function handleScheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
  // Periodic cleanup task
  ctx.waitUntil(delegateTask(env, { type: 'cleanup', payload: {}, created_at: new Date().toISOString() }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// COORDINATOR DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

export class CoordinatorObject implements DurableObject {
  state: DurableObjectState;
  env: Env;
  sessions: Map<string, WebSocket>;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.sessions = new Map();
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket upgrade for real-time coordination
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();
      const sessionId = crypto.randomUUID();
      this.sessions.set(sessionId, server);

      server.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data as string);
        // Broadcast to all other sessions
        for (const [id, ws] of this.sessions) {
          if (id !== sessionId && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({ from: sessionId, ...data }));
          }
        }
      });

      server.addEventListener('close', () => {
        this.sessions.delete(sessionId);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // State operations
    if (url.pathname === '/state') {
      if (request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) return jsonResponse({ error: 'key required' }, 400);
        const value = await this.state.storage.get(key);
        return jsonResponse({ key, value });
      }
      if (request.method === 'PUT') {
        const body = await request.json() as { key?: string; value?: unknown };
        if (!body.key) return jsonResponse({ error: 'key required' }, 400);
        await this.state.storage.put(body.key, body.value);
        return jsonResponse({ stored: true });
      }
    }

    return jsonResponse({ error: 'Unknown coordinator operation' }, 404);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS — With Thin Router Evolution
// ═══════════════════════════════════════════════════════════════════════════════

// Create the edge router wrapper
const thinRouter = edgeRouter.create<Env>({
  workerName: 'nova-api-node',
  enableLearning: true,
  guardianMode: true,  // Block probes and malicious patterns
  bypassPaths: ['/health', '/'],  // Health checks always compute
});

// Wrap the original handler with thin routing capabilities
const evolvedHandler = thinRouter(handleRequest);

export default {
  // Use evolved handler when cache-cognition is available, otherwise use original
  fetch: async (request: Request, env: Env, ctx: ExecutionContext): Promise<Response> => {
    // If we have cache binding and pattern cache, use thin router evolution
    if (env.CACHE_COGNITION || env.PATTERN_CACHE) {
      return evolvedHandler(request, env, ctx);
    }
    // Otherwise, use original handler (backward compatible)
    return handleRequest(request, env, ctx);
  },
  scheduled: handleScheduled,
  queue: processTaskBatch,
};

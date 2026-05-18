/**
 * KNOWLEDGE-REALM — Knowledge Repository
 * Division Code Name: SAGE
 * The memory and learning center of the organism
 *
 * Sub-Intelligences:
 * 1. RAG_ENGINE — Retrieval Augmented Generation
 * 2. MEMORY_KEEPER — Short and long-term memory
 * 3. KNOWLEDGE_SYNTHESIZER — Combines knowledge sources
 * 4. LEARNING_MODULE — Continuous learning from interactions
 * 5. ONTOLOGY_MANAGER — Knowledge structure and relationships
 * 6. EMBEDDING_GENERATOR — Vector embeddings for semantic search
 * 7. CONTEXT_BUILDER — Builds rich context for queries
 * 8. FACT_VALIDATOR — Validates and verifies facts
 */

export interface Env {
  AI: Ai;
  KNOWLEDGE_CACHE: KVNamespace;
  SESSION_STORE: KVNamespace;
  DB: D1Database;
  VECTORIZE: VectorizeIndex;
  INDEX_QUEUE: Queue;
  DOCUMENTS: R2Bucket;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
  ROLE: string;
}

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';
const EMBEDDING_MODEL = '@cf/baai/bge-base-en-v1.5';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface KnowledgeEntry {
  id: string;
  content: string;
  type: 'fact' | 'concept' | 'procedure' | 'reference';
  source: string;
  confidence: number;
  tags: string[];
  createdAt: string;
  updatedAt: string;
  embedding?: number[];
}

interface MemoryEntry {
  id: string;
  key: string;
  value: unknown;
  type: 'short-term' | 'long-term' | 'working';
  ttl?: number;
  createdAt: string;
  accessCount: number;
  lastAccessed: string;
}

interface SynthesisRequest {
  query: string;
  sources: string[];
  maxTokens?: number;
}

interface RAGResult {
  answer: string;
  sources: { id: string; content: string; score: number }[];
  confidence: number;
}

interface OntologyNode {
  id: string;
  label: string;
  type: string;
  properties: Record<string, unknown>;
  relationships: { target: string; type: string }[];
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    heartbeat_ms: HEARTBEAT_MS,
    organism: 'knowledge-realm',
    division: 'SAGE',
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Division': 'SAGE',
      'X-Knowledge-Realm': 'active',
    },
  });
}

function corsHeaders(): Response {
  return new Response(null, {
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Division',
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: EMBEDDING_GENERATOR
// ═══════════════════════════════════════════════════════════════════════════════

async function generateEmbedding(env: Env, text: string): Promise<number[]> {
  const result = await env.AI.run(EMBEDDING_MODEL, { text: [text] }) as { data: number[][] };
  return result.data[0];
}

async function generateEmbeddings(env: Env, texts: string[]): Promise<number[][]> {
  const result = await env.AI.run(EMBEDDING_MODEL, { text: texts }) as { data: number[][] };
  return result.data;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: RAG_ENGINE
// ═══════════════════════════════════════════════════════════════════════════════

async function ragQuery(env: Env, query: string, topK = 5): Promise<RAGResult> {
  const queryEmbedding = await generateEmbedding(env, query);
  const vectorResults = await env.VECTORIZE.query(queryEmbedding, { topK, returnMetadata: 'all' });
  
  const sources = vectorResults.matches.map(match => ({
    id: match.id,
    content: (match.metadata?.content as string) || '',
    score: match.score,
  }));

  const context = sources.map(s => s.content).join('\n\n');
  const prompt = `Based on the following context, answer the question. If the answer cannot be found in the context, say so.

Context:
${context}

Question: ${query}

Answer:`;

  const aiResult = await env.AI.run(DEFAULT_MODEL, {
    prompt,
    max_tokens: 512,
  }) as { response: string };

  return {
    answer: aiResult.response,
    sources,
    confidence: sources.length > 0 ? sources[0].score : 0,
  };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: MEMORY_KEEPER
// ═══════════════════════════════════════════════════════════════════════════════

async function storeMemory(env: Env, key: string, value: unknown, type: MemoryEntry['type'], ttl?: number): Promise<MemoryEntry> {
  const entry: MemoryEntry = {
    id: crypto.randomUUID(),
    key,
    value,
    type,
    ttl,
    createdAt: new Date().toISOString(),
    accessCount: 0,
    lastAccessed: new Date().toISOString(),
  };
  
  const options: KVNamespacePutOptions = ttl ? { expirationTtl: ttl } : {};
  await env.KNOWLEDGE_CACHE.put(`memory:${key}`, JSON.stringify(entry), options);
  return entry;
}

async function recallMemory(env: Env, key: string): Promise<MemoryEntry | null> {
  const data = await env.KNOWLEDGE_CACHE.get(`memory:${key}`);
  if (!data) return null;
  
  const entry = JSON.parse(data) as MemoryEntry;
  entry.accessCount++;
  entry.lastAccessed = new Date().toISOString();
  await env.KNOWLEDGE_CACHE.put(`memory:${key}`, JSON.stringify(entry));
  return entry;
}

async function forgetMemory(env: Env, key: string): Promise<boolean> {
  await env.KNOWLEDGE_CACHE.delete(`memory:${key}`);
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: KNOWLEDGE_SYNTHESIZER
// ═══════════════════════════════════════════════════════════════════════════════

async function synthesizeKnowledge(env: Env, request: SynthesisRequest): Promise<string> {
  const sourceContents: string[] = [];
  for (const sourceId of request.sources) {
    const cached = await env.KNOWLEDGE_CACHE.get(`knowledge:${sourceId}`);
    if (cached) {
      const entry = JSON.parse(cached) as KnowledgeEntry;
      sourceContents.push(entry.content);
    }
  }

  const prompt = `Synthesize the following knowledge sources into a coherent response for the query: "${request.query}"

Sources:
${sourceContents.map((c, i) => `[${i + 1}] ${c}`).join('\n\n')}

Synthesized Response:`;

  const result = await env.AI.run(DEFAULT_MODEL, {
    prompt,
    max_tokens: request.maxTokens || 1024,
  }) as { response: string };

  return result.response;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: LEARNING_MODULE
// ═══════════════════════════════════════════════════════════════════════════════

async function learn(env: Env, content: string, source: string, tags: string[]): Promise<KnowledgeEntry> {
  const id = crypto.randomUUID();
  const embedding = await generateEmbedding(env, content);
  
  const entry: KnowledgeEntry = {
    id,
    content,
    type: 'fact',
    source,
    confidence: 1.0,
    tags,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  await env.KNOWLEDGE_CACHE.put(`knowledge:${id}`, JSON.stringify(entry));
  await env.VECTORIZE.upsert([{ id, values: embedding, metadata: { content, source, tags: tags.join(',') } }]);
  
  await env.INDEX_QUEUE.send({
    type: 'knowledge_indexed',
    id,
    timestamp: new Date().toISOString(),
  });

  return entry;
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: CONTEXT_BUILDER
// ═══════════════════════════════════════════════════════════════════════════════

async function buildContext(env: Env, query: string, sessionId?: string): Promise<{ context: string; sources: string[] }> {
  const queryEmbedding = await generateEmbedding(env, query);
  const vectorResults = await env.VECTORIZE.query(queryEmbedding, { topK: 10, returnMetadata: 'all' });
  
  const sources = vectorResults.matches.map(m => m.id);
  let context = vectorResults.matches.map(m => (m.metadata?.content as string) || '').join('\n\n');

  if (sessionId) {
    const sessionData = await env.SESSION_STORE.get(`session:${sessionId}`);
    if (sessionData) {
      context = `Previous context:\n${sessionData}\n\nRelevant knowledge:\n${context}`;
    }
  }

  return { context, sources };
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: FACT_VALIDATOR
// ═══════════════════════════════════════════════════════════════════════════════

async function validateFact(env: Env, fact: string): Promise<{ valid: boolean; confidence: number; reasoning: string }> {
  const prompt = `Analyze the following statement for factual accuracy. Consider logical consistency, common knowledge, and potential contradictions.

Statement: "${fact}"

Respond in JSON format:
{
  "valid": true/false,
  "confidence": 0.0-1.0,
  "reasoning": "explanation"
}`;

  const result = await env.AI.run(DEFAULT_MODEL, { prompt, max_tokens: 256 }) as { response: string };
  
  try {
    return JSON.parse(result.response);
  } catch {
    return { valid: false, confidence: 0, reasoning: 'Unable to parse validation result' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SUB-INTELLIGENCE: ONTOLOGY_MANAGER
// ═══════════════════════════════════════════════════════════════════════════════

async function getOntologyNode(env: Env, nodeId: string): Promise<OntologyNode | null> {
  const data = await env.KNOWLEDGE_CACHE.get(`ontology:${nodeId}`);
  return data ? JSON.parse(data) : null;
}

async function createOntologyNode(env: Env, node: Omit<OntologyNode, 'id'>): Promise<OntologyNode> {
  const fullNode: OntologyNode = { id: crypto.randomUUID(), ...node };
  await env.KNOWLEDGE_CACHE.put(`ontology:${fullNode.id}`, JSON.stringify(fullNode));
  return fullNode;
}

async function linkOntologyNodes(env: Env, sourceId: string, targetId: string, relationType: string): Promise<boolean> {
  const source = await getOntologyNode(env, sourceId);
  if (!source) return false;
  
  source.relationships.push({ target: targetId, type: relationType });
  await env.KNOWLEDGE_CACHE.put(`ontology:${sourceId}`, JSON.stringify(source));
  return true;
}

// ═══════════════════════════════════════════════════════════════════════════════
// KNOWLEDGE STORAGE (D1)
// ═══════════════════════════════════════════════════════════════════════════════

async function storeKnowledgeD1(env: Env, entry: KnowledgeEntry): Promise<void> {
  await env.DB.prepare(
    `INSERT OR REPLACE INTO knowledge (id, content, type, source, confidence, tags, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`
  ).bind(
    entry.id, entry.content, entry.type, entry.source, 
    entry.confidence, entry.tags.join(','), entry.createdAt, entry.updatedAt
  ).run();
}

async function queryKnowledgeD1(env: Env, type?: string, limit = 100): Promise<KnowledgeEntry[]> {
  const query = type 
    ? env.DB.prepare('SELECT * FROM knowledge WHERE type = ? LIMIT ?').bind(type, limit)
    : env.DB.prepare('SELECT * FROM knowledge LIMIT ?').bind(limit);
  
  const result = await query.all();
  return (result.results || []).map(row => ({
    id: row.id as string,
    content: row.content as string,
    type: row.type as KnowledgeEntry['type'],
    source: row.source as string,
    confidence: row.confidence as number,
    tags: (row.tags as string).split(','),
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  }));
}

// ═══════════════════════════════════════════════════════════════════════════════
// DOCUMENT STORAGE (R2)
// ═══════════════════════════════════════════════════════════════════════════════

async function storeDocument(env: Env, key: string, content: string | ArrayBuffer, metadata?: Record<string, string>): Promise<void> {
  await env.DOCUMENTS.put(key, content, { customMetadata: metadata });
}

async function retrieveDocument(env: Env, key: string): Promise<{ content: ArrayBuffer; metadata?: Record<string, string> } | null> {
  const object = await env.DOCUMENTS.get(key);
  if (!object) return null;
  return { content: await object.arrayBuffer(), metadata: object.customMetadata };
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN WORKER
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    if (request.method === 'OPTIONS') return corsHeaders();

    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Health check
      if (path === '/health' || path === '/') {
        return jsonResponse({
          status: 'healthy',
          division: 'SAGE',
          subIntelligences: [
            'RAG_ENGINE', 'MEMORY_KEEPER', 'KNOWLEDGE_SYNTHESIZER', 
            'LEARNING_MODULE', 'ONTOLOGY_MANAGER', 'EMBEDDING_GENERATOR',
            'CONTEXT_BUILDER', 'FACT_VALIDATOR'
          ],
          phi: PHI,
          heartbeat_ms: HEARTBEAT_MS,
        });
      }

      // Knowledge Store
      if (path === '/knowledge/store' && request.method === 'POST') {
        const body = await request.json() as { content: string; type?: KnowledgeEntry['type']; source?: string; tags?: string[] };
        const entry = await learn(env, body.content, body.source || 'user', body.tags || []);
        await storeKnowledgeD1(env, entry);
        return jsonResponse({ stored: true, entry });
      }

      // Knowledge Query (RAG)
      if (path === '/knowledge/query' && request.method === 'POST') {
        const body = await request.json() as { query: string; topK?: number };
        const result = await ragQuery(env, body.query, body.topK);
        return jsonResponse(result);
      }

      // Knowledge Synthesize
      if (path === '/knowledge/synthesize' && request.method === 'POST') {
        const body = await request.json() as SynthesisRequest;
        const synthesis = await synthesizeKnowledge(env, body);
        return jsonResponse({ synthesis });
      }

      // Memory Store
      if (path === '/memory/store' && request.method === 'POST') {
        const body = await request.json() as { key: string; value: unknown; type?: MemoryEntry['type']; ttl?: number };
        const entry = await storeMemory(env, body.key, body.value, body.type || 'short-term', body.ttl);
        return jsonResponse({ stored: true, entry });
      }

      // Memory Recall
      if (path === '/memory/recall' && request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) return jsonResponse({ error: 'key required' }, 400);
        const entry = await recallMemory(env, key);
        return entry ? jsonResponse(entry) : jsonResponse({ error: 'Memory not found' }, 404);
      }

      // Memory Forget
      if (path === '/memory/forget' && request.method === 'DELETE') {
        const key = url.searchParams.get('key');
        if (!key) return jsonResponse({ error: 'key required' }, 400);
        await forgetMemory(env, key);
        return jsonResponse({ forgotten: true, key });
      }

      // Learn
      if (path === '/learn' && request.method === 'POST') {
        const body = await request.json() as { content: string; source?: string; tags?: string[] };
        const entry = await learn(env, body.content, body.source || 'learning', body.tags || []);
        return jsonResponse({ learned: true, entry });
      }

      // Context Build
      if (path === '/context/build' && request.method === 'POST') {
        const body = await request.json() as { query: string; sessionId?: string };
        const result = await buildContext(env, body.query, body.sessionId);
        return jsonResponse(result);
      }

      // Embedding Generate
      if (path === '/embedding/generate' && request.method === 'POST') {
        const body = await request.json() as { text: string | string[] };
        const texts = Array.isArray(body.text) ? body.text : [body.text];
        const embeddings = await generateEmbeddings(env, texts);
        return jsonResponse({ embeddings, dimensions: embeddings[0]?.length || 0 });
      }

      // Facts Validate
      if (path === '/facts/validate' && request.method === 'POST') {
        const body = await request.json() as { fact: string };
        const result = await validateFact(env, body.fact);
        return jsonResponse(result);
      }

      // Ontology routes
      if (path.startsWith('/ontology/')) {
        const subPath = path.replace('/ontology/', '');

        if (subPath === 'node' && request.method === 'POST') {
          const body = await request.json() as Omit<OntologyNode, 'id'>;
          const node = await createOntologyNode(env, body);
          return jsonResponse({ created: true, node });
        }

        if (subPath === 'node' && request.method === 'GET') {
          const nodeId = url.searchParams.get('id');
          if (!nodeId) return jsonResponse({ error: 'id required' }, 400);
          const node = await getOntologyNode(env, nodeId);
          return node ? jsonResponse(node) : jsonResponse({ error: 'Node not found' }, 404);
        }

        if (subPath === 'link' && request.method === 'POST') {
          const body = await request.json() as { sourceId: string; targetId: string; relationType: string };
          const linked = await linkOntologyNodes(env, body.sourceId, body.targetId, body.relationType);
          return jsonResponse({ linked });
        }

        return jsonResponse({ error: 'Unknown ontology operation' }, 404);
      }

      // Document routes
      if (path === '/documents/store' && request.method === 'POST') {
        const body = await request.json() as { key: string; content: string; metadata?: Record<string, string> };
        await storeDocument(env, body.key, body.content, body.metadata);
        return jsonResponse({ stored: true, key: body.key });
      }

      if (path === '/documents/retrieve' && request.method === 'GET') {
        const key = url.searchParams.get('key');
        if (!key) return jsonResponse({ error: 'key required' }, 400);
        const doc = await retrieveDocument(env, key);
        return doc ? jsonResponse({ key, hasContent: true, metadata: doc.metadata }) : jsonResponse({ error: 'Document not found' }, 404);
      }

      return jsonResponse({ error: 'Not found', path }, 404);

    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unknown error';
      return jsonResponse({ error: message }, 500);
    }
  },

  async queue(batch: MessageBatch, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const data = message.body as Record<string, unknown>;
      console.log(`[SAGE] Processing queue message: ${data.type}`);
      
      if (data.type === 'index_knowledge' && data.content) {
        await learn(env, data.content as string, data.source as string || 'queue', (data.tags as string[]) || []);
      }
      
      message.ack();
    }
  },
};

/**
 * HTTP Services Worker — Comprehensive REST API Mesh
 *
 * Each domain service exposes a bounded HTTP API:
 * - /auth        → Identity, sessions, token lifecycle
 * - /search      → Query, indexing, suggestions, facets
 * - /messaging   → Inboxes, threads, attachments
 * - /storage     → Objects, metadata, downloads
 * - /scheduler   → Jobs, reschedules, cancellations, history
 * - /audit       → Event recording, exports, compliance checks
 * - /config      → Versioned configuration namespaces
 * - /permissions → Roles, policies, grants, checks
 * - /workflows   → Definitions and workflow runs
 * - /cache       → Edge cache state and warmups
 * - /metrics     → Measurements, aggregates, alerts
 * - /webhooks    → Registrations, deliveries, retries, logs
 * - /templates   → Versioned templates and rendering
 * - /secrets     → Secret storage, rotation, audit trails
 * - /federation  → Peer sync, proposals, federation votes
 * - /governance  → Proposals, quorum, enactment history
 */

export interface Env {
  SERVICE_KV: KVNamespace;
  DB: D1Database;
  EVENTS_QUEUE: Queue;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
}

interface RESTResponse {
  status: 'success' | 'error';
  data?: unknown;
  error?: { code: number; message: string; details?: unknown };
  meta?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
}

type JsonObject = Record<string, unknown>;

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

function success(data: unknown, meta: Record<string, unknown> = {}): Response {
  const body: RESTResponse = {
    status: 'success',
    data,
    meta: { timestamp: Date.now(), phi: PHI, heartbeat: HEARTBEAT_MS, ...meta },
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function created(data: unknown): Response {
  const body: RESTResponse = {
    status: 'success',
    data,
    meta: { timestamp: Date.now(), phi: PHI },
  };
  return new Response(JSON.stringify(body), {
    status: 201,
    headers: { 'Content-Type': 'application/json' },
  });
}

function error(code: number, message: string, details?: unknown): Response {
  const body: RESTResponse = {
    status: 'error',
    error: { code, message, details },
  };
  return new Response(JSON.stringify(body), {
    status: code,
    headers: { 'Content-Type': 'application/json' },
  });
}

function paginated(data: unknown[], page: number, limit: number, total: number): Response {
  const body = {
    status: 'success',
    data,
    pagination: {
      page,
      limit,
      total,
      pages: Math.ceil(total / limit),
      hasNext: page * limit < total,
      hasPrev: page > 1,
    },
    meta: { timestamp: Date.now(), phi: PHI },
  };
  return new Response(JSON.stringify(body), {
    status: 200,
    headers: { 'Content-Type': 'application/json' },
  });
}

function splitPath(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function normalize(value: string): string {
  return value.trim().toLowerCase();
}

function getString(body: JsonObject, key: string): string | null {
  const value = body[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : null;
}

function getOptionalString(body: JsonObject, key: string): string | undefined {
  const value = body[key];
  return typeof value === 'string' && value.trim().length > 0 ? value.trim() : undefined;
}

function getStringArray(value: unknown): string[] {
  return Array.isArray(value) ? value.filter((entry): entry is string => typeof entry === 'string' && entry.trim().length > 0).map((entry) => entry.trim()) : [];
}

function getObjectArray(value: unknown): JsonObject[] {
  return Array.isArray(value) ? value.filter((entry): entry is JsonObject => typeof entry === 'object' && entry !== null && !Array.isArray(entry)) : [];
}

function getNumber(value: string | null, fallback: number, min = 1, max = 100): number {
  const parsed = value ? Number(value) : fallback;
  if (!Number.isFinite(parsed)) return fallback;
  return Math.min(max, Math.max(min, Math.floor(parsed)));
}

function required(body: JsonObject, keys: string[]): string[] {
  return keys.filter((key) => getString(body, key) === null);
}

async function readBody(request: Request): Promise<JsonObject | Response> {
  const text = await request.text();
  if (!text) return {};
  try {
    const parsed = JSON.parse(text) as unknown;
    if (typeof parsed === 'object' && parsed !== null && !Array.isArray(parsed)) {
      return parsed as JsonObject;
    }
    return error(400, 'Request body must be a JSON object');
  } catch {
    return error(400, 'Invalid JSON body');
  }
}

async function readRecord(env: Env, key: string): Promise<JsonObject | null> {
  const data = await env.SERVICE_KV.get(key, 'json');
  if (!data || typeof data !== 'object' || Array.isArray(data)) return null;
  return data as JsonObject;
}

async function writeRecord(env: Env, key: string, value: JsonObject): Promise<void> {
  await env.SERVICE_KV.put(key, JSON.stringify(value));
}

async function listRecords(env: Env, prefix: string): Promise<JsonObject[]> {
  const list = await env.SERVICE_KV.list({ prefix, limit: 1000 });
  const items = await Promise.all(list.keys.map((entry) => readRecord(env, entry.name)));
  return items.filter((item): item is JsonObject => item !== null);
}

async function deleteRecord(env: Env, key: string): Promise<void> {
  await env.SERVICE_KV.delete(key);
}

async function emit(env: Env, type: string, payload: JsonObject): Promise<void> {
  await env.EVENTS_QUEUE.send({
    type,
    organism: env.ORGANISM || 'http-services',
    emittedAt: Date.now(),
    payload,
  });
}

async function audit(env: Env, service: string, action: string, details: JsonObject): Promise<void> {
  const entry = {
    id: crypto.randomUUID(),
    service,
    action,
    details,
    recordedAt: Date.now(),
  };
  await writeRecord(env, `audit:entry:${entry.id}`, entry);
}

function paginateItems<T>(items: T[], page: number, limit: number): T[] {
  const start = (page - 1) * limit;
  return items.slice(start, start + limit);
}

function maskSecret(value: string): string {
  if (value.length <= 4) return '*'.repeat(value.length);
  return `${'*'.repeat(Math.max(4, value.length - 4))}${value.slice(-4)}`;
}

function renderTemplate(content: string, variables: JsonObject): string {
  return content.replace(/{{\s*([a-zA-Z0-9_.-]+)\s*}}/g, (_, key: string) => {
    const value = variables[key];
    return typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean' ? String(value) : '';
  });
}

function scoreDocument(query: string, document: JsonObject): number {
  const haystack = [document.title, document.content, ...(getStringArray(document.tags))]
    .filter((part): part is string => typeof part === 'string')
    .join(' ')
    .toLowerCase();
  if (!haystack.includes(query)) return 0;
  return haystack.split(query).length - 1;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    try {
      if (path === '/health') {
        return success({
          service: 'http-services',
          status: 'healthy',
          uptime: Date.now(),
          phi: Number(env.PHI || PHI),
          heartbeat: Number(env.HEARTBEAT_MS || HEARTBEAT_MS),
          organism: env.ORGANISM || 'http-services',
          bindings: ['SERVICE_KV', 'DB', 'EVENTS_QUEUE'],
        });
      }

      if (path === '/services') {
        return success({
          services: [
            { name: 'auth', path: '/auth', methods: ['GET', 'POST', 'DELETE'] },
            { name: 'search', path: '/search', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'messaging', path: '/messaging', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'storage', path: '/storage', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'scheduler', path: '/scheduler', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'audit', path: '/audit', methods: ['GET', 'POST'] },
            { name: 'config', path: '/config', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
            { name: 'permissions', path: '/permissions', methods: ['GET', 'POST', 'DELETE'] },
            { name: 'workflows', path: '/workflows', methods: ['GET', 'POST'] },
            { name: 'cache', path: '/cache', methods: ['GET', 'POST', 'DELETE'] },
            { name: 'metrics', path: '/metrics', methods: ['GET', 'POST'] },
            { name: 'webhooks', path: '/webhooks', methods: ['GET', 'POST', 'DELETE'] },
            { name: 'templates', path: '/templates', methods: ['GET', 'POST', 'PUT'] },
            { name: 'secrets', path: '/secrets', methods: ['GET', 'POST', 'DELETE'] },
            { name: 'federation', path: '/federation', methods: ['GET', 'POST'] },
            { name: 'governance', path: '/governance', methods: ['GET', 'POST'] },
          ],
        });
      }

      if (path.startsWith('/auth')) return handleAuth(method, path, request, env);
      if (path.startsWith('/search')) return handleSearch(method, path, request, env, url);
      if (path.startsWith('/messaging')) return handleMessaging(method, path, request, env, url);
      if (path.startsWith('/storage')) return handleStorage(method, path, request, env, url);
      if (path.startsWith('/scheduler')) return handleScheduler(method, path, request, env, url);
      if (path.startsWith('/audit')) return handleAudit(method, path, request, env, url);
      if (path.startsWith('/config')) return handleConfig(method, path, request, env, url);
      if (path.startsWith('/permissions')) return handlePermissions(method, path, request, env, url);
      if (path.startsWith('/workflows')) return handleWorkflows(method, path, request, env, url);
      if (path.startsWith('/cache')) return handleCache(method, path, request, env, url);
      if (path.startsWith('/metrics')) return handleMetrics(method, path, request, env, url);
      if (path.startsWith('/webhooks')) return handleWebhooks(method, path, request, env, url);
      if (path.startsWith('/templates')) return handleTemplates(method, path, request, env, url);
      if (path.startsWith('/secrets')) return handleSecrets(method, path, request, env, url);
      if (path.startsWith('/federation')) return handleFederation(method, path, request, env, url);
      if (path.startsWith('/governance')) return handleGovernance(method, path, request, env, url);

      return error(404, 'Endpoint not found', { path, availableServices: '/services' });
    } catch (cause) {
      return error(500, 'Unhandled service error', {
        path,
        message: cause instanceof Error ? cause.message : 'unknown error',
      });
    }
  },
};

async function handleAuth(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const sessionId = segments[2] || '';

  if (method === 'POST' && action === 'register') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['email', 'password', 'name']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const email = normalize(getString(body, 'email') as string);
    const existingId = await env.SERVICE_KV.get(`auth:user-index:${email}`);
    if (existingId) return error(409, 'User already exists', { email });
    const userId = crypto.randomUUID();
    const newSessionId = crypto.randomUUID();
    const session = {
      id: newSessionId,
      userId,
      accessToken: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
      status: 'active',
      createdAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    };
    const user = { id: userId, email, name: getString(body, 'name'), password: getString(body, 'password'), createdAt: Date.now() };
    await writeRecord(env, `auth:user:${userId}`, user);
    await env.SERVICE_KV.put(`auth:user-index:${email}`, userId);
    await writeRecord(env, `auth:session:${newSessionId}`, session);
    await env.SERVICE_KV.put(`auth:refresh:${session.refreshToken}`, newSessionId);
    await emit(env, 'auth.registered', { userId, email, sessionId: newSessionId });
    await audit(env, 'auth', 'register', { userId, email });
    return created({ user: { id: userId, email, name: user.name }, session });
  }

  if (method === 'POST' && action === 'login') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['email', 'password']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const email = normalize(getString(body, 'email') as string);
    const userId = await env.SERVICE_KV.get(`auth:user-index:${email}`);
    if (!userId) return error(404, 'Account not found', { email });
    const user = await readRecord(env, `auth:user:${userId}`);
    if (!user || user.password !== getString(body, 'password')) return error(401, 'Invalid credentials');
    const newSessionId = crypto.randomUUID();
    const session = {
      id: newSessionId,
      userId,
      accessToken: crypto.randomUUID(),
      refreshToken: crypto.randomUUID(),
      status: 'active',
      createdAt: Date.now(),
      lastSeenAt: Date.now(),
      expiresAt: Date.now() + 1000 * 60 * 60,
    };
    await writeRecord(env, `auth:session:${newSessionId}`, session);
    await env.SERVICE_KV.put(`auth:refresh:${session.refreshToken}`, newSessionId);
    await emit(env, 'auth.logged_in', { userId, sessionId: newSessionId });
    return success({ session, user: { id: userId, email, name: user.name } });
  }

  if (method === 'POST' && action === 'refresh') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const refreshToken = getString(body, 'refreshToken');
    if (!refreshToken) return error(400, 'refreshToken is required');
    const existingSessionId = await env.SERVICE_KV.get(`auth:refresh:${refreshToken}`);
    if (!existingSessionId) return error(404, 'Refresh token not found');
    const session = await readRecord(env, `auth:session:${existingSessionId}`);
    if (!session || session.status !== 'active') return error(401, 'Session is not active');
    const nextSession = { ...session, accessToken: crypto.randomUUID(), refreshedAt: Date.now(), expiresAt: Date.now() + 1000 * 60 * 60 };
    await writeRecord(env, `auth:session:${existingSessionId}`, nextSession);
    await emit(env, 'auth.refreshed', { sessionId: existingSessionId, userId: String(session.userId) });
    return success(nextSession);
  }

  if (method === 'POST' && action === 'logout') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetSessionId = getString(body, 'sessionId') || (await env.SERVICE_KV.get(`auth:refresh:${getString(body, 'refreshToken') || ''}`)) || '';
    if (!targetSessionId) return error(400, 'sessionId or refreshToken is required');
    const session = await readRecord(env, `auth:session:${targetSessionId}`);
    if (!session) return error(404, 'Session not found');
    const revoked = { ...session, status: 'revoked', revokedAt: Date.now() };
    await writeRecord(env, `auth:session:${targetSessionId}`, revoked);
    if (typeof session.refreshToken === 'string') await deleteRecord(env, `auth:refresh:${session.refreshToken}`);
    await audit(env, 'auth', 'logout', { sessionId: targetSessionId, userId: String(session.userId) });
    return success({ loggedOut: true, session: revoked });
  }

  if (method === 'GET' && action === 'sessions') {
    const userId = request.headers.get('x-user-id') || new URL(request.url).searchParams.get('userId') || '';
    const sessions = await listRecords(env, 'auth:session:');
    const filtered = userId ? sessions.filter((item) => item.userId === userId) : sessions;
    return success({ sessions: filtered, count: filtered.length });
  }

  if (method === 'DELETE' && action === 'sessions' && sessionId) {
    const session = await readRecord(env, `auth:session:${sessionId}`);
    if (!session) return error(404, 'Session not found');
    await deleteRecord(env, `auth:session:${sessionId}`);
    if (typeof session.refreshToken === 'string') await deleteRecord(env, `auth:refresh:${session.refreshToken}`);
    return success({ deleted: true, sessionId });
  }

  return error(405, 'Method not allowed', { service: 'auth' });
}

async function handleSearch(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || 'query';
  const documentId = segments[2] || '';

  if (method === 'POST' && action === 'index') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['title', 'content']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const document = {
      id: crypto.randomUUID(),
      title: getString(body, 'title'),
      content: getString(body, 'content'),
      type: getOptionalString(body, 'type') || 'document',
      tags: getStringArray(body.tags),
      createdAt: Date.now(),
      indexedAt: Date.now(),
    };
    await writeRecord(env, `search:index:${document.id}`, document);
    await emit(env, 'search.indexed', { documentId: document.id, type: String(document.type) });
    return created(document);
  }

  if (method === 'PUT' && action === 'documents' && documentId) {
    const existing = await readRecord(env, `search:index:${documentId}`);
    if (!existing) return error(404, 'Document not found');
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const updated = { ...existing, ...body, tags: body.tags ? getStringArray(body.tags) : existing.tags, updatedAt: Date.now() };
    await writeRecord(env, `search:index:${documentId}`, updated);
    return success(updated);
  }

  if (method === 'GET' && action === 'query') {
    const query = normalize(url.searchParams.get('q') || '');
    if (!query) return error(400, 'Query parameter q is required');
    const limit = getNumber(url.searchParams.get('limit'), 10, 1, 50);
    const documents = await listRecords(env, 'search:index:');
    const matches = documents
      .map((document) => ({ ...document, score: scoreDocument(query, document) }))
      .filter((document) => Number(document.score) > 0)
      .sort((a, b) => Number(b.score) - Number(a.score))
      .slice(0, limit);
    return success({ query, results: matches, count: matches.length });
  }

  if (method === 'GET' && action === 'suggest') {
    const prefix = normalize(url.searchParams.get('q') || '');
    const documents = await listRecords(env, 'search:index:');
    const suggestions = documents
      .flatMap((document) => [document.title, ...getStringArray(document.tags)])
      .filter((entry): entry is string => typeof entry === 'string' && entry.toLowerCase().startsWith(prefix))
      .slice(0, 10);
    return success({ suggestions: [...new Set(suggestions)] });
  }

  if (method === 'GET' && action === 'facets') {
    const field = url.searchParams.get('field') || 'type';
    const documents = await listRecords(env, 'search:index:');
    const facets: Record<string, number> = {};
    for (const document of documents) {
      if (field === 'tags') {
        for (const tag of getStringArray(document.tags)) facets[tag] = (facets[tag] || 0) + 1;
      } else if (typeof document[field] === 'string') {
        const value = String(document[field]);
        facets[value] = (facets[value] || 0) + 1;
      }
    }
    return success({ field, facets });
  }

  if (method === 'GET' && action === 'documents' && documentId) {
    const document = await readRecord(env, `search:index:${documentId}`);
    return document ? success(document) : error(404, 'Document not found');
  }

  if (method === 'DELETE' && action === 'documents' && documentId) {
    await deleteRecord(env, `search:index:${documentId}`);
    return success({ deleted: true, documentId });
  }

  return error(405, 'Method not allowed', { service: 'search' });
}

async function handleMessaging(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const resourceId = segments[2] || '';

  if (method === 'POST' && action === 'send') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['senderId', 'recipientId', 'body']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const threadId = getOptionalString(body, 'threadId') || crypto.randomUUID();
    const message = {
      id: crypto.randomUUID(),
      threadId,
      senderId: getString(body, 'senderId'),
      recipientId: getString(body, 'recipientId'),
      subject: getOptionalString(body, 'subject') || '(no subject)',
      body: getString(body, 'body'),
      attachments: getStringArray(body.attachments),
      status: 'delivered',
      createdAt: Date.now(),
    };
    await writeRecord(env, `messaging:message:${message.id}`, message);
    await writeRecord(env, `messaging:thread:${threadId}`, { id: threadId, participants: [message.senderId, message.recipientId], updatedAt: Date.now() });
    await emit(env, 'messaging.sent', { messageId: message.id, threadId, recipientId: String(message.recipientId) });
    return created(message);
  }

  if (method === 'POST' && action === 'attachments') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['messageId', 'filename', 'contentType']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const attachment = {
      id: crypto.randomUUID(),
      messageId: getString(body, 'messageId'),
      filename: getString(body, 'filename'),
      contentType: getString(body, 'contentType'),
      url: getOptionalString(body, 'url') || `https://attachments.local/${crypto.randomUUID()}`,
      size: Number(body.size || 0),
      createdAt: Date.now(),
    };
    await writeRecord(env, `messaging:attachment:${attachment.id}`, attachment);
    return created(attachment);
  }

  if (method === 'GET' && action === 'inbox') {
    const recipientId = url.searchParams.get('recipientId') || request.headers.get('x-recipient-id') || '';
    if (!recipientId) return error(400, 'recipientId is required');
    const messages = await listRecords(env, 'messaging:message:');
    const inbox = messages.filter((message) => message.recipientId === recipientId);
    return success({ recipientId, messages: inbox, count: inbox.length });
  }

  if (method === 'GET' && action === 'threads' && resourceId) {
    const messages = await listRecords(env, 'messaging:message:');
    const thread = messages.filter((message) => message.threadId === resourceId);
    return success({ threadId: resourceId, messages: thread, count: thread.length });
  }

  if (method === 'GET' && action === 'messages' && resourceId) {
    const message = await readRecord(env, `messaging:message:${resourceId}`);
    return message ? success(message) : error(404, 'Message not found');
  }

  if (method === 'PUT' && action === 'messages' && resourceId) {
    const message = await readRecord(env, `messaging:message:${resourceId}`);
    if (!message) return error(404, 'Message not found');
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const updated = { ...message, ...body, updatedAt: Date.now() };
    await writeRecord(env, `messaging:message:${resourceId}`, updated);
    return success(updated);
  }

  if (method === 'DELETE' && action === 'messages' && resourceId) {
    await deleteRecord(env, `messaging:message:${resourceId}`);
    return success({ deleted: true, messageId: resourceId });
  }

  return error(405, 'Method not allowed', { service: 'messaging' });
}

async function handleStorage(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const objectId = segments[2] || '';

  if (method === 'POST' && action === 'upload') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['name', 'content']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const id = crypto.randomUUID();
    const metadata = {
      id,
      name: getString(body, 'name'),
      contentType: getOptionalString(body, 'contentType') || 'application/octet-stream',
      size: String(getString(body, 'content') || '').length,
      namespace: getOptionalString(body, 'namespace') || 'default',
      createdAt: Date.now(),
      checksum: String(String(getString(body, 'content') || '').length * HEARTBEAT_MS),
    };
    await writeRecord(env, `storage:meta:${id}`, metadata);
    await env.SERVICE_KV.put(`storage:blob:${id}`, getString(body, 'content') as string);
    await emit(env, 'storage.uploaded', { objectId: id, name: String(metadata.name) });
    return created(metadata);
  }

  if (method === 'GET' && action === 'list') {
    const prefix = url.searchParams.get('prefix') || '';
    const objects = await listRecords(env, 'storage:meta:');
    const filtered = prefix ? objects.filter((entry) => String(entry.name || '').startsWith(prefix)) : objects;
    return success({ objects: filtered, count: filtered.length });
  }

  if (method === 'GET' && action === 'download' && objectId) {
    const metadata = await readRecord(env, `storage:meta:${objectId}`);
    const content = await env.SERVICE_KV.get(`storage:blob:${objectId}`);
    if (!metadata || content === null) return error(404, 'Object not found');
    return success({ metadata, content });
  }

  if (method === 'GET' && action === 'metadata' && objectId) {
    const metadata = await readRecord(env, `storage:meta:${objectId}`);
    return metadata ? success(metadata) : error(404, 'Object metadata not found');
  }

  if (method === 'PUT' && action === 'metadata' && objectId) {
    const metadata = await readRecord(env, `storage:meta:${objectId}`);
    if (!metadata) return error(404, 'Object metadata not found');
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const updated = { ...metadata, ...body, updatedAt: Date.now() };
    await writeRecord(env, `storage:meta:${objectId}`, updated);
    return success(updated);
  }

  if (method === 'DELETE' && action === 'objects' && objectId) {
    await deleteRecord(env, `storage:meta:${objectId}`);
    await deleteRecord(env, `storage:blob:${objectId}`);
    return success({ deleted: true, objectId });
  }

  return error(405, 'Method not allowed', { service: 'storage' });
}

async function handleScheduler(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || 'jobs';
  const jobId = segments[2] || '';

  if (method === 'POST' && action === 'jobs') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['name', 'runAt']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const job = {
      id: crypto.randomUUID(),
      name: getString(body, 'name'),
      taskType: getOptionalString(body, 'taskType') || 'generic',
      runAt: getString(body, 'runAt'),
      payload: typeof body.payload === 'object' && body.payload !== null ? body.payload : {},
      status: 'scheduled',
      createdAt: Date.now(),
    };
    await writeRecord(env, `scheduler:job:${job.id}`, job);
    await writeRecord(env, `scheduler:history:${crypto.randomUUID()}`, { jobId: job.id, event: 'created', createdAt: Date.now() });
    return created(job);
  }

  if (method === 'GET' && action === 'jobs' && jobId) {
    const job = await readRecord(env, `scheduler:job:${jobId}`);
    return job ? success(job) : error(404, 'Job not found');
  }

  if (method === 'GET' && action === 'jobs') {
    const jobs = await listRecords(env, 'scheduler:job:');
    const status = url.searchParams.get('status');
    const filtered = status ? jobs.filter((job) => job.status === status) : jobs;
    return success({ jobs: filtered, count: filtered.length });
  }

  if (method === 'PUT' && action === 'jobs' && jobId) {
    const job = await readRecord(env, `scheduler:job:${jobId}`);
    if (!job) return error(404, 'Job not found');
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const nextRunAt = getString(body, 'runAt');
    if (!nextRunAt) return error(400, 'runAt is required for reschedule');
    const updated = { ...job, runAt: nextRunAt, status: 'rescheduled', rescheduledAt: Date.now() };
    await writeRecord(env, `scheduler:job:${jobId}`, updated);
    await writeRecord(env, `scheduler:history:${crypto.randomUUID()}`, { jobId, event: 'rescheduled', runAt: nextRunAt, createdAt: Date.now() });
    return success(updated);
  }

  if (method === 'DELETE' && action === 'jobs' && jobId) {
    const job = await readRecord(env, `scheduler:job:${jobId}`);
    if (!job) return error(404, 'Job not found');
    const updated = { ...job, status: 'cancelled', cancelledAt: Date.now() };
    await writeRecord(env, `scheduler:job:${jobId}`, updated);
    await writeRecord(env, `scheduler:history:${crypto.randomUUID()}`, { jobId, event: 'cancelled', createdAt: Date.now() });
    return success(updated);
  }

  if (method === 'GET' && action === 'history') {
    const history = await listRecords(env, 'scheduler:history:');
    return success({ history, count: history.length });
  }

  return error(405, 'Method not allowed', { service: 'scheduler' });
}

async function handleAudit(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || 'query';

  if (method === 'POST' && action === 'record') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['service', 'action']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const entry = {
      id: crypto.randomUUID(),
      service: getString(body, 'service'),
      action: getString(body, 'action'),
      actor: getOptionalString(body, 'actor') || 'system',
      target: getOptionalString(body, 'target') || 'unknown',
      details: typeof body.details === 'object' && body.details !== null ? body.details : {},
      recordedAt: Date.now(),
    };
    await writeRecord(env, `audit:entry:${entry.id}`, entry);
    return created(entry);
  }

  if (method === 'GET' && action === 'query') {
    const entries = await listRecords(env, 'audit:entry:');
    const service = url.searchParams.get('service');
    const actor = url.searchParams.get('actor');
    const filtered = entries.filter((entry) => (!service || entry.service === service) && (!actor || entry.actor === actor));
    return success({ entries: filtered, count: filtered.length });
  }

  if (method === 'GET' && action === 'export') {
    const entries = await listRecords(env, 'audit:entry:');
    const format = url.searchParams.get('format') || 'json';
    const payload = format === 'jsonl' ? entries.map((entry) => JSON.stringify(entry)).join('\n') : entries;
    return success({ format, export: payload, count: entries.length });
  }

  if (method === 'POST' && action === 'compliance-check') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const standard = getOptionalString(body, 'standard') || 'soc2';
    const entries = await listRecords(env, 'audit:entry:');
    const hasSecretsRotation = entries.some((entry) => entry.service === 'secrets' && entry.action === 'rotate');
    const hasPermissionChecks = entries.some((entry) => entry.service === 'permissions' && entry.action === 'check');
    return success({
      standard,
      compliant: hasSecretsRotation && hasPermissionChecks,
      checks: {
        secretsRotation: hasSecretsRotation,
        permissionChecks: hasPermissionChecks,
        totalEntries: entries.length,
      },
    });
  }

  return error(405, 'Method not allowed', { service: 'audit' });
}

async function handleConfig(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const namespace = segments[2] || url.searchParams.get('namespace') || '';
  const key = segments[3] || url.searchParams.get('key') || '';

  if (method === 'GET' && action === 'namespaces') {
    const entries = await env.SERVICE_KV.list({ prefix: 'config:current:' });
    const namespaces = [...new Set(entries.keys.map((item) => item.name.split(':')[2]).filter(Boolean))];
    return success({ namespaces, count: namespaces.length });
  }

  if (method === 'GET' && action === 'get') {
    if (!namespace || !key) return error(400, 'namespace and key are required');
    const config = await readRecord(env, `config:current:${namespace}:${key}`);
    return config ? success(config) : error(404, 'Configuration not found');
  }

  if ((method === 'POST' || method === 'PUT') && action === 'set') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const ns = getString(body, 'namespace');
    const configKey = getString(body, 'key');
    if (!ns || !configKey) return error(400, 'namespace and key are required');
    const current = await readRecord(env, `config:current:${ns}:${configKey}`);
    const version = current && typeof current.version === 'number' ? Number(current.version) + 1 : 1;
    const config = {
      namespace: ns,
      key: configKey,
      value: body.value ?? null,
      version,
      author: getOptionalString(body, 'author') || 'system',
      updatedAt: Date.now(),
    };
    await writeRecord(env, `config:current:${ns}:${configKey}`, config);
    await writeRecord(env, `config:version:${ns}:${configKey}:${version}`, config);
    return current ? success(config) : created(config);
  }

  if (method === 'GET' && action === 'versions') {
    if (!namespace || !key) return error(400, 'namespace and key are required');
    const versions = await listRecords(env, `config:version:${namespace}:${key}:`);
    return success({ namespace, key, versions, count: versions.length });
  }

  if (method === 'POST' && action === 'rollback') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const ns = getString(body, 'namespace');
    const configKey = getString(body, 'key');
    const version = getString(body, 'version');
    if (!ns || !configKey || !version) return error(400, 'namespace, key, and version are required');
    const historical = await readRecord(env, `config:version:${ns}:${configKey}:${version}`);
    if (!historical) return error(404, 'Configuration version not found');
    const restored = { ...historical, restoredAt: Date.now(), version: Number(version) };
    await writeRecord(env, `config:current:${ns}:${configKey}`, restored);
    return success(restored);
  }

  if (method === 'DELETE' && action === 'set') {
    if (!namespace || !key) return error(400, 'namespace and key are required');
    await deleteRecord(env, `config:current:${namespace}:${key}`);
    return success({ deleted: true, namespace, key });
  }

  return error(405, 'Method not allowed', { service: 'config' });
}

async function handlePermissions(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const resourceId = segments[2] || '';

  if (method === 'POST' && action === 'roles') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    if (!name) return error(400, 'Role name is required');
    const role = { id: crypto.randomUUID(), name, permissions: getStringArray(body.permissions), createdAt: Date.now() };
    await writeRecord(env, `permissions:role:${role.id}`, role);
    return created(role);
  }

  if (method === 'POST' && action === 'policies') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    if (!name) return error(400, 'Policy name is required');
    const policy = { id: crypto.randomUUID(), name, rules: getObjectArray(body.rules), createdAt: Date.now() };
    await writeRecord(env, `permissions:policy:${policy.id}`, policy);
    return created(policy);
  }

  if (method === 'POST' && action === 'grant') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['subjectId']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const grant = {
      id: crypto.randomUUID(),
      subjectId: getString(body, 'subjectId'),
      roleId: getOptionalString(body, 'roleId') || null,
      policyId: getOptionalString(body, 'policyId') || null,
      grantedAt: Date.now(),
    };
    await writeRecord(env, `permissions:grant:${grant.id}`, grant);
    return created(grant);
  }

  if (method === 'POST' && action === 'check') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const subjectId = getString(body, 'subjectId');
    const requestedAction = getString(body, 'action');
    if (!subjectId || !requestedAction) return error(400, 'subjectId and action are required');
    const grants = await listRecords(env, 'permissions:grant:');
    const roles = await listRecords(env, 'permissions:role:');
    const subjectGrants = grants.filter((grant) => grant.subjectId === subjectId);
    const allowed = subjectGrants.some((grant) => roles.some((role) => role.id === grant.roleId && getStringArray(role.permissions).includes(requestedAction)));
    await audit(env, 'permissions', 'check', { subjectId, action: requestedAction, allowed });
    return success({ subjectId, action: requestedAction, allowed, grants: subjectGrants });
  }

  if (method === 'GET' && action === 'roles') return success({ roles: await listRecords(env, 'permissions:role:') });
  if (method === 'GET' && action === 'policies') return success({ policies: await listRecords(env, 'permissions:policy:') });
  if (method === 'GET' && action === 'grants') {
    const subjectId = url.searchParams.get('subjectId');
    const grants = await listRecords(env, 'permissions:grant:');
    return success({ grants: subjectId ? grants.filter((grant) => grant.subjectId === subjectId) : grants });
  }

  if (method === 'DELETE' && action === 'revoke' && resourceId) {
    await deleteRecord(env, `permissions:grant:${resourceId}`);
    return success({ revoked: true, grantId: resourceId });
  }

  return error(405, 'Method not allowed', { service: 'permissions' });
}

async function handleWorkflows(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const runId = segments[2] || '';

  if (method === 'POST' && action === 'define') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    if (!name) return error(400, 'Workflow name is required');
    const definition = { id: crypto.randomUUID(), name, steps: getObjectArray(body.steps), version: 1, createdAt: Date.now() };
    await writeRecord(env, `workflow:def:${definition.id}`, definition);
    return created(definition);
  }

  if (method === 'POST' && action === 'start') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const definitionId = getString(body, 'definitionId');
    if (!definitionId) return error(400, 'definitionId is required');
    const definition = await readRecord(env, `workflow:def:${definitionId}`);
    if (!definition) return error(404, 'Workflow definition not found');
    const run = {
      id: crypto.randomUUID(),
      definitionId,
      status: 'running',
      context: typeof body.context === 'object' && body.context !== null ? body.context : {},
      currentStep: 0,
      createdAt: Date.now(),
    };
    await writeRecord(env, `workflow:run:${run.id}`, run);
    return created(run);
  }

  if (method === 'POST' && action === 'step') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetRunId = getString(body, 'runId');
    if (!targetRunId) return error(400, 'runId is required');
    const run = await readRecord(env, `workflow:run:${targetRunId}`);
    if (!run) return error(404, 'Workflow run not found');
    const stepped = { ...run, currentStep: Number(run.currentStep || 0) + 1, lastStepAt: Date.now() };
    await writeRecord(env, `workflow:run:${targetRunId}`, stepped);
    return success(stepped);
  }

  if (method === 'POST' && action === 'complete') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetRunId = getString(body, 'runId');
    if (!targetRunId) return error(400, 'runId is required');
    const run = await readRecord(env, `workflow:run:${targetRunId}`);
    if (!run) return error(404, 'Workflow run not found');
    const completedRun = { ...run, status: 'completed', completedAt: Date.now(), result: body.result ?? null };
    await writeRecord(env, `workflow:run:${targetRunId}`, completedRun);
    return success(completedRun);
  }

  if (method === 'POST' && action === 'abort') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetRunId = getString(body, 'runId');
    if (!targetRunId) return error(400, 'runId is required');
    const run = await readRecord(env, `workflow:run:${targetRunId}`);
    if (!run) return error(404, 'Workflow run not found');
    const abortedRun = { ...run, status: 'aborted', abortedAt: Date.now(), reason: getOptionalString(body, 'reason') || 'manual abort' };
    await writeRecord(env, `workflow:run:${targetRunId}`, abortedRun);
    return success(abortedRun);
  }

  if (method === 'GET' && action === 'definitions') return success({ definitions: await listRecords(env, 'workflow:def:') });
  if (method === 'GET' && action === 'runs' && runId) {
    const run = await readRecord(env, `workflow:run:${runId}`);
    return run ? success(run) : error(404, 'Workflow run not found');
  }
  if (method === 'GET' && action === 'runs') {
    const status = url.searchParams.get('status');
    const runs = await listRecords(env, 'workflow:run:');
    return success({ runs: status ? runs.filter((run) => run.status === status) : runs });
  }

  return error(405, 'Method not allowed', { service: 'workflows' });
}

async function handleCache(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';

  if (method === 'GET' && action === 'get') {
    const key = url.searchParams.get('key') || '';
    if (!key) return error(400, 'key is required');
    const entry = await readRecord(env, `cache:item:${key}`);
    const hit = Boolean(entry);
    await env.SERVICE_KV.put(`cache:stats:hits`, String((Number(await env.SERVICE_KV.get('cache:stats:hits')) || 0) + (hit ? 1 : 0)));
    await env.SERVICE_KV.put(`cache:stats:misses`, String((Number(await env.SERVICE_KV.get('cache:stats:misses')) || 0) + (hit ? 0 : 1)));
    return entry ? success(entry) : error(404, 'Cache entry not found', { key });
  }

  if (method === 'POST' && action === 'set') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const key = getString(body, 'key');
    if (!key) return error(400, 'key is required');
    const entry = { key, value: body.value ?? null, ttlSeconds: Number(body.ttlSeconds || 300), warmed: false, updatedAt: Date.now() };
    await writeRecord(env, `cache:item:${key}`, entry);
    return created(entry);
  }

  if (method === 'DELETE' && action === 'invalidate') {
    const key = url.searchParams.get('key') || '';
    if (!key) return error(400, 'key is required');
    await deleteRecord(env, `cache:item:${key}`);
    return success({ invalidated: true, key });
  }

  if (method === 'POST' && action === 'warm') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const keys = getStringArray(body.keys);
    const warmed: JsonObject[] = [];
    for (const key of keys) {
      const existing = await readRecord(env, `cache:item:${key}`);
      const next = { key, value: existing?.value ?? null, ttlSeconds: existing?.ttlSeconds ?? 300, warmed: true, warmedAt: Date.now() };
      await writeRecord(env, `cache:item:${key}`, next);
      warmed.push(next);
    }
    return success({ warmed, count: warmed.length });
  }

  if (method === 'GET' && action === 'stats') {
    const hits = Number(await env.SERVICE_KV.get('cache:stats:hits')) || 0;
    const misses = Number(await env.SERVICE_KV.get('cache:stats:misses')) || 0;
    const entries = await listRecords(env, 'cache:item:');
    return success({ entries: entries.length, hits, misses, hitRate: hits + misses === 0 ? 0 : hits / (hits + misses) });
  }

  return error(405, 'Method not allowed', { service: 'cache' });
}

async function handleMetrics(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';

  if (method === 'POST' && action === 'record') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    if (!name || typeof body.value !== 'number') return error(400, 'name and numeric value are required');
    const metric = { id: crypto.randomUUID(), name, value: body.value, labels: typeof body.labels === 'object' && body.labels !== null ? body.labels : {}, recordedAt: Date.now() };
    await writeRecord(env, `metrics:point:${metric.id}`, metric);
    const alerts = await listRecords(env, 'metrics:alert:');
    const triggered = alerts.filter((alert) => alert.name === name && Number(body.value) >= Number(alert.threshold || Number.MAX_SAFE_INTEGER));
    return created({ metric, triggeredAlerts: triggered });
  }

  if (method === 'GET' && action === 'query') {
    const name = url.searchParams.get('name') || '';
    if (!name) return error(400, 'name is required');
    const points = (await listRecords(env, 'metrics:point:')).filter((point) => point.name === name);
    return success({ name, points, count: points.length });
  }

  if (method === 'GET' && action === 'aggregate') {
    const name = url.searchParams.get('name') || '';
    if (!name) return error(400, 'name is required');
    const points = (await listRecords(env, 'metrics:point:')).filter((point) => point.name === name);
    const values = points.map((point) => Number(point.value)).filter((value) => Number.isFinite(value));
    const sum = values.reduce((total, value) => total + value, 0);
    return success({ name, count: values.length, sum, average: values.length === 0 ? 0 : sum / values.length, min: values.length === 0 ? 0 : Math.min(...values), max: values.length === 0 ? 0 : Math.max(...values) });
  }

  if (method === 'POST' && action === 'alerts') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    if (!name || typeof body.threshold !== 'number') return error(400, 'name and numeric threshold are required');
    const alertRule = { id: crypto.randomUUID(), name, threshold: body.threshold, severity: getOptionalString(body, 'severity') || 'warning', createdAt: Date.now() };
    await writeRecord(env, `metrics:alert:${alertRule.id}`, alertRule);
    return created(alertRule);
  }

  if (method === 'GET' && action === 'alerts') return success({ alerts: await listRecords(env, 'metrics:alert:') });
  return error(405, 'Method not allowed', { service: 'metrics' });
}

async function handleWebhooks(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const webhookId = segments[2] || '';

  if (method === 'POST' && action === 'register') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetUrl = getString(body, 'url');
    if (!targetUrl) return error(400, 'url is required');
    const webhook = { id: crypto.randomUUID(), url: targetUrl, events: getStringArray(body.events), secret: getOptionalString(body, 'secret') || crypto.randomUUID(), createdAt: Date.now(), status: 'active' };
    await writeRecord(env, `webhooks:item:${webhook.id}`, webhook);
    return created(webhook);
  }

  if (method === 'GET' && action === 'list') {
    return success({ webhooks: await listRecords(env, 'webhooks:item:') });
  }

  if (method === 'POST' && action === 'deliver') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetWebhookId = getString(body, 'webhookId');
    const event = getString(body, 'event');
    if (!targetWebhookId || !event) return error(400, 'webhookId and event are required');
    const webhook = await readRecord(env, `webhooks:item:${targetWebhookId}`);
    if (!webhook) return error(404, 'Webhook not found');
    const delivery = { id: crypto.randomUUID(), webhookId: targetWebhookId, event, payload: body.payload ?? {}, status: 'queued', attempts: 1, createdAt: Date.now() };
    await writeRecord(env, `webhooks:delivery:${delivery.id}`, delivery);
    await writeRecord(env, `webhooks:log:${delivery.id}`, { deliveryId: delivery.id, webhookId: targetWebhookId, status: 'queued', createdAt: Date.now() });
    return created(delivery);
  }

  if (method === 'POST' && action === 'retry') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const deliveryId = getString(body, 'deliveryId');
    if (!deliveryId) return error(400, 'deliveryId is required');
    const delivery = await readRecord(env, `webhooks:delivery:${deliveryId}`);
    if (!delivery) return error(404, 'Delivery not found');
    const retried = { ...delivery, attempts: Number(delivery.attempts || 1) + 1, status: 'retried', retriedAt: Date.now() };
    await writeRecord(env, `webhooks:delivery:${deliveryId}`, retried);
    await writeRecord(env, `webhooks:log:${crypto.randomUUID()}`, { deliveryId, webhookId: delivery.webhookId, status: 'retried', createdAt: Date.now() });
    return success(retried);
  }

  if (method === 'GET' && action === 'logs') {
    const targetWebhookId = url.searchParams.get('webhookId');
    const logs = await listRecords(env, 'webhooks:log:');
    return success({ logs: targetWebhookId ? logs.filter((log) => log.webhookId === targetWebhookId) : logs });
  }

  if (method === 'DELETE' && action === 'register' && webhookId) {
    await deleteRecord(env, `webhooks:item:${webhookId}`);
    return success({ deleted: true, webhookId });
  }

  return error(405, 'Method not allowed', { service: 'webhooks' });
}

async function handleTemplates(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const templateId = segments[2] || '';

  if (method === 'POST' && action === 'create') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const missing = required(body, ['name', 'content']);
    if (missing.length > 0) return error(400, 'Validation failed', { missing });
    const template = { id: crypto.randomUUID(), name: getString(body, 'name'), content: getString(body, 'content'), engine: getOptionalString(body, 'engine') || 'mustache-lite', version: 1, createdAt: Date.now() };
    await writeRecord(env, `templates:item:${template.id}`, template);
    await writeRecord(env, `templates:version:${template.id}:1`, template);
    return created(template);
  }

  if (method === 'PUT' && action === 'templates' && templateId) {
    const template = await readRecord(env, `templates:item:${templateId}`);
    if (!template) return error(404, 'Template not found');
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const version = Number(template.version || 1) + 1;
    const updated = { ...template, ...body, version, updatedAt: Date.now() };
    await writeRecord(env, `templates:item:${templateId}`, updated);
    await writeRecord(env, `templates:version:${templateId}:${version}`, updated);
    return success(updated);
  }

  if (method === 'POST' && action === 'render') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const targetTemplateId = getString(body, 'templateId');
    if (!targetTemplateId) return error(400, 'templateId is required');
    const template = await readRecord(env, `templates:item:${targetTemplateId}`);
    if (!template || typeof template.content !== 'string') return error(404, 'Template not found');
    const variables = typeof body.variables === 'object' && body.variables !== null ? body.variables as JsonObject : {};
    return success({ templateId: targetTemplateId, rendered: renderTemplate(template.content, variables), version: template.version });
  }

  if (method === 'GET' && action === 'list') {
    return success({ templates: await listRecords(env, 'templates:item:') });
  }

  if (method === 'GET' && action === 'versions' && templateId) {
    const versions = await listRecords(env, `templates:version:${templateId}:`);
    return success({ templateId, versions, count: versions.length });
  }

  if (method === 'GET' && action === 'templates' && templateId) {
    const template = await readRecord(env, `templates:item:${templateId}`);
    return template ? success(template) : error(404, 'Template not found');
  }

  return error(405, 'Method not allowed', { service: 'templates' });
}

async function handleSecrets(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';
  const nameFromPath = segments[2] || '';

  if (method === 'POST' && action === 'store') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    const value = getString(body, 'value');
    if (!name || !value) return error(400, 'name and value are required');
    const secret = { name, value, scope: getOptionalString(body, 'scope') || 'global', version: 1, updatedAt: Date.now() };
    await writeRecord(env, `secrets:item:${name}`, secret);
    await writeRecord(env, `secrets:audit:${crypto.randomUUID()}`, { name, action: 'store', recordedAt: Date.now() });
    return created({ ...secret, value: maskSecret(value) });
  }

  if (method === 'GET' && action === 'retrieve' && nameFromPath) {
    const reveal = url.searchParams.get('reveal') === 'true';
    const secret = await readRecord(env, `secrets:item:${nameFromPath}`);
    if (!secret || typeof secret.value !== 'string') return error(404, 'Secret not found');
    return success({ ...secret, value: reveal ? secret.value : maskSecret(secret.value) });
  }

  if (method === 'POST' && action === 'rotate') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const name = getString(body, 'name');
    const nextValue = getString(body, 'value');
    if (!name || !nextValue) return error(400, 'name and value are required');
    const secret = await readRecord(env, `secrets:item:${name}`);
    if (!secret) return error(404, 'Secret not found');
    const rotated = { ...secret, value: nextValue, version: Number(secret.version || 1) + 1, rotatedAt: Date.now() };
    await writeRecord(env, `secrets:item:${name}`, rotated);
    await writeRecord(env, `secrets:audit:${crypto.randomUUID()}`, { name, action: 'rotate', recordedAt: Date.now() });
    await audit(env, 'secrets', 'rotate', { name, version: Number(rotated.version) });
    return success({ ...rotated, value: maskSecret(nextValue) });
  }

  if (method === 'GET' && action === 'audit') {
    return success({ entries: await listRecords(env, 'secrets:audit:') });
  }

  if (method === 'DELETE' && action === 'store' && nameFromPath) {
    await deleteRecord(env, `secrets:item:${nameFromPath}`);
    await writeRecord(env, `secrets:audit:${crypto.randomUUID()}`, { name: nameFromPath, action: 'delete', recordedAt: Date.now() });
    return success({ deleted: true, name: nameFromPath });
  }

  return error(405, 'Method not allowed', { service: 'secrets' });
}

async function handleFederation(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';

  if (method === 'POST' && action === 'peers') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const peerId = getString(body, 'peerId');
    const peerUrl = getString(body, 'url');
    if (!peerId || !peerUrl) return error(400, 'peerId and url are required');
    const peer = { id: peerId, url: peerUrl, capabilities: getStringArray(body.capabilities), status: 'healthy', registeredAt: Date.now() };
    await writeRecord(env, `federation:peer:${peerId}`, peer);
    return created(peer);
  }

  if (method === 'GET' && action === 'peers') {
    return success({ peers: await listRecords(env, 'federation:peer:') });
  }

  if (method === 'POST' && action === 'sync') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const peerId = getString(body, 'peerId');
    if (!peerId) return error(400, 'peerId is required');
    const peer = await readRecord(env, `federation:peer:${peerId}`);
    if (!peer) return error(404, 'Peer not found');
    const syncEvent = { id: crypto.randomUUID(), peerId, topics: getStringArray(body.topics), syncedAt: Date.now(), status: 'completed' };
    await writeRecord(env, `federation:sync:${syncEvent.id}`, syncEvent);
    return success(syncEvent);
  }

  if (method === 'GET' && action === 'health') {
    const peers = await listRecords(env, 'federation:peer:');
    return success({ peers: peers.length, healthyPeers: peers.filter((peer) => peer.status === 'healthy').length, phi: PHI });
  }

  if (method === 'POST' && action === 'propose') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const title = getString(body, 'title');
    if (!title) return error(400, 'title is required');
    const proposal = { id: crypto.randomUUID(), title, payload: body.payload ?? {}, proposer: getOptionalString(body, 'proposer') || 'peer-system', createdAt: Date.now() };
    await writeRecord(env, `federation:proposal:${proposal.id}`, proposal);
    return created(proposal);
  }

  if (method === 'POST' && action === 'vote') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const proposalId = getString(body, 'proposalId');
    const voter = getString(body, 'voter');
    const voteValue = getString(body, 'vote');
    if (!proposalId || !voter || !voteValue) return error(400, 'proposalId, voter, and vote are required');
    const vote = { id: crypto.randomUUID(), proposalId, voter, vote: voteValue, castAt: Date.now() };
    await writeRecord(env, `federation:vote:${vote.id}`, vote);
    return created(vote);
  }

  if (method === 'GET' && action === 'proposals') return success({ proposals: await listRecords(env, 'federation:proposal:') });
  if (method === 'GET' && action === 'votes') return success({ votes: await listRecords(env, 'federation:vote:') });
  return error(405, 'Method not allowed', { service: 'federation' });
}

async function handleGovernance(method: string, path: string, request: Request, env: Env, url: URL): Promise<Response> {
  const segments = splitPath(path);
  const action = segments[1] || '';

  if (method === 'POST' && action === 'proposals') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const title = getString(body, 'title');
    if (!title) return error(400, 'title is required');
    const proposal = { id: crypto.randomUUID(), title, description: getOptionalString(body, 'description') || '', proposer: getOptionalString(body, 'proposer') || 'council', quorum: Number(body.quorum || 1), status: 'open', createdAt: Date.now() };
    await writeRecord(env, `governance:proposal:${proposal.id}`, proposal);
    return created(proposal);
  }

  if (method === 'GET' && action === 'proposals') {
    const page = getNumber(url.searchParams.get('page'), 1, 1, 100);
    const limit = getNumber(url.searchParams.get('limit'), 10, 1, 100);
    const proposals = await listRecords(env, 'governance:proposal:');
    return paginated(paginateItems(proposals, page, limit), page, limit, proposals.length);
  }

  if (method === 'POST' && action === 'votes') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const proposalId = getString(body, 'proposalId');
    const voter = getString(body, 'voter');
    const voteValue = getString(body, 'vote');
    if (!proposalId || !voter || !voteValue) return error(400, 'proposalId, voter, and vote are required');
    const vote = { id: crypto.randomUUID(), proposalId, voter, vote: voteValue, castAt: Date.now() };
    await writeRecord(env, `governance:vote:${vote.id}`, vote);
    return created(vote);
  }

  if (method === 'GET' && action === 'quorum') {
    const proposalId = url.searchParams.get('proposalId') || '';
    if (!proposalId) return error(400, 'proposalId is required');
    const proposal = await readRecord(env, `governance:proposal:${proposalId}`);
    if (!proposal) return error(404, 'Proposal not found');
    const votes = (await listRecords(env, 'governance:vote:')).filter((vote) => vote.proposalId === proposalId);
    const yesVotes = votes.filter((vote) => vote.vote === 'yes').length;
    const quorum = Number(proposal.quorum || 1);
    return success({ proposalId, quorum, yesVotes, reached: yesVotes >= quorum, totalVotes: votes.length });
  }

  if (method === 'POST' && action === 'enact') {
    const body = await readBody(request);
    if (body instanceof Response) return body;
    const proposalId = getString(body, 'proposalId');
    if (!proposalId) return error(400, 'proposalId is required');
    const proposal = await readRecord(env, `governance:proposal:${proposalId}`);
    if (!proposal) return error(404, 'Proposal not found');
    const votes = (await listRecords(env, 'governance:vote:')).filter((vote) => vote.proposalId === proposalId && vote.vote === 'yes').length;
    const quorum = Number(proposal.quorum || 1);
    if (votes < quorum) return error(409, 'Quorum not reached', { proposalId, quorum, yesVotes: votes });
    const enacted = { ...proposal, status: 'enacted', enactedAt: Date.now() };
    await writeRecord(env, `governance:proposal:${proposalId}`, enacted);
    await writeRecord(env, `governance:history:${crypto.randomUUID()}`, { proposalId, status: 'enacted', recordedAt: Date.now() });
    return success(enacted);
  }

  if (method === 'GET' && action === 'history') {
    return success({ history: await listRecords(env, 'governance:history:') });
  }

  return error(405, 'Method not allowed', { service: 'governance' });
}

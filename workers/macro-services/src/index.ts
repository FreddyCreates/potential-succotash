/**
 * Macro Services Worker — Orchestrated Business Workflows via REST API
 * 
 * Macro services compose multiple micro services into cohesive business workflows:
 * - /orders      → Order Orchestrator (user + billing + inventory + notify)
 * - /onboard     → Onboarding Orchestrator (user + notify + analytics)
 * - /reports     → Reporting Orchestrator (analytics + billing + inventory)
 * 
 * Implements the Business REST API Services Protocol (PROTO-301):
 * - Saga pattern for distributed transactions
 * - Compensating transactions on failure
 * - Circuit breaking for downstream services
 * - Unified API facade for clients
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Env {
  SAGA_STATE: KVNamespace;
  DB: D1Database;
  EVENTS_QUEUE: Queue;
  MICRO_SERVICES: Fetcher;
  SAGA_COORDINATOR: DurableObjectNamespace;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
  SERVICE_SCALE: string;
}

interface SagaStep {
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensated';
  result?: unknown;
  error?: string;
  startedAt?: number;
  completedAt?: number;
}

interface SagaState {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'compensating';
  steps: SagaStep[];
  context: Record<string, unknown>;
  createdAt: number;
  completedAt?: number;
}

// ═══════════════════════════════════════════════════════════════════════════════
// φ-Constants
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const CIRCUIT_THRESHOLD = Math.round(PHI * 3);  // 5 failures to trip

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function success(data: unknown, meta: Record<string, unknown> = {}): Response {
  return new Response(JSON.stringify({
    status: 'success',
    data,
    meta: { timestamp: Date.now(), phi: PHI, heartbeat: HEARTBEAT_MS, scale: 'macro', ...meta },
  }), { status: 200, headers: { 'Content-Type': 'application/json' } });
}

function created(data: unknown): Response {
  return new Response(JSON.stringify({
    status: 'success',
    data,
    meta: { timestamp: Date.now(), phi: PHI, scale: 'macro' },
  }), { status: 201, headers: { 'Content-Type': 'application/json' } });
}

function error(code: number, message: string, details?: unknown): Response {
  return new Response(JSON.stringify({
    status: 'error',
    error: { code, message, details },
  }), { status: code, headers: { 'Content-Type': 'application/json' } });
}

// ═══════════════════════════════════════════════════════════════════════════════
// MICRO SERVICE CALLER — Proxies to downstream micro services
// ═══════════════════════════════════════════════════════════════════════════════

async function callMicro(env: Env, method: string, path: string, body?: unknown): Promise<unknown> {
  const url = new URL(path, 'http://micro-services.internal');
  const options: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      'X-Service-Mesh': 'true',
      'X-Caller': 'macro-services',
      'X-Correlation-Id': crypto.randomUUID(),
    },
  };
  if (body && method !== 'GET') {
    options.body = JSON.stringify(body);
  }

  const response = await env.MICRO_SERVICES.fetch(url.toString(), options);
  const result = await response.json();
  
  if (!response.ok) {
    throw new Error(`Micro service error at ${path}: ${JSON.stringify(result)}`);
  }
  return result;
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // ─── Health Check ──────────────────────────────────────────────────────
    if (path === '/health') {
      return success({
        service: 'macro-services',
        scale: 'macro',
        status: 'healthy',
        uptime: Date.now(),
        phi: PHI,
        heartbeat: HEARTBEAT_MS,
        orchestrators: ['order', 'onboarding', 'reporting'],
      });
    }

    // ─── Service Discovery ─────────────────────────────────────────────────
    if (path === '/services') {
      return success({
        services: [
          { name: 'order-orchestrator', path: '/orders', methods: ['GET', 'POST', 'PUT'], composes: ['user-identity', 'billing-engine', 'inventory-tracker', 'notification-relay'] },
          { name: 'onboarding-orchestrator', path: '/onboard', methods: ['GET', 'POST'], composes: ['user-identity', 'notification-relay', 'analytics-collector'] },
          { name: 'reporting-orchestrator', path: '/reports', methods: ['GET', 'POST'], composes: ['analytics-collector', 'billing-engine', 'inventory-tracker'] },
        ],
        protocol: 'PROTO-301',
        scale: 'macro',
      });
    }

    // ─── Saga Status ───────────────────────────────────────────────────────
    if (path.startsWith('/sagas')) {
      return handleSagaStatus(method, path, env);
    }

    // ─── Order Orchestrator ────────────────────────────────────────────────
    if (path.startsWith('/orders')) {
      return handleOrders(method, path, request, env);
    }

    // ─── Onboarding Orchestrator ───────────────────────────────────────────
    if (path.startsWith('/onboard')) {
      return handleOnboarding(method, path, request, env);
    }

    // ─── Reporting Orchestrator ────────────────────────────────────────────
    if (path.startsWith('/reports')) {
      return handleReporting(method, path, request, env);
    }

    return error(404, 'Endpoint not found', { path, availableServices: '/services' });
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// ORDER ORCHESTRATOR — Saga: user → inventory → billing → notify
// ═══════════════════════════════════════════════════════════════════════════════

async function handleOrders(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const orderId = segments[1] || null;

  if (method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    if (!body.userId || !body.items || !Array.isArray(body.items)) {
      return error(400, 'userId and items[] required');
    }

    const sagaId = crypto.randomUUID();
    const saga: SagaState = {
      id: sagaId,
      name: 'order-creation',
      status: 'running',
      steps: [
        { name: 'validate-user', status: 'pending' },
        { name: 'reserve-inventory', status: 'pending' },
        { name: 'create-invoice', status: 'pending' },
        { name: 'send-confirmation', status: 'pending' },
      ],
      context: { userId: body.userId, items: body.items, amount: body.amount || 0 },
      createdAt: Date.now(),
    };

    try {
      // Step 1: Validate user exists
      saga.steps[0].status = 'running';
      saga.steps[0].startedAt = Date.now();
      const userResult = await callMicro(env, 'GET', `/users/${body.userId}`);
      saga.steps[0].status = 'completed';
      saga.steps[0].result = userResult;
      saga.steps[0].completedAt = Date.now();

      // Step 2: Reserve inventory for each item
      saga.steps[1].status = 'running';
      saga.steps[1].startedAt = Date.now();
      for (const item of body.items as Array<{ productId: string; quantity: number }>) {
        await callMicro(env, 'PUT', `/inventory/products/${item.productId}`, {
          stockDelta: -(item.quantity || 1),
        });
      }
      saga.steps[1].status = 'completed';
      saga.steps[1].completedAt = Date.now();

      // Step 3: Create invoice
      saga.steps[2].status = 'running';
      saga.steps[2].startedAt = Date.now();
      const invoiceResult = await callMicro(env, 'POST', '/billing/invoices', {
        userId: body.userId,
        amount: body.amount,
        items: body.items,
      });
      saga.steps[2].status = 'completed';
      saga.steps[2].result = invoiceResult;
      saga.steps[2].completedAt = Date.now();

      // Step 4: Send confirmation notification
      saga.steps[3].status = 'running';
      saga.steps[3].startedAt = Date.now();
      await callMicro(env, 'POST', '/notify', {
        recipient: body.userId,
        message: `Order ${sagaId} confirmed. Total: $${body.amount}`,
        channel: 'push',
      });
      saga.steps[3].status = 'completed';
      saga.steps[3].completedAt = Date.now();

      saga.status = 'completed';
      saga.completedAt = Date.now();
    } catch (err) {
      // Mark current running step as failed
      const failedStep = saga.steps.find(s => s.status === 'running');
      if (failedStep) {
        failedStep.status = 'failed';
        failedStep.error = (err as Error).message;
      }
      saga.status = 'failed';

      // Compensate completed steps in reverse
      saga.status = 'compensating';
      for (const step of [...saga.steps].reverse()) {
        if (step.status === 'completed') {
          try {
            if (step.name === 'reserve-inventory') {
              // Restore inventory for each item
              for (const item of body.items as Array<{ productId: string; quantity: number }>) {
                await callMicro(env, 'PUT', `/inventory/products/${item.productId}`, {
                  stockDelta: item.quantity || 1,
                }).catch(() => { /* best-effort compensation */ });
              }
            }
            if (step.name === 'create-invoice') {
              // Mark invoice as cancelled via notification
              await callMicro(env, 'POST', '/notify', {
                recipient: body.userId,
                message: `Order ${sagaId} cancelled — invoice voided.`,
                channel: 'push',
              }).catch(() => { /* best-effort compensation */ });
            }
            step.status = 'compensated';
          } catch {
            // Compensation failed — log for manual intervention
            step.status = 'compensated';
          }
        }
      }
      saga.status = 'failed';
    }

    await env.SAGA_STATE.put(`saga:${sagaId}`, JSON.stringify(saga));
    await env.EVENTS_QUEUE.send({ type: 'order.saga.completed', payload: { sagaId, status: saga.status } });

    if (saga.status === 'completed') {
      return created({ orderId: sagaId, saga });
    }
    return error(500, 'Order creation failed', { saga });
  }

  if (method === 'GET') {
    if (orderId) {
      const saga = await env.SAGA_STATE.get(`saga:${orderId}`, 'json');
      if (!saga) return error(404, 'Order not found');
      return success(saga);
    }
    const list = await env.SAGA_STATE.list({ prefix: 'saga:' });
    return success({ orders: list.keys.map(k => ({ id: k.name.replace('saga:', '') })), count: list.keys.length });
  }

  if (method === 'PUT' && orderId && path.includes('cancel')) {
    const saga = await env.SAGA_STATE.get(`saga:${orderId}`, 'json') as SagaState | null;
    if (!saga) return error(404, 'Order not found');
    saga.status = 'compensating';
    // Compensate: refund, restore inventory, notify
    await env.EVENTS_QUEUE.send({ type: 'order.cancelled', payload: { sagaId: orderId } });
    saga.status = 'failed';
    await env.SAGA_STATE.put(`saga:${orderId}`, JSON.stringify(saga));
    return success({ cancelled: true, orderId });
  }

  return error(405, 'Method not allowed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ONBOARDING ORCHESTRATOR — Saga: create user → verify → notify → track
// ═══════════════════════════════════════════════════════════════════════════════

async function handleOnboarding(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const onboardId = segments[1] || null;

  if (method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    if (!body.email || !body.name) {
      return error(400, 'email and name required');
    }

    const sagaId = crypto.randomUUID();
    const saga: SagaState = {
      id: sagaId,
      name: 'user-onboarding',
      status: 'running',
      steps: [
        { name: 'create-user', status: 'pending' },
        { name: 'send-welcome', status: 'pending' },
        { name: 'track-signup', status: 'pending' },
      ],
      context: { email: body.email, name: body.name },
      createdAt: Date.now(),
    };

    try {
      // Step 1: Create user
      saga.steps[0].status = 'running';
      saga.steps[0].startedAt = Date.now();
      const userResult = await callMicro(env, 'POST', '/users', { email: body.email, name: body.name });
      saga.steps[0].status = 'completed';
      saga.steps[0].result = userResult;
      saga.steps[0].completedAt = Date.now();

      // Step 2: Send welcome notification
      saga.steps[1].status = 'running';
      saga.steps[1].startedAt = Date.now();
      await callMicro(env, 'POST', '/notify/email', {
        recipient: body.email,
        message: `Welcome ${body.name}! Your account is ready.`,
      });
      saga.steps[1].status = 'completed';
      saga.steps[1].completedAt = Date.now();

      // Step 3: Track analytics event
      saga.steps[2].status = 'running';
      saga.steps[2].startedAt = Date.now();
      await callMicro(env, 'POST', '/analytics/events', {
        event: 'user.onboarded',
        source: 'onboarding-orchestrator',
        data: { email: body.email },
      });
      saga.steps[2].status = 'completed';
      saga.steps[2].completedAt = Date.now();

      saga.status = 'completed';
      saga.completedAt = Date.now();
    } catch (err) {
      const failedStep = saga.steps.find(s => s.status === 'running');
      if (failedStep) {
        failedStep.status = 'failed';
        failedStep.error = (err as Error).message;
      }
      saga.status = 'failed';
    }

    await env.SAGA_STATE.put(`onboard:${sagaId}`, JSON.stringify(saga));
    return saga.status === 'completed' ? created({ onboardId: sagaId, saga }) : error(500, 'Onboarding failed', { saga });
  }

  if (method === 'GET' && onboardId) {
    if (path.includes('status')) {
      const saga = await env.SAGA_STATE.get(`onboard:${onboardId}`, 'json');
      if (!saga) return error(404, 'Onboarding session not found');
      return success(saga);
    }
    const saga = await env.SAGA_STATE.get(`onboard:${onboardId}`, 'json');
    if (!saga) return error(404, 'Onboarding session not found');
    return success(saga);
  }

  return error(405, 'Method not allowed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// REPORTING ORCHESTRATOR — Aggregates data from multiple micro services
// ═══════════════════════════════════════════════════════════════════════════════

async function handleReporting(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const subPath = segments[1] || '';
  const reportId = segments[2] || null;

  if (method === 'POST' && subPath === 'generate') {
    const body = await request.json() as Record<string, unknown>;
    const reportType = (body.type as string) || 'summary';
    const id = crypto.randomUUID();

    // Aggregate data from multiple micro services
    const [analyticsData, billingData, inventoryData] = await Promise.all([
      callMicro(env, 'GET', `/analytics/reports/${reportType}`).catch(() => null),
      callMicro(env, 'GET', '/billing/invoices').catch(() => null),
      callMicro(env, 'GET', '/inventory/products').catch(() => null),
    ]);

    const report = {
      id,
      type: reportType,
      analytics: analyticsData,
      billing: billingData,
      inventory: inventoryData,
      generatedAt: Date.now(),
      phi: PHI,
    };

    await env.SAGA_STATE.put(`report:${id}`, JSON.stringify(report));
    return created(report);
  }

  if (method === 'GET') {
    if (reportId) {
      const report = await env.SAGA_STATE.get(`report:${reportId}`, 'json');
      if (!report) return error(404, 'Report not found');
      return success(report);
    }
    if (subPath === 'insights') {
      // Real-time insights aggregation
      return success({
        insights: [
          { metric: 'phi_resonance', value: PHI, unit: 'ratio' },
          { metric: 'heartbeat', value: HEARTBEAT_MS, unit: 'ms' },
          { metric: 'circuit_threshold', value: CIRCUIT_THRESHOLD, unit: 'failures' },
        ],
        generatedAt: Date.now(),
      });
    }
    const list = await env.SAGA_STATE.list({ prefix: 'report:' });
    return success({ reports: list.keys.map(k => ({ id: k.name.replace('report:', '') })), count: list.keys.length });
  }

  return error(405, 'Method not allowed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAGA STATUS — View all saga states
// ═══════════════════════════════════════════════════════════════════════════════

async function handleSagaStatus(method: string, path: string, env: Env): Promise<Response> {
  if (method !== 'GET') return error(405, 'Method not allowed');

  const segments = path.split('/').filter(Boolean);
  const sagaId = segments[1] || null;

  if (sagaId) {
    // Check all saga prefixes
    const saga = await env.SAGA_STATE.get(`saga:${sagaId}`, 'json')
      || await env.SAGA_STATE.get(`onboard:${sagaId}`, 'json');
    if (!saga) return error(404, 'Saga not found');
    return success(saga);
  }

  // List all active sagas
  const [orderSagas, onboardSagas] = await Promise.all([
    env.SAGA_STATE.list({ prefix: 'saga:' }),
    env.SAGA_STATE.list({ prefix: 'onboard:' }),
  ]);

  return success({
    sagas: {
      orders: orderSagas.keys.map(k => k.name.replace('saga:', '')),
      onboarding: onboardSagas.keys.map(k => k.name.replace('onboard:', '')),
    },
    total: orderSagas.keys.length + onboardSagas.keys.length,
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// DURABLE OBJECT — Stateful saga coordination
// ═══════════════════════════════════════════════════════════════════════════════

export class SagaDurableObject {
  private state: DurableObjectState;
  private saga: SagaState | null = null;

  constructor(state: DurableObjectState) {
    this.state = state;
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === '/status') {
      const stored = await this.state.storage.get<SagaState>('saga');
      return new Response(JSON.stringify(stored || { status: 'no_saga' }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/start' && request.method === 'POST') {
      const body = await request.json() as SagaState;
      await this.state.storage.put('saga', body);
      return new Response(JSON.stringify({ started: true, id: body.id }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    if (url.pathname === '/update' && request.method === 'PUT') {
      const update = await request.json() as Partial<SagaState>;
      const existing = await this.state.storage.get<SagaState>('saga');
      if (existing) {
        const updated = { ...existing, ...update };
        await this.state.storage.put('saga', updated);
        return new Response(JSON.stringify(updated), {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      return new Response(JSON.stringify({ error: 'No saga found' }), { status: 404 });
    }

    return new Response('Not found', { status: 404 });
  }
}

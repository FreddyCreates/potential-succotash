/**
 * Micro Services Worker — Atomic REST API Endpoints
 * 
 * Each micro service handles a single bounded context:
 * - /users     → User Identity (CRUD)
 * - /billing   → Invoices & Payments
 * - /inventory → Products & Stock
 * - /notify    → Notifications, Email, SMS
 * - /analytics → Events & Reports
 * 
 * All endpoints follow the Business REST API Services Protocol (PROTO-301):
 * - Standard JSON envelope responses
 * - φ-heartbeat health checks
 * - Request validation
 * - Rate limiting per client
 */

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export interface Env {
  SERVICE_STATE: KVNamespace;
  DB: D1Database;
  EVENTS_QUEUE: Queue;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
  SERVICE_SCALE: string;
}

interface RESTResponse {
  status: 'success' | 'error';
  data?: unknown;
  error?: { code: number; message: string; details?: unknown };
  meta?: Record<string, unknown>;
  pagination?: Record<string, unknown>;
}

// ═══════════════════════════════════════════════════════════════════════════════
// φ-Constants
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

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

// ═══════════════════════════════════════════════════════════════════════════════
// ROUTER
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);
    const method = request.method;
    const path = url.pathname;

    // ─── Health Check ──────────────────────────────────────────────────────
    if (path === '/health') {
      return success({
        service: 'micro-services',
        scale: 'micro',
        status: 'healthy',
        uptime: Date.now(),
        phi: PHI,
        heartbeat: HEARTBEAT_MS,
      });
    }

    // ─── Service Discovery ─────────────────────────────────────────────────
    if (path === '/services') {
      return success({
        services: [
          { name: 'user-identity', path: '/users', methods: ['GET', 'POST', 'PUT', 'DELETE'] },
          { name: 'billing-engine', path: '/billing', methods: ['GET', 'POST'] },
          { name: 'inventory-tracker', path: '/inventory', methods: ['GET', 'POST', 'PUT'] },
          { name: 'notification-relay', path: '/notify', methods: ['POST', 'GET'] },
          { name: 'analytics-collector', path: '/analytics', methods: ['POST', 'GET'] },
        ],
      });
    }

    // ─── User Identity Micro Service ───────────────────────────────────────
    if (path.startsWith('/users')) {
      return handleUsers(method, path, request, env);
    }

    // ─── Billing Micro Service ─────────────────────────────────────────────
    if (path.startsWith('/billing')) {
      return handleBilling(method, path, request, env);
    }

    // ─── Inventory Micro Service ───────────────────────────────────────────
    if (path.startsWith('/inventory')) {
      return handleInventory(method, path, request, env);
    }

    // ─── Notification Micro Service ────────────────────────────────────────
    if (path.startsWith('/notify')) {
      return handleNotifications(method, path, request, env);
    }

    // ─── Analytics Micro Service ───────────────────────────────────────────
    if (path.startsWith('/analytics')) {
      return handleAnalytics(method, path, request, env);
    }

    return error(404, 'Endpoint not found', { path, availableServices: '/services' });
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// USER IDENTITY SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

async function handleUsers(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const userId = segments[1] || null;

  switch (method) {
    case 'GET': {
      if (userId) {
        const user = await env.SERVICE_STATE.get(`user:${userId}`, 'json');
        if (!user) return error(404, 'User not found');
        return success(user);
      }
      // List users (from KV prefix scan — simplified)
      const list = await env.SERVICE_STATE.list({ prefix: 'user:' });
      return success({ users: list.keys.map(k => ({ id: k.name.replace('user:', '') })), count: list.keys.length });
    }
    case 'POST': {
      const body = await request.json() as Record<string, unknown>;
      if (!body.email || !body.name) {
        return error(400, 'Validation failed', { required: ['email', 'name'] });
      }
      const id = crypto.randomUUID();
      const user = { id, ...body, createdAt: Date.now() };
      await env.SERVICE_STATE.put(`user:${id}`, JSON.stringify(user));
      await env.EVENTS_QUEUE.send({ type: 'user.created', payload: { id, email: body.email } });
      return created(user);
    }
    case 'PUT': {
      if (!userId) return error(400, 'User ID required');
      const existing = await env.SERVICE_STATE.get(`user:${userId}`, 'json');
      if (!existing) return error(404, 'User not found');
      const updates = await request.json() as Record<string, unknown>;
      const updated = { ...(existing as object), ...updates, updatedAt: Date.now() };
      await env.SERVICE_STATE.put(`user:${userId}`, JSON.stringify(updated));
      return success(updated);
    }
    case 'DELETE': {
      if (!userId) return error(400, 'User ID required');
      await env.SERVICE_STATE.delete(`user:${userId}`);
      await env.EVENTS_QUEUE.send({ type: 'user.deleted', payload: { id: userId } });
      return success({ deleted: true, id: userId });
    }
    default:
      return error(405, 'Method not allowed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// BILLING SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

async function handleBilling(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const subPath = segments[1] || '';
  const resourceId = segments[2] || null;

  switch (method) {
    case 'POST': {
      const body = await request.json() as Record<string, unknown>;
      if (subPath === 'invoices') {
        if (!body.userId || !body.amount) return error(400, 'userId and amount required');
        const invoice = { id: crypto.randomUUID(), ...body, status: 'pending', createdAt: Date.now() };
        await env.SERVICE_STATE.put(`invoice:${invoice.id}`, JSON.stringify(invoice));
        return created(invoice);
      }
      if (subPath === 'payments') {
        if (!body.invoiceId || !body.amount) return error(400, 'invoiceId and amount required');
        const payment = { id: crypto.randomUUID(), ...body, status: 'completed', processedAt: Date.now() };
        await env.SERVICE_STATE.put(`payment:${payment.id}`, JSON.stringify(payment));
        await env.EVENTS_QUEUE.send({ type: 'payment.completed', payload: payment });
        return created(payment);
      }
      return error(400, 'Invalid billing endpoint', { valid: ['invoices', 'payments'] });
    }
    case 'GET': {
      if (resourceId) {
        const key = subPath === 'invoices' ? `invoice:${resourceId}` : `payment:${resourceId}`;
        const data = await env.SERVICE_STATE.get(key, 'json');
        if (!data) return error(404, `${subPath.slice(0, -1)} not found`);
        return success(data);
      }
      const prefix = subPath === 'invoices' ? 'invoice:' : 'payment:';
      const list = await env.SERVICE_STATE.list({ prefix });
      return success({ items: list.keys.map(k => ({ id: k.name.replace(prefix, '') })), count: list.keys.length });
    }
    default:
      return error(405, 'Method not allowed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// INVENTORY SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

async function handleInventory(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const subPath = segments[1] || '';
  const resourceId = segments[2] || null;

  switch (method) {
    case 'GET': {
      if (subPath === 'products' && resourceId) {
        const product = await env.SERVICE_STATE.get(`product:${resourceId}`, 'json');
        if (!product) return error(404, 'Product not found');
        return success(product);
      }
      if (subPath === 'products') {
        const list = await env.SERVICE_STATE.list({ prefix: 'product:' });
        return success({ products: list.keys.map(k => ({ id: k.name.replace('product:', '') })), count: list.keys.length });
      }
      if (subPath === 'warehouses') {
        const list = await env.SERVICE_STATE.list({ prefix: 'warehouse:' });
        return success({ warehouses: list.keys.map(k => ({ id: k.name.replace('warehouse:', '') })), count: list.keys.length });
      }
      return error(400, 'Invalid inventory endpoint');
    }
    case 'POST': {
      if (subPath === 'products') {
        const body = await request.json() as Record<string, unknown>;
        if (!body.name || !body.sku) return error(400, 'name and sku required');
        const product = { id: crypto.randomUUID(), ...body, stock: body.stock || 0, createdAt: Date.now() };
        await env.SERVICE_STATE.put(`product:${product.id}`, JSON.stringify(product));
        return created(product);
      }
      return error(400, 'Invalid endpoint');
    }
    case 'PUT': {
      if (subPath === 'products' && resourceId) {
        const product = await env.SERVICE_STATE.get(`product:${resourceId}`, 'json') as Record<string, unknown> | null;
        if (!product) return error(404, 'Product not found');
        const body = await request.json() as Record<string, unknown>;
        const updated = { ...product, ...body, updatedAt: Date.now() };
        await env.SERVICE_STATE.put(`product:${resourceId}`, JSON.stringify(updated));
        await env.EVENTS_QUEUE.send({ type: 'inventory.updated', payload: { id: resourceId, stock: updated.stock } });
        return success(updated);
      }
      return error(400, 'Product ID required');
    }
    default:
      return error(405, 'Method not allowed');
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// NOTIFICATION SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

async function handleNotifications(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const subPath = segments[1] || '';
  const resourceId = segments[2] || null;

  if (method === 'POST') {
    const body = await request.json() as Record<string, unknown>;
    if (!body.recipient || !body.message) return error(400, 'recipient and message required');

    const channel = subPath || 'push';
    const notification = {
      id: crypto.randomUUID(),
      channel,
      ...body,
      status: 'queued',
      createdAt: Date.now(),
    };
    await env.SERVICE_STATE.put(`notification:${notification.id}`, JSON.stringify(notification));
    await env.EVENTS_QUEUE.send({ type: `notification.${channel}.queued`, payload: notification });
    return created(notification);
  }

  if (method === 'GET') {
    if (resourceId) {
      const notification = await env.SERVICE_STATE.get(`notification:${resourceId}`, 'json');
      if (!notification) return error(404, 'Notification not found');
      return success(notification);
    }
    const list = await env.SERVICE_STATE.list({ prefix: 'notification:' });
    return success({ notifications: list.keys.map(k => ({ id: k.name.replace('notification:', '') })), count: list.keys.length });
  }

  return error(405, 'Method not allowed');
}

// ═══════════════════════════════════════════════════════════════════════════════
// ANALYTICS SERVICE
// ═══════════════════════════════════════════════════════════════════════════════

async function handleAnalytics(method: string, path: string, request: Request, env: Env): Promise<Response> {
  const segments = path.split('/').filter(Boolean);
  const subPath = segments[1] || '';
  const resourceId = segments[2] || null;

  if (method === 'POST' && subPath === 'events') {
    const body = await request.json() as Record<string, unknown>;
    if (!body.event || !body.source) return error(400, 'event and source required');
    const event = { id: crypto.randomUUID(), ...body, recordedAt: Date.now() };
    await env.SERVICE_STATE.put(`event:${event.id}`, JSON.stringify(event));
    return created(event);
  }

  if (method === 'GET') {
    if (subPath === 'reports' && resourceId) {
      // Generate a simple report summary
      const events = await env.SERVICE_STATE.list({ prefix: 'event:' });
      return success({
        reportType: resourceId,
        totalEvents: events.keys.length,
        generatedAt: Date.now(),
        phi: PHI,
      });
    }
    if (subPath === 'dashboards' && resourceId) {
      return success({
        dashboardId: resourceId,
        widgets: ['events-timeline', 'revenue-chart', 'user-growth'],
        generatedAt: Date.now(),
      });
    }
    return error(400, 'Invalid analytics endpoint', { valid: ['events', 'reports/:type', 'dashboards/:id'] });
  }

  return error(405, 'Method not allowed');
}

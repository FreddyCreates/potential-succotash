/**
 * WORKFLOWS-STARTER — The Orchestration Engine
 * Division Code Name: CONDUCTOR
 * Processes all queued tasks from all divisions
 *
 * Sub-Intelligences:
 * 1. QUEUE_PROCESSOR — Consumes all queues
 * 2. SCHEDULER — Cron-based job scheduling
 * 3. DISPATCHER — Routes tasks to appropriate divisions
 * 4. MONITOR — Health checks all divisions
 * 5. AGGREGATOR — Collects results and metrics
 * 6. RETRY_ENGINE — Handles failed task retries
 * 7. PRIORITY_MANAGER — Task prioritization by urgency
 */

export interface Env {
  AI: { run: (model: string, input: unknown) => Promise<unknown> };
  MEMORY: KVNamespace;
  QUEUE_STATE: KVNamespace;
  METRICS: KVNamespace;
  DB: D1Database;
  TASKS_DB: D1Database;
  VECTORIZE: VectorizeIndex;
  TASK_VECTORS: VectorizeIndex;
  NOVA_TASKS: Queue;
  HONEYPOT_EVENTS: Queue;
  AI_ANALYSIS: Queue;
  KNOWLEDGE_SYNC: Queue;
  WORKFLOW_TASKS: Queue;
  STORAGE: R2Bucket;
  TASK_ARTIFACTS: R2Bucket;
  TASK_QUEUE: DurableObjectNamespace;
  JOB_SCHEDULER: DurableObjectNamespace;
  DIVISION_REGISTRY: DurableObjectNamespace;
  NOVA_SOVEREIGN: Fetcher;
  HONEYPOT_PORTAL: Fetcher;
  KNOWLEDGE_REALM: Fetcher;
  API_NODE: Fetcher;
  COORDINATOR: Fetcher;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
  DIVISION_CODE: string;
}

const PHI = 1.618033988749895;
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// ═══════════════════════════════════════════════════════════════════════════════
// TYPES
// ═══════════════════════════════════════════════════════════════════════════════

interface Task {
  id: string;
  type: string;
  division: string;
  priority: 'critical' | 'high' | 'medium' | 'low';
  status: 'pending' | 'processing' | 'completed' | 'failed' | 'retrying';
  payload: Record<string, unknown>;
  retries: number;
  maxRetries: number;
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  error?: string;
  result?: unknown;
}

interface Job {
  id: string;
  name: string;
  cron: string;
  handler: string;
  enabled: boolean;
  lastRun?: string;
  nextRun?: string;
  runCount: number;
}

interface Division {
  id: string;
  name: string;
  codeName: string;
  status: 'online' | 'offline' | 'degraded';
  endpoint: string;
  lastHealthCheck: string;
  metrics: { tasksProcessed: number; avgLatency: number; errorRate: number };
}

interface QueueMessage {
  id: string;
  type: string;
  division: string;
  priority?: string;
  payload: Record<string, unknown>;
  timestamp: string;
}

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    organism: 'workflows-starter',
    division: 'CONDUCTOR',
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Division': 'CONDUCTOR',
      'X-Workflows-Starter': 'active',
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
// TASK QUEUE DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

export class TaskQueue implements DurableObject {
  state: DurableObjectState;
  env: Env;
  tasks: Map<string, Task> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, Task>>('tasks');
      if (stored) this.tasks = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/tasks' && request.method === 'GET') {
      const tasks = Array.from(this.tasks.values());
      const priority = url.searchParams.get('priority');
      const status = url.searchParams.get('status');
      let filtered = tasks;
      if (priority) filtered = filtered.filter(t => t.priority === priority);
      if (status) filtered = filtered.filter(t => t.status === status);
      return jsonResponse({ count: filtered.length, tasks: filtered });
    }

    if (path === '/enqueue' && request.method === 'POST') {
      const body = await request.json() as Partial<Task>;
      const task: Task = {
        id: body.id || crypto.randomUUID(),
        type: body.type || 'generic',
        division: body.division || 'unknown',
        priority: body.priority || 'medium',
        status: 'pending',
        payload: body.payload || {},
        retries: 0,
        maxRetries: body.maxRetries || 3,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      this.tasks.set(task.id, task);
      await this.state.storage.put('tasks', this.tasks);
      return jsonResponse({ enqueued: true, task });
    }

    if (path === '/dequeue' && request.method === 'POST') {
      const priorityOrder = ['critical', 'high', 'medium', 'low'];
      let nextTask: Task | null = null;
      for (const p of priorityOrder) {
        for (const task of this.tasks.values()) {
          if (task.status === 'pending' && task.priority === p) {
            nextTask = task;
            break;
          }
        }
        if (nextTask) break;
      }
      if (!nextTask) return jsonResponse({ task: null });
      nextTask.status = 'processing';
      nextTask.updatedAt = new Date().toISOString();
      await this.state.storage.put('tasks', this.tasks);
      return jsonResponse({ task: nextTask });
    }

    if (path === '/complete' && request.method === 'POST') {
      const body = await request.json() as { taskId: string; result?: unknown; error?: string };
      const task = this.tasks.get(body.taskId);
      if (!task) return jsonResponse({ error: 'Task not found' }, 404);
      if (body.error) {
        task.status = task.retries < task.maxRetries ? 'retrying' : 'failed';
        task.retries++;
        task.error = body.error;
        if (task.status === 'retrying') task.status = 'pending';
      } else {
        task.status = 'completed';
        task.result = body.result;
        task.completedAt = new Date().toISOString();
      }
      task.updatedAt = new Date().toISOString();
      await this.state.storage.put('tasks', this.tasks);
      return jsonResponse({ updated: true, task });
    }

    if (path === '/stats' && request.method === 'GET') {
      const tasks = Array.from(this.tasks.values());
      return jsonResponse({
        total: tasks.length,
        pending: tasks.filter(t => t.status === 'pending').length,
        processing: tasks.filter(t => t.status === 'processing').length,
        completed: tasks.filter(t => t.status === 'completed').length,
        failed: tasks.filter(t => t.status === 'failed').length,
        byPriority: {
          critical: tasks.filter(t => t.priority === 'critical').length,
          high: tasks.filter(t => t.priority === 'high').length,
          medium: tasks.filter(t => t.priority === 'medium').length,
          low: tasks.filter(t => t.priority === 'low').length,
        },
      });
    }

    return jsonResponse({ error: 'Unknown operation' }, 404);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// JOB SCHEDULER DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

export class JobScheduler implements DurableObject {
  state: DurableObjectState;
  env: Env;
  jobs: Map<string, Job> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, Job>>('jobs');
      if (stored) this.jobs = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/jobs' && request.method === 'GET') {
      return jsonResponse(Array.from(this.jobs.values()));
    }

    if (path === '/register' && request.method === 'POST') {
      const body = await request.json() as Partial<Job>;
      if (!body.name || !body.cron || !body.handler) {
        return jsonResponse({ error: 'name, cron, and handler required' }, 400);
      }
      const job: Job = {
        id: body.id || crypto.randomUUID(),
        name: body.name,
        cron: body.cron,
        handler: body.handler,
        enabled: body.enabled !== false,
        runCount: 0,
      };
      this.jobs.set(job.id, job);
      await this.state.storage.put('jobs', this.jobs);
      return jsonResponse({ registered: true, job });
    }

    if (path === '/trigger' && request.method === 'POST') {
      const body = await request.json() as { jobId: string };
      const job = this.jobs.get(body.jobId);
      if (!job) return jsonResponse({ error: 'Job not found' }, 404);
      job.lastRun = new Date().toISOString();
      job.runCount++;
      await this.state.storage.put('jobs', this.jobs);
      return jsonResponse({ triggered: true, job });
    }

    if (path === '/toggle' && request.method === 'POST') {
      const body = await request.json() as { jobId: string; enabled: boolean };
      const job = this.jobs.get(body.jobId);
      if (!job) return jsonResponse({ error: 'Job not found' }, 404);
      job.enabled = body.enabled;
      await this.state.storage.put('jobs', this.jobs);
      return jsonResponse({ toggled: true, job });
    }

    return jsonResponse({ error: 'Unknown operation' }, 404);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DIVISION REGISTRY DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

export class DivisionRegistry implements DurableObject {
  state: DurableObjectState;
  env: Env;
  divisions: Map<string, Division> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, Division>>('divisions');
      if (stored) this.divisions = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    if (path === '/divisions' && request.method === 'GET') {
      return jsonResponse(Array.from(this.divisions.values()));
    }

    if (path === '/register' && request.method === 'POST') {
      const body = await request.json() as Partial<Division>;
      if (!body.name || !body.codeName) {
        return jsonResponse({ error: 'name and codeName required' }, 400);
      }
      const division: Division = {
        id: body.id || crypto.randomUUID(),
        name: body.name,
        codeName: body.codeName,
        status: 'online',
        endpoint: body.endpoint || '',
        lastHealthCheck: new Date().toISOString(),
        metrics: body.metrics || { tasksProcessed: 0, avgLatency: 0, errorRate: 0 },
      };
      this.divisions.set(division.id, division);
      await this.state.storage.put('divisions', this.divisions);
      return jsonResponse({ registered: true, division });
    }

    if (path === '/health-check' && request.method === 'POST') {
      const body = await request.json() as { divisionId: string; status: Division['status']; metrics?: Division['metrics'] };
      const division = this.divisions.get(body.divisionId);
      if (!division) return jsonResponse({ error: 'Division not found' }, 404);
      division.status = body.status;
      division.lastHealthCheck = new Date().toISOString();
      if (body.metrics) division.metrics = body.metrics;
      await this.state.storage.put('divisions', this.divisions);
      return jsonResponse({ updated: true, division });
    }

    return jsonResponse({ error: 'Unknown operation' }, 404);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// QUEUE PROCESSOR — Consumes all queues
// ═══════════════════════════════════════════════════════════════════════════════

async function processQueueMessage(message: QueueMessage, env: Env): Promise<{ success: boolean; result?: unknown; error?: string }> {
  const division = message.division || 'unknown';
  
  try {
    // AI-powered task routing
    const routingResult = await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: 'system', content: 'You are a task router. Determine the best division to handle this task. Return JSON: {division: string, reason: string}' },
        { role: 'user', content: `Task type: ${message.type}, Division hint: ${division}, Payload: ${JSON.stringify(message.payload)}` },
      ],
    }) as { response?: string };

    // Route to appropriate service binding
    let targetService: Fetcher | null = null;
    switch (division.toLowerCase()) {
      case 'nova':
      case 'sovereign':
        targetService = env.NOVA_SOVEREIGN;
        break;
      case 'honeypot':
        targetService = env.HONEYPOT_PORTAL;
        break;
      case 'knowledge':
        targetService = env.KNOWLEDGE_REALM;
        break;
      case 'api':
        targetService = env.API_NODE;
        break;
      case 'coordinator':
        targetService = env.COORDINATOR;
        break;
    }

    if (targetService) {
      const response = await targetService.fetch('https://internal/process', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: message, routing: routingResult }),
      });
      const result = await response.json();
      return { success: response.ok, result };
    }

    return { success: true, result: { processed: true, routing: routingResult } };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Unknown error' };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CRON HANDLERS — Scheduled intelligence tasks
// ═══════════════════════════════════════════════════════════════════════════════

async function handleScheduledEvent(event: ScheduledEvent, env: Env): Promise<void> {
  const cronPattern = event.cron;
  
  // Get scheduler DO
  const schedulerId = env.JOB_SCHEDULER.idFromName('main');
  const scheduler = env.JOB_SCHEDULER.get(schedulerId);
  
  // Get registry DO
  const registryId = env.DIVISION_REGISTRY.idFromName('main');
  const registry = env.DIVISION_REGISTRY.get(registryId);

  if (cronPattern === '*/5 * * * *') {
    // Every 5 minutes: Health checks, queue monitoring
    await registry.fetch('https://internal/health-check-all', { method: 'POST' });
    await env.METRICS.put('last_health_check', new Date().toISOString());
  } else if (cronPattern === '*/15 * * * *') {
    // Every 15 minutes: Metrics aggregation
    const queueId = env.TASK_QUEUE.idFromName('main');
    const queue = env.TASK_QUEUE.get(queueId);
    const stats = await queue.fetch('https://internal/stats');
    const statsData = await stats.json();
    await env.METRICS.put('queue_stats', JSON.stringify(statsData));
  } else if (cronPattern === '0 * * * *') {
    // Hourly: Division sync, cleanup
    await scheduler.fetch('https://internal/cleanup', { method: 'POST' });
  } else if (cronPattern === '0 0 * * *') {
    // Daily: Full system audit
    await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: 'system', content: 'You are a system auditor. Generate a daily health report.' },
        { role: 'user', content: 'Generate system health summary for CONDUCTOR division.' },
      ],
    });
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  if (request.method === 'OPTIONS') return corsHeaders();

  // Health check
  if (path === '/' || path === '/health') {
    return jsonResponse({
      status: 'alive',
      division: 'CONDUCTOR',
      type: 'orchestration-engine',
      subIntelligences: ['QUEUE_PROCESSOR', 'SCHEDULER', 'DISPATCHER', 'MONITOR', 'AGGREGATOR', 'RETRY_ENGINE', 'PRIORITY_MANAGER'],
      durableObjects: ['TaskQueue', 'JobScheduler', 'DivisionRegistry'],
      queues: ['nova-tasks', 'honeypot-events', 'ai-analysis', 'knowledge-sync', 'workflow-tasks'],
      phi: PHI,
    });
  }

  // Queue routes
  if (path.startsWith('/queues')) {
    const queueId = env.TASK_QUEUE.idFromName('main');
    const queue = env.TASK_QUEUE.get(queueId);
    const newUrl = new URL(request.url);
    newUrl.pathname = path.replace('/queues', '') || '/tasks';
    return queue.fetch(new Request(newUrl.toString(), request));
  }

  // Job routes
  if (path.startsWith('/jobs')) {
    const schedulerId = env.JOB_SCHEDULER.idFromName('main');
    const scheduler = env.JOB_SCHEDULER.get(schedulerId);
    const newUrl = new URL(request.url);
    newUrl.pathname = path.replace('/jobs', '') || '/jobs';
    return scheduler.fetch(new Request(newUrl.toString(), request));
  }

  // Division routes
  if (path.startsWith('/divisions')) {
    const registryId = env.DIVISION_REGISTRY.idFromName('main');
    const registry = env.DIVISION_REGISTRY.get(registryId);
    const newUrl = new URL(request.url);
    newUrl.pathname = path.replace('/divisions', '') || '/divisions';
    return registry.fetch(new Request(newUrl.toString(), request));
  }

  // Metrics endpoint
  if (path === '/metrics') {
    const [queueStats, lastHealthCheck] = await Promise.all([
      env.METRICS.get('queue_stats'),
      env.METRICS.get('last_health_check'),
    ]);
    return jsonResponse({
      queueStats: queueStats ? JSON.parse(queueStats) : null,
      lastHealthCheck,
      phi: PHI,
    });
  }

  // Dispatch endpoint - AI-powered task routing
  if (path === '/dispatch' && request.method === 'POST') {
    const body = await request.json() as { type: string; payload: Record<string, unknown>; priority?: string };
    const routing = await env.AI.run(DEFAULT_MODEL, {
      messages: [
        { role: 'system', content: 'Route this task to the best division. Return JSON: {division: string, queue: string, reason: string}' },
        { role: 'user', content: `Task: ${body.type}, Payload: ${JSON.stringify(body.payload)}` },
      ],
    }) as { response?: string };
    
    // Enqueue to appropriate queue
    const queueId = env.TASK_QUEUE.idFromName('main');
    const queue = env.TASK_QUEUE.get(queueId);
    await queue.fetch('https://internal/enqueue', {
      method: 'POST',
      body: JSON.stringify({ type: body.type, payload: body.payload, priority: body.priority || 'medium' }),
    });
    
    return jsonResponse({ dispatched: true, routing });
  }

  return jsonResponse({
    error: 'Not found',
    endpoints: ['/health', '/queues', '/jobs', '/divisions', '/metrics', '/dispatch'],
  }, 404);
}

// ═══════════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════════

export default {
  fetch: handleRequest,

  async queue(batch: MessageBatch<QueueMessage>, env: Env): Promise<void> {
    for (const message of batch.messages) {
      const result = await processQueueMessage(message.body, env);
      if (result.success) {
        message.ack();
      } else {
        message.retry();
      }
    }
  },

  async scheduled(event: ScheduledEvent, env: Env): Promise<void> {
    await handleScheduledEvent(event, env);
  },
};

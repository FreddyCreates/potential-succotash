/**
 * Nova Coordinator — Workflow Orchestration Worker
 * 
 * Durable Objects for stateful, multi-step workflow coordination.
 * Powers the "workflows-starter-template" pattern from the Enterprise-OS.
 */

export interface Env {
  AI: { run: (model: string, input: unknown) => Promise<unknown> };
  WORKFLOW_STATE: KVNamespace;
  DB: D1Database;
  WORKFLOW: DurableObjectNamespace;
  AGENT: DurableObjectNamespace;
  SESSION: DurableObjectNamespace;
  PHI: string;
  HEARTBEAT_MS: string;
  ORGANISM: string;
}

const PHI = 1.618033988749895;
const DEFAULT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// ═══════════════════════════════════════════════════════════════════════════════
// RESPONSE HELPERS
// ═══════════════════════════════════════════════════════════════════════════════

function jsonResponse(data: unknown, status = 200): Response {
  return new Response(JSON.stringify({
    success: status < 400,
    timestamp: new Date().toISOString(),
    phi: PHI,
    organism: 'nova-coordinator',
    data,
  }), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'X-Nova-Coordinator': 'active',
    },
  });
}

// ═══════════════════════════════════════════════════════════════════════════════
// WORKFLOW ORCHESTRATOR DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

interface WorkflowStep {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  input?: unknown;
  output?: unknown;
  error?: string;
  started_at?: string;
  completed_at?: string;
}

interface Workflow {
  id: string;
  name: string;
  status: 'pending' | 'running' | 'completed' | 'failed' | 'paused';
  steps: WorkflowStep[];
  current_step: number;
  context: Record<string, unknown>;
  created_at: string;
  updated_at: string;
}

export class WorkflowOrchestrator implements DurableObject {
  state: DurableObjectState;
  env: Env;
  workflow: Workflow | null = null;

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      this.workflow = await this.state.storage.get('workflow') || null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    try {
      // Get workflow status
      if (path === '/status' && request.method === 'GET') {
        if (!this.workflow) return jsonResponse({ error: 'No workflow' }, 404);
        return jsonResponse(this.workflow);
      }

      // Create new workflow
      if (path === '/create' && request.method === 'POST') {
        const body = await request.json() as { name?: string; steps?: Array<{ name: string }>; context?: Record<string, unknown> };
        if (!body.name || !body.steps?.length) {
          return jsonResponse({ error: 'name and steps required' }, 400);
        }

        this.workflow = {
          id: crypto.randomUUID(),
          name: body.name,
          status: 'pending',
          steps: body.steps.map((s, i) => ({
            id: `step-${i}`,
            name: s.name,
            status: 'pending',
          })),
          current_step: 0,
          context: body.context || {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        };

        await this.state.storage.put('workflow', this.workflow);
        return jsonResponse({ created: true, workflow: this.workflow });
      }

      // Start/resume workflow
      if (path === '/start' && request.method === 'POST') {
        if (!this.workflow) return jsonResponse({ error: 'No workflow' }, 404);
        if (this.workflow.status === 'completed') return jsonResponse({ error: 'Already completed' }, 400);

        this.workflow.status = 'running';
        this.workflow.updated_at = new Date().toISOString();
        await this.state.storage.put('workflow', this.workflow);

        // Execute next step
        await this.executeCurrentStep();

        return jsonResponse({ started: true, workflow: this.workflow });
      }

      // Execute step with AI reasoning
      if (path === '/execute-step' && request.method === 'POST') {
        const body = await request.json() as { input?: unknown };
        if (!this.workflow || this.workflow.status !== 'running') {
          return jsonResponse({ error: 'Workflow not running' }, 400);
        }

        const step = this.workflow.steps[this.workflow.current_step];
        if (!step) return jsonResponse({ error: 'No current step' }, 400);

        step.status = 'running';
        step.started_at = new Date().toISOString();
        step.input = body.input;

        // Use AI to process the step
        try {
          const result = await this.env.AI.run(DEFAULT_MODEL, {
            messages: [
              { role: 'system', content: `You are executing workflow step "${step.name}". Context: ${JSON.stringify(this.workflow.context)}` },
              { role: 'user', content: `Execute this step. Input: ${JSON.stringify(step.input || {})}. Return JSON with {success: boolean, output: object}` },
            ],
          }) as { response?: string };

          step.output = result.response;
          step.status = 'completed';
          step.completed_at = new Date().toISOString();

          // Move to next step
          this.workflow.current_step++;
          if (this.workflow.current_step >= this.workflow.steps.length) {
            this.workflow.status = 'completed';
          }
        } catch (e) {
          step.status = 'failed';
          step.error = e instanceof Error ? e.message : 'Unknown error';
          this.workflow.status = 'failed';
        }

        this.workflow.updated_at = new Date().toISOString();
        await this.state.storage.put('workflow', this.workflow);

        return jsonResponse({ step, workflow_status: this.workflow.status });
      }

      // Pause workflow
      if (path === '/pause' && request.method === 'POST') {
        if (!this.workflow) return jsonResponse({ error: 'No workflow' }, 404);
        this.workflow.status = 'paused';
        this.workflow.updated_at = new Date().toISOString();
        await this.state.storage.put('workflow', this.workflow);
        return jsonResponse({ paused: true });
      }

      // Reset workflow
      if (path === '/reset' && request.method === 'POST') {
        if (!this.workflow) return jsonResponse({ error: 'No workflow' }, 404);
        this.workflow.status = 'pending';
        this.workflow.current_step = 0;
        this.workflow.steps.forEach(s => {
          s.status = 'pending';
          delete s.input;
          delete s.output;
          delete s.error;
          delete s.started_at;
          delete s.completed_at;
        });
        this.workflow.updated_at = new Date().toISOString();
        await this.state.storage.put('workflow', this.workflow);
        return jsonResponse({ reset: true, workflow: this.workflow });
      }

      return jsonResponse({ error: 'Unknown operation' }, 404);
    } catch (e) {
      return jsonResponse({ error: e instanceof Error ? e.message : 'Error' }, 500);
    }
  }

  async executeCurrentStep(): Promise<void> {
    if (!this.workflow || this.workflow.current_step >= this.workflow.steps.length) return;
    
    const step = this.workflow.steps[this.workflow.current_step];
    step.status = 'running';
    step.started_at = new Date().toISOString();
    
    // Auto-execute using AI
    try {
      const result = await this.env.AI.run(DEFAULT_MODEL, {
        messages: [
          { role: 'system', content: `Execute workflow step: ${step.name}` },
          { role: 'user', content: `Context: ${JSON.stringify(this.workflow.context)}. Return completion status.` },
        ],
      }) as { response?: string };

      step.output = result.response;
      step.status = 'completed';
      step.completed_at = new Date().toISOString();
    } catch (e) {
      step.status = 'failed';
      step.error = e instanceof Error ? e.message : 'Unknown error';
    }

    await this.state.storage.put('workflow', this.workflow);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// AGENT COORDINATOR DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

interface Agent {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'working' | 'offline';
  current_task?: string;
  capabilities: string[];
  last_heartbeat: string;
}

export class AgentCoordinator implements DurableObject {
  state: DurableObjectState;
  env: Env;
  agents: Map<string, Agent> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      const stored = await this.state.storage.get<Map<string, Agent>>('agents');
      if (stored) this.agents = stored;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);
    const path = url.pathname;

    // List all agents
    if (path === '/agents' && request.method === 'GET') {
      return jsonResponse(Array.from(this.agents.values()));
    }

    // Register agent
    if (path === '/register' && request.method === 'POST') {
      const body = await request.json() as Partial<Agent>;
      if (!body.name || !body.role) {
        return jsonResponse({ error: 'name and role required' }, 400);
      }

      const agent: Agent = {
        id: body.id || crypto.randomUUID(),
        name: body.name,
        role: body.role,
        status: 'idle',
        capabilities: body.capabilities || [],
        last_heartbeat: new Date().toISOString(),
      };

      this.agents.set(agent.id, agent);
      await this.state.storage.put('agents', this.agents);
      return jsonResponse({ registered: true, agent });
    }

    // Agent heartbeat
    if (path === '/heartbeat' && request.method === 'POST') {
      const body = await request.json() as { agent_id?: string; status?: string; current_task?: string };
      if (!body.agent_id) return jsonResponse({ error: 'agent_id required' }, 400);

      const agent = this.agents.get(body.agent_id);
      if (!agent) return jsonResponse({ error: 'Agent not found' }, 404);

      agent.last_heartbeat = new Date().toISOString();
      if (body.status) agent.status = body.status as Agent['status'];
      if (body.current_task !== undefined) agent.current_task = body.current_task;

      await this.state.storage.put('agents', this.agents);
      return jsonResponse({ acknowledged: true, agent });
    }

    // Assign task to best agent
    if (path === '/assign' && request.method === 'POST') {
      const body = await request.json() as { task: string; required_capability?: string };
      if (!body.task) return jsonResponse({ error: 'task required' }, 400);

      // Find idle agent with capability
      let bestAgent: Agent | null = null;
      for (const agent of this.agents.values()) {
        if (agent.status === 'idle') {
          if (!body.required_capability || agent.capabilities.includes(body.required_capability)) {
            bestAgent = agent;
            break;
          }
        }
      }

      if (!bestAgent) return jsonResponse({ error: 'No available agent' }, 503);

      bestAgent.status = 'working';
      bestAgent.current_task = body.task;
      await this.state.storage.put('agents', this.agents);

      return jsonResponse({ assigned: true, agent: bestAgent });
    }

    return jsonResponse({ error: 'Unknown operation' }, 404);
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SESSION MANAGER DURABLE OBJECT
// ═══════════════════════════════════════════════════════════════════════════════

interface Session {
  id: string;
  user_id?: string;
  started_at: string;
  last_activity: string;
  data: Record<string, unknown>;
}

export class SessionManager implements DurableObject {
  state: DurableObjectState;
  env: Env;
  session: Session | null = null;
  connections: Map<string, WebSocket> = new Map();

  constructor(state: DurableObjectState, env: Env) {
    this.state = state;
    this.env = env;
    this.state.blockConcurrencyWhile(async () => {
      this.session = await this.state.storage.get('session') || null;
    });
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url);

    // WebSocket for real-time session updates
    if (request.headers.get('Upgrade') === 'websocket') {
      const pair = new WebSocketPair();
      const [client, server] = Object.values(pair);

      server.accept();
      const connectionId = crypto.randomUUID();
      this.connections.set(connectionId, server);

      server.addEventListener('message', async (event) => {
        const data = JSON.parse(event.data as string);
        
        // Handle session updates
        if (data.type === 'update' && this.session) {
          Object.assign(this.session.data, data.data);
          this.session.last_activity = new Date().toISOString();
          await this.state.storage.put('session', this.session);
          
          // Broadcast to all connections
          this.broadcast({ type: 'session_updated', session: this.session });
        }
      });

      server.addEventListener('close', () => {
        this.connections.delete(connectionId);
      });

      return new Response(null, { status: 101, webSocket: client });
    }

    // Get session
    if (url.pathname === '/session' && request.method === 'GET') {
      return jsonResponse(this.session || { error: 'No session' });
    }

    // Create/update session
    if (url.pathname === '/session' && request.method === 'POST') {
      const body = await request.json() as { user_id?: string; data?: Record<string, unknown> };
      
      if (!this.session) {
        this.session = {
          id: crypto.randomUUID(),
          user_id: body.user_id,
          started_at: new Date().toISOString(),
          last_activity: new Date().toISOString(),
          data: body.data || {},
        };
      } else {
        if (body.data) Object.assign(this.session.data, body.data);
        this.session.last_activity = new Date().toISOString();
      }

      await this.state.storage.put('session', this.session);
      this.broadcast({ type: 'session_updated', session: this.session });
      
      return jsonResponse(this.session);
    }

    // Delete session
    if (url.pathname === '/session' && request.method === 'DELETE') {
      await this.state.storage.delete('session');
      this.session = null;
      this.broadcast({ type: 'session_deleted' });
      return jsonResponse({ deleted: true });
    }

    return jsonResponse({ error: 'Unknown operation' }, 404);
  }

  broadcast(message: unknown): void {
    const data = JSON.stringify(message);
    for (const ws of this.connections.values()) {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(data);
      }
    }
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MAIN HANDLER
// ═══════════════════════════════════════════════════════════════════════════════

async function handleRequest(request: Request, env: Env): Promise<Response> {
  const url = new URL(request.url);
  const path = url.pathname;

  // Health check
  if (path === '/' || path === '/health') {
    return jsonResponse({
      status: 'alive',
      type: 'coordinator',
      durable_objects: ['WorkflowOrchestrator', 'AgentCoordinator', 'SessionManager'],
    });
  }

  // Route to Workflow Durable Object
  if (path.startsWith('/workflow/')) {
    const workflowId = url.searchParams.get('id') || 'default';
    const id = env.WORKFLOW.idFromName(workflowId);
    const stub = env.WORKFLOW.get(id);
    const newUrl = new URL(request.url);
    newUrl.pathname = path.replace('/workflow', '');
    return stub.fetch(new Request(newUrl.toString(), request));
  }

  // Route to Agent Durable Object
  if (path.startsWith('/agent/')) {
    const id = env.AGENT.idFromName('coordinator');
    const stub = env.AGENT.get(id);
    const newUrl = new URL(request.url);
    newUrl.pathname = path.replace('/agent', '');
    return stub.fetch(new Request(newUrl.toString(), request));
  }

  // Route to Session Durable Object
  if (path.startsWith('/session/')) {
    const sessionId = url.searchParams.get('id') || request.headers.get('X-Session-ID') || 'default';
    const id = env.SESSION.idFromName(sessionId);
    const stub = env.SESSION.get(id);
    const newUrl = new URL(request.url);
    newUrl.pathname = path.replace('/session', '');
    return stub.fetch(new Request(newUrl.toString(), request));
  }

  return jsonResponse({
    error: 'Not found',
    endpoints: ['/health', '/workflow/*', '/agent/*', '/session/*'],
  }, 404);
}

export default {
  fetch: handleRequest,
};

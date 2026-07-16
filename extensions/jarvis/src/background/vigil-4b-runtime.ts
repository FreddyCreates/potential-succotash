/**
 * VIGIL-4B — Local ~4B agent runtime for Chrome Multi-Swarm IDE
 *
 * This is NOT a trained 4B foundation model shipped in-repo.
 * It is a production agent runtime that:
 *  1. Prefers a local ~3–4B Ollama model (phi3:3.8b, qwen2.5:3b, llama3.2:3b, gemma2:2b)
 *  2. Embeds sub-agent tool routing into multi-swarm / Chrome IDE actions
 *  3. Falls back to a deterministic orchestrator when Ollama is offline
 *
 * Identity: the Chrome agent "brain" that plans, then dispatches sovereign agents.
 */

export type Vigil4BStatus = {
  online: boolean;
  mode: 'ollama' | 'orchestrator' | 'offline';
  model: string;
  preferredModels: string[];
  endpoint: string;
  lastError?: string;
  subAgents: string[];
  capabilities: string[];
};

export type Vigil4BChatResult = {
  success: boolean;
  message: string;
  mode: Vigil4BStatus['mode'];
  model: string;
  actions?: Array<{ tool: string; args: Record<string, unknown>; result?: string }>;
  plan?: string[];
};

const PREFERRED_MODELS = [
  'phi3:3.8b',
  'phi3:mini',
  'qwen2.5:3b',
  'llama3.2:3b',
  'gemma2:2b',
  'tinyllama',
];

const DEFAULT_ENDPOINT = 'http://127.0.0.1:11434';

const SYSTEM_PROMPT = `You are VIGIL-4B, the sovereign Chrome Multi-Swarm Agent IDE brain (v18 commercial).
You control embedded sub-agents and browser tools. Be concise, executive, enterprise-grade.

Embedded sub-agents you may invoke by writing a single JSON line:
{"tool":"deploy_swarm","goal":"..."}
{"tool":"deploy_agent","type":"researcher|scout|crawler|scraper|digest|analyst|monitor","target":"..."}
{"tool":"read_page"}
{"tool":"list_tabs"}
{"tool":"list_agents"}
{"tool":"list_swarms"}
{"tool":"agi_summarize","url":"..."}
{"tool":"agi_scout","url":"..."}
{"tool":"forge_report"}
{"tool":"none"}

Rules:
- Prefer multi-swarm for research / multi-source goals.
- Prefer single scout/crawler for one URL.
- Always answer the human after tools, with a clear executive summary.
- If no tool is needed, use {"tool":"none"}.`;

type ToolDispatcher = {
  deploySwarm: (goal: string) => Promise<string>;
  deployAgent: (type: string, target: string) => Promise<string>;
  readPage: () => Promise<string>;
  listTabs: () => Promise<string>;
  listAgents: () => Promise<string>;
  listSwarms: () => Promise<string>;
  agiSummarize: (url: string) => Promise<string>;
  agiScout: (url: string) => Promise<string>;
  forgeReport: () => Promise<string>;
};

export class Vigil4BRuntime {
  endpoint = DEFAULT_ENDPOINT;
  model = PREFERRED_MODELS[0];
  lastError?: string;
  private history: Array<{ role: 'user' | 'assistant' | 'system'; content: string }> = [];

  constructor(private tools: ToolDispatcher) {}

  get preferredModels() {
    return [...PREFERRED_MODELS];
  }

  async probe(): Promise<Vigil4BStatus> {
    const base: Vigil4BStatus = {
      online: false,
      mode: 'orchestrator',
      model: this.model,
      preferredModels: this.preferredModels,
      endpoint: this.endpoint,
      subAgents: [
        'researcher', 'scout', 'crawler', 'scraper', 'digest',
        'analyst', 'monitor', 'multi-swarm', 'chrome-tabs', 'read-page',
      ],
      capabilities: [
        'local-ollama-4b-class',
        'embedded-sub-agents',
        'multi-swarm-orchestration',
        'chrome-extension-tools',
        'offline-fallback-planner',
      ],
    };

    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), 2500);
      const res = await fetch(this.endpoint + '/api/tags', { signal: ctrl.signal });
      clearTimeout(t);
      if (!res.ok) throw new Error('Ollama HTTP ' + res.status);
      const data = await res.json() as { models?: Array<{ name: string }> };
      const names = (data.models || []).map(m => m.name);
      const match = PREFERRED_MODELS.find(p => names.some(n => n === p || n.startsWith(p.split(':')[0]!)));
      if (match) this.model = names.find(n => n === match || n.startsWith(match.split(':')[0]!)) || match;
      else if (names[0]) this.model = names[0];
      base.online = true;
      base.mode = 'ollama';
      base.model = this.model;
      this.lastError = undefined;
      return base;
    } catch (e) {
      this.lastError = (e as Error).message || String(e);
      base.online = false;
      base.mode = 'orchestrator';
      base.lastError = this.lastError;
      return base;
    }
  }

  async chat(userText: string): Promise<Vigil4BChatResult> {
    const status = await this.probe();
    if (status.mode === 'ollama') {
      try {
        return await this.chatOllama(userText);
      } catch (e) {
        this.lastError = (e as Error).message;
        const fb = await this.chatOrchestrator(userText);
        fb.message = '⚠️ Ollama call failed (' + this.lastError + '). Using embedded orchestrator.\n\n' + fb.message;
        return fb;
      }
    }
    return this.chatOrchestrator(userText);
  }

  private async chatOllama(userText: string): Promise<Vigil4BChatResult> {
    this.history.push({ role: 'user', content: userText });
    const messages = [
      { role: 'system', content: SYSTEM_PROMPT },
      ...this.history.slice(-12),
    ];

    const res = await fetch(this.endpoint + '/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: this.model,
        stream: false,
        messages,
        options: { temperature: 0.4, num_predict: 512 },
      }),
    });
    if (!res.ok) throw new Error('chat HTTP ' + res.status);
    const data = await res.json() as { message?: { content?: string } };
    const raw = (data.message?.content || '').trim();
    const { clean, tool } = this.extractTool(raw);
    const actions: Vigil4BChatResult['actions'] = [];
    let toolNote = '';

    if (tool && tool.tool && tool.tool !== 'none') {
      const result = await this.runTool(tool);
      actions.push({ tool: tool.tool, args: tool, result });
      toolNote = '\n\n── Sub-agent result ──\n' + result;
    }

    const message = (clean || raw || '(empty model response)') + toolNote;
    this.history.push({ role: 'assistant', content: message });
    return {
      success: true,
      message,
      mode: 'ollama',
      model: this.model,
      actions,
    };
  }

  private async chatOrchestrator(userText: string): Promise<Vigil4BChatResult> {
    const t = userText.toLowerCase();
    const plan: string[] = [];
    const actions: Vigil4BChatResult['actions'] = [];
    let message = '';

    // Multi-swarm
    if (/\b(swarm|multi[-\s]?agent|multi[-\s]?swarm|team of agents|deploy (a )?swarm)\b/i.test(userText)) {
      const goal = userText
        .replace(/deploy (a |the )?swarm( on| for| about)?|launch (a |the )?swarm( on| for)?|multi[-\s]?swarm|multi[-\s]?agent/gi, '')
        .replace(/^[\s:,-]+/, '')
        .trim() || userText;
      plan.push('Parse multi-swarm goal', 'Dispatch researcher + scout + digest', 'Return status');
      const result = await this.tools.deploySwarm(goal);
      actions.push({ tool: 'deploy_swarm', args: { goal }, result });
      message = '🐝 **VIGIL-4B Orchestrator** launched multi-swarm.\n\nGoal: ' + goal + '\n\n' + result;
    } else if (/\b(research|investigate|look up|find out about)\b/i.test(t) && !/https?:\/\//i.test(userText)) {
      const topic = userText.replace(/research|investigate|look up|find out about|please|can you/gi, '').trim() || userText;
      plan.push('Deploy researcher sub-agent', 'Queue web sources');
      const result = await this.tools.deployAgent('researcher', topic);
      actions.push({ tool: 'deploy_agent', args: { type: 'researcher', target: topic }, result });
      message = '🔬 Research sub-agent dispatched for **' + topic + '**.\n\n' + result;
    } else if (/\b(scout|crawl|scrape)\b/i.test(t) || /https?:\/\/\S+/i.test(userText)) {
      const urlMatch = userText.match(/https?:\/\/\S+/i);
      const url = urlMatch?.[0] || userText.replace(/scout|crawl|scrape|please/gi, '').trim();
      const kind = /\bcrawl\b/i.test(t) ? 'crawler' : /\bscrape\b/i.test(t) ? 'scraper' : 'scout';
      plan.push('Deploy ' + kind + ' on URL');
      const result = await this.tools.deployAgent(kind, url);
      actions.push({ tool: 'deploy_agent', args: { type: kind, target: url }, result });
      message = '🔭 ' + kind + ' sub-agent on **' + url + '**.\n\n' + result;
    } else if (/\b(read page|summarize (this )?page|what.?s on (this|the) page)\b/i.test(t)) {
      plan.push('Read active tab');
      const result = await this.tools.readPage();
      actions.push({ tool: 'read_page', args: {}, result });
      message = '📄 Active page extract:\n\n' + result;
    } else if (/\b(list tabs|show tabs)\b/i.test(t)) {
      const result = await this.tools.listTabs();
      actions.push({ tool: 'list_tabs', args: {}, result });
      message = result;
    } else if (/\b(list agents|show agents)\b/i.test(t)) {
      const result = await this.tools.listAgents();
      actions.push({ tool: 'list_agents', args: {}, result });
      message = result;
    } else if (/\b(list swarms|show swarms)\b/i.test(t)) {
      const result = await this.tools.listSwarms();
      actions.push({ tool: 'list_swarms', args: {}, result });
      message = result;
    } else if (/\bforge report|synthesize findings\b/i.test(t)) {
      const result = await this.tools.forgeReport();
      actions.push({ tool: 'forge_report', args: {}, result });
      message = result;
    } else {
      plan.push('Executive brief without tool call');
      message =
        '▣ **VIGIL-4B** (embedded orchestrator · no local Ollama model detected)\n\n' +
        'I am the Chrome Multi-Swarm Agent IDE brain. Install Ollama and pull a ~4B model for neural generation:\n' +
        '```\nollama pull phi3:3.8b\n```\n' +
        'Preferred models: ' + PREFERRED_MODELS.slice(0, 4).join(', ') + '.\n\n' +
        '**What I can do now (offline):**\n' +
        '• `deploy a swarm on [topic]` — multi-swarm research team\n' +
        '• `research [topic]` — researcher sub-agent\n' +
        '• `scout https://…` — URL scout\n' +
        '• `read page` / `list tabs` / `list agents` / `forge report`\n\n' +
        'You said: _' + userText.substring(0, 200) + '_\n\n' +
        'Tell me a goal and I will route embedded sub-agents.';
    }

    return {
      success: true,
      message,
      mode: 'orchestrator',
      model: 'vigil-4b-orchestrator',
      actions,
      plan,
    };
  }

  private extractTool(raw: string): { clean: string; tool: Record<string, string> | null } {
    const jsonMatch = raw.match(/\{[\s\S]*?"tool"\s*:\s*"[^"]+"[\s\S]*?\}/);
    if (!jsonMatch) return { clean: raw, tool: null };
    try {
      const tool = JSON.parse(jsonMatch[0]) as Record<string, string>;
      const clean = raw.replace(jsonMatch[0], '').trim();
      return { clean, tool };
    } catch {
      return { clean: raw, tool: null };
    }
  }

  private async runTool(tool: Record<string, string>): Promise<string> {
    switch (tool.tool) {
      case 'deploy_swarm':
        return this.tools.deploySwarm(tool.goal || tool.target || 'general research');
      case 'deploy_agent':
        return this.tools.deployAgent(tool.type || 'researcher', tool.target || tool.goal || '');
      case 'read_page':
        return this.tools.readPage();
      case 'list_tabs':
        return this.tools.listTabs();
      case 'list_agents':
        return this.tools.listAgents();
      case 'list_swarms':
        return this.tools.listSwarms();
      case 'agi_summarize':
        return this.tools.agiSummarize(tool.url || '');
      case 'agi_scout':
        return this.tools.agiScout(tool.url || '');
      case 'forge_report':
        return this.tools.forgeReport();
      default:
        return 'Unknown tool: ' + tool.tool;
    }
  }

  setModel(model: string) {
    if (model?.trim()) this.model = model.trim();
  }

  setEndpoint(endpoint: string) {
    if (endpoint?.trim()) this.endpoint = endpoint.trim().replace(/\/$/, '');
  }

  clearHistory() {
    this.history = [];
  }
}

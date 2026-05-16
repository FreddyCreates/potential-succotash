/**
 * AISDKAdapters — provider adapter registry and request normalization layer.
 * Designed for user-facing extensions and CI copilots that need one stable
 * interface across heterogeneous AI SDK providers.
 */
export class AISDKAdapters {
  constructor() {
    /** @type {Map<string, { providerId: string, modelFamily: string, capabilities: string[], adaptRequest: Function }>} */
    this._adapters = new Map();
    this._seedDefaultAdapters();
  }

  /**
   * Register or override a provider adapter.
   * @param {string} providerId
   * @param {{ modelFamily: string, capabilities: string[], adaptRequest?: Function }} config
   * @returns {{ providerId: string, registered: boolean }}
   */
  registerAdapter(providerId, config = {}) {
    if (!providerId) throw new Error('providerId is required');
    const normalizedId = String(providerId).toLowerCase();

    this._adapters.set(normalizedId, {
      providerId: normalizedId,
      modelFamily: config.modelFamily || 'generic',
      capabilities: Array.isArray(config.capabilities) ? [...config.capabilities] : [],
      adaptRequest:
        typeof config.adaptRequest === 'function'
          ? config.adaptRequest
          : (payload) => this._defaultAdapter(normalizedId, payload),
    });

    return { providerId: normalizedId, registered: true };
  }

  /**
   * Resolve a normalized adapter payload for a provider.
   * @param {string} providerId
   * @param {{ prompt?: string, messages?: Array<object>, model?: string, temperature?: number, maxTokens?: number, tools?: Array<object>, metadata?: object }} payload
   * @returns {{ providerId: string, routeKey: string, request: object }}
   */
  adapt(providerId, payload = {}) {
    const normalizedId = String(providerId || '').toLowerCase();
    const adapter = this._adapters.get(normalizedId);
    if (!adapter) throw new Error(`Unknown adapter: ${providerId}`);

    const request = adapter.adaptRequest(payload);
    return {
      providerId: normalizedId,
      routeKey: `aisdk/${normalizedId}/${adapter.modelFamily}`,
      request,
    };
  }

  /**
   * Suggests the best provider based on requested capabilities.
   * @param {string[]} requiredCapabilities
   * @returns {{ providerId: string, coverage: number } | null}
   */
  routeByCapabilities(requiredCapabilities = []) {
    if (!Array.isArray(requiredCapabilities) || requiredCapabilities.length === 0) {
      return null;
    }

    let best = null;
    for (const adapter of this._adapters.values()) {
      const matched = requiredCapabilities.filter((cap) =>
        adapter.capabilities.includes(cap),
      );
      const coverage = matched.length / requiredCapabilities.length;
      if (!best || coverage > best.coverage) {
        best = { providerId: adapter.providerId, coverage };
      }
    }

    return best;
  }

  /**
   * Returns all registered adapters.
   * @returns {Array<{ providerId: string, modelFamily: string, capabilities: string[] }>}
   */
  listAdapters() {
    return Array.from(this._adapters.values()).map((adapter) => ({
      providerId: adapter.providerId,
      modelFamily: adapter.modelFamily,
      capabilities: [...adapter.capabilities],
    }));
  }

  _seedDefaultAdapters() {
    this.registerAdapter('openai', {
      modelFamily: 'gpt',
      capabilities: ['reasoning', 'code-generation', 'tool-calling', 'vision'],
      adaptRequest: (payload) => ({
        model: payload.model || 'gpt-4o',
        messages: payload.messages || this._messagesFromPrompt(payload.prompt),
        temperature: payload.temperature ?? 0.2,
        max_tokens: payload.maxTokens ?? 2048,
        tools: payload.tools || [],
        metadata: payload.metadata || {},
      }),
    });

    this.registerAdapter('anthropic', {
      modelFamily: 'claude',
      capabilities: ['analysis', 'summarization', 'safety', 'tool-calling'],
      adaptRequest: (payload) => ({
        model: payload.model || 'claude-3-5-sonnet-latest',
        messages: payload.messages || this._messagesFromPrompt(payload.prompt),
        temperature: payload.temperature ?? 0.2,
        max_tokens: payload.maxTokens ?? 2048,
        tools: payload.tools || [],
        metadata: payload.metadata || {},
      }),
    });

    this.registerAdapter('google', {
      modelFamily: 'gemini',
      capabilities: ['multimodal', 'reasoning', 'search-grounding', 'vision'],
      adaptRequest: (payload) => ({
        model: payload.model || 'gemini-1.5-pro',
        contents: payload.messages || this._messagesFromPrompt(payload.prompt),
        generationConfig: {
          temperature: payload.temperature ?? 0.2,
          maxOutputTokens: payload.maxTokens ?? 2048,
        },
        tools: payload.tools || [],
        metadata: payload.metadata || {},
      }),
    });

    this.registerAdapter('github-copilot', {
      modelFamily: 'copilot',
      capabilities: ['code-generation', 'refactoring', 'ci-assist', 'pull-request-review'],
      adaptRequest: (payload) => ({
        model: payload.model || 'copilot-default',
        task: payload.metadata?.task || 'ci-pilot-embodied',
        prompt: payload.prompt || '',
        messages: payload.messages || this._messagesFromPrompt(payload.prompt),
        temperature: payload.temperature ?? 0.1,
        max_tokens: payload.maxTokens ?? 1600,
        tools: payload.tools || [],
        metadata: payload.metadata || {},
      }),
    });
  }

  _messagesFromPrompt(prompt) {
    if (!prompt) return [];
    return [{ role: 'user', content: prompt }];
  }

  _defaultAdapter(providerId, payload) {
    return {
      provider: providerId,
      model: payload.model || 'default',
      prompt: payload.prompt || '',
      messages: payload.messages || this._messagesFromPrompt(payload.prompt),
      temperature: payload.temperature ?? 0.2,
      max_tokens: payload.maxTokens ?? 1024,
      tools: payload.tools || [],
      metadata: payload.metadata || {},
    };
  }
}

export default AISDKAdapters;

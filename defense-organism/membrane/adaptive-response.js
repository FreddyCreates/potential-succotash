/**
 * Adaptive Response Generator - Dark Layer Defense
 * 
 * Generates context-aware responses to detected threats.
 * Uses phi-mathematics to create unpredictable defensive patterns.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Response strategies
 */
const RESPONSE_STRATEGIES = {
  'allow': {
    description: 'Allow request to proceed',
    actions: ['pass-through', 'monitor'],
    riskThreshold: 0.3
  },
  'observe': {
    description: 'Allow but increase monitoring',
    actions: ['pass-through', 'shadow-track', 'fingerprint'],
    riskThreshold: 0.5
  },
  'challenge': {
    description: 'Request additional verification',
    actions: ['captcha', 'js-challenge', 'proof-of-work', 'rate-limit'],
    riskThreshold: 0.7
  },
  'deceive': {
    description: 'Return deceptive response',
    actions: ['honeypot', 'tarpit', 'fake-data', 'redirect'],
    riskThreshold: 0.8
  },
  'block': {
    description: 'Deny request',
    actions: ['403', 'drop', 'blackhole', 'ban'],
    riskThreshold: 0.9
  }
};

/**
 * Response templates
 */
const RESPONSE_TEMPLATES = {
  'honeypot': {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    bodyGenerator: (ctx) => JSON.stringify({
      success: true,
      data: {
        id: Math.floor(Math.random() * 1000000),
        secret: crypto.randomUUID(),
        admin_token: `fake_${crypto.randomUUID().slice(0, 16)}`,
        api_key: `sk_test_${crypto.randomUUID().slice(0, 24)}`
      }
    })
  },
  
  'tarpit': {
    statusCode: 200,
    delay: () => 5000 + Math.random() * 10000, // 5-15 seconds
    headers: { 'Content-Type': 'text/html' },
    bodyGenerator: () => '<!DOCTYPE html><html><head><meta http-equiv="refresh" content="30"></head><body>Loading...</body></html>'
  },
  
  'fake-data': {
    statusCode: 200,
    headers: { 'Content-Type': 'application/json' },
    bodyGenerator: (ctx) => {
      const items = [];
      for (let i = 0; i < 100; i++) {
        items.push({
          id: i,
          email: `user${i}@example.com`,
          name: `User ${i}`,
          phone: `555-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
        });
      }
      return JSON.stringify({ data: items, total: 1000000 });
    }
  },
  
  'captcha': {
    statusCode: 403,
    headers: { 'Content-Type': 'text/html' },
    bodyGenerator: () => `
      <!DOCTYPE html>
      <html>
      <head><title>Verification Required</title></head>
      <body>
        <h1>Human Verification Required</h1>
        <p>Please complete the challenge below:</p>
        <form method="POST">
          <div class="captcha">[CAPTCHA CHALLENGE]</div>
          <button type="submit">Verify</button>
        </form>
      </body>
      </html>
    `
  },
  
  'js-challenge': {
    statusCode: 200,
    headers: { 'Content-Type': 'text/html' },
    bodyGenerator: (ctx) => {
      const challenge = Math.floor(Math.random() * 1000000);
      return `
        <!DOCTYPE html>
        <html>
        <head>
          <script>
            (function() {
              var c = ${challenge};
              var h = 0;
              for(var i = 0; i < c; i++) { h += i; }
              document.cookie = 'verified=' + h + '; path=/';
              location.reload();
            })();
          </script>
        </head>
        <body>Verifying...</body>
        </html>
      `;
    }
  },
  
  'proof-of-work': {
    statusCode: 429,
    headers: { 
      'Content-Type': 'application/json',
      'Retry-After': '5'
    },
    bodyGenerator: (ctx) => JSON.stringify({
      error: 'proof_of_work_required',
      challenge: crypto.randomUUID(),
      difficulty: 4,
      algorithm: 'sha256',
      instructions: 'Find a nonce such that SHA256(challenge + nonce) has difficulty leading zeros'
    })
  },
  
  '403': {
    statusCode: 403,
    headers: { 'Content-Type': 'text/plain' },
    bodyGenerator: () => 'Access Denied'
  },
  
  '429': {
    statusCode: 429,
    headers: { 
      'Content-Type': 'text/plain',
      'Retry-After': '60'
    },
    bodyGenerator: () => 'Too Many Requests'
  }
};

/**
 * Adaptive Response Generator
 */
export class AdaptiveResponseGenerator {
  constructor(config = {}) {
    this.config = {
      defaultStrategy: config.defaultStrategy || 'observe',
      enableDeception: config.enableDeception !== false,
      adaptiveTiming: config.adaptiveTiming !== false,
      phiModulation: config.phiModulation !== false,
      ...config
    };
    
    // Response history for pattern analysis
    this.history = [];
    
    // Agent-specific response tracking
    this.agentResponses = new Map();
    
    // Statistics
    this.stats = {
      totalResponses: 0,
      byStrategy: {},
      byAction: {},
      avgResponseTime: 0
    };
  }
  
  /**
   * Generate adaptive response
   */
  async generate(analysis, classification, context = {}) {
    const startTime = Date.now();
    this.stats.totalResponses++;
    
    // Determine strategy based on risk score
    const strategy = this.selectStrategy(analysis.riskScore, classification);
    
    // Select specific action within strategy
    const action = this.selectAction(strategy, analysis, classification, context);
    
    // Generate response
    const response = await this.buildResponse(action, analysis, classification, context);
    
    // Apply phi-modulation if enabled
    if (this.config.phiModulation) {
      response.timing = this.phiModulateTiming(response.timing || 0, analysis);
    }
    
    // Track response
    this.trackResponse(analysis, classification, strategy, action, response);
    
    // Update stats
    const responseTime = Date.now() - startTime;
    this.stats.avgResponseTime = (this.stats.avgResponseTime * 0.9) + (responseTime * 0.1);
    
    return response;
  }
  
  /**
   * Select response strategy
   */
  selectStrategy(riskScore, classification) {
    // Special handling for known categories
    if (classification.category === 'search-bot' && classification.confidence > 0.9) {
      return 'allow';
    }
    
    if (classification.category === 'malicious' && classification.confidence > 0.8) {
      return this.config.enableDeception ? 'deceive' : 'block';
    }
    
    // Risk-based selection
    for (const [strategy, config] of Object.entries(RESPONSE_STRATEGIES)) {
      if (riskScore <= config.riskThreshold) {
        return strategy;
      }
    }
    
    return 'block';
  }
  
  /**
   * Select specific action within strategy
   */
  selectAction(strategy, analysis, classification, context) {
    const strategyConfig = RESPONSE_STRATEGIES[strategy];
    const actions = strategyConfig.actions;
    
    // Get history for this agent
    const agentId = context.agentId || classification.fingerprint;
    const agentHistory = this.agentResponses.get(agentId) || [];
    
    // Avoid repeating the same action
    const recentActions = agentHistory.slice(-5).map(h => h.action);
    
    // Filter out recently used actions
    let availableActions = actions.filter(a => !recentActions.includes(a));
    if (availableActions.length === 0) {
      availableActions = actions;
    }
    
    // Select action based on analysis
    if (strategy === 'deceive') {
      // For deception, vary tactics
      if (analysis.tags?.includes('scraper')) {
        return 'fake-data';
      }
      if (analysis.tags?.includes('scanner')) {
        return 'tarpit';
      }
      if (analysis.tags?.includes('credential-stuffer')) {
        return 'honeypot';
      }
    }
    
    if (strategy === 'challenge') {
      // Choose challenge based on client capabilities
      if (classification.features?.behavior?.jsEnabled) {
        return 'js-challenge';
      }
      return 'captcha';
    }
    
    // Random selection with phi weighting
    const index = Math.floor(availableActions.length * THRESHOLD);
    return availableActions[index] || availableActions[0];
  }
  
  /**
   * Build response object
   */
  async buildResponse(action, analysis, classification, context) {
    const template = RESPONSE_TEMPLATES[action];
    
    if (template) {
      const ctx = { analysis, classification, context };
      
      return {
        action,
        statusCode: template.statusCode,
        headers: { ...template.headers },
        body: template.bodyGenerator(ctx),
        timing: typeof template.delay === 'function' ? template.delay() : 0
      };
    }
    
    // Default pass-through response
    if (action === 'pass-through') {
      return {
        action: 'pass-through',
        statusCode: null, // Continue to origin
        headers: {},
        body: null,
        timing: 0
      };
    }
    
    // Monitor action
    if (action === 'monitor') {
      return {
        action: 'monitor',
        statusCode: null,
        headers: {
          'X-Monitored': 'true'
        },
        body: null,
        timing: 0,
        flags: ['track', 'fingerprint']
      };
    }
    
    // Shadow track
    if (action === 'shadow-track') {
      return {
        action: 'shadow-track',
        statusCode: null,
        headers: {},
        body: null,
        timing: 0,
        flags: ['shadow-session', 'deep-track']
      };
    }
    
    // Rate limit
    if (action === 'rate-limit') {
      return {
        action: 'rate-limit',
        statusCode: 429,
        headers: {
          'Content-Type': 'text/plain',
          'Retry-After': String(Math.ceil(60 * PHI))
        },
        body: 'Rate limit exceeded',
        timing: 0
      };
    }
    
    // Drop (no response)
    if (action === 'drop') {
      return {
        action: 'drop',
        statusCode: null,
        drop: true,
        timing: 0
      };
    }
    
    // Blackhole (infinite delay)
    if (action === 'blackhole') {
      return {
        action: 'blackhole',
        statusCode: null,
        timing: Infinity,
        drop: true
      };
    }
    
    // Ban (block + add to blocklist)
    if (action === 'ban') {
      return {
        action: 'ban',
        statusCode: 403,
        headers: { 'Content-Type': 'text/plain' },
        body: 'Banned',
        flags: ['add-to-blocklist'],
        banDuration: 86400000 // 24 hours
      };
    }
    
    // Redirect
    if (action === 'redirect') {
      return {
        action: 'redirect',
        statusCode: 302,
        headers: {
          'Location': '/honeypot'
        },
        body: null,
        timing: 0
      };
    }
    
    // Default block
    return {
      action: 'block',
      statusCode: 403,
      headers: { 'Content-Type': 'text/plain' },
      body: 'Forbidden',
      timing: 0
    };
  }
  
  /**
   * Apply phi-modulated timing
   */
  phiModulateTiming(baseTiming, analysis) {
    // Add unpredictable delays based on phi
    const phiJitter = (Math.sin(Date.now() / HB * PHI) + 1) / 2;
    const riskMultiplier = 1 + analysis.riskScore * PHI;
    
    return baseTiming * riskMultiplier + (phiJitter * 100);
  }
  
  /**
   * Track response for pattern learning
   */
  trackResponse(analysis, classification, strategy, action, response) {
    const entry = {
      timestamp: Date.now(),
      riskScore: analysis.riskScore,
      classification: classification.category,
      strategy,
      action,
      statusCode: response.statusCode
    };
    
    // Add to global history
    this.history.push(entry);
    if (this.history.length > 10000) {
      this.history.shift();
    }
    
    // Add to agent-specific history
    const agentId = classification.fingerprint || crypto.randomUUID();
    if (!this.agentResponses.has(agentId)) {
      this.agentResponses.set(agentId, []);
    }
    this.agentResponses.get(agentId).push(entry);
    
    // Cleanup old agent entries
    if (this.agentResponses.size > 10000) {
      const oldestKey = this.agentResponses.keys().next().value;
      this.agentResponses.delete(oldestKey);
    }
    
    // Update stats
    this.stats.byStrategy[strategy] = (this.stats.byStrategy[strategy] || 0) + 1;
    this.stats.byAction[action] = (this.stats.byAction[action] || 0) + 1;
  }
  
  /**
   * Execute response
   */
  async execute(response) {
    // Apply timing delay
    if (response.timing && response.timing > 0 && response.timing < Infinity) {
      await new Promise(resolve => setTimeout(resolve, response.timing));
    }
    
    // Drop connection
    if (response.drop) {
      return null;
    }
    
    // Build HTTP response
    return new Response(response.body, {
      status: response.statusCode || 200,
      headers: response.headers || {}
    });
  }
  
  /**
   * Get response statistics
   */
  getStats() {
    return {
      ...this.stats,
      historySize: this.history.length,
      trackedAgents: this.agentResponses.size,
      effectivenessMetrics: this.computeEffectiveness()
    };
  }
  
  /**
   * Compute response effectiveness
   */
  computeEffectiveness() {
    if (this.history.length < 100) {
      return { insufficient_data: true };
    }
    
    // Calculate effectiveness by strategy
    const byStrategy = {};
    for (const [strategy] of Object.entries(RESPONSE_STRATEGIES)) {
      const strategyEntries = this.history.filter(h => h.strategy === strategy);
      if (strategyEntries.length > 0) {
        // Measure if agent continued after response
        const continuedCount = 0; // Would need follow-up tracking
        byStrategy[strategy] = {
          count: strategyEntries.length,
          avgRiskScore: strategyEntries.reduce((sum, e) => sum + e.riskScore, 0) / strategyEntries.length
        };
      }
    }
    
    return byStrategy;
  }
}

export default AdaptiveResponseGenerator;

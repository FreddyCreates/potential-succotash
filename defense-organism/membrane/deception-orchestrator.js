/**
 * Deception Orchestrator - Dark Layer Active Defense
 * 
 * Orchestrates deceptive responses including honeypots, tarpits,
 * fake data generation, and misdirection strategies.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Deception strategies
 */
export const DECEPTION_STRATEGIES = {
  HONEYPOT: 'honeypot',         // Attractive fake targets
  TARPIT: 'tarpit',             // Slow responses
  FAKE_DATA: 'fake-data',       // Plausible fake information
  MISDIRECTION: 'misdirection', // Redirect to decoys
  CONFUSION: 'confusion',       // Inconsistent responses
  MIRROR: 'mirror'              // Reflect attack patterns back
};

/**
 * Deception contexts
 */
export const DECEPTION_CONTEXTS = {
  API: 'api',
  ADMIN: 'admin',
  AUTH: 'auth',
  DATA: 'data',
  FILE: 'file',
  CONFIG: 'config'
};

/**
 * Fake data generators
 */
const FAKE_GENERATORS = {
  /**
   * Generate fake user data
   */
  user: () => {
    const firstNames = ['John', 'Jane', 'Michael', 'Sarah', 'David', 'Emily'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Davis'];
    const domains = ['gmail.com', 'yahoo.com', 'outlook.com', 'company.com'];
    
    const first = firstNames[Math.floor(Math.random() * firstNames.length)];
    const last = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    return {
      id: Math.floor(Math.random() * 1000000),
      firstName: first,
      lastName: last,
      email: `${first.toLowerCase()}.${last.toLowerCase()}@${domains[Math.floor(Math.random() * domains.length)]}`,
      phone: `+1-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 900 + 100)}-${Math.floor(Math.random() * 9000 + 1000)}`,
      created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString()
    };
  },
  
  /**
   * Generate fake API key
   */
  apiKey: () => {
    const prefixes = ['sk', 'pk', 'api', 'key'];
    const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
    return `${prefix}_honeypot_${crypto.randomUUID().replace(/-/g, '')}`;
  },
  
  /**
   * Generate fake credentials (for honeypot)
   */
  credentials: () => ({
    username: `admin_${Math.floor(Math.random() * 1000)}`,
    password: `honeypot_trap_${crypto.randomUUID().slice(0, 8)}`,
    token: `hp_${crypto.randomUUID()}`,
    note: 'This is a honeypot credential - any use triggers alerts'
  }),
  
  /**
   * Generate fake config
   */
  config: () => ({
    database: {
      host: 'honeypot-db.internal',
      port: 5432,
      name: 'production_trap',
      user: 'admin',
      password: `trap_${crypto.randomUUID().slice(0, 12)}`
    },
    api: {
      key: FAKE_GENERATORS.apiKey(),
      secret: crypto.randomUUID()
    },
    aws: {
      accessKeyId: `AKIA${crypto.randomUUID().slice(0, 16).toUpperCase()}`,
      secretAccessKey: crypto.randomUUID() + crypto.randomUUID()
    }
  }),
  
  /**
   * Generate fake financial data
   */
  financial: () => ({
    accountNumber: Math.floor(Math.random() * 9000000000 + 1000000000).toString(),
    routingNumber: Math.floor(Math.random() * 900000000 + 100000000).toString(),
    balance: (Math.random() * 100000).toFixed(2),
    creditCard: {
      number: `4${Math.floor(Math.random() * 1000000000000000).toString().padStart(15, '0')}`,
      expiry: `${Math.floor(Math.random() * 12 + 1).toString().padStart(2, '0')}/${Math.floor(Math.random() * 5 + 24)}`,
      cvv: Math.floor(Math.random() * 900 + 100).toString()
    }
  }),
  
  /**
   * Generate fake server info
   */
  serverInfo: () => ({
    hostname: `prod-${Math.floor(Math.random() * 100)}.internal`,
    ip: `10.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`,
    os: 'Ubuntu 22.04 LTS',
    kernel: '5.15.0-generic',
    uptime: Math.floor(Math.random() * 1000000),
    services: ['nginx', 'postgresql', 'redis', 'node'],
    sshKey: `ssh-rsa AAAA${crypto.randomUUID().replace(/-/g, '')}... honeypot@trap`
  })
};

/**
 * Deception Campaign
 */
export class DeceptionCampaign {
  constructor(strategy, context, config = {}) {
    this.id = crypto.randomUUID();
    this.strategy = strategy;
    this.context = context;
    this.config = config;
    
    this.created = Date.now();
    this.state = {
      triggers: 0,
      interactions: [],
      capturedData: [],
      effectiveness: 0
    };
  }
  
  /**
   * Generate deceptive response
   */
  generate(request) {
    this.state.triggers++;
    
    switch (this.strategy) {
      case DECEPTION_STRATEGIES.HONEYPOT:
        return this.generateHoneypot(request);
      case DECEPTION_STRATEGIES.TARPIT:
        return this.generateTarpit(request);
      case DECEPTION_STRATEGIES.FAKE_DATA:
        return this.generateFakeData(request);
      case DECEPTION_STRATEGIES.MISDIRECTION:
        return this.generateMisdirection(request);
      case DECEPTION_STRATEGIES.CONFUSION:
        return this.generateConfusion(request);
      case DECEPTION_STRATEGIES.MIRROR:
        return this.generateMirror(request);
      default:
        return this.generateHoneypot(request);
    }
  }
  
  /**
   * Generate honeypot response
   */
  generateHoneypot(request) {
    const generators = {
      [DECEPTION_CONTEXTS.API]: () => ({
        success: true,
        api_key: FAKE_GENERATORS.apiKey(),
        endpoints: ['/api/admin', '/api/users', '/api/config'],
        documentation: 'https://docs.honeypot.internal'
      }),
      
      [DECEPTION_CONTEXTS.ADMIN]: () => ({
        admin: true,
        role: 'superadmin',
        permissions: ['read', 'write', 'delete', 'admin'],
        ...FAKE_GENERATORS.credentials()
      }),
      
      [DECEPTION_CONTEXTS.AUTH]: () => ({
        authenticated: true,
        token: `hp_jwt_${crypto.randomUUID()}`,
        expires: Date.now() + 86400000,
        user: FAKE_GENERATORS.user()
      }),
      
      [DECEPTION_CONTEXTS.DATA]: () => ({
        data: Array(10).fill(null).map(() => FAKE_GENERATORS.user()),
        total: 10000,
        page: 1
      }),
      
      [DECEPTION_CONTEXTS.CONFIG]: () => FAKE_GENERATORS.config(),
      
      [DECEPTION_CONTEXTS.FILE]: () => ({
        files: [
          { name: 'backup.sql', size: 1024000, modified: Date.now() - 86400000 },
          { name: '.env', size: 512, modified: Date.now() - 3600000 },
          { name: 'credentials.txt', size: 128, modified: Date.now() }
        ]
      })
    };
    
    const generator = generators[this.context] || generators[DECEPTION_CONTEXTS.API];
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Honeypot-ID': this.id.slice(0, 8)
      },
      body: JSON.stringify(generator()),
      delay: Math.random() * 100 + 50,
      flags: ['honeypot-triggered', 'capture-interaction']
    };
  }
  
  /**
   * Generate tarpit response
   */
  generateTarpit(request) {
    // Extremely slow response
    const baseDelay = 5000;
    const phiDelay = baseDelay * PHI;
    const randomDelay = Math.random() * phiDelay;
    const totalDelay = baseDelay + randomDelay;
    
    // Generate partial content that encourages waiting
    const partialContent = `
<!DOCTYPE html>
<html>
<head>
  <title>Loading...</title>
  <meta http-equiv="refresh" content="${Math.ceil(totalDelay / 1000)}">
</head>
<body>
  <h1>Please wait...</h1>
  <p>Loading secure content...</p>
  <progress max="100" value="${Math.floor(Math.random() * 30)}"></progress>
  <!-- This is a tarpit response designed to waste attacker time -->
</body>
</html>
    `.trim();
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'text/html',
        'Transfer-Encoding': 'chunked',
        'Connection': 'keep-alive'
      },
      body: partialContent,
      delay: totalDelay,
      streaming: true,
      flags: ['tarpit-triggered']
    };
  }
  
  /**
   * Generate fake data response
   */
  generateFakeData(request) {
    const path = request.path || '';
    
    let data;
    
    if (path.includes('user') || path.includes('customer')) {
      data = Array(100).fill(null).map(() => FAKE_GENERATORS.user());
    } else if (path.includes('finance') || path.includes('payment')) {
      data = Array(50).fill(null).map(() => FAKE_GENERATORS.financial());
    } else if (path.includes('server') || path.includes('infra')) {
      data = Array(20).fill(null).map(() => FAKE_GENERATORS.serverInfo());
    } else {
      data = Array(100).fill(null).map(() => ({
        id: Math.floor(Math.random() * 1000000),
        data: crypto.randomUUID(),
        timestamp: Date.now() - Math.random() * 86400000
      }));
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'X-Total-Count': '1000000',
        'X-Page': '1',
        'Link': '</api/data?page=2>; rel="next"'
      },
      body: JSON.stringify({
        data,
        pagination: {
          total: 1000000,
          page: 1,
          perPage: data.length,
          hasMore: true
        }
      }),
      delay: Math.random() * 200 + 100,
      flags: ['fake-data-served']
    };
  }
  
  /**
   * Generate misdirection response
   */
  generateMisdirection(request) {
    const decoyEndpoints = [
      '/api/v2/admin/users',
      '/internal/config',
      '/debug/console',
      '/backup/latest',
      '/admin/dashboard'
    ];
    
    const redirect = decoyEndpoints[Math.floor(Math.random() * decoyEndpoints.length)];
    
    return {
      statusCode: 302,
      headers: {
        'Location': redirect,
        'X-Redirect-Reason': 'load-balancing'
      },
      body: null,
      delay: 50,
      flags: ['misdirection-triggered']
    };
  }
  
  /**
   * Generate confusion response
   */
  generateConfusion(request) {
    // Randomly vary response characteristics
    const responses = [
      { statusCode: 200, body: { success: true } },
      { statusCode: 403, body: { error: 'Forbidden' } },
      { statusCode: 404, body: { error: 'Not found' } },
      { statusCode: 500, body: { error: 'Internal error' } },
      { statusCode: 200, body: { data: [] } },
      { statusCode: 429, body: { error: 'Rate limited' } }
    ];
    
    const response = responses[Math.floor(Math.random() * responses.length)];
    
    return {
      statusCode: response.statusCode,
      headers: {
        'Content-Type': 'application/json',
        'X-Request-ID': crypto.randomUUID()
      },
      body: JSON.stringify(response.body),
      delay: Math.random() * 1000, // Highly variable timing
      flags: ['confusion-response']
    };
  }
  
  /**
   * Generate mirror response
   */
  generateMirror(request) {
    // Reflect back information about the request
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        reflected: {
          path: request.path,
          method: request.method,
          headers: request.headers,
          ip: request.ip,
          timestamp: Date.now()
        },
        message: 'Your request has been logged and analyzed'
      }),
      delay: 100,
      flags: ['mirror-response', 'psychological-pressure']
    };
  }
  
  /**
   * Record interaction
   */
  recordInteraction(request, response) {
    this.state.interactions.push({
      timestamp: Date.now(),
      requestPath: request.path,
      requestMethod: request.method,
      responseCode: response.statusCode,
      strategy: this.strategy
    });
    
    // Capture any submitted data
    if (request.body) {
      this.state.capturedData.push({
        timestamp: Date.now(),
        type: 'body',
        data: request.body
      });
    }
    
    // Trim old interactions
    if (this.state.interactions.length > 1000) {
      this.state.interactions = this.state.interactions.slice(-1000);
    }
  }
  
  /**
   * Get campaign statistics
   */
  getStats() {
    return {
      id: this.id,
      strategy: this.strategy,
      context: this.context,
      created: this.created,
      triggers: this.state.triggers,
      interactions: this.state.interactions.length,
      capturedData: this.state.capturedData.length,
      effectiveness: this.computeEffectiveness()
    };
  }
  
  /**
   * Compute effectiveness score
   */
  computeEffectiveness() {
    if (this.state.triggers === 0) return 0;
    
    // Effectiveness based on engagement
    const engagementRate = this.state.interactions.length / this.state.triggers;
    const dataCapture = this.state.capturedData.length > 0 ? 0.3 : 0;
    
    return Math.min(1, engagementRate + dataCapture);
  }
}

/**
 * Deception Orchestrator
 */
export class DeceptionOrchestrator {
  constructor(config = {}) {
    this.config = {
      maxCampaigns: config.maxCampaigns || 100,
      defaultStrategy: config.defaultStrategy || DECEPTION_STRATEGIES.HONEYPOT,
      enableCapture: config.enableCapture !== false,
      ...config
    };
    
    this.campaigns = new Map();
    this.contextCampaigns = new Map(); // Context -> Campaign mapping
    
    this.stats = {
      totalTriggers: 0,
      totalCaptures: 0,
      activeCampaigns: 0
    };
    
    // Initialize default campaigns
    this.initializeDefaultCampaigns();
  }
  
  /**
   * Initialize default deception campaigns
   */
  initializeDefaultCampaigns() {
    // Admin honeypot
    this.createCampaign(DECEPTION_STRATEGIES.HONEYPOT, DECEPTION_CONTEXTS.ADMIN);
    
    // API tarpit
    this.createCampaign(DECEPTION_STRATEGIES.TARPIT, DECEPTION_CONTEXTS.API);
    
    // Data fake generator
    this.createCampaign(DECEPTION_STRATEGIES.FAKE_DATA, DECEPTION_CONTEXTS.DATA);
    
    // Auth honeypot
    this.createCampaign(DECEPTION_STRATEGIES.HONEYPOT, DECEPTION_CONTEXTS.AUTH);
    
    // Config honeypot
    this.createCampaign(DECEPTION_STRATEGIES.HONEYPOT, DECEPTION_CONTEXTS.CONFIG);
  }
  
  /**
   * Create a new deception campaign
   */
  createCampaign(strategy, context, config = {}) {
    const campaign = new DeceptionCampaign(strategy, context, config);
    
    this.campaigns.set(campaign.id, campaign);
    this.contextCampaigns.set(context, campaign);
    this.stats.activeCampaigns++;
    
    return campaign;
  }
  
  /**
   * Execute deception for a request
   */
  execute(request, context = null) {
    // Determine context from request if not provided
    if (!context) {
      context = this.inferContext(request);
    }
    
    // Get campaign for context
    let campaign = this.contextCampaigns.get(context);
    
    if (!campaign) {
      // Create ad-hoc campaign
      campaign = new DeceptionCampaign(this.config.defaultStrategy, context);
    }
    
    // Generate response
    const response = campaign.generate(request);
    
    // Record interaction if capture enabled
    if (this.config.enableCapture) {
      campaign.recordInteraction(request, response);
      
      if (request.body) {
        this.stats.totalCaptures++;
      }
    }
    
    this.stats.totalTriggers++;
    
    return response;
  }
  
  /**
   * Infer context from request
   */
  inferContext(request) {
    const path = (request.path || '').toLowerCase();
    
    if (path.includes('admin') || path.includes('dashboard')) {
      return DECEPTION_CONTEXTS.ADMIN;
    }
    if (path.includes('auth') || path.includes('login') || path.includes('token')) {
      return DECEPTION_CONTEXTS.AUTH;
    }
    if (path.includes('config') || path.includes('.env') || path.includes('settings')) {
      return DECEPTION_CONTEXTS.CONFIG;
    }
    if (path.includes('file') || path.includes('upload') || path.includes('download')) {
      return DECEPTION_CONTEXTS.FILE;
    }
    if (path.includes('user') || path.includes('data') || path.includes('export')) {
      return DECEPTION_CONTEXTS.DATA;
    }
    
    return DECEPTION_CONTEXTS.API;
  }
  
  /**
   * Get captured data
   */
  getCapturedData() {
    const allCaptures = [];
    
    for (const campaign of this.campaigns.values()) {
      for (const capture of campaign.state.capturedData) {
        allCaptures.push({
          campaignId: campaign.id,
          strategy: campaign.strategy,
          context: campaign.context,
          ...capture
        });
      }
    }
    
    return allCaptures.sort((a, b) => b.timestamp - a.timestamp);
  }
  
  /**
   * Get orchestrator statistics
   */
  getStats() {
    const campaignStats = [];
    
    for (const campaign of this.campaigns.values()) {
      campaignStats.push(campaign.getStats());
    }
    
    return {
      ...this.stats,
      campaigns: campaignStats,
      mostEffective: campaignStats.sort((a, b) => 
        b.effectiveness - a.effectiveness
      ).slice(0, 5)
    };
  }
}

export default DeceptionOrchestrator;

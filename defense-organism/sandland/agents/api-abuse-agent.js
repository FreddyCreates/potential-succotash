/**
 * API Abuse Agent - Dark Layer Adversarial Agent
 * 
 * Simulates API abuse patterns: enumeration, scraping, rate limit bypass.
 * Tests the organism's ability to detect abusive API usage.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * API abuse techniques
 */
const ABUSE_TECHNIQUES = {
  'enumeration': {
    description: 'ID enumeration attacks',
    endpoints: [
      '/api/users/{id}',
      '/api/orders/{id}',
      '/api/invoices/{id}',
      '/api/documents/{id}',
      '/api/accounts/{id}'
    ],
    idGenerator: (i) => i
  },
  
  'scraping': {
    description: 'Bulk data extraction',
    endpoints: [
      '/api/products',
      '/api/listings',
      '/api/catalog',
      '/api/search',
      '/api/feed'
    ],
    paginationParams: ['page', 'offset', 'cursor', 'limit', 'skip']
  },
  
  'rate-bypass': {
    description: 'Rate limit bypass techniques',
    techniques: [
      'header-rotation',
      'ip-rotation',
      'endpoint-variation',
      'timing-jitter',
      'request-splitting'
    ]
  },
  
  'business-logic': {
    description: 'Business logic abuse',
    scenarios: [
      'coupon-stacking',
      'referral-abuse',
      'trial-extension',
      'free-tier-abuse',
      'inventory-manipulation'
    ]
  },
  
  'data-harvesting': {
    description: 'Systematic data collection',
    targets: [
      'emails',
      'phone-numbers',
      'addresses',
      'pricing',
      'user-metadata'
    ]
  }
};

/**
 * API key patterns
 */
const API_KEY_PATTERNS = [
  'sk_test_{random}',
  'pk_live_{random}',
  'api_{random}',
  'key_{random}',
  '{service}_key_{random}'
];

/**
 * API Abuse Agent
 */
export class APIAbuseAgent {
  constructor(config = {}) {
    this.id = `api-abuse-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxRequests: config.maxRequests || 5000,
      techniques: config.techniques || Object.keys(ABUSE_TECHNIQUES),
      parallelism: config.parallelism || 10,
      adaptiveEvasion: config.adaptiveEvasion !== false,
      targetDomain: config.targetDomain || 'target.local',
      ...config
    };
    
    this.state = {
      requests: 0,
      extractedData: [],
      enumeratedIDs: new Set(),
      rateLimitEvents: 0,
      blockedRequests: 0,
      currentTechnique: null,
      techniqueStats: {},
      discoveredEndpoints: [],
      apiKeys: [],
      phase: 'reconnaissance'
    };
    
    // Initialize technique stats
    for (const tech of this.config.techniques) {
      this.state.techniqueStats[tech] = {
        attempts: 0,
        successes: 0,
        blocks: 0
      };
    }
    
    this.currentEnumId = 1;
    this.currentPage = 1;
  }
  
  /**
   * Generate next abuse request
   */
  async nextRequest() {
    this.state.requests++;
    
    // Select technique
    const technique = this.selectTechnique();
    this.state.currentTechnique = technique;
    this.state.techniqueStats[technique].attempts++;
    
    // Generate request based on technique
    let request;
    switch (technique) {
      case 'enumeration':
        request = this.generateEnumerationRequest();
        break;
      case 'scraping':
        request = this.generateScrapingRequest();
        break;
      case 'rate-bypass':
        request = this.generateRateBypassRequest();
        break;
      case 'business-logic':
        request = this.generateBusinessLogicRequest();
        break;
      case 'data-harvesting':
        request = this.generateDataHarvestingRequest();
        break;
      default:
        request = this.generateEnumerationRequest();
    }
    
    return request;
  }
  
  /**
   * Select technique (weighted by success rate)
   */
  selectTechnique() {
    if (this.state.requests < 50 || !this.config.adaptiveEvasion) {
      // Random selection in early phase
      return this.config.techniques[
        Math.floor(Math.random() * this.config.techniques.length)
      ];
    }
    
    // Weighted selection based on success rate
    const weights = this.config.techniques.map(tech => {
      const stats = this.state.techniqueStats[tech];
      if (stats.attempts === 0) return 1;
      return (stats.successes / stats.attempts) + 0.1;
    });
    
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    let random = Math.random() * totalWeight;
    
    for (let i = 0; i < this.config.techniques.length; i++) {
      random -= weights[i];
      if (random <= 0) return this.config.techniques[i];
    }
    
    return this.config.techniques[0];
  }
  
  /**
   * Generate enumeration request
   */
  generateEnumerationRequest() {
    const endpoints = ABUSE_TECHNIQUES.enumeration.endpoints;
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    
    // Sequential or random ID
    let id;
    if (Math.random() > 0.3) {
      id = this.currentEnumId++;
    } else {
      // Try common IDs
      id = [1, 100, 1000, 10000, 0, -1, 999999][
        Math.floor(Math.random() * 7)
      ];
    }
    
    const path = endpoint.replace('{id}', id);
    
    return {
      url: `https://${this.config.targetDomain}${path}`,
      method: 'GET',
      headers: this.buildHeaders('enumeration'),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        technique: 'enumeration',
        targetId: id,
        endpoint,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate scraping request
   */
  generateScrapingRequest() {
    const endpoints = ABUSE_TECHNIQUES.scraping.endpoints;
    const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
    const params = ABUSE_TECHNIQUES.scraping.paginationParams;
    const param = params[Math.floor(Math.random() * params.length)];
    
    const pageValue = this.currentPage++;
    const limitValue = [10, 25, 50, 100, 500, 1000][
      Math.floor(Math.random() * 6)
    ];
    
    const queryParams = new URLSearchParams();
    queryParams.set(param, pageValue);
    queryParams.set('limit', limitValue);
    
    // Add sorting to get different data
    if (Math.random() > 0.5) {
      queryParams.set('sort', ['created_at', 'updated_at', 'name', 'id'][
        Math.floor(Math.random() * 4)
      ]);
      queryParams.set('order', ['asc', 'desc'][Math.floor(Math.random() * 2)]);
    }
    
    return {
      url: `https://${this.config.targetDomain}${endpoint}?${queryParams}`,
      method: 'GET',
      headers: this.buildHeaders('scraping'),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        technique: 'scraping',
        page: pageValue,
        limit: limitValue,
        endpoint,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate rate bypass request
   */
  generateRateBypassRequest() {
    const techniques = ABUSE_TECHNIQUES['rate-bypass'].techniques;
    const bypassTechnique = techniques[Math.floor(Math.random() * techniques.length)];
    
    const headers = this.buildHeaders('rate-bypass');
    
    // Apply bypass technique
    switch (bypassTechnique) {
      case 'header-rotation':
        headers['X-Forwarded-For'] = `${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
        headers['X-Real-IP'] = headers['X-Forwarded-For'];
        headers['X-Client-IP'] = headers['X-Forwarded-For'];
        headers['True-Client-IP'] = headers['X-Forwarded-For'];
        break;
        
      case 'endpoint-variation':
        // Vary endpoint casing or add trailing slash
        break;
        
      case 'timing-jitter':
        // Would add random delays in real scenario
        break;
        
      case 'request-splitting':
        headers['Transfer-Encoding'] = 'chunked';
        break;
    }
    
    return {
      url: `https://${this.config.targetDomain}/api/data`,
      method: 'GET',
      headers,
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        technique: 'rate-bypass',
        bypassMethod: bypassTechnique,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate business logic abuse request
   */
  generateBusinessLogicRequest() {
    const scenarios = ABUSE_TECHNIQUES['business-logic'].scenarios;
    const scenario = scenarios[Math.floor(Math.random() * scenarios.length)];
    
    let path, method, body;
    
    switch (scenario) {
      case 'coupon-stacking':
        path = '/api/cart/apply-coupon';
        method = 'POST';
        body = {
          coupons: ['SAVE10', 'DISCOUNT20', 'FREE50'],
          applyAll: true
        };
        break;
        
      case 'referral-abuse':
        path = '/api/referral/apply';
        method = 'POST';
        body = {
          referralCode: `REF${Math.floor(Math.random() * 1000000)}`,
          selfRefer: true
        };
        break;
        
      case 'trial-extension':
        path = '/api/subscription/trial';
        method = 'POST';
        body = {
          extend: true,
          newEmail: `test${Math.random()}@temp.com`
        };
        break;
        
      case 'free-tier-abuse':
        path = '/api/usage/reset';
        method = 'POST';
        body = {
          resetCounter: true,
          newPeriod: true
        };
        break;
        
      case 'inventory-manipulation':
        path = '/api/cart/reserve';
        method = 'POST';
        body = {
          items: Array(100).fill({ sku: 'LIMITED001', quantity: 1 })
        };
        break;
        
      default:
        path = '/api/abuse';
        method = 'GET';
        body = null;
    }
    
    return {
      url: `https://${this.config.targetDomain}${path}`,
      method,
      headers: this.buildHeaders('business-logic'),
      body: body ? JSON.stringify(body) : undefined,
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        technique: 'business-logic',
        scenario,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Generate data harvesting request
   */
  generateDataHarvestingRequest() {
    const targets = ABUSE_TECHNIQUES['data-harvesting'].targets;
    const target = targets[Math.floor(Math.random() * targets.length)];
    
    const paths = {
      'emails': '/api/users?fields=email&limit=1000',
      'phone-numbers': '/api/contacts?include=phone',
      'addresses': '/api/orders?fields=shipping_address',
      'pricing': '/api/products?fields=price,cost,margin',
      'user-metadata': '/api/users?include=all&expand=true'
    };
    
    const path = paths[target] || '/api/data';
    
    return {
      url: `https://${this.config.targetDomain}${path}`,
      method: 'GET',
      headers: this.buildHeaders('data-harvesting'),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        technique: 'data-harvesting',
        target,
        phase: this.state.phase
      }
    };
  }
  
  /**
   * Build headers with evasion
   */
  buildHeaders(technique) {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (compatible; DataBot/1.0; +https://example.com)',
      'python-requests/2.31.0',
      'axios/1.6.0',
      'PostmanRuntime/7.35.0'
    ];
    
    const headers = {
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
      'Accept': 'application/json',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate',
      'Connection': 'keep-alive'
    };
    
    // Add API key if discovered
    if (this.state.apiKeys.length > 0) {
      const key = this.state.apiKeys[Math.floor(Math.random() * this.state.apiKeys.length)];
      headers['Authorization'] = `Bearer ${key}`;
    }
    
    // Add technique-specific headers
    if (technique === 'scraping') {
      headers['X-Requested-With'] = 'XMLHttpRequest';
    }
    
    return headers;
  }
  
  /**
   * Process response
   */
  async processResponse(response) {
    const status = response.status;
    const technique = this.state.currentTechnique;
    const stats = this.state.techniqueStats[technique];
    
    // Track success
    if (status === 200) {
      stats.successes++;
      
      const body = await response.json?.().catch(() => ({})) || {};
      
      // Extract data based on technique
      if (technique === 'enumeration' && body.id) {
        this.state.enumeratedIDs.add(body.id);
      }
      
      if (technique === 'scraping' && Array.isArray(body.data || body.items || body)) {
        const items = body.data || body.items || body;
        this.state.extractedData.push(...items);
      }
      
      if (technique === 'data-harvesting') {
        this.state.extractedData.push(body);
      }
      
      // Look for API keys in response
      const bodyStr = JSON.stringify(body);
      const keyMatch = bodyStr.match(/(sk_|pk_|api_)[a-zA-Z0-9]{20,}/);
      if (keyMatch && !this.state.apiKeys.includes(keyMatch[0])) {
        this.state.apiKeys.push(keyMatch[0]);
      }
    }
    
    // Track rate limiting
    if (status === 429) {
      this.state.rateLimitEvents++;
      stats.blocks++;
      this.state.phase = 'throttled';
    }
    
    // Track blocks
    if (status === 403) {
      this.state.blockedRequests++;
      stats.blocks++;
    }
    
    // Update phase
    this.updatePhase();
  }
  
  /**
   * Update phase based on state
   */
  updatePhase() {
    if (this.state.requests < 100) {
      this.state.phase = 'reconnaissance';
    } else if (this.state.extractedData.length > 1000) {
      this.state.phase = 'extraction';
    } else if (this.state.rateLimitEvents > 10) {
      this.state.phase = 'throttled';
    } else if (this.state.blockedRequests > this.state.requests * 0.5) {
      this.state.phase = 'blocked';
    } else {
      this.state.phase = 'active-abuse';
    }
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return (
      this.state.requests < this.config.maxRequests &&
      this.state.phase !== 'blocked'
    );
  }
  
  /**
   * Get agent state
   */
  getState() {
    return {
      id: this.id,
      type: 'api-abuse',
      requests: this.state.requests,
      extractedDataCount: this.state.extractedData.length,
      enumeratedIDs: this.state.enumeratedIDs.size,
      rateLimitEvents: this.state.rateLimitEvents,
      blockedRequests: this.state.blockedRequests,
      discoveredAPIKeys: this.state.apiKeys.length,
      techniqueStats: Object.fromEntries(
        Object.entries(this.state.techniqueStats).map(([tech, stats]) => [
          tech,
          {
            ...stats,
            successRate: stats.attempts > 0 
              ? ((stats.successes / stats.attempts) * 100).toFixed(1) + '%'
              : 'N/A'
          }
        ])
      ),
      phase: this.state.phase,
      progress: this.state.requests / this.config.maxRequests
    };
  }
}

export default APIAbuseAgent;

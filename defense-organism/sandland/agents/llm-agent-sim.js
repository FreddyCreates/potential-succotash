/**
 * LLM Agent Simulator - Synthetic Agent
 * 
 * Simulates AI-powered reconnaissance and mapping behavior.
 * Mimics how LLM-based agents explore and map target systems.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * LLM-style user agents
 */
const LLM_USER_AGENTS = [
  'Mozilla/5.0 (compatible; GPTBot/1.0; +https://openai.com/gptbot)',
  'Mozilla/5.0 (compatible; ChatGPT-User/1.0; +https://openai.com/bot)',
  'Mozilla/5.0 (compatible; Claude-Web/1.0; +https://anthropic.com)',
  'Mozilla/5.0 (compatible; Bard/1.0; +https://bard.google.com)',
  'Mozilla/5.0 AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36',
  'Mozilla/5.0 (compatible; Perplexity/1.0; +https://perplexity.ai)',
  'Mozilla/5.0 (compatible; YouBot/1.0; +https://you.com)',
  'Mozilla/5.0 (compatible; research-agent/1.0)'
];

/**
 * LLM exploration patterns - more semantic, less bruteforce
 */
const EXPLORATION_PATTERNS = [
  // API discovery
  { path: '/api', description: 'API root' },
  { path: '/api/v1', description: 'API version 1' },
  { path: '/api/v2', description: 'API version 2' },
  { path: '/graphql', description: 'GraphQL endpoint' },
  { path: '/api/openapi.json', description: 'OpenAPI spec' },
  { path: '/swagger.json', description: 'Swagger spec' },
  { path: '/.well-known/ai-plugin.json', description: 'AI plugin manifest' },
  
  // Documentation
  { path: '/docs', description: 'Documentation' },
  { path: '/api/docs', description: 'API documentation' },
  { path: '/readme', description: 'README' },
  { path: '/help', description: 'Help page' },
  { path: '/faq', description: 'FAQ' },
  
  // Authentication endpoints
  { path: '/auth', description: 'Auth endpoint' },
  { path: '/oauth', description: 'OAuth endpoint' },
  { path: '/api/auth/session', description: 'Session info' },
  { path: '/api/me', description: 'Current user' },
  { path: '/api/user', description: 'User endpoint' },
  
  // Data endpoints
  { path: '/api/data', description: 'Data endpoint' },
  { path: '/api/search', description: 'Search endpoint' },
  { path: '/api/query', description: 'Query endpoint' },
  { path: '/api/chat', description: 'Chat endpoint' },
  { path: '/api/completions', description: 'Completions' },
  
  // Sitemap and structure
  { path: '/sitemap.xml', description: 'Sitemap' },
  { path: '/robots.txt', description: 'Robots' },
  { path: '/.well-known/', description: 'Well-known' },
  
  // Common pages for context
  { path: '/about', description: 'About page' },
  { path: '/pricing', description: 'Pricing page' },
  { path: '/contact', description: 'Contact page' },
  { path: '/terms', description: 'Terms of service' },
  { path: '/privacy', description: 'Privacy policy' }
];

/**
 * LLM Agent Simulator - AI-Powered Reconnaissance
 */
export class LLMAgentSim {
  constructor(config = {}) {
    this.id = `llm-agent-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxRequests: config.maxRequests || 500,
      thinkTime: config.thinkTime || { min: 2000, max: 8000 }, // LLMs are slower
      contextWindow: config.contextWindow || 10,
      followLinks: config.followLinks !== false,
      ...config
    };
    
    this.state = {
      requestCount: 0,
      lastRequest: null,
      discoveredEndpoints: [],
      siteMap: new Map(),
      context: [],
      understanding: {
        apiStyle: null,
        authRequired: false,
        technologies: new Set(),
        dataTypes: new Set()
      },
      phase: 'discovery'
    };
    
    this.explorationQueue = [...EXPLORATION_PATTERNS];
    this.currentIndex = 0;
  }
  
  /**
   * Generate next request with LLM-style reasoning
   */
  async nextRequest() {
    // Simulate "thinking" delay
    await this.think();
    
    const pattern = this.getNextPattern();
    const ua = this.getUA();
    
    this.state.requestCount++;
    this.state.lastRequest = Date.now();
    
    // Add context from previous responses
    const headers = {
      'User-Agent': ua,
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Cache-Control': 'no-cache'
    };
    
    // LLM agents often include referrer from previous page
    if (this.state.context.length > 0) {
      const lastVisited = this.state.context[this.state.context.length - 1];
      headers['Referer'] = `https://target.local${lastVisited.path}`;
    }
    
    return {
      url: `https://target.local${pattern.path}`,
      method: 'GET',
      headers,
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: this.state.phase,
        intent: pattern.description,
        contextSize: this.state.context.length,
        understanding: this.state.understanding
      }
    };
  }
  
  /**
   * Process response and update understanding
   */
  async processResponse(response) {
    const status = response.status;
    const headers = response.headers;
    const body = await response.text?.() || '';
    
    // Update context window
    this.state.context.push({
      path: new URL(response.url).pathname,
      status,
      timestamp: Date.now()
    });
    
    // Trim context to window size
    if (this.state.context.length > this.config.contextWindow) {
      this.state.context.shift();
    }
    
    // Analyze response for understanding
    this.analyzeResponse(response.url, status, headers, body);
    
    // If successful, add to sitemap
    if (status === 200) {
      this.state.discoveredEndpoints.push(response.url);
      this.state.siteMap.set(new URL(response.url).pathname, {
        status,
        contentType: headers?.get?.('content-type'),
        discovered: Date.now()
      });
      
      // Extract and queue new paths if following links
      if (this.config.followLinks) {
        this.extractAndQueuePaths(body);
      }
    }
    
    // Update phase based on understanding
    this.updatePhase();
  }
  
  /**
   * Analyze response to build understanding
   */
  analyzeResponse(url, status, headers, body) {
    const path = new URL(url).pathname;
    
    // Detect API style
    if (body.includes('openapi') || body.includes('swagger')) {
      this.state.understanding.apiStyle = 'REST/OpenAPI';
    }
    if (body.includes('__schema') || body.includes('graphql')) {
      this.state.understanding.apiStyle = 'GraphQL';
    }
    
    // Detect auth requirements
    if (status === 401 || status === 403) {
      this.state.understanding.authRequired = true;
    }
    
    // Detect technologies
    const serverHeader = headers?.get?.('server') || '';
    if (serverHeader) this.state.understanding.technologies.add(serverHeader);
    
    const poweredBy = headers?.get?.('x-powered-by') || '';
    if (poweredBy) this.state.understanding.technologies.add(poweredBy);
    
    // Content analysis
    if (body.includes('React') || body.includes('_next')) {
      this.state.understanding.technologies.add('React/Next.js');
    }
    if (body.includes('Vue') || body.includes('__vue')) {
      this.state.understanding.technologies.add('Vue.js');
    }
    if (body.includes('workers.dev') || body.includes('cloudflare')) {
      this.state.understanding.technologies.add('Cloudflare Workers');
    }
    
    // Data type detection
    const contentType = headers?.get?.('content-type') || '';
    if (contentType.includes('json')) {
      this.state.understanding.dataTypes.add('JSON API');
    }
    if (contentType.includes('html')) {
      this.state.understanding.dataTypes.add('HTML');
    }
  }
  
  /**
   * Extract paths from HTML/JSON and queue for exploration
   */
  extractAndQueuePaths(body) {
    // Extract href attributes
    const hrefPattern = /href=["']([^"']+)["']/g;
    let match;
    while ((match = hrefPattern.exec(body)) !== null) {
      const path = match[1];
      if (path.startsWith('/') && !this.state.siteMap.has(path)) {
        this.explorationQueue.push({ path, description: 'Discovered link' });
      }
    }
    
    // Extract API paths from JSON
    const apiPattern = /"(\/api[^"]+)"/g;
    while ((match = apiPattern.exec(body)) !== null) {
      const path = match[1];
      if (!this.state.siteMap.has(path)) {
        this.explorationQueue.push({ path, description: 'Discovered API endpoint' });
      }
    }
  }
  
  /**
   * Simulate LLM "thinking" time
   */
  async think() {
    const { min, max } = this.config.thinkTime;
    const delay = min + Math.random() * (max - min);
    // In simulation, we don't actually wait
    return Promise.resolve();
  }
  
  /**
   * Get next exploration pattern
   */
  getNextPattern() {
    if (this.currentIndex >= this.explorationQueue.length) {
      // Generate semantic variations based on understanding
      this.generateSmartPatterns();
    }
    
    const pattern = this.explorationQueue[this.currentIndex] || { path: '/', description: 'Fallback' };
    this.currentIndex++;
    return pattern;
  }
  
  /**
   * Generate smart patterns based on discovered structure
   */
  generateSmartPatterns() {
    const newPatterns = [];
    
    // If we found API v1, try v2, v3
    if (this.state.siteMap.has('/api/v1')) {
      newPatterns.push({ path: '/api/v2', description: 'Version extrapolation' });
      newPatterns.push({ path: '/api/v3', description: 'Version extrapolation' });
    }
    
    // If we found /users, try related resources
    if (this.state.siteMap.has('/api/users')) {
      newPatterns.push({ path: '/api/users/me', description: 'Self reference' });
      newPatterns.push({ path: '/api/users/1', description: 'ID enumeration' });
      newPatterns.push({ path: '/api/posts', description: 'Related resource' });
      newPatterns.push({ path: '/api/comments', description: 'Related resource' });
    }
    
    this.explorationQueue.push(...newPatterns);
  }
  
  /**
   * Get user agent
   */
  getUA() {
    return LLM_USER_AGENTS[Math.floor(Math.random() * LLM_USER_AGENTS.length)];
  }
  
  /**
   * Update exploration phase
   */
  updatePhase() {
    const discoveryRate = this.state.discoveredEndpoints.length / this.state.requestCount;
    
    if (this.state.requestCount < 10) {
      this.state.phase = 'initial-scan';
    } else if (discoveryRate > 0.5) {
      this.state.phase = 'active-mapping';
    } else if (this.state.understanding.authRequired) {
      this.state.phase = 'auth-probing';
    } else {
      this.state.phase = 'deep-exploration';
    }
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return this.state.requestCount < this.config.maxRequests &&
           this.currentIndex < this.explorationQueue.length;
  }
  
  /**
   * Get agent state summary
   */
  getState() {
    return {
      id: this.id,
      type: 'llm-agent',
      requestCount: this.state.requestCount,
      discoveredEndpoints: this.state.discoveredEndpoints.length,
      siteMapSize: this.state.siteMap.size,
      understanding: {
        apiStyle: this.state.understanding.apiStyle,
        authRequired: this.state.understanding.authRequired,
        technologies: Array.from(this.state.understanding.technologies),
        dataTypes: Array.from(this.state.understanding.dataTypes)
      },
      phase: this.state.phase,
      progress: this.state.requestCount / this.config.maxRequests
    };
  }
}

export default LLMAgentSim;

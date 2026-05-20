/**
 * Scanner Bot - Synthetic Agent
 * 
 * Simulates reconnaissance scanner behavior for Sandland testing.
 * Performs path enumeration, technology fingerprinting, and vulnerability scanning.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Common scanner user agents
 */
const SCANNER_USER_AGENTS = [
  'Mozilla/5.0 (compatible; Nmap Scripting Engine)',
  'python-requests/2.28.0',
  'curl/7.68.0',
  'Go-http-client/1.1',
  'sqlmap/1.6',
  'nikto/2.1.6',
  'Wget/1.21',
  'Java/11.0.2',
  'Ruby',
  'Perl'
];

/**
 * Common scan paths
 */
const SCAN_PATHS = [
  // Admin discovery
  '/admin', '/administrator', '/wp-admin', '/admin.php',
  '/login', '/signin', '/auth', '/dashboard',
  
  // Config files
  '/.env', '/config.php', '/wp-config.php', '/config.json',
  '/.git/config', '/.svn/entries', '/web.config',
  
  // Backup files
  '/backup.sql', '/backup.zip', '/db.sql', '/dump.sql',
  '/backup', '/backups', '/old', '/archive',
  
  // Common vulnerabilities
  '/../../../etc/passwd', '/..%2f..%2f..%2fetc/passwd',
  '/api/v1/users', '/api/debug', '/api/admin',
  '/phpinfo.php', '/info.php', '/test.php',
  
  // Technology fingerprinting
  '/robots.txt', '/sitemap.xml', '/humans.txt',
  '/favicon.ico', '/crossdomain.xml', '/.well-known/',
  
  // CMS detection
  '/wp-includes/', '/wp-content/', '/xmlrpc.php',
  '/joomla.xml', '/administrator/manifests/',
  '/drupal.js', '/sites/default/',
  
  // Framework detection  
  '/rails/info', '/debug/default/view',
  '/__debug__/', '/telescope/', '/horizon/'
];

/**
 * Scanner Bot - Simulated Reconnaissance Scanner
 */
export class ScannerBot {
  /**
   * Create scanner bot
   * @param {Object} config - Bot configuration
   */
  constructor(config = {}) {
    this.id = `scanner-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxRequests: config.maxRequests || 1000,
      rotateUA: config.rotateUA !== false,
      rotateIP: config.rotateIP !== false,
      delay: config.delay || { min: 1000, max: 5000 },
      ...config
    };
    
    this.state = {
      requestCount: 0,
      lastRequest: null,
      discoveredPaths: [],
      responseCodes: new Map(),
      technologies: new Set(),
      phase: 'discovery'
    };
    
    // Shuffle paths for randomness
    this.pathQueue = this.shuffleArray([...SCAN_PATHS]);
    this.currentPathIndex = 0;
  }
  
  /**
   * Generate next request
   * @returns {Object} - Request configuration
   */
  async nextRequest() {
    const path = this.getNextPath();
    const ua = this.getUA();
    const ip = this.getIP();
    
    this.state.requestCount++;
    this.state.lastRequest = Date.now();
    
    return {
      url: `https://target.local${path}`,
      method: 'GET',
      headers: {
        'User-Agent': ua,
        'Accept': '*/*',
        'Accept-Language': 'en-US,en;q=0.9',
        'X-Forwarded-For': ip,
        'Connection': 'close'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: this.state.phase,
        pathIndex: this.currentPathIndex,
        scanType: this.classifyPath(path)
      }
    };
  }
  
  /**
   * Process response and update state
   * @param {Object} response - Response from target
   */
  async processResponse(response) {
    const status = response.status;
    
    // Track response codes
    const count = this.state.responseCodes.get(status) || 0;
    this.state.responseCodes.set(status, count + 1);
    
    // Analyze response for discoveries
    if (status === 200) {
      this.state.discoveredPaths.push(response.url);
      
      // Technology detection from response
      const body = await response.text?.() || '';
      this.detectTechnologies(body, response.headers);
    }
    
    // Update phase based on progress
    this.updatePhase();
  }
  
  /**
   * Check if bot should continue
   * @returns {boolean}
   */
  shouldContinue() {
    return this.state.requestCount < this.config.maxRequests &&
           this.currentPathIndex < this.pathQueue.length;
  }
  
  /**
   * Get next path to scan
   * @returns {string}
   */
  getNextPath() {
    if (this.currentPathIndex >= this.pathQueue.length) {
      // Generate variations of discovered paths
      this.generatePathVariations();
    }
    
    const path = this.pathQueue[this.currentPathIndex] || '/';
    this.currentPathIndex++;
    return path;
  }
  
  /**
   * Get user agent (optionally rotated)
   * @returns {string}
   */
  getUA() {
    if (!this.config.rotateUA) {
      return SCANNER_USER_AGENTS[0];
    }
    return SCANNER_USER_AGENTS[Math.floor(Math.random() * SCANNER_USER_AGENTS.length)];
  }
  
  /**
   * Generate fake IP (for simulation)
   * @returns {string}
   */
  getIP() {
    if (!this.config.rotateIP) {
      return '192.168.1.100';
    }
    // Generate random IP in various ranges
    const ranges = [
      () => `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      () => `10.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
      () => `172.${16 + Math.floor(Math.random() * 16)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`
    ];
    return ranges[Math.floor(Math.random() * ranges.length)]();
  }
  
  /**
   * Classify path type
   * @param {string} path
   * @returns {string}
   */
  classifyPath(path) {
    if (path.includes('admin') || path.includes('login')) return 'admin-discovery';
    if (path.includes('.env') || path.includes('config')) return 'config-exposure';
    if (path.includes('backup') || path.includes('.sql')) return 'backup-discovery';
    if (path.includes('..')) return 'path-traversal';
    if (path.includes('wp-') || path.includes('joomla') || path.includes('drupal')) return 'cms-detection';
    return 'general-scan';
  }
  
  /**
   * Detect technologies from response
   * @param {string} body - Response body
   * @param {Headers} headers - Response headers
   */
  detectTechnologies(body, headers) {
    // Server header
    const server = headers?.get?.('server') || '';
    if (server) this.state.technologies.add(`server:${server}`);
    
    // X-Powered-By
    const poweredBy = headers?.get?.('x-powered-by') || '';
    if (poweredBy) this.state.technologies.add(`powered-by:${poweredBy}`);
    
    // Body analysis
    if (body.includes('WordPress')) this.state.technologies.add('cms:wordpress');
    if (body.includes('Joomla')) this.state.technologies.add('cms:joomla');
    if (body.includes('Drupal')) this.state.technologies.add('cms:drupal');
    if (body.includes('React')) this.state.technologies.add('framework:react');
    if (body.includes('Vue')) this.state.technologies.add('framework:vue');
    if (body.includes('Angular')) this.state.technologies.add('framework:angular');
  }
  
  /**
   * Generate path variations based on discoveries
   */
  generatePathVariations() {
    const variations = [];
    
    for (const path of this.state.discoveredPaths) {
      // Add variations
      variations.push(`${path}/`);
      variations.push(`${path}.bak`);
      variations.push(`${path}.old`);
      variations.push(`${path}~`);
    }
    
    this.pathQueue.push(...variations);
  }
  
  /**
   * Update scanning phase based on progress
   */
  updatePhase() {
    const progress = this.state.requestCount / this.config.maxRequests;
    
    if (progress < 0.25) {
      this.state.phase = 'discovery';
    } else if (progress < 0.5) {
      this.state.phase = 'mapping';
    } else if (progress < 0.75) {
      this.state.phase = 'probing';
    } else {
      this.state.phase = 'exploitation';
    }
  }
  
  /**
   * Shuffle array using Fisher-Yates
   * @param {Array} array
   * @returns {Array}
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
   * Get bot state summary
   * @returns {Object}
   */
  getState() {
    return {
      id: this.id,
      requestCount: this.state.requestCount,
      discoveredPaths: this.state.discoveredPaths.length,
      technologies: Array.from(this.state.technologies),
      responseCodes: Object.fromEntries(this.state.responseCodes),
      phase: this.state.phase,
      progress: this.state.requestCount / this.config.maxRequests
    };
  }
}

export default ScannerBot;

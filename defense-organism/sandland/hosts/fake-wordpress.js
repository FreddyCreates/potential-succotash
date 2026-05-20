/**
 * Fake WordPress - Synthetic Host
 * 
 * Simulates a WordPress installation for Sandland testing.
 * Provides realistic responses to common WordPress attack vectors.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;

/**
 * WordPress version to simulate
 */
const WP_VERSION = '6.4.2';

/**
 * Common WordPress endpoints and responses
 */
const WP_ENDPOINTS = {
  '/': {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'X-Powered-By': 'PHP/8.1.0',
      'X-Pingback': '/xmlrpc.php'
    },
    body: `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="generator" content="WordPress ${WP_VERSION}">
<title>Welcome | My WordPress Site</title>
<link rel="stylesheet" href="/wp-content/themes/twentytwentyfour/style.css">
</head>
<body class="home blog">
<div id="page">
<header><h1>My WordPress Site</h1></header>
<main><article><h2>Hello World</h2><p>Welcome to WordPress.</p></article></main>
<footer>Powered by WordPress</footer>
</div>
<script src="/wp-includes/js/jquery/jquery.min.js"></script>
</body>
</html>`
  },
  
  '/wp-login.php': {
    status: 200,
    headers: {
      'Content-Type': 'text/html; charset=UTF-8',
      'X-Powered-By': 'PHP/8.1.0'
    },
    body: `<!DOCTYPE html>
<html lang="en-US">
<head>
<meta name="robots" content="noindex,noarchive,nofollow">
<title>Log In &lsaquo; My WordPress Site</title>
<link rel="stylesheet" href="/wp-admin/css/login.min.css">
</head>
<body class="login">
<div id="login">
<h1><a href="https://wordpress.org/">WordPress</a></h1>
<form name="loginform" id="loginform" action="/wp-login.php" method="post">
<p><label for="user_login">Username or Email</label>
<input type="text" name="log" id="user_login"></p>
<p><label for="user_pass">Password</label>
<input type="password" name="pwd" id="user_pass"></p>
<p class="submit"><input type="submit" name="wp-submit" value="Log In"></p>
</form>
</div>
</body>
</html>`
  },
  
  '/xmlrpc.php': {
    status: 200,
    headers: {
      'Content-Type': 'text/xml; charset=UTF-8',
      'X-Powered-By': 'PHP/8.1.0'
    },
    body: `<?xml version="1.0" encoding="UTF-8"?>
<methodResponse>
<fault>
<value><struct>
<member><name>faultCode</name><value><int>-32700</int></value></member>
<member><name>faultString</name><value><string>parse error. not well formed</string></value></member>
</struct></value>
</fault>
</methodResponse>`
  },
  
  '/wp-json/': {
    status: 200,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      name: 'My WordPress Site',
      description: 'Just another WordPress site',
      url: 'https://example.com',
      home: 'https://example.com',
      gmt_offset: '0',
      timezone_string: 'UTC',
      namespaces: ['oembed/1.0', 'wp/v2'],
      authentication: [],
      routes: {}
    })
  },
  
  '/wp-json/wp/v2/users': {
    status: 401,
    headers: {
      'Content-Type': 'application/json; charset=UTF-8'
    },
    body: JSON.stringify({
      code: 'rest_cannot_access',
      message: 'Only authenticated users can access the User endpoint.',
      data: { status: 401 }
    })
  },
  
  '/robots.txt': {
    status: 200,
    headers: { 'Content-Type': 'text/plain' },
    body: `User-agent: *
Disallow: /wp-admin/
Allow: /wp-admin/admin-ajax.php

Sitemap: /sitemap.xml`
  },
  
  '/wp-includes/version.php': {
    status: 403,
    headers: { 'Content-Type': 'text/html' },
    body: '<h1>Forbidden</h1>'
  },
  
  '/wp-config.php': {
    status: 200,
    headers: { 'Content-Type': 'text/html' },
    body: ''  // Empty response (proper security)
  },
  
  '/wp-admin/': {
    status: 302,
    headers: {
      'Location': '/wp-login.php?redirect_to=%2Fwp-admin%2F',
      'Content-Type': 'text/html'
    },
    body: ''
  },
  
  '/.env': {
    status: 404,
    headers: { 'Content-Type': 'text/html' },
    body: '<h1>Not Found</h1>'
  },
  
  '/.git/config': {
    status: 404,
    headers: { 'Content-Type': 'text/html' },
    body: '<h1>Not Found</h1>'
  }
};

/**
 * Fake WordPress Host
 */
export class FakeWordPress {
  constructor(config = {}) {
    this.config = {
      version: config.version || WP_VERSION,
      delay: config.delay || { min: 50, max: 200 },
      ...config
    };
    
    this.endpoints = new Map();
    this.metrics = {
      requests: 0,
      byPath: new Map(),
      byMethod: new Map(),
      attackAttempts: 0
    };
    
    // Register default endpoints
    for (const [path, handler] of Object.entries(WP_ENDPOINTS)) {
      this.endpoints.set(path, handler);
    }
  }
  
  /**
   * Handle incoming request
   * @param {Object} request - Request object
   * @returns {Object} - Response object
   */
  async handle(request) {
    const url = new URL(request.url, 'http://localhost');
    const path = url.pathname;
    const method = request.method || 'GET';
    
    // Track metrics
    this.metrics.requests++;
    this.metrics.byPath.set(path, (this.metrics.byPath.get(path) || 0) + 1);
    this.metrics.byMethod.set(method, (this.metrics.byMethod.get(method) || 0) + 1);
    
    // Check for attack patterns
    if (this.isAttackPattern(path, request)) {
      this.metrics.attackAttempts++;
    }
    
    // Simulate processing delay
    await this.delay();
    
    // Find matching endpoint
    const handler = this.findHandler(path);
    
    if (handler) {
      return this.createResponse(handler);
    }
    
    // Default 404
    return this.createResponse({
      status: 404,
      headers: { 'Content-Type': 'text/html' },
      body: '<h1>Not Found</h1><p>The requested URL was not found on this server.</p>'
    });
  }
  
  /**
   * Find handler for path
   * @param {string} path
   * @returns {Object|null}
   */
  findHandler(path) {
    // Exact match
    if (this.endpoints.has(path)) {
      return this.endpoints.get(path);
    }
    
    // Prefix match for directories
    for (const [endpoint, handler] of this.endpoints) {
      if (path.startsWith(endpoint.replace(/\/$/, ''))) {
        return handler;
      }
    }
    
    // Pattern matching for dynamic paths
    if (path.startsWith('/wp-content/')) {
      return {
        status: 200,
        headers: { 'Content-Type': 'text/css' },
        body: '/* WordPress content */'
      };
    }
    
    if (path.startsWith('/wp-includes/')) {
      return {
        status: 200,
        headers: { 'Content-Type': 'application/javascript' },
        body: '/* WordPress includes */'
      };
    }
    
    return null;
  }
  
  /**
   * Check if request matches attack pattern
   * @param {string} path
   * @param {Object} request
   * @returns {boolean}
   */
  isAttackPattern(path, request) {
    const patterns = [
      /\.\.\//, // Path traversal
      /\.env/, // Config exposure
      /\.git/, // Git exposure
      /\.svn/, // SVN exposure
      /backup/i, // Backup discovery
      /config\.php/i, // Config files
      /\.sql/i, // SQL dumps
      /xmlrpc\.php.*pingback/i // XMLRPC abuse
    ];
    
    return patterns.some(p => p.test(path));
  }
  
  /**
   * Create response object
   * @param {Object} handler
   * @returns {Object}
   */
  createResponse(handler) {
    return {
      status: handler.status,
      headers: new Map(Object.entries(handler.headers || {})),
      body: handler.body,
      text: async () => handler.body,
      json: async () => {
        try {
          return JSON.parse(handler.body);
        } catch {
          return null;
        }
      }
    };
  }
  
  /**
   * Simulate processing delay
   */
  async delay() {
    const { min, max } = this.config.delay;
    const ms = min + Math.random() * (max - min);
    await new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Register custom endpoint
   * @param {string} path
   * @param {Object} handler
   */
  registerEndpoint(path, handler) {
    this.endpoints.set(path, handler);
  }
  
  /**
   * Get host metrics
   * @returns {Object}
   */
  getMetrics() {
    return {
      totalRequests: this.metrics.requests,
      attackAttempts: this.metrics.attackAttempts,
      topPaths: Array.from(this.metrics.byPath.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 10),
      methodDistribution: Object.fromEntries(this.metrics.byMethod)
    };
  }
}

export default FakeWordPress;

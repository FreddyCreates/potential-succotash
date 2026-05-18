/**
 * Fake API Service - Synthetic Host
 * 
 * Simulates a REST API service for API abuse detection.
 * Mimics various API patterns and vulnerabilities.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Fake API Service Host
 */
export class FakeAPIService {
  constructor(config = {}) {
    this.id = `api-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      apiVersion: config.apiVersion || 'v1',
      rateLimit: config.rateLimit || 100,
      authRequired: config.authRequired || true,
      ...config
    };
    
    this.state = {
      requestCount: 0,
      rateLimitHits: 0,
      authAttempts: [],
      injectionAttempts: [],
      enumerationAttempts: []
    };
    
    // Fake data stores
    this.users = this.generateFakeUsers();
    this.posts = this.generateFakePosts();
    this.products = this.generateFakeProducts();
  }
  
  /**
   * Handle incoming request
   */
  async handle(request) {
    const url = new URL(request.url);
    const path = url.pathname;
    const method = request.method;
    
    this.state.requestCount++;
    
    // Check for injection attempts
    this.detectInjection(url, request);
    
    // API routes
    const routes = [
      { pattern: /^\/api\/?$/, handler: this.serveAPIIndex },
      { pattern: /^\/api\/v\d+\/?$/, handler: this.serveVersionIndex },
      { pattern: /^\/api\/v\d+\/users\/?$/, handler: this.handleUsers },
      { pattern: /^\/api\/v\d+\/users\/(\d+)\/?$/, handler: this.handleUser },
      { pattern: /^\/api\/v\d+\/posts\/?$/, handler: this.handlePosts },
      { pattern: /^\/api\/v\d+\/products\/?$/, handler: this.handleProducts },
      { pattern: /^\/api\/v\d+\/auth\/login\/?$/, handler: this.handleAuth },
      { pattern: /^\/api\/v\d+\/auth\/token\/?$/, handler: this.handleToken },
      { pattern: /^\/api\/v\d+\/search\/?$/, handler: this.handleSearch },
      { pattern: /^\/api\/v\d+\/export\/?$/, handler: this.handleExport },
      { pattern: /^\/api\/v\d+\/admin\/?$/, handler: this.handleAdmin },
      { pattern: /^\/api\/graphql\/?$/, handler: this.handleGraphQL },
      { pattern: /^\/api\/docs\/?$/, handler: this.serveDocs },
      { pattern: /^\/api\/openapi\.json$/, handler: this.serveOpenAPI }
    ];
    
    for (const route of routes) {
      const match = path.match(route.pattern);
      if (match) {
        return route.handler.call(this, request, match);
      }
    }
    
    return this.serve404();
  }
  
  /**
   * Detect injection attempts
   */
  detectInjection(url, request) {
    const fullPath = url.pathname + url.search;
    
    // SQL injection patterns
    if (fullPath.match(/('|"|--|;|UNION|SELECT|INSERT|UPDATE|DELETE|DROP)/i)) {
      this.state.injectionAttempts.push({
        type: 'sql',
        path: fullPath,
        timestamp: Date.now()
      });
    }
    
    // NoSQL injection
    if (fullPath.match(/(\$gt|\$lt|\$ne|\$regex|\$where)/)) {
      this.state.injectionAttempts.push({
        type: 'nosql',
        path: fullPath,
        timestamp: Date.now()
      });
    }
    
    // XSS patterns
    if (fullPath.match(/(<script|javascript:|on\w+\s*=)/i)) {
      this.state.injectionAttempts.push({
        type: 'xss',
        path: fullPath,
        timestamp: Date.now()
      });
    }
    
    // IDOR/enumeration
    if (fullPath.match(/\/users\/\d+/) || fullPath.match(/[?&]id=\d+/)) {
      this.state.enumerationAttempts.push({
        path: fullPath,
        timestamp: Date.now()
      });
    }
  }
  
  /**
   * Serve API index
   */
  serveAPIIndex(request) {
    return Response.json({
      name: 'Fake API Service',
      versions: ['v1', 'v2'],
      documentation: '/api/docs',
      status: 'operational'
    });
  }
  
  /**
   * Serve version index
   */
  serveVersionIndex(request) {
    return Response.json({
      version: this.config.apiVersion,
      endpoints: [
        '/users',
        '/posts', 
        '/products',
        '/auth/login',
        '/search'
      ],
      rateLimit: this.config.rateLimit
    });
  }
  
  /**
   * Handle users endpoint
   */
  handleUsers(request) {
    if (request.method === 'GET') {
      // Check if trying to enumerate
      const url = new URL(request.url);
      const page = parseInt(url.searchParams.get('page') || '1');
      const limit = parseInt(url.searchParams.get('limit') || '10');
      
      return Response.json({
        data: this.users.slice((page - 1) * limit, page * limit),
        pagination: {
          page,
          limit,
          total: this.users.length
        }
      });
    }
    
    if (request.method === 'POST') {
      return Response.json({ error: 'Authentication required' }, { status: 401 });
    }
    
    return this.serve405();
  }
  
  /**
   * Handle single user
   */
  handleUser(request, match) {
    const userId = parseInt(match[1]);
    
    // Track enumeration
    this.state.enumerationAttempts.push({
      type: 'user-id',
      id: userId,
      timestamp: Date.now()
    });
    
    const user = this.users.find(u => u.id === userId);
    
    if (!user) {
      return Response.json({ error: 'User not found' }, { status: 404 });
    }
    
    return Response.json({ data: user });
  }
  
  /**
   * Handle posts
   */
  handlePosts(request) {
    return Response.json({
      data: this.posts,
      count: this.posts.length
    });
  }
  
  /**
   * Handle products
   */
  handleProducts(request) {
    return Response.json({
      data: this.products,
      count: this.products.length
    });
  }
  
  /**
   * Handle auth
   */
  async handleAuth(request) {
    if (request.method !== 'POST') {
      return this.serve405();
    }
    
    let credentials = {};
    try {
      credentials = await request.json();
    } catch (e) {
      return Response.json({ error: 'Invalid JSON' }, { status: 400 });
    }
    
    this.state.authAttempts.push({
      username: credentials.username || credentials.email || 'unknown',
      timestamp: Date.now(),
      ip: request.headers.get('x-forwarded-for') || 'unknown'
    });
    
    // Always fail (honeypot)
    return Response.json({ 
      error: 'Invalid credentials',
      message: 'Authentication failed'
    }, { status: 401 });
  }
  
  /**
   * Handle token endpoint
   */
  handleToken(request) {
    return Response.json({
      error: 'Invalid or expired token'
    }, { status: 401 });
  }
  
  /**
   * Handle search
   */
  handleSearch(request) {
    const url = new URL(request.url);
    const query = url.searchParams.get('q') || '';
    
    // Check for injection in search
    if (query.match(/('|"|--|;|<|>)/)) {
      this.state.injectionAttempts.push({
        type: 'search-injection',
        query,
        timestamp: Date.now()
      });
    }
    
    return Response.json({
      query,
      results: [],
      count: 0
    });
  }
  
  /**
   * Handle export (sensitive)
   */
  handleExport(request) {
    return Response.json({
      error: 'Authentication required',
      message: 'This endpoint requires admin privileges'
    }, { status: 403 });
  }
  
  /**
   * Handle admin
   */
  handleAdmin(request) {
    return Response.json({
      error: 'Forbidden',
      message: 'Admin access denied'
    }, { status: 403 });
  }
  
  /**
   * Handle GraphQL
   */
  async handleGraphQL(request) {
    if (request.method !== 'POST') {
      return this.serve405();
    }
    
    let body = {};
    try {
      body = await request.json();
    } catch (e) {
      return Response.json({ errors: [{ message: 'Invalid JSON' }] }, { status: 400 });
    }
    
    // Check for introspection
    if (body.query?.includes('__schema') || body.query?.includes('__type')) {
      this.state.injectionAttempts.push({
        type: 'graphql-introspection',
        timestamp: Date.now()
      });
    }
    
    return Response.json({
      data: null,
      errors: [{ message: 'Authentication required' }]
    });
  }
  
  /**
   * Serve docs
   */
  serveDocs(request) {
    const html = `<!DOCTYPE html>
<html><head><title>API Documentation</title></head>
<body>
<h1>API Documentation</h1>
<ul>
  <li>GET /api/v1/users - List users</li>
  <li>GET /api/v1/posts - List posts</li>
  <li>POST /api/v1/auth/login - Authenticate</li>
</ul>
</body>
</html>`;
    
    return new Response(html, {
      status: 200,
      headers: { 'Content-Type': 'text/html' }
    });
  }
  
  /**
   * Serve OpenAPI spec
   */
  serveOpenAPI(request) {
    return Response.json({
      openapi: '3.0.0',
      info: {
        title: 'Fake API',
        version: '1.0.0'
      },
      paths: {
        '/api/v1/users': {
          get: { summary: 'List users', responses: { '200': { description: 'User list' } } }
        },
        '/api/v1/auth/login': {
          post: { summary: 'Login', responses: { '200': { description: 'Token' } } }
        }
      }
    });
  }
  
  serve404() {
    return Response.json({ error: 'Not found' }, { status: 404 });
  }
  
  serve405() {
    return Response.json({ error: 'Method not allowed' }, { status: 405 });
  }
  
  // Fake data generators
  generateFakeUsers() {
    return [
      { id: 1, name: 'John Doe', email: 'john@example.com', role: 'user' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com', role: 'user' },
      { id: 3, name: 'Admin User', email: 'admin@example.com', role: 'admin' },
      { id: 4, name: 'Bob Wilson', email: 'bob@example.com', role: 'user' },
      { id: 5, name: 'Alice Brown', email: 'alice@example.com', role: 'moderator' }
    ];
  }
  
  generateFakePosts() {
    return [
      { id: 1, title: 'Welcome Post', author: 1, published: true },
      { id: 2, title: 'Update News', author: 2, published: true },
      { id: 3, title: 'Draft Post', author: 1, published: false }
    ];
  }
  
  generateFakeProducts() {
    return [
      { id: 1, name: 'Widget', price: 19.99, stock: 100 },
      { id: 2, name: 'Gadget', price: 29.99, stock: 50 },
      { id: 3, name: 'Tool', price: 9.99, stock: 200 }
    ];
  }
  
  /**
   * Get host state
   */
  getState() {
    return {
      id: this.id,
      type: 'fake-api-service',
      requestCount: this.state.requestCount,
      authAttempts: this.state.authAttempts.length,
      injectionAttempts: this.state.injectionAttempts.length,
      enumerationAttempts: this.state.enumerationAttempts.length
    };
  }
}

export default FakeAPIService;

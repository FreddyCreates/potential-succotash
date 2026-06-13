/**
 * Business REST API Services Protocol — Micro & Macro Service Architecture
 * 
 * PROTO-301: Defines the contract for business-grade REST API services
 * operating at both micro (single-domain) and macro (orchestrated) scales.
 * 
 * Micro Services: Atomic, single-responsibility endpoints
 *   - Each handles one bounded context (users, billing, inventory, etc.)
 *   - Stateless request/response via JSON over HTTP
 *   - φ-rated health pulses for liveness
 * 
 * Macro Services: Orchestrators that compose micro services
 *   - Aggregate multiple micro service calls into business workflows
 *   - Handle saga patterns, compensating transactions
 *   - Provide unified API facade for clients
 * 
 * @module protocols/business-rest-api-services-protocol
 * @version 1.0.0
 * @powered-by ORO Systems
 */

// ═══════════════════════════════════════════════════════════════════════════════
// φ-Constants
// ═══════════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;
const MAX_RETRY = Math.round(PHI * 3);        // 5 retries
const CIRCUIT_WINDOW_MS = HEARTBEAT_MS * 10;  // ~8.7s circuit breaker window

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE REGISTRY — Defines available micro services
// ═══════════════════════════════════════════════════════════════════════════════

export const SERVICE_REGISTRY = {
  // ─── Core Business Micro Services ──────────────────────────────────────────
  'user-identity': {
    domain: 'identity',
    version: '1.0.0',
    endpoints: ['POST /users', 'GET /users/:id', 'PUT /users/:id', 'DELETE /users/:id'],
    healthPath: '/health',
    scale: 'micro',
  },
  'billing-engine': {
    domain: 'finance',
    version: '1.0.0',
    endpoints: ['POST /invoices', 'GET /invoices/:id', 'POST /payments', 'GET /payments/:id'],
    healthPath: '/health',
    scale: 'micro',
  },
  'inventory-tracker': {
    domain: 'logistics',
    version: '1.0.0',
    endpoints: ['GET /products', 'POST /products', 'PUT /products/:id/stock', 'GET /warehouses'],
    healthPath: '/health',
    scale: 'micro',
  },
  'notification-relay': {
    domain: 'communication',
    version: '1.0.0',
    endpoints: ['POST /notifications', 'POST /emails', 'POST /sms', 'GET /notifications/:id'],
    healthPath: '/health',
    scale: 'micro',
  },
  'analytics-collector': {
    domain: 'intelligence',
    version: '1.0.0',
    endpoints: ['POST /events', 'GET /reports/:type', 'GET /dashboards/:id'],
    healthPath: '/health',
    scale: 'micro',
  },

  // ─── Macro Service Orchestrators ───────────────────────────────────────────
  'order-orchestrator': {
    domain: 'commerce',
    version: '1.0.0',
    endpoints: ['POST /orders', 'GET /orders/:id', 'PUT /orders/:id/cancel', 'GET /orders'],
    healthPath: '/health',
    scale: 'macro',
    composes: ['user-identity', 'billing-engine', 'inventory-tracker', 'notification-relay'],
  },
  'onboarding-orchestrator': {
    domain: 'growth',
    version: '1.0.0',
    endpoints: ['POST /onboard', 'GET /onboard/:id/status', 'POST /onboard/:id/verify'],
    healthPath: '/health',
    scale: 'macro',
    composes: ['user-identity', 'notification-relay', 'analytics-collector'],
  },
  'reporting-orchestrator': {
    domain: 'intelligence',
    version: '1.0.0',
    endpoints: ['POST /reports/generate', 'GET /reports/:id', 'GET /insights'],
    healthPath: '/health',
    scale: 'macro',
    composes: ['analytics-collector', 'billing-engine', 'inventory-tracker'],
  },
};

// ═══════════════════════════════════════════════════════════════════════════════
// REST CONTRACT — Standard request/response envelope
// ═══════════════════════════════════════════════════════════════════════════════

export class RESTEnvelope {
  /**
   * Wrap a successful response in the standard envelope
   */
  static success(data, meta = {}) {
    return {
      status: 'success',
      data,
      meta: {
        timestamp: Date.now(),
        phi: PHI,
        heartbeat: HEARTBEAT_MS,
        ...meta,
      },
    };
  }

  /**
   * Wrap an error response in the standard envelope
   */
  static error(code, message, details = null) {
    return {
      status: 'error',
      error: {
        code,
        message,
        details,
        timestamp: Date.now(),
      },
    };
  }

  /**
   * Pagination envelope for list endpoints
   */
  static paginated(data, { page = 1, limit = 20, total = 0 }) {
    return {
      status: 'success',
      data,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1,
      },
      meta: {
        timestamp: Date.now(),
        phi: PHI,
      },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// CIRCUIT BREAKER — Protects micro services from cascade failures
// ═══════════════════════════════════════════════════════════════════════════════

export class CircuitBreaker {
  constructor(serviceName, options = {}) {
    this.serviceName = serviceName;
    this.failureThreshold = options.failureThreshold || Math.round(PHI * 3);
    this.recoveryTime = options.recoveryTime || CIRCUIT_WINDOW_MS;
    this.state = 'CLOSED';   // CLOSED = healthy, OPEN = failing, HALF_OPEN = testing
    this.failures = 0;
    this.lastFailure = 0;
    this.successCount = 0;
  }

  canExecute() {
    if (this.state === 'CLOSED') return true;
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastFailure > this.recoveryTime) {
        this.state = 'HALF_OPEN';
        return true;
      }
      return false;
    }
    // HALF_OPEN — allow one test request
    return true;
  }

  recordSuccess() {
    if (this.state === 'HALF_OPEN') {
      this.successCount++;
      if (this.successCount >= Math.round(PHI * 2)) {
        this.state = 'CLOSED';
        this.failures = 0;
        this.successCount = 0;
      }
    }
    if (this.state === 'CLOSED') {
      this.failures = 0;
    }
  }

  recordFailure() {
    this.failures++;
    this.lastFailure = Date.now();
    if (this.failures >= this.failureThreshold) {
      this.state = 'OPEN';
    }
    if (this.state === 'HALF_OPEN') {
      this.state = 'OPEN';
    }
  }

  getStatus() {
    return {
      service: this.serviceName,
      state: this.state,
      failures: this.failures,
      confidence: this.state === 'CLOSED' ? 1.0 : this.state === 'HALF_OPEN' ? THRESHOLD : 0,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAGA COORDINATOR — For macro service transaction management
// ═══════════════════════════════════════════════════════════════════════════════

export class SagaCoordinator {
  constructor(sagaName) {
    this.sagaName = sagaName;
    this.steps = [];
    this.completedSteps = [];
    this.state = 'PENDING';
  }

  /**
   * Add a step with its execute and compensate functions
   */
  addStep(name, execute, compensate) {
    this.steps.push({ name, execute, compensate });
    return this;
  }

  /**
   * Execute the saga — runs all steps, compensates on failure
   */
  async run(context = {}) {
    this.state = 'RUNNING';
    const results = {};

    for (const step of this.steps) {
      try {
        results[step.name] = await step.execute(context, results);
        this.completedSteps.push(step);
      } catch (error) {
        this.state = 'COMPENSATING';
        // Reverse compensate all completed steps
        for (const completed of [...this.completedSteps].reverse()) {
          try {
            await completed.compensate(context, results);
          } catch (compError) {
            // Log compensation failure — manual intervention needed
            console.error(`[SAGA:${this.sagaName}] Compensation failed for ${completed.name}:`, compError);
          }
        }
        this.state = 'FAILED';
        throw new SagaError(this.sagaName, step.name, error);
      }
    }

    this.state = 'COMPLETED';
    return results;
  }

  getStatus() {
    return {
      saga: this.sagaName,
      state: this.state,
      stepsTotal: this.steps.length,
      stepsCompleted: this.completedSteps.length,
      progress: this.steps.length > 0 ? this.completedSteps.length / this.steps.length : 0,
    };
  }
}

export class SagaError extends Error {
  constructor(sagaName, failedStep, cause) {
    super(`Saga "${sagaName}" failed at step "${failedStep}": ${cause.message}`);
    this.name = 'SagaError';
    this.sagaName = sagaName;
    this.failedStep = failedStep;
    this.cause = cause;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SERVICE MESH — Discovery & routing between micro/macro services
// ═══════════════════════════════════════════════════════════════════════════════

export class ServiceMesh {
  constructor() {
    this.services = new Map();
    this.breakers = new Map();
    this.metrics = new Map();
  }

  /**
   * Register a service in the mesh
   */
  register(name, binding, config = {}) {
    this.services.set(name, { binding, config, registeredAt: Date.now() });
    this.breakers.set(name, new CircuitBreaker(name, config.circuitBreaker));
    this.metrics.set(name, { calls: 0, errors: 0, avgLatency: 0 });
  }

  /**
   * Call a micro service through the mesh (with circuit breaking + metrics)
   */
  async call(serviceName, method, path, body = null, headers = {}) {
    const service = this.services.get(serviceName);
    if (!service) {
      throw new Error(`Service "${serviceName}" not registered in mesh`);
    }

    const breaker = this.breakers.get(serviceName);
    if (!breaker.canExecute()) {
      throw new Error(`Circuit OPEN for "${serviceName}" — service unavailable`);
    }

    const metrics = this.metrics.get(serviceName);
    const start = Date.now();

    try {
      const url = new URL(path, `http://${serviceName}.internal`);
      const fetchOptions = {
        method,
        headers: {
          'Content-Type': 'application/json',
          'X-Service-Mesh': 'true',
          'X-Correlation-Id': crypto.randomUUID(),
          'X-Phi-Heartbeat': String(HEARTBEAT_MS),
          ...headers,
        },
      };
      if (body && method !== 'GET') {
        fetchOptions.body = JSON.stringify(body);
      }

      const response = await service.binding.fetch(url.toString(), fetchOptions);
      const latency = Date.now() - start;

      // Update metrics
      metrics.calls++;
      metrics.avgLatency = (metrics.avgLatency * (metrics.calls - 1) + latency) / metrics.calls;

      if (response.ok) {
        breaker.recordSuccess();
        return await response.json();
      } else {
        breaker.recordFailure();
        metrics.errors++;
        const errorBody = await response.text();
        throw new Error(`Service "${serviceName}" returned ${response.status}: ${errorBody}`);
      }
    } catch (error) {
      breaker.recordFailure();
      metrics.errors++;
      throw error;
    }
  }

  /**
   * Health check all registered services
   */
  async healthCheck() {
    const results = {};
    for (const [name, service] of this.services) {
      const breaker = this.breakers.get(name);
      const metrics = this.metrics.get(name);
      results[name] = {
        ...breaker.getStatus(),
        metrics: { ...metrics },
        registered: service.registeredAt,
      };
    }
    return results;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// RATE LIMITER — Token bucket per client/service
// ═══════════════════════════════════════════════════════════════════════════════

export class TokenBucketRateLimiter {
  constructor(options = {}) {
    this.maxTokens = options.maxTokens || Math.round(PHI * 100);       // ~162 requests
    this.refillRate = options.refillRate || Math.round(PHI * 10);       // ~16 tokens/sec
    this.refillInterval = options.refillInterval || 1000;
    this.buckets = new Map();
  }

  _getBucket(clientId) {
    if (!this.buckets.has(clientId)) {
      this.buckets.set(clientId, {
        tokens: this.maxTokens,
        lastRefill: Date.now(),
      });
    }
    return this.buckets.get(clientId);
  }

  consume(clientId, tokens = 1) {
    const bucket = this._getBucket(clientId);
    const now = Date.now();
    const elapsed = now - bucket.lastRefill;
    const refill = Math.floor(elapsed / this.refillInterval) * this.refillRate;

    bucket.tokens = Math.min(this.maxTokens, bucket.tokens + refill);
    bucket.lastRefill = now;

    if (bucket.tokens >= tokens) {
      bucket.tokens -= tokens;
      return { allowed: true, remaining: bucket.tokens };
    }
    return { allowed: false, remaining: bucket.tokens, retryAfter: Math.ceil(this.refillInterval / 1000) };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// REQUEST VALIDATOR — Schema validation for REST payloads
// ═══════════════════════════════════════════════════════════════════════════════

export class RequestValidator {
  static validate(body, schema) {
    const errors = [];
    for (const [field, rules] of Object.entries(schema)) {
      const value = body[field];
      if (rules.required && (value === undefined || value === null)) {
        errors.push({ field, message: `${field} is required` });
        continue;
      }
      if (value !== undefined && value !== null) {
        if (rules.type && typeof value !== rules.type) {
          errors.push({ field, message: `${field} must be of type ${rules.type}` });
        }
        if (rules.minLength && typeof value === 'string' && value.length < rules.minLength) {
          errors.push({ field, message: `${field} must be at least ${rules.minLength} characters` });
        }
        if (rules.maxLength && typeof value === 'string' && value.length > rules.maxLength) {
          errors.push({ field, message: `${field} must be at most ${rules.maxLength} characters` });
        }
        if (rules.pattern && typeof value === 'string' && !rules.pattern.test(value)) {
          errors.push({ field, message: `${field} format is invalid` });
        }
        if (rules.min !== undefined && typeof value === 'number' && value < rules.min) {
          errors.push({ field, message: `${field} must be >= ${rules.min}` });
        }
        if (rules.max !== undefined && typeof value === 'number' && value > rules.max) {
          errors.push({ field, message: `${field} must be <= ${rules.max}` });
        }
        if (rules.enum && !rules.enum.includes(value)) {
          errors.push({ field, message: `${field} must be one of: ${rules.enum.join(', ')}` });
        }
      }
    }
    return { valid: errors.length === 0, errors };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// PROTOCOL EXPORT — Main class tying it all together
// ═══════════════════════════════════════════════════════════════════════════════

export class BusinessRESTApiServicesProtocol {
  static VERSION = '1.0.0';
  static PROTO_ID = 'PROTO-301';
  static PHI = PHI;
  static HEARTBEAT_MS = HEARTBEAT_MS;

  constructor(config = {}) {
    this.mesh = new ServiceMesh();
    this.rateLimiter = new TokenBucketRateLimiter(config.rateLimit);
    this.config = config;
  }

  /**
   * Register micro or macro service
   */
  registerService(name, binding, options = {}) {
    const registryEntry = SERVICE_REGISTRY[name];
    if (!registryEntry) {
      throw new Error(`Unknown service: ${name}. Must be registered in SERVICE_REGISTRY.`);
    }
    this.mesh.register(name, binding, { ...registryEntry, ...options });
  }

  /**
   * Route an incoming request to the appropriate service
   */
  async route(request) {
    const url = new URL(request.url);
    const clientId = request.headers.get('X-Client-Id') || 'anonymous';

    // Rate limit check
    const rateResult = this.rateLimiter.consume(clientId);
    if (!rateResult.allowed) {
      return new Response(JSON.stringify(
        RESTEnvelope.error(429, 'Rate limit exceeded', { retryAfter: rateResult.retryAfter })
      ), { status: 429, headers: { 'Content-Type': 'application/json', 'Retry-After': String(rateResult.retryAfter) } });
    }

    // Health endpoint
    if (url.pathname === '/health') {
      const health = await this.mesh.healthCheck();
      return new Response(JSON.stringify(RESTEnvelope.success(health)), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    // Service discovery endpoint
    if (url.pathname === '/services') {
      return new Response(JSON.stringify(RESTEnvelope.success(SERVICE_REGISTRY)), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    return null; // Not handled by protocol — delegate to worker logic
  }

  /**
   * Create a saga for macro service orchestration
   */
  createSaga(name) {
    return new SagaCoordinator(name);
  }

  /**
   * Call a registered micro service
   */
  async callService(name, method, path, body, headers) {
    return this.mesh.call(name, method, path, body, headers);
  }

  /**
   * Get protocol metadata
   */
  static describe() {
    return {
      id: BusinessRESTApiServicesProtocol.PROTO_ID,
      name: 'Business REST API Services Protocol',
      version: BusinessRESTApiServicesProtocol.VERSION,
      scales: ['micro', 'macro'],
      phi: PHI,
      heartbeat: HEARTBEAT_MS,
      threshold: THRESHOLD,
      services: Object.keys(SERVICE_REGISTRY),
      capabilities: [
        'circuit-breaking',
        'saga-orchestration',
        'rate-limiting',
        'service-mesh',
        'request-validation',
        'health-monitoring',
        'phi-resonance',
      ],
    };
  }
}

export default BusinessRESTApiServicesProtocol;

/**
 * OrganismBridge — Multi-Worker Orchestration Bridge
 *
 * Boots and coordinates ALL 13 organism workers:
 * - engine-worker.js:       EngineCore + ModelRouter + ModelWire (40 AI families)
 * - memory-worker.js:       Sovereign Memory (spatial store, search, persistence)
 * - routing-worker.js:      Protocol routing (10 protocols, fusion, circuit breakers)
 * - telemetry-worker.js:    Health monitoring (per-worker status, ring health, alerts)
 * - crypto-worker.js:       Cryptography (AES-256-GCM, hashing, tokens)
 * - contract-worker.js:     Contract verification, SLA enforcement, audit trail
 * - scheduler-worker.js:    24/7 task scheduling, cron jobs, deferred execution
 * - mesh-worker.js:         Infrastructure mesh, cross-tab coordination, leader election
 * - analytics-worker.js:    Product analytics, funnel analysis, session tracking
 * - guardian-worker.js:     Security guardian, threat detection, rate limiting
 * - pipeline-worker.js:     Data pipeline, ETL transforms, stream processing
 * - inference-worker.js:    Local ML inference, classification, embeddings
 * - orchestrator-worker.js: Micro-worker orchestration, task decomposition, workflows
 *
 * This bridge IS the nervous system. It connects all workers to each other
 * and to the UI. Every heartbeat from every worker flows through here.
 *
 * Usage:
 *   var bridge = new OrganismBridge({
 *     onHeartbeat: function(beat) { ... },
 *     onBooted: function(data) { ... },
 *     onDispatch: function(result) { ... },
 *     onRoute: function(result) { ... },
 *     onQuery: function(query, data) { ... },
 *     onMemory: function(event) { ... },
 *     onTelemetry: function(event) { ... },
 *     onCrypto: function(event) { ... },
 *     onWorkerStatus: function(statuses) { ... },
 *     onError: function(err) { ... }
 *   });
 *   bridge.boot();
 */

'use strict';

var WORKER_PATHS = {
  engine:       'organism/web/engine-worker.js',
  memory:       'organism/web/memory-worker.js',
  routing:      'organism/web/routing-worker.js',
  telemetry:    'organism/web/telemetry-worker.js',
  crypto:       'organism/web/crypto-worker.js',
  contract:     'organism/web/contract-worker.js',
  scheduler:    'organism/web/scheduler-worker.js',
  mesh:         'organism/web/mesh-worker.js',
  analytics:    'organism/web/analytics-worker.js',
  guardian:     'organism/web/guardian-worker.js',
  pipeline:     'organism/web/pipeline-worker.js',
  inference:    'organism/web/inference-worker.js',
  orchestrator: 'organism/web/orchestrator-worker.js'
};

function OrganismBridge(config) {
  this.config = config || {};
  this.workers = {};         // name → Worker
  this.workerStatus = {};    // name → { status, heartbeats, lastBeat }
  this.status = 'idle';
  this.heartbeatCount = 0;
  this.lastHeartbeat = 0;
  this.bootData = null;
  this.lastMetrics = null;
  this.memoryStorageKey = 'organism-memory-store';
}

/* ────────────────────────────────────────────────────────
   Boot — starts ALL workers in parallel
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.boot = function () {
  var self = this;
  this.status = 'booting';

  // Launch every worker
  for (var name in WORKER_PATHS) {
    this._startWorker(name, WORKER_PATHS[name]);
  }

  // Boot the engine
  if (this.workers.engine) {
    this.workers.engine.postMessage({ type: 'boot' });
  }

  // Auto-join mesh network
  if (this.workers.mesh) {
    this.workers.mesh.postMessage({ type: 'join', nodeId: 'tab-' + Date.now().toString(36), capabilities: Object.keys(WORKER_PATHS) });
  }

  // Start analytics session
  if (this.workers.analytics) {
    this.workers.analytics.postMessage({ type: 'session-start' });
    this.workers.analytics.postMessage({ type: 'page-view', page: location.pathname || '/' });
  }

  // Restore persisted memory
  this._restoreMemory();
};

OrganismBridge.prototype._startWorker = function (name, path) {
  var self = this;

  this.workerStatus[name] = { status: 'booting', heartbeats: 0, lastBeat: 0 };

  try {
    this.workers[name] = new Worker(path);
  } catch (e) {
    this.workerStatus[name].status = 'error';
    if (this.config.onError) this.config.onError(name + ' worker load failed: ' + e.message);
    return;
  }

  this.workers[name].onmessage = function (e) {
    self._handleMessage(name, e.data);
  };

  this.workers[name].onerror = function (err) {
    self.workerStatus[name].status = 'error';
    // Report to telemetry worker
    if (self.workers.telemetry) {
      self.workers.telemetry.postMessage({ type: 'report', worker: name, data: { error: err.message } });
    }
    if (self.config.onError) self.config.onError(name + ': ' + (err.message || 'Worker error'));
  };
};

/* ────────────────────────────────────────────────────────
   Message Router — handles messages from ALL workers
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype._handleMessage = function (workerName, msg) {
  // Track heartbeats from any worker
  if (msg.type === 'heartbeat') {
    this.workerStatus[workerName].status = 'alive';
    this.workerStatus[workerName].heartbeats = msg.beat;
    this.workerStatus[workerName].lastBeat = msg.timestamp;

    // Forward heartbeats to telemetry
    if (workerName !== 'telemetry' && this.workers.telemetry) {
      this.workers.telemetry.postMessage({ type: 'worker-heartbeat', worker: workerName });
    }
  }

  // Route by worker
  switch (workerName) {
    case 'engine':
      this._handleEngineMessage(msg);
      break;
    case 'memory':
      this._handleMemoryMessage(msg);
      break;
    case 'routing':
      this._handleRoutingMessage(msg);
      break;
    case 'telemetry':
      this._handleTelemetryMessage(msg);
      break;
    case 'crypto':
      this._handleCryptoMessage(msg);
      break;
    case 'contract':
    case 'scheduler':
    case 'mesh':
    case 'analytics':
    case 'guardian':
    case 'pipeline':
    case 'inference':
    case 'orchestrator':
      this._handleExtendedMessage(workerName, msg);
      break;
  }

  // Emit worker statuses on every heartbeat from engine
  if (workerName === 'engine' && msg.type === 'heartbeat') {
    this.heartbeatCount = msg.beat;
    this.lastHeartbeat = msg.timestamp;
    if (msg.metrics) this.lastMetrics = msg.metrics;
    if (this.config.onHeartbeat) this.config.onHeartbeat(msg);

    // Report engine metrics to telemetry
    if (msg.metrics && this.workers.telemetry) {
      this.workers.telemetry.postMessage({ type: 'report', worker: 'engine', data: msg.metrics.engine || {} });
    }

    // Emit worker status summary
    if (this.config.onWorkerStatus) {
      this.config.onWorkerStatus(this.getWorkerStatuses());
    }
  }
};

OrganismBridge.prototype._handleEngineMessage = function (msg) {
  switch (msg.type) {
    case 'booted':
      this.status = 'alive';
      this.bootData = msg.data;
      if (this.config.onBooted) this.config.onBooted(msg.data);
      break;
    case 'dispatch-result':
      // Store dispatch in memory
      if (this.workers.memory) {
        this.workers.memory.postMessage({
          type: 'store',
          memory: {
            key: 'dispatch-' + msg.record.taskId,
            value: { record: msg.record, execution: msg.execution },
            tags: ['dispatch', msg.record.type, msg.record.assignedEngine ? msg.record.assignedEngine.familyName : 'none'],
            source: 'engine'
          }
        });
      }
      if (this.config.onDispatch) this.config.onDispatch(msg);
      break;
    case 'route-result':
      if (this.config.onRoute) this.config.onRoute(msg.data);
      break;
    case 'query-result':
      if (this.config.onQuery) this.config.onQuery(msg.query, msg.data);
      break;
    case 'error':
      if (this.config.onError) this.config.onError(msg.error);
      break;
  }
};

OrganismBridge.prototype._handleMemoryMessage = function (msg) {
  switch (msg.type) {
    case 'persist-request':
      // Worker asks main thread to save to localStorage
      try { localStorage.setItem(msg.key, JSON.stringify(msg.data)); } catch (e) { /* ignore */ }
      break;
    default:
      if (this.config.onMemory) this.config.onMemory(msg);
  }
};

OrganismBridge.prototype._handleRoutingMessage = function (msg) {
  switch (msg.type) {
    case 'route-result':
      if (this.config.onRoute) this.config.onRoute(msg.data);
      break;
    default:
      if (this.config.onRouting) this.config.onRouting(msg);
  }
};

OrganismBridge.prototype._handleTelemetryMessage = function (msg) {
  switch (msg.type) {
    case 'alert':
      if (this.config.onAlert) this.config.onAlert(msg.alert);
      break;
    default:
      if (this.config.onTelemetry) this.config.onTelemetry(msg);
  }
};

OrganismBridge.prototype._handleCryptoMessage = function (msg) {
  if (this.config.onCrypto) this.config.onCrypto(msg);
};

OrganismBridge.prototype._handleExtendedMessage = function (workerName, msg) {
  // Forward threat alerts from guardian
  if (workerName === 'guardian' && msg.type === 'threat-alert') {
    if (this.config.onAlert) this.config.onAlert({ message: 'Security: ' + msg.threat.type + ' — ' + msg.threat.detail, source: 'guardian' });
  }
  // Forward micro-tasks from orchestrator to appropriate workers
  if (workerName === 'orchestrator' && msg.type === 'micro-task') {
    var targetWorker = this.workers[msg.worker];
    if (targetWorker) {
      targetWorker.postMessage({ type: msg.action, task: msg.payload, _orchestratorTaskId: msg.taskId });
    }
  }
  // Forward scheduled job firings
  if (workerName === 'scheduler' && msg.type === 'job-fired') {
    // Route job to the appropriate worker based on action
    if (msg.action && this.workers[msg.action]) {
      this.workers[msg.action].postMessage({ type: 'dispatch', task: msg.payload });
    }
  }
  // Auto-track events in analytics
  if (workerName !== 'analytics' && msg.type !== 'heartbeat' && this.workers.analytics) {
    this.workers.analytics.postMessage({ type: 'track', event: { name: msg.type, category: workerName, data: null } });
  }
  // Generic callback
  if (this.config.onWorkerMessage) this.config.onWorkerMessage(workerName, msg);
};

/* ────────────────────────────────────────────────────────
   Memory persistence
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype._restoreMemory = function () {
  try {
    var raw = localStorage.getItem(this.memoryStorageKey);
    if (raw && this.workers.memory) {
      var data = JSON.parse(raw);
      if (Array.isArray(data)) {
        this.workers.memory.postMessage({ type: 'restore', data: data });
      }
    }
  } catch (e) { /* ignore */ }
};

/* ────────────────────────────────────────────────────────
   Public API — dispatch commands to workers
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.dispatch = function (task) {
  if (this.workers.engine) this.workers.engine.postMessage({ type: 'dispatch', task: task });
};

OrganismBridge.prototype.route = function (task) {
  // Route through the routing worker (protocol-level), not just engine
  if (this.workers.routing) this.workers.routing.postMessage({ type: 'route', task: task });
};

OrganismBridge.prototype.query = function (queryType) {
  if (this.workers.engine) this.workers.engine.postMessage({ type: 'query', query: queryType });
};

OrganismBridge.prototype.storeMemory = function (memory) {
  if (this.workers.memory) this.workers.memory.postMessage({ type: 'store', memory: memory });
};

OrganismBridge.prototype.searchMemory = function (query, limit) {
  if (this.workers.memory) this.workers.memory.postMessage({ type: 'search', query: query, limit: limit || 10 });
};

OrganismBridge.prototype.memoryStats = function () {
  if (this.workers.memory) this.workers.memory.postMessage({ type: 'stats' });
};

OrganismBridge.prototype.encrypt = function (plaintext, password) {
  if (this.workers.crypto) this.workers.crypto.postMessage({ type: 'encrypt', plaintext: plaintext, password: password || 'sovereign' });
};

OrganismBridge.prototype.hash = function (data, algorithm) {
  if (this.workers.crypto) this.workers.crypto.postMessage({ type: 'hash', data: data, algorithm: algorithm || 'SHA-256' });
};

OrganismBridge.prototype.generateToken = function (length) {
  if (this.workers.crypto) this.workers.crypto.postMessage({ type: 'generate-token', length: length || 32 });
};

OrganismBridge.prototype.routingHealth = function () {
  if (this.workers.routing) this.workers.routing.postMessage({ type: 'health' });
};

OrganismBridge.prototype.dashboard = function () {
  if (this.workers.telemetry) this.workers.telemetry.postMessage({ type: 'dashboard' });
};

OrganismBridge.prototype.systemHealth = function () {
  if (this.workers.telemetry) this.workers.telemetry.postMessage({ type: 'health' });
};

/* ────────────────────────────────────────────────────────
   Extended Worker APIs — contracts, scheduler, mesh,
   analytics, guardian, pipeline, inference, orchestrator
   ──────────────────────────────────────────────────────── */

// Contract Worker
OrganismBridge.prototype.createContract = function (contract) {
  if (this.workers.contract) this.workers.contract.postMessage({ type: 'create-contract', contract: contract });
};
OrganismBridge.prototype.verifyContract = function (contractId, operation) {
  if (this.workers.contract) this.workers.contract.postMessage({ type: 'verify', contractId: contractId, operation: operation });
};
OrganismBridge.prototype.enforceSla = function (contractId, metrics) {
  if (this.workers.contract) this.workers.contract.postMessage({ type: 'enforce-sla', contractId: contractId, metrics: metrics });
};

// Scheduler Worker
OrganismBridge.prototype.scheduleJob = function (job) {
  if (this.workers.scheduler) this.workers.scheduler.postMessage({ type: 'schedule', job: job });
};
OrganismBridge.prototype.deferTask = function (task) {
  if (this.workers.scheduler) this.workers.scheduler.postMessage({ type: 'defer', task: task });
};

// Mesh Worker
OrganismBridge.prototype.joinMesh = function (nodeId, capabilities) {
  if (this.workers.mesh) this.workers.mesh.postMessage({ type: 'join', nodeId: nodeId, capabilities: capabilities });
};
OrganismBridge.prototype.meshBroadcast = function (message) {
  if (this.workers.mesh) this.workers.mesh.postMessage({ type: 'broadcast', message: message });
};

// Analytics Worker
OrganismBridge.prototype.trackEvent = function (event) {
  if (this.workers.analytics) this.workers.analytics.postMessage({ type: 'track', event: event });
};
OrganismBridge.prototype.analyticsReport = function (period) {
  if (this.workers.analytics) this.workers.analytics.postMessage({ type: 'report', period: period || 'all' });
};

// Guardian Worker
OrganismBridge.prototype.securityCheck = function (operation) {
  if (this.workers.guardian) this.workers.guardian.postMessage({ type: 'check', operation: operation });
};
OrganismBridge.prototype.rateCheck = function (key, limit, windowMs) {
  if (this.workers.guardian) this.workers.guardian.postMessage({ type: 'rate-check', key: key, limit: limit, windowMs: windowMs });
};

// Pipeline Worker
OrganismBridge.prototype.createPipeline = function (pipeline) {
  if (this.workers.pipeline) this.workers.pipeline.postMessage({ type: 'create-pipeline', pipeline: pipeline });
};
OrganismBridge.prototype.pushToPipeline = function (pipelineId, data) {
  if (this.workers.pipeline) this.workers.pipeline.postMessage({ type: 'push', pipelineId: pipelineId, data: data });
};

// Inference Worker
OrganismBridge.prototype.classify = function (text, categories) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'classify', text: text, categories: categories });
};
OrganismBridge.prototype.sentiment = function (text) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'sentiment', text: text });
};
OrganismBridge.prototype.embed = function (text) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'embed', text: text });
};
OrganismBridge.prototype.extractKeywords = function (text, topK) {
  if (this.workers.inference) this.workers.inference.postMessage({ type: 'keywords', text: text, topK: topK || 10 });
};

// Orchestrator Worker
OrganismBridge.prototype.createWorkflow = function (workflow) {
  if (this.workers.orchestrator) this.workers.orchestrator.postMessage({ type: 'create-workflow', workflow: workflow });
};
OrganismBridge.prototype.executeWorkflow = function (workflowId) {
  if (this.workers.orchestrator) this.workers.orchestrator.postMessage({ type: 'execute', workflowId: workflowId });
};
OrganismBridge.prototype.decomposeTask = function (task) {
  if (this.workers.orchestrator) this.workers.orchestrator.postMessage({ type: 'decompose', task: task });
};

/* ────────────────────────────────────────────────────────
   Status & Shutdown
   ──────────────────────────────────────────────────────── */

OrganismBridge.prototype.getWorkerStatuses = function () {
  var statuses = [];
  for (var name in this.workerStatus) {
    statuses.push({
      name: name,
      status: this.workerStatus[name].status,
      heartbeats: this.workerStatus[name].heartbeats,
      lastBeat: this.workerStatus[name].lastBeat
    });
  }
  return statuses;
};

OrganismBridge.prototype.shutdown = function () {
  for (var name in this.workers) {
    if (this.workers[name]) {
      this.workers[name].postMessage({ type: 'stop' });
      try { this.workers[name].terminate(); } catch (e) { /* ignore */ }
    }
  }
  this.workers = {};
  this.status = 'stopped';
};

if (typeof window !== 'undefined') {
  window.OrganismBridge = OrganismBridge;
}

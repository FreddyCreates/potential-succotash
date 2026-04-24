/**
 * OrganismBridge — Main-Thread Bridge to the Engine Worker
 *
 * Boots the engine worker, routes commands, and exposes live telemetry.
 * This is the connection between the UI and the running product.
 *
 * Usage:
 *   var bridge = new OrganismBridge({
 *     onHeartbeat: function(beat) { ... },
 *     onBooted: function(data) { ... },
 *     onDispatch: function(result) { ... },
 *     onRoute: function(result) { ... },
 *     onQuery: function(query, data) { ... },
 *     onError: function(err) { ... }
 *   });
 *   bridge.boot();
 *   bridge.dispatch({ type: 'reasoning', requiredCapability: 'Multi-modal reasoning' });
 *   bridge.query('health');
 */

'use strict';

function OrganismBridge(config) {
  this.config = config || {};
  this.worker = null;
  this.status = 'idle';
  this.heartbeatCount = 0;
  this.lastHeartbeat = 0;
  this.bootData = null;
  this.lastMetrics = null;
}

OrganismBridge.prototype.boot = function () {
  var self = this;
  this.status = 'booting';

  try {
    this.worker = new Worker('organism/web/engine-worker.js');
  } catch (e) {
    this.status = 'error';
    if (this.config.onError) this.config.onError('Worker load failed: ' + e.message);
    return;
  }

  this.worker.onmessage = function (e) {
    self._handleMessage(e.data);
  };

  this.worker.onerror = function (err) {
    self.status = 'error';
    if (self.config.onError) self.config.onError(err.message || 'Worker error');
  };

  // Send boot command
  this.worker.postMessage({ type: 'boot' });
};

OrganismBridge.prototype._handleMessage = function (msg) {
  switch (msg.type) {
    case 'booted':
      this.status = 'alive';
      this.bootData = msg.data;
      if (this.config.onBooted) this.config.onBooted(msg.data);
      break;

    case 'heartbeat':
      this.heartbeatCount = msg.beat;
      this.lastHeartbeat = msg.timestamp;
      if (msg.metrics) this.lastMetrics = msg.metrics;
      if (this.config.onHeartbeat) this.config.onHeartbeat(msg);
      break;

    case 'dispatch-result':
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

    case 'stopped':
      this.status = 'stopped';
      break;
  }
};

OrganismBridge.prototype.dispatch = function (task) {
  if (this.worker) this.worker.postMessage({ type: 'dispatch', task: task });
};

OrganismBridge.prototype.route = function (task) {
  if (this.worker) this.worker.postMessage({ type: 'route', task: task });
};

OrganismBridge.prototype.query = function (queryType) {
  if (this.worker) this.worker.postMessage({ type: 'query', query: queryType });
};

OrganismBridge.prototype.shutdown = function () {
  if (this.worker) {
    this.worker.postMessage({ type: 'stop' });
    this.worker.terminate();
    this.worker = null;
  }
  this.status = 'stopped';
};

if (typeof window !== 'undefined') {
  window.OrganismBridge = OrganismBridge;
}

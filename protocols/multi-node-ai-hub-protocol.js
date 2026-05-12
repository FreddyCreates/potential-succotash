/**
 * HUB-001: Multi-Node AI Hub Protocol
 * 
 * The distributed nervous system of the Civilization Organism.
 * Each hub runs tuned models + tools, connects upward to Nova,
 * and sideways to peers in the federation.
 * 
 * @module multi-node-ai-hub-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Hub Types ───────────────────────────────────────────────────────────────
export const HUB_TYPES = {
  SCHOOL: { id: 'school', phi_weight: PHI_INV, description: 'Educational institution' },
  CITY: { id: 'city', phi_weight: 1.0, description: 'Municipal government' },
  ORG: { id: 'org', phi_weight: 1.0, description: 'Organization or enterprise' },
  REPO: { id: 'repo', phi_weight: PHI_INV, description: 'Code repository' },
  RESEARCH: { id: 'research', phi_weight: PHI, description: 'Research institution' }
};

// ─── Hub States ──────────────────────────────────────────────────────────────
export const HUB_STATES = {
  INITIALIZING: 'initializing',
  ACTIVE: 'active',
  SYNCING: 'syncing',
  DEGRADED: 'degraded',
  OFFLINE: 'offline'
};

// ─── Hub Node ────────────────────────────────────────────────────────────────
class HubNode {
  constructor(id, type, config = {}) {
    this.id = id;
    this.type = HUB_TYPES[type] || HUB_TYPES.ORG;
    this.state = HUB_STATES.INITIALIZING;
    this.config = config;
    
    // Connections
    this.novaConnection = null;
    this.peers = new Map();  // hub_id -> connection_info
    
    // Local resources
    this.models = new Map();
    this.tools = new Map();
    this.localContext = new Map();
    
    // Sync state
    this.lastNovaSync = null;
    this.lastPeerSync = new Map();
    this.syncQueue = [];
    
    this.created = Date.now();
    this.metrics = {
      requests_served: 0,
      nova_syncs: 0,
      peer_syncs: 0,
      local_queries: 0
    };
  }
  
  // ─── HUB-REGISTER: Join federation ─────────────────────────────────────────
  register(novaEndpoint, credentials) {
    this.novaConnection = {
      endpoint: novaEndpoint,
      credentials,
      established: Date.now(),
      status: 'pending'
    };
    
    this.state = HUB_STATES.ACTIVE;
    return this.novaConnection;
  }
  
  // ─── HUB-SYNC: Exchange with Nova and peers ────────────────────────────────
  syncWithNova(novaData) {
    // Receive laws, tokens, artifacts from Nova
    if (novaData.protocols) {
      for (const protocol of novaData.protocols) {
        this.localContext.set(`protocol:${protocol.id}`, protocol);
      }
    }
    
    if (novaData.doctrines) {
      for (const doctrine of novaData.doctrines) {
        this.localContext.set(`doctrine:${doctrine.id}`, doctrine);
      }
    }
    
    this.lastNovaSync = Date.now();
    this.novaConnection.status = 'active';
    this.metrics.nova_syncs++;
    
    return {
      received: novaData,
      timestamp: this.lastNovaSync
    };
  }
  
  syncWithPeer(peerId, peerData) {
    // Exchange models, laws, artifacts with peer
    const peer = this.peers.get(peerId);
    if (!peer) {
      throw new Error(`Peer not found: ${peerId}`);
    }
    
    // Merge peer data
    if (peerData.models) {
      for (const [modelId, model] of Object.entries(peerData.models)) {
        if (!this.models.has(modelId)) {
          this.models.set(modelId, model);
        }
      }
    }
    
    this.lastPeerSync.set(peerId, Date.now());
    this.metrics.peer_syncs++;
    
    return {
      peerId,
      received: peerData,
      timestamp: Date.now()
    };
  }
  
  // ─── HUB-LOCAL: Serve local users ──────────────────────────────────────────
  serveLocal(request) {
    const response = {
      id: `resp-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      hubId: this.id,
      request: request.id,
      timestamp: Date.now()
    };
    
    // Check local context first
    const contextKey = request.contextKey;
    if (contextKey && this.localContext.has(contextKey)) {
      response.data = this.localContext.get(contextKey);
      response.source = 'local_context';
    } else {
      // Default response
      response.data = { message: 'Processed locally' };
      response.source = 'local_processing';
    }
    
    this.metrics.requests_served++;
    this.metrics.local_queries++;
    
    return response;
  }
  
  // ─── Add peer connection ───────────────────────────────────────────────────
  addPeer(peerId, endpoint) {
    this.peers.set(peerId, {
      id: peerId,
      endpoint,
      connected: Date.now(),
      status: 'active'
    });
    
    return this.peers.get(peerId);
  }
  
  // ─── Register model ────────────────────────────────────────────────────────
  registerModel(modelId, modelSpec) {
    this.models.set(modelId, {
      id: modelId,
      spec: modelSpec,
      registered: Date.now(),
      status: 'available'
    });
    
    return this.models.get(modelId);
  }
  
  // ─── Register tool ─────────────────────────────────────────────────────────
  registerTool(toolId, toolSpec) {
    this.tools.set(toolId, {
      id: toolId,
      spec: toolSpec,
      registered: Date.now(),
      status: 'available'
    });
    
    return this.tools.get(toolId);
  }
  
  // ─── Health check ──────────────────────────────────────────────────────────
  healthCheck() {
    const health = {
      id: this.id,
      state: this.state,
      novaConnection: this.novaConnection?.status || 'none',
      peerCount: this.peers.size,
      modelCount: this.models.size,
      toolCount: this.tools.size,
      lastNovaSync: this.lastNovaSync,
      metrics: this.metrics
    };
    
    // Calculate health score
    let score = 1.0;
    if (this.novaConnection?.status !== 'active') score *= 0.5;
    if (this.state !== HUB_STATES.ACTIVE) score *= 0.5;
    
    health.score = score;
    return health;
  }
  
  serialize() {
    return {
      id: this.id,
      type: this.type.id,
      state: this.state,
      peers: Array.from(this.peers.keys()),
      models: Array.from(this.models.keys()),
      tools: Array.from(this.tools.keys()),
      metrics: this.metrics,
      created: this.created
    };
  }
}

// ─── Multi-Node AI Hub Protocol ──────────────────────────────────────────────
export class MultiNodeAIHubProtocol {
  constructor() {
    this.id = 'HUB-001';
    this.name = 'Multi-Node AI Hub';
    this.version = '1.0.0';
    
    this.hubs = new Map();
    this.topology = new Map();  // hub_id -> Set of connected hub_ids
    
    this.metrics = {
      hubs_registered: 0,
      total_syncs: 0,
      total_requests: 0
    };
  }
  
  // ─── Create hub ────────────────────────────────────────────────────────────
  createHub(id, type, config = {}) {
    if (this.hubs.has(id)) {
      throw new Error(`Hub already exists: ${id}`);
    }
    
    const hub = new HubNode(id, type, config);
    this.hubs.set(id, hub);
    this.topology.set(id, new Set());
    this.metrics.hubs_registered++;
    
    return hub;
  }
  
  // ─── Connect hubs ──────────────────────────────────────────────────────────
  connectHubs(hubIdA, hubIdB) {
    const hubA = this.hubs.get(hubIdA);
    const hubB = this.hubs.get(hubIdB);
    
    if (!hubA || !hubB) {
      throw new Error('One or both hubs not found');
    }
    
    // Bidirectional connection
    hubA.addPeer(hubIdB, `hub://${hubIdB}`);
    hubB.addPeer(hubIdA, `hub://${hubIdA}`);
    
    this.topology.get(hubIdA).add(hubIdB);
    this.topology.get(hubIdB).add(hubIdA);
    
    return { hubA: hubIdA, hubB: hubIdB, status: 'connected' };
  }
  
  // ─── Broadcast to all hubs ─────────────────────────────────────────────────
  broadcast(message) {
    const results = [];
    
    for (const hub of this.hubs.values()) {
      results.push({
        hubId: hub.id,
        received: true,
        timestamp: Date.now()
      });
    }
    
    return results;
  }
  
  // ─── Route request to appropriate hub ──────────────────────────────────────
  route(request) {
    // Find best hub based on type and load
    let bestHub = null;
    let bestScore = -1;
    
    for (const hub of this.hubs.values()) {
      if (hub.state !== HUB_STATES.ACTIVE) continue;
      
      const health = hub.healthCheck();
      const score = health.score * hub.type.phi_weight;
      
      if (score > bestScore) {
        bestScore = score;
        bestHub = hub;
      }
    }
    
    if (!bestHub) {
      throw new Error('No available hubs');
    }
    
    const response = bestHub.serveLocal(request);
    this.metrics.total_requests++;
    
    return response;
  }
  
  // ─── Sync all hubs ─────────────────────────────────────────────────────────
  syncAll(novaData) {
    for (const hub of this.hubs.values()) {
      hub.syncWithNova(novaData);
    }
    
    this.metrics.total_syncs++;
    return this.hubs.size;
  }
  
  // ─── Get topology ──────────────────────────────────────────────────────────
  getTopology() {
    const topology = {};
    
    for (const [hubId, connections] of this.topology) {
      topology[hubId] = Array.from(connections);
    }
    
    return topology;
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      active_hubs: Array.from(this.hubs.values())
        .filter(h => h.state === HUB_STATES.ACTIVE).length,
      total_connections: Array.from(this.topology.values())
        .reduce((sum, conns) => sum + conns.size, 0) / 2
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      hubs: Array.from(this.hubs.values()).map(h => h.serialize()),
      topology: this.getTopology(),
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Each hub runs tuned models and tools',
  'Hubs connect upward to Nova, sideways to peers',
  'Local context served with local data',
  'Federation via protocols, not ownership'
];

export default MultiNodeAIHubProtocol;

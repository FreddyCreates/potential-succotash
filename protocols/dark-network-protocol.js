/**
 * Dark Network Protocol (DRK-006)
 * 
 * Mesh networking for dark layer nodes. Silent coordination
 * between distributed dark components.
 * 
 * Protocol ID: DRK-006
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Node types
 */
export const NODE_TYPES = {
  COORDINATOR: 'coordinator',
  WORKER: 'worker',
  SENTINEL: 'sentinel',
  RELAY: 'relay',
  ARCHIVE: 'archive'
};

/**
 * Node states
 */
export const NODE_STATES = {
  INITIALIZING: 'initializing',
  ACTIVE: 'active',
  STANDBY: 'standby',
  DEGRADED: 'degraded',
  OFFLINE: 'offline'
};

/**
 * Message types
 */
export const MESSAGE_TYPES = {
  HEARTBEAT: 'heartbeat',
  DATA: 'data',
  CONTROL: 'control',
  SYNC: 'sync',
  QUERY: 'query'
};

/**
 * Dark Node
 */
export class DarkNode {
  constructor(id, type = NODE_TYPES.WORKER) {
    this.id = id;
    this.type = type;
    this.state = NODE_STATES.INITIALIZING;
    this.peers = new Map();
    this.inbox = [];
    this.outbox = [];
    this.lastHeartbeat = Date.now();
    this.phase = 0;
    
    this.stats = {
      messagesReceived: 0,
      messagesSent: 0,
      bytesReceived: 0,
      bytesSent: 0
    };
  }
  
  /**
   * Start node
   */
  start() {
    this.state = NODE_STATES.ACTIVE;
    this.lastHeartbeat = Date.now();
    return { started: true, id: this.id };
  }
  
  /**
   * Stop node
   */
  stop() {
    this.state = NODE_STATES.OFFLINE;
    return { stopped: true, id: this.id };
  }
  
  /**
   * Add peer
   */
  addPeer(peerId, peerInfo = {}) {
    this.peers.set(peerId, {
      id: peerId,
      type: peerInfo.type || NODE_TYPES.WORKER,
      state: NODE_STATES.ACTIVE,
      lastSeen: Date.now(),
      latency: peerInfo.latency || 0,
      ...peerInfo
    });
    
    return { added: peerId, totalPeers: this.peers.size };
  }
  
  /**
   * Remove peer
   */
  removePeer(peerId) {
    const existed = this.peers.delete(peerId);
    return { removed: existed, peerId };
  }
  
  /**
   * Send message to peer
   */
  send(peerId, message) {
    const msg = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      from: this.id,
      to: peerId,
      type: message.type || MESSAGE_TYPES.DATA,
      payload: message.payload,
      timestamp: Date.now(),
      phase: this.phase
    };
    
    this.outbox.push(msg);
    this.stats.messagesSent++;
    this.stats.bytesSent += JSON.stringify(msg).length;
    
    return msg.id;
  }
  
  /**
   * Broadcast to all peers
   */
  broadcast(message) {
    const ids = [];
    for (const peerId of this.peers.keys()) {
      ids.push(this.send(peerId, message));
    }
    return ids;
  }
  
  /**
   * Receive message
   */
  receive(message) {
    this.inbox.push(message);
    this.stats.messagesReceived++;
    this.stats.bytesReceived += JSON.stringify(message).length;
    
    // Update peer last seen
    if (this.peers.has(message.from)) {
      this.peers.get(message.from).lastSeen = Date.now();
    }
    
    return { received: true, id: message.id };
  }
  
  /**
   * Process inbox
   */
  processInbox(handler) {
    const messages = [...this.inbox];
    this.inbox = [];
    
    const results = messages.map(msg => {
      try {
        return { id: msg.id, result: handler(msg), error: null };
      } catch (e) {
        return { id: msg.id, result: null, error: e.message };
      }
    });
    
    return results;
  }
  
  /**
   * Flush outbox
   */
  flushOutbox() {
    const messages = [...this.outbox];
    this.outbox = [];
    return messages;
  }
  
  /**
   * Send heartbeat
   */
  heartbeat() {
    this.lastHeartbeat = Date.now();
    this.phase = (this.phase + THRESHOLD) % (2 * Math.PI);
    
    return this.broadcast({
      type: MESSAGE_TYPES.HEARTBEAT,
      payload: {
        nodeId: this.id,
        nodeType: this.type,
        state: this.state,
        phase: this.phase,
        peers: this.peers.size
      }
    });
  }
  
  /**
   * Get node info
   */
  getInfo() {
    return {
      id: this.id,
      type: this.type,
      state: this.state,
      peers: this.peers.size,
      lastHeartbeat: this.lastHeartbeat,
      phase: this.phase,
      stats: { ...this.stats }
    };
  }
}

/**
 * Dark Network Mesh
 */
export class DarkNetworkMesh {
  constructor(config = {}) {
    this.config = {
      heartbeatInterval: config.heartbeatInterval || HB,
      peerTimeout: config.peerTimeout || HB * 5,
      maxPeers: config.maxPeers || 100,
      ...config
    };
    
    this.nodes = new Map();
    this.routes = new Map();
    this.created = Date.now();
  }
  
  /**
   * Add node to mesh
   */
  addNode(node) {
    if (!(node instanceof DarkNode)) {
      node = new DarkNode(node.id, node.type);
    }
    
    this.nodes.set(node.id, node);
    this.updateRoutes();
    
    return { added: node.id, totalNodes: this.nodes.size };
  }
  
  /**
   * Remove node from mesh
   */
  removeNode(nodeId) {
    const existed = this.nodes.delete(nodeId);
    
    // Remove from other nodes' peer lists
    for (const node of this.nodes.values()) {
      node.removePeer(nodeId);
    }
    
    this.updateRoutes();
    return { removed: existed, nodeId };
  }
  
  /**
   * Get node
   */
  getNode(nodeId) {
    return this.nodes.get(nodeId);
  }
  
  /**
   * Connect two nodes
   */
  connect(nodeId1, nodeId2) {
    const node1 = this.nodes.get(nodeId1);
    const node2 = this.nodes.get(nodeId2);
    
    if (!node1 || !node2) {
      return { connected: false, error: 'Node not found' };
    }
    
    node1.addPeer(nodeId2, { type: node2.type });
    node2.addPeer(nodeId1, { type: node1.type });
    
    this.updateRoutes();
    
    return { connected: true, nodes: [nodeId1, nodeId2] };
  }
  
  /**
   * Disconnect two nodes
   */
  disconnect(nodeId1, nodeId2) {
    const node1 = this.nodes.get(nodeId1);
    const node2 = this.nodes.get(nodeId2);
    
    if (node1) node1.removePeer(nodeId2);
    if (node2) node2.removePeer(nodeId1);
    
    this.updateRoutes();
    
    return { disconnected: true, nodes: [nodeId1, nodeId2] };
  }
  
  /**
   * Update routing tables
   */
  updateRoutes() {
    this.routes.clear();
    
    // Build adjacency map
    for (const node of this.nodes.values()) {
      const neighbors = [...node.peers.keys()];
      this.routes.set(node.id, new Set(neighbors));
    }
  }
  
  /**
   * Find route between nodes
   */
  findRoute(fromId, toId) {
    if (fromId === toId) return [fromId];
    
    const visited = new Set();
    const queue = [[fromId]];
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      if (current === toId) return path;
      if (visited.has(current)) continue;
      
      visited.add(current);
      const neighbors = this.routes.get(current) || new Set();
      
      for (const neighbor of neighbors) {
        if (!visited.has(neighbor)) {
          queue.push([...path, neighbor]);
        }
      }
    }
    
    return null; // No route
  }
  
  /**
   * Route message through mesh
   */
  routeMessage(fromId, toId, message) {
    const route = this.findRoute(fromId, toId);
    
    if (!route) {
      return { routed: false, error: 'No route' };
    }
    
    // Send through each hop
    for (let i = 0; i < route.length - 1; i++) {
      const node = this.nodes.get(route[i]);
      const nextHop = route[i + 1];
      node.send(nextHop, {
        type: MESSAGE_TYPES.DATA,
        payload: {
          ...message,
          route,
          hop: i,
          finalDestination: toId
        }
      });
    }
    
    return { routed: true, route, hops: route.length - 1 };
  }
  
  /**
   * Tick - process all nodes
   */
  tick() {
    for (const node of this.nodes.values()) {
      // Send heartbeats
      if (Date.now() - node.lastHeartbeat > this.config.heartbeatInterval) {
        node.heartbeat();
      }
      
      // Check peer timeouts
      for (const [peerId, peer] of node.peers) {
        if (Date.now() - peer.lastSeen > this.config.peerTimeout) {
          peer.state = NODE_STATES.DEGRADED;
        }
      }
    }
    
    // Process message routing
    for (const node of this.nodes.values()) {
      const messages = node.flushOutbox();
      
      for (const msg of messages) {
        const target = this.nodes.get(msg.to);
        if (target) {
          target.receive(msg);
        }
      }
    }
    
    return {
      nodes: this.nodes.size,
      timestamp: Date.now()
    };
  }
  
  /**
   * Get mesh statistics
   */
  getStats() {
    let totalPeers = 0;
    let totalMessages = 0;
    
    for (const node of this.nodes.values()) {
      totalPeers += node.peers.size;
      totalMessages += node.stats.messagesReceived + node.stats.messagesSent;
    }
    
    return {
      nodes: this.nodes.size,
      connections: totalPeers / 2, // Each connection counted twice
      totalMessages,
      uptime: Date.now() - this.created
    };
  }
}

/**
 * Dark Network Protocol
 */
export const DarkNetworkProtocol = {
  id: 'DRK-006',
  name: 'Dark Network Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  nodeTypes: NODE_TYPES,
  nodeStates: NODE_STATES,
  messageTypes: MESSAGE_TYPES,
  
  createNode: (id, type) => new DarkNode(id, type),
  createMesh: (config) => new DarkNetworkMesh(config)
};

export default DarkNetworkProtocol;

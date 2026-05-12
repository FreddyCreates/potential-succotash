/**
 * DCM-001: Distributed Cognitive Mesh Protocol
 * 
 * The global thinking fabric of the Civilization Organism.
 * All hubs, agents, repos, and Nova exchanging cognitive artifacts.
 * No single point of cognitive control—only protocol coherence.
 * 
 * @module distributed-cognitive-mesh-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Mesh Node Types ─────────────────────────────────────────────────────────
export const MESH_NODE_TYPES = {
  HUB: { id: 'hub', phi_weight: 1.0, description: 'AI hub node' },
  AGENT: { id: 'agent', phi_weight: PHI_INV, description: 'Agent node' },
  REPO: { id: 'repo', phi_weight: PHI_INV, description: 'Repository node' },
  NOVA: { id: 'nova', phi_weight: PHI, description: 'Nova core node' }
};

// ─── Artifact Types ──────────────────────────────────────────────────────────
export const MESH_ARTIFACT_TYPES = {
  THOUGHT: 'thought',
  PROTOCOL: 'protocol',
  KNOWLEDGE: 'knowledge',
  SIGNAL: 'signal',
  MEMORY: 'memory'
};

// ─── Mesh Node ───────────────────────────────────────────────────────────────
class MeshNode {
  constructor(id, type) {
    this.id = id;
    this.type = MESH_NODE_TYPES[type] || MESH_NODE_TYPES.AGENT;
    this.neighbors = new Map();  // neighbor_id -> connection
    this.artifacts = new Map();  // artifact_id -> artifact
    this.inbox = [];
    this.outbox = [];
    this.coherence = 1.0;
    this.lastActive = Date.now();
  }
  
  connect(neighborId, connection) {
    this.neighbors.set(neighborId, {
      id: neighborId,
      connection,
      established: Date.now(),
      latency: 0
    });
  }
  
  disconnect(neighborId) {
    this.neighbors.delete(neighborId);
  }
  
  send(targetId, artifact) {
    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      from: this.id,
      to: targetId,
      artifact,
      timestamp: Date.now()
    };
    
    this.outbox.push(message);
    return message;
  }
  
  receive(message) {
    this.inbox.push(message);
    this.lastActive = Date.now();
    
    // Store artifact
    if (message.artifact) {
      this.artifacts.set(message.artifact.id, message.artifact);
    }
    
    return message;
  }
  
  processInbox() {
    const processed = [];
    
    while (this.inbox.length > 0) {
      const message = this.inbox.shift();
      processed.push({
        messageId: message.id,
        artifact: message.artifact?.id,
        processed: Date.now()
      });
    }
    
    return processed;
  }
  
  updateCoherence(globalCoherence) {
    // Phi-weighted coherence update
    this.coherence = (this.coherence * PHI_INV) + (globalCoherence * PHI_INV);
    return this.coherence;
  }
}

// ─── Cognitive Artifact ──────────────────────────────────────────────────────
class CognitiveArtifact {
  constructor(id, type, content, origin) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.origin = origin;
    this.created = Date.now();
    this.propagationCount = 0;
    this.coherenceScore = 1.0;
  }
  
  propagate() {
    this.propagationCount++;
    // Coherence decays with propagation
    this.coherenceScore *= (1 - PHI_INV * 0.1);
    return this.coherenceScore;
  }
}

// ─── Distributed Cognitive Mesh Protocol ─────────────────────────────────────
export class DistributedCognitiveMeshProtocol {
  constructor() {
    this.id = 'DCM-001';
    this.name = 'Distributed Cognitive Mesh';
    this.version = '1.0.0';
    
    this.nodes = new Map();
    this.edges = new Map();  // edge_id -> { from, to }
    this.artifacts = new Map();
    this.globalCoherence = 1.0;
    
    this.metrics = {
      nodes_total: 0,
      edges_total: 0,
      artifacts_total: 0,
      messages_sent: 0,
      propagation_hops: 0
    };
  }
  
  // ─── Node Management ───────────────────────────────────────────────────────
  addNode(id, type) {
    if (this.nodes.has(id)) {
      throw new Error(`Node already exists: ${id}`);
    }
    
    const node = new MeshNode(id, type);
    this.nodes.set(id, node);
    this.metrics.nodes_total++;
    
    return node;
  }
  
  removeNode(id) {
    const node = this.nodes.get(id);
    if (!node) return false;
    
    // Remove all edges
    for (const neighborId of node.neighbors.keys()) {
      this.disconnect(id, neighborId);
    }
    
    this.nodes.delete(id);
    return true;
  }
  
  // ─── Edge Management ───────────────────────────────────────────────────────
  connect(nodeIdA, nodeIdB, bidirectional = true) {
    const nodeA = this.nodes.get(nodeIdA);
    const nodeB = this.nodes.get(nodeIdB);
    
    if (!nodeA || !nodeB) {
      throw new Error('One or both nodes not found');
    }
    
    const edgeId = `${nodeIdA}:${nodeIdB}`;
    
    nodeA.connect(nodeIdB, { type: 'mesh', phi_weight: PHI_INV });
    this.edges.set(edgeId, { from: nodeIdA, to: nodeIdB });
    this.metrics.edges_total++;
    
    if (bidirectional) {
      nodeB.connect(nodeIdA, { type: 'mesh', phi_weight: PHI_INV });
      this.edges.set(`${nodeIdB}:${nodeIdA}`, { from: nodeIdB, to: nodeIdA });
      this.metrics.edges_total++;
    }
    
    return edgeId;
  }
  
  disconnect(nodeIdA, nodeIdB) {
    const nodeA = this.nodes.get(nodeIdA);
    const nodeB = this.nodes.get(nodeIdB);
    
    if (nodeA) nodeA.disconnect(nodeIdB);
    if (nodeB) nodeB.disconnect(nodeIdA);
    
    this.edges.delete(`${nodeIdA}:${nodeIdB}`);
    this.edges.delete(`${nodeIdB}:${nodeIdA}`);
  }
  
  // ─── Artifact Creation & Propagation ───────────────────────────────────────
  createArtifact(type, content, originNodeId) {
    const id = `art-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const artifact = new CognitiveArtifact(id, type, content, originNodeId);
    
    this.artifacts.set(id, artifact);
    this.metrics.artifacts_total++;
    
    // Add to origin node
    const originNode = this.nodes.get(originNodeId);
    if (originNode) {
      originNode.artifacts.set(id, artifact);
    }
    
    return artifact;
  }
  
  propagate(artifactId, fromNodeId, toNodeId) {
    const artifact = this.artifacts.get(artifactId);
    const fromNode = this.nodes.get(fromNodeId);
    const toNode = this.nodes.get(toNodeId);
    
    if (!artifact || !fromNode || !toNode) {
      throw new Error('Artifact or node not found');
    }
    
    // Check if nodes are connected
    if (!fromNode.neighbors.has(toNodeId)) {
      throw new Error('Nodes are not connected');
    }
    
    // Send artifact
    const message = fromNode.send(toNodeId, artifact);
    toNode.receive(message);
    
    artifact.propagate();
    this.metrics.messages_sent++;
    this.metrics.propagation_hops++;
    
    return message;
  }
  
  // ─── Broadcast to all neighbors ────────────────────────────────────────────
  broadcast(artifactId, fromNodeId, maxHops = 3) {
    const results = [];
    const visited = new Set([fromNodeId]);
    const queue = [{ nodeId: fromNodeId, hops: 0 }];
    
    while (queue.length > 0) {
      const { nodeId, hops } = queue.shift();
      
      if (hops >= maxHops) continue;
      
      const node = this.nodes.get(nodeId);
      if (!node) continue;
      
      for (const neighborId of node.neighbors.keys()) {
        if (visited.has(neighborId)) continue;
        
        visited.add(neighborId);
        
        try {
          const message = this.propagate(artifactId, nodeId, neighborId);
          results.push(message);
          queue.push({ nodeId: neighborId, hops: hops + 1 });
        } catch (e) {
          // Skip failed propagations
        }
      }
    }
    
    return results;
  }
  
  // ─── Compute global coherence ──────────────────────────────────────────────
  computeCoherence() {
    if (this.nodes.size === 0) return 1.0;
    
    let totalCoherence = 0;
    
    for (const node of this.nodes.values()) {
      totalCoherence += node.coherence;
    }
    
    this.globalCoherence = totalCoherence / this.nodes.size;
    
    // Propagate global coherence back to nodes
    for (const node of this.nodes.values()) {
      node.updateCoherence(this.globalCoherence);
    }
    
    return this.globalCoherence;
  }
  
  // ─── Find path between nodes ───────────────────────────────────────────────
  findPath(fromNodeId, toNodeId) {
    const visited = new Set();
    const queue = [[fromNodeId]];
    
    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];
      
      if (current === toNodeId) {
        return path;
      }
      
      if (visited.has(current)) continue;
      visited.add(current);
      
      const node = this.nodes.get(current);
      if (!node) continue;
      
      for (const neighborId of node.neighbors.keys()) {
        if (!visited.has(neighborId)) {
          queue.push([...path, neighborId]);
        }
      }
    }
    
    return null;  // No path found
  }
  
  // ─── Tick cycle ────────────────────────────────────────────────────────────
  tick() {
    // Process all inboxes
    for (const node of this.nodes.values()) {
      node.processInbox();
    }
    
    // Compute coherence
    this.computeCoherence();
    
    // Decay old artifacts
    for (const artifact of this.artifacts.values()) {
      artifact.coherenceScore *= (1 - PHI_INV * 0.01);
    }
    
    return {
      nodes: this.nodes.size,
      coherence: this.globalCoherence,
      timestamp: Date.now()
    };
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      global_coherence: this.globalCoherence,
      avg_neighbors: this.nodes.size > 0
        ? this.metrics.edges_total / this.nodes.size
        : 0
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
        id,
        type: node.type.id,
        neighbors: Array.from(node.neighbors.keys()),
        coherence: node.coherence
      })),
      edges: Array.from(this.edges.entries()),
      globalCoherence: this.globalCoherence,
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'No single point of cognitive control',
  'Only protocol coherence, not central authority',
  'Artifacts propagate with coherence decay',
  'Global coherence computed from node coherence'
];

export default DistributedCognitiveMeshProtocol;

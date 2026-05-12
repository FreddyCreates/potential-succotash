/**
 * PROTO-238: Alpha Knowledge Graph Protocol
 * 
 * Builds and maintains a knowledge graph of organism relationships.
 * Supports semantic queries, path finding, and relationship inference.
 *
 * @module alpha-knowledge-graph-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

const EDGE_TYPES = {
  DEPENDS_ON: { weight: PHI, directed: true },
  CALLS: { weight: 1, directed: true },
  RESONATES_WITH: { weight: PHI, directed: false },
  PART_OF: { weight: PHI_INV, directed: true },
  SIMILAR_TO: { weight: PHI_INV, directed: false },
};

class AlphaKnowledgeGraphProtocol {
  constructor() {
    this.id = 'PROTO-238';
    this.name = 'Alpha Knowledge Graph Protocol';
    this.nodes = new Map();
    this.edges = [];
    this.metrics = { nodesAdded: 0, edgesAdded: 0, queriesExecuted: 0 };
  }

  addNode(nodeId, type, properties = {}) {
    this.nodes.set(nodeId, {
      id: nodeId,
      type,
      properties,
      created: Date.now(),
    });
    this.metrics.nodesAdded++;
    return this.nodes.get(nodeId);
  }

  addEdge(fromId, toId, edgeType, properties = {}) {
    const type = EDGE_TYPES[edgeType] || EDGE_TYPES.CALLS;
    const edge = {
      id: `e-${this.edges.length}`,
      from: fromId,
      to: toId,
      type: edgeType,
      weight: type.weight,
      directed: type.directed,
      properties,
      created: Date.now(),
    };
    this.edges.push(edge);
    this.metrics.edgesAdded++;
    return edge;
  }

  query(pattern) {
    this.metrics.queriesExecuted++;
    const results = [];

    // Simple pattern matching
    if (pattern.nodeType) {
      for (const [id, node] of this.nodes) {
        if (node.type === pattern.nodeType) {
          results.push(node);
        }
      }
    }

    if (pattern.edgeType) {
      const matchingEdges = this.edges.filter(e => e.type === pattern.edgeType);
      for (const edge of matchingEdges) {
        results.push({
          edge,
          from: this.nodes.get(edge.from),
          to: this.nodes.get(edge.to),
        });
      }
    }

    return results;
  }

  findPath(fromId, toId, maxDepth = 5) {
    const visited = new Set();
    const queue = [[fromId]];

    while (queue.length > 0) {
      const path = queue.shift();
      const current = path[path.length - 1];

      if (current === toId) return { found: true, path };
      if (path.length > maxDepth) continue;
      if (visited.has(current)) continue;

      visited.add(current);

      const outgoing = this.edges.filter(e => e.from === current || (!e.directed && e.to === current));
      for (const edge of outgoing) {
        const next = edge.from === current ? edge.to : edge.from;
        if (!visited.has(next)) {
          queue.push([...path, next]);
        }
      }
    }

    return { found: false, path: [] };
  }

  getNeighbors(nodeId, depth = 1) {
    const neighbors = new Set();
    const queue = [{ id: nodeId, depth: 0 }];
    const visited = new Set();

    while (queue.length > 0) {
      const { id, depth: d } = queue.shift();
      if (d >= depth || visited.has(id)) continue;
      visited.add(id);

      const edges = this.edges.filter(e => e.from === id || e.to === id);
      for (const edge of edges) {
        const neighbor = edge.from === id ? edge.to : edge.from;
        neighbors.add(neighbor);
        queue.push({ id: neighbor, depth: d + 1 });
      }
    }

    neighbors.delete(nodeId);
    return Array.from(neighbors).map(id => this.nodes.get(id));
  }

  getGraphStats() {
    return {
      nodes: this.nodes.size,
      edges: this.edges.length,
      avgDegree: this.edges.length * 2 / (this.nodes.size || 1),
      metrics: this.metrics,
    };
  }

  getMetrics() { return this.metrics; }
}

export { AlphaKnowledgeGraphProtocol, EDGE_TYPES };
export default AlphaKnowledgeGraphProtocol;

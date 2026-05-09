/**
 * REV-001: Reasoning Engine Layer Protocol
 * 
 * The active cognitive substrate of the Civilization Organism.
 * Manages the dynamic computational graph during inference:
 * attention patterns, internal representations, routing, and synthesis.
 * 
 * @module reasoning-engine-layer-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;  // 0.618...
const HEARTBEAT = 873;
const EMERGENCE_THRESHOLD = PHI_INV;

// ─── Input Types ─────────────────────────────────────────────────────────────
export const INPUT_TYPES = {
  PROMPT: 'prompt',
  CODE_BLOCK: 'code_block',
  AGENT_DIRECTIVE: 'agent_directive',
  PROTOCOL_UPDATE: 'protocol_update',
  ARTIFACT_REFERENCE: 'artifact_reference'
};

// ─── Output Types ────────────────────────────────────────────────────────────
export const OUTPUT_TYPES = {
  STRUCTURED_THOUGHT: 'structured_thought',
  ARTIFACT: 'artifact',
  PROTOCOL_UPDATE: 'protocol_update',
  AGENT_DISPATCH: 'agent_dispatch',
  MEMORY_TRACE: 'memory_trace'
};

// ─── Attention Patterns ──────────────────────────────────────────────────────
export const ATTENTION_PATTERNS = {
  FOCUSED: { spread: 0.1, depth: 0.9, phi_weight: PHI },
  DIFFUSE: { spread: 0.8, depth: 0.3, phi_weight: PHI_INV },
  SCANNING: { spread: 0.5, depth: 0.5, phi_weight: 1.0 },
  CONVERGENT: { spread: 0.3, depth: 0.7, phi_weight: PHI },
  DIVERGENT: { spread: 0.7, depth: 0.4, phi_weight: PHI_INV }
};

// ─── Cognitive Node ──────────────────────────────────────────────────────────
class CognitiveNode {
  constructor(id, type, content) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.created = Date.now();
    this.activation = 0;
    this.connections = new Map();
    this.metadata = {};
  }
  
  connect(targetNode, weight = 1.0) {
    this.connections.set(targetNode.id, {
      target: targetNode,
      weight: weight * PHI_INV,  // Phi-normalized
      strength: 0
    });
  }
  
  activate(signal, pattern = ATTENTION_PATTERNS.FOCUSED) {
    // Phi-weighted activation with attention pattern
    this.activation = Math.min(1.0, 
      this.activation + (signal * pattern.phi_weight * PHI_INV)
    );
    
    // Propagate to connections
    for (const conn of this.connections.values()) {
      const propagated = this.activation * conn.weight * pattern.spread;
      if (propagated > 0.1) {
        conn.target.activate(propagated, pattern);
        conn.strength += propagated * 0.1;  // Hebbian strengthening
      }
    }
    
    return this.activation;
  }
  
  decay(rate = PHI_INV * 0.1) {
    this.activation *= (1 - rate);
    return this.activation;
  }
}

// ─── Reasoning Graph ─────────────────────────────────────────────────────────
class ReasoningGraph {
  constructor() {
    this.nodes = new Map();
    this.activeSet = new Set();
    this.rootNodes = new Set();
    this.timestamp = Date.now();
  }
  
  addNode(id, type, content) {
    const node = new CognitiveNode(id, type, content);
    this.nodes.set(id, node);
    return node;
  }
  
  getNode(id) {
    return this.nodes.get(id);
  }
  
  connect(sourceId, targetId, weight = 1.0) {
    const source = this.nodes.get(sourceId);
    const target = this.nodes.get(targetId);
    if (source && target) {
      source.connect(target, weight);
    }
  }
  
  activateNode(id, signal = 1.0, pattern = ATTENTION_PATTERNS.FOCUSED) {
    const node = this.nodes.get(id);
    if (node) {
      this.activeSet.add(id);
      return node.activate(signal, pattern);
    }
    return 0;
  }
  
  tick() {
    // Decay all nodes
    for (const node of this.nodes.values()) {
      node.decay();
      if (node.activation < 0.01) {
        this.activeSet.delete(node.id);
      }
    }
    
    // Return emergence score
    return this.computeEmergence();
  }
  
  computeEmergence() {
    if (this.nodes.size === 0) return 0;
    
    const totalActivation = Array.from(this.nodes.values())
      .reduce((sum, node) => sum + node.activation, 0);
    const avgActivation = totalActivation / this.nodes.size;
    
    // Emergence when average activation exceeds threshold
    return avgActivation * PHI;
  }
}

// ─── Reasoning Engine Protocol ───────────────────────────────────────────────
export class ReasoningEngineLayerProtocol {
  constructor() {
    this.id = 'REV-001';
    this.name = 'Reasoning Engine Layer';
    this.version = '1.0.0';
    this.graph = new ReasoningGraph();
    this.inputQueue = [];
    this.outputQueue = [];
    this.state = 'idle';
    this.metrics = {
      inputs_processed: 0,
      outputs_generated: 0,
      emergence_events: 0,
      avg_latency_ms: 0
    };
  }
  
  // ─── API: Input Processing ─────────────────────────────────────────────────
  input(type, content, metadata = {}) {
    if (!INPUT_TYPES[type]) {
      throw new Error(`Unknown input type: ${type}`);
    }
    
    const input = {
      id: `inp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      content,
      metadata,
      timestamp: Date.now()
    };
    
    this.inputQueue.push(input);
    return input.id;
  }
  
  // ─── API: Process Cycle ────────────────────────────────────────────────────
  process() {
    this.state = 'processing';
    const startTime = Date.now();
    const outputs = [];
    
    while (this.inputQueue.length > 0) {
      const input = this.inputQueue.shift();
      
      // Create cognitive node for input
      const node = this.graph.addNode(
        input.id,
        input.type,
        input.content
      );
      node.metadata = input.metadata;
      
      // Activate based on input type
      const pattern = this.selectAttentionPattern(input.type);
      this.graph.activateNode(input.id, 1.0, pattern);
      
      // Generate output based on processing
      const output = this.synthesize(node, pattern);
      if (output) {
        outputs.push(output);
        this.outputQueue.push(output);
      }
      
      this.metrics.inputs_processed++;
    }
    
    // Tick the graph
    const emergence = this.graph.tick();
    if (emergence > EMERGENCE_THRESHOLD) {
      this.metrics.emergence_events++;
      // Trigger emergence cascade
      this.onEmergence(emergence);
    }
    
    // Update metrics
    const latency = Date.now() - startTime;
    this.metrics.avg_latency_ms = 
      (this.metrics.avg_latency_ms * 0.9) + (latency * 0.1);
    
    this.state = 'idle';
    return outputs;
  }
  
  // ─── Internal: Attention Pattern Selection ─────────────────────────────────
  selectAttentionPattern(inputType) {
    switch (inputType) {
      case INPUT_TYPES.PROMPT:
        return ATTENTION_PATTERNS.DIVERGENT;
      case INPUT_TYPES.CODE_BLOCK:
        return ATTENTION_PATTERNS.FOCUSED;
      case INPUT_TYPES.AGENT_DIRECTIVE:
        return ATTENTION_PATTERNS.CONVERGENT;
      case INPUT_TYPES.PROTOCOL_UPDATE:
        return ATTENTION_PATTERNS.SCANNING;
      default:
        return ATTENTION_PATTERNS.DIFFUSE;
    }
  }
  
  // ─── Internal: Output Synthesis ────────────────────────────────────────────
  synthesize(node, pattern) {
    // Determine output type based on input and activation
    let outputType;
    if (node.type === INPUT_TYPES.CODE_BLOCK) {
      outputType = OUTPUT_TYPES.ARTIFACT;
    } else if (node.type === INPUT_TYPES.AGENT_DIRECTIVE) {
      outputType = OUTPUT_TYPES.AGENT_DISPATCH;
    } else if (node.type === INPUT_TYPES.PROTOCOL_UPDATE) {
      outputType = OUTPUT_TYPES.PROTOCOL_UPDATE;
    } else {
      outputType = OUTPUT_TYPES.STRUCTURED_THOUGHT;
    }
    
    const output = {
      id: `out-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type: outputType,
      source_id: node.id,
      content: this.generateContent(node, pattern),
      activation: node.activation,
      emergence: this.graph.computeEmergence(),
      timestamp: Date.now()
    };
    
    this.metrics.outputs_generated++;
    return output;
  }
  
  // ─── Internal: Content Generation ──────────────────────────────────────────
  generateContent(node, pattern) {
    // In production, this would invoke actual reasoning
    // For now, return structured representation
    return {
      source: node.content,
      attention_pattern: pattern,
      activation_level: node.activation,
      connected_nodes: Array.from(node.connections.keys()),
      phi_weighted_confidence: node.activation * PHI_INV
    };
  }
  
  // ─── Internal: Emergence Handler ───────────────────────────────────────────
  onEmergence(level) {
    // Emit emergence event
    const event = {
      type: 'emergence',
      level,
      timestamp: Date.now(),
      active_nodes: this.graph.activeSet.size,
      total_nodes: this.graph.nodes.size
    };
    
    // Could trigger cascade to other protocols
    return event;
  }
  
  // ─── API: Get Outputs ──────────────────────────────────────────────────────
  getOutputs(count = 10) {
    return this.outputQueue.splice(0, count);
  }
  
  // ─── API: Get Metrics ──────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      state: this.state,
      graph_size: this.graph.nodes.size,
      active_nodes: this.graph.activeSet.size,
      emergence: this.graph.computeEmergence()
    };
  }
  
  // ─── API: Clear Graph ──────────────────────────────────────────────────────
  reset() {
    this.graph = new ReasoningGraph();
    this.inputQueue = [];
    this.outputQueue = [];
    this.state = 'idle';
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Stateless at hardware level, stateful at conceptual level',
  'Always mediated by agents + protocols, never raw',
  'PHI constant immutable in all calculations',
  'Emergence threshold is PHI_INV (0.618...)'
];

export default ReasoningEngineLayerProtocol;

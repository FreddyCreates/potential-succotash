/**
 * KNOWLEDGE SYNTHESIS & TRANSFER PROTOCOL (KST-001)
 * 
 * Cross-Domain Knowledge Bridging Architecture
 * 
 * This protocol enables intelligent knowledge synthesis across domains:
 * - Knowledge Graph Construction & Navigation
 * - Cross-Domain Concept Mapping
 * - Analogy & Metaphor Detection
 * - Knowledge Distillation & Compression
 * - Transfer Learning Orchestration
 * - Semantic Similarity Networks
 * - Ontology Alignment & Merging
 * - Concept Drift Tracking
 * 
 * @protocol KST-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// Knowledge Domain Types
const KNOWLEDGE_DOMAINS = {
  SCIENTIFIC: 'SCIENTIFIC',
  TECHNICAL: 'TECHNICAL',
  ARTISTIC: 'ARTISTIC',
  PHILOSOPHICAL: 'PHILOSOPHICAL',
  SOCIAL: 'SOCIAL',
  ECONOMIC: 'ECONOMIC',
  LEGAL: 'LEGAL',
  MEDICAL: 'MEDICAL',
  LINGUISTIC: 'LINGUISTIC',
  MATHEMATICAL: 'MATHEMATICAL',
  HISTORICAL: 'HISTORICAL',
  CULTURAL: 'CULTURAL'
};

// Synthesis Modes
const SYNTHESIS_MODES = {
  ANALOGY: 'ANALOGY',
  ABSTRACTION: 'ABSTRACTION',
  INTEGRATION: 'INTEGRATION',
  DISTILLATION: 'DISTILLATION',
  TRANSFER: 'TRANSFER',
  ALIGNMENT: 'ALIGNMENT',
  FUSION: 'FUSION',
  DECOMPOSITION: 'DECOMPOSITION'
};

// Concept Relation Types
const RELATION_TYPES = {
  IS_A: 'IS_A',
  PART_OF: 'PART_OF',
  CAUSES: 'CAUSES',
  ENABLES: 'ENABLES',
  CONTRADICTS: 'CONTRADICTS',
  SIMILAR_TO: 'SIMILAR_TO',
  OPPOSITE_OF: 'OPPOSITE_OF',
  DERIVES_FROM: 'DERIVES_FROM',
  INSTANTIATES: 'INSTANTIATES',
  GENERALIZES: 'GENERALIZES'
};

// Transfer Strategies
const TRANSFER_STRATEGIES = {
  DIRECT_MAPPING: 'DIRECT_MAPPING',
  ANALOGICAL_REASONING: 'ANALOGICAL_REASONING',
  STRUCTURAL_ALIGNMENT: 'STRUCTURAL_ALIGNMENT',
  FEATURE_EXTRACTION: 'FEATURE_EXTRACTION',
  PROTOTYPE_MATCHING: 'PROTOTYPE_MATCHING',
  GRAPH_EMBEDDING: 'GRAPH_EMBEDDING'
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * KnowledgeConcept - Represents a concept in the knowledge space
 */
class KnowledgeConcept {
  constructor(id, name, domain) {
    this.id = id;
    this.name = name;
    this.domain = domain;
    this.properties = new Map();
    this.relations = [];
    this.embedding = null;
    this.activation = 0;
    this.lastAccess = Date.now();
    this.accessCount = 0;
    this.confidence = 1.0;
  }

  addProperty(key, value) {
    this.properties.set(key, value);
    return this;
  }

  addRelation(type, targetId, strength = 1.0) {
    this.relations.push({ type, targetId, strength, created: Date.now() });
    return this;
  }

  setEmbedding(vector) {
    this.embedding = vector;
    return this;
  }

  activate(amount = 0.1) {
    this.activation = Math.min(1.0, this.activation + amount);
    this.lastAccess = Date.now();
    this.accessCount++;
    return this;
  }

  decay(rate = 0.01) {
    this.activation = Math.max(0, this.activation - rate);
    return this;
  }

  similarity(other) {
    if (!this.embedding || !other.embedding) return 0;
    let dot = 0, magA = 0, magB = 0;
    for (let i = 0; i < this.embedding.length; i++) {
      dot += this.embedding[i] * other.embedding[i];
      magA += this.embedding[i] ** 2;
      magB += other.embedding[i] ** 2;
    }
    return dot / (Math.sqrt(magA) * Math.sqrt(magB));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      domain: this.domain,
      properties: Object.fromEntries(this.properties),
      relations: this.relations,
      activation: this.activation,
      confidence: this.confidence
    };
  }
}

/**
 * KnowledgeGraph - Graph-based knowledge representation
 */
class KnowledgeGraph {
  constructor(name) {
    this.name = name;
    this.concepts = new Map();
    this.domains = new Set();
    this.bridges = [];
    this.created = Date.now();
  }

  addConcept(concept) {
    this.concepts.set(concept.id, concept);
    this.domains.add(concept.domain);
    return this;
  }

  getConcept(id) {
    return this.concepts.get(id);
  }

  findByDomain(domain) {
    const result = [];
    for (const concept of this.concepts.values()) {
      if (concept.domain === domain) result.push(concept);
    }
    return result;
  }

  findRelated(conceptId, depth = 1) {
    const concept = this.concepts.get(conceptId);
    if (!concept) return [];
    
    const visited = new Set([conceptId]);
    const result = [];
    const queue = [{ id: conceptId, level: 0 }];
    
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (level >= depth) continue;
      
      const c = this.concepts.get(id);
      if (!c) continue;
      
      for (const rel of c.relations) {
        if (!visited.has(rel.targetId)) {
          visited.add(rel.targetId);
          const target = this.concepts.get(rel.targetId);
          if (target) {
            result.push({ concept: target, relation: rel, distance: level + 1 });
            queue.push({ id: rel.targetId, level: level + 1 });
          }
        }
      }
    }
    
    return result;
  }

  addBridge(sourceId, targetId, bridgeType, metadata = {}) {
    this.bridges.push({
      id: `bridge-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      sourceId,
      targetId,
      bridgeType,
      metadata,
      created: Date.now(),
      strength: 1.0
    });
    return this;
  }

  getStats() {
    return {
      name: this.name,
      conceptCount: this.concepts.size,
      domainCount: this.domains.size,
      bridgeCount: this.bridges.length,
      domains: Array.from(this.domains)
    };
  }
}

/**
 * AnalogyEngine - Detects and creates analogies between domains
 */
class AnalogyEngine {
  constructor() {
    this.analogies = [];
    this.mappings = new Map();
  }

  detectAnalogy(sourceGraph, targetGraph, threshold = 0.7) {
    const analogies = [];
    
    for (const sourceConcept of sourceGraph.concepts.values()) {
      for (const targetConcept of targetGraph.concepts.values()) {
        const similarity = this.computeStructuralSimilarity(
          sourceConcept, targetConcept, sourceGraph, targetGraph
        );
        
        if (similarity >= threshold) {
          analogies.push({
            source: sourceConcept.id,
            target: targetConcept.id,
            similarity,
            mappingType: this.determineMappingType(sourceConcept, targetConcept)
          });
        }
      }
    }
    
    return analogies.sort((a, b) => b.similarity - a.similarity);
  }

  computeStructuralSimilarity(source, target, sourceGraph, targetGraph) {
    // Compare relation patterns
    const sourceRelTypes = new Set(source.relations.map(r => r.type));
    const targetRelTypes = new Set(target.relations.map(r => r.type));
    
    const intersection = new Set([...sourceRelTypes].filter(x => targetRelTypes.has(x)));
    const union = new Set([...sourceRelTypes, ...targetRelTypes]);
    
    const jaccardSim = union.size > 0 ? intersection.size / union.size : 0;
    
    // Compare embedding similarity if available
    const embeddingSim = source.similarity(target);
    
    // Weighted combination
    return jaccardSim * 0.4 + embeddingSim * 0.6;
  }

  determineMappingType(source, target) {
    if (source.domain === target.domain) return 'INTRA_DOMAIN';
    return 'CROSS_DOMAIN';
  }

  createAnalogicalMapping(sourceId, targetId, relations) {
    const mapping = {
      id: `mapping-${Date.now()}`,
      sourceId,
      targetId,
      relations,
      confidence: 1.0,
      created: Date.now()
    };
    this.mappings.set(mapping.id, mapping);
    this.analogies.push(mapping);
    return mapping;
  }
}

/**
 * KnowledgeDistiller - Compresses and distills knowledge
 */
class KnowledgeDistiller {
  constructor() {
    this.distillations = [];
  }

  distill(graph, targetSize) {
    const concepts = Array.from(graph.concepts.values());
    
    // Rank concepts by importance (activation * confidence * relation count)
    const ranked = concepts.map(c => ({
      concept: c,
      importance: c.activation * c.confidence * (c.relations.length + 1)
    })).sort((a, b) => b.importance - a.importance);
    
    // Select top concepts
    const selected = ranked.slice(0, targetSize).map(r => r.concept);
    
    // Build distilled graph
    const distilled = new KnowledgeGraph(`${graph.name}_distilled`);
    const selectedIds = new Set(selected.map(c => c.id));
    
    for (const concept of selected) {
      // Filter relations to only selected concepts
      const filteredConcept = new KnowledgeConcept(
        concept.id, concept.name, concept.domain
      );
      filteredConcept.properties = concept.properties;
      filteredConcept.embedding = concept.embedding;
      filteredConcept.activation = concept.activation;
      filteredConcept.confidence = concept.confidence;
      filteredConcept.relations = concept.relations.filter(
        r => selectedIds.has(r.targetId)
      );
      distilled.addConcept(filteredConcept);
    }
    
    this.distillations.push({
      original: graph.name,
      distilled: distilled.name,
      compression: concepts.length / targetSize,
      timestamp: Date.now()
    });
    
    return distilled;
  }

  abstract(concepts, level = 1) {
    // Create abstract concept from multiple concepts
    const commonProperties = new Map();
    const allRelTypes = new Set();
    
    for (const concept of concepts) {
      for (const [key, value] of concept.properties) {
        if (!commonProperties.has(key)) {
          commonProperties.set(key, { value, count: 1 });
        } else {
          const existing = commonProperties.get(key);
          if (existing.value === value) existing.count++;
        }
      }
      for (const rel of concept.relations) {
        allRelTypes.add(rel.type);
      }
    }
    
    // Keep only properties shared by majority
    const threshold = concepts.length * 0.6;
    const abstractProps = new Map();
    for (const [key, data] of commonProperties) {
      if (data.count >= threshold) {
        abstractProps.set(key, data.value);
      }
    }
    
    return {
      type: 'ABSTRACT_CONCEPT',
      level,
      memberCount: concepts.length,
      properties: Object.fromEntries(abstractProps),
      relationTypes: Array.from(allRelTypes)
    };
  }
}

/**
 * TransferEngine - Orchestrates knowledge transfer between domains
 */
class TransferEngine {
  constructor() {
    this.transfers = [];
    this.strategies = new Map();
  }

  registerStrategy(name, strategy) {
    this.strategies.set(name, strategy);
    return this;
  }

  async transfer(sourceGraph, targetDomain, strategy = TRANSFER_STRATEGIES.ANALOGICAL_REASONING) {
    const transfer = {
      id: `transfer-${Date.now()}`,
      source: sourceGraph.name,
      targetDomain,
      strategy,
      started: Date.now(),
      status: 'IN_PROGRESS',
      mappings: []
    };
    
    this.transfers.push(transfer);
    
    try {
      // Find concepts that could transfer to target domain
      for (const concept of sourceGraph.concepts.values()) {
        const transferability = this.assessTransferability(concept, targetDomain);
        if (transferability > 0.5) {
          transfer.mappings.push({
            sourceId: concept.id,
            transferability,
            proposedMapping: this.proposeMapping(concept, targetDomain)
          });
        }
      }
      
      transfer.status = 'COMPLETED';
      transfer.completed = Date.now();
    } catch (error) {
      transfer.status = 'FAILED';
      transfer.error = error.message;
    }
    
    return transfer;
  }

  assessTransferability(concept, targetDomain) {
    // Assess how well a concept can transfer to another domain
    const domainDistance = this.computeDomainDistance(concept.domain, targetDomain);
    const abstractionLevel = this.estimateAbstractionLevel(concept);
    
    // More abstract concepts transfer better across domains
    return abstractionLevel * (1 - domainDistance * 0.5);
  }

  computeDomainDistance(source, target) {
    // Simplified domain distance - in practice would use domain embeddings
    if (source === target) return 0;
    return 0.5; // Default moderate distance
  }

  estimateAbstractionLevel(concept) {
    // Higher relation count and properties suggest more abstract concepts
    const relScore = Math.min(1, concept.relations.length / 10);
    const propScore = Math.min(1, concept.properties.size / 5);
    return (relScore + propScore) / 2;
  }

  proposeMapping(concept, targetDomain) {
    return {
      originalName: concept.name,
      proposedName: `${concept.name}_${targetDomain.toLowerCase()}`,
      domain: targetDomain,
      preservedProperties: Array.from(concept.properties.keys()),
      adaptedRelations: concept.relations.map(r => r.type)
    };
  }
}

/**
 * OntologyAligner - Aligns and merges ontologies
 */
class OntologyAligner {
  constructor() {
    this.alignments = [];
  }

  align(ontologyA, ontologyB, threshold = 0.7) {
    const alignments = [];
    
    for (const conceptA of ontologyA.concepts.values()) {
      for (const conceptB of ontologyB.concepts.values()) {
        const similarity = this.computeOntologicalSimilarity(conceptA, conceptB);
        if (similarity >= threshold) {
          alignments.push({
            conceptA: conceptA.id,
            conceptB: conceptB.id,
            similarity,
            alignmentType: this.determineAlignmentType(conceptA, conceptB, similarity)
          });
        }
      }
    }
    
    this.alignments.push({
      ontologyA: ontologyA.name,
      ontologyB: ontologyB.name,
      alignments,
      timestamp: Date.now()
    });
    
    return alignments;
  }

  computeOntologicalSimilarity(a, b) {
    // Name similarity
    const nameSim = this.stringSimilarity(a.name.toLowerCase(), b.name.toLowerCase());
    
    // Property overlap
    const propsA = new Set(a.properties.keys());
    const propsB = new Set(b.properties.keys());
    const propIntersect = new Set([...propsA].filter(x => propsB.has(x)));
    const propUnion = new Set([...propsA, ...propsB]);
    const propSim = propUnion.size > 0 ? propIntersect.size / propUnion.size : 0;
    
    // Embedding similarity
    const embSim = a.similarity(b);
    
    return nameSim * 0.3 + propSim * 0.3 + embSim * 0.4;
  }

  stringSimilarity(a, b) {
    if (a === b) return 1;
    if (a.includes(b) || b.includes(a)) return 0.8;
    // Simple Jaccard on character bigrams
    const bigramsA = new Set();
    const bigramsB = new Set();
    for (let i = 0; i < a.length - 1; i++) bigramsA.add(a.slice(i, i + 2));
    for (let i = 0; i < b.length - 1; i++) bigramsB.add(b.slice(i, i + 2));
    const intersect = new Set([...bigramsA].filter(x => bigramsB.has(x)));
    const union = new Set([...bigramsA, ...bigramsB]);
    return union.size > 0 ? intersect.size / union.size : 0;
  }

  determineAlignmentType(a, b, similarity) {
    if (similarity > 0.95) return 'EQUIVALENT';
    if (similarity > 0.85) return 'NEAR_EQUIVALENT';
    if (similarity > 0.75) return 'RELATED';
    return 'WEAKLY_RELATED';
  }

  merge(ontologyA, ontologyB, alignments) {
    const merged = new KnowledgeGraph(`${ontologyA.name}_${ontologyB.name}_merged`);
    const alignmentMap = new Map();
    
    // Index alignments
    for (const alignment of alignments) {
      alignmentMap.set(alignment.conceptA, alignment.conceptB);
    }
    
    // Add all concepts from A
    for (const concept of ontologyA.concepts.values()) {
      merged.addConcept(concept);
    }
    
    // Add concepts from B that aren't aligned
    for (const concept of ontologyB.concepts.values()) {
      const aligned = [...alignmentMap.values()].includes(concept.id);
      if (!aligned) {
        merged.addConcept(concept);
      }
    }
    
    // Add cross-ontology bridges for aligned concepts
    for (const [aId, bId] of alignmentMap) {
      merged.addBridge(aId, bId, 'ONTOLOGY_ALIGNMENT', {
        source: ontologyA.name,
        target: ontologyB.name
      });
    }
    
    return merged;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * KnowledgeSynthesisProtocol - Main protocol orchestrator
 */
class KnowledgeSynthesisProtocol {
  constructor() {
    this.graphs = new Map();
    this.analogyEngine = new AnalogyEngine();
    this.distiller = new KnowledgeDistiller();
    this.transferEngine = new TransferEngine();
    this.ontologyAligner = new OntologyAligner();
    this.synthesisHistory = [];
    this.running = false;
  }

  initialize() {
    this.running = true;
    console.log('[KST-001] Knowledge Synthesis Protocol initialized');
    return { status: 'initialized', timestamp: Date.now() };
  }

  createGraph(name) {
    const graph = new KnowledgeGraph(name);
    this.graphs.set(name, graph);
    return graph;
  }

  getGraph(name) {
    return this.graphs.get(name);
  }

  createConcept(id, name, domain) {
    return new KnowledgeConcept(id, name, domain);
  }

  synthesize(sourceGraphs, mode = SYNTHESIS_MODES.INTEGRATION) {
    const synthesis = {
      id: `synthesis-${Date.now()}`,
      mode,
      sources: sourceGraphs.map(g => g.name),
      started: Date.now(),
      results: []
    };
    
    switch (mode) {
      case SYNTHESIS_MODES.ANALOGY:
        for (let i = 0; i < sourceGraphs.length - 1; i++) {
          for (let j = i + 1; j < sourceGraphs.length; j++) {
            const analogies = this.analogyEngine.detectAnalogy(
              sourceGraphs[i], sourceGraphs[j]
            );
            synthesis.results.push({
              type: 'ANALOGY',
              between: [sourceGraphs[i].name, sourceGraphs[j].name],
              analogies
            });
          }
        }
        break;
        
      case SYNTHESIS_MODES.INTEGRATION:
        // Merge all graphs with alignment
        let merged = sourceGraphs[0];
        for (let i = 1; i < sourceGraphs.length; i++) {
          const alignments = this.ontologyAligner.align(merged, sourceGraphs[i]);
          merged = this.ontologyAligner.merge(merged, sourceGraphs[i], alignments);
        }
        synthesis.results.push({ type: 'MERGED_GRAPH', graph: merged });
        this.graphs.set(merged.name, merged);
        break;
        
      case SYNTHESIS_MODES.DISTILLATION:
        for (const graph of sourceGraphs) {
          const distilled = this.distiller.distill(
            graph, Math.ceil(graph.concepts.size * PHI_INV)
          );
          synthesis.results.push({ type: 'DISTILLED', original: graph.name, distilled });
          this.graphs.set(distilled.name, distilled);
        }
        break;
    }
    
    synthesis.completed = Date.now();
    this.synthesisHistory.push(synthesis);
    return synthesis;
  }

  async transferKnowledge(sourceGraphName, targetDomain) {
    const sourceGraph = this.graphs.get(sourceGraphName);
    if (!sourceGraph) throw new Error(`Graph not found: ${sourceGraphName}`);
    return this.transferEngine.transfer(sourceGraph, targetDomain);
  }

  getStatus() {
    return {
      running: this.running,
      graphCount: this.graphs.size,
      synthesisCount: this.synthesisHistory.length,
      analogyCount: this.analogyEngine.analogies.length,
      transferCount: this.transferEngine.transfers.length
    };
  }

  shutdown() {
    this.running = false;
    console.log('[KST-001] Knowledge Synthesis Protocol shutdown');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Constants
  KNOWLEDGE_DOMAINS,
  SYNTHESIS_MODES,
  RELATION_TYPES,
  TRANSFER_STRATEGIES,
  
  // Classes
  KnowledgeConcept,
  KnowledgeGraph,
  AnalogyEngine,
  KnowledgeDistiller,
  TransferEngine,
  OntologyAligner,
  KnowledgeSynthesisProtocol
};

export default KnowledgeSynthesisProtocol;

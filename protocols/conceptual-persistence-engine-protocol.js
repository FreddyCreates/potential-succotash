/**
 * CPE-001: Conceptual Persistence Engine Protocol
 * 
 * Keeps ideas alive without disk writes.
 * Uses CBI artifacts + Semper Memoria + MAE traces.
 * Anything referenced across ≥N cycles becomes canonical.
 * 
 * @module conceptual-persistence-engine-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const CANONIZATION_CYCLES = 3;  // Cycles before eligible for canonization

// ─── Concept States ──────────────────────────────────────────────────────────
export const CONCEPT_STATES = {
  NASCENT: 'nascent',
  ACTIVE: 'active',
  REINFORCED: 'reinforced',
  CANONICAL: 'canonical',
  DORMANT: 'dormant',
  ARCHIVED: 'archived'
};

// ─── Reference Types ─────────────────────────────────────────────────────────
export const REFERENCE_TYPES = {
  CBI_ARTIFACT: 'cbi_artifact',
  MAE_TRACE: 'mae_trace',
  SEMPER_MEMORIA: 'semper_memoria',
  CROSS_CONCEPT: 'cross_concept',
  EXTERNAL: 'external'
};

// ─── Concept ─────────────────────────────────────────────────────────────────
class Concept {
  constructor(id, content, source) {
    this.id = id;
    this.content = content;
    this.source = source;
    this.state = CONCEPT_STATES.NASCENT;
    this.references = [];
    this.cyclesSinceCreation = 0;
    this.cyclesSinceReference = 0;
    this.referenceCount = 0;
    this.phi_weight = 1.0;
    this.created = Date.now();
    this.lastReferenced = Date.now();
    this.canonizedAt = null;
    this.lineage = [];
  }
  
  reference(type, sourceId, context = {}) {
    const ref = {
      type,
      sourceId,
      context,
      timestamp: Date.now(),
      cycle: this.cyclesSinceCreation
    };
    
    this.references.push(ref);
    this.referenceCount++;
    this.cyclesSinceReference = 0;
    this.lastReferenced = Date.now();
    
    // Phi-weighted reinforcement
    this.phi_weight = Math.min(PHI * 2, this.phi_weight * (1 + PHI_INV * 0.1));
    
    // State transitions
    if (this.state === CONCEPT_STATES.NASCENT && this.referenceCount >= 2) {
      this.state = CONCEPT_STATES.ACTIVE;
    } else if (this.state === CONCEPT_STATES.ACTIVE && this.referenceCount >= 5) {
      this.state = CONCEPT_STATES.REINFORCED;
    }
    
    this.lineage.push({
      action: 'referenced',
      type,
      sourceId,
      timestamp: Date.now()
    });
    
    return ref;
  }
  
  tick() {
    this.cyclesSinceCreation++;
    this.cyclesSinceReference++;
    
    // Phi-weighted decay when not referenced
    if (this.cyclesSinceReference > 0) {
      const decayFactor = Math.pow(PHI_INV, this.cyclesSinceReference * 0.1);
      this.phi_weight *= decayFactor;
    }
    
    // State transitions based on inactivity
    if (this.cyclesSinceReference > 10 && this.state !== CONCEPT_STATES.CANONICAL) {
      if (this.state === CONCEPT_STATES.ACTIVE || this.state === CONCEPT_STATES.REINFORCED) {
        this.state = CONCEPT_STATES.DORMANT;
      }
    }
    
    return this.phi_weight;
  }
  
  canonize() {
    if (this.state === CONCEPT_STATES.CANONICAL) return false;
    
    this.state = CONCEPT_STATES.CANONICAL;
    this.canonizedAt = Date.now();
    this.lineage.push({
      action: 'canonized',
      timestamp: Date.now()
    });
    
    return true;
  }
  
  isEligibleForCanonization() {
    return (
      this.cyclesSinceCreation >= CANONIZATION_CYCLES &&
      this.referenceCount >= CANONIZATION_CYCLES &&
      this.phi_weight >= PHI_INV &&
      this.state !== CONCEPT_STATES.CANONICAL
    );
  }
  
  serialize() {
    return {
      id: this.id,
      content: this.content,
      source: this.source,
      state: this.state,
      referenceCount: this.referenceCount,
      phi_weight: this.phi_weight,
      created: this.created,
      canonizedAt: this.canonizedAt
    };
  }
}

// ─── Conceptual Persistence Engine Protocol ──────────────────────────────────
export class ConceptualPersistenceEngineProtocol {
  constructor() {
    this.id = 'CPE-001';
    this.name = 'Conceptual Persistence Engine';
    this.version = '1.0.0';
    
    this.concepts = new Map();
    this.canonical = new Map();
    this.referenceIndex = new Map();  // sourceId -> Set of conceptIds
    this.cycle = 0;
    
    this.metrics = {
      concepts_created: 0,
      concepts_canonized: 0,
      concepts_archived: 0,
      total_references: 0
    };
  }
  
  // ─── Create concept ────────────────────────────────────────────────────────
  create(content, source) {
    const id = `concept-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const concept = new Concept(id, content, source);
    
    this.concepts.set(id, concept);
    this.metrics.concepts_created++;
    
    return concept;
  }
  
  // ─── Reference concept ─────────────────────────────────────────────────────
  reference(conceptId, type, sourceId, context = {}) {
    const concept = this.concepts.get(conceptId);
    if (!concept) throw new Error(`Concept not found: ${conceptId}`);
    
    const ref = concept.reference(type, sourceId, context);
    
    // Update reference index
    if (!this.referenceIndex.has(sourceId)) {
      this.referenceIndex.set(sourceId, new Set());
    }
    this.referenceIndex.get(sourceId).add(conceptId);
    
    this.metrics.total_references++;
    
    // Check for canonization eligibility
    if (concept.isEligibleForCanonization()) {
      this.canonize(conceptId);
    }
    
    return ref;
  }
  
  // ─── Canonize concept ──────────────────────────────────────────────────────
  canonize(conceptId) {
    const concept = this.concepts.get(conceptId);
    if (!concept) throw new Error(`Concept not found: ${conceptId}`);
    
    if (concept.canonize()) {
      this.canonical.set(conceptId, concept);
      this.metrics.concepts_canonized++;
      return true;
    }
    
    return false;
  }
  
  // ─── Get concept ───────────────────────────────────────────────────────────
  get(conceptId) {
    return this.concepts.get(conceptId);
  }
  
  // ─── Find concepts by criteria ─────────────────────────────────────────────
  find(criteria) {
    const results = [];
    
    for (const concept of this.concepts.values()) {
      let matches = true;
      
      if (criteria.state && concept.state !== criteria.state) matches = false;
      if (criteria.minWeight && concept.phi_weight < criteria.minWeight) matches = false;
      if (criteria.minReferences && concept.referenceCount < criteria.minReferences) matches = false;
      
      if (matches) results.push(concept);
    }
    
    // Sort by phi_weight
    results.sort((a, b) => b.phi_weight - a.phi_weight);
    return results;
  }
  
  // ─── Get concepts referenced by source ─────────────────────────────────────
  getBySource(sourceId) {
    const conceptIds = this.referenceIndex.get(sourceId);
    if (!conceptIds) return [];
    
    return Array.from(conceptIds)
      .map(id => this.concepts.get(id))
      .filter(Boolean);
  }
  
  // ─── Cycle tick ────────────────────────────────────────────────────────────
  tick() {
    this.cycle++;
    const toArchive = [];
    const toCanonize = [];
    
    for (const [id, concept] of this.concepts) {
      const weight = concept.tick();
      
      // Archive dormant concepts with very low weight
      if (concept.state === CONCEPT_STATES.DORMANT && weight < 0.1) {
        toArchive.push(id);
      }
      
      // Auto-canonize eligible concepts
      if (concept.isEligibleForCanonization()) {
        toCanonize.push(id);
      }
    }
    
    // Archive
    for (const id of toArchive) {
      const concept = this.concepts.get(id);
      concept.state = CONCEPT_STATES.ARCHIVED;
      this.metrics.concepts_archived++;
    }
    
    // Canonize
    for (const id of toCanonize) {
      this.canonize(id);
    }
    
    return {
      cycle: this.cycle,
      archived: toArchive.length,
      canonized: toCanonize.length,
      totalConcepts: this.concepts.size,
      canonicalCount: this.canonical.size
    };
  }
  
  // ─── Get canonical concepts ────────────────────────────────────────────────
  getCanonical() {
    return Array.from(this.canonical.values());
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      cycle: this.cycle,
      total_concepts: this.concepts.size,
      canonical_count: this.canonical.size,
      active_concepts: Array.from(this.concepts.values())
        .filter(c => c.state === CONCEPT_STATES.ACTIVE || c.state === CONCEPT_STATES.REINFORCED)
        .length
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      cycle: this.cycle,
      concepts: Array.from(this.concepts.values()).map(c => c.serialize()),
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'No disk writes required for persistence',
  'Reference count determines persistence',
  'Canonical concepts persist indefinitely',
  'PHI-weighted decay for inactive concepts'
];

export default ConceptualPersistenceEngineProtocol;

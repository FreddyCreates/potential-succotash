/**
 * CBI-001: Code-Block Cognitive Interface Protocol
 * 
 * The conceptual persistence engine of the Civilization Organism.
 * Code blocks serve as stable cognitive artifacts that persist
 * across reasoning cycles, forming the basis of long-term memory.
 * 
 * @module code-block-cognitive-interface-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const CANONIZATION_THRESHOLD = 3;  // Cycles before eligible for promotion

// ─── Artifact Types ──────────────────────────────────────────────────────────
export const ARTIFACT_TYPES = {
  TEXT: 'text',
  JSON: 'json',
  SPEC: 'spec',
  PSEUDOCODE: 'pseudocode',
  CODE: 'code',
  PROTOCOL: 'protocol',
  SCHEMA: 'schema',
  DIAGRAM: 'diagram'
};

// ─── Artifact States ─────────────────────────────────────────────────────────
export const ARTIFACT_STATES = {
  DRAFT: 'draft',
  ACTIVE: 'active',
  LINKED: 'linked',
  CANONICAL: 'canonical',
  ARCHIVED: 'archived'
};

// ─── Link Types ──────────────────────────────────────────────────────────────
export const LINK_TYPES = {
  DEPENDENCY: 'dependency',
  ANCESTRY: 'ancestry',
  REFERENCE: 'reference',
  SUPERSEDES: 'supersedes',
  EXTENDS: 'extends',
  IMPLEMENTS: 'implements'
};

// ─── Cognitive Artifact ──────────────────────────────────────────────────────
class CognitiveArtifact {
  constructor(id, type, content, intent) {
    this.id = id;
    this.type = type;
    this.content = content;
    this.intent = intent;
    this.state = ARTIFACT_STATES.DRAFT;
    this.version = 1;
    this.created = Date.now();
    this.modified = Date.now();
    this.accessCount = 0;
    this.cyclesSinceAccess = 0;
    this.links = new Map();  // id -> { type, target, strength }
    this.lineage = [];
    this.metadata = {};
    this.phi_weight = 1.0;
  }
  
  touch() {
    this.accessCount++;
    this.cyclesSinceAccess = 0;
    this.modified = Date.now();
    
    // Increase phi weight with access
    this.phi_weight = Math.min(PHI, this.phi_weight * (1 + PHI_INV * 0.1));
  }
  
  decay() {
    this.cyclesSinceAccess++;
    
    // Phi-weighted decay
    const decayRate = PHI_INV * 0.01 * this.cyclesSinceAccess;
    this.phi_weight = Math.max(0.1, this.phi_weight * (1 - decayRate));
    
    return this.phi_weight;
  }
  
  addLink(targetId, linkType, metadata = {}) {
    this.links.set(targetId, {
      type: linkType,
      targetId,
      strength: PHI_INV,
      created: Date.now(),
      metadata
    });
    this.state = ARTIFACT_STATES.LINKED;
    this.lineage.push({
      action: 'link',
      targetId,
      linkType,
      timestamp: Date.now()
    });
  }
  
  promote() {
    if (this.accessCount >= CANONIZATION_THRESHOLD && 
        this.phi_weight >= PHI_INV) {
      this.state = ARTIFACT_STATES.CANONICAL;
      this.lineage.push({
        action: 'promote',
        timestamp: Date.now()
      });
      return true;
    }
    return false;
  }
  
  update(newContent) {
    const previousContent = this.content;
    this.content = newContent;
    this.version++;
    this.modified = Date.now();
    this.lineage.push({
      action: 'update',
      version: this.version,
      timestamp: Date.now()
    });
    return previousContent;
  }
  
  serialize() {
    return {
      id: this.id,
      type: this.type,
      content: this.content,
      intent: this.intent,
      state: this.state,
      version: this.version,
      created: this.created,
      modified: this.modified,
      accessCount: this.accessCount,
      phi_weight: this.phi_weight,
      links: Array.from(this.links.entries()),
      lineage: this.lineage,
      metadata: this.metadata
    };
  }
  
  static deserialize(data) {
    const artifact = new CognitiveArtifact(
      data.id,
      data.type,
      data.content,
      data.intent
    );
    artifact.state = data.state;
    artifact.version = data.version;
    artifact.created = data.created;
    artifact.modified = data.modified;
    artifact.accessCount = data.accessCount;
    artifact.phi_weight = data.phi_weight;
    artifact.links = new Map(data.links);
    artifact.lineage = data.lineage;
    artifact.metadata = data.metadata;
    return artifact;
  }
}

// ─── Artifact Store ──────────────────────────────────────────────────────────
class ArtifactStore {
  constructor() {
    this.artifacts = new Map();
    this.canonical = new Set();
    this.index = {
      byType: new Map(),
      byState: new Map(),
      byIntent: new Map()
    };
  }
  
  add(artifact) {
    this.artifacts.set(artifact.id, artifact);
    
    // Update indices
    this.addToIndex('byType', artifact.type, artifact.id);
    this.addToIndex('byState', artifact.state, artifact.id);
    if (artifact.intent) {
      this.addToIndex('byIntent', artifact.intent, artifact.id);
    }
    
    return artifact;
  }
  
  get(id) {
    const artifact = this.artifacts.get(id);
    if (artifact) {
      artifact.touch();
    }
    return artifact;
  }
  
  find(criteria) {
    const results = [];
    
    for (const artifact of this.artifacts.values()) {
      let matches = true;
      
      if (criteria.type && artifact.type !== criteria.type) matches = false;
      if (criteria.state && artifact.state !== criteria.state) matches = false;
      if (criteria.minWeight && artifact.phi_weight < criteria.minWeight) matches = false;
      if (criteria.intent && artifact.intent !== criteria.intent) matches = false;
      
      if (matches) results.push(artifact);
    }
    
    // Sort by phi_weight
    results.sort((a, b) => b.phi_weight - a.phi_weight);
    return results;
  }
  
  addToIndex(indexName, key, id) {
    if (!this.index[indexName].has(key)) {
      this.index[indexName].set(key, new Set());
    }
    this.index[indexName].get(key).add(id);
  }
  
  tick() {
    const promotionCandidates = [];
    const decayed = [];
    
    for (const artifact of this.artifacts.values()) {
      const weight = artifact.decay();
      
      if (weight < 0.1 && artifact.state !== ARTIFACT_STATES.CANONICAL) {
        decayed.push(artifact.id);
      }
      
      if (artifact.state !== ARTIFACT_STATES.CANONICAL &&
          artifact.accessCount >= CANONIZATION_THRESHOLD &&
          artifact.phi_weight >= PHI_INV) {
        promotionCandidates.push(artifact);
      }
    }
    
    return { promotionCandidates, decayed };
  }
}

// ─── Code-Block Cognitive Interface Protocol ─────────────────────────────────
export class CodeBlockCognitiveInterfaceProtocol {
  constructor() {
    this.id = 'CBI-001';
    this.name = 'Code-Block Cognitive Interface';
    this.version = '1.0.0';
    this.store = new ArtifactStore();
    this.cycle = 0;
    this.metrics = {
      artifacts_created: 0,
      artifacts_promoted: 0,
      artifacts_decayed: 0,
      links_created: 0,
      avg_phi_weight: 0
    };
  }
  
  // ─── CBI-CREATE: Define artifact ───────────────────────────────────────────
  create(type, content, intent, metadata = {}) {
    if (!ARTIFACT_TYPES[type]) {
      throw new Error(`Unknown artifact type: ${type}`);
    }
    
    const id = `cbi-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const artifact = new CognitiveArtifact(id, type, content, intent);
    artifact.metadata = metadata;
    
    this.store.add(artifact);
    this.metrics.artifacts_created++;
    
    return artifact;
  }
  
  // ─── CBI-LINK: Connect artifacts ───────────────────────────────────────────
  link(sourceId, targetId, linkType, metadata = {}) {
    if (!LINK_TYPES[linkType]) {
      throw new Error(`Unknown link type: ${linkType}`);
    }
    
    const source = this.store.get(sourceId);
    const target = this.store.get(targetId);
    
    if (!source) throw new Error(`Source artifact not found: ${sourceId}`);
    if (!target) throw new Error(`Target artifact not found: ${targetId}`);
    
    source.addLink(targetId, linkType, metadata);
    this.metrics.links_created++;
    
    return source;
  }
  
  // ─── CBI-PROMOTE: Mark as canonical ────────────────────────────────────────
  promote(artifactId) {
    const artifact = this.store.get(artifactId);
    if (!artifact) throw new Error(`Artifact not found: ${artifactId}`);
    
    const promoted = artifact.promote();
    if (promoted) {
      this.store.canonical.add(artifactId);
      this.metrics.artifacts_promoted++;
    }
    
    return promoted;
  }
  
  // ─── CBI-GET: Retrieve artifact ────────────────────────────────────────────
  get(artifactId) {
    return this.store.get(artifactId);
  }
  
  // ─── CBI-FIND: Search artifacts ────────────────────────────────────────────
  find(criteria) {
    return this.store.find(criteria);
  }
  
  // ─── CBI-UPDATE: Modify artifact ───────────────────────────────────────────
  update(artifactId, newContent) {
    const artifact = this.store.get(artifactId);
    if (!artifact) throw new Error(`Artifact not found: ${artifactId}`);
    
    return artifact.update(newContent);
  }
  
  // ─── CBI-INGEST: Re-activate lineage ───────────────────────────────────────
  ingest(serializedArtifact) {
    const artifact = CognitiveArtifact.deserialize(serializedArtifact);
    artifact.touch();  // Reactivate
    this.store.add(artifact);
    return artifact;
  }
  
  // ─── Cycle tick ────────────────────────────────────────────────────────────
  tick() {
    this.cycle++;
    const { promotionCandidates, decayed } = this.store.tick();
    
    // Auto-promote eligible artifacts
    for (const artifact of promotionCandidates) {
      this.promote(artifact.id);
    }
    
    // Update metrics
    this.metrics.artifacts_decayed += decayed.length;
    
    // Calculate average phi weight
    let totalWeight = 0;
    for (const artifact of this.store.artifacts.values()) {
      totalWeight += artifact.phi_weight;
    }
    this.metrics.avg_phi_weight = this.store.artifacts.size > 0
      ? totalWeight / this.store.artifacts.size
      : 0;
    
    return {
      cycle: this.cycle,
      promoted: promotionCandidates.length,
      decayed: decayed.length,
      totalArtifacts: this.store.artifacts.size,
      canonicalCount: this.store.canonical.size
    };
  }
  
  // ─── Get canonical artifacts ───────────────────────────────────────────────
  getCanonical() {
    return Array.from(this.store.canonical)
      .map(id => this.store.artifacts.get(id))
      .filter(Boolean);
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      cycle: this.cycle,
      total_artifacts: this.store.artifacts.size,
      canonical_count: this.store.canonical.size
    };
  }
  
  // ─── Export store ──────────────────────────────────────────────────────────
  export() {
    const artifacts = [];
    for (const artifact of this.store.artifacts.values()) {
      artifacts.push(artifact.serialize());
    }
    return {
      protocol: this.id,
      version: this.version,
      cycle: this.cycle,
      artifacts,
      metrics: this.metrics
    };
  }
  
  // ─── Import store ──────────────────────────────────────────────────────────
  import(data) {
    for (const artifactData of data.artifacts) {
      this.ingest(artifactData);
    }
    this.cycle = data.cycle || 0;
    return this.store.artifacts.size;
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Artifacts are immutable cognitive nodes',
  'Re-pasting reactivates lineage connections',
  'Canonical artifacts persist indefinitely',
  'PHI-weighted decay for inactive artifacts'
];

export default CodeBlockCognitiveInterfaceProtocol;

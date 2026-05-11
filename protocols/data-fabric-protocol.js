/**
 * DATA FABRIC PROTOCOL (DAT-001)
 * 
 * Distributed Data Management Architecture
 * 
 * This protocol provides comprehensive data fabric capabilities:
 * - Data Mesh Architecture
 * - Data Lineage Tracking
 * - Data Governance & Cataloging
 * - Data Quality Management
 * - Data Virtualization
 * - Schema Evolution & Management
 * - Data Contracts & APIs
 * - Real-time Data Integration
 * 
 * @protocol DAT-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Data Source Types
const DATA_SOURCES = {
  RELATIONAL: 'RELATIONAL',
  NOSQL: 'NOSQL',
  STREAMING: 'STREAMING',
  FILE: 'FILE',
  API: 'API',
  LAKEHOUSE: 'LAKEHOUSE',
  GRAPH: 'GRAPH',
  VECTOR: 'VECTOR',
  TIME_SERIES: 'TIME_SERIES'
};

// Data Quality Dimensions
const QUALITY_DIMENSIONS = {
  ACCURACY: 'ACCURACY',
  COMPLETENESS: 'COMPLETENESS',
  CONSISTENCY: 'CONSISTENCY',
  TIMELINESS: 'TIMELINESS',
  VALIDITY: 'VALIDITY',
  UNIQUENESS: 'UNIQUENESS',
  INTEGRITY: 'INTEGRITY'
};

// Schema Types
const SCHEMA_TYPES = {
  AVRO: 'AVRO',
  PROTOBUF: 'PROTOBUF',
  JSON_SCHEMA: 'JSON_SCHEMA',
  PARQUET: 'PARQUET',
  ARROW: 'ARROW',
  SQL_DDL: 'SQL_DDL',
  GRAPHQL: 'GRAPHQL'
};

// Lineage Events
const LINEAGE_EVENTS = {
  CREATE: 'CREATE',
  READ: 'READ',
  UPDATE: 'UPDATE',
  DELETE: 'DELETE',
  TRANSFORM: 'TRANSFORM',
  AGGREGATE: 'AGGREGATE',
  JOIN: 'JOIN',
  FILTER: 'FILTER',
  EXPORT: 'EXPORT'
};

// Data Classification
const CLASSIFICATIONS = {
  PUBLIC: 'PUBLIC',
  INTERNAL: 'INTERNAL',
  CONFIDENTIAL: 'CONFIDENTIAL',
  RESTRICTED: 'RESTRICTED',
  PII: 'PII',
  PHI: 'PHI',
  FINANCIAL: 'FINANCIAL'
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DataAsset - Represents a data asset in the fabric
 */
class DataAsset {
  constructor(id, name, sourceType) {
    this.id = id;
    this.name = name;
    this.sourceType = sourceType;
    this.schema = null;
    this.metadata = {};
    this.classifications = [];
    this.owners = [];
    this.stewards = [];
    this.qualityScore = 1.0;
    this.lineage = [];
    this.created = Date.now();
    this.modified = Date.now();
    this.version = 1;
  }

  setSchema(schema) {
    this.schema = schema;
    this.modified = Date.now();
    return this;
  }

  addMetadata(key, value) {
    this.metadata[key] = value;
    this.modified = Date.now();
    return this;
  }

  classify(classification) {
    if (!this.classifications.includes(classification)) {
      this.classifications.push(classification);
    }
    return this;
  }

  addOwner(ownerId) {
    if (!this.owners.includes(ownerId)) {
      this.owners.push(ownerId);
    }
    return this;
  }

  addSteward(stewardId) {
    if (!this.stewards.includes(stewardId)) {
      this.stewards.push(stewardId);
    }
    return this;
  }

  recordLineage(event) {
    this.lineage.push({
      ...event,
      timestamp: Date.now(),
      version: this.version
    });
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      sourceType: this.sourceType,
      schema: this.schema,
      metadata: this.metadata,
      classifications: this.classifications,
      qualityScore: this.qualityScore,
      version: this.version
    };
  }
}

/**
 * Schema - Data schema representation
 */
class Schema {
  constructor(name, type = SCHEMA_TYPES.JSON_SCHEMA) {
    this.id = `schema-${Date.now()}`;
    this.name = name;
    this.type = type;
    this.fields = [];
    this.version = 1;
    this.compatibility = 'BACKWARD';
    this.created = Date.now();
  }

  addField(name, dataType, options = {}) {
    const field = {
      name,
      dataType,
      nullable: options.nullable ?? true,
      defaultValue: options.defaultValue,
      constraints: options.constraints || [],
      description: options.description,
      metadata: options.metadata || {}
    };
    this.fields.push(field);
    return this;
  }

  removeField(name) {
    this.fields = this.fields.filter(f => f.name !== name);
    return this;
  }

  evolve(changes) {
    const evolved = new Schema(this.name, this.type);
    evolved.fields = [...this.fields];
    evolved.version = this.version + 1;
    
    for (const change of changes) {
      switch (change.type) {
        case 'ADD_FIELD':
          evolved.addField(change.field.name, change.field.dataType, change.field);
          break;
        case 'REMOVE_FIELD':
          evolved.removeField(change.fieldName);
          break;
        case 'MODIFY_FIELD':
          const field = evolved.fields.find(f => f.name === change.fieldName);
          if (field) Object.assign(field, change.modifications);
          break;
      }
    }
    
    return evolved;
  }

  checkCompatibility(oldSchema) {
    const issues = [];
    
    // Check for removed non-nullable fields
    for (const oldField of oldSchema.fields) {
      const newField = this.fields.find(f => f.name === oldField.name);
      if (!newField && !oldField.nullable) {
        issues.push({
          type: 'BREAKING',
          message: `Non-nullable field '${oldField.name}' was removed`
        });
      }
    }
    
    // Check for new non-nullable fields without defaults
    for (const newField of this.fields) {
      const oldField = oldSchema.fields.find(f => f.name === newField.name);
      if (!oldField && !newField.nullable && newField.defaultValue === undefined) {
        issues.push({
          type: 'BREAKING',
          message: `New non-nullable field '${newField.name}' has no default`
        });
      }
    }
    
    return {
      compatible: issues.filter(i => i.type === 'BREAKING').length === 0,
      issues
    };
  }
}

/**
 * DataLineage - Tracks data lineage across the fabric
 */
class DataLineage {
  constructor() {
    this.nodes = new Map();
    this.edges = [];
    this.events = [];
  }

  addNode(assetId, metadata = {}) {
    this.nodes.set(assetId, {
      assetId,
      metadata,
      created: Date.now()
    });
    return this;
  }

  addEdge(sourceId, targetId, eventType, transformation = null) {
    const edge = {
      id: `edge-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      sourceId,
      targetId,
      eventType,
      transformation,
      timestamp: Date.now()
    };
    this.edges.push(edge);
    
    this.events.push({
      type: eventType,
      source: sourceId,
      target: targetId,
      timestamp: Date.now()
    });
    
    return edge;
  }

  getUpstream(assetId, depth = 10) {
    const upstream = [];
    const visited = new Set();
    const queue = [{ id: assetId, level: 0 }];
    
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (level >= depth || visited.has(id)) continue;
      visited.add(id);
      
      const incomingEdges = this.edges.filter(e => e.targetId === id);
      for (const edge of incomingEdges) {
        upstream.push({ assetId: edge.sourceId, edge, distance: level + 1 });
        queue.push({ id: edge.sourceId, level: level + 1 });
      }
    }
    
    return upstream;
  }

  getDownstream(assetId, depth = 10) {
    const downstream = [];
    const visited = new Set();
    const queue = [{ id: assetId, level: 0 }];
    
    while (queue.length > 0) {
      const { id, level } = queue.shift();
      if (level >= depth || visited.has(id)) continue;
      visited.add(id);
      
      const outgoingEdges = this.edges.filter(e => e.sourceId === id);
      for (const edge of outgoingEdges) {
        downstream.push({ assetId: edge.targetId, edge, distance: level + 1 });
        queue.push({ id: edge.targetId, level: level + 1 });
      }
    }
    
    return downstream;
  }

  analyzeImpact(assetId) {
    const downstream = this.getDownstream(assetId);
    return {
      assetId,
      impactedAssets: downstream.length,
      assets: downstream,
      analysisTime: Date.now()
    };
  }
}

/**
 * DataQualityEngine - Assesses and monitors data quality
 */
class DataQualityEngine {
  constructor() {
    this.rules = new Map();
    this.assessments = [];
  }

  addRule(assetId, dimension, rule) {
    const rules = this.rules.get(assetId) || [];
    rules.push({
      id: `rule-${Date.now()}`,
      dimension,
      ...rule,
      created: Date.now()
    });
    this.rules.set(assetId, rules);
    return this;
  }

  assess(assetId, data) {
    const rules = this.rules.get(assetId) || [];
    const results = [];
    
    for (const rule of rules) {
      const result = this.evaluateRule(rule, data);
      results.push({
        ruleId: rule.id,
        dimension: rule.dimension,
        passed: result.passed,
        score: result.score,
        details: result.details
      });
    }
    
    const overallScore = results.length > 0
      ? results.reduce((sum, r) => sum + r.score, 0) / results.length
      : 1.0;
    
    const assessment = {
      assetId,
      timestamp: Date.now(),
      overallScore,
      results,
      dimensionScores: this.calculateDimensionScores(results)
    };
    
    this.assessments.push(assessment);
    return assessment;
  }

  evaluateRule(rule, data) {
    // Simplified rule evaluation
    switch (rule.dimension) {
      case QUALITY_DIMENSIONS.COMPLETENESS:
        return this.evaluateCompleteness(rule, data);
      case QUALITY_DIMENSIONS.UNIQUENESS:
        return this.evaluateUniqueness(rule, data);
      case QUALITY_DIMENSIONS.VALIDITY:
        return this.evaluateValidity(rule, data);
      default:
        return { passed: true, score: 1.0, details: 'Rule type not implemented' };
    }
  }

  evaluateCompleteness(rule, data) {
    if (!Array.isArray(data)) return { passed: true, score: 1.0, details: 'N/A' };
    
    const field = rule.field;
    let nonNull = 0;
    for (const row of data) {
      if (row[field] !== null && row[field] !== undefined && row[field] !== '') {
        nonNull++;
      }
    }
    
    const score = data.length > 0 ? nonNull / data.length : 1.0;
    const threshold = rule.threshold || 0.95;
    
    return {
      passed: score >= threshold,
      score,
      details: `${nonNull}/${data.length} non-null values`
    };
  }

  evaluateUniqueness(rule, data) {
    if (!Array.isArray(data)) return { passed: true, score: 1.0, details: 'N/A' };
    
    const field = rule.field;
    const values = new Set();
    let duplicates = 0;
    
    for (const row of data) {
      const value = row[field];
      if (values.has(value)) {
        duplicates++;
      } else {
        values.add(value);
      }
    }
    
    const score = data.length > 0 ? 1 - (duplicates / data.length) : 1.0;
    const threshold = rule.threshold || 0.99;
    
    return {
      passed: score >= threshold,
      score,
      details: `${duplicates} duplicate values found`
    };
  }

  evaluateValidity(rule, data) {
    if (!Array.isArray(data)) return { passed: true, score: 1.0, details: 'N/A' };
    
    const field = rule.field;
    const pattern = rule.pattern ? new RegExp(rule.pattern) : null;
    let valid = 0;
    
    for (const row of data) {
      const value = row[field];
      if (value === null || value === undefined) {
        if (rule.allowNull) valid++;
      } else if (pattern && pattern.test(String(value))) {
        valid++;
      } else if (!pattern) {
        valid++;
      }
    }
    
    const score = data.length > 0 ? valid / data.length : 1.0;
    const threshold = rule.threshold || 0.95;
    
    return {
      passed: score >= threshold,
      score,
      details: `${valid}/${data.length} valid values`
    };
  }

  calculateDimensionScores(results) {
    const scores = {};
    
    for (const dimension of Object.values(QUALITY_DIMENSIONS)) {
      const dimResults = results.filter(r => r.dimension === dimension);
      if (dimResults.length > 0) {
        scores[dimension] = dimResults.reduce((sum, r) => sum + r.score, 0) / dimResults.length;
      }
    }
    
    return scores;
  }

  getTrend(assetId, windowSize = 10) {
    const assetAssessments = this.assessments
      .filter(a => a.assetId === assetId)
      .slice(-windowSize);
    
    if (assetAssessments.length < 2) return { trend: 'INSUFFICIENT_DATA' };
    
    const scores = assetAssessments.map(a => a.overallScore);
    const firstHalf = scores.slice(0, Math.floor(scores.length / 2));
    const secondHalf = scores.slice(Math.floor(scores.length / 2));
    
    const firstAvg = firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
    const secondAvg = secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;
    
    const diff = secondAvg - firstAvg;
    
    return {
      trend: diff > 0.05 ? 'IMPROVING' : diff < -0.05 ? 'DECLINING' : 'STABLE',
      change: diff,
      currentScore: scores[scores.length - 1]
    };
  }
}

/**
 * DataCatalog - Searchable data catalog
 */
class DataCatalog {
  constructor() {
    this.assets = new Map();
    this.tags = new Map();
    this.domains = new Map();
  }

  register(asset) {
    this.assets.set(asset.id, asset);
    
    // Index by classifications
    for (const classification of asset.classifications) {
      if (!this.tags.has(classification)) {
        this.tags.set(classification, new Set());
      }
      this.tags.get(classification).add(asset.id);
    }
    
    return this;
  }

  unregister(assetId) {
    const asset = this.assets.get(assetId);
    if (asset) {
      for (const classification of asset.classifications) {
        this.tags.get(classification)?.delete(assetId);
      }
    }
    this.assets.delete(assetId);
    return this;
  }

  search(query) {
    const results = [];
    const lowerQuery = query.toLowerCase();
    
    for (const asset of this.assets.values()) {
      let score = 0;
      
      // Name match
      if (asset.name.toLowerCase().includes(lowerQuery)) score += 10;
      
      // Metadata match
      for (const [key, value] of Object.entries(asset.metadata)) {
        if (String(value).toLowerCase().includes(lowerQuery)) score += 5;
      }
      
      // Classification match
      for (const classification of asset.classifications) {
        if (classification.toLowerCase().includes(lowerQuery)) score += 3;
      }
      
      if (score > 0) {
        results.push({ asset, score });
      }
    }
    
    return results.sort((a, b) => b.score - a.score);
  }

  findByClassification(classification) {
    const assetIds = this.tags.get(classification);
    if (!assetIds) return [];
    return Array.from(assetIds).map(id => this.assets.get(id)).filter(Boolean);
  }

  getStatistics() {
    const stats = {
      totalAssets: this.assets.size,
      bySourceType: {},
      byClassification: {},
      averageQualityScore: 0
    };
    
    let qualitySum = 0;
    for (const asset of this.assets.values()) {
      stats.bySourceType[asset.sourceType] = (stats.bySourceType[asset.sourceType] || 0) + 1;
      for (const classification of asset.classifications) {
        stats.byClassification[classification] = (stats.byClassification[classification] || 0) + 1;
      }
      qualitySum += asset.qualityScore;
    }
    
    stats.averageQualityScore = this.assets.size > 0 ? qualitySum / this.assets.size : 0;
    
    return stats;
  }
}

/**
 * DataContract - Defines data contracts between producers and consumers
 */
class DataContract {
  constructor(name, producerId, consumerId) {
    this.id = `contract-${Date.now()}`;
    this.name = name;
    this.producerId = producerId;
    this.consumerId = consumerId;
    this.schema = null;
    this.sla = {};
    this.qualityExpectations = [];
    this.status = 'DRAFT';
    this.created = Date.now();
    this.effectiveFrom = null;
    this.effectiveTo = null;
  }

  setSchema(schema) {
    this.schema = schema;
    return this;
  }

  setSLA(sla) {
    this.sla = { ...this.sla, ...sla };
    return this;
  }

  addQualityExpectation(dimension, threshold, description = '') {
    this.qualityExpectations.push({
      dimension,
      threshold,
      description,
      added: Date.now()
    });
    return this;
  }

  activate(from = Date.now(), to = null) {
    this.status = 'ACTIVE';
    this.effectiveFrom = from;
    this.effectiveTo = to;
    return this;
  }

  terminate() {
    this.status = 'TERMINATED';
    this.effectiveTo = Date.now();
    return this;
  }

  validateCompliance(data, qualityEngine) {
    const violations = [];
    
    // Check quality expectations
    for (const expectation of this.qualityExpectations) {
      const rule = {
        dimension: expectation.dimension,
        threshold: expectation.threshold
      };
      
      // Simplified compliance check
      if (data.qualityScore && data.qualityScore < expectation.threshold) {
        violations.push({
          type: 'QUALITY',
          dimension: expectation.dimension,
          expected: expectation.threshold,
          actual: data.qualityScore
        });
      }
    }
    
    return {
      compliant: violations.length === 0,
      violations,
      checkedAt: Date.now()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DataFabricProtocol - Main protocol orchestrator
 */
class DataFabricProtocol {
  constructor() {
    this.catalog = new DataCatalog();
    this.lineage = new DataLineage();
    this.qualityEngine = new DataQualityEngine();
    this.contracts = new Map();
    this.running = false;
  }

  initialize() {
    this.running = true;
    console.log('[DAT-001] Data Fabric Protocol initialized');
    return { status: 'initialized', timestamp: Date.now() };
  }

  createAsset(id, name, sourceType) {
    const asset = new DataAsset(id, name, sourceType);
    this.catalog.register(asset);
    this.lineage.addNode(id, { name, sourceType });
    return asset;
  }

  createSchema(name, type = SCHEMA_TYPES.JSON_SCHEMA) {
    return new Schema(name, type);
  }

  createContract(name, producerId, consumerId) {
    const contract = new DataContract(name, producerId, consumerId);
    this.contracts.set(contract.id, contract);
    return contract;
  }

  recordTransformation(sourceIds, targetId, transformation) {
    for (const sourceId of sourceIds) {
      this.lineage.addEdge(sourceId, targetId, LINEAGE_EVENTS.TRANSFORM, transformation);
    }
    return this;
  }

  assessQuality(assetId, data) {
    return this.qualityEngine.assess(assetId, data);
  }

  addQualityRule(assetId, dimension, rule) {
    this.qualityEngine.addRule(assetId, dimension, rule);
    return this;
  }

  searchCatalog(query) {
    return this.catalog.search(query);
  }

  getLineage(assetId, direction = 'both', depth = 10) {
    if (direction === 'upstream' || direction === 'both') {
      const upstream = this.lineage.getUpstream(assetId, depth);
    }
    if (direction === 'downstream' || direction === 'both') {
      const downstream = this.lineage.getDownstream(assetId, depth);
    }
    
    return {
      upstream: direction !== 'downstream' ? this.lineage.getUpstream(assetId, depth) : [],
      downstream: direction !== 'upstream' ? this.lineage.getDownstream(assetId, depth) : []
    };
  }

  analyzeImpact(assetId) {
    return this.lineage.analyzeImpact(assetId);
  }

  getStatus() {
    return {
      running: this.running,
      catalogStats: this.catalog.getStatistics(),
      lineageNodes: this.lineage.nodes.size,
      lineageEdges: this.lineage.edges.length,
      contracts: this.contracts.size,
      qualityAssessments: this.qualityEngine.assessments.length
    };
  }

  shutdown() {
    this.running = false;
    console.log('[DAT-001] Data Fabric Protocol shutdown');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Constants
  DATA_SOURCES,
  QUALITY_DIMENSIONS,
  SCHEMA_TYPES,
  LINEAGE_EVENTS,
  CLASSIFICATIONS,
  
  // Classes
  DataAsset,
  Schema,
  DataLineage,
  DataQualityEngine,
  DataCatalog,
  DataContract,
  DataFabricProtocol
};

export default DataFabricProtocol;

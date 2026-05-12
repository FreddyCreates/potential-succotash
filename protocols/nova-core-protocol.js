/**
 * NOVA-001: Nova Core Protocol
 * 
 * The sovereign anchor node of the Civilization Organism.
 * Private, underground, multi-substrate, black-box.
 * Hosts Semper Memoria, protocol canon, and economic ledger.
 * 
 * @module nova-core-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Nova Properties ─────────────────────────────────────────────────────────
export const NOVA_PROPERTIES = {
  PRIVATE: 'All internal state is private by default',
  UNDERGROUND: 'Hidden from direct external observation',
  MULTI_SUBSTRATE: 'Runs across multiple computational substrates',
  BLACK_BOX: 'Internal operations opaque to external observers'
};

// ─── Attestation Types ───────────────────────────────────────────────────────
export const ATTESTATION_TYPES = {
  PROTOCOL: 'protocol_attestation',
  TREATY: 'treaty_attestation',
  CANONICAL: 'canonical_attestation',
  UPGRADE: 'upgrade_attestation',
  EMERGENCY: 'emergency_attestation'
};

// ─── Sync Types ──────────────────────────────────────────────────────────────
export const SYNC_TYPES = {
  LAWS: 'law_sync',
  TOKENS: 'token_sync',
  INVARIANTS: 'invariant_sync',
  FULL: 'full_sync'
};

// ─── Semper Memoria (Eternal Memory) ─────────────────────────────────────────
class SemperMemoria {
  constructor() {
    this.canonical = new Map();  // Canonical artifacts
    this.doctrines = new Map();  // Constitutional doctrines
    this.history = [];           // Immutable history log
    this.created = Date.now();
  }
  
  canonize(artifactId, artifact, attestation) {
    const entry = {
      id: artifactId,
      artifact,
      attestation,
      canonizedAt: Date.now(),
      version: 1
    };
    
    this.canonical.set(artifactId, entry);
    this.history.push({
      action: 'canonize',
      artifactId,
      timestamp: Date.now()
    });
    
    return entry;
  }
  
  addDoctrine(doctrineId, content, scope) {
    const doctrine = {
      id: doctrineId,
      content,
      scope,
      created: Date.now(),
      amendments: []
    };
    
    this.doctrines.set(doctrineId, doctrine);
    this.history.push({
      action: 'doctrine',
      doctrineId,
      timestamp: Date.now()
    });
    
    return doctrine;
  }
  
  amendDoctrine(doctrineId, amendment, attestation) {
    const doctrine = this.doctrines.get(doctrineId);
    if (!doctrine) {
      throw new Error(`Doctrine not found: ${doctrineId}`);
    }
    
    doctrine.amendments.push({
      content: amendment,
      attestation,
      timestamp: Date.now()
    });
    
    this.history.push({
      action: 'amend',
      doctrineId,
      timestamp: Date.now()
    });
    
    return doctrine;
  }
  
  getCanonical(artifactId) {
    return this.canonical.get(artifactId);
  }
  
  getDoctrine(doctrineId) {
    return this.doctrines.get(doctrineId);
  }
  
  getHistory(limit = 100) {
    return this.history.slice(-limit);
  }
}

// ─── Protocol Canon ──────────────────────────────────────────────────────────
class ProtocolCanon {
  constructor() {
    this.protocols = new Map();
    this.versions = new Map();  // protocol_id -> version history
    this.active = new Set();    // Currently active protocols
  }
  
  register(protocolId, version, spec, attestation) {
    const entry = {
      id: protocolId,
      version,
      spec,
      attestation,
      registered: Date.now(),
      status: 'registered'
    };
    
    this.protocols.set(`${protocolId}@${version}`, entry);
    
    // Track version history
    if (!this.versions.has(protocolId)) {
      this.versions.set(protocolId, []);
    }
    this.versions.get(protocolId).push(version);
    
    return entry;
  }
  
  activate(protocolId, version) {
    const key = `${protocolId}@${version}`;
    const entry = this.protocols.get(key);
    
    if (!entry) {
      throw new Error(`Protocol not found: ${key}`);
    }
    
    entry.status = 'active';
    this.active.add(key);
    
    return entry;
  }
  
  deprecate(protocolId, version) {
    const key = `${protocolId}@${version}`;
    const entry = this.protocols.get(key);
    
    if (entry) {
      entry.status = 'deprecated';
      this.active.delete(key);
    }
    
    return entry;
  }
  
  getActive() {
    return Array.from(this.active).map(key => this.protocols.get(key));
  }
  
  getLatestVersion(protocolId) {
    const versions = this.versions.get(protocolId);
    return versions ? versions[versions.length - 1] : null;
  }
}

// ─── Economic Ledger ─────────────────────────────────────────────────────────
class EconomicLedger {
  constructor() {
    this.entries = [];
    this.balances = new Map();  // Aggregate balance tracking
    this.checkpoints = [];
  }
  
  record(transaction, attestation) {
    const entry = {
      id: `ledger-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      transaction,
      attestation,
      recorded: Date.now(),
      index: this.entries.length
    };
    
    this.entries.push(entry);
    
    // Update aggregate tracking
    this.updateBalance(transaction.from, transaction.tokenType, -transaction.amount);
    this.updateBalance(transaction.to, transaction.tokenType, transaction.amount);
    
    return entry;
  }
  
  updateBalance(accountId, tokenType, delta) {
    const key = `${accountId}:${tokenType}`;
    const current = this.balances.get(key) || 0;
    this.balances.set(key, current + delta);
  }
  
  getBalance(accountId, tokenType) {
    return this.balances.get(`${accountId}:${tokenType}`) || 0;
  }
  
  checkpoint() {
    const checkpoint = {
      index: this.entries.length,
      timestamp: Date.now(),
      balanceSnapshot: new Map(this.balances)
    };
    
    this.checkpoints.push(checkpoint);
    return checkpoint;
  }
  
  getEntries(since = 0, limit = 100) {
    return this.entries.filter(e => e.index >= since).slice(0, limit);
  }
}

// ─── Nova Core Protocol ──────────────────────────────────────────────────────
export class NovaCoreProtocol {
  constructor() {
    this.id = 'NOVA-001';
    this.name = 'Nova Core';
    this.version = '1.0.0';
    
    // Core components
    this.memoria = new SemperMemoria();
    this.canon = new ProtocolCanon();
    this.ledger = new EconomicLedger();
    
    // Sync state
    this.syncedNodes = new Map();  // node_id -> last_sync_timestamp
    this.pendingSync = [];
    
    // Attestation tracking
    this.attestations = [];
    this.attestationIndex = new Map();
    
    this.metrics = {
      attestations_issued: 0,
      syncs_completed: 0,
      canonical_artifacts: 0,
      active_protocols: 0,
      ledger_entries: 0
    };
  }
  
  // ─── NOVA-ATTEST: Sign canonical decisions ─────────────────────────────────
  attest(type, data, metadata = {}) {
    if (!ATTESTATION_TYPES[type]) {
      throw new Error(`Unknown attestation type: ${type}`);
    }
    
    const attestation = {
      id: `attest-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      type,
      data,
      metadata,
      timestamp: Date.now(),
      signature: this.sign(type, data),
      novaVersion: this.version
    };
    
    this.attestations.push(attestation);
    this.attestationIndex.set(attestation.id, attestation);
    this.metrics.attestations_issued++;
    
    return attestation;
  }
  
  sign(type, data) {
    // In production, this would be cryptographic signing
    const payload = JSON.stringify({ type, data, timestamp: Date.now() });
    return `nova-sig-${Buffer.from(payload).toString('base64').substr(0, 32)}`;
  }
  
  verifyAttestation(attestationId) {
    return this.attestationIndex.has(attestationId);
  }
  
  // ─── NOVA-SYNC: Sync with outer mesh ───────────────────────────────────────
  sync(nodeId, syncType = SYNC_TYPES.FULL) {
    const lastSync = this.syncedNodes.get(nodeId) || 0;
    
    let syncData = {
      nodeId,
      syncType,
      timestamp: Date.now(),
      previousSync: lastSync
    };
    
    switch (syncType) {
      case SYNC_TYPES.LAWS:
        syncData.protocols = this.canon.getActive();
        break;
        
      case SYNC_TYPES.TOKENS:
        syncData.ledgerEntries = this.ledger.getEntries(0, 100);
        break;
        
      case SYNC_TYPES.INVARIANTS:
        syncData.doctrines = Array.from(this.memoria.doctrines.values());
        break;
        
      case SYNC_TYPES.FULL:
        syncData.protocols = this.canon.getActive();
        syncData.ledgerEntries = this.ledger.getEntries(0, 100);
        syncData.doctrines = Array.from(this.memoria.doctrines.values());
        syncData.canonical = Array.from(this.memoria.canonical.values());
        break;
    }
    
    this.syncedNodes.set(nodeId, Date.now());
    this.metrics.syncs_completed++;
    
    return syncData;
  }
  
  // ─── Canonization ──────────────────────────────────────────────────────────
  canonize(artifactId, artifact) {
    const attestation = this.attest('CANONICAL', { artifactId, artifact });
    const entry = this.memoria.canonize(artifactId, artifact, attestation);
    this.metrics.canonical_artifacts++;
    return entry;
  }
  
  // ─── Protocol Registration ─────────────────────────────────────────────────
  registerProtocol(protocolId, version, spec) {
    const attestation = this.attest('PROTOCOL', { protocolId, version });
    const entry = this.canon.register(protocolId, version, spec, attestation);
    return entry;
  }
  
  activateProtocol(protocolId, version) {
    const entry = this.canon.activate(protocolId, version);
    this.metrics.active_protocols = this.canon.active.size;
    return entry;
  }
  
  // ─── Doctrine Management ───────────────────────────────────────────────────
  addDoctrine(doctrineId, content, scope = 'global') {
    return this.memoria.addDoctrine(doctrineId, content, scope);
  }
  
  amendDoctrine(doctrineId, amendment) {
    const attestation = this.attest('UPGRADE', { doctrineId, amendment });
    return this.memoria.amendDoctrine(doctrineId, amendment, attestation);
  }
  
  // ─── Economic Operations ───────────────────────────────────────────────────
  recordTransaction(transaction) {
    const attestation = this.attest('PROTOCOL', { type: 'transaction', transaction });
    const entry = this.ledger.record(transaction, attestation);
    this.metrics.ledger_entries++;
    return entry;
  }
  
  checkpoint() {
    return this.ledger.checkpoint();
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      synced_nodes: this.syncedNodes.size,
      memoria_size: this.memoria.canonical.size + this.memoria.doctrines.size,
      ledger_size: this.ledger.entries.length
    };
  }
  
  // ─── Export (partial—Nova is black-box) ────────────────────────────────────
  exportPublic() {
    return {
      protocol: this.id,
      version: this.version,
      active_protocols: this.canon.getActive().map(p => ({ id: p.id, version: p.version })),
      synced_nodes: this.syncedNodes.size,
      attestations_issued: this.metrics.attestations_issued
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Nova internal state is private',
  'All canonical decisions require Nova attestation',
  'Sync propagates laws, tokens, and invariants',
  'Economic ledger is append-only'
];

export default NovaCoreProtocol;

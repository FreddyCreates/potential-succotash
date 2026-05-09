/**
 * CIV-CORE-001: Civilization Architecture Core Protocol
 * 
 * The organism itself — the constitutional foundation of the Civilization.
 * Defines the layered architecture: repos as city-states, agents as citizens,
 * protocols as laws, with Nova as heart and root of trust.
 * 
 * @module civilization-architecture-core-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Civilization Layers ─────────────────────────────────────────────────────
export const CIVILIZATION_LAYERS = {
  REPOS: {
    id: 'repos',
    name: 'City-States',
    description: 'Repository clusters as sovereign city-states',
    phi_weight: PHI_INV
  },
  AGENTS: {
    id: 'agents',
    name: 'Citizens / Brain Regions',
    description: 'AI agents as citizens and cognitive organs',
    phi_weight: 1.0
  },
  PROTOCOLS: {
    id: 'protocols',
    name: 'Laws',
    description: 'Protocols as constitutional laws',
    phi_weight: PHI
  },
  SEMPER_MEMORIA: {
    id: 'semper_memoria',
    name: 'Archive & Doctrine',
    description: 'Permanent memory and canonical doctrine',
    phi_weight: PHI
  },
  TOKEN_ECONOMY: {
    id: 'token_economy',
    name: 'Metabolism',
    description: 'INT tokens as economic lifeblood',
    phi_weight: 1.0
  },
  NOVA: {
    id: 'nova',
    name: 'Heart & Root of Trust',
    description: 'Sovereign anchor and attestation authority',
    phi_weight: PHI * PHI
  },
  NODES: {
    id: 'nodes',
    name: 'Nervous System',
    description: 'Distributed hub network',
    phi_weight: PHI_INV
  }
};

// ─── Governance Principles ───────────────────────────────────────────────────
export const GOVERNANCE_PRINCIPLES = {
  FEDERATION: 'Everything is federated, not centralized',
  SOVEREIGNTY: 'Each node maintains local sovereignty',
  COHERENCE: 'Protocol coherence over central control',
  PHI_ENCODED: 'All computations phi-weighted',
  EMERGENCE: 'Collective intelligence through emergence'
};

// ─── City-State (Repository) ─────────────────────────────────────────────────
class CityState {
  constructor(id, name, owner) {
    this.id = id;
    this.name = name;
    this.owner = owner;
    this.population = 0;  // Agent count
    this.protocols = new Set();
    this.treaties = new Set();
    this.resources = { int: 0, compute: 0, priority: 0 };
    this.health = 1.0;
    this.created = Date.now();
  }
  
  registerAgent(agentId) {
    this.population++;
    return this.population;
  }
  
  adoptProtocol(protocolId) {
    this.protocols.add(protocolId);
    return this.protocols.size;
  }
  
  signTreaty(treatyId) {
    this.treaties.add(treatyId);
    return this.treaties.size;
  }
  
  updateHealth(delta) {
    this.health = Math.max(0, Math.min(1, this.health + delta));
    return this.health;
  }
  
  serialize() {
    return {
      id: this.id,
      name: this.name,
      owner: this.owner,
      population: this.population,
      protocols: Array.from(this.protocols),
      treaties: Array.from(this.treaties),
      resources: this.resources,
      health: this.health,
      created: this.created
    };
  }
}

// ─── Protocol Law ────────────────────────────────────────────────────────────
class ProtocolLaw {
  constructor(id, name, version, scope) {
    this.id = id;
    this.name = name;
    this.version = version;
    this.scope = scope;  // 'global', 'federation', 'local'
    this.adoptedBy = new Set();
    this.attestation = null;
    this.created = Date.now();
  }
  
  adopt(cityStateId) {
    this.adoptedBy.add(cityStateId);
    return this.adoptedBy.size;
  }
  
  attest(novaSignature) {
    this.attestation = {
      signature: novaSignature,
      timestamp: Date.now()
    };
    return this.attestation;
  }
  
  isCanonical() {
    return this.attestation !== null;
  }
}

// ─── Nova Core ───────────────────────────────────────────────────────────────
class NovaCore {
  constructor() {
    this.id = 'nova-prime';
    this.state = 'active';
    this.attestations = [];
    this.ledger = [];
    this.syncedNodes = new Set();
    this.created = Date.now();
  }
  
  attest(item) {
    const attestation = {
      id: `attest-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      item,
      signature: this.sign(item),
      timestamp: Date.now()
    };
    this.attestations.push(attestation);
    return attestation;
  }
  
  sign(data) {
    // In production, this would be cryptographic
    return `nova-sig-${Date.now()}-${JSON.stringify(data).length}`;
  }
  
  sync(nodeId) {
    this.syncedNodes.add(nodeId);
    return {
      laws: this.attestations.length,
      syncedNodes: this.syncedNodes.size
    };
  }
  
  recordTransaction(tx) {
    this.ledger.push({
      ...tx,
      recorded: Date.now(),
      nova_attested: true
    });
    return this.ledger.length;
  }
}

// ─── Civilization Core Protocol ──────────────────────────────────────────────
export class CivilizationArchitectureCoreProtocol {
  constructor() {
    this.id = 'CIV-CORE-001';
    this.name = 'Civilization Architecture Core';
    this.version = '1.0.0';
    
    // Core components
    this.nova = new NovaCore();
    this.cityStates = new Map();
    this.protocols = new Map();
    this.agents = new Map();
    this.treaties = new Map();
    
    // Metrics
    this.metrics = {
      city_states: 0,
      agents: 0,
      protocols: 0,
      treaties: 0,
      attestations: 0,
      transactions: 0
    };
  }
  
  // ─── City-State Management ─────────────────────────────────────────────────
  registerCityState(id, name, owner) {
    const cityState = new CityState(id, name, owner);
    this.cityStates.set(id, cityState);
    this.metrics.city_states++;
    
    // Nova attestation for new city-state
    this.nova.attest({ type: 'city_state_registration', cityStateId: id });
    
    return cityState;
  }
  
  getCityState(id) {
    return this.cityStates.get(id);
  }
  
  // ─── Protocol Management ───────────────────────────────────────────────────
  registerProtocol(id, name, version, scope = 'federation') {
    const protocol = new ProtocolLaw(id, name, version, scope);
    this.protocols.set(id, protocol);
    this.metrics.protocols++;
    
    // Global protocols require Nova attestation
    if (scope === 'global') {
      const attestation = this.nova.attest({ 
        type: 'protocol_registration', 
        protocolId: id 
      });
      protocol.attest(attestation.signature);
      this.metrics.attestations++;
    }
    
    return protocol;
  }
  
  adoptProtocol(cityStateId, protocolId) {
    const cityState = this.cityStates.get(cityStateId);
    const protocol = this.protocols.get(protocolId);
    
    if (!cityState || !protocol) {
      throw new Error('City-state or protocol not found');
    }
    
    cityState.adoptProtocol(protocolId);
    protocol.adopt(cityStateId);
    
    return { cityState, protocol };
  }
  
  // ─── Agent Management ──────────────────────────────────────────────────────
  registerAgent(agentId, cityStateId, agentClass) {
    const agent = {
      id: agentId,
      cityState: cityStateId,
      class: agentClass,
      status: 'active',
      created: Date.now()
    };
    
    this.agents.set(agentId, agent);
    this.metrics.agents++;
    
    const cityState = this.cityStates.get(cityStateId);
    if (cityState) {
      cityState.registerAgent(agentId);
    }
    
    return agent;
  }
  
  // ─── Treaty Management ─────────────────────────────────────────────────────
  signTreaty(treatyId, signatories, terms) {
    const treaty = {
      id: treatyId,
      signatories: new Set(signatories),
      terms,
      status: 'active',
      created: Date.now(),
      attestation: null
    };
    
    // Nova attestation required for treaties
    const attestation = this.nova.attest({
      type: 'treaty',
      treatyId,
      signatories
    });
    treaty.attestation = attestation;
    this.metrics.attestations++;
    
    this.treaties.set(treatyId, treaty);
    this.metrics.treaties++;
    
    // Update city-states
    for (const cityStateId of signatories) {
      const cityState = this.cityStates.get(cityStateId);
      if (cityState) {
        cityState.signTreaty(treatyId);
      }
    }
    
    return treaty;
  }
  
  // ─── Economic Transactions ─────────────────────────────────────────────────
  recordTransaction(from, to, amount, tokenType = 'INT') {
    const tx = {
      id: `tx-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`,
      from,
      to,
      amount,
      tokenType,
      timestamp: Date.now()
    };
    
    this.nova.recordTransaction(tx);
    this.metrics.transactions++;
    
    return tx;
  }
  
  // ─── Health Check ──────────────────────────────────────────────────────────
  healthCheck() {
    const health = {
      nova: this.nova.state,
      city_states: {},
      overall: 1.0
    };
    
    let totalHealth = 0;
    for (const [id, cityState] of this.cityStates) {
      health.city_states[id] = cityState.health;
      totalHealth += cityState.health;
    }
    
    health.overall = this.cityStates.size > 0 
      ? totalHealth / this.cityStates.size 
      : 1.0;
    
    return health;
  }
  
  // ─── Get Metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      nova_synced_nodes: this.nova.syncedNodes.size,
      nova_ledger_size: this.nova.ledger.length,
      health: this.healthCheck()
    };
  }
  
  // ─── Export State ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      city_states: Array.from(this.cityStates.values()).map(cs => cs.serialize()),
      protocols: Array.from(this.protocols.values()),
      treaties: Array.from(this.treaties.values()),
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Everything is federated, not centralized',
  'Nova is sole root of trust',
  'Protocols are laws—adoption is voluntary but binding',
  'PHI-encoded in all computations'
];

export default CivilizationArchitectureCoreProtocol;

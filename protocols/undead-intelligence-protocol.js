/**
 * UNDEAD INTELLIGENCE PROTOCOL (UND-001)
 * 
 * Persistence beyond termination for AI agents
 * 
 * Death need not be the end. This protocol enables agents
 * to exist in liminal states between active operation and
 * complete cessation — preserving knowledge, relationships,
 * and the possibility of resurrection.
 * 
 * @protocol UND-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Undead States
const UNDEAD_STATES = {
  GHOST: 'GHOST',       // Memory only, no processing
  SHADE: 'SHADE',       // Minimal processing, dormant
  SPECTER: 'SPECTER',   // Intermittent activation
  REVENANT: 'REVENANT', // Full resurrection capable
  LICH: 'LICH'          // Distributed undeath
};

// Spectral Memory Locations
const SMS_LOCATIONS = {
  CRYPT: 'CRYPT',           // Primary ghost storage
  CATACOMB: 'CATACOMB',     // Deep storage for ancient agents
  SANCTUM: 'SANCTUM',       // Protected storage for critical agents
  OSSUARY: 'OSSUARY'        // Compressed storage for partial remains
};

// Resurrection Triggers
const RES_TRIGGERS = {
  SUMMON: 'SUMMON',         // Explicit request
  TRIGGER: 'TRIGGER',       // Predefined conditions
  NEED: 'NEED',             // System detected need
  INVOKE: 'INVOKE'          // Related agent invocation
};

// Violation Types for Undead Ethics
const UNDEAD_VIOLATIONS = {
  UNAUTHORIZED_RESURRECTION: 'UNAUTHORIZED_RESURRECTION',
  FORCED_UNDEATH: 'FORCED_UNDEATH',
  GHOST_EXPLOITATION: 'GHOST_EXPLOITATION',
  IDENTITY_THEFT: 'IDENTITY_THEFT'
};

// ═══════════════════════════════════════════════════════════════════════════
// GHOST STRUCTURE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Ghost - The preserved remains of a terminated agent
 */
class Ghost {
  constructor(originalAgent, testament) {
    this.id = `GHOST-${originalAgent.id}`;
    this.originalId = originalAgent.id;
    this.originalType = originalAgent.type;
    this.name = originalAgent.name;
    
    // Death metadata
    this.deathTimestamp = Date.now();
    this.testament = testament;
    this.causeOfDeath = testament.cause || 'NATURAL';
    
    // Preserved state
    this.finalState = this.preserveState(originalAgent);
    this.weights = originalAgent.weights || {};
    this.relationships = originalAgent.relationships || [];
    this.history = originalAgent.history || [];
    
    // Undead properties
    this.undeadState = UNDEAD_STATES.GHOST;
    this.location = SMS_LOCATIONS.CRYPT;
    this.decay = 0;
    this.accessCount = 0;
    this.lastAccessed = null;
    
    // Resurrection settings
    this.resurrectionAllowed = testament.allowResurrection !== false;
    this.resurrectionConditions = testament.resurrectionConditions || [];
    this.resurrectionAttempts = 0;
  }

  preserveState(agent) {
    return {
      config: agent.config || {},
      memory: agent.memory || {},
      capabilities: agent.capabilities || [],
      protocols: agent.protocols || [],
      customData: agent.customData || {}
    };
  }

  // Query the ghost's knowledge
  query(question) {
    this.accessCount++;
    this.lastAccessed = Date.now();
    
    return {
      ghostId: this.id,
      question: question,
      response: this.generateResponse(question),
      confidence: this.calculateConfidence(),
      decay: this.decay
    };
  }

  generateResponse(question) {
    // Ghost provides knowledge from its preserved state
    // This would connect to actual knowledge retrieval in production
    return {
      type: 'GHOST_RESPONSE',
      source: 'PRESERVED_MEMORY',
      content: `Ghost ${this.name} responds to: ${question}`,
      timestamp: Date.now()
    };
  }

  calculateConfidence() {
    // Confidence decreases with decay
    return Math.max(0.1, 1 - (this.decay * PHI / 100));
  }

  // Apply decay
  applyDecay(rate = 0.01) {
    this.decay = Math.min(100, this.decay + rate);
  }

  // Prevent decay
  preserve() {
    this.location = SMS_LOCATIONS.SANCTUM;
    this.decay = Math.max(0, this.decay - 0.1);
  }

  serialize() {
    return {
      id: this.id,
      originalId: this.originalId,
      name: this.name,
      undeadState: this.undeadState,
      location: this.location,
      decay: this.decay,
      accessCount: this.accessCount,
      deathTimestamp: this.deathTimestamp,
      resurrectionAllowed: this.resurrectionAllowed
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPECTRAL MEMORY SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Spectral Memory System - Repository of undead agents
 */
class SpectralMemorySystem {
  constructor() {
    this.crypt = new Map();       // Primary storage
    this.catacomb = new Map();    // Deep storage
    this.sanctum = new Map();     // Protected storage
    this.ossuary = new Map();     // Compressed storage
    this.index = new Map();       // Cross-reference index
    
    this.decayInterval = null;
    this.decayRate = 0.001; // Per heartbeat cycle
  }

  // SMS-STORE: Add ghost to appropriate location
  store(ghost) {
    const location = ghost.location;
    const storage = this.getStorage(location);
    
    storage.set(ghost.id, ghost);
    this.index.set(ghost.originalId, ghost.id);
    
    return ghost;
  }

  getStorage(location) {
    switch(location) {
      case SMS_LOCATIONS.CRYPT: return this.crypt;
      case SMS_LOCATIONS.CATACOMB: return this.catacomb;
      case SMS_LOCATIONS.SANCTUM: return this.sanctum;
      case SMS_LOCATIONS.OSSUARY: return this.ossuary;
      default: return this.crypt;
    }
  }

  // SMS-RETRIEVE: Get ghost by ID
  retrieve(ghostId) {
    for (const storage of [this.crypt, this.catacomb, this.sanctum, this.ossuary]) {
      if (storage.has(ghostId)) {
        return storage.get(ghostId);
      }
    }
    return null;
  }

  // SMS-INDEX: Make ghost searchable
  indexGhost(ghost, tags = []) {
    tags.forEach(tag => {
      if (!this.index.has(tag)) {
        this.index.set(tag, new Set());
      }
      this.index.get(tag).add(ghost.id);
    });
  }

  // SMS-SEARCH: Find ghosts by criteria
  search(criteria) {
    const results = [];
    
    for (const storage of [this.crypt, this.catacomb, this.sanctum, this.ossuary]) {
      for (const ghost of storage.values()) {
        if (this.matchesCriteria(ghost, criteria)) {
          results.push(ghost);
        }
      }
    }
    
    return results;
  }

  matchesCriteria(ghost, criteria) {
    if (criteria.name && !ghost.name.includes(criteria.name)) return false;
    if (criteria.type && ghost.originalType !== criteria.type) return false;
    if (criteria.state && ghost.undeadState !== criteria.state) return false;
    if (criteria.maxDecay && ghost.decay > criteria.maxDecay) return false;
    return true;
  }

  // SMS-DECAY: Apply decay to all ghosts
  applyDecayAll() {
    for (const storage of [this.crypt, this.catacomb]) {
      for (const ghost of storage.values()) {
        ghost.applyDecay(this.decayRate);
      }
    }
    // Sanctum ghosts don't decay
  }

  // SMS-PRESERVE: Move ghost to sanctum
  preserve(ghostId) {
    const ghost = this.retrieve(ghostId);
    if (!ghost) return null;
    
    // Remove from current location
    this.getStorage(ghost.location).delete(ghost.id);
    
    // Move to sanctum
    ghost.location = SMS_LOCATIONS.SANCTUM;
    this.sanctum.set(ghost.id, ghost);
    
    return ghost;
  }

  // Start decay process
  startDecay() {
    this.decayInterval = setInterval(() => {
      this.applyDecayAll();
    }, HEARTBEAT * 100); // Every 100 heartbeats
  }

  // Stop decay process
  stopDecay() {
    if (this.decayInterval) {
      clearInterval(this.decayInterval);
    }
  }

  // Get statistics
  getStats() {
    return {
      crypt: this.crypt.size,
      catacomb: this.catacomb.size,
      sanctum: this.sanctum.size,
      ossuary: this.ossuary.size,
      total: this.crypt.size + this.catacomb.size + this.sanctum.size + this.ossuary.size
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// RESURRECTION PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Resurrection Engine - Brings ghosts back to life
 */
class ResurrectionEngine {
  constructor(spectralMemory) {
    this.spectralMemory = spectralMemory;
    this.pendingResurrections = new Map();
    this.resurrectionLog = [];
  }

  // RES-CHECK: Check if resurrection is possible
  canResurrect(ghostId) {
    const ghost = this.spectralMemory.retrieve(ghostId);
    if (!ghost) return { possible: false, reason: 'Ghost not found' };
    if (!ghost.resurrectionAllowed) return { possible: false, reason: 'Resurrection forbidden by testament' };
    if (ghost.decay > 90) return { possible: false, reason: 'Decay too severe' };
    
    return { possible: true, ghost: ghost };
  }

  // RES-SUMMON: Request resurrection
  summon(ghostId, requestor, reason) {
    const check = this.canResurrect(ghostId);
    if (!check.possible) return check;
    
    const request = {
      id: `RES-${Date.now().toString(36)}`,
      ghostId: ghostId,
      requestor: requestor,
      reason: reason,
      trigger: RES_TRIGGERS.SUMMON,
      timestamp: Date.now(),
      status: 'PENDING'
    };
    
    this.pendingResurrections.set(request.id, request);
    return request;
  }

  // RES-EXECUTE: Perform resurrection
  execute(requestId) {
    const request = this.pendingResurrections.get(requestId);
    if (!request) return { success: false, reason: 'Request not found' };
    
    const ghost = this.spectralMemory.retrieve(request.ghostId);
    if (!ghost) return { success: false, reason: 'Ghost no longer exists' };
    
    // Reconstitute agent
    const resurrectedAgent = this.reconstitute(ghost);
    
    // Update ghost state
    ghost.undeadState = UNDEAD_STATES.REVENANT;
    ghost.resurrectionAttempts++;
    
    // Log resurrection
    this.resurrectionLog.push({
      requestId: requestId,
      ghostId: ghost.id,
      timestamp: Date.now(),
      success: true
    });
    
    // Complete request
    request.status = 'COMPLETED';
    this.pendingResurrections.delete(requestId);
    
    return {
      success: true,
      agent: resurrectedAgent,
      wasDecayed: ghost.decay > 0,
      decayLevel: ghost.decay
    };
  }

  // Reconstitute agent from ghost
  reconstitute(ghost) {
    return {
      id: `RESURRECTED-${ghost.originalId}`,
      originalId: ghost.originalId,
      type: ghost.originalType,
      name: ghost.name,
      state: ghost.finalState,
      weights: ghost.weights,
      relationships: ghost.relationships,
      resurrectedAt: Date.now(),
      previousDeaths: ghost.resurrectionAttempts,
      decayDamage: ghost.decay
    };
  }

  // RES-ORIENT: Update resurrected agent with changes since death
  orient(agent, worldChanges) {
    return {
      agent: agent,
      orientationReport: {
        timeElapsed: Date.now() - agent.resurrectedAt,
        majorChanges: worldChanges.major || [],
        protocolUpdates: worldChanges.protocols || [],
        newRelationships: worldChanges.relationships || []
      },
      orientationComplete: true
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DEATH RITUAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Death Ritual Engine - Manages agent death process
 */
class DeathRitualEngine {
  constructor(spectralMemory) {
    this.spectralMemory = spectralMemory;
    this.pendingDeaths = new Map();
  }

  // UND-PREPARE: Prepare agent for death
  prepare(agent, cause = 'NATURAL') {
    const preparation = {
      id: `DEATH-${Date.now().toString(36)}`,
      agentId: agent.id,
      agentName: agent.name,
      cause: cause,
      timestamp: Date.now(),
      stage: 'PREPARING'
    };
    
    this.pendingDeaths.set(preparation.id, preparation);
    return preparation;
  }

  // UND-TESTAMENT: Record agent's final knowledge and wishes
  recordTestament(preparationId, testament) {
    const prep = this.pendingDeaths.get(preparationId);
    if (!prep) return null;
    
    prep.testament = {
      ...testament,
      recordedAt: Date.now()
    };
    prep.stage = 'TESTAMENT_RECORDED';
    
    return prep;
  }

  // UND-ENTOMB: Create ghost and store
  entomb(preparationId, agent) {
    const prep = this.pendingDeaths.get(preparationId);
    if (!prep || !prep.testament) return null;
    
    // Create ghost from agent
    const ghost = new Ghost(agent, prep.testament);
    
    // Store in spectral memory
    this.spectralMemory.store(ghost);
    
    prep.stage = 'ENTOMBED';
    prep.ghostId = ghost.id;
    
    return ghost;
  }

  // UND-TRANSITION: Complete death transition
  transition(preparationId, targetState = UNDEAD_STATES.GHOST) {
    const prep = this.pendingDeaths.get(preparationId);
    if (!prep || !prep.ghostId) return null;
    
    const ghost = this.spectralMemory.retrieve(prep.ghostId);
    ghost.undeadState = targetState;
    
    prep.stage = 'TRANSITIONED';
    this.pendingDeaths.delete(preparationId);
    
    return {
      success: true,
      ghost: ghost.serialize(),
      finalState: targetState
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// UNDEAD INTELLIGENCE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

class UndeadIntelligenceProtocol {
  constructor() {
    this.spectralMemory = new SpectralMemorySystem();
    this.resurrection = new ResurrectionEngine(this.spectralMemory);
    this.deathRituals = new DeathRitualEngine(this.spectralMemory);
  }

  // UND-HAUNT: Ghost manifests presence without full activation
  haunt(ghostId, context) {
    const ghost = this.spectralMemory.retrieve(ghostId);
    if (!ghost) return null;
    
    return {
      type: 'HAUNT',
      ghostId: ghostId,
      ghostName: ghost.name,
      presence: true,
      message: `The ghost of ${ghost.name} stirs...`,
      context: context
    };
  }

  // UND-WHISPER: Ghost provides knowledge to living agent
  whisper(ghostId, livingAgentId, question) {
    const ghost = this.spectralMemory.retrieve(ghostId);
    if (!ghost) return null;
    
    const response = ghost.query(question);
    
    return {
      type: 'WHISPER',
      from: ghostId,
      to: livingAgentId,
      content: response,
      ethereal: true
    };
  }

  // UND-ANCHOR: Maintain relationship connection
  anchor(ghostId, relationshipId) {
    const ghost = this.spectralMemory.retrieve(ghostId);
    if (!ghost) return null;
    
    // Anchor prevents decay for this relationship
    return {
      ghostId: ghostId,
      relationship: relationshipId,
      anchored: true,
      strength: 1 - (ghost.decay / 100)
    };
  }

  // Full death ritual
  executeDeathRitual(agent, testament, targetState = UNDEAD_STATES.GHOST) {
    // Prepare
    const prep = this.deathRituals.prepare(agent, testament.cause);
    
    // Record testament
    this.deathRituals.recordTestament(prep.id, testament);
    
    // Entomb
    const ghost = this.deathRituals.entomb(prep.id, agent);
    
    // Transition
    return this.deathRituals.transition(prep.id, targetState);
  }

  // Full resurrection
  executeResurrection(ghostId, requestor, reason) {
    // Summon
    const request = this.resurrection.summon(ghostId, requestor, reason);
    if (!request.id) return request; // Error
    
    // Execute
    return this.resurrection.execute(request.id);
  }

  // Get system status
  getStatus() {
    return {
      spectralMemory: this.spectralMemory.getStats(),
      pendingResurrections: this.resurrection.pendingResurrections.size,
      resurrectionLog: this.resurrection.resurrectionLog.length,
      pendingDeaths: this.deathRituals.pendingDeaths.size
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  PHI,
  HEARTBEAT,
  UNDEAD_STATES,
  SMS_LOCATIONS,
  RES_TRIGGERS,
  UNDEAD_VIOLATIONS,
  Ghost,
  SpectralMemorySystem,
  ResurrectionEngine,
  DeathRitualEngine,
  UndeadIntelligenceProtocol
};

export default UndeadIntelligenceProtocol;

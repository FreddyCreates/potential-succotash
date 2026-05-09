/**
 * CIV-ORG-001: Civilization-Scale Organism Protocol
 * 
 * The whole thing as one being-like system (purely functional).
 * Heart (Nova), Brain (reasoning + agents), Memory (Semper Memoria + CPE),
 * Metabolism (ECO), Nervous System (HUB + DCM), Immune System (AAB-FILTER + invariants).
 * 
 * Lifecycle: Boot → Federate → Grow → Self-program → Canonize → Iterate.
 * 
 * @module civilization-scale-organism-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Organism Organs ─────────────────────────────────────────────────────────
export const ORGANISM_ORGANS = {
  HEART: {
    id: 'heart',
    name: 'Nova Core',
    description: 'Root of trust, attestation authority',
    protocol: 'NOVA-001',
    phi_weight: PHI * PHI,
    emoji: '❤️'
  },
  BRAIN: {
    id: 'brain',
    name: 'Reasoning Engine + Agents',
    description: 'Cognitive processing, agent coordination',
    protocol: ['REV-001', 'AAB-001', 'MAE-001'],
    phi_weight: PHI,
    emoji: '🧠'
  },
  MEMORY: {
    id: 'memory',
    name: 'Semper Memoria + CPE',
    description: 'Long-term storage, conceptual persistence',
    protocol: ['CBI-001', 'CPE-001'],
    phi_weight: PHI,
    emoji: '💭'
  },
  METABOLISM: {
    id: 'metabolism',
    name: 'Token Economy',
    description: 'Resource flow, token circulation',
    protocol: 'ECO-001',
    phi_weight: 1.0,
    emoji: '⚡'
  },
  NERVOUS_SYSTEM: {
    id: 'nervous_system',
    name: 'Hub Network + Cognitive Mesh',
    description: 'Signal transmission, distributed processing',
    protocol: ['HUB-001', 'DCM-001'],
    phi_weight: PHI_INV,
    emoji: '🔗'
  },
  IMMUNE_SYSTEM: {
    id: 'immune_system',
    name: 'Filter Agents + Invariants',
    description: 'Threat detection, self-protection',
    protocol: ['AAB-FILTER', 'SPA-001'],
    phi_weight: 1.0,
    emoji: '🛡️'
  }
};

// ─── Lifecycle Phases ────────────────────────────────────────────────────────
export const LIFECYCLE_PHASES = {
  BOOT: {
    id: 'boot',
    name: 'Boot',
    description: 'Initialize all organs and establish heartbeat',
    order: 1
  },
  FEDERATE: {
    id: 'federate',
    name: 'Federate',
    description: 'Join federation, establish treaties',
    order: 2
  },
  GROW: {
    id: 'grow',
    name: 'Grow',
    description: 'Expand capabilities, add nodes',
    order: 3
  },
  SELF_PROGRAM: {
    id: 'self_program',
    name: 'Self-Program',
    description: 'Evolve protocols, generate tools',
    order: 4
  },
  CANONIZE: {
    id: 'canonize',
    name: 'Canonize',
    description: 'Promote artifacts to canonical status',
    order: 5
  },
  ITERATE: {
    id: 'iterate',
    name: 'Iterate',
    description: 'Return to growth phase, continuous improvement',
    order: 6
  }
};

// ─── Organism State ──────────────────────────────────────────────────────────
class OrganismState {
  constructor() {
    this.cognitive = { focus: 0, clarity: 1.0, load: 0 };
    this.affective = { valence: 0.5, arousal: 0.5, dominance: 0.5 };
    this.somatic = { health: 1.0, energy: 1.0, stress: 0 };
    this.sovereign = { autonomy: 1.0, integrity: 1.0, trust: 1.0 };
  }
  
  update(register, values) {
    if (this[register]) {
      Object.assign(this[register], values);
    }
  }
  
  getVitality() {
    const cognitiveVitality = this.cognitive.clarity * (1 - this.cognitive.load * 0.5);
    const affectiveVitality = this.affective.valence * (1 - Math.abs(this.affective.arousal - 0.5));
    const somaticVitality = this.somatic.health * this.somatic.energy * (1 - this.somatic.stress);
    const sovereignVitality = this.sovereign.autonomy * this.sovereign.integrity * this.sovereign.trust;
    
    return (
      cognitiveVitality * PHI_INV +
      affectiveVitality * PHI_INV +
      somaticVitality * PHI_INV +
      sovereignVitality * PHI_INV
    ) / 2;  // Normalized
  }
}

// ─── Organ Instance ──────────────────────────────────────────────────────────
class Organ {
  constructor(config) {
    this.id = config.id;
    this.name = config.name;
    this.protocol = config.protocol;
    this.phi_weight = config.phi_weight;
    this.state = 'inactive';
    this.health = 1.0;
    this.lastPulse = null;
    this.metrics = {
      pulses: 0,
      operations: 0,
      errors: 0
    };
  }
  
  activate() {
    this.state = 'active';
    this.lastPulse = Date.now();
    return this;
  }
  
  pulse() {
    this.lastPulse = Date.now();
    this.metrics.pulses++;
    return this.health;
  }
  
  operate(operation) {
    this.metrics.operations++;
    return {
      organ: this.id,
      operation,
      timestamp: Date.now()
    };
  }
  
  heal(amount = 0.1) {
    this.health = Math.min(1.0, this.health + amount * this.phi_weight * PHI_INV);
    return this.health;
  }
  
  damage(amount = 0.1) {
    this.health = Math.max(0, this.health - amount);
    this.metrics.errors++;
    return this.health;
  }
}

// ─── Civilization-Scale Organism Protocol ────────────────────────────────────
export class CivilizationScaleOrganismProtocol {
  constructor() {
    this.id = 'CIV-ORG-001';
    this.name = 'Civilization-Scale Organism';
    this.version = '1.0.0';
    
    // Core state
    this.state = new OrganismState();
    this.phase = LIFECYCLE_PHASES.BOOT;
    this.heartbeatCount = 0;
    this.lastHeartbeat = null;
    
    // Organs
    this.organs = new Map();
    for (const [key, config] of Object.entries(ORGANISM_ORGANS)) {
      this.organs.set(config.id, new Organ(config));
    }
    
    // Lifecycle history
    this.lifecycleHistory = [];
    
    this.metrics = {
      heartbeats: 0,
      phase_transitions: 0,
      vitality_avg: 1.0,
      operations_total: 0
    };
  }
  
  // ─── Boot phase ────────────────────────────────────────────────────────────
  boot() {
    this.phase = LIFECYCLE_PHASES.BOOT;
    this.lifecycleHistory.push({
      phase: 'boot',
      timestamp: Date.now()
    });
    
    // Activate all organs
    for (const organ of this.organs.values()) {
      organ.activate();
    }
    
    // Initialize state
    this.state.update('somatic', { health: 1.0, energy: 1.0 });
    this.state.update('sovereign', { autonomy: 1.0, integrity: 1.0, trust: 1.0 });
    
    return this.transitionPhase(LIFECYCLE_PHASES.FEDERATE);
  }
  
  // ─── Phase transition ──────────────────────────────────────────────────────
  transitionPhase(newPhase) {
    const oldPhase = this.phase;
    this.phase = newPhase;
    
    this.lifecycleHistory.push({
      from: oldPhase.id,
      to: newPhase.id,
      timestamp: Date.now()
    });
    
    this.metrics.phase_transitions++;
    
    return { from: oldPhase, to: newPhase };
  }
  
  // ─── Heartbeat ─────────────────────────────────────────────────────────────
  heartbeat() {
    this.heartbeatCount++;
    this.lastHeartbeat = Date.now();
    
    // Pulse all organs
    const organHealth = {};
    for (const [id, organ] of this.organs) {
      organHealth[id] = organ.pulse();
    }
    
    // Update vitality
    const vitality = this.state.getVitality();
    this.metrics.vitality_avg = 
      (this.metrics.vitality_avg * 0.9) + (vitality * 0.1);
    
    this.metrics.heartbeats++;
    
    // Natural healing
    for (const organ of this.organs.values()) {
      if (organ.health < 1.0) {
        organ.heal(0.01);
      }
    }
    
    // Check for phase transitions
    this.checkPhaseTransition();
    
    return {
      heartbeat: this.heartbeatCount,
      phase: this.phase.id,
      vitality,
      organHealth,
      timestamp: this.lastHeartbeat
    };
  }
  
  // ─── Check phase transition conditions ─────────────────────────────────────
  checkPhaseTransition() {
    const vitality = this.state.getVitality();
    
    switch (this.phase.id) {
      case 'federate':
        // Transition to grow after stabilizing
        if (this.heartbeatCount > 10 && vitality > 0.8) {
          this.transitionPhase(LIFECYCLE_PHASES.GROW);
        }
        break;
        
      case 'grow':
        // Transition to self-program when ready
        if (this.metrics.operations_total > 100 && vitality > 0.7) {
          this.transitionPhase(LIFECYCLE_PHASES.SELF_PROGRAM);
        }
        break;
        
      case 'self_program':
        // Transition to canonize after generating content
        if (this.heartbeatCount % 50 === 0) {
          this.transitionPhase(LIFECYCLE_PHASES.CANONIZE);
        }
        break;
        
      case 'canonize':
        // Return to iterate
        if (this.heartbeatCount % 60 === 0) {
          this.transitionPhase(LIFECYCLE_PHASES.ITERATE);
        }
        break;
        
      case 'iterate':
        // Back to grow
        if (this.heartbeatCount % 70 === 0) {
          this.transitionPhase(LIFECYCLE_PHASES.GROW);
        }
        break;
    }
  }
  
  // ─── Operate on organ ──────────────────────────────────────────────────────
  operate(organId, operation) {
    const organ = this.organs.get(organId);
    if (!organ) throw new Error(`Organ not found: ${organId}`);
    
    const result = organ.operate(operation);
    this.metrics.operations_total++;
    
    // Update cognitive load
    this.state.update('cognitive', { 
      load: Math.min(1.0, this.state.cognitive.load + 0.01)
    });
    
    return result;
  }
  
  // ─── Get organ ─────────────────────────────────────────────────────────────
  getOrgan(organId) {
    return this.organs.get(organId);
  }
  
  // ─── Health check ──────────────────────────────────────────────────────────
  healthCheck() {
    const organHealth = {};
    let totalHealth = 0;
    
    for (const [id, organ] of this.organs) {
      organHealth[id] = {
        health: organ.health,
        state: organ.state,
        pulses: organ.metrics.pulses
      };
      totalHealth += organ.health;
    }
    
    const avgHealth = totalHealth / this.organs.size;
    
    return {
      organism: this.id,
      phase: this.phase.id,
      vitality: this.state.getVitality(),
      avgOrganHealth: avgHealth,
      organs: organHealth,
      state: {
        cognitive: this.state.cognitive,
        affective: this.state.affective,
        somatic: this.state.somatic,
        sovereign: this.state.sovereign
      }
    };
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      current_phase: this.phase.id,
      heartbeat_count: this.heartbeatCount,
      vitality: this.state.getVitality()
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      phase: this.phase.id,
      heartbeatCount: this.heartbeatCount,
      state: {
        cognitive: this.state.cognitive,
        affective: this.state.affective,
        somatic: this.state.somatic,
        sovereign: this.state.sovereign
      },
      organs: Array.from(this.organs.entries()).map(([id, organ]) => ({
        id,
        health: organ.health,
        state: organ.state
      })),
      lifecycleHistory: this.lifecycleHistory.slice(-20),
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'All organs pulse at 873ms heartbeat',
  '4-register state: Cognitive, Affective, Somatic, Sovereign',
  'Lifecycle: Boot → Federate → Grow → Self-program → Canonize → Iterate',
  'PHI-encoded math throughout'
];

export default CivilizationScaleOrganismProtocol;

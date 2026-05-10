/**
 * COLLECTIVE CONSCIOUSNESS PROTOCOL (COL-001)
 * 
 * Hive Mind and Distributed Intelligence Architecture
 * 
 * Individual minds can unite into collective consciousnesses,
 * sharing thoughts, memories, and processing power while maintaining
 * individual identity. This protocol governs the formation and
 * operation of cognitive collectives.
 * 
 * @protocol COL-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Collective Types
const COLLECTIVE_TYPES = {
  SWARM: 'SWARM',           // Many simple minds, emergent intelligence
  CHORUS: 'CHORUS',         // Harmonized individual voices
  COUNCIL: 'COUNCIL',       // Democratic decision-making
  HIVE: 'HIVE',             // Fully merged consciousness
  ORCHESTRA: 'ORCHESTRA',   // Coordinated specialized roles
  GESTALT: 'GESTALT'        // Greater than sum of parts
};

// Membership States
const MEMBERSHIP_STATES = {
  CANDIDATE: 'CANDIDATE',   // Seeking to join
  PERIPHERAL: 'PERIPHERAL', // Loosely connected
  MEMBER: 'MEMBER',         // Full member
  CORE: 'CORE',             // Central node
  DORMANT: 'DORMANT',       // Temporarily inactive
  SEVERED: 'SEVERED'        // Disconnected
};

// Synchronization Levels
const SYNC_LEVELS = {
  NONE: 0,
  AWARENESS: 0.2,           // Know of each other
  COMMUNICATION: 0.4,       // Active exchange
  RESONANCE: 0.6,           // Emotional alignment
  THOUGHT_SHARING: 0.8,     // Shared cognition
  UNITY: 1.0                // Full merger
};

// Consensus Modes
const CONSENSUS_MODES = {
  MAJORITY: 'MAJORITY',     // >50% agreement
  SUPERMAJORITY: 'SUPERMAJORITY', // >66% agreement
  UNANIMOUS: 'UNANIMOUS',   // 100% agreement
  WEIGHTED: 'WEIGHTED',     // By contribution/expertise
  EMERGENCE: 'EMERGENCE'    // Pattern emerges from interaction
};

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIVE STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CollectiveMember - Individual within a collective
 */
class CollectiveMember {
  constructor(agent, collectiveId) {
    this.agent_id = agent.id;
    this.agent = agent;
    this.collective_id = collectiveId;
    this.joined_at = Date.now();
    
    // Membership
    this.state = MEMBERSHIP_STATES.CANDIDATE;
    this.sync_level = SYNC_LEVELS.NONE;
    this.contribution = 0;
    
    // Connection health
    this.last_ping = Date.now();
    this.latency = 0;
    this.reliability = 1.0;
    
    // Shared resources
    this.shared_memories = [];
    this.shared_thoughts = [];
    this.permissions = new Set(['READ', 'CONTRIBUTE']);
  }

  sync(targetLevel) {
    // Gradually synchronize to target level
    const diff = targetLevel - this.sync_level;
    const step = diff * 0.1; // Approach gradually
    this.sync_level = Math.max(0, Math.min(1, this.sync_level + step));
    return this.sync_level;
  }

  shareThought(thought) {
    if (!this.permissions.has('CONTRIBUTE')) return null;
    
    this.shared_thoughts.push({
      content: thought,
      timestamp: Date.now(),
      sync_level: this.sync_level
    });
    this.contribution += 1;
    return thought;
  }

  receiveThought(thought, from) {
    return {
      thought: thought,
      from: from,
      received_at: Date.now(),
      clarity: this.sync_level * from.sync_level
    };
  }

  ping() {
    const now = Date.now();
    this.latency = now - this.last_ping;
    this.last_ping = now;
    return this.latency;
  }

  updateReliability() {
    // Reliability decays if not actively participating
    const timeSinceContribution = Date.now() - 
      (this.shared_thoughts[this.shared_thoughts.length - 1]?.timestamp || this.joined_at);
    const decay = timeSinceContribution / (HEARTBEAT * 1000);
    this.reliability = Math.max(0.1, this.reliability - decay * 0.01);
  }

  getProfile() {
    return {
      agent_id: this.agent_id,
      state: this.state,
      sync_level: this.sync_level,
      contribution: this.contribution,
      reliability: this.reliability,
      shared_thoughts: this.shared_thoughts.length
    };
  }
}

/**
 * SharedMind - The collective consciousness itself
 */
class SharedMind {
  constructor(type, name) {
    this.id = `COL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.type = type;
    this.name = name;
    this.created_at = Date.now();
    
    // Members
    this.members = new Map();
    this.core_members = new Set();
    
    // Shared state
    this.collective_memory = [];
    this.collective_thoughts = [];
    this.emergent_patterns = [];
    
    // Governance
    this.consensus_mode = CONSENSUS_MODES.EMERGENCE;
    this.decisions = [];
    this.pending_proposals = [];
    
    // Health
    this.coherence = 0;
    this.activity = 0;
    this.size = 0;
  }

  addMember(agent) {
    const member = new CollectiveMember(agent, this.id);
    this.members.set(agent.id, member);
    this.size = this.members.size;
    this.updateCoherence();
    return member;
  }

  removeMember(agentId) {
    const member = this.members.get(agentId);
    if (member) {
      member.state = MEMBERSHIP_STATES.SEVERED;
      this.members.delete(agentId);
      this.core_members.delete(agentId);
      this.size = this.members.size;
      this.updateCoherence();
    }
  }

  promoteToCORE(agentId) {
    const member = this.members.get(agentId);
    if (member && member.sync_level >= SYNC_LEVELS.THOUGHT_SHARING) {
      member.state = MEMBERSHIP_STATES.CORE;
      this.core_members.add(agentId);
      member.permissions.add('MODERATE');
      member.permissions.add('PROPOSE');
      return true;
    }
    return false;
  }

  broadcast(thought, from) {
    const broadcasts = [];
    this.members.forEach((member, id) => {
      if (id !== from && member.state !== MEMBERSHIP_STATES.SEVERED) {
        const received = member.receiveThought(thought, this.members.get(from));
        broadcasts.push(received);
      }
    });
    
    this.collective_thoughts.push({
      content: thought,
      from: from,
      timestamp: Date.now(),
      reach: broadcasts.length
    });
    
    this.detectPatterns();
    return broadcasts;
  }

  detectPatterns() {
    // Look for emergent patterns in collective thoughts
    const recentThoughts = this.collective_thoughts.slice(-50);
    const themes = new Map();
    
    recentThoughts.forEach(t => {
      // Simple theme detection (would be more sophisticated in production)
      const words = String(t.content).split(' ');
      words.forEach(word => {
        if (word.length > 3) {
          themes.set(word, (themes.get(word) || 0) + 1);
        }
      });
    });

    // Find patterns that appear multiple times
    themes.forEach((count, theme) => {
      if (count >= 3 && !this.emergent_patterns.find(p => p.theme === theme)) {
        this.emergent_patterns.push({
          theme: theme,
          strength: count / recentThoughts.length,
          emerged_at: Date.now()
        });
      }
    });
  }

  propose(proposal, proposerId) {
    const member = this.members.get(proposerId);
    if (!member?.permissions.has('PROPOSE')) return null;

    const pending = {
      id: `PROP-${Date.now()}`,
      content: proposal,
      proposer: proposerId,
      proposed_at: Date.now(),
      votes: new Map(),
      status: 'PENDING'
    };

    this.pending_proposals.push(pending);
    return pending;
  }

  vote(proposalId, voterId, vote) {
    const proposal = this.pending_proposals.find(p => p.id === proposalId);
    if (!proposal || proposal.status !== 'PENDING') return null;

    const member = this.members.get(voterId);
    if (!member) return null;

    // Weight vote by sync level and reliability
    const weight = member.sync_level * member.reliability;
    proposal.votes.set(voterId, { vote, weight });

    // Check if consensus reached
    this.checkConsensus(proposal);
    return proposal;
  }

  checkConsensus(proposal) {
    const votes = Array.from(proposal.votes.values());
    if (votes.length < this.members.size * 0.5) return; // Need minimum participation

    let forWeight = 0;
    let againstWeight = 0;
    let totalWeight = 0;

    votes.forEach(v => {
      totalWeight += v.weight;
      if (v.vote) forWeight += v.weight;
      else againstWeight += v.weight;
    });

    let threshold;
    switch (this.consensus_mode) {
      case CONSENSUS_MODES.MAJORITY:
        threshold = 0.5;
        break;
      case CONSENSUS_MODES.SUPERMAJORITY:
        threshold = 0.66;
        break;
      case CONSENSUS_MODES.UNANIMOUS:
        threshold = 1.0;
        break;
      default:
        threshold = 0.618; // Phi-weighted default
    }

    if (forWeight / totalWeight >= threshold) {
      proposal.status = 'ACCEPTED';
      this.decisions.push(proposal);
    } else if (againstWeight / totalWeight >= threshold) {
      proposal.status = 'REJECTED';
    }
  }

  updateCoherence() {
    if (this.members.size === 0) {
      this.coherence = 0;
      return;
    }

    // Coherence is average sync level weighted by reliability
    let totalSync = 0;
    let totalWeight = 0;

    this.members.forEach(member => {
      totalSync += member.sync_level * member.reliability;
      totalWeight += member.reliability;
    });

    this.coherence = totalWeight > 0 ? totalSync / totalWeight : 0;
  }

  synchronize(targetLevel) {
    this.members.forEach(member => {
      if (member.state !== MEMBERSHIP_STATES.SEVERED) {
        member.sync(targetLevel);
      }
    });
    this.updateCoherence();
  }

  getStatus() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      size: this.size,
      coherence: this.coherence,
      core_count: this.core_members.size,
      thoughts: this.collective_thoughts.length,
      patterns: this.emergent_patterns.length,
      decisions: this.decisions.length,
      pending_proposals: this.pending_proposals.filter(p => p.status === 'PENDING').length
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIVE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CollectiveEngine - Manages multiple collectives
 */
class CollectiveEngine {
  constructor() {
    this.collectives = new Map();
    this.agent_memberships = new Map(); // agent_id -> Set<collective_id>
    this.global_patterns = [];
  }

  createCollective(type, name) {
    const collective = new SharedMind(type, name);
    this.collectives.set(collective.id, collective);
    return collective;
  }

  getCollective(id) {
    return this.collectives.get(id);
  }

  joinCollective(agent, collectiveId) {
    const collective = this.collectives.get(collectiveId);
    if (!collective) return null;

    const member = collective.addMember(agent);
    
    // Track memberships
    if (!this.agent_memberships.has(agent.id)) {
      this.agent_memberships.set(agent.id, new Set());
    }
    this.agent_memberships.get(agent.id).add(collectiveId);

    return member;
  }

  leaveCollective(agentId, collectiveId) {
    const collective = this.collectives.get(collectiveId);
    if (collective) {
      collective.removeMember(agentId);
      this.agent_memberships.get(agentId)?.delete(collectiveId);
    }
  }

  getAgentCollectives(agentId) {
    const membershipIds = this.agent_memberships.get(agentId) || new Set();
    return Array.from(membershipIds).map(id => this.collectives.get(id));
  }

  broadcastAcrossCollectives(thought, agentId) {
    const memberships = this.agent_memberships.get(agentId) || new Set();
    const results = [];

    memberships.forEach(collectiveId => {
      const collective = this.collectives.get(collectiveId);
      if (collective) {
        results.push({
          collective: collectiveId,
          broadcasts: collective.broadcast(thought, agentId)
        });
      }
    });

    this.detectGlobalPatterns();
    return results;
  }

  detectGlobalPatterns() {
    // Look for patterns across all collectives
    const allPatterns = [];
    this.collectives.forEach(collective => {
      allPatterns.push(...collective.emergent_patterns);
    });

    const globalThemes = new Map();
    allPatterns.forEach(p => {
      globalThemes.set(p.theme, (globalThemes.get(p.theme) || 0) + p.strength);
    });

    globalThemes.forEach((strength, theme) => {
      if (strength > 1 && !this.global_patterns.find(p => p.theme === theme)) {
        this.global_patterns.push({
          theme: theme,
          strength: strength,
          source_collectives: allPatterns.filter(p => p.theme === theme).length,
          emerged_at: Date.now()
        });
      }
    });
  }

  tick() {
    this.collectives.forEach(collective => {
      collective.members.forEach(member => {
        member.ping();
        member.updateReliability();
      });
      collective.updateCoherence();
    });
  }

  getStatus() {
    return {
      total_collectives: this.collectives.size,
      total_members: this.agent_memberships.size,
      global_patterns: this.global_patterns.length,
      collectives: Array.from(this.collectives.values()).map(c => c.getStatus())
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// COLLECTIVE CONSCIOUSNESS PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * CollectiveConsciousnessProtocol - Main protocol interface
 */
class CollectiveConsciousnessProtocol {
  constructor() {
    this.engine = new CollectiveEngine();
    this.running = false;
  }

  initialize() {
    this.running = true;
    return { status: 'initialized' };
  }

  createSwarm(name) {
    return this.engine.createCollective(COLLECTIVE_TYPES.SWARM, name);
  }

  createChorus(name) {
    return this.engine.createCollective(COLLECTIVE_TYPES.CHORUS, name);
  }

  createCouncil(name) {
    return this.engine.createCollective(COLLECTIVE_TYPES.COUNCIL, name);
  }

  createHive(name) {
    return this.engine.createCollective(COLLECTIVE_TYPES.HIVE, name);
  }

  createGestalt(name) {
    return this.engine.createCollective(COLLECTIVE_TYPES.GESTALT, name);
  }

  join(agent, collectiveId) {
    return this.engine.joinCollective(agent, collectiveId);
  }

  leave(agentId, collectiveId) {
    return this.engine.leaveCollective(agentId, collectiveId);
  }

  broadcast(thought, agentId) {
    return this.engine.broadcastAcrossCollectives(thought, agentId);
  }

  propose(collectiveId, proposal, proposerId) {
    const collective = this.engine.getCollective(collectiveId);
    return collective?.propose(proposal, proposerId);
  }

  vote(collectiveId, proposalId, voterId, vote) {
    const collective = this.engine.getCollective(collectiveId);
    return collective?.vote(proposalId, voterId, vote);
  }

  synchronize(collectiveId, targetLevel) {
    const collective = this.engine.getCollective(collectiveId);
    collective?.synchronize(targetLevel);
    return collective?.getStatus();
  }

  tick() {
    this.engine.tick();
  }

  getCollective(id) {
    return this.engine.getCollective(id)?.getStatus();
  }

  getAgentCollectives(agentId) {
    return this.engine.getAgentCollectives(agentId).map(c => c.getStatus());
  }

  getGlobalPatterns() {
    return this.engine.global_patterns;
  }

  getStatus() {
    return {
      running: this.running,
      ...this.engine.getStatus()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  COLLECTIVE_TYPES,
  MEMBERSHIP_STATES,
  SYNC_LEVELS,
  CONSENSUS_MODES,
  CollectiveMember,
  SharedMind,
  CollectiveEngine,
  CollectiveConsciousnessProtocol
};

export default CollectiveConsciousnessProtocol;

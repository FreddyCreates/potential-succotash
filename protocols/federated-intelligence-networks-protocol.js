/**
 * FIN-001: Federated Intelligence Networks Protocol
 * 
 * Sovereign nodes with shared laws.
 * Each node is sovereign; federation is via protocols, not ownership.
 * Implements treaty management and dispute resolution.
 * 
 * @module federated-intelligence-networks-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Node Sovereignty Levels ─────────────────────────────────────────────────
export const SOVEREIGNTY_LEVELS = {
  FULL: { id: 'full', weight: PHI, description: 'Full sovereign authority' },
  FEDERATED: { id: 'federated', weight: 1.0, description: 'Federated member' },
  ASSOCIATED: { id: 'associated', weight: PHI_INV, description: 'Associated partner' },
  OBSERVER: { id: 'observer', weight: 0.382, description: 'Observer status' }
};

// ─── Treaty Types ────────────────────────────────────────────────────────────
export const TREATY_TYPES = {
  MUTUAL_RECOGNITION: 'mutual_recognition',
  PROTOCOL_ADOPTION: 'protocol_adoption',
  ECONOMIC_AGREEMENT: 'economic_agreement',
  SECURITY_PACT: 'security_pact',
  RESEARCH_COLLABORATION: 'research_collaboration'
};

// ─── Dispute States ──────────────────────────────────────────────────────────
export const DISPUTE_STATES = {
  FILED: 'filed',
  UNDER_REVIEW: 'under_review',
  MEDIATION: 'mediation',
  ARBITRATION: 'arbitration',
  RESOLVED: 'resolved',
  ESCALATED: 'escalated'
};

// ─── Sovereign Node ──────────────────────────────────────────────────────────
class SovereignNode {
  constructor(id, name, sovereignty = SOVEREIGNTY_LEVELS.FULL) {
    this.id = id;
    this.name = name;
    this.sovereignty = sovereignty;
    this.treaties = new Map();
    this.adoptedProtocols = new Set();
    this.disputes = [];
    this.votingPower = sovereignty.weight;
    this.created = Date.now();
    this.lastActive = Date.now();
  }
  
  signTreaty(treatyId, treaty) {
    this.treaties.set(treatyId, {
      treaty,
      signedAt: Date.now(),
      status: 'active'
    });
    this.lastActive = Date.now();
  }
  
  adoptProtocol(protocolId) {
    this.adoptedProtocols.add(protocolId);
    this.lastActive = Date.now();
  }
  
  fileDispute(dispute) {
    this.disputes.push(dispute);
    this.lastActive = Date.now();
  }
  
  calculateVotingPower() {
    // Base power from sovereignty level
    let power = this.sovereignty.weight;
    
    // Bonus for treaties
    power += this.treaties.size * 0.1 * PHI_INV;
    
    // Bonus for protocol adoption
    power += this.adoptedProtocols.size * 0.05 * PHI_INV;
    
    this.votingPower = Math.min(power, PHI * 2);  // Cap at 2*PHI
    return this.votingPower;
  }
}

// ─── Treaty ──────────────────────────────────────────────────────────────────
class Treaty {
  constructor(id, type, signatories, terms) {
    this.id = id;
    this.type = type;
    this.signatories = new Set(signatories);
    this.terms = terms;
    this.status = 'draft';
    this.signatures = new Map();
    this.created = Date.now();
    this.ratified = null;
    this.amendments = [];
  }
  
  sign(nodeId, signature) {
    if (!this.signatories.has(nodeId)) {
      throw new Error(`Node ${nodeId} is not a signatory`);
    }
    
    this.signatures.set(nodeId, {
      signature,
      signedAt: Date.now()
    });
    
    // Check if all signatories have signed
    if (this.signatures.size === this.signatories.size) {
      this.status = 'ratified';
      this.ratified = Date.now();
    }
    
    return this.status;
  }
  
  amend(amendment, approvers) {
    // Require majority to amend
    const required = Math.ceil(this.signatories.size * PHI_INV);
    if (approvers.size < required) {
      throw new Error(`Insufficient approvers: ${approvers.size} < ${required}`);
    }
    
    this.amendments.push({
      content: amendment,
      approvers: Array.from(approvers),
      timestamp: Date.now()
    });
    
    return this.amendments.length;
  }
  
  terminate(reason, initiator) {
    this.status = 'terminated';
    this.termination = {
      reason,
      initiator,
      timestamp: Date.now()
    };
  }
}

// ─── Dispute ─────────────────────────────────────────────────────────────────
class Dispute {
  constructor(id, plaintiff, defendant, claim) {
    this.id = id;
    this.plaintiff = plaintiff;
    this.defendant = defendant;
    this.claim = claim;
    this.state = DISPUTE_STATES.FILED;
    this.evidence = [];
    this.responses = [];
    this.resolution = null;
    this.created = Date.now();
    this.timeline = [{
      action: 'filed',
      timestamp: Date.now()
    }];
  }
  
  addEvidence(party, evidence) {
    this.evidence.push({
      party,
      evidence,
      timestamp: Date.now()
    });
  }
  
  respond(party, response) {
    this.responses.push({
      party,
      response,
      timestamp: Date.now()
    });
  }
  
  updateState(newState) {
    this.state = newState;
    this.timeline.push({
      action: newState,
      timestamp: Date.now()
    });
  }
  
  resolve(resolution, arbiter) {
    this.state = DISPUTE_STATES.RESOLVED;
    this.resolution = {
      decision: resolution,
      arbiter,
      timestamp: Date.now()
    };
    this.timeline.push({
      action: 'resolved',
      resolution,
      timestamp: Date.now()
    });
  }
}

// ─── Federated Intelligence Networks Protocol ────────────────────────────────
export class FederatedIntelligenceNetworksProtocol {
  constructor() {
    this.id = 'FIN-001';
    this.name = 'Federated Intelligence Networks';
    this.version = '1.0.0';
    
    this.nodes = new Map();
    this.treaties = new Map();
    this.disputes = new Map();
    this.sharedLaws = new Map();
    
    this.metrics = {
      nodes_registered: 0,
      treaties_signed: 0,
      disputes_filed: 0,
      disputes_resolved: 0
    };
  }
  
  // ─── Node Management ───────────────────────────────────────────────────────
  registerNode(id, name, sovereignty = 'FULL') {
    if (this.nodes.has(id)) {
      throw new Error(`Node already exists: ${id}`);
    }
    
    const sovereigntyLevel = SOVEREIGNTY_LEVELS[sovereignty] || SOVEREIGNTY_LEVELS.FEDERATED;
    const node = new SovereignNode(id, name, sovereigntyLevel);
    this.nodes.set(id, node);
    this.metrics.nodes_registered++;
    
    return node;
  }
  
  getNode(id) {
    return this.nodes.get(id);
  }
  
  // ─── FIN-TREATY: Define shared laws ────────────────────────────────────────
  proposeTreaty(type, signatories, terms) {
    const treatyId = `treaty-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    // Validate all signatories exist
    for (const nodeId of signatories) {
      if (!this.nodes.has(nodeId)) {
        throw new Error(`Node not found: ${nodeId}`);
      }
    }
    
    const treaty = new Treaty(treatyId, type, signatories, terms);
    this.treaties.set(treatyId, treaty);
    
    return treaty;
  }
  
  signTreaty(treatyId, nodeId, signature) {
    const treaty = this.treaties.get(treatyId);
    if (!treaty) throw new Error(`Treaty not found: ${treatyId}`);
    
    const status = treaty.sign(nodeId, signature);
    
    // Update node
    const node = this.nodes.get(nodeId);
    if (node) {
      node.signTreaty(treatyId, treaty);
    }
    
    if (status === 'ratified') {
      this.metrics.treaties_signed++;
      
      // Add to shared laws if protocol adoption treaty
      if (treaty.type === TREATY_TYPES.PROTOCOL_ADOPTION) {
        this.sharedLaws.set(treatyId, {
          treaty,
          effectiveDate: Date.now()
        });
      }
    }
    
    return status;
  }
  
  // ─── FIN-DISPUTE: Resolve conflicts ────────────────────────────────────────
  fileDispute(plaintiffId, defendantId, claim) {
    const disputeId = `dispute-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    
    const plaintiff = this.nodes.get(plaintiffId);
    const defendant = this.nodes.get(defendantId);
    
    if (!plaintiff || !defendant) {
      throw new Error('Plaintiff or defendant not found');
    }
    
    const dispute = new Dispute(disputeId, plaintiffId, defendantId, claim);
    this.disputes.set(disputeId, dispute);
    
    plaintiff.fileDispute(dispute);
    defendant.fileDispute(dispute);
    
    this.metrics.disputes_filed++;
    
    return dispute;
  }
  
  resolveDispute(disputeId, resolution, arbiterId) {
    const dispute = this.disputes.get(disputeId);
    if (!dispute) throw new Error(`Dispute not found: ${disputeId}`);
    
    dispute.resolve(resolution, arbiterId);
    this.metrics.disputes_resolved++;
    
    return dispute;
  }
  
  // ─── Calculate federation-wide voting ──────────────────────────────────────
  calculateVotes(proposal) {
    let totalPower = 0;
    let yesVotes = 0;
    let noVotes = 0;
    
    for (const node of this.nodes.values()) {
      const power = node.calculateVotingPower();
      totalPower += power;
    }
    
    return {
      totalPower,
      yesVotes,
      noVotes,
      quorum: totalPower * PHI_INV,
      threshold: totalPower * PHI_INV
    };
  }
  
  // ─── Get shared laws ───────────────────────────────────────────────────────
  getSharedLaws() {
    return Array.from(this.sharedLaws.values());
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      active_treaties: Array.from(this.treaties.values())
        .filter(t => t.status === 'ratified').length,
      pending_disputes: Array.from(this.disputes.values())
        .filter(d => d.state !== DISPUTE_STATES.RESOLVED).length
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      nodes: Array.from(this.nodes.entries()).map(([id, node]) => ({
        id,
        name: node.name,
        sovereignty: node.sovereignty.id,
        votingPower: node.votingPower
      })),
      treaties: Array.from(this.treaties.entries()).map(([id, treaty]) => ({
        id,
        type: treaty.type,
        status: treaty.status,
        signatories: Array.from(treaty.signatories)
      })),
      disputes: Array.from(this.disputes.entries()).map(([id, dispute]) => ({
        id,
        state: dispute.state,
        plaintiff: dispute.plaintiff,
        defendant: dispute.defendant
      })),
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Each node is sovereign',
  'Federation via protocols, not ownership',
  'Treaties require all signatories',
  'Disputes resolved through arbitration'
];

export default FederatedIntelligenceNetworksProtocol;

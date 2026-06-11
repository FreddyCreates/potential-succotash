/**
 * GOV-FED-001: Federation Governance Protocol
 *
 * Coordinates peer admission, voting, treasury governance, proposal flow,
 * disputes, and orderly federation forks.
 */

const PHI = 1.618033988749895;
const HEARTBEAT_MS = 873;
const THRESHOLD = 0.618;

const STAGES = ['admission', 'proposal', 'voting', 'execution', 'dispute', 'fork'];
const clone = (value) => JSON.parse(JSON.stringify(value));
const now = () => Date.now();

class FederationGovernanceRuntime {
  constructor() {
    this.id = 'GOV-FED-001';
    this.name = 'Federation Governance Protocol';
    this.version = '1.0.0';
    this.description = 'Operates multi-node peer governance with treasury and fork controls.';
    this.stages = STAGES;
    this.peers = new Map();
    this.proposals = [];
    this.disputes = [];
    this.forks = [];
    this.treasury = { balance: 0, allocations: [] };
    this.auditTrail = [];
  }

  log(type, detail) {
    const entry = { id: `${type}-${this.auditTrail.length + 1}`, type, timestamp: now(), detail };
    this.auditTrail.push(entry);
    return entry;
  }

  admitPeer({ peerId, stake = 1, reputation = 1, sponsor = 'federation' }) {
    const peer = { peerId, stake, reputation, sponsor, admittedAt: now(), status: 'active' };
    this.peers.set(peerId, peer);
    this.log('peer-admitted', peer);
    return peer;
  }

  createProposal({ proposalId, title, proposer, kind = 'governance', amount = 0 }) {
    const proposal = {
      proposalId,
      title,
      proposer,
      kind,
      amount,
      status: 'voting',
      votes: [],
      createdAt: now()
    };
    this.proposals.push(proposal);
    this.log('proposal-created', { proposalId, proposer, kind });
    return proposal;
  }

  castVote({ proposalId, peerId, support }) {
    const proposal = this.proposals.find((entry) => entry.proposalId === proposalId);
    const peer = this.peers.get(peerId);
    const vote = { peerId, support, weight: peer.stake * peer.reputation, timestamp: now() };
    proposal.votes = proposal.votes.filter((entry) => entry.peerId !== peerId).concat(vote);
    const quorum = proposal.votes.length / Math.max(this.peers.size, 1);
    const supportWeight = proposal.votes.filter((entry) => entry.support).reduce((sum, entry) => sum + entry.weight, 0);
    const totalWeight = proposal.votes.reduce((sum, entry) => sum + entry.weight, 0);
    proposal.quorumMet = quorum >= THRESHOLD;
    proposal.supermajorityMet = totalWeight > 0 ? supportWeight / totalWeight >= THRESHOLD : false;
    proposal.status = proposal.quorumMet && proposal.supermajorityMet ? 'approved' : 'voting';
    this.log('vote-cast', { proposalId, peerId, support, quorum });
    return proposal;
  }

  allocateTreasury({ proposalId, amount, recipient, purpose }) {
    this.treasury.balance -= amount;
    const allocation = { proposalId, amount, recipient, purpose, timestamp: now() };
    this.treasury.allocations.push(allocation);
    this.log('treasury-allocated', allocation);
    return allocation;
  }

  openDispute({ disputeId, peerId, subject, summary }) {
    const dispute = { disputeId, peerId, subject, summary, status: 'open', openedAt: now() };
    this.disputes.push(dispute);
    this.log('dispute-opened', dispute);
    return dispute;
  }

  forkFederation({ forkId, rationale, peers }) {
    const fork = { forkId, rationale, peers: [...peers], createdAt: now(), gracePeriodMs: HEARTBEAT_MS * 144 };
    this.forks.push(fork);
    this.log('fork-created', fork);
    return fork;
  }

  validate(input = {}) {
    const issues = [];
    const proposal = input.proposalId ? this.proposals.find((entry) => entry.proposalId === input.proposalId) : null;

    if (!input.action) issues.push('action is required');
    if (input.peerId && !this.peers.has(input.peerId) && input.action !== 'admit-peer') issues.push('peer is not admitted');
    if (input.amount !== undefined && input.amount < 0) issues.push('amount must be non-negative');
    if (input.action === 'allocate-treasury' && input.amount > this.treasury.balance) issues.push('insufficient treasury balance');
    if (input.action === 'cast-vote' && !proposal) issues.push('proposal was not found');
    if (input.peers && input.peers.length === 0) issues.push('fork must include at least one peer');

    return {
      valid: issues.length === 0,
      issues,
      peerCount: this.peers.size,
      treasuryBalance: this.treasury.balance,
      proposal: proposal ? clone(proposal) : null
    };
  }

  enforce(input = {}) {
    const validation = this.validate(input);
    if (!validation.valid) {
      return { success: false, validation, stage: 'proposal' };
    }

    switch (input.action) {
      case 'admit-peer':
        return { success: true, stage: 'admission', peer: this.admitPeer(input) };
      case 'create-proposal':
        return { success: true, stage: 'proposal', proposal: this.createProposal(input) };
      case 'cast-vote':
        return { success: true, stage: 'voting', proposal: this.castVote(input) };
      case 'allocate-treasury':
        return { success: true, stage: 'execution', allocation: this.allocateTreasury(input) };
      case 'open-dispute':
        return { success: true, stage: 'dispute', dispute: this.openDispute(input) };
      case 'fork-federation':
        return { success: true, stage: 'fork', fork: this.forkFederation(input) };
      default:
        return { success: false, validation, reason: `Unsupported action: ${input.action}` };
    }
  }

  audit({ since = 0 } = {}) {
    return {
      id: this.id,
      stages: [...this.stages],
      peers: [...this.peers.values()].map(clone),
      proposals: clone(this.proposals),
      treasury: clone(this.treasury),
      disputes: clone(this.disputes),
      forks: clone(this.forks),
      entries: this.auditTrail.filter((entry) => entry.timestamp >= since)
    };
  }
}

const runtime = new FederationGovernanceRuntime();

export const FederationGovernanceProtocol = {
  id: runtime.id,
  name: runtime.name,
  version: runtime.version,
  description: runtime.description,
  phi: PHI,
  heartbeat: HEARTBEAT_MS,
  threshold: THRESHOLD,
  stages: STAGES,
  phases: STAGES,
  validate: (input) => runtime.validate(input),
  enforce: (input) => runtime.enforce(input),
  audit: (input) => runtime.audit(input)
};

export { PHI, HEARTBEAT_MS, THRESHOLD, STAGES, FederationGovernanceRuntime };
export default FederationGovernanceProtocol;

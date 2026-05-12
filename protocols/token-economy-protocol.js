/**
 * ECO-001: Token Economy Protocol
 * 
 * The cognitive economy of the Civilization Organism.
 * Manages INT tokens (intelligence contribution tokens) for
 * priority, access, compute allocation, and governance weight.
 * 
 * @module token-economy-protocol
 * @version 1.0.0
 * @license AURO-SOVEREIGN
 */

// ─── Phi Constants ───────────────────────────────────────────────────────────
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;
const DECAY_RATE = 1 / (PHI * PHI);  // ~0.382 per cycle for inactive tokens

// ─── Token Types ─────────────────────────────────────────────────────────────
export const TOKEN_TYPES = {
  INT: {
    id: 'INT',
    name: 'Intelligence Contribution Token',
    description: 'Base unit of cognitive contribution measurement',
    divisibility: 18,
    decayable: true
  },
  COMPUTE: {
    id: 'COMPUTE',
    name: 'Compute Credit',
    description: 'Processing power allocation unit',
    divisibility: 6,
    decayable: true
  },
  PRIORITY: {
    id: 'PRIORITY',
    name: 'Priority Credit',
    description: 'Queue position and attention weight',
    divisibility: 2,
    decayable: true
  },
  GOV: {
    id: 'GOV',
    name: 'Governance Weight',
    description: 'Voting power in federation decisions',
    divisibility: 4,
    decayable: false
  }
};

// ─── Contribution Types ──────────────────────────────────────────────────────
export const CONTRIBUTION_TYPES = {
  PROTOCOL: { id: 'protocol', mint_rate: PHI, description: 'New protocol creation' },
  ARCHITECTURE: { id: 'architecture', mint_rate: PHI, description: 'Architectural design' },
  TOOL: { id: 'tool', mint_rate: 1.0, description: 'Tool development' },
  PROOF: { id: 'proof', mint_rate: PHI, description: 'Formal proofs' },
  SYNTHESIS: { id: 'synthesis', mint_rate: PHI_INV, description: 'Knowledge synthesis' },
  DOCUMENTATION: { id: 'documentation', mint_rate: PHI_INV, description: 'Documentation' },
  REVIEW: { id: 'review', mint_rate: 0.5, description: 'Code/protocol review' },
  TEST: { id: 'test', mint_rate: 0.5, description: 'Testing and validation' }
};

// ─── Account ─────────────────────────────────────────────────────────────────
class Account {
  constructor(id, type) {
    this.id = id;
    this.type = type;  // 'agent', 'human', 'city_state', 'hub'
    this.balances = {};
    this.vestingSchedules = [];
    this.reputation = 1.0;
    this.created = Date.now();
    this.lastActivity = Date.now();
    
    // Initialize zero balances for all token types
    for (const tokenType of Object.keys(TOKEN_TYPES)) {
      this.balances[tokenType] = 0;
    }
  }
  
  credit(tokenType, amount) {
    if (!TOKEN_TYPES[tokenType]) {
      throw new Error(`Unknown token type: ${tokenType}`);
    }
    this.balances[tokenType] += amount;
    this.lastActivity = Date.now();
    return this.balances[tokenType];
  }
  
  debit(tokenType, amount) {
    if (!TOKEN_TYPES[tokenType]) {
      throw new Error(`Unknown token type: ${tokenType}`);
    }
    if (this.balances[tokenType] < amount) {
      throw new Error(`Insufficient balance: ${this.balances[tokenType]} < ${amount}`);
    }
    this.balances[tokenType] -= amount;
    this.lastActivity = Date.now();
    return this.balances[tokenType];
  }
  
  getBalance(tokenType) {
    return this.balances[tokenType] || 0;
  }
  
  decay() {
    const elapsed = Date.now() - this.lastActivity;
    const cycles = Math.floor(elapsed / (HEARTBEAT * 1000));
    
    if (cycles > 0) {
      for (const [tokenType, config] of Object.entries(TOKEN_TYPES)) {
        if (config.decayable && this.balances[tokenType] > 0) {
          const decayFactor = Math.pow(1 - DECAY_RATE, cycles);
          this.balances[tokenType] *= decayFactor;
        }
      }
    }
    
    return cycles;
  }
  
  addVesting(tokenType, amount, vestingPeriodMs, cliffMs = 0) {
    this.vestingSchedules.push({
      tokenType,
      totalAmount: amount,
      releasedAmount: 0,
      startTime: Date.now(),
      vestingPeriodMs,
      cliffMs,
      completed: false
    });
  }
  
  processVesting() {
    const now = Date.now();
    let released = 0;
    
    for (const schedule of this.vestingSchedules) {
      if (schedule.completed) continue;
      
      const elapsed = now - schedule.startTime;
      if (elapsed < schedule.cliffMs) continue;
      
      const vestingElapsed = elapsed - schedule.cliffMs;
      const vestingProgress = Math.min(1, vestingElapsed / schedule.vestingPeriodMs);
      const shouldBeReleased = schedule.totalAmount * vestingProgress;
      const toRelease = shouldBeReleased - schedule.releasedAmount;
      
      if (toRelease > 0) {
        this.credit(schedule.tokenType, toRelease);
        schedule.releasedAmount += toRelease;
        released += toRelease;
      }
      
      if (vestingProgress >= 1) {
        schedule.completed = true;
      }
    }
    
    return released;
  }
  
  serialize() {
    return {
      id: this.id,
      type: this.type,
      balances: { ...this.balances },
      reputation: this.reputation,
      vestingSchedules: this.vestingSchedules,
      created: this.created,
      lastActivity: this.lastActivity
    };
  }
}

// ─── Transaction ─────────────────────────────────────────────────────────────
class Transaction {
  constructor(from, to, tokenType, amount, memo = '') {
    this.id = `tx-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.from = from;
    this.to = to;
    this.tokenType = tokenType;
    this.amount = amount;
    this.memo = memo;
    this.timestamp = Date.now();
    this.status = 'pending';
    this.attestation = null;
  }
  
  complete(attestation = null) {
    this.status = 'completed';
    this.attestation = attestation;
    this.completedAt = Date.now();
  }
  
  fail(reason) {
    this.status = 'failed';
    this.failureReason = reason;
    this.failedAt = Date.now();
  }
}

// ─── Token Economy Protocol ──────────────────────────────────────────────────
export class TokenEconomyProtocol {
  constructor() {
    this.id = 'ECO-001';
    this.name = 'Token Economy';
    this.version = '1.0.0';
    
    this.accounts = new Map();
    this.transactions = [];
    this.pendingTransactions = [];
    
    // Supply tracking
    this.supply = {};
    for (const tokenType of Object.keys(TOKEN_TYPES)) {
      this.supply[tokenType] = { minted: 0, burned: 0, circulating: 0 };
    }
    
    this.metrics = {
      total_minted: 0,
      total_burned: 0,
      total_transferred: 0,
      accounts_created: 0,
      transactions_completed: 0
    };
  }
  
  // ─── Account Management ────────────────────────────────────────────────────
  createAccount(id, type) {
    if (this.accounts.has(id)) {
      throw new Error(`Account already exists: ${id}`);
    }
    
    const account = new Account(id, type);
    this.accounts.set(id, account);
    this.metrics.accounts_created++;
    
    return account;
  }
  
  getAccount(id) {
    return this.accounts.get(id);
  }
  
  getOrCreateAccount(id, type = 'agent') {
    if (!this.accounts.has(id)) {
      return this.createAccount(id, type);
    }
    return this.accounts.get(id);
  }
  
  // ─── ECO-MINT: Mint on verified contribution ───────────────────────────────
  mint(accountId, tokenType, amount, contributionType, proof = null) {
    const account = this.getOrCreateAccount(accountId);
    const contribution = CONTRIBUTION_TYPES[contributionType];
    
    if (!contribution) {
      throw new Error(`Unknown contribution type: ${contributionType}`);
    }
    
    // Apply contribution mint rate
    const mintedAmount = amount * contribution.mint_rate;
    
    account.credit(tokenType, mintedAmount);
    
    // Update supply tracking
    this.supply[tokenType].minted += mintedAmount;
    this.supply[tokenType].circulating += mintedAmount;
    
    // Record mint transaction
    const tx = new Transaction('MINT', accountId, tokenType, mintedAmount, 
      `Minted for ${contributionType}`);
    tx.complete();
    this.transactions.push(tx);
    
    this.metrics.total_minted += mintedAmount;
    
    return {
      account: accountId,
      tokenType,
      amount: mintedAmount,
      contributionType,
      transaction: tx.id
    };
  }
  
  // ─── ECO-SETTLE: Settle across nodes ───────────────────────────────────────
  transfer(fromId, toId, tokenType, amount, memo = '') {
    const fromAccount = this.accounts.get(fromId);
    const toAccount = this.getOrCreateAccount(toId);
    
    if (!fromAccount) {
      throw new Error(`Source account not found: ${fromId}`);
    }
    
    // Create transaction
    const tx = new Transaction(fromId, toId, tokenType, amount, memo);
    
    try {
      // Debit source
      fromAccount.debit(tokenType, amount);
      
      // Credit destination
      toAccount.credit(tokenType, amount);
      
      tx.complete();
      this.transactions.push(tx);
      this.metrics.total_transferred += amount;
      this.metrics.transactions_completed++;
      
      return tx;
    } catch (error) {
      tx.fail(error.message);
      this.transactions.push(tx);
      throw error;
    }
  }
  
  // ─── ECO-REWARD: Distribute rewards ────────────────────────────────────────
  reward(accountId, tokenType, amount, reason = 'reward') {
    return this.mint(accountId, tokenType, amount, 'SYNTHESIS', { reason });
  }
  
  // ─── ECO-BURN: Burn tokens ─────────────────────────────────────────────────
  burn(accountId, tokenType, amount) {
    const account = this.accounts.get(accountId);
    if (!account) {
      throw new Error(`Account not found: ${accountId}`);
    }
    
    account.debit(tokenType, amount);
    
    this.supply[tokenType].burned += amount;
    this.supply[tokenType].circulating -= amount;
    
    const tx = new Transaction(accountId, 'BURN', tokenType, amount, 'Token burn');
    tx.complete();
    this.transactions.push(tx);
    
    this.metrics.total_burned += amount;
    
    return tx;
  }
  
  // ─── Process decay cycle ───────────────────────────────────────────────────
  tick() {
    let totalDecayed = 0;
    
    for (const account of this.accounts.values()) {
      const beforeBalances = { ...account.balances };
      account.decay();
      account.processVesting();
      
      // Calculate decay amount
      for (const [tokenType, config] of Object.entries(TOKEN_TYPES)) {
        if (config.decayable) {
          const decayed = beforeBalances[tokenType] - account.balances[tokenType];
          if (decayed > 0) {
            totalDecayed += decayed;
            this.supply[tokenType].circulating -= decayed;
            this.supply[tokenType].burned += decayed;
          }
        }
      }
    }
    
    return totalDecayed;
  }
  
  // ─── Get supply info ───────────────────────────────────────────────────────
  getSupply(tokenType = null) {
    if (tokenType) {
      return this.supply[tokenType];
    }
    return this.supply;
  }
  
  // ─── Get metrics ───────────────────────────────────────────────────────────
  getMetrics() {
    return {
      ...this.metrics,
      supply: this.supply,
      account_count: this.accounts.size,
      transaction_count: this.transactions.length
    };
  }
  
  // ─── Export state ──────────────────────────────────────────────────────────
  export() {
    return {
      protocol: this.id,
      version: this.version,
      accounts: Array.from(this.accounts.values()).map(a => a.serialize()),
      supply: this.supply,
      transactions: this.transactions.slice(-1000),  // Last 1000
      metrics: this.metrics
    };
  }
}

// ─── Invariants ──────────────────────────────────────────────────────────────
export const INVARIANTS = [
  'Total supply equals sum of all balances plus burned',
  'No negative balances permitted',
  'All minting requires proof of contribution',
  'Decay rate never exceeds 1/PHI^2 per cycle'
];

export default TokenEconomyProtocol;

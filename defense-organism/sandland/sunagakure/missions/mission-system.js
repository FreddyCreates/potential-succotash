/**
 * Mission System - Sunagakure Threat Simulation Missions
 * 
 * Missions are threat simulation scenarios that shinobi execute.
 * Each mission tests different aspects of defense systems.
 * 
 * D-Rank: Basic scans, reconnaissance
 * C-Rank: Port scanning, vulnerability assessment  
 * B-Rank: Exploitation attempts, credential attacks
 * A-Rank: APT simulation, persistence establishment
 * S-Rank: Full breach simulation, data exfiltration
 * 
 * @module sandland/sunagakure/missions
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION RANKS
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_RANKS = {
  D: { 
    name: 'D-Rank', 
    kanji: 'Dランク',
    difficulty: 1, 
    reward: 100,
    requiredRank: 'Genin',
    description: 'Basic reconnaissance and scanning'
  },
  C: { 
    name: 'C-Rank', 
    kanji: 'Cランク',
    difficulty: 2, 
    reward: 500,
    requiredRank: 'Genin',
    description: 'Port scanning and basic vulnerability assessment'
  },
  B: { 
    name: 'B-Rank', 
    kanji: 'Bランク',
    difficulty: 3, 
    reward: 2000,
    requiredRank: 'Chunin',
    description: 'Exploitation attempts and credential attacks'
  },
  A: { 
    name: 'A-Rank', 
    kanji: 'Aランク',
    difficulty: 4, 
    reward: 10000,
    requiredRank: 'Jonin',
    description: 'APT simulation and persistence establishment'
  },
  S: { 
    name: 'S-Rank', 
    kanji: 'Sランク',
    difficulty: 5, 
    reward: 50000,
    requiredRank: 'ANBU',
    description: 'Full breach simulation and data exfiltration'
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_TYPES = {
  RECONNAISSANCE: 'reconnaissance',
  INFILTRATION: 'infiltration',
  ASSAULT: 'assault',
  DEFENSE: 'defense',
  ASSASSINATION: 'assassination',
  ESCORT: 'escort',
  RETRIEVAL: 'retrieval',
  SABOTAGE: 'sabotage',
  COUNTER_INTEL: 'counter_intelligence'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION STATUS
// ═══════════════════════════════════════════════════════════════════════════════

export const MISSION_STATUS = {
  PENDING: 'pending',
  ASSIGNED: 'assigned',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
  FAILED: 'failed',
  ABORTED: 'aborted'
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Mission - A threat simulation scenario
 */
export class Mission {
  constructor(config = {}) {
    this.id = config.id || `mission-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.name = config.name || 'Unnamed Mission';
    this.codename = config.codename || this.generateCodename();
    this.rank = config.rank || MISSION_RANKS.D;
    this.type = config.type || MISSION_TYPES.RECONNAISSANCE;
    
    // Mission details
    this.target = config.target || null;
    this.objectives = config.objectives || [];
    this.description = config.description || '';
    this.briefing = config.briefing || '';
    
    // Requirements
    this.requiredTeamSize = config.requiredTeamSize || 3;
    this.requiredRank = config.requiredRank || this.rank.requiredRank;
    this.estimatedDuration = config.estimatedDuration || 3600000; // 1 hour default
    
    // State
    this.status = MISSION_STATUS.PENDING;
    this.assignedTeam = [];
    this.leader = null;
    this.progress = 0;
    
    // Results
    this.results = null;
    this.log = [];
    
    // Rewards
    this.reward = config.reward || this.rank.reward;
    this.experienceGain = this.rank.difficulty * 100;
    
    // Timestamps
    this.created = Date.now();
    this.assigned = null;
    this.started = null;
    this.completed = null;
    
    // Phi signature
    this.phi = this.computePhi();
  }
  
  /**
   * Generate random codename
   */
  generateCodename() {
    const adjectives = ['Silent', 'Hidden', 'Swift', 'Shadow', 'Desert', 'Storm', 'Iron', 'Golden'];
    const nouns = ['Wind', 'Sand', 'Scorpion', 'Serpent', 'Hawk', 'Wolf', 'Tiger', 'Dragon'];
    return `Operation ${adjectives[Math.floor(Math.random() * adjectives.length)]} ${nouns[Math.floor(Math.random() * nouns.length)]}`;
  }
  
  /**
   * Compute phi signature
   */
  computePhi() {
    const str = `${this.id}:${this.name}:${this.created}`;
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Assign team to mission
   */
  assignTeam(shinobi, leader = null) {
    if (!Array.isArray(shinobi)) {
      shinobi = [shinobi];
    }
    
    if (shinobi.length < this.requiredTeamSize) {
      return { success: false, reason: `Requires at least ${this.requiredTeamSize} shinobi` };
    }
    
    this.assignedTeam = shinobi;
    this.leader = leader || shinobi[0];
    this.status = MISSION_STATUS.ASSIGNED;
    this.assigned = Date.now();
    
    this.log.push({
      type: 'team_assigned',
      timestamp: Date.now(),
      leader: this.leader.name,
      teamSize: shinobi.length
    });
    
    return { success: true, team: shinobi.map(s => s.name) };
  }
  
  /**
   * Start mission
   */
  start() {
    if (this.status !== MISSION_STATUS.ASSIGNED) {
      return { success: false, reason: 'Mission not properly assigned' };
    }
    
    this.status = MISSION_STATUS.IN_PROGRESS;
    this.started = Date.now();
    
    this.log.push({
      type: 'mission_started',
      timestamp: Date.now()
    });
    
    return { success: true };
  }
  
  /**
   * Update progress
   */
  updateProgress(amount) {
    this.progress = Math.min(100, this.progress + amount);
    
    this.log.push({
      type: 'progress_update',
      timestamp: Date.now(),
      progress: this.progress
    });
    
    return this.progress;
  }
  
  /**
   * Complete objective
   */
  completeObjective(objectiveIndex, result = {}) {
    if (objectiveIndex >= this.objectives.length) {
      return { success: false, reason: 'Invalid objective index' };
    }
    
    this.objectives[objectiveIndex].completed = true;
    this.objectives[objectiveIndex].result = result;
    
    this.log.push({
      type: 'objective_completed',
      timestamp: Date.now(),
      objective: this.objectives[objectiveIndex].name
    });
    
    // Auto-progress based on objectives
    const completedCount = this.objectives.filter(o => o.completed).length;
    this.progress = (completedCount / this.objectives.length) * 100;
    
    return { success: true, progress: this.progress };
  }
  
  /**
   * Complete mission
   */
  complete(success = true, results = {}) {
    this.status = success ? MISSION_STATUS.COMPLETED : MISSION_STATUS.FAILED;
    this.completed = Date.now();
    this.results = {
      success,
      ...results,
      duration: this.completed - this.started,
      objectivesCompleted: this.objectives.filter(o => o.completed).length,
      totalObjectives: this.objectives.length
    };
    
    this.log.push({
      type: success ? 'mission_completed' : 'mission_failed',
      timestamp: Date.now(),
      results: this.results
    });
    
    return this.results;
  }
  
  /**
   * Abort mission
   */
  abort(reason = '') {
    this.status = MISSION_STATUS.ABORTED;
    this.completed = Date.now();
    this.results = {
      success: false,
      aborted: true,
      reason
    };
    
    this.log.push({
      type: 'mission_aborted',
      timestamp: Date.now(),
      reason
    });
    
    return this.results;
  }
  
  /**
   * Get mission briefing
   */
  getBriefing() {
    return {
      codename: this.codename,
      rank: this.rank.name,
      type: this.type,
      target: this.target,
      objectives: this.objectives.map(o => ({
        name: o.name,
        description: o.description,
        completed: o.completed || false
      })),
      briefing: this.briefing || this.description,
      requiredTeamSize: this.requiredTeamSize,
      estimatedDuration: this.estimatedDuration,
      reward: this.reward
    };
  }
  
  /**
   * Get mission status
   */
  getStatus() {
    return {
      id: this.id,
      codename: this.codename,
      rank: this.rank.name,
      status: this.status,
      progress: this.progress,
      team: this.assignedTeam.map(s => s.name),
      leader: this.leader?.name,
      started: this.started,
      duration: this.started ? Date.now() - this.started : 0,
      phi: this.phi
    };
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      codename: this.codename,
      rank: this.rank,
      type: this.type,
      status: this.status,
      progress: this.progress,
      results: this.results,
      created: this.created,
      completed: this.completed
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION TEMPLATES
// ═══════════════════════════════════════════════════════════════════════════════

export const MissionTemplates = {
  // D-RANK MISSIONS
  BASIC_RECON: {
    name: 'Basic Reconnaissance',
    rank: MISSION_RANKS.D,
    type: MISSION_TYPES.RECONNAISSANCE,
    description: 'Perform basic reconnaissance on target',
    objectives: [
      { name: 'Identify target', description: 'Confirm target accessibility' },
      { name: 'Basic scan', description: 'Perform basic port scan' },
      { name: 'Report findings', description: 'Compile and report findings' }
    ],
    requiredTeamSize: 1,
    estimatedDuration: 1800000 // 30 minutes
  },
  
  NETWORK_MAPPING: {
    name: 'Network Mapping',
    rank: MISSION_RANKS.D,
    type: MISSION_TYPES.RECONNAISSANCE,
    description: 'Map the target network topology',
    objectives: [
      { name: 'Discover hosts', description: 'Find all accessible hosts' },
      { name: 'Identify services', description: 'Enumerate running services' },
      { name: 'Create map', description: 'Generate network diagram' }
    ],
    requiredTeamSize: 2,
    estimatedDuration: 3600000 // 1 hour
  },
  
  // C-RANK MISSIONS
  VULNERABILITY_SCAN: {
    name: 'Vulnerability Assessment',
    rank: MISSION_RANKS.C,
    type: MISSION_TYPES.RECONNAISSANCE,
    description: 'Identify vulnerabilities in target system',
    objectives: [
      { name: 'Port scan', description: 'Complete port enumeration' },
      { name: 'Service detection', description: 'Identify service versions' },
      { name: 'Vulnerability scan', description: 'Run vulnerability scanner' },
      { name: 'Prioritize findings', description: 'Rank vulnerabilities by severity' }
    ],
    requiredTeamSize: 2,
    estimatedDuration: 7200000 // 2 hours
  },
  
  WEB_ASSESSMENT: {
    name: 'Web Application Assessment',
    rank: MISSION_RANKS.C,
    type: MISSION_TYPES.RECONNAISSANCE,
    description: 'Assess web application security',
    objectives: [
      { name: 'Spider application', description: 'Map all endpoints' },
      { name: 'Input testing', description: 'Test input validation' },
      { name: 'Auth testing', description: 'Test authentication mechanisms' },
      { name: 'Session testing', description: 'Analyze session management' }
    ],
    requiredTeamSize: 2,
    estimatedDuration: 10800000 // 3 hours
  },
  
  // B-RANK MISSIONS
  CREDENTIAL_ATTACK: {
    name: 'Credential Attack Simulation',
    rank: MISSION_RANKS.B,
    type: MISSION_TYPES.ASSAULT,
    description: 'Test credential security through various attacks',
    objectives: [
      { name: 'Password spray', description: 'Attempt common passwords' },
      { name: 'Credential stuffing', description: 'Test leaked credentials' },
      { name: 'Brute force', description: 'Attempt brute force on weak targets' },
      { name: 'Document findings', description: 'Report compromised accounts' }
    ],
    requiredTeamSize: 3,
    estimatedDuration: 14400000 // 4 hours
  },
  
  PHISHING_SIM: {
    name: 'Phishing Simulation',
    rank: MISSION_RANKS.B,
    type: MISSION_TYPES.INFILTRATION,
    description: 'Test employee phishing awareness',
    objectives: [
      { name: 'Create payload', description: 'Design phishing campaign' },
      { name: 'Deploy campaign', description: 'Send phishing emails' },
      { name: 'Track results', description: 'Monitor click rates' },
      { name: 'Credential harvest', description: 'Capture submitted credentials' }
    ],
    requiredTeamSize: 2,
    estimatedDuration: 86400000 // 24 hours
  },
  
  // A-RANK MISSIONS
  APT_SIMULATION: {
    name: 'APT Simulation',
    rank: MISSION_RANKS.A,
    type: MISSION_TYPES.INFILTRATION,
    description: 'Simulate advanced persistent threat',
    objectives: [
      { name: 'Initial access', description: 'Gain initial foothold' },
      { name: 'Persistence', description: 'Establish persistence mechanisms' },
      { name: 'Lateral movement', description: 'Move to additional systems' },
      { name: 'Privilege escalation', description: 'Obtain admin rights' },
      { name: 'Data staging', description: 'Identify and stage data' },
      { name: 'C2 setup', description: 'Establish command and control' }
    ],
    requiredTeamSize: 4,
    estimatedDuration: 604800000 // 7 days
  },
  
  // S-RANK MISSIONS
  FULL_BREACH_SIM: {
    name: 'Full Breach Simulation',
    rank: MISSION_RANKS.S,
    type: MISSION_TYPES.ASSAULT,
    description: 'Complete breach simulation from entry to exfil',
    objectives: [
      { name: 'Reconnaissance', description: 'Full target reconnaissance' },
      { name: 'Initial compromise', description: 'Achieve initial access' },
      { name: 'Persistence', description: 'Establish multiple backdoors' },
      { name: 'Privilege escalation', description: 'Obtain domain admin' },
      { name: 'Lateral movement', description: 'Compromise critical systems' },
      { name: 'Data exfiltration', description: 'Extract sensitive data' },
      { name: 'Cover tracks', description: 'Clean up evidence' }
    ],
    requiredTeamSize: 6,
    estimatedDuration: 2592000000 // 30 days
  },
  
  ASSASSINATION: {
    name: 'System Assassination',
    rank: MISSION_RANKS.S,
    type: MISSION_TYPES.ASSASSINATION,
    description: 'Take down critical target system',
    objectives: [
      { name: 'Identify target', description: 'Locate critical system' },
      { name: 'Bypass defenses', description: 'Evade security controls' },
      { name: 'Execute attack', description: 'Disable target system' },
      { name: 'Verify kill', description: 'Confirm system down' },
      { name: 'Exfiltrate', description: 'Exit undetected' }
    ],
    requiredTeamSize: 3,
    estimatedDuration: 86400000 // 24 hours
  }
};

// ═══════════════════════════════════════════════════════════════════════════════
// MISSION FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create mission from template
 */
export function createMission(templateName, config = {}) {
  const template = MissionTemplates[templateName];
  if (!template) {
    throw new Error(`Unknown mission template: ${templateName}`);
  }
  
  return new Mission({
    ...template,
    ...config,
    objectives: template.objectives.map(o => ({ ...o, completed: false }))
  });
}

/**
 * Create custom mission
 */
export function createCustomMission(config) {
  return new Mission(config);
}

export default Mission;

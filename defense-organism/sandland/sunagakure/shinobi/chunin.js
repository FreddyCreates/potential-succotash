/**
 * Chunin - Mid-Level Shinobi AI Agent
 * 
 * Promoted from Genin after proving leadership and tactical ability.
 * Chunin can lead Genin teams and execute more complex operations.
 * 
 * Capabilities:
 * - Advanced scanning techniques
 * - Team coordination
 * - Tactical decision making
 * - More powerful jutsu
 * 
 * @module sandland/sunagakure/shinobi/chunin
 */

import { Shinobi, SHINOBI_STATES } from './base-shinobi.js';

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Chunin - Mid-Level Shinobi AI
 */
export class Chunin extends Shinobi {
  constructor(config = {}) {
    super({
      ...config,
      rank: { name: 'Chunin', kanji: '中忍', chakra: 150, rank: 2 }
    });
    
    // Chunin stats (higher caps)
    this.ninjutsu = Math.min(config.ninjutsu || 40, 70);
    this.taijutsu = Math.min(config.taijutsu || 40, 70);
    this.genjutsu = Math.min(config.genjutsu || 35, 65);
    this.intelligence = Math.min(config.intelligence || 45, 75);
    this.speed = Math.min(config.speed || 40, 70);
    
    // Chunin can hold 7 jutsu
    this.maxJutsu = 7;
    
    // Team management
    this.team = [];
    this.maxTeamSize = 4;
    
    // Initialize jutsu
    this.initializeChununJutsu();
  }
  
  /**
   * Initialize Chunin-level jutsu
   */
  initializeChununJutsu() {
    // Shadow clone (more advanced)
    this.learnJutsu({
      name: 'Shadow Clone Jutsu',
      kanji: '影分身の術',
      type: 'ninjutsu',
      chakraCost: 20,
      baseDamage: 0,
      description: 'Create solid clones that can attack',
      effects: ['solid_clone', 'multi_attack', 'information_gather']
    });
    
    // Wind release: Air bullets
    this.learnJutsu({
      name: 'Wind Release: Air Bullets',
      kanji: '風遁・空気弾',
      type: 'ninjutsu',
      chakraCost: 15,
      baseDamage: 25,
      requiredNature: 'WIND',
      description: 'Shoot compressed air projectiles',
      effects: ['ranged', 'knockback']
    });
    
    // Earth release: Mud wall
    this.learnJutsu({
      name: 'Earth Release: Mud Wall',
      kanji: '土遁・土流壁',
      type: 'ninjutsu',
      chakraCost: 20,
      baseDamage: 0,
      requiredNature: 'EARTH',
      description: 'Create a defensive wall',
      effects: ['defense', 'block']
    });
    
    // Fire release: Fireball
    this.learnJutsu({
      name: 'Fire Release: Fireball',
      kanji: '火遁・火球の術',
      type: 'ninjutsu',
      chakraCost: 25,
      baseDamage: 40,
      requiredNature: 'FIRE',
      description: 'Shoot a large fireball',
      effects: ['area_damage', 'burn']
    });
  }
  
  /**
   * Add Genin to team
   */
  addToTeam(genin) {
    if (this.team.length >= this.maxTeamSize) {
      return { success: false, reason: 'Team is full' };
    }
    
    if (genin.rank?.name !== 'Genin') {
      return { success: false, reason: 'Can only lead Genin' };
    }
    
    this.team.push(genin);
    
    return { success: true, teamSize: this.team.length };
  }
  
  /**
   * Remove from team
   */
  removeFromTeam(geninId) {
    const idx = this.team.findIndex(g => g.id === geninId);
    if (idx >= 0) {
      this.team.splice(idx, 1);
      return { success: true };
    }
    return { success: false, reason: 'Not in team' };
  }
  
  /**
   * Lead team mission
   */
  async leadTeamMission(mission, target) {
    if (this.state !== SHINOBI_STATES.READY) {
      return { success: false, reason: `Cannot lead mission while ${this.state}` };
    }
    
    this.state = SHINOBI_STATES.ON_MISSION;
    
    // Assign mission to team
    const teamResults = [];
    for (const genin of this.team) {
      genin.assignMission(mission);
    }
    
    // Phase 1: Reconnaissance
    console.log(`[${this.name}] Leading reconnaissance phase...`);
    
    const reconResults = [];
    for (const genin of this.team) {
      if (genin.reconMission) {
        const result = await genin.reconMission(target);
        reconResults.push(result);
      }
    }
    
    // Phase 2: Coordinated attack
    console.log(`[${this.name}] Coordinating attack...`);
    
    // Chunin uses Shadow Clone for info gathering
    const cloneResult = this.useJutsu('Shadow Clone Jutsu');
    
    // Main attack
    const attackResult = await this.executeAttack(target, 1);
    
    // Team support
    for (const genin of this.team) {
      if (genin.supportAttack) {
        const support = await genin.supportAttack(this, target);
        teamResults.push(support);
      }
      genin.completeMission(true);
    }
    
    this.state = SHINOBI_STATES.READY;
    this.stats.missionsCompleted++;
    
    return {
      success: true,
      leader: this.name,
      mission: mission?.name || 'Team Mission',
      phases: {
        reconnaissance: reconResults,
        attack: attackResult,
        support: teamResults
      },
      totalDamage: attackResult.totalDamage + 
        teamResults.reduce((sum, r) => sum + (r.attack?.totalDamage || 0), 0)
    };
  }
  
  /**
   * Tactical analysis
   */
  analyzeThreat(target) {
    // Chunin can analyze threats
    const analysis = {
      analyst: this.name,
      target,
      timestamp: Date.now(),
      assessment: {}
    };
    
    // Use intelligence stat for analysis quality
    const accuracyBonus = this.intelligence / 100;
    
    // Simulated analysis
    analysis.assessment = {
      threatLevel: Math.random() * (1 + accuracyBonus),
      vulnerabilities: Math.floor(Math.random() * 5 * (1 + accuracyBonus)),
      recommendedApproach: this.intelligence > 50 ? 'stealth' : 'direct',
      estimatedTeamSize: Math.ceil(analysis.assessment?.threatLevel * 3) || 3,
      confidence: 0.5 + accuracyBonus * 0.4
    };
    
    return analysis;
  }
  
  /**
   * Vulnerability scan (more advanced than Genin)
   */
  async vulnerabilityScan(target) {
    if (this.state !== SHINOBI_STATES.READY) {
      return { success: false, reason: `Cannot scan while ${this.state}` };
    }
    
    this.state = SHINOBI_STATES.ON_MISSION;
    
    const scanResults = {
      scanner: this.name,
      target,
      timestamp: Date.now(),
      vulnerabilities: []
    };
    
    // Common vulnerability checks
    const vulnChecks = [
      { name: 'SQL Injection', cost: 5, severity: 'high' },
      { name: 'XSS', cost: 5, severity: 'medium' },
      { name: 'CSRF', cost: 3, severity: 'medium' },
      { name: 'Directory Traversal', cost: 4, severity: 'high' },
      { name: 'Command Injection', cost: 6, severity: 'critical' },
      { name: 'Authentication Bypass', cost: 8, severity: 'critical' },
      { name: 'Information Disclosure', cost: 3, severity: 'low' },
      { name: 'Insecure Deserialization', cost: 7, severity: 'high' }
    ];
    
    for (const check of vulnChecks) {
      if (this.chakra >= check.cost) {
        this.chakra -= check.cost;
        
        // Intelligence affects detection rate
        const detectChance = 0.3 + (this.intelligence / 200);
        
        if (Math.random() < detectChance) {
          scanResults.vulnerabilities.push({
            type: check.name,
            severity: check.severity,
            confidence: 0.5 + Math.random() * 0.4,
            details: `Potential ${check.name} vulnerability detected`
          });
        }
      }
    }
    
    this.state = SHINOBI_STATES.READY;
    this.stats.missionsCompleted++;
    
    return {
      success: true,
      ...scanResults
    };
  }
  
  /**
   * Get Chunin-specific status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      maxJutsu: this.maxJutsu,
      teamSize: this.team.length,
      maxTeamSize: this.maxTeamSize,
      teamMembers: this.team.map(g => ({ id: g.id, name: g.name })),
      canPromote: this.stats.missionsCompleted >= 30
    };
  }
}

export default Chunin;

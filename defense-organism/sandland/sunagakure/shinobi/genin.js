/**
 * Genin - Academy Graduate AI Agent
 * 
 * The lowest rank of official shinobi. Fresh from the academy,
 * these AI agents handle basic reconnaissance and simple attacks.
 * 
 * Capabilities:
 * - Basic scanning
 * - Simple probes
 * - Information gathering
 * - Support for higher ranks
 * 
 * @module sandland/sunagakure/shinobi/genin
 */

import { Shinobi, SHINOBI_STATES } from './base-shinobi.js';

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Genin - Entry Level Shinobi AI
 */
export class Genin extends Shinobi {
  constructor(config = {}) {
    super({
      ...config,
      rank: { name: 'Genin', kanji: '下忍', chakra: 50, rank: 1 }
    });
    
    // Genin-specific stats (lower caps)
    this.ninjutsu = Math.min(config.ninjutsu || 20, 40);
    this.taijutsu = Math.min(config.taijutsu || 25, 45);
    this.genjutsu = Math.min(config.genjutsu || 15, 35);
    this.intelligence = Math.min(config.intelligence || 20, 40);
    this.speed = Math.min(config.speed || 25, 45);
    
    // Genin can only hold 3 jutsu
    this.maxJutsu = 3;
    
    // Default jutsu
    this.initializeDefaultJutsu();
  }
  
  /**
   * Initialize basic jutsu
   */
  initializeDefaultJutsu() {
    // Basic clone technique
    this.learnJutsu({
      name: 'Clone Jutsu',
      kanji: '分身の術',
      type: 'ninjutsu',
      chakraCost: 5,
      baseDamage: 0,
      description: 'Create illusory clones for distraction',
      effects: ['distraction', 'evasion_boost']
    });
    
    // Basic transformation
    this.learnJutsu({
      name: 'Transformation Jutsu',
      kanji: '変化の術',
      type: 'ninjutsu',
      chakraCost: 5,
      baseDamage: 0,
      description: 'Transform into another person or object',
      effects: ['disguise', 'infiltration']
    });
    
    // Substitution
    this.learnJutsu({
      name: 'Substitution Jutsu',
      kanji: '変わり身の術',
      type: 'ninjutsu',
      chakraCost: 8,
      baseDamage: 0,
      description: 'Replace self with log or object when hit',
      effects: ['evasion', 'counter_position']
    });
  }
  
  /**
   * Override learn jutsu with limit
   */
  learnJutsu(jutsu) {
    if (this.jutsu.size >= this.maxJutsu) {
      return { success: false, reason: 'Genin can only learn 3 jutsu' };
    }
    return super.learnJutsu(jutsu);
  }
  
  /**
   * Genin reconnaissance mission
   */
  async reconMission(target) {
    if (this.state !== SHINOBI_STATES.READY) {
      return { success: false, reason: `Cannot start mission while ${this.state}` };
    }
    
    this.state = SHINOBI_STATES.ON_MISSION;
    
    // Genin recon is basic
    const scanResults = {
      target,
      timestamp: Date.now(),
      shinobi: this.name,
      rank: 'Genin',
      findings: []
    };
    
    // Basic port scan simulation
    const commonPorts = [21, 22, 23, 25, 53, 80, 110, 143, 443, 3306, 5432];
    
    for (const port of commonPorts) {
      // Spend small chakra for each probe
      if (this.chakra >= 1) {
        this.chakra -= 1;
        
        // Simulate finding (random for demo)
        if (Math.random() > 0.7) {
          scanResults.findings.push({
            type: 'open_port',
            port,
            confidence: Math.random() * 0.5 + 0.3 // 30-80% confidence
          });
        }
      }
      
      // Small delay between probes
      await this.delay(HB / 10);
    }
    
    this.state = SHINOBI_STATES.READY;
    this.stats.missionsCompleted++;
    
    return {
      success: true,
      ...scanResults
    };
  }
  
  /**
   * Genin support attack
   */
  async supportAttack(leader, target) {
    if (this.state !== SHINOBI_STATES.READY) {
      return { success: false, reason: `Cannot support while ${this.state}` };
    }
    
    // Genin provides distraction
    const cloneResult = this.useJutsu('Clone Jutsu', target);
    
    // Wait for leader's signal
    await this.delay(HB);
    
    // Follow up with basic attack
    const attackResult = await this.executeAttack(target, 0.5); // Half intensity
    
    this.stats.assists++;
    
    return {
      success: true,
      type: 'support_attack',
      leader: leader.name,
      distraction: cloneResult,
      attack: attackResult
    };
  }
  
  /**
   * Helper delay function
   */
  delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
  
  /**
   * Get Genin-specific status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      maxJutsu: this.maxJutsu,
      jutsuSlotsFree: this.maxJutsu - this.jutsu.size,
      canPromote: this.stats.missionsCompleted >= 10
    };
  }
}

export default Genin;

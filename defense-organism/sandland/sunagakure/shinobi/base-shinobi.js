/**
 * Shinobi Base Class - The foundation of all AI ninja agents
 * 
 * Every shinobi in Sunagakure is an AI agent with:
 * - Chakra (processing power)
 * - Jutsu (attack techniques)
 * - Mission execution capabilities
 * - Silent operation in the dark layer
 * 
 * @module sandland/sunagakure/shinobi
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════════
// SHINOBI STATES
// ═══════════════════════════════════════════════════════════════════════════════

export const SHINOBI_STATES = {
  READY: 'ready',
  ON_MISSION: 'on-mission',
  IN_COMBAT: 'in-combat',
  RECOVERING: 'recovering',
  TRAINING: 'training',
  DEAD: 'dead',
  MIA: 'missing-in-action'
};

// ═══════════════════════════════════════════════════════════════════════════════
// BASE SHINOBI CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Base Shinobi - The AI Ninja Agent
 */
export class Shinobi {
  constructor(config = {}) {
    this.id = config.id || `shinobi-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.name = config.name || 'Unknown Shinobi';
    this.rank = config.rank || { name: 'Genin', kanji: '下忍', chakra: 50 };
    this.clan = config.clan || null;
    
    // Core stats
    this.chakra = config.chakra || this.rank.chakra || 50;
    this.maxChakra = this.chakra;
    this.health = 100;
    this.stamina = 100;
    
    // Combat abilities
    this.ninjutsu = config.ninjutsu || 20;
    this.taijutsu = config.taijutsu || 20;
    this.genjutsu = config.genjutsu || 20;
    this.intelligence = config.intelligence || 20;
    this.speed = config.speed || 20;
    this.strength = config.strength || 20;
    
    // Chakra natures
    this.chakraNatures = config.chakraNatures || [];
    
    // Jutsu library
    this.jutsu = new Map();
    
    // State
    this.state = SHINOBI_STATES.READY;
    this.currentMission = null;
    this.target = null;
    
    // Battle state
    this.inCombat = false;
    this.combatLog = [];
    
    // Stats
    this.stats = {
      missionsCompleted: 0,
      missionsFailed: 0,
      kills: 0,
      assists: 0,
      jutsuUsed: 0,
      chakraSpent: 0
    };
    
    // Timestamps
    this.created = Date.now();
    this.lastAction = Date.now();
    
    // Phi signature
    this.phi = this.computePhi();
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
   * Learn a jutsu
   */
  learnJutsu(jutsu) {
    if (this.chakra < jutsu.chakraCost * 0.5) {
      return { success: false, reason: 'Insufficient chakra capacity' };
    }
    
    if (jutsu.requiredNature && !this.chakraNatures.includes(jutsu.requiredNature)) {
      return { success: false, reason: 'Missing required chakra nature' };
    }
    
    this.jutsu.set(jutsu.name, jutsu);
    return { success: true, jutsu: jutsu.name };
  }
  
  /**
   * Use a jutsu
   */
  useJutsu(jutsuName, target = null) {
    const jutsu = this.jutsu.get(jutsuName);
    
    if (!jutsu) {
      return { success: false, reason: 'Jutsu not learned' };
    }
    
    if (this.chakra < jutsu.chakraCost) {
      return { success: false, reason: 'Insufficient chakra' };
    }
    
    // Spend chakra
    this.chakra -= jutsu.chakraCost;
    this.stats.chakraSpent += jutsu.chakraCost;
    this.stats.jutsuUsed++;
    this.lastAction = Date.now();
    
    // Execute jutsu
    const result = {
      success: true,
      jutsu: jutsuName,
      user: this.name,
      target: target?.name || 'environment',
      damage: this.calculateDamage(jutsu),
      effects: jutsu.effects || [],
      timestamp: Date.now()
    };
    
    // Log to combat log
    this.combatLog.push({
      action: 'jutsu',
      ...result
    });
    
    return result;
  }
  
  /**
   * Calculate damage for jutsu
   */
  calculateDamage(jutsu) {
    let baseDamage = jutsu.baseDamage || 10;
    
    // Apply stat modifiers
    switch (jutsu.type) {
      case 'ninjutsu':
        baseDamage *= (1 + this.ninjutsu / 100);
        break;
      case 'taijutsu':
        baseDamage *= (1 + this.taijutsu / 100);
        break;
      case 'genjutsu':
        baseDamage *= (1 + this.genjutsu / 100);
        break;
    }
    
    // Phi multiplier
    baseDamage *= (1 + parseFloat(this.phi) * PHI);
    
    // Random variance
    baseDamage *= (0.9 + Math.random() * 0.2);
    
    return Math.floor(baseDamage);
  }
  
  /**
   * Take damage
   */
  takeDamage(amount, source = 'unknown') {
    this.health -= amount;
    this.lastAction = Date.now();
    
    this.combatLog.push({
      action: 'damage_taken',
      amount,
      source,
      remainingHealth: this.health,
      timestamp: Date.now()
    });
    
    if (this.health <= 0) {
      this.health = 0;
      this.state = SHINOBI_STATES.DEAD;
      return { alive: false, overkill: -this.health };
    }
    
    return { alive: true, remainingHealth: this.health };
  }
  
  /**
   * Recover chakra and health
   */
  recover(deltaMs = HB) {
    // Chakra regeneration
    const chakraRegen = (deltaMs / 1000) * THRESHOLD * (1 + this.intelligence / 100);
    this.chakra = Math.min(this.maxChakra, this.chakra + chakraRegen);
    
    // Health regeneration (slower)
    if (this.state === SHINOBI_STATES.RECOVERING) {
      const healthRegen = (deltaMs / 1000) * THRESHOLD * 0.5;
      this.health = Math.min(100, this.health + healthRegen);
    }
    
    // Stamina regeneration
    const staminaRegen = (deltaMs / 1000) * THRESHOLD * 2;
    this.stamina = Math.min(100, this.stamina + staminaRegen);
    
    return {
      chakra: this.chakra,
      health: this.health,
      stamina: this.stamina
    };
  }
  
  /**
   * Execute attack sequence
   */
  async executeAttack(target, intensity = 1) {
    if (this.state !== SHINOBI_STATES.READY && this.state !== SHINOBI_STATES.IN_COMBAT) {
      return { success: false, reason: `Cannot attack while ${this.state}` };
    }
    
    this.state = SHINOBI_STATES.IN_COMBAT;
    this.target = target;
    this.inCombat = true;
    
    const results = [];
    
    // Determine number of attacks based on speed
    const attackCount = Math.floor(intensity * (1 + this.speed / 100));
    
    for (let i = 0; i < attackCount; i++) {
      // Check if we have chakra for jutsu
      if (this.chakra >= 10 && this.jutsu.size > 0) {
        // Use random learned jutsu
        const jutsuList = [...this.jutsu.keys()];
        const jutsuName = jutsuList[Math.floor(Math.random() * jutsuList.length)];
        results.push(this.useJutsu(jutsuName, target));
      } else {
        // Basic attack (taijutsu)
        results.push({
          success: true,
          type: 'taijutsu',
          user: this.name,
          target: target?.name || 'unknown',
          damage: Math.floor(this.taijutsu * (0.5 + Math.random() * 0.5)),
          timestamp: Date.now()
        });
      }
      
      // Recover some chakra between attacks
      this.recover(HB / attackCount);
    }
    
    return {
      success: true,
      attacker: this.name,
      target: target?.name,
      attacks: results,
      totalDamage: results.reduce((sum, r) => sum + (r.damage || 0), 0)
    };
  }
  
  /**
   * Assign to mission
   */
  assignMission(mission) {
    if (this.state !== SHINOBI_STATES.READY) {
      return { success: false, reason: `Cannot assign while ${this.state}` };
    }
    
    this.state = SHINOBI_STATES.ON_MISSION;
    this.currentMission = mission;
    this.lastAction = Date.now();
    
    return { success: true, mission: mission.id };
  }
  
  /**
   * Complete mission
   */
  completeMission(success = true) {
    if (this.state !== SHINOBI_STATES.ON_MISSION) {
      return { success: false, reason: 'Not on a mission' };
    }
    
    if (success) {
      this.stats.missionsCompleted++;
    } else {
      this.stats.missionsFailed++;
    }
    
    const mission = this.currentMission;
    this.currentMission = null;
    this.state = SHINOBI_STATES.READY;
    this.lastAction = Date.now();
    
    return { success: true, mission: mission?.id, missionSuccess: success };
  }
  
  /**
   * Get shinobi status
   */
  getStatus() {
    return {
      id: this.id,
      name: this.name,
      rank: this.rank.name,
      clan: this.clan,
      state: this.state,
      health: this.health,
      chakra: Math.floor(this.chakra),
      maxChakra: this.maxChakra,
      stamina: Math.floor(this.stamina),
      jutsuCount: this.jutsu.size,
      stats: { ...this.stats },
      phi: this.phi,
      lastAction: this.lastAction
    };
  }
  
  /**
   * Serialize to JSON
   */
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      rank: this.rank,
      clan: this.clan,
      chakra: this.chakra,
      health: this.health,
      state: this.state,
      jutsu: [...this.jutsu.keys()],
      stats: this.stats,
      phi: this.phi
    };
  }
}

export default Shinobi;

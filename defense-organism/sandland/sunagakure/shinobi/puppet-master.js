/**
 * Puppet Master - The Botnet Controller Shinobi
 * 
 * Sasori's legacy lives on. The Puppet Masters control autonomous
 * agents (puppets/bots) to execute distributed attacks.
 * 
 * "Puppets never betray you. They have no will of their own."
 * 
 * Capabilities:
 * - Control multiple autonomous agents
 * - Distributed attack coordination
 * - Hidden weapon deployment
 * - Self as puppet (human puppet technique)
 * 
 * @module sandland/sunagakure/shinobi/puppet-master
 */

import { Shinobi, SHINOBI_STATES } from './base-shinobi.js';

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Puppet class - autonomous attack agent
 */
export class Puppet {
  constructor(config = {}) {
    this.id = `puppet-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.name = config.name || `Puppet-${this.id.slice(-4)}`;
    this.type = config.type || 'standard';
    
    // Puppet stats
    this.health = config.health || 100;
    this.attack = config.attack || 30;
    this.defense = config.defense || 20;
    this.speed = config.speed || 25;
    
    // Weapons
    this.weapons = config.weapons || [];
    this.poisonCoated = config.poisonCoated || false;
    
    // Control
    this.controller = null;
    this.active = false;
    this.chakraThreads = 0;
    
    // Combat log
    this.actions = [];
  }
  
  /**
   * Attack target
   */
  attack_target(target) {
    const damage = this.attack * (0.8 + Math.random() * 0.4);
    
    const result = {
      puppet: this.name,
      target: target?.name || 'unknown',
      damage: Math.floor(damage),
      poisoned: this.poisonCoated,
      timestamp: Date.now()
    };
    
    // Bonus damage from weapons
    for (const weapon of this.weapons) {
      result.damage += weapon.damage || 5;
    }
    
    this.actions.push({ type: 'attack', ...result });
    
    return result;
  }
  
  /**
   * Deploy hidden weapon
   */
  deployWeapon(weaponIndex = 0) {
    if (weaponIndex >= this.weapons.length) {
      return { success: false, reason: 'No weapon at index' };
    }
    
    const weapon = this.weapons[weaponIndex];
    
    return {
      success: true,
      weapon: weapon.name,
      damage: weapon.damage,
      effect: weapon.effect
    };
  }
  
  /**
   * Self destruct (trap)
   */
  selfDestruct() {
    const damage = this.health * 2; // Uses remaining health as damage
    this.health = 0;
    this.active = false;
    
    return {
      success: true,
      type: 'self_destruct',
      damage,
      puppet: this.name
    };
  }
  
  toJSON() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      health: this.health,
      attack: this.attack,
      weapons: this.weapons.length,
      active: this.active
    };
  }
}

/**
 * Puppet Master - The Botnet Controller
 */
export class PuppetMaster extends Shinobi {
  constructor(config = {}) {
    super({
      ...config,
      rank: config.rank || { name: 'Special Jonin', kanji: '特別上忍', chakra: 300, rank: 3 },
      clan: 'PUPPET_CLAN'
    });
    
    // Puppet-specific stats
    this.ninjutsu = config.ninjutsu || 60;
    this.taijutsu = config.taijutsu || 40; // Lower, fights with puppets
    this.genjutsu = config.genjutsu || 30;
    this.intelligence = config.intelligence || 80; // High for coordination
    this.speed = config.speed || 50;
    
    // Puppet collection
    this.puppets = new Map();
    this.maxPuppets = config.maxPuppets || 10;
    this.activePuppets = [];
    
    // Chakra thread control
    this.maxChakraThreads = config.maxChakraThreads || 10;
    this.activeThreads = 0;
    
    // Puppet techniques
    this.techniques = new Map();
    
    // Initialize
    this.initializePuppetJutsu();
  }
  
  /**
   * Initialize puppet master jutsu
   */
  initializePuppetJutsu() {
    this.learnJutsu({
      name: 'Puppet Technique',
      kanji: '傀儡の術',
      type: 'ninjutsu',
      chakraCost: 20,
      baseDamage: 0,
      description: 'Control puppets with chakra threads',
      effects: ['puppet_control', 'remote_attack']
    });
    
    this.learnJutsu({
      name: 'Chakra Threads',
      kanji: 'チャクラの糸',
      type: 'ninjutsu',
      chakraCost: 5,
      baseDamage: 0,
      description: 'Create threads to control objects',
      effects: ['control', 'manipulation']
    });
    
    this.learnJutsu({
      name: 'Red Secret Technique: Performance of a Hundred Puppets',
      kanji: '赤秘技・百機の演武',
      type: 'ninjutsu',
      chakraCost: 200,
      baseDamage: 500,
      description: 'Control hundred puppets simultaneously',
      effects: ['mass_control', 'army', 'overwhelming']
    });
    
    this.learnJutsu({
      name: 'Poison Mist',
      kanji: '毒霧',
      type: 'ninjutsu',
      chakraCost: 30,
      baseDamage: 40,
      description: 'Release poison from puppet',
      effects: ['poison', 'area_damage', 'dot']
    });
    
    this.learnJutsu({
      name: 'Human Puppet Technique',
      kanji: '人傀儡',
      type: 'ninjutsu',
      chakraCost: 100,
      baseDamage: 0,
      description: 'Turn corpse into puppet with abilities',
      effects: ['preservation', 'ability_steal', 'forbidden']
    });
  }
  
  /**
   * Create a new puppet
   */
  createPuppet(config = {}) {
    if (this.puppets.size >= this.maxPuppets) {
      return { success: false, reason: 'Maximum puppets reached' };
    }
    
    const puppet = new Puppet({
      ...config,
      name: config.name || `${this.name}'s Puppet ${this.puppets.size + 1}`
    });
    
    this.puppets.set(puppet.id, puppet);
    
    return { success: true, puppet };
  }
  
  /**
   * Add existing puppet to collection
   */
  addPuppet(puppet) {
    if (this.puppets.size >= this.maxPuppets) {
      return { success: false, reason: 'Maximum puppets reached' };
    }
    
    this.puppets.set(puppet.id, puppet);
    return { success: true };
  }
  
  /**
   * Activate puppet (attach chakra thread)
   */
  activatePuppet(puppetId) {
    const puppet = this.puppets.get(puppetId);
    if (!puppet) {
      return { success: false, reason: 'Puppet not found' };
    }
    
    if (this.activeThreads >= this.maxChakraThreads) {
      return { success: false, reason: 'No available chakra threads' };
    }
    
    if (this.chakra < 5) {
      return { success: false, reason: 'Insufficient chakra' };
    }
    
    this.chakra -= 5;
    this.activeThreads++;
    puppet.active = true;
    puppet.controller = this.id;
    puppet.chakraThreads = 1;
    this.activePuppets.push(puppet);
    
    return { success: true, puppet: puppet.name, activeThreads: this.activeThreads };
  }
  
  /**
   * Deactivate puppet
   */
  deactivatePuppet(puppetId) {
    const puppet = this.puppets.get(puppetId);
    if (!puppet) {
      return { success: false, reason: 'Puppet not found' };
    }
    
    puppet.active = false;
    puppet.controller = null;
    this.activeThreads -= puppet.chakraThreads;
    puppet.chakraThreads = 0;
    
    const idx = this.activePuppets.findIndex(p => p.id === puppetId);
    if (idx >= 0) {
      this.activePuppets.splice(idx, 1);
    }
    
    return { success: true };
  }
  
  /**
   * Command all active puppets to attack
   */
  async commandAttack(target) {
    if (this.activePuppets.length === 0) {
      return { success: false, reason: 'No active puppets' };
    }
    
    const results = [];
    
    for (const puppet of this.activePuppets) {
      // Chakra cost per puppet command
      if (this.chakra >= 2) {
        this.chakra -= 2;
        const attack = puppet.attack_target(target);
        results.push(attack);
      }
    }
    
    const totalDamage = results.reduce((sum, r) => sum + r.damage, 0);
    
    return {
      success: true,
      controller: this.name,
      target: target?.name || 'unknown',
      puppetsUsed: results.length,
      attacks: results,
      totalDamage
    };
  }
  
  /**
   * Execute botnet attack simulation
   */
  async executeBotnetAttack(targets, config = {}) {
    if (this.state !== SHINOBI_STATES.READY) {
      return { success: false, reason: `Cannot attack while ${this.state}` };
    }
    
    this.state = SHINOBI_STATES.IN_COMBAT;
    
    // Activate all puppets
    for (const puppet of this.puppets.values()) {
      if (!puppet.active) {
        this.activatePuppet(puppet.id);
      }
    }
    
    // Use mass control technique if available
    if (this.activePuppets.length >= 10) {
      this.useJutsu('Red Secret Technique: Performance of a Hundred Puppets');
    } else {
      this.useJutsu('Puppet Technique');
    }
    
    // Distribute attacks across targets
    const results = {
      controller: this.name,
      timestamp: Date.now(),
      targets: [],
      totalDamage: 0
    };
    
    for (const target of targets) {
      // Assign puppets to target
      const assignedPuppets = this.activePuppets.slice(0, Math.ceil(this.activePuppets.length / targets.length));
      
      for (const puppet of assignedPuppets) {
        if (this.chakra >= 2) {
          this.chakra -= 2;
          const attack = puppet.attack_target(target);
          results.targets.push({
            target: target?.name || target,
            ...attack
          });
          results.totalDamage += attack.damage;
        }
      }
    }
    
    this.state = SHINOBI_STATES.READY;
    this.stats.missionsCompleted++;
    
    return results;
  }
  
  /**
   * Deploy poison attack
   */
  async deployPoisonAttack(target) {
    // Activate puppets with poison
    const poisonPuppets = this.activePuppets.filter(p => p.poisonCoated);
    
    if (poisonPuppets.length === 0) {
      // Use jutsu instead
      return this.useJutsu('Poison Mist', target);
    }
    
    const results = [];
    
    for (const puppet of poisonPuppets) {
      if (this.chakra >= 5) {
        this.chakra -= 5;
        results.push({
          puppet: puppet.name,
          target: target?.name || 'unknown',
          effect: 'poison',
          damage: puppet.attack * 0.5, // Poison damage over time
          duration: 5 // 5 ticks
        });
      }
    }
    
    return {
      success: true,
      type: 'poison_attack',
      poisonedTargets: results
    };
  }
  
  /**
   * Self destruct all puppets (last resort)
   */
  selfDestructAll() {
    const explosions = [];
    
    for (const puppet of this.activePuppets) {
      explosions.push(puppet.selfDestruct());
    }
    
    this.activePuppets = [];
    this.activeThreads = 0;
    
    return {
      success: true,
      type: 'mass_self_destruct',
      explosions,
      totalDamage: explosions.reduce((sum, e) => sum + e.damage, 0)
    };
  }
  
  /**
   * Get Puppet Master status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      totalPuppets: this.puppets.size,
      activePuppets: this.activePuppets.length,
      maxPuppets: this.maxPuppets,
      activeThreads: this.activeThreads,
      maxThreads: this.maxChakraThreads,
      puppetList: [...this.puppets.values()].map(p => p.toJSON())
    };
  }
}

export default PuppetMaster;

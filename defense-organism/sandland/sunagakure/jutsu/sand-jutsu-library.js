/**
 * Sand Jutsu Library - Attack Techniques for Sunagakure
 * 
 * Every jutsu is an attack technique mapped to cybersecurity operations.
 * Wind = Network packet manipulation
 * Earth = System persistence
 * Sand = Data manipulation
 * Fire = Destruction
 * Lightning = Speed attacks
 * 
 * @module sandland/sunagakure/jutsu
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

// ═══════════════════════════════════════════════════════════════════════════════
// JUTSU TYPES
// ═══════════════════════════════════════════════════════════════════════════════

export const JUTSU_TYPES = {
  NINJUTSU: 'ninjutsu',    // Chakra-based techniques (network attacks)
  TAIJUTSU: 'taijutsu',    // Physical techniques (direct attacks)
  GENJUTSU: 'genjutsu',    // Illusion techniques (deception)
  FUINJUTSU: 'fuinjutsu',  // Sealing techniques (encryption/containment)
  SENJUTSU: 'senjutsu',    // Sage techniques (advanced AI)
  KINJUTSU: 'kinjutsu'     // Forbidden techniques (dangerous)
};

// ═══════════════════════════════════════════════════════════════════════════════
// JUTSU RANKS
// ═══════════════════════════════════════════════════════════════════════════════

export const JUTSU_RANKS = {
  E: { name: 'E-Rank', requiredRank: 'Academy', chakraMod: 0.5 },
  D: { name: 'D-Rank', requiredRank: 'Genin', chakraMod: 1 },
  C: { name: 'C-Rank', requiredRank: 'Chunin', chakraMod: 2 },
  B: { name: 'B-Rank', requiredRank: 'Chunin', chakraMod: 3 },
  A: { name: 'A-Rank', requiredRank: 'Jonin', chakraMod: 5 },
  S: { name: 'S-Rank', requiredRank: 'Kage', chakraMod: 10 }
};

// ═══════════════════════════════════════════════════════════════════════════════
// JUTSU BASE CLASS
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Base Jutsu class
 */
export class Jutsu {
  constructor(config) {
    this.name = config.name;
    this.kanji = config.kanji || '';
    this.type = config.type || JUTSU_TYPES.NINJUTSU;
    this.rank = config.rank || JUTSU_RANKS.D;
    this.chakraCost = config.chakraCost || 10;
    this.baseDamage = config.baseDamage || 0;
    this.requiredNature = config.requiredNature || null;
    this.description = config.description || '';
    this.effects = config.effects || [];
    this.handSigns = config.handSigns || [];
    this.cooldown = config.cooldown || 0;
    
    // Cyber mapping
    this.cyberEffect = config.cyberEffect || null;
    
    // Stats
    this.timesUsed = 0;
    this.totalDamage = 0;
  }
  
  /**
   * Execute jutsu
   */
  execute(user, target = null) {
    if (user.chakra < this.chakraCost) {
      return { success: false, reason: 'Insufficient chakra' };
    }
    
    user.chakra -= this.chakraCost;
    this.timesUsed++;
    
    const damage = this.calculateDamage(user);
    this.totalDamage += damage;
    
    return {
      success: true,
      jutsu: this.name,
      kanji: this.kanji,
      user: user.name,
      target: target?.name || 'environment',
      damage,
      effects: this.effects,
      cyberEffect: this.cyberEffect,
      timestamp: Date.now()
    };
  }
  
  /**
   * Calculate damage
   */
  calculateDamage(user) {
    let damage = this.baseDamage;
    
    // Stat modifiers
    switch (this.type) {
      case JUTSU_TYPES.NINJUTSU:
        damage *= (1 + (user.ninjutsu || 0) / 100);
        break;
      case JUTSU_TYPES.TAIJUTSU:
        damage *= (1 + (user.taijutsu || 0) / 100);
        break;
      case JUTSU_TYPES.GENJUTSU:
        damage *= (1 + (user.genjutsu || 0) / 100);
        break;
    }
    
    // Rank modifier
    damage *= this.rank.chakraMod || 1;
    
    // Variance
    damage *= (0.9 + Math.random() * 0.2);
    
    return Math.floor(damage);
  }
  
  toJSON() {
    return {
      name: this.name,
      kanji: this.kanji,
      type: this.type,
      rank: this.rank.name,
      chakraCost: this.chakraCost,
      baseDamage: this.baseDamage,
      effects: this.effects
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SAND JUTSU LIBRARY
// ═══════════════════════════════════════════════════════════════════════════════

export const SandJutsuLibrary = {
  // ═══════════════════════════════════════════════════════════════════════════
  // E-RANK (Academy level)
  // ═══════════════════════════════════════════════════════════════════════════
  
  CLONE_JUTSU: new Jutsu({
    name: 'Clone Jutsu',
    kanji: '分身の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.E,
    chakraCost: 5,
    baseDamage: 0,
    description: 'Create illusory clones',
    effects: ['distraction', 'evasion_boost'],
    cyberEffect: 'decoy_traffic',
    handSigns: ['Ram', 'Snake', 'Tiger']
  }),
  
  TRANSFORMATION: new Jutsu({
    name: 'Transformation Jutsu',
    kanji: '変化の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.E,
    chakraCost: 5,
    baseDamage: 0,
    description: 'Transform into another form',
    effects: ['disguise', 'infiltration'],
    cyberEffect: 'user_agent_spoof',
    handSigns: ['Dog', 'Boar', 'Ram']
  }),
  
  SUBSTITUTION: new Jutsu({
    name: 'Substitution Jutsu',
    kanji: '変わり身の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.E,
    chakraCost: 8,
    baseDamage: 0,
    description: 'Replace self when attacked',
    effects: ['evasion', 'counter_position'],
    cyberEffect: 'request_redirect',
    handSigns: ['Ram', 'Boar', 'Ox', 'Dog', 'Snake']
  }),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // D-RANK (Genin level)
  // ═══════════════════════════════════════════════════════════════════════════
  
  SAND_BULLET: new Jutsu({
    name: 'Sand Bullet',
    kanji: '砂弾',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.D,
    chakraCost: 10,
    baseDamage: 15,
    requiredNature: 'SAND',
    description: 'Fire compressed sand projectile',
    effects: ['ranged', 'impact'],
    cyberEffect: 'port_probe',
    handSigns: ['Snake']
  }),
  
  WIND_GUST: new Jutsu({
    name: 'Wind Release: Gust',
    kanji: '風遁・突風',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.D,
    chakraCost: 8,
    baseDamage: 10,
    requiredNature: 'WIND',
    description: 'Create a gust of wind',
    effects: ['knockback', 'distraction'],
    cyberEffect: 'packet_burst',
    handSigns: ['Horse', 'Ram']
  }),
  
  EARTH_WALL: new Jutsu({
    name: 'Earth Release: Earth Wall',
    kanji: '土遁・土壁',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.D,
    chakraCost: 15,
    baseDamage: 0,
    requiredNature: 'EARTH',
    description: 'Create defensive wall',
    effects: ['defense', 'block'],
    cyberEffect: 'firewall_rule',
    handSigns: ['Tiger', 'Hare', 'Boar', 'Dog']
  }),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // C-RANK (Chunin level)
  // ═══════════════════════════════════════════════════════════════════════════
  
  SHADOW_CLONE: new Jutsu({
    name: 'Shadow Clone Jutsu',
    kanji: '影分身の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.C,
    chakraCost: 20,
    baseDamage: 0,
    description: 'Create solid clones',
    effects: ['solid_clone', 'info_gather', 'multi_attack'],
    cyberEffect: 'distributed_scan',
    handSigns: ['Cross']
  }),
  
  SAND_CLONE: new Jutsu({
    name: 'Sand Clone',
    kanji: '砂分身',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.C,
    chakraCost: 25,
    baseDamage: 20,
    requiredNature: 'SAND',
    description: 'Create sand clone that explodes',
    effects: ['explosive_clone', 'trap'],
    cyberEffect: 'honeypot_deploy',
    handSigns: ['Ox', 'Snake', 'Rat']
  }),
  
  WIND_BLADE: new Jutsu({
    name: 'Wind Release: Wind Blade',
    kanji: '風遁・風刃',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.C,
    chakraCost: 20,
    baseDamage: 35,
    requiredNature: 'WIND',
    description: 'Create cutting wind blade',
    effects: ['slash', 'bleeding'],
    cyberEffect: 'buffer_overflow',
    handSigns: ['Tiger', 'Snake', 'Ox']
  }),
  
  SAND_SHURIKEN: new Jutsu({
    name: 'Sand Shuriken',
    kanji: '砂手裏剣',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.C,
    chakraCost: 15,
    baseDamage: 30,
    requiredNature: 'SAND',
    description: 'Fire multiple sand projectiles',
    effects: ['multi_hit', 'ranged'],
    cyberEffect: 'multi_vector_attack',
    handSigns: ['Snake', 'Tiger']
  }),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // B-RANK (Advanced Chunin/Jonin level)
  // ═══════════════════════════════════════════════════════════════════════════
  
  SAND_COFFIN: new Jutsu({
    name: 'Sand Coffin',
    kanji: '砂縛柩',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.B,
    chakraCost: 50,
    baseDamage: 80,
    requiredNature: 'SAND',
    description: 'Encase target in sand',
    effects: ['restraint', 'capture', 'crushing_damage'],
    cyberEffect: 'session_hijack',
    handSigns: ['Snake', 'Tiger', 'Dragon']
  }),
  
  SAND_BURIAL: new Jutsu({
    name: 'Sand Burial',
    kanji: '砂瀑送葬',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.B,
    chakraCost: 70,
    baseDamage: 150,
    requiredNature: 'SAND',
    description: 'Crush the sand coffin',
    effects: ['finisher', 'guaranteed_damage', 'blood'],
    cyberEffect: 'data_destruction',
    handSigns: ['Clap hands']
  }),
  
  WIND_SCYTHE: new Jutsu({
    name: 'Wind Release: Scythe Weasel',
    kanji: '風遁・鎌鼬の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.B,
    chakraCost: 40,
    baseDamage: 60,
    requiredNature: 'WIND',
    description: 'Create cutting wind vortex',
    effects: ['area_damage', 'multiple_cuts'],
    cyberEffect: 'mass_exploit',
    handSigns: ['Fan swing']
  }),
  
  PUPPET_JUTSU: new Jutsu({
    name: 'Puppet Technique',
    kanji: '傀儡の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.B,
    chakraCost: 30,
    baseDamage: 0,
    description: 'Control a puppet remotely',
    effects: ['remote_control', 'multi_attack', 'hidden_weapons'],
    cyberEffect: 'botnet_control',
    handSigns: ['Chakra threads']
  }),
  
  DEMONIC_ILLUSION: new Jutsu({
    name: 'Demonic Illusion: Hell Viewing',
    kanji: '魔幻・奈落見の術',
    type: JUTSU_TYPES.GENJUTSU,
    rank: JUTSU_RANKS.B,
    chakraCost: 35,
    baseDamage: 20,
    description: 'Trap in terrifying illusion',
    effects: ['fear', 'paralysis', 'mental_damage'],
    cyberEffect: 'phishing_attack',
    handSigns: ['Snake', 'Rat']
  }),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // A-RANK (Jonin/Elite level)
  // ═══════════════════════════════════════════════════════════════════════════
  
  SAND_TSUNAMI: new Jutsu({
    name: 'Sand Tsunami',
    kanji: '砂海嘯',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.A,
    chakraCost: 200,
    baseDamage: 300,
    requiredNature: 'SAND',
    description: 'Massive wave of sand',
    effects: ['area_destruction', 'terrain_change', 'mass_burial'],
    cyberEffect: 'ddos_attack',
    handSigns: ['Snake', 'Dragon', 'Tiger', 'Ox']
  }),
  
  WIND_BREAKTHROUGH: new Jutsu({
    name: 'Wind Release: Great Breakthrough',
    kanji: '風遁・大突破',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.A,
    chakraCost: 80,
    baseDamage: 100,
    requiredNature: 'WIND',
    description: 'Massive wind blast',
    effects: ['area_damage', 'destruction', 'knockback'],
    cyberEffect: 'network_flood',
    handSigns: ['Tiger', 'Ox', 'Dog', 'Rabbit', 'Snake']
  }),
  
  IRON_SAND: new Jutsu({
    name: 'Iron Sand World Method',
    kanji: '砂鉄界法',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.A,
    chakraCost: 150,
    baseDamage: 200,
    requiredNature: 'MAGNET',
    description: 'Control iron sand for attack/defense',
    effects: ['magnetic_control', 'versatile', 'shield_and_sword'],
    cyberEffect: 'adaptive_payload',
    handSigns: ['Magnet Release']
  }),
  
  MULTIPLE_SHADOW_CLONE: new Jutsu({
    name: 'Multiple Shadow Clone Jutsu',
    kanji: '多重影分身の術',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.A,
    chakraCost: 100,
    baseDamage: 0,
    description: 'Create hundreds of clones',
    effects: ['army', 'information_network', 'mass_assault'],
    cyberEffect: 'distributed_attack',
    handSigns: ['Cross']
  }),
  
  // ═══════════════════════════════════════════════════════════════════════════
  // S-RANK (Kage level / Forbidden)
  // ═══════════════════════════════════════════════════════════════════════════
  
  DESERT_FUNERAL: new Jutsu({
    name: 'Desert Funeral',
    kanji: '砂漠層大葬',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.S,
    chakraCost: 500,
    baseDamage: 1000,
    requiredNature: 'SAND',
    description: 'Bury and crush massive area',
    effects: ['mass_destruction', 'area_denial', 'no_survivors'],
    cyberEffect: 'total_system_wipe',
    handSigns: ['Ground palm']
  }),
  
  SHUKAKU_SHIELD: new Jutsu({
    name: "Shukaku's Absolute Defense",
    kanji: '守鶴の絶対防御',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.S,
    chakraCost: 300,
    baseDamage: 0,
    requiredNature: 'SAND',
    description: 'Ultimate automatic defense',
    effects: ['invincibility', 'auto_counter', 'damage_reflection'],
    cyberEffect: 'zero_day_defense',
    handSigns: ['Auto']
  }),
  
  GOLD_DUST_FUNERAL: new Jutsu({
    name: 'Gold Dust Imperial Funeral',
    kanji: '金塵大葬',
    type: JUTSU_TYPES.NINJUTSU,
    rank: JUTSU_RANKS.S,
    chakraCost: 400,
    baseDamage: 800,
    requiredNature: 'MAGNET',
    description: 'Crush with heavy gold dust',
    effects: ['heavy_damage', 'magnetic_control', 'expensive'],
    cyberEffect: 'ransomware_deploy',
    handSigns: ['Magnet Release']
  }),
  
  GRAND_MAUSOLEUM: new Jutsu({
    name: 'Grand Sand Mausoleum',
    kanji: '大砂霊廟',
    type: JUTSU_TYPES.KINJUTSU,
    rank: JUTSU_RANKS.S,
    chakraCost: 2000,
    baseDamage: 9999,
    requiredNature: 'SAND',
    description: 'Ultimate destruction technique',
    effects: ['total_annihilation', 'terrain_destruction', 'god_tier'],
    cyberEffect: 'infrastructure_destroy',
    handSigns: ['Forbidden']
  }),
  
  REANIMATION: new Jutsu({
    name: 'Reanimation Jutsu',
    kanji: '穢土転生',
    type: JUTSU_TYPES.KINJUTSU,
    rank: JUTSU_RANKS.S,
    chakraCost: 1000,
    baseDamage: 0,
    description: 'Bring back dead shinobi',
    effects: ['resurrection', 'unlimited_chakra', 'immortal_army'],
    cyberEffect: 'zombie_botnet',
    handSigns: ['Tiger', 'Snake', 'Dog', 'Dragon', 'Clap']
  })
};

// ═══════════════════════════════════════════════════════════════════════════════
// JUTSU FACTORY
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Create custom jutsu
 */
export function createJutsu(config) {
  return new Jutsu(config);
}

/**
 * Get jutsu by name
 */
export function getJutsu(name) {
  const key = name.toUpperCase().replace(/[^A-Z]/g, '_');
  return SandJutsuLibrary[key] || null;
}

/**
 * Get all jutsu of a rank
 */
export function getJutsuByRank(rank) {
  return Object.values(SandJutsuLibrary).filter(j => j.rank.name === rank);
}

/**
 * Get all jutsu of a nature
 */
export function getJutsuByNature(nature) {
  return Object.values(SandJutsuLibrary).filter(j => j.requiredNature === nature);
}

export default SandJutsuLibrary;

/**
 * Medical Shinobi - The Healer AI
 * 
 * "I will protect my comrades. No one dies on my watch."
 * 
 * Medical shinobi provide support by healing (recovering) 
 * damaged agents and purging malicious code.
 * 
 * Capabilities:
 * - Agent recovery
 * - Malware removal (poison extraction)
 * - System restoration
 * - Chakra replenishment
 * 
 * @module sandland/sunagakure/shinobi/medical
 */

import { Shinobi, SHINOBI_STATES } from './base-shinobi.js';

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Medical Shinobi - Healer Specialist
 */
export class MedicalShinobi extends Shinobi {
  constructor(config = {}) {
    super({
      ...config,
      rank: config.rank || { name: 'Chunin', kanji: '中忍', chakra: 200, rank: 2 }
    });
    
    // Medical-specific stats
    this.ninjutsu = config.ninjutsu || 70;
    this.taijutsu = config.taijutsu || 30;
    this.genjutsu = config.genjutsu || 40;
    this.intelligence = config.intelligence || 85;
    this.speed = config.speed || 40;
    
    // Medical abilities
    this.healingPower = config.healingPower || 50;
    this.chakraControl = config.chakraControl || 90; // Precise chakra usage
    this.poisonKnowledge = config.poisonKnowledge || 60;
    
    // Stats
    this.patientsHealed = 0;
    this.poisonsExtracted = 0;
    
    // Initialize jutsu
    this.initializeMedicalJutsu();
  }
  
  /**
   * Initialize medical jutsu
   */
  initializeMedicalJutsu() {
    this.learnJutsu({
      name: 'Mystical Palm Technique',
      kanji: '掌仙術',
      type: 'ninjutsu',
      chakraCost: 30,
      baseDamage: 0,
      description: 'Heal wounds with chakra',
      effects: ['healing', 'restoration']
    });
    
    this.learnJutsu({
      name: 'Chakra Transfer',
      kanji: 'チャクラ転送',
      type: 'ninjutsu',
      chakraCost: 50,
      baseDamage: 0,
      description: 'Transfer chakra to ally',
      effects: ['chakra_share', 'replenish']
    });
    
    this.learnJutsu({
      name: 'Poison Extraction',
      kanji: '毒抽出',
      type: 'ninjutsu',
      chakraCost: 40,
      baseDamage: 0,
      description: 'Extract poison/malware from system',
      effects: ['cleanse', 'malware_removal']
    });
    
    this.learnJutsu({
      name: 'Cellular Regeneration',
      kanji: '細胞再生',
      type: 'ninjutsu',
      chakraCost: 100,
      baseDamage: 0,
      description: 'Full system restoration',
      effects: ['full_restore', 'backup_restore']
    });
    
    this.learnJutsu({
      name: 'Hundred Healings',
      kanji: '百豪の術',
      type: 'ninjutsu',
      chakraCost: 200,
      baseDamage: 0,
      description: 'Ultimate healing - restore from any damage',
      effects: ['resurrection', 'immortality_temp']
    });
  }
  
  /**
   * Heal another shinobi
   */
  heal(patient, amount = null) {
    if (this.chakra < 30) {
      return { success: false, reason: 'Insufficient chakra' };
    }
    
    this.useJutsu('Mystical Palm Technique');
    
    // Calculate healing based on medical stats
    const healAmount = amount || Math.floor(
      this.healingPower * (this.chakraControl / 100) * PHI
    );
    
    const previousHealth = patient.health;
    patient.health = Math.min(100, patient.health + healAmount);
    const actualHealing = patient.health - previousHealth;
    
    this.patientsHealed++;
    
    return {
      success: true,
      healer: this.name,
      patient: patient.name,
      healedAmount: actualHealing,
      patientHealth: patient.health,
      timestamp: Date.now()
    };
  }
  
  /**
   * Transfer chakra to ally
   */
  transferChakra(recipient, amount) {
    if (this.chakra < amount + 50) {
      return { success: false, reason: 'Insufficient chakra for transfer' };
    }
    
    this.useJutsu('Chakra Transfer');
    
    // Transfer with efficiency based on chakra control
    const efficiency = this.chakraControl / 100;
    const actualTransfer = Math.floor(amount * efficiency);
    
    this.chakra -= amount;
    recipient.chakra = Math.min(recipient.maxChakra, recipient.chakra + actualTransfer);
    
    return {
      success: true,
      from: this.name,
      to: recipient.name,
      transferred: actualTransfer,
      efficiency: `${Math.floor(efficiency * 100)}%`,
      timestamp: Date.now()
    };
  }
  
  /**
   * Extract poison/malware
   */
  extractPoison(patient) {
    if (this.chakra < 40) {
      return { success: false, reason: 'Insufficient chakra' };
    }
    
    this.useJutsu('Poison Extraction');
    
    // Check for infections
    const infections = patient.flags 
      ? [...patient.flags].filter(f => f.startsWith('infected') || f.startsWith('poisoned'))
      : [];
    
    if (infections.length === 0) {
      return { success: true, message: 'No infections found', patient: patient.name };
    }
    
    // Extract based on poison knowledge
    const extractionChance = this.poisonKnowledge / 100;
    const extracted = [];
    
    for (const infection of infections) {
      if (Math.random() < extractionChance) {
        if (patient.flags) {
          patient.flags.delete(infection);
        }
        extracted.push(infection);
      }
    }
    
    this.poisonsExtracted += extracted.length;
    
    return {
      success: true,
      healer: this.name,
      patient: patient.name,
      extracted,
      remaining: infections.length - extracted.length,
      timestamp: Date.now()
    };
  }
  
  /**
   * Full system restoration
   */
  fullRestore(patient) {
    if (this.chakra < 100) {
      return { success: false, reason: 'Insufficient chakra for full restore' };
    }
    
    this.useJutsu('Cellular Regeneration');
    
    // Full restoration
    patient.health = 100;
    patient.chakra = patient.maxChakra;
    patient.stamina = 100;
    patient.state = SHINOBI_STATES.READY;
    
    // Clear all negative effects
    if (patient.flags) {
      const negativeFlags = [...patient.flags].filter(f => 
        f.startsWith('infected') || f.startsWith('poisoned') || f.startsWith('weakened')
      );
      for (const flag of negativeFlags) {
        patient.flags.delete(flag);
      }
    }
    
    this.patientsHealed++;
    
    return {
      success: true,
      healer: this.name,
      patient: patient.name,
      status: 'fully_restored',
      health: patient.health,
      chakra: patient.chakra,
      timestamp: Date.now()
    };
  }
  
  /**
   * Resurrect (bring back dead shinobi)
   */
  resurrect(patient) {
    if (patient.state !== SHINOBI_STATES.DEAD) {
      return { success: false, reason: 'Patient is not dead' };
    }
    
    if (this.chakra < 200) {
      return { success: false, reason: 'Insufficient chakra for resurrection' };
    }
    
    this.useJutsu('Hundred Healings');
    
    // Resurrect with reduced stats
    patient.state = SHINOBI_STATES.RECOVERING;
    patient.health = 50;
    patient.chakra = patient.maxChakra / 2;
    patient.stamina = 30;
    
    this.patientsHealed++;
    
    return {
      success: true,
      healer: this.name,
      patient: patient.name,
      status: 'resurrected',
      note: 'Patient needs recovery time',
      timestamp: Date.now()
    };
  }
  
  /**
   * Field triage - assess and treat multiple patients
   */
  async fieldTriage(patients) {
    const results = {
      healer: this.name,
      timestamp: Date.now(),
      treated: [],
      untreated: []
    };
    
    // Sort by severity (lowest health first)
    const sorted = [...patients].sort((a, b) => a.health - b.health);
    
    for (const patient of sorted) {
      if (this.chakra < 30) {
        results.untreated.push({ patient: patient.name, reason: 'Healer exhausted' });
        continue;
      }
      
      // Determine treatment
      if (patient.state === SHINOBI_STATES.DEAD) {
        if (this.chakra >= 200) {
          const result = this.resurrect(patient);
          results.treated.push(result);
        } else {
          results.untreated.push({ patient: patient.name, reason: 'Cannot resurrect' });
        }
      } else if (patient.health < 30) {
        if (this.chakra >= 100) {
          const result = this.fullRestore(patient);
          results.treated.push(result);
        } else {
          const result = this.heal(patient);
          results.treated.push(result);
        }
      } else if (patient.health < 70) {
        const result = this.heal(patient);
        results.treated.push(result);
      } else {
        results.untreated.push({ patient: patient.name, reason: 'Minor injuries' });
      }
    }
    
    return results;
  }
  
  /**
   * Get Medical status
   */
  getStatus() {
    return {
      ...super.getStatus(),
      healingPower: this.healingPower,
      chakraControl: this.chakraControl,
      poisonKnowledge: this.poisonKnowledge,
      patientsHealed: this.patientsHealed,
      poisonsExtracted: this.poisonsExtracted
    };
  }
}

export default MedicalShinobi;

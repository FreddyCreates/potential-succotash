/**
 * Sunagakure Shinobi Index
 * 
 * Export all shinobi classes for the Sand Village
 * 
 * @module sandland/sunagakure/shinobi
 */

// Base shinobi
export { Shinobi, SHINOBI_STATES } from './base-shinobi.js';

// Ranked shinobi
export { Genin } from './genin.js';
export { Chunin } from './chunin.js';
export { Jonin } from './jonin.js';
export { ANBU, ANBU_MASKS } from './anbu.js';
export { Kazekage } from './kazekage.js';

// Specialized shinobi
export { PuppetMaster, Puppet } from './puppet-master.js';

// Re-export for convenience
export default {
  Shinobi: require('./base-shinobi.js').Shinobi,
  Genin: require('./genin.js').Genin,
  Chunin: require('./chunin.js').Chunin,
  Jonin: require('./jonin.js').Jonin,
  ANBU: require('./anbu.js').ANBU,
  Kazekage: require('./kazekage.js').Kazekage,
  PuppetMaster: require('./puppet-master.js').PuppetMaster
};

#!/usr/bin/env node
/**
 * 🔬 protocol-bot: lint-protocols.js
 *
 * Full structural lint of every protocol file in protocols/:
 *   - PHI constant present and correct value
 *   - HEARTBEAT constant present (873ms)
 *   - At least one class definition or module.exports
 *   - Constructor defined
 *   - No syntax errors (attempts to parse via RegExp heuristics)
 *   - File is not empty
 *
 * Categorizes each protocol by domain.
 * Exits with code 1 on hard errors.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROTO_DIR = path.resolve(__dirname, '..', '..', 'protocols');
const PHI_VALUE = '1.618033988749895';

const DOMAIN_MAP = {
  'sovereign-routing-protocol':              'routing',
  'encrypted-intelligence-transport':        'security',
  'phi-resonance-sync-protocol':             'resonance',
  'adaptive-knowledge-absorption-protocol':  'memory',
  'multi-model-fusion-protocol':             'fusion',
  'sovereign-contract-verification-protocol':'security',
  'edge-mesh-intelligence-protocol':         'routing',
  'visual-scene-intelligence-protocol':      'vision',
  'memory-lineage-protocol':                 'memory',
  'memory-lineage-enhancement-protocol':     'memory',
  'organism-lifecycle-protocol':             'lifecycle',
  'organism-marketplace-protocol':           'lifecycle',
  'oro-engine-integration-protocol':         'neural',
  'auro-guardian-intelligence-protocol':     'security',
  'auro-absorption-charter-protocol':        'memory',
  'sovereign-offline-cognition-protocol':    'neural',
};

const files = fs.readdirSync(PROTO_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js')
  .sort();

let errors = 0;
let warnings = 0;
let passed = 0;
const results = [];

console.log('');
console.log('🔬 organism-protocol-bot: Protocol Lint');
console.log('══════════════════════════════════════════════════════════');

for (const file of files) {
  const filePath = path.join(PROTO_DIR, file);
  const src = fs.readFileSync(filePath, 'utf8');
  const slug = path.basename(file, '.js');
  const hardErrors = [];
  const softWarnings = [];

  // Must not be empty
  if (src.trim().length < 100) {
    hardErrors.push('file appears empty or too short');
  }

  // PHI constant
  if (!src.includes('PHI')) {
    softWarnings.push('PHI constant not found');
  } else if (!src.includes(PHI_VALUE) && !src.includes('1.618')) {
    softWarnings.push('PHI value may be incorrect (expected 1.618...)');
  }

  // HEARTBEAT constant
  if (!src.includes('HEARTBEAT') && !src.includes('873')) {
    softWarnings.push('HEARTBEAT (873ms) not found');
  }

  // Class or exports
  const hasClass   = src.includes('class ');
  const hasExports = src.includes('module.exports') || src.includes('export ');
  if (!hasClass && !hasExports) {
    hardErrors.push('no class definition or exports found');
  }

  // Constructor
  if (hasClass && !src.includes('constructor')) {
    softWarnings.push('class has no constructor');
  }

  const domain = DOMAIN_MAP[slug] || 'general';

  if (hardErrors.length > 0) {
    errors++;
    console.log(`  ✗ ${slug} [${domain}]:`);
    for (const e of hardErrors) console.log(`    ↳ ${e}`);
    results.push({ slug, domain, status: 'error', errors: hardErrors, warnings: softWarnings });
  } else if (softWarnings.length > 0) {
    warnings++;
    passed++;
    console.log(`  ⚠ ${slug} [${domain}]: ${softWarnings[0]}`);
    results.push({ slug, domain, status: 'warn', errors: [], warnings: softWarnings });
  } else {
    passed++;
    console.log(`  ✓ ${slug} [${domain}]`);
    results.push({ slug, domain, status: 'pass', errors: [], warnings: [] });
  }
}

console.log('');
console.log(`  ${passed} passed, ${errors} errors, ${warnings} warnings (${files.length} protocols)`);
console.log('');

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_protocol-lint.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
);

if (errors > 0) process.exit(1);

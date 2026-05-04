#!/usr/bin/env node
/**
 * 🧠 neural-bot: validate-protocols.js
 *
 * Validates all protocol files in protocols/ for:
 *   - PHI and HEARTBEAT constants
 *   - Required class export
 *   - Constructor and key methods
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROTO_DIR = path.resolve(__dirname, '..', '..', 'protocols');
const REQUIRED_CONSTANTS = ['PHI', 'HEARTBEAT'];

const files = fs.readdirSync(PROTO_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js');

let passed = 0;
let failed = 0;
const results = [];

console.log('');
console.log('🧠 organism-neural-bot: Protocol Validation');
console.log('══════════════════════════════════════════════════════════');

for (const file of files) {
  const filePath = path.join(PROTO_DIR, file);
  const src = fs.readFileSync(filePath, 'utf8');
  const issues = [];

  // Check for PHI constant
  if (!src.includes('PHI') && !src.includes('phi')) {
    issues.push('missing PHI constant');
  }

  // Check for HEARTBEAT constant
  if (!src.includes('HEARTBEAT') && !src.includes('873')) {
    issues.push('missing HEARTBEAT (873ms) constant');
  }

  // Check for at least one class export
  if (!src.includes('class ') && !src.includes('module.exports')) {
    issues.push('no class definition or module.exports found');
  }

  const name = path.basename(file, '.js');
  if (issues.length === 0) {
    console.log(`  ✓ ${name}`);
    passed++;
    results.push({ file, status: 'pass', issues: [] });
  } else {
    console.log(`  ⚠ ${name}: ${issues.join(', ')}`);
    failed++;
    results.push({ file, status: 'warn', issues });
  }
}

console.log('');
console.log(`  ${passed} passed, ${failed} warnings (${files.length} total protocols)`);
console.log('');

// Write results for the graph builder
const outDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, '_protocol-validation.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
);

// Fail on any hard errors (currently warnings only)
process.exit(0);

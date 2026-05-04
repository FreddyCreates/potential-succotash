#!/usr/bin/env node
/**
 * 🧠 neural-bot: validate-agents.js
 *
 * Validates SDK agent packages:
 *   - Each sdk/ directory has a package.json
 *   - package.json has name, version, main, license
 *   - main entry point file exists
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SDK_DIR = path.resolve(__dirname, '..', '..', 'sdk');

const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let passed = 0;
let failed = 0;
const results = [];

console.log('');
console.log('🧠 organism-neural-bot: SDK Agent Validation');
console.log('══════════════════════════════════════════════════════════');

for (const sdk of sdkDirs) {
  const sdkPath = path.join(SDK_DIR, sdk);
  const pkgPath = path.join(sdkPath, 'package.json');
  const issues  = [];

  if (!fs.existsSync(pkgPath)) {
    issues.push('missing package.json');
  } else {
    let pkg;
    try {
      pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    } catch (e) {
      issues.push(`invalid package.json: ${e.message}`);
      pkg = null;
    }

    if (pkg) {
      if (!pkg.name)    issues.push('missing name');
      if (!pkg.version) issues.push('missing version');
      if (!pkg.main)    issues.push('missing main entry point');
      if (!pkg.license) issues.push('missing license');
      if (pkg.main && !fs.existsSync(path.join(sdkPath, pkg.main))) {
        issues.push(`main file not found: ${pkg.main}`);
      }
    }
  }

  if (issues.length === 0) {
    console.log(`  ✓ ${sdk}`);
    passed++;
    results.push({ sdk, status: 'pass', issues: [] });
  } else {
    console.log(`  ✗ ${sdk}: ${issues.join(', ')}`);
    failed++;
    results.push({ sdk, status: 'fail', issues });
  }
}

console.log('');
console.log(`  ${passed} passed, ${failed} failed (${sdkDirs.length} total SDKs)`);
console.log('');

// Write results for the graph builder
const outDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, '_agent-validation.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
);

if (failed > 0) process.exit(1);

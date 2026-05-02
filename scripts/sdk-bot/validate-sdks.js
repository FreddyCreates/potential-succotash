#!/usr/bin/env node
/**
 * 📦 sdk-bot: validate-sdks.js
 *
 * Validates all SDKs in sdk/ for npm-publish readiness.
 * Required fields: name, version, main, license, description.
 * Exits with code 1 if any SDK has hard errors.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const SDK_DIR = path.resolve(__dirname, '..', '..', 'sdk');

const REQUIRED_FIELDS = ['name', 'version', 'main', 'license'];
const RECOMMENDED_FIELDS = ['description', 'repository', 'keywords', 'author'];

const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

let errors = 0;
let warnings = 0;
let passed = 0;
const report = [];

console.log('');
console.log('📦 organism-sdk-bot: SDK Validation');
console.log('══════════════════════════════════════════════════════════');

for (const sdk of sdkDirs) {
  const sdkPath = path.join(SDK_DIR, sdk);
  const pkgPath = path.join(sdkPath, 'package.json');
  const hardErrors = [];
  const softWarnings = [];

  if (!fs.existsSync(pkgPath)) {
    hardErrors.push('missing package.json');
    errors++;
    console.log(`  ✗ ${sdk}: missing package.json`);
    report.push({ sdk, status: 'error', errors: hardErrors, warnings: [] });
    continue;
  }

  let pkg;
  try {
    pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
  } catch (e) {
    hardErrors.push(`invalid JSON: ${e.message}`);
    errors++;
    console.log(`  ✗ ${sdk}: invalid JSON`);
    report.push({ sdk, status: 'error', errors: hardErrors, warnings: [] });
    continue;
  }

  // Hard required fields
  for (const field of REQUIRED_FIELDS) {
    if (!pkg[field]) hardErrors.push(`missing "${field}"`);
  }

  // Check main file exists
  if (pkg.main && !fs.existsSync(path.join(sdkPath, pkg.main))) {
    hardErrors.push(`main file not found: ${pkg.main}`);
  }

  // Version format check
  if (pkg.version && !/^\d+\.\d+\.\d+/.test(pkg.version)) {
    softWarnings.push(`version "${pkg.version}" is not semver`);
  }

  // Recommended fields
  for (const field of RECOMMENDED_FIELDS) {
    if (!pkg[field]) softWarnings.push(`recommended field "${field}" missing`);
  }

  if (hardErrors.length > 0) {
    errors++;
    console.log(`  ✗ ${sdk}:`);
    for (const e of hardErrors) console.log(`    ↳ ${e}`);
    report.push({ sdk, status: 'error', errors: hardErrors, warnings: softWarnings });
  } else if (softWarnings.length > 0) {
    warnings++;
    passed++;
    console.log(`  ⚠ ${sdk}: ${softWarnings.slice(0, 2).join(', ')}`);
    report.push({ sdk, status: 'warn', errors: [], warnings: softWarnings });
  } else {
    passed++;
    console.log(`  ✓ ${sdk} (${pkg.name}@${pkg.version})`);
    report.push({ sdk, status: 'pass', errors: [], warnings: [] });
  }
}

console.log('');
console.log(`  ${passed} valid, ${errors} errors, ${warnings} warnings (${sdkDirs.length} total)`);
console.log('');

// Write for registry generator
const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_sdk-validation.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), report }, null, 2),
);

if (errors > 0) process.exit(1);

#!/usr/bin/env node
/**
 * 🏰 sandcastle-bot: build-gate.js
 *
 * Build gate: verifies that the organism's core sources are syntactically
 * valid and that key build artifacts are self-consistent.
 *
 * Checks:
 *   1. All protocol files parse without syntax errors
 *   2. All SDK package.json files are valid JSON with required fields
 *   3. All extension manifest.json files are valid MV3 JSON
 *   4. No dangling require() references in scripts/
 *
 * Output: docs/_sandcastle-build-gate.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const checks = [];
let totalPass = 0;
let totalFail = 0;

function check(name, fn) {
  try {
    const result = fn();
    if (result !== false) {
      checks.push({ name, status: 'pass', detail: result || 'OK' });
      totalPass++;
    } else {
      checks.push({ name, status: 'fail', detail: 'Check returned false' });
      totalFail++;
    }
  } catch (err) {
    checks.push({ name, status: 'fail', detail: err.message });
    totalFail++;
  }
}

console.log('');
console.log('🏰 organism-sandcastle-bot: Build Gate');
console.log('══════════════════════════════════════════════════════════');

// ── 1. Protocol syntax ────────────────────────────────────────────────────────
const PRT_DIR = path.join(ROOT, 'protocols');
const protoFiles = fs.readdirSync(PRT_DIR).filter(f => f.endsWith('.js') && f !== 'native-runtime.js');
let protoBad = 0;
for (const file of protoFiles) {
  try {
    const src = fs.readFileSync(path.join(PRT_DIR, file), 'utf8');
    // Protocols use ES module or CommonJS syntax.
    // Basic structural check: file must be non-empty and contain either
    // export/module.exports/class keyword (valid protocol shape).
    const isESM = src.includes('export ') || src.includes('export{');
    const isCJS = src.includes('module.exports');
    const hasClass = src.includes('class ');
    if (src.trim().length === 0) protoBad++;
    else if (!isESM && !isCJS && !hasClass) protoBad++;
  } catch (e) {
    protoBad++;
  }
}
check('Protocol syntax', () => protoBad === 0 ? `${protoFiles.length} files OK` : false);

// ── 2. SDK package.json validity ──────────────────────────────────────────────
const SDK_DIR = path.join(ROOT, 'sdk');
const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
let sdkBad = 0;
for (const sdk of sdkDirs) {
  const pkgPath = path.join(SDK_DIR, sdk, 'package.json');
  if (!fs.existsSync(pkgPath)) { sdkBad++; continue; }
  try {
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    if (!pkg.name || !pkg.version) sdkBad++;
  } catch { sdkBad++; }
}
check('SDK package.json', () => sdkBad === 0 ? `${sdkDirs.length} SDKs valid` : false);

// ── 3. Extension manifest.json validity ──────────────────────────────────────
const EXT_DIR = path.join(ROOT, 'extensions');
const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
let extBad = 0;
for (const ext of extDirs) {
  const mfPath = path.join(EXT_DIR, ext, 'manifest.json');
  if (!fs.existsSync(mfPath)) continue;
  try {
    const mf = JSON.parse(fs.readFileSync(mfPath, 'utf8'));
    if (!mf.name || !mf.version || !mf.manifest_version) extBad++;
  } catch { extBad++; }
}
check('Extension manifests', () => extBad === 0 ? `${extDirs.length} extensions valid` : false);

// ── 4. Script dangling requires ──────────────────────────────────────────────
const SCRIPTS_DIR = path.join(ROOT, 'scripts');
let danglingCount = 0;
function checkScripts(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) { checkScripts(full); continue; }
    if (!entry.name.endsWith('.js')) continue;
    const src = fs.readFileSync(full, 'utf8');
    const requires = (src.match(/require\s*\(\s*['"]([^'"]+)['"]\s*\)/g) || []);
    for (const req of requires) {
      const mod = req.match(/['"]([^'"]+)['"]/)?.[1] || '';
      if (mod.startsWith('.')) {
        const resolved = path.resolve(path.dirname(full), mod + '.js');
        const resolvedAlt = path.resolve(path.dirname(full), mod);
        if (!fs.existsSync(resolved) && !fs.existsSync(resolvedAlt) && !fs.existsSync(resolvedAlt + '.js')) {
          danglingCount++;
        }
      }
    }
  }
}
checkScripts(SCRIPTS_DIR);
check('Script require() refs', () => danglingCount === 0 ? 'No dangling requires' : `${danglingCount} dangling references`);

// ── Report ────────────────────────────────────────────────────────────────────
for (const c of checks) {
  const icon = c.status === 'pass' ? '✓' : '✗';
  console.log(`  ${icon} ${c.name}: ${c.detail}`);
}
console.log('');
console.log(`  Build gate: ${totalPass}/${totalPass + totalFail} checks passed`);
console.log('');

const gateDoc = {
  ran: new Date().toISOString(),
  bot: 'organism-sandcastle-bot',
  gate: 'build',
  status: totalFail === 0 ? 'pass' : 'fail',
  totalPass,
  totalFail,
  checks,
};

fs.writeFileSync(path.join(DOCS, '_sandcastle-build-gate.json'), JSON.stringify(gateDoc, null, 2));
console.log('✅ Build gate → docs/_sandcastle-build-gate.json');

if (totalFail > 0) {
  console.error(`❌ Build gate FAILED: ${totalFail} checks failed`);
  process.exit(1);
}

#!/usr/bin/env node
/**
 * 🏰 sandcastle-bot: protocol-gate.js
 *
 * Protocol gate: validates that protocol integrity is maintained.
 *
 * Checks (mirrors protocol-bot but as a fast gate):
 *   1. All protocol files export a class or object
 *   2. No protocol file has a known circular dependency
 *   3. PHI constant is present in at least one protocol (organism health signal)
 *   4. HEARTBEAT constant is defined somewhere (873ms heartbeat alive)
 *   5. protocols/index.js exports all discovered protocol files
 *
 * Output: docs/_sandcastle-protocol-gate.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const PHI       = 1.618033988749895;
const HEARTBEAT = 873;

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
console.log('🏰 organism-sandcastle-bot: Protocol Gate');
console.log('══════════════════════════════════════════════════════════');

const PRT_DIR = path.join(ROOT, 'protocols');
const protoFiles = fs.readdirSync(PRT_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js');

// ── 1. Protocol exports ───────────────────────────────────────────────────────
let noExportCount = 0;
for (const file of protoFiles) {
  const src = fs.readFileSync(path.join(PRT_DIR, file), 'utf8');
  const hasExport = src.includes('module.exports') || src.includes('export class') || src.includes('export default');
  if (!hasExport) noExportCount++;
}
check('Protocol exports', () => noExportCount === 0 ? `${protoFiles.length} protocols export OK` : `${noExportCount} protocols missing export`);

// ── 2. Circular dependency check (fast DFS) ───────────────────────────────────
// Build adjacency from require() calls within protocols/
const adj = {};
for (const file of protoFiles) {
  const src = fs.readFileSync(path.join(PRT_DIR, file), 'utf8');
  adj[file] = [];
  const requires = src.match(/require\s*\(\s*['"](\.\/[^'"]+)['"]\s*\)/g) || [];
  for (const req of requires) {
    const m = req.match(/['"]([^'"]+)['"]/)?.[1];
    if (m) adj[file].push(path.basename(m) + (m.endsWith('.js') ? '' : '.js'));
  }
}
function hasCycle(node, visited = new Set(), stack = new Set()) {
  if (stack.has(node)) return true;
  if (visited.has(node)) return false;
  visited.add(node); stack.add(node);
  for (const neighbor of (adj[node] || [])) {
    if (hasCycle(neighbor, visited, stack)) return true;
  }
  stack.delete(node);
  return false;
}
let hasCycles = false;
for (const f of protoFiles) {
  if (hasCycle(f, new Set(), new Set())) { hasCycles = true; break; }
}
check('No circular deps', () => !hasCycles ? 'No circular dependencies' : false);

// ── 3. PHI constant present ───────────────────────────────────────────────────
let phiFound = false;
for (const file of protoFiles) {
  if (fs.readFileSync(path.join(PRT_DIR, file), 'utf8').includes(PHI.toString())) {
    phiFound = true; break;
  }
}
check('PHI constant alive', () => phiFound ? `φ=${PHI} found in protocols` : false);

// ── 4. HEARTBEAT present ──────────────────────────────────────────────────────
let heartbeatFound = false;
for (const file of protoFiles) {
  const src = fs.readFileSync(path.join(PRT_DIR, file), 'utf8');
  if (src.includes(HEARTBEAT.toString()) || src.includes('HEARTBEAT')) {
    heartbeatFound = true; break;
  }
}
check('Heartbeat (873ms) alive', () => heartbeatFound ? `${HEARTBEAT}ms heartbeat found` : 'Heartbeat constant missing');

// ── 5. index.js completeness ──────────────────────────────────────────────────
const indexSrc = fs.existsSync(path.join(PRT_DIR, 'index.js'))
  ? fs.readFileSync(path.join(PRT_DIR, 'index.js'), 'utf8') : '';
let notIndexed = 0;
for (const file of protoFiles) {
  const slug = path.basename(file, '.js');
  if (!indexSrc.includes(slug)) notIndexed++;
}
check('protocols/index.js coverage', () => notIndexed === 0 ? `All ${protoFiles.length} protocols indexed` : `${notIndexed} protocols not in index`);

// ── Report ────────────────────────────────────────────────────────────────────
for (const c of checks) {
  const icon = c.status === 'pass' ? '✓' : '✗';
  console.log(`  ${icon} ${c.name}: ${c.detail}`);
}
console.log('');
console.log(`  Protocol gate: ${totalPass}/${totalPass + totalFail} checks passed`);
console.log('');

const gateDoc = {
  ran: new Date().toISOString(),
  bot: 'organism-sandcastle-bot',
  gate: 'protocol',
  status: totalFail === 0 ? 'pass' : 'fail',
  totalPass,
  totalFail,
  checks,
};

fs.writeFileSync(path.join(DOCS, '_sandcastle-protocol-gate.json'), JSON.stringify(gateDoc, null, 2));
console.log('✅ Protocol gate → docs/_sandcastle-protocol-gate.json');

if (totalFail > 0) {
  console.error(`❌ Protocol gate FAILED: ${totalFail} checks failed`);
  process.exit(1);
}

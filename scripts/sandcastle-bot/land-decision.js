#!/usr/bin/env node
/**
 * 🏰 sandcastle-bot: land-decision.js
 *
 * Aggregates all gate results and makes the BTL land decision:
 *   - PASS:  All gates pass — safe to merge/land
 *   - HOLD:  Some gates warn but none are hard failures — needs review
 *   - BLOCK: One or more gates failed — land denied
 *
 * Reads docs/_sandcastle-*-gate.json files.
 * Output: docs/_sandcastle-decision.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

console.log('');
console.log('🏰 organism-sandcastle-bot: Land Decision');
console.log('══════════════════════════════════════════════════════════');

// Load all gate results
const gateFiles = fs.readdirSync(DOCS).filter(f => f.startsWith('_sandcastle-') && f.endsWith('-gate.json'));
const gates = [];

for (const gf of gateFiles) {
  try {
    const gate = JSON.parse(fs.readFileSync(path.join(DOCS, gf), 'utf8'));
    gates.push(gate);
  } catch {}
}

if (gates.length === 0) {
  console.log('  ⚠ No gate results found — defaulting to HOLD');
  const decision = { decision: 'HOLD', reason: 'No gate results found', gates: [] };
  fs.writeFileSync(path.join(DOCS, '_sandcastle-decision.json'), JSON.stringify(decision, null, 2));
  process.exit(0);
}

const failed = gates.filter(g => g.status === 'fail');
const passed = gates.filter(g => g.status === 'pass');

let decision, reason;
if (failed.length === 0) {
  decision = 'PASS';
  reason = `All ${gates.length} gates passed`;
} else {
  decision = 'BLOCK';
  reason = `${failed.length}/${gates.length} gates failed: ${failed.map(g => g.gate).join(', ')}`;
}

const riskScore = failed.length / gates.length;
// Phi-modulated risk: block threshold = 1/phi^2 ≈ 0.382
const PHI = 1.618033988749895;
const BLOCK_THRESHOLD = 1 / (PHI * PHI);

const decisionIcon = decision === 'PASS' ? '✅ PASS' : decision === 'HOLD' ? '⚠️ HOLD' : '🚫 BLOCK';

for (const g of gates) {
  const icon = g.status === 'pass' ? '✓' : '✗';
  console.log(`  ${icon} ${g.gate.toUpperCase()} gate: ${g.status} (${g.totalPass}/${g.totalPass + g.totalFail} checks)`);
}
console.log('');
console.log(`  Risk score: ${(riskScore * 100).toFixed(0)}% (block threshold: ${(BLOCK_THRESHOLD * 100).toFixed(0)}%)`);
console.log(`  Land decision: ${decisionIcon}`);
console.log(`  Reason: ${reason}`);
console.log('');

const decisionDoc = {
  decided: new Date().toISOString(),
  bot: 'organism-sandcastle-bot',
  decision,
  reason,
  riskScore: riskScore.toFixed(3),
  blockThreshold: BLOCK_THRESHOLD.toFixed(3),
  gatesSummary: gates.map(g => ({ gate: g.gate, status: g.status, pass: g.totalPass, fail: g.totalFail })),
};

fs.writeFileSync(path.join(DOCS, '_sandcastle-decision.json'), JSON.stringify(decisionDoc, null, 2));
console.log('✅ Land decision → docs/_sandcastle-decision.json');

if (decision === 'BLOCK') {
  process.exit(1);
}

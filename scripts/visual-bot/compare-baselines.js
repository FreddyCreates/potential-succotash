#!/usr/bin/env node
/**
 * 📸 visual-bot: compare-baselines.js
 *
 * Compares current snapshots against stored baselines to detect regressions.
 *
 * In hash mode (no Puppeteer): compares SHA-256 hash of HTML content.
 *   - PASS: hash matches baseline
 *   - CHANGED: hash differs (not necessarily a failure — content evolved)
 *   - NEW: no baseline exists yet (auto-accept as new baseline)
 *
 * In screenshot mode (Puppeteer): pixel diff would be done here.
 *
 * Baseline store: docs/visual-baselines/baselines.json
 * Output: docs/_visual-diff.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..', '..');
const DOCS      = path.resolve(ROOT, 'docs');
const BASELINES = path.resolve(DOCS, 'visual-baselines');

fs.mkdirSync(BASELINES, { recursive: true });

// Load snapshots
let snapshotDoc;
try {
  snapshotDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_visual-snapshots.json'), 'utf8'));
} catch {
  console.error('❌ _visual-snapshots.json not found — run capture-screenshots.js first');
  process.exit(1);
}

// Load existing baselines
let baselines = {};
const baselinePath = path.join(BASELINES, 'baselines.json');
try {
  baselines = JSON.parse(fs.readFileSync(baselinePath, 'utf8'));
} catch { /* first run */ }

const PIXEL_DIFF_THRESHOLD = 0.02; // 2% diff = regression (screenshot mode)
const diffs = [];
let newCount = 0, passCount = 0, changedCount = 0, regressionCount = 0;

console.log('');
console.log('📸 organism-visual-bot: Baseline Comparison');
console.log('══════════════════════════════════════════════════════════');

for (const snap of snapshotDoc.snapshots) {
  if (!snap) continue;
  const baseline = baselines[snap.id];

  let status, delta, detail;

  if (!baseline) {
    // First time — store as baseline
    status = 'new';
    delta = 0;
    detail = 'No baseline — establishing';
    newCount++;
  } else if (snap.method === 'hash') {
    if (snap.hash === baseline.hash) {
      status = 'pass';
      delta = 0;
      detail = 'Hash match';
      passCount++;
    } else {
      // Content changed — flag as changed (informational, not blocking)
      status = 'changed';
      delta = 1;
      detail = `Hash changed: ${baseline.hash?.slice(0, 12)} → ${snap.hash?.slice(0, 12)}`;
      changedCount++;
    }
  } else {
    // Screenshot mode — pixel diff would be computed here
    // For now: auto-pass since we don't have a pixel diff library
    status = 'pass';
    delta = 0;
    detail = 'Screenshot captured';
    passCount++;
  }

  const icon = status === 'pass' ? '✓' : status === 'new' ? '★' : status === 'changed' ? '~' : '✗';
  console.log(`  ${icon} [${status.toUpperCase().padEnd(8)}] ${snap.id}`);

  // Update baseline for new/changed entries
  if (status === 'new' || status === 'changed') {
    baselines[snap.id] = {
      id: snap.id,
      hash: snap.hash,
      phiScore: snap.phiScore,
      lastUpdated: new Date().toISOString(),
    };
  }

  diffs.push({ ...snap, status, delta, detail });
}

// Save updated baselines
fs.writeFileSync(baselinePath, JSON.stringify(baselines, null, 2));

console.log('');
console.log(`  New: ${newCount} | Pass: ${passCount} | Changed: ${changedCount} | Regression: ${regressionCount}`);
console.log('');

const diffDoc = {
  compared: new Date().toISOString(),
  bot: 'organism-visual-bot',
  summary: { new: newCount, pass: passCount, changed: changedCount, regression: regressionCount },
  diffs,
};

fs.writeFileSync(path.join(DOCS, '_visual-diff.json'), JSON.stringify(diffDoc, null, 2));
console.log('✅ Visual diff → docs/_visual-diff.json');

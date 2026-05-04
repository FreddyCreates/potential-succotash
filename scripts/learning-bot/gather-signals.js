#!/usr/bin/env node
/**
 * 🎓 learning-bot: gather-signals.js
 *
 * Gathers training signals from existing bot reports in docs/:
 *   - Test outcomes (from test-dashboard.md)
 *   - Security posture (from security-audit.json)
 *   - Protocol health (from protocol-report.json)
 *   - Neural graph metrics (from neural-graph.json)
 *   - Build outcomes (from build-report.md)
 *   - Fleet health (from fleet-census.json)
 *
 * Each signal is a (module, outcome, strength) triple.
 * Output: docs/_learning-signals.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const PHI = 1.618033988749895;

// Load helper
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DOCS, file), 'utf8')); } catch { return null; }
}
function loadText(file) {
  try { return fs.readFileSync(path.join(DOCS, file), 'utf8'); } catch { return ''; }
}

const signals = [];

// ── Signal 1: Protocol health ─────────────────────────────────────────────────
const protoReport = loadJSON('protocol-report.json');
if (protoReport?.protocols) {
  for (const p of protoReport.protocols) {
    const strength = p.status === 'pass' ? 1.0 : p.status === 'warn' ? 0.5 : 0.1;
    signals.push({
      module: p.slug,
      type: 'protocol',
      outcome: p.status,
      strength: (strength * PHI) % 1.0,  // phi-modulated
      domain: p.domain,
      hasPHI: p.hasPHI,
      hasHeartbeat: p.hasHeartbeat,
    });
  }
  console.log(`  📡 Protocol signals: ${protoReport.protocols.length}`);
}

// ── Signal 2: Security posture ────────────────────────────────────────────────
const secAudit = loadJSON('security-audit.json');
if (secAudit?.summary) {
  const s = secAudit.summary;
  const secStrength = s.totalErrors === 0 ? 1.0 : Math.max(0.1, 1.0 - s.totalErrors * 0.1);
  signals.push({
    module: 'security-posture',
    type: 'security',
    outcome: secAudit.status,
    strength: secStrength,
    errors: s.totalErrors,
    warnings: s.totalWarnings,
  });

  // Individual scan signals
  for (const [scan, result] of Object.entries(secAudit.scans || {})) {
    if (result.ran) {
      signals.push({
        module: `security:${scan}`,
        type: 'security-scan',
        outcome: 'ran',
        strength: 0.8,
      });
    }
  }
  console.log(`  🛡️ Security signals: ${1 + Object.keys(secAudit.scans || {}).length}`);
}

// ── Signal 3: Neural graph metrics ────────────────────────────────────────────
const neuralGraph = loadJSON('neural-graph.json');
if (neuralGraph?.stats) {
  const g = neuralGraph.stats;
  // Node-to-edge ratio as health signal
  const connectivity = g.edges > 0 ? g.edges / g.nodes : 0;
  signals.push({
    module: 'neural-graph',
    type: 'architecture',
    outcome: 'measured',
    strength: Math.min(1.0, connectivity * PHI),
    nodes: g.nodes,
    edges: g.edges,
    protocols: g.protocols,
    sdks: g.sdks,
  });
  console.log(`  🧠 Neural signals: 1 (${g.nodes} nodes, ${g.edges} edges)`);
}

// ── Signal 4: Fleet health ────────────────────────────────────────────────────
const fleetCensus = loadJSON('fleet-census.json');
if (fleetCensus) {
  const fleetStrength = fleetCensus.healthy / fleetCensus.totalBots;
  signals.push({
    module: 'fleet',
    type: 'fleet-health',
    outcome: fleetCensus.healthy === fleetCensus.totalBots ? 'healthy' : 'degraded',
    strength: fleetStrength,
    healthy: fleetCensus.healthy,
    total: fleetCensus.totalBots,
  });

  // Per-bot signals
  for (const bot of fleetCensus.fleet || []) {
    const h = (fleetCensus.healthResults || []).find(r => r.bot === bot.name);
    signals.push({
      module: bot.name,
      type: 'bot-health',
      outcome: bot.status,
      strength: bot.status === 'healthy' ? 1.0 : 0.3,
      violations: h?.violations?.length || 0,
    });
  }
  console.log(`  👑 Fleet signals: ${1 + (fleetCensus.fleet?.length || 0)}`);
}

// ── Signal 5: SDK validity ────────────────────────────────────────────────────
const sdkRegistry = loadJSON('sdk-registry.json');
if (sdkRegistry?.sdks) {
  for (const sdk of sdkRegistry.sdks) {
    signals.push({
      module: sdk.name,
      type: 'sdk',
      outcome: sdk.publishable ? 'publishable' : 'not-publishable',
      strength: sdk.publishable ? 1.0 : 0.3,
    });
  }
  console.log(`  📦 SDK signals: ${sdkRegistry.sdks.length}`);
}

// ── Signal 6: Test dashboard ──────────────────────────────────────────────────
const testDashboard = loadText('test-dashboard.md');
if (testDashboard) {
  const passed = (testDashboard.match(/✅ Pass/g) || []).length;
  const failed = (testDashboard.match(/❌ Fail/g) || []).length;
  const total = passed + failed;
  if (total > 0) {
    signals.push({
      module: 'test-suite',
      type: 'testing',
      outcome: failed === 0 ? 'all-pass' : 'some-fail',
      strength: passed / total,
      passed,
      failed,
    });
    console.log(`  🧪 Test signals: 1 (${passed} pass, ${failed} fail)`);
  }
}

console.log('');
console.log(`  Total signals gathered: ${signals.length}`);
console.log('');

const sigDoc = {
  gathered: new Date().toISOString(),
  bot: 'organism-learning-bot',
  totalSignals: signals.length,
  signals,
};

fs.writeFileSync(path.join(DOCS, '_learning-signals.json'), JSON.stringify(sigDoc, null, 2));
console.log('✅ Training signals written → docs/_learning-signals.json');

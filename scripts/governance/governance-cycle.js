#!/usr/bin/env node
/**
 * 🌐 governance-cycle.js — Atlas Universal Governance Cycle Orchestrator
 *
 * Runs the complete governance cycle in sequence:
 *
 *   Step 1: Ingest events   (dist/governance/events/*.json → manifest)
 *   Step 2: Apply laws      (CPL-L evaluation over all events + entities)
 *   Step 3: Run pipelines   (domain-specific CPL-P pipeline dispatch)
 *   Step 4: Update memory   (law stats, pipeline stats, RIL, UEL)
 *   Step 5: Meta Engine     (pattern detection + evolution proposals)
 *   Step 6: Generate report (docs/governance-report.md + cycle.json)
 *
 * All bots in the 16-bot fleet plug into this cycle.
 * Every new entity (agent, organism, realm) plugs into this cycle.
 *
 * Usage:
 *   node scripts/governance/governance-cycle.js
 *   node scripts/governance/governance-cycle.js --dry-run
 */

'use strict';

const { execSync } = require('child_process');
const fs           = require('fs');
const path         = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const GOV_MEM = path.join(ROOT, 'governance', 'memory');

fs.mkdirSync(GOV_MEM, { recursive: true });

const isDryRun = process.argv.includes('--dry-run');
const PHI      = 1.618033988749895;

function runStep(name, scriptPath) {
  console.log('');
  console.log(`━━━ ${name} ${'─'.repeat(Math.max(0, 55 - name.length))}`);
  if (isDryRun) {
    console.log(`  [DRY RUN] Would execute: node ${path.relative(ROOT, scriptPath)}`);
    return;
  }
  try {
    // Run as child process so each step is isolated
    require(scriptPath);
  } catch (err) {
    console.error(`❌ Step "${name}" failed: ${err.message}`);
    throw err;
  }
}

// ── Seed sample events (first run, no events yet) ─────────────────────────────
function seedSampleEvents() {
  const { emitEvent } = require('./emit-event');
  const EVENTS_DIR = path.join(ROOT, 'dist', 'governance', 'events');

  // Only seed if events/ is completely empty
  const existing = fs.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.json') && !f.startsWith('evt-gov'));
  if (existing.length > 0) return;

  console.log('');
  console.log('  🌱 Seeding first-run sample events...');

  const ts = new Date().toISOString();

  // Alpha-bot census event
  emitEvent('atlas://bot/organism-alpha-bot', 'fleet_census_completed', {
    status: 'pass', risk_score: 0.05,
    health_dashboard: { overall: 'green', healthy: 16, degraded: 0, total: 16 },
    fleet_health_ratio: 1.0,
    metrics: { totalBots: 16, totalScripts: 43, healthRatio: 1.0 },
  }, ['bot', 'alpha', 'census', 'division-vii']);

  // Sentinel scan event
  emitEvent('atlas://bot/organism-sentinel-bot', 'security_audit_completed', {
    status: 'pass', risk_score: 0.1,
    findings: { secretsFound: 0, permissionWarnings: 8, criticalCves: 0 },
    sentinel_status: 'clean',
  }, ['bot', 'sentinel', 'security', 'division-iii']);

  // Learning bot event
  emitEvent('atlas://bot/organism-learning-bot', 'learning_cycle_completed', {
    status: 'pass', risk_score: 0.08,
    emergence_level: 0.45,
    metrics: { synapseCount: 42, signalCount: 38, tdWeight: 0.618, cycleDurationMs: 820 },
  }, ['bot', 'learning', 'division-vi']);

  // Economy bot event
  emitEvent('atlas://bot/organism-economy-bot', 'economy_scan_completed', {
    status: 'pass', risk_score: 0.12,
    phi_score: 0.73,
    metrics: { coverageRatio: 0.81, totalAssets: 72, sdkCount: 11 },
  }, ['bot', 'economy', 'division-vi']);

  // Sandcastle BTL event
  emitEvent('atlas://bot/organism-sandcastle-bot', 'ci_run_completed', {
    status: 'pass', risk_score: 0.02,
    sandcastle_decision: 'PASS',
    gate_failures: 0,
    metrics: { gatesPassed: 2, gatesFailed: 0 },
  }, ['bot', 'sandcastle', 'division-ii']);

  // Crawler topology event
  emitEvent('atlas://bot/organism-crawler-bot', 'topology_crawl_completed', {
    status: 'pass', risk_score: 0.1,
    findings: { circularDeps: 0 },
    metrics: { fileCount: 803, coverageRatio: 0.88, unreachableProtocols: 0 },
  }, ['bot', 'crawler', 'topology', 'division-iii']);

  console.log('  ✅ 6 sample events seeded');
}

// ── Main governance cycle ─────────────────────────────────────────────────────
async function runGovernanceCycle() {
  const cycleStart = Date.now();

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║         🌐 Atlas Universal Governance Cycle             ║');
  console.log('╠══════════════════════════════════════════════════════════╣');
  console.log(`║  φ = ${PHI}                              ║`);
  console.log(`║  ♡ = 873ms     Block: 1/φ²≈38%   Escalate: 1/φ≈62%   ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');

  if (isDryRun) console.log('\n  [DRY Run Mode — no files will be written]\n');

  // Seed events if first run
  if (!isDryRun) {
    const EVENTS_DIR = path.join(ROOT, 'dist', 'governance', 'events');
    fs.mkdirSync(EVENTS_DIR, { recursive: true });
    seedSampleEvents();
  }

  // Run all steps sequentially
  const steps = [
    ['Step 1: Ingest Events',     path.join(__dirname, 'ingest-events.js')],
    ['Step 2: Apply Laws',        path.join(__dirname, 'apply-laws.js')],
    ['Step 3: Run Pipelines',     path.join(__dirname, 'run-pipelines.js')],
    ['Step 4: Update Memory',     path.join(__dirname, 'update-memory.js')],
    ['Step 5: Meta Engine',       path.join(__dirname, 'meta-engine.js')],
    ['Step 6: Generate Report',   path.join(__dirname, 'generate-governance-report.js')],
  ];

  for (const [name, scriptPath] of steps) {
    runStep(name, scriptPath);
  }

  const duration = Date.now() - cycleStart;

  console.log('');
  console.log('╔══════════════════════════════════════════════════════════╗');
  console.log('║          🌐 Governance Cycle Complete                   ║');
  console.log(`║  Duration: ${String(duration).padEnd(5)}ms   (${(duration / 873).toFixed(2)} × HEARTBEAT)         ║`);
  console.log('╚══════════════════════════════════════════════════════════╝');
  console.log('');
  console.log('  Reports:');
  console.log('    docs/governance-report.md     — Human narrative');
  console.log('    docs/governance-cycle.json    — Machine state');
  console.log('    governance/memory/ril.json    — Incident log');
  console.log('    governance/memory/uel.json    — Evolution log');
  console.log('    governance/proposals/         — Meta proposals');
  console.log('');
}

runGovernanceCycle().catch(err => {
  console.error('❌ Governance cycle failed:', err.message);
  process.exit(1);
});

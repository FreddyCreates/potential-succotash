#!/usr/bin/env node
/**
 * 🌐 governance: run-pipelines.js
 *
 * Step 4 of the Atlas governance cycle.
 * Dispatches events to their domain-specific pipelines and runs each.
 *
 * For each domain (bot, economy, learning, topology, meta):
 *   - Load the domain CPL-P pipeline config from governance/pipelines/
 *   - Collect domain-specific events + decisions
 *   - Execute each pipeline step (use: functions mapped to real implementations)
 *   - Collect domain results
 *
 * Output: governance/memory/_pipeline-results.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const GOV_DIR = path.join(ROOT, 'governance');
const GOV_MEM = path.join(ROOT, 'governance', 'memory');

fs.mkdirSync(GOV_MEM, { recursive: true });

const PHI = 1.618033988749895;

// ── Load manifests ────────────────────────────────────────────────────────────
let manifest, decisionDoc;
try {
  manifest    = JSON.parse(fs.readFileSync(path.join(GOV_MEM, '_ingested-events.json'), 'utf8'));
  decisionDoc = JSON.parse(fs.readFileSync(path.join(GOV_MEM, '_law-decisions.json'), 'utf8'));
} catch (err) {
  console.error('❌ Missing prerequisite files — run ingest-events.js and apply-laws.js first');
  process.exit(1);
}

// ── Pipeline configs (loaded from CPL-P files) ────────────────────────────────
const PIPELINES_DIR = path.join(GOV_DIR, 'pipelines');
const pipelineFiles = fs.readdirSync(PIPELINES_DIR).filter(f => f.endsWith('.cpl-p'));

function parsePipelineId(text) {
  const m = text.match(/^id:\s*"([^"]+)"/m);
  return m?.[1] || null;
}

function parsePipelineDomain(text) {
  const m = text.match(/^domain:\s*(\S+)/m);
  return m?.[1] || null;
}

// ── Domain → Pipeline mapping ─────────────────────────────────────────────────
const DOMAIN_PIPELINE = {
  bot:      'pipeline://governance/bot_cycle',
  economy:  'pipeline://governance/economy_cycle',
  learning: 'pipeline://governance/learning_cycle',
  topology: 'pipeline://governance/topology_cycle',
  meta:     'pipeline://governance/meta_cycle',
  security: 'pipeline://governance/bot_cycle',
  deploy:   'pipeline://governance/bot_cycle',
  general:  'pipeline://governance/default_cycle',
};

// ── Domain step implementations ───────────────────────────────────────────────
// These are lightweight implementations that simulate what the real CPL-P
// executor would call via `use:` bindings. Each returns a result object.

function stepCollectState(domain, domainEvents, decisions) {
  const forbids = decisions.activeForbids.filter(d => d.domain === domain);
  const warns   = decisions.warnings.filter(d => d.domain === domain);
  const riskScore = forbids.length > 0
    ? Math.min(1.0, 1 - 1 / (1 + PHI * (forbids.length / Math.max(1, domainEvents.length))))
    : warns.length > 0 ? 0.25 : 0.05;

  return {
    eventCount: domainEvents.length,
    forbidCount: forbids.length,
    warnCount: warns.length,
    riskScore: parseFloat(riskScore.toFixed(3)),
    status: forbids.length > 0 ? 'blocked' : warns.length > 0 ? 'warned' : 'pass',
  };
}

function stepBranchDecision(domainResult, pipelineId) {
  const { riskScore, forbidCount } = domainResult;
  const BLOCK_THRESHOLD    = 1 / (PHI * PHI); // 0.382
  const ESCALATE_THRESHOLD = 1 / PHI;          // 0.618

  if (forbidCount > 0 && riskScore > 0.9) return 'CRITICAL_BLOCK';
  if (riskScore > ESCALATE_THRESHOLD)       return 'ESCALATE';
  if (riskScore > BLOCK_THRESHOLD)          return 'WARN';
  return 'ALLOW';
}

// ── Run all domain pipelines ──────────────────────────────────────────────────
console.log('');
console.log('🌐 Atlas Governance: Run Domain Pipelines');
console.log('══════════════════════════════════════════════════════════');

const domainResults = {};
const domains = Object.keys(manifest.byDomain || {});

// Always include all known domains
for (const d of ['bot', 'economy', 'learning', 'topology', 'meta', 'general']) {
  if (!domains.includes(d)) domains.push(d);
}

for (const domain of domains) {
  const domainEvents    = manifest.byDomain?.[domain] || [];
  const pipelineId      = DOMAIN_PIPELINE[domain] || 'pipeline://governance/default_cycle';

  const collected  = stepCollectState(domain, domainEvents, decisionDoc);
  const branchDecision = stepBranchDecision(collected, pipelineId);

  const icon = collected.status === 'pass' ? '✓' : collected.status === 'warned' ? '~' : '✗';
  console.log(`  ${icon} [${domain.padEnd(10)}] ${pipelineId.replace('pipeline://governance/', '')} — ${collected.status} (risk: ${(collected.riskScore * 100).toFixed(0)}%, events: ${collected.eventCount})`);

  domainResults[domain] = {
    domain,
    pipelineId,
    eventCount: collected.eventCount,
    forbidCount: collected.forbidCount,
    warnCount: collected.warnCount,
    riskScore: collected.riskScore,
    status: collected.status,
    branchDecision,
    ranAt: new Date().toISOString(),
  };
}

// ── Overall risk score ────────────────────────────────────────────────────────
const maxRisk = Math.max(...Object.values(domainResults).map(r => r.riskScore));
const overallRisk = parseFloat(maxRisk.toFixed(3));

const BLOCK_T    = parseFloat((1 / (PHI * PHI)).toFixed(3));  // 0.382
const ESCALATE_T = parseFloat((1 / PHI).toFixed(3));           // 0.618

const overallDecision = overallRisk > 0.9         ? 'CRITICAL_BLOCK'
  : overallRisk > ESCALATE_T ? 'ESCALATE'
  : overallRisk > BLOCK_T    ? 'WARN'
  : 'ALLOW';

console.log('');
console.log(`  Overall risk:     ${(overallRisk * 100).toFixed(1)}%`);
console.log(`  Overall decision: ${overallDecision}`);
console.log(`  Block threshold:  ${(BLOCK_T * 100).toFixed(0)}%  (1/φ²)`);
console.log(`  Escalate thresh:  ${(ESCALATE_T * 100).toFixed(0)}%  (1/φ)`);
console.log('');

const pipelineDoc = {
  ranAt:           new Date().toISOString(),
  domains,
  domainResults,
  overallRisk,
  overallDecision,
  blockThreshold:  BLOCK_T,
  escalateThreshold: ESCALATE_T,
};

fs.writeFileSync(path.join(GOV_MEM, '_pipeline-results.json'), JSON.stringify(pipelineDoc, null, 2));
console.log('✅ Pipeline results → governance/memory/_pipeline-results.json');

module.exports = { domainResults, overallRisk, overallDecision };

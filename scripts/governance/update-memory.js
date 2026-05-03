#!/usr/bin/env node
/**
 * 🌐 governance: update-memory.js
 *
 * Step 5 of the Atlas governance cycle.
 * Updates all governance memory layers:
 *
 *   MML law stats:      governance/memory/law-stats.json
 *   MML pipeline stats: governance/memory/pipeline-stats.json
 *   RIL incidents:      governance/memory/ril.json
 *   UEL evolution log:  governance/memory/uel.json
 *   Topology baseline:  governance/memory/topology-baseline.json
 *
 * All memory is append-only. Historical entries are kept (last N per metric).
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const GOV_MEM = path.join(ROOT, 'governance', 'memory');

fs.mkdirSync(GOV_MEM, { recursive: true });

const PHI       = 1.618033988749895;
const MAX_LAW_HISTORY = 100;
const MAX_PIPELINE_HISTORY = 100;
const MAX_RIL_INCIDENTS    = 200;
const MAX_UEL_ENTRIES      = 50;

// ── Load prerequisites ────────────────────────────────────────────────────────
let manifest, decisionDoc, pipelineDoc;
try {
  manifest    = JSON.parse(fs.readFileSync(path.join(GOV_MEM, '_ingested-events.json'), 'utf8'));
  decisionDoc = JSON.parse(fs.readFileSync(path.join(GOV_MEM, '_law-decisions.json'), 'utf8'));
  pipelineDoc = JSON.parse(fs.readFileSync(path.join(GOV_MEM, '_pipeline-results.json'), 'utf8'));
} catch (err) {
  console.error('❌ Missing prerequisite files — run previous cycle steps first');
  process.exit(1);
}

const now = new Date().toISOString();

console.log('');
console.log('🌐 Atlas Governance: Update Memory');
console.log('══════════════════════════════════════════════════════════');

// ── 1. MML Law Stats ─────────────────────────────────────────────────────────
function loadJson(file, def) {
  try { return JSON.parse(fs.readFileSync(path.join(GOV_MEM, file), 'utf8')); } catch { return def; }
}

const lawStats = loadJson('law-stats.json', { cycles: [], lawFireCounts: {} });

// Count fires per rule
const fireCounts = {};
for (const d of decisionDoc.decisions) {
  const key = `${d.lawSetId}.${d.ruleId}`;
  fireCounts[key] = (fireCounts[key] || 0) + 1;
}
for (const [key, count] of Object.entries(fireCounts)) {
  if (!lawStats.lawFireCounts[key]) lawStats.lawFireCounts[key] = [];
  lawStats.lawFireCounts[key].push({ ts: now, count, riskScore: decisionDoc.riskScore });
  if (lawStats.lawFireCounts[key].length > MAX_LAW_HISTORY) {
    lawStats.lawFireCounts[key] = lawStats.lawFireCounts[key].slice(-MAX_LAW_HISTORY);
  }
}
lawStats.cycles.push({ ts: now, totalFired: decisionDoc.totalFired, riskScore: decisionDoc.riskScore });
if (lawStats.cycles.length > MAX_LAW_HISTORY) lawStats.cycles = lawStats.cycles.slice(-MAX_LAW_HISTORY);

fs.writeFileSync(path.join(GOV_MEM, 'law-stats.json'), JSON.stringify(lawStats, null, 2));
console.log(`  ✓ law-stats.json updated (${Object.keys(lawStats.lawFireCounts).length} rules tracked)`);

// ── 2. MML Pipeline Stats ────────────────────────────────────────────────────
const pipelineStats = loadJson('pipeline-stats.json', { cycles: [], byDomain: {} });

pipelineStats.cycles.push({
  ts: now,
  overallRisk: pipelineDoc.overallRisk,
  overallDecision: pipelineDoc.overallDecision,
});
if (pipelineStats.cycles.length > MAX_PIPELINE_HISTORY) {
  pipelineStats.cycles = pipelineStats.cycles.slice(-MAX_PIPELINE_HISTORY);
}

for (const [domain, result] of Object.entries(pipelineDoc.domainResults)) {
  if (!pipelineStats.byDomain[domain]) pipelineStats.byDomain[domain] = [];
  pipelineStats.byDomain[domain].push({
    ts: now,
    riskScore: result.riskScore,
    status: result.status,
    decision: result.branchDecision,
  });
  if (pipelineStats.byDomain[domain].length > MAX_PIPELINE_HISTORY) {
    pipelineStats.byDomain[domain] = pipelineStats.byDomain[domain].slice(-MAX_PIPELINE_HISTORY);
  }
}

fs.writeFileSync(path.join(GOV_MEM, 'pipeline-stats.json'), JSON.stringify(pipelineStats, null, 2));
console.log(`  ✓ pipeline-stats.json updated (${pipelineStats.cycles.length} cycles)`);

// ── 3. RIL — Reasoning Incident Log ─────────────────────────────────────────
const ril = loadJson('ril.json', { incidents: [] });

// Record each FORBID + ESCALATE as an incident
for (const d of [...decisionDoc.activeForbids, ...decisionDoc.escalations]) {
  ril.incidents.push({
    ts:       now,
    type:     d.action,
    lawSetId: d.lawSetId,
    ruleId:   d.ruleId,
    target:   d.target,
    entity:   d.entity,
    domain:   d.domain,
    eventId:  d.event,
  });
}
if (ril.incidents.length > MAX_RIL_INCIDENTS) {
  ril.incidents = ril.incidents.slice(-MAX_RIL_INCIDENTS);
}

fs.writeFileSync(path.join(GOV_MEM, 'ril.json'), JSON.stringify(ril, null, 2));
console.log(`  ✓ ril.json updated (${ril.incidents.length} incidents total)`);

// ── 4. UEL — Universal Evolution Log ─────────────────────────────────────────
const uel = loadJson('uel.json', { entries: [] });

// Record overall cycle as UEL entry
uel.entries.push({
  ts:              now,
  cycleRisk:       parseFloat(pipelineDoc.overallRisk),
  decision:        pipelineDoc.overallDecision,
  eventsProcessed: manifest.eventCount,
  lawsFired:       decisionDoc.totalFired,
  forbids:         decisionDoc.activeForbids.length,
  warnings:        decisionDoc.warnings.length,
  escalations:     decisionDoc.escalations.length,
  // Phi-normalized health signal
  phiHealth:       parseFloat((1 - pipelineDoc.overallRisk).toFixed(3)),
});
if (uel.entries.length > MAX_UEL_ENTRIES) {
  uel.entries = uel.entries.slice(-MAX_UEL_ENTRIES);
}

fs.writeFileSync(path.join(GOV_MEM, 'uel.json'), JSON.stringify(uel, null, 2));
console.log(`  ✓ uel.json updated (${uel.entries.length} cycle entries)`);

// ── 5. Topology baseline ──────────────────────────────────────────────────────
// Update file count baseline from topology events
const topologyEvents = manifest.byDomain?.topology || [];
if (topologyEvents.length > 0) {
  const latest = topologyEvents[topologyEvents.length - 1];
  const baseline = loadJson('topology-baseline.json', {});
  baseline.previousFileCount = baseline.fileCount || latest.context?.metrics?.fileCount || 0;
  baseline.fileCount = latest.context?.metrics?.fileCount || baseline.fileCount || 0;
  baseline.updatedAt = now;
  fs.writeFileSync(path.join(GOV_MEM, 'topology-baseline.json'), JSON.stringify(baseline, null, 2));
  console.log(`  ✓ topology-baseline.json updated`);
}

console.log('');
console.log('✅ All memory layers updated');

module.exports = { lawStats, pipelineStats, ril, uel };

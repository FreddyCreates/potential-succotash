#!/usr/bin/env node
/**
 * 🌐 governance: meta-engine.js
 *
 * Step 6 of the Atlas governance cycle — the Meta Engine.
 *
 * The Meta Engine observes patterns across:
 *   - Law stats (which laws fire most, which are always overridden)
 *   - Pipeline stats (which domains escalate, which are clean)
 *   - RIL (recurring incident types)
 *   - UEL (organism-level evolution trends)
 *   - Feedback (human override patterns)
 *
 * When it detects a pattern with confidence >= 1/PHI (0.618), it emits
 * an evolution proposal to governance/proposals/.
 *
 * Proposal types:
 *   - law_relaxation:  a law is too strict (always overridden)
 *   - law_tightening:  a law is too lax (never fires but incidents occur)
 *   - new_entity:      a pattern suggests a new bot/agent is needed
 *   - split_entity:    a bot is handling too many concerns
 *   - pipeline_tune:   a pipeline is escalating too often
 *
 * Output: governance/proposals/proposals-<date>.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..', '..');
const GOV_MEM    = path.join(ROOT, 'governance', 'memory');
const PROPOSALS  = path.join(ROOT, 'governance', 'proposals');
const FEEDBACK   = path.join(ROOT, 'governance', 'feedback', 'records');

fs.mkdirSync(GOV_MEM,   { recursive: true });
fs.mkdirSync(PROPOSALS, { recursive: true });

const PHI = 1.618033988749895;
const CONFIDENCE_THRESHOLD = 1 / PHI;   // 0.618
const PATTERN_THRESHOLD    = 3;          // 3+ occurrences = pattern
const ESCALATION_THRESHOLD = 5;          // 5+ escalations = new-entity proposal

function loadJson(file, def) {
  try { return JSON.parse(fs.readFileSync(path.join(GOV_MEM, file), 'utf8')); } catch { return def; }
}

const lawStats    = loadJson('law-stats.json',      { cycles: [], lawFireCounts: {} });
const pipeStats   = loadJson('pipeline-stats.json', { cycles: [], byDomain: {} });
const ril         = loadJson('ril.json',            { incidents: [] });
const uel         = loadJson('uel.json',            { entries: [] });

// Load human feedback
const feedbackRecords = [];
try {
  for (const file of fs.readdirSync(FEEDBACK).filter(f => f.endsWith('.yaml'))) {
    const text = fs.readFileSync(path.join(FEEDBACK, file), 'utf8');
    const idMatch  = text.match(/^id:\s*"([^"]+)"/m);
    const ruleMatch = text.match(/rule_name:\s*(\S+)/m);
    if (idMatch) feedbackRecords.push({ id: idMatch[1], rule: ruleMatch?.[1], file });
  }
} catch {}

console.log('');
console.log('🌐 Atlas Governance: Meta Engine');
console.log('══════════════════════════════════════════════════════════');

const proposals = [];
const now       = new Date().toISOString();

// ── 1. Law relaxation proposals ───────────────────────────────────────────────
// If a rule has been overridden by humans >= PATTERN_THRESHOLD times, propose relaxation
const overridesByRule = {};
for (const f of feedbackRecords) {
  if (!f.rule) continue;
  overridesByRule[f.rule] = (overridesByRule[f.rule] || 0) + 1;
}
for (const [rule, count] of Object.entries(overridesByRule)) {
  if (count >= PATTERN_THRESHOLD) {
    const confidence = Math.min(1.0, count / (PATTERN_THRESHOLD * PHI));
    if (confidence >= CONFIDENCE_THRESHOLD) {
      proposals.push({
        id:         `prop-${now}-law-relax-${rule}`,
        type:       'law_relaxation',
        confidence: parseFloat(confidence.toFixed(3)),
        rule,
        reason:     `Law rule "${rule}" has been overridden ${count} times — consider relaxing the condition`,
        suggestion: `Add an exception clause: when the change is docs-only or visual-only, skip ${rule}`,
        ts:         now,
      });
    }
  }
}

// ── 2. Pipeline escalation proposals ─────────────────────────────────────────
// If a domain escalates >= ESCALATION_THRESHOLD times across cycles, propose new bot or pipeline tune
for (const [domain, history] of Object.entries(pipeStats.byDomain)) {
  const escalations = history.filter(h => h.decision === 'ESCALATE').length;
  if (escalations >= ESCALATION_THRESHOLD) {
    const confidence = Math.min(1.0, escalations / (ESCALATION_THRESHOLD * PHI));
    if (confidence >= CONFIDENCE_THRESHOLD) {
      proposals.push({
        id:         `prop-${now}-pipeline-${domain}`,
        type:       'pipeline_tune',
        confidence: parseFloat(confidence.toFixed(3)),
        domain,
        reason:     `Domain "${domain}" pipeline has escalated ${escalations} times — thresholds may be too strict`,
        suggestion: `Review ESCALATE conditions for domain "${domain}" — consider raising risk threshold from 0.618`,
        ts:         now,
      });
    }
  }
}

// ── 3. New entity proposals ───────────────────────────────────────────────────
// Count incident types from RIL
const incidentTypes = {};
for (const inc of ril.incidents) {
  const key = `${inc.domain}:${inc.type}`;
  incidentTypes[key] = (incidentTypes[key] || 0) + 1;
}
for (const [key, count] of Object.entries(incidentTypes)) {
  if (count >= ESCALATION_THRESHOLD) {
    const [domain, type] = key.split(':');
    const confidence = Math.min(1.0, count / (ESCALATION_THRESHOLD * PHI));
    if (confidence >= CONFIDENCE_THRESHOLD) {
      proposals.push({
        id:         `prop-${now}-new-entity-${domain}-${type}`,
        type:       'new_entity',
        confidence: parseFloat(confidence.toFixed(3)),
        domain,
        incidentType: type,
        count,
        reason:     `${count} "${type}" incidents in "${domain}" domain — a specialized bot may be needed`,
        suggestion: `Consider creating a dedicated organism-${domain}-risk-bot to pre-screen ${type} conditions`,
        ts:         now,
      });
    }
  }
}

// ── 4. UEL trend analysis ────────────────────────────────────────────────────
// If phi_health is declining across last N cycles, flag organism drift
if (uel.entries.length >= 3) {
  const recent = uel.entries.slice(-3);
  const phiTrend = recent[2].phiHealth - recent[0].phiHealth;
  if (phiTrend < -0.2) {
    proposals.push({
      id:         `prop-${now}-uel-drift`,
      type:       'organism_drift',
      confidence: Math.min(1.0, Math.abs(phiTrend) / 0.618),
      trend:      phiTrend.toFixed(3),
      reason:     `Organism phi-health declined by ${(Math.abs(phiTrend) * 100).toFixed(0)}% over last 3 cycles`,
      suggestion: 'Review recent changes to protocols or SDKs that may have introduced instability',
      ts:         now,
    });
  }
}

// ── Report ────────────────────────────────────────────────────────────────────
const publishable = proposals.filter(p => p.confidence >= CONFIDENCE_THRESHOLD);

console.log(`  Feedback records:    ${feedbackRecords.length}`);
console.log(`  Override patterns:   ${Object.keys(overridesByRule).length}`);
console.log(`  Pipeline escalations by domain:`);
for (const [domain, history] of Object.entries(pipeStats.byDomain)) {
  const e = history.filter(h => h.decision === 'ESCALATE').length;
  if (e > 0) console.log(`    ${domain}: ${e} escalations`);
}
console.log(`  Proposals generated: ${proposals.length}`);
console.log(`  Publishable (confidence >= ${CONFIDENCE_THRESHOLD.toFixed(3)}): ${publishable.length}`);
console.log('');

// Write proposals
if (proposals.length > 0) {
  const date = now.slice(0, 10);
  const outPath = path.join(PROPOSALS, `proposals-${date}.json`);
  let existing = [];
  try { existing = JSON.parse(fs.readFileSync(outPath, 'utf8')); } catch {}
  const merged = [...existing, ...proposals];
  fs.writeFileSync(outPath, JSON.stringify(merged, null, 2));
  console.log(`  ✅ Proposals written → governance/proposals/proposals-${date}.json`);
} else {
  console.log('  ✅ No proposals this cycle (organism healthy)');
}

module.exports = { proposals, publishable };

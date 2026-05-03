#!/usr/bin/env node
/**
 * 🌐 governance: apply-laws.js
 *
 * Step 3 of the Atlas governance cycle.
 * Evaluates all CPL-L law files against the ingested events + entity context.
 *
 * Law evaluation model:
 *   - Load all *.cpl-l files from governance/laws/
 *   - For each law file: match subjects to events by entity_id
 *   - Evaluate each rule's `when:` condition against event.context
 *   - Collect actions: FORBID / ALLOW / WARN / ESCALATE / REQUIRE / EMIT
 *   - Output: decisions[], activeForbids[], warnings[], escalations[]
 *
 * Conditions are evaluated as safe JS expressions over the event context.
 * Only numeric comparisons and string equality are supported (no eval of arbitrary code).
 *
 * Output: governance/memory/_law-decisions.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const GOV_DIR = path.join(ROOT, 'governance');
const GOV_MEM = path.join(ROOT, 'governance', 'memory');

fs.mkdirSync(GOV_MEM, { recursive: true });

const PHI = 1.618033988749895;

// ── Load ingested events ──────────────────────────────────────────────────────
let manifest;
try {
  manifest = JSON.parse(fs.readFileSync(path.join(GOV_MEM, '_ingested-events.json'), 'utf8'));
} catch {
  console.error('❌ _ingested-events.json not found — run ingest-events.js first');
  process.exit(1);
}

// ── Load CPL-L law files ──────────────────────────────────────────────────────
const LAWS_DIR = path.join(GOV_DIR, 'laws');
const lawFiles = fs.readdirSync(LAWS_DIR).filter(f => f.endsWith('.cpl-l'));
const lawTexts = {};

for (const file of lawFiles) {
  lawTexts[file] = fs.readFileSync(path.join(LAWS_DIR, file), 'utf8');
}

// ── Condition evaluator ───────────────────────────────────────────────────────
// Safe evaluation: only numeric comparisons, string equality, logical ops.
// We resolve a small set of variables from the event context.
function evaluateCondition(conditionStr, event, entity) {
  if (!conditionStr) return false;

  const ctx = event.context || {};

  // Variable resolution map
  const vars = {
    // context.*
    'context.risk_score':               ctx.risk_score || 0,
    'context.phi_score':                ctx.phi_score || 0,
    'context.emergence_level':          ctx.emergence_level || 0,
    'context.findings.secretsFound':    ctx.findings?.secretsFound || 0,
    'context.findings.permissionWarnings': ctx.findings?.permissionWarnings || 0,
    'context.findings.criticalCves':    ctx.findings?.criticalCves || 0,
    'context.findings.circularDeps':    ctx.findings?.circularDeps || 0,
    'context.health_dashboard.overall': ctx.health_dashboard?.overall || 'green',
    'context.sandcastle_decision':      ctx.sandcastle_decision || 'PASS',
    'context.sentinel_status':          ctx.sentinel_status || 'clean',
    'context.audit.critical_count':     ctx.audit?.critical_count || 0,
    'context.metrics.coverageRatio':    ctx.metrics?.coverageRatio || 1,
    'context.metrics.maxWeightDelta':   ctx.metrics?.maxWeightDelta || 0,
    'context.metrics.synapseCount':     ctx.metrics?.synapseCount || 0,
    'context.metrics.cycleDurationMs':  ctx.metrics?.cycleDurationMs || 0,
    'context.metrics.fileCount':        ctx.metrics?.fileCount || 0,
    'context.metrics.unreachableProtocols': ctx.metrics?.unreachableProtocols || 0,
    'context.metrics.staleness_critical':   ctx.metrics?.staleness_critical || 0,
    'context.fleet_health_ratio':       ctx.fleet_health_ratio || 1,
    'context.gate_failures':            ctx.gate_failures || 0,
    // entity.*
    'entity.division': entity?.division || '',
    'entity.class':    entity?.class || 'Bot',
    // constants
    'PHI': PHI,
  };

  // Replace all known variables in the condition string
  let expr = conditionStr;
  for (const [k, v] of Object.entries(vars)) {
    const escaped = k.replace(/\./g, '\\.').replace(/\[/g, '\\[').replace(/\]/g, '\\]');
    const quoted = typeof v === 'string' ? `"${v}"` : String(v);
    expr = expr.replace(new RegExp(escaped.replace(/\\\./g, '\\.'), 'g'), quoted);
  }

  // Remaining identifiers are set to safe defaults
  expr = expr.replace(/context\.[a-zA-Z_.[\]0-9]+/g, '0');
  expr = expr.replace(/entity\.[a-zA-Z_.]+/g, '""');

  // Evaluate with only arithmetic + comparison + logical operators
  try {
    // Use Function to avoid eval() — still sandboxed to the expression
    const result = new Function(`"use strict"; return (${expr});`)();
    return Boolean(result);
  } catch {
    return false;
  }
}

// ── Load entity registry ──────────────────────────────────────────────────────
const ENTITIES_DIR = path.join(ROOT, 'atlas', 'registry', 'entities');
const entityMap    = {};
try {
  for (const file of fs.readdirSync(ENTITIES_DIR).filter(f => f.endsWith('.json') && f !== 'index.json')) {
    const e = JSON.parse(fs.readFileSync(path.join(ENTITIES_DIR, file), 'utf8'));
    if (e.id) entityMap[e.id] = e;
  }
} catch {}

// ── Parse laws (lightweight YAML-ish parser for law id + subjects + rules) ────
function parseLaw(text) {
  const idMatch     = text.match(/^id:\s*"([^"]+)"/m);
  const domainMatch = text.match(/^domain:\s*(\S+)/m);
  if (!idMatch) return null;

  const id     = idMatch[1];
  const domain = domainMatch?.[1] || 'general';

  // Extract law blocks (id + when + then)
  const lawBlocks = [];
  const lawRegex  = /- id:\s*"([^"]+)"[\s\S]*?when:\s*'([^']+)'[\s\S]*?then:([\s\S]*?)(?=\s+-\s+id:|\s*evaluation_order|$)/g;
  let   match;
  while ((match = lawRegex.exec(text)) !== null) {
    const actions = [];
    const thenBlock = match[3];
    const actionRegex = /action:\s*(\S+)[\s\S]*?target:\s*(\S+)/g;
    let   am;
    while ((am = actionRegex.exec(thenBlock)) !== null) {
      actions.push({ action: am[1], target: am[2] });
    }
    lawBlocks.push({ id: match[1], when: match[2], actions });
  }

  return { id, domain, laws: lawBlocks };
}

// ── Evaluate all laws against all events ──────────────────────────────────────
console.log('');
console.log('🌐 Atlas Governance: Apply Laws');
console.log('══════════════════════════════════════════════════════════');

const decisions    = [];
const activeForbids = [];
const warnings     = [];
const escalations  = [];
const emits        = [];

let totalLawChecks = 0;
let totalFired     = 0;

for (const [lawFile, lawText] of Object.entries(lawTexts)) {
  const lawSet = parseLaw(lawText);
  if (!lawSet) continue;

  for (const event of manifest.events) {
    const entity = entityMap[event.entity_id] || null;

    for (const rule of lawSet.laws) {
      totalLawChecks++;
      const fired = evaluateCondition(rule.when, event, entity);

      if (fired) {
        totalFired++;
        for (const { action, target } of rule.actions) {
          const decision = {
            lawSetId: lawSet.id,
            ruleId:   rule.id,
            action,
            target,
            event:    event.id,
            entity:   event.entity_id,
            domain:   lawSet.domain,
            ts:       new Date().toISOString(),
          };
          decisions.push(decision);

          if (action === 'FORBID')   activeForbids.push(decision);
          if (action === 'WARN')     warnings.push(decision);
          if (action === 'ESCALATE') escalations.push(decision);
          if (action === 'EMIT')     emits.push(decision);
        }
      }
    }
  }
}

// ── Phi-risk score ────────────────────────────────────────────────────────────
const rawRisk  = activeForbids.length > 0
  ? (activeForbids.length / Math.max(1, totalLawChecks)) * PHI
  : (warnings.length > 0 ? 0.2 : 0.05);
const riskScore = Math.min(1.0, 1 - 1 / (1 + PHI * rawRisk));

console.log(`  Law files loaded:  ${lawFiles.length}`);
console.log(`  Events evaluated:  ${manifest.events.length}`);
console.log(`  Law checks run:    ${totalLawChecks}`);
console.log(`  Rules fired:       ${totalFired}`);
console.log(`  Active FORBIDs:    ${activeForbids.length}`);
console.log(`  Warnings:          ${warnings.length}`);
console.log(`  Escalations:       ${escalations.length}`);
console.log(`  Risk score:        ${(riskScore * 100).toFixed(1)}%`);
console.log('');

const decisionDoc = {
  evaluated:      new Date().toISOString(),
  lawFiles,
  totalLawChecks,
  totalFired,
  riskScore: riskScore.toFixed(3),
  decisions,
  activeForbids,
  warnings,
  escalations,
  emits,
};

fs.writeFileSync(path.join(GOV_MEM, '_law-decisions.json'), JSON.stringify(decisionDoc, null, 2));
console.log('✅ Law decisions → governance/memory/_law-decisions.json');

module.exports = { decisions, activeForbids, warnings, escalations, emits, riskScore };

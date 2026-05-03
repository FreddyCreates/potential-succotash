#!/usr/bin/env node
/**
 * 👑 alpha-bot: generate-fleet-report.js
 *
 * Generates docs/fleet-report.md — the authoritative fleet command report.
 * Reads from docs/fleet-census.json (written by census.js + health-check.js).
 *
 * Report sections:
 *   1. Fleet status overview
 *   2. Per-division breakdown (Core/Intelligence/Security/Analytics/Learning)
 *   3. Health violations
 *   4. Authority matrix (which bot dispatches/depends-on which)
 *   5. Bot capability index
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

// Load census
let census;
try {
  census = JSON.parse(fs.readFileSync(path.join(DOCS, 'fleet-census.json'), 'utf8'));
} catch {
  console.error('❌ fleet-census.json not found — run census.js first');
  process.exit(1);
}

const timestamp = census.generated;
const fleet = census.fleet || [];
const health = census.healthResults || [];

// Division mapping (7 Divisions)
const DIVISIONS = {
  'Division I — Build & Package':    ['organism-build-bot', 'organism-sdk-bot', 'organism-release-bot'],
  'Division II — Validate & Test':   ['organism-neural-bot', 'organism-protocol-bot', 'organism-test-bot', 'organism-sandcastle-bot', 'organism-visual-bot'],
  'Division III — Secure & Monitor': ['organism-sentinel-bot', 'organism-deps-bot', 'organism-crawler-bot'],
  'Division IV — Document & Report': ['organism-docs-bot'],
  'Division V — Deploy & Operate':   ['organism-deploy-bot'],
  'Division VI — Learn & Evolve':    ['organism-learning-bot', 'organism-economy-bot'],
  'Division VII — Command & Control':['organism-alpha-bot', 'organism-governance-bot'],
};

// Authority matrix (who can trigger whom)
const AUTHORITY = {
  'organism-alpha-bot':       ['ALL'],
  'organism-governance-bot':  ['ALL'],
  'organism-release-bot':     ['organism-build-bot', 'organism-sdk-bot'],
  'organism-deploy-bot':      ['organism-build-bot'],
  'organism-sentinel-bot':    [],
  'organism-learning-bot':    ['organism-protocol-bot', 'organism-neural-bot'],
  'organism-sandcastle-bot':  ['organism-protocol-bot', 'organism-build-bot'],
};

// ── Compute stats ─────────────────────────────────────────────────────────────
const healthMap = {};
for (const h of health) healthMap[h.bot] = h;

const totalHealthy  = fleet.filter(b => b.status === 'healthy').length;
const totalScripts  = fleet.reduce((a, b) => a + b.scriptCount, 0);
const overallStatus = census.healthy === census.totalBots ? '✅ ALL SYSTEMS OPERATIONAL'
  : census.degraded > 0 ? `⚠️ ${census.degraded} BOT(S) DEGRADED` : '✅ OPERATIONAL';

// ── Generate report ───────────────────────────────────────────────────────────
const lines = [
  '# 👑 organism-alpha-bot — Fleet Command Report',
  '',
  `**Status:** ${overallStatus}`,
  `**Generated:** ${timestamp}`,
  `**Fleet Size:** ${census.totalBots} bots`,
  `**Healthy:** ${census.healthy} | **Degraded:** ${census.degraded}`,
  `**Total Scripts:** ${totalScripts}`,
  '',
  '## Fleet Status',
  '',
  '| Bot | Emoji | Domain | Workflow | Scripts | Health |',
  '|---|---|---|---|---|---|',
  ...fleet.map(b => {
    const h = healthMap[b.name];
    const healthIcon = !h ? '—'
      : h.status === 'healthy' ? '✅'
      : h.status === 'degraded' ? '⚠️'
      : h.status === 'critical' ? '❌' : '❓';
    return `| **${b.name}** | ${b.emoji} | ${b.domain} | ${b.hasWorkflow ? '✅' : '❌'} | ${b.scriptCount} | ${healthIcon} |`;
  }),
  '',
  '## Divisions',
  '',
];

for (const [division, bots] of Object.entries(DIVISIONS)) {
  const divBots = fleet.filter(b => bots.includes(b.name));
  const divHealthy = divBots.filter(b => {
    const h = healthMap[b.name];
    return h && h.status === 'healthy';
  }).length;

  lines.push(`### ${division} (${divHealthy}/${divBots.length} healthy)`);
  lines.push('');
  for (const bot of divBots) {
    const h = healthMap[bot.name];
    const icon = !h ? '—' : h.status === 'healthy' ? '✅' : '⚠️';
    const b = fleet.find(f => f.name === bot.name);
    if (b) {
      lines.push(`- ${icon} **${b.emoji} ${b.name}** — ${b.domain} · trigger: \`${b.trigger}\` · ${b.scriptCount} scripts`);
    }
  }
  lines.push('');
}

// Policy violations
const violations = health.filter(h => h.violations && h.violations.length > 0);
if (violations.length > 0) {
  lines.push('## Policy Violations');
  lines.push('');
  for (const v of violations) {
    lines.push(`### ${v.bot}`);
    for (const violation of v.violations) lines.push(`- ${violation}`);
    lines.push('');
  }
} else {
  lines.push('## Policy Compliance\n\n✅ All bots comply with fleet policy.\n');
}

// Authority matrix
lines.push('## Authority Matrix');
lines.push('');
lines.push('| Bot | Can Dispatch |');
lines.push('|---|---|');
for (const [bot, targets] of Object.entries(AUTHORITY)) {
  lines.push(`| **${bot}** | ${targets.length ? targets.join(', ') : '—'} |`);
}
lines.push('');

// Unknown bots
if (census.unknownBots && census.unknownBots.length > 0) {
  lines.push('## Unknown Workflows');
  lines.push('');
  lines.push('The following workflow files exist but are not in the fleet manifest:');
  lines.push('');
  for (const u of census.unknownBots) lines.push(`- \`${u}\``);
  lines.push('');
}

lines.push('---');
lines.push('');
lines.push('*Generated by organism-alpha-bot 👑 · [Fleet Census](./fleet-census.json)*');

fs.writeFileSync(path.join(DOCS, 'fleet-report.md'), lines.join('\n'));
console.log(`✅ Fleet report written → docs/fleet-report.md`);
console.log(`   ${census.totalBots} bots · ${census.healthy} healthy · ${totalScripts} total scripts`);

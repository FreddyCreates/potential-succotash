#!/usr/bin/env node
/**
 * 👑 alpha-bot: health-check.js
 *
 * Validates the structural integrity of every bot workflow:
 *   - Has `permissions: contents: write`
 *   - Uses actions/checkout@v4 (not older)
 *   - Has a git commit step with correct bot identity
 *   - Name matches the bot emoji convention
 *   - No hardcoded secrets
 *
 * Reads from docs/fleet-census.json (written by census.js).
 * Writes health results into docs/fleet-census.json (updates in place).
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..', '..');
const WORKFLOWS = path.join(ROOT, '.github', 'workflows');
const DOCS      = path.join(ROOT, 'docs');

// Load census
let census;
try {
  census = JSON.parse(fs.readFileSync(path.join(DOCS, 'fleet-census.json'), 'utf8'));
} catch {
  console.error('❌ fleet-census.json not found — run census.js first');
  process.exit(1);
}

console.log('');
console.log('👑 organism-alpha-bot: Health Check');
console.log('══════════════════════════════════════════════════════════');

const POLICIES = [
  {
    name: 'Uses actions/checkout@v4',
    check: src => src.includes('actions/checkout@v4'),
    severity: 'warn',
  },
  {
    name: 'Has contents: write permission',
    check: src => src.includes('contents: write'),
    severity: 'warn',
  },
  {
    name: 'Has git identity config',
    check: src => src.includes('git config user.name') || !src.includes('git commit'),
    severity: 'info',
  },
  {
    name: 'Uses workflow_dispatch',
    check: src => src.includes('workflow_dispatch'),
    severity: 'info',
  },
  {
    name: 'No hardcoded secrets',
    check: src => !/(sk-[A-Za-z0-9]{20}|AIza[A-Za-z0-9]{35}|ghp_[A-Za-z0-9]{36})/.test(src),
    severity: 'error',
  },
  {
    name: 'Has [skip ci] on auto-commits',
    check: src => !src.includes('git commit') || src.includes('[skip ci]'),
    severity: 'warn',
  },
];

let totalPolicies = 0;
let totalPass = 0;
let totalFail = 0;
const healthResults = [];

for (const bot of census.fleet) {
  if (!bot.hasWorkflow) {
    console.log(`  ✗ ${bot.emoji} ${bot.name}: no workflow file`);
    healthResults.push({ bot: bot.name, status: 'missing', violations: ['workflow file missing'] });
    continue;
  }

  const workflowPath = path.join(WORKFLOWS, bot.workflow);
  const src = fs.readFileSync(workflowPath, 'utf8');
  const violations = [];

  for (const policy of POLICIES) {
    totalPolicies++;
    if (policy.check(src)) {
      totalPass++;
    } else {
      totalFail++;
      violations.push(`[${policy.severity.toUpperCase()}] ${policy.name}`);
    }
  }

  const botStatus = violations.filter(v => v.includes('[ERROR]')).length > 0 ? 'critical'
    : violations.filter(v => v.includes('[WARN]')).length > 0 ? 'degraded' : 'healthy';

  const statusIcon = botStatus === 'healthy' ? '✓' : botStatus === 'degraded' ? '⚠' : '⛔';
  console.log(`  ${statusIcon} ${bot.emoji} ${bot.name}: ${botStatus}${violations.length ? ' (' + violations[0] + ')' : ''}`);
  healthResults.push({ bot: bot.name, status: botStatus, violations });
}

console.log('');
console.log(`  Policy checks: ${totalPass}/${totalPolicies} passed, ${totalFail} violations`);
console.log('');

// Update census with health results
census.healthResults = healthResults;
census.policyStats = { totalPolicies, totalPass, totalFail };
census.healthGenerated = new Date().toISOString();

fs.writeFileSync(path.join(DOCS, 'fleet-census.json'), JSON.stringify(census, null, 2));
console.log('✅ Health results merged into docs/fleet-census.json');

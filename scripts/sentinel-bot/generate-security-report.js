#!/usr/bin/env node
/**
 * 🛡️ sentinel-bot: generate-security-report.js
 *
 * Aggregates all sentinel scan results into:
 *   - docs/security-report.md   — human-readable security report
 *   - docs/security-audit.json  — machine-readable audit record
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT  = path.resolve(__dirname, '..', '..');
const DOCS  = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

// Load all partial scan results
function loadJSON(file) {
  try { return JSON.parse(fs.readFileSync(path.join(DOCS, file), 'utf8')); } catch { return null; }
}

const permResults    = loadJSON('_sentinel-permissions.json');
const cspResults     = loadJSON('_sentinel-csp.json');
const secretResults  = loadJSON('_sentinel-secrets.json');
const dangerResults  = loadJSON('_sentinel-dangerous.json');

const timestamp = new Date().toISOString();

// ── Aggregate stats ───────────────────────────────────────────────────────────
const permErrors    = permResults?.findings?.flatMap(f => f.high || []) || [];
const permWarnings  = permResults?.findings?.flatMap(f => f.medium || []) || [];
const cspErrors     = cspResults?.findings?.flatMap(f => f.errors || []) || [];
const secretCount   = secretResults?.findings?.length || 0;
const dangerHigh    = dangerResults?.findings?.filter(f => f.severity === 'high') || [];
const dangerMedium  = dangerResults?.findings?.filter(f => f.severity === 'medium') || [];

const totalErrors   = permErrors.length + cspErrors.length + secretCount + dangerHigh.length;
const totalWarnings = permWarnings.length + dangerMedium.length;

const overallStatus = totalErrors === 0 ? '✅ CLEAN' : '❌ ACTION REQUIRED';

// ── Audit JSON ────────────────────────────────────────────────────────────────
const audit = {
  generated: timestamp,
  bot: 'organism-sentinel-bot',
  status: totalErrors === 0 ? 'clean' : 'action-required',
  summary: {
    totalErrors,
    totalWarnings,
    permissionErrors: permErrors.length,
    permissionWarnings: permWarnings.length,
    cspErrors: cspErrors.length,
    secretsFound: secretCount,
    dangerousHigh: dangerHigh.length,
    dangerousMedium: dangerMedium.length,
  },
  scans: {
    permissions: { ran: !!permResults, timestamp: permResults?.timestamp },
    csp:         { ran: !!cspResults,  timestamp: cspResults?.timestamp },
    secrets:     { ran: !!secretResults, timestamp: secretResults?.timestamp, filesScanned: secretResults?.scanned },
    dangerous:   { ran: !!dangerResults, timestamp: dangerResults?.timestamp, filesScanned: dangerResults?.scanned },
  },
};

fs.writeFileSync(path.join(DOCS, 'security-audit.json'), JSON.stringify(audit, null, 2));
console.log('✅ Security audit JSON written → docs/security-audit.json');

// ── Markdown report ───────────────────────────────────────────────────────────
const lines = [
  '# 🛡️ organism-sentinel-bot — Security Report',
  '',
  `**Status:** ${overallStatus}`,
  `**Generated:** ${timestamp}`,
  `**Total Errors:** ${totalErrors}`,
  `**Total Warnings:** ${totalWarnings}`,
  '',
  '## Scan Summary',
  '',
  '| Scan | Status | Errors | Warnings |',
  '|---|---|---|---|',
  `| 🔑 Permission Audit | ${permResults ? (permErrors.length === 0 ? '✅' : '❌') : '—'} | ${permErrors.length} | ${permWarnings.length} |`,
  `| 🔒 CSP Validation   | ${cspResults ? (cspErrors.length === 0 ? '✅' : '❌') : '—'} | ${cspErrors.length} | — |`,
  `| 🔍 Secret Scan      | ${secretResults ? (secretCount === 0 ? '✅' : '❌') : '—'} | ${secretCount} | — |`,
  `| ⚠️ Dangerous Code   | ${dangerResults ? (dangerHigh.length === 0 ? '✅' : '❌') : '—'} | ${dangerHigh.length} | ${dangerMedium.length} |`,
  '',
];

// Permissions section
if (permErrors.length > 0 || permWarnings.length > 0) {
  lines.push('## 🔑 Permission Findings');
  lines.push('');
  if (permErrors.length > 0) {
    lines.push('### ⛔ High Risk');
    lines.push('');
    for (const e of permErrors) lines.push(`- ${e}`);
    lines.push('');
  }
  if (permWarnings.length > 0) {
    lines.push('### ⚠️ Medium Risk');
    lines.push('');
    for (const w of permWarnings.slice(0, 10)) lines.push(`- ${w}`);
    if (permWarnings.length > 10) lines.push(`- … and ${permWarnings.length - 10} more`);
    lines.push('');
  }
} else {
  lines.push('## 🔑 Permissions\n\n✅ All extension permissions are within acceptable bounds.\n');
}

// Secrets section
if (secretCount > 0) {
  lines.push('## 🔍 Secrets Detected');
  lines.push('');
  lines.push(`⛔ **${secretCount} potential secret(s)** were found. Check \`docs/security-audit.json\` for file locations.`);
  lines.push('');
  lines.push('> **Action required:** Rotate any exposed credentials immediately. Remove from git history using `git filter-branch` or BFG Repo Cleaner.');
  lines.push('');
} else {
  lines.push('## 🔍 Secret Scan\n\n✅ No secrets detected.\n');
}

// Dangerous patterns section
if (dangerHigh.length > 0 || dangerMedium.length > 0) {
  lines.push('## ⚠️ Dangerous Code Patterns');
  lines.push('');
  if (dangerHigh.length > 0) {
    lines.push('### ⛔ High Severity');
    lines.push('');
    for (const f of dangerHigh) {
      lines.push(`- **${f.pattern}** in \`${f.file}:${f.line}\``);
      if (f.code) lines.push(`  \`${f.code}\``);
    }
    lines.push('');
  }
  if (dangerMedium.length > 0) {
    lines.push('### ⚠️ Medium Severity');
    lines.push('');
    for (const f of dangerMedium.slice(0, 10)) {
      lines.push(`- **${f.pattern}** in \`${f.file}:${f.line}\``);
    }
    if (dangerMedium.length > 10) lines.push(`- … and ${dangerMedium.length - 10} more`);
    lines.push('');
  }
} else {
  lines.push('## ⚠️ Dangerous Patterns\n\n✅ No dangerous patterns detected in protocols/SDK code.\n');
}

lines.push('---');
lines.push('');
lines.push('*Generated by organism-sentinel-bot 🛡️ · [Audit JSON](./security-audit.json)*');

fs.writeFileSync(path.join(DOCS, 'security-report.md'), lines.join('\n'));
console.log('✅ Security report written → docs/security-report.md');

if (totalErrors > 0) {
  console.log(`\n❌ Security audit: ${totalErrors} error(s) require action.`);
  process.exit(1);
}

#!/usr/bin/env node
/**
 * 🔄 deps-bot: run-audit.js
 *
 * Runs `npm audit --json` in any directories that have a node_modules
 * installation (i.e., where audit can be run). Parses the output and
 * attaches vulnerability counts to the package data.
 *
 * In environments without npm or node_modules installed (typical CI),
 * gracefully falls back to a "not auditable" status and logs the reason.
 *
 * Output: merged into docs/_deps-packages.json
 */

'use strict';

const fs           = require('fs');
const path         = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

// Load packages
let pkgDoc;
try {
  pkgDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_deps-packages.json'), 'utf8'));
} catch {
  console.error('❌ _deps-packages.json not found');
  process.exit(1);
}

console.log('');
console.log('🔄 organism-deps-bot: Security Audit');
console.log('══════════════════════════════════════════════════════════');

const auditResults = [];

for (const pkg of pkgDoc.packages) {
  const pkgDir = path.join(ROOT, path.dirname(pkg.relPath));
  const hasNodeModules = fs.existsSync(path.join(pkgDir, 'node_modules'));

  if (!hasNodeModules) {
    auditResults.push({
      package: pkg.name,
      status: 'not-installed',
      vulnerabilities: null,
      note: 'node_modules not found — run npm install first',
    });
    console.log(`  — ${pkg.name}: skipped (not installed)`);
    continue;
  }

  try {
    const auditOutput = execSync('npm audit --json 2>/dev/null || true', {
      cwd: pkgDir,
      encoding: 'utf8',
      timeout: 30000,
    });

    let auditData = {};
    try { auditData = JSON.parse(auditOutput); } catch { /* not JSON */ }

    const vulns = auditData.metadata?.vulnerabilities || {};
    const total = (vulns.critical || 0) + (vulns.high || 0) + (vulns.moderate || 0) + (vulns.low || 0);

    auditResults.push({
      package: pkg.name,
      status: total > 0 ? 'vulnerabilities-found' : 'clean',
      vulnerabilities: vulns,
      total,
    });

    const icon = total === 0 ? '✓' : '⚠';
    console.log(`  ${icon} ${pkg.name}: ${total === 0 ? 'clean' : total + ' vulnerabilities'}`);
  } catch {
    auditResults.push({ package: pkg.name, status: 'audit-failed', vulnerabilities: null });
    console.log(`  ✗ ${pkg.name}: audit failed`);
  }
}

const totalVulns = auditResults.reduce((a, r) => a + (r.total || 0), 0);
console.log('');
console.log(`  Total vulnerabilities across audited packages: ${totalVulns}`);
console.log('');

pkgDoc.auditResults = auditResults;
pkgDoc.auditTotal = totalVulns;
pkgDoc.auditGenerated = new Date().toISOString();

fs.writeFileSync(path.join(DOCS, '_deps-packages.json'), JSON.stringify(pkgDoc, null, 2));
console.log('✅ Audit results merged → docs/_deps-packages.json');

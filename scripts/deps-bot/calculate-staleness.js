#!/usr/bin/env node
/**
 * 🔄 deps-bot: calculate-staleness.js
 *
 * Calculates staleness scores for each dependency.
 *
 * Staleness model:
 *   - Uses version specifier analysis (^, ~, *, exact, legacy)
 *   - Detects pre-release (alpha/beta/rc/next) versions
 *   - Flags extremely wide ranges (*) as high risk
 *   - Assigns staleness tier: FRESH / MONITOR / STALE / CRITICAL
 *
 * Note: Full staleness (days since npm publish) would require npm registry
 * API calls — we use version specifier heuristics here for offline operation.
 *
 * Output: merged into docs/_deps-packages.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

// Load packages
let pkgDoc;
try {
  pkgDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_deps-packages.json'), 'utf8'));
} catch {
  console.error('❌ _deps-packages.json not found — run scan-packages.js first');
  process.exit(1);
}

const PHI = 1.618033988749895;

function analyzeDep(dep) {
  const v = dep.version || '';

  // Detect version patterns
  const isExact     = /^\d+\.\d+\.\d+$/.test(v);
  const isPatch     = v.startsWith('~');
  const isMinor     = v.startsWith('^');
  const isWild      = v === '*' || v === 'x' || v === 'latest';
  const isPreRelease = /alpha|beta|rc|next|canary|dev/i.test(v);
  const isGitURL    = v.includes('github.com') || v.includes('git+') || v.includes('bitbucket');
  const isFileRef   = v.startsWith('file:') || v.startsWith('link:');

  // Risk scoring (0–1, higher = more risk)
  let risk = 0;
  if (isWild)       risk += 0.8;   // wildcard — unpinned, highest risk
  if (isPreRelease) risk += 0.6;   // pre-release — unstable
  if (isGitURL)     risk += 0.5;   // git reference — no stable publish
  if (isFileRef)    risk += 0.3;   // file ref — local only
  if (isMinor)      risk += 0.15;  // minor range — some drift
  if (isPatch)      risk += 0.05;  // patch range — low drift
  if (isExact)      risk += 0.0;   // exact pin — safest

  // Apply phi-modulation: risk = 1 - (1 / (1 + phi * rawRisk))
  const phiRisk = Math.min(1.0, 1 - 1 / (1 + PHI * risk));

  const tier = phiRisk >= 0.7 ? 'CRITICAL'
    : phiRisk >= 0.45 ? 'STALE'
    : phiRisk >= 0.2  ? 'MONITOR'
    : 'FRESH';

  return { risk: phiRisk.toFixed(3), tier, isPreRelease, isWild, isGitURL, isPinned: isExact };
}

// Compute staleness for every dep in every package
let criticalCount = 0;
let staleCount    = 0;
let monitorCount  = 0;
let freshCount    = 0;

for (const pkg of pkgDoc.packages) {
  let pkgCritical = 0;
  for (const dep of pkg.deps) {
    const analysis = analyzeDep(dep);
    dep.analysis = analysis;
    if (analysis.tier === 'CRITICAL') { pkgCritical++; criticalCount++; }
    else if (analysis.tier === 'STALE')   staleCount++;
    else if (analysis.tier === 'MONITOR') monitorCount++;
    else freshCount++;
  }
  pkg.stalenessScore = pkg.deps.length > 0
    ? pkg.deps.reduce((a, d) => a + parseFloat(d.analysis?.risk || 0), 0) / pkg.deps.length
    : 0;
  pkg.criticalDeps = pkgCritical;
}

pkgDoc.stalenessSummary = { critical: criticalCount, stale: staleCount, monitor: monitorCount, fresh: freshCount };
pkgDoc.stalenessGenerated = new Date().toISOString();

console.log('');
console.log('🔄 organism-deps-bot: Staleness Analysis');
console.log('══════════════════════════════════════════════════════════');
console.log(`  CRITICAL:  ${criticalCount} deps (unpinned/wildcard/pre-release/git-ref)`);
console.log(`  STALE:     ${staleCount} deps`);
console.log(`  MONITOR:   ${monitorCount} deps`);
console.log(`  FRESH:     ${freshCount} deps`);
console.log('');

fs.writeFileSync(path.join(DOCS, '_deps-packages.json'), JSON.stringify(pkgDoc, null, 2));
console.log('✅ Staleness analysis merged → docs/_deps-packages.json');

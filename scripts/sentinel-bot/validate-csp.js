#!/usr/bin/env node
/**
 * 🛡️ sentinel-bot: validate-csp.js
 *
 * Validates Content Security Policy in all extension manifests.
 * Flags:
 *   - Missing CSP (extension_pages)
 *   - unsafe-eval in CSP
 *   - unsafe-inline scripts in CSP
 *   - Wildcard sources (*)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const EXT_DIR = path.resolve(__dirname, '..', '..', 'extensions');

const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows')
  .map(d => d.name)
  .sort();

let errors = 0;
let warnings = 0;
let clean = 0;
const findings = [];

console.log('');
console.log('🛡️ organism-sentinel-bot: CSP Validation');
console.log('══════════════════════════════════════════════════════════');

for (const dir of extDirs) {
  const manifestPath = path.join(EXT_DIR, dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) continue;

  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { continue; }

  const csp = manifest.content_security_policy;
  const extFindings = { extension: dir, errors: [], warnings: [] };

  if (!csp) {
    // No CSP defined — rely on MV3 default (which is reasonable)
    // Only note it, don't fail
    extFindings.warnings.push('No explicit CSP defined (using MV3 defaults)');
    warnings++;
  } else {
    const cspStr = typeof csp === 'string' ? csp :
      (csp.extension_pages || csp.sandbox || JSON.stringify(csp));

    if (cspStr.includes("'unsafe-eval'")) {
      extFindings.errors.push("CSP contains 'unsafe-eval' — forbidden in MV3");
      errors++;
    }
    if (cspStr.includes("'unsafe-inline'") && cspStr.includes('script-src')) {
      extFindings.errors.push("CSP script-src contains 'unsafe-inline'");
      errors++;
    }
    if (/script-src\s+[^;]*\*/.test(cspStr)) {
      extFindings.errors.push('CSP script-src contains wildcard source (*)');
      errors++;
    }
    if (/object-src\s+[^;]*\*/.test(cspStr)) {
      extFindings.errors.push('CSP object-src contains wildcard source (*)');
      errors++;
    }
  }

  if (extFindings.errors.length > 0) {
    console.log(`  ⛔ ${dir}:`);
    for (const e of extFindings.errors) console.log(`    ↳ ${e}`);
  } else if (extFindings.warnings.length > 0) {
    // Suppress per-extension "no CSP" warnings to keep output clean;
    // they'll be counted in summary
    clean++;
  } else {
    console.log(`  ✓ ${dir}`);
    clean++;
  }

  findings.push(extFindings);
}

console.log('');
console.log(`  ${clean} clean/default, ${errors} errors, ${warnings} info notes (${extDirs.length} extensions)`);

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_sentinel-csp.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), findings }, null, 2),
);

if (errors > 0) {
  console.log('\n❌ CSP violations detected.');
  process.exit(1);
}

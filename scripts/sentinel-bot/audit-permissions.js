#!/usr/bin/env node
/**
 * 🛡️ sentinel-bot: audit-permissions.js
 *
 * Audits all extension manifests for dangerous or overly-broad permissions.
 * Flags:
 *   - <all_urls> host permission
 *   - tabs, history, bookmarks, nativeMessaging (explain why)
 *   - debugger, proxy (high risk)
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const EXT_DIR = path.resolve(__dirname, '..', '..', 'extensions');

const HIGH_RISK = new Set(['debugger', 'proxy', 'nativeMessaging']);
const MEDIUM_RISK = new Set(['tabs', 'history', 'bookmarks', 'cookies', 'webRequest', 'management']);
const BROAD_HOSTS = ['<all_urls>', 'http://*/*', 'https://*/*', '*://*/*'];

const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows')
  .map(d => d.name)
  .sort();

let errors = 0;
let warnings = 0;
let clean = 0;
const findings = [];

console.log('');
console.log('🛡️ organism-sentinel-bot: Permission Audit');
console.log('══════════════════════════════════════════════════════════');

for (const dir of extDirs) {
  const manifestPath = path.join(EXT_DIR, dir, 'manifest.json');
  if (!fs.existsSync(manifestPath)) continue;

  let manifest;
  try { manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8')); } catch { continue; }

  const perms = new Set([
    ...(manifest.permissions || []),
    ...(manifest.optional_permissions || []),
  ]);
  const hostPerms = [
    ...(manifest.host_permissions || []),
    ...(manifest.content_scripts || []).flatMap(cs => cs.matches || []),
  ];

  const high = [...perms].filter(p => HIGH_RISK.has(p));
  const medium = [...perms].filter(p => MEDIUM_RISK.has(p));
  const broadHosts = hostPerms.filter(h => BROAD_HOSTS.includes(h));

  const extFindings = { extension: dir, high: [], medium: [], info: [] };

  for (const p of high) {
    extFindings.high.push(`HIGH RISK permission: "${p}"`);
    errors++;
  }
  for (const p of medium) {
    extFindings.medium.push(`Broad permission: "${p}" — verify necessity`);
    warnings++;
  }
  for (const h of broadHosts) {
    extFindings.medium.push(`Broad host access: "${h}"`);
    warnings++;
  }

  if (extFindings.high.length > 0) {
    console.log(`  ⛔ ${dir}:`);
    for (const f of extFindings.high) console.log(`    ↳ ${f}`);
  } else if (extFindings.medium.length > 0) {
    console.log(`  ⚠ ${dir}: ${extFindings.medium[0]}`);
  } else {
    console.log(`  ✓ ${dir}`);
    clean++;
  }

  findings.push(extFindings);
}

console.log('');
console.log(`  ${clean} clean, ${errors} high-risk, ${warnings} warnings (${extDirs.length} extensions)`);

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_sentinel-permissions.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), findings }, null, 2),
);

// High risk = exit 1
if (errors > 0) {
  console.log('\n❌ High-risk permissions detected. Review required.');
  process.exit(1);
}

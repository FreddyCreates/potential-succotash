#!/usr/bin/env node
/**
 * 💰 economy-bot: calculate-coverage.js
 *
 * Calculates coverage across the organism's asset ecosystem:
 *   - SDK coverage: what % of extensions reference an SDK
 *   - Protocol coverage: what % of extensions + SDKs wire a protocol
 *   - Register coverage: what % of extensions have a CSV register entry
 *
 * Reads docs/_economy-assets.json (from scan-assets.js).
 * Writes coverage results back into docs/_economy-assets.json.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

// Load assets
let assetDoc;
try {
  assetDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_economy-assets.json'), 'utf8'));
} catch {
  console.error('❌ _economy-assets.json not found — run scan-assets.js first');
  process.exit(1);
}

const { assets } = assetDoc;

// ── SDK coverage: extensions that reference any SDK in package.json or background.js ─
let extWithSDK = 0;
for (const ext of assets.extensions) {
  const extPath = path.join(ROOT, 'extensions', ext.slug);
  // Check background.js or any .ts for SDK references
  const files = fs.readdirSync(extPath).filter(f => f.endsWith('.js') || f.endsWith('.ts'));
  let found = false;
  for (const f of files) {
    try {
      const src = fs.readFileSync(path.join(extPath, f), 'utf8');
      if (assets.sdks.some(s => src.includes(s.name) || src.includes(s.slug))) {
        found = true; break;
      }
    } catch {}
  }
  if (found) extWithSDK++;
}
const sdkCoverage = assets.extensions.length > 0
  ? Math.round((extWithSDK / assets.extensions.length) * 100) : 0;

// ── Protocol coverage: extensions + SDKs that reference a protocol ────────────
let assetsWithProtocol = 0;
const allChecked = [...assets.extensions.map(e => ({ dir: path.join(ROOT, 'extensions', e.slug), type: 'ext' })),
                    ...assets.sdks.map(s => ({ dir: path.join(ROOT, 'sdk', s.slug), type: 'sdk' }))];

const protoSlugs = assets.protocols.map(p => p.slug);

for (const { dir } of allChecked) {
  try {
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.js') || f.endsWith('.ts') || f.endsWith('.json'));
    let found = false;
    for (const f of files) {
      try {
        const src = fs.readFileSync(path.join(dir, f), 'utf8');
        if (protoSlugs.some(slug => src.includes(slug))) { found = true; break; }
      } catch {}
    }
    if (found) assetsWithProtocol++;
  } catch {}
}
const protocolCoverage = allChecked.length > 0
  ? Math.round((assetsWithProtocol / allChecked.length) * 100) : 0;

// ── Register coverage: extensions that have a row in AI_Extensions_Register.csv ──
let extWithRegister = 0;
const csvPath = path.join(ROOT, 'AI_Extensions_Register.csv');
let registerNames = new Set();
if (fs.existsSync(csvPath)) {
  const lines = fs.readFileSync(csvPath, 'utf8').split('\n').slice(1).filter(l => l.trim());
  for (const line of lines) {
    const cols = line.split(',');
    if (cols[1]) registerNames.add(cols[1].trim().toLowerCase());
  }
}
for (const ext of assets.extensions) {
  if (registerNames.has(ext.name.toLowerCase())) extWithRegister++;
}
const registerCoverage = assets.extensions.length > 0
  ? Math.round((extWithRegister / assets.extensions.length) * 100) : 0;

// ── Overall coverage ──────────────────────────────────────────────────────────
const overallCoverage = Math.round((sdkCoverage + protocolCoverage + registerCoverage) / 3);

console.log('');
console.log('💰 organism-economy-bot: Coverage Analysis');
console.log('══════════════════════════════════════════════════════════');
console.log(`  SDK Coverage:      ${sdkCoverage}% (${extWithSDK}/${assets.extensions.length} extensions reference an SDK)`);
console.log(`  Protocol Coverage: ${protocolCoverage}% (${assetsWithProtocol}/${allChecked.length} assets wire a protocol)`);
console.log(`  Register Coverage: ${registerCoverage}% (${extWithRegister}/${assets.extensions.length} extensions in register)`);
console.log(`  Overall:           ${overallCoverage}%`);
console.log('');

// Update asset doc
assetDoc.coverage = {
  sdkCoverage,
  protocolCoverage,
  registerCoverage,
  overallCoverage,
  extWithSDK,
  assetsWithProtocol,
  extWithRegister,
};

fs.writeFileSync(path.join(DOCS, '_economy-assets.json'), JSON.stringify(assetDoc, null, 2));
console.log('✅ Coverage analysis merged → docs/_economy-assets.json');

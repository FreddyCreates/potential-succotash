#!/usr/bin/env node
/**
 * 💰 economy-bot: scan-assets.js
 *
 * Scans all organism assets and calculates an economic inventory:
 *   - Extensions (from extensions/ directory + CSV register)
 *   - SDKs (from sdk/ directory)
 *   - Protocols (from protocols/ directory + CSV register)
 *   - CSV Registers (root-level .csv files)
 *
 * Complexity scoring weights:
 *   - SDK: 5 pts (most complex, publishable)
 *   - Protocol: 3 pts (core intelligence)
 *   - Extension (Vite): 4 pts (complex build)
 *   - Extension (simple): 2 pts
 *   - CSV register: 1 pt
 *
 * Output: docs/_economy-assets.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const DOCS    = path.resolve(ROOT, 'docs');
const EXT_DIR = path.resolve(ROOT, 'extensions');
const SDK_DIR = path.resolve(ROOT, 'sdk');
const PRT_DIR = path.resolve(ROOT, 'protocols');

fs.mkdirSync(DOCS, { recursive: true });

const assets = { extensions: [], sdks: [], protocols: [], csvRegisters: [] };
let totalComplexity = 0;

// ── Extensions ────────────────────────────────────────────────────────────────
const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows')
  .map(d => d.name);

for (const dir of extDirs) {
  const extPath = path.join(EXT_DIR, dir);
  const manifestPath = path.join(extPath, 'manifest.json');
  const hasVite = fs.existsSync(path.join(extPath, 'package.json'));

  let name = dir, version = '—', description = '';
  if (fs.existsSync(manifestPath)) {
    try {
      const m = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
      name = m.name || dir;
      version = m.version || '—';
      description = m.description || '';
    } catch {}
  }

  const complexity = hasVite ? 4 : 2;
  totalComplexity += complexity;

  // Count JS files
  let fileCount = 0;
  try {
    fileCount = fs.readdirSync(extPath).filter(f => f.endsWith('.js') || f.endsWith('.ts')).length;
  } catch {}

  assets.extensions.push({ slug: dir, name, version, description, hasVite, complexity, fileCount });
}

// ── SDKs ──────────────────────────────────────────────────────────────────────
const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);

for (const sdk of sdkDirs) {
  const pkgPath = path.join(SDK_DIR, sdk, 'package.json');
  let pkg = {};
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch {}

  // Count exports
  let exportCount = 0;
  const mainPath = pkg.main ? path.join(SDK_DIR, sdk, pkg.main) : null;
  if (mainPath && fs.existsSync(mainPath)) {
    const src = fs.readFileSync(mainPath, 'utf8');
    exportCount = (src.match(/^export\s/gm) || []).length + (src.match(/module\.exports/g) || []).length;
  }

  const complexity = 5;
  totalComplexity += complexity;

  assets.sdks.push({
    slug: sdk,
    name: pkg.name || sdk,
    version: pkg.version || '—',
    description: pkg.description || '',
    license: pkg.license || '—',
    exportCount,
    complexity,
  });
}

// ── Protocols ─────────────────────────────────────────────────────────────────
const protoFiles = fs.readdirSync(PRT_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js');

for (const file of protoFiles) {
  const src = fs.readFileSync(path.join(PRT_DIR, file), 'utf8');
  const classMatch = src.match(/class\s+(\w+)/);
  const methodCount = (src.match(/^\s{2,4}\w+\s*\(/gm) || []).length;
  const lineCount = src.split('\n').length;

  const complexity = 3;
  totalComplexity += complexity;

  assets.protocols.push({
    file,
    slug: path.basename(file, '.js'),
    className: classMatch?.[1] || '—',
    methodCount,
    lineCount,
    hasPHI: src.includes('PHI'),
    hasHeartbeat: src.includes('HEARTBEAT') || src.includes('873'),
    complexity,
  });
}

// ── CSV Registers ─────────────────────────────────────────────────────────────
const csvFiles = fs.readdirSync(ROOT).filter(f => f.endsWith('.csv'));

for (const csv of csvFiles) {
  const content = fs.readFileSync(path.join(ROOT, csv), 'utf8');
  const lines = content.split('\n').filter(l => l.trim());
  const rowCount = Math.max(0, lines.length - 1); // minus header

  const complexity = 1;
  totalComplexity += complexity;

  assets.csvRegisters.push({
    file: csv,
    name: csv.replace('_Register.csv', '').replace(/_/g, ' '),
    rowCount,
    columns: lines[0] ? lines[0].split(',').length : 0,
    complexity,
  });
}

// ── Summary ───────────────────────────────────────────────────────────────────
const total = assets.extensions.length + assets.sdks.length +
              assets.protocols.length + assets.csvRegisters.length;

console.log('');
console.log('💰 organism-economy-bot: Asset Scan');
console.log('══════════════════════════════════════════════════════════');
console.log(`  Extensions:  ${assets.extensions.length}`);
console.log(`  SDKs:        ${assets.sdks.length}`);
console.log(`  Protocols:   ${assets.protocols.length}`);
console.log(`  CSV Registers: ${assets.csvRegisters.length}`);
console.log(`  ──────────────────────────────`);
console.log(`  Total Assets:  ${total}`);
console.log(`  Complexity Score: ${totalComplexity}`);
console.log('');

const assetDoc = {
  generated: new Date().toISOString(),
  bot: 'organism-economy-bot',
  summary: {
    total,
    extensions: assets.extensions.length,
    sdks: assets.sdks.length,
    protocols: assets.protocols.length,
    csvRegisters: assets.csvRegisters.length,
    totalComplexity,
  },
  assets,
};

fs.writeFileSync(path.join(DOCS, '_economy-assets.json'), JSON.stringify(assetDoc, null, 2));
console.log('✅ Asset scan written → docs/_economy-assets.json');

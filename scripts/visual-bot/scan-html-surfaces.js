#!/usr/bin/env node
/**
 * 📸 visual-bot: scan-html-surfaces.js
 *
 * Discovers all HTML entry points in the organism:
 *   - Root-level .html files
 *   - dist/webapp/ HTML
 *   - Extension HTML pages (popup, sidepanel, options, offscreen)
 *
 * Output: docs/_visual-surfaces.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist/learning', '__pycache__']);

const surfaces = [];

// ── Root-level HTML ───────────────────────────────────────────────────────────
for (const file of fs.readdirSync(ROOT)) {
  if (file.endsWith('.html')) {
    const stat = fs.statSync(path.join(ROOT, file));
    surfaces.push({
      id: `root:${file}`,
      file,
      relPath: file,
      type: 'root',
      sizeBytes: stat.size,
    });
  }
}

// ── Extension HTML ────────────────────────────────────────────────────────────
const EXT_DIR = path.join(ROOT, 'extensions');
if (fs.existsSync(EXT_DIR)) {
  for (const ext of fs.readdirSync(EXT_DIR, { withFileTypes: true })) {
    if (!ext.isDirectory()) continue;
    const extPath = path.join(EXT_DIR, ext.name);
    for (const file of fs.readdirSync(extPath)) {
      if (file.endsWith('.html')) {
        const stat = fs.statSync(path.join(extPath, file));
        surfaces.push({
          id: `ext:${ext.name}:${file}`,
          file: `extensions/${ext.name}/${file}`,
          relPath: path.join('extensions', ext.name, file),
          type: 'extension',
          extension: ext.name,
          sizeBytes: stat.size,
        });
      }
    }
  }
}

// ── dist/webapp HTML ─────────────────────────────────────────────────────────
const WEBAPP_DIR = path.join(ROOT, 'dist', 'webapp');
if (fs.existsSync(WEBAPP_DIR)) {
  for (const file of fs.readdirSync(WEBAPP_DIR)) {
    if (file.endsWith('.html')) {
      const stat = fs.statSync(path.join(WEBAPP_DIR, file));
      surfaces.push({
        id: `webapp:${file}`,
        file: `dist/webapp/${file}`,
        relPath: path.join('dist', 'webapp', file),
        type: 'webapp',
        sizeBytes: stat.size,
      });
    }
  }
}

console.log('');
console.log('📸 organism-visual-bot: HTML Surface Scan');
console.log('══════════════════════════════════════════════════════════');
console.log(`  Root HTML:        ${surfaces.filter(s => s.type === 'root').length}`);
console.log(`  Extension HTML:   ${surfaces.filter(s => s.type === 'extension').length}`);
console.log(`  Webapp HTML:      ${surfaces.filter(s => s.type === 'webapp').length}`);
console.log(`  Total surfaces:   ${surfaces.length}`);
console.log('');

const surfaceDoc = {
  scanned: new Date().toISOString(),
  bot: 'organism-visual-bot',
  totalSurfaces: surfaces.length,
  surfaces,
};

fs.writeFileSync(path.join(DOCS, '_visual-surfaces.json'), JSON.stringify(surfaceDoc, null, 2));
console.log('✅ HTML surfaces written → docs/_visual-surfaces.json');

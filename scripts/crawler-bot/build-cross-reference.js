#!/usr/bin/env node
/**
 * 🕷️ crawler-bot: build-cross-reference.js
 *
 * Builds a cross-reference index across the organism:
 *   - Which protocol files import which other protocols
 *   - Which SDK files reference which protocols
 *   - Which extensions reference which SDK or protocol names
 *   - Symbol exports per module (class/function/const exports)
 *
 * Output: docs/_cross-reference.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const DOCS    = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.cache', '__pycache__']);
const TEXT_EXTS = new Set(['.js', '.ts', '.tsx', '.mjs', '.py', '.java']);

// ── Parse imports and exports from a source file ──────────────────────────────
function parseFile(filePath) {
  let src;
  try { src = fs.readFileSync(filePath, 'utf8'); } catch { return null; }

  const imports = new Set();
  const exports = [];

  // ES imports
  const importRe = /import\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  let m;
  while ((m = importRe.exec(src)) !== null) imports.add(m[1]);

  // require()
  const requireRe = /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g;
  while ((m = requireRe.exec(src)) !== null) imports.add(m[1]);

  // export from
  const reExportRe = /export\s+.*?\s+from\s+['"]([^'"]+)['"]/g;
  while ((m = reExportRe.exec(src)) !== null) imports.add(m[1]);

  // Exported symbols
  const exportClassRe = /^export\s+(?:default\s+)?class\s+(\w+)/gm;
  while ((m = exportClassRe.exec(src)) !== null) exports.push({ kind: 'class', name: m[1] });

  const exportFnRe = /^export\s+(?:async\s+)?function\s+(\w+)/gm;
  while ((m = exportFnRe.exec(src)) !== null) exports.push({ kind: 'function', name: m[1] });

  const exportConstRe = /^export\s+const\s+(\w+)/gm;
  while ((m = exportConstRe.exec(src)) !== null) exports.push({ kind: 'const', name: m[1] });

  // Named exports
  const namedExportRe = /^module\.exports\s*=\s*\{([^}]+)\}/m;
  const namedMatch = namedExportRe.exec(src);
  if (namedMatch) {
    const names = namedMatch[1].split(',').map(n => n.trim().split(':')[0].trim()).filter(Boolean);
    for (const n of names) exports.push({ kind: 'named', name: n });
  }

  return { imports: [...imports], exports };
}

// ── Scan directories ──────────────────────────────────────────────────────────
function scanDir(dir, maxFiles = 200) {
  const results = [];
  let count = 0;

  function walk(d) {
    if (count >= maxFiles) return;
    let entries;
    try { entries = fs.readdirSync(d, { withFileTypes: true }); } catch { return; }

    for (const entry of entries) {
      if (SKIP_DIRS.has(entry.name)) continue;
      const fullPath = path.join(d, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (TEXT_EXTS.has(path.extname(entry.name).toLowerCase())) {
        const parsed = parseFile(fullPath);
        if (parsed) {
          results.push({
            file: path.relative(ROOT, fullPath),
            imports: parsed.imports,
            exports: parsed.exports,
          });
          count++;
        }
      }
    }
  }

  walk(dir);
  return results;
}

console.log('');
console.log('🕷️ organism-crawler-bot: Cross-Reference Build');
console.log('══════════════════════════════════════════════════════════');

const SCAN_DIRS = [
  { name: 'protocols', dir: path.join(ROOT, 'protocols') },
  { name: 'sdk',       dir: path.join(ROOT, 'sdk') },
  { name: 'organism',  dir: path.join(ROOT, 'organism') },
];

const crossRef = {};
let totalImports = 0;
let totalExports = 0;

for (const { name, dir } of SCAN_DIRS) {
  if (!fs.existsSync(dir)) continue;
  const files = scanDir(dir);
  crossRef[name] = files;
  const imports = files.reduce((a, f) => a + f.imports.length, 0);
  const exports = files.reduce((a, f) => a + f.exports.length, 0);
  totalImports += imports;
  totalExports += exports;
  console.log(`  ✓ ${name}: ${files.length} files, ${imports} imports, ${exports} exports`);
}

// Build global symbol index
const symbolIndex = {};
for (const [section, files] of Object.entries(crossRef)) {
  for (const f of files) {
    for (const exp of f.exports) {
      if (!symbolIndex[exp.name]) symbolIndex[exp.name] = [];
      symbolIndex[exp.name].push({ file: f.file, kind: exp.kind, section });
    }
  }
}

console.log('');
console.log(`  Total: ${Object.values(crossRef).flat().length} files analyzed`);
console.log(`  Imports: ${totalImports} · Exports: ${totalExports}`);
console.log(`  Unique symbols: ${Object.keys(symbolIndex).length}`);
console.log('');

const xrefDoc = {
  built: new Date().toISOString(),
  bot: 'organism-crawler-bot',
  summary: {
    totalFiles: Object.values(crossRef).flat().length,
    totalImports,
    totalExports,
    uniqueSymbols: Object.keys(symbolIndex).length,
  },
  crossRef,
  symbolIndex,
};

fs.writeFileSync(path.join(DOCS, '_cross-reference.json'), JSON.stringify(xrefDoc, null, 2));
console.log('✅ Cross-reference index → docs/_cross-reference.json');

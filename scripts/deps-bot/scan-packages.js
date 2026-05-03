#!/usr/bin/env node
/**
 * 🔄 deps-bot: scan-packages.js
 *
 * Discovers and inventories all package.json files across the organism:
 *   - Extensions package.json files
 *   - SDKs package.json files
 *   - Desktop package.json
 *   - Root package.json if exists
 *
 * For each package: reads name, version, dependency count,
 * script count, and dep list.
 *
 * Output: docs/_deps-packages.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const SKIP_DIRS = new Set(['node_modules', '.git', 'dist', '.cache']);

function findPackageJsonFiles(dir, maxDepth = 3, depth = 0) {
  if (depth > maxDepth) return [];
  const results = [];
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return []; }

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      results.push(...findPackageJsonFiles(fullPath, maxDepth, depth + 1));
    } else if (entry.name === 'package.json') {
      results.push(fullPath);
    }
  }
  return results;
}

const pkgFiles = findPackageJsonFiles(ROOT);
const packages = [];

console.log('');
console.log('🔄 organism-deps-bot: Package Scan');
console.log('══════════════════════════════════════════════════════════');

for (const pkgPath of pkgFiles) {
  let pkg = {};
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch { continue; }

  const relPath = path.relative(ROOT, pkgPath);
  const deps = { ...pkg.dependencies, ...pkg.devDependencies };
  const depList = Object.entries(deps).map(([name, version]) => ({ name, version }));

  packages.push({
    relPath,
    name: pkg.name || path.dirname(relPath),
    version: pkg.version || '—',
    description: pkg.description || '',
    dependencies: Object.keys(pkg.dependencies || {}).length,
    devDependencies: Object.keys(pkg.devDependencies || {}).length,
    totalDeps: depList.length,
    scripts: Object.keys(pkg.scripts || {}).length,
    deps: depList,
  });

  console.log(`  ✓ ${relPath} (${depList.length} deps)`);
}

console.log('');
console.log(`  Total packages: ${packages.length}`);
console.log(`  Total dependencies: ${packages.reduce((a, p) => a + p.totalDeps, 0)}`);
console.log('');

const pkgDoc = {
  scanned: new Date().toISOString(),
  bot: 'organism-deps-bot',
  totalPackages: packages.length,
  totalDeps: packages.reduce((a, p) => a + p.totalDeps, 0),
  packages,
};

fs.writeFileSync(path.join(DOCS, '_deps-packages.json'), JSON.stringify(pkgDoc, null, 2));
console.log('✅ Package scan → docs/_deps-packages.json');

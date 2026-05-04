#!/usr/bin/env node
/**
 * 🕷️ crawler-bot: crawl-topology.js
 *
 * Crawls the entire repository and builds a topology map:
 *   - Directory tree (depth, file counts, language breakdown per dir)
 *   - File size distribution
 *   - Language breakdown (JS, TS, Python, C++, Java, Motoko, CSS, HTML)
 *   - Top-level section summary
 *
 * Skips: node_modules, .git, dist, .cache, binary files
 * Output: docs/_topology-raw.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.cache', '.dfx', 'icp-dist', '__pycache__', 'target', 'build']);
const LANG_MAP = {
  '.ts':    'TypeScript',
  '.tsx':   'TypeScript',
  '.js':    'JavaScript',
  '.mjs':   'JavaScript',
  '.py':    'Python',
  '.cpp':   'C++',
  '.cc':    'C++',
  '.h':     'C++',
  '.java':  'Java',
  '.mo':    'Motoko',
  '.css':   'CSS',
  '.html':  'HTML',
  '.json':  'JSON',
  '.md':    'Markdown',
  '.yaml':  'YAML',
  '.yml':   'YAML',
  '.sh':    'Shell',
  '.toml':  'TOML',
  '.csv':   'CSV',
};

let totalFiles = 0;
let totalBytes = 0;
const langCounts = {};
const langBytes  = {};
const sections   = [];

function crawlDir(dir, depth = 0, maxDepth = 6) {
  if (depth > maxDepth) return null;

  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return null; }

  const node = {
    name: path.basename(dir),
    relPath: path.relative(ROOT, dir),
    depth,
    files: 0,
    bytes: 0,
    dirs: 0,
    languages: {},
    children: [],
  };

  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);

    if (entry.isDirectory()) {
      node.dirs++;
      if (depth < maxDepth) {
        const child = crawlDir(fullPath, depth + 1, maxDepth);
        if (child) {
          node.children.push(child);
          node.files += child.files;
          node.bytes += child.bytes;
          // Merge language counts
          for (const [lang, count] of Object.entries(child.languages)) {
            node.languages[lang] = (node.languages[lang] || 0) + count;
          }
        }
      }
    } else {
      const ext = path.extname(entry.name).toLowerCase();
      const lang = LANG_MAP[ext] || 'Other';

      let size = 0;
      try { size = fs.statSync(fullPath).size; } catch {}

      node.files++;
      node.bytes += size;
      node.languages[lang] = (node.languages[lang] || 0) + 1;

      totalFiles++;
      totalBytes += size;
      langCounts[lang] = (langCounts[lang] || 0) + 1;
      langBytes[lang]  = (langBytes[lang]  || 0) + size;
    }
  }

  return node;
}

console.log('');
console.log('🕷️ organism-crawler-bot: Repository Topology Crawl');
console.log('══════════════════════════════════════════════════════════');
console.log('  Crawling repository...');

const topology = crawlDir(ROOT, 0, 4);

// Top-level sections summary
for (const child of (topology?.children || [])) {
  sections.push({
    name: child.name,
    files: child.files,
    bytes: child.bytes,
    dirs: child.dirs,
    topLanguage: Object.entries(child.languages).sort(([, a], [, b]) => b - a)[0]?.[0] || '—',
  });
}

console.log(`  Files crawled:  ${totalFiles}`);
console.log(`  Total size:     ${(totalBytes / 1024).toFixed(1)} KB`);
console.log(`  Top languages:  ${Object.entries(langCounts).sort(([,a],[,b])=>b-a).slice(0,3).map(([l,c])=>l+':'+c).join(', ')}`);
console.log('');

const topologyDoc = {
  crawled: new Date().toISOString(),
  bot: 'organism-crawler-bot',
  summary: {
    totalFiles,
    totalBytes,
    totalKB: Math.round(totalBytes / 1024),
    sections: sections.length,
    langCounts,
    langBytes,
  },
  sections,
  topology,
};

fs.writeFileSync(path.join(DOCS, '_topology-raw.json'), JSON.stringify(topologyDoc, null, 2));
console.log('✅ Topology crawl written → docs/_topology-raw.json');

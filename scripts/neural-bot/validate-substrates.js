#!/usr/bin/env node
/**
 * 🧠 neural-bot: validate-substrates.js
 *
 * Validates all 6 organism substrate directories:
 *   TypeScript, Python, C++, Java, Motoko, Web Workers
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ORG_DIR = path.resolve(__dirname, '..', '..', 'organism');

const SUBSTRATES = [
  {
    name: 'TypeScript',
    emoji: '🔷',
    dir: 'typescript',
    checks: [
      { type: 'dir',  path: 'src',              label: 'src/ directory' },
      { type: 'file', path: 'package.json',     label: 'package.json' },
      { type: 'file', path: 'tsconfig.json',    label: 'tsconfig.json' },
    ],
  },
  {
    name: 'Python',
    emoji: '🐍',
    dir: 'python',
    checks: [
      { type: 'file', path: 'pyproject.toml',   label: 'pyproject.toml' },
      { type: 'dir',  path: 'organism',          label: 'organism/ package' },
    ],
  },
  {
    name: 'C++',
    emoji: '⚙️',
    dir: 'cpp',
    checks: [
      { type: 'dir',  path: 'src',              label: 'src/ directory' },
    ],
  },
  {
    name: 'Java',
    emoji: '☕',
    dir: 'java',
    checks: [
      { type: 'dir',  path: 'src',              label: 'src/ directory' },
    ],
  },
  {
    name: 'Motoko (ICP)',
    emoji: '∞',
    dir: 'motoko',
    checks: [
      { type: 'dir',  path: 'src',              label: 'src/ directory' },
    ],
  },
  {
    name: 'Web Workers',
    emoji: '🌐',
    dir: 'web',
    checks: [
      { type: 'glob', pattern: '*.js',          label: '.js worker files' },
    ],
  },
];

let passed = 0;
let failed = 0;
const results = [];

console.log('');
console.log('🧠 organism-neural-bot: Substrate Validation');
console.log('══════════════════════════════════════════════════════════');

for (const substrate of SUBSTRATES) {
  const subDir = path.join(ORG_DIR, substrate.dir);
  const issues = [];

  if (!fs.existsSync(subDir)) {
    issues.push(`directory missing: organism/${substrate.dir}`);
  } else {
    for (const check of substrate.checks) {
      if (check.type === 'glob') {
        const files = fs.readdirSync(subDir).filter(f => typeof f === 'string' && f.endsWith('.js'));
        if (files.length === 0) issues.push(`no ${check.label} found`);
        continue;
      }
      const checkPath = path.join(subDir, check.path);
      if (check.type === 'file' && !fs.existsSync(checkPath)) {
        issues.push(`missing ${check.label}`);
      } else if (check.type === 'dir' && !fs.existsSync(checkPath)) {
        issues.push(`missing ${check.label}`);
      }
    }
  }

  if (issues.length === 0) {
    console.log(`  ✓ ${substrate.emoji} ${substrate.name}`);
    passed++;
    results.push({ substrate: substrate.name, dir: substrate.dir, status: 'pass', issues: [] });
  } else {
    console.log(`  ✗ ${substrate.emoji} ${substrate.name}: ${issues.join(', ')}`);
    failed++;
    results.push({ substrate: substrate.name, dir: substrate.dir, status: 'fail', issues });
  }
}

console.log('');
console.log(`  ${passed} passed, ${failed} failed (6 total substrates)`);
console.log('');

const outDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(
  path.join(outDir, '_substrate-validation.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), results }, null, 2),
);

if (failed > 0) process.exit(1);

#!/usr/bin/env node
/**
 * 🛡️ sentinel-bot: scan-dangerous-patterns.js
 *
 * Scans protocols and SDK code for dangerous JavaScript patterns:
 *   - eval() — arbitrary code execution
 *   - new Function() — same as eval
 *   - document.write() — DOM injection
 *   - innerHTML assignment — XSS risk
 *   - setTimeout/setInterval with string arg — eval-equivalent
 *   - __proto__ mutation — prototype pollution
 *
 * Extension code is explicitly excluded (these are acceptable in
 * content scripts in controlled contexts), only protocols/ and sdk/ scanned.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

const SCAN_DIRS = [
  path.join(ROOT, 'protocols'),
  path.join(ROOT, 'sdk'),
  path.join(ROOT, 'organism', 'typescript', 'src'),
];

const DANGEROUS_PATTERNS = [
  {
    name: 'eval()',
    re: /\beval\s*\(/g,
    severity: 'high',
    except: /\/\/.*eval|#.*eval/,  // allow in comments
  },
  {
    name: 'new Function()',
    re: /new\s+Function\s*\(/g,
    severity: 'high',
    except: null,
  },
  {
    name: 'document.write()',
    re: /document\.write\s*\(/g,
    severity: 'medium',
    except: null,
  },
  {
    name: 'innerHTML assignment',
    re: /\.innerHTML\s*=/g,
    severity: 'medium',
    except: /\/\/.*innerHTML/,
  },
  {
    name: '__proto__ mutation',
    re: /__proto__\s*=/g,
    severity: 'high',
    except: null,
  },
  {
    name: 'prototype pollution',
    re: /Object\.prototype\.\w+\s*=/g,
    severity: 'high',
    except: null,
  },
  {
    name: 'setTimeout with string',
    re: /setTimeout\s*\(\s*['"`]/g,
    severity: 'medium',
    except: null,
  },
  {
    name: 'setInterval with string',
    re: /setInterval\s*\(\s*['"`]/g,
    severity: 'medium',
    except: null,
  },
];

const TEXT_EXTS = new Set(['.js', '.ts', '.tsx', '.jsx', '.mjs']);
const SKIP_DIRS = new Set(['node_modules', '.git', 'dist']);

let findings = [];
let scanned = 0;

function walkDir(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }
  for (const entry of entries) {
    if (SKIP_DIRS.has(entry.name)) continue;
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkDir(fullPath);
    } else if (TEXT_EXTS.has(path.extname(entry.name))) {
      scanFile(fullPath);
    }
  }
}

function scanFile(filePath) {
  let content;
  try { content = fs.readFileSync(filePath, 'utf8'); } catch { return; }
  scanned++;

  const lines = content.split('\n');
  const relPath = path.relative(ROOT, filePath);

  for (const pattern of DANGEROUS_PATTERNS) {
    pattern.re.lastIndex = 0;
    let m;
    while ((m = pattern.re.exec(content)) !== null) {
      const lineIdx = content.slice(0, m.index).split('\n').length - 1;
      const lineText = lines[lineIdx] || '';

      // Skip if the line is a comment
      if (/^\s*\/\//.test(lineText)) continue;
      if (/^\s*\*/.test(lineText)) continue;

      // Check exception pattern
      if (pattern.except && pattern.except.test(lineText)) continue;

      findings.push({
        file: relPath,
        line: lineIdx + 1,
        pattern: pattern.name,
        severity: pattern.severity,
        code: lineText.trim().slice(0, 80),
      });
    }
  }
}

console.log('');
console.log('🛡️ organism-sentinel-bot: Dangerous Pattern Scan');
console.log('══════════════════════════════════════════════════════════');

for (const dir of SCAN_DIRS) {
  if (fs.existsSync(dir)) walkDir(dir);
}

const high   = findings.filter(f => f.severity === 'high');
const medium = findings.filter(f => f.severity === 'medium');

if (findings.length === 0) {
  console.log(`  ✅ No dangerous patterns found (${scanned} files scanned)`);
} else {
  if (high.length > 0) {
    console.log(`  ⛔ ${high.length} HIGH severity finding(s):`);
    for (const f of high) {
      console.log(`    ${f.file}:${f.line} — ${f.pattern}`);
      console.log(`    Code: ${f.code}`);
    }
  }
  if (medium.length > 0) {
    console.log(`  ⚠ ${medium.length} MEDIUM severity finding(s):`);
    for (const f of medium) {
      console.log(`    ${f.file}:${f.line} — ${f.pattern}`);
    }
  }
}

console.log(`\n  Scanned ${scanned} files in ${SCAN_DIRS.length} directories`);

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_sentinel-dangerous.json'),
  JSON.stringify({ timestamp: new Date().toISOString(), scanned, findings }, null, 2),
);

if (high.length > 0) {
  console.log('\n❌ High-severity dangerous patterns detected.');
  process.exit(1);
}

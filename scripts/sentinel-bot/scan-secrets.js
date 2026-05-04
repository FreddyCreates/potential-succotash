#!/usr/bin/env node
/**
 * 🛡️ sentinel-bot: scan-secrets.js
 *
 * Scans source files for accidentally committed secrets:
 *   - API keys (OpenAI, Anthropic, Google, Stripe, etc.)
 *   - Private key PEM blocks
 *   - Connection strings with credentials
 *   - JWT tokens
 *   - GitHub personal access tokens
 *
 * Skips: node_modules, .git, dist/, *.zip, *.tgz, binary files
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');

// Secret patterns — each has a name and regex
const SECRET_PATTERNS = [
  { name: 'OpenAI API key',      re: /sk-[A-Za-z0-9]{20,}/g },
  { name: 'Anthropic API key',   re: /sk-ant-[A-Za-z0-9\-_]{20,}/g },
  { name: 'Google API key',      re: /AIza[A-Za-z0-9\-_]{35}/g },
  { name: 'AWS Access Key',      re: /AKIA[A-Z0-9]{16}/g },
  { name: 'AWS Secret Key',      re: /aws_secret_access_key\s*=\s*[A-Za-z0-9/+]{40}/gi },
  { name: 'Stripe secret key',   re: /sk_live_[A-Za-z0-9]{24,}/g },
  { name: 'Stripe test key',     re: /sk_test_[A-Za-z0-9]{24,}/g },
  { name: 'GitHub PAT',          re: /ghp_[A-Za-z0-9]{36}/g },
  { name: 'GitHub OAuth token',  re: /gho_[A-Za-z0-9]{36}/g },
  { name: 'Private key PEM',     re: /-----BEGIN (RSA |EC |DSA |OPENSSH )?PRIVATE KEY-----/g },
  { name: 'JWT token',           re: /eyJ[A-Za-z0-9\-_]{20,}\.[A-Za-z0-9\-_]{20,}\.[A-Za-z0-9\-_]{20,}/g },
  { name: 'Connection string',   re: /(?:mongodb|postgresql|mysql|redis):\/\/[^:]+:[^@]+@/gi },
  { name: 'Slack webhook',       re: /https:\/\/hooks\.slack\.com\/services\/[A-Z0-9\/]{40,}/g },
  { name: 'Discord webhook',     re: /https:\/\/discord(?:app)?\.com\/api\/webhooks\/[0-9]+\/[A-Za-z0-9\-_]+/g },
  { name: 'HuggingFace token',   re: /hf_[A-Za-z0-9]{34}/g },
];

// Directories/patterns to skip
const SKIP_DIRS = new Set(['.git', 'node_modules', 'dist', '.cache', 'icp-dist']);
const SKIP_EXTS = new Set(['.zip', '.tgz', '.tar', '.gz', '.png', '.jpg', '.jpeg', '.gif', '.ico', '.wasm', '.pdf', '.lock']);
const TEXT_EXTS = new Set(['.js', '.ts', '.tsx', '.jsx', '.json', '.md', '.txt', '.html', '.css', '.yaml', '.yml', '.sh', '.bat', '.toml', '.mo', '.java', '.cpp', '.py']);

// Allowlist: known-safe patterns (false positives)
const ALLOWLIST = [
  /sk-\.\.\./,            // placeholder
  /sk-proj-\.\.\./,       // placeholder
  /AIzaSy000000/,         // placeholder
  /AKIA0000000000000000/, // placeholder
  /eyJhbGciOiJSUzI1NiIsImtpZCI6/,  // Google JWKS (public)
  /-----BEGIN CERTIFICATE-----/,    // public cert (not private)
];

let findings = [];
let scanned = 0;
let skipped = 0;

function walkDir(dir) {
  let entries;
  try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return; }

  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    const relPath  = path.relative(ROOT, fullPath);

    if (entry.isDirectory()) {
      if (!SKIP_DIRS.has(entry.name)) walkDir(fullPath);
      continue;
    }

    const ext = path.extname(entry.name).toLowerCase();
    if (SKIP_EXTS.has(ext)) { skipped++; continue; }
    if (!TEXT_EXTS.has(ext)) { skipped++; continue; }

    let content;
    try { content = fs.readFileSync(fullPath, 'utf8'); } catch { continue; }
    scanned++;

    for (const { name, re } of SECRET_PATTERNS) {
      re.lastIndex = 0;
      let m;
      while ((m = re.exec(content)) !== null) {
        const match = m[0];

        // Check allowlist
        if (ALLOWLIST.some(allow => allow.test(match))) continue;

        // Get line number
        const lineNum = content.slice(0, m.index).split('\n').length;

        findings.push({
          file: relPath,
          line: lineNum,
          type: name,
          snippet: match.slice(0, 20) + '…',
        });
      }
    }
  }
}

console.log('');
console.log('🛡️ organism-sentinel-bot: Secret Scan');
console.log('══════════════════════════════════════════════════════════');
console.log('  Scanning source tree...');

walkDir(ROOT);

console.log(`  Scanned: ${scanned} files, skipped: ${skipped} binary/dist files`);

if (findings.length === 0) {
  console.log('  ✅ No secrets detected');
} else {
  console.log(`\n  ⛔ ${findings.length} potential secret(s) found:\n`);
  for (const f of findings) {
    console.log(`    ${f.file}:${f.line} — ${f.type}: ${f.snippet}`);
  }
}

const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_sentinel-secrets.json'),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    scanned,
    findings: findings.map(f => ({ ...f, snippet: '[REDACTED]' })), // never write actual secrets
  }, null, 2),
);

if (findings.length > 0) {
  console.log('\n❌ Potential secrets detected. Review immediately.');
  process.exit(1);
}

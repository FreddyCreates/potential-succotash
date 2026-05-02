#!/usr/bin/env node
/**
 * 🔬 protocol-bot: generate-encyclopedia.js
 *
 * Generates the protocol encyclopedia from:
 *   - docs/_protocol-lint.json  (from lint-protocols.js)
 *   - docs/_protocol-deps.json  (from detect-circular-deps.js)
 *   - Direct parsing of each protocol file for description comments
 *
 * Output:
 *   - docs/protocol-encyclopedia.md
 *   - docs/protocol-report.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..', '..');
const PROTO_DIR = path.resolve(ROOT, 'protocols');
const DOCS      = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

// Load lint results if available
let lintResults = [];
try {
  lintResults = JSON.parse(fs.readFileSync(path.join(DOCS, '_protocol-lint.json'), 'utf8')).results || [];
} catch {}

let depGraph = {};
let hasCycles = false;
try {
  const deps = JSON.parse(fs.readFileSync(path.join(DOCS, '_protocol-deps.json'), 'utf8'));
  depGraph = deps.graph || {};
  hasCycles = deps.hasCycles || false;
} catch {}

const files = fs.readdirSync(PROTO_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js')
  .sort();

// Extract protocol metadata from file comments
function extractMeta(file) {
  const src = fs.readFileSync(path.join(PROTO_DIR, file), 'utf8');
  const slug = path.basename(file, '.js');

  // Extract first comment block
  const commentMatch = src.match(/\/\*\*?\s*([\s\S]*?)\*\//);
  const comment = commentMatch ? commentMatch[1].replace(/\s*\*\s*/g, ' ').trim() : '';

  // Extract class name
  const classMatch = src.match(/class\s+(\w+)/);
  const className = classMatch ? classMatch[1] : slug;

  // PHI and heartbeat
  const hasPHI       = src.includes('PHI');
  const hasHeartbeat = src.includes('HEARTBEAT') || src.includes('873');

  // Method count (rough)
  const methods = (src.match(/^\s{2,4}\w+\s*\(/gm) || []).length;

  const lint = lintResults.find(r => r.slug === slug);
  const domain = lint?.domain || 'general';
  const status = lint?.status || 'unknown';

  return { slug, file, className, comment: comment.slice(0, 200), domain, hasPHI, hasHeartbeat, methods, status };
}

const protocols = files.map(extractMeta);

// Group by domain
const byDomain = {};
for (const p of protocols) {
  if (!byDomain[p.domain]) byDomain[p.domain] = [];
  byDomain[p.domain].push(p);
}

// ── Protocol report JSON ──────────────────────────────────────────────────────
const reportData = {
  generated: new Date().toISOString(),
  bot: 'organism-protocol-bot',
  totalProtocols: protocols.length,
  hasCycles,
  domainBreakdown: Object.fromEntries(Object.entries(byDomain).map(([d, ps]) => [d, ps.length])),
  protocols: protocols.map(p => ({
    slug: p.slug,
    className: p.className,
    domain: p.domain,
    status: p.status,
    hasPHI: p.hasPHI,
    hasHeartbeat: p.hasHeartbeat,
    methods: p.methods,
    deps: depGraph[p.slug] || [],
  })),
};

fs.writeFileSync(path.join(DOCS, 'protocol-report.json'), JSON.stringify(reportData, null, 2));
console.log(`✅ Protocol report: ${protocols.length} protocols across ${Object.keys(byDomain).length} domains`);

// ── Encyclopedia Markdown ─────────────────────────────────────────────────────
const DOMAIN_EMOJI = {
  routing: '🔀', security: '🔐', resonance: '⚡', memory: '🏛',
  fusion: '🔬', vision: '👁', lifecycle: '🔄', neural: '🧠', general: '📋',
};

const lines = [
  '# 🔬 organism-protocol-bot — Protocol Encyclopedia',
  '',
  `**Generated:** ${reportData.generated}`,
  `**Total Protocols:** ${protocols.length}`,
  `**Circular Dependencies:** ${hasCycles ? '❌ Detected' : '✅ None'}`,
  '',
  '## Protocol Index',
  '',
  '| Protocol | Class | Domain | PHI | Heartbeat | Methods | Status |',
  '|---|---|---|---|---|---|---|',
  ...protocols.map(p =>
    `| \`${p.slug}\` | \`${p.className}\` | ${DOMAIN_EMOJI[p.domain] || '📋'} ${p.domain} | ${p.hasPHI ? '✓' : '—'} | ${p.hasHeartbeat ? '✓' : '—'} | ${p.methods} | ${p.status === 'pass' ? '✅' : p.status === 'warn' ? '⚠️' : '❌'} |`,
  ),
  '',
];

// Domain sections
for (const [domain, ps] of Object.entries(byDomain).sort()) {
  const emoji = DOMAIN_EMOJI[domain] || '📋';
  lines.push(`## ${emoji} ${domain.charAt(0).toUpperCase() + domain.slice(1)} Protocols`);
  lines.push('');
  for (const p of ps) {
    lines.push(`### \`${p.className}\``);
    lines.push('');
    if (p.comment) lines.push(`> ${p.comment}`);
    lines.push('');
    lines.push(`- **File:** \`protocols/${p.file}\``);
    lines.push(`- **Domain:** ${p.domain}`);
    lines.push(`- **PHI encoded:** ${p.hasPHI ? 'Yes ⚡' : 'No'}`);
    lines.push(`- **Heartbeat aware:** ${p.hasHeartbeat ? 'Yes 💓' : 'No'}`);
    lines.push(`- **Methods:** ${p.methods}`);
    const deps = depGraph[p.slug] || [];
    if (deps.length) lines.push(`- **Imports:** ${deps.map(d => `\`${d}\``).join(', ')}`);
    lines.push('');
  }
}

lines.push('---');
lines.push('');
lines.push('*Report data: [protocol-report.json](./protocol-report.json)*');

fs.writeFileSync(path.join(DOCS, 'protocol-encyclopedia.md'), lines.join('\n'));
console.log('✅ Protocol encyclopedia written to docs/protocol-encyclopedia.md');

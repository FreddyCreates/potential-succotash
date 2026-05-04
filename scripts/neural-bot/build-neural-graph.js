#!/usr/bin/env node
/**
 * 🧠 neural-bot: build-neural-graph.js
 *
 * Builds the neural dependency graph of the entire organism:
 *   - Protocols → their dependencies on each other
 *   - SDKs → their dependencies on protocols
 *   - Extensions → their dependencies on SDKs
 *   - Substrates → their cross-substrate bindings
 *
 * Output: docs/neural-graph.json + docs/neural-report.md
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..', '..');
const DOCS_DIR  = path.resolve(ROOT, 'docs');
const PROTO_DIR = path.resolve(ROOT, 'protocols');
const SDK_DIR   = path.resolve(ROOT, 'sdk');
const EXT_DIR   = path.resolve(ROOT, 'extensions');
const ORG_DIR   = path.resolve(ROOT, 'organism');

fs.mkdirSync(DOCS_DIR, { recursive: true });

// ── Domain classification ─────────────────────────────────────────────────────
const DOMAIN_PATTERNS = {
  neural:     /neural|neuro|brain|synapse|cortex|cognit/i,
  memory:     /memory|lineage|palace|absorb|knowledge/i,
  routing:    /routing|sovereign|mesh|edge|transport/i,
  security:   /cipher|sentinel|guardian|sentry|encrypt|contract/i,
  resonance:  /phi|resonance|sync|harmonic|oscillat/i,
  lifecycle:  /lifecycle|organism|marketplace|deploy/i,
  vision:     /visual|vision|scene|image/i,
  fusion:     /fusion|multi.model|blend|aggregate/i,
};

function classifyDomain(name, src) {
  for (const [domain, pattern] of Object.entries(DOMAIN_PATTERNS)) {
    if (pattern.test(name) || (src && pattern.test(src.slice(0, 500)))) {
      return domain;
    }
  }
  return 'general';
}

// ── Extract import dependencies from a JS/TS file ─────────────────────────────
function extractDeps(src) {
  const deps = new Set();
  const importPatterns = [
    /import\s+.*\s+from\s+['"]([^'"]+)['"]/g,
    /require\s*\(\s*['"]([^'"]+)['"]\s*\)/g,
    /export\s+.*\s+from\s+['"]([^'"]+)['"]/g,
  ];
  for (const pattern of importPatterns) {
    let m;
    while ((m = pattern.exec(src)) !== null) {
      const dep = m[1];
      if (dep.startsWith('.')) deps.add(dep);
      else if (!dep.startsWith('node:')) deps.add(dep);
    }
  }
  return [...deps];
}

// ── Build nodes and edges ─────────────────────────────────────────────────────
const nodes = [];
const edges = [];

// 1. Protocol nodes
const protoFiles = fs.readdirSync(PROTO_DIR).filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js');
for (const file of protoFiles) {
  const src = fs.readFileSync(path.join(PROTO_DIR, file), 'utf8');
  const id  = 'proto:' + path.basename(file, '.js');
  nodes.push({
    id,
    label: path.basename(file, '.js'),
    type:  'protocol',
    domain: classifyDomain(file, src),
    hasPHI:       src.includes('PHI') || src.includes('phi'),
    hasHeartbeat: src.includes('HEARTBEAT') || src.includes('873'),
  });
  // Deps within protocols
  for (const dep of extractDeps(src)) {
    if (dep.startsWith('./') || dep.startsWith('../')) {
      const target = 'proto:' + path.basename(dep, '.js').replace(/^\.\//, '');
      edges.push({ source: id, target, type: 'imports' });
    }
  }
}

// 2. SDK nodes
const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true }).filter(d => d.isDirectory()).map(d => d.name);
for (const sdk of sdkDirs) {
  const pkgPath = path.join(SDK_DIR, sdk, 'package.json');
  let pkg = {};
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch {}
  const id = 'sdk:' + sdk;
  nodes.push({
    id,
    label: pkg.name || sdk,
    type:  'sdk',
    domain: classifyDomain(sdk, null),
    version: pkg.version || 'unknown',
  });
  // SDK → protocol dependencies
  if (pkg.dependencies) {
    for (const dep of Object.keys(pkg.dependencies)) {
      const protoMatch = protoFiles.find(f => f.includes(dep) || dep.includes(f.replace('.js', '')));
      if (protoMatch) {
        edges.push({ source: id, target: 'proto:' + path.basename(protoMatch, '.js'), type: 'depends-on' });
      }
    }
  }
}

// 3. Substrate nodes
const SUBSTRATES = [
  { id: 'substrate:typescript', label: 'TypeScript Organism', lang: 'typescript' },
  { id: 'substrate:python',     label: 'Python Organism',     lang: 'python' },
  { id: 'substrate:cpp',        label: 'C++ Organism',        lang: 'cpp' },
  { id: 'substrate:java',       label: 'Java Organism',       lang: 'java' },
  { id: 'substrate:motoko',     label: 'Motoko (ICP)',        lang: 'motoko' },
  { id: 'substrate:web',        label: 'Web Workers',         lang: 'web' },
];
for (const sub of SUBSTRATES) {
  nodes.push({ ...sub, type: 'substrate', domain: 'lifecycle' });
}

// 4. Extension node (aggregate)
const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows')
  .map(d => d.name);
nodes.push({ id: 'extensions', label: `Browser Extensions (${extDirs.length})`, type: 'frontend', domain: 'neural' });

// Extensions depend on Vigil AI background → protocols
edges.push({ source: 'extensions', target: 'proto:phi-resonance-sync-protocol', type: 'uses' });
edges.push({ source: 'extensions', target: 'proto:memory-lineage-protocol', type: 'uses' });
edges.push({ source: 'extensions', target: 'proto:sovereign-routing-protocol', type: 'uses' });

// ── Assemble graph ────────────────────────────────────────────────────────────
const graph = {
  version: '1.0',
  generated: new Date().toISOString(),
  bot: 'organism-neural-bot',
  stats: {
    nodes: nodes.length,
    edges: edges.length,
    protocols: protoFiles.length,
    sdks: sdkDirs.length,
    substrates: SUBSTRATES.length,
    extensions: extDirs.length,
  },
  nodes,
  edges,
};

fs.writeFileSync(path.join(DOCS_DIR, 'neural-graph.json'), JSON.stringify(graph, null, 2));
console.log(`✅ Neural graph: ${nodes.length} nodes, ${edges.length} edges`);

// ── Markdown report ───────────────────────────────────────────────────────────
const domainCounts = {};
for (const n of nodes) {
  domainCounts[n.domain] = (domainCounts[n.domain] || 0) + 1;
}

const report = [
  '# 🧠 organism-neural-bot — Neural Dependency Graph',
  '',
  `**Generated:** ${graph.generated}`,
  `**Bot:** organism-neural-bot`,
  '',
  '## System Stats',
  '',
  `| Metric | Count |`,
  `|---|---|`,
  `| Protocol nodes | ${protoFiles.length} |`,
  `| SDK nodes | ${sdkDirs.length} |`,
  `| Substrate nodes | ${SUBSTRATES.length} |`,
  `| Extension aggregate | 1 |`,
  `| **Total nodes** | **${nodes.length}** |`,
  `| **Total edges** | **${edges.length}** |`,
  '',
  '## Domain Distribution',
  '',
  `| Domain | Node Count |`,
  `|---|---|`,
  ...Object.entries(domainCounts).sort((a, b) => b[1] - a[1]).map(([d, c]) => `| ${d} | ${c} |`),
  '',
  '## Protocols',
  '',
  ...protoFiles.map(f => {
    const n = nodes.find(node => node.id === 'proto:' + path.basename(f, '.js'));
    const flags = [n?.hasPHI ? '⚡ PHI' : '', n?.hasHeartbeat ? '💓 HEARTBEAT' : ''].filter(Boolean).join(' ');
    return `- **${path.basename(f, '.js')}** — domain: \`${n?.domain}\` ${flags}`;
  }),
  '',
  '## SDKs',
  '',
  ...sdkDirs.map(sdk => {
    const n = nodes.find(node => node.id === 'sdk:' + sdk);
    return `- **${n?.label || sdk}** v${n?.version || '?'} — domain: \`${n?.domain}\``;
  }),
  '',
  '## Substrates (6 Runtimes)',
  '',
  ...SUBSTRATES.map(s => `- **${s.label}** (\`${s.lang}\`)`),
  '',
  '---',
  '',
  '*Graph data: [neural-graph.json](./neural-graph.json)*',
].join('\n');

fs.writeFileSync(path.join(DOCS_DIR, 'neural-report.md'), report);
console.log('✅ Neural report written to docs/neural-report.md');

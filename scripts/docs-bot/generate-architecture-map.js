#!/usr/bin/env node
/**
 * 📚 docs-bot: generate-architecture-map.js
 *
 * Generates docs/architecture-map.md — a full visualization of the
 * organism's architecture showing all layers:
 *   - 6 Substrates (organism runtimes)
 *   - 16+ Protocols (intelligence wiring)
 *   - 11 SDKs (capability surfaces)
 *   - 36 Extensions (frontends)
 *   - Desktop / CLI / Web frontends
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const DOCS    = path.resolve(ROOT, 'docs');
const PROTO_DIR = path.resolve(ROOT, 'protocols');
const SDK_DIR   = path.resolve(ROOT, 'sdk');
const EXT_DIR   = path.resolve(ROOT, 'extensions');
const ORG_DIR   = path.resolve(ROOT, 'organism');

fs.mkdirSync(DOCS, { recursive: true });

const protoFiles = fs.readdirSync(PROTO_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js');

const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);

const extDirs = fs.readdirSync(EXT_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows').map(d => d.name);

const orgSubstrates = fs.readdirSync(ORG_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory()).map(d => d.name);

const timestamp = new Date().toISOString();

const lines = [
  '# 🏛 Casa de Inteligencia — Architecture Map',
  '',
  `**Generated:** ${timestamp}`,
  `**Bot:** organism-docs-bot 📚`,
  '',
  '## System Overview',
  '',
  '```',
  '╔══════════════════════════════════════════════════════════════════╗',
  '║              CASA DE INTELIGENCIA — ORGANISM ARCHITECTURE        ║',
  '╠══════════════════════════════════════════════════════════════════╣',
  '║                                                                  ║',
  `║  FRONTENDS (${extDirs.length} extensions + desktop + web + cli)${' '.repeat(Math.max(0, 18 - String(extDirs.length).length))}║`,
  '║  ┌──────────────┐ ┌──────────┐ ┌─────────┐ ┌─────────────────┐ ║',
  '║  │ Browser Exts │ │ Desktop  │ │   Web   │ │       CLI       │ ║',
  '║  │  (Chrome/Edge│ │(Electron)│ │   App   │ │  (Node.js)      │ ║',
  '║  └──────┬───────┘ └────┬─────┘ └────┬────┘ └────────┬────────┘ ║',
  '║         └──────────────┴────────────┴────────────────┘          ║',
  '║                              │                                   ║',
  '╠══════════════════════════════╪═══════════════════════════════════╣',
  `║  PROTOCOLS (${protoFiles.length} intelligence protocols)${' '.repeat(Math.max(0, 35 - String(protoFiles.length).length))}║`,
  '║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  ║',
  '║  │ Routing  │ │ Memory   │ │ Security │ │   Resonance/PHI  │  ║',
  '║  │ SRP·EMIP │ │ MLP·AKAP │ │ EIT·SCVP │ │      PRSP        │  ║',
  '║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  ║',
  '║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  ║',
  '║  │  Vision  │ │ Lifecycle│ │  Fusion  │ │     Neural       │  ║',
  '║  │   VSIP   │ │ OLP·OMP  │ │   MMFP   │ │  AGIP·SOCP       │  ║',
  '║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  ║',
  '╠══════════════════════════════╪═══════════════════════════════════╣',
  `║  SDKs (${sdkDirs.length} capability surfaces)${' '.repeat(Math.max(0, 43 - String(sdkDirs.length).length))}║`,
  '║  ai-model-engines · intelligence-routing · sovereign-memory      ║',
  '║  organism-runtime · organism-marketplace · enterprise-integration║',
  '║  document-absorption · frontend-intelligence · windows-runtime   ║',
  '╠══════════════════════════════════════════════════════════════════╣',
  `║  ORGANISM SUBSTRATES (${orgSubstrates.length} runtimes)${' '.repeat(Math.max(0, 38 - String(orgSubstrates.length).length))}║`,
  '║  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  ║',
  '║  │TypeScript│ │  Python  │ │   C++    │ │      Java        │  ║',
  '║  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  ║',
  '║  ┌──────────────────────────┐ ┌──────────────────────────────┐  ║',
  '║  │ Motoko (Internet Computer│ │    Web Workers (21 workers)  │  ║',
  '║  └──────────────────────────┘ └──────────────────────────────┘  ║',
  '╠══════════════════════════════════════════════════════════════════╣',
  '║  CORE CONSTANTS: PHI=1.618033988749895 · HEARTBEAT=873ms        ║',
  '║  4-Register State: Cognitive·Affective·Somatic·Sovereign        ║',
  '╚══════════════════════════════════════════════════════════════════╝',
  '```',
  '',
  '## Layer Breakdown',
  '',
  `### 🌐 Frontends (${extDirs.length + 3} surfaces)`,
  '',
  `| Frontend | Type | Count |`,
  `|---|---|---|`,
  `| Browser Extensions | Chrome/Edge MV3 | ${extDirs.length} |`,
  `| Desktop App | Electron | 1 |`,
  `| Web App | HTML/JS | 1 |`,
  `| CLI | Node.js | 1 |`,
  '',
  `### 🔬 Protocols (${protoFiles.length})`,
  '',
  ...protoFiles.map(f => `- \`${path.basename(f, '.js')}\``),
  '',
  `### 📦 SDKs (${sdkDirs.length})`,
  '',
  ...sdkDirs.map(s => `- \`${s}\``),
  '',
  `### 🧬 Organism Substrates (${orgSubstrates.length})`,
  '',
  ...orgSubstrates.map(s => `- **${s}** (\`organism/${s}/\`)`),
  '',
  '## Intelligence Constants',
  '',
  '| Constant | Value | Significance |',
  '|---|---|---|',
  '| PHI | 1.618033988749895 | Golden ratio — all phi-encoded math |',
  '| HEARTBEAT | 873ms | System pulse (873 × φ ≈ 1413ms recursive interval) |',
  '| GOLDEN_ANGLE | 137.508° | Phi-encoded spatial distribution |',
  '',
  '---',
  '',
  '*Generated by organism-docs-bot 📚*',
];

fs.writeFileSync(path.join(DOCS, 'architecture-map.md'), lines.join('\n'));
console.log(`✅ Architecture map written → docs/architecture-map.md`);
console.log(`   ${protoFiles.length} protocols · ${sdkDirs.length} SDKs · ${extDirs.length} extensions · ${orgSubstrates.length} substrates`);

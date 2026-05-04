#!/usr/bin/env node
/**
 * 📦 sdk-bot: generate-registry.js
 *
 * Generates:
 *   - docs/sdk-registry.json  — machine-readable SDK manifest
 *   - docs/sdk-report.md      — human-readable SDK reference
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT    = path.resolve(__dirname, '..', '..');
const SDK_DIR = path.resolve(ROOT, 'sdk');
const DOCS    = path.resolve(ROOT, 'docs');

fs.mkdirSync(DOCS, { recursive: true });

const sdkDirs = fs.readdirSync(SDK_DIR, { withFileTypes: true })
  .filter(d => d.isDirectory())
  .map(d => d.name);

const registry = [];

for (const sdk of sdkDirs) {
  const pkgPath = path.join(SDK_DIR, sdk, 'package.json');
  if (!fs.existsSync(pkgPath)) continue;

  let pkg;
  try { pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8')); } catch { continue; }

  // Count source files
  const srcDir = path.join(SDK_DIR, sdk, 'src');
  let srcFileCount = 0;
  if (fs.existsSync(srcDir)) {
    srcFileCount = fs.readdirSync(srcDir).filter(f => f.endsWith('.js') || f.endsWith('.ts')).length;
  }

  registry.push({
    slug: sdk,
    name: pkg.name || sdk,
    version: pkg.version || '0.0.0',
    description: pkg.description || '',
    main: pkg.main || '',
    license: pkg.license || '',
    keywords: pkg.keywords || [],
    dependencies: Object.keys(pkg.dependencies || {}),
    peerDependencies: Object.keys(pkg.peerDependencies || {}),
    srcFileCount,
    publishable: !!(pkg.name && pkg.version && pkg.main && pkg.license),
  });
}

// Sort by name
registry.sort((a, b) => a.name.localeCompare(b.name));

const registryDoc = {
  generated: new Date().toISOString(),
  bot: 'organism-sdk-bot',
  totalSDKs: registry.length,
  publishableSDKs: registry.filter(s => s.publishable).length,
  sdks: registry,
};

fs.writeFileSync(path.join(DOCS, 'sdk-registry.json'), JSON.stringify(registryDoc, null, 2));
console.log(`✅ SDK registry: ${registry.length} SDKs (${registryDoc.publishableSDKs} publishable)`);

// ── Markdown report ───────────────────────────────────────────────────────────
const lines = [
  '# 📦 organism-sdk-bot — SDK Reference',
  '',
  `**Generated:** ${registryDoc.generated}`,
  `**Total SDKs:** ${registry.length}`,
  `**Publishable:** ${registryDoc.publishableSDKs}`,
  '',
  '## SDK Registry',
  '',
  '| SDK | Version | Description | Publishable |',
  '|---|---|---|---|',
  ...registry.map(s => [
    `| **${s.name}** |`,
    ` \`${s.version}\` |`,
    ` ${s.description || '—'} |`,
    ` ${s.publishable ? '✅' : '⚠️'} |`,
  ].join('')),
  '',
  '## Detail',
  '',
  ...registry.map(s => [
    `### ${s.name}`,
    '',
    `- **Slug:** \`${s.slug}\``,
    `- **Version:** \`${s.version}\``,
    `- **Main:** \`${s.main}\``,
    `- **License:** ${s.license}`,
    s.description ? `- **Description:** ${s.description}` : '',
    s.keywords.length ? `- **Keywords:** ${s.keywords.join(', ')}` : '',
    s.dependencies.length ? `- **Dependencies:** ${s.dependencies.join(', ')}` : '',
    '',
  ].filter(Boolean).join('\n')),
  '---',
  '',
  '*Registry data: [sdk-registry.json](./sdk-registry.json)*',
];

fs.writeFileSync(path.join(DOCS, 'sdk-report.md'), lines.join('\n'));
console.log('✅ SDK report written to docs/sdk-report.md');

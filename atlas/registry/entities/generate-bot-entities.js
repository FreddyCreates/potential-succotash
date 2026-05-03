#!/usr/bin/env node
/**
 * Generates atlas/registry/entities/<bot>.json for all 16 bots.
 * Run once: node atlas/registry/entities/generate-bot-entities.js
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const OUT = path.resolve(__dirname);

const BOTS = [
  { name: 'organism-build-bot',      emoji: '🧬', division: 'Build & Package',      triggers: ['push:extensions/'],            languages: ['ocl','cil','ril'] },
  { name: 'organism-sdk-bot',        emoji: '📦', division: 'Build & Package',      triggers: ['push:sdk/'],                   languages: ['ocl','cil','cpl-p'] },
  { name: 'organism-release-bot',    emoji: '🚀', division: 'Build & Package',      triggers: ['tags:v*'],                     languages: ['ocl','cil','err'] },
  { name: 'organism-neural-bot',     emoji: '🧠', division: 'Validate & Test',      triggers: ['push:protocols/','push:sdk/'], languages: ['ocl','cil','ril'] },
  { name: 'organism-protocol-bot',   emoji: '🔬', division: 'Validate & Test',      triggers: ['push:protocols/'],             languages: ['ocl','cpl-l','ril'] },
  { name: 'organism-test-bot',       emoji: '🧪', division: 'Validate & Test',      triggers: ['push:test/','push:sdk/'],      languages: ['ocl','cil','err'] },
  { name: 'organism-sandcastle-bot', emoji: '🏰', division: 'Validate & Test',      triggers: ['push:main','pull_request'],    languages: ['ocl','cpl-l','cpl-p','err'] },
  { name: 'organism-visual-bot',     emoji: '📸', division: 'Validate & Test',      triggers: ['schedule:nightly','push:html'],languages: ['ocl','cil','ril'] },
  { name: 'organism-sentinel-bot',   emoji: '🛡️', division: 'Secure & Monitor',     triggers: ['schedule:weekly','push:*'],   languages: ['ocl','cpl-l','err','chl'] },
  { name: 'organism-deps-bot',       emoji: '🔄', division: 'Secure & Monitor',     triggers: ['schedule:mon-thu','push:package.json'], languages: ['ocl','cil','err'] },
  { name: 'organism-crawler-bot',    emoji: '🕷️', division: 'Secure & Monitor',     triggers: ['schedule:tue-fri','push:*'],  languages: ['ocl','ril','cil'] },
  { name: 'organism-docs-bot',       emoji: '📚', division: 'Document & Report',    triggers: ['push:protocols/','push:sdk/'],languages: ['ocl','cil','ril'] },
  { name: 'organism-deploy-bot',     emoji: '🌐', division: 'Deploy & Operate',     triggers: ['push:organism/','push:dfx.json'], languages: ['ocl','cpl-p','err'] },
  { name: 'organism-learning-bot',   emoji: '🎓', division: 'Learn & Evolve',       triggers: ['schedule:nightly','push:protocols/'], languages: ['ocl','cil','cpl-l'] },
  { name: 'organism-economy-bot',    emoji: '💰', division: 'Learn & Evolve',       triggers: ['schedule:weekly','push:sdk/'],languages: ['ocl','cil','ril'] },
  { name: 'organism-alpha-bot',      emoji: '👑', division: 'Command & Control',    triggers: ['schedule:every-6h','push:.github/workflows/','workflow_dispatch'], languages: ['ocl','cil','ril','cpl-p','cpl-l','err','chl'] },
];

for (const bot of BOTS) {
  const entity = {
    id: `atlas://bot/${bot.name}`,
    name: bot.name,
    class: 'Bot',
    division: bot.division,
    emoji: bot.emoji,
    domain: bot.division,
    triggers: bot.triggers,
    languages: bot.languages.map(l => `atlas://language/${l}`),
    governance_pipeline: 'pipeline://governance/bot_cycle',
    created: '2026-05-03T00:00:00.000Z',
    version: '1.0.0',
  };

  const outPath = path.join(OUT, `${bot.name}.json`);
  fs.writeFileSync(outPath, JSON.stringify(entity, null, 2));
  console.log(`  ✓ ${bot.name}.json`);
}

console.log(`\n✅ ${BOTS.length} bot entity files generated`);

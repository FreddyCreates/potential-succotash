#!/usr/bin/env node
/**
 * 🌐 governance: ingest-events.js
 *
 * Step 1 of the Atlas governance cycle.
 * Reads all events from dist/governance/events/*.json,
 * validates against the universal schema, groups them by entity/division/domain,
 * and returns a structured event manifest.
 *
 * Output: governance/memory/_ingested-events.json
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT       = path.resolve(__dirname, '..', '..');
const EVENTS_DIR = path.join(ROOT, 'dist', 'governance', 'events');
const GOV_MEM    = path.join(ROOT, 'governance', 'memory');

fs.mkdirSync(EVENTS_DIR, { recursive: true });
fs.mkdirSync(GOV_MEM,    { recursive: true });

// ── Domain classifier ─────────────────────────────────────────────────────────
const OP_DOMAIN_MAP = {
  fleet_census_completed:     'bot',
  ci_run_completed:           'bot',
  scan_completed:             'bot',
  security_audit_completed:   'security',
  dependency_scan_completed:  'economy',
  economy_scan_completed:     'economy',
  learning_cycle_completed:   'learning',
  topology_crawl_completed:   'topology',
  deploy_completed:           'deploy',
  governance_cycle_completed: 'meta',
  meta_proposal_emitted:      'meta',
  feedback_recorded:          'meta',
  emergence_triggered:        'learning',
  law_violated:               'meta',
  pipeline_escalated:         'meta',
};

function classifyDomain(event) {
  if (OP_DOMAIN_MAP[event.op]) return OP_DOMAIN_MAP[event.op];
  if (event.tags?.includes('economy'))  return 'economy';
  if (event.tags?.includes('learning')) return 'learning';
  if (event.tags?.includes('topology')) return 'topology';
  if (event.tags?.includes('security')) return 'security';
  if (event.tags?.includes('meta'))     return 'meta';
  if (event.tags?.includes('bot'))      return 'bot';
  return 'general';
}

function classifyDivision(entityId) {
  if (!entityId) return 'unknown';
  const bot = entityId.replace('atlas://bot/', '');
  const MAP = {
    'organism-build-bot':      'Build & Package',
    'organism-sdk-bot':        'Build & Package',
    'organism-release-bot':    'Build & Package',
    'organism-neural-bot':     'Validate & Test',
    'organism-protocol-bot':   'Validate & Test',
    'organism-test-bot':       'Validate & Test',
    'organism-sandcastle-bot': 'Validate & Test',
    'organism-visual-bot':     'Validate & Test',
    'organism-sentinel-bot':   'Secure & Monitor',
    'organism-deps-bot':       'Secure & Monitor',
    'organism-crawler-bot':    'Secure & Monitor',
    'organism-docs-bot':       'Document & Report',
    'organism-deploy-bot':     'Deploy & Operate',
    'organism-learning-bot':   'Learn & Evolve',
    'organism-economy-bot':    'Learn & Evolve',
    'organism-alpha-bot':      'Command & Control',
  };
  return MAP[bot] || 'General';
}

// ── Ingest ────────────────────────────────────────────────────────────────────
console.log('');
console.log('🌐 Atlas Governance: Ingest Events');
console.log('══════════════════════════════════════════════════════════');

let eventFiles = [];
try {
  eventFiles = fs.readdirSync(EVENTS_DIR).filter(f => f.endsWith('.json'));
} catch {}

const events = [];
const errors = [];

for (const file of eventFiles) {
  try {
    const raw   = fs.readFileSync(path.join(EVENTS_DIR, file), 'utf8');
    const event = JSON.parse(raw);

    // Basic validation
    if (!event.id || !event.entity_id || !event.op || !event.ts) {
      errors.push({ file, error: 'Missing required field' });
      continue;
    }

    events.push({
      ...event,
      _domain:   classifyDomain(event),
      _division: classifyDivision(event.entity_id),
      _file:     file,
    });
  } catch (err) {
    errors.push({ file, error: err.message });
  }
}

// ── Group ─────────────────────────────────────────────────────────────────────
const byEntity   = {};
const byDivision = {};
const byDomain   = {};

for (const event of events) {
  // By entity
  if (!byEntity[event.entity_id])   byEntity[event.entity_id]   = [];
  byEntity[event.entity_id].push(event);

  // By division
  if (!byDivision[event._division]) byDivision[event._division] = [];
  byDivision[event._division].push(event);

  // By domain
  if (!byDomain[event._domain])     byDomain[event._domain]     = [];
  byDomain[event._domain].push(event);
}

console.log(`  Events ingested:  ${events.length}`);
console.log(`  Parse errors:     ${errors.length}`);
console.log(`  Entities seen:    ${Object.keys(byEntity).length}`);
console.log(`  Divisions seen:   ${Object.keys(byDivision).length}`);
console.log(`  Domains seen:     ${Object.keys(byDomain).length}`);
console.log('');

const manifest = {
  ingested:     new Date().toISOString(),
  eventCount:   events.length,
  errorCount:   errors.length,
  events,
  errors,
  byEntity,
  byDivision,
  byDomain,
};

fs.writeFileSync(
  path.join(GOV_MEM, '_ingested-events.json'),
  JSON.stringify(manifest, null, 2),
);
console.log('✅ Ingested → governance/memory/_ingested-events.json');

module.exports = { events, byEntity, byDivision, byDomain, errors };

#!/usr/bin/env node
/**
 * 🌐 governance: emit-event.js
 *
 * Universal event emitter for the Atlas governance system.
 * Every bot, agent, and organism uses this to emit events.
 *
 * Usage (programmatic):
 *   const { emitEvent } = require('./emit-event');
 *   await emitEvent('atlas://bot/organism-alpha-bot', 'fleet_census_completed', context, tags);
 *
 * Usage (CLI):
 *   node scripts/governance/emit-event.js \
 *     --entity "atlas://bot/organism-alpha-bot" \
 *     --op "fleet_census_completed" \
 *     --context '{"status":"pass","risk_score":0.05}'
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT        = path.resolve(__dirname, '..', '..');
const EVENTS_DIR  = path.join(ROOT, 'dist', 'governance', 'events');

fs.mkdirSync(EVENTS_DIR, { recursive: true });

const PHI = 1.618033988749895;
const SCHEMA_VERSION = '1.0.0';

// ── Event ID generator ────────────────────────────────────────────────────────
let _seq = 0;
function makeEventId(ts) {
  _seq++;
  return `evt-${ts.replace(/[:.]/g, '-')}-${String(_seq).padStart(3, '0')}`;
}

// ── Emit a single event ───────────────────────────────────────────────────────
function emitEvent(entityId, op, context = {}, tags = [], options = {}) {
  const ts  = new Date().toISOString();
  const id  = options.id || makeEventId(ts);

  // Auto-add tags from entity_id
  const autoTags = [];
  if (entityId.includes('://bot/'))      autoTags.push('bot');
  if (entityId.includes('://agent/'))    autoTags.push('agent');
  if (entityId.includes('://organism/')) autoTags.push('organism');
  if (entityId.includes('://realm/'))    autoTags.push('realm');
  if (entityId.includes('://meta/'))     autoTags.push('meta');

  const event = {
    id,
    entity_id: entityId,
    op,
    ts,
    context: {
      ...context,
      // Phi-normalize risk_score if not already set
      risk_score: context.risk_score ?? 0.0,
    },
    tags: [...new Set([...autoTags, ...tags])],
    schema_version: SCHEMA_VERSION,
    ...(options.parent_event_id ? { parent_event_id: options.parent_event_id } : {}),
    ...(options.governance_cycle_id ? { governance_cycle_id: options.governance_cycle_id } : {}),
  };

  // Validate required fields
  if (!event.entity_id || !event.op || !event.ts) {
    throw new Error(`emitEvent: missing required fields (entity_id=${entityId}, op=${op})`);
  }

  // Write to dist/governance/events/<id>.json
  const filePath = path.join(EVENTS_DIR, `${id}.json`);
  fs.writeFileSync(filePath, JSON.stringify(event, null, 2));

  return { event, filePath };
}

// ── Batch emit ────────────────────────────────────────────────────────────────
function emitEvents(events) {
  const results = [];
  for (const e of events) {
    results.push(emitEvent(e.entityId, e.op, e.context || {}, e.tags || [], e.options || {}));
  }
  return results;
}

// ── CLI mode ──────────────────────────────────────────────────────────────────
if (require.main === module) {
  const args = process.argv.slice(2);
  const get  = (flag) => { const i = args.indexOf(flag); return i >= 0 ? args[i + 1] : null; };

  const entity  = get('--entity');
  const op      = get('--op');
  const ctx     = get('--context');
  const tagsStr = get('--tags');

  if (!entity || !op) {
    console.error('Usage: node emit-event.js --entity <id> --op <op> [--context <json>] [--tags <csv>]');
    process.exit(1);
  }

  let context = {};
  if (ctx) { try { context = JSON.parse(ctx); } catch { console.error('Invalid --context JSON'); process.exit(1); } }

  const tags = tagsStr ? tagsStr.split(',').map(t => t.trim()) : [];
  const { event, filePath } = emitEvent(entity, op, context, tags);

  console.log(`✅ Event emitted → ${path.relative(ROOT, filePath)}`);
  console.log(`   id: ${event.id}`);
  console.log(`   entity: ${event.entity_id}`);
  console.log(`   op: ${event.op}`);
}

module.exports = { emitEvent, emitEvents, makeEventId };

#!/usr/bin/env node
/**
 * 🎓 learning-bot: train-hebbian.js
 *
 * Implements Hebbian learning over the organism's module co-activation graph.
 *
 * Hebb's Rule: "Neurons that fire together, wire together."
 * Applied to the organism: modules that CO-SUCCEED together strengthen
 * their synaptic weight. Modules that repeatedly fail weaken their weight.
 *
 * Algorithm:
 *   For each pair (A, B) of modules that both have strength > threshold:
 *     synapse[A][B] += α × strength(A) × strength(B)
 *   Decay all synapses by λ (phi-modulated):
 *     synapse[A][B] *= (1 - λ)
 *
 * Reads from docs/_learning-signals.json.
 * Reads/writes dist/learning/learning-state.json.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..', '..');
const DOCS      = path.resolve(ROOT, 'docs');
const LEARN_DIR = path.resolve(ROOT, 'dist', 'learning');

fs.mkdirSync(LEARN_DIR, { recursive: true });

const PHI    = 1.618033988749895;
const ALPHA  = 0.1;                        // learning rate
const LAMBDA = 1.0 / (PHI * PHI * 10);    // phi-modulated decay (~0.038)
const THRESHOLD = 0.5;                     // co-activation threshold

// Load signals
let sigDoc;
try {
  sigDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_learning-signals.json'), 'utf8'));
} catch {
  console.error('❌ _learning-signals.json not found — run gather-signals.js first');
  process.exit(1);
}

// Load existing learning state (or start fresh)
let state = { synapses: {}, protocolWeights: {}, epoch: 0, lastTrained: null };
try {
  state = JSON.parse(fs.readFileSync(path.join(LEARN_DIR, 'learning-state.json'), 'utf8'));
} catch { /* fresh start */ }

state.epoch = (state.epoch || 0) + 1;
const signals = sigDoc.signals;

// ── Hebbian synapse training ──────────────────────────────────────────────────
// Find strongly activated modules
const active = signals.filter(s => s.strength >= THRESHOLD);

let newSynapses = 0;
let updatedSynapses = 0;

for (let i = 0; i < active.length; i++) {
  for (let j = i + 1; j < active.length; j++) {
    const A = active[i].module;
    const B = active[j].module;

    if (!state.synapses[A]) state.synapses[A] = {};
    if (!state.synapses[B]) state.synapses[B] = {};

    const deltaAB = ALPHA * active[i].strength * active[j].strength;

    const isNew = state.synapses[A][B] === undefined;
    state.synapses[A][B] = ((state.synapses[A][B] || 0) + deltaAB) * (1 - LAMBDA);
    state.synapses[B][A] = state.synapses[A][B]; // symmetric

    if (isNew) newSynapses++; else updatedSynapses++;
  }
}

// ── Decay all existing synapses ───────────────────────────────────────────────
for (const from of Object.keys(state.synapses)) {
  for (const to of Object.keys(state.synapses[from])) {
    state.synapses[from][to] *= (1 - LAMBDA);
    // Prune near-zero synapses
    if (state.synapses[from][to] < 0.001) {
      delete state.synapses[from][to];
    }
  }
  // Clean up empty nodes
  if (Object.keys(state.synapses[from]).length === 0) {
    delete state.synapses[from];
  }
}

// Count total synapses
const totalSynapses = Object.values(state.synapses)
  .reduce((a, node) => a + Object.keys(node).length, 0) / 2;

state.lastTrained = new Date().toISOString();

console.log('');
console.log('🎓 organism-learning-bot: Hebbian Training');
console.log('══════════════════════════════════════════════════════════');
console.log(`  Epoch:           ${state.epoch}`);
console.log(`  Active signals:  ${active.length} / ${signals.length}`);
console.log(`  New synapses:    ${newSynapses}`);
console.log(`  Updated:         ${updatedSynapses}`);
console.log(`  Total synapses:  ${Math.round(totalSynapses)}`);
console.log(`  Learning rate:   α=${ALPHA}`);
console.log(`  Decay (λ):       ${LAMBDA.toFixed(5)} (phi-modulated)`);
console.log('');

// Save state
fs.writeFileSync(path.join(LEARN_DIR, 'learning-state.json'), JSON.stringify(state, null, 2));
console.log('✅ Hebbian state saved → dist/learning/learning-state.json');

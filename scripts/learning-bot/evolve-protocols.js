#!/usr/bin/env node
/**
 * 🎓 learning-bot: evolve-protocols.js
 *
 * Evolves protocol priority weights using Temporal Difference (TD) learning
 * with a phi-based discount factor.
 *
 * TD update rule:
 *   W(p) ← W(p) + α × [R(p) + γ × W(p_next) − W(p)]
 *
 * where:
 *   W(p)     = current protocol weight
 *   R(p)     = reward = signal strength for protocol p
 *   γ        = discount factor = 1/PHI ≈ 0.618 (golden ratio inverse)
 *   α        = learning rate = 0.05
 *   p_next   = next protocol in dependency order (from neural graph edges)
 *
 * Reads docs/_learning-signals.json and docs/neural-graph.json.
 * Updates dist/learning/learning-state.json.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const ROOT      = path.resolve(__dirname, '..', '..');
const DOCS      = path.resolve(ROOT, 'docs');
const LEARN_DIR = path.resolve(ROOT, 'dist', 'learning');

fs.mkdirSync(LEARN_DIR, { recursive: true });

const PHI   = 1.618033988749895;
const GAMMA = 1.0 / PHI;           // phi-based discount ≈ 0.618
const ALPHA = 0.05;                 // TD learning rate

// Load signals
let sigDoc;
try {
  sigDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_learning-signals.json'), 'utf8'));
} catch {
  console.error('❌ _learning-signals.json not found');
  process.exit(1);
}

// Load neural graph for dependency order
let neuralGraph = null;
try {
  neuralGraph = JSON.parse(fs.readFileSync(path.join(DOCS, 'neural-graph.json'), 'utf8'));
} catch {}

// Load existing state
let state = { synapses: {}, protocolWeights: {}, epoch: 1, lastTrained: null };
try {
  state = JSON.parse(fs.readFileSync(path.join(LEARN_DIR, 'learning-state.json'), 'utf8'));
} catch {}

// ── Build reward map from protocol signals ────────────────────────────────────
const rewards = {};
for (const sig of sigDoc.signals) {
  if (sig.type === 'protocol') {
    rewards[sig.module] = sig.strength;
  }
}

// ── Build dependency adjacency (for next-state lookup) ───────────────────────
const deps = {};
if (neuralGraph?.edges) {
  for (const edge of neuralGraph.edges) {
    if (edge.source.startsWith('proto:') && edge.target.startsWith('proto:')) {
      const from = edge.source.replace('proto:', '');
      const to   = edge.target.replace('proto:', '');
      if (!deps[from]) deps[from] = [];
      deps[from].push(to);
    }
  }
}

// ── TD weight evolution ───────────────────────────────────────────────────────
const protocolModules = sigDoc.signals
  .filter(s => s.type === 'protocol')
  .map(s => s.module);

let updatedCount = 0;

for (const proto of protocolModules) {
  const W_current = state.protocolWeights[proto] ?? 0.5; // init at 0.5 baseline
  const R = rewards[proto] ?? 0.5;

  // Find next-state value (best connected neighbor, or self-decay)
  const neighbors = deps[proto] || [];
  const W_next = neighbors.length > 0
    ? Math.max(...neighbors.map(n => state.protocolWeights[n] ?? 0.5))
    : W_current;

  // TD update
  const tdError = R + GAMMA * W_next - W_current;
  const W_new   = Math.max(0.01, Math.min(1.0, W_current + ALPHA * tdError));

  state.protocolWeights[proto] = W_new;
  updatedCount++;
}

// ── Report ────────────────────────────────────────────────────────────────────
const weights = Object.entries(state.protocolWeights).sort(([, a], [, b]) => b - a);

console.log('');
console.log('🎓 organism-learning-bot: Protocol Weight Evolution');
console.log('══════════════════════════════════════════════════════════');
console.log(`  TD learning rate (α): ${ALPHA}`);
console.log(`  Discount factor (γ):  ${GAMMA.toFixed(4)} (= 1/φ)`);
console.log(`  Protocols evolved:    ${updatedCount}`);
console.log('');
console.log('  Top protocol weights:');
for (const [proto, w] of weights.slice(0, 5)) {
  const bar = '█'.repeat(Math.round(w * 10)) + '░'.repeat(10 - Math.round(w * 10));
  console.log(`    ${proto.slice(0, 40).padEnd(40)} [${bar}] ${w.toFixed(3)}`);
}
console.log('');

state.lastTrained = new Date().toISOString();
fs.writeFileSync(path.join(LEARN_DIR, 'learning-state.json'), JSON.stringify(state, null, 2));
console.log('✅ Protocol weights evolved → dist/learning/learning-state.json');

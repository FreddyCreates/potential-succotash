#!/usr/bin/env node
/**
 * 🔬 protocol-bot: detect-circular-deps.js
 *
 * Scans all protocol files for circular import dependencies.
 * Builds a directed graph of imports, then runs DFS cycle detection.
 *
 * Exits with code 1 if any cycles are detected.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const PROTO_DIR = path.resolve(__dirname, '..', '..', 'protocols');

const files = fs.readdirSync(PROTO_DIR)
  .filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js');

// Build adjacency list
const graph = {};
for (const file of files) {
  const slug = path.basename(file, '.js');
  const src  = fs.readFileSync(path.join(PROTO_DIR, file), 'utf8');
  graph[slug] = [];

  const importRe = /(?:import|from|require)\s*\(?\s*['"]([^'"]+)['"]\s*\)?/g;
  let m;
  while ((m = importRe.exec(src)) !== null) {
    const dep = m[1];
    if (dep.startsWith('./') || dep.startsWith('../')) {
      const target = path.basename(dep.replace(/\.js$/, ''));
      if (target !== slug && files.some(f => f.startsWith(target))) {
        graph[slug].push(target);
      }
    }
  }
}

// DFS cycle detection
const WHITE = 0; // unvisited
const GRAY  = 1; // in current path
const BLACK = 2; // fully processed

const color = {};
const parent = {};
for (const node of Object.keys(graph)) { color[node] = WHITE; }

const cycles = [];

function dfs(node, trace) {
  color[node] = GRAY;
  for (const neighbor of (graph[node] || [])) {
    if (!(neighbor in graph)) continue;
    if (color[neighbor] === GRAY) {
      // Found a cycle — trace back
      const cycle = [...trace, node, neighbor];
      cycles.push(cycle);
    } else if (color[neighbor] === WHITE) {
      parent[neighbor] = node;
      dfs(neighbor, [...trace, node]);
    }
  }
  color[node] = BLACK;
}

for (const node of Object.keys(graph)) {
  if (color[node] === WHITE) dfs(node, []);
}

console.log('');
console.log('🔬 organism-protocol-bot: Circular Dependency Detection');
console.log('══════════════════════════════════════════════════════════');

if (cycles.length === 0) {
  console.log('  ✅ No circular dependencies detected');
  console.log(`  Analyzed ${files.length} protocols, ${Object.values(graph).flat().length} edges`);
} else {
  console.log(`  ❌ ${cycles.length} circular dependency cycle(s) detected:`);
  for (const cycle of cycles) {
    console.log(`    → ${cycle.join(' → ')}`);
  }
}
console.log('');

// Write dep graph for encyclopedia
const docsDir = path.resolve(__dirname, '..', '..', 'docs');
fs.mkdirSync(docsDir, { recursive: true });
fs.writeFileSync(
  path.join(docsDir, '_protocol-deps.json'),
  JSON.stringify({
    timestamp: new Date().toISOString(),
    graph,
    cycles,
    hasCycles: cycles.length > 0,
  }, null, 2),
);

if (cycles.length > 0) process.exit(1);

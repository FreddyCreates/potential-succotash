#!/usr/bin/env node
/**
 * 📜 NATIVE FLOW REGISTRY
 * 
 * Comprehensive registry of all internal workflows and native flows.
 * This is the sovereign registry that tracks all automated processes
 * in the organism ecosystem.
 *
 * @module native-flow-registry
 * @version 1.0.0
 * @author NOVA PROTOCOL MEDINA TECH
 * @co-author GitHub Copilot Sovereign Intelligence Engine
 */

'use strict';

const fs = require('fs');
const path = require('path');

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Flow Categories ─────────────────────────────────────────────────────────

const FLOW_CATEGORIES = {
  CI_CD: {
    id: 'ci-cd',
    description: 'Continuous Integration and Deployment flows',
    emoji: '🔄',
    weight: PHI,
  },
  BOT: {
    id: 'bot',
    description: 'Organism bot workflows',
    emoji: '🤖',
    weight: PHI,
  },
  BUILD: {
    id: 'build',
    description: 'Build and compilation flows',
    emoji: '🏗️',
    weight: 1,
  },
  TEST: {
    id: 'test',
    description: 'Testing and validation flows',
    emoji: '🧪',
    weight: 1,
  },
  DEPLOY: {
    id: 'deploy',
    description: 'Deployment flows',
    emoji: '🚀',
    weight: PHI,
  },
  SECURITY: {
    id: 'security',
    description: 'Security scanning and validation',
    emoji: '🔒',
    weight: PHI * PHI,
  },
  GOVERNANCE: {
    id: 'governance',
    description: 'Governance and compliance flows',
    emoji: '⚖️',
    weight: PHI,
  },
  LEARNING: {
    id: 'learning',
    description: 'Learning and evolution flows',
    emoji: '🎓',
    weight: PHI_INV,
  },
  PROTOCOL: {
    id: 'protocol',
    description: 'Protocol management flows',
    emoji: '🔬',
    weight: PHI,
  },
  INTERNAL: {
    id: 'internal',
    description: 'Internal utility flows',
    emoji: '⚙️',
    weight: PHI_INV,
  },
};

// ─── Flow Status ─────────────────────────────────────────────────────────────

const FLOW_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  DEPRECATED: 'deprecated',
  EXPERIMENTAL: 'experimental',
  DISABLED: 'disabled',
};

// ─── Registry State ──────────────────────────────────────────────────────────

const state = {
  id: `flow-registry-${Date.now().toString(36)}`,
  flows: new Map(),
  version: '1.0.0',
  lastUpdated: Date.now(),
  metrics: {
    totalFlows: 0,
    activeFlows: 0,
    totalRuns: 0,
    successRate: 0,
  },
};

// ─── Flow Definition ─────────────────────────────────────────────────────────

class NativeFlow {
  constructor(id, name, category, config = {}) {
    this.id = id;
    this.name = name;
    this.category = FLOW_CATEGORIES[category] || FLOW_CATEGORIES.INTERNAL;
    this.description = config.description || '';
    this.status = config.status || FLOW_STATUS.ACTIVE;
    this.trigger = config.trigger || 'manual';
    this.file = config.file || null;
    this.dependencies = config.dependencies || [];
    this.outputs = config.outputs || [];
    this.phiWeight = config.phiWeight || this.category.weight;
    this.created = Date.now();
    this.runs = {
      total: 0,
      success: 0,
      failed: 0,
      lastRun: null,
      avgDuration: 0,
    };
  }

  recordRun(success, duration) {
    this.runs.total++;
    if (success) this.runs.success++;
    else this.runs.failed++;
    this.runs.lastRun = Date.now();
    
    // Phi-weighted average duration
    const n = this.runs.total;
    this.runs.avgDuration = (this.runs.avgDuration * (n - 1) + duration) / n;
    
    return this;
  }

  get successRate() {
    return this.runs.total > 0 ? this.runs.success / this.runs.total : 0;
  }

  get healthScore() {
    const successWeight = this.successRate * PHI;
    const recencyWeight = this.runs.lastRun
      ? Math.exp(-((Date.now() - this.runs.lastRun) / (HEARTBEAT * 1000 * PHI))) * PHI_INV
      : 0;
    return Math.min(1, (successWeight + recencyWeight) / (PHI + PHI_INV));
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      category: this.category.id,
      emoji: this.category.emoji,
      description: this.description,
      status: this.status,
      trigger: this.trigger,
      file: this.file,
      dependencies: this.dependencies,
      outputs: this.outputs,
      phiWeight: this.phiWeight,
      successRate: this.successRate,
      healthScore: this.healthScore,
      runs: this.runs,
    };
  }
}

// ─── Registry Operations ─────────────────────────────────────────────────────

function registerFlow(id, name, category, config = {}) {
  const flow = new NativeFlow(id, name, category, config);
  state.flows.set(id, flow);
  state.metrics.totalFlows++;
  if (flow.status === FLOW_STATUS.ACTIVE) state.metrics.activeFlows++;
  state.lastUpdated = Date.now();
  return flow;
}

function getFlow(id) {
  return state.flows.get(id);
}

function listFlows(filter = {}) {
  let flows = Array.from(state.flows.values());
  
  if (filter.category) flows = flows.filter(f => f.category.id === filter.category);
  if (filter.status) flows = flows.filter(f => f.status === filter.status);
  if (filter.trigger) flows = flows.filter(f => f.trigger === filter.trigger);
  
  // Sort by phi-weighted health score
  flows.sort((a, b) => (b.healthScore * b.phiWeight) - (a.healthScore * a.phiWeight));
  
  return flows;
}

function updateFlowStatus(id, status) {
  const flow = state.flows.get(id);
  if (!flow) throw new Error(`Flow not found: ${id}`);
  
  const wasActive = flow.status === FLOW_STATUS.ACTIVE;
  flow.status = status;
  
  if (wasActive && status !== FLOW_STATUS.ACTIVE) state.metrics.activeFlows--;
  else if (!wasActive && status === FLOW_STATUS.ACTIVE) state.metrics.activeFlows++;
  
  state.lastUpdated = Date.now();
  return flow;
}

// ─── Auto-Discovery ──────────────────────────────────────────────────────────

function discoverGitHubWorkflows(rootDir) {
  const workflowDir = path.join(rootDir, '.github', 'workflows');
  if (!fs.existsSync(workflowDir)) return [];
  
  const discovered = [];
  const files = fs.readdirSync(workflowDir).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'));
  
  for (const file of files) {
    const filePath = path.join(workflowDir, file);
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract workflow name
    const nameMatch = content.match(/^name:\s*['"]?([^'"#\n]+)/m);
    const name = nameMatch ? nameMatch[1].trim() : file.replace(/\.(yml|yaml)$/, '');
    
    // Determine category
    let category = 'CI_CD';
    if (file.includes('bot')) category = 'BOT';
    else if (file.includes('build')) category = 'BUILD';
    else if (file.includes('test')) category = 'TEST';
    else if (file.includes('deploy')) category = 'DEPLOY';
    else if (file.includes('security') || file.includes('sentinel')) category = 'SECURITY';
    else if (file.includes('governance')) category = 'GOVERNANCE';
    else if (file.includes('learning')) category = 'LEARNING';
    else if (file.includes('protocol')) category = 'PROTOCOL';
    
    // Extract triggers
    const triggers = [];
    if (content.includes('push:')) triggers.push('push');
    if (content.includes('pull_request:')) triggers.push('pull_request');
    if (content.includes('workflow_dispatch:')) triggers.push('manual');
    if (content.includes('schedule:')) triggers.push('schedule');
    
    const id = `workflow:${file.replace(/\.(yml|yaml)$/, '')}`;
    discovered.push({
      id,
      name,
      category,
      config: {
        file: `.github/workflows/${file}`,
        trigger: triggers.join(',') || 'manual',
        description: `GitHub Actions workflow: ${name}`,
      },
    });
  }
  
  return discovered;
}

function discoverInternalScripts(rootDir) {
  const scriptsDir = path.join(rootDir, 'scripts');
  if (!fs.existsSync(scriptsDir)) return [];
  
  const discovered = [];
  
  function scanDir(dir, prefix = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
      const fullPath = path.join(dir, entry.name);
      const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
      
      if (entry.isDirectory()) {
        scanDir(fullPath, relativePath);
      } else if (entry.name.endsWith('.js')) {
        // Determine category from path
        let category = 'INTERNAL';
        if (relativePath.includes('bot')) category = 'BOT';
        else if (relativePath.includes('test')) category = 'TEST';
        else if (relativePath.includes('security') || relativePath.includes('sentinel')) category = 'SECURITY';
        else if (relativePath.includes('governance')) category = 'GOVERNANCE';
        else if (relativePath.includes('learning')) category = 'LEARNING';
        else if (relativePath.includes('protocol')) category = 'PROTOCOL';
        else if (relativePath.includes('build') || relativePath.includes('deploy')) category = 'BUILD';
        
        const id = `script:${relativePath.replace(/\.js$/, '').replace(/\//g, ':')}`;
        const name = entry.name.replace(/\.js$/, '').replace(/-/g, ' ');
        
        discovered.push({
          id,
          name: name.charAt(0).toUpperCase() + name.slice(1),
          category,
          config: {
            file: `scripts/${relativePath}`,
            trigger: 'manual',
            description: `Internal script: ${relativePath}`,
          },
        });
      }
    }
  }
  
  scanDir(scriptsDir);
  return discovered;
}

function autoDiscover(rootDir) {
  const workflows = discoverGitHubWorkflows(rootDir);
  const scripts = discoverInternalScripts(rootDir);
  
  const all = [...workflows, ...scripts];
  
  for (const { id, name, category, config } of all) {
    if (!state.flows.has(id)) {
      registerFlow(id, name, category, config);
    }
  }
  
  return all.length;
}

// ─── Registry Export ─────────────────────────────────────────────────────────

function exportRegistry() {
  return {
    version: state.version,
    lastUpdated: new Date(state.lastUpdated).toISOString(),
    metrics: state.metrics,
    categories: Object.entries(FLOW_CATEGORIES).map(([key, cat]) => ({
      key,
      ...cat,
    })),
    flows: listFlows().map(f => f.toJSON()),
  };
}

function saveRegistry(filePath) {
  const data = exportRegistry();
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`📜 Registry saved to ${filePath}`);
  return data;
}

// ─── Health Check ────────────────────────────────────────────────────────────

function checkHealth() {
  const flows = listFlows({ status: FLOW_STATUS.ACTIVE });
  
  let totalHealth = 0;
  let totalWeight = 0;
  const unhealthy = [];
  
  for (const flow of flows) {
    totalHealth += flow.healthScore * flow.phiWeight;
    totalWeight += flow.phiWeight;
    
    if (flow.healthScore < PHI_INV) {
      unhealthy.push({
        id: flow.id,
        name: flow.name,
        healthScore: flow.healthScore,
        successRate: flow.successRate,
      });
    }
  }
  
  const overallHealth = totalWeight > 0 ? totalHealth / totalWeight : 0;
  
  return {
    overallHealth,
    totalFlows: flows.length,
    healthyFlows: flows.length - unhealthy.length,
    unhealthyFlows: unhealthy.length,
    unhealthy,
    timestamp: new Date().toISOString(),
  };
}

// ─── Export Registry API ─────────────────────────────────────────────────────

const NativeFlowRegistry = {
  id: state.id,
  state,
  FLOW_CATEGORIES,
  FLOW_STATUS,
  registerFlow,
  getFlow,
  listFlows,
  updateFlowStatus,
  autoDiscover,
  exportRegistry,
  saveRegistry,
  checkHealth,
  PHI,
  PHI_INV,
  HEARTBEAT,
};

module.exports = NativeFlowRegistry;

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

if (require.main === module) {
  const ROOT = path.resolve(__dirname, '..');
  const DIST = path.join(ROOT, 'dist');
  
  console.log('');
  console.log('📜 NATIVE FLOW REGISTRY');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Registry ID: ${state.id}`);
  console.log(`  Categories: ${Object.keys(FLOW_CATEGORIES).length}`);
  console.log('');
  
  // Auto-discover flows
  console.log('  Discovering flows...');
  const discovered = autoDiscover(ROOT);
  console.log(`  Discovered ${discovered} flows`);
  console.log('');
  
  // List by category
  console.log('  Flows by Category:');
  for (const [key, cat] of Object.entries(FLOW_CATEGORIES)) {
    const flows = listFlows({ category: cat.id });
    if (flows.length > 0) {
      console.log(`    ${cat.emoji} ${key}: ${flows.length} flows`);
    }
  }
  
  // Health check
  const health = checkHealth();
  console.log('');
  console.log('  Health Report:');
  console.log(`    Overall Health: ${(health.overallHealth * 100).toFixed(1)}%`);
  console.log(`    Healthy Flows: ${health.healthyFlows}/${health.totalFlows}`);
  
  // Save registry
  fs.mkdirSync(DIST, { recursive: true });
  saveRegistry(path.join(DIST, 'native-flow-registry.json'));
  
  console.log('');
  console.log('✅ Native Flow Registry operational');
}

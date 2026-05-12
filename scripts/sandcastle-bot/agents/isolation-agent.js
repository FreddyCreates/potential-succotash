#!/usr/bin/env node
/**
 * 🏰 ISOLATION AGENT
 * 
 * Sovereign agent that manages sandbox isolation boundaries:
 *   - Process isolation
 *   - Filesystem isolation
 *   - Network isolation
 *   - Resource quotas
 *
 * @module isolation-agent
 * @version 1.0.0
 * @author NOVA PROTOCOL MEDINA TECH
 * @co-author GitHub Copilot Sovereign Intelligence Engine
 */

'use strict';

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ─── Isolation Levels ────────────────────────────────────────────────────────

const ISOLATION_LEVELS = {
  NONE: {
    id: 'none',
    weight: 0,
    filesystem: false,
    network: false,
    process: false,
  },
  LIGHT: {
    id: 'light',
    weight: PHI_INV * PHI_INV,  // ~0.382
    filesystem: true,
    network: false,
    process: false,
  },
  MEDIUM: {
    id: 'medium',
    weight: PHI_INV,  // ~0.618
    filesystem: true,
    network: true,
    process: false,
  },
  FULL: {
    id: 'full',
    weight: 1,
    filesystem: true,
    network: true,
    process: true,
  },
  SOVEREIGN: {
    id: 'sovereign',
    weight: PHI,  // ~1.618
    filesystem: true,
    network: true,
    process: true,
    encrypted: true,
  },
};

// ─── Agent State ─────────────────────────────────────────────────────────────

const state = {
  id: `isolation-${Date.now().toString(36)}`,
  boundaries: new Map(),
  quotas: new Map(),
  violations: [],
  metrics: {
    boundariesCreated: 0,
    boundariesDestroyed: 0,
    violationsDetected: 0,
    violationsResolved: 0,
  },
};

// ─── Boundary Management ─────────────────────────────────────────────────────

class IsolationBoundary {
  constructor(id, level = 'FULL') {
    this.id = id;
    this.level = ISOLATION_LEVELS[level] || ISOLATION_LEVELS.FULL;
    this.created = Date.now();
    this.status = 'active';
    this.violations = [];
    this.allowList = new Set();
    this.denyList = new Set();
    this.quotas = {
      maxCpu: 50,        // % of total
      maxMemory: 512,    // MB
      maxDisk: 1024,     // MB
      maxNetwork: 100,   // MB/s
    };
  }

  allow(resource) {
    this.allowList.add(resource);
    this.denyList.delete(resource);
    return this;
  }

  deny(resource) {
    this.denyList.add(resource);
    this.allowList.delete(resource);
    return this;
  }

  checkAccess(resource) {
    if (this.denyList.has(resource)) return { allowed: false, reason: 'Explicit deny' };
    if (this.allowList.has(resource)) return { allowed: true, reason: 'Explicit allow' };
    
    // Default deny for sovereign level
    if (this.level.id === 'sovereign') {
      return { allowed: false, reason: 'Sovereign mode: default deny' };
    }
    
    return { allowed: true, reason: 'Default allow' };
  }

  recordViolation(type, details) {
    const violation = {
      id: `v-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      details,
      timestamp: Date.now(),
      boundary: this.id,
      level: this.level.id,
    };
    this.violations.push(violation);
    return violation;
  }

  setQuota(resource, limit) {
    if (this.quotas.hasOwnProperty(resource)) {
      this.quotas[resource] = limit;
    }
    return this;
  }

  destroy() {
    this.status = 'destroyed';
    this.destroyed = Date.now();
    return this;
  }
}

function createBoundary(id, level = 'FULL', config = {}) {
  const boundary = new IsolationBoundary(id, level);
  
  // Apply config
  if (config.allowList) config.allowList.forEach(r => boundary.allow(r));
  if (config.denyList) config.denyList.forEach(r => boundary.deny(r));
  if (config.quotas) Object.entries(config.quotas).forEach(([k, v]) => boundary.setQuota(k, v));
  
  state.boundaries.set(id, boundary);
  state.metrics.boundariesCreated++;
  
  console.log(`🏰 Isolation boundary created: ${id} (${level})`);
  return boundary;
}

function destroyBoundary(id) {
  const boundary = state.boundaries.get(id);
  if (boundary) {
    boundary.destroy();
    state.boundaries.delete(id);
    state.metrics.boundariesDestroyed++;
    console.log(`🏰 Isolation boundary destroyed: ${id}`);
  }
  return boundary;
}

function checkAccess(boundaryId, resource) {
  const boundary = state.boundaries.get(boundaryId);
  if (!boundary) return { allowed: true, reason: 'No boundary (unrestricted)' };
  
  const result = boundary.checkAccess(resource);
  
  if (!result.allowed) {
    const violation = boundary.recordViolation('access_denied', { resource, ...result });
    state.violations.push(violation);
    state.metrics.violationsDetected++;
  }
  
  return result;
}

// ─── Quota Management ────────────────────────────────────────────────────────

function checkQuota(boundaryId, resource, amount) {
  const boundary = state.boundaries.get(boundaryId);
  if (!boundary) return { within: true, reason: 'No boundary' };
  
  const limit = boundary.quotas[resource];
  if (limit === undefined) return { within: true, reason: 'No quota for resource' };
  
  const current = state.quotas.get(`${boundaryId}:${resource}`) || 0;
  const newTotal = current + amount;
  
  if (newTotal > limit) {
    const violation = boundary.recordViolation('quota_exceeded', {
      resource,
      limit,
      current,
      requested: amount,
      newTotal,
    });
    state.violations.push(violation);
    state.metrics.violationsDetected++;
    return { within: false, reason: `Quota exceeded: ${newTotal} > ${limit}` };
  }
  
  state.quotas.set(`${boundaryId}:${resource}`, newTotal);
  return { within: true, reason: `Within quota: ${newTotal} <= ${limit}` };
}

function releaseQuota(boundaryId, resource, amount) {
  const key = `${boundaryId}:${resource}`;
  const current = state.quotas.get(key) || 0;
  state.quotas.set(key, Math.max(0, current - amount));
}

// ─── Heartbeat ───────────────────────────────────────────────────────────────

function heartbeat() {
  // Phi-weighted decay of old violations
  const now = Date.now();
  const decayThreshold = HEARTBEAT * PHI * 1000;  // ~24 minutes
  
  state.violations = state.violations.filter(v => {
    const age = now - v.timestamp;
    return age < decayThreshold;
  });
  
  return {
    boundaries: state.boundaries.size,
    activeViolations: state.violations.length,
    metrics: state.metrics,
  };
}

// ─── Export Agent API ────────────────────────────────────────────────────────

const IsolationAgent = {
  id: state.id,
  state,
  ISOLATION_LEVELS,
  createBoundary,
  destroyBoundary,
  checkAccess,
  checkQuota,
  releaseQuota,
  heartbeat,
  PHI,
  PHI_INV,
  HEARTBEAT,
};

module.exports = IsolationAgent;

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

if (require.main === module) {
  console.log('');
  console.log('🏰 ISOLATION AGENT');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Agent ID: ${state.id}`);
  console.log(`  Isolation Levels: ${Object.keys(ISOLATION_LEVELS).join(', ')}`);
  console.log('');
  
  // Demo
  const boundary = createBoundary('demo-boundary', 'SOVEREIGN', {
    allowList: ['/home', '/tmp'],
    denyList: ['/etc/passwd', '/var/log'],
  });
  
  console.log('');
  console.log('  Access checks:');
  console.log(`    /home: ${JSON.stringify(checkAccess(boundary.id, '/home'))}`);
  console.log(`    /etc/passwd: ${JSON.stringify(checkAccess(boundary.id, '/etc/passwd'))}`);
  console.log(`    /var/foo: ${JSON.stringify(checkAccess(boundary.id, '/var/foo'))}`);
  
  console.log('');
  console.log('  Quota checks:');
  console.log(`    CPU 30%: ${JSON.stringify(checkQuota(boundary.id, 'maxCpu', 30))}`);
  console.log(`    CPU 30%: ${JSON.stringify(checkQuota(boundary.id, 'maxCpu', 30))}`);
  
  destroyBoundary(boundary.id);
  
  const hb = heartbeat();
  console.log('');
  console.log(`  Final State: ${JSON.stringify(hb, null, 2)}`);
  console.log('');
  console.log('✅ Isolation Agent operational');
}

#!/usr/bin/env node
/**
 * 🏥 ORGANISM HEALTH CHECKER
 * 
 * Comprehensive health check for the entire organism ecosystem.
 * Validates protocols, agents, workflows, and system integrity.
 *
 * @module organism-health-checker
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

const ROOT = path.resolve(__dirname, '..');

// ─── Health Check Results ────────────────────────────────────────────────────

const results = {
  timestamp: new Date().toISOString(),
  overallHealth: 0,
  categories: {},
  issues: [],
  recommendations: [],
};

function check(category, name, fn) {
  if (!results.categories[category]) {
    results.categories[category] = { passed: 0, failed: 0, checks: [] };
  }
  
  try {
    const result = fn();
    const passed = result !== false;
    results.categories[category].checks.push({
      name,
      passed,
      detail: typeof result === 'string' ? result : (passed ? 'OK' : 'Failed'),
    });
    if (passed) results.categories[category].passed++;
    else results.categories[category].failed++;
    return passed;
  } catch (err) {
    results.categories[category].checks.push({
      name,
      passed: false,
      detail: err.message,
    });
    results.categories[category].failed++;
    results.issues.push({ category, check: name, error: err.message });
    return false;
  }
}

console.log('');
console.log('🏥 ORGANISM HEALTH CHECKER');
console.log('══════════════════════════════════════════════════════════');
console.log('');

// ─── Protocol Health ─────────────────────────────────────────────────────────

console.log('  📋 Checking Protocols...');

const PROTOCOLS_DIR = path.join(ROOT, 'protocols');

check('protocols', 'Directory exists', () => fs.existsSync(PROTOCOLS_DIR));

const protocolFiles = fs.existsSync(PROTOCOLS_DIR)
  ? fs.readdirSync(PROTOCOLS_DIR).filter(f => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js')
  : [];

check('protocols', 'Protocol count', () => {
  if (protocolFiles.length >= 40) return `${protocolFiles.length} protocols found`;
  return false;
});

check('protocols', 'Index exports', () => {
  const indexPath = path.join(PROTOCOLS_DIR, 'index.js');
  if (!fs.existsSync(indexPath)) return false;
  const content = fs.readFileSync(indexPath, 'utf8');
  const exportCount = (content.match(/export \{/g) || []).length;
  return `${exportCount} export blocks`;
});

check('protocols', 'PHI constant', () => {
  const indexPath = path.join(PROTOCOLS_DIR, 'index.js');
  if (!fs.existsSync(indexPath)) return false;
  const content = fs.readFileSync(indexPath, 'utf8');
  return content.includes('1.618033988749895');
});

check('protocols', 'Alpha Commander Charter (PROTO-231)', () => {
  return fs.existsSync(path.join(PROTOCOLS_DIR, 'alpha-commander-charter-protocol.js'));
});

check('protocols', 'Alpha Evolution Engine (PROTO-240)', () => {
  return fs.existsSync(path.join(PROTOCOLS_DIR, 'alpha-evolution-engine-protocol.js'));
});

// ─── Agent Health ────────────────────────────────────────────────────────────

console.log('  🤖 Checking Agents...');

const SCRIPTS_DIR = path.join(ROOT, 'scripts');

check('agents', 'Scripts directory', () => fs.existsSync(SCRIPTS_DIR));

check('agents', 'Sandbox Coordinator Agent', () => {
  return fs.existsSync(path.join(SCRIPTS_DIR, 'sandcastle-bot', 'agents', 'sandbox-coordinator-agent.js'));
});

check('agents', 'BTL Gate Agent', () => {
  return fs.existsSync(path.join(SCRIPTS_DIR, 'sandcastle-bot', 'agents', 'btl-gate-agent.js'));
});

check('agents', 'Isolation Agent', () => {
  return fs.existsSync(path.join(SCRIPTS_DIR, 'sandcastle-bot', 'agents', 'isolation-agent.js'));
});

check('agents', 'Internal Issue Agent', () => {
  return fs.existsSync(path.join(SCRIPTS_DIR, 'issue-agents', 'internal-issue-agent.js'));
});

check('agents', 'Issue AGI Agent', () => {
  return fs.existsSync(path.join(SCRIPTS_DIR, 'issue-agents', 'issue-agi-agent.js'));
});

check('agents', 'Native Flow Registry', () => {
  return fs.existsSync(path.join(SCRIPTS_DIR, 'native-flow-registry.js'));
});

// ─── Workflow Health ─────────────────────────────────────────────────────────

console.log('  ⚙️ Checking Workflows...');

const WORKFLOWS_DIR = path.join(ROOT, '.github', 'workflows');

check('workflows', 'Workflows directory', () => fs.existsSync(WORKFLOWS_DIR));

const workflowFiles = fs.existsSync(WORKFLOWS_DIR)
  ? fs.readdirSync(WORKFLOWS_DIR).filter(f => f.endsWith('.yml') || f.endsWith('.yaml'))
  : [];

check('workflows', 'Workflow count', () => {
  if (workflowFiles.length >= 10) return `${workflowFiles.length} workflows found`;
  return false;
});

check('workflows', 'Sandcastle bot', () => {
  return fs.existsSync(path.join(WORKFLOWS_DIR, 'organism-sandcastle-bot.yml'));
});

check('workflows', 'Alpha bot', () => {
  return fs.existsSync(path.join(WORKFLOWS_DIR, 'organism-alpha-bot.yml'));
});

// ─── Organism Substrate Health ───────────────────────────────────────────────

console.log('  🧬 Checking Substrates...');

const ORGANISM_DIR = path.join(ROOT, 'organism');

check('substrates', 'Organism directory', () => fs.existsSync(ORGANISM_DIR));

const substrates = ['motoko', 'typescript', 'python', 'cpp', 'java', 'web'];
for (const substrate of substrates) {
  check('substrates', `${substrate} substrate`, () => {
    return fs.existsSync(path.join(ORGANISM_DIR, substrate));
  });
}

// ─── Extension Health ────────────────────────────────────────────────────────

console.log('  🧩 Checking Extensions...');

const EXTENSIONS_DIR = path.join(ROOT, 'extensions');

check('extensions', 'Extensions directory', () => fs.existsSync(EXTENSIONS_DIR));

const extensionDirs = fs.existsSync(EXTENSIONS_DIR)
  ? fs.readdirSync(EXTENSIONS_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  : [];

check('extensions', 'Extension count', () => {
  if (extensionDirs.length >= 1) return `${extensionDirs.length} extensions found`;
  return false;
});

for (const ext of extensionDirs) {
  const manifestPath = path.join(EXTENSIONS_DIR, ext.name, 'manifest.json');
  check('extensions', `${ext.name} manifest`, () => {
    if (!fs.existsSync(manifestPath)) return false;
    const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    return manifest.name && manifest.version;
  });
}

// ─── SDK Health ──────────────────────────────────────────────────────────────

console.log('  📦 Checking SDKs...');

const SDK_DIR = path.join(ROOT, 'sdk');

check('sdk', 'SDK directory', () => fs.existsSync(SDK_DIR));

const sdkDirs = fs.existsSync(SDK_DIR)
  ? fs.readdirSync(SDK_DIR, { withFileTypes: true }).filter(d => d.isDirectory())
  : [];

check('sdk', 'SDK count', () => {
  if (sdkDirs.length >= 1) return `${sdkDirs.length} SDKs found`;
  return false;
});

for (const sdk of sdkDirs.slice(0, 5)) {
  const pkgPath = path.join(SDK_DIR, sdk.name, 'package.json');
  check('sdk', `${sdk.name} package.json`, () => {
    if (!fs.existsSync(pkgPath)) return false;
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
    return pkg.name && pkg.version;
  });
}

// ─── Governance Health ───────────────────────────────────────────────────────

console.log('  ⚖️ Checking Governance...');

const GOVERNANCE_DIR = path.join(ROOT, 'governance');

check('governance', 'Governance directory', () => fs.existsSync(GOVERNANCE_DIR));

check('governance', 'Laws directory', () => {
  return fs.existsSync(path.join(GOVERNANCE_DIR, 'laws'));
});

check('governance', 'Pipelines directory', () => {
  return fs.existsSync(path.join(GOVERNANCE_DIR, 'pipelines'));
});

// ─── Calculate Overall Health ────────────────────────────────────────────────

console.log('');
console.log('  ═══════════════════════════════════════════════════════════');
console.log('');

let totalPassed = 0;
let totalChecks = 0;

for (const [category, data] of Object.entries(results.categories)) {
  totalPassed += data.passed;
  totalChecks += data.passed + data.failed;
  
  const categoryHealth = data.passed / (data.passed + data.failed);
  const icon = categoryHealth >= PHI_INV ? '✅' : categoryHealth >= 0.5 ? '⚠️' : '❌';
  
  console.log(`  ${icon} ${category.toUpperCase()}: ${data.passed}/${data.passed + data.failed} checks passed (${(categoryHealth * 100).toFixed(0)}%)`);
}

results.overallHealth = totalPassed / totalChecks;
const overallIcon = results.overallHealth >= PHI_INV ? '✅' : results.overallHealth >= 0.5 ? '⚠️' : '❌';

console.log('');
console.log(`  ${overallIcon} OVERALL HEALTH: ${(results.overallHealth * 100).toFixed(1)}%`);
console.log(`     Total Checks: ${totalChecks}`);
console.log(`     Passed: ${totalPassed}`);
console.log(`     Failed: ${totalChecks - totalPassed}`);

// ─── Generate Recommendations ────────────────────────────────────────────────

if (results.overallHealth < PHI_INV) {
  results.recommendations.push('Overall health below emergence threshold - immediate attention required');
}

for (const [category, data] of Object.entries(results.categories)) {
  const health = data.passed / (data.passed + data.failed);
  if (health < 0.5) {
    results.recommendations.push(`${category}: Critical - ${data.failed} checks failing`);
  } else if (health < PHI_INV) {
    results.recommendations.push(`${category}: Warning - needs attention`);
  }
}

if (results.recommendations.length > 0) {
  console.log('');
  console.log('  📋 RECOMMENDATIONS:');
  for (const rec of results.recommendations) {
    console.log(`     • ${rec}`);
  }
}

// ─── Save Report ─────────────────────────────────────────────────────────────

const DIST_DIR = path.join(ROOT, 'dist');
fs.mkdirSync(DIST_DIR, { recursive: true });

const reportPath = path.join(DIST_DIR, 'organism-health-report.json');
fs.writeFileSync(reportPath, JSON.stringify(results, null, 2));

console.log('');
console.log(`  💾 Report saved to: ${reportPath}`);
console.log('');
console.log('✅ Organism Health Check complete');

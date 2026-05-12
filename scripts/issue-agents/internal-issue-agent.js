#!/usr/bin/env node
/**
 * 📋 INTERNAL ISSUE AGENT
 * 
 * Sovereign agent for internal issue tracking and management:
 *   - Creates and tracks internal issues
 *   - Phi-weighted priority scoring
 *   - Auto-categorization
 *   - Issue lifecycle management
 *
 * @module internal-issue-agent
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

// ─── Issue Categories ────────────────────────────────────────────────────────

const ISSUE_CATEGORIES = {
  BUG: { id: 'bug', weight: PHI, emoji: '🐛', color: '#d73a4a' },
  FEATURE: { id: 'feature', weight: 1, emoji: '✨', color: '#a2eeef' },
  IMPROVEMENT: { id: 'improvement', weight: PHI_INV, emoji: '📈', color: '#7057ff' },
  SECURITY: { id: 'security', weight: PHI * PHI, emoji: '🔒', color: '#ff0000' },
  PERFORMANCE: { id: 'performance', weight: PHI, emoji: '⚡', color: '#fbca04' },
  DOCS: { id: 'docs', weight: PHI_INV * PHI_INV, emoji: '📚', color: '#0075ca' },
  PROTOCOL: { id: 'protocol', weight: PHI, emoji: '🔬', color: '#5319e7' },
  ORGANISM: { id: 'organism', weight: PHI, emoji: '🧬', color: '#0e8a16' },
};

const ISSUE_STATES = {
  OPEN: 'open',
  IN_PROGRESS: 'in_progress',
  REVIEW: 'review',
  BLOCKED: 'blocked',
  RESOLVED: 'resolved',
  CLOSED: 'closed',
};

// ─── Agent State ─────────────────────────────────────────────────────────────

const state = {
  id: `internal-issue-${Date.now().toString(36)}`,
  issues: new Map(),
  nextIssueId: 1,
  metrics: {
    created: 0,
    resolved: 0,
    blocked: 0,
    avgResolutionTime: 0,
  },
};

// ─── Issue Management ────────────────────────────────────────────────────────

class InternalIssue {
  constructor(id, title, category, config = {}) {
    this.id = id;
    this.title = title;
    this.category = ISSUE_CATEGORIES[category] || ISSUE_CATEGORIES.BUG;
    this.description = config.description || '';
    this.state = ISSUE_STATES.OPEN;
    this.priority = config.priority || 2;  // 0=critical, 1=high, 2=normal, 3=low
    this.created = Date.now();
    this.updated = Date.now();
    this.assignee = config.assignee || null;
    this.labels = config.labels || [];
    this.related = config.related || [];
    this.comments = [];
    this.history = [{ action: 'created', timestamp: this.created }];
  }

  // Phi-weighted priority score
  get phiScore() {
    const baseScore = this.category.weight;
    const priorityMultiplier = Math.pow(PHI, 2 - this.priority);
    const ageBonus = Math.log1p((Date.now() - this.created) / (HEARTBEAT * 1000)) * PHI_INV;
    return baseScore * priorityMultiplier + ageBonus;
  }

  transition(newState) {
    const oldState = this.state;
    this.state = newState;
    this.updated = Date.now();
    this.history.push({ action: 'transition', from: oldState, to: newState, timestamp: this.updated });
    return this;
  }

  assign(assignee) {
    this.assignee = assignee;
    this.updated = Date.now();
    this.history.push({ action: 'assigned', assignee, timestamp: this.updated });
    return this;
  }

  addComment(author, text) {
    const comment = {
      id: `c-${this.comments.length + 1}`,
      author,
      text,
      timestamp: Date.now(),
    };
    this.comments.push(comment);
    this.updated = Date.now();
    return comment;
  }

  addLabel(label) {
    if (!this.labels.includes(label)) {
      this.labels.push(label);
      this.updated = Date.now();
    }
    return this;
  }

  link(issueId) {
    if (!this.related.includes(issueId)) {
      this.related.push(issueId);
      this.updated = Date.now();
    }
    return this;
  }

  toJSON() {
    return {
      id: this.id,
      title: this.title,
      category: this.category.id,
      emoji: this.category.emoji,
      state: this.state,
      priority: this.priority,
      phiScore: this.phiScore,
      description: this.description,
      assignee: this.assignee,
      labels: this.labels,
      related: this.related,
      created: new Date(this.created).toISOString(),
      updated: new Date(this.updated).toISOString(),
      commentsCount: this.comments.length,
    };
  }
}

function createIssue(title, category, config = {}) {
  const id = `INTERNAL-${String(state.nextIssueId++).padStart(5, '0')}`;
  const issue = new InternalIssue(id, title, category, config);
  state.issues.set(id, issue);
  state.metrics.created++;
  console.log(`📋 Issue created: ${id} - ${title}`);
  return issue;
}

function getIssue(id) {
  return state.issues.get(id);
}

function listIssues(filter = {}) {
  let issues = Array.from(state.issues.values());
  
  if (filter.state) issues = issues.filter(i => i.state === filter.state);
  if (filter.category) issues = issues.filter(i => i.category.id === filter.category);
  if (filter.assignee) issues = issues.filter(i => i.assignee === filter.assignee);
  if (filter.label) issues = issues.filter(i => i.labels.includes(filter.label));
  
  // Sort by phi score (descending)
  issues.sort((a, b) => b.phiScore - a.phiScore);
  
  return issues;
}

function resolveIssue(id, resolution = '') {
  const issue = state.issues.get(id);
  if (!issue) throw new Error(`Issue not found: ${id}`);
  
  issue.transition(ISSUE_STATES.RESOLVED);
  issue.resolution = resolution;
  issue.resolvedAt = Date.now();
  
  // Update metrics
  state.metrics.resolved++;
  const resolutionTime = issue.resolvedAt - issue.created;
  const n = state.metrics.resolved;
  state.metrics.avgResolutionTime = (state.metrics.avgResolutionTime * (n - 1) + resolutionTime) / n;
  
  console.log(`✅ Issue resolved: ${id}`);
  return issue;
}

function closeIssue(id) {
  const issue = state.issues.get(id);
  if (!issue) throw new Error(`Issue not found: ${id}`);
  issue.transition(ISSUE_STATES.CLOSED);
  console.log(`🔒 Issue closed: ${id}`);
  return issue;
}

// ─── Auto-Categorization ─────────────────────────────────────────────────────

const CATEGORY_KEYWORDS = {
  BUG: ['bug', 'error', 'crash', 'fail', 'broken', 'fix', 'issue'],
  SECURITY: ['security', 'vulnerability', 'cve', 'exploit', 'auth', 'password', 'token'],
  PERFORMANCE: ['performance', 'slow', 'memory', 'cpu', 'leak', 'optimize', 'speed'],
  FEATURE: ['feature', 'add', 'new', 'implement', 'request', 'enhancement'],
  DOCS: ['doc', 'readme', 'documentation', 'comment', 'typo'],
  PROTOCOL: ['protocol', 'proto-', 'phi', 'heartbeat', 'emergence'],
  ORGANISM: ['organism', 'substrate', 'motoko', 'canister', 'icp'],
};

function autoCategorizefrom(text) {
  const lower = text.toLowerCase();
  let bestCategory = 'BUG';
  let bestScore = 0;
  
  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    const matches = keywords.filter(k => lower.includes(k)).length;
    const score = matches * ISSUE_CATEGORIES[category].weight;
    if (score > bestScore) {
      bestScore = score;
      bestCategory = category;
    }
  }
  
  return bestCategory;
}

// ─── Persistence ─────────────────────────────────────────────────────────────

function saveState(filePath) {
  const data = {
    nextIssueId: state.nextIssueId,
    metrics: state.metrics,
    issues: Array.from(state.issues.values()).map(i => ({
      ...i.toJSON(),
      comments: i.comments,
      history: i.history,
      description: i.description,
    })),
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
  console.log(`💾 State saved to ${filePath}`);
}

function loadState(filePath) {
  if (!fs.existsSync(filePath)) return;
  
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  state.nextIssueId = data.nextIssueId || 1;
  state.metrics = data.metrics || state.metrics;
  
  for (const issueData of (data.issues || [])) {
    const issue = new InternalIssue(issueData.id, issueData.title, issueData.category.toUpperCase());
    issue.state = issueData.state;
    issue.priority = issueData.priority;
    issue.description = issueData.description;
    issue.assignee = issueData.assignee;
    issue.labels = issueData.labels;
    issue.related = issueData.related;
    issue.created = new Date(issueData.created).getTime();
    issue.updated = new Date(issueData.updated).getTime();
    issue.comments = issueData.comments || [];
    issue.history = issueData.history || [];
    state.issues.set(issue.id, issue);
  }
  
  console.log(`📂 State loaded from ${filePath} (${state.issues.size} issues)`);
}

// ─── Export Agent API ────────────────────────────────────────────────────────

const InternalIssueAgent = {
  id: state.id,
  state,
  ISSUE_CATEGORIES,
  ISSUE_STATES,
  createIssue,
  getIssue,
  listIssues,
  resolveIssue,
  closeIssue,
  autoCategorizefrom,
  saveState,
  loadState,
  PHI,
  PHI_INV,
  HEARTBEAT,
};

module.exports = InternalIssueAgent;

// ─── CLI Entry Point ─────────────────────────────────────────────────────────

if (require.main === module) {
  console.log('');
  console.log('📋 INTERNAL ISSUE AGENT');
  console.log('══════════════════════════════════════════════════════════');
  console.log(`  Agent ID: ${state.id}`);
  console.log(`  Categories: ${Object.keys(ISSUE_CATEGORIES).join(', ')}`);
  console.log('');
  
  // Demo
  const bug = createIssue('Protocol gate fails on empty file', 'BUG', {
    description: 'Empty protocol files cause the gate to crash',
    priority: 1,
    labels: ['sandcastle', 'protocol'],
  });
  
  const feature = createIssue('Add native flow registry', 'FEATURE', {
    description: 'Create a comprehensive registry for all internal workflows',
    priority: 2,
    labels: ['registry', 'workflows'],
  });
  
  const security = createIssue('Review CSP policy', 'SECURITY', {
    description: 'Ensure CSP is properly configured',
    priority: 0,
  });
  
  bug.assign('organism-sandcastle-bot');
  bug.addComment('system', 'Automatically detected by sandcastle gate');
  
  console.log('');
  console.log('  Issues by phi score:');
  for (const issue of listIssues()) {
    console.log(`    ${issue.category.emoji} ${issue.id}: ${issue.title} (φ=${issue.phiScore.toFixed(3)})`);
  }
  
  resolveIssue(bug.id, 'Fixed empty file handling');
  closeIssue(bug.id);
  
  console.log('');
  console.log(`  Metrics: ${JSON.stringify(state.metrics, null, 2)}`);
  console.log('');
  console.log('✅ Internal Issue Agent operational');
}

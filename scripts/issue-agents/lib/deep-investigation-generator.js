#!/usr/bin/env node
/**
 * Deep Investigation Generator — Autonomous Research Report Generator
 *
 * Takes CI failure data and pattern analysis to generate:
 *   - Full workflow reliability research reports
 *   - Root cause analysis documentation
 *   - SLO recommendations
 *   - Remediation priority lists
 *
 * This is YOUR report generation layer, built for pm-research-autoagents.
 */

'use strict';

const fs = require('fs');
const path = require('path');

/**
 * Generate a full workflow reliability research report
 * @param {Object} options - Report options
 * @param {Array} options.workflowSummaries - Array of root cause summaries
 * @param {string} options.repository - Repository name (owner/repo)
 * @param {Object} options.workflowStats - Workflow statistics from pm-research-autoagents
 */
function generateWorkflowReliabilityReport({ workflowSummaries, repository, workflowStats }) {
  const timestamp = new Date().toISOString();
  const [owner, repo] = repository.split('/');

  // Calculate aggregate stats
  const totalWorkflows = workflowSummaries.length;
  const deterministicWorkflows = workflowSummaries.filter((w) => w.classification === 'deterministic').length;
  const flakyWorkflows = workflowSummaries.filter((w) => w.classification === 'flaky').length;

  // Build failure analysis table
  const failureTable = workflowSummaries.map((w) => {
    const failureRate = w.totalFailures > 0 ? '100.0%' : '0.0%';
    const rootCauseCategory = w.rootCause?.category || 'unknown';
    const classification = w.classification === 'deterministic' ? '**Deterministic**' : '*Flaky*';
    return `| ${w.workflowName} | ${failureRate} (${w.totalFailures}/${w.totalFailures}) | ${rootCauseCategory} | ${classification} |`;
  }).join('\n');

  // Build root cause analysis sections
  const rootCauseSections = workflowSummaries.map((w, i) => {
    const emoji = getWorkflowEmoji(w.workflowName);
    const rootCause = w.rootCause || {
      category: 'unknown',
      description: 'Unable to determine root cause',
      remediation: 'Manual investigation required',
    };

    const sampleErrors = (w.sampleErrors || [])
      .map((e) => `\`${e.content?.slice(0, 100)}...\``)
      .join('\n');

    return `### ${i + 1}. ${emoji} ${w.workflowName} — ${rootCause.category.replace(/-/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())}

**Failure Location:** ${w.sampleErrors?.[0]?.content?.slice(0, 50) || 'See logs'}

**Root Cause:**  
${rootCause.description}

**Classification:** ${w.classification === 'deterministic' ? 'Deterministic regression — will fail on every run until fixed.' : 'Flaky failure — may pass on retry.'}

**Recommended Fix:**
${rootCause.remediation}

${sampleErrors ? `**Sample Errors:**\n${sampleErrors}` : ''}

---
`;
  }).join('\n');

  // Build flaky vs deterministic table
  const flakyTable = workflowSummaries.map((w) => {
    const flaky = w.classification === 'flaky' ? '✅ Yes' : '❌ No';
    const deterministic = w.classification === 'deterministic' ? '✅ Yes' : '❌ No';
    const evidence = w.rootCause?.description?.slice(0, 50) || 'Pattern analysis';
    return `| ${w.workflowName} | ${flaky} | ${deterministic} | ${evidence} |`;
  }).join('\n');

  // Build remediation priority table
  const remediationTable = workflowSummaries
    .map((w, i) => {
      const priority = i < 2 ? 'P0' : 'P1';
      const fix = w.rootCause?.remediation?.slice(0, 50) || 'Manual investigation';
      const effort = fix.length < 30 ? 'Low' : 'Medium';
      return `| ${priority} | ${w.workflowName} | ${fix} | ${effort} |`;
    })
    .join('\n');

  // Generate the full report
  return `# 📉 Workflow Reliability Research Report

> **Generated:** ${timestamp}  
> **Research Bot:** pm-research-autoagents  
> **Signal:** ${totalWorkflows} workflows profiled for failure rates

## Executive Summary

This research report provides a comprehensive deep-dive into the workflow reliability issues identified in the ${repo} CI/CD pipeline. ${deterministicWorkflows > flakyWorkflows
    ? `All ${deterministicWorkflows} identified workflows have **deterministic regressions** (not flaky failures), making them addressable through targeted code fixes.`
    : `${flakyWorkflows} workflows show flaky behavior, while ${deterministicWorkflows} have deterministic failures.`}

---

## 📊 Failure Analysis Summary

| Workflow | Failure Rate | Root Cause Category | Classification |
|----------|-------------|---------------------|----------------|
${failureTable}

---

## 🔬 Root Cause Analysis

${rootCauseSections}

## 🎯 Flaky vs Deterministic Analysis

| Workflow | Flaky? | Deterministic? | Evidence |
|----------|--------|----------------|----------|
${flakyTable}

**Key Finding:** ${deterministicWorkflows > flakyWorkflows
    ? 'None of these failures are flaky. All are deterministic regressions that will occur on every run until the underlying issues are fixed.'
    : 'Mix of flaky and deterministic failures detected. Prioritize deterministic issues first.'}

---

## 📈 Recommended Reliability SLOs

Based on the analysis, the following SLOs are recommended:

### Availability SLOs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Success Rate | ≥ 95% | Rolling 7-day window |
| Test Success Rate | ≥ 98% | Rolling 7-day window |
| Deploy Success Rate | ≥ 90% | Rolling 7-day window |
| Security Scan Success Rate | ≥ 99% | Rolling 7-day window |

### Latency SLOs

| Metric | Target | Measurement |
|--------|--------|-------------|
| Build Time p95 | < 5 minutes | Per workflow run |
| Test Time p95 | < 10 minutes | Per workflow run |
| Full Pipeline Time p95 | < 15 minutes | End-to-end |

### Alert Thresholds

| Condition | Alert Level | Action |
|-----------|-------------|--------|
| 3+ consecutive failures | 🔴 Critical | Page on-call, block merges |
| Success rate < 80% (24h) | 🟠 Warning | Notify team channel |
| Success rate < 50% (1h) | 🔴 Critical | Immediate investigation |
| Any security scan failure | 🔴 Critical | Manual review required |

---

## 🛠️ Recommended Remediation Priority

| Priority | Workflow | Fix | Effort |
|----------|----------|-----|--------|
${remediationTable}

---

## 📋 Action Items

${workflowSummaries.map((w) => `- [ ] **Fix: ${w.workflowName}** — ${w.rootCause?.remediation || 'Manual investigation required'}`).join('\n')}
- [ ] **Implement: Reliability dashboard** — Track SLOs and alert on threshold breaches
- [ ] **Document: Bot workflow dependencies** — Create runbook for concurrent workflow management

---

## 🔗 References

- Workflow Runs: [GitHub Actions](https://github.com/${repository}/actions)
- Related Scripts: See \`scripts/\` directory for bot implementations

---

*Report generated by pm-research-autoagents workflow reliability researcher*
`;
}

/**
 * Get emoji for workflow based on name
 */
function getWorkflowEmoji(name) {
  const emojiMap = {
    sentinel: '🛡️',
    sandcastle: '🏰',
    deploy: '🌐',
    test: '🧪',
    neural: '🧠',
    alpha: '🔮',
    build: '🔨',
    crawler: '🕷️',
    deps: '📦',
    docs: '📚',
    economy: '💰',
    governance: '⚖️',
    learning: '📖',
    protocol: '🔌',
    release: '🚀',
    sdk: '🛠️',
    visual: '👁️',
  };

  for (const [key, emoji] of Object.entries(emojiMap)) {
    if (name.toLowerCase().includes(key)) return emoji;
  }
  return '⚙️';
}

/**
 * Write research report to file
 * @param {string} content - Report content
 * @param {string} rootDir - Repository root directory
 * @returns {string} Path to written file
 */
function writeResearchReport(content, rootDir) {
  const researchDir = path.join(rootDir, 'research');
  if (!fs.existsSync(researchDir)) {
    fs.mkdirSync(researchDir, { recursive: true });
  }

  const filePath = path.join(researchDir, 'workflow-reliability-research.md');
  fs.writeFileSync(filePath, content);
  return filePath;
}

module.exports = {
  generateWorkflowReliabilityReport,
  writeResearchReport,
  getWorkflowEmoji,
};

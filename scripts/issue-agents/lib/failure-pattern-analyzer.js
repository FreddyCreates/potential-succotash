#!/usr/bin/env node
/**
 * Failure Pattern Analyzer — Root Cause Classification Engine
 *
 * Analyzes CI log content to:
 *   - Extract error messages
 *   - Classify failure types (flaky vs deterministic)
 *   - Identify root cause categories
 *   - Suggest remediation actions
 *
 * This is YOUR deep investigation layer, built for pm-research-autoagents.
 */

'use strict';

/**
 * Known failure patterns with classification and remediation
 */
const FAILURE_PATTERNS = [
  // Git push race conditions
  {
    id: 'git-push-race',
    pattern: /\[rejected\].*\(fetch first\)|failed to push some refs|non-fast-forward/i,
    category: 'race-condition',
    flaky: false,
    description: 'Git push race condition — concurrent workflows pushing to same branch',
    remediation: 'Implement fetch/rebase before push, or use concurrency groups',
  },
  // Security scanner false positives
  {
    id: 'eval-false-positive',
    pattern: /dangerous.*pattern.*detected.*eval|eval\(\)|High-severity dangerous patterns/i,
    category: 'scanner-false-positive',
    flaky: false,
    description: 'Security scanner false positive — flagging safe patterns',
    remediation: 'Update scanner to use context-aware detection (method definitions vs function calls)',
  },
  // Missing package.json
  {
    id: 'missing-package-json',
    pattern: /missing package\.json|package\.json.*not found|Check returned false.*package/i,
    category: 'missing-metadata',
    flaky: false,
    description: 'Missing package.json metadata file',
    remediation: 'Create package.json with required name, version, and main fields',
  },
  // TypeScript compilation errors
  {
    id: 'ts-syntax-error',
    pattern: /TS\d{4}:|error TS|SyntaxError.*typescript|Declaration or statement expected/i,
    category: 'compilation-error',
    flaky: false,
    description: 'TypeScript compilation/syntax error',
    remediation: 'Fix TypeScript syntax errors in the indicated file',
  },
  // Module not found
  {
    id: 'module-not-found',
    pattern: /Cannot find module|Module not found|Could not resolve/i,
    category: 'dependency-error',
    flaky: false,
    description: 'Missing module or import',
    remediation: 'Install missing dependency or fix import path',
  },
  // Test failures
  {
    id: 'test-assertion-failure',
    pattern: /AssertionError|Expected.*to (equal|be|match)|Test failed|FAIL.*spec/i,
    category: 'test-failure',
    flaky: false,
    description: 'Test assertion failure',
    remediation: 'Fix failing test or update expected values',
  },
  // Flaky network errors
  {
    id: 'network-timeout',
    pattern: /ETIMEDOUT|ECONNRESET|network timeout|fetch failed|socket hang up/i,
    category: 'network-error',
    flaky: true,
    description: 'Network timeout or connection reset (likely flaky)',
    remediation: 'Add retry logic for network operations, or increase timeout',
  },
  // Rate limiting
  {
    id: 'rate-limit',
    pattern: /rate limit|API rate limit exceeded|429 Too Many Requests/i,
    category: 'rate-limit',
    flaky: true,
    description: 'API rate limit exceeded',
    remediation: 'Add exponential backoff or use caching',
  },
  // Permission denied
  {
    id: 'permission-denied',
    pattern: /Permission denied|EACCES|403 Forbidden|insufficient permissions/i,
    category: 'permission-error',
    flaky: false,
    description: 'Permission or access denied',
    remediation: 'Check workflow permissions and repository secrets',
  },
  // Out of memory
  {
    id: 'out-of-memory',
    pattern: /JavaScript heap out of memory|ENOMEM|Killed.*memory|OOMKilled/i,
    category: 'resource-error',
    flaky: true,
    description: 'Out of memory error',
    remediation: 'Increase memory allocation or optimize memory usage',
  },
  // Lint errors
  {
    id: 'lint-error',
    pattern: /eslint.*error|Parsing error|prettier.*check.*failed/i,
    category: 'lint-error',
    flaky: false,
    description: 'Linting or formatting error',
    remediation: 'Run linter locally and fix reported issues',
  },
  // Build failures
  {
    id: 'build-failure',
    pattern: /Build failed|npm ERR!|exit code 1.*build|compilation failed/i,
    category: 'build-error',
    flaky: false,
    description: 'Build process failed',
    remediation: 'Review build output and fix compilation issues',
  },
];

/**
 * Analyze log content for failure patterns
 * @param {string} logContent - Raw log content
 * @returns {Object} Analysis result
 */
function analyzeLogContent(logContent) {
  if (!logContent) {
    return {
      patterns: [],
      flaky: null,
      category: 'unknown',
      description: 'Log content not available',
      errorLines: [],
    };
  }

  const matches = [];
  const errorLines = [];

  // Extract error-like lines for context
  const lines = logContent.split('\n');
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/error|fail|fatal|exception|❌/i.test(line) && line.length < 500) {
      errorLines.push({
        lineNumber: i + 1,
        content: line.trim().slice(0, 300),
      });
    }
  }

  // Match against known patterns
  for (const pattern of FAILURE_PATTERNS) {
    if (pattern.pattern.test(logContent)) {
      matches.push({
        id: pattern.id,
        category: pattern.category,
        flaky: pattern.flaky,
        description: pattern.description,
        remediation: pattern.remediation,
      });
    }
  }

  // Determine overall classification
  const isFlaky = matches.some((m) => m.flaky);
  const isDeterministic = matches.some((m) => !m.flaky);

  let classification;
  if (isDeterministic && !isFlaky) {
    classification = 'deterministic';
  } else if (isFlaky && !isDeterministic) {
    classification = 'flaky';
  } else if (isDeterministic && isFlaky) {
    classification = 'mixed';
  } else {
    classification = 'unknown';
  }

  return {
    patterns: matches,
    classification,
    primaryCategory: matches[0]?.category || 'unknown',
    primaryDescription: matches[0]?.description || 'Unknown failure pattern',
    primaryRemediation: matches[0]?.remediation || 'Manual investigation required',
    errorLines: errorLines.slice(0, 10), // Top 10 error lines
  };
}

/**
 * Analyze multiple workflow failures and aggregate findings
 * @param {Array} workflowFailures - Array of workflow failure data
 * @returns {Object} Aggregated analysis
 */
function analyzeWorkflowFailures(workflowFailures) {
  const patternCounts = new Map();
  const categoryCounts = new Map();
  const allAnalyses = [];

  for (const failure of workflowFailures) {
    for (const job of failure.jobs || []) {
      const analysis = analyzeLogContent(job.logs?.content);
      allAnalyses.push({
        runId: failure.runId,
        runNumber: failure.runNumber,
        jobName: job.jobName,
        failedStep: job.failedStep?.name,
        ...analysis,
      });

      for (const pattern of analysis.patterns) {
        patternCounts.set(pattern.id, (patternCounts.get(pattern.id) || 0) + 1);
        categoryCounts.set(pattern.category, (categoryCounts.get(pattern.category) || 0) + 1);
      }
    }
  }

  // Sort by frequency
  const topPatterns = [...patternCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([id, count]) => {
      const pattern = FAILURE_PATTERNS.find((p) => p.id === id);
      return { id, count, ...pattern };
    });

  const topCategories = [...categoryCounts.entries()]
    .sort((a, b) => b[1] - a[1])
    .map(([category, count]) => ({ category, count }));

  // Determine if failures are mostly flaky or deterministic
  const flakyCount = allAnalyses.filter((a) => a.classification === 'flaky').length;
  const deterministicCount = allAnalyses.filter((a) => a.classification === 'deterministic').length;

  return {
    totalAnalyzed: allAnalyses.length,
    flakyCount,
    deterministicCount,
    overallClassification: deterministicCount > flakyCount ? 'deterministic' : 'flaky',
    topPatterns,
    topCategories,
    analyses: allAnalyses,
  };
}

/**
 * Generate a root cause summary for a workflow
 * @param {Object} workflowData - Workflow failure data from ci-log-collector
 * @returns {Object} Root cause summary
 */
function generateRootCauseSummary(workflowData) {
  const analysis = analyzeWorkflowFailures(workflowData.failures);

  const rootCause = analysis.topPatterns[0] || null;

  return {
    workflowName: workflowData.workflowName,
    totalFailures: workflowData.totalFailures,
    analyzedRuns: workflowData.analyzed,
    classification: analysis.overallClassification,
    rootCause: rootCause ? {
      id: rootCause.id,
      category: rootCause.category,
      description: rootCause.description,
      remediation: rootCause.remediation,
      occurrences: rootCause.count,
    } : null,
    secondaryPatterns: analysis.topPatterns.slice(1, 4),
    flakiness: {
      flakyRuns: analysis.flakyCount,
      deterministicRuns: analysis.deterministicCount,
      flakyPercent: analysis.totalAnalyzed > 0
        ? ((analysis.flakyCount / analysis.totalAnalyzed) * 100).toFixed(1)
        : 0,
    },
    sampleErrors: analysis.analyses
      .flatMap((a) => a.errorLines)
      .slice(0, 5),
  };
}

module.exports = {
  FAILURE_PATTERNS,
  analyzeLogContent,
  analyzeWorkflowFailures,
  generateRootCauseSummary,
};

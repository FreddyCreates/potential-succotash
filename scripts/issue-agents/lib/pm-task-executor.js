#!/usr/bin/env node
/**
 * PM Task Executor — Automated PM Workflow Actions
 *
 * Executes the PM tasks identified by mini-brains:
 *   - Escalate stale PRs with blockers
 *   - Split long-lived drafts recommendations
 *   - Set review SLA by criticality
 *   - Triage stale issues
 *   - Apply scope labels to unlabeled issues
 *   - Convert outdated requests into roadmap
 *   - Health score escalation
 *   - Bot review before release trains
 *
 * This is YOUR PM automation layer, built for pm-research-autoagents.
 */

'use strict';

const DAY_MS = 24 * 60 * 60 * 1000;

/**
 * Create a PM Task Executor instance
 * @param {Object} options - Configuration options
 * @param {string} options.owner - Repository owner
 * @param {string} options.repo - Repository name
 * @param {string} options.token - GitHub token
 * @param {Function} options.gh - GitHub API function
 */
function createPMTaskExecutor({ owner, repo, token, gh }) {
  function daysAgo(isoDate) {
    return (Date.now() - new Date(isoDate).getTime()) / DAY_MS;
  }

  /**
   * Scope labels with colors and descriptions
   */
  const SCOPE_LABELS = {
    'scope/ci': { color: '0e8a16', description: 'CI/CD and workflow automation' },
    'scope/protocols': { color: '1d76db', description: 'Protocol layer and extensions' },
    'scope/workers': { color: '5319e7', description: 'Cloudflare Workers infrastructure' },
    'scope/extension': { color: 'fbca04', description: 'Browser extension (Vigil/Jarvis)' },
    'scope/docs': { color: 'd4c5f9', description: 'Documentation and guides' },
    'scope/sdk': { color: 'c5def5', description: 'SDK and developer tools' },
    'scope/organism': { color: 'f9d0c4', description: 'Core organism/ICP canister' },
    'scope/security': { color: 'b60205', description: 'Security and vulnerability fixes' },
  };

  /**
   * Criticality labels for SLA
   */
  const CRITICALITY_LABELS = {
    'criticality/p0-critical': { color: 'b60205', description: 'Critical — review within 4 hours', slaHours: 4 },
    'criticality/p1-high': { color: 'd93f0b', description: 'High priority — review within 24 hours', slaHours: 24 },
    'criticality/p2-medium': { color: 'fbca04', description: 'Medium priority — review within 72 hours', slaHours: 72 },
    'criticality/p3-low': { color: '0e8a16', description: 'Low priority — review within 7 days', slaHours: 168 },
  };

  /**
   * Ensure a label exists in the repository
   */
  async function ensureLabel(name, color, description) {
    const existing = await gh(`/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`);
    if (existing) return;
    await gh(`/repos/${owner}/${repo}/labels`, { method: 'POST', body: { name, color, description } });
  }

  /**
   * Ensure all scope and criticality labels exist
   */
  async function ensureAllLabels() {
    const allLabels = { ...SCOPE_LABELS, ...CRITICALITY_LABELS };
    for (const [name, { color, description }] of Object.entries(allLabels)) {
      await ensureLabel(name, color, description);
    }
  }

  /**
   * Infer scope label from issue/PR content
   */
  function inferScopeLabel(title, body) {
    const text = `${title} ${body}`.toLowerCase();

    const scopeKeywords = {
      'scope/ci': ['workflow', 'ci', 'github action', 'bot', 'automation', 'deploy-bot', 'test-bot'],
      'scope/protocols': ['protocol', 'alpha', 'math', 'cognitive', 'temporal'],
      'scope/workers': ['worker', 'cloudflare', 'wrangler', 'd1', 'kv', 'durable'],
      'scope/extension': ['extension', 'jarvis', 'vigil', 'sidepanel', 'background', 'chrome'],
      'scope/docs': ['documentation', 'readme', 'docs/', 'guide', 'tutorial'],
      'scope/sdk': ['sdk', 'package', 'npm', 'library'],
      'scope/organism': ['organism', 'icp', 'canister', 'motoko', 'dfx'],
      'scope/security': ['security', 'vulnerability', 'cve', 'sentinel', 'scanner'],
    };

    for (const [label, keywords] of Object.entries(scopeKeywords)) {
      if (keywords.some((kw) => text.includes(kw))) {
        return label;
      }
    }

    return null;
  }

  /**
   * Infer criticality from issue/PR content
   */
  function inferCriticality(title, body, labels) {
    const text = `${title} ${body}`.toLowerCase();
    const labelNames = labels.map((l) => (typeof l === 'string' ? l : l.name).toLowerCase());

    // Check existing labels
    if (labelNames.some((l) => l.includes('critical') || l.includes('security') || l.includes('urgent'))) {
      return 'criticality/p0-critical';
    }
    if (labelNames.some((l) => l.includes('bug') || l.includes('breaking'))) {
      return 'criticality/p1-high';
    }
    if (labelNames.some((l) => l.includes('enhancement') || l.includes('feature'))) {
      return 'criticality/p2-medium';
    }

    // Infer from text
    if (/security|vulnerability|cve|critical|urgent|breaking/i.test(text)) {
      return 'criticality/p0-critical';
    }
    if (/bug|error|fail|crash|regression/i.test(text)) {
      return 'criticality/p1-high';
    }
    if (/feature|enhancement|improve/i.test(text)) {
      return 'criticality/p2-medium';
    }

    return 'criticality/p3-low';
  }

  /**
   * Apply scope labels to unlabeled issues
   * @param {Array} issues - Array of issues
   * @returns {Object} Results
   */
  async function applyUnlabeledIssueScopes(issues) {
    const unlabeled = issues.filter((i) => !i.pull_request && (i.labels || []).length === 0);
    const results = [];

    for (const issue of unlabeled) {
      const scopeLabel = inferScopeLabel(issue.title, issue.body || '');
      if (scopeLabel) {
        try {
          await gh(`/repos/${owner}/${repo}/issues/${issue.number}/labels`, {
            method: 'POST',
            body: { labels: [scopeLabel] },
          });
          results.push({ number: issue.number, title: issue.title, label: scopeLabel, status: 'labeled' });
        } catch (err) {
          results.push({ number: issue.number, title: issue.title, label: scopeLabel, status: 'error', error: err.message });
        }
      } else {
        results.push({ number: issue.number, title: issue.title, label: null, status: 'no-match' });
      }
    }

    return { total: unlabeled.length, results };
  }

  /**
   * Generate stale PR escalation report
   * @param {Array} pulls - Array of pull requests
   * @param {number} staleThresholdDays - Days before PR is considered stale
   * @returns {Object} Escalation report
   */
  function generateStalePREscalation(pulls, staleThresholdDays = 3) {
    const stalePRs = pulls.filter((p) => daysAgo(p.updated_at) > staleThresholdDays);

    const escalations = stalePRs.map((pr) => {
      const daysStale = Math.floor(daysAgo(pr.updated_at));
      const criticality = inferCriticality(pr.title, pr.body || '', pr.labels || []);
      const slaHours = CRITICALITY_LABELS[criticality]?.slaHours || 168;
      const slaBreach = daysStale * 24 > slaHours;

      return {
        number: pr.number,
        title: pr.title,
        author: pr.user?.login,
        daysStale,
        isDraft: pr.draft,
        criticality,
        slaBreach,
        reviewers: pr.requested_reviewers?.map((r) => r.login) || [],
        url: pr.html_url,
        recommendation: pr.draft
          ? 'Convert to ready for review or split into mergeable slices'
          : slaBreach
            ? `URGENT: SLA breached by ${Math.floor(daysStale * 24 - slaHours)} hours — escalate to team lead`
            : 'Assign reviewer and set follow-up reminder',
      };
    });

    return {
      total: stalePRs.length,
      slaBreach: escalations.filter((e) => e.slaBreach).length,
      drafts: escalations.filter((e) => e.isDraft).length,
      escalations,
    };
  }

  /**
   * Generate draft PR splitting recommendations
   * @param {Array} pulls - Array of pull requests
   * @param {number} longLivedThresholdDays - Days before draft is considered long-lived
   * @returns {Object} Splitting recommendations
   */
  function generateDraftSplitRecommendations(pulls, longLivedThresholdDays = 7) {
    const drafts = pulls.filter((p) => p.draft);
    const longLivedDrafts = drafts.filter((p) => daysAgo(p.created_at) > longLivedThresholdDays);

    const recommendations = longLivedDrafts.map((pr) => {
      const age = Math.floor(daysAgo(pr.created_at));
      return {
        number: pr.number,
        title: pr.title,
        author: pr.user?.login,
        ageDays: age,
        url: pr.html_url,
        recommendation: age > 14
          ? 'CRITICAL: Draft is over 2 weeks old — require split or close with explanation'
          : 'Review draft scope and identify minimal mergeable slice',
      };
    });

    return {
      totalDrafts: drafts.length,
      longLived: longLivedDrafts.length,
      recommendations,
    };
  }

  /**
   * Generate stale issue triage report
   * @param {Array} issues - Array of issues
   * @param {number} staleThresholdDays - Days before issue is considered stale
   * @returns {Object} Triage report
   */
  function generateStaleIssueTriage(issues, staleThresholdDays = 14) {
    const issueOnly = issues.filter((i) => !i.pull_request);
    const staleIssues = issueOnly.filter((i) => daysAgo(i.updated_at) > staleThresholdDays);

    const triage = staleIssues.map((issue) => {
      const daysStale = Math.floor(daysAgo(issue.updated_at));
      const hasLabels = (issue.labels || []).length > 0;
      const hasAssignee = (issue.assignees || []).length > 0;

      let action;
      if (daysStale > 60) {
        action = 'CLOSE: Stale for 60+ days — close with "closing stale" rationale or convert to roadmap';
      } else if (daysStale > 30) {
        action = 'ESCALATE: Stale for 30+ days — ping author and consider closing';
      } else {
        action = 'TRIAGE: Add labels and assign owner';
      }

      return {
        number: issue.number,
        title: issue.title,
        author: issue.user?.login,
        daysStale,
        hasLabels,
        hasAssignee,
        labels: (issue.labels || []).map((l) => l.name),
        url: issue.html_url,
        action,
      };
    });

    return {
      totalOpen: issueOnly.length,
      stale: staleIssues.length,
      needsLabels: triage.filter((t) => !t.hasLabels).length,
      needsAssignee: triage.filter((t) => !t.hasAssignee).length,
      triage: triage.sort((a, b) => b.daysStale - a.daysStale),
    };
  }

  /**
   * Generate health score alert
   * @param {Object} healthReport - Organism health report
   * @param {number} threshold - Alert threshold (0-1)
   * @returns {Object} Health alert
   */
  function generateHealthAlert(healthReport, threshold = 0.7) {
    const health = healthReport?.overallHealth || 0;
    const categories = healthReport?.categories || {};

    const weakCategories = Object.entries(categories)
      .filter(([, data]) => (data.score || 0) < threshold)
      .map(([name, data]) => ({
        name,
        score: data.score || 0,
        issues: data.issues || [],
      }))
      .sort((a, b) => a.score - b.score);

    const alert = health < threshold
      ? 'CRITICAL'
      : health < 0.85
        ? 'WARNING'
        : 'OK';

    return {
      overallHealth: health,
      threshold,
      alert,
      belowThreshold: health < threshold,
      weakCategories,
      recommendation: weakCategories.length > 0
        ? `Focus PM priorities on weakest category: ${weakCategories[0].name}`
        : 'Health is good — maintain current practices',
    };
  }

  return {
    ensureLabel,
    ensureAllLabels,
    inferScopeLabel,
    inferCriticality,
    applyUnlabeledIssueScopes,
    generateStalePREscalation,
    generateDraftSplitRecommendations,
    generateStaleIssueTriage,
    generateHealthAlert,
    SCOPE_LABELS,
    CRITICALITY_LABELS,
  };
}

module.exports = { createPMTaskExecutor };

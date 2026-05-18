#!/usr/bin/env node
/**
 * CI Log Collector — Native GitHub Actions Log Collection
 *
 * Replaces external MCP tools with direct GitHub API calls for:
 *   - Listing workflow runs
 *   - Fetching job details
 *   - Downloading job logs
 *   - Parsing failure patterns
 *
 * This is YOUR tooling, built for pm-research-autoagents.
 */

'use strict';

const apiBase = 'https://api.github.com';

/**
 * Create a CI Log Collector instance
 * @param {string} owner - Repository owner
 * @param {string} repo - Repository name
 * @param {string} token - GitHub token
 */
function createCILogCollector(owner, repo, token) {
  async function gh(pathname, { method = 'GET', accept } = {}) {
    const res = await fetch(`${apiBase}${pathname}`, {
      method,
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: accept || 'application/vnd.github+json',
        'User-Agent': 'pm-research-autoagents/ci-log-collector',
        'X-GitHub-Api-Version': '2022-11-28',
      },
    });

    if (res.status === 404) return null;
    if (!res.ok) {
      const text = await res.text();
      throw new Error(`GitHub API ${method} ${pathname} failed: ${res.status} ${text}`);
    }

    if (accept === 'application/vnd.github.v3.raw') {
      return res.text();
    }
    return res.status === 204 ? null : res.json();
  }

  /**
   * List all workflows in the repository
   */
  async function listWorkflows() {
    const data = await gh(`/repos/${owner}/${repo}/actions/workflows`);
    return data?.workflows || [];
  }

  /**
   * List workflow runs with optional filters
   * @param {Object} options - Filter options
   * @param {string} [options.workflowId] - Specific workflow ID or filename
   * @param {string} [options.status] - Filter by status (queued, in_progress, completed)
   * @param {string} [options.conclusion] - Filter by conclusion (success, failure, etc.)
   * @param {number} [options.perPage] - Results per page (max 100)
   */
  async function listWorkflowRuns({ workflowId, status, conclusion, perPage = 100 } = {}) {
    let path = workflowId
      ? `/repos/${owner}/${repo}/actions/workflows/${workflowId}/runs`
      : `/repos/${owner}/${repo}/actions/runs`;

    const params = new URLSearchParams();
    if (status) params.set('status', status);
    if (conclusion) params.set('conclusion', conclusion);
    params.set('per_page', String(perPage));

    path += `?${params.toString()}`;
    const data = await gh(path);
    return data?.workflow_runs || [];
  }

  /**
   * Get a specific workflow run
   * @param {number} runId - Workflow run ID
   */
  async function getWorkflowRun(runId) {
    return gh(`/repos/${owner}/${repo}/actions/runs/${runId}`);
  }

  /**
   * List jobs for a workflow run
   * @param {number} runId - Workflow run ID
   */
  async function listWorkflowJobs(runId) {
    const data = await gh(`/repos/${owner}/${repo}/actions/runs/${runId}/jobs`);
    return data?.jobs || [];
  }

  /**
   * Get logs for a specific job
   * @param {number} jobId - Job ID
   */
  async function getJobLogs(jobId) {
    try {
      // GitHub returns a redirect to the log download URL
      const res = await fetch(`${apiBase}/repos/${owner}/${repo}/actions/jobs/${jobId}/logs`, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: 'application/vnd.github+json',
          'User-Agent': 'pm-research-autoagents/ci-log-collector',
          'X-GitHub-Api-Version': '2022-11-28',
        },
        redirect: 'follow',
      });

      if (!res.ok) {
        if (res.status === 410) {
          // Logs expired
          return { content: null, expired: true };
        }
        return { content: null, error: `HTTP ${res.status}` };
      }

      const content = await res.text();
      return { content, expired: false };
    } catch (err) {
      return { content: null, error: err.message };
    }
  }

  /**
   * Get logs for all failed jobs in a workflow run
   * @param {number} runId - Workflow run ID
   */
  async function getFailedJobLogs(runId) {
    const jobs = await listWorkflowJobs(runId);
    const failedJobs = jobs.filter((j) => j.conclusion === 'failure');

    const results = [];
    for (const job of failedJobs) {
      const logs = await getJobLogs(job.id);
      results.push({
        jobId: job.id,
        jobName: job.name,
        steps: job.steps || [],
        failedStep: job.steps?.find((s) => s.conclusion === 'failure'),
        logs,
      });
    }
    return results;
  }

  /**
   * Collect comprehensive failure data for a workflow
   * @param {string} workflowName - Workflow name or ID
   * @param {number} [limit=10] - Max number of failed runs to analyze
   */
  async function collectWorkflowFailures(workflowName, limit = 10) {
    const runs = await listWorkflowRuns({ conclusion: 'failure', perPage: limit });
    const workflowRuns = runs.filter(
      (r) => r.name === workflowName || r.path?.includes(workflowName)
    );

    const failures = [];
    for (const run of workflowRuns.slice(0, limit)) {
      const failedLogs = await getFailedJobLogs(run.id);
      failures.push({
        runId: run.id,
        runNumber: run.run_number,
        createdAt: run.created_at,
        headSha: run.head_sha,
        headBranch: run.head_branch,
        event: run.event,
        jobs: failedLogs,
      });
    }

    return {
      workflowName,
      totalFailures: workflowRuns.length,
      analyzed: failures.length,
      failures,
    };
  }

  return {
    listWorkflows,
    listWorkflowRuns,
    getWorkflowRun,
    listWorkflowJobs,
    getJobLogs,
    getFailedJobLogs,
    collectWorkflowFailures,
  };
}

module.exports = { createCILogCollector };

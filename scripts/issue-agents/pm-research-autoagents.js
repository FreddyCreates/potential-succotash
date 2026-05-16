#!/usr/bin/env node
/**
 * PM + Research Autoagents
 *
 * Real mini-brain fleet:
 *   - 5 Internal PM agents (repo-internal + GitHub signals)
 *   - 5 Research agents (repo analytics + GitHub analytics)
 *
 * Delivery modes:
 *   1) Upsert actionable GitHub Issues (stable threads)
 *   2) Write local intelligence report artifacts (JSON + Markdown)
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..');
const DAY_MS = 24 * 60 * 60 * 1000;
const [owner, repo] = (process.env.GITHUB_REPOSITORY || '').split('/');
const token = process.env.GH_TOKEN || process.env.GITHUB_TOKEN;

if (!owner || !repo) throw new Error('GITHUB_REPOSITORY is required (owner/repo)');
if (!token) throw new Error('GH_TOKEN or GITHUB_TOKEN is required');

const apiBase = 'https://api.github.com';

async function gh(pathname, { method = 'GET', body } = {}) {
  const res = await fetch(`${apiBase}${pathname}`, {
    method,
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'pm-research-autoagents',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(body ? { 'Content-Type': 'application/json' } : {}),
    },
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 404 && method === 'GET') return null;
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`GitHub API ${method} ${pathname} failed: ${res.status} ${text}`);
  }

  return res.status === 204 ? null : res.json();
}

function readJson(relPath, fallback = null) {
  const file = path.join(ROOT, relPath);
  if (!fs.existsSync(file)) return fallback;
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'));
  } catch {
    return fallback;
  }
}

function daysAgo(isoDate) {
  return (Date.now() - new Date(isoDate).getTime()) / DAY_MS;
}

function bucketKeywords(items) {
  const buckets = new Map();
  const stop = new Set(['the', 'and', 'for', 'with', 'from', 'that', 'this', 'into', 'when', 'your', 'have', 'will', 'are']);

  for (const item of items) {
    const text = `${item.title || ''} ${item.body || ''}`.toLowerCase();
    const words = text.match(/[a-z][a-z0-9-]{2,}/g) || [];
    for (const w of words) {
      if (stop.has(w)) continue;
      buckets.set(w, (buckets.get(w) || 0) + 1);
    }
  }

  return [...buckets.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 8)
    .map(([word, count]) => ({ word, count }));
}

function collectDocsSignals() {
  const docsDir = path.join(ROOT, 'docs');
  if (!fs.existsSync(docsDir)) return { fileCount: 0, todoCount: 0, missingReadme: true };

  const stack = [docsDir];
  const mdFiles = [];
  while (stack.length > 0) {
    const dir = stack.pop();
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) stack.push(full);
      else if (entry.isFile() && entry.name.endsWith('.md')) mdFiles.push(full);
    }
  }

  let todoCount = 0;
  for (const file of mdFiles) {
    const content = fs.readFileSync(file, 'utf8');
    todoCount += (content.match(/\b(TODO|FIXME|TBD)\b/gi) || []).length;
  }

  return {
    fileCount: mdFiles.length,
    todoCount,
    missingReadme: !fs.existsSync(path.join(ROOT, 'README.md')),
  };
}

function collectInternalSignals() {
  const healthReport = readJson('dist/organism-health-report.json', {});
  const fleetCensus = readJson('docs/fleet-census.json', {});
  const topology = readJson('docs/topology.json', {});

  const protocolsDir = path.join(ROOT, 'protocols');
  const issueAgentsDir = path.join(ROOT, 'scripts', 'issue-agents');

  const protocolFiles = fs.existsSync(protocolsDir)
    ? fs.readdirSync(protocolsDir).filter((f) => f.endsWith('.js') && f !== 'index.js' && f !== 'native-runtime.js')
    : [];

  const issueAgentScripts = fs.existsSync(issueAgentsDir)
    ? fs.readdirSync(issueAgentsDir).filter((f) => f.endsWith('.js'))
    : [];

  return {
    health: {
      overall: Number(healthReport.overallHealth || 0),
      timestamp: healthReport.timestamp || null,
      categories: Object.keys(healthReport.categories || {}).length,
    },
    fleet: {
      totalBots: Number(fleetCensus.totalBots || 0),
      healthy: Number(fleetCensus.healthy || 0),
      degraded: Number(fleetCensus.degraded || 0),
      unknownBots: Array.isArray(fleetCensus.unknownBots) ? fleetCensus.unknownBots.length : 0,
    },
    topology: {
      totalFiles: Number(topology.summary?.totalFiles || 0),
      sections: Number(topology.summary?.sections || 0),
      jsFiles: Number(topology.summary?.langCounts?.JavaScript || 0),
      tsFiles: Number(topology.summary?.langCounts?.TypeScript || 0),
    },
    repository: {
      protocolCount: protocolFiles.length,
      issueAgentCount: issueAgentScripts.length,
      issueAgents: issueAgentScripts,
    },
  };
}

function buildBody(agent) {
  const header = `# ${agent.emoji} ${agent.title}\n\n`;
  const summary = `**Scope:** ${agent.scope}\n\n**Signal:** ${agent.signal}\n\n`;
  const findings = [
    '## Findings',
    ...agent.findings.map((f) => `- ${f}`),
    '',
    '## Recommended Next Actions',
    ...agent.actions.map((a) => `- [ ] ${a}`),
    '',
    `> Generated by pm-research-autoagents at ${new Date().toISOString()}`,
  ].join('\n');
  return `${header}${summary}${findings}`;
}

function writeLocalReport(agents) {
  const outDir = path.join(ROOT, 'dist', 'autoagents');
  fs.mkdirSync(outDir, { recursive: true });

  const payload = {
    generatedAt: new Date().toISOString(),
    repository: `${owner}/${repo}`,
    totalAgents: agents.length,
    byTrack: {
      PM: agents.filter((a) => a.track === 'PM').length,
      RESEARCH: agents.filter((a) => a.track === 'RESEARCH').length,
    },
    agents: agents.map((a) => ({
      id: a.id,
      track: a.track,
      title: a.title,
      signal: a.signal,
      findings: a.findings,
      actions: a.actions,
    })),
  };

  const jsonPath = path.join(outDir, 'pm-research-report.json');
  fs.writeFileSync(jsonPath, JSON.stringify(payload, null, 2));

  const md = [
    '# PM + Research Autoagents Report',
    '',
    `- Generated: ${payload.generatedAt}`,
    `- Repository: ${payload.repository}`,
    `- Agents: ${payload.totalAgents} (${payload.byTrack.PM} PM + ${payload.byTrack.RESEARCH} research)`,
    '',
    '## Agent Signals',
    ...agents.map((a) => `- [${a.track}] ${a.title}: ${a.signal}`),
    '',
  ].join('\n');

  const mdPath = path.join(outDir, 'pm-research-report.md');
  fs.writeFileSync(mdPath, md);

  return { jsonPath, mdPath };
}

async function ensureLabel(name, color, description) {
  const existing = await gh(`/repos/${owner}/${repo}/labels/${encodeURIComponent(name)}`);
  if (existing) return;
  await gh(`/repos/${owner}/${repo}/labels`, { method: 'POST', body: { name, color, description } });
}

async function upsertIssue({ title, labels, body }) {
  const openIssues = await gh(`/repos/${owner}/${repo}/issues?state=open&per_page=100`);
  const match = openIssues.find((i) => !i.pull_request && i.title === title);

  if (match) {
    await gh(`/repos/${owner}/${repo}/issues/${match.number}`, {
      method: 'PATCH',
      body: { body, labels },
    });
    return { mode: 'updated', number: match.number };
  }

  const created = await gh(`/repos/${owner}/${repo}/issues`, {
    method: 'POST',
    body: { title, body, labels },
  });
  return { mode: 'created', number: created.number };
}

async function main() {
  console.log(`Running PM + Research autoagents for ${owner}/${repo}`);

  const [issues, pulls, runs, releases, commits] = await Promise.all([
    gh(`/repos/${owner}/${repo}/issues?state=open&per_page=100`),
    gh(`/repos/${owner}/${repo}/pulls?state=open&per_page=100`),
    gh(`/repos/${owner}/${repo}/actions/runs?per_page=100`),
    gh(`/repos/${owner}/${repo}/releases?per_page=20`),
    gh(`/repos/${owner}/${repo}/commits?sha=main&per_page=100`),
  ]);

  const issueOnly = issues.filter((i) => !i.pull_request);
  const staleIssues = issueOnly.filter((i) => daysAgo(i.updated_at) > 14);
  const unlabeledIssues = issueOnly.filter((i) => (i.labels || []).length === 0);

  const stalePRs = pulls.filter((p) => daysAgo(p.updated_at) > 3);
  const draftPRs = pulls.filter((p) => p.draft);

  const failedRuns = runs.workflow_runs.filter((r) => r.conclusion === 'failure');
  const recentRuns = runs.workflow_runs.filter((r) => daysAgo(r.created_at) <= 7);
  const recentFailures = recentRuns.filter((r) => r.conclusion === 'failure');

  const docsSignals = collectDocsSignals();
  const internalSignals = collectInternalSignals();

  const releasesSorted = [...releases].sort((a, b) => new Date(b.published_at || b.created_at) - new Date(a.published_at || a.created_at));
  const latestRelease = releasesSorted[0] || null;
  const latestReleaseDate = latestRelease ? new Date(latestRelease.published_at || latestRelease.created_at).getTime() : null;
  const unreleasedCommits = latestReleaseDate
    ? commits.filter((c) => new Date(c.commit.author.date).getTime() > latestReleaseDate).length
    : commits.length;

  const now = Date.now();
  const recent14 = commits.filter((c) => now - new Date(c.commit.author.date).getTime() <= 14 * DAY_MS).length;
  const prev14 = commits.filter((c) => {
    const age = now - new Date(c.commit.author.date).getTime();
    return age > 14 * DAY_MS && age <= 28 * DAY_MS;
  }).length;

  const authorCounts = new Map();
  for (const c of commits.slice(0, 60)) {
    const author = c.author?.login || c.commit?.author?.name || 'unknown';
    authorCounts.set(author, (authorCounts.get(author) || 0) + 1);
  }
  const topAuthors = [...authorCounts.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);

  const workflowCounts = new Map();
  for (const run of runs.workflow_runs.slice(0, 80)) {
    const key = run.name || 'Unnamed Workflow';
    const stat = workflowCounts.get(key) || { total: 0, success: 0, failure: 0 };
    stat.total += 1;
    if (run.conclusion === 'success') stat.success += 1;
    if (run.conclusion === 'failure') stat.failure += 1;
    workflowCounts.set(key, stat);
  }
  const leastReliable = [...workflowCounts.entries()]
    .map(([name, s]) => ({ name, ...s, failureRate: s.total ? s.failure / s.total : 0 }))
    .sort((a, b) => b.failureRate - a.failureRate)
    .slice(0, 5);

  const issueKeywords = bucketKeywords(issueOnly);

  const agents = [
    {
      track: 'PM',
      id: 'backlog-triage',
      emoji: '📌',
      title: 'PM Mini-Brain: Backlog Triage Agent',
      scope: 'Internal PM / issue hygiene',
      signal: `${issueOnly.length} open issues, ${staleIssues.length} stale, ${unlabeledIssues.length} unlabeled`,
      findings: [
        `Open issues (excluding PRs): **${issueOnly.length}**`,
        `Stale issues (>14d no update): **${staleIssues.length}**`,
        `Issues missing labels: **${unlabeledIssues.length}**`,
      ],
      actions: [
        `Triage the top ${Math.min(5, Math.max(staleIssues.length, 1))} stale issues first`,
        'Apply at least one scope label to each unlabeled issue',
        'Convert outdated requests into roadmap or close with rationale',
      ],
    },
    {
      track: 'PM',
      id: 'delivery-risk',
      emoji: '🚚',
      title: 'PM Mini-Brain: Delivery Risk Agent',
      scope: 'Internal PM / pull request flow',
      signal: `${pulls.length} open PRs, ${stalePRs.length} stale PRs, ${draftPRs.length} drafts`,
      findings: [
        `Open pull requests: **${pulls.length}**`,
        `Stale PRs (>3d no update): **${stalePRs.length}**`,
        `Draft PRs: **${draftPRs.length}**`,
      ],
      actions: [
        'Escalate stale PRs with blockers and ownership updates',
        'Split long-lived drafts into mergeable slices',
        'Set review SLA by criticality tier',
      ],
    },
    {
      track: 'PM',
      id: 'ci-watch',
      emoji: '🧪',
      title: 'PM Mini-Brain: CI Watch Agent',
      scope: 'Internal PM / execution quality',
      signal: `${recentRuns.length} runs in 7d, ${recentFailures.length} recent failures`,
      findings: [
        `Workflow runs in last 7 days: **${recentRuns.length}**`,
        `Failures in last 7 days: **${recentFailures.length}**`,
        `Total failed runs in sample: **${failedRuns.length}**`,
      ],
      actions: [
        'Assign failing workflows to named owners',
        'Separate flaky from deterministic failures',
        'Use fix-forward or rollback decision window',
      ],
    },
    {
      track: 'PM',
      id: 'internal-health-governor',
      emoji: '🏥',
      title: 'PM Mini-Brain: Internal Health Governor',
      scope: 'Internal PM / organism health and fleet governance',
      signal: `Health ${(internalSignals.health.overall * 100).toFixed(1)}%, fleet ${internalSignals.fleet.healthy}/${internalSignals.fleet.totalBots} healthy`,
      findings: [
        `Latest organism health score: **${(internalSignals.health.overall * 100).toFixed(1)}%**`,
        `Fleet healthy bots: **${internalSignals.fleet.healthy}/${internalSignals.fleet.totalBots}**`,
        `Unknown bot workflows detected: **${internalSignals.fleet.unknownBots}**`,
      ],
      actions: [
        'Escalate if health score drops below internal threshold',
        'Review degraded or unknown bots before release trains',
        'Align PM priorities with weakest health category each cycle',
      ],
    },
    {
      track: 'PM',
      id: 'documentation-gap',
      emoji: '📚',
      title: 'PM Mini-Brain: Documentation Gap Agent',
      scope: 'Internal PM / docs readiness',
      signal: `${docsSignals.fileCount} markdown docs, ${docsSignals.todoCount} TODO/FIXME/TBD markers`,
      findings: [
        `Markdown files under docs/: **${docsSignals.fileCount}**`,
        `Open TODO/FIXME/TBD markers in docs: **${docsSignals.todoCount}**`,
        `Repository README present: **${docsSignals.missingReadme ? 'no' : 'yes'}**`,
      ],
      actions: [
        'Prioritize unresolved docs TODO markers tied to active features',
        'Promote recurring TODO themes into PM backlog items',
        'Assign owners to release-critical documents',
      ],
    },

    {
      track: 'RESEARCH',
      id: 'issue-theme-research',
      emoji: '🔬',
      title: 'Research Mini-Brain: Issue Theme Radar',
      scope: 'Research / demand sensing from GitHub issues',
      signal: `${issueKeywords.length} high-frequency keywords detected`,
      findings: issueKeywords.length > 0
        ? issueKeywords.map((k) => `Keyword cluster: **${k.word}** (${k.count} mentions)`)
        : ['No strong keyword clusters found in open issues.'],
      actions: [
        'Translate top recurring themes into experiment briefs',
        'Map each theme to protocol or extension ownership',
        'Track weekly theme drift',
      ],
    },
    {
      track: 'RESEARCH',
      id: 'velocity-research',
      emoji: '⏱️',
      title: 'Research Mini-Brain: Delivery Velocity Researcher',
      scope: 'Research / throughput trend analysis',
      signal: `Recent 14d commits: ${recent14}, previous 14d commits: ${prev14}`,
      findings: [
        `Commits in last 14 days: **${recent14}**`,
        `Commits in prior 14-day window: **${prev14}**`,
        `Directional trend: **${recent14 >= prev14 ? 'up or steady' : 'down'}**`,
      ],
      actions: [
        'Correlate throughput trend with review and CI wait times',
        'Identify concentration of velocity by repository area',
        'Tune sprint scope with observed trend',
      ],
    },
    {
      track: 'RESEARCH',
      id: 'workflow-reliability-research',
      emoji: '📉',
      title: 'Research Mini-Brain: Workflow Reliability Researcher',
      scope: 'Research / CI reliability intelligence',
      signal: `${leastReliable.length} workflows profiled for failure rates`,
      findings: leastReliable.length > 0
        ? leastReliable.map((wf) => `${wf.name}: failure rate **${(wf.failureRate * 100).toFixed(1)}%** (${wf.failure}/${wf.total})`)
        : ['No workflow data available in sampled runs.'],
      actions: [
        'Deep-dive top least-reliable workflows for recurring root causes',
        'Separate flaky failures from deterministic regressions',
        'Define reliability SLOs and alert thresholds',
      ],
    },
    {
      track: 'RESEARCH',
      id: 'topology-intel-research',
      emoji: '🗺️',
      title: 'Research Mini-Brain: Repository Topology Intelligence',
      scope: 'Research / internal architecture signals',
      signal: `${internalSignals.topology.sections} sections, ${internalSignals.topology.totalFiles} files, ${internalSignals.repository.protocolCount} protocols`,
      findings: [
        `Topology sections: **${internalSignals.topology.sections}**`,
        `Total files mapped: **${internalSignals.topology.totalFiles}**`,
        `Protocol files: **${internalSignals.repository.protocolCount}**`,
      ],
      actions: [
        'Focus discovery on largest and fastest-changing sections',
        'Map protocol growth to maintainer bandwidth',
        'Use topology deltas to forecast architectural risk',
      ],
    },
    {
      track: 'RESEARCH',
      id: 'contributor-focus-research',
      emoji: '👥',
      title: 'Research Mini-Brain: Contributor Focus Mapper',
      scope: 'Research / contributor concentration analysis',
      signal: `${topAuthors.length} top contributors across sampled commits; ${internalSignals.repository.issueAgentCount} issue-agent scripts active`,
      findings: [
        ...(topAuthors.length > 0
          ? topAuthors.map(([author, count]) => `${author}: **${count}** commits in sample`)
          : ['No contributor activity found in sampled commits.']),
        `Active issue-agent scripts (internal): **${internalSignals.repository.issueAgentCount}**`,
      ],
      actions: [
        'Detect concentration risk where ownership is too narrow',
        'Pair top contributors with backup owners in critical domains',
        'Use issue-agent coverage to identify automation blind spots',
      ],
    },
  ];

  const reportPaths = writeLocalReport(agents);
  console.log(`Wrote report artifacts: ${path.relative(ROOT, reportPaths.jsonPath)}, ${path.relative(ROOT, reportPaths.mdPath)}`);

  await Promise.all([
    ensureLabel('autoagent', '5319e7', 'Auto-generated by internal mini-brain agents'),
    ensureLabel('autoagent-pm', '0e8a16', 'Internal PM autoagent output'),
    ensureLabel('autoagent-research', '1d76db', 'Research autoagent output'),
    ensureLabel('mini-brain', 'fbca04', 'Mini-brain agent issue'),
  ]);

  for (const agent of agents) {
    const title = `[AUTOAGENT][${agent.track}] ${agent.title}`;
    const body = buildBody(agent);
    const labels = ['autoagent', 'mini-brain', agent.track === 'PM' ? 'autoagent-pm' : 'autoagent-research'];
    const result = await upsertIssue({ title, labels, body });
    console.log(`  ${result.mode === 'created' ? 'created' : 'updated'} #${result.number} ${title}`);
  }

  console.log('PM + Research autoagents complete');
}

main().catch((err) => {
  console.error('pm-research-autoagents failed');
  console.error(err.stack || err.message || String(err));
  process.exit(1);
});

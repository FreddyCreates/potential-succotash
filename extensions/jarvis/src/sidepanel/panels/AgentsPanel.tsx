import React, { useState, useEffect, useCallback } from 'react';

type AgentStatus = 'queued' | 'running' | 'complete' | 'recalled' | 'failed';
type AgentType = 'researcher' | 'monitor' | 'sweep' | 'crawler' | 'scraper' | 'watcher' | 'digest' | 'analyst' | 'scout';

interface AgentStep {
  url: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  extract: string;
  visitedAt?: number;
}

interface SovereignAgentData {
  id: string;
  name: string;
  mission: string;
  type: AgentType;
  status: AgentStatus;
  steps: AgentStep[];
  currentStep: number;
  report: string;
  tabId?: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

const STATUS_ICON: Record<AgentStatus, string> = {
  queued: '⏳',
  running: '🟢',
  complete: '✅',
  recalled: '⚡',
  failed: '❌',
};

const STATUS_COLOR: Record<AgentStatus, string> = {
  queued: 'text-gray-400',
  running: 'text-cyan-400',
  complete: 'text-green-400',
  recalled: 'text-yellow-400',
  failed: 'text-red-400',
};

const STEP_ICON: Record<string, string> = {
  pending: '○',
  running: '◉',
  done: '●',
  failed: '✕',
};

interface SwarmData {
  id: string;
  name: string;
  goal: string;
  agentIds: string[];
  agentNames: string[];
  status: 'running' | 'complete' | 'recalled' | 'partial';
  createdAt: number;
  completedAt?: number;
  report?: string;
  completedCount: number;
}

export default function AgentsPanel() {
  const [agents, setAgents] = useState<SovereignAgentData[]>([]);
  const [swarms, setSwarms] = useState<SwarmData[]>([]);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [deployOpen, setDeployOpen] = useState(false);
  const [swarmOpen, setSwarmOpen] = useState(false);
  const [swarmGoal, setSwarmGoal] = useState('');
  const [deployType, setDeployType] = useState<AgentType>('researcher');
  const [deployTarget, setDeployTarget] = useState('');
  const [deploying, setDeploying] = useState(false);
  const [deployMsg, setDeployMsg] = useState('');
  const [swarmMsg, setSwarmMsg] = useState('');
  const [copyId, setCopyId] = useState<string | null>(null);

  const refresh = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setAgents(resp.agents || []);
    });
    chrome.runtime.sendMessage({ action: 'listSwarms' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setSwarms(resp.swarms || []);
    });
  }, []);

  useEffect(() => {
    refresh();
    const interval = setInterval(refresh, 3000);
    return () => clearInterval(interval);
  }, [refresh]);

  // Listen for real-time progress/complete pushes from background
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (
        msg.action === '_agentProgress' ||
        msg.action === '_agentComplete' ||
        msg.action === '_swarmProgress' ||
        msg.action === '_swarmComplete'
      ) {
        refresh();
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, [refresh]);

  const toggleExpand = (id: string) => {
    setExpanded(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const recall = (id: string) => {
    chrome.runtime.sendMessage({ action: 'recallAgent', agentId: id }, () => setTimeout(refresh, 400));
  };

  const recallAll = () => {
    chrome.runtime.sendMessage({ action: 'recallAllAgents' }, () => setTimeout(refresh, 400));
  };

  const deploySwarm = () => {
    if (!swarmGoal.trim()) return;
    setDeploying(true);
    setSwarmMsg('');
    chrome.runtime.sendMessage({ action: 'deploySwarm', goal: swarmGoal.trim() }, (resp) => {
      setDeploying(false);
      setSwarmMsg(resp?.message || 'Swarm deployed.');
      if (resp?.success) {
        setSwarmGoal('');
        setTimeout(() => { setSwarmOpen(false); setSwarmMsg(''); refresh(); }, 1800);
      }
    });
  };

  const recallSwarm = (id: string) => {
    chrome.runtime.sendMessage({ action: 'recallSwarm', swarmId: id }, () => setTimeout(refresh, 400));
  };

  const copySwarmReport = (swarm: SwarmData) => {
    const text = swarm.report || ('Swarm ' + swarm.name + '\nGoal: ' + swarm.goal + '\nAgents: ' + swarm.agentNames.join(', '));
    navigator.clipboard.writeText(text).then(() => {
      setCopyId(swarm.id);
      setTimeout(() => setCopyId(null), 1500);
    }).catch(() => {});
  };

  const copyReport = (agent: SovereignAgentData) => {
    const text = agent.report || (agent.steps.filter(s => s.extract).map(s => s.label + '\n' + s.extract).join('\n\n---\n\n'));
    navigator.clipboard.writeText(text).then(() => {
      setCopyId(agent.id);
      setTimeout(() => setCopyId(null), 1500);
    }).catch(() => {});
  };

  const deploy = () => {
    if (!deployTarget.trim()) return;
    setDeploying(true);
    setDeployMsg('');
    const urls = deployTarget.split(',').map(s => s.trim()).filter(Boolean);
    const isMulti = ['sweep', 'digest', 'analyst'].includes(deployType);
    const target = isMulti ? urls : urls[0] || deployTarget;
    const mission =
      deployType === 'researcher' ? 'Research: ' + deployTarget
      : deployType === 'monitor' ? 'Monitor: ' + deployTarget
      : deployType === 'crawler' ? 'Crawl: ' + deployTarget
      : deployType === 'scraper' ? 'Scrape: ' + deployTarget
      : deployType === 'watcher' ? 'Watch: ' + deployTarget
      : deployType === 'digest' ? 'Digest: ' + urls.join(', ')
      : deployType === 'analyst' ? 'Analyze ' + urls.length + ' sites'
      : deployType === 'scout' ? 'Scout: ' + deployTarget
      : 'Sweep: ' + urls.length + ' sites';
    chrome.runtime.sendMessage({ action: 'deployAgent', agentType: deployType, mission, target }, (resp) => {
      setDeploying(false);
      setDeployMsg(resp?.message || 'Agent deployed.');
      if (resp?.success) { setDeployTarget(''); setTimeout(() => { setDeployOpen(false); setDeployMsg(''); refresh(); }, 1800); }
    });
  };

  const runningCount = agents.filter(a => a.status === 'running').length;
  const runningSwarms = swarms.filter(s => s.status === 'running' || s.status === 'partial').length;

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900/50 border-b border-gray-800/50">
        <div className="flex items-center gap-2">
          <span className="text-cyan-400 text-sm">🤖</span>
          <span className="text-xs font-semibold text-gray-200">Agents & Swarms</span>
          {runningCount > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-cyan-900/60 text-cyan-300 rounded-full border border-cyan-700/40">
              {runningCount} agents
            </span>
          )}
          {runningSwarms > 0 && (
            <span className="text-xs px-1.5 py-0.5 bg-violet-900/60 text-violet-300 rounded-full border border-violet-700/40">
              {runningSwarms} swarm{runningSwarms === 1 ? '' : 's'}
            </span>
          )}
        </div>
        <div className="flex gap-1.5">
          {runningCount > 0 && (
            <button
              onClick={recallAll}
              className="text-xs px-2 py-0.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded transition-colors"
            >
              Recall All
            </button>
          )}
          <button
            onClick={refresh}
            className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors px-1"
          >
            ↻
          </button>
          <button
            onClick={() => { setSwarmOpen(o => !o); setDeployOpen(false); }}
            className="text-xs px-2 py-0.5 bg-violet-800 hover:bg-violet-700 text-white rounded transition-colors"
          >
            🐝 Swarm
          </button>
          <button
            onClick={() => { setDeployOpen(o => !o); setSwarmOpen(false); }}
            className="text-xs px-2 py-0.5 bg-cyan-800 hover:bg-cyan-700 text-white rounded transition-colors"
          >
            + Deploy
          </button>
        </div>
      </div>

      {/* Multi-swarm deploy form */}
      {swarmOpen && (
        <div className="border-b border-violet-900/40 bg-violet-950/30 px-3 py-2 space-y-2">
          <div className="text-xs text-violet-300 font-semibold">🐝 Multi-Swarm Deploy</div>
          <div className="text-xs text-gray-500">
            Launches researcher + scout + digest in parallel (up to 4 swarms, 10 agents total).
          </div>
          <input
            type="text"
            value={swarmGoal}
            onChange={e => setSwarmGoal(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && deploySwarm()}
            placeholder="Goal or topic — e.g. multi agent systems, MSAP protocol…"
            className="w-full bg-gray-800 border border-violet-800/50 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-violet-600"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={deploySwarm}
              disabled={deploying || !swarmGoal.trim()}
              className="flex-1 py-1 bg-violet-700 hover:bg-violet-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-xs transition-colors"
            >
              {deploying ? 'Launching swarm…' : '🐝 Launch Multi-Swarm'}
            </button>
            <button onClick={() => { setSwarmOpen(false); setSwarmMsg(''); }} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
          </div>
          {swarmMsg && <p className="text-xs text-violet-300">{swarmMsg}</p>}
        </div>
      )}

      {/* Deploy form */}
      {deployOpen && (
        <div className="border-b border-gray-800 bg-gray-900/80 px-3 py-2 space-y-2">
          <div className="grid grid-cols-3 gap-1">
            {(['researcher', 'crawler', 'scraper', 'monitor', 'watcher', 'scout', 'digest', 'analyst', 'sweep'] as AgentType[]).map(t => (
              <button
                key={t}
                onClick={() => setDeployType(t)}
                className={`text-xs py-1 rounded transition-colors ${deployType === t ? 'bg-cyan-800 text-white' : 'bg-gray-800 text-gray-400 hover:text-gray-200'}`}
              >
                {t === 'researcher' ? '🔬 Research' : t === 'crawler' ? '🕷 Crawler' : t === 'scraper' ? '📋 Scraper' : t === 'monitor' ? '👁 Monitor' : t === 'watcher' ? '⏰ Watcher' : t === 'scout' ? '🔭 Scout' : t === 'digest' ? '⚗️ Digest' : t === 'analyst' ? '📊 Analyst' : '🌐 Sweep'}
              </button>
            ))}
          </div>
          <div className="text-xs text-gray-500">
            {deployType === 'researcher' ? 'Topic to research (Wikipedia + news sources)'
              : deployType === 'crawler' ? 'Seed URL — spider follows links (parallel fetch)'
              : deployType === 'scraper' ? 'URL to extract structured data, tables, lists'
              : deployType === 'monitor' ? 'URL to check twice for changes'
              : deployType === 'watcher' ? 'URL to watch every 30min (alarm-based)'
              : deployType === 'scout' ? 'URL for quick deep scan + link map'
              : deployType === 'digest' ? 'Topics or URLs (comma-separated) — parallel synthesis'
              : deployType === 'analyst' ? 'URLs (comma-separated) — parallel analysis'
              : 'URLs (comma-separated) to sweep'}
          </div>
          <input
            type="text"
            value={deployTarget}
            onChange={e => setDeployTarget(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && deploy()}
            placeholder={
              deployType === 'researcher' ? 'artificial intelligence, quantum computing…'
              : deployType === 'digest' ? 'blockchain, AI, climate, space…'
              : deployType === 'analyst' || deployType === 'sweep' ? 'https://site1.com, https://site2.com…'
              : 'https://example.com'
            }
            className="w-full bg-gray-800 border border-gray-700 rounded px-2 py-1.5 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700"
          />
          <div className="flex items-center gap-2">
            <button
              onClick={deploy}
              disabled={deploying || !deployTarget.trim()}
              className="flex-1 py-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-xs transition-colors"
            >
              {deploying ? 'Deploying…' : '🚀 Deploy Agent'}
            </button>
            <button onClick={() => { setDeployOpen(false); setDeployMsg(''); }} className="text-xs text-gray-500 hover:text-gray-300">✕</button>
          </div>
          {deployMsg && <p className="text-xs text-cyan-400">{deployMsg}</p>}
        </div>
      )}

      {/* Agent + swarm list */}
      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {swarms.length > 0 && (
          <div className="px-3 py-2 bg-violet-950/20">
            <div className="text-xs text-violet-400 font-semibold mb-2">🐝 Active / Recent Swarms</div>
            <div className="space-y-2">
              {swarms.map(swarm => (
                <div key={swarm.id} className="border border-violet-900/40 rounded-lg p-2 bg-gray-900/50">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${swarm.status === 'running' || swarm.status === 'partial' ? 'animate-pulse' : ''}`}>
                      {swarm.status === 'complete' ? '✅' : swarm.status === 'recalled' ? '⚡' : '🐝'}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-semibold text-gray-100">{swarm.name}</span>
                        <span className="text-xs text-violet-300 uppercase">{swarm.status}</span>
                        <span className="text-xs text-gray-600">
                          {swarm.completedCount}/{swarm.agentIds.length}
                        </span>
                      </div>
                      <div className="text-xs text-gray-500 truncate">{swarm.goal}</div>
                      <div className="text-xs text-gray-600 truncate">
                        {swarm.agentNames.join(' · ') || 'agents launching…'}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1 mt-1.5">
                    {swarm.agentIds.map((_, i) => (
                      <div
                        key={i}
                        className={`h-1 flex-1 rounded-full ${
                          i < swarm.completedCount ? 'bg-violet-500' : 'bg-gray-700'
                        }`}
                      />
                    ))}
                  </div>
                  {swarm.report && (
                    <div className="mt-2 bg-gray-800/60 border border-violet-900/30 rounded p-2 max-h-36 overflow-y-auto">
                      <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">
                        {swarm.report.substring(0, 1200)}{swarm.report.length > 1200 ? '…' : ''}
                      </pre>
                    </div>
                  )}
                  <div className="flex gap-1.5 mt-2">
                    {(swarm.status === 'running' || swarm.status === 'partial') && (
                      <button
                        onClick={() => recallSwarm(swarm.id)}
                        className="text-xs px-2 py-0.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded transition-colors"
                      >
                        ⚡ Recall Swarm
                      </button>
                    )}
                    {(swarm.report || swarm.agentNames.length > 0) && (
                      <button
                        onClick={() => copySwarmReport(swarm)}
                        className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                      >
                        {copyId === swarm.id ? '✓ Copied' : '📋 Copy Report'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {agents.length === 0 && swarms.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-10 space-y-2">
            <div className="text-3xl">🐝</div>
            <div>No agents or swarms deployed</div>
            <div className="text-gray-700">
              Click <span className="text-violet-400">🐝 Swarm</span> for multi-agent teams<br/>
              or <span className="text-cyan-600">+ Deploy</span> for a single agent
            </div>
            <div className="text-gray-700 pt-1">
              Chat: <span className="text-violet-400">"deploy a swarm on [topic]"</span>
            </div>
          </div>
        )}
        {agents.map(agent => (
          <div key={agent.id} className="px-3 py-2">
            {/* Agent header row */}
            <div
              className="flex items-center gap-2 cursor-pointer"
              onClick={() => toggleExpand(agent.id)}
            >
              <span className={`text-sm flex-shrink-0 ${agent.status === 'running' ? 'animate-pulse' : ''}`}>
                {STATUS_ICON[agent.status]}
              </span>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-semibold text-gray-100">{agent.name}</span>
                  <span className={`text-xs ${STATUS_COLOR[agent.status]} uppercase`}>{agent.status}</span>
                  {agent.status === 'running' && (
                    <span className="text-xs text-gray-600">[{agent.currentStep + 1}/{agent.steps.length}]</span>
                  )}
                </div>
                <div className="text-xs text-gray-500 truncate">{agent.mission}</div>
              </div>
              <span className="text-gray-700 text-xs flex-shrink-0">{expanded.has(agent.id) ? '▲' : '▼'}</span>
            </div>

            {/* Step progress bar */}
            <div className="flex gap-1 mt-1.5">
              {agent.steps.map((step, i) => (
                <div
                  key={i}
                  title={step.label}
                  className={`h-1 flex-1 rounded-full transition-all ${
                    step.status === 'done' ? 'bg-green-500'
                    : step.status === 'running' ? 'bg-cyan-400 animate-pulse'
                    : step.status === 'failed' ? 'bg-red-500'
                    : 'bg-gray-700'
                  }`}
                />
              ))}
            </div>

            {/* Expanded: steps + report */}
            {expanded.has(agent.id) && (
              <div className="mt-2 space-y-2">
                {/* Steps */}
                <div className="space-y-1">
                  {agent.steps.map((step, i) => (
                    <div key={i} className="flex items-start gap-1.5">
                      <span className={`text-xs flex-shrink-0 mt-0.5 ${
                        step.status === 'done' ? 'text-green-400'
                        : step.status === 'running' ? 'text-cyan-400'
                        : step.status === 'failed' ? 'text-red-400'
                        : 'text-gray-600'
                      }`}>{STEP_ICON[step.status]}</span>
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-gray-300 truncate">{step.label}</div>
                        <div className="text-xs text-gray-600 truncate">{step.url}</div>
                        {step.extract && step.status === 'done' && (
                          <div className="mt-1 text-xs text-gray-400 bg-gray-800/60 rounded p-1.5 max-h-24 overflow-y-auto whitespace-pre-wrap">
                            {step.extract.substring(0, 400)}{step.extract.length > 400 ? '…' : ''}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Full report */}
                {agent.report && (
                  <div className="bg-gray-800/60 border border-gray-700/40 rounded p-2 max-h-48 overflow-y-auto">
                    <pre className="text-xs text-gray-300 whitespace-pre-wrap font-sans">{agent.report}</pre>
                  </div>
                )}

                {/* Actions */}
                <div className="flex gap-1.5 pt-1">
                  {(agent.status === 'running' || agent.status === 'queued') && (
                    <button
                      onClick={() => recall(agent.id)}
                      className="text-xs px-2 py-0.5 bg-red-900/40 hover:bg-red-800/60 text-red-300 rounded transition-colors"
                    >
                      ⚡ Recall
                    </button>
                  )}
                  {(agent.report || agent.steps.some(s => s.extract)) && (
                    <button
                      onClick={() => copyReport(agent)}
                      className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 text-gray-300 rounded transition-colors"
                    >
                      {copyId === agent.id ? '✓ Copied' : '📋 Copy Report'}
                    </button>
                  )}
                  {agent.completedAt && (
                    <span className="text-xs text-gray-600 self-center">
                      {Math.round((agent.completedAt - agent.startedAt) / 1000)}s
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Footer hint */}
      <div className="px-3 py-1.5 border-t border-gray-800 bg-gray-900/40">
        <p className="text-xs text-gray-600">
          Multi-swarm: researcher + scout + digest in parallel. Max 10 agents · 4 swarms.
        </p>
      </div>
    </div>
  );
}

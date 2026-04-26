/**
 * NexusPanel — JARVIS v10 Command Surface
 *
 * User-facing command center. One-tap actions, live agent feed,
 * recent JARVIS outputs, and active page awareness.
 * No internal stats. Pure USE.
 */

import React, { useState, useEffect } from 'react';
import { useJarvisStore } from '../../store';

/* ── Quick action tiles ─────────────────────────────────────────────────────── */

const COMMAND_TILES: { label: string; icon: string; action: string; color: string; desc: string }[] = [
  { label: 'Research Agent',  icon: '🤖', action: 'deploy agent: research ',   color: 'border-cyan-700 hover:bg-cyan-900/40',   desc: 'Deploy a research agent on any topic' },
  { label: 'Read This Page',  icon: '📖', action: 'read this page',             color: 'border-blue-700 hover:bg-blue-900/40',   desc: 'Analyze and summarize the active tab' },
  { label: 'Take a Note',     icon: '📒', action: 'note that ',                 color: 'border-green-700 hover:bg-green-900/40', desc: 'Save something to memory' },
  { label: 'Generate PDF',    icon: '📄', action: 'generate pdf ',              color: 'border-purple-700 hover:bg-purple-900/40', desc: 'Create a downloadable report' },
  { label: 'Search Web',      icon: '🔍', action: 'search for ',                color: 'border-yellow-700 hover:bg-yellow-900/40', desc: 'Look something up' },
  { label: 'Dispatch Mission', icon: '🚀', action: 'dispatch mission: ',        color: 'border-red-700 hover:bg-red-900/40',     desc: 'Send a domain AI on a mission' },
  { label: 'Screenshot',      icon: '🖥', action: 'screenshot',                 color: 'border-gray-600 hover:bg-gray-800/60',   desc: 'Capture current tab' },
  { label: 'Crawl a URL',     icon: '🕷', action: 'deploy agent: crawler ',     color: 'border-indigo-700 hover:bg-indigo-900/40', desc: 'Deep-crawl any website' },
  { label: 'Excel Report',    icon: '📊', action: 'generate excel ',            color: 'border-emerald-700 hover:bg-emerald-900/40', desc: 'Create a spreadsheet' },
  { label: 'Draft Email',     icon: '✉',  action: 'draft email about ',         color: 'border-pink-700 hover:bg-pink-900/40',   desc: 'Open a composed email draft' },
  { label: 'List Agents',     icon: '🟢', action: '__listagents__',             color: 'border-cyan-800 hover:bg-cyan-900/30',   desc: 'See all active agents' },
  { label: 'Synthesize',      icon: '⚗️', action: 'synthesize ',               color: 'border-violet-700 hover:bg-violet-900/40', desc: 'PSE knowledge synthesis' },
];

/* ── Agent status card ──────────────────────────────────────────────────────── */

interface AgentData {
  name: string;
  status: string;
  mission: string;
  currentStep: number;
  steps: unknown[];
}

function AgentCard({ agent }: { agent: AgentData }) {
  const icon: Record<string, string> = {
    running: '🟢', complete: '✅', recalled: '⚡', failed: '❌', queued: '⏳',
  };
  const pct = agent.steps.length > 0
    ? Math.round(((agent.currentStep + 1) / agent.steps.length) * 100)
    : 0;

  return (
    <div className="rounded border border-gray-700/50 bg-gray-900/60 px-2 py-1.5 text-xs">
      <div className="flex items-center gap-1.5 mb-0.5">
        <span>{icon[agent.status] || '○'}</span>
        <span className="font-semibold text-gray-200 truncate flex-1">{agent.name}</span>
        {agent.status === 'running' && (
          <span className="text-gray-500 text-[9px]">{pct}%</span>
        )}
      </div>
      <div className="text-gray-500 text-[9px] truncate">{agent.mission.substring(0, 60)}</div>
      {agent.status === 'running' && (
        <div className="mt-1 h-0.5 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-500 rounded-full transition-all duration-700"
            style={{ width: pct + '%' }}
          />
        </div>
      )}
    </div>
  );
}

/* ── NexusPanel ─────────────────────────────────────────────────────────────── */

export default function NexusPanel() {
  const { addMessage, setTyping, setActivePanel, mood } = useJarvisStore();
  const [agents, setAgents] = useState<AgentData[]>([]);
  const [recentOutputs, setRecentOutputs] = useState<string[]>([]);
  const [currentPage, setCurrentPage] = useState<{ title: string; url: string } | null>(null);
  const [prefill, setPrefill] = useState<string | null>(null);
  const [prefillVal, setPrefillVal] = useState('');

  /* Poll agents every 4 seconds */
  useEffect(() => {
    const poll = () => {
      chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
        if (chrome.runtime.lastError || !resp) return;
        const list: AgentData[] = resp.agents || [];
        setAgents(list.slice(0, 5));
      });
    };
    poll();
    const iv = setInterval(poll, 4000);
    return () => clearInterval(iv);
  }, []);

  /* Get active tab info */
  useEffect(() => {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        setCurrentPage({ title: tabs[0].title || 'Untitled', url: tabs[0].url || '' });
      }
    });
  }, []);

  /* Listen for agent-complete events to update recent outputs */
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.action === '_agentComplete') {
        const agent = msg.agent as AgentData;
        if (agent) {
          setRecentOutputs(prev =>
            ['✅ ' + agent.name + ' — mission complete', ...prev].slice(0, 5)
          );
        }
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => chrome.runtime.onMessage.removeListener(listener);
  }, []);

  const fireAction = (action: string, needsPrefill: boolean) => {
    if (needsPrefill) {
      setPrefill(action);
      setPrefillVal(action);
      return;
    }
    // Send as chat and switch to chat panel
    setActivePanel('chat');
    setTyping(true);
    addMessage({ role: 'user', text: action, ts: Date.now() });
    chrome.runtime.sendMessage({ action: 'chat', text: action }, (resp) => {
      setTyping(false);
      const reply: string = resp?.message || resp?.data?.message || 'No response.';
      addMessage({ role: 'jarvis', text: reply, ts: Date.now() });
    });
  };

  const submitPrefill = () => {
    if (!prefillVal.trim()) return;
    const text = prefillVal.trim();
    setPrefill(null);
    setPrefillVal('');
    setActivePanel('chat');
    setTyping(true);
    addMessage({ role: 'user', text, ts: Date.now() });
    chrome.runtime.sendMessage({ action: 'chat', text }, (resp) => {
      setTyping(false);
      const reply: string = resp?.message || resp?.data?.message || 'No response.';
      addMessage({ role: 'jarvis', text: reply, ts: Date.now() });
    });
  };

  const needsPrefill = (action: string) =>
    action.endsWith(' ') || action.endsWith(': ') || action === '__listagents__' ? false : action.endsWith(' ');

  const moodLabel = mood === 'energized' ? '⚡ Energized'
    : mood === 'reflective' ? '🔮 Reflective'
    : mood === 'calm'       ? '🌊 Calm'
    : '🎯 Focused';

  const liveAgents = agents.filter(a => a.status === 'running' || a.status === 'queued');
  const doneAgents = agents.filter(a => a.status === 'complete' || a.status === 'failed');

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-gray-950 text-gray-200 text-xs">

      {/* ── Header strip ── */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-gray-800/60 bg-gray-900/50">
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-cyan-400">⚡</span>
          <span className="font-bold tracking-widest text-white text-[11px]">COMMAND SURFACE</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] text-gray-500">
          <span>{moodLabel}</span>
          {liveAgents.length > 0 && (
            <span className="px-1.5 py-0.5 bg-green-900/40 border border-green-800/50 text-green-400 rounded text-[9px] animate-pulse">
              {liveAgents.length} agent{liveAgents.length > 1 ? 's' : ''} running
            </span>
          )}
        </div>
      </div>

      {/* ── Active page awareness ── */}
      {currentPage && (
        <div className="flex items-center gap-2 px-3 py-1.5 bg-gray-900/30 border-b border-gray-800/40">
          <span className="text-blue-500">🌐</span>
          <div className="flex-1 min-w-0">
            <div className="text-[10px] text-gray-400 truncate">{currentPage.title}</div>
            <div className="text-[9px] text-gray-600 truncate">{currentPage.url}</div>
          </div>
          <button
            onClick={() => fireAction('read this page', false)}
            className="flex-shrink-0 text-[9px] px-1.5 py-0.5 bg-blue-900/40 hover:bg-blue-800/60 border border-blue-800/50 text-blue-400 rounded transition-colors"
          >
            Read it
          </button>
        </div>
      )}

      {/* ── Prefill input (when action needs a topic) ── */}
      {prefill && (
        <div className="px-3 py-2 bg-gray-900/70 border-b border-cyan-900/40">
          <div className="text-[9px] text-cyan-600 mb-1 uppercase tracking-widest">What topic?</div>
          <div className="flex gap-1">
            <input
              autoFocus
              type="text"
              value={prefillVal}
              onChange={e => setPrefillVal(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter') submitPrefill(); if (e.key === 'Escape') setPrefill(null); }}
              className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 outline-none focus:border-cyan-700"
            />
            <button
              onClick={submitPrefill}
              className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 text-white rounded text-xs"
            >
              Go
            </button>
            <button
              onClick={() => setPrefill(null)}
              className="px-2 py-1 bg-gray-800 hover:bg-gray-700 text-gray-500 rounded text-xs"
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* ── Quick action grid ── */}
      <section className="px-2 pt-2 pb-1">
        <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1.5 px-1">Quick Actions</div>
        <div className="grid grid-cols-3 gap-1">
          {COMMAND_TILES.map(tile => {
            const isPrefill = tile.action.endsWith(' ') || tile.action.endsWith(': ');
            return (
              <button
                key={tile.label}
                onClick={() => {
                  if (tile.action === '__listagents__') {
                    fireAction('list agents', false);
                  } else if (isPrefill) {
                    setPrefill(tile.action);
                    setPrefillVal(tile.action);
                  } else {
                    fireAction(tile.action, false);
                  }
                }}
                title={tile.desc}
                className={`rounded border px-1.5 py-2 text-xs flex flex-col items-center gap-1 transition-colors bg-gray-900/60 ${tile.color}`}
              >
                <span className="text-base leading-none">{tile.icon}</span>
                <span className="text-[9px] text-gray-300 text-center leading-tight">{tile.label}</span>
              </button>
            );
          })}
        </div>
      </section>

      <div className="border-t border-gray-800/60 mx-3 my-1" />

      {/* ── Live agents ── */}
      {agents.length > 0 && (
        <section className="px-3 pb-1">
          <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1">Active Agents</div>
          <div className="space-y-1">
            {liveAgents.map(a => <AgentCard key={a.name} agent={a} />)}
            {doneAgents.slice(0, 2).map(a => <AgentCard key={a.name} agent={a} />)}
          </div>
          <button
            onClick={() => setActivePanel('agents')}
            className="mt-1 w-full text-[9px] text-gray-600 hover:text-cyan-500 transition-colors py-0.5"
          >
            View all in Agents tab →
          </button>
        </section>
      )}

      {agents.length === 0 && (
        <section className="px-3 pb-1">
          <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1">Agents</div>
          <div className="text-gray-700 text-[10px] italic py-1">No agents deployed. Hit "Research Agent" above.</div>
        </section>
      )}

      {/* ── Recent outputs ── */}
      {recentOutputs.length > 0 && (
        <>
          <div className="border-t border-gray-800/60 mx-3 my-1" />
          <section className="px-3 pb-3">
            <div className="text-[9px] tracking-widest uppercase text-gray-600 mb-1">Recent</div>
            <div className="space-y-0.5">
              {recentOutputs.map((ev, i) => (
                <div key={i} className="text-[9px] text-gray-500 border-l border-gray-700/50 pl-1.5 leading-tight animate-fade-in">
                  {ev}
                </div>
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

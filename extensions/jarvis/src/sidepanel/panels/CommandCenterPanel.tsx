import React, { useEffect, useState, useCallback } from 'react';

type Status = {
  model?: string;
  mode?: string;
  online?: boolean;
  subAgents?: string[];
  preferredModels?: string[];
};

export default function CommandCenterPanel() {
  const [v4, setV4] = useState<Status | null>(null);
  const [agents, setAgents] = useState(0);
  const [swarms, setSwarms] = useState(0);
  const [tabs, setTabs] = useState(0);
  const [goal, setGoal] = useState('');
  const [busy, setBusy] = useState(false);
  const [flash, setFlash] = useState('');

  const refresh = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'vigil4bStatus' }, (r) => {
      if (!chrome.runtime.lastError && r?.success) setV4(r.status);
    });
    chrome.runtime.sendMessage({ action: 'listAgents' }, (r) => {
      if (!chrome.runtime.lastError && r?.success) setAgents((r.agents || []).length);
    });
    chrome.runtime.sendMessage({ action: 'listSwarms' }, (r) => {
      if (!chrome.runtime.lastError && r?.success) setSwarms((r.swarms || []).length);
    });
    chrome.tabs.query({}, (t) => setTabs(t.length));
  }, []);

  useEffect(() => {
    refresh();
    const iv = setInterval(refresh, 4000);
    return () => clearInterval(iv);
  }, [refresh]);

  const launchSwarm = () => {
    if (!goal.trim()) return;
    setBusy(true);
    chrome.runtime.sendMessage({ action: 'deploySwarm', goal: goal.trim() }, (r) => {
      setBusy(false);
      setFlash(r?.message || 'Swarm launched');
      setTimeout(() => setFlash(''), 4000);
      refresh();
    });
  };

  const ask4b = () => {
    if (!goal.trim()) return;
    setBusy(true);
    chrome.runtime.sendMessage({ action: 'vigil4bChat', text: goal.trim() }, (r) => {
      setBusy(false);
      setFlash(r?.message || 'No response');
      refresh();
    });
  };

  return (
    <div className="vigil-4k-scroll h-full overflow-y-auto">
      {/* Hero */}
      <section className="vigil-4k-hero">
        <div className="vigil-4k-hero-glow" />
        <div className="relative z-10">
          <div className="vigil-4k-kicker">ENTERPRISE · MULTI-SWARM · v18.0 COMMERCIAL</div>
          <h1 className="vigil-4k-title">
            <span className="vigil-4k-title-mark">░░░░░░░</span>
            {' '}V.I.G.I.L{' '}
            <span className="vigil-4k-title-mark">░░░░░░░</span>
          </h1>
          <p className="vigil-4k-subtitle">
            Chrome Multi-Swarm Agent IDE — sovereign offline intelligence with embedded sub-agents
            and a local ~4B brain (Ollama) when available.
          </p>
          <div className="vigil-4k-badge-row">
            <span className="vigil-4k-badge">Agents</span>
            <span className="vigil-4k-badge">Multi-Swarm</span>
            <span className="vigil-4k-badge">Side Panel</span>
            <span className="vigil-4k-badge">Offline Core</span>
            <span className="vigil-4k-badge vigil-4k-badge-accent">VIGIL-4B</span>
          </div>
        </div>
      </section>

      {/* KPI grid */}
      <section className="vigil-4k-kpi-grid">
        <div className="vigil-4k-kpi">
          <div className="vigil-4k-kpi-label">Agents</div>
          <div className="vigil-4k-kpi-value">{agents}</div>
        </div>
        <div className="vigil-4k-kpi">
          <div className="vigil-4k-kpi-label">Swarms</div>
          <div className="vigil-4k-kpi-value">{swarms}</div>
        </div>
        <div className="vigil-4k-kpi">
          <div className="vigil-4k-kpi-label">Tabs</div>
          <div className="vigil-4k-kpi-value">{tabs}</div>
        </div>
        <div className="vigil-4k-kpi">
          <div className="vigil-4k-kpi-label">4B Brain</div>
          <div className="vigil-4k-kpi-value text-sm leading-tight pt-1">
            {v4?.online ? '● LIVE' : '○ ORCH'}
          </div>
          <div className="vigil-4k-kpi-meta">{v4?.model || '…'}</div>
        </div>
      </section>

      {/* Command surface */}
      <section className="vigil-4k-card mx-3 mb-3">
        <div className="vigil-4k-card-title">Command Surface</div>
        <p className="text-xs text-slate-400 mb-3 leading-relaxed">
          Route goals through VIGIL-4B (local model + embedded sub-agents) or launch a multi-swarm directly.
        </p>
        <textarea
          className="vigil-4k-input"
          rows={3}
          value={goal}
          onChange={e => setGoal(e.target.value)}
          placeholder="Executive goal — e.g. multi-agent systems market map, scout https://…, research MSAP protocol…"
        />
        <div className="flex flex-wrap gap-2 mt-3">
          <button className="vigil-4k-btn-primary" disabled={busy || !goal.trim()} onClick={ask4b}>
            {busy ? 'Routing…' : '◈ Ask VIGIL-4B'}
          </button>
          <button className="vigil-4k-btn-secondary" disabled={busy || !goal.trim()} onClick={launchSwarm}>
            🐝 Launch Multi-Swarm
          </button>
        </div>
        {flash && (
          <pre className="vigil-4k-flash mt-3 whitespace-pre-wrap">{flash.substring(0, 2000)}</pre>
        )}
      </section>

      {/* Capability matrix */}
      <section className="grid grid-cols-2 gap-2 px-3 pb-4">
        {[
          { t: 'Multi-Swarm', d: 'Researcher + scout + digest in parallel', i: '🐝' },
          { t: 'Chrome IDE', d: 'Tabs, read page, scout, forge reports', i: '🌐' },
          { t: 'VIGIL-4B', d: 'Local ~4B Ollama + offline orchestrator', i: '◈' },
          { t: 'Enterprise', d: 'Commercial pack · Edge/Chrome · Desktop', i: '▣' },
        ].map(c => (
          <div key={c.t} className="vigil-4k-tile">
            <div className="text-lg mb-1">{c.i}</div>
            <div className="text-xs font-semibold text-slate-100 tracking-wide">{c.t}</div>
            <div className="text-[11px] text-slate-400 mt-1 leading-snug">{c.d}</div>
          </div>
        ))}
      </section>
    </div>
  );
}

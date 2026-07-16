import React, { useCallback, useEffect, useRef, useState } from 'react';

type Msg = { role: 'user' | 'vigil'; text: string; ts: number; meta?: string };

type Status = {
  online: boolean;
  mode: string;
  model: string;
  preferredModels: string[];
  endpoint: string;
  lastError?: string;
  subAgents: string[];
  capabilities: string[];
};

export default function Vigil4BPanel() {
  const [status, setStatus] = useState<Status | null>(null);
  const [msgs, setMsgs] = useState<Msg[]>([{
    role: 'vigil',
    ts: Date.now(),
    text:
      '◈ **VIGIL-4B** online as the Chrome Multi-Swarm agent brain.\n\n' +
      'I embed sub-agents (researcher, scout, crawler, digest, multi-swarm) and Chrome tools.\n' +
      'For neural generation, run Ollama with a ~4B model:\n`ollama pull phi3:3.8b`\n\n' +
      'Without Ollama I still orchestrate agents offline.',
  }]);
  const [input, setInput] = useState('');
  const [busy, setBusy] = useState(false);
  const [model, setModel] = useState('');
  const endRef = useRef<HTMLDivElement>(null);

  const refreshStatus = useCallback(() => {
    chrome.runtime.sendMessage({ action: 'vigil4bStatus' }, (r) => {
      if (chrome.runtime.lastError || !r?.success) return;
      setStatus(r.status);
      if (r.status?.model) setModel(r.status.model);
    });
  }, []);

  useEffect(() => {
    refreshStatus();
    const iv = setInterval(refreshStatus, 8000);
    return () => clearInterval(iv);
  }, [refreshStatus]);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [msgs, busy]);

  const send = () => {
    const text = input.trim();
    if (!text || busy) return;
    setMsgs(m => [...m, { role: 'user', text, ts: Date.now() }]);
    setInput('');
    setBusy(true);
    chrome.runtime.sendMessage({ action: 'vigil4bChat', text }, (r) => {
      setBusy(false);
      const reply = r?.message || r?.error || 'No response from VIGIL-4B.';
      const meta = [r?.mode, r?.model].filter(Boolean).join(' · ');
      setMsgs(m => [...m, { role: 'vigil', text: reply, ts: Date.now(), meta }]);
      refreshStatus();
    });
  };

  const applyModel = () => {
    if (!model.trim()) return;
    chrome.runtime.sendMessage({ action: 'vigil4bSetModel', model: model.trim() }, () => refreshStatus());
  };

  const modeColor = status?.mode === 'ollama' ? 'text-emerald-400' : 'text-amber-300';

  return (
    <div className="flex flex-col h-full vigil-4k-scroll">
      {/* Status bar */}
      <div className="px-3 py-2 border-b border-white/5 bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950">
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[10px] tracking-[0.25em] text-cyan-400/80 font-semibold">VIGIL-4B RUNTIME</div>
            <div className="text-xs text-slate-200 mt-0.5">
              <span className={modeColor}>{status?.mode?.toUpperCase() || '…'}</span>
              <span className="text-slate-500"> · </span>
              <span className="font-mono text-slate-300">{status?.model || 'probing'}</span>
            </div>
          </div>
          <div className={`text-[10px] px-2 py-1 rounded-full border ${
            status?.online
              ? 'border-emerald-500/40 text-emerald-300 bg-emerald-950/40'
              : 'border-amber-500/40 text-amber-200 bg-amber-950/30'
          }`}>
            {status?.online ? '● OLLAMA LIVE' : '○ ORCHESTRATOR'}
          </div>
        </div>
        <div className="flex gap-1 mt-2">
          <input
            className="vigil-4k-input flex-1 !py-1 text-[11px] font-mono"
            value={model}
            onChange={e => setModel(e.target.value)}
            placeholder="phi3:3.8b"
          />
          <button className="vigil-4k-btn-secondary !py-1 !px-2 text-[11px]" onClick={applyModel}>Set</button>
          <button className="vigil-4k-btn-ghost !py-1 !px-2 text-[11px]" onClick={refreshStatus}>↻</button>
        </div>
        {status?.lastError && !status.online && (
          <div className="text-[10px] text-amber-400/80 mt-1 truncate" title={status.lastError}>
            Offline reason: {status.lastError}
          </div>
        )}
      </div>

      {/* Sub-agent chips */}
      <div className="flex flex-wrap gap-1 px-3 py-2 border-b border-white/5">
        {(status?.subAgents || ['researcher', 'scout', 'multi-swarm']).map(s => (
          <span key={s} className="text-[10px] px-2 py-0.5 rounded-full bg-white/5 text-slate-300 border border-white/10">
            {s}
          </span>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-3 py-2 space-y-3">
        {msgs.map((m, i) => (
          <div key={i} className={m.role === 'user' ? 'flex justify-end' : 'flex justify-start'}>
            <div className={m.role === 'user' ? 'vigil-4k-bubble-user' : 'vigil-4k-bubble-ai'}>
              <pre className="whitespace-pre-wrap font-sans text-xs leading-relaxed m-0">{m.text}</pre>
              {m.meta && <div className="text-[10px] text-slate-500 mt-1 font-mono">{m.meta}</div>}
            </div>
          </div>
        ))}
        {busy && (
          <div className="text-xs text-cyan-400/80 animate-pulse">VIGIL-4B routing sub-agents…</div>
        )}
        <div ref={endRef} />
      </div>

      {/* Composer */}
      <div className="p-3 border-t border-white/5 bg-slate-950/80">
        <div className="flex gap-1 mb-2 flex-wrap">
          {[
            'deploy a swarm on multi agent systems',
            'research sovereign AI agents',
            'list agents',
            'read page',
          ].map(q => (
            <button
              key={q}
              className="text-[10px] px-2 py-0.5 rounded-full border border-cyan-500/20 text-cyan-200/80 hover:bg-cyan-500/10"
              onClick={() => setInput(q)}
            >
              {q.length > 28 ? q.slice(0, 28) + '…' : q}
            </button>
          ))}
        </div>
        <div className="flex gap-2">
          <textarea
            className="vigil-4k-input flex-1"
            rows={2}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); }
            }}
            placeholder="Command the 4B brain + embedded Chrome sub-agents…"
          />
          <button className="vigil-4k-btn-primary self-end" disabled={busy || !input.trim()} onClick={send}>
            Send
          </button>
        </div>
        <p className="text-[10px] text-slate-500 mt-2 leading-snug">
          Setup: install <a className="text-cyan-400 underline" href="https://ollama.com" target="_blank" rel="noreferrer">Ollama</a>
          {' '}→ <code className="text-slate-400">ollama pull phi3:3.8b</code>. Sub-agents work without GPU.
        </p>
      </div>
    </div>
  );
}

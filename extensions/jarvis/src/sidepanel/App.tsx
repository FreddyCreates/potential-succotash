import React, { useEffect } from 'react';
import { useJarvisStore } from '../store';
import ChatPanel from './panels/ChatPanel';
import InboxPanel from './panels/InboxPanel';
import SolusPanel from './panels/SolusPanel';
import AgentsPanel from './panels/AgentsPanel';
import AGIPromptsPanel from './panels/AGIPromptsPanel';
import SentryPanel from './panels/SentryPanel';
import MemoryVaultPanel from './panels/MemoryVaultPanel';
import WorkspacePanel from './panels/WorkspacePanel';
import SearchPanel from './panels/SearchPanel';
import ScreenPanel from './panels/ScreenPanel';
import TabsPanel from './panels/TabsPanel';
import InstallPanel from './panels/InstallPanel';
import LogPanel from './panels/LogPanel';
import PhantomPanel from './panels/PhantomPanel';
import ResearchPanel from './panels/ResearchPanel';
import OfflineAGIPanel from './panels/OfflineAGIPanel';
import CloudflarePanel from './panels/CloudflarePanel';
import CommandCenterPanel from './panels/CommandCenterPanel';
import Vigil4BPanel from './panels/Vigil4BPanel';

type TabDef = { id: string; label: string; section?: string; icon?: string };

const TABS: TabDef[] = [
  { id: '_cmd', label: 'COMMAND', section: 'divider' },
  { id: 'command', label: 'Command', icon: '▣' },
  { id: 'vigil4b', label: 'VIGIL-4B', icon: '◈' },
  { id: 'chat', label: 'Chat', icon: '◉' },
  { id: 'inbox', label: 'Inbox', icon: '◎' },
  { id: 'screen', label: 'Control', icon: '▣' },
  { id: 'tabs', label: 'Tabs', icon: '▤' },
  { id: '_intel', label: 'INTEL', section: 'divider' },
  { id: 'agents', label: 'Swarms', icon: '🐝' },
  { id: 'agi', label: 'AGI', icon: '⚗️' },
  { id: 'oagi', label: 'Mind', icon: '🧠' },
  { id: 'research', label: 'Research', icon: '🔬' },
  { id: 'cloud', label: 'Cloud', icon: '☁' },
  { id: 'search', label: 'Search', icon: '⌕' },
  { id: 'phantom', label: 'Phantom', icon: '👁' },
  { id: '_mind', label: 'MIND', section: 'divider' },
  { id: 'memory', label: 'Memory', icon: '⬡' },
  { id: 'solus', label: 'Solus', icon: '◎' },
  { id: 'sentry', label: 'Sentry', icon: '🛡' },
  { id: '_archive', label: 'ARCHIVE', section: 'divider' },
  { id: 'workspace', label: 'Workspace', icon: '📁' },
  { id: '_sys', label: 'SYS', section: 'divider' },
  { id: 'log', label: 'Log', icon: '☰' },
  { id: 'install', label: 'Install', icon: '⬇' },
];

export default function App() {
  const {
    activePanel, setActivePanel, heartbeatCount, uptime,
    commandCount, mood, awareness, memTurns, setStatus,
    neuroChem, neuroMood, neuroEnergy, neuroState,
  } = useJarvisStore();

  useEffect(() => {
    // Default to enterprise command center on first open if still on default chat-only
    if (!activePanel || activePanel === 'chat') {
      // keep chat as fine; prefer command for commercial UX once
      const seen = sessionStorage.getItem('vigil_4k_seen');
      if (!seen) {
        setActivePanel('command');
        sessionStorage.setItem('vigil_4k_seen', '1');
      }
    }
  }, [activePanel, setActivePanel]);

  useEffect(() => {
    const poll = () => {
      chrome.runtime.sendMessage({ action: 'getStatus' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        const d = resp.data;
        setStatus({
          heartbeatCount: d.heartbeatCount,
          uptime: d.uptime ? Math.floor(d.uptime / 1000) : 0,
          commandCount: d.commandCount,
          mood: d.mood,
          awareness: d.awarenessLevel,
          memTurns: d.memoryTurns,
          neuroChem: d.neuroChem,
          neuroMood: d.neuroPersonality?.mood,
          neuroEnergy: d.neuroPersonality?.energy,
          neuroState: d.neuroPersonality?.stateSummary,
        });
      });
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [setStatus]);

  const renderPanel = () => {
    switch (activePanel) {
      case 'command':  return <CommandCenterPanel />;
      case 'vigil4b':  return <Vigil4BPanel />;
      case 'chat':     return <ChatPanel />;
      case 'inbox':    return <InboxPanel />;
      case 'solus':    return <SolusPanel />;
      case 'agents':   return <AgentsPanel />;
      case 'agi':      return <AGIPromptsPanel />;
      case 'sentry':   return <SentryPanel />;
      case 'memory':   return <MemoryVaultPanel />;
      case 'workspace':return <WorkspacePanel />;
      case 'search':   return <SearchPanel />;
      case 'phantom':  return <PhantomPanel />;
      case 'screen':   return <ScreenPanel />;
      case 'tabs':     return <TabsPanel />;
      case 'install':  return <InstallPanel />;
      case 'log':      return <LogPanel />;
      case 'research': return <ResearchPanel />;
      case 'oagi':     return <OfflineAGIPanel />;
      case 'cloud':    return <CloudflarePanel />;
      default:         return <CommandCenterPanel />;
    }
  };

  const uptimeStr = (() => {
    const s = uptime;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
  })();

  const moodDot = neuroMood === 'energized' ? 'bg-amber-400'
    : neuroMood === 'reflective' ? 'bg-emerald-300'
    : neuroMood === 'calm'       ? 'bg-sky-300'
    : neuroMood === 'alert'      ? 'bg-cyan-400'
    : neuroMood === 'stressed'   ? 'bg-red-400'
    : neuroMood === 'connected'  ? 'bg-violet-400'
    : neuroMood === 'analytical' ? 'bg-blue-400'
    : 'bg-cyan-400';

  const neuroColor = (c: number) =>
    c > 1.15 ? '#34d399' : c < 0.85 ? '#f87171' : '#67e8f9';

  const nc = neuroChem;

  return (
    <div className="vigil-4k-root flex flex-col h-screen overflow-hidden text-slate-100">
      {/* Enterprise top bar — 4K density */}
      <header className="vigil-4k-topbar flex-shrink-0">
        <div className="flex items-center gap-3 min-w-0">
          <div className="vigil-4k-logo-mark" aria-hidden>V</div>
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-semibold tracking-[0.35em] text-[13px] text-white">VIGIL</span>
              <span className="vigil-4k-chip">v18 · COMMERCIAL</span>
            </div>
            <div className="text-[10px] text-slate-400 tracking-wide truncate">
              Multi-Swarm Agent IDE · Chrome / Edge · Offline + 4B
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className={`inline-block w-2 h-2 rounded-full ${moodDot} animate-pulse`} title={neuroMood} />
          <span className="text-[11px] text-slate-400 capitalize hidden sm:inline">{neuroMood}</span>
          <span className="text-[10px] font-mono text-cyan-400/80">E:{neuroEnergy}%</span>
        </div>
      </header>

      {/* Nav — horizontal enterprise rail */}
      <nav className="vigil-4k-nav flex-shrink-0">
        {TABS.map((t) => {
          if (t.section === 'divider') {
            return (
              <span key={t.id} className="vigil-4k-nav-divider">
                {t.label}
              </span>
            );
          }
          const active = activePanel === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActivePanel(t.id)}
              className={`vigil-4k-nav-item ${active ? 'is-active' : ''}`}
            >
              {t.icon && <span className="opacity-80 mr-1">{t.icon}</span>}
              {t.label}
            </button>
          );
        })}
      </nav>

      {/* Main */}
      <main className="flex-1 overflow-hidden relative">
        <div className="absolute inset-0 vigil-4k-grid-bg pointer-events-none opacity-40" />
        <div className="relative h-full">{renderPanel()}</div>
      </main>

      {/* Footer status — telemetry */}
      <footer className="vigil-4k-footer flex-shrink-0">
        <div className="flex items-center gap-3 font-mono text-[10px] overflow-x-auto">
          {(['DA', 'SE', 'NE', 'CO', 'ACh', 'OX'] as const).map(sp => (
            <span key={sp} style={{ color: neuroColor(nc[sp] ?? 1) }}>
              {sp}:{Math.round((nc[sp] ?? 1) * 100)}
            </span>
          ))}
        </div>
        <div className="flex items-center gap-3 text-[10px] text-slate-500 font-mono">
          <span>⏱ {uptimeStr}</span>
          <span>💓 {heartbeatCount}</span>
          <span>⚡ {commandCount}</span>
          <span>🧠 {awareness}%</span>
          <span>📖 {memTurns}t</span>
          <span className="text-slate-600 capitalize">{mood}</span>
        </div>
      </footer>
    </div>
  );
}

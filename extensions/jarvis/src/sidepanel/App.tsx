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

// Agents and AGI moved to front (closer to Chat/Inbox)
const TABS = [
  { id: 'chat',      label: '💬 Chat' },
  { id: 'inbox',     label: '📥 Inbox' },
  { id: 'agents',    label: '🤖 Agents' },
  { id: 'agi',       label: '⚗️ AGI' },
  { id: 'solus',     label: '🔵 Solus' },
  { id: 'sentry',    label: '🛡 Sentry' },
  { id: 'memory',    label: '🧠 Memory Vault' },
  { id: 'workspace', label: '📁 Workspace' },
  { id: 'search',    label: '🔍 Search' },
  { id: 'screen',    label: '🖥️ Screen' },
  { id: 'tabs',      label: '🗂️ Tabs' },
  { id: 'install',   label: '⬇ Install' },
  { id: 'log',       label: '📋 Log' },
];

export default function App() {
  const {
    activePanel, setActivePanel, heartbeatCount, uptime,
    commandCount, mood, awareness, memTurns, setStatus,
  } = useJarvisStore();

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
        });
      });
    };
    poll();
    const interval = setInterval(poll, 5000);
    return () => clearInterval(interval);
  }, [setStatus]);

  const renderPanel = () => {
    switch (activePanel) {
      case 'chat':      return <ChatPanel />;
      case 'inbox':     return <InboxPanel />;
      case 'solus':     return <SolusPanel />;
      case 'agents':    return <AgentsPanel />;
      case 'agi':       return <AGIPromptsPanel />;
      case 'sentry':    return <SentryPanel />;
      case 'memory':    return <MemoryVaultPanel />;
      case 'workspace': return <WorkspacePanel />;
      case 'search':    return <SearchPanel />;
      case 'screen':    return <ScreenPanel />;
      case 'tabs':      return <TabsPanel />;
      case 'install':   return <InstallPanel />;
      case 'log':       return <LogPanel />;
      default:          return <ChatPanel />;
    }
  };

  const uptimeStr = (() => {
    const s = uptime;
    const h = Math.floor(s / 3600);
    const m = Math.floor((s % 3600) / 60);
    const sec = s % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
  })();

  const moodDot = mood === 'energized' ? 'bg-amber-400'
    : mood === 'reflective' ? 'bg-emerald-300'
    : mood === 'calm'       ? 'bg-amber-300'
    : 'bg-amber-400';

  return (
    <div className="flex flex-col h-screen text-gray-100 text-sm overflow-hidden" style={{ background: '#0d0b08' }}>
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #100d08 0%, #1a1408 100%)', borderColor: '#2d2010' }}
      >
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-amber-400 text-lg">⚡</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-[0.25em] text-sm">V I G I L</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border font-bold" style={{ borderColor: '#d4a017', color: '#d4a017' }}>v15</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${moodDot} animate-pulse`} title={'Mood: ' + mood} />
          <span className="text-xs text-gray-500 capitalize">{mood}</span>
        </div>
      </div>

      {/* Nav tabs — scrollable */}
      <div className="flex overflow-x-auto scrollbar-hide flex-shrink-0" style={{ background: '#13100a', borderBottom: '1px solid #2d2010' }}>
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActivePanel(t.id)}
            className={`flex-shrink-0 px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
              activePanel === t.id
                ? 'border-b-2'
                : 'text-gray-500 hover:text-gray-300'
            }`}
            style={activePanel === t.id ? { color: '#d4a017', borderBottomColor: '#d4a017', background: '#0d0b08' } : {}}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Main panel */}
      <div className="flex-1 overflow-hidden">
        {renderPanel()}
      </div>

      {/* Download strip */}
      <div className="flex gap-1 px-2 py-1 flex-shrink-0" style={{ background: '#13100a', borderTop: '1px solid #2d2010' }}>
        <button
          onClick={() => chrome.runtime.sendMessage({ action: 'downloadJarvisZip' })}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          ⬇ Extension ZIP
        </button>
        <button
          onClick={() => window.open('https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/SDK_Model_Manifest.json', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          ⬇ SDK
        </button>
        <button
          onClick={() => window.open('https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/AI_Protocols_Register.csv', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 rounded transition-colors"
          style={{ background: 'rgba(212,160,23,0.12)', color: '#d4a017', border: '1px solid #2d2010' }}
        >
          ⬇ Protocols
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 text-xs text-gray-600 flex-shrink-0" style={{ background: '#0a0806', borderTop: '1px solid #2d2010' }}>
        <span>⏱ {uptimeStr}</span>
        <span>💓 {heartbeatCount}</span>
        <span>⚡ {commandCount}</span>
        <span>🧠 {awareness}%</span>
        <span>📖 {memTurns}t</span>
      </div>
    </div>
  );
}

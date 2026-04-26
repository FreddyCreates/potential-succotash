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

const TABS = [
  { id: 'chat',      label: '💬 Chat' },
  { id: 'inbox',     label: '📥 Inbox' },
  { id: 'solus',     label: '🔵 Solus' },
  { id: 'agents',    label: '🤖 Agents' },
  { id: 'agi',       label: '⚗️ AGI' },
  { id: 'sentry',    label: '🛡 Sentry' },
  { id: 'memory',    label: '🧠 Memory Vault' },
  { id: 'workspace', label: '📝 Workspace' },
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

  const moodDot = mood === 'energized' ? 'bg-yellow-400'
    : mood === 'reflective' ? 'bg-cyan-300'
    : mood === 'calm'       ? 'bg-blue-400'
    : 'bg-cyan-400';

  return (
    <div className="flex flex-col h-screen bg-[#080d14] text-gray-100 text-sm overflow-hidden">
      {/* Header */}
      <div
        className="flex items-center justify-between px-3 py-2 border-b border-[#1a3a5c] flex-shrink-0"
        style={{ background: 'linear-gradient(135deg, #060c14 0%, #0d1a2e 100%)' }}
      >
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-cyan-400 text-lg">⚡</span>
          <div className="flex items-center gap-2">
            <span className="font-bold text-white tracking-[0.25em] text-sm">V I G I L</span>
            <span className="text-[10px] px-1.5 py-0.5 rounded border border-[#ffd700]/50 text-[#ffd700] font-bold">v15</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${moodDot} animate-pulse`} title={'Mood: ' + mood} />
          <span className="text-xs text-gray-500 capitalize">{mood}</span>
        </div>
      </div>

      {/* Nav tabs — scrollable */}
      <div className="flex overflow-x-auto bg-[#0d1520] border-b border-[#1a3a5c] scrollbar-hide flex-shrink-0">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActivePanel(t.id)}
            className={`flex-shrink-0 px-2.5 py-1.5 text-xs transition-colors whitespace-nowrap ${
              activePanel === t.id
                ? 'text-cyan-400 border-b-2 border-[#ffd700] bg-[#080d14]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
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
      <div className="flex gap-1 px-2 py-1 bg-[#0d1520] border-t border-[#1a3a5c] flex-shrink-0">
        <button
          onClick={() => chrome.runtime.sendMessage({ action: 'downloadJarvisZip' })}
          className="flex-1 text-xs py-0.5 px-1 bg-cyan-900/30 hover:bg-cyan-800/50 rounded text-cyan-400 border border-[#1a3a5c] transition-colors"
        >
          ⬇ Extension ZIP
        </button>
        <button
          onClick={() => window.open('https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/SDK_Model_Manifest.json', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 bg-cyan-900/30 hover:bg-cyan-800/50 rounded text-cyan-400 border border-[#1a3a5c] transition-colors"
        >
          ⬇ SDK
        </button>
        <button
          onClick={() => window.open('https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/AI_Protocols_Register.csv', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 bg-cyan-900/30 hover:bg-cyan-800/50 rounded text-cyan-400 border border-[#1a3a5c] transition-colors"
        >
          ⬇ Protocols
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-[#060c14] border-t border-[#1a3a5c] text-xs text-gray-600 flex-shrink-0">
        <span>⏱ {uptimeStr}</span>
        <span>💓 {heartbeatCount}</span>
        <span>⚡ {commandCount}</span>
        <span>🧠 {awareness}%</span>
        <span>📖 {memTurns}t</span>
      </div>
    </div>
  );
}

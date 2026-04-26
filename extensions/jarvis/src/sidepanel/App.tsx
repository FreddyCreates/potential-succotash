import React, { useEffect } from 'react';
import { useJarvisStore } from '../store';
import ChatPanel from './panels/ChatPanel';
import WorkspacePanel from './panels/WorkspacePanel';
import ToolsPanel from './panels/ToolsPanel';
import SearchPanel from './panels/SearchPanel';
import ScreenPanel from './panels/ScreenPanel';
import TabsPanel from './panels/TabsPanel';
import NotesPanel from './panels/NotesPanel';
import DocsPanel from './panels/DocsPanel';
import InstallPanel from './panels/InstallPanel';
import LogPanel from './panels/LogPanel';
import AgentsPanel from './panels/AgentsPanel';
import AGIToolsPanel from './panels/AGIToolsPanel';
import NexusPanel from './panels/NexusPanel';
import MirrorPanel from './panels/MirrorPanel';
import VaultPanel from './panels/VaultPanel';
import PromptsPanel from './panels/PromptsPanel';
import InboxPanel from './panels/InboxPanel';

import HighlightsPanel from './panels/HighlightsPanel';

const TABS = [
  { id: 'chat',       label: '💬 Chat' },
  { id: 'nexus',      label: '⚡ Nexus' },
  { id: 'inbox',      label: '📥 Inbox' },
  { id: 'highlights', label: '📌 Highlights' },
  { id: 'mirror',     label: '🪞 Mirror' },
  { id: 'agents',     label: '🤖 Agents' },
  { id: 'agi',        label: '⚗️ AGI Tools' },
  { id: 'notes',      label: '📓 Journal' },
  { id: 'docs',       label: '📁 Files' },
  { id: 'vault',      label: '🔐 Vault' },
  { id: 'prompts',    label: '💡 Prompts' },
  { id: 'workspace',  label: '📝 Workspace' },
  { id: 'tools',      label: '🔧 Tools' },
  { id: 'search',     label: '🔍 Search' },
  { id: 'screen',     label: '🖥️ Screen' },
  { id: 'tabs',       label: '🗂️ Tabs' },
  { id: 'install',    label: '⬇ Install' },
  { id: 'log',        label: '📋 Log' },
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
      case 'highlights':  return <HighlightsPanel />;
      case 'nexus':     return <NexusPanel />;
      case 'chat':      return <ChatPanel />;
      case 'inbox':     return <InboxPanel />;
      case 'mirror':    return <MirrorPanel />;
      case 'agents':    return <AgentsPanel />;
      case 'agi':       return <AGIToolsPanel />;
      case 'vault':     return <VaultPanel />;
      case 'prompts':   return <PromptsPanel />;
      case 'workspace': return <WorkspacePanel />;
      case 'tools':     return <ToolsPanel />;
      case 'search':    return <SearchPanel />;
      case 'screen':    return <ScreenPanel />;
      case 'tabs':      return <TabsPanel />;
      case 'notes':     return <NotesPanel />;
      case 'docs':      return <DocsPanel />;
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
    : mood === 'reflective' ? 'bg-purple-400'
    : mood === 'calm'       ? 'bg-blue-400'
    : 'bg-cyan-400';

  return (
    <div className="flex flex-col h-screen bg-gray-950 text-gray-100 text-sm overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 bg-gray-900 border-b border-cyan-900/40">
        <div className="flex items-center gap-2">
          <span className="animate-heartbeat text-cyan-400 text-lg">⚡</span>
          <div>
            <span className="font-bold text-white tracking-widest text-sm">A.N.I.M.U.S</span>
            <span className="ml-2 text-xs text-purple-400">v13.0</span>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`inline-block w-2 h-2 rounded-full ${moodDot} animate-pulse`} title={'Mood: ' + mood} />
          <span className="text-xs text-gray-500 capitalize">{mood}</span>
        </div>
      </div>

      {/* Nav tabs — scrollable */}
      <div className="flex overflow-x-auto bg-gray-900/60 border-b border-gray-800 scrollbar-hide">
        {TABS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActivePanel(t.id)}
            className={`flex-shrink-0 px-2 py-1.5 text-xs transition-colors ${
              activePanel === t.id
                ? 'text-cyan-400 border-b-2 border-cyan-400 bg-gray-800/50'
                : 'text-gray-400 hover:text-gray-200'
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
      <div className="flex gap-1 px-2 py-1 bg-gray-900/40 border-t border-gray-800/60">
        <button
          onClick={() => chrome.runtime.sendMessage({ action: 'downloadJarvisZip' })}
          className="flex-1 text-xs py-0.5 px-1 bg-purple-900/40 hover:bg-purple-800/60 rounded text-purple-300 transition-colors"
        >
          ⬇ Extension ZIP
        </button>
        <button
          onClick={() => window.open('https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/SDK_Model_Manifest.json', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 bg-purple-900/40 hover:bg-purple-800/60 rounded text-purple-300 transition-colors"
        >
          ⬇ SDK
        </button>
        <button
          onClick={() => window.open('https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/AI_Protocols_Register.csv', '_blank')}
          className="flex-1 text-xs py-0.5 px-1 bg-purple-900/40 hover:bg-purple-800/60 rounded text-purple-300 transition-colors"
        >
          ⬇ Protocols
        </button>
      </div>

      {/* Status bar */}
      <div className="flex items-center justify-between px-3 py-1 bg-gray-900 border-t border-gray-800 text-xs text-gray-500">
        <span>⏱ {uptimeStr}</span>
        <span>💓 {heartbeatCount}</span>
        <span>⚡ {commandCount} cmds</span>
        <span>🧠 {awareness}%</span>
        <span>📖 {memTurns}t</span>
      </div>
    </div>
  );
}

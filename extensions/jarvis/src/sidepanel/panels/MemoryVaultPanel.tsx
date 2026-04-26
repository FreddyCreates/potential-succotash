import React, { useState } from 'react';
import MemoryPanel from './MemoryPanel';
import VaultPanel from './VaultPanel';
import HighlightsPanel from './HighlightsPanel';
import MirrorPanel from './MirrorPanel';
import GraphPanel from './GraphPanel';

const SUB_TABS = [
  { id: 'memory',     label: '🧠 Memory' },
  { id: 'vault',      label: '🔐 Vault' },
  { id: 'highlights', label: '📌 Highlights' },
  { id: 'mirror',     label: '🪞 Mirror' },
  { id: 'graph',      label: '🗺 Graph' },
];

export default function MemoryVaultPanel() {
  const [active, setActive] = useState('memory');

  const renderSub = () => {
    switch (active) {
      case 'memory':     return <MemoryPanel />;
      case 'vault':      return <VaultPanel />;
      case 'highlights': return <HighlightsPanel />;
      case 'mirror':     return <MirrorPanel />;
      case 'graph':      return <GraphPanel />;
      default:           return <MemoryPanel />;
    }
  };

  return (
    <div className="flex flex-col h-full bg-[#080d14] text-gray-100">
      {/* Sub-tab bar */}
      <div className="flex overflow-x-auto bg-[#0d1520] border-b border-[#1a3a5c] scrollbar-hide flex-shrink-0">
        {SUB_TABS.map(t => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`flex-shrink-0 px-3 py-1.5 text-xs transition-colors whitespace-nowrap ${
              active === t.id
                ? 'text-cyan-400 border-b-2 border-[#ffd700] bg-[#080d14]'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Sub-panel */}
      <div className="flex-1 overflow-hidden">
        {renderSub()}
      </div>
    </div>
  );
}

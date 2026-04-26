import React from 'react';

const BASE_URL = 'https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions';

const SDK_EXTENSIONS = [
  { id: 'vigil',                name: 'Vigil AI',               icon: '⚡', desc: 'Sovereign offline intelligence. Chat, agents, memory, screen capture.' },
  { id: 'code-sovereign',       name: 'Code Sovereign',         icon: '💻', desc: 'Full-stack code intelligence. Refactor, review, generate, explain.' },
  { id: 'research-nexus',       name: 'Research Nexus',         icon: '🔬', desc: 'Deep research agent. Crawls, synthesizes, and reports on any topic.' },
  { id: 'knowledge-cartographer', name: 'Knowledge Cartographer', icon: '🗺', desc: 'Builds knowledge graphs from your browsing. Connects ideas across pages.' },
  { id: 'memory-palace',        name: 'Memory Palace',          icon: '🏛', desc: 'Persistent memory vault. Stores, searches, and surfaces past sessions.' },
  { id: 'data-oracle',          name: 'Data Oracle',            icon: '📊', desc: 'Data analysis agent. Reads tables, generates charts, exports Excel.' },
  { id: 'screen-commander',     name: 'Screen Commander',       icon: '🖥️', desc: 'Capture, record, and analyze screen content with AI vision.' },
  { id: 'voice-forge',          name: 'Voice Forge',            icon: '🎙', desc: 'Voice-first AI interface. Speak commands, get spoken responses.' },
  { id: 'sentinel-watch',       name: 'Sentinel Watch',         icon: '🛡', desc: 'Page monitoring and anomaly detection. Alerts on changes.' },
  { id: 'creative-muse',        name: 'Creative Muse',          icon: '🎨', desc: 'Creative writing AI. Stories, scripts, poems, and content generation.' },
  { id: 'pattern-forge',        name: 'Pattern Forge',          icon: '🔮', desc: 'Pattern synthesis engine. Finds cross-domain connections and insights.' },
  { id: 'sovereign-mind',       name: 'Sovereign Mind',         icon: '🧠', desc: 'Advanced reasoning and cognitive framework. Strategy, philosophy, systems.' },
  { id: 'protocol-bridge',      name: 'Protocol Bridge',        icon: '🔗', desc: 'AI protocol orchestration. Connects agents across sessions and tabs.' },
  { id: 'data-alchemist',       name: 'Data Alchemist',         icon: '⚗️', desc: 'Transforms raw data into structured knowledge. JSON, CSV, PDF extraction.' },
  { id: 'vision-weaver',        name: 'Vision Weaver',          icon: '👁', desc: 'Visual AI. Reads and interprets images, screenshots, and page layouts.' },
  { id: 'edge-runner',          name: 'Edge Runner',            icon: '🚀', desc: 'Fast-task executor. Quick automations, form fills, and page actions.' },
  { id: 'logic-prover',         name: 'Logic Prover',           icon: '∴', desc: 'Formal reasoning engine. Validates arguments, proofs, and logic chains.' },
  { id: 'social-cortex',        name: 'Social Cortex',          icon: '🌐', desc: 'Social signal reader. Trends, sentiment, and network analysis.' },
  { id: 'organism-dashboard',   name: 'Organism Dashboard',     icon: '🔭', desc: 'Organism marketplace hub. Explore, deploy, and manage AI extensions.' },
];

export default function InstallPanel() {
  const openInVSCode = (id: string) => {
    const zipUrl = `${BASE_URL}/${id}.zip`;
    // Download the zip first, then signal VS Code to open it via URI scheme
    chrome.runtime.sendMessage({ action: 'downloadExtensionZip', url: zipUrl, name: id });
    // Also attempt to open VS Code with the workspace / extension folder
    window.open(`vscode://file/${id}`, '_blank');
  };

  const downloadZip = (id: string) => {
    const url = `${BASE_URL}/${id}.zip`;
    chrome.runtime.sendMessage({ action: 'downloadExtensionZip', url, name: id });
  };

  const downloadVigilBat = () => {
    chrome.runtime.sendMessage({ action: 'downloadJarvisBat' });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto bg-[#080d14] text-xs text-gray-300">

      {/* Header */}
      <div className="px-3 py-3 bg-[#0d1520] border-b border-[#1a3a5c]">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-cyan-400 text-base">⚡</span>
          <span className="font-bold tracking-widest text-white text-sm">V I G I L</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#ffd700]/20 text-[#ffd700] font-bold border border-[#ffd700]/30">v15</span>
        </div>
        <p className="text-gray-500 leading-relaxed">
          Sovereign AI platform. Install any SDK extension below — each one is a specialized AI agent that works alongside Vigil.
        </p>
      </div>

      {/* One-click Windows install */}
      <div className="px-3 py-2 border-b border-[#1a3a5c]">
        <p className="text-gray-400 font-semibold mb-1.5">🪟 Windows One-Click</p>
        <button
          onClick={downloadVigilBat}
          className="w-full py-2 bg-cyan-800/50 hover:bg-cyan-700/60 border border-cyan-700/40 rounded text-cyan-200 transition-colors font-medium"
        >
          ⬇ Download install-vigil-edge.bat
        </button>
        <p className="mt-1 text-gray-600">Double-click to install. Vigil opens automatically in Edge.</p>
      </div>

      {/* SDK Extensions */}
      <div className="px-3 pt-3 pb-1">
        <p className="text-gray-400 font-semibold mb-2">🧩 SDK Extensions</p>
        <p className="text-gray-600 mb-3 leading-relaxed">
          Each extension is a sovereign AI agent. Download as ZIP — or click <span className="text-cyan-400">Open in VS Code</span> to install directly into your editor.
        </p>
      </div>

      <div className="px-3 pb-4 space-y-2">
        {SDK_EXTENSIONS.map((ext) => (
          <div key={ext.id} className="flex items-start gap-2 p-2.5 bg-[#0d1520] border border-[#1a3a5c] rounded-lg">
            <span className="text-lg flex-shrink-0 mt-0.5">{ext.icon}</span>
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-200 text-[11px]">{ext.name}</p>
              <p className="text-gray-500 leading-relaxed mt-0.5">{ext.desc}</p>
              <div className="flex gap-1.5 mt-2">
                <button
                  onClick={() => downloadZip(ext.id)}
                  className="text-[10px] px-2 py-1 bg-[#1a3a5c] hover:bg-[#1a4a7c] rounded text-gray-300 transition-colors"
                >
                  ⬇ ZIP
                </button>
                <button
                  onClick={() => openInVSCode(ext.id)}
                  className="text-[10px] px-2 py-1 bg-cyan-900/50 hover:bg-cyan-800/60 border border-cyan-800/40 rounded text-cyan-300 transition-colors"
                >
                  &lt;/&gt; Open in VS Code
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Manual install guide */}
      <div className="px-3 pb-4 space-y-1">
        <p className="text-gray-400 font-semibold">🌐 Manual Edge/Chrome Install</p>
        <ol className="text-gray-500 leading-relaxed space-y-1 list-decimal list-inside mt-1">
          <li>Download the ZIP above</li>
          <li>Extract the ZIP to a folder</li>
          <li>Open <code className="text-cyan-400">edge://extensions</code> or <code className="text-cyan-400">chrome://extensions</code></li>
          <li>Enable Developer Mode</li>
          <li>Click "Load unpacked" → select the extracted folder</li>
        </ol>
      </div>

      <div className="px-3 pb-3 text-gray-700 text-[10px]">
        Sovereign Organism Platform · FreddyCreates/potential-succotash · v15.0.0
      </div>
    </div>
  );
}

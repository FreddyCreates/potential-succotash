import React from 'react';

export default function InstallPanel() {
  const downloadZip = () => {
    chrome.runtime.sendMessage({ action: 'downloadJarvisZip' });
  };
  const downloadBat = () => {
    chrome.runtime.sendMessage({ action: 'downloadJarvisBat' });
  };

  return (
    <div className="flex flex-col h-full overflow-y-auto p-3 space-y-3 text-xs text-gray-300">
      <div className="bg-purple-900/30 border border-purple-700/40 rounded-lg p-3">
        <h2 className="font-bold text-purple-300 text-sm mb-2">⚡ JARVIS v4.0.0</h2>
        <p className="text-gray-400 leading-relaxed">
          Sovereign AI assistant for Microsoft Edge. Native NeuroCore brain, React UI, jsPDF, ExcelJS, Transformers.js NLP, and Dexie persistent memory.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-200">🪟 Windows (One-Click)</h3>
        <button
          onClick={downloadBat}
          className="w-full py-2 bg-cyan-800/60 hover:bg-cyan-700/80 rounded text-cyan-200 transition-colors"
        >
          ⬇ Download install-jarvis-edge.bat
        </button>
        <p className="text-gray-500 leading-relaxed">
          Double-click the .bat file. It downloads the latest JARVIS zip, extracts it, and opens Edge with JARVIS loaded automatically.
        </p>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-200">🌐 Manual Install</h3>
        <button
          onClick={downloadZip}
          className="w-full py-2 bg-purple-900/60 hover:bg-purple-800/80 rounded text-purple-200 transition-colors"
        >
          ⬇ Download jarvis-extension.zip
        </button>
        <ol className="text-gray-500 leading-relaxed space-y-1 list-decimal list-inside">
          <li>Download the zip above</li>
          <li>Extract the zip to a folder</li>
          <li>Open <code className="text-cyan-400">edge://extensions</code></li>
          <li>Enable Developer Mode (top right)</li>
          <li>Click "Load unpacked" → select the extracted folder</li>
          <li>Pin JARVIS from the extensions toolbar</li>
        </ol>
      </div>

      <div className="space-y-2">
        <h3 className="font-semibold text-gray-200">🔄 Auto-Updates</h3>
        <p className="text-gray-500 leading-relaxed">
          JARVIS checks for updates every 4 hours. When an update is available, re-run install-jarvis-edge.bat — it replaces the old version automatically.
        </p>
      </div>

      <div className="bg-gray-800/40 rounded p-2 text-gray-500">
        <p>Sovereign Organism Platform · FreddyCreates/potential-succotash</p>
      </div>
    </div>
  );
}

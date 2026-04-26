import React, { useState } from 'react';

export default function ScreenPanel() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const [virtualDesktop, setVirtualDesktop] = useState(false);

  const capture = () => {
    setLoading(true);
    setStatus('');
    chrome.runtime.sendMessage({ action: 'captureTab' }, (resp) => {
      setLoading(false);
      if (chrome.runtime.lastError || !resp?.success) {
        setStatus('❌ ' + (resp?.message || chrome.runtime.lastError?.message || 'Capture failed'));
        return;
      }
      setScreenshot(resp.dataUrl);
      setTitle(resp.title || '');
      setStatus('✅ Captured: ' + (resp.title || 'Unknown page'));
    });
  };

  const download = () => {
    if (!screenshot) return;
    chrome.runtime.sendMessage({ action: 'screenshot' }, (resp) => {
      if (resp?.success) setStatus('✅ Saved: ' + (resp.message || 'Screenshot saved'));
    });
  };

  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      setStatus('⏹ Recording stopped');
    } else {
      setRecording(true);
      setStatus('⏺ Recording screen…');
    }
  };

  const launchVirtualDesktop = () => {
    setVirtualDesktop(true);
    setStatus('🖥️ Vigil is activating virtual desktop mode…');
    setTimeout(() => setVirtualDesktop(false), 4000);
  };

  return (
    <div className="flex flex-col h-full bg-[#080d14] text-gray-100">
      <div className="flex flex-wrap gap-2 px-3 py-2 bg-[#0d1520] border-b border-[#1a3a5c]">
        <button
          onClick={capture}
          disabled={loading}
          className="flex-1 py-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 text-white rounded text-xs transition-colors"
        >
          {loading ? 'Capturing…' : '📸 Capture Tab'}
        </button>
        {screenshot && (
          <button
            onClick={download}
            className="flex-1 py-1.5 bg-[#1a3a5c] hover:bg-[#1a4a7c] text-gray-200 rounded text-xs transition-colors"
          >
            ⬇ Save
          </button>
        )}
        <button
          onClick={toggleRecord}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${
            recording
              ? 'bg-red-700 hover:bg-red-600 text-white animate-pulse'
              : 'bg-[#1a3a5c] hover:bg-[#1a4a7c] text-gray-200'
          }`}
        >
          {recording ? '⏹ Stop' : '⏺ Record'}
        </button>
        <button
          onClick={launchVirtualDesktop}
          className="flex-1 py-1.5 bg-[#1a3a5c] hover:bg-[#1a4a7c] text-cyan-300 rounded text-xs transition-colors"
        >
          🖥️ Virtual Desktop
        </button>
      </div>

      {status && (
        <div className="px-3 py-1 text-xs text-cyan-400 border-b border-[#1a3a5c]">{status}</div>
      )}

      {virtualDesktop && (
        <div className="mx-3 mt-3 px-4 py-3 bg-[#0d1520] border border-[#1a3a5c] rounded text-center text-xs text-cyan-300">
          🖥️ Vigil Virtual Desktop — launching…
        </div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {screenshot ? (
          <div>
            {title && <p className="text-xs text-gray-500 mb-2 truncate">{title}</p>}
            <img
              src={screenshot}
              alt="Screenshot"
              className="w-full rounded border border-[#1a3a5c] shadow-lg"
            />
          </div>
        ) : (
          <div className="text-center text-gray-600 text-xs mt-8">
            Click "Capture Tab" to take a screenshot
          </div>
        )}
      </div>
    </div>
  );
}

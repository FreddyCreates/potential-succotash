import React, { useState, useEffect, useRef } from 'react';

const VIGIL_ACTIVITY = [
  '> Initializing virtual environment…',
  '> Vigil AI v15 — virtual desktop online',
  '> Loading browser context…',
  '> Scanning active tabs…',
  '> Reading page DOM structure…',
  '> Extracting visible text…',
  '> Analyzing content clusters…',
  '> Running pattern synthesis…',
  '> Cross-referencing memory vault…',
  '> Delegating to research agent…',
  '> Agent dispatched → researcher-1 active',
  '> Crawling linked resources…',
  '> Compiling findings…',
  '> Synthesis complete. Ready for next task.',
  '> Awaiting your instruction, sir.',
];

export default function ScreenPanel() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');
  const [recording, setRecording] = useState(false);
  const [virtualDesktop, setVirtualDesktop] = useState(false);
  const [activityLines, setActivityLines] = useState<string[]>([]);
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activityRef.current) {
      activityRef.current.scrollTop = activityRef.current.scrollHeight;
    }
  }, [activityLines]);

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
    if (virtualDesktop) {
      setVirtualDesktop(false);
      setActivityLines([]);
      setStatus('🖥️ Virtual desktop closed');
      return;
    }
    setVirtualDesktop(true);
    setActivityLines([]);
    setStatus('🖥️ Vigil virtual desktop — online');
    // Stream activity lines one by one
    VIGIL_ACTIVITY.forEach((line, i) => {
      setTimeout(() => {
        setActivityLines(prev => [...prev, line]);
      }, i * 600);
    });
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
          {recording ? '⏹ Stop Rec' : '⏺ Record'}
        </button>
        <button
          onClick={launchVirtualDesktop}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${
            virtualDesktop
              ? 'bg-cyan-700/80 hover:bg-cyan-600/80 text-white border border-cyan-500/50'
              : 'bg-[#1a3a5c] hover:bg-[#1a4a7c] text-cyan-300'
          }`}
        >
          {virtualDesktop ? '✕ Close Desktop' : '🖥️ Virtual Desktop'}
        </button>
      </div>

      {status && (
        <div className="px-3 py-1 text-xs text-cyan-400 border-b border-[#1a3a5c] flex-shrink-0">{status}</div>
      )}

      {/* Virtual Desktop — animated terminal showing Vigil working */}
      {virtualDesktop && (
        <div className="mx-3 mt-3 rounded-lg border border-cyan-800/50 overflow-hidden flex-shrink-0">
          {/* Terminal title bar */}
          <div className="flex items-center gap-1.5 px-3 py-1.5 bg-[#0d1520] border-b border-cyan-900/40">
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
            <span className="w-2 h-2 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[10px] text-cyan-600 font-mono">vigil@virtual-desktop:~</span>
          </div>
          {/* Activity stream */}
          <div
            ref={activityRef}
            className="bg-[#040a10] p-3 font-mono text-[10px] text-cyan-400 space-y-0.5 max-h-44 overflow-y-auto"
          >
            {activityLines.map((line, i) => (
              <div key={i} className={i === activityLines.length - 1 ? 'animate-pulse' : ''}>
                {line}
                {i === activityLines.length - 1 && (
                  <span className="inline-block w-1.5 h-3 bg-cyan-400 ml-0.5 animate-ping" />
                )}
              </div>
            ))}
            {activityLines.length === 0 && (
              <span className="text-cyan-600">Booting virtual desktop…<span className="animate-ping">▋</span></span>
            )}
          </div>
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
        ) : !virtualDesktop && (
          <div className="text-center text-gray-600 text-xs mt-8 space-y-2">
            <div>📸 Click <span className="text-cyan-400">Capture Tab</span> for a screenshot</div>
            <div>⏺ Click <span className="text-cyan-400">Record</span> to record the screen</div>
            <div>🖥️ Click <span className="text-cyan-400">Virtual Desktop</span> to watch Vigil work</div>
          </div>
        )}
      </div>
    </div>
  );
}

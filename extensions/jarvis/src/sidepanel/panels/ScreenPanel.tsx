import React, { useState } from 'react';

export default function ScreenPanel() {
  const [screenshot, setScreenshot] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState('');

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

  return (
    <div className="flex flex-col h-full">
      <div className="flex gap-2 px-3 py-2 bg-gray-900/50 border-b border-gray-800/50">
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
            className="flex-1 py-1.5 bg-gray-700 hover:bg-gray-600 text-gray-200 rounded text-xs transition-colors"
          >
            ⬇ Save
          </button>
        )}
      </div>

      {status && (
        <div className="px-3 py-1 text-xs text-gray-400">{status}</div>
      )}

      <div className="flex-1 overflow-y-auto p-2">
        {screenshot ? (
          <div>
            {title && <p className="text-xs text-gray-500 mb-2 truncate">{title}</p>}
            <img
              src={screenshot}
              alt="Screenshot"
              className="w-full rounded border border-gray-700 shadow-lg"
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

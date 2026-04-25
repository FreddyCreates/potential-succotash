import React, { useState } from 'react';

interface ToolResult {
  success: boolean;
  message?: string;
  pageData?: any;
  summary?: any;
  links?: any[];
}

export default function ToolsPanel() {
  const [result, setResult] = useState<ToolResult | null>(null);
  const [loading, setLoading] = useState(false);

  const run = (action: string, extra?: Record<string, unknown>) => {
    setLoading(true);
    setResult(null);
    chrome.runtime.sendMessage({ action, ...extra }, (resp) => {
      setLoading(false);
      if (chrome.runtime.lastError) {
        setResult({ success: false, message: chrome.runtime.lastError.message });
        return;
      }
      setResult(resp);
    });
  };

  const searchWeb = () => {
    const q = prompt('Search for:');
    if (q) run('searchWeb', { query: q });
  };

  const formatResult = (r: ToolResult): string => {
    if (!r.success) return '❌ ' + (r.message || 'Failed');
    if (r.summary) {
      const s = r.summary;
      return `📄 "${s.title}"\n${s.wordCount} words, ${s.headingCount} headings\n\nKey points:\n${(s.keyPoints || []).join('\n')}`;
    }
    if (r.pageData) {
      const p = r.pageData;
      return `📖 "${p.title}"\n${p.wordCount} words, ${p.linkCount} links\n\n${p.text?.substring(0, 400)}…`;
    }
    if (r.links) {
      return r.links.slice(0, 20).map((l: any) => `• ${l.text || '(no text)'}: ${l.href}`).join('\n');
    }
    return r.message || '✅ Done';
  };

  return (
    <div className="flex flex-col h-full overflow-hidden">
      <div className="grid grid-cols-2 gap-2 p-3">
        <button
          onClick={() => run('analyzeCurrentPage')}
          className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-200 transition-colors text-left"
        >
          🔬 Analyze Page
        </button>
        <button
          onClick={searchWeb}
          className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-200 transition-colors text-left"
        >
          🌐 Search Web
        </button>
        <button
          onClick={() => run('summarize')}
          className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-200 transition-colors text-left"
        >
          📋 Summarize Page
        </button>
        <button
          onClick={() => run('extractLinks')}
          className="py-2 px-3 bg-gray-800 hover:bg-gray-700 rounded text-xs text-gray-200 transition-colors text-left"
        >
          🔗 Extract Links
        </button>
        <button
          onClick={() => run('runSovereignTool', { tool: 'researchMode', params: { topic: 'general' } })}
          className="col-span-2 py-2 px-3 bg-purple-900/50 hover:bg-purple-800/70 rounded text-xs text-purple-200 transition-colors text-left"
        >
          🔬 Find Research
        </button>
      </div>

      {loading && (
        <div className="px-3 text-xs text-cyan-400 animate-pulse">Processing…</div>
      )}

      {result && (
        <div className="flex-1 overflow-y-auto px-3 pb-3">
          <pre className="text-xs text-gray-300 whitespace-pre-wrap leading-relaxed bg-gray-900/60 rounded p-2 border border-gray-800">
            {formatResult(result)}
          </pre>
        </div>
      )}
    </div>
  );
}

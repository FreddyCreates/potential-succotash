import React, { useState } from 'react';
import { useJarvisStore } from '../../store';

const TEMPLATES: Record<string, string> = {
  'Meeting': `# Meeting Notes\nDate: ${new Date().toLocaleDateString()}\n\n## Attendees\n- \n\n## Agenda\n1. \n\n## Action Items\n- \n`,
  'SWOT': `# SWOT Analysis\n\n## Strengths\n- \n\n## Weaknesses\n- \n\n## Opportunities\n- \n\n## Threats\n- \n`,
  'Research': `# Research Notes\nTopic: \nDate: ${new Date().toLocaleDateString()}\n\n## Key Findings\n- \n\n## Sources\n- \n`,
  'Brainstorm': `# Brainstorm\nIdea: \n\n## Raw Ideas\n- \n\n## Top 3\n1. \n2. \n3. \n`,
  'Daily Plan': `# Daily Plan — ${new Date().toLocaleDateString()}\n\n## Must Do\n- [ ] \n\n## Goals\n- \n\n## Notes\n`,
  'Decision': `# Decision Record\nQuestion: \nDate: ${new Date().toLocaleDateString()}\n\n## Options\n1. \n2. \n\n## Chosen\n\n## Rationale\n`,
};

export default function WorkspacePanel() {
  const { workspaceText, setWorkspaceText } = useJarvisStore();
  const [saveStatus, setSaveStatus] = useState<string | null>(null);

  const wordCount = workspaceText.trim() ? workspaceText.trim().split(/\s+/).length : 0;
  const charCount = workspaceText.length;

  const applyTemplate = (name: string) => {
    if (workspaceText && !confirm('Replace current content with template?')) return;
    setWorkspaceText(TEMPLATES[name] || '');
  };

  const copyText = () => {
    if (!workspaceText) return;
    navigator.clipboard.writeText(workspaceText).then(() => {
      setSaveStatus('Copied!');
      setTimeout(() => setSaveStatus(null), 1500);
    }).catch(() => {});
  };

  const saveAsNote = () => {
    if (!workspaceText.trim()) return;
    const firstLine = workspaceText.trim().split('\n')[0].replace(/^#+\s*/, '').substring(0, 100);
    chrome.runtime.sendMessage({ action: 'takeNote', content: firstLine + (workspaceText.length > firstLine.length ? '\n…' : '') }, (resp) => {
      setSaveStatus(resp?.success ? 'Saved to Notes!' : 'Save failed');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  const exportPdf = () => {
    if (!workspaceText) return;
    const title = workspaceText.trim().split('\n')[0].replace(/^#+\s*/, '') || 'Workspace Export';
    chrome.runtime.sendMessage({ action: 'generatePdf', title, content: workspaceText, author: 'Alfredo' }, () => {
      setSaveStatus('PDF downloading…');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  const exportExcel = () => {
    if (!workspaceText) return;
    const lines = workspaceText.split('\n').filter((l) => l.trim());
    chrome.runtime.sendMessage({
      action: 'generateExcel',
      title: 'Workspace Export',
      sheets: [{ name: 'Workspace', columns: ['#', 'Content'], rows: lines.map((l, i) => [i + 1, l]) }],
    }, () => {
      setSaveStatus('Excel downloading…');
      setTimeout(() => setSaveStatus(null), 2000);
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* Template buttons */}
      <div className="flex flex-wrap gap-1 px-2 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        {Object.keys(TEMPLATES).map((t) => (
          <button
            key={t}
            onClick={() => applyTemplate(t)}
            className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            {t}
          </button>
        ))}
      </div>

      {/* Text area */}
      <textarea
        className="flex-1 bg-gray-950 text-gray-200 font-mono text-xs p-3 outline-none resize-none border-b border-gray-800 placeholder-gray-700"
        placeholder="Start typing or choose a template…"
        value={workspaceText}
        onChange={(e) => setWorkspaceText(e.target.value)}
        spellCheck={false}
      />

      {/* Word / char count */}
      <div className="flex items-center justify-end px-3 py-0.5 bg-gray-900/30 border-b border-gray-800/50 text-xs text-gray-600">
        {wordCount} word{wordCount !== 1 ? 's' : ''} · {charCount} char{charCount !== 1 ? 's' : ''}
        {saveStatus && <span className="ml-3 text-green-400">{saveStatus}</span>}
      </div>

      {/* Export buttons */}
      <div className="flex gap-1 px-2 py-1.5 bg-gray-900/50">
        <button
          onClick={copyText}
          className="flex-1 text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
        >
          📋 Copy
        </button>
        <button
          onClick={saveAsNote}
          disabled={!workspaceText.trim()}
          className="flex-1 text-xs py-1 bg-cyan-900/60 hover:bg-cyan-800/80 disabled:bg-gray-800 disabled:text-gray-600 rounded text-cyan-200 transition-colors"
        >
          📒 Save Note
        </button>
        <button
          onClick={exportPdf}
          disabled={!workspaceText.trim()}
          className="flex-1 text-xs py-1 bg-purple-900/60 hover:bg-purple-800/80 disabled:bg-gray-800 disabled:text-gray-600 rounded text-purple-200 transition-colors"
        >
          📄 PDF
        </button>
        <button
          onClick={exportExcel}
          disabled={!workspaceText.trim()}
          className="flex-1 text-xs py-1 bg-green-900/60 hover:bg-green-800/80 disabled:bg-gray-800 disabled:text-gray-600 rounded text-green-200 transition-colors"
        >
          📊 Excel
        </button>
      </div>
    </div>
  );
}

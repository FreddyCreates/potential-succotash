import React from 'react';
import { useJarvisStore } from '../../store';

const TEMPLATES: Record<string, string> = {
  'Meeting Notes': `# Meeting Notes\nDate: ${new Date().toLocaleDateString()}\n\n## Attendees\n- \n\n## Agenda\n1. \n\n## Action Items\n- \n\n## Notes\n`,
  SWOT: `# SWOT Analysis\n\n## Strengths\n- \n\n## Weaknesses\n- \n\n## Opportunities\n- \n\n## Threats\n- \n`,
  Research: `# Research Notes\nTopic: \nDate: ${new Date().toLocaleDateString()}\n\n## Key Findings\n- \n\n## Sources\n- \n\n## Summary\n`,
  Brainstorm: `# Brainstorm Session\nIdea: \n\n## Raw Ideas\n- \n\n## Top 3\n1. \n2. \n3. \n\n## Next Steps\n- \n`,
};

export default function WorkspacePanel() {
  const { workspaceText, setWorkspaceText } = useJarvisStore();

  const applyTemplate = (name: string) => {
    setWorkspaceText(TEMPLATES[name] || '');
  };

  const copyText = () => {
    if (!workspaceText) return;
    navigator.clipboard.writeText(workspaceText).catch(() => {});
  };

  const exportPdf = () => {
    if (!workspaceText) return;
    chrome.runtime.sendMessage({
      action: 'generatePdf',
      title: 'Workspace Export',
      content: workspaceText,
      author: 'Alfredo',
    });
  };

  const exportExcel = () => {
    if (!workspaceText) return;
    const lines = workspaceText.split('\n').filter((l) => l.trim());
    chrome.runtime.sendMessage({
      action: 'generateExcel',
      title: 'Workspace Export',
      sheets: [{ name: 'Workspace', columns: ['Line', 'Content'], rows: lines.map((l, i) => [i + 1, l]) }],
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

      {/* Export buttons */}
      <div className="flex gap-1 px-2 py-1.5 bg-gray-900/50">
        <button
          onClick={copyText}
          className="flex-1 text-xs py-1 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
        >
          📋 Copy
        </button>
        <button
          onClick={exportPdf}
          className="flex-1 text-xs py-1 bg-purple-900/60 hover:bg-purple-800/80 rounded text-purple-200 transition-colors"
        >
          📄 Export PDF
        </button>
        <button
          onClick={exportExcel}
          className="flex-1 text-xs py-1 bg-green-900/60 hover:bg-green-800/80 rounded text-green-200 transition-colors"
        >
          📊 Export Excel
        </button>
      </div>
    </div>
  );
}

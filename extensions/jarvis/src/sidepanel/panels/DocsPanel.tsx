import React, { useEffect } from 'react';
import { useJarvisStore } from '../../store';

export default function DocsPanel() {
  const { docs, setDocs } = useJarvisStore();

  useEffect(() => {
    chrome.runtime.sendMessage({ action: 'listDocuments' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setDocs(resp.documents || []);
    });
  }, [setDocs]);

  const downloadDoc = (doc: any) => {
    if (doc.type === 'pdf') {
      chrome.runtime.sendMessage({
        action: 'generatePdf',
        title: doc.title,
        content: doc.content,
        author: doc.author,
      });
    } else {
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = doc.title.replace(/[^a-z0-9]/gi, '_') + '.txt';
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const typeIcon = (type: string) => {
    if (type === 'pdf') return '📄';
    if (type === 'excel') return '📊';
    return '📝';
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        <span className="text-xs text-gray-400">{docs.length} documents</span>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {docs.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            No documents yet. Say "create pdf: title" in Chat.
          </div>
        )}
        {docs.map((doc: any) => (
          <div key={doc.id} className="flex items-start gap-2 px-3 py-2 hover:bg-gray-800/30 transition-colors">
            <span className="text-lg flex-shrink-0">{typeIcon(doc.type)}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium text-gray-200 truncate">{doc.title}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                {doc.author} · {doc.type} · {new Date(doc.timestamp).toLocaleDateString()}
              </div>
              <div className="text-xs text-gray-500 truncate mt-0.5">
                {doc.content?.substring(0, 80)}…
              </div>
            </div>
            <button
              onClick={() => downloadDoc(doc)}
              className="flex-shrink-0 text-xs px-2 py-0.5 bg-gray-700 hover:bg-gray-600 rounded text-gray-300 transition-colors"
            >
              ⬇
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

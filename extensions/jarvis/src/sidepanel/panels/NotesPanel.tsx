import React, { useEffect } from 'react';
import { useJarvisStore } from '../../store';

export default function NotesPanel() {
  const { notes, setNotes } = useJarvisStore();

  const loadNotes = () => {
    chrome.runtime.sendMessage({ action: 'listNotes' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setNotes(resp.notes || []);
    });
  };

  useEffect(() => { loadNotes(); }, []);

  const deleteNote = (noteId: number) => {
    chrome.runtime.sendMessage({ action: 'deleteNote', noteId }, (resp) => {
      if (resp?.success) loadNotes();
    });
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        <span className="text-xs text-gray-400">{notes.length} notes</span>
        <button
          onClick={loadNotes}
          className="text-xs text-cyan-500 hover:text-cyan-400 transition-colors"
        >
          ↻ Refresh
        </button>
      </div>

      <div className="flex-1 overflow-y-auto divide-y divide-gray-800/50">
        {notes.length === 0 && (
          <div className="text-center text-gray-600 text-xs py-8">
            No notes yet. Say "take note: your text" in Chat.
          </div>
        )}
        {notes.map((note: any) => (
          <div key={note.id} className="flex items-start gap-2 px-3 py-2 hover:bg-gray-800/30 transition-colors">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-200 leading-relaxed">{note.content}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                {note.author} · {new Date(note.timestamp).toLocaleDateString()}
              </div>
            </div>
            <button
              onClick={() => deleteNote(note.id)}
              className="flex-shrink-0 text-xs text-red-500 hover:text-red-400 transition-colors"
              title="Delete note"
            >
              🗑
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}

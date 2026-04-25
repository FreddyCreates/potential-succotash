import React, { useEffect, useState } from 'react';
import { useJarvisStore } from '../../store';

export default function NotesPanel() {
  const { notes, setNotes } = useJarvisStore();
  const [newNote, setNewNote] = useState('');
  const [saving, setSaving] = useState(false);

  const loadNotes = () => {
    chrome.runtime.sendMessage({ action: 'listNotes' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      setNotes(resp.notes || []);
    });
  };

  useEffect(() => { loadNotes(); }, []);

  const saveNote = () => {
    if (!newNote.trim()) return;
    setSaving(true);
    chrome.runtime.sendMessage({ action: 'takeNote', content: newNote.trim() }, (resp) => {
      setSaving(false);
      if (resp?.success) {
        setNewNote('');
        loadNotes();
      }
    });
  };

  const deleteNote = (noteId: number) => {
    chrome.runtime.sendMessage({ action: 'deleteNote', noteId }, (resp) => {
      if (resp?.success) loadNotes();
    });
  };

  return (
    <div className="flex flex-col h-full">
      {/* New note form */}
      <div className="px-2 py-2 bg-gray-900/50 border-b border-gray-800/50">
        <div className="flex gap-1.5">
          <input
            type="text"
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') saveNote(); }}
            placeholder="New note…"
            className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
          />
          <button
            onClick={saveNote}
            disabled={!newNote.trim() || saving}
            className="px-2 py-1 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded text-xs transition-colors"
          >
            {saving ? '…' : '+ Save'}
          </button>
        </div>
      </div>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-1.5 bg-gray-900/30 border-b border-gray-800/50">
        <span className="text-xs text-gray-500">{notes.length} note{notes.length !== 1 ? 's' : ''}</span>
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
            No notes yet. Type above or say "take note: …" in Chat.
          </div>
        )}
        {notes.map((note: any) => (
          <div key={note.id} className="flex items-start gap-2 px-3 py-2 hover:bg-gray-800/30 transition-colors group">
            <div className="flex-1 min-w-0">
              <div className="text-xs text-gray-200 leading-relaxed">{note.content}</div>
              <div className="text-xs text-gray-600 mt-0.5">
                {note.author} · {new Date(note.timestamp).toLocaleString()}
              </div>
            </div>
            <div className="flex gap-1 flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
              <button
                onClick={() => navigator.clipboard.writeText(note.content).catch(() => {})}
                className="text-xs text-gray-500 hover:text-gray-300 transition-colors"
                title="Copy note"
              >
                📋
              </button>
              <button
                onClick={() => deleteNote(note.id)}
                className="text-xs text-red-500 hover:text-red-400 transition-colors"
                title="Delete note"
              >
                🗑
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

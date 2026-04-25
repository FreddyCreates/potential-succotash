import React, { useState, useRef, useEffect } from 'react';
import { useJarvisStore } from '../../store';

const QUICK_ACTIONS = [
  { label: 'Status', text: 'what is your status' },
  { label: 'Summarize', text: 'summarize this page' },
  { label: 'Note', text: 'take note: ' },
  { label: 'Memory', text: 'memory temple' },
  { label: 'Help', text: 'what can you do' },
];

export default function ChatPanel() {
  const { messages, isTyping, micListening, addMessage, setTyping, setMicListening, clearMessages } = useJarvisStore();
  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    const userMsg = { role: 'user' as const, text: text.trim(), ts: Date.now() };
    addMessage(userMsg);
    setInput('');
    setTyping(true);

    chrome.runtime.sendMessage({ action: 'chat', text: text.trim() }, (resp) => {
      setTyping(false);
      if (chrome.runtime.lastError) {
        addMessage({ role: 'jarvis', text: '[Error: ' + chrome.runtime.lastError.message + ']', ts: Date.now() });
        return;
      }
      const reply = resp?.message || resp?.data?.message || 'No response.';
      addMessage({ role: 'jarvis', text: reply, ts: Date.now() });
    });
  };

  const handleQuickAction = (qa: { label: string; text: string }) => {
    if (qa.text.endsWith(': ')) {
      setInput(qa.text);
      return;
    }
    sendMessage(qa.text);
  };

  const copyMessage = (text: string, idx: number) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 1500);
    }).catch(() => {});
  };

  const handleClearChat = () => {
    clearMessages();
    chrome.runtime.sendMessage({ action: 'clearChat' }, () => {});
  };

  const toggleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      addMessage({ role: 'jarvis', text: 'Speech recognition not available in this browser.', ts: Date.now() });
      return;
    }
    if (micListening) {
      setMicListening(false);
      return;
    }
    const rec = new SpeechRec();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';
    setMicListening(true);
    rec.onresult = (e: any) => {
      const transcript = e.results[0][0].transcript;
      setMicListening(false);
      sendMessage(transcript);
    };
    rec.onerror = () => setMicListening(false);
    rec.onend = () => setMicListening(false);
    rec.start();
  };

  return (
    <div className="flex flex-col h-full">
      {/* Quick actions */}
      <div className="flex items-center gap-1 px-2 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        <div className="flex gap-1 flex-1 flex-wrap">
          {QUICK_ACTIONS.map((qa) => (
            <button
              key={qa.label}
              onClick={() => handleQuickAction(qa)}
              className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
            >
              {qa.label}
            </button>
          ))}
        </div>
        <button
          onClick={handleClearChat}
          title="Clear chat"
          className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-red-900/60 rounded text-gray-500 hover:text-red-400 transition-colors ml-1 flex-shrink-0"
        >
          🗑
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-8 space-y-1">
            <div>⚡ JARVIS online</div>
            <div className="text-gray-700">Ask anything or use a quick action above</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-fade-in flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              onClick={() => copyMessage(msg.text, i)}
              title={new Date(msg.ts).toLocaleTimeString() + ' — click to copy'}
              className={`group max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words cursor-pointer relative ${
                msg.role === 'user'
                  ? 'bg-cyan-900/60 text-cyan-100 border border-cyan-800/40 hover:border-cyan-600/60'
                  : 'bg-gray-800/80 text-gray-200 border border-gray-700/40 hover:border-gray-600/60'
              }`}
            >
              {copiedIdx === i && (
                <span className="absolute -top-5 right-1 text-xs text-green-400 bg-gray-900 px-1 rounded">Copied!</span>
              )}
              {msg.text}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-gray-800/80 border border-gray-700/40 rounded-lg px-3 py-2">
              <div className="flex gap-1">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}
        <div ref={endRef} />
      </div>

      {/* Input */}
      <div className="flex items-center gap-1.5 px-2 py-2 border-t border-gray-800 bg-gray-900/50">
        <button
          onClick={toggleMic}
          className={`p-1.5 rounded-full text-sm transition-all ${
            micListening
              ? 'bg-red-600 text-white animate-pulse'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
          title={micListening ? 'Stop listening' : 'Voice input'}
        >
          🎤
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Talk to JARVIS…"
          className="flex-1 bg-gray-800 border border-gray-700 rounded-lg px-3 py-1.5 text-xs text-gray-100 placeholder-gray-600 outline-none focus:border-cyan-700 transition-colors"
        />
        <button
          onClick={() => sendMessage(input)}
          disabled={!input.trim() || isTyping}
          className="p-1.5 bg-cyan-700 hover:bg-cyan-600 disabled:bg-gray-700 disabled:text-gray-500 text-white rounded-lg text-xs transition-colors"
        >
          ➤
        </button>
      </div>
    </div>
  );
}

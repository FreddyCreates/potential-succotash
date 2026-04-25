import React, { useState, useRef, useEffect } from 'react';
import { useJarvisStore } from '../../store';

const QUICK_ACTIONS = ['Status', 'Protocols', 'Temple', 'Help'];

export default function ChatPanel() {
  const { messages, isTyping, micListening, addMessage, setTyping, setMicListening } = useJarvisStore();
  const [input, setInput] = useState('');
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

  const handleQuickAction = (action: string) => {
    const map: Record<string, string> = {
      Status: 'what is your status',
      Protocols: 'what are the protocols',
      Temple: 'memory temple',
      Help: 'what can you do',
    };
    sendMessage(map[action] || action);
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
      <div className="flex gap-1 px-2 py-1.5 bg-gray-900/50 border-b border-gray-800/50">
        {QUICK_ACTIONS.map((a) => (
          <button
            key={a}
            onClick={() => handleQuickAction(a)}
            className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-gray-700 rounded text-gray-300 transition-colors"
          >
            {a}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-8">
            ⚡ JARVIS online — say anything
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-fade-in flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-lg px-3 py-2 text-xs leading-relaxed whitespace-pre-wrap break-words ${
                msg.role === 'user'
                  ? 'bg-cyan-900/60 text-cyan-100 border border-cyan-800/40'
                  : 'bg-gray-800/80 text-gray-200 border border-gray-700/40'
              }`}
            >
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
              ? 'bg-red-600 text-white animate-pulse-glow'
              : 'bg-gray-800 text-gray-400 hover:text-gray-200'
          }`}
          title="Voice input"
        >
          🎤
        </button>
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(input); } }}
          placeholder="Talk to JARVIS..."
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

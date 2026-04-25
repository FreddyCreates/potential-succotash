import React, { useState, useRef, useEffect, useCallback } from 'react';
import { useJarvisStore } from '../../store';

const QUICK_ACTIONS = [
  { label: 'Brief me', text: '__brief__' },
  { label: 'Status', text: 'what is your status' },
  { label: '🤖 Research agent', text: '__agent_research__', prefill: true },
  { label: '🤖 Agents', text: '__listagents__' },
  { label: 'Timer', text: 'set a timer for ', prefill: true },
  { label: 'Summarize', text: 'summarize this page' },
  { label: 'Help', text: 'what can you do' },
];

/** Strip emoji and symbols so TTS sounds clean */
function stripForTTS(text: string): string {
  return text
    .replace(/[^\x00-\x7F]/g, ' ')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

/** Speak text via Web Speech API */
function speak(text: string) {
  if (!window.speechSynthesis) return;
  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(stripForTTS(text));
  utterance.rate = 0.92;
  utterance.pitch = 0.78;
  utterance.volume = 1;
  // prefer a deep male voice if available
  const voices = window.speechSynthesis.getVoices();
  const preferred = voices.find(v =>
    /google uk english male|david|mark|daniel|alex/i.test(v.name)
  ) || voices.find(v => v.lang.startsWith('en'));
  if (preferred) utterance.voice = preferred;
  window.speechSynthesis.speak(utterance);
}

export default function ChatPanel() {
  const {
    messages, isTyping, micListening, ttsEnabled,
    addMessage, setTyping, setMicListening, setTtsEnabled, clearMessages,
  } = useJarvisStore();

  const [input, setInput] = useState('');
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [greeted, setGreeted] = useState(false);
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isTyping]);

  /** Deliver a JARVIS response from background */
  const deliverResponse = useCallback((text: string, opts?: { skipTts?: boolean }) => {
    addMessage({ role: 'jarvis', text, ts: Date.now() });
    if (ttsEnabled && !opts?.skipTts) speak(text);
  }, [addMessage, ttsEnabled]);

  /** Trigger background greeting on first open */
  useEffect(() => {
    if (greeted) return;
    setGreeted(true);
    chrome.runtime.sendMessage({ action: 'brief' }, (resp) => {
      if (chrome.runtime.lastError || !resp?.success) return;
      const greeting = resp.message as string;
      addMessage({ role: 'jarvis', text: greeting, ts: Date.now() });
      // speak greeting if voices are ready — wait a tick for voice list
      setTimeout(() => {
        if (ttsEnabled) speak(greeting);
      }, 800);
    });
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  /** Listen for proactive background messages (_timerDone, _tabChanged, _agentComplete) */
  useEffect(() => {
    const listener = (msg: Record<string, unknown>) => {
      if (msg.action === '_timerDone') {
        const label = (msg.label as string) || 'Timer';
        const alert = '⏱ "' + label + '" complete, sir. Your timer has finished.';
        addMessage({ role: 'jarvis', text: alert, ts: Date.now() });
        speak(alert);
      } else if (msg.action === '_tabChanged') {
        const title = (msg.title as string) || 'Unknown';
        const context = (msg.context as string) || '';
        const note = '🌐 Active page: "' + title + '".' + (context ? '\n' + context : '');
        addMessage({ role: 'jarvis', text: note, ts: Date.now() });
      } else if (msg.action === '_agentComplete') {
        const agent = msg.agent as { name: string; mission: string; status: string; steps: { status: string }[] };
        if (!agent) return;
        const done = agent.steps.filter(s => s.status === 'done').length;
        const announcement = agent.status === 'complete'
          ? '🤖 ' + agent.name + ' has completed its mission, sir.\n\n"' + agent.mission.substring(0, 80) + '"\n\n' + done + '/' + agent.steps.length + ' sources extracted. Full report available in the 🤖 Agents tab.'
          : '🤖 ' + agent.name + ' — status: ' + agent.status + '. Check the Agents tab, sir.';
        addMessage({ role: 'jarvis', text: announcement, ts: Date.now() });
        if (ttsEnabled) speak(agent.name + ' mission complete, sir.');
      }
    };
    chrome.runtime.onMessage.addListener(listener);
    return () => { chrome.runtime.onMessage.removeListener(listener); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [addMessage, ttsEnabled]);

  const sendMessage = (text: string) => {
    if (!text.trim()) return;
    // Special quick actions
    if (text === '__brief__') {
      chrome.runtime.sendMessage({ action: 'brief' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        deliverResponse(resp.message as string);
      });
      return;
    }
    if (text === '__listtimers__') {
      chrome.runtime.sendMessage({ action: 'listTimers' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        deliverResponse(resp.message as string);
      });
      return;
    }
    if (text === '__listagents__') {
      chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
        if (chrome.runtime.lastError || !resp?.success) return;
        const agents: Array<{ name: string; status: string; mission: string; currentStep: number; steps: unknown[] }> = resp?.agents || [];
        if (agents.length === 0) {
          deliverResponse('🤖 No agents deployed, sir. Click "🤖 Research agent" or say "deploy agent: research [topic]" to send one out.');
          return;
        }
        const icon: Record<string, string> = { running: '🟢', complete: '✅', recalled: '⚡', failed: '❌', queued: '⏳' };
        const lines = agents.map(a => (icon[a.status] || '○') + ' ' + a.name + (a.status === 'running' ? ' [' + (a.currentStep + 1) + '/' + a.steps.length + ']' : '') + ' — ' + a.mission.substring(0, 60)).join('\n');
        deliverResponse('🤖 Sovereign Agents, sir:\n\n' + lines + '\n\nCheck the 🤖 Agents tab for full reports and controls.');
      });
      return;
    }
    if (text === '__agent_research__') {
      addMessage({ role: 'jarvis', text: '🤖 What topic shall I research, sir? Type your topic and I\'ll dispatch an agent immediately.', ts: Date.now() });
      setInput('deploy agent: research ');
      return;
    }

    const userMsg = { role: 'user' as const, text: text.trim(), ts: Date.now() };
    addMessage(userMsg);
    setInput('');
    setTyping(true);

    chrome.runtime.sendMessage({ action: 'chat', text: text.trim() }, (resp) => {
      setTyping(false);
      if (chrome.runtime.lastError) {
        deliverResponse('[Error: ' + chrome.runtime.lastError.message + ']', { skipTts: true });
        return;
      }
      const reply: string = resp?.message || resp?.data?.message || 'No response.';
      deliverResponse(reply);
    });
  };

  const handleQuickAction = (qa: typeof QUICK_ACTIONS[number]) => {
    if (qa.prefill || qa.text.endsWith(': ') || qa.text.endsWith(' ')) { setInput(qa.text); return; }
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

  const toggleTts = () => {
    const next = !ttsEnabled;
    setTtsEnabled(next);
    if (!next) window.speechSynthesis?.cancel();
  };

  const toggleMic = () => {
    const SpeechRec = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRec) {
      addMessage({ role: 'jarvis', text: 'Speech recognition not available in this browser, sir.', ts: Date.now() });
      return;
    }
    if (micListening) { setMicListening(false); return; }
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
          onClick={toggleTts}
          title={ttsEnabled ? 'Voice output ON — click to mute' : 'Voice output OFF — click to enable'}
          className={`text-xs px-2 py-0.5 rounded transition-colors flex-shrink-0 ${
            ttsEnabled
              ? 'bg-cyan-800 text-cyan-200 border border-cyan-600'
              : 'bg-gray-800 text-gray-500 hover:text-gray-300'
          }`}
        >
          {ttsEnabled ? '🔊' : '🔇'}
        </button>
        <button
          onClick={handleClearChat}
          title="Clear chat"
          className="text-xs px-2 py-0.5 bg-gray-800 hover:bg-red-900/60 rounded text-gray-500 hover:text-red-400 transition-colors ml-0.5 flex-shrink-0"
        >
          🗑
        </button>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-2 py-2 space-y-2">
        {messages.length === 0 && (
          <div className="text-center text-gray-600 text-xs mt-8 space-y-1">
            <div className="text-cyan-600 text-lg">⚡</div>
            <div>JARVIS standing by</div>
            <div className="text-gray-700">Use "Brief me" for a situational report</div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div
            key={i}
            className={`animate-fade-in flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            {msg.role === 'jarvis' && (
              <button
                onClick={() => speak(msg.text)}
                title="Speak"
                className="self-end mb-1 mr-1 text-xs text-gray-700 hover:text-cyan-400 transition-colors flex-shrink-0"
              >
                🔊
              </button>
            )}
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
              <div className="flex gap-1 items-center">
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                <span className="ml-1 text-xs text-gray-600">Processing…</span>
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
          placeholder="Speak your command, sir…"
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

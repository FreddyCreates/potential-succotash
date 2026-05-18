import React, { useState, useEffect, useRef } from 'react';

/* ── Vigil terminal activity stream ─────────────────────────────────────────── */
const BOOT_LINES = [
  '> Initializing virtual environment…',
  '> Vigil AI v15 — virtual desktop online',
  '> Loading browser context…',
  '> Scanning active tabs…',
  '> Reading page DOM structure…',
  '> Extracting visible text and headings…',
  '> Analyzing content clusters…',
  '> Running pattern synthesis…',
  '> Cross-referencing memory vault…',
  '> Delegating to research agent…',
  '> Agent dispatched → researcher-1 active',
  '> Crawling linked resources…',
  '> Compiling findings…',
  '> Synthesis complete. Ready for next task.',
  '> Awaiting your instruction, sir.',
];

/* ── Control categories that Vigil can execute ───────────────────────────────── */
const CONTROL_SECTIONS = [
  {
    label: 'Tab Control',
    icon: '🗂️',
    commands: [
      { label: 'List all tabs',         action: 'listTabs' },
      { label: 'Open new tab',          action: 'openTab',      prompt: 'URL to open:' },
      { label: 'Close active tab',      action: 'closeTab' },
      { label: 'Switch to tab',         action: 'switchTab',    prompt: 'Tab number or title:' },
      { label: 'Reload tab',            action: 'reloadTab' },
      { label: 'Duplicate tab',         action: 'duplicateTab' },
      { label: 'Pin / unpin tab',       action: 'pinTab' },
      { label: 'Mute / unmute tab',     action: 'muteTab' },
    ],
  },
  {
    label: 'Navigation',
    icon: '🧭',
    commands: [
      { label: 'Go to URL',             action: 'navigate',     prompt: 'URL:' },
      { label: 'Web search',            action: 'webSearch',    prompt: 'Search query:' },
      { label: 'Go back',               action: 'navBack' },
      { label: 'Go forward',            action: 'navForward' },
      { label: 'Scroll down',           action: 'scrollDown' },
      { label: 'Scroll up',             action: 'scrollUp' },
      { label: 'Scroll to top',         action: 'scrollTop' },
      { label: 'Scroll to bottom',      action: 'scrollBottom' },
    ],
  },
  {
    label: 'Page Reading',
    icon: '📖',
    commands: [
      { label: 'Extract page text',     action: 'readPage' },
      { label: 'Extract headings',      action: 'readHeadings' },
      { label: 'Extract all links',     action: 'readLinks' },
      { label: 'Extract page metadata', action: 'readMeta' },
      { label: 'Summarize page',        action: 'summarizePage' },
      { label: 'Screenshot tab',        action: 'captureTab' },
    ],
  },
  {
    label: 'AI Engines',
    icon: '⚗️',
    commands: [
      { label: 'Fuse reason (multi-model)', action: 'fuseReason',    prompt: 'Question / problem:' },
      { label: 'Generate code',            action: 'codeGen',        prompt: 'Describe what to build:' },
      { label: 'Translate text',           action: 'translate',      prompt: 'Text and target language:' },
      { label: 'Research topic',           action: 'researchTopic',  prompt: 'Topic to research:' },
      { label: 'Encrypt text',             action: 'encryptText',    prompt: 'Text to encrypt:' },
      { label: 'Decrypt text',             action: 'decryptText',    prompt: 'Paste encrypted text:' },
      { label: 'Recall memory',            action: 'recallMemory',   prompt: 'Memory keyword:' },
    ],
  },
  {
    label: 'Legal AI',
    icon: '⚖️',
    commands: [
      { label: 'Case analysis',            action: 'legalCase',      prompt: 'Describe the case:' },
      { label: 'Contract review',          action: 'legalContract',  prompt: 'Paste contract text:' },
      { label: 'Compliance check',         action: 'legalCompliance', prompt: 'Industry + question:' },
      { label: 'Draft legal document',     action: 'legalDraft',     prompt: 'Document type + context:' },
    ],
  },
  {
    label: 'Documents',
    icon: '📄',
    commands: [
      { label: 'Create editable document', action: 'createDoc',    prompt: 'Document title:' },
      { label: 'Export as PDF',            action: 'exportPdf',    prompt: 'Document title:' },
      { label: 'Export as Markdown',       action: 'exportMarkdown' },
      { label: 'Export as Excel',          action: 'exportExcel',  prompt: 'Sheet name:' },
    ],
  },
  {
    label: 'System',
    icon: '🔧',
    commands: [
      { label: 'Health status',            action: 'healthStatus' },
      { label: 'Engine inventory',         action: 'engineInventory' },
      { label: 'List agents',              action: 'listAgents' },
      { label: 'Help — what can Vigil do', action: 'help' },
    ],
  },
  // ── NEW SECTIONS ─────────────────────────────────────────────
  {
    label: 'Screen Search',
    icon: '🔎',
    commands: [
      { label: 'Find text on page',        action: 'findTextOnPage',    prompt: 'Text to find:' },
      { label: 'Save screenshot + text',   action: 'saveScreenCapture' },
      { label: 'Search saved captures',    action: 'searchCaptures',    prompt: 'Search keyword:' },
      { label: 'List recent captures',     action: 'listCaptures' },
      { label: 'Capture stats',            action: 'captureStats' },
      { label: 'Export capture index',     action: 'exportCaptureIndex' },
      { label: 'Highlight all text',       action: 'extractPageText' },
      { label: 'Find links matching…',     action: 'findLinks',         prompt: 'Keyword in link text or URL:' },
    ],
  },
  {
    label: 'Legal Research',
    icon: '⚖️',
    commands: [
      { label: 'Case analysis',            action: 'legalCase',         prompt: 'Describe the case:' },
      { label: 'Contract review',          action: 'legalContract',     prompt: 'Paste contract text:' },
      { label: 'Compliance check',         action: 'legalCompliance',   prompt: 'Industry + question:' },
      { label: 'Draft legal document',     action: 'legalDraft',        prompt: 'Document type + context:' },
      { label: 'Analyze contract clauses', action: 'contractAnalyze',   prompt: 'Paste contract text:' },
      { label: 'Scan Terms of Service',    action: 'tosAnalyze',        prompt: 'Paste ToS text:' },
      { label: 'Rights briefing',          action: 'legalRights',       prompt: 'Area (consumer/employment/privacy/criminal):' },
      { label: 'Search case law',          action: 'caseLawSearch',     prompt: 'Search query:' },
      { label: 'Statute lookup',           action: 'statuteLookup',     prompt: 'Bill or statute keywords:' },
      { label: 'Legal template',           action: 'legalTemplate',     prompt: 'Type (NDA/Demand Letter/Lease):' },
      { label: 'GDPR checklist',           action: 'gdprCheck' },
      { label: 'Small business legal',     action: 'smallBizLegal' },
    ],
  },
  {
    label: 'Academic Research',
    icon: '🎓',
    commands: [
      { label: 'Search ArXiv papers',      action: 'arxivSearch',       prompt: 'Research query:' },
      { label: 'Search PubMed',            action: 'pubmedSearch',      prompt: 'Medical/biomedical query:' },
      { label: 'Search OpenAlex',          action: 'openalexSearch',    prompt: 'Research topic:' },
      { label: 'Generate citation',        action: 'generateCitation',  prompt: 'Title, Author, Year, Journal:' },
      { label: 'Generate hypothesis',      action: 'generateHypothesis', prompt: 'Research topic:' },
      { label: 'Refine research question', action: 'refineQuestion',    prompt: 'Rough research question:' },
      { label: 'Evaluate methodology',     action: 'evalMethodology',   prompt: 'Describe your methodology:' },
      { label: 'Statistics explainer',     action: 'explainStats',      prompt: 'Concept (p-value/CI/ANOVA/power):' },
      { label: 'Peer review simulator',    action: 'peerReview',        prompt: 'Paste your abstract:' },
    ],
  },
  {
    label: 'Open Data',
    icon: '🌐',
    commands: [
      { label: 'Wikipedia lookup',         action: 'wikipedia',         prompt: 'Article title or topic:' },
      { label: 'Wikidata entity lookup',   action: 'wikidata',          prompt: 'Entity to look up:' },
      { label: 'World Bank data',          action: 'worldbank',         prompt: 'Country code + indicator (e.g. US gdp):' },
      { label: 'Weather forecast',         action: 'weather',           prompt: 'Lat,Lon (e.g. 40.7,-74.0):' },
      { label: 'Earthquake feed',          action: 'earthquakes',       prompt: 'Period (hour/day/week):' },
      { label: 'NASA Astronomy today',     action: 'nasaApod' },
      { label: 'Country information',      action: 'countryInfo',       prompt: 'Country name:' },
      { label: 'Book search',              action: 'searchBooks',       prompt: 'Book title or topic:' },
      { label: 'Currency exchange rates',  action: 'exchangeRates',     prompt: 'Base currency (USD):' },
      { label: 'Dictionary lookup',        action: 'lookupWord',        prompt: 'Word to define:' },
      { label: 'SEC EDGAR search',         action: 'edgarSearch',       prompt: 'Company name:' },
      { label: 'GitHub repo stats',        action: 'githubStats',       prompt: 'owner/repo:' },
    ],
  },
  {
    label: 'Medical Research',
    icon: '🏥',
    commands: [
      { label: 'Drug / medication info',   action: 'drugInfo',          prompt: 'Drug name:' },
      { label: 'PubMed medical search',    action: 'pubmedSearch',      prompt: 'Medical condition or treatment:' },
      { label: 'Medical research topic',   action: 'medicalResearch',   prompt: 'Medical topic:' },
      { label: 'Symptom research',         action: 'symptomResearch',   prompt: 'Symptoms to research (not a diagnosis):' },
      { label: 'Drug interaction info',    action: 'drugInteraction',   prompt: 'Medications to check:' },
      { label: 'Clinical trials link',     action: 'clinicalTrials',    prompt: 'Condition or intervention:' },
    ],
  },
  {
    label: 'AGI Reasoning',
    icon: '🧠',
    commands: [
      { label: 'Chain of thought',         action: 'chainOfThought',       prompt: 'Problem or question:' },
      { label: "Devil's advocate",         action: 'devilsAdvocate',       prompt: 'Position or belief:' },
      { label: 'Fallacy detector',         action: 'detectFallacies',      prompt: 'Argument or text:' },
      { label: 'Bias detector',            action: 'detectBias',           prompt: 'Text or argument:' },
      { label: 'Argument mapper',          action: 'mapArgument',          prompt: 'Topic or claim:' },
      { label: 'SWOT analysis',            action: 'swotAnalysis',         prompt: 'Subject:' },
      { label: '5-Whys root cause',        action: 'fiveWhys',             prompt: 'Problem statement:' },
      { label: 'Pre-mortem analysis',      action: 'preMortem',            prompt: 'Plan or project:' },
      { label: 'Assumption audit',         action: 'auditAssumptions',     prompt: 'Plan or idea:' },
      { label: 'Second-order effects',     action: 'secondOrderEffects',   prompt: 'Action or decision:' },
      { label: 'Mental model library',     action: 'listMentalModels' },
      { label: 'Explain mental model',     action: 'getMentalModel',       prompt: 'Model name (first principles/inversion/pareto…):' },
      { label: 'Socratic questioning',     action: 'socraticQuestioning',  prompt: 'Belief or claim:' },
      { label: 'Priority matrix',          action: 'eisenhowerMatrix',     prompt: 'Tasks (one per line):' },
      { label: 'First principles',         action: 'firstPrinciples',      prompt: 'Problem or challenge:' },
      { label: 'Inversion thinking',       action: 'inversionThinking',    prompt: 'Goal or plan:' },
    ],
  },
  {
    label: 'Writing & Language',
    icon: '✍️',
    commands: [
      { label: 'Translate text',           action: 'translate',            prompt: 'Text + target language:' },
      { label: 'Rewrite / improve',        action: 'rewriteText',          prompt: 'Text to improve:' },
      { label: 'Summarize page',           action: 'summarizePage' },
      { label: 'Sentiment analysis',       action: 'sentimentAnalysis',    prompt: 'Text to analyze:' },
      { label: 'Tone analysis',            action: 'toneAnalysis',         prompt: 'Text to analyze:' },
      { label: 'Generate headline',        action: 'generateHeadline',     prompt: 'Topic or article text:' },
      { label: 'Dictionary lookup',        action: 'lookupWord',           prompt: 'Word to define:' },
      { label: 'Brainstorm ideas',         action: 'brainstorm',           prompt: 'Topic to brainstorm:' },
    ],
  },
  {
    label: 'Security & Privacy',
    icon: '🛡️',
    commands: [
      { label: 'GDPR compliance check',    action: 'gdprCheck' },
      { label: 'Privacy rights briefing',  action: 'legalRights',          prompt: 'Area (privacy/gdpr/ccpa):' },
      { label: 'Scan ToS for red flags',   action: 'tosAnalyze',           prompt: 'Paste Terms of Service:' },
      { label: 'Encrypt text',             action: 'encryptText',          prompt: 'Text to encrypt:' },
      { label: 'Decrypt text',             action: 'decryptText',          prompt: 'Paste encrypted text:' },
      { label: 'Sentry threat scan',       action: 'sentryAnalyze' },
      { label: 'Permission audit',         action: 'permissionAudit' },
      { label: 'Security report',          action: 'securityReport' },
    ],
  },
];

/* ── Component ─────────────────────────────────────────────────────────────── */

export default function ScreenPanel() {
  const [screenshot, setScreenshot]           = useState<string | null>(null);
  const [title, setTitle]                     = useState('');
  const [loading, setLoading]                 = useState(false);
  const [status, setStatus]                   = useState('');
  const [recording, setRecording]             = useState(false);
  const [virtualDesktop, setVirtualDesktop]   = useState(false);
  const [activityLines, setActivityLines]     = useState<string[]>([]);
  const [controlMode, setControlMode]         = useState(false);
  const [openSection, setOpenSection]         = useState<string | null>('Tab Control');
  const [cmdResult, setCmdResult]             = useState<string | null>(null);
  const [promptLabel, setPromptLabel]         = useState<string | null>(null);
  const [promptAction, setPromptAction]       = useState<string | null>(null);
  const [promptValue, setPromptValue]         = useState('');
  const activityRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (activityRef.current) activityRef.current.scrollTop = activityRef.current.scrollHeight;
  }, [activityLines]);

  /* ── Capture ── */
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

  /* ── Recording ── */
  const toggleRecord = () => {
    if (recording) {
      setRecording(false);
      setStatus('⏹ Recording stopped');
    } else {
      setRecording(true);
      setStatus('⏺ Recording screen…');
    }
  };

  /* ── Virtual Desktop ── */
  const launchVirtualDesktop = () => {
    if (virtualDesktop) {
      setVirtualDesktop(false);
      setActivityLines([]);
      setStatus('🖥️ Virtual desktop closed');
      return;
    }
    setVirtualDesktop(true);
    setActivityLines([]);
    setStatus('🖥️ Vigil virtual desktop — online');
    BOOT_LINES.forEach((line, i) => {
      setTimeout(() => setActivityLines(prev => [...prev, line]), i * 600);
    });
  };

  /* ── Control Mode command dispatch ── */
  const runCommand = (action: string, value?: string) => {
    setCmdResult(null);
    setStatus('⚡ Running: ' + action + (value ? ' — ' + value.substring(0, 40) : '') + '…');
    chrome.runtime.sendMessage({ action, value: value || '' }, (resp) => {
      if (chrome.runtime.lastError) {
        const err = '❌ ' + chrome.runtime.lastError.message;
        setStatus(err);
        setCmdResult(err);
        return;
      }
      const msg = resp?.message || resp?.data?.message || JSON.stringify(resp);
      setStatus('✅ Done');
      setCmdResult(msg);
      // Also stream it into the activity log
      setActivityLines(prev => [...prev, '> [' + action + '] ' + String(msg).substring(0, 120)]);
    });
  };

  const handleCommand = (action: string, prompt?: string) => {
    if (prompt) {
      setPromptAction(action);
      setPromptLabel(prompt);
      setPromptValue('');
      return;
    }
    runCommand(action);
  };

  const submitPrompt = () => {
    if (!promptAction) return;
    runCommand(promptAction, promptValue);
    setPromptAction(null);
    setPromptLabel(null);
    setPromptValue('');
  };

  /* ── Render ── */
  return (
    <div className="flex flex-col h-full text-gray-100 text-xs" style={{ background: '#0d0b08' }}>

      {/* ── Toolbar ── */}
      <div className="flex flex-wrap gap-1.5 px-3 py-2 border-b flex-shrink-0" style={{ background: '#13100a', borderColor: '#2d2010' }}>
        <button
          onClick={capture}
          disabled={loading}
          className="flex-1 py-1.5 rounded text-white text-xs transition-colors"
          style={{ background: loading ? '#333' : '#7a5c10', minWidth: 80 }}
        >
          {loading ? 'Capturing…' : '📸 Capture'}
        </button>
        {screenshot && (
          <button
            onClick={download}
            className="flex-1 py-1.5 rounded text-gray-200 text-xs transition-colors"
            style={{ background: '#1e1a10', border: '1px solid #2d2010', minWidth: 60 }}
          >
            ⬇ Save
          </button>
        )}
        <button
          onClick={toggleRecord}
          className={`flex-1 py-1.5 rounded text-xs transition-colors ${recording ? 'animate-pulse' : ''}`}
          style={{ background: recording ? '#7a1010' : '#1e1a10', border: '1px solid #2d2010', color: recording ? '#fff' : '#ccc', minWidth: 80 }}
        >
          {recording ? '⏹ Stop Rec' : '⏺ Record'}
        </button>
        <button
          onClick={launchVirtualDesktop}
          className="flex-1 py-1.5 rounded text-xs transition-colors"
          style={{ background: virtualDesktop ? '#7a5c10' : '#1e1a10', border: '1px solid #2d2010', color: virtualDesktop ? '#fff' : '#ccc', minWidth: 80 }}
        >
          {virtualDesktop ? '✕ Close Desktop' : '🖥️ Watch Vigil'}
        </button>
        <button
          onClick={() => setControlMode(m => !m)}
          className="flex-1 py-1.5 rounded text-xs transition-colors"
          style={{ background: controlMode ? 'rgba(212,160,23,0.25)' : '#1e1a10', border: controlMode ? '1px solid #d4a017' : '1px solid #2d2010', color: controlMode ? '#d4a017' : '#aaa', minWidth: 80 }}
        >
          {controlMode ? '✕ Control' : '🎮 Control Mode'}
        </button>
      </div>

      {/* ── Status bar ── */}
      {status && (
        <div className="px-3 py-1 text-xs border-b flex-shrink-0" style={{ color: '#d4a017', borderColor: '#2d2010', background: '#13100a' }}>
          {status}
        </div>
      )}

      {/* ── Prompt input (for commands that need a parameter) ── */}
      {promptLabel && (
        <div className="flex items-center gap-2 px-3 py-2 border-b flex-shrink-0" style={{ background: '#13100a', borderColor: '#2d2010' }}>
          <span className="text-gray-400 flex-shrink-0">{promptLabel}</span>
          <input
            autoFocus
            type="text"
            value={promptValue}
            onChange={e => setPromptValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') submitPrompt(); if (e.key === 'Escape') { setPromptAction(null); setPromptLabel(null); } }}
            className="flex-1 px-2 py-1 rounded text-xs text-gray-100 outline-none"
            style={{ background: '#1e1a10', border: '1px solid #2d2010' }}
          />
          <button onClick={submitPrompt} className="px-3 py-1 rounded text-xs" style={{ background: '#7a5c10', color: '#fff' }}>Run ➤</button>
          <button onClick={() => { setPromptAction(null); setPromptLabel(null); }} className="text-gray-600 hover:text-gray-400 text-xs">✕</button>
        </div>
      )}

      {/* ── Command result ── */}
      {cmdResult && !promptLabel && (
        <div className="mx-3 mt-2 p-2 rounded border flex-shrink-0 max-h-28 overflow-y-auto" style={{ background: '#0d0b08', borderColor: '#2d2010', color: '#a88030', fontFamily: 'monospace', fontSize: 10 }}>
          {cmdResult}
        </div>
      )}

      {/* ── Virtual Desktop terminal ── */}
      {virtualDesktop && (
        <div className="mx-3 mt-2 rounded-lg border overflow-hidden flex-shrink-0" style={{ borderColor: '#3d3010' }}>
          <div className="flex items-center gap-1.5 px-3 py-1.5 border-b" style={{ background: '#13100a', borderColor: '#2d2010' }}>
            <span className="w-2 h-2 rounded-full bg-red-500/80" />
            <span className="w-2 h-2 rounded-full bg-yellow-500/80" />
            <span className="w-2 h-2 rounded-full bg-green-500/80" />
            <span className="ml-2 text-[10px] font-mono" style={{ color: '#7a5c10' }}>vigil@virtual-desktop:~</span>
          </div>
          <div
            ref={activityRef}
            className="p-3 font-mono space-y-0.5 max-h-40 overflow-y-auto"
            style={{ background: '#060400', fontSize: 10, color: '#d4a017' }}
          >
            {activityLines.map((line, i) => (
              <div key={i} className={i === activityLines.length - 1 ? 'animate-pulse' : ''}>
                {line}
                {i === activityLines.length - 1 && (
                  <span className="inline-block w-1.5 h-3 ml-0.5 animate-ping" style={{ background: '#d4a017' }} />
                )}
              </div>
            ))}
            {activityLines.length === 0 && (
              <span style={{ color: '#7a5c10' }}>Booting virtual desktop…<span className="animate-ping">▋</span></span>
            )}
          </div>
        </div>
      )}

      {/* ── Vigil Control Mode ── */}
      {controlMode && (
        <div className="flex-1 overflow-y-auto px-3 py-2 space-y-2">
          <p className="text-gray-500 text-[10px] leading-relaxed pb-1">
            🎮 <span style={{ color: '#d4a017' }}>Vigil Control Mode</span> — Select a category and tap a command. Vigil executes it on your active tab. You can leave him with a full job and he will go do it.
          </p>
          {CONTROL_SECTIONS.map(section => (
            <div key={section.label} className="rounded-lg border overflow-hidden" style={{ borderColor: '#2d2010' }}>
              <button
                className="w-full flex items-center justify-between px-3 py-2 text-left transition-colors"
                style={{ background: openSection === section.label ? 'rgba(212,160,23,0.10)' : '#13100a', color: openSection === section.label ? '#d4a017' : '#aaa' }}
                onClick={() => setOpenSection(s => s === section.label ? null : section.label)}
              >
                <span className="font-semibold text-[11px]">{section.icon} {section.label}</span>
                <span className="text-[10px] text-gray-600">{openSection === section.label ? '▲' : '▼'}</span>
              </button>
              {openSection === section.label && (
                <div className="px-3 py-2 space-y-1.5" style={{ background: '#0d0b08' }}>
                  {section.commands.map(cmd => (
                    <button
                      key={cmd.label}
                      onClick={() => handleCommand(cmd.action, (cmd as any).prompt)}
                      className="w-full text-left px-3 py-1.5 rounded text-[11px] transition-colors"
                      style={{ background: '#13100a', border: '1px solid #2d2010', color: '#ccc' }}
                    >
                      {cmd.label}
                      {(cmd as any).prompt && <span className="ml-1 text-[9px] text-gray-600">(requires input)</span>}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* ── Screenshot view (when not in control mode or virtual desktop) ── */}
      {!controlMode && (
        <div className="flex-1 overflow-y-auto p-2">
          {screenshot ? (
            <div>
              {title && <p className="text-xs text-gray-500 mb-2 truncate">{title}</p>}
              <img
                src={screenshot}
                alt="Screenshot"
                className="w-full rounded border shadow-lg"
                style={{ borderColor: '#2d2010' }}
              />
            </div>
          ) : !virtualDesktop && (
            <div className="text-center text-gray-600 text-xs mt-8 space-y-2">
              <div>📸 <span style={{ color: '#d4a017' }}>Capture</span> — snapshot the active tab</div>
              <div>⏺ <span style={{ color: '#d4a017' }}>Record</span> — record your screen session</div>
              <div>🖥️ <span style={{ color: '#d4a017' }}>Watch Vigil</span> — live terminal view of Vigil working</div>
              <div>🎮 <span style={{ color: '#d4a017' }}>Control Mode</span> — give Vigil full computer access</div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}


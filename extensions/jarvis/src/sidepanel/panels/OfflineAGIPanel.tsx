import React, { useState } from 'react';

const send = (action: string, extra: Record<string, unknown> = {}): Promise<{ success: boolean; message?: string }> =>
  chrome.runtime.sendMessage({ action, ...extra });

type AGITool = {
  id: string;
  label: string;
  icon: string;
  prompt?: string;
  desc: string;
};

const AGI_SECTIONS: Array<{ section: string; icon: string; tools: AGITool[] }> = [
  {
    section: 'Reasoning',
    icon: '🧠',
    tools: [
      { id: 'chainOfThought',      label: 'Chain of Thought',     icon: '🔗', prompt: 'Problem or question:',      desc: 'Decompose any problem into step-by-step reasoning' },
      { id: 'devilsAdvocate',      label: "Devil's Advocate",     icon: '😈', prompt: 'Position or belief:',       desc: 'Generate strongest counterarguments to any position' },
      { id: 'firstPrinciples',     label: 'First Principles',     icon: '🧱', prompt: 'Problem or challenge:',     desc: 'Break down to fundamental truths, rebuild from base' },
      { id: 'inversionThinking',   label: 'Inversion Thinking',   icon: '🔄', prompt: 'Goal or plan:',             desc: 'Think backwards — what guarantees failure?' },
      { id: 'socraticQuestioning', label: 'Socratic Questioning', icon: '🏛️', prompt: 'Belief or claim to examine:', desc: '6 rounds of deep Socratic inquiry' },
      { id: 'secondOrderEffects',  label: 'Second-Order Effects', icon: '🌊', prompt: 'Action or decision:',       desc: 'Map 1st/2nd/3rd order consequences' },
    ],
  },
  {
    section: 'Analysis',
    icon: '🔍',
    tools: [
      { id: 'detectFallacies',     label: 'Fallacy Detector',     icon: '⚠️', prompt: 'Argument or text:',         desc: 'Detect 10+ logical fallacies (ad hominem, straw man, etc.)' },
      { id: 'detectBias',          label: 'Bias Detector',        icon: '🔍', prompt: 'Text or argument:',         desc: 'Detect 8 cognitive biases (confirmation, anchoring, etc.)' },
      { id: 'mapArgument',         label: 'Argument Mapper',      icon: '🗺️', prompt: 'Topic or claim:',           desc: 'Map premises, objections, rebuttals, and argument structure' },
      { id: 'auditAssumptions',    label: 'Assumption Auditor',   icon: '🔎', prompt: 'Plan, idea, or proposal:',  desc: 'Surface hidden assumptions across 5 categories' },
      { id: 'preMortem',           label: 'Pre-Mortem Analysis',  icon: '⚰️', prompt: 'Plan or project:',          desc: 'Imagine failure — what went wrong? Build countermeasures.' },
      { id: 'swotAnalysis',        label: 'SWOT Analysis',        icon: '📊', prompt: 'Subject (company/project/idea):', desc: 'Strengths, Weaknesses, Opportunities, Threats' },
    ],
  },
  {
    section: 'Planning',
    icon: '📋',
    tools: [
      { id: 'fiveWhys',            label: '5-Whys Root Cause',    icon: '🔍', prompt: 'Problem statement:',        desc: 'Drill to root cause with the 5-Whys method' },
      { id: 'eisenhowerMatrix',    label: 'Priority Matrix',      icon: '📋', prompt: 'Tasks (one per line):',     desc: 'Classify tasks by urgency and importance (Eisenhower)' },
      { id: 'generateHypothesis',  label: 'Hypothesis Generator', icon: '🔬', prompt: 'Research topic:',           desc: 'Generate testable hypotheses and research questions' },
      { id: 'refineQuestion',      label: 'Question Refiner',     icon: '🎯', prompt: 'Rough research question:',  desc: 'Sharpen research questions using PICO and more' },
    ],
  },
  {
    section: 'Mental Models',
    icon: '📚',
    tools: [
      { id: 'listMentalModels',    label: 'List All Models',      icon: '📚', desc: 'Show the 10-model offline library' },
      { id: 'getMentalModel',      label: 'Explain a Model',      icon: '🧠', prompt: 'Model name (e.g. first principles, inversion, pareto):',  desc: 'Deep explanation + application guide for any mental model' },
    ],
  },
  {
    section: 'AGI Synthesis',
    icon: '⚗️',
    tools: [
      { id: 'agiSummarize',        label: 'Summarize URL',        icon: '📄', prompt: 'URL to summarize:',         desc: 'Fetch and summarize any public URL' },
      { id: 'agiScout',            label: 'Deep Scout URL',       icon: '🔭', prompt: 'URL to scout:',             desc: 'Deep page scan — links, structure, entities' },
      { id: 'agiForgeReport',      label: 'Forge Knowledge',      icon: '⚗️', desc: 'Compile all agent reports into unified knowledge' },
      { id: 'fuseReason',          label: 'Fuse Reason',          icon: '🔮', prompt: 'Question or problem:',      desc: 'Multi-model reasoning fusion' },
      { id: 'evalMethodology',     label: 'Methodology Eval',     icon: '🔬', prompt: 'Describe methodology:',     desc: 'Score methodology on 8 research quality criteria' },
      { id: 'explainStats',        label: 'Statistics Explainer', icon: '📊', prompt: 'Concept (p-value/CI/power/regression):', desc: 'Plain-English statistics reference' },
    ],
  },
];

export default function OfflineAGIPanel() {
  const [openSection, setOpenSection] = useState<string>('Reasoning');
  const [promptTool, setPromptTool]   = useState<AGITool | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [result, setResult] = useState<{ label: string; output: string; loading: boolean; error?: string } | null>(null);

  const runTool = async (tool: AGITool, value?: string) => {
    const v = (value ?? '').trim();
    setResult({ label: tool.label, output: '', loading: true });
    setPromptTool(null);
    setPromptValue('');

    const action = tool.id;
    let extra: Record<string, unknown> = { value: v };

    if (action === 'chainOfThought')       extra = { problem: v };
    if (action === 'devilsAdvocate')       extra = { position: v };
    if (action === 'firstPrinciples')      extra = { problem: v };
    if (action === 'inversionThinking')    extra = { plan: v };
    if (action === 'socraticQuestioning')  extra = { belief: v };
    if (action === 'secondOrderEffects')   extra = { action2: v };
    if (action === 'detectFallacies')      extra = { text: v };
    if (action === 'detectBias')           extra = { text: v };
    if (action === 'mapArgument')          extra = { topic: v };
    if (action === 'auditAssumptions')     extra = { plan: v };
    if (action === 'preMortem')            extra = { plan: v };
    if (action === 'swotAnalysis')         extra = { subject: v };
    if (action === 'fiveWhys')             extra = { problem: v };
    if (action === 'eisenhowerMatrix')     extra = { tasks: v.split('\n').map(t => t.trim()).filter(Boolean) };
    if (action === 'generateHypothesis')   extra = { topic: v };
    if (action === 'refineQuestion')       extra = { question: v };
    if (action === 'listMentalModels')     extra = {};
    if (action === 'getMentalModel')       extra = { name: v };
    if (action === 'agiSummarize')         extra = { url: v };
    if (action === 'agiScout')             extra = { url: v };
    if (action === 'agiForgeReport')       extra = {};
    if (action === 'fuseReason')           extra = { value: v };
    if (action === 'evalMethodology')      extra = { description: v };
    if (action === 'explainStats')         extra = { concept: v };

    const r = await send(action, extra);
    setResult({ label: tool.label, output: r.message ?? '(no result)', loading: false, error: r.success ? undefined : r.message });
  };

  const handleToolClick = (tool: AGITool) => {
    if (!tool.prompt) { runTool(tool); return; }
    setPromptTool(tool);
    setPromptValue('');
  };

  const copyResult = () => { if (result?.output) navigator.clipboard.writeText(result.output).catch(() => {}); };
  const downloadResult = () => {
    if (!result?.output) return;
    const blob = new Blob([result.output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vigil-agi-' + Date.now() + '.txt';
    a.click();
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace', color: '#c8d8e8', background: '#080610' }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 6px', background: '#060410', borderBottom: '1px solid #1a1030' }}>
        <div style={{ color: '#a78bfa', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>🧠 OFFLINE AGI ENGINE</div>
        <div style={{ color: '#6b5fa8', fontSize: 10 }}>Reasoning · Analysis · Planning · Mental Models — 100% offline</div>
      </div>

      {/* Prompt input */}
      {promptTool && (
        <div style={{ padding: '8px 12px', background: '#0a0818', borderBottom: '1px solid #1a1030' }}>
          <div style={{ fontSize: 10, color: '#a78bfa', marginBottom: 2 }}>{promptTool.icon} {promptTool.label}</div>
          <div style={{ fontSize: 9, color: '#6b5fa8', marginBottom: 6 }}>{promptTool.desc}</div>
          <textarea
            autoFocus
            value={promptValue}
            onChange={e => setPromptValue(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runTool(promptTool, promptValue); } if (e.key === 'Escape') setPromptTool(null); }}
            placeholder={promptTool.prompt}
            rows={3}
            style={{ width: '100%', background: 'rgba(167,139,250,0.06)', border: '1px solid rgba(167,139,250,0.2)', borderRadius: 6, color: '#c8d8e8', fontSize: 10, padding: '6px 8px', resize: 'vertical', fontFamily: 'monospace', boxSizing: 'border-box' }}
          />
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button onClick={() => runTool(promptTool, promptValue)} style={{ background: 'rgba(167,139,250,0.15)', border: '1px solid rgba(167,139,250,0.3)', color: '#a78bfa', borderRadius: 6, padding: '5px 14px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>Run ➤</button>
            <button onClick={() => setPromptTool(null)} style={{ background: 'transparent', border: '1px solid #2a1a3a', color: '#6b5fa8', borderRadius: 6, padding: '5px 10px', fontSize: 10, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tool sections */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '6px 8px' }}>
        {AGI_SECTIONS.map(sec => (
          <div key={sec.section} style={{ marginBottom: 6, border: '1px solid #1a1030', borderRadius: 8, overflow: 'hidden' }}>
            <button
              onClick={() => setOpenSection(s => s === sec.section ? '' : sec.section)}
              style={{ width: '100%', display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '7px 12px', background: openSection === sec.section ? 'rgba(167,139,250,0.12)' : '#0c0a14', border: 'none', color: openSection === sec.section ? '#a78bfa' : '#8870c4', cursor: 'pointer', fontSize: 11, fontWeight: 700, fontFamily: 'monospace' }}
            >
              <span>{sec.icon} {sec.section}</span>
              <span style={{ fontSize: 10 }}>{openSection === sec.section ? '▲' : '▼'} {sec.tools.length}</span>
            </button>
            {openSection === sec.section && (
              <div style={{ padding: '6px 8px', background: '#080610', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 5 }}>
                {sec.tools.map(tool => (
                  <button
                    key={tool.id + tool.label}
                    onClick={() => handleToolClick(tool)}
                    style={{ display: 'flex', flexDirection: 'column', padding: '7px 9px', background: 'rgba(167,139,250,0.05)', border: '1px solid rgba(167,139,250,0.15)', borderRadius: 7, cursor: 'pointer', textAlign: 'left', color: '#c8d8e8' }}
                  >
                    <span style={{ fontSize: 10, fontWeight: 700, color: '#a78bfa', marginBottom: 2 }}>{tool.icon} {tool.label}</span>
                    <span style={{ fontSize: 9, color: '#6b5fa8', lineHeight: 1.3 }}>{tool.desc}</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Result */}
      {result && (
        <div style={{ borderTop: '1px solid #1a1030', padding: '8px 10px', maxHeight: '40%', overflowY: 'auto', background: '#060410' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: '#a78bfa', fontSize: 10, fontWeight: 700 }}>{result.label}</span>
            {!result.loading && result.output && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={copyResult} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, color: '#a78bfa', cursor: 'pointer' }}>📋 Copy</button>
                <button onClick={downloadResult} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(167,139,250,0.12)', border: '1px solid rgba(167,139,250,0.25)', borderRadius: 4, color: '#a78bfa', cursor: 'pointer' }}>⬇ Save</button>
                <button onClick={() => setResult(null)} style={{ fontSize: 9, padding: '2px 7px', background: 'transparent', border: '1px solid #2a1a3a', borderRadius: 4, color: '#6b5fa8', cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>
          {result.loading ? (
            <div style={{ color: '#a78bfa', fontSize: 11 }}>⏳ Processing…</div>
          ) : (
            <pre style={{ color: result.error ? '#ff6b6b' : '#c8d8e8', fontSize: 10, whiteSpace: 'pre-wrap', wordBreak: 'break-word', margin: 0, lineHeight: 1.5 }}>
              {result.output}
            </pre>
          )}
        </div>
      )}
    </div>
  );
}

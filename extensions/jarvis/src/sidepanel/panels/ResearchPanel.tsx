import React, { useState } from 'react';

type ResearchTab = 'legal' | 'academic' | 'data' | 'medical';

const send = (action: string, extra: Record<string, unknown> = {}): Promise<{ success: boolean; message?: string }> =>
  chrome.runtime.sendMessage({ action, ...extra });

const LEGAL_TOOLS = [
  { id: 'contractAnalyze',  label: '📄 Analyze Contract',     icon: '📄', prompt: 'Paste contract text:',        desc: 'Scan for risk clauses, indemnification, auto-renewal, IP traps' },
  { id: 'tosAnalyze',       label: '🔍 Scan Terms of Service', icon: '🔍', prompt: 'Paste ToS text:',             desc: 'Find data selling, arbitration waivers, biometric collection' },
  { id: 'legalRights',      label: '⚖️ Rights Briefing',       icon: '⚖️', prompt: 'Topic (consumer/employment/privacy/criminal/immigration/family/realestate/copyright):',   desc: 'Offline legal rights knowledge base — 12 areas' },
  { id: 'caseLawSearch',    label: '⚖️ Case Law Search',       icon: '🏛️', prompt: 'Search query:',               desc: 'Search CourtListener public case law database' },
  { id: 'statuteLookup',    label: '📜 Statute Lookup',        icon: '📜', prompt: 'Bill/statute keywords:',      desc: 'Search US Congress.gov bills and statutes' },
  { id: 'legalTemplate',    label: '📝 Legal Template',        icon: '📝', prompt: 'Template type (NDA/Demand Letter/Lease):',   desc: 'Generate legal document templates' },
  { id: 'gdprCheck',        label: '🇪🇺 GDPR Checklist',       icon: '🇪🇺', prompt: '',                           desc: 'GDPR compliance checklist for organizations' },
  { id: 'smallBizLegal',    label: '🏢 Small Business Legal',  icon: '🏢', prompt: '',                           desc: 'Formation, IP, contracts, compliance checklist' },
  { id: 'legalCase',        label: '🎯 Case Analysis',         icon: '🎯', prompt: 'Describe the case:',          desc: 'AI case analysis and strategy' },
  { id: 'legalContract',    label: '✍️ Contract Review',       icon: '✍️', prompt: 'Paste contract text:',        desc: 'AI contract review and recommendations' },
  { id: 'legalCompliance',  label: '✅ Compliance Check',      icon: '✅', prompt: 'Industry + question:',        desc: 'Regulatory compliance analysis' },
  { id: 'legalDraft',       label: '📃 Draft Document',        icon: '📃', prompt: 'Document type + context:',   desc: 'AI legal document drafting' },
];

const ACADEMIC_TOOLS = [
  { id: 'arxivSearch',      label: '📚 ArXiv Search',          icon: '📚', prompt: 'Search query:',               desc: 'Search physics, CS, math, bio, econ preprints' },
  { id: 'pubmedSearch',     label: '🏥 PubMed Search',         icon: '🏥', prompt: 'Medical/biomedical query:',   desc: 'Search MEDLINE biomedical literature' },
  { id: 'openalexSearch',   label: '🎓 OpenAlex Search',       icon: '🎓', prompt: 'Research topic:',             desc: 'Search 250M+ scholarly works across all fields' },
  { id: 'generateCitation', label: '📌 Generate Citation',     icon: '📌', prompt: 'Title, Author, Year, Journal (comma-separated):',  desc: 'APA, MLA, Chicago, IEEE, Harvard citation' },
  { id: 'generateHypothesis', label: '🔬 Generate Hypothesis', icon: '🔬', prompt: 'Research topic:',             desc: 'Generate testable hypotheses and research questions' },
  { id: 'refineQuestion',   label: '🎯 Refine Research Question', icon: '🎯', prompt: 'Rough research question:', desc: 'Sharpen your research question using PICO and other frameworks' },
  { id: 'evalMethodology',  label: '🔭 Evaluate Methodology',  icon: '🔭', prompt: 'Describe your methodology:',  desc: 'Score methodology on 8 quality criteria' },
  { id: 'explainStats',     label: '📊 Statistics Explainer',  icon: '📊', prompt: 'Statistical concept (p-value/CI/effect size/ANOVA/power):',  desc: 'Plain-English statistics guide' },
  { id: 'peerReview',       label: '🔍 Peer Review Simulator', icon: '🔍', prompt: 'Paste your abstract:',        desc: 'Score abstract on 7 academic quality criteria' },
  { id: 'researchTopic',    label: '🔎 Research Topic',        icon: '🔎', prompt: 'Topic to research:',          desc: 'Comprehensive AI research on any topic' },
];

const DATA_TOOLS = [
  { id: 'wikipedia',        label: '📖 Wikipedia',             icon: '📖', prompt: 'Article title or topic:',     desc: 'Fetch Wikipedia summary and full article link' },
  { id: 'wikidata',         label: '🌐 Wikidata',              icon: '🌐', prompt: 'Entity to look up:',          desc: 'Wikidata entity IDs, labels, descriptions' },
  { id: 'worldbank',        label: '🏦 World Bank Data',       icon: '🏦', prompt: 'Country code + indicator (e.g. US gdp):',  desc: 'GDP, population, literacy, unemployment, CO2' },
  { id: 'weather',          label: '🌤️ Weather Forecast',      icon: '🌤️', prompt: 'Latitude,Longitude (e.g. 40.7,-74.0):',   desc: 'Open-Meteo 3-day forecast — no API key' },
  { id: 'earthquakes',      label: '🌍 Earthquakes',           icon: '🌍', prompt: 'Period (hour/day/week):',      desc: 'USGS earthquake feed (M4.5+)' },
  { id: 'nasaApod',         label: '🔭 NASA Astronomy',        icon: '🔭', prompt: '',                           desc: 'NASA Astronomy Picture of the Day' },
  { id: 'drugInfo',         label: '💊 Drug Information',      icon: '💊', prompt: 'Drug name:',                  desc: 'FDA drug label — purpose, dosage, warnings' },
  { id: 'countryInfo',      label: '🗺️ Country Info',          icon: '🗺️', prompt: 'Country name:',               desc: 'Capital, population, languages, currencies, borders' },
  { id: 'searchBooks',      label: '📚 Book Search',           icon: '📚', prompt: 'Book title or topic:',        desc: 'Open Library book database' },
  { id: 'exchangeRates',    label: '💱 Exchange Rates',        icon: '💱', prompt: 'Base currency (e.g. USD):',   desc: 'Live exchange rates for major currencies' },
  { id: 'lookupWord',       label: '📖 Dictionary',            icon: '📖', prompt: 'Word to define:',             desc: 'Free Dictionary API — definitions, phonetics, synonyms' },
  { id: 'edgarSearch',      label: '📊 SEC EDGAR',             icon: '📊', prompt: 'Company name:',               desc: 'SEC company filings (10-K, 10-Q, 8-K)' },
  { id: 'githubStats',      label: '🐙 GitHub Repo Stats',     icon: '🐙', prompt: 'owner/repo (e.g. torvalds/linux):',  desc: 'Stars, forks, language, license, topics' },
];

const MEDICAL_TOOLS = [
  { id: 'drugInfo',         label: '💊 Drug Lookup',           icon: '💊', prompt: 'Drug/medication name:',       desc: 'FDA drug label — purpose, dosage, warnings. Not medical advice.' },
  { id: 'pubmedSearch',     label: '🏥 Medical Literature',    icon: '🏥', prompt: 'Medical condition or treatment:', desc: 'Search PubMed biomedical literature' },
  { id: 'medicalResearch',  label: '🔬 Medical Research',      icon: '🔬', prompt: 'Medical topic:',              desc: 'AI-assisted medical research overview' },
  { id: 'symptomResearch',  label: '🩺 Symptom Research',      icon: '🩺', prompt: 'Symptoms to research:',       desc: 'Research symptoms — not a diagnosis. See a doctor.' },
  { id: 'drugInteraction',  label: '⚠️ Drug Interaction Info', icon: '⚠️', prompt: 'Medications to check:',       desc: 'General drug interaction research. Not medical advice.' },
  { id: 'clinicalTrials',   label: '🧪 Clinical Trials',       icon: '🧪', prompt: 'Condition or intervention:',  desc: 'Link to ClinicalTrials.gov for active trials' },
];

type Tool = typeof LEGAL_TOOLS[0];

export default function ResearchPanel() {
  const [activeTab, setActiveTab] = useState<ResearchTab>('legal');
  const [promptTool, setPromptTool] = useState<Tool | null>(null);
  const [promptValue, setPromptValue] = useState('');
  const [citationStyle, setCitationStyle] = useState('APA');
  const [result, setResult] = useState<{ tool: string; output: string; loading: boolean; error?: string } | null>(null);

  const tools: Tool[] = activeTab === 'legal' ? LEGAL_TOOLS : activeTab === 'academic' ? ACADEMIC_TOOLS : activeTab === 'data' ? DATA_TOOLS : MEDICAL_TOOLS;

  const runTool = async (tool: Tool, value?: string) => {
    const v = value?.trim() ?? '';
    setResult({ tool: tool.label, output: '', loading: true });
    setPromptTool(null);
    setPromptValue('');

    const action = tool.id;
    let extra: Record<string, unknown> = { value: v };

    // special routing
    if (action === 'arxivSearch')       extra = { query: v };
    if (action === 'pubmedSearch')      extra = { query: v };
    if (action === 'openalexSearch')    extra = { query: v };
    if (action === 'generateCitation')  extra = { value: v, style: citationStyle };
    if (action === 'generateHypothesis') extra = { topic: v };
    if (action === 'refineQuestion')    extra = { question: v };
    if (action === 'evalMethodology')   extra = { description: v };
    if (action === 'explainStats')      extra = { concept: v };
    if (action === 'peerReview')        extra = { abstract: v };
    if (action === 'wikipedia')         extra = { query: v };
    if (action === 'wikidata')          extra = { query: v };
    if (action === 'worldbank') {
      const parts = v.split(/\s+/);
      extra = { countryCode: parts[0] ?? 'US', indicator: parts.slice(1).join('_') || 'gdp' };
    }
    if (action === 'weather') {
      const [lat, lon] = v.split(',').map(Number);
      // Parse user-supplied lat/lon; fall back to New York City (40.7°N, 74.0°W) if not provided
      extra = { lat: lat || 40.7, lon: lon || -74.0 };
    }
    if (action === 'earthquakes')       extra = { period: v || 'day' };
    if (action === 'nasaApod')          extra = {};
    if (action === 'drugInfo' || action === 'lookupWord') extra = { query: v };
    if (action === 'countryInfo')       extra = { country: v };
    if (action === 'searchBooks')       extra = { query: v };
    if (action === 'exchangeRates')     extra = { base: v || 'USD' };
    if (action === 'edgarSearch')       extra = { company: v };
    if (action === 'githubStats') {
      const [owner, repo] = v.split('/');
      extra = { owner: owner?.trim() ?? '', repo: repo?.trim() ?? '' };
    }
    if (action === 'contractAnalyze')   extra = { text: v };
    if (action === 'tosAnalyze')        extra = { text: v };
    if (action === 'legalRights')       extra = { topic: v };
    if (action === 'caseLawSearch')     extra = { query: v };
    if (action === 'statuteLookup')     extra = { query: v };
    if (action === 'legalTemplate')     extra = { type: v };
    if (action === 'gdprCheck')         extra = {};
    if (action === 'smallBizLegal')     extra = {};
    if (action === 'medicalResearch' || action === 'symptomResearch' || action === 'drugInteraction') {
      extra = { value: v };
    }
    if (action === 'clinicalTrials') {
      const r = await Promise.resolve({ success: true, message: `🧪 Clinical Trials for "${v}":\n\nhttps://clinicaltrials.gov/search?term=${encodeURIComponent(v)}\n\nVisit the link above to search active clinical trials. ClinicalTrials.gov is the official US NIH registry.` });
      setResult({ tool: tool.label, output: r.message ?? '', loading: false });
      return;
    }

    const r = await send(action, extra);
    setResult({ tool: tool.label, output: r.message ?? '(no result)', loading: false, error: r.success ? undefined : r.message });
  };

  const handleToolClick = (tool: Tool) => {
    if (!tool.prompt) { runTool(tool); return; }
    setPromptTool(tool);
    setPromptValue('');
  };

  const copyResult = () => {
    if (result?.output) navigator.clipboard.writeText(result.output).catch(() => {});
  };
  const downloadResult = () => {
    if (!result?.output) return;
    const blob = new Blob([result.output], { type: 'text/plain' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = 'vigil-research-' + Date.now() + '.txt';
    a.click();
  };

  const tabStyle = (t: ResearchTab): React.CSSProperties => ({
    flex: 1, padding: '6px 4px', fontSize: 10, fontWeight: 700, fontFamily: 'monospace',
    background: activeTab === t ? 'rgba(0,212,255,0.15)' : 'rgba(0,0,0,0.2)',
    border: 'none', borderBottom: activeTab === t ? '2px solid #00d4ff' : '2px solid transparent',
    color: activeTab === t ? '#00d4ff' : '#7b9ab8', cursor: 'pointer', transition: 'all 0.15s',
  });

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100%', fontFamily: 'monospace', color: '#c8d8e8', background: '#0d0b08' }}>
      {/* Header */}
      <div style={{ padding: '10px 12px 6px', background: '#0a0806', borderBottom: '1px solid #1a1a2e' }}>
        <div style={{ color: '#00d4ff', fontSize: 13, fontWeight: 700, letterSpacing: 1 }}>🔬 RESEARCH HUB</div>
        <div style={{ color: '#7b9ab8', fontSize: 10 }}>Legal · Academic · Data · Medical — offline-first</div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid #1a1a2e' }}>
        <button style={tabStyle('legal')}    onClick={() => setActiveTab('legal')}>⚖️ LEGAL</button>
        <button style={tabStyle('academic')} onClick={() => setActiveTab('academic')}>🎓 ACADEMIC</button>
        <button style={tabStyle('data')}     onClick={() => setActiveTab('data')}>🌐 DATA</button>
        <button style={tabStyle('medical')}  onClick={() => setActiveTab('medical')}>🏥 MEDICAL</button>
      </div>

      {/* Citation style (academic only) */}
      {activeTab === 'academic' && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 12px', background: '#0a0806', borderBottom: '1px solid #1a1a2e', fontSize: 10, color: '#7b9ab8' }}>
          <span>Citation style:</span>
          {['APA', 'MLA', 'Chicago', 'IEEE', 'Harvard'].map(s => (
            <button key={s} onClick={() => setCitationStyle(s)} style={{ fontSize: 9, padding: '2px 6px', background: citationStyle === s ? 'rgba(0,212,255,0.2)' : 'transparent', border: `1px solid ${citationStyle === s ? '#00d4ff' : '#2a3a4a'}`, borderRadius: 4, color: citationStyle === s ? '#00d4ff' : '#7b9ab8', cursor: 'pointer' }}>{s}</button>
          ))}
        </div>
      )}

      {/* Prompt input */}
      {promptTool && (
        <div style={{ padding: '8px 12px', background: '#0c0a07', borderBottom: '1px solid #1a1a2e' }}>
          <div style={{ fontSize: 10, color: '#00d4ff', marginBottom: 4 }}>{promptTool.label}</div>
          <div style={{ color: '#7b9ab8', fontSize: 9, marginBottom: 6 }}>{promptTool.desc}</div>
          <div style={{ display: 'flex', gap: 6 }}>
            <textarea
              autoFocus
              value={promptValue}
              onChange={e => setPromptValue(e.target.value)}
              onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); runTool(promptTool, promptValue); } if (e.key === 'Escape') setPromptTool(null); }}
              placeholder={promptTool.prompt}
              rows={3}
              style={{ flex: 1, background: 'rgba(0,212,255,0.05)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 6, color: '#c8d8e8', fontSize: 10, padding: '6px 8px', resize: 'vertical', fontFamily: 'monospace' }}
            />
          </div>
          <div style={{ display: 'flex', gap: 6, marginTop: 6 }}>
            <button onClick={() => runTool(promptTool, promptValue)} style={{ background: 'rgba(0,212,255,0.15)', border: '1px solid rgba(0,212,255,0.3)', color: '#00d4ff', borderRadius: 6, padding: '5px 14px', fontSize: 10, cursor: 'pointer', fontWeight: 700 }}>Run ➤</button>
            <button onClick={() => setPromptTool(null)} style={{ background: 'transparent', border: '1px solid #2a3a4a', color: '#7b9ab8', borderRadius: 6, padding: '5px 10px', fontSize: 10, cursor: 'pointer' }}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tool grid */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '8px 10px' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
          {tools.map(tool => (
            <button
              key={tool.id + tool.label}
              onClick={() => handleToolClick(tool)}
              style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', padding: '8px 10px', background: 'rgba(0,212,255,0.04)', border: '1px solid rgba(0,212,255,0.12)', borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all 0.15s', color: '#c8d8e8' }}
            >
              <span style={{ fontSize: 11, fontWeight: 700, color: '#00d4ff', marginBottom: 2 }}>{tool.icon} {tool.label.replace(/^[^\s]+\s/, '')}</span>
              <span style={{ fontSize: 9, color: '#7b9ab8', lineHeight: 1.3 }}>{tool.desc}</span>
            </button>
          ))}
        </div>

        {/* Medical disclaimer */}
        {activeTab === 'medical' && (
          <div style={{ marginTop: 10, padding: 8, background: 'rgba(255,100,100,0.06)', border: '1px solid rgba(255,100,100,0.2)', borderRadius: 6, fontSize: 9, color: '#ff8888' }}>
            ⚕️ Research tools only. Not a substitute for professional medical advice, diagnosis, or treatment. Always consult a licensed healthcare provider.
          </div>
        )}

        {/* Legal disclaimer */}
        {activeTab === 'legal' && (
          <div style={{ marginTop: 10, padding: 8, background: 'rgba(255,200,0,0.04)', border: '1px solid rgba(255,200,0,0.15)', borderRadius: 6, fontSize: 9, color: '#ffcc44' }}>
            ⚖️ Legal information only. Not legal advice. For any legal matter, consult a licensed attorney in your jurisdiction.
          </div>
        )}
      </div>

      {/* Result area */}
      {result && (
        <div style={{ borderTop: '1px solid #1a1a2e', padding: '8px 10px', maxHeight: '35%', overflowY: 'auto', background: '#080608' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
            <span style={{ color: '#00d4ff', fontSize: 10, fontWeight: 700 }}>{result.tool}</span>
            {!result.loading && result.output && (
              <div style={{ display: 'flex', gap: 4 }}>
                <button onClick={copyResult} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, color: '#00d4ff', cursor: 'pointer' }}>📋 Copy</button>
                <button onClick={downloadResult} style={{ fontSize: 9, padding: '2px 7px', background: 'rgba(0,212,255,0.1)', border: '1px solid rgba(0,212,255,0.2)', borderRadius: 4, color: '#00d4ff', cursor: 'pointer' }}>⬇ Save</button>
                <button onClick={() => setResult(null)} style={{ fontSize: 9, padding: '2px 7px', background: 'transparent', border: '1px solid #2a3a4a', borderRadius: 4, color: '#7b9ab8', cursor: 'pointer' }}>✕</button>
              </div>
            )}
          </div>
          {result.loading ? (
            <div style={{ color: '#00d4ff', fontSize: 11 }}>⏳ Running…</div>
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

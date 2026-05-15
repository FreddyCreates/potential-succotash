import React, { useEffect, useState } from 'react';

const send = (action: string, extra: Record<string, unknown> = {}): Promise<{ success: boolean; message?: string; data?: Record<string, unknown> }> =>
  chrome.runtime.sendMessage({ action, ...extra });

const MODELS = [
  '@cf/meta/llama-3.1-8b-instruct',
  '@cf/meta/llama-3.2-3b-instruct',
  '@cf/mistral/mistral-7b-instruct-v0.2',
  '@cf/google/gemma-2b-it-lora',
  '@cf/qwen/qwen1.5-7b-chat-awq',
];

export default function CloudflarePanel() {
  const [accountId, setAccountId] = useState('');
  const [apiToken, setApiToken] = useState('');
  const [model, setModel] = useState(MODELS[0]);
  const [prompt, setPrompt] = useState('');
  const [status, setStatus] = useState('');
  const [output, setOutput] = useState('');
  const [loading, setLoading] = useState(false);
  const [maskedToken, setMaskedToken] = useState('');

  useEffect(() => {
    send('cloudflareGetConfig').then(r => {
      const d = (r.data || {}) as { accountId?: string; model?: string; maskedToken?: string };
      setAccountId(d.accountId || '');
      setModel(d.model || MODELS[0]);
      setMaskedToken(d.maskedToken || '');
    }).catch(() => {});
  }, []);

  const saveConfig = async () => {
    setLoading(true);
    const r = await send('cloudflareSetConfig', { accountId, apiToken, model });
    setLoading(false);
    if (!r.success) { setStatus('❌ ' + (r.message || 'Save failed')); return; }
    const d = (r.data || {}) as { maskedToken?: string };
    setMaskedToken(d.maskedToken || '');
    setApiToken('');
    setStatus('✅ Cloudflare config saved locally.');
  };

  const testConnection = async () => {
    setLoading(true);
    const r = await send('cloudflareTestConnection');
    setLoading(false);
    setStatus(r.success ? '✅ Connection OK' : '❌ Connection failed');
    setOutput(r.message || '');
  };

  const runPrompt = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const r = await send('cloudflareRunPrompt', { prompt, model });
    setLoading(false);
    setStatus(r.success ? '✅ Inference complete' : '❌ Inference failed');
    setOutput(r.message || '');
  };

  const summarizeActivePage = async () => {
    setLoading(true);
    const r = await send('cloudflareSummarizePage');
    setLoading(false);
    setStatus(r.success ? '✅ Page summarized' : '❌ Page summary failed');
    setOutput(r.message || '');
  };

  const researchBrief = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    const r = await send('cloudflareResearchBrief', { topic: prompt });
    setLoading(false);
    setStatus(r.success ? '✅ Research brief generated' : '❌ Research brief failed');
    setOutput(r.message || '');
  };

  return (
    <div style={{ padding: 12, color: '#c8d8e8', fontFamily: 'monospace' }}>
      <div style={{ color: '#00d4ff', fontWeight: 700, fontSize: 13, marginBottom: 4 }}>☁️ CLOUDFLARE AI</div>
      <div style={{ color: '#7b9ab8', fontSize: 10, marginBottom: 10 }}>
        Configure Workers AI once, then run prompts/summaries/research.
      </div>

      <div style={card}>
        <div style={label}>Account ID</div>
        <input value={accountId} onChange={e => setAccountId(e.target.value)} placeholder="Cloudflare account ID" style={input} />
        <div style={label}>API Token (stored locally, never committed)</div>
        <input value={apiToken} onChange={e => setApiToken(e.target.value)} placeholder={maskedToken ? `Current: ${maskedToken} (enter new token to replace)` : 'cfut_...'} style={input} />
        <div style={label}>Model</div>
        <select value={model} onChange={e => setModel(e.target.value)} style={input}>
          {MODELS.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
        <button onClick={saveConfig} disabled={loading} style={btn}>{loading ? 'Saving…' : 'Save Cloudflare Config'}</button>
      </div>

      <div style={card}>
        <div style={label}>Prompt / Topic</div>
        <textarea value={prompt} onChange={e => setPrompt(e.target.value)} rows={5} placeholder="Write a short paper outline on..." style={{ ...input, minHeight: 90, resize: 'vertical' }} />
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
          <button onClick={testConnection} disabled={loading} style={btn}>Test Connection</button>
          <button onClick={runPrompt} disabled={loading || !prompt.trim()} style={btn}>Run Prompt</button>
          <button onClick={summarizeActivePage} disabled={loading} style={btn}>Summarize Active Page</button>
          <button onClick={researchBrief} disabled={loading || !prompt.trim()} style={btn}>Generate Research Brief</button>
        </div>
      </div>

      {status && <div style={{ marginTop: 8, color: '#d4a017', fontSize: 11 }}>{status}</div>}
      {output && (
        <pre style={{ marginTop: 8, padding: 10, borderRadius: 8, background: 'rgba(0,0,0,0.28)', border: '1px solid rgba(0,212,255,0.15)', whiteSpace: 'pre-wrap', wordBreak: 'break-word', fontSize: 10, maxHeight: 280, overflowY: 'auto' }}>
          {output}
        </pre>
      )}
    </div>
  );
}

const card: React.CSSProperties = {
  background: 'rgba(255,255,255,0.02)',
  border: '1px solid rgba(0,212,255,0.12)',
  borderRadius: 10,
  padding: 10,
  marginBottom: 10,
};

const label: React.CSSProperties = {
  color: '#00d4ff',
  fontSize: 10,
  marginBottom: 4,
};

const input: React.CSSProperties = {
  width: '100%',
  boxSizing: 'border-box',
  marginBottom: 8,
  background: 'rgba(0,212,255,0.06)',
  border: '1px solid rgba(0,212,255,0.22)',
  borderRadius: 6,
  color: '#c8d8e8',
  padding: '6px 8px',
  fontSize: 11,
  fontFamily: 'monospace',
};

const btn: React.CSSProperties = {
  background: 'linear-gradient(135deg, rgba(0,212,255,0.15), rgba(0,150,200,0.2))',
  border: '1px solid rgba(0,212,255,0.32)',
  color: '#00d4ff',
  borderRadius: 6,
  padding: '6px 10px',
  fontSize: 10,
  fontWeight: 700,
  cursor: 'pointer',
  fontFamily: 'monospace',
};


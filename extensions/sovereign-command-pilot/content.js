/* Sovereign Command Pilot — Interface Layer (EXT-027) */

(function () {
  'use strict';

  const PANEL_ID = 'sovereign-command-pilot-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    const container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      left: '20px',
      width: '360px',
      background: '#0f172a',
      color: '#e2e8f0',
      border: '1px solid #334155',
      borderRadius: '12px',
      zIndex: '2147483647',
      boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
      fontFamily: 'Inter, Segoe UI, sans-serif',
      overflow: 'hidden',
    });

    const header = document.createElement('div');
    header.textContent = '�� Sovereign Command Pilot';
    Object.assign(header.style, {
      padding: '10px 12px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1e293b, #334155)',
    });

    const body = document.createElement('div');
    body.style.padding = '10px 12px 12px';

    const input = document.createElement('textarea');
    input.placeholder = 'Describe the production task...';
    Object.assign(input.style, {
      width: '100%',
      height: '80px',
      boxSizing: 'border-box',
      borderRadius: '8px',
      border: '1px solid #475569',
      background: '#111827',
      color: '#e2e8f0',
      padding: '8px',
      resize: 'vertical',
    });

    const button = document.createElement('button');
    button.textContent = 'Generate Execution Plan';
    Object.assign(button.style, {
      marginTop: '8px',
      width: '100%',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 10px',
      background: '#2563eb',
      color: '#fff',
      fontWeight: '600',
      cursor: 'pointer',
    });

    const output = document.createElement('pre');
    Object.assign(output.style, {
      marginTop: '8px',
      maxHeight: '220px',
      overflow: 'auto',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#020617',
      padding: '8px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      display: 'none',
    });

    button.addEventListener('click', () => {
      const prompt = input.value.trim();
      if (!prompt) {
        output.style.display = 'block';
        output.textContent = 'Please describe a production task first.';
        return;
      }

      output.style.display = 'block';
      output.textContent = 'Building plan...';

      chrome.runtime.sendMessage({ action: 'createExecutionPlan', prompt }, (resp) => {
        if (chrome.runtime.lastError) {
          output.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        output.textContent = JSON.stringify(resp, null, 2);
      });
    });

    body.appendChild(input);
    body.appendChild(button);
    body.appendChild(output);

    container.appendChild(header);
    container.appendChild(body);
    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();

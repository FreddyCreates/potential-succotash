/* CI Pilot Embodied — Interface Layer (EXT-028) */

(function () {
  'use strict';

  const PANEL_ID = 'ci-pilot-embodied-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    const container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed',
      bottom: '20px',
      right: '20px',
      width: '370px',
      background: '#111827',
      color: '#e5e7eb',
      border: '1px solid #374151',
      borderRadius: '12px',
      zIndex: '2147483647',
      boxShadow: '0 10px 24px rgba(0,0,0,0.35)',
      fontFamily: 'Inter, Segoe UI, sans-serif',
      overflow: 'hidden',
    });

    const header = document.createElement('div');
    header.textContent = 'CI Pilot Embodied';
    Object.assign(header.style, {
      padding: '10px 12px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1d4ed8, #1e40af)',
    });

    const body = document.createElement('div');
    body.style.padding = '10px 12px 12px';

    const input = document.createElement('textarea');
    input.placeholder = 'Paste failing CI context, logs, or incident notes...';
    Object.assign(input.style, {
      width: '100%',
      height: '88px',
      boxSizing: 'border-box',
      borderRadius: '8px',
      border: '1px solid #4b5563',
      background: '#0b1220',
      color: '#e5e7eb',
      padding: '8px',
      resize: 'vertical',
    });

    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '8px', marginTop: '8px' });

    const analyze = document.createElement('button');
    analyze.textContent = 'Embody CI Pilot';
    Object.assign(analyze.style, {
      flex: '1',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 10px',
      background: '#2563eb',
      color: '#fff',
      fontWeight: '600',
      cursor: 'pointer',
    });

    const pulse = document.createElement('button');
    pulse.textContent = 'Pipeline Pulse';
    Object.assign(pulse.style, {
      flex: '1',
      border: 'none',
      borderRadius: '8px',
      padding: '8px 10px',
      background: '#334155',
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
      border: '1px solid #374151',
      background: '#030712',
      padding: '8px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      display: 'none',
    });

    analyze.addEventListener('click', () => {
      const text = input.value.trim();
      output.style.display = 'block';
      output.textContent = 'Running CI embodiment...';
      chrome.runtime.sendMessage({ action: 'embodyCIPilot', input: text }, (resp) => {
        if (chrome.runtime.lastError) {
          output.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        output.textContent = JSON.stringify(resp, null, 2);
      });
    });

    pulse.addEventListener('click', () => {
      const text = input.value.trim();
      output.style.display = 'block';
      output.textContent = 'Reading pipeline pulse...';
      chrome.runtime.sendMessage({ action: 'getPipelinePulse', context: text }, (resp) => {
        if (chrome.runtime.lastError) {
          output.textContent = 'Error: ' + chrome.runtime.lastError.message;
          return;
        }
        output.textContent = JSON.stringify(resp, null, 2);
      });
    });

    row.appendChild(analyze);
    row.appendChild(pulse);

    body.appendChild(input);
    body.appendChild(row);
    body.appendChild(output);

    container.appendChild(header);
    container.appendChild(body);
    return container;
  }

  if (typeof document !== 'undefined' && document.body) {
    document.body.appendChild(buildPanel());
  }
})();

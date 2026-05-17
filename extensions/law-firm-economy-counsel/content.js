/* Law Firm Economy Counsel — Interface Layer (EXT-029) */

(function () {
  'use strict';

  const PANEL_ID = 'law-firm-economy-counsel-panel';
  if (typeof document !== 'undefined' && document.getElementById(PANEL_ID)) return;

  function buildPanel() {
    if (typeof document === 'undefined') return null;

    const container = document.createElement('div');
    container.id = PANEL_ID;
    Object.assign(container.style, {
      position: 'fixed',
      top: '20px',
      right: '20px',
      width: '390px',
      background: '#0f172a',
      color: '#e2e8f0',
      border: '1px solid #334155',
      borderRadius: '12px',
      zIndex: '2147483647',
      boxShadow: '0 12px 28px rgba(0,0,0,0.36)',
      fontFamily: 'Inter, Segoe UI, sans-serif',
      overflow: 'hidden'
    });

    const header = document.createElement('div');
    header.textContent = 'Law Firm Economy Counsel';
    Object.assign(header.style, {
      padding: '10px 12px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #1e3a8a, #1d4ed8)'
    });

    const body = document.createElement('div');
    body.style.padding = '10px 12px 12px';

    const input = document.createElement('textarea');
    input.placeholder = 'Paste matter details, legal context, deadlines, billing concerns...';
    Object.assign(input.style, {
      width: '100%',
      height: '95px',
      borderRadius: '8px',
      border: '1px solid #475569',
      background: '#020617',
      color: '#e2e8f0',
      padding: '8px',
      resize: 'vertical',
      boxSizing: 'border-box'
    });

    const row = document.createElement('div');
    Object.assign(row.style, { display: 'flex', gap: '8px', marginTop: '8px', flexWrap: 'wrap' });

    const makeBtn = (label, bg) => {
      const btn = document.createElement('button');
      btn.textContent = label;
      Object.assign(btn.style, {
        flex: '1 1 120px',
        border: 'none',
        borderRadius: '8px',
        padding: '8px 10px',
        background: bg,
        color: '#fff',
        fontWeight: '600',
        cursor: 'pointer'
      });
      return btn;
    };

    const analyzeBtn = makeBtn('Analyze Matter', '#2563eb');
    const workflowBtn = makeBtn('Workflow', '#334155');
    const economyBtn = makeBtn('Economy', '#475569');

    const output = document.createElement('pre');
    Object.assign(output.style, {
      marginTop: '8px',
      maxHeight: '240px',
      overflow: 'auto',
      borderRadius: '8px',
      border: '1px solid #334155',
      background: '#020617',
      padding: '8px',
      whiteSpace: 'pre-wrap',
      wordBreak: 'break-word',
      display: 'none'
    });

    const render = (payload) => {
      output.style.display = 'block';
      output.textContent = typeof payload === 'string' ? payload : JSON.stringify(payload, null, 2);
    };

    analyzeBtn.addEventListener('click', () => {
      render('Analyzing legal matter...');
      chrome.runtime.sendMessage({ action: 'analyzeMatter', input: input.value.trim() }, (resp) => {
        if (chrome.runtime.lastError) return render('Error: ' + chrome.runtime.lastError.message);
        render(resp);
      });
    });

    workflowBtn.addEventListener('click', () => {
      const source = input.value.toLowerCase();
      const type = source.includes('litig') ? 'litigation' : source.includes('compliance') ? 'compliance' : source.includes('billing') ? 'billing' : source.includes('contract') ? 'contract' : 'intake';
      render('Building law-firm workflow...');
      chrome.runtime.sendMessage({ action: 'buildFirmWorkflow', workflowType: type }, (resp) => {
        if (chrome.runtime.lastError) return render('Error: ' + chrome.runtime.lastError.message);
        render(resp);
      });
    });

    economyBtn.addEventListener('click', () => {
      render('Estimating legal-economy signals...');
      chrome.runtime.sendMessage({ action: 'estimateEconomy', input: input.value.trim() }, (resp) => {
        if (chrome.runtime.lastError) return render('Error: ' + chrome.runtime.lastError.message);
        render(resp);
      });
    });

    row.appendChild(analyzeBtn);
    row.appendChild(workflowBtn);
    row.appendChild(economyBtn);

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

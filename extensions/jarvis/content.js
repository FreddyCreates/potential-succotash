/* Jarvis AI — Content Script (EXT-027)
 *
 * Floating JARVIS panel on every page. Shows the Phantom AI thinking
 * indicator while Jarvis reasons, then displays the structured response.
 */

(function () {
  'use strict';

  var PANEL_ID = 'jarvis-ai-panel';
  if (document.getElementById(PANEL_ID)) return;

  /* ── Build Panel DOM ─────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '380px',
    maxHeight: '560px',
    backgroundColor: '#0a0a1a',
    color: '#e0e0e0',
    border: '1px solid #6c63ff',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(108,99,255,0.4)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    zIndex: '2147483647',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column'
  });

  /* ── Header ──────────────────────────────────────────────── */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #6c63ff, #3f3d9e)',
    cursor: 'grab',
    userSelect: 'none'
  });

  var titleWrap = document.createElement('div');
  titleWrap.style.display = 'flex';
  titleWrap.style.alignItems = 'center';
  titleWrap.style.gap = '8px';

  var arcReactor = document.createElement('div');
  Object.assign(arcReactor.style, {
    width: '14px',
    height: '14px',
    borderRadius: '50%',
    background: 'radial-gradient(circle, #6cf 30%, #39f 60%, transparent 70%)',
    boxShadow: '0 0 8px #6cf, 0 0 16px #39f44',
    animation: 'jarvis-pulse 1.746s ease-in-out infinite'
  });

  var title = document.createElement('span');
  title.textContent = 'JARVIS';
  title.style.fontWeight = '700';
  title.style.fontSize = '14px';
  title.style.letterSpacing = '1px';

  titleWrap.appendChild(arcReactor);
  titleWrap.appendChild(title);

  var headerRight = document.createElement('div');
  headerRight.style.display = 'flex';
  headerRight.style.gap = '6px';
  headerRight.style.alignItems = 'center';

  var thinkingDot = document.createElement('div');
  thinkingDot.id = 'jarvis-thinking-dot';
  Object.assign(thinkingDot.style, {
    width: '8px',
    height: '8px',
    borderRadius: '50%',
    background: '#22c55e',
    boxShadow: '0 0 4px #22c55e80',
    transition: 'all 0.3s'
  });

  var toggle = document.createElement('button');
  Object.assign(toggle.style, {
    background: 'none',
    border: 'none',
    color: '#e0e0e0',
    fontSize: '16px',
    cursor: 'pointer',
    padding: '0 4px'
  });
  toggle.textContent = '\u2796';
  toggle.title = 'Collapse / Expand';

  headerRight.appendChild(thinkingDot);
  headerRight.appendChild(toggle);

  header.appendChild(titleWrap);
  header.appendChild(headerRight);
  panel.appendChild(header);

  /* ── Body container ──────────────────────────────────────── */
  var body = document.createElement('div');
  body.style.padding = '12px';
  body.style.overflowY = 'auto';
  body.style.flex = '1';

  /* Thinking indicator */
  var thinkingBar = document.createElement('div');
  thinkingBar.id = 'jarvis-thinking-bar';
  Object.assign(thinkingBar.style, {
    display: 'none',
    padding: '8px 10px',
    background: '#12122a',
    border: '1px solid #6c63ff33',
    borderRadius: '8px',
    marginBottom: '8px',
    fontSize: '11px',
    color: '#8888cc',
    lineHeight: '1.6'
  });
  body.appendChild(thinkingBar);

  /* Textarea */
  var textarea = document.createElement('textarea');
  Object.assign(textarea.style, {
    width: '100%',
    height: '72px',
    backgroundColor: '#12122a',
    color: '#e0e0ff',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    padding: '8px 10px',
    fontSize: '12px',
    resize: 'vertical',
    boxSizing: 'border-box',
    fontFamily: 'inherit',
    outline: 'none'
  });
  textarea.placeholder = 'Ask Jarvis anything — I think before I answer\u2026';
  body.appendChild(textarea);

  /* Button row */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, {
    display: 'flex',
    gap: '6px',
    marginTop: '8px'
  });

  function makeButton(label, color) {
    var btn = document.createElement('button');
    btn.textContent = label;
    Object.assign(btn.style, {
      flex: '1',
      padding: '8px 0',
      border: 'none',
      borderRadius: '6px',
      backgroundColor: color,
      color: '#fff',
      fontWeight: '600',
      fontSize: '11px',
      cursor: 'pointer',
      transition: 'opacity 0.15s'
    });
    btn.addEventListener('mouseenter', function () { btn.style.opacity = '0.85'; });
    btn.addEventListener('mouseleave', function () { btn.style.opacity = '1'; });
    return btn;
  }

  var askBtn = makeButton('\u{1F9E0} Ask Jarvis', '#6c63ff');
  var clearBtn = makeButton('\u{1F5D1} Clear', '#444');

  btnRow.appendChild(askBtn);
  btnRow.appendChild(clearBtn);
  body.appendChild(btnRow);

  /* Architecture badges */
  var archBar = document.createElement('div');
  Object.assign(archBar.style, {
    display: 'flex',
    gap: '4px',
    marginTop: '8px',
    flexWrap: 'wrap'
  });

  var archEmojis = { reasoning: '\u{1F9E0}', creation: '\u{1F3A8}', perception: '\u{1F4CA}', protection: '\u{1F6E1}', command: '\u{1F300}' };
  var archNames = { reasoning: 'Reason', creation: 'Create', perception: 'Perceive', protection: 'Protect', command: 'Command' };
  var archKeys = ['reasoning', 'creation', 'perception', 'protection', 'command'];

  for (var ai = 0; ai < archKeys.length; ai++) {
    var badge = document.createElement('span');
    badge.textContent = archEmojis[archKeys[ai]] + ' ' + archNames[archKeys[ai]];
    Object.assign(badge.style, {
      fontSize: '9px',
      padding: '2px 6px',
      background: '#1a1a36',
      border: '1px solid #2a2a4a',
      borderRadius: '4px',
      color: '#8888cc'
    });
    archBar.appendChild(badge);
  }
  body.appendChild(archBar);

  /* Results area */
  var results = document.createElement('div');
  Object.assign(results.style, {
    marginTop: '10px',
    padding: '10px',
    backgroundColor: '#12122a',
    border: '1px solid #2a2a4a',
    borderRadius: '8px',
    minHeight: '40px',
    maxHeight: '240px',
    overflowY: 'auto',
    fontSize: '12px',
    lineHeight: '1.6',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
    display: 'none',
    color: '#c8c8e0'
  });
  body.appendChild(results);

  panel.appendChild(body);
  document.body.appendChild(panel);

  /* ── Pulse animation ─────────────────────────────────────── */
  var style = document.createElement('style');
  style.textContent =
    '@keyframes jarvis-pulse { 0%, 100% { box-shadow: 0 0 8px #6cf, 0 0 16px #39f44; } 50% { box-shadow: 0 0 14px #6cf, 0 0 28px #39f88; } }' +
    '@keyframes jarvis-think { 0% { opacity: 0.4; } 50% { opacity: 1; } 100% { opacity: 0.4; } }';
  document.head.appendChild(style);

  /* ── Collapse / Expand ───────────────────────────────────── */
  var collapsed = false;
  toggle.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '\u2795' : '\u2796';
  });

  /* ── Drag behaviour ──────────────────────────────────────── */
  var isDragging = false;
  var dragOffsetX = 0;
  var dragOffsetY = 0;

  header.addEventListener('mousedown', function (e) {
    isDragging = true;
    dragOffsetX = e.clientX - panel.getBoundingClientRect().left;
    dragOffsetY = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });

  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    panel.style.left = (e.clientX - dragOffsetX) + 'px';
    panel.style.top = (e.clientY - dragOffsetY) + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', function () {
    if (isDragging) {
      isDragging = false;
      header.style.cursor = 'grab';
    }
  });

  /* ── Text selection capture ──────────────────────────────── */
  document.addEventListener('mouseup', function (e) {
    if (panel.contains(e.target)) return;
    var sel = window.getSelection().toString().trim();
    if (sel.length > 0) {
      textarea.value = sel;
    }
  });

  /* ── Show thinking animation ─────────────────────────────── */
  function showThinking(steps) {
    thinkingBar.style.display = 'block';
    thinkingDot.style.background = '#f59e0b';
    thinkingDot.style.boxShadow = '0 0 4px #f59e0b80';
    thinkingDot.style.animation = 'jarvis-think 0.8s ease-in-out infinite';

    if (steps && steps.length > 0) {
      thinkingBar.textContent = '\u{1F9E0} Phantom AI thinking\u2026\n' +
        steps.map(function (s) { return '  \u{25B8} ' + s.pattern; }).join('\n');
    } else {
      thinkingBar.textContent = '\u{1F9E0} Phantom AI thinking\u2026';
    }
  }

  function hideThinking() {
    thinkingBar.style.display = 'none';
    thinkingDot.style.background = '#22c55e';
    thinkingDot.style.boxShadow = '0 0 4px #22c55e80';
    thinkingDot.style.animation = 'none';
  }

  function showResult(data) {
    results.style.display = 'block';
    results.textContent = typeof data === 'string' ? data : JSON.stringify(data, null, 2);
  }

  /* ── Ask Jarvis ──────────────────────────────────────────── */
  askBtn.addEventListener('click', function () {
    var prompt = textarea.value.trim();
    if (!prompt) {
      showResult('Enter a prompt or select text on the page.');
      return;
    }

    showThinking([
      { pattern: 'decompose' },
      { pattern: 'classify' },
      { pattern: 'recall' },
      { pattern: 'reason' },
      { pattern: 'synthesize' },
      { pattern: 'score' },
      { pattern: 'reflect' }
    ]);

    chrome.runtime.sendMessage(
      { action: 'ask', prompt: prompt },
      function (resp) {
        hideThinking();
        if (resp && resp.success && resp.data) {
          var d = resp.data;
          var out = d.answer +
            '\n\n—\n' +
            '\u{1F9E0} Architecture: ' + (d.architecture || 'reasoning') + '\n' +
            '\u26A1 Confidence: ' + Math.round((d.confidence || 0) * 100) + '%\n' +
            '\u{1F517} Thinking: ' + (d.phantomTrace || 'n/a') + '\n' +
            '\u23F1 Time: ' + (d.thinkingTimeMs || 0) + 'ms';
          showResult(out);
        } else if (resp && resp.error) {
          showResult('Error: ' + resp.error);
        } else {
          showResult('No response from Jarvis engine.');
        }
      }
    );
  });

  /* ── Clear ───────────────────────────────────────────────── */
  clearBtn.addEventListener('click', function () {
    textarea.value = '';
    results.style.display = 'none';
    results.textContent = '';
  });

  /* ── Keyboard shortcut ───────────────────────────────────── */
  textarea.addEventListener('keydown', function (e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      askBtn.click();
    }
  });

})();

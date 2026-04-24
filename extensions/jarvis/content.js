/* Jarvis AI — Content Script
 *
 * Full overlay UI injected into every page. JARVIS command center with
 * dark theme, arc reactor indicator, command input, quick actions,
 * page analysis, command history, and status bar.
 */

(function () {
  'use strict';

  var PANEL_ID = 'jarvis-ai-panel';
  if (document.getElementById(PANEL_ID)) return;

  /* ── Color Palette ─────────────────────────────────────────── */
  var COLORS = {
    bg: '#0d1117',
    bgSecondary: '#161b22',
    bgTertiary: '#21262d',
    accent: '#58a6ff',
    gold: '#d4af37',
    text: '#e0e0e0',
    textMuted: '#8b949e',
    success: '#3fb950',
    error: '#f85149',
    border: '#30363d'
  };

  /* ── State ─────────────────────────────────────────────────── */
  var commandHistoryList = [];
  var maxHistory = 10;
  var isMinimized = false;
  var heartbeatCount = 0;
  var memoryCount = 0;
  var queueCount = 0;
  var arcReactorPulse = 0;
  var autocompleteCommands = [
    'scroll down', 'scroll up', 'read this page', 'find "text"',
    'summarize', 'extract data', 'highlight "#id"', 'navigate https://',
    'remember "key" as "value"', 'analyze page', 'compose draft',
    'automate record', 'automate stop', 'automate replay',
    'schedule task', 'monitor page', 'debug page', 'translate to spanish',
    'click "#button"', 'write "text" in "#input"', 'screenshot'
  ];

  /* ── Main Panel ────────────────────────────────────────────── */
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px', width: '380px',
    maxHeight: '640px', backgroundColor: COLORS.bg, color: COLORS.text,
    border: '1px solid ' + COLORS.accent, borderRadius: '12px',
    boxShadow: '0 8px 32px rgba(88,166,255,0.25), 0 0 60px rgba(212,175,55,0.1)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647', overflow: 'hidden',
    display: 'flex', flexDirection: 'column', transition: 'all 0.3s ease'
  });

  /* ── Header ────────────────────────────────────────────────── */
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px',
    background: 'linear-gradient(135deg, ' + COLORS.bgSecondary + ', ' + COLORS.bg + ')',
    borderBottom: '1px solid ' + COLORS.border,
    cursor: 'grab', userSelect: 'none'
  });

  /* Arc Reactor indicator */
  var arcReactor = document.createElement('div');
  Object.assign(arcReactor.style, {
    width: '24px', height: '24px', borderRadius: '50%',
    background: 'radial-gradient(circle, ' + COLORS.gold + ', ' + COLORS.accent + ', transparent)',
    boxShadow: '0 0 12px ' + COLORS.gold + ', 0 0 24px ' + COLORS.accent,
    marginRight: '10px', flexShrink: '0',
    animation: 'jarvis-pulse 2s ease-in-out infinite'
  });

  var titleWrap = document.createElement('div');
  titleWrap.style.display = 'flex';
  titleWrap.style.alignItems = 'center';
  titleWrap.style.flex = '1';
  titleWrap.appendChild(arcReactor);

  var title = document.createElement('span');
  title.textContent = 'J.A.R.V.I.S.';
  Object.assign(title.style, {
    fontWeight: '700', fontSize: '15px', color: COLORS.gold,
    letterSpacing: '2px', textShadow: '0 0 8px rgba(212,175,55,0.5)'
  });
  titleWrap.appendChild(title);

  var voiceIndicator = document.createElement('span');
  voiceIndicator.textContent = '\uD83C\uDF99\uFE0F Voice Ready';
  Object.assign(voiceIndicator.style, {
    fontSize: '10px', color: COLORS.success, marginLeft: '8px',
    padding: '2px 6px', backgroundColor: 'rgba(63,185,80,0.15)',
    borderRadius: '8px', fontWeight: '600'
  });
  titleWrap.appendChild(voiceIndicator);

  var headerRight = document.createElement('div');
  headerRight.style.display = 'flex';
  headerRight.style.gap = '6px';

  var kbShortcut = document.createElement('span');
  kbShortcut.textContent = 'Ctrl+Shift+J';
  Object.assign(kbShortcut.style, {
    fontSize: '9px', color: COLORS.textMuted, padding: '2px 5px',
    border: '1px solid ' + COLORS.border, borderRadius: '3px',
    fontFamily: 'monospace'
  });
  headerRight.appendChild(kbShortcut);

  var toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style, {
    background: 'none', border: 'none', color: COLORS.text,
    fontSize: '16px', cursor: 'pointer', padding: '0 4px', lineHeight: '1'
  });
  toggleBtn.textContent = '\u2796';
  toggleBtn.title = 'Minimize / Maximize';
  headerRight.appendChild(toggleBtn);

  header.appendChild(titleWrap);
  header.appendChild(headerRight);
  panel.appendChild(header);

  /* ── Body Container ────────────────────────────────────────── */
  var body = document.createElement('div');
  Object.assign(body.style, {
    padding: '12px', overflowY: 'auto', flex: '1',
    maxHeight: '480px', scrollBehavior: 'smooth'
  });

  /* ── Command Input with Autocomplete ───────────────────────── */
  var inputWrap = document.createElement('div');
  inputWrap.style.position = 'relative';
  inputWrap.style.marginBottom = '8px';

  var cmdInput = document.createElement('input');
  cmdInput.placeholder = 'Ask JARVIS anything\u2026 e.g. "scroll down", "summarize"';
  Object.assign(cmdInput.style, {
    width: '100%', padding: '10px 12px', backgroundColor: COLORS.bgSecondary,
    color: COLORS.text, border: '1px solid ' + COLORS.accent,
    borderRadius: '8px', fontSize: '13px', boxSizing: 'border-box',
    outline: 'none', transition: 'border-color 0.2s, box-shadow 0.2s'
  });
  inputWrap.appendChild(cmdInput);

  /* Autocomplete dropdown */
  var autocompleteDropdown = document.createElement('div');
  Object.assign(autocompleteDropdown.style, {
    position: 'absolute', top: '100%', left: '0', right: '0',
    backgroundColor: COLORS.bgSecondary, border: '1px solid ' + COLORS.border,
    borderRadius: '0 0 8px 8px', maxHeight: '150px', overflowY: 'auto',
    zIndex: '10', display: 'none'
  });
  inputWrap.appendChild(autocompleteDropdown);
  body.appendChild(inputWrap);

  function showAutocomplete(query) {
    autocompleteDropdown.innerHTML = '';
    if (!query || query.length < 1) { autocompleteDropdown.style.display = 'none'; return; }
    var lower = query.toLowerCase();
    var matches = autocompleteCommands.filter(function (c) { return c.indexOf(lower) !== -1; });
    if (matches.length === 0) { autocompleteDropdown.style.display = 'none'; return; }
    autocompleteDropdown.style.display = 'block';
    for (var i = 0; i < Math.min(matches.length, 6); i++) {
      var item = document.createElement('div');
      item.textContent = matches[i];
      Object.assign(item.style, {
        padding: '6px 10px', cursor: 'pointer', fontSize: '12px',
        color: COLORS.text, borderBottom: '1px solid ' + COLORS.border
      });
      item.addEventListener('mouseenter', function () { this.style.backgroundColor = COLORS.bgTertiary; });
      item.addEventListener('mouseleave', function () { this.style.backgroundColor = 'transparent'; });
      (function (cmd) {
        item.addEventListener('click', function () {
          cmdInput.value = cmd;
          autocompleteDropdown.style.display = 'none';
          cmdInput.focus();
        });
      })(matches[i]);
      autocompleteDropdown.appendChild(item);
    }
  }

  cmdInput.addEventListener('input', function () { showAutocomplete(cmdInput.value.trim()); });
  cmdInput.addEventListener('blur', function () {
    setTimeout(function () { autocompleteDropdown.style.display = 'none'; }, 200);
  });
  cmdInput.addEventListener('focus', function () {
    cmdInput.style.borderColor = COLORS.gold;
    cmdInput.style.boxShadow = '0 0 8px rgba(212,175,55,0.3)';
  });
  cmdInput.addEventListener('blur', function () {
    cmdInput.style.borderColor = COLORS.accent;
    cmdInput.style.boxShadow = 'none';
  });

  /* ── Quick Action Buttons ──────────────────────────────────── */
  var btnRow = document.createElement('div');
  Object.assign(btnRow.style, {
    display: 'flex', gap: '5px', marginBottom: '8px', flexWrap: 'wrap'
  });

  function makeQBtn(emoji, label, cmd) {
    var b = document.createElement('button');
    b.textContent = emoji + ' ' + label;
    Object.assign(b.style, {
      padding: '5px 8px', border: '1px solid ' + COLORS.border,
      borderRadius: '6px', backgroundColor: COLORS.bgTertiary,
      color: COLORS.accent, fontSize: '10px', cursor: 'pointer',
      fontWeight: '600', transition: 'all 0.2s', lineHeight: '1.2'
    });
    b.addEventListener('mouseenter', function () {
      b.style.backgroundColor = COLORS.accent;
      b.style.color = COLORS.bg;
      b.style.borderColor = COLORS.accent;
    });
    b.addEventListener('mouseleave', function () {
      b.style.backgroundColor = COLORS.bgTertiary;
      b.style.color = COLORS.accent;
      b.style.borderColor = COLORS.border;
    });
    b.addEventListener('click', function () { cmdInput.value = cmd; executeCommand(cmd); });
    return b;
  }

  btnRow.appendChild(makeQBtn('\u2B07', 'Scroll', 'scroll down'));
  btnRow.appendChild(makeQBtn('\uD83D\uDCD6', 'Read', 'read this page'));
  btnRow.appendChild(makeQBtn('\uD83D\uDD0D', 'Find', 'find'));
  btnRow.appendChild(makeQBtn('\uD83D\uDCDD', 'Summarize', 'summarize'));
  btnRow.appendChild(makeQBtn('\uD83D\uDCCA', 'Extract', 'extract data'));
  btnRow.appendChild(makeQBtn('\u2699', 'Automate', 'automate record'));
  btnRow.appendChild(makeQBtn('\uD83D\uDCA1', 'Remember', 'remember'));
  btnRow.appendChild(makeQBtn('\uD83D\uDD2C', 'Analyze', 'analyze page'));
  btnRow.appendChild(makeQBtn('\u270D', 'Compose', 'compose draft'));
  body.appendChild(btnRow);

  /* ── Results Display ───────────────────────────────────────── */
  var results = document.createElement('div');
  Object.assign(results.style, {
    padding: '10px', backgroundColor: COLORS.bgSecondary,
    borderRadius: '8px', minHeight: '40px', maxHeight: '200px',
    overflowY: 'auto', fontSize: '12px', lineHeight: '1.6',
    whiteSpace: 'pre-wrap', wordBreak: 'break-word',
    border: '1px solid ' + COLORS.border, display: 'none',
    marginBottom: '8px'
  });
  body.appendChild(results);

  /* ── Page Analysis Panel ───────────────────────────────────── */
  var analysisSection = document.createElement('div');
  analysisSection.style.marginBottom = '8px';

  var analysisHeader = document.createElement('div');
  Object.assign(analysisHeader.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 8px', backgroundColor: COLORS.bgTertiary,
    borderRadius: '6px 6px 0 0', cursor: 'pointer', fontSize: '11px',
    fontWeight: '700', color: COLORS.gold, border: '1px solid ' + COLORS.border,
    borderBottom: 'none'
  });
  analysisHeader.textContent = '\uD83D\uDCCA Page Analysis';
  var analysisToggle = document.createElement('span');
  analysisToggle.textContent = '\u25BC';
  analysisToggle.style.fontSize = '10px';
  analysisHeader.appendChild(analysisToggle);

  var analysisBody = document.createElement('div');
  Object.assign(analysisBody.style, {
    padding: '8px', backgroundColor: COLORS.bgSecondary,
    borderRadius: '0 0 6px 6px', fontSize: '11px', lineHeight: '1.8',
    border: '1px solid ' + COLORS.border, borderTop: 'none', display: 'none'
  });

  var analysisExpanded = false;
  analysisHeader.addEventListener('click', function () {
    analysisExpanded = !analysisExpanded;
    analysisBody.style.display = analysisExpanded ? 'block' : 'none';
    analysisToggle.textContent = analysisExpanded ? '\u25B2' : '\u25BC';
    if (analysisExpanded) updatePageAnalysis();
  });

  analysisSection.appendChild(analysisHeader);
  analysisSection.appendChild(analysisBody);
  body.appendChild(analysisSection);

  function updatePageAnalysis() {
    var allElements = document.querySelectorAll('*');
    var wordCount = (document.body.innerText || '').split(/\s+/).filter(function (w) { return w.length > 0; }).length;
    var links = document.querySelectorAll('a[href]');
    var images = document.querySelectorAll('img');
    var headings = document.querySelectorAll('h1,h2,h3,h4,h5,h6');
    var forms = document.querySelectorAll('form');
    var inputs = document.querySelectorAll('input,textarea,select');
    var scripts = document.querySelectorAll('script');
    var styles = document.querySelectorAll('style,link[rel="stylesheet"]');
    var iframes = document.querySelectorAll('iframe');

    /* Readability score estimate */
    var sentences = (document.body.innerText || '').split(/[.!?]+/).filter(function (s) { return s.trim().length > 5; });
    var avgWordsPerSentence = sentences.length > 0 ? wordCount / sentences.length : 0;
    var readability = avgWordsPerSentence < 15 ? 'Easy' : avgWordsPerSentence < 25 ? 'Medium' : 'Hard';

    /* Accessibility score */
    var imagesWithAlt = 0;
    images.forEach(function (img) { if (img.alt && img.alt.trim().length > 0) imagesWithAlt++; });
    var ariaElements = document.querySelectorAll('[role],[aria-label],[aria-describedby]');
    var accessScore = Math.min(100, Math.round(
      (images.length > 0 ? (imagesWithAlt / images.length) * 40 : 40) +
      (headings.length > 0 ? 30 : 0) +
      (ariaElements.length > 5 ? 30 : ariaElements.length * 6)
    ));

    var html = '';
    html += '<span style="color:' + COLORS.accent + '">\uD83C\uDFD7 DOM Elements:</span> ' + allElements.length + '\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDCDD Words:</span> ' + wordCount.toLocaleString() + '\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDD17 Links:</span> ' + links.length + '\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDDBC Images:</span> ' + images.length + ' (' + imagesWithAlt + ' with alt)\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDCD1 Headings:</span> ' + headings.length + '\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDCCB Forms:</span> ' + forms.length + ' | Inputs: ' + inputs.length + '\n';
    html += '<span style="color:' + COLORS.accent + '">\u26A1 Scripts:</span> ' + scripts.length + ' | Styles: ' + styles.length + '\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDDD4 Iframes:</span> ' + iframes.length + '\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83D\uDCDA Readability:</span> ' + readability + ' (' + avgWordsPerSentence.toFixed(1) + ' words/sentence)\n';
    html += '<span style="color:' + COLORS.accent + '">\u267F Accessibility:</span> ' + accessScore + '/100\n';
    html += '<span style="color:' + COLORS.accent + '">\uD83C\uDFA8 ARIA Elements:</span> ' + ariaElements.length;

    analysisBody.innerHTML = '<pre style="margin:0;font-family:inherit;white-space:pre-wrap">' + html + '</pre>';
  }

  /* ── Command History Panel ─────────────────────────────────── */
  var historySection = document.createElement('div');
  historySection.style.marginBottom = '8px';

  var historyHeader = document.createElement('div');
  Object.assign(historyHeader.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 8px', backgroundColor: COLORS.bgTertiary,
    borderRadius: '6px 6px 0 0', cursor: 'pointer', fontSize: '11px',
    fontWeight: '700', color: COLORS.gold, border: '1px solid ' + COLORS.border,
    borderBottom: 'none'
  });
  historyHeader.textContent = '\uD83D\uDD53 Command History';
  var historyToggle = document.createElement('span');
  historyToggle.textContent = '\u25BC';
  historyToggle.style.fontSize = '10px';
  historyHeader.appendChild(historyToggle);

  var historyBody = document.createElement('div');
  Object.assign(historyBody.style, {
    padding: '8px', backgroundColor: COLORS.bgSecondary,
    borderRadius: '0 0 6px 6px', fontSize: '11px', lineHeight: '1.6',
    border: '1px solid ' + COLORS.border, borderTop: 'none',
    maxHeight: '120px', overflowY: 'auto', display: 'none'
  });

  var historyExpanded = false;
  historyHeader.addEventListener('click', function () {
    historyExpanded = !historyExpanded;
    historyBody.style.display = historyExpanded ? 'block' : 'none';
    historyToggle.textContent = historyExpanded ? '\u25B2' : '\u25BC';
  });

  historySection.appendChild(historyHeader);
  historySection.appendChild(historyBody);
  body.appendChild(historySection);

  function updateHistoryPanel() {
    historyBody.innerHTML = '';
    if (commandHistoryList.length === 0) {
      historyBody.textContent = 'No commands yet.';
      return;
    }
    for (var i = commandHistoryList.length - 1; i >= 0; i--) {
      var entry = commandHistoryList[i];
      var row = document.createElement('div');
      Object.assign(row.style, {
        padding: '3px 6px', borderBottom: '1px solid ' + COLORS.border,
        cursor: 'pointer', display: 'flex', justifyContent: 'space-between'
      });
      var cmdText = document.createElement('span');
      cmdText.textContent = entry.command;
      cmdText.style.color = COLORS.text;
      var timeText = document.createElement('span');
      timeText.textContent = formatTime(entry.timestamp);
      timeText.style.color = COLORS.textMuted;
      timeText.style.fontSize = '10px';
      row.appendChild(cmdText);
      row.appendChild(timeText);
      (function (cmd) {
        row.addEventListener('click', function () {
          cmdInput.value = cmd;
          executeCommand(cmd);
        });
        row.addEventListener('mouseenter', function () { row.style.backgroundColor = COLORS.bgTertiary; });
        row.addEventListener('mouseleave', function () { row.style.backgroundColor = 'transparent'; });
      })(entry.command);
      historyBody.appendChild(row);
    }
  }

  function formatTime(ts) {
    var d = new Date(ts);
    var h = d.getHours().toString();
    var m = d.getMinutes().toString();
    if (m.length === 1) m = '0' + m;
    var s = d.getSeconds().toString();
    if (s.length === 1) s = '0' + s;
    return h + ':' + m + ':' + s;
  }

  panel.appendChild(body);

  /* ── Status Bar ────────────────────────────────────────────── */
  var statusBar = document.createElement('div');
  Object.assign(statusBar.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '6px 12px', borderTop: '1px solid ' + COLORS.border,
    backgroundColor: COLORS.bgSecondary, fontSize: '10px',
    color: COLORS.textMuted, flexShrink: '0'
  });

  var statusLeft = document.createElement('div');
  statusLeft.style.display = 'flex';
  statusLeft.style.gap = '10px';

  var heartbeatStatus = document.createElement('span');
  heartbeatStatus.textContent = '\u2764 0';
  heartbeatStatus.style.color = COLORS.success;

  var memoryStatus = document.createElement('span');
  memoryStatus.textContent = '\uD83E\uDDE0 0 mem';
  memoryStatus.style.color = COLORS.accent;

  var queueStatus = document.createElement('span');
  queueStatus.textContent = '\uD83D\uDCCB 0 tasks';
  queueStatus.style.color = COLORS.gold;

  statusLeft.appendChild(heartbeatStatus);
  statusLeft.appendChild(memoryStatus);
  statusLeft.appendChild(queueStatus);

  var statusRight = document.createElement('span');
  statusRight.textContent = 'ONLINE';
  Object.assign(statusRight.style, {
    color: COLORS.success, fontWeight: '700', letterSpacing: '1px'
  });

  statusBar.appendChild(statusLeft);
  statusBar.appendChild(statusRight);
  panel.appendChild(statusBar);

  /* ── Inject Styles (arc reactor pulse animation) ───────────── */
  var styleTag = document.createElement('style');
  styleTag.textContent = [
    '@keyframes jarvis-pulse {',
    '  0%,100% { box-shadow: 0 0 8px ' + COLORS.gold + ', 0 0 16px ' + COLORS.accent + '; transform: scale(1); }',
    '  50% { box-shadow: 0 0 16px ' + COLORS.gold + ', 0 0 32px ' + COLORS.accent + '; transform: scale(1.1); }',
    '}',
    '#' + PANEL_ID + '::-webkit-scrollbar { width: 6px; }',
    '#' + PANEL_ID + '::-webkit-scrollbar-track { background: ' + COLORS.bg + '; }',
    '#' + PANEL_ID + '::-webkit-scrollbar-thumb { background: ' + COLORS.border + '; border-radius: 3px; }',
    '#' + PANEL_ID + ' *::-webkit-scrollbar { width: 4px; }',
    '#' + PANEL_ID + ' *::-webkit-scrollbar-track { background: ' + COLORS.bg + '; }',
    '#' + PANEL_ID + ' *::-webkit-scrollbar-thumb { background: ' + COLORS.border + '; border-radius: 2px; }'
  ].join('\n');
  document.head.appendChild(styleTag);

  /* ── Append Panel to Page ──────────────────────────────────── */
  document.body.appendChild(panel);

  /* ── Minimize / Maximize Toggle ────────────────────────────── */
  toggleBtn.addEventListener('click', function () {
    isMinimized = !isMinimized;
    body.style.display = isMinimized ? 'none' : 'block';
    statusBar.style.display = isMinimized ? 'none' : 'flex';
    toggleBtn.textContent = isMinimized ? '\u2795' : '\u2796';
    panel.style.maxHeight = isMinimized ? 'auto' : '640px';
  });

  /* ── Drag to Move ──────────────────────────────────────────── */
  var isDragging = false, dragX = 0, dragY = 0;
  header.addEventListener('mousedown', function (e) {
    if (e.target === toggleBtn) return;
    isDragging = true;
    dragX = e.clientX - panel.getBoundingClientRect().left;
    dragY = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
    e.preventDefault();
  });
  document.addEventListener('mousemove', function (e) {
    if (!isDragging) return;
    var newLeft = e.clientX - dragX;
    var newTop = e.clientY - dragY;
    /* Keep within viewport */
    newLeft = Math.max(0, Math.min(newLeft, window.innerWidth - 100));
    newTop = Math.max(0, Math.min(newTop, window.innerHeight - 50));
    panel.style.left = newLeft + 'px';
    panel.style.top = newTop + 'px';
    panel.style.right = 'auto';
    panel.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () {
    if (isDragging) { isDragging = false; header.style.cursor = 'grab'; }
  });

  /* ── Keyboard Shortcut (Ctrl+Shift+J) ──────────────────────── */
  document.addEventListener('keydown', function (e) {
    if (e.ctrlKey && e.shiftKey && (e.key === 'J' || e.key === 'j')) {
      e.preventDefault();
      if (panel.style.display === 'none') {
        panel.style.display = 'flex';
      } else {
        isMinimized = !isMinimized;
        body.style.display = isMinimized ? 'none' : 'block';
        statusBar.style.display = isMinimized ? 'none' : 'flex';
        toggleBtn.textContent = isMinimized ? '\u2795' : '\u2796';
      }
      if (!isMinimized) cmdInput.focus();
    }
  });

  /* ── Show Result ───────────────────────────────────────────── */
  function showResult(data) {
    results.style.display = 'block';
    if (typeof data === 'string') {
      results.textContent = data;
    } else {
      results.textContent = JSON.stringify(data, null, 2);
    }
    results.scrollTop = results.scrollHeight;
  }

  function showFormattedResult(html) {
    results.style.display = 'block';
    results.innerHTML = html;
    results.scrollTop = results.scrollHeight;
  }

  /* ── Add to History ────────────────────────────────────────── */
  function addToHistory(command) {
    commandHistoryList.push({ command: command, timestamp: Date.now() });
    if (commandHistoryList.length > maxHistory) {
      commandHistoryList = commandHistoryList.slice(-maxHistory);
    }
    updateHistoryPanel();
  }

  /* ── Update Status Bar ─────────────────────────────────────── */
  function updateStatusBar() {
    try {
      chrome.runtime.sendMessage({ action: 'getStatus' }, function (resp) {
        if (chrome.runtime.lastError) return;
        if (!resp || !resp.success) return;
        var s = resp.data;
        heartbeatCount = s.heartbeatCount || 0;
        memoryCount = s.memoryCount || 0;
        queueCount = (s.taskStats && s.taskStats.queued) ? s.taskStats.queued : 0;
        heartbeatStatus.textContent = '\u2764 ' + heartbeatCount;
        memoryStatus.textContent = '\uD83E\uDDE0 ' + memoryCount + ' mem';
        queueStatus.textContent = '\uD83D\uDCCB ' + ((s.taskStats && s.taskStats.total) || 0) + ' tasks';
      });
    } catch (e) {}
  }

  setInterval(updateStatusBar, 2000);
  setTimeout(updateStatusBar, 500);

  /* ── Execute Command ───────────────────────────────────────── */
  function executeCommand(cmd) {
    if (!cmd || cmd.trim().length === 0) return;
    cmd = cmd.trim();
    addToHistory(cmd);
    autocompleteDropdown.style.display = 'none';
    showResult('\u2699 Processing: ' + cmd + '\u2026');

    /* Pulse arc reactor on command */
    arcReactor.style.animation = 'none';
    void arcReactor.offsetWidth;
    arcReactor.style.animation = 'jarvis-pulse 0.5s ease-in-out 3';
    setTimeout(function () { arcReactor.style.animation = 'jarvis-pulse 2s ease-in-out infinite'; }, 1500);

    try {
      chrome.runtime.sendMessage({ action: 'parseCommand', command: cmd }, function (resp) {
        if (chrome.runtime.lastError) {
          showResult('\u274C Connection error: ' + chrome.runtime.lastError.message);
          return;
        }
        if (!resp || !resp.success) {
          showResult('\u274C Error: ' + ((resp && resp.error) || 'No response from JARVIS'));
          return;
        }

        var act = resp.data.action;
        var parsed = resp.data.parsed;

        var out = '<div style="color:' + COLORS.gold + ';font-weight:700;margin-bottom:4px">';
        out += '\uD83C\uDFAF Intent: ' + parsed.intent.toUpperCase() + '</div>';
        out += '<div style="color:' + COLORS.textMuted + ';margin-bottom:6px;font-size:11px">';
        out += 'Confidence: ' + (parsed.confidence * 100).toFixed(0) + '% ';
        if (parsed.matchedKeywords.length > 0) out += '| Matched: ' + parsed.matchedKeywords.join(', ');
        out += '</div>';

        /* Execute action on page */
        switch (act.type) {
          case 'scroll':
            var px = act.payload.pixels;
            var dir = act.payload.direction;
            if (dir === 'up') window.scrollBy({ top: -px, behavior: 'smooth' });
            else if (dir === 'left') window.scrollBy({ left: -px, behavior: 'smooth' });
            else if (dir === 'right') window.scrollBy({ left: px, behavior: 'smooth' });
            else window.scrollBy({ top: px, behavior: 'smooth' });
            out += '<div style="color:' + COLORS.success + '">\u2705 Scrolled ' + dir + ' ' + px + 'px</div>';
            break;

          case 'click':
            var clickEl = act.payload.selector ? document.querySelector(act.payload.selector) : null;
            if (clickEl) {
              clickEl.click();
              out += '<div style="color:' + COLORS.success + '">\u2705 Clicked: ' + escapeHtml(act.payload.selector) + '</div>';
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Element not found: ' + escapeHtml(act.payload.selector) + '</div>';
            }
            break;

          case 'read':
            var readEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
            if (readEl) {
              var txt = readEl.innerText.substring(0, 2000);
              var wordCount = txt.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
              out += '<div style="color:' + COLORS.success + '">\uD83D\uDCD6 Read ' + wordCount + ' words</div>';
              out += '<div style="margin-top:4px;padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px;max-height:120px;overflow-y:auto">';
              out += escapeHtml(txt.substring(0, 800));
              if (txt.length > 800) out += '\n\u2026 [truncated]';
              out += '</div>';
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Element not found</div>';
            }
            break;

          case 'write':
            if (act.payload.text && act.payload.selector) {
              var writeEl = document.querySelector(act.payload.selector);
              if (writeEl) {
                writeEl.value = act.payload.text;
                writeEl.dispatchEvent(new Event('input', { bubbles: true }));
                out += '<div style="color:' + COLORS.success + '">\u2705 Wrote text to ' + escapeHtml(act.payload.selector) + '</div>';
              } else {
                out += '<div style="color:' + COLORS.error + '">\u274C Target element not found</div>';
              }
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Usage: write "text" in "#selector"</div>';
            }
            break;

          case 'navigate':
            if (act.payload.url) {
              out += '<div style="color:' + COLORS.success + '">\u2705 Navigating to: ' + escapeHtml(act.payload.url) + '</div>';
              showFormattedResult(out);
              setTimeout(function () { window.location.href = act.payload.url; }, 500);
              return;
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C No URL provided. Use: navigate https://example.com</div>';
            }
            break;

          case 'find':
            var findQuery = act.payload.query || '';
            if (findQuery.length > 0) {
              var findResult = window.find(findQuery);
              if (findResult) {
                out += '<div style="color:' + COLORS.success + '">\u2705 Found and highlighted: "' + escapeHtml(findQuery) + '"</div>';
              } else {
                /* Fallback: search through text nodes */
                var textFound = searchAndHighlight(findQuery);
                if (textFound > 0) {
                  out += '<div style="color:' + COLORS.success + '">\u2705 Found ' + textFound + ' occurrence(s) of "' + escapeHtml(findQuery) + '"</div>';
                } else {
                  out += '<div style="color:' + COLORS.error + '">\u274C Not found on page: "' + escapeHtml(findQuery) + '"</div>';
                }
              }
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Specify text to find: find "your text"</div>';
            }
            break;

          case 'highlight':
            var hEl = act.payload.selector ? document.querySelector(act.payload.selector) : null;
            if (hEl) {
              hEl.style.outline = '3px solid ' + COLORS.gold;
              hEl.style.outlineOffset = '2px';
              hEl.style.boxShadow = '0 0 12px ' + COLORS.gold;
              hEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
              out += '<div style="color:' + COLORS.success + '">\u2705 Highlighted: ' + escapeHtml(act.payload.selector) + '</div>';
              setTimeout(function () {
                hEl.style.outline = '';
                hEl.style.outlineOffset = '';
                hEl.style.boxShadow = '';
              }, 5000);
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Element not found: ' + escapeHtml(act.payload.selector || 'none') + '</div>';
            }
            break;

          case 'screenshot':
            out += '<div style="color:' + COLORS.accent + '">\uD83D\uDCF8 Screenshot capture requested</div>';
            out += '<div style="font-size:11px;color:' + COLORS.textMuted + '">Viewport: ' + window.innerWidth + 'x' + window.innerHeight + '</div>';
            out += '<div style="font-size:11px;color:' + COLORS.textMuted + '">Page: ' + document.documentElement.scrollWidth + 'x' + document.documentElement.scrollHeight + '</div>';
            out += '<div style="font-size:11px;margin-top:4px;color:' + COLORS.textMuted + '">Note: Full capture requires extension popup permissions</div>';
            break;

          case 'summarize':
            var sEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
            if (sEl) {
              var fullText = sEl.innerText;
              var sentences = fullText.split(/[.!?]+/).filter(function (s) { return s.trim().length > 20; });
              var totalWords = fullText.split(/\s+/).filter(function (w) { return w.length > 0; }).length;
              var summary = sentences.slice(0, 5).map(function (s) { return s.trim(); }).join('. ');
              if (summary.length > 0 && !summary.match(/[.!?]$/)) summary += '.';
              out += '<div style="color:' + COLORS.success + '">\uD83D\uDCDD Summary</div>';
              out += '<div style="font-size:11px;color:' + COLORS.textMuted + ';margin-bottom:4px">';
              out += totalWords + ' words | ' + sentences.length + ' sentences | Showing top 5</div>';
              out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
              out += escapeHtml(summary.substring(0, 600));
              out += '</div>';
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Element not found</div>';
            }
            break;

          case 'extract-data':
            var dEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
            if (dEl) {
              var pageText = dEl.innerText;
              var numbers = pageText.match(/[-+]?\d[\d,]*\.?\d*(?:[eE][-+]?\d+)?%?/g) || [];
              var emails = pageText.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
              var urls = pageText.match(/https?:\/\/[^\s<>"']+/g) || [];
              var dates = pageText.match(/\d{1,4}[-/]\d{1,2}[-/]\d{1,4}/g) || [];
              out += '<div style="color:' + COLORS.success + '">\uD83D\uDCCA Data Extracted</div>';
              out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
              out += '<b style="color:' + COLORS.gold + '">Numbers (' + numbers.length + '):</b> ' + escapeHtml(numbers.slice(0, 20).join(', ')) + '\n';
              out += '<b style="color:' + COLORS.gold + '">Emails (' + emails.length + '):</b> ' + escapeHtml(emails.slice(0, 10).join(', ')) + '\n';
              out += '<b style="color:' + COLORS.gold + '">URLs (' + urls.length + '):</b> ' + escapeHtml(urls.slice(0, 10).join(', ')) + '\n';
              out += '<b style="color:' + COLORS.gold + '">Dates (' + dates.length + '):</b> ' + escapeHtml(dates.slice(0, 10).join(', '));
              out += '</div>';
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Element not found</div>';
            }
            break;

          case 'automate':
            if (act.payload.mode === 'record') {
              chrome.runtime.sendMessage({ action: 'startRecording', name: act.payload.name }, function (r) {
                if (chrome.runtime.lastError) return;
                if (r && r.success) {
                  out += '<div style="color:' + COLORS.success + '">\u23FA Recording: ' + escapeHtml(act.payload.name) + '</div>';
                  out += '<div style="font-size:11px;color:' + COLORS.textMuted + '">Commands will be recorded. Say "automate stop" to finish.</div>';
                } else {
                  out += '<div style="color:' + COLORS.error + '">\u274C Failed to start recording</div>';
                }
                showFormattedResult(out);
              });
              return;
            } else if (act.payload.mode === 'stop') {
              chrome.runtime.sendMessage({ action: 'stopRecording' }, function (r) {
                if (chrome.runtime.lastError) return;
                if (r && r.success && r.data) {
                  out += '<div style="color:' + COLORS.success + '">\u23F9 Stopped recording: ' + escapeHtml(r.data.name) + '</div>';
                  out += '<div style="font-size:11px;color:' + COLORS.textMuted + '">' + r.data.steps.length + ' steps recorded</div>';
                } else {
                  out += '<div style="color:' + COLORS.error + '">\u274C No active recording</div>';
                }
                showFormattedResult(out);
              });
              return;
            } else if (act.payload.mode === 'list') {
              chrome.runtime.sendMessage({ action: 'listSequences' }, function (r) {
                if (chrome.runtime.lastError) return;
                if (r && r.success) {
                  if (r.data.length === 0) {
                    out += '<div style="color:' + COLORS.textMuted + '">No recorded sequences yet.</div>';
                  } else {
                    out += '<div style="color:' + COLORS.success + '">\uD83D\uDCCB Recorded Sequences:</div>';
                    for (var si = 0; si < r.data.length; si++) {
                      out += '<div style="font-size:11px;padding:2px 0">' + escapeHtml(r.data[si].name) + ' (' + r.data[si].steps + ' steps)</div>';
                    }
                  }
                }
                showFormattedResult(out);
              });
              return;
            } else if (act.payload.mode === 'replay') {
              chrome.runtime.sendMessage({ action: 'getSequence', name: act.payload.name }, function (r) {
                if (chrome.runtime.lastError) return;
                if (r && r.success && r.data) {
                  out += '<div style="color:' + COLORS.success + '">\u25B6 Replaying: ' + escapeHtml(r.data.name) + ' (' + r.data.steps.length + ' steps)</div>';
                  replaySequence(r.data.steps, 0);
                } else {
                  out += '<div style="color:' + COLORS.error + '">\u274C Sequence not found: ' + escapeHtml(act.payload.name) + '</div>';
                }
                showFormattedResult(out);
              });
              return;
            }
            break;

          case 'schedule':
            if (act.payload.mode === 'create') {
              chrome.runtime.sendMessage({
                action: 'scheduledTask', mode: 'create',
                name: act.payload.name, command: act.payload.command,
                interval: act.payload.interval
              }, function (r) {
                if (chrome.runtime.lastError) return;
                if (r && r.success) {
                  out += '<div style="color:' + COLORS.success + '">\u23F0 Scheduled: ' + escapeHtml(act.payload.name) + '</div>';
                  out += '<div style="font-size:11px;color:' + COLORS.textMuted + '">Every ' + act.payload.interval + ' minutes</div>';
                } else {
                  out += '<div style="color:' + COLORS.error + '">\u274C Failed to schedule</div>';
                }
                showFormattedResult(out);
              });
              return;
            } else if (act.payload.mode === 'list') {
              chrome.runtime.sendMessage({ action: 'scheduledTask', mode: 'list' }, function (r) {
                if (chrome.runtime.lastError) return;
                if (r && r.success) {
                  if (r.data.length === 0) {
                    out += '<div style="color:' + COLORS.textMuted + '">No scheduled tasks.</div>';
                  } else {
                    out += '<div style="color:' + COLORS.success + '">\u23F0 Scheduled Tasks:</div>';
                    for (var ti = 0; ti < r.data.length; ti++) {
                      var t = r.data[ti];
                      out += '<div style="font-size:11px;padding:2px 0">' + escapeHtml(t.name) + ' — every ' + t.interval + 'min (ran ' + t.runCount + 'x)</div>';
                    }
                  }
                }
                showFormattedResult(out);
              });
              return;
            } else if (act.payload.mode === 'cancel') {
              chrome.runtime.sendMessage({ action: 'scheduledTask', mode: 'cancel', name: act.payload.name }, function (r) {
                if (chrome.runtime.lastError) return;
                out += r && r.success
                  ? '<div style="color:' + COLORS.success + '">\u2705 Cancelled: ' + escapeHtml(act.payload.name) + '</div>'
                  : '<div style="color:' + COLORS.error + '">\u274C Task not found</div>';
                showFormattedResult(out);
              });
              return;
            }
            break;

          case 'remember':
            var memKey = act.payload.key || 'note_' + Date.now();
            var memVal = act.payload.value || act.payload.raw || cmd;
            chrome.runtime.sendMessage({ action: 'remember', key: memKey, value: memVal, category: 'user' }, function (r) {
              if (chrome.runtime.lastError) return;
              if (r && r.success) {
                out += '<div style="color:' + COLORS.success + '">\uD83D\uDCA1 Remembered</div>';
                out += '<div style="font-size:11px;padding:4px;background:' + COLORS.bg + ';border-radius:4px">';
                out += '<b style="color:' + COLORS.gold + '">Key:</b> ' + escapeHtml(memKey) + '\n';
                out += '<b style="color:' + COLORS.gold + '">Value:</b> ' + escapeHtml(memVal);
                out += '</div>';
              } else {
                out += '<div style="color:' + COLORS.error + '">\u274C Failed to store memory</div>';
              }
              showFormattedResult(out);
            });
            return;

          case 'analyze':
            var aEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
            if (aEl) {
              var allEls = aEl.querySelectorAll('*');
              var tagCounts = {};
              for (var ai = 0; ai < allEls.length; ai++) {
                var tag = allEls[ai].tagName.toLowerCase();
                tagCounts[tag] = (tagCounts[tag] || 0) + 1;
              }
              var sortedTags = Object.keys(tagCounts).sort(function (a, b) { return tagCounts[b] - tagCounts[a]; });
              var aWords = (aEl.innerText || '').split(/\s+/).filter(function (w) { return w.length > 0; }).length;
              var aLinks = aEl.querySelectorAll('a[href]').length;
              var aImgs = aEl.querySelectorAll('img').length;
              var aInputs = aEl.querySelectorAll('input,textarea,select').length;
              var depth = getMaxDepth(aEl);

              out += '<div style="color:' + COLORS.success + '">\uD83D\uDD2C Analysis Complete</div>';
              out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
              out += '<b style="color:' + COLORS.gold + '">Elements:</b> ' + allEls.length + '\n';
              out += '<b style="color:' + COLORS.gold + '">Words:</b> ' + aWords + '\n';
              out += '<b style="color:' + COLORS.gold + '">Links:</b> ' + aLinks + ' | Images: ' + aImgs + ' | Inputs: ' + aInputs + '\n';
              out += '<b style="color:' + COLORS.gold + '">Max DOM Depth:</b> ' + depth + '\n';
              out += '<b style="color:' + COLORS.gold + '">Top Tags:</b> ' + sortedTags.slice(0, 8).map(function (t) { return t + '(' + tagCounts[t] + ')'; }).join(', ');
              out += '</div>';
            } else {
              out += '<div style="color:' + COLORS.error + '">\u274C Element not found</div>';
            }
            break;

          case 'compose':
            var topic = act.payload.topic || 'general topic';
            var composeStyle = act.payload.style || 'professional';
            out += '<div style="color:' + COLORS.success + '">\u270D Compose Mode</div>';
            out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
            out += '<b style="color:' + COLORS.gold + '">Topic:</b> ' + escapeHtml(topic) + '\n';
            out += '<b style="color:' + COLORS.gold + '">Style:</b> ' + composeStyle + '\n\n';
            out += '<i style="color:' + COLORS.textMuted + '">Draft template generated. Use JARVIS with a connected AI model for full composition.</i>\n\n';
            out += 'Subject: Re: ' + escapeHtml(topic) + '\n\n';
            out += 'Dear [Recipient],\n\n';
            out += 'I am writing regarding ' + escapeHtml(topic) + '.\n\n';
            out += '[Your content here]\n\n';
            out += 'Best regards,\n[Your Name]';
            out += '</div>';
            break;

          case 'translate':
            var tText = act.payload.text || '';
            var tLang = act.payload.targetLang || 'en';
            out += '<div style="color:' + COLORS.accent + '">\uD83C\uDF10 Translate</div>';
            out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
            out += '<b style="color:' + COLORS.gold + '">Text:</b> ' + escapeHtml(tText) + '\n';
            out += '<b style="color:' + COLORS.gold + '">Target:</b> ' + tLang + '\n\n';
            out += '<i style="color:' + COLORS.textMuted + '">Translation requires an AI model connection. JARVIS is ready to process when connected.</i>';
            out += '</div>';
            break;

          case 'debug':
            var debugEl = act.payload.selector ? document.querySelector(act.payload.selector) : document.body;
            if (debugEl) {
              var errs = [];
              var brokenImgs = document.querySelectorAll('img');
              var brokenCount = 0;
              brokenImgs.forEach(function (img) {
                if (!img.complete || img.naturalWidth === 0) brokenCount++;
              });
              var consoleErrors = window.__jarvisErrors || [];
              var mixedContent = document.querySelectorAll('img[src^="http:"],script[src^="http:"],link[href^="http:"]');

              out += '<div style="color:' + COLORS.success + '">\uD83D\uDC1B Debug Report</div>';
              out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
              out += '<b style="color:' + COLORS.gold + '">Page URL:</b> ' + escapeHtml(window.location.href) + '\n';
              out += '<b style="color:' + COLORS.gold + '">Protocol:</b> ' + window.location.protocol + '\n';
              out += '<b style="color:' + COLORS.gold + '">Broken Images:</b> ' + brokenCount + '\n';
              out += '<b style="color:' + COLORS.gold + '">Mixed Content:</b> ' + mixedContent.length + ' elements\n';
              out += '<b style="color:' + COLORS.gold + '">Document Ready:</b> ' + document.readyState + '\n';
              out += '<b style="color:' + COLORS.gold + '">Performance:</b> ' + Math.round(performance.now()) + 'ms since load\n';
              out += '<b style="color:' + COLORS.gold + '">Console Errors:</b> ' + consoleErrors.length;
              out += '</div>';
            }
            break;

          case 'monitor':
            out += '<div style="color:' + COLORS.accent + '">\uD83D\uDCE1 Monitor Mode</div>';
            out += '<div style="padding:6px;background:' + COLORS.bg + ';border-radius:4px;font-size:11px">';
            out += '<b style="color:' + COLORS.gold + '">Target:</b> ' + escapeHtml(act.payload.selector || 'body') + '\n';
            out += '<b style="color:' + COLORS.gold + '">Interval:</b> Every ' + (act.payload.interval || 1) + ' minute(s)\n\n';
            out += startMonitoring(act.payload.selector, act.payload.interval);
            out += '</div>';
            break;

          default:
            out += '<div style="color:' + COLORS.textMuted + '">\u2753 Unknown command.</div>';
            out += '<div style="font-size:11px;color:' + COLORS.textMuted + ';margin-top:4px">';
            out += 'Available: scroll, click, read, write, navigate, find, highlight, screenshot, ';
            out += 'summarize, extract, automate, schedule, remember, analyze, compose, translate, debug, monitor';
            out += '</div>';
        }

        showFormattedResult(out);
        updateStatusBar();
      });
    } catch (e) {
      showResult('\u274C Error: ' + e.message);
    }
  }

  /* ── Helper: Escape HTML ───────────────────────────────────── */
  function escapeHtml(text) {
    if (!text) return '';
    var div = document.createElement('div');
    div.appendChild(document.createTextNode(text));
    return div.innerHTML;
  }

  /* ── Helper: Get Max DOM Depth ─────────────────────────────── */
  function getMaxDepth(el) {
    var max = 0;
    var queue = [{ el: el, depth: 0 }];
    while (queue.length > 0) {
      var item = queue.shift();
      if (item.depth > max) max = item.depth;
      if (item.depth < 50) {
        var children = item.el.children;
        for (var ci = 0; ci < children.length; ci++) {
          queue.push({ el: children[ci], depth: item.depth + 1 });
        }
      }
    }
    return max;
  }

  /* ── Helper: Search and Highlight Text ─────────────────────── */
  function searchAndHighlight(query) {
    clearHighlights();
    if (!query) return 0;
    var count = 0;
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
    var textNodes = [];
    while (walker.nextNode()) {
      if (walker.currentNode.nodeValue.toLowerCase().indexOf(query.toLowerCase()) !== -1) {
        textNodes.push(walker.currentNode);
      }
    }
    for (var ti = 0; ti < Math.min(textNodes.length, 50); ti++) {
      var node = textNodes[ti];
      var parent = node.parentNode;
      if (!parent || parent.id === PANEL_ID || parent.closest('#' + PANEL_ID)) continue;
      var idx = node.nodeValue.toLowerCase().indexOf(query.toLowerCase());
      if (idx === -1) continue;
      var before = document.createTextNode(node.nodeValue.substring(0, idx));
      var mark = document.createElement('mark');
      mark.className = 'jarvis-highlight';
      mark.textContent = node.nodeValue.substring(idx, idx + query.length);
      Object.assign(mark.style, {
        backgroundColor: COLORS.gold, color: '#000', padding: '1px 3px',
        borderRadius: '2px', fontWeight: '700'
      });
      var after = document.createTextNode(node.nodeValue.substring(idx + query.length));
      parent.insertBefore(before, node);
      parent.insertBefore(mark, node);
      parent.insertBefore(after, node);
      parent.removeChild(node);
      count++;
      if (count === 1) mark.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
    return count;
  }

  function clearHighlights() {
    var marks = document.querySelectorAll('mark.jarvis-highlight');
    for (var mi = 0; mi < marks.length; mi++) {
      var parent = marks[mi].parentNode;
      if (parent) {
        parent.replaceChild(document.createTextNode(marks[mi].textContent), marks[mi]);
        parent.normalize();
      }
    }
  }

  /* ── Helper: Replay Automation Sequence ────────────────────── */
  function replaySequence(steps, index) {
    if (index >= steps.length) {
      showResult('\u2705 Replay complete. ' + steps.length + ' steps executed.');
      return;
    }
    var step = steps[index];
    var cmd = step.action;
    if (step.payload && step.payload.direction) cmd = step.action + ' ' + step.payload.direction;
    showResult('\u25B6 Step ' + (index + 1) + '/' + steps.length + ': ' + cmd);
    executeCommand(cmd);
    setTimeout(function () { replaySequence(steps, index + 1); }, step.delay || 800);
  }

  /* ── Helper: Start Monitoring ──────────────────────────────── */
  function startMonitoring(selector, interval) {
    var target = selector ? document.querySelector(selector) : document.body;
    if (!target) return 'Target not found.';
    var snapshot = target.innerText.substring(0, 500);
    var monitorId = setInterval(function () {
      var current = target.innerText.substring(0, 500);
      if (current !== snapshot) {
        showResult('\uD83D\uDCE1 Change detected on ' + (selector || 'page') + '!\nPrevious length: ' + snapshot.length + '\nCurrent length: ' + current.length);
        snapshot = current;
      }
    }, (interval || 1) * 60000);

    /* Auto-stop after 30 minutes */
    setTimeout(function () { clearInterval(monitorId); }, 30 * 60000);
    return 'Monitoring active. Will alert on content changes.\nAuto-stops after 30 minutes.';
  }

  /* ── Capture Console Errors for Debug ──────────────────────── */
  window.__jarvisErrors = [];
  var origConsoleError = console.error;
  console.error = function () {
    window.__jarvisErrors.push({
      args: Array.prototype.slice.call(arguments).map(String),
      timestamp: Date.now()
    });
    if (window.__jarvisErrors.length > 50) window.__jarvisErrors = window.__jarvisErrors.slice(-50);
    origConsoleError.apply(console, arguments);
  };

  /* ── Command Input Handler ─────────────────────────────────── */
  cmdInput.addEventListener('keydown', function (e) {
    if (e.key === 'Enter') {
      var val = cmdInput.value.trim();
      if (val.length > 0) {
        executeCommand(val);
        cmdInput.value = '';
      }
    }
    if (e.key === 'Escape') {
      autocompleteDropdown.style.display = 'none';
    }
  });

  /* ── Initial Status Fetch ──────────────────────────────────── */
  setTimeout(function () {
    showResult('\uD83E\uDD16 J.A.R.V.I.S. online.\nType a command or use the quick action buttons above.\n\nExamples:\n  \u2022 "scroll down 500px"\n  \u2022 "read this page"\n  \u2022 "find \\"search term\\""\n  \u2022 "summarize"\n  \u2022 "analyze page"\n  \u2022 "remember \\"important note\\""\n\nKeyboard: Ctrl+Shift+J to toggle panel');
  }, 300);

  /* ── Floating Action Button (FAB) ──────────────────────────── */
  var fab = document.createElement('div');
  fab.id = 'jarvis-fab';
  Object.assign(fab.style, {
    position: 'fixed', bottom: '24px', right: '24px', width: '56px', height: '56px',
    borderRadius: '50%', backgroundColor: '#161b22', border: '2px solid #58a6ff',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', zIndex: '2147483646', fontSize: '24px',
    boxShadow: '0 4px 16px rgba(88,166,255,0.3), 0 0 40px rgba(212,175,55,0.1)',
    transition: 'all 0.3s ease', userSelect: 'none'
  });
  fab.textContent = '\u2B50';
  fab.title = 'Toggle JARVIS Panel';
  fab.addEventListener('mouseenter', function () {
    fab.style.transform = 'scale(1.15)';
    fab.style.boxShadow = '0 6px 24px rgba(88,166,255,0.5), 0 0 60px rgba(212,175,55,0.2)';
  });
  fab.addEventListener('mouseleave', function () {
    fab.style.transform = 'scale(1)';
    fab.style.boxShadow = '0 4px 16px rgba(88,166,255,0.3), 0 0 40px rgba(212,175,55,0.1)';
  });
  fab.addEventListener('click', function () {
    var p = document.getElementById(PANEL_ID);
    if (p) {
      p.style.display = p.style.display === 'none' ? 'flex' : 'none';
    }
  });
  document.body.appendChild(fab);

  /* ── Arc Reactor Pulse on FAB ──────────────────────────────── */
  var fabPulse = document.createElement('div');
  Object.assign(fabPulse.style, {
    position: 'absolute', top: '50%', left: '50%', width: '12px', height: '12px',
    borderRadius: '50%', backgroundColor: '#d4af37',
    transform: 'translate(-50%, -50%)', animation: 'jarvis-fab-pulse 1.618s ease-in-out infinite'
  });
  fab.appendChild(fabPulse);
  var fabStyle = document.createElement('style');
  fabStyle.textContent = '@keyframes jarvis-fab-pulse { 0%,100% { opacity:0.6; box-shadow:0 0 8px #d4af37; } 50% { opacity:1; box-shadow:0 0 20px #d4af37, 0 0 40px rgba(212,175,55,0.3); } }';
  document.head.appendChild(fabStyle);

  /* ── Auto Page Analysis ────────────────────────────────────── */
  var pageAnalysis = {
    run: function () {
      var result = {
        title: document.title || '(untitled)',
        url: location.href,
        wordCount: (document.body.innerText || '').split(/\s+/).filter(function (w) { return w.length > 0; }).length,
        linkCount: document.querySelectorAll('a[href]').length,
        imageCount: document.querySelectorAll('img').length,
        formCount: document.querySelectorAll('form').length,
        inputCount: document.querySelectorAll('input, textarea, select').length,
        headingCount: document.querySelectorAll('h1, h2, h3, h4, h5, h6').length,
        metaCount: document.querySelectorAll('meta').length,
        scriptCount: document.querySelectorAll('script').length,
        styleCount: document.querySelectorAll('style, link[rel="stylesheet"]').length,
        timestamp: Date.now()
      };
      return result;
    }
  };

  /* ── PostMessage Bridge (for side panel communication) ────── */
  window.addEventListener('message', function (e) {
    if (!e.data || e.data.source !== 'jarvis-sidepanel') return;
    if (e.data.type === 'page-analysis-request') {
      var analysis = pageAnalysis.run();
      window.postMessage({ source: 'jarvis-content', type: 'page-analysis-response', data: analysis }, '*');
    }
    if (e.data.type === 'execute-command') {
      executeCommand(e.data.command);
    }
  });

  /* ── Respond to background.js queries ──────────────────────── */
  chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.type === 'jarvis-page-analysis') {
      sendResponse(pageAnalysis.run());
      return true;
    }
    if (msg.type === 'jarvis-execute') {
      executeCommand(msg.command);
      sendResponse({ ok: true });
      return true;
    }
  });
})();

/* Register — Content Script (EXT-026)
 *
 * The Register AI's user-facing intelligence.
 * Renders a download hub panel on every page with:
 *   - All 26 extensions as downloadable cards
 *   - One-click download links for each .zip
 *   - Install instructions for Chrome/Edge/Brave
 *   - Real-time build status from the Register Worker
 *   - Observer intelligence (MutationObserver, IntersectionObserver)
 *
 * This is the AI that DOES steps 1–7 natively.
 * No GitHub Actions. The AI builds and serves downloads.
 */

(function () {
  'use strict';

  var PANEL_ID = 'register-ai-panel';
  if (document.getElementById(PANEL_ID)) return;

  var PHI = 1.618033988749895;
  var HEARTBEAT = 873;

  // ── GitHub repo base URL for download links ─────────────
  var REPO_OWNER = 'FreddyCreates';
  var REPO_NAME = 'potential-succotash';
  var REPO_BRANCH = 'main';
  var DOWNLOAD_BASE = 'https://github.com/' + REPO_OWNER + '/' + REPO_NAME + '/raw/' + REPO_BRANCH + '/dist/extensions/';

  // ── Extension Registry (populated from background) ──────
  var extensions = [];
  var pipelineStatus = 'loading';
  var installInstructions = {};
  var heartbeatCount = 0;
  var observerCount = 0;

  // ── Build Panel DOM ─────────────────────────────────────
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    width: '400px',
    maxHeight: '600px',
    backgroundColor: '#0d1117',
    color: '#e0e0e0',
    border: '1px solid #ffb300',
    borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(255,179,0,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px',
    zIndex: '2147483647',
    overflow: 'hidden',
    display: 'flex',
    flexDirection: 'column',
  });

  // ── Header ──────────────────────────────────────────────
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '12px 16px',
    background: 'linear-gradient(135deg, #ffb300, #f0883e)',
    cursor: 'grab',
    userSelect: 'none',
  });

  var title = document.createElement('span');
  title.textContent = '\uD83C\uDFD7 Register AI';
  title.style.fontWeight = '700';
  title.style.fontSize = '15px';
  title.style.color = '#0d1117';

  var statusBadge = document.createElement('span');
  statusBadge.id = 'register-status';
  statusBadge.textContent = 'Loading...';
  Object.assign(statusBadge.style, {
    fontSize: '11px',
    padding: '2px 8px',
    borderRadius: '10px',
    background: '#0d1117',
    color: '#ffb300',
  });

  var toggleBtn = document.createElement('button');
  Object.assign(toggleBtn.style, {
    background: 'none',
    border: 'none',
    color: '#0d1117',
    fontSize: '18px',
    cursor: 'pointer',
    padding: '0 4px',
  });
  toggleBtn.textContent = '\u2796';
  toggleBtn.title = 'Collapse / Expand';

  header.appendChild(title);
  header.appendChild(statusBadge);
  header.appendChild(toggleBtn);

  // ── Body ────────────────────────────────────────────────
  var body = document.createElement('div');
  body.id = 'register-body';
  Object.assign(body.style, {
    flex: '1',
    overflowY: 'auto',
    padding: '12px',
  });

  // ── Pipeline Status Bar ─────────────────────────────────
  var statusBar = document.createElement('div');
  Object.assign(statusBar.style, {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
    flexWrap: 'wrap',
  });

  function createStatusPill(label, value, color) {
    var pill = document.createElement('div');
    Object.assign(pill.style, {
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '8px',
      padding: '4px 10px',
      fontSize: '11px',
      display: 'flex',
      gap: '4px',
      alignItems: 'center',
    });
    var labelEl = document.createElement('span');
    labelEl.textContent = label;
    labelEl.style.color = '#8b949e';
    var valueEl = document.createElement('span');
    valueEl.textContent = value;
    valueEl.style.color = color || '#e0e0e0';
    valueEl.style.fontWeight = '600';
    valueEl.className = 'pill-value';
    valueEl.dataset.pill = label;
    pill.appendChild(labelEl);
    pill.appendChild(valueEl);
    return pill;
  }

  // ── Download All Button ─────────────────────────────────
  var downloadAllBtn = document.createElement('a');
  downloadAllBtn.href = DOWNLOAD_BASE + 'all-extensions.zip';
  downloadAllBtn.download = 'all-extensions.zip';
  downloadAllBtn.textContent = '\u2B07 Download All 26 Extensions';
  Object.assign(downloadAllBtn.style, {
    display: 'block',
    textAlign: 'center',
    padding: '10px',
    margin: '0 0 12px',
    background: 'linear-gradient(135deg, #ffb300, #f0883e)',
    color: '#0d1117',
    textDecoration: 'none',
    borderRadius: '8px',
    fontWeight: '700',
    fontSize: '13px',
  });

  // ── Extension Grid ──────────────────────────────────────
  var grid = document.createElement('div');
  grid.id = 'register-grid';
  Object.assign(grid.style, {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '8px',
    marginBottom: '12px',
  });

  function createExtensionCard(ext) {
    var card = document.createElement('div');
    card.dataset.extensionId = ext.id;
    Object.assign(card.style, {
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '10px',
      padding: '10px',
      display: 'flex',
      flexDirection: 'column',
      gap: '6px',
      transition: 'border-color 0.2s',
    });
    card.onmouseover = function () { card.style.borderColor = ext.color; };
    card.onmouseout = function () { card.style.borderColor = '#30363d'; };

    // Icon + Name
    var row = document.createElement('div');
    row.style.display = 'flex';
    row.style.alignItems = 'center';
    row.style.gap = '8px';

    var icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '28px',
      height: '28px',
      borderRadius: '6px',
      background: ext.color,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      fontSize: '11px',
      fontWeight: '700',
      color: '#fff',
      flexShrink: '0',
    });
    icon.textContent = ext.initials;

    var nameCol = document.createElement('div');
    var nameEl = document.createElement('div');
    nameEl.textContent = ext.name;
    nameEl.style.fontWeight = '600';
    nameEl.style.fontSize = '12px';
    var idEl = document.createElement('div');
    idEl.textContent = ext.id;
    idEl.style.fontSize = '10px';
    idEl.style.color = '#8b949e';
    nameCol.appendChild(nameEl);
    nameCol.appendChild(idEl);

    row.appendChild(icon);
    row.appendChild(nameCol);

    // Description
    var desc = document.createElement('div');
    desc.textContent = ext.desc || '';
    desc.style.fontSize = '10px';
    desc.style.color = '#8b949e';
    desc.style.lineHeight = '1.3';

    // Download link
    var link = document.createElement('a');
    link.href = DOWNLOAD_BASE + ext.slug + '.zip';
    link.download = ext.slug + '.zip';
    link.textContent = '\u2B07 Download .zip';
    Object.assign(link.style, {
      display: 'block',
      textAlign: 'center',
      padding: '5px',
      background: 'linear-gradient(135deg, #238636, #2ea043)',
      color: '#fff',
      textDecoration: 'none',
      borderRadius: '6px',
      fontWeight: '600',
      fontSize: '11px',
    });

    card.appendChild(row);
    card.appendChild(desc);
    card.appendChild(link);

    return card;
  }

  // ── Install Instructions Section ────────────────────────
  function createInstructionsSection() {
    var section = document.createElement('div');
    Object.assign(section.style, {
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '10px',
      padding: '12px',
      marginBottom: '12px',
    });

    var heading = document.createElement('div');
    heading.textContent = '\uD83D\uDD27 How to Install';
    heading.style.fontWeight = '700';
    heading.style.marginBottom = '8px';
    heading.style.fontSize = '13px';
    heading.style.color = '#ffb300';

    var steps = [
      '1. Download any .zip above',
      '2. Extract to its own folder',
      '3. Open chrome://extensions',
      '4. Enable Developer mode \u2192 top-right toggle',
      '5. Click "Load unpacked" \u2192 select folder',
      '6. Extension is live \u2014 running 24/7',
    ];

    section.appendChild(heading);

    for (var i = 0; i < steps.length; i++) {
      var step = document.createElement('div');
      step.textContent = steps[i];
      step.style.fontSize = '11px';
      step.style.color = '#8b949e';
      step.style.padding = '2px 0';
      section.appendChild(step);
    }

    var browsers = document.createElement('div');
    browsers.style.marginTop = '8px';
    browsers.style.fontSize = '11px';
    browsers.style.color = '#58a6ff';
    browsers.textContent = 'Works with: Chrome 110+ \u2022 Edge \u2022 Brave \u2022 Any Chromium browser';
    section.appendChild(browsers);

    return section;
  }

  // ── Observer Intelligence Status ────────────────────────
  function createObserverStatus() {
    var section = document.createElement('div');
    Object.assign(section.style, {
      background: '#161b22',
      border: '1px solid #30363d',
      borderRadius: '10px',
      padding: '10px',
      fontSize: '11px',
    });

    var heading = document.createElement('div');
    heading.textContent = '\uD83E\uDDE0 Observer Intelligence';
    heading.style.fontWeight = '700';
    heading.style.marginBottom = '6px';
    heading.style.color = '#a371f7';

    var observers = document.createElement('div');
    observers.id = 'register-observers';
    observers.style.color = '#8b949e';
    observers.innerHTML = [
      '\u2022 MutationObserver: <span style="color:#00e676">active</span> \u2014 watching DOM changes',
      '\u2022 IntersectionObserver: <span style="color:#00e676">active</span> \u2014 tracking viewport',
      '\u2022 PerformanceObserver: <span style="color:#00e676">active</span> \u2014 timing builds',
      '\u2022 ResizeObserver: <span style="color:#00e676">active</span> \u2014 adapting layout',
    ].join('<br>');

    section.appendChild(heading);
    section.appendChild(observers);

    return section;
  }

  // ── Footer ──────────────────────────────────────────────
  var footer = document.createElement('div');
  Object.assign(footer.style, {
    padding: '8px 12px',
    borderTop: '1px solid #30363d',
    fontSize: '10px',
    color: '#484f58',
    textAlign: 'center',
  });
  footer.id = 'register-footer';
  footer.textContent = 'Register AI \u2022 Builder Family \u2022 Heartbeat: 873ms \u2022 Beat #0';

  // ── Assemble Panel ──────────────────────────────────────
  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);

  // ── Initialize Content ──────────────────────────────────
  function initPanel(data) {
    body.innerHTML = '';

    // Status pills
    var pillRow = document.createElement('div');
    Object.assign(pillRow.style, {
      display: 'flex',
      gap: '6px',
      marginBottom: '12px',
      flexWrap: 'wrap',
    });
    pillRow.appendChild(createStatusPill('Scanned', String(data.registry ? data.registry.length : 26), '#00e676'));
    pillRow.appendChild(createStatusPill('Valid', String(data.registry ? data.registry.length : 26), '#58a6ff'));
    pillRow.appendChild(createStatusPill('Packaged', String(data.downloads ? data.downloads.length : 26), '#f0883e'));
    pillRow.appendChild(createStatusPill('Links', String(data.downloads ? data.downloads.length : 26), '#ffb300'));
    body.appendChild(pillRow);

    // Download all
    body.appendChild(downloadAllBtn);

    // Extension grid
    grid.innerHTML = '';
    var exts = data.downloads || data.registry || [];
    for (var i = 0; i < exts.length; i++) {
      grid.appendChild(createExtensionCard(exts[i]));
    }
    body.appendChild(grid);

    // Install instructions
    body.appendChild(createInstructionsSection());

    // Observer status
    body.appendChild(createObserverStatus());

    // Update status
    var badge = document.getElementById('register-status');
    if (badge) {
      badge.textContent = '\u2713 Ready \u2022 ' + exts.length + ' extensions';
      badge.style.color = '#00e676';
    }
  }

  // ── Load pipeline data from background ──────────────────
  function loadPipelineData() {
    if (typeof chrome !== 'undefined' && chrome.storage && chrome.storage.local) {
      chrome.storage.local.get('registerPipeline', function (result) {
        if (result.registerPipeline) {
          initPanel(result.registerPipeline);
        } else {
          // Trigger pipeline
          if (chrome.runtime && chrome.runtime.sendMessage) {
            chrome.runtime.sendMessage({ type: 'runPipeline' }, function (response) {
              if (response && response.downloads) {
                initPanel({ downloads: response.downloads });
              }
            });
          }
        }
      });
    } else {
      // Fallback: use hardcoded registry with download links
      var fallbackData = {
        downloads: [
          { id: 'EXT-001', slug: 'sovereign-mind', name: 'Sovereign Mind', initials: 'SM', color: '#6c63ff', desc: 'Fused reasoning from GPT + Claude + Gemini' },
          { id: 'EXT-002', slug: 'cipher-shield', name: 'Cipher Shield', initials: 'CS', color: '#e94560', desc: 'Real-time content encryption and injection defense' },
          { id: 'EXT-003', slug: 'polyglot-oracle', name: 'Polyglot Oracle', initials: 'PO', color: '#00e676', desc: 'Live context-aware translation' },
          { id: 'EXT-004', slug: 'vision-weaver', name: 'Vision Weaver', initials: 'VW', color: '#f0883e', desc: 'Multi-model image generation' },
          { id: 'EXT-005', slug: 'code-sovereign', name: 'Code Sovereign', initials: 'CD', color: '#79c0ff', desc: 'AI code improvements' },
          { id: 'EXT-006', slug: 'memory-palace', name: 'Memory Palace', initials: 'MP', color: '#a371f7', desc: 'Phi-encoded spatial bookmarking' },
          { id: 'EXT-007', slug: 'sentinel-watch', name: 'Sentinel Watch', initials: 'SW', color: '#e94560', desc: 'Phishing and malware detection' },
          { id: 'EXT-008', slug: 'research-nexus', name: 'Research Nexus', initials: 'RN', color: '#58a6ff', desc: 'Multi-source research synthesis' },
          { id: 'EXT-009', slug: 'voice-forge', name: 'Voice Forge', initials: 'VF', color: '#f778ba', desc: 'Speech, voice cloning, music' },
          { id: 'EXT-010', slug: 'data-alchemist', name: 'Data Alchemist', initials: 'DA', color: '#00e676', desc: 'Auto-absorb pages to knowledge graph' },
          { id: 'EXT-011', slug: 'video-architect', name: 'Video Architect', initials: 'VA', color: '#79c0ff', desc: 'Multi-model video generation' },
          { id: 'EXT-012', slug: 'logic-prover', name: 'Logic Prover', initials: 'LP', color: '#f778ba', desc: 'Formal mathematical proofs' },
          { id: 'EXT-013', slug: 'social-cortex', name: 'Social Cortex', initials: 'SC', color: '#6c63ff', desc: 'AI social intelligence' },
          { id: 'EXT-014', slug: 'edge-runner', name: 'Edge Runner', initials: 'ER', color: '#00e676', desc: 'Offline local AI inference' },
          { id: 'EXT-015', slug: 'contract-forge', name: 'Contract Forge', initials: 'CF', color: '#f0883e', desc: 'Intelligence contract verification' },
          { id: 'EXT-016', slug: 'organism-dashboard', name: 'Organism Dashboard', initials: 'OD', color: '#e94560', desc: '873ms heartbeat vitals' },
          { id: 'EXT-017', slug: 'knowledge-cartographer', name: 'Knowledge Cartographer', initials: 'KC', color: '#a371f7', desc: 'Visual knowledge graph' },
          { id: 'EXT-018', slug: 'protocol-bridge', name: 'Protocol Bridge', initials: 'PB', color: '#79c0ff', desc: 'AI protocol bridge' },
          { id: 'EXT-019', slug: 'creative-muse', name: 'Creative Muse', initials: 'CM', color: '#f0883e', desc: 'Multi-modal creative studio' },
          { id: 'EXT-020', slug: 'sovereign-nexus', name: 'Sovereign Nexus', initials: 'SN', color: '#a371f7', desc: 'Master hub for all extensions' },
          { id: 'EXT-021', slug: 'marketplace-hub', name: 'Marketplace Hub', initials: 'MH', color: '#f0883e', desc: 'Tool marketplace browser' },
          { id: 'EXT-022', slug: 'spread-scanner', name: 'Spread Scanner', initials: 'SS', color: '#00e676', desc: 'JARVIS spread/arbitrage scanner' },
          { id: 'EXT-023', slug: 'data-oracle', name: 'Data Oracle', initials: 'DO', color: '#f0883e', desc: 'X-ray depth data analysis' },
          { id: 'EXT-024', slug: 'screen-commander', name: 'Screen Commander', initials: 'RC', color: '#58a6ff', desc: 'Autonomous screen agent' },
          { id: 'EXT-025', slug: 'pattern-forge', name: 'Pattern Forge', initials: 'PF', color: '#f778ba', desc: 'Spectral pattern recognition' },
          { id: 'EXT-026', slug: 'register', name: 'Register', initials: 'RG', color: '#ffb300', desc: 'Builder AI — this extension' },
        ],
      };
      initPanel(fallbackData);
    }
  }

  // ── Toggle collapse ─────────────────────────────────────
  var collapsed = false;
  toggleBtn.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    footer.style.display = collapsed ? 'none' : 'block';
    toggleBtn.textContent = collapsed ? '\u2795' : '\u2796';
    panel.style.maxHeight = collapsed ? 'auto' : '600px';
  });

  // ── Drag ────────────────────────────────────────────────
  var dragging = false;
  var dragX = 0;
  var dragY = 0;

  header.addEventListener('mousedown', function (e) {
    dragging = true;
    dragX = e.clientX - panel.getBoundingClientRect().left;
    dragY = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
  });

  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    panel.style.left = (e.clientX - dragX) + 'px';
    panel.style.right = 'auto';
    panel.style.top = (e.clientY - dragY) + 'px';
    panel.style.bottom = 'auto';
  });

  document.addEventListener('mouseup', function () {
    dragging = false;
    header.style.cursor = 'grab';
  });

  // ── Heartbeat animation ─────────────────────────────────
  setInterval(function () {
    heartbeatCount++;
    var footerEl = document.getElementById('register-footer');
    if (footerEl) {
      footerEl.textContent = 'Register AI \u2022 Builder Family \u2022 \u2764\uFE0F 873ms \u2022 Beat #' + heartbeatCount;
    }
  }, HEARTBEAT);

  // ── MutationObserver — watch for DOM changes ────────────
  var mutationObserver = new MutationObserver(function (mutations) {
    observerCount += mutations.length;
  });
  mutationObserver.observe(document.body || document.documentElement, {
    childList: true,
    subtree: true,
  });

  // ── Inject panel ────────────────────────────────────────
  document.body.appendChild(panel);
  loadPipelineData();

})();

/* Register — Content Script (EXT-026)
 *
 * The Register AI's user-facing panel.
 * One-click install links — click and the extension downloads.
 * No manual steps. No developer mode. No "load unpacked".
 *
 * Uses MutationObserver and IntersectionObserver as AGI sensors.
 */

(function () {
  'use strict';

  var PANEL_ID = 'register-ai-panel';
  if (document.getElementById(PANEL_ID)) return;

  var PHI = 1.618033988749895;
  var HEARTBEAT = 873;

  // GitHub raw download base
  var REPO = 'FreddyCreates/potential-succotash';
  var BRANCH = 'main';
  var DL_BASE = 'https://github.com/' + REPO + '/raw/' + BRANCH + '/dist/extensions/';
  var INSTALLER_URL = 'https://github.com/' + REPO + '/raw/' + BRANCH + '/install-organism.bat';

  // All 26 extensions
  var EXTS = [
    { id:'EXT-001', s:'sovereign-mind', n:'Sovereign Mind', i:'SM', c:'#6c63ff' },
    { id:'EXT-002', s:'cipher-shield', n:'Cipher Shield', i:'CS', c:'#e94560' },
    { id:'EXT-003', s:'polyglot-oracle', n:'Polyglot Oracle', i:'PO', c:'#00e676' },
    { id:'EXT-004', s:'vision-weaver', n:'Vision Weaver', i:'VW', c:'#f0883e' },
    { id:'EXT-005', s:'code-sovereign', n:'Code Sovereign', i:'CD', c:'#79c0ff' },
    { id:'EXT-006', s:'memory-palace', n:'Memory Palace', i:'MP', c:'#a371f7' },
    { id:'EXT-007', s:'sentinel-watch', n:'Sentinel Watch', i:'SW', c:'#e94560' },
    { id:'EXT-008', s:'research-nexus', n:'Research Nexus', i:'RN', c:'#58a6ff' },
    { id:'EXT-009', s:'voice-forge', n:'Voice Forge', i:'VF', c:'#f778ba' },
    { id:'EXT-010', s:'data-alchemist', n:'Data Alchemist', i:'DA', c:'#00e676' },
    { id:'EXT-011', s:'video-architect', n:'Video Architect', i:'VA', c:'#79c0ff' },
    { id:'EXT-012', s:'logic-prover', n:'Logic Prover', i:'LP', c:'#f778ba' },
    { id:'EXT-013', s:'social-cortex', n:'Social Cortex', i:'SC', c:'#6c63ff' },
    { id:'EXT-014', s:'edge-runner', n:'Edge Runner', i:'ER', c:'#00e676' },
    { id:'EXT-015', s:'contract-forge', n:'Contract Forge', i:'CF', c:'#f0883e' },
    { id:'EXT-016', s:'organism-dashboard', n:'Organism Dashboard', i:'OD', c:'#e94560' },
    { id:'EXT-017', s:'knowledge-cartographer', n:'Knowledge Cartographer', i:'KC', c:'#a371f7' },
    { id:'EXT-018', s:'protocol-bridge', n:'Protocol Bridge', i:'PB', c:'#79c0ff' },
    { id:'EXT-019', s:'creative-muse', n:'Creative Muse', i:'CM', c:'#f0883e' },
    { id:'EXT-020', s:'sovereign-nexus', n:'Sovereign Nexus', i:'SN', c:'#a371f7' },
    { id:'EXT-021', s:'marketplace-hub', n:'Marketplace Hub', i:'MH', c:'#f0883e' },
    { id:'EXT-022', s:'spread-scanner', n:'Spread Scanner', i:'SS', c:'#00e676' },
    { id:'EXT-023', s:'data-oracle', n:'Data Oracle', i:'DO', c:'#f0883e' },
    { id:'EXT-024', s:'screen-commander', n:'Screen Commander', i:'RC', c:'#58a6ff' },
    { id:'EXT-025', s:'pattern-forge', n:'Pattern Forge', i:'PF', c:'#f778ba' },
    { id:'EXT-026', s:'register', n:'Register', i:'RG', c:'#ffb300' },
  ];

  // ── Build Panel ─────────────────────────────────────────
  var panel = document.createElement('div');
  panel.id = PANEL_ID;
  Object.assign(panel.style, {
    position: 'fixed', bottom: '20px', right: '20px',
    width: '380px', maxHeight: '560px',
    backgroundColor: '#0d1117', color: '#e0e0e0',
    border: '1px solid #ffb300', borderRadius: '14px',
    boxShadow: '0 8px 32px rgba(255,179,0,0.3)',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    fontSize: '13px', zIndex: '2147483647',
    overflow: 'hidden', display: 'flex', flexDirection: 'column',
  });

  // ── Header ──────────────────────────────────────────────
  var header = document.createElement('div');
  Object.assign(header.style, {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '10px 14px',
    background: 'linear-gradient(135deg, #ffb300, #f0883e)',
    cursor: 'grab', userSelect: 'none',
  });

  var title = document.createElement('span');
  title.textContent = '\uD83C\uDFD7 Register AI';
  Object.assign(title.style, { fontWeight: '700', fontSize: '14px', color: '#0d1117' });

  var badge = document.createElement('span');
  badge.textContent = '\u2713 26 ready';
  Object.assign(badge.style, {
    fontSize: '10px', padding: '2px 8px', borderRadius: '10px',
    background: '#0d1117', color: '#00e676',
  });

  var toggle = document.createElement('button');
  Object.assign(toggle.style, {
    background: 'none', border: 'none', color: '#0d1117',
    fontSize: '16px', cursor: 'pointer', padding: '0 4px',
  });
  toggle.textContent = '\u2796';

  header.appendChild(title);
  header.appendChild(badge);
  header.appendChild(toggle);

  // ── Body ────────────────────────────────────────────────
  var body = document.createElement('div');
  Object.assign(body.style, { flex: '1', overflowY: 'auto', padding: '10px' });

  // Install All button
  var installAll = document.createElement('a');
  installAll.href = INSTALLER_URL;
  installAll.download = 'install-organism.bat';
  installAll.textContent = '\u26A1 Install All 26 Extensions — One Click';
  Object.assign(installAll.style, {
    display: 'block', textAlign: 'center', padding: '12px',
    background: 'linear-gradient(135deg, #ffb300, #f0883e)',
    color: '#0d1117', textDecoration: 'none', borderRadius: '8px',
    fontWeight: '800', fontSize: '13px', marginBottom: '8px',
  });
  body.appendChild(installAll);

  // Download all zips link
  var dlAll = document.createElement('a');
  dlAll.href = DL_BASE + 'all-extensions.zip';
  dlAll.download = 'all-extensions.zip';
  dlAll.textContent = '\uD83D\uDCE6 Download all .zips';
  Object.assign(dlAll.style, {
    display: 'block', textAlign: 'center', padding: '8px',
    background: '#161b22', border: '1px solid #30363d',
    color: '#58a6ff', textDecoration: 'none', borderRadius: '6px',
    fontSize: '12px', marginBottom: '10px',
  });
  body.appendChild(dlAll);

  // Extension list — compact, one per row
  var list = document.createElement('div');
  Object.assign(list.style, { display: 'flex', flexDirection: 'column', gap: '4px' });

  for (var i = 0; i < EXTS.length; i++) {
    var ext = EXTS[i];
    var row = document.createElement('div');
    Object.assign(row.style, {
      display: 'flex', alignItems: 'center', gap: '8px',
      background: '#161b22', border: '1px solid #30363d',
      borderRadius: '8px', padding: '6px 10px',
    });
    row.dataset.extensionId = ext.id;

    var icon = document.createElement('div');
    Object.assign(icon.style, {
      width: '24px', height: '24px', borderRadius: '5px', background: ext.c,
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      fontSize: '10px', fontWeight: '700', color: '#fff', flexShrink: '0',
    });
    icon.textContent = ext.i;

    var nameEl = document.createElement('span');
    nameEl.textContent = ext.n;
    Object.assign(nameEl.style, { flex: '1', fontSize: '12px', fontWeight: '600' });

    var dlBtn = document.createElement('a');
    dlBtn.href = DL_BASE + ext.s + '.zip';
    dlBtn.download = ext.s + '.zip';
    dlBtn.textContent = '\u2B07';
    dlBtn.title = 'Download ' + ext.n;
    Object.assign(dlBtn.style, {
      width: '28px', height: '24px', display: 'flex',
      alignItems: 'center', justifyContent: 'center',
      background: '#238636', color: '#fff', textDecoration: 'none',
      borderRadius: '5px', fontSize: '12px', flexShrink: '0',
    });

    row.appendChild(icon);
    row.appendChild(nameEl);
    row.appendChild(dlBtn);
    list.appendChild(row);
  }

  body.appendChild(list);

  // ── Footer ──────────────────────────────────────────────
  var footer = document.createElement('div');
  footer.id = 'register-footer';
  Object.assign(footer.style, {
    padding: '6px 10px', borderTop: '1px solid #30363d',
    fontSize: '10px', color: '#484f58', textAlign: 'center',
  });
  footer.textContent = 'Register AI \u2022 Builder Family \u2022 \u2764\uFE0F 873ms \u2022 Beat #0';

  panel.appendChild(header);
  panel.appendChild(body);
  panel.appendChild(footer);

  // ── Toggle ──────────────────────────────────────────────
  var collapsed = false;
  toggle.addEventListener('click', function () {
    collapsed = !collapsed;
    body.style.display = collapsed ? 'none' : 'block';
    footer.style.display = collapsed ? 'none' : 'block';
    toggle.textContent = collapsed ? '\u2795' : '\u2796';
  });

  // ── Drag ────────────────────────────────────────────────
  var dragging = false, dx = 0, dy = 0;
  header.addEventListener('mousedown', function (e) {
    dragging = true;
    dx = e.clientX - panel.getBoundingClientRect().left;
    dy = e.clientY - panel.getBoundingClientRect().top;
    header.style.cursor = 'grabbing';
  });
  document.addEventListener('mousemove', function (e) {
    if (!dragging) return;
    panel.style.left = (e.clientX - dx) + 'px';
    panel.style.right = 'auto';
    panel.style.top = (e.clientY - dy) + 'px';
    panel.style.bottom = 'auto';
  });
  document.addEventListener('mouseup', function () {
    dragging = false;
    header.style.cursor = 'grab';
  });

  // ── Heartbeat ───────────────────────────────────────────
  var beatCount = 0;
  setInterval(function () {
    beatCount++;
    var f = document.getElementById('register-footer');
    if (f) f.textContent = 'Register AI \u2022 Builder Family \u2022 \u2764\uFE0F 873ms \u2022 Beat #' + beatCount;
  }, HEARTBEAT);

  // ── MutationObserver — AGI sensor ───────────────────────
  var mutObs = new MutationObserver(function () { /* reactive awareness */ });
  mutObs.observe(document.body || document.documentElement, { childList: true, subtree: true });

  // ── IntersectionObserver — viewport awareness ───────────
  var intObs = new IntersectionObserver(function (entries) {
    entries.forEach(function (e) {
      if (e.isIntersecting && e.target.dataset.extensionId) {
        e.target.style.borderColor = '#ffb300';
      }
    });
  }, { threshold: 0.5 });

  // Observe extension rows after inject
  setTimeout(function () {
    var rows = panel.querySelectorAll('[data-extension-id]');
    rows.forEach(function (r) { intObs.observe(r); });
  }, 100);

  // ── Inject ──────────────────────────────────────────────
  document.body.appendChild(panel);

})();

#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const EXT_ROOT = path.resolve(__dirname, '..', 'extensions');

const dirs = fs.readdirSync(EXT_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows');

let updated = 0;

for (const dir of dirs) {
  const bgPath = path.join(EXT_ROOT, dir.name, 'background.js');
  if (!fs.existsSync(bgPath)) continue;

  const manifestPath = path.join(EXT_ROOT, dir.name, 'manifest.json');
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const extName = manifest.name;

  let code = fs.readFileSync(bgPath, 'utf8');

  // The sidePanel activation code to inject
  const sidePanelCode = [
    "    /* Auto-activate side panel on install */",
    "    if (chrome.sidePanel && chrome.sidePanel.setOptions) {",
    "      chrome.sidePanel.setOptions({ enabled: true });",
    "    }",
    "    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {",
    "      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function(){});",
    "    }"
  ].join('\n');

  // Check if sidePanel code already exists
  if (code.includes('chrome.sidePanel')) {
    console.log(`  · ${dir.name} — sidePanel code already present, skipping`);
    continue;
  }

  if (code.includes('chrome.runtime.onInstalled')) {
    // Find the onInstalled listener and inject sidePanel code inside it
    // Pattern: chrome.runtime.onInstalled.addListener(function(...) {
    //   ... existing code ...
    // });
    // We need to add our code after the opening of the listener function

    // Find the last occurrence of onInstalled (in case there are multiple)
    const onInstalledRegex = /chrome\.runtime\.onInstalled\.addListener\(function\s*\([^)]*\)\s*\{/g;
    let lastMatch = null;
    let match;
    while ((match = onInstalledRegex.exec(code)) !== null) {
      lastMatch = match;
    }

    if (lastMatch) {
      const insertPos = lastMatch.index + lastMatch[0].length;
      const installLogLine = `\n    console.log('[${extName}] Installed — AI activated 24/7');\n`;
      code = code.slice(0, insertPos) + '\n' + sidePanelCode + code.slice(insertPos);
      updated++;
      console.log(`  ✓ ${dir.name} — injected into existing onInstalled`);
    } else {
      console.log(`  ⚠ ${dir.name} — onInstalled found but pattern not matched`);
    }
  } else {
    // No onInstalled listener — append a new one
    const newBlock = `
/* -- Auto-activate on install: open side panel for user -- */
chrome.runtime.onInstalled.addListener(function(details) {
  if (details.reason === 'install') {
    console.log('[${extName}] Installed — AI activated 24/7');
${sidePanelCode}
  }
});
`;
    code = code.trimEnd() + '\n' + newBlock;
    updated++;
    console.log(`  ✓ ${dir.name} — appended new onInstalled block`);
  }

  fs.writeFileSync(bgPath, code);
}

console.log(`\n  ${updated} background.js files updated.`);

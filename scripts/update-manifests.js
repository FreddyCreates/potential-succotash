#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');

const EXT_ROOT = path.resolve(__dirname, '..', 'extensions');
const MAX_DESC = 132;

const dirs = fs.readdirSync(EXT_ROOT, { withFileTypes: true })
  .filter(d => d.isDirectory() && d.name !== 'windows');

let updated = 0;

for (const dir of dirs) {
  const manifestPath = path.join(EXT_ROOT, dir.name, 'manifest.json');
  if (!fs.existsSync(manifestPath)) continue;

  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));

  // a) Add devtools_page
  manifest.devtools_page = 'devtools.html';

  // b) Add side_panel
  manifest.side_panel = { default_path: 'sidepanel.html' };

  // c) Merge action block — keep existing icons, add default_popup
  if (!manifest.action) {
    manifest.action = {};
  }
  manifest.action.default_popup = 'popup.html';

  // d) Add sidePanel to permissions
  if (!manifest.permissions) {
    manifest.permissions = [];
  }
  if (!manifest.permissions.includes('sidePanel')) {
    manifest.permissions.push('sidePanel');
  }

  // e) Truncate description to 132 chars
  if (manifest.description && manifest.description.length > MAX_DESC) {
    manifest.description = manifest.description.substring(0, MAX_DESC - 1) + '\u2026';
  }

  // Update minimum_chrome_version to 114 (sidePanel requires it)
  manifest.minimum_chrome_version = '114';

  // Reorder keys for clean output
  const ordered = {};
  const keyOrder = [
    'manifest_version', 'name', 'version', 'description',
    'permissions', 'background', 'content_scripts', 'icons',
    'minimum_chrome_version', 'action', 'devtools_page', 'side_panel'
  ];
  for (const key of keyOrder) {
    if (manifest[key] !== undefined) {
      ordered[key] = manifest[key];
    }
  }
  // Include any remaining keys not in the order list
  for (const key of Object.keys(manifest)) {
    if (!ordered.hasOwnProperty(key)) {
      ordered[key] = manifest[key];
    }
  }

  // Reorder action keys: default_popup first, then default_icon
  if (ordered.action) {
    const actionOrdered = {};
    if (ordered.action.default_popup) actionOrdered.default_popup = ordered.action.default_popup;
    if (ordered.action.default_icon) actionOrdered.default_icon = ordered.action.default_icon;
    for (const k of Object.keys(ordered.action)) {
      if (!actionOrdered.hasOwnProperty(k)) actionOrdered[k] = ordered.action[k];
    }
    ordered.action = actionOrdered;
  }

  fs.writeFileSync(manifestPath, JSON.stringify(ordered, null, 2) + '\n');
  updated++;
  console.log(`  ✓ ${dir.name}`);
}

console.log(`\n  ${updated} manifests updated.`);

#!/usr/bin/env node
/**
 * 📸 visual-bot: capture-screenshots.js
 *
 * Captures screenshots of HTML surfaces using Puppeteer (if available).
 * Falls back to a lightweight HTML content hash when Puppeteer is absent
 * (e.g., CI environments without a headless browser installed).
 *
 * Screenshots saved to: docs/visual-baselines/<surface-id>.png
 * Content hashes saved to: docs/_visual-snapshots.json
 *
 * Output: docs/_visual-snapshots.json
 */

'use strict';

const fs     = require('fs');
const path   = require('path');
const crypto = require('crypto');

const ROOT = path.resolve(__dirname, '..', '..');
const DOCS = path.resolve(ROOT, 'docs');
const BASELINES = path.resolve(DOCS, 'visual-baselines');

fs.mkdirSync(DOCS, { recursive: true });
fs.mkdirSync(BASELINES, { recursive: true });

// Load surfaces
let surfaceDoc;
try {
  surfaceDoc = JSON.parse(fs.readFileSync(path.join(DOCS, '_visual-surfaces.json'), 'utf8'));
} catch {
  console.error('❌ _visual-surfaces.json not found — run scan-html-surfaces.js first');
  process.exit(1);
}

const snapshots = [];
const PHI = 1.618033988749895;

// Try to require Puppeteer — fall back to hash mode if unavailable
let puppeteer = null;
try {
  puppeteer = require('puppeteer');
} catch {
  // Puppeteer not installed — use hash fingerprint mode
}

async function captureWithPuppeteer(surface) {
  const browser = await puppeteer.launch({
    headless: 'new',
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu'],
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 800 });

  const filePath = path.join(ROOT, surface.relPath);
  if (!fs.existsSync(filePath)) {
    await browser.close();
    return null;
  }

  const fileUrl = `file://${filePath}`;
  try {
    await page.goto(fileUrl, { waitUntil: 'networkidle0', timeout: 10000 });
    const screenshotPath = path.join(BASELINES, `${surface.id.replace(/:/g, '_')}.png`);
    await page.screenshot({ path: screenshotPath, fullPage: false });
    await browser.close();
    return { method: 'screenshot', screenshotPath };
  } catch {
    await browser.close();
    return null;
  }
}

function captureWithHash(surface) {
  const filePath = path.join(ROOT, surface.relPath);
  if (!fs.existsSync(filePath)) return null;

  const content = fs.readFileSync(filePath, 'utf8');
  const hash = crypto.createHash('sha256').update(content).digest('hex');

  // Phi-modulated content score: ratio of script/style tags to total content
  const scriptTags = (content.match(/<script/gi) || []).length;
  const styleTags  = (content.match(/<link|<style/gi) || []).length;
  const phiScore   = (scriptTags * PHI + styleTags) / Math.max(1, content.length / 1000);

  return { method: 'hash', hash, phiScore: Math.min(1.0, phiScore) };
}

console.log('');
console.log('📸 organism-visual-bot: Screenshot Capture');
console.log('══════════════════════════════════════════════════════════');
console.log(`  Mode: ${puppeteer ? 'Puppeteer (headless Chromium)' : 'Hash fingerprint (no browser)'}`);
console.log('');

async function run() {
  for (const surface of surfaceDoc.surfaces) {
    let result = null;

    if (puppeteer) {
      result = await captureWithPuppeteer(surface);
    }
    if (!result) {
      result = captureWithHash(surface);
    }

    const icon = result ? '✓' : '✗';
    console.log(`  ${icon} ${surface.id}`);

    snapshots.push({
      ...surface,
      captured: new Date().toISOString(),
      ...result,
    });
  }

  console.log('');

  const snapshotDoc = {
    captured: new Date().toISOString(),
    bot: 'organism-visual-bot',
    mode: puppeteer ? 'screenshot' : 'hash',
    totalSurfaces: snapshots.length,
    snapshots,
  };

  fs.writeFileSync(path.join(DOCS, '_visual-snapshots.json'), JSON.stringify(snapshotDoc, null, 2));
  console.log(`✅ Snapshots captured → docs/_visual-snapshots.json (${snapshots.length} surfaces)`);
}

run().catch(err => { console.error('❌', err.message); process.exit(1); });

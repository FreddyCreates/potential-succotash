/**
 * README Integrity Tripwire
 * ------------------------------------------------------------------
 * The README advertises structural counts (SDKs, extensions, extension
 * manifests). These have historically drifted from the actual code as the
 * organism grew (e.g. the SDK badge read "19" while the repo — and the
 * organism-sdk-bot's own registry — held 18).
 *
 * This suite pins the counts that are UNAMBIGUOUSLY defined by the
 * filesystem to their advertised values, so a divergence fails CI instead
 * of rotting silently. It deliberately does NOT assert the "11 intelligent
 * workers" or "11 sovereign protocols" badges: those are curated subsets,
 * not raw file counts (there are 17 worker dirs and 144 protocol files),
 * and asserting a raw count against a curated claim would be a false alarm.
 */

const { describe, it } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

function readReadme() {
  return fs.readFileSync(path.join(REPO_ROOT, 'README.md'), 'utf8');
}

function countDirs(rel) {
  const dir = path.join(REPO_ROOT, rel);
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory()).length;
}

function countExtensionManifests() {
  const dir = path.join(REPO_ROOT, 'extensions');
  if (!fs.existsSync(dir)) return 0;
  return fs
    .readdirSync(dir, { withFileTypes: true })
    .filter((e) => e.isDirectory())
    .filter((e) => fs.existsSync(path.join(dir, e.name, 'manifest.json')))
    .length;
}

describe('README integrity — structural counts match ground truth', () => {
  const readme = readReadme();

  it('SDK dir count matches the organism-sdk-bot registry', () => {
    const registry = require(path.join(REPO_ROOT, 'docs', 'sdk-registry.json'));
    const actualDirs = countDirs('sdk');
    assert.equal(
      actualDirs,
      registry.totalSDKs,
      `sdk/ has ${actualDirs} dirs but docs/sdk-registry.json totalSDKs=${registry.totalSDKs} — regenerate the registry or reconcile the dirs`
    );
  });

  it('README SDK badge matches the actual sdk/ dir count', () => {
    const actualDirs = countDirs('sdk');
    const badge = readme.match(/badge\/SDKs-(\d+)/);
    assert.ok(badge, 'SDK badge not found in README');
    assert.equal(
      Number(badge[1]),
      actualDirs,
      `README SDK badge says ${badge[1]} but sdk/ has ${actualDirs} dirs`
    );
  });

  it('README architecture diagram + file tree agree with the SDK badge', () => {
    const actualDirs = countDirs('sdk');
    const mentions = [...readme.matchAll(/(\d+)\s+SDKs/g)].map((m) => Number(m[1]));
    assert.ok(mentions.length > 0, 'no "N SDKs" prose mentions found');
    for (const n of mentions) {
      assert.equal(
        n,
        actualDirs,
        `README mentions "${n} SDKs" but sdk/ has ${actualDirs} dirs`
      );
    }
  });

  it('README extensions badge matches the actual extensions/ dir count', () => {
    const actualDirs = countDirs('extensions');
    const badge = readme.match(/badge\/extensions-(\d+)/);
    assert.ok(badge, 'extensions badge not found in README');
    assert.equal(
      Number(badge[1]),
      actualDirs,
      `README extensions badge says ${badge[1]} but extensions/ has ${actualDirs} dirs`
    );
  });

  it('README lint badge matches the number of valid extension manifests', () => {
    const manifests = countExtensionManifests();
    // badge is url-encoded as lint-40%2F40%20manifests
    const badge = readme.match(/badge\/lint-(\d+)%2F(\d+)/);
    assert.ok(badge, 'lint badge not found in README');
    assert.equal(
      Number(badge[2]),
      manifests,
      `README lint badge denominator says ${badge[2]} but ${manifests} extensions have a manifest.json`
    );
    assert.equal(
      Number(badge[1]),
      manifests,
      `README lint badge says ${badge[1]}/${badge[2]} passing but ${manifests} manifests exist`
    );
  });
});

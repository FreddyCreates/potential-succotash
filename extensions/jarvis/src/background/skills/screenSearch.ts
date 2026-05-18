/**
 * Screen Search Skill — Vigil AI
 * ─────────────────────────────────────────────────────────────────
 * Stores captured screenshot data alongside OCR-extracted text and
 * allows searching across all saves.  Uses the DOM-native Canvas
 * API for pixel reading (no external dependency).
 *
 * Capabilities:
 *  1.  Save screenshot with associated page text
 *  2.  Full-text search across all saved captures
 *  3.  List recent captures
 *  4.  Delete a capture by ID
 *  5.  Export capture index as JSON
 *  6.  Find text on the current active tab (DOM-based, no OCR needed)
 */

const STORAGE_KEY = 'vigil_screen_captures';
const MAX_CAPTURES = 50;

export interface ScreenCapture {
  id: string;
  url: string;
  title: string;
  timestamp: number;
  /** Base64 data URL of the screenshot */
  dataUrl: string;
  /** Visible text extracted from the page at capture time */
  pageText: string;
  /** Summary of the visible text (first 500 chars) */
  preview: string;
  tags: string[];
}

/* ─────────────────────────────────────────────────────────────────
 *  STORAGE
 * ──────────────────────────────────────────────────────────────── */
async function loadCaptures(): Promise<ScreenCapture[]> {
  return new Promise(resolve => {
    chrome.storage.local.get([STORAGE_KEY], r => {
      resolve((r[STORAGE_KEY] as ScreenCapture[]) ?? []);
    });
  });
}

async function saveCaptures(captures: ScreenCapture[]): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: captures }, resolve);
  });
}

/* ─────────────────────────────────────────────────────────────────
 *  SAVE A CAPTURE
 * ──────────────────────────────────────────────────────────────── */
export async function saveScreenCapture(
  dataUrl: string,
  pageText: string,
  url: string,
  title: string,
  tags: string[] = [],
): Promise<ScreenCapture> {
  const captures = await loadCaptures();
  const id = 'sc-' + Date.now() + '-' + Math.random().toString(36).slice(2, 6);
  const preview = pageText.replace(/\s+/g, ' ').trim().slice(0, 500);
  const entry: ScreenCapture = { id, url, title, timestamp: Date.now(), dataUrl, pageText, preview, tags };

  // Store the dataUrl only if under 2 MB to stay within chrome.storage.local 5 MB limit.
  // If the screenshot exceeds this, the image is omitted but text remains fully searchable.
  const storageEntry: ScreenCapture = { ...entry };
  if (dataUrl.length > 2_000_000) storageEntry.dataUrl = ''; // evict large image but keep text

  captures.unshift(storageEntry);
  if (captures.length > MAX_CAPTURES) captures.pop();
  await saveCaptures(captures);
  return entry;
}

/* ─────────────────────────────────────────────────────────────────
 *  SEARCH CAPTURES
 * ──────────────────────────────────────────────────────────────── */
export interface ScreenSearchResult {
  capture: ScreenCapture;
  score: number;
  matchContext: string;
}

export async function searchCaptures(query: string): Promise<ScreenSearchResult[]> {
  const captures = await loadCaptures();
  const terms = query.toLowerCase().split(/\s+/).filter(Boolean);
  if (terms.length === 0) return [];

  const results: ScreenSearchResult[] = [];
  for (const cap of captures) {
    const hay = (cap.title + ' ' + cap.url + ' ' + cap.pageText + ' ' + cap.tags.join(' ')).toLowerCase();
    let score = 0;
    let matchContext = '';
    for (const term of terms) {
      const idx = hay.indexOf(term);
      if (idx !== -1) {
        score++;
        if (!matchContext) {
          const start = Math.max(0, idx - 80);
          const end = Math.min(hay.length, idx + term.length + 120);
          const raw = cap.pageText.slice(start, end).replace(/\s+/g, ' ').trim();
          matchContext = '…' + raw + '…';
        }
      }
    }
    if (score > 0) results.push({ capture: cap, score, matchContext });
  }

  results.sort((a, b) => b.score - a.score);
  return results;
}

/* ─────────────────────────────────────────────────────────────────
 *  LIST CAPTURES
 * ──────────────────────────────────────────────────────────────── */
export async function listCaptures(limit = 10): Promise<ScreenCapture[]> {
  const captures = await loadCaptures();
  return captures.slice(0, limit);
}

/* ─────────────────────────────────────────────────────────────────
 *  DELETE A CAPTURE
 * ──────────────────────────────────────────────────────────────── */
export async function deleteCapture(id: string): Promise<boolean> {
  const captures = await loadCaptures();
  const next = captures.filter(c => c.id !== id);
  if (next.length === captures.length) return false;
  await saveCaptures(next);
  return true;
}

/* ─────────────────────────────────────────────────────────────────
 *  EXPORT CAPTURE INDEX
 * ──────────────────────────────────────────────────────────────── */
export async function exportCaptureIndex(): Promise<string> {
  const captures = await loadCaptures();
  const index = captures.map(c => ({
    id: c.id,
    title: c.title,
    url: c.url,
    timestamp: new Date(c.timestamp).toISOString(),
    preview: c.preview,
    tags: c.tags,
  }));
  return JSON.stringify(index, null, 2);
}

/* ─────────────────────────────────────────────────────────────────
 *  STATS
 * ──────────────────────────────────────────────────────────────── */
export async function captureStats(): Promise<{ total: number; oldestDate: string; newestDate: string; totalTextChars: number }> {
  const captures = await loadCaptures();
  if (captures.length === 0) return { total: 0, oldestDate: 'None', newestDate: 'None', totalTextChars: 0 };
  const times = captures.map(c => c.timestamp);
  const totalChars = captures.reduce((sum, c) => sum + c.pageText.length, 0);
  return {
    total: captures.length,
    oldestDate: new Date(Math.min(...times)).toLocaleDateString(),
    newestDate: new Date(Math.max(...times)).toLocaleDateString(),
    totalTextChars: totalChars,
  };
}

/* ─────────────────────────────────────────────────────────────────
 *  FIND TEXT IN ACTIVE TAB (via content script injection)
 *  Returns a serializable message to be sent to the tab.
 * ──────────────────────────────────────────────────────────────── */
export function buildFindTextScript(query: string): string {
  // This is injected as a content script and returns matches
  return `(function() {
    var q = ${JSON.stringify(query.toLowerCase())};
    var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    var matches = [];
    var node;
    while ((node = walker.nextNode()) && matches.length < 20) {
      var txt = node.nodeValue || '';
      var lower = txt.toLowerCase();
      var idx = lower.indexOf(q);
      if (idx !== -1) {
        var start = Math.max(0, idx - 60);
        var context = txt.slice(start, idx + q.length + 60).replace(/\\s+/g, ' ').trim();
        var parent = node.parentElement;
        matches.push({
          context: context,
          tag: parent ? parent.tagName : 'UNKNOWN',
          visible: parent ? (parent.offsetParent !== null) : false
        });
      }
    }
    return { found: matches.length > 0, count: matches.length, matches: matches };
  })()`;
}

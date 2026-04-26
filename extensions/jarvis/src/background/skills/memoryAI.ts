/**
 * MemoryAI — Spatial Memory Engine (Memory Palace)
 * ─────────────────────────────────────────────────
 * Every saved URL gets phi-encoded coordinates in a 5D conceptual space.
 * Pages are stored as nodes in a "memory palace" — retrievable by semantic
 * resonance between coordinates rather than exact text match.
 */

const PHI = 1.618033988749895;
const STORAGE_KEY = 'vigil_memory_palace';

export interface PhiCoordinate {
  theta: number;   // angular position on the ring (0–2π)
  phi_r: number;   // elevation (0–π), named phi_r to avoid collision with constant
  rho: number;     // radial distance from center
  ring: number;    // integer ring index (time-based)
  beat: number;    // phi-modulated beat (0–1)
}

export interface MemoryEntry {
  id: string;
  url: string;
  title: string;
  excerpt: string;
  tags: string[];
  coords: PhiCoordinate;
  timestamp: number;
  visitCount: number;
}

/* ----------------------------------------------------------
 *  Phi encoding
 * ---------------------------------------------------------- */

/** Generate a phi-resonant hash from a string */
function phiHash(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * PHI + s.charCodeAt(i)) % (2 * Math.PI * 1000);
  }
  return h / 1000;
}

/** Encode a URL + title + timestamp into phi coordinates */
export function encodePhiCoord(url: string, title: string, timestamp: number): PhiCoordinate {
  const urlHash = phiHash(url);
  const titleHash = phiHash(title);
  const timeRing = Math.floor((timestamp / (1000 * 60 * 60 * 24)) % 100); // day ring

  return {
    theta: urlHash % (2 * Math.PI),
    phi_r: (titleHash % Math.PI),
    rho: (urlHash * PHI) % 10,
    ring: timeRing,
    beat: ((urlHash + titleHash) * PHI) % 1,
  };
}

/** Compute resonance distance between two phi coordinates (0 = identical, higher = further) */
export function phiDistance(a: PhiCoordinate, b: PhiCoordinate): number {
  const dTheta = Math.abs(a.theta - b.theta);
  const dPhi = Math.abs(a.phi_r - b.phi_r);
  const dRho = Math.abs(a.rho - b.rho);
  const dRing = Math.abs(a.ring - b.ring);
  const dBeat = Math.abs(a.beat - b.beat);
  // Weighted Euclidean in phi-space
  return Math.sqrt(dTheta * dTheta + dPhi * dPhi + dRho * dRho * 0.5 + dRing * dRing * 0.1 + dBeat * dBeat * 0.3);
}

/* ----------------------------------------------------------
 *  Storage helpers
 * ---------------------------------------------------------- */

async function loadPalace(): Promise<MemoryEntry[]> {
  return new Promise(resolve => {
    chrome.storage.local.get([STORAGE_KEY], d => {
      resolve((d[STORAGE_KEY] as MemoryEntry[]) || []);
    });
  });
}

async function savePalace(entries: MemoryEntry[]): Promise<void> {
  return new Promise(resolve => {
    chrome.storage.local.set({ [STORAGE_KEY]: entries }, resolve);
  });
}

/* ----------------------------------------------------------
 *  Public API
 * ---------------------------------------------------------- */

/** Save a URL to the Memory Palace */
export async function saveMemory(url: string, title: string, excerpt = '', tags: string[] = []): Promise<MemoryEntry> {
  const entries = await loadPalace();
  const existing = entries.find(e => e.url === url);
  if (existing) {
    existing.visitCount++;
    existing.timestamp = Date.now();
    if (excerpt) existing.excerpt = excerpt;
    await savePalace(entries);
    return existing;
  }

  const now = Date.now();
  const entry: MemoryEntry = {
    id: 'mem-' + now + '-' + Math.random().toString(36).slice(2, 7),
    url,
    title: title || url,
    excerpt: excerpt.substring(0, 300),
    tags,
    coords: encodePhiCoord(url, title, now),
    timestamp: now,
    visitCount: 1,
  };

  entries.unshift(entry);
  // Cap palace at 500 entries
  if (entries.length > 500) entries.pop();
  await savePalace(entries);
  return entry;
}

/** Get all memories, optionally filtered by text query or resonance to a URL */
export async function getMemories(opts?: { query?: string; near?: string; limit?: number }): Promise<MemoryEntry[]> {
  const entries = await loadPalace();
  const limit = opts?.limit ?? 50;

  if (!opts?.query && !opts?.near) {
    return entries.slice(0, limit);
  }

  if (opts?.near) {
    const refCoords = encodePhiCoord(opts.near, opts.near, Date.now());
    const scored = entries
      .map(e => ({ entry: e, dist: phiDistance(e.coords, refCoords) }))
      .sort((a, b) => a.dist - b.dist);
    return scored.slice(0, limit).map(s => s.entry);
  }

  if (opts?.query) {
    const q = opts.query.toLowerCase();
    const filtered = entries.filter(e =>
      e.title.toLowerCase().includes(q) ||
      e.url.toLowerCase().includes(q) ||
      e.excerpt.toLowerCase().includes(q) ||
      e.tags.some(t => t.toLowerCase().includes(q))
    );
    return filtered.slice(0, limit);
  }

  return entries.slice(0, limit);
}

/** Delete a memory entry by ID */
export async function deleteMemory(id: string): Promise<boolean> {
  const entries = await loadPalace();
  const idx = entries.findIndex(e => e.id === id);
  if (idx === -1) return false;
  entries.splice(idx, 1);
  await savePalace(entries);
  return true;
}

/** Get palace stats */
export async function memoryStats(): Promise<{ count: number; rings: number[]; oldest: number; newest: number }> {
  const entries = await loadPalace();
  if (!entries.length) return { count: 0, rings: [], oldest: 0, newest: 0 };
  const rings = [...new Set(entries.map(e => e.coords.ring))].sort((a, b) => a - b);
  return {
    count: entries.length,
    rings,
    oldest: entries[entries.length - 1].timestamp,
    newest: entries[0].timestamp,
  };
}

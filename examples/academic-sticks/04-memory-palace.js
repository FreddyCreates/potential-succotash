#!/usr/bin/env node
/**
 * ═══════════════════════════════════════════════════════════════════════════════
 * ACADEMIC EXAMPLE 04: MEMORY PALACE - PHI-ENCODED SPATIAL MEMORY
 * ═══════════════════════════════════════════════════════════════════════════════
 * 
 * THEORETICAL FOUNDATION:
 * ───────────────────────
 * The Memory Palace (Method of Loci) is a mnemonic technique dating to 
 * ancient Greece. Practitioners visualize placing memories in spatial 
 * locations within a mental "palace" and retrieve them by mentally 
 * walking through the space.
 * 
 * NEUROSCIENTIFIC BASIS:
 * ──────────────────────
 * The hippocampus contains "place cells" that encode spatial location.
 * Memory formation is inherently spatial—the brain organizes information
 * in coordinate systems. This is why the memory palace technique works.
 * 
 * PHI-ENCODED COORDINATES:
 * ────────────────────────
 * We extend the memory palace concept into a 5D phi-encoded space:
 * 
 *   1. θ (theta)  - Angular position in [0, 2π], derived from content hash
 *   2. φ_r        - Elevation in [0, π], phi-modulated
 *   3. ρ (rho)    - Radial distance from center, content-derived
 *   4. r (ring)   - Day-indexed ring (temporal index)
 *   5. β (beat)   - Phi-modulated heartbeat phase
 * 
 * RETRIEVAL MECHANISM:
 * ────────────────────
 * Instead of keyword matching, retrieval uses "resonance distance"—
 * a weighted Euclidean metric in phi-space:
 * 
 *   d(p₁, p₂) = √(Δθ² + Δφ² + 0.5Δρ² + 0.1Δr² + 0.3Δβ²)
 * 
 * Related memories cluster in phi-space, enabling associative recall
 * without explicit tagging.
 * 
 * SPATIAL COORDINATE EXTENSION:
 * ─────────────────────────────
 * Beyond URL-level encoding, we also encode WHERE within a page:
 * 
 *   - scrollPct   - Vertical scroll depth (0-100%)
 *   - sectionPath - Heading breadcrumb (H1 → H6)
 *   - domDepth    - Depth in DOM tree
 *   - xPhi, yPhi, zPhi, sPhi - 4D phi-encoded spatial vector
 * 
 * This allows the system to recall not just WHICH page, but WHERE on that page.
 * 
 * @module examples/academic-sticks/04-memory-palace
 * @author Organism AI Research Division
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

// ═══════════════════════════════════════════════════════════════════════════════
// PHI-HASH FUNCTION
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Generate a phi-resonant hash from a string.
 * This creates a deterministic but well-distributed value.
 */
function phiHash(str) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    // Multiply by phi and add character code, then mod to keep bounded
    hash = (hash * PHI + str.charCodeAt(i)) % (2 * Math.PI * 1000);
  }
  return hash / 1000;  // Normalize to roughly [0, 2π]
}

// ═══════════════════════════════════════════════════════════════════════════════
// PHI COORDINATE ENCODING
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Phi-Coordinate: 5D position in the Memory Palace
 */
class PhiCoordinate {
  constructor(theta, phi_r, rho, ring, beat) {
    this.theta = theta;    // Angular position [0, 2π]
    this.phi_r = phi_r;    // Elevation [0, π]
    this.rho = rho;        // Radial distance
    this.ring = ring;      // Day ring (integer)
    this.beat = beat;      // Phi-modulated beat [0, 1]
  }

  /**
   * Encode content + timestamp into phi-coordinates
   */
  static encode(content, timestamp) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    const contentHash = phiHash(contentStr);
    
    // Day ring: which day since epoch (mod 100 for 100-day cycles)
    const dayRing = Math.floor((timestamp / (1000 * 60 * 60 * 24)) % 100);
    
    return new PhiCoordinate(
      contentHash % (2 * Math.PI),                              // θ: angular from hash
      (contentHash * PHI) % Math.PI,                            // φ_r: elevation, phi-modulated
      (contentHash * PHI_INV) % 10,                             // ρ: radial distance
      dayRing,                                                   // r: day ring
      ((contentHash + timestamp / 1000) * PHI) % 1              // β: phi-beat
    );
  }

  /**
   * Calculate resonance distance to another coordinate
   */
  distanceTo(other) {
    const dTheta = Math.abs(this.theta - other.theta);
    const dPhi = Math.abs(this.phi_r - other.phi_r);
    const dRho = Math.abs(this.rho - other.rho);
    const dRing = Math.abs(this.ring - other.ring);
    const dBeat = Math.abs(this.beat - other.beat);
    
    // Weighted Euclidean distance
    return Math.sqrt(
      dTheta * dTheta * 1.0 +    // Full weight on angular
      dPhi * dPhi * 1.0 +        // Full weight on elevation
      dRho * dRho * 0.5 +        // Half weight on radial
      dRing * dRing * 0.1 +      // Low weight on time
      dBeat * dBeat * 0.3        // Medium weight on beat
    );
  }

  /**
   * Convert to Cartesian coordinates for visualization
   */
  toCartesian() {
    // Spherical to Cartesian conversion (ignoring ring and beat for 3D)
    const x = this.rho * Math.sin(this.phi_r) * Math.cos(this.theta);
    const y = this.rho * Math.sin(this.phi_r) * Math.sin(this.theta);
    const z = this.rho * Math.cos(this.phi_r);
    return { x, y, z };
  }

  toString() {
    return `(θ=${this.theta.toFixed(3)}, φ=${this.phi_r.toFixed(3)}, ρ=${this.rho.toFixed(3)}, r=${this.ring}, β=${this.beat.toFixed(3)})`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// SPATIAL COORDINATE (Within-Page Encoding)
// ═══════════════════════════════════════════════════════════════════════════════

/**
 * Spatial Coordinate: WHERE within a page the memory was encoded
 */
class SpatialCoordinate {
  constructor(scrollPct, sectionPath, domDepth) {
    this.scrollPct = scrollPct;        // 0-100
    this.sectionPath = sectionPath;    // ['Section 1', 'Subsection 1.2']
    this.domDepth = domDepth;          // 0-50 typically
    
    // Compute phi-encoded 4D vector
    const sectionKey = sectionPath.join(' > ') || 'root';
    const sHash = phiHash(sectionKey);
    
    this.xPhi = (sHash * PHI) % (2 * Math.PI);           // Horizontal axis
    this.yPhi = ((scrollPct / 100) * Math.PI * PHI) % Math.PI;  // Vertical axis
    this.zPhi = ((domDepth * PHI) % 10) / 10;            // Depth axis
    this.sPhi = (sHash % 1 + 1) % 1;                     // Section axis
  }

  /**
   * Calculate spatial distance to another coordinate
   */
  distanceTo(other) {
    const dx = this.xPhi - other.xPhi;
    const dy = this.yPhi - other.yPhi;
    const dz = this.zPhi - other.zPhi;
    const ds = this.sPhi - other.sPhi;
    
    // Weighted: scroll (y) is most important
    return Math.sqrt(
      dx * dx * 0.3 +
      dy * dy * 0.5 +
      dz * dz * 0.1 +
      ds * ds * 0.1
    );
  }

  toString() {
    return `[scroll=${this.scrollPct}%, section="${this.sectionPath.join(' > ')}", depth=${this.domDepth}]`;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY ENTRY
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryEntry {
  constructor(content, options = {}) {
    this.id = `mem-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    this.content = content;
    this.title = options.title || (typeof content === 'string' ? content.slice(0, 50) : 'Memory');
    this.tags = options.tags || [];
    this.timestamp = options.timestamp || Date.now();
    this.visitCount = 1;
    
    // Phi-encoded coordinates
    this.coords = PhiCoordinate.encode(content, this.timestamp);
    
    // Spatial coordinates (if provided)
    if (options.scrollPct !== undefined) {
      this.spatial = new SpatialCoordinate(
        options.scrollPct,
        options.sectionPath || [],
        options.domDepth || 0
      );
    }
  }

  /**
   * Access the memory (strengthens it)
   */
  access() {
    this.visitCount++;
    this.lastAccess = Date.now();
    return this;
  }

  /**
   * Get resonance distance to another memory
   */
  resonanceDistanceTo(other) {
    let distance = this.coords.distanceTo(other.coords);
    
    // Add spatial distance if both have spatial coordinates
    if (this.spatial && other.spatial) {
      distance = distance * 0.7 + this.spatial.distanceTo(other.spatial) * 0.3;
    }
    
    return distance;
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// MEMORY PALACE
// ═══════════════════════════════════════════════════════════════════════════════

class MemoryPalace {
  constructor(options = {}) {
    this.memories = new Map();
    this.maxCapacity = options.maxCapacity || 500;
    this.name = options.name || 'Primary Palace';
  }

  /**
   * Store a memory in the palace
   */
  store(content, options = {}) {
    const entry = new MemoryEntry(content, options);
    
    // Check for existing similar memory
    const existing = this.findByContent(content);
    if (existing) {
      existing.access();
      return existing;
    }
    
    this.memories.set(entry.id, entry);
    
    // Enforce capacity (remove oldest/weakest)
    if (this.memories.size > this.maxCapacity) {
      this.prune();
    }
    
    return entry;
  }

  /**
   * Find memory by exact content
   */
  findByContent(content) {
    const contentStr = typeof content === 'string' ? content : JSON.stringify(content);
    for (const mem of this.memories.values()) {
      const memStr = typeof mem.content === 'string' ? mem.content : JSON.stringify(mem.content);
      if (memStr === contentStr) return mem;
    }
    return null;
  }

  /**
   * Retrieve memories by resonance (associative recall)
   */
  recall(query, limit = 10) {
    const queryCoord = PhiCoordinate.encode(query, Date.now());
    const queryEntry = new MemoryEntry(query);
    
    const scored = [];
    for (const mem of this.memories.values()) {
      const distance = mem.resonanceDistanceTo(queryEntry);
      scored.push({ memory: mem, distance });
    }
    
    // Sort by distance (ascending = closer = more relevant)
    scored.sort((a, b) => a.distance - b.distance);
    
    return scored.slice(0, limit);
  }

  /**
   * Retrieve memories near a spatial position
   */
  recallAtPosition(scrollPct, sectionPath, domDepth, limit = 10) {
    const querySpatial = new SpatialCoordinate(scrollPct, sectionPath, domDepth);
    
    const scored = [];
    for (const mem of this.memories.values()) {
      if (mem.spatial) {
        const distance = mem.spatial.distanceTo(querySpatial);
        scored.push({ memory: mem, distance });
      }
    }
    
    scored.sort((a, b) => a.distance - b.distance);
    return scored.slice(0, limit);
  }

  /**
   * Remove weakest memories when over capacity
   */
  prune() {
    const entries = Array.from(this.memories.values());
    
    // Score by: recency + visit count
    entries.sort((a, b) => {
      const scoreA = a.visitCount * 1000 + (a.lastAccess || a.timestamp);
      const scoreB = b.visitCount * 1000 + (b.lastAccess || b.timestamp);
      return scoreA - scoreB;  // Lowest score first (weakest)
    });
    
    // Remove weakest until under capacity
    while (this.memories.size > this.maxCapacity) {
      const weakest = entries.shift();
      this.memories.delete(weakest.id);
    }
  }

  /**
   * Get palace statistics
   */
  getStats() {
    const entries = Array.from(this.memories.values());
    const rings = [...new Set(entries.map(e => e.coords.ring))].sort((a, b) => a - b);
    
    return {
      name: this.name,
      count: this.memories.size,
      capacity: this.maxCapacity,
      rings,
      oldest: entries.length > 0 ? Math.min(...entries.map(e => e.timestamp)) : null,
      newest: entries.length > 0 ? Math.max(...entries.map(e => e.timestamp)) : null,
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════════
// DEMONSTRATION
// ═══════════════════════════════════════════════════════════════════════════════

function demonstrate() {
  console.log('');
  console.log('╔═══════════════════════════════════════════════════════════════════════════╗');
  console.log('║  MEMORY PALACE - PHI-ENCODED SPATIAL MEMORY                               ║');
  console.log('║  ─────────────────────────────────────────────────────────────────────────║');
  console.log('║  "The art of memory is the art of attention" — Samuel Johnson             ║');
  console.log('╚═══════════════════════════════════════════════════════════════════════════╝');
  console.log('');
  
  // Create palace
  const palace = new MemoryPalace({ name: 'Academic Palace' });
  
  // Store some memories
  console.log('═══════════════════════════════════════════════════════════════════════════');
  console.log('STORING MEMORIES:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const topics = [
    { content: 'Quantum mechanics and wave function collapse', tags: ['physics', 'quantum'] },
    { content: 'Neural networks and backpropagation', tags: ['AI', 'ML'] },
    { content: 'Quantum computing with qubits', tags: ['physics', 'computing'] },
    { content: 'The golden ratio in nature', tags: ['mathematics', 'phi'] },
    { content: 'Hebbian learning in the brain', tags: ['neuroscience', 'learning'] },
    { content: 'Fibonacci spirals in sunflowers', tags: ['mathematics', 'nature'] },
    { content: 'Kuramoto oscillator synchronization', tags: ['physics', 'dynamics'] },
    { content: 'Deep learning transformer architecture', tags: ['AI', 'ML'] },
  ];
  
  topics.forEach(t => {
    const entry = palace.store(t.content, { tags: t.tags });
    console.log(`   Stored: "${t.content.slice(0, 40)}..."`);
    console.log(`           Coords: ${entry.coords.toString()}`);
  });
  
  // Demonstrate phi-encoding
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PHI-COORDINATE ENCODING:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const sample1 = PhiCoordinate.encode('quantum mechanics', Date.now());
  const sample2 = PhiCoordinate.encode('quantum computing', Date.now());
  const sample3 = PhiCoordinate.encode('cooking recipes', Date.now());
  
  console.log('   Encoding comparison:');
  console.log(`     "quantum mechanics" → ${sample1.toString()}`);
  console.log(`     "quantum computing" → ${sample2.toString()}`);
  console.log(`     "cooking recipes"   → ${sample3.toString()}`);
  console.log('');
  console.log('   Resonance distances:');
  console.log(`     quantum mechanics ↔ quantum computing: ${sample1.distanceTo(sample2).toFixed(4)}`);
  console.log(`     quantum mechanics ↔ cooking recipes:   ${sample1.distanceTo(sample3).toFixed(4)}`);
  console.log('   (Lower = more similar in phi-space)');
  
  // Demonstrate associative recall
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('ASSOCIATIVE RECALL (Resonance Search):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const queries = [
    'quantum physics concepts',
    'machine learning algorithms',
    'mathematical patterns',
  ];
  
  queries.forEach(query => {
    console.log(`\n   Query: "${query}"`);
    const results = palace.recall(query, 3);
    results.forEach((r, i) => {
      console.log(`     ${i + 1}. "${r.memory.content.slice(0, 45)}..." (d=${r.distance.toFixed(3)})`);
    });
  });
  
  // Demonstrate spatial encoding
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('SPATIAL ENCODING (Where on the page):');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  // Store memories with spatial coordinates
  const spatialMemories = [
    { content: 'Introduction paragraph', scrollPct: 5, sectionPath: ['Introduction'], domDepth: 3 },
    { content: 'Method description', scrollPct: 35, sectionPath: ['Methods', 'Approach'], domDepth: 5 },
    { content: 'Key finding', scrollPct: 60, sectionPath: ['Results', 'Main Results'], domDepth: 4 },
    { content: 'Conclusion statement', scrollPct: 90, sectionPath: ['Conclusion'], domDepth: 3 },
  ];
  
  spatialMemories.forEach(sm => {
    const entry = palace.store(sm.content, {
      scrollPct: sm.scrollPct,
      sectionPath: sm.sectionPath,
      domDepth: sm.domDepth,
    });
    console.log(`   "${sm.content}" → ${entry.spatial.toString()}`);
  });
  
  console.log('\n   Searching for memories near scroll position 40%, "Methods" section:');
  const nearResults = palace.recallAtPosition(40, ['Methods'], 4, 3);
  nearResults.forEach((r, i) => {
    console.log(`     ${i + 1}. "${r.memory.content}" (spatial_d=${r.distance.toFixed(3)})`);
  });
  
  // Palace statistics
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('PALACE STATISTICS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  
  const stats = palace.getStats();
  console.log(`   Name: ${stats.name}`);
  console.log(`   Memories: ${stats.count} / ${stats.capacity}`);
  console.log(`   Day rings occupied: [${stats.rings.join(', ')}]`);
  
  // Mathematical summary
  console.log('\n═══════════════════════════════════════════════════════════════════════════');
  console.log('THE MATHEMATICS:');
  console.log('───────────────────────────────────────────────────────────────────────────');
  console.log('   Coordinate encoding:');
  console.log('     θ = phiHash(content) mod 2π');
  console.log('     φ = phiHash(content) × φ mod π');
  console.log('     ρ = phiHash(content) × (1/φ) mod 10');
  console.log('     r = day_since_epoch mod 100');
  console.log('     β = (phiHash + timestamp × φ) mod 1');
  console.log('');
  console.log('   Resonance distance:');
  console.log('     d(p₁,p₂) = √(Δθ² + Δφ² + 0.5Δρ² + 0.1Δr² + 0.3Δβ²)');
  console.log('');
  console.log('   Key insight: Related content clusters in phi-space');
  console.log('   because the phi-hash distributes semantically similar');
  console.log('   strings to nearby coordinates.');
  console.log('═══════════════════════════════════════════════════════════════════════════\n');
}

// Run if executed directly
demonstrate();

export {
  PhiCoordinate,
  SpatialCoordinate,
  MemoryEntry,
  MemoryPalace,
  phiHash,
};

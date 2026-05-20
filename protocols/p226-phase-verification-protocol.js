/**
 * P226: Phase Verification Protocol (PVP)
 * 
 * PHI-resonant phase calculation and verification for identity authentication.
 * Uses golden ratio mathematics to compute unique phase signatures for entities.
 * 
 * Phase computation: s = sum(charCode), p = (s * PHI) % 2π, m = √s / φ
 * Resonance: r = sin(p * φ) * cos(ts / HB)
 * Verification threshold: 1/φ (≈0.618)
 * 
 * @module protocols/p226-phase-verification-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const HB = 873; // Heartbeat interval (ms)
const THRESHOLD = 1 / PHI; // ≈0.618, the golden ratio inverse

/**
 * Phase verification result
 * @typedef {Object} PhaseResult
 * @property {number} phase - Phase angle in radians [0, 2π)
 * @property {number} magnitude - Signal magnitude (√s / φ)
 * @property {number} resonance - Temporal resonance value
 * @property {string} phi - PHI-scaled phase (6 decimal places)
 * @property {string} sig - Signature string "id:phase:magnitude"
 */

/**
 * Verification result
 * @typedef {Object} VerifyResult
 * @property {boolean} ok - Whether verification passed
 * @property {number} phaseDelta - Phase difference
 * @property {number} resonanceDelta - Resonance difference
 * @property {string} status - "valid" | "invalid"
 * @property {number} confidence - Confidence score [0, 1]
 */

/**
 * P226 Phase Verification Protocol
 * 
 * Computes and verifies PHI-resonant phase signatures for identity authentication.
 */
class P226PhaseVerificationProtocol {
  /**
   * Create P226 protocol instance
   * @param {Object} config - Configuration options
   * @param {number} [config.threshold] - Verification threshold (default: 1/φ)
   * @param {number} [config.heartbeat] - Heartbeat interval (default: 873ms)
   */
  constructor(config = {}) {
    this.threshold = config.threshold ?? THRESHOLD;
    this.heartbeat = config.heartbeat ?? HB;
    this.verifications = new Map();
    this.totalVerified = 0;
    this.totalFailed = 0;
  }

  /**
   * Compute phase signature for an identifier at a given timestamp.
   * 
   * Algorithm:
   * 1. s = Σ charCode(id[i]) — sum of character codes
   * 2. p = (s × φ) mod 2π — phase angle
   * 3. m = √s / φ — magnitude  
   * 4. r = sin(p × φ) × cos(ts / HB) — temporal resonance
   * 
   * @param {string} id - Entity identifier
   * @param {number} [ts] - Timestamp (default: Date.now())
   * @returns {PhaseResult} Phase computation result
   */
  phase(id, ts = Date.now()) {
    // Compute character code sum
    const s = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
    
    // Phase: (s × φ) mod 2π — golden-ratio scaled phase angle
    const p = (s * PHI) % (2 * Math.PI);
    
    // Magnitude: √s / φ — inverse-phi scaled magnitude
    const m = Math.sqrt(s) / PHI;
    
    // Resonance: temporal modulation via heartbeat
    const r = Math.sin(p * PHI) * Math.cos(ts / this.heartbeat);
    
    return {
      phase: p,
      magnitude: m,
      resonance: r,
      phi: (p * PHI).toFixed(6),
      sig: `${id}:${p.toFixed(4)}:${m.toFixed(4)}`
    };
  }

  /**
   * Verify a phase value against expected computation.
   * 
   * Verification passes if:
   * - Phase delta < 1/φ (threshold)
   * - Resonance delta < 1/φ (threshold)
   * 
   * @param {PhaseResult} v - Value to verify
   * @param {string} id - Expected identifier
   * @param {number} [ts] - Timestamp (default: Date.now())
   * @returns {VerifyResult} Verification result
   */
  verify(v, id, ts = Date.now()) {
    const expected = this.phase(id, ts);
    
    // Compute deltas
    const phaseDelta = Math.abs(v.phase - expected.phase);
    const resonanceDelta = Math.abs(v.resonance - expected.resonance);
    
    // Verification passes if both deltas are below threshold
    const phaseOk = phaseDelta < this.threshold;
    const resonanceOk = resonanceDelta < this.threshold;
    const ok = phaseOk && resonanceOk;
    
    // Confidence: inverse of combined delta, scaled to [0, 1]
    const combinedDelta = (phaseDelta + resonanceDelta) / 2;
    const confidence = Math.max(0, 1 - combinedDelta / this.threshold);
    
    // Track verification stats
    if (ok) {
      this.totalVerified++;
      this.verifications.set(id, {
        lastVerified: ts,
        confidence,
        count: (this.verifications.get(id)?.count || 0) + 1
      });
    } else {
      this.totalFailed++;
    }
    
    return {
      ok,
      phaseDelta,
      resonanceDelta,
      status: ok ? 'valid' : 'invalid',
      confidence,
      expected: {
        phase: expected.phase,
        resonance: expected.resonance
      },
      actual: {
        phase: v.phase,
        resonance: v.resonance
      }
    };
  }

  /**
   * Generate a signed token for an identifier.
   * Combines phase signature with timestamp for temporal binding.
   * 
   * @param {string} id - Entity identifier
   * @returns {Object} Signed token with phase data and timestamp
   */
  sign(id) {
    const ts = Date.now();
    const phaseData = this.phase(id, ts);
    
    return {
      id,
      timestamp: ts,
      ...phaseData,
      token: `${phaseData.sig}:${ts}:${phaseData.resonance.toFixed(6)}`
    };
  }

  /**
   * Verify a signed token within a time window.
   * 
   * @param {Object} token - Token to verify
   * @param {number} [maxAge] - Maximum age in ms (default: 5 * heartbeat)
   * @returns {VerifyResult} Verification result with timing info
   */
  verifyToken(token, maxAge = 5 * this.heartbeat) {
    const now = Date.now();
    const age = now - token.timestamp;
    
    // Check if token is too old
    if (age > maxAge) {
      this.totalFailed++;
      return {
        ok: false,
        status: 'expired',
        age,
        maxAge,
        phaseDelta: Infinity,
        resonanceDelta: Infinity,
        confidence: 0
      };
    }
    
    // Verify at original timestamp for phase/resonance check
    return {
      ...this.verify(token, token.id, token.timestamp),
      age,
      maxAge
    };
  }

  /**
   * Compute resonance between two identifiers.
   * Higher resonance indicates stronger PHI-harmonic relationship.
   * 
   * @param {string} id1 - First identifier
   * @param {string} id2 - Second identifier
   * @returns {Object} Resonance metrics
   */
  resonance(id1, id2) {
    const ts = Date.now();
    const p1 = this.phase(id1, ts);
    const p2 = this.phase(id2, ts);
    
    // Phase difference normalized to [0, π]
    let phaseDiff = Math.abs(p1.phase - p2.phase);
    if (phaseDiff > Math.PI) phaseDiff = 2 * Math.PI - phaseDiff;
    
    // Resonance: peaks when phases are φ-related
    const phiRatio = phaseDiff / PHI;
    const harmonicResonance = Math.cos(phiRatio * Math.PI);
    
    // Magnitude coupling
    const magnitudeCoupling = Math.sqrt(p1.magnitude * p2.magnitude);
    
    // Combined resonance score
    const combinedResonance = (harmonicResonance + 1) / 2 * magnitudeCoupling / (magnitudeCoupling + 1);
    
    return {
      id1,
      id2,
      phaseDiff,
      harmonicResonance,
      magnitudeCoupling,
      resonance: combinedResonance,
      phiAligned: phaseDiff < THRESHOLD
    };
  }

  /**
   * Get verification statistics.
   * 
   * @returns {Object} Verification stats
   */
  getStats() {
    return {
      totalVerified: this.totalVerified,
      totalFailed: this.totalFailed,
      successRate: this.totalVerified / (this.totalVerified + this.totalFailed) || 0,
      activeIdentities: this.verifications.size,
      threshold: this.threshold,
      heartbeat: this.heartbeat
    };
  }

  /**
   * Get verification history for an identifier.
   * 
   * @param {string} id - Entity identifier
   * @returns {Object|null} Verification history or null if not found
   */
  getHistory(id) {
    return this.verifications.get(id) || null;
  }

  /**
   * Clear verification history.
   */
  clearHistory() {
    this.verifications.clear();
    this.totalVerified = 0;
    this.totalFailed = 0;
  }
}

/**
 * Standalone phase computation (stateless)
 * @param {string} id - Entity identifier
 * @param {number} [ts] - Timestamp
 * @returns {PhaseResult} Phase result
 */
function computePhase(id, ts = Date.now()) {
  const s = [...id].reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const p = (s * PHI) % (2 * Math.PI);
  const m = Math.sqrt(s) / PHI;
  const r = Math.sin(p * PHI) * Math.cos(ts / HB);
  
  return {
    phase: p,
    magnitude: m,
    resonance: r,
    phi: (p * PHI).toFixed(6),
    sig: `${id}:${p.toFixed(4)}:${m.toFixed(4)}`
  };
}

/**
 * Standalone verification (stateless)
 * @param {PhaseResult} v - Value to verify
 * @param {string} id - Expected identifier
 * @param {number} [ts] - Timestamp
 * @returns {VerifyResult} Verification result
 */
function verifyPhase(v, id, ts = Date.now()) {
  const expected = computePhase(id, ts);
  const phaseDelta = Math.abs(v.phase - expected.phase);
  const resonanceDelta = Math.abs(v.resonance - expected.resonance);
  const ok = phaseDelta < THRESHOLD && resonanceDelta < THRESHOLD;
  
  return {
    ok,
    phaseDelta,
    resonanceDelta,
    status: ok ? 'valid' : 'invalid',
    confidence: Math.max(0, 1 - (phaseDelta + resonanceDelta) / 2 / THRESHOLD)
  };
}

// Compact version matching user's original format
const P226 = {
  phase(id, ts = Date.now()) {
    const s = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const p = (s * PHI) % (2 * Math.PI);
    const m = Math.sqrt(s) / PHI;
    const r = Math.sin(p * PHI) * Math.cos(ts / HB);
    return { phase: p, magnitude: m, resonance: r, phi: (p * PHI).toFixed(6), sig: `${id}:${p.toFixed(4)}:${m.toFixed(4)}` };
  },
  verify(v, id, ts = Date.now()) {
    const e = this.phase(id, ts);
    const dp = Math.abs(v.phase - e.phase);
    const dr = Math.abs(v.resonance - e.resonance);
    const t = 1 / PHI;
    return { ok: dp < t && dr < t, phaseDelta: dp, resonanceDelta: dr, status: (dp < t && dr < t) ? 'valid' : 'invalid' };
  }
};

export {
  P226PhaseVerificationProtocol,
  P226,
  computePhase,
  verifyPhase,
  PHI,
  HB,
  THRESHOLD
};

export default P226PhaseVerificationProtocol;

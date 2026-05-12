/**
 * PROTO-228: Alpha Resonance Protocol (ARP)
 *
 * Cross-fleet phi-resonance synchronization at the alpha commander level.
 *
 * Mathematics — Kuramoto Order Parameter:
 *
 *   Each organism is an oscillator with phase θ_k.
 *   dθ_k/dt = ω_k + (K/N) Σ_j sin(θ_j − θ_k)
 *
 *   Order parameter:   R·e^(iΨ) = (1/N) Σ_k e^(iθ_k)
 *   R ∈ [0, 1] — degree of synchrony (1 = full lock-step)
 *   Ψ — collective phase of the synchronized group
 *
 *   Alpha resonance is established when R > PHI_INV (0.618).
 *   The coupling constant K is set to PHI so the natural attractor
 *   of the fleet sits exactly at the golden-ratio synchrony boundary.
 *
 * © NOVA PROTOCOL MEDINA TECH — ITSNOTAILABS
 * Alfredo Medina, Architectus Universalis. Anno MMXXVI.
 *
 * @module alpha-resonance-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const OMEGA_0 = 2 * Math.PI / 0.873;   // natural frequency at 873ms heartbeat

class AlphaResonanceProtocol {
  /**
   * @param {{ K?: number }} config
   */
  constructor(config = {}) {
    this.id   = 'PROTO-228';
    this.name = 'Alpha Resonance Protocol';
    this.tier = 'alpha';

    this._K           = config.K ?? PHI;   // coupling constant
    this._oscillators = new Map();          // id → { theta, omega }
    this._R           = 0;                  // current order parameter magnitude
    this._Psi         = 0;                  // current collective phase
    this._synchronized = false;
    this._stepCount   = 0;
    this._peakR       = 0;
    this._syncEventCount = 0;
  }

  /**
   * Register or update an organism oscillator.
   * @param {string} id    - Organism identifier
   * @param {number} phase - Current phase θ (radians), optional
   * @param {number} omega - Natural frequency, optional
   */
  sync(id, phase, omega) {
    const existing = this._oscillators.get(id);
    this._oscillators.set(id, {
      theta: phase  ?? (existing?.theta ?? Math.random() * 2 * Math.PI),
      omega: omega  ?? (existing?.omega ?? OMEGA_0),
    });
  }

  /**
   * Advance all oscillators by dt using Kuramoto dynamics.
   * @param {number} dt - Time step in seconds (typically 0.873)
   * @returns {{ R: number, Psi: number, synchronized: boolean, phases: number[] }}
   */
  step(dt = 0.873) {
    this._stepCount++;
    const N = this._oscillators.size;
    if (N === 0) return { R: 0, Psi: 0, synchronized: false, phases: [] };

    const ids    = [...this._oscillators.keys()];
    const thetas = ids.map(id => this._oscillators.get(id).theta);

    // Kuramoto update
    for (let i = 0; i < ids.length; i++) {
      const osc = this._oscillators.get(ids[i]);
      let coupling = 0;
      for (let j = 0; j < thetas.length; j++) {
        if (j === i) continue;
        coupling += Math.sin(thetas[j] - thetas[i]);
      }
      osc.theta += dt * (osc.omega + (this._K / N) * coupling);
      // Keep θ in [0, 2π)
      osc.theta = ((osc.theta % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
    }

    // Order parameter
    let sinSum = 0;
    let cosSum = 0;
    for (const { theta } of this._oscillators.values()) {
      sinSum += Math.sin(theta);
      cosSum += Math.cos(theta);
    }
    this._R   = Math.sqrt(sinSum * sinSum + cosSum * cosSum) / N;
    this._Psi = Math.atan2(sinSum, cosSum);

    const wasSynchronized = this._synchronized;
    this._synchronized    = this._R > PHI_INV;

    if (this._synchronized && !wasSynchronized) this._syncEventCount++;
    if (this._R > this._peakR) this._peakR = this._R;

    return {
      R:            this._R,
      Psi:          this._Psi,
      synchronized: this._synchronized,
      phases:       [...this._oscillators.values()].map(o => o.theta),
    };
  }

  isSynchronized() { return this._synchronized; }
  getR()           { return this._R; }

  getState() {
    return {
      id:            this.id,
      R:             this._R,
      Psi:           this._Psi,
      synchronized:  this._synchronized,
      oscillatorCount: this._oscillators.size,
      K:             this._K,
      threshold:     PHI_INV,
      peakR:         this._peakR,
      stepCount:     this._stepCount,
      syncEvents:    this._syncEventCount,
    };
  }

  getMetrics() { return this.getState(); }
}

export { AlphaResonanceProtocol };
export default AlphaResonanceProtocol;

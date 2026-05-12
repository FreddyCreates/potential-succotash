/**
 * PROTO-227: Alpha Emergence Protocol (AEP)
 *
 * Sovereign emergence cascade amplification for the alpha-tier organism fleet.
 *
 * Theory (from "DE SYSTEMATE INTELLIGENTIAE VIVAE"):
 *   Emergence is not an event — it is a continuous process of self-organization
 *   across dimensions. The alpha-tier monitors the fleet-wide emergence signal and,
 *   when it crosses the PHI_INV threshold (≈ 0.618), amplifies the cascade by PHI.
 *
 * Mathematics:
 *   α_emergence(t) = emergenceLevel(t) × PHI
 *   cascade_active  = α_emergence > PHI_INV
 *   amplification   = cascade_active ? PHI_INV + (α_emergence - PHI_INV) × PHI : 1.0
 *
 * © NOVA PROTOCOL MEDINA TECH — ITSNOTAILABS
 * Alfredo Medina, Architectus Universalis. Anno MMXXVI.
 *
 * @module alpha-emergence-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 0.618033988749895;

class AlphaEmergenceProtocol {
  constructor() {
    this.id          = 'PROTO-227';
    this.name        = 'Alpha Emergence Protocol';
    this.tier        = 'alpha';

    this._history    = [];   // rolling window of alpha emergence values
    this._maxHistory = 100;

    this._alphaEmergence    = 0;
    this._cascadeActive     = false;
    this._amplification     = 1.0;
    this._peakAlpha         = 0;
    this._tickCount         = 0;
    this._cascadeEventCount = 0;
  }

  /**
   * Tick the alpha emergence engine with the current fleet emergence level.
   * @param {number} emergenceLevel  - Normalized 0–1 value from NeuroEmergenceProtocol
   * @returns {{ alphaEmergence: number, cascadeActive: boolean, amplification: number }}
   */
  tick(emergenceLevel = 0) {
    this._tickCount++;

    const clamped = Math.min(1, Math.max(0, emergenceLevel));

    // Alpha scales fleet emergence by PHI
    this._alphaEmergence = clamped * PHI;

    // Cascade unlocks when alpha emergence crosses PHI_INV
    const wasActive = this._cascadeActive;
    this._cascadeActive = this._alphaEmergence > PHI_INV;

    if (this._cascadeActive && !wasActive) {
      this._cascadeEventCount++;
    }

    // Amplification factor: below threshold = 1.0; above = phi-boosted overshoot
    this._amplification = this._cascadeActive
      ? PHI_INV + (this._alphaEmergence - PHI_INV) * PHI
      : 1.0;

    if (this._alphaEmergence > this._peakAlpha) {
      this._peakAlpha = this._alphaEmergence;
    }

    const result = {
      alphaEmergence: this._alphaEmergence,
      cascadeActive:  this._cascadeActive,
      amplification:  this._amplification,
    };

    this._history.push(result);
    if (this._history.length > this._maxHistory) this._history.shift();

    return result;
  }

  /** @returns {boolean} */
  isCascadeActive() { return this._cascadeActive; }

  getState() {
    return {
      id:              this.id,
      alphaEmergence:  this._alphaEmergence,
      cascadeActive:   this._cascadeActive,
      amplification:   this._amplification,
      peakAlpha:       this._peakAlpha,
      tickCount:       this._tickCount,
      cascadeEvents:   this._cascadeEventCount,
      phi:             PHI,
      threshold:       PHI_INV,
    };
  }

  getMetrics() { return this.getState(); }
}

export { AlphaEmergenceProtocol };
export default AlphaEmergenceProtocol;

/**
 * PROTO-230: Alpha Reward Protocol (ARP-R)
 *
 * Closes the Dopamine-Oxytocin feedback loop for the math synthesis circuit.
 *
 * Theory:
 *   When the middle-synthesis engine produces compressed output whose frontPower
 *   exceeds PHI_INV (≈ 0.618), it means the synthesis was high-confidence and
 *   the organism should reward itself. This protocol computes the exact DA and OX
 *   impulse magnitudes and returns them so the NeurochemistryEngine can apply them.
 *
 * Mathematics:
 *
 *   Let P = frontPower (compressed synthesis output), P ∈ [0, PHI)
 *   Let C = thoughtConfidence, C ∈ [0, 1]
 *
 *   DA impulse = (P − PHI_INV) × PHI × α_DA    if P > PHI_INV, else 0
 *   OX impulse = C × PHI_INV × α_OX             if P > PHI_INV, else 0
 *
 *   where:
 *     α_DA = 0.12  (calibrated to raise DA ≈ 12% above baseline on strong synthesis)
 *     α_OX = 0.08  (bonding signal — the organism "feels" social reward of good work)
 *
 *   The combined impulse is gated: only fires when P > PHI_INV.
 *   The threshold is exactly the golden ratio complement — no arbitrary cutoff.
 *
 * © NOVA PROTOCOL MEDINA TECH — ITSNOTAILABS
 * Alfredo Medina, Architectus Universalis. Anno MMXXVI.
 *
 * @module alpha-reward-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 0.618033988749895;

const ALPHA_DA = 0.12;   // max DA gain per synthesis reward event
const ALPHA_OX = 0.08;   // max OX gain per synthesis reward event

class AlphaRewardProtocol {
  constructor() {
    this.id   = 'PROTO-230';
    this.name = 'Alpha Reward Protocol';
    this.tier = 'alpha';

    this._rewardCount    = 0;
    this._totalDA        = 0;
    this._totalOX        = 0;
    this._history        = [];
    this._maxHistory     = 100;
    this._lastFired      = null;
  }

  /**
   * Compute the DA + OX reward impulses for a synthesis event.
   *
   * @param {number} frontPower        - Compressed synthesis output (from compression-engine)
   * @param {number} thoughtConfidence - MiniBrain confidence [0, 1]
   * @returns {{ da: number, ox: number, fired: boolean, magnitude: number, threshold: number }}
   */
  reward(frontPower = 0, thoughtConfidence = 0) {
    const P = Math.min(PHI, Math.max(0, frontPower));
    const C = Math.min(1,   Math.max(0, thoughtConfidence));

    const fired = P > PHI_INV;

    let da = 0;
    let ox = 0;

    if (fired) {
      // DA scales linearly with how far above the threshold we are, amplified by PHI
      da = (P - PHI_INV) * PHI * ALPHA_DA;
      // OX scales with thought confidence — a certain, high-quality synthesis earns more bonding
      ox = C * PHI_INV * ALPHA_OX;

      this._rewardCount++;
      this._totalDA += da;
      this._totalOX += ox;
      this._lastFired = Date.now();
    }

    const magnitude = da + ox;

    const record = {
      frontPower: P,
      thoughtConfidence: C,
      fired,
      da,
      ox,
      magnitude,
      timestamp: Date.now(),
    };

    this._history.push(record);
    if (this._history.length > this._maxHistory) this._history.shift();

    return { da, ox, fired, magnitude, threshold: PHI_INV };
  }

  getState() {
    return {
      id:          this.id,
      rewardCount: this._rewardCount,
      totalDA:     this._totalDA,
      totalOX:     this._totalOX,
      lastFired:   this._lastFired,
      threshold:   PHI_INV,
      alphaDA:     ALPHA_DA,
      alphaOX:     ALPHA_OX,
      phi:         PHI,
    };
  }

  getMetrics() { return this.getState(); }
}

export { AlphaRewardProtocol };
export default AlphaRewardProtocol;

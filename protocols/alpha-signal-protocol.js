/**
 * PROTO-229: Alpha Signal Protocol (ASP)
 *
 * PHI-weighted priority signal router through the sovereign organism fleet.
 *
 * Design principles:
 *   - Signals are priority-queued: 0 = CRITICAL, 1 = HIGH, 2 = NORMAL, 3 = LOW
 *   - Priority weight is PHI-scaled: effective_priority = declared_priority / PHI
 *     so that each priority level is 0.618× as expensive as the one above it
 *   - Alpha signals (priority 0) always preempt all beta signals (priority ≥ 1)
 *   - The dispatch queue processes signals in phi-weighted order (lowest score first)
 *   - Signal payloads are immutable once enqueued
 *
 * Priority scores (lower = dispatched first):
 *   CRITICAL (0): score = 0 / PHI = 0
 *   HIGH     (1): score = 1 / PHI ≈ 0.618
 *   NORMAL   (2): score = 2 / PHI ≈ 1.236
 *   LOW      (3): score = 3 / PHI ≈ 1.854
 *
 * © NOVA PROTOCOL MEDINA TECH — ITSNOTAILABS
 * Alfredo Medina, Architectus Universalis. Anno MMXXVI.
 *
 * @module alpha-signal-protocol
 * @version 1.0.0
 */

const PHI     = 1.618033988749895;
const PHI_INV = 0.618033988749895;

const PRIORITY = Object.freeze({ CRITICAL: 0, HIGH: 1, NORMAL: 2, LOW: 3 });

let _nextSignalId = 1;

class AlphaSignalProtocol {
  constructor() {
    this.id   = 'PROTO-229';
    this.name = 'Alpha Signal Protocol';
    this.tier = 'alpha';

    this._queue          = [];   // sorted array of { score, signal }
    this._dispatched     = [];   // rolling log, last 100
    this._maxLog         = 100;
    this._emitCount      = 0;
    this._dispatchCount  = 0;
  }

  /**
   * Emit a signal into the priority queue.
   * @param {string} type              - Signal type identifier
   * @param {0|1|2|3} priority         - PRIORITY constant
   * @param {Record<string,unknown>} payload
   * @returns {{ id: number, score: number }}
   */
  emit(type, priority = PRIORITY.NORMAL, payload = {}) {
    this._emitCount++;
    const id    = _nextSignalId++;
    const score = priority / PHI;           // phi-weighted priority score
    const signal = Object.freeze({
      id,
      type,
      priority,
      score,
      payload,
      emittedAt: Date.now(),
    });

    // Sorted insert (binary search for correct position)
    let lo = 0;
    let hi = this._queue.length;
    while (lo < hi) {
      const mid = (lo + hi) >>> 1;
      if (this._queue[mid].score <= score) lo = mid + 1;
      else hi = mid;
    }
    this._queue.splice(lo, 0, signal);

    return { id, score };
  }

  /**
   * Dispatch the next highest-priority signal.
   * @returns {Object|null} The dispatched signal, or null if queue is empty
   */
  dispatch() {
    if (this._queue.length === 0) return null;
    const signal = this._queue.shift();
    this._dispatchCount++;

    const record = { ...signal, dispatchedAt: Date.now() };
    this._dispatched.push(record);
    if (this._dispatched.length > this._maxLog) this._dispatched.shift();

    return record;
  }

  /**
   * Drain all CRITICAL signals immediately.
   * @returns {Object[]} Dispatched critical signals
   */
  drainCritical() {
    const results = [];
    while (this._queue.length > 0 && this._queue[0].priority === PRIORITY.CRITICAL) {
      results.push(this.dispatch());
    }
    return results;
  }

  /** @returns {number} Queue depth */
  depth()       { return this._queue.length; }
  /** @returns {boolean} Whether any CRITICAL signals are waiting */
  hasCritical() { return this._queue.length > 0 && this._queue[0].priority === PRIORITY.CRITICAL; }

  getState() {
    return {
      id:            this.id,
      queueDepth:    this._queue.length,
      hasCritical:   this.hasCritical(),
      emitCount:     this._emitCount,
      dispatchCount: this._dispatchCount,
      recentSignals: this._dispatched.slice(-10),
      phi:           PHI,
    };
  }

  getMetrics() { return this.getState(); }
}

export { AlphaSignalProtocol, PRIORITY };
export default AlphaSignalProtocol;

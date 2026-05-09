/**
 * PROTO-239: Alpha Security Sentinel Protocol
 * 
 * Monitors and enforces security across the organism ecosystem.
 * Detects threats, validates integrity, and manages access control.
 *
 * @module alpha-security-sentinel-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

const THREAT_LEVELS = {
  NONE: { level: 0, color: 'green' },
  LOW: { level: 1, color: 'yellow' },
  MEDIUM: { level: 2, color: 'orange' },
  HIGH: { level: 3, color: 'red' },
  CRITICAL: { level: 4, color: 'black' },
};

const SECURITY_EVENTS = {
  ACCESS_DENIED: 'access_denied',
  INTEGRITY_VIOLATION: 'integrity_violation',
  ANOMALY_DETECTED: 'anomaly_detected',
  BRUTE_FORCE_ATTEMPT: 'brute_force',
  UNAUTHORIZED_MODIFICATION: 'unauthorized_mod',
};

class AlphaSecuritySentinelProtocol {
  constructor() {
    this.id = 'PROTO-239';
    this.name = 'Alpha Security Sentinel Protocol';
    this.threatLevel = THREAT_LEVELS.NONE;
    this.events = [];
    this.integrityHashes = new Map();
    this.accessLog = [];
    this.metrics = { eventsRecorded: 0, threatEscalations: 0, integrityChecks: 0 };
  }

  recordEvent(type, details, severity = 'LOW') {
    const event = {
      id: `sec-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      type,
      details,
      severity,
      timestamp: Date.now(),
      threatContribution: THREAT_LEVELS[severity].level * PHI_INV,
    };
    this.events.push(event);
    if (this.events.length > 1000) this.events = this.events.slice(-1000);
    this.metrics.eventsRecorded++;

    // Recalculate threat level
    this.recalculateThreatLevel();

    return event;
  }

  recalculateThreatLevel() {
    // Phi-weighted decay based on recency
    const now = Date.now();
    const decayPeriod = 3600000;  // 1 hour

    let threatScore = 0;
    for (const event of this.events) {
      const age = now - event.timestamp;
      const decay = Math.exp(-age / decayPeriod * PHI_INV);
      threatScore += event.threatContribution * decay;
    }

    // Map score to threat level
    const oldLevel = this.threatLevel;
    if (threatScore >= 4) this.threatLevel = THREAT_LEVELS.CRITICAL;
    else if (threatScore >= 3) this.threatLevel = THREAT_LEVELS.HIGH;
    else if (threatScore >= 2) this.threatLevel = THREAT_LEVELS.MEDIUM;
    else if (threatScore >= 1) this.threatLevel = THREAT_LEVELS.LOW;
    else this.threatLevel = THREAT_LEVELS.NONE;

    if (this.threatLevel.level > oldLevel.level) {
      this.metrics.threatEscalations++;
    }

    return this.threatLevel;
  }

  registerIntegrity(resourceId, hash) {
    this.integrityHashes.set(resourceId, {
      hash,
      registeredAt: Date.now(),
      lastChecked: null,
      status: 'valid',
    });
    return this.integrityHashes.get(resourceId);
  }

  checkIntegrity(resourceId, currentHash) {
    const record = this.integrityHashes.get(resourceId);
    this.metrics.integrityChecks++;

    if (!record) {
      return { valid: false, reason: 'No integrity record' };
    }

    record.lastChecked = Date.now();

    if (record.hash !== currentHash) {
      record.status = 'violated';
      this.recordEvent(SECURITY_EVENTS.INTEGRITY_VIOLATION, {
        resourceId,
        expected: record.hash,
        actual: currentHash,
      }, 'HIGH');
      return { valid: false, reason: 'Hash mismatch' };
    }

    record.status = 'valid';
    return { valid: true };
  }

  logAccess(entityId, resource, action, granted) {
    const entry = {
      entityId,
      resource,
      action,
      granted,
      timestamp: Date.now(),
    };
    this.accessLog.push(entry);
    if (this.accessLog.length > 5000) this.accessLog = this.accessLog.slice(-5000);

    if (!granted) {
      this.recordEvent(SECURITY_EVENTS.ACCESS_DENIED, { entityId, resource, action }, 'LOW');
    }

    return entry;
  }

  getSecurityReport() {
    const recentEvents = this.events.filter(e => Date.now() - e.timestamp < 86400000);
    const severityCounts = {};
    for (const event of recentEvents) {
      severityCounts[event.severity] = (severityCounts[event.severity] || 0) + 1;
    }

    return {
      currentThreatLevel: this.threatLevel,
      recentEvents: recentEvents.length,
      severityCounts,
      integrityRecords: this.integrityHashes.size,
      accessLogSize: this.accessLog.length,
      metrics: this.metrics,
    };
  }

  getMetrics() { return this.metrics; }
}

export { AlphaSecuritySentinelProtocol, THREAT_LEVELS, SECURITY_EVENTS };
export default AlphaSecuritySentinelProtocol;

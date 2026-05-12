/**
 * PROTO-237: Alpha Health Monitor Protocol
 * 
 * Monitors organism health across all substrates and protocols.
 * Aggregates vitals, detects anomalies, and triggers healing.
 *
 * @module alpha-health-monitor-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

const HEALTH_THRESHOLDS = {
  CRITICAL: 0.3,
  WARNING: PHI_INV,
  HEALTHY: 0.8,
};

class AlphaHealthMonitorProtocol {
  constructor() {
    this.id = 'PROTO-237';
    this.name = 'Alpha Health Monitor Protocol';
    this.vitals = new Map();
    this.alerts = [];
    this.healingActions = [];
    this.metrics = { checksPerformed: 0, alertsTriggered: 0, healingInitiated: 0 };
  }

  recordVitals(entityId, vitals) {
    const now = Date.now();
    const record = {
      entityId,
      ...vitals,
      timestamp: now,
      healthScore: this.computeHealthScore(vitals),
    };
    
    // Store history
    const history = this.vitals.get(entityId) || [];
    history.push(record);
    if (history.length > 100) history.shift();
    this.vitals.set(entityId, history);

    this.metrics.checksPerformed++;

    // Check for alerts
    if (record.healthScore < HEALTH_THRESHOLDS.CRITICAL) {
      this.triggerAlert(entityId, 'CRITICAL', record);
    } else if (record.healthScore < HEALTH_THRESHOLDS.WARNING) {
      this.triggerAlert(entityId, 'WARNING', record);
    }

    return record;
  }

  computeHealthScore(vitals) {
    const weights = {
      cpu: PHI_INV,
      memory: PHI_INV,
      emergence: PHI,
      resonance: PHI,
      heartbeatDrift: PHI * PHI,
    };

    let score = 0;
    let totalWeight = 0;

    if (vitals.cpu !== undefined) {
      score += (1 - vitals.cpu / 100) * weights.cpu;
      totalWeight += weights.cpu;
    }
    if (vitals.memory !== undefined) {
      score += (1 - vitals.memory / 100) * weights.memory;
      totalWeight += weights.memory;
    }
    if (vitals.emergence !== undefined) {
      score += vitals.emergence * weights.emergence;
      totalWeight += weights.emergence;
    }
    if (vitals.resonance !== undefined) {
      score += vitals.resonance * weights.resonance;
      totalWeight += weights.resonance;
    }
    if (vitals.heartbeat !== undefined) {
      const drift = Math.abs(vitals.heartbeat - HEARTBEAT) / HEARTBEAT;
      score += (1 - drift) * weights.heartbeatDrift;
      totalWeight += weights.heartbeatDrift;
    }

    return totalWeight > 0 ? score / totalWeight : 0;
  }

  triggerAlert(entityId, severity, record) {
    const alert = {
      id: `alert-${Date.now()}`,
      entityId,
      severity,
      healthScore: record.healthScore,
      vitals: record,
      timestamp: Date.now(),
      status: 'active',
    };
    this.alerts.push(alert);
    this.metrics.alertsTriggered++;

    // Auto-initiate healing for critical
    if (severity === 'CRITICAL') {
      this.initiateHealing(entityId, alert);
    }

    return alert;
  }

  initiateHealing(entityId, alert) {
    const healing = {
      id: `heal-${Date.now()}`,
      entityId,
      alertId: alert.id,
      actions: [],
      status: 'initiated',
      initiatedAt: Date.now(),
    };

    // Determine healing actions based on vitals
    if (alert.vitals.cpu > 80) {
      healing.actions.push({ action: 'reduce-cpu-load', target: entityId });
    }
    if (alert.vitals.memory > 80) {
      healing.actions.push({ action: 'clear-memory-cache', target: entityId });
    }
    if (alert.vitals.emergence < 0.3) {
      healing.actions.push({ action: 'boost-emergence', target: entityId });
    }
    if (alert.vitals.heartbeat && Math.abs(alert.vitals.heartbeat - HEARTBEAT) > 50) {
      healing.actions.push({ action: 'reset-heartbeat', target: entityId });
    }

    this.healingActions.push(healing);
    this.metrics.healingInitiated++;
    alert.healingId = healing.id;

    return healing;
  }

  getHealthReport() {
    const entities = Array.from(this.vitals.entries()).map(([id, history]) => ({
      entityId: id,
      currentHealth: history[history.length - 1]?.healthScore || 0,
      trend: this.computeTrend(history),
      historyLength: history.length,
    }));

    const avgHealth = entities.reduce((sum, e) => sum + e.currentHealth, 0) / (entities.length || 1);

    return {
      overallHealth: avgHealth,
      entitiesMonitored: entities.length,
      activeAlerts: this.alerts.filter(a => a.status === 'active').length,
      pendingHealing: this.healingActions.filter(h => h.status === 'initiated').length,
      entities: entities.sort((a, b) => a.currentHealth - b.currentHealth),
    };
  }

  computeTrend(history) {
    if (history.length < 2) return 'stable';
    const recent = history.slice(-5);
    const first = recent[0].healthScore;
    const last = recent[recent.length - 1].healthScore;
    const diff = last - first;
    if (diff > 0.05) return 'improving';
    if (diff < -0.05) return 'declining';
    return 'stable';
  }

  getMetrics() { return this.metrics; }
}

export { AlphaHealthMonitorProtocol, HEALTH_THRESHOLDS };
export default AlphaHealthMonitorProtocol;

/**
 * Dark Alerting Protocol (DRK-029)
 * 
 * Internal alerting system for the dark layer. Silent notifications
 * to membrane without external telemetry.
 * 
 * Protocol ID: DRK-029
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Alert levels
 */
export const ALERT_LEVELS = {
  DEBUG: 0,
  INFO: 1,
  WARNING: 2,
  ERROR: 3,
  CRITICAL: 4,
  EMERGENCY: 5
};

/**
 * Alert categories
 */
export const ALERT_CATEGORIES = {
  SECURITY: 'security',
  PERFORMANCE: 'performance',
  AVAILABILITY: 'availability',
  INTEGRITY: 'integrity',
  COMPLIANCE: 'compliance'
};

/**
 * Alert
 */
export class DarkAlert {
  constructor(level, category, message, data = {}) {
    this.id = `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    this.level = level;
    this.category = category;
    this.message = message;
    this.data = data;
    this.timestamp = Date.now();
    this.acknowledged = false;
    this.acknowledgedAt = null;
    this.resolvedAt = null;
    this.phi = this.computePhi();
  }
  
  computePhi() {
    const str = `${this.level}:${this.category}:${this.message}`;
    let sum = 0;
    for (let i = 0; i < str.length; i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  acknowledge(by = 'system') {
    this.acknowledged = true;
    this.acknowledgedAt = Date.now();
    this.acknowledgedBy = by;
  }
  
  resolve(resolution = '') {
    this.resolved = true;
    this.resolvedAt = Date.now();
    this.resolution = resolution;
  }
  
  toJSON() {
    return {
      id: this.id,
      level: this.level,
      category: this.category,
      message: this.message,
      data: this.data,
      timestamp: this.timestamp,
      acknowledged: this.acknowledged,
      resolved: !!this.resolved,
      phi: this.phi
    };
  }
}

/**
 * Alert Rule
 */
export class AlertRule {
  constructor(id, config) {
    this.id = id;
    this.name = config.name || id;
    this.condition = config.condition;
    this.level = config.level || ALERT_LEVELS.WARNING;
    this.category = config.category || ALERT_CATEGORIES.SECURITY;
    this.message = config.message || 'Alert triggered';
    this.cooldown = config.cooldown || 60000; // 1 minute
    this.enabled = config.enabled !== false;
    
    this.lastTriggered = 0;
    this.triggerCount = 0;
  }
  
  evaluate(context) {
    if (!this.enabled) return null;
    
    // Check cooldown
    if (Date.now() - this.lastTriggered < this.cooldown) {
      return null;
    }
    
    // Evaluate condition
    try {
      const triggered = this.condition(context);
      
      if (triggered) {
        this.lastTriggered = Date.now();
        this.triggerCount++;
        
        return new DarkAlert(
          this.level,
          this.category,
          this.message,
          { ruleId: this.id, context }
        );
      }
    } catch (e) {
      // Silent failure
    }
    
    return null;
  }
}

/**
 * Dark Alert Manager
 */
export class DarkAlertManager {
  constructor(config = {}) {
    this.config = {
      maxAlerts: config.maxAlerts || 10000,
      retentionMs: config.retentionMs || 24 * 60 * 60 * 1000, // 24 hours
      ...config
    };
    
    this.alerts = [];
    this.rules = new Map();
    this.handlers = [];
    this.suppressions = new Map();
    
    this.stats = {
      total: 0,
      byLevel: {},
      byCategory: {}
    };
  }
  
  /**
   * Create alert
   */
  alert(level, category, message, data = {}) {
    const alert = new DarkAlert(level, category, message, data);
    
    // Check suppression
    const suppressionKey = `${category}:${message}`;
    const suppression = this.suppressions.get(suppressionKey);
    if (suppression && Date.now() < suppression.until) {
      return null;
    }
    
    this.alerts.push(alert);
    
    // Update stats
    this.stats.total++;
    this.stats.byLevel[level] = (this.stats.byLevel[level] || 0) + 1;
    this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
    
    // Call handlers
    for (const handler of this.handlers) {
      try {
        handler(alert);
      } catch (e) {
        // Silent failure
      }
    }
    
    // Enforce limits
    this.cleanup();
    
    return alert;
  }
  
  /**
   * Convenience methods
   */
  debug(category, message, data) {
    return this.alert(ALERT_LEVELS.DEBUG, category, message, data);
  }
  
  info(category, message, data) {
    return this.alert(ALERT_LEVELS.INFO, category, message, data);
  }
  
  warning(category, message, data) {
    return this.alert(ALERT_LEVELS.WARNING, category, message, data);
  }
  
  error(category, message, data) {
    return this.alert(ALERT_LEVELS.ERROR, category, message, data);
  }
  
  critical(category, message, data) {
    return this.alert(ALERT_LEVELS.CRITICAL, category, message, data);
  }
  
  emergency(category, message, data) {
    return this.alert(ALERT_LEVELS.EMERGENCY, category, message, data);
  }
  
  /**
   * Add alert rule
   */
  addRule(rule) {
    if (!(rule instanceof AlertRule)) {
      rule = new AlertRule(rule.id || `rule-${Date.now()}`, rule);
    }
    this.rules.set(rule.id, rule);
    return rule;
  }
  
  /**
   * Remove rule
   */
  removeRule(ruleId) {
    return this.rules.delete(ruleId);
  }
  
  /**
   * Evaluate rules against context
   */
  evaluateRules(context) {
    const triggered = [];
    
    for (const rule of this.rules.values()) {
      const alert = rule.evaluate(context);
      if (alert) {
        this.alerts.push(alert);
        triggered.push(alert);
        
        // Update stats
        this.stats.total++;
        this.stats.byLevel[alert.level] = (this.stats.byLevel[alert.level] || 0) + 1;
        this.stats.byCategory[alert.category] = (this.stats.byCategory[alert.category] || 0) + 1;
        
        // Call handlers
        for (const handler of this.handlers) {
          try {
            handler(alert);
          } catch (e) {
            // Silent failure
          }
        }
      }
    }
    
    return triggered;
  }
  
  /**
   * Add handler
   */
  addHandler(handler) {
    this.handlers.push(handler);
  }
  
  /**
   * Suppress alerts
   */
  suppress(category, message, durationMs = 3600000) {
    const key = `${category}:${message}`;
    this.suppressions.set(key, {
      until: Date.now() + durationMs,
      reason: 'manual'
    });
  }
  
  /**
   * Acknowledge alert
   */
  acknowledge(alertId, by = 'system') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.acknowledge(by);
      return true;
    }
    return false;
  }
  
  /**
   * Resolve alert
   */
  resolve(alertId, resolution = '') {
    const alert = this.alerts.find(a => a.id === alertId);
    if (alert) {
      alert.resolve(resolution);
      return true;
    }
    return false;
  }
  
  /**
   * Get alerts
   */
  getAlerts(filter = {}) {
    let results = [...this.alerts];
    
    if (filter.level !== undefined) {
      results = results.filter(a => a.level >= filter.level);
    }
    
    if (filter.category) {
      results = results.filter(a => a.category === filter.category);
    }
    
    if (filter.since) {
      results = results.filter(a => a.timestamp >= filter.since);
    }
    
    if (filter.unacknowledged) {
      results = results.filter(a => !a.acknowledged);
    }
    
    if (filter.unresolved) {
      results = results.filter(a => !a.resolved);
    }
    
    if (filter.limit) {
      results = results.slice(-filter.limit);
    }
    
    return results.map(a => a.toJSON());
  }
  
  /**
   * Cleanup old alerts
   */
  cleanup() {
    const cutoff = Date.now() - this.config.retentionMs;
    
    this.alerts = this.alerts.filter(a => a.timestamp > cutoff);
    
    while (this.alerts.length > this.config.maxAlerts) {
      this.alerts.shift();
    }
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const recent = this.alerts.filter(a => Date.now() - a.timestamp < 3600000);
    
    return {
      ...this.stats,
      current: this.alerts.length,
      lastHour: recent.length,
      unacknowledged: this.alerts.filter(a => !a.acknowledged).length,
      unresolved: this.alerts.filter(a => !a.resolved).length,
      rules: this.rules.size
    };
  }
}

/**
 * Dark Alerting Protocol
 */
export const DarkAlertingProtocol = {
  id: 'DRK-029',
  name: 'Dark Alerting Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  levels: ALERT_LEVELS,
  categories: ALERT_CATEGORIES,
  
  createAlert: (level, category, message, data) => new DarkAlert(level, category, message, data),
  createRule: (id, config) => new AlertRule(id, config),
  createManager: (config) => new DarkAlertManager(config)
};

export default DarkAlertingProtocol;

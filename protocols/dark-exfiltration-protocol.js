/**
 * Dark Exfiltration Detection Protocol (DRK-025)
 * 
 * Detect and prevent data exfiltration attempts in the dark layer.
 * Monitor for suspicious data transfers.
 * 
 * Protocol ID: DRK-025
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Exfiltration channels
 */
export const EXFIL_CHANNELS = {
  HTTP: 'http',
  DNS: 'dns',
  WEBSOCKET: 'websocket',
  FILE_UPLOAD: 'file-upload',
  ENCODED: 'encoded'
};

/**
 * Alert severity
 */
export const ALERT_SEVERITY = {
  INFO: 'info',
  WARNING: 'warning',
  CRITICAL: 'critical'
};

/**
 * Exfiltration Detector
 */
export class ExfiltrationDetector {
  constructor(config = {}) {
    this.config = {
      maxDataSize: config.maxDataSize || 1024 * 1024, // 1MB
      maxRequestsPerMinute: config.maxRequestsPerMinute || 100,
      encodingDetection: config.encodingDetection !== false,
      ...config
    };
    
    this.entityMetrics = new Map();
    this.alerts = [];
    
    this.stats = {
      analyzed: 0,
      detected: 0,
      blocked: 0
    };
  }
  
  /**
   * Analyze request for exfiltration
   */
  analyze(entityId, request) {
    this.stats.analyzed++;
    
    const metrics = this.getEntityMetrics(entityId);
    const findings = [];
    
    // Check data size
    const dataSize = this.estimateDataSize(request);
    if (dataSize > this.config.maxDataSize) {
      findings.push({
        type: 'large-data-transfer',
        severity: ALERT_SEVERITY.WARNING,
        details: { size: dataSize, threshold: this.config.maxDataSize }
      });
    }
    
    // Check request rate
    metrics.requests.push(Date.now());
    const recentRequests = metrics.requests.filter(t => Date.now() - t < 60000);
    if (recentRequests.length > this.config.maxRequestsPerMinute) {
      findings.push({
        type: 'high-request-rate',
        severity: ALERT_SEVERITY.WARNING,
        details: { rate: recentRequests.length, threshold: this.config.maxRequestsPerMinute }
      });
    }
    metrics.requests = recentRequests;
    
    // Check for encoding
    if (this.config.encodingDetection) {
      const encoding = this.detectEncoding(request);
      if (encoding) {
        findings.push({
          type: 'suspicious-encoding',
          severity: ALERT_SEVERITY.WARNING,
          details: { encoding }
        });
      }
    }
    
    // Check for DNS tunneling
    if (request.type === 'dns' || request.hostname) {
      const dnsSuspicion = this.checkDnsTunneling(request);
      if (dnsSuspicion) {
        findings.push({
          type: 'dns-tunneling',
          severity: ALERT_SEVERITY.CRITICAL,
          details: dnsSuspicion
        });
      }
    }
    
    // Update metrics
    metrics.totalBytes += dataSize;
    metrics.lastActivity = Date.now();
    
    // Generate alert if findings
    if (findings.length > 0) {
      this.stats.detected++;
      this.createAlert(entityId, findings);
    }
    
    return {
      entityId,
      suspicious: findings.length > 0,
      findings,
      metrics: {
        totalBytes: metrics.totalBytes,
        recentRequests: recentRequests.length
      }
    };
  }
  
  /**
   * Get or create entity metrics
   */
  getEntityMetrics(entityId) {
    if (!this.entityMetrics.has(entityId)) {
      this.entityMetrics.set(entityId, {
        requests: [],
        totalBytes: 0,
        lastActivity: Date.now(),
        alertCount: 0
      });
    }
    return this.entityMetrics.get(entityId);
  }
  
  /**
   * Estimate data size
   */
  estimateDataSize(request) {
    if (request.body) {
      if (typeof request.body === 'string') return request.body.length;
      if (Buffer.isBuffer(request.body)) return request.body.length;
      return JSON.stringify(request.body).length;
    }
    return 0;
  }
  
  /**
   * Detect suspicious encoding
   */
  detectEncoding(request) {
    const body = typeof request.body === 'string' ? request.body : JSON.stringify(request.body || '');
    
    // Base64 detection
    if (/^[A-Za-z0-9+/=]{50,}$/.test(body.replace(/\s/g, ''))) {
      return 'base64';
    }
    
    // Hex encoding detection
    if (/^[0-9a-fA-F]{50,}$/.test(body)) {
      return 'hex';
    }
    
    // URL encoding detection
    if (/%[0-9A-Fa-f]{2}/.test(body) && body.split('%').length > 20) {
      return 'url-encoded';
    }
    
    return null;
  }
  
  /**
   * Check for DNS tunneling
   */
  checkDnsTunneling(request) {
    const hostname = request.hostname || request.query?.hostname || '';
    
    // Long subdomain detection
    const parts = hostname.split('.');
    const longSubdomains = parts.filter(p => p.length > 30);
    
    if (longSubdomains.length > 0) {
      return {
        type: 'long-subdomain',
        length: Math.max(...parts.map(p => p.length))
      };
    }
    
    // High entropy detection
    const entropy = this.calculateEntropy(hostname);
    if (entropy > 4) {
      return {
        type: 'high-entropy',
        entropy
      };
    }
    
    return null;
  }
  
  /**
   * Calculate string entropy
   */
  calculateEntropy(str) {
    const freq = {};
    for (const char of str) {
      freq[char] = (freq[char] || 0) + 1;
    }
    
    let entropy = 0;
    const len = str.length;
    for (const count of Object.values(freq)) {
      const p = count / len;
      entropy -= p * Math.log2(p);
    }
    
    return entropy;
  }
  
  /**
   * Create alert
   */
  createAlert(entityId, findings) {
    const maxSeverity = findings.some(f => f.severity === ALERT_SEVERITY.CRITICAL) 
      ? ALERT_SEVERITY.CRITICAL
      : ALERT_SEVERITY.WARNING;
    
    const alert = {
      id: `alert-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      entityId,
      severity: maxSeverity,
      findings,
      timestamp: Date.now()
    };
    
    this.alerts.push(alert);
    
    const metrics = this.getEntityMetrics(entityId);
    metrics.alertCount++;
    
    while (this.alerts.length > 10000) {
      this.alerts.shift();
    }
    
    return alert;
  }
  
  /**
   * Get recent alerts
   */
  getAlerts(limit = 100, severity = null) {
    let results = this.alerts;
    
    if (severity) {
      results = results.filter(a => a.severity === severity);
    }
    
    return results.slice(-limit);
  }
  
  /**
   * Get high risk entities
   */
  getHighRiskEntities(minAlerts = 3) {
    const highRisk = [];
    
    for (const [entityId, metrics] of this.entityMetrics) {
      if (metrics.alertCount >= minAlerts) {
        highRisk.push({
          entityId,
          alertCount: metrics.alertCount,
          totalBytes: metrics.totalBytes,
          lastActivity: metrics.lastActivity
        });
      }
    }
    
    return highRisk.sort((a, b) => b.alertCount - a.alertCount);
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      trackedEntities: this.entityMetrics.size,
      totalAlerts: this.alerts.length,
      detectionRate: this.stats.analyzed > 0
        ? (this.stats.detected / this.stats.analyzed * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }
}

/**
 * Dark Exfiltration Detection Protocol
 */
export const DarkExfiltrationDetectionProtocol = {
  id: 'DRK-025',
  name: 'Dark Exfiltration Detection Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  channels: EXFIL_CHANNELS,
  severity: ALERT_SEVERITY,
  
  createDetector: (config) => new ExfiltrationDetector(config)
};

export default DarkExfiltrationDetectionProtocol;

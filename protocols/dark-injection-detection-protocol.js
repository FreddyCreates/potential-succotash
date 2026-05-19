/**
 * Dark Injection Detection Protocol (DRK-026)
 * 
 * Detect injection attacks (SQL, XSS, Command) in the dark layer.
 * Silent detection without exposing security measures.
 * 
 * Protocol ID: DRK-026
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Injection types
 */
export const INJECTION_TYPES = {
  SQL: 'sql',
  XSS: 'xss',
  COMMAND: 'command',
  LDAP: 'ldap',
  XPATH: 'xpath',
  TEMPLATE: 'template'
};

/**
 * Detection results
 */
export const DETECTION_RESULTS = {
  CLEAN: 'clean',
  SUSPICIOUS: 'suspicious',
  MALICIOUS: 'malicious'
};

/**
 * Injection Pattern
 */
export class InjectionPattern {
  constructor(type, pattern, severity = 0.5) {
    this.type = type;
    this.pattern = pattern instanceof RegExp ? pattern : new RegExp(pattern, 'i');
    this.severity = severity;
    this.hits = 0;
  }
  
  test(input) {
    const match = this.pattern.test(input);
    if (match) this.hits++;
    return match;
  }
}

/**
 * Injection Detector
 */
export class InjectionDetector {
  constructor(config = {}) {
    this.config = {
      strictMode: config.strictMode || false,
      ...config
    };
    
    this.patterns = new Map();
    this.detections = [];
    
    this.stats = {
      scanned: 0,
      detected: 0,
      byType: {}
    };
    
    this.initializePatterns();
  }
  
  /**
   * Initialize detection patterns
   */
  initializePatterns() {
    // SQL Injection patterns
    this.addPattern(INJECTION_TYPES.SQL, /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|ALTER)\b.*\b(FROM|INTO|SET|TABLE)\b)/i, 0.9);
    this.addPattern(INJECTION_TYPES.SQL, /(['";]\s*(OR|AND)\s*['"]?\s*\d+\s*[=<>])/i, 0.8);
    this.addPattern(INJECTION_TYPES.SQL, /(--\s*$|#\s*$|\/\*.*\*\/)/i, 0.6);
    this.addPattern(INJECTION_TYPES.SQL, /(\bWAITFOR\b\s+\bDELAY\b|\bSLEEP\s*\()/i, 0.9);
    this.addPattern(INJECTION_TYPES.SQL, /(\bBENCHMARK\s*\()/i, 0.9);
    
    // XSS patterns
    this.addPattern(INJECTION_TYPES.XSS, /<script[^>]*>.*<\/script>/i, 0.95);
    this.addPattern(INJECTION_TYPES.XSS, /javascript:/i, 0.8);
    this.addPattern(INJECTION_TYPES.XSS, /on(load|error|click|mouseover|focus|blur)\s*=/i, 0.85);
    this.addPattern(INJECTION_TYPES.XSS, /<(img|iframe|embed|object)[^>]*(src|data)\s*=/i, 0.7);
    this.addPattern(INJECTION_TYPES.XSS, /\beval\s*\(/i, 0.8);
    
    // Command Injection patterns
    this.addPattern(INJECTION_TYPES.COMMAND, /[;&|`$]\s*(cat|ls|pwd|whoami|id|uname|curl|wget|nc|bash|sh)/i, 0.9);
    this.addPattern(INJECTION_TYPES.COMMAND, /\|\s*(bash|sh|cmd|powershell)/i, 0.9);
    this.addPattern(INJECTION_TYPES.COMMAND, /\$\((.*)\)|\`(.*)\`/i, 0.8);
    
    // LDAP Injection patterns
    this.addPattern(INJECTION_TYPES.LDAP, /[()&|!*]/i, 0.4);
    this.addPattern(INJECTION_TYPES.LDAP, /\*\)\(\w+=/i, 0.8);
    
    // XPath Injection patterns
    this.addPattern(INJECTION_TYPES.XPATH, /'\s*(or|and)\s*'/i, 0.7);
    this.addPattern(INJECTION_TYPES.XPATH, /\[contains\s*\(/i, 0.6);
    
    // Template Injection patterns
    this.addPattern(INJECTION_TYPES.TEMPLATE, /\{\{.*\}\}/i, 0.5);
    this.addPattern(INJECTION_TYPES.TEMPLATE, /\$\{.*\}/i, 0.5);
    this.addPattern(INJECTION_TYPES.TEMPLATE, /<%(=|-|_)?\s*.*\s*%>/i, 0.7);
  }
  
  /**
   * Add pattern
   */
  addPattern(type, pattern, severity) {
    if (!this.patterns.has(type)) {
      this.patterns.set(type, []);
    }
    this.patterns.get(type).push(new InjectionPattern(type, pattern, severity));
  }
  
  /**
   * Scan input for injections
   */
  scan(input, types = null) {
    this.stats.scanned++;
    
    const inputStr = typeof input === 'string' ? input : JSON.stringify(input);
    const findings = [];
    
    const typesToCheck = types || [...this.patterns.keys()];
    
    for (const type of typesToCheck) {
      const patterns = this.patterns.get(type) || [];
      
      for (const pattern of patterns) {
        if (pattern.test(inputStr)) {
          findings.push({
            type,
            pattern: pattern.pattern.source,
            severity: pattern.severity,
            matched: true
          });
        }
      }
    }
    
    // Calculate overall result
    let result = DETECTION_RESULTS.CLEAN;
    let maxSeverity = 0;
    
    for (const finding of findings) {
      maxSeverity = Math.max(maxSeverity, finding.severity);
    }
    
    if (maxSeverity >= 0.8) {
      result = DETECTION_RESULTS.MALICIOUS;
    } else if (maxSeverity >= 0.5) {
      result = DETECTION_RESULTS.SUSPICIOUS;
    }
    
    // Record detection
    if (result !== DETECTION_RESULTS.CLEAN) {
      this.stats.detected++;
      
      for (const finding of findings) {
        this.stats.byType[finding.type] = (this.stats.byType[finding.type] || 0) + 1;
      }
      
      this.detections.push({
        input: inputStr.slice(0, 200),
        result,
        findings,
        timestamp: Date.now()
      });
      
      while (this.detections.length > 1000) {
        this.detections.shift();
      }
    }
    
    return {
      result,
      severity: maxSeverity,
      findings,
      clean: result === DETECTION_RESULTS.CLEAN
    };
  }
  
  /**
   * Scan multiple inputs
   */
  scanMultiple(inputs) {
    const results = [];
    
    for (const [key, value] of Object.entries(inputs)) {
      const result = this.scan(value);
      if (!result.clean) {
        result.field = key;
        results.push(result);
      }
    }
    
    return {
      clean: results.length === 0,
      findings: results
    };
  }
  
  /**
   * Sanitize input
   */
  sanitize(input, type = null) {
    let sanitized = String(input);
    
    // Basic sanitization
    sanitized = sanitized.replace(/[<>'"]/g, (char) => {
      const entities = { '<': '&lt;', '>': '&gt;', "'": '&#39;', '"': '&quot;' };
      return entities[char];
    });
    
    // Remove null bytes
    sanitized = sanitized.replace(/\0/g, '');
    
    // Type-specific sanitization
    if (type === INJECTION_TYPES.SQL) {
      sanitized = sanitized.replace(/['";\\]/g, '');
    } else if (type === INJECTION_TYPES.COMMAND) {
      sanitized = sanitized.replace(/[;&|`$()]/g, '');
    }
    
    return sanitized;
  }
  
  /**
   * Get recent detections
   */
  getRecentDetections(limit = 100) {
    return this.detections.slice(-limit);
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      patterns: [...this.patterns.entries()].map(([type, patterns]) => ({
        type,
        count: patterns.length,
        totalHits: patterns.reduce((sum, p) => sum + p.hits, 0)
      })),
      detectionRate: this.stats.scanned > 0
        ? (this.stats.detected / this.stats.scanned * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }
}

/**
 * Dark Injection Detection Protocol
 */
export const DarkInjectionDetectionProtocol = {
  id: 'DRK-026',
  name: 'Dark Injection Detection Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  types: INJECTION_TYPES,
  results: DETECTION_RESULTS,
  
  createPattern: (type, pattern, severity) => new InjectionPattern(type, pattern, severity),
  createDetector: (config) => new InjectionDetector(config)
};

export default DarkInjectionDetectionProtocol;

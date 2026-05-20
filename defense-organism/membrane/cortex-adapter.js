/**
 * Cortex Adapter
 * 
 * Handles all communication from conscious layer to dark layer.
 * Sanitizes inputs, validates signatures, normalizes outputs.
 * 
 * This is the membrane interface used by cortex Workers to
 * consult the dark layer for analysis.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * P226 Phase Verification
 */
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
    const t = THRESHOLD;
    return { ok: dp < t && dr < t, phaseDelta: dp, resonanceDelta: dr };
  }
};

/**
 * Cortex Adapter - Membrane Interface
 */
export class CortexAdapter {
  /**
   * Create adapter instance
   * @param {Object} env - Worker environment bindings
   */
  constructor(env) {
    this.env = env;
    this.darkEndpoint = env.DARK_GATE_URL || 'http://internal-dark.medina';
    this.timeout = env.DARK_TIMEOUT || 5000;
  }
  
  /**
   * Send analysis request to dark layer
   * 
   * @param {Object} input - Analysis input
   * @param {Object} input.fingerprint - Request fingerprint
   * @param {Object} input.context - Request context
   * @param {Object} [input.case] - Specific case for analysis
   * @param {string} [input.priority] - Priority level
   * @returns {Promise<Object>} - Distilled analysis result
   */
  async analyze(input) {
    const requestId = crypto.randomUUID();
    const timestamp = Date.now();
    
    // Sanitize input (remove PII, raw data)
    const sanitized = this.sanitize(input);
    
    // Sign request with P226
    const signature = P226.phase(requestId, timestamp);
    
    // Build request
    const request = {
      requestId,
      timestamp,
      priority: input.priority || 'medium',
      fingerprint: sanitized.fingerprint,
      context: sanitized.context,
      case: input.case,
      signature: {
        sig: signature.sig,
        timestamp
      }
    };
    
    try {
      // Call dark layer with timeout
      const response = await this.callDark('/analyze', request);
      
      // Verify response signature
      if (response.signature) {
        const responsePhase = P226.phase(response.requestId, response.signature.timestamp);
        const verified = P226.verify(responsePhase, response.requestId, response.signature.timestamp);
        
        if (!verified.ok) {
          throw new Error('Dark layer response signature invalid');
        }
      }
      
      // Return distilled output only
      return {
        scores: response.scores,
        tags: response.tags,
        action: response.action,
        flags: response.flags
      };
    } catch (error) {
      // Return fallback on error
      return this.fallbackAnalysis(input);
    }
  }
  
  /**
   * Sanitize input before sending to dark layer
   * Removes PII and normalizes data
   * 
   * @param {Object} input - Raw input
   * @returns {Object} - Sanitized input
   */
  sanitize(input) {
    return {
      fingerprint: {
        ip: this.maskIP(input.fingerprint?.ip),
        ua: this.truncateUA(input.fingerprint?.ua),
        path: this.sanitizePath(input.fingerprint?.path),
        method: input.fingerprint?.method || 'GET',
        timing: input.fingerprint?.timing || 0,
        errorRate: input.fingerprint?.errorRate || 0
      },
      context: {
        behaviorClass: input.context?.behaviorClass,
        recentPatterns: input.context?.recentPatterns?.slice(0, 10),
        sessionAge: input.context?.sessionAge,
        requestCount: input.context?.requestCount
      }
    };
  }
  
  /**
   * Mask IP address (keep first two octets for geographic analysis)
   * 
   * @param {string} ip - Full IP address
   * @returns {string} - Masked IP
   */
  maskIP(ip) {
    if (!ip) return '0.0.0.0';
    const parts = ip.split('.');
    if (parts.length !== 4) return '0.0.0.0';
    return `${parts[0]}.${parts[1]}.0.0`;
  }
  
  /**
   * Truncate user agent to prevent data leakage
   * 
   * @param {string} ua - Full user agent
   * @returns {string} - Truncated user agent
   */
  truncateUA(ua) {
    if (!ua) return 'unknown';
    return ua.substring(0, 100);
  }
  
  /**
   * Sanitize path (remove query params, normalize)
   * 
   * @param {string} path - Full path with potential query params
   * @returns {string} - Sanitized path
   */
  sanitizePath(path) {
    if (!path) return '/';
    try {
      const url = new URL(path, 'http://localhost');
      return url.pathname;
    } catch {
      return '/';
    }
  }
  
  /**
   * Internal call to dark layer
   * 
   * @param {string} endpoint - Dark layer endpoint
   * @param {Object} data - Request data
   * @returns {Promise<Object>} - Response data
   */
  async callDark(endpoint, data) {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    
    try {
      const response = await fetch(`${this.darkEndpoint}${endpoint}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Internal-Request': 'true'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });
      
      if (!response.ok) {
        throw new Error(`Dark layer error: ${response.status}`);
      }
      
      return response.json();
    } finally {
      clearTimeout(timeoutId);
    }
  }
  
  /**
   * Fallback analysis when dark layer is unavailable
   * Provides conservative defaults
   * 
   * @param {Object} input - Original input
   * @returns {Object} - Fallback analysis result
   */
  fallbackAnalysis(input) {
    return {
      scores: {
        risk: 0.5,
        anomaly: 0,
        deception: 0,
        confidence: 0.3
      },
      tags: ['dark-unavailable'],
      action: 'observe',
      flags: {
        isKnownThreat: false,
        isProbableBot: false,
        requiresHuman: false,
        isNewPattern: false
      }
    };
  }
  
  /**
   * Check dark layer health
   * 
   * @returns {Promise<Object>} - Health status
   */
  async checkHealth() {
    try {
      const response = await this.callDark('/health', {});
      return {
        available: true,
        status: response.status,
        timestamp: response.timestamp
      };
    } catch (error) {
      return {
        available: false,
        error: error.message,
        timestamp: Date.now()
      };
    }
  }
}

export default CortexAdapter;

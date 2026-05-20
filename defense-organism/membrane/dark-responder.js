/**
 * Dark Responder
 * 
 * Normalizes and validates responses from dark layer to conscious layer.
 * Ensures no internal state leaks across the membrane.
 * 
 * Used by dark layer Workers to format responses
 * before sending to conscious layer.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * P226 Phase for signing responses
 */
const P226 = {
  phase(id, ts = Date.now()) {
    const s = [...id].reduce((a, c) => a + c.charCodeAt(0), 0);
    const p = (s * PHI) % (2 * Math.PI);
    const m = Math.sqrt(s) / PHI;
    const r = Math.sin(p * PHI) * Math.cos(ts / HB);
    return { phase: p, magnitude: m, resonance: r, phi: (p * PHI).toFixed(6), sig: `${id}:${p.toFixed(4)}:${m.toFixed(4)}` };
  }
};

/**
 * Internal tag prefixes that should never surface
 */
const INTERNAL_TAG_PREFIXES = [
  '_internal',
  '_shadow',
  '_debug',
  '_test',
  '_model',
  '_raw'
];

/**
 * Allowed action values
 */
const ALLOWED_ACTIONS = [
  'allow',
  'block',
  'challenge',
  'honeypot',
  'observe',
  'escalate'
];

/**
 * Dark Responder
 * 
 * Formats and sanitizes dark layer responses
 * before they cross the membrane to conscious layer.
 */
export class DarkResponder {
  /**
   * Create response for conscious layer
   * 
   * @param {string} requestId - Original request ID
   * @param {Object} analysis - Raw analysis from dark layer
   * @returns {Object} - Normalized, sanitized response
   */
  static createResponse(requestId, analysis) {
    const timestamp = Date.now();
    
    // Generate P226 signature
    const signature = P226.phase(requestId, timestamp);
    
    // Build normalized response (distilled output only)
    return {
      requestId,
      timestamp,
      scores: {
        risk: this.clampScore(analysis.riskScore),
        anomaly: this.clampScore(analysis.anomalyScore),
        deception: this.clampScore(analysis.deceptionScore),
        confidence: this.clampScore(analysis.confidence)
      },
      tags: this.sanitizeTags(analysis.tags),
      action: this.normalizeAction(analysis.recommendedAction),
      flags: {
        isKnownThreat: !!analysis.isKnownThreat,
        isProbableBot: !!analysis.isProbableBot,
        requiresHuman: !!analysis.requiresHuman,
        isNewPattern: !!analysis.isNewPattern
      },
      signature: {
        sig: signature.sig,
        timestamp
      }
    };
  }
  
  /**
   * Clamp score to valid range [0, 1]
   * 
   * @param {number} score - Raw score
   * @returns {number} - Clamped score
   */
  static clampScore(score) {
    if (typeof score !== 'number' || isNaN(score)) return 0;
    return Math.max(0, Math.min(1, score));
  }
  
  /**
   * Sanitize tags (remove internal-only tags)
   * 
   * @param {string[]} tags - Raw tags from analysis
   * @returns {string[]} - Sanitized tags
   */
  static sanitizeTags(tags) {
    if (!Array.isArray(tags)) return [];
    
    // Filter out internal-only tags
    return tags.filter(tag => {
      if (typeof tag !== 'string') return false;
      return !INTERNAL_TAG_PREFIXES.some(prefix => tag.startsWith(prefix));
    });
  }
  
  /**
   * Normalize action to allowed values
   * 
   * @param {string} action - Raw action from analysis
   * @returns {string} - Normalized action
   */
  static normalizeAction(action) {
    if (ALLOWED_ACTIONS.includes(action)) {
      return action;
    }
    return 'observe';  // Default to observe if invalid
  }
  
  /**
   * Create error response
   * 
   * @param {string} requestId - Original request ID
   * @param {string} errorCode - Error code
   * @returns {Object} - Error response
   */
  static createErrorResponse(requestId, errorCode) {
    const timestamp = Date.now();
    const signature = P226.phase(requestId, timestamp);
    
    return {
      requestId,
      timestamp,
      error: errorCode,
      scores: { risk: 0, anomaly: 0, deception: 0, confidence: 0 },
      tags: ['error'],
      action: 'observe',
      flags: {
        isKnownThreat: false,
        isProbableBot: false,
        requiresHuman: false,
        isNewPattern: false
      },
      signature: {
        sig: signature.sig,
        timestamp
      }
    };
  }
  
  /**
   * Validate that response contains no internal data
   * 
   * @param {Object} response - Response to validate
   * @returns {boolean} - True if response is safe
   */
  static validateResponse(response) {
    // Check for internal tags
    if (response.tags?.some(tag => 
      INTERNAL_TAG_PREFIXES.some(prefix => tag.startsWith(prefix))
    )) {
      return false;
    }
    
    // Check for unexpected properties
    const allowedProps = [
      'requestId', 'timestamp', 'scores', 'tags', 
      'action', 'flags', 'signature', 'error'
    ];
    
    for (const key of Object.keys(response)) {
      if (!allowedProps.includes(key)) {
        return false;
      }
    }
    
    // Check scores are valid
    if (response.scores) {
      for (const [key, value] of Object.entries(response.scores)) {
        if (typeof value !== 'number' || value < 0 || value > 1) {
          return false;
        }
      }
    }
    
    // Check action is valid
    if (response.action && !ALLOWED_ACTIONS.includes(response.action)) {
      return false;
    }
    
    return true;
  }
}

export default DarkResponder;

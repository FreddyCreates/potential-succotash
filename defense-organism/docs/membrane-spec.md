# Membrane Specification

**The Interface Between Conscious and Dark Layers**

The membrane is the critical boundary that separates the observable conscious layer from the silent dark layer. It controls what information flows between them and ensures the dark layer remains unobservable.

## Membrane Principles

1. **Conscious layer never sees dark internals**
2. **Dark layer sees more than conscious**
3. **All cross-membrane traffic is sanitized**
4. **All cross-membrane traffic is signed (P226)**

## Allowed Flows

### Conscious → Dark

**What can be sent:**

| Data Type | Description | Example |
|-----------|-------------|---------|
| Sanitized Fingerprints | IP, UA, path, timing | `{ ip: 'x.x.x.x', ua: 'Mozilla/...', path: '/api/...' }` |
| Abstracted Profiles | No PII, no raw logs | `{ behaviorClass: 'crawler', riskLevel: 'medium' }` |
| Cases | Requests for deeper analysis | `{ type: 'suspicious-pattern', priority: 'high' }` |
| Error Patterns | Anonymized error signatures | `{ errorClass: 'timeout', count: 5, window: '1h' }` |

**Mechanism:**
- Internal HTTP calls to dark Workers
- Message passing via internal queues
- Durable Object coordination

### Dark → Conscious

**What can be sent:**

| Data Type | Description | Example |
|-----------|-------------|---------|
| Scores | Risk, anomaly, deception | `{ riskScore: 0.87, anomalyScore: 0.45 }` |
| Tags | Classification labels | `['scanner', 'recon', 'llm-agent']` |
| Actions | Recommended responses | `'block'`, `'honeypot'`, `'observe'`, `'escalate'` |
| Flags | Boolean indicators | `{ isKnownThreat: true, isProbableBot: true }` |

**Mechanism:**
- Synchronous responses to cortex Workers
- Asynchronous signals to governance pipelines
- Event notifications (e.g., "new adversary class discovered")

## Forbidden Flows

| Forbidden | Reason |
|-----------|--------|
| Raw shadow memory → conscious memory | Dark state must remain internal |
| Dark logs → observability | Dark layer emits no telemetry |
| Direct external → dark access | Dark layer is internal-only |
| Dark model weights → conscious | Model internals are secret |
| Dark decision traces → conscious | How dark decides is opaque |

## Membrane Contract

### Request Format (Conscious → Dark)

```typescript
interface DarkAnalysisRequest {
  // Request metadata
  requestId: string;
  timestamp: number;
  priority: 'critical' | 'high' | 'medium' | 'low';
  
  // Sanitized fingerprint (NO PII)
  fingerprint: {
    ip: string;           // IP address
    ua: string;           // User agent
    path: string;         // Request path
    method: string;       // HTTP method
    timing: number;       // Request duration (ms)
    errorRate: number;    // Recent error rate
  };
  
  // Abstracted context (NO raw data)
  context: {
    behaviorClass?: string;   // 'crawler', 'human', 'bot', 'unknown'
    recentPatterns?: string[];// Pattern names, not data
    sessionAge?: number;      // Session duration (ms)
    requestCount?: number;    // Requests in session
  };
  
  // Case for analysis
  case?: {
    type: string;          // 'suspicious-pattern', 'anomaly', 'escalation'
    description?: string;  // Brief description
    severity?: string;     // 'info', 'warning', 'critical'
  };
  
  // P226 signature (authentication)
  signature: {
    sig: string;           // P226 signature string
    timestamp: number;     // Signature timestamp
  };
}
```

### Response Format (Dark → Conscious)

```typescript
interface DarkAnalysisResponse {
  // Request correlation
  requestId: string;
  timestamp: number;
  
  // Risk assessment
  scores: {
    risk: number;          // 0.0 - 1.0
    anomaly: number;       // 0.0 - 1.0
    deception: number;     // 0.0 - 1.0 (honeypot likelihood)
    confidence: number;    // 0.0 - 1.0 (assessment confidence)
  };
  
  // Classification tags
  tags: string[];          // ['scanner', 'recon', 'llm-agent', ...]
  
  // Recommended action
  action: 'allow' | 'block' | 'challenge' | 'honeypot' | 'observe' | 'escalate';
  
  // Flags
  flags: {
    isKnownThreat: boolean;
    isProbableBot: boolean;
    requiresHuman: boolean;
    isNewPattern: boolean;
  };
  
  // P226 signature (response authentication)
  signature: {
    sig: string;
    timestamp: number;
  };
}
```

## Cortex Adapter

The cortex adapter wraps all conscious → dark communication:

```javascript
/**
 * Cortex Adapter
 * 
 * Handles all communication from conscious layer to dark layer.
 * Sanitizes inputs, validates signatures, normalizes outputs.
 */

import { P226 } from '../../protocols/p226-phase-verification-protocol.js';

const PHI = 1.618033988749895;
const HB = 873;

export class CortexAdapter {
  constructor(env) {
    this.env = env;
    this.darkEndpoint = env.DARK_GATE_URL || 'http://internal-dark.medina';
  }
  
  /**
   * Send analysis request to dark layer
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
    
    // Call dark layer
    const response = await this.callDark('/analyze', request);
    
    // Verify response signature
    const verified = P226.verify(
      P226.phase(response.requestId, response.signature.timestamp),
      response.requestId,
      response.signature.timestamp
    );
    
    if (!verified.ok) {
      throw new Error('Dark layer response signature invalid');
    }
    
    // Return distilled output only
    return {
      scores: response.scores,
      tags: response.tags,
      action: response.action,
      flags: response.flags
    };
  }
  
  /**
   * Sanitize input before sending to dark layer
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
   * Mask IP address (keep first two octets)
   */
  maskIP(ip) {
    if (!ip) return '0.0.0.0';
    const parts = ip.split('.');
    return `${parts[0]}.${parts[1]}.0.0`;
  }
  
  /**
   * Truncate user agent
   */
  truncateUA(ua) {
    if (!ua) return 'unknown';
    return ua.substring(0, 100);
  }
  
  /**
   * Sanitize path (remove query params, normalize)
   */
  sanitizePath(path) {
    if (!path) return '/';
    const url = new URL(path, 'http://localhost');
    return url.pathname;
  }
  
  /**
   * Internal call to dark layer
   */
  async callDark(endpoint, data) {
    const response = await fetch(`${this.darkEndpoint}${endpoint}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Internal-Request': 'true'
      },
      body: JSON.stringify(data)
    });
    
    if (!response.ok) {
      throw new Error(`Dark layer error: ${response.status}`);
    }
    
    return response.json();
  }
}

export default CortexAdapter;
```

## Dark Responder

The dark responder normalizes outputs from dark layer to conscious layer:

```javascript
/**
 * Dark Responder
 * 
 * Normalizes and validates responses from dark layer.
 * Ensures no internal state leaks to conscious layer.
 */

import { P226 } from '../../protocols/p226-phase-verification-protocol.js';

export class DarkResponder {
  /**
   * Create response for conscious layer
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
   * Clamp score to [0, 1]
   */
  static clampScore(score) {
    return Math.max(0, Math.min(1, score || 0));
  }
  
  /**
   * Sanitize tags (remove internal tags)
   */
  static sanitizeTags(tags) {
    if (!Array.isArray(tags)) return [];
    
    // Filter out internal-only tags
    const internalPrefixes = ['_internal', '_shadow', '_debug'];
    return tags.filter(tag => 
      !internalPrefixes.some(prefix => tag.startsWith(prefix))
    );
  }
  
  /**
   * Normalize action to allowed values
   */
  static normalizeAction(action) {
    const allowedActions = ['allow', 'block', 'challenge', 'honeypot', 'observe', 'escalate'];
    return allowedActions.includes(action) ? action : 'observe';
  }
}

export default DarkResponder;
```

## Membrane Invariants

1. **Dark layer sees more than conscious**
   - Dark can access full fingerprint
   - Conscious only sees sanitized version

2. **Conscious layer sees only distilled outputs**
   - Scores, tags, actions, flags
   - No internal state, no decision traces

3. **Governance can configure dark usage, but not inspect internals**
   - Can enable/disable dark analysis
   - Can set thresholds for dark consultation
   - Cannot see what dark layer stores internally

4. **All cross-membrane traffic is authenticated**
   - P226 signatures on all requests
   - P226 signatures on all responses
   - Invalid signatures cause rejection

## Security Considerations

### Preventing Information Leakage

```javascript
// WRONG: Leaks internal state
const response = {
  ...analysis,  // DON'T DO THIS
  internalState: analysis._internal
};

// RIGHT: Only distilled output
const response = {
  scores: { risk: analysis.riskScore },
  tags: analysis.tags.filter(t => !t.startsWith('_')),
  action: analysis.recommendedAction
};
```

### Rate Limiting Dark Consultations

```javascript
const DARK_RATE_LIMIT = {
  maxPerMinute: 100,
  maxPerSecond: 10,
  cooldownMs: 1000
};

// Prevent overwhelming dark layer
function shouldConsultDark(context) {
  if (context.darkConsultationsThisMinute >= DARK_RATE_LIMIT.maxPerMinute) {
    return false;
  }
  return true;
}
```

### Fallback When Dark Layer Unavailable

```javascript
async function analyzeWithFallback(request, env) {
  try {
    return await cortexAdapter.analyze(request);
  } catch (error) {
    // Graceful degradation: use conscious-only analysis
    return {
      scores: { risk: 0.5, anomaly: 0, deception: 0, confidence: 0.3 },
      tags: ['dark-unavailable'],
      action: 'observe',
      flags: { isKnownThreat: false, isProbableBot: false, requiresHuman: false, isNewPattern: false }
    };
  }
}
```

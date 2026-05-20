# Dark Layer Architecture

**The Organism's Subcortex: Silent, Unlogged, Unobserved**

## Core Properties

### 1. No Telemetry
- No logs
- No traces
- No events
- No analytics
- No console output
- No Workers observability

### 2. Isolated Scope
- Only specific internal entrypoints can reach it
- Never public-facing
- Routes: `internal-dark.medina/...` (internal only)

### 3. Ephemeral by Default
- State lives in memory or short-lived KV
- Nothing durable unless explicitly shadow-stored
- Encrypted at rest

### 4. Non-Governed
- Governance layer can invoke it
- Governance layer **cannot** inspect it
- Dark layer operates outside normal compliance

## Components

### Silent Workers

Workers that run in pure dark cognition mode.

```javascript
/**
 * Silent Worker Template
 * 
 * RULES:
 * - No console.log()
 * - No event emitters
 * - No Logpush bindings
 * - No analytics bindings
 * - Only internal routes
 */
export default {
  async fetch(request, env) {
    // Verify internal origin only
    if (!isInternalRequest(request)) {
      return new Response(null, { status: 404 });
    }
    
    // Process in silence
    const result = await processInDarkness(request, env);
    
    // Return distilled output only
    return Response.json({
      score: result.riskScore,
      tags: result.tags,
      action: result.recommendedAction
    });
  }
};
```

**Silent Worker Types:**

| Worker | Purpose |
|--------|---------|
| `shadow-gate.js` | Entry point for dark analysis requests |
| `adversary-lab.js` | Behavioral analysis of threat actors |
| `anomaly-engine.js` | Statistical anomaly scoring |
| `deception-engine.js` | Honeypot and trap logic |
| `sandland-sim.js` | Dark internet simulation |

### Shadow Memory

Encrypted, ephemeral storage for dark layer state.

**Implementation Options:**

1. **Encrypted KV Namespace (`shadow-kv`)**
   - AES-256-GCM encryption
   - Short TTL (default: 1 hour)
   - No external access

2. **Shadow Cortex Durable Object**
   - In-memory state
   - Encrypted persistence
   - Coordinated shadow operations

**Usage:**
- Store adversary fingerprints
- Store behavioral patterns
- Store model states
- Store Sandland simulation state

**Access Rule:**
Never directly read by conscious layer—only via distilled signals.

### Dark Models

AI/ML models that run in the dark layer.

**Model Types:**

| Model | Function |
|-------|----------|
| Adversary Classifier | Classify threat actor types |
| Anomaly Detector | Detect statistical outliers |
| UA Fingerprint Model | Analyze user agent patterns |
| Path Pattern Model | Detect reconnaissance patterns |
| Shadow Decryptor | Analyze encrypted traffic patterns |
| Fuzzer | Generate test inputs |
| Red Team Simulator | Simulate adversary campaigns |

**Output Constraint:**
Models produce only:
- Scores (0.0 - 1.0)
- Tags (string labels)
- Actions (block, observe, honeypot, escalate)
- Flags (boolean indicators)

**Never exposed:**
- Raw internal state
- Training data
- Model weights
- Decision traces

## Dark Layer Invariants

1. **No external observability**
   - Nothing leaves to Cloudflare analytics
   - Nothing appears in Workers logs
   - Nothing triggers trace events

2. **No direct user access**
   - All requests must come via membrane
   - No public routes
   - No API keys that reach dark layer directly

3. **Only receives traffic via membrane**
   - Cortex adapter is the only entry point
   - All inputs are sanitized before crossing

4. **Can be turned off without breaking the organism**
   - Conscious layer functions independently
   - Dark layer is an enhancement, not a dependency
   - Graceful degradation if dark layer unavailable

## Activation Protocol

When does the organism use the dark layer?

```javascript
const DARK_TRIGGERS = {
  // High-risk signals
  suspiciousUA: (ua) => ua.includes('python') || ua.includes('curl'),
  knownScanner: (ip) => SCANNER_IPS.has(ip),
  anomalyScore: (score) => score > 0.7,
  
  // Pattern matches
  reconPattern: (paths) => detectReconSequence(paths),
  bruteForcePattern: (attempts) => attempts > 10,
  
  // Explicit escalation
  manualEscalation: (flag) => flag === true,
  
  // Random sampling (for training)
  sampling: () => Math.random() < 0.01  // 1% sample
};

function shouldUseDarkLayer(request, context) {
  return Object.values(DARK_TRIGGERS).some(trigger => 
    trigger(extractFeature(request, context))
  );
}
```

## Security Considerations

### What runs here (allowed)
- Adversary models
- Shadow decryptors
- Anomaly detectors
- Deception engines
- Recursive probes
- Experimental Workers
- Unlogged AI agents
- Dark-mode internet simulations
- Defense-only models
- Offensive research models

### What never runs here (forbidden)
- User authentication
- Payment processing
- PII storage
- Compliance logging
- Audit trails
- External API calls with credentials

### Encryption Requirements
- All shadow memory encrypted at rest (AES-256-GCM)
- All cross-membrane communication signed (P226)
- All model weights encrypted
- Key rotation every 24 hours

## φ-Mathematics Integration

Dark layer uses PHI-based thresholds:

```javascript
const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;  // ≈0.618

// Risk thresholds
const THRESHOLDS = {
  low: PHI_INV * 0.5,      // ≈0.309
  medium: PHI_INV,         // ≈0.618
  high: PHI_INV + 0.2,     // ≈0.818
  critical: PHI_INV * PHI  // ≈1.0
};

// Heartbeat for temporal analysis
const HB = 873;  // ms

// Decay rate for threat memory
const DECAY_RATE = PHI_INV * PHI_INV;  // ≈0.382
```

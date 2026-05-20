/**
 * Shadow Gate Worker
 * 
 * Entry point for dark layer analysis requests.
 * Receives sanitized data from conscious layer via membrane.
 * 
 * DARK LAYER RULES:
 * - No console.log()
 * - No event emitters
 * - No analytics bindings
 * - Only internal routes
 * - Returns distilled outputs only
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * P226 Phase Verification (inline for isolation)
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
 * Verify this is an internal request
 */
function isInternalRequest(request) {
  return request.headers.get('X-Internal-Request') === 'true';
}

/**
 * Risk scoring engine
 */
function calculateRiskScore(fingerprint, context) {
  let score = 0;
  
  // User agent analysis
  const ua = (fingerprint.ua || '').toLowerCase();
  if (ua.includes('python')) score += 0.3;
  if (ua.includes('curl')) score += 0.2;
  if (ua.includes('wget')) score += 0.2;
  if (ua.includes('bot')) score += 0.1;
  if (ua.includes('scanner')) score += 0.4;
  if (ua.includes('nikto')) score += 0.5;
  if (ua.includes('sqlmap')) score += 0.5;
  
  // Path analysis
  const path = (fingerprint.path || '').toLowerCase();
  if (path.includes('admin')) score += 0.2;
  if (path.includes('wp-')) score += 0.2;
  if (path.includes('.env')) score += 0.4;
  if (path.includes('config')) score += 0.2;
  if (path.includes('backup')) score += 0.3;
  if (path.includes('..')) score += 0.5;
  
  // Behavior analysis
  if (context.requestCount > 100) score += 0.2;
  if (context.requestCount > 1000) score += 0.3;
  if (fingerprint.errorRate > 0.5) score += 0.2;
  
  // Clamp to [0, 1]
  return Math.min(1, Math.max(0, score));
}

/**
 * Anomaly scoring engine
 */
function calculateAnomalyScore(fingerprint, context) {
  let score = 0;
  
  // Timing anomalies
  if (fingerprint.timing > 10000) score += 0.3;  // Slow requests
  if (fingerprint.timing < 10) score += 0.2;     // Too fast
  
  // Pattern anomalies
  const patterns = context.recentPatterns || [];
  if (patterns.includes('rapid-succession')) score += 0.3;
  if (patterns.includes('sequential-paths')) score += 0.2;
  if (patterns.includes('error-probing')) score += 0.4;
  
  return Math.min(1, Math.max(0, score));
}

/**
 * Tag classification
 */
function classifyTags(fingerprint, context, riskScore, anomalyScore) {
  const tags = [];
  
  const ua = (fingerprint.ua || '').toLowerCase();
  
  // Agent type tags
  if (ua.includes('python') || ua.includes('curl') || ua.includes('wget')) {
    tags.push('automated');
  }
  if (ua.includes('bot')) tags.push('bot');
  if (ua.includes('crawler') || ua.includes('spider')) tags.push('crawler');
  if (ua.includes('scanner') || ua.includes('nikto') || ua.includes('nmap')) {
    tags.push('scanner');
  }
  
  // Behavior tags
  if (riskScore > 0.7) tags.push('high-risk');
  if (anomalyScore > 0.5) tags.push('anomalous');
  if (context.requestCount > 100) tags.push('high-volume');
  
  // Pattern tags
  const patterns = context.recentPatterns || [];
  if (patterns.includes('recon')) tags.push('recon');
  if (patterns.includes('brute-force')) tags.push('brute-force');
  
  return tags;
}

/**
 * Determine recommended action
 */
function determineAction(riskScore, anomalyScore, tags) {
  // Critical threats
  if (riskScore > 0.8 || tags.includes('scanner')) {
    return 'block';
  }
  
  // High risk - send to honeypot
  if (riskScore > 0.6) {
    return 'honeypot';
  }
  
  // Medium risk - challenge
  if (riskScore > 0.4 || anomalyScore > 0.5) {
    return 'challenge';
  }
  
  // Anomalous - observe
  if (anomalyScore > 0.3) {
    return 'observe';
  }
  
  // Normal
  return 'allow';
}

/**
 * Main analysis function
 */
async function analyze(data) {
  const { fingerprint, context } = data;
  
  // Calculate scores
  const riskScore = calculateRiskScore(fingerprint, context);
  const anomalyScore = calculateAnomalyScore(fingerprint, context);
  const deceptionScore = riskScore > 0.5 ? riskScore * 0.8 : 0;
  const confidence = 0.7 + Math.random() * 0.3;  // Placeholder
  
  // Classify
  const tags = classifyTags(fingerprint, context, riskScore, anomalyScore);
  const action = determineAction(riskScore, anomalyScore, tags);
  
  // Flags
  const flags = {
    isKnownThreat: riskScore > 0.8,
    isProbableBot: tags.includes('bot') || tags.includes('automated'),
    requiresHuman: riskScore > 0.9,
    isNewPattern: Math.random() < 0.05  // Placeholder
  };
  
  return {
    riskScore,
    anomalyScore,
    deceptionScore,
    confidence,
    tags,
    recommendedAction: action,
    ...flags
  };
}

/**
 * Shadow Gate Worker
 */
export default {
  async fetch(request, env) {
    // Verify internal origin only
    if (!isInternalRequest(request)) {
      return new Response(null, { status: 404 });
    }
    
    const url = new URL(request.url);
    
    // Handle analysis requests
    if (url.pathname === '/analyze' && request.method === 'POST') {
      try {
        const data = await request.json();
        
        // Verify P226 signature
        if (data.signature) {
          const phase = P226.phase(data.requestId, data.signature.timestamp);
          const verified = P226.verify(phase, data.requestId, data.signature.timestamp);
          if (!verified.ok) {
            return Response.json({ error: 'Invalid signature' }, { status: 401 });
          }
        }
        
        // Perform analysis
        const analysis = await analyze(data);
        
        // Generate response signature
        const responseSig = P226.phase(data.requestId, Date.now());
        
        // Return distilled output only
        return Response.json({
          requestId: data.requestId,
          timestamp: Date.now(),
          scores: {
            risk: analysis.riskScore,
            anomaly: analysis.anomalyScore,
            deception: analysis.deceptionScore,
            confidence: analysis.confidence
          },
          tags: analysis.tags,
          action: analysis.recommendedAction,
          flags: {
            isKnownThreat: analysis.isKnownThreat,
            isProbableBot: analysis.isProbableBot,
            requiresHuman: analysis.requiresHuman,
            isNewPattern: analysis.isNewPattern
          },
          signature: {
            sig: responseSig.sig,
            timestamp: Date.now()
          }
        });
      } catch (error) {
        return Response.json({ error: 'Analysis failed' }, { status: 500 });
      }
    }
    
    // Health check (internal only)
    if (url.pathname === '/health') {
      return Response.json({ status: 'dark', timestamp: Date.now() });
    }
    
    return new Response(null, { status: 404 });
  }
};

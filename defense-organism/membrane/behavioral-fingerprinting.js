/**
 * Behavioral Fingerprinting Engine - Dark Layer Identity
 * 
 * Creates unique behavioral fingerprints for agents based on
 * interaction patterns, timing, and request characteristics.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Fingerprint components
 */
export const FINGERPRINT_COMPONENTS = {
  TIMING: 'timing',           // Request timing patterns
  NAVIGATION: 'navigation',   // Path traversal patterns
  HEADERS: 'headers',         // Header signatures
  INTERACTION: 'interaction', // Mouse/keyboard behavior
  TECHNICAL: 'technical',     // Browser/client capabilities
  BEHAVIORAL: 'behavioral'    // High-level behavior patterns
};

/**
 * Timing feature extractor
 */
const extractTimingFeatures = (events) => {
  if (events.length < 2) {
    return { hasData: false };
  }
  
  const intervals = [];
  for (let i = 1; i < events.length; i++) {
    intervals.push(events[i].timestamp - events[i - 1].timestamp);
  }
  
  // Statistical features
  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;
  const stdDev = Math.sqrt(variance);
  
  // Timing pattern features
  const sorted = [...intervals].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  
  // Regularity score (how consistent the timing is)
  const regularity = 1 / (1 + stdDev / mean);
  
  // Burst detection (rapid sequences)
  const burstThreshold = mean * 0.1;
  const bursts = intervals.filter(i => i < burstThreshold).length;
  
  // Human-like timing (irregular but not too fast)
  const humanLikeness = regularity < 0.8 && min > 100 ? 
    Math.min(1, (1 - regularity) * (min / 1000)) : 0;
  
  return {
    hasData: true,
    mean,
    median,
    stdDev,
    min,
    max,
    regularity,
    burstRatio: bursts / intervals.length,
    humanLikeness,
    sampleSize: intervals.length
  };
};

/**
 * Navigation feature extractor
 */
const extractNavigationFeatures = (events) => {
  const paths = events.map(e => e.path).filter(Boolean);
  
  if (paths.length < 2) {
    return { hasData: false };
  }
  
  // Path statistics
  const uniquePaths = new Set(paths);
  const pathDepths = paths.map(p => (p.match(/\//g) || []).length);
  const avgDepth = pathDepths.reduce((a, b) => a + b, 0) / pathDepths.length;
  
  // Sequential vs random access
  let sequential = 0;
  let backtracking = 0;
  
  for (let i = 1; i < paths.length; i++) {
    const prev = paths[i - 1];
    const curr = paths[i];
    
    // Check if current is a child of previous
    if (curr.startsWith(prev) || prev.startsWith(curr)) {
      sequential++;
    }
    
    // Check for backtracking
    if (i > 1 && paths[i - 2] === curr) {
      backtracking++;
    }
  }
  
  // Pattern detection
  const hasAdminProbe = paths.some(p => p.includes('admin'));
  const hasApiExploration = paths.some(p => p.includes('api'));
  const hasConfigProbe = paths.some(p => 
    p.includes('.env') || p.includes('config') || p.includes('.git')
  );
  
  // Coverage score (how much of the site is explored)
  const coverage = uniquePaths.size / paths.length;
  
  return {
    hasData: true,
    totalPaths: paths.length,
    uniquePaths: uniquePaths.size,
    avgDepth,
    maxDepth: Math.max(...pathDepths),
    sequentialRatio: sequential / paths.length,
    backtrackingRatio: backtracking / paths.length,
    coverage,
    hasAdminProbe,
    hasApiExploration,
    hasConfigProbe
  };
};

/**
 * Header feature extractor
 */
const extractHeaderFeatures = (events) => {
  const headerSets = events.map(e => e.headers).filter(Boolean);
  
  if (headerSets.length === 0) {
    return { hasData: false };
  }
  
  // Common headers across requests
  const allHeaders = new Set();
  const headerCounts = {};
  
  for (const headers of headerSets) {
    for (const key of Object.keys(headers)) {
      allHeaders.add(key.toLowerCase());
      headerCounts[key.toLowerCase()] = (headerCounts[key.toLowerCase()] || 0) + 1;
    }
  }
  
  // Consistency score
  const consistentHeaders = Object.entries(headerCounts)
    .filter(([_, count]) => count === headerSets.length)
    .map(([key]) => key);
  
  const consistency = consistentHeaders.length / allHeaders.size;
  
  // Feature detection
  const sample = headerSets[0];
  const hasAcceptLanguage = 'accept-language' in sample;
  const hasAcceptEncoding = 'accept-encoding' in sample;
  const hasCookies = 'cookie' in sample;
  const hasReferer = 'referer' in sample;
  
  // Browser indicators
  const ua = sample['user-agent'] || '';
  const isBrowserLike = hasAcceptLanguage && hasAcceptEncoding && ua.includes('Mozilla');
  
  return {
    hasData: true,
    totalHeaders: allHeaders.size,
    consistentHeaders: consistentHeaders.length,
    consistency,
    hasAcceptLanguage,
    hasAcceptEncoding,
    hasCookies,
    hasReferer,
    isBrowserLike
  };
};

/**
 * Behavioral Fingerprint
 */
export class BehavioralFingerprint {
  constructor(agentId) {
    this.agentId = agentId;
    this.created = Date.now();
    this.updated = Date.now();
    
    this.events = [];
    this.features = {};
    this.hash = null;
    this.confidence = 0;
    
    this.maxEvents = 1000;
  }
  
  /**
   * Record an event
   */
  recordEvent(event) {
    this.events.push({
      timestamp: Date.now(),
      path: event.path,
      method: event.method,
      headers: event.headers,
      responseTime: event.responseTime,
      statusCode: event.statusCode,
      ...event
    });
    
    // Trim old events
    if (this.events.length > this.maxEvents) {
      this.events = this.events.slice(-this.maxEvents);
    }
    
    this.updated = Date.now();
    
    // Recompute fingerprint periodically
    if (this.events.length % 10 === 0) {
      this.compute();
    }
  }
  
  /**
   * Compute fingerprint
   */
  compute() {
    this.features = {
      timing: extractTimingFeatures(this.events),
      navigation: extractNavigationFeatures(this.events),
      headers: extractHeaderFeatures(this.events)
    };
    
    // Compute hash
    this.hash = this.computeHash();
    
    // Compute confidence based on data quality
    this.confidence = this.computeConfidence();
    
    return this;
  }
  
  /**
   * Compute fingerprint hash
   */
  computeHash() {
    const components = [];
    
    // Timing signature
    if (this.features.timing.hasData) {
      const t = this.features.timing;
      components.push(`T:${t.regularity.toFixed(2)}:${t.humanLikeness.toFixed(2)}`);
    }
    
    // Navigation signature
    if (this.features.navigation.hasData) {
      const n = this.features.navigation;
      components.push(`N:${n.coverage.toFixed(2)}:${n.sequentialRatio.toFixed(2)}`);
    }
    
    // Header signature
    if (this.features.headers.hasData) {
      const h = this.features.headers;
      components.push(`H:${h.consistency.toFixed(2)}:${h.isBrowserLike ? 1 : 0}`);
    }
    
    // Generate hash
    const str = components.join('|');
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    
    return Math.abs(hash).toString(16).padStart(8, '0');
  }
  
  /**
   * Compute confidence score
   */
  computeConfidence() {
    let score = 0;
    let factors = 0;
    
    // Event count factor
    const eventFactor = Math.min(1, this.events.length / 50);
    score += eventFactor;
    factors++;
    
    // Feature completeness
    for (const [key, feature] of Object.entries(this.features)) {
      if (feature.hasData) {
        score += 1;
      }
      factors++;
    }
    
    // Data quality
    if (this.features.timing.hasData && this.features.timing.sampleSize > 10) {
      score += 0.5;
      factors += 0.5;
    }
    
    return score / factors;
  }
  
  /**
   * Compare with another fingerprint
   */
  compareTo(other) {
    if (!this.hash || !other.hash) {
      return { similarity: 0, confidence: 0 };
    }
    
    let similarity = 0;
    let weights = 0;
    
    // Compare timing features
    if (this.features.timing.hasData && other.features.timing.hasData) {
      const t1 = this.features.timing;
      const t2 = other.features.timing;
      
      const regDiff = Math.abs(t1.regularity - t2.regularity);
      const humanDiff = Math.abs(t1.humanLikeness - t2.humanLikeness);
      
      similarity += (1 - regDiff) * 0.5 + (1 - humanDiff) * 0.5;
      weights += 1;
    }
    
    // Compare navigation features
    if (this.features.navigation.hasData && other.features.navigation.hasData) {
      const n1 = this.features.navigation;
      const n2 = other.features.navigation;
      
      const coverageDiff = Math.abs(n1.coverage - n2.coverage);
      const seqDiff = Math.abs(n1.sequentialRatio - n2.sequentialRatio);
      
      similarity += (1 - coverageDiff) * 0.5 + (1 - seqDiff) * 0.5;
      weights += 1;
    }
    
    // Compare header features
    if (this.features.headers.hasData && other.features.headers.hasData) {
      const h1 = this.features.headers;
      const h2 = other.features.headers;
      
      const consDiff = Math.abs(h1.consistency - h2.consistency);
      const browserMatch = h1.isBrowserLike === h2.isBrowserLike ? 1 : 0;
      
      similarity += (1 - consDiff) * 0.5 + browserMatch * 0.5;
      weights += 1;
    }
    
    const finalSimilarity = weights > 0 ? similarity / weights : 0;
    const combinedConfidence = (this.confidence + other.confidence) / 2;
    
    return {
      similarity: finalSimilarity,
      confidence: combinedConfidence,
      isMatch: finalSimilarity > THRESHOLD && combinedConfidence > 0.5
    };
  }
  
  /**
   * Get summary
   */
  getSummary() {
    return {
      agentId: this.agentId,
      hash: this.hash,
      confidence: this.confidence,
      eventCount: this.events.length,
      created: this.created,
      updated: this.updated,
      features: {
        timing: this.features.timing?.hasData ? {
          regularity: this.features.timing.regularity,
          humanLikeness: this.features.timing.humanLikeness
        } : null,
        navigation: this.features.navigation?.hasData ? {
          coverage: this.features.navigation.coverage,
          hasAdminProbe: this.features.navigation.hasAdminProbe,
          hasConfigProbe: this.features.navigation.hasConfigProbe
        } : null,
        headers: this.features.headers?.hasData ? {
          isBrowserLike: this.features.headers.isBrowserLike,
          consistency: this.features.headers.consistency
        } : null
      }
    };
  }
}

/**
 * Behavioral Fingerprinting Engine
 */
export class BehavioralFingerprintingEngine {
  constructor(config = {}) {
    this.config = {
      maxFingerprints: config.maxFingerprints || 100000,
      matchThreshold: config.matchThreshold || THRESHOLD,
      clusteringEnabled: config.clusteringEnabled !== false,
      ...config
    };
    
    this.fingerprints = new Map();
    this.hashIndex = new Map(); // Hash -> [agentIds]
    
    this.stats = {
      fingerprintsCreated: 0,
      eventsRecorded: 0,
      matchesFound: 0,
      clustersIdentified: 0
    };
  }
  
  /**
   * Record event for an agent
   */
  record(agentId, event) {
    let fingerprint = this.fingerprints.get(agentId);
    
    if (!fingerprint) {
      fingerprint = new BehavioralFingerprint(agentId);
      this.fingerprints.set(agentId, fingerprint);
      this.stats.fingerprintsCreated++;
      
      // Cleanup if over limit
      if (this.fingerprints.size > this.config.maxFingerprints) {
        this.evictOldest();
      }
    }
    
    const oldHash = fingerprint.hash;
    fingerprint.recordEvent(event);
    this.stats.eventsRecorded++;
    
    // Update hash index
    if (fingerprint.hash !== oldHash) {
      this.updateHashIndex(agentId, oldHash, fingerprint.hash);
    }
    
    return fingerprint;
  }
  
  /**
   * Get fingerprint
   */
  get(agentId) {
    return this.fingerprints.get(agentId);
  }
  
  /**
   * Find similar fingerprints
   */
  findSimilar(agentId, limit = 10) {
    const fingerprint = this.fingerprints.get(agentId);
    if (!fingerprint || !fingerprint.hash) {
      return [];
    }
    
    const results = [];
    
    // First check hash matches
    const hashMatches = this.hashIndex.get(fingerprint.hash) || [];
    for (const matchId of hashMatches) {
      if (matchId !== agentId) {
        const match = this.fingerprints.get(matchId);
        if (match) {
          results.push({
            agentId: matchId,
            ...fingerprint.compareTo(match)
          });
        }
      }
    }
    
    // Then check partial matches (more expensive)
    if (results.length < limit && this.config.clusteringEnabled) {
      for (const [otherId, other] of this.fingerprints) {
        if (otherId !== agentId && !hashMatches.includes(otherId)) {
          const comparison = fingerprint.compareTo(other);
          if (comparison.similarity > this.config.matchThreshold * 0.8) {
            results.push({
              agentId: otherId,
              ...comparison
            });
            this.stats.matchesFound++;
          }
        }
        
        if (results.length >= limit * 2) break;
      }
    }
    
    // Sort by similarity
    results.sort((a, b) => b.similarity - a.similarity);
    
    return results.slice(0, limit);
  }
  
  /**
   * Identify clusters
   */
  identifyClusters() {
    const clusters = new Map();
    
    for (const [agentId, fingerprint] of this.fingerprints) {
      if (!fingerprint.hash) continue;
      
      if (!clusters.has(fingerprint.hash)) {
        clusters.set(fingerprint.hash, []);
      }
      clusters.get(fingerprint.hash).push(agentId);
    }
    
    // Filter to clusters with multiple members
    const significantClusters = [];
    for (const [hash, members] of clusters) {
      if (members.length > 1) {
        significantClusters.push({
          hash,
          members,
          size: members.length
        });
        this.stats.clustersIdentified++;
      }
    }
    
    return significantClusters.sort((a, b) => b.size - a.size);
  }
  
  /**
   * Update hash index
   */
  updateHashIndex(agentId, oldHash, newHash) {
    // Remove from old hash
    if (oldHash && this.hashIndex.has(oldHash)) {
      const agents = this.hashIndex.get(oldHash);
      const index = agents.indexOf(agentId);
      if (index > -1) {
        agents.splice(index, 1);
      }
      if (agents.length === 0) {
        this.hashIndex.delete(oldHash);
      }
    }
    
    // Add to new hash
    if (newHash) {
      if (!this.hashIndex.has(newHash)) {
        this.hashIndex.set(newHash, []);
      }
      this.hashIndex.get(newHash).push(agentId);
    }
  }
  
  /**
   * Evict oldest fingerprint
   */
  evictOldest() {
    let oldest = null;
    let oldestTime = Infinity;
    
    for (const [agentId, fingerprint] of this.fingerprints) {
      if (fingerprint.updated < oldestTime) {
        oldestTime = fingerprint.updated;
        oldest = agentId;
      }
    }
    
    if (oldest) {
      const fp = this.fingerprints.get(oldest);
      if (fp && fp.hash) {
        this.updateHashIndex(oldest, fp.hash, null);
      }
      this.fingerprints.delete(oldest);
    }
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      activeFingerprints: this.fingerprints.size,
      uniqueHashes: this.hashIndex.size,
      avgConfidence: this.computeAvgConfidence()
    };
  }
  
  /**
   * Compute average confidence
   */
  computeAvgConfidence() {
    if (this.fingerprints.size === 0) return 0;
    
    let total = 0;
    for (const fp of this.fingerprints.values()) {
      total += fp.confidence;
    }
    
    return total / this.fingerprints.size;
  }
}

export default BehavioralFingerprintingEngine;

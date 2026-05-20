/**
 * AI Biome Interaction Protocol (BIO-001)
 * 
 * Protocol for interacting with the AI Biome — the emerging
 * ecosystem of artificial intelligences on the internet.
 * 
 * Protocol ID: BIO-001
 * Category: Dark Cognition
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Agent taxonomy in the AI Biome
 */
export const BIOME_TAXONOMY = {
  // Search & Discovery
  SEARCH_BOT: {
    category: 'crawler',
    behavior: 'systematic',
    threat: 'low',
    examples: ['Googlebot', 'Bingbot', 'DuckDuckBot']
  },
  
  // AI Assistants
  LLM_AGENT: {
    category: 'ai-agent',
    behavior: 'adaptive',
    threat: 'variable',
    examples: ['GPT-4', 'Claude', 'Perplexity']
  },
  
  // Research & Archive
  ARCHIVER: {
    category: 'crawler',
    behavior: 'comprehensive',
    threat: 'low',
    examples: ['Wayback', 'CommonCrawl']
  },
  
  // Security
  SECURITY_SCANNER: {
    category: 'scanner',
    behavior: 'probing',
    threat: 'variable',
    examples: ['Qualys', 'Nessus', 'Shodan']
  },
  
  // Malicious
  BOTNET_NODE: {
    category: 'malicious',
    behavior: 'coordinated',
    threat: 'high',
    examples: ['Mirai', 'Emotet']
  },
  
  APT_AGENT: {
    category: 'malicious',
    behavior: 'persistent',
    threat: 'critical',
    examples: ['APT28', 'Lazarus']
  },
  
  // Automation
  API_CLIENT: {
    category: 'automated',
    behavior: 'programmatic',
    threat: 'low',
    examples: ['Integrations', 'Webhooks']
  },
  
  // Research
  RESEARCHER: {
    category: 'researcher',
    behavior: 'exploratory',
    threat: 'low',
    examples: ['Academic', 'Security']
  }
};

/**
 * Interaction modes
 */
export const INTERACTION_MODES = {
  OBSERVE: 'observe',       // Passive monitoring
  ENGAGE: 'engage',         // Active interaction
  CHALLENGE: 'challenge',   // Verification
  DECEIVE: 'deceive',       // Deception
  COLLABORATE: 'collaborate', // Cooperation
  BLOCK: 'block'            // Denial
};

/**
 * Biome signals
 */
export const BIOME_SIGNALS = {
  // Positive signals
  LEGITIMATE_CRAWLER: { weight: -0.3, description: 'Known search engine' },
  VERIFIED_AGENT: { weight: -0.2, description: 'Verified AI agent' },
  RESEARCH_ACTIVITY: { weight: -0.1, description: 'Research-like behavior' },
  
  // Neutral signals
  UNKNOWN_AGENT: { weight: 0, description: 'Unknown agent type' },
  
  // Negative signals
  SCANNING_PATTERN: { weight: 0.2, description: 'Security scanning detected' },
  ENUMERATION_PATTERN: { weight: 0.3, description: 'Resource enumeration' },
  CREDENTIAL_PROBING: { weight: 0.5, description: 'Auth testing' },
  INJECTION_ATTEMPT: { weight: 0.7, description: 'Injection attempt' },
  C2_COMMUNICATION: { weight: 0.9, description: 'C2 pattern detected' }
};

/**
 * Biome Agent Profile
 */
export class BiomeAgentProfile {
  constructor(fingerprint) {
    this.id = crypto.randomUUID();
    this.fingerprint = fingerprint;
    this.created = Date.now();
    this.lastSeen = Date.now();
    
    this.classification = {
      type: 'UNKNOWN',
      confidence: 0,
      category: 'unknown'
    };
    
    this.signals = [];
    this.riskScore = 0.5;
    this.interactionMode = INTERACTION_MODES.OBSERVE;
    
    this.behavior = {
      requestCount: 0,
      uniquePaths: new Set(),
      methods: new Set(),
      timing: [],
      patterns: []
    };
    
    this.relationships = [];
  }
  
  /**
   * Record interaction
   */
  recordInteraction(request) {
    this.lastSeen = Date.now();
    this.behavior.requestCount++;
    this.behavior.uniquePaths.add(request.path);
    this.behavior.methods.add(request.method);
    
    // Track timing
    if (this.behavior.timing.length > 0) {
      const lastTime = this.behavior.timing[this.behavior.timing.length - 1];
      const interval = Date.now() - lastTime;
      this.behavior.patterns.push({ type: 'interval', value: interval });
    }
    this.behavior.timing.push(Date.now());
    
    // Trim timing history
    if (this.behavior.timing.length > 100) {
      this.behavior.timing = this.behavior.timing.slice(-100);
    }
  }
  
  /**
   * Add signal
   */
  addSignal(signalType) {
    const signal = BIOME_SIGNALS[signalType];
    if (signal) {
      this.signals.push({
        type: signalType,
        weight: signal.weight,
        timestamp: Date.now()
      });
      
      // Update risk score
      this.updateRiskScore();
    }
  }
  
  /**
   * Update risk score
   */
  updateRiskScore() {
    if (this.signals.length === 0) {
      this.riskScore = 0.5;
      return;
    }
    
    // Recent signals weighted more heavily
    const now = Date.now();
    let totalWeight = 0;
    let totalScore = 0;
    
    for (const signal of this.signals) {
      const age = now - signal.timestamp;
      const decay = Math.exp(-age / (HB * 1000));
      totalWeight += decay;
      totalScore += signal.weight * decay;
    }
    
    // Normalize to 0-1
    this.riskScore = Math.max(0, Math.min(1, 0.5 + totalScore / Math.max(1, totalWeight)));
    
    // Update interaction mode based on risk
    this.updateInteractionMode();
  }
  
  /**
   * Update interaction mode
   */
  updateInteractionMode() {
    if (this.riskScore < 0.2) {
      this.interactionMode = INTERACTION_MODES.COLLABORATE;
    } else if (this.riskScore < 0.4) {
      this.interactionMode = INTERACTION_MODES.OBSERVE;
    } else if (this.riskScore < 0.6) {
      this.interactionMode = INTERACTION_MODES.ENGAGE;
    } else if (this.riskScore < 0.8) {
      this.interactionMode = INTERACTION_MODES.CHALLENGE;
    } else if (this.riskScore < 0.9) {
      this.interactionMode = INTERACTION_MODES.DECEIVE;
    } else {
      this.interactionMode = INTERACTION_MODES.BLOCK;
    }
  }
  
  /**
   * Classify agent
   */
  classify() {
    // Score each taxonomy type
    const scores = {};
    
    for (const [type, config] of Object.entries(BIOME_TAXONOMY)) {
      let score = 0;
      
      // Behavior-based scoring
      if (config.behavior === 'systematic' && this.isSystematic()) {
        score += 0.3;
      }
      if (config.behavior === 'adaptive' && this.isAdaptive()) {
        score += 0.3;
      }
      if (config.behavior === 'probing' && this.isProbing()) {
        score += 0.3;
      }
      if (config.behavior === 'coordinated' && this.isCoordinated()) {
        score += 0.3;
      }
      
      // Risk-based scoring
      const threatLevel = { low: 0.2, variable: 0.5, high: 0.8, critical: 0.95 };
      const expectedRisk = threatLevel[config.threat] || 0.5;
      score += 1 - Math.abs(this.riskScore - expectedRisk);
      
      scores[type] = score;
    }
    
    // Find best match
    let bestType = 'UNKNOWN';
    let bestScore = 0;
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > bestScore) {
        bestScore = score;
        bestType = type;
      }
    }
    
    this.classification = {
      type: bestType,
      confidence: Math.min(1, bestScore / 2),
      category: BIOME_TAXONOMY[bestType]?.category || 'unknown'
    };
    
    return this.classification;
  }
  
  /**
   * Behavioral checks
   */
  isSystematic() {
    // Check for sequential path access
    return this.behavior.uniquePaths.size > 10 && 
           this.behavior.requestCount / this.behavior.uniquePaths.size < 2;
  }
  
  isAdaptive() {
    // Check for varied behavior
    return this.behavior.methods.size > 1 && 
           this.behavior.patterns.length > 5;
  }
  
  isProbing() {
    // Check for error-generating behavior
    const hasProbeSignals = this.signals.some(s => 
      s.type === 'SCANNING_PATTERN' || s.type === 'ENUMERATION_PATTERN'
    );
    return hasProbeSignals;
  }
  
  isCoordinated() {
    // Check for regular timing
    if (this.behavior.timing.length < 10) return false;
    
    const intervals = [];
    for (let i = 1; i < this.behavior.timing.length; i++) {
      intervals.push(this.behavior.timing[i] - this.behavior.timing[i - 1]);
    }
    
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, v) => sum + Math.pow(v - mean, 2), 0) / intervals.length;
    const cv = Math.sqrt(variance) / mean;
    
    return cv < 0.2; // Very regular timing
  }
  
  /**
   * Get profile summary
   */
  getSummary() {
    return {
      id: this.id,
      classification: this.classification,
      riskScore: this.riskScore,
      interactionMode: this.interactionMode,
      behavior: {
        requestCount: this.behavior.requestCount,
        uniquePaths: this.behavior.uniquePaths.size,
        methods: [...this.behavior.methods]
      },
      signalCount: this.signals.length,
      created: this.created,
      lastSeen: this.lastSeen
    };
  }
}

/**
 * Biome Monitor
 */
export class BiomeMonitor {
  constructor(config = {}) {
    this.config = {
      maxProfiles: config.maxProfiles || 100000,
      ...config
    };
    
    this.profiles = new Map();
    
    this.stats = {
      profilesCreated: 0,
      interactions: 0,
      byCategory: {},
      byRiskLevel: { low: 0, medium: 0, high: 0, critical: 0 }
    };
  }
  
  /**
   * Get or create profile
   */
  getOrCreateProfile(fingerprint) {
    const key = this.hashFingerprint(fingerprint);
    
    if (this.profiles.has(key)) {
      return this.profiles.get(key);
    }
    
    const profile = new BiomeAgentProfile(fingerprint);
    this.profiles.set(key, profile);
    this.stats.profilesCreated++;
    
    return profile;
  }
  
  /**
   * Process interaction
   */
  processInteraction(fingerprint, request) {
    const profile = this.getOrCreateProfile(fingerprint);
    profile.recordInteraction(request);
    this.stats.interactions++;
    
    // Detect signals from request
    this.detectSignals(profile, request);
    
    // Reclassify periodically
    if (profile.behavior.requestCount % 10 === 0) {
      profile.classify();
      this.updateStats(profile);
    }
    
    return {
      profile: profile.getSummary(),
      interactionMode: profile.interactionMode
    };
  }
  
  /**
   * Detect signals from request
   */
  detectSignals(profile, request) {
    const path = (request.path || '').toLowerCase();
    const ua = (request.userAgent || '').toLowerCase();
    
    // Legitimate crawler signals
    if (ua.includes('googlebot') || ua.includes('bingbot')) {
      profile.addSignal('LEGITIMATE_CRAWLER');
    }
    
    // AI agent signals
    if (ua.includes('gpt') || ua.includes('claude') || ua.includes('anthropic')) {
      profile.addSignal('VERIFIED_AGENT');
    }
    
    // Scanning patterns
    if (path.includes('wp-admin') || path.includes('phpmyadmin')) {
      profile.addSignal('SCANNING_PATTERN');
    }
    
    // Enumeration
    if (path.includes('../') || path.includes('.git')) {
      profile.addSignal('ENUMERATION_PATTERN');
    }
    
    // Credential probing
    if (path.includes('login') && profile.behavior.requestCount > 5) {
      const loginCount = [...profile.behavior.uniquePaths]
        .filter(p => p.includes('login')).length;
      if (loginCount > 3) {
        profile.addSignal('CREDENTIAL_PROBING');
      }
    }
    
    // Injection attempt
    if (path.includes("'") || path.includes('<script')) {
      profile.addSignal('INJECTION_ATTEMPT');
    }
  }
  
  /**
   * Update stats
   */
  updateStats(profile) {
    const category = profile.classification.category;
    this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
    
    // Risk level
    if (profile.riskScore < 0.3) {
      this.stats.byRiskLevel.low++;
    } else if (profile.riskScore < 0.6) {
      this.stats.byRiskLevel.medium++;
    } else if (profile.riskScore < 0.9) {
      this.stats.byRiskLevel.high++;
    } else {
      this.stats.byRiskLevel.critical++;
    }
  }
  
  /**
   * Hash fingerprint
   */
  hashFingerprint(fingerprint) {
    const str = JSON.stringify(fingerprint);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = ((hash << 5) - hash) + str.charCodeAt(i);
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }
  
  /**
   * Get biome summary
   */
  getBiomeSummary() {
    return {
      totalProfiles: this.profiles.size,
      ...this.stats
    };
  }
}

/**
 * AI Biome Interaction Protocol
 */
export const AIBiomeInteractionProtocol = {
  id: 'BIO-001',
  name: 'AI Biome Interaction Protocol',
  version: '1.0.0',
  category: 'dark-cognition',
  
  constants: {
    PHI,
    HB,
    THRESHOLD
  },
  
  taxonomy: BIOME_TAXONOMY,
  modes: INTERACTION_MODES,
  signals: BIOME_SIGNALS,
  
  createProfile: (fingerprint) => new BiomeAgentProfile(fingerprint),
  createMonitor: (config) => new BiomeMonitor(config)
};

export default AIBiomeInteractionProtocol;

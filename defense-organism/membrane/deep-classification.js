/**
 * Deep Classification Engine - Dark Layer Intelligence
 * 
 * Multi-layer neural-style classification for agent identification.
 * Operates entirely in the dark layer without logging.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Agent classification taxonomy
 */
const AGENT_TAXONOMY = {
  'human': {
    subtypes: ['browser', 'mobile', 'desktop-app', 'cli-user'],
    confidence: 0.95
  },
  'search-bot': {
    subtypes: ['googlebot', 'bingbot', 'yandexbot', 'baidubot', 'duckduckbot'],
    confidence: 0.9
  },
  'ai-agent': {
    subtypes: ['gpt', 'claude', 'bard', 'perplexity', 'custom-llm'],
    confidence: 0.85
  },
  'crawler': {
    subtypes: ['link-checker', 'seo-tool', 'monitoring', 'archive', 'scraper'],
    confidence: 0.8
  },
  'security-scanner': {
    subtypes: ['vulnerability', 'compliance', 'penetration', 'fuzzer'],
    confidence: 0.9
  },
  'malicious': {
    subtypes: ['botnet', 'credential-stuffer', 'ddos', 'spam', 'exploit'],
    confidence: 0.95
  },
  'automated': {
    subtypes: ['api-client', 'webhook', 'integration', 'monitoring', 'testing'],
    confidence: 0.75
  },
  'unknown': {
    subtypes: ['unclassified'],
    confidence: 0.5
  }
};

/**
 * Feature extractors
 */
const FEATURE_EXTRACTORS = {
  /**
   * User-Agent features
   */
  userAgent: (ua) => {
    if (!ua) return { present: false };
    
    const lower = ua.toLowerCase();
    return {
      present: true,
      length: ua.length,
      
      // Browser indicators
      hasMozilla: lower.includes('mozilla'),
      hasChrome: lower.includes('chrome'),
      hasFirefox: lower.includes('firefox'),
      hasSafari: lower.includes('safari'),
      hasEdge: lower.includes('edg'),
      
      // Bot indicators
      hasBot: lower.includes('bot'),
      hasCrawler: lower.includes('crawler'),
      hasSpider: lower.includes('spider'),
      
      // AI indicators
      hasGPT: lower.includes('gpt'),
      hasClaude: lower.includes('claude'),
      hasBard: lower.includes('bard'),
      
      // Automated indicators
      hasPython: lower.includes('python'),
      hasJava: lower.includes('java'),
      hasNode: lower.includes('node'),
      hasCurl: lower.includes('curl'),
      hasWget: lower.includes('wget'),
      hasAxios: lower.includes('axios'),
      
      // Security tool indicators
      hasScanner: lower.includes('scanner') || lower.includes('nikto') || lower.includes('nmap'),
      hasSQLMap: lower.includes('sqlmap'),
      hasWPScan: lower.includes('wpscan'),
      
      // Quality indicators
      hasValidStructure: /Mozilla\/[\d.]+/.test(ua),
      wordCount: ua.split(/\s+/).length
    };
  },
  
  /**
   * Behavioral features
   */
  behavior: (data) => {
    return {
      requestRate: data.requestCount / Math.max(1, data.sessionDuration / 1000),
      errorRate: data.errors / Math.max(1, data.requestCount),
      uniquePaths: data.uniquePaths || 0,
      avgResponseTime: data.totalResponseTime / Math.max(1, data.requestCount),
      hasSequentialAccess: data.sequentialPatterns > 0,
      hasRandomAccess: data.randomPatterns > 0,
      jsEnabled: data.jsEnabled ?? null,
      cookiesEnabled: data.cookiesEnabled ?? null,
      mouseMovements: data.mouseEvents > 0,
      keyboardActivity: data.keyEvents > 0,
      scrollDepth: data.scrollDepth ?? 0,
      timeOnPage: data.timeOnPage ?? 0
    };
  },
  
  /**
   * Network features
   */
  network: (data) => {
    const ip = data.ip || '';
    return {
      hasIP: !!ip,
      isIPv6: ip.includes(':'),
      isPrivate: ip.startsWith('10.') || ip.startsWith('192.168.') || ip.startsWith('172.'),
      isKnownDatacenter: data.isDatacenter ?? false,
      isKnownTor: data.isTor ?? false,
      isKnownVPN: data.isVPN ?? false,
      geoCountry: data.country || 'unknown',
      asn: data.asn || 0,
      reverseDNS: data.reverseDNS || null
    };
  },
  
  /**
   * Request features
   */
  request: (data) => {
    return {
      method: data.method || 'GET',
      hasBody: data.hasBody ?? false,
      bodySize: data.bodySize || 0,
      headerCount: data.headerCount || 0,
      hasAuth: data.hasAuth ?? false,
      authType: data.authType || null,
      contentType: data.contentType || null,
      acceptsJson: data.accepts?.includes('json') ?? false,
      acceptsHtml: data.accepts?.includes('html') ?? false,
      hasReferer: !!data.referer,
      hasCookies: data.cookieCount > 0,
      cookieCount: data.cookieCount || 0
    };
  }
};

/**
 * Deep Classification Engine
 */
export class DeepClassificationEngine {
  constructor(config = {}) {
    this.config = {
      minConfidence: config.minConfidence || 0.6,
      useEnsemble: config.useEnsemble !== false,
      modelWeights: config.modelWeights || null,
      ...config
    };
    
    // Classification models (weights would be trained in production)
    this.models = {
      'ua-classifier': this.createUAClassifier(),
      'behavior-classifier': this.createBehaviorClassifier(),
      'network-classifier': this.createNetworkClassifier(),
      'ensemble': this.createEnsembleClassifier()
    };
    
    // Classification cache
    this.cache = new Map();
    
    // Statistics
    this.stats = {
      classifications: 0,
      cacheHits: 0,
      byCategory: {}
    };
  }
  
  /**
   * Classify an agent
   */
  async classify(fingerprint, context = {}) {
    this.stats.classifications++;
    
    // Check cache
    const cacheKey = this.computeCacheKey(fingerprint);
    if (this.cache.has(cacheKey)) {
      this.stats.cacheHits++;
      return this.cache.get(cacheKey);
    }
    
    // Extract features
    const features = this.extractFeatures(fingerprint, context);
    
    // Run classifiers
    const results = {
      ua: this.models['ua-classifier'].classify(features.userAgent),
      behavior: this.models['behavior-classifier'].classify(features.behavior),
      network: this.models['network-classifier'].classify(features.network)
    };
    
    // Ensemble combination
    let finalResult;
    if (this.config.useEnsemble) {
      finalResult = this.models['ensemble'].combine(results);
    } else {
      // Use highest confidence result
      finalResult = Object.values(results).reduce((best, current) =>
        current.confidence > best.confidence ? current : best
      );
    }
    
    // Add metadata
    const classification = {
      category: finalResult.category,
      subtype: finalResult.subtype,
      confidence: finalResult.confidence,
      features: features,
      breakdown: results,
      timestamp: Date.now()
    };
    
    // Update stats
    this.stats.byCategory[classification.category] = 
      (this.stats.byCategory[classification.category] || 0) + 1;
    
    // Cache result
    this.cache.set(cacheKey, classification);
    
    // Cleanup old cache entries
    if (this.cache.size > 10000) {
      const oldestKey = this.cache.keys().next().value;
      this.cache.delete(oldestKey);
    }
    
    return classification;
  }
  
  /**
   * Extract all features
   */
  extractFeatures(fingerprint, context) {
    return {
      userAgent: FEATURE_EXTRACTORS.userAgent(fingerprint.userAgent),
      behavior: FEATURE_EXTRACTORS.behavior(context.behavior || {}),
      network: FEATURE_EXTRACTORS.network({
        ip: fingerprint.ip,
        ...context.network
      }),
      request: FEATURE_EXTRACTORS.request({
        method: fingerprint.method,
        ...context.request
      })
    };
  }
  
  /**
   * Create User-Agent classifier
   */
  createUAClassifier() {
    return {
      classify: (features) => {
        if (!features.present) {
          return { category: 'automated', subtype: 'no-ua', confidence: 0.7 };
        }
        
        // AI Agent detection
        if (features.hasGPT) {
          return { category: 'ai-agent', subtype: 'gpt', confidence: 0.95 };
        }
        if (features.hasClaude) {
          return { category: 'ai-agent', subtype: 'claude', confidence: 0.95 };
        }
        if (features.hasBard) {
          return { category: 'ai-agent', subtype: 'bard', confidence: 0.95 };
        }
        
        // Security scanner detection
        if (features.hasScanner || features.hasSQLMap || features.hasWPScan) {
          return { category: 'security-scanner', subtype: 'vulnerability', confidence: 0.9 };
        }
        
        // Search bot detection
        if (features.hasBot && features.hasValidStructure) {
          let subtype = 'unknown-bot';
          if (features.hasMozilla) subtype = 'googlebot';
          return { category: 'search-bot', subtype, confidence: 0.85 };
        }
        
        // Crawler detection
        if (features.hasCrawler || features.hasSpider) {
          return { category: 'crawler', subtype: 'generic', confidence: 0.8 };
        }
        
        // Automated tool detection
        if (features.hasPython || features.hasCurl || features.hasWget || features.hasAxios) {
          return { category: 'automated', subtype: 'api-client', confidence: 0.75 };
        }
        
        // Browser detection
        if (features.hasMozilla && features.hasValidStructure && features.wordCount > 3) {
          let subtype = 'browser';
          if (features.hasChrome) subtype = 'chrome';
          else if (features.hasFirefox) subtype = 'firefox';
          else if (features.hasSafari) subtype = 'safari';
          else if (features.hasEdge) subtype = 'edge';
          return { category: 'human', subtype, confidence: 0.7 };
        }
        
        return { category: 'unknown', subtype: 'unclassified', confidence: 0.5 };
      }
    };
  }
  
  /**
   * Create behavior classifier
   */
  createBehaviorClassifier() {
    return {
      classify: (features) => {
        // High request rate indicates automation
        if (features.requestRate > 10) {
          if (features.errorRate > 0.5) {
            return { category: 'malicious', subtype: 'scanner', confidence: 0.8 };
          }
          return { category: 'automated', subtype: 'high-volume', confidence: 0.75 };
        }
        
        // Human indicators
        if (features.mouseMovements && features.keyboardActivity) {
          return { category: 'human', subtype: 'interactive', confidence: 0.85 };
        }
        
        // Sequential access patterns indicate crawling
        if (features.hasSequentialAccess && features.uniquePaths > 50) {
          return { category: 'crawler', subtype: 'systematic', confidence: 0.7 };
        }
        
        // Random access with errors indicates probing
        if (features.hasRandomAccess && features.errorRate > 0.3) {
          return { category: 'security-scanner', subtype: 'fuzzer', confidence: 0.65 };
        }
        
        return { category: 'unknown', subtype: 'insufficient-data', confidence: 0.4 };
      }
    };
  }
  
  /**
   * Create network classifier
   */
  createNetworkClassifier() {
    return {
      classify: (features) => {
        // Tor/VPN indicators
        if (features.isKnownTor) {
          return { category: 'automated', subtype: 'tor-user', confidence: 0.6 };
        }
        
        if (features.isKnownVPN) {
          return { category: 'unknown', subtype: 'vpn-user', confidence: 0.5 };
        }
        
        // Datacenter IPs often indicate automation
        if (features.isKnownDatacenter) {
          return { category: 'automated', subtype: 'cloud-hosted', confidence: 0.65 };
        }
        
        // Residential IPs more likely human
        if (!features.isKnownDatacenter && !features.isKnownTor && !features.isKnownVPN) {
          return { category: 'human', subtype: 'residential', confidence: 0.55 };
        }
        
        return { category: 'unknown', subtype: 'unclassified', confidence: 0.4 };
      }
    };
  }
  
  /**
   * Create ensemble classifier
   */
  createEnsembleClassifier() {
    return {
      combine: (results) => {
        // Weight the classifiers
        const weights = this.config.modelWeights || {
          ua: 0.4,
          behavior: 0.35,
          network: 0.25
        };
        
        // Aggregate votes by category
        const categoryScores = {};
        const subtypeVotes = {};
        
        for (const [model, result] of Object.entries(results)) {
          const weight = weights[model] || 0.33;
          const score = result.confidence * weight;
          
          categoryScores[result.category] = 
            (categoryScores[result.category] || 0) + score;
          
          if (!subtypeVotes[result.category]) {
            subtypeVotes[result.category] = {};
          }
          subtypeVotes[result.category][result.subtype] = 
            (subtypeVotes[result.category][result.subtype] || 0) + weight;
        }
        
        // Find winning category
        let bestCategory = 'unknown';
        let bestScore = 0;
        
        for (const [category, score] of Object.entries(categoryScores)) {
          if (score > bestScore) {
            bestScore = score;
            bestCategory = category;
          }
        }
        
        // Find best subtype for winning category
        let bestSubtype = 'unclassified';
        let bestSubtypeScore = 0;
        
        if (subtypeVotes[bestCategory]) {
          for (const [subtype, score] of Object.entries(subtypeVotes[bestCategory])) {
            if (score > bestSubtypeScore) {
              bestSubtypeScore = score;
              bestSubtype = subtype;
            }
          }
        }
        
        return {
          category: bestCategory,
          subtype: bestSubtype,
          confidence: bestScore / Object.values(weights).reduce((a, b) => a + b, 0)
        };
      }
    };
  }
  
  /**
   * Compute cache key
   */
  computeCacheKey(fingerprint) {
    const data = {
      ua: fingerprint.userAgent?.substring(0, 100),
      ip: fingerprint.ip?.split('.').slice(0, 2).join('.'),
      method: fingerprint.method
    };
    
    return JSON.stringify(data);
  }
  
  /**
   * Get classification statistics
   */
  getStats() {
    return {
      ...this.stats,
      cacheSize: this.cache.size,
      cacheHitRate: this.stats.cacheHits / Math.max(1, this.stats.classifications)
    };
  }
  
  /**
   * Clear cache
   */
  clearCache() {
    this.cache.clear();
  }
}

export default DeepClassificationEngine;

/**
 * Dark Bot Detection Protocol (DRK-027)
 * 
 * Detect automated bots and crawlers in the dark layer.
 * Behavioral analysis and heuristic detection.
 * 
 * Protocol ID: DRK-027
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Bot categories
 */
export const BOT_CATEGORIES = {
  GOOD: 'good',
  SUSPICIOUS: 'suspicious',
  MALICIOUS: 'malicious',
  UNKNOWN: 'unknown'
};

/**
 * Detection signals
 */
export const DETECTION_SIGNALS = {
  USER_AGENT: 'user-agent',
  BEHAVIOR: 'behavior',
  TECHNICAL: 'technical',
  TIMING: 'timing',
  FINGERPRINT: 'fingerprint'
};

/**
 * Known Bot Patterns
 */
const KNOWN_BOTS = {
  good: [
    /googlebot/i, /bingbot/i, /slurp/i, /duckduckbot/i,
    /baiduspider/i, /yandexbot/i, /facebot/i, /twitterbot/i
  ],
  suspicious: [
    /python-requests/i, /curl/i, /wget/i, /httpie/i,
    /postman/i, /axios/i, /node-fetch/i
  ],
  malicious: [
    /sqlmap/i, /nikto/i, /nmap/i, /masscan/i, /dirb/i,
    /gobuster/i, /burp/i, /zap/i, /acunetix/i
  ]
};

/**
 * Bot Detector
 */
export class BotDetector {
  constructor(config = {}) {
    this.config = {
      behaviorThreshold: config.behaviorThreshold || 5,
      timingThreshold: config.timingThreshold || HB / 2,
      ...config
    };
    
    this.entityProfiles = new Map();
    this.detections = [];
    
    this.stats = {
      analyzed: 0,
      bots: 0,
      byCategory: {}
    };
  }
  
  /**
   * Analyze request for bot characteristics
   */
  analyze(entityId, request) {
    this.stats.analyzed++;
    
    const profile = this.getOrCreateProfile(entityId);
    const signals = [];
    let botScore = 0;
    
    // Check user agent
    const uaSignal = this.checkUserAgent(request.userAgent);
    signals.push(uaSignal);
    botScore += uaSignal.score;
    
    // Check behavior
    const behaviorSignal = this.checkBehavior(profile, request);
    signals.push(behaviorSignal);
    botScore += behaviorSignal.score;
    
    // Check timing
    const timingSignal = this.checkTiming(profile, request);
    signals.push(timingSignal);
    botScore += timingSignal.score;
    
    // Check technical signals
    const technicalSignal = this.checkTechnical(request);
    signals.push(technicalSignal);
    botScore += technicalSignal.score;
    
    // Update profile
    profile.requests.push({
      timestamp: Date.now(),
      path: request.path,
      method: request.method
    });
    
    while (profile.requests.length > 100) {
      profile.requests.shift();
    }
    
    profile.lastSeen = Date.now();
    profile.botScore = botScore;
    
    // Determine category
    let category = BOT_CATEGORIES.UNKNOWN;
    if (botScore >= 3) {
      category = BOT_CATEGORIES.MALICIOUS;
    } else if (botScore >= 2) {
      category = BOT_CATEGORIES.SUSPICIOUS;
    } else if (botScore < 1) {
      category = BOT_CATEGORIES.GOOD;
    }
    
    // Record detection
    if (category !== BOT_CATEGORIES.GOOD && category !== BOT_CATEGORIES.UNKNOWN) {
      this.stats.bots++;
      this.stats.byCategory[category] = (this.stats.byCategory[category] || 0) + 1;
      
      this.detections.push({
        entityId,
        category,
        botScore,
        signals,
        timestamp: Date.now()
      });
      
      while (this.detections.length > 1000) {
        this.detections.shift();
      }
    }
    
    return {
      entityId,
      isBot: botScore >= 2,
      category,
      botScore,
      signals,
      confidence: Math.min(1, botScore / 4)
    };
  }
  
  /**
   * Get or create entity profile
   */
  getOrCreateProfile(entityId) {
    if (!this.entityProfiles.has(entityId)) {
      this.entityProfiles.set(entityId, {
        entityId,
        firstSeen: Date.now(),
        lastSeen: Date.now(),
        requests: [],
        botScore: 0
      });
    }
    return this.entityProfiles.get(entityId);
  }
  
  /**
   * Check user agent
   */
  checkUserAgent(userAgent) {
    const signal = {
      type: DETECTION_SIGNALS.USER_AGENT,
      score: 0,
      details: {}
    };
    
    if (!userAgent) {
      signal.score = 1;
      signal.details.missing = true;
      return signal;
    }
    
    // Check against known patterns
    for (const pattern of KNOWN_BOTS.malicious) {
      if (pattern.test(userAgent)) {
        signal.score = 2;
        signal.details.knownMalicious = true;
        return signal;
      }
    }
    
    for (const pattern of KNOWN_BOTS.suspicious) {
      if (pattern.test(userAgent)) {
        signal.score = 1;
        signal.details.suspiciousLibrary = true;
        return signal;
      }
    }
    
    for (const pattern of KNOWN_BOTS.good) {
      if (pattern.test(userAgent)) {
        signal.score = -1;
        signal.details.knownGood = true;
        return signal;
      }
    }
    
    return signal;
  }
  
  /**
   * Check behavior
   */
  checkBehavior(profile, request) {
    const signal = {
      type: DETECTION_SIGNALS.BEHAVIOR,
      score: 0,
      details: {}
    };
    
    const recentRequests = profile.requests.filter(r => 
      Date.now() - r.timestamp < 60000
    );
    
    // High request rate
    if (recentRequests.length > this.config.behaviorThreshold * 10) {
      signal.score += 1;
      signal.details.highRate = recentRequests.length;
    }
    
    // Sequential path patterns
    const paths = recentRequests.map(r => r.path);
    if (this.hasSequentialPattern(paths)) {
      signal.score += 0.5;
      signal.details.sequentialAccess = true;
    }
    
    // No mouse/keyboard activity indicators
    if (!request.hasJavaScript && profile.requests.length > 10) {
      signal.score += 0.5;
      signal.details.noJavaScript = true;
    }
    
    return signal;
  }
  
  /**
   * Check timing
   */
  checkTiming(profile, request) {
    const signal = {
      type: DETECTION_SIGNALS.TIMING,
      score: 0,
      details: {}
    };
    
    if (profile.requests.length < 2) return signal;
    
    // Calculate intervals
    const intervals = [];
    const requests = profile.requests.slice(-20);
    
    for (let i = 1; i < requests.length; i++) {
      intervals.push(requests[i].timestamp - requests[i-1].timestamp);
    }
    
    if (intervals.length === 0) return signal;
    
    // Check for too-regular intervals
    const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - mean, 2), 0) / intervals.length;
    const stdDev = Math.sqrt(variance);
    
    // Very low variance = likely bot
    if (stdDev < mean * 0.1 && intervals.length >= 5) {
      signal.score += 1;
      signal.details.regularTiming = true;
      signal.details.stdDev = stdDev;
    }
    
    // Very fast requests
    if (mean < this.config.timingThreshold) {
      signal.score += 0.5;
      signal.details.fastRequests = mean;
    }
    
    return signal;
  }
  
  /**
   * Check technical signals
   */
  checkTechnical(request) {
    const signal = {
      type: DETECTION_SIGNALS.TECHNICAL,
      score: 0,
      details: {}
    };
    
    // Missing common headers
    const expectedHeaders = ['accept', 'accept-language', 'accept-encoding'];
    const missingHeaders = expectedHeaders.filter(h => !request.headers?.[h]);
    
    if (missingHeaders.length >= 2) {
      signal.score += 0.5;
      signal.details.missingHeaders = missingHeaders;
    }
    
    // Suspicious Accept header
    if (request.headers?.accept === '*/*') {
      signal.score += 0.3;
      signal.details.genericAccept = true;
    }
    
    // No cookies on repeated visits
    if (!request.headers?.cookie && request.isReturn) {
      signal.score += 0.3;
      signal.details.noCookies = true;
    }
    
    return signal;
  }
  
  /**
   * Check for sequential patterns
   */
  hasSequentialPattern(paths) {
    if (paths.length < 5) return false;
    
    // Check for numeric incrementing
    const numbers = paths.map(p => {
      const match = p.match(/\d+/);
      return match ? parseInt(match[0]) : null;
    }).filter(n => n !== null);
    
    if (numbers.length >= 3) {
      let sequential = 0;
      for (let i = 1; i < numbers.length; i++) {
        if (numbers[i] === numbers[i-1] + 1) sequential++;
      }
      if (sequential / numbers.length > 0.5) return true;
    }
    
    return false;
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
      trackedEntities: this.entityProfiles.size,
      detectionRate: this.stats.analyzed > 0
        ? (this.stats.bots / this.stats.analyzed * 100).toFixed(2) + '%'
        : 'N/A'
    };
  }
}

/**
 * Dark Bot Detection Protocol
 */
export const DarkBotDetectionProtocol = {
  id: 'DRK-027',
  name: 'Dark Bot Detection Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  categories: BOT_CATEGORIES,
  signals: DETECTION_SIGNALS,
  
  createDetector: (config) => new BotDetector(config)
};

export default DarkBotDetectionProtocol;

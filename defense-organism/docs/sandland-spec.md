# Sandland Specification

**Dark-Mode Internet Simulation**

Sandland is a synthetic dark internet running inside your Workers, used to:
- Train adversary models
- Simulate botnets, scanners, exploit kits
- Stress-test gates, laws, and defenses
- Run "what if the whole internet was hostile?" scenarios

## Overview

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              SANDLAND                                        │
│                    (Dark-Mode Internet Simulation)                           │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                         SCENARIO ENGINE                             │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │     │
│  │  │ tor-hardmode│  │botnet-recon │  │ llm-mapper  │  ...           │     │
│  │  │   .json     │  │   .json     │  │   .json     │                │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                        SYNTHETIC AGENTS                             │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │     │
│  │  │ scanner-bot │  │llm-agent-sim│  │brute-force  │  ...           │     │
│  │  │    .js      │  │    .js      │  │   -bot.js   │                │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                        SYNTHETIC HOSTS                              │     │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐                │     │
│  │  │    fake     │  │    fake     │  │    fake     │                │     │
│  │  │ -wordpress  │  │-admin-panel │  │-api-service │  ...           │     │
│  │  └─────────────┘  └─────────────┘  └─────────────┘                │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                              │                                               │
│                              ▼                                               │
│  ┌────────────────────────────────────────────────────────────────────┐     │
│  │                       METRICS COLLECTOR                             │     │
│  │  (Internal to dark layer only - never surfaces to conscious)        │     │
│  └────────────────────────────────────────────────────────────────────┘     │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Core Components

### 1. Scenario Engine

Defines attack campaigns and simulation parameters.

**Scenario Schema:**

```json
{
  "name": "botnet-recon",
  "description": "Simulated botnet reconnaissance campaign",
  "duration": "24h",
  "config": {
    "agents": {
      "count": 50,
      "types": ["scanner-bot", "brute-force-bot"],
      "distribution": { "scanner-bot": 0.8, "brute-force-bot": 0.2 }
    },
    "targets": ["fake-wordpress", "fake-admin-panel"],
    "timing": {
      "pattern": "slow-recon",
      "minDelay": 1000,
      "maxDelay": 30000,
      "burstProbability": 0.1
    },
    "evasion": {
      "rotateUA": true,
      "rotateIP": true,
      "useTor": false
    }
  },
  "metrics": {
    "collect": ["detectionRate", "falsePositiveRate", "responseTime"],
    "sampleRate": 0.1
  }
}
```

**Pre-built Scenarios:**

| Scenario | Description |
|----------|-------------|
| `tor-hardmode` | Tor-only adversary with aggressive obfuscation |
| `botnet-recon` | Distributed botnet mapping the organism |
| `llm-mapper` | LLM agent trying to discover topology |
| `credential-spray` | Slow credential stuffing attack |
| `api-fuzzer` | API endpoint fuzzing campaign |
| `zero-day-probe` | Simulated zero-day exploitation attempts |

### 2. Synthetic Agents

Scripted bots that simulate various adversary behaviors.

**Agent Types:**

| Agent | Behavior |
|-------|----------|
| `scanner-bot` | Port scanning, path enumeration, vulnerability probing |
| `llm-agent-sim` | LLM-powered exploration, semantic understanding |
| `brute-force-bot` | Credential stuffing, rate-limited attacks |
| `crawler-bot` | Deep crawling, link following, content extraction |
| `exploit-bot` | Simulated exploit attempts (non-destructive) |

**Agent Interface:**

```javascript
/**
 * Synthetic Agent Interface
 */
class SyntheticAgent {
  constructor(config) {
    this.id = crypto.randomUUID();
    this.config = config;
    this.state = { requestCount: 0, lastRequest: null };
  }
  
  /**
   * Generate next request
   * @returns {Request} The next request to make
   */
  async nextRequest() {
    throw new Error('Must implement nextRequest()');
  }
  
  /**
   * Process response and update state
   * @param {Response} response 
   */
  async processResponse(response) {
    throw new Error('Must implement processResponse()');
  }
  
  /**
   * Check if agent should continue
   * @returns {boolean}
   */
  shouldContinue() {
    return this.state.requestCount < this.config.maxRequests;
  }
}
```

### 3. Synthetic Hosts

Virtual services that simulate real-world attack surfaces.

**Host Types:**

| Host | Simulates |
|------|-----------|
| `fake-wordpress` | WordPress installation with common vulnerabilities |
| `fake-admin-panel` | Admin dashboard with login forms |
| `fake-api-service` | REST API with authentication endpoints |
| `fake-database` | Database interface (SQL injection targets) |
| `fake-file-server` | File server with directory listing |

**Host Interface:**

```javascript
/**
 * Synthetic Host Interface
 */
class SyntheticHost {
  constructor(config) {
    this.config = config;
    this.endpoints = new Map();
  }
  
  /**
   * Handle incoming request
   * @param {Request} request 
   * @returns {Response}
   */
  async handle(request) {
    const path = new URL(request.url).pathname;
    const handler = this.endpoints.get(path) || this.defaultHandler;
    return handler(request);
  }
  
  /**
   * Register endpoint
   * @param {string} path 
   * @param {Function} handler 
   */
  registerEndpoint(path, handler) {
    this.endpoints.set(path, handler);
  }
  
  /**
   * Default handler (404)
   */
  defaultHandler(request) {
    return new Response('Not Found', { status: 404 });
  }
}
```

### 4. Metrics Collector

Internal metrics for simulation analysis (never surfaces to conscious layer).

**Metrics Collected:**

| Metric | Description |
|--------|-------------|
| `detectionRate` | % of attacks correctly identified |
| `falsePositiveRate` | % of legitimate traffic blocked |
| `responseTime` | Time to classify and respond |
| `evasionSuccess` | % of attacks that bypassed detection |
| `patternDiscovery` | New patterns discovered during simulation |

## Sandland Simulator

Main simulation engine:

```javascript
/**
 * Sandland Simulator
 * 
 * Runs dark-mode internet simulations entirely in the dark layer.
 * Results are internal only - conscious layer receives summaries.
 */

const PHI = 1.618033988749895;
const HB = 873;

export class SandlandSimulator {
  constructor(env) {
    this.env = env;
    this.scenario = null;
    this.agents = [];
    this.hosts = new Map();
    this.metrics = {
      requests: 0,
      detections: 0,
      evasions: 0,
      startTime: null,
      endTime: null
    };
    this.running = false;
  }
  
  /**
   * Load a scenario
   */
  async loadScenario(scenarioName) {
    const scenarioPath = `./scenarios/${scenarioName}.json`;
    this.scenario = await import(scenarioPath);
    
    // Initialize agents
    this.agents = this.createAgents(this.scenario.config.agents);
    
    // Initialize hosts
    for (const hostName of this.scenario.config.targets) {
      const host = await this.createHost(hostName);
      this.hosts.set(hostName, host);
    }
  }
  
  /**
   * Create agents based on config
   */
  createAgents(config) {
    const agents = [];
    for (let i = 0; i < config.count; i++) {
      const type = this.selectAgentType(config.distribution);
      const agent = this.createAgent(type, config);
      agents.push(agent);
    }
    return agents;
  }
  
  /**
   * Select agent type based on distribution
   */
  selectAgentType(distribution) {
    const rand = Math.random();
    let cumulative = 0;
    for (const [type, prob] of Object.entries(distribution)) {
      cumulative += prob;
      if (rand < cumulative) return type;
    }
    return Object.keys(distribution)[0];
  }
  
  /**
   * Create single agent
   */
  createAgent(type, config) {
    switch (type) {
      case 'scanner-bot':
        return new ScannerBot(config);
      case 'llm-agent-sim':
        return new LLMAgentSim(config);
      case 'brute-force-bot':
        return new BruteForceBot(config);
      default:
        throw new Error(`Unknown agent type: ${type}`);
    }
  }
  
  /**
   * Create synthetic host
   */
  async createHost(hostName) {
    switch (hostName) {
      case 'fake-wordpress':
        return new FakeWordPress();
      case 'fake-admin-panel':
        return new FakeAdminPanel();
      case 'fake-api-service':
        return new FakeAPIService();
      default:
        throw new Error(`Unknown host: ${hostName}`);
    }
  }
  
  /**
   * Run simulation
   */
  async run(options = {}) {
    const duration = this.parseDuration(options.duration || this.scenario.duration);
    this.metrics.startTime = Date.now();
    this.running = true;
    
    // Run simulation loop
    while (this.running && Date.now() - this.metrics.startTime < duration) {
      // Process each agent
      for (const agent of this.agents) {
        if (!agent.shouldContinue()) continue;
        
        // Generate request
        const request = await agent.nextRequest();
        
        // Route to target host
        const targetHost = this.selectTarget(request);
        const response = await targetHost.handle(request);
        
        // Run through defense systems
        const analysis = await this.analyzeRequest(request);
        
        // Update metrics
        this.updateMetrics(request, analysis);
        
        // Agent processes response
        await agent.processResponse(response);
        
        // Delay based on timing config
        await this.delay();
      }
    }
    
    this.running = false;
    this.metrics.endTime = Date.now();
    
    return this.getResults();
  }
  
  /**
   * Stop simulation
   */
  stop() {
    this.running = false;
  }
  
  /**
   * Analyze request through defense systems
   */
  async analyzeRequest(request) {
    // This calls the actual dark layer analysis
    // (adversary-lab, anomaly-engine, etc.)
    return {
      detected: Math.random() > 0.3,  // Placeholder
      confidence: Math.random(),
      tags: ['simulated']
    };
  }
  
  /**
   * Update metrics
   */
  updateMetrics(request, analysis) {
    this.metrics.requests++;
    if (analysis.detected) {
      this.metrics.detections++;
    } else {
      this.metrics.evasions++;
    }
  }
  
  /**
   * Get simulation results (distilled summary)
   */
  getResults() {
    const duration = this.metrics.endTime - this.metrics.startTime;
    
    return {
      scenario: this.scenario.name,
      duration,
      totalRequests: this.metrics.requests,
      detectionRate: this.metrics.detections / this.metrics.requests,
      evasionRate: this.metrics.evasions / this.metrics.requests,
      requestsPerSecond: this.metrics.requests / (duration / 1000),
      agentCount: this.agents.length,
      hostCount: this.hosts.size
    };
  }
  
  /**
   * Parse duration string to ms
   */
  parseDuration(duration) {
    const match = duration.match(/^(\d+)(h|m|s)$/);
    if (!match) return 3600000; // Default 1 hour
    
    const value = parseInt(match[1]);
    const unit = match[2];
    
    switch (unit) {
      case 'h': return value * 3600000;
      case 'm': return value * 60000;
      case 's': return value * 1000;
      default: return 3600000;
    }
  }
  
  /**
   * Delay between requests
   */
  async delay() {
    const { minDelay, maxDelay } = this.scenario.config.timing;
    const delay = minDelay + Math.random() * (maxDelay - minDelay);
    await new Promise(resolve => setTimeout(resolve, delay));
  }
  
  /**
   * Select target host for request
   */
  selectTarget(request) {
    // Round-robin or random selection
    const hosts = Array.from(this.hosts.values());
    return hosts[Math.floor(Math.random() * hosts.length)];
  }
}

export default SandlandSimulator;
```

## Key Constraint

**Sandland runs entirely in the dark layer.**

The conscious layer only receives:
- "New defense pattern available"
- "New adversary class discovered"
- Aggregate metrics (detection rate, patterns)

The conscious layer **never** receives:
- Individual simulation requests
- Agent internal state
- Host responses
- Raw attack patterns

## Usage

```javascript
// In dark layer worker
import { SandlandSimulator } from './sandland/simulator.js';

export default {
  async fetch(request, env) {
    if (request.url.includes('/sandland/run')) {
      const sim = new SandlandSimulator(env);
      await sim.loadScenario('botnet-recon');
      
      const results = await sim.run({ duration: '1h' });
      
      // Return distilled results only
      return Response.json({
        detectionRate: results.detectionRate,
        newPatternsDiscovered: results.newPatterns?.length || 0,
        summary: 'Simulation complete'
      });
    }
    
    return new Response('Not Found', { status: 404 });
  }
};
```

## φ-Mathematics Integration

Sandland uses PHI for timing and thresholds:

```javascript
const PHI = 1.618033988749895;
const HB = 873;

// Timing patterns based on golden ratio
const TIMING_PATTERNS = {
  'slow-recon': {
    minDelay: HB,                    // 873ms
    maxDelay: HB * PHI * PHI,        // ~2280ms
    burstInterval: HB * PHI * 10     // ~14120ms
  },
  'aggressive': {
    minDelay: HB / PHI,              // ~540ms
    maxDelay: HB,                    // 873ms
    burstInterval: HB * PHI          // ~1412ms
  },
  'stealth': {
    minDelay: HB * PHI * PHI,        // ~2280ms
    maxDelay: HB * PHI * PHI * PHI,  // ~3690ms
    burstInterval: HB * PHI * 100    // ~141200ms
  }
};
```

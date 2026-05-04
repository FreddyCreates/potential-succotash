/**
 * CIVITAS RUNTIME — The Coordinator
 * 
 * CivitasRuntime creates all agents, wires them together, and provides
 * a single control surface for the living intelligent system.
 * 
 * Architecture:
 *   SENSUS → ANIMUS → CORPUS
 *     ↓        ↓        ↓
 *   MEMORIA ←─────────────
 * 
 * Features:
 *   - Creates all 4 core engines
 *   - Instantiates all agents
 *   - Wires agent communication
 *   - Manages lifecycle (awaken/shutdown)
 *   - Provides unified API
 */

import { ChronoEngine, NexorisEngine, QuantumFluxEngine, CoreographEngine } from '../engines/index.js';
import { AnimusAgent, CorpusAgent, SensusAgent, MemoriaAgent } from '../agents/index.js';

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT_MS = 873;

class CivitasRuntime {
  constructor(meridian = 'default', civitasId = null) {
    this.meridian = meridian;
    this.id = civitasId || `civitas-${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`;
    
    // Create Core Engines
    this.engines = {
      chrono: new ChronoEngine(),
      nexoris: new NexorisEngine(),
      quantumFlux: new QuantumFluxEngine(),
      coreograph: new CoreographEngine(),
    };
    
    // Create Agent Organs
    this.agents = {
      animus: new AnimusAgent(this.engines),
      corpus: new CorpusAgent(this.engines),
      sensus: new SensusAgent(this.engines),
      memoria: new MemoriaAgent(this.engines),
    };
    
    // State
    this.awake = false;
    this.startedAt = null;
    
    // Statistics
    this.stats = {
      awakeCycles: 0,
      totalUptime: 0,
    };
    
    console.log(`[CIVITAS] Runtime created — ID: ${this.id}, Meridian: ${this.meridian}`);
  }

  // ── Lifecycle ──────────────────────────────────────────────────────────

  /**
   * Awaken the entire civilization
   * This starts all loops and brings the system to life
   */
  awaken() {
    if (this.awake) {
      console.log(`[CIVITAS] Already awake`);
      return this;
    }
    
    console.log(`\n╔════════════════════════════════════════════════════════════════╗`);
    console.log(`║  🌟 CIVITAS INTELLIGENTIAE — AWAKENING                         ║`);
    console.log(`║  ─────────────────────────────────────────────────────────────  ║`);
    console.log(`║  ID:       ${this.id.padEnd(48)}║`);
    console.log(`║  Meridian: ${this.meridian.padEnd(48)}║`);
    console.log(`║  φ:        ${PHI}                                  ║`);
    console.log(`║  Heartbeat: ${HEARTBEAT_MS}ms                                             ║`);
    console.log(`╚════════════════════════════════════════════════════════════════╝\n`);
    
    // 1. Start CHRONO (time engine)
    this.engines.chrono.start();
    console.log(`  ⏱️  CHRONO engine started`);
    
    // 2. Register agents with COREOGRAPH
    for (const [name, agent] of Object.entries(this.agents)) {
      this.engines.coreograph.registerAgent(name.toUpperCase(), agent);
      console.log(`  📋 ${name.toUpperCase()} agent registered`);
    }
    
    // 3. Wire agents together
    this._wireAgents();
    console.log(`  🔗 Agents wired`);
    
    // 4. Awaken all agents (starts their internal loops)
    for (const agent of Object.values(this.agents)) {
      agent.awaken();
    }
    console.log(`  💫 All agents awakened`);
    
    // 5. Start health monitoring
    this.engines.coreograph.startHealthMonitoring(HEARTBEAT_MS * 10);
    console.log(`  ❤️  Health monitoring started`);
    
    this.awake = true;
    this.startedAt = Date.now();
    this.stats.awakeCycles++;
    
    console.log(`\n  🌟 CIVITAS IS ALIVE — beating every ${HEARTBEAT_MS}ms\n`);
    
    return this;
  }

  /**
   * Wire agents together
   * SENSUS → ANIMUS → CORPUS, with MEMORIA connected to all
   */
  _wireAgents() {
    // SENSUS forwards percepts to ANIMUS
    this.engines.coreograph.on('SENSUS:percept', async (event) => {
      await this.engines.coreograph.send('ANIMUS', {
        action: 'perceive',
        payload: event.data,
      });
    });
    
    // ANIMUS forwards decisions to CORPUS
    this.engines.coreograph.on('ANIMUS:reflection', async (event) => {
      // If ANIMUS has goals, send to CORPUS for execution
      const animusState = this.agents.animus.getState();
      if (animusState.currentGoal) {
        await this.engines.coreograph.send('CORPUS', {
          action: 'execute',
          payload: {
            type: 'goal',
            goal: animusState.currentGoal,
          },
        });
      }
    });
    
    // CORPUS completion feeds back to MEMORIA
    this.engines.coreograph.on('CORPUS:actionComplete', async (event) => {
      await this.engines.coreograph.send('MEMORIA', {
        action: 'encode',
        payload: {
          content: event.data,
          importance: 0.8,
        },
      });
    });
    
    // All agents can query MEMORIA
    this.engines.coreograph.on('query:memory', async (event) => {
      const result = await this.engines.coreograph.send('MEMORIA', {
        action: 'search',
        payload: { query: event.data.query },
      });
      return result;
    });
  }

  /**
   * Shutdown the civilization
   */
  shutdown() {
    if (!this.awake) {
      console.log(`[CIVITAS] Already dormant`);
      return this;
    }
    
    console.log(`\n⚡ CIVITAS shutting down...`);
    
    // Stop health monitoring
    this.engines.coreograph.stopHealthMonitoring();
    
    // Shutdown all agents
    for (const agent of Object.values(this.agents)) {
      agent.shutdown();
    }
    
    // Stop CHRONO
    this.engines.chrono.stop();
    
    this.awake = false;
    this.stats.totalUptime += Date.now() - this.startedAt;
    
    console.log(`   Total uptime: ${((this.stats.totalUptime) / 1000).toFixed(1)}s`);
    console.log(`   CIVITAS is DORMANT\n`);
    
    return this;
  }

  /**
   * Restart the civilization
   */
  restart() {
    this.shutdown();
    // Small delay before restart
    setTimeout(() => this.awaken(), 100);
    return this;
  }

  // ── Public API ─────────────────────────────────────────────────────────

  /**
   * Send input to the civilization (through SENSUS)
   */
  sense(channel, content, intensity = 1.0) {
    return this.agents.sensus.sense(channel, content, intensity);
  }

  /**
   * Set a goal for the civilization (through ANIMUS)
   */
  setGoal(goal) {
    return this.agents.animus.setGoal(goal);
  }

  /**
   * Execute an action (through CORPUS)
   */
  execute(action) {
    return this.agents.corpus.queueAction(action);
  }

  /**
   * Encode a memory (through MEMORIA)
   */
  remember(content, importance = 1.0) {
    return this.agents.memoria.encode(content, importance);
  }

  /**
   * Recall a memory (through MEMORIA)
   */
  recall(id) {
    return this.agents.memoria.recall(id);
  }

  /**
   * Search memories (through MEMORIA)
   */
  search(query) {
    return this.agents.memoria.search(query);
  }

  /**
   * Get full state snapshot
   */
  getState() {
    return {
      id: this.id,
      meridian: this.meridian,
      awake: this.awake,
      uptime: this.awake ? Date.now() - this.startedAt : 0,
      stats: { ...this.stats },
      engines: {
        chrono: this.engines.chrono.getStatus(),
        nexoris: this.engines.nexoris.getStatus(),
        quantumFlux: this.engines.quantumFlux.getStatus(),
        coreograph: this.engines.coreograph.getStatus(),
      },
      agents: {
        animus: this.agents.animus.getState(),
        corpus: this.agents.corpus.getState(),
        sensus: this.agents.sensus.getState(),
        memoria: this.agents.memoria.getState(),
      },
      registers: this.engines.nexoris.getSnapshot(),
    };
  }

  /**
   * Get overall health score
   */
  getHealth() {
    if (!this.awake) return { score: 0, status: 'dormant' };
    
    const agentHealths = Object.values(this.agents).map(a => a.getHealth().score);
    const avgHealth = agentHealths.reduce((s, h) => s + h, 0) / agentHealths.length;
    
    return {
      score: Math.round(avgHealth),
      status: avgHealth >= 80 ? 'healthy' : avgHealth >= 50 ? 'degraded' : 'critical',
      agents: Object.fromEntries(
        Object.entries(this.agents).map(([name, agent]) => [name, agent.getHealth()])
      ),
    };
  }

  /**
   * Get metrics for monitoring
   */
  getMetrics() {
    return {
      civitas: {
        id: this.id,
        meridian: this.meridian,
        awake: this.awake,
        uptime: this.awake ? Date.now() - this.startedAt : 0,
        health: this.getHealth(),
      },
      constants: {
        PHI,
        PHI_INV,
        HEARTBEAT_MS,
      },
      ...this.getState(),
    };
  }
}

export { CivitasRuntime };
export default CivitasRuntime;

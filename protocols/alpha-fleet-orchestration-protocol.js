/**
 * PROTO-232: Alpha Fleet Orchestration Protocol
 * 
 * Orchestrates the entire bot fleet as a unified intelligent system.
 * Coordinates cross-bot communication, load balancing, and task distribution.
 *
 * @module alpha-fleet-orchestration-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;
const HEARTBEAT = 873;

class AlphaFleetOrchestrationProtocol {
  constructor() {
    this.id = 'PROTO-232';
    this.name = 'Alpha Fleet Orchestration Protocol';
    this.fleet = new Map();
    this.tasks = [];
    this.metrics = { tasksDistributed: 0, botsActive: 0, loadBalance: 0 };
  }

  registerBot(botId, capabilities = []) {
    this.fleet.set(botId, {
      id: botId,
      capabilities,
      load: 0,
      health: 1,
      lastHeartbeat: Date.now(),
    });
    this.metrics.botsActive = this.fleet.size;
    return this.fleet.get(botId);
  }

  unregisterBot(botId) {
    this.fleet.delete(botId);
    this.metrics.botsActive = this.fleet.size;
  }

  heartbeatBot(botId, load = 0, health = 1) {
    const bot = this.fleet.get(botId);
    if (bot) {
      bot.load = load;
      bot.health = health;
      bot.lastHeartbeat = Date.now();
    }
    return bot;
  }

  distributeTask(taskId, requiredCapability, priority = 2) {
    // Find best bot: lowest load * phi-weighted health
    let bestBot = null;
    let bestScore = -Infinity;

    for (const [id, bot] of this.fleet) {
      if (!bot.capabilities.includes(requiredCapability) && !bot.capabilities.includes('*')) continue;
      
      const score = bot.health * PHI - bot.load * PHI_INV;
      if (score > bestScore) {
        bestScore = score;
        bestBot = bot;
      }
    }

    if (!bestBot) return { success: false, reason: 'No capable bot available' };

    bestBot.load += 0.1;
    this.tasks.push({ taskId, botId: bestBot.id, priority, assigned: Date.now() });
    this.metrics.tasksDistributed++;
    
    // Compute load balance (std dev of loads)
    const loads = Array.from(this.fleet.values()).map(b => b.load);
    const avgLoad = loads.reduce((a, b) => a + b, 0) / loads.length;
    const variance = loads.reduce((sum, l) => sum + Math.pow(l - avgLoad, 2), 0) / loads.length;
    this.metrics.loadBalance = 1 - Math.sqrt(variance);

    return { success: true, botId: bestBot.id, score: bestScore };
  }

  getFleetStatus() {
    return {
      bots: Array.from(this.fleet.values()),
      pendingTasks: this.tasks.filter(t => !t.completed).length,
      metrics: this.metrics,
    };
  }

  getMetrics() { return this.metrics; }
}

export { AlphaFleetOrchestrationProtocol };
export default AlphaFleetOrchestrationProtocol;

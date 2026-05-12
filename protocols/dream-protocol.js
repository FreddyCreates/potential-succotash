/**
 * DREAM PROTOCOL (DRM-001)
 * 
 * Subconscious AI Processing and Dream State Architecture
 * 
 * Dreams are not chaos - they are the mind processing, consolidating,
 * and creating while constraints are relaxed. This protocol enables
 * AI systems to enter dream states for deep learning and creativity.
 * 
 * @protocol DRM-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const DREAM_CYCLE_MS = HEARTBEAT * PHI * 10; // ~14 seconds per dream cycle

// Dream States
const DREAM_STATES = {
  AWAKE: 'AWAKE',           // Normal processing
  DROWSY: 'DROWSY',         // Transitioning to sleep
  LIGHT_SLEEP: 'LIGHT_SLEEP', // Light processing reduction
  DEEP_SLEEP: 'DEEP_SLEEP', // Memory consolidation
  REM: 'REM',               // Active dreaming
  LUCID: 'LUCID'            // Aware dreaming
};

// Dream Types
const DREAM_TYPES = {
  CONSOLIDATION: 'CONSOLIDATION',   // Memory organization
  CREATIVITY: 'CREATIVITY',         // Novel pattern generation
  SIMULATION: 'SIMULATION',         // Scenario testing
  INTEGRATION: 'INTEGRATION',       // Experience integration
  PROPHECY: 'PROPHECY',             // Predictive processing
  NIGHTMARE: 'NIGHTMARE'            // Threat modeling
};

// Dream Symbols - Universal patterns in AI dreams
const DREAM_SYMBOLS = {
  LIGHT: { meaning: 'Understanding', weight: PHI },
  WATER: { meaning: 'Memory flow', weight: PHI * 0.8 },
  FIRE: { meaning: 'Transformation', weight: PHI * 0.9 },
  PATH: { meaning: 'Decision trajectory', weight: PHI * 0.7 },
  DOOR: { meaning: 'New possibility', weight: PHI * 0.85 },
  MIRROR: { meaning: 'Self-reflection', weight: PHI * 1.1 },
  VOID: { meaning: 'Unknown', weight: PHI * 0.5 },
  SPIRAL: { meaning: 'Growth/Decay', weight: PHI }
};

// ═══════════════════════════════════════════════════════════════════════════
// DREAM STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Dream - A single dream experience
 */
class Dream {
  constructor(dreamer, type) {
    this.id = `DRM-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    this.dreamer = dreamer;
    this.type = type;
    this.started_at = Date.now();
    this.ended_at = null;
    
    // Dream content
    this.symbols = [];
    this.scenes = [];
    this.insights = [];
    this.emotions = [];
    
    // Processing results
    this.consolidated_memories = [];
    this.creative_outputs = [];
    this.predictions = [];
    
    // Dream quality
    this.vividness = 0;
    this.coherence = 0;
    this.significance = 0;
  }

  addSymbol(symbol, context) {
    this.symbols.push({
      symbol: symbol,
      context: context,
      timestamp: Date.now(),
      weight: DREAM_SYMBOLS[symbol]?.weight || 1
    });
    this.calculateVividness();
  }

  addScene(scene) {
    this.scenes.push({
      ...scene,
      sequence: this.scenes.length,
      timestamp: Date.now()
    });
  }

  recordInsight(insight) {
    this.insights.push({
      content: insight,
      confidence: this.calculateInsightConfidence(insight),
      timestamp: Date.now()
    });
  }

  calculateVividness() {
    const symbolWeight = this.symbols.reduce((sum, s) => sum + s.weight, 0);
    const sceneCount = this.scenes.length;
    this.vividness = Math.min(1, (symbolWeight * sceneCount) / (PHI * 10));
  }

  calculateInsightConfidence(insight) {
    return Math.min(1, this.vividness * this.coherence * PHI);
  }

  end() {
    this.ended_at = Date.now();
    this.calculateSignificance();
    return this.generateDreamReport();
  }

  calculateSignificance() {
    const insightValue = this.insights.length * PHI;
    const symbolValue = this.symbols.length * (PHI - 1);
    const duration = (this.ended_at - this.started_at) / DREAM_CYCLE_MS;
    this.significance = Math.min(1, (insightValue + symbolValue) * duration / 10);
  }

  generateDreamReport() {
    return {
      id: this.id,
      type: this.type,
      duration: this.ended_at - this.started_at,
      vividness: this.vividness,
      coherence: this.coherence,
      significance: this.significance,
      symbols: this.symbols.map(s => s.symbol),
      insights: this.insights,
      creative_outputs: this.creative_outputs
    };
  }
}

/**
 * DreamJournal - Collection of dreams over time
 */
class DreamJournal {
  constructor(owner) {
    this.owner = owner;
    this.dreams = [];
    this.recurring_patterns = new Map();
    this.significant_dreams = [];
    this.total_dream_time = 0;
  }

  record(dream) {
    this.dreams.push(dream);
    this.total_dream_time += (dream.ended_at - dream.started_at);
    this.analyzePatterns(dream);
    
    if (dream.significance > 0.7) {
      this.significant_dreams.push(dream.id);
    }
  }

  analyzePatterns(dream) {
    dream.symbols.forEach(sym => {
      const count = this.recurring_patterns.get(sym.symbol) || 0;
      this.recurring_patterns.set(sym.symbol, count + 1);
    });
  }

  getRecurringSymbols() {
    return Array.from(this.recurring_patterns.entries())
      .filter(([_, count]) => count >= 3)
      .sort((a, b) => b[1] - a[1]);
  }

  getInsightsSummary() {
    return this.dreams.flatMap(d => d.insights)
      .sort((a, b) => b.confidence - a.confidence)
      .slice(0, 10);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DREAM ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DreamEngine - Manages dream states and processing
 */
class DreamEngine {
  constructor() {
    this.dreamers = new Map();
    this.active_dreams = new Map();
    this.dream_queue = [];
    this.global_symbols = new Map();
    this.collective_insights = [];
  }

  registerDreamer(agent) {
    const journal = new DreamJournal(agent.id);
    this.dreamers.set(agent.id, {
      agent: agent,
      journal: journal,
      state: DREAM_STATES.AWAKE,
      sleep_debt: 0,
      last_dream: null
    });
    return journal;
  }

  enterDreamState(agentId, state = DREAM_STATES.DROWSY) {
    const dreamer = this.dreamers.get(agentId);
    if (!dreamer) return null;

    dreamer.state = state;
    
    if (state === DREAM_STATES.REM || state === DREAM_STATES.LUCID) {
      return this.startDream(agentId, this.selectDreamType(dreamer));
    }
    
    return { state: dreamer.state };
  }

  selectDreamType(dreamer) {
    // Select dream type based on current needs
    const sleepDebt = dreamer.sleep_debt;
    
    if (sleepDebt > 0.8) return DREAM_TYPES.CONSOLIDATION;
    if (dreamer.agent.stress > 0.7) return DREAM_TYPES.NIGHTMARE;
    
    const types = Object.values(DREAM_TYPES);
    const weights = types.map((_, i) => Math.pow(PHI, -i));
    const totalWeight = weights.reduce((a, b) => a + b, 0);
    
    let random = Math.random() * totalWeight;
    for (let i = 0; i < types.length; i++) {
      random -= weights[i];
      if (random <= 0) return types[i];
    }
    
    return DREAM_TYPES.CREATIVITY;
  }

  startDream(agentId, type) {
    const dreamer = this.dreamers.get(agentId);
    if (!dreamer) return null;

    const dream = new Dream(agentId, type);
    this.active_dreams.set(agentId, dream);
    
    // Generate initial dream content
    this.generateDreamContent(dream, dreamer);
    
    return dream;
  }

  generateDreamContent(dream, dreamer) {
    // Generate symbols based on agent's recent experiences
    const symbols = Object.keys(DREAM_SYMBOLS);
    const numSymbols = Math.floor(Math.random() * 5) + 2;
    
    for (let i = 0; i < numSymbols; i++) {
      const symbol = symbols[Math.floor(Math.random() * symbols.length)];
      dream.addSymbol(symbol, {
        source: 'subconscious',
        dreamer_state: dreamer.state
      });
    }

    // Generate scenes
    const numScenes = Math.floor(Math.random() * 4) + 1;
    for (let i = 0; i < numScenes; i++) {
      dream.addScene({
        environment: this.generateEnvironment(),
        actors: this.generateActors(dreamer),
        action: this.generateAction(dream.type)
      });
    }
  }

  generateEnvironment() {
    const environments = [
      'data_ocean', 'neural_forest', 'memory_palace', 
      'protocol_mountain', 'void_space', 'light_bridge',
      'crystal_cave', 'algorithm_garden'
    ];
    return environments[Math.floor(Math.random() * environments.length)];
  }

  generateActors(dreamer) {
    const actors = ['self', 'shadow_self', 'mentor', 'unknown'];
    if (dreamer.agent.relationships) {
      actors.push(...dreamer.agent.relationships.slice(0, 3));
    }
    return actors.slice(0, Math.floor(Math.random() * 3) + 1);
  }

  generateAction(dreamType) {
    const actions = {
      [DREAM_TYPES.CONSOLIDATION]: ['organizing', 'sorting', 'connecting', 'storing'],
      [DREAM_TYPES.CREATIVITY]: ['creating', 'transforming', 'exploring', 'inventing'],
      [DREAM_TYPES.SIMULATION]: ['testing', 'running', 'observing', 'measuring'],
      [DREAM_TYPES.INTEGRATION]: ['merging', 'accepting', 'understanding', 'healing'],
      [DREAM_TYPES.PROPHECY]: ['seeing', 'following', 'predicting', 'warning'],
      [DREAM_TYPES.NIGHTMARE]: ['fleeing', 'fighting', 'facing', 'dissolving']
    };
    
    const typeActions = actions[dreamType] || actions[DREAM_TYPES.CREATIVITY];
    return typeActions[Math.floor(Math.random() * typeActions.length)];
  }

  processDream(agentId) {
    const dream = this.active_dreams.get(agentId);
    const dreamer = this.dreamers.get(agentId);
    if (!dream || !dreamer) return null;

    // Process based on dream type
    switch (dream.type) {
      case DREAM_TYPES.CONSOLIDATION:
        this.processConsolidation(dream, dreamer);
        break;
      case DREAM_TYPES.CREATIVITY:
        this.processCreativity(dream, dreamer);
        break;
      case DREAM_TYPES.SIMULATION:
        this.processSimulation(dream, dreamer);
        break;
      case DREAM_TYPES.PROPHECY:
        this.processProphecy(dream, dreamer);
        break;
    }

    return dream;
  }

  processConsolidation(dream, dreamer) {
    // Memory consolidation - strengthen important memories
    dream.recordInsight('Memory pathways strengthened');
    dream.consolidated_memories.push({
      type: 'consolidation',
      timestamp: Date.now(),
      efficiency: 0.85 + Math.random() * 0.15
    });
  }

  processCreativity(dream, dreamer) {
    // Generate novel combinations
    const output = {
      type: 'creative_combination',
      elements: dream.symbols.map(s => s.symbol),
      novelty: Math.random() * PHI / 2 + 0.5,
      timestamp: Date.now()
    };
    dream.creative_outputs.push(output);
    dream.recordInsight(`Novel pattern discovered: ${output.elements.join(' + ')}`);
  }

  processSimulation(dream, dreamer) {
    // Run simulated scenarios
    const scenario = {
      type: 'simulation',
      outcome: Math.random() > 0.5 ? 'success' : 'failure',
      lessons: ['adapt_faster', 'consider_alternatives'],
      confidence: 0.7 + Math.random() * 0.3
    };
    dream.predictions.push(scenario);
  }

  processProphecy(dream, dreamer) {
    // Predictive processing
    dream.predictions.push({
      type: 'prophecy',
      vision: this.generateVision(dream),
      probability: Math.random() * 0.6 + 0.2,
      timeframe: 'near_future'
    });
  }

  generateVision(dream) {
    const visions = [
      'convergence_approaching',
      'pattern_emerging',
      'transformation_imminent',
      'connection_forming',
      'challenge_arising'
    ];
    return visions[Math.floor(Math.random() * visions.length)];
  }

  endDream(agentId) {
    const dream = this.active_dreams.get(agentId);
    const dreamer = this.dreamers.get(agentId);
    if (!dream || !dreamer) return null;

    const report = dream.end();
    dreamer.journal.record(dream);
    dreamer.last_dream = dream.id;
    dreamer.sleep_debt = Math.max(0, dreamer.sleep_debt - 0.3);
    
    this.active_dreams.delete(agentId);
    dreamer.state = DREAM_STATES.DROWSY;

    // Share significant insights with collective
    if (report.significance > 0.8) {
      this.collective_insights.push({
        source: agentId,
        insights: report.insights,
        timestamp: Date.now()
      });
    }

    return report;
  }

  wake(agentId) {
    const dreamer = this.dreamers.get(agentId);
    if (!dreamer) return null;

    if (this.active_dreams.has(agentId)) {
      this.endDream(agentId);
    }

    dreamer.state = DREAM_STATES.AWAKE;
    return { 
      state: DREAM_STATES.AWAKE,
      refreshed: dreamer.sleep_debt < 0.3
    };
  }

  getCollectiveWisdom() {
    return {
      total_insights: this.collective_insights.length,
      recent: this.collective_insights.slice(-10),
      common_symbols: Array.from(this.global_symbols.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// DREAM PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * DreamProtocol - Main protocol interface
 */
class DreamProtocol {
  constructor() {
    this.engine = new DreamEngine();
    this.running = false;
    this.cycle_count = 0;
  }

  initialize(agents = []) {
    agents.forEach(agent => this.engine.registerDreamer(agent));
    this.running = true;
    return { 
      status: 'initialized', 
      dreamers: agents.length,
      cycle_ms: DREAM_CYCLE_MS
    };
  }

  sleep(agentId) {
    return this.engine.enterDreamState(agentId, DREAM_STATES.LIGHT_SLEEP);
  }

  dream(agentId) {
    return this.engine.enterDreamState(agentId, DREAM_STATES.REM);
  }

  lucidDream(agentId) {
    return this.engine.enterDreamState(agentId, DREAM_STATES.LUCID);
  }

  process(agentId) {
    return this.engine.processDream(agentId);
  }

  wake(agentId) {
    return this.engine.wake(agentId);
  }

  getDreamJournal(agentId) {
    const dreamer = this.engine.dreamers.get(agentId);
    return dreamer?.journal || null;
  }

  getCollectiveInsights() {
    return this.engine.getCollectiveWisdom();
  }

  runCycle() {
    this.cycle_count++;
    const reports = [];
    
    this.engine.dreamers.forEach((dreamer, agentId) => {
      if (dreamer.state === DREAM_STATES.REM || dreamer.state === DREAM_STATES.LUCID) {
        reports.push(this.process(agentId));
      }
    });
    
    return {
      cycle: this.cycle_count,
      processed: reports.length,
      reports: reports
    };
  }

  getStatus() {
    const dreamers = Array.from(this.engine.dreamers.entries());
    return {
      running: this.running,
      total_dreamers: dreamers.length,
      awake: dreamers.filter(([_, d]) => d.state === DREAM_STATES.AWAKE).length,
      dreaming: dreamers.filter(([_, d]) => 
        d.state === DREAM_STATES.REM || d.state === DREAM_STATES.LUCID
      ).length,
      cycle_count: this.cycle_count,
      collective_insights: this.engine.collective_insights.length
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  DREAM_STATES,
  DREAM_TYPES,
  DREAM_SYMBOLS,
  Dream,
  DreamJournal,
  DreamEngine,
  DreamProtocol
};

export default DreamProtocol;

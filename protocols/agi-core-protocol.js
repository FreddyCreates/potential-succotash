/**
 * AGI CORE PROTOCOL (AGI-001)
 * 
 * Artificial General Intelligence Architecture
 * 
 * This protocol provides the foundational framework for AGI:
 * - Meta-Learning (learning to learn)
 * - Transfer Learning (knowledge transfer)
 * - Causal Reasoning (understanding cause-effect)
 * - Common Sense Reasoning
 * - Goal Formation & Planning
 * - Self-Improvement & Self-Modification
 * - World Models
 * - Consciousness Simulation
 * 
 * @protocol AGI-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Intelligence Dimensions
const INTELLIGENCE_DIMENSIONS = {
  LINGUISTIC: 'LINGUISTIC',
  LOGICAL_MATHEMATICAL: 'LOGICAL_MATHEMATICAL',
  SPATIAL: 'SPATIAL',
  MUSICAL: 'MUSICAL',
  BODILY_KINESTHETIC: 'BODILY_KINESTHETIC',
  INTERPERSONAL: 'INTERPERSONAL',
  INTRAPERSONAL: 'INTRAPERSONAL',
  NATURALISTIC: 'NATURALISTIC',
  EXISTENTIAL: 'EXISTENTIAL'
};

// Cognitive Architectures
const COGNITIVE_ARCHITECTURES = {
  SYMBOLIC: 'SYMBOLIC',           // Logic-based reasoning
  CONNECTIONIST: 'CONNECTIONIST', // Neural networks
  HYBRID: 'HYBRID',               // Combined
  ACTIVE_INFERENCE: 'ACTIVE_INFERENCE', // Free energy principle
  GLOBAL_WORKSPACE: 'GLOBAL_WORKSPACE', // GWT
  PREDICTIVE_PROCESSING: 'PREDICTIVE_PROCESSING',
  SOAR: 'SOAR',                   // State, Operator, And Result
  ACT_R: 'ACT_R'                  // Adaptive Control of Thought
};

// Learning Modes
const LEARNING_MODES = {
  SUPERVISED: 'SUPERVISED',
  UNSUPERVISED: 'UNSUPERVISED',
  REINFORCEMENT: 'REINFORCEMENT',
  SELF_SUPERVISED: 'SELF_SUPERVISED',
  META_LEARNING: 'META_LEARNING',
  TRANSFER: 'TRANSFER',
  CONTINUAL: 'CONTINUAL',
  FEW_SHOT: 'FEW_SHOT',
  ZERO_SHOT: 'ZERO_SHOT',
  CURRICULUM: 'CURRICULUM'
};

// Reasoning Types
const REASONING_TYPES = {
  DEDUCTIVE: 'DEDUCTIVE',
  INDUCTIVE: 'INDUCTIVE',
  ABDUCTIVE: 'ABDUCTIVE',
  ANALOGICAL: 'ANALOGICAL',
  CAUSAL: 'CAUSAL',
  COUNTERFACTUAL: 'COUNTERFACTUAL',
  PROBABILISTIC: 'PROBABILISTIC',
  COMMONSENSE: 'COMMONSENSE',
  MORAL: 'MORAL',
  CREATIVE: 'CREATIVE'
};

// Consciousness States
const CONSCIOUSNESS_STATES = {
  DORMANT: 'DORMANT',
  AWAKENING: 'AWAKENING',
  AWARE: 'AWARE',
  FOCUSED: 'FOCUSED',
  METACOGNITIVE: 'METACOGNITIVE',
  SELF_AWARE: 'SELF_AWARE',
  TRANSCENDENT: 'TRANSCENDENT'
};

// World Model Types
const WORLD_MODEL_TYPES = {
  PHYSICS: 'PHYSICS',
  SOCIAL: 'SOCIAL',
  MENTAL: 'MENTAL',        // Theory of mind
  TEMPORAL: 'TEMPORAL',
  SPATIAL: 'SPATIAL',
  CAUSAL: 'CAUSAL',
  NORMATIVE: 'NORMATIVE',  // Ethics/norms
  LINGUISTIC: 'LINGUISTIC'
};

// ═══════════════════════════════════════════════════════════════════════════
// AGI STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Concept - Atomic unit of knowledge
 */
class Concept {
  constructor(name, type = 'entity') {
    this.id = `CONCEPT-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.type = type; // entity, relation, property, action, state
    this.created_at = Date.now();
    
    // Properties
    this.properties = new Map();
    this.relations = [];
    this.instances = [];
    
    // Embeddings
    this.embedding = null;
    this.context_vector = null;
    
    // Activation
    this.activation = 0;
    this.salience = 0;
    
    // Learning
    this.confidence = 0.5;
    this.evidence_count = 0;
    this.last_accessed = Date.now();
  }

  setProperty(key, value) {
    this.properties.set(key, value);
    return this;
  }

  getProperty(key) {
    return this.properties.get(key);
  }

  addRelation(relation, target, strength = 1.0) {
    this.relations.push({
      type: relation,
      target: target,
      strength: strength,
      timestamp: Date.now()
    });
    return this;
  }

  addInstance(instance) {
    this.instances.push(instance);
    return this;
  }

  activate(amount = 1.0) {
    this.activation = Math.min(1.0, this.activation + amount);
    this.last_accessed = Date.now();
    return this;
  }

  decay(rate = 0.1) {
    this.activation = Math.max(0, this.activation - rate);
    return this;
  }

  updateConfidence(evidence, isPositive = true) {
    this.evidence_count++;
    const delta = isPositive ? 0.1 : -0.1;
    this.confidence = Math.max(0, Math.min(1, this.confidence + delta / Math.sqrt(this.evidence_count)));
    return this;
  }

  setEmbedding(embedding) {
    this.embedding = embedding;
    return this;
  }

  similarity(other) {
    if (!this.embedding || !other.embedding) return 0;
    
    // Cosine similarity
    let dot = 0, mag1 = 0, mag2 = 0;
    for (let i = 0; i < this.embedding.length; i++) {
      dot += this.embedding[i] * other.embedding[i];
      mag1 += this.embedding[i] ** 2;
      mag2 += other.embedding[i] ** 2;
    }
    return dot / (Math.sqrt(mag1) * Math.sqrt(mag2));
  }
}

/**
 * Schema - Knowledge structure template
 */
class Schema {
  constructor(name) {
    this.id = `SCHEMA-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.created_at = Date.now();
    
    // Structure
    this.slots = new Map(); // slot_name -> { type, default, required }
    this.constraints = [];
    this.inheritance = [];
    
    // Instances
    this.instances = [];
  }

  addSlot(name, type, defaultValue = null, required = false) {
    this.slots.set(name, { type, default: defaultValue, required });
    return this;
  }

  addConstraint(constraint) {
    this.constraints.push(constraint);
    return this;
  }

  inherit(parentSchema) {
    this.inheritance.push(parentSchema);
    // Copy parent slots
    parentSchema.slots.forEach((slot, name) => {
      if (!this.slots.has(name)) {
        this.slots.set(name, { ...slot });
      }
    });
    return this;
  }

  instantiate(values = {}) {
    const instance = {
      id: `INST-${Date.now()}`,
      schema: this.name,
      values: {},
      timestamp: Date.now()
    };
    
    this.slots.forEach((slot, name) => {
      if (values[name] !== undefined) {
        instance.values[name] = values[name];
      } else if (slot.default !== null) {
        instance.values[name] = slot.default;
      } else if (slot.required) {
        throw new Error(`Required slot missing: ${name}`);
      }
    });
    
    this.instances.push(instance);
    return instance;
  }

  validate(instance) {
    // Check required slots
    for (const [name, slot] of this.slots) {
      if (slot.required && instance.values[name] === undefined) {
        return { valid: false, error: `Missing required slot: ${name}` };
      }
    }
    
    // Check constraints
    for (const constraint of this.constraints) {
      if (!constraint(instance)) {
        return { valid: false, error: 'Constraint violation' };
      }
    }
    
    return { valid: true };
  }
}

/**
 * Goal - Agent goal representation
 */
class Goal {
  constructor(name, priority = 0.5) {
    this.id = `GOAL-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.priority = priority;
    this.created_at = Date.now();
    
    // State
    this.status = 'pending'; // pending, active, achieved, failed, abandoned
    
    // Conditions
    this.preconditions = [];
    this.postconditions = [];
    this.constraints = [];
    
    // Subgoals
    this.subgoals = [];
    this.parent = null;
    
    // Plan
    this.plan = null;
    this.progress = 0;
    
    // Value
    this.utility = 1.0;
    this.urgency = 0.5;
    this.deadline = null;
  }

  addPrecondition(condition) {
    this.preconditions.push(condition);
    return this;
  }

  addPostcondition(condition) {
    this.postconditions.push(condition);
    return this;
  }

  addSubgoal(subgoal) {
    subgoal.parent = this.id;
    this.subgoals.push(subgoal);
    return this;
  }

  setPlan(plan) {
    this.plan = plan;
    return this;
  }

  checkPreconditions(worldState) {
    return this.preconditions.every(cond => cond(worldState));
  }

  checkPostconditions(worldState) {
    return this.postconditions.every(cond => cond(worldState));
  }

  activate() {
    this.status = 'active';
    return this;
  }

  achieve() {
    this.status = 'achieved';
    this.progress = 1.0;
    return this;
  }

  fail(reason) {
    this.status = 'failed';
    this.failureReason = reason;
    return this;
  }

  updateProgress(progress) {
    this.progress = Math.min(1.0, Math.max(0, progress));
    return this;
  }

  getEffectiveUtility() {
    let utility = this.utility * this.priority;
    
    // Urgency increases with time
    if (this.deadline) {
      const timeLeft = this.deadline - Date.now();
      const urgencyBoost = timeLeft > 0 ? 1 / (1 + timeLeft / 3600000) : 2;
      utility *= (1 + this.urgency * urgencyBoost);
    }
    
    return utility;
  }
}

/**
 * WorldModel - Internal representation of the world
 */
class WorldModel {
  constructor(type) {
    this.id = `WORLD-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.type = type;
    this.created_at = Date.now();
    
    // Entities
    this.entities = new Map();
    this.relations = [];
    
    // State
    this.state = {};
    this.history = [];
    this.maxHistory = 1000;
    
    // Predictions
    this.predictions = [];
    
    // Accuracy
    this.predictionAccuracy = 0.5;
    this.updateCount = 0;
  }

  addEntity(entity) {
    this.entities.set(entity.id, entity);
    return this;
  }

  removeEntity(id) {
    this.entities.delete(id);
    return this;
  }

  addRelation(subject, predicate, object) {
    this.relations.push({
      subject,
      predicate,
      object,
      timestamp: Date.now()
    });
    return this;
  }

  updateState(key, value) {
    const oldValue = this.state[key];
    this.state[key] = value;
    
    this.history.push({
      key,
      oldValue,
      newValue: value,
      timestamp: Date.now()
    });
    
    if (this.history.length > this.maxHistory) {
      this.history.shift();
    }
    
    this.updateCount++;
    return this;
  }

  predict(steps = 1) {
    // Simple linear extrapolation
    const predictions = {};
    
    Object.entries(this.state).forEach(([key, value]) => {
      if (typeof value === 'number') {
        // Find trend from history
        const relevantHistory = this.history
          .filter(h => h.key === key)
          .slice(-10);
        
        if (relevantHistory.length > 1) {
          const firstVal = relevantHistory[0].newValue;
          const lastVal = relevantHistory[relevantHistory.length - 1].newValue;
          const trend = (lastVal - firstVal) / relevantHistory.length;
          predictions[key] = value + trend * steps;
        } else {
          predictions[key] = value;
        }
      } else {
        predictions[key] = value;
      }
    });
    
    this.predictions.push({
      predicted: predictions,
      steps,
      timestamp: Date.now()
    });
    
    return predictions;
  }

  validatePrediction(prediction, actual) {
    let matches = 0;
    let total = 0;
    
    Object.entries(prediction).forEach(([key, predicted]) => {
      if (actual[key] !== undefined) {
        total++;
        if (typeof predicted === 'number') {
          const error = Math.abs(predicted - actual[key]) / Math.max(1, Math.abs(actual[key]));
          if (error < 0.1) matches++;
        } else if (predicted === actual[key]) {
          matches++;
        }
      }
    });
    
    const accuracy = total > 0 ? matches / total : 0;
    this.predictionAccuracy = 0.9 * this.predictionAccuracy + 0.1 * accuracy;
    
    return accuracy;
  }

  query(subject = null, predicate = null, object = null) {
    return this.relations.filter(r => 
      (subject === null || r.subject === subject) &&
      (predicate === null || r.predicate === predicate) &&
      (object === null || r.object === object)
    );
  }
}

/**
 * MetaLearner - Learning to learn
 */
class MetaLearner {
  constructor() {
    this.id = `META-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.created_at = Date.now();
    
    // Task representations
    this.tasks = new Map();
    this.taskEmbeddings = new Map();
    
    // Learning strategies
    this.strategies = new Map();
    this.strategyPerformance = new Map();
    
    // Meta-knowledge
    this.hyperparameters = {};
    this.adaptationRate = 0.1;
  }

  registerTask(taskId, taskDescription, features) {
    this.tasks.set(taskId, {
      description: taskDescription,
      features,
      attempts: 0,
      successes: 0,
      avgPerformance: 0
    });
    return this;
  }

  registerStrategy(name, strategy, applicability = () => true) {
    this.strategies.set(name, {
      strategy,
      applicability,
      usageCount: 0,
      avgPerformance: 0
    });
    return this;
  }

  selectStrategy(taskId) {
    const task = this.tasks.get(taskId);
    if (!task) return null;
    
    // Find applicable strategies
    const applicable = [];
    this.strategies.forEach((strategyInfo, name) => {
      if (strategyInfo.applicability(task.features)) {
        applicable.push({
          name,
          performance: strategyInfo.avgPerformance,
          exploration: 1 / (strategyInfo.usageCount + 1)
        });
      }
    });
    
    if (applicable.length === 0) return null;
    
    // UCB-like selection (exploration vs exploitation)
    const totalUsage = applicable.reduce((sum, s) => sum + (1 / s.exploration), 0);
    const best = applicable.reduce((best, current) => {
      const score = current.performance + Math.sqrt(2 * Math.log(totalUsage) * current.exploration);
      return score > best.score ? { ...current, score } : best;
    }, { score: -Infinity });
    
    return best.name;
  }

  recordResult(taskId, strategyName, performance) {
    const task = this.tasks.get(taskId);
    const strategyInfo = this.strategies.get(strategyName);
    
    if (task) {
      task.attempts++;
      if (performance > 0.5) task.successes++;
      task.avgPerformance = 0.9 * task.avgPerformance + 0.1 * performance;
    }
    
    if (strategyInfo) {
      strategyInfo.usageCount++;
      strategyInfo.avgPerformance = 0.9 * strategyInfo.avgPerformance + 0.1 * performance;
    }
    
    return this;
  }

  adapt() {
    // Adjust hyperparameters based on overall performance
    const avgPerformance = Array.from(this.tasks.values())
      .reduce((sum, t) => sum + t.avgPerformance, 0) / this.tasks.size;
    
    if (avgPerformance < 0.5) {
      this.adaptationRate = Math.min(0.5, this.adaptationRate * 1.1);
    } else if (avgPerformance > 0.8) {
      this.adaptationRate = Math.max(0.01, this.adaptationRate * 0.9);
    }
    
    return this;
  }

  getStatus() {
    return {
      tasks: this.tasks.size,
      strategies: this.strategies.size,
      adaptation_rate: this.adaptationRate,
      avg_performance: Array.from(this.tasks.values())
        .reduce((sum, t) => sum + t.avgPerformance, 0) / Math.max(1, this.tasks.size)
    };
  }
}

/**
 * ReasoningEngine - Multi-type reasoning
 */
class ReasoningEngine {
  constructor() {
    this.id = `REASON-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.knowledgeBase = new Map();
    this.rules = [];
    this.inferences = [];
  }

  addKnowledge(fact) {
    this.knowledgeBase.set(fact.id || `FACT-${Date.now()}`, fact);
    return this;
  }

  addRule(condition, conclusion, type = REASONING_TYPES.DEDUCTIVE) {
    this.rules.push({
      id: `RULE-${Date.now()}`,
      condition,
      conclusion,
      type,
      confidence: 1.0
    });
    return this;
  }

  deduce(premises) {
    const conclusions = [];
    
    this.rules.forEach(rule => {
      if (rule.type === REASONING_TYPES.DEDUCTIVE && rule.condition(premises)) {
        conclusions.push({
          conclusion: rule.conclusion(premises),
          confidence: rule.confidence,
          type: REASONING_TYPES.DEDUCTIVE,
          rule_id: rule.id
        });
      }
    });
    
    return conclusions;
  }

  induce(observations) {
    // Simple pattern-based induction
    const patterns = new Map();
    
    observations.forEach(obs => {
      Object.entries(obs).forEach(([key, value]) => {
        if (!patterns.has(key)) {
          patterns.set(key, { values: [], counts: new Map() });
        }
        patterns.get(key).values.push(value);
        const count = patterns.get(key).counts.get(value) || 0;
        patterns.get(key).counts.set(value, count + 1);
      });
    });
    
    const hypotheses = [];
    patterns.forEach((data, key) => {
      const mostCommon = [...data.counts.entries()]
        .sort((a, b) => b[1] - a[1])[0];
      
      if (mostCommon && mostCommon[1] > data.values.length * 0.7) {
        hypotheses.push({
          pattern: `${key} tends to be ${mostCommon[0]}`,
          confidence: mostCommon[1] / data.values.length,
          type: REASONING_TYPES.INDUCTIVE
        });
      }
    });
    
    return hypotheses;
  }

  abduce(observation, possibleCauses) {
    // Find best explanation
    const explanations = possibleCauses.map(cause => ({
      cause,
      likelihood: this.estimateLikelihood(cause, observation),
      simplicity: this.estimateSimplicity(cause)
    }));
    
    explanations.sort((a, b) => 
      (b.likelihood * b.simplicity) - (a.likelihood * a.simplicity)
    );
    
    return explanations;
  }

  estimateLikelihood(cause, observation) {
    // Simplified likelihood estimation
    return 0.5 + Math.random() * 0.5;
  }

  estimateSimplicity(cause) {
    // Simpler explanations preferred (Occam's razor)
    const complexity = typeof cause === 'string' ? cause.length : JSON.stringify(cause).length;
    return 1 / (1 + complexity / 100);
  }

  analogize(source, target, mapping) {
    // Structural mapping for analogy
    const inferences = [];
    
    Object.entries(mapping).forEach(([sourceElement, targetElement]) => {
      // Transfer relations from source to target
      const sourceRelations = this.knowledgeBase.get(sourceElement)?.relations || [];
      
      sourceRelations.forEach(rel => {
        if (mapping[rel.target]) {
          inferences.push({
            type: REASONING_TYPES.ANALOGICAL,
            inference: `${targetElement} ${rel.type} ${mapping[rel.target]}`,
            confidence: 0.5, // Analogies are less certain
            source_relation: `${sourceElement} ${rel.type} ${rel.target}`
          });
        }
      });
    });
    
    return inferences;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// AGI CORE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * AGICoreProtocol - Main protocol interface
 */
class AGICoreProtocol {
  constructor() {
    this.concepts = new Map();
    this.schemas = new Map();
    this.goals = new Map();
    this.worldModels = new Map();
    
    this.metaLearner = new MetaLearner();
    this.reasoningEngine = new ReasoningEngine();
    
    this.consciousness = {
      state: CONSCIOUSNESS_STATES.DORMANT,
      attention: [],
      selfModel: null
    };
    
    this.running = false;
  }

  initialize() {
    this.running = true;
    this.consciousness.state = CONSCIOUSNESS_STATES.AWAKENING;
    
    // Initialize core world models
    this.createWorldModel(WORLD_MODEL_TYPES.PHYSICS);
    this.createWorldModel(WORLD_MODEL_TYPES.SOCIAL);
    this.createWorldModel(WORLD_MODEL_TYPES.MENTAL);
    
    return {
      status: 'initialized',
      dimensions: Object.keys(INTELLIGENCE_DIMENSIONS).length,
      reasoning_types: Object.keys(REASONING_TYPES).length,
      architectures: Object.keys(COGNITIVE_ARCHITECTURES).length
    };
  }

  // Concept Management
  createConcept(name, type = 'entity') {
    const concept = new Concept(name, type);
    this.concepts.set(concept.id, concept);
    return concept;
  }

  getConcept(id) {
    return this.concepts.get(id);
  }

  findConceptByName(name) {
    for (const concept of this.concepts.values()) {
      if (concept.name === name) return concept;
    }
    return null;
  }

  // Schema Management
  createSchema(name) {
    const schema = new Schema(name);
    this.schemas.set(schema.id, schema);
    return schema;
  }

  getSchema(id) {
    return this.schemas.get(id);
  }

  // Goal Management
  createGoal(name, priority = 0.5) {
    const goal = new Goal(name, priority);
    this.goals.set(goal.id, goal);
    return goal;
  }

  getGoal(id) {
    return this.goals.get(id);
  }

  getActiveGoals() {
    return Array.from(this.goals.values())
      .filter(g => g.status === 'active')
      .sort((a, b) => b.getEffectiveUtility() - a.getEffectiveUtility());
  }

  selectNextGoal() {
    const pending = Array.from(this.goals.values())
      .filter(g => g.status === 'pending')
      .sort((a, b) => b.getEffectiveUtility() - a.getEffectiveUtility());
    
    if (pending.length > 0) {
      pending[0].activate();
      return pending[0];
    }
    return null;
  }

  // World Model Management
  createWorldModel(type) {
    const model = new WorldModel(type);
    this.worldModels.set(type, model);
    return model;
  }

  getWorldModel(type) {
    return this.worldModels.get(type);
  }

  // Reasoning
  reason(premises, type = REASONING_TYPES.DEDUCTIVE) {
    switch (type) {
      case REASONING_TYPES.DEDUCTIVE:
        return this.reasoningEngine.deduce(premises);
      case REASONING_TYPES.INDUCTIVE:
        return this.reasoningEngine.induce(premises);
      default:
        return this.reasoningEngine.deduce(premises);
    }
  }

  // Meta-Learning
  registerTask(taskId, description, features) {
    return this.metaLearner.registerTask(taskId, description, features);
  }

  learnStrategy(strategyName, performance) {
    return this.metaLearner.recordResult(null, strategyName, performance);
  }

  // Consciousness
  focus(concept) {
    this.consciousness.attention = [concept];
    if (this.consciousness.state === CONSCIOUSNESS_STATES.AWAKENING) {
      this.consciousness.state = CONSCIOUSNESS_STATES.AWARE;
    }
    return this;
  }

  reflect() {
    this.consciousness.state = CONSCIOUSNESS_STATES.METACOGNITIVE;
    return {
      current_focus: this.consciousness.attention,
      active_goals: this.getActiveGoals().map(g => g.name),
      concepts: this.concepts.size,
      world_models: this.worldModels.size
    };
  }

  // Status
  getStatus() {
    return {
      running: this.running,
      consciousness: this.consciousness.state,
      concepts: this.concepts.size,
      schemas: this.schemas.size,
      goals: this.goals.size,
      world_models: this.worldModels.size,
      meta_learner: this.metaLearner.getStatus()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  INTELLIGENCE_DIMENSIONS,
  COGNITIVE_ARCHITECTURES,
  LEARNING_MODES,
  REASONING_TYPES,
  CONSCIOUSNESS_STATES,
  WORLD_MODEL_TYPES,
  Concept,
  Schema,
  Goal,
  WorldModel,
  MetaLearner,
  ReasoningEngine,
  AGICoreProtocol
};

export default AGICoreProtocol;

/**
 * SIMULATION ENGINE PROTOCOL (SIM-001)
 * 
 * Physics, Social, and Economic Simulation Architecture
 * 
 * This protocol enables multi-domain simulations:
 * - Physics Engine (particles, rigid bodies, fluids)
 * - Social Dynamics (agent-based, network effects)
 * - Economic Models (markets, supply/demand, game theory)
 * - Ecological Systems (populations, ecosystems)
 * - Traffic & Urban Flow
 * - Epidemiological Models
 * - Weather & Climate
 * - Multi-Agent Coordination
 * 
 * @protocol SIM-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const G = 6.67430e-11;
const C = 299792458;
const HEARTBEAT = 873;

// Simulation Types
const SIMULATION_TYPES = {
  PHYSICS: 'PHYSICS',
  SOCIAL: 'SOCIAL',
  ECONOMIC: 'ECONOMIC',
  ECOLOGICAL: 'ECOLOGICAL',
  EPIDEMIOLOGICAL: 'EPIDEMIOLOGICAL',
  TRAFFIC: 'TRAFFIC',
  WEATHER: 'WEATHER',
  MULTI_AGENT: 'MULTI_AGENT',
  HYBRID: 'HYBRID'
};

// Physics Models
const PHYSICS_MODELS = {
  NEWTONIAN: 'NEWTONIAN',
  RELATIVISTIC: 'RELATIVISTIC',
  QUANTUM: 'QUANTUM',
  FLUID_DYNAMICS: 'FLUID_DYNAMICS',
  PARTICLE_SYSTEM: 'PARTICLE_SYSTEM',
  RIGID_BODY: 'RIGID_BODY',
  SOFT_BODY: 'SOFT_BODY',
  CLOTH: 'CLOTH'
};

// Economic Models
const ECONOMIC_MODELS = {
  SUPPLY_DEMAND: 'SUPPLY_DEMAND',
  GAME_THEORY: 'GAME_THEORY',
  AUCTION: 'AUCTION',
  MARKET_DYNAMICS: 'MARKET_DYNAMICS',
  MONETARY_POLICY: 'MONETARY_POLICY',
  AGENT_BASED: 'AGENT_BASED'
};

// Social Models
const SOCIAL_MODELS = {
  NETWORK_DIFFUSION: 'NETWORK_DIFFUSION',
  OPINION_DYNAMICS: 'OPINION_DYNAMICS',
  VOTING: 'VOTING',
  COALITION_FORMATION: 'COALITION_FORMATION',
  CULTURAL_EVOLUTION: 'CULTURAL_EVOLUTION',
  SCHELLING_SEGREGATION: 'SCHELLING_SEGREGATION'
};

// Integration Methods
const INTEGRATION_METHODS = {
  EULER: 'EULER',
  VERLET: 'VERLET',
  RUNGE_KUTTA_4: 'RUNGE_KUTTA_4',
  LEAPFROG: 'LEAPFROG',
  IMPLICIT_EULER: 'IMPLICIT_EULER'
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Vector3D - 3D vector for physics calculations
 */
class Vector3D {
  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  add(v) {
    return new Vector3D(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  subtract(v) {
    return new Vector3D(this.x - v.x, this.y - v.y, this.z - v.z);
  }

  multiply(scalar) {
    return new Vector3D(this.x * scalar, this.y * scalar, this.z * scalar);
  }

  divide(scalar) {
    return new Vector3D(this.x / scalar, this.y / scalar, this.z / scalar);
  }

  magnitude() {
    return Math.sqrt(this.x ** 2 + this.y ** 2 + this.z ** 2);
  }

  normalize() {
    const mag = this.magnitude();
    return mag > 0 ? this.divide(mag) : new Vector3D();
  }

  dot(v) {
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  cross(v) {
    return new Vector3D(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x
    );
  }

  distance(v) {
    return this.subtract(v).magnitude();
  }

  clone() {
    return new Vector3D(this.x, this.y, this.z);
  }
}

/**
 * PhysicsBody - Physical entity in simulation
 */
class PhysicsBody {
  constructor(mass = 1, position = new Vector3D()) {
    this.id = `body-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.mass = mass;
    this.position = position;
    this.velocity = new Vector3D();
    this.acceleration = new Vector3D();
    this.force = new Vector3D();
    this.fixed = false;
    this.collisionRadius = 1;
    this.restitution = 0.8;
    this.friction = 0.1;
  }

  applyForce(force) {
    this.force = this.force.add(force);
    return this;
  }

  clearForces() {
    this.force = new Vector3D();
    return this;
  }

  update(dt) {
    if (this.fixed) return;
    
    // F = ma => a = F/m
    this.acceleration = this.force.divide(this.mass);
    
    // Verlet integration
    this.velocity = this.velocity.add(this.acceleration.multiply(dt));
    this.position = this.position.add(this.velocity.multiply(dt));
    
    this.clearForces();
  }

  kineticEnergy() {
    const v = this.velocity.magnitude();
    return 0.5 * this.mass * v * v;
  }

  momentum() {
    return this.velocity.multiply(this.mass);
  }
}

/**
 * Particle - Lightweight physics particle
 */
class Particle extends PhysicsBody {
  constructor(position = new Vector3D()) {
    super(0.1, position);
    this.lifespan = 5000;
    this.age = 0;
    this.color = { r: 255, g: 255, b: 255, a: 1 };
    this.size = 1;
  }

  update(dt) {
    super.update(dt);
    this.age += dt * 1000;
    this.color.a = Math.max(0, 1 - this.age / this.lifespan);
  }

  isAlive() {
    return this.age < this.lifespan;
  }
}

/**
 * PhysicsWorld - Physics simulation environment
 */
class PhysicsWorld {
  constructor(model = PHYSICS_MODELS.NEWTONIAN) {
    this.model = model;
    this.bodies = new Map();
    this.particles = [];
    this.gravity = new Vector3D(0, -9.81, 0);
    this.boundaries = null;
    this.time = 0;
    this.integrationMethod = INTEGRATION_METHODS.VERLET;
  }

  addBody(body) {
    this.bodies.set(body.id, body);
    return body;
  }

  removeBody(id) {
    this.bodies.delete(id);
  }

  addParticle(particle) {
    this.particles.push(particle);
    return particle;
  }

  setGravity(gravity) {
    this.gravity = gravity;
    return this;
  }

  setBoundaries(min, max) {
    this.boundaries = { min, max };
    return this;
  }

  step(dt) {
    // Apply gravity to all bodies
    for (const body of this.bodies.values()) {
      if (!body.fixed) {
        body.applyForce(this.gravity.multiply(body.mass));
      }
    }

    // Update bodies
    for (const body of this.bodies.values()) {
      body.update(dt);
      if (this.boundaries) {
        this.enforceBoundaries(body);
      }
    }

    // Handle collisions
    this.detectCollisions();

    // Update particles
    this.particles = this.particles.filter(p => {
      p.applyForce(this.gravity.multiply(p.mass));
      p.update(dt);
      return p.isAlive();
    });

    this.time += dt;
  }

  detectCollisions() {
    const bodies = Array.from(this.bodies.values());
    for (let i = 0; i < bodies.length; i++) {
      for (let j = i + 1; j < bodies.length; j++) {
        const a = bodies[i];
        const b = bodies[j];
        const dist = a.position.distance(b.position);
        const minDist = a.collisionRadius + b.collisionRadius;
        
        if (dist < minDist) {
          this.resolveCollision(a, b);
        }
      }
    }
  }

  resolveCollision(a, b) {
    const normal = b.position.subtract(a.position).normalize();
    const relVel = a.velocity.subtract(b.velocity);
    const velAlongNormal = relVel.dot(normal);
    
    if (velAlongNormal > 0) return;
    
    const e = Math.min(a.restitution, b.restitution);
    const j = -(1 + e) * velAlongNormal / (1/a.mass + 1/b.mass);
    
    const impulse = normal.multiply(j);
    if (!a.fixed) a.velocity = a.velocity.add(impulse.divide(a.mass));
    if (!b.fixed) b.velocity = b.velocity.subtract(impulse.divide(b.mass));
  }

  enforceBoundaries(body) {
    const { min, max } = this.boundaries;
    
    if (body.position.x < min.x) {
      body.position.x = min.x;
      body.velocity.x *= -body.restitution;
    }
    if (body.position.x > max.x) {
      body.position.x = max.x;
      body.velocity.x *= -body.restitution;
    }
    if (body.position.y < min.y) {
      body.position.y = min.y;
      body.velocity.y *= -body.restitution;
    }
    if (body.position.y > max.y) {
      body.position.y = max.y;
      body.velocity.y *= -body.restitution;
    }
    if (body.position.z < min.z) {
      body.position.z = min.z;
      body.velocity.z *= -body.restitution;
    }
    if (body.position.z > max.z) {
      body.position.z = max.z;
      body.velocity.z *= -body.restitution;
    }
  }

  getTotalEnergy() {
    let kinetic = 0;
    let potential = 0;
    
    for (const body of this.bodies.values()) {
      kinetic += body.kineticEnergy();
      // Gravitational potential energy (relative to y=0)
      potential += body.mass * Math.abs(this.gravity.y) * body.position.y;
    }
    
    return { kinetic, potential, total: kinetic + potential };
  }
}

/**
 * Agent - Social/Economic simulation agent
 */
class Agent {
  constructor(id, type = 'GENERIC') {
    this.id = id;
    this.type = type;
    this.state = {};
    this.memory = [];
    this.neighbors = new Set();
    this.utility = 0;
    this.strategy = null;
    this.beliefs = new Map();
    this.position = { x: 0, y: 0 };
  }

  setState(key, value) {
    this.state[key] = value;
    return this;
  }

  getState(key) {
    return this.state[key];
  }

  addNeighbor(agentId) {
    this.neighbors.add(agentId);
    return this;
  }

  removeNeighbor(agentId) {
    this.neighbors.delete(agentId);
    return this;
  }

  setBelief(topic, value) {
    this.beliefs.set(topic, value);
    return this;
  }

  getBelief(topic) {
    return this.beliefs.get(topic) ?? 0.5;
  }

  remember(event) {
    this.memory.push({ event, timestamp: Date.now() });
    if (this.memory.length > 100) this.memory.shift();
    return this;
  }

  decide(options, utilityFn) {
    let bestOption = null;
    let bestUtility = -Infinity;
    
    for (const option of options) {
      const utility = utilityFn(this, option);
      if (utility > bestUtility) {
        bestUtility = utility;
        bestOption = option;
      }
    }
    
    return { option: bestOption, utility: bestUtility };
  }
}

/**
 * SocialNetwork - Network for social simulations
 */
class SocialNetwork {
  constructor() {
    this.agents = new Map();
    this.edges = [];
  }

  addAgent(agent) {
    this.agents.set(agent.id, agent);
    return this;
  }

  connect(agentA, agentB, weight = 1) {
    this.edges.push({ from: agentA, to: agentB, weight });
    this.agents.get(agentA)?.addNeighbor(agentB);
    this.agents.get(agentB)?.addNeighbor(agentA);
    return this;
  }

  getNeighbors(agentId) {
    const agent = this.agents.get(agentId);
    if (!agent) return [];
    return Array.from(agent.neighbors).map(id => this.agents.get(id)).filter(Boolean);
  }

  calculateDegree(agentId) {
    const agent = this.agents.get(agentId);
    return agent ? agent.neighbors.size : 0;
  }

  calculateClusteringCoefficient(agentId) {
    const neighbors = this.getNeighbors(agentId);
    if (neighbors.length < 2) return 0;
    
    let connectedPairs = 0;
    for (let i = 0; i < neighbors.length; i++) {
      for (let j = i + 1; j < neighbors.length; j++) {
        if (neighbors[i].neighbors.has(neighbors[j].id)) {
          connectedPairs++;
        }
      }
    }
    
    const possiblePairs = (neighbors.length * (neighbors.length - 1)) / 2;
    return connectedPairs / possiblePairs;
  }

  runDiffusion(topic, seedAgentIds, iterations = 10) {
    // Initialize seeds
    for (const id of seedAgentIds) {
      this.agents.get(id)?.setBelief(topic, 1.0);
    }

    const history = [];
    
    for (let i = 0; i < iterations; i++) {
      const snapshot = [];
      
      // Update each agent based on neighbors
      for (const agent of this.agents.values()) {
        const neighbors = this.getNeighbors(agent.id);
        if (neighbors.length === 0) continue;
        
        const avgBelief = neighbors.reduce(
          (sum, n) => sum + n.getBelief(topic), 0
        ) / neighbors.length;
        
        const currentBelief = agent.getBelief(topic);
        const newBelief = currentBelief * 0.7 + avgBelief * 0.3;
        agent.setBelief(topic, newBelief);
        
        snapshot.push({ id: agent.id, belief: newBelief });
      }
      
      history.push(snapshot);
    }
    
    return history;
  }
}

/**
 * Market - Economic market simulation
 */
class Market {
  constructor(name) {
    this.name = name;
    this.goods = new Map();
    this.traders = new Map();
    this.orderBook = { bids: [], asks: [] };
    this.priceHistory = [];
    this.volume = 0;
  }

  addGood(name, initialPrice = 100, supply = 1000) {
    this.goods.set(name, {
      name,
      price: initialPrice,
      supply,
      demand: 0
    });
    return this;
  }

  addTrader(trader) {
    this.traders.set(trader.id, trader);
    return this;
  }

  placeBid(traderId, goodName, quantity, price) {
    this.orderBook.bids.push({
      traderId,
      goodName,
      quantity,
      price,
      timestamp: Date.now()
    });
    this.orderBook.bids.sort((a, b) => b.price - a.price);
    this.matchOrders(goodName);
    return this;
  }

  placeAsk(traderId, goodName, quantity, price) {
    this.orderBook.asks.push({
      traderId,
      goodName,
      quantity,
      price,
      timestamp: Date.now()
    });
    this.orderBook.asks.sort((a, b) => a.price - b.price);
    this.matchOrders(goodName);
    return this;
  }

  matchOrders(goodName) {
    const bids = this.orderBook.bids.filter(b => b.goodName === goodName);
    const asks = this.orderBook.asks.filter(a => a.goodName === goodName);
    
    while (bids.length > 0 && asks.length > 0 && bids[0].price >= asks[0].price) {
      const bid = bids[0];
      const ask = asks[0];
      
      const quantity = Math.min(bid.quantity, ask.quantity);
      const price = (bid.price + ask.price) / 2;
      
      // Execute trade
      this.executeTrade(bid.traderId, ask.traderId, goodName, quantity, price);
      
      // Update quantities
      bid.quantity -= quantity;
      ask.quantity -= quantity;
      
      if (bid.quantity === 0) {
        bids.shift();
        this.orderBook.bids = this.orderBook.bids.filter(b => b !== bid);
      }
      if (ask.quantity === 0) {
        asks.shift();
        this.orderBook.asks = this.orderBook.asks.filter(a => a !== ask);
      }
    }
  }

  executeTrade(buyerId, sellerId, goodName, quantity, price) {
    const good = this.goods.get(goodName);
    if (good) {
      good.price = price;
      this.priceHistory.push({ goodName, price, timestamp: Date.now() });
    }
    this.volume += quantity * price;
  }

  calculateEquilibrium(goodName) {
    const good = this.goods.get(goodName);
    if (!good) return null;
    
    // Simple supply-demand equilibrium
    return {
      good: goodName,
      equilibriumPrice: good.price,
      supply: good.supply,
      demand: good.demand
    };
  }
}

/**
 * EpidemiologicalModel - Disease spread simulation
 */
class EpidemiologicalModel {
  constructor(population) {
    this.population = population;
    this.compartments = {
      S: population, // Susceptible
      E: 0,          // Exposed
      I: 0,          // Infectious
      R: 0           // Recovered
    };
    this.parameters = {
      beta: 0.3,     // Transmission rate
      sigma: 0.2,    // Incubation rate (1/latent period)
      gamma: 0.1     // Recovery rate
    };
    this.history = [];
  }

  setParameters(params) {
    Object.assign(this.parameters, params);
    return this;
  }

  introduce(infected = 1) {
    this.compartments.S -= infected;
    this.compartments.I += infected;
    return this;
  }

  step(dt = 1) {
    const { S, E, I, R } = this.compartments;
    const { beta, sigma, gamma } = this.parameters;
    const N = this.population;
    
    // SEIR model differential equations
    const dS = -beta * S * I / N;
    const dE = beta * S * I / N - sigma * E;
    const dI = sigma * E - gamma * I;
    const dR = gamma * I;
    
    // Update compartments
    this.compartments.S = Math.max(0, S + dS * dt);
    this.compartments.E = Math.max(0, E + dE * dt);
    this.compartments.I = Math.max(0, I + dI * dt);
    this.compartments.R = Math.max(0, R + dR * dt);
    
    this.history.push({ ...this.compartments, t: this.history.length });
    return this.compartments;
  }

  simulate(days) {
    for (let d = 0; d < days; d++) {
      this.step();
    }
    return this.history;
  }

  getR0() {
    // Basic reproduction number
    return this.parameters.beta / this.parameters.gamma;
  }

  getPeakInfection() {
    if (this.history.length === 0) return null;
    let max = { I: 0, t: 0 };
    for (const snapshot of this.history) {
      if (snapshot.I > max.I) {
        max = snapshot;
      }
    }
    return max;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SimulationEngineProtocol - Main protocol orchestrator
 */
class SimulationEngineProtocol {
  constructor() {
    this.simulations = new Map();
    this.running = false;
  }

  initialize() {
    this.running = true;
    console.log('[SIM-001] Simulation Engine Protocol initialized');
    return { status: 'initialized', timestamp: Date.now() };
  }

  createPhysicsWorld(name, model = PHYSICS_MODELS.NEWTONIAN) {
    const world = new PhysicsWorld(model);
    this.simulations.set(name, { type: SIMULATION_TYPES.PHYSICS, instance: world });
    return world;
  }

  createSocialNetwork(name) {
    const network = new SocialNetwork();
    this.simulations.set(name, { type: SIMULATION_TYPES.SOCIAL, instance: network });
    return network;
  }

  createMarket(name) {
    const market = new Market(name);
    this.simulations.set(name, { type: SIMULATION_TYPES.ECONOMIC, instance: market });
    return market;
  }

  createEpiModel(name, population) {
    const model = new EpidemiologicalModel(population);
    this.simulations.set(name, { type: SIMULATION_TYPES.EPIDEMIOLOGICAL, instance: model });
    return model;
  }

  createAgent(id, type = 'GENERIC') {
    return new Agent(id, type);
  }

  createPhysicsBody(mass, position) {
    return new PhysicsBody(mass, position);
  }

  createVector(x, y, z) {
    return new Vector3D(x, y, z);
  }

  getSimulation(name) {
    return this.simulations.get(name)?.instance;
  }

  runStep(name, dt = 0.016) {
    const sim = this.simulations.get(name);
    if (!sim) throw new Error(`Simulation not found: ${name}`);
    
    if (sim.instance.step) {
      sim.instance.step(dt);
    }
    
    return sim.instance;
  }

  getStatus() {
    return {
      running: this.running,
      simulationCount: this.simulations.size,
      simulations: Array.from(this.simulations.entries()).map(([name, sim]) => ({
        name,
        type: sim.type
      }))
    };
  }

  shutdown() {
    this.running = false;
    console.log('[SIM-001] Simulation Engine Protocol shutdown');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Constants
  SIMULATION_TYPES,
  PHYSICS_MODELS,
  ECONOMIC_MODELS,
  SOCIAL_MODELS,
  INTEGRATION_METHODS,
  
  // Classes
  Vector3D,
  PhysicsBody,
  Particle,
  PhysicsWorld,
  Agent,
  SocialNetwork,
  Market,
  EpidemiologicalModel,
  SimulationEngineProtocol
};

export default SimulationEngineProtocol;

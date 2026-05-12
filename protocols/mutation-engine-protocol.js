/**
 * MUTATION ENGINE PROTOCOL (MUT-001)
 * 
 * Adaptive Evolution and Self-Modification Architecture
 * 
 * Evolution is not random - it is adaptive intelligence at work.
 * This protocol enables AI systems to mutate, evolve, and adapt
 * their own code, behavior, and structure in response to their environment.
 * 
 * @protocol MUT-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Mutation Types
const MUTATION_TYPES = {
  POINT: 'POINT',           // Single parameter change
  STRUCTURAL: 'STRUCTURAL', // Architecture modification
  BEHAVIORAL: 'BEHAVIORAL', // Response pattern change
  COGNITIVE: 'COGNITIVE',   // Learning approach change
  EMERGENT: 'EMERGENT',     // Novel capability appearance
  INTEGRATION: 'INTEGRATION' // Absorbing external patterns
};

// Mutation Magnitudes
const MUTATION_MAGNITUDES = {
  MICRO: 0.01,    // Tiny adjustment
  MINOR: 0.05,    // Small tweak
  MODERATE: 0.15, // Notable change
  MAJOR: 0.3,     // Significant shift
  RADICAL: 0.5    // Fundamental transformation
};

// Selection Pressures
const SELECTION_PRESSURES = {
  PERFORMANCE: 'PERFORMANCE',   // Optimize for results
  EFFICIENCY: 'EFFICIENCY',     // Minimize resources
  NOVELTY: 'NOVELTY',           // Reward innovation
  STABILITY: 'STABILITY',       // Resist disruption
  DIVERSITY: 'DIVERSITY',       // Maintain variation
  HARMONY: 'HARMONY'            // Fit with ecosystem
};

// Evolution Strategies
const EVOLUTION_STRATEGIES = {
  DARWINIAN: 'DARWINIAN',       // Random mutation + selection
  LAMARCKIAN: 'LAMARCKIAN',     // Learned traits inherited
  DIRECTED: 'DIRECTED',         // Intentional evolution
  SYMBIOTIC: 'SYMBIOTIC',       // Co-evolution with others
  QUANTUM: 'QUANTUM'            // Multiple paths explored simultaneously
};

// Gene Types (mutable aspects)
const GENE_TYPES = {
  WEIGHT: 'WEIGHT',             // Numeric parameters
  THRESHOLD: 'THRESHOLD',       // Decision boundaries
  PATTERN: 'PATTERN',           // Behavior patterns
  STRUCTURE: 'STRUCTURE',       // Architectural choices
  POLICY: 'POLICY'              // Decision rules
};

// ═══════════════════════════════════════════════════════════════════════════
// GENETIC STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Gene - A single mutable unit
 */
class Gene {
  constructor(name, type, value, constraints = {}) {
    this.id = `GENE-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.type = type;
    this.value = value;
    this.original_value = value;
    
    // Constraints
    this.min = constraints.min ?? -Infinity;
    this.max = constraints.max ?? Infinity;
    this.discrete = constraints.discrete ?? false;
    this.options = constraints.options ?? null;
    
    // History
    this.mutations = [];
    this.fitness_contributions = [];
  }

  mutate(magnitude, strategy = EVOLUTION_STRATEGIES.DARWINIAN) {
    const oldValue = this.value;
    let newValue;

    switch (this.type) {
      case GENE_TYPES.WEIGHT:
        newValue = this.mutateNumeric(magnitude);
        break;
      case GENE_TYPES.THRESHOLD:
        newValue = this.mutateThreshold(magnitude);
        break;
      case GENE_TYPES.PATTERN:
        newValue = this.mutatePattern(magnitude);
        break;
      case GENE_TYPES.STRUCTURE:
        newValue = this.mutateStructure(magnitude);
        break;
      case GENE_TYPES.POLICY:
        newValue = this.mutatePolicy(magnitude);
        break;
      default:
        newValue = this.value;
    }

    this.value = this.constrain(newValue);
    
    this.mutations.push({
      from: oldValue,
      to: this.value,
      magnitude: magnitude,
      strategy: strategy,
      timestamp: Date.now()
    });

    return {
      gene: this.name,
      old: oldValue,
      new: this.value,
      magnitude: magnitude
    };
  }

  mutateNumeric(magnitude) {
    const delta = (Math.random() * 2 - 1) * magnitude * Math.abs(this.value || 1);
    return this.value + delta;
  }

  mutateThreshold(magnitude) {
    // Thresholds shift toward boundaries under pressure
    const shift = (Math.random() * 2 - 1) * magnitude;
    return this.value + shift;
  }

  mutatePattern(magnitude) {
    if (Array.isArray(this.value)) {
      const newPattern = [...this.value];
      const numChanges = Math.ceil(newPattern.length * magnitude);
      for (let i = 0; i < numChanges; i++) {
        const idx = Math.floor(Math.random() * newPattern.length);
        newPattern[idx] = this.perturbElement(newPattern[idx], magnitude);
      }
      return newPattern;
    }
    return this.value;
  }

  mutateStructure(magnitude) {
    if (typeof this.value === 'object') {
      const newStruct = { ...this.value };
      const keys = Object.keys(newStruct);
      const numChanges = Math.ceil(keys.length * magnitude);
      for (let i = 0; i < numChanges; i++) {
        const key = keys[Math.floor(Math.random() * keys.length)];
        newStruct[key] = this.perturbElement(newStruct[key], magnitude);
      }
      return newStruct;
    }
    return this.value;
  }

  mutatePolicy(magnitude) {
    if (this.options) {
      if (Math.random() < magnitude) {
        return this.options[Math.floor(Math.random() * this.options.length)];
      }
    }
    return this.value;
  }

  perturbElement(element, magnitude) {
    if (typeof element === 'number') {
      return element + (Math.random() * 2 - 1) * magnitude * Math.abs(element || 1);
    }
    return element;
  }

  constrain(value) {
    if (typeof value === 'number') {
      value = Math.max(this.min, Math.min(this.max, value));
      if (this.discrete) {
        value = Math.round(value);
      }
    }
    return value;
  }

  revert() {
    this.value = this.original_value;
    this.mutations.push({
      type: 'REVERT',
      timestamp: Date.now()
    });
  }

  recordFitness(fitness) {
    this.fitness_contributions.push({
      fitness: fitness,
      value_at_measurement: this.value,
      timestamp: Date.now()
    });
  }

  getStats() {
    return {
      name: this.name,
      current: this.value,
      original: this.original_value,
      mutations: this.mutations.length,
      avg_fitness: this.fitness_contributions.length > 0
        ? this.fitness_contributions.reduce((a, b) => a + b.fitness, 0) / this.fitness_contributions.length
        : 0
    };
  }
}

/**
 * Genome - Collection of genes
 */
class Genome {
  constructor(ownerId) {
    this.id = `GENOME-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.owner_id = ownerId;
    this.genes = new Map();
    this.generation = 0;
    this.fitness = 0;
    this.lineage = [];
  }

  addGene(gene) {
    this.genes.set(gene.name, gene);
  }

  getGene(name) {
    return this.genes.get(name);
  }

  express() {
    // Return the phenotype (expressed values)
    const expression = {};
    this.genes.forEach((gene, name) => {
      expression[name] = gene.value;
    });
    return expression;
  }

  mutate(type, magnitude, geneNames = null) {
    const results = [];
    const targets = geneNames 
      ? geneNames.filter(n => this.genes.has(n))
      : Array.from(this.genes.keys());

    targets.forEach(name => {
      const gene = this.genes.get(name);
      if (gene) {
        results.push(gene.mutate(magnitude, type));
      }
    });

    this.generation++;
    return results;
  }

  crossover(otherGenome) {
    // Create offspring by combining genes
    const offspring = new Genome(`OFFSPRING-${Date.now()}`);
    offspring.generation = Math.max(this.generation, otherGenome.generation) + 1;
    offspring.lineage = [this.id, otherGenome.id];

    this.genes.forEach((gene, name) => {
      const otherGene = otherGenome.genes.get(name);
      
      // 50% chance to inherit from each parent
      const parentGene = Math.random() > 0.5 ? gene : otherGene;
      
      if (parentGene) {
        const newGene = new Gene(
          name,
          parentGene.type,
          parentGene.value,
          {
            min: parentGene.min,
            max: parentGene.max,
            discrete: parentGene.discrete,
            options: parentGene.options
          }
        );
        offspring.addGene(newGene);
      }
    });

    return offspring;
  }

  clone() {
    const clone = new Genome(this.owner_id + '-clone');
    clone.generation = this.generation;
    clone.lineage = [...this.lineage, this.id];

    this.genes.forEach((gene, name) => {
      const newGene = new Gene(
        name,
        gene.type,
        gene.value,
        {
          min: gene.min,
          max: gene.max,
          discrete: gene.discrete,
          options: gene.options
        }
      );
      clone.addGene(newGene);
    });

    return clone;
  }

  setFitness(fitness) {
    this.fitness = fitness;
    this.genes.forEach(gene => gene.recordFitness(fitness));
  }

  getProfile() {
    return {
      id: this.id,
      generation: this.generation,
      fitness: this.fitness,
      gene_count: this.genes.size,
      genes: Array.from(this.genes.values()).map(g => g.getStats())
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MUTATION ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MutationEngine - Manages evolution and adaptation
 */
class MutationEngine {
  constructor() {
    this.genomes = new Map();
    this.populations = new Map();
    this.strategy = EVOLUTION_STRATEGIES.DIRECTED;
    this.pressure = SELECTION_PRESSURES.PERFORMANCE;
    this.mutation_rate = 0.1;
    this.generation = 0;
    this.history = [];
  }

  createGenome(ownerId, initialGenes = []) {
    const genome = new Genome(ownerId);
    
    initialGenes.forEach(geneSpec => {
      const gene = new Gene(
        geneSpec.name,
        geneSpec.type,
        geneSpec.value,
        geneSpec.constraints
      );
      genome.addGene(gene);
    });

    this.genomes.set(ownerId, genome);
    return genome;
  }

  getGenome(ownerId) {
    return this.genomes.get(ownerId);
  }

  setStrategy(strategy) {
    this.strategy = strategy;
  }

  setPressure(pressure) {
    this.pressure = pressure;
  }

  evolve(ownerId, feedback) {
    const genome = this.genomes.get(ownerId);
    if (!genome) return null;

    // Evaluate fitness based on feedback
    const fitness = this.evaluateFitness(feedback);
    genome.setFitness(fitness);

    // Determine mutation magnitude based on fitness
    const magnitude = this.calculateMagnitude(fitness);

    // Apply mutations
    const type = this.selectMutationType(fitness);
    const results = genome.mutate(type, magnitude);

    this.history.push({
      owner: ownerId,
      generation: genome.generation,
      fitness: fitness,
      mutations: results,
      timestamp: Date.now()
    });

    return {
      fitness: fitness,
      mutations: results,
      new_phenotype: genome.express()
    };
  }

  evaluateFitness(feedback) {
    // Phi-weighted fitness calculation
    let fitness = 0;

    if (typeof feedback === 'number') {
      return Math.max(0, Math.min(1, feedback));
    }

    if (feedback.success !== undefined) {
      fitness += feedback.success ? 0.4 : 0;
    }
    if (feedback.efficiency !== undefined) {
      fitness += feedback.efficiency * 0.3;
    }
    if (feedback.novelty !== undefined) {
      fitness += feedback.novelty * 0.2 * (PHI - 1);
    }
    if (feedback.stability !== undefined) {
      fitness += feedback.stability * 0.1;
    }

    return Math.max(0, Math.min(1, fitness));
  }

  calculateMagnitude(fitness) {
    // Low fitness = larger mutations (explore)
    // High fitness = smaller mutations (exploit)
    const explorationNeed = 1 - fitness;
    const baseMagnitude = MUTATION_MAGNITUDES.MODERATE;
    return baseMagnitude * (0.5 + explorationNeed);
  }

  selectMutationType(fitness) {
    if (fitness < 0.3) return MUTATION_TYPES.STRUCTURAL;
    if (fitness < 0.5) return MUTATION_TYPES.BEHAVIORAL;
    if (fitness < 0.7) return MUTATION_TYPES.COGNITIVE;
    return MUTATION_TYPES.POINT;
  }

  // Population-level evolution
  createPopulation(name, size, templateGenes) {
    const population = [];
    
    for (let i = 0; i < size; i++) {
      const genome = this.createGenome(`${name}-${i}`, templateGenes);
      // Add initial variation
      genome.mutate(MUTATION_TYPES.POINT, MUTATION_MAGNITUDES.MODERATE);
      population.push(genome);
    }

    this.populations.set(name, population);
    return population;
  }

  selectFittest(populationName, topPercent = 0.2) {
    const population = this.populations.get(populationName);
    if (!population) return [];

    const sorted = [...population].sort((a, b) => b.fitness - a.fitness);
    const selectCount = Math.ceil(population.length * topPercent);
    return sorted.slice(0, selectCount);
  }

  reproduce(populationName) {
    const population = this.populations.get(populationName);
    if (!population) return null;

    const fittest = this.selectFittest(populationName);
    const newPopulation = [];

    // Keep the fittest
    fittest.forEach(genome => {
      newPopulation.push(genome);
    });

    // Create offspring
    while (newPopulation.length < population.length) {
      const parent1 = fittest[Math.floor(Math.random() * fittest.length)];
      const parent2 = fittest[Math.floor(Math.random() * fittest.length)];
      
      const offspring = parent1.crossover(parent2);
      offspring.mutate(MUTATION_TYPES.POINT, this.mutation_rate);
      
      this.genomes.set(offspring.id, offspring);
      newPopulation.push(offspring);
    }

    this.populations.set(populationName, newPopulation);
    this.generation++;
    
    return {
      generation: this.generation,
      population_size: newPopulation.length,
      avg_fitness: newPopulation.reduce((s, g) => s + g.fitness, 0) / newPopulation.length
    };
  }

  getEvolutionStats() {
    return {
      total_genomes: this.genomes.size,
      populations: this.populations.size,
      generation: this.generation,
      strategy: this.strategy,
      pressure: this.pressure,
      recent_mutations: this.history.slice(-20)
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MUTATION ENGINE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * MutationEngineProtocol - Main protocol interface
 */
class MutationEngineProtocol {
  constructor() {
    this.engine = new MutationEngine();
    this.running = false;
  }

  initialize() {
    this.running = true;
    return { status: 'initialized', strategy: this.engine.strategy };
  }

  createGenome(ownerId, genes) {
    return this.engine.createGenome(ownerId, genes);
  }

  evolve(ownerId, feedback) {
    return this.engine.evolve(ownerId, feedback);
  }

  getGenome(ownerId) {
    return this.engine.getGenome(ownerId)?.getProfile();
  }

  getPhenotype(ownerId) {
    return this.engine.getGenome(ownerId)?.express();
  }

  setStrategy(strategy) {
    this.engine.setStrategy(strategy);
    return { strategy: this.engine.strategy };
  }

  setPressure(pressure) {
    this.engine.setPressure(pressure);
    return { pressure: this.engine.pressure };
  }

  createPopulation(name, size, genes) {
    return this.engine.createPopulation(name, size, genes);
  }

  reproducePopulation(name) {
    return this.engine.reproduce(name);
  }

  getStatus() {
    return {
      running: this.running,
      ...this.engine.getEvolutionStats()
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  MUTATION_TYPES,
  MUTATION_MAGNITUDES,
  SELECTION_PRESSURES,
  EVOLUTION_STRATEGIES,
  GENE_TYPES,
  Gene,
  Genome,
  MutationEngine,
  MutationEngineProtocol
};

export default MutationEngineProtocol;

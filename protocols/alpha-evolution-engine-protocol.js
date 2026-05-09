/**
 * PROTO-240: Alpha Evolution Engine Protocol
 * 
 * Drives continuous evolution and improvement of the organism.
 * Implements genetic algorithms, fitness evaluation, and adaptive mutation.
 *
 * @module alpha-evolution-engine-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

class AlphaEvolutionEngineProtocol {
  constructor() {
    this.id = 'PROTO-240';
    this.name = 'Alpha Evolution Engine Protocol';
    this.population = [];
    this.generation = 0;
    this.bestFitness = 0;
    this.eliteSize = 5;
    this.mutationRate = PHI_INV * 0.1;  // ~6.18%
    this.metrics = { generations: 0, mutations: 0, improvements: 0 };
  }

  // Initialize population with random individuals
  initPopulation(size, geneLength, geneFn = () => Math.random()) {
    this.population = [];
    for (let i = 0; i < size; i++) {
      const genes = [];
      for (let j = 0; j < geneLength; j++) {
        genes.push(geneFn());
      }
      this.population.push({ genes, fitness: 0, id: `ind-${i}` });
    }
    return this.population;
  }

  // Evaluate fitness of all individuals
  evaluate(fitnessFn) {
    for (const individual of this.population) {
      individual.fitness = fitnessFn(individual.genes);
    }
    this.population.sort((a, b) => b.fitness - a.fitness);

    if (this.population[0].fitness > this.bestFitness) {
      this.bestFitness = this.population[0].fitness;
      this.metrics.improvements++;
    }

    return this.population[0];
  }

  // Selection using phi-weighted tournament
  select() {
    const tournamentSize = Math.ceil(this.population.length * PHI_INV);
    const tournament = [];
    
    for (let i = 0; i < tournamentSize; i++) {
      const idx = Math.floor(Math.random() * this.population.length);
      tournament.push(this.population[idx]);
    }

    tournament.sort((a, b) => b.fitness - a.fitness);
    return tournament[0];
  }

  // Crossover two parents to produce offspring
  crossover(parent1, parent2) {
    const crossPoint = Math.floor(parent1.genes.length * PHI_INV);
    const childGenes = [
      ...parent1.genes.slice(0, crossPoint),
      ...parent2.genes.slice(crossPoint),
    ];
    return { genes: childGenes, fitness: 0, id: `ind-g${this.generation}` };
  }

  // Mutate an individual
  mutate(individual) {
    for (let i = 0; i < individual.genes.length; i++) {
      if (Math.random() < this.mutationRate) {
        // Phi-modulated mutation
        const delta = (Math.random() - 0.5) * PHI_INV;
        individual.genes[i] = Math.max(0, Math.min(1, individual.genes[i] + delta));
        this.metrics.mutations++;
      }
    }
    return individual;
  }

  // Evolve one generation
  evolve(fitnessFn) {
    this.evaluate(fitnessFn);

    const newPopulation = [];

    // Keep elite
    for (let i = 0; i < this.eliteSize && i < this.population.length; i++) {
      newPopulation.push({ ...this.population[i], id: `elite-${i}` });
    }

    // Generate offspring
    while (newPopulation.length < this.population.length) {
      const parent1 = this.select();
      const parent2 = this.select();
      let child = this.crossover(parent1, parent2);
      child = this.mutate(child);
      newPopulation.push(child);
    }

    this.population = newPopulation;
    this.generation++;
    this.metrics.generations++;

    return {
      generation: this.generation,
      bestFitness: this.population[0].fitness,
      avgFitness: this.population.reduce((sum, i) => sum + i.fitness, 0) / this.population.length,
    };
  }

  // Run evolution for multiple generations
  run(generations, fitnessFn) {
    const results = [];
    for (let i = 0; i < generations; i++) {
      results.push(this.evolve(fitnessFn));
    }
    return {
      finalGeneration: this.generation,
      bestIndividual: this.population[0],
      history: results,
    };
  }

  getBest() {
    return this.population[0];
  }

  getMetrics() { return this.metrics; }
}

export { AlphaEvolutionEngineProtocol };
export default AlphaEvolutionEngineProtocol;

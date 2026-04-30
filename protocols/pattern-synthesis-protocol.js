/**
 * PROTO-202: Pattern Synthesis Protocol (PSP)
 * 40 knowledge primitives across 8 domains. SYNTHESIZES knowledge,
 * doesn't look up — recognize→extract→merge→synthesize.
 * 
 * Domains: physics, math, chemistry, linguistics, social, philosophy, systems, neuroscience
 */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

const DOMAINS = ['physics', 'math', 'chemistry', 'linguistics', 'social', 'philosophy', 'systems', 'neuroscience'];

const KNOWLEDGE_PRIMITIVES = {
  physics: [
    { id: 'conservation', name: 'Conservation Laws', weight: PHI },
    { id: 'symmetry', name: 'Symmetry Principles', weight: PHI - 1 },
    { id: 'entropy', name: 'Entropy & Disorder', weight: 1.0 },
    { id: 'wave-particle', name: 'Wave-Particle Duality', weight: PHI / 2 },
    { id: 'field-theory', name: 'Field Theory', weight: 1.0 },
  ],
  math: [
    { id: 'recursion', name: 'Recursive Structures', weight: PHI },
    { id: 'topology', name: 'Topological Invariants', weight: PHI - 1 },
    { id: 'category', name: 'Category Theory', weight: 1.0 },
    { id: 'fractals', name: 'Fractal Geometry', weight: PHI },
    { id: 'phi-ratios', name: 'Golden Ratio Harmonics', weight: PHI * PHI },
  ],
  chemistry: [
    { id: 'bonding', name: 'Chemical Bonding', weight: 1.0 },
    { id: 'kinetics', name: 'Reaction Kinetics', weight: PHI - 1 },
    { id: 'equilibrium', name: 'Chemical Equilibrium', weight: 1.0 },
    { id: 'catalysis', name: 'Catalytic Processes', weight: PHI },
    { id: 'self-assembly', name: 'Molecular Self-Assembly', weight: PHI },
  ],
  linguistics: [
    { id: 'grammar', name: 'Universal Grammar', weight: 1.0 },
    { id: 'semantics', name: 'Semantic Fields', weight: PHI - 1 },
    { id: 'pragmatics', name: 'Pragmatic Inference', weight: 1.0 },
    { id: 'metaphor', name: 'Conceptual Metaphor', weight: PHI },
    { id: 'discourse', name: 'Discourse Structure', weight: 1.0 },
  ],
  social: [
    { id: 'network', name: 'Social Networks', weight: PHI },
    { id: 'game-theory', name: 'Game Theoretic Dynamics', weight: PHI - 1 },
    { id: 'emergence', name: 'Emergent Behavior', weight: PHI },
    { id: 'trust', name: 'Trust Dynamics', weight: 1.0 },
    { id: 'collective', name: 'Collective Intelligence', weight: PHI },
  ],
  philosophy: [
    { id: 'ontology', name: 'Ontological Categories', weight: 1.0 },
    { id: 'epistemology', name: 'Knowledge Theory', weight: PHI - 1 },
    { id: 'ethics', name: 'Ethical Frameworks', weight: 1.0 },
    { id: 'phenomenology', name: 'Phenomenological Analysis', weight: PHI },
    { id: 'logic', name: 'Modal Logic', weight: 1.0 },
  ],
  systems: [
    { id: 'feedback', name: 'Feedback Loops', weight: PHI },
    { id: 'homeostasis', name: 'Homeostatic Control', weight: PHI },
    { id: 'hierarchy', name: 'Hierarchical Organization', weight: 1.0 },
    { id: 'resilience', name: 'System Resilience', weight: PHI - 1 },
    { id: 'adaptation', name: 'Adaptive Dynamics', weight: PHI },
  ],
  neuroscience: [
    { id: 'hebbian', name: 'Hebbian Learning', weight: PHI },
    { id: 'plasticity', name: 'Neural Plasticity', weight: PHI - 1 },
    { id: 'binding', name: 'Feature Binding', weight: 1.0 },
    { id: 'oscillation', name: 'Neural Oscillations', weight: PHI },
    { id: 'prediction', name: 'Predictive Coding', weight: PHI },
  ],
};

class PatternSynthesisProtocol {
  constructor() {
    this.cache = new Map();
    this.cacheLimit = 100;
    this.synthesesPerformed = 0;
    this.lastSynthesis = null;
  }

  recognize(input) {
    const patterns = [];
    const text = typeof input === 'string' ? input.toLowerCase() : JSON.stringify(input).toLowerCase();
    
    for (const [domain, primitives] of Object.entries(KNOWLEDGE_PRIMITIVES)) {
      for (const prim of primitives) {
        const keywords = prim.name.toLowerCase().split(/\s+/);
        const matches = keywords.filter(kw => text.includes(kw.substring(0, 4))).length;
        if (matches > 0) {
          patterns.push({
            domain,
            primitive: prim,
            confidence: matches / keywords.length * prim.weight,
          });
        }
      }
    }
    
    return patterns.sort((a, b) => b.confidence - a.confidence);
  }

  extract(patterns) {
    const extracted = {};
    for (const p of patterns) {
      if (!extracted[p.domain]) extracted[p.domain] = [];
      extracted[p.domain].push({
        id: p.primitive.id,
        weight: p.primitive.weight * p.confidence,
      });
    }
    return extracted;
  }

  merge(extractions) {
    const merged = [];
    const domains = Object.keys(extractions);
    
    for (let i = 0; i < domains.length; i++) {
      for (let j = i + 1; j < domains.length; j++) {
        const d1 = extractions[domains[i]] || [];
        const d2 = extractions[domains[j]] || [];
        
        for (const p1 of d1) {
          for (const p2 of d2) {
            merged.push({
              bridge: `${domains[i]}:${p1.id} ↔ ${domains[j]}:${p2.id}`,
              strength: (p1.weight + p2.weight) / 2 * PHI,
              domains: [domains[i], domains[j]],
            });
          }
        }
      }
    }
    
    return merged.sort((a, b) => b.strength - a.strength).slice(0, 10);
  }

  synthesize(input) {
    const cacheKey = typeof input === 'string' ? input : JSON.stringify(input);
    if (this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey);
    }
    
    const patterns = this.recognize(input);
    const extracted = this.extract(patterns);
    const merged = this.merge(extracted);
    
    const synthesis = {
      input: cacheKey.substring(0, 100),
      patterns: patterns.slice(0, 5),
      extractions: extracted,
      bridges: merged,
      dominantDomain: patterns[0]?.domain || null,
      totalWeight: patterns.reduce((sum, p) => sum + p.confidence, 0),
      phiHarmony: patterns.length > 0 ? patterns[0].confidence / PHI : 0,
      timestamp: Date.now(),
    };
    
    if (this.cache.size >= this.cacheLimit) {
      const oldest = this.cache.keys().next().value;
      this.cache.delete(oldest);
    }
    this.cache.set(cacheKey, synthesis);
    
    this.synthesesPerformed++;
    this.lastSynthesis = synthesis;
    
    return synthesis;
  }

  getMetrics() {
    return {
      totalPrimitives: 40,
      domains: DOMAINS.length,
      synthesesPerformed: this.synthesesPerformed,
      cacheSize: this.cache.size,
      cacheLimit: this.cacheLimit,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

export { PatternSynthesisProtocol, KNOWLEDGE_PRIMITIVES, DOMAINS };
export default PatternSynthesisProtocol;

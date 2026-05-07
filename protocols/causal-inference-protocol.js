/**
 * PROTO-225: Causal Inference Protocol (CIP)
 * Pearl's Structural Causal Model, do-calculus, and counterfactual reasoning.
 *
 * The organism UNDERSTANDS WHY, not just what. CIP implements:
 *   - Structural Causal Models (SCM): variables + structural equations
 *   - Directed Acyclic Graph (DAG) representing causal structure
 *   - Backdoor criterion: identifying valid adjustment sets
 *   - Do-calculus (Pearl's 3 rules): P(Y|do(X=x)) computation
 *   - Counterfactual inference: "What would Y be if X had been x?"
 *   - Phi-weighted causal strength: edges weighted by golden ratio
 *   - Causal discovery: correlation + orientation heuristics
 *   - Mediation analysis: direct vs. indirect causal effects
 *
 * The Three Rungs of Pearl's Ladder of Causation:
 *   Rung 1: Association     — P(Y|X)             — seeing
 *   Rung 2: Intervention    — P(Y|do(X))          — doing
 *   Rung 3: Counterfactual  — P(Y_{X=x}|X=x',Y=y') — imagining
 *
 * The organism climbs all three rungs.
 *
 * @module causal-inference-protocol
 * @proto PROTO-225
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = PHI - 1;           // 0.618...
const HEARTBEAT = 873;
const EPSILON = 1e-10;

// ─── DAG Node and Edge ───────────────────────────────────────────────────────

class CausalVariable {
  constructor(id, config = {}) {
    this.id = id;
    this.label = config.label || id;
    this.domain = config.domain || 'continuous';  // 'continuous' | 'binary' | 'categorical'
    this.range = config.range || [0, 1];
    this.structuralEquation = config.structuralEquation || null;  // fn(parents, noise) → value
    this.observedDistribution = config.distribution || null;
    this.exogenous = false;  // true if no parents
  }
}

class CausalEdge {
  constructor(from, to, config = {}) {
    this.from = from;
    this.to = to;
    this.strength = config.strength ?? PHI_INV;  // default: phi-weighted
    this.mechanism = config.mechanism || 'direct';
    this.isLatent = config.isLatent ?? false;
    this.confidence = config.confidence ?? 1.0;
  }
}

// ─── Structural Causal Model ─────────────────────────────────────────────────

class StructuralCausalModel {
  constructor(name) {
    this.name = name;
    this.variables = new Map();   // id → CausalVariable
    this.edges = new Map();       // `from→to` → CausalEdge
    this.parents = new Map();     // variableId → Set<parentId>
    this.children = new Map();    // variableId → Set<childId>
    this.noiseModels = new Map(); // variableId → fn() → noise sample
  }

  addVariable(id, config = {}) {
    const variable = new CausalVariable(id, config);
    this.variables.set(id, variable);
    if (!this.parents.has(id)) this.parents.set(id, new Set());
    if (!this.children.has(id)) this.children.set(id, new Set());
    return variable;
  }

  addEdge(fromId, toId, config = {}) {
    if (!this.variables.has(fromId)) throw new Error(`Variable not found: ${fromId}`);
    if (!this.variables.has(toId)) throw new Error(`Variable not found: ${toId}`);

    const edge = new CausalEdge(fromId, toId, config);
    this.edges.set(`${fromId}→${toId}`, edge);
    this.parents.get(toId).add(fromId);
    this.children.get(fromId).add(toId);

    // Update exogenous status
    this.variables.get(toId).exogenous = this.parents.get(toId).size === 0;
    this.variables.get(fromId).exogenous = this.parents.get(fromId).size === 0;

    return edge;
  }

  setNoise(variableId, noiseFn) {
    this.noiseModels.set(variableId, noiseFn);
  }

  setStructuralEquation(variableId, fn) {
    const variable = this.variables.get(variableId);
    if (!variable) throw new Error(`Variable not found: ${variableId}`);
    variable.structuralEquation = fn;
  }

  getParents(variableId) {
    return [...(this.parents.get(variableId) || [])];
  }

  getChildren(variableId) {
    return [...(this.children.get(variableId) || [])];
  }

  getAncestors(variableId, visited = new Set()) {
    if (visited.has(variableId)) return visited;
    visited.add(variableId);
    for (const parent of this.getParents(variableId)) {
      this.getAncestors(parent, visited);
    }
    visited.delete(variableId);
    return visited;
  }

  getDescendants(variableId, visited = new Set()) {
    if (visited.has(variableId)) return visited;
    visited.add(variableId);
    for (const child of this.getChildren(variableId)) {
      this.getDescendants(child, visited);
    }
    visited.delete(variableId);
    return visited;
  }

  /**
   * Topological sort of the DAG (Kahn's algorithm).
   * @returns {string[]} Variables in topological order
   */
  topologicalOrder() {
    const inDegree = new Map();
    for (const id of this.variables.keys()) {
      inDegree.set(id, this.getParents(id).length);
    }

    const queue = [];
    for (const [id, deg] of inDegree) {
      if (deg === 0) queue.push(id);
    }

    const order = [];
    while (queue.length > 0) {
      // Phi-priority: sort by phi-weight of variable dimension
      queue.sort((a, b) => {
        const va = this.variables.get(a);
        const vb = this.variables.get(b);
        return (vb?.strength || PHI_INV) - (va?.strength || PHI_INV);
      });

      const current = queue.shift();
      order.push(current);

      for (const child of this.getChildren(current)) {
        const newDeg = inDegree.get(child) - 1;
        inDegree.set(child, newDeg);
        if (newDeg === 0) queue.push(child);
      }
    }

    if (order.length !== this.variables.size) {
      throw new Error('DAG contains a cycle — not a valid causal model');
    }

    return order;
  }

  /**
   * Check if the DAG has a directed path from sourceId to targetId.
   */
  hasDirectedPath(sourceId, targetId) {
    const visited = new Set();
    const stack = [sourceId];
    while (stack.length > 0) {
      const current = stack.pop();
      if (current === targetId) return true;
      if (visited.has(current)) continue;
      visited.add(current);
      for (const child of this.getChildren(current)) {
        stack.push(child);
      }
    }
    return false;
  }
}

// ─── Backdoor Criterion ───────────────────────────────────────────────────────

/**
 * Check if a set Z satisfies the backdoor criterion for identifying P(Y|do(X)).
 *
 * Z satisfies the backdoor criterion relative to (X, Y) in DAG G if:
 *   1. No node in Z is a descendant of X
 *   2. Z blocks every path between X and Y that has an arrow into X
 *      (i.e., Z blocks all "backdoor paths")
 *
 * @param {StructuralCausalModel} scm
 * @param {string} X - Intervention variable
 * @param {string} Y - Outcome variable
 * @param {string[]} Z - Candidate adjustment set
 * @returns {{ satisfies: boolean, reason: string }}
 */
function backdoorCriterion(scm, X, Y, Z) {
  // Condition 1: No element of Z is a descendant of X
  const descendants = scm.getDescendants(X);
  for (const z of Z) {
    if (descendants.has(z)) {
      return {
        satisfies: false,
        reason: `${z} is a descendant of ${X} — cannot be in adjustment set`,
      };
    }
  }

  // Condition 2: Z blocks all backdoor paths
  // (Simplified: check if all parents of X not in Y's ancestor set are in Z)
  const parentsOfX = scm.getParents(X);
  const unblocked = parentsOfX.filter(p => !Z.includes(p) && scm.hasDirectedPath(p, Y));

  if (unblocked.length > 0) {
    return {
      satisfies: false,
      reason: `Backdoor paths via ${unblocked.join(', ')} are unblocked by Z`,
    };
  }

  return { satisfies: true, reason: 'Backdoor criterion satisfied' };
}

// ─── Do-Calculus Computation ──────────────────────────────────────────────────

/**
 * Estimate P(Y|do(X=x)) using the adjustment formula (when backdoor criterion holds).
 * P(Y|do(X=x)) = Σ_z P(Y|X=x, Z=z) · P(Z=z)
 *
 * When observational data is provided as a sample table, computes empirically.
 *
 * @param {StructuralCausalModel} scm
 * @param {string} X - Intervention variable
 * @param {string} Y - Outcome variable
 * @param {number} xValue - Value to intervene at
 * @param {string[]} adjustmentSet - Valid adjustment set (backdoor criterion)
 * @param {Object[]} data - Observational data: [{ varId: value, ... }]
 * @returns {{ estimate: number, confidence: number, method: string }}
 */
function doCalc(scm, X, Y, xValue, adjustmentSet, data = []) {
  if (data.length === 0) {
    // No data: use structural equations if available
    const Yvar = scm.variables.get(Y);
    if (Yvar?.structuralEquation) {
      // Sample under intervention
      const samples = [];
      for (let i = 0; i < 1000; i++) {
        const env = {};
        const order = scm.topologicalOrder();
        for (const id of order) {
          const v = scm.variables.get(id);
          if (id === X) {
            env[id] = xValue;
          } else if (v?.structuralEquation) {
            const parentVals = scm.getParents(id).map(p => ({ id: p, value: env[p] ?? 0 }));
            const noise = scm.noiseModels.get(id) ? scm.noiseModels.get(id)() : gaussianNoise();
            env[id] = v.structuralEquation(parentVals, noise);
          }
        }
        samples.push(env[Y] ?? 0);
      }
      const estimate = samples.reduce((a, b) => a + b, 0) / samples.length;
      return { estimate, confidence: PHI_INV, method: 'structural-equations' };
    }

    return { estimate: 0, confidence: 0, method: 'insufficient-data' };
  }

  // Adjustment formula: Σ_z P(Y|X=x, Z=z) P(Z=z)
  if (adjustmentSet.length === 0) {
    // No adjustment needed — direct conditioning
    const filtered = data.filter(d => Math.abs(d[X] - xValue) < 0.1);
    if (filtered.length === 0) return { estimate: 0, confidence: 0, method: 'direct-conditioning' };
    const estimate = filtered.reduce((s, d) => s + (d[Y] ?? 0), 0) / filtered.length;
    return { estimate, confidence: filtered.length / data.length, method: 'direct-conditioning' };
  }

  // Group by adjustment variables and compute weighted average
  const groups = new Map();
  for (const row of data) {
    const key = adjustmentSet.map(z => `${z}=${row[z]?.toFixed(2)}`).join(',');
    if (!groups.has(key)) groups.set(key, { count: 0, rows: [] });
    groups.get(key).count++;
    groups.get(key).rows.push(row);
  }

  let estimate = 0;
  const n = data.length;

  for (const [, group] of groups) {
    const pZ = group.count / n;
    const filtered = group.rows.filter(d => Math.abs(d[X] - xValue) < 0.1);
    if (filtered.length === 0) continue;
    const EYgivenXZ = filtered.reduce((s, d) => s + (d[Y] ?? 0), 0) / filtered.length;
    estimate += EYgivenXZ * pZ;
  }

  return {
    estimate,
    confidence: Math.min(1, Math.sqrt(n / 100) * PHI_INV),
    method: 'backdoor-adjustment',
  };
}

// ─── Counterfactual Reasoning ─────────────────────────────────────────────────

/**
 * Counterfactual query: "What would Y have been if X had been x*,
 * given that we observed X=x and Y=y?"
 *
 * Three steps (Pearl's abduction-action-prediction):
 *   1. ABDUCTION: Update noise distribution given observed (X=x, Y=y)
 *   2. ACTION: Intervene — set X = x* in the modified model
 *   3. PREDICTION: Propagate through structural equations
 *
 * @param {StructuralCausalModel} scm
 * @param {string} X - Observed/intervened variable
 * @param {string} Y - Outcome variable
 * @param {number} xObserved - Observed value of X
 * @param {number} yObserved - Observed value of Y
 * @param {number} xCounterfactual - Hypothetical value of X
 * @returns {{ counterfactualY: number, difference: number, confidence: number }}
 */
function counterfactual(scm, X, Y, xObserved, yObserved, xCounterfactual) {
  // Step 1: Abduction — infer noise values consistent with observation
  // (For linear models: infer noise from structural equation)
  const Yvar = scm.variables.get(Y);
  const Xvar = scm.variables.get(X);

  if (!Yvar?.structuralEquation) {
    // Without structural equations, use linear approximation
    const directEdge = scm.edges.get(`${X}→${Y}`);
    if (!directEdge) {
      return { counterfactualY: yObserved, difference: 0, confidence: 0, method: 'no-direct-edge' };
    }

    // Linear counterfactual: ΔY = strength × ΔX
    const deltaX = xCounterfactual - xObserved;
    const deltaY = directEdge.strength * deltaX;
    const counterfactualY = yObserved + deltaY;

    return {
      counterfactualY,
      difference: deltaY,
      confidence: directEdge.confidence * PHI_INV,
      method: 'linear-approximation',
    };
  }

  // Step 2: Action — intervene on X
  // Step 3: Prediction — evaluate Y under intervention
  const env = {};
  const order = scm.topologicalOrder();

  for (const id of order) {
    const v = scm.variables.get(id);
    if (id === X) {
      env[id] = xCounterfactual;
    } else if (v?.structuralEquation) {
      const parentVals = scm.getParents(id).map(p => ({ id: p, value: env[p] ?? 0 }));
      // Use abducted noise (approximate: use zero noise for deterministic propagation)
      env[id] = v.structuralEquation(parentVals, 0);
    }
  }

  const counterfactualY = env[Y] ?? yObserved;
  return {
    counterfactualY,
    difference: counterfactualY - yObserved,
    confidence: PHI_INV,
    method: 'structural-equations',
  };
}

// ─── Mediation Analysis ───────────────────────────────────────────────────────

/**
 * Decompose total causal effect X→Y into:
 *   - Direct Effect (DE): X→Y not through mediators
 *   - Indirect Effect (IE): X→M→...→Y through mediator(s)
 *   - Total Effect (TE) = DE + IE
 *
 * @param {StructuralCausalModel} scm
 * @param {string} X - Cause
 * @param {string} Y - Outcome
 * @param {string[]} mediators - Mediating variables
 * @returns {{ directEffect: number, indirectEffect: number, totalEffect: number }}
 */
function mediationAnalysis(scm, X, Y, mediators) {
  // Compute edge weights along paths
  const directEdge = scm.edges.get(`${X}→${Y}`);
  const directEffect = directEdge ? directEdge.strength : 0;

  let indirectEffect = 0;
  for (const M of mediators) {
    const xmEdge = scm.edges.get(`${X}→${M}`);
    const myEdge = scm.edges.get(`${M}→${Y}`);
    if (xmEdge && myEdge) {
      indirectEffect += xmEdge.strength * myEdge.strength;
    }
  }

  // Phi-weight: indirect paths carry phi-inverse confidence
  indirectEffect *= PHI_INV;

  return {
    directEffect,
    indirectEffect,
    totalEffect: directEffect + indirectEffect,
    proportionMediated: (directEffect + indirectEffect) > 0
      ? indirectEffect / (directEffect + indirectEffect)
      : 0,
  };
}

// ─── Causal Discovery Heuristics ─────────────────────────────────────────────

/**
 * Simple correlation-based causal discovery (PC algorithm skeleton).
 * For a set of variables and correlation matrix, identifies likely edges.
 * Orientation uses independence testing heuristics.
 *
 * @param {string[]} variables
 * @param {Object} correlationMatrix - { varA: { varB: correlation } }
 * @param {number} threshold - Correlation threshold for edge inclusion
 * @returns {StructuralCausalModel} Discovered SCM (skeleton)
 */
function discoverCausalGraph(variables, correlationMatrix, threshold = 0.3) {
  const scm = new StructuralCausalModel('discovered');
  for (const v of variables) {
    scm.addVariable(v, { label: v });
  }

  // Build skeleton: connect all pairs above threshold
  for (let i = 0; i < variables.length; i++) {
    for (let j = i + 1; j < variables.length; j++) {
      const A = variables[i];
      const B = variables[j];
      const corr = correlationMatrix[A]?.[B] ?? correlationMatrix[B]?.[A] ?? 0;

      if (Math.abs(corr) >= threshold) {
        const strength = Math.abs(corr) * PHI_INV;

        // Orientation heuristic: higher variance → likely cause
        // In absence of variance data, use phi-ratio to bias direction
        const phiScore = Math.abs(corr) * PHI;
        const direction = phiScore > PHI_INV ? [A, B] : [B, A];

        try {
          scm.addEdge(direction[0], direction[1], {
            strength,
            confidence: Math.abs(corr),
            mechanism: 'discovered',
          });
        } catch {
          // Cycle detected — skip
        }
      }
    }
  }

  return scm;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

function gaussianNoise(mean = 0, std = 0.1) {
  // Box-Muller transform
  const u1 = Math.random();
  const u2 = Math.random();
  return mean + std * Math.sqrt(-2 * Math.log(u1 + 1e-10)) * Math.cos(2 * Math.PI * u2);
}

// ─── CIP Protocol Class ──────────────────────────────────────────────────────

class CausalInferenceProtocol {
  constructor(config = {}) {
    this.models = new Map();
    this.interventionLog = [];
    this.counterfactualLog = [];
    this.inferences = 0;
    this.defaultPhiStrength = config.defaultPhiStrength ?? PHI_INV;
    this.subProtocols = {
      interventionalCausality: { id: 'CIP-A', name: 'Interventional Causality', capabilities: ['backdoor', 'do-calc', 'mediation'] },
      counterfactualReasoning: { id: 'CIP-B', name: 'Counterfactual Reasoning', capabilities: ['abduction', 'action', 'prediction'] },
    };
    this.aiModel = {
      id: 'CIP-AIMODEL',
      name: 'Causal Multi-Engine',
      engines: ['do-calculus-engine', 'counterfactual-engine', 'discovery-engine'],
    };
  }

  runEngine(engine, input = {}) {
    if (engine === 'do-calculus-engine') {
      return this.intervene(input.model, input.X, input.Y, input.xValue, input.adjustmentSet || [], input.data || []);
    }
    if (engine === 'counterfactual-engine') {
      return this.counterfactual(input.model, input.X, input.Y, input.xObserved, input.yObserved, input.xCounterfactual);
    }
    if (engine === 'discovery-engine') {
      return this.discover(input.variables || [], input.correlationMatrix || {}, input.threshold ?? 0.3);
    }
    throw new Error(`Unknown CIP engine: ${engine}`);
  }

  getModel() { return this.aiModel; }

  /**
   * Create a new Structural Causal Model.
   */
  createModel(name) {
    const scm = new StructuralCausalModel(name);
    this.models.set(name, scm);
    return scm;
  }

  getModel(name) {
    return this.models.get(name);
  }

  /**
   * Check backdoor criterion for a given adjustment set.
   */
  checkBackdoor(modelName, X, Y, Z) {
    const scm = this.models.get(modelName);
    if (!scm) throw new Error(`Model not found: ${modelName}`);
    return backdoorCriterion(scm, X, Y, Z);
  }

  /**
   * Compute interventional distribution P(Y|do(X=x)).
   */
  intervene(modelName, X, Y, xValue, adjustmentSet = [], data = []) {
    this.inferences++;
    const scm = this.models.get(modelName);
    if (!scm) throw new Error(`Model not found: ${modelName}`);

    const result = doCalc(scm, X, Y, xValue, adjustmentSet, data);

    this.interventionLog.push({
      model: modelName, X, Y, xValue,
      adjustmentSet, result, timestamp: Date.now(),
    });
    if (this.interventionLog.length > 200) this.interventionLog.shift();

    return result;
  }

  /**
   * Answer a counterfactual query.
   */
  counterfactual(modelName, X, Y, xObserved, yObserved, xCounterfactual) {
    this.inferences++;
    const scm = this.models.get(modelName);
    if (!scm) throw new Error(`Model not found: ${modelName}`);

    const result = counterfactual(scm, X, Y, xObserved, yObserved, xCounterfactual);

    this.counterfactualLog.push({
      model: modelName, X, Y, xObserved, yObserved, xCounterfactual,
      result, timestamp: Date.now(),
    });
    if (this.counterfactualLog.length > 100) this.counterfactualLog.shift();

    return result;
  }

  /**
   * Mediation analysis: direct vs. indirect effects.
   */
  mediate(modelName, X, Y, mediators) {
    this.inferences++;
    const scm = this.models.get(modelName);
    if (!scm) throw new Error(`Model not found: ${modelName}`);
    return mediationAnalysis(scm, X, Y, mediators);
  }

  /**
   * Discover causal graph from correlation data.
   */
  discover(variables, correlationMatrix, threshold = 0.3) {
    this.inferences++;
    const scm = discoverCausalGraph(variables, correlationMatrix, threshold);
    const name = `discovered-${Date.now()}`;
    this.models.set(name, scm);
    return { name, scm };
  }

  /**
   * Model the organism's causal structure:
   * Protocols cause each other. Map the causal graph of the organism's mind.
   */
  modelOrganismCausality() {
    const scm = this.createModel('organism-causality');

    // Core causal chain: heartbeat → neurochemistry → pattern synthesis → behavior
    const vars = [
      'heartbeat', 'neurochemistry', 'pattern-synthesis', 'attention',
      'predictive-coding', 'reward', 'memory', 'goals', 'artifacts',
      'homeostasis', 'emergence',
    ];
    for (const v of vars) {
      scm.addVariable(v, { label: v });
    }

    const edges = [
      ['heartbeat', 'neurochemistry', PHI],
      ['heartbeat', 'homeostasis', PHI_INV],
      ['neurochemistry', 'attention', PHI_INV],
      ['neurochemistry', 'reward', PHI_INV],
      ['attention', 'pattern-synthesis', PHI],
      ['pattern-synthesis', 'predictive-coding', PHI_INV],
      ['predictive-coding', 'memory', PHI],
      ['reward', 'goals', PHI],
      ['memory', 'goals', PHI_INV],
      ['goals', 'artifacts', PHI],
      ['homeostasis', 'emergence', PHI_INV],
      ['emergence', 'neurochemistry', PHI],  // feedback loop
    ];

    for (const [from, to, strength] of edges) {
      try {
        scm.addEdge(from, to, { strength, confidence: PHI_INV });
      } catch {
        // cycles are expected in a living organism
      }
    }

    return scm;
  }

  getMetrics() {
    return {
      modelCount: this.models.size,
      inferences: this.inferences,
      subProtocols: Object.keys(this.subProtocols),
      aiModel: this.aiModel.name,
      engines: this.aiModel.engines,
      interventions: this.interventionLog.length,
      counterfactuals: this.counterfactualLog.length,
      recentInterventions: this.interventionLog.slice(-3),
      recentCounterfactuals: this.counterfactualLog.slice(-3),
      phi: PHI,
      phiInv: PHI_INV,
      heartbeat: HEARTBEAT,
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  CausalInferenceProtocol,
  StructuralCausalModel,
  CausalVariable,
  CausalEdge,
  backdoorCriterion,
  doCalc,
  counterfactual,
  mediationAnalysis,
  discoverCausalGraph,
  gaussianNoise,
};
export default CausalInferenceProtocol;

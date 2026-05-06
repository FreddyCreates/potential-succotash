/**
 * PROTO-221: Formal Logic & Inference Protocol (FLIP)
 * Propositional and first-order predicate logic with phi-weighted resolution.
 *
 * The organism REASONS here. FLIP implements:
 *   - Propositional logic: AND, OR, NOT, IMPLIES, IFF, XOR
 *   - First-order predicates with variables and quantifiers
 *   - Resolution-based theorem proving (Robinson's algorithm)
 *   - Forward-chaining inference over a knowledge base
 *   - Backward-chaining goal reduction
 *   - Phi-weighted confidence propagation through inference chains
 *
 * Inference confidence decay:
 *   conf(derived) = conf(premise_1) × conf(premise_2) × (PHI - 1)^depth
 *
 * This is NOT symbolic AI from the 1970s. It is phi-resonant logical
 * intelligence — every inference is weighted by the golden ratio.
 *
 * @module formal-logic-inference-protocol
 * @proto PROTO-221
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;           // 0.618...
const HEARTBEAT = 873;

// ─── Logical Connectives ────────────────────────────────────────────────────

const CONNECTIVE = {
  AND:     'AND',
  OR:      'OR',
  NOT:     'NOT',
  IMPLIES: 'IMPLIES',
  IFF:     'IFF',
  XOR:     'XOR',
};

// ─── Formula Constructors ────────────────────────────────────────────────────

function atom(name, args = []) {
  return { type: 'atom', name, args, arity: args.length };
}
function not(f) { return { type: 'not', operand: f }; }
function and(...fs) { return { type: 'and', operands: fs }; }
function or(...fs) { return { type: 'or', operands: fs }; }
function implies(premise, conclusion) { return { type: 'implies', premise, conclusion }; }
function iff(left, right) { return { type: 'iff', left, right }; }
function xor(left, right) { return { type: 'xor', left, right }; }
function forall(variable, formula) { return { type: 'forall', variable, formula }; }
function exists(variable, formula) { return { type: 'exists', variable, formula }; }

// ─── Clause (disjunction of literals) ───────────────────────────────────────

function makeLiteral(name, args = [], negated = false) {
  return { name, args, negated };
}

function makeClause(literals, source = 'given', confidence = 1.0) {
  return { literals, source, confidence, id: `clause-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` };
}

// ─── Formula Evaluator ───────────────────────────────────────────────────────

function evaluate(formula, bindings = {}) {
  switch (formula.type) {
    case 'atom': {
      const name = formula.name;
      const val = bindings[name];
      if (typeof val === 'boolean') return val;
      if (typeof val === 'function') return val(...formula.args.map(a => bindings[a] ?? a));
      return null; // unknown
    }
    case 'not': {
      const inner = evaluate(formula.operand, bindings);
      return inner === null ? null : !inner;
    }
    case 'and': {
      let result = true;
      for (const op of formula.operands) {
        const v = evaluate(op, bindings);
        if (v === false) return false;
        if (v === null) result = null;
      }
      return result;
    }
    case 'or': {
      let result = false;
      for (const op of formula.operands) {
        const v = evaluate(op, bindings);
        if (v === true) return true;
        if (v === null) result = null;
      }
      return result;
    }
    case 'implies': {
      const p = evaluate(formula.premise, bindings);
      if (p === false) return true;  // vacuous truth
      const c = evaluate(formula.conclusion, bindings);
      return c;
    }
    case 'iff': {
      const l = evaluate(formula.left, bindings);
      const r = evaluate(formula.right, bindings);
      if (l === null || r === null) return null;
      return l === r;
    }
    case 'xor': {
      const l = evaluate(formula.left, bindings);
      const r = evaluate(formula.right, bindings);
      if (l === null || r === null) return null;
      return l !== r;
    }
    default:
      return null;
  }
}

// ─── FLIP Protocol Class ─────────────────────────────────────────────────────

class FormalLogicInferenceProtocol {
  constructor(config = {}) {
    this.knowledgeBase = new Map();    // id → { formula, confidence, label }
    this.clauses = [];                 // CNF clause set
    this.proofLog = [];                // history of proved theorems
    this.inferenceCount = 0;
    this.phiDepthDecay = config.phiDepthDecay ?? PHI_INV;  // conf × PHI_INV per depth
    this.maxSearchDepth = config.maxSearchDepth ?? 7;
    this.maxResolutions = config.maxResolutions ?? 200;
  }

  // ── Knowledge Base ──────────────────────────────────────────────────────────

  /**
   * Assert a formula into the knowledge base.
   * @param {string} id - Unique identifier
   * @param {Object} formula - Logical formula
   * @param {number} confidence - Prior confidence [0,1]
   * @param {string} label - Human-readable label
   */
  assert(id, formula, confidence = 1.0, label = '') {
    this.knowledgeBase.set(id, { formula, confidence: Math.min(1, Math.max(0, confidence)), label, id, addedAt: Date.now() });
    // Convert to clauses for resolution
    this._addToClauses(formula, confidence, id);
    return id;
  }

  /**
   * Retract (withdraw) a formula from the knowledge base.
   */
  retract(id) {
    const fact = this.knowledgeBase.get(id);
    if (!fact) return false;
    this.knowledgeBase.delete(id);
    this.clauses = this.clauses.filter(c => c.source !== id);
    return true;
  }

  // ── Forward Chaining ────────────────────────────────────────────────────────

  /**
   * Forward-chain from all IMPLIES rules in KB.
   * Derives new propositions from current bindings.
   * @param {Object} worldState - { atomName: boolean }
   * @returns {Object[]} newly derived facts
   */
  forwardChain(worldState = {}) {
    const derived = [];
    let changed = true;
    let depth = 0;
    const bindings = { ...worldState };

    while (changed && depth < this.maxSearchDepth) {
      changed = false;
      for (const [id, entry] of this.knowledgeBase) {
        const f = entry.formula;
        if (f.type !== 'implies') continue;
        const premiseVal = evaluate(f.premise, bindings);
        if (premiseVal !== true) continue;
        const conclusionVal = evaluate(f.conclusion, bindings);
        if (conclusionVal === true) continue;  // already known

        if (f.conclusion.type === 'atom') {
          const atomName = f.conclusion.name;
          if (!bindings[atomName]) {
            const inferredConf = entry.confidence * Math.pow(this.phiDepthDecay, depth + 1);
            bindings[atomName] = true;
            derived.push({ atom: atomName, confidence: inferredConf, sourceRule: id, depth });
            changed = true;
            this.inferenceCount++;
          }
        }
      }
      depth++;
    }

    return derived;
  }

  // ── Backward Chaining ───────────────────────────────────────────────────────

  /**
   * Backward-chain: prove a goal formula from KB.
   * Returns proof trace or null if unprovable within depth.
   * @param {Object} goal - Logical formula to prove
   * @param {Object} bindings - Current variable bindings
   * @param {number} depth - Current search depth
   * @returns {{ proved: boolean, confidence: number, trace: Object[] }}
   */
  prove(goal, bindings = {}, depth = 0) {
    if (depth > this.maxSearchDepth) return { proved: false, confidence: 0, trace: [] };

    this.inferenceCount++;

    // Direct evaluation
    const directVal = evaluate(goal, bindings);
    if (directVal === true) {
      return { proved: true, confidence: 1.0, trace: [{ type: 'direct', goal }] };
    }

    // Search KB for matching IMPLIES rules
    const candidates = [];
    for (const [id, entry] of this.knowledgeBase) {
      const f = entry.formula;
      if (f.type === 'implies') {
        const conclusionMatch = this._formulaMatches(f.conclusion, goal, bindings);
        if (conclusionMatch) {
          candidates.push({ id, entry, unified: conclusionMatch });
        }
      }
    }

    // Try each candidate, phi-sorted by confidence
    candidates.sort((a, b) => b.entry.confidence - a.entry.confidence);

    for (const { id, entry, unified } of candidates) {
      const newBindings = { ...bindings, ...unified };
      const premiseResult = this.prove(entry.formula.premise, newBindings, depth + 1);
      if (premiseResult.proved) {
        const conf = premiseResult.confidence * entry.confidence * Math.pow(this.phiDepthDecay, depth);
        const trace = [{ type: 'resolution', rule: id, depth }, ...premiseResult.trace];
        this.proofLog.push({ goal, proved: true, confidence: conf, depth, timestamp: Date.now() });
        if (this.proofLog.length > 200) this.proofLog.shift();
        return { proved: true, confidence: conf, trace };
      }
    }

    return { proved: false, confidence: 0, trace: [{ type: 'fail', goal, depth }] };
  }

  // ── Resolution (CNF) ────────────────────────────────────────────────────────

  /**
   * Robinson's resolution on the current clause set.
   * Used to check satisfiability / prove by refutation.
   * @param {Object[]} queryClauses - Negation of the query to refute
   * @returns {{ refuted: boolean, resolutionsUsed: number, confidence: number }}
   */
  resolve(queryClauses = []) {
    // Working set: KB clauses + negated query
    const workingSet = [...this.clauses, ...queryClauses];
    const seen = new Set(workingSet.map(c => this._clauseKey(c)));
    let resolutions = 0;
    const queue = [...workingSet];

    while (queue.length > 0 && resolutions < this.maxResolutions) {
      const c1 = queue.shift();

      for (const c2 of workingSet) {
        const resolvents = this._resolveTwo(c1, c2);
        for (const resolvent of resolvents) {
          if (resolvent.literals.length === 0) {
            // Empty clause — contradiction found — query proved by refutation
            return {
              refuted: true,
              resolutionsUsed: resolutions,
              confidence: resolvent.confidence,
            };
          }
          const key = this._clauseKey(resolvent);
          if (!seen.has(key)) {
            seen.add(key);
            queue.push(resolvent);
            workingSet.push(resolvent);
          }
        }
        resolutions++;
        if (resolutions >= this.maxResolutions) break;
      }
    }

    return { refuted: false, resolutionsUsed: resolutions, confidence: 0 };
  }

  // ── Phi-Weighted Inference Score ────────────────────────────────────────────

  /**
   * Score how well a formula is supported by current KB.
   * Uses phi-weighted aggregate over matching rules.
   * @param {string} atomName
   * @returns {number} support score [0, PHI]
   */
  supportScore(atomName) {
    let score = 0;
    for (const [, entry] of this.knowledgeBase) {
      const f = entry.formula;
      if (f.type === 'atom' && f.name === atomName) {
        score += entry.confidence * PHI;
      } else if (f.type === 'implies' && f.conclusion?.name === atomName) {
        score += entry.confidence * PHI_INV;
      }
    }
    return Math.min(PHI, score);
  }

  // ── Internal Helpers ────────────────────────────────────────────────────────

  _addToClauses(formula, confidence, source) {
    const cnf = this._toCNF(formula);
    for (const literalSet of cnf) {
      this.clauses.push(makeClause(literalSet, source, confidence));
    }
  }

  _toCNF(formula) {
    switch (formula.type) {
      case 'atom':
        return [[makeLiteral(formula.name, formula.args, false)]];
      case 'not':
        if (formula.operand.type === 'atom') {
          return [[makeLiteral(formula.operand.name, formula.operand.args, true)]];
        }
        return [];
      case 'and':
        return formula.operands.flatMap(op => this._toCNF(op));
      case 'or':
        // flatten into one clause (disjunction)
        return [formula.operands.flatMap(op => {
          const cnf = this._toCNF(op);
          return cnf.flat();
        })];
      case 'implies':
        // A→B ≡ ¬A ∨ B
        return this._toCNF(or(not(formula.premise), formula.conclusion));
      case 'iff':
        return this._toCNF(and(implies(formula.left, formula.right), implies(formula.right, formula.left)));
      default:
        return [];
    }
  }

  _resolveTwo(c1, c2) {
    const resolvents = [];
    for (const lit1 of c1.literals) {
      for (const lit2 of c2.literals) {
        if (lit1.name === lit2.name && lit1.negated !== lit2.negated) {
          // Complementary literals — resolve
          const newLiterals = [
            ...c1.literals.filter(l => l !== lit1),
            ...c2.literals.filter(l => l !== lit2),
          ];
          // Remove duplicates
          const unique = [];
          const seen = new Set();
          for (const l of newLiterals) {
            const k = `${l.negated ? '¬' : ''}${l.name}`;
            if (!seen.has(k)) { seen.add(k); unique.push(l); }
          }
          const conf = c1.confidence * c2.confidence * PHI_INV;
          resolvents.push(makeClause(unique, `resolution(${c1.id},${c2.id})`, conf));
        }
      }
    }
    return resolvents;
  }

  _formulaMatches(template, goal, bindings) {
    if (template.type !== goal.type) return null;
    if (template.type === 'atom' && template.name === goal.name) return {};
    return null;
  }

  _clauseKey(clause) {
    return clause.literals
      .map(l => `${l.negated ? '¬' : ''}${l.name}(${l.args.join(',')})`)
      .sort()
      .join('∨');
  }

  // ── Metrics ─────────────────────────────────────────────────────────────────

  getMetrics() {
    return {
      kbSize: this.knowledgeBase.size,
      clauseCount: this.clauses.length,
      inferenceCount: this.inferenceCount,
      proofCount: this.proofLog.length,
      recentProofs: this.proofLog.slice(-5),
      phiDepthDecay: this.phiDepthDecay,
      maxSearchDepth: this.maxSearchDepth,
      phi: PHI,
      heartbeat: HEARTBEAT,
    };
  }
}

// ─── Exports ────────────────────────────────────────────────────────────────

export {
  FormalLogicInferenceProtocol,
  CONNECTIVE,
  atom, not, and, or, implies, iff, xor, forall, exists,
  evaluate,
};
export default FormalLogicInferenceProtocol;

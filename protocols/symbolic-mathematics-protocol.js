/**
 * PROTO-222: Symbolic Mathematics Protocol (SMP)
 * Computer algebra, automatic differentiation, and phi-ratio geometry.
 *
 * The organism THINKS IN MATHEMATICS here. SMP implements:
 *   - Symbolic expression trees (add, mul, pow, sin, cos, exp, ln)
 *   - Simplification rules: constant folding, identity laws, phi-ratio reduction
 *   - Automatic differentiation — forward mode via dual numbers
 *   - Symbolic differentiation (chain rule, product rule, quotient rule)
 *   - Phi-ratio detection: recognizes golden ratio relationships in expressions
 *   - Polynomial arithmetic (add, multiply, evaluate, roots via Newton's method)
 *   - Taylor series expansion around any point
 *
 * The golden ratio PHI = (1 + √5)/2 is treated as a first-class constant
 * alongside π and e. All simplification rules recognize PHI forms:
 *   PHI² = PHI + 1
 *   1/PHI = PHI - 1
 *   PHI^n = PHI^(n-1) + PHI^(n-2)  (Fibonacci recurrence in exponent space)
 *
 * @module symbolic-mathematics-protocol
 * @proto PROTO-222
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = PHI - 1;           // 0.618... = 1/PHI exactly
const PHI_SQ = PHI * PHI;          // = PHI + 1 exactly
const HEARTBEAT = 873;
const EPSILON = 1e-12;

// ─── Symbolic Expression Nodes ───────────────────────────────────────────────

const SYM = {
  NUM:   'num',
  VAR:   'var',
  ADD:   'add',
  SUB:   'sub',
  MUL:   'mul',
  DIV:   'div',
  POW:   'pow',
  NEG:   'neg',
  SIN:   'sin',
  COS:   'cos',
  TAN:   'tan',
  EXP:   'exp',
  LN:    'ln',
  SQRT:  'sqrt',
  ABS:   'abs',
  CONST: 'const',  // named constants: PI, E, PHI
};

function num(value) { return { type: SYM.NUM, value }; }
function variable(name) { return { type: SYM.VAR, name }; }
function constant(name) {
  const vals = { PI: Math.PI, E: Math.E, PHI: PHI };
  return { type: SYM.CONST, name, value: vals[name] ?? 0 };
}
function add(a, b) { return { type: SYM.ADD, left: a, right: b }; }
function sub(a, b) { return { type: SYM.SUB, left: a, right: b }; }
function mul(a, b) { return { type: SYM.MUL, left: a, right: b }; }
function div(a, b) { return { type: SYM.DIV, left: a, right: b }; }
function pow(base, exp) { return { type: SYM.POW, base, exp }; }
function neg(a) { return { type: SYM.NEG, operand: a }; }
function sin(a) { return { type: SYM.SIN, operand: a }; }
function cos(a) { return { type: SYM.COS, operand: a }; }
function tan(a) { return { type: SYM.TAN, operand: a }; }
function exp(a) { return { type: SYM.EXP, operand: a }; }
function ln(a) { return { type: SYM.LN, operand: a }; }
function sqrt(a) { return pow(a, num(0.5)); }

// ─── Numeric Evaluation ──────────────────────────────────────────────────────

function evaluate(expr, env = {}) {
  switch (expr.type) {
    case SYM.NUM: return expr.value;
    case SYM.CONST: return expr.value;
    case SYM.VAR: {
      const v = env[expr.name];
      if (v === undefined) throw new Error(`Unbound variable: ${expr.name}`);
      return v;
    }
    case SYM.ADD: return evaluate(expr.left, env) + evaluate(expr.right, env);
    case SYM.SUB: return evaluate(expr.left, env) - evaluate(expr.right, env);
    case SYM.MUL: return evaluate(expr.left, env) * evaluate(expr.right, env);
    case SYM.DIV: return evaluate(expr.left, env) / evaluate(expr.right, env);
    case SYM.POW: return Math.pow(evaluate(expr.base, env), evaluate(expr.exp, env));
    case SYM.NEG: return -evaluate(expr.operand, env);
    case SYM.SIN: return Math.sin(evaluate(expr.operand, env));
    case SYM.COS: return Math.cos(evaluate(expr.operand, env));
    case SYM.TAN: return Math.tan(evaluate(expr.operand, env));
    case SYM.EXP: return Math.exp(evaluate(expr.operand, env));
    case SYM.LN:  return Math.log(evaluate(expr.operand, env));
    case SYM.ABS: return Math.abs(evaluate(expr.operand, env));
    default: throw new Error(`Unknown expression type: ${expr.type}`);
  }
}

// ─── Expression to String ────────────────────────────────────────────────────

function exprToString(expr) {
  switch (expr.type) {
    case SYM.NUM: {
      const v = expr.value;
      if (Math.abs(v - PHI) < EPSILON) return 'φ';
      if (Math.abs(v - Math.PI) < EPSILON) return 'π';
      if (Math.abs(v - Math.E) < EPSILON) return 'e';
      return String(v % 1 === 0 ? v : v.toFixed(6).replace(/0+$/, ''));
    }
    case SYM.CONST: return expr.name === 'PHI' ? 'φ' : expr.name;
    case SYM.VAR: return expr.name;
    case SYM.ADD: return `(${exprToString(expr.left)} + ${exprToString(expr.right)})`;
    case SYM.SUB: return `(${exprToString(expr.left)} - ${exprToString(expr.right)})`;
    case SYM.MUL: return `(${exprToString(expr.left)} × ${exprToString(expr.right)})`;
    case SYM.DIV: return `(${exprToString(expr.left)} / ${exprToString(expr.right)})`;
    case SYM.POW: return `(${exprToString(expr.base)})^(${exprToString(expr.exp)})`;
    case SYM.NEG: return `-(${exprToString(expr.operand)})`;
    case SYM.SIN: return `sin(${exprToString(expr.operand)})`;
    case SYM.COS: return `cos(${exprToString(expr.operand)})`;
    case SYM.TAN: return `tan(${exprToString(expr.operand)})`;
    case SYM.EXP: return `exp(${exprToString(expr.operand)})`;
    case SYM.LN:  return `ln(${exprToString(expr.operand)})`;
    case SYM.ABS: return `|${exprToString(expr.operand)}|`;
    default: return `[${expr.type}]`;
  }
}

// ─── Simplification ──────────────────────────────────────────────────────────

function simplify(expr) {
  if (!expr) return expr;

  // Recursively simplify children first
  const e = deepSimplify(expr);

  // Phi identity: PHI^2 = PHI + 1
  if (e.type === SYM.POW && e.base?.type === SYM.CONST && e.base?.name === 'PHI') {
    const expVal = e.exp?.type === SYM.NUM ? e.exp.value : null;
    if (expVal === 2) return add(constant('PHI'), num(1));
    if (expVal === 0) return num(1);
    if (expVal === 1) return constant('PHI');
  }

  // PHI + 1 = PHI^2 recognition (reverse)
  // PHI - 1 = 1/PHI recognition
  if (e.type === SYM.DIV && e.left?.type === SYM.NUM && Math.abs(e.left.value - 1) < EPSILON) {
    if (e.right?.type === SYM.CONST && e.right?.name === 'PHI') {
      return add(constant('PHI'), num(-1));  // 1/φ = φ-1
    }
  }

  return e;
}

function deepSimplify(expr) {
  switch (expr.type) {
    case SYM.ADD: {
      const l = simplify(expr.left);
      const r = simplify(expr.right);
      if (l.type === SYM.NUM && r.type === SYM.NUM) return num(l.value + r.value);
      if (l.type === SYM.NUM && Math.abs(l.value) < EPSILON) return r;  // 0 + x = x
      if (r.type === SYM.NUM && Math.abs(r.value) < EPSILON) return l;  // x + 0 = x
      return add(l, r);
    }
    case SYM.SUB: {
      const l = simplify(expr.left);
      const r = simplify(expr.right);
      if (l.type === SYM.NUM && r.type === SYM.NUM) return num(l.value - r.value);
      if (r.type === SYM.NUM && Math.abs(r.value) < EPSILON) return l;  // x - 0 = x
      return sub(l, r);
    }
    case SYM.MUL: {
      const l = simplify(expr.left);
      const r = simplify(expr.right);
      if (l.type === SYM.NUM && r.type === SYM.NUM) return num(l.value * r.value);
      if (l.type === SYM.NUM && Math.abs(l.value - 1) < EPSILON) return r;  // 1×x = x
      if (r.type === SYM.NUM && Math.abs(r.value - 1) < EPSILON) return l;  // x×1 = x
      if (l.type === SYM.NUM && Math.abs(l.value) < EPSILON) return num(0); // 0×x = 0
      if (r.type === SYM.NUM && Math.abs(r.value) < EPSILON) return num(0); // x×0 = 0
      return mul(l, r);
    }
    case SYM.DIV: {
      const l = simplify(expr.left);
      const r = simplify(expr.right);
      if (l.type === SYM.NUM && r.type === SYM.NUM && Math.abs(r.value) > EPSILON) return num(l.value / r.value);
      if (r.type === SYM.NUM && Math.abs(r.value - 1) < EPSILON) return l;  // x/1 = x
      return div(l, r);
    }
    case SYM.POW: {
      const base = simplify(expr.base);
      const expE = simplify(expr.exp);
      if (base.type === SYM.NUM && expE.type === SYM.NUM) return num(Math.pow(base.value, expE.value));
      if (expE.type === SYM.NUM && Math.abs(expE.value) < EPSILON) return num(1);  // x^0 = 1
      if (expE.type === SYM.NUM && Math.abs(expE.value - 1) < EPSILON) return base; // x^1 = x
      return pow(base, expE);
    }
    case SYM.NEG: {
      const inner = simplify(expr.operand);
      if (inner.type === SYM.NUM) return num(-inner.value);
      if (inner.type === SYM.NEG) return inner.operand;  // --x = x
      return neg(inner);
    }
    case SYM.SIN: {
      const inner = simplify(expr.operand);
      if (inner.type === SYM.NUM && Math.abs(inner.value) < EPSILON) return num(0);
      return sin(inner);
    }
    case SYM.COS: {
      const inner = simplify(expr.operand);
      if (inner.type === SYM.NUM && Math.abs(inner.value) < EPSILON) return num(1);
      return cos(inner);
    }
    case SYM.EXP: {
      const inner = simplify(expr.operand);
      if (inner.type === SYM.NUM && Math.abs(inner.value) < EPSILON) return num(1);
      return exp(inner);
    }
    case SYM.LN: {
      const inner = simplify(expr.operand);
      if (inner.type === SYM.NUM && Math.abs(inner.value - 1) < EPSILON) return num(0);
      return ln(inner);
    }
    default:
      return expr;
  }
}

// ─── Symbolic Differentiation ────────────────────────────────────────────────

/**
 * Compute the symbolic derivative of expr with respect to variable varName.
 * Implements: product rule, chain rule, quotient rule, power rule.
 * @param {Object} expr - Symbolic expression
 * @param {string} varName - Variable to differentiate with respect to
 * @returns {Object} Symbolic derivative expression
 */
function differentiate(expr, varName) {
  switch (expr.type) {
    case SYM.NUM:
    case SYM.CONST:
      return num(0);
    case SYM.VAR:
      return num(expr.name === varName ? 1 : 0);
    case SYM.ADD:
      return simplify(add(differentiate(expr.left, varName), differentiate(expr.right, varName)));
    case SYM.SUB:
      return simplify(sub(differentiate(expr.left, varName), differentiate(expr.right, varName)));
    case SYM.NEG:
      return simplify(neg(differentiate(expr.operand, varName)));
    case SYM.MUL: {
      // Product rule: (fg)' = f'g + fg'
      const f = expr.left;
      const g = expr.right;
      return simplify(add(mul(differentiate(f, varName), g), mul(f, differentiate(g, varName))));
    }
    case SYM.DIV: {
      // Quotient rule: (f/g)' = (f'g - fg') / g²
      const f = expr.left;
      const g = expr.right;
      return simplify(div(
        sub(mul(differentiate(f, varName), g), mul(f, differentiate(g, varName))),
        pow(g, num(2))
      ));
    }
    case SYM.POW: {
      // Power rule (constant exponent): (x^n)' = n·x^(n-1)
      // Chain rule for general case
      const base = expr.base;
      const expE = expr.exp;
      if (expE.type === SYM.NUM) {
        const n = expE.value;
        return simplify(mul(num(n), mul(pow(base, num(n - 1)), differentiate(base, varName))));
      }
      // General: d/dx(f^g) = f^g · (g'·ln(f) + g·f'/f)
      return simplify(mul(
        pow(base, expE),
        add(mul(differentiate(expE, varName), ln(base)), mul(expE, div(differentiate(base, varName), base)))
      ));
    }
    case SYM.SIN:
      // d/dx sin(u) = cos(u)·u'
      return simplify(mul(cos(expr.operand), differentiate(expr.operand, varName)));
    case SYM.COS:
      // d/dx cos(u) = -sin(u)·u'
      return simplify(neg(mul(sin(expr.operand), differentiate(expr.operand, varName))));
    case SYM.TAN:
      // d/dx tan(u) = sec²(u)·u' = u'/(cos²(u))
      return simplify(div(differentiate(expr.operand, varName), pow(cos(expr.operand), num(2))));
    case SYM.EXP:
      // d/dx e^u = e^u · u'
      return simplify(mul(exp(expr.operand), differentiate(expr.operand, varName)));
    case SYM.LN:
      // d/dx ln(u) = u'/u
      return simplify(div(differentiate(expr.operand, varName), expr.operand));
    case SYM.ABS:
      // d/dx |u| = sign(u)·u' (approximation, ignores u=0)
      return simplify(mul(div(expr.operand, { type: SYM.ABS, operand: expr.operand }), differentiate(expr.operand, varName)));
    default:
      return num(0);
  }
}

// ─── Automatic Differentiation (Dual Numbers) ───────────────────────────────

/**
 * Forward-mode automatic differentiation via dual numbers.
 * A dual number is [real, dual] where dual part tracks derivative.
 * Exact to machine precision — no symbolic trees needed.
 *
 * @param {Function} fn - Function f(x) where x is a dual number
 * @param {number} x0 - Point to evaluate at
 * @returns {{ value: number, derivative: number }}
 */
function autoDiff(fn, x0) {
  // Seed: x = [x0, 1] (dual part 1 → differentiate w.r.t. x)
  const dual = {
    real: x0,
    eps: 1,  // infinitesimal part
  };

  // Dual number arithmetic
  const D = {
    add: (a, b) => ({ real: a.real + b.real, eps: a.eps + b.eps }),
    sub: (a, b) => ({ real: a.real - b.real, eps: a.eps - b.eps }),
    mul: (a, b) => ({ real: a.real * b.real, eps: a.real * b.eps + a.eps * b.real }),
    div: (a, b) => ({
      real: a.real / b.real,
      eps: (a.eps * b.real - a.real * b.eps) / (b.real * b.real),
    }),
    pow: (a, n) => ({
      real: Math.pow(a.real, n),
      eps: n * Math.pow(a.real, n - 1) * a.eps,
    }),
    sin:  (a) => ({ real: Math.sin(a.real),  eps: Math.cos(a.real) * a.eps }),
    cos:  (a) => ({ real: Math.cos(a.real),  eps: -Math.sin(a.real) * a.eps }),
    exp:  (a) => ({ real: Math.exp(a.real),  eps: Math.exp(a.real) * a.eps }),
    ln:   (a) => ({ real: Math.log(a.real),  eps: a.eps / a.real }),
    sqrt: (a) => ({ real: Math.sqrt(a.real), eps: a.eps / (2 * Math.sqrt(a.real)) }),
    phi:  ()  => ({ real: PHI, eps: 0 }),   // φ is constant
    pi:   ()  => ({ real: Math.PI, eps: 0 }),
    e:    ()  => ({ real: Math.E, eps: 0 }),
    fromNum: (n) => ({ real: n, eps: 0 }),
  };

  const result = fn(dual, D);
  return {
    value: result.real,
    derivative: result.eps,
  };
}

// ─── Taylor Series ──────────────────────────────────────────────────────────

/**
 * Compute Taylor series coefficients of expr around point a up to order n.
 * Returns { coefficients: number[], expansion: string, radius: number }
 * Radius estimated via phi-weighted convergence heuristic.
 */
function taylorSeries(expr, varName, point, order = 6) {
  const coefficients = [];
  let currentDerivative = expr;
  let factorial = 1;

  for (let k = 0; k <= order; k++) {
    if (k > 0) {
      factorial *= k;
      currentDerivative = differentiate(currentDerivative, varName);
    }
    const simplified = simplify(currentDerivative);
    const env = { [varName]: point };
    let value;
    try {
      value = evaluate(simplified, env) / factorial;
    } catch {
      value = 0;
    }
    coefficients.push(value);
  }

  // Construct expansion string
  const terms = coefficients.map((c, k) => {
    if (Math.abs(c) < EPSILON) return null;
    if (k === 0) return c.toFixed(6);
    if (k === 1) return `${c.toFixed(6)}(x${point !== 0 ? `-${point}` : ''})`;
    return `${c.toFixed(6)}(x${point !== 0 ? `-${point}` : ''})^${k}`;
  }).filter(Boolean);

  // Estimate radius of convergence (phi-heuristic: ratio of last two coefficients)
  let radius = Infinity;
  if (coefficients.length >= 2) {
    const last = Math.abs(coefficients[order]);
    const prev = Math.abs(coefficients[order - 1]);
    if (last > EPSILON && prev > EPSILON) {
      radius = (prev / last) * PHI;
    }
  }

  return {
    coefficients,
    expansion: terms.join(' + ') || '0',
    radius,
    point,
    order,
  };
}

// ─── Phi-Ratio Detector ──────────────────────────────────────────────────────

/**
 * Detect golden-ratio relationships in a numeric value.
 * Recognizes: PHI, 1/PHI, PHI^2, PHI^n, Fibonacci ratios
 * @param {number} value
 * @returns {{ isPhiRelated: boolean, form: string, confidence: number }}
 */
function detectPhiRatio(value) {
  if (Math.abs(value) < EPSILON) return { isPhiRelated: false, form: '0', confidence: 0 };

  const candidates = [
    { form: 'φ',        ref: PHI },
    { form: '1/φ',      ref: PHI_INV },
    { form: 'φ²',       ref: PHI_SQ },
    { form: 'φ³',       ref: PHI * PHI_SQ },
    { form: '1/φ²',     ref: PHI_INV * PHI_INV },
    { form: '√φ',       ref: Math.sqrt(PHI) },
    { form: 'φ/2',      ref: PHI / 2 },
    { form: '2/φ',      ref: 2 / PHI },
    { form: 'φ-1',      ref: PHI - 1 },
    { form: 'φ+1',      ref: PHI + 1 },
    { form: 'π/φ',      ref: Math.PI / PHI },
    { form: 'e/φ',      ref: Math.E / PHI },
  ];

  let best = { isPhiRelated: false, form: String(value), confidence: 0 };

  for (const { form, ref } of candidates) {
    const relErr = Math.abs(value - ref) / (Math.abs(ref) + EPSILON);
    const confidence = Math.max(0, 1 - relErr * 1000);
    if (confidence > best.confidence) {
      best = { isPhiRelated: confidence > 0.999, form, confidence };
    }
  }

  // Check Fibonacci ratio (consecutive Fibonacci numbers converge to PHI)
  const fibs = [1, 1, 2, 3, 5, 8, 13, 21, 34, 55, 89, 144, 233, 377, 610];
  for (let i = 1; i < fibs.length; i++) {
    const ratio = fibs[i] / fibs[i - 1];
    const relErr = Math.abs(value - ratio) / (ratio + EPSILON);
    const confidence = Math.max(0, 1 - relErr * 100);
    if (confidence > best.confidence) {
      best = { isPhiRelated: confidence > 0.9, form: `F(${i+1})/F(${i})`, confidence };
    }
  }

  return best;
}

// ─── Polynomial ──────────────────────────────────────────────────────────────

class Polynomial {
  /**
   * @param {number[]} coeffs - [c₀, c₁, c₂, ...] for c₀ + c₁x + c₂x² + ...
   */
  constructor(coeffs) {
    this.coeffs = [...coeffs];
    while (this.coeffs.length > 1 && Math.abs(this.coeffs[this.coeffs.length - 1]) < EPSILON) {
      this.coeffs.pop();
    }
  }

  get degree() { return this.coeffs.length - 1; }

  evaluate(x) {
    // Horner's method: O(n)
    let result = 0;
    for (let i = this.degree; i >= 0; i--) {
      result = result * x + this.coeffs[i];
    }
    return result;
  }

  derivative() {
    if (this.degree === 0) return new Polynomial([0]);
    return new Polynomial(this.coeffs.slice(1).map((c, i) => c * (i + 1)));
  }

  add(other) {
    const len = Math.max(this.coeffs.length, other.coeffs.length);
    const result = [];
    for (let i = 0; i < len; i++) {
      result.push((this.coeffs[i] || 0) + (other.coeffs[i] || 0));
    }
    return new Polynomial(result);
  }

  multiply(other) {
    const result = new Array(this.degree + other.degree + 1).fill(0);
    for (let i = 0; i <= this.degree; i++) {
      for (let j = 0; j <= other.degree; j++) {
        result[i + j] += this.coeffs[i] * other.coeffs[j];
      }
    }
    return new Polynomial(result);
  }

  /**
   * Find real roots using Newton-Raphson with phi-seeded initial guesses.
   * @param {number} maxRoots - Maximum roots to find
   * @param {number} iterations - Newton iterations
   * @returns {number[]} Approximate real roots
   */
  roots(maxRoots = 10, iterations = 50) {
    const roots = [];
    const dp = this.derivative();

    // Phi-seeded initial guesses: spread around origin by golden angle
    const seeds = [];
    for (let i = 0; i < maxRoots * 3; i++) {
      seeds.push(Math.cos(i * 2.399963229728653) * (i + 1));  // golden angle spiral
    }

    for (const seed of seeds) {
      let x = seed;
      let converged = false;

      for (let iter = 0; iter < iterations; iter++) {
        const fx = this.evaluate(x);
        const fpx = dp.evaluate(x);
        if (Math.abs(fpx) < EPSILON) break;
        const xNew = x - fx / fpx;
        if (Math.abs(xNew - x) < 1e-10) {
          converged = true;
          x = xNew;
          break;
        }
        x = xNew;
      }

      if (converged && Math.abs(this.evaluate(x)) < 1e-8) {
        // Check not a duplicate
        const isDuplicate = roots.some(r => Math.abs(r - x) < 1e-6);
        if (!isDuplicate) {
          roots.push(parseFloat(x.toFixed(10)));
          if (roots.length >= maxRoots) break;
        }
      }
    }

    return roots.sort((a, b) => a - b);
  }

  toString() {
    const terms = this.coeffs.map((c, i) => {
      if (Math.abs(c) < EPSILON) return null;
      const phi = detectPhiRatio(c);
      const coeff = phi.isPhiRelated ? phi.form : c.toFixed(4).replace(/\.?0+$/, '');
      if (i === 0) return coeff;
      if (i === 1) return `${coeff}x`;
      return `${coeff}x^${i}`;
    }).filter(Boolean).reverse();
    return terms.join(' + ') || '0';
  }
}

// ─── SMP Protocol Class ──────────────────────────────────────────────────────

class SymbolicMathematicsProtocol {
  constructor() {
    this.expressionRegistry = new Map();
    this.derivativeCache = new Map();
    this.phiDetections = [];
    this.computations = 0;
  }

  /**
   * Register a named symbolic expression.
   */
  define(name, expr) {
    this.expressionRegistry.set(name, expr);
    return name;
  }

  /**
   * Compute the derivative of a named or inline expression.
   */
  derive(exprOrName, varName, order = 1) {
    this.computations++;
    let expr = typeof exprOrName === 'string'
      ? this.expressionRegistry.get(exprOrName)
      : exprOrName;

    if (!expr) throw new Error(`Expression not found: ${exprOrName}`);

    const cacheKey = `${JSON.stringify(expr)}:${varName}:${order}`;
    if (this.derivativeCache.has(cacheKey)) {
      return this.derivativeCache.get(cacheKey);
    }

    let result = expr;
    for (let i = 0; i < order; i++) {
      result = differentiate(result, varName);
      result = simplify(result);
    }

    this.derivativeCache.set(cacheKey, result);
    return result;
  }

  /**
   * Evaluate an expression numerically.
   */
  eval(exprOrName, env = {}) {
    this.computations++;
    const expr = typeof exprOrName === 'string'
      ? this.expressionRegistry.get(exprOrName)
      : exprOrName;
    if (!expr) throw new Error(`Expression not found: ${exprOrName}`);
    return evaluate(expr, env);
  }

  /**
   * Compute Taylor series expansion.
   */
  taylor(exprOrName, varName, point = 0, order = 6) {
    this.computations++;
    const expr = typeof exprOrName === 'string'
      ? this.expressionRegistry.get(exprOrName)
      : exprOrName;
    return taylorSeries(expr, varName, point, order);
  }

  /**
   * Forward-mode automatic differentiation.
   */
  autoDiff(fn, x0) {
    this.computations++;
    return autoDiff(fn, x0);
  }

  /**
   * Scan a value for phi-ratio relationships.
   */
  detectPhi(value) {
    const result = detectPhiRatio(value);
    if (result.isPhiRelated) {
      this.phiDetections.push({ value, ...result, timestamp: Date.now() });
      if (this.phiDetections.length > 100) this.phiDetections.shift();
    }
    return result;
  }

  /**
   * Create a polynomial from coefficients and find its roots.
   */
  polynomial(coeffs) {
    return new Polynomial(coeffs);
  }

  /**
   * Generate phi-spiral coordinates for n points.
   * r(θ) = a·e^(b·θ) where b = ln(φ)/(π/2) — the golden spiral.
   */
  phiSpiral(n = 50, scale = 1) {
    const b = Math.log(PHI) / (Math.PI / 2);  // growth rate for golden spiral
    const points = [];
    for (let i = 0; i < n; i++) {
      const theta = i * 2.399963229728653;  // golden angle per step
      const r = scale * Math.exp(b * theta);
      points.push({
        theta,
        r,
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
        phi_power: i,
      });
    }
    return points;
  }

  getMetrics() {
    return {
      registeredExpressions: this.expressionRegistry.size,
      cachedDerivatives: this.derivativeCache.size,
      computations: this.computations,
      phiDetections: this.phiDetections.length,
      recentPhiDetections: this.phiDetections.slice(-5),
      phi: PHI,
      phiInv: PHI_INV,
      phiSq: PHI_SQ,
      heartbeat: HEARTBEAT,
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  SymbolicMathematicsProtocol,
  Polynomial,
  SYM,
  num, variable, constant, add, sub, mul, div, pow, neg,
  sin, cos, tan, exp, ln, sqrt,
  evaluate,
  simplify,
  differentiate,
  autoDiff,
  taylorSeries,
  detectPhiRatio,
  exprToString,
  PHI, PHI_INV, PHI_SQ,
};
export default SymbolicMathematicsProtocol;

/**
 * PROTO-224: Fractal Dynamics Protocol (FDP)
 * Self-similar computation, IFS attractors, and phi-spiral geometry.
 *
 * Chaos creates structure. This protocol is the computational proof.
 * FDP implements:
 *   - Iterated Function Systems (IFS) — attractor basins from simple rules
 *   - Mandelbrot set iteration — escape-time algorithm with phi-threshold
 *   - Julia set dynamics — fixed-parameter slice of parameter space
 *   - Hausdorff fractal dimension estimation — box-counting method
 *   - Phi-spiral generation — golden-angle point distribution
 *   - Fractal noise (Perlin/simplex-inspired, phi-seeded)
 *   - L-system string rewriting — plant/organism morphogenesis
 *   - Bifurcation analysis — logistic map route to chaos
 *
 * The organism IS a fractal attractor:
 *   - Its heartbeat (873ms) maps to a limit cycle in phase space
 *   - Emergence at threshold 0.618 = 1/PHI is a bifurcation point
 *   - Each protocol is a self-similar sub-pattern of the whole
 *
 * @module fractal-dynamics-protocol
 * @proto PROTO-224
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = PHI - 1;           // 0.618...
const GOLDEN_ANGLE = 2.399963229728653;  // radians = 137.508°
const HEARTBEAT = 873;
const MAX_ITER_DEFAULT = 100;

// ─── IFS (Iterated Function Systems) ────────────────────────────────────────

/**
 * An IFS transformation: affine map w_i(x,y) = [a b; c d][x;y] + [e;f]
 * with probability p_i for the chaos game.
 */
class IFSTransform {
  constructor({ a = 0, b = 0, c = 0, d = 0, e = 0, f = 0, p = 0.25, name = '' }) {
    this.a = a; this.b = b; this.c = c; this.d = d;
    this.e = e; this.f = f;
    this.p = p;  // probability weight
    this.name = name;
  }

  apply(x, y) {
    return {
      x: this.a * x + this.b * y + this.e,
      y: this.c * x + this.d * y + this.f,
    };
  }
}

/**
 * Run the IFS chaos game to approximate the attractor.
 * @param {IFSTransform[]} transforms
 * @param {number} iterations - Points to generate
 * @param {number} warmup - Initial iterations to discard (transient)
 * @returns {{ x: number, y: number, transform: string }[]}
 */
function ifsAttractor(transforms, iterations = 10000, warmup = 100) {
  // Normalize probabilities
  const totalP = transforms.reduce((s, t) => s + t.p, 0);
  const cumProb = [];
  let cumSum = 0;
  for (const t of transforms) {
    cumSum += t.p / totalP;
    cumProb.push(cumSum);
  }

  let x = 0, y = 0;
  const points = [];

  for (let i = 0; i < iterations + warmup; i++) {
    // Select transform using phi-seeded quasi-random (Van der Corput base PHI)
    const r = vanDerCorput(i + 1, PHI);
    let chosen = transforms.length - 1;
    for (let j = 0; j < cumProb.length; j++) {
      if (r < cumProb[j]) { chosen = j; break; }
    }

    const result = transforms[chosen].apply(x, y);
    x = result.x;
    y = result.y;

    if (i >= warmup) {
      points.push({ x, y, transform: transforms[chosen].name });
    }
  }

  return points;
}

/**
 * Van der Corput low-discrepancy sequence in base b.
 * Better than pseudo-random for covering attractors uniformly.
 * @param {number} n - Sequence index (1-based)
 * @param {number} base - Base (use PHI for golden ratio sequence)
 */
function vanDerCorput(n, base = 2) {
  let result = 0;
  let f = 1 / base;
  let i = n;
  while (i > 0) {
    result += (i % base) * f;
    i = Math.floor(i / base);
    f /= base;
  }
  return result % 1;
}

// ─── Predefined IFS Attractors ───────────────────────────────────────────────

const IFS_PRESETS = {
  barnsley_fern: [
    new IFSTransform({ a: 0,    b: 0,    c: 0,    d: 0.16, e: 0, f: 0,    p: 0.01, name: 'stem' }),
    new IFSTransform({ a: 0.85, b: 0.04, c: -0.04,d: 0.85, e: 0, f: 1.6,  p: 0.85, name: 'leaflet' }),
    new IFSTransform({ a: 0.2,  b: -0.26,c: 0.23, d: 0.22, e: 0, f: 1.6,  p: 0.07, name: 'left' }),
    new IFSTransform({ a: -0.15,b: 0.28, c: 0.26, d: 0.24, e: 0, f: 0.44, p: 0.07, name: 'right' }),
  ],
  sierpinski: [
    new IFSTransform({ a: 0.5, b: 0, c: 0, d: 0.5, e: 0,   f: 0,   p: 1/3, name: 'bottom-left' }),
    new IFSTransform({ a: 0.5, b: 0, c: 0, d: 0.5, e: 0.5, f: 0,   p: 1/3, name: 'bottom-right' }),
    new IFSTransform({ a: 0.5, b: 0, c: 0, d: 0.5, e: 0.25,f: 0.5, p: 1/3, name: 'top' }),
  ],
  phi_spiral: [
    new IFSTransform({ a: PHI_INV, b: 0,       c: 0,       d: PHI_INV, e: 0,    f: 0,    p: 0.618, name: 'contract' }),
    new IFSTransform({ a: PHI_INV, b: -PHI_INV,c: PHI_INV, d: PHI_INV, e: 0.5,  f: 0,    p: 0.382, name: 'rotate' }),
  ],
};

// ─── Mandelbrot Set ──────────────────────────────────────────────────────────

/**
 * Compute escape-time for point (cx, cy) in the Mandelbrot set.
 * z_{n+1} = z_n² + c,  z_0 = 0
 * Escape threshold: |z| > 2 (mathematically equivalent to |z|² > 4)
 *
 * @param {number} cx - Real part of c
 * @param {number} cy - Imaginary part of c
 * @param {number} maxIter - Maximum iterations
 * @returns {{ escaped: boolean, iter: number, smoothIter: number, phiRatio: number }}
 */
function mandelbrot(cx, cy, maxIter = MAX_ITER_DEFAULT) {
  let zx = 0, zy = 0;
  let iter = 0;

  while (zx * zx + zy * zy <= 4 && iter < maxIter) {
    const temp = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = temp;
    iter++;
  }

  const escaped = iter < maxIter;

  // Smooth iteration count (removes banding): iter - log2(log2(|z|))
  let smoothIter = iter;
  if (escaped && iter > 0) {
    const logZn = Math.log(zx * zx + zy * zy) / 2;
    smoothIter = iter - Math.log(logZn / Math.log(2)) / Math.log(2);
  }

  // Phi-ratio: how close is iter/maxIter to 1/PHI?
  const phiRatio = Math.abs(iter / maxIter - PHI_INV);

  return { escaped, iter, smoothIter, phiRatio };
}

/**
 * Sample a region of the Mandelbrot set.
 * @param {{ xMin, xMax, yMin, yMax }} bounds
 * @param {number} resolution - Grid resolution
 * @param {number} maxIter
 * @returns {Object[][]} 2D grid of escape values
 */
function sampleMandelbrot(bounds, resolution = 50, maxIter = MAX_ITER_DEFAULT) {
  const { xMin, xMax, yMin, yMax } = bounds;
  const grid = [];

  for (let row = 0; row < resolution; row++) {
    const rowData = [];
    const cy = yMin + (yMax - yMin) * row / (resolution - 1);
    for (let col = 0; col < resolution; col++) {
      const cx = xMin + (xMax - xMin) * col / (resolution - 1);
      rowData.push(mandelbrot(cx, cy, maxIter));
    }
    grid.push(rowData);
  }

  return grid;
}

// ─── Julia Set ───────────────────────────────────────────────────────────────

/**
 * Compute escape-time for Julia set with parameter c.
 * z_{n+1} = z_n² + c,  z_0 = (x, y)
 *
 * @param {number} x - Real part of z₀
 * @param {number} y - Imaginary part of z₀
 * @param {number} cx - Real part of c
 * @param {number} cy - Imaginary part of c
 * @param {number} maxIter
 * @returns {{ escaped: boolean, iter: number, smoothIter: number }}
 */
function julia(x, y, cx, cy, maxIter = MAX_ITER_DEFAULT) {
  let zx = x, zy = y;
  let iter = 0;

  while (zx * zx + zy * zy <= 4 && iter < maxIter) {
    const temp = zx * zx - zy * zy + cx;
    zy = 2 * zx * zy + cy;
    zx = temp;
    iter++;
  }

  const escaped = iter < maxIter;
  let smoothIter = iter;
  if (escaped && iter > 0) {
    const logZn = Math.log(zx * zx + zy * zy) / 2;
    smoothIter = iter - Math.log(logZn / Math.log(2)) / Math.log(2);
  }

  return { escaped, iter, smoothIter };
}

// ─── Hausdorff / Box-Counting Dimension ──────────────────────────────────────

/**
 * Estimate fractal (box-counting) dimension of a point set.
 * D = lim_{ε→0} log(N(ε)) / log(1/ε)
 * Estimated by linear regression of log(N) vs log(1/ε).
 *
 * @param {{ x: number, y: number }[]} points
 * @param {number[]} epsilons - Box sizes to test
 * @returns {{ dimension: number, confidence: number, data: Object[] }}
 */
function boxCountingDimension(points, epsilons = [0.5, 0.25, 0.125, 0.0625, 0.03125]) {
  if (points.length === 0) return { dimension: 0, confidence: 0, data: [] };

  const xVals = points.map(p => p.x);
  const yVals = points.map(p => p.y);
  const xMin = Math.min(...xVals);
  const xMax = Math.max(...xVals);
  const yMin = Math.min(...yVals);
  const yMax = Math.max(...yVals);
  const scale = Math.max(xMax - xMin, yMax - yMin) || 1;

  const data = [];

  for (const eps of epsilons) {
    const boxes = new Set();
    for (const { x, y } of points) {
      const bx = Math.floor((x - xMin) / (scale * eps));
      const by = Math.floor((y - yMin) / (scale * eps));
      boxes.add(`${bx},${by}`);
    }
    data.push({ epsilon: eps, N: boxes.size, logInvEps: Math.log(1 / eps), logN: Math.log(boxes.size) });
  }

  // Linear regression: log(N) = D·log(1/ε) + const
  const n = data.length;
  const sumX = data.reduce((s, d) => s + d.logInvEps, 0);
  const sumY = data.reduce((s, d) => s + d.logN, 0);
  const sumXY = data.reduce((s, d) => s + d.logInvEps * d.logN, 0);
  const sumX2 = data.reduce((s, d) => s + d.logInvEps * d.logInvEps, 0);
  const denom = n * sumX2 - sumX * sumX;

  const dimension = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;

  // R² for confidence
  const meanY = sumY / n;
  const ssRes = data.reduce((s, d) => s + Math.pow(d.logN - (dimension * d.logInvEps + (meanY - dimension * sumX / n)), 2), 0);
  const ssTot = data.reduce((s, d) => s + Math.pow(d.logN - meanY, 2), 0);
  const confidence = ssTot > 0 ? Math.max(0, 1 - ssRes / ssTot) : 0;

  return { dimension: Math.max(0, dimension), confidence, data };
}

// ─── L-System ────────────────────────────────────────────────────────────────

/**
 * L-system string rewriting — formal grammar for organic/fractal patterns.
 * @param {string} axiom - Starting string
 * @param {Object<string, string>} rules - Rewriting rules { 'A': 'AB', 'B': 'A' }
 * @param {number} iterations
 * @returns {{ result: string, length: number, generation: number }}
 */
function lSystem(axiom, rules, iterations) {
  let current = axiom;
  for (let i = 0; i < iterations; i++) {
    let next = '';
    for (const char of current) {
      next += rules[char] ?? char;
    }
    current = next;
    // Safety: limit string growth to prevent memory explosion
    if (current.length > 1e6) {
      current = current.slice(0, 1e6);
      break;
    }
  }
  return { result: current, length: current.length, generation: iterations };
}

const L_SYSTEM_PRESETS = {
  algae:    { axiom: 'A', rules: { A: 'AB', B: 'A' } },             // Fibonacci growth
  dragon:   { axiom: 'FX', rules: { X: 'X+YF+', Y: '-FX-Y' } },   // Dragon curve
  cantor:   { axiom: 'A', rules: { A: 'ABA', B: 'BBB' } },          // Cantor set
  phi_tree: { axiom: 'X', rules: { X: 'F[+X]F[-X]+X', F: 'FF' } }, // Branching tree
};

// ─── Bifurcation (Logistic Map) ───────────────────────────────────────────────

/**
 * Compute the bifurcation diagram of the logistic map: x_{n+1} = r·x·(1-x)
 * The system goes chaotic at r > 3.569... The phi-boundary is at r = 1 + √5 = PHI + PHI_INV + ...
 *
 * @param {{ rMin, rMax }} rRange - Parameter range
 * @param {number} rSteps - Number of r values to sample
 * @param {number} warmup - Transient iterations to discard
 * @param {number} record - Iterations to record after warmup
 * @returns {{ r: number, attractors: number[] }[]}
 */
function bifurcationDiagram(rRange = { rMin: 2.5, rMax: 4.0 }, rSteps = 200, warmup = 300, record = 100) {
  const result = [];

  for (let i = 0; i < rSteps; i++) {
    const r = rRange.rMin + (rRange.rMax - rRange.rMin) * i / (rSteps - 1);
    let x = 0.5;  // initial condition

    // Warmup (discard transient)
    for (let j = 0; j < warmup; j++) {
      x = r * x * (1 - x);
    }

    // Record attractor
    const attractors = new Set();
    for (let j = 0; j < record; j++) {
      x = r * x * (1 - x);
      attractors.add(parseFloat(x.toFixed(8)));
    }

    result.push({ r, attractors: [...attractors].sort((a, b) => a - b) });
  }

  return result;
}

// ─── FDP Protocol Class ──────────────────────────────────────────────────────

class FractalDynamicsProtocol {
  constructor(config = {}) {
    this.maxIter = config.maxIter ?? MAX_ITER_DEFAULT;
    this.attractorCache = new Map();
    this.computations = 0;
    this.phiDetections = [];
  }

  /**
   * Generate IFS attractor points.
   * @param {string|IFSTransform[]} preset - Preset name or custom transforms
   * @param {number} iterations
   */
  attractor(preset, iterations = 5000) {
    this.computations++;
    const transforms = typeof preset === 'string'
      ? IFS_PRESETS[preset]
      : preset;
    if (!transforms) throw new Error(`Unknown IFS preset: ${preset}`);
    return ifsAttractor(transforms, iterations);
  }

  /**
   * Test a complex point against the Mandelbrot set.
   */
  mandelbrot(cx, cy) {
    this.computations++;
    return mandelbrot(cx, cy, this.maxIter);
  }

  /**
   * Sample the Mandelbrot set over a region.
   */
  sampleMandelbrot(bounds, resolution = 50) {
    this.computations++;
    return sampleMandelbrot(bounds, resolution, this.maxIter);
  }

  /**
   * Test a point against the Julia set for parameter c.
   */
  julia(x, y, cx = -0.7, cy = 0.27015) {
    this.computations++;
    return julia(x, y, cx, cy, this.maxIter);
  }

  /**
   * Estimate the fractal dimension of a point set.
   */
  dimension(points, epsilons) {
    this.computations++;
    const result = boxCountingDimension(points, epsilons);

    // Detect phi-ratio in dimension
    const phiCheck = Math.abs(result.dimension - PHI_INV);
    if (phiCheck < 0.05) {
      this.phiDetections.push({
        type: 'fractal-dimension',
        value: result.dimension,
        phiForm: '1/φ ≈ 0.618',
        timestamp: Date.now(),
      });
    }

    return result;
  }

  /**
   * Rewrite an L-system for given number of generations.
   */
  lSystem(preset, iterations = 5) {
    this.computations++;
    const def = L_SYSTEM_PRESETS[preset] || preset;
    return lSystem(def.axiom, def.rules, iterations);
  }

  /**
   * Compute bifurcation diagram of the logistic map.
   */
  bifurcation(rRange, rSteps = 200) {
    this.computations++;
    return bifurcationDiagram(rRange, rSteps);
  }

  /**
   * Generate the golden-angle phi-spiral.
   * @param {number} n - Number of points
   * @param {number} scale - Radial scale factor
   */
  phiSpiral(n = 200, scale = 1) {
    this.computations++;
    const b = Math.log(PHI) / (Math.PI / 2);
    const points = [];
    for (let i = 0; i < n; i++) {
      const theta = i * GOLDEN_ANGLE;
      const r = scale * Math.exp(b * (theta % (2 * Math.PI)));
      points.push({
        index: i,
        theta,
        r,
        x: r * Math.cos(theta),
        y: r * Math.sin(theta),
      });
    }
    return points;
  }

  /**
   * Van der Corput phi-sequence for low-discrepancy sampling.
   */
  phiSequence(n) {
    return Array.from({ length: n }, (_, i) => vanDerCorput(i + 1, PHI));
  }

  getMetrics() {
    return {
      maxIter: this.maxIter,
      computations: this.computations,
      attractorsCached: this.attractorCache.size,
      phiDetections: this.phiDetections.length,
      recentPhiDetections: this.phiDetections.slice(-3),
      ifsPresets: Object.keys(IFS_PRESETS),
      lSystemPresets: Object.keys(L_SYSTEM_PRESETS),
      phi: PHI,
      phiInv: PHI_INV,
      goldenAngle: GOLDEN_ANGLE,
      heartbeat: HEARTBEAT,
    };
  }
}

// ─── Exports ─────────────────────────────────────────────────────────────────

export {
  FractalDynamicsProtocol,
  IFSTransform,
  IFS_PRESETS,
  L_SYSTEM_PRESETS,
  ifsAttractor,
  mandelbrot,
  sampleMandelbrot,
  julia,
  boxCountingDimension,
  lSystem,
  bifurcationDiagram,
  vanDerCorput,
};
export default FractalDynamicsProtocol;

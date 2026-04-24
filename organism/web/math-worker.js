/**
 * Math Intelligence Worker — Pure In-Browser Mathematics
 *
 * Permanent Web Worker #15 in the Brain Division.
 * Provides:
 * - Matrix algebra (multiply, transpose, determinant, inverse, etc.)
 * - Statistical analysis (mean, median, mode, variance, skewness, etc.)
 * - Phi / golden ratio operations (fibonacci, golden angle, convergents)
 * - Discrete Fourier Transform (DFT, inverse DFT, power spectrum)
 * - Probability distributions (normal, poisson, binomial, bayesian)
 * - Optimization (golden section search, gradient descent)
 * - Regression (linear, polynomial)
 * - Number theory (primes, factorization, gcd, totient)
 *
 * NO external APIs. NO network calls. Pure native math intelligence.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'matrix', op: '...', a: [[...]], ... }
 *   Main → Worker: { type: 'stats', op: '...', data: [...] }
 *   Main → Worker: { type: 'phi', op: '...', n: N }
 *   Main → Worker: { type: 'fourier', op: '...', signal: [...] }
 *   Main → Worker: { type: 'probability', op: '...', ... }
 *   Main → Worker: { type: 'optimize', op: '...', f: '...', ... }
 *   Main → Worker: { type: 'regression', op: '...', xs: [...], ys: [...] }
 *   Main → Worker: { type: 'numberTheory', op: '...', n: N }
 *   Worker → Main: { type: '<cap>-result', op: '...', result: ... }
 *   Worker → Main: { type: 'heartbeat', worker: 'math', ... }
 */

'use strict';
importScripts('neuro-core.js');

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;
var startTime = Date.now();

/* ════════════════════════════════════════════════════════════════
   Metrics
   ════════════════════════════════════════════════════════════════ */

var mathMetrics = {
  totalComputations: 0,
  matrixOps: 0,
  statsOps: 0,
  phiOps: 0,
  fourierOps: 0,
  probabilityOps: 0,
  optimizeOps: 0,
  regressionOps: 0,
  numberTheoryOps: 0,
  totalTokensProcessed: 0
};

/* ════════════════════════════════════════════════════════════════
   1. Matrix Algebra
   ════════════════════════════════════════════════════════════════ */

function matrixMultiply(A, B) {
  var rowsA = A.length, colsA = A[0].length, colsB = B[0].length;
  var C = [];
  for (var i = 0; i < rowsA; i++) {
    C[i] = [];
    for (var j = 0; j < colsB; j++) {
      var sum = 0;
      for (var k = 0; k < colsA; k++) {
        sum += A[i][k] * B[k][j];
      }
      C[i][j] = sum;
    }
  }
  return C;
}

function matrixTranspose(A) {
  var rows = A.length, cols = A[0].length;
  var T = [];
  for (var j = 0; j < cols; j++) {
    T[j] = [];
    for (var i = 0; i < rows; i++) {
      T[j][i] = A[i][j];
    }
  }
  return T;
}

function matrixDeterminant(A) {
  var n = A.length;
  if (n === 1) return A[0][0];
  if (n === 2) return A[0][0] * A[1][1] - A[0][1] * A[1][0];
  var det = 0;
  for (var j = 0; j < n; j++) {
    var minor = [];
    for (var i = 1; i < n; i++) {
      var row = [];
      for (var k = 0; k < n; k++) {
        if (k !== j) row.push(A[i][k]);
      }
      minor.push(row);
    }
    det += (j % 2 === 0 ? 1 : -1) * A[0][j] * matrixDeterminant(minor);
  }
  return det;
}

function matrixTrace(A) {
  var sum = 0;
  for (var i = 0; i < A.length; i++) {
    sum += A[i][i];
  }
  return sum;
}

function matrixIdentity(n) {
  var I = [];
  for (var i = 0; i < n; i++) {
    I[i] = [];
    for (var j = 0; j < n; j++) {
      I[i][j] = (i === j) ? 1 : 0;
    }
  }
  return I;
}

function matrixAdd(A, B) {
  var rows = A.length, cols = A[0].length;
  var C = [];
  for (var i = 0; i < rows; i++) {
    C[i] = [];
    for (var j = 0; j < cols; j++) {
      C[i][j] = A[i][j] + B[i][j];
    }
  }
  return C;
}

function matrixScalarMultiply(A, s) {
  var rows = A.length, cols = A[0].length;
  var C = [];
  for (var i = 0; i < rows; i++) {
    C[i] = [];
    for (var j = 0; j < cols; j++) {
      C[i][j] = A[i][j] * s;
    }
  }
  return C;
}

function matrixInverse(A) {
  var n = A.length;
  var det = matrixDeterminant(A);
  if (det === 0) return null;

  if (n === 2) {
    return [
      [A[1][1] / det, -A[0][1] / det],
      [-A[1][0] / det, A[0][0] / det]
    ];
  }

  if (n === 3) {
    var cofactors = [];
    for (var i = 0; i < 3; i++) {
      cofactors[i] = [];
      for (var j = 0; j < 3; j++) {
        var minor = [];
        for (var mi = 0; mi < 3; mi++) {
          if (mi === i) continue;
          var row = [];
          for (var mj = 0; mj < 3; mj++) {
            if (mj === j) continue;
            row.push(A[mi][mj]);
          }
          minor.push(row);
        }
        cofactors[i][j] = ((i + j) % 2 === 0 ? 1 : -1) * matrixDeterminant(minor);
      }
    }
    var adjugate = matrixTranspose(cofactors);
    return matrixScalarMultiply(adjugate, 1 / det);
  }

  return null;
}

function handleMatrix(msg) {
  mathMetrics.matrixOps++;
  var result;
  switch (msg.op) {
    case 'multiply':
      result = matrixMultiply(msg.a, msg.b);
      break;
    case 'transpose':
      result = matrixTranspose(msg.a);
      break;
    case 'determinant':
      result = matrixDeterminant(msg.a);
      break;
    case 'trace':
      result = matrixTrace(msg.a);
      break;
    case 'identity':
      result = matrixIdentity(msg.n);
      break;
    case 'add':
      result = matrixAdd(msg.a, msg.b);
      break;
    case 'scalarMultiply':
      result = matrixScalarMultiply(msg.a, msg.s);
      break;
    case 'inverse':
      result = matrixInverse(msg.a);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'matrix-result', op: msg.op, result: result, phi: PHI });
}

/* ════════════════════════════════════════════════════════════════
   2. Statistical Analysis
   ════════════════════════════════════════════════════════════════ */

function statsMean(data) {
  var sum = 0;
  for (var i = 0; i < data.length; i++) sum += data[i];
  return sum / data.length;
}

function statsMedian(sorted) {
  var n = sorted.length;
  if (n % 2 === 1) return sorted[Math.floor(n / 2)];
  return (sorted[Math.floor(n / 2) - 1] + sorted[Math.floor(n / 2)]) / 2;
}

function statsMode(data) {
  var freq = Object.create(null);
  var maxFreq = 0;
  var modes = [];
  for (var i = 0; i < data.length; i++) {
    var key = String(data[i]);
    freq[key] = (freq[key] || 0) + 1;
    if (freq[key] > maxFreq) maxFreq = freq[key];
  }
  for (var k in freq) {
    if (freq[k] === maxFreq) modes.push(Number(k));
  }
  return modes;
}

function statsVariance(data, mean) {
  var sum = 0;
  for (var i = 0; i < data.length; i++) {
    var d = data[i] - mean;
    sum += d * d;
  }
  return sum / data.length;
}

function statsStddev(variance) {
  return Math.sqrt(variance);
}

function statsSkewness(data, mean, stddev) {
  if (stddev === 0) return 0;
  var n = data.length;
  var sum = 0;
  for (var i = 0; i < n; i++) {
    var d = (data[i] - mean) / stddev;
    sum += d * d * d;
  }
  return sum / n;
}

function statsKurtosis(data, mean, stddev) {
  if (stddev === 0) return 0;
  var n = data.length;
  var sum = 0;
  for (var i = 0; i < n; i++) {
    var d = (data[i] - mean) / stddev;
    sum += d * d * d * d;
  }
  return (sum / n) - 3;
}

function statsPercentile(sorted, p) {
  var idx = (p / 100) * (sorted.length - 1);
  var lower = Math.floor(idx);
  var upper = Math.ceil(idx);
  if (lower === upper) return sorted[lower];
  var frac = idx - lower;
  return sorted[lower] * (1 - frac) + sorted[upper] * frac;
}

function statsIqr(sorted) {
  return statsPercentile(sorted, 75) - statsPercentile(sorted, 25);
}

function statsRange(sorted) {
  return sorted[sorted.length - 1] - sorted[0];
}

function statsSum(data) {
  var s = 0;
  for (var i = 0; i < data.length; i++) s += data[i];
  return s;
}

function statsMin(sorted) {
  return sorted[0];
}

function statsMax(sorted) {
  return sorted[sorted.length - 1];
}

function computeAllStats(data) {
  var sorted = data.slice().sort(function(a, b) { return a - b; });
  var mean = statsMean(data);
  var variance = statsVariance(data, mean);
  var stddev = statsStddev(variance);
  return {
    mean: mean,
    median: statsMedian(sorted),
    mode: statsMode(data),
    variance: variance,
    stddev: stddev,
    skewness: statsSkewness(data, mean, stddev),
    kurtosis: statsKurtosis(data, mean, stddev),
    iqr: statsIqr(sorted),
    range: statsRange(sorted),
    sum: statsSum(data),
    min: statsMin(sorted),
    max: statsMax(sorted),
    count: data.length
  };
}

function handleStats(msg) {
  mathMetrics.statsOps++;
  mathMetrics.totalTokensProcessed += (msg.data ? msg.data.length : 0);
  var data = msg.data || [];
  var sorted = data.slice().sort(function(a, b) { return a - b; });
  var result;

  switch (msg.op) {
    case 'all':
      result = computeAllStats(data);
      break;
    case 'mean':
      result = statsMean(data);
      break;
    case 'median':
      result = statsMedian(sorted);
      break;
    case 'mode':
      result = statsMode(data);
      break;
    case 'variance':
      result = statsVariance(data, statsMean(data));
      break;
    case 'stddev':
      result = statsStddev(statsVariance(data, statsMean(data)));
      break;
    case 'skewness': {
      var m = statsMean(data);
      result = statsSkewness(data, m, statsStddev(statsVariance(data, m)));
      break;
    }
    case 'kurtosis': {
      var mk = statsMean(data);
      result = statsKurtosis(data, mk, statsStddev(statsVariance(data, mk)));
      break;
    }
    case 'iqr':
      result = statsIqr(sorted);
      break;
    case 'percentile':
      result = statsPercentile(sorted, msg.p || 50);
      break;
    case 'range':
      result = statsRange(sorted);
      break;
    case 'sum':
      result = statsSum(data);
      break;
    case 'min':
      result = statsMin(sorted);
      break;
    case 'max':
      result = statsMax(sorted);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'stats-result', op: msg.op, result: result });
}

/* ════════════════════════════════════════════════════════════════
   3. Phi / Golden Ratio Operations
   ════════════════════════════════════════════════════════════════ */

var fibCache = [0, 1];

function fibonacci(n) {
  if (n < 0) return 0;
  if (n < fibCache.length) return fibCache[n];
  for (var i = fibCache.length; i <= n; i++) {
    fibCache[i] = fibCache[i - 1] + fibCache[i - 2];
  }
  return fibCache[n];
}

function fibonacciSequence(n) {
  var seq = [];
  for (var i = 0; i < n; i++) {
    seq.push(fibonacci(i));
  }
  return seq;
}

function goldenAngle(nPoints) {
  var angle = 2 * Math.PI / (PHI * PHI);
  var points = [];
  for (var i = 0; i < nPoints; i++) {
    var theta = i * angle;
    var r = Math.sqrt(i);
    points.push({
      index: i,
      angle: theta,
      x: r * Math.cos(theta),
      y: r * Math.sin(theta)
    });
  }
  return points;
}

function phiPowers(n) {
  var powers = [];
  var val = 1;
  for (var i = 0; i < n; i++) {
    powers.push(val);
    val *= PHI;
  }
  return powers;
}

function phiConvergents(n) {
  var convergents = [];
  for (var i = 1; i <= n; i++) {
    var fib1 = fibonacci(i + 1);
    var fib0 = fibonacci(i);
    convergents.push({
      n: i,
      numerator: fib1,
      denominator: fib0,
      ratio: fib0 !== 0 ? fib1 / fib0 : Infinity,
      error: fib0 !== 0 ? Math.abs(fib1 / fib0 - PHI) : Infinity
    });
  }
  return convergents;
}

function lucasNumbers(n) {
  var seq = [2, 1];
  for (var i = 2; i < n; i++) {
    seq[i] = seq[i - 1] + seq[i - 2];
  }
  return seq.slice(0, n);
}

function phiRatio(a, b) {
  var ratio = Math.max(a, b) / Math.min(a, b);
  return {
    ratio: ratio,
    phi: PHI,
    deviation: Math.abs(ratio - PHI),
    isGolden: Math.abs(ratio - PHI) < 0.01
  };
}

function handlePhi(msg) {
  mathMetrics.phiOps++;
  var result;
  switch (msg.op) {
    case 'fibonacci':
      result = fibonacciSequence(msg.n || 10);
      break;
    case 'goldenAngle':
      result = goldenAngle(msg.n || 10);
      break;
    case 'phiPowers':
      result = phiPowers(msg.n || 10);
      break;
    case 'phiConvergents':
      result = phiConvergents(msg.n || 10);
      break;
    case 'lucasNumbers':
      result = lucasNumbers(msg.n || 10);
      break;
    case 'phiRatio':
      result = phiRatio(msg.a, msg.b);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'phi-result', op: msg.op, result: result, phi: PHI });
}

/* ════════════════════════════════════════════════════════════════
   4. Discrete Fourier Transform
   ════════════════════════════════════════════════════════════════ */

function dft(signal) {
  var N = signal.length;
  var real = [];
  var imag = [];
  for (var k = 0; k < N; k++) {
    var sumReal = 0;
    var sumImag = 0;
    for (var n = 0; n < N; n++) {
      var angle = (2 * Math.PI * k * n) / N;
      sumReal += signal[n] * Math.cos(angle);
      sumImag -= signal[n] * Math.sin(angle);
    }
    real.push(sumReal);
    imag.push(sumImag);
  }
  return { real: real, imag: imag, length: N };
}

function inverseDft(spectrum) {
  var N = spectrum.real.length;
  var signal = [];
  for (var n = 0; n < N; n++) {
    var sum = 0;
    for (var k = 0; k < N; k++) {
      var angle = (2 * Math.PI * k * n) / N;
      sum += spectrum.real[k] * Math.cos(angle) - spectrum.imag[k] * Math.sin(angle);
    }
    signal.push(sum / N);
  }
  return signal;
}

function powerSpectrum(signal) {
  var spectrum = dft(signal);
  var power = [];
  for (var k = 0; k < spectrum.length; k++) {
    power.push(spectrum.real[k] * spectrum.real[k] + spectrum.imag[k] * spectrum.imag[k]);
  }
  return { power: power, length: spectrum.length };
}

function dominantFrequency(signal, sampleRate) {
  var ps = powerSpectrum(signal);
  var maxPower = 0;
  var maxIndex = 0;
  var halfLen = Math.floor(ps.length / 2);
  for (var k = 1; k < halfLen; k++) {
    if (ps.power[k] > maxPower) {
      maxPower = ps.power[k];
      maxIndex = k;
    }
  }
  var frequency = (maxIndex * (sampleRate || 1)) / ps.length;
  return { frequency: frequency, index: maxIndex, power: maxPower };
}

function handleFourier(msg) {
  mathMetrics.fourierOps++;
  mathMetrics.totalTokensProcessed += (msg.signal ? msg.signal.length : 0);
  var result;
  switch (msg.op) {
    case 'dft':
      result = dft(msg.signal);
      break;
    case 'inverseDft':
      result = inverseDft(msg.spectrum);
      break;
    case 'powerSpectrum':
      result = powerSpectrum(msg.signal);
      break;
    case 'dominantFrequency':
      result = dominantFrequency(msg.signal, msg.sampleRate);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'fourier-result', op: msg.op, result: result });
}

/* ════════════════════════════════════════════════════════════════
   5. Probability Distributions
   ════════════════════════════════════════════════════════════════ */

function normalPdf(x, mean, stddev) {
  var d = x - mean;
  var s2 = stddev * stddev;
  return (1 / (stddev * Math.sqrt(2 * Math.PI))) * Math.exp(-0.5 * d * d / s2);
}

function normalCdf(x, mean, stddev) {
  // Abramowitz and Stegun rational approximation (formula 7.1.26)
  var z = (x - mean) / stddev;
  var sign = z < 0 ? -1 : 1;
  z = Math.abs(z) / Math.sqrt(2);

  var t = 1 / (1 + 0.3275911 * z);
  var a1 = 0.254829592;
  var a2 = -0.284496736;
  var a3 = 1.421413741;
  var a4 = -1.453152027;
  var a5 = 1.061405429;
  var erf = 1 - (((((a5 * t + a4) * t) + a3) * t + a2) * t + a1) * t * Math.exp(-z * z);
  return 0.5 * (1 + sign * erf);
}

function poissonPmf(k, lambda) {
  // P(X=k) = e^(-lambda) * lambda^k / k!
  var logP = -lambda + k * Math.log(lambda);
  for (var i = 2; i <= k; i++) {
    logP -= Math.log(i);
  }
  return Math.exp(logP);
}

function binomialPmf(k, n, p) {
  // P(X=k) = C(n,k) * p^k * (1-p)^(n-k)
  var logC = 0;
  for (var i = 0; i < k; i++) {
    logC += Math.log(n - i) - Math.log(i + 1);
  }
  return Math.exp(logC + k * Math.log(p) + (n - k) * Math.log(1 - p));
}

function uniformPdf(x, a, b) {
  if (x < a || x > b) return 0;
  return 1 / (b - a);
}

function exponentialPdf(x, lambda) {
  if (x < 0) return 0;
  return lambda * Math.exp(-lambda * x);
}

function bayesUpdate(prior, likelihood, evidence) {
  if (evidence === 0) return 0;
  return (likelihood * prior) / evidence;
}

function handleProbability(msg) {
  mathMetrics.probabilityOps++;
  var result;
  switch (msg.op) {
    case 'normalPdf':
      result = normalPdf(msg.x, msg.mean || 0, msg.stddev || 1);
      break;
    case 'normalCdf':
      result = normalCdf(msg.x, msg.mean || 0, msg.stddev || 1);
      break;
    case 'poissonPmf':
      result = poissonPmf(msg.k, msg.lambda);
      break;
    case 'binomialPmf':
      result = binomialPmf(msg.k, msg.n, msg.p);
      break;
    case 'uniformPdf':
      result = uniformPdf(msg.x, msg.a, msg.b);
      break;
    case 'exponentialPdf':
      result = exponentialPdf(msg.x, msg.lambda);
      break;
    case 'bayesUpdate':
      result = bayesUpdate(msg.prior, msg.likelihood, msg.evidence);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'probability-result', op: msg.op, result: result });
}

/* ════════════════════════════════════════════════════════════════
   6. Optimization
   ════════════════════════════════════════════════════════════════ */

function buildFunction(expr) {
  return new Function('x', 'return (' + expr + ');');
}

function goldenSectionSearch(fExpr, a, b, tol) {
  var f = buildFunction(fExpr);
  var gr = (Math.sqrt(5) - 1) / 2;
  var iterations = 0;
  var maxIter = 1000;
  var c = b - gr * (b - a);
  var d = a + gr * (b - a);

  while (Math.abs(b - a) > tol && iterations < maxIter) {
    iterations++;
    if (f(c) < f(d)) {
      b = d;
    } else {
      a = c;
    }
    c = b - gr * (b - a);
    d = a + gr * (b - a);
  }
  var xMin = (a + b) / 2;
  return { x: xMin, fx: f(xMin), iterations: iterations };
}

function gradientDescent(fExpr, x0, lr, iterations) {
  var f = buildFunction(fExpr);
  var x = x0;
  var h = 1e-8;
  var maxIter = iterations || 1000;
  var learningRate = lr || 0.01;

  for (var i = 0; i < maxIter; i++) {
    var grad = (f(x + h) - f(x - h)) / (2 * h);
    x = x - learningRate * grad;
  }
  return { x: x, fx: f(x), iterations: maxIter };
}

function handleOptimize(msg) {
  mathMetrics.optimizeOps++;
  var result;
  switch (msg.op) {
    case 'goldenSection':
      result = goldenSectionSearch(msg.f, msg.a, msg.b, msg.tol || 0.001);
      break;
    case 'gradientDescent':
      result = gradientDescent(msg.f, msg.x0 || 0, msg.lr || 0.01, msg.iterations || 1000);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'optimize-result', op: msg.op, result: result });
}

/* ════════════════════════════════════════════════════════════════
   7. Regression
   ════════════════════════════════════════════════════════════════ */

function linearRegression(xs, ys) {
  var n = xs.length;
  var sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0, sumY2 = 0;
  for (var i = 0; i < n; i++) {
    sumX += xs[i];
    sumY += ys[i];
    sumXY += xs[i] * ys[i];
    sumX2 += xs[i] * xs[i];
    sumY2 += ys[i] * ys[i];
  }
  var denom = n * sumX2 - sumX * sumX;
  if (denom === 0) return { slope: 0, intercept: 0, r2: 0, residuals: [], standardError: 0, predictions: [] };

  var slope = (n * sumXY - sumX * sumY) / denom;
  var intercept = (sumY - slope * sumX) / n;

  var predictions = [];
  var residuals = [];
  var ssRes = 0;
  var ssTot = 0;
  var meanY = sumY / n;

  for (var j = 0; j < n; j++) {
    var pred = slope * xs[j] + intercept;
    predictions.push(pred);
    var res = ys[j] - pred;
    residuals.push(res);
    ssRes += res * res;
    ssTot += (ys[j] - meanY) * (ys[j] - meanY);
  }

  var r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;
  var standardError = n > 2 ? Math.sqrt(ssRes / (n - 2)) : 0;

  return {
    slope: slope,
    intercept: intercept,
    r2: r2,
    residuals: residuals,
    standardError: standardError,
    predictions: predictions
  };
}

function polynomialRegression(xs, ys, degree) {
  // Solve using normal equations: (X^T X) coeffs = X^T y
  var n = xs.length;
  var deg = Math.min(degree || 2, 3);
  var cols = deg + 1;

  // Build Vandermonde matrix X
  var X = [];
  for (var i = 0; i < n; i++) {
    X[i] = [];
    for (var j = 0; j < cols; j++) {
      X[i][j] = Math.pow(xs[i], j);
    }
  }

  var Xt = matrixTranspose(X);
  var XtX = matrixMultiply(Xt, X);

  // Build X^T * y as a column vector
  var Xty = [];
  for (var ci = 0; ci < cols; ci++) {
    var s = 0;
    for (var ri = 0; ri < n; ri++) {
      s += X[ri][ci] * ys[ri];
    }
    Xty.push([s]);
  }

  // Solve via Gaussian elimination
  var coeffs = solveLinearSystem(XtX, Xty);
  if (!coeffs) return { coefficients: [], r2: 0, predictions: [] };

  var predictions = [];
  var residuals = [];
  var ssRes = 0;
  var ssTot = 0;
  var meanY = statsMean(ys);

  for (var pi = 0; pi < n; pi++) {
    var pred = 0;
    for (var pj = 0; pj < coeffs.length; pj++) {
      pred += coeffs[pj] * Math.pow(xs[pi], pj);
    }
    predictions.push(pred);
    var res = ys[pi] - pred;
    residuals.push(res);
    ssRes += res * res;
    ssTot += (ys[pi] - meanY) * (ys[pi] - meanY);
  }

  var r2 = ssTot !== 0 ? 1 - ssRes / ssTot : 0;

  return {
    coefficients: coeffs,
    degree: deg,
    r2: r2,
    residuals: residuals,
    predictions: predictions
  };
}

function solveLinearSystem(A, b) {
  // Gaussian elimination with partial pivoting
  var n = A.length;
  var aug = [];
  for (var i = 0; i < n; i++) {
    aug[i] = [];
    for (var j = 0; j < n; j++) {
      aug[i][j] = A[i][j];
    }
    aug[i][n] = b[i][0];
  }

  for (var col = 0; col < n; col++) {
    // Partial pivoting
    var maxRow = col;
    var maxVal = Math.abs(aug[col][col]);
    for (var row = col + 1; row < n; row++) {
      if (Math.abs(aug[row][col]) > maxVal) {
        maxVal = Math.abs(aug[row][col]);
        maxRow = row;
      }
    }
    if (maxRow !== col) {
      var temp = aug[col];
      aug[col] = aug[maxRow];
      aug[maxRow] = temp;
    }

    if (Math.abs(aug[col][col]) < 1e-12) return null;

    // Eliminate below
    for (var erow = col + 1; erow < n; erow++) {
      var factor = aug[erow][col] / aug[col][col];
      for (var ecol = col; ecol <= n; ecol++) {
        aug[erow][ecol] -= factor * aug[col][ecol];
      }
    }
  }

  // Back substitution
  var x = [];
  for (var bi = n - 1; bi >= 0; bi--) {
    var sum = aug[bi][n];
    for (var bj = bi + 1; bj < n; bj++) {
      sum -= aug[bi][bj] * x[bj];
    }
    x[bi] = sum / aug[bi][bi];
  }
  return x;
}

function handleRegression(msg) {
  mathMetrics.regressionOps++;
  mathMetrics.totalTokensProcessed += (msg.xs ? msg.xs.length : 0);
  var result;
  switch (msg.op) {
    case 'linear':
      result = linearRegression(msg.xs, msg.ys);
      break;
    case 'polynomial':
      result = polynomialRegression(msg.xs, msg.ys, msg.degree || 2);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'regression-result', op: msg.op, result: result });
}

/* ════════════════════════════════════════════════════════════════
   8. Number Theory
   ════════════════════════════════════════════════════════════════ */

function isPrime(n) {
  if (n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (var i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

function primeFactorization(n) {
  var factors = [];
  var d = 2;
  while (d * d <= n) {
    while (n % d === 0) {
      factors.push(d);
      n = n / d;
    }
    d++;
  }
  if (n > 1) factors.push(n);
  return factors;
}

function gcd(a, b) {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b !== 0) {
    var t = b;
    b = a % b;
    a = t;
  }
  return a;
}

function lcm(a, b) {
  if (a === 0 && b === 0) return 0;
  return Math.abs(a * b) / gcd(a, b);
}

function totient(n) {
  var result = n;
  var p = 2;
  var num = n;
  while (p * p <= num) {
    if (num % p === 0) {
      while (num % p === 0) num = num / p;
      result -= result / p;
    }
    p++;
  }
  if (num > 1) {
    result -= result / num;
  }
  return Math.round(result);
}

function primeCount(n) {
  var count = 0;
  for (var i = 2; i <= n; i++) {
    if (isPrime(i)) count++;
  }
  return count;
}

function nthPrime(n) {
  if (n < 1) return 2;
  var count = 0;
  var candidate = 1;
  while (count < n) {
    candidate++;
    if (isPrime(candidate)) count++;
  }
  return candidate;
}

function isPerfect(n) {
  if (n < 2) return false;
  var sum = 1;
  for (var i = 2; i * i <= n; i++) {
    if (n % i === 0) {
      sum += i;
      if (i !== n / i) sum += n / i;
    }
  }
  return sum === n;
}

function phiConnections(n) {
  // Explore relationships between n and the golden ratio
  var fib = fibonacciSequence(30);
  var isFib = fib.indexOf(n) !== -1;
  var closestFib = fib[0];
  var minDiff = Math.abs(n - fib[0]);
  for (var i = 1; i < fib.length; i++) {
    var diff = Math.abs(n - fib[i]);
    if (diff < minDiff) {
      minDiff = diff;
      closestFib = fib[i];
    }
  }
  var phiMultiple = n / PHI;
  var phiRemainder = n % PHI;
  return {
    n: n,
    isFibonacci: isFib,
    closestFibonacci: closestFib,
    distanceToFib: minDiff,
    nDividedByPhi: phiMultiple,
    nModPhi: phiRemainder,
    totient: totient(n),
    isPrime: isPrime(n),
    factors: primeFactorization(n)
  };
}

function handleNumberTheory(msg) {
  mathMetrics.numberTheoryOps++;
  var result;
  switch (msg.op) {
    case 'isPrime':
      result = isPrime(msg.n);
      break;
    case 'primeFactorization':
      result = primeFactorization(msg.n);
      break;
    case 'gcd':
      result = gcd(msg.a, msg.b);
      break;
    case 'lcm':
      result = lcm(msg.a, msg.b);
      break;
    case 'totient':
      result = totient(msg.n);
      break;
    case 'primeCount':
      result = primeCount(msg.n);
      break;
    case 'nthPrime':
      result = nthPrime(msg.n);
      break;
    case 'isPerfect':
      result = isPerfect(msg.n);
      break;
    case 'phiConnections':
      result = phiConnections(msg.n);
      break;
    default:
      result = null;
  }
  postMessage({ type: 'numberTheory-result', op: msg.op, result: result });
}

/* ════════════════════════════════════════════════════════════════
   Message Router
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function(e) {
  var msg = e.data;

  if (msg.type === 'stats' && msg.op === 'worker') {
    postMessage({
      type: 'worker-stats',
      worker: 'math',
      metrics: mathMetrics,
      uptime: Date.now() - startTime
    });
    return;
  }

  mathMetrics.totalComputations++;

  switch (msg.type) {
    case 'matrix':
      handleMatrix(msg);
      break;
    case 'stats':
      handleStats(msg);
      break;
    case 'phi':
      handlePhi(msg);
      break;
    case 'fourier':
      handleFourier(msg);
      break;
    case 'probability':
      handleProbability(msg);
      break;
    case 'optimize':
      handleOptimize(msg);
      break;
    case 'regression':
      handleRegression(msg);
      break;
    case 'numberTheory':
      handleNumberTheory(msg);
      break;
    case 'neuro-signal':
      neuro.receiveNeuroSignal(msg);
      break;
    case 'stop':
      running = false;
      break;
  }
  neuro.onMessageDone();
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

var neuro = new NeuroCore('math', {
  division: 'brain',
  role: 'Math Intelligence',
  capabilities: ['matrix', 'stats', 'phi', 'fourier', 'probability', 'optimize', 'regression', 'numberTheory']
});

setInterval(function() {
  if (!running) return;
  beatCount++;
  neuro.beat();
  postMessage({
    type: 'heartbeat',
    worker: 'math',
    beat: beatCount,
    phi: PHI,
    health: neuro.health(),
    timestamp: Date.now()
  });
}, HEARTBEAT_MS);

postMessage({
  type: 'booted',
  worker: 'math',
  capabilities: ['matrix', 'stats', 'phi', 'fourier', 'probability', 'optimize', 'regression', 'numberTheory'],
  phi: PHI
});

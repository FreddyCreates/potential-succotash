/**
 * Dark Prediction Protocol (DRK-016)
 * 
 * Predictive modeling for threat anticipation and
 * behavioral forecasting in the dark layer.
 * 
 * Protocol ID: DRK-016
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Prediction types
 */
export const PREDICTION_TYPES = {
  THREAT: 'threat',
  BEHAVIOR: 'behavior',
  RESOURCE: 'resource',
  PATTERN: 'pattern',
  TEMPORAL: 'temporal'
};

/**
 * Time series predictor
 */
export class TimeSeriesPredictor {
  constructor(config = {}) {
    this.windowSize = config.windowSize || 10;
    this.data = [];
    this.weights = null;
  }
  
  /**
   * Add observation
   */
  observe(value, timestamp = Date.now()) {
    this.data.push({ value, timestamp });
    
    // Keep only recent data
    while (this.data.length > this.windowSize * 10) {
      this.data.shift();
    }
  }
  
  /**
   * Simple moving average
   */
  sma(n = this.windowSize) {
    if (this.data.length < n) return null;
    
    const recent = this.data.slice(-n);
    return recent.reduce((sum, d) => sum + d.value, 0) / n;
  }
  
  /**
   * Exponential moving average
   */
  ema(alpha = 2 / (this.windowSize + 1)) {
    if (this.data.length === 0) return null;
    
    let ema = this.data[0].value;
    for (let i = 1; i < this.data.length; i++) {
      ema = alpha * this.data[i].value + (1 - alpha) * ema;
    }
    
    return ema;
  }
  
  /**
   * Predict next value
   */
  predict(method = 'ema') {
    if (this.data.length < 2) return null;
    
    switch (method) {
      case 'sma':
        return this.sma();
      case 'ema':
        return this.ema();
      case 'linear':
        return this.linearRegression();
      case 'phi':
        return this.phiPrediction();
      default:
        return this.ema();
    }
  }
  
  /**
   * Linear regression prediction
   */
  linearRegression() {
    const n = this.data.length;
    if (n < 2) return null;
    
    let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
    
    for (let i = 0; i < n; i++) {
      sumX += i;
      sumY += this.data[i].value;
      sumXY += i * this.data[i].value;
      sumX2 += i * i;
    }
    
    const slope = (n * sumXY - sumX * sumY) / (n * sumX2 - sumX * sumX);
    const intercept = (sumY - slope * sumX) / n;
    
    return slope * n + intercept;
  }
  
  /**
   * Phi-weighted prediction
   */
  phiPrediction() {
    if (this.data.length < 3) return this.ema();
    
    const recent = this.data.slice(-5);
    let sum = 0;
    let weightSum = 0;
    
    for (let i = 0; i < recent.length; i++) {
      const weight = Math.pow(PHI, i);
      sum += recent[recent.length - 1 - i].value * weight;
      weightSum += weight;
    }
    
    return sum / weightSum;
  }
  
  /**
   * Detect trend
   */
  detectTrend() {
    if (this.data.length < 3) return 'insufficient-data';
    
    const recent = this.data.slice(-this.windowSize);
    const first = recent.slice(0, Math.floor(recent.length / 2));
    const second = recent.slice(Math.floor(recent.length / 2));
    
    const avgFirst = first.reduce((s, d) => s + d.value, 0) / first.length;
    const avgSecond = second.reduce((s, d) => s + d.value, 0) / second.length;
    
    const change = (avgSecond - avgFirst) / avgFirst;
    
    if (change > 0.1) return 'increasing';
    if (change < -0.1) return 'decreasing';
    return 'stable';
  }
}

/**
 * Markov Predictor
 */
export class MarkovPredictor {
  constructor(order = 1) {
    this.order = order;
    this.transitions = new Map();
    this.stateCounts = new Map();
  }
  
  /**
   * Observe sequence
   */
  observe(sequence) {
    for (let i = this.order; i < sequence.length; i++) {
      const state = sequence.slice(i - this.order, i).join('→');
      const nextState = sequence[i];
      
      if (!this.transitions.has(state)) {
        this.transitions.set(state, new Map());
      }
      
      const stateTransitions = this.transitions.get(state);
      stateTransitions.set(nextState, (stateTransitions.get(nextState) || 0) + 1);
      
      this.stateCounts.set(state, (this.stateCounts.get(state) || 0) + 1);
    }
  }
  
  /**
   * Get transition probability
   */
  getTransitionProbability(fromState, toState) {
    const stateKey = Array.isArray(fromState) ? fromState.join('→') : fromState;
    const stateTransitions = this.transitions.get(stateKey);
    
    if (!stateTransitions) return 0;
    
    const total = this.stateCounts.get(stateKey) || 1;
    return (stateTransitions.get(toState) || 0) / total;
  }
  
  /**
   * Predict next state
   */
  predict(currentState) {
    const stateKey = Array.isArray(currentState) ? currentState.join('→') : currentState;
    const stateTransitions = this.transitions.get(stateKey);
    
    if (!stateTransitions) return { state: null, probability: 0 };
    
    let maxProb = 0;
    let predicted = null;
    const total = this.stateCounts.get(stateKey) || 1;
    
    for (const [state, count] of stateTransitions) {
      const prob = count / total;
      if (prob > maxProb) {
        maxProb = prob;
        predicted = state;
      }
    }
    
    return { state: predicted, probability: maxProb };
  }
  
  /**
   * Get all possible next states
   */
  getPossibleStates(currentState) {
    const stateKey = Array.isArray(currentState) ? currentState.join('→') : currentState;
    const stateTransitions = this.transitions.get(stateKey);
    
    if (!stateTransitions) return [];
    
    const total = this.stateCounts.get(stateKey) || 1;
    const results = [];
    
    for (const [state, count] of stateTransitions) {
      results.push({ state, probability: count / total });
    }
    
    return results.sort((a, b) => b.probability - a.probability);
  }
}

/**
 * Threat Predictor
 */
export class ThreatPredictor {
  constructor(config = {}) {
    this.timeSeries = new TimeSeriesPredictor(config);
    this.markov = new MarkovPredictor(config.markovOrder || 2);
    this.patterns = [];
    this.threatHistory = [];
  }
  
  /**
   * Observe threat event
   */
  observeThreat(event) {
    const severity = event.severity || event.level || 0;
    this.timeSeries.observe(severity);
    
    this.threatHistory.push({
      type: event.type,
      severity,
      timestamp: Date.now()
    });
    
    // Update Markov model with threat types
    if (this.threatHistory.length >= 3) {
      const types = this.threatHistory.slice(-10).map(t => t.type);
      this.markov.observe(types);
    }
    
    while (this.threatHistory.length > 1000) {
      this.threatHistory.shift();
    }
  }
  
  /**
   * Predict threat level
   */
  predictThreatLevel() {
    const predicted = this.timeSeries.predict('phi');
    const trend = this.timeSeries.detectTrend();
    
    return {
      level: predicted,
      trend,
      confidence: this.computeConfidence()
    };
  }
  
  /**
   * Predict next threat type
   */
  predictThreatType() {
    if (this.threatHistory.length < 3) {
      return { type: null, probability: 0 };
    }
    
    const recent = this.threatHistory.slice(-2).map(t => t.type);
    return this.markov.predict(recent);
  }
  
  /**
   * Compute prediction confidence
   */
  computeConfidence() {
    const dataPoints = this.timeSeries.data.length;
    
    if (dataPoints < 5) return 0.2;
    if (dataPoints < 10) return 0.4;
    if (dataPoints < 20) return 0.6;
    if (dataPoints < 50) return 0.8;
    return 0.9;
  }
  
  /**
   * Get threat forecast
   */
  getForecast(horizon = 5) {
    const forecast = [];
    let currentLevel = this.timeSeries.ema() || 0;
    let currentType = this.threatHistory.slice(-2).map(t => t.type);
    
    for (let i = 0; i < horizon; i++) {
      const levelPrediction = currentLevel * (1 + (Math.random() - 0.5) * THRESHOLD);
      const typePrediction = this.markov.predict(currentType);
      
      forecast.push({
        step: i + 1,
        predictedLevel: levelPrediction,
        predictedType: typePrediction.state,
        probability: typePrediction.probability
      });
      
      currentLevel = levelPrediction;
      if (typePrediction.state) {
        currentType = [...currentType.slice(1), typePrediction.state];
      }
    }
    
    return forecast;
  }
}

/**
 * Dark Prediction Protocol
 */
export const DarkPredictionProtocol = {
  id: 'DRK-016',
  name: 'Dark Prediction Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  types: PREDICTION_TYPES,
  
  createTimeSeries: (config) => new TimeSeriesPredictor(config),
  createMarkov: (order) => new MarkovPredictor(order),
  createThreatPredictor: (config) => new ThreatPredictor(config)
};

export default DarkPredictionProtocol;

/**
 * Dark Learning Protocol (DRK-015)
 * 
 * Machine learning primitives for the dark layer.
 * Silent model training and inference.
 * 
 * Protocol ID: DRK-015
 * Category: Dark Intelligence
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Learning types
 */
export const LEARNING_TYPES = {
  SUPERVISED: 'supervised',
  UNSUPERVISED: 'unsupervised',
  REINFORCEMENT: 'reinforcement',
  ONLINE: 'online'
};

/**
 * Model types
 */
export const MODEL_TYPES = {
  LINEAR: 'linear',
  TREE: 'tree',
  NAIVE_BAYES: 'naive-bayes',
  KNN: 'knn',
  CLUSTERING: 'clustering'
};

/**
 * Simple Perceptron
 */
export class SimplePerceptron {
  constructor(inputSize, learningRate = 0.1) {
    this.weights = new Array(inputSize).fill(0).map(() => Math.random() * PHI - PHI / 2);
    this.bias = 0;
    this.learningRate = learningRate;
    this.trainingIterations = 0;
  }
  
  /**
   * Activation function (sigmoid)
   */
  activate(x) {
    return 1 / (1 + Math.exp(-x));
  }
  
  /**
   * Predict
   */
  predict(inputs) {
    let sum = this.bias;
    for (let i = 0; i < inputs.length; i++) {
      sum += inputs[i] * this.weights[i];
    }
    return this.activate(sum);
  }
  
  /**
   * Train on single example
   */
  train(inputs, target) {
    const prediction = this.predict(inputs);
    const error = target - prediction;
    const gradient = prediction * (1 - prediction);
    
    // Update weights
    for (let i = 0; i < this.weights.length; i++) {
      this.weights[i] += this.learningRate * error * gradient * inputs[i];
    }
    this.bias += this.learningRate * error * gradient;
    
    this.trainingIterations++;
    
    return { prediction, error: Math.abs(error) };
  }
  
  /**
   * Train on batch
   */
  trainBatch(data, epochs = 10) {
    const errors = [];
    
    for (let epoch = 0; epoch < epochs; epoch++) {
      let epochError = 0;
      
      for (const { inputs, target } of data) {
        const result = this.train(inputs, target);
        epochError += result.error;
      }
      
      errors.push(epochError / data.length);
    }
    
    return { epochs, finalError: errors[errors.length - 1], errors };
  }
}

/**
 * K-Nearest Neighbors
 */
export class KNearestNeighbors {
  constructor(k = 3) {
    this.k = k;
    this.data = [];
  }
  
  /**
   * Add training example
   */
  fit(features, label) {
    this.data.push({ features, label });
  }
  
  /**
   * Fit batch
   */
  fitBatch(examples) {
    for (const { features, label } of examples) {
      this.fit(features, label);
    }
  }
  
  /**
   * Compute distance
   */
  distance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow((a[i] || 0) - (b[i] || 0), 2);
    }
    return Math.sqrt(sum);
  }
  
  /**
   * Find k nearest neighbors
   */
  findNeighbors(features) {
    const distances = this.data.map(d => ({
      ...d,
      dist: this.distance(features, d.features)
    }));
    
    distances.sort((a, b) => a.dist - b.dist);
    
    return distances.slice(0, this.k);
  }
  
  /**
   * Predict label
   */
  predict(features) {
    const neighbors = this.findNeighbors(features);
    
    // Vote
    const votes = {};
    for (const n of neighbors) {
      votes[n.label] = (votes[n.label] || 0) + 1;
    }
    
    let maxVotes = 0;
    let prediction = null;
    
    for (const [label, count] of Object.entries(votes)) {
      if (count > maxVotes) {
        maxVotes = count;
        prediction = label;
      }
    }
    
    return {
      prediction,
      confidence: maxVotes / this.k,
      neighbors
    };
  }
}

/**
 * Naive Bayes Classifier
 */
export class NaiveBayesClassifier {
  constructor() {
    this.classes = new Map();
    this.totalSamples = 0;
  }
  
  /**
   * Fit training data
   */
  fit(features, label) {
    if (!this.classes.has(label)) {
      this.classes.set(label, {
        count: 0,
        features: new Map()
      });
    }
    
    const classData = this.classes.get(label);
    classData.count++;
    
    for (const [feature, value] of Object.entries(features)) {
      if (!classData.features.has(feature)) {
        classData.features.set(feature, { sum: 0, sumSq: 0, count: 0 });
      }
      
      const featureData = classData.features.get(feature);
      featureData.sum += value;
      featureData.sumSq += value * value;
      featureData.count++;
    }
    
    this.totalSamples++;
  }
  
  /**
   * Fit batch
   */
  fitBatch(examples) {
    for (const { features, label } of examples) {
      this.fit(features, label);
    }
  }
  
  /**
   * Compute Gaussian probability
   */
  gaussianProbability(x, mean, variance) {
    if (variance === 0) return x === mean ? 1 : 0;
    const exp = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
    return (1 / Math.sqrt(2 * Math.PI * variance)) * exp;
  }
  
  /**
   * Predict class
   */
  predict(features) {
    const scores = {};
    
    for (const [label, classData] of this.classes) {
      // Prior probability
      let logProb = Math.log(classData.count / this.totalSamples);
      
      // Likelihood for each feature
      for (const [feature, value] of Object.entries(features)) {
        const featureData = classData.features.get(feature);
        
        if (featureData) {
          const mean = featureData.sum / featureData.count;
          const variance = (featureData.sumSq / featureData.count) - (mean * mean);
          const prob = this.gaussianProbability(value, mean, variance);
          logProb += Math.log(prob + 1e-10);
        }
      }
      
      scores[label] = logProb;
    }
    
    // Find highest score
    let maxScore = -Infinity;
    let prediction = null;
    
    for (const [label, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        prediction = label;
      }
    }
    
    // Convert to probabilities
    const total = Object.values(scores).reduce((sum, s) => sum + Math.exp(s), 0);
    const probabilities = {};
    for (const [label, score] of Object.entries(scores)) {
      probabilities[label] = Math.exp(score) / total;
    }
    
    return {
      prediction,
      confidence: probabilities[prediction] || 0,
      probabilities
    };
  }
}

/**
 * K-Means Clustering
 */
export class KMeansClustering {
  constructor(k = 3, maxIterations = 100) {
    this.k = k;
    this.maxIterations = maxIterations;
    this.centroids = [];
    this.assignments = [];
  }
  
  /**
   * Initialize centroids
   */
  initializeCentroids(data) {
    // K-means++ initialization
    this.centroids = [];
    
    // First centroid is random
    this.centroids.push([...data[Math.floor(Math.random() * data.length)]]);
    
    // Remaining centroids
    while (this.centroids.length < this.k) {
      const distances = data.map(point => {
        const minDist = Math.min(...this.centroids.map(c => this.distance(point, c)));
        return minDist * minDist;
      });
      
      const total = distances.reduce((a, b) => a + b, 0);
      let r = Math.random() * total;
      
      for (let i = 0; i < data.length; i++) {
        r -= distances[i];
        if (r <= 0) {
          this.centroids.push([...data[i]]);
          break;
        }
      }
    }
  }
  
  /**
   * Compute distance
   */
  distance(a, b) {
    let sum = 0;
    for (let i = 0; i < a.length; i++) {
      sum += Math.pow(a[i] - b[i], 2);
    }
    return Math.sqrt(sum);
  }
  
  /**
   * Assign points to clusters
   */
  assignPoints(data) {
    this.assignments = data.map(point => {
      let minDist = Infinity;
      let cluster = 0;
      
      for (let i = 0; i < this.centroids.length; i++) {
        const dist = this.distance(point, this.centroids[i]);
        if (dist < minDist) {
          minDist = dist;
          cluster = i;
        }
      }
      
      return cluster;
    });
  }
  
  /**
   * Update centroids
   */
  updateCentroids(data) {
    const newCentroids = this.centroids.map(() => null);
    const counts = new Array(this.k).fill(0);
    
    for (let i = 0; i < data.length; i++) {
      const cluster = this.assignments[i];
      
      if (!newCentroids[cluster]) {
        newCentroids[cluster] = new Array(data[i].length).fill(0);
      }
      
      for (let j = 0; j < data[i].length; j++) {
        newCentroids[cluster][j] += data[i][j];
      }
      counts[cluster]++;
    }
    
    // Average
    for (let i = 0; i < this.k; i++) {
      if (newCentroids[i] && counts[i] > 0) {
        for (let j = 0; j < newCentroids[i].length; j++) {
          newCentroids[i][j] /= counts[i];
        }
        this.centroids[i] = newCentroids[i];
      }
    }
  }
  
  /**
   * Fit data
   */
  fit(data) {
    this.initializeCentroids(data);
    
    for (let iter = 0; iter < this.maxIterations; iter++) {
      const oldAssignments = [...this.assignments];
      
      this.assignPoints(data);
      this.updateCentroids(data);
      
      // Check convergence
      if (JSON.stringify(oldAssignments) === JSON.stringify(this.assignments)) {
        return { converged: true, iterations: iter + 1 };
      }
    }
    
    return { converged: false, iterations: this.maxIterations };
  }
  
  /**
   * Predict cluster for new point
   */
  predict(point) {
    let minDist = Infinity;
    let cluster = 0;
    
    for (let i = 0; i < this.centroids.length; i++) {
      const dist = this.distance(point, this.centroids[i]);
      if (dist < minDist) {
        minDist = dist;
        cluster = i;
      }
    }
    
    return { cluster, distance: minDist };
  }
}

/**
 * Dark Learning Protocol
 */
export const DarkLearningProtocol = {
  id: 'DRK-015',
  name: 'Dark Learning Protocol',
  version: '1.0.0',
  category: 'dark-intelligence',
  
  constants: { PHI, HB, THRESHOLD },
  learningTypes: LEARNING_TYPES,
  modelTypes: MODEL_TYPES,
  
  createPerceptron: (inputSize, lr) => new SimplePerceptron(inputSize, lr),
  createKNN: (k) => new KNearestNeighbors(k),
  createNaiveBayes: () => new NaiveBayesClassifier(),
  createKMeans: (k, maxIter) => new KMeansClustering(k, maxIter)
};

export default DarkLearningProtocol;

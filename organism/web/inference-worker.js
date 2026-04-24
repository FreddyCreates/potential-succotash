/**
 * Local Inference Worker — In-Browser Pattern Matching & Classification
 *
 * Permanent Web Worker that provides:
 * - Text classification (category prediction)
 * - Pattern matching (regex + semantic patterns)
 * - Similarity scoring (cosine similarity on simple embeddings)
 * - Keyword extraction (TF-IDF-like scoring)
 * - Sentiment analysis (lexicon-based)
 * - Entity recognition (pattern-based NER)
 *
 * This worker runs ML-like inference entirely in the browser.
 * No external APIs. No network calls. Pure local intelligence.
 *
 * Protocol: postMessage
 *   Main → Worker: { type: 'classify', text: '...', categories: [...] }
 *   Main → Worker: { type: 'match', text: '...', patterns: [...] }
 *   Main → Worker: { type: 'similarity', textA: '...', textB: '...' }
 *   Main → Worker: { type: 'keywords', text: '...', topK: N }
 *   Main → Worker: { type: 'sentiment', text: '...' }
 *   Main → Worker: { type: 'entities', text: '...' }
 *   Main → Worker: { type: 'embed', text: '...' }
 *   Main → Worker: { type: 'stats' }
 *   Worker → Main: { type: 'classification', ... }
 *   Worker → Main: { type: 'match-result', ... }
 *   Worker → Main: { type: 'similarity-result', ... }
 *   Worker → Main: { type: 'heartbeat', ... }
 */

'use strict';

var PHI = 1.618033988749895;
var HEARTBEAT_MS = 873;
var beatCount = 0;
var running = true;

/* ════════════════════════════════════════════════════════════════
   Metrics
   ════════════════════════════════════════════════════════════════ */

var inferenceMetrics = {
  totalClassifications: 0,
  totalMatches: 0,
  totalSimilarities: 0,
  totalKeywords: 0,
  totalSentiments: 0,
  totalEntities: 0,
  totalEmbeddings: 0,
  totalTokensProcessed: 0
};

/* ════════════════════════════════════════════════════════════════
   Text Tokenization — simple word-level
   ════════════════════════════════════════════════════════════════ */

function tokenize(text) {
  return (text || '').toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/).filter(function (w) { return w.length > 0; });
}

function tokenFrequency(tokens) {
  var freq = Object.create(null);
  for (var i = 0; i < tokens.length; i++) {
    var t = tokens[i];
    freq[t] = (freq[t] || 0) + 1;
  }
  return freq;
}

/* ════════════════════════════════════════════════════════════════
   Simple Embedding — hash-based vector (64-dim)
   ════════════════════════════════════════════════════════════════ */

function simpleEmbed(text, dim) {
  dim = dim || 64;
  var tokens = tokenize(text);
  var vec = new Float32Array(dim);

  for (var i = 0; i < tokens.length; i++) {
    var hash = 0;
    for (var j = 0; j < tokens[i].length; j++) {
      hash = ((hash << 5) - hash) + tokens[i].charCodeAt(j);
      hash = hash & hash;
    }
    for (var d = 0; d < dim; d++) {
      vec[d] += Math.sin(hash * PHI * (d + 1)) / tokens.length;
    }
  }

  // Normalize
  var mag = 0;
  for (var k = 0; k < dim; k++) mag += vec[k] * vec[k];
  mag = Math.sqrt(mag);
  if (mag > 0) for (var m = 0; m < dim; m++) vec[m] /= mag;

  return vec;
}

function cosineSimilarity(a, b) {
  var dot = 0, magA = 0, magB = 0;
  var len = Math.min(a.length, b.length);
  for (var i = 0; i < len; i++) {
    dot += a[i] * b[i];
    magA += a[i] * a[i];
    magB += b[i] * b[i];
  }
  magA = Math.sqrt(magA);
  magB = Math.sqrt(magB);
  if (magA === 0 || magB === 0) return 0;
  return dot / (magA * magB);
}

/* ════════════════════════════════════════════════════════════════
   Classification — cosine similarity to category labels
   ════════════════════════════════════════════════════════════════ */

function classify(text, categories) {
  var textVec = simpleEmbed(text);
  var results = [];

  for (var i = 0; i < categories.length; i++) {
    var catVec = simpleEmbed(categories[i]);
    var score = cosineSimilarity(textVec, catVec);
    results.push({ category: categories[i], score: Math.round(score * 10000) / 10000 });
  }

  results.sort(function (a, b) { return b.score - a.score; });
  inferenceMetrics.totalClassifications++;
  inferenceMetrics.totalTokensProcessed += tokenize(text).length;

  return { text: text.substring(0, 100), predictions: results, topCategory: results[0] ? results[0].category : null };
}

/* ════════════════════════════════════════════════════════════════
   Pattern Matching
   ════════════════════════════════════════════════════════════════ */

function matchPatterns(text, patterns) {
  var matches = [];
  for (var i = 0; i < patterns.length; i++) {
    try {
      var re = new RegExp(patterns[i], 'gi');
      var found = text.match(re);
      if (found) {
        matches.push({ pattern: patterns[i], matches: found, count: found.length });
      }
    } catch (err) {
      // Invalid regex — skip
    }
  }
  inferenceMetrics.totalMatches++;
  return matches;
}

/* ════════════════════════════════════════════════════════════════
   Keyword Extraction — TF-based
   ════════════════════════════════════════════════════════════════ */

var STOP_WORDS = Object.create(null);
['the','a','an','is','are','was','were','be','been','being','have','has','had','do','does','did','will','would','could','should','may','might','can','shall','and','but','or','nor','not','no','so','if','then','than','that','this','these','those','it','its','i','me','my','we','our','you','your','he','him','his','she','her','they','them','their','of','in','on','at','to','for','with','by','from','as','into','about','up','out','over'].forEach(function(w){STOP_WORDS[w]=true;});

function extractKeywords(text, topK) {
  topK = topK || 10;
  var tokens = tokenize(text).filter(function (t) { return t.length > 2 && !STOP_WORDS[t]; });
  var freq = tokenFrequency(tokens);

  var keywords = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; }).slice(0, topK);
  inferenceMetrics.totalKeywords++;
  return keywords.map(function (k) { return { word: k, count: freq[k], score: Math.round(freq[k] / tokens.length * 10000) / 10000 }; });
}

/* ════════════════════════════════════════════════════════════════
   Sentiment Analysis — simple lexicon
   ════════════════════════════════════════════════════════════════ */

var POSITIVE_WORDS = Object.create(null);
var NEGATIVE_WORDS = Object.create(null);
['good','great','excellent','amazing','wonderful','fantastic','love','happy','best','awesome','beautiful','brilliant','perfect','outstanding','superb'].forEach(function(w){POSITIVE_WORDS[w]=true;});
['bad','terrible','horrible','awful','worst','hate','ugly','poor','disgusting','dreadful','nasty','pathetic','miserable','disappointing','failure'].forEach(function(w){NEGATIVE_WORDS[w]=true;});

function analyzeSentiment(text) {
  var tokens = tokenize(text);
  var pos = 0, neg = 0;
  for (var i = 0; i < tokens.length; i++) {
    if (POSITIVE_WORDS[tokens[i]]) pos++;
    if (NEGATIVE_WORDS[tokens[i]]) neg++;
  }
  var total = pos + neg;
  var score = total === 0 ? 0 : (pos - neg) / total;
  var label = score > 0.1 ? 'positive' : (score < -0.1 ? 'negative' : 'neutral');
  inferenceMetrics.totalSentiments++;
  return { score: Math.round(score * 10000) / 10000, label: label, positive: pos, negative: neg, total: tokens.length };
}

/* ════════════════════════════════════════════════════════════════
   Entity Recognition — pattern-based
   ════════════════════════════════════════════════════════════════ */

function extractEntities(text) {
  var entities = [];

  // Email addresses
  var emails = text.match(/[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}/gi);
  if (emails) emails.forEach(function (e) { entities.push({ type: 'EMAIL', value: e }); });

  // URLs
  var urls = text.match(/https?:\/\/[^\s]+/gi);
  if (urls) urls.forEach(function (u) { entities.push({ type: 'URL', value: u }); });

  // Numbers (with optional decimals)
  var numbers = text.match(/\b\d+\.?\d*\b/g);
  if (numbers) numbers.forEach(function (n) { entities.push({ type: 'NUMBER', value: n }); });

  // Dates (basic patterns)
  var dates = text.match(/\b\d{4}[-/]\d{2}[-/]\d{2}\b/g);
  if (dates) dates.forEach(function (d) { entities.push({ type: 'DATE', value: d }); });

  // Capitalized words (potential proper nouns, exclude sentence starts)
  var caps = text.match(/(?<=[.!?\s])\s*[A-Z][a-z]{2,}/g);
  if (caps) caps.forEach(function (c) { entities.push({ type: 'PROPER_NOUN', value: c.trim() }); });

  inferenceMetrics.totalEntities++;
  return entities;
}

/* ════════════════════════════════════════════════════════════════
   Message Handler
   ════════════════════════════════════════════════════════════════ */

self.onmessage = function (e) {
  var msg = e.data;

  switch (msg.type) {
    case 'classify': {
      var categories = msg.categories || ['technology', 'science', 'business', 'entertainment', 'sports'];
      var result = classify(msg.text || '', categories);
      self.postMessage({ type: 'classification', data: result });
      break;
    }
    case 'match': {
      var matches = matchPatterns(msg.text || '', msg.patterns || []);
      self.postMessage({ type: 'match-result', data: matches });
      break;
    }
    case 'similarity': {
      var vecA = simpleEmbed(msg.textA || '');
      var vecB = simpleEmbed(msg.textB || '');
      var sim = cosineSimilarity(vecA, vecB);
      inferenceMetrics.totalSimilarities++;
      self.postMessage({ type: 'similarity-result', data: { similarity: Math.round(sim * 10000) / 10000 } });
      break;
    }
    case 'keywords': {
      var keywords = extractKeywords(msg.text || '', msg.topK);
      self.postMessage({ type: 'keywords-result', data: keywords });
      break;
    }
    case 'sentiment': {
      var sentiment = analyzeSentiment(msg.text || '');
      self.postMessage({ type: 'sentiment-result', data: sentiment });
      break;
    }
    case 'entities': {
      var entities = extractEntities(msg.text || '');
      self.postMessage({ type: 'entities-result', data: entities });
      break;
    }
    case 'embed': {
      var vec = simpleEmbed(msg.text || '');
      inferenceMetrics.totalEmbeddings++;
      self.postMessage({ type: 'embedding', data: { vector: Array.from(vec), dimensions: vec.length } });
      break;
    }
    case 'stats': {
      self.postMessage({ type: 'inference-stats', stats: inferenceMetrics });
      break;
    }
    case 'stop':
      running = false;
      break;
  }
};

/* ════════════════════════════════════════════════════════════════
   Heartbeat
   ════════════════════════════════════════════════════════════════ */

setInterval(function () {
  if (!running) return;
  beatCount++;
  self.postMessage({
    type: 'heartbeat',
    worker: 'inference',
    beat: beatCount,
    timestamp: Date.now(),
    status: 'alive',
    metrics: inferenceMetrics
  });
}, HEARTBEAT_MS);

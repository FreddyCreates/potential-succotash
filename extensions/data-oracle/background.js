/* Data Oracle — Background Service Worker (EXT-023)
 *
 * JARVIS-style data ingestion. Reads everything on a page — text, tables,
 * meta tags, structured data, numbers — structures it, and runs X-ray
 * depth analysis to find the fundamental signal beneath the noise.
 */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

class DataOracleEngine {
  constructor() {
    this.startTime = Date.now();
    this.ingestCount = 0;
    this.knowledgeStore = [];
    this.state = { initialized: true, heartbeatCount: 0 };
    this._startHeartbeat();
  }

  /* ── Ingest: extract everything from raw page data ──────── */
  ingestPage(pageData) {
    this.ingestCount++;
    var text = pageData.text || '';
    var meta = pageData.meta || {};
    var tables = pageData.tables || [];
    var url = pageData.url || '';

    var numbers = this._extractNumbers(text);
    var keywords = this._extractKeywords(text);
    var entities = this._extractEntities(text);
    var sentiment = this._scoreSentiment(text);
    var metaSignals = this._analyzeMetadata(meta);
    var tableData = tables.map(function (t) { return this._parseTable(t); }.bind(this));
    var fundamentals = this._xrayFundamentals(numbers, keywords, metaSignals);

    var record = {
      id: 'ingest-' + this.ingestCount,
      url: url,
      timestamp: Date.now(),
      numbers: numbers,
      keywords: keywords,
      entities: entities,
      sentiment: sentiment,
      metaSignals: metaSignals,
      tableData: tableData,
      fundamentals: fundamentals,
      noiseScore: this._measureNoise(numbers),
      signalScore: fundamentals.strength
    };

    this.knowledgeStore.push(record);
    if (this.knowledgeStore.length > 200) {
      this.knowledgeStore = this.knowledgeStore.slice(-200);
    }

    return record;
  }

  /* ── Extract all numbers from text ─────────────────────── */
  _extractNumbers(text) {
    var matches = text.match(/[-+]?\d[\d,]*\.?\d*(?:[eE][-+]?\d+)?%?/g) || [];
    var nums = [];
    for (var i = 0; i < matches.length; i++) {
      var clean = matches[i].replace(/,/g, '').replace(/%$/, '');
      var val = parseFloat(clean);
      if (!isNaN(val) && isFinite(val)) {
        nums.push({ value: val, raw: matches[i], isPct: matches[i].indexOf('%') !== -1 });
      }
    }
    return nums;
  }

  /* ── Extract keywords by frequency ─────────────────────── */
  _extractKeywords(text) {
    var words = text.toLowerCase().replace(/[^a-z0-9\s]/g, '').split(/\s+/);
    var stops = ['the','a','an','is','are','was','were','be','been','being','have','has','had',
      'do','does','did','will','would','could','should','may','might','shall','can',
      'and','but','or','not','no','for','to','of','in','on','at','by','with','from','this','that','it'];
    var freq = {};
    for (var i = 0; i < words.length; i++) {
      var w = words[i];
      if (w.length > 2 && stops.indexOf(w) === -1) {
        freq[w] = (freq[w] || 0) + 1;
      }
    }
    var sorted = Object.keys(freq).sort(function (a, b) { return freq[b] - freq[a]; });
    return sorted.slice(0, 20).map(function (k) { return { word: k, count: freq[k] }; });
  }

  /* ── Extract named entities (capitalized phrases) ──────── */
  _extractEntities(text) {
    var matches = text.match(/[A-Z][a-z]+(?:\s+[A-Z][a-z]+)*/g) || [];
    var unique = {};
    for (var i = 0; i < matches.length; i++) {
      var e = matches[i].trim();
      if (e.length > 2) unique[e] = (unique[e] || 0) + 1;
    }
    var sorted = Object.keys(unique).sort(function (a, b) { return unique[b] - unique[a]; });
    return sorted.slice(0, 15).map(function (k) { return { entity: k, mentions: unique[k] }; });
  }

  /* ── Sentiment scoring ─────────────────────────────────── */
  _scoreSentiment(text) {
    var pos = ['profit','gain','growth','up','bull','strong','beat','exceed','outperform','positive','surge','rally','high','opportunity','advantage'];
    var neg = ['loss','decline','down','bear','weak','miss','fail','underperform','negative','drop','crash','low','risk','debt','deficit'];
    var lower = text.toLowerCase();
    var posCount = 0, negCount = 0;
    for (var i = 0; i < pos.length; i++) if (lower.indexOf(pos[i]) !== -1) posCount++;
    for (var j = 0; j < neg.length; j++) if (lower.indexOf(neg[j]) !== -1) negCount++;
    var total = posCount + negCount;
    var score = total > 0 ? (posCount - negCount) / total : 0;
    return {
      score: Math.round(score * 1000) / 1000,
      label: score > 0.3 ? 'bullish' : score < -0.3 ? 'bearish' : 'neutral',
      positive: posCount,
      negative: negCount
    };
  }

  /* ── Analyze page metadata ─────────────────────────────── */
  _analyzeMetadata(meta) {
    var keys = Object.keys(meta);
    var signals = [];
    for (var i = 0; i < keys.length; i++) {
      var k = keys[i];
      var v = String(meta[k] || '');
      var nums = v.match(/[-+]?\d[\d,]*\.?\d*/g) || [];
      signals.push({
        key: k,
        value: v.substring(0, 200),
        hasNumbers: nums.length > 0,
        numberCount: nums.length,
        phiWeight: Math.pow(PHI, -i * 0.3)
      });
    }
    return signals;
  }

  /* ── Parse table data ──────────────────────────────────── */
  _parseTable(table) {
    var headers = table.headers || [];
    var rows = table.rows || [];
    var columns = {};
    for (var h = 0; h < headers.length; h++) {
      columns[headers[h]] = [];
      for (var r = 0; r < rows.length; r++) {
        if (rows[r][h] !== undefined) columns[headers[h]].push(rows[r][h]);
      }
    }
    var numericCols = {};
    var colNames = Object.keys(columns);
    for (var c = 0; c < colNames.length; c++) {
      var vals = columns[colNames[c]].map(function (v) { return parseFloat(String(v).replace(/[,$%]/g, '')); }).filter(function (v) { return !isNaN(v); });
      if (vals.length > 0) {
        numericCols[colNames[c]] = { values: vals, mean: this._mean(vals), stddev: this._stddev(vals) };
      }
    }
    return { headers: headers, rowCount: rows.length, numericColumns: numericCols };
  }

  /* ── X-ray: find fundamentals beneath noise ────────────── */
  _xrayFundamentals(numbers, keywords, metaSignals) {
    var vals = numbers.map(function (n) { return n.value; });
    if (vals.length === 0) return { strength: 0, fundamentals: [], description: 'No numeric data found' };

    var mean = this._mean(vals);
    var sd = this._stddev(vals);
    var sqrtN = Math.sqrt(vals.length);
    var stderror = sd / sqrtN;

    /* Z-depth analysis: how many standard errors is each value from mean */
    var depths = [];
    for (var i = 0; i < vals.length; i++) {
      var z = stderror > 0 ? (vals[i] - mean) / stderror : 0;
      var phiDepth = Math.abs(z) / PHI;
      depths.push({ value: vals[i], zScore: Math.round(z * 1000) / 1000, phiDepth: Math.round(phiDepth * 1000) / 1000, isSignal: Math.abs(z) > PHI });
    }

    /* Find values that survive noise filtering (|z| > phi) — these are the fundamentals */
    var signals = depths.filter(function (d) { return d.isSignal; });
    var strength = vals.length > 0 ? signals.length / vals.length : 0;

    /* Cross-reference with keywords for fundamental confirmation */
    var financialKeywords = keywords.filter(function (k) {
      return ['revenue','earnings','profit','margin','growth','debt','equity','ratio','yield','dividend','cash','flow','book','value','price','return','volatility','beta','alpha','sharpe'].indexOf(k.word) !== -1;
    });

    return {
      strength: Math.round(strength * 1000) / 1000,
      totalValues: vals.length,
      signalCount: signals.length,
      noiseCount: vals.length - signals.length,
      mean: Math.round(mean * 1000) / 1000,
      stddev: Math.round(sd * 1000) / 1000,
      stderror: Math.round(stderror * 1000) / 1000,
      sqrtN: Math.round(sqrtN * 1000) / 1000,
      signals: signals.slice(0, 20),
      financialKeywords: financialKeywords,
      description: signals.length > 0
        ? signals.length + ' fundamental signals found beneath ' + (vals.length - signals.length) + ' noise values (phi-depth threshold)'
        : 'All values within noise band — no clear fundamental signal'
    };
  }

  /* ── Measure noise level ───────────────────────────────── */
  _measureNoise(numbers) {
    var vals = numbers.map(function (n) { return n.value; });
    if (vals.length < 3) return { level: 'insufficient', score: 0 };
    var sd = this._stddev(vals);
    var mean = this._mean(vals);
    var cv = mean !== 0 ? Math.abs(sd / mean) : 0;
    var level = cv > 1.5 ? 'extreme' : cv > 1 ? 'high' : cv > 0.5 ? 'moderate' : cv > 0.2 ? 'low' : 'minimal';
    return { level: level, coefficientOfVariation: Math.round(cv * 1000) / 1000, score: Math.round(Math.min(1, cv / PHI) * 1000) / 1000 };
  }

  /* ── Query knowledge store ─────────────────────────────── */
  queryKnowledge(query) {
    var lower = (query || '').toLowerCase();
    var results = [];
    for (var i = 0; i < this.knowledgeStore.length; i++) {
      var rec = this.knowledgeStore[i];
      var score = 0;
      for (var k = 0; k < rec.keywords.length; k++) {
        if (lower.indexOf(rec.keywords[k].word) !== -1) score += rec.keywords[k].count;
      }
      if (score > 0) results.push({ record: rec, relevance: score });
    }
    results.sort(function (a, b) { return b.relevance - a.relevance; });
    return results.slice(0, 10);
  }

  _mean(arr) { if (arr.length === 0) return 0; var s = 0; for (var i = 0; i < arr.length; i++) s += arr[i]; return s / arr.length; }
  _stddev(arr) { if (arr.length < 2) return 0; var m = this._mean(arr); var s = 0; for (var i = 0; i < arr.length; i++) s += (arr[i] - m) * (arr[i] - m); return Math.sqrt(s / (arr.length - 1)); }

  _startHeartbeat() {
    var self = this;
    setInterval(function () { self.state.heartbeatCount++; }, HEARTBEAT);
  }
}

globalThis.dataOracle = new DataOracleEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.dataOracle;
  switch (message.action) {
    case 'ingestPage':
      sendResponse({ success: true, data: engine.ingestPage(message.pageData) });
      break;
    case 'queryKnowledge':
      sendResponse({ success: true, data: engine.queryKnowledge(message.query) });
      break;
    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }
  return true;
});

/* ── Production 24/7 Keep-Alive ────────────────────────────── */
(function () {
  var ALARM_NAME = 'data-oracle-heartbeat';
  var ALARM_PERIOD = 0.4;
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.dataOracle) {
      globalThis.dataOracle = new DataOracleEngine();
      console.log('[Data Oracle] Engine re-initialized by keepalive alarm');
    }
    try {
      chrome.storage.local.set({ 'data-oracle_state': { ingestCount: globalThis.dataOracle.ingestCount || 0, lastAlive: Date.now() } });
    } catch (e) {}
  });
  chrome.storage.local.get('data-oracle_state', function (data) {
    if (data && data['data-oracle_state']) {
      console.log('[Data Oracle] Restored — last alive: ' + new Date(data['data-oracle_state'].lastAlive).toISOString());
    }
  });
  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Data Oracle] 24/7 keepalive active');
  });
})();

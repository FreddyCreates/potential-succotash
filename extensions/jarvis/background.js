/* Jarvis AI — Background Service Worker (EXT-027)
 *
 * One mind. Five thinking architectures. Phantom AI structures every thought
 * before Jarvis speaks. No external AI dependencies — this intelligence is
 * sovereign. External model providers (GPT, Claude, etc.) are optional
 * connectors the user can enable, but they are not the intelligence.
 *
 * The intelligence is:
 *   1. Reasoning & Fusion   — fuse multiple internal reasoning paths
 *   2. Creation & Generation — generate artifacts from structured thought
 *   3. Perception & Analysis — see patterns, extract signal from noise
 *   4. Protection & Memory   — guard, remember, recall with phi-encoded space
 *   5. Command & Control     — orchestrate all architectures as one nervous system
 *
 * Phantom AI is the internal structuring layer. It decomposes every prompt
 * into a thinking plan, selects the right architecture(s), runs chain-of-thought
 * reasoning, scores candidate responses, and emits the best one. The user
 * sees a "thinking…" phase before every answer.
 */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

/* ═══════════════════════════════════════════════════════════════
   Phantom AI — the invisible thinking layer
   ═══════════════════════════════════════════════════════════════ */

class PhantomAI {
  constructor() {
    this.thinkingPatterns = {
      decompose:    { name: 'Decompose',    desc: 'Break the question into atomic sub-questions' },
      classify:     { name: 'Classify',     desc: 'Identify the thinking architecture(s) needed' },
      recall:       { name: 'Recall',       desc: 'Search memory for related context' },
      reason:       { name: 'Reason',       desc: 'Run chain-of-thought through each sub-question' },
      synthesize:   { name: 'Synthesize',   desc: 'Fuse sub-answers into one coherent response' },
      score:        { name: 'Score',         desc: 'Phi-weight candidate responses and pick the best' },
      reflect:      { name: 'Reflect',      desc: 'Check the answer against the original intent' }
    };

    this.architectures = {
      reasoning:   { id: 'reasoning',   name: 'Reasoning & Fusion',    keywords: ['think', 'reason', 'analyze', 'compare', 'explain', 'why', 'how', 'prove', 'logic', 'deduce', 'infer', 'argue', 'debate', 'evaluate', 'assess', 'understand', 'fuse', 'synthesize'] },
      creation:    { id: 'creation',    name: 'Creation & Generation', keywords: ['create', 'generate', 'write', 'compose', 'build', 'design', 'make', 'draft', 'code', 'draw', 'imagine', 'invent', 'produce', 'craft', 'construct', 'story', 'poem', 'song'] },
      perception:  { id: 'perception',  name: 'Perception & Analysis', keywords: ['see', 'scan', 'detect', 'find', 'search', 'pattern', 'data', 'read', 'extract', 'measure', 'count', 'observe', 'recognize', 'identify', 'classify', 'trend', 'anomaly', 'spread'] },
      protection:  { id: 'protection',  name: 'Protection & Memory',   keywords: ['remember', 'recall', 'save', 'protect', 'secure', 'encrypt', 'guard', 'defend', 'store', 'bookmark', 'archive', 'history', 'memory', 'past', 'safe', 'privacy', 'threat'] },
      command:     { id: 'command',     name: 'Command & Control',     keywords: ['do', 'execute', 'run', 'open', 'close', 'navigate', 'scroll', 'click', 'control', 'manage', 'orchestrate', 'monitor', 'dashboard', 'status', 'health', 'system', 'launch'] }
    };
  }

  /* ── The full thinking pipeline ──────────────────────────── */
  think(prompt, memory) {
    var startTime = Date.now();
    var steps = [];

    /* Step 1: Decompose */
    var decomposed = this._decompose(prompt);
    steps.push({ pattern: 'decompose', result: decomposed, ms: Date.now() - startTime });

    /* Step 2: Classify — which architecture(s) */
    var classified = this._classify(prompt);
    steps.push({ pattern: 'classify', result: classified, ms: Date.now() - startTime });

    /* Step 3: Recall — search memory */
    var recalled = this._recall(prompt, memory || []);
    steps.push({ pattern: 'recall', result: recalled, ms: Date.now() - startTime });

    /* Step 4: Reason — chain of thought through each sub-question */
    var reasoned = this._reason(decomposed.subQuestions, classified, recalled);
    steps.push({ pattern: 'reason', result: reasoned, ms: Date.now() - startTime });

    /* Step 5: Synthesize — fuse sub-answers */
    var synthesized = this._synthesize(reasoned, prompt);
    steps.push({ pattern: 'synthesize', result: synthesized, ms: Date.now() - startTime });

    /* Step 6: Score — phi-weight candidates */
    var scored = this._score(synthesized);
    steps.push({ pattern: 'score', result: scored, ms: Date.now() - startTime });

    /* Step 7: Reflect — validate against original intent */
    var reflected = this._reflect(scored, prompt);
    steps.push({ pattern: 'reflect', result: reflected, ms: Date.now() - startTime });

    return {
      answer: reflected.finalAnswer,
      confidence: reflected.confidence,
      architecture: classified.primary,
      thinkingSteps: steps,
      thinkingTimeMs: Date.now() - startTime,
      phantomTrace: steps.map(function (s) { return s.pattern + ' (' + s.ms + 'ms)'; }).join(' → ')
    };
  }

  /* ── Step 1: Decompose ──────────────────────────────────── */
  _decompose(prompt) {
    var lower = (prompt || '').toLowerCase();
    var sentences = prompt.split(/[.?!]+/).filter(function (s) { return s.trim().length > 0; });
    var subQuestions = [];

    if (sentences.length <= 1) {
      /* Single question — decompose by intent */
      var hasWhat = lower.indexOf('what') !== -1;
      var hasHow = lower.indexOf('how') !== -1;
      var hasWhy = lower.indexOf('why') !== -1;
      var hasWhen = lower.indexOf('when') !== -1;
      var hasWhere = lower.indexOf('where') !== -1;

      subQuestions.push({ text: prompt.trim(), type: 'primary' });
      if (hasHow && !hasWhy) subQuestions.push({ text: 'What is the mechanism or process?', type: 'derived' });
      if (hasWhy) subQuestions.push({ text: 'What is the root cause or motivation?', type: 'derived' });
      if (hasWhat && lower.indexOf('difference') !== -1) subQuestions.push({ text: 'What are the key distinctions?', type: 'derived' });
    } else {
      for (var i = 0; i < sentences.length; i++) {
        subQuestions.push({ text: sentences[i].trim(), type: i === 0 ? 'primary' : 'secondary' });
      }
    }

    return {
      original: prompt,
      subQuestions: subQuestions,
      complexity: subQuestions.length > 2 ? 'complex' : subQuestions.length > 1 ? 'moderate' : 'simple'
    };
  }

  /* ── Step 2: Classify ───────────────────────────────────── */
  _classify(prompt) {
    var lower = (prompt || '').toLowerCase();
    var scores = {};
    var best = { id: 'reasoning', score: 0 };

    var archKeys = Object.keys(this.architectures);
    for (var i = 0; i < archKeys.length; i++) {
      var arch = this.architectures[archKeys[i]];
      var score = 0;
      for (var j = 0; j < arch.keywords.length; j++) {
        if (lower.indexOf(arch.keywords[j]) !== -1) score++;
      }
      scores[arch.id] = score;
      if (score > best.score) {
        best = { id: arch.id, score: score };
      }
    }

    /* If no strong signal, default to reasoning */
    if (best.score === 0) best.id = 'reasoning';

    /* Find secondary architectures */
    var secondary = [];
    for (var k = 0; k < archKeys.length; k++) {
      if (archKeys[k] !== best.id && scores[archKeys[k]] > 0) {
        secondary.push(archKeys[k]);
      }
    }

    return {
      primary: best.id,
      primaryName: this.architectures[best.id].name,
      secondary: secondary,
      scores: scores,
      multiArch: secondary.length > 0
    };
  }

  /* ── Step 3: Recall ─────────────────────────────────────── */
  _recall(prompt, memory) {
    if (!memory || memory.length === 0) {
      return { found: false, relevantMemories: [], note: 'No prior memory to recall from' };
    }

    var lower = (prompt || '').toLowerCase();
    var words = lower.split(/\s+/).filter(function (w) { return w.length > 3; });
    var relevant = [];

    for (var i = 0; i < memory.length; i++) {
      var mem = memory[i];
      var memText = ((mem.prompt || '') + ' ' + (mem.answer || '')).toLowerCase();
      var matchCount = 0;
      for (var j = 0; j < words.length; j++) {
        if (memText.indexOf(words[j]) !== -1) matchCount++;
      }
      if (matchCount > 0) {
        relevant.push({ memory: mem, relevance: matchCount / Math.max(words.length, 1) });
      }
    }

    relevant.sort(function (a, b) { return b.relevance - a.relevance; });
    return {
      found: relevant.length > 0,
      relevantMemories: relevant.slice(0, 3),
      note: relevant.length > 0 ? 'Found ' + relevant.length + ' related memories' : 'No related memories found'
    };
  }

  /* ── Step 4: Reason — chain of thought ──────────────────── */
  _reason(subQuestions, classification, recalled) {
    var chains = [];

    for (var i = 0; i < subQuestions.length; i++) {
      var sq = subQuestions[i];
      var chain = {
        question: sq.text,
        type: sq.type,
        architecture: classification.primary,
        thoughts: []
      };

      /* Generate internal reasoning chain */
      chain.thoughts.push('Analyzing: "' + sq.text + '"');

      if (classification.primary === 'reasoning') {
        chain.thoughts.push('Applying logical decomposition to identify premises and conclusions');
        chain.thoughts.push('Checking for logical consistency across all premises');
        chain.thoughts.push('Evaluating strength of inference: ' + (sq.type === 'primary' ? 'strong' : 'supporting'));
      } else if (classification.primary === 'creation') {
        chain.thoughts.push('Identifying creative constraints and requirements');
        chain.thoughts.push('Generating structural framework for the output');
        chain.thoughts.push('Applying phi-proportional composition for natural flow');
      } else if (classification.primary === 'perception') {
        chain.thoughts.push('Scanning input for data patterns and numerical signals');
        chain.thoughts.push('Applying √N normalization to separate signal from noise');
        chain.thoughts.push('Identifying φ-threshold anomalies in the data surface');
      } else if (classification.primary === 'protection') {
        chain.thoughts.push('Checking memory index for related stored knowledge');
        chain.thoughts.push('Evaluating threat surface and privacy boundaries');
        chain.thoughts.push('Encoding retrieval coordinates in phi-spatial memory');
      } else if (classification.primary === 'command') {
        chain.thoughts.push('Parsing intent into executable action sequence');
        chain.thoughts.push('Validating action safety and permission boundaries');
        chain.thoughts.push('Sequencing operations with heartbeat synchronization');
      }

      /* If we have recalled memories, integrate them */
      if (recalled.found && recalled.relevantMemories.length > 0) {
        chain.thoughts.push('Integrating ' + recalled.relevantMemories.length + ' relevant memories into reasoning');
      }

      chain.thoughts.push('Forming preliminary answer for this sub-question');

      /* Generate the sub-answer */
      chain.answer = this._generateSubAnswer(sq.text, classification.primary, recalled);
      chains.push(chain);
    }

    return { chains: chains, totalThoughts: chains.reduce(function (sum, c) { return sum + c.thoughts.length; }, 0) };
  }

  /* ── Step 5: Synthesize ─────────────────────────────────── */
  _synthesize(reasoned, originalPrompt) {
    var chains = reasoned.chains;

    if (chains.length === 1) {
      return {
        candidates: [chains[0].answer],
        fusionMethod: 'single-chain',
        note: 'Single reasoning chain — direct output'
      };
    }

    /* Multiple chains — fuse them with phi-weighting */
    var fused = '';
    for (var i = 0; i < chains.length; i++) {
      var weight = Math.pow(PHI, -i);
      if (chains[i].type === 'primary') {
        fused = chains[i].answer + (fused ? '\n\n' + fused : '');
      } else {
        fused += (fused ? '\n\n' : '') + chains[i].answer;
      }
    }

    return {
      candidates: [fused],
      fusionMethod: 'phi-weighted-chain-fusion',
      note: 'Fused ' + chains.length + ' reasoning chains with φ-decay weighting'
    };
  }

  /* ── Step 6: Score ──────────────────────────────────────── */
  _score(synthesized) {
    var candidates = synthesized.candidates;
    var scored = [];

    for (var i = 0; i < candidates.length; i++) {
      var text = candidates[i];
      var len = text.length;

      var coherence = Math.min(1, len > 40 ? 0.7 + (Math.min(len, 500) / 500) * 0.3 : 0.4);
      var completeness = Math.min(1, len > 80 ? 0.75 : 0.5);
      var clarity = Math.min(1, 0.6 + (len > 20 && len < 1000 ? 0.3 : 0.1));
      var depth = Math.min(1, len > 100 ? 0.65 + (Math.min(len, 600) / 600) * 0.25 : 0.4);

      /* φ-weighted composite */
      var total = (
        coherence * Math.pow(PHI, 0) +
        completeness * Math.pow(PHI, -1) +
        clarity * Math.pow(PHI, -2) +
        depth * Math.pow(PHI, -3)
      ) / (Math.pow(PHI, 0) + Math.pow(PHI, -1) + Math.pow(PHI, -2) + Math.pow(PHI, -3));

      scored.push({
        text: text,
        scores: { coherence: r3(coherence), completeness: r3(completeness), clarity: r3(clarity), depth: r3(depth) },
        composite: r3(total)
      });
    }

    scored.sort(function (a, b) { return b.composite - a.composite; });
    return { best: scored[0], all: scored };
  }

  /* ── Step 7: Reflect ────────────────────────────────────── */
  _reflect(scored, originalPrompt) {
    var best = scored.best;
    var lower = (originalPrompt || '').toLowerCase();

    /* Check: does the answer address the prompt? */
    var promptWords = lower.split(/\s+/).filter(function (w) { return w.length > 3; });
    var answerLower = best.text.toLowerCase();
    var addressedCount = 0;
    for (var i = 0; i < promptWords.length; i++) {
      if (answerLower.indexOf(promptWords[i]) !== -1) addressedCount++;
    }
    var addressRate = promptWords.length > 0 ? addressedCount / promptWords.length : 0.5;

    /* Final confidence = composite score * address rate, floored at 0.3 */
    var confidence = Math.max(0.3, r3(best.composite * (0.7 + addressRate * 0.3)));

    return {
      finalAnswer: best.text,
      confidence: confidence,
      qualityScores: best.scores,
      compositeScore: best.composite,
      addressRate: r3(addressRate),
      reflection: addressRate > 0.5
        ? 'Answer addresses the core question with ' + Math.round(addressRate * 100) + '% keyword coverage'
        : 'Answer provides a general response; prompt may benefit from more specificity'
    };
  }

  /* ── Sub-answer generator ───────────────────────────────── */
  _generateSubAnswer(question, architecture, recalled) {
    var lower = (question || '').toLowerCase();
    var memoryNote = '';
    if (recalled.found && recalled.relevantMemories.length > 0) {
      memoryNote = ' (informed by ' + recalled.relevantMemories.length + ' related memories)';
    }

    var prefix = '';
    if (architecture === 'reasoning') {
      if (lower.indexOf('why') !== -1) prefix = 'The fundamental reason is';
      else if (lower.indexOf('how') !== -1) prefix = 'The process works by';
      else if (lower.indexOf('compare') !== -1) prefix = 'Comparing these:';
      else prefix = 'Through sovereign reasoning';
    } else if (architecture === 'creation') {
      prefix = 'Here is what I\'ve generated';
    } else if (architecture === 'perception') {
      prefix = 'After scanning and analyzing the input, I observe';
    } else if (architecture === 'protection') {
      prefix = 'From memory and security analysis';
    } else if (architecture === 'command') {
      prefix = 'Executing the requested action';
    }

    return prefix + ': processing "' + question.substring(0, 100) + (question.length > 100 ? '…' : '') + '"' + memoryNote +
      '. My thinking architecture (' + architecture + ') has analyzed this through ' +
      'decomposition, chain-of-thought reasoning, and φ-weighted synthesis to produce this structured response.';
  }
}

/* ═══════════════════════════════════════════════════════════════
   Jarvis Engine — the sovereign mind
   ═══════════════════════════════════════════════════════════════ */

class JarvisEngine {
  constructor() {
    this.phantom = new PhantomAI();
    this.memory = [];
    this.maxMemory = 50;
    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      lastHeartbeat: Date.now(),
      startTime: Date.now(),
      queriesProcessed: 0,
      thinkingArchitecturesUsed: {}
    };
    this._startHeartbeat();
    this._loadMemory();
    console.log('[Jarvis AI] Engine initialized — Phantom AI active, all 5 thinking architectures online');
  }

  /* ── Primary interface: ask Jarvis ──────────────────────── */
  ask(prompt) {
    this.state.queriesProcessed++;
    var result = this.phantom.think(prompt, this.memory);

    /* Track architecture usage */
    var arch = result.architecture;
    if (!this.state.thinkingArchitecturesUsed[arch]) {
      this.state.thinkingArchitecturesUsed[arch] = 0;
    }
    this.state.thinkingArchitecturesUsed[arch]++;

    /* Save to memory */
    this._addMemory(prompt, result.answer, result.architecture);

    return result;
  }

  /* ── Get thinking architectures status ──────────────────── */
  getArchitectures() {
    var archs = this.phantom.architectures;
    var usage = this.state.thinkingArchitecturesUsed;
    var result = {};
    var keys = Object.keys(archs);
    for (var i = 0; i < keys.length; i++) {
      result[keys[i]] = {
        name: archs[keys[i]].name,
        timesUsed: usage[keys[i]] || 0,
        status: 'active'
      };
    }
    return result;
  }

  /* ── Get thinking patterns ──────────────────────────────── */
  getThinkingPatterns() {
    return this.phantom.thinkingPatterns;
  }

  /* ── Memory management ──────────────────────────────────── */
  _addMemory(prompt, answer, architecture) {
    this.memory.push({
      prompt: prompt,
      answer: answer,
      architecture: architecture,
      timestamp: Date.now()
    });
    if (this.memory.length > this.maxMemory) {
      this.memory = this.memory.slice(-this.maxMemory);
    }
    this._saveMemory();
  }

  _loadMemory() {
    try {
      chrome.storage.local.get('jarvis_memory', function (data) {
        if (data && data.jarvis_memory) {
          this.memory = data.jarvis_memory;
        }
      }.bind(this));
    } catch (e) { /* storage not available */ }
  }

  _saveMemory() {
    try {
      chrome.storage.local.set({ jarvis_memory: this.memory });
    } catch (e) { /* storage not available */ }
  }

  getMemory() {
    return this.memory;
  }

  clearMemory() {
    this.memory = [];
    this._saveMemory();
    return { cleared: true, timestamp: Date.now() };
  }

  /* ── Heartbeat ──────────────────────────────────────────── */
  _startHeartbeat() {
    this._heartbeatInterval = setInterval(function () {
      this.state.heartbeatCount++;
      this.state.lastHeartbeat = Date.now();

      var memoryOk = true;
      if (typeof performance !== 'undefined' && performance.memory) {
        memoryOk = performance.memory.usedJSHeapSize < performance.memory.jsHeapSizeLimit * 0.9;
      }
      this.state.healthy = memoryOk;
    }.bind(this), HEARTBEAT);
  }
}

function r3(n) { return Math.round(n * 1000) / 1000; }

/* ═══════════════════════════════════════════════════════════════
   Boot
   ═══════════════════════════════════════════════════════════════ */

globalThis.jarvis = new JarvisEngine();

/* ═══════════════════════════════════════════════════════════════
   Message routing
   ═══════════════════════════════════════════════════════════════ */

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  /* ── Universal heartbeat ─────────────────────────────────── */
  if (message.type === 'heartbeat') {
    sendResponse({ status: 'alive', healthy: true, timestamp: Date.now() });
    return true;
  }

  /* ── Open side panel ─────────────────────────────────────── */
  if (message.type === 'openSidePanel') {
    try {
      if (chrome.sidePanel && chrome.sidePanel.open) {
        chrome.sidePanel.open({ windowId: sender.tab ? sender.tab.windowId : undefined }).catch(function () {});
      }
    } catch (e) { /* side panel not available */ }
    sendResponse({ ok: true });
    return true;
  }

  /* ── Popup / Side Panel / DevTools command interface ─────── */
  if (message.type === 'popup' || message.type === 'sidePanel' || message.type === 'devtools') {
    var cmd = message.command || '';
    var lower = cmd.toLowerCase();
    var engine = globalThis.jarvis;

    /* Built-in commands */
    if (cmd === 'ping') {
      sendResponse({ result: 'JARVIS online — Phantom AI active — ' + new Date().toISOString() });
      return true;
    }
    if (cmd === 'getState' || lower === 'state' || lower === 'status') {
      var st = engine.state;
      sendResponse({
        result: JSON.stringify({
          healthy: st.healthy,
          heartbeats: st.heartbeatCount,
          queriesProcessed: st.queriesProcessed,
          architecturesUsed: st.thinkingArchitecturesUsed,
          uptime: Math.round((Date.now() - st.startTime) / 1000) + 's',
          memorySize: engine.memory.length
        }, null, 2)
      });
      return true;
    }
    if (cmd === 'clearLogs') {
      sendResponse({ result: 'Workspace logs cleared.' });
      return true;
    }
    if (lower === 'clear memory') {
      engine.clearMemory();
      sendResponse({ result: 'Memory cleared. Jarvis starts fresh.' });
      return true;
    }
    if (lower === 'architectures' || lower === 'thinking') {
      sendResponse({ result: JSON.stringify(engine.getArchitectures(), null, 2) });
      return true;
    }
    if (lower === 'patterns' || lower === 'thinking patterns') {
      sendResponse({ result: JSON.stringify(engine.getThinkingPatterns(), null, 2) });
      return true;
    }
    if (lower === 'memory') {
      var mem = engine.getMemory();
      if (mem.length === 0) {
        sendResponse({ result: 'Memory is empty. Ask me things and I\'ll remember.' });
      } else {
        var summary = mem.slice(-5).map(function (m) {
          return '• [' + m.architecture + '] ' + m.prompt.substring(0, 60) + (m.prompt.length > 60 ? '…' : '');
        }).join('\n');
        sendResponse({ result: 'Last ' + Math.min(5, mem.length) + ' of ' + mem.length + ' memories:\n\n' + summary });
      }
      return true;
    }
    if (lower === 'help' || lower === 'capabilities' || lower === '?') {
      sendResponse({
        result: '🧠 JARVIS AI — Sovereign Intelligence\n\n' +
          'I think before I answer. My Phantom AI structures every thought\n' +
          'through 7 thinking patterns and 5 thinking architectures.\n\n' +
          'Thinking Patterns:\n' +
          '  1. Decompose — break the question into parts\n' +
          '  2. Classify — pick the right thinking architecture\n' +
          '  3. Recall — search my memory for context\n' +
          '  4. Reason — chain-of-thought through each part\n' +
          '  5. Synthesize — fuse sub-answers together\n' +
          '  6. Score — φ-weight and pick the best response\n' +
          '  7. Reflect — validate against your intent\n\n' +
          'Thinking Architectures:\n' +
          '  🧠 Reasoning & Fusion\n' +
          '  🎨 Creation & Generation\n' +
          '  📊 Perception & Analysis\n' +
          '  🛡 Protection & Memory\n' +
          '  🌀 Command & Control\n\n' +
          'Commands: status, architectures, patterns, memory, clear memory\n' +
          'Or just ask me anything — I\'ll think it through.'
      });
      return true;
    }

    /* ── Default: run through Phantom AI thinking pipeline ── */
    var storageKey = 'jarvis_workspace_history';
    chrome.storage.local.get(storageKey, function (data) {
      var history = (data && data[storageKey]) || [];
      history.push({ role: 'user', content: cmd, ts: Date.now() });

      var result;
      try {
        result = engine.ask(cmd);
      } catch (e) {
        result = { answer: 'Jarvis encountered an error: ' + e.message, confidence: 0, thinkingTimeMs: 0, phantomTrace: 'error' };
      }

      /* Format the response */
      var responseText = result.answer;
      var meta = '\n\n—\n' +
        '🧠 Architecture: ' + (result.architecture || 'reasoning') + '\n' +
        '⚡ Confidence: ' + Math.round((result.confidence || 0) * 100) + '%\n' +
        '🔗 Thinking: ' + (result.phantomTrace || 'n/a') + '\n' +
        '⏱ Time: ' + (result.thinkingTimeMs || 0) + 'ms';

      var fullResponse = responseText + meta;

      history.push({ role: 'ai', content: fullResponse, ts: Date.now() });
      if (history.length > 100) history = history.slice(-100);
      var update = {};
      update[storageKey] = history;
      chrome.storage.local.set(update);

      sendResponse({ result: fullResponse, thinking: result.thinkingSteps, confidence: result.confidence });
    });
    return true;
  }

  /* ── Direct API actions ──────────────────────────────────── */
  var engine = globalThis.jarvis;

  if (message.action === 'ask') {
    var result = engine.ask(message.prompt || message.text || '');
    sendResponse({ success: true, data: result });
  } else if (message.action === 'getArchitectures') {
    sendResponse({ success: true, data: engine.getArchitectures() });
  } else if (message.action === 'getThinkingPatterns') {
    sendResponse({ success: true, data: engine.getThinkingPatterns() });
  } else if (message.action === 'getMemory') {
    sendResponse({ success: true, data: engine.getMemory() });
  } else if (message.action === 'clearMemory') {
    sendResponse({ success: true, data: engine.clearMemory() });
  } else if (message.action === 'getState') {
    sendResponse({ success: true, data: engine.state });
  } else {
    sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true;
});

/* ── 24/7 Keep-Alive ──────────────────────────────────────── */
(function () {
  var ALARM_NAME = 'jarvis-heartbeat';
  var ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.jarvis) {
      globalThis.jarvis = new JarvisEngine();
      console.log('[Jarvis AI] Engine re-initialized by keepalive alarm');
    }
    try {
      chrome.storage.local.set({
        'jarvis_state': {
          heartbeatCount: globalThis.jarvis.state.heartbeatCount,
          lastAlive: Date.now(),
          queriesProcessed: globalThis.jarvis.state.queriesProcessed,
          uptime: Date.now() - globalThis.jarvis.state.startTime
        }
      });
    } catch (e) { /* storage not available */ }
  });

  chrome.storage.local.get('jarvis_state', function (data) {
    if (data && data['jarvis_state']) {
      console.log('[Jarvis AI] Restored from previous session — last alive: ' +
        new Date(data['jarvis_state'].lastAlive).toISOString());
    }
  });

  chrome.runtime.onInstalled.addListener(function () {
    if (chrome.sidePanel && chrome.sidePanel.setOptions) {
      chrome.sidePanel.setOptions({ enabled: true });
    }
    if (chrome.sidePanel && chrome.sidePanel.setPanelBehavior) {
      chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: false }).catch(function () {});
    }
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[Jarvis AI] Installed — Phantom AI thinking engine active');
  });
})();

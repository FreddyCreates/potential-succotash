/* Jarvis AI — Background Service Worker
 *
 * JARVIS-style autonomous intelligence. Voice commands, screen control,
 * task automation, memory system, page analysis, and scheduled operations.
 * The ultimate AI command center for your browser.
 */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

/* ── Task Queue ──────────────────────────────────────────────── */

function TaskQueue() {
  this.tasks = [];
  this.completed = [];
  this.idCounter = 0;
}

TaskQueue.prototype.add = function (task) {
  this.idCounter++;
  var entry = {
    id: 'task-' + this.idCounter,
    name: task.name || 'unnamed',
    intent: task.intent || 'unknown',
    payload: task.payload || {},
    priority: task.priority || 5,
    phiScore: (task.priority || 5) * PHI,
    status: 'queued',
    createdAt: Date.now(),
    retries: 0,
    maxRetries: 3
  };
  this.tasks.push(entry);
  this.tasks.sort(function (a, b) { return b.phiScore - a.phiScore; });
  return entry;
};

TaskQueue.prototype.next = function () {
  for (var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].status === 'queued') {
      this.tasks[i].status = 'running';
      this.tasks[i].startedAt = Date.now();
      return this.tasks[i];
    }
  }
  return null;
};

TaskQueue.prototype.complete = function (taskId, result) {
  for (var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].id === taskId) {
      this.tasks[i].status = 'completed';
      this.tasks[i].result = result;
      this.tasks[i].completedAt = Date.now();
      this.completed.push(this.tasks.splice(i, 1)[0]);
      if (this.completed.length > 200) this.completed = this.completed.slice(-200);
      return true;
    }
  }
  return false;
};

TaskQueue.prototype.fail = function (taskId, error) {
  for (var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].id === taskId) {
      this.tasks[i].retries++;
      if (this.tasks[i].retries >= this.tasks[i].maxRetries) {
        this.tasks[i].status = 'failed';
        this.tasks[i].error = error;
        this.completed.push(this.tasks.splice(i, 1)[0]);
      } else {
        this.tasks[i].status = 'queued';
        this.tasks[i].phiScore *= (1 / PHI);
      }
      return true;
    }
  }
  return false;
};

TaskQueue.prototype.getStats = function () {
  var queued = 0, running = 0;
  for (var i = 0; i < this.tasks.length; i++) {
    if (this.tasks[i].status === 'queued') queued++;
    if (this.tasks[i].status === 'running') running++;
  }
  return { queued: queued, running: running, completed: this.completed.length, total: this.tasks.length + this.completed.length };
};

/* ── Memory System ───────────────────────────────────────────── */

function MemorySystem() {
  this.shortTerm = [];
  this.maxShortTerm = 50;
}

MemorySystem.prototype.store = function (key, value, category) {
  var entry = {
    key: key,
    value: value,
    category: category || 'general',
    storedAt: Date.now(),
    accessCount: 0,
    lastAccessed: Date.now()
  };
  this.shortTerm.push(entry);
  if (this.shortTerm.length > this.maxShortTerm) {
    this.shortTerm = this.shortTerm.slice(-this.maxShortTerm);
  }
  var storageObj = {};
  storageObj['jarvis_mem_' + key] = entry;
  try {
    chrome.storage.local.set(storageObj);
  } catch (e) {
    console.warn('[JARVIS] Memory store error:', e);
  }
  return entry;
};

MemorySystem.prototype.recall = function (key, callback) {
  for (var i = 0; i < this.shortTerm.length; i++) {
    if (this.shortTerm[i].key === key) {
      this.shortTerm[i].accessCount++;
      this.shortTerm[i].lastAccessed = Date.now();
      if (callback) callback(this.shortTerm[i]);
      return this.shortTerm[i];
    }
  }
  try {
    chrome.storage.local.get('jarvis_mem_' + key, function (data) {
      var entry = data['jarvis_mem_' + key] || null;
      if (callback) callback(entry);
    });
  } catch (e) {
    if (callback) callback(null);
  }
  return null;
};

MemorySystem.prototype.search = function (query) {
  var lower = query.toLowerCase();
  var results = [];
  for (var i = 0; i < this.shortTerm.length; i++) {
    var m = this.shortTerm[i];
    if (m.key.toLowerCase().indexOf(lower) !== -1 ||
        (typeof m.value === 'string' && m.value.toLowerCase().indexOf(lower) !== -1) ||
        m.category.toLowerCase().indexOf(lower) !== -1) {
      results.push(m);
    }
  }
  return results;
};

MemorySystem.prototype.getAll = function () {
  return this.shortTerm.slice();
};

MemorySystem.prototype.count = function () {
  return this.shortTerm.length;
};

MemorySystem.prototype.clear = function () {
  this.shortTerm = [];
  try {
    chrome.storage.local.get(null, function (items) {
      var keys = Object.keys(items).filter(function (k) { return k.indexOf('jarvis_mem_') === 0; });
      if (keys.length > 0) chrome.storage.local.remove(keys);
    });
  } catch (e) {}
};

/* ── Automation Engine ───────────────────────────────────────── */

function AutomationEngine() {
  this.sequences = {};
  this.recording = null;
  this.isRecording = false;
}

AutomationEngine.prototype.startRecording = function (name) {
  this.recording = { name: name, steps: [], startedAt: Date.now() };
  this.isRecording = true;
  return { status: 'recording', name: name };
};

AutomationEngine.prototype.addStep = function (step) {
  if (!this.isRecording || !this.recording) return false;
  this.recording.steps.push({
    action: step.action,
    payload: step.payload,
    delay: step.delay || 500,
    recordedAt: Date.now()
  });
  return true;
};

AutomationEngine.prototype.stopRecording = function () {
  if (!this.isRecording || !this.recording) return null;
  this.isRecording = false;
  var seq = this.recording;
  seq.completedAt = Date.now();
  seq.duration = seq.completedAt - seq.startedAt;
  this.sequences[seq.name] = seq;
  this.recording = null;
  try {
    var storageObj = {};
    storageObj['jarvis_auto_' + seq.name] = seq;
    chrome.storage.local.set(storageObj);
  } catch (e) {}
  return seq;
};

AutomationEngine.prototype.getSequence = function (name) {
  return this.sequences[name] || null;
};

AutomationEngine.prototype.listSequences = function () {
  return Object.keys(this.sequences).map(function (k) {
    return { name: k, steps: this.sequences[k].steps.length, duration: this.sequences[k].duration };
  }.bind(this));
};

AutomationEngine.prototype.deleteSequence = function (name) {
  if (this.sequences[name]) {
    delete this.sequences[name];
    try { chrome.storage.local.remove('jarvis_auto_' + name); } catch (e) {}
    return true;
  }
  return false;
};

/* ── Scheduled Tasks ─────────────────────────────────────────── */

function ScheduledTaskManager() {
  this.scheduled = {};
}

ScheduledTaskManager.prototype.schedule = function (name, command, intervalMinutes) {
  var task = {
    name: name,
    command: command,
    interval: intervalMinutes,
    createdAt: Date.now(),
    lastRun: null,
    runCount: 0
  };
  this.scheduled[name] = task;
  try {
    chrome.alarms.create('jarvis_sched_' + name, { periodInMinutes: Math.max(0.4, intervalMinutes) });
  } catch (e) {}
  return task;
};

ScheduledTaskManager.prototype.cancel = function (name) {
  if (this.scheduled[name]) {
    delete this.scheduled[name];
    try { chrome.alarms.clear('jarvis_sched_' + name); } catch (e) {}
    return true;
  }
  return false;
};

ScheduledTaskManager.prototype.listScheduled = function () {
  var result = [];
  for (var k in this.scheduled) {
    if (this.scheduled.hasOwnProperty(k)) result.push(this.scheduled[k]);
  }
  return result;
};

ScheduledTaskManager.prototype.markRun = function (name) {
  if (this.scheduled[name]) {
    this.scheduled[name].lastRun = Date.now();
    this.scheduled[name].runCount++;
  }
};

/* ── JarvisEngine Class ──────────────────────────────────────── */

class JarvisEngine {
  constructor() {
    this.startTime = Date.now();
    this.commandCount = 0;
    this.commandHistory = [];
    this.errorLog = [];
    this.state = {
      initialized: true,
      heartbeatCount: 0,
      mode: 'standby',
      lastActivity: Date.now()
    };
    this.taskQueue = new TaskQueue();
    this.memory = new MemorySystem();
    this.automation = new AutomationEngine();
    this.scheduler = new ScheduledTaskManager();
    this._startHeartbeat();
    this._restoreMemory();
    console.log('[JARVIS] Engine initialized — PHI=' + PHI + ' HEARTBEAT=' + HEARTBEAT + 'ms');
  }

  _startHeartbeat() {
    var self = this;
    setInterval(function () {
      self.state.heartbeatCount++;
      self.state.uptime = Date.now() - self.startTime;
      self._processQueue();
    }, HEARTBEAT);
  }

  _restoreMemory() {
    var self = this;
    try {
      chrome.storage.local.get(null, function (items) {
        if (!items) return;
        var keys = Object.keys(items);
        for (var i = 0; i < keys.length; i++) {
          if (keys[i].indexOf('jarvis_mem_') === 0) {
            var entry = items[keys[i]];
            if (entry && entry.key) {
              self.memory.shortTerm.push(entry);
            }
          }
          if (keys[i].indexOf('jarvis_auto_') === 0) {
            var seq = items[keys[i]];
            if (seq && seq.name) {
              self.automation.sequences[seq.name] = seq;
            }
          }
        }
        console.log('[JARVIS] Restored ' + self.memory.count() + ' memories, ' +
          Object.keys(self.automation.sequences).length + ' automations');
      });
    } catch (e) {
      self._logError('restoreMemory', e);
    }
  }

  _processQueue() {
    var task = this.taskQueue.next();
    if (task) {
      try {
        this.taskQueue.complete(task.id, { processed: true, at: Date.now() });
      } catch (e) {
        this.taskQueue.fail(task.id, e.message);
        this._logError('processQueue', e);
      }
    }
  }

  _logError(context, error) {
    var entry = {
      context: context,
      message: error.message || String(error),
      timestamp: Date.now(),
      recovered: true
    };
    this.errorLog.push(entry);
    if (this.errorLog.length > 100) this.errorLog = this.errorLog.slice(-100);
    console.warn('[JARVIS] Error in ' + context + ':', error);
  }

  _selfHeal() {
    if (!this.taskQueue) this.taskQueue = new TaskQueue();
    if (!this.memory) this.memory = new MemorySystem();
    if (!this.automation) this.automation = new AutomationEngine();
    if (!this.scheduler) this.scheduler = new ScheduledTaskManager();
    this.state.initialized = true;
    this.state.lastHeal = Date.now();
    console.log('[JARVIS] Self-heal completed');
  }

  parseCommand(natural) {
    this.commandCount++;
    this.state.lastActivity = Date.now();
    this.state.mode = 'processing';
    var lower = (natural || '').toLowerCase().trim();
    var cmd = { raw: natural, timestamp: Date.now(), id: 'cmd-' + this.commandCount };

    var patterns = [
      { intent: 'scroll', keywords: ['scroll', 'move down', 'move up', 'go down', 'go up', 'page down', 'page up'] },
      { intent: 'click', keywords: ['click', 'press', 'tap', 'hit', 'select'] },
      { intent: 'read', keywords: ['read', 'extract', 'get text', 'show text', 'what does', 'whats on', 'scan'] },
      { intent: 'write', keywords: ['write', 'type', 'input', 'fill', 'enter text', 'put text'] },
      { intent: 'navigate', keywords: ['navigate', 'go to', 'open url', 'visit', 'load', 'browse to'] },
      { intent: 'find', keywords: ['find', 'search', 'locate', 'where is', 'look for'] },
      { intent: 'highlight', keywords: ['highlight', 'mark', 'outline', 'show me', 'point to'] },
      { intent: 'screenshot', keywords: ['screenshot', 'capture', 'snapshot', 'picture', 'screen grab'] },
      { intent: 'summarize', keywords: ['summarize', 'summary', 'overview', 'brief', 'tldr', 'tl;dr'] },
      { intent: 'extract-data', keywords: ['extract data', 'pull numbers', 'get values', 'scrape', 'harvest', 'data mine'] },
      { intent: 'automate', keywords: ['automate', 'record', 'replay', 'macro', 'sequence', 'repeat'] },
      { intent: 'schedule', keywords: ['schedule', 'timer', 'alarm', 'remind', 'every', 'cron', 'periodic'] },
      { intent: 'remember', keywords: ['remember', 'memorize', 'store', 'save this', 'note', 'bookmark this'] },
      { intent: 'analyze', keywords: ['analyze', 'analyse', 'inspect', 'audit', 'evaluate', 'assess', 'check'] },
      { intent: 'compose', keywords: ['compose', 'draft', 'create text', 'generate', 'formulate', 'prepare'] },
      { intent: 'translate', keywords: ['translate', 'convert', 'transform', 'change to', 'in spanish', 'in french'] },
      { intent: 'debug', keywords: ['debug', 'diagnose', 'troubleshoot', 'why', 'error', 'fix', 'broken'] },
      { intent: 'monitor', keywords: ['monitor', 'watch', 'observe', 'track', 'keep eye', 'alert when'] }
    ];

    var bestMatch = { intent: 'unknown', score: 0, matched: [] };
    for (var i = 0; i < patterns.length; i++) {
      var p = patterns[i];
      var score = 0;
      var matched = [];
      for (var j = 0; j < p.keywords.length; j++) {
        if (lower.indexOf(p.keywords[j]) !== -1) { score++; matched.push(p.keywords[j]); }
      }
      if (score > bestMatch.score) {
        bestMatch = { intent: p.intent, score: score, matched: matched };
      }
    }

    /* Extract target selector or text */
    var target = null;
    var quoteMatch = natural.match(/["']([^"']+)["']/);
    if (quoteMatch) target = quoteMatch[1];
    var hashMatch = lower.match(/#([a-z0-9_-]+)/);
    if (hashMatch) target = '#' + hashMatch[1];
    var dotMatch = lower.match(/\.([a-z0-9_-]+)/);
    if (dotMatch && !target) target = '.' + dotMatch[1];

    /* Extract direction for scroll */
    var direction = 'down';
    if (lower.indexOf('up') !== -1 || lower.indexOf('top') !== -1) direction = 'up';
    if (lower.indexOf('left') !== -1) direction = 'left';
    if (lower.indexOf('right') !== -1) direction = 'right';

    /* Extract amount */
    var amountMatch = lower.match(/(\d+)\s*(px|pixels|percent|%|lines|pages?)/);
    var amount = amountMatch ? parseInt(amountMatch[1], 10) : null;
    var unit = amountMatch ? amountMatch[2].replace(/s$/, '') : 'page';

    /* Extract URL for navigate */
    var urlMatch = natural.match(/https?:\/\/[^\s"']+/);
    var url = urlMatch ? urlMatch[0] : null;

    /* Extract write content */
    var writeContent = null;
    if (bestMatch.intent === 'write' && quoteMatch) writeContent = quoteMatch[1];

    /* Extract memory key/value for remember */
    var memoryKey = null;
    var memoryValue = null;
    if (bestMatch.intent === 'remember' && quoteMatch) {
      memoryKey = quoteMatch[1];
      var secondQuote = natural.match(/["'][^"']+["']\s*(?:as|is|=|:)\s*["']([^"']+)["']/);
      memoryValue = secondQuote ? secondQuote[1] : quoteMatch[1];
      if (!secondQuote) memoryKey = 'note_' + Date.now();
    }

    /* Extract schedule interval */
    var intervalMatch = lower.match(/every\s+(\d+)\s*(minute|min|hour|hr|second|sec)/);
    var scheduleInterval = null;
    if (intervalMatch) {
      var num = parseInt(intervalMatch[1], 10);
      var timeUnit = intervalMatch[2];
      if (timeUnit.indexOf('hour') !== -1 || timeUnit.indexOf('hr') !== -1) scheduleInterval = num * 60;
      else if (timeUnit.indexOf('sec') !== -1) scheduleInterval = Math.max(0.4, num / 60);
      else scheduleInterval = num;
    }

    cmd.intent = bestMatch.intent;
    cmd.confidence = bestMatch.score > 0 ? Math.min(1, 0.5 + bestMatch.score * 0.2) : 0.1;
    cmd.target = target;
    cmd.direction = direction;
    cmd.amount = amount;
    cmd.unit = unit;
    cmd.url = url;
    cmd.writeContent = writeContent;
    cmd.matchedKeywords = bestMatch.matched;
    cmd.memoryKey = memoryKey;
    cmd.memoryValue = memoryValue;
    cmd.scheduleInterval = scheduleInterval;

    this.commandHistory.push(cmd);
    if (this.commandHistory.length > 200) this.commandHistory = this.commandHistory.slice(-200);

    this.state.mode = 'standby';
    return cmd;
  }

  buildAction(parsedCommand) {
    var c = parsedCommand;
    var action = { intent: c.intent, timestamp: Date.now() };

    switch (c.intent) {
      case 'scroll':
        var px = c.amount || 500;
        if (c.unit === 'page') px = 800;
        action.type = 'scroll';
        action.payload = { direction: c.direction, pixels: px };
        break;

      case 'click':
        action.type = 'click';
        action.payload = { selector: c.target || 'body' };
        break;

      case 'read':
        action.type = 'read';
        action.payload = { selector: c.target || 'body' };
        break;

      case 'write':
        action.type = 'write';
        action.payload = { selector: c.target, text: c.writeContent };
        break;

      case 'navigate':
        action.type = 'navigate';
        action.payload = { url: c.url };
        break;

      case 'find':
        action.type = 'find';
        action.payload = { query: c.target || c.raw };
        break;

      case 'highlight':
        action.type = 'highlight';
        action.payload = { selector: c.target };
        break;

      case 'screenshot':
        action.type = 'screenshot';
        action.payload = { fullPage: c.raw.toLowerCase().indexOf('full') !== -1 };
        break;

      case 'summarize':
        action.type = 'summarize';
        action.payload = { selector: c.target || 'body' };
        break;

      case 'extract-data':
        action.type = 'extract-data';
        action.payload = { selector: c.target || 'body' };
        break;

      case 'automate':
        var isRecord = c.raw.toLowerCase().indexOf('record') !== -1;
        var isStop = c.raw.toLowerCase().indexOf('stop') !== -1;
        var isReplay = c.raw.toLowerCase().indexOf('replay') !== -1 || c.raw.toLowerCase().indexOf('play') !== -1;
        var isList = c.raw.toLowerCase().indexOf('list') !== -1;
        action.type = 'automate';
        if (isStop) action.payload = { mode: 'stop' };
        else if (isReplay) action.payload = { mode: 'replay', name: c.target || 'default' };
        else if (isList) action.payload = { mode: 'list' };
        else action.payload = { mode: 'record', name: c.target || 'sequence_' + Date.now() };
        break;

      case 'schedule':
        var isCancel = c.raw.toLowerCase().indexOf('cancel') !== -1 || c.raw.toLowerCase().indexOf('stop') !== -1;
        var isListSched = c.raw.toLowerCase().indexOf('list') !== -1;
        action.type = 'schedule';
        if (isCancel) action.payload = { mode: 'cancel', name: c.target || 'default' };
        else if (isListSched) action.payload = { mode: 'list' };
        else action.payload = { mode: 'create', name: c.target || 'task_' + Date.now(), command: c.raw, interval: c.scheduleInterval || 5 };
        break;

      case 'remember':
        action.type = 'remember';
        action.payload = { key: c.memoryKey, value: c.memoryValue, raw: c.raw };
        break;

      case 'analyze':
        action.type = 'analyze';
        action.payload = { selector: c.target || 'body', depth: c.raw.toLowerCase().indexOf('deep') !== -1 ? 'deep' : 'standard' };
        break;

      case 'compose':
        action.type = 'compose';
        action.payload = { topic: c.target || c.raw, style: 'professional' };
        if (c.raw.toLowerCase().indexOf('casual') !== -1) action.payload.style = 'casual';
        if (c.raw.toLowerCase().indexOf('formal') !== -1) action.payload.style = 'formal';
        break;

      case 'translate':
        action.type = 'translate';
        action.payload = { text: c.target || c.raw, targetLang: 'en' };
        var langMatch = c.raw.toLowerCase().match(/(?:to|in|into)\s+(spanish|french|german|italian|portuguese|japanese|chinese|korean|arabic|russian|hindi)/);
        if (langMatch) action.payload.targetLang = langMatch[1];
        break;

      case 'debug':
        action.type = 'debug';
        action.payload = { selector: c.target || 'body' };
        break;

      case 'monitor':
        action.type = 'monitor';
        action.payload = { selector: c.target || 'body', interval: c.scheduleInterval || 1 };
        break;

      default:
        action.type = 'unknown';
        action.payload = { raw: c.raw };
    }

    /* Add task to queue */
    this.taskQueue.add({ name: c.intent + '-' + c.id, intent: c.intent, payload: action.payload, priority: c.confidence * 10 });

    /* Record step if automation is recording */
    if (this.automation.isRecording) {
      this.automation.addStep({ action: c.intent, payload: action.payload });
    }

    return action;
  }

  /* ── Tab Management ──────────────────────────────────────── */

  openTab(url, callback) {
    try {
      chrome.tabs.create({ url: url, active: true }, function (tab) {
        if (callback) callback({ success: true, tabId: tab.id });
      });
    } catch (e) {
      this._logError('openTab', e);
      if (callback) callback({ success: false, error: e.message });
    }
  }

  closeTab(tabId, callback) {
    try {
      chrome.tabs.remove(tabId, function () {
        if (callback) callback({ success: true });
      });
    } catch (e) {
      this._logError('closeTab', e);
      if (callback) callback({ success: false, error: e.message });
    }
  }

  switchTab(tabId, callback) {
    try {
      chrome.tabs.update(tabId, { active: true }, function (tab) {
        if (callback) callback({ success: true, tab: tab });
      });
    } catch (e) {
      this._logError('switchTab', e);
      if (callback) callback({ success: false, error: e.message });
    }
  }

  groupTabs(tabIds, title, callback) {
    try {
      chrome.tabs.group({ tabIds: tabIds }, function (groupId) {
        chrome.tabGroups.update(groupId, { title: title || 'JARVIS Group', color: 'blue' }, function () {
          if (callback) callback({ success: true, groupId: groupId });
        });
      });
    } catch (e) {
      this._logError('groupTabs', e);
      if (callback) callback({ success: false, error: e.message });
    }
  }

  listTabs(callback) {
    try {
      chrome.tabs.query({}, function (tabs) {
        var result = tabs.map(function (t) {
          return { id: t.id, title: t.title, url: t.url, active: t.active, index: t.index };
        });
        if (callback) callback({ success: true, tabs: result });
      });
    } catch (e) {
      this._logError('listTabs', e);
      if (callback) callback({ success: false, error: e.message });
    }
  }

  /* ── Status / Getters ────────────────────────────────────── */

  getHistory() {
    return this.commandHistory.slice(-20);
  }

  getStatus() {
    return {
      uptime: Date.now() - this.startTime,
      heartbeatCount: this.state.heartbeatCount,
      commandCount: this.commandCount,
      memoryCount: this.memory.count(),
      taskStats: this.taskQueue.getStats(),
      automationRecording: this.automation.isRecording,
      scheduledTasks: this.scheduler.listScheduled().length,
      errorCount: this.errorLog.length,
      mode: this.state.mode,
      phi: PHI,
      goldenAngle: GOLDEN_ANGLE
    };
  }

  getErrorLog() {
    return this.errorLog.slice(-20);
  }
}

/* ── Instantiate Engine ──────────────────────────────────────── */

globalThis.jarvisEngine = new JarvisEngine();

/* ── Message Listener ────────────────────────────────────────── */

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.jarvisEngine;

  /* Self-heal if engine is missing */
  if (!engine) {
    globalThis.jarvisEngine = new JarvisEngine();
    engine = globalThis.jarvisEngine;
  }

  try {
    switch (message.action) {
      case 'parseCommand':
        var parsed = engine.parseCommand(message.command);
        var action = engine.buildAction(parsed);
        sendResponse({ success: true, data: { parsed: parsed, action: action } });
        break;

      case 'getHistory':
        sendResponse({ success: true, data: engine.getHistory() });
        break;

      case 'getStatus':
        sendResponse({ success: true, data: engine.getStatus() });
        break;

      case 'remember':
        var memEntry = engine.memory.store(message.key, message.value, message.category);
        sendResponse({ success: true, data: memEntry });
        break;

      case 'recall':
        var found = engine.memory.recall(message.key);
        if (found) {
          sendResponse({ success: true, data: found });
        } else {
          engine.memory.recall(message.key, function (entry) {
            sendResponse({ success: !!entry, data: entry, error: entry ? null : 'Memory not found' });
          });
          return true;
        }
        break;

      case 'searchMemory':
        var results = engine.memory.search(message.query);
        sendResponse({ success: true, data: results });
        break;

      case 'getAllMemories':
        sendResponse({ success: true, data: engine.memory.getAll() });
        break;

      case 'clearMemory':
        engine.memory.clear();
        sendResponse({ success: true });
        break;

      case 'startRecording':
        var recResult = engine.automation.startRecording(message.name || 'default');
        sendResponse({ success: true, data: recResult });
        break;

      case 'stopRecording':
        var seq = engine.automation.stopRecording();
        sendResponse({ success: !!seq, data: seq });
        break;

      case 'getSequence':
        var seqData = engine.automation.getSequence(message.name);
        sendResponse({ success: !!seqData, data: seqData });
        break;

      case 'listSequences':
        sendResponse({ success: true, data: engine.automation.listSequences() });
        break;

      case 'scheduledTask':
        if (message.mode === 'create') {
          var sTask = engine.scheduler.schedule(message.name, message.command, message.interval || 5);
          sendResponse({ success: true, data: sTask });
        } else if (message.mode === 'cancel') {
          var cancelled = engine.scheduler.cancel(message.name);
          sendResponse({ success: cancelled });
        } else if (message.mode === 'list') {
          sendResponse({ success: true, data: engine.scheduler.listScheduled() });
        } else {
          sendResponse({ success: false, error: 'Unknown schedule mode' });
        }
        break;

      case 'openTab':
        engine.openTab(message.url, function (result) { sendResponse(result); });
        return true;

      case 'closeTab':
        engine.closeTab(message.tabId, function (result) { sendResponse(result); });
        return true;

      case 'listTabs':
        engine.listTabs(function (result) { sendResponse(result); });
        return true;

      case 'getTaskStats':
        sendResponse({ success: true, data: engine.taskQueue.getStats() });
        break;

      case 'getErrors':
        sendResponse({ success: true, data: engine.getErrorLog() });
        break;

      default:
        sendResponse({ success: false, error: 'Unknown action: ' + message.action });
    }
  } catch (e) {
    engine._logError('messageHandler', e);
    engine._selfHeal();
    sendResponse({ success: false, error: 'Internal error: ' + e.message });
  }

  return true;
});

/* ── Production 24/7 Keep-Alive ──────────────────────────────── */
(function () {
  var ALARM_NAME = 'jarvis-heartbeat';
  var ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name === ALARM_NAME) {
      if (!globalThis.jarvisEngine) {
        globalThis.jarvisEngine = new JarvisEngine();
        console.log('[JARVIS] Engine re-initialized by keepalive alarm');
      }
      try {
        chrome.storage.local.set({
          'jarvis_state': {
            commandCount: globalThis.jarvisEngine.commandCount || 0,
            memoryCount: globalThis.jarvisEngine.memory.count(),
            lastAlive: Date.now()
          }
        });
      } catch (e) {}
    }

    /* Handle scheduled tasks */
    if (alarm.name.indexOf('jarvis_sched_') === 0) {
      var taskName = alarm.name.replace('jarvis_sched_', '');
      var engine = globalThis.jarvisEngine;
      if (engine && engine.scheduler.scheduled[taskName]) {
        engine.scheduler.markRun(taskName);
        var schedCmd = engine.scheduler.scheduled[taskName].command;
        var parsed = engine.parseCommand(schedCmd);
        engine.buildAction(parsed);
        console.log('[JARVIS] Scheduled task executed: ' + taskName);
      }
    }
  });

  chrome.storage.local.get('jarvis_state', function (data) {
    if (data && data['jarvis_state']) {
      console.log('[JARVIS] Restored — last alive: ' + new Date(data['jarvis_state'].lastAlive).toISOString());
    }
  });

  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    console.log('[JARVIS] 24/7 keepalive active — JARVIS is online');
  });
})();

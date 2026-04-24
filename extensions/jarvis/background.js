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


/* ── Protocol Registry — 250 Protocols ─────────────────────── */

var PROTOCOL_REGISTRY = {
  sovereign: [
    {id: 'PROTO-001', name: 'Sovereign Routing Protocol', abbr: 'SRP', wire: 'intelligence-wire/srp'},
    {id: 'PROTO-002', name: 'Encrypted Intelligence Transport', abbr: 'EIT', wire: 'intelligence-wire/eit'},
    {id: 'PROTO-003', name: 'Phi-Resonance Synchronization Protocol', abbr: 'PRSP', wire: 'intelligence-wire/prsp'},
    {id: 'PROTO-004', name: 'Adaptive Knowledge Absorption Protocol', abbr: 'AKAP', wire: 'intelligence-wire/akap'},
    {id: 'PROTO-005', name: 'Multi-Model Fusion Protocol', abbr: 'MMFP', wire: 'intelligence-wire/mmfp'},
    {id: 'PROTO-006', name: 'Sovereign Contract Verification Protocol', abbr: 'SCVP', wire: 'intelligence-wire/scvp'},
    {id: 'PROTO-007', name: 'Edge Mesh Intelligence Protocol', abbr: 'EMIP', wire: 'intelligence-wire/emip'},
    {id: 'PROTO-008', name: 'Visual Scene Intelligence Protocol', abbr: 'VSIP', wire: 'intelligence-wire/vsip'},
    {id: 'PROTO-009', name: 'Memory Lineage Protocol', abbr: 'MLP', wire: 'intelligence-wire/mlp'},
    {id: 'PROTO-010', name: 'Organism Lifecycle Protocol', abbr: 'OLP', wire: 'intelligence-wire/olp'}
  ],
  security: [
    {id: 'PROTO-011', name: 'Byzantine Fault Tolerance Protocol', abbr: 'BFTP', wire: 'intelligence-wire/bftp'},
    {id: 'PROTO-012', name: 'Raft Consensus Intelligence Protocol', abbr: 'RCIP', wire: 'intelligence-wire/rcip'},
    {id: 'PROTO-013', name: 'Paxos Agreement Protocol', abbr: 'PAP', wire: 'intelligence-wire/pap'},
    {id: 'PROTO-014', name: 'Model Capability Scoring Protocol', abbr: 'MCSP', wire: 'intelligence-wire/mcsp'},
    {id: 'PROTO-015', name: 'Model Retirement and Succession Protocol', abbr: 'MRSP', wire: 'intelligence-wire/mrsp'},
    {id: 'PROTO-016', name: 'Intelligence Hierarchy Arbitration Protocol', abbr: 'IHAP', wire: 'intelligence-wire/ihap'},
    {id: 'PROTO-017', name: 'Model-to-Model Communication Protocol', abbr: 'MMCP', wire: 'intelligence-wire/mmcp'},
    {id: 'PROTO-018', name: 'Wire-to-Wire Bridge Protocol', abbr: 'WWBP', wire: 'intelligence-wire/wwbp'},
    {id: 'PROTO-019', name: 'Cross-Engine Relay Protocol', abbr: 'CERP', wire: 'intelligence-wire/cerp'},
    {id: 'PROTO-020', name: 'Zero-Knowledge Proof Verification Protocol', abbr: 'ZKPVP', wire: 'intelligence-wire/zkpvp'}
  ],
  knowledge: [
    {id: 'PROTO-021', name: 'Homomorphic Computation Protocol', abbr: 'HCP', wire: 'intelligence-wire/hcp'},
    {id: 'PROTO-022', name: 'Secure Enclave Isolation Protocol', abbr: 'SEIP', wire: 'intelligence-wire/seip'},
    {id: 'PROTO-023', name: 'Tool Discovery and Registration Protocol', abbr: 'TDRP', wire: 'intelligence-wire/tdrp'},
    {id: 'PROTO-024', name: 'Marketplace Settlement Protocol', abbr: 'MSP', wire: 'intelligence-wire/msp'},
    {id: 'PROTO-025', name: 'Dynamic Pricing Intelligence Protocol', abbr: 'DPIP', wire: 'intelligence-wire/dpip'},
    {id: 'PROTO-026', name: 'Contribution Reward Distribution Protocol', abbr: 'CRDP', wire: 'intelligence-wire/crdp'},
    {id: 'PROTO-027', name: 'Mutation Observer Intelligence Protocol', abbr: 'MOIP', wire: 'intelligence-wire/moip'},
    {id: 'PROTO-028', name: 'Intersection Observer Intelligence Protocol', abbr: 'IOIP', wire: 'intelligence-wire/ioip'},
    {id: 'PROTO-029', name: 'Performance Observer Intelligence Protocol', abbr: 'POIP', wire: 'intelligence-wire/poip'},
    {id: 'PROTO-030', name: 'Resize Observer Intelligence Protocol', abbr: 'ROIP', wire: 'intelligence-wire/roip'}
  ],
  multiModel: [
    {id: 'PROTO-031', name: 'Worker Lifecycle Management Protocol', abbr: 'WLMP', wire: 'intelligence-wire/wlmp'},
    {id: 'PROTO-032', name: 'Inter-Worker Messaging Protocol', abbr: 'IWMP', wire: 'intelligence-wire/iwmp'},
    {id: 'PROTO-033', name: 'Shared Memory Coordination Protocol', abbr: 'SMCP', wire: 'intelligence-wire/smcp'},
    {id: 'PROTO-034', name: 'Heartbeat Health Monitoring Protocol', abbr: 'HHMP', wire: 'intelligence-wire/hhmp'},
    {id: 'PROTO-035', name: 'Adaptive Load Balancing Protocol', abbr: 'ALBP', wire: 'intelligence-wire/albp'},
    {id: 'PROTO-036', name: 'Failover Cascade Protocol', abbr: 'FCP', wire: 'intelligence-wire/fcp'},
    {id: 'PROTO-037', name: 'Entity Linking Intelligence Protocol', abbr: 'ELIP', wire: 'intelligence-wire/elip'},
    {id: 'PROTO-038', name: 'Relation Extraction Protocol', abbr: 'REP', wire: 'intelligence-wire/rep'},
    {id: 'PROTO-039', name: 'Graph Traversal Intelligence Protocol', abbr: 'GTIP', wire: 'intelligence-wire/gtip'},
    {id: 'PROTO-040', name: 'Task Planning Intelligence Protocol', abbr: 'TPIP', wire: 'intelligence-wire/tpip'}
  ],
  contract: [
    {id: 'PROTO-041', name: 'Goal Decomposition Protocol', abbr: 'GDP', wire: 'intelligence-wire/gdp'},
    {id: 'PROTO-042', name: 'Self-Improvement Loop Protocol', abbr: 'SILP', wire: 'intelligence-wire/silp'},
    {id: 'PROTO-043', name: 'ICP Canister Bridge Protocol', abbr: 'ICBP', wire: 'intelligence-wire/icbp'},
    {id: 'PROTO-044', name: 'Ethereum Smart Contract Bridge Protocol', abbr: 'ESCBP', wire: 'intelligence-wire/escbp'},
    {id: 'PROTO-045', name: 'Multi-Chain Synchronization Protocol', abbr: 'MCSYNCP', wire: 'intelligence-wire/mcsyncp'},
    {id: 'PROTO-046', name: 'Doctrine Enforcement Protocol', abbr: 'DEP', wire: 'intelligence-wire/dep'},
    {id: 'PROTO-047', name: 'Compliance Audit Trail Protocol', abbr: 'CATP', wire: 'intelligence-wire/catp'},
    {id: 'PROTO-048', name: 'Governance Vote Resolution Protocol', abbr: 'GVRP', wire: 'intelligence-wire/gvrp'},
    {id: 'PROTO-049', name: 'Self-Organization Emergence Protocol', abbr: 'SOEP', wire: 'intelligence-wire/soep'},
    {id: 'PROTO-050', name: 'Emergent Behavior Detection Protocol', abbr: 'EBDP', wire: 'intelligence-wire/ebdp'}
  ],
  observer: [
    {id: 'PROTO-051', name: 'Swarm Intelligence Coordination Protocol', abbr: 'SICP', wire: 'intelligence-wire/sicp'},
    {id: 'PROTO-052', name: 'Fourier Transform Intelligence Protocol', abbr: 'FTIP', wire: 'intelligence-wire/ftip'},
    {id: 'PROTO-053', name: 'Wavelet Analysis Protocol', abbr: 'WAP', wire: 'intelligence-wire/wap'},
    {id: 'PROTO-054', name: 'Spectral Density Estimation Protocol', abbr: 'SDEP', wire: 'intelligence-wire/sdep'},
    {id: 'PROTO-055', name: 'Kuramoto Coupling Protocol', abbr: 'KCP', wire: 'intelligence-wire/kcp'},
    {id: 'PROTO-056', name: 'Phase Lock Synchronization Protocol', abbr: 'PLSP', wire: 'intelligence-wire/plsp'},
    {id: 'PROTO-057', name: 'Harmonic Resonance Detection Protocol', abbr: 'HRDP', wire: 'intelligence-wire/hrdp'},
    {id: 'PROTO-058', name: 'Distributed Ledger Attestation Protocol', abbr: 'DLAP', wire: 'intelligence-wire/dlap'},
    {id: 'PROTO-059', name: 'Neural Architecture Search Protocol', abbr: 'NASP', wire: 'intelligence-wire/nasp'},
    {id: 'PROTO-060', name: 'Temporal Causal Inference Protocol', abbr: 'TCIP', wire: 'intelligence-wire/tcip'}
  ],
  worker: [
    {id: 'PROTO-061', name: 'Autonomous Goal Decomposition Protocol', abbr: 'AGDP', wire: 'intelligence-wire/agdp'},
    {id: 'PROTO-062', name: 'Real-Time Sentiment Analysis Protocol', abbr: 'RSAP', wire: 'intelligence-wire/rsap'},
    {id: 'PROTO-063', name: 'Cross-Extension Communication Protocol', abbr: 'CECP', wire: 'intelligence-wire/cecp'},
    {id: 'PROTO-064', name: 'Predictive Caching Protocol', abbr: 'PCP', wire: 'intelligence-wire/pcp'},
    {id: 'PROTO-065', name: 'Adaptive Rate Limiting Protocol', abbr: 'ARLP', wire: 'intelligence-wire/arlp'},
    {id: 'PROTO-066', name: 'Semantic Code Understanding Protocol', abbr: 'SCUP', wire: 'intelligence-wire/scup'},
    {id: 'PROTO-067', name: 'Multi-Agent Negotiation Protocol', abbr: 'MANP', wire: 'intelligence-wire/manp'},
    {id: 'PROTO-068', name: 'Observer Intelligence Protocol', abbr: 'OIP', wire: 'intelligence-wire/oip'},
    {id: 'PROTO-069', name: 'Progressive Enhancement Protocol', abbr: 'PEP', wire: 'intelligence-wire/pep'},
    {id: 'PROTO-070', name: 'Context Window Management Protocol', abbr: 'CWMP', wire: 'intelligence-wire/cwmp'}
  ],
  agent: [
    {id: 'PROTO-071', name: 'Hallucination Detection Protocol', abbr: 'HDP', wire: 'intelligence-wire/hdp'},
    {id: 'PROTO-072', name: 'Tool Chain Orchestration Protocol', abbr: 'TCOP', wire: 'intelligence-wire/tcop'},
    {id: 'PROTO-073', name: 'Ambient Intelligence Protocol', abbr: 'AIP', wire: 'intelligence-wire/aip'},
    {id: 'PROTO-074', name: 'Knowledge Distillation Protocol', abbr: 'KDP', wire: 'intelligence-wire/kdp'},
    {id: 'PROTO-075', name: 'Federated Learning Coordination Protocol', abbr: 'FLCP', wire: 'intelligence-wire/flcp'},
    {id: 'PROTO-076', name: 'Adversarial Robustness Protocol', abbr: 'ARP', wire: 'intelligence-wire/arp'},
    {id: 'PROTO-077', name: 'Dynamic Schema Evolution Protocol', abbr: 'DSEP', wire: 'intelligence-wire/dsep'},
    {id: 'PROTO-078', name: 'Explainability Bridge Protocol', abbr: 'EBP', wire: 'intelligence-wire/ebp'},
    {id: 'PROTO-079', name: 'Energy Efficiency Protocol', abbr: 'EEP', wire: 'intelligence-wire/eep'},
    {id: 'PROTO-080', name: 'Sovereign Data Lineage Protocol', abbr: 'SDLP', wire: 'intelligence-wire/sdlp'}
  ],
  substrate: [
    {id: 'PROTO-081', name: 'Autonomous Swarm Coordination Protocol', abbr: 'ASCP', wire: 'intelligence-wire/ascp'},
    {id: 'PROTO-082', name: 'Recursive Self-Improvement Protocol', abbr: 'RSIP', wire: 'intelligence-wire/rsip'},
    {id: 'PROTO-083', name: 'Quantum-Ready Encryption Protocol', abbr: 'QREP', wire: 'intelligence-wire/qrep'},
    {id: 'PROTO-084', name: 'Cross-Chain Bridge Protocol', abbr: 'CCBP', wire: 'intelligence-wire/ccbp'},
    {id: 'PROTO-085', name: 'Sovereign Identity Verification Protocol', abbr: 'SIVP', wire: 'intelligence-wire/sivp'},
    {id: 'PROTO-086', name: 'Neural Architecture Search Protocol v2', abbr: 'NASPv2', wire: 'intelligence-wire/naspv2'},
    {id: 'PROTO-087', name: 'Emotion-Aware Interaction Protocol', abbr: 'EAIP', wire: 'intelligence-wire/eaip'},
    {id: 'PROTO-088', name: 'Digital Twin Synchronization Protocol', abbr: 'DTSP', wire: 'intelligence-wire/dtsp'},
    {id: 'PROTO-089', name: 'Cognitive Load Balancing Protocol', abbr: 'CLBP', wire: 'intelligence-wire/clbp'},
    {id: 'PROTO-090', name: 'Zero-Knowledge Proof Generation Protocol', abbr: 'ZKPGP', wire: 'intelligence-wire/zkpgp'}
  ],
  signal: [
    {id: 'PROTO-091', name: 'Autonomous Code Review Protocol', abbr: 'ACRP', wire: 'intelligence-wire/acrp'},
    {id: 'PROTO-092', name: 'Real-Time Translation Mesh Protocol', abbr: 'RTMP', wire: 'intelligence-wire/rtmp'},
    {id: 'PROTO-093', name: 'Predictive Maintenance Protocol', abbr: 'PMP', wire: 'intelligence-wire/pmp'},
    {id: 'PROTO-094', name: 'Content Authenticity Protocol', abbr: 'CAP', wire: 'intelligence-wire/cap'},
    {id: 'PROTO-095', name: 'Distributed Consensus Protocol', abbr: 'DCP', wire: 'intelligence-wire/dcp'},
    {id: 'PROTO-096', name: 'Adaptive Curriculum Protocol', abbr: 'ACP', wire: 'intelligence-wire/acp'},
    {id: 'PROTO-097', name: 'Spatial Computing Protocol', abbr: 'SCP', wire: 'intelligence-wire/scp'},
    {id: 'PROTO-098', name: 'Autonomous Debugging Protocol', abbr: 'ADP', wire: 'intelligence-wire/adp'},
    {id: 'PROTO-099', name: 'Cross-Modal Transfer Protocol', abbr: 'CMTP', wire: 'intelligence-wire/cmtp'},
    {id: 'PROTO-100', name: 'Sovereign Governance Protocol', abbr: 'SGP', wire: 'intelligence-wire/sgp'}
  ],
  emergence: [
    {id: 'PROTO-101', name: 'Neuromorphic Compute Protocol', abbr: 'NCP', wire: 'intelligence-wire/ncp'},
    {id: 'PROTO-102', name: 'Autonomous Testing Protocol', abbr: 'ATP', wire: 'intelligence-wire/atp'},
    {id: 'PROTO-103', name: 'Privacy-Preserving Analytics Protocol', abbr: 'PPAP', wire: 'intelligence-wire/ppap'},
    {id: 'PROTO-104', name: 'Intelligent Caching Protocol', abbr: 'ICP', wire: 'intelligence-wire/icp'},
    {id: 'PROTO-105', name: 'Self-Documenting Code Protocol', abbr: 'SDCP', wire: 'intelligence-wire/sdcp'},
    {id: 'PROTO-106', name: 'Anomaly Prediction Protocol', abbr: 'APP', wire: 'intelligence-wire/app'},
    {id: 'PROTO-107', name: 'Multi-Tenant Isolation Protocol', abbr: 'MTIP', wire: 'intelligence-wire/mtip'},
    {id: 'PROTO-108', name: 'Adaptive Compression Protocol', abbr: 'AdCP', wire: 'intelligence-wire/adcp'},
    {id: 'PROTO-109', name: 'Intent Recognition Protocol', abbr: 'IRP', wire: 'intelligence-wire/irp'},
    {id: 'PROTO-110', name: 'Autonomous Deployment Protocol', abbr: 'ADeP', wire: 'intelligence-wire/adep'}
  ],
  crossOrganism: [
    {id: 'PROTO-111', name: 'Federated Inference Protocol', abbr: 'FIP', wire: 'intelligence-wire/fip'},
    {id: 'PROTO-112', name: 'Semantic Versioning Protocol', abbr: 'SVP', wire: 'intelligence-wire/svp'},
    {id: 'PROTO-113', name: 'Chaos Engineering Protocol', abbr: 'CEP', wire: 'intelligence-wire/cep'},
    {id: 'PROTO-114', name: 'Knowledge Graph Fusion Protocol', abbr: 'KGFP', wire: 'intelligence-wire/kgfp'},
    {id: 'PROTO-115', name: 'Autonomous Scaling Protocol', abbr: 'ASP', wire: 'intelligence-wire/asp'},
    {id: 'PROTO-116', name: 'Ethical Guardrail Protocol', abbr: 'EGP', wire: 'intelligence-wire/egp'},
    {id: 'PROTO-117', name: 'Real-Time Collaboration Protocol', abbr: 'RTCP', wire: 'intelligence-wire/rtcp'},
    {id: 'PROTO-118', name: 'Secure Enclave Protocol', abbr: 'SEP', wire: 'intelligence-wire/sep'},
    {id: 'PROTO-119', name: 'Adaptive Retry Protocol', abbr: 'AdRP', wire: 'intelligence-wire/adrp'},
    {id: 'PROTO-120', name: 'Cross-Platform Sync Protocol', abbr: 'CPSP', wire: 'intelligence-wire/cpsp'}
  ],
  codeIntel: [
    {id: 'PROTO-121', name: 'Autonomous Optimization Protocol', abbr: 'AOP', wire: 'intelligence-wire/aop'},
    {id: 'PROTO-122', name: 'Digital Watermark Protocol', abbr: 'DWP', wire: 'intelligence-wire/dwp'},
    {id: 'PROTO-123', name: 'Predictive Resource Allocation Protocol', abbr: 'PRAP', wire: 'intelligence-wire/prap'},
    {id: 'PROTO-124', name: 'Sovereign Audit Trail Protocol', abbr: 'SATP', wire: 'intelligence-wire/satp'},
    {id: 'PROTO-125', name: 'Neural Compression Protocol', abbr: 'NCoP', wire: 'intelligence-wire/ncop'},
    {id: 'PROTO-126', name: 'Multi-Agent Debate Protocol', abbr: 'MADP', wire: 'intelligence-wire/madp'},
    {id: 'PROTO-127', name: 'Temporal Reasoning Protocol', abbr: 'TRP', wire: 'intelligence-wire/trp'},
    {id: 'PROTO-128', name: 'Autonomous Incident Response Protocol', abbr: 'AIRP', wire: 'intelligence-wire/airp'},
    {id: 'PROTO-129', name: 'Contextual Personalization Protocol', abbr: 'CPP', wire: 'intelligence-wire/cpp'},
    {id: 'PROTO-130', name: 'Sovereign Interoperability Protocol', abbr: 'SIP', wire: 'intelligence-wire/sip'}
  ],
  predictive: [
    {id: 'PROTO-131', name: 'Autonomous Code Review Protocol v2', abbr: 'ACRPv2', wire: 'intelligence-wire/acrpv2'},
    {id: 'PROTO-132', name: 'Autonomous Debug Trace Protocol', abbr: 'ADTP', wire: 'intelligence-wire/adtp'},
    {id: 'PROTO-133', name: 'Autonomous Test Generation Protocol', abbr: 'ATGP', wire: 'intelligence-wire/atgp'},
    {id: 'PROTO-134', name: 'Autonomous Refactoring Protocol', abbr: 'ARP', wire: 'intelligence-wire/arp'},
    {id: 'PROTO-135', name: 'Autonomous Documentation Protocol v2', abbr: 'ADPv2', wire: 'intelligence-wire/adpv2'},
    {id: 'PROTO-136', name: 'Autonomous Dependency Audit Protocol', abbr: 'ADAP', wire: 'intelligence-wire/adap'},
    {id: 'PROTO-137', name: 'Autonomous Performance Profiling Protocol', abbr: 'APPP', wire: 'intelligence-wire/appp'},
    {id: 'PROTO-138', name: 'Autonomous CI/CD Pipeline Protocol', abbr: 'ACPP', wire: 'intelligence-wire/acpp'},
    {id: 'PROTO-139', name: 'Autonomous Code Migration Protocol', abbr: 'ACMP', wire: 'intelligence-wire/acmp'},
    {id: 'PROTO-140', name: 'Autonomous Architecture Analysis Protocol', abbr: 'AAAP', wire: 'intelligence-wire/aaap'}
  ],
  spatial: [
    {id: 'PROTO-141', name: 'Neuromorphic Spike Timing Protocol', abbr: 'NSTP', wire: 'intelligence-wire/nstp'},
    {id: 'PROTO-142', name: 'Neuromorphic Reservoir Computing Protocol', abbr: 'NRCP', wire: 'intelligence-wire/nrcp'},
    {id: 'PROTO-143', name: 'Neuromorphic Sensory Fusion Protocol', abbr: 'NSFP', wire: 'intelligence-wire/nsfp'},
    {id: 'PROTO-144', name: 'Neuromorphic Motor Planning Protocol', abbr: 'NMPP', wire: 'intelligence-wire/nmpp'},
    {id: 'PROTO-145', name: 'Neuromorphic Attention Gating Protocol', abbr: 'NAGP', wire: 'intelligence-wire/nagp'},
    {id: 'PROTO-146', name: 'Multi-Agent Debate Protocol v2', abbr: 'MADPv2', wire: 'intelligence-wire/madpv2'},
    {id: 'PROTO-147', name: 'Multi-Agent Swarm Intelligence Protocol', abbr: 'MASIP', wire: 'intelligence-wire/masip'},
    {id: 'PROTO-148', name: 'Multi-Agent Consensus Protocol', abbr: 'MACP', wire: 'intelligence-wire/macp'},
    {id: 'PROTO-149', name: 'Multi-Agent Negotiation Protocol', abbr: 'MANP', wire: 'intelligence-wire/manp'},
    {id: 'PROTO-150', name: 'Multi-Agent Teaching Protocol', abbr: 'MATP', wire: 'intelligence-wire/matp'}
  ],
  neuromorphic: [
    {id: 'PROTO-151', name: 'Multi-Agent Competition Protocol', abbr: 'MACmP', wire: 'intelligence-wire/macmp'},
    {id: 'PROTO-152', name: 'Multi-Agent Specialization Protocol', abbr: 'MASP', wire: 'intelligence-wire/masp'},
    {id: 'PROTO-153', name: 'Multi-Agent Memory Sharing Protocol', abbr: 'MAMSP', wire: 'intelligence-wire/mamsp'},
    {id: 'PROTO-154', name: 'Privacy-Preserving Analytics Protocol v2', abbr: 'PPAPv2', wire: 'intelligence-wire/ppapv2'},
    {id: 'PROTO-155', name: 'Ethical Guardrail Protocol v2', abbr: 'EGPv2', wire: 'intelligence-wire/egpv2'},
    {id: 'PROTO-156', name: 'Secure Enclave Execution Protocol v2', abbr: 'SEEPv2', wire: 'intelligence-wire/seepv2'},
    {id: 'PROTO-157', name: 'Sovereign Data Anonymization Protocol', abbr: 'SDAP', wire: 'intelligence-wire/sdap'},
    {id: 'PROTO-158', name: 'Adversarial Resilience Protocol v2', abbr: 'ARPv2', wire: 'intelligence-wire/arpv2'},
    {id: 'PROTO-159', name: 'Intelligent Caching Protocol v2', abbr: 'ICPv2', wire: 'intelligence-wire/icpv2'},
    {id: 'PROTO-160', name: 'Multi-Tenant Isolation Protocol v2', abbr: 'MTIPv2', wire: 'intelligence-wire/mtipv2'}
  ],
  chaos: [
    {id: 'PROTO-161', name: 'Autonomous Scaling Protocol v2', abbr: 'ASPv2', wire: 'intelligence-wire/aspv2'},
    {id: 'PROTO-162', name: 'Chaos Engineering Protocol v2', abbr: 'CEPv2', wire: 'intelligence-wire/cepv2'},
    {id: 'PROTO-163', name: 'Federated Inference Protocol v2', abbr: 'FIPv2', wire: 'intelligence-wire/fipv2'},
    {id: 'PROTO-164', name: 'Autonomous Deployment Protocol v2', abbr: 'ADePv2', wire: 'intelligence-wire/adepv2'},
    {id: 'PROTO-165', name: 'Intent Recognition Protocol v2', abbr: 'IRPv2', wire: 'intelligence-wire/irpv2'},
    {id: 'PROTO-166', name: 'Self-Documenting Code Protocol v2', abbr: 'SDCPv2', wire: 'intelligence-wire/sdcpv2'},
    {id: 'PROTO-167', name: 'Knowledge Graph Evolution Protocol', abbr: 'KGEP', wire: 'intelligence-wire/kgep'},
    {id: 'PROTO-168', name: 'Semantic Code Search Protocol', abbr: 'SCSP', wire: 'intelligence-wire/scsp'},
    {id: 'PROTO-169', name: 'Living Architecture Documentation Protocol', abbr: 'LADP', wire: 'intelligence-wire/ladp'},
    {id: 'PROTO-170', name: 'Collective Intelligence Synthesis Protocol', abbr: 'CISP', wire: 'intelligence-wire/cisp'}
  ],
  interop: [
    {id: 'PROTO-171', name: 'Real-Time Collaboration Protocol v2', abbr: 'RTCPv2', wire: 'intelligence-wire/rtcpv2'},
    {id: 'PROTO-172', name: 'Digital Watermark Protocol v2', abbr: 'DWPv2', wire: 'intelligence-wire/dwpv2'},
    {id: 'PROTO-173', name: 'Predictive Resource Allocation Protocol v2', abbr: 'PRAPv2', wire: 'intelligence-wire/prapv2'},
    {id: 'PROTO-174', name: 'Autonomous Optimization Protocol v2', abbr: 'AOPv2', wire: 'intelligence-wire/aopv2'},
    {id: 'PROTO-175', name: 'Cross-Modal Intelligence Transfer Protocol', abbr: 'CMITP', wire: 'intelligence-wire/cmitp'},
    {id: 'PROTO-176', name: 'Terminal Autonomy Protocol', abbr: 'TAP', wire: 'intelligence-wire/tap'},
    {id: 'PROTO-177', name: 'AGI Orchestration Protocol', abbr: 'AGOP', wire: 'intelligence-wire/agop'},
    {id: 'PROTO-178', name: 'Package Intelligence Protocol', abbr: 'PIP', wire: 'intelligence-wire/pip'},
    {id: 'PROTO-179', name: 'Blueprint Discovery Protocol', abbr: 'BDP', wire: 'intelligence-wire/bdp'},
    {id: 'PROTO-180', name: 'Sovereign Division Management Protocol', abbr: 'SDMP', wire: 'intelligence-wire/sdmp'}
  ],
  forgeworks: [
    {id: 'PROTO-181', name: 'Autonomous Static Analysis Protocol', abbr: 'ASAP', wire: 'intelligence-wire/asap'},
    {id: 'PROTO-182', name: 'Autonomous Dynamic Analysis Protocol', abbr: 'ADAP-D', wire: 'intelligence-wire/adap-d'},
    {id: 'PROTO-183', name: 'Autonomous Refactoring Protocol', abbr: 'ARfP', wire: 'intelligence-wire/arfp'},
    {id: 'PROTO-184', name: 'Autonomous Dependency Resolution Protocol', abbr: 'ADRP-D', wire: 'intelligence-wire/adrp-d'},
    {id: 'PROTO-185', name: 'Autonomous API Design Protocol', abbr: 'AADP', wire: 'intelligence-wire/aadp'},
    {id: 'PROTO-186', name: 'Autonomous Database Migration Protocol', abbr: 'ADMP', wire: 'intelligence-wire/admp'},
    {id: 'PROTO-187', name: 'Autonomous Log Analysis Protocol', abbr: 'ALAP', wire: 'intelligence-wire/alap'},
    {id: 'PROTO-188', name: 'Autonomous Security Audit Protocol', abbr: 'ASAP-S', wire: 'intelligence-wire/asap-s'},
    {id: 'PROTO-189', name: 'Autonomous Performance Regression Protocol', abbr: 'APRP', wire: 'intelligence-wire/aprp'},
    {id: 'PROTO-190', name: 'Autonomous Code Generation Protocol', abbr: 'ACGP', wire: 'intelligence-wire/acgp'},
    {id: 'PROTO-191', name: 'Autonomous Merge Conflict Resolution Protocol', abbr: 'AMCRP', wire: 'intelligence-wire/amcrp'},
    {id: 'PROTO-192', name: 'Autonomous Documentation Sync Protocol', abbr: 'ADSP', wire: 'intelligence-wire/adsp'},
    {id: 'PROTO-193', name: 'Autonomous Error Recovery Protocol', abbr: 'AERP', wire: 'intelligence-wire/aerp'},
    {id: 'PROTO-194', name: 'Autonomous Test Mutation Protocol', abbr: 'ATMP', wire: 'intelligence-wire/atmp'},
    {id: 'PROTO-195', name: 'Autonomous Code Coverage Protocol', abbr: 'ACCP', wire: 'intelligence-wire/accp'},
    {id: 'PROTO-196', name: 'Autonomous Architecture Fitness Protocol', abbr: 'AAFP', wire: 'intelligence-wire/aafp'},
    {id: 'PROTO-197', name: 'Autonomous Technical Debt Protocol', abbr: 'ATDP', wire: 'intelligence-wire/atdp'},
    {id: 'PROTO-198', name: 'Autonomous Release Gating Protocol', abbr: 'ARGP', wire: 'intelligence-wire/argp'},
    {id: 'PROTO-199', name: 'Autonomous Incident Postmortem Protocol', abbr: 'AIPP', wire: 'intelligence-wire/aipp'},
    {id: 'PROTO-200', name: 'Autonomous DevSecOps Pipeline Protocol', abbr: 'ADSPP', wire: 'intelligence-wire/adspp'}
  ],
  deepNeuro: [
    {id: 'PROTO-201', name: 'Spiking Neural Relay Protocol', abbr: 'SNRP', wire: 'intelligence-wire/snrp'},
    {id: 'PROTO-202', name: 'Dendritic Computation Protocol', abbr: 'DCP', wire: 'intelligence-wire/dcp'},
    {id: 'PROTO-203', name: 'Glial Support Network Protocol', abbr: 'GSNP', wire: 'intelligence-wire/gsnp'},
    {id: 'PROTO-204', name: 'Neuromodulatory Broadcast Protocol', abbr: 'NBP', wire: 'intelligence-wire/nbp'},
    {id: 'PROTO-205', name: 'Cortical Column Mapping Protocol', abbr: 'CCMP', wire: 'intelligence-wire/ccmp'},
    {id: 'PROTO-206', name: 'Cerebellar Timing Protocol', abbr: 'CTP', wire: 'intelligence-wire/ctp'},
    {id: 'PROTO-207', name: 'Hippocampal Replay Protocol', abbr: 'HRP', wire: 'intelligence-wire/hrp'}
  ],
  multiAgent: [
    {id: 'PROTO-208', name: 'Multi-Agent Negotiation Protocol', abbr: 'MANP', wire: 'intelligence-wire/manp'},
    {id: 'PROTO-209', name: 'Multi-Agent Consensus Protocol', abbr: 'MACP', wire: 'intelligence-wire/macp'},
    {id: 'PROTO-210', name: 'Multi-Agent Specialization Protocol', abbr: 'MASP', wire: 'intelligence-wire/masp'},
    {id: 'PROTO-211', name: 'Multi-Agent Teaching Protocol', abbr: 'MATP', wire: 'intelligence-wire/matp'},
    {id: 'PROTO-212', name: 'Multi-Agent Auction Protocol', abbr: 'MAAP', wire: 'intelligence-wire/maap'},
    {id: 'PROTO-213', name: 'Multi-Agent Coalition Formation Protocol', abbr: 'MACFP', wire: 'intelligence-wire/macfp'},
    {id: 'PROTO-214', name: 'Multi-Agent Reputation Protocol', abbr: 'MARP', wire: 'intelligence-wire/marp'},
    {id: 'PROTO-215', name: 'Multi-Agent Explanation Protocol', abbr: 'MAEP', wire: 'intelligence-wire/maep'},
    {id: 'PROTO-216', name: 'Multi-Agent Arbitration Protocol', abbr: 'MAArP', wire: 'intelligence-wire/maarp'},
    {id: 'PROTO-217', name: 'Multi-Agent Swarm Protocol', abbr: 'MASrP', wire: 'intelligence-wire/masrp'},
    {id: 'PROTO-218', name: 'Multi-Agent Memory Sharing Protocol', abbr: 'MAMSP', wire: 'intelligence-wire/mamsp'},
    {id: 'PROTO-219', name: 'Multi-Agent Goal Alignment Protocol', abbr: 'MAGAP', wire: 'intelligence-wire/magap'},
    {id: 'PROTO-220', name: 'Multi-Agent Adversarial Testing Protocol', abbr: 'MAATP', wire: 'intelligence-wire/maatp'}
  ],
  privacy: [
    {id: 'PROTO-221', name: 'Differential Privacy Injection Protocol', abbr: 'DPIP', wire: 'intelligence-wire/dpip'},
    {id: 'PROTO-222', name: 'Homomorphic Analytics Protocol', abbr: 'HAP', wire: 'intelligence-wire/hap'},
    {id: 'PROTO-223', name: 'Secure Multi-Party Computation Protocol', abbr: 'SMPC', wire: 'intelligence-wire/smpc'},
    {id: 'PROTO-224', name: 'Privacy Budget Management Protocol', abbr: 'PBMP', wire: 'intelligence-wire/pbmp'},
    {id: 'PROTO-225', name: 'Anonymization Verification Protocol', abbr: 'AVP', wire: 'intelligence-wire/avp'}
  ],
  caching: [
    {id: 'PROTO-226', name: 'Predictive Cache Warming Protocol', abbr: 'PCWP', wire: 'intelligence-wire/pcwp'},
    {id: 'PROTO-227', name: 'Semantic Cache Invalidation Protocol', abbr: 'SCIP', wire: 'intelligence-wire/scip'},
    {id: 'PROTO-228', name: 'Hierarchical Cache Tiering Protocol', abbr: 'HCTP', wire: 'intelligence-wire/hctp'},
    {id: 'PROTO-229', name: 'Cache Coherence Consensus Protocol', abbr: 'CCCP', wire: 'intelligence-wire/cccp'}
  ],
  selfDoc: [
    {id: 'PROTO-230', name: 'Intent Annotation Protocol', abbr: 'IAP', wire: 'intelligence-wire/iap'},
    {id: 'PROTO-231', name: 'Living Documentation Protocol', abbr: 'LDP', wire: 'intelligence-wire/ldp'},
    {id: 'PROTO-232', name: 'Architecture Decision Record Protocol', abbr: 'ADRP-A', wire: 'intelligence-wire/adrp-a'}
  ],
  tenant: [
    {id: 'PROTO-233', name: 'Tenant Behavior Recognition Protocol', abbr: 'TBRP', wire: 'intelligence-wire/tbrp'},
    {id: 'PROTO-234', name: 'Tenant Resource Isolation Protocol', abbr: 'TRIP', wire: 'intelligence-wire/trip'},
    {id: 'PROTO-235', name: 'Autonomous Blue-Green Deployment Protocol', abbr: 'ABGDP', wire: 'intelligence-wire/abgdp'},
    {id: 'PROTO-236', name: 'Canary Analysis Protocol', abbr: 'CAP', wire: 'intelligence-wire/cap'},
    {id: 'PROTO-237', name: 'Feature Flag Intelligence Protocol', abbr: 'FFIP', wire: 'intelligence-wire/ffip'}
  ],
  chaosFederated: [
    {id: 'PROTO-238', name: 'Federated Model Aggregation Protocol', abbr: 'FMAP', wire: 'intelligence-wire/fmap'},
    {id: 'PROTO-239', name: 'Chaos Fault Injection Protocol', abbr: 'CFIP', wire: 'intelligence-wire/cfip'},
    {id: 'PROTO-240', name: 'Chaos Game Day Protocol', abbr: 'CGDP', wire: 'intelligence-wire/cgdp'},
    {id: 'PROTO-241', name: 'Autonomous Horizontal Scaling Protocol', abbr: 'AHSP', wire: 'intelligence-wire/ahsp'},
    {id: 'PROTO-242', name: 'Autonomous Vertical Scaling Protocol', abbr: 'AVSP', wire: 'intelligence-wire/avsp'},
    {id: 'PROTO-243', name: 'Elastic Capacity Planning Protocol', abbr: 'ECPP', wire: 'intelligence-wire/ecpp'}
  ],
  ethical: [
    {id: 'PROTO-244', name: 'Ethical Impact Assessment Protocol', abbr: 'EIAP', wire: 'intelligence-wire/eiap'},
    {id: 'PROTO-245', name: 'Real-Time Conflict Resolution Protocol', abbr: 'RTCRP', wire: 'intelligence-wire/rtcrp'},
    {id: 'PROTO-246', name: 'Autonomous Hyperparameter Tuning Protocol', abbr: 'AHTP', wire: 'intelligence-wire/ahtp'},
    {id: 'PROTO-247', name: 'Neural Architecture Search Protocol', abbr: 'NASP', wire: 'intelligence-wire/nasp'},
    {id: 'PROTO-248', name: 'Robust Digital Provenance Protocol', abbr: 'RDPP', wire: 'intelligence-wire/rdpp'},
    {id: 'PROTO-249', name: 'Workload Prediction Protocol', abbr: 'WPP', wire: 'intelligence-wire/wpp'},
    {id: 'PROTO-250', name: 'Terminal Command Intelligence Protocol', abbr: 'TCIP', wire: 'intelligence-wire/tcip'}
  ]
};

/* ── Protocol Caller ───────────────────────────────────────── */

function callProtocol(protoId, payload) {
  var reg = null;
  var divisions = Object.keys(PROTOCOL_REGISTRY);
  for (var i = 0; i < divisions.length; i++) {
    var protos = PROTOCOL_REGISTRY[divisions[i]];
    for (var j = 0; j < protos.length; j++) {
      if (protos[j].id === protoId) { reg = protos[j]; break; }
    }
    if (reg) break;
  }
  if (!reg) return { error: 'Protocol not found: ' + protoId };
  return {
    protocol: reg.id,
    name: reg.name,
    wire: reg.wire,
    payload: payload,
    timestamp: Date.now(),
    phi: PHI
  };
}

/* ── External Messaging API ────────────────────────────────── */

chrome.runtime.onMessageExternal.addListener(function(request, sender, sendResponse) {
  if (request.type === 'jarvis-status') {
    sendResponse({ status: 'online', version: '1.0.0', protocols: 250, heartbeat: HEARTBEAT });
  } else if (request.type === 'call-protocol') {
    sendResponse(callProtocol(request.protocol, request.payload));
  } else if (request.type === 'jarvis-command') {
    var engine = new JarvisEngine();
    var result = engine.processCommand(request.intent, request.payload);
    sendResponse(result);
  }
  return true;
});

/* ── Side Panel Setup ──────────────────────────────────────── */

chrome.runtime.onInstalled.addListener(function() {
  if (chrome.sidePanel) {
    chrome.sidePanel.setOptions({ path: 'sidepanel.html', enabled: true });
  }
});

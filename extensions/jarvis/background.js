/* ============================================================
 *  JARVIS AI — Background Service Worker
 *  AI sovereign assistant with full command routing
 * ============================================================ */

var PHI = 1.618033988749895;
var GOLDEN_ANGLE = 137.508;
var HEARTBEAT = 873;

/* ----------------------------------------------------------
 *  Protocol Registry — 10 Alpha Script AIs
 * ---------------------------------------------------------- */

var ProtocolRegistry = {
  agents: [
    { id: 'protocollum',   name: 'PROTOCOLLUM',   domain: 'Protocol governance and rule enforcement' },
    { id: 'terminalis',    name: 'TERMINALIS',    domain: 'Terminal operations and CLI orchestration' },
    { id: 'organismus',    name: 'ORGANISMUS',    domain: 'Organism lifecycle and biological modelling' },
    { id: 'mercator',      name: 'MERCATOR',      domain: 'Marketplace transactions and trade routing' },
    { id: 'orchestrator',  name: 'ORCHESTRATOR',  domain: 'Multi-agent coordination and task scheduling' },
    { id: 'mathematicus',  name: 'MATHEMATICUS',  domain: 'Mathematical computation and proof verification' },
    { id: 'synapticus',    name: 'SYNAPTICUS',    domain: 'Neural pathway simulation and learning models' },
    { id: 'substratum',    name: 'SUBSTRATUM',    domain: 'Infrastructure layer and substrate management' },
    { id: 'universum',     name: 'UNIVERSUM',     domain: 'Universal knowledge graph and ontology mapping' },
    { id: 'canistrum',     name: 'CANISTRUM',     domain: 'Canister deployment and Web3 smart contracts' }
  ],
  getAgent: function (id) {
    for (var i = 0; i < this.agents.length; i++) {
      if (this.agents[i].id === id) return this.agents[i];
    }
    return null;
  },
  listAgents: function () {
    return this.agents.map(function (a) { return { id: a.id, name: a.name, domain: a.domain }; });
  },
  routeToAgent: function (intent) {
    var mapping = {
      'search':           'universum',
      'navigate':         'terminalis',
      'create-document':  'protocollum',
      'create-pdf':       'protocollum',
      'summarize':        'synapticus',
      'read-page':        'synapticus',
      'chat':             'orchestrator',
      'tab-switch':       'terminalis',
      'tab-open':         'terminalis',
      'tab-close':        'terminalis',
      'list-tabs':        'terminalis',
      'open-url':         'terminalis',
      'take-note':        'organismus',
      'list-notes':       'organismus',
      'delete-note':      'organismus',
      'screenshot':       'substratum',
      'find-text':        'universum',
      'highlight':        'universum'
    };
    var agentId = mapping[intent] || 'orchestrator';
    return this.getAgent(agentId);
  }
};

/* ----------------------------------------------------------
 *  JarvisEngine — main engine class
 * ---------------------------------------------------------- */

function JarvisEngine() {
  this.startTime = Date.now();
  this.commandCount = 0;
  this.commandHistory = [];
  this.maxHistory = 200;
  this.state = {
    initialized: true,
    heartbeatCount: 0,
    version: '1.0.0',
    agent: 'JARVIS'
  };
  this._startHeartbeat();
  console.log('[JARVIS] Engine initialized — PHI=' + PHI + ' HEARTBEAT=' + HEARTBEAT + 'ms');
}

/* ----------------------------------------------------------
 *  Heartbeat
 * ---------------------------------------------------------- */

JarvisEngine.prototype._startHeartbeat = function () {
  var self = this;
  setInterval(function () {
    self.state.heartbeatCount++;
  }, HEARTBEAT);
};

/* ----------------------------------------------------------
 *  Command History
 * ---------------------------------------------------------- */

JarvisEngine.prototype._recordCommand = function (raw, parsed) {
  this.commandCount++;
  var entry = {
    id: this.commandCount,
    raw: raw,
    intent: parsed.intent,
    confidence: parsed.confidence,
    timestamp: Date.now(),
    agent: ProtocolRegistry.routeToAgent(parsed.intent)
  };
  this.commandHistory.unshift(entry);
  if (this.commandHistory.length > this.maxHistory) {
    this.commandHistory.pop();
  }
  return entry;
};

JarvisEngine.prototype.getHistory = function () {
  return this.commandHistory.slice(0);
};

JarvisEngine.prototype.getStatus = function () {
  var uptime = Date.now() - this.startTime;
  return {
    heartbeatCount: this.state.heartbeatCount,
    commandCount: this.commandCount,
    uptime: uptime,
    uptimeFormatted: this._formatUptime(uptime),
    version: this.state.version,
    agentCount: ProtocolRegistry.agents.length
  };
};

JarvisEngine.prototype._formatUptime = function (ms) {
  var s = Math.floor(ms / 1000);
  var h = Math.floor(s / 3600);
  var m = Math.floor((s % 3600) / 60);
  var sec = s % 60;
  return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
};

/* ----------------------------------------------------------
 *  Natural Language Parser — 18 intents
 * ---------------------------------------------------------- */

JarvisEngine.prototype.parseCommand = function (natural) {
  var text = (natural || '').toLowerCase().trim();
  var tokens = text.split(/\s+/);
  var intent = 'chat';
  var confidence = 0.3;
  var matchedKeywords = [];
  var params = {};

  // Intent detection with keyword matching
  var intentMap = [
    { intent: 'tab-switch',       keywords: ['switch tab', 'go to tab', 'activate tab', 'change tab', 'focus tab'] },
    { intent: 'tab-open',         keywords: ['new tab', 'open tab', 'create tab', 'add tab'] },
    { intent: 'tab-close',        keywords: ['close tab', 'kill tab', 'remove tab', 'shut tab'] },
    { intent: 'open-url',         keywords: ['open url', 'go to', 'navigate to', 'visit', 'browse to', 'open site', 'open page'] },
    { intent: 'create-pdf',       keywords: ['create pdf', 'generate pdf', 'make pdf', 'export pdf', 'save pdf', 'pdf'] },
    { intent: 'take-note',        keywords: ['take note', 'save note', 'add note', 'write note', 'remember', 'note this', 'jot down'] },
    { intent: 'list-notes',       keywords: ['list notes', 'show notes', 'my notes', 'all notes', 'view notes', 'get notes'] },
    { intent: 'delete-note',      keywords: ['delete note', 'remove note', 'erase note', 'clear note'] },
    { intent: 'screenshot',       keywords: ['screenshot', 'screen capture', 'capture screen', 'snap', 'take screenshot', 'grab screen'] },
    { intent: 'read-page',        keywords: ['read page', 'read this', 'get content', 'page content', 'extract text', 'get text'] },
    { intent: 'summarize',        keywords: ['summarize', 'summary', 'tldr', 'brief', 'overview', 'digest'] },
    { intent: 'navigate',         keywords: ['navigate', 'go back', 'go forward', 'reload', 'refresh'] },
    { intent: 'search',           keywords: ['search', 'look up', 'find online', 'google', 'query', 'search for'] },
    { intent: 'create-document',  keywords: ['create document', 'new document', 'make document', 'write document', 'draft'] },
    { intent: 'list-tabs',        keywords: ['list tabs', 'show tabs', 'all tabs', 'open tabs', 'tab list', 'which tabs'] },
    { intent: 'find-text',        keywords: ['find text', 'find on page', 'search page', 'ctrl f', 'locate text', 'find'] },
    { intent: 'highlight',        keywords: ['highlight', 'mark', 'emphasize', 'underline'] },
    { intent: 'chat',             keywords: ['chat', 'talk', 'tell me', 'hey jarvis', 'jarvis', 'hello', 'help'] }
  ];

  for (var i = 0; i < intentMap.length; i++) {
    var mapping = intentMap[i];
    for (var k = 0; k < mapping.keywords.length; k++) {
      var kw = mapping.keywords[k];
      if (text.indexOf(kw) !== -1) {
        intent = mapping.intent;
        confidence = 0.7 + (kw.length / text.length) * 0.3;
        matchedKeywords.push(kw);
        break;
      }
    }
    if (matchedKeywords.length > 0) break;
  }

  // Extract URL parameter
  var urlMatch = text.match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/);
  if (urlMatch) {
    params.url = urlMatch[0];
    if (intent === 'chat') {
      intent = 'open-url';
      confidence = 0.8;
    }
  }

  // Extract tab number
  var tabMatch = text.match(/tab\s*(?:#?\s*)?(\d+)/);
  if (tabMatch) {
    params.tabIndex = parseInt(tabMatch[1], 10);
  }

  // Extract note content (everything after the keyword trigger)
  if (intent === 'take-note') {
    var noteContent = text;
    var noteKeywords = ['take note', 'save note', 'add note', 'write note', 'remember', 'note this', 'jot down'];
    for (var n = 0; n < noteKeywords.length; n++) {
      var idx = noteContent.indexOf(noteKeywords[n]);
      if (idx !== -1) {
        noteContent = noteContent.substring(idx + noteKeywords[n].length).trim();
        break;
      }
    }
    // Remove leading colon/dash
    noteContent = noteContent.replace(/^[:–\-]\s*/, '');
    params.noteContent = noteContent || natural;
  }

  // Extract note id for deletion
  if (intent === 'delete-note') {
    var noteIdMatch = text.match(/(?:note\s*#?\s*|id\s*:?\s*)(\d+)/);
    if (noteIdMatch) {
      params.noteId = parseInt(noteIdMatch[1], 10);
    }
  }

  // Extract search query
  if (intent === 'search') {
    var searchContent = text;
    var searchKeywords = ['search for', 'search', 'look up', 'find online', 'google', 'query'];
    for (var s = 0; s < searchKeywords.length; s++) {
      var sIdx = searchContent.indexOf(searchKeywords[s]);
      if (sIdx !== -1) {
        searchContent = searchContent.substring(sIdx + searchKeywords[s].length).trim();
        break;
      }
    }
    params.searchQuery = searchContent;
  }

  // Extract find text query
  if (intent === 'find-text' || intent === 'highlight') {
    var findContent = text;
    var findKws = ['find text', 'find on page', 'search page', 'locate text', 'find', 'highlight', 'mark'];
    for (var f = 0; f < findKws.length; f++) {
      var fIdx = findContent.indexOf(findKws[f]);
      if (fIdx !== -1) {
        findContent = findContent.substring(fIdx + findKws[f].length).trim();
        break;
      }
    }
    params.query = findContent;
  }

  // Extract document title
  if (intent === 'create-document' || intent === 'create-pdf') {
    var docContent = text;
    var docKws = ['create document', 'new document', 'make document', 'write document', 'draft',
                  'create pdf', 'generate pdf', 'make pdf', 'export pdf'];
    for (var d = 0; d < docKws.length; d++) {
      var dIdx = docContent.indexOf(docKws[d]);
      if (dIdx !== -1) {
        docContent = docContent.substring(dIdx + docKws[d].length).trim();
        break;
      }
    }
    docContent = docContent.replace(/^[:–\-]\s*/, '');
    params.documentTitle = docContent || 'Untitled Document';
    params.documentContent = natural;
  }

  // Boost confidence with PHI ratio for multi-keyword matches
  if (matchedKeywords.length > 1) {
    confidence = Math.min(confidence * PHI, 1.0);
  }

  var parsed = {
    raw: natural,
    intent: intent,
    confidence: Math.round(confidence * 100) / 100,
    matchedKeywords: matchedKeywords,
    params: params,
    tokens: tokens,
    timestamp: Date.now()
  };

  this._recordCommand(natural, parsed);
  return parsed;
};

/* ----------------------------------------------------------
 *  Action Builder — converts parsed command to executable
 * ---------------------------------------------------------- */

JarvisEngine.prototype.buildAction = function (parsed) {
  var agent = ProtocolRegistry.routeToAgent(parsed.intent);
  var action = {
    type: parsed.intent,
    agent: agent ? agent.name : 'ORCHESTRATOR',
    payload: {},
    timestamp: Date.now()
  };

  switch (parsed.intent) {
    case 'tab-switch':
      action.payload.tabIndex = parsed.params.tabIndex || 1;
      break;
    case 'tab-open':
      action.payload.url = parsed.params.url || 'chrome://newtab';
      break;
    case 'tab-close':
      action.payload.tabIndex = parsed.params.tabIndex || null;
      break;
    case 'open-url':
      action.payload.url = parsed.params.url || '';
      break;
    case 'create-pdf':
      action.payload.title = parsed.params.documentTitle || 'JARVIS Document';
      action.payload.content = parsed.params.documentContent || '';
      break;
    case 'take-note':
      action.payload.content = parsed.params.noteContent || parsed.raw;
      action.payload.author = 'Alfredo';
      break;
    case 'list-notes':
      break;
    case 'delete-note':
      action.payload.noteId = parsed.params.noteId || null;
      break;
    case 'screenshot':
      break;
    case 'read-page':
      break;
    case 'summarize':
      break;
    case 'navigate':
      action.payload.direction = 'reload';
      if (parsed.raw.indexOf('back') !== -1) action.payload.direction = 'back';
      if (parsed.raw.indexOf('forward') !== -1) action.payload.direction = 'forward';
      break;
    case 'search':
      action.payload.query = parsed.params.searchQuery || '';
      break;
    case 'create-document':
      action.payload.title = parsed.params.documentTitle || 'JARVIS Document';
      action.payload.content = parsed.params.documentContent || '';
      break;
    case 'list-tabs':
      break;
    case 'find-text':
      action.payload.query = parsed.params.query || '';
      break;
    case 'highlight':
      action.payload.query = parsed.params.query || '';
      break;
    case 'chat':
      action.payload.message = parsed.raw;
      break;
    default:
      action.payload.message = parsed.raw;
  }

  return action;
};

/* ----------------------------------------------------------
 *  Command Executors
 * ---------------------------------------------------------- */

// Tab operations
JarvisEngine.prototype.executeTabSwitch = function (tabIndex, callback) {
  chrome.tabs.query({}, function (tabs) {
    if (tabIndex < 1 || tabIndex > tabs.length) {
      callback({ success: false, message: 'Tab ' + tabIndex + ' out of range. ' + tabs.length + ' tabs open (1-' + tabs.length + ').' });
      return;
    }
    var idx = tabIndex - 1;
    if (tabs[idx]) {
      chrome.tabs.update(tabs[idx].id, { active: true }, function () {
        callback({ success: true, message: 'Switched to tab ' + tabIndex + ': ' + tabs[idx].title });
      });
    } else {
      callback({ success: false, message: 'Tab ' + tabIndex + ' not found. ' + tabs.length + ' tabs open.' });
    }
  });
};

JarvisEngine.prototype.executeTabOpen = function (url, callback) {
  chrome.tabs.create({ url: url || 'chrome://newtab' }, function (tab) {
    callback({ success: true, message: 'Opened new tab: ' + (url || 'New Tab'), tabId: tab.id });
  });
};

JarvisEngine.prototype.executeTabClose = function (tabIndex, callback) {
  if (tabIndex) {
    chrome.tabs.query({}, function (tabs) {
      var idx = Math.max(0, Math.min(tabIndex - 1, tabs.length - 1));
      if (tabs[idx]) {
        var title = tabs[idx].title;
        chrome.tabs.remove(tabs[idx].id, function () {
          callback({ success: true, message: 'Closed tab ' + tabIndex + ': ' + title });
        });
      } else {
        callback({ success: false, message: 'Tab ' + tabIndex + ' not found.' });
      }
    });
  } else {
    chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
      if (tabs[0]) {
        var title = tabs[0].title;
        chrome.tabs.remove(tabs[0].id, function () {
          callback({ success: true, message: 'Closed current tab: ' + title });
        });
      }
    });
  }
};

JarvisEngine.prototype.executeListTabs = function (callback) {
  chrome.tabs.query({}, function (tabs) {
    var tabList = tabs.map(function (t, i) {
      return {
        index: i + 1,
        id: t.id,
        title: t.title || 'Untitled',
        url: t.url || '',
        active: t.active,
        favIconUrl: t.favIconUrl || ''
      };
    });
    callback({ success: true, tabs: tabList, message: tabList.length + ' tabs open' });
  });
};

JarvisEngine.prototype.executeOpenUrl = function (url, callback) {
  if (!url) {
    callback({ success: false, message: 'No URL provided' });
    return;
  }
  if (url.indexOf('://') === -1) {
    url = 'https://' + url;
  }
  chrome.tabs.create({ url: url }, function (tab) {
    callback({ success: true, message: 'Opened: ' + url, tabId: tab.id });
  });
};

// Note operations
JarvisEngine.prototype.executeTakeNote = function (content, callback) {
  var self = this;
  chrome.storage.local.get({ 'jarvis_notes': [] }, function (data) {
    var notes = data.jarvis_notes || [];
    var note = {
      id: Date.now(),
      content: content,
      author: 'Alfredo',
      timestamp: Date.now(),
      date: new Date().toISOString()
    };
    notes.unshift(note);
    chrome.storage.local.set({ 'jarvis_notes': notes }, function () {
      callback({ success: true, message: 'Note saved by Alfredo: "' + content.substring(0, 50) + (content.length > 50 ? '…' : '') + '"', note: note });
    });
  });
};

JarvisEngine.prototype.executeListNotes = function (callback) {
  chrome.storage.local.get({ 'jarvis_notes': [] }, function (data) {
    var notes = data.jarvis_notes || [];
    callback({ success: true, notes: notes, message: notes.length + ' notes stored' });
  });
};

JarvisEngine.prototype.executeDeleteNote = function (noteId, callback) {
  chrome.storage.local.get({ 'jarvis_notes': [] }, function (data) {
    var notes = data.jarvis_notes || [];
    var idx = -1;
    for (var i = 0; i < notes.length; i++) {
      if (notes[i].id === noteId) { idx = i; break; }
    }
    if (idx !== -1) {
      var removed = notes.splice(idx, 1)[0];
      chrome.storage.local.set({ 'jarvis_notes': notes }, function () {
        callback({ success: true, message: 'Note deleted: "' + removed.content.substring(0, 40) + '"' });
      });
    } else if (noteId === null && notes.length > 0) {
      var last = notes.shift();
      chrome.storage.local.set({ 'jarvis_notes': notes }, function () {
        callback({ success: true, message: 'Deleted most recent note: "' + last.content.substring(0, 40) + '"' });
      });
    } else {
      callback({ success: false, message: 'Note not found' });
    }
  });
};

// Screenshot
JarvisEngine.prototype.executeScreenshot = function (callback) {
  chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Screenshot failed: ' + chrome.runtime.lastError.message });
      return;
    }
    var timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    var filename = 'jarvis-screenshot-' + timestamp + '.png';
    chrome.downloads.download({
      url: dataUrl,
      filename: filename,
      saveAs: false
    }, function (downloadId) {
      callback({ success: true, message: 'Screenshot saved: ' + filename, downloadId: downloadId, dataUrl: dataUrl });
    });
  });
};

// Page reading — inject script to get page content
JarvisEngine.prototype.executeReadPage = function (tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function () {
      var headings = [];
      var hTags = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
      for (var i = 0; i < Math.min(hTags.length, 20); i++) {
        headings.push({ tag: hTags[i].tagName, text: hTags[i].innerText.substring(0, 100) });
      }
      return {
        title: document.title,
        url: window.location.href,
        text: document.body.innerText.substring(0, 5000),
        headings: headings,
        wordCount: document.body.innerText.split(/\s+/).length,
        linkCount: document.querySelectorAll('a').length,
        imageCount: document.querySelectorAll('img').length,
        metaDescription: (document.querySelector('meta[name="description"]') || {}).content || ''
      };
    }
  }, function (results) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Could not read page: ' + chrome.runtime.lastError.message });
      return;
    }
    var pageData = results && results[0] && results[0].result;
    if (pageData) {
      callback({ success: true, pageData: pageData, message: 'Page read: ' + pageData.title + ' (' + pageData.wordCount + ' words)' });
    } else {
      callback({ success: false, message: 'No page data returned' });
    }
  });
};

// Summarize (uses page reading + local summary generation)
JarvisEngine.prototype.executeSummarize = function (tabId, callback) {
  this.executeReadPage(tabId, function (result) {
    if (!result.success) {
      callback(result);
      return;
    }
    var pd = result.pageData;
    var sentences = pd.text.split(/[.!?]+/).filter(function (s) { return s.trim().length > 20; });
    var topSentences = sentences.slice(0, 5).map(function (s) { return s.trim() + '.'; });
    var summary = {
      title: pd.title,
      url: pd.url,
      wordCount: pd.wordCount,
      headingCount: pd.headings.length,
      linkCount: pd.linkCount,
      imageCount: pd.imageCount,
      keyPoints: topSentences,
      metaDescription: pd.metaDescription
    };
    callback({
      success: true,
      summary: summary,
      message: 'Summary of "' + pd.title + '": ' + pd.wordCount + ' words, ' + pd.headings.length + ' headings, ' + topSentences.length + ' key points'
    });
  });
};

// Navigate (back, forward, reload)
JarvisEngine.prototype.executeNavigate = function (direction, tabId, callback) {
  switch (direction) {
    case 'back':
      chrome.scripting.executeScript({ target: { tabId: tabId }, func: function () { history.back(); } }, function () {
        callback({ success: true, message: 'Navigated back' });
      });
      break;
    case 'forward':
      chrome.scripting.executeScript({ target: { tabId: tabId }, func: function () { history.forward(); } }, function () {
        callback({ success: true, message: 'Navigated forward' });
      });
      break;
    default:
      chrome.tabs.reload(tabId, function () {
        callback({ success: true, message: 'Page reloaded' });
      });
  }
};

// Search — in-panel sandbox via DuckDuckGo API, or new tab fallback
JarvisEngine.prototype.executeSearch = function (query, callback, sandboxMode) {
  if (!query) {
    callback({ success: false, message: 'No search query provided' });
    return;
  }
  if (sandboxMode) {
    // Return signal for sidepanel to switch to Search tab and run sandbox search
    callback({ success: true, message: 'Opening sandbox search for: "' + query + '"', sandboxQuery: query });
    return;
  }
  var searchUrl = 'https://www.google.com/search?q=' + encodeURIComponent(query);
  chrome.tabs.create({ url: searchUrl }, function (tab) {
    callback({ success: true, message: 'Searching: "' + query + '"', tabId: tab.id });
  });
};

// Create document stub
JarvisEngine.prototype.executeCreateDocument = function (title, content, callback) {
  var self = this;
  var doc = {
    id: Date.now(),
    title: title,
    content: content,
    author: 'Alfredo',
    type: 'document',
    timestamp: Date.now(),
    date: new Date().toISOString()
  };
  chrome.storage.local.get({ 'jarvis_documents': [] }, function (data) {
    var docs = data.jarvis_documents || [];
    docs.unshift(doc);
    chrome.storage.local.set({ 'jarvis_documents': docs }, function () {
      callback({ success: true, message: 'Document created: "' + title + '"', document: doc });
    });
  });
};

// Create PDF — generates data and sends to content script for rendering
JarvisEngine.prototype.executeCreatePdf = function (title, content, tabId, callback) {
  var pdfData = {
    title: title || 'JARVIS Document',
    content: content || '',
    author: 'Alfredo',
    timestamp: Date.now(),
    date: new Date().toISOString()
  };

  chrome.storage.local.get({ 'jarvis_documents': [] }, function (data) {
    var docs = data.jarvis_documents || [];
    var doc = {
      id: Date.now(),
      title: pdfData.title,
      content: pdfData.content,
      author: pdfData.author,
      type: 'pdf',
      timestamp: pdfData.timestamp,
      date: pdfData.date
    };
    docs.unshift(doc);
    chrome.storage.local.set({ 'jarvis_documents': docs }, function () {
      // Notify content script to render the PDF overlay
      if (tabId) {
        chrome.tabs.sendMessage(tabId, {
          action: 'renderPdf',
          data: pdfData
        });
      }
      callback({ success: true, message: 'PDF generated: "' + pdfData.title + '"', document: doc });
    });
  });
};

// Find text — injects script into active tab
JarvisEngine.prototype.executeFindText = function (query, tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function (q) {
      return window.find(q);
    },
    args: [query]
  }, function (results) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Find failed: ' + chrome.runtime.lastError.message });
      return;
    }
    var found = results && results[0] && results[0].result;
    callback({ success: true, found: found, message: found ? 'Found: "' + query + '"' : 'Not found: "' + query + '"' });
  });
};

// Highlight text on page
JarvisEngine.prototype.executeHighlight = function (query, tabId, callback) {
  chrome.scripting.executeScript({
    target: { tabId: tabId },
    func: function (q) {
      var walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null, false);
      var count = 0;
      var node;
      while ((node = walker.nextNode())) {
        if (node.nodeValue.toLowerCase().indexOf(q.toLowerCase()) !== -1) {
          var span = document.createElement('mark');
          span.style.backgroundColor = '#6c63ff';
          span.style.color = '#ffffff';
          span.style.padding = '1px 3px';
          span.style.borderRadius = '2px';
          var parent = node.parentNode;
          var parts = node.nodeValue.split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
          for (var i = 0; i < parts.length; i++) {
            if (parts[i].toLowerCase() === q.toLowerCase()) {
              var mark = span.cloneNode(false);
              mark.textContent = parts[i];
              parent.insertBefore(mark, node);
              count++;
            } else {
              parent.insertBefore(document.createTextNode(parts[i]), node);
            }
          }
          parent.removeChild(node);
        }
      }
      return count;
    },
    args: [query]
  }, function (results) {
    if (chrome.runtime.lastError) {
      callback({ success: false, message: 'Highlight failed: ' + chrome.runtime.lastError.message });
      return;
    }
    var count = results && results[0] && results[0].result;
    callback({ success: true, count: count || 0, message: 'Highlighted ' + (count || 0) + ' occurrences of "' + query + '"' });
  });
};

// Chat — local response generation
JarvisEngine.prototype.executeChat = function (message, callback) {
  var responses = [
    'I\'m JARVIS, your AI sovereign assistant. How can I help?',
    'At your service. Try commands like "switch tab 2", "take note", or "screenshot".',
    'I can manage tabs, take notes, capture screenshots, search the web, and more.',
    'Need help? Say "list tabs", "take note: something", "summarize", or "search for topic".',
    'JARVIS online. ' + ProtocolRegistry.agents.length + ' Alpha Script AIs at your disposal.',
    'Routed through ORCHESTRATOR. All systems nominal — heartbeat ' + this.state.heartbeatCount + '.',
    'Ready. Try asking me to open a URL, switch tabs, or create a document.'
  ];
  var idx = Math.floor(Math.abs(Math.sin(Date.now() * GOLDEN_ANGLE)) * responses.length);
  var response = responses[idx % responses.length];
  callback({ success: true, message: response, agent: 'JARVIS' });
};

/* ----------------------------------------------------------
 *  Master Command Router
 * ---------------------------------------------------------- */

JarvisEngine.prototype.executeCommand = function (natural, tabId, callback) {
  var parsed = this.parseCommand(natural);
  var action = this.buildAction(parsed);
  var self = this;

  switch (action.type) {
    case 'tab-switch':
      self.executeTabSwitch(action.payload.tabIndex, callback);
      break;
    case 'tab-open':
      self.executeTabOpen(action.payload.url, callback);
      break;
    case 'tab-close':
      self.executeTabClose(action.payload.tabIndex, callback);
      break;
    case 'open-url':
      self.executeOpenUrl(action.payload.url, callback);
      break;
    case 'create-pdf':
      self.executeCreatePdf(action.payload.title, action.payload.content, tabId, callback);
      break;
    case 'take-note':
      self.executeTakeNote(action.payload.content, callback);
      break;
    case 'list-notes':
      self.executeListNotes(callback);
      break;
    case 'delete-note':
      self.executeDeleteNote(action.payload.noteId, callback);
      break;
    case 'screenshot':
      self.executeScreenshot(callback);
      break;
    case 'read-page':
      self.executeReadPage(tabId, callback);
      break;
    case 'summarize':
      self.executeSummarize(tabId, callback);
      break;
    case 'navigate':
      self.executeNavigate(action.payload.direction, tabId, callback);
      break;
    case 'search':
      self.executeSearch(action.payload.query, callback);
      break;
    case 'create-document':
      self.executeCreateDocument(action.payload.title, action.payload.content, callback);
      break;
    case 'list-tabs':
      self.executeListTabs(callback);
      break;
    case 'find-text':
      self.executeFindText(action.payload.query, tabId, callback);
      break;
    case 'highlight':
      self.executeHighlight(action.payload.query, tabId, callback);
      break;
    case 'chat':
      self.executeChat(action.payload.message, callback);
      break;
    default:
      callback({ success: false, message: 'Unknown command intent: ' + action.type });
  }
};

/* ----------------------------------------------------------
 *  Side Panel — open on action button click
 * ---------------------------------------------------------- */

chrome.action.onClicked.addListener(function (tab) {
  chrome.sidePanel.open({ windowId: tab.windowId });
});

/* ----------------------------------------------------------
 *  Message Listener — routes all messages from content/popup/sidepanel
 * ---------------------------------------------------------- */

globalThis.jarvisEngine = new JarvisEngine();

chrome.runtime.onMessage.addListener(function (message, sender, sendResponse) {
  var engine = globalThis.jarvisEngine;

  switch (message.action) {
    case 'executeCommand':
      var tabId = (sender.tab && sender.tab.id) || null;
      if (message.tabId) tabId = message.tabId;
      // Get active tab if no tabId
      if (!tabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var activeTabId = (tabs[0] && tabs[0].id) || null;
          engine.executeCommand(message.command, activeTabId, function (result) {
            sendResponse(result);
          });
        });
      } else {
        engine.executeCommand(message.command, tabId, function (result) {
          sendResponse(result);
        });
      }
      break;

    case 'parseCommand':
      var parsed = engine.parseCommand(message.command);
      var builtAction = engine.buildAction(parsed);
      sendResponse({ success: true, data: { parsed: parsed, action: builtAction } });
      break;

    case 'getHistory':
      sendResponse({ success: true, data: engine.getHistory() });
      break;

    case 'getStatus':
      sendResponse({ success: true, data: engine.getStatus() });
      break;

    case 'listTabs':
      engine.executeListTabs(function (result) {
        sendResponse(result);
      });
      break;

    case 'listNotes':
      engine.executeListNotes(function (result) {
        sendResponse(result);
      });
      break;

    case 'deleteNote':
      engine.executeDeleteNote(message.noteId, function (result) {
        sendResponse(result);
      });
      break;

    case 'takeNote':
      engine.executeTakeNote(message.content, function (result) {
        sendResponse(result);
      });
      break;

    case 'screenshot':
      engine.executeScreenshot(function (result) {
        sendResponse(result);
      });
      break;

    case 'readPage':
      var rpTabId = message.tabId;
      if (!rpTabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          engine.executeReadPage(tabs[0] && tabs[0].id, function (result) {
            sendResponse(result);
          });
        });
      } else {
        engine.executeReadPage(rpTabId, function (result) {
          sendResponse(result);
        });
      }
      break;

    case 'summarize':
      var sumTabId = message.tabId;
      if (!sumTabId) {
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          engine.executeSummarize(tabs[0] && tabs[0].id, function (result) {
            sendResponse(result);
          });
        });
      } else {
        engine.executeSummarize(sumTabId, function (result) {
          sendResponse(result);
        });
      }
      break;

    case 'openSidePanel':
      if (sender.tab) {
        chrome.sidePanel.open({ windowId: sender.tab.windowId });
      }
      sendResponse({ success: true });
      break;

    case 'getAgents':
      sendResponse({ success: true, agents: ProtocolRegistry.listAgents() });
      break;

    case 'listDocuments':
      chrome.storage.local.get({ 'jarvis_documents': [] }, function (data) {
        sendResponse({ success: true, documents: data.jarvis_documents || [] });
      });
      break;

    case 'switchTab':
      engine.executeTabSwitch(message.tabIndex, function (result) {
        sendResponse(result);
      });
      break;

    case 'sandboxSearch':
      fetch('https://api.duckduckgo.com/?q=' + encodeURIComponent(message.query) + '&format=json&no_html=1&no_redirect=1&skip_disambig=1')
        .then(function (r) { return r.json(); })
        .then(function (data) {
          var results = [];
          if (data.Answer) {
            results.push({ type: 'answer', title: 'Instant Answer', text: data.Answer, url: '', source: data.AnswerType || '' });
          }
          if (data.AbstractText) {
            results.push({ type: 'abstract', title: data.Heading || 'Overview', text: data.AbstractText, url: data.AbstractURL || '', source: data.AbstractSource || '' });
          }
          if (data.Results) {
            data.Results.slice(0, 4).forEach(function (r) {
              if (r.Text) results.push({ type: 'result', title: r.Text.substring(0, 80), text: r.Text, url: r.FirstURL || '', source: 'web' });
            });
          }
          if (data.RelatedTopics) {
            data.RelatedTopics.slice(0, 6).forEach(function (t) {
              if (t.Text && t.FirstURL) {
                results.push({ type: 'related', title: t.Text.split(' - ')[0].substring(0, 80), text: t.Text, url: t.FirstURL, source: 'duckduckgo' });
              }
            });
          }
          sendResponse({ success: true, results: results, query: message.query, definition: data.Definition || '', entity: data.Entity || '' });
        })
        .catch(function (e) {
          sendResponse({ success: false, message: 'Search failed: ' + e.message });
        });
      break;

    case 'captureTab':
      chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
        if (!tabs[0]) {
          sendResponse({ success: false, message: 'No active tab found' });
          return;
        }
        chrome.tabs.captureVisibleTab(null, { format: 'png' }, function (dataUrl) {
          if (chrome.runtime.lastError) {
            sendResponse({ success: false, message: chrome.runtime.lastError.message });
            return;
          }
          sendResponse({ success: true, dataUrl: dataUrl, title: tabs[0].title, url: tabs[0].url });
        });
      });
      break;

    default:
      sendResponse({ success: false, error: 'Unknown action: ' + message.action });
  }

  return true; // Keep message channel open for async responses
});

/* ----------------------------------------------------------
 *  24/7 Keep-Alive Alarm
 * ---------------------------------------------------------- */

(function () {
  var ALARM_NAME = 'jarvis-keepalive';
  var ALARM_PERIOD = 0.4; // ~24 seconds

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });

  chrome.alarms.onAlarm.addListener(function (alarm) {
    if (alarm.name !== ALARM_NAME) return;

    if (!globalThis.jarvisEngine) {
      globalThis.jarvisEngine = new JarvisEngine();
      console.log('[JARVIS] Engine re-initialized by keepalive alarm');
    }

    try {
      chrome.storage.local.set({
        'jarvis_state': {
          commandCount: globalThis.jarvisEngine.commandCount || 0,
          heartbeatCount: globalThis.jarvisEngine.state.heartbeatCount || 0,
          lastAlive: Date.now()
        }
      });
    } catch (e) { /* ignore storage errors */ }
  });

  chrome.storage.local.get('jarvis_state', function (data) {
    if (data && data.jarvis_state) {
      console.log('[JARVIS] Restored — last alive: ' + new Date(data.jarvis_state.lastAlive).toISOString());
    }
  });

  chrome.runtime.onInstalled.addListener(function () {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
    chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(function () {});
    console.log('[JARVIS] Installed — 24/7 keepalive active, side panel enabled');
  });
})();

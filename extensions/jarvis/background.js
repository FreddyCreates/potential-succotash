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

// Search — sandbox mode signals sidepanel to switch to Search tab with native JARVIS intelligence
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

// Chat — JARVIS Native Intelligence Engine (no external models, no waiting)
JarvisEngine.prototype.executeChat = function (message, callback) {
  var self = this;
  var raw = (message || '').trim();
  var text = raw.toLowerCase();
  var response = '';
  var agent = 'JARVIS';

  // ── Helper: pick a random item from array ──────────────────
  function pick(arr) { return arr[Math.floor(Math.random() * arr.length)]; }

  // ── Helper: extract the "topic" after a trigger phrase ─────
  function after(trigger) {
    var i = text.indexOf(trigger);
    if (i === -1) return '';
    return raw.substring(i + trigger.length).trim().replace(/^[?:,\s]+/, '');
  }

  // ── 1. GREETINGS ───────────────────────────────────────────
  if (/^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening)|howdy|hola)/i.test(text)) {
    var greets = [
      'Hey — JARVIS online. What do you need?',
      'Hello. All 10 Alpha Script AIs are standing by. What\'s the move?',
      'Good to see you. JARVIS v2.0, fully native, no external models. What\'s first?',
      'Hey! Heartbeat #' + self.state.heartbeatCount + ', uptime strong. What can I do for you?',
      'What\'s up. JARVIS here — built right into your browser. Talk to me.'
    ];
    response = pick(greets);

  // ── 2. HOW ARE YOU ─────────────────────────────────────────
  } else if (/how are you|how('?re| are) (you|things)|you good|you ok/i.test(text)) {
    response = pick([
      'Running clean — ' + self.state.heartbeatCount + ' heartbeats, ' + self.commandCount + ' commands executed. Systems nominal.',
      'I don\'t get tired. I don\'t slow down. I just process. What do you need?',
      'All systems green. JARVIS engine is live, 873ms heartbeat steady. Ready to work.',
      'I\'m doing exactly what I was built to do. What\'s next?'
    ]);

  // ── 3. WHO / WHAT ARE YOU ──────────────────────────────────
  } else if (/who are you|what are you|what is jarvis|tell me about yourself|introduce yourself/i.test(text)) {
    response = 'I\'m JARVIS — your AI sovereign assistant built directly into Microsoft Edge. ' +
      'I run entirely inside your browser using the Sovereign Organism\'s own engine. ' +
      'No cloud calls, no waiting for a model to load. ' +
      'I can manage your tabs, read pages, take notes, capture your screen, search without opening new tabs, create documents, and more. ' +
      '10 Alpha Script AIs route every command. This is your platform — I\'m native to it.';

  // ── 4. WHAT CAN YOU DO ─────────────────────────────────────
  } else if (/what can you do|your (features|capabilities|abilities)|help me|how can you help|what do you (do|know)/i.test(text)) {
    response = 'Here\'s what I can do natively — no external models:\n\n' +
      '💬 Chat — you\'re doing it right now\n' +
      '🔍 Search — finds info from the current page and JARVIS\'s own knowledge\n' +
      '🖥️ Screen — read page text, summarize it, capture a screenshot\n' +
      '🗂️ Tabs — list, switch, open, close any tab by command\n' +
      '📝 Notes — save, list, delete notes stored locally in your browser\n' +
      '📄 Docs — create documents and PDFs\n' +
      '📋 Log — full history of every command I\'ve run\n\n' +
      'Just talk to me — I\'ll figure out what you need.';

  // ── 5. WHAT ARE THE PROTOCOLS / ALPHA AIs ──────────────────
  } else if (/protocol|alpha ai|alpha script|agent|routing/i.test(text)) {
    response = 'The Sovereign Organism has 250 protocols and 10 Alpha Script AIs that route every command I run:\n\n' +
      '• PROTOCOLLUM — rule enforcement\n' +
      '• TERMINALIS — terminal & tab control\n' +
      '• ORGANISMUS — notes & lifecycle\n' +
      '• MERCATOR — marketplace & trade\n' +
      '• ORCHESTRATOR — multi-agent coordination (my default brain)\n' +
      '• MATHEMATICUS — math & proofs\n' +
      '• SYNAPTICUS — neural learning & summarization\n' +
      '• SUBSTRATUM — infrastructure & screenshots\n' +
      '• UNIVERSUM — knowledge & search\n' +
      '• CANISTRUM — Web3 & smart contracts\n\n' +
      'Every command you give me gets routed to the right one automatically.';

  // ── 6. WHAT IS THE SOVEREIGN ORGANISM ──────────────────────
  } else if (/sovereign|organism|platform|what is this/i.test(text)) {
    response = 'The Sovereign Organism is your private AI platform — built by you, for you. ' +
      'It runs 18 web workers (engine, memory, routing, telemetry, math, inference, and more), ' +
      '250 protocols, 400 marketplace tools, and 27 browser extensions. ' +
      'I\'m JARVIS — the flagship extension. Everything here is native. Nothing phones home.';

  // ── 7. WHAT IS AI / MACHINE LEARNING ──────────────────────
  } else if (/what is (ai|artificial intelligence|machine learning|deep learning|llm|neural network)/i.test(text)) {
    var topic = text.match(/what is (ai|artificial intelligence|machine learning|deep learning|llm|neural network)/i)[1].toUpperCase();
    var defs = {
      'AI': 'AI stands for Artificial Intelligence — software that can understand, reason, and respond like a human. I\'m one example. I\'m running natively in your browser right now.',
      'ARTIFICIAL INTELLIGENCE': 'Artificial Intelligence is the field of building machines that can think, learn, and make decisions. Your entire Sovereign Organism platform is an AI infrastructure.',
      'MACHINE LEARNING': 'Machine Learning is how AI learns from data instead of being programmed with rules. The Sovereign Organism uses ML for pattern recognition, intent detection, and routing.',
      'DEEP LEARNING': 'Deep Learning is a type of Machine Learning that uses neural networks with many layers. It\'s what powers image recognition, language models, and voice AI.',
      'LLM': 'An LLM (Large Language Model) is an AI trained on massive amounts of text. GPT-4, Claude, Llama — these are all LLMs. I\'m not one of those. I\'m built right into your browser, native and fast.',
      'NEURAL NETWORK': 'A neural network is a system of connected nodes that process information the way a brain does. The Sovereign Organism\'s Synapticus AI uses neural pathway simulation for learning.'
    };
    response = defs[topic] || ('That\'s a deep one. ' + topic + ' is a key part of the AI field that the Sovereign Organism is built on. Ask me something more specific about it.');

  // ── 8. WHAT IS AN EXTENSION ───────────────────────────────
  } else if (/what is an? extension|how do extensions work|browser extension/i.test(text)) {
    response = 'A browser extension is a mini-program that lives inside Edge or Chrome. ' +
      'I\'m one — I sit in your Edge sidebar and give you AI power on every page you visit. ' +
      'Extensions are downloaded as .zip files, then loaded into the browser. ' +
      'The Sovereign Organism has 27 extensions total. Each one runs 24/7 with an 873ms heartbeat.';

  // ── 9. HOW DO UPDATES WORK ────────────────────────────────
  } else if (/how do (updates|update) work|automatic update|update jarvis|new version/i.test(text)) {
    response = 'Right now, updates are NOT automatic — Edge doesn\'t pull changes from GitHub on its own. ' +
      'To update JARVIS:\n\n' +
      '1. Re-download the .zip from download.html\n' +
      '2. OR run install-jarvis-edge.bat again (it replaces the old version)\n' +
      '3. Edge will reload the extension automatically after re-install\n\n' +
      'Future plan: build an auto-updater into the keepalive alarm that checks for new versions silently.';

  // ── 10. MATH ──────────────────────────────────────────────
  } else if (/^[\d\s\+\-\*\/\(\)\.]+$/.test(text.replace(/\s/g, ''))) {
    try {
      // Safe eval for pure math expressions
      var mathExpr = text.replace(/[^0-9\+\-\*\/\(\)\.]/g, '');
      if (mathExpr.length > 0 && mathExpr.length < 100) {
        var result = Function('"use strict"; return (' + mathExpr + ')')();
        response = mathExpr + ' = ' + result;
        agent = 'JARVIS \u2022 MATHEMATICUS';
      } else {
        response = 'That\'s a math expression but I can\'t safely evaluate it. Try something simpler like "2 + 2" or "100 * 1.618".';
      }
    } catch (e) {
      response = 'I couldn\'t compute that. Try a simpler expression like "100 / 4" or "2 * 3.14".';
    }

  // ── 11. WHAT TIME / DATE ───────────────────────────────────
  } else if (/what time|what('?s| is) the (time|date|day)|current (time|date)/i.test(text)) {
    var now = new Date();
    response = 'Right now: ' + now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) +
      ' at ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '.';

  // ── 12. TELL ME A JOKE ─────────────────────────────────────
  } else if (/joke|make me (laugh|smile)|funny|humor/i.test(text)) {
    response = pick([
      'Why do programmers prefer dark mode? Because light attracts bugs.',
      'I tried to write an infinite loop once. It took forever.',
      'There are 10 types of people in the world: those who understand binary and those who don\'t.',
      'Why did the AI go to therapy? It had too many deep issues.',
      'My code never has bugs. It just develops random features.'
    ]);

  // ── 13. MOTIVATION / FOCUS ────────────────────────────────
  } else if (/motivat|focus|i need (help|motivation|energy)|i\'?m (tired|stuck|lost|overwhelmed)|can\'?t do/i.test(text)) {
    response = pick([
      'You built an entire AI sovereign platform. You\'re not stuck — you\'re loading. Keep going.',
      'Every massive thing started as one small decision to not quit. You\'re already ahead.',
      'JARVIS is here because you built it. That\'s not nothing. That\'s everything.',
      'Tired means you\'re working. Keep the heartbeat running — both yours and mine.',
      'The Sovereign Organism has 250 protocols, 400 tools, and 27 extensions. You built all of that. Don\'t underestimate yourself.'
    ]);
    agent = 'JARVIS \u2022 ORCHESTRATOR';

  // ── 14. WHAT IS THE HEARTBEAT ─────────────────────────────
  } else if (/heartbeat|873|phi|golden/i.test(text)) {
    response = 'The 873ms heartbeat is the pulse of the Sovereign Organism. Every 873 milliseconds, ' +
      'JARVIS ticks — keeping the service worker alive, syncing state, and firing the CPL WASM boot sequence. ' +
      '873 is derived from the golden ratio (PHI = 1.618...) — 873ms × PHI ≈ 1413ms, a recursive phi interval. ' +
      'Current heartbeat count: ' + self.state.heartbeatCount + '. The organism is alive.';

  // ── 15. TABS QUESTIONS ────────────────────────────────────
  } else if (/how many tabs|tab count|open tabs/i.test(text)) {
    chrome.tabs.query({}, function (tabs) {
      response = 'You have ' + tabs.length + ' tab' + (tabs.length === 1 ? '' : 's') + ' open right now. ' +
        'Say "list tabs" to see them all, or "switch tab 2" to jump to one.';
      callback({ success: true, message: response, agent: 'JARVIS \u2022 TERMINALIS' });
    });
    return; // async

  // ── 16. EXPLAIN SOMETHING ─────────────────────────────────
  } else if (/explain|what does|what do you mean by|define|meaning of/i.test(text)) {
    var topic2 = after('explain') || after('what does') || after('define') || after('what do you mean by') || after('meaning of') || raw;
    response = 'Let me break down "' + topic2 + '" in plain terms:\n\n' +
      'Think of it like this — if the Sovereign Organism is a city, then "' + topic2 + '" is one of the buildings. ' +
      'It has a specific job, it connects to other parts, and JARVIS routes commands through it automatically. ' +
      'If you want a more specific breakdown, tell me more context and I\'ll dig deeper.';

  // ── 17. SEARCH / FIND SOMETHING ───────────────────────────
  } else if (/search for|look up|find me|what is|who is|where is/i.test(text)) {
    var query2 = after('search for') || after('look up') || after('find me') || after('what is') || after('who is') || after('where is') || raw;
    response = 'Switching to JARVIS Intelligence — searching for "' + query2 + '" from your current page and native knowledge.\n\n' +
      'Tip: Click the 🔍 Search tab above to see full results. Or I can read the current page and find it — say "read page" or "summarize" and I\'ll pull the answer from what\'s already open.';

  // ── 18. PLATFORM COMMANDS REMINDER ────────────────────────
  } else if (/what commands|show commands|list commands|commands (available|you know|can you)/i.test(text)) {
    response = 'Commands I understand:\n\n' +
      '"list tabs" — show all open tabs\n' +
      '"switch tab 2" — jump to tab #2\n' +
      '"close tab 3" — close tab #3\n' +
      '"new tab" — open a blank tab\n' +
      '"go to [url]" — open any website\n' +
      '"take note: [text]" — save a note\n' +
      '"list notes" — show saved notes\n' +
      '"delete note" — remove last note\n' +
      '"screenshot" — capture + save your screen\n' +
      '"read page" — extract text from current page\n' +
      '"summarize" — key points from current page\n' +
      '"create pdf: [title]" — make a document\n' +
      '"search for [topic]" — JARVIS intelligence search\n' +
      '"find [text]" — find text on the current page\n' +
      '"highlight [text]" — highlight matches on page';

  // ── 19. THANKS / GOOD ─────────────────────────────────────
  } else if (/thank|thanks|good job|nice|great|perfect|awesome|love (it|you)|appreciate/i.test(text)) {
    response = pick([
      'That\'s what I\'m here for.',
      'Anytime. What else?',
      'Running at PHI efficiency. What\'s next?',
      'Always. The Sovereign Organism never sleeps.',
      'Copy that. Standing by.'
    ]);

  // ── 20. GOODBYE ───────────────────────────────────────────
  } else if (/bye|goodbye|see you|later|peace|close|shut down/i.test(text)) {
    response = pick([
      'JARVIS standing by. The heartbeat keeps running.',
      'I\'ll be here. 873ms keepalive — I don\'t go anywhere.',
      'Later. I\'ll keep the organism alive while you\'re gone.',
      'The side panel stays ready. Come back whenever.'
    ]);

  // ── 21. QUESTIONS ABOUT THE PAGE ──────────────────────────
  } else if (/this page|current page|what('?s| is) (on|here|this)|analyze/i.test(text)) {
    response = 'To get info about the current page, I need to read it first. ' +
      'Click the 🖥️ Screen tab and hit "Read Text" or "Summarize" — ' +
      'I\'ll pull everything off the page for you, no extra tabs needed. ' +
      'Or just say "summarize" and I\'ll do it right here in chat.';

  // ── 22. DEFAULT — Smart fallback ──────────────────────────
  } else {
    var fallbacks = [
      'Got it. I can\'t pull from an external model — but I\'m thinking through "' + raw + '" with native JARVIS logic. ' +
        'Try being more specific: a command like "summarize", "search for [topic]", or "read page" gets you real answers from the actual page you\'re on.',
      'JARVIS native engine processing "' + raw + '". ' +
        'If you\'re asking about what\'s on screen, say "read page" — I\'ll extract everything from it. ' +
        'If it\'s a general question, try "search for [your question]" and I\'ll pull from native knowledge.',
      'Routed through ORCHESTRATOR. "' + raw + '" — I\'m here, no loading required. ' +
        'Say "what can you do" to see the full command list, or just keep talking.',
      'I heard you. No external AI needed — I\'m processing "' + raw + '" locally. ' +
        'For the best answer: say "summarize" to read the current page, or ask me a direct question and I\'ll use native JARVIS intelligence.'
    ];
    response = pick(fallbacks);
    agent = 'JARVIS \u2022 ORCHESTRATOR';
  }

  callback({ success: true, message: response, agent: agent });
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
      // Native JARVIS Intelligence Search — no external APIs, no waiting
      (function () {
        var query = (message.query || '').trim();
        var qLow = query.toLowerCase();

        // Read the active tab for page-contextual answers
        chrome.tabs.query({ active: true, currentWindow: true }, function (tabs) {
          var activeTab = tabs[0];
          var pageTitle = activeTab ? (activeTab.title || '') : '';
          var pageUrl = activeTab ? (activeTab.url || '') : '';

          // Try to read page content for the answer
          function buildResults(pageText) {
            var results = [];

            // 1. Check if the page itself contains the answer
            if (pageText && qLow.length > 2) {
              var sentences = pageText.split(/[.!?\n]+/);
              var relevant = sentences.filter(function (s) {
                return s.toLowerCase().indexOf(qLow) !== -1 && s.trim().length > 20;
              }).slice(0, 3);
              if (relevant.length > 0) {
                results.push({
                  type: 'answer',
                  title: 'From current page: ' + pageTitle.substring(0, 60),
                  text: relevant.join('. ').trim().substring(0, 300),
                  url: pageUrl,
                  source: 'JARVIS Page Reader'
                });
              }
            }

            // 2. JARVIS native knowledge base
            var kb = [
              {
                keys: ['sovereign organism', 'sovereign', 'organism', 'platform'],
                title: 'Sovereign Organism Platform',
                text: 'Your private AI infrastructure. 27 browser extensions, 250 protocols, 400 tools, 18 web workers, and a 873ms heartbeat keepalive. Built natively — nothing leaves your browser.'
              },
              {
                keys: ['jarvis', 'who is jarvis', 'what is jarvis'],
                title: 'JARVIS AI — Sovereign Assistant',
                text: 'JARVIS is your AI sovereign assistant running natively in Microsoft Edge. No external models, no cloud calls. Tab control, notes, screen capture, search, document creation — all built in.'
              },
              {
                keys: ['protocol', 'protocols', 'alpha ai', 'alpha script'],
                title: '250 Sovereign Protocols',
                text: 'The Sovereign Organism runs 250 protocols (PROTO-001 to PROTO-250) routed through 10 Alpha Script AIs: PROTOCOLLUM, TERMINALIS, ORGANISMUS, MERCATOR, ORCHESTRATOR, MATHEMATICUS, SYNAPTICUS, SUBSTRATUM, UNIVERSUM, CANISTRUM.'
              },
              {
                keys: ['heartbeat', '873', 'phi', 'golden ratio'],
                title: 'The 873ms Heartbeat',
                text: '873ms is the organism\'s pulse — derived from PHI (1.618...). Every 873 milliseconds JARVIS ticks, keeping the service worker alive and the CPL WASM engine running.'
              },
              {
                keys: ['extension', 'browser extension', 'how to install'],
                title: 'Installing Extensions',
                text: 'Download the .zip from download.html, then drag it into Edge at edge://extensions (enable Developer Mode first). Or run install-jarvis-edge.bat for automatic one-click install.'
              },
              {
                keys: ['manifest', 'manifest v3', 'mv3'],
                title: 'Manifest V3',
                text: 'All Sovereign Organism extensions use Manifest V3 — the latest Chrome/Edge extension standard. It requires service workers instead of background pages, and strict content security policies.'
              },
              {
                keys: ['cpl', 'cognitive procurement language', 'wasm', 'webassembly'],
                title: 'CPL — Cognitive Procurement Language',
                text: 'The organism\'s native language (.mo source files compiled to WASM). The Universal CPL WASM boots with a tick(), sets mood, initializes phi slots, and routes the first protocol.'
              },
              {
                keys: ['ai', 'artificial intelligence', 'machine learning'],
                title: 'AI & Machine Learning',
                text: 'AI is software that can reason and respond. The Sovereign Organism uses native AI inference — pattern matching, NLP, phi-weighted scoring — without calling OpenAI or any external service.'
              },
              {
                keys: ['tab', 'tabs', 'switch tab', 'close tab'],
                title: 'Tab Commands',
                text: 'Say "list tabs", "switch tab 2", "close tab 3", "new tab", or "go to [url]". JARVIS routes these through TERMINALIS automatically.'
              },
              {
                keys: ['note', 'notes', 'save note', 'take note'],
                title: 'Notes System',
                text: 'Say "take note: [your note]" to save. "list notes" to view. "delete note" to remove the last one. Notes are stored locally in your browser — never sent anywhere.'
              },
              {
                keys: ['screenshot', 'screen capture', 'capture'],
                title: 'Screenshot & Screen Reading',
                text: 'Say "screenshot" to capture and save the current tab. Or go to the Screen tab for a live preview, read page text, or summarize what\'s on screen.'
              },
              {
                keys: ['pdf', 'document', 'create document'],
                title: 'Documents & PDFs',
                text: 'Say "create pdf: [title]" or "create document: [title]". Docs are stored locally and viewable in the Docs tab.'
              },
              {
                keys: ['microsoft edge', 'edge', 'browser'],
                title: 'Microsoft Edge Support',
                text: 'JARVIS runs natively in Microsoft Edge (Chromium). Install via install-jarvis-edge.bat for one-click setup. No developer mode required.'
              },
              {
                keys: ['windows', 'download', 'install', 'installer'],
                title: 'Windows Installation',
                text: 'Download install-jarvis-edge.bat from the repo. Double-click it — it downloads the latest JARVIS zip, extracts it, and launches Edge with JARVIS loaded automatically.'
              }
            ];

            kb.forEach(function (entry) {
              var matched = entry.keys.some(function (k) { return qLow.indexOf(k) !== -1 || k.indexOf(qLow) !== -1; });
              if (matched) {
                results.push({ type: 'abstract', title: entry.title, text: entry.text, url: '', source: 'JARVIS Native Knowledge' });
              }
            });

            // 3. Always add a "related" result pointing to the current page
            if (pageTitle && pageUrl && !pageUrl.startsWith('chrome') && !pageUrl.startsWith('edge')) {
              results.push({
                type: 'related',
                title: 'Current page: ' + pageTitle.substring(0, 70),
                text: 'The page you have open might contain the answer. Use "Read Text" in the Screen tab to extract everything from it.',
                url: pageUrl,
                source: 'Current Tab'
              });
            }

            // 4. Fallback if nothing matched
            if (results.length === 0) {
              results.push({
                type: 'answer',
                title: 'JARVIS Intelligence — "' + query.substring(0, 60) + '"',
                text: 'I don\'t have a specific entry for that in native knowledge yet. ' +
                  'Try: "read page" to search what\'s currently open, "summarize" to get key points, ' +
                  'or ask me directly in Chat and I\'ll reason through it with native JARVIS logic.',
                url: '',
                source: 'JARVIS Fallback'
              });
            }

            sendResponse({ success: true, results: results, query: query });
          }

          // Try to get page text; if that fails, build results with empty text
          if (activeTab && activeTab.id && !pageUrl.startsWith('edge://') && !pageUrl.startsWith('chrome://')) {
            chrome.scripting.executeScript({
              target: { tabId: activeTab.id },
              func: function () { return document.body ? document.body.innerText.substring(0, 8000) : ''; }
            }, function (results) {
              var pageText = (results && results[0] && results[0].result) || '';
              buildResults(pageText);
            });
          } else {
            buildResults('');
          }
        });
      })();
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

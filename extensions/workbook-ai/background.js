/* Workbook AI — Background Service Worker */

// ── Context menu setup ──────────────────────────────────────────────────────
chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'save-to-workbook',
    title: 'Save to Workbook AI',
    contexts: ['selection']
  });

  // Seed default categories if first install
  chrome.storage.local.get(['categories'], (result) => {
    if (!result.categories) {
      chrome.storage.local.set({
        categories: ['General', 'Work', 'Personal', 'Ideas', 'Code Snippets'],
        notes: [],
        settings: { autoSaveInterval: 5, theme: 'dark', defaultCategory: 'General' }
      });
    }
  });

  // Auto-save reminder alarm — fires every 5 minutes
  chrome.alarms.create('auto-save-reminder', { periodInMinutes: 5 });
});

// ── Action click → open side panel ──────────────────────────────────────────
chrome.action.onClicked.addListener((tab) => {
  chrome.sidePanel.open({ tabId: tab.id });
});

// ── Context menu handler — capture selected text ────────────────────────────
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'save-to-workbook' && info.selectionText) {
    const note = {
      id: generateId(),
      title: truncateTitle(info.selectionText),
      content: escapeForStorage(info.selectionText),
      category: 'General',
      createdAt: new Date().toISOString(),
      modifiedAt: new Date().toISOString(),
      wordCount: countWords(info.selectionText),
      sourceUrl: tab.url || ''
    };

    chrome.storage.local.get(['notes'], (result) => {
      const notes = result.notes || [];
      notes.unshift(note);
      chrome.storage.local.set({ notes }, () => {
        // Notify side panel if open
        chrome.runtime.sendMessage({ type: 'note-added', note }).catch((e) => console.debug('notify failed:', e));
      });
    });
  }
});

// ── Alarm listener ──────────────────────────────────────────────────────────
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === 'auto-save-reminder') {
    chrome.runtime.sendMessage({ type: 'auto-save-tick' }).catch(() => {});
  }
});

// ── Message routing ─────────────────────────────────────────────────────────
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.type) {
    case 'get-notes':
      chrome.storage.local.get(['notes'], (r) => sendResponse(r.notes || []));
      return true;

    case 'save-note':
      saveNote(message.note).then((notes) => sendResponse(notes));
      return true;

    case 'delete-note':
      deleteNote(message.id).then((notes) => sendResponse(notes));
      return true;

    case 'get-categories':
      chrome.storage.local.get(['categories'], (r) => sendResponse(r.categories || []));
      return true;

    case 'add-category':
      addCategory(message.name).then((cats) => sendResponse(cats));
      return true;

    case 'open-side-panel':
      if (sender.tab?.id) {
        chrome.sidePanel.open({ tabId: sender.tab.id }).catch((e) => console.debug('sidePanel.open failed:', e));
      } else {
        chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
          if (tabs[0]) {
            chrome.sidePanel.open({ tabId: tabs[0].id }).catch((e) => console.debug('sidePanel.open failed:', e));
          }
        });
      }
      sendResponse({ ok: true });
      return false;

    case 'import-notes':
      importNotes(message.notes).then((notes) => sendResponse(notes));
      return true;
  }
});

// ── Storage helpers ─────────────────────────────────────────────────────────
async function saveNote(note) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      let notes = result.notes || [];
      const idx = notes.findIndex((n) => n.id === note.id);
      note.modifiedAt = new Date().toISOString();
      if (idx >= 0) {
        notes[idx] = note;
      } else {
        note.createdAt = note.createdAt || new Date().toISOString();
        notes.unshift(note);
      }
      chrome.storage.local.set({ notes }, () => resolve(notes));
    });
  });
}

async function deleteNote(id) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      const notes = (result.notes || []).filter((n) => n.id !== id);
      chrome.storage.local.set({ notes }, () => resolve(notes));
    });
  });
}

async function addCategory(name) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['categories'], (result) => {
      const cats = result.categories || [];
      if (name && !cats.includes(name)) cats.push(name);
      chrome.storage.local.set({ categories: cats }, () => resolve(cats));
    });
  });
}

async function importNotes(incoming) {
  return new Promise((resolve) => {
    chrome.storage.local.get(['notes'], (result) => {
      const existing = result.notes || [];
      const ids = new Set(existing.map((n) => n.id));
      const merged = [...existing];
      for (const n of incoming) {
        if (!ids.has(n.id)) merged.push(n);
      }
      chrome.storage.local.set({ notes: merged }, () => resolve(merged));
    });
  });
}

// ── Utility functions ───────────────────────────────────────────────────────
function generateId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 9);
}

function truncateTitle(text) {
  const clean = text.replace(/\s+/g, ' ').trim();
  return clean.length > 60 ? clean.slice(0, 57) + '...' : clean;
}

function countWords(text) {
  return text.trim().split(/\s+/).filter(Boolean).length;
}

function escapeForStorage(text) {
  return text.replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

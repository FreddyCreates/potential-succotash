/* Secure Clipboard — Background Service Worker */

const MAX_HISTORY = 500;
const ALARM_NAME = 'secure-clipboard-auto-clear';

// ── Side Panel ──────────────────────────────────────────────────────────────

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch {
    await chrome.sidePanel.open({ windowId: tab.windowId });
  }
});

chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});

// ── Context Menu ────────────────────────────────────────────────────────────

chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: 'copy-to-secure',
    title: 'Copy to Secure Clipboard',
    contexts: ['selection']
  });

  chrome.storage.local.get(['settings'], (res) => {
    if (!res.settings) {
      chrome.storage.local.set({
        settings: {
          maxHistory: 500,
          autoClearTimer: 'never',
          autoCapture: true,
          notifications: true
        }
      });
    }
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === 'copy-to-secure' && info.selectionText) {
    saveClipboardItem(info.selectionText, tab?.url || '');
  }
});

// ── Message Routing ─────────────────────────────────────────────────────────

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  switch (msg.type) {
    case 'COPY_EVENT':
      saveClipboardItem(msg.text, msg.url || sender.tab?.url || '');
      sendResponse({ ok: true });
      break;

    case 'GET_HISTORY':
      chrome.storage.local.get(['clipboardHistory'], (res) => {
        sendResponse({ history: res.clipboardHistory || [] });
      });
      return true;

    case 'SAVE_HISTORY':
      chrome.storage.local.set({ clipboardHistory: msg.history }, () => {
        sendResponse({ ok: true });
      });
      return true;

    case 'GET_SETTINGS':
      chrome.storage.local.get(['settings'], (res) => {
        sendResponse({ settings: res.settings || {} });
      });
      return true;

    case 'SAVE_SETTINGS':
      chrome.storage.local.set({ settings: msg.settings }, () => {
        setupAutoClearAlarm(msg.settings.autoClearTimer);
        sendResponse({ ok: true });
      });
      return true;

    case 'PASTE_REQUEST':
      if (sender.tab?.id) {
        chrome.tabs.sendMessage(sender.tab.id, { type: 'PASTE_AT_CURSOR', text: msg.text });
      }
      sendResponse({ ok: true });
      break;

    case 'GET_VAULT':
      chrome.storage.local.get(['vault'], (res) => {
        sendResponse({ vault: res.vault || null });
      });
      return true;

    case 'SAVE_VAULT':
      chrome.storage.local.set({ vault: msg.vault }, () => {
        sendResponse({ ok: true });
      });
      return true;

    case 'CLEAR_VAULT':
      chrome.storage.local.remove(['vault'], () => {
        sendResponse({ ok: true });
      });
      return true;

    default:
      sendResponse({ error: 'Unknown message type' });
  }
});

// ── Save Clipboard Item ─────────────────────────────────────────────────────

function categorize(text) {
  if (/^https?:\/\/\S+$/i.test(text.trim()) || /\.\w{2,}\//.test(text.trim())) return 'URLs';
  if (/[{}\[\]]/.test(text) && /(function|const|let|var|class|def|import|return|=>)/.test(text)) return 'Code';
  if (/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(text.trim())) return 'Email';
  if (/^\s*[-+]?\d[\d.,]*\s*$/.test(text.trim())) return 'Numbers';
  return 'General';
}

function saveClipboardItem(text, url) {
  if (!text || !text.trim()) return;

  chrome.storage.local.get(['clipboardHistory', 'settings'], (res) => {
    const settings = res.settings || {};
    if (settings.autoCapture === false) return;

    let history = res.clipboardHistory || [];

    if (history.length > 0 && history[0].text === text) return;

    const item = {
      id: Date.now().toString(36) + Math.random().toString(36).slice(2, 8),
      text: text,
      timestamp: Date.now(),
      category: categorize(text),
      sourceUrl: url,
      pinned: false,
      size: new Blob([text]).size
    };

    history.unshift(item);

    const maxItems = settings.maxHistory || MAX_HISTORY;
    const pinned = history.filter(i => i.pinned);
    const unpinned = history.filter(i => !i.pinned);
    if (unpinned.length > maxItems) {
      unpinned.length = maxItems;
    }
    history = [...pinned, ...unpinned.filter(i => !i.pinned)];

    // Deduplicate keeping order (pinned first already)
    const seen = new Set();
    history = history.filter(i => {
      if (seen.has(i.id)) return false;
      seen.add(i.id);
      return true;
    });

    chrome.storage.local.set({ clipboardHistory: history });

    if (settings.notifications !== false) {
      chrome.runtime.sendMessage({ type: 'HISTORY_UPDATED', item }).catch(() => {});
    }
  });
}

// ── Auto-Clear Alarm ────────────────────────────────────────────────────────

function setupAutoClearAlarm(timer) {
  chrome.alarms.clear(ALARM_NAME);
  const minutes = { '1hr': 60, '4hr': 240, '24hr': 1440 }[timer];
  if (minutes) {
    chrome.alarms.create(ALARM_NAME, { periodInMinutes: minutes });
  }
}

chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === ALARM_NAME) {
    chrome.storage.local.get(['clipboardHistory'], (res) => {
      const history = (res.clipboardHistory || []).filter(i => i.pinned);
      chrome.storage.local.set({ clipboardHistory: history });
    });
  }
});

// Restore alarm on startup
chrome.storage.local.get(['settings'], (res) => {
  if (res.settings?.autoClearTimer) {
    setupAutoClearAlarm(res.settings.autoClearTimer);
  }
});

/* background.js — Service worker for Page Intelligence */

// Keep service worker alive with periodic alarm
chrome.alarms.create("keepalive", { periodInMinutes: 0.5 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name === "keepalive") {
    /* no-op heartbeat */
  }
});

// Open side panel when toolbar icon is clicked
chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch (err) {
    console.error("Page Intelligence: failed to open side panel", err);
  }
});

// Enable side panel on every tab
chrome.sidePanel
  .setPanelBehavior({ openPanelOnActionClick: true })
  .catch((err) => console.error("Page Intelligence: panel behavior error", err));

// Relay messages between side panel / popup and content script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.action === "analyzePage") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (!tabs[0]) {
        sendResponse({ error: "No active tab found." });
        return;
      }
      chrome.tabs.sendMessage(tabs[0].id, { action: "runAnalysis" }, (response) => {
        if (chrome.runtime.lastError) {
          sendResponse({ error: chrome.runtime.lastError.message });
        } else {
          sendResponse(response);
        }
      });
    });
    return true; // async response
  }

  if (message.action === "getActiveTabInfo") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        sendResponse({ url: tabs[0].url, title: tabs[0].title, tabId: tabs[0].id });
      } else {
        sendResponse({ error: "No active tab" });
      }
    });
    return true;
  }

  if (message.action === "openSidePanel") {
    chrome.tabs.query({ active: true, currentWindow: true }, (tabs) => {
      if (tabs[0]) {
        chrome.sidePanel.open({ tabId: tabs[0].id }).then(() => {
          sendResponse({ ok: true });
        }).catch((err) => sendResponse({ error: err.message }));
      }
    });
    return true;
  }
});

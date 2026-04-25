/* Command Bar — background.js (service worker) */
"use strict";

const COMMANDS = [
  { name: "scroll up",        syntax: "scroll up",              desc: "Scroll the page up" },
  { name: "scroll down",      syntax: "scroll down",            desc: "Scroll the page down" },
  { name: "scroll top",       syntax: "scroll top",             desc: "Scroll to the top of the page" },
  { name: "scroll bottom",    syntax: "scroll bottom",          desc: "Scroll to the bottom of the page" },
  { name: "find",             syntax: 'find "text"',            desc: "Find and highlight text on the page" },
  { name: "click",            syntax: "click <selector>",       desc: "Click an element matching CSS selector" },
  { name: "read",             syntax: "read <selector>",        desc: "Read text content of an element" },
  { name: "goto",             syntax: "goto <url>",             desc: "Navigate to a URL" },
  { name: "summarize",        syntax: "summarize",              desc: "Summarize the page (first 5–7 sentences)" },
  { name: "extract links",    syntax: "extract links",          desc: "Extract all links from the page" },
  { name: "extract images",   syntax: "extract images",         desc: "Extract all image URLs from the page" },
  { name: "extract headings", syntax: "extract headings",       desc: "Extract all headings from the page" },
  { name: "extract emails",   syntax: "extract emails",         desc: "Extract email addresses from the page" },
  { name: "extract numbers",  syntax: "extract numbers",        desc: "Extract numbers from the page" },
  { name: "word count",       syntax: "word count",             desc: "Count words on the page" },
  { name: "highlight",        syntax: 'highlight "text"',       desc: "Highlight all occurrences of text" },
  { name: "dark mode",        syntax: "dark mode",              desc: "Toggle dark mode on the page" },
  { name: "zoom in",          syntax: "zoom in",                desc: "Zoom in on the page" },
  { name: "zoom out",         syntax: "zoom out",               desc: "Zoom out on the page" },
  { name: "bookmark",         syntax: "bookmark",               desc: "Bookmark the current page" },
  { name: "copy title",       syntax: "copy title",             desc: "Copy the page title to clipboard" },
  { name: "copy url",         syntax: "copy url",               desc: "Copy the page URL to clipboard" },
  { name: "tabs",             syntax: "tabs",                   desc: "List all open tabs" },
  { name: "close tab",        syntax: "close tab",              desc: "Close the current tab" },
  { name: "history",          syntax: "history",                desc: "Show recent command history" }
];

/* ── Helpers ─────────────────────────────────────────────── */

async function getActiveTab() {
  const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
  return tab;
}

async function sendToContent(tabId, message) {
  try {
    return await chrome.tabs.sendMessage(tabId, message);
  } catch {
    await chrome.scripting.executeScript({ target: { tabId }, files: ["content.js"] });
    return chrome.tabs.sendMessage(tabId, message);
  }
}

async function saveToHistory(command) {
  const { commandHistory = [] } = await chrome.storage.local.get("commandHistory");
  commandHistory.unshift({ command, timestamp: Date.now() });
  if (commandHistory.length > 200) commandHistory.length = 200;
  await chrome.storage.local.set({ commandHistory });
}

/* ── Action click → open side panel or toggle palette ──── */

chrome.action.onClicked.addListener(async (tab) => {
  try {
    await chrome.sidePanel.open({ tabId: tab.id });
  } catch {
    await sendToContent(tab.id, { type: "toggle-palette" });
  }
});

/* ── Message router ──────────────────────────────────────── */

chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
  if (msg.type === "execute-command") {
    handleCommand(msg.command, sender).then(sendResponse).catch((e) =>
      sendResponse({ ok: false, result: e.message })
    );
    return true;
  }
  if (msg.type === "get-commands") {
    sendResponse(COMMANDS);
    return false;
  }
  if (msg.type === "get-history") {
    chrome.storage.local.get("commandHistory").then((d) =>
      sendResponse(d.commandHistory || [])
    );
    return true;
  }
  if (msg.type === "clear-history") {
    chrome.storage.local.set({ commandHistory: [] }).then(() =>
      sendResponse({ ok: true })
    );
    return true;
  }
  if (msg.type === "get-saved-actions") {
    chrome.storage.local.get("savedActions").then((d) =>
      sendResponse(d.savedActions || getDefaultActions())
    );
    return true;
  }
  if (msg.type === "save-actions") {
    chrome.storage.local.set({ savedActions: msg.actions }).then(() =>
      sendResponse({ ok: true })
    );
    return true;
  }
  return false;
});

/* ── Default saved actions ───────────────────────────────── */

function getDefaultActions() {
  return [
    { name: "Quick Summary",     command: "summarize" },
    { name: "Link Report",       command: "extract links" },
    { name: "Dark Mode Toggle",  command: "dark mode" },
    { name: "Page Stats",        command: "word count" }
  ];
}

/* ── Command handler ─────────────────────────────────────── */

async function handleCommand(raw, sender) {
  const cmd = (raw || "").trim();
  if (!cmd) return { ok: false, result: "Empty command." };

  await saveToHistory(cmd);
  const lower = cmd.toLowerCase();

  /* Tabs command — handled entirely in background */
  if (lower === "tabs") {
    const tabs = await chrome.tabs.query({});
    const list = tabs.map((t, i) => `${i + 1}. ${t.title} — ${t.url}`);
    return { ok: true, result: list.join("\n") };
  }

  /* Close tab */
  if (lower === "close tab") {
    const tab = await getActiveTab();
    if (tab) await chrome.tabs.remove(tab.id);
    return { ok: true, result: "Tab closed." };
  }

  /* Bookmark */
  if (lower === "bookmark") {
    const tab = await getActiveTab();
    await chrome.bookmarks.create({ title: tab.title, url: tab.url });
    return { ok: true, result: `Bookmarked: ${tab.title}` };
  }

  /* History */
  if (lower === "history") {
    const { commandHistory = [] } = await chrome.storage.local.get("commandHistory");
    const recent = commandHistory.slice(0, 20);
    if (!recent.length) return { ok: true, result: "No command history yet." };
    const lines = recent.map(
      (h, i) => `${i + 1}. ${h.command}  (${new Date(h.timestamp).toLocaleString()})`
    );
    return { ok: true, result: lines.join("\n") };
  }

  /* Goto */
  if (lower.startsWith("goto ")) {
    let url = cmd.slice(5).trim();
    if (!/^https?:\/\//i.test(url)) url = "https://" + url;
    const tab = await getActiveTab();
    await chrome.tabs.update(tab.id, { url });
    return { ok: true, result: `Navigating to ${url}` };
  }

  /* Everything else → content script */
  const tab = sender && sender.tab ? sender.tab : await getActiveTab();
  if (!tab || !tab.id) return { ok: false, result: "No active tab found." };

  try {
    const res = await sendToContent(tab.id, { type: "run-command", command: cmd });
    return res || { ok: false, result: "No response from content script." };
  } catch (e) {
    return { ok: false, result: `Content script error: ${e.message}` };
  }
}

/* ── Keyboard shortcut (commands API) ────────────────────── */

chrome.commands.onCommand.addListener(async (command) => {
  if (command === "_execute_action") {
    const tab = await getActiveTab();
    if (tab) {
      try {
        await chrome.sidePanel.open({ tabId: tab.id });
      } catch {
        await sendToContent(tab.id, { type: "toggle-palette" });
      }
    }
  }
});

/* ── Install defaults ────────────────────────────────────── */

chrome.runtime.onInstalled.addListener(() => {
  chrome.storage.local.get("savedActions").then((d) => {
    if (!d.savedActions) {
      chrome.storage.local.set({ savedActions: getDefaultActions() });
    }
  });
});

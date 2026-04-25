/* Command Bar — content.js */
"use strict";

(() => {
  /* Prevent double-injection */
  if (window.__commandBarInjected) return;
  window.__commandBarInjected = true;

  /* ── Utilities ─────────────────────────────────────────── */

  function escapeHtml(str) {
    const d = document.createElement("div");
    d.appendChild(document.createTextNode(str));
    return d.innerHTML;
  }

  function escapeRegExp(s) {
    return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  /* ── State ─────────────────────────────────────────────── */

  let darkModeActive = false;
  let paletteEl = null;
  let selectedIdx = -1;
  let suggestionItems = [];
  let recentCommands = [];

  const COMMAND_NAMES = [
    "scroll up", "scroll down", "scroll top", "scroll bottom",
    "find", "click", "read", "goto", "summarize",
    "extract links", "extract images", "extract headings",
    "extract emails", "extract numbers", "word count",
    "highlight", "dark mode", "zoom in", "zoom out",
    "bookmark", "copy title", "copy url", "tabs",
    "close tab", "history"
  ];

  /* ── Command execution (content-side) ─────────────────── */

  function executeCommand(raw) {
    const cmd = (raw || "").trim();
    if (!cmd) return { ok: false, result: "Empty command." };

    const lower = cmd.toLowerCase();

    /* Scroll */
    if (lower === "scroll up") {
      window.scrollBy({ top: -400, behavior: "smooth" });
      return { ok: true, result: "Scrolled up." };
    }
    if (lower === "scroll down") {
      window.scrollBy({ top: 400, behavior: "smooth" });
      return { ok: true, result: "Scrolled down." };
    }
    if (lower === "scroll top") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      return { ok: true, result: "Scrolled to top." };
    }
    if (lower === "scroll bottom") {
      window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" });
      return { ok: true, result: "Scrolled to bottom." };
    }

    /* Find "text" */
    const findMatch = cmd.match(/^find\s+"(.+)"$/i) || cmd.match(/^find\s+(.+)$/i);
    if (findMatch) {
      const text = findMatch[1];
      const found = window.find(text, false, false, true);
      return { ok: true, result: found ? `Found: "${text}"` : `"${text}" not found on page.` };
    }

    /* Click selector */
    if (lower.startsWith("click ")) {
      const sel = cmd.slice(6).trim();
      try {
        const el = document.querySelector(sel);
        if (!el) return { ok: false, result: `No element matches: ${sel}` };
        el.click();
        return { ok: true, result: `Clicked: ${sel}` };
      } catch (e) {
        return { ok: false, result: `Invalid selector: ${e.message}` };
      }
    }

    /* Read selector */
    if (lower.startsWith("read ")) {
      const sel = cmd.slice(5).trim();
      try {
        const el = document.querySelector(sel);
        if (!el) return { ok: false, result: `No element matches: ${sel}` };
        const text = el.innerText.trim().slice(0, 3000);
        return { ok: true, result: text || "(empty)" };
      } catch (e) {
        return { ok: false, result: `Invalid selector: ${e.message}` };
      }
    }

    /* Goto */
    if (lower.startsWith("goto ")) {
      let url = cmd.slice(5).trim();
      if (!/^https?:\/\//i.test(url)) url = "https://" + url;
      location.href = url;
      return { ok: true, result: `Navigating to ${url}` };
    }

    /* Summarize */
    if (lower === "summarize") {
      const text = document.body.innerText || "";
      const sentences = text.replace(/\s+/g, " ").match(/[^.!?]+[.!?]+/g) || [];
      const summary = sentences.slice(0, 7).join(" ").trim();
      return { ok: true, result: summary || "Could not extract sentences from this page." };
    }

    /* Extract links */
    if (lower === "extract links") {
      const anchors = Array.from(document.querySelectorAll("a[href]"));
      if (!anchors.length) return { ok: true, result: "No links found." };
      const lines = anchors.slice(0, 200).map(
        (a) => `${a.textContent.trim().slice(0, 80) || "(no text)"} → ${a.href}`
      );
      return { ok: true, result: `${anchors.length} link(s) found:\n${lines.join("\n")}` };
    }

    /* Extract images */
    if (lower === "extract images") {
      const imgs = Array.from(document.querySelectorAll("img[src]"));
      if (!imgs.length) return { ok: true, result: "No images found." };
      const lines = imgs.slice(0, 200).map(
        (img) => `${img.alt || "(no alt)"} → ${img.src}`
      );
      return { ok: true, result: `${imgs.length} image(s) found:\n${lines.join("\n")}` };
    }

    /* Extract headings */
    if (lower === "extract headings") {
      const headings = Array.from(document.querySelectorAll("h1,h2,h3,h4,h5,h6"));
      if (!headings.length) return { ok: true, result: "No headings found." };
      const lines = headings.map(
        (h) => `<${h.tagName}> ${h.textContent.trim().slice(0, 120)}`
      );
      return { ok: true, result: `${headings.length} heading(s):\n${lines.join("\n")}` };
    }

    /* Extract emails */
    if (lower === "extract emails") {
      const text = document.body.innerText || "";
      const emails = [...new Set(text.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g) || [])];
      return { ok: true, result: emails.length ? `${emails.length} email(s):\n${emails.join("\n")}` : "No emails found." };
    }

    /* Extract numbers */
    if (lower === "extract numbers") {
      const text = document.body.innerText || "";
      const nums = [...new Set(text.match(/-?\d[\d,]*\.?\d*/g) || [])];
      const display = nums.slice(0, 100);
      return { ok: true, result: nums.length ? `${nums.length} number(s) found:\n${display.join(", ")}` : "No numbers found." };
    }

    /* Word count */
    if (lower === "word count") {
      const text = (document.body.innerText || "").trim();
      const words = text ? text.split(/\s+/).length : 0;
      const chars = text.length;
      return { ok: true, result: `Words: ${words.toLocaleString()}\nCharacters: ${chars.toLocaleString()}` };
    }

    /* Highlight "text" */
    const hlMatch = cmd.match(/^highlight\s+"(.+)"$/i) || cmd.match(/^highlight\s+(.+)$/i);
    if (hlMatch) {
      const term = hlMatch[1];
      removeHighlights();
      const count = highlightText(document.body, term);
      return { ok: true, result: count ? `Highlighted ${count} occurrence(s) of "${term}".` : `"${term}" not found.` };
    }

    /* Dark mode */
    if (lower === "dark mode") {
      darkModeActive = !darkModeActive;
      document.documentElement.style.filter = darkModeActive
        ? "invert(1) hue-rotate(180deg)"
        : "";
      /* Don't invert images/videos */
      document.querySelectorAll("img, video, picture, canvas, svg").forEach((el) => {
        el.style.filter = darkModeActive ? "invert(1) hue-rotate(180deg)" : "";
      });
      return { ok: true, result: darkModeActive ? "Dark mode enabled." : "Dark mode disabled." };
    }

    /* Zoom in */
    if (lower === "zoom in") {
      const cur = parseFloat(document.body.style.zoom || "1");
      document.body.style.zoom = String(Math.min(cur + 0.1, 3).toFixed(1));
      return { ok: true, result: `Zoom: ${document.body.style.zoom}` };
    }

    /* Zoom out */
    if (lower === "zoom out") {
      const cur = parseFloat(document.body.style.zoom || "1");
      document.body.style.zoom = String(Math.max(cur - 0.1, 0.3).toFixed(1));
      return { ok: true, result: `Zoom: ${document.body.style.zoom}` };
    }

    /* Copy title */
    if (lower === "copy title") {
      const title = document.title;
      navigator.clipboard.writeText(title).catch(() => {});
      return { ok: true, result: `Copied title: "${title}"` };
    }

    /* Copy URL */
    if (lower === "copy url") {
      const url = location.href;
      navigator.clipboard.writeText(url).catch(() => {});
      return { ok: true, result: `Copied URL: ${url}` };
    }

    /* Commands delegated to background */
    if (["tabs", "close tab", "bookmark", "history"].includes(lower)) {
      return null; /* signal: forward to background */
    }

    return { ok: false, result: `Unknown command: "${cmd}". Type a known command or check Quick Reference.` };
  }

  /* ── Highlight helpers ─────────────────────────────────── */

  function highlightText(root, term) {
    let count = 0;
    const regex = new RegExp(escapeRegExp(term), "gi");
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        if (node.parentElement && (node.parentElement.tagName === "SCRIPT" || node.parentElement.tagName === "STYLE" || node.parentElement.tagName === "MARK" || node.parentElement.closest("#command-bar-palette"))) {
          return NodeFilter.FILTER_REJECT;
        }
        return regex.test(node.textContent) ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT;
      }
    });
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    nodes.forEach((textNode) => {
      const frag = document.createDocumentFragment();
      let lastIdx = 0;
      const txt = textNode.textContent;
      regex.lastIndex = 0;
      let m;
      while ((m = regex.exec(txt)) !== null) {
        if (m.index > lastIdx) frag.appendChild(document.createTextNode(txt.slice(lastIdx, m.index)));
        const mark = document.createElement("mark");
        mark.className = "command-bar-highlight";
        mark.style.background = "#fabd2f";
        mark.style.color = "#1e1e2e";
        mark.textContent = m[0];
        frag.appendChild(mark);
        count++;
        lastIdx = regex.lastIndex;
      }
      if (lastIdx < txt.length) frag.appendChild(document.createTextNode(txt.slice(lastIdx)));
      textNode.parentNode.replaceChild(frag, textNode);
    });
    return count;
  }

  function removeHighlights() {
    document.querySelectorAll("mark.command-bar-highlight").forEach((m) => {
      const parent = m.parentNode;
      parent.replaceChild(document.createTextNode(m.textContent), m);
      parent.normalize();
    });
  }

  /* ── Floating Command Palette ──────────────────────────── */

  function createPalette() {
    if (paletteEl) { paletteEl.style.display = paletteEl.style.display === "none" ? "flex" : "none"; return; }

    paletteEl = document.createElement("div");
    paletteEl.id = "command-bar-palette";
    paletteEl.innerHTML = `
      <style>
        #command-bar-palette * { box-sizing: border-box; margin: 0; padding: 0; }
        #command-bar-palette {
          position: fixed; inset: 0; z-index: 2147483647;
          display: flex; align-items: flex-start; justify-content: center;
          padding-top: 15vh; background: rgba(0,0,0,0.55);
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          font-size: 14px; color: #cdd6f4;
        }
        .cb-container {
          width: 560px; max-width: 92vw; background: #1e1e2e;
          border-radius: 12px; box-shadow: 0 20px 60px rgba(0,0,0,0.6);
          overflow: hidden; display: flex; flex-direction: column;
          max-height: 70vh;
        }
        .cb-input-row { display: flex; align-items: center; padding: 14px 16px; border-bottom: 1px solid #313244; }
        .cb-input-row svg { flex-shrink: 0; margin-right: 10px; color: #89b4fa; }
        .cb-input {
          flex: 1; background: none; border: none; outline: none;
          font-size: 16px; color: #cdd6f4; font-family: inherit;
        }
        .cb-input::placeholder { color: #6c7086; }
        .cb-suggestions { overflow-y: auto; max-height: 260px; }
        .cb-sug-item {
          padding: 10px 16px; cursor: pointer; display: flex;
          justify-content: space-between; align-items: center;
          border-bottom: 1px solid #181825;
        }
        .cb-sug-item:hover, .cb-sug-item.active { background: #313244; }
        .cb-sug-name { color: #cdd6f4; }
        .cb-sug-hint { color: #6c7086; font-size: 12px; }
        .cb-result {
          padding: 12px 16px; max-height: 200px; overflow-y: auto;
          background: #181825; white-space: pre-wrap; word-break: break-word;
          font-size: 13px; line-height: 1.5; color: #a6e3a1; display: none;
        }
        .cb-result.error { color: #f38ba8; }
        .cb-recent { padding: 8px 16px; border-top: 1px solid #313244; }
        .cb-recent-title { font-size: 11px; color: #6c7086; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 1px; }
        .cb-recent-item { padding: 4px 0; cursor: pointer; color: #bac2de; font-size: 13px; }
        .cb-recent-item:hover { color: #89b4fa; }
        .cb-footer { padding: 8px 16px; text-align: center; font-size: 11px; color: #45475a; border-top: 1px solid #313244; }
      </style>
      <div class="cb-container">
        <div class="cb-input-row">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
          <input class="cb-input" placeholder="Type a command..." autofocus autocomplete="off" spellcheck="false"/>
        </div>
        <div class="cb-suggestions"></div>
        <div class="cb-result"></div>
        <div class="cb-recent"></div>
        <div class="cb-footer">↑↓ Navigate · Enter Execute · Esc Close</div>
      </div>
    `;
    document.documentElement.appendChild(paletteEl);

    const input = paletteEl.querySelector(".cb-input");
    const sugBox = paletteEl.querySelector(".cb-suggestions");
    const resultBox = paletteEl.querySelector(".cb-result");
    const recentBox = paletteEl.querySelector(".cb-recent");

    renderRecent(recentBox, input);

    /* Overlay click to close */
    paletteEl.addEventListener("mousedown", (e) => {
      if (e.target === paletteEl) closePalette();
    });

    input.addEventListener("input", () => {
      const q = input.value.trim().toLowerCase();
      resultBox.style.display = "none";
      if (!q) { sugBox.innerHTML = ""; suggestionItems = []; selectedIdx = -1; return; }
      const matches = COMMAND_NAMES.filter((c) => c.includes(q));
      suggestionItems = matches;
      selectedIdx = -1;
      renderSuggestions(sugBox, matches, input, resultBox);
    });

    input.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { closePalette(); return; }
      if (e.key === "ArrowDown") { e.preventDefault(); moveSel(1, sugBox); return; }
      if (e.key === "ArrowUp") { e.preventDefault(); moveSel(-1, sugBox); return; }
      if (e.key === "Enter") {
        e.preventDefault();
        let cmd = input.value.trim();
        if (selectedIdx >= 0 && selectedIdx < suggestionItems.length) {
          cmd = suggestionItems[selectedIdx];
          input.value = cmd;
        }
        if (cmd) runFromPalette(cmd, resultBox, recentBox, input);
      }
    });

    input.focus();
  }

  function renderSuggestions(box, items, input, resultBox) {
    if (!items.length) { box.innerHTML = ""; return; }
    box.innerHTML = items.map((it, i) =>
      `<div class="cb-sug-item${i === selectedIdx ? " active" : ""}" data-idx="${i}">${escapeHtml(it)}</div>`
    ).join("");
    box.querySelectorAll(".cb-sug-item").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        input.value = el.textContent;
        runFromPalette(el.textContent.trim(), resultBox);
      });
    });
  }

  function moveSel(dir, sugBox) {
    if (!suggestionItems.length) return;
    selectedIdx = Math.max(-1, Math.min(suggestionItems.length - 1, selectedIdx + dir));
    sugBox.querySelectorAll(".cb-sug-item").forEach((el, i) => {
      el.classList.toggle("active", i === selectedIdx);
      if (i === selectedIdx) el.scrollIntoView({ block: "nearest" });
    });
  }

  function renderRecent(box, input) {
    if (!recentCommands.length) { box.innerHTML = ""; return; }
    const shown = recentCommands.slice(0, 5);
    box.innerHTML = `<div class="cb-recent-title">Recent</div>` +
      shown.map((c) => `<div class="cb-recent-item">${escapeHtml(c)}</div>`).join("");
    box.querySelectorAll(".cb-recent-item").forEach((el) => {
      el.addEventListener("mousedown", (e) => {
        e.preventDefault();
        if (input) input.value = el.textContent;
      });
    });
  }

  async function runFromPalette(cmd, resultBox, recentBox, input) {
    if (!recentCommands.includes(cmd)) recentCommands.unshift(cmd);
    if (recentCommands.length > 20) recentCommands.length = 20;

    let res = executeCommand(cmd);

    /* Commands that need background */
    if (res === null) {
      try {
        res = await chrome.runtime.sendMessage({ type: "execute-command", command: cmd });
      } catch (e) {
        res = { ok: false, result: e.message };
      }
    } else {
      /* Also save to background history */
      chrome.runtime.sendMessage({ type: "execute-command", command: cmd }).catch(() => {});
    }

    if (resultBox) {
      resultBox.style.display = "block";
      resultBox.className = "cb-result" + (res && res.ok ? "" : " error");
      resultBox.textContent = res ? res.result : "No result.";
    }

    if (recentBox && input) renderRecent(recentBox, input);
  }

  function closePalette() {
    if (paletteEl) { paletteEl.style.display = "none"; }
  }

  /* ── Message listener ──────────────────────────────────── */

  chrome.runtime.onMessage.addListener((msg, sender, sendResponse) => {
    if (msg.type === "toggle-palette") {
      createPalette();
      sendResponse({ ok: true });
      return false;
    }
    if (msg.type === "run-command") {
      let res = executeCommand(msg.command);
      if (res === null) {
        /* Forward to background for background-only commands */
        chrome.runtime.sendMessage({ type: "execute-command", command: msg.command })
          .then(sendResponse)
          .catch((e) => sendResponse({ ok: false, result: e.message }));
        return true;
      }
      sendResponse(res);
      return false;
    }
    return false;
  });
})();

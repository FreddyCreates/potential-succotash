# Vigil AI v18 — Downloads & Desktop App

> **Sovereign offline intelligence.** Auro AI assistant, Codex code editor, Memory Palace, Agents — all in one.

---

## ⬇️ Download Links

| Deliverable | Link | Notes |
|---|---|---|
| **Chrome/Edge Extension (zip)** | [`vigil-ai-v18.zip`](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/vigil-ai-v18.zip) | Sideload into Chrome/Edge |
| **Web App (browse online)** | [`dist/webapp/`](https://github.com/FreddyCreates/potential-succotash/tree/copilot/create-jarvis-integration/dist/webapp) | Standalone HTML/JS |
| **Desktop (Windows .exe)** | [Build it yourself](#windows-desktop-app) | Electron 33 + NSIS installer |

---

## 🧩 Install Chrome / Edge Extension

1. **Download** [`vigil-ai-v18.zip`](https://github.com/FreddyCreates/potential-succotash/raw/copilot/create-jarvis-integration/dist/extensions/vigil-ai-v18.zip)
2. Unzip it anywhere (e.g. `C:\Users\You\vigil-ai\`)
3. Open Chrome → `chrome://extensions/`
4. Enable **Developer mode** (top-right toggle)
5. Click **Load unpacked** → select the unzipped folder
6. Pin the Vigil AI icon from the toolbar ✅

---

## 🖥️ Windows Desktop App

> Requires [Node.js 18+](https://nodejs.org) installed on Windows.

```bat
git clone https://github.com/FreddyCreates/potential-succotash.git
cd potential-succotash

REM Build everything + create installer
build-desktop.bat
```

Output: `dist\desktop\Vigil AI Setup 18.0.0.exe` (NSIS installer) and a portable `.exe`.

### Dev mode (any OS)
```bash
npm install
npm run build:vigil      # build the React sidepanel
npm run start:desktop    # open as Electron window
```

---

## 🌐 Standalone Web App

The built web app lives at `dist/webapp/src/sidepanel/sidepanel.html`.

Serve it locally:
```bash
npx serve dist/webapp/src/sidepanel/
# → http://localhost:3000
```

> Note: Some features (Agents, Sentry AI) use `chrome.*` APIs that are only available inside the browser extension. The web app gives you Chat, Memory, Notes, Vault, and Codex.

---

## 🔨 Build Scripts (no GitHub Actions needed)

| Script | What it does |
|---|---|
| `bash scripts/build-all.sh` | Build extension zip + web app |
| `npm run build:vigil` | Build just the Vite extension |
| `npm run build:desktop:win` | Package Windows .exe (run on Windows) |
| `npm run start:desktop` | Launch desktop app (dev mode) |

---

## 📦 What's inside Vigil AI v18

| Feature | Status |
|---|---|
| 💬 Auro AI Chat (GPT/Claude bridge) | ✅ |
| 🧠 Solus Offline AI (transformers.js) | ✅ |
| 📝 Codex Code Editor + AI | ✅ |
| 🗓️ Memory Palace (Dexie + spatial) | ✅ |
| 🤖 Sovereign Agents (researcher/crawler) | ✅ |
| 🔐 Vault (local key-value) | ✅ |
| 📊 Knowledge Graph | ✅ |
| 🧬 Neurochemistry Engine (ODE/Hill) | ✅ |
| 📋 Inbox (proactive briefs) | ✅ |
| 📄 Files (folders in chrome.storage) | ✅ |
| 🪞 Mirror (agent reports) | ✅ |
| 💡 Prompts Library | ✅ |
| 📺 Screen Control Mode | ✅ |
| 🔒 TTS off by default | ✅ |

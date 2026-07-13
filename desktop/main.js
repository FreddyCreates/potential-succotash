/**
 * main.js — Electron main process for Vigil AI Desktop
 *
 * Architecture:
 *  • Renderer  → sends chrome.runtime.sendMessage()  via preload → ipcMain
 *  • Main      → dispatches to background.js JarvisEngine via chrome-shim
 *  • Main      → replies back to renderer via ipcMain.handle resolve
 *  • Main      → pushes unsolicited events to renderer via webContents.send
 */

'use strict';

const { app, BrowserWindow, ipcMain, nativeImage } = require('electron');
const path = require('path');
const fs   = require('fs');

/* ── Resolve jarvis extension directory ─────────────────────────── */

function resolveJarvisDir() {
  const candidates = [
    /* Packaged commercial: resources/jarvis (built dist or legacy root) */
    path.join(process.resourcesPath || '', 'jarvis'),
    /* Dev: vite dist first (multi-swarm commercial build) */
    path.join(__dirname, '..', 'extensions', 'jarvis', 'dist'),
    /* Dev: legacy extension root */
    path.join(__dirname, '..', 'extensions', 'jarvis'),
  ];
  for (const c of candidates) {
    if (
      fs.existsSync(path.join(c, 'sidepanel.html')) ||
      fs.existsSync(path.join(c, 'src', 'sidepanel', 'sidepanel.html')) ||
      fs.existsSync(path.join(c, 'background.js')) ||
      fs.existsSync(path.join(c, 'src', 'background', 'index.js'))
    ) {
      return c;
    }
  }
  return path.join(__dirname, '..', 'extensions', 'jarvis');
}

function resolveSidepanelHtml(jarvisDir) {
  const paths = [
    path.join(jarvisDir, 'sidepanel.html'),
    path.join(jarvisDir, 'src', 'sidepanel', 'sidepanel.html'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return paths[0];
}

function resolveBackgroundScript(jarvisDir) {
  const paths = [
    path.join(jarvisDir, 'background.js'),
    path.join(jarvisDir, 'src', 'background', 'index.js'),
    /* Fallback: sibling legacy when packaging dist-only */
    path.join(__dirname, '..', 'extensions', 'jarvis', 'background.js'),
  ];
  for (const p of paths) {
    if (fs.existsSync(p)) return p;
  }
  return paths[0];
}

global.__jarvisDir = resolveJarvisDir();

/* ── Boot background.js with chrome shim ────────────────────────── */

const shim = require('./chrome-shim');

/* Inject chrome into global so background.js can use it directly */
global.chrome = shim.chrome;

/* Also expose globalThis.chrome for ES2020 compat */
global.globalThis = global;

/* Load background — CommonJS preferred; ES module dist attempted via import() */
(function bootBackground() {
  const bg = resolveBackgroundScript(global.__jarvisDir);
  try {
    require(bg);
    console.log('[Vigil AI] background loaded (CJS):', bg);
  } catch (e) {
    console.warn('[Vigil AI] CJS load failed, trying dynamic import:', e.message);
    import('file:///' + bg.replace(/\\/g, '/'))
      .then(function () { console.log('[Vigil AI] background loaded (ESM):', bg); })
      .catch(function (err) {
        console.error('[Vigil AI] Failed to load background:', err && err.message ? err.message : err);
      });
  }
})();

/* ── IPC: renderer → background ─────────────────────────────────── */

ipcMain.handle('jarvis-message', function (_event, message) {
  return new Promise(function (resolve) {
    var responded = false;
    function sendResponse(resp) {
      if (!responded) { responded = true; resolve(resp); }
    }

    var async = shim.dispatchMessage(message, { tab: null }, sendResponse);
    /* If no listener returned true (async), resolve with null after tick */
    if (!async) {
      setImmediate(function () {
        if (!responded) { responded = true; resolve(null); }
      });
    }
    /* Safety timeout: always resolve within 8s */
    setTimeout(function () {
      if (!responded) { responded = true; resolve({ success: false, error: 'timeout' }); }
    }, 8000);
  });
});

/* ── IPC: storage get/set (used by preload for chrome.storage.local) */

ipcMain.handle('storage-get', function (_event, keys) {
  return new Promise(function (resolve) {
    shim.chrome.storage.local.get(keys, resolve);
  });
});

ipcMain.handle('storage-set', function (_event, items) {
  return new Promise(function (resolve) {
    shim.chrome.storage.local.set(items, resolve);
  });
});

/* ── Window ─────────────────────────────────────────────────────── */

let mainWindow = null;

function createWindow() {
  const iconPath = path.join(global.__jarvisDir, 'icons', 'icon128.png');
  const icon = fs.existsSync(iconPath) ? nativeImage.createFromPath(iconPath) : undefined;

  mainWindow = new BrowserWindow({
    width:          420,
    height:         760,
    minWidth:       360,
    minHeight:      500,
    title:          'Vigil AI',
    icon:           icon,
    backgroundColor: '#0d1117',
    webPreferences: {
      preload:             path.join(__dirname, 'preload.js'),
      contextIsolation:    true,
      nodeIntegration:     false,
      sandbox:             false
    }
  });

  /* Remove default menu bar */
  mainWindow.setMenuBarVisibility(false);

  /* Load the side panel UI (legacy root or vite dist layout) */
  const panelPath = resolveSidepanelHtml(global.__jarvisDir);
  mainWindow.loadFile(panelPath);

  mainWindow.on('closed', function () { mainWindow = null; });
}

/* ── App lifecycle ──────────────────────────────────────────────── */

app.whenReady().then(function () {
  createWindow();

  app.on('activate', function () {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit();
});

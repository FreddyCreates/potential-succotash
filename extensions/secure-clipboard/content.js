/* Secure Clipboard — Content Script */

(function () {
  'use strict';

  let toastTimeout = null;

  // ── Copy Event Listener ─────────────────────────────────────────────────

  document.addEventListener('copy', (e) => {
    const selection = window.getSelection();
    if (!selection || selection.isCollapsed) return;

    const text = selection.toString();
    if (!text || !text.trim()) return;

    try {
      chrome.runtime.sendMessage(
        { type: 'COPY_EVENT', text: text, url: window.location.href },
        (response) => {
          if (chrome.runtime.lastError) return;
          if (response?.ok) {
            showToast('Saved to Secure Clipboard');
          }
        }
      );
    } catch {
      // Extension context invalidated
    }
  });

  // ── Paste at Cursor ─────────────────────────────────────────────────────

  chrome.runtime.onMessage.addListener((msg) => {
    if (msg.type === 'PASTE_AT_CURSOR' && msg.text) {
      pasteAtCursor(msg.text);
    }
  });

  function pasteAtCursor(text) {
    const el = document.activeElement;
    if (!el) return;

    if (el.isContentEditable) {
      document.execCommand('insertText', false, text);
      showToast('Pasted from Secure Clipboard');
      return;
    }

    if (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') {
      const start = el.selectionStart ?? el.value.length;
      const end = el.selectionEnd ?? el.value.length;
      const before = el.value.substring(0, start);
      const after = el.value.substring(end);
      el.value = before + text + after;
      el.selectionStart = el.selectionEnd = start + text.length;

      el.dispatchEvent(new Event('input', { bubbles: true }));
      el.dispatchEvent(new Event('change', { bubbles: true }));
      showToast('Pasted from Secure Clipboard');
      return;
    }

    // Fallback: try execCommand
    try {
      document.execCommand('insertText', false, text);
      showToast('Pasted from Secure Clipboard');
    } catch {
      showToast('Could not paste — focus an input first');
    }
  }

  // ── Toast Notification ──────────────────────────────────────────────────

  function showToast(message) {
    let toast = document.getElementById('secure-clipboard-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'secure-clipboard-toast';
      Object.assign(toast.style, {
        position: 'fixed',
        bottom: '20px',
        right: '20px',
        background: '#1a1a2e',
        color: '#4fc3f7',
        padding: '10px 20px',
        borderRadius: '8px',
        fontSize: '13px',
        fontFamily: 'system-ui, -apple-system, sans-serif',
        zIndex: '2147483647',
        boxShadow: '0 4px 20px rgba(0,0,0,0.5)',
        border: '1px solid #4fc3f7',
        transition: 'opacity 0.3s ease',
        opacity: '0',
        pointerEvents: 'none'
      });
      document.body.appendChild(toast);
    }

    toast.textContent = message;
    toast.style.opacity = '1';

    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
      toast.style.opacity = '0';
    }, 2000);
  }

  // ── Manual Capture via Context ──────────────────────────────────────────

  document.addEventListener('keydown', (e) => {
    // Ctrl+Shift+S to manually save selection
    if (e.ctrlKey && e.shiftKey && e.key === 'S') {
      const text = window.getSelection()?.toString();
      if (text && text.trim()) {
        e.preventDefault();
        try {
          chrome.runtime.sendMessage(
            { type: 'COPY_EVENT', text: text, url: window.location.href },
            () => {
              if (!chrome.runtime.lastError) {
                showToast('Saved to Secure Clipboard');
              }
            }
          );
        } catch {
          // Extension context invalidated
        }
      }
    }
  });
})();

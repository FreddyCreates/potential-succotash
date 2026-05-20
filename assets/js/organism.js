/**
 * Nova Gate — Sovereign Organism Core JavaScript
 * φ-Mathematics: PHI=1.618, HEARTBEAT_MS=873, THRESHOLD=0.618
 * Production-ready scripts for itsnotailabs.com
 */

(function() {
  'use strict';

  /* ═══════════════════════════════════════════════════════════════════
     φ-MATHEMATICS CONSTANTS
     ═══════════════════════════════════════════════════════════════════ */
  const PHI = 1.618033988749895;
  const PHI_INVERSE = 0.6180339887498949;
  const HEARTBEAT_MS = 873;
  const THRESHOLD = 0.618;

  // Fibonacci sequence generator
  function fibonacci(n) {
    if (n <= 1) return n;
    let a = 0, b = 1;
    for (let i = 2; i <= n; i++) {
      [a, b] = [b, a + b];
    }
    return b;
  }

  // Golden ratio calculation
  function goldenRatio(value) {
    return value * PHI;
  }

  /* ═══════════════════════════════════════════════════════════════════
     NAVIGATION
     ═══════════════════════════════════════════════════════════════════ */
  function initNavigation() {
    const navToggle = document.querySelector('.nav-toggle');
    const navLinks = document.querySelector('.nav-links');
    
    if (navToggle && navLinks) {
      navToggle.addEventListener('click', () => {
        navLinks.classList.toggle('open');
        const isOpen = navLinks.classList.contains('open');
        navToggle.setAttribute('aria-expanded', isOpen);
        navToggle.innerHTML = isOpen ? '✕' : '☰';
      });
    }

    // Highlight active nav link
    const currentPath = window.location.pathname;
    document.querySelectorAll('.nav-link').forEach(link => {
      if (link.getAttribute('href') === currentPath) {
        link.classList.add('active');
      }
    });

    // Shrink nav on scroll
    const nav = document.querySelector('.nav');
    if (nav) {
      let lastScroll = 0;
      window.addEventListener('scroll', () => {
        const currentScroll = window.pageYOffset;
        if (currentScroll > 100) {
          nav.classList.add('nav-scrolled');
        } else {
          nav.classList.remove('nav-scrolled');
        }
        lastScroll = currentScroll;
      }, { passive: true });
    }
  }

  /* ═══════════════════════════════════════════════════════════════════
     SMOOTH SCROLL
     ═══════════════════════════════════════════════════════════════════ */
  function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
      anchor.addEventListener('click', function(e) {
        const href = this.getAttribute('href');
        if (href === '#') return;
        
        const target = document.querySelector(href);
        if (target) {
          e.preventDefault();
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
          
          // Update URL without jumping
          history.pushState(null, null, href);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     ANIMATE ON SCROLL
     ═══════════════════════════════════════════════════════════════════ */
  function initScrollAnimations() {
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('animate-fade-in');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    document.querySelectorAll('.card, .section-header, [data-animate]').forEach(el => {
      el.style.opacity = '0';
      observer.observe(el);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     COUNTER ANIMATION
     ═══════════════════════════════════════════════════════════════════ */
  function animateCounter(el, target, duration = 2000) {
    const start = 0;
    const startTime = performance.now();
    
    function update(currentTime) {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic for φ-like natural feel
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(start + (target - start) * easeOut);
      
      el.textContent = current.toLocaleString();
      
      if (progress < 1) {
        requestAnimationFrame(update);
      } else {
        el.textContent = target.toLocaleString();
      }
    }
    
    requestAnimationFrame(update);
  }

  function initCounters() {
    const counters = document.querySelectorAll('[data-counter]');
    
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const target = parseInt(entry.target.dataset.counter, 10);
          animateCounter(entry.target, target);
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });

    counters.forEach(counter => observer.observe(counter));
  }

  /* ═══════════════════════════════════════════════════════════════════
     HEARTBEAT INDICATOR
     ═══════════════════════════════════════════════════════════════════ */
  function initHeartbeat() {
    const indicators = document.querySelectorAll('.heartbeat-dot');
    
    // Sync all heartbeat indicators to φ-based timing
    indicators.forEach((dot, index) => {
      const delay = index * (HEARTBEAT_MS / 5);
      dot.style.animationDelay = `${delay}ms`;
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     COPY TO CLIPBOARD
     ═══════════════════════════════════════════════════════════════════ */
  function initClipboard() {
    document.querySelectorAll('[data-copy]').forEach(btn => {
      btn.addEventListener('click', async () => {
        const text = btn.dataset.copy;
        try {
          await navigator.clipboard.writeText(text);
          const originalText = btn.textContent;
          btn.textContent = 'Copied!';
          btn.classList.add('copied');
          setTimeout(() => {
            btn.textContent = originalText;
            btn.classList.remove('copied');
          }, 2000);
        } catch (err) {
          console.error('Failed to copy:', err);
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     TABS
     ═══════════════════════════════════════════════════════════════════ */
  function initTabs() {
    document.querySelectorAll('[data-tabs]').forEach(tabContainer => {
      const tabs = tabContainer.querySelectorAll('[data-tab]');
      const panels = tabContainer.querySelectorAll('[data-panel]');
      
      tabs.forEach(tab => {
        tab.addEventListener('click', () => {
          const targetPanel = tab.dataset.tab;
          
          // Deactivate all
          tabs.forEach(t => t.classList.remove('active'));
          panels.forEach(p => p.classList.remove('active'));
          
          // Activate selected
          tab.classList.add('active');
          const panel = tabContainer.querySelector(`[data-panel="${targetPanel}"]`);
          if (panel) panel.classList.add('active');
        });
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     THEME TOGGLE
     ═══════════════════════════════════════════════════════════════════ */
  function initThemeToggle() {
    const toggle = document.querySelector('[data-theme-toggle]');
    if (!toggle) return;

    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)');
    const currentTheme = localStorage.getItem('theme') || (prefersDark.matches ? 'dark' : 'light');
    
    document.documentElement.setAttribute('data-theme', currentTheme);
    
    toggle.addEventListener('click', () => {
      const current = document.documentElement.getAttribute('data-theme');
      const next = current === 'dark' ? 'light' : 'dark';
      document.documentElement.setAttribute('data-theme', next);
      localStorage.setItem('theme', next);
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     SEARCH FUNCTIONALITY
     ═══════════════════════════════════════════════════════════════════ */
  function initSearch() {
    const searchInput = document.querySelector('[data-search]');
    const searchResults = document.querySelector('[data-search-results]');
    
    if (!searchInput) return;

    let debounceTimeout;
    
    searchInput.addEventListener('input', (e) => {
      clearTimeout(debounceTimeout);
      const query = e.target.value.trim().toLowerCase();
      
      if (query.length < 2) {
        if (searchResults) searchResults.innerHTML = '';
        return;
      }
      
      debounceTimeout = setTimeout(() => {
        // Search through cards or items
        const items = document.querySelectorAll('[data-searchable]');
        const matches = [];
        
        items.forEach(item => {
          const text = item.textContent.toLowerCase();
          if (text.includes(query)) {
            matches.push(item);
          }
        });
        
        // Highlight matches
        items.forEach(item => item.classList.remove('search-match', 'search-hidden'));
        
        if (query) {
          items.forEach(item => {
            if (matches.includes(item)) {
              item.classList.add('search-match');
            } else {
              item.classList.add('search-hidden');
            }
          });
        }
      }, 200); // Debounce delay
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     TOOLTIP
     ═══════════════════════════════════════════════════════════════════ */
  function initTooltips() {
    document.querySelectorAll('[data-tooltip]').forEach(el => {
      const text = el.dataset.tooltip;
      
      el.addEventListener('mouseenter', () => {
        const tooltip = document.createElement('div');
        tooltip.className = 'tooltip';
        tooltip.textContent = text;
        document.body.appendChild(tooltip);
        
        const rect = el.getBoundingClientRect();
        tooltip.style.top = `${rect.top - tooltip.offsetHeight - 8}px`;
        tooltip.style.left = `${rect.left + (rect.width - tooltip.offsetWidth) / 2}px`;
        
        el._tooltip = tooltip;
      });
      
      el.addEventListener('mouseleave', () => {
        if (el._tooltip) {
          el._tooltip.remove();
          delete el._tooltip;
        }
      });
    });
  }

  /* ═══════════════════════════════════════════════════════════════════
     ORGANISM BRIDGE (API Connection)
     ═══════════════════════════════════════════════════════════════════ */
  const OrganismBridge = {
    baseUrl: '/api',
    
    async fetch(endpoint, options = {}) {
      const url = `${this.baseUrl}${endpoint}`;
      try {
        const response = await fetch(url, {
          headers: {
            'Content-Type': 'application/json',
            ...options.headers
          },
          ...options
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        return await response.json();
      } catch (error) {
        console.error('Organism Bridge Error:', error);
        throw error;
      }
    },
    
    // Protocol status
    async getProtocolStatus() {
      return this.fetch('/protocols/status');
    },
    
    // Worker health
    async getWorkerHealth() {
      return this.fetch('/workers/health');
    },
    
    // φ-Mathematics calculations
    phi: {
      calculate: goldenRatio,
      fibonacci: fibonacci,
      PHI,
      PHI_INVERSE,
      HEARTBEAT_MS,
      THRESHOLD
    }
  };

  // Expose to global scope
  window.OrganismBridge = OrganismBridge;

  /* ═══════════════════════════════════════════════════════════════════
     INITIALIZATION
     ═══════════════════════════════════════════════════════════════════ */
  function init() {
    initNavigation();
    initSmoothScroll();
    initScrollAnimations();
    initCounters();
    initHeartbeat();
    initClipboard();
    initTabs();
    initThemeToggle();
    initSearch();
    initTooltips();
    
    console.log(`🧬 Nova Gate initialized | φ=${PHI} | HB=${HEARTBEAT_MS}ms`);
  }

  // Initialize when DOM is ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();

/* content.js — Real DOM analysis for Page Intelligence */

(() => {
  "use strict";

  const STOP_WORDS = new Set([
    "the","be","to","of","and","a","in","that","have","i","it","for","not","on",
    "with","he","as","you","do","at","this","but","his","by","from","they","we",
    "say","her","she","or","an","will","my","one","all","would","there","their",
    "what","so","up","out","if","about","who","get","which","go","me","when",
    "make","can","like","time","no","just","him","know","take","people","into",
    "year","your","good","some","could","them","see","other","than","then","now",
    "look","only","come","its","over","think","also","back","after","use","two",
    "how","our","work","first","well","way","even","new","want","because","any",
    "these","give","day","most","us","is","are","was","were","been","has","had",
    "did","does","am","being","been","do","did","doing","very","more","much",
    "such","each","few","many","own","same","too","should","must","may","might",
    "shall","need","let","here","where","why","yet","still","already","else"
  ]);

  function analyzeText() {
    const body = document.body;
    if (!body) return { wordCount: 0, charCount: 0, sentenceCount: 0, paragraphCount: 0, readingTime: "0 min", topWords: [] };

    const walker = document.createTreeWalker(body, NodeFilter.SHOW_TEXT, {
      acceptNode(node) {
        const tag = node.parentElement ? node.parentElement.tagName : "";
        if (["SCRIPT", "STYLE", "NOSCRIPT", "SVG", "IFRAME"].includes(tag)) return NodeFilter.FILTER_REJECT;
        return NodeFilter.FILTER_ACCEPT;
      }
    });

    let fullText = "";
    while (walker.nextNode()) {
      fullText += " " + walker.currentNode.textContent;
    }

    fullText = fullText.replace(/\s+/g, " ").trim();
    const words = fullText.split(/\s+/).filter(w => w.length > 0);
    const wordCount = words.length;
    const charCount = fullText.length;
    const sentences = fullText.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const paragraphs = document.querySelectorAll("p");
    const readingMinutes = Math.max(1, Math.ceil(wordCount / 200));

    // Top 20 frequent words
    const freq = {};
    for (const w of words) {
      const lower = w.toLowerCase().replace(/[^a-z0-9'-]/g, "");
      if (lower.length < 3 || STOP_WORDS.has(lower)) continue;
      freq[lower] = (freq[lower] || 0) + 1;
    }
    const topWords = Object.entries(freq)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 20)
      .map(([word, count]) => ({ word, count }));

    return {
      wordCount,
      charCount,
      sentenceCount: sentences.length,
      paragraphCount: paragraphs.length,
      readingTime: readingMinutes + " min",
      topWords
    };
  }

  function analyzeHeadings() {
    const headings = [];
    const issues = [];
    let hasH1 = false;
    let h1Count = 0;
    let prevLevel = 0;

    document.querySelectorAll("h1, h2, h3, h4, h5, h6").forEach(el => {
      const level = parseInt(el.tagName[1], 10);
      const text = el.textContent.trim().substring(0, 200);
      headings.push({ tag: el.tagName, level, text });

      if (level === 1) { hasH1 = true; h1Count++; }
      if (prevLevel > 0 && level > prevLevel + 1) {
        issues.push(`Skipped heading level: h${prevLevel} → h${level}`);
      }
      prevLevel = level;
    });

    if (!hasH1) issues.push("Missing h1 element");
    if (h1Count > 1) issues.push(`Multiple h1 elements found (${h1Count})`);

    return { headings, issues, count: headings.length };
  }

  function analyzeLinks() {
    const currentHost = location.hostname;
    const links = [];
    let internal = 0, external = 0, emptyText = 0, newTab = 0, mailto = 0, tel = 0, suspicious = 0;

    document.querySelectorAll("a[href]").forEach(el => {
      const href = el.getAttribute("href") || "";
      const text = el.textContent.trim().substring(0, 150);
      const isExternal = (() => {
        try {
          const url = new URL(href, location.href);
          return url.hostname !== currentHost;
        } catch { return false; }
      })();

      if (isExternal) external++; else internal++;
      if (!text && !el.querySelector("img")) emptyText++;
      if (el.target === "_blank") newTab++;
      if (href.startsWith("mailto:")) mailto++;
      if (href.startsWith("tel:")) tel++;
      if (href === "#" || href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:")) suspicious++;

      links.push({
        href: href.substring(0, 300),
        text: text || "(empty)",
        isExternal,
        newTab: el.target === "_blank",
        type: href.startsWith("mailto:") ? "mailto" : href.startsWith("tel:") ? "tel" : (href === "#" || href.startsWith("javascript:") || href.startsWith("data:") || href.startsWith("vbscript:")) ? "suspicious" : "normal"
      });
    });

    return { links, total: links.length, internal, external, emptyText, newTab, mailto, tel, suspicious };
  }

  function analyzeImages() {
    const images = [];
    let missingAlt = 0, emptyAlt = 0, lazyLoaded = 0;

    document.querySelectorAll("img").forEach(el => {
      const src = el.getAttribute("src") || el.getAttribute("data-src") || "";
      const alt = el.getAttribute("alt");
      const hasAlt = alt !== null;
      const isEmptyAlt = hasAlt && alt.trim() === "";

      if (!hasAlt) missingAlt++;
      if (isEmptyAlt) emptyAlt++;
      if (el.loading === "lazy" || el.hasAttribute("data-src") || el.dataset.lazy) lazyLoaded++;

      images.push({
        src: src.substring(0, 300),
        alt: hasAlt ? alt.substring(0, 200) : null,
        width: el.naturalWidth || el.width || 0,
        height: el.naturalHeight || el.height || 0,
        hasAlt,
        isEmptyAlt,
        isLazy: el.loading === "lazy" || el.hasAttribute("data-src")
      });
    });

    return { images, total: images.length, missingAlt, emptyAlt, lazyLoaded };
  }

  function analyzeSEO() {
    const getMetaContent = (name) => {
      const el = document.querySelector(`meta[name="${name}"], meta[property="${name}"]`);
      return el ? el.getAttribute("content") || "" : null;
    };

    const title = document.title || "";
    const description = getMetaContent("description");
    const canonical = document.querySelector("link[rel='canonical']");
    const robots = getMetaContent("robots");
    const charset = document.characterSet || document.charset || "";
    const viewport = getMetaContent("viewport");
    const lang = document.documentElement.lang || null;

    // OG tags
    const ogTags = {};
    document.querySelectorAll('meta[property^="og:"]').forEach(el => {
      ogTags[el.getAttribute("property")] = el.getAttribute("content") || "";
    });

    // Twitter Card tags
    const twitterTags = {};
    document.querySelectorAll('meta[name^="twitter:"]').forEach(el => {
      twitterTags[el.getAttribute("name")] = el.getAttribute("content") || "";
    });

    const issues = [];
    if (!title) issues.push("Missing page title");
    else if (title.length > 60) issues.push(`Title too long (${title.length} chars, recommended ≤60)`);
    else if (title.length < 10) issues.push(`Title too short (${title.length} chars)`);

    if (!description) issues.push("Missing meta description");
    else if (description.length > 160) issues.push(`Meta description too long (${description.length} chars, recommended ≤160)`);
    else if (description.length < 50) issues.push(`Meta description too short (${description.length} chars)`);

    if (!canonical) issues.push("Missing canonical URL");
    if (!viewport) issues.push("Missing viewport meta tag");
    if (!lang) issues.push("Missing lang attribute on <html>");
    if (Object.keys(ogTags).length === 0) issues.push("No Open Graph tags found");
    if (Object.keys(twitterTags).length === 0) issues.push("No Twitter Card tags found");

    return {
      title,
      titleLength: title.length,
      description,
      descriptionLength: description ? description.length : 0,
      canonical: canonical ? canonical.href : null,
      robots,
      charset,
      viewport,
      lang,
      ogTags,
      twitterTags,
      issues
    };
  }

  function analyzeAccessibility() {
    const issues = [];

    // Inputs without labels
    const inputs = document.querySelectorAll("input, select, textarea");
    let unlabeled = 0;
    inputs.forEach(el => {
      const id = el.id || "";
      const hasLabel = id.length > 0 && document.querySelector(`label[for="${CSS.escape(id)}"]`);
      const hasAriaLabel = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby");
      const wrappedInLabel = el.closest("label");
      if (!hasLabel && !hasAriaLabel && !wrappedInLabel && el.type !== "hidden") {
        unlabeled++;
        issues.push({ severity: "error", message: `Input without label: <${el.tagName.toLowerCase()} type="${el.type || "text"}">` });
      }
    });

    // Buttons without accessible names
    let unnamedButtons = 0;
    document.querySelectorAll("button, [role='button']").forEach(el => {
      const text = el.textContent.trim();
      const ariaLabel = el.getAttribute("aria-label") || el.getAttribute("aria-labelledby") || el.getAttribute("title");
      if (!text && !ariaLabel && !el.querySelector("img[alt]")) {
        unnamedButtons++;
        issues.push({ severity: "error", message: "Button without accessible name" });
      }
    });

    // ARIA landmarks
    const landmarks = [];
    const landmarkRoles = ["banner", "navigation", "main", "contentinfo", "complementary", "search", "form", "region"];
    landmarkRoles.forEach(role => {
      const els = document.querySelectorAll(`[role="${role}"]`);
      if (els.length > 0) landmarks.push({ role, count: els.length });
    });
    // Semantic landmarks
    const semanticMap = { HEADER: "banner", NAV: "navigation", MAIN: "main", FOOTER: "contentinfo", ASIDE: "complementary" };
    for (const [tag, role] of Object.entries(semanticMap)) {
      const els = document.querySelectorAll(tag);
      if (els.length > 0) {
        const existing = landmarks.find(l => l.role === role);
        if (existing) existing.count += els.length;
        else landmarks.push({ role, count: els.length });
      }
    }

    // Missing lang
    const lang = document.documentElement.lang;
    if (!lang) {
      issues.push({ severity: "warning", message: "Missing lang attribute on <html> element" });
    }

    // Images without alt
    const imgsNoAlt = document.querySelectorAll("img:not([alt])").length;
    if (imgsNoAlt > 0) {
      issues.push({ severity: "error", message: `${imgsNoAlt} image(s) missing alt attribute` });
    }

    // Skip links
    const skipLink = document.querySelector('a[href="#main-content"], a[href="#content"], a.skip-link, a.skip-to-content');
    if (!skipLink) {
      issues.push({ severity: "warning", message: "No skip-to-content link found" });
    }

    return { issues, unlabeledInputs: unlabeled, unnamedButtons, landmarks };
  }

  function analyzePerformance() {
    const domNodeCount = document.querySelectorAll("*").length;
    const scripts = document.querySelectorAll("script").length;
    const stylesheets = document.querySelectorAll('link[rel="stylesheet"], style').length;

    let timing = null;
    if (performance && performance.timing) {
      const t = performance.timing;
      timing = {
        domContentLoaded: t.domContentLoadedEventEnd - t.navigationStart,
        domComplete: t.domComplete - t.navigationStart,
        loadEvent: t.loadEventEnd - t.navigationStart,
        ttfb: t.responseStart - t.navigationStart,
        domInteractive: t.domInteractive - t.navigationStart
      };
    }

    // Navigation Timing API (newer)
    let navTiming = null;
    try {
      const entries = performance.getEntriesByType("navigation");
      if (entries.length > 0) {
        const nav = entries[0];
        navTiming = {
          domContentLoaded: Math.round(nav.domContentLoadedEventEnd),
          domComplete: Math.round(nav.domComplete),
          loadEvent: Math.round(nav.loadEventEnd),
          ttfb: Math.round(nav.responseStart),
          transferSize: nav.transferSize || 0,
          encodedBodySize: nav.encodedBodySize || 0,
          decodedBodySize: nav.decodedBodySize || 0
        };
      }
    } catch (e) { /* not available */ }

    // LCP
    let lcp = null;
    try {
      const lcpEntries = performance.getEntriesByType("largest-contentful-paint");
      if (lcpEntries.length > 0) {
        const last = lcpEntries[lcpEntries.length - 1];
        lcp = { time: Math.round(last.startTime), element: last.element ? last.element.tagName : "unknown" };
      }
    } catch (e) { /* not available */ }

    return {
      domNodeCount,
      scripts,
      stylesheets,
      timing: navTiming || timing,
      lcp,
      warnings: domNodeCount > 1500 ? [`High DOM node count: ${domNodeCount}`] : []
    };
  }

  // Listen for analysis requests from background/popup/sidepanel
  chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === "runAnalysis") {
      try {
        const result = {
          url: location.href,
          title: document.title,
          timestamp: new Date().toISOString(),
          text: analyzeText(),
          headings: analyzeHeadings(),
          links: analyzeLinks(),
          images: analyzeImages(),
          seo: analyzeSEO(),
          accessibility: analyzeAccessibility(),
          performance: analyzePerformance()
        };
        sendResponse(result);
      } catch (err) {
        sendResponse({ error: err.message });
      }
    }
    return true;
  });
})();

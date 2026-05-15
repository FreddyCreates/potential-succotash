/**
 * Academic Research Skill — Vigil AI
 * ─────────────────────────────────────────────────────────────────
 * Connects to free academic APIs (ArXiv, OpenAlex, PubMed, Semantic
 * Scholar, CrossRef) and provides offline-capable research tools.
 *
 * Capabilities:
 *  1.  ArXiv paper search (physics, math, CS, economics, biology)
 *  2.  OpenAlex paper / author / journal lookup
 *  3.  PubMed / MEDLINE search (biomedical)
 *  4.  Semantic Scholar search
 *  5.  CrossRef DOI metadata lookup
 *  6.  Citation generator (APA, MLA, Chicago, IEEE, Harvard)
 *  7.  Hypothesis generator (offline)
 *  8.  Research question refiner
 *  9.  Literature review synthesizer
 * 10.  Methodology evaluator (offline heuristics)
 * 11.  Statistical significance explainer
 * 12.  Peer review simulator
 * 13.  Abstract scorer / clarity checker
 * 14.  Research gap identifier
 * 15.  Fact-checker (Wikipedia + OpenAlex)
 */

function safeFetch(url: string, ms = 7000): Promise<Response | null> {
  return Promise.race([
    fetch(url),
    new Promise<null>(res => setTimeout(() => res(null), ms)),
  ]);
}

/* ─────────────────────────────────────────────────────────────────
 *  ARXIV SEARCH
 * ──────────────────────────────────────────────────────────────── */
export interface ArxivResult {
  id: string;
  title: string;
  authors: string[];
  published: string;
  summary: string;
  url: string;
  categories: string[];
}

export async function searchArxiv(query: string, maxResults = 5): Promise<ArxivResult[]> {
  const url = `https://export.arxiv.org/api/query?search_query=all:${encodeURIComponent(query)}&max_results=${maxResults}&sortBy=relevance&sortOrder=descending`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return [];
  const text = await resp.text();

  // Parse atom XML with DOMParser (available in extension context)
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'application/xml');
  const entries = Array.from(doc.querySelectorAll('entry'));

  return entries.map(e => {
    const id = e.querySelector('id')?.textContent?.trim() ?? '';
    const arxivId = id.replace('http://arxiv.org/abs/', '');
    const authors = Array.from(e.querySelectorAll('author name')).map(a => a.textContent?.trim() ?? '');
    const categories = Array.from(e.querySelectorAll('category')).map(c => c.getAttribute('term') ?? '');
    return {
      id: arxivId,
      title: e.querySelector('title')?.textContent?.replace(/\s+/g, ' ').trim() ?? '',
      authors,
      published: e.querySelector('published')?.textContent?.slice(0, 10) ?? '',
      summary: e.querySelector('summary')?.textContent?.replace(/\s+/g, ' ').trim().slice(0, 400) ?? '',
      url: `https://arxiv.org/abs/${arxivId}`,
      categories,
    };
  });
}

export function formatArxivResults(results: ArxivResult[]): string {
  if (results.length === 0) return '⚠️ No ArXiv papers found. Check your connection or try different keywords.';
  return `📚 ArXiv Results (${results.length}):\n\n` + results.map((r, i) =>
    `${i + 1}. ${r.title}\n   Authors: ${r.authors.slice(0, 3).join(', ')}${r.authors.length > 3 ? ' et al.' : ''}\n   Published: ${r.published} | Categories: ${r.categories.slice(0, 2).join(', ')}\n   ${r.url}\n   ${r.summary.slice(0, 200)}…`
  ).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  PUBMED SEARCH
 * ──────────────────────────────────────────────────────────────── */
export interface PubmedResult {
  pmid: string;
  title: string;
  abstract: string;
  authors: string[];
  journal: string;
  pubDate: string;
  url: string;
}

export async function searchPubmed(query: string, limit = 5): Promise<PubmedResult[]> {
  // Step 1: esearch to get PMIDs
  const searchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi?db=pubmed&term=${encodeURIComponent(query)}&retmax=${limit}&retmode=json`;
  const searchResp = await safeFetch(searchUrl);
  if (!searchResp || !searchResp.ok) return [];
  const searchJson = await searchResp.json() as { esearchresult?: { idlist?: string[] } };
  const ids = searchJson.esearchresult?.idlist ?? [];
  if (ids.length === 0) return [];

  // Step 2: efetch to get details
  const fetchUrl = `https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi?db=pubmed&id=${ids.join(',')}&retmode=xml`;
  const fetchResp = await safeFetch(fetchUrl);
  if (!fetchResp || !fetchResp.ok) return [];
  const xml = await fetchResp.text();
  const parser = new DOMParser();
  const doc = parser.parseFromString(xml, 'application/xml');
  const articles = Array.from(doc.querySelectorAll('PubmedArticle'));

  return articles.map(a => {
    const pmid = a.querySelector('PMID')?.textContent ?? '';
    const title = a.querySelector('ArticleTitle')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const abstractText = Array.from(a.querySelectorAll('AbstractText')).map(n => n.textContent).join(' ').replace(/\s+/g, ' ').trim();
    const authors = Array.from(a.querySelectorAll('Author')).map(au => {
      const ln = au.querySelector('LastName')?.textContent ?? '';
      const fn = au.querySelector('ForeName')?.textContent ?? '';
      return fn ? `${fn} ${ln}` : ln;
    });
    const journal = a.querySelector('Title')?.textContent?.replace(/\s+/g, ' ').trim() ?? '';
    const year = a.querySelector('PubDate Year')?.textContent ?? a.querySelector('MedlineDate')?.textContent?.slice(0, 4) ?? '';
    return { pmid, title, abstract: abstractText.slice(0, 400), authors, journal, pubDate: year, url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/` };
  });
}

export function formatPubmedResults(results: PubmedResult[]): string {
  if (results.length === 0) return '⚠️ No PubMed articles found. Try different medical/biomedical terms.';
  return `🏥 PubMed Results (${results.length}):\n\n` + results.map((r, i) =>
    `${i + 1}. ${r.title}\n   Authors: ${r.authors.slice(0, 3).join(', ')}${r.authors.length > 3 ? ' et al.' : ''}\n   Journal: ${r.journal} (${r.pubDate})\n   ${r.url}\n   ${r.abstract.slice(0, 200)}…`
  ).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  OPENALEX PAPER SEARCH
 * ──────────────────────────────────────────────────────────────── */
export interface OpenAlexResult {
  title: string;
  authorNames: string[];
  year: number;
  citationCount: number;
  doi: string;
  url: string;
  venue: string;
  abstract: string;
}

export async function searchOpenAlex(query: string, limit = 5): Promise<OpenAlexResult[]> {
  const url = `https://api.openalex.org/works?search=${encodeURIComponent(query)}&per-page=${limit}&select=title,authorships,publication_year,cited_by_count,doi,primary_location,abstract_inverted_index&mailto=vigil@ai`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return [];
  const json = await resp.json() as { results?: Array<{
    title?: string;
    authorships?: Array<{ author?: { display_name?: string } }>;
    publication_year?: number;
    cited_by_count?: number;
    doi?: string;
    primary_location?: { source?: { display_name?: string } };
    abstract_inverted_index?: Record<string, number[]>;
  }> };

  return (json.results ?? []).map(r => {
    const authorNames = (r.authorships ?? []).map(a => a.author?.display_name ?? '').filter(Boolean);
    const doi = r.doi ?? '';
    // Reconstruct abstract from inverted index
    let abstract = '';
    if (r.abstract_inverted_index) {
      const wordPositions: Array<[number, string]> = [];
      for (const [word, positions] of Object.entries(r.abstract_inverted_index)) {
        for (const pos of positions) wordPositions.push([pos, word]);
      }
      wordPositions.sort((a, b) => a[0] - b[0]);
      abstract = wordPositions.map(wp => wp[1]).join(' ').slice(0, 400);
    }
    return {
      title: r.title ?? '',
      authorNames,
      year: r.publication_year ?? 0,
      citationCount: r.cited_by_count ?? 0,
      doi,
      url: doi ? `https://doi.org/${doi.replace('https://doi.org/', '')}` : `https://openalex.org`,
      venue: r.primary_location?.source?.display_name ?? '',
      abstract,
    };
  });
}

export function formatOpenAlexResults(results: OpenAlexResult[]): string {
  if (results.length === 0) return '⚠️ No OpenAlex papers found. Try different keywords.';
  return `🎓 OpenAlex Results (${results.length}):\n\n` + results.map((r, i) =>
    `${i + 1}. ${r.title} (${r.year})\n   Authors: ${r.authorNames.slice(0, 3).join(', ')}${r.authorNames.length > 3 ? ' et al.' : ''}\n   Venue: ${r.venue} | Citations: ${r.citationCount}\n   ${r.url}\n   ${r.abstract.slice(0, 200)}…`
  ).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  CITATION GENERATOR
 * ──────────────────────────────────────────────────────────────── */
export type CitationStyle = 'APA' | 'MLA' | 'Chicago' | 'IEEE' | 'Harvard';

export interface CitationInput {
  title: string;
  authors: string[];
  year: number;
  journal?: string;
  volume?: string;
  issue?: string;
  pages?: string;
  doi?: string;
  url?: string;
  publisher?: string;
  edition?: string;
}

export function generateCitation(input: CitationInput, style: CitationStyle): string {
  const { title, authors, year, journal, volume, issue, pages, doi, url, publisher } = input;
  const authorList = authors.slice(0, 6);
  const etAl = authors.length > 6;

  const formatApaAuthor = (a: string) => {
    const parts = a.trim().split(' ');
    const last = parts.pop() ?? '';
    const initials = parts.map(p => p[0] + '.').join(' ');
    return initials ? `${last}, ${initials}` : last;
  };

  switch (style) {
    case 'APA': {
      const authStr = authorList.map(formatApaAuthor).join(', ') + (etAl ? ', et al.' : '');
      const source = journal
        ? `*${journal}*${volume ? `, *${volume}*` : ''}${issue ? `(${issue})` : ''}${pages ? `, ${pages}` : ''}. ${doi ? `https://doi.org/${doi}` : url ?? ''}`
        : `${publisher ?? 'Publisher'}.`;
      return `${authStr} (${year}). ${title}. ${source}`;
    }
    case 'MLA': {
      const authStr = authorList.length > 1
        ? `${authorList[0]}, et al.`
        : authorList[0] ?? '';
      const source = journal ? `*${journal}* ${volume ?? ''}${issue ? `.${issue}` : ''}, ${year}, pp. ${pages ?? 'n.p.'}. ` : `${publisher ?? ''}, ${year}. `;
      return `${authStr}. "${title}." ${source}${doi ? `doi:${doi}` : url ?? ''}`;
    }
    case 'Chicago': {
      const authStr = authorList.join(', ');
      const source = journal
        ? `*${journal}* ${volume ?? ''}${issue ? `, no. ${issue}` : ''} (${year}): ${pages ?? 'n.p.'}. ${doi ? `https://doi.org/${doi}` : ''}`
        : `${publisher ?? 'Publisher'}, ${year}.`;
      return `${authStr}. "${title}." ${source}`;
    }
    case 'IEEE': {
      const authStr = authorList.map(a => {
        const parts = a.trim().split(' ');
        const last = parts.pop() ?? '';
        const initials = parts.map(p => p[0] + '.').join(' ');
        return initials ? `${initials} ${last}` : last;
      }).join(', ');
      const source = journal
        ? `*${journal}*, vol. ${volume ?? '?'}, no. ${issue ?? '?'}, pp. ${pages ?? '?'}, ${year}.`
        : `${publisher ?? ''}, ${year}.`;
      return `${authStr}, "${title}," ${source}`;
    }
    case 'Harvard': {
      const authStr = authorList.map(formatApaAuthor).join(', ') + (etAl ? ' et al.' : '');
      const source = journal
        ? `*${journal}*, ${volume ?? ''}${issue ? `(${issue})` : ''}${pages ? `, pp. ${pages}` : ''}.`
        : `${publisher ?? 'Publisher'}.`;
      return `${authStr} ${year}, '${title}', ${source}`;
    }
  }
}

/* ─────────────────────────────────────────────────────────────────
 *  OFFLINE RESEARCH TOOLS
 * ──────────────────────────────────────────────────────────────── */

export function generateHypothesis(topic: string): string {
  const t = topic.trim();
  const templates = [
    `H1: Increasing [X] in ${t} will significantly improve [Y outcome] compared to control conditions.`,
    `H2: There is a statistically significant relationship between ${t} and [variable], as measured by [metric].`,
    `H3: Individuals/entities exposed to ${t} will demonstrate measurably different [behavior/performance] than those who are not.`,
    `H4: The effect of ${t} on [outcome] is moderated by [confounding variable], such that the relationship holds under [conditions] but not [others].`,
    `H5 (null): ${t} has no statistically significant effect on [dependent variable] (p > 0.05).`,
  ];
  const questions = [
    `• What is the mechanism by which ${t} produces its effects?`,
    `• Under what conditions does ${t} produce different outcomes?`,
    `• Who is most affected by ${t} and why?`,
    `• What are the unintended consequences of ${t}?`,
    `• How does ${t} compare to existing alternatives?`,
  ];
  return `🔬 HYPOTHESIS GENERATION — "${t}"\n\n📐 Sample Hypotheses:\n${templates.join('\n')}\n\n❓ Research Questions to Consider:\n${questions.join('\n')}\n\n💡 Tip: A good hypothesis is testable, falsifiable, specific, and grounded in existing theory. State the null hypothesis (H5) alongside your primary hypothesis.`;
}

export function refineResearchQuestion(rough: string): string {
  const r = rough.trim();
  return `🎯 RESEARCH QUESTION REFINEMENT — "${r}"\n\n` +
    `📝 Original (too broad): "${r}"\n\n` +
    `✅ Refined versions:\n` +
    `• Descriptive:   "What is the current state of ${r}?"\n` +
    `• Exploratory:   "What factors contribute to ${r}, and how do they interact?"\n` +
    `• Explanatory:   "Why does ${r} occur, and what are the underlying mechanisms?"\n` +
    `• Evaluative:    "How effective are current interventions addressing ${r}?"\n` +
    `• Predictive:    "How will ${r} change under [condition X] over the next [timeframe]?"\n\n` +
    `🔍 PICO Framework (for medical/health research):\n` +
    `• P (Population):  Who is affected by ${r}?\n` +
    `• I (Intervention): What intervention/exposure is being studied?\n` +
    `• C (Comparison):  What is it compared to?\n` +
    `• O (Outcome):     What outcome is measured?\n\n` +
    `⚡ Quick Tests:\n` +
    `• Is it testable? (can data be collected?)\n` +
    `• Is it focused? (single issue)\n` +
    `• Is it feasible? (time, budget, ethics)`;
}

export function evaluateMethodology(description: string): string {
  const d = description.toLowerCase();
  const checks = [
    { test: /random(?:iz|is)/i, label: 'Randomization', pass: /random(?:iz|is)/i.test(d), note: 'Reduces selection bias.' },
    { test: /control\s*group|comparison\s*group/i, label: 'Control group', pass: /control\s*group|comparison\s*group/i.test(d), note: 'Isolates the effect of the intervention.' },
    { test: /blind(?:ed)?|double[-\s]blind/i, label: 'Blinding', pass: /blind(?:ed)?|double[-\s]blind/i.test(d), note: 'Prevents expectation bias.' },
    { test: /sample\s*size|power\s*analy/i, label: 'Sample size / power analysis', pass: /sample\s*size|power\s*analy/i.test(d), note: 'Ensures study is adequately powered to detect effects.' },
    { test: /ethic|irb|consent/i, label: 'Ethics / IRB approval', pass: /ethic|irb|consent/i.test(d), note: 'Required for research involving human subjects.' },
    { test: /valid(?:ity|at)|reliab/i, label: 'Validity & reliability', pass: /valid(?:ity|at)|reliab/i.test(d), note: 'Measures what it intends to; consistent across conditions.' },
    { test: /confound|covariat/i, label: 'Confounding control', pass: /confound|covariat/i.test(d), note: 'Addresses variables that could explain results other than the treatment.' },
    { test: /replicate|reproducib/i, label: 'Reproducibility', pass: /replicate|reproducib/i.test(d), note: 'Results can be replicated by others.' },
  ];
  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  const lines = checks.map(c => `${c.pass ? '✅' : '⚠️'} ${c.label}: ${c.note}`);
  return `🔬 METHODOLOGY EVALUATION\n\nScore: ${score}/100 (${passed}/${checks.length} criteria met)\n\n${lines.join('\n')}\n\n${score >= 75 ? '✅ Solid methodology.' : score >= 50 ? '⚠️ Some gaps — address missing criteria.' : '❌ Significant methodological issues. Consider a complete revision.'}`;
}

export function explainStatistics(concept: string): string {
  const c = concept.toLowerCase();
  const STATS_KB: Record<string, string> = {
    'p-value': `📊 P-VALUE\n━━━━━━━━\nThe p-value is the probability of obtaining results at least as extreme as those observed, assuming the null hypothesis is true.\n\n• p < 0.05 → statistically significant (traditional threshold)\n• p < 0.01 → highly significant\n• p > 0.05 → fail to reject null hypothesis\n\n⚠️ Common misconceptions:\n• Does NOT mean the null hypothesis is true/false\n• Does NOT measure effect size or practical importance\n• Does NOT equal the probability you're wrong\n\n✅ Always report effect size (Cohen's d, r, η²) alongside p-values.`,
    'confidence interval': `📊 CONFIDENCE INTERVAL (CI)\n━━━━━━━━━━━━━━━━━━━━━━━━━\nA 95% CI means: if we repeated the study 100 times, ~95 intervals would contain the true parameter.\n\nWidths:\n• Narrow CI → more precision (larger sample)\n• Wide CI → less precision (smaller sample)\n\nKey: Does the CI include zero/the null value?\n• If 95% CI for a difference excludes 0 → statistically significant\n• Report CI alongside p-value for full picture.`,
    'effect size': `📊 EFFECT SIZE\n━━━━━━━━━━━━\nMeasures practical magnitude of a finding (independent of sample size).\n\nCohen's d (means difference):\n• d = 0.2 → small\n• d = 0.5 → medium\n• d = 0.8 → large\n\nPearson r (correlation):\n• r = 0.1 → small\n• r = 0.3 → medium\n• r = 0.5 → large\n\nOdds Ratio (OR): 1.0 = no effect; >2.0 or <0.5 = clinically meaningful`,
    'regression': `📊 REGRESSION ANALYSIS\n━━━━━━━━━━━━━━━━━━━━\nPredicts a dependent variable from one or more independent variables.\n\nSimple linear regression: Y = β₀ + β₁X + ε\nMultiple regression: Y = β₀ + β₁X₁ + β₂X₂ + … + ε\n\nKey outputs:\n• R² — proportion of variance explained (0–1)\n• β coefficients — effect of each predictor\n• p-values — significance of each predictor\n• Residual plots — check model assumptions`,
    'anova': `📊 ANOVA (Analysis of Variance)\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nTests whether means of 3+ groups differ significantly.\n\nOne-way ANOVA: one independent variable\nTwo-way ANOVA: two independent variables (and interaction)\nRepeated measures ANOVA: same subjects across conditions\n\nF-statistic = variance between groups / variance within groups\nPost-hoc tests (Tukey, Bonferroni) identify which groups differ.`,
    'power': `📊 STATISTICAL POWER\n━━━━━━━━━━━━━━━━━━\nPower = probability of detecting a true effect when one exists (1 - β).\n\nConventional minimum: 80% (β = 0.20)\n\nPower is determined by:\n• Sample size (↑ N → ↑ power)\n• Effect size (larger effect → easier to detect)\n• Alpha level (lower α → less power)\n• Study design (within-subjects has more power than between)\n\nUsage: Run a power analysis BEFORE collecting data.`,
  };
  for (const [key, value] of Object.entries(STATS_KB)) {
    if (c.includes(key)) return value;
  }
  return `📊 Statistical concept: "${concept}"\n\nThis term wasn't found in the offline statistics knowledge base. Common statistics concepts covered:\n• p-value, confidence interval, effect size\n• regression, ANOVA, t-test\n• statistical power, sample size\n• correlation, causation, confounding\n\nFor detailed help, visit: statology.org or khanacademy.org/math/statistics`;
}

export function simulatePeerReview(abstract: string): string {
  const words = abstract.trim().split(/\s+/).length;
  const checks = [
    { label: 'Adequate length', pass: words >= 100 && words <= 300, note: `Abstract is ${words} words (ideal: 100–300).` },
    { label: 'States research question/objective', pass: /aim|objective|purpose|goal|investigat|we\s+study|we\s+examine/i.test(abstract), note: 'Abstract should state the aim clearly.' },
    { label: 'Describes methodology', pass: /method|design|approach|sample|participant|survey|experiment|model|analyz/i.test(abstract), note: 'Methods should be summarized.' },
    { label: 'Reports results', pass: /result|find|found|show|reveal|demonstrate|significant|p\s*[<=>]/i.test(abstract), note: 'Key findings should be stated.' },
    { label: 'Includes conclusion/implication', pass: /conclusion|suggest|imply|implication|future|recommend|policy/i.test(abstract), note: 'Conclusions or implications are expected.' },
    { label: 'Avoids jargon overload', pass: !/(wherein|hereinafter|aforementioned|hitherto)/i.test(abstract), note: 'Use clear, accessible language.' },
    { label: 'Quantifies results', pass: /\d+%|\d+\.\d+|p\s*=|\d+\s*(fold|times|points)/i.test(abstract), note: 'Quantitative results strengthen credibility.' },
  ];
  const passed = checks.filter(c => c.pass).length;
  const score = Math.round((passed / checks.length) * 100);
  return `🔍 PEER REVIEW SIMULATION\n\nAbstract Quality Score: ${score}/100\n\n` +
    checks.map(c => `${c.pass ? '✅' : '⚠️'} ${c.label}: ${c.note}`).join('\n') +
    `\n\n${score >= 80 ? '✅ Strong abstract.' : score >= 60 ? '⚠️ Revise flagged sections before submission.' : '❌ Abstract needs significant revision.'}`;
}

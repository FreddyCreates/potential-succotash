/**
 * Data Connectors Skill — Vigil AI
 * ─────────────────────────────────────────────────────────────────
 * Connects to free, open, public data APIs with offline fallbacks.
 *
 * Connectors:
 *  1.  Wikipedia article fetch & summary
 *  2.  Wikidata entity lookup
 *  3.  World Bank open data (GDP, population, indicators)
 *  4.  Open-Meteo weather (current + forecast — no key required)
 *  5.  USGS earthquake feed
 *  6.  NASA APOD (Astronomy Picture of the Day)
 *  7.  OpenFDA drug information
 *  8.  SEC EDGAR company filings
 *  9.  UN Comtrade trade data (public endpoint)
 * 10.  REST Countries (country info)
 * 11.  Open Library book lookup
 * 12.  GitHub repository stats
 * 13.  Currency exchange rates (open.er-api.com free tier)
 * 14.  IP geolocation (ipapi.co free tier)
 * 15.  Dictionary / word lookup (dictionaryapi.dev)
 */

function safeFetch(url: string, ms = 7000): Promise<Response | null> {
  return Promise.race([
    fetch(url),
    new Promise<null>(res => setTimeout(() => res(null), ms)),
  ]);
}

/* ─────────────────────────────────────────────────────────────────
 *  WIKIPEDIA
 * ──────────────────────────────────────────────────────────────── */
export async function fetchWikipedia(query: string): Promise<string> {
  const url = `https://en.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(query.replace(/\s+/g, '_'))}`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) {
    // Try search endpoint
    const searchUrl = `https://en.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(query)}&format=json&origin=*&srlimit=3`;
    const sr = await safeFetch(searchUrl);
    if (!sr || !sr.ok) return `⚠️ Wikipedia is unavailable offline. Try connecting to the internet.`;
    const sj = await sr.json() as { query?: { search?: Array<{ title?: string; snippet?: string }> } };
    const hits = sj.query?.search ?? [];
    if (hits.length === 0) return `⚠️ No Wikipedia article found for "${query}".`;
    return `🔍 Wikipedia search results for "${query}":\n\n` +
      hits.map((h, i) => `${i + 1}. ${h.title}\n   ${(h.snippet ?? '').replace(/<[^>]+>/g, '')}`).join('\n\n') +
      `\n\nVisit: https://en.wikipedia.org/wiki/${encodeURIComponent((hits[0]?.title ?? '').replace(/\s+/g, '_'))}`;
  }
  const j = await resp.json() as { title?: string; extract?: string; content_urls?: { desktop?: { page?: string } } };
  return `📖 ${j.title}\n\n${j.extract}\n\n🔗 ${j.content_urls?.desktop?.page ?? ''}`;
}

/* ─────────────────────────────────────────────────────────────────
 *  WIKIDATA ENTITY LOOKUP
 * ──────────────────────────────────────────────────────────────── */
export async function lookupWikidata(query: string): Promise<string> {
  const url = `https://www.wikidata.org/w/api.php?action=wbsearchentities&search=${encodeURIComponent(query)}&language=en&format=json&origin=*&limit=5`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ Wikidata unavailable. Visit: wikidata.org`;
  const j = await resp.json() as { search?: Array<{ id?: string; label?: string; description?: string; url?: string }> };
  const results = j.search ?? [];
  if (results.length === 0) return `⚠️ No Wikidata entities found for "${query}".`;
  return `🌐 Wikidata Entities for "${query}":\n\n` +
    results.map((r, i) => `${i + 1}. [${r.id}] ${r.label}\n   ${r.description ?? 'No description'}\n   ${r.url ?? ''}`).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  WORLD BANK OPEN DATA
 * ──────────────────────────────────────────────────────────────── */
const WB_INDICATORS: Record<string, string> = {
  gdp: 'NY.GDP.MKTP.CD', gdp_per_capita: 'NY.GDP.PCAP.CD', population: 'SP.POP.TOTL',
  life_expectancy: 'SP.DYN.LE00.IN', literacy: 'SE.ADT.LITR.ZS', poverty: 'SI.POV.DDAY',
  unemployment: 'SL.UEM.TOTL.ZS', co2: 'EN.ATM.CO2E.PC', internet: 'IT.NET.USER.ZS',
  gini: 'SI.POV.GINI', inflation: 'FP.CPI.TOTL.ZG', trade: 'NE.TRD.GNFS.ZS',
};

export async function fetchWorldBank(countryCode: string, indicator = 'gdp'): Promise<string> {
  const ind = WB_INDICATORS[indicator.toLowerCase().replace(/\s+/g, '_')] ?? indicator;
  const url = `https://api.worldbank.org/v2/country/${countryCode}/indicator/${ind}?format=json&mrv=5&per_page=5`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ World Bank data unavailable. Visit: data.worldbank.org`;
  const j = await resp.json() as [unknown, Array<{ country?: { value?: string }; date?: string; value?: number | null }>];
  const data = Array.isArray(j) && j[1] ? j[1] : [];
  if (data.length === 0) return `⚠️ No World Bank data for country "${countryCode}" indicator "${indicator}".`;
  const country = data[0]?.country?.value ?? countryCode;
  const indLabel = Object.entries(WB_INDICATORS).find(([, v]) => v === ind)?.[0] ?? indicator;
  return `🏦 World Bank — ${country} — ${indLabel.replace(/_/g, ' ').toUpperCase()}\n\n` +
    data.filter(d => d.value !== null).map(d => `${d.date}: ${d.value?.toLocaleString() ?? 'N/A'}`).join('\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  WEATHER — Open-Meteo (no API key required)
 * ──────────────────────────────────────────────────────────────── */
export async function fetchWeather(lat: number, lon: number): Promise<string> {
  const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&daily=temperature_2m_max,temperature_2m_min,precipitation_sum&timezone=auto&forecast_days=3`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ Weather data unavailable. Visit: open-meteo.com`;
  const j = await resp.json() as {
    current?: { temperature_2m?: number; relative_humidity_2m?: number; wind_speed_10m?: number; weather_code?: number };
    current_units?: { temperature_2m?: string; wind_speed_10m?: string };
    daily?: { time?: string[]; temperature_2m_max?: number[]; temperature_2m_min?: number[]; precipitation_sum?: number[] };
    timezone?: string;
  };
  const c = j.current ?? {};
  const cu = j.current_units ?? {};
  const d = j.daily ?? {};
  const forecastLines = (d.time ?? []).map((t, i) => `  ${t}: High ${d.temperature_2m_max?.[i] ?? '?'}${cu.temperature_2m ?? '°C'} / Low ${d.temperature_2m_min?.[i] ?? '?'}${cu.temperature_2m ?? '°C'} | Precip ${d.precipitation_sum?.[i] ?? 0}mm`);
  return `🌤️ WEATHER — ${j.timezone ?? `${lat},${lon}`}\n\n` +
    `Current: ${c.temperature_2m ?? '?'}${cu.temperature_2m ?? '°C'} | Humidity: ${c.relative_humidity_2m ?? '?'}% | Wind: ${c.wind_speed_10m ?? '?'}${cu.wind_speed_10m ?? 'km/h'}\n\n` +
    `3-Day Forecast:\n${forecastLines.join('\n')}`;
}

/* ─────────────────────────────────────────────────────────────────
 *  USGS EARTHQUAKE FEED
 * ──────────────────────────────────────────────────────────────── */
export async function fetchEarthquakes(period: 'hour' | 'day' | 'week' = 'day', minMag = 4.5): Promise<string> {
  const url = `https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/${minMag}_${period}.geojson`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ USGS earthquake data unavailable. Visit: earthquake.usgs.gov`;
  const j = await resp.json() as { features?: Array<{ properties?: { place?: string; mag?: number; time?: number; url?: string } }> };
  const quakes = (j.features ?? []).slice(0, 8);
  if (quakes.length === 0) return `✅ No significant earthquakes (M${minMag}+) in the past ${period}.`;
  return `🌍 USGS Earthquakes (M${minMag}+ / past ${period}) — ${quakes.length} event(s):\n\n` +
    quakes.map((q, i) => {
      const p = q.properties ?? {};
      const t = p.time ? new Date(p.time).toUTCString() : 'Unknown';
      return `${i + 1}. M${p.mag?.toFixed(1)} — ${p.place ?? 'Unknown'}\n   ${t}`;
    }).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  NASA APOD
 * ──────────────────────────────────────────────────────────────── */
export async function fetchNasaApod(): Promise<string> {
  const url = `https://api.nasa.gov/planetary/apod?api_key=DEMO_KEY`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ NASA APOD unavailable. Visit: apod.nasa.gov`;
  const j = await resp.json() as { title?: string; date?: string; explanation?: string; url?: string; media_type?: string };
  return `🔭 NASA — Astronomy Picture of the Day (${j.date})\n\n📸 ${j.title}\n\n${j.explanation?.slice(0, 500)}…\n\n🔗 ${j.url}`;
}

/* ─────────────────────────────────────────────────────────────────
 *  OPENFDA DRUG INFORMATION
 * ──────────────────────────────────────────────────────────────── */
export async function fetchDrugInfo(drug: string): Promise<string> {
  const url = `https://api.fda.gov/drug/label.json?search=openfda.brand_name:"${encodeURIComponent(drug)}"&limit=1`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) {
    const url2 = `https://api.fda.gov/drug/label.json?search=openfda.generic_name:"${encodeURIComponent(drug)}"&limit=1`;
    const resp2 = await safeFetch(url2);
    if (!resp2 || !resp2.ok) return `⚠️ Drug info unavailable for "${drug}". Visit: dailymed.nlm.nih.gov\n\n⚠️ Not medical advice — always consult a licensed healthcare provider.`;
    const j2 = await resp2.json() as { results?: Array<{ purpose?: string[]; warnings?: string[]; dosage_and_administration?: string[]; active_ingredient?: string[] }> };
    return formatDrugResult(drug, j2.results?.[0]);
  }
  const j = await resp.json() as { results?: Array<{ purpose?: string[]; warnings?: string[]; dosage_and_administration?: string[]; active_ingredient?: string[] }> };
  return formatDrugResult(drug, j.results?.[0]);
}

function formatDrugResult(drug: string, r: { purpose?: string[]; warnings?: string[]; dosage_and_administration?: string[]; active_ingredient?: string[] } | undefined): string {
  if (!r) return `⚠️ No FDA label found for "${drug}". Visit: dailymed.nlm.nih.gov\n\n⚠️ Not medical advice.`;
  const trim = (arr?: string[]) => arr?.[0]?.replace(/\s+/g, ' ').trim().slice(0, 300) ?? 'N/A';
  return `💊 FDA Drug Information — ${drug.toUpperCase()}\n\n` +
    `🎯 Purpose: ${trim(r.purpose)}\n\n` +
    `🧪 Active Ingredient(s): ${trim(r.active_ingredient)}\n\n` +
    `📋 Dosage: ${trim(r.dosage_and_administration)}\n\n` +
    `⚠️ Warnings: ${trim(r.warnings)}\n\n` +
    `⚕️ Source: FDA OpenFDA — openFDA.gov\n` +
    `⚠️ NOT medical advice. Always consult a licensed healthcare provider before use.`;
}

/* ─────────────────────────────────────────────────────────────────
 *  REST COUNTRIES
 * ──────────────────────────────────────────────────────────────── */
export async function fetchCountryInfo(name: string): Promise<string> {
  const url = `https://restcountries.com/v3.1/name/${encodeURIComponent(name)}?fields=name,capital,population,area,languages,currencies,region,subregion,flag,borders,timezones`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ Country info unavailable for "${name}". Visit: restcountries.com`;
  const j = await resp.json() as Array<{
    name?: { common?: string; official?: string };
    capital?: string[];
    population?: number;
    area?: number;
    languages?: Record<string, string>;
    currencies?: Record<string, { name?: string; symbol?: string }>;
    region?: string;
    subregion?: string;
    flag?: string;
    borders?: string[];
    timezones?: string[];
  }>;
  const c = j[0];
  if (!c) return `⚠️ No country data found for "${name}".`;
  const langs = Object.values(c.languages ?? {}).join(', ');
  const currs = Object.values(c.currencies ?? {}).map(cu => `${cu.name} (${cu.symbol})`).join(', ');
  const borders = (c.borders ?? []).slice(0, 8).join(', ');
  return `🌍 ${c.flag ?? ''} ${c.name?.common} (${c.name?.official})\n\n` +
    `🏛️ Capital: ${(c.capital ?? []).join(', ')}\n` +
    `🌐 Region: ${c.region} › ${c.subregion}\n` +
    `👥 Population: ${c.population?.toLocaleString()}\n` +
    `📐 Area: ${c.area?.toLocaleString()} km²\n` +
    `🗣️ Languages: ${langs}\n` +
    `💰 Currencies: ${currs}\n` +
    `🕐 Timezones: ${(c.timezones ?? []).slice(0, 3).join(', ')}\n` +
    `🗺️ Borders: ${borders || 'None (island nation)'}`;
}

/* ─────────────────────────────────────────────────────────────────
 *  OPEN LIBRARY BOOK SEARCH
 * ──────────────────────────────────────────────────────────────── */
export async function searchBooks(query: string, limit = 5): Promise<string> {
  const url = `https://openlibrary.org/search.json?q=${encodeURIComponent(query)}&limit=${limit}&fields=title,author_name,first_publish_year,isbn,subject,number_of_pages_median`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ Open Library unavailable. Visit: openlibrary.org`;
  const j = await resp.json() as { docs?: Array<{ title?: string; author_name?: string[]; first_publish_year?: number; isbn?: string[]; subject?: string[]; number_of_pages_median?: number }> };
  const books = j.docs ?? [];
  if (books.length === 0) return `📚 No books found for "${query}".`;
  return `📚 Open Library — "${query}":\n\n` +
    books.map((b, i) =>
      `${i + 1}. ${b.title ?? 'Unknown'}\n   Author(s): ${(b.author_name ?? []).slice(0, 3).join(', ')}\n   Year: ${b.first_publish_year ?? 'N/A'} | Pages: ${b.number_of_pages_median ?? 'N/A'}\n   Subjects: ${(b.subject ?? []).slice(0, 3).join(', ')}\n   🔗 https://openlibrary.org/search?q=${encodeURIComponent(b.title ?? '')}`
    ).join('\n\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  CURRENCY EXCHANGE (Open Exchange Rates — free public endpoint)
 * ──────────────────────────────────────────────────────────────── */
export async function fetchExchangeRates(base = 'USD'): Promise<string> {
  const url = `https://open.er-api.com/v6/latest/${base}`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ Exchange rates unavailable. Visit: exchangerate-api.com`;
  const j = await resp.json() as { base_code?: string; time_last_update_utc?: string; rates?: Record<string, number> };
  const rates = j.rates ?? {};
  const major = ['EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'CHF', 'CNY', 'INR', 'BRL', 'MXN', 'KRW', 'SGD', 'HKD', 'SEK', 'NOK'];
  const lines = major.filter(c => rates[c]).map(c => `  ${c}: ${rates[c]?.toFixed(4)}`);
  return `💱 Exchange Rates — 1 ${j.base_code ?? base}\nUpdated: ${j.time_last_update_utc ?? 'Unknown'}\n\n${lines.join('\n')}`;
}

/* ─────────────────────────────────────────────────────────────────
 *  DICTIONARY LOOKUP (dictionaryapi.dev — free, no key)
 * ──────────────────────────────────────────────────────────────── */
export async function lookupWord(word: string): Promise<string> {
  const url = `https://api.dictionaryapi.dev/api/v2/entries/en/${encodeURIComponent(word.trim())}`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ Dictionary unavailable offline. Visit: merriam-webster.com`;
  const j = await resp.json() as Array<{
    word?: string;
    phonetic?: string;
    meanings?: Array<{ partOfSpeech?: string; definitions?: Array<{ definition?: string; example?: string; synonyms?: string[] }> }>;
    etymology?: string;
  }>;
  if (!Array.isArray(j) || j.length === 0) return `⚠️ No dictionary entry for "${word}".`;
  const entry = j[0];
  const lines: string[] = [`📖 ${entry.word}  ${entry.phonetic ? `[${entry.phonetic}]` : ''}\n`];
  for (const m of (entry.meanings ?? []).slice(0, 3)) {
    lines.push(`${m.partOfSpeech?.toUpperCase()}`);
    for (const def of (m.definitions ?? []).slice(0, 2)) {
      lines.push(`  • ${def.definition}`);
      if (def.example) lines.push(`    "${def.example}"`);
      if ((def.synonyms ?? []).length > 0) lines.push(`    Synonyms: ${def.synonyms!.slice(0, 4).join(', ')}`);
    }
    lines.push('');
  }
  return lines.join('\n');
}

/* ─────────────────────────────────────────────────────────────────
 *  SEC EDGAR COMPANY SEARCH
 * ──────────────────────────────────────────────────────────────── */
export async function searchEdgar(companyName: string): Promise<string> {
  const url = `https://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(companyName)}%22&dateRange=custom&startdt=2020-01-01&forms=10-K,10-Q,8-K&hits.hits._source.period_of_report=true`;
  const searchUrl = `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&CIK=&type=10-K&dateb=&owner=include&count=5&search_text=&action=getcompany&output=atom`;
  const resp = await safeFetch(searchUrl);
  if (!resp || !resp.ok) return `⚠️ SEC EDGAR unavailable. Visit: sec.gov/edgar\n\nSearch filings at: efts.sec.gov/LATEST/search-index?q="${encodeURIComponent(companyName)}"`;
  return `📊 SEC EDGAR search for "${companyName}" initiated.\n\nFor detailed filings, visit:\nhttps://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(companyName)}&action=getcompany\n\nOr use the full-text search:\nhttps://efts.sec.gov/LATEST/search-index?q=%22${encodeURIComponent(companyName)}%22`;
}

/* ─────────────────────────────────────────────────────────────────
 *  GITHUB REPOSITORY STATS
 * ──────────────────────────────────────────────────────────────── */
export async function fetchGithubStats(owner: string, repo: string): Promise<string> {
  const url = `https://api.github.com/repos/${encodeURIComponent(owner)}/${encodeURIComponent(repo)}`;
  const resp = await safeFetch(url);
  if (!resp || !resp.ok) return `⚠️ GitHub API unavailable for "${owner}/${repo}". Visit: github.com/${owner}/${repo}`;
  const j = await resp.json() as { full_name?: string; description?: string; stargazers_count?: number; forks_count?: number; open_issues_count?: number; language?: string; license?: { name?: string }; created_at?: string; updated_at?: string; topics?: string[]; html_url?: string };
  return `🐙 GitHub — ${j.full_name}\n\n` +
    `📝 ${j.description ?? 'No description'}\n\n` +
    `⭐ Stars: ${j.stargazers_count?.toLocaleString()} | 🍴 Forks: ${j.forks_count?.toLocaleString()} | 🐛 Issues: ${j.open_issues_count?.toLocaleString()}\n` +
    `🗣️ Language: ${j.language ?? 'N/A'} | 📄 License: ${j.license?.name ?? 'None'}\n` +
    `📅 Created: ${j.created_at?.slice(0, 10)} | Updated: ${j.updated_at?.slice(0, 10)}\n` +
    `🏷️ Topics: ${(j.topics ?? []).slice(0, 8).join(', ') || 'None'}\n` +
    `🔗 ${j.html_url}`;
}

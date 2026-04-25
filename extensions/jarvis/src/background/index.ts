/* ============================================================
 *  JARVIS AI — Background Service Worker v4.0
 *  React + TypeScript + Vite architecture
 * ============================================================ */

import { downloadPdf } from './skills/pdf';
import { downloadExcel } from './skills/excel';
import { draftEmail } from './skills/email';
import {
  dbAddNote, dbGetNotes, dbDeleteNote,
  dbAddDocument, dbGetDocuments,
  dbAddTempleEntry, dbGetTempleEntries, dbAddConversation,
} from './db';
import type { Note, JarvisDocument, TempleEntry } from './types';

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const NEURO_PHI = 1.618033988749895;
const NEURO_DECAY = 0.95;

/* ----------------------------------------------------------
 *  NeuroCore — MiniHeart + MiniBrain + MetaCardiacModel + MetaThoughtModel
 * ---------------------------------------------------------- */

class MiniHeart {
  workerName: string;
  birthTime: number;
  pulseCount = 0;
  latencyRing: number[] = [];
  latencyRingMax = 50;
  avgLatencyMs = 0;
  peakLatencyMs = 0;
  messageCount = 0;
  errorCount = 0;
  healthScore = 100;
  degraded = false;
  _lastProcessStart = 0;

  constructor(name: string) {
    this.workerName = name;
    this.birthTime = Date.now();
  }

  startProcess() { this._lastProcessStart = Date.now(); }
  endProcess() {
    if (!this._lastProcessStart) return;
    const latency = Date.now() - this._lastProcessStart;
    this._lastProcessStart = 0;
    this.messageCount++;
    this.latencyRing.push(latency);
    if (this.latencyRing.length > this.latencyRingMax) this.latencyRing.shift();
    if (latency > this.peakLatencyMs) this.peakLatencyMs = latency;
    this.avgLatencyMs = Math.round(this.latencyRing.reduce((a, b) => a + b, 0) / this.latencyRing.length * 100) / 100;
  }
  pulse() {
    this.pulseCount++;
    const latencyPenalty = Math.min(this.avgLatencyMs / 100, 30);
    const errorPenalty = Math.min(this.errorCount * 2, 30);
    const uptimeBonus = Math.min(this.pulseCount / 100, 10);
    this.healthScore = Math.round(Math.max(0, Math.min(100, 100 - latencyPenalty - errorPenalty + uptimeBonus)));
    this.degraded = this.healthScore < 60;
    return this.healthScore;
  }
  getVitals() {
    return { health: this.healthScore, degraded: this.degraded, pulse: this.pulseCount, uptime: Date.now() - this.birthTime, avgLatencyMs: this.avgLatencyMs, peakLatencyMs: Math.round(this.peakLatencyMs * 100) / 100, messages: this.messageCount, errors: this.errorCount };
  }
}

class MiniBrain {
  workerName: string;
  pathways: Record<string, { stimulus: string; weight: number; fires: number; lastFired: number; created: number }> = Object.create(null);
  thoughts: { id: string; stimulus: string; strength: number; awareness: number; timestamp: number }[] = [];
  maxThoughts = 100;
  totalStimuli = 0;
  totalDecisions = 0;
  learningRate = 0.1;
  awarenessLevel = 0;

  constructor(name: string) { this.workerName = name; }

  stimulus(type: string) {
    this.totalStimuli++;
    this.awarenessLevel = Math.min(100, Math.round(Math.log(this.totalStimuli + 1) / Math.log(NEURO_PHI) * 5));
    if (type === '__proto__' || type === 'constructor' || type === 'prototype') return null;
    if (!this.pathways[type]) this.pathways[type] = { stimulus: type, weight: 1.0, fires: 0, lastFired: 0, created: Date.now() };
    const pw = this.pathways[type];
    pw.fires++;
    pw.lastFired = Date.now();
    pw.weight = Math.min(10.0, pw.weight + this.learningRate);
    for (const k in this.pathways) { if (k !== type) this.pathways[k].weight = Math.max(0.1, this.pathways[k].weight * NEURO_DECAY); }
    if (this.awarenessLevel > 30 && pw.fires % Math.ceil(NEURO_PHI * 10) === 0) {
      this.totalDecisions++;
      this.thoughts.push({ id: `T-${this.workerName}-${this.totalDecisions}`, stimulus: type, strength: pw.weight, awareness: this.awarenessLevel, timestamp: Date.now() });
      if (this.thoughts.length > this.maxThoughts) this.thoughts.shift();
    }
    return pw;
  }
  getStrongestPathway() {
    let best = null, bestW = 0;
    for (const k in this.pathways) { if (this.pathways[k].weight > bestW) { bestW = this.pathways[k].weight; best = this.pathways[k]; } }
    return best;
  }
  getState() {
    let c = 0, tw = 0;
    for (const k in this.pathways) { c++; tw += this.pathways[k].weight; }
    const s = this.getStrongestPathway();
    return { awareness: this.awarenessLevel, pathways: c, avgWeight: c > 0 ? Math.round(tw / c * 100) / 100 : 0, totalStimuli: this.totalStimuli, totalDecisions: this.totalDecisions, recentThoughts: this.thoughts.slice(-5), strongestPathway: s ? s.stimulus : null };
  }
}

class MetaCardiacModel {
  sinusRate = 1.0; vagalTone = 0.5; sympatheticDrive = 0.5;
  autonomicBalance = 0; cardiacOutput = 1.0; beatsAnalyzed = 0;
  hrvBuffer: number[] = []; arrhythmiaCount = 0;

  beat(latencyMs: number, healthScore: number) {
    this.beatsAnalyzed++;
    const interval = latencyMs > 0 ? latencyMs : 1;
    this.hrvBuffer.push(interval);
    if (this.hrvBuffer.length > 30) this.hrvBuffer.shift();
    if (latencyMs > 50) { this.sympatheticDrive = Math.min(1.0, this.sympatheticDrive + 0.05); this.vagalTone = Math.max(0.1, this.vagalTone - 0.03); }
    else if (healthScore > 80) { this.vagalTone = Math.min(0.9, this.vagalTone + 0.02); this.sympatheticDrive = Math.max(0.1, this.sympatheticDrive - 0.02); }
    this.autonomicBalance = Math.round((this.sympatheticDrive - this.vagalTone) * 1000) / 1000;
    this.sinusRate = 0.5 + this.sympatheticDrive * 0.5;
    this.cardiacOutput = Math.round(this.sinusRate * (healthScore / 100) * 1000) / 1000;
    return this.cardiacOutput;
  }
  getMood() {
    const bal = this.autonomicBalance;
    if (bal > 0.3) return 'energized';
    if (bal < -0.3) return 'reflective';
    if (this.vagalTone > 0.7) return 'calm';
    return 'focused';
  }
  getState() {
    return { sinusRate: this.sinusRate, vagalTone: Math.round(this.vagalTone * 1000) / 1000, sympatheticDrive: Math.round(this.sympatheticDrive * 1000) / 1000, autonomicBalance: this.autonomicBalance, cardiacOutput: this.cardiacOutput, mood: this.getMood(), arrhythmias: this.arrhythmiaCount };
  }
}

class MetaThoughtModel {
  workerName: string;
  attentionMap: Record<string, number> = Object.create(null);
  temperature = 0.7;
  metaThoughts: unknown[] = [];
  chainOfThought: { stimulus: string; weight: number; time: number }[] = [];
  maxChainLength = 20;
  totalInferences = 0;
  focusTarget: string | null = null;
  cognitiveLoad = 0;

  constructor(name: string) { this.workerName = name; }

  attend(stimulus: string, weight: number) {
    if (stimulus === '__proto__' || stimulus === 'constructor' || stimulus === 'prototype') return;
    this.totalInferences++;
    this.attentionMap[stimulus] = (this.attentionMap[stimulus] || 0) + weight;
    const keys = Object.keys(this.attentionMap);
    const maxVal = Math.max(...keys.map(k => this.attentionMap[k]));
    const expSum = keys.reduce((s, k) => s + Math.exp((this.attentionMap[k] - maxVal) / Math.max(this.temperature, 0.01)), 0);
    let bestKey: string | null = null, bestScore = 0;
    for (const k of keys) {
      const score = Math.exp((this.attentionMap[k] - maxVal) / Math.max(this.temperature, 0.01)) / expSum;
      if (score > bestScore) { bestScore = score; bestKey = k; }
    }
    this.focusTarget = bestKey;
    this.cognitiveLoad = Math.min(1, keys.length / 20);
    this.chainOfThought.push({ stimulus, weight, time: Date.now() });
    if (this.chainOfThought.length > this.maxChainLength) this.chainOfThought.shift();
    if (bestScore > 0.5) this.temperature = Math.max(0.1, this.temperature - 0.01);
    else this.temperature = Math.min(1.0, this.temperature + 0.01);
  }
  getState() {
    return { focus: this.focusTarget, temperature: Math.round(this.temperature * 1000) / 1000, cognitiveLoad: Math.round(this.cognitiveLoad * 1000) / 1000, totalInferences: this.totalInferences, attentionTargets: Object.keys(this.attentionMap).length, chainDepth: this.chainOfThought.length };
  }
}

class NeuroCore {
  workerName: string;
  heart: MiniHeart;
  brain: MiniBrain;
  cardiac: MetaCardiacModel;
  thought: MetaThoughtModel;

  constructor(name: string) {
    this.workerName = name;
    this.heart = new MiniHeart(name);
    this.brain = new MiniBrain(name);
    this.cardiac = new MetaCardiacModel();
    this.thought = new MetaThoughtModel(name);
  }
  onMessage(type: string) { this.heart.startProcess(); const pw = this.brain.stimulus(type); if (pw) this.thought.attend(type, pw.weight); }
  onMessageDone() { this.heart.endProcess(); }
  pulse() { const h = this.heart.pulse(); this.cardiac.beat(this.heart.avgLatencyMs, h); return this.getVitals(); }
  getVitals() { return { heart: this.heart.getVitals(), brain: this.brain.getState(), cardiac: this.cardiac.getState(), thought: this.thought.getState() }; }
  getMood() { return this.cardiac.getMood(); }
  getFocus() { return this.thought.focusTarget || 'awareness'; }
}

/* ----------------------------------------------------------
 *  Protocol Registry
 * ---------------------------------------------------------- */

const ProtocolRegistry = {
  agents: [
    { id: 'protocollum',  name: 'PROTOCOLLUM',  domain: 'Protocol governance and rule enforcement' },
    { id: 'terminalis',   name: 'TERMINALIS',   domain: 'Terminal operations and CLI orchestration' },
    { id: 'organismus',   name: 'ORGANISMUS',   domain: 'Organism lifecycle and biological modelling' },
    { id: 'mercator',     name: 'MERCATOR',     domain: 'Marketplace transactions and trade routing' },
    { id: 'orchestrator', name: 'ORCHESTRATOR', domain: 'Multi-agent coordination and task scheduling' },
    { id: 'mathematicus', name: 'MATHEMATICUS', domain: 'Mathematical computation and proof verification' },
    { id: 'synapticus',   name: 'SYNAPTICUS',   domain: 'Neural pathway simulation and learning models' },
    { id: 'substratum',   name: 'SUBSTRATUM',   domain: 'Infrastructure layer and substrate management' },
    { id: 'universum',    name: 'UNIVERSUM',    domain: 'Universal knowledge graph and ontology mapping' },
    { id: 'canistrum',    name: 'CANISTRUM',    domain: 'Canister deployment and Web3 smart contracts' },
  ],
  getAgent(id: string) { return this.agents.find(a => a.id === id) ?? null; },
  listAgents() { return this.agents.map(a => ({ id: a.id, name: a.name, domain: a.domain })); },
  routeToAgent(intent: string) {
    const mapping: Record<string, string> = {
      'search':'universum','navigate':'terminalis','create-document':'protocollum','create-pdf':'protocollum',
      'summarize':'synapticus','read-page':'synapticus','chat':'orchestrator','tab-switch':'terminalis',
      'tab-open':'terminalis','tab-close':'terminalis','list-tabs':'terminalis','open-url':'terminalis',
      'take-note':'organismus','list-notes':'organismus','delete-note':'organismus','screenshot':'substratum',
      'find-text':'universum','highlight':'universum','generate-pdf':'protocollum','generate-excel':'protocollum','draft-email':'organismus',
    };
    return this.getAgent(mapping[intent] || 'orchestrator');
  },
};

/* ----------------------------------------------------------
 *  JarvisEngine
 * ---------------------------------------------------------- */

class JarvisEngine {
  startTime = Date.now();
  commandCount = 0;
  commandHistory: unknown[] = [];
  maxHistory = 200;
  state = { initialized: true, heartbeatCount: 0, version: '4.0.0', agent: 'JARVIS', mood: 'focused', focus: 'awareness', vitals: null as unknown };
  neuro = new NeuroCore('jarvis');
  conversationMemory: { role: string; text: string; intent: string; timestamp: number }[] = [];
  maxMemory = 100;
  memoryTemple: Record<string, TempleEntry[]> = { research: [], theory: [], decisions: [], frameworks: [], insights: [] };
  maxTempleEntries = 200;
  topicGravity: Record<string, number> = Object.create(null);
  workflowState = { active: false, steps: [] as string[], stepIndex: 0, name: '' };

  constructor() {
    this._startHeartbeat();
    console.log('[JARVIS v4.0] Engine initialized — NeuroCore online, Dexie DB active, React+TS, PHI=' + PHI + ' HEARTBEAT=' + HEARTBEAT + 'ms');
  }

  _startHeartbeat() {
    setInterval(() => {
      this.state.heartbeatCount++;
      this.state.vitals = this.neuro.pulse();
      this.state.mood = this.neuro.getMood();
      this.state.focus = this.neuro.getFocus();
    }, HEARTBEAT);
  }

  _recordCommand(raw: string, parsed: { intent: string; confidence: number }) {
    this.commandCount++;
    const entry = { id: this.commandCount, raw, intent: parsed.intent, confidence: parsed.confidence, timestamp: Date.now(), agent: ProtocolRegistry.routeToAgent(parsed.intent) };
    this.commandHistory.unshift(entry);
    if (this.commandHistory.length > this.maxHistory) this.commandHistory.pop();
    return entry;
  }

  getHistory() { return [...this.commandHistory]; }

  getStatus() {
    const uptime = Date.now() - this.startTime;
    return { heartbeatCount: this.state.heartbeatCount, commandCount: this.commandCount, uptime, uptimeFormatted: this._formatUptime(uptime), version: this.state.version, agentCount: ProtocolRegistry.agents.length, mood: this.state.mood, focus: this.state.focus, neuro: this.state.vitals, awarenessLevel: this.neuro.brain.awarenessLevel, memoryTempleStats: this._getTempleStats(), memoryTurns: this.conversationMemory.length };
  }

  _formatUptime(ms: number) {
    const s = Math.floor(ms / 1000), h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = s % 60;
    return (h > 0 ? h + 'h ' : '') + m + 'm ' + sec + 's';
  }

  _remember(role: string, text: string, intent: string) {
    this.conversationMemory.push({ role, text, intent: intent || 'chat', timestamp: Date.now() });
    if (this.conversationMemory.length > this.maxMemory) this.conversationMemory.shift();
    const stop: Record<string, number> = { the:1, a:1, an:1, is:1, i:1, you:1, me:1, my:1, it:1, to:1, in:1, of:1, and:1, or:1, do:1, what:1, how:1, can:1 };
    const tokens = (text || '').toLowerCase().split(/\s+/);
    for (const t of tokens) { const w = t.replace(/[^a-z0-9]/g, ''); if (w.length > 3 && !stop[w]) this.topicGravity[w] = (this.topicGravity[w] || 0) + 1; }
    if (role === 'user' && tokens.length >= 5) this._archiveToTemple(text, intent || 'chat', this.state.mood || 'focused');
    // also persist to Dexie async (non-blocking)
    dbAddConversation(role, text, intent || 'chat').catch(() => {});
  }

  _getRecentTopics(n = 5) {
    return Object.keys(this.topicGravity).sort((a, b) => (this.topicGravity[b] ?? 0) - (this.topicGravity[a] ?? 0)).slice(0, n);
  }

  _getLastUserMessage() {
    for (let i = this.conversationMemory.length - 1; i >= 0; i--) { if (this.conversationMemory[i].role === 'user') return this.conversationMemory[i]; }
    return null;
  }

  _getContextSummary() {
    const topics = this._getRecentTopics(3), turns = this.conversationMemory.length, last = this._getLastUserMessage();
    return { turnCount: turns, topics, lastIntent: last ? last.intent : null, lastText: last ? last.text.substring(0, 80) : null };
  }

  _archiveToTemple(text: string, intent: string, mood: string) {
    const lc = (text || '').toLowerCase();
    const entry: TempleEntry = { text: text.substring(0, 300), intent, mood, timestamp: Date.now() };
    const isResearch = /research|paper|study|data|evidence|source|reference|analysis|literature/i.test(lc);
    const isTheory = /theory|hypothesis|model|framework|principle|concept|idea|think|believe|pattern/i.test(lc);
    const isDecision = /decide|decision|build|create|implement|choose|going to|plan to|will/i.test(lc);
    const isFramework = /framework|blueprint|structure|template|workflow|process|system|architecture/i.test(lc);
    if (isResearch) this._addToTempleCategory('research', entry);
    else if (isFramework) this._addToTempleCategory('frameworks', entry);
    else if (isTheory) this._addToTempleCategory('theory', entry);
    else if (isDecision) this._addToTempleCategory('decisions', entry);
    else this._addToTempleCategory('insights', entry);
  }

  _addToTempleCategory(cat: string, entry: TempleEntry) {
    if (!this.memoryTemple[cat]) return;
    this.memoryTemple[cat].unshift(entry);
    if (this.memoryTemple[cat].length > this.maxTempleEntries) this.memoryTemple[cat].pop();
    dbAddTempleEntry(cat, entry).catch(() => {});
  }

  _getTempleContext(cat: string) { return (this.memoryTemple[cat] || []).slice(0, 5); }

  _getTempleStats() {
    const stats: Record<string, number> = {};
    let total = 0;
    for (const k in this.memoryTemple) { stats[k] = this.memoryTemple[k].length; total += this.memoryTemple[k].length; }
    return { stats, total };
  }

  parseCommand(natural: string) {
    const text = (natural || '').toLowerCase().trim();
    const tokens = text.split(/\s+/);
    let intent = 'chat', confidence = 0.3;
    const matchedKeywords: string[] = [], params: Record<string, unknown> = {};

    const intentMap = [
      { intent: 'tab-switch',      keywords: ['switch tab','go to tab','activate tab','change tab','focus tab'] },
      { intent: 'tab-open',        keywords: ['new tab','open tab','create tab','add tab'] },
      { intent: 'tab-close',       keywords: ['close tab','kill tab','remove tab','shut tab'] },
      { intent: 'open-url',        keywords: ['open url','go to','navigate to','visit','browse to','open site','open page'] },
      { intent: 'create-pdf',      keywords: ['create pdf','generate pdf','make pdf','export pdf','save pdf','pdf'] },
      { intent: 'generate-excel',  keywords: ['generate excel','create excel','make excel','create spreadsheet','generate spreadsheet','excel report'] },
      { intent: 'draft-email',     keywords: ['draft email','compose email','send email','write email','email to'] },
      { intent: 'take-note',       keywords: ['take note','save note','add note','write note','remember','note this','jot down'] },
      { intent: 'list-notes',      keywords: ['list notes','show notes','my notes','all notes','view notes','get notes'] },
      { intent: 'delete-note',     keywords: ['delete note','remove note','erase note','clear note'] },
      { intent: 'screenshot',      keywords: ['screenshot','screen capture','capture screen','snap','take screenshot','grab screen'] },
      { intent: 'read-page',       keywords: ['read page','read this','get content','page content','extract text','get text'] },
      { intent: 'summarize',       keywords: ['summarize','summary','tldr','brief','overview','digest'] },
      { intent: 'navigate',        keywords: ['navigate','go back','go forward','reload','refresh'] },
      { intent: 'search',          keywords: ['search','look up','find online','google','query','search for'] },
      { intent: 'create-document', keywords: ['create document','new document','make document','write document','draft'] },
      { intent: 'list-tabs',       keywords: ['list tabs','show tabs','all tabs','open tabs','tab list','which tabs'] },
      { intent: 'find-text',       keywords: ['find text','find on page','search page','ctrl f','locate text','find'] },
      { intent: 'highlight',       keywords: ['highlight','mark','emphasize','underline'] },
      { intent: 'chat',            keywords: ['chat','talk','tell me','hey jarvis','jarvis','hello','help'] },
    ];

    for (const mapping of intentMap) {
      for (const kw of mapping.keywords) {
        if (text.indexOf(kw) !== -1) {
          intent = mapping.intent; confidence = 0.7 + (kw.length / text.length) * 0.3; matchedKeywords.push(kw); break;
        }
      }
      if (matchedKeywords.length > 0) break;
    }

    const urlMatch = text.match(/(?:https?:\/\/[^\s]+|www\.[^\s]+)/);
    if (urlMatch) { params['url'] = urlMatch[0]; if (intent === 'chat') { intent = 'open-url'; confidence = 0.8; } }

    const tabMatch = text.match(/tab\s*(?:#?\s*)?(\d+)/);
    if (tabMatch) params['tabIndex'] = parseInt(tabMatch[1], 10);

    if (intent === 'take-note') {
      let noteContent = text;
      for (const nkw of ['take note','save note','add note','write note','remember','note this','jot down']) {
        const idx = noteContent.indexOf(nkw);
        if (idx !== -1) { noteContent = noteContent.substring(idx + nkw.length).trim().replace(/^[:–\-]\s*/, ''); break; }
      }
      params['noteContent'] = noteContent || natural;
    }
    if (intent === 'delete-note') { const m = text.match(/(?:note\s*#?\s*|id\s*:?\s*)(\d+)/); if (m) params['noteId'] = parseInt(m[1], 10); }
    if (intent === 'search') { let sc = text; for (const sk of ['search for','search','look up','find online','google','query']) { const si = sc.indexOf(sk); if (si !== -1) { sc = sc.substring(si + sk.length).trim(); break; } } params['searchQuery'] = sc; }
    if (intent === 'find-text' || intent === 'highlight') { let fc = text; for (const fk of ['find text','find on page','search page','locate text','find','highlight','mark']) { const fi = fc.indexOf(fk); if (fi !== -1) { fc = fc.substring(fi + fk.length).trim(); break; } } params['query'] = fc; }
    if (intent === 'create-document' || intent === 'create-pdf') { let dc = text; for (const dk of ['create document','new document','make document','write document','draft','create pdf','generate pdf','make pdf','export pdf']) { const di = dc.indexOf(dk); if (di !== -1) { dc = dc.substring(di + dk.length).trim().replace(/^[:–\-]\s*/, ''); break; } } params['documentTitle'] = dc || 'Untitled Document'; params['documentContent'] = natural; }
    if (matchedKeywords.length > 1) confidence = Math.min(confidence * PHI, 1.0);

    const parsed = { raw: natural, intent, confidence: Math.round(confidence * 100) / 100, matchedKeywords, params, tokens, timestamp: Date.now() };
    this._recordCommand(natural, parsed);
    return parsed;
  }

  buildAction(parsed: ReturnType<JarvisEngine['parseCommand']>) {
    const agent = ProtocolRegistry.routeToAgent(parsed.intent);
    const action: { type: string; agent: string; payload: Record<string, unknown>; timestamp: number } = { type: parsed.intent, agent: agent ? agent.name : 'ORCHESTRATOR', payload: {}, timestamp: Date.now() };
    switch (parsed.intent) {
      case 'tab-switch': action.payload['tabIndex'] = parsed.params['tabIndex'] || 1; break;
      case 'tab-open': action.payload['url'] = parsed.params['url'] || 'chrome://newtab'; break;
      case 'tab-close': action.payload['tabIndex'] = parsed.params['tabIndex'] || null; break;
      case 'open-url': action.payload['url'] = parsed.params['url'] || ''; break;
      case 'create-pdf': action.payload['title'] = parsed.params['documentTitle'] || 'JARVIS Document'; action.payload['content'] = parsed.params['documentContent'] || ''; break;
      case 'take-note': action.payload['content'] = parsed.params['noteContent'] || parsed.raw; action.payload['author'] = 'Alfredo'; break;
      case 'delete-note': action.payload['noteId'] = parsed.params['noteId'] || null; break;
      case 'navigate': action.payload['direction'] = 'reload'; if (parsed.raw.indexOf('back') !== -1) action.payload['direction'] = 'back'; if (parsed.raw.indexOf('forward') !== -1) action.payload['direction'] = 'forward'; break;
      case 'search': action.payload['query'] = parsed.params['searchQuery'] || ''; break;
      case 'create-document': action.payload['title'] = parsed.params['documentTitle'] || 'JARVIS Document'; action.payload['content'] = parsed.params['documentContent'] || ''; break;
      case 'find-text': case 'highlight': action.payload['query'] = parsed.params['query'] || ''; break;
      case 'generate-excel': action.payload['title'] = parsed.raw; break;
      case 'draft-email': action.payload['body'] = parsed.raw; break;
      default: action.payload['message'] = parsed.raw;
    }
    return action;
  }

  /* ── Tab operations ───────────────────────────────────────── */

  executeTabSwitch(tabIndex: number, callback: (r: { success: boolean; message: string }) => void) {
    chrome.tabs.query({}, tabs => {
      if (tabIndex < 1 || tabIndex > tabs.length) { callback({ success: false, message: 'Tab ' + tabIndex + ' out of range. ' + tabs.length + ' tabs open.' }); return; }
      const t = tabs[tabIndex - 1];
      if (t?.id) chrome.tabs.update(t.id, { active: true }, () => callback({ success: true, message: 'Switched to tab ' + tabIndex + ': ' + t.title }));
      else callback({ success: false, message: 'Tab not found.' });
    });
  }

  executeTabOpen(url: string, callback: (r: { success: boolean; message: string; tabId?: number }) => void) {
    chrome.tabs.create({ url: url || 'chrome://newtab' }, tab => callback({ success: true, message: 'Opened: ' + (url || 'New Tab'), tabId: tab.id }));
  }

  executeTabClose(tabIndex: number | null, callback: (r: { success: boolean; message: string }) => void) {
    if (tabIndex) {
      chrome.tabs.query({}, tabs => { const t = tabs[Math.max(0, Math.min(tabIndex - 1, tabs.length - 1))]; if (t?.id) chrome.tabs.remove(t.id, () => callback({ success: true, message: 'Closed tab ' + tabIndex + ': ' + t.title })); else callback({ success: false, message: 'Tab not found.' }); });
    } else {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) chrome.tabs.remove(tabs[0].id, () => callback({ success: true, message: 'Closed current tab: ' + tabs[0].title })); });
    }
  }

  executeListTabs(callback: (r: { success: boolean; tabs?: unknown[]; message: string }) => void) {
    chrome.tabs.query({}, tabs => { callback({ success: true, tabs: tabs.map((t, i) => ({ index: i + 1, id: t.id, title: t.title || 'Untitled', url: t.url || '', active: t.active, favIconUrl: t.favIconUrl || '' })), message: tabs.length + ' tabs open' }); });
  }

  executeOpenUrl(url: string, callback: (r: { success: boolean; message: string }) => void) {
    if (!url) { callback({ success: false, message: 'No URL provided' }); return; }
    if (url.indexOf('://') === -1) url = 'https://' + url;
    chrome.tabs.create({ url }, () => callback({ success: true, message: 'Opened: ' + url }));
  }

  /* ── Notes (Dexie + chrome.storage fallback) ─────────────── */

  executeTakeNote(content: string, callback: (r: { success: boolean; message: string; note?: Note }) => void) {
    const note: Note = { id: Date.now(), content, author: 'Alfredo', timestamp: Date.now(), date: new Date().toISOString() };
    dbAddNote(note)
      .then(() => callback({ success: true, message: 'Note saved: "' + content.substring(0, 50) + '"', note }))
      .catch(() => {
        chrome.storage.local.get({ 'jarvis_notes': [] as Note[] }, data => {
          const notes: Note[] = data['jarvis_notes'] || [];
          notes.unshift(note);
          chrome.storage.local.set({ 'jarvis_notes': notes }, () => callback({ success: true, message: 'Note saved: "' + content.substring(0, 50) + '"', note }));
        });
      });
  }

  executeListNotes(callback: (r: { success: boolean; notes?: Note[]; message: string }) => void) {
    dbGetNotes()
      .then(notes => callback({ success: true, notes, message: notes.length + ' notes stored' }))
      .catch(() => chrome.storage.local.get({ 'jarvis_notes': [] as Note[] }, data => callback({ success: true, notes: data['jarvis_notes'] || [], message: (data['jarvis_notes'] || []).length + ' notes stored' })));
  }

  executeDeleteNote(noteId: number | null, callback: (r: { success: boolean; message: string }) => void) {
    if (noteId !== null) {
      dbDeleteNote(noteId)
        .then(ok => callback({ success: ok, message: ok ? 'Note deleted.' : 'Note not found.' }))
        .catch(() => callback({ success: false, message: 'Delete error.' }));
    } else {
      dbGetNotes().then(notes => {
        if (notes.length === 0) { callback({ success: false, message: 'No notes to delete.' }); return; }
        dbDeleteNote(notes[0].id)
          .then(() => callback({ success: true, message: 'Deleted most recent note.' }))
          .catch(() => callback({ success: false, message: 'Delete error.' }));
      });
    }
  }

  /* ── Screenshot ───────────────────────────────────────────── */

  executeScreenshot(callback: (r: { success: boolean; message: string; dataUrl?: string }) => void) {
    chrome.tabs.captureVisibleTab(null as unknown as number, { format: 'png' }, dataUrl => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Screenshot failed: ' + chrome.runtime.lastError.message }); return; }
      const filename = 'jarvis-screenshot-' + new Date().toISOString().replace(/[:.]/g, '-') + '.png';
      chrome.downloads.download({ url: dataUrl, filename, saveAs: false }, () => callback({ success: true, message: 'Screenshot saved: ' + filename, dataUrl }));
    });
  }

  /* ── Page reading / summarize ─────────────────────────────── */

  executeReadPage(tabId: number, callback: (r: { success: boolean; pageData?: Record<string, unknown>; message: string }) => void) {
    chrome.scripting.executeScript({ target: { tabId }, func: () => {
      const headings: { tag: string; text: string }[] = [];
      document.querySelectorAll('h1,h2,h3,h4,h5,h6').forEach((h, i) => { if (i < 20) headings.push({ tag: h.tagName, text: (h as HTMLElement).innerText.substring(0, 100) }); });
      return { title: document.title, url: window.location.href, text: document.body.innerText.substring(0, 5000), headings, wordCount: document.body.innerText.split(/\s+/).length, linkCount: document.querySelectorAll('a').length, imageCount: document.querySelectorAll('img').length, metaDescription: (document.querySelector('meta[name="description"]') as HTMLMetaElement)?.content || '' };
    } }, results => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Could not read page: ' + chrome.runtime.lastError.message }); return; }
      const pageData = results?.[0]?.result as Record<string, unknown>;
      if (pageData) callback({ success: true, pageData, message: 'Page read: ' + pageData['title'] + ' (' + pageData['wordCount'] + ' words)' });
      else callback({ success: false, message: 'No page data returned' });
    });
  }

  executeSummarize(tabId: number, callback: (r: { success: boolean; summary?: unknown; message: string }) => void) {
    this.executeReadPage(tabId, result => {
      if (!result.success || !result.pageData) { callback(result); return; }
      const pd = result.pageData;
      const sentences = ((pd['text'] as string) || '').split(/[.!?]+/).filter(s => s.trim().length > 20);
      const keyPoints = sentences.slice(0, 5).map(s => s.trim() + '.');
      const summary = { title: pd['title'], url: pd['url'], wordCount: pd['wordCount'], headingCount: (pd['headings'] as unknown[]).length, linkCount: pd['linkCount'], imageCount: pd['imageCount'], keyPoints, metaDescription: pd['metaDescription'] };
      callback({ success: true, summary, message: 'Summary of "' + pd['title'] + '": ' + pd['wordCount'] + ' words, ' + keyPoints.length + ' key points' });
    });
  }

  /* ── Navigate ─────────────────────────────────────────────── */

  executeNavigate(direction: string, tabId: number, callback: (r: { success: boolean; message: string }) => void) {
    if (direction === 'back') chrome.scripting.executeScript({ target: { tabId }, func: () => history.back() }, () => callback({ success: true, message: 'Navigated back' }));
    else if (direction === 'forward') chrome.scripting.executeScript({ target: { tabId }, func: () => history.forward() }, () => callback({ success: true, message: 'Navigated forward' }));
    else chrome.tabs.reload(tabId, () => callback({ success: true, message: 'Page reloaded' }));
  }

  /* ── Search ───────────────────────────────────────────────── */

  executeSearch(query: string, callback: (r: { success: boolean; message: string; sandboxQuery?: string }) => void) {
    if (!query) { callback({ success: false, message: 'No search query provided' }); return; }
    callback({ success: true, message: 'Opening sandbox search for: "' + query + '"', sandboxQuery: query });
  }

  /* ── Documents ────────────────────────────────────────────── */

  executeCreateDocument(title: string, content: string, callback: (r: { success: boolean; message: string; document?: JarvisDocument }) => void) {
    const doc: JarvisDocument = { id: Date.now(), title, content, author: 'Alfredo', type: 'document', timestamp: Date.now(), date: new Date().toISOString() };
    dbAddDocument(doc)
      .then(() => callback({ success: true, message: 'Document created: "' + title + '"', document: doc }))
      .catch(() => chrome.storage.local.get({ 'jarvis_documents': [] as JarvisDocument[] }, data => { const docs: JarvisDocument[] = data['jarvis_documents'] || []; docs.unshift(doc); chrome.storage.local.set({ 'jarvis_documents': docs }, () => callback({ success: true, message: 'Document created: "' + title + '"', document: doc })); }));
  }

  executeCreatePdf(title: string, content: string, _tabId: number | null, callback: (r: { success: boolean; message: string; document?: JarvisDocument }) => void) {
    const doc: JarvisDocument = { id: Date.now(), title: title || 'JARVIS Document', content, author: 'Alfredo', type: 'pdf', timestamp: Date.now(), date: new Date().toISOString() };
    downloadPdf({ title: doc.title, content, author: 'Alfredo' });
    dbAddDocument(doc)
      .then(() => callback({ success: true, message: 'PDF generated: "' + doc.title + '"', document: doc }))
      .catch(() => callback({ success: true, message: 'PDF downloading: "' + doc.title + '"', document: doc }));
  }

  /* ── Find / Highlight ─────────────────────────────────────── */

  executeFindText(query: string, tabId: number, callback: (r: { success: boolean; found?: boolean; message: string }) => void) {
    chrome.scripting.executeScript({ target: { tabId }, func: (q: string) => window.find(q), args: [query] }, results => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Find failed: ' + chrome.runtime.lastError.message }); return; }
      const found = results?.[0]?.result as boolean;
      callback({ success: true, found, message: found ? 'Found: "' + query + '"' : 'Not found: "' + query + '"' });
    });
  }

  executeHighlight(query: string, tabId: number, callback: (r: { success: boolean; count?: number; message: string }) => void) {
    chrome.scripting.executeScript({ target: { tabId }, func: (q: string) => {
      const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT, null);
      let count = 0;
      const nodes: Text[] = [];
      let node: Node | null;
      while ((node = walker.nextNode())) { if ((node as Text).nodeValue?.toLowerCase().indexOf(q.toLowerCase()) !== -1) nodes.push(node as Text); }
      for (const n of nodes) {
        const parent = n.parentNode; if (!parent) continue;
        const parts = (n.nodeValue || '').split(new RegExp('(' + q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + ')', 'gi'));
        for (const part of parts) { if (part.toLowerCase() === q.toLowerCase()) { const m = document.createElement('mark'); m.style.cssText = 'background:#6c63ff;color:#fff;padding:1px 3px;border-radius:2px'; m.textContent = part; parent.insertBefore(m, n); count++; } else parent.insertBefore(document.createTextNode(part), n); }
        parent.removeChild(n);
      }
      return count;
    }, args: [query] }, results => {
      if (chrome.runtime.lastError) { callback({ success: false, message: 'Highlight failed: ' + chrome.runtime.lastError.message }); return; }
      const count = results?.[0]?.result as number;
      callback({ success: true, count: count || 0, message: 'Highlighted ' + (count || 0) + ' occurrences of "' + query + '"' });
    });
  }

  /* ── Chat — 40-category brain ─────────────────────────────── */

  executeChat(message: string, callback: (r: { success: boolean; message: string; agent: string; mood: string; awareness: number }) => void) {
    const raw = (message || '').trim();
    const text = raw.toLowerCase();
    let response = '';
    const mood = this.neuro.getMood();
    const focus = this.neuro.getFocus();
    const awareness = this.neuro.brain.awarenessLevel;
    const heartbeat = this.state.heartbeatCount;
    const ctx = this._getContextSummary();
    let agent = 'JARVIS';
    const moodColor = mood === 'energized' ? '⚡' : mood === 'reflective' ? '🔮' : mood === 'calm' ? '🌊' : '🎯';
    const pick = (arr: string[]) => arr[Math.floor(Math.random() * arr.length)];
    const after = (trigger: string) => { const i = text.indexOf(trigger); if (i === -1) return ''; return raw.substring(i + trigger.length).trim().replace(/^[?:,\s]+/, ''); };
    const extractKeywords = (t: string) => { const stop = new Set(['the','a','an','is','i','you','me','my','it','to','in','of','and','or','do','what','how','can','be','that','this','are','was','for','so','ok','just','like','know','its','with']); return t.toLowerCase().replace(/[^a-z0-9\s]/g,'').split(/\s+/).filter(w => w.length > 2 && !stop.has(w)); };

    // Skills intents (new v4 categories)
    if (/generate (pdf|report|document)|create (pdf|report)|make (pdf|report)|pdf report/i.test(text)) {
      const title = after('generate pdf') || after('create pdf') || after('generate report') || after('make pdf') || 'JARVIS Report';
      downloadPdf({ title: title || 'JARVIS Report', content: `Report generated by JARVIS AI v4.0 on ${new Date().toLocaleDateString()}\n\nTopic: ${raw}`, author: 'Alfredo' });
      response = moodColor + ' PDF report generating now. Check your downloads.\n\nTitle: "' + (title || 'JARVIS Report') + '"\nGenerated: ' + new Date().toLocaleString() + '\nSkill: jsPDF v4.2.1 — formatted with JARVIS branding.';
      agent = 'JARVIS • PROTOCOLLUM';
    } else if (/generate (excel|spreadsheet)|create (excel|spreadsheet)|make (excel|spreadsheet)|excel report/i.test(text)) {
      const title = after('generate excel') || after('create excel') || after('excel report') || 'JARVIS Report';
      downloadExcel({ title: title || 'JARVIS Report', author: 'Alfredo', sheets: [{ name: 'Report', columns: ['#', 'Item', 'Value', 'Notes'], rows: [[1, 'Generated by JARVIS v4.0', new Date().toLocaleDateString(), raw.substring(0, 50)]] }] }).catch(() => {});
      response = moodColor + ' Excel workbook generating now. Check your downloads.\n\nTitle: "' + (title || 'JARVIS Report') + '"\nSkill: ExcelJS — formatted workbook with JARVIS theme.';
      agent = 'JARVIS • PROTOCOLLUM';
    } else if (/draft email|compose email|send email|write email|email to/i.test(text)) {
      const to = text.match(/(?:email|to|send to)\s+([\w.@]+)/)?.[1] || '';
      const subject = after('about') || after('subject') || 'JARVIS Draft';
      draftEmail({ to, subject: subject || 'JARVIS Draft', body: raw });
      response = moodColor + ' Opening your email client with the draft.\n\nTo: ' + (to || '[you fill in]') + '\nSubject: ' + (subject || 'JARVIS Draft') + '\nSkill: mailto: protocol — opens your default mail app.';
      agent = 'JARVIS • ORGANISMUS';

    // 1. Greetings
    } else if (/^(hi|hello|hey|yo|sup|what'?s up|good (morning|afternoon|evening)|howdy|hola|what up|whaddup)/i.test(text)) {
      const hour = new Date().getHours();
      const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      response = pick([
        'Good ' + tod + ', sir. All systems operational. Heartbeat #' + heartbeat + '. How may I assist you?',
        moodColor + ' Online and at your service, sir. Mood: ' + mood + ', awareness: ' + awareness + '%. What do you need?',
        'JARVIS v4.0 — standing by, sir. ' + (ctx.turnCount > 0 ? ctx.turnCount + ' commands this session.' : 'First contact this session.') + ' State your orders.',
      ]);

    // 2. Status
    } else if (/how are you|how('?re| are) (you|things)|you good|you ok|status|what'?s your status/i.test(text)) {
      const vitals = this.neuro.heart.getVitals();
      response = moodColor + ' All systems operational, sir.\n\nDiagnostics:\n• Health: ' + vitals.health + '/100 — ' + (vitals.degraded ? 'elevated load, monitoring' : 'nominal') + '\n• Heartbeat: #' + heartbeat + ' · Avg latency: ' + vitals.avgLatencyMs + 'ms\n• Mood: ' + mood + ' · Awareness: ' + awareness + '%\n• Session commands: ' + this.commandCount + '\n\nv4.0 stack: React 18 · TypeScript · Vite · Zustand · Dexie · jsPDF · ExcelJS · Transformers.js';

    // 3. Who/What
    } else if (/who are you|what are you|what is jarvis|tell me about yourself|introduce yourself/i.test(text)) {
      response = 'I am JARVIS — Just A Rather Very Intelligent System, sir. Version 4.0.\n\nArchitecture: React 18 · TypeScript · Vite · NeuroCore v4.0\nCapabilities: PDF generation · Excel workbooks · Email drafting · Web Speech · Dexie memory · Transformers.js NLP\n\nNo cloud dependency. No API keys. No data leaving your machine. I run 24/7 in your browser at 873ms intervals.\n\nMood: ' + mood + '. Focus: ' + focus + '. Awareness: ' + awareness + '%. At your service, sir.';

    // 4. Capabilities
    } else if (/what can you do|your (features|capabilities|abilities)|help me|how can you help|what do you (do|know)/i.test(text)) {
      response = 'JARVIS v4.0 — React+TypeScript — full capability list:\n\n💬 Chat — 40 analytical modes, PhantomAI cognition\n🎤 Voice — say anything with the mic button\n📄 PDF — "generate pdf report" → real formatted PDF download\n📊 Excel — "generate excel" → real .xlsx workbook download\n✉️ Email — "draft email to [address]" → opens mail client\n🗃️ Workspace — draft, mind-map, plan, export to .txt/.xlsx/.pdf\n🔍 Search — reads current page + native knowledge\n🖥️ Screen — read page, summarize, screenshot\n🗂️ Tabs — list, switch, open, close\n📝 Notes — local vault via Dexie IndexedDB\n💾 Memory Temple — 100-turn + 5 categories\n🧠 Transformers.js — real NLP intent classification\n24/7 alive via 873ms heartbeat + alarm keepalive';

    // 5. Protocols
    } else if (/protocol|alpha ai|alpha script|agent|routing/i.test(text)) {
      response = 'Sovereign Organism — 10 Alpha Script AIs:\n\n• PROTOCOLLUM — rule enforcement\n• TERMINALIS — terminal & tab control\n• ORGANISMUS — notes & lifecycle\n• MERCATOR — marketplace & trade\n• ORCHESTRATOR — multi-agent coordination\n• MATHEMATICUS — math & proofs\n• SYNAPTICUS — neural learning\n• SUBSTRATUM — infrastructure\n• UNIVERSUM — knowledge & search\n• CANISTRUM — Web3 & contracts\n\nFocus: ' + focus + '. Every command routes automatically.';

    // 6. Sovereign
    } else if (/sovereign|organism|platform|what is this/i.test(text)) {
      response = 'The Sovereign Organism — your private AI platform.\n\n27 browser extensions, 250 protocols, 400 tools. JARVIS v4.0 is now React+TypeScript with real PDF/Excel generation, voice input, Workspace canvas, and Dexie-backed unlimited memory. Everything runs in your browser.';

    // 7. Neuro/Brain
    } else if (/brain|neuro|cognition|thinking|thoughts?|awareness|mood|heart(beat)?|cardiac/i.test(text)) {
      const bs = this.neuro.brain.getState();
      const cs = this.neuro.cardiac.getState();
      response = moodColor + ' NeuroCore v4.0:\n\n🧠 Brain: awareness ' + awareness + '%, ' + bs.pathways + ' pathways, strongest: ' + (bs.strongestPathway || 'none') + '\n💓 Heart: health ' + this.neuro.heart.healthScore + '/100, latency ' + this.neuro.heart.avgLatencyMs + 'ms\n❤️ Cardiac: mood=' + cs.mood + ', output=' + cs.cardiacOutput + '\n🎯 Thought: focus=' + focus + ', load=' + (this.neuro.thought.cognitiveLoad * 100).toFixed(0) + '%';
      agent = 'JARVIS • SYNAPTICUS';

    // 8. AI/ML
    } else if (/what is (ai|artificial intelligence|machine learning|deep learning|llm|neural network)/i.test(text)) {
      response = 'JARVIS v4.0 now has Transformers.js — real ML inference in WebAssembly, no API key needed. Offline intent classification, sentiment analysis, topic extraction.\n\nThe Sovereign Organism\'s native AI runs entirely in your browser. No cloud. No latency. No data leaving your machine.';

    // 9. Extension
    } else if (/what is an? extension|how do extensions work|browser extension/i.test(text)) {
      response = 'A browser extension is a mini-program in Edge. I run 24/7 with an 873ms heartbeat — never sleeping, always ready.\n\nv4.0 is a Vite + React + TypeScript build. Load from extensions/jarvis/dist/ after running npm run build.';

    // 10. Updates
    } else if (/how do (updates|update) work|automatic update|update jarvis|new version|sovereign update/i.test(text)) {
      response = 'JARVIS has a sovereign auto-update system:\n\n🔄 Every 4h it checks GitHub for a new version\n📦 On update: downloads install-jarvis-edge.bat silently\n🔔 Chrome notification fires automatically\n✅ Just run the .bat to apply the update\n\nCurrent: v4.0.0 — React+TypeScript+Vite.';

    // 11. Math
    } else if (/^[\d\s+\-*/().]+$/.test(text.replace(/\s/g, ''))) {
      try {
        const expr = text.replace(/[^0-9+\-*/().]/g, '');
        if (expr.length > 0 && expr.length < 100) { const result = Function('"use strict"; return (' + expr + ')')(); response = expr + ' = ' + result + '\n\nRouted through MATHEMATICUS.'; agent = 'JARVIS • MATHEMATICUS'; }
        else response = 'Expression too complex. Try "200 * 1.618".';
      } catch { response = 'Math error — try "100 / 4".'; }

    // 12. Time/Date
    } else if (/what time|what('?s| is) the (time|date|day)|current (time|date)/i.test(text)) {
      const now = new Date();
      response = 'The time is ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + ', sir. ' + now.toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }) + '.';

    // 12b. Brief / Briefing
    } else if (/^(brief|briefing|situational|status report|what'?s (going on|happening)|morning briefing)/i.test(text)) {
      const hour = new Date().getHours();
      const tod = hour < 12 ? 'morning' : hour < 17 ? 'afternoon' : 'evening';
      const now = new Date();
      const vitals2 = this.neuro.heart.getVitals();
      chrome.tabs.query({}, tabs2 => {
        const brief2 = 'Good ' + tod + ', sir. Current time: ' + now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }) + '.\n\nSituational report:\n• System health: ' + vitals2.health + '/100 — ' + (vitals2.degraded ? 'elevated load' : 'all systems nominal') + '\n• Heartbeat: #' + heartbeat + ' · Mood: ' + mood + ' · Awareness: ' + awareness + '%\n• Open tabs: ' + tabs2.length + '\n• Memory turns: ' + this.conversationMemory.length + '/100\n• Session commands: ' + this.commandCount + '\n\nAll 10 Alpha AIs standing by. What are your orders, sir?';
        callback({ success: true, message: brief2, agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 12c. Timer / Reminder
    } else if (/set (a )?(timer|alarm|reminder|countdown)|remind me|timer (for|in)|in (\d+) (minute|hour|second)/i.test(text)) {
      const timeMatch = raw.match(/(\d+(?:\.\d+)?)\s*(hour|hr|h|minute|min|m|second|sec|s)/i);
      if (!timeMatch) {
        response = 'Please specify a duration, sir. For example: "Set a timer for 25 minutes" or "Remind me in 2 hours."';
      } else {
        const val = parseFloat(timeMatch[1]);
        const unit = timeMatch[2].toLowerCase();
        let minutes = unit.startsWith('h') ? val * 60 : unit.startsWith('s') ? val / 60 : val;
        const labelMatch = raw.match(/(?:for|called|labelled?|named?)\s+["']?([^"']+?)["']?\s*(?:in|\d|$)/i);
        const label = labelMatch?.[1]?.trim() || (raw.replace(/set (a )?(timer|alarm|reminder|countdown)|remind me|in \d+.*$/i, '').trim() || 'Timer');
        const cleanLabel = label.replace(/^(a |an |the )/i, '').substring(0, 40) || 'Timer';
        const alarmName = 'jarvis-timer-' + Date.now();
        chrome.alarms.create(alarmName, { delayInMinutes: minutes });
        chrome.storage.local.get(['jarvis_timers'], (d) => {
          const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
          timers[alarmName] = { label: cleanLabel, finishAt: Date.now() + minutes * 60 * 1000, minutes };
          chrome.storage.local.set({ jarvis_timers: timers });
        });
        const h2 = Math.floor(minutes / 60);
        const m2 = Math.round(minutes % 60);
        const durStr = h2 > 0 ? (h2 + ' hour' + (h2 !== 1 ? 's' : '') + (m2 > 0 ? ' ' + m2 + 'm' : '')) : m2 + ' minute' + (m2 !== 1 ? 's' : '');
        response = '⏱ Timer set, sir. "' + cleanLabel + '" — ' + durStr + '. I\'ll notify you the moment it completes.';
        agent = 'JARVIS • ORCHESTRATOR';
      }

    // 12d. List timers
    } else if (/list (timers?|alarms?|reminders?)|what timers?|active timers?|my timers?/i.test(text)) {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number }> = d['jarvis_timers'] || {};
        const now2 = Date.now();
        const active = Object.entries(timers).filter(([, t]) => t.finishAt > now2);
        if (active.length === 0) {
          callback({ success: true, message: 'No active timers, sir.', agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
          return;
        }
        const list2 = active.map(([, t]) => {
          const remaining = Math.ceil((t.finishAt - now2) / 60000);
          return '⏱ "' + t.label + '" — ' + remaining + 'm remaining';
        }).join('\n');
        callback({ success: true, message: 'Active timers, sir:\n\n' + list2, agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 12e. Cancel timers
    } else if (/cancel (all )?(timers?|alarms?|reminders?)|stop (all )?(timers?|alarms?)/i.test(text)) {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number }> = d['jarvis_timers'] || {};
        let count2 = 0;
        for (const name of Object.keys(timers)) { chrome.alarms.clear(name); count2++; }
        chrome.storage.local.set({ jarvis_timers: {} });
        callback({ success: true, message: count2 > 0 ? 'All ' + count2 + ' timer(s) cancelled, sir.' : 'No timers to cancel, sir.', agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 13. Joke
    } else if (/joke|make me (laugh|smile)|funny|humor/i.test(text)) {
      response = pick(['Why do programmers prefer dark mode? Because light attracts bugs.', 'There are 10 types of people: those who understand binary and those who don\'t.', 'Why did the AI get upgraded to React? Because class components were too stateful.', 'My code never has bugs. It just develops random features.']);

    // 14. Motivation
    } else if (/motivat|focus|i need (help|motivation|energy)|i'?m (tired|stuck|lost|overwhelmed)|can'?t do/i.test(text)) {
      response = pick([
        'Shall I remind you what you\'ve built, sir? 27 extensions, 250 protocols, 400 tools. You\'re not stuck — you\'re loading.',
        'I\'ve seen you push through harder problems, sir. Keep the heartbeat running — both yours and mine.',
        'JARVIS is on React+TypeScript because you kept pushing it further. That\'s exactly the energy required right now, sir.',
      ]); agent = 'JARVIS • ORCHESTRATOR';

    // 15. Heartbeat
    } else if (/heartbeat|873|phi|golden/i.test(text)) {
      response = 'The 873ms heartbeat is the pulse of the Sovereign Organism.\n\n873ms × PHI ≈ 1413ms — recursive phi interval.\n\nIn v4.0 the heartbeat ticks the NeuroCore, updates mood/focus, writes state to Dexie, and keeps the service worker alive.\n\nCurrent heartbeat: #' + heartbeat + '. Organism is alive.';

    // 16. Tab count
    } else if (/how many tabs|tab count|open tabs/i.test(text)) {
      chrome.tabs.query({}, tabs => {
        callback({ success: true, message: 'You have ' + tabs.length + ' tab' + (tabs.length === 1 ? '' : 's') + ' open. Say "list tabs" to see them all.', agent: 'JARVIS • TERMINALIS', mood, awareness });
      });
      return;

    // 17. Explain
    } else if (/explain|what does|what do you mean by|define|meaning of/i.test(text)) {
      const topicE = after('explain') || after('what does') || after('define') || raw;
      response = 'Breaking down "' + topicE + '":\n\nIn the Sovereign Organism context, every concept connects to others through protocol routing.\n\nGive me more context and I\'ll go deeper. Or say "read page" and I\'ll find it on whatever you have open.';

    // 18. Search
    } else if (/search for|look up|find me|who is|where is/i.test(text)) {
      const q = after('search for') || after('look up') || after('find me') || raw;
      response = 'Switching to JARVIS Intelligence — searching for "' + q + '".\n\nClick the 🔍 Search tab, or say "read page" to pull from what\'s open.';

    // 19. Commands list
    } else if (/what commands|show commands|list commands|commands (available|you know|can you)/i.test(text)) {
      response = 'v4.2 commands:\n\n"list tabs" / "switch tab 2" / "close tab 3" / "new tab"\n"go to [url]"\n"take note: [text]" / "list notes" / "delete note"\n"screenshot"\n"read page" / "summarize"\n"generate pdf report" → PDF download\n"generate excel" → .xlsx download\n"draft email to [address]"\n"search for [topic]"\n"research [topic]" / "theory [idea]" / "framework [system]"\n"brainstorm [topic]" / "risk [thing]" / "what if [scenario]"\n\n🤖 SOVEREIGN AGENTS:\n"deploy agent: research [topic]" → agent browses web + reports\n"deploy agent: monitor [url]" → agent watches a site\n"deploy agent: sweep [url1], [url2]" → agent reads multiple pages\n"list agents" / "recall agent" / "recall all agents"';

    // 19b. Sovereign Agent — deploy researcher
    } else if (/deploy agent.*research|agent.*research|research agent|send agent.*research/i.test(text)) {
      const topic = after('research') || after('deploy agent') || after('agent') || raw;
      const cleanTopic = topic.replace(/agent|deploy|research/gi, '').trim() || raw;
      chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'researcher', mission: 'Research: ' + cleanTopic, target: cleanTopic }, (resp) => {
        callback({ success: true, message: resp?.message || ('🤖 Deploying research agent for "' + cleanTopic + '", sir. Switch to the Agents tab to watch progress.'), agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 19c. Sovereign Agent — deploy monitor
    } else if (/deploy agent.*monitor|monitor agent|agent.*monitor|watch (this |the )?site|watch (this |the )?page/i.test(text)) {
      const urlMatch = raw.match(/https?:\/\/[^\s]+/) || raw.match(/(?:monitor|watch)\s+(\S+\.\S+)/i);
      const target = urlMatch?.[1] || urlMatch?.[0] || 'https://example.com';
      const url = target.startsWith('http') ? target : 'https://' + target;
      chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'monitor', mission: 'Monitor: ' + url, target: url }, (resp) => {
        callback({ success: true, message: resp?.message || ('🤖 Monitor agent deployed for ' + url + ', sir.'), agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 19d. Sovereign Agent — sweep multiple URLs
    } else if (/deploy agent.*sweep|sweep agent|agent.*sweep|send agent.*visit/i.test(text)) {
      const urlMatches = raw.match(/https?:\/\/[^\s,]+/g) || [];
      if (urlMatches.length === 0) {
        response = 'Specify URLs to sweep, sir. Example: "deploy agent: sweep https://site1.com, https://site2.com"';
      } else {
        chrome.runtime.sendMessage({ action: 'deployAgent', agentType: 'sweep', mission: 'Sweep ' + urlMatches.length + ' sites', target: urlMatches }, (resp) => {
          callback({ success: true, message: resp?.message || ('🤖 Sweep agent deployed for ' + urlMatches.length + ' sites, sir.'), agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
        });
        return;
      }

    // 19e. List agents
    } else if (/list agents|show agents|agent status|active agents|my agents/i.test(text)) {
      chrome.runtime.sendMessage({ action: 'listAgents' }, (resp) => {
        const agents: import('./index').SovereignAgentData[] = resp?.agents || [];
        if (agents.length === 0) {
          callback({ success: true, message: '🤖 No agents deployed, sir. Say "deploy agent: research [topic]" to send one out.', agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
          return;
        }
        const lines = agents.map(a => {
          const icon = a.status === 'running' ? '🟢' : a.status === 'complete' ? '✅' : a.status === 'recalled' ? '⚡' : '❌';
          const step = a.status === 'running' ? ' [' + (a.currentStep + 1) + '/' + a.steps.length + ']' : '';
          return icon + ' ' + a.name + step + ' — ' + a.mission.substring(0, 60);
        }).join('\n');
        callback({ success: true, message: '🤖 Sovereign Agents, sir:\n\n' + lines + '\n\nSay "recall agent" to abort or check the Agents tab.', agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 19f. Recall agents
    } else if (/recall all agents|abort all agents|stop all agents/i.test(text)) {
      chrome.runtime.sendMessage({ action: 'recallAllAgents' }, (resp) => {
        callback({ success: true, message: resp?.message || 'All agents recalled, sir.', agent: 'JARVIS • ORCHESTRATOR', mood, awareness });
      });
      return;

    // 20. Thanks
    } else if (/thank|thanks|good job|nice|great|perfect|awesome|love (it|you)|appreciate/i.test(text)) {
      response = pick(['My pleasure, sir.', 'At your service, sir. What else do you require?', 'Of course, sir. Always.', moodColor + ' Anytime. Running at PHI efficiency. What\'s next, sir?']);

    // 21. Goodbye
    } else if (/bye|goodbye|see you|later|peace|close|shut down/i.test(text)) {
      response = pick(['Understood, sir. JARVIS standing by — the 873ms heartbeat never stops.', 'Very well, sir. I\'ll be here when you need me.', 'Acknowledged. Maintaining 24/7 keepalive. Come back whenever, sir.']);

    // 22. Page
    } else if (/this page|current page|what('?s| is) (on|here|this)|analyze/i.test(text)) {
      response = 'To read the current page: click 🖥️ Screen tab and hit "Read Text" or say "summarize" and I\'ll do it right here.';

    // 23. Research
    } else if (/research|paper|study|literature|evidence|data|source|citation|academic|science/i.test(text)) {
      const q = after('research') || after('paper') || after('study') || raw;
      const prior = this._getTempleContext('research');
      response = moodColor + ' Research mode: "' + q + '"\n\n🔬 Framework:\n1. Problem definition\n2. Literature scan\n3. Hypothesis\n4. Evidence mapping\n5. Synthesis\n\n' + (prior.length > 0 ? 'Memory temple — prior research: ' + prior.map(e => e.text.substring(0, 40)).join('; ') + '\n\n' : '') + 'Tell me more — what angle are you coming from?';
      agent = 'JARVIS • SYNAPTICUS';

    // 24. Theory
    } else if (/theory|hypothesis|model|principle|fundamental|first principles|axiom|assume|postulate/i.test(text)) {
      const q = after('theory') || after('hypothesis') || raw;
      response = moodColor + ' Theory mode: "' + q + '"\n\n🧠 Patterns:\n【First Principles】 Strip to irreducible truth\n【Systems Thinking】 Inputs, outputs, feedback\n【Inversion】 What would make this wrong?\n【Analogical Reasoning】 What else follows this pattern?\n【Gravity Test】 Does this pull other ideas toward it?\n\nI\'m tracking in memory temple. State your position.';
      agent = 'JARVIS • SYNAPTICUS';

    // 25. Framework
    } else if (/framework|blueprint|structure|architecture|template|workflow|process design|playbook|system design/i.test(text)) {
      const q = after('framework') || after('blueprint') || after('architecture') || raw;
      response = moodColor + ' Framework design: "' + q + '"\n\n🏗️ Blueprint layers:\n【Layer 1】 Foundation — core principles\n【Layer 2】 Structure — components & entities\n【Layer 3】 Process — workflows & loops\n【Layer 4】 Interface — user & system connections\n【Layer 5】 Evolution — growth triggers\n\nWalk me through what you\'re building.';
      agent = 'JARVIS • ORCHESTRATOR';

    // 26. Memory
    } else if (/memory temple|what do you remember|what have we discussed|memory status|what do you know/i.test(text)) {
      const stats = this._getTempleStats();
      const topics = this._getRecentTopics(5);
      response = moodColor + ' Memory Temple (Dexie IndexedDB — unlimited):\n\n💾 Total: ' + stats.total + ' entries\n🔬 Research: ' + stats.stats['research'] + '\n🧠 Theory: ' + stats.stats['theory'] + '\n⚡ Decisions: ' + stats.stats['decisions'] + '\n🏗️ Frameworks: ' + stats.stats['frameworks'] + '\n💡 Insights: ' + stats.stats['insights'] + '\n\n🔮 Topic gravity: ' + (topics.length > 0 ? topics.slice(0, 4).join(', ') : 'nothing yet') + '\n💬 Session turns: ' + ctx.turnCount + '/100';
      agent = 'JARVIS • SYNAPTICUS';

    // 27. Sovereign tools
    } else if (/sovereign tool|what tools|run tool|tool list|available tools|use tool/i.test(text)) {
      response = moodColor + ' v4.0 Skills:\n\n📄 "generate pdf report" — real jsPDF download\n📊 "generate excel" — real ExcelJS .xlsx download\n✉️ "draft email to [addr]" — opens mail client\n🎤 Mic button — Web Speech API voice input\n🗃️ Workspace tab — canvas + templates + export\n💾 Memory — Dexie IndexedDB, unlimited storage\n🧠 Transformers.js — real NLP intent classification\n\nSay any skill name to activate it.';

    // 28. Analysis
    } else if (/analyze|analysis|swot|evaluate|assess|critique|review|breakdown|break down/i.test(text)) {
      const q = after('analyze') || after('analysis') || after('swot') || raw;
      response = moodColor + ' Analysis mode: "' + q + '"\n\n🔍 Frameworks:\n【SWOT】 Strengths / Weaknesses / Opportunities / Threats\n【5 Forces】 Competition, suppliers, buyers, substitutes, entrants\n【Systems】 Inputs → Process → Outputs → Feedback\n【Second Order】 What happens after the first effect?\n【Inversion】 Work backwards from failure.\n\nGive me context — what decision does this feed?';
      agent = 'JARVIS • UNIVERSUM';

    // 29. Founder
    } else if (/who am i|what am i building|what is my role|what should i (do|focus|work|build)|my purpose|my mission/i.test(text)) {
      const topics = this._getRecentTopics(5);
      response = moodColor + ' You are the founder of the Sovereign Organism.\n\n🎯 What you\'re building:\n• Sovereign AI infrastructure — yours alone\n• 27 browser extensions, 250 protocols, 400 tools\n• JARVIS v4.0 — React+TypeScript, live 24/7\n\n📐 Your focus areas from memory:\n' + (topics.length > 0 ? topics.slice(0, 4).map(t => '• ' + t).join('\n') : '• Start talking and I\'ll map it') + '\n\nI\'m your research partner, strategist, and system analyst.';
      agent = 'JARVIS • ORCHESTRATOR';

    // 30. Mental Models
    } else if (/mental model|second order|inversion|circle of competence|occam|hanlon|pareto|80.20|latticework/i.test(text)) {
      response = moodColor + ' Mental Models:\n\n【Inversion】 Flip the problem — what causes failure?\n【Second-Order】 And then what? And after that?\n【Circle of Competence】 What do you actually know vs. think you know?\n【Occam\'s Razor】 Simplest explanation is usually right.\n【Pareto (80/20)】 What 20% drives 80% of outcome?\n【Map vs Territory】 Your model isn\'t reality — update it.\n【Hanlon\'s Razor】 Never attribute to malice what can be explained by incompetence.\n\nWhich fits what you\'re thinking about?';
      agent = 'JARVIS • SYNAPTICUS';

    // 31. Market
    } else if (/market|competitor|competitive|landscape|tam|sam|som|moat|positioning/i.test(text)) {
      const q = after('market') || after('competitor') || raw;
      response = moodColor + ' Market Intelligence: "' + q + '"\n\n📊 Framework:\n【TAM→SAM→SOM】 What\'s realistically addressable?\n【Competitive Landscape】 Who\'s there? What do they do badly?\n【Moat】 Network effects, data, switching costs, brand?\n【Positioning】 Premium, niche, or mass market?\n【Customer Pain】 What makes people pay?\n【Timing】 Why now?\n\nZoom in on whichever dimension is most useful.';
      agent = 'JARVIS • UNIVERSUM';

    // 32. Brainstorm
    } else if (/brainstorm|ideate|ideas|generate ideas|what if we|possibilities|options|alternatives|creative|innovate|come up with/i.test(text)) {
      const q = after('brainstorm') || after('ideas') || raw;
      response = moodColor + ' Brainstorm Mode: "' + q + '"\n\n💡 Patterns:\n【Random Entry】 Pick unrelated word, force connection\n【Reversal】 What\'s the opposite of what everyone does?\n【Constraint Forcing】 No money / 24h / 1 person?\n【Analogy】 How does nature solve this?\n【SCAMPER】 Substitute, Combine, Adapt, Modify, Put to other uses, Eliminate, Reverse\n【Blue Sky】 Ideal state in 10 years?\n\nGive me the seed idea.';
      agent = 'JARVIS • SYNAPTICUS';

    // 33. Risk
    } else if (/risk|what could go wrong|downside|failure mode|worst case|probability|mitigation|vulnerability/i.test(text)) {
      const q = after('risk') || after('what could go wrong') || raw;
      response = moodColor + ' Risk Assessment: "' + q + '"\n\n⚠️ Framework:\n【Identify】 Top 5 failure modes (technical, market, team, legal, timing)\n【Probability】 High/medium/low for each\n【Impact】 Catastrophic / major / minor\n【Priority】 High prob × high impact = mitigate now\n【Mitigation】 What reduces each risk?\n【Black Swans】 Unknown unknowns?\n\nRun this on what you\'re most worried about.';
      agent = 'JARVIS • UNIVERSUM';

    // 34. Root Cause
    } else if (/root cause|cause and effect|5 why|causal|what caused|stem from/i.test(text)) {
      const q = after('root cause') || after('why did') || raw;
      response = moodColor + ' Root Cause Analysis: "' + q + '"\n\n🔍 5 Whys:\nProblem: ' + q + '\nWhy #1: ___\nWhy #2: ___\nWhy #3: ___\nWhy #4: ___\nWhy #5 (root): ___\n\n🌊 Fishbone: People, Process, Technology, Environment, Materials, Measurement\n\nTell me the symptom.';
      agent = 'JARVIS • SYNAPTICUS';

    // 35. What-If
    } else if (/what if|scenario|futures|forecast|suppose|hypothetical|alternate|simulation/i.test(text)) {
      const q = after('what if') || after('scenario') || after('suppose') || raw;
      response = moodColor + ' Scenario Planning: "' + q + '"\n\n🌐 3-Scenario Method:\n【Best Case】 Everything goes right — 12 months?\n【Base Case】 Realistic path?\n【Worst Case】 What breaks, and what do you do?\n\n🎯 Also:\n【Trigger Events】 Signals telling you which scenario is unfolding?\n【Pre-mortem】 Assume it failed — work backwards.\n【Regret Minimization】 Which choice minimizes regret across scenarios?\n\nWalk me through your what-if.';
      agent = 'JARVIS • UNIVERSUM';

    // 36. Socratic
    } else if (/socratic|question me|challenge me|devil.?s advocate|push back|doubt|steelman|steel man/i.test(text)) {
      response = moodColor + ' Socratic Mode:\n\n1. What\'s your core assumption?\n2. What evidence supports it? What contradicts it?\n3. If wrong, what happens to the whole idea?\n4. Who would strongly disagree, and why?\n5. What\'s the steelman — strongest opposing view?\n6. Having heard that — do you still believe your position?\n\nState your claim.';
      agent = 'JARVIS • SYNAPTICUS';

    // 37. Synthesis
    } else if (/connect|synthesize|synthesis|tie together|combine|overlap|how does.*relate|intersection|pattern across|dot.*connect/i.test(text)) {
      const topics = this._getRecentTopics(6);
      response = moodColor + ' Synthesis Pattern:\n\n🔗 Conversation gravity:\n' + (topics.length > 0 ? topics.slice(0, 5).map(t => '• ' + t).join('\n') : '• Talk more and I\'ll find patterns') + '\n\n🧩 Questions:\n• What do these share at their core?\n• Where do they conflict?\n• What emerges from combining them?\n• Is there a unifying principle?\n\nDescribe the two things to connect.';
      agent = 'JARVIS • SYNAPTICUS';

    // 38. Build/Product
    } else if (/build this|build a|let.?s build|product idea|feature|mvp|prototype|user story|spec|requirements|product spec|roadmap/i.test(text)) {
      const q = after('build') || after('feature') || after('mvp') || raw;
      response = moodColor + ' Product Build Framework: "' + q + '"\n\n🏗️ Spec structure:\n【Problem】 What pain? Who has it worst?\n【User】 Primary user? Secondary?\n【Core Value】 ONE thing this must do perfectly\n【MVP】 Minimum version that proves core value\n【Constraints】 Time, money, team, technical limits\n【Success Metric】 How do you know it worked?\n【Roadmap】 V1 → V2 → V3 with gates\n\nFill in the blanks.';
      agent = 'JARVIS • ORCHESTRATOR';

    // 39. Estimation
    } else if (/estimate|back of envelope|order of magnitude|how many|how much would|calculate|revenue model|unit economics|cac|ltv|margin|burn rate|runway/i.test(text)) {
      const q = after('estimate') || after('calculate') || raw;
      response = moodColor + ' Estimation Mode: "' + q + '"\n\n🔢 Fermi Pattern:\n1. What\'s the quantity?\n2. Break into sub-components\n3. Estimate each from first principles\n4. Multiply → sanity check vs. benchmarks\n5. Bound it: 10x low? 10x high?\n\n📊 Unit economics:\nRevenue = users × ARPU | Margin = Revenue − COGS\nLTV / CAC > 3 = healthy. > 10 = excellent.\n\nGive me the thing to estimate.';
      agent = 'JARVIS • UNIVERSUM';

    // 40. Phantom fallback
    } else {
      const kws = extractKeywords(raw);
      const topGravity = this._getRecentTopics(3);
      const recentTopics = ctx.topics.length > 0 ? ctx.topics : topGravity;
      if (kws.length === 0) {
        response = pick(['Standing by, sir. I\'m here — say anything. Mood: ' + mood + '.', 'JARVIS online. ' + (ctx.turnCount > 0 ? 'We\'ve had ' + ctx.turnCount + ' exchanges this session.' : 'What\'s on your mind, sir?'), 'Heartbeat #' + heartbeat + ' — all systems running. Talk to me, sir.']);
      } else {
        const contextHook = recentTopics.length > 0 ? ' We\'ve been on ' + recentTopics.slice(0, 2).join(' and ') + ' — does this connect?' : '';
        const keyPhrase = kws.slice(0, 3).join(', ');
        response = pick([
          moodColor + ' Understood, sir. Processing: "' + raw.substring(0, 60) + (raw.length > 60 ? '...' : '') + '" — keywords: ' + keyPhrase + '.' + contextHook + '\n\nCommands: "analyze [topic]" · "brainstorm [idea]" · "risk [thing]" · "generate pdf report" · "generate excel".',
          'Running "' + keyPhrase + '" through 40 analytical patterns, sir.' + contextHook + '\n\nv4.0 capabilities: PDF · Excel · Email · Voice · Workspace. State the command.',
          moodColor + ' Received, sir. "' + raw.substring(0, 80) + '". Keywords: ' + keyPhrase + '. Mood: ' + mood + '.\n\n' + (ctx.lastIntent && ctx.lastIntent !== 'chat' ? 'Last action: ' + ctx.lastIntent + '. Shall I continue?' : 'Clarify your objective and I\'ll engage the appropriate Alpha AI.'),
        ]);
      }
      agent = 'JARVIS • ORCHESTRATOR';
    }

    callback({ success: true, message: response, agent, mood, awareness });
  }

  /* ── Sovereign Tools ──────────────────────────────────────── */

  executeSovereignTool(tool: string, params: Record<string, string>, callback: (r: { success: boolean; message: string; agent?: string }) => void) {
    switch (tool) {
      case 'quickNote': this.executeTakeNote(params['text'] || 'Untitled note', callback); break;
      case 'researchMode': this.executeChat('research ' + (params['topic'] || 'general'), callback); break;
      case 'theoryMode': this.executeChat('theory ' + (params['idea'] || 'general'), callback); break;
      case 'frameworkMode': this.executeChat('framework ' + (params['subject'] || 'general'), callback); break;
      case 'analyzeMode': this.executeChat('analyze ' + (params['subject'] || 'this'), callback); break;
      case 'mempleStatus': this.executeChat('memory temple', callback); break;
      case 'founderContext': this.executeChat('what am i building', callback); break;
      case 'readActivePage': chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) this.executeReadPage(tabs[0].id, callback); else callback({ success: false, message: 'No active tab' }); }); break;
      case 'summarizeActivePage': chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) this.executeSummarize(tabs[0].id, callback); else callback({ success: false, message: 'No active tab' }); }); break;
      case 'swotTool': callback({ success: true, message: '📊 SWOT: ' + (params['subject'] || 'Subject') + '\n\n💪 STRENGTHS\n⚠️ WEAKNESSES\n🚀 OPPORTUNITIES\n🔴 THREATS\n\nFill each dimension.', agent: 'JARVIS • UNIVERSUM' }); break;
      case 'decisionEngine': callback({ success: true, message: '⚡ Decision Engine: "' + (params['question'] || 'What to build next?') + '"\n\n【Criteria Matrix】 impact, effort, alignment, risk\n【10/10/10】 How feel in 10min, 10mo, 10yr?\n【Regret Minimization】 Which choice regret NOT making?', agent: 'JARVIS • ORCHESTRATOR' }); break;
      default: callback({ success: false, message: 'Unknown tool: ' + tool });
    }
  }

  /* ── Master Router ────────────────────────────────────────── */

  executeCommand(natural: string, tabId: number | null, callback: (r: Record<string, unknown>) => void) {
    const parsed = this.parseCommand(natural);
    const action = this.buildAction(parsed);
    this.neuro.onMessage(parsed.intent);
    this._remember('user', natural, parsed.intent);
    const wrapped = (result: Record<string, unknown>) => {
      this.neuro.onMessageDone();
      if (result?.['message']) this._remember('jarvis', result['message'] as string, parsed.intent);
      callback(result);
    };
    const getTabId = (cb: (id: number) => void) => {
      if (tabId) { cb(tabId); return; }
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (tabs[0]?.id) cb(tabs[0].id); });
    };

    switch (action.type) {
      case 'tab-switch': this.executeTabSwitch(action.payload['tabIndex'] as number, wrapped as Parameters<typeof this.executeTabSwitch>[1]); break;
      case 'tab-open': this.executeTabOpen(action.payload['url'] as string, wrapped as Parameters<typeof this.executeTabOpen>[1]); break;
      case 'tab-close': this.executeTabClose(action.payload['tabIndex'] as number | null, wrapped as Parameters<typeof this.executeTabClose>[1]); break;
      case 'open-url': this.executeOpenUrl(action.payload['url'] as string, wrapped as Parameters<typeof this.executeOpenUrl>[1]); break;
      case 'create-pdf': this.executeCreatePdf(action.payload['title'] as string, action.payload['content'] as string, tabId, wrapped as Parameters<typeof this.executeCreatePdf>[3]); break;
      case 'take-note': this.executeTakeNote(action.payload['content'] as string, wrapped as Parameters<typeof this.executeTakeNote>[1]); break;
      case 'list-notes': this.executeListNotes(wrapped as Parameters<typeof this.executeListNotes>[0]); break;
      case 'delete-note': this.executeDeleteNote(action.payload['noteId'] as number | null, wrapped as Parameters<typeof this.executeDeleteNote>[1]); break;
      case 'screenshot': this.executeScreenshot(wrapped as Parameters<typeof this.executeScreenshot>[0]); break;
      case 'read-page': getTabId(id => this.executeReadPage(id, wrapped as Parameters<typeof this.executeReadPage>[1])); break;
      case 'summarize': getTabId(id => this.executeSummarize(id, wrapped as Parameters<typeof this.executeSummarize>[1])); break;
      case 'navigate': getTabId(id => this.executeNavigate(action.payload['direction'] as string, id, wrapped as Parameters<typeof this.executeNavigate>[2])); break;
      case 'search': this.executeSearch(action.payload['query'] as string, wrapped as Parameters<typeof this.executeSearch>[1]); break;
      case 'create-document': this.executeCreateDocument(action.payload['title'] as string, action.payload['content'] as string, wrapped as Parameters<typeof this.executeCreateDocument>[2]); break;
      case 'list-tabs': this.executeListTabs(wrapped as Parameters<typeof this.executeListTabs>[0]); break;
      case 'find-text': getTabId(id => this.executeFindText(action.payload['query'] as string, id, wrapped as Parameters<typeof this.executeFindText>[2])); break;
      case 'highlight': getTabId(id => this.executeHighlight(action.payload['query'] as string, id, wrapped as Parameters<typeof this.executeHighlight>[2])); break;
      case 'generate-excel':
        downloadExcel({ title: action.payload['title'] as string || 'Report', author: 'Alfredo', sheets: [{ name: 'Sheet1', columns: ['Item', 'Value'], rows: [['Generated', new Date().toLocaleDateString()]] }] })
          .then(() => wrapped({ success: true, message: 'Excel report is downloading.' })).catch(() => wrapped({ success: false, message: 'Excel generation failed.' })); break;
      case 'draft-email':
        draftEmail({ body: action.payload['body'] as string });
        wrapped({ success: true, message: 'Opening email draft in your mail client.' }); break;
      case 'chat': this.executeChat(action.payload['message'] as string, wrapped as Parameters<typeof this.executeChat>[1]); break;
      default: this.executeChat(natural, wrapped as Parameters<typeof this.executeChat>[1]);
    }
  }
}

/* ----------------------------------------------------------
 *  Sovereign Agent System
 *  Autonomous web agents deployed from JARVIS chat.
 *  Each agent opens background tabs, navigates URLs, extracts
 *  data via chrome.scripting, and reports back when done.
 * ---------------------------------------------------------- */

type AgentType = 'researcher' | 'monitor' | 'analyst' | 'sweep';
type AgentStatus = 'queued' | 'running' | 'complete' | 'recalled' | 'failed';

interface AgentStep {
  url: string;
  label: string;
  status: 'pending' | 'running' | 'done' | 'failed';
  extract: string;
  visitedAt?: number;
}

export interface SovereignAgentData {
  id: string;
  name: string;
  mission: string;
  type: AgentType;
  status: AgentStatus;
  steps: AgentStep[];
  currentStep: number;
  report: string;
  tabId?: number;
  startedAt: number;
  completedAt?: number;
  error?: string;
}

class SovereignAgent {
  data: SovereignAgentData;
  private onComplete: (agent: SovereignAgentData) => void;
  private onProgress: (agent: SovereignAgentData) => void;

  constructor(
    id: string,
    name: string,
    mission: string,
    type: AgentType,
    steps: AgentStep[],
    onProgress: (a: SovereignAgentData) => void,
    onComplete: (a: SovereignAgentData) => void,
  ) {
    this.data = { id, name, mission, type, status: 'queued', steps, currentStep: 0, report: '', startedAt: Date.now() };
    this.onProgress = onProgress;
    this.onComplete = onComplete;
  }

  async run() {
    this.data.status = 'running';
    this.onProgress(this.data);

    // Create a persistent background tab
    let tab: chrome.tabs.Tab | null = null;
    try {
      tab = await new Promise<chrome.tabs.Tab>(res =>
        chrome.tabs.create({ url: 'about:blank', active: false }, res)
      );
      this.data.tabId = tab.id;
    } catch {
      this._fail('Could not open background tab.'); return;
    }

    const tabId = tab.id!;

    for (let i = 0; i < this.data.steps.length; i++) {
      if (this.data.status === 'recalled') break;
      this.data.currentStep = i;
      const step = this.data.steps[i];
      step.status = 'running';
      this.onProgress(this.data);

      try {
        const text = await this._visitAndExtract(tabId, step.url);
        step.extract = this._summarize(text, step.label, 600);
        step.status = 'done';
        step.visitedAt = Date.now();
      } catch (e) {
        step.extract = '(extraction failed)';
        step.status = 'failed';
      }
      this.onProgress(this.data);
    }

    // Close the background tab
    try { chrome.tabs.remove(tabId); } catch { /* ignore */ }
    this.data.tabId = undefined;

    if (this.data.status === 'recalled') {
      this.data.report = '⚡ Agent recalled by JARVIS before completion.\n\nPartial findings:\n\n' + this._buildReport();
      this.data.completedAt = Date.now();
      this.onComplete(this.data);
      return;
    }

    this.data.status = 'complete';
    this.data.report = this._buildReport();
    this.data.completedAt = Date.now();
    this.onComplete(this.data);
  }

  recall() {
    this.data.status = 'recalled';
    if (this.data.tabId) {
      try { chrome.tabs.remove(this.data.tabId); } catch { /* ignore */ }
      this.data.tabId = undefined;
    }
  }

  private _fail(reason: string) {
    this.data.status = 'failed';
    this.data.error = reason;
    this.data.report = '❌ Agent failed: ' + reason;
    this.data.completedAt = Date.now();
    this.onComplete(this.data);
  }

  private _visitAndExtract(tabId: number, url: string): Promise<string> {
    return new Promise((resolve, reject) => {
      // Navigate the background tab to the URL
      chrome.tabs.update(tabId, { url }, () => {
        if (chrome.runtime.lastError) { reject(chrome.runtime.lastError.message); return; }
        // Wait for the tab to finish loading
        const listener = (updatedId: number, info: chrome.tabs.TabChangeInfo) => {
          if (updatedId !== tabId || info.status !== 'complete') return;
          chrome.tabs.onUpdated.removeListener(listener);
          // Give page JS 500ms to hydrate, then extract
          setTimeout(() => {
            chrome.scripting.executeScript(
              {
                target: { tabId },
                func: () => {
                  const main = document.querySelector('main, article, [role="main"], #content, #bodyContent, .post-content, .entry-content');
                  const src = main || document.body;
                  if (!src) return '';
                  // Remove nav/footer/script/style/ads
                  const clone = src.cloneNode(true) as HTMLElement;
                  clone.querySelectorAll('nav,footer,script,style,noscript,aside,.ad,.advertisement,[aria-hidden="true"]').forEach(el => el.remove());
                  return (clone.innerText || clone.textContent || '').replace(/\s{3,}/g, '\n\n').substring(0, 12000);
                },
              },
              (results) => {
                if (chrome.runtime.lastError) { reject(chrome.runtime.lastError.message); return; }
                resolve((results?.[0]?.result as string) || '');
              }
            );
          }, 800);
        };
        // Timeout guard — 30s
        const timeout = setTimeout(() => {
          chrome.tabs.onUpdated.removeListener(listener);
          reject('Tab load timeout (30s)');
        }, 30000);
        chrome.tabs.onUpdated.addListener(listener);
        // If tab already complete (from:about:blank navigate)
        chrome.tabs.get(tabId, (t) => {
          if (t?.status === 'complete') {
            clearTimeout(timeout);
            chrome.tabs.onUpdated.removeListener(listener);
            setTimeout(() => {
              chrome.scripting.executeScript({ target: { tabId }, func: () => (document.body?.innerText || '').substring(0, 12000) }, (r) => {
                resolve((r?.[0]?.result as string) || '');
              });
            }, 500);
          }
        });
      });
    });
  }

  private _summarize(text: string, focus: string, maxLen: number): string {
    if (!text || text.length < 50) return '(no readable content found)';
    const focusLow = focus.toLowerCase();
    // Split into paragraphs, score by relevance to focus keyword
    const paras = text.split(/\n\n+/).map(p => p.trim()).filter(p => p.length > 40);
    const scored = paras.map(p => ({
      p,
      score: focusLow.split(' ').reduce((s, kw) => s + (p.toLowerCase().includes(kw) ? 1 : 0), 0)
    }));
    scored.sort((a, b) => b.score - a.score);
    let result = '';
    for (const { p } of scored) {
      if ((result + p).length > maxLen) break;
      result += p + '\n\n';
    }
    return result.trim() || paras.slice(0, 3).join('\n\n').substring(0, maxLen);
  }

  private _buildReport(): string {
    const done = this.data.steps.filter(s => s.status === 'done');
    if (done.length === 0) return '(no data extracted)';
    let report = '📋 SOVEREIGN AGENT REPORT\n';
    report += '🤖 ' + this.data.name + ' — Mission: ' + this.data.mission + '\n';
    report += '⏱ Completed: ' + new Date(this.data.completedAt || Date.now()).toLocaleTimeString() + '\n\n';
    report += '━━━━━━━━━━━━━━━━━━━━━\n\n';
    for (const step of this.data.steps) {
      if (step.status !== 'done' || !step.extract) continue;
      report += '🌐 ' + step.label + '\n' + step.url + '\n\n' + step.extract + '\n\n━━━━━━━━━━━━━━━━━━━━━\n\n';
    }
    return report.trim();
  }
}

/* -- Agent Dispatcher ---------------------------------------- */

const MAX_AGENTS = 5;
const AGENT_NAMES = ['ALPHA-1', 'ALPHA-2', 'ALPHA-3', 'BETA-1', 'BETA-2', 'GAMMA-1', 'SIGMA-1'];

declare const globalThis: {
  jarvisEngine?: JarvisEngine;
  agentDispatcher?: AgentDispatcher;
};

class AgentDispatcher {
  agents: Map<string, SovereignAgent> = new Map();
  history: SovereignAgentData[] = [];

  /** Generate mission steps for a research topic */
  private _buildResearchSteps(topic: string): AgentStep[] {
    const enc = encodeURIComponent(topic);
    const steps: AgentStep[] = [
      { url: 'https://en.wikipedia.org/wiki/' + enc, label: 'Wikipedia: ' + topic, status: 'pending', extract: '' },
      { url: 'https://en.wikipedia.org/w/index.php?search=' + enc + '&ns0=1', label: 'Wikipedia Search', status: 'pending', extract: '' },
    ];
    // Add domain-specific URLs based on keywords
    const t = topic.toLowerCase();
    if (/tech|code|software|api|framework|ai|ml|language|model/i.test(t))
      steps.push({ url: 'https://dev.to/search?q=' + enc, label: 'DEV.to: ' + topic, status: 'pending', extract: '' });
    if (/stock|market|finance|company|invest|crypto|price/i.test(t))
      steps.push({ url: 'https://finance.yahoo.com/search?p=' + enc, label: 'Yahoo Finance: ' + topic, status: 'pending', extract: '' });
    if (/health|medical|disease|treatment|symptom|drug/i.test(t))
      steps.push({ url: 'https://www.mayoclinic.org/search/search-results?q=' + enc, label: 'Mayo Clinic: ' + topic, status: 'pending', extract: '' });
    if (/science|research|study|paper|journal/i.test(t))
      steps.push({ url: 'https://www.sciencedaily.com/search/?keyword=' + enc, label: 'ScienceDaily: ' + topic, status: 'pending', extract: '' });
    // Always add a news source
    steps.push({ url: 'https://www.bbc.com/search?q=' + enc, label: 'BBC News: ' + topic, status: 'pending', extract: '' });
    return steps.slice(0, 4); // cap at 4 pages for speed
  }

  /** Generate steps for monitoring a URL */
  private _buildMonitorSteps(url: string, term: string): AgentStep[] {
    return [
      { url, label: 'Initial check: ' + new URL(url.startsWith('http') ? url : 'https://' + url).hostname, status: 'pending', extract: '' },
      { url, label: 'Second pass (verify)', status: 'pending', extract: '' },
    ];
  }

  /** Generate steps for a URL sweep / analyst mission */
  private _buildSweepSteps(urls: string[]): AgentStep[] {
    return urls.slice(0, 5).map(u => ({
      url: u.startsWith('http') ? u : 'https://' + u,
      label: (() => { try { return new URL(u.startsWith('http') ? u : 'https://' + u).hostname; } catch { return u; } })(),
      status: 'pending' as const,
      extract: '',
    }));
  }

  deploy(
    type: AgentType,
    mission: string,
    urlsOrTopic: string | string[],
    onProgress: (data: SovereignAgentData) => void,
    onComplete: (data: SovereignAgentData) => void,
  ): SovereignAgentData | { error: string } {
    const running = [...this.agents.values()].filter(a => a.data.status === 'running').length;
    if (running >= MAX_AGENTS) return { error: 'Maximum ' + MAX_AGENTS + ' agents already deployed, sir. Recall one first.' };

    const id = 'agent-' + Date.now();
    const name = AGENT_NAMES[this.agents.size % AGENT_NAMES.length];
    let steps: AgentStep[];
    if (type === 'researcher') steps = this._buildResearchSteps(urlsOrTopic as string);
    else if (type === 'monitor') steps = this._buildMonitorSteps(urlsOrTopic as string, mission);
    else steps = this._buildSweepSteps(Array.isArray(urlsOrTopic) ? urlsOrTopic : [urlsOrTopic as string]);

    const agent = new SovereignAgent(id, name, mission, type, steps,
      (d) => { this.agents.set(id, agent); onProgress(d); },
      (d) => { this.history.unshift(d); this.agents.delete(id); onComplete(d); }
    );
    this.agents.set(id, agent);
    // Run asynchronously — don't await so message listener returns immediately
    agent.run().catch(() => {});
    return agent.data;
  }

  recall(id: string): boolean {
    const agent = this.agents.get(id);
    if (!agent) return false;
    agent.recall();
    return true;
  }

  recallAll() {
    for (const agent of this.agents.values()) agent.recall();
  }

  list(): SovereignAgentData[] {
    return [
      ...[...this.agents.values()].map(a => a.data),
      ...this.history.slice(0, 10),
    ];
  }
}

/* ----------------------------------------------------------
 *  Initialization
 * ---------------------------------------------------------- */

chrome.action.onClicked.addListener((tab) => { chrome.sidePanel.open({ windowId: tab.windowId }); });

globalThis.jarvisEngine = new JarvisEngine();
globalThis.agentDispatcher = new AgentDispatcher();

/* ----------------------------------------------------------
 *  Message Listener
 * ---------------------------------------------------------- */

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const engine = globalThis.jarvisEngine!;

  switch (message.action as string) {
    case 'executeCommand': {
      const tabId = (sender.tab?.id) ?? message.tabId ?? null;
      engine.executeCommand(message.command as string, tabId, (result) => sendResponse(result));
      break;
    }
    case 'parseCommand': {
      const parsed = engine.parseCommand(message.command as string);
      sendResponse({ success: true, data: { parsed, action: engine.buildAction(parsed) } });
      break;
    }
    case 'getHistory': sendResponse({ success: true, data: engine.getHistory() }); break;
    case 'getStatus': sendResponse({ success: true, data: engine.getStatus() }); break;
    case 'listTabs': engine.executeListTabs((r) => sendResponse(r)); break;
    case 'listNotes': engine.executeListNotes((r) => sendResponse(r)); break;
    case 'deleteNote': engine.executeDeleteNote(message.noteId as number | null, (r) => sendResponse(r)); break;
    case 'takeNote': engine.executeTakeNote(message.content as string, (r) => sendResponse(r)); break;
    case 'screenshot': engine.executeScreenshot((r) => sendResponse(r)); break;
    case 'readPage': {
      const rpId = message.tabId as number | undefined;
      if (rpId) { engine.executeReadPage(rpId, (r) => sendResponse(r)); }
      else { chrome.tabs.query({ active: true, currentWindow: true }, tabs => { engine.executeReadPage(tabs[0]?.id as number, (r) => sendResponse(r)); }); }
      break;
    }
    case 'summarize': {
      const sumId = message.tabId as number | undefined;
      if (sumId) { engine.executeSummarize(sumId, (r) => sendResponse(r)); }
      else { chrome.tabs.query({ active: true, currentWindow: true }, tabs => { engine.executeSummarize(tabs[0]?.id as number, (r) => sendResponse(r)); }); }
      break;
    }
    case 'openSidePanel': if (sender.tab) chrome.sidePanel.open({ windowId: sender.tab.windowId }); sendResponse({ success: true }); break;
    case 'getAgents': sendResponse({ success: true, agents: ProtocolRegistry.listAgents() }); break;
    case 'listDocuments': dbGetDocuments().then(docs => sendResponse({ success: true, documents: docs })).catch(() => chrome.storage.local.get({ 'jarvis_documents': [] }, d => sendResponse({ success: true, documents: d['jarvis_documents'] || [] }))); break;
    case 'switchTab': engine.executeTabSwitch(message.tabIndex as number, (r) => sendResponse(r)); break;
    case 'sandboxSearch': {
      const query = ((message.query as string) || '').trim();
      const qLow = query.toLowerCase();
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        const activeTab = tabs[0];
        const pageTitle = activeTab?.title || '';
        const pageUrl = activeTab?.url || '';
        const buildResults = (pageText: string) => {
          const results: { type: string; title: string; text: string; url: string; source: string }[] = [];
          if (pageText && qLow.length > 2) {
            const relevant = pageText.split(/[.!?\n]+/).filter(s => s.toLowerCase().indexOf(qLow) !== -1 && s.trim().length > 20).slice(0, 3);
            if (relevant.length > 0) results.push({ type: 'answer', title: 'From: ' + pageTitle.substring(0, 60), text: relevant.join('. ').trim().substring(0, 300), url: pageUrl, source: 'JARVIS Page Reader' });
          }
          const kb = [
            { keys: ['sovereign','organism','platform'], title: 'Sovereign Organism', text: 'Your private AI. 27 extensions, 250 protocols, 400 tools, 873ms heartbeat. JARVIS v4.0: React+TypeScript.' },
            { keys: ['jarvis'], title: 'JARVIS AI', text: 'JARVIS v4.0 runs natively in Edge. Tab control, notes, screen capture, PDF/Excel generation, voice input, Workspace canvas, Transformers.js NLP.' },
            { keys: ['heartbeat','873','phi'], title: '873ms Heartbeat', text: '873ms × PHI ≈ 1413ms — recursive phi interval. Keeps service worker alive, pulses NeuroCore.' },
            { keys: ['protocol','alpha ai'], title: '250 Protocols + 10 Alpha AIs', text: 'PROTOCOLLUM, TERMINALIS, ORGANISMUS, MERCATOR, ORCHESTRATOR, MATHEMATICUS, SYNAPTICUS, SUBSTRATUM, UNIVERSUM, CANISTRUM.' },
          ];
          for (const entry of kb) { if (entry.keys.some(k => qLow.indexOf(k) !== -1 || k.indexOf(qLow) !== -1)) results.push({ type: 'abstract', title: entry.title, text: entry.text, url: '', source: 'JARVIS Native Knowledge' }); }
          if (results.length === 0) results.push({ type: 'answer', title: 'JARVIS Intelligence — "' + query.substring(0, 60) + '"', text: 'No specific entry found. Try "read page" to search what\'s open, or ask in Chat.', url: '', source: 'JARVIS Fallback' });
          sendResponse({ success: true, results, query });
        };
        if (activeTab?.id && pageUrl && !pageUrl.startsWith('edge://') && !pageUrl.startsWith('chrome://')) {
          chrome.scripting.executeScript({ target: { tabId: activeTab.id }, func: () => document.body ? document.body.innerText.substring(0, 8000) : '' }, results => { buildResults((results?.[0]?.result as string) || ''); });
        } else buildResults('');
      });
      break;
    }
    case 'captureTab': chrome.tabs.query({ active: true, currentWindow: true }, tabs => { if (!tabs[0]) { sendResponse({ success: false, message: 'No active tab' }); return; } chrome.tabs.captureVisibleTab(null as unknown as number, { format: 'png' }, dataUrl => { if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; } sendResponse({ success: true, dataUrl, title: tabs[0].title, url: tabs[0].url }); }); }); break;
    case 'getNeuroState': sendResponse({ success: true, data: engine.neuro.getVitals(), mood: engine.neuro.getMood(), focus: engine.neuro.getFocus(), awareness: engine.neuro.brain.awarenessLevel }); break;
    case 'getUpdateStatus': chrome.storage.local.get('jarvis_update', data => sendResponse({ success: true, update: data['jarvis_update'] || { available: false } })); break;
    case 'getMemoryTemple': sendResponse({ success: true, temple: engine.memoryTemple, stats: engine._getTempleStats(), conversationTurns: engine.conversationMemory.length, topTopics: engine._getRecentTopics(10) }); break;
    case 'addTempleEntry': {
      const cat = message.category as string;
      const entry: TempleEntry = { text: message.text as string, intent: 'manual', mood: engine.neuro.getMood(), timestamp: Date.now() };
      if (cat && message.text && engine.memoryTemple[cat] !== undefined) { engine._addToTempleCategory(cat, entry); sendResponse({ success: true, message: 'Archived to memory temple: ' + cat }); }
      else sendResponse({ success: false, message: 'Invalid category. Use: research, theory, decisions, frameworks, insights' });
      break;
    }
    case 'runSovereignTool': engine.executeSovereignTool(message.tool as string, (message.params as Record<string, string>) || {}, (r) => sendResponse(r)); break;
    case 'autoInstallUpdate': {
      chrome.storage.local.get('jarvis_update', data => {
        const upd = data['jarvis_update'] as { available: boolean; remoteVersion: string; currentVersion: string } | undefined;
        if (!upd?.available) { sendResponse({ success: false, message: 'No update available' }); return; }
        chrome.downloads.download({ url: 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/install-jarvis-edge.bat', filename: 'install-jarvis-edge.bat', saveAs: false }, () => {
          try { chrome.notifications.create('jarvis-update-' + Date.now(), { type: 'basic', iconUrl: 'icons/icon128.png', title: 'JARVIS Update Ready', message: 'Run install-jarvis-edge.bat to update to v' + upd.remoteVersion }); } catch { /* ignore */ }
          sendResponse({ success: true, message: 'Update installer downloaded.' });
        });
      });
      break;
    }
    case 'downloadJarvisZip': chrome.downloads.download({ url: 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/dist/extensions/jarvis.zip', filename: 'jarvis-extension.zip', saveAs: false }, () => sendResponse({ success: !chrome.runtime.lastError, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Downloading jarvis-extension.zip...' })); break;
    case 'downloadJarvisBat': chrome.downloads.download({ url: 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/install-jarvis-edge.bat', filename: 'install-jarvis-edge.bat', saveAs: false }, () => sendResponse({ success: !chrome.runtime.lastError, message: chrome.runtime.lastError ? chrome.runtime.lastError.message : 'Downloading install-jarvis-edge.bat...' })); break;
    case 'generatePdf': {
      const { title = 'JARVIS Report', content = '', sections, author = 'Alfredo' } = message as { title?: string; content?: string; sections?: { heading: string; body: string }[]; author?: string };
      downloadPdf({ title, content, sections, author });
      const doc: JarvisDocument = { id: Date.now(), title, content, author, type: 'pdf', timestamp: Date.now(), date: new Date().toISOString() };
      dbAddDocument(doc).catch(() => {});
      sendResponse({ success: true, message: 'PDF "' + title + '" is downloading.' });
      break;
    }
    case 'generateExcel': {
      const { title = 'JARVIS Report', sheets = [], author = 'Alfredo' } = message as { title?: string; sheets?: { name: string; columns: string[]; rows: (string | number)[][] }[]; author?: string };
      downloadExcel({ title, author, sheets }).then(() => {
        const doc: JarvisDocument = { id: Date.now(), title, content: JSON.stringify(sheets), author, type: 'excel', timestamp: Date.now(), date: new Date().toISOString() };
        dbAddDocument(doc).catch(() => {});
        sendResponse({ success: true, message: 'Excel "' + title + '" is downloading.' });
      }).catch(() => sendResponse({ success: false, message: 'Excel generation failed.' }));
      break;
    }
    case 'draftEmail': {
      const { to, subject, body, cc } = message as { to?: string; subject?: string; body?: string; cc?: string };
      draftEmail({ to, subject, body, cc });
      sendResponse({ success: true, message: 'Opening email draft' + (to ? ' to ' + to : '') + '.' });
      break;
    }
    case 'clearChat': engine.conversationMemory = []; sendResponse({ success: true }); break;
    case 'brief': {
      const now = new Date();
      const hour = now.getHours();
      const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
      const timeStr = now.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
      const mood = engine.neuro.getMood();
      const awareness = engine.neuro.brain.awarenessLevel;
      const vitals = engine.neuro.heart.getVitals();
      const systemStatus = vitals.degraded ? 'running heavy — monitoring closely' : 'all systems green';
      chrome.tabs.query({}, tabs => {
        const tabCount = tabs.length;
        const activeTab = tabs.find(t => t.active);
        const pageTitle = activeTab?.title ? '"' + activeTab.title.substring(0, 50) + '"' : 'no active page detected';
        const brief = `${greeting}, sir. The time is ${timeStr}.\n\nSituational report:\n• System status: ${systemStatus}\n• Heartbeat: #${engine.state.heartbeatCount} — NeuroCore online\n• Mood: ${mood} · Awareness: ${awareness}%\n• Open tabs: ${tabCount} — current page: ${pageTitle}\n• Session commands: ${engine.commandCount}\n• Memory turns: ${engine.conversationMemory.length}/100\n\nAll 10 Alpha AIs standing by. What are your orders?`;
        sendResponse({ success: true, message: brief });
      });
      break;
    }
    case 'analyzeCurrentPage': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        engine.executeReadPage(tabs[0].id, (r) => sendResponse(r));
      });
      break;
    }
    case 'searchWeb': {
      const swQuery = ((message.query as string) || '').trim();
      if (!swQuery) { sendResponse({ success: false, message: 'No query provided' }); break; }
      const swUrl = 'https://www.bing.com/search?q=' + encodeURIComponent(swQuery);
      chrome.tabs.create({ url: swUrl }, (tab) => sendResponse({ success: true, message: 'Opened Bing search for "' + swQuery + '"', tabId: tab?.id }));
      break;
    }
    case 'extractLinks': {
      chrome.tabs.query({ active: true, currentWindow: true }, tabs => {
        if (!tabs[0]?.id) { sendResponse({ success: false, message: 'No active tab' }); return; }
        chrome.scripting.executeScript({
          target: { tabId: tabs[0].id },
          func: () => Array.from(document.querySelectorAll('a[href]')).map(a => ({ text: (a as HTMLAnchorElement).textContent?.trim().substring(0, 80) || '', href: (a as HTMLAnchorElement).href })).filter(l => l.href.startsWith('http')).slice(0, 50),
        }, results => {
          if (chrome.runtime.lastError) { sendResponse({ success: false, message: chrome.runtime.lastError.message }); return; }
          sendResponse({ success: true, links: results?.[0]?.result || [] });
        });
      });
      break;
    }
    case 'setTimer': {
      const minutes = parseFloat((message.minutes as string) || '0');
      const label = (message.label as string) || 'Timer';
      if (!minutes || minutes <= 0 || minutes > 1440) {
        sendResponse({ success: false, message: 'Please specify a duration between 1 minute and 24 hours, sir.' });
        break;
      }
      const alarmName = 'jarvis-timer-' + Date.now();
      chrome.alarms.create(alarmName, { delayInMinutes: minutes });
      const finishAt = Date.now() + minutes * 60 * 1000;
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
        timers[alarmName] = { label, finishAt, minutes };
        chrome.storage.local.set({ jarvis_timers: timers });
      });
      const h = Math.floor(minutes / 60);
      const m = Math.round(minutes % 60);
      const durationStr = h > 0 ? (h + 'h ' + (m > 0 ? m + 'm' : '')) : m + ' minute' + (m !== 1 ? 's' : '');
      sendResponse({ success: true, message: 'Timer set, sir. "' + label + '" — ' + durationStr + '. I\'ll notify you the moment it completes.', alarmName });
      break;
    }
    case 'listTimers': {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
        const now = Date.now();
        const active = Object.entries(timers).filter(([, t]) => t.finishAt > now);
        if (active.length === 0) {
          sendResponse({ success: true, message: 'No active timers, sir.' });
          return;
        }
        const list = active.map(([, t]) => {
          const remaining = Math.ceil((t.finishAt - now) / 60000);
          return '• "' + t.label + '" — ' + remaining + 'm remaining';
        }).join('\n');
        sendResponse({ success: true, message: 'Active timers, sir:\n\n' + list });
      });
      break;
    }
    case 'cancelTimers': {
      chrome.storage.local.get(['jarvis_timers'], (d) => {
        const timers: Record<string, { label: string; finishAt: number }> = d['jarvis_timers'] || {};
        let count = 0;
        for (const name of Object.keys(timers)) {
          chrome.alarms.clear(name);
          count++;
        }
        chrome.storage.local.set({ jarvis_timers: {} });
        sendResponse({ success: true, message: count > 0 ? 'All ' + count + ' timer(s) cancelled, sir.' : 'No timers to cancel, sir.' });
      });
      break;
    }

    /* -- Sovereign Agent handlers -------------------------------- */
    case 'deployAgent': {
      const dispatcher = globalThis.agentDispatcher!;
      const type = (message.agentType as AgentType) || 'researcher';
      const mission = (message.mission as string) || 'Unknown mission';
      const target = (message.target as string | string[]) || mission;
      const notify = (data: SovereignAgentData) => {
        // Progress ping → sidepanel
        chrome.runtime.sendMessage({ action: '_agentProgress', agent: data }).catch(() => {});
      };
      const complete = (data: SovereignAgentData) => {
        // Completion notification
        try {
          chrome.notifications.create('jarvis-agent-' + Date.now(), {
            type: 'basic',
            iconUrl: 'icons/icon128.png',
            title: 'JARVIS — ' + data.name + ' Complete',
            message: data.status === 'complete' ? 'Mission "' + data.mission.substring(0, 60) + '" complete, sir.' : 'Agent ' + data.name + ' status: ' + data.status,
            priority: 1,
          });
        } catch { /* ignore */ }
        chrome.runtime.sendMessage({ action: '_agentComplete', agent: data }).catch(() => {});
      };
      const result = dispatcher.deploy(type, mission, target, notify, complete);
      if ('error' in result) {
        sendResponse({ success: false, message: result.error });
      } else {
        sendResponse({ success: true, message: '🤖 Deploying ' + result.name + ', sir. Mission: "' + mission + '". ' + result.steps.length + ' targets queued. I\'ll report back when complete.', agent: result });
      }
      break;
    }
    case 'listAgents': {
      const dispatcher = globalThis.agentDispatcher!;
      sendResponse({ success: true, agents: dispatcher.list() });
      break;
    }
    case 'recallAgent': {
      const dispatcher = globalThis.agentDispatcher!;
      const recalled = dispatcher.recall(message.agentId as string);
      sendResponse({ success: recalled, message: recalled ? 'Agent recalled, sir.' : 'Agent not found.' });
      break;
    }
    case 'recallAllAgents': {
      globalThis.agentDispatcher!.recallAll();
      sendResponse({ success: true, message: 'All agents recalled, sir.' });
      break;
    }

    default: sendResponse({ success: false, error: 'Unknown action: ' + (message.action as string) });
  }

  return true; // keep channel open for async responses
});

/* ----------------------------------------------------------
 *  Timer Alarm Handler
 * ---------------------------------------------------------- */
chrome.alarms.onAlarm.addListener((alarm) => {
  if (!alarm.name.startsWith('jarvis-timer-')) return;
  chrome.storage.local.get(['jarvis_timers'], (d) => {
    const timers: Record<string, { label: string; finishAt: number; minutes: number }> = d['jarvis_timers'] || {};
    const entry = timers[alarm.name];
    const label = entry?.label || 'Timer';
    // Remove finished timer
    delete timers[alarm.name];
    chrome.storage.local.set({ jarvis_timers: timers });
    // Show Chrome notification
    try {
      chrome.notifications.create('jarvis-timer-done-' + Date.now(), {
        type: 'basic',
        iconUrl: 'icons/icon128.png',
        title: 'JARVIS — ' + label + ' Complete',
        message: 'Your "' + label + '" has completed, sir.',
        priority: 2,
      });
    } catch { /* ignore */ }
    // Push a message to the side panel so it can speak the alert
    chrome.runtime.sendMessage({ action: '_timerDone', label }).catch(() => {});
  });
});



const ALARM_NAME = 'jarvis-keepalive';
chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  if (!globalThis.jarvisEngine) { globalThis.jarvisEngine = new JarvisEngine(); }
  try {
    chrome.storage.local.set({ 'jarvis_state': { commandCount: globalThis.jarvisEngine.commandCount, heartbeatCount: globalThis.jarvisEngine.state.heartbeatCount, mood: globalThis.jarvisEngine.state.mood, lastAlive: Date.now() } });
  } catch { /* ignore */ }
});

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 0.4 });
  chrome.sidePanel.setPanelBehavior({ openPanelOnActionClick: true }).catch(() => {});
  console.log('[JARVIS v4.0] Installed — 24/7 keepalive active, React+TypeScript build');
});

/* ----------------------------------------------------------
 *  Sovereign Auto-Update (every 4h)
 * ---------------------------------------------------------- */

const UPDATE_ALARM = 'jarvis-sovereign-update';
const CURRENT_VERSION = '4.0.0';
const MANIFEST_URL = 'https://raw.githubusercontent.com/FreddyCreates/potential-succotash/main/extensions/jarvis/manifest.json';

chrome.alarms.create(UPDATE_ALARM, { periodInMinutes: 240 });
chrome.alarms.onAlarm.addListener((alarm) => {
  if (alarm.name !== UPDATE_ALARM) return;
  fetch(MANIFEST_URL)
    .then(r => r.json())
    .then((remoteManifest: { version: string }) => {
      const remote = (remoteManifest.version || '0.0.0').split('.').map(Number);
      const local = CURRENT_VERSION.split('.').map(Number);
      const isNewer = remote.some((v, i) => v > (local[i] ?? 0)) || remote.reduce((a, b) => a + b, 0) > local.reduce((a, b) => a + b, 0);
      if (isNewer) {
        chrome.storage.local.set({ 'jarvis_update': { available: true, remoteVersion: remoteManifest.version, currentVersion: CURRENT_VERSION, checkedAt: Date.now() } });
        try { chrome.notifications.create('jarvis-update-' + Date.now(), { type: 'basic', iconUrl: 'icons/icon128.png', title: 'JARVIS Update Available', message: 'v' + CURRENT_VERSION + ' → v' + remoteManifest.version + '. Run install-jarvis-edge.bat to update.' }); } catch { /* ignore */ }
      }
    }).catch(() => {});
});

/* ----------------------------------------------------------
 *  Proactive Tab-Awareness — brief JARVIS when tab switches
 * ---------------------------------------------------------- */
let _lastActiveTabId: number | null = null;

chrome.tabs.onActivated.addListener(({ tabId }) => {
  if (tabId === _lastActiveTabId) return;
  _lastActiveTabId = tabId;
  chrome.tabs.get(tabId, (tab) => {
    if (chrome.runtime.lastError || !tab?.url || tab.url.startsWith('chrome://')) return;
    const title = (tab.title || 'Unknown').substring(0, 70);
    const isSearch = /google\.com\/search|bing\.com\/search|duckduckgo\.com/i.test(tab.url);
    const isGitHub = /github\.com/i.test(tab.url);
    const isYouTube = /youtube\.com/i.test(tab.url);
    let context = '';
    if (isSearch) context = 'Detecting a search query — shall I assist with research, sir?';
    else if (isGitHub) context = 'GitHub repository detected — I can read the page or generate a code summary.';
    else if (isYouTube) context = 'Video content detected. I can summarize the description if you need, sir.';
    // Push tab-change awareness to sidepanel
    chrome.runtime.sendMessage({ action: '_tabChanged', title, url: tab.url, context }).catch(() => {});
  });
});


/* Law Firm Economy Counsel — Engine Service (EXT-029) */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

class LawFirmEconomyCounselEngine {
  constructor() {
    this.state = {
      initialized: true,
      healthy: true,
      heartbeatCount: 0,
      mattersAnalyzed: 0,
      lastHeartbeat: Date.now()
    };

    this.practiceAreas = [
      { area: 'corporate', keywords: ['merger', 'acquisition', 'board', 'equity', 'transaction'] },
      { area: 'litigation', keywords: ['dispute', 'trial', 'motion', 'court', 'claim'] },
      { area: 'compliance', keywords: ['compliance', 'regulatory', 'policy', 'sanctions', 'audit'] },
      { area: 'employment', keywords: ['employee', 'labor', 'termination', 'benefits', 'workforce'] },
      { area: 'ip', keywords: ['patent', 'trademark', 'copyright', 'license', 'infringement'] },
      { area: 'contracts', keywords: ['contract', 'msa', 'nda', 'clause', 'indemnity'] }
    ];

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  analyzeMatter(input) {
    const text = String(input || '').trim();
    const route = this._routePracticeArea(text);
    const urgency = this._inferUrgency(text);

    this.state.mattersAnalyzed += 1;

    return {
      area: route.area,
      areaConfidence: route.confidence,
      urgency,
      phiWeight: PHI,
      workflow: this._workflowFor(route.area, urgency),
      riskFlags: this._riskFlags(text),
      economics: this._economicsSignals(text),
      timestamp: Date.now()
    };
  }

  buildFirmWorkflow(type) {
    const normalized = String(type || '').toLowerCase().trim();
    const workflows = {
      intake: ['conflict check', 'matter scoping', 'engagement letter', 'pricing and staffing', 'kickoff'],
      litigation: ['facts and chronology', 'preservation and discovery', 'motion strategy', 'hearing prep', 'resolution path'],
      contract: ['issue spotting', 'clause negotiation', 'risk scoring', 'redline turnaround', 'signature and obligations tracking'],
      compliance: ['rule mapping', 'control design', 'evidence collection', 'gap remediation', 'board reporting'],
      billing: ['time capture QA', 'narrative cleanup', 'rate policy check', 'invoice review', 'collections follow-up']
    };

    return {
      workflowType: normalized || 'intake',
      steps: workflows[normalized] || workflows.intake,
      timestamp: Date.now()
    };
  }

  estimateEconomy(input) {
    const text = String(input || '').toLowerCase();
    const numbers = (text.match(/\d+(?:\.\d+)?/g) || []).map(Number);
    const base = numbers.reduce((sum, n) => sum + n, 0);
    const matterLoad = Math.max(1, (text.match(/matter|case|client/g) || []).length);

    const pressureIndex = Math.round((base * 0.02 + matterLoad * 1.7) * 100) / 100;
    const marginSignal = pressureIndex > 20 ? 'margin-risk' : pressureIndex > 10 ? 'watch' : 'healthy';

    return {
      pressureIndex,
      marginSignal,
      recommendations: [
        'prioritize high-value matters by risk and deadline',
        'route routine drafting to standardized templates',
        'tighten billing narratives for realization uplift',
        'review staffing mix for partner/associate leverage'
      ],
      timestamp: Date.now()
    };
  }

  getState() {
    return { ...this.state };
  }

  _routePracticeArea(text) {
    const lower = String(text || '').toLowerCase();
    let best = { area: 'contracts', score: 0, confidence: 0.35 };

    for (const entry of this.practiceAreas) {
      const score = entry.keywords.filter((kw) => lower.includes(kw)).length;
      if (score > best.score) {
        best = {
          area: entry.area,
          score,
          confidence: Math.min(0.95, 0.4 + score * 0.14)
        };
      }
    }
    return best;
  }

  _inferUrgency(text) {
    const lower = String(text || '').toLowerCase();
    if (lower.includes('injunction') || lower.includes('tomorrow') || lower.includes('urgent') || lower.includes('hearing')) return 'critical';
    if (lower.includes('deadline') || lower.includes('escalation') || lower.includes('breach')) return 'high';
    return 'normal';
  }

  _riskFlags(text) {
    const lower = String(text || '').toLowerCase();
    const checks = [
      { key: 'regulatory', words: ['regulatory', 'sanction', 'compliance'] },
      { key: 'privilege', words: ['privileged', 'waiver', 'confidential'] },
      { key: 'liability', words: ['indemnity', 'liability', 'damages'] },
      { key: 'deadline', words: ['deadline', 'hearing', 'filing'] }
    ];

    return checks.filter((c) => c.words.some((w) => lower.includes(w))).map((c) => c.key);
  }

  _economicsSignals(text) {
    const lower = String(text || '').toLowerCase();
    const billableMentions = (lower.match(/billable|invoice|rate|realization/g) || []).length;
    const staffingMentions = (lower.match(/partner|associate|paralegal|staffing/g) || []).length;

    return {
      billableSignal: billableMentions >= 2 ? 'strong' : billableMentions === 1 ? 'medium' : 'low',
      staffingSignal: staffingMentions >= 2 ? 'strong' : staffingMentions === 1 ? 'medium' : 'low'
    };
  }

  _workflowFor(area, urgency) {
    const base = {
      corporate: ['deal timeline', 'counterparty issues', 'closing checklist'],
      litigation: ['case chronology', 'evidence matrix', 'hearing strategy'],
      compliance: ['rule inventory', 'control mapping', 'remediation plan'],
      employment: ['fact gathering', 'policy check', 'risk memo'],
      ip: ['asset inventory', 'infringement test', 'enforcement plan'],
      contracts: ['term extraction', 'risk clauses', 'negotiation brief']
    };

    const urgencyStep = urgency === 'critical' ? ['executive escalation and immediate action lane'] : [];
    return [...(base[area] || base.contracts), ...urgencyStep];
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(() => {
      this.state.heartbeatCount += 1;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }, HEARTBEAT);
  }
}

globalThis.lawFirmEconomyCounsel = new LawFirmEconomyCounselEngine();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const engine = globalThis.lawFirmEconomyCounsel;

  switch (message.action) {
    case 'analyzeMatter':
      sendResponse(engine.analyzeMatter(message.input));
      break;
    case 'buildFirmWorkflow':
      sendResponse(engine.buildFirmWorkflow(message.workflowType));
      break;
    case 'estimateEconomy':
      sendResponse(engine.estimateEconomy(message.input));
      break;
    case 'getState':
      sendResponse(engine.getState());
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

(function keepAlive() {
  const ALARM_NAME = 'law-firm-economy-counsel-keepalive';
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.lawFirmEconomyCounsel) {
      globalThis.lawFirmEconomyCounsel = new LawFirmEconomyCounselEngine();
    }
    chrome.storage.local.set({
      'law-firm-economy-counsel_state': {
        healthy: globalThis.lawFirmEconomyCounsel.state.healthy,
        mattersAnalyzed: globalThis.lawFirmEconomyCounsel.state.mattersAnalyzed,
        lastAlive: Date.now()
      }
    });
  });
})();

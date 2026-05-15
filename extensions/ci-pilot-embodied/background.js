/* CI Pilot Embodied — Engine Service (EXT-028) */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

class CIPilotEmbodiedEngine {
  constructor() {
    this.providers = ['github-copilot', 'openai', 'anthropic'];
    this.state = {
      initialized: true,
      healthy: true,
      heartbeatCount: 0,
      incidentsAnalyzed: 0,
      lastHeartbeat: Date.now(),
    };

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  embodyCIPilot(input) {
    const normalized = String(input || '').trim();
    const severity = this._inferSeverity(normalized);
    const provider = severity === 'critical' ? 'github-copilot' : 'openai';
    const confidence = severity === 'critical' ? 0.92 : 0.84;

    this.state.incidentsAnalyzed += 1;

    return {
      mode: 'ci-pilot-embodied',
      provider,
      severity,
      confidence,
      phiWeight: PHI,
      recommendations: [
        'Isolate the first failing job and capture root stack trace',
        'Route fix proposal through code + test validation path',
        'Apply minimal patch and rerun impacted test matrix',
        'Gate merge until pipeline is fully green',
      ],
      input: normalized,
      timestamp: Date.now(),
    };
  }

  getPipelinePulse(context) {
    const text = String(context || '').toLowerCase();
    const failingSignals = ['fail', 'error', 'timeout', 'flaky', 'red'];
    const score = failingSignals.reduce((sum, kw) => sum + (text.includes(kw) ? 1 : 0), 0);

    return {
      stability: Math.max(0, 1 - score * 0.2),
      score,
      signal: score >= 2 ? 'degraded' : 'stable',
      timestamp: Date.now(),
    };
  }

  getState() {
    return { ...this.state };
  }

  _inferSeverity(input) {
    const lower = String(input || '').toLowerCase();
    if (lower.includes('production') || lower.includes('incident') || lower.includes('rollback')) {
      return 'critical';
    }
    if (lower.includes('failing') || lower.includes('error') || lower.includes('blocked')) {
      return 'high';
    }
    return 'medium';
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(() => {
      this.state.heartbeatCount += 1;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }, HEARTBEAT);
  }
}

globalThis.ciPilotEmbodied = new CIPilotEmbodiedEngine();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const pilot = globalThis.ciPilotEmbodied;

  switch (message.action) {
    case 'embodyCIPilot':
      sendResponse(pilot.embodyCIPilot(message.input));
      break;
    case 'getPipelinePulse':
      sendResponse(pilot.getPipelinePulse(message.context));
      break;
    case 'getState':
      sendResponse(pilot.getState());
      break;
    default:
      sendResponse({ error: 'Unknown action: ' + message.action });
  }
  return true;
});

(function keepAlive() {
  const ALARM_NAME = 'ci-pilot-embodied-keepalive';
  const ALARM_PERIOD = 1;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.ciPilotEmbodied) {
      globalThis.ciPilotEmbodied = new CIPilotEmbodiedEngine();
    }
    chrome.storage.local.set({
      'ci-pilot-embodied_state': {
        healthy: globalThis.ciPilotEmbodied.state.healthy,
        incidentsAnalyzed: globalThis.ciPilotEmbodied.state.incidentsAnalyzed,
        lastAlive: Date.now(),
      },
    });
  });
})();

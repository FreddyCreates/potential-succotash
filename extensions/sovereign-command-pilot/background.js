/* Sovereign Command Pilot — Engine Service (EXT-027) */

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

class SovereignCommandPilotEngine {
  constructor() {
    this.state = {
      initialized: true,
      heartbeatCount: 0,
      healthy: true,
      plansGenerated: 0,
      lastHeartbeat: Date.now(),
    };

    this.routingProfiles = [
      { profile: 'build', keywords: ['build', 'compile', 'package', 'release'] },
      { profile: 'test', keywords: ['test', 'unit', 'integration', 'validate'] },
      { profile: 'security', keywords: ['security', 'vulnerability', 'audit', 'codeql'] },
      { profile: 'delivery', keywords: ['deploy', 'ship', 'rollout', 'production'] },
    ];

    this._heartbeatInterval = null;
    this._startHeartbeat();
  }

  createExecutionPlan(prompt) {
    const task = String(prompt || '').trim();
    const profile = this.routeProfile(task);
    const confidence = Math.min(0.99, 0.45 + profile.matchCount * 0.14);

    this.state.plansGenerated += 1;

    return {
      profile: profile.profile,
      confidence: Math.round(confidence * 1000) / 1000,
      plan: [
        'Assess repository state and dependencies',
        'Select minimal safe implementation path',
        'Execute and validate with existing checks',
        'Package production-ready output with rollback notes',
      ],
      prompt: task,
      phiWeight: PHI,
      timestamp: Date.now(),
    };
  }

  routeProfile(task) {
    const lower = String(task || '').toLowerCase();
    let best = { profile: 'build', matchCount: 0, matched: [] };

    for (const entry of this.routingProfiles) {
      const matched = entry.keywords.filter((kw) => lower.includes(kw));
      if (matched.length > best.matchCount) {
        best = { profile: entry.profile, matchCount: matched.length, matched };
      }
    }

    return best;
  }

  getState() {
    return { ...this.state };
  }

  _startHeartbeat() {
    this._heartbeatInterval = setInterval(() => {
      this.state.heartbeatCount += 1;
      this.state.lastHeartbeat = Date.now();
      this.state.healthy = true;
    }, HEARTBEAT);
  }
}

globalThis.sovereignCommandPilot = new SovereignCommandPilotEngine();

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  const pilot = globalThis.sovereignCommandPilot;

  switch (message.action) {
    case 'createExecutionPlan':
      sendResponse(pilot.createExecutionPlan(message.prompt));
      break;
    case 'routeProfile':
      sendResponse(pilot.routeProfile(message.task));
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
  const ALARM_NAME = 'sovereign-command-pilot-keepalive';
  const ALARM_PERIOD = 0.4;

  chrome.alarms.create(ALARM_NAME, { periodInMinutes: ALARM_PERIOD });
  chrome.alarms.onAlarm.addListener((alarm) => {
    if (alarm.name !== ALARM_NAME) return;
    if (!globalThis.sovereignCommandPilot) {
      globalThis.sovereignCommandPilot = new SovereignCommandPilotEngine();
    }
    chrome.storage.local.set({
      'sovereign-command-pilot_state': {
        healthy: globalThis.sovereignCommandPilot.state.healthy,
        heartbeatCount: globalThis.sovereignCommandPilot.state.heartbeatCount,
        lastAlive: Date.now(),
      },
    });
  });
})();

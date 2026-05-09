/**
 * PROTO-235: Alpha Issue Intelligence Protocol
 * 
 * Intelligent issue detection, triage, and resolution recommendation.
 * Uses phi-weighted pattern matching and historical analysis.
 *
 * @module alpha-issue-intelligence-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

class AlphaIssueIntelligenceProtocol {
  constructor() {
    this.id = 'PROTO-235';
    this.name = 'Alpha Issue Intelligence Protocol';
    this.knowledgeBase = new Map();
    this.activeIssues = new Map();
    this.resolutions = [];
    this.metrics = { issuesTriaged: 0, autoResolved: 0, escalated: 0 };
  }

  learn(issueSignature, resolution, success = true) {
    const key = this.computeSignatureKey(issueSignature);
    const existing = this.knowledgeBase.get(key) || { attempts: [], successRate: 0 };
    
    existing.attempts.push({ resolution, success, timestamp: Date.now() });
    if (existing.attempts.length > 100) existing.attempts = existing.attempts.slice(-100);
    
    const successes = existing.attempts.filter(a => a.success).length;
    existing.successRate = successes / existing.attempts.length;
    
    this.knowledgeBase.set(key, existing);
    return existing;
  }

  computeSignatureKey(signature) {
    const words = String(signature).toLowerCase().split(/\W+/).filter(w => w.length > 2);
    return words.sort().join(':');
  }

  triage(issueTitle, issueBody = '') {
    const signature = `${issueTitle} ${issueBody}`;
    const key = this.computeSignatureKey(signature);
    
    // Check knowledge base for similar issues
    const knowledge = this.knowledgeBase.get(key);
    
    const result = {
      signature: key,
      hasKnowledge: !!knowledge,
      recommendedAction: 'manual',
      confidence: 0,
      suggestedResolution: null,
    };

    if (knowledge && knowledge.successRate > PHI_INV) {
      const bestResolution = knowledge.attempts
        .filter(a => a.success)
        .sort((a, b) => b.timestamp - a.timestamp)[0];
      
      result.recommendedAction = 'auto-resolve';
      result.confidence = knowledge.successRate;
      result.suggestedResolution = bestResolution?.resolution;
    } else if (knowledge) {
      result.recommendedAction = 'review';
      result.confidence = knowledge.successRate;
    }

    this.metrics.issuesTriaged++;
    return result;
  }

  resolve(issueId, resolution, auto = false) {
    const issue = this.activeIssues.get(issueId);
    if (issue) {
      issue.status = 'resolved';
      issue.resolution = resolution;
      issue.resolvedAt = Date.now();
      issue.auto = auto;
      
      this.learn(issue.signature, resolution, true);
      
      if (auto) this.metrics.autoResolved++;
      this.resolutions.push({ issueId, resolution, auto, timestamp: Date.now() });
    }
    return issue;
  }

  escalate(issueId, reason) {
    const issue = this.activeIssues.get(issueId);
    if (issue) {
      issue.status = 'escalated';
      issue.escalationReason = reason;
      issue.escalatedAt = Date.now();
      this.metrics.escalated++;
    }
    return issue;
  }

  getMetrics() { return this.metrics; }
}

export { AlphaIssueIntelligenceProtocol };
export default AlphaIssueIntelligenceProtocol;

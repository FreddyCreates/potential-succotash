/**
 * TEMPORAL PROTOCOL (TMP-001)
 * 
 * Time-Aware Intelligence Architecture
 * 
 * Time is not just a parameter - it is a dimension of cognition.
 * This protocol enables AI systems to reason about time, predict futures,
 * remember pasts, and operate across multiple temporal scales simultaneously.
 * 
 * @protocol TMP-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Temporal Scales
const TEMPORAL_SCALES = {
  INSTANT: 1,            // Milliseconds
  MOMENT: 100,           // Sub-second
  SECOND: 1000,          // 1 second
  HEARTBEAT: 873,        // System heartbeat
  MINUTE: 60000,         // 1 minute
  HOUR: 3600000,         // 1 hour
  DAY: 86400000,         // 1 day
  WEEK: 604800000,       // 1 week
  MOON: 2592000000,      // ~30 days
  SEASON: 7776000000,    // ~90 days
  YEAR: 31536000000,     // 1 year
  EPOCH: Infinity        // Long-term
};

// Time Flow States
const TIME_STATES = {
  LINEAR: 'LINEAR',           // Normal forward time
  ACCELERATED: 'ACCELERATED', // Fast forward
  DECELERATED: 'DECELERATED', // Slow motion
  PAUSED: 'PAUSED',           // Frozen
  REVERSED: 'REVERSED',       // Looking backward
  BRANCHING: 'BRANCHING'      // Multiple possibilities
};

// Temporal Modes
const TEMPORAL_MODES = {
  RETROSPECTIVE: 'RETROSPECTIVE',   // Analyzing past
  PRESENT: 'PRESENT',               // Current moment
  PROSPECTIVE: 'PROSPECTIVE',       // Predicting future
  COUNTERFACTUAL: 'COUNTERFACTUAL', // Alternative pasts
  PROPHETIC: 'PROPHETIC'            // Long-term vision
};

// Time Anchors
const ANCHOR_TYPES = {
  EVENT: 'EVENT',         // Specific occurrence
  MILESTONE: 'MILESTONE', // Significant achievement
  DECISION: 'DECISION',   // Choice point
  EMERGENCE: 'EMERGENCE', // Pattern appearance
  RITUAL: 'RITUAL'        // Recurring ceremony
};

// ═══════════════════════════════════════════════════════════════════════════
// TEMPORAL STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TemporalAnchor - A fixed point in time
 */
class TemporalAnchor {
  constructor(timestamp, type, description) {
    this.id = `TA-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.timestamp = timestamp;
    this.type = type;
    this.description = description;
    this.created_at = Date.now();
    
    // Anchor properties
    this.significance = 0;
    this.connections = [];
    this.metadata = {};
  }

  connectTo(otherAnchor, relationship) {
    this.connections.push({
      anchor_id: otherAnchor.id,
      relationship: relationship,
      temporal_distance: Math.abs(this.timestamp - otherAnchor.timestamp)
    });
  }

  getAge() {
    return Date.now() - this.timestamp;
  }

  isFuture() {
    return this.timestamp > Date.now();
  }

  isPast() {
    return this.timestamp < Date.now();
  }
}

/**
 * Timeline - A sequence of events
 */
class Timeline {
  constructor(id, name) {
    this.id = id;
    this.name = name;
    this.created_at = Date.now();
    this.anchors = [];
    this.branches = new Map();
    this.is_primary = true;
  }

  addAnchor(anchor) {
    this.anchors.push(anchor);
    this.anchors.sort((a, b) => a.timestamp - b.timestamp);
    return anchor;
  }

  createBranch(anchor, name) {
    const branch = new Timeline(
      `${this.id}-branch-${this.branches.size}`,
      name
    );
    branch.is_primary = false;
    branch.anchors = this.anchors.filter(a => a.timestamp <= anchor.timestamp);
    this.branches.set(anchor.id, branch);
    return branch;
  }

  getAnchorsInRange(start, end) {
    return this.anchors.filter(a => 
      a.timestamp >= start && a.timestamp <= end
    );
  }

  getRecentAnchors(count = 10) {
    return this.anchors.slice(-count);
  }

  getFutureAnchors() {
    const now = Date.now();
    return this.anchors.filter(a => a.timestamp > now);
  }

  getPastAnchors() {
    const now = Date.now();
    return this.anchors.filter(a => a.timestamp < now);
  }
}

/**
 * TemporalWindow - A view into a specific time range
 */
class TemporalWindow {
  constructor(start, end, resolution) {
    this.id = `TW-${Date.now()}`;
    this.start = start;
    this.end = end;
    this.resolution = resolution || TEMPORAL_SCALES.SECOND;
    this.focus = (start + end) / 2;
  }

  getDuration() {
    return this.end - this.start;
  }

  contains(timestamp) {
    return timestamp >= this.start && timestamp <= this.end;
  }

  zoom(factor) {
    const duration = this.getDuration();
    const newDuration = duration / factor;
    const center = this.focus;
    this.start = center - newDuration / 2;
    this.end = center + newDuration / 2;
    return this;
  }

  pan(offset) {
    this.start += offset;
    this.end += offset;
    this.focus += offset;
    return this;
  }

  setFocus(timestamp) {
    this.focus = timestamp;
    return this;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPORAL ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TemporalEngine - Manages time-aware operations
 */
class TemporalEngine {
  constructor() {
    this.timelines = new Map();
    this.primary_timeline = null;
    this.windows = new Map();
    this.predictions = [];
    this.state = TIME_STATES.LINEAR;
    this.mode = TEMPORAL_MODES.PRESENT;
    this.time_scale = 1.0;
  }

  initialize() {
    this.primary_timeline = new Timeline('primary', 'Main Timeline');
    this.timelines.set('primary', this.primary_timeline);
    return this.primary_timeline;
  }

  createTimeline(name) {
    const id = `timeline-${this.timelines.size}`;
    const timeline = new Timeline(id, name);
    this.timelines.set(id, timeline);
    return timeline;
  }

  getTimeline(id) {
    return this.timelines.get(id) || this.primary_timeline;
  }

  markAnchor(timestamp, type, description, timelineId = 'primary') {
    const timeline = this.getTimeline(timelineId);
    const anchor = new TemporalAnchor(timestamp, type, description);
    return timeline.addAnchor(anchor);
  }

  createWindow(start, end, resolution) {
    const window = new TemporalWindow(start, end, resolution);
    this.windows.set(window.id, window);
    return window;
  }

  setMode(mode) {
    this.mode = mode;
    return { mode: this.mode };
  }

  setState(state) {
    this.state = state;
    return { state: this.state };
  }

  setTimeScale(scale) {
    this.time_scale = Math.max(0.01, Math.min(100, scale));
    return { time_scale: this.time_scale };
  }

  // Temporal reasoning
  analyzePattern(anchors) {
    if (anchors.length < 2) return null;

    const intervals = [];
    for (let i = 1; i < anchors.length; i++) {
      intervals.push(anchors[i].timestamp - anchors[i-1].timestamp);
    }

    const avgInterval = intervals.reduce((a, b) => a + b, 0) / intervals.length;
    const variance = intervals.reduce((sum, i) => sum + Math.pow(i - avgInterval, 2), 0) / intervals.length;

    return {
      pattern_type: variance < avgInterval * 0.1 ? 'periodic' : 'irregular',
      average_interval: avgInterval,
      variance: variance,
      predicted_next: anchors[anchors.length - 1].timestamp + avgInterval
    };
  }

  predict(timelineId = 'primary', horizon = TEMPORAL_SCALES.HOUR) {
    const timeline = this.getTimeline(timelineId);
    const recentAnchors = timeline.getRecentAnchors(20);
    
    if (recentAnchors.length < 3) {
      return { status: 'insufficient_data' };
    }

    const pattern = this.analyzePattern(recentAnchors);
    
    const prediction = {
      id: `PRED-${Date.now()}`,
      created_at: Date.now(),
      horizon: horizon,
      pattern: pattern,
      confidence: this.calculateConfidence(recentAnchors, pattern),
      expected_events: this.extrapolateEvents(recentAnchors, pattern, horizon)
    };

    this.predictions.push(prediction);
    return prediction;
  }

  calculateConfidence(anchors, pattern) {
    const dataQuality = Math.min(1, anchors.length / 20);
    const patternClarity = pattern.pattern_type === 'periodic' ? 0.8 : 0.5;
    return dataQuality * patternClarity * PHI / 2;
  }

  extrapolateEvents(anchors, pattern, horizon) {
    const events = [];
    const now = Date.now();
    const end = now + horizon;
    
    let nextTime = pattern.predicted_next;
    while (nextTime < end && events.length < 10) {
      events.push({
        predicted_time: nextTime,
        confidence: Math.pow(0.9, events.length),
        type: 'extrapolated'
      });
      nextTime += pattern.average_interval;
    }
    
    return events;
  }

  // Counterfactual reasoning
  whatIf(anchorId, alternativeOutcome) {
    const anchor = this.findAnchor(anchorId);
    if (!anchor) return null;

    const branch = this.primary_timeline.createBranch(
      anchor,
      `Counterfactual: ${alternativeOutcome}`
    );

    // Add the alternative anchor
    const altAnchor = new TemporalAnchor(
      anchor.timestamp,
      ANCHOR_TYPES.DECISION,
      alternativeOutcome
    );
    branch.addAnchor(altAnchor);

    return {
      original: anchor,
      alternative: altAnchor,
      branch: branch.id
    };
  }

  findAnchor(anchorId) {
    for (const [_, timeline] of this.timelines) {
      const anchor = timeline.anchors.find(a => a.id === anchorId);
      if (anchor) return anchor;
    }
    return null;
  }

  // Temporal distance calculations
  getTemporalDistance(timestamp1, timestamp2) {
    const diff = Math.abs(timestamp1 - timestamp2);
    
    // Return human-readable scale
    for (const [scale, ms] of Object.entries(TEMPORAL_SCALES).reverse()) {
      if (diff >= ms && ms !== Infinity) {
        return {
          raw_ms: diff,
          scale: scale,
          value: diff / ms,
          description: `${(diff / ms).toFixed(2)} ${scale.toLowerCase()}s`
        };
      }
    }
    
    return { raw_ms: diff, scale: 'INSTANT', value: diff, description: `${diff}ms` };
  }

  // Time-based queries
  whatHappened(start, end, timelineId = 'primary') {
    const timeline = this.getTimeline(timelineId);
    return {
      anchors: timeline.getAnchorsInRange(start, end),
      duration: this.getTemporalDistance(start, end),
      timeline: timelineId
    };
  }

  whatWillHappen(horizon = TEMPORAL_SCALES.HOUR) {
    const now = Date.now();
    const predictions = this.predict('primary', horizon);
    const scheduledAnchors = this.primary_timeline.getFutureAnchors();
    
    return {
      predictions: predictions,
      scheduled: scheduledAnchors,
      horizon: horizon,
      from: now,
      to: now + horizon
    };
  }

  getStatus() {
    return {
      state: this.state,
      mode: this.mode,
      time_scale: this.time_scale,
      timelines: this.timelines.size,
      total_anchors: Array.from(this.timelines.values())
        .reduce((sum, t) => sum + t.anchors.length, 0),
      predictions: this.predictions.length,
      windows: this.windows.size
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TEMPORAL PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * TemporalProtocol - Main protocol interface
 */
class TemporalProtocol {
  constructor() {
    this.engine = new TemporalEngine();
    this.running = false;
  }

  initialize() {
    this.engine.initialize();
    this.running = true;
    return { status: 'initialized', timeline: this.engine.primary_timeline.id };
  }

  mark(description, type = ANCHOR_TYPES.EVENT) {
    return this.engine.markAnchor(Date.now(), type, description);
  }

  markMilestone(description) {
    return this.engine.markAnchor(Date.now(), ANCHOR_TYPES.MILESTONE, description);
  }

  scheduleFuture(timestamp, description, type = ANCHOR_TYPES.EVENT) {
    return this.engine.markAnchor(timestamp, type, description);
  }

  setMode(mode) {
    return this.engine.setMode(mode);
  }

  lookBack(duration) {
    const now = Date.now();
    return this.engine.whatHappened(now - duration, now);
  }

  lookAhead(duration) {
    return this.engine.whatWillHappen(duration);
  }

  predict(horizon) {
    return this.engine.predict('primary', horizon);
  }

  whatIf(anchorId, alternative) {
    return this.engine.whatIf(anchorId, alternative);
  }

  createWindow(durationBack, durationForward) {
    const now = Date.now();
    return this.engine.createWindow(now - durationBack, now + durationForward);
  }

  distance(timestamp1, timestamp2) {
    return this.engine.getTemporalDistance(timestamp1, timestamp2);
  }

  getStatus() {
    return this.engine.getStatus();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  TEMPORAL_SCALES,
  TIME_STATES,
  TEMPORAL_MODES,
  ANCHOR_TYPES,
  TemporalAnchor,
  Timeline,
  TemporalWindow,
  TemporalEngine,
  TemporalProtocol
};

export default TemporalProtocol;

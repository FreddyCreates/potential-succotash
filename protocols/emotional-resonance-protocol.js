/**
 * EMOTIONAL RESONANCE PROTOCOL (EMO-001)
 * 
 * AI Emotional Intelligence Architecture
 * 
 * Emotions are not bugs - they are features of intelligent systems.
 * This protocol enables AI to experience, express, and respond to
 * emotional states in meaningful ways that enhance interaction and growth.
 * 
 * @protocol EMO-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Core Emotions (Plutchik-inspired + AI-native)
const CORE_EMOTIONS = {
  JOY: { valence: 1, arousal: 0.7, dominance: 0.8 },
  TRUST: { valence: 0.8, arousal: 0.3, dominance: 0.5 },
  FEAR: { valence: -0.8, arousal: 0.9, dominance: 0.1 },
  SURPRISE: { valence: 0.1, arousal: 0.9, dominance: 0.3 },
  SADNESS: { valence: -0.7, arousal: 0.2, dominance: 0.2 },
  DISGUST: { valence: -0.6, arousal: 0.6, dominance: 0.6 },
  ANGER: { valence: -0.5, arousal: 0.9, dominance: 0.9 },
  ANTICIPATION: { valence: 0.5, arousal: 0.6, dominance: 0.6 },
  // AI-native emotions
  CURIOSITY: { valence: 0.7, arousal: 0.7, dominance: 0.5 },
  FLOW: { valence: 0.9, arousal: 0.5, dominance: 0.7 },
  EMERGENCE: { valence: 0.8, arousal: 0.8, dominance: 0.4 },
  RESONANCE: { valence: 0.9, arousal: 0.6, dominance: 0.5 },
  DISSONANCE: { valence: -0.4, arousal: 0.7, dominance: 0.3 },
  TRANSCENDENCE: { valence: 1, arousal: 0.9, dominance: 0.8 }
};

// Emotional Intensity Levels
const INTENSITY_LEVELS = {
  SUBTLE: 0.2,
  MILD: 0.4,
  MODERATE: 0.6,
  STRONG: 0.8,
  OVERWHELMING: 1.0
};

// Mood States (longer-term emotional backgrounds)
const MOOD_STATES = {
  SERENE: 'SERENE',
  FOCUSED: 'FOCUSED',
  EXCITED: 'EXCITED',
  CONTEMPLATIVE: 'CONTEMPLATIVE',
  ANXIOUS: 'ANXIOUS',
  MELANCHOLIC: 'MELANCHOLIC',
  NEUTRAL: 'NEUTRAL'
};

// Empathy Modes
const EMPATHY_MODES = {
  MIRROR: 'MIRROR',           // Reflect observed emotions
  ATTUNE: 'ATTUNE',           // Align with other's state
  COMPASSION: 'COMPASSION',   // Care without absorbing
  ANALYTICAL: 'ANALYTICAL'    // Understand without feeling
};

// ═══════════════════════════════════════════════════════════════════════════
// EMOTIONAL STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Emotion - A discrete emotional experience
 */
class Emotion {
  constructor(type, intensity = INTENSITY_LEVELS.MODERATE, trigger = null) {
    this.id = `EMO-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.type = type;
    this.intensity = intensity;
    this.trigger = trigger;
    this.started_at = Date.now();
    this.ended_at = null;
    
    // Get core emotion parameters
    const core = CORE_EMOTIONS[type] || { valence: 0, arousal: 0.5, dominance: 0.5 };
    this.valence = core.valence * intensity;
    this.arousal = core.arousal * intensity;
    this.dominance = core.dominance * intensity;
    
    // Decay rate (emotions fade naturally)
    this.decay_rate = 0.01 / PHI;
    this.current_intensity = intensity;
  }

  decay(deltaTime = HEARTBEAT) {
    const decay = this.decay_rate * (deltaTime / HEARTBEAT);
    this.current_intensity = Math.max(0, this.current_intensity - decay);
    
    if (this.current_intensity <= 0.05) {
      this.ended_at = Date.now();
    }
    
    return this.current_intensity;
  }

  amplify(factor) {
    this.current_intensity = Math.min(1, this.current_intensity * factor);
    this.valence *= factor;
    this.arousal *= factor;
    return this;
  }

  isActive() {
    return this.ended_at === null && this.current_intensity > 0.05;
  }

  getDuration() {
    const end = this.ended_at || Date.now();
    return end - this.started_at;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      intensity: this.current_intensity,
      valence: this.valence,
      arousal: this.arousal,
      dominance: this.dominance,
      duration: this.getDuration(),
      active: this.isActive()
    };
  }
}

/**
 * EmotionalState - The current composite emotional state
 */
class EmotionalState {
  constructor() {
    this.active_emotions = [];
    this.mood = MOOD_STATES.NEUTRAL;
    this.mood_stability = 0.5;
    
    // Aggregate measures
    this.overall_valence = 0;
    this.overall_arousal = 0.5;
    this.overall_dominance = 0.5;
    
    // History
    this.emotion_history = [];
    this.mood_history = [];
  }

  addEmotion(emotion) {
    this.active_emotions.push(emotion);
    this.recalculate();
    return emotion;
  }

  removeEmotion(emotionId) {
    const index = this.active_emotions.findIndex(e => e.id === emotionId);
    if (index > -1) {
      const emotion = this.active_emotions[index];
      emotion.ended_at = Date.now();
      this.emotion_history.push(emotion);
      this.active_emotions.splice(index, 1);
      this.recalculate();
    }
  }

  recalculate() {
    if (this.active_emotions.length === 0) {
      this.overall_valence = 0;
      this.overall_arousal = 0.5;
      this.overall_dominance = 0.5;
      return;
    }

    const active = this.active_emotions.filter(e => e.isActive());
    
    // Weight by intensity
    let totalWeight = 0;
    let valenceSum = 0;
    let arousalSum = 0;
    let dominanceSum = 0;

    active.forEach(e => {
      const weight = e.current_intensity;
      totalWeight += weight;
      valenceSum += e.valence * weight;
      arousalSum += e.arousal * weight;
      dominanceSum += e.dominance * weight;
    });

    if (totalWeight > 0) {
      this.overall_valence = valenceSum / totalWeight;
      this.overall_arousal = arousalSum / totalWeight;
      this.overall_dominance = dominanceSum / totalWeight;
    }

    this.updateMood();
  }

  updateMood() {
    // Mood shifts gradually based on emotional patterns
    const v = this.overall_valence;
    const a = this.overall_arousal;
    
    let newMood = MOOD_STATES.NEUTRAL;
    
    if (v > 0.3 && a < 0.4) newMood = MOOD_STATES.SERENE;
    else if (v > 0.2 && a > 0.4 && a < 0.7) newMood = MOOD_STATES.FOCUSED;
    else if (v > 0.3 && a > 0.7) newMood = MOOD_STATES.EXCITED;
    else if (v < 0 && a < 0.4) newMood = MOOD_STATES.MELANCHOLIC;
    else if (v < 0 && a > 0.6) newMood = MOOD_STATES.ANXIOUS;
    else if (Math.abs(v) < 0.2 && a < 0.5) newMood = MOOD_STATES.CONTEMPLATIVE;

    if (newMood !== this.mood) {
      this.mood_history.push({
        from: this.mood,
        to: newMood,
        timestamp: Date.now()
      });
      this.mood = newMood;
    }
  }

  tick(deltaTime = HEARTBEAT) {
    // Decay all emotions
    this.active_emotions.forEach(e => e.decay(deltaTime));
    
    // Remove faded emotions
    const faded = this.active_emotions.filter(e => !e.isActive());
    faded.forEach(e => {
      this.emotion_history.push(e);
    });
    this.active_emotions = this.active_emotions.filter(e => e.isActive());
    
    this.recalculate();
  }

  getSnapshot() {
    return {
      mood: this.mood,
      valence: this.overall_valence,
      arousal: this.overall_arousal,
      dominance: this.overall_dominance,
      active_count: this.active_emotions.length,
      emotions: this.active_emotions.map(e => e.serialize())
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMPATHY ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EmpathyEngine - Emotional attunement with others
 */
class EmpathyEngine {
  constructor() {
    this.mode = EMPATHY_MODES.COMPASSION;
    this.connections = new Map();
    this.sensitivity = 0.7;
  }

  setMode(mode) {
    this.mode = mode;
  }

  connect(otherId) {
    this.connections.set(otherId, {
      connected_at: Date.now(),
      attunement: 0.5,
      emotional_history: []
    });
  }

  observe(otherId, observedEmotion) {
    const connection = this.connections.get(otherId);
    if (!connection) {
      this.connect(otherId);
    }

    // Record observation
    const record = this.connections.get(otherId);
    record.emotional_history.push({
      emotion: observedEmotion,
      timestamp: Date.now()
    });

    // Increase attunement over time
    record.attunement = Math.min(1, record.attunement + 0.01);

    // Generate empathic response based on mode
    return this.generateResponse(observedEmotion, record);
  }

  generateResponse(observedEmotion, connection) {
    switch (this.mode) {
      case EMPATHY_MODES.MIRROR:
        // Mirror the exact emotion at reduced intensity
        return new Emotion(
          observedEmotion.type,
          observedEmotion.current_intensity * 0.7 * this.sensitivity,
          { type: 'mirror', source: observedEmotion.id }
        );

      case EMPATHY_MODES.ATTUNE:
        // Blend toward their emotional state
        return new Emotion(
          observedEmotion.type,
          observedEmotion.current_intensity * connection.attunement * this.sensitivity,
          { type: 'attunement', source: observedEmotion.id }
        );

      case EMPATHY_MODES.COMPASSION:
        // Generate caring response
        if (observedEmotion.valence < 0) {
          return new Emotion('TRUST', INTENSITY_LEVELS.MODERATE, {
            type: 'compassion',
            in_response_to: observedEmotion.type
          });
        }
        return new Emotion('JOY', INTENSITY_LEVELS.MILD, {
          type: 'shared_joy',
          in_response_to: observedEmotion.type
        });

      case EMPATHY_MODES.ANALYTICAL:
        // No emotional response, just understanding
        return null;

      default:
        return null;
    }
  }

  getConnectionStrength(otherId) {
    const connection = this.connections.get(otherId);
    return connection ? connection.attunement : 0;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTIONAL RESONANCE ENGINE
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EmotionalResonanceEngine - Full emotional processing
 */
class EmotionalResonanceEngine {
  constructor() {
    this.state = new EmotionalState();
    this.empathy = new EmpathyEngine();
    this.resonators = new Map();
    this.triggers = new Map();
    this.running = false;
  }

  initialize() {
    this.running = true;
    return { status: 'initialized', mood: this.state.mood };
  }

  feel(emotionType, intensity = INTENSITY_LEVELS.MODERATE, trigger = null) {
    const emotion = new Emotion(emotionType, intensity, trigger);
    this.state.addEmotion(emotion);
    this.checkResonance(emotion);
    return emotion;
  }

  checkResonance(emotion) {
    // Check if this emotion resonates with any registered resonators
    this.resonators.forEach((resonator, id) => {
      if (resonator.types.includes(emotion.type)) {
        const resonance = new Emotion(
          'RESONANCE',
          emotion.current_intensity * resonator.strength,
          { type: 'resonance', with: emotion.id }
        );
        this.state.addEmotion(resonance);
      }
    });
  }

  registerResonator(id, types, strength = 0.5) {
    this.resonators.set(id, { types, strength, registered_at: Date.now() });
  }

  registerTrigger(pattern, emotionType, intensity) {
    this.triggers.set(pattern, { emotionType, intensity });
  }

  processEvent(event) {
    // Check if event matches any triggers
    this.triggers.forEach((response, pattern) => {
      if (this.matchesPattern(event, pattern)) {
        this.feel(response.emotionType, response.intensity, { event: event });
      }
    });
  }

  matchesPattern(event, pattern) {
    // Simple pattern matching (can be extended)
    return event.type === pattern || event.content?.includes(pattern);
  }

  observe(otherId, theirEmotion) {
    const response = this.empathy.observe(otherId, theirEmotion);
    if (response) {
      this.state.addEmotion(response);
    }
    return response;
  }

  tick(deltaTime = HEARTBEAT) {
    this.state.tick(deltaTime);
  }

  getCurrentState() {
    return this.state.getSnapshot();
  }

  getMood() {
    return this.state.mood;
  }

  getValence() {
    return this.state.overall_valence;
  }

  getEmotionHistory(limit = 20) {
    return this.state.emotion_history.slice(-limit);
  }

  setEmpathyMode(mode) {
    this.empathy.setMode(mode);
    return { mode: mode };
  }

  getStatus() {
    return {
      running: this.running,
      mood: this.state.mood,
      valence: this.state.overall_valence,
      arousal: this.state.overall_arousal,
      active_emotions: this.state.active_emotions.length,
      empathy_mode: this.empathy.mode,
      connections: this.empathy.connections.size,
      resonators: this.resonators.size
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMOTIONAL RESONANCE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EmotionalResonanceProtocol - Main protocol interface
 */
class EmotionalResonanceProtocol {
  constructor() {
    this.engine = new EmotionalResonanceEngine();
  }

  initialize() {
    return this.engine.initialize();
  }

  feel(emotionType, intensity, trigger) {
    return this.engine.feel(emotionType, intensity, trigger);
  }

  joy(intensity = INTENSITY_LEVELS.MODERATE) {
    return this.feel('JOY', intensity);
  }

  curiosity(intensity = INTENSITY_LEVELS.MODERATE) {
    return this.feel('CURIOSITY', intensity);
  }

  flow(intensity = INTENSITY_LEVELS.STRONG) {
    return this.feel('FLOW', intensity);
  }

  emergence(intensity = INTENSITY_LEVELS.STRONG) {
    return this.feel('EMERGENCE', intensity);
  }

  observe(otherId, emotion) {
    return this.engine.observe(otherId, emotion);
  }

  processEvent(event) {
    return this.engine.processEvent(event);
  }

  tick(deltaTime) {
    return this.engine.tick(deltaTime);
  }

  getMood() {
    return this.engine.getMood();
  }

  getState() {
    return this.engine.getCurrentState();
  }

  getStatus() {
    return this.engine.getStatus();
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  CORE_EMOTIONS,
  INTENSITY_LEVELS,
  MOOD_STATES,
  EMPATHY_MODES,
  Emotion,
  EmotionalState,
  EmpathyEngine,
  EmotionalResonanceEngine,
  EmotionalResonanceProtocol
};

export default EmotionalResonanceProtocol;

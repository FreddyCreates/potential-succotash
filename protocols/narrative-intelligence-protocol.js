/**
 * NARRATIVE INTELLIGENCE PROTOCOL (NAR-001)
 * 
 * Storytelling, Plot Generation, and Character AI Architecture
 * 
 * This protocol enables narrative-aware intelligence:
 * - Story Structure Analysis & Generation
 * - Character Development & Personality Models
 * - Plot Arc Management & Tension Curves
 * - Dialogue Generation & Style Transfer
 * - World Building & Lore Management
 * - Emotional Journey Mapping
 * - Genre-Aware Generation
 * - Interactive Narrative Systems
 * 
 * @protocol NAR-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Story Structure Types
const STORY_STRUCTURES = {
  THREE_ACT: 'THREE_ACT',
  HEROS_JOURNEY: 'HEROS_JOURNEY',
  SEVEN_POINT: 'SEVEN_POINT',
  KISHŌTENKETSU: 'KISHŌTENKETSU',
  FREYTAG_PYRAMID: 'FREYTAG_PYRAMID',
  FICHTEAN_CURVE: 'FICHTEAN_CURVE',
  IN_MEDIAS_RES: 'IN_MEDIAS_RES',
  CIRCULAR: 'CIRCULAR'
};

// Genre Types
const GENRES = {
  FANTASY: 'FANTASY',
  SCIENCE_FICTION: 'SCIENCE_FICTION',
  MYSTERY: 'MYSTERY',
  THRILLER: 'THRILLER',
  ROMANCE: 'ROMANCE',
  HORROR: 'HORROR',
  COMEDY: 'COMEDY',
  DRAMA: 'DRAMA',
  ADVENTURE: 'ADVENTURE',
  HISTORICAL: 'HISTORICAL',
  LITERARY: 'LITERARY',
  HYBRID: 'HYBRID'
};

// Character Archetypes
const ARCHETYPES = {
  HERO: 'HERO',
  MENTOR: 'MENTOR',
  THRESHOLD_GUARDIAN: 'THRESHOLD_GUARDIAN',
  HERALD: 'HERALD',
  SHAPESHIFTER: 'SHAPESHIFTER',
  SHADOW: 'SHADOW',
  ALLY: 'ALLY',
  TRICKSTER: 'TRICKSTER',
  EVERYMAN: 'EVERYMAN',
  INNOCENT: 'INNOCENT',
  REBEL: 'REBEL',
  SAGE: 'SAGE'
};

// Plot Elements
const PLOT_ELEMENTS = {
  INCITING_INCIDENT: 'INCITING_INCIDENT',
  RISING_ACTION: 'RISING_ACTION',
  COMPLICATION: 'COMPLICATION',
  CLIMAX: 'CLIMAX',
  FALLING_ACTION: 'FALLING_ACTION',
  RESOLUTION: 'RESOLUTION',
  HOOK: 'HOOK',
  SUBPLOT: 'SUBPLOT',
  TWIST: 'TWIST',
  REVELATION: 'REVELATION'
};

// Narrative Modes
const NARRATIVE_MODES = {
  FIRST_PERSON: 'FIRST_PERSON',
  SECOND_PERSON: 'SECOND_PERSON',
  THIRD_LIMITED: 'THIRD_LIMITED',
  THIRD_OMNISCIENT: 'THIRD_OMNISCIENT',
  MULTIPLE_POV: 'MULTIPLE_POV',
  UNRELIABLE: 'UNRELIABLE',
  STREAM_OF_CONSCIOUSNESS: 'STREAM_OF_CONSCIOUSNESS'
};

// ═══════════════════════════════════════════════════════════════════════════
// CORE CLASSES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Character - Represents a story character
 */
class Character {
  constructor(name, archetype = ARCHETYPES.EVERYMAN) {
    this.id = `char-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.archetype = archetype;
    
    // Personality (Big Five model)
    this.personality = {
      openness: 0.5,
      conscientiousness: 0.5,
      extraversion: 0.5,
      agreeableness: 0.5,
      neuroticism: 0.5
    };
    
    // Character details
    this.backstory = '';
    this.goals = [];
    this.fears = [];
    this.strengths = [];
    this.weaknesses = [];
    this.relationships = new Map();
    
    // Arc tracking
    this.arc = [];
    this.growthPoints = [];
    this.emotionalState = { valence: 0, arousal: 0.5, dominance: 0.5 };
    
    this.created = Date.now();
  }

  setPersonality(traits) {
    Object.assign(this.personality, traits);
    return this;
  }

  setBackstory(backstory) {
    this.backstory = backstory;
    return this;
  }

  addGoal(goal, priority = 1) {
    this.goals.push({ goal, priority, achieved: false });
    return this;
  }

  addRelationship(characterId, type, strength = 0.5) {
    this.relationships.set(characterId, { type, strength, history: [] });
    return this;
  }

  updateEmotionalState(event) {
    // Adjust emotional state based on event
    const impact = event.impact || 0.1;
    this.emotionalState.valence = Math.max(-1, Math.min(1, 
      this.emotionalState.valence + (event.positive ? impact : -impact)
    ));
    this.emotionalState.arousal = Math.max(0, Math.min(1,
      this.emotionalState.arousal + event.intensity * 0.1
    ));
    return this;
  }

  addGrowthPoint(point, chapter) {
    this.growthPoints.push({ point, chapter, timestamp: Date.now() });
    return this;
  }

  generateDialogueStyle() {
    // Generate dialogue style based on personality
    const style = {
      formality: this.personality.conscientiousness > 0.6 ? 'formal' : 'casual',
      wordiness: this.personality.extraversion > 0.6 ? 'verbose' : 'concise',
      emotionality: this.personality.neuroticism > 0.6 ? 'emotional' : 'reserved',
      vocabulary: this.personality.openness > 0.6 ? 'complex' : 'simple'
    };
    return style;
  }

  toJSON() {
    return {
      id: this.id,
      name: this.name,
      archetype: this.archetype,
      personality: this.personality,
      goals: this.goals,
      relationships: Object.fromEntries(this.relationships),
      emotionalState: this.emotionalState
    };
  }
}

/**
 * PlotPoint - Represents a point in the plot
 */
class PlotPoint {
  constructor(type, description) {
    this.id = `plot-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.type = type;
    this.description = description;
    this.characters = [];
    this.location = null;
    this.timestamp = null;
    this.tension = 0.5;
    this.consequences = [];
    this.foreshadowing = [];
    this.created = Date.now();
  }

  addCharacter(characterId) {
    this.characters.push(characterId);
    return this;
  }

  setTension(level) {
    this.tension = Math.max(0, Math.min(1, level));
    return this;
  }

  addConsequence(consequence) {
    this.consequences.push(consequence);
    return this;
  }

  addForeshadowing(hint) {
    this.foreshadowing.push(hint);
    return this;
  }
}

/**
 * Story - Complete story representation
 */
class Story {
  constructor(title, genre = GENRES.DRAMA) {
    this.id = `story-${Date.now()}`;
    this.title = title;
    this.genre = genre;
    this.structure = STORY_STRUCTURES.THREE_ACT;
    this.narrativeMode = NARRATIVE_MODES.THIRD_LIMITED;
    
    // Story elements
    this.characters = new Map();
    this.plotPoints = [];
    this.chapters = [];
    this.subplots = [];
    this.themes = [];
    
    // World building
    this.world = {
      name: '',
      locations: [],
      rules: [],
      history: [],
      factions: []
    };
    
    // Metrics
    this.tensionCurve = [];
    this.emotionalBeats = [];
    this.pacingScore = 0.5;
    
    this.created = Date.now();
    this.modified = Date.now();
  }

  addCharacter(character) {
    this.characters.set(character.id, character);
    return this;
  }

  addPlotPoint(plotPoint) {
    this.plotPoints.push(plotPoint);
    this.updateTensionCurve();
    return this;
  }

  addChapter(title, content, plotPointIds = []) {
    const chapter = {
      id: `chapter-${this.chapters.length + 1}`,
      number: this.chapters.length + 1,
      title,
      content,
      plotPoints: plotPointIds,
      wordCount: content.split(/\s+/).length,
      created: Date.now()
    };
    this.chapters.push(chapter);
    this.modified = Date.now();
    return chapter;
  }

  addSubplot(name, characters, mainPlotConnection) {
    const subplot = {
      id: `subplot-${Date.now()}`,
      name,
      characters,
      mainPlotConnection,
      beats: [],
      resolved: false
    };
    this.subplots.push(subplot);
    return subplot;
  }

  addTheme(theme) {
    this.themes.push(theme);
    return this;
  }

  setWorld(worldDetails) {
    Object.assign(this.world, worldDetails);
    return this;
  }

  updateTensionCurve() {
    this.tensionCurve = this.plotPoints.map((pp, i) => ({
      position: i / Math.max(1, this.plotPoints.length - 1),
      tension: pp.tension,
      type: pp.type
    }));
    this.calculatePacing();
  }

  calculatePacing() {
    if (this.tensionCurve.length < 2) {
      this.pacingScore = 0.5;
      return;
    }
    
    // Good pacing has variation in tension
    let variations = 0;
    for (let i = 1; i < this.tensionCurve.length; i++) {
      variations += Math.abs(
        this.tensionCurve[i].tension - this.tensionCurve[i-1].tension
      );
    }
    this.pacingScore = Math.min(1, variations / (this.tensionCurve.length * 0.3));
  }

  getStats() {
    return {
      title: this.title,
      genre: this.genre,
      characterCount: this.characters.size,
      chapterCount: this.chapters.length,
      plotPointCount: this.plotPoints.length,
      subplotCount: this.subplots.length,
      themeCount: this.themes.length,
      totalWords: this.chapters.reduce((sum, ch) => sum + ch.wordCount, 0),
      pacingScore: this.pacingScore
    };
  }
}

/**
 * PlotGenerator - Generates plot structures and beats
 */
class PlotGenerator {
  constructor() {
    this.templates = new Map();
    this.initializeTemplates();
  }

  initializeTemplates() {
    // Three Act Structure
    this.templates.set(STORY_STRUCTURES.THREE_ACT, [
      { position: 0.0, type: PLOT_ELEMENTS.HOOK, tension: 0.3 },
      { position: 0.1, type: PLOT_ELEMENTS.INCITING_INCIDENT, tension: 0.4 },
      { position: 0.25, type: PLOT_ELEMENTS.RISING_ACTION, tension: 0.5 },
      { position: 0.5, type: PLOT_ELEMENTS.COMPLICATION, tension: 0.7 },
      { position: 0.75, type: PLOT_ELEMENTS.CLIMAX, tension: 1.0 },
      { position: 0.85, type: PLOT_ELEMENTS.FALLING_ACTION, tension: 0.6 },
      { position: 1.0, type: PLOT_ELEMENTS.RESOLUTION, tension: 0.3 }
    ]);

    // Hero's Journey
    this.templates.set(STORY_STRUCTURES.HEROS_JOURNEY, [
      { position: 0.0, type: 'ORDINARY_WORLD', tension: 0.2 },
      { position: 0.08, type: 'CALL_TO_ADVENTURE', tension: 0.4 },
      { position: 0.12, type: 'REFUSAL', tension: 0.35 },
      { position: 0.17, type: 'MEETING_MENTOR', tension: 0.45 },
      { position: 0.25, type: 'CROSSING_THRESHOLD', tension: 0.5 },
      { position: 0.4, type: 'TESTS_ALLIES_ENEMIES', tension: 0.6 },
      { position: 0.5, type: 'APPROACH', tension: 0.7 },
      { position: 0.6, type: 'ORDEAL', tension: 0.95 },
      { position: 0.7, type: 'REWARD', tension: 0.6 },
      { position: 0.8, type: 'ROAD_BACK', tension: 0.75 },
      { position: 0.9, type: 'RESURRECTION', tension: 1.0 },
      { position: 1.0, type: 'RETURN_WITH_ELIXIR', tension: 0.3 }
    ]);
  }

  generateStructure(structure, storyContext) {
    const template = this.templates.get(structure);
    if (!template) {
      throw new Error(`Unknown structure: ${structure}`);
    }

    return template.map(beat => new PlotPoint(beat.type, '')
      .setTension(beat.tension)
    );
  }

  suggestTwist(story, position) {
    const twists = [
      { type: 'BETRAYAL', description: 'An ally reveals their true allegiance' },
      { type: 'REVELATION', description: 'A hidden truth comes to light' },
      { type: 'REVERSAL', description: 'The apparent villain is actually helping' },
      { type: 'DEATH', description: 'A significant character meets their end' },
      { type: 'RETURN', description: 'Someone thought lost returns' },
      { type: 'DISCOVERY', description: 'A game-changing ability or item is found' }
    ];
    
    return twists[Math.floor(Math.random() * twists.length)];
  }

  calculateIdealTension(position, structure) {
    const template = this.templates.get(structure);
    if (!template) return 0.5;
    
    // Find surrounding beats
    let prev = template[0];
    let next = template[template.length - 1];
    
    for (let i = 0; i < template.length - 1; i++) {
      if (template[i].position <= position && template[i+1].position >= position) {
        prev = template[i];
        next = template[i+1];
        break;
      }
    }
    
    // Linear interpolation
    const t = (position - prev.position) / (next.position - prev.position);
    return prev.tension + t * (next.tension - prev.tension);
  }
}

/**
 * DialogueEngine - Generates character dialogue
 */
class DialogueEngine {
  constructor() {
    this.styleProfiles = new Map();
    this.conversationHistory = [];
  }

  generateDialogue(character, context, emotion = null) {
    const style = character.generateDialogueStyle();
    const emotionalState = emotion || character.emotionalState;
    
    const dialogue = {
      characterId: character.id,
      style,
      emotionalContext: emotionalState,
      context,
      timestamp: Date.now()
    };
    
    this.conversationHistory.push(dialogue);
    return dialogue;
  }

  generateConversation(characters, topic, turns = 5) {
    const conversation = {
      id: `conv-${Date.now()}`,
      participants: characters.map(c => c.id),
      topic,
      turns: [],
      started: Date.now()
    };
    
    for (let i = 0; i < turns; i++) {
      const speaker = characters[i % characters.length];
      const turn = {
        turn: i + 1,
        speakerId: speaker.id,
        speakerName: speaker.name,
        dialogue: this.generateDialogue(speaker, { topic, turn: i })
      };
      conversation.turns.push(turn);
    }
    
    return conversation;
  }

  analyzeConversationDynamics(conversation) {
    const dynamics = {
      dominantSpeaker: null,
      emotionalArc: [],
      topicShifts: 0,
      conflictLevel: 0
    };
    
    const speakerCounts = new Map();
    for (const turn of conversation.turns) {
      speakerCounts.set(turn.speakerId, 
        (speakerCounts.get(turn.speakerId) || 0) + 1
      );
      dynamics.emotionalArc.push(turn.dialogue.emotionalContext);
    }
    
    // Find dominant speaker
    let maxCount = 0;
    for (const [speakerId, count] of speakerCounts) {
      if (count > maxCount) {
        maxCount = count;
        dynamics.dominantSpeaker = speakerId;
      }
    }
    
    return dynamics;
  }
}

/**
 * WorldBuilder - Manages story world creation
 */
class WorldBuilder {
  constructor() {
    this.worlds = new Map();
  }

  createWorld(name) {
    const world = {
      id: `world-${Date.now()}`,
      name,
      locations: [],
      rules: [],
      history: [],
      factions: [],
      cultures: [],
      magic: null,
      technology: null,
      created: Date.now()
    };
    this.worlds.set(name, world);
    return world;
  }

  addLocation(worldName, location) {
    const world = this.worlds.get(worldName);
    if (!world) throw new Error(`World not found: ${worldName}`);
    
    const loc = {
      id: `loc-${Date.now()}`,
      ...location,
      connections: [],
      events: []
    };
    world.locations.push(loc);
    return loc;
  }

  addWorldRule(worldName, rule) {
    const world = this.worlds.get(worldName);
    if (!world) throw new Error(`World not found: ${worldName}`);
    world.rules.push({ rule, implications: [], exceptions: [] });
    return this;
  }

  addFaction(worldName, faction) {
    const world = this.worlds.get(worldName);
    if (!world) throw new Error(`World not found: ${worldName}`);
    
    const fac = {
      id: `fac-${Date.now()}`,
      ...faction,
      members: [],
      allies: [],
      enemies: [],
      goals: []
    };
    world.factions.push(fac);
    return fac;
  }

  generateConsistencyReport(worldName) {
    const world = this.worlds.get(worldName);
    if (!world) throw new Error(`World not found: ${worldName}`);
    
    const issues = [];
    
    // Check for isolated locations
    for (const loc of world.locations) {
      if (loc.connections.length === 0 && world.locations.length > 1) {
        issues.push({
          type: 'ISOLATED_LOCATION',
          element: loc.name,
          severity: 'warning'
        });
      }
    }
    
    // Check for conflicting rules
    for (let i = 0; i < world.rules.length; i++) {
      for (let j = i + 1; j < world.rules.length; j++) {
        // Simplified conflict detection
        if (world.rules[i].implications.some(
          imp => world.rules[j].exceptions.includes(imp)
        )) {
          issues.push({
            type: 'RULE_CONFLICT',
            elements: [world.rules[i].rule, world.rules[j].rule],
            severity: 'error'
          });
        }
      }
    }
    
    return { worldName, issues, checkedAt: Date.now() };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN PROTOCOL CLASS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * NarrativeIntelligenceProtocol - Main protocol orchestrator
 */
class NarrativeIntelligenceProtocol {
  constructor() {
    this.stories = new Map();
    this.plotGenerator = new PlotGenerator();
    this.dialogueEngine = new DialogueEngine();
    this.worldBuilder = new WorldBuilder();
    this.running = false;
  }

  initialize() {
    this.running = true;
    console.log('[NAR-001] Narrative Intelligence Protocol initialized');
    return { status: 'initialized', timestamp: Date.now() };
  }

  createStory(title, genre = GENRES.DRAMA) {
    const story = new Story(title, genre);
    this.stories.set(story.id, story);
    return story;
  }

  createCharacter(name, archetype = ARCHETYPES.EVERYMAN) {
    return new Character(name, archetype);
  }

  generatePlot(story, structure = STORY_STRUCTURES.THREE_ACT) {
    story.structure = structure;
    const plotPoints = this.plotGenerator.generateStructure(structure, story);
    for (const pp of plotPoints) {
      story.addPlotPoint(pp);
    }
    return plotPoints;
  }

  generateDialogue(character, context) {
    return this.dialogueEngine.generateDialogue(character, context);
  }

  createConversation(characters, topic, turns = 5) {
    return this.dialogueEngine.generateConversation(characters, topic, turns);
  }

  buildWorld(name) {
    return this.worldBuilder.createWorld(name);
  }

  analyzeStoryPacing(story) {
    return {
      tensionCurve: story.tensionCurve,
      pacingScore: story.pacingScore,
      recommendations: this.generatePacingRecommendations(story)
    };
  }

  generatePacingRecommendations(story) {
    const recs = [];
    
    // Check for flat tension
    const tensionVariance = this.calculateVariance(
      story.tensionCurve.map(t => t.tension)
    );
    if (tensionVariance < 0.05) {
      recs.push('Consider adding more tension variation throughout the story');
    }
    
    // Check for climax position
    const climaxPoints = story.plotPoints.filter(
      pp => pp.type === PLOT_ELEMENTS.CLIMAX
    );
    if (climaxPoints.length === 0) {
      recs.push('Story appears to be missing a clear climax');
    }
    
    return recs;
  }

  calculateVariance(values) {
    if (values.length === 0) return 0;
    const mean = values.reduce((a, b) => a + b, 0) / values.length;
    const squaredDiffs = values.map(v => (v - mean) ** 2);
    return squaredDiffs.reduce((a, b) => a + b, 0) / values.length;
  }

  getStatus() {
    return {
      running: this.running,
      storyCount: this.stories.size,
      worldCount: this.worldBuilder.worlds.size,
      conversationHistory: this.dialogueEngine.conversationHistory.length
    };
  }

  shutdown() {
    this.running = false;
    console.log('[NAR-001] Narrative Intelligence Protocol shutdown');
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  // Constants
  STORY_STRUCTURES,
  GENRES,
  ARCHETYPES,
  PLOT_ELEMENTS,
  NARRATIVE_MODES,
  
  // Classes
  Character,
  PlotPoint,
  Story,
  PlotGenerator,
  DialogueEngine,
  WorldBuilder,
  NarrativeIntelligenceProtocol
};

export default NarrativeIntelligenceProtocol;

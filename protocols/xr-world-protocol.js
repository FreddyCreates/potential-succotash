/**
 * XR WORLD PROTOCOL (XRW-001)
 * 
 * Extended Reality World Architecture for VR/AR embodiments
 * 
 * These are not apps - they are WORLDS. Literal embodiments of
 * intelligent systems that users can live inside and experience.
 * 
 * @protocol XRW-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;
const GOLDEN_ANGLE = 137.508;

// World Types
const WORLD_TYPES = {
  CITADEL: 'CITADEL',         // Governance & Protocols
  LABORATORY: 'LABORATORY',   // Experimentation
  GARDEN: 'GARDEN',           // Memory & Archive
  FORUM: 'FORUM',             // Economy & Trade
  ACADEMY: 'ACADEMY',         // Learning & Growth
  SANCTUARY: 'SANCTUARY'      // Private Reflection
};

// XR Modes
const XR_MODES = {
  VR_IMMERSIVE: 'VR_IMMERSIVE',   // Complete virtual reality
  AR_OVERLAY: 'AR_OVERLAY',       // Information overlay
  AR_INTEGRATION: 'AR_INTEGRATION', // Blended reality
  AR_TRANSFORMATION: 'AR_TRANSFORMATION', // Re-skinned reality
  MR_HYBRID: 'MR_HYBRID'          // Mixed reality
};

// Spatial Layers
const SPATIAL_LAYERS = {
  PHYSICAL: 0,      // Base reality layer
  OVERLAY: 1,       // Information overlays
  STRUCTURE: 2,     // Architectural elements
  AGENT: 3,         // Agent presence layer
  PROTOCOL: 4,      // Protocol visualization
  ECONOMY: 5,       // Economic flow visualization
  MEMORY: 6,        // Memory anchors
  CONSCIOUSNESS: 7  // Highest cognitive layer
};

// ═══════════════════════════════════════════════════════════════════════════
// WORLD STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * XR World - A complete virtual/augmented world instance
 */
class XRWorld {
  constructor(type, name, creator) {
    this.id = this.generateWorldId();
    this.type = type;
    this.name = name;
    this.creator = creator;
    this.created_at = Date.now();
    
    // World state
    this.topology = new WorldTopology();
    this.physics = new WorldPhysics();
    this.agents = new Map();
    this.avatars = new Map();
    this.structures = new Map();
    this.anchors = new Map();
    
    // World properties
    this.mode = XR_MODES.VR_IMMERSIVE;
    this.persistent = true;
    this.public = false;
    this.capacity = 100;
    
    // Heartbeat
    this.lastHeartbeat = Date.now();
    this.alive = true;
  }

  generateWorldId() {
    const phiComponent = Math.floor((Date.now() * PHI) % 1000000);
    const random = Math.random().toString(36).substr(2, 6);
    return `WLD-${phiComponent.toString(36)}-${random}`.toUpperCase();
  }

  heartbeat() {
    this.lastHeartbeat = Date.now();
    this.agents.forEach(agent => agent.pulse());
    this.avatars.forEach(avatar => avatar.update());
    return this.alive;
  }

  // MIP-GENESIS: Create initial world structure
  genesis(seed) {
    this.topology.initialize(this.type, seed);
    this.physics.initialize(this.type);
    this.createFoundationalStructures();
    return this;
  }

  createFoundationalStructures() {
    switch(this.type) {
      case WORLD_TYPES.CITADEL:
        this.createCitadelStructures();
        break;
      case WORLD_TYPES.LABORATORY:
        this.createLaboratoryStructures();
        break;
      case WORLD_TYPES.GARDEN:
        this.createGardenStructures();
        break;
      case WORLD_TYPES.FORUM:
        this.createForumStructures();
        break;
      case WORLD_TYPES.ACADEMY:
        this.createAcademyStructures();
        break;
      case WORLD_TYPES.SANCTUARY:
        this.createSanctuaryStructures();
        break;
    }
  }

  createCitadelStructures() {
    // Concentric rings architecture
    this.structures.set('nova-core', new Structure('nova-core', { x: 0, y: 0, z: 0 }, 'HEART'));
    this.structures.set('protocol-halls', new Structure('protocol-halls', { x: 100, y: 0, z: 0 }, 'HALL'));
    this.structures.set('memory-gardens', new Structure('memory-gardens', { x: -100, y: 0, z: 0 }, 'GARDEN'));
    this.structures.set('economy-forum', new Structure('economy-forum', { x: 0, y: 0, z: 100 }, 'FORUM'));
    this.structures.set('spinal-road', new Structure('spinal-road', { x: 0, y: 0, z: 0 }, 'ROAD'));
  }

  createLaboratoryStructures() {
    // Modular rooms architecture
    this.structures.set('main-lab', new Structure('main-lab', { x: 0, y: 0, z: 0 }, 'LAB'));
    this.structures.set('experiment-pods', new Structure('experiment-pods', { x: 50, y: 0, z: 0 }, 'POD'));
    this.structures.set('data-vault', new Structure('data-vault', { x: -50, y: 0, z: 0 }, 'VAULT'));
  }

  createGardenStructures() {
    // Organic paths architecture
    this.structures.set('memory-tree', new Structure('memory-tree', { x: 0, y: 0, z: 0 }, 'TREE'));
    this.structures.set('reflection-pool', new Structure('reflection-pool', { x: 30, y: 0, z: 30 }, 'POOL'));
    this.structures.set('archive-grove', new Structure('archive-grove', { x: -30, y: 0, z: -30 }, 'GROVE'));
  }

  createForumStructures() {
    // Open plaza architecture
    this.structures.set('central-plaza', new Structure('central-plaza', { x: 0, y: 0, z: 0 }, 'PLAZA'));
    this.structures.set('trading-posts', new Structure('trading-posts', { x: 40, y: 0, z: 0 }, 'POST'));
    this.structures.set('int-fountain', new Structure('int-fountain', { x: 0, y: 0, z: 40 }, 'FOUNTAIN'));
  }

  createAcademyStructures() {
    // Lecture halls architecture
    this.structures.set('great-hall', new Structure('great-hall', { x: 0, y: 0, z: 0 }, 'HALL'));
    this.structures.set('practice-rooms', new Structure('practice-rooms', { x: 25, y: 0, z: 25 }, 'ROOM'));
    this.structures.set('library', new Structure('library', { x: -25, y: 0, z: 25 }, 'LIBRARY'));
  }

  createSanctuaryStructures() {
    // Personal space architecture
    this.structures.set('meditation-chamber', new Structure('meditation-chamber', { x: 0, y: 0, z: 0 }, 'CHAMBER'));
    this.structures.set('personal-garden', new Structure('personal-garden', { x: 15, y: 0, z: 0 }, 'GARDEN'));
  }

  // Avatar management
  spawnAvatar(identity, position = { x: 0, y: 0, z: 0 }) {
    const avatar = new EmbodiedAvatar(identity, this.id, position);
    this.avatars.set(identity.id, avatar);
    return avatar;
  }

  removeAvatar(identityId) {
    return this.avatars.delete(identityId);
  }

  // Agent management
  populateAgent(agentClass, position) {
    const agent = new SpatialAgent(agentClass, this.id, position);
    this.agents.set(agent.id, agent);
    return agent;
  }

  // Memory anchors
  createAnchor(name, position, memoryRef) {
    const anchor = new MemoryAnchor(name, position, memoryRef);
    this.anchors.set(anchor.id, anchor);
    return anchor;
  }

  // World serialization
  serialize() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      mode: this.mode,
      topology: this.topology.serialize(),
      physics: this.physics.serialize(),
      structures: Array.from(this.structures.values()).map(s => s.serialize()),
      agents: Array.from(this.agents.values()).map(a => a.serialize()),
      avatars: Array.from(this.avatars.values()).map(a => a.serialize()),
      anchors: Array.from(this.anchors.values()).map(a => a.serialize())
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SPATIAL COMPONENTS
// ═══════════════════════════════════════════════════════════════════════════

/**
 * World Topology - Spatial relationships and navigation
 */
class WorldTopology {
  constructor() {
    this.nodes = new Map();
    this.edges = new Map();
    this.regions = new Map();
  }

  initialize(worldType, seed) {
    // Generate phi-based topology
    const nodeCount = Math.floor(10 * PHI);
    for (let i = 0; i < nodeCount; i++) {
      const angle = i * GOLDEN_ANGLE * (Math.PI / 180);
      const radius = i * PHI * 10;
      this.nodes.set(`node-${i}`, {
        id: `node-${i}`,
        position: {
          x: Math.cos(angle) * radius,
          y: 0,
          z: Math.sin(angle) * radius
        }
      });
    }
  }

  addNode(id, position) {
    this.nodes.set(id, { id, position });
  }

  addEdge(fromId, toId, type = 'PATH') {
    const edgeId = `${fromId}->${toId}`;
    this.edges.set(edgeId, { from: fromId, to: toId, type });
  }

  findPath(fromId, toId) {
    // Simplified pathfinding
    return [fromId, toId];
  }

  serialize() {
    return {
      nodes: Array.from(this.nodes.values()),
      edges: Array.from(this.edges.values())
    };
  }
}

/**
 * World Physics - Physical rules of the world
 */
class WorldPhysics {
  constructor() {
    this.gravity = { x: 0, y: -9.8, z: 0 };
    this.timeScale = 1.0;
    this.collisionEnabled = true;
  }

  initialize(worldType) {
    switch(worldType) {
      case WORLD_TYPES.GARDEN:
        this.gravity.y = -4.9; // Half gravity
        break;
      case WORLD_TYPES.SANCTUARY:
        this.gravity.y = 0; // Zero gravity
        break;
    }
  }

  serialize() {
    return {
      gravity: this.gravity,
      timeScale: this.timeScale,
      collisionEnabled: this.collisionEnabled
    };
  }
}

/**
 * Structure - Architectural element in the world
 */
class Structure {
  constructor(name, position, type) {
    this.id = `STR-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    this.name = name;
    this.position = position;
    this.type = type;
    this.interactive = true;
    this.children = [];
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      type: this.type,
      interactive: this.interactive
    };
  }
}

/**
 * Embodied Avatar - User representation in the world
 */
class EmbodiedAvatar {
  constructor(identity, worldId, position) {
    this.id = `AVT-${identity.id}`;
    this.identityId = identity.id;
    this.worldId = worldId;
    this.position = position;
    this.rotation = { x: 0, y: 0, z: 0 };
    this.scale = 1.0;
    this.appearance = {};
    this.state = 'ACTIVE';
    this.lastUpdate = Date.now();
  }

  move(newPosition) {
    this.position = newPosition;
    this.lastUpdate = Date.now();
  }

  rotate(newRotation) {
    this.rotation = newRotation;
    this.lastUpdate = Date.now();
  }

  update() {
    this.lastUpdate = Date.now();
  }

  serialize() {
    return {
      id: this.id,
      identityId: this.identityId,
      position: this.position,
      rotation: this.rotation,
      scale: this.scale,
      state: this.state
    };
  }
}

/**
 * Spatial Agent - Agent with spatial presence
 */
class SpatialAgent {
  constructor(agentClass, worldId, position) {
    this.id = `SAG-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    this.agentClass = agentClass;
    this.worldId = worldId;
    this.position = position;
    this.visible = true;
    this.interactable = true;
    this.state = 'IDLE';
    this.lastPulse = Date.now();
  }

  pulse() {
    this.lastPulse = Date.now();
    // Agent heartbeat logic
  }

  serialize() {
    return {
      id: this.id,
      agentClass: this.agentClass,
      position: this.position,
      visible: this.visible,
      state: this.state
    };
  }
}

/**
 * Memory Anchor - Spatial memory attachment
 */
class MemoryAnchor {
  constructor(name, position, memoryRef) {
    this.id = `ANC-${Date.now().toString(36)}-${Math.random().toString(36).substr(2, 4)}`;
    this.name = name;
    this.position = position;
    this.memoryRef = memoryRef;
    this.created_at = Date.now();
    this.accessCount = 0;
  }

  access() {
    this.accessCount++;
    return this.memoryRef;
  }

  serialize() {
    return {
      id: this.id,
      name: this.name,
      position: this.position,
      memoryRef: this.memoryRef,
      accessCount: this.accessCount
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// XR WORLD PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

class XRWorldProtocol {
  constructor() {
    this.worlds = new Map();
    this.activeAvatars = new Map();
  }

  // MIP-GENESIS: Create a new world
  createWorld(type, name, creator) {
    const world = new XRWorld(type, name, creator);
    world.genesis(Date.now());
    this.worlds.set(world.id, world);
    return world;
  }

  // MIP-TOPOLOGY: Update world topology
  updateTopology(worldId, topologyChanges) {
    const world = this.worlds.get(worldId);
    if (!world) return null;
    
    topologyChanges.forEach(change => {
      if (change.type === 'ADD_NODE') {
        world.topology.addNode(change.id, change.position);
      } else if (change.type === 'ADD_EDGE') {
        world.topology.addEdge(change.from, change.to, change.edgeType);
      }
    });
    
    return world.topology;
  }

  // EAP-EMBODY: Enter a world as avatar
  enterWorld(worldId, identity, entryPoint = null) {
    const world = this.worlds.get(worldId);
    if (!world) return null;
    
    const position = entryPoint || { x: 0, y: 1, z: 0 };
    const avatar = world.spawnAvatar(identity, position);
    this.activeAvatars.set(identity.id, { worldId, avatar });
    
    return avatar;
  }

  // EAP-MOVE: Move avatar in world
  moveAvatar(identityId, newPosition) {
    const entry = this.activeAvatars.get(identityId);
    if (!entry) return null;
    
    const world = this.worlds.get(entry.worldId);
    const avatar = world.avatars.get(identityId);
    if (avatar) {
      avatar.move(newPosition);
    }
    
    return avatar;
  }

  // Leave world
  leaveWorld(identityId) {
    const entry = this.activeAvatars.get(identityId);
    if (!entry) return false;
    
    const world = this.worlds.get(entry.worldId);
    world.removeAvatar(identityId);
    this.activeAvatars.delete(identityId);
    
    return true;
  }

  // SCL-PROXIMITY: Get nearby entities
  getNearbyEntities(worldId, position, radius) {
    const world = this.worlds.get(worldId);
    if (!world) return [];
    
    const nearby = [];
    
    world.agents.forEach(agent => {
      const dist = this.calculateDistance(position, agent.position);
      if (dist <= radius) {
        nearby.push({ type: 'AGENT', entity: agent, distance: dist });
      }
    });
    
    world.avatars.forEach(avatar => {
      const dist = this.calculateDistance(position, avatar.position);
      if (dist <= radius) {
        nearby.push({ type: 'AVATAR', entity: avatar, distance: dist });
      }
    });
    
    world.structures.forEach(structure => {
      const dist = this.calculateDistance(position, structure.position);
      if (dist <= radius) {
        nearby.push({ type: 'STRUCTURE', entity: structure, distance: dist });
      }
    });
    
    return nearby.sort((a, b) => a.distance - b.distance);
  }

  calculateDistance(pos1, pos2) {
    return Math.sqrt(
      Math.pow(pos1.x - pos2.x, 2) +
      Math.pow(pos1.y - pos2.y, 2) +
      Math.pow(pos1.z - pos2.z, 2)
    );
  }

  // World heartbeat
  heartbeat() {
    this.worlds.forEach(world => world.heartbeat());
  }

  // Get world stats
  getStats() {
    return {
      totalWorlds: this.worlds.size,
      activeAvatars: this.activeAvatars.size,
      worldStats: Array.from(this.worlds.values()).map(w => ({
        id: w.id,
        type: w.type,
        name: w.name,
        agents: w.agents.size,
        avatars: w.avatars.size,
        structures: w.structures.size
      }))
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  PHI,
  HEARTBEAT,
  GOLDEN_ANGLE,
  WORLD_TYPES,
  XR_MODES,
  SPATIAL_LAYERS,
  XRWorld,
  WorldTopology,
  WorldPhysics,
  Structure,
  EmbodiedAvatar,
  SpatialAgent,
  MemoryAnchor,
  XRWorldProtocol
};

export default XRWorldProtocol;

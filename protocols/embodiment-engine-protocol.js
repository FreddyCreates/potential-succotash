/**
 * EMBODIMENT ENGINE PROTOCOL (EMB-001)
 * 
 * Physical and Virtual Embodiment Architecture
 * 
 * This protocol enables AI to inhabit and control:
 * - Physical Robots (humanoid, quadruped, drones, vehicles)
 * - Virtual Avatars (VR, AR, metaverse)
 * - Digital Twins (IoT, industrial, smart cities)
 * - Swarm Systems (multi-agent coordination)
 * - Hybrid Systems (cyber-physical)
 * 
 * @protocol EMB-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Embodiment Types
const EMBODIMENT_TYPES = {
  PHYSICAL: 'PHYSICAL',
  VIRTUAL: 'VIRTUAL',
  HYBRID: 'HYBRID',
  DIGITAL_TWIN: 'DIGITAL_TWIN',
  SWARM: 'SWARM',
  ABSTRACT: 'ABSTRACT'
};

// Physical Form Factors
const PHYSICAL_FORMS = {
  HUMANOID: { limbs: 4, dof: 42, locomotion: 'bipedal' },
  QUADRUPED: { limbs: 4, dof: 24, locomotion: 'quadrupedal' },
  WHEELED: { limbs: 0, dof: 8, locomotion: 'wheels' },
  TRACKED: { limbs: 0, dof: 6, locomotion: 'tracks' },
  DRONE_AERIAL: { limbs: 0, dof: 6, locomotion: 'flight' },
  DRONE_AQUATIC: { limbs: 0, dof: 6, locomotion: 'swim' },
  MANIPULATOR: { limbs: 1, dof: 7, locomotion: 'stationary' },
  DUAL_ARM: { limbs: 2, dof: 14, locomotion: 'stationary' },
  SNAKE: { limbs: 0, dof: 32, locomotion: 'slither' },
  SOFT_ROBOT: { limbs: 'variable', dof: 'continuous', locomotion: 'deform' }
};

// Virtual Form Factors
const VIRTUAL_FORMS = {
  HUMANOID_AVATAR: { bones: 65, blendshapes: 52, style: 'realistic' },
  STYLIZED_AVATAR: { bones: 40, blendshapes: 30, style: 'stylized' },
  ANIMAL_AVATAR: { bones: 50, blendshapes: 25, style: 'creature' },
  ABSTRACT_ENTITY: { bones: 0, blendshapes: 0, style: 'particle' },
  HOLOGRAM: { bones: 65, blendshapes: 52, style: 'holographic' },
  VOLUMETRIC: { bones: 0, blendshapes: 0, style: 'volumetric' }
};

// Sensor Types
const SENSOR_TYPES = {
  // Vision
  CAMERA_RGB: { type: 'vision', channels: 3, fps: 60 },
  CAMERA_DEPTH: { type: 'vision', channels: 1, fps: 30 },
  LIDAR: { type: 'vision', points: 100000, fps: 20 },
  RADAR: { type: 'vision', range: 200, fps: 10 },
  
  // Audio
  MICROPHONE: { type: 'audio', channels: 2, sampleRate: 48000 },
  ULTRASONIC: { type: 'audio', range: 5, frequency: 40000 },
  
  // Touch
  PRESSURE: { type: 'touch', resolution: 100, range: [0, 100] },
  FORCE_TORQUE: { type: 'touch', axes: 6, range: [0, 500] },
  TACTILE_ARRAY: { type: 'touch', resolution: 256, range: [0, 1] },
  
  // Proprioception
  JOINT_ENCODER: { type: 'proprioception', resolution: 16384, units: 'radians' },
  IMU: { type: 'proprioception', axes: 9, rate: 1000 },
  
  // Environment
  TEMPERATURE: { type: 'environment', range: [-40, 85], units: 'celsius' },
  HUMIDITY: { type: 'environment', range: [0, 100], units: 'percent' },
  GAS: { type: 'environment', gases: ['CO2', 'O2', 'VOC'], units: 'ppm' }
};

// Actuator Types
const ACTUATOR_TYPES = {
  SERVO_MOTOR: { type: 'rotary', torque: 10, speed: 360 },
  STEPPER_MOTOR: { type: 'rotary', steps: 200, accuracy: 0.01 },
  LINEAR_ACTUATOR: { type: 'linear', force: 100, stroke: 300 },
  PNEUMATIC: { type: 'pressure', force: 500, speed: 'fast' },
  HYDRAULIC: { type: 'pressure', force: 5000, speed: 'medium' },
  MUSCLE_WIRE: { type: 'contraction', strain: 0.05, response: 'slow' },
  SPEAKER: { type: 'audio', frequency: [20, 20000], power: 10 },
  DISPLAY: { type: 'visual', resolution: [1920, 1080], type: 'LCD' },
  LED_ARRAY: { type: 'visual', count: 100, colors: 'RGB' }
};

// Embodiment States
const EMBODIMENT_STATES = {
  OFFLINE: 'OFFLINE',
  INITIALIZING: 'INITIALIZING',
  READY: 'READY',
  ACTIVE: 'ACTIVE',
  MOVING: 'MOVING',
  MANIPULATING: 'MANIPULATING',
  SENSING: 'SENSING',
  COMMUNICATING: 'COMMUNICATING',
  CHARGING: 'CHARGING',
  ERROR: 'ERROR',
  EMERGENCY_STOP: 'EMERGENCY_STOP'
};

// ═══════════════════════════════════════════════════════════════════════════
// EMBODIMENT STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Sensor - Individual sensor unit
 */
class Sensor {
  constructor(name, type, config = {}) {
    this.id = `SENS-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.name = name;
    this.type = type;
    this.config = { ...SENSOR_TYPES[type], ...config };
    
    this.enabled = true;
    this.lastReading = null;
    this.lastTimestamp = null;
    this.errorCount = 0;
    
    this.calibration = {
      offset: 0,
      scale: 1,
      noise: 0.01
    };
  }

  read() {
    if (!this.enabled) return null;
    
    // Simulate sensor reading
    const baseValue = Math.random();
    const calibrated = (baseValue + this.calibration.offset) * this.calibration.scale;
    const noisy = calibrated + (Math.random() - 0.5) * this.calibration.noise;
    
    this.lastReading = noisy;
    this.lastTimestamp = Date.now();
    
    return {
      sensor: this.name,
      value: this.lastReading,
      timestamp: this.lastTimestamp,
      type: this.type
    };
  }

  calibrate(offset, scale) {
    this.calibration.offset = offset;
    this.calibration.scale = scale;
    return this;
  }

  enable() { this.enabled = true; return this; }
  disable() { this.enabled = false; return this; }
}

/**
 * Actuator - Individual actuator unit
 */
class Actuator {
  constructor(name, type, config = {}) {
    this.id = `ACT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.name = name;
    this.type = type;
    this.config = { ...ACTUATOR_TYPES[type], ...config };
    
    this.enabled = true;
    this.currentState = 0;
    this.targetState = 0;
    this.limits = { min: 0, max: 1 };
    
    this.errorCount = 0;
    this.commandHistory = [];
  }

  setTarget(value) {
    if (!this.enabled) return false;
    
    // Clamp to limits
    this.targetState = Math.max(this.limits.min, Math.min(this.limits.max, value));
    
    this.commandHistory.push({
      target: this.targetState,
      timestamp: Date.now()
    });
    
    return true;
  }

  update(dt = 0.016) {
    // Simulate actuator movement
    const maxVelocity = 1.0; // units per second
    const maxDelta = maxVelocity * dt;
    
    const error = this.targetState - this.currentState;
    const delta = Math.max(-maxDelta, Math.min(maxDelta, error));
    
    this.currentState += delta;
    
    return this.currentState;
  }

  getState() {
    return {
      actuator: this.name,
      current: this.currentState,
      target: this.targetState,
      type: this.type
    };
  }

  setLimits(min, max) {
    this.limits = { min, max };
    return this;
  }

  enable() { this.enabled = true; return this; }
  disable() { this.enabled = false; return this; }
  emergencyStop() {
    this.targetState = this.currentState;
    this.enabled = false;
    return this;
  }
}

/**
 * Joint - Articulated joint with motor and encoder
 */
class Joint {
  constructor(name, parent = null, axis = [0, 0, 1]) {
    this.id = `JOINT-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
    this.name = name;
    this.parent = parent;
    this.axis = axis;
    
    // Position (radians or meters)
    this.position = 0;
    this.velocity = 0;
    this.effort = 0;
    
    // Limits
    this.limits = {
      lower: -Math.PI,
      upper: Math.PI,
      velocity: 2.0,
      effort: 100
    };
    
    // Control
    this.target = 0;
    this.mode = 'position'; // position, velocity, effort
    
    // PID
    this.pid = { p: 10, i: 0.1, d: 1 };
    this.integral = 0;
    this.lastError = 0;
  }

  setTarget(target, mode = null) {
    this.target = Math.max(this.limits.lower, Math.min(this.limits.upper, target));
    if (mode) this.mode = mode;
    return this;
  }

  update(dt = 0.016) {
    const error = this.target - this.position;
    this.integral += error * dt;
    const derivative = (error - this.lastError) / dt;
    this.lastError = error;
    
    // PID control
    let command = this.pid.p * error + this.pid.i * this.integral + this.pid.d * derivative;
    command = Math.max(-this.limits.effort, Math.min(this.limits.effort, command));
    
    // Update velocity and position
    const acceleration = command / 10; // Simplified dynamics
    this.velocity += acceleration * dt;
    this.velocity = Math.max(-this.limits.velocity, Math.min(this.limits.velocity, this.velocity));
    
    this.position += this.velocity * dt;
    this.position = Math.max(this.limits.lower, Math.min(this.limits.upper, this.position));
    
    this.effort = command;
    
    return this.position;
  }

  getState() {
    return {
      name: this.name,
      position: this.position,
      velocity: this.velocity,
      effort: this.effort,
      target: this.target
    };
  }
}

/**
 * Embodiment - Complete embodied agent
 */
class Embodiment {
  constructor(name, type, form) {
    this.id = `EMBODY-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.type = type;
    this.form = form;
    this.created_at = Date.now();
    
    // State
    this.state = EMBODIMENT_STATES.OFFLINE;
    
    // Components
    this.sensors = new Map();
    this.actuators = new Map();
    this.joints = new Map();
    
    // Pose
    this.pose = {
      position: [0, 0, 0],
      orientation: [0, 0, 0, 1], // Quaternion
      velocity: [0, 0, 0],
      angular_velocity: [0, 0, 0]
    };
    
    // Battery / Power
    this.battery = {
      level: 100,
      voltage: 12,
      current: 0,
      charging: false
    };
    
    // Telemetry
    this.telemetry = [];
    this.maxTelemetrySize = 1000;
    
    // Control
    this.controlLoop = null;
    this.controlRate = 100; // Hz
  }

  addSensor(name, type, config = {}) {
    const sensor = new Sensor(name, type, config);
    this.sensors.set(name, sensor);
    return sensor;
  }

  addActuator(name, type, config = {}) {
    const actuator = new Actuator(name, type, config);
    this.actuators.set(name, actuator);
    return actuator;
  }

  addJoint(name, parent = null, axis = [0, 0, 1]) {
    const joint = new Joint(name, parent, axis);
    this.joints.set(name, joint);
    return joint;
  }

  getSensor(name) {
    return this.sensors.get(name);
  }

  getActuator(name) {
    return this.actuators.get(name);
  }

  getJoint(name) {
    return this.joints.get(name);
  }

  initialize() {
    this.state = EMBODIMENT_STATES.INITIALIZING;
    
    // Initialize all components
    this.sensors.forEach(s => s.enable());
    this.actuators.forEach(a => a.enable());
    this.joints.forEach(j => j.position = 0);
    
    this.state = EMBODIMENT_STATES.READY;
    return this;
  }

  start() {
    if (this.state !== EMBODIMENT_STATES.READY) {
      throw new Error(`Cannot start: state is ${this.state}`);
    }
    
    this.state = EMBODIMENT_STATES.ACTIVE;
    
    // Start control loop (simulated)
    const dt = 1 / this.controlRate;
    this.controlLoop = setInterval(() => this.update(dt), dt * 1000);
    
    return this;
  }

  stop() {
    if (this.controlLoop) {
      clearInterval(this.controlLoop);
      this.controlLoop = null;
    }
    
    // Stop all actuators
    this.actuators.forEach(a => a.setTarget(a.currentState));
    this.joints.forEach(j => j.setTarget(j.position));
    
    this.state = EMBODIMENT_STATES.READY;
    return this;
  }

  emergencyStop() {
    if (this.controlLoop) {
      clearInterval(this.controlLoop);
      this.controlLoop = null;
    }
    
    this.actuators.forEach(a => a.emergencyStop());
    this.state = EMBODIMENT_STATES.EMERGENCY_STOP;
    
    return this;
  }

  update(dt) {
    // Read sensors
    const sensorData = {};
    this.sensors.forEach((sensor, name) => {
      sensorData[name] = sensor.read();
    });
    
    // Update joints
    this.joints.forEach(joint => joint.update(dt));
    
    // Update actuators
    this.actuators.forEach(actuator => actuator.update(dt));
    
    // Update battery (simplified)
    const powerDraw = this.actuators.size * 0.001;
    if (!this.battery.charging) {
      this.battery.level = Math.max(0, this.battery.level - powerDraw * dt);
    }
    
    // Record telemetry
    this.recordTelemetry({
      timestamp: Date.now(),
      state: this.state,
      pose: { ...this.pose },
      battery: this.battery.level,
      sensors: sensorData
    });
    
    return this;
  }

  recordTelemetry(data) {
    this.telemetry.push(data);
    if (this.telemetry.length > this.maxTelemetrySize) {
      this.telemetry.shift();
    }
  }

  setJointTargets(targets) {
    Object.entries(targets).forEach(([name, target]) => {
      const joint = this.joints.get(name);
      if (joint) joint.setTarget(target);
    });
    return this;
  }

  getJointStates() {
    const states = {};
    this.joints.forEach((joint, name) => {
      states[name] = joint.getState();
    });
    return states;
  }

  getSensorReadings() {
    const readings = {};
    this.sensors.forEach((sensor, name) => {
      readings[name] = sensor.lastReading;
    });
    return readings;
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      type: this.type,
      state: this.state,
      sensors: this.sensors.size,
      actuators: this.actuators.size,
      joints: this.joints.size,
      battery: this.battery.level,
      pose: this.pose
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SWARM SYSTEM
// ═══════════════════════════════════════════════════════════════════════════

/**
 * SwarmSystem - Multi-agent coordination
 */
class SwarmSystem {
  constructor(name) {
    this.id = `SWARM-${Date.now()}-${Math.random().toString(36).substr(2, 6)}`;
    this.name = name;
    this.created_at = Date.now();
    
    this.agents = new Map();
    this.formation = null;
    this.leader = null;
    
    // Communication
    this.messages = [];
    this.maxMessages = 1000;
    
    // Behaviors
    this.behaviors = new Map();
    this.activeBehavior = null;
  }

  addAgent(embodiment) {
    this.agents.set(embodiment.id, embodiment);
    return this;
  }

  removeAgent(id) {
    this.agents.delete(id);
    return this;
  }

  setLeader(id) {
    if (this.agents.has(id)) {
      this.leader = id;
    }
    return this;
  }

  setFormation(formation) {
    // Formation is array of relative positions
    this.formation = formation;
    return this;
  }

  addBehavior(name, behavior) {
    this.behaviors.set(name, behavior);
    return this;
  }

  activateBehavior(name) {
    this.activeBehavior = this.behaviors.get(name);
    return this;
  }

  broadcast(message) {
    const msg = {
      id: `MSG-${Date.now()}`,
      content: message,
      timestamp: Date.now(),
      from: 'system'
    };
    this.messages.push(msg);
    if (this.messages.length > this.maxMessages) {
      this.messages.shift();
    }
    return msg;
  }

  update(dt) {
    if (this.activeBehavior) {
      this.activeBehavior(this.agents, dt);
    }
    
    // Update all agents
    this.agents.forEach(agent => {
      if (agent.state === EMBODIMENT_STATES.ACTIVE) {
        agent.update(dt);
      }
    });
    
    return this;
  }

  getStatus() {
    return {
      id: this.id,
      name: this.name,
      agents: this.agents.size,
      leader: this.leader,
      active_behavior: this.activeBehavior?.name,
      messages: this.messages.length
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EMBODIMENT ENGINE PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

/**
 * EmbodimentEngineProtocol - Main protocol interface
 */
class EmbodimentEngineProtocol {
  constructor() {
    this.embodiments = new Map();
    this.swarms = new Map();
    this.templates = new Map();
    this.running = false;
  }

  initialize() {
    this.running = true;
    this.initializeTemplates();
    return {
      status: 'initialized',
      embodiment_types: Object.keys(EMBODIMENT_TYPES).length,
      physical_forms: Object.keys(PHYSICAL_FORMS).length,
      sensor_types: Object.keys(SENSOR_TYPES).length
    };
  }

  initializeTemplates() {
    // Humanoid template
    this.templates.set('humanoid', {
      type: EMBODIMENT_TYPES.PHYSICAL,
      form: PHYSICAL_FORMS.HUMANOID,
      sensors: ['CAMERA_RGB', 'IMU', 'FORCE_TORQUE'],
      joints: ['head_pan', 'head_tilt', 'shoulder_l', 'shoulder_r', 'elbow_l', 'elbow_r', 'hip_l', 'hip_r', 'knee_l', 'knee_r']
    });
    
    // Drone template
    this.templates.set('drone', {
      type: EMBODIMENT_TYPES.PHYSICAL,
      form: PHYSICAL_FORMS.DRONE_AERIAL,
      sensors: ['CAMERA_RGB', 'CAMERA_DEPTH', 'IMU', 'ULTRASONIC'],
      actuators: ['motor_1', 'motor_2', 'motor_3', 'motor_4']
    });
    
    // Avatar template
    this.templates.set('avatar', {
      type: EMBODIMENT_TYPES.VIRTUAL,
      form: VIRTUAL_FORMS.HUMANOID_AVATAR,
      sensors: [],
      joints: ['spine', 'neck', 'head', 'shoulder_l', 'shoulder_r', 'elbow_l', 'elbow_r', 'wrist_l', 'wrist_r', 'hip_l', 'hip_r', 'knee_l', 'knee_r', 'ankle_l', 'ankle_r']
    });
  }

  // Embodiment Management
  createEmbodiment(name, type, form) {
    const embodiment = new Embodiment(name, type, form);
    this.embodiments.set(embodiment.id, embodiment);
    return embodiment;
  }

  createFromTemplate(name, templateName) {
    const template = this.templates.get(templateName);
    if (!template) {
      throw new Error(`Template not found: ${templateName}`);
    }
    
    const embodiment = new Embodiment(name, template.type, template.form);
    
    // Add sensors
    template.sensors?.forEach(sensorType => {
      embodiment.addSensor(sensorType.toLowerCase(), sensorType);
    });
    
    // Add joints
    template.joints?.forEach((jointName, i) => {
      embodiment.addJoint(jointName, i > 0 ? template.joints[i-1] : null);
    });
    
    // Add actuators
    template.actuators?.forEach(actuatorName => {
      embodiment.addActuator(actuatorName, 'SERVO_MOTOR');
    });
    
    this.embodiments.set(embodiment.id, embodiment);
    return embodiment;
  }

  getEmbodiment(id) {
    return this.embodiments.get(id);
  }

  listEmbodiments() {
    return Array.from(this.embodiments.values()).map(e => e.getStatus());
  }

  // Swarm Management
  createSwarm(name) {
    const swarm = new SwarmSystem(name);
    this.swarms.set(swarm.id, swarm);
    return swarm;
  }

  getSwarm(id) {
    return this.swarms.get(id);
  }

  // Lifecycle
  initializeAll() {
    this.embodiments.forEach(e => e.initialize());
    return this;
  }

  startAll() {
    this.embodiments.forEach(e => {
      if (e.state === EMBODIMENT_STATES.READY) {
        e.start();
      }
    });
    return this;
  }

  stopAll() {
    this.embodiments.forEach(e => e.stop());
    return this;
  }

  emergencyStopAll() {
    this.embodiments.forEach(e => e.emergencyStop());
    return this;
  }

  // Utility
  listTemplates() {
    return Array.from(this.templates.keys());
  }

  listPhysicalForms() {
    return Object.entries(PHYSICAL_FORMS).map(([key, value]) => ({ key, ...value }));
  }

  listVirtualForms() {
    return Object.entries(VIRTUAL_FORMS).map(([key, value]) => ({ key, ...value }));
  }

  listSensorTypes() {
    return Object.entries(SENSOR_TYPES).map(([key, value]) => ({ key, ...value }));
  }

  getStatus() {
    return {
      running: this.running,
      embodiments: this.embodiments.size,
      swarms: this.swarms.size,
      templates: this.templates.size,
      active: Array.from(this.embodiments.values()).filter(e => e.state === EMBODIMENT_STATES.ACTIVE).length
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  EMBODIMENT_TYPES,
  PHYSICAL_FORMS,
  VIRTUAL_FORMS,
  SENSOR_TYPES,
  ACTUATOR_TYPES,
  EMBODIMENT_STATES,
  Sensor,
  Actuator,
  Joint,
  Embodiment,
  SwarmSystem,
  EmbodimentEngineProtocol
};

export default EmbodimentEngineProtocol;

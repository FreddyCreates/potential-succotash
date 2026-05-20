/**
 * Dark Isolation Protocol (DRK-024)
 * 
 * Threat isolation and containment for the dark layer.
 * Sandbox malicious activity without affecting production.
 * 
 * Protocol ID: DRK-024
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Isolation levels
 */
export const ISOLATION_LEVELS = {
  NONE: 0,
  MONITORED: 1,
  RESTRICTED: 2,
  CONTAINED: 3,
  QUARANTINE: 4
};

/**
 * Containment actions
 */
export const CONTAINMENT_ACTIONS = {
  MONITOR: 'monitor',
  THROTTLE: 'throttle',
  REDIRECT: 'redirect',
  SANDBOX: 'sandbox',
  BLOCK: 'block'
};

/**
 * Isolation Cell
 */
export class IsolationCell {
  constructor(id, level = ISOLATION_LEVELS.CONTAINED) {
    this.id = id;
    this.level = level;
    this.created = Date.now();
    this.entities = new Set();
    this.activity = [];
    this.rules = [];
    this.active = true;
  }
  
  /**
   * Add entity to cell
   */
  addEntity(entityId) {
    this.entities.add(entityId);
    this.recordActivity('entity_added', { entityId });
    return this;
  }
  
  /**
   * Remove entity from cell
   */
  removeEntity(entityId) {
    this.entities.delete(entityId);
    this.recordActivity('entity_removed', { entityId });
    return this;
  }
  
  /**
   * Check if entity is in cell
   */
  hasEntity(entityId) {
    return this.entities.has(entityId);
  }
  
  /**
   * Add rule
   */
  addRule(rule) {
    this.rules.push({
      ...rule,
      added: Date.now()
    });
    return this;
  }
  
  /**
   * Record activity
   */
  recordActivity(type, data = {}) {
    this.activity.push({
      type,
      data,
      timestamp: Date.now()
    });
    
    while (this.activity.length > 1000) {
      this.activity.shift();
    }
  }
  
  /**
   * Get allowed actions for isolation level
   */
  getAllowedActions() {
    switch (this.level) {
      case ISOLATION_LEVELS.NONE:
        return ['all'];
      case ISOLATION_LEVELS.MONITORED:
        return ['read', 'write', 'execute'];
      case ISOLATION_LEVELS.RESTRICTED:
        return ['read', 'limited-write'];
      case ISOLATION_LEVELS.CONTAINED:
        return ['read'];
      case ISOLATION_LEVELS.QUARANTINE:
        return [];
      default:
        return [];
    }
  }
  
  /**
   * Check if action is allowed
   */
  isAllowed(action) {
    const allowed = this.getAllowedActions();
    return allowed.includes('all') || allowed.includes(action);
  }
  
  /**
   * Get cell summary
   */
  getSummary() {
    return {
      id: this.id,
      level: this.level,
      active: this.active,
      entities: this.entities.size,
      rules: this.rules.length,
      activityCount: this.activity.length,
      created: this.created
    };
  }
}

/**
 * Isolation Manager
 */
export class IsolationManager {
  constructor(config = {}) {
    this.config = {
      defaultLevel: config.defaultLevel || ISOLATION_LEVELS.CONTAINED,
      maxCells: config.maxCells || 1000,
      ...config
    };
    
    this.cells = new Map();
    this.entityToCell = new Map();
    
    this.stats = {
      cellsCreated: 0,
      entitiesIsolated: 0,
      actionsBlocked: 0
    };
  }
  
  /**
   * Create isolation cell
   */
  createCell(level = null) {
    const id = `cell-${Date.now()}-${Math.random().toString(36).slice(2)}`;
    const cell = new IsolationCell(id, level ?? this.config.defaultLevel);
    
    this.cells.set(id, cell);
    this.stats.cellsCreated++;
    
    // Enforce max cells
    while (this.cells.size > this.config.maxCells) {
      const oldest = this.cells.keys().next().value;
      this.destroyCell(oldest);
    }
    
    return cell;
  }
  
  /**
   * Get or create cell for entity
   */
  getOrCreateCell(entityId) {
    if (this.entityToCell.has(entityId)) {
      return this.cells.get(this.entityToCell.get(entityId));
    }
    
    const cell = this.createCell();
    this.isolate(entityId, cell.id);
    return cell;
  }
  
  /**
   * Isolate entity
   */
  isolate(entityId, cellId = null) {
    let cell;
    
    if (cellId) {
      cell = this.cells.get(cellId);
    } else {
      cell = this.createCell();
    }
    
    if (!cell) return null;
    
    // Remove from existing cell if any
    const existingCellId = this.entityToCell.get(entityId);
    if (existingCellId) {
      const existingCell = this.cells.get(existingCellId);
      if (existingCell) {
        existingCell.removeEntity(entityId);
      }
    }
    
    cell.addEntity(entityId);
    this.entityToCell.set(entityId, cell.id);
    this.stats.entitiesIsolated++;
    
    return cell;
  }
  
  /**
   * Release entity
   */
  release(entityId) {
    const cellId = this.entityToCell.get(entityId);
    if (!cellId) return false;
    
    const cell = this.cells.get(cellId);
    if (cell) {
      cell.removeEntity(entityId);
    }
    
    this.entityToCell.delete(entityId);
    return true;
  }
  
  /**
   * Check if entity is isolated
   */
  isIsolated(entityId) {
    return this.entityToCell.has(entityId);
  }
  
  /**
   * Get isolation level for entity
   */
  getIsolationLevel(entityId) {
    const cellId = this.entityToCell.get(entityId);
    if (!cellId) return ISOLATION_LEVELS.NONE;
    
    const cell = this.cells.get(cellId);
    return cell ? cell.level : ISOLATION_LEVELS.NONE;
  }
  
  /**
   * Check if action is allowed for entity
   */
  checkAction(entityId, action) {
    const cellId = this.entityToCell.get(entityId);
    if (!cellId) return { allowed: true };
    
    const cell = this.cells.get(cellId);
    if (!cell) return { allowed: true };
    
    const allowed = cell.isAllowed(action);
    
    if (!allowed) {
      this.stats.actionsBlocked++;
      cell.recordActivity('action_blocked', { entityId, action });
    }
    
    return {
      allowed,
      level: cell.level,
      cellId: cell.id
    };
  }
  
  /**
   * Escalate isolation level
   */
  escalate(entityId) {
    const cellId = this.entityToCell.get(entityId);
    if (!cellId) return null;
    
    const cell = this.cells.get(cellId);
    if (!cell) return null;
    
    if (cell.level < ISOLATION_LEVELS.QUARANTINE) {
      cell.level++;
      cell.recordActivity('escalated', { newLevel: cell.level });
    }
    
    return cell.level;
  }
  
  /**
   * De-escalate isolation level
   */
  deescalate(entityId) {
    const cellId = this.entityToCell.get(entityId);
    if (!cellId) return null;
    
    const cell = this.cells.get(cellId);
    if (!cell) return null;
    
    if (cell.level > ISOLATION_LEVELS.NONE) {
      cell.level--;
      cell.recordActivity('deescalated', { newLevel: cell.level });
    }
    
    return cell.level;
  }
  
  /**
   * Destroy cell
   */
  destroyCell(cellId) {
    const cell = this.cells.get(cellId);
    if (!cell) return false;
    
    // Release all entities
    for (const entityId of cell.entities) {
      this.entityToCell.delete(entityId);
    }
    
    this.cells.delete(cellId);
    return true;
  }
  
  /**
   * Get all cells
   */
  getAllCells() {
    return [...this.cells.values()].map(c => c.getSummary());
  }
  
  /**
   * Get statistics
   */
  getStats() {
    const levelCounts = {};
    for (const level of Object.values(ISOLATION_LEVELS)) {
      levelCounts[level] = 0;
    }
    
    for (const cell of this.cells.values()) {
      levelCounts[cell.level]++;
    }
    
    return {
      ...this.stats,
      activeCells: this.cells.size,
      isolatedEntities: this.entityToCell.size,
      byLevel: levelCounts
    };
  }
}

/**
 * Dark Isolation Protocol
 */
export const DarkIsolationProtocol = {
  id: 'DRK-024',
  name: 'Dark Isolation Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  levels: ISOLATION_LEVELS,
  actions: CONTAINMENT_ACTIONS,
  
  createCell: (id, level) => new IsolationCell(id, level),
  createManager: (config) => new IsolationManager(config)
};

export default DarkIsolationProtocol;

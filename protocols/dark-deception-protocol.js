/**
 * Dark Deception Protocol (DRK-023)
 * 
 * Active deception techniques for the dark layer.
 * Mislead attackers with fake data and false trails.
 * 
 * Protocol ID: DRK-023
 * Category: Dark Operations
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Deception types
 */
export const DECEPTION_TYPES = {
  FAKE_DATA: 'fake-data',
  MISDIRECTION: 'misdirection',
  IMPERSONATION: 'impersonation',
  CONFUSION: 'confusion',
  BREADCRUMB: 'breadcrumb'
};

/**
 * Asset types for fake generation
 */
export const FAKE_ASSET_TYPES = {
  CREDENTIALS: 'credentials',
  API_KEYS: 'api-keys',
  TOKENS: 'tokens',
  DOCUMENTS: 'documents',
  DATABASE_RECORDS: 'database-records',
  CONFIG_FILES: 'config-files'
};

/**
 * Fake Data Generator
 */
export class FakeDataGenerator {
  constructor() {
    this.firstNames = ['John', 'Jane', 'Bob', 'Alice', 'Charlie', 'Diana', 'Eve', 'Frank'];
    this.lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Miller', 'Davis'];
    this.domains = ['example.com', 'test.org', 'fake.net', 'honeypot.io'];
  }
  
  /**
   * Generate fake credentials
   */
  generateCredentials(count = 5) {
    const creds = [];
    for (let i = 0; i < count; i++) {
      const first = this.firstNames[Math.floor(Math.random() * this.firstNames.length)];
      const last = this.lastNames[Math.floor(Math.random() * this.lastNames.length)];
      const domain = this.domains[Math.floor(Math.random() * this.domains.length)];
      
      creds.push({
        username: `${first.toLowerCase()}.${last.toLowerCase()}`,
        email: `${first.toLowerCase()}@${domain}`,
        password: this.generatePassword(),
        role: Math.random() > 0.7 ? 'admin' : 'user'
      });
    }
    return creds;
  }
  
  /**
   * Generate fake password
   */
  generatePassword() {
    const templates = [
      'Password123!',
      'Admin@2024',
      '12345678',
      'qwerty123',
      'Welcome1!',
      'Changeme!'
    ];
    return templates[Math.floor(Math.random() * templates.length)];
  }
  
  /**
   * Generate fake API keys
   */
  generateApiKeys(count = 3) {
    const keys = [];
    const prefixes = ['sk_live_', 'pk_test_', 'api_', 'key_'];
    
    for (let i = 0; i < count; i++) {
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
      const key = prefix + this.randomString(32);
      
      keys.push({
        key,
        name: `API Key ${i + 1}`,
        created: new Date(Date.now() - Math.random() * 365 * 24 * 60 * 60 * 1000).toISOString(),
        scopes: ['read', 'write'].slice(0, Math.ceil(Math.random() * 2))
      });
    }
    return keys;
  }
  
  /**
   * Generate fake tokens
   */
  generateTokens(count = 3) {
    return Array(count).fill(null).map(() => ({
      token: 'eyJ' + this.randomString(100) + '.' + this.randomString(50),
      type: 'Bearer',
      expires: new Date(Date.now() + 3600000).toISOString()
    }));
  }
  
  /**
   * Generate fake database records
   */
  generateDatabaseRecords(count = 10) {
    const records = [];
    for (let i = 0; i < count; i++) {
      records.push({
        id: i + 1,
        ssn: `${this.randomDigits(3)}-${this.randomDigits(2)}-${this.randomDigits(4)}`,
        name: `${this.firstNames[i % this.firstNames.length]} ${this.lastNames[i % this.lastNames.length]}`,
        credit_card: `4${this.randomDigits(15)}`,
        balance: Math.floor(Math.random() * 100000) / 100
      });
    }
    return records;
  }
  
  /**
   * Generate fake config file
   */
  generateConfigFile() {
    return {
      database: {
        host: 'db.internal.fake',
        port: 5432,
        user: 'admin',
        password: 'SuperSecret123!',
        database: 'production'
      },
      aws: {
        access_key: 'AKIA' + this.randomString(16).toUpperCase(),
        secret_key: this.randomString(40)
      },
      stripe: {
        api_key: 'sk_live_' + this.randomString(24)
      }
    };
  }
  
  randomString(length) {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }
  
  randomDigits(length) {
    let result = '';
    for (let i = 0; i < length; i++) {
      result += Math.floor(Math.random() * 10);
    }
    return result;
  }
}

/**
 * Deception Engine
 */
export class DeceptionEngine {
  constructor(config = {}) {
    this.config = {
      maxBreadcrumbs: config.maxBreadcrumbs || 100,
      ...config
    };
    
    this.generator = new FakeDataGenerator();
    this.breadcrumbs = [];
    this.interactions = [];
    
    this.stats = {
      deceptionsServed: 0,
      byType: {}
    };
  }
  
  /**
   * Generate deceptive response
   */
  deceive(type, options = {}) {
    let data;
    
    switch (type) {
      case FAKE_ASSET_TYPES.CREDENTIALS:
        data = this.generator.generateCredentials(options.count || 5);
        break;
        
      case FAKE_ASSET_TYPES.API_KEYS:
        data = this.generator.generateApiKeys(options.count || 3);
        break;
        
      case FAKE_ASSET_TYPES.TOKENS:
        data = this.generator.generateTokens(options.count || 3);
        break;
        
      case FAKE_ASSET_TYPES.DATABASE_RECORDS:
        data = this.generator.generateDatabaseRecords(options.count || 10);
        break;
        
      case FAKE_ASSET_TYPES.CONFIG_FILES:
        data = this.generator.generateConfigFile();
        break;
        
      default:
        data = { fake: true, type };
    }
    
    this.stats.deceptionsServed++;
    this.stats.byType[type] = (this.stats.byType[type] || 0) + 1;
    
    return {
      type,
      data,
      timestamp: Date.now(),
      phi: this.computePhi(data)
    };
  }
  
  computePhi(data) {
    const str = JSON.stringify(data);
    let sum = 0;
    for (let i = 0; i < Math.min(str.length, 100); i++) {
      sum += str.charCodeAt(i) * Math.pow(PHI, i % 8);
    }
    return (sum % 1).toFixed(6);
  }
  
  /**
   * Plant breadcrumb
   */
  plantBreadcrumb(path, data, metadata = {}) {
    const breadcrumb = {
      id: `bc-${Date.now()}-${Math.random().toString(36).slice(2)}`,
      path,
      data,
      metadata,
      planted: Date.now(),
      accessed: []
    };
    
    this.breadcrumbs.push(breadcrumb);
    
    while (this.breadcrumbs.length > this.config.maxBreadcrumbs) {
      this.breadcrumbs.shift();
    }
    
    return breadcrumb.id;
  }
  
  /**
   * Check if path is a breadcrumb
   */
  checkBreadcrumb(path, visitorInfo = {}) {
    const breadcrumb = this.breadcrumbs.find(b => b.path === path);
    
    if (breadcrumb) {
      breadcrumb.accessed.push({
        timestamp: Date.now(),
        ...visitorInfo
      });
      
      return {
        isBreadcrumb: true,
        breadcrumbId: breadcrumb.id,
        data: breadcrumb.data
      };
    }
    
    return { isBreadcrumb: false };
  }
  
  /**
   * Get breadcrumb trail
   */
  getBreadcrumbTrail(breadcrumbId) {
    const breadcrumb = this.breadcrumbs.find(b => b.id === breadcrumbId);
    return breadcrumb ? breadcrumb.accessed : [];
  }
  
  /**
   * Record interaction
   */
  recordInteraction(entityId, deceptionType, context = {}) {
    this.interactions.push({
      entityId,
      deceptionType,
      context,
      timestamp: Date.now()
    });
    
    while (this.interactions.length > 10000) {
      this.interactions.shift();
    }
  }
  
  /**
   * Get statistics
   */
  getStats() {
    return {
      ...this.stats,
      breadcrumbs: this.breadcrumbs.length,
      interactions: this.interactions.length,
      accessedBreadcrumbs: this.breadcrumbs.filter(b => b.accessed.length > 0).length
    };
  }
}

/**
 * Dark Deception Protocol
 */
export const DarkDeceptionProtocol = {
  id: 'DRK-023',
  name: 'Dark Deception Protocol',
  version: '1.0.0',
  category: 'dark-operations',
  
  constants: { PHI, HB, THRESHOLD },
  deceptionTypes: DECEPTION_TYPES,
  assetTypes: FAKE_ASSET_TYPES,
  
  createGenerator: () => new FakeDataGenerator(),
  createEngine: (config) => new DeceptionEngine(config)
};

export default DarkDeceptionProtocol;

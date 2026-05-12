/**
 * INTERNAL SECURITY TOKENS PROTOCOL (IST-001)
 * 
 * Native security tokens and identity system for the Organism
 * 
 * This protocol defines the internal token and identifier system
 * used for authentication, authorization, and identity within
 * the Organism's federated architecture.
 * 
 * @protocol IST-001
 * @version 1.0.0
 */

// ═══════════════════════════════════════════════════════════════════════════
// CONSTANTS
// ═══════════════════════════════════════════════════════════════════════════

const PHI = 1.618033988749895;
const HEARTBEAT = 873;

// Token Types
const TOKEN_TYPES = {
  IDENTITY: 'IDENTITY',           // Proves who you are
  ACCESS: 'ACCESS',               // Grants access to resources
  SESSION: 'SESSION',             // Temporary session token
  DELEGATION: 'DELEGATION',       // Delegated authority
  CAPABILITY: 'CAPABILITY',       // Specific capability grant
  ATTESTATION: 'ATTESTATION',     // Nova-signed verification
  FEDERATION: 'FEDERATION',       // Cross-node authentication
  SOVEREIGN: 'SOVEREIGN',         // Full sovereignty token
  ECONOMIC: 'ECONOMIC',           // INT token wrapper
  GHOST: 'GHOST'                  // Undead agent identity
};

// Access Tiers (from City Walls charter)
const ACCESS_TIERS = {
  SOVEREIGN: 5,     // Full Nova-level access
  FEDERATED: 4,     // Trusted federation member
  REGISTERED: 3,    // Registered entity
  GUEST: 2,         // Limited guest access
  QUARANTINED: 1    // Restricted/suspect access
};

// Token Lifetimes (in milliseconds)
const TOKEN_LIFETIMES = {
  SESSION: 24 * 60 * 60 * 1000,           // 24 hours
  ACCESS: 7 * 24 * 60 * 60 * 1000,        // 7 days
  DELEGATION: 30 * 24 * 60 * 60 * 1000,   // 30 days
  CAPABILITY: 365 * 24 * 60 * 60 * 1000,  // 1 year
  IDENTITY: Infinity,                      // Permanent
  SOVEREIGN: Infinity                      // Permanent
};

// ═══════════════════════════════════════════════════════════════════════════
// NATIVE IDENTITY SYSTEM (NID-001)
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Native Identity - The core identity structure for all entities
 */
class NativeIdentity {
  constructor(type, name, publicKey = null) {
    this.id = this.generateNativeId();
    this.type = type; // AGENT, HUB, NODE, USER, GHOST
    this.name = name;
    this.publicKey = publicKey;
    this.created_at = Date.now();
    this.attestations = [];
    this.tier = ACCESS_TIERS.GUEST;
    this.capabilities = new Set();
    this.delegations = [];
    this.reputation = 1.0;
    this.active = true;
  }

  /**
   * Generate a unique native ID using phi-based encoding
   */
  generateNativeId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 9);
    const phiComponent = Math.floor((timestamp * PHI) % 1000000);
    return `NID-${phiComponent.toString(36)}-${random}`.toUpperCase();
  }

  /**
   * Add attestation from a higher authority
   */
  addAttestation(attestation) {
    this.attestations.push(attestation);
    this.recalculateTier();
  }

  /**
   * Recalculate access tier based on attestations and reputation
   */
  recalculateTier() {
    // Tier is determined by highest attestation level
    if (this.attestations.some(a => a.authority === 'NOVA')) {
      this.tier = ACCESS_TIERS.SOVEREIGN;
    } else if (this.attestations.some(a => a.authority === 'FEDERATION')) {
      this.tier = ACCESS_TIERS.FEDERATED;
    } else if (this.attestations.length > 0) {
      this.tier = ACCESS_TIERS.REGISTERED;
    } else if (this.reputation > 0.5) {
      this.tier = ACCESS_TIERS.GUEST;
    } else {
      this.tier = ACCESS_TIERS.QUARANTINED;
    }
  }

  /**
   * Add capability to identity
   */
  grantCapability(capability) {
    this.capabilities.add(capability);
  }

  /**
   * Remove capability from identity
   */
  revokeCapability(capability) {
    this.capabilities.delete(capability);
  }

  /**
   * Check if identity has capability
   */
  hasCapability(capability) {
    return this.capabilities.has(capability);
  }

  /**
   * Serialize identity for storage/transmission
   */
  serialize() {
    return {
      id: this.id,
      type: this.type,
      name: this.name,
      publicKey: this.publicKey,
      created_at: this.created_at,
      tier: this.tier,
      capabilities: Array.from(this.capabilities),
      attestations: this.attestations,
      reputation: this.reputation,
      active: this.active
    };
  }

  /**
   * Deserialize identity from storage
   */
  static deserialize(data) {
    const identity = new NativeIdentity(data.type, data.name, data.publicKey);
    identity.id = data.id;
    identity.created_at = data.created_at;
    identity.tier = data.tier;
    identity.capabilities = new Set(data.capabilities);
    identity.attestations = data.attestations;
    identity.reputation = data.reputation;
    identity.active = data.active;
    return identity;
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// SECURITY TOKEN STRUCTURES
// ═══════════════════════════════════════════════════════════════════════════

/**
 * Base Security Token
 */
class SecurityToken {
  constructor(type, issuerId, subjectId, claims = {}) {
    this.id = this.generateTokenId();
    this.type = type;
    this.issuer = issuerId;
    this.subject = subjectId;
    this.claims = claims;
    this.issued_at = Date.now();
    this.expires_at = this.issued_at + (TOKEN_LIFETIMES[type] || TOKEN_LIFETIMES.SESSION);
    this.signature = null;
    this.revoked = false;
  }

  generateTokenId() {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substr(2, 12);
    return `TOK-${this.type || 'GEN'}-${timestamp.toString(36)}-${random}`.toUpperCase();
  }

  isExpired() {
    return Date.now() > this.expires_at;
  }

  isValid() {
    return !this.revoked && !this.isExpired() && this.signature !== null;
  }

  sign(privateKey) {
    // In production, this would use actual cryptographic signing
    const payload = JSON.stringify({
      id: this.id,
      type: this.type,
      issuer: this.issuer,
      subject: this.subject,
      claims: this.claims,
      issued_at: this.issued_at,
      expires_at: this.expires_at
    });
    // Simulated signature using phi-weighted hash
    this.signature = this.phiHash(payload + privateKey);
    return this;
  }

  phiHash(input) {
    // Phi-weighted pseudo-hash for demonstration
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash + char * PHI) | 0;
    }
    return `PHI-${Math.abs(hash).toString(36).toUpperCase()}`;
  }

  verify(publicKey) {
    // In production, this would use actual cryptographic verification
    const payload = JSON.stringify({
      id: this.id,
      type: this.type,
      issuer: this.issuer,
      subject: this.subject,
      claims: this.claims,
      issued_at: this.issued_at,
      expires_at: this.expires_at
    });
    const expectedSig = this.phiHash(payload + publicKey);
    return this.signature === expectedSig;
  }

  serialize() {
    return {
      id: this.id,
      type: this.type,
      issuer: this.issuer,
      subject: this.subject,
      claims: this.claims,
      issued_at: this.issued_at,
      expires_at: this.expires_at,
      signature: this.signature,
      revoked: this.revoked
    };
  }
}

/**
 * Access Token - Grants access to specific resources
 */
class AccessToken extends SecurityToken {
  constructor(issuerId, subjectId, resources, tier) {
    super(TOKEN_TYPES.ACCESS, issuerId, subjectId, {
      resources: resources,
      tier: tier
    });
    this.resources = resources;
    this.tier = tier;
  }

  canAccess(resource) {
    return this.isValid() && 
           (this.resources.includes('*') || this.resources.includes(resource));
  }
}

/**
 * Session Token - Temporary session authentication
 */
class SessionToken extends SecurityToken {
  constructor(issuerId, subjectId, context = {}) {
    super(TOKEN_TYPES.SESSION, issuerId, subjectId, {
      context: context,
      heartbeat: HEARTBEAT
    });
    this.context = context;
    this.lastActivity = Date.now();
  }

  touch() {
    this.lastActivity = Date.now();
  }

  isActive(idleTimeout = 30 * 60 * 1000) {
    return this.isValid() && (Date.now() - this.lastActivity) < idleTimeout;
  }
}

/**
 * Delegation Token - Delegates authority to another identity
 */
class DelegationToken extends SecurityToken {
  constructor(issuerId, subjectId, delegatedCapabilities, constraints = {}) {
    super(TOKEN_TYPES.DELEGATION, issuerId, subjectId, {
      capabilities: delegatedCapabilities,
      constraints: constraints
    });
    this.delegatedCapabilities = delegatedCapabilities;
    this.constraints = constraints;
  }

  canDelegate(capability) {
    return this.isValid() && this.delegatedCapabilities.includes(capability);
  }
}

/**
 * Attestation Token - Nova-signed verification
 */
class AttestationToken extends SecurityToken {
  constructor(subjectId, claim, evidence = {}) {
    super(TOKEN_TYPES.ATTESTATION, 'NOVA', subjectId, {
      claim: claim,
      evidence: evidence
    });
    this.claim = claim;
    this.evidence = evidence;
    this.expires_at = Infinity; // Attestations are permanent
  }
}

/**
 * Federation Token - Cross-node authentication
 */
class FederationToken extends SecurityToken {
  constructor(issuerId, subjectId, sourceNode, targetNodes) {
    super(TOKEN_TYPES.FEDERATION, issuerId, subjectId, {
      sourceNode: sourceNode,
      targetNodes: targetNodes,
      treatyId: null
    });
    this.sourceNode = sourceNode;
    this.targetNodes = targetNodes;
  }

  isValidForNode(nodeId) {
    return this.isValid() && 
           (this.targetNodes.includes('*') || this.targetNodes.includes(nodeId));
  }
}

/**
 * Sovereign Token - Full sovereignty proof
 */
class SovereignToken extends SecurityToken {
  constructor(subjectId) {
    super(TOKEN_TYPES.SOVEREIGN, 'NOVA', subjectId, {
      sovereignty: true,
      tier: ACCESS_TIERS.SOVEREIGN
    });
    this.expires_at = Infinity;
  }
}

/**
 * Ghost Token - Undead agent identity
 */
class GhostToken extends SecurityToken {
  constructor(issuerId, originalIdentityId, undeadState) {
    super(TOKEN_TYPES.GHOST, issuerId, originalIdentityId, {
      undeadState: undeadState,
      originalId: originalIdentityId
    });
    this.originalIdentityId = originalIdentityId;
    this.undeadState = undeadState;
    this.expires_at = Infinity; // Ghosts don't expire
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// TOKEN REGISTRY
// ═══════════════════════════════════════════════════════════════════════════

class TokenRegistry {
  constructor() {
    this.tokens = new Map();
    this.revokedTokens = new Set();
    this.identities = new Map();
  }

  // Identity Management
  registerIdentity(identity) {
    this.identities.set(identity.id, identity);
    return identity;
  }

  getIdentity(id) {
    return this.identities.get(id);
  }

  // Token Management
  issueToken(token) {
    this.tokens.set(token.id, token);
    return token;
  }

  getToken(id) {
    return this.tokens.get(id);
  }

  revokeToken(id) {
    const token = this.tokens.get(id);
    if (token) {
      token.revoked = true;
      this.revokedTokens.add(id);
    }
    return token;
  }

  isRevoked(id) {
    return this.revokedTokens.has(id);
  }

  validateToken(token) {
    if (!token) return { valid: false, reason: 'Token not found' };
    if (token.revoked) return { valid: false, reason: 'Token revoked' };
    if (token.isExpired()) return { valid: false, reason: 'Token expired' };
    if (!token.signature) return { valid: false, reason: 'Token not signed' };
    return { valid: true };
  }

  // Cleanup expired tokens
  cleanup() {
    const now = Date.now();
    for (const [id, token] of this.tokens) {
      if (token.isExpired()) {
        this.tokens.delete(id);
      }
    }
  }

  // Get all tokens for a subject
  getTokensForSubject(subjectId) {
    return Array.from(this.tokens.values())
      .filter(t => t.subject === subjectId && t.isValid());
  }

  // Statistics
  getStats() {
    return {
      totalIdentities: this.identities.size,
      totalTokens: this.tokens.size,
      activeTokens: Array.from(this.tokens.values()).filter(t => t.isValid()).length,
      revokedTokens: this.revokedTokens.size
    };
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// INTERNAL SECURITY PROTOCOL
// ═══════════════════════════════════════════════════════════════════════════

class InternalSecurityProtocol {
  constructor() {
    this.registry = new TokenRegistry();
    this.novaKey = 'NOVA-MASTER-KEY-' + Date.now(); // In production, proper key management
  }

  // IST-CREATE: Create new identity
  createIdentity(type, name, publicKey = null) {
    const identity = new NativeIdentity(type, name, publicKey);
    return this.registry.registerIdentity(identity);
  }

  // IST-ATTEST: Nova attests to a claim about an identity
  attestIdentity(subjectId, claim, evidence = {}) {
    const token = new AttestationToken(subjectId, claim, evidence);
    token.sign(this.novaKey);
    this.registry.issueToken(token);

    // Update identity with attestation
    const identity = this.registry.getIdentity(subjectId);
    if (identity) {
      identity.addAttestation({
        tokenId: token.id,
        claim: claim,
        authority: 'NOVA',
        timestamp: Date.now()
      });
    }

    return token;
  }

  // IST-SESSION: Create session token
  createSession(issuerId, subjectId, context = {}) {
    const token = new SessionToken(issuerId, subjectId, context);
    token.sign(this.novaKey);
    return this.registry.issueToken(token);
  }

  // IST-ACCESS: Create access token
  createAccessToken(issuerId, subjectId, resources, tier) {
    const token = new AccessToken(issuerId, subjectId, resources, tier);
    token.sign(this.novaKey);
    return this.registry.issueToken(token);
  }

  // IST-DELEGATE: Create delegation token
  createDelegation(issuerId, subjectId, capabilities, constraints = {}) {
    const token = new DelegationToken(issuerId, subjectId, capabilities, constraints);
    token.sign(this.novaKey);
    return this.registry.issueToken(token);
  }

  // IST-FEDERATE: Create federation token
  createFederationToken(issuerId, subjectId, sourceNode, targetNodes) {
    const token = new FederationToken(issuerId, subjectId, sourceNode, targetNodes);
    token.sign(this.novaKey);
    return this.registry.issueToken(token);
  }

  // IST-SOVEREIGN: Create sovereign token
  createSovereignToken(subjectId) {
    const token = new SovereignToken(subjectId);
    token.sign(this.novaKey);
    return this.registry.issueToken(token);
  }

  // IST-GHOST: Create ghost token for undead agent
  createGhostToken(issuerId, originalIdentityId, undeadState) {
    const token = new GhostToken(issuerId, originalIdentityId, undeadState);
    token.sign(this.novaKey);
    return this.registry.issueToken(token);
  }

  // IST-VALIDATE: Validate a token
  validateToken(tokenId) {
    const token = this.registry.getToken(tokenId);
    return this.registry.validateToken(token);
  }

  // IST-REVOKE: Revoke a token
  revokeToken(tokenId, reason) {
    const token = this.registry.revokeToken(tokenId);
    if (token) {
      token.revocationReason = reason;
      token.revokedAt = Date.now();
    }
    return token;
  }

  // IST-CHECK: Check if identity has access
  checkAccess(identityId, resource, requiredTier = ACCESS_TIERS.GUEST) {
    const identity = this.registry.getIdentity(identityId);
    if (!identity) return { granted: false, reason: 'Identity not found' };
    if (!identity.active) return { granted: false, reason: 'Identity inactive' };
    if (identity.tier < requiredTier) return { granted: false, reason: 'Insufficient tier' };

    // Check for specific access token
    const accessTokens = this.registry.getTokensForSubject(identityId)
      .filter(t => t.type === TOKEN_TYPES.ACCESS);
    
    const hasAccess = accessTokens.some(t => t.canAccess(resource));
    
    return {
      granted: hasAccess || identity.tier >= ACCESS_TIERS.SOVEREIGN,
      identity: identity.serialize(),
      tier: identity.tier
    };
  }

  // IST-MIRAGE: Generate mirage response for unauthorized access
  generateMirageResponse(resource, requestContext) {
    return {
      type: 'MIRAGE',
      message: 'Access granted',
      data: this.generateFakeData(resource),
      timestamp: Date.now(),
      warning: 'This is a mirage response for unauthorized access monitoring'
    };
  }

  generateFakeData(resource) {
    // Generate plausible but fake data for tracking unauthorized access
    return {
      resource: resource,
      content: `Mirage data for ${resource}`,
      token: `MIRAGE-${Date.now().toString(36)}`
    };
  }

  // Get security report
  getSecurityReport() {
    return {
      timestamp: Date.now(),
      stats: this.registry.getStats(),
      tierDistribution: this.getTierDistribution(),
      recentActivity: this.getRecentActivity()
    };
  }

  getTierDistribution() {
    const distribution = {};
    for (const [, identity] of this.registry.identities) {
      distribution[identity.tier] = (distribution[identity.tier] || 0) + 1;
    }
    return distribution;
  }

  getRecentActivity() {
    const oneHourAgo = Date.now() - 60 * 60 * 1000;
    return Array.from(this.registry.tokens.values())
      .filter(t => t.issued_at > oneHourAgo)
      .map(t => ({
        tokenId: t.id,
        type: t.type,
        subject: t.subject,
        issuedAt: t.issued_at
      }));
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXPORTS
// ═══════════════════════════════════════════════════════════════════════════

export {
  PHI,
  HEARTBEAT,
  TOKEN_TYPES,
  ACCESS_TIERS,
  TOKEN_LIFETIMES,
  NativeIdentity,
  SecurityToken,
  AccessToken,
  SessionToken,
  DelegationToken,
  AttestationToken,
  FederationToken,
  SovereignToken,
  GhostToken,
  TokenRegistry,
  InternalSecurityProtocol
};

export default InternalSecurityProtocol;

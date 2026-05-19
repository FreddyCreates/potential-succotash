/**
 * Dark Cipher Protocol (DRK-003)
 * 
 * Encryption and decryption for dark layer communications.
 * Phi-resonant key derivation and symmetric ciphers.
 * 
 * Protocol ID: DRK-003
 * Category: Dark Core
 * Status: Active
 */

const PHI = 1.618033988749895;
const HB = 873;
const THRESHOLD = 1 / PHI;

/**
 * Cipher modes
 */
export const CIPHER_MODES = {
  STREAM: 'stream',
  BLOCK: 'block',
  HYBRID: 'hybrid'
};

/**
 * Key types
 */
export const KEY_TYPES = {
  SESSION: 'session',
  EPHEMERAL: 'ephemeral',
  MASTER: 'master',
  DERIVED: 'derived'
};

/**
 * Dark Key
 */
export class DarkKey {
  constructor(material, type = KEY_TYPES.SESSION) {
    this.material = material instanceof Uint8Array ? material : this.derive(material);
    this.type = type;
    this.created = Date.now();
    this.usageCount = 0;
    this.phi = this.computePhi();
  }
  
  /**
   * Derive key material from seed
   */
  derive(seed) {
    const bytes = typeof seed === 'string' ? 
      new TextEncoder().encode(seed) : 
      new Uint8Array([seed]);
    
    const key = new Uint8Array(32);
    
    // Phi-mixed key derivation
    for (let i = 0; i < 32; i++) {
      let acc = bytes[i % bytes.length];
      for (let j = 0; j < 8; j++) {
        acc = (acc * 0x5DEECE66D + Math.floor(PHI * 0x10000)) & 0xFF;
      }
      key[i] = acc;
    }
    
    return key;
  }
  
  /**
   * Compute phi signature
   */
  computePhi() {
    let sum = 0;
    for (let i = 0; i < this.material.length; i++) {
      sum += this.material[i] * Math.pow(PHI, i % 8);
    }
    return sum % 1;
  }
  
  /**
   * Derive subkey
   */
  deriveSubkey(context) {
    const contextBytes = new TextEncoder().encode(context);
    const combined = new Uint8Array(this.material.length + contextBytes.length);
    combined.set(this.material);
    combined.set(contextBytes, this.material.length);
    
    return new DarkKey(combined, KEY_TYPES.DERIVED);
  }
  
  /**
   * Check if key is expired
   */
  isExpired(maxAge = 3600000) {
    return Date.now() - this.created > maxAge;
  }
}

/**
 * Dark Stream Cipher
 */
export class DarkStreamCipher {
  constructor(key) {
    this.key = key instanceof DarkKey ? key : new DarkKey(key);
    this.state = new Uint8Array(256);
    this.i = 0;
    this.j = 0;
    this.initialized = false;
  }
  
  /**
   * Initialize cipher state
   */
  initialize() {
    // Initialize state array
    for (let i = 0; i < 256; i++) {
      this.state[i] = i;
    }
    
    // Key scheduling with phi mixing
    let j = 0;
    for (let i = 0; i < 256; i++) {
      j = (j + this.state[i] + this.key.material[i % this.key.material.length]) & 0xFF;
      j = Math.floor((j + PHI * this.state[(i + 1) % 256]) & 0xFF);
      [this.state[i], this.state[j]] = [this.state[j], this.state[i]];
    }
    
    this.i = 0;
    this.j = 0;
    this.initialized = true;
  }
  
  /**
   * Generate next keystream byte
   */
  next() {
    if (!this.initialized) this.initialize();
    
    this.i = (this.i + 1) & 0xFF;
    this.j = (this.j + this.state[this.i]) & 0xFF;
    
    [this.state[this.i], this.state[this.j]] = [this.state[this.j], this.state[this.i]];
    
    const k = this.state[(this.state[this.i] + this.state[this.j]) & 0xFF];
    
    // Phi-enhance output
    return k ^ Math.floor(PHI * this.state[(this.i + this.j) & 0xFF]) & 0xFF;
  }
  
  /**
   * Encrypt/decrypt data (symmetric)
   */
  process(data) {
    const input = typeof data === 'string' ? new TextEncoder().encode(data) : data;
    const output = new Uint8Array(input.length);
    
    for (let i = 0; i < input.length; i++) {
      output[i] = input[i] ^ this.next();
    }
    
    this.key.usageCount++;
    return output;
  }
  
  /**
   * Encrypt to hex string
   */
  encryptToHex(plaintext) {
    const encrypted = this.process(plaintext);
    return Array.from(encrypted).map(b => b.toString(16).padStart(2, '0')).join('');
  }
  
  /**
   * Decrypt from hex string
   */
  decryptFromHex(hex) {
    const bytes = new Uint8Array(hex.match(/.{2}/g).map(b => parseInt(b, 16)));
    const decrypted = this.process(bytes);
    return new TextDecoder().decode(decrypted);
  }
  
  /**
   * Reset cipher state
   */
  reset() {
    this.initialized = false;
    this.i = 0;
    this.j = 0;
  }
}

/**
 * Dark Block Cipher
 */
export class DarkBlockCipher {
  constructor(key, blockSize = 16) {
    this.key = key instanceof DarkKey ? key : new DarkKey(key);
    this.blockSize = blockSize;
    this.rounds = 16;
  }
  
  /**
   * Encrypt a single block
   */
  encryptBlock(block) {
    const state = new Uint8Array(block);
    
    for (let round = 0; round < this.rounds; round++) {
      // SubBytes with phi
      for (let i = 0; i < state.length; i++) {
        state[i] = this.sbox(state[i], round);
      }
      
      // ShiftRows
      this.shiftRows(state);
      
      // MixColumns with phi
      this.mixColumns(state);
      
      // AddRoundKey
      this.addRoundKey(state, round);
    }
    
    return state;
  }
  
  /**
   * Decrypt a single block
   */
  decryptBlock(block) {
    const state = new Uint8Array(block);
    
    for (let round = this.rounds - 1; round >= 0; round--) {
      this.addRoundKey(state, round);
      this.inverseMixColumns(state);
      this.inverseShiftRows(state);
      
      for (let i = 0; i < state.length; i++) {
        state[i] = this.inverseSbox(state[i], round);
      }
    }
    
    return state;
  }
  
  /**
   * S-box substitution with phi
   */
  sbox(byte, round) {
    const phi_factor = Math.floor((PHI * (round + 1)) * 256) & 0xFF;
    return ((byte * 0x1F + phi_factor) ^ this.key.material[round % this.key.material.length]) & 0xFF;
  }
  
  /**
   * Inverse S-box
   */
  inverseSbox(byte, round) {
    const phi_factor = Math.floor((PHI * (round + 1)) * 256) & 0xFF;
    const xored = byte ^ this.key.material[round % this.key.material.length];
    // Modular inverse approximation
    return ((xored - phi_factor) * 0xDF) & 0xFF;
  }
  
  /**
   * Shift rows
   */
  shiftRows(state) {
    const temp = new Uint8Array(state.length);
    for (let i = 0; i < state.length; i++) {
      temp[(i + Math.floor(i / 4)) % state.length] = state[i];
    }
    state.set(temp);
  }
  
  /**
   * Inverse shift rows
   */
  inverseShiftRows(state) {
    const temp = new Uint8Array(state.length);
    for (let i = 0; i < state.length; i++) {
      temp[i] = state[(i + Math.floor(i / 4)) % state.length];
    }
    state.set(temp);
  }
  
  /**
   * Mix columns with phi
   */
  mixColumns(state) {
    for (let i = 0; i < state.length; i += 4) {
      const a = state[i], b = state[i+1], c = state[i+2], d = state[i+3];
      state[i] = (a ^ b ^ Math.floor(PHI * c)) & 0xFF;
      state[i+1] = (b ^ c ^ Math.floor(PHI * d)) & 0xFF;
      state[i+2] = (c ^ d ^ Math.floor(PHI * a)) & 0xFF;
      state[i+3] = (d ^ a ^ Math.floor(PHI * b)) & 0xFF;
    }
  }
  
  /**
   * Inverse mix columns
   */
  inverseMixColumns(state) {
    for (let i = 0; i < state.length; i += 4) {
      const a = state[i], b = state[i+1], c = state[i+2], d = state[i+3];
      state[i] = (a ^ d ^ Math.floor(PHI * c)) & 0xFF;
      state[i+1] = (b ^ a ^ Math.floor(PHI * d)) & 0xFF;
      state[i+2] = (c ^ b ^ Math.floor(PHI * a)) & 0xFF;
      state[i+3] = (d ^ c ^ Math.floor(PHI * b)) & 0xFF;
    }
  }
  
  /**
   * Add round key
   */
  addRoundKey(state, round) {
    for (let i = 0; i < state.length; i++) {
      state[i] ^= this.key.material[(round * state.length + i) % this.key.material.length];
    }
  }
}

/**
 * Dark Cipher Protocol
 */
export const DarkCipherProtocol = {
  id: 'DRK-003',
  name: 'Dark Cipher Protocol',
  version: '1.0.0',
  category: 'dark-core',
  
  constants: { PHI, HB, THRESHOLD },
  modes: CIPHER_MODES,
  keyTypes: KEY_TYPES,
  
  createKey: (material, type) => new DarkKey(material, type),
  createStreamCipher: (key) => new DarkStreamCipher(key),
  createBlockCipher: (key, blockSize) => new DarkBlockCipher(key, blockSize)
};

export default DarkCipherProtocol;

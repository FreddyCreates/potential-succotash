/**
 * PROTO-233: Alpha Substrate Bridge Protocol
 * 
 * Enables seamless communication across the 6 organism substrates.
 * Translates messages, state, and commands between substrates.
 *
 * @module alpha-substrate-bridge-protocol
 * @version 1.0.0
 */

const PHI = 1.618033988749895;
const PHI_INV = 1 / PHI;

const SUBSTRATES = ['motoko', 'typescript', 'python', 'cpp', 'java', 'webworkers'];

class AlphaSubstrateBridgeProtocol {
  constructor() {
    this.id = 'PROTO-233';
    this.name = 'Alpha Substrate Bridge Protocol';
    this.bridges = new Map();
    this.messageQueue = [];
    this.metrics = { messagesSent: 0, messagesReceived: 0, bridgeErrors: 0 };
  }

  initBridge(fromSubstrate, toSubstrate) {
    const bridgeId = `${fromSubstrate}:${toSubstrate}`;
    this.bridges.set(bridgeId, {
      id: bridgeId,
      from: fromSubstrate,
      to: toSubstrate,
      status: 'active',
      created: Date.now(),
      throughput: 0,
    });
    return this.bridges.get(bridgeId);
  }

  send(fromSubstrate, toSubstrate, message, priority = 2) {
    const bridgeId = `${fromSubstrate}:${toSubstrate}`;
    let bridge = this.bridges.get(bridgeId);
    
    if (!bridge) {
      bridge = this.initBridge(fromSubstrate, toSubstrate);
    }

    const packet = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      from: fromSubstrate,
      to: toSubstrate,
      message,
      priority,
      timestamp: Date.now(),
      status: 'queued',
    };

    this.messageQueue.push(packet);
    this.metrics.messagesSent++;
    bridge.throughput++;

    return packet;
  }

  receive(substrate, count = 10) {
    const messages = this.messageQueue
      .filter(m => m.to === substrate && m.status === 'queued')
      .sort((a, b) => (a.priority - b.priority) || (a.timestamp - b.timestamp))
      .slice(0, count);

    for (const msg of messages) {
      msg.status = 'delivered';
      msg.deliveredAt = Date.now();
      this.metrics.messagesReceived++;
    }

    return messages;
  }

  getBridgeStatus() {
    return {
      bridges: Array.from(this.bridges.values()),
      queueLength: this.messageQueue.filter(m => m.status === 'queued').length,
      metrics: this.metrics,
    };
  }

  getMetrics() { return this.metrics; }
}

export { AlphaSubstrateBridgeProtocol, SUBSTRATES };
export default AlphaSubstrateBridgeProtocol;

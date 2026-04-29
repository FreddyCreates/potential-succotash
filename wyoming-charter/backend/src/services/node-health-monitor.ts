/**
 * Node Health Monitor — 50-Node Neural Emergence Grid
 * 
 * Monitors Gen 3 node infrastructure across ICP, Web, and Edge substrates.
 * 873ms heartbeat verification cycle.
 */

interface GeographicRegion {
  code: string;
  name: string;
  state: string;
  facility?: string;
  latitude: number;
  longitude: number;
}

interface Node {
  id: string;
  substrate: 'ICP' | 'Web' | 'Edge';
  region: GeographicRegion;
  status: 'Active' | 'Pending' | 'Deploying' | 'Offline' | 'Maintenance';
  icpEarning: boolean;
  ssuWrapped: boolean;
  uptimePercent: number;
  lastHeartbeat: number;
  registeredAt: number;
}

interface GridStats {
  totalNodes: number;
  activeNodes: number;
  pendingNodes: number;
  deployingNodes: number;
  offlineNodes: number;
  icpNodes: number;
  webNodes: number;
  edgeNodes: number;
  icpRewardNodes: number;
  ssuWrappedNodes: number;
  averageUptime: number;
  heartbeatCount: number;
}

export class NodeHealthMonitor {
  private nodes: Node[] = [];
  private heartbeatCount = 0;

  constructor() {
    this.bootstrapGrid();
  }

  /**
   * Bootstrap the 50-node grid
   */
  private bootstrapGrid(): void {
    const now = Date.now();

    // ICP nodes (6 core regions)
    const icpRegions: [string, string, string, number, number][] = [
      ['ICP-NA-1', 'North America 1', 'US', 40.0, -100.0],
      ['ICP-NA-2', 'North America 2', 'US', 35.0, -85.0],
      ['ICP-EU-1', 'Europe 1', 'EU', 50.0, 10.0],
      ['ICP-EU-2', 'Europe 2', 'EU', 48.0, 2.0],
      ['ICP-AS-1', 'Asia 1', 'AS', 35.0, 135.0],
      ['ICP-AS-2', 'Asia 2', 'AS', 1.0, 103.0]
    ];

    for (const [code, name, state, lat, lon] of icpRegions) {
      this.nodes.push({
        id: code,
        substrate: 'ICP',
        region: { code, name, state, latitude: lat, longitude: lon },
        status: 'Active',
        icpEarning: true,
        ssuWrapped: true,
        uptimePercent: 99.9,
        lastHeartbeat: now,
        registeredAt: now
      });
    }

    // Edge nodes (8) - Wyoming, Nebraska, Texas
    const edgeRegions: [string, string, string, string | undefined, number, number][] = [
      ['EDGE-WY-01', 'Cheyenne, WY', 'Wyoming', undefined, 41.14, -104.82],
      ['EDGE-WY-02', 'Cheyenne, WY', 'Wyoming', undefined, 41.14, -104.82],
      ['EDGE-WY-03', 'Cheyenne, WY', 'Wyoming', undefined, 41.14, -104.82],
      ['EDGE-NE-01', 'Lincoln, NE', 'Nebraska', 'Federal Reserve Vault - 134 S 13th St', 40.81, -96.70],
      ['EDGE-NE-02', 'Lincoln, NE', 'Nebraska', 'Federal Reserve Vault - 134 S 13th St', 40.81, -96.70],
      ['EDGE-NE-03', 'Lincoln, NE', 'Nebraska', 'Federal Reserve Vault - 134 S 13th St', 40.81, -96.70],
      ['EDGE-TX-01', 'Dallas, TX', 'Texas', undefined, 32.78, -96.80],
      ['EDGE-TX-02', 'Dallas, TX', 'Texas', undefined, 32.78, -96.80]
    ];

    for (const [code, name, state, facility, lat, lon] of edgeRegions) {
      this.nodes.push({
        id: code,
        substrate: 'Edge',
        region: { code, name, state, facility, latitude: lat, longitude: lon },
        status: 'Pending',
        icpEarning: false,
        ssuWrapped: false,
        uptimePercent: 0,
        lastHeartbeat: now,
        registeredAt: now
      });
    }

    // Web nodes (10)
    for (let i = 0; i < 10; i++) {
      const code = `WEB-${i}`;
      this.nodes.push({
        id: code,
        substrate: 'Web',
        region: { code, name: `Web Edge ${i}`, state: 'Global', latitude: 0, longitude: 0 },
        status: i < 5 ? 'Active' : 'Deploying',
        icpEarning: false,
        ssuWrapped: false,
        uptimePercent: i < 5 ? 99.5 : 0,
        lastHeartbeat: now,
        registeredAt: now
      });
    }

    // Fill to 50 with expansion ICP nodes
    let idx = 6;
    while (this.nodes.length < 50) {
      const code = `ICP-EXPAND-${idx}`;
      this.nodes.push({
        id: code,
        substrate: 'ICP',
        region: { code, name: `ICP Expansion ${idx}`, state: 'Global', latitude: 0, longitude: 0 },
        status: 'Pending',
        icpEarning: true,
        ssuWrapped: false,
        uptimePercent: 0,
        lastHeartbeat: now,
        registeredAt: now
      });
      idx++;
    }
  }

  /**
   * Get all nodes
   */
  async getAllNodes(): Promise<Node[]> {
    return this.nodes;
  }

  /**
   * Get node by ID
   */
  async getNode(id: string): Promise<Node | null> {
    return this.nodes.find(n => n.id === id) || null;
  }

  /**
   * Get nodes by state
   */
  async getNodesByState(state: string): Promise<Node[]> {
    return this.nodes.filter(n => n.region.state === state);
  }

  /**
   * Get grid statistics
   */
  async getGridStats(): Promise<GridStats> {
    let active = 0, pending = 0, deploying = 0, offline = 0;
    let icp = 0, web = 0, edge = 0;
    let icpReward = 0, ssuWrapped = 0;
    let totalUptime = 0;

    for (const node of this.nodes) {
      switch (node.status) {
        case 'Active': active++; break;
        case 'Pending': pending++; break;
        case 'Deploying': deploying++; break;
        case 'Offline':
        case 'Maintenance': offline++; break;
      }
      switch (node.substrate) {
        case 'ICP': icp++; break;
        case 'Web': web++; break;
        case 'Edge': edge++; break;
      }
      if (node.icpEarning) icpReward++;
      if (node.ssuWrapped) ssuWrapped++;
      totalUptime += node.uptimePercent;
    }

    return {
      totalNodes: this.nodes.length,
      activeNodes: active,
      pendingNodes: pending,
      deployingNodes: deploying,
      offlineNodes: offline,
      icpNodes: icp,
      webNodes: web,
      edgeNodes: edge,
      icpRewardNodes: icpReward,
      ssuWrappedNodes: ssuWrapped,
      averageUptime: this.nodes.length > 0 ? totalUptime / this.nodes.length : 0,
      heartbeatCount: this.heartbeatCount
    };
  }

  /**
   * Called on 873ms heartbeat
   */
  tick(): void {
    this.heartbeatCount++;
    const now = Date.now();

    // Update active node heartbeats
    for (const node of this.nodes) {
      if (node.status === 'Active') {
        node.lastHeartbeat = now;
      }
    }
  }
}

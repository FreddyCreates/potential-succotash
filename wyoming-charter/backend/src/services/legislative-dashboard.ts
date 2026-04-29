/**
 * Legislative Dashboard — Demo Data for Wyoming/Nebraska Legislators
 * 
 * Real-time demo data for the October 2026 Wyoming meeting
 * and November 2026 Nebraska hardware visibility deadline.
 */

interface Milestone {
  date: string;
  label: string;
  detail: string;
  done: boolean;
  critical: boolean;
}

interface SettlementComparison {
  method: string;
  timeMs: number;
  timeDisplay: string;
  feePercent: number;
  intermediaries: number;
  sovereign: boolean;
}

interface DemoData {
  mission: string;
  owner: string;
  facility: {
    address: string;
    city: string;
    state: string;
    features: string[];
  };
  partners: string[];
  settlement: {
    current: SettlementComparison;
    proposed: SettlementComparison;
    improvement: {
      speedMultiplier: number;
      costReduction: string;
    };
  };
  nodes: {
    total: number;
    active: number;
    edgeWyoming: number;
    edgeNebraska: number;
    edgeTexas: number;
  };
}

export class LegislativeDashboard {
  private milestones: Milestone[] = [
    {
      date: 'Q2 2026',
      label: 'FRNT/ICP Liquidity Pool Live',
      detail: 'ICPSwap pool deployed — FRNT↔ICP instant swap demo running on Caffeine frontend.',
      done: false,
      critical: true
    },
    {
      date: 'Jun 2026',
      label: 'Bad Marine LLC Node Application',
      detail: 'Gen 3 node provider application submitted for Cheyenne WY and Lincoln NE coverage zones.',
      done: false,
      critical: false
    },
    {
      date: 'Aug 2026',
      label: 'Hardware in Vault',
      detail: 'Gen 3 nodes installed at 134 S 13th St, Lincoln, NE — Federal Reserve Vault facility. Tied to internet backbone, publicly-owned power.',
      done: false,
      critical: true
    },
    {
      date: 'Oct 2026',
      label: 'Wyoming Meeting — Andy + State Regulators',
      detail: 'On-site demo: Caffeine mobile app on localized Gen 3 nodes settling FRNT in <1 s. Visa/Kraken bypass proof via Phantom technology.',
      done: false,
      critical: true
    },
    {
      date: 'Nov 2026',
      label: 'Hardware Visible to Legislators',
      detail: 'Senators Bosn and Ballard review working hardware. Hard deadline for 2027 Unicameral bill prep.',
      done: false,
      critical: true
    },
    {
      date: 'Jan 2027',
      label: 'Unicameral Bill Ready',
      detail: '2027 Nebraska Unicameral session — full state adoption bill ready for vote. Wyoming leads; Nebraska and Kansas follow.',
      done: false,
      critical: false
    },
    {
      date: 'Q1 2027',
      label: 'UNL Agentic AI Infrastructure Live',
      detail: 'Sovereign mid-tier compute for University of Nebraska AI Institute. University of Kansas onboarding.',
      done: false,
      critical: false
    }
  ];

  /**
   * Get demo data for legislative presentation
   */
  async getDemoData(): Promise<DemoData> {
    return {
      mission: 'Sovereign Gen 3 Node Provider for the US Midwest',
      owner: 'Bad Marine LLC (Veteran-Owned)',
      facility: {
        address: '134 S 13th St',
        city: 'Lincoln',
        state: 'Nebraska',
        features: [
          'Federal Reserve Vault security',
          'Tied to internet backbone',
          'Publicly-owned power',
          'Physical security and climate control'
        ]
      },
      partners: [
        'Wyoming State (Andy + Regulators)',
        'Nebraska State (Senators Bosn & Ballard)',
        'University of Nebraska-Lincoln AI Institute',
        'University of Kansas',
        'Texas TEA / Dallas ISD'
      ],
      settlement: {
        current: {
          method: 'Visa/Kraken (Traditional)',
          timeMs: 900_000, // 15 minutes
          timeDisplay: '15+ minutes',
          feePercent: 4.0,
          intermediaries: 3,
          sovereign: false
        },
        proposed: {
          method: 'ICP-Native Phantom (FRNT)',
          timeMs: 300, // 0.3 seconds
          timeDisplay: '~0.3 seconds',
          feePercent: 0.01,
          intermediaries: 0,
          sovereign: true
        },
        improvement: {
          speedMultiplier: 3000, // 15min / 0.3s = 3000x
          costReduction: '99.75%' // (4.0 - 0.01) / 4.0
        }
      },
      nodes: {
        total: 50,
        active: 11,
        edgeWyoming: 3,
        edgeNebraska: 3,
        edgeTexas: 2
      }
    };
  }

  /**
   * Get milestone timeline
   */
  async getMilestones(): Promise<Milestone[]> {
    return this.milestones;
  }

  /**
   * Get settlement comparison for demo
   */
  async getSettlementComparison(): Promise<{
    traditional: SettlementComparison;
    phantom: SettlementComparison;
    summary: string;
  }> {
    const traditional: SettlementComparison = {
      method: 'Visa/Kraken (Traditional)',
      timeMs: 900_000,
      timeDisplay: '15+ minutes',
      feePercent: 4.0,
      intermediaries: 3,
      sovereign: false
    };

    const phantom: SettlementComparison = {
      method: 'ICP-Native Phantom (FRNT)',
      timeMs: 300,
      timeDisplay: '~0.3 seconds',
      feePercent: 0.01,
      intermediaries: 0,
      sovereign: true
    };

    return {
      traditional,
      phantom,
      summary: `FRNT settlement is ${Math.round(traditional.timeMs / phantom.timeMs)}x faster and ${((traditional.feePercent - phantom.feePercent) / traditional.feePercent * 100).toFixed(1)}% cheaper than traditional payment rails.`
    };
  }

  /**
   * Update milestone status
   */
  async markMilestoneDone(label: string): Promise<Milestone | null> {
    const milestone = this.milestones.find(m => m.label === label);
    if (milestone) {
      milestone.done = true;
    }
    return milestone || null;
  }

  /**
   * Get critical milestones (hard deadlines)
   */
  async getCriticalMilestones(): Promise<Milestone[]> {
    return this.milestones.filter(m => m.critical && !m.done);
  }
}

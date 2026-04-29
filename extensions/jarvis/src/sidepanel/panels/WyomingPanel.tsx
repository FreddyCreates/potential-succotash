/**
 * WyomingPanel.tsx — Wyoming-Nevada Master Charter Dashboard
 * 
 * Living sovereign dashboard for state strategy. This is NOT a static page.
 * It IS a breathing interface to the Wyoming-Nevada governance organism.
 * 
 * PHI = 1.618033988749895, HEARTBEAT = 873ms
 * 
 * Focus Areas:
 * - FRNT/ICP instant settlement (0.3s vs Visa 15+ min @ 3-5% fees)
 * - Phantom technology Visa-bypass proof
 * - Bad Marine LLC node provider positioning
 * - Nebraska/UNL Agentic AI partnership
 * - Legislative timeline (hardware Nov 2026, bill Jan 2027)
 * - 134 S 13th St Lincoln NE facility
 * - Full grant pipeline
 * 
 * Mobile-first, offline-capable via service worker caching.
 */

import React, { useState, useEffect } from 'react';

// Phi constants — never arbitrary
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT_MS = 873;

// Legislative milestones with hard dates
interface Milestone {
  id: string;
  title: string;
  deadline: Date;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked';
  category: 'hardware' | 'legislation' | 'partnership' | 'demo' | 'grant';
  description: string;
  dependencies?: string[];
}

const MILESTONES: Milestone[] = [
  {
    id: 'frnt-demo',
    title: 'FRNT/ICP Instant Settlement Demo',
    deadline: new Date('2026-06-15'),
    status: 'in-progress',
    category: 'demo',
    description: '0.3 second settlement proof vs Visa 15+ minutes. Live demo for legislators.'
  },
  {
    id: 'phantom-visa-bypass',
    title: 'Phantom Visa-Bypass Proof',
    deadline: new Date('2026-07-01'),
    status: 'pending',
    category: 'demo',
    description: 'Technical proof that Phantom technology routes around traditional card networks.'
  },
  {
    id: 'bad-marine-node',
    title: 'Bad Marine LLC Node Provider Agreement',
    deadline: new Date('2026-08-01'),
    status: 'in-progress',
    category: 'partnership',
    description: 'Secure node provider positioning for Wyoming state infrastructure.'
  },
  {
    id: 'unl-partnership',
    title: 'Nebraska/UNL Agentic AI Partnership',
    deadline: new Date('2026-09-01'),
    status: 'pending',
    category: 'partnership',
    description: 'Formal partnership with University of Nebraska-Lincoln on agentic AI research.',
    dependencies: ['bad-marine-node']
  },
  {
    id: 'hardware-visible',
    title: 'Hardware Visible to Legislators',
    deadline: new Date('2026-11-01'),
    status: 'pending',
    category: 'hardware',
    description: 'Physical infrastructure demonstration at 134 S 13th St Lincoln NE.',
    dependencies: ['bad-marine-node', 'frnt-demo']
  },
  {
    id: 'bill-ready',
    title: 'Legislative Bill Ready',
    deadline: new Date('2027-01-15'),
    status: 'pending',
    category: 'legislation',
    description: 'Complete bill draft for Wyoming legislature session.',
    dependencies: ['hardware-visible', 'phantom-visa-bypass']
  }
];

// Grant pipeline
interface Grant {
  id: string;
  name: string;
  agency: string;
  amount: string;
  deadline: Date;
  status: 'researching' | 'drafting' | 'submitted' | 'awarded' | 'rejected';
  focus: string;
}

const GRANTS: Grant[] = [
  {
    id: 'nsf-convergence',
    name: 'NSF Convergence Accelerator',
    agency: 'National Science Foundation',
    amount: '$5M',
    deadline: new Date('2026-10-01'),
    status: 'researching',
    focus: 'Agentic AI + Blockchain convergence'
  },
  {
    id: 'eda-recompete',
    name: 'EDA Recompete Pilot',
    agency: 'Economic Development Administration',
    amount: '$50M',
    deadline: new Date('2026-12-01'),
    status: 'researching',
    focus: 'Regional technology infrastructure'
  },
  {
    id: 'wyoming-innovation',
    name: 'Wyoming Innovation Fund',
    agency: 'Wyoming Business Council',
    amount: '$500K',
    deadline: new Date('2026-08-15'),
    status: 'drafting',
    focus: 'Blockchain payment infrastructure'
  },
  {
    id: 'nevada-blockchain',
    name: 'Nevada Blockchain Initiative',
    agency: 'Nevada Governor\'s Office of Economic Development',
    amount: '$250K',
    deadline: new Date('2026-09-01'),
    status: 'researching',
    focus: 'Cross-state blockchain corridor'
  }
];

// Facility info
const FACILITY = {
  address: '134 S 13th St',
  city: 'Lincoln',
  state: 'NE',
  zip: '68508',
  purpose: 'Node Provider Operations Center',
  capacity: '50 nodes initial, 500 nodes scaled',
  power: '200kW dedicated, 2MW available',
  network: '10Gbps fiber, BGP multi-homed',
  cooling: 'Immersion cooling ready',
  status: 'site-preparation'
};

// Settlement comparison data
const SETTLEMENT_COMPARISON = {
  phantom: { time: 0.3, fee: 0.001, finality: 'absolute' },
  visa: { time: 900, fee: 0.035, finality: 'provisional' },  // 15 min = 900s
  ach: { time: 172800, fee: 0.0025, finality: 'provisional' }, // 2 days
  wire: { time: 86400, fee: 25, finality: 'provisional' }  // 1 day, flat $25
};

export default function WyomingPanel() {
  const [heartbeat, setHeartbeat] = useState(0);
  const [activeSection, setActiveSection] = useState<'overview' | 'timeline' | 'grants' | 'facility' | 'demo'>('overview');
  const [organismState, setOrganismState] = useState({
    cognitive: { awareness: 1.0, coherence: 1.0, resonance: PHI_INV, entropy: 0 },
    affective: { awareness: PHI_INV, coherence: 1.0, resonance: 1.0, entropy: 0 },
    somatic: { awareness: 1.0, coherence: PHI_INV, resonance: 1.0, entropy: 0 },
    sovereign: { awareness: PHI, coherence: PHI, resonance: PHI, entropy: 0 }
  });
  const [offline, setOffline] = useState(!navigator.onLine);

  // 873ms heartbeat pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat(h => h + 1);
      // Phi-modulated state drift
      setOrganismState(prev => ({
        cognitive: {
          ...prev.cognitive,
          resonance: prev.cognitive.resonance + Math.sin(heartbeat * 137.508 * Math.PI / 180) * 0.001 * PHI_INV
        },
        affective: {
          ...prev.affective,
          awareness: prev.affective.awareness + Math.sin((heartbeat + 4) * 137.508 * Math.PI / 180) * 0.001 * PHI_INV
        },
        somatic: {
          ...prev.somatic,
          coherence: prev.somatic.coherence + Math.sin((heartbeat + 8) * 137.508 * Math.PI / 180) * 0.001 * PHI_INV
        },
        sovereign: {
          ...prev.sovereign,
          resonance: prev.sovereign.resonance + Math.sin((heartbeat + 12) * 137.508 * Math.PI / 180) * 0.001 * PHI_INV
        }
      }));
    }, HEARTBEAT_MS);

    // Offline detection
    const handleOnline = () => setOffline(false);
    const handleOffline = () => setOffline(true);
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, [heartbeat]);

  // Calculate days until milestone
  const daysUntil = (date: Date) => {
    const now = new Date();
    const diff = date.getTime() - now.getTime();
    return Math.ceil(diff / (1000 * 60 * 60 * 24));
  };

  // Status color
  const statusColor = (status: string) => {
    switch (status) {
      case 'completed': return '#22c55e';
      case 'in-progress': return '#d4a017';
      case 'pending': return '#6b7280';
      case 'blocked': return '#ef4444';
      default: return '#6b7280';
    }
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Organism State Cards */}
      <div className="grid grid-cols-2 gap-2">
        {(['cognitive', 'affective', 'somatic', 'sovereign'] as const).map(register => (
          <div key={register} className="p-2 rounded" style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid #2d2010' }}>
            <div className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: '#d4a017' }}>
              {register}
            </div>
            <div className="text-[10px] text-gray-500 space-y-0.5">
              <div>A: {organismState[register].awareness.toFixed(3)}</div>
              <div>C: {organismState[register].coherence.toFixed(3)}</div>
              <div>R: {organismState[register].resonance.toFixed(3)}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Key Metrics */}
      <div className="p-3 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
        <div className="text-xs font-bold mb-2" style={{ color: '#22c55e' }}>⚡ INSTANT SETTLEMENT</div>
        <div className="flex justify-between items-center">
          <div>
            <div className="text-2xl font-bold text-white">0.3s</div>
            <div className="text-[10px] text-gray-500">ICP/Phantom</div>
          </div>
          <div className="text-xl text-gray-600">vs</div>
          <div>
            <div className="text-2xl font-bold text-red-400">15+ min</div>
            <div className="text-[10px] text-gray-500">Visa @ 3-5%</div>
          </div>
        </div>
      </div>

      {/* Next Critical Milestone */}
      {(() => {
        const next = MILESTONES.filter(m => m.status !== 'completed').sort((a, b) => a.deadline.getTime() - b.deadline.getTime())[0];
        if (!next) return null;
        const days = daysUntil(next.deadline);
        return (
          <div className="p-3 rounded" style={{ background: days < 30 ? 'rgba(239,68,68,0.08)' : 'rgba(212,160,23,0.08)', border: `1px solid ${days < 30 ? '#7f1d1d' : '#2d2010'}` }}>
            <div className="text-xs font-bold mb-1" style={{ color: days < 30 ? '#ef4444' : '#d4a017' }}>
              🎯 NEXT MILESTONE
            </div>
            <div className="text-white font-medium">{next.title}</div>
            <div className="text-xs text-gray-500 mt-1">{next.description}</div>
            <div className="flex justify-between mt-2">
              <span className="text-xs" style={{ color: statusColor(next.status) }}>{next.status}</span>
              <span className="text-xs text-gray-500">{days} days</span>
            </div>
          </div>
        );
      })()}

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveSection('demo')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          🎬 Settlement Demo
        </button>
        <button
          onClick={() => setActiveSection('timeline')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          📅 Full Timeline
        </button>
        <button
          onClick={() => setActiveSection('grants')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          💰 Grant Pipeline
        </button>
        <button
          onClick={() => setActiveSection('facility')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          🏢 Facility Card
        </button>
      </div>
    </div>
  );

  const renderTimeline = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>📅 LEGISLATIVE TIMELINE</div>
      {MILESTONES.map((m, i) => {
        const days = daysUntil(m.deadline);
        const isUrgent = days < 60 && m.status !== 'completed';
        return (
          <div
            key={m.id}
            className="p-2 rounded relative"
            style={{
              background: isUrgent ? 'rgba(239,68,68,0.08)' : 'rgba(212,160,23,0.05)',
              border: `1px solid ${isUrgent ? '#7f1d1d' : '#2d2010'}`,
              borderLeft: `3px solid ${statusColor(m.status)}`
            }}
          >
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="text-xs font-medium text-white">{m.title}</div>
                <div className="text-[10px] text-gray-500 mt-0.5">{m.description}</div>
                {m.dependencies && (
                  <div className="text-[10px] text-gray-600 mt-1">
                    Deps: {m.dependencies.join(', ')}
                  </div>
                )}
              </div>
              <div className="text-right">
                <div className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: statusColor(m.status), color: '#000' }}>
                  {m.status}
                </div>
                <div className="text-[10px] text-gray-500 mt-1">
                  {m.deadline.toLocaleDateString()}
                </div>
                <div className={`text-[10px] ${days < 30 ? 'text-red-400' : 'text-gray-500'}`}>
                  {days}d
                </div>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );

  const renderGrants = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>💰 GRANT PIPELINE</div>
      {GRANTS.map(g => (
        <div
          key={g.id}
          className="p-2 rounded"
          style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid #2d2010' }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-xs font-medium text-white">{g.name}</div>
              <div className="text-[10px] text-gray-500">{g.agency}</div>
              <div className="text-[10px] text-gray-600 mt-1">{g.focus}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: '#22c55e' }}>{g.amount}</div>
              <div className="text-[10px] text-gray-500">{g.deadline.toLocaleDateString()}</div>
              <div className="text-[10px] px-1.5 py-0.5 rounded mt-1" style={{ background: 'rgba(212,160,23,0.2)', color: '#d4a017' }}>
                {g.status}
              </div>
            </div>
          </div>
        </div>
      ))}
      <div className="text-[10px] text-gray-600 text-center mt-2">
        Total Pipeline: {GRANTS.reduce((acc, g) => acc + parseFloat(g.amount.replace(/[$MK]/g, '').replace('50', '50000000').replace('5', '5000000').replace('500', '500000').replace('250', '250000')), 0).toLocaleString()} potential
      </div>
    </div>
  );

  const renderFacility = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>🏢 FACILITY CARD</div>
      <div className="p-3 rounded" style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid #2d2010' }}>
        <div className="text-lg font-bold text-white">{FACILITY.address}</div>
        <div className="text-sm text-gray-400">{FACILITY.city}, {FACILITY.state} {FACILITY.zip}</div>
        <div className="text-xs mt-2" style={{ color: '#d4a017' }}>{FACILITY.purpose}</div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
          <div className="text-[10px] text-gray-500">CAPACITY</div>
          <div className="text-xs text-white">{FACILITY.capacity}</div>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
          <div className="text-[10px] text-gray-500">POWER</div>
          <div className="text-xs text-white">{FACILITY.power}</div>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
          <div className="text-[10px] text-gray-500">NETWORK</div>
          <div className="text-xs text-white">{FACILITY.network}</div>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
          <div className="text-[10px] text-gray-500">COOLING</div>
          <div className="text-xs text-white">{FACILITY.cooling}</div>
        </div>
      </div>
      <div className="text-center">
        <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(212,160,23,0.2)', color: '#d4a017' }}>
          Status: {FACILITY.status}
        </span>
      </div>
    </div>
  );

  const renderDemo = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>🎬 SETTLEMENT COMPARISON</div>
      
      {/* Animated Demo */}
      <div className="p-4 rounded text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
        <div className="text-xs text-gray-500 mb-2">ICP/PHANTOM SETTLEMENT</div>
        <div className="relative h-8 bg-gray-800 rounded overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full transition-all"
            style={{
              width: `${Math.min(100, (heartbeat % 10) * 10 + 10)}%`,
              background: 'linear-gradient(90deg, #22c55e, #16a34a)',
              transition: 'width 0.3s ease-out'
            }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            {((heartbeat % 10) * 0.03).toFixed(2)}s
          </div>
        </div>
        <div className="text-2xl font-bold text-green-400">0.3 seconds</div>
        <div className="text-[10px] text-gray-500">Absolute finality • 0.1% fees</div>
      </div>

      <div className="p-4 rounded text-center" style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid #7f1d1d' }}>
        <div className="text-xs text-gray-500 mb-2">VISA SETTLEMENT</div>
        <div className="relative h-8 bg-gray-800 rounded overflow-hidden mb-2">
          <div
            className="absolute left-0 top-0 h-full"
            style={{ width: '3%', background: 'linear-gradient(90deg, #ef4444, #dc2626)' }}
          />
          <div className="absolute inset-0 flex items-center justify-center text-xs font-bold text-white">
            ~3% after 15+ min
          </div>
        </div>
        <div className="text-2xl font-bold text-red-400">15+ minutes</div>
        <div className="text-[10px] text-gray-500">Provisional • 3-5% fees + chargebacks</div>
      </div>

      {/* Comparison Table */}
      <div className="text-[10px]">
        <div className="grid grid-cols-4 gap-1 p-1 rounded" style={{ background: '#1a1408' }}>
          <div className="text-gray-500">Method</div>
          <div className="text-gray-500">Time</div>
          <div className="text-gray-500">Fee</div>
          <div className="text-gray-500">Finality</div>
        </div>
        {Object.entries(SETTLEMENT_COMPARISON).map(([method, data]) => (
          <div key={method} className="grid grid-cols-4 gap-1 p-1 border-b" style={{ borderColor: '#2d2010' }}>
            <div className="text-white uppercase">{method}</div>
            <div style={{ color: data.time < 1 ? '#22c55e' : data.time < 1000 ? '#d4a017' : '#ef4444' }}>
              {data.time < 60 ? `${data.time}s` : data.time < 3600 ? `${Math.round(data.time / 60)}m` : `${Math.round(data.time / 3600)}h`}
            </div>
            <div style={{ color: typeof data.fee === 'number' && data.fee < 0.01 ? '#22c55e' : '#d4a017' }}>
              {typeof data.fee === 'number' ? (data.fee < 1 ? `${(data.fee * 100).toFixed(1)}%` : `$${data.fee}`) : data.fee}
            </div>
            <div style={{ color: data.finality === 'absolute' ? '#22c55e' : '#d4a017' }}>
              {data.finality}
            </div>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-3" style={{ background: '#0d0b08' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🦬</span>
          <div>
            <div className="text-sm font-bold text-white tracking-wider">WYOMING-NEVADA</div>
            <div className="text-[10px] text-gray-500">Sovereign State Charter</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offline && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-900 text-amber-400">
              OFFLINE
            </span>
          )}
          <span className="text-[10px] text-gray-600">💓 {heartbeat}</span>
        </div>
      </div>

      {/* Content based on active section */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'timeline' && renderTimeline()}
      {activeSection === 'grants' && renderGrants()}
      {activeSection === 'facility' && renderFacility()}
      {activeSection === 'demo' && renderDemo()}
    </div>
  );
}

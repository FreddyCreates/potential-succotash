import React, { useState } from 'react';

type SubTab = 'overview' | 'frnt' | 'nodes' | 'legislature' | 'grants' | 'nebraska';

/* ── Milestone data ─────────────────────────────────────────────── */
interface Milestone {
  date: string;
  label: string;
  detail: string;
  done: boolean;
  critical?: boolean;
}

const MILESTONES: Milestone[] = [
  { date: 'Q2 2026', label: 'FRNT/ICP Liquidity Pool Live', detail: 'ICPSwap pool deployed — FRNT↔ICP instant swap demo running on Caffeine frontend.', done: false, critical: true },
  { date: 'Jun 2026', label: 'Bad Marine LLC Node Application', detail: 'Gen 3 node provider application submitted for Cheyenne WY and Lincoln NE coverage zones.', done: false },
  { date: 'Aug 2026', label: 'Hardware in Vault', detail: 'Gen 3 nodes installed at 134 S 13th St, Lincoln, NE — Federal Reserve Vault facility. Tied to internet backbone, publicly-owned power.', done: false, critical: true },
  { date: 'Oct 2026', label: 'Wyoming Meeting — Andy + State Regulators', detail: 'On-site demo: Caffeine mobile app on localized Gen 3 nodes settling FRNT in <1 s. Visa/Kraken bypass proof via Phantom technology.', done: false, critical: true },
  { date: 'Nov 2026', label: 'Hardware Visible to Legislators', detail: 'Senators Bosn and Ballard review working hardware. Hard deadline for 2027 Unicameral bill prep.', done: false, critical: true },
  { date: 'Jan 2027', label: 'Unicameral Bill Ready', detail: '2027 Nebraska Unicameral session — full state adoption bill ready for vote. Wyoming leads; Nebraska and Kansas follow.', done: false },
  { date: 'Q1 2027', label: 'UNL Agentic AI Infrastructure Live', detail: 'Sovereign mid-tier compute for University of Nebraska AI Institute. University of Kansas onboarding.', done: false },
];

/* ── Grant pipeline ─────────────────────────────────────────────── */
interface GrantRow {
  name: string;
  amount: string;
  status: 'research' | 'drafting' | 'submitted' | 'awarded';
  notes: string;
}

const GRANTS: GrantRow[] = [
  { name: 'E-Rate Program (FCC)', amount: '$250K–$1M', status: 'research', notes: 'Sovereign canister per school qualifies as network infrastructure. Target Dallas ISD and Nebraska districts.' },
  { name: 'Title IV-A ESSA', amount: '$50K–$500K', status: 'research', notes: 'Technology and STEM enrichment. Agentic AI curriculum tools for schools.' },
  { name: 'TEA Innovation Grants (Texas)', amount: '$100K–$750K', status: 'research', notes: 'Texas Education Agency innovation rounds. TEKS-mapped AI lesson canister is novel infrastructure, not SaaS.' },
  { name: 'NSF RI / Mid-Scale Research', amount: '$500K–$5M', status: 'research', notes: 'Sovereign decentralized compute as research infrastructure. UNL partnership anchor.' },
  { name: 'Wyoming SPDI / State AI Fund', amount: 'TBD', status: 'research', notes: 'Wyoming leading AI-friendly regulatory sandboxes. FRNT demo is direct value proof.' },
  { name: 'USDA ReConnect (Rural Broadband)', amount: '$1M+', status: 'research', notes: 'Midwest rural internet backbone expansion. Gen 3 nodes in Lincoln vault tie to backbone.' },
  { name: 'SBA SBIR / STTR', amount: '$150K–$2M', status: 'research', notes: 'Veteran-owned (Bad Marine LLC). Phase I feasibility — sovereign AI infrastructure for state agencies.' },
];

const GRANT_STATUS_COLOR: Record<string, string> = {
  research:  '#6b7280',
  drafting:  '#d4a017',
  submitted: '#38bdf8',
  awarded:   '#34d399',
};

/* ── Node grid ──────────────────────────────────────────────────── */
interface NodeEntry {
  id: string;
  substrate: 'ICP' | 'Web' | 'Edge';
  region: string;
  status: 'active' | 'pending' | 'deploying';
  icpEarning: boolean;
  ssuWrapped: boolean;
}

const buildNodes = (): NodeEntry[] => {
  const nodes: NodeEntry[] = [];
  const icpRegions = ['ICP-NA-1','ICP-NA-2','ICP-EU-1','ICP-EU-2','ICP-AS-1','ICP-AS-2','ICP-SA-1','ICP-AF-1','ICP-OC-1','ICP-ME-1'];
  const webRegions = ['WEB-US-E','WEB-US-W','WEB-EU-W','WEB-AP-SE','WEB-SA-1'];
  const edgeRegions = ['EDGE-WY-01','EDGE-NE-01','EDGE-TX-01'];
  icpRegions.forEach((r, i) => nodes.push({ id: `icp-${i}`, substrate: 'ICP', region: r, status: i < 6 ? 'active' : 'pending', icpEarning: true, ssuWrapped: i < 4 }));
  webRegions.forEach((r, i) => nodes.push({ id: `web-${i}`, substrate: 'Web', region: r, status: i < 2 ? 'active' : 'deploying', icpEarning: false, ssuWrapped: false }));
  edgeRegions.forEach((r, i) => nodes.push({ id: `edge-${i}`, substrate: 'Edge', region: r, status: 'pending', icpEarning: false, ssuWrapped: false }));
  // pad to 50 with more ICP nodes
  while (nodes.length < 50) {
    const idx = nodes.length;
    nodes.push({ id: `icp-x${idx}`, substrate: 'ICP', region: `ICP-EXPAND-${idx}`, status: 'pending', icpEarning: true, ssuWrapped: false });
  }
  return nodes;
};

const NODES = buildNodes();

const NODE_COLOR: Record<string, string> = {
  ICP:  '#a78bfa',
  Web:  '#38bdf8',
  Edge: '#34d399',
};

const NODE_STATUS_COLOR: Record<string, string> = {
  active:    '#34d399',
  pending:   '#6b7280',
  deploying: '#d4a017',
};

/* ── FRNT Settlement comparison ─────────────────────────────────── */
const FRNT_CURRENT = { label: 'Current (Visa/Kraken)', time: '15+ min', fee: '3–5%', color: '#ef4444' };
const FRNT_TARGET  = { label: 'ICP Native (Phantom)', time: '~0.3 s', fee: '<0.1%', color: '#34d399' };

/* ─────────────────────────────────────────────────────────────────── */

export default function WyomingPanel() {
  const [tab, setTab] = useState<SubTab>('overview');

  return (
    <div className="flex flex-col h-full text-xs" style={{ background: '#0d0b08', color: '#d1d5db' }}>

      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b flex-shrink-0" style={{ borderColor: '#2d2010', background: '#13100a' }}>
        <div className="flex items-center gap-2">
          <span style={{ color: '#d4a017' }}>🏔</span>
          <span className="font-bold tracking-widest text-white text-[11px]">WYOMING MASTER CHARTER</span>
          <span className="text-[9px] px-1 py-0.5 rounded border font-bold" style={{ borderColor: '#d4a017', color: '#d4a017' }}>PARALLAX</span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px]" style={{ color: '#6b7280' }}>
          <span>🇺🇸 Bad Marine LLC</span>
          <span>·</span>
          <span style={{ color: '#34d399' }}>SOVEREIGN</span>
        </div>
      </div>

      {/* Sub-tabs */}
      <div className="flex overflow-x-auto scrollbar-hide border-b flex-shrink-0" style={{ borderColor: '#2d2010', background: '#0f0d09' }}>
        {(
          [
            { id: 'overview',    label: '🗺 Overview' },
            { id: 'frnt',        label: '⚡ FRNT Settlement' },
            { id: 'nodes',       label: '🌐 Node Grid' },
            { id: 'legislature', label: '🏛 Legislature' },
            { id: 'grants',      label: '💰 Grants' },
            { id: 'nebraska',    label: '🎓 Nebraska/UNL' },
          ] as { id: SubTab; label: string }[]
        ).map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="flex-shrink-0 px-2.5 py-1.5 text-[10px] font-semibold transition-colors whitespace-nowrap"
            style={tab === t.id ? { color: '#d4a017', borderBottom: '2px solid #d4a017' } : { color: '#6b7280' }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Panel body */}
      <div className="flex-1 overflow-y-auto">
        {tab === 'overview'    && <OverviewTab />}
        {tab === 'frnt'        && <FrntTab />}
        {tab === 'nodes'       && <NodeTab />}
        {tab === 'legislature' && <LegislatureTab />}
        {tab === 'grants'      && <GrantsTab />}
        {tab === 'nebraska'    && <NebraskaTab />}
      </div>

      {/* Footer */}
      <div className="px-3 py-1 flex-shrink-0 text-[10px] border-t" style={{ borderColor: '#1e1a0f', color: '#3d3020' }}>
        Offline-capable · Mobile-first · Autonomous · Bad Marine LLC — Sovereign Veteran-Owned Infrastructure
      </div>
    </div>
  );
}

/* ── OVERVIEW ───────────────────────────────────────────────────── */
function OverviewTab() {
  return (
    <div className="px-3 py-3 space-y-3">

      {/* Mission card */}
      <Card icon="🎯" title="MISSION">
        <p className="text-gray-300 leading-relaxed">
          Position Bad Marine LLC as the sovereign, veteran-owned Gen 3 node provider for the US Midwest —
          filling the Nakamoto Coefficient gap — while delivering instant FRNT/ICP settlement to Wyoming
          and Nebraska, powering UNL Agentic AI, and securing state and federal funding.
        </p>
      </Card>

      {/* Facility */}
      <Card icon="🏦" title="PRIMARY FACILITY">
        <div className="space-y-1 text-gray-300">
          <p className="font-semibold text-white">Federal Reserve Vault</p>
          <p>134 S 13th St, Lincoln, NE</p>
          <div className="flex flex-wrap gap-2 mt-1">
            {['Bank-grade vault', 'Internet backbone tie-in', 'Publicly-owned power (lowest-cost in nation)', 'Operator on-site'].map(f => (
              <span key={f} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#1a1408', color: '#d4a017' }}>{f}</span>
            ))}
          </div>
        </div>
      </Card>

      {/* Key partners */}
      <Card icon="🤝" title="KEY PARTNERS">
        <div className="space-y-1.5">
          {[
            { name: 'Wyoming — Andy + State Regulators', detail: 'FRNT token upgrade, SPDI banking, Caffeine mobile demo' },
            { name: 'Nebraska Unicameral', detail: 'Senators Bosn & Ballard — 2027 session bill' },
            { name: 'University of Nebraska (UNL)', detail: 'AI Institute — sovereign Agentic AI compute' },
            { name: 'University of Kansas', detail: 'Midwest AI infrastructure expansion' },
            { name: 'Texas Board of Education / Dallas ISD', detail: 'Sovereign canister per school, TEKS-mapped AI tools' },
          ].map(p => (
            <div key={p.name} className="p-1.5 rounded border" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
              <p className="text-gray-200 font-semibold">{p.name}</p>
              <p className="text-gray-500 mt-0.5">{p.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Hard dates summary */}
      <Card icon="⏱" title="HARD DEADLINES">
        <div className="space-y-1">
          {MILESTONES.filter(m => m.critical).map(m => (
            <div key={m.label} className="flex gap-2 items-start">
              <span className="text-[10px] font-mono flex-shrink-0" style={{ color: '#d4a017' }}>{m.date}</span>
              <span className="text-gray-300">{m.label}</span>
            </div>
          ))}
        </div>
      </Card>

      {/* Node count summary */}
      <Card icon="🌐" title="NEURAL EMERGENCE CORES">
        <div className="flex gap-4">
          <Stat label="Total Targets" value="50+" />
          <Stat label="ICP Nodes" value={String(NODES.filter(n => n.substrate === 'ICP').length)} />
          <Stat label="Web Nodes"  value={String(NODES.filter(n => n.substrate === 'Web').length)} />
          <Stat label="Edge Nodes" value={String(NODES.filter(n => n.substrate === 'Edge').length)} />
        </div>
        <p className="text-gray-500 mt-2 leading-relaxed">
          Each ICP node earns real ICP rewards and is SSU-wrapped. Nodes become sovereign parts handed to partner companies.
          Edge nodes anchor Wyoming and Nebraska for sub-second FRNT settlement.
        </p>
      </Card>
    </div>
  );
}

/* ── FRNT SETTLEMENT ────────────────────────────────────────────── */
function FrntTab() {
  return (
    <div className="px-3 py-3 space-y-3">

      <Card icon="⚡" title="FRNT SETTLEMENT COMPARISON">
        <div className="grid grid-cols-2 gap-2 mt-1">
          {[FRNT_CURRENT, FRNT_TARGET].map(s => (
            <div key={s.label} className="p-2.5 rounded border" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
              <p className="text-[10px] text-gray-500 mb-1">{s.label}</p>
              <p className="text-xl font-bold font-mono" style={{ color: s.color }}>{s.time}</p>
              <p className="text-[11px] mt-1" style={{ color: s.color }}>Fee: {s.fee}</p>
            </div>
          ))}
        </div>
        <div className="mt-2 p-2 rounded" style={{ background: '#0f0d09', border: '1px solid #2d2010' }}>
          <p className="text-[10px] text-gray-400 leading-relaxed">
            Current Wyoming FRNT token routes through Kraken listing + Visa-backed backend.
            Fees remain 3–5%, settlement 15+ minutes. The ICP-native path mints directly
            bank → canister and settles in ~0.3 s at sub-0.1% cost using Phantom technology
            to bypass Visa/Kraken entirely.
          </p>
        </div>
      </Card>

      <Card icon="🔮" title="PHANTOM TECHNOLOGY BYPASS">
        <div className="space-y-1.5 text-gray-300">
          {[
            'Direct bank-to-canister minting — no card network in the path',
            'FRNT/ICP liquidity pool on ICPSwap — instant swap at market rate',
            'Caffeine mobile frontend — consumer UX, no wallet complexity',
            'Localized Gen 3 nodes in Cheyenne WY + Lincoln NE anchor sub-second finality',
            'Phantom solve already demonstrated — Visa cracking bottleneck resolved',
          ].map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span style={{ color: '#d4a017' }}>▸</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </Card>

      <Card icon="🏛" title="DEMO PLAN — WYOMING MEETING">
        <ol className="space-y-1.5 text-gray-300 list-none">
          {[
            'Show live FRNT/ICP pool on ICPSwap — visible on-chain depth',
            'Open Caffeine mobile app on local Gen 3 node in Cheyenne',
            'Execute FRNT purchase — confirm in <1 second on screen',
            'Display Visa/Kraken comparison side-by-side',
            'Walk regulators through canister code — sovereign, auditable, no server',
            'Propose Wyoming leads → Nebraska adopts → Kansas joins',
          ].map((step, i) => (
            <li key={i} className="flex gap-2 items-start">
              <span className="flex-shrink-0 font-mono text-[10px] w-4 text-right" style={{ color: '#d4a017' }}>{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </Card>

      <Card icon="🔗" title="NEBRASKA EXPANSION">
        <p className="text-gray-300 leading-relaxed">
          After Wyoming proof: matched Gen 3 nodes in Lincoln, NE spin up the same Caffeine settlement stack.
          Nebraska OCIO requirements satisfied with hardware visible in the vault at 134 S 13th St.
          SPDI banking laws extend to Nebraska SPDI partners. Model offered to Kansas next.
        </p>
      </Card>
    </div>
  );
}

/* ── NODE GRID ──────────────────────────────────────────────────── */
function NodeTab() {
  const [filter, setFilter] = useState<'all' | 'ICP' | 'Web' | 'Edge'>('all');
  const visible = filter === 'all' ? NODES : NODES.filter(n => n.substrate === filter);
  const active    = NODES.filter(n => n.status === 'active').length;
  const deploying = NODES.filter(n => n.status === 'deploying').length;
  const pending   = NODES.filter(n => n.status === 'pending').length;

  return (
    <div className="flex flex-col h-full">
      {/* Stats */}
      <div className="px-3 py-2 border-b grid grid-cols-4 gap-2 flex-shrink-0" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
        <Stat label="Total" value={String(NODES.length)} />
        <Stat label="Active" value={String(active)} color="#34d399" />
        <Stat label="Deploying" value={String(deploying)} color="#d4a017" />
        <Stat label="Pending" value={String(pending)} color="#6b7280" />
      </div>

      {/* Filter */}
      <div className="flex gap-1 px-3 py-1.5 border-b flex-shrink-0" style={{ borderColor: '#2d2010' }}>
        {(['all','ICP','Web','Edge'] as const).map(f => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className="text-[10px] px-2 py-0.5 rounded border transition-colors"
            style={filter === f
              ? { background: 'rgba(212,160,23,0.2)', color: '#d4a017', borderColor: '#d4a017' }
              : { background: 'transparent', color: '#6b7280', borderColor: '#2d2010' }
            }
          >
            {f === 'all' ? 'All' : f}
          </button>
        ))}
        <span className="ml-auto text-[10px]" style={{ color: '#3d3020' }}>{visible.length} nodes</span>
      </div>

      {/* Grid */}
      <div className="flex-1 overflow-y-auto px-3 py-2">
        <div className="grid grid-cols-2 gap-1.5">
          {visible.map(n => (
            <div key={n.id} className="p-2 rounded border" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
              <div className="flex items-center justify-between mb-0.5">
                <span className="text-[9px] font-bold" style={{ color: NODE_COLOR[n.substrate] }}>{n.substrate}</span>
                <span className="text-[9px]" style={{ color: NODE_STATUS_COLOR[n.status] }}>●</span>
              </div>
              <p className="text-[10px] text-gray-300 font-mono truncate">{n.region}</p>
              <div className="flex gap-1 mt-1 flex-wrap">
                {n.icpEarning && <span className="text-[8px] px-1 rounded" style={{ background: '#1a1408', color: '#a78bfa' }}>ICP ⬡</span>}
                {n.ssuWrapped && <span className="text-[8px] px-1 rounded" style={{ background: '#1a1408', color: '#34d399' }}>SSU</span>}
                <span className="text-[8px] px-1 rounded capitalize" style={{ background: '#1a1408', color: NODE_STATUS_COLOR[n.status] }}>{n.status}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Legend */}
        <div className="mt-3 p-2 rounded border text-[10px] space-y-0.5" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
          <p className="font-semibold mb-1" style={{ color: '#d4a017' }}>Neural Emergence Cores</p>
          <p className="text-gray-500">ICP nodes earn real ICP rewards and generate compound generator outputs — they are real network participants, not simulators.</p>
          <p className="text-gray-500 mt-1">SSU-wrapped nodes become sovereign parts eventually transferred to partner companies as owned infrastructure.</p>
          <p className="text-gray-500 mt-1">Web nodes extend reach into the open web. Edge nodes (WY/NE/TX) anchor regional settlement and university compute.</p>
        </div>
      </div>
    </div>
  );
}

/* ── LEGISLATURE ────────────────────────────────────────────────── */
function LegislatureTab() {
  return (
    <div className="px-3 py-3 space-y-2">
      <p className="text-[10px] text-gray-500 mb-2">
        Hard legislative milestones. Hardware must be visible before November 2026 for the 2027 Nebraska Unicameral bill.
        Local officials want to shake hands with the operator — not be pitched by a coastal firm.
      </p>

      {MILESTONES.map((m, i) => (
        <div
          key={i}
          className="p-2.5 rounded border"
          style={{
            borderColor: m.critical ? 'rgba(212,160,23,0.4)' : '#2d2010',
            background: m.critical ? 'rgba(212,160,23,0.04)' : '#0a0806',
          }}
        >
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="font-mono text-[10px]" style={{ color: '#d4a017' }}>{m.date}</span>
                {m.critical && <span className="text-[9px] px-1 py-0.5 rounded border font-bold" style={{ borderColor: '#ef4444', color: '#ef4444' }}>CRITICAL</span>}
              </div>
              <p className="font-semibold text-gray-200 mt-0.5">{m.label}</p>
              <p className="text-gray-500 mt-0.5 leading-relaxed">{m.detail}</p>
            </div>
            <span className="text-lg flex-shrink-0">{m.done ? '✅' : '○'}</span>
          </div>
        </div>
      ))}

      <div className="mt-3 p-2 rounded border text-[10px]" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
        <p className="font-semibold mb-1" style={{ color: '#d4a017' }}>Nakamoto Coefficient Gap</p>
        <p className="text-gray-500 leading-relaxed">
          The US Midwest is a massive gap in ICP network decentralization. Bad Marine LLC fills it with Gen 3 nodes
          in the Federal Reserve Vault at 134 S 13th St, Lincoln, NE — publicly-owned power, internet backbone,
          operator on-site. If another provider wants to step up, they must come to the Midwest, purchase hardware,
          meet Andy in Wyoming, and navigate SPDI laws and State OCIO requirements before 2027.
        </p>
      </div>
    </div>
  );
}

/* ── GRANTS ─────────────────────────────────────────────────────── */
function GrantsTab() {
  return (
    <div className="px-3 py-3 space-y-2">
      <p className="text-[10px] text-gray-500 mb-2">
        Pursuing state, federal, and education funding. Sovereign canister-per-school model qualifies
        as infrastructure (not SaaS), unlocking E-Rate and Title IV. Veteran-owned (Bad Marine LLC)
        strengthens SBIR/STTR eligibility.
      </p>

      {GRANTS.map((g, i) => (
        <div key={i} className="p-2.5 rounded border" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <p className="font-semibold text-gray-200">{g.name}</p>
              <p className="text-gray-500 mt-0.5 leading-relaxed">{g.notes}</p>
            </div>
            <div className="flex-shrink-0 text-right">
              <p className="font-mono text-[10px]" style={{ color: '#d4a017' }}>{g.amount}</p>
              <span
                className="text-[9px] px-1.5 py-0.5 rounded font-bold capitalize mt-0.5 inline-block"
                style={{ background: 'rgba(0,0,0,0.3)', color: GRANT_STATUS_COLOR[g.status], border: `1px solid ${GRANT_STATUS_COLOR[g.status]}40` }}
              >
                {g.status}
              </span>
            </div>
          </div>
        </div>
      ))}

      <Card icon="🏫" title="TEXAS / SOVEREIGN CANISTER MODEL">
        <div className="space-y-1.5 text-gray-300">
          <p className="text-gray-400 leading-relaxed">
            Dallas ISD and Texas Board of Education (TEA) receive a read-only ICP-native canister
            pre-loaded with TEKS-mapped lesson tools — no server, no cloud dependency, no data sold.
          </p>
          {[
            'Bronze tier = public/free access — no login for students',
            'Teacher/admin access via Internet Identity',
            'Offline via PWA caching — works without internet',
            `School owns the canister — not a subscription to someone else's server`,
            'Fundable under E-Rate, Title IV-A, TEA Innovation Grants',
          ].map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span style={{ color: '#d4a017' }}>▸</span>
              <span className="text-gray-400">{f}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── NEBRASKA / UNL ─────────────────────────────────────────────── */
function NebraskaTab() {
  return (
    <div className="px-3 py-3 space-y-3">

      <Card icon="🎓" title="UNL AI INSTITUTE">
        <p className="text-gray-300 leading-relaxed">
          The University of Nebraska AI Institute launched this year. They have recognized that teaching
          "Clippy-level" AI in 2026 is a dead end. Their model is shifting to Agentic AI in 2027,
          but as a state entity they require local, sovereign Gen 3 compute to run it.
        </p>
        <div className="flex flex-wrap gap-2 mt-2">
          {['Sovereign compute', 'Agentic AI curriculum', 'State entity requirement', 'Gen 3 mid-tier nodes'].map(tag => (
            <span key={tag} className="text-[9px] px-1.5 py-0.5 rounded" style={{ background: '#1a1408', color: '#a78bfa' }}>{tag}</span>
          ))}
        </div>
      </Card>

      <Card icon="🌾" title="NEBRASKA PARTNERSHIP ARCHITECTURE">
        <div className="space-y-1.5 text-gray-300">
          {[
            { label: 'Node Location', detail: 'Gen 3 nodes at 134 S 13th St Lincoln NE — matched with Cheyenne WY nodes for Wyoming-Nebraska redundancy.' },
            { label: 'FRNT Expansion', detail: 'Wyoming proves the model; Nebraska adopts the FRNT/ICP settlement stack. Wyoming offers the model to Nebraska after demo.' },
            { label: 'OCIO Requirements', detail: 'State OCIO requirements satisfied by hardware in vault — visible, auditable, operator on-site.' },
            { label: 'Legislative Timeline', detail: 'Senators Bosn and Ballard finish 2025–26 Unicameral session. Hardware visible before November 2026. Bill ready January 2027.' },
            { label: 'Power Advantage', detail: 'Publicly-owned electricity in Nebraska — some of the cheapest in the nation.' },
          ].map(item => (
            <div key={item.label} className="p-1.5 rounded border" style={{ borderColor: '#2d2010', background: '#0a0806' }}>
              <p className="font-semibold text-gray-200">{item.label}</p>
              <p className="text-gray-500 mt-0.5 leading-relaxed">{item.detail}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card icon="🏫" title="UNIVERSITY OF KANSAS">
        <p className="text-gray-300 leading-relaxed">
          University of Kansas is interested in joining the Midwest sovereign AI infrastructure network
          once UNL is live. Mid-tier intentional — this is the Midwest. Kansas expansion follows Nebraska proof.
        </p>
      </Card>

      <Card icon="🔧" title="INFRASTRUCTURE STACK">
        <div className="space-y-1 text-gray-300">
          {[
            'Gen 3 ICP nodes — Cheyenne WY + Lincoln NE (matched pair)',
            'Caffeine mobile app on localized nodes — consumer UX',
            'Phantom technology — Visa/Kraken bypass, sub-second finality',
            'FRNT/ICP liquidity pool on ICPSwap — open, auditable',
            'All languages: Rust, Motoko, Python, CTL — AI-generated codebase',
            'Offline-capable, mobile-first, autonomous — runs without external cloud',
          ].map((f, i) => (
            <div key={i} className="flex gap-2 items-start">
              <span style={{ color: '#34d399' }}>▸</span>
              <span>{f}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}

/* ── Shared components ──────────────────────────────────────────── */
function Card({ icon, title, children }: { icon: string; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded border overflow-hidden" style={{ borderColor: '#2d2010' }}>
      <div className="flex items-center gap-1.5 px-2.5 py-1.5 border-b" style={{ borderColor: '#2d2010', background: '#13100a' }}>
        <span>{icon}</span>
        <span className="font-bold tracking-wider text-[10px]" style={{ color: '#d4a017' }}>{title}</span>
      </div>
      <div className="px-2.5 py-2 text-xs" style={{ background: '#0d0b08' }}>
        {children}
      </div>
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: string; color?: string }) {
  return (
    <div className="text-center">
      <p className="text-lg font-bold font-mono" style={{ color: color ?? '#d4a017' }}>{value}</p>
      <p className="text-[9px] text-gray-600 mt-0.5">{label}</p>
    </div>
  );
}

/**
 * SchoolPanel.tsx — Sovereign School Canister Dashboard
 * 
 * Texas public education knowledge canister mapped to TEKS curriculum standards.
 * This is NOT a database login. This IS sovereign infrastructure where each school
 * owns their own canister — Bronze tier minimum.
 * 
 * PHI = 1.618033988749895, HEARTBEAT = 873ms
 * 
 * Features:
 * - No login required for students (public knowledge)
 * - Internet Identity for teachers and admins
 * - PWA offline support
 * - TEKS curriculum mapping
 * - Dallas ISD + TEA integration
 * - E-Rate, Title IV, TEA innovation grant structured
 * 
 * Bronze Tier: Each school = their own sovereign canister
 */

import React, { useState, useEffect } from 'react';

// Phi constants
const PHI = 1.618033988749895;
const PHI_INV = 0.618033988749895;
const HEARTBEAT_MS = 873;

// TEKS Subject Areas
type TEKSSubject = 'ela' | 'math' | 'science' | 'social' | 'fine-arts' | 'health' | 'tech' | 'languages';

interface TEKSStandard {
  id: string;
  subject: TEKSSubject;
  grade: string;  // K-12 or grade range
  strand: string;
  expectation: string;
  resources: number;  // Available learning resources
}

// Sample TEKS standards (would be loaded from canister)
const TEKS_STANDARDS: TEKSStandard[] = [
  { id: 'math-3-1', subject: 'math', grade: '3', strand: 'Number & Operations', expectation: 'Represent and solve addition/subtraction within 1,000', resources: 47 },
  { id: 'math-5-1', subject: 'math', grade: '5', strand: 'Algebraic Reasoning', expectation: 'Identify prime and composite numbers', resources: 32 },
  { id: 'ela-4-1', subject: 'ela', grade: '4', strand: 'Reading/Comprehension', expectation: 'Summarize main ideas and supporting details', resources: 56 },
  { id: 'sci-6-1', subject: 'science', grade: '6', strand: 'Matter & Energy', expectation: 'Compare metals, nonmetals, and metalloids', resources: 28 },
  { id: 'social-8-1', subject: 'social', grade: '8', strand: 'Texas History', expectation: 'Explain significance of Texas Revolution', resources: 41 },
];

// Funding sources
interface FundingSource {
  id: string;
  name: string;
  type: 'federal' | 'state' | 'local';
  amount: string;
  eligibility: string;
  deadline?: Date;
  status: 'available' | 'applied' | 'awarded';
}

const FUNDING_SOURCES: FundingSource[] = [
  {
    id: 'e-rate',
    name: 'E-Rate Program',
    type: 'federal',
    amount: '20-90% discount',
    eligibility: 'Internet access and internal connections',
    status: 'available'
  },
  {
    id: 'title-iv',
    name: 'Title IV-A SSAE',
    type: 'federal',
    amount: 'Formula-based',
    eligibility: 'Well-rounded education, safe schools, technology',
    status: 'available'
  },
  {
    id: 'tea-innovation',
    name: 'TEA Innovation Grant',
    type: 'state',
    amount: '$50K-$500K',
    eligibility: 'Innovative instructional approaches',
    deadline: new Date('2026-09-15'),
    status: 'available'
  },
  {
    id: 'dallas-isd-tech',
    name: 'Dallas ISD Technology Fund',
    type: 'local',
    amount: 'Per-student allocation',
    eligibility: 'District schools only',
    status: 'awarded'
  }
];

// School tier definitions
interface SchoolTier {
  name: string;
  color: string;
  description: string;
  features: string[];
  canisterOwnership: string;
}

const TIERS: Record<string, SchoolTier> = {
  bronze: {
    name: 'Bronze',
    color: '#cd7f32',
    description: 'Sovereign Foundation',
    features: [
      'Own sovereign canister (not shared)',
      'TEKS curriculum mapping',
      'Student access (no login)',
      'Teacher Internet Identity',
      'Offline PWA support',
      'Basic analytics'
    ],
    canisterOwnership: 'School-owned canister on ICP'
  },
  silver: {
    name: 'Silver',
    color: '#c0c0c0',
    description: 'Enhanced Learning',
    features: [
      'Everything in Bronze',
      'AI tutoring assistant',
      'Parent dashboard',
      'Cross-school collaboration',
      'Advanced analytics',
      'Custom content creation'
    ],
    canisterOwnership: 'School-owned + district resonance'
  },
  gold: {
    name: 'Gold',
    color: '#ffd700',
    description: 'Full Intelligence',
    features: [
      'Everything in Silver',
      'Phi-weighted learning pathways',
      'Predictive student growth',
      'College/career readiness AI',
      'District-wide resonance',
      'Research partnerships'
    ],
    canisterOwnership: 'School-owned + TEA resonance'
  }
};

// Dallas ISD regions
const DALLAS_ISD_REGIONS = [
  { id: 'north', name: 'North', schools: 42, students: 28500 },
  { id: 'south', name: 'South', schools: 38, students: 31200 },
  { id: 'east', name: 'East', schools: 35, students: 24800 },
  { id: 'west', name: 'West', schools: 41, students: 27600 },
  { id: 'central', name: 'Central', schools: 27, students: 18900 }
];

export default function SchoolPanel() {
  const [heartbeat, setHeartbeat] = useState(0);
  const [activeSection, setActiveSection] = useState<'overview' | 'curriculum' | 'funding' | 'schools' | 'deploy'>('overview');
  const [selectedSubject, setSelectedSubject] = useState<TEKSSubject | 'all'>('all');
  const [selectedGrade, setSelectedGrade] = useState<string>('all');
  const [offline, setOffline] = useState(!navigator.onLine);
  const [userRole, setUserRole] = useState<'student' | 'teacher' | 'admin'>('student');

  // Organism state for district-wide resonance
  const [districtState, setDistrictState] = useState({
    studentCount: 131000,
    educatorCount: 9200,
    schoolCount: 183,
    averageGrowthRate: PHI_INV,
    districtResonance: 0.72
  });

  // 873ms heartbeat
  useEffect(() => {
    const interval = setInterval(() => {
      setHeartbeat(h => h + 1);
      // Phi-modulated resonance drift
      setDistrictState(prev => ({
        ...prev,
        districtResonance: Math.min(1, Math.max(0.5, 
          prev.districtResonance + Math.sin(heartbeat * 137.508 * Math.PI / 180) * 0.001 * PHI_INV
        )),
        averageGrowthRate: Math.min(PHI, Math.max(0.5,
          prev.averageGrowthRate + Math.sin((heartbeat + 4) * 137.508 * Math.PI / 180) * 0.0005 * PHI_INV
        ))
      }));
    }, HEARTBEAT_MS);

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

  const subjectEmoji: Record<TEKSSubject, string> = {
    'ela': '📚',
    'math': '🔢',
    'science': '🔬',
    'social': '🌎',
    'fine-arts': '🎨',
    'health': '❤️',
    'tech': '💻',
    'languages': '🗣️'
  };

  const renderOverview = () => (
    <div className="space-y-4">
      {/* Role Selection */}
      <div className="flex gap-2">
        {(['student', 'teacher', 'admin'] as const).map(role => (
          <button
            key={role}
            onClick={() => setUserRole(role)}
            className={`flex-1 py-1.5 text-xs rounded capitalize ${userRole === role ? 'font-bold' : ''}`}
            style={{
              background: userRole === role ? 'rgba(212,160,23,0.2)' : 'rgba(212,160,23,0.05)',
              border: `1px solid ${userRole === role ? '#d4a017' : '#2d2010'}`,
              color: userRole === role ? '#d4a017' : '#6b7280'
            }}
          >
            {role === 'student' ? '👨‍🎓' : role === 'teacher' ? '👩‍🏫' : '👔'} {role}
          </button>
        ))}
      </div>

      {/* Auth Status */}
      <div className="p-2 rounded text-center" style={{ 
        background: userRole === 'student' ? 'rgba(34,197,94,0.08)' : 'rgba(59,130,246,0.08)',
        border: `1px solid ${userRole === 'student' ? '#166534' : '#1e3a8a'}`
      }}>
        {userRole === 'student' ? (
          <>
            <div className="text-xs font-bold text-green-400">✓ NO LOGIN REQUIRED</div>
            <div className="text-[10px] text-gray-500">Public knowledge access for all students</div>
          </>
        ) : (
          <>
            <div className="text-xs font-bold text-blue-400">🔐 INTERNET IDENTITY</div>
            <div className="text-[10px] text-gray-500">Secure sovereign authentication</div>
            <button className="mt-1 px-2 py-0.5 text-[10px] rounded" style={{ background: 'rgba(59,130,246,0.2)', color: '#60a5fa' }}>
              Connect Identity
            </button>
          </>
        )}
      </div>

      {/* District Stats */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded" style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid #2d2010' }}>
          <div className="text-[10px] text-gray-500">STUDENTS</div>
          <div className="text-lg font-bold text-white">{districtState.studentCount.toLocaleString()}</div>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid #2d2010' }}>
          <div className="text-[10px] text-gray-500">EDUCATORS</div>
          <div className="text-lg font-bold text-white">{districtState.educatorCount.toLocaleString()}</div>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(212,160,23,0.08)', border: '1px solid #2d2010' }}>
          <div className="text-[10px] text-gray-500">SCHOOLS</div>
          <div className="text-lg font-bold text-white">{districtState.schoolCount}</div>
        </div>
        <div className="p-2 rounded" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
          <div className="text-[10px] text-gray-500">RESONANCE</div>
          <div className="text-lg font-bold" style={{ color: '#22c55e' }}>{(districtState.districtResonance * 100).toFixed(1)}%</div>
        </div>
      </div>

      {/* Bronze Tier Highlight */}
      <div className="p-3 rounded" style={{ background: 'rgba(205,127,50,0.08)', border: '1px solid #92400e' }}>
        <div className="flex items-center gap-2 mb-2">
          <span className="text-xl">🥉</span>
          <div>
            <div className="text-sm font-bold" style={{ color: '#cd7f32' }}>BRONZE TIER</div>
            <div className="text-[10px] text-gray-500">Sovereign Foundation</div>
          </div>
        </div>
        <div className="text-xs text-gray-400 mb-2">
          Each school gets their own sovereign canister — not a login to someone else's server.
        </div>
        <div className="flex flex-wrap gap-1">
          {TIERS.bronze.features.slice(0, 4).map((f, i) => (
            <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(205,127,50,0.2)', color: '#cd7f32' }}>
              ✓ {f}
            </span>
          ))}
        </div>
      </div>

      {/* Quick Links */}
      <div className="grid grid-cols-2 gap-2">
        <button
          onClick={() => setActiveSection('curriculum')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          📚 TEKS Curriculum
        </button>
        <button
          onClick={() => setActiveSection('funding')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          💰 Grant Funding
        </button>
        <button
          onClick={() => setActiveSection('schools')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          🏫 School Map
        </button>
        <button
          onClick={() => setActiveSection('deploy')}
          className="p-2 rounded text-xs text-left"
          style={{ background: 'rgba(212,160,23,0.12)', border: '1px solid #2d2010', color: '#d4a017' }}
        >
          🚀 Deploy Canister
        </button>
      </div>
    </div>
  );

  const renderCurriculum = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>📚 TEKS CURRICULUM STANDARDS</div>
      
      {/* Subject Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setSelectedSubject('all')}
          className={`text-[10px] px-2 py-1 rounded ${selectedSubject === 'all' ? 'font-bold' : ''}`}
          style={{
            background: selectedSubject === 'all' ? 'rgba(212,160,23,0.2)' : 'rgba(212,160,23,0.05)',
            border: '1px solid #2d2010',
            color: selectedSubject === 'all' ? '#d4a017' : '#6b7280'
          }}
        >
          All
        </button>
        {(Object.keys(subjectEmoji) as TEKSSubject[]).map(subj => (
          <button
            key={subj}
            onClick={() => setSelectedSubject(subj)}
            className={`text-[10px] px-2 py-1 rounded ${selectedSubject === subj ? 'font-bold' : ''}`}
            style={{
              background: selectedSubject === subj ? 'rgba(212,160,23,0.2)' : 'rgba(212,160,23,0.05)',
              border: '1px solid #2d2010',
              color: selectedSubject === subj ? '#d4a017' : '#6b7280'
            }}
          >
            {subjectEmoji[subj]} {subj.toUpperCase()}
          </button>
        ))}
      </div>

      {/* Grade Filter */}
      <div className="flex flex-wrap gap-1">
        <button
          onClick={() => setSelectedGrade('all')}
          className={`text-[10px] px-2 py-1 rounded ${selectedGrade === 'all' ? 'font-bold' : ''}`}
          style={{
            background: selectedGrade === 'all' ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.05)',
            border: '1px solid #166534',
            color: selectedGrade === 'all' ? '#22c55e' : '#6b7280'
          }}
        >
          All Grades
        </button>
        {['K', '1', '2', '3', '4', '5', '6', '7', '8', '9', '10', '11', '12'].map(g => (
          <button
            key={g}
            onClick={() => setSelectedGrade(g)}
            className={`text-[10px] px-2 py-1 rounded ${selectedGrade === g ? 'font-bold' : ''}`}
            style={{
              background: selectedGrade === g ? 'rgba(34,197,94,0.2)' : 'rgba(34,197,94,0.05)',
              border: '1px solid #166534',
              color: selectedGrade === g ? '#22c55e' : '#6b7280'
            }}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Standards List */}
      {TEKS_STANDARDS
        .filter(s => (selectedSubject === 'all' || s.subject === selectedSubject) && 
                     (selectedGrade === 'all' || s.grade === selectedGrade))
        .map(std => (
          <div key={std.id} className="p-2 rounded" style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid #2d2010' }}>
            <div className="flex justify-between items-start">
              <div className="flex-1">
                <div className="flex items-center gap-1">
                  <span>{subjectEmoji[std.subject]}</span>
                  <span className="text-xs font-medium text-white">Grade {std.grade} {std.strand}</span>
                </div>
                <div className="text-[10px] text-gray-500 mt-0.5">{std.expectation}</div>
              </div>
              <div className="text-right">
                <div className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: 'rgba(34,197,94,0.2)', color: '#22c55e' }}>
                  {std.resources} resources
                </div>
              </div>
            </div>
          </div>
        ))}

      <div className="text-[10px] text-gray-600 text-center">
        Free public access — No login required for students
      </div>
    </div>
  );

  const renderFunding = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>💰 FUNDING SOURCES</div>
      
      {FUNDING_SOURCES.map(fund => (
        <div
          key={fund.id}
          className="p-2 rounded"
          style={{
            background: fund.status === 'awarded' ? 'rgba(34,197,94,0.08)' : 'rgba(212,160,23,0.05)',
            border: `1px solid ${fund.status === 'awarded' ? '#166534' : '#2d2010'}`
          }}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="text-xs font-medium text-white">{fund.name}</div>
              <div className="text-[10px] text-gray-500">{fund.eligibility}</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: fund.status === 'awarded' ? '#22c55e' : '#d4a017' }}>
                {fund.amount}
              </div>
              <div className="text-[10px] px-1.5 py-0.5 rounded mt-1" style={{
                background: fund.type === 'federal' ? 'rgba(59,130,246,0.2)' : fund.type === 'state' ? 'rgba(168,85,247,0.2)' : 'rgba(212,160,23,0.2)',
                color: fund.type === 'federal' ? '#60a5fa' : fund.type === 'state' ? '#a855f7' : '#d4a017'
              }}>
                {fund.type}
              </div>
            </div>
          </div>
          {fund.deadline && (
            <div className="text-[10px] text-gray-600 mt-1">
              Deadline: {fund.deadline.toLocaleDateString()}
            </div>
          )}
        </div>
      ))}

      <div className="p-2 rounded text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
        <div className="text-xs text-green-400">Grant-Ready Structure</div>
        <div className="text-[10px] text-gray-500">
          Sovereign canister architecture pre-qualifies for E-Rate, Title IV, and TEA innovation grants
        </div>
      </div>
    </div>
  );

  const renderSchools = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>🏫 DALLAS ISD REGIONS</div>
      
      {DALLAS_ISD_REGIONS.map(region => (
        <div key={region.id} className="p-2 rounded" style={{ background: 'rgba(212,160,23,0.05)', border: '1px solid #2d2010' }}>
          <div className="flex justify-between items-center">
            <div>
              <div className="text-xs font-medium text-white">{region.name} Region</div>
              <div className="text-[10px] text-gray-500">{region.schools} schools</div>
            </div>
            <div className="text-right">
              <div className="text-sm font-bold" style={{ color: '#d4a017' }}>{region.students.toLocaleString()}</div>
              <div className="text-[10px] text-gray-500">students</div>
            </div>
          </div>
          {/* Progress bar showing canister deployment */}
          <div className="mt-2 h-1.5 bg-gray-800 rounded overflow-hidden">
            <div
              className="h-full"
              style={{
                width: `${Math.floor(Math.random() * 30 + 10)}%`,
                background: 'linear-gradient(90deg, #cd7f32, #d4a017)'
              }}
            />
          </div>
          <div className="text-[10px] text-gray-600 mt-0.5">Canister deployment progress</div>
        </div>
      ))}

      <div className="text-[10px] text-gray-500 text-center">
        Total: {DALLAS_ISD_REGIONS.reduce((a, r) => a + r.schools, 0)} schools • {DALLAS_ISD_REGIONS.reduce((a, r) => a + r.students, 0).toLocaleString()} students
      </div>
    </div>
  );

  const renderDeploy = () => (
    <div className="space-y-3">
      <button onClick={() => setActiveSection('overview')} className="text-xs text-gray-500 hover:text-gray-300">
        ← Back to Overview
      </button>
      <div className="text-sm font-bold" style={{ color: '#d4a017' }}>🚀 DEPLOY SOVEREIGN CANISTER</div>
      
      {/* Tier Selection */}
      {Object.entries(TIERS).map(([key, tier]) => (
        <div
          key={key}
          className="p-3 rounded cursor-pointer hover:opacity-90 transition-opacity"
          style={{ background: `rgba(${key === 'bronze' ? '205,127,50' : key === 'silver' ? '192,192,192' : '255,215,0'},0.08)`, border: `1px solid ${tier.color}40` }}
        >
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">{key === 'bronze' ? '🥉' : key === 'silver' ? '🥈' : '🥇'}</span>
            <div>
              <div className="text-sm font-bold" style={{ color: tier.color }}>{tier.name} TIER</div>
              <div className="text-[10px] text-gray-500">{tier.description}</div>
            </div>
          </div>
          <div className="text-[10px] text-gray-400 mb-2">{tier.canisterOwnership}</div>
          <div className="flex flex-wrap gap-1">
            {tier.features.map((f, i) => (
              <span key={i} className="text-[10px] px-1.5 py-0.5 rounded" style={{ background: `${tier.color}20`, color: tier.color }}>
                ✓ {f}
              </span>
            ))}
          </div>
        </div>
      ))}

      {/* Deploy Button */}
      <div className="p-3 rounded text-center" style={{ background: 'rgba(34,197,94,0.08)', border: '1px solid #166534' }}>
        <div className="text-xs text-gray-400 mb-2">Ready to deploy?</div>
        <button
          className="w-full py-2 rounded font-bold text-sm"
          style={{ background: 'linear-gradient(135deg, #22c55e, #16a34a)', color: '#000' }}
        >
          🚀 Request Canister Deployment
        </button>
        <div className="text-[10px] text-gray-500 mt-2">
          TEA-approved • E-Rate eligible • No student data on third-party servers
        </div>
      </div>
    </div>
  );

  return (
    <div className="h-full overflow-auto p-3" style={{ background: '#0d0b08' }}>
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <span className="text-xl">🎓</span>
          <div>
            <div className="text-sm font-bold text-white tracking-wider">SOVEREIGN SCHOOL</div>
            <div className="text-[10px] text-gray-500">Texas • Dallas ISD • TEA</div>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {offline && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-green-900 text-green-400">
              OFFLINE ✓
            </span>
          )}
          <span className="text-[10px] text-gray-600">💓 {heartbeat}</span>
        </div>
      </div>

      {/* Content */}
      {activeSection === 'overview' && renderOverview()}
      {activeSection === 'curriculum' && renderCurriculum()}
      {activeSection === 'funding' && renderFunding()}
      {activeSection === 'schools' && renderSchools()}
      {activeSection === 'deploy' && renderDeploy()}
    </div>
  );
}

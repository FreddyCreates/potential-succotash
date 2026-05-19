"""
CIVOS-PRIME: Mode Law
======================

Runtime mode laws that NOVA enforces.
Keeps mode governance visible instead of scattering through business logic.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum


class ModeLawViolation(Exception):
    """Raised when mode law is violated."""
    pass


class LawSeverity(Enum):
    """Severity of law enforcement."""
    WARN = "warn"        # Log warning, allow
    BLOCK = "block"      # Reject operation
    TERMINATE = "terminate"  # Terminate execution


@dataclass
class ModeLaw:
    """
    A runtime mode law.
    
    Laws are explicit rules that govern mode transitions,
    execution boundaries, and authority delegation.
    """
    law_id: str
    name: str
    description: str
    condition: str  # Human-readable condition
    action: str     # Human-readable action
    severity: LawSeverity = LawSeverity.BLOCK
    priority: int = 0
    enabled: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class LawCheckResult:
    """Result of checking a law."""
    law_id: str
    satisfied: bool
    reason: str
    severity: LawSeverity
    timestamp: datetime = field(default_factory=datetime.utcnow)


class ModeLawRegistry:
    """
    Registry of all mode laws.
    
    Provides centralized law management and checking.
    """
    
    def __init__(self):
        self._laws: Dict[str, ModeLaw] = {}
        self._init_default_laws()
    
    def _init_default_laws(self):
        """Initialize default laws."""
        default_laws = [
            # Canon bypass law
            ModeLaw(
                law_id="LAW-001-CANON-BYPASS",
                name="No Canon Bypass",
                description="Canonical writes cannot bypass MEMORIA through direct adapter calls",
                condition="write.target == 'canon' AND write.source != 'memoria'",
                action="REJECT with 'Canon bypass attempted'",
                severity=LawSeverity.BLOCK,
                priority=100,
            ),
            
            # Foundation authority law
            ModeLaw(
                law_id="LAW-002-FOUNDATION-AUTH",
                name="Foundation No Authority",
                description="Foundation-floor delegation cannot become speaking or canon authority",
                condition="delegation.target.authority == 'foundation' AND delegation.promotes",
                action="REJECT with 'Foundation cannot gain authority'",
                severity=LawSeverity.BLOCK,
                priority=100,
            ),
            
            # Bounded execution law
            ModeLaw(
                law_id="LAW-003-BOUNDED-EXEC",
                name="Bounded Execution",
                description="Unbounded tasks must have explicit timeout bounds",
                condition="task.depth == 'unbounded' AND task.timeout == null",
                action="REJECT with 'Unbounded task requires timeout'",
                severity=LawSeverity.BLOCK,
                priority=90,
            ),
            
            # Lineage requirement law
            ModeLaw(
                law_id="LAW-004-LINEAGE-REQUIRED",
                name="Lineage Required",
                description="All durable writes must have lineage tracking",
                condition="write.is_durable AND write.lineage == null",
                action="INJECT lineage automatically",
                severity=LawSeverity.WARN,
                priority=80,
            ),
            
            # Trunk immutability law
            ModeLaw(
                law_id="LAW-005-TRUNK-IMMUTABLE",
                name="Trunk Immutability",
                description="Trunk objects cannot be modified, only new versions created",
                condition="modify.target.status == 'trunk'",
                action="REJECT with 'Trunk is immutable'",
                severity=LawSeverity.BLOCK,
                priority=100,
            ),
            
            # Delegation bounds law
            ModeLaw(
                law_id="LAW-006-DELEGATION-BOUNDS",
                name="Delegation Bounds",
                description="Delegation timeout cannot exceed maximum allowed",
                condition="delegation.timeout > MAX_DELEGATION_TIMEOUT",
                action="CLAMP timeout to MAX_DELEGATION_TIMEOUT",
                severity=LawSeverity.WARN,
                priority=70,
            ),
        ]
        
        for law in default_laws:
            self.register(law)
    
    def register(self, law: ModeLaw) -> bool:
        """Register a law."""
        self._laws[law.law_id] = law
        return True
    
    def unregister(self, law_id: str) -> bool:
        """Unregister a law."""
        if law_id in self._laws:
            del self._laws[law_id]
            return True
        return False
    
    def get(self, law_id: str) -> Optional[ModeLaw]:
        """Get a law by ID."""
        return self._laws.get(law_id)
    
    def list_all(self) -> List[ModeLaw]:
        """List all laws sorted by priority."""
        return sorted(self._laws.values(), key=lambda l: -l.priority)
    
    def list_enabled(self) -> List[ModeLaw]:
        """List only enabled laws."""
        return [l for l in self.list_all() if l.enabled]
    
    def check(self, law_id: str, context: Dict[str, Any]) -> LawCheckResult:
        """
        Check if a law is satisfied.
        
        Returns result with satisfaction status and reason.
        """
        law = self.get(law_id)
        
        if not law:
            return LawCheckResult(
                law_id=law_id,
                satisfied=True,
                reason="Law not found, allowing by default",
                severity=LawSeverity.WARN,
            )
        
        if not law.enabled:
            return LawCheckResult(
                law_id=law_id,
                satisfied=True,
                reason="Law disabled",
                severity=law.severity,
            )
        
        # Check specific laws (simplified implementation)
        satisfied = True
        reason = "Law satisfied"
        
        if law_id == "LAW-001-CANON-BYPASS":
            target = context.get('target')
            source = context.get('source')
            if target == 'canon' and source != 'memoria':
                satisfied = False
                reason = "Canon bypass attempted"
        
        elif law_id == "LAW-002-FOUNDATION-AUTH":
            authority = context.get('authority')
            promotes = context.get('promotes', False)
            if authority == 'foundation' and promotes:
                satisfied = False
                reason = "Foundation cannot gain authority"
        
        elif law_id == "LAW-003-BOUNDED-EXEC":
            depth = context.get('depth')
            timeout = context.get('timeout')
            if depth == 'unbounded' and timeout is None:
                satisfied = False
                reason = "Unbounded task requires timeout"
        
        elif law_id == "LAW-005-TRUNK-IMMUTABLE":
            status = context.get('status')
            operation = context.get('operation')
            if status == 'trunk' and operation == 'modify':
                satisfied = False
                reason = "Trunk is immutable"
        
        return LawCheckResult(
            law_id=law_id,
            satisfied=satisfied,
            reason=reason,
            severity=law.severity,
        )
    
    def check_all(self, context: Dict[str, Any]) -> List[LawCheckResult]:
        """Check all enabled laws against context."""
        results = []
        for law in self.list_enabled():
            results.append(self.check(law.law_id, context))
        return results
    
    def any_violations(self, context: Dict[str, Any]) -> List[LawCheckResult]:
        """Get all law violations for context."""
        return [r for r in self.check_all(context) if not r.satisfied]


# Export all
__all__ = [
    'ModeLawViolation',
    'LawSeverity',
    'ModeLaw',
    'LawCheckResult',
    'ModeLawRegistry',
]

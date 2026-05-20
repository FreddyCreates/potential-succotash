"""
CIVOS-PRIME: Runtime Types
===========================

Core data types for NOVA - the runtime governance layer.
Handles task depth classification, mode selection, delegation decisions,
and execution profile switching.

Goal: Runtime hierarchy is explicit and inspectable.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable
from enum import Enum
import uuid


# φ-Constants for runtime
PHI = 1.618033988749895
HEARTBEAT_MS = 873
COMPLEXITY_THRESHOLD = 0.618


class TaskDepth(Enum):
    """
    Classification of task computational depth.
    
    Determines resource allocation and delegation strategy.
    """
    TRIVIAL = "trivial"          # Immediate, no delegation needed
    SHALLOW = "shallow"          # Single-step, local execution
    MODERATE = "moderate"        # Multi-step, may delegate
    DEEP = "deep"                # Complex, likely delegates
    UNBOUNDED = "unbounded"      # Unknown depth, requires bounded execution


class ExecutionMode(Enum):
    """Execution modes for task processing."""
    SYNC = "sync"                # Synchronous, blocking
    ASYNC = "async"              # Asynchronous, non-blocking
    STREAM = "stream"            # Streaming response
    BATCH = "batch"              # Batched processing
    DEFERRED = "deferred"        # Queued for later execution


class DelegationLevel(Enum):
    """
    Levels of delegation authority.
    
    Foundation-floor-style delegation cannot become speaking or canon authority.
    """
    NONE = "none"                # No delegation
    COMPUTE = "compute"          # Delegate computation only
    STORAGE = "storage"          # Delegate storage operations
    QUERY = "query"              # Delegate queries
    TRANSFORM = "transform"      # Delegate transformations
    FULL = "full"                # Full delegation (rare, requires authority)


class RuntimeAuthority(Enum):
    """Authority levels in the runtime hierarchy."""
    CANON = "canon"              # Can write to trunk
    SPEAKING = "speaking"        # Can propose changes
    OBSERVER = "observer"        # Read-only access
    FOUNDATION = "foundation"    # Lowest level, no canon access


@dataclass
class TaskClassification:
    """
    Classification result for a task.
    
    NOVA uses this to decide mode and delegation.
    """
    task_id: str
    depth: TaskDepth
    estimated_steps: int
    estimated_duration_ms: int
    complexity_score: float  # 0.0 to 1.0
    resource_requirements: Dict[str, Any] = field(default_factory=dict)
    reasons: List[str] = field(default_factory=list)
    
    def __post_init__(self):
        if not self.task_id:
            self.task_id = str(uuid.uuid4())
    
    def requires_delegation(self) -> bool:
        """Check if task should be delegated."""
        return self.depth in (TaskDepth.DEEP, TaskDepth.UNBOUNDED)
    
    def is_bounded(self) -> bool:
        """Check if task has bounded execution time."""
        return self.depth != TaskDepth.UNBOUNDED


@dataclass
class ExecutionProfile:
    """
    Configuration for task execution.
    
    Profiles determine resource limits, timeouts, and fallback behavior.
    """
    profile_id: str
    name: str
    mode: ExecutionMode
    timeout_ms: int = 30000  # Default 30 second timeout
    max_memory_mb: int = 512
    max_cpu_percent: int = 80
    retry_count: int = 3
    fallback_profile_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @staticmethod
    def default() -> 'ExecutionProfile':
        """Return default execution profile."""
        return ExecutionProfile(
            profile_id="default",
            name="Default Profile",
            mode=ExecutionMode.SYNC,
        )
    
    @staticmethod
    def bounded(timeout_ms: int) -> 'ExecutionProfile':
        """Return a bounded execution profile."""
        return ExecutionProfile(
            profile_id=f"bounded-{timeout_ms}ms",
            name=f"Bounded {timeout_ms}ms",
            mode=ExecutionMode.SYNC,
            timeout_ms=timeout_ms,
        )


@dataclass
class DelegationTarget:
    """Target for task delegation."""
    target_id: str
    target_type: str  # engine, worker, agent, shinobi
    authority_level: RuntimeAuthority
    capabilities: List[str] = field(default_factory=list)
    current_load: float = 0.0  # 0.0 to 1.0
    available: bool = True
    
    def can_accept(self, task: TaskClassification) -> bool:
        """Check if target can accept the task."""
        return self.available and self.current_load < 0.8


@dataclass
class DelegationDecision:
    """
    Decision about whether and how to delegate.
    
    Includes named reasons for inspectability.
    """
    decision_id: str
    task_id: str
    should_delegate: bool
    delegation_level: DelegationLevel
    target: Optional[DelegationTarget] = None
    reasons: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        if not self.decision_id:
            self.decision_id = str(uuid.uuid4())
    
    def is_foundation_floor(self) -> bool:
        """Check if delegation is to foundation floor."""
        if self.target:
            return self.target.authority_level == RuntimeAuthority.FOUNDATION
        return False


@dataclass
class ModeDecision:
    """
    Decision about execution mode.
    
    NOVA returns deterministic mode decisions with named reasons.
    """
    decision_id: str
    task_id: str
    selected_mode: ExecutionMode
    profile: ExecutionProfile
    reasons: List[str] = field(default_factory=list)
    alternatives: List[ExecutionMode] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    def __post_init__(self):
        if not self.decision_id:
            self.decision_id = str(uuid.uuid4())


@dataclass
class RuntimeState:
    """
    Current state of the runtime.
    
    Used for monitoring and decision-making.
    """
    state_id: str
    timestamp: datetime = field(default_factory=datetime.utcnow)
    active_tasks: int = 0
    pending_delegations: int = 0
    memory_usage_mb: float = 0.0
    cpu_usage_percent: float = 0.0
    available_targets: List[str] = field(default_factory=list)
    
    def is_healthy(self) -> bool:
        """Check if runtime is healthy."""
        return (
            self.memory_usage_mb < 1024 and
            self.cpu_usage_percent < 90 and
            len(self.available_targets) > 0
        )


@dataclass
class RuntimeLaw:
    """
    Law governing runtime behavior.
    
    These are explicit rules that NOVA enforces.
    """
    law_id: str
    name: str
    description: str
    condition: str  # Human-readable condition
    action: str     # Human-readable action
    priority: int = 0
    enabled: bool = True
    
    # Default laws
    @staticmethod
    def no_canon_bypass() -> 'RuntimeLaw':
        """Canonical writes cannot bypass MEMORIA."""
        return RuntimeLaw(
            law_id="law-no-canon-bypass",
            name="No Canon Bypass",
            description="Canonical writes cannot bypass MEMORIA through direct adapter calls",
            condition="write.target == 'canon' AND write.source != 'memoria'",
            action="REJECT with reason 'Canon bypass attempted'",
            priority=100,
        )
    
    @staticmethod
    def foundation_no_authority() -> 'RuntimeLaw':
        """Foundation floor cannot gain speaking or canon authority."""
        return RuntimeLaw(
            law_id="law-foundation-no-authority",
            name="Foundation No Authority",
            description="Foundation-floor delegation cannot become speaking or canon authority",
            condition="delegation.target.authority == 'foundation' AND delegation.promotes_authority",
            action="REJECT with reason 'Foundation cannot gain authority'",
            priority=100,
        )


@dataclass
class RuntimeHierarchy:
    """
    The explicit runtime hierarchy.
    
    Must be inspectable at any time.
    """
    hierarchy_id: str
    levels: Dict[RuntimeAuthority, List[str]] = field(default_factory=dict)
    laws: List[RuntimeLaw] = field(default_factory=list)
    
    def __post_init__(self):
        for authority in RuntimeAuthority:
            if authority not in self.levels:
                self.levels[authority] = []
        
        # Add default laws
        if not self.laws:
            self.laws = [
                RuntimeLaw.no_canon_bypass(),
                RuntimeLaw.foundation_no_authority(),
            ]
    
    def get_authority_for_entity(self, entity_id: str) -> Optional[RuntimeAuthority]:
        """Get authority level for an entity."""
        for authority, entities in self.levels.items():
            if entity_id in entities:
                return authority
        return None
    
    def can_write_canon(self, entity_id: str) -> bool:
        """Check if entity can write to canon."""
        authority = self.get_authority_for_entity(entity_id)
        return authority == RuntimeAuthority.CANON


# Export all types
__all__ = [
    'PHI',
    'HEARTBEAT_MS',
    'COMPLEXITY_THRESHOLD',
    'TaskDepth',
    'ExecutionMode',
    'DelegationLevel',
    'RuntimeAuthority',
    'TaskClassification',
    'ExecutionProfile',
    'DelegationTarget',
    'DelegationDecision',
    'ModeDecision',
    'RuntimeState',
    'RuntimeLaw',
    'RuntimeHierarchy',
]

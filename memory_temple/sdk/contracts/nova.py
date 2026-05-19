"""
CIVOS-PRIME: NOVA Contract
===========================

The runtime governance contract. Classify task depth, choose mode,
decide delegation, switch execution profile.

Purpose:
- Task classification
- Mode selection
- Delegation decisions
- Execution profile management

Must prove runtime hierarchy is explicit and inspectable.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable
import uuid

from ..types.runtime import (
    PHI,
    HEARTBEAT_MS,
    COMPLEXITY_THRESHOLD,
    TaskDepth,
    ExecutionMode,
    DelegationLevel,
    RuntimeAuthority,
    TaskClassification,
    ExecutionProfile,
    DelegationTarget,
    DelegationDecision,
    ModeDecision,
    RuntimeState,
    RuntimeLaw,
    RuntimeHierarchy,
)


class NovaError(Exception):
    """Base error for NOVA operations."""
    pass


class DelegationDeniedError(NovaError):
    """Raised when delegation is denied by law."""
    pass


class AuthorityViolationError(NovaError):
    """Raised when authority hierarchy is violated."""
    pass


class ProfileNotFoundError(NovaError):
    """Raised when execution profile is not found."""
    pass


@dataclass
class ClassifyRequest:
    """Request to classify a task."""
    request_id: str
    task_id: str
    task_description: str
    estimated_operations: int = 0
    resource_hints: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class ClassifyResult:
    """Result of task classification."""
    request_id: str
    success: bool
    classification: Optional[TaskClassification] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class DecideModeRequest:
    """Request for mode decision."""
    request_id: str
    classification: TaskClassification
    preferred_mode: Optional[ExecutionMode] = None
    constraints: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class DecideModeResult:
    """Result of mode decision."""
    request_id: str
    success: bool
    decision: Optional[ModeDecision] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class DecideDelegationRequest:
    """Request for delegation decision."""
    request_id: str
    classification: TaskClassification
    available_targets: List[DelegationTarget] = field(default_factory=list)
    delegation_constraints: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class DecideDelegationResult:
    """Result of delegation decision."""
    request_id: str
    success: bool
    decision: Optional[DelegationDecision] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class INova(ABC):
    """
    NOVA Contract Interface.
    
    All runtime governance must go through this interface to ensure
    explicit, inspectable hierarchy.
    """
    
    @abstractmethod
    def classify_task(self, request: ClassifyRequest) -> ClassifyResult:
        """
        Classify task depth.
        
        Returns deterministic depth classification with named reasons.
        """
        pass
    
    @abstractmethod
    def decide_mode(self, request: DecideModeRequest) -> DecideModeResult:
        """
        Decide execution mode.
        
        Returns deterministic mode decision with named reasons.
        """
        pass
    
    @abstractmethod
    def decide_delegation(self, request: DecideDelegationRequest) -> DecideDelegationResult:
        """
        Decide whether and how to delegate.
        
        Foundation-floor delegation cannot gain speaking or canon authority.
        """
        pass
    
    @abstractmethod
    def get_profile(self, profile_id: str) -> Optional[ExecutionProfile]:
        """Get an execution profile by ID."""
        pass
    
    @abstractmethod
    def register_profile(self, profile: ExecutionProfile) -> bool:
        """Register an execution profile."""
        pass
    
    @abstractmethod
    def get_runtime_state(self) -> RuntimeState:
        """Get current runtime state."""
        pass
    
    @abstractmethod
    def get_hierarchy(self) -> RuntimeHierarchy:
        """Get runtime hierarchy (must be inspectable)."""
        pass
    
    @abstractmethod
    def check_law(self, law_id: str, context: Dict[str, Any]) -> bool:
        """Check if a runtime law is satisfied."""
        pass


class Nova(INova):
    """
    NOVA Implementation.
    
    Provides runtime governance with explicit, inspectable hierarchy.
    """
    
    def __init__(self):
        self._profiles: Dict[str, ExecutionProfile] = {}
        self._targets: Dict[str, DelegationTarget] = {}
        self._hierarchy = RuntimeHierarchy(hierarchy_id="default")
        self._state = RuntimeState(state_id="current")
        
        # Register default profiles
        self._profiles["default"] = ExecutionProfile.default()
        self._profiles["bounded-5000ms"] = ExecutionProfile.bounded(5000)
        self._profiles["bounded-30000ms"] = ExecutionProfile.bounded(30000)
    
    def classify_task(self, request: ClassifyRequest) -> ClassifyResult:
        """Classify task depth."""
        try:
            reasons = []
            
            # Estimate complexity
            operations = request.estimated_operations
            
            # Determine depth based on operations
            if operations == 0:
                # Unknown, needs analysis
                depth = TaskDepth.MODERATE
                reasons.append("Unknown operation count, defaulting to moderate")
            elif operations < 10:
                depth = TaskDepth.TRIVIAL
                reasons.append(f"Low operation count ({operations} < 10)")
            elif operations < 100:
                depth = TaskDepth.SHALLOW
                reasons.append(f"Moderate operation count ({operations} < 100)")
            elif operations < 1000:
                depth = TaskDepth.MODERATE
                reasons.append(f"High operation count ({operations} < 1000)")
            elif operations < 10000:
                depth = TaskDepth.DEEP
                reasons.append(f"Very high operation count ({operations} < 10000)")
            else:
                depth = TaskDepth.UNBOUNDED
                reasons.append(f"Unbounded operation count ({operations} >= 10000)")
            
            # Check resource hints
            if request.resource_hints.get('requires_network'):
                if depth.value in ('trivial', 'shallow'):
                    depth = TaskDepth.MODERATE
                reasons.append("Network required, upgrading depth")
            
            if request.resource_hints.get('requires_heavy_compute'):
                if depth.value in ('trivial', 'shallow', 'moderate'):
                    depth = TaskDepth.DEEP
                reasons.append("Heavy compute required, upgrading to deep")
            
            # Calculate complexity score (φ-scaled)
            complexity = min(1.0, operations / 10000.0) * PHI
            if complexity > 1.0:
                complexity = 1.0
            
            # Estimate duration (using heartbeat intervals)
            estimated_duration = operations * HEARTBEAT_MS // 100
            
            classification = TaskClassification(
                task_id=request.task_id,
                depth=depth,
                estimated_steps=operations,
                estimated_duration_ms=estimated_duration,
                complexity_score=complexity,
                resource_requirements=request.resource_hints,
                reasons=reasons,
            )
            
            return ClassifyResult(
                request_id=request.request_id,
                success=True,
                classification=classification,
            )
            
        except Exception as e:
            return ClassifyResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e),
            )
    
    def decide_mode(self, request: DecideModeRequest) -> DecideModeResult:
        """Decide execution mode."""
        try:
            reasons = []
            classification = request.classification
            alternatives = []
            
            # Start with depth-based recommendation
            if classification.depth == TaskDepth.TRIVIAL:
                mode = ExecutionMode.SYNC
                profile_id = "default"
                reasons.append("Trivial depth -> sync execution")
                alternatives = [ExecutionMode.ASYNC]
                
            elif classification.depth == TaskDepth.SHALLOW:
                mode = ExecutionMode.SYNC
                profile_id = "bounded-5000ms"
                reasons.append("Shallow depth -> bounded sync execution")
                alternatives = [ExecutionMode.ASYNC]
                
            elif classification.depth == TaskDepth.MODERATE:
                mode = ExecutionMode.ASYNC
                profile_id = "bounded-30000ms"
                reasons.append("Moderate depth -> async execution")
                alternatives = [ExecutionMode.SYNC, ExecutionMode.STREAM]
                
            elif classification.depth == TaskDepth.DEEP:
                mode = ExecutionMode.ASYNC
                profile_id = "bounded-30000ms"
                reasons.append("Deep depth -> async with delegation likely")
                alternatives = [ExecutionMode.BATCH]
                
            else:  # UNBOUNDED
                mode = ExecutionMode.BATCH
                profile_id = "bounded-30000ms"
                reasons.append("Unbounded depth -> batch with strict bounds")
                alternatives = [ExecutionMode.DEFERRED]
            
            # Apply preferred mode if compatible
            if request.preferred_mode:
                if request.preferred_mode in alternatives or request.preferred_mode == mode:
                    mode = request.preferred_mode
                    reasons.append(f"Applied preferred mode: {mode.value}")
                else:
                    reasons.append(f"Ignored incompatible preferred mode: {request.preferred_mode.value}")
            
            # Apply constraints
            if request.constraints.get('force_sync'):
                mode = ExecutionMode.SYNC
                reasons.append("Constraint: forced sync mode")
            
            if request.constraints.get('max_duration_ms'):
                max_ms = request.constraints['max_duration_ms']
                if classification.estimated_duration_ms > max_ms:
                    mode = ExecutionMode.DEFERRED
                    reasons.append(f"Estimated duration exceeds constraint ({max_ms}ms), deferring")
            
            profile = self.get_profile(profile_id) or ExecutionProfile.default()
            
            decision = ModeDecision(
                decision_id=str(uuid.uuid4()),
                task_id=classification.task_id,
                selected_mode=mode,
                profile=profile,
                reasons=reasons,
                alternatives=alternatives,
            )
            
            return DecideModeResult(
                request_id=request.request_id,
                success=True,
                decision=decision,
            )
            
        except Exception as e:
            return DecideModeResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e),
            )
    
    def decide_delegation(self, request: DecideDelegationRequest) -> DecideDelegationResult:
        """Decide whether and how to delegate."""
        try:
            reasons = []
            classification = request.classification
            
            # Check if delegation is needed
            should_delegate = classification.requires_delegation()
            
            if not should_delegate:
                reasons.append(f"Depth {classification.depth.value} does not require delegation")
                
                decision = DelegationDecision(
                    decision_id=str(uuid.uuid4()),
                    task_id=classification.task_id,
                    should_delegate=False,
                    delegation_level=DelegationLevel.NONE,
                    reasons=reasons,
                )
                
                return DecideDelegationResult(
                    request_id=request.request_id,
                    success=True,
                    decision=decision,
                )
            
            reasons.append(f"Depth {classification.depth.value} requires delegation")
            
            # Find best target
            available = [t for t in request.available_targets if t.can_accept(classification)]
            
            if not available:
                reasons.append("No available targets can accept task")
                
                decision = DelegationDecision(
                    decision_id=str(uuid.uuid4()),
                    task_id=classification.task_id,
                    should_delegate=True,
                    delegation_level=DelegationLevel.COMPUTE,
                    target=None,
                    reasons=reasons,
                )
                
                return DecideDelegationResult(
                    request_id=request.request_id,
                    success=True,
                    decision=decision,
                )
            
            # Sort by load (prefer less loaded targets)
            available.sort(key=lambda t: t.current_load)
            target = available[0]
            reasons.append(f"Selected target {target.target_id} (load: {target.current_load})")
            
            # Determine delegation level based on task
            if classification.depth == TaskDepth.DEEP:
                level = DelegationLevel.COMPUTE
            elif classification.depth == TaskDepth.UNBOUNDED:
                level = DelegationLevel.FULL
            else:
                level = DelegationLevel.QUERY
            
            reasons.append(f"Delegation level: {level.value}")
            
            # Check foundation floor constraint
            if target.authority_level == RuntimeAuthority.FOUNDATION:
                # Foundation cannot gain authority
                if level == DelegationLevel.FULL:
                    level = DelegationLevel.COMPUTE
                    reasons.append("Foundation floor cannot have full delegation, reduced to compute")
            
            decision = DelegationDecision(
                decision_id=str(uuid.uuid4()),
                task_id=classification.task_id,
                should_delegate=True,
                delegation_level=level,
                target=target,
                reasons=reasons,
            )
            
            return DecideDelegationResult(
                request_id=request.request_id,
                success=True,
                decision=decision,
            )
            
        except Exception as e:
            return DecideDelegationResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e),
            )
    
    def get_profile(self, profile_id: str) -> Optional[ExecutionProfile]:
        """Get an execution profile by ID."""
        return self._profiles.get(profile_id)
    
    def register_profile(self, profile: ExecutionProfile) -> bool:
        """Register an execution profile."""
        self._profiles[profile.profile_id] = profile
        return True
    
    def get_runtime_state(self) -> RuntimeState:
        """Get current runtime state."""
        self._state.timestamp = datetime.utcnow()
        self._state.available_targets = list(self._targets.keys())
        return self._state
    
    def get_hierarchy(self) -> RuntimeHierarchy:
        """Get runtime hierarchy (inspectable)."""
        return self._hierarchy
    
    def check_law(self, law_id: str, context: Dict[str, Any]) -> bool:
        """Check if a runtime law is satisfied."""
        for law in self._hierarchy.laws:
            if law.law_id == law_id:
                if not law.enabled:
                    return True  # Disabled laws always pass
                
                # Check specific laws
                if law_id == "law-no-canon-bypass":
                    # Canon writes must go through memoria
                    target = context.get('target')
                    source = context.get('source')
                    if target == 'canon' and source != 'memoria':
                        return False
                
                elif law_id == "law-foundation-no-authority":
                    # Foundation cannot gain authority
                    authority = context.get('authority')
                    promotes = context.get('promotes_authority')
                    if authority == 'foundation' and promotes:
                        return False
                
                return True
        
        # Unknown law, pass
        return True
    
    def register_target(self, target: DelegationTarget) -> bool:
        """Register a delegation target."""
        self._targets[target.target_id] = target
        
        # Add to hierarchy
        if target.authority_level not in self._hierarchy.levels:
            self._hierarchy.levels[target.authority_level] = []
        self._hierarchy.levels[target.authority_level].append(target.target_id)
        
        return True


# Export all
__all__ = [
    'NovaError',
    'DelegationDeniedError',
    'AuthorityViolationError',
    'ProfileNotFoundError',
    'ClassifyRequest',
    'ClassifyResult',
    'DecideModeRequest',
    'DecideModeResult',
    'DecideDelegationRequest',
    'DecideDelegationResult',
    'INova',
    'Nova',
]

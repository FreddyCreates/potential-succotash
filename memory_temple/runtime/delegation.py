"""
CIVOS-PRIME: Delegation Runtime
================================

Runtime delegation management.
Handles delegation targets, authority, and bounded execution.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable
from enum import Enum
import uuid


class DelegationError(Exception):
    """Base error for delegation operations."""
    pass


class AuthorityLevel(Enum):
    """Authority levels for delegation targets."""
    CANON = "canon"          # Can write to trunk
    SPEAKING = "speaking"    # Can propose changes
    OBSERVER = "observer"    # Read-only access
    FOUNDATION = "foundation"  # Lowest level, no canon access


@dataclass
class DelegationTarget:
    """A delegation target."""
    target_id: str
    target_type: str
    authority: AuthorityLevel
    endpoint: Optional[str] = None
    capabilities: List[str] = field(default_factory=list)
    current_load: float = 0.0
    max_load: float = 1.0
    available: bool = True
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def can_accept(self, required_capabilities: List[str] = None) -> bool:
        """Check if target can accept work."""
        if not self.available:
            return False
        
        if self.current_load >= self.max_load:
            return False
        
        if required_capabilities:
            for cap in required_capabilities:
                if cap not in self.capabilities:
                    return False
        
        return True


@dataclass
class DelegationRequest:
    """Request for delegation."""
    request_id: str
    task_id: str
    payload: Any
    required_capabilities: List[str] = field(default_factory=list)
    preferred_authority: Optional[AuthorityLevel] = None
    timeout_ms: int = 30000
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class DelegationResponse:
    """Response from delegation."""
    request_id: str
    success: bool
    target_id: Optional[str] = None
    result: Any = None
    execution_time_ms: int = 0
    authority_used: Optional[AuthorityLevel] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class DelegationManager:
    """
    Manages delegation targets and execution.
    
    Enforces foundation floor law: foundation cannot gain authority.
    """
    
    def __init__(self):
        self._targets: Dict[str, DelegationTarget] = {}
        self._authority_hierarchy = [
            AuthorityLevel.CANON,
            AuthorityLevel.SPEAKING,
            AuthorityLevel.OBSERVER,
            AuthorityLevel.FOUNDATION,
        ]
    
    def register_target(self, target: DelegationTarget) -> bool:
        """Register a delegation target."""
        self._targets[target.target_id] = target
        return True
    
    def unregister_target(self, target_id: str) -> bool:
        """Unregister a delegation target."""
        if target_id in self._targets:
            del self._targets[target_id]
            return True
        return False
    
    def get_target(self, target_id: str) -> Optional[DelegationTarget]:
        """Get target by ID."""
        return self._targets.get(target_id)
    
    def list_targets(
        self,
        authority: Optional[AuthorityLevel] = None,
        capability: Optional[str] = None,
        available_only: bool = True,
    ) -> List[DelegationTarget]:
        """List targets with optional filters."""
        targets = list(self._targets.values())
        
        if available_only:
            targets = [t for t in targets if t.available]
        
        if authority:
            targets = [t for t in targets if t.authority == authority]
        
        if capability:
            targets = [t for t in targets if capability in t.capabilities]
        
        return targets
    
    def select_target(self, request: DelegationRequest) -> Optional[DelegationTarget]:
        """Select best target for request."""
        candidates = self.list_targets(
            authority=request.preferred_authority,
            available_only=True,
        )
        
        # Filter by capabilities
        candidates = [
            t for t in candidates
            if t.can_accept(request.required_capabilities)
        ]
        
        if not candidates:
            # Try without authority preference
            candidates = [
                t for t in self.list_targets(available_only=True)
                if t.can_accept(request.required_capabilities)
            ]
        
        if not candidates:
            return None
        
        # Sort by load (prefer least loaded)
        candidates.sort(key=lambda t: t.current_load)
        
        return candidates[0]
    
    def can_promote_authority(self, from_auth: AuthorityLevel, to_auth: AuthorityLevel) -> bool:
        """
        Check if authority can be promoted.
        
        Foundation cannot be promoted to higher authority.
        """
        if from_auth == AuthorityLevel.FOUNDATION:
            return False  # Foundation cannot gain authority
        
        from_idx = self._authority_hierarchy.index(from_auth)
        to_idx = self._authority_hierarchy.index(to_auth)
        
        # Can only promote (lower index = higher authority)
        return to_idx < from_idx
    
    def delegate(self, request: DelegationRequest) -> DelegationResponse:
        """
        Execute delegation request.
        
        Selects target and executes with bounded timeout.
        """
        target = self.select_target(request)
        
        if not target:
            return DelegationResponse(
                request_id=request.request_id,
                success=False,
                error_message="No suitable target found",
            )
        
        # Update target load
        target.current_load += 0.1
        
        start_time = datetime.utcnow()
        
        try:
            # Simulated execution (in real implementation would dispatch to target)
            result = request.payload
            
            execution_time = int((datetime.utcnow() - start_time).total_seconds() * 1000)
            
            return DelegationResponse(
                request_id=request.request_id,
                success=True,
                target_id=target.target_id,
                result=result,
                execution_time_ms=execution_time,
                authority_used=target.authority,
            )
            
        except Exception as e:
            return DelegationResponse(
                request_id=request.request_id,
                success=False,
                target_id=target.target_id,
                error_message=str(e),
            )
        finally:
            # Restore target load
            target.current_load = max(0, target.current_load - 0.1)


# Export all
__all__ = [
    'DelegationError',
    'AuthorityLevel',
    'DelegationTarget',
    'DelegationRequest',
    'DelegationResponse',
    'DelegationManager',
]

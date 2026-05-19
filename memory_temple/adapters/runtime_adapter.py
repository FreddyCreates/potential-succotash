"""
CIVOS-PRIME: Runtime Adapter
=============================

Third-priority adapter for runtime operations.
Provides execution profile mapping and delegation target translation.

Ownership boundaries:
- Execution profile mapping
- Runtime target normalization
- Delegation target translation
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable
import uuid


class RuntimeAdapterError(Exception):
    """Base error for runtime adapter operations."""
    pass


class ProfileMappingError(RuntimeAdapterError):
    """Raised when profile mapping fails."""
    pass


class TargetTranslationError(RuntimeAdapterError):
    """Raised when target translation fails."""
    pass


@dataclass
class RuntimeTarget:
    """Normalized runtime target."""
    target_id: str
    target_type: str
    endpoint: Optional[str] = None
    capabilities: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)


@dataclass
class ProfileMapping:
    """Mapping between profile and runtime configuration."""
    profile_id: str
    runtime_config: Dict[str, Any]
    target_requirements: List[str] = field(default_factory=list)


@dataclass
class ExecutionContext:
    """Context for execution."""
    context_id: str
    profile_id: str
    target: Optional[RuntimeTarget] = None
    timeout_ms: int = 30000
    metadata: Dict[str, Any] = field(default_factory=dict)
    created_at: datetime = field(default_factory=datetime.utcnow)


class IRuntimeAdapter(ABC):
    """Runtime adapter interface."""
    
    @abstractmethod
    def map_profile(self, profile_id: str) -> ProfileMapping:
        """Map profile ID to runtime configuration."""
        pass
    
    @abstractmethod
    def normalize_target(self, raw_target: Dict[str, Any]) -> RuntimeTarget:
        """Normalize raw target to standard format."""
        pass
    
    @abstractmethod
    def translate_delegation(self, decision: Any) -> RuntimeTarget:
        """Translate delegation decision to runtime target."""
        pass
    
    @abstractmethod
    def create_context(self, profile_id: str, target: Optional[RuntimeTarget] = None) -> ExecutionContext:
        """Create execution context."""
        pass
    
    @abstractmethod
    def validate_target(self, target: RuntimeTarget) -> bool:
        """Validate runtime target."""
        pass


class RuntimeAdapter(IRuntimeAdapter):
    """
    Runtime Adapter Implementation.
    
    Third-priority adapter for runtime operations.
    """
    
    def __init__(self):
        self._profile_mappings: Dict[str, ProfileMapping] = {}
        self._targets: Dict[str, RuntimeTarget] = {}
        self._init_default_mappings()
    
    def _init_default_mappings(self):
        """Initialize default profile mappings."""
        # Default sync profile
        self._profile_mappings["default"] = ProfileMapping(
            profile_id="default",
            runtime_config={
                "mode": "sync",
                "timeout_ms": 30000,
                "max_memory_mb": 512,
                "max_cpu_percent": 80,
            },
            target_requirements=["compute"],
        )
        
        # Bounded profiles
        self._profile_mappings["bounded-5000ms"] = ProfileMapping(
            profile_id="bounded-5000ms",
            runtime_config={
                "mode": "sync",
                "timeout_ms": 5000,
                "max_memory_mb": 256,
                "max_cpu_percent": 50,
            },
            target_requirements=["compute"],
        )
        
        self._profile_mappings["bounded-30000ms"] = ProfileMapping(
            profile_id="bounded-30000ms",
            runtime_config={
                "mode": "async",
                "timeout_ms": 30000,
                "max_memory_mb": 1024,
                "max_cpu_percent": 90,
            },
            target_requirements=["compute", "async"],
        )
        
        # Batch profile
        self._profile_mappings["batch"] = ProfileMapping(
            profile_id="batch",
            runtime_config={
                "mode": "batch",
                "timeout_ms": 300000,
                "max_memory_mb": 2048,
                "max_cpu_percent": 100,
            },
            target_requirements=["compute", "batch", "queue"],
        )
    
    def map_profile(self, profile_id: str) -> ProfileMapping:
        """Map profile ID to runtime configuration."""
        if profile_id in self._profile_mappings:
            return self._profile_mappings[profile_id]
        
        # Return default for unknown profiles
        return self._profile_mappings["default"]
    
    def normalize_target(self, raw_target: Dict[str, Any]) -> RuntimeTarget:
        """Normalize raw target to standard format."""
        target_id = raw_target.get("id") or raw_target.get("target_id") or str(uuid.uuid4())
        
        return RuntimeTarget(
            target_id=target_id,
            target_type=raw_target.get("type") or raw_target.get("target_type") or "generic",
            endpoint=raw_target.get("endpoint") or raw_target.get("url"),
            capabilities=raw_target.get("capabilities", []),
            metadata={
                k: v for k, v in raw_target.items()
                if k not in ("id", "target_id", "type", "target_type", "endpoint", "url", "capabilities")
            },
        )
    
    def translate_delegation(self, decision: Any) -> RuntimeTarget:
        """Translate delegation decision to runtime target."""
        if hasattr(decision, 'target') and decision.target:
            raw_target = decision.target
            
            if hasattr(raw_target, 'target_id'):
                return RuntimeTarget(
                    target_id=raw_target.target_id,
                    target_type=raw_target.target_type,
                    capabilities=raw_target.capabilities if hasattr(raw_target, 'capabilities') else [],
                )
            
            return self.normalize_target(vars(raw_target) if hasattr(raw_target, '__dict__') else raw_target)
        
        # No target in decision, return local target
        return RuntimeTarget(
            target_id="local",
            target_type="local",
            capabilities=["compute"],
        )
    
    def create_context(self, profile_id: str, target: Optional[RuntimeTarget] = None) -> ExecutionContext:
        """Create execution context."""
        mapping = self.map_profile(profile_id)
        
        return ExecutionContext(
            context_id=str(uuid.uuid4()),
            profile_id=profile_id,
            target=target,
            timeout_ms=mapping.runtime_config.get("timeout_ms", 30000),
            metadata={"mapping": mapping.runtime_config},
        )
    
    def validate_target(self, target: RuntimeTarget) -> bool:
        """Validate runtime target."""
        if not target.target_id:
            return False
        
        if not target.target_type:
            return False
        
        return True
    
    def register_target(self, target: RuntimeTarget) -> bool:
        """Register a runtime target."""
        if not self.validate_target(target):
            return False
        
        self._targets[target.target_id] = target
        return True
    
    def get_target(self, target_id: str) -> Optional[RuntimeTarget]:
        """Get registered target."""
        return self._targets.get(target_id)
    
    def list_targets(self, capability: Optional[str] = None) -> List[RuntimeTarget]:
        """List registered targets, optionally filtered by capability."""
        targets = list(self._targets.values())
        
        if capability:
            targets = [t for t in targets if capability in t.capabilities]
        
        return targets
    
    def register_profile_mapping(self, mapping: ProfileMapping) -> bool:
        """Register a profile mapping."""
        self._profile_mappings[mapping.profile_id] = mapping
        return True


# Export all
__all__ = [
    'RuntimeAdapterError',
    'ProfileMappingError',
    'TargetTranslationError',
    'RuntimeTarget',
    'ProfileMapping',
    'ExecutionContext',
    'IRuntimeAdapter',
    'RuntimeAdapter',
]

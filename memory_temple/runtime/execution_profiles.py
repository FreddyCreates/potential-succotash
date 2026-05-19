"""
CIVOS-PRIME: Execution Profiles
================================

Runtime execution profile management.
Defines resource limits, timeouts, and fallback behavior.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid


class ExecutionMode(Enum):
    """Execution modes."""
    SYNC = "sync"          # Synchronous, blocking
    ASYNC = "async"        # Asynchronous, non-blocking
    STREAM = "stream"      # Streaming response
    BATCH = "batch"        # Batched processing
    DEFERRED = "deferred"  # Queued for later


@dataclass
class ResourceLimits:
    """Resource limits for execution."""
    max_memory_mb: int = 512
    max_cpu_percent: int = 80
    max_disk_mb: int = 1024
    max_network_connections: int = 100


@dataclass
class ExecutionProfile:
    """
    Execution profile defining runtime behavior.
    
    Profiles determine resource limits, timeouts, and fallback behavior.
    """
    profile_id: str
    name: str
    mode: ExecutionMode = ExecutionMode.SYNC
    timeout_ms: int = 30000
    retry_count: int = 3
    retry_delay_ms: int = 1000
    resources: ResourceLimits = field(default_factory=ResourceLimits)
    fallback_profile_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @staticmethod
    def default() -> 'ExecutionProfile':
        """Return default profile."""
        return ExecutionProfile(
            profile_id="default",
            name="Default Profile",
            mode=ExecutionMode.SYNC,
            timeout_ms=30000,
        )
    
    @staticmethod
    def bounded(timeout_ms: int, name: str = None) -> 'ExecutionProfile':
        """Return bounded profile with specified timeout."""
        return ExecutionProfile(
            profile_id=f"bounded-{timeout_ms}ms",
            name=name or f"Bounded {timeout_ms}ms",
            mode=ExecutionMode.SYNC,
            timeout_ms=timeout_ms,
        )
    
    @staticmethod
    def async_default() -> 'ExecutionProfile':
        """Return default async profile."""
        return ExecutionProfile(
            profile_id="async-default",
            name="Async Default",
            mode=ExecutionMode.ASYNC,
            timeout_ms=60000,
        )
    
    @staticmethod
    def batch_default() -> 'ExecutionProfile':
        """Return default batch profile."""
        return ExecutionProfile(
            profile_id="batch-default",
            name="Batch Default",
            mode=ExecutionMode.BATCH,
            timeout_ms=300000,
            resources=ResourceLimits(
                max_memory_mb=2048,
                max_cpu_percent=100,
            ),
        )


class ExecutionProfileManager:
    """
    Manages execution profiles.
    
    Provides profile registration, lookup, and selection.
    """
    
    def __init__(self):
        self._profiles: Dict[str, ExecutionProfile] = {}
        self._init_default_profiles()
    
    def _init_default_profiles(self):
        """Initialize default profiles."""
        defaults = [
            ExecutionProfile.default(),
            ExecutionProfile.bounded(5000),
            ExecutionProfile.bounded(30000),
            ExecutionProfile.bounded(60000),
            ExecutionProfile.async_default(),
            ExecutionProfile.batch_default(),
            
            # Trivial tasks
            ExecutionProfile(
                profile_id="trivial",
                name="Trivial",
                mode=ExecutionMode.SYNC,
                timeout_ms=1000,
                resources=ResourceLimits(max_memory_mb=128, max_cpu_percent=20),
            ),
            
            # Heavy compute
            ExecutionProfile(
                profile_id="heavy-compute",
                name="Heavy Compute",
                mode=ExecutionMode.ASYNC,
                timeout_ms=300000,
                resources=ResourceLimits(max_memory_mb=4096, max_cpu_percent=100),
            ),
            
            # Foundation floor (restricted)
            ExecutionProfile(
                profile_id="foundation-floor",
                name="Foundation Floor",
                mode=ExecutionMode.SYNC,
                timeout_ms=10000,
                resources=ResourceLimits(max_memory_mb=256, max_cpu_percent=30),
            ),
        ]
        
        for profile in defaults:
            self.register(profile)
    
    def register(self, profile: ExecutionProfile) -> bool:
        """Register a profile."""
        self._profiles[profile.profile_id] = profile
        return True
    
    def unregister(self, profile_id: str) -> bool:
        """Unregister a profile."""
        if profile_id in self._profiles and profile_id != "default":
            del self._profiles[profile_id]
            return True
        return False
    
    def get(self, profile_id: str) -> Optional[ExecutionProfile]:
        """Get profile by ID."""
        return self._profiles.get(profile_id)
    
    def get_or_default(self, profile_id: str) -> ExecutionProfile:
        """Get profile or return default."""
        return self._profiles.get(profile_id) or self._profiles["default"]
    
    def list_all(self) -> List[ExecutionProfile]:
        """List all profiles."""
        return list(self._profiles.values())
    
    def list_by_mode(self, mode: ExecutionMode) -> List[ExecutionProfile]:
        """List profiles by mode."""
        return [p for p in self._profiles.values() if p.mode == mode]
    
    def select_for_task(
        self,
        estimated_duration_ms: int,
        requires_async: bool = False,
        max_memory_mb: int = None,
    ) -> ExecutionProfile:
        """
        Select appropriate profile for task.
        
        Considers duration, async requirements, and resource needs.
        """
        candidates = list(self._profiles.values())
        
        # Filter by mode if async required
        if requires_async:
            candidates = [
                p for p in candidates
                if p.mode in (ExecutionMode.ASYNC, ExecutionMode.BATCH)
            ]
        
        # Filter by timeout (profile timeout must be >= estimated duration)
        candidates = [
            p for p in candidates
            if p.timeout_ms >= estimated_duration_ms
        ]
        
        # Filter by memory if specified
        if max_memory_mb:
            candidates = [
                p for p in candidates
                if p.resources.max_memory_mb >= max_memory_mb
            ]
        
        if not candidates:
            return self._profiles["default"]
        
        # Select profile with smallest adequate timeout
        candidates.sort(key=lambda p: p.timeout_ms)
        return candidates[0]
    
    def get_fallback(self, profile: ExecutionProfile) -> Optional[ExecutionProfile]:
        """Get fallback profile for given profile."""
        if profile.fallback_profile_id:
            return self.get(profile.fallback_profile_id)
        return None


# Export all
__all__ = [
    'ExecutionMode',
    'ResourceLimits',
    'ExecutionProfile',
    'ExecutionProfileManager',
]

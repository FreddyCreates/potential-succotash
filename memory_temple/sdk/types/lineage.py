"""
CIVOS-PRIME: Lineage Types
===========================

Core data types for tracking memory lineage, trunk/branch separation,
and continuity events across the canonical filesystem.

φ-Mathematics: All timestamps align to heartbeat intervals (873ms)
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from enum import Enum
import uuid
import hashlib


# φ-Constants
PHI = 1.618033988749895
HEARTBEAT_MS = 873
THRESHOLD = 0.618


class BranchStatus(Enum):
    """Trunk vs branch status for all memory objects."""
    TRUNK = "trunk"          # Canon-grade, immutable
    BRANCH = "branch"        # Working, mutable
    CONVERGING = "converging"  # Branch approaching trunk promotion
    ARCHIVED = "archived"    # Historical, read-only


class LineageType(Enum):
    """Types of lineage relationships."""
    PARENT = "parent"        # Direct ancestor
    DERIVED = "derived"      # Transformation relationship
    REFERENCED = "referenced"  # Citation without derivation
    MERGED = "merged"        # Multiple parents converged


@dataclass
class LineageNode:
    """Single node in a lineage chain."""
    id: str
    timestamp: datetime
    branch_status: BranchStatus
    parent_ids: List[str] = field(default_factory=list)
    lineage_type: LineageType = LineageType.PARENT
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = str(uuid.uuid4())


@dataclass
class LineageChain:
    """Complete lineage from root to current node."""
    chain_id: str
    nodes: List[LineageNode]
    root_id: str
    current_id: str
    depth: int = 0
    
    def __post_init__(self):
        self.depth = len(self.nodes)
    
    def get_trunk_nodes(self) -> List[LineageNode]:
        """Return only trunk-grade nodes."""
        return [n for n in self.nodes if n.branch_status == BranchStatus.TRUNK]
    
    def get_branch_nodes(self) -> List[LineageNode]:
        """Return only branch nodes."""
        return [n for n in self.nodes if n.branch_status == BranchStatus.BRANCH]


@dataclass
class ContinuityEvent:
    """Event marking a continuity checkpoint in memory."""
    event_id: str
    timestamp: datetime
    event_type: str
    source_id: str
    target_id: Optional[str] = None
    branch_status: BranchStatus = BranchStatus.BRANCH
    coherence_score: float = 0.0
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.event_id:
            self.event_id = str(uuid.uuid4())
        # Validate coherence against φ threshold
        if self.coherence_score < THRESHOLD:
            self.metadata['below_threshold'] = True


@dataclass
class MemoryObject:
    """Core memory object with full lineage tracking."""
    id: str
    content_hash: str
    branch_status: BranchStatus
    lineage: LineageChain
    created_at: datetime
    modified_at: datetime
    repo_path: str
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    @staticmethod
    def compute_hash(content: bytes) -> str:
        """Compute content-addressable hash."""
        return hashlib.sha256(content).hexdigest()
    
    def is_canon(self) -> bool:
        """Check if this is canon-grade memory."""
        return self.branch_status == BranchStatus.TRUNK
    
    def can_promote(self) -> bool:
        """Check if branch can be promoted to trunk."""
        return (
            self.branch_status == BranchStatus.BRANCH and
            self.metadata.get('coherence_score', 0) >= THRESHOLD
        )


@dataclass
class TrunkBranchSeparation:
    """
    Enforces physical and logical separation between trunk and branch.
    
    This is a core MEMORIA law: trunk and branch writes must be
    separable at both the filesystem and logical levels.
    """
    trunk_root: str = "memory_temple/doctrine"
    branch_root: str = "memory_temple/workstations"
    
    def get_path_for_status(self, obj_id: str, status: BranchStatus) -> str:
        """Return appropriate path based on branch status."""
        if status == BranchStatus.TRUNK:
            return f"{self.trunk_root}/{obj_id}"
        elif status == BranchStatus.ARCHIVED:
            return f"{self.trunk_root}/archive/{obj_id}"
        else:
            return f"{self.branch_root}/{obj_id}"
    
    def validate_write_path(self, path: str, status: BranchStatus) -> bool:
        """Validate that write path matches branch status."""
        if status == BranchStatus.TRUNK:
            return path.startswith(self.trunk_root)
        return path.startswith(self.branch_root)


# Export all types
__all__ = [
    'PHI',
    'HEARTBEAT_MS', 
    'THRESHOLD',
    'BranchStatus',
    'LineageType',
    'LineageNode',
    'LineageChain',
    'ContinuityEvent',
    'MemoryObject',
    'TrunkBranchSeparation',
]

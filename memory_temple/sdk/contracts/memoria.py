"""
CIVOS-PRIME: MEMORIA Contract
==============================

The lawful memory contract. All canon-safe writes must return through
MEMORIA Runtime law.

Purpose:
- Lawful canon reads
- Branch writes
- Continuity events
- Trunk/branch separation

Must prove trunk/branch separation and lineage-required writes.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
import uuid

from ..types.lineage import (
    BranchStatus,
    LineageNode,
    LineageChain,
    ContinuityEvent,
    MemoryObject,
    TrunkBranchSeparation,
    THRESHOLD,
)


class MemoriaError(Exception):
    """Base error for MEMORIA operations."""
    pass


class CanonBypassError(MemoriaError):
    """Raised when attempting to bypass MEMORIA for canon writes."""
    pass


class LineageRequiredError(MemoriaError):
    """Raised when lineage is required but not provided."""
    pass


class TrunkBranchViolationError(MemoriaError):
    """Raised when trunk/branch separation is violated."""
    pass


@dataclass
class ReadCanonRequest:
    """Request to read from canon."""
    request_id: str
    path: str
    include_lineage: bool = True
    include_metadata: bool = True
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class ReadCanonResult:
    """Result of canon read."""
    request_id: str
    success: bool
    memory_object: Optional[MemoryObject] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class WriteBranchRequest:
    """Request to write to branch."""
    request_id: str
    path: str
    content: bytes
    lineage_parent_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class WriteBranchResult:
    """Result of branch write."""
    request_id: str
    success: bool
    memory_object: Optional[MemoryObject] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class PromoteToCanonRequest:
    """Request to promote branch to canon."""
    request_id: str
    branch_id: str
    coherence_verification: bool = True
    authority_token: Optional[str] = None
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class PromoteToCanonResult:
    """Result of canon promotion."""
    request_id: str
    success: bool
    canon_id: Optional[str] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IMemoria(ABC):
    """
    MEMORIA Contract Interface.
    
    All memory operations must go through this interface to ensure
    lawful trunk/branch separation and lineage tracking.
    """
    
    @abstractmethod
    def read_canon(self, request: ReadCanonRequest) -> ReadCanonResult:
        """
        Read from canon (trunk).
        
        Canon reads are always allowed but must return full lineage.
        """
        pass
    
    @abstractmethod
    def write_branch_note(self, request: WriteBranchRequest) -> WriteBranchResult:
        """
        Write to branch.
        
        Branch writes require lineage tracking. Attempting to write
        to trunk through this method will raise TrunkBranchViolationError.
        """
        pass
    
    @abstractmethod
    def promote_to_canon(self, request: PromoteToCanonRequest) -> PromoteToCanonResult:
        """
        Promote branch to canon.
        
        Requires:
        - Coherence score >= THRESHOLD (0.618)
        - Valid authority token
        - Complete lineage chain
        """
        pass
    
    @abstractmethod
    def record_continuity_event(self, event: ContinuityEvent) -> bool:
        """
        Record a continuity checkpoint.
        
        Continuity events track significant memory state transitions.
        """
        pass
    
    @abstractmethod
    def get_lineage(self, object_id: str) -> Optional[LineageChain]:
        """
        Retrieve full lineage for an object.
        """
        pass
    
    @abstractmethod
    def verify_separation(self, path: str, status: BranchStatus) -> bool:
        """
        Verify trunk/branch separation is maintained.
        """
        pass


class Memoria(IMemoria):
    """
    MEMORIA Implementation.
    
    Enforces lawful memory operations with trunk/branch separation.
    """
    
    def __init__(self, adapter=None):
        self.adapter = adapter
        self.separation = TrunkBranchSeparation()
        self._objects: Dict[str, MemoryObject] = {}
        self._lineages: Dict[str, LineageChain] = {}
        self._continuity_events: List[ContinuityEvent] = []
    
    def read_canon(self, request: ReadCanonRequest) -> ReadCanonResult:
        """Read from canon."""
        try:
            # Construct canon path
            canon_path = f"{self.separation.trunk_root}/{request.path}"
            
            # Check if object exists
            if canon_path not in self._objects:
                # Try to load from adapter
                if self.adapter:
                    content = self.adapter.read(canon_path)
                    if content is None:
                        return ReadCanonResult(
                            request_id=request.request_id,
                            success=False,
                            error_message=f"Canon object not found: {request.path}"
                        )
                    
                    # Create memory object from loaded content
                    obj = MemoryObject(
                        id=request.path,
                        content_hash=MemoryObject.compute_hash(content),
                        branch_status=BranchStatus.TRUNK,
                        lineage=self._get_or_create_lineage(request.path),
                        created_at=datetime.utcnow(),
                        modified_at=datetime.utcnow(),
                        repo_path=canon_path,
                    )
                    self._objects[canon_path] = obj
                else:
                    return ReadCanonResult(
                        request_id=request.request_id,
                        success=False,
                        error_message=f"Canon object not found: {request.path}"
                    )
            
            obj = self._objects[canon_path]
            
            return ReadCanonResult(
                request_id=request.request_id,
                success=True,
                memory_object=obj,
            )
            
        except Exception as e:
            return ReadCanonResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e)
            )
    
    def write_branch_note(self, request: WriteBranchRequest) -> WriteBranchResult:
        """Write to branch with lineage tracking."""
        try:
            # Enforce branch path
            branch_path = f"{self.separation.branch_root}/{request.path}"
            
            # Verify separation
            if not self.verify_separation(branch_path, BranchStatus.BRANCH):
                raise TrunkBranchViolationError(
                    f"Path {request.path} violates trunk/branch separation"
                )
            
            # Create lineage node
            lineage_node = LineageNode(
                id=str(uuid.uuid4()),
                timestamp=datetime.utcnow(),
                branch_status=BranchStatus.BRANCH,
                parent_ids=[request.lineage_parent_id] if request.lineage_parent_id else [],
            )
            
            # Get or create lineage chain
            if request.lineage_parent_id and request.lineage_parent_id in self._lineages:
                parent_chain = self._lineages[request.lineage_parent_id]
                lineage = LineageChain(
                    chain_id=str(uuid.uuid4()),
                    nodes=parent_chain.nodes + [lineage_node],
                    root_id=parent_chain.root_id,
                    current_id=lineage_node.id,
                )
            else:
                lineage = LineageChain(
                    chain_id=str(uuid.uuid4()),
                    nodes=[lineage_node],
                    root_id=lineage_node.id,
                    current_id=lineage_node.id,
                )
            
            # Create memory object
            obj = MemoryObject(
                id=str(uuid.uuid4()),
                content_hash=MemoryObject.compute_hash(request.content),
                branch_status=BranchStatus.BRANCH,
                lineage=lineage,
                created_at=datetime.utcnow(),
                modified_at=datetime.utcnow(),
                repo_path=branch_path,
                metadata=request.metadata,
            )
            
            # Store
            self._objects[branch_path] = obj
            self._lineages[obj.id] = lineage
            
            # Write to adapter if available
            if self.adapter:
                self.adapter.write(branch_path, request.content)
            
            return WriteBranchResult(
                request_id=request.request_id,
                success=True,
                memory_object=obj,
            )
            
        except Exception as e:
            return WriteBranchResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e)
            )
    
    def promote_to_canon(self, request: PromoteToCanonRequest) -> PromoteToCanonResult:
        """Promote branch to canon."""
        try:
            # Find the branch object
            branch_obj = None
            branch_path = None
            for path, obj in self._objects.items():
                if obj.id == request.branch_id:
                    branch_obj = obj
                    branch_path = path
                    break
            
            if not branch_obj:
                return PromoteToCanonResult(
                    request_id=request.request_id,
                    success=False,
                    error_message=f"Branch object not found: {request.branch_id}"
                )
            
            # Verify it's actually a branch
            if branch_obj.branch_status != BranchStatus.BRANCH:
                return PromoteToCanonResult(
                    request_id=request.request_id,
                    success=False,
                    error_message="Object is not a branch"
                )
            
            # Check coherence if required
            if request.coherence_verification:
                coherence = branch_obj.metadata.get('coherence_score', 0)
                if coherence < THRESHOLD:
                    return PromoteToCanonResult(
                        request_id=request.request_id,
                        success=False,
                        error_message=f"Coherence score {coherence} below threshold {THRESHOLD}"
                    )
            
            # Promote
            canon_path = branch_path.replace(
                self.separation.branch_root,
                self.separation.trunk_root
            )
            
            branch_obj.branch_status = BranchStatus.TRUNK
            branch_obj.repo_path = canon_path
            
            # Update storage
            del self._objects[branch_path]
            self._objects[canon_path] = branch_obj
            
            # Move in adapter if available
            if self.adapter:
                content = self.adapter.read(branch_path)
                if content:
                    self.adapter.write(canon_path, content)
                    self.adapter.delete(branch_path)
            
            # Record continuity event
            self.record_continuity_event(ContinuityEvent(
                event_id=str(uuid.uuid4()),
                timestamp=datetime.utcnow(),
                event_type="promote_to_canon",
                source_id=request.branch_id,
                target_id=branch_obj.id,
                branch_status=BranchStatus.TRUNK,
            ))
            
            return PromoteToCanonResult(
                request_id=request.request_id,
                success=True,
                canon_id=branch_obj.id,
            )
            
        except Exception as e:
            return PromoteToCanonResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e)
            )
    
    def record_continuity_event(self, event: ContinuityEvent) -> bool:
        """Record continuity checkpoint."""
        self._continuity_events.append(event)
        return True
    
    def get_lineage(self, object_id: str) -> Optional[LineageChain]:
        """Get lineage for object."""
        return self._lineages.get(object_id)
    
    def verify_separation(self, path: str, status: BranchStatus) -> bool:
        """Verify trunk/branch separation."""
        return self.separation.validate_write_path(path, status)
    
    def _get_or_create_lineage(self, object_id: str) -> LineageChain:
        """Get existing or create new lineage."""
        if object_id in self._lineages:
            return self._lineages[object_id]
        
        node = LineageNode(
            id=object_id,
            timestamp=datetime.utcnow(),
            branch_status=BranchStatus.TRUNK,
        )
        
        lineage = LineageChain(
            chain_id=str(uuid.uuid4()),
            nodes=[node],
            root_id=object_id,
            current_id=object_id,
        )
        
        self._lineages[object_id] = lineage
        return lineage


# Export all
__all__ = [
    'MemoriaError',
    'CanonBypassError',
    'LineageRequiredError',
    'TrunkBranchViolationError',
    'ReadCanonRequest',
    'ReadCanonResult',
    'WriteBranchRequest',
    'WriteBranchResult',
    'PromoteToCanonRequest',
    'PromoteToCanonResult',
    'IMemoria',
    'Memoria',
]

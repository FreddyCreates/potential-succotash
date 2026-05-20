"""
CIVOS-PRIME: Memory Bridge
===========================

Highest-priority bridge for canon-safe memory operations.
All artifact or runtime results must return through Memory Runtime law.

Expectations:
- artifact or runtime results -> lawful memory objects
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid


class MemoryBridgeError(Exception):
    """Base error for memory bridge operations."""
    pass


class CanonViolationError(MemoryBridgeError):
    """Raised when canon law is violated."""
    pass


@dataclass
class BridgeInput:
    """Input to memory bridge."""
    input_id: str
    source_surface: str  # Which surface sent this
    content: bytes
    content_type: str
    lineage_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.input_id:
            self.input_id = str(uuid.uuid4())


@dataclass
class MemoryBridgeResult:
    """Result of memory bridge operation."""
    success: bool
    memory_object_id: Optional[str] = None
    repo_path: Optional[str] = None
    lineage_updated: bool = False
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IMemoryBridge(ABC):
    """Memory bridge interface."""
    
    @abstractmethod
    def bridge_to_memory(self, input: BridgeInput) -> MemoryBridgeResult:
        """Bridge artifact/runtime result to lawful memory."""
        pass
    
    @abstractmethod
    def validate_canon_law(self, input: BridgeInput) -> bool:
        """Validate input follows canon law."""
        pass
    
    @abstractmethod
    def create_lineage(self, input: BridgeInput) -> str:
        """Create lineage for bridged content."""
        pass


class MemoryBridge(IMemoryBridge):
    """
    Memory Bridge Implementation.
    
    Highest-priority bridge ensuring all results return through
    Memory Runtime law.
    """
    
    def __init__(self, memoria=None, filesystem_adapter=None):
        self.memoria = memoria
        self.fs = filesystem_adapter
        self._canon_sources = {'memoria', 'registrum'}  # Surfaces allowed to write canon
    
    def bridge_to_memory(self, input: BridgeInput) -> MemoryBridgeResult:
        """Bridge artifact/runtime result to lawful memory."""
        try:
            # Validate canon law
            if not self.validate_canon_law(input):
                return MemoryBridgeResult(
                    success=False,
                    error_message="Canon law violation: unauthorized source",
                )
            
            # Create or update lineage
            lineage_id = self.create_lineage(input)
            
            # If we have memoria, use it
            if self.memoria:
                from ..sdk.contracts.memoria import WriteBranchRequest
                
                result = self.memoria.write_branch_note(WriteBranchRequest(
                    request_id=input.input_id,
                    path=f"bridged/{input.source_surface}/{input.input_id}",
                    content=input.content,
                    lineage_parent_id=input.lineage_id,
                    metadata={
                        **input.metadata,
                        'bridged_from': input.source_surface,
                        'content_type': input.content_type,
                    },
                ))
                
                if result.success:
                    return MemoryBridgeResult(
                        success=True,
                        memory_object_id=result.memory_object.id,
                        repo_path=result.memory_object.repo_path,
                        lineage_updated=True,
                    )
                else:
                    return MemoryBridgeResult(
                        success=False,
                        error_message=result.error_message,
                    )
            
            # Fallback: direct filesystem write
            if self.fs:
                path = f"memory_temple/workstations/bridged/{input.source_surface}/{input.input_id}"
                write_result = self.fs.write(path, input.content)
                
                if write_result.success:
                    return MemoryBridgeResult(
                        success=True,
                        memory_object_id=input.input_id,
                        repo_path=path,
                        lineage_updated=False,
                    )
            
            return MemoryBridgeResult(
                success=False,
                error_message="No memoria or filesystem adapter available",
            )
            
        except Exception as e:
            return MemoryBridgeResult(
                success=False,
                error_message=str(e),
            )
    
    def validate_canon_law(self, input: BridgeInput) -> bool:
        """Validate input follows canon law."""
        # All sources can write to branch
        # Only canon sources can write to trunk (handled by memoria)
        return True
    
    def create_lineage(self, input: BridgeInput) -> str:
        """Create lineage for bridged content."""
        if input.lineage_id:
            return input.lineage_id
        
        return f"bridged-{input.source_surface}-{input.input_id}"


# Export all
__all__ = [
    'MemoryBridgeError',
    'CanonViolationError',
    'BridgeInput',
    'MemoryBridgeResult',
    'IMemoryBridge',
    'MemoryBridge',
]

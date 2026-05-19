"""
CIVOS-PRIME: Delegation Bridge
===============================

Fourth-priority bridge (but contract should exist early).
Heavy work gets bounded lower-runtime execution with canon-safe return.

Expectations:
- heavy work -> bounded lower-runtime execution -> canon-safe return
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Callable
import uuid


class DelegationBridgeError(Exception):
    """Base error for delegation bridge operations."""
    pass


class DelegationViolationError(DelegationBridgeError):
    """Raised when delegation law is violated."""
    pass


class BoundedExecutionError(DelegationBridgeError):
    """Raised when bounded execution fails."""
    pass


@dataclass
class DelegationInput:
    """Input to delegation bridge."""
    input_id: str
    task_id: str
    target_id: str
    payload: bytes
    timeout_ms: int = 30000
    authority_level: str = "foundation"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.input_id:
            self.input_id = str(uuid.uuid4())


@dataclass
class DelegationOutput:
    """Output from delegated execution."""
    output_id: str
    task_id: str
    result: Optional[bytes] = None
    success: bool = False
    execution_time_ms: int = 0
    authority_used: str = "foundation"
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class DelegationBridgeResult:
    """Result of delegation bridge operation."""
    success: bool
    output: Optional[DelegationOutput] = None
    memory_returned: bool = False
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IDelegationBridge(ABC):
    """Delegation bridge interface."""
    
    @abstractmethod
    def delegate(self, input: DelegationInput) -> DelegationBridgeResult:
        """Delegate heavy work to bounded execution."""
        pass
    
    @abstractmethod
    def validate_authority(self, authority_level: str) -> bool:
        """Validate authority level is allowed."""
        pass
    
    @abstractmethod
    def return_to_canon(self, output: DelegationOutput) -> bool:
        """Return execution result to canon-safe memory."""
        pass
    
    @abstractmethod
    def enforce_bounds(self, input: DelegationInput) -> bool:
        """Ensure execution stays within bounds."""
        pass


class DelegationBridge(IDelegationBridge):
    """
    Delegation Bridge Implementation.
    
    Fourth-priority bridge for bounded delegation.
    Foundation floor cannot gain speaking or canon authority.
    """
    
    def __init__(self, memoria=None, nova=None, memory_bridge=None):
        self.memoria = memoria
        self.nova = nova
        self.memory_bridge = memory_bridge
        self._allowed_authorities = {'foundation', 'observer', 'speaking'}
        self._max_timeout_ms = 300000  # 5 minute max
    
    def delegate(self, input: DelegationInput) -> DelegationBridgeResult:
        """Delegate heavy work to bounded execution."""
        try:
            # Validate authority
            if not self.validate_authority(input.authority_level):
                return DelegationBridgeResult(
                    success=False,
                    error_message=f"Invalid authority level: {input.authority_level}",
                )
            
            # Enforce bounds
            if not self.enforce_bounds(input):
                return DelegationBridgeResult(
                    success=False,
                    error_message="Execution bounds violated",
                )
            
            # Execute (simulated - in real implementation would dispatch to worker)
            start_time = datetime.utcnow()
            
            output = DelegationOutput(
                output_id=str(uuid.uuid4()),
                task_id=input.task_id,
                result=input.payload,  # Echo back in simulation
                success=True,
                execution_time_ms=100,  # Simulated
                authority_used=input.authority_level,
            )
            
            # Return to canon-safe memory
            memory_returned = self.return_to_canon(output)
            
            return DelegationBridgeResult(
                success=True,
                output=output,
                memory_returned=memory_returned,
            )
            
        except Exception as e:
            return DelegationBridgeResult(
                success=False,
                error_message=str(e),
            )
    
    def validate_authority(self, authority_level: str) -> bool:
        """Validate authority level is allowed."""
        # Foundation cannot gain higher authority
        if authority_level == 'canon':
            return False  # Canon authority requires special handling
        
        return authority_level in self._allowed_authorities
    
    def return_to_canon(self, output: DelegationOutput) -> bool:
        """Return execution result to canon-safe memory."""
        if not output.success or not output.result:
            return False
        
        # Use memory bridge if available
        if self.memory_bridge:
            from .memory_bridge import BridgeInput
            
            result = self.memory_bridge.bridge_to_memory(BridgeInput(
                input_id=output.output_id,
                source_surface='delegation',
                content=output.result,
                content_type='application/octet-stream',
                metadata={
                    'task_id': output.task_id,
                    'execution_time_ms': output.execution_time_ms,
                    'authority_used': output.authority_used,
                },
            ))
            
            return result.success
        
        # Use memoria directly if available
        if self.memoria:
            from ..sdk.contracts.memoria import WriteBranchRequest
            
            result = self.memoria.write_branch_note(WriteBranchRequest(
                request_id=output.output_id,
                path=f"delegation-results/{output.task_id}",
                content=output.result,
                metadata={
                    'delegated': True,
                    'authority': output.authority_used,
                },
            ))
            
            return result.success
        
        return False
    
    def enforce_bounds(self, input: DelegationInput) -> bool:
        """Ensure execution stays within bounds."""
        # Check timeout
        if input.timeout_ms > self._max_timeout_ms:
            return False
        
        if input.timeout_ms <= 0:
            return False
        
        # Foundation authority has stricter bounds
        if input.authority_level == 'foundation':
            if input.timeout_ms > 60000:  # 1 minute max for foundation
                return False
        
        return True
    
    def check_foundation_law(self, target_authority: str, grants_authority: bool) -> bool:
        """
        Check foundation floor law.
        
        Foundation floor delegation cannot become speaking or canon authority.
        """
        if target_authority == 'foundation' and grants_authority:
            return False  # Law violated
        
        return True


# Export all
__all__ = [
    'DelegationBridgeError',
    'DelegationViolationError',
    'BoundedExecutionError',
    'DelegationInput',
    'DelegationOutput',
    'DelegationBridgeResult',
    'IDelegationBridge',
    'DelegationBridge',
]

"""
CIVOS-PRIME: Registry Bridge
=============================

Second-priority bridge for auto-registration of durable objects.
Newly durable objects get indexed registry entries.

Expectations:
- newly durable objects -> indexed registry entries
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid


class RegistryBridgeError(Exception):
    """Base error for registry bridge operations."""
    pass


class RegistrationError(RegistryBridgeError):
    """Raised when registration fails."""
    pass


@dataclass
class RegistryBridgeInput:
    """Input to registry bridge."""
    input_id: str
    object_id: str
    object_type: str  # engine, artifact, adapter, bridge, workflow
    name: str
    version: str = "1.0.0"
    repo_path: Optional[str] = None
    capabilities: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.input_id:
            self.input_id = str(uuid.uuid4())


@dataclass
class RegistryBridgeResult:
    """Result of registry bridge operation."""
    success: bool
    entry_id: Optional[str] = None
    registered: bool = False
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IRegistryBridge(ABC):
    """Registry bridge interface."""
    
    @abstractmethod
    def bridge_to_registry(self, input: RegistryBridgeInput) -> RegistryBridgeResult:
        """Bridge durable object to registry."""
        pass
    
    @abstractmethod
    def auto_register(self, object_id: str, object_type: str, metadata: Dict[str, Any]) -> bool:
        """Auto-register object with minimal metadata."""
        pass
    
    @abstractmethod
    def check_existing(self, name: str, version: str) -> bool:
        """Check if entry already exists."""
        pass


class RegistryBridge(IRegistryBridge):
    """
    Registry Bridge Implementation.
    
    Second-priority bridge ensuring durable objects are indexed.
    """
    
    def __init__(self, registrum=None):
        self.registrum = registrum
        self._local_registry: Dict[str, Dict[str, Any]] = {}
    
    def bridge_to_registry(self, input: RegistryBridgeInput) -> RegistryBridgeResult:
        """Bridge durable object to registry."""
        try:
            # Check for existing
            if self.check_existing(input.name, input.version):
                return RegistryBridgeResult(
                    success=True,
                    registered=False,  # Already exists
                    error_message="Entry already exists",
                )
            
            # If we have registrum, use it
            if self.registrum:
                from ..sdk.types.registry import RegistryEntry, RegistryEntityType
                from ..sdk.contracts.registrum import RegisterRequest
                
                # Map object type to entity type
                type_mapping = {
                    'engine': RegistryEntityType.ENGINE,
                    'artifact': RegistryEntityType.ARTIFACT,
                    'adapter': RegistryEntityType.ADAPTER,
                    'bridge': RegistryEntityType.BRIDGE,
                    'workflow': RegistryEntityType.WORKFLOW,
                    'protocol': RegistryEntityType.PROTOCOL,
                }
                
                entity_type = type_mapping.get(input.object_type, RegistryEntityType.ARTIFACT)
                
                entry = RegistryEntry(
                    id=input.object_id,
                    entity_type=entity_type,
                    name=input.name,
                    version=input.version,
                    repo_path=input.repo_path or "",
                    capabilities=input.capabilities,
                    dependencies=input.dependencies,
                    metadata=input.metadata,
                )
                
                result = self.registrum.register(RegisterRequest(
                    request_id=input.input_id,
                    entry=entry,
                ))
                
                if result.success:
                    return RegistryBridgeResult(
                        success=True,
                        entry_id=result.entry_id,
                        registered=True,
                    )
                else:
                    return RegistryBridgeResult(
                        success=False,
                        error_message=result.error_message,
                    )
            
            # Fallback: local registry
            key = f"{input.name}@{input.version}"
            self._local_registry[key] = {
                'id': input.object_id,
                'type': input.object_type,
                'name': input.name,
                'version': input.version,
                'repo_path': input.repo_path,
                'capabilities': input.capabilities,
                'registered_at': datetime.utcnow().isoformat(),
            }
            
            return RegistryBridgeResult(
                success=True,
                entry_id=input.object_id,
                registered=True,
            )
            
        except Exception as e:
            return RegistryBridgeResult(
                success=False,
                error_message=str(e),
            )
    
    def auto_register(self, object_id: str, object_type: str, metadata: Dict[str, Any]) -> bool:
        """Auto-register object with minimal metadata."""
        input = RegistryBridgeInput(
            input_id=str(uuid.uuid4()),
            object_id=object_id,
            object_type=object_type,
            name=metadata.get('name', object_id),
            version=metadata.get('version', '1.0.0'),
            repo_path=metadata.get('repo_path'),
            metadata=metadata,
        )
        
        result = self.bridge_to_registry(input)
        return result.success and result.registered
    
    def check_existing(self, name: str, version: str) -> bool:
        """Check if entry already exists."""
        key = f"{name}@{version}"
        
        if key in self._local_registry:
            return True
        
        if self.registrum:
            from ..sdk.contracts.registrum import LookupRequest
            
            result = self.registrum.lookup(LookupRequest(
                request_id=str(uuid.uuid4()),
                lookup_type="by_name",
                query=name,
            ))
            
            if result.success:
                for entry in result.entries:
                    if entry.version == version:
                        return True
        
        return False


# Export all
__all__ = [
    'RegistryBridgeError',
    'RegistrationError',
    'RegistryBridgeInput',
    'RegistryBridgeResult',
    'IRegistryBridge',
    'RegistryBridge',
]

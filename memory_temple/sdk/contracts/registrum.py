"""
CIVOS-PRIME: REGISTRUM Contract
================================

The discoverability contract. Register and look up engines, artifacts,
workflows, adapters, and bridges.

Purpose:
- Entity registration
- Discovery lookups
- Dependency tracking
- Duplicate drift prevention

Must prove discoverability without duplicate drift.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Set
import uuid

from ..types.registry import (
    RegistryEntityType,
    RegistryStatus,
    RegistryEntry,
    EngineRegistration,
    ArtifactRegistration,
    AdapterRegistration,
    BridgeRegistration,
    WorkflowRegistration,
    RegistryIndex,
    RegistryManifest,
)


class RegistrumError(Exception):
    """Base error for REGISTRUM operations."""
    pass


class DuplicateEntryError(RegistrumError):
    """Raised when duplicate registration is attempted."""
    pass


class DependencyMissingError(RegistrumError):
    """Raised when dependencies are not satisfied."""
    pass


class EntryNotFoundError(RegistrumError):
    """Raised when entry is not found."""
    pass


@dataclass
class RegisterRequest:
    """Request to register an entity."""
    request_id: str
    entry: RegistryEntry
    check_dependencies: bool = True
    allow_update: bool = False
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class RegisterResult:
    """Result of registration."""
    request_id: str
    success: bool
    entry_id: Optional[str] = None
    error_message: Optional[str] = None
    missing_dependencies: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class LookupRequest:
    """Request to look up entities."""
    request_id: str
    lookup_type: str  # by_id, by_type, by_name, by_capability
    query: str
    include_metadata: bool = True
    limit: int = 100
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class LookupResult:
    """Result of lookup."""
    request_id: str
    success: bool
    entries: List[RegistryEntry] = field(default_factory=list)
    total_count: int = 0
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class UnregisterRequest:
    """Request to unregister an entity."""
    request_id: str
    entry_id: str
    force: bool = False  # Force even if dependencies exist
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class UnregisterResult:
    """Result of unregistration."""
    request_id: str
    success: bool
    error_message: Optional[str] = None
    dependents: List[str] = field(default_factory=list)
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IRegistrum(ABC):
    """
    REGISTRUM Contract Interface.
    
    All discovery operations must go through this interface to prevent
    duplicate drift and ensure discoverability.
    """
    
    @abstractmethod
    def register(self, request: RegisterRequest) -> RegisterResult:
        """
        Register an entity.
        
        Prevents duplicate drift by rejecting entries with existing
        qualified names.
        """
        pass
    
    @abstractmethod
    def lookup(self, request: LookupRequest) -> LookupResult:
        """
        Look up entities by various criteria.
        """
        pass
    
    @abstractmethod
    def unregister(self, request: UnregisterRequest) -> UnregisterResult:
        """
        Unregister an entity.
        
        By default, prevents unregistration if other entries depend on it.
        """
        pass
    
    @abstractmethod
    def register_engine(self, registration: EngineRegistration) -> RegisterResult:
        """Register a processing engine."""
        pass
    
    @abstractmethod
    def register_artifact(self, registration: ArtifactRegistration) -> RegisterResult:
        """Register a durable artifact."""
        pass
    
    @abstractmethod
    def register_adapter(self, registration: AdapterRegistration) -> RegisterResult:
        """Register an adapter."""
        pass
    
    @abstractmethod
    def register_bridge(self, registration: BridgeRegistration) -> RegisterResult:
        """Register a bridge."""
        pass
    
    @abstractmethod
    def get_manifest(self) -> RegistryManifest:
        """Get current registry manifest."""
        pass
    
    @abstractmethod
    def check_dependencies(self, entry: RegistryEntry) -> List[str]:
        """Check for missing dependencies."""
        pass


class Registrum(IRegistrum):
    """
    REGISTRUM Implementation.
    
    Provides discoverability with duplicate drift prevention.
    """
    
    def __init__(self, adapter=None):
        self.adapter = adapter
        self.index = RegistryIndex()
        self._dependents: Dict[str, Set[str]] = {}  # Maps entry_id to dependents
    
    def register(self, request: RegisterRequest) -> RegisterResult:
        """Register an entity."""
        try:
            entry = request.entry
            
            # Check dependencies if required
            if request.check_dependencies:
                missing = self.check_dependencies(entry)
                if missing:
                    return RegisterResult(
                        request_id=request.request_id,
                        success=False,
                        error_message="Missing dependencies",
                        missing_dependencies=missing,
                    )
            
            # Check for duplicates
            qualified_name = entry.get_qualified_name()
            existing = [e for e in self.index.lookup_by_name(entry.name) 
                       if e.version == entry.version]
            
            if existing:
                if request.allow_update:
                    # Update existing entry
                    old_entry = existing[0]
                    old_entry.status = RegistryStatus.DEPRECATED
                else:
                    return RegisterResult(
                        request_id=request.request_id,
                        success=False,
                        error_message=f"Duplicate entry: {qualified_name}",
                    )
            
            # Register
            if not self.index.register(entry):
                return RegisterResult(
                    request_id=request.request_id,
                    success=False,
                    error_message="Registration failed",
                )
            
            # Track dependents for reverse lookup
            for dep_id in entry.dependencies:
                if dep_id not in self._dependents:
                    self._dependents[dep_id] = set()
                self._dependents[dep_id].add(entry.id)
            
            # Persist if adapter available
            if self.adapter:
                self.adapter.persist_registry(self.get_manifest())
            
            return RegisterResult(
                request_id=request.request_id,
                success=True,
                entry_id=entry.id,
            )
            
        except Exception as e:
            return RegisterResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e),
            )
    
    def lookup(self, request: LookupRequest) -> LookupResult:
        """Look up entities."""
        try:
            entries = []
            
            if request.lookup_type == "by_id":
                entry = self.index.lookup(request.query)
                if entry:
                    entries = [entry]
            
            elif request.lookup_type == "by_type":
                entity_type = RegistryEntityType(request.query)
                entries = self.index.lookup_by_type(entity_type)
            
            elif request.lookup_type == "by_name":
                entries = self.index.lookup_by_name(request.query)
            
            elif request.lookup_type == "by_capability":
                entries = self.index.lookup_by_capability(request.query)
            
            else:
                return LookupResult(
                    request_id=request.request_id,
                    success=False,
                    error_message=f"Unknown lookup type: {request.lookup_type}",
                )
            
            # Apply limit
            total = len(entries)
            entries = entries[:request.limit]
            
            return LookupResult(
                request_id=request.request_id,
                success=True,
                entries=entries,
                total_count=total,
            )
            
        except Exception as e:
            return LookupResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e),
            )
    
    def unregister(self, request: UnregisterRequest) -> UnregisterResult:
        """Unregister an entity."""
        try:
            # Find entry
            entry = self.index.lookup(request.entry_id)
            if not entry:
                return UnregisterResult(
                    request_id=request.request_id,
                    success=False,
                    error_message=f"Entry not found: {request.entry_id}",
                )
            
            # Check dependents
            dependents = list(self._dependents.get(request.entry_id, set()))
            if dependents and not request.force:
                return UnregisterResult(
                    request_id=request.request_id,
                    success=False,
                    error_message="Entry has dependents",
                    dependents=dependents,
                )
            
            # Mark as archived instead of deleting
            entry.status = RegistryStatus.ARCHIVED
            entry.updated_at = datetime.utcnow()
            
            # Persist if adapter available
            if self.adapter:
                self.adapter.persist_registry(self.get_manifest())
            
            return UnregisterResult(
                request_id=request.request_id,
                success=True,
            )
            
        except Exception as e:
            return UnregisterResult(
                request_id=request.request_id,
                success=False,
                error_message=str(e),
            )
    
    def register_engine(self, registration: EngineRegistration) -> RegisterResult:
        """Register a processing engine."""
        registration.entry.entity_type = RegistryEntityType.ENGINE
        registration.entry.capabilities.extend([
            f"input:{t}" for t in registration.input_types
        ])
        registration.entry.capabilities.extend([
            f"output:{t}" for t in registration.output_types
        ])
        registration.entry.metadata['execution_mode'] = registration.execution_mode
        registration.entry.metadata['resource_requirements'] = registration.resource_requirements
        
        return self.register(RegisterRequest(
            request_id=str(uuid.uuid4()),
            entry=registration.entry,
        ))
    
    def register_artifact(self, registration: ArtifactRegistration) -> RegisterResult:
        """Register a durable artifact."""
        registration.entry.entity_type = RegistryEntityType.ARTIFACT
        registration.entry.capabilities.append(f"class:{registration.artifact_class}")
        registration.entry.metadata['content_type'] = registration.content_type
        registration.entry.metadata['schema_version'] = registration.schema_version
        registration.entry.metadata['lineage_id'] = registration.lineage_id
        
        return self.register(RegisterRequest(
            request_id=str(uuid.uuid4()),
            entry=registration.entry,
        ))
    
    def register_adapter(self, registration: AdapterRegistration) -> RegisterResult:
        """Register an adapter."""
        registration.entry.entity_type = RegistryEntityType.ADAPTER
        registration.entry.capabilities.extend(registration.supported_operations)
        registration.entry.metadata['adapter_type'] = registration.adapter_type
        registration.entry.metadata['priority'] = registration.priority
        
        return self.register(RegisterRequest(
            request_id=str(uuid.uuid4()),
            entry=registration.entry,
        ))
    
    def register_bridge(self, registration: BridgeRegistration) -> RegisterResult:
        """Register a bridge."""
        registration.entry.entity_type = RegistryEntityType.BRIDGE
        registration.entry.capabilities.extend([
            f"source:{registration.source_surface}",
            f"target:{registration.target_surface}",
        ])
        registration.entry.metadata['bridge_type'] = registration.bridge_type
        registration.entry.metadata['priority'] = registration.priority
        
        return self.register(RegisterRequest(
            request_id=str(uuid.uuid4()),
            entry=registration.entry,
        ))
    
    def get_manifest(self) -> RegistryManifest:
        """Get current registry manifest."""
        return RegistryManifest(
            entries=list(self.index.entries.values()),
        )
    
    def check_dependencies(self, entry: RegistryEntry) -> List[str]:
        """Check for missing dependencies."""
        return self.index.check_dependencies(entry)


# Export all
__all__ = [
    'RegistrumError',
    'DuplicateEntryError',
    'DependencyMissingError',
    'EntryNotFoundError',
    'RegisterRequest',
    'RegisterResult',
    'LookupRequest',
    'LookupResult',
    'UnregisterRequest',
    'UnregisterResult',
    'IRegistrum',
    'Registrum',
]

"""
CIVOS-PRIME: Registry Types
============================

Core data types for REGISTRUM - the discoverability layer.
Handles registration of engines, artifacts, workflows, adapters, and bridges.

Goal: Discoverability without duplicate drift.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Set
from enum import Enum
import uuid


class RegistryEntityType(Enum):
    """Types of entities that can be registered."""
    ENGINE = "engine"
    ARTIFACT = "artifact"
    WORKFLOW = "workflow"
    ADAPTER = "adapter"
    BRIDGE = "bridge"
    CONTRACT = "contract"
    PROTOCOL = "protocol"
    SHINOBI = "shinobi"  # Sandland AI agents


class RegistryStatus(Enum):
    """Status of registry entries."""
    ACTIVE = "active"
    DEPRECATED = "deprecated"
    PENDING = "pending"
    ARCHIVED = "archived"
    DRAFT = "draft"


@dataclass
class RegistryEntry:
    """Single entry in the registry."""
    id: str
    entity_type: RegistryEntityType
    name: str
    version: str
    repo_path: str
    status: RegistryStatus = RegistryStatus.ACTIVE
    created_at: datetime = field(default_factory=datetime.utcnow)
    updated_at: datetime = field(default_factory=datetime.utcnow)
    dependencies: List[str] = field(default_factory=list)
    capabilities: List[str] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.id:
            self.id = f"{self.entity_type.value}-{uuid.uuid4().hex[:8]}"
    
    def get_qualified_name(self) -> str:
        """Return fully qualified name."""
        return f"{self.entity_type.value}:{self.name}@{self.version}"


@dataclass
class EngineRegistration:
    """Registration for processing engines."""
    entry: RegistryEntry
    input_types: List[str]
    output_types: List[str]
    execution_mode: str = "sync"  # sync, async, stream
    resource_requirements: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        self.entry.entity_type = RegistryEntityType.ENGINE


@dataclass
class ArtifactRegistration:
    """Registration for durable artifacts."""
    entry: RegistryEntry
    artifact_class: str  # canon, branch, protocol, package
    content_type: str
    schema_version: str
    lineage_id: str
    
    def __post_init__(self):
        self.entry.entity_type = RegistryEntityType.ARTIFACT


@dataclass
class AdapterRegistration:
    """Registration for adapters."""
    entry: RegistryEntry
    adapter_type: str  # filesystem, repo, runtime, api, transport
    supported_operations: List[str]
    priority: int = 0
    
    def __post_init__(self):
        self.entry.entity_type = RegistryEntityType.ADAPTER


@dataclass
class BridgeRegistration:
    """Registration for bridges."""
    entry: RegistryEntry
    bridge_type: str  # memory, registry, publication, delegation
    source_surface: str
    target_surface: str
    priority: int = 0
    
    def __post_init__(self):
        self.entry.entity_type = RegistryEntityType.BRIDGE


@dataclass
class WorkflowRegistration:
    """Registration for workflows."""
    entry: RegistryEntry
    steps: List[str]
    trigger_types: List[str]
    required_adapters: List[str]
    required_bridges: List[str]
    
    def __post_init__(self):
        self.entry.entity_type = RegistryEntityType.WORKFLOW


@dataclass
class RegistryIndex:
    """
    Index for fast lookups across all registered entities.
    
    Prevents duplicate drift by maintaining unique constraints
    on qualified names.
    """
    entries: Dict[str, RegistryEntry] = field(default_factory=dict)
    by_type: Dict[RegistryEntityType, Set[str]] = field(default_factory=dict)
    by_name: Dict[str, Set[str]] = field(default_factory=dict)
    by_capability: Dict[str, Set[str]] = field(default_factory=dict)
    
    def __post_init__(self):
        for entity_type in RegistryEntityType:
            self.by_type[entity_type] = set()
    
    def register(self, entry: RegistryEntry) -> bool:
        """
        Register an entry. Returns False if duplicate detected.
        """
        qualified_name = entry.get_qualified_name()
        
        # Check for duplicates
        if qualified_name in self.entries:
            return False
        
        # Add to main index
        self.entries[entry.id] = entry
        
        # Add to type index
        self.by_type[entry.entity_type].add(entry.id)
        
        # Add to name index
        if entry.name not in self.by_name:
            self.by_name[entry.name] = set()
        self.by_name[entry.name].add(entry.id)
        
        # Add to capability index
        for cap in entry.capabilities:
            if cap not in self.by_capability:
                self.by_capability[cap] = set()
            self.by_capability[cap].add(entry.id)
        
        return True
    
    def lookup(self, id: str) -> Optional[RegistryEntry]:
        """Lookup by ID."""
        return self.entries.get(id)
    
    def lookup_by_type(self, entity_type: RegistryEntityType) -> List[RegistryEntry]:
        """Get all entries of a type."""
        return [self.entries[id] for id in self.by_type.get(entity_type, set())]
    
    def lookup_by_name(self, name: str) -> List[RegistryEntry]:
        """Get all entries with a name."""
        return [self.entries[id] for id in self.by_name.get(name, set())]
    
    def lookup_by_capability(self, capability: str) -> List[RegistryEntry]:
        """Get all entries with a capability."""
        return [self.entries[id] for id in self.by_capability.get(capability, set())]
    
    def check_dependencies(self, entry: RegistryEntry) -> List[str]:
        """Return list of missing dependencies."""
        missing = []
        for dep_id in entry.dependencies:
            if dep_id not in self.entries:
                missing.append(dep_id)
        return missing


@dataclass
class RegistryManifest:
    """
    Manifest for serializing registry state.
    """
    version: str = "1.0.0"
    generated_at: datetime = field(default_factory=datetime.utcnow)
    entries: List[RegistryEntry] = field(default_factory=list)
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary."""
        return {
            'version': self.version,
            'generated_at': self.generated_at.isoformat(),
            'entries': [
                {
                    'id': e.id,
                    'type': e.entity_type.value,
                    'name': e.name,
                    'version': e.version,
                    'repo_path': e.repo_path,
                    'status': e.status.value,
                    'dependencies': e.dependencies,
                    'capabilities': e.capabilities,
                    'metadata': e.metadata
                }
                for e in self.entries
            ]
        }


# Export all types
__all__ = [
    'RegistryEntityType',
    'RegistryStatus',
    'RegistryEntry',
    'EngineRegistration',
    'ArtifactRegistration',
    'AdapterRegistration',
    'BridgeRegistration',
    'WorkflowRegistration',
    'RegistryIndex',
    'RegistryManifest',
]

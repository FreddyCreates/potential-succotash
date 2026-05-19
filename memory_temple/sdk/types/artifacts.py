"""
CIVOS-PRIME: Artifact Types
============================

Core data types for ARTIFACTA - the durable output layer.
Handles emission of canon artifacts, branch artifacts, protocol objects, and package stubs.

Goal: Artifact identity stays tied to trunk-or-branch status.
"""

from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, Union
from enum import Enum
import uuid
import hashlib


class ArtifactClass(Enum):
    """Classification of artifacts."""
    CANON = "canon"          # Trunk-grade, immutable
    BRANCH = "branch"        # Working, mutable
    PROTOCOL = "protocol"    # Protocol definition
    PACKAGE = "package"      # Deployable package stub
    DOCTRINE = "doctrine"    # Foundational law
    TERMINAL = "terminal"    # Terminal output


class ArtifactFormat(Enum):
    """Supported artifact formats."""
    JSON = "json"
    YAML = "yaml"
    MARKDOWN = "markdown"
    PYTHON = "python"
    JAVASCRIPT = "javascript"
    MOTOKO = "motoko"
    BINARY = "binary"
    SCHEMA = "schema"


class EmissionStatus(Enum):
    """Status of artifact emission."""
    PENDING = "pending"
    EMITTING = "emitting"
    EMITTED = "emitted"
    VALIDATED = "validated"
    FAILED = "failed"


@dataclass
class ArtifactIdentity:
    """
    Unique identity for an artifact.
    
    Identity is tied to branch status to prevent trunk/branch confusion.
    """
    id: str
    artifact_class: ArtifactClass
    content_hash: str
    version: str
    branch_status: str  # From lineage.BranchStatus
    
    def __post_init__(self):
        if not self.id:
            self.id = f"{self.artifact_class.value}-{uuid.uuid4().hex[:12]}"
    
    def get_qualified_id(self) -> str:
        """Return fully qualified artifact ID."""
        return f"{self.branch_status}:{self.artifact_class.value}:{self.id}@{self.version}"
    
    @staticmethod
    def compute_content_hash(content: bytes) -> str:
        """Compute content-addressable hash."""
        return hashlib.sha256(content).hexdigest()


@dataclass
class ArtifactMetadata:
    """Metadata for artifacts."""
    created_at: datetime = field(default_factory=datetime.utcnow)
    created_by: str = "system"
    modified_at: Optional[datetime] = None
    modified_by: Optional[str] = None
    source_lineage: Optional[str] = None
    parent_artifacts: List[str] = field(default_factory=list)
    tags: List[str] = field(default_factory=list)
    custom: Dict[str, Any] = field(default_factory=dict)


@dataclass
class Artifact:
    """
    Core artifact type.
    
    Represents any durable output that needs to be tracked,
    versioned, and potentially promoted from branch to canon.
    """
    identity: ArtifactIdentity
    name: str
    format: ArtifactFormat
    repo_path: str
    metadata: ArtifactMetadata
    content: Optional[bytes] = None
    schema_ref: Optional[str] = None
    
    def is_canon(self) -> bool:
        """Check if this is a canon-grade artifact."""
        return self.identity.artifact_class == ArtifactClass.CANON
    
    def is_branch(self) -> bool:
        """Check if this is a branch artifact."""
        return self.identity.artifact_class == ArtifactClass.BRANCH
    
    def get_size(self) -> int:
        """Get content size in bytes."""
        return len(self.content) if self.content else 0


@dataclass
class ProtocolArtifact:
    """Specialized artifact for protocol definitions."""
    artifact: Artifact
    protocol_id: str
    protocol_version: str
    capabilities: List[str]
    dependencies: List[str]
    interface_schema: Dict[str, Any]
    
    def __post_init__(self):
        self.artifact.identity.artifact_class = ArtifactClass.PROTOCOL


@dataclass
class PackageArtifact:
    """Specialized artifact for deployable packages."""
    artifact: Artifact
    package_name: str
    package_version: str
    entry_point: str
    dependencies: Dict[str, str]  # name -> version
    build_config: Dict[str, Any]
    
    def __post_init__(self):
        self.artifact.identity.artifact_class = ArtifactClass.PACKAGE


@dataclass
class EmissionRequest:
    """Request to emit an artifact."""
    request_id: str
    artifact_class: ArtifactClass
    name: str
    format: ArtifactFormat
    content: bytes
    target_path: Optional[str] = None
    force_branch: bool = False  # Force emission as branch even if canon-ready
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class EmissionResult:
    """Result of artifact emission."""
    request_id: str
    status: EmissionStatus
    artifact_id: Optional[str] = None
    repo_path: Optional[str] = None
    content_hash: Optional[str] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)
    
    def is_success(self) -> bool:
        """Check if emission succeeded."""
        return self.status in (EmissionStatus.EMITTED, EmissionStatus.VALIDATED)


@dataclass
class ArtifactCollection:
    """Collection of related artifacts."""
    collection_id: str
    name: str
    artifacts: List[Artifact] = field(default_factory=list)
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def add(self, artifact: Artifact) -> None:
        """Add artifact to collection."""
        self.artifacts.append(artifact)
    
    def get_by_class(self, artifact_class: ArtifactClass) -> List[Artifact]:
        """Get artifacts by class."""
        return [a for a in self.artifacts if a.identity.artifact_class == artifact_class]
    
    def get_canon_artifacts(self) -> List[Artifact]:
        """Get all canon-grade artifacts."""
        return self.get_by_class(ArtifactClass.CANON)
    
    def get_branch_artifacts(self) -> List[Artifact]:
        """Get all branch artifacts."""
        return self.get_by_class(ArtifactClass.BRANCH)


@dataclass
class ArtifactManifest:
    """Manifest tracking all artifacts in a collection or workspace."""
    version: str = "1.0.0"
    generated_at: datetime = field(default_factory=datetime.utcnow)
    artifacts: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_artifact(self, artifact: Artifact) -> None:
        """Add artifact to manifest."""
        self.artifacts.append({
            'id': artifact.identity.id,
            'qualified_id': artifact.identity.get_qualified_id(),
            'name': artifact.name,
            'class': artifact.identity.artifact_class.value,
            'format': artifact.format.value,
            'repo_path': artifact.repo_path,
            'content_hash': artifact.identity.content_hash,
            'created_at': artifact.metadata.created_at.isoformat(),
        })
    
    def to_dict(self) -> Dict[str, Any]:
        """Serialize to dictionary."""
        return {
            'version': self.version,
            'generated_at': self.generated_at.isoformat(),
            'artifact_count': len(self.artifacts),
            'artifacts': self.artifacts,
        }


# Export all types
__all__ = [
    'ArtifactClass',
    'ArtifactFormat',
    'EmissionStatus',
    'ArtifactIdentity',
    'ArtifactMetadata',
    'Artifact',
    'ProtocolArtifact',
    'PackageArtifact',
    'EmissionRequest',
    'EmissionResult',
    'ArtifactCollection',
    'ArtifactManifest',
]

"""
CIVOS-PRIME: ARTIFACTA Contract
================================

The durable output contract. Emit canon artifacts, branch artifacts,
protocol objects, and package stubs.

Purpose:
- Artifact emission
- Identity preservation
- Status tracking
- Collection management

Must prove artifact identity stays tied to trunk-or-branch status.
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid

from ..types.artifacts import (
    ArtifactClass,
    ArtifactFormat,
    EmissionStatus,
    ArtifactIdentity,
    ArtifactMetadata,
    Artifact,
    ProtocolArtifact,
    PackageArtifact,
    EmissionRequest,
    EmissionResult,
    ArtifactCollection,
    ArtifactManifest,
)

from ..types.lineage import BranchStatus


class ArtifactaError(Exception):
    """Base error for ARTIFACTA operations."""
    pass


class StatusMismatchError(ArtifactaError):
    """Raised when artifact status doesn't match expected."""
    pass


class IdentityCollisionError(ArtifactaError):
    """Raised when artifact identity already exists."""
    pass


class EmissionError(ArtifactaError):
    """Raised when emission fails."""
    pass


@dataclass
class EmitBranchRequest:
    """Request to emit a branch artifact."""
    request_id: str
    name: str
    format: ArtifactFormat
    content: bytes
    target_path: Optional[str] = None
    lineage_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class EmitCanonRequest:
    """Request to emit a canon artifact."""
    request_id: str
    name: str
    format: ArtifactFormat
    content: bytes
    target_path: Optional[str] = None
    authority_token: str = ""  # Required for canon emission
    lineage_id: Optional[str] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class EmitProtocolRequest:
    """Request to emit a protocol artifact."""
    request_id: str
    name: str
    protocol_id: str
    protocol_version: str
    content: bytes
    capabilities: List[str] = field(default_factory=list)
    dependencies: List[str] = field(default_factory=list)
    interface_schema: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


@dataclass
class EmitPackageRequest:
    """Request to emit a package stub."""
    request_id: str
    package_name: str
    package_version: str
    entry_point: str
    content: bytes
    dependencies: Dict[str, str] = field(default_factory=dict)
    build_config: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.request_id:
            self.request_id = str(uuid.uuid4())


class IArtifacta(ABC):
    """
    ARTIFACTA Contract Interface.
    
    All artifact emission must go through this interface to ensure
    identity stays tied to trunk-or-branch status.
    """
    
    @abstractmethod
    def emit_branch(self, request: EmitBranchRequest) -> EmissionResult:
        """
        Emit a branch artifact.
        
        Branch artifacts are mutable and can be promoted to canon.
        """
        pass
    
    @abstractmethod
    def emit_canon(self, request: EmitCanonRequest) -> EmissionResult:
        """
        Emit a canon artifact.
        
        Requires authority token. Canon artifacts are immutable.
        """
        pass
    
    @abstractmethod
    def emit_protocol(self, request: EmitProtocolRequest) -> EmissionResult:
        """
        Emit a protocol artifact.
        
        Protocol artifacts define interface contracts.
        """
        pass
    
    @abstractmethod
    def emit_package(self, request: EmitPackageRequest) -> EmissionResult:
        """
        Emit a package stub.
        
        Package stubs are deployable units.
        """
        pass
    
    @abstractmethod
    def get_artifact(self, artifact_id: str) -> Optional[Artifact]:
        """Get an artifact by ID."""
        pass
    
    @abstractmethod
    def get_manifest(self) -> ArtifactManifest:
        """Get current artifact manifest."""
        pass
    
    @abstractmethod
    def validate_identity(self, identity: ArtifactIdentity) -> bool:
        """Validate artifact identity consistency."""
        pass


class Artifacta(IArtifacta):
    """
    ARTIFACTA Implementation.
    
    Provides artifact emission with identity/status consistency.
    """
    
    def __init__(self, adapter=None, memoria=None, registrum=None):
        self.adapter = adapter
        self.memoria = memoria  # For lineage tracking
        self.registrum = registrum  # For auto-registration
        self._artifacts: Dict[str, Artifact] = {}
        self._branch_root = "memory_temple/workstations/artifacts"
        self._canon_root = "memory_temple/doctrine/artifacts"
        self._protocol_root = "memory_temple/registry/protocols"
        self._package_root = "memory_temple/artifacts/packages"
    
    def emit_branch(self, request: EmitBranchRequest) -> EmissionResult:
        """Emit a branch artifact."""
        try:
            # Create identity
            content_hash = ArtifactIdentity.compute_content_hash(request.content)
            identity = ArtifactIdentity(
                id=str(uuid.uuid4()),
                artifact_class=ArtifactClass.BRANCH,
                content_hash=content_hash,
                version="0.1.0",  # Branch starts at 0.1.0
                branch_status=BranchStatus.BRANCH.value,
            )
            
            # Determine path
            if request.target_path:
                repo_path = f"{self._branch_root}/{request.target_path}"
            else:
                repo_path = f"{self._branch_root}/{request.name}"
            
            # Create artifact
            artifact = Artifact(
                identity=identity,
                name=request.name,
                format=request.format,
                repo_path=repo_path,
                metadata=ArtifactMetadata(
                    source_lineage=request.lineage_id,
                    custom=request.metadata,
                ),
                content=request.content,
            )
            
            # Store
            self._artifacts[identity.id] = artifact
            
            # Write to adapter if available
            if self.adapter:
                self.adapter.write(repo_path, request.content)
            
            # Auto-register if registrum available
            if self.registrum:
                from ..types.registry import RegistryEntry, ArtifactRegistration
                reg = ArtifactRegistration(
                    entry=RegistryEntry(
                        id=identity.id,
                        entity_type=None,  # Will be set by register_artifact
                        name=request.name,
                        version=identity.version,
                        repo_path=repo_path,
                    ),
                    artifact_class=ArtifactClass.BRANCH.value,
                    content_type=request.format.value,
                    schema_version="1.0.0",
                    lineage_id=request.lineage_id or "",
                )
                self.registrum.register_artifact(reg)
            
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.EMITTED,
                artifact_id=identity.id,
                repo_path=repo_path,
                content_hash=content_hash,
            )
            
        except Exception as e:
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.FAILED,
                error_message=str(e),
            )
    
    def emit_canon(self, request: EmitCanonRequest) -> EmissionResult:
        """Emit a canon artifact."""
        try:
            # Verify authority
            if not request.authority_token:
                return EmissionResult(
                    request_id=request.request_id,
                    status=EmissionStatus.FAILED,
                    error_message="Authority token required for canon emission",
                )
            
            # Create identity
            content_hash = ArtifactIdentity.compute_content_hash(request.content)
            identity = ArtifactIdentity(
                id=str(uuid.uuid4()),
                artifact_class=ArtifactClass.CANON,
                content_hash=content_hash,
                version="1.0.0",  # Canon starts at 1.0.0
                branch_status=BranchStatus.TRUNK.value,
            )
            
            # Determine path
            if request.target_path:
                repo_path = f"{self._canon_root}/{request.target_path}"
            else:
                repo_path = f"{self._canon_root}/{request.name}"
            
            # Create artifact
            artifact = Artifact(
                identity=identity,
                name=request.name,
                format=request.format,
                repo_path=repo_path,
                metadata=ArtifactMetadata(
                    source_lineage=request.lineage_id,
                    custom=request.metadata,
                ),
                content=request.content,
            )
            
            # Store
            self._artifacts[identity.id] = artifact
            
            # Write to adapter if available
            if self.adapter:
                self.adapter.write(repo_path, request.content)
            
            # Auto-register if registrum available
            if self.registrum:
                from ..types.registry import RegistryEntry, ArtifactRegistration
                reg = ArtifactRegistration(
                    entry=RegistryEntry(
                        id=identity.id,
                        entity_type=None,
                        name=request.name,
                        version=identity.version,
                        repo_path=repo_path,
                    ),
                    artifact_class=ArtifactClass.CANON.value,
                    content_type=request.format.value,
                    schema_version="1.0.0",
                    lineage_id=request.lineage_id or "",
                )
                self.registrum.register_artifact(reg)
            
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.EMITTED,
                artifact_id=identity.id,
                repo_path=repo_path,
                content_hash=content_hash,
            )
            
        except Exception as e:
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.FAILED,
                error_message=str(e),
            )
    
    def emit_protocol(self, request: EmitProtocolRequest) -> EmissionResult:
        """Emit a protocol artifact."""
        try:
            # Create identity
            content_hash = ArtifactIdentity.compute_content_hash(request.content)
            identity = ArtifactIdentity(
                id=request.protocol_id,
                artifact_class=ArtifactClass.PROTOCOL,
                content_hash=content_hash,
                version=request.protocol_version,
                branch_status=BranchStatus.TRUNK.value,  # Protocols are canon
            )
            
            repo_path = f"{self._protocol_root}/{request.name}"
            
            # Create artifact
            artifact = Artifact(
                identity=identity,
                name=request.name,
                format=ArtifactFormat.PYTHON,
                repo_path=repo_path,
                metadata=ArtifactMetadata(
                    custom={
                        'capabilities': request.capabilities,
                        'dependencies': request.dependencies,
                        'interface_schema': request.interface_schema,
                    },
                ),
                content=request.content,
            )
            
            # Store
            self._artifacts[identity.id] = artifact
            
            # Write to adapter if available
            if self.adapter:
                self.adapter.write(repo_path, request.content)
            
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.EMITTED,
                artifact_id=identity.id,
                repo_path=repo_path,
                content_hash=content_hash,
            )
            
        except Exception as e:
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.FAILED,
                error_message=str(e),
            )
    
    def emit_package(self, request: EmitPackageRequest) -> EmissionResult:
        """Emit a package stub."""
        try:
            # Create identity
            content_hash = ArtifactIdentity.compute_content_hash(request.content)
            identity = ArtifactIdentity(
                id=str(uuid.uuid4()),
                artifact_class=ArtifactClass.PACKAGE,
                content_hash=content_hash,
                version=request.package_version,
                branch_status=BranchStatus.BRANCH.value,  # Packages start as branch
            )
            
            repo_path = f"{self._package_root}/{request.package_name}"
            
            # Create artifact
            artifact = Artifact(
                identity=identity,
                name=request.package_name,
                format=ArtifactFormat.JSON,
                repo_path=repo_path,
                metadata=ArtifactMetadata(
                    custom={
                        'entry_point': request.entry_point,
                        'dependencies': request.dependencies,
                        'build_config': request.build_config,
                    },
                ),
                content=request.content,
            )
            
            # Store
            self._artifacts[identity.id] = artifact
            
            # Write to adapter if available
            if self.adapter:
                self.adapter.write(repo_path, request.content)
            
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.EMITTED,
                artifact_id=identity.id,
                repo_path=repo_path,
                content_hash=content_hash,
            )
            
        except Exception as e:
            return EmissionResult(
                request_id=request.request_id,
                status=EmissionStatus.FAILED,
                error_message=str(e),
            )
    
    def get_artifact(self, artifact_id: str) -> Optional[Artifact]:
        """Get an artifact by ID."""
        return self._artifacts.get(artifact_id)
    
    def get_manifest(self) -> ArtifactManifest:
        """Get current artifact manifest."""
        manifest = ArtifactManifest()
        for artifact in self._artifacts.values():
            manifest.add_artifact(artifact)
        return manifest
    
    def validate_identity(self, identity: ArtifactIdentity) -> bool:
        """Validate artifact identity consistency."""
        # Check class/status consistency
        if identity.artifact_class == ArtifactClass.CANON:
            return identity.branch_status == BranchStatus.TRUNK.value
        elif identity.artifact_class == ArtifactClass.BRANCH:
            return identity.branch_status == BranchStatus.BRANCH.value
        elif identity.artifact_class == ArtifactClass.PROTOCOL:
            return identity.branch_status == BranchStatus.TRUNK.value
        return True


# Export all
__all__ = [
    'ArtifactaError',
    'StatusMismatchError',
    'IdentityCollisionError',
    'EmissionError',
    'EmitBranchRequest',
    'EmitCanonRequest',
    'EmitProtocolRequest',
    'EmitPackageRequest',
    'IArtifacta',
    'Artifacta',
]

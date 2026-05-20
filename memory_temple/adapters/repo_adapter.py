"""
CIVOS-PRIME: Repo Adapter
==========================

Second-priority adapter for repo-level operations.
Provides stable repo placement and retrieval paths.

Ownership boundaries:
- Repo-relative placement
- Manifest updates
- Retrieval conventions
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
from pathlib import Path
import os
import json


class RepoError(Exception):
    """Base error for repo operations."""
    pass


class ManifestError(RepoError):
    """Raised when manifest operations fail."""
    pass


class PlacementError(RepoError):
    """Raised when placement conventions are violated."""
    pass


@dataclass
class RepoConfig:
    """Configuration for repo adapter."""
    repo_root: str = "."
    manifest_path: str = "memory_temple/registry/manifest.json"
    artifacts_manifest_path: str = "memory_temple/artifacts/manifest.json"
    auto_update_manifest: bool = True


@dataclass
class PlacementResult:
    """Result of a placement operation."""
    success: bool
    repo_path: str
    absolute_path: str
    manifest_updated: bool = False
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class RetrievalResult:
    """Result of a retrieval operation."""
    success: bool
    repo_path: str
    content: Optional[bytes] = None
    metadata: Dict[str, Any] = field(default_factory=dict)
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IRepoAdapter(ABC):
    """Repo adapter interface."""
    
    @abstractmethod
    def place(self, content: bytes, repo_path: str, metadata: Dict[str, Any] = None) -> PlacementResult:
        """Place content at repo-relative path."""
        pass
    
    @abstractmethod
    def retrieve(self, repo_path: str) -> RetrievalResult:
        """Retrieve content from repo-relative path."""
        pass
    
    @abstractmethod
    def update_manifest(self, entry: Dict[str, Any]) -> bool:
        """Update registry manifest with entry."""
        pass
    
    @abstractmethod
    def get_manifest(self) -> Dict[str, Any]:
        """Get current manifest."""
        pass
    
    @abstractmethod
    def get_repo_path(self, category: str, name: str) -> str:
        """Get conventional repo path for category and name."""
        pass
    
    @abstractmethod
    def validate_placement(self, repo_path: str) -> bool:
        """Validate placement follows conventions."""
        pass


class RepoAdapter(IRepoAdapter):
    """
    Repo Adapter Implementation.
    
    Second-priority adapter for repo-level operations.
    """
    
    def __init__(self, config: Optional[RepoConfig] = None, filesystem_adapter=None):
        self.config = config or RepoConfig()
        self.fs = filesystem_adapter
        self._ensure_manifests()
    
    def _ensure_manifests(self):
        """Ensure manifest files exist."""
        manifests = [
            self.config.manifest_path,
            self.config.artifacts_manifest_path,
        ]
        
        for manifest_path in manifests:
            full_path = os.path.join(self.config.repo_root, manifest_path)
            
            if not os.path.exists(full_path):
                os.makedirs(os.path.dirname(full_path), exist_ok=True)
                
                initial_manifest = {
                    "version": "1.0.0",
                    "generated_at": datetime.utcnow().isoformat(),
                    "entries": []
                }
                
                with open(full_path, 'w') as f:
                    json.dump(initial_manifest, f, indent=2)
    
    def place(self, content: bytes, repo_path: str, metadata: Dict[str, Any] = None) -> PlacementResult:
        """Place content at repo-relative path."""
        try:
            # Validate placement
            if not self.validate_placement(repo_path):
                return PlacementResult(
                    success=False,
                    repo_path=repo_path,
                    absolute_path="",
                    error_message="Path violates placement conventions",
                )
            
            # Resolve absolute path
            absolute_path = os.path.join(self.config.repo_root, repo_path)
            
            # Ensure directory exists
            os.makedirs(os.path.dirname(absolute_path), exist_ok=True)
            
            # Write content
            with open(absolute_path, 'wb') as f:
                f.write(content)
            
            # Update manifest if configured
            manifest_updated = False
            if self.config.auto_update_manifest and metadata:
                manifest_updated = self.update_manifest({
                    "path": repo_path,
                    "placed_at": datetime.utcnow().isoformat(),
                    **metadata
                })
            
            return PlacementResult(
                success=True,
                repo_path=repo_path,
                absolute_path=absolute_path,
                manifest_updated=manifest_updated,
            )
            
        except Exception as e:
            return PlacementResult(
                success=False,
                repo_path=repo_path,
                absolute_path="",
                error_message=str(e),
            )
    
    def retrieve(self, repo_path: str) -> RetrievalResult:
        """Retrieve content from repo-relative path."""
        try:
            absolute_path = os.path.join(self.config.repo_root, repo_path)
            
            if not os.path.exists(absolute_path):
                return RetrievalResult(
                    success=False,
                    repo_path=repo_path,
                    error_message="File not found",
                )
            
            with open(absolute_path, 'rb') as f:
                content = f.read()
            
            # Try to get metadata from manifest
            metadata = self._get_entry_metadata(repo_path)
            
            return RetrievalResult(
                success=True,
                repo_path=repo_path,
                content=content,
                metadata=metadata,
            )
            
        except Exception as e:
            return RetrievalResult(
                success=False,
                repo_path=repo_path,
                error_message=str(e),
            )
    
    def _get_entry_metadata(self, repo_path: str) -> Dict[str, Any]:
        """Get metadata for entry from manifest."""
        manifest = self.get_manifest()
        
        for entry in manifest.get("entries", []):
            if entry.get("path") == repo_path:
                return entry
        
        return {}
    
    def update_manifest(self, entry: Dict[str, Any]) -> bool:
        """Update registry manifest with entry."""
        try:
            manifest_path = os.path.join(self.config.repo_root, self.config.manifest_path)
            
            # Read current manifest
            with open(manifest_path, 'r') as f:
                manifest = json.load(f)
            
            # Add or update entry
            existing_idx = None
            for i, e in enumerate(manifest.get("entries", [])):
                if e.get("path") == entry.get("path"):
                    existing_idx = i
                    break
            
            if existing_idx is not None:
                manifest["entries"][existing_idx] = entry
            else:
                manifest["entries"].append(entry)
            
            # Update timestamp
            manifest["updated_at"] = datetime.utcnow().isoformat()
            
            # Write back
            with open(manifest_path, 'w') as f:
                json.dump(manifest, f, indent=2)
            
            return True
            
        except Exception:
            return False
    
    def get_manifest(self) -> Dict[str, Any]:
        """Get current manifest."""
        try:
            manifest_path = os.path.join(self.config.repo_root, self.config.manifest_path)
            
            with open(manifest_path, 'r') as f:
                return json.load(f)
                
        except Exception:
            return {"version": "1.0.0", "entries": []}
    
    def get_repo_path(self, category: str, name: str) -> str:
        """Get conventional repo path for category and name."""
        conventions = {
            "doctrine": f"memory_temple/doctrine/{name}",
            "branch": f"memory_temple/workstations/{name}",
            "artifact": f"memory_temple/artifacts/{name}",
            "protocol": f"memory_temple/registry/protocols/{name}",
            "engine": f"memory_temple/registry/engines/{name}",
            "adapter": f"memory_temple/adapters/{name}",
            "bridge": f"memory_temple/bridges/{name}",
        }
        
        return conventions.get(category, f"memory_temple/{category}/{name}")
    
    def validate_placement(self, repo_path: str) -> bool:
        """Validate placement follows conventions."""
        # Must be under memory_temple
        if not repo_path.startswith("memory_temple/"):
            return False
        
        # No path traversal
        if ".." in repo_path:
            return False
        
        return True
    
    def persist_registry(self, manifest_data: Any) -> bool:
        """Persist registry manifest data."""
        try:
            manifest_path = os.path.join(self.config.repo_root, self.config.manifest_path)
            
            if hasattr(manifest_data, 'to_dict'):
                data = manifest_data.to_dict()
            else:
                data = manifest_data
            
            with open(manifest_path, 'w') as f:
                json.dump(data, f, indent=2)
            
            return True
            
        except Exception:
            return False


# Export all
__all__ = [
    'RepoError',
    'ManifestError',
    'PlacementError',
    'RepoConfig',
    'PlacementResult',
    'RetrievalResult',
    'IRepoAdapter',
    'RepoAdapter',
]

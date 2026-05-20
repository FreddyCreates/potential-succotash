"""
CIVOS-PRIME: Filesystem Adapter
================================

First-priority adapter for MEMORIA and ARTIFACTA.
Provides lawful local substrate for storage operations.

Ownership boundaries:
- Path resolution
- Writes and reads
- Object storage discipline
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any, BinaryIO
from pathlib import Path
import os
import json
import hashlib


class FilesystemError(Exception):
    """Base error for filesystem operations."""
    pass


class PathResolutionError(FilesystemError):
    """Raised when path cannot be resolved."""
    pass


class StorageViolationError(FilesystemError):
    """Raised when storage discipline is violated."""
    pass


@dataclass
class StorageConfig:
    """Configuration for filesystem storage."""
    root_path: str = "memory_temple"
    trunk_subpath: str = "doctrine"
    branch_subpath: str = "workstations"
    artifacts_subpath: str = "artifacts"
    registry_subpath: str = "registry"
    max_file_size_mb: int = 100
    enforce_structure: bool = True


@dataclass
class WriteResult:
    """Result of a write operation."""
    success: bool
    path: str
    size_bytes: int = 0
    content_hash: Optional[str] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class ReadResult:
    """Result of a read operation."""
    success: bool
    path: str
    content: Optional[bytes] = None
    size_bytes: int = 0
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


class IFilesystemAdapter(ABC):
    """Filesystem adapter interface."""
    
    @abstractmethod
    def write(self, path: str, content: bytes) -> WriteResult:
        """Write content to path."""
        pass
    
    @abstractmethod
    def read(self, path: str) -> Optional[bytes]:
        """Read content from path."""
        pass
    
    @abstractmethod
    def delete(self, path: str) -> bool:
        """Delete file at path."""
        pass
    
    @abstractmethod
    def exists(self, path: str) -> bool:
        """Check if path exists."""
        pass
    
    @abstractmethod
    def list_dir(self, path: str) -> List[str]:
        """List directory contents."""
        pass
    
    @abstractmethod
    def resolve_path(self, relative_path: str) -> str:
        """Resolve relative path to absolute."""
        pass
    
    @abstractmethod
    def validate_storage_discipline(self, path: str, is_trunk: bool) -> bool:
        """Validate path conforms to storage discipline."""
        pass


class FilesystemAdapter(IFilesystemAdapter):
    """
    Filesystem Adapter Implementation.
    
    First-priority adapter for lawful local substrate.
    """
    
    def __init__(self, config: Optional[StorageConfig] = None):
        self.config = config or StorageConfig()
        self._ensure_structure()
    
    def _ensure_structure(self):
        """Ensure filesystem structure exists."""
        base = Path(self.config.root_path)
        
        dirs = [
            base / self.config.trunk_subpath,
            base / self.config.branch_subpath,
            base / self.config.artifacts_subpath,
            base / self.config.registry_subpath,
            base / self.config.trunk_subpath / "artifacts",
            base / self.config.branch_subpath / "artifacts",
            base / self.config.artifacts_subpath / "packages",
            base / self.config.registry_subpath / "protocols",
        ]
        
        for d in dirs:
            d.mkdir(parents=True, exist_ok=True)
    
    def write(self, path: str, content: bytes) -> WriteResult:
        """Write content to path."""
        try:
            # Validate size
            size_mb = len(content) / (1024 * 1024)
            if size_mb > self.config.max_file_size_mb:
                return WriteResult(
                    success=False,
                    path=path,
                    error_message=f"File exceeds max size ({size_mb:.2f}MB > {self.config.max_file_size_mb}MB)",
                )
            
            # Resolve and validate path
            full_path = self.resolve_path(path)
            
            # Ensure parent directory exists
            Path(full_path).parent.mkdir(parents=True, exist_ok=True)
            
            # Write content
            with open(full_path, 'wb') as f:
                f.write(content)
            
            # Compute hash
            content_hash = hashlib.sha256(content).hexdigest()
            
            return WriteResult(
                success=True,
                path=full_path,
                size_bytes=len(content),
                content_hash=content_hash,
            )
            
        except Exception as e:
            return WriteResult(
                success=False,
                path=path,
                error_message=str(e),
            )
    
    def read(self, path: str) -> Optional[bytes]:
        """Read content from path."""
        try:
            full_path = self.resolve_path(path)
            
            if not os.path.exists(full_path):
                return None
            
            with open(full_path, 'rb') as f:
                return f.read()
                
        except Exception:
            return None
    
    def read_with_result(self, path: str) -> ReadResult:
        """Read content with full result."""
        try:
            full_path = self.resolve_path(path)
            
            if not os.path.exists(full_path):
                return ReadResult(
                    success=False,
                    path=full_path,
                    error_message="File not found",
                )
            
            with open(full_path, 'rb') as f:
                content = f.read()
            
            return ReadResult(
                success=True,
                path=full_path,
                content=content,
                size_bytes=len(content),
            )
            
        except Exception as e:
            return ReadResult(
                success=False,
                path=path,
                error_message=str(e),
            )
    
    def delete(self, path: str) -> bool:
        """Delete file at path."""
        try:
            full_path = self.resolve_path(path)
            
            if os.path.exists(full_path):
                os.remove(full_path)
                return True
            
            return False
            
        except Exception:
            return False
    
    def exists(self, path: str) -> bool:
        """Check if path exists."""
        full_path = self.resolve_path(path)
        return os.path.exists(full_path)
    
    def list_dir(self, path: str) -> List[str]:
        """List directory contents."""
        try:
            full_path = self.resolve_path(path)
            
            if not os.path.isdir(full_path):
                return []
            
            return os.listdir(full_path)
            
        except Exception:
            return []
    
    def resolve_path(self, relative_path: str) -> str:
        """Resolve relative path to absolute."""
        # If already absolute or starts with root
        if relative_path.startswith(self.config.root_path):
            return relative_path
        
        if os.path.isabs(relative_path):
            return relative_path
        
        return os.path.join(self.config.root_path, relative_path)
    
    def validate_storage_discipline(self, path: str, is_trunk: bool) -> bool:
        """Validate path conforms to storage discipline."""
        if not self.config.enforce_structure:
            return True
        
        full_path = self.resolve_path(path)
        
        if is_trunk:
            # Must be under trunk path
            trunk_path = os.path.join(self.config.root_path, self.config.trunk_subpath)
            return full_path.startswith(trunk_path)
        else:
            # Must be under branch path
            branch_path = os.path.join(self.config.root_path, self.config.branch_subpath)
            return full_path.startswith(branch_path)
    
    def get_trunk_path(self, relative: str = "") -> str:
        """Get path in trunk directory."""
        return os.path.join(
            self.config.root_path,
            self.config.trunk_subpath,
            relative
        )
    
    def get_branch_path(self, relative: str = "") -> str:
        """Get path in branch directory."""
        return os.path.join(
            self.config.root_path,
            self.config.branch_subpath,
            relative
        )
    
    def copy(self, source: str, dest: str) -> bool:
        """Copy file from source to dest."""
        try:
            content = self.read(source)
            if content is None:
                return False
            
            result = self.write(dest, content)
            return result.success
            
        except Exception:
            return False
    
    def move(self, source: str, dest: str) -> bool:
        """Move file from source to dest."""
        if self.copy(source, dest):
            return self.delete(source)
        return False


# Export all
__all__ = [
    'FilesystemError',
    'PathResolutionError',
    'StorageViolationError',
    'StorageConfig',
    'WriteResult',
    'ReadResult',
    'IFilesystemAdapter',
    'FilesystemAdapter',
]

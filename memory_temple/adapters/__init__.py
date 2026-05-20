"""
CIVOS-PRIME Adapters
=====================

Adapter exports for the memory_temple SDK.

Priority order:
1. Filesystem Adapter - local storage substrate
2. Repo Adapter - repo placement and retrieval
3. Runtime Adapter - execution profile mapping
"""

from .filesystem_adapter import (
    FilesystemError,
    PathResolutionError,
    StorageViolationError,
    StorageConfig,
    WriteResult,
    ReadResult,
    IFilesystemAdapter,
    FilesystemAdapter,
)

from .repo_adapter import (
    RepoError,
    ManifestError,
    PlacementError,
    RepoConfig,
    PlacementResult,
    RetrievalResult,
    IRepoAdapter,
    RepoAdapter,
)

from .runtime_adapter import (
    RuntimeAdapterError,
    ProfileMappingError,
    TargetTranslationError,
    RuntimeTarget,
    ProfileMapping,
    ExecutionContext,
    IRuntimeAdapter,
    RuntimeAdapter,
)


__all__ = [
    # Filesystem Adapter
    'FilesystemError',
    'PathResolutionError',
    'StorageViolationError',
    'StorageConfig',
    'WriteResult',
    'ReadResult',
    'IFilesystemAdapter',
    'FilesystemAdapter',
    
    # Repo Adapter
    'RepoError',
    'ManifestError',
    'PlacementError',
    'RepoConfig',
    'PlacementResult',
    'RetrievalResult',
    'IRepoAdapter',
    'RepoAdapter',
    
    # Runtime Adapter
    'RuntimeAdapterError',
    'ProfileMappingError',
    'TargetTranslationError',
    'RuntimeTarget',
    'ProfileMapping',
    'ExecutionContext',
    'IRuntimeAdapter',
    'RuntimeAdapter',
]

"""
CIVOS-PRIME SDK Contracts
==========================

Core contracts for the memory_temple SDK:
- MEMORIA: Lawful memory operations
- REGISTRUM: Discoverability layer
- ARTIFACTA: Durable output emission
- NOVA: Runtime governance
"""

from .memoria import (
    MemoriaError,
    CanonBypassError,
    LineageRequiredError,
    TrunkBranchViolationError,
    ReadCanonRequest,
    ReadCanonResult,
    WriteBranchRequest,
    WriteBranchResult,
    PromoteToCanonRequest,
    PromoteToCanonResult,
    IMemoria,
    Memoria,
)

from .registrum import (
    RegistrumError,
    DuplicateEntryError,
    DependencyMissingError,
    EntryNotFoundError,
    RegisterRequest,
    RegisterResult,
    LookupRequest,
    LookupResult,
    UnregisterRequest,
    UnregisterResult,
    IRegistrum,
    Registrum,
)

from .artifacta import (
    ArtifactaError,
    StatusMismatchError,
    IdentityCollisionError,
    EmissionError,
    EmitBranchRequest,
    EmitCanonRequest,
    EmitProtocolRequest,
    EmitPackageRequest,
    IArtifacta,
    Artifacta,
)

from .nova import (
    NovaError,
    DelegationDeniedError,
    AuthorityViolationError,
    ProfileNotFoundError,
    ClassifyRequest,
    ClassifyResult,
    DecideModeRequest,
    DecideModeResult,
    DecideDelegationRequest,
    DecideDelegationResult,
    INova,
    Nova,
)


__all__ = [
    # MEMORIA
    'MemoriaError',
    'CanonBypassError',
    'LineageRequiredError',
    'TrunkBranchViolationError',
    'ReadCanonRequest',
    'ReadCanonResult',
    'WriteBranchRequest',
    'WriteBranchResult',
    'PromoteToCanonRequest',
    'PromoteToCanonResult',
    'IMemoria',
    'Memoria',
    
    # REGISTRUM
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
    
    # ARTIFACTA
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
    
    # NOVA
    'NovaError',
    'DelegationDeniedError',
    'AuthorityViolationError',
    'ProfileNotFoundError',
    'ClassifyRequest',
    'ClassifyResult',
    'DecideModeRequest',
    'DecideModeResult',
    'DecideDelegationRequest',
    'DecideDelegationResult',
    'INova',
    'Nova',
]

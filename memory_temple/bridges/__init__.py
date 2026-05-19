"""
CIVOS-PRIME Bridges
====================

Bridge exports for the memory_temple SDK.

Priority order:
1. Memory Bridge - all results return through Memory Runtime law
2. Registry Bridge - durable objects auto-register
3. Publication Bridge - converged objects get publish-ready expression
4. Delegation Bridge - heavy work gets bounded execution
"""

from .memory_bridge import (
    MemoryBridgeError,
    CanonViolationError,
    BridgeInput,
    MemoryBridgeResult,
    IMemoryBridge,
    MemoryBridge,
)

from .registry_bridge import (
    RegistryBridgeError,
    RegistrationError,
    RegistryBridgeInput,
    RegistryBridgeResult,
    IRegistryBridge,
    RegistryBridge,
)

from .publication_bridge import (
    PublicationBridgeError,
    PublicationError,
    PublicationInput,
    PublicationResult,
    PublicationManifest,
    IPublicationBridge,
    PublicationBridge,
)

from .delegation_bridge import (
    DelegationBridgeError,
    DelegationViolationError,
    BoundedExecutionError,
    DelegationInput,
    DelegationOutput,
    DelegationBridgeResult,
    IDelegationBridge,
    DelegationBridge,
)


__all__ = [
    # Memory Bridge
    'MemoryBridgeError',
    'CanonViolationError',
    'BridgeInput',
    'MemoryBridgeResult',
    'IMemoryBridge',
    'MemoryBridge',
    
    # Registry Bridge
    'RegistryBridgeError',
    'RegistrationError',
    'RegistryBridgeInput',
    'RegistryBridgeResult',
    'IRegistryBridge',
    'RegistryBridge',
    
    # Publication Bridge
    'PublicationBridgeError',
    'PublicationError',
    'PublicationInput',
    'PublicationResult',
    'PublicationManifest',
    'IPublicationBridge',
    'PublicationBridge',
    
    # Delegation Bridge
    'DelegationBridgeError',
    'DelegationViolationError',
    'BoundedExecutionError',
    'DelegationInput',
    'DelegationOutput',
    'DelegationBridgeResult',
    'IDelegationBridge',
    'DelegationBridge',
]

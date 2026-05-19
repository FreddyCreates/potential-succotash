"""
CIVOS-PRIME: Memory Temple
===========================

The first repo-backed implementation slice of CIVOS-PRIME.
Preserves lawful memory, discoverability, durable output, and runtime governance.

Core Contracts:
- MEMORIA: Lawful memory operations
- REGISTRUM: Discoverability layer  
- ARTIFACTA: Durable output emission
- NOVA: Runtime governance

φ-Constants:
- PHI = 1.618033988749895
- HEARTBEAT_MS = 873ms
- THRESHOLD = 0.618
"""

__version__ = "1.0.0"

# φ-Constants
PHI = 1.618033988749895
HEARTBEAT_MS = 873
THRESHOLD = 0.618

# Lazy imports for main components
def get_memoria():
    """Get MEMORIA contract."""
    from .sdk.contracts import Memoria
    return Memoria

def get_registrum():
    """Get REGISTRUM contract."""
    from .sdk.contracts import Registrum
    return Registrum

def get_artifacta():
    """Get ARTIFACTA contract."""
    from .sdk.contracts import Artifacta
    return Artifacta

def get_nova():
    """Get NOVA contract."""
    from .sdk.contracts import Nova
    return Nova


__all__ = [
    '__version__',
    'PHI',
    'HEARTBEAT_MS',
    'THRESHOLD',
    'get_memoria',
    'get_registrum',
    'get_artifacta',
    'get_nova',
]

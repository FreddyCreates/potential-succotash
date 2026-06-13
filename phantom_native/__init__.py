# phantom_native — Sovereign Native Stack (Phantom-MESIE Integration)
"""Zero-dependency native driver layer built on MESIE spectral objects,
helix encoding, resonance, NeuroCores, and TAURUS.

Architecture:
    Python (reference/verification) ↔ ctypes bridge ↔ Zig (SIMD kernels)
    Cross-compiles to: x86_64, ARM Cortex-M7, AArch64, ESP32-S3
"""

from .sovereign_tensor import SovereignTensor
from .neurocore import SovereignNeuroCore
from .swarm_runtime import SovereignSwarmRuntime
from .bridge import NativeBridge

__all__ = [
    "SovereignTensor",
    "SovereignNeuroCore",
    "SovereignSwarmRuntime",
    "NativeBridge",
]


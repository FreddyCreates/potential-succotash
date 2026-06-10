# phantom_native — Sovereign Native Stack (Phantom-MESIE Integration)
"""Zero-dependency native driver layer built on MESIE spectral objects,
helix encoding, resonance, NeuroCores, and TAURUS."""

from .sovereign_tensor import SovereignTensor
from .neurocore import SovereignNeuroCore
from .swarm_runtime import SovereignSwarmRuntime

__all__ = ["SovereignTensor", "SovereignNeuroCore", "SovereignSwarmRuntime"]

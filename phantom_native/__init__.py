"""
Phantom Native — Sovereign Native Stack (MESIE Integration)

Pure native tensor/neurocore engine integrated with MESIE spectral primitives.
Zero heavy dependencies in the core path.

Components:
- SovereignTensor: Native tensor engine with MESIE spectral metadata
- SovereignNeuroCore: Resonance attention + helix + TAURUS driver
- SovereignSwarmRuntime: Sealed intent execution with Shadow Wire masking
"""

from .sovereign_tensor import SovereignTensor
from .neurocore import SovereignNeuroCore
from .swarm_runtime import SovereignSwarmRuntime

__all__ = ["SovereignTensor", "SovereignNeuroCore", "SovereignSwarmRuntime"]

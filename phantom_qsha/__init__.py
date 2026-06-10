"""
Phantom QSHA — Quantum-Sovereign Hash Attestation

Provides cryptographic primitives for the Sovereign Native Stack:
- ShadowWireEnvelope: topology masking for swarm networks
- ExecutionReceipt: verifiable computation proofs
- SovereignVault: sealed intent storage and retrieval
"""

from .shadow_wire import ShadowWireEnvelope
from .receipts import ExecutionReceipt
from .vault import SovereignVault

__all__ = ["ShadowWireEnvelope", "ExecutionReceipt", "SovereignVault"]

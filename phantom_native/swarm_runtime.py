# phantom_native/swarm_runtime.py
"""
SovereignSwarmRuntime — Native runtime for MESIE neuronet swarms.

Features:
- Spawn NeuroCores from spectral configurations
- Execute sealed intents through the swarm
- Shadow Wire topology masking
- QSHA-committed execution receipts
"""

import hashlib
from typing import Dict, List

from .neurocore import SovereignNeuroCore
from .sovereign_tensor import SovereignTensor

import sys
import os

# Add parent to path for phantom_qsha imports
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from phantom_qsha.shadow_wire import ShadowWireEnvelope
from phantom_qsha.receipts import ExecutionReceipt
from phantom_qsha.vault import SovereignVault


class SovereignSwarmRuntime:
    """Native runtime for MESIE neuronet swarms."""

    def __init__(self):
        self.vault = SovereignVault()
        self.wire = ShadowWireEnvelope()
        self.cores: Dict[str, SovereignNeuroCore] = {}
        self.manifest_commitment = ""  # QSHA root

    def spawn_neuronet(self, spectral_config: Dict) -> str:
        """Spawn a new NeuroCore from spectral configuration."""
        core = SovereignNeuroCore(spectral_config)
        core_id = self._qsha(str(spectral_config))
        self.cores[core_id] = core
        return core_id

    def execute_sealed_intent(self, sealed_intent: bytes) -> ExecutionReceipt:
        """Execute a sealed intent through all swarm cores."""
        intent = self.vault.open_sealed_intent(sealed_intent)

        results: List[SovereignTensor] = []
        for core in self.cores.values():
            tensor = SovereignTensor.from_mesie_component(
                intent.get("spectrum", {})
            )
            out = core.forward(tensor)
            results.append(out)

        # Public proof only — no private state leaks
        commitment = self._compute_commitment(results)
        shadow = self.wire.mask_topology(list(self.cores.keys()))

        receipt = ExecutionReceipt(
            commitment=commitment,
            shadow_wire=shadow,
            public_meta={"swarm_size": len(self.cores)},
        )
        return receipt

    def execute_raw(self, spectrum: Dict) -> List[SovereignTensor]:
        """Execute a raw spectral component through all cores (no sealing)."""
        results: List[SovereignTensor] = []
        for core in self.cores.values():
            tensor = SovereignTensor.from_mesie_component(spectrum)
            out = core.forward(tensor)
            results.append(out)
        return results

    def get_manifest(self) -> Dict:
        """Return current swarm manifest."""
        return {
            "cores": len(self.cores),
            "core_ids": list(self.cores.keys()),
            "manifest_commitment": self.manifest_commitment,
            "wire_mask_count": self.wire.mask_count,
            "vault_intents_opened": self.vault.intent_count,
        }

    def _qsha(self, data: str) -> str:
        """QSHA hash for core identification."""
        return "qsha:" + hashlib.sha256(data.encode()).hexdigest()[:32]

    def _compute_commitment(self, results: List[SovereignTensor]) -> str:
        """Aggregate QSHA commitment over results."""
        combined = "|".join(
            hashlib.sha256(r.to_bytes()).hexdigest()[:16] for r in results
        )
        return "commit:" + hashlib.sha256(combined.encode()).hexdigest()[:32]

    def __repr__(self) -> str:
        return f"SovereignSwarmRuntime(cores={len(self.cores)})"

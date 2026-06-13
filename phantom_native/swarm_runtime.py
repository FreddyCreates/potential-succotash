# phantom_native/swarm_runtime.py
<<<<<<< HEAD
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

# Ensure sibling packages are importable
_parent = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
if _parent not in sys.path:
    sys.path.insert(0, _parent)

from phantom_qsha.shadow_wire import ShadowWireEnvelope  # noqa: E402
from phantom_qsha.receipts import ExecutionReceipt  # noqa: E402
from phantom_qsha.vault import SovereignVault  # noqa: E402


class SovereignSwarmRuntime:
    """Native runtime for MESIE neuronet swarms."""
=======
"""Sovereign Swarm Runtime — native runtime for MESIE neuronet swarms.

Integrates SovereignNeuroCore with phantom_qsha (Shadow Wire, Vault, Receipts)
for sealed-intent execution with public-proof attestation.
"""
from typing import Dict, List, Any
import json

from .neurocore import SovereignNeuroCore
from .sovereign_tensor import SovereignTensor
from phantom_qsha.shadow_wire import ShadowWireEnvelope
from phantom_qsha.receipts import ExecutionReceipt
from phantom_qsha.vault import SovereignVault
from phantom_qsha.qsha import qsha_hash, qsha_from_string, qsha_aggregate


class SovereignSwarmRuntime:
    """Native runtime for MESIE neuronet swarms.

    Manages a swarm of SovereignNeuroCores, executes sealed intents
    from the Sovereign Vault, and produces verifiable ExecutionReceipts
    with Shadow Wire topology masking.
    """
>>>>>>> origin/main

    def __init__(self):
        self.vault = SovereignVault()
        self.wire = ShadowWireEnvelope()
        self.cores: Dict[str, SovereignNeuroCore] = {}
<<<<<<< HEAD
        self.manifest_commitment = ""  # QSHA root

    def spawn_neuronet(self, spectral_config: Dict) -> str:
        """Spawn a new NeuroCore from spectral configuration."""
        core = SovereignNeuroCore(spectral_config)
        core_id = self._qsha(str(spectral_config))
        self.cores[core_id] = core
        return core_id

    def execute_sealed_intent(self, sealed_intent: bytes) -> ExecutionReceipt:
        """Execute a sealed intent through all swarm cores."""
=======
        self.manifest_commitment = ""  # QSHA root of the swarm manifest

    def spawn_neuronet(self, spectral_config: Dict[str, Any]) -> str:
        """Spawn a new NeuroCore and return its QSHA-derived ID."""
        core = SovereignNeuroCore(spectral_config)
        core_id = qsha_from_string(json.dumps(spectral_config, sort_keys=True))
        self.cores[core_id] = core
        self._update_manifest()
        return core_id

    def remove_neuronet(self, core_id: str) -> bool:
        """Remove a NeuroCore from the swarm."""
        if core_id in self.cores:
            del self.cores[core_id]
            self._update_manifest()
            return True
        return False

    def execute_sealed_intent(self, sealed_intent: bytes) -> ExecutionReceipt:
        """Execute a sealed intent across all swarm cores.

        1. Opens sealed intent from vault
        2. Converts spectral data to SovereignTensor
        3. Runs forward pass on each core
        4. Computes aggregate commitment
        5. Masks topology via Shadow Wire
        6. Returns public ExecutionReceipt
        """
>>>>>>> origin/main
        intent = self.vault.open_sealed_intent(sealed_intent)

        results: List[SovereignTensor] = []
        for core in self.cores.values():
            tensor = SovereignTensor.from_mesie_component(
                intent.get("spectrum", {})
            )
            out = core.forward(tensor)
            results.append(out)

<<<<<<< HEAD
        # Public proof only — no private state leaks
=======
        # Public proof only — internals remain hidden
>>>>>>> origin/main
        commitment = self._compute_commitment(results)
        shadow = self.wire.mask_topology(list(self.cores.keys()))

        receipt = ExecutionReceipt(
            commitment=commitment,
            shadow_wire=shadow,
            public_meta={"swarm_size": len(self.cores)},
        )
        return receipt

<<<<<<< HEAD
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
=======
    def seal_and_execute(self, intent: Dict[str, Any]) -> ExecutionReceipt:
        """Convenience: seal an intent and immediately execute it."""
        sealed = self.vault.seal_intent(intent)
        return self.execute_sealed_intent(sealed)

    def _compute_commitment(self, results: List[SovereignTensor]) -> str:
        """Aggregate QSHA commitment from computation results."""
        individual = [qsha_hash(r.to_bytes()) for r in results]
        return qsha_aggregate(individual)

    def _update_manifest(self) -> None:
        """Recompute swarm manifest commitment."""
        self.manifest_commitment = qsha_aggregate(sorted(self.cores.keys()))

    def get_swarm_status(self) -> Dict[str, Any]:
        """Public status of the swarm (no internal topology)."""
        return {
            "core_count": len(self.cores),
            "manifest_commitment": self.manifest_commitment,
            "wire_id": self.wire.wire_id,
        }
>>>>>>> origin/main

    def __repr__(self) -> str:
        return f"SovereignSwarmRuntime(cores={len(self.cores)})"

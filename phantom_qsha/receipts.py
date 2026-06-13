<<<<<<< HEAD
"""
ExecutionReceipt — Verifiable computation proof for sovereign execution.

Each swarm execution produces a receipt containing:
- commitment: QSHA hash of computation output
- shadow_wire: masked topology envelope
- public_meta: observable metadata (no private state leaks)
"""

import hashlib
import time
from typing import Dict, Any, Optional


class ExecutionReceipt:
    """Immutable proof of sovereign execution."""
=======
# phantom_qsha/receipts.py
"""Execution Receipts — public-proof attestation of sovereign compute."""
from typing import Dict, Any, Optional
import time
import json

from .qsha import qsha_hash


class ExecutionReceipt:
    """Immutable receipt proving execution without revealing internals."""
>>>>>>> origin/main

    def __init__(
        self,
        commitment: str,
        shadow_wire: Dict[str, Any],
        public_meta: Optional[Dict[str, Any]] = None,
    ):
        self.commitment = commitment
        self.shadow_wire = shadow_wire
        self.public_meta = public_meta or {}
        self.timestamp = time.time()
        self.receipt_id = self._compute_receipt_id()

    def _compute_receipt_id(self) -> str:
<<<<<<< HEAD
        """Deterministic receipt identifier from commitment + timestamp."""
        payload = f"{self.commitment}:{self.timestamp}"
        return hashlib.sha256(payload.encode()).hexdigest()[:16]

    def verify(self) -> bool:
        """Basic integrity check — commitment and wire are non-empty."""
        return bool(self.commitment) and bool(self.shadow_wire.get("envelope"))
=======
        payload = json.dumps(
            {"commitment": self.commitment, "ts": self.timestamp}, sort_keys=True
        ).encode()
        return qsha_hash(payload)
>>>>>>> origin/main

    def to_dict(self) -> Dict[str, Any]:
        return {
            "receipt_id": self.receipt_id,
            "commitment": self.commitment,
            "shadow_wire": self.shadow_wire,
            "public_meta": self.public_meta,
            "timestamp": self.timestamp,
        }

<<<<<<< HEAD
    def __repr__(self) -> str:
        return f"<ExecutionReceipt id={self.receipt_id} commitment={self.commitment[:16]}...>"
=======
    def verify(self) -> bool:
        """Basic structural verification."""
        return bool(self.commitment and self.shadow_wire and self.receipt_id)
>>>>>>> origin/main

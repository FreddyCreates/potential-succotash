# phantom_qsha/receipts.py
"""Execution Receipts — public-proof attestation of sovereign compute."""
from typing import Dict, Any, Optional
import time
import json

from .qsha import qsha_hash


class ExecutionReceipt:
    """Immutable receipt proving execution without revealing internals."""

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
        payload = json.dumps(
            {"commitment": self.commitment, "ts": self.timestamp}, sort_keys=True
        ).encode()
        return qsha_hash(payload)

    def to_dict(self) -> Dict[str, Any]:
        return {
            "receipt_id": self.receipt_id,
            "commitment": self.commitment,
            "shadow_wire": self.shadow_wire,
            "public_meta": self.public_meta,
            "timestamp": self.timestamp,
        }

    def verify(self) -> bool:
        """Basic structural verification."""
        return bool(self.commitment and self.shadow_wire and self.receipt_id)

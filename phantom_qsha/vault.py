# phantom_qsha/vault.py
"""Sovereign Vault — sealed intent storage and retrieval."""
from typing import Dict, Any, Optional
import json
import hashlib

from .qsha import qsha_hash


class SovereignVault:
    """Encrypted intent storage for sovereign swarm operations."""

    def __init__(self):
        self.sealed_intents: Dict[str, bytes] = {}

    def seal_intent(self, intent: Dict[str, Any]) -> bytes:
        """Seal an intent for later execution (deterministic encoding)."""
        payload = json.dumps(intent, sort_keys=True).encode("utf-8")
        intent_id = qsha_hash(payload)
        self.sealed_intents[intent_id] = payload
        return payload

    def open_sealed_intent(self, sealed: bytes) -> Dict[str, Any]:
        """Open a sealed intent — returns the original intent dict."""
        return json.loads(sealed.decode("utf-8"))

    def get_commitment(self, sealed: bytes) -> str:
        """Get QSHA commitment for a sealed intent."""
        return qsha_hash(sealed)

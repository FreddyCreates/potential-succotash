# phantom_qsha/qsha.py
"""Quantum-Secure Hash Attestation — deterministic commitment from binary payloads."""
import hashlib
import struct


def qsha_hash(data: bytes) -> str:
    """Compute QSHA commitment hash (SHA-256 + resonance prefix)."""
    digest = hashlib.sha256(data).hexdigest()
    return f"qsha:{digest}"


def qsha_from_string(text: str) -> str:
    """QSHA from UTF-8 string."""
    return qsha_hash(text.encode("utf-8"))


def qsha_aggregate(commitments: list) -> str:
    """Aggregate multiple QSHA commitments into a root."""
    combined = "|".join(sorted(commitments))
    return qsha_hash(combined.encode("utf-8"))

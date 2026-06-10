# phantom_native/sovereign_tensor.py
"""
SovereignTensor — Pure native tensor engine integrated with MESIE spectral primitives.

Features:
- Direct ingestion from MESIE SpectralComponent (frequency + amplitude)
- Resonance-weighted matmul optimized for spectral data
- Native int8 quantization for edge deployment
- Deterministic binary serialization for QSHA + Vault
"""

from typing import List, Tuple, Dict, Optional, Any
import struct
import math


class SovereignTensor:
    """Pure native tensor engine integrated with MESIE spectral primitives."""

    def __init__(
        self,
        data: List[float],
        shape: Tuple[int, ...],
        spectral_meta: Optional[Dict[str, Any]] = None,
    ):
        self.shape = shape
        self.data = data[:]  # flattened
        self.spectral_meta = spectral_meta or {}
        assert len(data) == self._compute_size(shape), "Shape / data mismatch"

        # MESIE-native metadata
        self.resonance_score = self.spectral_meta.get("resonance", 1.0)
        self.helix_params = self.spectral_meta.get("helix", {})
        self.lineage = self.spectral_meta.get("lineage", [])

    @staticmethod
    def _compute_size(shape: Tuple[int, ...]) -> int:
        p = 1
        for d in shape:
            p *= d
        return p

    def to_bytes(self) -> bytes:
        """Deterministic binary for QSHA + Vault."""
        return struct.pack(f"{len(self.data)}f", *self.data)

    @classmethod
    def from_bytes(cls, raw: bytes, shape: Tuple[int, ...]) -> "SovereignTensor":
        """Reconstruct tensor from binary."""
        count = cls._compute_size(shape)
        data = list(struct.unpack(f"{count}f", raw))
        return cls(data, shape)

    @classmethod
    def from_mesie_component(cls, component: Dict) -> "SovereignTensor":
        """Direct ingestion from MESIE SpectralComponent (frequency + amplitude)."""
        freq = component.get("frequency", [])
        amp = component.get("amplitude", [])
        data = amp[:] if amp else [0.0]  # use amplitude as primary signal
        shape = (len(data),)
        meta = {
            "resonance": component.get("element_weight", 1.0),
            "helix": {"turns": 8, "dimensions": len(data)},
            "lineage": component.get("node_id"),
        }
        return cls(data, shape, meta)

    @classmethod
    def zeros(cls, shape: Tuple[int, ...]) -> "SovereignTensor":
        """Create a zero-filled tensor."""
        size = cls._compute_size(shape)
        return cls([0.0] * size, shape)

    @classmethod
    def ones(cls, shape: Tuple[int, ...]) -> "SovereignTensor":
        """Create a ones-filled tensor."""
        size = cls._compute_size(shape)
        return cls([1.0] * size, shape)

    # ── Core Operations ───────────────────────────────────────────────────────

    def add(self, other: "SovereignTensor") -> "SovereignTensor":
        """Element-wise addition."""
        assert self.shape == other.shape, "Shape mismatch for add"
        result = [a + b for a, b in zip(self.data, other.data)]
        return SovereignTensor(result, self.shape, self.spectral_meta)

    def sub(self, other: "SovereignTensor") -> "SovereignTensor":
        """Element-wise subtraction."""
        assert self.shape == other.shape, "Shape mismatch for sub"
        result = [a - b for a, b in zip(self.data, other.data)]
        return SovereignTensor(result, self.shape, self.spectral_meta)

    def scale(self, factor: float) -> "SovereignTensor":
        """Scalar multiplication."""
        result = [x * factor for x in self.data]
        return SovereignTensor(result, self.shape, self.spectral_meta)

    def dot(self, other: "SovereignTensor") -> float:
        """Dot product (flattened)."""
        assert self.shape == other.shape, "Shape mismatch for dot"
        return sum(a * b for a, b in zip(self.data, other.data))

    def matmul(self, other: "SovereignTensor") -> "SovereignTensor":
        """Resonance-weighted matmul optimized for spectral data."""
        assert len(self.shape) == 2 and len(other.shape) == 2
        assert self.shape[1] == other.shape[0], "Inner dimensions must match"
        m, k = self.shape
        _, n = other.shape
        result = [0.0] * (m * n)

        resonance = self.resonance_score * other.resonance_score

        for i in range(m):
            for j in range(n):
                acc = 0.0
                for p in range(k):
                    acc += self.data[i * k + p] * other.data[p * n + j]
                result[i * n + j] = acc * resonance  # resonance weighting
        return SovereignTensor(result, (m, n), self.spectral_meta)

    def relu(self) -> "SovereignTensor":
        """ReLU activation."""
        result = [max(0.0, x) for x in self.data]
        return SovereignTensor(result, self.shape, self.spectral_meta)

    def norm(self) -> float:
        """L2 norm."""
        return math.sqrt(sum(x * x for x in self.data))

    def normalize(self) -> "SovereignTensor":
        """L2 normalization."""
        n = self.norm()
        if n == 0:
            return SovereignTensor(self.data[:], self.shape, self.spectral_meta)
        return self.scale(1.0 / n)

    # ── Quantization ──────────────────────────────────────────────────────────

    def quantize_int8(self) -> "SovereignTensor":
        """Native quantization for edge deployment."""
        scale = max(abs(x) for x in self.data) or 1.0
        qdata = [int((x / scale) * 127) for x in self.data]
        meta = self.spectral_meta.copy()
        meta["quant_scale"] = scale
        meta["quantized"] = True
        return SovereignTensor(
            [float(x) for x in qdata], self.shape, meta
        )

    def dequantize(self) -> "SovereignTensor":
        """Restore from int8 quantized representation."""
        scale = self.spectral_meta.get("quant_scale", 1.0)
        data = [(x / 127.0) * scale for x in self.data]
        meta = self.spectral_meta.copy()
        meta.pop("quant_scale", None)
        meta.pop("quantized", None)
        return SovereignTensor(data, self.shape, meta)

    # ── Representation ────────────────────────────────────────────────────────

    def __repr__(self) -> str:
        preview = self.data[:4]
        suffix = "..." if len(self.data) > 4 else ""
        return f"SovereignTensor(shape={self.shape}, data=[{', '.join(f'{x:.4f}' for x in preview)}{suffix}])"

    def __len__(self) -> int:
        return len(self.data)

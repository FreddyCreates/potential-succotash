# phantom_native/sovereign_tensor.py
"""Pure native tensor engine integrated with MESIE spectral primitives."""
from typing import List, Tuple, Dict, Optional, Any
import struct
import math


class SovereignTensor:
    """Pure native tensor engine integrated with MESIE spectral primitives.

    Zero external dependencies — uses only stdlib math/struct.
    Integrates directly with MESIE SpectralComponent format.
    """

    def __init__(
        self,
        data: List[float],
        shape: Tuple[int, ...],
        spectral_meta: Optional[Dict[str, Any]] = None,
    ):
        self.shape = shape
        self.data = data[:]  # flattened copy
        self.spectral_meta = spectral_meta or {}
        assert len(data) == self._compute_size(shape), "Shape / data mismatch"

        # MESIE-native metadata
        self.resonance_score = self.spectral_meta.get("resonance", 1.0)
        self.helix_params = self.spectral_meta.get("helix", {})
        self.lineage = self.spectral_meta.get("lineage", [])

    @staticmethod
    def _compute_size(shape: Tuple[int, ...]) -> int:
        """Compute total element count from shape tuple."""
        p = 1
        for d in shape:
            p *= d
        return p

    def to_bytes(self) -> bytes:
        """Deterministic binary serialization for QSHA + Vault."""
        return struct.pack(f"{len(self.data)}f", *self.data)

    @classmethod
    def from_bytes(cls, raw: bytes, shape: Tuple[int, ...]) -> "SovereignTensor":
        """Reconstruct tensor from deterministic binary."""
        count = cls._compute_size(shape)
        data = list(struct.unpack(f"{count}f", raw))
        return cls(data, shape)

    @classmethod
    def from_mesie_component(cls, component: Dict) -> "SovereignTensor":
        """Direct ingestion from MESIE SpectralComponent (frequency + amplitude)."""
        freq = component.get("frequency", [])
        amp = component.get("amplitude", [])
        data = amp[:] if amp else freq[:]
        if not data:
            data = [0.0]
        shape = (len(data),)
        meta = {
            "resonance": component.get("element_weight", 1.0),
            "helix": {"turns": 8, "dimensions": len(data)},
            "lineage": component.get("node_id", []),
        }
        return cls(data, shape, meta)

    @classmethod
    def zeros(cls, shape: Tuple[int, ...]) -> "SovereignTensor":
        """Create a zero tensor of given shape."""
        size = cls._compute_size(shape)
        return cls([0.0] * size, shape)

    @classmethod
    def ones(cls, shape: Tuple[int, ...]) -> "SovereignTensor":
        """Create a ones tensor of given shape."""
        size = cls._compute_size(shape)
        return cls([1.0] * size, shape)

    # --- Core operations (fully unrolled, no external deps) ---

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

    def matmul(self, other: "SovereignTensor") -> "SovereignTensor":
        """Resonance-weighted matrix multiplication optimized for spectral data."""
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

    def dot(self, other: "SovereignTensor") -> float:
        """Inner product of two 1D tensors."""
        assert self.shape == other.shape and len(self.shape) == 1
        return sum(a * b for a, b in zip(self.data, other.data))

    def norm(self) -> float:
        """L2 norm."""
        return math.sqrt(sum(x * x for x in self.data))

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
        """Reverse int8 quantization."""
        scale = self.spectral_meta.get("quant_scale", 1.0)
        data = [(x / 127.0) * scale for x in self.data]
        meta = self.spectral_meta.copy()
        meta.pop("quant_scale", None)
        meta.pop("quantized", None)
        return SovereignTensor(data, self.shape, meta)

    def reshape(self, new_shape: Tuple[int, ...]) -> "SovereignTensor":
        """Reshape tensor (total size must match)."""
        assert self._compute_size(new_shape) == len(self.data), "Reshape size mismatch"
        return SovereignTensor(self.data[:], new_shape, self.spectral_meta)

    def __repr__(self) -> str:
        return f"SovereignTensor(shape={self.shape}, resonance={self.resonance_score:.4f})"

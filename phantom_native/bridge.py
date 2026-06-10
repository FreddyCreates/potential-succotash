# phantom_native/bridge.py
"""Python ↔ Zig Native Bridge via ctypes.

Direct memory binding — passes raw pointers from Python buffers
into Zig's C ABI exports. Zero NumPy dependency.

Usage:
    from phantom_native.bridge import NativeBridge

    bridge = NativeBridge()  # Auto-loads libphantom_native.a/.so
    result = bridge.resonance_dot(a_data, b_data, resonance=1.618)
"""
import ctypes
import os
import sys
from ctypes import (
    POINTER,
    c_float,
    c_int8,
    c_uint8,
    c_size_t,
    c_uint,
    Structure,
)
from pathlib import Path
from typing import List, Optional, Tuple

from .sovereign_tensor import SovereignTensor


# Platform-specific shared library extension
if sys.platform == "win32":
    LIB_EXT = ".dll"
elif sys.platform == "darwin":
    LIB_EXT = ".dylib"
else:
    LIB_EXT = ".so"

# Default library search paths
LIB_SEARCH_PATHS = [
    Path(__file__).parent / "zig" / "zig-out" / "lib",
    Path(__file__).parent / "zig" / "zig-out" / "bin",
    Path("/usr/local/lib"),
]


class NativeBridge:
    """ctypes bridge to Zig native kernels.

    Loads libphantom_native and exposes Python-friendly wrappers
    that operate directly on SovereignTensor data buffers.
    """

    def __init__(self, lib_path: Optional[str] = None):
        self._lib = self._load_library(lib_path)
        self._setup_signatures()

    def _load_library(self, explicit_path: Optional[str]) -> Optional[ctypes.CDLL]:
        """Attempt to load the native library."""
        if explicit_path:
            return ctypes.CDLL(explicit_path)

        for search_dir in LIB_SEARCH_PATHS:
            for name in [f"libphantom_native{LIB_EXT}", f"phantom_native{LIB_EXT}"]:
                path = search_dir / name
                if path.exists():
                    return ctypes.CDLL(str(path))

        # Library not found — bridge operates in fallback mode
        return None

    def _setup_signatures(self) -> None:
        """Define C ABI function signatures for type safety."""
        if self._lib is None:
            return

        # resonance_dot(a: *f32, b: *f32, len: usize, resonance: f32) -> f32
        self._lib.resonance_dot.argtypes = [
            POINTER(c_float), POINTER(c_float), c_size_t, c_float
        ]
        self._lib.resonance_dot.restype = c_float

        # resonance_dot_i8(a: *i8, b: *i8, len: usize, sa: f32, sb: f32, res: f32) -> f32
        self._lib.resonance_dot_i8.argtypes = [
            POINTER(c_int8), POINTER(c_int8), c_size_t, c_float, c_float, c_float
        ]
        self._lib.resonance_dot_i8.restype = c_float

        # native_softmax(data: *f32, len: usize)
        self._lib.native_softmax.argtypes = [POINTER(c_float), c_size_t]
        self._lib.native_softmax.restype = None

        # quantize_int8(input: *f32, output: *i8, len: usize) -> f32
        self._lib.quantize_int8.argtypes = [
            POINTER(c_float), POINTER(c_int8), c_size_t
        ]
        self._lib.quantize_int8.restype = c_float

        # dequantize_int8(input: *i8, output: *f32, len: usize, scale: f32)
        self._lib.dequantize_int8.argtypes = [
            POINTER(c_int8), POINTER(c_float), c_size_t, c_float
        ]
        self._lib.dequantize_int8.restype = None

        # matmul_resonance(a: *f32, b: *f32, c: *f32, m, k, n: usize, res: f32)
        self._lib.matmul_resonance.argtypes = [
            POINTER(c_float), POINTER(c_float), POINTER(c_float),
            c_size_t, c_size_t, c_size_t, c_float
        ]
        self._lib.matmul_resonance.restype = None

        # ct_compare(a: *u8, b: *u8, len: usize) -> u8
        self._lib.ct_compare.argtypes = [
            POINTER(c_uint8), POINTER(c_uint8), c_size_t
        ]
        self._lib.ct_compare.restype = c_uint8

        # helix_encode(output: *f32, dim: usize, position: f32)
        self._lib.helix_encode.argtypes = [POINTER(c_float), c_size_t, c_float]
        self._lib.helix_encode.restype = None

    @property
    def available(self) -> bool:
        """Whether the native library is loaded."""
        return self._lib is not None

    # =========================================================================
    # High-Level API (operates on SovereignTensor)
    # =========================================================================

    def resonance_dot(
        self, a: SovereignTensor, b: SovereignTensor, resonance: float = 1.0
    ) -> float:
        """SIMD resonance dot product via native kernel."""
        if not self.available:
            return a.dot(b) * resonance  # Python fallback

        assert a.shape == b.shape and len(a.shape) == 1
        n = len(a.data)
        a_buf = (c_float * n)(*a.data)
        b_buf = (c_float * n)(*b.data)
        return self._lib.resonance_dot(a_buf, b_buf, n, c_float(resonance))

    def matmul(
        self, a: SovereignTensor, b: SovereignTensor, resonance: float = 1.0
    ) -> SovereignTensor:
        """SIMD matrix multiply via native kernel."""
        if not self.available:
            return a.matmul(b)  # Python fallback

        assert len(a.shape) == 2 and len(b.shape) == 2
        m, k = a.shape
        _, n = b.shape

        a_buf = (c_float * len(a.data))(*a.data)
        b_buf = (c_float * len(b.data))(*b.data)
        c_buf = (c_float * (m * n))()

        self._lib.matmul_resonance(a_buf, b_buf, c_buf, m, k, n, c_float(resonance))

        result_data = list(c_buf)
        return SovereignTensor(result_data, (m, n), a.spectral_meta)

    def quantize(self, tensor: SovereignTensor) -> Tuple[List[int], float]:
        """Native int8 quantization."""
        if not self.available:
            q = tensor.quantize_int8()
            return [int(x) for x in q.data], q.spectral_meta.get("quant_scale", 1.0)

        n = len(tensor.data)
        input_buf = (c_float * n)(*tensor.data)
        output_buf = (c_int8 * n)()
        scale = self._lib.quantize_int8(input_buf, output_buf, n)
        return list(output_buf), scale

    def softmax_inplace(self, data: List[float]) -> List[float]:
        """Native in-place softmax."""
        if not self.available:
            # Python fallback
            import math
            max_val = max(data)
            exp_data = [math.exp(x - max_val) for x in data]
            total = sum(exp_data)
            return [x / total for x in exp_data]

        n = len(data)
        buf = (c_float * n)(*data)
        self._lib.native_softmax(buf, n)
        return list(buf)

    def ct_compare(self, a: bytes, b: bytes) -> bool:
        """Constant-time byte comparison via native kernel."""
        if not self.available:
            # Python fallback (NOT constant-time)
            return a == b

        assert len(a) == len(b)
        n = len(a)
        a_buf = (c_uint8 * n)(*a)
        b_buf = (c_uint8 * n)(*b)
        return self._lib.ct_compare(a_buf, b_buf, n) == 1

    def helix_encode(self, dim: int, position: float) -> List[float]:
        """Generate helix position encoding via native kernel."""
        if not self.available:
            # Python fallback
            import math
            PHI = 1.618033988749895
            output = []
            for i in range(dim):
                freq = PHI / (i + 1)
                if i % 2 == 0:
                    output.append(math.sin(position * freq))
                else:
                    output.append(math.cos(position * freq))
            return output

        buf = (c_float * dim)()
        self._lib.helix_encode(buf, dim, c_float(position))
        return list(buf)

    def __repr__(self) -> str:
        status = "NATIVE" if self.available else "FALLBACK (Python)"
        return f"NativeBridge(mode={status})"

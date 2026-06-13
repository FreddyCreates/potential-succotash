# phantom_native/neurocore.py
<<<<<<< HEAD
"""
SovereignNeuroCore — Native MESIE NeuroCore with resonance attention.

Features:
- Helix-encoded weight initialization from MESIE primitives
- Custom resonance-weighted attention kernel
- TAURUS working memory with bounded capacity
- Full forward pass without external dependencies
"""

import math
from typing import Dict, Any, List
=======
"""Native MESIE NeuroCore — resonance + helix + TAURUS aware inference engine."""
from typing import Dict, Any, List
import math
>>>>>>> origin/main

from .sovereign_tensor import SovereignTensor


class SovereignNeuroCore:
<<<<<<< HEAD
    """Native MESIE NeuroCore — resonance + helix + TAURUS aware."""

    def __init__(self, config: Dict[str, Any]):
        self.d_model = config.get("d_model", 128)
        self.n_heads = config.get("n_heads", 8)
        self.head_dim = self.d_model // self.n_heads
        self.taurus_capacity = config.get("taurus_capacity", 32)
        self.weights = self._init_helix_weights()
        self.taurus_memory: List[SovereignTensor] = []  # working memory

    def _init_helix_weights(self) -> Dict[str, List[float]]:
        """Helix-encoded weights from MESIE primitives."""
=======
    """Native MESIE NeuroCore — resonance + helix + TAURUS aware.

    Implements custom resonance-weighted attention with helix-encoded weights.
    Zero external dependencies. TAURUS working memory for temporal context.
    """

    def __init__(self, config: Dict[str, Any] = None):
        config = config or {}
        self.d_model = config.get("d_model", 128)
        self.n_heads = config.get("n_heads", 8)
        self.head_dim = self.d_model // self.n_heads
        self.weights = self._init_helix_weights()
        self.taurus_memory: List[SovereignTensor] = []  # working memory
        self.taurus_capacity = config.get("taurus_capacity", 32)

    def _init_helix_weights(self) -> Dict[str, List[float]]:
        """Helix-encoded weights from MESIE primitives.

        Uses sinusoidal encoding inspired by rotary position embeddings
        but driven by the helix geometry of the organism's spectral model.
        """
>>>>>>> origin/main
        return {
            "query": [math.sin(i * 0.1) for i in range(self.d_model)],
            "key": [math.cos(i * 0.1) for i in range(self.d_model)],
            "value": [1.0 for _ in range(self.d_model)],
        }

    def _resonance_attention(
        self, q: List[float], k: List[float]
    ) -> List[float]:
<<<<<<< HEAD
        """Custom resonance-weighted attention kernel."""
        scores = []
        for i in range(len(q)):
            dot = sum(q[i] * k[j] for j in range(len(k)))  # simplified
            resonance = math.exp(-abs(dot) * 0.5)  # resonance decay
            scores.append(dot * resonance)

        # Softmax approximation (native)
        max_s = max(scores) if scores else 0
=======
        """Custom resonance-weighted attention kernel.

        Computes per-position scores as the element-wise dot product
        with exponential resonance decay, modeling damping in the spectral field.
        """
        scores = []
        for i in range(len(q)):
            dot = q[i] * k[i]  # element-wise score per position
            resonance = math.exp(-abs(dot) * 0.5)  # resonance decay
            scores.append(dot * resonance)

        # Softmax approximation (native — no scipy/numpy)
        max_s = max(scores) if scores else 0.0
>>>>>>> origin/main
        exp_s = [math.exp(s - max_s) for s in scores]
        total = sum(exp_s) or 1.0
        return [e / total for e in exp_s]

    def forward(self, tensor: SovereignTensor) -> SovereignTensor:
<<<<<<< HEAD
        """Full forward pass with resonance, helix, and TAURUS."""
        d = self.d_model

        # Project to QKV (native)
        q = [
            tensor.data[i % len(tensor.data)] * self.weights["query"][i % d]
            for i in range(d)
        ]
        k = [
            tensor.data[i % len(tensor.data)] * self.weights["key"][i % d]
            for i in range(d)
        ]
        v = [
            tensor.data[i % len(tensor.data)] * self.weights["value"][i % d]
            for i in range(d)
=======
        """Full forward pass with resonance, helix, and TAURUS.

        Projects input to Q/K/V using helix weights, applies resonance
        attention, accumulates in TAURUS working memory.
        """
        # Project to QKV (native, no matmul library)
        q = [
            tensor.data[i % len(tensor.data)]
            * self.weights["query"][i % self.d_model]
            for i in range(self.d_model)
        ]
        k = [
            tensor.data[i % len(tensor.data)]
            * self.weights["key"][i % self.d_model]
            for i in range(self.d_model)
        ]
        v = [
            tensor.data[i % len(tensor.data)]
            * self.weights["value"][i % self.d_model]
            for i in range(self.d_model)
>>>>>>> origin/main
        ]

        attn = self._resonance_attention(q, k)

<<<<<<< HEAD
        # Weighted sum over value
        output_data = [
            sum(attn[j] * v[j] for j in range(len(v)))
            for _ in range(len(tensor.data))
        ]
=======
        # Weighted sum of values
        weighted_sum = sum(attn[j] * v[j] for j in range(len(v)))
        output_data = [weighted_sum for _ in range(len(tensor.data))]
>>>>>>> origin/main

        out_tensor = SovereignTensor(output_data, tensor.shape, tensor.spectral_meta)

        # TAURUS working memory update
        self.taurus_memory.append(out_tensor)
        if len(self.taurus_memory) > self.taurus_capacity:
            self.taurus_memory.pop(0)

        return out_tensor

    def get_taurus_state(self) -> List[SovereignTensor]:
<<<<<<< HEAD
        """Access TAURUS working memory."""
        return self.taurus_memory[:]
=======
        """Access current TAURUS working memory."""
        return list(self.taurus_memory)
>>>>>>> origin/main

    def reset_taurus(self) -> None:
        """Clear TAURUS working memory."""
        self.taurus_memory.clear()

    def __repr__(self) -> str:
        return (
<<<<<<< HEAD
            f"SovereignNeuroCore(d_model={self.d_model}, n_heads={self.n_heads}, "
            f"taurus_len={len(self.taurus_memory)})"
=======
            f"SovereignNeuroCore(d_model={self.d_model}, "
            f"n_heads={self.n_heads}, taurus_len={len(self.taurus_memory)})"
>>>>>>> origin/main
        )

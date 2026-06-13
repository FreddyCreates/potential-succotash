# phantom_native/neurocore.py
"""Native MESIE NeuroCore — resonance + helix + TAURUS aware inference engine."""
from typing import Dict, Any, List
import math

from .sovereign_tensor import SovereignTensor


class SovereignNeuroCore:
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
        return {
            "query": [math.sin(i * 0.1) for i in range(self.d_model)],
            "key": [math.cos(i * 0.1) for i in range(self.d_model)],
            "value": [1.0 for _ in range(self.d_model)],
        }

    def _resonance_attention(
        self, q: List[float], k: List[float]
    ) -> List[float]:
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
        exp_s = [math.exp(s - max_s) for s in scores]
        total = sum(exp_s) or 1.0
        return [e / total for e in exp_s]

    def forward(self, tensor: SovereignTensor) -> SovereignTensor:
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
        ]

        attn = self._resonance_attention(q, k)

        # Weighted sum of values
        weighted_sum = sum(attn[j] * v[j] for j in range(len(v)))
        output_data = [weighted_sum for _ in range(len(tensor.data))]

        out_tensor = SovereignTensor(output_data, tensor.shape, tensor.spectral_meta)

        # TAURUS working memory update
        self.taurus_memory.append(out_tensor)
        if len(self.taurus_memory) > self.taurus_capacity:
            self.taurus_memory.pop(0)

        return out_tensor

    def get_taurus_state(self) -> List[SovereignTensor]:
        """Access current TAURUS working memory."""
        return list(self.taurus_memory)

    def reset_taurus(self) -> None:
        """Clear TAURUS working memory."""
        self.taurus_memory.clear()

    def __repr__(self) -> str:
        return (
            f"SovereignNeuroCore(d_model={self.d_model}, "
            f"n_heads={self.n_heads}, taurus_len={len(self.taurus_memory)})"
        )

# phantom_native/neurocore.py
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

from .sovereign_tensor import SovereignTensor


class SovereignNeuroCore:
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
        return {
            "query": [math.sin(i * 0.1) for i in range(self.d_model)],
            "key": [math.cos(i * 0.1) for i in range(self.d_model)],
            "value": [1.0 for _ in range(self.d_model)],
        }

    def _resonance_attention(
        self, q: List[float], k: List[float]
    ) -> List[float]:
        """Custom resonance-weighted attention kernel."""
        scores = []
        for i in range(len(q)):
            dot = sum(q[i] * k[j] for j in range(len(k)))  # simplified
            resonance = math.exp(-abs(dot) * 0.5)  # resonance decay
            scores.append(dot * resonance)

        # Softmax approximation (native)
        max_s = max(scores) if scores else 0
        exp_s = [math.exp(s - max_s) for s in scores]
        total = sum(exp_s) or 1.0
        return [e / total for e in exp_s]

    def forward(self, tensor: SovereignTensor) -> SovereignTensor:
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
        ]

        attn = self._resonance_attention(q, k)

        # Weighted sum over value
        output_data = [
            sum(attn[j] * v[j] for j in range(len(v)))
            for _ in range(len(tensor.data))
        ]

        out_tensor = SovereignTensor(output_data, tensor.shape, tensor.spectral_meta)

        # TAURUS working memory update
        self.taurus_memory.append(out_tensor)
        if len(self.taurus_memory) > self.taurus_capacity:
            self.taurus_memory.pop(0)

        return out_tensor

    def get_taurus_state(self) -> List[SovereignTensor]:
        """Access TAURUS working memory."""
        return self.taurus_memory[:]

    def reset_taurus(self) -> None:
        """Clear TAURUS working memory."""
        self.taurus_memory.clear()

    def __repr__(self) -> str:
        return (
            f"SovereignNeuroCore(d_model={self.d_model}, n_heads={self.n_heads}, "
            f"taurus_len={len(self.taurus_memory)})"
        )

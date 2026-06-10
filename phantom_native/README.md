# Sovereign Native Stack — Phantom-MESIE Integration

Zero-dependency native driver layer built on framework primitives:
**MESIE spectral objects, helix encoding, resonance, NeuroCores, TAURUS.**

## Architecture

```
phantom_native/           # Python reference implementation
├── sovereign_tensor.py   # SovereignTensor + MESIE spectral integration
├── neurocore.py          # SovereignNeuroCore (resonance attention + TAURUS)
├── swarm_runtime.py      # SovereignSwarmRuntime + Shadow Wire binding
└── zig/                  # Native performance layer
    ├── build.zig         # Zig build system
    └── src/
        ├── neurocore.zig # SIMD-ready kernels (C ABI)
        └── runtime.zig   # Attestable binary entry point

phantom_qsha/             # Quantum-Secure Hashing & Attestation
├── qsha.py              # QSHA commitment hashes
├── shadow_wire.py       # Topology masking
├── receipts.py          # Execution receipts (public proof)
└── vault.py             # Sealed intent storage
```

## Components

### 1. SovereignTensor (`phantom_native/sovereign_tensor.py`)
- Pure native tensor engine — zero external dependencies
- Direct MESIE SpectralComponent ingestion
- Resonance-weighted matrix multiplication
- Int8 quantization for edge deployment
- Deterministic binary serialization for QSHA

### 2. SovereignNeuroCore (`phantom_native/neurocore.py`)
- Helix-encoded weights (sinusoidal from MESIE geometry)
- Custom resonance-weighted attention kernel
- TAURUS working memory (bounded temporal context)
- Multi-head ready (configurable d_model, n_heads)

### 3. SovereignSwarmRuntime (`phantom_native/swarm_runtime.py`)
- Manages swarm of NeuroCores
- Sealed-intent execution via Sovereign Vault
- Shadow Wire topology masking (public proof, hidden internals)
- QSHA-based commitment aggregation
- Execution Receipts for verifiable compute

### 4. Zig Native Kernels (`phantom_native/zig/`)
- `resonance_dot` — φ-weighted dot product
- `matmul_resonance` — resonance matrix multiply
- `quantize_int8` — edge quantization
- `native_softmax` — in-place softmax
- C ABI compatible (CFFI binding, no NumPy)

## Build

### Python (reference/verification)
```bash
python -c "from phantom_native import SovereignSwarmRuntime; print('OK')"
```

### Zig (native performance)
```bash
cd phantom_native/zig
zig build -Doptimize=ReleaseFast
./zig-out/bin/phantom_swarm
```

## Usage

```python
from phantom_native import SovereignSwarmRuntime

runtime = SovereignSwarmRuntime()

# Spawn neuronets with spectral config
core_id = runtime.spawn_neuronet({"d_model": 128, "n_heads": 8})

# Execute sealed intent
intent = {"spectrum": {"amplitude": [0.5, 0.8, 0.3], "element_weight": 1.618}}
receipt = runtime.seal_and_execute(intent)

print(receipt.to_dict())
# → {receipt_id, commitment, shadow_wire, public_meta, timestamp}
```

## Native Full Libraries Strategy

| Component | Implementation | Notes |
|-----------|---------------|-------|
| SovereignTensor | Zig vectorized loops (SIMD) | Auto-vectorization with ReleaseFast |
| NeuroCore | Custom resonance kernels | C ABI for Python CFFI binding |
| Runtime | Deterministic binary | Attestable via QSHA manifest |
| Deployment | `zig build -Doptimize=ReleaseFast` | Single static binary |

## φ-Mathematics

Constants used throughout:
- `PHI = 1.618033...` — golden ratio (resonance weighting)
- `HEARTBEAT_MS = 873` — organism temporal rhythm
- `THRESHOLD = 0.618` — inverse golden ratio (decision boundary)

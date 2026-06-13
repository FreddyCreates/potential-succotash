<<<<<<< HEAD
# Phantom Native — Sovereign Native Stack

> MESIE Spectral Integration • Zero Heavy Dependencies • Edge-Ready

## Architecture

```
phantom_native/
├── __init__.py              # Python package entry
├── sovereign_tensor.py      # SovereignTensor + MESIE spectral integration
├── neurocore.py             # SovereignNeuroCore (resonance attention + TAURUS)
├── swarm_runtime.py         # SovereignSwarmRuntime (sealed intent execution)
├── build.zig                # Zig build for native kernels
├── src/
│   ├── neurocore.zig        # SIMD-optimized resonance kernels (C ABI)
│   └── runtime.zig          # Standalone swarm executable
└── README.md

phantom_qsha/
├── __init__.py              # QSHA package entry
├── shadow_wire.py           # ShadowWireEnvelope (topology masking)
├── receipts.py              # ExecutionReceipt (verifiable proofs)
└── vault.py                 # SovereignVault (sealed intent storage)
```

## Core Primitives

| Component | Role |
|-----------|------|
| **SovereignTensor** | Native tensor with MESIE spectral metadata, resonance-weighted ops |
| **SovereignNeuroCore** | Helix-encoded weights, resonance attention, TAURUS memory |
| **SovereignSwarmRuntime** | Multi-core execution, sealed intents, Shadow Wire masking |
| **ShadowWireEnvelope** | Topology masking — external observers see only commitments |
| **ExecutionReceipt** | QSHA-committed proof of computation |
| **SovereignVault** | Sealed intent storage with authenticated encryption |

## Usage (Python)

```python
from phantom_native import SovereignTensor, SovereignNeuroCore, SovereignSwarmRuntime

# Create tensor from MESIE spectral component
tensor = SovereignTensor.from_mesie_component({
    "frequency": [440.0, 880.0, 1320.0],
    "amplitude": [1.0, 0.5, 0.25],
    "element_weight": 0.9,
    "node_id": "spectral-001"
})

# Forward pass through NeuroCore
core = SovereignNeuroCore({"d_model": 64, "n_heads": 4})
output = core.forward(tensor)

# Swarm execution with sealed intents
runtime = SovereignSwarmRuntime()
runtime.spawn_neuronet({"d_model": 64, "n_heads": 4})
runtime.spawn_neuronet({"d_model": 128, "n_heads": 8})

from phantom_qsha import SovereignVault
vault = SovereignVault()
sealed = vault.seal_intent({
    "spectrum": {"amplitude": [1.0, 0.5, 0.25], "element_weight": 0.8}
})
receipt = runtime.execute_sealed_intent(sealed)
print(receipt.verify())  # True
```

## Native Build (Zig)

```bash
cd phantom_native
zig build -Doptimize=ReleaseFast
# Produces: zig-out/lib/libphantom_native.a + zig-out/bin/phantom_swarm
```

## Design Principles

1. **Zero heavy dependencies** — No NumPy, PyTorch, or TensorFlow in the core path
2. **MESIE primitives all the way down** — Spectral objects, helix encoding, resonance
3. **QSHA-protected** — Every execution produces verifiable commitments
4. **Shadow Wire masked** — External topology is always opaque
5. **Edge + swarm ready** — Int8 quantization, bounded TAURUS memory
6. **Deterministic binaries** — Zig ReleaseFast for attestable builds

## φ-Mathematics

- PHI = 1.618033988749895
- HEARTBEAT_MS = 873
- THRESHOLD = 0.618 (1/φ)
=======
# Sovereign Native Stack — Phantom-MESIE Integration

Zero-dependency native driver layer built on framework primitives:
**MESIE spectral objects, helix encoding, resonance, NeuroCores, TAURUS.**

## Build Architecture

```
       [ BUILD ARCHITECTURE: PHANTOM NATIVE STACK ]
       
                  ┌──────────────────────┐
                  │      build.zig       │
                  └──────────┬───────────┘
                             ▼
                  ┌──────────────────────┐
                  │    neurocore.zig     │ ◄── @import("std") only
                  └──────────┬───────────┘     (Zero-libc safe)
                             │
            ┌────────────────┴────────────────┐
            ▼ (Direct Binary)                 ▼ (C ABI Export)
   ┌──────────────────┐              ┌──────────────────┐
   │ Standalone Edge  │              │ phantom_native/  │
   │ Micro-Runtime    │              │ bridge.py (ctypes)│
   └──────────────────┘              └──────────────────┘
```

## Directory Structure

```
phantom_native/
├── __init__.py              # Package exports
├── sovereign_tensor.py      # SovereignTensor + MESIE spectral integration
├── neurocore.py             # SovereignNeuroCore (resonance attention + TAURUS)
├── swarm_runtime.py         # SovereignSwarmRuntime + Shadow Wire binding
├── bridge.py                # Python ↔ Zig ctypes bridge (zero NumPy)
├── manifest.py              # Build attestation & QSHA verification
└── zig/                     # Native performance layer
    ├── build.zig            # Multi-target build system
    └── src/
        ├── neurocore.zig    # SIMD kernels + constant-time primitives
        └── runtime.zig      # Attestable binary entry point

phantom_qsha/                # Quantum-Secure Hashing & Attestation
├── qsha.py                  # QSHA commitment hashes
├── shadow_wire.py           # Topology masking
├── receipts.py              # Execution receipts (public proof)
└── vault.py                 # Sealed intent storage
```

## SIMD Kernel Exports (C ABI)

| Kernel | Purpose | SIMD |
|--------|---------|------|
| `resonance_dot` | φ-weighted dot product | @Vector(8/4, f32) |
| `resonance_dot_i8` | Quantized dot product | i8 accumulate → f32 |
| `matmul_resonance` | Resonance matrix multiply | Vectorized inner loop |
| `native_softmax` | In-place softmax | Numerically stable |
| `quantize_int8` | Float → int8 quantization | Aligned output |
| `dequantize_int8` | Int8 → float restore | Scale recovery |
| `ct_compare` | Constant-time byte compare | Side-channel safe |
| `ct_select_f32` | Branchless conditional select | No timing leak |
| `ct_swap` | Constant-time buffer swap | Mask-based |
| `helix_encode` | φ-scaled position encoding | Sin/cos pairs |
| `resonance_decay` | Spectral damping | Exponential |
| `timing_regularize` | Execution padding | Clock-based |

## Cross-Compilation

### Default (host native)
```bash
cd phantom_native/zig
zig build -Doptimize=ReleaseFast
```

### ARM Cortex-M7 (embedded edge nodes)
```bash
zig build arm
# Or directly:
zig build-exe src/runtime.zig src/neurocore.zig \
  -target arm-freestanding-eabi -mcpu=cortex_m7 --name phantom_node
```

### x86_64 Linux Static (micro-clusters)
```bash
zig build x86-musl
# Or directly:
zig build-lib src/neurocore.zig \
  -target x86_64-linux-musl -O ReleaseFast --name neurocore
```

### AArch64 Linux Static (Raspberry Pi / ARM servers)
```bash
zig build aarch64-musl
```

## Memory Integration (Python ↔ Zig)

The ctypes bridge passes raw memory pointers directly to Zig kernels:

```python
from phantom_native import NativeBridge, SovereignTensor

bridge = NativeBridge()  # Auto-loads native library (fallback to Python)

# Direct SIMD operations on SovereignTensor data
a = SovereignTensor([1.0, 2.0, 3.0, 4.0], (4,))
b = SovereignTensor([0.5, 0.5, 0.5, 0.5], (4,))
dot = bridge.resonance_dot(a, b, resonance=1.618)

# Int8 quantization with aligned buffers
quantized, scale = bridge.quantize(a)

# Constant-time comparison (side-channel safe)
bridge.ct_compare(b"secret_a", b"secret_b")
```

**Key Design:**
- `ctypes.POINTER(ctypes.c_float)` → direct buffer access (no copy)
- Int8 buffers aligned to 16/32 bytes for VPADD/AVX instructions
- Fallback to pure Python if native library not compiled

## Build Attestation & Verification

```bash
# 1. Generate source manifest (QSHA fingerprint)
python -m phantom_native.manifest generate

# 2. Build native binary
cd phantom_native/zig && zig build -Doptimize=ReleaseFast && cd ../..

# 3. Verify binary against manifest + create audit receipt
python -m phantom_native.manifest verify

# 4. View audit trail
python -m phantom_native.manifest audit
```

Verification pipeline:
```
[ Source Code ] ──► [ QSHA Manifest ] ──► Check against known hash
                           │
                           ▼
[ zig build ] ──► [ Binary Output ] ──► Final Audit Trace Hash
                           │
                           ▼
              [ ReceiptChain (append-only) ]
```

## Timing Regularization (Shadow Wire)

All crypto-adjacent operations use constant-time primitives to prevent
side-channel analysis from uncovering internal state:

- `ct_compare`: Constant-time byte comparison (no early exit)
- `ct_select_f32`: Branchless conditional (bit-mask based)
- `ct_swap`: Content swap without conditional branches
- `timing_regularize`: Pads execution to fixed duration
- `heartbeat_align`: Aligns to 873ms organism heartbeat

## φ-Mathematics

Constants used throughout:
- `PHI = 1.618033...` — golden ratio (resonance weighting)
- `PHI_INV = 0.618033...` — inverse golden ratio (threshold)
- `HEARTBEAT_NS = 873,000,000` — organism temporal rhythm (nanoseconds)
- SIMD width: 8 lanes (AVX/x86_64) or 4 lanes (NEON/ARM)

>>>>>>> origin/main

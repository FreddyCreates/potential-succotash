# Sovereign Native Stack — Component Reference

> Single reference for install commands, REST API endpoints, Python library calls, Docker Compose configuration, and Zig native kernels.

---

## Table of Contents

1. [Install Commands](#install-commands)
2. [Zig Native Kernels](#zig-native-kernels)
3. [REST API Endpoints](#rest-api-endpoints)
4. [Python Library Calls](#python-library-calls)
5. [Docker Compose Configuration](#docker-compose-configuration)
6. [Benchmarks](#benchmarks)

---

## Install Commands

### Zig Native Stack (phantom_native)

```bash
# Build the native library + swarm runtime (ReleaseFast for production)
cd phantom_native
zig build -Doptimize=ReleaseFast

# Run native tests
zig build test

# Output artifacts:
#   zig-out/lib/libphantom_native.a    (static library, C ABI)
#   zig-out/bin/phantom_swarm           (standalone runtime)
```

### Python Stack (phantom_qsha + memory_temple)

```bash
# Install QSHA and Memory Temple (from repo root)
pip install -e ./phantom_qsha
pip install -e ./memory_temple

# Or import directly with PYTHONPATH
export PYTHONPATH=$(pwd)
python -c "from phantom_qsha import ExecutionReceipt; print('OK')"
python -c "from memory_temple.sdk.contracts import Memoria; print('OK')"
```

### Node.js / Extensions

```bash
# From repo root
npm install
npm run build          # Build all extensions
npm run lint           # Lint manifests
npm test               # Run tests

# Build Vigil extension specifically
npm run build:vigil

# Build desktop app
npm run build:desktop
```

### Docker (All Services)

```bash
# Build all containers
docker compose build

# Run sovereign swarm runtime
docker compose up sovereign-runtime

# Run Zig tests in container
docker compose run phantom-native-test

# Run Python QSHA tests
docker compose run qsha-test

# Start Workers dev server
docker compose up workers-dev
```

---

## Zig Native Kernels

### src/helix.zig — Helix Encoding Primitives

| Function | Signature | Description |
|---|---|---|
| `helix_encode` | `(data: []const f32, params: HelixParams, allocator) ![]f32` | Phase-rotated sinusoidal projection encoding |
| `helix_rotate` | `(vec: []f32, turns: usize) void` | SIMD-accelerated 8-wide rotation kernel |
| `helix_decode` | `(encoded: []const f32, params: HelixParams, allocator) ![]f32` | Approximate inverse decode |

**HelixParams:**
```zig
pub const HelixParams = struct {
    turns: usize,      // Number of helix turns (frequency)
    phase: f32,        // Phase offset (radians)
    dimensions: usize, // Model dimensionality
};
```

### src/neurocore.zig — SovereignNeuroCore + TAURUS

#### C ABI Exports (FFI-compatible)

| Export | Signature | Description |
|---|---|---|
| `resonance_dot` | `(a, b, len, resonance) → f32` | Resonance-weighted dot product |
| `sovereign_matmul` | `(a, b, out, m, k, n, resonance)` | Matrix multiply with resonance |
| `resonance_attention` | `(q, k, scores_out, len)` | Attention scores with softmax |
| `quantize_int8` | `(data, out, len, scale_out)` | Int8 quantization for edge |

#### Managed Types

| Type | Description |
|---|---|
| `SovereignTensor` | Managed tensor with shape, resonance score, allocator |
| `TaurusMemory` | Working + long-term memory with resonance decay eviction |
| `SovereignNeuroCore` | Full forward pass: Helix encode → matmul → TAURUS store |

#### SovereignNeuroCore Usage

```zig
var core = try SovereignNeuroCore.init(allocator, 64); // d_model=64
defer core.deinit();

var input = try SovereignTensor.init(allocator, 1, 64);
// ... fill input.data ...
input.resonance = 1.0;

const output = try core.forward(input);
defer output.deinit();
// output is helix-encoded, resonance-weighted, and stored in TAURUS
```

### src/qsha_binding.zig — Phantom-QSHA Commitments

| Function | Description |
|---|---|
| `compute_commitment(tensor)` | 32-byte QSHA hash over tensor data |
| `compute_raw_commitment(data)` | Hash arbitrary byte slices |
| `create_receipt(output)` | Full execution receipt with timestamp |
| `compute_commitment_fallback(tensor)` | SHA-256 fallback (no C lib needed) |
| `create_receipt_fallback(output)` | Receipt using SHA-256 fallback |
| `attest_binary(path, allocator)` | Hash binary for manifest attestation |

---

## REST API Endpoints

The REST API is served by Cloudflare Workers (serverless). Key workers:

### api-node (Primary API)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/inference` | Run sovereign inference (resonance attention) |
| `POST` | `/api/memory/store` | Store tensor in TAURUS memory |
| `GET` | `/api/memory/recall/:key` | Recall tensor by key |
| `POST` | `/api/helix/encode` | Helix-encode a vector |
| `GET` | `/api/health` | Health check with PHI heartbeat |
| `POST` | `/api/qsha/commit` | Generate QSHA commitment |

### gate-node (Auth + Routing)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/gate/verify` | P226 phase verification |
| `POST` | `/gate/attest` | Binary attestation check |
| `GET` | `/gate/status` | Gate node status |

### coordinator (Orchestration)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/coord/workflow` | Start workflow orchestration |
| `POST` | `/coord/agent/spawn` | Spawn autonomous agent |
| `GET` | `/coord/session/:id` | Get session state |

### Local Development

```bash
# Start local Workers dev server
docker compose up workers-dev
# Or directly:
cd workers/api-node && npx wrangler dev --local --port 8787
```

---

## Python Library Calls

### phantom_qsha — Cryptographic Attestation

```python
from phantom_qsha import ShadowWireEnvelope, ExecutionReceipt, SovereignVault

# Create execution receipt
receipt = ExecutionReceipt(
    tensor_hash=b"...",
    timestamp_ms=1234567890,
    resonance=0.85,
)

# Shadow wire topology masking
envelope = ShadowWireEnvelope(
    payload=receipt.serialize(),
    mask_topology=True,
)

# Sealed intent storage
vault = SovereignVault(path="/tmp/vault")
vault.store("intent-001", sealed_data)
result = vault.retrieve("intent-001")
```

### memory_temple — CIVOS-PRIME Memory SDK

```python
from memory_temple.sdk.contracts import Memoria, Registrum, Artifacta, Nova
from memory_temple.sdk.contracts import WriteBranchRequest, PromoteToCanonRequest
from memory_temple.sdk.types import RegistryEntry, ArtifactFormat
from memory_temple.adapters import FilesystemAdapter, RepoAdapter, RuntimeAdapter
from memory_temple.bridges import MemoryBridge, RegistryBridge
from memory_temple.runtime import ModeLawRegistry, DelegationManager

# ── MEMORIA: Lawful memory operations
memoria = Memoria()
result = memoria.write_branch_note(WriteBranchRequest(
    request_id="req-1",
    path="notes/analysis.md",
    content=b"# Analysis\n\nResults here.",
    metadata={"coherence_score": 0.75},
))

# ── REGISTRUM: Entity registration
registrum = Registrum()
registrum.register_engine(EngineRegistration(
    entry=RegistryEntry(id="engine-001", name="HelixEncoder", version="1.0.0"),
    input_types=["tensor"],
    output_types=["encoded_tensor"],
    execution_mode="sync",
))

# ── ARTIFACTA: Durable output
artifacta = Artifacta()
artifacta.emit_branch(EmitBranchRequest(
    request_id="req-2",
    name="forward-pass-result",
    format=ArtifactFormat.JSON,
    content=b'{"resonance": 0.85, "commitment": "abc123..."}',
))

# ── NOVA: Runtime classification
nova = Nova()
classification = nova.classify_task(ClassifyRequest(
    request_id="req-3",
    task_id="task-helix",
    task_description="Helix-encode 1K spectral vectors",
    estimated_operations=1000,
))
mode = nova.decide_mode(DecideModeRequest(
    request_id="req-4",
    classification=classification.classification,
))
```

### Adapters & Bridges

```python
# Wire adapters
fs = FilesystemAdapter()
repo = RepoAdapter(filesystem_adapter=fs)
runtime = RuntimeAdapter()

# Bridge results to memory
memory_bridge = MemoryBridge(memoria=memoria, filesystem_adapter=fs)
registry_bridge = RegistryBridge(registrum=registrum)

result = memory_bridge.bridge_to_memory(BridgeInput(
    input_id="bridge-1",
    source_surface="artifacta",
    content=artifact_content,
    content_type="application/json",
))
```

---

## Docker Compose Configuration

### Services

| Service | Image Base | Purpose |
|---|---|---|
| `phantom-native` | `debian:bookworm-slim` + Zig 0.13 | Build native SIMD kernels |
| `phantom-native-test` | Same as above | Run Zig unit tests |
| `sovereign-runtime` | Same as above | Run phantom_swarm executable |
| `phantom-qsha` | `python:3.12-slim` | QSHA cryptographic attestation |
| `qsha-test` | Same as above | Run Python QSHA tests |
| `memory-temple` | Same as above | Memory Temple SDK validation |
| `workers-dev` | `node:20-slim` | Local Cloudflare Workers dev |

### Volumes

| Volume | Purpose |
|---|---|
| `zig-cache` | Persistent Zig compilation cache |
| `node-modules` | Shared node_modules for Workers |

### Commands

```bash
# Full build pipeline
docker compose build
docker compose run phantom-native-test
docker compose run qsha-test
docker compose up sovereign-runtime

# Development workflow
docker compose up workers-dev         # Port 8787
docker compose run phantom-native     # Rebuild native lib

# Clean
docker compose down -v                # Remove volumes
```

---

## Benchmarks

### Performance Expectations

| Workload | Python (pure) | NumPy | Zig (ReleaseFast + AVX2) |
|---|---|---|---|
| 1K spectral vectors (100 iter) | ~13s | ~0.1ms | **< 1ms** |
| Helix encode (1K elements) | ~50ms | ~0.05ms | **< 0.01ms** |
| Resonance matmul (64×64) | ~200ms | ~0.02ms | **< 0.05ms** |
| Forward pass (full pipeline) | N/A | N/A | **< 1ms** |

### Why Zig Wins for Sovereign Workloads

- **No interpreter overhead**: Direct machine code, no GIL, no dynamic dispatch
- **Full SIMD inlining**: 8-wide f32 lanes via AVX2 on x86_64
- **Deterministic timing**: No GC pauses, predictable for edge/sensor deployment
- **Sub-millisecond latency**: Critical for MESIE sensor streams and real-time spectral processing
- **Attestable binaries**: Deterministic compilation → reproducible QSHA hashes

### When to Use Each Layer

| Use Case | Layer |
|---|---|
| Spectral processing, sensor streams | Zig native kernels |
| Orchestration, memory management | Python (memory_temple) |
| API serving, edge routing | Cloudflare Workers (TypeScript) |
| Cryptographic attestation | QSHA (Python + Zig binding) |
| Browser intelligence | Extensions (JavaScript) |

---

## Architecture Diagram

```
┌─────────────────────────────────────────────────────────────────┐
│                    Sovereign Native Stack                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                   │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐│
│  │  helix.zig   │──▶│ neurocore.zig│──▶│  qsha_binding.zig    ││
│  │  (encoding)  │   │ (NeuroCore + │   │  (commitments)       ││
│  │              │   │  TAURUS)     │   │                      ││
│  └──────────────┘   └──────────────┘   └──────────────────────┘│
│         │                    │                    │               │
│         ▼                    ▼                    ▼               │
│  ┌─────────────────────────────────────────────────────────────┐│
│  │              libphantom_native.a (C ABI)                     ││
│  └─────────────────────────────────────────────────────────────┘│
│         │                    │                    │               │
├─────────┼────────────────────┼────────────────────┼──────────────┤
│         ▼                    ▼                    ▼               │
│  ┌──────────────┐   ┌──────────────┐   ┌──────────────────────┐│
│  │ phantom_qsha │   │memory_temple │   │  Cloudflare Workers  ││
│  │  (Python)    │   │  (Python)    │   │  (TypeScript)        ││
│  └──────────────┘   └──────────────┘   └──────────────────────┘│
│                                                                   │
└─────────────────────────────────────────────────────────────────┘
```

---

## File Locations

| Component | Path |
|---|---|
| Helix encoding | `phantom_native/src/helix.zig` |
| NeuroCore + TAURUS | `phantom_native/src/neurocore.zig` |
| QSHA binding | `phantom_native/src/qsha_binding.zig` |
| Swarm runtime | `phantom_native/src/runtime.zig` |
| Build config | `phantom_native/build.zig` |
| Docker Compose | `docker-compose.yml` |
| Zig Dockerfile | `docker/Dockerfile.zig` |
| Python Dockerfile | `docker/Dockerfile.python` |
| Node Dockerfile | `docker/Dockerfile.node` |
| QSHA Python | `phantom_qsha/` |
| Memory Temple | `memory_temple/` |
| Workers | `workers/` |
| This reference | `docs/sovereign-native-reference.md` |

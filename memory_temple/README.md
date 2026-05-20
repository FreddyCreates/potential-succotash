# CIVOS-PRIME: Memory Temple SDK

> The first repo-backed implementation slice of CIVOS-PRIME.
> Preserves lawful memory, discoverability, durable output, and runtime governance.

## Architecture

```
memory_temple/
├── doctrine/           # Canon-grade (trunk) memory objects
├── registry/           # Entity registration and discovery
├── sdk/
│   ├── contracts/      # Core contracts: MEMORIA, REGISTRUM, ARTIFACTA, NOVA
│   ├── types/          # Shared data types
│   └── acceptance/     # Acceptance tests
├── adapters/           # Storage and runtime adapters
├── bridges/            # Inter-surface handoff
├── runtime/            # Mode law, delegation, execution profiles
├── artifacts/          # Durable output storage
├── workstations/       # Branch working area
├── conflicts/          # Conflict resolution
├── errors/             # Error tracking
├── patterns/           # Reusable patterns
└── terminals/          # Publication endpoints
```

## Core Contracts

### MEMORIA (Memory)
Lawful canon reads, branch writes, and continuity events.

```python
from memory_temple.sdk.contracts import Memoria, WriteBranchRequest

memoria = Memoria()

# Write to branch
result = memoria.write_branch_note(WriteBranchRequest(
    request_id="req-1",
    path="notes/my-note.md",
    content=b"# My Note\n\nContent here.",
    metadata={"coherence_score": 0.75},
))

# Promote to canon when ready
if result.success:
    memoria.promote_to_canon(PromoteToCanonRequest(
        request_id="req-2",
        branch_id=result.memory_object.id,
    ))
```

**Laws:**
- Trunk and branch writes are physically separable
- All durable writes require lineage tracking
- Canon writes cannot bypass MEMORIA

### REGISTRUM (Registry)
Register and look up engines, artifacts, workflows, adapters, and bridges.

```python
from memory_temple.sdk.contracts import Registrum, EngineRegistration
from memory_temple.sdk.types import RegistryEntry

registrum = Registrum()

# Register an engine
result = registrum.register_engine(EngineRegistration(
    entry=RegistryEntry(
        id="engine-001",
        entity_type=None,  # Set by register_engine
        name="ProcessingEngine",
        version="1.0.0",
        repo_path="engines/processing.py",
    ),
    input_types=["text", "json"],
    output_types=["artifacts"],
    execution_mode="async",
))

# Lookup by capability
engines = registrum.lookup(LookupRequest(
    request_id="req-3",
    lookup_type="by_capability",
    query="output:artifacts",
))
```

**Laws:**
- Discoverability without duplicate drift
- Dependencies are checked during registration

### ARTIFACTA (Artifacts)
Emit canon artifacts, branch artifacts, protocol objects, and package stubs.

```python
from memory_temple.sdk.contracts import Artifacta, EmitBranchRequest
from memory_temple.sdk.types import ArtifactFormat

artifacta = Artifacta()

# Emit branch artifact
result = artifacta.emit_branch(EmitBranchRequest(
    request_id="req-4",
    name="analysis-result",
    format=ArtifactFormat.JSON,
    content=b'{"analysis": "complete"}',
))

# Emit canon artifact (requires authority)
result = artifacta.emit_canon(EmitCanonRequest(
    request_id="req-5",
    name="finalized-result",
    format=ArtifactFormat.JSON,
    content=b'{"final": true}',
    authority_token="valid-token",
))
```

**Laws:**
- Artifact identity stays tied to trunk-or-branch status
- Branch and canon artifacts don't collapse their status

### NOVA (Runtime)
Classify task depth, choose mode, decide delegation, switch execution profile.

```python
from memory_temple.sdk.contracts import Nova, ClassifyRequest, DecideModeRequest

nova = Nova()

# Classify task
classify_result = nova.classify_task(ClassifyRequest(
    request_id="req-6",
    task_id="task-001",
    task_description="Complex analysis",
    estimated_operations=5000,
))

# Get mode decision
mode_result = nova.decide_mode(DecideModeRequest(
    request_id="req-7",
    classification=classify_result.classification,
))

print(f"Mode: {mode_result.decision.selected_mode}")
print(f"Reasons: {mode_result.decision.reasons}")
```

**Laws:**
- Runtime hierarchy is explicit and inspectable
- Foundation-floor delegation cannot gain authority
- Canonical writes cannot bypass MEMORIA

## Adapters

### Priority Order:
1. **Filesystem Adapter** - Local storage substrate
2. **Repo Adapter** - Repo placement and retrieval
3. **Runtime Adapter** - Execution profile mapping

```python
from memory_temple.adapters import FilesystemAdapter, RepoAdapter, RuntimeAdapter

fs = FilesystemAdapter()
repo = RepoAdapter(filesystem_adapter=fs)
runtime = RuntimeAdapter()

# Wire into contracts
memoria = Memoria(adapter=fs)
artifacta = Artifacta(adapter=fs, memoria=memoria, registrum=registrum)
```

## Bridges

### Priority Order:
1. **Memory Bridge** - All results return through Memory Runtime law
2. **Registry Bridge** - Durable objects auto-register
3. **Publication Bridge** - Converged objects get publish-ready expression
4. **Delegation Bridge** - Heavy work gets bounded execution

```python
from memory_temple.bridges import MemoryBridge, RegistryBridge

memory_bridge = MemoryBridge(memoria=memoria, filesystem_adapter=fs)
registry_bridge = RegistryBridge(registrum=registrum)

# Bridge artifact result to memory
result = memory_bridge.bridge_to_memory(BridgeInput(
    input_id="bridge-1",
    source_surface="artifacta",
    content=artifact_content,
    content_type="application/json",
))
```

## Runtime

```python
from memory_temple.runtime import ModeLawRegistry, DelegationManager, ExecutionProfileManager

# Mode laws
laws = ModeLawRegistry()
violation = laws.check("LAW-001-CANON-BYPASS", {"target": "canon", "source": "direct"})
# violation.satisfied == False

# Delegation
delegation = DelegationManager()
delegation.register_target(DelegationTarget(
    target_id="worker-1",
    target_type="worker",
    authority=AuthorityLevel.FOUNDATION,
    capabilities=["compute"],
))

# Execution profiles
profiles = ExecutionProfileManager()
profile = profiles.select_for_task(estimated_duration_ms=5000, requires_async=False)
```

## Acceptance Tests

Run all acceptance tests:

```python
from memory_temple.sdk.acceptance import run_all_acceptance_tests
run_all_acceptance_tests()
```

Run individual test suites:

```python
from memory_temple.sdk.acceptance import (
    run_memoria_tests,
    run_registrum_tests,
    run_artifacta_tests,
    run_nova_tests,
)

run_memoria_tests()
run_registrum_tests()
run_artifacta_tests()
run_nova_tests()
```

## Success Criteria

✅ `memoria.read_canon` and `memoria.write_branch_note` work against canonical filesystem layout
✅ Trunk and branch writes are physically and logically separable
✅ Every durable object has a stable ID, lineage metadata, and repo path
✅ `registrum` can register and retrieve engines, artifacts, adapters, and bridges
✅ `artifacta` can emit both branch and canon-class artifacts without collapsing their status
✅ `nova` returns deterministic depth and delegation decisions with named reasons
✅ Canonical writes cannot bypass MEMORIA through direct adapter calls
✅ Foundation-floor-style delegation can be represented but cannot become speaking or canon authority
✅ Integration test proves lawful flow across memory, registry, artifact emission, and runtime governance

## φ-Mathematics

The SDK uses φ-mathematics throughout:

- **PHI** = 1.618033988749895
- **HEARTBEAT_MS** = 873ms (base timing interval)
- **THRESHOLD** = 0.618 (coherence threshold for canon promotion)

## Next Steps

1. **CONFLICTUS** - Collision detection as artifact emission increases
2. **Language-neutral schemas** - Consider for cross-language contract canon
3. **Manifest emission** - Acceptance outputs emit registry-ready manifests

## License

Part of the CIVOS-PRIME ecosystem.

# Production-Grade Builder

Reusable scaffolding engine for production-grade deliverable packets.

## What It Does

Scaffolds production-grade packets for any deliverable surface. Every generated packet includes:

- `README.md` — purpose, usage, verification
- `PACKET_POLICY.md` — production-grade law for that surface
- `manifest.json` — machine-readable metadata
- `RELEASE_MANIFEST.md` — version, checksum, provenance
- `reports/build_report.json` — build verification record
- `reports/score.json` — quality score
- `tools/quality_gate.py` — self-contained verification tool

## Supported Deliverable Types

| Surface | Profile Key |
|---------|-------------|
| Static App | `static-app` |
| Python Service | `python-service` |
| Node Service | `node-service` |
| Benchmark Engine | `benchmark-engine` |
| Local API | `local-api` |
| CI Workflow | `ci-workflow` |
| Dataset | `dataset` |
| Manifest | `manifest` |
| Proof Pack | `proof-pack` |
| Research Packet | `research-packet` |
| Dashboard | `dashboard` |
| Documentation | `docs` |
| Deploy Scaffold | `deploy-scaffold` |
| Repo Surface | `repo-surface` |

## Usage

```bash
# Scaffold a new packet
python production-grade-builder/scaffold.py --kind python-service --name my-service --output ./my-service

# Run quality gate on any packet
python <packet>/tools/quality_gate.py

# Run builder's own quality gate
python production-grade-builder/tools/quality_gate.py
```

## Workflow

1. Choose the deliverable kind
2. Scaffold with the builder
3. Fill in the real content
4. Run its quality gate
5. Export the production ZIP

## Verification

```bash
python production-grade-builder/tools/quality_gate.py
```

All examples in `examples/` pass their own quality gates.

## Zero Dependencies

This builder requires only Python 3.8+ standard library. No pip install needed.

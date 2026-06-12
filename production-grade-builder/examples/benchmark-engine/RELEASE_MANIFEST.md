# Release Manifest — example-benchmark-engine

| Field | Value |
|-------|-------|
| Name | example-benchmark-engine |
| Kind | benchmark-engine |
| Version | 1.0.0 |
| Created | 2026-06-11T08:33:04.115644+00:00 |
| Builder | production-grade-builder v1.0.0 |
| Gate Status | SCAFFOLD (run gate to verify) |

## Provenance

- Scaffolded by production-grade-builder
- Quality gate: `tools/quality_gate.py`
- Policy: `PACKET_POLICY.md`

## Checksum

Compute after filling content:
```bash
find . -type f | sort | xargs sha256sum | sha256sum
```

# Packet Policy — Production-Grade Builder

## Law

Every deliverable produced by this builder MUST:

1. **Be self-verifiable** — contain `tools/quality_gate.py` that validates its own structure
2. **Carry its own policy** — include `PACKET_POLICY.md` stating what "done" means for that surface
3. **Have a manifest** — machine-readable `manifest.json` with kind, version, author, created timestamp
4. **Include a release manifest** — `RELEASE_MANIFEST.md` with version, checksum, provenance chain
5. **Report quality** — `reports/score.json` with numeric pass/fail and `reports/build_report.json`
6. **Document itself** — `README.md` describing purpose, usage, and verification steps

## Quality Gate Minimum

A packet passes its quality gate when:

- All required files exist (README.md, PACKET_POLICY.md, manifest.json, RELEASE_MANIFEST.md)
- `manifest.json` is valid JSON with fields: kind, name, version, author, created
- `tools/quality_gate.py` exists and is executable logic (not a stub)
- `reports/` directory exists with at least `score.json`
- Score in `score.json` is numeric and ≥ 0.8 (80%)

## Surface-Specific Additions

Each surface type may add additional requirements on top of this baseline.
See `profiles/` for per-surface specifications.

## Enforcement

- The builder refuses to produce a packet that would fail its own gate
- CI can run `python <packet>/tools/quality_gate.py` as a gate step
- No packet ships without a passing gate

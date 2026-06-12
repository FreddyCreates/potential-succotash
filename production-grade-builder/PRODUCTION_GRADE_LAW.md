# Production-Grade Law

## The Law

Every deliverable in this repository — regardless of surface type — MUST be production-grade.

**Production-grade** means:

1. **Self-verifiable** — carries `tools/quality_gate.py` that validates its own structure and content
2. **Policy-bound** — includes `PACKET_POLICY.md` defining what "done" means
3. **Manifest-tracked** — has machine-readable `manifest.json` with kind, name, version, author, timestamp
4. **Provenance-documented** — includes `RELEASE_MANIFEST.md` with version, checksum, builder lineage
5. **Quality-scored** — produces `reports/score.json` with numeric ≥ 0.8 and `reports/build_report.json`
6. **Self-documenting** — README.md describes purpose, usage, and verification

## Scope

This law applies to ALL deliverable surfaces:

| Surface | Description |
|---------|-------------|
| static-app | Static web apps (HTML/CSS/JS) |
| python-service | Python backend services |
| node-service | Node.js backend services |
| benchmark-engine | Performance benchmarks |
| local-api | Local-first APIs |
| ci-workflow | CI/CD pipelines |
| dataset | Structured datasets |
| manifest | Registry manifests |
| proof-pack | Verification proof packs |
| research-packet | Research deliverables |
| dashboard | Monitoring dashboards |
| docs | Documentation |
| deploy-scaffold | Deployment scaffolds |
| repo-surface | Repository governance |

## Enforcement Mechanism

1. **Scaffold** — Use `python production-grade-builder/scaffold.py --kind <type> --name <name>` to generate compliant structure
2. **Fill** — Add real content to scaffolded files
3. **Gate** — Run `python <packet>/tools/quality_gate.py` — must exit 0
4. **Export** — Only gated packets may be exported or deployed

## No Exceptions

- No deliverable ships without a passing quality gate
- No deliverable exists without its own policy document
- No deliverable lacks a manifest
- The builder itself passes its own gate

## Builder Reference

The production-grade-builder at `production-grade-builder/` is the canonical scaffolding engine.
It generates compliant packets for any surface type listed above.

## Versioning

- Law version: 1.0.0
- Builder version: 1.0.0
- Registry schema: 1.0.0

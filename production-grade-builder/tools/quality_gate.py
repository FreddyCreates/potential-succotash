#!/usr/bin/env python3
"""
Quality Gate — Production-Grade Builder Self-Verification

Validates that the builder itself meets production-grade requirements.
Exit code 0 = PASS, non-zero = FAIL.
"""

import json
import os
import sys
from pathlib import Path


def main():
    root = Path(__file__).resolve().parent.parent
    errors = []
    checks_passed = 0
    checks_total = 0

    # Check 1: Builder required files exist
    required_files = [
        "README.md",
        "PACKET_POLICY.md",
        "scaffold.py",
        "tools/quality_gate.py",
        "profiles/registry.json",
    ]
    for f in required_files:
        checks_total += 1
        if (root / f).exists():
            checks_passed += 1
        else:
            errors.append(f"MISSING: {f}")

    # Check 2: scaffold.py has real logic (not a stub)
    checks_total += 1
    scaffold_path = root / "scaffold.py"
    if scaffold_path.exists():
        content = scaffold_path.read_text()
        if len(content) > 500 and "def scaffold" in content and "SUPPORTED_KINDS" in content:
            checks_passed += 1
        else:
            errors.append("scaffold.py appears to be a stub or incomplete")
    else:
        errors.append("scaffold.py does not exist")

    # Check 3: profiles/registry.json is valid JSON with all kinds
    checks_total += 1
    registry_path = root / "profiles" / "registry.json"
    if registry_path.exists():
        try:
            with open(registry_path) as fh:
                registry = json.load(fh)
            if isinstance(registry, dict) and "profiles" in registry:
                expected_kinds = [
                    "static-app", "python-service", "node-service",
                    "benchmark-engine", "local-api", "ci-workflow",
                    "dataset", "manifest", "proof-pack", "research-packet",
                    "dashboard", "docs", "deploy-scaffold", "repo-surface",
                ]
                registered = [p["kind"] for p in registry["profiles"]]
                missing = [k for k in expected_kinds if k not in registered]
                if missing:
                    errors.append(f"Registry missing kinds: {missing}")
                else:
                    checks_passed += 1
            else:
                errors.append("registry.json missing 'profiles' array")
        except json.JSONDecodeError as e:
            errors.append(f"registry.json invalid JSON: {e}")
    else:
        errors.append("profiles/registry.json does not exist")

    # Check 4: At least one example exists and has quality_gate.py
    checks_total += 1
    examples_dir = root / "examples"
    if examples_dir.exists():
        example_dirs = [d for d in examples_dir.iterdir() if d.is_dir()]
        if example_dirs:
            valid_examples = 0
            for ex_dir in example_dirs:
                gate = ex_dir / "tools" / "quality_gate.py"
                manifest = ex_dir / "manifest.json"
                if gate.exists() and manifest.exists():
                    valid_examples += 1
            if valid_examples > 0:
                checks_passed += 1
            else:
                errors.append("No valid examples found (need tools/quality_gate.py + manifest.json)")
        else:
            errors.append("examples/ directory is empty")
    else:
        errors.append("examples/ directory does not exist")

    # Check 5: PRODUCTION_GRADE_LAW.md exists at builder root
    checks_total += 1
    law_path = root / "PRODUCTION_GRADE_LAW.md"
    if law_path.exists():
        content = law_path.read_text()
        if len(content) > 100:
            checks_passed += 1
        else:
            errors.append("PRODUCTION_GRADE_LAW.md is too short")
    else:
        errors.append("PRODUCTION_GRADE_LAW.md does not exist")

    # Results
    score = checks_passed / checks_total if checks_total > 0 else 0
    status = "PASS" if not errors else "FAIL"

    print(f"Builder Quality Gate: {status}")
    print(f"Score: {checks_passed}/{checks_total} ({score:.0%})")
    if errors:
        print("\nIssues:")
        for e in errors:
            print(f"  ✗ {e}")
    else:
        print("\n  ✓ All builder checks passed")

    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""
Quality Gate — Self-Verification Tool

Validates that this packet meets production-grade requirements.
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

    # Check 1: Required files exist
    required_files = [
        "README.md",
        "PACKET_POLICY.md",
        "manifest.json",
        "RELEASE_MANIFEST.md",
        "tools/quality_gate.py",
    ]
    for f in required_files:
        checks_total += 1
        if (root / f).exists():
            checks_passed += 1
        else:
            errors.append(f"MISSING: {f}")

    # Check 2: manifest.json is valid JSON with required fields
    checks_total += 1
    manifest_path = root / "manifest.json"
    if manifest_path.exists():
        try:
            with open(manifest_path) as fh:
                manifest = json.load(fh)
            required_keys = ["kind", "name", "version", "author", "created"]
            missing_keys = [k for k in required_keys if k not in manifest]
            if missing_keys:
                errors.append(f"manifest.json missing keys: {missing_keys}")
            else:
                checks_passed += 1
        except json.JSONDecodeError as e:
            errors.append(f"manifest.json invalid JSON: {e}")
    else:
        errors.append("manifest.json does not exist")

    # Check 3: reports directory exists with score.json
    checks_total += 1
    score_path = root / "reports" / "score.json"
    if score_path.exists():
        try:
            with open(score_path) as fh:
                score_data = json.load(fh)
            if "score" in score_data and isinstance(score_data["score"], (int, float)):
                if score_data["score"] >= 0.8:
                    checks_passed += 1
                else:
                    errors.append(f"Score {score_data['score']} < 0.8 minimum")
            else:
                errors.append("score.json missing numeric 'score' field")
        except json.JSONDecodeError as e:
            errors.append(f"score.json invalid JSON: {e}")
    else:
        errors.append("reports/score.json does not exist")

    # Check 4: quality_gate.py is not a stub (has real logic)
    checks_total += 1
    gate_path = root / "tools" / "quality_gate.py"
    if gate_path.exists():
        content = gate_path.read_text()
        if len(content) > 200 and "def main" in content:
            checks_passed += 1
        else:
            errors.append("quality_gate.py appears to be a stub")
    else:
        errors.append("tools/quality_gate.py does not exist")

    # Check 5: build_report.json exists
    checks_total += 1
    report_path = root / "reports" / "build_report.json"
    if report_path.exists():
        checks_passed += 1
    else:
        errors.append("reports/build_report.json does not exist")

    # Results
    score = checks_passed / checks_total if checks_total > 0 else 0
    status = "PASS" if not errors else "FAIL"

    print(f"Quality Gate: {status}")
    print(f"Score: {checks_passed}/{checks_total} ({score:.0%})")
    if errors:
        print("\nIssues:")
        for e in errors:
            print(f"  ✗ {e}")
    else:
        print("\n  ✓ All checks passed")

    sys.exit(0 if not errors else 1)


if __name__ == "__main__":
    main()

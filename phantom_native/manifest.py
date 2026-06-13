# phantom_native/manifest.py
"""Build Manifest & Binary Attestation — QSHA-verified compilation pipeline.

Workflow:
1. Generate source manifest (QSHA fingerprint of all source files)
2. Build native binary via Zig
3. Generate binary attestation hash
4. Record both in the ReceiptChain (append-only audit log)

Usage:
    python -m phantom_native.manifest generate   # Source manifest
    python -m phantom_native.manifest verify     # Verify binary against manifest
    python -m phantom_native.manifest audit      # Full audit trail
"""
import os
import sys
import json
import time
import hashlib
from pathlib import Path
from typing import Dict, List, Optional

# Add parent to path for imports
sys.path.insert(0, str(Path(__file__).parent.parent))
from phantom_qsha.qsha import qsha_hash, qsha_aggregate
from phantom_qsha.receipts import ExecutionReceipt


# Source directories to include in manifest
SOURCE_DIRS = [
    "phantom_native/zig/src",
    "phantom_native/zig/build.zig",
    "phantom_native/sovereign_tensor.py",
    "phantom_native/neurocore.py",
    "phantom_native/swarm_runtime.py",
    "phantom_qsha/qsha.py",
    "phantom_qsha/shadow_wire.py",
    "phantom_qsha/receipts.py",
    "phantom_qsha/vault.py",
]

# Binary outputs to verify
BINARY_OUTPUTS = [
    "phantom_native/zig/zig-out/lib/libphantom_native.a",
    "phantom_native/zig/zig-out/bin/phantom_swarm",
]

MANIFEST_FILE = "phantom_native/.manifest.json"
RECEIPT_CHAIN_FILE = "phantom_native/.receipt_chain.json"


class BuildManifest:
    """Generates and verifies QSHA manifests for the build pipeline."""

    def __init__(self, repo_root: Optional[str] = None):
        self.repo_root = Path(repo_root) if repo_root else self._find_repo_root()
        self.source_hashes: Dict[str, str] = {}
        self.binary_hashes: Dict[str, str] = {}
        self.manifest_root = ""
        self.timestamp = time.time()

    @staticmethod
    def _find_repo_root() -> Path:
        """Walk up to find repository root (contains phantom_native/)."""
        current = Path(__file__).parent.parent
        return current

    def generate_source_manifest(self) -> str:
        """Hash all source files and compute aggregate QSHA root."""
        self.source_hashes = {}
        for source_path in SOURCE_DIRS:
            full_path = self.repo_root / source_path
            if full_path.is_file():
                self._hash_file(full_path, source_path)
            elif full_path.is_dir():
                for f in sorted(full_path.rglob("*")):
                    if f.is_file() and not f.name.startswith("."):
                        rel = str(f.relative_to(self.repo_root))
                        self._hash_file(f, rel)

        # Compute aggregate root (includes paths for structural integrity)
        path_hashes = [
            qsha_hash(f"{path}:{h}".encode()) 
            for path, h in sorted(self.source_hashes.items())
        ]
        self.manifest_root = qsha_aggregate(path_hashes)
        return self.manifest_root

    def _hash_file(self, path: Path, rel_path: str) -> None:
        """QSHA-hash a single file."""
        data = path.read_bytes()
        self.source_hashes[rel_path] = qsha_hash(data)

    def verify_binary(self, binary_path: str) -> Optional[str]:
        """Hash a compiled binary for attestation."""
        full_path = self.repo_root / binary_path
        if not full_path.exists():
            return None
        data = full_path.read_bytes()
        h = qsha_hash(data)
        self.binary_hashes[binary_path] = h
        return h

    def verify_all_binaries(self) -> Dict[str, Optional[str]]:
        """Verify all expected binary outputs."""
        results = {}
        for bp in BINARY_OUTPUTS:
            results[bp] = self.verify_binary(bp)
        return results

    def save_manifest(self) -> str:
        """Save manifest to disk."""
        manifest = {
            "version": "0.2.0",
            "timestamp": self.timestamp,
            "source_root": self.manifest_root,
            "source_files": self.source_hashes,
            "binary_files": self.binary_hashes,
        }
        manifest_path = self.repo_root / MANIFEST_FILE
        manifest_path.write_text(json.dumps(manifest, indent=2))
        return str(manifest_path)

    def load_manifest(self) -> Optional[Dict]:
        """Load existing manifest from disk."""
        manifest_path = self.repo_root / MANIFEST_FILE
        if not manifest_path.exists():
            return None
        return json.loads(manifest_path.read_text())

    def create_audit_receipt(self) -> ExecutionReceipt:
        """Create an ExecutionReceipt linking source → binary."""
        commitment = qsha_aggregate(
            [self.manifest_root] + list(self.binary_hashes.values())
        )
        receipt = ExecutionReceipt(
            commitment=commitment,
            shadow_wire={"type": "build_attestation", "source_root": self.manifest_root},
            public_meta={
                "source_file_count": len(self.source_hashes),
                "binary_file_count": len(self.binary_hashes),
                "build_time": self.timestamp,
            },
        )
        return receipt

    def append_to_chain(self, receipt: ExecutionReceipt) -> None:
        """Append receipt to the ReceiptChain (append-only audit log)."""
        chain_path = self.repo_root / RECEIPT_CHAIN_FILE
        chain = []
        if chain_path.exists():
            chain = json.loads(chain_path.read_text())
        chain.append(receipt.to_dict())
        chain_path.write_text(json.dumps(chain, indent=2))


class ReceiptChain:
    """Append-only audit trail for build attestation."""

    def __init__(self, repo_root: Optional[str] = None):
        self.repo_root = Path(repo_root) if repo_root else Path(__file__).parent.parent
        self.chain_path = self.repo_root / RECEIPT_CHAIN_FILE

    def load(self) -> List[Dict]:
        """Load the full receipt chain."""
        if not self.chain_path.exists():
            return []
        return json.loads(self.chain_path.read_text())

    def verify_chain(self) -> bool:
        """Verify structural integrity of the chain."""
        chain = self.load()
        for entry in chain:
            if not entry.get("receipt_id") or not entry.get("commitment"):
                return False
        return True

    def latest(self) -> Optional[Dict]:
        """Get the most recent receipt."""
        chain = self.load()
        return chain[-1] if chain else None


def main():
    """CLI entry point."""
    if len(sys.argv) < 2:
        print("Usage: python -m phantom_native.manifest [generate|verify|audit]")
        sys.exit(1)

    command = sys.argv[1]
    manifest = BuildManifest()

    if command == "generate":
        root = manifest.generate_source_manifest()
        path = manifest.save_manifest()
        print(f"Source manifest generated: {root}")
        print(f"Saved to: {path}")
        print(f"Files hashed: {len(manifest.source_hashes)}")

    elif command == "verify":
        root = manifest.generate_source_manifest()
        binaries = manifest.verify_all_binaries()
        manifest.save_manifest()

        print(f"Source QSHA root: {root}")
        for bp, h in binaries.items():
            status = h if h else "NOT FOUND"
            print(f"  {bp}: {status}")

        # Create and store audit receipt
        receipt = manifest.create_audit_receipt()
        manifest.append_to_chain(receipt)
        print(f"\nAudit receipt: {receipt.receipt_id}")
        print(f"Commitment: {receipt.commitment}")

    elif command == "audit":
        chain = ReceiptChain()
        entries = chain.load()
        print(f"Receipt Chain: {len(entries)} entries")
        print(f"Chain valid: {chain.verify_chain()}")
        if entries:
            latest = entries[-1]
            print(f"Latest receipt: {latest['receipt_id']}")
            print(f"  Commitment: {latest['commitment']}")
            print(f"  Timestamp: {latest['timestamp']}")

    else:
        print(f"Unknown command: {command}")
        sys.exit(1)


if __name__ == "__main__":
    main()

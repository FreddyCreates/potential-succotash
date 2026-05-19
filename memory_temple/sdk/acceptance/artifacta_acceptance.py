"""
CIVOS-PRIME: ARTIFACTA Acceptance Tests
========================================

Acceptance tests for the ARTIFACTA contract.

Must prove:
1. Branch artifact emission works
2. Canon artifact emission requires authority
3. Artifact identity stays tied to status
4. Protocol and package emission works
"""

import unittest
from datetime import datetime

from ..contracts.artifacta import (
    Artifacta,
    EmitBranchRequest,
    EmitCanonRequest,
    EmitProtocolRequest,
    EmitPackageRequest,
)
from ..types.artifacts import (
    ArtifactClass,
    ArtifactFormat,
    EmissionStatus,
)
from ..types.lineage import BranchStatus


class ArtifactaAcceptanceTests(unittest.TestCase):
    """Acceptance tests for ARTIFACTA contract."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.artifacta = Artifacta()
    
    def test_emit_branch_artifact(self):
        """
        ACCEPTANCE: artifacta can emit branch artifacts.
        """
        result = self.artifacta.emit_branch(EmitBranchRequest(
            request_id="test-1",
            name="test-branch-artifact",
            format=ArtifactFormat.JSON,
            content=b'{"test": "data"}',
            metadata={"created_by": "test"},
        ))
        
        self.assertTrue(result.is_success())
        self.assertEqual(result.status, EmissionStatus.EMITTED)
        self.assertIsNotNone(result.artifact_id)
        self.assertIsNotNone(result.repo_path)
        self.assertIn("workstations", result.repo_path)
    
    def test_emit_canon_requires_authority(self):
        """
        ACCEPTANCE: Canon artifact emission requires authority token.
        """
        # Try without authority token
        result = self.artifacta.emit_canon(EmitCanonRequest(
            request_id="test-2",
            name="test-canon-artifact",
            format=ArtifactFormat.JSON,
            content=b'{"canon": "data"}',
            authority_token="",  # Empty token
        ))
        
        self.assertFalse(result.is_success())
        self.assertEqual(result.status, EmissionStatus.FAILED)
        self.assertIn("authority", result.error_message.lower())
        
        # Try with authority token
        result2 = self.artifacta.emit_canon(EmitCanonRequest(
            request_id="test-3",
            name="test-canon-artifact",
            format=ArtifactFormat.JSON,
            content=b'{"canon": "data"}',
            authority_token="valid-token",
        ))
        
        self.assertTrue(result2.is_success())
        self.assertIn("doctrine", result2.repo_path)
    
    def test_artifact_identity_tied_to_status(self):
        """
        ACCEPTANCE: Artifact identity stays tied to trunk-or-branch status.
        """
        # Emit branch artifact
        branch_result = self.artifacta.emit_branch(EmitBranchRequest(
            request_id="test-4",
            name="identity-test-branch",
            format=ArtifactFormat.MARKDOWN,
            content=b"# Branch Content",
        ))
        
        self.assertTrue(branch_result.is_success())
        
        # Retrieve and verify identity
        artifact = self.artifacta.get_artifact(branch_result.artifact_id)
        self.assertIsNotNone(artifact)
        self.assertEqual(artifact.identity.artifact_class, ArtifactClass.BRANCH)
        self.assertEqual(artifact.identity.branch_status, BranchStatus.BRANCH.value)
        
        # Validate identity consistency
        self.assertTrue(self.artifacta.validate_identity(artifact.identity))
        
        # Emit canon artifact
        canon_result = self.artifacta.emit_canon(EmitCanonRequest(
            request_id="test-5",
            name="identity-test-canon",
            format=ArtifactFormat.MARKDOWN,
            content=b"# Canon Content",
            authority_token="valid",
        ))
        
        self.assertTrue(canon_result.is_success())
        
        # Verify canon identity
        canon_artifact = self.artifacta.get_artifact(canon_result.artifact_id)
        self.assertEqual(canon_artifact.identity.artifact_class, ArtifactClass.CANON)
        self.assertEqual(canon_artifact.identity.branch_status, BranchStatus.TRUNK.value)
    
    def test_emit_protocol_artifact(self):
        """
        ACCEPTANCE: artifacta can emit protocol artifacts.
        """
        result = self.artifacta.emit_protocol(EmitProtocolRequest(
            request_id="test-6",
            name="test-protocol",
            protocol_id="PROTO-001",
            protocol_version="1.0.0",
            content=b"# Protocol Definition",
            capabilities=["read", "write", "transform"],
            dependencies=["base-protocol"],
            interface_schema={"input": "any", "output": "artifact"},
        ))
        
        self.assertTrue(result.is_success())
        self.assertEqual(result.artifact_id, "PROTO-001")
        self.assertIn("protocols", result.repo_path)
    
    def test_emit_package_artifact(self):
        """
        ACCEPTANCE: artifacta can emit package stubs.
        """
        result = self.artifacta.emit_package(EmitPackageRequest(
            request_id="test-7",
            package_name="test-package",
            package_version="1.0.0",
            entry_point="main.py",
            content=b'{"name": "test-package"}',
            dependencies={"python": ">=3.9"},
            build_config={"type": "python"},
        ))
        
        self.assertTrue(result.is_success())
        self.assertIn("packages", result.repo_path)
    
    def test_branch_and_canon_not_collapsed(self):
        """
        ACCEPTANCE: Branch and canon artifacts don't collapse their status.
        """
        # Emit both with same name
        branch = self.artifacta.emit_branch(EmitBranchRequest(
            request_id="test-8",
            name="same-name",
            format=ArtifactFormat.JSON,
            content=b'{"type": "branch"}',
        ))
        
        canon = self.artifacta.emit_canon(EmitCanonRequest(
            request_id="test-9",
            name="same-name",
            format=ArtifactFormat.JSON,
            content=b'{"type": "canon"}',
            authority_token="valid",
        ))
        
        self.assertTrue(branch.is_success())
        self.assertTrue(canon.is_success())
        
        # Different IDs
        self.assertNotEqual(branch.artifact_id, canon.artifact_id)
        
        # Different paths
        self.assertNotEqual(branch.repo_path, canon.repo_path)
        
        # Different statuses preserved
        branch_artifact = self.artifacta.get_artifact(branch.artifact_id)
        canon_artifact = self.artifacta.get_artifact(canon.artifact_id)
        
        self.assertEqual(branch_artifact.identity.branch_status, "branch")
        self.assertEqual(canon_artifact.identity.branch_status, "trunk")
    
    def test_manifest_generation(self):
        """
        ACCEPTANCE: Artifact manifest can be generated.
        """
        # Emit some artifacts
        for i in range(3):
            self.artifacta.emit_branch(EmitBranchRequest(
                request_id=f"manifest-{i}",
                name=f"manifest-test-{i}",
                format=ArtifactFormat.JSON,
                content=f'{{"index": {i}}}'.encode(),
            ))
        
        # Get manifest
        manifest = self.artifacta.get_manifest()
        
        self.assertIsNotNone(manifest)
        self.assertGreaterEqual(len(manifest.artifacts), 3)
        
        # Verify serialization
        manifest_dict = manifest.to_dict()
        self.assertIn("version", manifest_dict)
        self.assertIn("artifacts", manifest_dict)
        self.assertIn("artifact_count", manifest_dict)


def run_acceptance_tests():
    """Run all ARTIFACTA acceptance tests."""
    suite = unittest.TestLoader().loadTestsFromTestCase(ArtifactaAcceptanceTests)
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)


if __name__ == "__main__":
    run_acceptance_tests()

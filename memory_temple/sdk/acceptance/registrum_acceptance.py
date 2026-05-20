"""
CIVOS-PRIME: REGISTRUM Acceptance Tests
========================================

Acceptance tests for the REGISTRUM contract.

Must prove:
1. Registration works for engines, artifacts, adapters, bridges
2. Lookup retrieves registered entities
3. Duplicate drift is prevented
4. Dependencies are checked
"""

import unittest
from datetime import datetime

from ..contracts.registrum import (
    Registrum,
    RegisterRequest,
    LookupRequest,
    UnregisterRequest,
)
from ..types.registry import (
    RegistryEntityType,
    RegistryStatus,
    RegistryEntry,
    EngineRegistration,
    ArtifactRegistration,
    AdapterRegistration,
    BridgeRegistration,
)


class RegistrumAcceptanceTests(unittest.TestCase):
    """Acceptance tests for REGISTRUM contract."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.registrum = Registrum()
    
    def test_register_engine(self):
        """
        ACCEPTANCE: registrum can register engines.
        """
        registration = EngineRegistration(
            entry=RegistryEntry(
                id="engine-test-1",
                entity_type=RegistryEntityType.ENGINE,
                name="TestEngine",
                version="1.0.0",
                repo_path="engines/test-engine.py",
            ),
            input_types=["text", "json"],
            output_types=["json", "artifacts"],
            execution_mode="async",
        )
        
        result = self.registrum.register_engine(registration)
        
        self.assertTrue(result.success)
        self.assertEqual(result.entry_id, "engine-test-1")
        
        # Verify capabilities were added
        entry = self.registrum.index.lookup("engine-test-1")
        self.assertIn("input:text", entry.capabilities)
        self.assertIn("output:json", entry.capabilities)
    
    def test_register_artifact(self):
        """
        ACCEPTANCE: registrum can register artifacts.
        """
        registration = ArtifactRegistration(
            entry=RegistryEntry(
                id="artifact-test-1",
                entity_type=RegistryEntityType.ARTIFACT,
                name="TestArtifact",
                version="1.0.0",
                repo_path="artifacts/test.json",
            ),
            artifact_class="canon",
            content_type="application/json",
            schema_version="1.0.0",
            lineage_id="lineage-123",
        )
        
        result = self.registrum.register_artifact(registration)
        
        self.assertTrue(result.success)
        self.assertEqual(result.entry_id, "artifact-test-1")
    
    def test_register_adapter(self):
        """
        ACCEPTANCE: registrum can register adapters.
        """
        registration = AdapterRegistration(
            entry=RegistryEntry(
                id="adapter-test-1",
                entity_type=RegistryEntityType.ADAPTER,
                name="FilesystemAdapter",
                version="1.0.0",
                repo_path="adapters/filesystem.py",
            ),
            adapter_type="filesystem",
            supported_operations=["read", "write", "delete"],
            priority=10,
        )
        
        result = self.registrum.register_adapter(registration)
        
        self.assertTrue(result.success)
        
        # Verify capabilities
        entry = self.registrum.index.lookup("adapter-test-1")
        self.assertIn("read", entry.capabilities)
        self.assertIn("write", entry.capabilities)
    
    def test_register_bridge(self):
        """
        ACCEPTANCE: registrum can register bridges.
        """
        registration = BridgeRegistration(
            entry=RegistryEntry(
                id="bridge-test-1",
                entity_type=RegistryEntityType.BRIDGE,
                name="MemoryBridge",
                version="1.0.0",
                repo_path="bridges/memory.py",
            ),
            bridge_type="memory",
            source_surface="artifacta",
            target_surface="memoria",
            priority=5,
        )
        
        result = self.registrum.register_bridge(registration)
        
        self.assertTrue(result.success)
        
        # Verify capabilities
        entry = self.registrum.index.lookup("bridge-test-1")
        self.assertIn("source:artifacta", entry.capabilities)
        self.assertIn("target:memoria", entry.capabilities)
    
    def test_lookup_by_id(self):
        """
        ACCEPTANCE: registrum can lookup by ID.
        """
        # Register an entry
        entry = RegistryEntry(
            id="lookup-test-1",
            entity_type=RegistryEntityType.ENGINE,
            name="LookupTestEngine",
            version="1.0.0",
            repo_path="engines/lookup-test.py",
        )
        
        self.registrum.register(RegisterRequest(
            request_id="reg-1",
            entry=entry,
        ))
        
        # Lookup
        result = self.registrum.lookup(LookupRequest(
            request_id="lookup-1",
            lookup_type="by_id",
            query="lookup-test-1",
        ))
        
        self.assertTrue(result.success)
        self.assertEqual(len(result.entries), 1)
        self.assertEqual(result.entries[0].id, "lookup-test-1")
    
    def test_lookup_by_type(self):
        """
        ACCEPTANCE: registrum can lookup by type.
        """
        # Register multiple entries of same type
        for i in range(3):
            entry = RegistryEntry(
                id=f"type-test-{i}",
                entity_type=RegistryEntityType.ENGINE,
                name=f"TypeTestEngine{i}",
                version="1.0.0",
                repo_path=f"engines/type-test-{i}.py",
            )
            self.registrum.register(RegisterRequest(
                request_id=f"reg-{i}",
                entry=entry,
            ))
        
        # Lookup by type
        result = self.registrum.lookup(LookupRequest(
            request_id="lookup-2",
            lookup_type="by_type",
            query="engine",
        ))
        
        self.assertTrue(result.success)
        self.assertGreaterEqual(len(result.entries), 3)
    
    def test_lookup_by_capability(self):
        """
        ACCEPTANCE: registrum can lookup by capability.
        """
        # Register entry with specific capability
        entry = RegistryEntry(
            id="cap-test-1",
            entity_type=RegistryEntityType.ENGINE,
            name="CapabilityTestEngine",
            version="1.0.0",
            repo_path="engines/cap-test.py",
            capabilities=["special-capability", "rare-feature"],
        )
        
        self.registrum.register(RegisterRequest(
            request_id="reg-cap",
            entry=entry,
        ))
        
        # Lookup by capability
        result = self.registrum.lookup(LookupRequest(
            request_id="lookup-3",
            lookup_type="by_capability",
            query="special-capability",
        ))
        
        self.assertTrue(result.success)
        self.assertEqual(len(result.entries), 1)
        self.assertEqual(result.entries[0].id, "cap-test-1")
    
    def test_duplicate_prevention(self):
        """
        ACCEPTANCE: Discoverability without duplicate drift.
        """
        # Register first entry
        entry1 = RegistryEntry(
            id="dup-test-1",
            entity_type=RegistryEntityType.ENGINE,
            name="DuplicateTest",
            version="1.0.0",
            repo_path="engines/dup.py",
        )
        
        result1 = self.registrum.register(RegisterRequest(
            request_id="dup-reg-1",
            entry=entry1,
        ))
        
        self.assertTrue(result1.success)
        
        # Try to register duplicate
        entry2 = RegistryEntry(
            id="dup-test-2",  # Different ID but same name/version
            entity_type=RegistryEntityType.ENGINE,
            name="DuplicateTest",
            version="1.0.0",
            repo_path="engines/dup2.py",
        )
        
        result2 = self.registrum.register(RegisterRequest(
            request_id="dup-reg-2",
            entry=entry2,
            allow_update=False,
        ))
        
        self.assertFalse(result2.success)
        self.assertIn("duplicate", result2.error_message.lower())
    
    def test_dependency_checking(self):
        """
        ACCEPTANCE: Dependencies are checked during registration.
        """
        # Register entry with missing dependency
        entry = RegistryEntry(
            id="dep-test-1",
            entity_type=RegistryEntityType.ENGINE,
            name="DependentEngine",
            version="1.0.0",
            repo_path="engines/dependent.py",
            dependencies=["non-existent-dependency"],
        )
        
        result = self.registrum.register(RegisterRequest(
            request_id="dep-reg",
            entry=entry,
            check_dependencies=True,
        ))
        
        self.assertFalse(result.success)
        self.assertIn("non-existent-dependency", result.missing_dependencies)
    
    def test_manifest_generation(self):
        """
        ACCEPTANCE: Registry manifest can be generated.
        """
        # Register some entries
        for i in range(3):
            entry = RegistryEntry(
                id=f"manifest-test-{i}",
                entity_type=RegistryEntityType.ARTIFACT,
                name=f"ManifestTest{i}",
                version="1.0.0",
                repo_path=f"artifacts/manifest-{i}.json",
            )
            self.registrum.register(RegisterRequest(
                request_id=f"man-reg-{i}",
                entry=entry,
            ))
        
        # Get manifest
        manifest = self.registrum.get_manifest()
        
        self.assertIsNotNone(manifest)
        self.assertGreaterEqual(len(manifest.entries), 3)
        
        # Verify serialization
        manifest_dict = manifest.to_dict()
        self.assertIn("version", manifest_dict)
        self.assertIn("entries", manifest_dict)


def run_acceptance_tests():
    """Run all REGISTRUM acceptance tests."""
    suite = unittest.TestLoader().loadTestsFromTestCase(RegistrumAcceptanceTests)
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)


if __name__ == "__main__":
    run_acceptance_tests()

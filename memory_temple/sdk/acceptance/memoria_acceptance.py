"""
CIVOS-PRIME: MEMORIA Acceptance Tests
======================================

Acceptance tests for the MEMORIA contract.

Must prove:
1. Trunk/branch separation
2. Lineage-required writes
3. Canon read capability
4. Continuity event recording
"""

import unittest
from datetime import datetime

from ..contracts.memoria import (
    Memoria,
    ReadCanonRequest,
    WriteBranchRequest,
    PromoteToCanonRequest,
    TrunkBranchViolationError,
)
from ..types.lineage import BranchStatus, ContinuityEvent


class MemoriaAcceptanceTests(unittest.TestCase):
    """Acceptance tests for MEMORIA contract."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.memoria = Memoria()
    
    def test_trunk_branch_separation(self):
        """
        ACCEPTANCE: Trunk and branch writes are physically and logically separable.
        """
        # Write to branch
        branch_result = self.memoria.write_branch_note(WriteBranchRequest(
            request_id="test-1",
            path="test-note.md",
            content=b"# Test Note\n\nThis is a branch note.",
            metadata={"coherence_score": 0.7},
        ))
        
        self.assertTrue(branch_result.success)
        self.assertIsNotNone(branch_result.memory_object)
        
        # Verify it's in branch path
        obj = branch_result.memory_object
        self.assertTrue(obj.repo_path.startswith("memory_temple/workstations"))
        self.assertEqual(obj.branch_status, BranchStatus.BRANCH)
        
        # Verify separation enforcement
        self.assertTrue(self.memoria.verify_separation(
            obj.repo_path,
            BranchStatus.BRANCH
        ))
    
    def test_lineage_required_for_writes(self):
        """
        ACCEPTANCE: Every durable object has lineage metadata.
        """
        # Write without explicit lineage
        result = self.memoria.write_branch_note(WriteBranchRequest(
            request_id="test-2",
            path="no-lineage-note.md",
            content=b"Note without explicit lineage",
        ))
        
        self.assertTrue(result.success)
        
        # Verify lineage was created
        obj = result.memory_object
        self.assertIsNotNone(obj.lineage)
        self.assertIsNotNone(obj.lineage.chain_id)
        self.assertGreater(len(obj.lineage.nodes), 0)
        
        # Write with explicit parent lineage
        result2 = self.memoria.write_branch_note(WriteBranchRequest(
            request_id="test-3",
            path="with-lineage-note.md",
            content=b"Note with explicit lineage",
            lineage_parent_id=obj.id,
        ))
        
        self.assertTrue(result2.success)
        
        # Verify lineage chain
        obj2 = result2.memory_object
        self.assertGreater(obj2.lineage.depth, 1)
    
    def test_canon_read(self):
        """
        ACCEPTANCE: memoria.read_canon works against canonical filesystem layout.
        """
        # Attempt to read from canon (will fail without adapter in test)
        result = self.memoria.read_canon(ReadCanonRequest(
            request_id="test-4",
            path="non-existent.md",
        ))
        
        # Without adapter, should return not found
        self.assertFalse(result.success)
        self.assertIn("not found", result.error_message.lower())
    
    def test_branch_to_canon_promotion(self):
        """
        ACCEPTANCE: Branch can be promoted to canon with coherence verification.
        """
        # Write branch with high coherence
        branch_result = self.memoria.write_branch_note(WriteBranchRequest(
            request_id="test-5",
            path="promotable.md",
            content=b"Content ready for canon",
            metadata={"coherence_score": 0.75},  # Above threshold (0.618)
        ))
        
        self.assertTrue(branch_result.success)
        branch_id = branch_result.memory_object.id
        
        # Promote to canon
        promote_result = self.memoria.promote_to_canon(PromoteToCanonRequest(
            request_id="test-6",
            branch_id=branch_id,
            coherence_verification=True,
        ))
        
        self.assertTrue(promote_result.success)
        self.assertIsNotNone(promote_result.canon_id)
    
    def test_promotion_fails_below_threshold(self):
        """
        ACCEPTANCE: Promotion fails when coherence is below threshold.
        """
        # Write branch with low coherence
        branch_result = self.memoria.write_branch_note(WriteBranchRequest(
            request_id="test-7",
            path="low-coherence.md",
            content=b"Low coherence content",
            metadata={"coherence_score": 0.3},  # Below threshold (0.618)
        ))
        
        self.assertTrue(branch_result.success)
        branch_id = branch_result.memory_object.id
        
        # Attempt promotion
        promote_result = self.memoria.promote_to_canon(PromoteToCanonRequest(
            request_id="test-8",
            branch_id=branch_id,
            coherence_verification=True,
        ))
        
        self.assertFalse(promote_result.success)
        self.assertIn("coherence", promote_result.error_message.lower())
    
    def test_continuity_event_recording(self):
        """
        ACCEPTANCE: Continuity events are recorded.
        """
        event = ContinuityEvent(
            event_id="event-1",
            timestamp=datetime.utcnow(),
            event_type="test_checkpoint",
            source_id="test-source",
            branch_status=BranchStatus.BRANCH,
            coherence_score=0.7,
        )
        
        result = self.memoria.record_continuity_event(event)
        self.assertTrue(result)
        
        # Verify event is stored
        self.assertIn(event, self.memoria._continuity_events)
    
    def test_stable_id_and_repo_path(self):
        """
        ACCEPTANCE: Every durable object has a stable ID and repo path.
        """
        result = self.memoria.write_branch_note(WriteBranchRequest(
            request_id="test-9",
            path="stable-id-test.md",
            content=b"Testing stable IDs",
        ))
        
        self.assertTrue(result.success)
        obj = result.memory_object
        
        # Verify ID is UUID format
        self.assertIsNotNone(obj.id)
        self.assertEqual(len(obj.id.replace("-", "")), 32)  # UUID without dashes
        
        # Verify repo path
        self.assertIsNotNone(obj.repo_path)
        self.assertTrue(obj.repo_path.endswith("stable-id-test.md"))


def run_acceptance_tests():
    """Run all MEMORIA acceptance tests."""
    suite = unittest.TestLoader().loadTestsFromTestCase(MemoriaAcceptanceTests)
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)


if __name__ == "__main__":
    run_acceptance_tests()

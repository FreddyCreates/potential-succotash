"""
CIVOS-PRIME: NOVA Acceptance Tests
===================================

Acceptance tests for the NOVA contract.

Must prove:
1. Deterministic depth classification
2. Deterministic mode decisions with reasons
3. Delegation decisions respect authority
4. Runtime hierarchy is inspectable
"""

import unittest
from datetime import datetime

from ..contracts.nova import (
    Nova,
    ClassifyRequest,
    DecideModeRequest,
    DecideDelegationRequest,
)
from ..types.runtime import (
    TaskDepth,
    ExecutionMode,
    DelegationLevel,
    RuntimeAuthority,
    TaskClassification,
    ExecutionProfile,
    DelegationTarget,
)


class NovaAcceptanceTests(unittest.TestCase):
    """Acceptance tests for NOVA contract."""
    
    def setUp(self):
        """Set up test fixtures."""
        self.nova = Nova()
    
    def test_deterministic_depth_classification(self):
        """
        ACCEPTANCE: nova returns deterministic depth classification.
        """
        # Trivial task
        result1 = self.nova.classify_task(ClassifyRequest(
            request_id="test-1",
            task_id="task-trivial",
            task_description="Simple lookup",
            estimated_operations=5,
        ))
        
        self.assertTrue(result1.success)
        self.assertEqual(result1.classification.depth, TaskDepth.TRIVIAL)
        self.assertGreater(len(result1.classification.reasons), 0)
        
        # Shallow task
        result2 = self.nova.classify_task(ClassifyRequest(
            request_id="test-2",
            task_id="task-shallow",
            task_description="Small processing",
            estimated_operations=50,
        ))
        
        self.assertTrue(result2.success)
        self.assertEqual(result2.classification.depth, TaskDepth.SHALLOW)
        
        # Deep task
        result3 = self.nova.classify_task(ClassifyRequest(
            request_id="test-3",
            task_id="task-deep",
            task_description="Complex analysis",
            estimated_operations=5000,
        ))
        
        self.assertTrue(result3.success)
        self.assertEqual(result3.classification.depth, TaskDepth.DEEP)
        
        # Unbounded task
        result4 = self.nova.classify_task(ClassifyRequest(
            request_id="test-4",
            task_id="task-unbounded",
            task_description="Unknown completion time",
            estimated_operations=50000,
        ))
        
        self.assertTrue(result4.success)
        self.assertEqual(result4.classification.depth, TaskDepth.UNBOUNDED)
    
    def test_mode_decisions_with_reasons(self):
        """
        ACCEPTANCE: nova returns deterministic mode decisions with named reasons.
        """
        # Classify first
        classify_result = self.nova.classify_task(ClassifyRequest(
            request_id="test-5",
            task_id="task-mode",
            task_description="Test task for mode",
            estimated_operations=500,
        ))
        
        self.assertTrue(classify_result.success)
        
        # Get mode decision
        mode_result = self.nova.decide_mode(DecideModeRequest(
            request_id="test-6",
            classification=classify_result.classification,
        ))
        
        self.assertTrue(mode_result.success)
        self.assertIsNotNone(mode_result.decision)
        self.assertIsNotNone(mode_result.decision.selected_mode)
        
        # Must have reasons
        self.assertGreater(len(mode_result.decision.reasons), 0)
        
        # Must have profile
        self.assertIsNotNone(mode_result.decision.profile)
    
    def test_delegation_respects_authority(self):
        """
        ACCEPTANCE: Foundation-floor delegation cannot become speaking or canon authority.
        """
        # Register a foundation target
        foundation_target = DelegationTarget(
            target_id="foundation-worker",
            target_type="worker",
            authority_level=RuntimeAuthority.FOUNDATION,
            capabilities=["compute"],
            available=True,
        )
        self.nova.register_target(foundation_target)
        
        # Classify deep task
        classify_result = self.nova.classify_task(ClassifyRequest(
            request_id="test-7",
            task_id="task-delegate",
            task_description="Task needing delegation",
            estimated_operations=5000,
        ))
        
        # Get delegation decision
        delegation_result = self.nova.decide_delegation(DecideDelegationRequest(
            request_id="test-8",
            classification=classify_result.classification,
            available_targets=[foundation_target],
        ))
        
        self.assertTrue(delegation_result.success)
        
        # Check that foundation cannot get full delegation
        if delegation_result.decision.target:
            if delegation_result.decision.target.authority_level == RuntimeAuthority.FOUNDATION:
                # Should not be FULL level
                self.assertNotEqual(
                    delegation_result.decision.delegation_level,
                    DelegationLevel.FULL,
                    "Foundation floor cannot have full delegation"
                )
    
    def test_runtime_hierarchy_inspectable(self):
        """
        ACCEPTANCE: Runtime hierarchy is explicit and inspectable.
        """
        # Get hierarchy
        hierarchy = self.nova.get_hierarchy()
        
        self.assertIsNotNone(hierarchy)
        self.assertIsNotNone(hierarchy.hierarchy_id)
        
        # All authority levels should be present
        for authority in RuntimeAuthority:
            self.assertIn(authority, hierarchy.levels)
        
        # Laws should be present
        self.assertGreater(len(hierarchy.laws), 0)
        
        # Check specific laws
        law_ids = [law.law_id for law in hierarchy.laws]
        self.assertIn("law-no-canon-bypass", law_ids)
        self.assertIn("law-foundation-no-authority", law_ids)
    
    def test_law_enforcement(self):
        """
        ACCEPTANCE: Canonical writes cannot bypass MEMORIA through direct adapter calls.
        """
        # Test canon bypass law
        result = self.nova.check_law("law-no-canon-bypass", {
            "target": "canon",
            "source": "direct_adapter",
        })
        
        self.assertFalse(result, "Canon bypass should be blocked")
        
        # Test valid canon write through memoria
        result2 = self.nova.check_law("law-no-canon-bypass", {
            "target": "canon",
            "source": "memoria",
        })
        
        self.assertTrue(result2, "Canon write through memoria should be allowed")
        
        # Test foundation authority law
        result3 = self.nova.check_law("law-foundation-no-authority", {
            "authority": "foundation",
            "promotes_authority": True,
        })
        
        self.assertFalse(result3, "Foundation cannot gain authority")
    
    def test_execution_profiles(self):
        """
        ACCEPTANCE: Execution profiles are available and manageable.
        """
        # Get default profile
        default = self.nova.get_profile("default")
        self.assertIsNotNone(default)
        
        # Register custom profile
        custom = ExecutionProfile(
            profile_id="custom-test",
            name="Custom Test Profile",
            mode=ExecutionMode.ASYNC,
            timeout_ms=60000,
            max_memory_mb=1024,
        )
        
        result = self.nova.register_profile(custom)
        self.assertTrue(result)
        
        # Retrieve custom profile
        retrieved = self.nova.get_profile("custom-test")
        self.assertIsNotNone(retrieved)
        self.assertEqual(retrieved.timeout_ms, 60000)
    
    def test_runtime_state(self):
        """
        ACCEPTANCE: Runtime state is available.
        """
        state = self.nova.get_runtime_state()
        
        self.assertIsNotNone(state)
        self.assertIsNotNone(state.state_id)
        self.assertIsNotNone(state.timestamp)
        self.assertIsInstance(state.active_tasks, int)
        self.assertIsInstance(state.memory_usage_mb, float)
    
    def test_delegation_reasons_named(self):
        """
        ACCEPTANCE: Delegation decisions include named reasons.
        """
        # Create available targets
        target1 = DelegationTarget(
            target_id="worker-1",
            target_type="worker",
            authority_level=RuntimeAuthority.OBSERVER,
            capabilities=["compute"],
            current_load=0.3,
            available=True,
        )
        target2 = DelegationTarget(
            target_id="worker-2",
            target_type="worker",
            authority_level=RuntimeAuthority.OBSERVER,
            capabilities=["compute"],
            current_load=0.7,
            available=True,
        )
        
        # Classify a deep task
        classify_result = self.nova.classify_task(ClassifyRequest(
            request_id="test-9",
            task_id="task-reasons",
            task_description="Task for delegation",
            estimated_operations=8000,
        ))
        
        # Get delegation decision
        delegation_result = self.nova.decide_delegation(DecideDelegationRequest(
            request_id="test-10",
            classification=classify_result.classification,
            available_targets=[target1, target2],
        ))
        
        self.assertTrue(delegation_result.success)
        self.assertTrue(delegation_result.decision.should_delegate)
        
        # Must have named reasons
        self.assertGreater(len(delegation_result.decision.reasons), 0)
        
        # Check that lower load target was selected
        self.assertEqual(delegation_result.decision.target.target_id, "worker-1")


def run_acceptance_tests():
    """Run all NOVA acceptance tests."""
    suite = unittest.TestLoader().loadTestsFromTestCase(NovaAcceptanceTests)
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)


if __name__ == "__main__":
    run_acceptance_tests()

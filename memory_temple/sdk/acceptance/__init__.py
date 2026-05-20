"""
CIVOS-PRIME SDK Acceptance Tests
=================================

Acceptance test exports for the memory_temple SDK.
"""

from .memoria_acceptance import MemoriaAcceptanceTests, run_acceptance_tests as run_memoria_tests
from .registrum_acceptance import RegistrumAcceptanceTests, run_acceptance_tests as run_registrum_tests
from .artifacta_acceptance import ArtifactaAcceptanceTests, run_acceptance_tests as run_artifacta_tests
from .nova_acceptance import NovaAcceptanceTests, run_acceptance_tests as run_nova_tests


def run_all_acceptance_tests():
    """Run all acceptance tests."""
    import unittest
    
    loader = unittest.TestLoader()
    suite = unittest.TestSuite()
    
    suite.addTests(loader.loadTestsFromTestCase(MemoriaAcceptanceTests))
    suite.addTests(loader.loadTestsFromTestCase(RegistrumAcceptanceTests))
    suite.addTests(loader.loadTestsFromTestCase(ArtifactaAcceptanceTests))
    suite.addTests(loader.loadTestsFromTestCase(NovaAcceptanceTests))
    
    runner = unittest.TextTestRunner(verbosity=2)
    return runner.run(suite)


__all__ = [
    'MemoriaAcceptanceTests',
    'RegistrumAcceptanceTests',
    'ArtifactaAcceptanceTests',
    'NovaAcceptanceTests',
    'run_memoria_tests',
    'run_registrum_tests',
    'run_artifacta_tests',
    'run_nova_tests',
    'run_all_acceptance_tests',
]

"""
CIVOS-PRIME: Publication Bridge
================================

Third-priority bridge for publish-ready artifact expression.
Converged internal objects get clean upward path toward AURO-facing expression.

Expectations:
- converged internal objects -> publish-ready bodies
"""

from abc import ABC, abstractmethod
from dataclasses import dataclass, field
from datetime import datetime
from typing import Optional, List, Dict, Any
import uuid
import json


class PublicationBridgeError(Exception):
    """Base error for publication bridge operations."""
    pass


class PublicationError(PublicationBridgeError):
    """Raised when publication fails."""
    pass


@dataclass
class PublicationInput:
    """Input to publication bridge."""
    input_id: str
    artifact_id: str
    content: bytes
    content_type: str
    publication_target: str = "auro"  # auro, api, export
    version: str = "1.0.0"
    metadata: Dict[str, Any] = field(default_factory=dict)
    
    def __post_init__(self):
        if not self.input_id:
            self.input_id = str(uuid.uuid4())


@dataclass
class PublicationResult:
    """Result of publication bridge operation."""
    success: bool
    publication_id: Optional[str] = None
    published_path: Optional[str] = None
    public_body: Optional[bytes] = None
    error_message: Optional[str] = None
    timestamp: datetime = field(default_factory=datetime.utcnow)


@dataclass
class PublicationManifest:
    """Manifest for published artifacts."""
    version: str = "1.0.0"
    generated_at: datetime = field(default_factory=datetime.utcnow)
    publications: List[Dict[str, Any]] = field(default_factory=list)
    
    def add_publication(self, pub_id: str, artifact_id: str, target: str, path: str):
        """Add publication to manifest."""
        self.publications.append({
            'publication_id': pub_id,
            'artifact_id': artifact_id,
            'target': target,
            'path': path,
            'published_at': datetime.utcnow().isoformat(),
        })


class IPublicationBridge(ABC):
    """Publication bridge interface."""
    
    @abstractmethod
    def bridge_to_publication(self, input: PublicationInput) -> PublicationResult:
        """Bridge converged artifact to publication."""
        pass
    
    @abstractmethod
    def prepare_for_auro(self, content: bytes, content_type: str) -> bytes:
        """Prepare content for AURO-facing expression."""
        pass
    
    @abstractmethod
    def get_manifest(self) -> PublicationManifest:
        """Get publication manifest."""
        pass


class PublicationBridge(IPublicationBridge):
    """
    Publication Bridge Implementation.
    
    Third-priority bridge for publish-ready artifacts.
    """
    
    def __init__(self, filesystem_adapter=None):
        self.fs = filesystem_adapter
        self._manifest = PublicationManifest()
        self._publication_root = "memory_temple/terminals/publications"
    
    def bridge_to_publication(self, input: PublicationInput) -> PublicationResult:
        """Bridge converged artifact to publication."""
        try:
            # Prepare content for target
            if input.publication_target == "auro":
                public_body = self.prepare_for_auro(input.content, input.content_type)
            else:
                public_body = input.content
            
            # Generate publication ID
            pub_id = f"pub-{input.artifact_id}-{uuid.uuid4().hex[:8]}"
            
            # Determine path
            pub_path = f"{self._publication_root}/{input.publication_target}/{pub_id}"
            
            # Write if filesystem available
            if self.fs:
                write_result = self.fs.write(pub_path, public_body)
                
                if not write_result.success:
                    return PublicationResult(
                        success=False,
                        error_message=write_result.error_message,
                    )
            
            # Update manifest
            self._manifest.add_publication(
                pub_id=pub_id,
                artifact_id=input.artifact_id,
                target=input.publication_target,
                path=pub_path,
            )
            
            return PublicationResult(
                success=True,
                publication_id=pub_id,
                published_path=pub_path,
                public_body=public_body,
            )
            
        except Exception as e:
            return PublicationResult(
                success=False,
                error_message=str(e),
            )
    
    def prepare_for_auro(self, content: bytes, content_type: str) -> bytes:
        """Prepare content for AURO-facing expression."""
        # Add AURO wrapper
        wrapper = {
            'auro_version': '1.0.0',
            'content_type': content_type,
            'prepared_at': datetime.utcnow().isoformat(),
        }
        
        if content_type in ('application/json', 'json'):
            try:
                parsed = json.loads(content)
                wrapper['content'] = parsed
                return json.dumps(wrapper, indent=2).encode()
            except json.JSONDecodeError:
                pass
        
        # For non-JSON, use base64
        import base64
        wrapper['content_encoding'] = 'base64'
        wrapper['content'] = base64.b64encode(content).decode()
        
        return json.dumps(wrapper, indent=2).encode()
    
    def get_manifest(self) -> PublicationManifest:
        """Get publication manifest."""
        return self._manifest


# Export all
__all__ = [
    'PublicationBridgeError',
    'PublicationError',
    'PublicationInput',
    'PublicationResult',
    'PublicationManifest',
    'IPublicationBridge',
    'PublicationBridge',
]

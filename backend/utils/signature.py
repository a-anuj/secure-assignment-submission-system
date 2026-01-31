"""
Digital signature utilities using RSA and SHA-256.
Provides file integrity verification and non-repudiation.
"""
import hashlib
import base64
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.backends import default_backend


def generate_file_hash(file_data: bytes) -> str:
    """
    Generate SHA-256 hash of file for integrity verification.
    
    Security features:
    - SHA-256 cryptographic hash (256-bit)
    - Collision-resistant
    - Used as input for digital signatures
    
    Args:
        file_data: File bytes to hash
        
    Returns:
        Hexadecimal string representation of SHA-256 hash (64 characters)
    """
    sha256_hash = hashlib.sha256(file_data).hexdigest()
    return sha256_hash


def sign_hash(file_hash: str, private_key_pem: str) -> str:
    """
    Create digital signature of file hash using RSA private key.
    
    Signature flow:
    1. Faculty reviews and grades assignment
    2. File hash (SHA-256) is signed with faculty's private key
    3. Signature proves faculty graded this specific file
    4. Signature cannot be forged without private key
    
    Security features:
    - RSA-2048 signature
    - PSS padding for security
    - Non-repudiation (faculty cannot deny signing)
    - Integrity verification (detects file tampering)
    
    Args:
        file_hash: SHA-256 hash (hex string) to sign
        private_key_pem: RSA private key in PEM format
        
    Returns:
        Base64-encoded signature string
    """
    # Load private key
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode('utf-8'),
        password=None,
        backend=default_backend()
    )
    
    # Convert hex hash to bytes
    hash_bytes = bytes.fromhex(file_hash)
    
    # Sign the hash
    signature = private_key.sign(
        hash_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    
    # Encode signature to Base64 for storage
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    
    return signature_b64


def verify_signature(file_hash: str, signature_b64: str, public_key_pem: str) -> bool:
    """
    Verify digital signature using RSA public key.
    
    Verification flow:
    1. Student wants to verify faculty graded their assignment
    2. Signature is verified using faculty's public key
    3. If valid, proves faculty signed this specific file
    4. If invalid, signature is forged or file was tampered
    
    Args:
        file_hash: SHA-256 hash (hex string) that was signed
        signature_b64: Base64-encoded signature
        public_key_pem: RSA public key in PEM format
        
    Returns:
        True if signature is valid, False otherwise
    """
    try:
        # Load public key
        public_key = serialization.load_pem_public_key(
            public_key_pem.encode('utf-8'),
            backend=default_backend()
        )
        
        # Decode signature
        signature = base64.b64decode(signature_b64)
        
        # Convert hex hash to bytes
        hash_bytes = bytes.fromhex(file_hash)
        
        # Verify signature
        public_key.verify(
            signature,
            hash_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        return True
    except Exception:
        # Signature verification failed
        return False

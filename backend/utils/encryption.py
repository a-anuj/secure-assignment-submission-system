"""
Encryption utilities implementing hybrid encryption (RSA + AES).
Uses cryptography library for secure encryption operations.
"""
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.backends import default_backend
import os
import base64
from typing import Tuple


def generate_rsa_keypair() -> Tuple[str, str]:
    """
    Generate RSA-2048 key pair for encryption and signatures.
    
    Security features:
    - 2048-bit key size (industry standard)
    - Public exponent 65537 (standard)
    - Keys returned in PEM format for storage
    
    Returns:
        Tuple of (public_key_pem, private_key_pem) as strings
    """
    # Generate private key
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    # Get public key from private key
    public_key = private_key.public_key()
    
    # Serialize to PEM format
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()  # Not encrypted in DB (could add layer)
    ).decode('utf-8')
    
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return public_pem, private_pem


def encrypt_file_hybrid(file_data: bytes, public_key_pem: str) -> Tuple[bytes, str]:
    """
    Encrypt file using hybrid encryption (AES-256 + RSA).
    
    Encryption flow:
    1. Generate random AES-256 key
    2. Encrypt file with AES-256 (CBC mode)
    3. Encrypt AES key with RSA public key
    4. Return encrypted file and encrypted AES key
    
    Security features:
    - AES-256 for fast file encryption
    - RSA-2048 for secure key encryption
    - Random IV for each encryption
    - OAEP padding for RSA
    
    Args:
        file_data: Original file bytes
        public_key_pem: RSA public key in PEM format
        
    Returns:
        Tuple of (encrypted_file_bytes, encrypted_aes_key_base64)
    """
    # Generate random AES-256 key (32 bytes = 256 bits)
    aes_key = os.urandom(32)
    
    # Generate random IV (16 bytes for AES)
    iv = os.urandom(16)
    
    # Encrypt file with AES-256-CBC
    cipher = Cipher(
        algorithms.AES(aes_key),
        modes.CBC(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    # Pad file data to multiple of 16 bytes (AES block size)
    padding_length = 16 - (len(file_data) % 16)
    padded_data = file_data + bytes([padding_length] * padding_length)
    
    encrypted_file = encryptor.update(padded_data) + encryptor.finalize()
    
    # Prepend IV to encrypted file (needed for decryption)
    encrypted_file_with_iv = iv + encrypted_file
    
    # Load RSA public key
    public_key = serialization.load_pem_public_key(
        public_key_pem.encode('utf-8'),
        backend=default_backend()
    )
    
    # Encrypt AES key with RSA
    encrypted_aes_key = public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    # Encode encrypted AES key to Base64 for storage
    encrypted_aes_key_b64 = base64.b64encode(encrypted_aes_key).decode('utf-8')
    
    return encrypted_file_with_iv, encrypted_aes_key_b64


def decrypt_file_hybrid(encrypted_file: bytes, encrypted_aes_key_b64: str, private_key_pem: str) -> bytes:
    """
    Decrypt file using hybrid decryption (RSA + AES).
    
    Decryption flow:
    1. Decrypt AES key using RSA private key
    2. Extract IV from encrypted file
    3. Decrypt file with AES-256
    4. Remove padding and return original file
    
    Args:
        encrypted_file: Encrypted file bytes (with IV prepended)
        encrypted_aes_key_b64: Base64-encoded encrypted AES key
        private_key_pem: RSA private key in PEM format
        
    Returns:
        Original file bytes
    """
    # Load RSA private key
    private_key = serialization.load_pem_private_key(
        private_key_pem.encode('utf-8'),
        password=None,
        backend=default_backend()
    )
    
    # Decode and decrypt AES key
    encrypted_aes_key = base64.b64decode(encrypted_aes_key_b64)
    aes_key = private_key.decrypt(
        encrypted_aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    # Extract IV (first 16 bytes)
    iv = encrypted_file[:16]
    encrypted_data = encrypted_file[16:]
    
    # Decrypt file with AES
    cipher = Cipher(
        algorithms.AES(aes_key),
        modes.CBC(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()
    
    # Remove padding
    padding_length = decrypted_padded[-1]
    decrypted_data = decrypted_padded[:-padding_length]
    
    return decrypted_data

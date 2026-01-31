"""
Security utilities package.
"""
from .auth import hash_password, verify_password, create_access_token, verify_token
from .encryption import generate_rsa_keypair, encrypt_file_hybrid, decrypt_file_hybrid
from .signature import generate_file_hash, sign_hash, verify_signature
from .otp import generate_otp, send_otp_email
from .acl import require_role, require_permission, check_permission

__all__ = [
    "hash_password",
    "verify_password",
    "create_access_token",
    "verify_token",
    "generate_rsa_keypair",
    "encrypt_file_hybrid",
    "decrypt_file_hybrid",
    "generate_file_hash",
    "sign_hash",
    "verify_signature",
    "generate_otp",
    "send_otp_email",
    "require_role",
    "require_permission",
    "check_permission",
]

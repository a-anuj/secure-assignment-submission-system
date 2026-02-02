"""
User model with role-based access control.
Stores RSA keys for encryption and digital signatures.
"""
import uuid
from sqlalchemy import Column, String, Enum, DateTime, Text, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.sql import func
import enum
from database import Base


class UserRole(str, enum.Enum):
    """User role enumeration for RBAC."""
    STUDENT = "student"
    FACULTY = "faculty"
    ADMIN = "admin"


class User(Base):
    """
    User model with authentication and encryption key storage.
    
    Security features:
    - Password stored as bcrypt hash (never plaintext)
    - RSA public key for encryption (all users)
    - RSA private key for signatures (faculty only)
    - TOTP secret for MFA (RFC 6238 compliant)
    """
    __tablename__ = "users"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, nullable=False, index=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.STUDENT)
    
    # Security: Password hashed with bcrypt
    password_hash = Column(String(255), nullable=False)
    
    # Encryption: RSA keys stored in PEM format
    public_key_pem = Column(Text, nullable=False)
    private_key_pem = Column(Text, nullable=True)  # Only for faculty (for signing)
    
    # TOTP MFA: RFC 6238 compliant Time-based One-Time Password
    totp_secret = Column(String(32), nullable=True)  # Base32 encoded secret
    mfa_enabled = Column(Boolean, nullable=False, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    def __repr__(self):
        return f"<User {self.email} ({self.role})>"

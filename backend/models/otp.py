"""
OTP model for multi-factor authentication.
OTPs are time-limited and single-use.
"""
import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, Boolean
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class OTP(Base):
    """
    One-Time Password model for MFA.
    
    Security features:
    - 6-digit numeric code
    - Time-limited (5 minutes default)
    - Single-use (marked as used after verification)
    - User-specific
    
    MFA Flow:
    1. User logs in with password
    2. OTP generated and logged to console (simulating email)
    3. User enters OTP
    4. OTP verified and marked as used
    5. Access token issued
    """
    __tablename__ = "otp"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # OTP code (6-digit numeric)
    otp_code = Column(String(6), nullable=False)
    
    # Expiry and usage tracking
    expiry_timestamp = Column(DateTime(timezone=True), nullable=False)
    is_used = Column(Boolean, default=False, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    user = relationship("User", foreign_keys=[user_id])
    
    def __repr__(self):
        return f"<OTP for user {self.user_id}, used={self.is_used}>"

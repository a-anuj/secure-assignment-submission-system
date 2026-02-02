"""
Authentication-related Pydantic schemas.
"""
from pydantic import BaseModel, EmailStr
from typing import Optional


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    requires_otp: bool = False
    requires_totp: bool = False  # TOTP MFA required


class OTPVerifyRequest(BaseModel):
    """Schema for OTP verification."""
    email: EmailStr
    otp_code: str


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh."""
    refresh_token: str


class TOTPEnrollRequest(BaseModel):
    """Schema for initiating TOTP enrollment (after password login)."""
    email: EmailStr


class TOTPEnrollResponse(BaseModel):
    """Schema for TOTP enrollment with QR code."""
    qr_code: str  # Base64 encoded QR code image
    secret: str  # Base32 encoded secret (for backup)
    message: str = "Scan the QR code with your authenticator app and confirm with your first OTP"


class TOTPVerifyRequest(BaseModel):
    """Schema for TOTP code verification during enrollment or login."""
    email: EmailStr
    totp_code: str  # 6-digit code from authenticator app


class MFAStatusResponse(BaseModel):
    """Schema for MFA enrollment status."""
    mfa_enabled: bool
    message: str

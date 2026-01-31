"""
Authentication-related Pydantic schemas.
"""
from pydantic import BaseModel, EmailStr


class TokenResponse(BaseModel):
    """Schema for JWT token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_id: str
    role: str
    requires_otp: bool = False


class OTPVerifyRequest(BaseModel):
    """Schema for OTP verification."""
    email: EmailStr
    otp_code: str


class RefreshTokenRequest(BaseModel):
    """Schema for token refresh."""
    refresh_token: str

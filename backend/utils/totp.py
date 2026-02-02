"""
TOTP utilities for RFC 6238 compliant Time-based One-Time Password MFA.
Uses pyotp library for TOTP generation and verification.
"""
import pyotp
import qrcode
from io import BytesIO
import base64
from typing import Optional, Tuple
from config import settings


def generate_totp_secret() -> str:
    """
    Generate a random TOTP secret using base32 encoding.
    
    Security features:
    - Uses cryptographically secure random generation
    - Base32 encoded for QR code compatibility
    - Sufficient entropy for 6-digit TOTP codes
    
    Returns:
        Base32 encoded TOTP secret (32 characters)
    """
    return pyotp.random_base32()


def get_totp_provisioning_uri(
    email: str,
    secret: str,
    issuer: str = "SecureAssignmentSystem"
) -> str:
    """
    Generate OTPAuth provisioning URI for QR code generation.
    
    RFC 6238 Standard Format:
    otpauth://totp/SecureAssignmentSystem:email@example.com?secret=BASE32SECRET&issuer=SecureAssignmentSystem
    
    Args:
        email: User's email address (account identifier)
        secret: Base32 encoded TOTP secret
        issuer: Issuer name to display in authenticator app
        
    Returns:
        OTPAuth URI string suitable for QR code generation
    """
    totp = pyotp.TOTP(secret)
    uri = totp.provisioning_uri(
        name=email,
        issuer_name=issuer
    )
    return uri


def generate_qr_code(provisioning_uri: str) -> str:
    """
    Generate QR code image for TOTP provisioning URI.
    
    Returns Base64 encoded PNG image that can be displayed directly in browser.
    
    Args:
        provisioning_uri: OTPAuth provisioning URI
        
    Returns:
        Base64 encoded PNG image as data URL ready for HTML <img> tag
    """
    qr = qrcode.QRCode(
        version=1,
        error_correction=qrcode.constants.ERROR_CORRECT_L,
        box_size=10,
        border=4,
    )
    qr.add_data(provisioning_uri)
    qr.make(fit=True)
    
    # Generate PIL image
    img = qr.make_image(fill_color="black", back_color="white")
    
    # Convert to bytes
    buffer = BytesIO()
    img.save(buffer, format="PNG")
    img_str = base64.b64encode(buffer.getvalue()).decode()
    
    # Return as data URL for direct HTML embedding
    return f"data:image/png;base64,{img_str}"


def verify_totp_code(secret: str, code: str, window: int = 1) -> bool:
    """
    Verify a TOTP code against the secret.
    
    Security features:
    - RFC 6238 compliant with 30-second time step
    - ±30 second time window tolerance for clock drift
    - Prevents acceptance of already-used codes (when implemented with database)
    
    Args:
        secret: Base32 encoded TOTP secret
        code: 6-digit code from authenticator app (string)
        window: Time window in steps (±30 sec per step). Default 1 = ±30 seconds
        
    Returns:
        True if code is valid, False otherwise
    """
    try:
        totp = pyotp.TOTP(secret)
        # verify() checks current time ± window
        return totp.verify(code, valid_window=window)
    except Exception:
        return False


def get_current_totp_code(secret: str) -> str:
    """
    Get the current valid TOTP code (for testing/debugging only).
    
    WARNING: This should only be used for testing. Never expose this in production.
    
    Args:
        secret: Base32 encoded TOTP secret
        
    Returns:
        Current 6-digit TOTP code as string
    """
    totp = pyotp.TOTP(secret)
    return totp.now()

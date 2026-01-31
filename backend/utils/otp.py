"""
OTP (One-Time Password) utilities for multi-factor authentication.
Simulates email sending by logging to console.
"""
import random
import string
from datetime import datetime, timedelta, timezone
from config import settings


def generate_otp() -> str:
    """
    Generate a 6-digit numeric OTP.
    
    Security features:
    - 6 digits (1,000,000 combinations)
    - Random generation
    - Time-limited (5 minutes default)
    - Single-use
    
    Returns:
        6-digit OTP string
    """
    return ''.join(random.choices(string.digits, k=6))


def send_otp_email(email: str, otp: str, expiry: datetime) -> None:
    """
    Simulate sending OTP via email.
    
    In production, this would integrate with an email service like:
    - SendGrid
    - AWS SES
    - Mailgun
    - SMTP
    
    For development/testing, we log the OTP to console.
    
    Args:
        email: Recipient email address
        otp: 6-digit OTP code
        expiry: OTP expiration timestamp
    """
    print("\n" + "="*60)
    print("📧 [SIMULATED EMAIL - OTP]")
    print("="*60)
    print(f"To: {email}")
    print(f"Subject: Your Login OTP Code")
    print(f"\nYour OTP code is: {otp}")
    print(f"This code will expire at: {expiry.strftime('%Y-%m-%d %H:%M:%S UTC')}")
    print(f"Valid for: {settings.OTP_EXPIRE_MINUTES} minutes")
    print("="*60 + "\n")


def get_otp_expiry() -> datetime:
    """
    Calculate OTP expiration timestamp.
    
    Returns:
        UTC datetime for OTP expiry (timezone-aware)
    """
    return datetime.now(timezone.utc) + timedelta(minutes=settings.OTP_EXPIRE_MINUTES)


def is_otp_expired(expiry: datetime) -> bool:
    """
    Check if OTP has expired.
    
    Args:
        expiry: OTP expiration timestamp (timezone-aware)
        
    Returns:
        True if expired, False if still valid
    """
    return datetime.now(timezone.utc) > expiry

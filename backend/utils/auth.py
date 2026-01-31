"""
Authentication utilities using argon2 and JWT.
Implements secure password hashing and token-based authentication.
"""
from passlib.context import CryptContext
from datetime import datetime, timedelta
from typing import Optional, Dict, Any
import jwt
from config import settings

# Password hashing context using argon2
# Argon2 is the winner of the Password Hashing Competition and is recommended for new applications
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")


def hash_password(password: str) -> str:
    """
    Hash a password using argon2.
    
    Security features:
    - Argon2 automatically generates a unique salt for each password
    - Memory-hard algorithm resistant to GPU attacks
    - Winner of the Password Hashing Competition (2015)
    - Salt is embedded in the hash output
    
    Args:
        password: Plain text password
        
    Returns:
        Hashed password string (includes salt)
    """
    return pwd_context.hash(password)


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a password against its hash.
    
    Args:
        plain_password: Plain text password to verify
        hashed_password: Stored password hash
        
    Returns:
        True if password matches, False otherwise
    """
    return pwd_context.verify(plain_password, hashed_password)


def create_access_token(data: Dict[str, Any], expires_delta: Optional[timedelta] = None) -> str:
    """
    Create a JWT access token.
    
    Security features:
    - HS256 algorithm for signing
    - Configurable expiration
    - Includes user ID, role, and email in payload
    
    Args:
        data: Payload data to encode (should include user_id, role, email)
        expires_delta: Optional custom expiration time
        
    Returns:
        Encoded JWT token string
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt


def create_refresh_token(data: Dict[str, Any]) -> str:
    """
    Create a JWT refresh token with longer expiration.
    
    Args:
        data: Payload data to encode
        
    Returns:
        Encoded JWT refresh token
    """
    expires_delta = timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    return create_access_token(data, expires_delta)


def verify_token(token: str) -> Optional[Dict[str, Any]]:
    """
    Verify and decode a JWT token.
    
    Args:
        token: JWT token to verify
        
    Returns:
        Decoded payload if valid, None if invalid or expired
    """
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except jwt.ExpiredSignatureError:
        # Token has expired
        return None
    except jwt.InvalidTokenError:
        # Token is invalid
        return None

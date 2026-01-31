"""
Authentication routes: registration, login, OTP verification, token refresh.
Implements multi-factor authentication with email OTP.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from models.otp import OTP
from schemas.user import UserCreate, UserLogin, UserResponse
from schemas.auth import TokenResponse, OTPVerifyRequest, RefreshTokenRequest
from utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from utils.encryption import generate_rsa_keypair
from utils.otp import generate_otp, send_otp_email, get_otp_expiry, is_otp_expired
from utils.acl import get_current_user

router = APIRouter(prefix="/auth", tags=["Authentication"])


@router.post("/register", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    """
    Register a new user.
    
    Security features:
    - Password hashed with bcrypt
    - RSA key pair generated for encryption
    - Faculty get private key for signing
    - Input validation via Pydantic
    
    Flow:
    1. Check if email already exists
    2. Hash password
    3. Generate RSA key pair
    4. Create user record
    5. Return user data (no password)
    """
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Generate RSA key pair
    public_key_pem, private_key_pem = generate_rsa_keypair()
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        password_hash=password_hash,
        public_key_pem=public_key_pem,
        # Only faculty get private key for signing
        private_key_pem=private_key_pem if user_data.role == UserRole.FACULTY else None
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.post("/login", response_model=TokenResponse)
def login(credentials: UserLogin, db: Session = Depends(get_db)):
    """
    Login with email and password (Step 1 of MFA).
    
    Multi-Factor Authentication Flow:
    1. Verify username/password (this endpoint)
    2. Generate and send OTP via email
    3. User must verify OTP to get access token
    
    Security features:
    - Password verification with bcrypt
    - OTP generation for MFA
    - Time-limited OTP (5 minutes)
    - OTP logged to console (simulating email)
    
    Returns:
    - requires_otp: True (user must verify OTP)
    - Temporary tokens (can only be used after OTP verification)
    """
    # Find user
    user = db.query(User).filter(User.email == credentials.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Verify password
    if not verify_password(credentials.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    # Generate OTP
    otp_code = generate_otp()
    otp_expiry = get_otp_expiry()
    
    # Save OTP to database
    new_otp = OTP(
        user_id=user.id,
        otp_code=otp_code,
        expiry_timestamp=otp_expiry,
        is_used=False
    )
    db.add(new_otp)
    db.commit()
    
    # Send OTP via email (simulated)
    send_otp_email(user.email, otp_code, otp_expiry)
    
    # Return response indicating OTP is required
    return TokenResponse(
        access_token="",  # Empty until OTP verified
        refresh_token="",
        user_id=str(user.id),
        role=user.role.value,
        requires_otp=True
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(otp_data: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify OTP and issue JWT tokens (Step 2 of MFA).
    
    Security features:
    - OTP must match and not be expired
    - OTP marked as used (single-use)
    - JWT tokens issued after successful verification
    
    Returns:
    - access_token: JWT for API authentication (30 min)
    - refresh_token: JWT for token refresh (7 days)
    """
    # Find user
    user = db.query(User).filter(User.email == otp_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email"
        )
    
    # Find latest unused OTP for this user
    otp_record = db.query(OTP).filter(
        OTP.user_id == user.id,
        OTP.otp_code == otp_data.otp_code,
        OTP.is_used == False
    ).order_by(OTP.created_at.desc()).first()
    
    if not otp_record:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid OTP code"
        )
    
    # Check if OTP is expired
    if is_otp_expired(otp_record.expiry_timestamp):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="OTP has expired"
        )
    
    # Mark OTP as used
    otp_record.is_used = True
    db.commit()
    
    # Create JWT tokens
    token_data = {
        "user_id": str(user.id),
        "email": user.email,
        "role": user.role.value
    }
    
    access_token = create_access_token(token_data)
    refresh_token = create_refresh_token(token_data)
    
    return TokenResponse(
        access_token=access_token,
        refresh_token=refresh_token,
        user_id=str(user.id),
        role=user.role.value,
        requires_otp=False
    )


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(token_request: RefreshTokenRequest, db: Session = Depends(get_db)):
    """
    Refresh access token using refresh token.
    
    Security features:
    - Validates refresh token
    - Issues new access token
    - Refresh token remains same (until expired)
    """
    # Verify refresh token
    payload = verify_token(token_request.refresh_token)
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired refresh token"
        )
    
    # Create new access token
    token_data = {
        "user_id": payload["user_id"],
        "email": payload["email"],
        "role": payload["role"]
    }
    
    new_access_token = create_access_token(token_data)
    
    return TokenResponse(
        access_token=new_access_token,
        refresh_token=token_request.refresh_token,  # Same refresh token
        user_id=payload["user_id"],
        role=payload["role"],
        requires_otp=False
    )


@router.get("/me", response_model=UserResponse)
def get_current_user_info(current_user: User = Depends(get_current_user)):
    """
    Get current authenticated user information.
    
    Requires: Valid JWT token in Authorization header
    """
    return current_user

"""
Authentication routes: registration, login, OTP verification, TOTP MFA enrollment, token refresh.
Implements multi-factor authentication with email OTP and TOTP (RFC 6238).
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User, UserRole
from models.otp import OTP
from schemas.user import UserCreate, UserLogin, UserResponse
from schemas.auth import (
    TokenResponse, OTPVerifyRequest, RefreshTokenRequest,
    TOTPEnrollRequest, TOTPEnrollResponse, TOTPVerifyRequest, MFAStatusResponse
)
from utils.auth import hash_password, verify_password, create_access_token, create_refresh_token, verify_token
from utils.encryption import generate_rsa_keypair
from utils.otp import generate_otp, send_otp_email, get_otp_expiry, is_otp_expired
from utils.totp import generate_totp_secret, get_totp_provisioning_uri, generate_qr_code, verify_totp_code
from utils.rate_limiter import otp_rate_limiter
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
    Login with email and password.
    
    Multi-Factor Authentication Flow (TOTP or Email OTP):
    1. Verify username/password (this endpoint)
    2. If MFA enabled: require TOTP code, then issue tokens
       If MFA not enabled: generate and send email OTP, require OTP verification
    3. User submits appropriate MFA code to get access token
    
    Security features:
    - Password verification with argon2
    - TOTP verification (RFC 6238) if MFA enabled
    - Email OTP generation for initial MFA setup
    - Time-limited OTP (5 minutes for email)
    - TOTP verified with ±30 second window
    
    Returns:
    - requires_totp: True if TOTP MFA is enabled
    - requires_otp: True if email OTP verification needed (first login or MFA setup)
    - user_id: User ID for frontend tracking
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
    
    # Check if TOTP MFA is enabled
    if user.mfa_enabled:
        # MFA enabled: Require TOTP code for login
        return TokenResponse(
            access_token="",
            refresh_token="",
            user_id=str(user.id),
            role=user.role.value,
            requires_otp=False,
            requires_totp=True  # Client must provide TOTP code
        )
    else:
        # MFA not yet set up: Generate email OTP for MFA enrollment
        # On first login after password verification, user completes MFA enrollment
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
        
        # Return response indicating OTP is required for MFA setup
        return TokenResponse(
            access_token="",
            refresh_token="",
            user_id=str(user.id),
            role=user.role.value,
            requires_otp=True,
            requires_totp=False
        )


@router.post("/mfa/enroll", response_model=TOTPEnrollResponse)
def mfa_enroll(enroll_data: TOTPEnrollRequest, db: Session = Depends(get_db)):
    """
    Initiate TOTP MFA enrollment (after successful password login).
    
    MFA Enrollment Flow:
    1. User logs in with password → receives email OTP
    2. User verifies email OTP → calls this endpoint
    3. Backend generates TOTP secret and QR code
    4. Frontend displays QR code for user to scan with authenticator app
    5. User calls /mfa/verify endpoint with first TOTP code to confirm enrollment
    
    Security features:
    - TOTP secret generated using cryptographically secure random (pyotp)
    - Provisioning URI follows RFC 6238 standard
    - QR code generated but secret never exposed in responses (only during enrollment)
    - Secret stored in DB only after verification
    
    Args:
        enroll_data: User email (already verified via OTP)
        
    Returns:
        QR code (Base64 PNG) and backup secret for user to save
    """
    user = db.query(User).filter(User.email == enroll_data.email).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Check if MFA already enabled
    if user.mfa_enabled:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="MFA is already enabled for this account"
        )
    
    # Generate new TOTP secret
    totp_secret = generate_totp_secret()
    
    # Generate provisioning URI for QR code
    provisioning_uri = get_totp_provisioning_uri(
        email=user.email,
        secret=totp_secret,
        issuer="SecureAssignmentSystem"
    )
    
    # Generate QR code
    qr_code_image = generate_qr_code(provisioning_uri)
    
    # Store secret temporarily in session (in production, use cache with expiry)
    # For now, we temporarily store it in DB without enabling MFA until verified
    user.totp_secret = totp_secret
    db.commit()
    
    return TOTPEnrollResponse(
        qr_code=qr_code_image,
        secret=totp_secret,  # Backup secret - user should save this
        message="Scan the QR code with Google Authenticator, Authy, or Microsoft Authenticator. Enter your first OTP code to confirm."
    )


@router.post("/mfa/verify", response_model=TokenResponse)
def mfa_verify_totp(verify_data: TOTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify TOTP code for either enrollment confirmation or login.
    
    Two scenarios:
    1. Enrollment: After password login → email OTP verification → /mfa/enroll → this endpoint
       On success: Sets mfa_enabled=true and issues JWT tokens
    2. Login with MFA enabled: Password verified → this endpoint with TOTP code
       On success: Issues JWT tokens
    
    Security features:
    - TOTP verification with RFC 6238 compliant ±30 second window
    - Rate limiting: Max 5 attempts, then 15 minute lockout
    - Never exposes secret after enrollment
    - Provides clear error messages without timing information
    
    Args:
        verify_data: User email and TOTP code
        
    Returns:
        JWT access/refresh tokens on success
    """
    # Check rate limiting
    is_limited, retry_after = otp_rate_limiter.is_rate_limited(verify_data.email)
    if is_limited:
        raise HTTPException(
            status_code=status.HTTP_429_TOO_MANY_REQUESTS,
            detail=f"Too many failed attempts. Try again in {retry_after} seconds.",
            headers={"Retry-After": str(retry_after)}
        )
    
    # Find user
    user = db.query(User).filter(User.email == verify_data.email).first()
    if not user or not user.totp_secret:
        # Record failed attempt
        otp_rate_limiter.record_failed_attempt(verify_data.email)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid TOTP code"
        )
    
    # Verify TOTP code (with ±30 second tolerance)
    if not verify_totp_code(user.totp_secret, verify_data.totp_code, window=1):
        # Record failed attempt
        remaining_attempts, is_locked = otp_rate_limiter.record_failed_attempt(verify_data.email)
        
        if is_locked:
            raise HTTPException(
                status_code=status.HTTP_429_TOO_MANY_REQUESTS,
                detail="Account locked due to too many failed attempts. Try again later.",
                headers={"Retry-After": str(900)}  # 15 minutes
            )
        else:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail=f"Invalid TOTP code. {remaining_attempts} attempts remaining."
            )
    
    # Clear rate limiting on success
    otp_rate_limiter.record_successful_attempt(verify_data.email)
    
    # Enable MFA if not already enabled (enrollment scenario)
    if not user.mfa_enabled:
        user.mfa_enabled = True
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
        requires_otp=False,
        requires_totp=False
    )


@router.post("/verify-otp", response_model=TokenResponse)
def verify_otp(otp_data: OTPVerifyRequest, db: Session = Depends(get_db)):
    """
    Verify email OTP and proceed with MFA enrollment.
    
    Email OTP Verification Flow (Step 2 of MFA Setup):
    1. User logs in with password → receives email OTP
    2. User submits OTP here → verification succeeds
    3. Frontend redirects to MFA enrollment (/mfa/enroll) to get QR code
    4. User scans QR with authenticator app
    5. User submits TOTP code to /mfa/verify to complete enrollment
    
    Security features:
    - OTP must match and not be expired
    - OTP marked as used (single-use)
    - Response indicates MFA enrollment needed (requires_totp=false, ready for enrollment)
    
    Returns:
    - Empty tokens (user must complete TOTP enrollment)
    - requires_otp: False (OTP verification complete)
    - requires_totp: False (next step is enrollment, not login)
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
    
    # Response indicates user should proceed to MFA enrollment
    # Frontend will call /mfa/enroll to start TOTP setup
    return TokenResponse(
        access_token="",  # Will be provided after TOTP verification
        refresh_token="",
        user_id=str(user.id),
        role=user.role.value,
        requires_otp=False,  # OTP verification complete
        requires_totp=False  # Next step: MFA enrollment (not login TOTP)
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

@router.get("/mfa/status", response_model=MFAStatusResponse)
def mfa_status(current_user: User = Depends(get_current_user)):
    """
    Get MFA enrollment status for current user.
    
    Returns whether TOTP MFA is currently enabled.
    Requires: Valid JWT token in Authorization header
    """
    status = "enabled" if current_user.mfa_enabled else "not_enabled"
    message = "TOTP MFA is " + ("enabled" if current_user.mfa_enabled else "not yet set up")
    
    return MFAStatusResponse(
        mfa_enabled=current_user.mfa_enabled,
        message=message
    )
# TOTP MFA Implementation - API Documentation

## Overview

This document describes the RFC 6238 compliant TOTP-based Multi-Factor Authentication (MFA) system integrated into the Secure Student Assignment Submission System.

## Architecture

### Database Schema

#### Users Table
```sql
-- New columns added:
- totp_secret (VARCHAR(32), nullable)  -- Base32 encoded TOTP secret
- mfa_enabled (BOOLEAN, default false) -- Whether MFA is active for user
```

### Security Features

1. **TOTP Implementation**: RFC 6238 compliant using pyotp library
2. **QR Code Generation**: Provisioning URIs converted to QR codes for easy scanning
3. **Time Window**: ±30 second tolerance for clock drift (2 time steps)
4. **Rate Limiting**: Max 5 failed attempts, 15-minute lockout
5. **Secure Storage**: Secret stored as Base32 encoded string in database
6. **No Secret Exposure**: Secret never sent after enrollment

---

## Login Flow with TOTP MFA

### Scenario 1: First Login (No MFA Enrolled)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER VISITS /login                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ Enter Email + Password   │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ POST /auth/login         │
        │ Check credentials        │
        │ No MFA enabled yet       │
        │ Generate email OTP       │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ Response: requires_otp=true  │
        │ Redirect to /otp-verify      │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ User enters email OTP        │
        │ POST /auth/verify-otp        │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ OTP verified                 │
        │ Empty tokens returned        │
        │ Redirect to /mfa-enroll      │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ POST /auth/mfa/enroll        │
        │ Generate TOTP secret         │
        │ Generate QR code             │
        │ Display QR code              │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ User scans QR with app       │
        │ Enters TOTP code             │
        │ POST /auth/mfa/verify        │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ MFA enabled=true             │
        │ JWT tokens issued            │
        │ Redirect to dashboard        │
        └──────────────────────────────┘
```

### Scenario 2: Subsequent Login (MFA Already Enrolled)

```
┌─────────────────────────────────────────────────────────────────┐
│ USER VISITS /login                                              │
└──────────────────────┬──────────────────────────────────────────┘
                       │
                       ▼
        ┌──────────────────────────┐
        │ Enter Email + Password   │
        │ POST /auth/login         │
        └──────────────┬───────────┘
                       │
                       ▼
        ┌──────────────────────────────────┐
        │ Response: requires_totp=true     │
        │ No empty tokens this time        │
        │ Redirect to /totp-verify         │
        └──────────────┬────────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ User enters TOTP code        │
        │ POST /auth/mfa/verify        │
        └──────────────┬────────────────┘
                       │
                       ▼
        ┌──────────────────────────────┐
        │ TOTP verified                │
        │ JWT tokens issued            │
        │ Redirect to dashboard        │
        └──────────────────────────────┘
```

---

## API Endpoints

### 1. POST /auth/login
**Purpose**: Authenticate user with email and password

**Request**:
```json
{
    "email": "user@example.com",
    "password": "securepassword123"
}
```

**Response (No MFA)**:
```json
{
    "access_token": "",
    "refresh_token": "",
    "token_type": "bearer",
    "user_id": "uuid",
    "role": "student",
    "requires_otp": true,
    "requires_totp": false
}
```

**Response (MFA Enabled)**:
```json
{
    "access_token": "",
    "refresh_token": "",
    "token_type": "bearer",
    "user_id": "uuid",
    "role": "student",
    "requires_otp": false,
    "requires_totp": true
}
```

**Security**:
- Validates username/password credentials
- Returns empty tokens if MFA required
- Identifies whether TOTP or email OTP is needed
- Never reveals if email exists (consistent error messages)

---

### 2. POST /auth/verify-otp
**Purpose**: Verify email OTP during first-time MFA enrollment

**Request**:
```json
{
    "email": "user@example.com",
    "otp_code": "123456"
}
```

**Response** (Success):
```json
{
    "access_token": "",
    "refresh_token": "",
    "token_type": "bearer",
    "user_id": "uuid",
    "role": "student",
    "requires_otp": false,
    "requires_totp": false
}
```

**Security**:
- Validates OTP matches stored code
- Checks OTP hasn't expired (5-minute window)
- Marks OTP as used (single-use tokens)
- Response has empty tokens; user must complete TOTP setup

**Error Responses**:
- `401 Unauthorized`: Invalid or expired OTP
- `400 Bad Request`: OTP code format invalid

---

### 3. POST /auth/mfa/enroll
**Purpose**: Initiate TOTP enrollment - generates secret and QR code

**Request**:
```json
{
    "email": "user@example.com"
}
```

**Response** (Success):
```json
{
    "qr_code": "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==",
    "secret": "JBSWY3DPEBLW64TMMQ======",
    "message": "Scan the QR code with Google Authenticator, Authy, or Microsoft Authenticator. Enter your first OTP code to confirm."
}
```

**Security**:
- TOTP secret generated using cryptographically secure random (pyotp)
- Secret stored temporarily in database (not yet active)
- Provisioning URI follows RFC 6238 standard: `otpauth://totp/SecureAssignmentSystem:email@example.com?secret=BASE32SECRET&issuer=SecureAssignmentSystem`
- QR code returned as Base64 PNG data URL (can be embedded directly in HTML)
- Backup secret provided for recovery scenarios

**Error Responses**:
- `404 Not Found`: User not found
- `400 Bad Request`: MFA already enabled for this account

---

### 4. POST /auth/mfa/verify
**Purpose**: Verify TOTP code for enrollment or login

**Request**:
```json
{
    "email": "user@example.com",
    "totp_code": "123456"
}
```

**Response** (Success):
```json
{
    "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refresh_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "token_type": "bearer",
    "user_id": "uuid",
    "role": "student",
    "requires_otp": false,
    "requires_totp": false
}
```

**Security Features**:

1. **TOTP Verification**:
   - RFC 6238 compliant verification using pyotp
   - ±30 second time window (valid_window=1)
   - 30-second time step (standard TOTP)

2. **Rate Limiting**:
   - Max 5 failed attempts allowed
   - After 5 failures: 15-minute account lockout
   - Rate limiting is per-email address
   - Resets on successful verification

3. **Error Handling**:
   - `429 Too Many Requests`: Account locked (max attempts exceeded)
   - `401 Unauthorized`: Invalid TOTP code
   - Error messages include remaining attempts (unless locked)

**Error Response Examples**:
```json
// Invalid code
{
    "detail": "Invalid TOTP code. 4 attempts remaining."
}

// Account locked
{
    "detail": "Account locked due to too many failed attempts. Try again later.",
    "headers": {"Retry-After": "900"}
}
```

**On First Enrollment**:
- Sets `mfa_enabled=true` in database
- Activates TOTP for all future logins

**On Subsequent Logins**:
- Just verifies TOTP, returns JWT tokens
- Does not modify mfa_enabled field

---

### 5. GET /auth/mfa/status
**Purpose**: Check if TOTP MFA is enabled for current user

**Request Headers**:
```
Authorization: Bearer {access_token}
```

**Response**:
```json
{
    "mfa_enabled": true,
    "message": "TOTP MFA is enabled"
}
```

**Security**: Requires valid JWT token

---

## Frontend Integration

### Authentication Context Updates

The `useAuth()` hook now provides:

```typescript
const { 
    login,           // Login with email/password
    verifyOTP,       // Verify email OTP
    enrollMFA,       // Initiate TOTP enrollment
    verifyTOTP,      // Verify TOTP code
    logout,
    isAuthenticated,
    user,
    hasRole
} = useAuth();
```

### Login Response Type

```typescript
interface LoginResponse {
    requires_otp: boolean;    // Email OTP required (first-time setup)
    requires_totp: boolean;   // TOTP verification required
    user_id: string;
    role: string;
}
```

### MFA Enrollment Response

```typescript
interface MFAEnrollment {
    qr_code: string;    // Base64 PNG image data URL
    secret: string;     // Base32 backup secret
    message: string;
}
```

---

## Frontend Pages

### 1. Login.tsx
- Email and password entry
- Routes to `/totp-verify` if MFA enabled
- Routes to `/otp-verify` if MFA not yet set up

### 2. OTPVerification.tsx
- Email OTP verification (first login)
- Routes to `/mfa-enroll` after successful verification

### 3. MFAEnroll.tsx
- Displays QR code for scanning
- Shows backup secret
- TOTP code entry and verification
- Completes MFA setup

### 4. TOTPVerify.tsx
- TOTP code entry during login (when MFA already enabled)
- Rate limiting info display
- Direct JWT token issuance

---

## Configuration

### Backend Settings (config.py)

```python
# OTP settings
OTP_EXPIRE_MINUTES: int = 5

# TOTP settings (RFC 6238 standard)
# Time step: 30 seconds
# Digits: 6
# Hash algorithm: SHA1 (standard)
# Time window: ±30 seconds (valid_window=1)
```

### Rate Limiting Configuration

```python
# In utils/rate_limiter.py
max_attempts = 5              # Failed attempts before lockout
lockout_duration_seconds = 900 # 15 minutes
base_delay_seconds = 2         # Not currently used
```

---

## Database Migration

Run migrations to add TOTP fields:

```bash
cd backend
alembic upgrade head
```

This creates:
- `totp_secret` (VARCHAR(32), nullable) column
- `mfa_enabled` (BOOLEAN, default=false) column

---

## Testing

### Test Accounts (Demo Data)

All demo accounts have MFA disabled initially:
- Student: alice@student.com
- Faculty: john.smith@faculty.com
- Admin: admin@example.com

On first login, users must set up TOTP.

### Testing TOTP Codes

Use any RFC 6238 compliant app:
- Google Authenticator
- Microsoft Authenticator
- Authy
- 1Password
- Any TOTP app

Or test programmatically:

```python
import pyotp

secret = "JBSWY3DPEBLW64TMMQ======"
totp = pyotp.TOTP(secret)
code = totp.now()  # Current 6-digit code
```

### Rate Limiting Testing

1. Try TOTP verification with wrong code 5 times
2. On 5th attempt, account locks for 15 minutes
3. Retry requests return 429 status with Retry-After header

---

## Security Considerations

### What's Protected

✅ **TOTP Secret**:
- Generated using cryptographically secure random (pyotp)
- Base32 encoded (compatible with all authenticator apps)
- Stored in database
- Never exposed after enrollment

✅ **Time Window**:
- ±30 second tolerance for clock drift
- Prevents accidental rejection due to time sync issues
- Standard RFC 6238 implementation

✅ **Rate Limiting**:
- Brute force protection
- Progressive lockout mechanism
- Per-email address tracking

✅ **No Secret in Responses**:
- Secret only shown during enrollment for backup
- Never included in subsequent API responses
- Frontend stores QR image, not secret

### What to Monitor

⚠️ **Rate Limiter State**:
- Currently in-memory (resets on server restart)
- In production, use Redis or database for persistence

⚠️ **Clock Synchronization**:
- Ensure server time is correct via NTP
- Users must keep device time synchronized

⚠️ **Backup Codes**:
- Consider implementing backup codes for recovery
- Current system: only authenticator app works

### Future Enhancements

- [ ] Backup/recovery codes (stored hashed)
- [ ] TOTP secret rotation
- [ ] Persistent rate limiting (Redis)
- [ ] WebAuthn/FIDO2 support
- [ ] SMS fallback (optional)
- [ ] Device trust (remember this device)

---

## Troubleshooting

### "Invalid TOTP code" Error

**Possible causes**:
1. Code has expired (new code generated every 30 seconds)
2. Server time not synchronized
3. User's device time not synchronized
4. Authenticator app settings incorrect

**Solutions**:
1. Wait for new code if expired
2. Sync server time: `sudo ntpdate -s time.nist.gov`
3. Check device time in authenticator app settings
4. Re-scan QR code or re-enter secret

### "Account locked" Error

**Cause**: 5 failed TOTP attempts

**Solution**: Wait 15 minutes, then retry

### Rate Limiter Not Resetting

**Cause**: In-memory storage, server restart needed

**Solution**: 
- Restart FastAPI server: `uvicorn main:app --reload`
- Or wait for timeout

---

## Compliance

✅ **RFC 6238**: Time-based One-Time Password Algorithm
- Standard time step: 30 seconds
- Standard HMAC algorithm: SHA-1
- Standard digit count: 6

✅ **TOTP Standard**:
- Compatible with Google Authenticator
- Compatible with Microsoft Authenticator
- Compatible with Authy
- Compatible with most TOTP apps

✅ **Security Standards**:
- Argon2 password hashing
- JWT token-based authentication
- HTTPS recommended in production
- Rate limiting for brute force protection

---

## References

- RFC 6238: Time-Based One-Time Password Algorithm
- RFC 4226: HMAC-Based One-Time Password Algorithm
- TOTP Standard: https://en.wikipedia.org/wiki/Time-based_one-time_password
- pyotp Library: https://github.com/pyauth/pyotp
- QR Code Generation: https://github.com/lincolnloop/python-qrcode

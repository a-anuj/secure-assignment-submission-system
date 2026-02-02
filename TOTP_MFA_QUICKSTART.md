# TOTP MFA - Quick Start Guide

## 🚀 30-Second Setup

### Backend
```bash
cd backend
pip install -r requirements.txt
alembic upgrade head
uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## 📱 First Login - What to Expect

1. **Login Page**: Enter email + password
2. **Email Verification**: Check backend console for OTP code, enter it
3. **QR Code**: Scan with Google Authenticator, Authy, or Microsoft Authenticator
4. **Confirm**: Enter 6-digit code from your authenticator app
5. **Success**: You're logged in with TOTP MFA enabled!

## 🔐 Demo Accounts

All have MFA disabled initially. On first login, you'll set it up:

```
Student:  alice@student.com
Faculty:  john.smith@faculty.com
Admin:    admin@example.com
```

## 🧪 Test Authenticator Apps

All of these work with TOTP QR codes:
- ✅ Google Authenticator
- ✅ Microsoft Authenticator
- ✅ Authy
- ✅ 1Password
- ✅ FreeOTP

## 🛠️ Development Testing

### Test TOTP Code Generation
```bash
cd backend
python -c "from utils.totp import generate_totp_secret, get_current_totp_code; s = generate_totp_secret(); print(f'Secret: {s}'); print(f'Code: {get_current_totp_code(s)}')"
```

### Test Rate Limiting
1. Enter wrong TOTP code 5 times
2. On attempt 6, you'll see "Account locked for 15 minutes"
3. Restart server to reset (in production, wait 15 min)

### View Database
```bash
psql focys_db
# Check TOTP enrollment
SELECT email, mfa_enabled, totp_secret IS NOT NULL as has_secret FROM users;
```

## 📋 Files Changed

### Backend
- `models/user.py` - Added totp_secret, mfa_enabled fields
- `routes/auth.py` - Added 4 TOTP endpoints + modified login
- `utils/totp.py` - TOTP generation/verification (NEW)
- `utils/rate_limiter.py` - TOTP attempt rate limiting (NEW)
- `schemas/auth.py` - Added TOTP schemas
- `requirements.txt` - Added pyotp, qrcode

### Frontend
- `lib/auth.tsx` - Added enrollMFA, verifyTOTP methods
- `pages/Login.tsx` - Enhanced for TOTP support
- `pages/TOTPVerify.tsx` - TOTP code entry (NEW)
- `pages/MFAEnroll.tsx` - QR code display (NEW)
- `pages/OTPVerification.tsx` - Redirects to MFA enrollment
- `App.tsx` - Added new routes

### Database
- `migrations/versions/add_totp_mfa_fields.py` - Migration (NEW)

### Documentation
- `TOTP_MFA_DOCUMENTATION.md` - Complete API docs (NEW)
- `TOTP_MFA_SETUP_GUIDE.md` - Deployment guide (NEW)

## 🔑 New API Endpoints

### For Backend Developers

1. **POST /auth/login** - Returns `requires_totp: true` if MFA enabled
2. **POST /auth/mfa/enroll** - Get QR code + backup secret
3. **POST /auth/mfa/verify** - Verify TOTP code (login or enrollment)
4. **POST /auth/verify-otp** - Verify email OTP (first time only)
5. **GET /auth/mfa/status** - Check if TOTP enabled

## 📊 Flow Diagram

```
First Login          Subsequent Login
─────────────────────────────────────
Password Auth        Password Auth
    ↓                    ↓
Email OTP            TOTP Entry
    ↓                    ↓
MFA Enroll           JWT Tokens
(QR Code)                ↓
    ↓                Dashboard
TOTP Entry
    ↓
JWT Tokens
    ↓
Dashboard
```

## ⚙️ Configuration

### Rate Limiting (in `utils/rate_limiter.py`)
- Max attempts: 5
- Lockout duration: 15 minutes

### TOTP Time Window (in `utils/totp.py`)
- Time step: 30 seconds
- Window: ±30 seconds (±1 step)
- Digits: 6

### OTP Expiry (in `config.py`)
- Email OTP: 5 minutes

## 🐛 Common Issues

| Issue | Solution |
|-------|----------|
| QR code not showing | Check backend is running, QRcode generates on `/auth/mfa/enroll` |
| TOTP code invalid | Ensure server & device times are synced |
| Account locked | Wait 15 min or restart server |
| Module not found | Run `pip install -r requirements.txt` |
| DB migration fails | Run `alembic upgrade head` |

## 📞 Support

- **RFC 6238 Reference**: https://tools.ietf.org/html/rfc6238
- **pyotp Library**: https://github.com/pyauth/pyotp
- **QRCode Library**: https://github.com/lincolnloop/python-qrcode

## ✅ Security Features Implemented

- ✅ RFC 6238 TOTP (time-based, not event-based)
- ✅ QR code for easy app enrollment
- ✅ Rate limiting (5 attempts, 15-min lockout)
- ✅ ±30 second time window for clock drift
- ✅ Secret never exposed after enrollment
- ✅ Base32 encoding for compatibility
- ✅ Backup secret for recovery

## 🎯 Next Steps

1. **Test** first login with an authenticator app
2. **Logout** and verify subsequent login requires TOTP
3. **Check** database that `mfa_enabled=true`
4. **Review** TOTP_MFA_DOCUMENTATION.md for complete API details
5. **Deploy** to production with HTTPS + NTP sync

Enjoy secure TOTP MFA! 🔐

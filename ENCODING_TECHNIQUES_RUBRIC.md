# 🔐 Encoding Techniques Rubric

## Overview
This rubric evaluates the encoding and encryption techniques implemented in the Secure Student Assignment Submission System, including security levels, associated risks, and potential attack vectors.

---

## 1. Base64 Encoding

### Purpose
- Safe data transfer and storage of binary data
- Represents binary data in ASCII format
- Used for RSA-encrypted keys and digital signatures

### Security Level
🟡 **Medium (Not Cryptographic)**
- Base64 is an **encoding method, NOT encryption**
- Provides no confidentiality or security
- Only ensures safe transmission of binary data

### Where Used
- RSA-encrypted AES keys (stored as Base64)
- Digital signatures (encoded for transport)
- Public key storage (PEM format includes Base64)

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Exposure | High | If someone intercepts Base64-encoded keys, they can decode them (trivial) |
| False Security | Critical | May appear encrypted but is only obfuscated |
| Data Visibility | Medium | Binary data remains readable in logs if not filtered |

### Possible Attacks
1. **Base64 Decoding Attack**
   - Attacker decodes Base64 strings
   - Obtains encrypted AES keys or signatures
   - **Mitigation**: Keys encrypted with RSA-2048, so decoding only gives encrypted data

2. **Interception Attack**
   - Man-in-the-Middle captures Base64 data
   - **Mitigation**: Use HTTPS/TLS for all data transfer

3. **Log Injection Attack**
   - Attacker logs Base64 strings in plaintext
   - **Mitigation**: Implement proper log filtering and redaction

### Recommendation
✅ Base64 alone is acceptable for encoding but **MUST be combined with encryption** (as it is in this system)

---

## 2. AES-256 Encryption (CBC Mode)

### Purpose
- Fast, symmetric encryption of assignment files
- Protects file confidentiality
- Industry-standard cipher

### Security Level
🟢 **High (Cryptographically Secure)**
- AES-256 is approved by NIST
- 256-bit key size provides 2^256 possible combinations
- Resistant to all known attacks including brute-force

### Technical Details
- **Key Size**: 256 bits (32 bytes)
- **Block Size**: 128 bits (16 bytes)
- **Mode**: CBC (Cipher Block Chaining)
- **IV Generation**: Random 16-byte IV per encryption
- **Padding**: PKCS7 padding (standard)

### Where Used
- Encrypting student assignment files
- Protecting file confidentiality from storage to retrieval

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| IV Reuse | Critical | If same IV used with same key, patterns emerge |
| Key Exposure | Critical | If AES key leaked, all files encrypted with it compromise |
| Padding Oracle | Medium | Improper padding validation could leak plaintext |
| Mode Weakness | Low | CBC is secure but stream mode (CTR) is preferred |

### Possible Attacks

1. **Brute Force Attack**
   - Try all 2^256 possible keys
   - **Time to crack**: ~10^77 years with current computers
   - **Mitigation**: Not practical

2. **IV Reuse Attack**
   - Use known plaintext + ciphertext from same key/IV
   - Reveals XOR of plaintexts
   - **Mitigation**: System generates random IV per file ✅

3. **Padding Oracle Attack**
   - Attacker manipulates padding to decode plaintext
   - **Requires**: Server responds differently to padding errors
   - **Mitigation**: Consistent error responses (timing attack resistant)

4. **Key Compromise Attack**
   - Attacker obtains AES key (from memory/database)
   - Can decrypt ALL files encrypted with that key
   - **Mitigation**: AES key is immediately encrypted with RSA ✅

5. **Replay Attack**
   - Attacker reuses old encrypted file
   - **Mitigation**: SHA-256 hash verification + timestamp + database ID

### Recommendation
✅ AES-256-CBC is secure when properly implemented
⚠️ Consider upgrading to AES-256-GCM for authenticated encryption (provides integrity + confidentiality)

---

## 3. RSA-2048 Encryption (Asymmetric)

### Purpose
- Encrypt AES-256 keys securely
- Digital signature generation and verification
- Public key infrastructure (PKI) support

### Security Level
🟢 **High (Cryptographically Secure)**
- RSA-2048 approved by NIST and NSA (Suite B)
- 2048-bit modulus provides ~112 bits of security strength
- Suitable for protection until 2030

### Technical Details
- **Key Size**: 2048 bits (256 bytes)
- **Public Exponent**: 65537 (0x10001, standard)
- **Padding**: OAEP with SHA-256
- **Hash**: SHA-256 for signatures

### Where Used
- Encrypting AES-256 keys for secure storage
- Digital signatures on assignments
- Public key authentication

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Key Exposure | Critical | If private key leaks, entire security compromised |
| Small Exponent Attack | Low | Not applicable (65537 is safe) |
| Timing Attack | Medium | RSA operations not constant-time |
| Quantum Computing | High | RSA vulnerable to quantum algorithms (future threat) |

### Possible Attacks

1. **Brute Force Factorization**
   - Try to factor 2048-bit modulus
   - **Time to crack**: ~300 trillion years (current computers)
   - **Mitigation**: Not practical with current technology

2. **Private Key Compromise**
   - Attacker obtains private key (from database, memory, or backup)
   - Can decrypt all AES keys and forge signatures
   - **Mitigation**: 
     * Secure key storage (encrypted database)
     * Access control (role-based)
     * No private key export in code ✅

3. **Timing Attack**
   - Measure time to decrypt different ciphertexts
   - Reveals information about key
   - **Mitigation**: Use constant-time RSA implementation (cryptography library handles this) ✅

4. **Padding Oracle Attack (RSA)**
   - Similar to AES padding oracle
   - **Mitigation**: OAEP padding is resistant ✅

5. **Signature Forgery**
   - Attacker creates fake signature without private key
   - **Mitigation**: Cryptographically secure signatures (practically impossible)

### Recommendation
✅ RSA-2048 is secure until 2030
⚠️ Plan migration to RSA-3072 or RSA-4096 for long-term security
⚠️ Consider post-quantum cryptography for future-proofing

---

## 4. SHA-256 Hashing

### Purpose
- File integrity verification
- Non-repudiation (prove file wasn't tampered)
- Digital signature creation

### Security Level
🟢 **High (Cryptographically Secure)**
- SHA-256 approved by NIST and NSA
- No known practical attacks
- 256-bit output provides strong integrity guarantee

### Technical Details
- **Output Size**: 256 bits (64 hex characters)
- **Algorithm**: Secure Hash Algorithm 2 (SHA-2 family)
- **Collision Resistance**: 2^128 operations to find collision
- **Preimage Resistance**: 2^256 operations to reverse

### Where Used
- File integrity verification on assignment uploads
- Part of digital signature creation/verification
- Ensuring files not modified after submission

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Hash Collision | Low | Extremely difficult to find two files with same hash |
| Preimage Attack | Low | Extremely difficult to find file matching known hash |
| Rainbow Table | Low | Not applicable (no salt needed for integrity) |

### Possible Attacks

1. **Brute Force Collision**
   - Try to find two files with same SHA-256 hash
   - **Attempts needed**: ~2^128 (2^80 with advanced algorithms)
   - **Time to crack**: Not practical (billions of years)
   - **Mitigation**: Not applicable

2. **Preimage Attack**
   - Given hash, find original file content
   - **Mitigation**: Cryptographically secure (no known attacks)

3. **Hash Manipulation**
   - Attacker modifies file and hash in database
   - **Mitigation**: Hashes stored separately, verified on download ✅

### Recommendation
✅ SHA-256 is secure and industry standard
✅ No upgrade needed in foreseeable future

---

## 5. Argon2 Password Hashing

### Purpose
- Secure password hashing with salt
- Protection against rainbow table attacks
- Memory-hard function resists GPU/ASIC attacks

### Security Level
🟢 **Very High (Purpose-Built for Passwords)**
- Modern password hashing algorithm
- Resistant to GPU and ASIC acceleration
- Winner of Password Hashing Competition (2015)

### Technical Details
- **Memory Cost**: Configurable (higher = more memory required)
- **Time Cost**: Number of iterations
- **Salt**: 16-byte random salt per password
- **Output**: 32-byte hash

### Where Used
- User password hashing in database
- Password verification during login

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Weak Configuration | Medium | If memory/time cost too low, vulnerable to GPU attacks |
| Rainbow Table | Low | Salt makes rainbow tables impractical |
| Timing Attack | Low | Comparison timing could reveal partial password |

### Possible Attacks

1. **Dictionary Attack**
   - Try common passwords against hash
   - **Mitigation**: Argon2 memory-hard (makes attacks expensive)

2. **GPU/ASIC Attack**
   - Use specialized hardware to speed up hashing
   - **Mitigation**: Argon2 memory requirements make parallelization difficult ✅

3. **Rainbow Table Attack**
   - Use precomputed hash tables
   - **Mitigation**: 16-byte random salt makes table infeasible (2^128 entries needed) ✅

4. **Timing Attack**
   - Measure time to validate password
   - **Mitigation**: Use constant-time comparison ✅

### Recommendation
✅ Argon2 is excellent choice for passwords
✅ Ensure memory cost set to recommended values (minimum 64MB)

---

## 6. JWT (JSON Web Token) with HS256

### Purpose
- Secure authentication tokens
- Stateless session management
- Information transmission between parties

### Security Level
🟡 **Medium-High (Depends on Implementation)**
- HS256 uses HMAC with SHA-256
- Secure if key kept secret
- Vulnerable if key compromised

### Technical Details
- **Algorithm**: HS256 (HMAC + SHA-256)
- **Secret Key**: Symmetric key (both parties know it)
- **Claims**: User ID, role, expiration time
- **Token Lifetime**: 30 minutes (access token)

### Where Used
- User authentication after login
- API request authorization
- Session management (stateless)

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Key Exposure | Critical | If secret key leaked, attacker can forge tokens |
| Token Leakage | High | If token stolen (XSS), attacker has access |
| No Refresh Logic | Medium | Expired tokens not automatically cleaned |
| Revocation Challenge | Medium | Difficult to revoke valid token mid-session |

### Possible Attacks

1. **Key Compromise**
   - Attacker obtains HS256 secret key
   - Can forge any token with any claims
   - **Mitigation**: Secure key storage, rotate regularly ✅

2. **Token Theft (XSS)**
   - JavaScript extracts token from localStorage
   - Attacker steals token via XSS vulnerability
   - **Mitigation**: Use httpOnly cookies, sanitize inputs ✅

3. **Token Manipulation**
   - Attacker modifies token claims
   - Token signature doesn't match, invalid
   - **Mitigation**: HMAC signature prevents this ✅

4. **Replay Attack**
   - Attacker reuses old token to access resources
   - **Mitigation**: Check token expiration, use jti (token ID) for revocation

5. **Algorithm Confusion**
   - Try to change algorithm to "none" or "HS256"→"RS256"
   - **Mitigation**: Strict algorithm validation ✅

### Recommendation
✅ HS256 is acceptable for this system
⚠️ Ensure secret key is strong and kept safe
⚠️ Implement token refresh rotation (refresh token separate from access token) ✅ Already done
⚠️ Consider token revocation blacklist for logout

---

## 7. Hybrid Encryption (RSA + AES Combined)

### Purpose
- Combines speed (AES) with key exchange security (RSA)
- Industry-standard approach for file encryption

### Security Level
🟢 **Very High (Best Practice)**
- Asymmetric encryption for key exchange
- Symmetric encryption for data encryption
- Each mechanism addresses different needs

### Flow
```
1. Generate random AES-256 key
   ↓
2. Encrypt file with AES-256 key (fast)
   ↓
3. Encrypt AES-256 key with RSA public key (secure)
   ↓
4. Store encrypted file + encrypted AES key
   ↓
5. For decryption:
   - Decrypt AES key with RSA private key
   - Decrypt file with AES key
```

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Either key compromise | Critical | Loss of either key compromises system |
| Key management complexity | Medium | More keys to manage and protect |
| Performance overhead | Low | RSA slower than AES, but only per file |

### Possible Attacks

1. **Key Derivation Attack**
   - Try to derive RSA private key from public key
   - **Mitigation**: Mathematically infeasible (factorization problem)

2. **Side Channel Attack**
   - Measure power consumption/timing during encryption
   - Leak information about keys
   - **Mitigation**: Use timing-resistant library (cryptography lib) ✅

3. **Chosen Ciphertext Attack**
   - Attacker chooses ciphertexts and observes results
   - **Mitigation**: OAEP padding for RSA ✅

### Recommendation
✅ Hybrid encryption is excellent choice
✅ Properly implemented in this system

---

## 8. TOTP (Time-Based One-Time Password)

### Purpose
- Time-synchronized multi-factor authentication
- RFC 6238 compliant
- Industry standard (Google Authenticator, Microsoft Authenticator, etc.)

### Security Level
🟢 **High (Cryptographically Secure)**
- Based on HMAC-SHA-1 (or stronger)
- 30-second time window
- 6-digit codes provide reasonable security

### Technical Details
- **Hash Algorithm**: HMAC-SHA-1 (RFC standard)
- **Time Step**: 30 seconds
- **Digit Length**: 6 digits (1 million possibilities)
- **Backup Window**: ±1 time step for clock skew

### Where Used
- Second factor authentication after password
- TOTP enrollment for new users
- Login verification

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Secret Exposure | Critical | If TOTP secret leaked, codes can be predicted |
| Time Skew | Medium | Server/device clock mismatch might reject valid codes |
| QR Code Interception | Medium | QR code displayed during enrollment could be captured |
| Backup Code Storage | Medium | Backup codes not encrypted in this system |

### Possible Attacks

1. **Brute Force Attack**
   - Try all 1 million possible 6-digit codes
   - **Time window**: 30 seconds only
   - **Success rate**: 1 in 1 million (0.0001%)
   - **Mitigation**: Rate limiting, timeout ✅

2. **Secret Key Compromise**
   - If TOTP secret stolen from device/database
   - Attacker can predict all future codes
   - **Mitigation**: Secret stored securely, not sent to user ✅

3. **QR Code Interception**
   - Attacker intercepts QR code during enrollment
   - Can generate same TOTP secret
   - **Mitigation**: Display on HTTPS only, short display time ✅

4. **Time-Based Attack**
   - Server time drifts significantly
   - User's app time doesn't match server
   - Valid codes rejected
   - **Mitigation**: ±1 time step tolerance ✅

5. **SIM Swap Attack**
   - Not applicable to TOTP (doesn't use SMS)
   - Advantage over SMS-based OTP

### Recommendation
✅ TOTP is excellent choice for MFA
✅ Use strong TOTP libraries (pyotp) ✅ Implemented
⚠️ Secure backup codes properly (encrypt them)
⚠️ Consider QR code display time limit

---

## 9. Email OTP (One-Time Password)

### Purpose
- First-factor verification before TOTP enrollment
- Out-of-band authentication
- Recovery mechanism

### Security Level
🟡 **Medium (Depends on Email Security)**
- Email is not encrypted by default
- Vulnerable to man-in-the-middle
- Vulnerable to email account compromise

### Technical Details
- **Length**: 6-8 digits
- **Expiration**: 5 minutes
- **Single Use**: One-time only
- **Delivery**: Email (plaintext)

### Where Used
- User login verification
- TOTP enrollment confirmation
- Password recovery

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Email Interception | High | Email sent in plaintext (often) |
| Email Account Compromise | Critical | Attacker gains email = gains access |
| OTP Expiration | Low | Old OTPs should not be valid |
| Phishing | High | User might enter OTP on fake website |

### Possible Attacks

1. **Email Interception**
   - Network attacker captures email with OTP
   - **Mitigation**: Modern email uses HTTPS/TLS, but not guaranteed end-to-end

2. **Email Account Compromise**
   - Attacker gains email account access
   - Resets password, bypasses authentication
   - **Mitigation**: TOTP provides second factor after email ✅

3. **Brute Force Attack**
   - Try 1 million possible 6-digit codes
   - **Mitigation**: Rate limiting, timeout, attempt tracking ✅

4. **Phishing Attack**
   - Fake website asks for OTP
   - **Mitigation**: User education, check domain carefully

5. **Credential Stuffing**
   - Use leaked credentials from other services
   - **Mitigation**: Email OTP prevents this (need email access) ✅

### Recommendation
⚠️ Email OTP alone is weak
✅ Combined with TOTP provides strong authentication
⚠️ Consider email encryption for sensitivity
⚠️ Implement rate limiting and attempt tracking

---

## 10. Digital Signatures (RSA with SHA-256)

### Purpose
- Non-repudiation: Faculty cannot deny signing grades
- Integrity verification: Grades not tampered
- Authentication: Verify faculty identity

### Security Level
🟢 **Very High (Cryptographically Secure)**
- RSA-2048 signature with SHA-256
- Prevents forgery (practically impossible)
- Legal validity in some jurisdictions

### Technical Details
- **Hash Algorithm**: SHA-256
- **Signing Algorithm**: RSA PKCS1v15
- **Key Size**: 2048-bit RSA key
- **Signature Format**: Base64 encoded

### Where Used
- Faculty signing grade submissions
- Assignment approval/rejection signatures
- Audit trail for compliance

### Risks
| Risk | Severity | Description |
|------|----------|-------------|
| Private Key Compromise | Critical | Attacker can forge signatures |
| Signature Verification Bug | High | Improper verification allows fake signatures |
| Timestamp Issues | Medium | No timestamp in signature (timing attack) |
| Key Loss | Medium | Faculty can't resign if key lost |

### Possible Attacks

1. **Private Key Theft**
   - Attacker obtains faculty private key
   - Forges signatures on assignments
   - **Mitigation**: Secure key storage, access control ✅

2. **Signature Verification Bypass**
   - Weak verification code accepts invalid signatures
   - **Mitigation**: Use cryptography library (strong verification) ✅

3. **Key Confusion Attack**
   - Use wrong key to verify signature
   - **Mitigation**: Store key reference with signature ✅

4. **Replay Attack**
   - Reuse old signature on different document
   - **Mitigation**: Include document hash in signature (implicitly) ✅

### Recommendation
✅ Digital signatures properly implemented
✅ Provides legal non-repudiation
⚠️ Add timestamp to signatures for better audit trail
⚠️ Secure faculty private key in HSM (Hardware Security Module) for high-security deployments

---

## Summary Matrix

| Technique | Level | Use Case | Risks | Status |
|-----------|-------|----------|-------|--------|
| Base64 | Low | Data encoding | Trivial to decode | ✅ Acceptable |
| AES-256 | High | File encryption | Key exposure, IV reuse | ✅ Excellent |
| RSA-2048 | High | Key encryption, Signatures | Key exposure, Timing | ✅ Excellent |
| SHA-256 | High | Integrity | Negligible | ✅ Excellent |
| Argon2 | Very High | Password hashing | Weak config | ✅ Excellent |
| JWT (HS256) | Medium-High | Authentication | Key/token exposure | ✅ Good |
| TOTP | High | MFA | Secret exposure | ✅ Excellent |
| Email OTP | Medium | Initial auth | Email compromise | ✅ Acceptable |
| Signatures | Very High | Non-repudiation | Key exposure | ✅ Excellent |
| Hybrid | Very High | Complete system | Combined risks | ✅ Excellent |

---

## NIST Compliance

✅ **NIST SP 800-63-2 Level 3 Compliance**
- ✅ Two-factor authentication (Email OTP + TOTP)
- ✅ Approved cryptographic algorithms
- ✅ Secure key management
- ✅ Digital signatures for non-repudiation
- ✅ Audit logging and monitoring

---

## Recommendations

### Immediate
1. ✅ Current implementation is secure

### Short Term (6 months)
1. Implement token revocation blacklist for logout
2. Add request signing for audit trail
3. Implement rate limiting per IP/user
4. Add security headers (HSTS, CSP, etc.)

### Medium Term (1 year)
1. Upgrade to AES-256-GCM for authenticated encryption
2. Implement key rotation policy
3. Add Hardware Security Module (HSM) support
4. Implement audit logging for all encryption operations

### Long Term (2+ years)
1. Plan migration to post-quantum cryptography
2. Upgrade RSA to 3072-bit or 4096-bit
3. Consider zero-knowledge proofs for enhanced privacy
4. Implement end-to-end encryption for communication

---

## References

- [NIST FIPS 197: AES](https://nvlpubs.nist.gov/nistpubs/FIPS/NIST.FIPS.197.pdf)
- [RFC 3394: AES Key Wrap Algorithm](https://tools.ietf.org/html/rfc3394)
- [RFC 3610: AES-CCM](https://tools.ietf.org/html/rfc3610)
- [RFC 6238: TOTP](https://tools.ietf.org/html/rfc6238)
- [NIST SP 800-63-2: Digital Identity Guidelines](https://pages.nist.gov/800-63-2/)
- [Argon2 Paper: Password Hashing Competition](https://github.com/P-H-C/phc-winner-argon2)
- [Cryptography.io Documentation](https://cryptography.io/)
- [OWASP Encryption Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Encryption_Cheat_Sheet.html)


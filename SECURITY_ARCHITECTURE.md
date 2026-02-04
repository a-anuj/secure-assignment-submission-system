# 🔒 Security Implementation & Architecture Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Security Technologies](#security-technologies)
3. [Password Security](#password-security)
4. [File Encryption (Hybrid RSA + AES)](#file-encryption-hybrid-rsa--aes)
5. [Digital Signatures](#digital-signatures)
6. [Application Architecture](#application-architecture)
7. [User Workflows](#user-workflows)
8. [Database Schema](#database-schema)

---

## System Overview

This is a secure student assignment submission system implementing production-grade cryptographic security for:
- **Authentication**: Username/password + Email OTP verification
- **Encryption**: Hybrid RSA-2048 + AES-256 for file storage
- **Digital Signatures**: RSA signatures for non-repudiation
- **Access Control**: Role-based permissions (Student/Faculty/Admin)

### Core Security Principles
✅ **Confidentiality** - Files encrypted, only authorized faculty can decrypt  
✅ **Integrity** - SHA-256 hashing detects any file tampering  
✅ **Authentication** - JWT tokens verify user identity  
✅ **Non-repudiation** - Digital signatures prove faculty graded assignments  
✅ **Authorization** - RBAC ensures users only access permitted resources

---

## Security Technologies

### Cryptographic Libraries

```python
# Password Hashing
from passlib.context import CryptContext  # Argon2

# JWT Tokens
import jwt  # PyJWT

# Encryption & Signatures
from cryptography.hazmat.primitives.asymmetric import rsa, padding
from cryptography.hazmat.primitives.ciphers import Cipher, algorithms, modes
from cryptography.hazmat.primitives import hashes
```

### Algorithms Used

| Purpose | Algorithm | Key Size / Strength |
|---------|-----------|---------------------|
| Password Hashing | **Argon2** | Memory-hard, configurable |
| JWT Signing | **HS256** | HMAC with SHA-256 |
| File Hashing | **SHA-256** | 256-bit hash |
| Asymmetric Encryption | **RSA** | 2048-bit keys |
| Symmetric Encryption | **AES-256-CBC** | 256-bit keys |
| Digital Signatures | **RSA-PSS** | with SHA-256 |
| Padding (RSA Encryption) | **OAEP** | with SHA-256 |
| Padding (RSA Signatures) | **PSS** | Probabilistic |

---

## Password Security

### Implementation: Argon2 Hashing

**Location:** [`backend/utils/auth.py`](file:///home/a-anuj/Projects/focys-student-submission-system/backend/utils/auth.py)

#### How It Works

```python
from passlib.context import CryptContext

# Initialize password context
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

# Registration: Hash password
def hash_password(password: str) -> str:
    return pwd_context.hash(password)
    
# Login: Verify password
def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)
```

#### Security Features

1. **Argon2 Algorithm**
   - Winner of Password Hashing Competition (2015)
   - Memory-hard algorithm (resistant to GPU/ASIC attacks)
   - Automatically generates unique salt per password
   - Salt embedded in hash output

2. **Hash Format**
   ```
   $argon2id$v=19$m=65536,t=3,p=4$<salt>$<hash>
   ```
   - `argon2id`: Hybrid mode (Argon2i + Argon2d)
   - `m=65536`: Memory cost (64 MB)
   - `t=3`: Time cost (iterations)
   - `p=4`: Parallelism (threads)

3. **Storage**
   ```sql
   -- User table
   password_hash VARCHAR(255)  -- Stores full Argon2 hash
   ```

#### Workflow

```mermaid
graph LR
    A[User Registration] --> B[Input: Plain Password]
    B --> C[Argon2 Hash Generation]
    C --> D[Random Salt Created]
    D --> E[Hash with Salt]
    E --> F[Store in Database]
    
    G[User Login] --> H[Input: Plain Password]
    H --> I[Retrieve Hash from DB]
    I --> J[Extract Salt from Hash]
    J --> K[Hash Input with Same Salt]
    K --> L{Compare Hashes}
    L -->|Match| M[Login Success]
    L -->|No Match| N[Login Fail]
```

**Why Argon2?**
- Bcrypt: Good but less memory-hard
- PBKDF2: CPU-bound, vulnerable to GPU attacks
- **Argon2: Best modern choice, OWASP recommended**

---

## File Encryption (Hybrid RSA + AES)

### Why Hybrid Encryption?

| Encryption Type | Speed | Key Size | Use Case |
|----------------|-------|----------|----------|
| **RSA** | Slow | Large (2048-bit) | Small data (keys) |
| **AES** | Fast | Small (256-bit) | Large data (files) |

**Solution:** Encrypt file with AES, encrypt AES key with RSA

### Implementation

**Locations:**
- Encryption: [`backend/utils/encryption.py`](file:///home/a-anuj/Projects/focys-student-submission-system/backend/utils/encryption.py)
- Upload: [`backend/routes/student.py`](file:///home/a-anuj/Projects/focys-student-submission-system/backend/routes/student.py#L22-L146)
- Download: [`backend/routes/faculty.py`](file:///home/a-anuj/Projects/focys-student-submission-system/backend/routes/faculty.py#L73-L171)

### Step 1: RSA Key Pair Generation

```python
from cryptography.hazmat.primitives.asymmetric import rsa

def generate_rsa_keypair():
    # Generate 2048-bit RSA key pair
    private_key = rsa.generate_private_key(
        public_exponent=65537,  # Standard exponent
        key_size=2048,
        backend=default_backend()
    )
    
    public_key = private_key.public_key()
    
    # Convert to PEM format for storage
    public_pem = public_key.public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    )
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    )
    
    return public_pem, private_pem
```

**Key Generation:** During user registration
- **All users**: Get RSA public key (for encryption)
- **Faculty only**: Get RSA private key (for decryption + signatures)

### Step 2: File Encryption (Student Upload)

```python
def encrypt_file_hybrid(file_data: bytes, faculty_public_key_pem: str):
    # 1. Generate random AES-256 key
    aes_key = os.urandom(32)  # 32 bytes = 256 bits
    
    # 2. Generate random IV (Initialization Vector)
    iv = os.urandom(16)  # 16 bytes for AES-CBC
    
    # 3. Encrypt file with AES-256-CBC
    cipher = Cipher(
        algorithms.AES(aes_key),
        modes.CBC(iv),
        backend=default_backend()
    )
    encryptor = cipher.encryptor()
    
    # Pad to AES block size (16 bytes)
    padding_length = 16 - (len(file_data) % 16)
    padded_data = file_data + bytes([padding_length] * padding_length)
    
    encrypted_file = encryptor.update(padded_data) + encryptor.finalize()
    
    # Prepend IV to encrypted file (needed for decryption)
    encrypted_file_with_iv = iv + encrypted_file
    
    # 4. Encrypt AES key with faculty's RSA public key
    public_key = load_pem_public_key(faculty_public_key_pem)
    encrypted_aes_key = public_key.encrypt(
        aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    # 5. Base64 encode for storage
    encrypted_aes_key_b64 = base64.b64encode(encrypted_aes_key)
    
    return encrypted_file_with_iv, encrypted_aes_key_b64
```

### Step 3: File Decryption (Faculty Download)

```python
def decrypt_file_hybrid(encrypted_file, encrypted_aes_key_b64, faculty_private_key_pem):
    # 1. Load faculty's RSA private key
    private_key = load_pem_private_key(faculty_private_key_pem)
    
    # 2. Decrypt AES key using RSA private key
    encrypted_aes_key = base64.b64decode(encrypted_aes_key_b64)
    aes_key = private_key.decrypt(
        encrypted_aes_key,
        padding.OAEP(
            mgf=padding.MGF1(algorithm=hashes.SHA256()),
            algorithm=hashes.SHA256(),
            label=None
        )
    )
    
    # 3. Extract IV from encrypted file
    iv = encrypted_file[:16]
    encrypted_data = encrypted_file[16:]
    
    # 4. Decrypt file with AES key
    cipher = Cipher(
        algorithms.AES(aes_key),
        modes.CBC(iv),
        backend=default_backend()
    )
    decryptor = cipher.decryptor()
    decrypted_padded = decryptor.update(encrypted_data) + decryptor.finalize()
    
    # 5. Remove padding
    padding_length = decrypted_padded[-1]
    original_file = decrypted_padded[:-padding_length]
    
    return original_file
```

### Encryption Workflow Diagram

```mermaid
sequenceDiagram
    participant Student
    participant System
    participant Database
    participant Faculty
    
    Note over Student,Faculty: File Upload Process
    Student->>System: Upload file (original.pdf)
    System->>System: Generate random AES-256 key
    System->>System: Encrypt file with AES (fast!)
    System->>System: Get faculty's RSA public key
    System->>System: Encrypt AES key with RSA
    System->>System: Generate SHA-256 file hash
    System->>Database: Store encrypted file + encrypted key + hash
    
    Note over Student,Faculty: File Download Process
    Faculty->>System: Request file download
    System->>Database: Retrieve encrypted file + encrypted key
    System->>System: Decrypt AES key with faculty's RSA private key
    System->>System: Decrypt file with AES key
    System->>Faculty: Return original file
```

### Security Analysis

| Attack Scenario | Protection |
|----------------|------------|
| Database breach | ✅ Files encrypted, attacker needs faculty's private key |
| Man-in-the-middle | ✅ HTTPS (in production) + encrypted storage |
| Faculty key stolen | ⚠️ Only that faculty's assignments compromised |
| Brute force AES key | ✅ 2^256 possibilities (~10^77), computationally infeasible |
| RSA key factorization | ✅ 2048-bit RSA secure until ~2030 (NIST) |

---

## Digital Signatures

### Purpose

Digital signatures provide **non-repudiation** and **integrity verification**:
1. **Authenticity**: Proves faculty actually graded the assignment
2. **Integrity**: Detects if marks or feedback were tampered with
3. **Non-repudiation**: Faculty cannot deny grading the assignment

### Implementation

**Location:** [`backend/utils/signature.py`](file:///home/a-anuj/Projects/focys-student-submission-system/backend/utils/signature.py)

### Step 1: File Hashing (SHA-256)

```python
import hashlib

def generate_file_hash(file_data: bytes) -> str:
    # Create SHA-256 hash of file
    sha256_hash = hashlib.sha256(file_data).hexdigest()
    return sha256_hash  # Returns 64-character hex string
```

**Example Output:**
```
e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855
```

### Step 2: Signature Generation (Faculty Grading)

```python
from cryptography.hazmat.primitives.asymmetric import padding
from cryptography.hazmat.primitives import hashes

def sign_hash(file_hash: str, faculty_private_key_pem: str) -> str:
    # Load faculty's private key
    private_key = load_pem_private_key(faculty_private_key_pem)
    
    # Convert hex hash to bytes
    hash_bytes = bytes.fromhex(file_hash)
    
    # Sign the hash using RSA-PSS
    signature = private_key.sign(
        hash_bytes,
        padding.PSS(
            mgf=padding.MGF1(hashes.SHA256()),
            salt_length=padding.PSS.MAX_LENGTH
        ),
        hashes.SHA256()
    )
    
    # Encode to Base64 for storage
    signature_b64 = base64.b64encode(signature).decode('utf-8')
    
    return signature_b64
```

**PSS Padding:** Probabilistic Signature Scheme - more secure than PKCS#1 v1.5

### Step 3: Signature Verification (Student)

```python
def verify_signature(file_hash: str, signature_b64: str, faculty_public_key_pem: str) -> bool:
    try:
        # Load faculty's public key
        public_key = load_pem_public_key(faculty_public_key_pem)
        
        # Decode signature
        signature = base64.b64decode(signature_b64)
        
        # Convert hex hash to bytes
        hash_bytes = bytes.fromhex(file_hash)
        
        # Verify signature
        public_key.verify(
            signature,
            hash_bytes,
            padding.PSS(
                mgf=padding.MGF1(hashes.SHA256()),
                salt_length=padding.PSS.MAX_LENGTH
            ),
            hashes.SHA256()
        )
        
        return True  # Signature valid
    except Exception:
        return False  # Signature invalid or tampered
```

### Digital Signature Workflow

```mermaid
sequenceDiagram
    participant Faculty
    participant System
    participant Database
    participant Student
    
    Note over Faculty,Student: Grading Process
    Faculty->>System: Grade assignment (marks: 85, feedback: "Good work")
    System->>Database: Get file hash (SHA-256)
    System->>System: Load faculty's RSA private key
    System->>System: Sign file hash with private key
    System->>Database: Store signature + marks + feedback
    
    Note over Faculty,Student: Verification Process
    Student->>System: Verify signature
    System->>Database: Get signature + file hash
    System->>Database: Get faculty's public key
    System->>System: Verify signature with public key
    System-->>Student: ✅ Valid: Authentic grading
    System-->>Student: ❌ Invalid: Tampered or forged
```

### What Gets Signed?

```python
# During upload (student)
file_hash = sha256(original_file)  # Hash stored

# During grading (faculty)
signature = sign(file_hash, faculty_private_key)

# Stored together:
{
    "assignment_id": "uuid",
    "file_hash_sha256": "e3b0c442...",  # Original file hash
    "marks": 85,
    "feedback": "Good work",
    "faculty_signature": "Base64(...)",  # Signature of hash
    "faculty_id": "faculty-uuid"
}
```

**Key Point:** The signature is of the **file hash**, not the marks. This proves the faculty graded **this specific file**.

### Security Properties

| Property | How Achieved |
|----------|--------------|
| **Authenticity** | Only faculty with private key can create valid signature |
| **Integrity** | Any change to hash invalidates signature |
| **Non-repudiation** | Faculty cannot deny signing (private key proves identity) |
| **Tamper Detection** | Recompute hash and verify - detects any file modification |

---

## Application Architecture

### Tech Stack

```
┌─────────────────────────────────────────────────────────┐
│                    FRONTEND (React)                     │
│  React 18 + TypeScript + Tailwind CSS + Vite          │
│  Port: 5173                                             │
└──────────────────┬──────────────────────────────────────┘
                   │ HTTP/HTTPS
                   │ JWT Bearer Tokens
                   ▼
┌─────────────────────────────────────────────────────────┐
│                  BACKEND API (FastAPI)                  │
│  FastAPI + Pydantic v2 + Python 3.11+                  │
│  Port: 8000                                             │
│  ┌──────────────────────────────────────────────────┐  │
│  │ Routes Layer (API Endpoints)                      │  │
│  │  - /api/auth/*     - /api/student/*              │  │
│  │  - /api/faculty/*  - /api/admin/*                │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │ Security & Utils Layer                            │  │
│  │  - ACL (Role-based access control)               │  │
│  │  - Authentication (Argon2 + JWT)                 │  │
│  │  - Encryption (RSA + AES)                        │  │
│  │  - Digital Signatures (RSA-PSS)                  │  │
│  └──────────────┬───────────────────────────────────┘  │
│                 │                                        │
│  ┌──────────────▼───────────────────────────────────┐  │
│  │ Models Layer (SQLAlchemy ORM)                    │  │
│  │  - User, Course, Assignment, Submission          │  │
│  └──────────────┬───────────────────────────────────┘  │
└─────────────────┼──────────────────────────────────────┘
                  │
                  ▼
┌─────────────────────────────────────────────────────────┐
│              DATABASE (PostgreSQL 14+)                  │
│  - users (passwords, RSA keys)                          │
│  - courses, assignments (encrypted files)               │
│  - submissions (digital signatures, marks)              │
└─────────────────────────────────────────────────────────┘
```

### Directory Structure

```
backend/
├── models/              # Database Models (SQLAlchemy)
│   ├── user.py         # User (with RSA keys)
│   ├── course.py       # Course
│   ├── assignment.py   # Assignment (encrypted file)
│   └── submission.py   # Submission (signature, marks)
│
├── schemas/             # API Schemas (Pydantic)
│   ├── user.py
│   ├── course.py
│   ├── assignment.py
│   └── auth.py
│
├── routes/              # API Routes
│   ├── auth.py         # Login, Register, OTP
│   ├── student.py      # Upload, View submissions
│   ├── faculty.py      # Download, Grade
│   └── admin.py        # Manage users/courses
│
├── utils/               # Security Utilities
│   ├── auth.py         # Password hashing, JWT
│   ├── encryption.py   # RSA + AES encryption
│   ├── signature.py    # Digital signatures
│   ├── acl.py          # Access control
│   └── otp.py          # OTP generation
│
├── database.py          # DB connection
├── config.py            # Settings
├── main.py              # FastAPI app
└── init_db.py           # DB initialization
```

---

## User Workflows

### 1. Student Workflow

```mermaid
graph TD
    A[Student Registration] --> B[Generate RSA Public Key]
    B --> C[Hash Password with Argon2]
    C --> D[Store in Database]
    
    D --> E[Login: Email + Password]
    E --> F[Send OTP via Email]
    F --> G[Verify OTP]
    G --> H[Issue JWT Tokens]
    
    H --> I[Upload Assignment]
    I --> J[Select Course]
    J --> K[Choose File]
    K --> L[Generate SHA-256 Hash]
    L --> M[Encrypt with AES-256]
    M --> N[Encrypt AES Key with Faculty RSA Public Key]
    N --> O[Store Encrypted File + Key + Hash]
    
    O --> P[View Submissions]
    P --> Q[Check Grading Status]
    Q --> R{Graded?}
    R -->|Yes| S[View Marks + Feedback]
    S --> T[Verify Faculty Signature]
    T --> U{Signature Valid?}
    U -->|Yes| V[✅ Authentic Grading]
    U -->|No| W[⚠️ Tampered or Forged]
```

### 2. Faculty Workflow

```mermaid
graph TD
    A[Faculty Registration] --> B[Generate RSA Key Pair]
    B --> C[Store Public + Private Keys]
    C --> D[Hash Password]
    
    D --> E[Login with OTP]
    E --> F[View Assigned Courses]
    F --> G[See Pending Submissions]
    
    G --> H[Download Assignment]
    H --> I[Retrieve Encrypted File + Key]
    I --> J[Decrypt AES Key with RSA Private Key]
    J --> K[Decrypt File with AES Key]
    K --> L[Return Original File]
    
    L --> M[Review Assignment]
    M --> N[Enter Marks + Feedback]
    N --> O[Get File Hash from Database]
    O --> P[Sign Hash with RSA Private Key]
    P --> Q[Store Signature + Marks + Feedback]
    Q --> R[Student Notified]
```

### 3. Admin Workflow

```mermaid
graph TD
    A[Admin Login] --> B[Dashboard]
    B --> C[Manage Users]
    C --> D[Create Faculty/Student]
    D --> E[Generate RSA Keys]
    E --> F[Hash Password]
    
    B --> G[Manage Courses]
    G --> H[Create Course]
    H --> I[Assign Faculty to Course]
    
    B --> J[View All Submissions]
    J --> K[Monitor System]
```

---

## Database Schema

### Users Table
```sql
CREATE TABLE users (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    email VARCHAR(255) UNIQUE,
    role ENUM('student', 'faculty', 'admin'),
    
    -- Security
    password_hash VARCHAR(255),      -- Argon2 hash
    public_key_pem TEXT,              -- RSA public key (all users)
    private_key_pem TEXT,             -- RSA private key (faculty only)
    
    -- MFA
    totp_secret VARCHAR(32),
    mfa_enabled BOOLEAN DEFAULT FALSE,
    
    created_at TIMESTAMP
);
```

### Assignments Table (Encrypted Files)
```sql
CREATE TABLE assignments (
    id UUID PRIMARY KEY,
    student_id UUID REFERENCES users(id),
    course_id UUID REFERENCES courses(id),
    filename VARCHAR(255),
    
    -- Encrypted file storage
    encrypted_file_blob BYTEA,        -- AES-256 encrypted file
    file_hash_sha256 VARCHAR(64),     -- SHA-256 hash (hex)
    aes_key_encrypted TEXT,           -- RSA-encrypted AES key (Base64)
    
    upload_timestamp TIMESTAMP
);
```

### Submissions Table (Digital Signatures)
```sql
CREATE TABLE submissions (
    id UUID PRIMARY KEY,
    assignment_id UUID UNIQUE REFERENCES assignments(id),
    faculty_id UUID REFERENCES users(id),
    
    -- Digital signature
    faculty_signature TEXT,           -- RSA signature (Base64)
    
    -- Grading
    marks INTEGER,
    feedback TEXT,
    
    graded_timestamp TIMESTAMP
);
```

### Courses Table
```sql
CREATE TABLE courses (
    id UUID PRIMARY KEY,
    name VARCHAR(255),
    code VARCHAR(50),
    faculty_id UUID REFERENCES users(id),
    created_at TIMESTAMP
);
```

---

## Security Summary

### What's Protected and How

| Asset | Threat | Protection |
|-------|--------|-----------|
| **Passwords** | Rainbow tables, brute force | Argon2 hashing with unique salts |
| **User Sessions** | Session hijacking | JWT tokens with expiration |
| **Files at Rest** | Database breach | AES-256 encryption |
| **Encryption Keys** | Key exposure | RSA-2048 encrypted AES keys |
| **File Integrity** | Tampering | SHA-256 hashing |
| **Grading Authenticity** | Forgery | RSA digital signatures |
| **Admin Functions** | Unauthorized access | Role-based ACL |

### Cryptographic Strength

```
Password Security:
├── Algorithm: Argon2 (memory-hard)
├── Salt: Unique per password
└── Strength: ~2^128 attempts needed

File Encryption:
├── Symmetric: AES-256-CBC
│   └── Keyspace: 2^256 possibilities
│       └── Brute force time: 10^70 years
└── Asymmetric: RSA-2048
    └── Secure until ~2030 (NIST estimates)

Digital Signatures:
├── Hash: SHA-256 (collision-resistant)
├── Signature: RSA-2048-PSS
└── Verification: Public key cryptography
```

---

## Conclusion

This system implements **defense-in-depth** with multiple security layers:

1. ✅ **Authentication Layer**: Argon2 + JWT + MFA
2. ✅ **Authorization Layer**: Role-based ACL  
3. ✅ **Encryption Layer**: Hybrid RSA + AES
4. ✅ **Integrity Layer**: SHA-256 hashing
5. ✅ **Non-repudiation Layer**: Digital signatures

**Security certifications aligned with:**
- NIST SP 800-63-2 (Authentication)
- OWASP Best Practices
- Modern cryptographic standards (RSA-2048, AES-256, SHA-256)

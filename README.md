# 🔒 Secure Student Assignment Submission System

A production-ready web application implementing advanced security features including **hybrid encryption (RSA + AES)**, **digital signatures**, **multi-factor authentication**, and **role-based access control**.

## 🎯 Features

### Authentication & Authorization
- ✅ **Multi-Factor Authentication (MFA)**: Username/Password + Email OTP
- ✅ **JWT Token-Based Auth**: Access and refresh tokens
- ✅ **Role-Based Access Control (RBAC)**: Student, Faculty, Admin roles
- ✅ **Access Control List (ACL)**: Fine-grained permissions
- ✅ **Password Security**: Argon2 hashing with salt

### Encryption & Security
- ✅ **Hybrid Encryption**: RSA-2048 + AES-256
- ✅ **Digital Signatures**: RSA signatures with SHA-256 hashing
- ✅ **File Integrity**: SHA-256 hash verification
- ✅ **Base64 Encoding**: Secure data transfer
- ✅ **Non-Repudiation**: Faculty signatures cannot be denied

### User Roles

**Student**
- Upload encrypted assignments
- View own submissions and marks
- Verify faculty digital signatures

**Faculty**
- View assigned student submissions
- Download and decrypt files
- Grade assignments with digital signatures

**Admin**
- Manage users (create, update roles)
- Create courses
- Assign faculty to courses

## 🛠️ Tech Stack

### Backend
- **FastAPI** - Modern Python web framework
- **PostgreSQL** - Relational database
- **SQLAlchemy** - ORM
- **Alembic** - Database migrations
- **Pydantic v2** - Data validation
- **Passlib (argon2)** - Password hashing
- **PyJWT** - JWT tokens
- **Cryptography** - Encryption & signatures

###Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Axios** - HTTP client
- **React Router** - Navigation

## 📋 Prerequisites

- **Python 3.11+**
- **Node.js 18+**
- **PostgreSQL 14+**
- **pip** and **npm**

## 🚀 Installation & Setup

### 1. Clone the Repository

```bash
git clone https://github.com/a-anuj/secure-assignment-submission-system.git
```

### 2. Backend Setup

```bash
cd backend

# Create virtual environment
python3 -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate

# Install dependencies
pip install -r requirements.txt

# Copy environment template
cp .env.example .env
```

### 3. Configure Environment Variables

Edit `backend/.env`:

```env
DATABASE_URL=postgresql://postgres:yourpassword@localhost:5432/student_submission_db
SECRET_KEY=your-secret-key-generate-a-strong-random-key
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
REFRESH_TOKEN_EXPIRE_DAYS=7
OTP_EXPIRE_MINUTES=5
CORS_ORIGINS=http://localhost:5173
DEBUG=True
```

### 4. Setup Database

```bash
# Create PostgreSQL database
createdb student_submission_db

# OR using psql
psql -U postgres
CREATE DATABASE student_submission_db;
\q

# Initialize database and seed data
python init_db.py
```

This will create tables and add sample users:
- **Admin**: admin@example.com / admin123
- **Faculty**: john.smith@faculty.com / faculty123
- **Student**: alice@student.com / student123

### 5. Start Backend Server

```bash
# From backend directory
python main.py

# OR with uvicorn directly
uvicorn main:app --reload --port 8000
```

Backend will run on: **http://localhost:8000**
- API Docs: **http://localhost:8000/api/docs**
- ReDoc: **http://localhost:8000/api/redoc**

### 6. Frontend Setup

```bash
cd ../frontend

# Install dependencies
npm install

# Start development server
npm run dev
```

Frontend will run on: **http://localhost:5173**

## 🔐 Security Implementation

### 1. Password Hashing (Argon2)
```python
# Argon2 is a memory-hard password hashing algorithm
# Winner of the Password Hashing Competition (2015)
# Resistant to GPU and ASIC attacks
# 12 rounds of hashing (configurable)
password_hash = hash_password("mypassword")
```

### 2. Multi-Factor Authentication
```
Flow:
1. User enters email + password
2. OTP generated (6 digits, 5-minute expiry)
3. OTP logged to console (simulates email)
4. User enters OTP
5. JWT tokens issued
```

**Check Backend Console for OTP**:
```
============================================================
📧 [SIMULATED EMAIL - OTP]
============================================================
To: alice@student.com
Subject: Your Login OTP Code

Your OTP code is: 123456
This code will expire at: 2024-01-29 12:45:00 UTC
Valid for: 5 minutes
============================================================
```

### 3. Hybrid Encryption (RSA + AES)
```python
# File upload encryption flow:
1. Generate random AES-256 key
2. Encrypt file with AES-256 (fast)
3. Encrypt AES key with faculty's RSA public key
4. Store both encrypted file and encrypted key in database

# Faculty download decryption flow:
1. Decrypt AES key using faculty's RSA private key
2. Decrypt file using AES key
3. Return original file
```

### 4. Digital Signatures
```python
# Grading flow:
1. Faculty grades assignment
2. Generate SHA-256 hash of original file
3. Sign hash with faculty's RSA private key
4. Store signature with marks

# Verification flow:
1. Student retrieves signature
2. Verify using faculty's RSA public key
3. Confirms authentic grading
```

### 5. Access Control List (ACL)

| Role    | Upload | View Own | View Others | Download | Grade | Manage Users |
|---------|--------|----------|-------------|----------|-------|--------------|
| Student | ✅     | ✅       | ❌          | ❌       | ❌    | ❌           |
| Faculty | ❌     | ❌       | ✅ Assigned | ✅       | ✅    | ❌           |
| Admin   | ❌     | ✅ All   | ✅ All      | ✅       | ❌    | ✅           |

## 📱 Using the Application

### Login Process
1. Go to **http://localhost:5173**
2. Enter credentials (see sample accounts above)
3. Click "Continue to OTP Verification"
4. **Check backend console for OTP**
5. Enter 6-digit OTP
6. Redirected to role-based dashboard

### Student Workflow
1. **Dashboard**: View submission statistics
2. **Upload Assignment**: 
   - Select course
   - Choose file
   - File automatically encrypted before upload
3. **My Submissions**: View all assignments and grades
4. **Verify Signature**: Check faculty signature authenticity

### Faculty Workflow
1. **Dashboard**: View pending submissions
2. **Review Submissions**: See all assigned courses
3. **Download**: Decrypt and download student files
4. **Grade**: Add marks and feedback (signature automatically generated)

### Admin Workflow
1. **Dashboard**: User and course overview
2. **Manage Users**: Create faculty/student accounts
3. **Manage Courses**: Create courses and assign faculty

## 📁 Project Structure

```
focys-student-submission-system/
├── backend/
│   ├── models/          # SQLAlchemy models
│   ├── routes/          # API endpoints
│   ├── schemas/         # Pydantic schemas
│   ├── utils/           # Security utilities
│   ├── alembic/         # Database migrations
│   ├── config.py        # Configuration
│   ├── database.py      # Database connection
│   ├── main.py          # FastAPI app
│   └── init_db.py       # Database initialization
│
└── frontend/
    ├── src/
    │   ├── components/  # React components
    │   ├── pages/       # Page components
    │   ├── lib/         # API client, auth, types
    │   ├── App.tsx      # Main app with routing
    │   └── main.tsx     # Entry point
    ├── package.json
    └── vite.config.ts
```

## 🔧 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login (sends OTP)
- `POST /api/auth/verify-otp` - Verify OTP and get tokens
- `POST /api/auth/refresh` - Refresh access token
- `GET /api/auth/me` - Get current user

### Student
- `POST /api/student/assignments/upload` - Upload assignment
- `GET /api/student/assignments/my-submissions` - View submissions
- `GET /api/student/assignments/{id}/verify-signature` - Verify signature

### Faculty
- `GET /api/faculty/assignments/assigned` - View assigned submissions
- `GET /api/faculty/assignments/{id}/download` - Download file
- `POST /api/faculty/assignments/{id}/grade` - Grade assignment

### Admin
- `GET /api/admin/users` - List all users
- `POST /api/admin/users` - Create user
- `PUT /api/admin/users/{id}/role` - Update user role
- `GET /api/admin/courses` - List courses
- `POST /api/admin/courses` - Create course
- `POST /api/admin/courses/assign-faculty` - Assign faculty

## 🧪 Testing

### Test Authentication
```bash
curl -X POST http://localhost:8000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.com","password":"student123"}'
```

### Test with OTP
Check console for OTP, then:
```bash
curl -X POST http://localhost:8000/api/auth/verify-otp \
  -H "Content-Type: application/json" \
  -d '{"email":"alice@student.com","otp_code":"123456"}'
```

## 🔒 Security Best Practices Implemented

1. ✅ **Never store passwords in plaintext** - Argon2 hashing
2. ✅ **Input validation** - Pydantic schemas
3. ✅ **SQL injection prevention** - SQLAlchemy ORM
4. ✅ **XSS protection** - React escapes by default
5. ✅ **CSRF protection** - JWT tokens (stateless)
6. ✅ **Rate limiting** - Can be added with slowapi
7. ✅ **HTTPS ready** - Configure reverse proxy in production
8. ✅ **Token expiration** - Access tokens expire in 30 min
9. ✅ **Encrypted storage** - Files encrypted in database
10. ✅ **Digital signatures** - Non-repudiation guarantee

## 🚀 Production Deployment

### Environment Setup
1. Set `DEBUG=False` in `.env`
2. Generate strong `SECRET_KEY`
3. Configure PostgreSQL with proper credentials
4. Set up HTTPS (Let's Encrypt, CloudFlare, etc.)
5. Use real email service (SendGrid, AWS SES)

### Backend Deployment
```bash
# Install production server
pip install gunicorn

# Run with gunicorn
gunicorn main:app --workers 4 --worker-class uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000
```

### Frontend Deployment
```bash
# Build for production
npm run build

# Serve dist/ folder with nginx or any static server
```

## 📝 Sample Accounts

```
Admin:
Email: admin@example.com
Password: admin123

Faculty:
Email: john.smith@faculty.com
Password: faculty123

Student:
Email: alice@student.com
Password: student123
```

## 🐛 Troubleshooting

**Database Connection Error**
- Check PostgreSQL is running: `sudo systemctl status postgresql`
- Verify DATABASE_URL in .env matches your setup

**OTP Not Appearing**
- Check backend console/terminal where FastAPI is running
- OTP is logged with clear formatting

**CORS Error**
- Ensure frontend URL is in CORS_ORIGINS in .env
- Default: http://localhost:5173

**Token Expired**
- Refresh page to trigger token refresh
- Or login again

## 📚 Additional Resources

- **FastAPI**: https://fastapi.tiangolo.com/
- **React**: https://react.dev/
- **Tailwind CSS**: https://tailwindcss.com/
- **JWT**: https://jwt.io/
- **Cryptography**: https://cryptography.io/

## � Documentation

- [Encoding Techniques Rubric](ENCODING_TECHNIQUES_RUBRIC.md) - Comprehensive analysis of all encryption/encoding methods, security levels, risks, and attack vectors
- [TOTP MFA Setup Guide](TOTP_MFA_SETUP_GUIDE.md) - Multi-factor authentication implementation
- [TOTP MFA Documentation](TOTP_MFA_DOCUMENTATION.md) - Complete MFA feature documentation
- [Dark Theme Updates](DARK_THEME_UPDATES.md) - UI/UX dark theme implementation
- [ACL Implementation](ACL_IMPLEMENTATION.md) - Role-based access control system

## �📄 License

This project is for educational purposes as part of a security implementation assignment.

## 🙏 Acknowledgments

Built with security-first approach following:
- **NIST SP 800-63-2** authentication guidelines
- **OWASP** security best practices
- Modern cryptographic standards (RSA-2048, AES-256, SHA-256)

---

**⚠️ Important**: This is a development/educational implementation. For production use, add:
- Real email service
- Rate limiting
- Enhanced logging
- Monitoring
- Backup strategies
- Key management service
- SSL/TLS certificates

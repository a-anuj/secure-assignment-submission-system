#!/usr/bin/env python3
"""
Create test users using argon2 for secure password hashing.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.user import User, UserRole
from passlib.context import CryptContext
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.backends import default_backend

# Setup argon2
pwd_context = CryptContext(schemes=["argon2"], deprecated="auto")

def hash_password_argon2(password: str) -> str:
    """Hash password using argon2."""
    return pwd_context.hash(password)

def generate_rsa_keypair():
    """Generate RSA key pair."""
    print("  Generating RSA key pair...")
    private_key = rsa.generate_private_key(
        public_exponent=65537,
        key_size=2048,
        backend=default_backend()
    )
    
    private_pem = private_key.private_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PrivateFormat.PKCS8,
        encryption_algorithm=serialization.NoEncryption()
    ).decode('utf-8')
    
    public_pem = private_key.public_key().public_bytes(
        encoding=serialization.Encoding.PEM,
        format=serialization.PublicFormat.SubjectPublicKeyInfo
    ).decode('utf-8')
    
    return public_pem, private_pem

def create_test_users():
    db = SessionLocal()
    
    try:
        # Check if users exist
        existing = db.query(User).filter(User.email == "alice@student.com").first()
        if existing:
            print("✓ Users already exist!")
            print_credentials()
            return True
        
        print("Creating test users...\n")
        
        # Create Student
        print("1. Creating student...")
        pub, priv = generate_rsa_keypair()
        student = User(
            name="Alice Williams",
            email="alice@student.com",
            role=UserRole.STUDENT,
            password_hash=hash_password_argon2("student123"),
            public_key_pem=pub,
            private_key_pem=None
        )
        db.add(student)
        print("   ✓ Student: alice@student.com / student123\n")
        
        # Create Faculty
        print("2. Creating faculty...")
        pub, priv = generate_rsa_keypair()
        faculty = User(
            name="Dr. John Smith",
            email="john.smith@faculty.com",
            role=UserRole.FACULTY,
            password_hash=hash_password_argon2("faculty123"),
            public_key_pem=pub,
            private_key_pem=priv
        )
        db.add(faculty)
        print("   ✓ Faculty: john.smith@faculty.com / faculty123\n")
        
        # Create Admin
        print("3. Creating admin...")
        pub, priv = generate_rsa_keypair()
        admin = User(
            name="Admin User",
            email="admin@example.com",
            role=UserRole.ADMIN,
            password_hash=hash_password_argon2("admin123"),
            public_key_pem=pub,
            private_key_pem=None
        )
        db.add(admin)
        print("   ✓ Admin: admin@example.com / admin123\n")
        
        db.commit()
        print("="*60)
        print("✅ SUCCESS! All users created successfully!")
        print("="*60)
        print_credentials()
        return True
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
        return False
    finally:
        db.close()

def print_credentials():
    print("\nYou can now login with:")
    print("  Student: alice@student.com / student123")
    print("  Faculty: john.smith@faculty.com / faculty123")
    print("  Admin: admin@example.com / admin123")
    print("\nRemember: After login, check backend console for OTP!")
    print("="*60)

if __name__ == "__main__":
    create_test_users()

"""
Database initialization and seed data script.
Creates sample users, courses, and assignments for testing.
"""
import sys
import os
from datetime import datetime

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from database import engine, Base, SessionLocal
from models.user import User, UserRole
from models.course import Course
from utils.auth import hash_password
from utils.encryption import generate_rsa_keypair


def init_db():
    """Initialize database and create tables."""
    print("Creating database tables...")
    Base.metadata.create_all(bind=engine)
    print("✓ Tables created")


def seed_data():
    """Seed database with sample data."""
    db = SessionLocal()
    
    try:
        print("\nSeeding database with sample data...")
        
        # Create admin users
        print("\n1. Creating admin users...")
        admin_pub, admin_priv = generate_rsa_keypair()
        admin = User(
            name="Admin User",
            email="admin@example.com",
            role=UserRole.ADMIN,
            password_hash=hash_password("admin123"),
            public_key_pem=admin_pub,
            private_key_pem=None
        )
        db.add(admin)
        print(f"  ✓ Created: {admin.email} (password: admin123)")
        
        # Create faculty users
        print("\n2. Creating faculty users...")
        faculty_users = []
        faculty_data = [
            ("Dr. John Smith", "john.smith@faculty.com", "faculty123"),
            ("Dr. Sarah Johnson", "sarah.johnson@faculty.com", "faculty123"),
            ("Dr. Michael Brown", "michael.brown@faculty.com", "faculty123"),
        ]
        
        for name, email, password in faculty_data:
            pub, priv = generate_rsa_keypair()
            faculty = User(
                name=name,
                email=email,
                role=UserRole.FACULTY,
                password_hash=hash_password(password),
                public_key_pem=pub,
                private_key_pem=priv  # Faculty need private key for signing
            )
            db.add(faculty)
            faculty_users.append(faculty)
            print(f"  ✓ Created: {email} (password: {password})")
        
        # Create student users
        print("\n3. Creating student users...")
        student_data = [
            ("Alice Williams", "alice@student.com", "student123"),
            ("Bob Davis", "bob@student.com", "student123"),
            ("Charlie Miller", "charlie@student.com", "student123"),
        ]
        
        for name, email, password in student_data:
            pub, priv = generate_rsa_keypair()
            student = User(
                name=name,
                email=email,
                role=UserRole.STUDENT,
                password_hash=hash_password(password),
                public_key_pem=pub,
                private_key_pem=None  # Students don't need private key
            )
            db.add(student)
            print(f"  ✓ Created: {email} (password: {password})")
        
        db.commit()
        
        # Create courses
        print("\n4. Creating courses...")
        courses_data = [
            ("Computer Security", "CS401", faculty_users[0]),
            ("Database Systems", "CS301", faculty_users[1]),
            ("Web Development", "CS302", faculty_users[2]),
        ]
        
        for name, code, faculty in courses_data:
            course = Course(
                name=name,
                code=code,
                faculty_id=faculty.id
            )
            db.add(course)
            print(f"  ✓ Created: {code} - {name} (Faculty: {faculty.name})")
        
        db.commit()
        
        print("\n✓ Database seeded successfully!")
        print("\n" + "="*60)
        print("SAMPLE CREDENTIALS")
        print("="*60)
        print("\nAdmin:")
        print("  Email: admin@example.com")
        print("  Password: admin123")
        print("\nFaculty:")
        print("  Email: john.smith@faculty.com")
        print("  Password: faculty123")
        print("\nStudent:")
        print("  Email: alice@student.com")
        print("  Password: student123")
        print("="*60)
        
    except Exception as e:
        print(f"\n✗ Error seeding database: {e}")
        db.rollback()
    finally:
        db.close()


if __name__ == "__main__":
    print("="*60)
    print("DATABASE INITIALIZATION")
    print("="*60)
    
    init_db()
    seed_data()
    
    print("\nDatabase initialization complete!")

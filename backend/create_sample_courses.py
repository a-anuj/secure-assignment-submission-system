#!/usr/bin/env python3
"""
Simple script to create sample courses.
"""
import sys
import os
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))

from database import SessionLocal
from models.course import Course
from models.user import User, UserRole

def main():
    db = SessionLocal()
    
    try:
        # Check if courses exist
        existing = db.query(Course).first()
        if existing:
            print("✓ Courses already exist!")
            courses = db.query(Course).all()
            for c in courses:
                print(f"  - {c.code}: {c.name}")
            return
        
        # Get faculty
        faculty = db.query(User).filter(User.email == "john.smith@faculty.com").first()
        if not faculty:
            print("❌ Faculty not found! Run create_test_users.py first.")
            return
        
        print("Creating courses...")
        
        # Create 5 sample courses
        courses_data = [
            ("CS201", "Data Structures and Algorithms"),
            ("CS301", "Database Management Systems"),
            ("CS401", "Computer Networks"),
            ("CS402", "Operating Systems"),
            ("CS501", "Web Development"),
        ]
        
        for code, name in courses_data:
            course = Course(
                code=code,
                name=name,
                faculty_id=faculty.id
            )
            db.add(course)
            print(f"✓ Created: {code} - {name}")
        
        db.commit()
        print("\n✅ All courses created successfully!")
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    main()

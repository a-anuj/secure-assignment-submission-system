#!/usr/bin/env python3
"""
Add courses directly to database - FORCEFUL VERSION.
"""
import sys
sys.path.insert(0, '.')

import psycopg2
from config import settings

# Parse DATABASE_URL
db_url = settings.DATABASE_URL.replace('postgresql://', '')
user_pass, host_db = db_url.split('@')
user, password = user_pass.split(':')
host_port, database = host_db.split('/')
host = host_port.split(':')[0]

try:
    # Connect directly with psycopg2
    conn = psycopg2.connect(
        host=host,
        database=database,
        user=user,
        password=password
    )
    cur = conn.cursor()
    
    # Get faculty ID
    cur.execute("SELECT id FROM users WHERE email = 'john.smith@faculty.com' LIMIT 1")
    result = cur.fetchone()
    
    if not result:
        print("❌ Faculty user not found!")
        print("Run: python create_test_users.py")
    else:
        faculty_id = result[0]
        print(f"✓ Found faculty: {faculty_id}")
        
        # Check if courses exist
        cur.execute("SELECT COUNT(*) FROM courses")
        count = cur.fetchone()[0]
        
        if count > 0:
            print(f"✓ {count} courses already exist")
            cur.execute("SELECT code, name FROM courses")
            for row in cur.fetchall():
                print(f"  - {row[0]}: {row[1]}")
        else:
            print("Creating courses...")
            
            courses = [
                ("CS201", "Data Structures and Algorithms"),
                ("CS301", "Database Management Systems"),
                ("CS401", "Computer Networks"),
                ("CS402", "Operating Systems"),
                ("CS501", "Web Development"),
            ]
            
            for code, name in courses:
                cur.execute(
                    "INSERT INTO courses (id, code, name, faculty_id) VALUES (gen_random_uuid(), %s, %s, %s)",
                    (code, name, faculty_id)
                )
                print(f"✓ Created: {code} - {name}")
            
            conn.commit()
            print("\n✅ All courses created!")
    
    cur.close()
    conn.close()
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()

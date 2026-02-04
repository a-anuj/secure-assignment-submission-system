"""
Debug script to check authentication and user role.
Run this to identify why you're getting 403 Forbidden.
"""
import sys
from sqlalchemy.orm import Session
from database import SessionLocal
from models.user import User, UserRole
from utils.auth import verify_token

def check_token(token: str):
    """Check if a JWT token is valid and what role the user has."""
    print("\n" + "="*70)
    print("🔍 DEBUGGING AUTHENTICATION")
    print("="*70)
    
    # Verify token
    payload = verify_token(token)
    
    if payload is None:
        print("❌ Token is INVALID or EXPIRED")
        print("   Please log in again to get a fresh token.")
        return
    
    print("✅ Token is VALID")
    print(f"\nToken payload: {payload}")
    
    # Check user in database
    user_id = payload.get("user_id")
    if not user_id:
        print("❌ Token payload missing 'user_id'")
        return
    
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.id == user_id).first()
        
        if not user:
            print(f"❌ User not found in database (ID: {user_id})")
            return
        
        print(f"\n👤 User Information:")
        print(f"   - Email: {user.email}")
        print(f"   - Name: {user.name}")
        print(f"   - Role: {user.role.value}")
        
        print(f"\n🔐 Access Control:")
        if user.role == UserRole.ADMIN:
            print("   ✅ User HAS admin privileges")
            print("   → Should be able to access /api/admin/courses")
        else:
            print(f"   ❌ User DOES NOT have admin privileges")
            print(f"   → Current role is '{user.role.value}', need 'admin'")
            print(f"\n💡 Solution:")
            print(f"   1. Log in with an admin account, OR")
            print(f"   2. Promote this user to admin using another admin account, OR")
            print(f"   3. Update the database directly:")
            print(f"      UPDATE users SET role = 'admin' WHERE email = '{user.email}';")
    
    finally:
        db.close()
    
    print("="*70 + "\n")


def list_all_users():
    """List all users and their roles."""
    print("\n" + "="*70)
    print("👥 ALL USERS IN DATABASE")
    print("="*70)
    
    db = SessionLocal()
    try:
        users = db.query(User).all()
        
        if not users:
            print("No users found in database.")
            return
        
        print(f"\nTotal users: {len(users)}\n")
        
        for user in users:
            role_indicator = "👑" if user.role == UserRole.ADMIN else "👨‍🏫" if user.role == UserRole.FACULTY else "🎓"
            print(f"{role_indicator} {user.email:<30} | Role: {user.role.value:<10} | Name: {user.name}")
    
    finally:
        db.close()
    
    print("="*70 + "\n")


if __name__ == "__main__":
    if len(sys.argv) > 1:
        # Check specific token
        token = sys.argv[1]
        check_token(token)
    else:
        # List all users
        list_all_users()
        print("\nUsage: python debug_auth.py <your_jwt_token>")
        print("Copy your JWT token from the Authorization header and run:")
        print("  python debug_auth.py YOUR_TOKEN_HERE")

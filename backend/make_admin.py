"""
Quick tool to promote a user to admin role.
Usage: python make_admin.py <email>
"""
import sys
from database import SessionLocal
from models.user import User, UserRole

def make_admin(email: str):
    """Promote a user to admin role."""
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        
        if not user:
            print(f"❌ User not found: {email}")
            print("\nAvailable users:")
            all_users = db.query(User).all()
            for u in all_users:
                print(f"  - {u.email} ({u.role.value})")
            return
        
        if user.role == UserRole.ADMIN:
            print(f"✅ {email} is already an admin")
            return
        
        old_role = user.role.value
        user.role = UserRole.ADMIN
        db.commit()
        
        print(f"✅ Successfully promoted {email}")
        print(f"   Old role: {old_role}")
        print(f"   New role: admin")
        print("\n💡 The user needs to log in again to get a new JWT token with admin privileges.")
    
    except Exception as e:
        print(f"❌ Error: {e}")
        db.rollback()
    
    finally:
        db.close()


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <email>")
        print("Example: python make_admin.py anuj@student.com")
        sys.exit(1)
    
    email = sys.argv[1]
    make_admin(email)

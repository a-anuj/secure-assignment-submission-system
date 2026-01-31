"""
Access Control List (ACL) implementation for role-based permissions.
Implements RBAC (Role-Based Access Control) with permission checking.
"""
from functools import wraps
from typing import List, Callable
from fastapi import HTTPException, status, Depends
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from models.user import UserRole
from utils.auth import verify_token
from database import get_db

security = HTTPBearer()


# Permission definitions for ACL
PERMISSIONS = {
    # Assignment permissions
    "assignment:create": [UserRole.STUDENT],
    "assignment:read_own": [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN],
    "assignment:read_others": [UserRole.FACULTY, UserRole.ADMIN],
    "assignment:download": [UserRole.FACULTY, UserRole.ADMIN],
    "assignment:grade": [UserRole.FACULTY],
    
    # User management permissions
    "user:create": [UserRole.ADMIN],
    "user:read": [UserRole.ADMIN],
    "user:update": [UserRole.ADMIN],
    "user:delete": [UserRole.ADMIN],
    
    # Course permissions
    "course:create": [UserRole.ADMIN],
    "course:assign_faculty": [UserRole.ADMIN],
    "course:read": [UserRole.STUDENT, UserRole.FACULTY, UserRole.ADMIN],
}


def check_permission(role: UserRole, permission: str) -> bool:
    """
    Check if a role has a specific permission.
    
    Args:
        role: User role
        permission: Permission string (e.g., "assignment:create")
        
    Returns:
        True if role has permission, False otherwise
    """
    allowed_roles = PERMISSIONS.get(permission, [])
    return role in allowed_roles


def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Dependency to get current authenticated user from JWT token.
    
    Args:
        credentials: HTTP Bearer token
        db: Database session
        
    Returns:
        Current user object
        
    Raises:
        HTTPException: If token is invalid or user not found
    """
    from models.user import User
    
    token = credentials.credentials
    payload = verify_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token",
            headers={"WWW-Authenticate": "Bearer"},
        )
    
    user_id = payload.get("user_id")
    if user_id is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload",
        )
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found",
        )
    
    return user


def require_role(allowed_roles: List[UserRole]):
    """
    Decorator to require specific roles for endpoint access.
    
    Usage:
        @router.get("/student-only")
        @require_role([UserRole.STUDENT])
        def student_endpoint(current_user: User = Depends(get_current_user)):
            ...
    
    Args:
        allowed_roles: List of roles allowed to access the endpoint
        
    Returns:
        Decorator function
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            # Get current_user from kwargs
            current_user = kwargs.get("current_user")
            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if current_user.role not in allowed_roles:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required roles: {[r.value for r in allowed_roles]}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator


def require_permission(permission: str):
    """
    Decorator to require specific permission for endpoint access.
    
    Usage:
        @router.post("/assignments")
        @require_permission("assignment:create")
        def create_assignment(current_user: User = Depends(get_current_user)):
            ...
    
    Args:
        permission: Permission string required
        
    Returns:
        Decorator function
    """
    def decorator(func: Callable):
        @wraps(func)
        async def wrapper(*args, **kwargs):
            current_user = kwargs.get("current_user")
            if current_user is None:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Authentication required"
                )
            
            if not check_permission(current_user.role, permission):
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Access denied. Required permission: {permission}"
                )
            
            return await func(*args, **kwargs)
        return wrapper
    return decorator

"""
API routes package.
"""
from .auth import router as auth_router
from .student import router as student_router
from .faculty import router as faculty_router
from .admin import router as admin_router

__all__ = ["auth_router", "student_router", "faculty_router", "admin_router"]

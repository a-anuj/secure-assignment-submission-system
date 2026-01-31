"""
Database models package.
"""
from .user import User
from .assignment import Assignment
from .submission import Submission
from .otp import OTP
from .course import Course

__all__ = ["User", "Assignment", "Submission", "OTP", "Course"]

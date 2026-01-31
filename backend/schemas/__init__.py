"""
Pydantic schemas package.
"""
from .user import UserCreate, UserResponse, UserLogin
from .auth import TokenResponse, OTPVerifyRequest, RefreshTokenRequest
from .assignment import AssignmentUpload, AssignmentResponse, MySubmissionsResponse
from .submission import GradeAssignment, SubmissionResponse

__all__ = [
    "UserCreate",
    "UserResponse",
    "UserLogin",
    "TokenResponse",
    "OTPVerifyRequest",
    "RefreshTokenRequest",
    "AssignmentUpload",
    "AssignmentResponse",
    "MySubmissionsResponse",
    "GradeAssignment",
    "SubmissionResponse",
]

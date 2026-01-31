"""
Assignment-related Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime


class AssignmentUpload(BaseModel):
    """Schema for assignment upload (metadata only, file in form-data)."""
    course_id: str


class AssignmentResponse(BaseModel):
    """Schema for assignment data response."""
    id: str
    student_id: str
    course_id: str
    filename: str
    file_hash_sha256: str
    upload_timestamp: datetime
    is_graded: bool = False
    
    class Config:
        from_attributes = True


class MySubmissionsResponse(BaseModel):
    """Schema for student's submission with grading info."""
    id: str
    filename: str
    course_name: str
    upload_timestamp: datetime
    is_graded: bool
    marks: Optional[int] = None
    feedback: Optional[str] = None
    faculty_name: Optional[str] = None
    faculty_signature: Optional[str] = None

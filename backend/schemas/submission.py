"""
Submission/Grading-related Pydantic schemas.
"""
from pydantic import BaseModel, Field, field_serializer
from typing import Optional
from uuid import UUID
from datetime import datetime


class GradeAssignment(BaseModel):
    """Schema for faculty grading an assignment."""
    marks: int = Field(..., ge=0, le=100)
    feedback: Optional[str] = None


class SubmissionResponse(BaseModel):
    """Schema for submission/grading response."""
    id: UUID  # Accept UUID from database
    assignment_id: UUID
    faculty_id: UUID
    faculty_signature: str
    marks: int
    feedback: Optional[str]
    graded_timestamp: datetime
    
    # Serialize UUIDs to strings for JSON response
    @field_serializer('id', 'assignment_id', 'faculty_id')
    def serialize_uuid(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True

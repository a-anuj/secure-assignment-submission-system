"""
Course-related Pydantic schemas.
"""
from pydantic import BaseModel, Field
from typing import Optional


class CourseCreate(BaseModel):
    """Schema for creating a course."""
    name: str = Field(..., min_length=1, max_length=255)
    code: str = Field(..., min_length=1, max_length=50)


class CourseResponse(BaseModel):
    """Schema for course data response."""
    id: str
    name: str
    code: str
    faculty_id: Optional[str] = None
    faculty_name: Optional[str] = None
    
    class Config:
        from_attributes = True


class AssignFaculty(BaseModel):
    """Schema for assigning faculty to course."""
    course_id: str
    faculty_id: str

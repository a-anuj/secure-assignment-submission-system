"""
User-related Pydantic schemas for request/response validation.
"""
from pydantic import BaseModel, EmailStr, Field, field_serializer
from typing import Optional
from uuid import UUID
from models.user import UserRole
from datetime import datetime


class UserCreate(BaseModel):
    """Schema for user registration."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=100)
    role: UserRole = UserRole.STUDENT


class UserLogin(BaseModel):
    """Schema for user login."""
    email: EmailStr
    password: str


class UserResponse(BaseModel):
    """Schema for user data response."""
    id: UUID  # Accept UUID from database
    name: str
    email: str
    role: UserRole
    created_at: datetime
    
    # Serialize UUID to string for JSON response
    @field_serializer('id')
    def serialize_id(self, value: UUID) -> str:
        return str(value)
    
    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    """Schema for updating user information."""
    name: Optional[str] = Field(None, min_length=1, max_length=255)
    role: Optional[UserRole] = None

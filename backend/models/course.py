"""
Course model for assignment organization and faculty assignment.
"""
import uuid
from sqlalchemy import Column, String, ForeignKey
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from database import Base


class Course(Base):
    """
    Course model for organizing assignments.
    Faculty can be assigned to courses for grading.
    """
    __tablename__ = "courses"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    name = Column(String(255), nullable=False)
    code = Column(String(50), unique=True, nullable=False, index=True)
    
    # Faculty assignment
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=True)
    
    # Relationships
    faculty = relationship("User", foreign_keys=[faculty_id])
    
    def __repr__(self):
        return f"<Course {self.code}: {self.name}>"

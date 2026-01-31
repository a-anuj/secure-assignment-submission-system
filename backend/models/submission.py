"""
Submission/Grading model with digital signature support.
Faculty signs the assignment hash to verify grading authenticity.
"""
import uuid
from sqlalchemy import Column, Integer, ForeignKey, DateTime, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Submission(Base):
    """
    Submission/Grading model with digital signatures.
    
    Digital signature flow:
    1. Faculty reviews and grades assignment
    2. Faculty's private key signs the file hash (SHA-256)
    3. Signature stored with marks and feedback
    4. Student can verify signature using faculty's public key
    
    Security features:
    - RSA digital signature of file hash
    - Non-repudiation (faculty cannot deny grading)
    - Integrity verification (marks cannot be tampered)
    """
    __tablename__ = "submissions"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Assignment and faculty references
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("assignments.id"), nullable=False, unique=True)
    faculty_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    
    # Digital signature (RSA signature of file_hash_sha256)
    faculty_signature = Column(Text, nullable=False)  # Base64-encoded signature
    
    # Grading information
    marks = Column(Integer, nullable=False)
    feedback = Column(Text, nullable=True)
    
    graded_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    assignment = relationship("Assignment", foreign_keys=[assignment_id])
    faculty = relationship("User", foreign_keys=[faculty_id])
    
    def __repr__(self):
        return f"<Submission for Assignment {self.assignment_id}, graded by {self.faculty_id}>"

"""
Assignment model with hybrid encryption support.
Files are encrypted using AES-256, with the AES key encrypted using RSA.
"""
import uuid
from sqlalchemy import Column, String, ForeignKey, DateTime, LargeBinary, Text
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base


class Assignment(Base):
    """
    Assignment model with encrypted file storage.
    
    Encryption flow:
    1. Student uploads file
    2. Server generates random AES-256 key
    3. File encrypted with AES key
    4. AES key encrypted with faculty's RSA public key
    5. Both encrypted file and encrypted key stored
    
    Security features:
    - File stored encrypted (AES-256)
    - AES key encrypted with RSA-2048
    - SHA-256 hash for integrity verification
    - Base64 encoding for safe storage/transfer
    """
    __tablename__ = "assignments"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    
    # Student and course references
    student_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    course_id = Column(UUID(as_uuid=True), ForeignKey("courses.id"), nullable=False)
    
    # File information
    filename = Column(String(255), nullable=False)
    
    # Encrypted file storage (BYTEA for binary data)
    encrypted_file_blob = Column(LargeBinary, nullable=False)
    
    # File integrity and encryption
    file_hash_sha256 = Column(String(64), nullable=False)  # SHA-256 produces 64 hex chars
    aes_key_encrypted = Column(Text, nullable=False)  # RSA-encrypted AES key (Base64)
    
    upload_timestamp = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    student = relationship("User", foreign_keys=[student_id])
    course = relationship("Course", foreign_keys=[course_id])
    
    def __repr__(self):
        return f"<Assignment {self.filename} by {self.student_id}>"

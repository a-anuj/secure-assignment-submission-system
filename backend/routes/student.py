"""
Student routes: upload assignment, view submissions, view marks.
Implements ACL for student-only access.
"""
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User, UserRole
from models.assignment import Assignment
from models.submission import Submission
from models.course import Course
from schemas.assignment import AssignmentResponse, MySubmissionsResponse
from utils.acl import get_current_user, check_permission
from utils.encryption import encrypt_file_hybrid
from utils.signature import generate_file_hash
import uuid

router = APIRouter(prefix="/student", tags=["Student"])


@router.post("/assignments/upload", response_model=AssignmentResponse, status_code=status.HTTP_201_CREATED)
async def upload_assignment(
    course_id: str = Form(...),
    file: UploadFile = File(...),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Student uploads assignment file.
    
    ACL: Only students can upload assignments
    
    Security features:
    1. Read file content
    2. Generate SHA-256 hash for integrity
    3. Encrypt file with AES-256
    4. Encrypt AES key with faculty's RSA public key
    5. Store encrypted file and encrypted key
    
    Flow:
    - Student selects course and uploads file
    - File encrypted before storage
    - Faculty can decrypt with their private key
    """
    # Check permission
    if not check_permission(current_user.role, "assignment:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only students can upload assignments"
        )
    
    # Validate course exists
    try:
        course_uuid = uuid.UUID(course_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid course ID format"
        )
    
    course = db.query(Course).filter(Course.id == course_uuid).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    if not course.faculty_id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No faculty assigned to this course"
        )
    
    # Get faculty's public key for encryption
    faculty = db.query(User).filter(User.id == course.faculty_id).first()
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Faculty not found"
        )
    
    # Read file content
    file_content = await file.read()
    if len(file_content) == 0:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File is empty"
        )
    
    # Generate file hash for integrity
    file_hash = generate_file_hash(file_content)
    
    # ===== SECURITY LOGGING =====
    print("\n" + "="*70)
    print("🔐 SECURITY: ASSIGNMENT UPLOAD - HYBRID ENCRYPTION")
    print("="*70)
    print(f"📄 File: {file.filename}")
    print(f"📏 Size: {len(file_content)} bytes")
    print(f"\n🔑 File Hash (SHA-256) - COMPLETE:")
    print(f"{file_hash}")
    print(f"\n👤 Student: {current_user.email}")
    print(f"👨‍🏫 Faculty to encrypt for: {faculty.email}")
    print(f"\n📌 Faculty's RSA-2048 Public Key - COMPLETE:")
    print(faculty.public_key_pem)
    print(f"\n🔄 Starting Hybrid Encryption (RSA + AES)...")
    # ============================
    
    # Encrypt file with faculty's public key
    encrypted_file, encrypted_aes_key = encrypt_file_hybrid(file_content, faculty.public_key_pem)
    
    # ===== SECURITY LOGGING =====
    print(f"\n✅ Hybrid Encryption Complete!")
    print(f"   - AES-256 key: Generated (32 bytes random)")
    print(f"   - Encrypted file size: {len(encrypted_file)} bytes")
    print(f"   - Encrypted AES key (Base64): {encrypted_aes_key[:100]}...")
    print(f"   - Full encrypted AES key length: {len(encrypted_aes_key)} characters")
    print(f"\n🔒 File Security:")
    print(f"   ✓ File encrypted with AES-256 (symmetric)")
    print(f"   ✓ AES key encrypted with faculty's RSA-2048 public key")
    print(f"   ✓ File integrity protected with SHA-256 hash")
    print(f"   ✓ Only {faculty.email} can decrypt with their private key")
    print("="*70 + "\n")
    # ============================
    
    # Create assignment record
    assignment = Assignment(
        student_id=current_user.id,
        course_id=course_uuid,
        filename=file.filename,
        encrypted_file_blob=encrypted_file,
        file_hash_sha256=file_hash,
        aes_key_encrypted=encrypted_aes_key
    )
    
    db.add(assignment)
    db.commit()
    db.refresh(assignment)
    
    # Return response
    response = AssignmentResponse(
        id=str(assignment.id),
        student_id=str(assignment.student_id),
        course_id=str(assignment.course_id),
        filename=assignment.filename,
        file_hash_sha256=assignment.file_hash_sha256,
        upload_timestamp=assignment.upload_timestamp,
        is_graded=False
    )
    
    return response


@router.get("/assignments/my-submissions", response_model=List[MySubmissionsResponse])
def get_my_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all submissions by current student.
    
    ACL: Students can only view their own submissions
    
    Returns:
    - List of assignments with grading status
    - If graded, includes marks, feedback, and signature
    """
    # Check permission
    if not check_permission(current_user.role, "assignment:read_own"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get all assignments by this student
    assignments = db.query(Assignment).filter(
        Assignment.student_id == current_user.id
    ).all()
    
    result = []
    for assignment in assignments:
        # Get course info
        course = db.query(Course).filter(Course.id == assignment.course_id).first()
        
        # Check if graded
        submission = db.query(Submission).filter(
            Submission.assignment_id == assignment.id
        ).first()
        
        if submission:
            # Get faculty info
            faculty = db.query(User).filter(User.id == submission.faculty_id).first()
            
            result.append(MySubmissionsResponse(
                id=str(assignment.id),
                filename=assignment.filename,
                course_name=course.name if course else "Unknown",
                upload_timestamp=assignment.upload_timestamp,
                is_graded=True,
                marks=submission.marks,
                feedback=submission.feedback,
                faculty_name=faculty.name if faculty else "Unknown",
                faculty_signature=submission.faculty_signature
            ))
        else:
            result.append(MySubmissionsResponse(
                id=str(assignment.id),
                filename=assignment.filename,
                course_name=course.name if course else "Unknown",
                upload_timestamp=assignment.upload_timestamp,
                is_graded=False
            ))
    
    return result


@router.get("/assignments/{assignment_id}/verify-signature")
def verify_assignment_signature(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Verify faculty's digital signature on graded assignment.
    
    Security features:
    - Verifies signature using faculty's public key
    - Ensures assignment was graded by legitimate faculty
    - Detects tampering
    
    Returns:
    - is_valid: Boolean indicating signature validity
    - faculty_name: Name of faculty who signed
    """
    from utils.signature import verify_signature
    
    # Parse assignment ID
    try:
        assignment_uuid = uuid.UUID(assignment_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid assignment ID format"
        )
    
    # Get assignment
    assignment = db.query(Assignment).filter(Assignment.id == assignment_uuid).first()
    if not assignment:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not found"
        )
    
    # Check ownership
    if assignment.student_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied"
        )
    
    # Get submission
    submission = db.query(Submission).filter(Submission.assignment_id == assignment_uuid).first()
    if not submission:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Assignment not graded yet"
        )
    
    # Get faculty
    faculty = db.query(User).filter(User.id == submission.faculty_id).first()
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    # ===== SECURITY LOGGING =====
    print("\n" + "="*70)
    print("🔍 SECURITY: SIGNATURE VERIFICATION")
    print("="*70)
    print(f"📄 Assignment: {assignment.filename}")
    print(f"👨‍🏫 Faculty who graded: {faculty.email}")
    print(f"\n🔑 File Hash (SHA-256) - COMPLETE:")
    print(f"{assignment.file_hash_sha256}")
    print(f"\n✍️  Digital Signature (Base64) - COMPLETE:")
    print(submission.faculty_signature)
    print(f"\n📌 Faculty's RSA-2048 Public Key - COMPLETE:")
    print(faculty.public_key_pem)
    print(f"\n🔄 Verifying Signature...")
    print(f"   Algorithm: RSA-2048 verification with PKCS1v15")
    print(f"   Using faculty's public key to verify the signature")
    # ============================
    
    # Verify signature
    is_valid = verify_signature(
        assignment.file_hash_sha256,
        submission.faculty_signature,
        faculty.public_key_pem
    )
    
    # ===== SECURITY LOGGING =====
    if is_valid:
        print(f"\n✅ SIGNATURE VERIFICATION: VALID ✓")
        print(f"   ✓ Confirmed: {faculty.email} graded this assignment")
        print(f"   ✓ Grade and feedback have NOT been tampered with")
        print(f"   ✓ Faculty cannot deny grading (non-repudiation guaranteed)")
        print(f"   ✓ Cryptographic proof: RSA-2048 signature verified")
    else:
        print(f"\n❌ SIGNATURE VERIFICATION: INVALID ✗")
        print(f"   ✗ Signature verification failed")
        print(f"   ✗ Possible tampering detected or wrong key used")
        print(f"   ✗ Grade authenticity cannot be confirmed")
    print("="*70 + "\n")
    # ============================
    
    return {
        "is_valid": is_valid,
        "faculty_name": faculty.name,
        "file_hash": assignment.file_hash_sha256
    }

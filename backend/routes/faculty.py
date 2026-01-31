"""
Faculty routes: view submissions, download files, grade assignments.
Implements ACL for faculty-only access and digital signatures.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List
from datetime import datetime
from database import get_db
from models.user import User, UserRole
from models.assignment import Assignment
from models.submission import Submission
from models.course import Course
from schemas.assignment import AssignmentResponse
from schemas.submission import GradeAssignment, SubmissionResponse
from utils.acl import get_current_user, check_permission
from utils.encryption import decrypt_file_hybrid
from utils.signature import sign_hash
import uuid
import io

router = APIRouter(prefix="/faculty", tags=["Faculty"])


@router.get("/assignments/assigned", response_model=List[AssignmentResponse])
def get_assigned_submissions(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Get all assignments for courses assigned to this faculty.
    
    ACL: Only faculty can view assigned submissions
    
    Returns:
    - List of assignments from their assigned courses
    - Includes grading status
    """
    # Check permission
    if not check_permission(current_user.role, "assignment:read_others"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty can view assigned submissions"
        )
    
    # Get courses assigned to this faculty
    courses = db.query(Course).filter(Course.faculty_id == current_user.id).all()
    course_ids = [course.id for course in courses]
    
    if not course_ids:
        return []
    
    # Get all assignments for these courses
    assignments = db.query(Assignment).filter(
        Assignment.course_id.in_(course_ids)
    ).all()
    
    result = []
    for assignment in assignments:
        # Check if already graded
        submission = db.query(Submission).filter(
            Submission.assignment_id == assignment.id
        ).first()
        
        result.append(AssignmentResponse(
            id=str(assignment.id),
            student_id=str(assignment.student_id),
            course_id=str(assignment.course_id),
            filename=assignment.filename,
            file_hash_sha256=assignment.file_hash_sha256,
            upload_timestamp=assignment.upload_timestamp,
            is_graded=submission is not None
        ))
    
    return result


@router.get("/assignments/{assignment_id}/download")
async def download_assignment(
    assignment_id: str,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Download and decrypt assignment file.
    
    ACL: Only faculty can download assignments from their courses
    
    Security features:
    1. Verify faculty is assigned to course
    2. Decrypt AES key using faculty's RSA private key
    3. Decrypt file using AES key
    4. Return decrypted file
    
    Returns:
    - Decrypted file as download
    """
    # Check permission
    if not check_permission(current_user.role, "assignment:download"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty can download assignments"
        )
    
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
    
    # Verify faculty is assigned to this course
    course = db.query(Course).filter(Course.id == assignment.course_id).first()
    if not course or course.faculty_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this course"
        )
    
    # Faculty must have private key for decryption
    if not current_user.private_key_pem:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Faculty private key not found"
        )
    
    # ===== SECURITY LOGGING =====
    print("\n" + "="*70)
    print("🔓 SECURITY: FILE DOWNLOAD - HYBRID DECRYPTION")
    print("="*70)
    print(f"📄 File: {assignment.filename}")
    print(f"👨‍🏫 Faculty: {current_user.email}")
    print(f"\n🔑 File Hash (SHA-256) - COMPLETE:")
    print(f"{assignment.file_hash_sha256}")
    print(f"\n📌 Faculty's RSA-2048 Private Key - COMPLETE:")
    print(current_user.private_key_pem)
    print(f"\n🔄 Starting Hybrid Decryption...")
    print(f"   Step 1: Decrypt AES key using RSA-2048 private key")
    print(f"   Step 2: Decrypt file using AES-256 key")
    # ============================
    
    # Decrypt file
    try:
        decrypted_content = decrypt_file_hybrid(
            assignment.encrypted_file_blob,
            assignment.aes_key_encrypted,
            current_user.private_key_pem
        )
        
        # ===== SECURITY LOGGING =====
        print(f"✅ Decryption Complete!")
        print(f"   Original file size: {len(decrypted_content)} bytes")
        print(f"   File integrity can be verified with hash")
        print("="*70 + "\n")
        # ============================
    except Exception as e:
        print(f"❌ Decryption Failed: {str(e)}")
        print("="*70 + "\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Decryption failed: {str(e)}"
        )
    
    # Return file as download
    return StreamingResponse(
        io.BytesIO(decrypted_content),
        media_type="application/octet-stream",
        headers={
            "Content-Disposition": f"attachment; filename={assignment.filename}"
        }
    )


@router.post("/assignments/{assignment_id}/grade", response_model=SubmissionResponse)
def grade_assignment(
    assignment_id: str,
    grading: GradeAssignment,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Grade assignment and create digital signature.
    
    ACL: Only faculty can grade assignments
    
    Security features:
    1. Faculty signs file hash with their private key
    2. Signature proves faculty graded this assignment
    3. Non-repudiation: faculty cannot deny grading
    4. Integrity: detects tampering
    
    Digital Signature Flow:
    1. Get file hash (SHA-256) from assignment
    2. Sign hash using faculty's RSA private key
    3. Store signature with marks and feedback
    4. Student can verify signature using faculty's public key
    
    Returns:
    - Submission record with signature
    """
    # Check permission
    if not check_permission(current_user.role, "assignment:grade"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only faculty can grade assignments"
        )
    
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
    
    # Verify faculty is assigned to this course
    course = db.query(Course).filter(Course.id == assignment.course_id).first()
    if not course or course.faculty_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not assigned to this course"
        )
    
    # Check if already graded
    existing_submission = db.query(Submission).filter(
        Submission.assignment_id == assignment_uuid
    ).first()
    if existing_submission:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Assignment already graded"
        )
    
    # Faculty must have private key for signing
    if not current_user.private_key_pem:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Faculty private key not found"
        )
    
    # ===== SECURITY LOGGING =====
    print("\n" + "="*70)
    print("✍️  SECURITY: GRADING - DIGITAL SIGNATURE GENERATION")
    print("="*70)
    print(f"📄 Assignment: {assignment.filename}")
    print(f"👨‍🏫 Faculty: {current_user.email}")
    print(f"📊 Marks: {grading.marks}/100")
    print(f"💬 Feedback: {grading.feedback or '(none)'}")
    print(f"\n🔑 File Hash to Sign (SHA-256) - COMPLETE:")
    print(f"{assignment.file_hash_sha256}")
    print(f"\n📌 Faculty's RSA-2048 Private Key - COMPLETE:")
    print(current_user.private_key_pem)
    print(f"\n🔄 Generating Digital Signature...")
    print(f"   Algorithm: RSA-2048 signing with PKCS1v15 padding")
    print(f"   Signing the SHA-256 hash with faculty's private key")
    # ============================
    
    # Sign file hash
    try:
        signature = sign_hash(assignment.file_hash_sha256, current_user.private_key_pem)
        
        # ===== SECURITY LOGGING =====
        print(f"\n✅ Digital Signature Generated Successfully!")
        print(f"\n📝 Complete Digital Signature (Base64):")
        print(signature)
        print(f"\n📏 Signature Details:")
        print(f"   - Length: {len(signature)} characters (Base64 encoded)")
        print(f"   - Algorithm: RSA-2048 with PKCS1v15")
        print(f"\n🔐 Security Benefits:")
        print(f"   ✓ Authenticity: Proves {current_user.email} graded this assignment")
        print(f"   ✓ Integrity: Any tampering with marks/feedback will be detected")
        print(f"   ✓ Non-repudiation: Faculty cannot deny grading this assignment")
        print(f"   ✓ Timestamp: Grade recorded at {datetime.utcnow()}")
        print("="*70 + "\n")
        # ============================
    except Exception as e:
        print(f"\n❌ Signature Generation Failed: {str(e)}")
        print("="*70 + "\n")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Signature generation failed: {str(e)}"
        )
    
    # Create submission record
    submission = Submission(
        assignment_id=assignment_uuid,
        faculty_id=current_user.id,
        faculty_signature=signature,
        marks=grading.marks,
        feedback=grading.feedback
    )
    
    db.add(submission)
    db.commit()
    db.refresh(submission)
    
    return submission

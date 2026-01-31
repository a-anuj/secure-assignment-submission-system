"""
Admin routes: user management, course management, faculty assignment.
Implements ACL for admin-only access.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List
from database import get_db
from models.user import User, UserRole
from models.course import Course
from schemas.user import UserCreate, UserResponse, UserUpdate
from schemas.course import CourseCreate, CourseResponse, AssignFaculty
from utils.acl import get_current_user, check_permission
from utils.auth import hash_password
from utils.encryption import generate_rsa_keypair
import uuid

router = APIRouter(prefix="/admin", tags=["Admin"])


@router.get("/users", response_model=List[UserResponse])
def list_users(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all users in the system.
    
    ACL: Only admins can view all users
    """
    # Check permission
    if not check_permission(current_user.role, "user:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all users"
        )
    
    users = db.query(User).all()
    return users


@router.post("/users", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
def create_user(
    user_data: UserCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new user (admin function).
    
    ACL: Only admins can create users
    
    This allows admins to create faculty accounts directly.
    """
    # Check permission
    if not check_permission(current_user.role, "user:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create users"
        )
    
    # Check if user already exists
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Hash password
    password_hash = hash_password(user_data.password)
    
    # Generate RSA key pair
    public_key_pem, private_key_pem = generate_rsa_keypair()
    
    # Create user
    new_user = User(
        name=user_data.name,
        email=user_data.email,
        role=user_data.role,
        password_hash=password_hash,
        public_key_pem=public_key_pem,
        # Only faculty get private key for signing
        private_key_pem=private_key_pem if user_data.role == UserRole.FACULTY else None
    )
    
    db.add(new_user)
    db.commit()
    db.refresh(new_user)
    
    return new_user


@router.put("/users/{user_id}/role", response_model=UserResponse)
def update_user_role(
    user_id: str,
    update_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Update user information (primarily role).
    
    ACL: Only admins can update users
    """
    # Check permission
    if not check_permission(current_user.role, "user:update"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can update users"
        )
    
    # Parse user ID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format"
        )
    
    # Get user
    user = db.query(User).filter(User.id == user_uuid).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update fields
    if update_data.name:
        user.name = update_data.name
    
    if update_data.role:
        old_role = user.role
        user.role = update_data.role
        
        # If promoting to faculty, generate private key if not exists
        if update_data.role == UserRole.FACULTY and not user.private_key_pem:
            _, private_key_pem = generate_rsa_keypair()
            user.private_key_pem = private_key_pem
        
        # If demoting from faculty, could remove private key (optional)
        # For safety, we'll keep it
    
    db.commit()
    db.refresh(user)
    
    return user


@router.get("/courses", response_model=List[CourseResponse])
def list_courses(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    List all courses.
    
    ACL: Only admins can view all courses
    """
    # Check permission
    if not check_permission(current_user.role, "course:read"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can view all courses"
        )
    
    courses = db.query(Course).all()
    
    result = []
    for course in courses:
        faculty = None
        if course.faculty_id:
            faculty = db.query(User).filter(User.id == course.faculty_id).first()
        
        result.append(CourseResponse(
            id=str(course.id),
            name=course.name,
            code=course.code,
            faculty_id=str(course.faculty_id) if course.faculty_id else None,
            faculty_name=faculty.name if faculty else None
        ))
    
    return result


@router.post("/courses", response_model=CourseResponse, status_code=status.HTTP_201_CREATED)
def create_course(
    course_data: CourseCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Create a new course.
    
    ACL: Only admins can create courses
    """
    # Check permission
    if not check_permission(current_user.role, "course:create"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can create courses"
        )
    
    # Check if course code already exists
    existing_course = db.query(Course).filter(Course.code == course_data.code).first()
    if existing_course:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Course code already exists"
        )
    
    # Create course
    course = Course(
        name=course_data.name,
        code=course_data.code
    )
    
    db.add(course)
    db.commit()
    db.refresh(course)
    
    return CourseResponse(
        id=str(course.id),
        name=course.name,
        code=course.code,
        faculty_id=None,
        faculty_name=None
    )


@router.post("/courses/assign-faculty")
def assign_faculty_to_course(
    assignment: AssignFaculty,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Assign faculty to a course.
    
    ACL: Only admins can assign faculty
    """
    # Check permission
    if not check_permission(current_user.role, "course:assign_faculty"):
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only admins can assign faculty"
        )
    
    # Parse IDs
    try:
        course_uuid = uuid.UUID(assignment.course_id)
        faculty_uuid = uuid.UUID(assignment.faculty_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format"
        )
    
    # Get course
    course = db.query(Course).filter(Course.id == course_uuid).first()
    if not course:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Course not found"
        )
    
    # Get faculty
    faculty = db.query(User).filter(User.id == faculty_uuid).first()
    if not faculty:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Faculty not found"
        )
    
    # Verify user is faculty
    if faculty.role != UserRole.FACULTY:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="User is not a faculty member"
        )
    
    # Assign faculty to course
    course.faculty_id = faculty_uuid
    db.commit()
    
    return {
        "message": "Faculty assigned successfully",
        "course_id": str(course.id),
        "course_name": course.name,
        "faculty_id": str(faculty.id),
        "faculty_name": faculty.name
    }

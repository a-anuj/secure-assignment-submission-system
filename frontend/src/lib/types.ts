/**
 * TypeScript type definitions for the application.
 */

export enum UserRole {
    STUDENT = 'student',
    FACULTY = 'faculty',
    ADMIN = 'admin',
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole;
    created_at: string;
}

export interface LoginResponse {
    access_token: string;
    refresh_token: string;
    token_type: string;
    user_id: string;
    role: string;
    requires_otp: boolean;
}

export interface Assignment {
    id: string;
    student_id: string;
    course_id: string;
    filename: string;
    file_hash_sha256: string;
    upload_timestamp: string;
    is_graded: boolean;
}

export interface MySubmission {
    id: string;
    filename: string;
    course_name: string;
    upload_timestamp: string;
    is_graded: boolean;
    marks?: number;
    feedback?: string;
    faculty_name?: string;
    faculty_signature?: string;
}

export interface Submission {
    id: string;
    assignment_id: string;
    faculty_id: string;
    faculty_signature: string;
    marks: number;
    feedback?: string;
    graded_timestamp: string;
}

export interface Course {
    id: string;
    name: string;
    code: string;
    faculty_id?: string;
    faculty_name?: string;
}

export interface SignatureVerification {
    is_valid: boolean;
    faculty_name: string;
    file_hash: string;
}

/**
 * Main App component with routing.
 */
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './lib/auth';
import { ProtectedRoute } from './components/ProtectedRoute';
import { RoleRoute } from './components/RoleRoute';
import { Login } from './pages/Login';
import { OTPVerification } from './pages/OTPVerification';
import { StudentDashboard } from './pages/StudentDashboard';
import { FacultyDashboard } from './pages/FacultyDashboard';
import { AdminDashboard } from './pages/AdminDashboard';
import { UploadAssignment } from './pages/UploadAssignment';
import { MySubmissions } from './pages/MySubmissions';
import { ReviewAssignments } from './pages/ReviewAssignments';
import { ManageUsers } from './pages/ManageUsers';
import { ManageCourses } from './pages/ManageCourses';
import { UserRole } from './lib/types';
import './index.css';

function AppRoutes() {
    const { user } = useAuth();

    const getRoleDashboard = () => {
        if (!user) return '/login';
        switch (user.role) {
            case UserRole.STUDENT:
                return '/student';
            case UserRole.FACULTY:
                return '/faculty';
            case UserRole.ADMIN:
                return '/admin';
            default:
                return '/login';
        }
    };

    return (
        <Routes>
            {/* Public routes */}
            <Route path="/login" element={
                user ? <Navigate to={getRoleDashboard()} replace /> : <Login />
            } />
            <Route path="/otp-verify" element={<OTPVerification />} />

            {/* Protected routes */}
            <Route path="/" element={
                <ProtectedRoute>
                    <Navigate to={getRoleDashboard()} replace />
                </ProtectedRoute>
            } />

            {/* Student routes */}
            <Route path="/student" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.STUDENT]}>
                        <StudentDashboard />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            <Route path="/student/upload" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.STUDENT]}>
                        <UploadAssignment />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            <Route path="/student/submissions" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.STUDENT]}>
                        <MySubmissions />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            {/* Faculty routes */}
            <Route path="/faculty" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.FACULTY]}>
                        <FacultyDashboard />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            <Route path="/faculty/submissions" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.FACULTY]}>
                        <ReviewAssignments />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            {/* Admin routes */}
            <Route path="/admin" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.ADMIN]}>
                        <AdminDashboard />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            <Route path="/admin/users" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.ADMIN]}>
                        <ManageUsers />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            <Route path="/admin/courses" element={
                <ProtectedRoute>
                    <RoleRoute allowedRoles={[UserRole.ADMIN]}>
                        <ManageCourses />
                    </RoleRoute>
                </ProtectedRoute>
            } />

            {/* Fallback */}
            <Route path="/unauthorized" element={
                <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                    <div className="card max-w-md">
                        <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
                        <p className="text-gray-600">You don't have permission to access this page.</p>
                    </div>
                </div>
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <AppRoutes />
            </AuthProvider>
        </Router>
    );
}

export default App;

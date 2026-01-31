/**
 * Navigation bar component with role-based menu.
 */
import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';
import { UserRole } from '../lib/types';

export const Navbar = () => {
    const { user, logout, isAuthenticated } = useAuth();

    if (!isAuthenticated || !user) {
        return null;
    }

    const getDashboardLink = () => {
        switch (user.role) {
            case UserRole.STUDENT:
                return '/student';
            case UserRole.FACULTY:
                return '/faculty';
            case UserRole.ADMIN:
                return '/admin';
            default:
                return '/';
        }
    };

    return (
        <nav className="bg-white shadow-md border-b border-gray-200">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={getDashboardLink()} className="flex items-center">
                            <span className="text-2xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent">
                                🔒 SecureSubmit
                            </span>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            <Link to={getDashboardLink()} className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                                Dashboard
                            </Link>

                            {user.role === UserRole.STUDENT && (
                                <>
                                    <Link to="/student/upload" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                                        Upload Assignment
                                    </Link>
                                    <Link to="/student/submissions" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                                        My Submissions
                                    </Link>
                                </>
                            )}

                            {user.role === UserRole.FACULTY && (
                                <Link to="/faculty/submissions" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                                    Review Submissions
                                </Link>
                            )}

                            {user.role === UserRole.ADMIN && (
                                <>
                                    <Link to="/admin/users" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                                        Users
                                    </Link>
                                    <Link to="/admin/courses" className="text-gray-700 hover:text-primary-600 px-3 py-2 text-sm font-medium transition-colors">
                                        Courses
                                    </Link>
                                </>
                            )}
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm">
                            <p className="text-gray-700 font-medium">{user.name}</p>
                            <p className="text-gray-500 text-xs capitalize">{user.role}</p>
                        </div>
                        <button
                            onClick={logout}
                            className="btn btn-secondary text-sm"
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </div>
        </nav>
    );
};

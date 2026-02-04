/**
 * Navigation bar component with role-based menu.
 */
import { useAuth } from '../lib/auth';
import { Link } from 'react-router-dom';
import { UserRole } from '../lib/types';

export const Navbar = () => {
    const { user, logout, confirmLogout, isAuthenticated } = useAuth();

    const handleLogoutClick = async () => {
        const confirmed = await confirmLogout();
        if (confirmed) {
            logout();
        }
    };

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
        <nav className="bg-gradient-to-r from-slate-900/80 via-slate-800/80 to-slate-900/80 backdrop-blur-xl border-b border-cyan-500/20 sticky top-0 z-50 shadow-2xl shadow-cyan-500/10">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex justify-between h-16">
                    <div className="flex items-center">
                        <Link to={getDashboardLink()} className="flex items-center group">
                            <span className="text-2xl font-bold bg-gradient-to-r from-cyan-400 via-blue-500 to-purple-600 bg-clip-text text-transparent group-hover:from-cyan-300 group-hover:to-pink-500 transition-all duration-300">
                                🔒 SecureSubmit
                            </span>
                        </Link>

                        <div className="hidden md:ml-10 md:flex md:space-x-8">
                            <Link to={getDashboardLink()} className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                Dashboard
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                            </Link>

                            {user.role === UserRole.STUDENT && (
                                <>
                                    <Link to="/student/upload" className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                        Upload Assignment
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                    <Link to="/student/submissions" className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                        My Submissions
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                </>
                            )}

                            {user.role === UserRole.FACULTY && (
                                <Link to="/faculty/submissions" className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                    Review Submissions
                                    <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                                </Link>
                            )}

                            {user.role === UserRole.ADMIN && (
                                <>
                                    <Link to="/admin/users" className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                        Users
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                    <Link to="/admin/courses" className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                        Courses
                                        <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                                    </Link>
                                </>
                            )}

                            <Link to="/encoding-techniques" className="text-slate-300 hover:text-cyan-400 px-3 py-2 text-sm font-medium transition-colors duration-300 relative group">
                                🔐 Security
                                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-cyan-400 to-blue-500 group-hover:w-full transition-all duration-300"></span>
                            </Link>
                        </div>
                    </div>

                    <div className="flex items-center space-x-4">
                        <div className="text-sm text-right">
                            <p className="text-slate-200 font-semibold">{user.name}</p>
                            <p className="text-cyan-400/70 text-xs capitalize font-medium">{user.role}</p>
                        </div>
                        <button
                            onClick={handleLogoutClick}
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

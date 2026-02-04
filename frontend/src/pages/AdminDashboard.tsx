/**
 * Admin dashboard with user and course management.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../lib/api';
import { User, Course } from '../lib/types';

export const AdminDashboard = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [courses, setCourses] = useState<Course[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [usersRes, coursesRes] = await Promise.all([
                    api.get('/admin/users'),
                    api.get('/admin/courses'),
                ]);
                setUsers(usersRes.data);
                setCourses(coursesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const studentCount = users.filter(u => u.role === 'student').length;
    const facultyCount = users.filter(u => u.role === 'faculty').length;

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
                    <p className="text-slate-400 mt-2 font-medium">Manage users and courses</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:shadow-xl hover:shadow-cyan-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Total Users</p>
                                <p className="text-4xl font-bold text-cyan-300 mt-3">{users.length}</p>
                            </div>
                            <div className="text-5xl">👥</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Students</p>
                                <p className="text-4xl font-bold text-emerald-300 mt-3">{studentCount}</p>
                            </div>
                            <div className="text-5xl">🎓</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-xl hover:shadow-purple-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Faculty</p>
                                <p className="text-4xl font-bold text-purple-300 mt-3">{facultyCount}</p>
                            </div>
                            <div className="text-5xl">👨‍🏫</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-900/30 to-amber-900/30 border-orange-500/30 hover:border-orange-500/60 transition-all hover:shadow-xl hover:shadow-orange-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Courses</p>
                                <p className="text-4xl font-bold text-orange-300 mt-3">{courses.length}</p>
                            </div>
                            <div className="text-5xl">📚</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/admin/users" className="group cursor-pointer">
                        <div className="card hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-all">
                                        <span className="text-3xl">👤</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:gradient-text transition-all">Manage Users</h3>
                                    <p className="text-sm text-slate-400">Create and manage user accounts</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/courses" className="group cursor-pointer">
                        <div className="card hover:border-pink-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-pink-500/20">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-pink-500/20 to-red-500/20 rounded-xl flex items-center justify-center group-hover:from-pink-500/40 group-hover:to-red-500/40 transition-all">
                                        <span className="text-3xl">📖</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:gradient-text-warm transition-all">Manage Courses</h3>
                                    <p className="text-sm text-slate-400">Create courses and assign faculty</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Recent Added Users</h2>
                            <Link to="/admin/users" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                                View All →
                            </Link>
                        </div>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
                                <p className="text-slate-400 mt-4 font-medium">Loading users...</p>
                            </div>
                        ) : users.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 font-medium">No users yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.slice(-5).reverse().map((user, idx) => (
                                    <div key={user.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/40 to-slate-900/40 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center font-bold text-cyan-400">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-100">{user.name}</p>
                                                <p className="text-xs text-slate-400">{user.email}</p>
                                            </div>
                                        </div>
                                        <span className="inline-block px-3 py-1 bg-gradient-to-r from-cyan-600/30 to-cyan-500/30 text-cyan-300 text-xs font-bold rounded-full border border-cyan-500/30 capitalize">
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-bold gradient-text">Recent Added Courses</h2>
                            <Link to="/admin/courses" className="text-cyan-400 hover:text-cyan-300 text-sm font-semibold">
                                View All →
                            </Link>
                        </div>
                        {loading ? (
                            <div className="text-center py-12">
                                <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
                                <p className="text-slate-400 mt-4 font-medium">Loading courses...</p>
                            </div>
                        ) : courses.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-slate-400 font-medium">No courses yet</p>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {courses.slice(-5).reverse().map((course, idx) => (
                                    <div key={course.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-slate-800/40 to-slate-900/40 rounded-lg border border-slate-700/30 hover:border-cyan-500/30 transition-all hover:shadow-lg hover:shadow-cyan-500/10">
                                        <div className="flex items-center space-x-3">
                                            <div className="flex-shrink-0 w-10 h-10 rounded-full bg-gradient-to-br from-cyan-500/20 to-blue-500/20 flex items-center justify-center font-bold text-cyan-400">
                                                {idx + 1}
                                            </div>
                                            <div>
                                                <p className="font-semibold text-slate-100">{course.code} - {course.name}</p>
                                                <p className="text-xs text-slate-400">
                                                    {course.faculty_name ? `👨‍🏫 ${course.faculty_name}` : '⚠️ No faculty assigned'}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

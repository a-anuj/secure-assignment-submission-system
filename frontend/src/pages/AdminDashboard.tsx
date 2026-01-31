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
    const adminCount = users.filter(u => u.role === 'admin').length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage users and courses</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Users</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{users.length}</p>
                            </div>
                            <div className="text-4xl">👥</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Students</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">{studentCount}</p>
                            </div>
                            <div className="text-4xl">🎓</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Faculty</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">{facultyCount}</p>
                            </div>
                            <div className="text-4xl">👨‍🏫</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-orange-50 to-orange-100 border-orange-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-orange-600">Courses</p>
                                <p className="text-3xl font-bold text-orange-900 mt-2">{courses.length}</p>
                            </div>
                            <div className="text-4xl">📚</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/admin/users" className="card hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <span className="text-2xl">👤</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Manage Users</h3>
                                <p className="text-sm text-gray-600">Create and manage user accounts</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/admin/courses" className="card hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <span className="text-2xl">📖</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Manage Courses</h3>
                                <p className="text-sm text-gray-600">Create courses and assign faculty</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Users</h2>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {users.slice(0, 5).map((user) => (
                                    <div key={user.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{user.name}</p>
                                            <p className="text-sm text-gray-600">{user.email}</p>
                                        </div>
                                        <span className="inline-block px-2 py-1 bg-primary-100 text-primary-700 text-xs font-medium rounded capitalize">
                                            {user.role}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="card">
                        <h2 className="text-xl font-bold text-gray-900 mb-4">Courses</h2>
                        {loading ? (
                            <div className="text-center py-8">
                                <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                            </div>
                        ) : (
                            <div className="space-y-3">
                                {courses.slice(0, 5).map((course) => (
                                    <div key={course.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="font-medium text-gray-900">{course.name}</p>
                                            <p className="text-sm text-gray-600">{course.code}</p>
                                        </div>
                                        <p className="text-xs text-gray-500">
                                            {course.faculty_name || 'Unassigned'}
                                        </p>
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

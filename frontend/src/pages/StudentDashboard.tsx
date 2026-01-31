/**
 * Student dashboard with submission overview and quick actions.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../lib/api';
import { MySubmission } from '../lib/types';

export const StudentDashboard = () => {
    const [submissions, setSubmissions] = useState<MySubmission[]>([]);
    const [courses, setCourses] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [submissionsRes, coursesRes] = await Promise.all([
                    api.get('/student/assignments/my-submissions'),
                    api.get('/admin/courses'), // Get all courses
                ]);
                setSubmissions(submissionsRes.data);
                setCourses(coursesRes.data);
            } catch (error) {
                console.error('Error fetching data:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const gradedCount = submissions.filter(s => s.is_graded).length;
    const pendingCount = submissions.filter(s => !s.is_graded).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Student Dashboard</h1>
                    <p className="text-gray-600 mt-1">Manage your assignments and view grades</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-blue-600">Total Submissions</p>
                                <p className="text-3xl font-bold text-blue-900 mt-2">{submissions.length}</p>
                            </div>
                            <div className="text-4xl">📝</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-green-50 to-green-100 border-green-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-green-600">Graded</p>
                                <p className="text-3xl font-bold text-green-900 mt-2">{gradedCount}</p>
                            </div>
                            <div className="text-4xl">✅</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-yellow-600">Pending Review</p>
                                <p className="text-3xl font-bold text-yellow-900 mt-2">{pendingCount}</p>
                            </div>
                            <div className="text-4xl">⏳</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/student/upload" className="card hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <span className="text-2xl">📤</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Upload Assignment</h3>
                                <p className="text-sm text-gray-600">Submit a new assignment with encryption</p>
                            </div>
                        </div>
                    </Link>

                    <Link to="/student/submissions" className="card hover:shadow-lg transition-all group cursor-pointer">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <span className="text-2xl">📋</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">My Submissions</h3>
                                <p className="text-sm text-gray-600">View all submissions and grades</p>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Submissions */}
                <div className="card">
                    <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Submissions</h2>

                    {loading ? (
                        <div className="text-center py-8">
                            <div className="inline-block animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary-600"></div>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No submissions yet. Upload your first assignment!</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.slice(0, 5).map((submission) => (
                                <div key={submission.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{submission.filename}</p>
                                        <p className="text-sm text-gray-600">{submission.course_name}</p>
                                    </div>
                                    <div className="text-right ml-4">
                                        {submission.is_graded ? (
                                            <div>
                                                <p className="font-semibold text-green-600">{submission.marks}/100</p>
                                                <p className="text-xs text-gray-500">Graded by {submission.faculty_name}</p>
                                            </div>
                                        ) : (
                                            <span className="inline-block px-3 py-1 bg-yellow-100 text-yellow-700 text-sm font-medium rounded-full">
                                                Pending
                                            </span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * Faculty dashboard with submission review and grading overview.
 */
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '../components/Navbar';
import api from '../lib/api';
import { Assignment } from '../lib/types';

export const FacultyDashboard = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchAssignments = async () => {
            try {
                const response = await api.get('/faculty/assignments/assigned');
                setAssignments(response.data);
            } catch (error) {
                console.error('Error fetching assignments:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchAssignments();
    }, []);

    const gradedCount = assignments.filter(a => a.is_graded).length;
    const pendingCount = assignments.filter(a => !a.is_graded).length;

    return (
        <div className="min-h-screen bg-gray-50">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Faculty Dashboard</h1>
                    <p className="text-gray-600 mt-1">Review and grade student submissions</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-purple-600">Total Submissions</p>
                                <p className="text-3xl font-bold text-purple-900 mt-2">{assignments.length}</p>
                            </div>
                            <div className="text-4xl">📚</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-50 to-red-100 border-red-200">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm font-medium text-red-600">Pending Review</p>
                                <p className="text-3xl font-bold text-red-900 mt-2">{pendingCount}</p>
                            </div>
                            <div className="text-4xl">⏰</div>
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
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <Link to="/faculty/submissions" className="card hover:shadow-lg transition-all group cursor-pointer inline-block">
                        <div className="flex items-center">
                            <div className="flex-shrink-0">
                                <div className="w-12 h-12 bg-primary-100 rounded-lg flex items-center justify-center group-hover:bg-primary-200 transition-colors">
                                    <span className="text-2xl">📝</span>
                                </div>
                            </div>
                            <div className="ml-4">
                                <h3 className="text-lg font-semibold text-gray-900 group-hover:text-primary-600">Review Submissions</h3>
                                <p className="text-sm text-gray-600">Download, review, and grade student assignments</p>
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
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-600">No submissions yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.slice(0, 5).map((assignment) => (
                                <div key={assignment.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                                    <div className="flex-1">
                                        <p className="font-medium text-gray-900">{assignment.filename}</p>
                                        <p className="text-sm text-gray-600">
                                            Uploaded: {new Date(assignment.upload_timestamp).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="ml-4">
                                        {assignment.is_graded ? (
                                            <span className="inline-block px-3 py-1 bg-green-100 text-green-700 text-sm font-medium rounded-full">
                                                Graded
                                            </span>
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

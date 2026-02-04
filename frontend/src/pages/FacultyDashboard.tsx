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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold gradient-text-warm">Faculty Dashboard</h1>
                    <p className="text-slate-400 mt-2 font-medium">Review and grade student submissions</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-purple-900/30 to-indigo-900/30 border-purple-500/30 hover:border-purple-500/60 transition-all hover:shadow-xl hover:shadow-purple-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-purple-400 uppercase tracking-wider">Total Submissions</p>
                                <p className="text-4xl font-bold text-purple-300 mt-3">{assignments.length}</p>
                            </div>
                            <div className="text-5xl">📚</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-red-900/30 to-pink-900/30 border-red-500/30 hover:border-red-500/60 transition-all hover:shadow-xl hover:shadow-red-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-red-400 uppercase tracking-wider">Pending Review</p>
                                <p className="text-4xl font-bold text-red-300 mt-3">{pendingCount}</p>
                            </div>
                            <div className="text-5xl">⏰</div>
                        </div>
                    </div>

                    <div className="card bg-gradient-to-br from-emerald-900/30 to-teal-900/30 border-emerald-500/30 hover:border-emerald-500/60 transition-all hover:shadow-xl hover:shadow-emerald-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-emerald-400 uppercase tracking-wider">Graded</p>
                                <p className="text-4xl font-bold text-emerald-300 mt-3">{gradedCount}</p>
                            </div>
                            <div className="text-5xl">✅</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mb-8">
                    <Link to="/faculty/submissions" className="group cursor-pointer inline-block">
                        <div className="card hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-all">
                                        <span className="text-3xl">📝</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:gradient-text transition-all">Review Submissions</h3>
                                    <p className="text-sm text-slate-400">Download, review, and grade student assignments</p>
                                </div>
                            </div>
                        </div>
                    </Link>
                </div>

                {/* Recent Submissions */}
                <div className="card">
                    <h2 className="text-2xl font-bold gradient-text mb-6">Recent Submissions</h2>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-purple-500 border-t-transparent"></div>
                            <p className="text-slate-400 mt-4 font-medium">Loading submissions...</p>
                        </div>
                    ) : assignments.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-xl border border-slate-700/30">
                            <p className="text-slate-400 text-lg font-medium">No submissions yet.</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {assignments.slice(0, 5).map((assignment) => (
                                <div key={assignment.id} className="table-row-hover p-4 bg-slate-800/20 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-100">{assignment.filename}</p>
                                            <p className="text-sm text-slate-400">
                                                📅 {new Date(assignment.upload_timestamp).toLocaleDateString()}
                                            </p>
                                        </div>
                                        <div className="ml-4">
                                            {assignment.is_graded ? (
                                                <span className="inline-block px-4 py-2 bg-gradient-to-r from-emerald-600/30 to-emerald-500/30 text-emerald-300 text-xs font-bold rounded-full border border-emerald-500/30">
                                                    ✅ Graded
                                                </span>
                                            ) : (
                                                <span className="inline-block px-4 py-2 bg-gradient-to-r from-orange-600/30 to-orange-500/30 text-orange-300 text-xs font-bold rounded-full border border-orange-500/30">
                                                    ⏳ Pending
                                                </span>
                                            )}
                                        </div>
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

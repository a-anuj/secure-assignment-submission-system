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
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const submissionsRes = await api.get('/student/assignments/my-submissions');
                setSubmissions(submissionsRes.data);
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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold gradient-text">Student Dashboard</h1>
                    <p className="text-slate-400 mt-2 font-medium">Manage your assignments and view grades</p>
                </div>

                {/* Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="card bg-gradient-to-br from-cyan-900/30 to-blue-900/30 border-cyan-500/30 hover:border-cyan-500/60 transition-all hover:shadow-xl hover:shadow-cyan-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-cyan-400 uppercase tracking-wider">Total Submissions</p>
                                <p className="text-4xl font-bold text-cyan-300 mt-3">{submissions.length}</p>
                            </div>
                            <div className="text-5xl">📝</div>
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

                    <div className="card bg-gradient-to-br from-orange-900/30 to-amber-900/30 border-orange-500/30 hover:border-orange-500/60 transition-all hover:shadow-xl hover:shadow-orange-500/20">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-xs font-bold text-orange-400 uppercase tracking-wider">Pending Review</p>
                                <p className="text-4xl font-bold text-orange-300 mt-3">{pendingCount}</p>
                            </div>
                            <div className="text-5xl">⏳</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                    <Link to="/student/upload" className="group cursor-pointer">
                        <div className="card hover:border-cyan-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-cyan-500/20 h-full">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-xl flex items-center justify-center group-hover:from-cyan-500/40 group-hover:to-blue-500/40 transition-all">
                                        <span className="text-3xl">📤</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:gradient-text transition-all">Upload Assignment</h3>
                                    <p className="text-sm text-slate-400">Submit a new assignment with encryption</p>
                                </div>
                            </div>
                        </div>
                    </Link>

                    <Link to="/student/submissions" className="group cursor-pointer">
                        <div className="card hover:border-purple-400/60 transition-all duration-300 hover:shadow-xl hover:shadow-purple-500/20 h-full">
                            <div className="flex items-center space-x-4">
                                <div className="flex-shrink-0">
                                    <div className="w-14 h-14 bg-gradient-to-br from-purple-500/20 to-pink-500/20 rounded-xl flex items-center justify-center group-hover:from-purple-500/40 group-hover:to-pink-500/40 transition-all">
                                        <span className="text-3xl">📋</span>
                                    </div>
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-slate-100 group-hover:gradient-text-warm transition-all">My Submissions</h3>
                                    <p className="text-sm text-slate-400">View all submissions and grades</p>
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
                            <div className="inline-block animate-spin rounded-full h-10 w-10 border-2 border-cyan-500 border-t-transparent"></div>
                            <p className="text-slate-400 mt-4 font-medium">Loading submissions...</p>
                        </div>
                    ) : submissions.length === 0 ? (
                        <div className="text-center py-12 px-6 bg-gradient-to-r from-slate-800/30 to-slate-900/30 rounded-xl border border-slate-700/30">
                            <p className="text-slate-400 text-lg font-medium">No submissions yet.</p>
                            <Link to="/student/upload" className="text-cyan-400 hover:text-cyan-300 font-semibold mt-2 inline-block">
                                Upload your first assignment →
                            </Link>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {submissions.slice(0, 5).map((submission) => (
                                <div key={submission.id} className="table-row-hover p-4 bg-slate-800/20 rounded-lg border border-slate-700/30 hover:border-slate-600/50 transition-all">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <p className="font-semibold text-slate-100">{submission.filename}</p>
                                            <p className="text-sm text-slate-400">{submission.course_name}</p>
                                        </div>
                                        <div className="text-right ml-4">
                                            {submission.is_graded ? (
                                                <div>
                                                    <p className="font-bold text-emerald-400">{submission.marks}/100</p>
                                                    <p className="text-xs text-slate-400">Graded by {submission.faculty_name}</p>
                                                </div>
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

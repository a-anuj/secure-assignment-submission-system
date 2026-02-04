/**
 * Review Assignments Page - Faculty
 * View, download, decrypt, and grade student assignments
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Assignment } from '../lib/types';

interface AssignmentWithStudent extends Assignment {
    student_name?: string;
    course_name?: string;
}

export function ReviewAssignments() {
    const navigate = useNavigate();
    const [assignments, setAssignments] = useState<AssignmentWithStudent[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [gradeModal, setGradeModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<AssignmentWithStudent | null>(null);
    const [marks, setMarks] = useState('');
    const [feedback, setFeedback] = useState('');
    const [grading, setGrading] = useState(false);
    const [downloading, setDownloading] = useState<string | null>(null);

    useEffect(() => {
        fetchAssignments();
    }, []);

    const fetchAssignments = async () => {
        try {
            const response = await api.get('/faculty/assignments/assigned');
            setAssignments(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load assignments');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async (assignmentId: string, filename: string) => {
        setDownloading(assignmentId);
        try {
            const response = await api.get(`/faculty/assignments/${assignmentId}/download`, {
                responseType: 'blob',
            });

            // Create blob and download
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', filename);
            document.body.appendChild(link);
            link.click();
            link.remove();
            window.URL.revokeObjectURL(url);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to download file');
            console.error(err);
        } finally {
            setDownloading(null);
        }
    };

    const openGradeModal = (assignment: AssignmentWithStudent) => {
        setSelectedAssignment(assignment);
        setMarks('');
        setFeedback('');
        setGradeModal(true);
    };

    const handleSubmitGrade = async () => {
        if (!selectedAssignment) return;

        const marksNum = parseInt(marks);
        if (isNaN(marksNum) || marksNum < 0 || marksNum > 100) {
            setError('Marks must be between 0 and 100');
            return;
        }

        setGrading(true);
        try {
            await api.post(`/faculty/assignments/${selectedAssignment.id}/grade`, {
                marks: marksNum,
                feedback: feedback || undefined,
            });

            setGradeModal(false);
            setError('');
            // Refresh assignments
            await fetchAssignments();
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to submit grade');
            console.error(err);
        } finally {
            setGrading(false);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-xl text-slate-400">Loading assignments...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/faculty')}
                        className="text-cyan-400 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="bg-slate-800/40 rounded-lg shadow-xl-lg p-8">
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Review Student Assignments</h1>
                    <p className="text-slate-400 mb-6">
                        🔓 Files will be decrypted using your <strong>RSA private key</strong>
                    </p>

                    {error && (
                        <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {assignments.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-lg">No assignments to review yet</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b-2 border-slate-700/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Student
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Filename
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Upload Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800/40 divide-y divide-gray-200">
                                    {assignments.map((assignment) => (
                                        <tr key={assignment.id} className="hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm font-medium text-slate-100">
                                                    {assignment.student_name || `Student ${assignment.student_id.substring(0, 8)}`}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">📄</span>
                                                    <span className="text-sm text-slate-300">{assignment.filename}</span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-500">
                                                    {formatDate(assignment.upload_timestamp)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {assignment.is_graded ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        ✓ Graded
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm space-x-3">
                                                <button
                                                    onClick={() => handleDownload(assignment.id, assignment.filename)}
                                                    disabled={downloading === assignment.id}
                                                    className="text-cyan-400 hover:text-blue-800 font-semibold disabled:text-slate-600"
                                                >
                                                    {downloading === assignment.id ? '⏳ Downloading...' : '⬇ Download'}
                                                </button>
                                                {!assignment.is_graded && (
                                                    <button
                                                        onClick={() => openGradeModal(assignment)}
                                                        className="text-emerald-400 hover:text-green-800 font-semibold"
                                                    >
                                                        ✏️ Grade
                                                    </button>
                                                )}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>

            {/* Grading Modal */}
            {gradeModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-slate-100 mb-4">Grade Assignment</h2>

                        <div className="mb-4 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-lg p-4">
                            <div className="text-sm text-slate-400">Assignment:</div>
                            <div className="font-semibold text-slate-100">{selectedAssignment.filename}</div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Marks (0-100) <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="100"
                                    value={marks}
                                    onChange={(e) => setMarks(e.target.value)}
                                    className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="Enter marks"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Feedback (Optional)
                                </label>
                                <textarea
                                    value={feedback}
                                    onChange={(e) => setFeedback(e.target.value)}
                                    rows={4}
                                    className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                                    placeholder="Provide feedback to student..."
                                />
                            </div>

                            <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3">
                                <p className="text-xs text-blue-800">
                                    <strong>🔐 Digital Signature:</strong> Your grade will be digitally signed with your RSA
                                    private key. Students can verify the authenticity of this grade.
                                </p>
                            </div>
                        </div>

                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={handleSubmitGrade}
                                disabled={grading || !marks}
                                className="flex-1 bg-green-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-green-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {grading ? 'Submitting...' : 'Submit Grade'}
                            </button>
                            <button
                                onClick={() => setGradeModal(false)}
                                disabled={grading}
                                className="px-6 py-3 border border-slate-600/50 rounded-lg font-semibold hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition disabled:bg-slate-800/30 text-slate-100"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

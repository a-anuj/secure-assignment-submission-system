/**
 * My Submissions Page - Student
 * View all submissions with signature verification
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { MySubmission, SignatureVerification } from '../lib/types';

export function MySubmissions() {
    const navigate = useNavigate();
    const [submissions, setSubmissions] = useState<MySubmission[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [verificationModal, setVerificationModal] = useState(false);
    const [verificationResult, setVerificationResult] = useState<SignatureVerification | null>(null);
    const [verifying, setVerifying] = useState(false);

    useEffect(() => {
        fetchSubmissions();
    }, []);

    const fetchSubmissions = async () => {
        try {
            const response = await api.get('/student/assignments/my-submissions');
            setSubmissions(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load submissions');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleVerifySignature = async (assignmentId: string) => {
        setVerifying(true);
        setVerificationModal(true);
        setVerificationResult(null);

        try {
            const response = await api.get(`/student/assignments/${assignmentId}/verify-signature`);
            setVerificationResult(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to verify signature');
            setVerificationModal(false);
        } finally {
            setVerifying(false);
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
                <div className="text-xl text-slate-400">Loading submissions...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/student')}
                        className="text-cyan-400 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={() => navigate('/student/upload')}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        + Upload New Assignment
                    </button>
                </div>

                <div className="bg-slate-800/40 rounded-lg shadow-xl-lg p-8">
                    <h1 className="text-3xl font-bold text-slate-100 mb-6">My Submissions</h1>

                    {error && (
                        <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {submissions.length === 0 ? (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-lg mb-4">No submissions yet</p>
                            <button
                                onClick={() => navigate('/student/upload')}
                                className="bg-blue-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
                            >
                                Upload Your First Assignment
                            </button>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full">
                                <thead className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b-2 border-slate-700/20">
                                    <tr>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Filename
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Course
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Upload Date
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Status
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Marks
                                        </th>
                                        <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                            Actions
                                        </th>
                                    </tr>
                                </thead>
                                <tbody className="bg-slate-800/40 divide-y divide-gray-200">
                                    {submissions.map((submission) => (
                                        <tr key={submission.id} className="hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <div className="flex items-center">
                                                    <span className="text-lg mr-2">📄</span>
                                                    <span className="text-sm font-medium text-slate-100">
                                                        {submission.filename}
                                                    </span>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-300">{submission.course_name}</span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className="text-sm text-slate-500">
                                                    {formatDate(submission.upload_timestamp)}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {submission.is_graded ? (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                                                        ✓ Graded
                                                    </span>
                                                ) : (
                                                    <span className="px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full bg-yellow-100 text-yellow-800">
                                                        ⏳ Pending
                                                    </span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                {submission.is_graded ? (
                                                    <div>
                                                        <div className="text-sm font-bold text-slate-100">
                                                            {submission.marks}/100
                                                        </div>
                                                        {submission.feedback && (
                                                            <div className="text-xs text-slate-500 mt-1">
                                                                {submission.feedback.length > 30
                                                                    ? submission.feedback.substring(0, 30) + '...'
                                                                    : submission.feedback}
                                                            </div>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <span className="text-sm text-slate-600">-</span>
                                                )}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm">
                                                {submission.is_graded && (
                                                    <button
                                                        onClick={() => handleVerifySignature(submission.id)}
                                                        className="text-cyan-400 hover:text-blue-800 font-semibold"
                                                    >
                                                        🔐 Verify Signature
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

            {/* Signature Verification Modal */}
            {verificationModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-slate-100 mb-4">Digital Signature Verification</h2>

                        {verifying ? (
                            <div className="text-center py-8">
                                <div className="text-slate-400">Verifying signature...</div>
                            </div>
                        ) : verificationResult ? (
                            <div>
                                {verificationResult.is_valid ? (
                                    <div className="bg-emerald-900/30 border-2 border-emerald-500/30 rounded-lg p-6 mb-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-4xl">✓</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-green-800">Valid Signature</h3>
                                                <p className="text-sm text-emerald-300">Signature verified successfully</p>
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    <div className="bg-red-900/30 border-2 border-red-500/30 rounded-lg p-6 mb-4">
                                        <div className="flex items-center gap-3 mb-3">
                                            <span className="text-4xl">✗</span>
                                            <div>
                                                <h3 className="text-xl font-bold text-red-800">Invalid Signature</h3>
                                                <p className="text-sm text-red-300">Signature verification failed</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="space-y-3">
                                    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-lg p-4">
                                        <div className="text-sm font-medium text-slate-400 mb-1">Graded By:</div>
                                        <div className="text-base font-semibold text-slate-100">
                                            {verificationResult.faculty_name}
                                        </div>
                                    </div>

                                    <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 rounded-lg p-4">
                                        <div className="text-sm font-medium text-slate-400 mb-1">File Hash (SHA-256):</div>
                                        <div className="text-xs font-mono text-slate-300 break-all">
                                            {verificationResult.file_hash}
                                        </div>
                                    </div>

                                    <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-3">
                                        <p className="text-xs text-blue-800">
                                            <strong>What this means:</strong> This signature proves that{' '}
                                            {verificationResult.faculty_name} graded this assignment and the grade has not
                                            been tampered with.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        ) : null}

                        <button
                            onClick={() => setVerificationModal(false)}
                            className="w-full mt-6 bg-gray-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-gray-700 transition"
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}

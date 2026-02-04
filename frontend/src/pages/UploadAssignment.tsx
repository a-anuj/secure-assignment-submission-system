/**
 * Upload Assignment Page - Student
 * Allows students to upload assignments with encryption
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Course } from '../lib/types';

export function UploadAssignment() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [selectedCourseId, setSelectedCourseId] = useState('');
    const [file, setFile] = useState<File | null>(null);
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    useEffect(() => {
        fetchCourses();
    }, []);

    const fetchCourses = async () => {
        try {
            const response = await api.get('/student/courses');
            setCourses(response.data);
        } catch (err: any) {
            setError('Failed to load courses');
            console.error(err);
        }
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files[0]) {
            const selectedFile = e.target.files[0];
            // Check file size (10MB limit)
            if (selectedFile.size > 10 * 1024 * 1024) {
                setError('File size must be less than 10MB');
                e.target.value = '';
                return;
            }
            setFile(selectedFile);
            setError('');
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!selectedCourseId) {
            setError('Please select a course');
            return;
        }

        if (!file) {
            setError('Please select a file to upload');
            return;
        }

        setLoading(true);

        try {
            const formData = new FormData();
            formData.append('course_id', selectedCourseId);
            formData.append('file', file);
            if (description) {
                formData.append('description', description);
            }

            await api.post('/student/assignments/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });

            setSuccess('Assignment uploaded successfully! Encrypting and storing...');
            setTimeout(() => {
                navigate('/student/submissions');
            }, 1500);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to upload assignment');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/student')}
                        className="text-cyan-400 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="bg-slate-800/40 rounded-lg shadow-xl-lg p-8">
                    <h1 className="text-3xl font-bold text-slate-100 mb-2">Upload Assignment</h1>
                    <p className="text-slate-400 mb-6">
                        📁 File will be encrypted with <strong>AES-256</strong> before storage
                    </p>

                    {error && (
                        <div className="bg-red-900/30 border border-red-500/30 text-red-300 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 px-4 py-3 rounded mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Select Course <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                required
                            >
                                <option value="">-- Choose a course --</option>
                                {courses.map((course) => (
                                    <option key={course.id} value={course.id}>
                                        {course.code} - {course.name}
                                        {course.faculty_name && ` (${course.faculty_name})`}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* File Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Select File <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,.zip"
                                className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-cyan-600/60 file:text-cyan-100 hover:file:bg-cyan-500/60"
                                required
                            />
                            <p className="mt-2 text-sm text-slate-500">
                                Accepted formats: PDF, DOC, DOCX, TXT, ZIP (Max 10MB)
                            </p>
                            {file && (
                                <p className="mt-2 text-sm text-emerald-400">
                                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        {/* Description (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent placeholder-slate-500"
                                placeholder="Add any notes about this assignment..."
                            />
                        </div>

                        {/* Security Info */}
                        <div className="bg-cyan-900/30 border border-cyan-500/30 rounded-lg p-4">
                            <h3 className="font-semibold text-blue-900 mb-2">🔐 Security Features</h3>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>✓ File encrypted with <strong>AES-256</strong></li>
                                <li>✓ AES key encrypted with faculty's <strong>RSA-2048 public key</strong></li>
                                <li>✓ File integrity protected with <strong>SHA-256 hash</strong></li>
                                <li>✓ Only assigned faculty can decrypt and view</li>
                            </ul>
                        </div>

                        {/* Submit Button */}
                        <div className="flex gap-4">
                            <button
                                type="submit"
                                disabled={loading}
                                className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed"
                            >
                                {loading ? 'Uploading & Encrypting...' : 'Upload Assignment'}
                            </button>
                            <button
                                type="button"
                                onClick={() => navigate('/student')}
                                className="px-6 py-3 border border-slate-700/30 rounded-lg font-semibold hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}

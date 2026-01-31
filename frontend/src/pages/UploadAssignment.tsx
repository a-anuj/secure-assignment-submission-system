/**
 * Upload Assignment Page - Student
 * Allows students to upload assignments with encryption
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import api from '../lib/api';
import { Course } from '../lib/types';

export function UploadAssignment() {
    const navigate = useNavigate();
    const { user } = useAuth();
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
            const response = await api.get('/admin/courses');
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
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-3xl mx-auto">
                <div className="mb-6">
                    <button
                        onClick={() => navigate('/student')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-2">Upload Assignment</h1>
                    <p className="text-gray-600 mb-6">
                        📁 File will be encrypted with <strong>AES-256</strong> before storage
                    </p>

                    {error && (
                        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
                            {error}
                        </div>
                    )}

                    {success && (
                        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
                            {success}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {/* Course Selection */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select Course <span className="text-red-500">*</span>
                            </label>
                            <select
                                value={selectedCourseId}
                                onChange={(e) => setSelectedCourseId(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Select File <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="file"
                                onChange={handleFileChange}
                                accept=".pdf,.doc,.docx,.txt,.zip"
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                required
                            />
                            <p className="mt-2 text-sm text-gray-500">
                                Accepted formats: PDF, DOC, DOCX, TXT, ZIP (Max 10MB)
                            </p>
                            {file && (
                                <p className="mt-2 text-sm text-green-600">
                                    Selected: {file.name} ({(file.size / 1024).toFixed(2)} KB)
                                </p>
                            )}
                        </div>

                        {/* Description (Optional) */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Description (Optional)
                            </label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                rows={4}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                placeholder="Add any notes about this assignment..."
                            />
                        </div>

                        {/* Security Info */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
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
                                className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
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

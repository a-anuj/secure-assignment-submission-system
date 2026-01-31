/**
 * Manage Courses Page - Admin
 * Create courses, view all courses, and assign faculty
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { Course, User } from '../lib/types';

interface CreateCourseForm {
    name: string;
    code: string;
}

export function ManageCourses() {
    const navigate = useNavigate();
    const [courses, setCourses] = useState<Course[]>([]);
    const [faculty, setFaculty] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showAssignModal, setShowAssignModal] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState<Course | null>(null);
    const [selectedFacultyId, setSelectedFacultyId] = useState('');
    const [createForm, setCreateForm] = useState<CreateCourseForm>({
        name: '',
        code: '',
    });
    const [creating, setCreating] = useState(false);
    const [assigning, setAssigning] = useState(false);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [coursesRes, usersRes] = await Promise.all([
                api.get('/admin/courses'),
                api.get('/admin/users'),
            ]);
            setCourses(coursesRes.data);
            setFaculty(usersRes.data.filter((u: User) => u.role === 'faculty'));
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load data');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateCourse = async (e: React.FormEvent) => {
        e.preventDefault();
        setCreating(true);
        setError('');

        try {
            await api.post('/admin/courses', createForm);
            setSuccess('Course created successfully!');
            setShowCreateModal(false);
            setCreateForm({ name: '', code: '' });
            await fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to create course');
        } finally {
            setCreating(false);
        }
    };

    const openAssignModal = (course: Course) => {
        setSelectedCourse(course);
        setSelectedFacultyId(course.faculty_id || '');
        setShowAssignModal(true);
    };

    const handleAssignFaculty = async () => {
        if (!selectedCourse || !selectedFacultyId) return;

        setAssigning(true);
        setError('');

        try {
            await api.post('/admin/courses/assign-faculty', {
                course_id: selectedCourse.id,
                faculty_id: selectedFacultyId,
            });
            setSuccess('Faculty assigned successfully!');
            setShowAssignModal(false);
            await fetchData();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to assign faculty');
        } finally {
            setAssigning(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-xl text-gray-600">Loading courses...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-blue-600 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        + Create New Course
                    </button>
                </div>

                <div className="bg-white rounded-lg shadow-md p-8">
                    <h1 className="text-3xl font-bold text-gray-800 mb-6">Manage Courses</h1>

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

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b-2 border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course Code
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Course Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assigned Faculty
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {courses.map((course) => (
                                    <tr key={course.id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-bold text-blue-600">{course.code}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-gray-900">{course.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {course.faculty_name ? (
                                                <span className="text-sm text-gray-700">{course.faculty_name}</span>
                                            ) : (
                                                <span className="text-sm text-gray-400 italic">Not assigned</span>
                                            )}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <button
                                                onClick={() => openAssignModal(course)}
                                                className="text-blue-600 hover:text-blue-800 font-semibold"
                                            >
                                                {course.faculty_name ? 'Reassign Faculty' : 'Assign Faculty'}
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {courses.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-600 text-lg">No courses found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Course Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Create New Course</h2>

                        <form onSubmit={handleCreateCourse} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Code <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.code}
                                    onChange={(e) => setCreateForm({ ...createForm, code: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., CS101"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Course Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    placeholder="e.g., Introduction to Programming"
                                    required
                                />
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    {creating ? 'Creating...' : 'Create Course'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Assign Faculty Modal */}
            {showAssignModal && selectedCourse && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
                        <h2 className="text-2xl font-bold text-gray-800 mb-4">Assign Faculty</h2>

                        <div className="mb-4 bg-gray-50 rounded-lg p-4">
                            <div className="text-sm text-gray-600">Course:</div>
                            <div className="font-semibold text-gray-800">
                                {selectedCourse.code} - {selectedCourse.name}
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Select Faculty <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={selectedFacultyId}
                                    onChange={(e) => setSelectedFacultyId(e.target.value)}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">-- Select Faculty --</option>
                                    {faculty.map((f) => (
                                        <option key={f.id} value={f.id}>
                                            {f.name} ({f.email})
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    onClick={handleAssignFaculty}
                                    disabled={assigning || !selectedFacultyId}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    {assigning ? 'Assigning...' : 'Assign Faculty'}
                                </button>
                                <button
                                    onClick={() => setShowAssignModal(false)}
                                    disabled={assigning}
                                    className="px-6 py-3 border border-gray-300 rounded-lg font-semibold hover:bg-gray-50 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

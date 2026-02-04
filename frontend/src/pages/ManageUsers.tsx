/**
 * Manage Users Page - Admin
 * Create users, view all users, and update user roles
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../lib/api';
import { User, UserRole } from '../lib/types';

interface CreateUserForm {
    name: string;
    email: string;
    password: string;
    role: UserRole;
}

export function ManageUsers() {
    const navigate = useNavigate();
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createForm, setCreateForm] = useState<CreateUserForm>({
        name: '',
        email: '',
        password: '',
        role: UserRole.STUDENT,
    });
    const [creating, setCreating] = useState(false);

    useEffect(() => {
        fetchUsers();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/admin/users');
            setUsers(response.data);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to load users');
        } finally {
            setLoading(false);
        }
    };

    const handleCreateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        
        // Frontend validation
        if (!createForm.name.trim()) {
            setError('Name is required');
            return;
        }
        if (!createForm.email.trim()) {
            setError('Email is required');
            return;
        }
        if (!createForm.email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }
        if (createForm.password.length < 8) {
            setError('Password must be at least 8 characters');
            return;
        }
        if (!createForm.role) {
            setError('Please select a role');
            return;
        }
        
        setCreating(true);
        setError('');

        try {
            console.log('Sending user data:', createForm);
            await api.post('/admin/users', createForm);
            setSuccess('User created successfully!');
            setShowCreateModal(false);
            setCreateForm({ name: '', email: '', password: '', role: UserRole.STUDENT });
            await fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            console.error('Error creating user:', err.response?.data);
            const errorDetail = err.response?.data?.detail || 
                               (Array.isArray(err.response?.data?.detail) ? 
                                   err.response.data.detail.map((d: any) => d.msg).join(', ') :
                                   'Failed to create user');
            setError(errorDetail);
        } finally {
            setCreating(false);
        }
    };

    const handleUpdateRole = async (userId: string, newRole: UserRole) => {
        try {
            await api.put(`/admin/users/${userId}/role`, { role: newRole });
            setSuccess('User role updated successfully!');
            await fetchUsers();
            setTimeout(() => setSuccess(''), 3000);
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Failed to update user role');
        }
    };

    const getRoleBadgeColor = (role: string) => {
        switch (role) {
            case 'admin':
                return 'bg-purple-100 text-purple-800';
            case 'faculty':
                return 'bg-blue-100 text-blue-800';
            case 'student':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-slate-800/30 text-slate-100';
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
                <div className="text-xl text-slate-400">Loading users...</div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 py-8 px-4">
            <div className="max-w-6xl mx-auto">
                <div className="mb-6 flex justify-between items-center">
                    <button
                        onClick={() => navigate('/admin')}
                        className="text-cyan-400 hover:text-blue-800 flex items-center gap-2"
                    >
                        ← Back to Dashboard
                    </button>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="bg-blue-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-blue-700 transition"
                    >
                        + Create New User
                    </button>
                </div>

                <div className="bg-slate-800/40 rounded-lg shadow-xl-lg p-8">
                    <h1 className="text-3xl font-bold text-slate-100 mb-6">Manage Users</h1>

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

                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 border-b-2 border-slate-700/20">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Name
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Email
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Role
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Created
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-slate-800/40 divide-y divide-gray-200">
                                {users.map((user) => (
                                    <tr key={user.id} className="hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm font-medium text-slate-100">{user.name}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-300">{user.email}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`px-3 py-1 inline-flex text-xs leading-5 font-semibold rounded-full ${getRoleBadgeColor(
                                                    user.role
                                                )}`}
                                            >
                                                {user.role}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className="text-sm text-slate-500">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm">
                                            <select
                                                value={user.role}
                                                onChange={(e) =>
                                                    handleUpdateRole(user.id, e.target.value as UserRole)
                                                }
                                                className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded px-2 py-1 text-sm text-slate-100"
                                            >
                                                <option value="student">Student</option>
                                                <option value="faculty">Faculty</option>
                                                <option value="admin">Admin</option>
                                            </select>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {users.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-slate-400 text-lg">No users found</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Create User Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
                    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg shadow-2xl max-w-md w-full p-6 border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-slate-100 mb-4">Create New User</h2>

                        <form onSubmit={handleCreateUser} className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Name <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    value={createForm.name}
                                    onChange={(e) => setCreateForm({ ...createForm, name: e.target.value })}
                                    className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Email <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="email"
                                    value={createForm.email}
                                    onChange={(e) => setCreateForm({ ...createForm, email: e.target.value })}
                                    className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Password <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="password"
                                    value={createForm.password}
                                    onChange={(e) => setCreateForm({ ...createForm, password: e.target.value })}
                                    className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    required
                                    minLength={8}
                                    placeholder="At least 8 characters"
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-300 mb-2">
                                    Role <span className="text-red-500">*</span>
                                </label>
                                <select
                                    value={createForm.role}
                                    onChange={(e) =>
                                        setCreateForm({ ...createForm, role: e.target.value as UserRole })
                                    }
                                    className="w-full px-4 py-2 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 border border-slate-600/50 rounded-lg text-slate-100 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="student">Student</option>
                                    <option value="faculty">Faculty</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="flex gap-3 mt-6">
                                <button
                                    type="submit"
                                    disabled={creating}
                                    className="flex-1 bg-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-gray-400"
                                >
                                    {creating ? 'Creating...' : 'Create User'}
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setShowCreateModal(false)}
                                    disabled={creating}
                                    className="px-6 py-3 border border-slate-700/30 rounded-lg font-semibold hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition"
                                >
                                    Cancel
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}

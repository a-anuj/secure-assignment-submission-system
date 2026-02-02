/**
 * Login page with email/password authentication and TOTP MFA support.
 */
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const { login } = useAuth();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            const result = await login(email, password);

            if (result.requires_totp) {
                // TOTP MFA enabled: Redirect to TOTP verification page
                navigate('/totp-verify', { state: { email } });
            } else if (result.requires_otp) {
                // Email OTP required: Redirect to OTP verification page (for MFA setup)
                navigate('/otp-verify', { state: { email } });
            } else {
                // Shouldn't happen in this app, but handle it
                navigate('/');
            }
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Login failed. Please check your credentials.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                        🔒 SecureSubmit
                    </h1>
                    <p className="text-gray-600">Secure Student Assignment Submission System</p>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-6">Login</h2>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Email Address
                            </label>
                            <input
                                id="email"
                                type="email"
                                required
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="input-field"
                                placeholder="your.email@example.com"
                            />
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                                Password
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="input-field"
                                placeholder="••••••••"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full btn btn-primary text-base py-3"
                        >
                            {loading ? 'Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium mb-2">🔐 Multi-Factor Authentication</p>
                        <p className="text-xs text-blue-600">
                            This system uses Time-based One-Time Passwords (TOTP) for enhanced security. After your first login, you'll set up an authenticator app (Google Authenticator, Authy, or Microsoft Authenticator).
                        </p>
                    </div>

                    <div className="mt-6 text-center text-sm text-gray-600">
                        <p>Demo Accounts:</p>
                        <p className="text-xs mt-2">
                            Student: alice@student.com<br />
                            Faculty: john.smith@faculty.com<br />
                            Admin: admin@example.com<br />
                            Password: Check README
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

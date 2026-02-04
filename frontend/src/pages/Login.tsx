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
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
                <div className="absolute top-1/2 left-1/2 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl opacity-10 animate-pulse animation-delay-4000"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold gradient-text mb-3">
                        🔒 SecureSubmit
                    </h1>
                    <p className="text-slate-400 text-lg">Secure Student Assignment Submission System</p>
                </div>

                <div className="card">
                    <h2 className="text-3xl font-bold gradient-text mb-6">Welcome Back</h2>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="email" className="block text-sm font-semibold text-slate-300 mb-2">
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
                            <label htmlFor="password" className="block text-sm font-semibold text-slate-300 mb-2">
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
                            className="w-full btn btn-primary text-base py-3 font-semibold"
                        >
                            {loading ? '🔄 Logging in...' : 'Sign In'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                        <p className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">🔐 Multi-Factor Authentication</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            This system uses Time-based One-Time Passwords (TOTP) for enhanced security. After your first login, you'll set up an authenticator app.
                        </p>
                    </div>

                    <div className="mt-6 p-4 bg-gradient-to-r from-purple-500/10 to-pink-500/10 border border-purple-500/30 rounded-xl text-center">
                        <p className="text-sm font-bold text-slate-300 mb-3">📝 Demo Accounts:</p>
                        <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            Student: alice@student.com<br />
                            Faculty: john.smith@faculty.com<br />
                            Admin: admin@example.com<br />
                            <span className="text-cyan-400">Password: Check README</span>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

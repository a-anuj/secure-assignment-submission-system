/**
 * OTP verification page for MFA enrollment (first login).
 * After email OTP verification, user proceeds to TOTP enrollment.
 */
import { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export const OTPVerification = () => {
    const [otp, setOtp] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyOTP } = useAuth();

    const email = (location.state as any)?.email || '';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        try {
            await verifyOTP(email, otp);
            // After email OTP verification, proceed to TOTP enrollment
            navigate('/mfa-enroll', { state: { email } });
        } catch (err: any) {
            setError(err.response?.data?.detail || 'Invalid or expired OTP. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    if (!email) {
        navigate('/login');
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse animation-delay-2000"></div>
            </div>

            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-5xl font-bold gradient-text mb-3">
                        🔒 SecureSubmit
                    </h1>
                    <p className="text-slate-400 text-lg">Email Verification (MFA Setup)</p>
                </div>

                <div className="card">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-full mb-4 border border-cyan-500/30">
                            <span className="text-3xl">📧</span>
                        </div>
                        <h2 className="text-2xl font-bold gradient-text mb-2">Verify Email</h2>
                        <p className="text-sm text-slate-400">
                            Step 1 of 2: Verify your email with the code we sent to<br />
                            <span className="font-semibold text-cyan-300">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-4 bg-red-500/10 border border-red-500/30 rounded-xl text-red-300 text-sm font-medium">
                            ⚠️ {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-5">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-semibold text-slate-300 mb-2">
                                OTP Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="input-field text-center text-3xl tracking-widest font-bold"
                                placeholder="000000"
                                maxLength={6}
                                pattern="\d{6}"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full btn btn-primary text-base py-3 font-semibold"
                        >
                            {loading ? '🔄 Verifying...' : '✓ Next: Set Up Authenticator'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-gradient-to-r from-cyan-500/10 to-blue-500/10 border border-cyan-500/30 rounded-xl">
                        <p className="text-sm font-bold bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent mb-2">📧 Email Verification</p>
                        <p className="text-xs text-slate-400 leading-relaxed">
                            After verifying your email, you'll set up TOTP with your authenticator app (Google Authenticator, Authy, Microsoft Authenticator, etc.)
                        </p>
                    </div>

                    <div className="mt-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-700 font-medium mb-1">⚠️ Check Backend Console</p>
                        <p className="text-xs text-yellow-600">
                            For development, OTP codes are logged to the backend console. Check your terminal where the FastAPI server is running.
                        </p>
                    </div>

                    <div className="mt-4 text-center">
                        <button
                            onClick={() => navigate('/login')}
                            className="text-sm text-primary-600 hover:text-primary-700"
                        >
                            ← Back to Login
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

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
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                        🔒 SecureSubmit
                    </h1>
                    <p className="text-gray-600">Email Verification (MFA Setup)</p>
                </div>

                <div className="card">
                    <div className="text-center mb-6">
                        <div className="inline-flex items-center justify-center w-16 h-16 bg-primary-100 rounded-full mb-4">
                            <span className="text-3xl">📧</span>
                        </div>
                        <h2 className="text-2xl font-bold text-gray-900 mb-2">Verify Email</h2>
                        <p className="text-sm text-gray-600">
                            Step 1 of 2: Verify your email with the code we sent to<br />
                            <span className="font-medium text-gray-900">{email}</span>
                        </p>
                    </div>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                        </div>
                    )}

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="otp" className="block text-sm font-medium text-gray-700 mb-1">
                                OTP Code
                            </label>
                            <input
                                id="otp"
                                type="text"
                                required
                                value={otp}
                                onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
                                className="input-field text-center text-2xl tracking-widest"
                                placeholder="000000"
                                maxLength={6}
                                pattern="\d{6}"
                                autoFocus
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading || otp.length !== 6}
                            className="w-full btn btn-primary text-base py-3"
                        >
                            {loading ? 'Verifying...' : 'Next: Set Up Authenticator'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-700 font-medium mb-1">📧 Email Verification</p>
                        <p className="text-xs text-blue-600">
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

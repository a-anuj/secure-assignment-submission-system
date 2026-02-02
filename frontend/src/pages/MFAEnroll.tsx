/**
 * MFA Enrollment page - display QR code and confirm TOTP setup
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth, MFAEnrollment } from '../lib/auth';

export const MFAEnroll = () => {
    const [enrollment, setEnrollment] = useState<MFAEnrollment | null>(null);
    const [totp_code, setTOTPCode] = useState('');
    const [loading, setLoading] = useState(true);
    const [verifying, setVerifying] = useState(false);
    const [error, setError] = useState('');
    const [showSecret, setShowSecret] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const navigate = useNavigate();
    const location = useLocation();
    const { enrollMFA, verifyTOTP } = useAuth();
    
    const email = (location.state?.email as string) || '';

    useEffect(() => {
        if (!email) {
            navigate('/login');
            return;
        }

        const fetchEnrollment = async () => {
            try {
                const data = await enrollMFA(email);
                setEnrollment(data);
            } catch (err: any) {
                setError(err.response?.data?.detail || 'Failed to initialize MFA setup');
                setTimeout(() => navigate('/login'), 3000);
            } finally {
                setLoading(false);
            }
        };

        fetchEnrollment();
    }, [email, navigate, enrollMFA]);

    const handleVerify = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (totp_code.length !== 6 || !/^\d+$/.test(totp_code)) {
            setError('Please enter a valid 6-digit code from your authenticator app');
            return;
        }
        
        setError('');
        setVerifying(true);

        try {
            await verifyTOTP(email, totp_code);
            // MFA is now enabled, redirect to dashboard
            navigate('/');
        } catch (err: any) {
            const errorMsg = err.response?.data?.detail || 'TOTP verification failed';
            setError(errorMsg);
            
            // Extract remaining attempts from error message
            const match = errorMsg.match(/(\d+) attempts? remaining/);
            if (match) {
                setAttemptsRemaining(parseInt(match[1]));
            }
        } finally {
            setVerifying(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setTOTPCode(value);
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
                <div className="card">
                    <p className="text-center text-gray-600">Setting up your authenticator...</p>
                </div>
            </div>
        );
    }

    if (error && !enrollment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
                <div className="card">
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full mt-4 btn btn-primary"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                        🔒 SecureSubmit
                    </h1>
                    <p className="text-gray-600">Set Up Two-Factor Authentication</p>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-4">Step 1: Scan QR Code</h2>
                    
                    <div className="bg-gray-50 p-4 rounded-lg mb-6 flex justify-center">
                        {enrollment?.qr_code && (
                            <img
                                src={enrollment.qr_code}
                                alt="TOTP QR Code"
                                className="w-64 h-64"
                            />
                        )}
                    </div>

                    <p className="text-sm text-gray-600 mb-4">
                        Scan this QR code with your authenticator app:
                    </p>

                    <ul className="text-xs text-gray-600 space-y-2 mb-6 p-3 bg-blue-50 rounded">
                        <li className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span>Google Authenticator</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span>Microsoft Authenticator</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span>Authy</span>
                        </li>
                        <li className="flex items-start">
                            <span className="mr-2">✓</span>
                            <span>Any RFC 6238 compliant app</span>
                        </li>
                    </ul>

                    <div className="mb-6 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-xs text-yellow-800 font-medium mb-2">💾 Backup Code</p>
                        <p className="text-xs text-yellow-700 mb-2">If you lose access to your authenticator app, you can use this backup code:</p>
                        <div 
                            className="bg-white p-2 rounded font-mono text-xs text-center break-all cursor-pointer hover:bg-gray-100"
                            onClick={() => {
                                if (enrollment?.secret) {
                                    navigator.clipboard.writeText(enrollment.secret);
                                }
                            }}
                            title="Click to copy"
                        >
                            {showSecret ? enrollment?.secret : '••••••••••••••••••••••••••••••••'}
                            <button
                                type="button"
                                onClick={() => setShowSecret(!showSecret)}
                                className="ml-2 text-primary-600 hover:text-primary-800 text-xs"
                            >
                                {showSecret ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <hr className="my-6" />

                    <h3 className="text-lg font-bold text-gray-900 mb-4">Step 2: Verify Code</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
                            {error}
                            {attemptsRemaining < 5 && (
                                <p className="mt-1 text-xs">
                                    {attemptsRemaining === 1 
                                        ? 'One attempt remaining' 
                                        : `${attemptsRemaining} attempts remaining`}
                                </p>
                            )}
                        </div>
                    )}

                    <form onSubmit={handleVerify} className="space-y-4">
                        <div>
                            <label htmlFor="totp_code" className="block text-sm font-medium text-gray-700 mb-2">
                                Enter the 6-digit code from your authenticator app
                            </label>
                            <input
                                id="totp_code"
                                type="text"
                                inputMode="numeric"
                                value={totp_code}
                                onChange={handleChange}
                                maxLength={6}
                                className="input-field text-center text-2xl tracking-widest font-mono"
                                placeholder="000000"
                                autoFocus
                            />
                            <p className="text-xs text-gray-500 mt-2">
                                {totp_code.length}/6 digits
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={verifying || totp_code.length !== 6}
                            className="w-full btn btn-primary text-base py-3"
                        >
                            {verifying ? 'Verifying...' : 'Complete Setup'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
                        <p className="text-sm text-green-800 font-medium mb-2">✓ Security Improved</p>
                        <p className="text-xs text-green-700">
                            Your account is now protected with TOTP-based two-factor authentication. Future logins will require both your password and authenticator code.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

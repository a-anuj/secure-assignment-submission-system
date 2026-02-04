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
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                </div>
                <div className="card relative z-10">
                    <p className="text-center text-slate-400">Setting up your authenticator...</p>
                </div>
            </div>
        );
    }

    if (error && !enrollment) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
                {/* Animated background elements */}
                <div className="absolute inset-0 overflow-hidden">
                    <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                    <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                </div>
                <div className="card relative z-10">
                    <div className="p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300">
                        {error}
                    </div>
                    <button
                        onClick={() => navigate('/login')}
                        className="w-full mt-4 btn btn-secondary"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Animated background elements */}
            <div className="absolute inset-0 overflow-hidden">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-600 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-cyan-500 rounded-full mix-blend-multiply filter blur-3xl opacity-20 animate-pulse"></div>
            </div>
            <div className="max-w-md w-full relative z-10">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold gradient-text mb-2">
                        🔒 SecureSubmit
                    </h1>
                    <p className="text-slate-400">Set Up Two-Factor Authentication</p>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold gradient-text mb-4">Step 1: Scan QR Code</h2>
                    
                    <div className="bg-white p-4 rounded-lg mb-6 flex justify-center border border-slate-600/30">
                        {enrollment?.qr_code && (
                            <img
                                src={enrollment.qr_code}
                                alt="TOTP QR Code"
                                className="w-64 h-64"
                            />
                        )}
                    </div>

                    <p className="text-sm text-slate-400 mb-4">
                        Scan this QR code with your authenticator app:
                    </p>

                    <ul className="text-xs text-slate-400 space-y-2 mb-6 p-3 bg-cyan-900/20 border border-cyan-500/20 rounded">
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

                    <div className="mb-6 p-3 bg-orange-900/20 border border-orange-500/20 rounded-lg">
                        <p className="text-xs text-orange-400 font-medium mb-2">💾 Backup Code</p>
                        <p className="text-xs text-slate-400 mb-2">If you lose access to your authenticator app, you can use this backup code:</p>
                        <div 
                            className="bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-2 rounded font-mono text-xs text-center break-all cursor-pointer hover:bg-slate-800/60 border border-slate-600/50"
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
                                className="ml-2 text-cyan-400 hover:text-cyan-300 text-xs"
                            >
                                {showSecret ? 'Hide' : 'Show'}
                            </button>
                        </div>
                    </div>

                    <hr className="my-6 border-slate-700/50" />

                    <h3 className="text-lg font-bold gradient-text mb-4">Step 2: Verify Code</h3>

                    {error && (
                        <div className="mb-4 p-3 bg-red-900/30 border border-red-500/30 rounded-lg text-red-300 text-sm">
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
                            <label htmlFor="totp_code" className="block text-sm font-medium text-slate-300 mb-2">
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
                            <p className="text-xs text-slate-500 mt-2">
                                {totp_code.length}/6 digits
                            </p>
                        </div>

                        <button
                            type="submit"
                            disabled={verifying || totp_code.length !== 6}
                            className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition disabled:bg-slate-600 disabled:cursor-not-allowed"
                        >
                            {verifying ? 'Verifying...' : 'Complete Setup'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-emerald-900/20 border border-emerald-500/20 rounded-lg">
                        <p className="text-sm text-emerald-400 font-medium mb-2">✓ Security Improved</p>
                        <p className="text-xs text-slate-400">
                            Your account is now protected with TOTP-based two-factor authentication. Future logins will require both your password and authenticator code.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
};

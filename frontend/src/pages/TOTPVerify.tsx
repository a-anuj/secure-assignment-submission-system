/**
 * TOTP verification page - used both for:
 * 1. MFA enrollment confirmation (first login)
 * 2. Regular login when MFA is already enabled
 */
import { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../lib/auth';

export const TOTPVerify = () => {
    const [totp_code, setTOTPCode] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [attemptsRemaining, setAttemptsRemaining] = useState(5);
    const navigate = useNavigate();
    const location = useLocation();
    const { verifyTOTP } = useAuth();
    
    const email = (location.state?.email as string) || '';

    useEffect(() => {
        if (!email) {
            navigate('/login');
        }
    }, [email, navigate]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (totp_code.length !== 6 || !/^\d+$/.test(totp_code)) {
            setError('Please enter a valid 6-digit code');
            return;
        }
        
        setError('');
        setLoading(true);

        try {
            await verifyTOTP(email, totp_code);
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
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\D/g, '').slice(0, 6);
        setTOTPCode(value);
    };

    return (
        <div className="min-h-screen bg-gradient-to-br from-primary-50 via-white to-primary-50 flex items-center justify-center p-4">
            <div className="max-w-md w-full">
                <div className="text-center mb-8">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-primary-600 to-primary-800 bg-clip-text text-transparent mb-2">
                        🔐 SecureSubmit
                    </h1>
                    <p className="text-gray-600">TOTP Authentication</p>
                </div>

                <div className="card">
                    <h2 className="text-2xl font-bold text-gray-900 mb-2">Enter 6-Digit Code</h2>
                    <p className="text-gray-600 text-sm mb-6">
                        Enter the code from your authenticator app (Google Authenticator, Authy, or Microsoft Authenticator)
                    </p>

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

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="totp_code" className="block text-sm font-medium text-gray-700 mb-2">
                                Authenticator Code
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
                            disabled={loading || totp_code.length !== 6}
                            className="w-full btn btn-primary text-base py-3"
                        >
                            {loading ? 'Verifying...' : 'Verify Code'}
                        </button>
                    </form>

                    <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 font-medium mb-2">💡 Tips</p>
                        <ul className="text-xs text-yellow-700 space-y-1">
                            <li>• Code refreshes every 30 seconds</li>
                            <li>• Make sure your device time is synchronized</li>
                            <li>• If code expires, wait for the next code</li>
                        </ul>
                    </div>

                    <button
                        onClick={() => navigate('/login')}
                        className="w-full mt-4 text-center text-sm text-gray-600 hover:text-gray-900 underline"
                    >
                        Back to Login
                    </button>
                </div>
            </div>
        </div>
    );
};

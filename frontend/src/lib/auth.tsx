/**
 * Authentication context and utilities.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import api from './api';

export interface MFAEnrollment {
    qr_code: string;
    secret: string;
    message: string;
}

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ requires_otp: boolean; requires_totp: boolean; user_id: string; role: string }>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    enrollMFA: (email: string) => Promise<MFAEnrollment>;
    verifyTOTP: (email: string, totp_code: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (role: UserRole) => boolean;
    confirmLogout: () => Promise<boolean>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);
    const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
    const [logoutResolve, setLogoutResolve] = useState<((value: boolean) => void) | null>(null);

    // Check if user is already logged in
    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const response = await api.get('/auth/me');
                    setUser(response.data);
                } catch (error) {
                    // Token invalid, clear storage
                    localStorage.clear();
                }
            }
            setLoading(false);
        };

        checkAuth();
    }, []);

    const login = async (email: string, password: string) => {
        const response = await api.post('/auth/login', { email, password });
        const data = response.data;

        // Return flags for both OTP and TOTP
        if (data.requires_otp || data.requires_totp) {
            return {
                requires_otp: data.requires_otp,
                requires_totp: data.requires_totp,
                user_id: data.user_id,
                role: data.role
            };
        }

        // No OTP/TOTP required (shouldn't happen in this app, but handle it)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        return { requires_otp: false, requires_totp: false, user_id: data.user_id, role: data.role };
    };

    const verifyOTP = async (email: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { email, otp_code: otp });
        const data = response.data;

        // After OTP verification, tokens may be empty (user needs to complete MFA enrollment)
        if (data.access_token) {
            localStorage.setItem('access_token', data.access_token);
            localStorage.setItem('refresh_token', data.refresh_token);

            const userResponse = await api.get('/auth/me');
            setUser(userResponse.data);
        }
        // If tokens are empty, user should proceed to MFA enrollment
    };

    const enrollMFA = async (email: string): Promise<MFAEnrollment> => {
        const response = await api.post('/auth/mfa/enroll', { email });
        return response.data;
    };

    const verifyTOTP = async (email: string, totp_code: string) => {
        const response = await api.post('/auth/mfa/verify', { email, totp_code });
        const data = response.data;

        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);
    };

    const logout = () => {
        localStorage.clear();
        setUser(null);
        window.location.href = '/login';
    };

    const confirmLogout = async (): Promise<boolean> => {
        return new Promise((resolve) => {
            setLogoutResolve(() => resolve);
            setShowLogoutConfirm(true);
        });
    };

    const handleConfirmLogout = () => {
        setShowLogoutConfirm(false);
        if (logoutResolve) logoutResolve(true);
        logout();
    };

    const handleCancelLogout = () => {
        setShowLogoutConfirm(false);
        if (logoutResolve) logoutResolve(false);
    };

    const isAuthenticated = !!user;

    const hasRole = (role: UserRole) => {
        return user?.role === role;
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, verifyOTP, enrollMFA, verifyTOTP, logout, isAuthenticated, hasRole, confirmLogout }}
        >
            {children}
            
            {/* Logout Confirmation Modal */}
            {showLogoutConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-[9999] p-4">
                    <div className="bg-gradient-to-br from-slate-800 via-slate-800 to-slate-900 rounded-lg shadow-2xl max-w-sm w-full p-6 border border-slate-700/50">
                        <h2 className="text-2xl font-bold text-slate-100 mb-4">Confirm Logout</h2>
                        <p className="text-slate-300 mb-6">Are you sure you want to logout? You'll need to login again to access your account.</p>
                        
                        <div className="flex gap-3">
                            <button
                                onClick={handleConfirmLogout}
                                className="flex-1 bg-red-600 text-white py-3 px-6 rounded-lg font-semibold hover:bg-red-700 transition"
                            >
                                Logout
                            </button>
                            <button
                                onClick={handleCancelLogout}
                                className="flex-1 px-6 py-3 border border-slate-600/50 rounded-lg font-semibold text-slate-300 hover:bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 transition"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </AuthContext.Provider>
    );
};

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

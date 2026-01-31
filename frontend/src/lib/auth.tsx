/**
 * Authentication context and utilities.
 */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, UserRole } from './types';
import api from './api';

interface AuthContextType {
    user: User | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<{ requires_otp: boolean }>;
    verifyOTP: (email: string, otp: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    hasRole: (role: UserRole) => boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState(true);

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

        if (data.requires_otp) {
            // OTP required, don't set user yet
            return { requires_otp: true };
        }

        // No OTP required (shouldn't happen in this app, but handle it)
        localStorage.setItem('access_token', data.access_token);
        localStorage.setItem('refresh_token', data.refresh_token);

        const userResponse = await api.get('/auth/me');
        setUser(userResponse.data);

        return { requires_otp: false };
    };

    const verifyOTP = async (email: string, otp: string) => {
        const response = await api.post('/auth/verify-otp', { email, otp_code: otp });
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

    const isAuthenticated = !!user;

    const hasRole = (role: UserRole) => {
        return user?.role === role;
    };

    return (
        <AuthContext.Provider
            value={{ user, loading, login, verifyOTP, logout, isAuthenticated, hasRole }}
        >
            {children}
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

/**
 * Role-based route component for authorization.
 */
import { Navigate } from 'react-router-dom';
import { useAuth } from '../lib/auth';
import { UserRole } from '../lib/types';
import { ReactNode } from 'react';

interface RoleRouteProps {
    children: ReactNode;
    allowedRoles: UserRole[];
}

export const RoleRoute = ({ children, allowedRoles }: RoleRouteProps) => {
    const { user, loading } = useAuth();

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center">
                    <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-cyan-500"></div>
                    <p className="mt-4 text-slate-400">Loading...</p>
                </div>
            </div>
        );
    }

    if (!user || !allowedRoles.includes(user.role as UserRole)) {
        return <Navigate to="/unauthorized" replace />;
    }

    return <>{children}</>;
};

import { Navigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/services/permissions';

/** Post-login / role home redirect. */
export function RoleHome() {
  const { user, isLoading } = useAuth();
  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }
  if (!user) return <Navigate to="/login" replace />;
  if (isAdminRole(user.role) || user.role === 'demo_admin') {
    return <Navigate to="/dashboard" replace />;
  }
  return <Navigate to="/my-day" replace />;
}

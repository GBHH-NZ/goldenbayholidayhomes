import { Navigate, Outlet } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { TenantDataProvider } from '@/contexts/TenantDataContext';
import { AppNavbar } from '@/components/AppNavbar';
import { SyncStatusOverlay } from '@/components/SyncStatusOverlay';

export function ProtectedLayout() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <TenantDataProvider>
      <AppNavbar />
      <Container fluid className="pb-5 px-3 px-md-4">
        <Outlet />
      </Container>
      <SyncStatusOverlay />
    </TenantDataProvider>
  );
}

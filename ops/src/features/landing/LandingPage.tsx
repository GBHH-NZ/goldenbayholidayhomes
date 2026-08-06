import { Link, Navigate } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/services/permissions';

export default function LandingPage() {
  const { user, isLoading } = useAuth();

  if (!isLoading && user) {
    const dest =
      isAdminRole(user.role) || user.role === 'demo_admin' ? '/dashboard' : '/my-day';
    return <Navigate to={dest} replace />;
  }

  return (
    <div className="landing-hero mb-4">
      <Container className="py-5">
        <p className="text-uppercase small opacity-75 mb-2">Golden Bay Holiday Homes</p>
        <h1 className="display-4 fw-bold mb-3 font-display">Operations</h1>
        <p className="lead col-lg-7 mb-4 opacity-90">
          Managers track the whole team. Staff open My day, confirm each task, and completions show
          live on the overview.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          <Link to="/login" className="btn btn-light btn-lg">
            Staff &amp; manager login
          </Link>
        </div>
      </Container>
    </div>
  );
}

import { Link } from 'react-router-dom';
import { Container } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';

export default function LandingPage() {
  const { user } = useAuth();

  return (
    <div className="landing-hero mb-4">
      <Container className="py-5">
        <p className="text-uppercase small opacity-75 mb-2">Golden Bay Holiday Homes</p>
        <h1 className="display-4 fw-bold mb-3">Operations</h1>
        <p className="lead col-lg-7 mb-4 opacity-90">
          Schedule cleaners and property staff, confirm completed work, and keep every house
          profile driving realistic task times — ready for Firebase when you connect it.
        </p>
        <div className="d-flex gap-2 flex-wrap">
          {user ? (
            <Link to="/dashboard" className="btn btn-light btn-lg">
              Open dashboard
            </Link>
          ) : (
            <Link to="/login" className="btn btn-light btn-lg">
              Staff login
            </Link>
          )}
        </div>
      </Container>
    </div>
  );
}

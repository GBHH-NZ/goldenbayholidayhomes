import { useState, type FormEvent } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Alert, Button, Card, Col, Container, Form, Row } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { isAdminRole } from '@/services/permissions';

function homeForRole(role: string | undefined) {
  if (isAdminRole(role as never) || role === 'demo_admin') return '/dashboard';
  return '/my-day';
}

export default function LoginPage() {
  const { user, login, isMockMode } = useAuth();
  const navigate = useNavigate();
  const [username, setUsername] = useState(isMockMode ? 'test' : '');
  const [password, setPassword] = useState(isMockMode ? 'test' : '');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  if (user) return <Navigate to={homeForRole(user.role)} replace />;

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError('');
    const result = await login(username, password);
    setBusy(false);
    if (result.success) navigate('/home');
    else setError(result.message);
  }

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={5}>
          <Card className="ops-card border-0">
            <Card.Body className="p-4 p-md-5">
              <p className="text-uppercase small text-muted mb-1">Golden Bay Holiday Homes</p>
              <h1 className="h3 text-primary mb-1">Ops sign in</h1>
              <p className="text-muted mb-4">Managers and staff use the same login — your home view depends on role.</p>
              {isMockMode && (
                <Alert className="small" style={{ background: 'var(--foam)', borderColor: 'var(--drift)' }}>
                  Mock mode: <strong>test</strong>/<strong>test</strong> (manager), or staff{' '}
                  <strong>sarah</strong>/<strong>sarah</strong>, <strong>mike</strong>/<strong>mike</strong>,{' '}
                  <strong>ana</strong>/<strong>ana</strong>.
                </Alert>
              )}
              {error && <Alert variant="danger">{error}</Alert>}
              <Form onSubmit={onSubmit}>
                <Form.Group className="mb-3">
                  <Form.Label>Username</Form.Label>
                  <Form.Control
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    autoComplete="username"
                    required
                  />
                </Form.Group>
                <Form.Group className="mb-4">
                  <Form.Label>Password</Form.Label>
                  <Form.Control
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
                    required
                  />
                </Form.Group>
                <Button type="submit" className="w-100" disabled={busy}>
                  {busy ? 'Signing in…' : 'Sign in'}
                </Button>
              </Form>
              <div className="mt-3 text-center">
                <Link to="/">Back</Link>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </Container>
  );
}

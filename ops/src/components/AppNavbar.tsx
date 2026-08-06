import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { APP_VERSION } from '@/services/permissions';

export function AppNavbar() {
  const { user, logout } = useAuth();
  const { canManageEmployees, canManageTasks } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();

  const isActive = (path: string) => location.pathname.startsWith(path);

  return (
    <Navbar expand="lg" sticky="top" className="ops-nav shadow-sm mb-3">
      <Container fluid>
        <Navbar.Brand as={Link} to="/dashboard" className="fw-bold text-primary">
          <i className="bi bi-houses me-2" />
          GBHH Ops
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto">
            <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
              <i className="bi bi-speedometer2 me-1" /> Dashboard
            </Nav.Link>
            <Nav.Link as={Link} to="/properties" active={isActive('/properties')}>
              <i className="bi bi-geo-alt me-1" /> Properties
            </Nav.Link>
            <Nav.Link as={Link} to="/logs" active={isActive('/logs')}>
              <i className="bi bi-clipboard-check me-1" /> Work logs
            </Nav.Link>
            <Nav.Link as={Link} to="/schedule" active={isActive('/schedule')}>
              <i className="bi bi-calendar3 me-1" /> Schedule
            </Nav.Link>
            {canManageTasks() && (
              <Nav.Link as={Link} to="/tasks" active={isActive('/tasks')}>
                <i className="bi bi-list-task me-1" /> Tasks
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/checklists" active={isActive('/checklists')}>
              <i className="bi bi-shield-check me-1" /> Checklists
            </Nav.Link>
            <Nav.Link as={Link} to="/integrity" active={isActive('/integrity')}>
              <i className="bi bi-database-check me-1" /> Integrity
            </Nav.Link>
            {canManageEmployees() && (
              <Nav.Link as={Link} to="/team" active={isActive('/team')}>
                <i className="bi bi-people me-1" /> Team
              </Nav.Link>
            )}
            <Nav.Link as={Link} to="/reports" active={isActive('/reports')}>
              <i className="bi bi-graph-up me-1" /> Reports
            </Nav.Link>
          </Nav>
          <Nav>
            <NavDropdown
              title={
                <>
                  <i className="bi bi-person-circle me-1" />
                  {user?.username}
                </>
              }
              align="end"
            >
              <NavDropdown.ItemText>
                {user?.role?.replace('_', ' ')} · v{APP_VERSION}
              </NavDropdown.ItemText>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => navigate('/dashboard')}>Dashboard</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

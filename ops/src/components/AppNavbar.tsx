import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { APP_VERSION, isAdminRole } from '@/services/permissions';

export function AppNavbar() {
  const { user, logout } = useAuth();
  const { canManageEmployees, canManageTasks } = usePermissions();
  const location = useLocation();
  const navigate = useNavigate();
  const isManager = isAdminRole(user?.role) || user?.role === 'demo_admin';

  const isActive = (path: string) =>
    path === '/my-day'
      ? location.pathname === '/my-day'
      : location.pathname.startsWith(path);

  const homePath = isManager ? '/dashboard' : '/my-day';

  return (
    <Navbar expand="lg" sticky="top" className="ops-nav shadow-sm mb-3">
      <Container fluid>
        <Navbar.Brand as={Link} to={homePath} className="fw-bold">
          <i className="bi bi-houses me-2" />
          GBHH Ops
        </Navbar.Brand>
        <Navbar.Toggle aria-controls="main-nav" />
        <Navbar.Collapse id="main-nav">
          <Nav className="me-auto align-items-lg-center">
            {!isManager && (
              <>
                <Nav.Link as={Link} to="/my-day" active={isActive('/my-day')}>
                  My day
                </Nav.Link>
                <Nav.Link as={Link} to="/schedule" active={isActive('/schedule')}>
                  My schedule
                </Nav.Link>
                <Nav.Link as={Link} to="/logs/new" active={location.pathname === '/logs/new'}>
                  Log work
                </Nav.Link>
                <Nav.Link as={Link} to="/properties" active={isActive('/properties')}>
                  Properties
                </Nav.Link>
                <Nav.Link as={Link} to="/checklists" active={isActive('/checklists')}>
                  Checklists
                </Nav.Link>
              </>
            )}

            {isManager && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
                  Overview
                </Nav.Link>
                <Nav.Link as={Link} to="/schedule" active={isActive('/schedule')}>
                  Schedule
                </Nav.Link>
                <Nav.Link as={Link} to="/logs" active={isActive('/logs')}>
                  Logs
                </Nav.Link>
                <Nav.Link as={Link} to="/properties" active={isActive('/properties')}>
                  Properties
                </Nav.Link>
                {canManageEmployees() && (
                  <Nav.Link as={Link} to="/team" active={isActive('/team')}>
                    Team
                  </Nav.Link>
                )}
                {canManageTasks() && (
                  <Nav.Link as={Link} to="/tasks" active={isActive('/tasks')}>
                    Tasks
                  </Nav.Link>
                )}
                <NavDropdown title="More" id="admin-more">
                  <NavDropdown.Item as={Link} to="/checklists">
                    Checklists
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/integrity">
                    Integrity
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/reports">
                    Reports
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/my-day">
                    My day (staff view)
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
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
              <NavDropdown.Item onClick={() => navigate(homePath)}>Home</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>Logout</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

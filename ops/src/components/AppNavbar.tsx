import { Container, Navbar, Nav, NavDropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { useTenantData } from '@/contexts/TenantDataContext';
import { APP_VERSION, isAdminRole, staffLabel } from '@/services/permissions';
import { COPY } from '@/data/copy';

export function AppNavbar() {
  const { user, logout } = useAuth();
  const { canManageEmployees, canManageTasks } = usePermissions();
  const { data } = useTenantData();
  const location = useLocation();
  const navigate = useNavigate();
  const isManager = isAdminRole(user?.role) || user?.role === 'demo_admin';

  const me = data.employees.find((e) => e.username?.toLowerCase() === user?.username.toLowerCase());
  const label = staffLabel(me?.displayName, me?.jobType, user?.username);

  const isActive = (path: string) =>
    path === '/my-day' ? location.pathname === '/my-day' : location.pathname.startsWith(path);

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
                  {COPY.myDay}
                </Nav.Link>
                <Nav.Link as={Link} to="/schedule" active={isActive('/schedule')}>
                  {COPY.mySchedule}
                </Nav.Link>
                <Nav.Link as={Link} to="/logs/new" active={location.pathname === '/logs/new'}>
                  {COPY.logWork}
                </Nav.Link>
                <Nav.Link as={Link} to="/properties" active={isActive('/properties')}>
                  {COPY.properties}
                </Nav.Link>
                <Nav.Link as={Link} to="/checklists" active={isActive('/checklists')}>
                  {COPY.checklists}
                </Nav.Link>
              </>
            )}

            {isManager && (
              <>
                <Nav.Link as={Link} to="/dashboard" active={isActive('/dashboard')}>
                  {COPY.overview}
                </Nav.Link>
                <Nav.Link as={Link} to="/schedule" active={isActive('/schedule')}>
                  {COPY.schedule}
                </Nav.Link>
                <Nav.Link as={Link} to="/logs" active={isActive('/logs')}>
                  {COPY.activity}
                </Nav.Link>
                <Nav.Link as={Link} to="/properties" active={isActive('/properties')}>
                  {COPY.properties}
                </Nav.Link>
                {canManageEmployees() && (
                  <Nav.Link as={Link} to="/team" active={isActive('/team')}>
                    {COPY.team}
                  </Nav.Link>
                )}
                {canManageTasks() && (
                  <Nav.Link as={Link} to="/tasks" active={isActive('/tasks')}>
                    {COPY.taskList}
                  </Nav.Link>
                )}
                <NavDropdown title="More" id="admin-more">
                  <NavDropdown.Item as={Link} to="/checklists">
                    {COPY.checklists}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/integrity">
                    {COPY.dataHealth}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/reports">
                    {COPY.reports}
                  </NavDropdown.Item>
                  <NavDropdown.Divider />
                  <NavDropdown.Item as={Link} to="/dashboard#coming-soon">
                    {COPY.integrations}
                  </NavDropdown.Item>
                  <NavDropdown.Item as={Link} to="/my-day">
                    {COPY.myDay} (staff view)
                  </NavDropdown.Item>
                </NavDropdown>
              </>
            )}
          </Nav>
          <Nav>
            <NavDropdown title={<>{label}</>} align="end">
              <NavDropdown.ItemText>
                {user?.role?.replace('_', ' ')} · v{APP_VERSION}
              </NavDropdown.ItemText>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={() => navigate(homePath)}>Home</NavDropdown.Item>
              <NavDropdown.Divider />
              <NavDropdown.Item onClick={logout}>Log out</NavDropdown.Item>
            </NavDropdown>
          </Nav>
        </Navbar.Collapse>
      </Container>
    </Navbar>
  );
}

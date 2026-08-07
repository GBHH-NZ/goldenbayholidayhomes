import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { mutate, newId, tenantPath } from '@/services/mutations';
import type { Employee, JobType, UserRole } from '@/types';
import { getRoleDisplayName } from '@/services/permissions';
import { JOB_TYPE_LABELS, jobTypeLabel, COPY } from '@/data/copy';
import { PageHeader } from '@/components/ui/PageHeader';
import { useState, type FormEvent } from 'react';

export default function TeamPage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const { canManageEmployees, canDelete } = usePermissions();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState({
    username: '',
    displayName: '',
    email: '',
    phone: '',
    skills: '',
    role: 'employee' as UserRole,
    jobType: 'cleaner' as JobType,
    tempPassword: '',
  });

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!canManageEmployees()) {
    return <Alert variant="warning">Admin access required.</Alert>;
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const id = newId('emp');
    const next: Employee = {
      id,
      username: form.username.trim(),
      displayName: form.displayName,
      email: form.email,
      phone: form.phone,
      skills: form.skills,
      role: form.role,
      jobType: form.jobType,
      tenantId: user.tenantId,
      active: true,
      tempPassword: form.tempPassword || form.username,
      createdAt: new Date().toISOString(),
    };
    await mutate(tenantPath(user.tenantId, 'employees', id), next, 'create_employee', 'set', () => {
      setData((d) => ({ ...d, employees: [...d.employees, next] }));
    });
    setShow(false);
  }

  async function updateJobType(id: string, jobType: JobType) {
    if (!user) return;
    const emp = data.employees.find((e) => e.id === id);
    if (!emp) return;
    const next = { ...emp, jobType };
    await mutate(tenantPath(user.tenantId, 'employees', id), next, 'update_employee_job', 'set', () => {
      setData((d) => ({
        ...d,
        employees: d.employees.map((e) => (e.id === id ? next : e)),
      }));
    });
  }

  async function deactivate(id: string) {
    if (!user || !canDelete()) return;
    const emp = data.employees.find((e) => e.id === id);
    if (!emp) return;
    const next = { ...emp, active: false };
    await mutate(tenantPath(user.tenantId, 'employees', id), next, 'deactivate_employee', 'set', () => {
      setData((d) => ({
        ...d,
        employees: d.employees.map((e) => (e.id === id ? next : e)),
      }));
    });
  }

  return (
    <div>
      <PageHeader
        title={COPY.team}
        subtitle="Staff accounts for My day assignments and completions."
        actions={
          <Button size="sm" onClick={() => setShow(true)}>
            Add staff
          </Button>
        }
      />
      <div className="ops-card table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Username</th>
              <th>Job</th>
              <th>Access</th>
              <th>Contact</th>
              <th>Status</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.employees.map((e) => (
              <tr key={e.id}>
                <td>
                  {e.displayName || e.username}
                  {e.skills && <div className="small text-muted">{e.skills}</div>}
                </td>
                <td>{e.username}</td>
                <td>
                  <Form.Select
                    size="sm"
                    style={{ maxWidth: 140 }}
                    value={e.jobType || 'other'}
                    onChange={(ev) => void updateJobType(e.id, ev.target.value as JobType)}
                  >
                    {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((jt) => (
                      <option key={jt} value={jt}>
                        {jobTypeLabel(jt)}
                      </option>
                    ))}
                  </Form.Select>
                </td>
                <td>
                  <Badge bg="light" text="dark">
                    {getRoleDisplayName(e.role || 'employee')}
                  </Badge>
                </td>
                <td className="small">
                  {e.email}
                  <br />
                  {e.phone}
                </td>
                <td>
                  <Badge bg={e.active === false ? 'secondary' : 'success'}>
                    {e.active === false ? 'Inactive' : 'Active'}
                  </Badge>
                </td>
                <td className="text-end">
                  {canDelete() && e.active !== false && e.username !== 'test' && (
                    <Button size="sm" variant="outline-danger" onClick={() => void deactivate(e.id)}>
                      Deactivate
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>

      <Modal show={show} onHide={() => setShow(false)} centered>
        <Form onSubmit={save}>
          <Modal.Header closeButton>
            <Modal.Title>Add staff</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Display name</Form.Label>
              <Form.Control
                value={form.displayName}
                onChange={(e) => setForm({ ...form, displayName: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Username</Form.Label>
              <Form.Control
                value={form.username}
                onChange={(e) => setForm({ ...form, username: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Temp password (mock)</Form.Label>
              <Form.Control
                value={form.tempPassword}
                onChange={(e) => setForm({ ...form, tempPassword: e.target.value })}
                placeholder="Defaults to username"
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Job type</Form.Label>
              <Form.Select
                value={form.jobType}
                onChange={(e) => setForm({ ...form, jobType: e.target.value as JobType })}
              >
                {(Object.keys(JOB_TYPE_LABELS) as JobType[]).map((jt) => (
                  <option key={jt} value={jt}>
                    {jobTypeLabel(jt)}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Access</Form.Label>
              <Form.Select
                value={form.role}
                onChange={(e) => setForm({ ...form, role: e.target.value as UserRole })}
              >
                <option value="employee">Staff</option>
                <option value="admin">Manager</option>
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Email</Form.Label>
              <Form.Control
                type="email"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Phone</Form.Label>
              <Form.Control
                value={form.phone}
                onChange={(e) => setForm({ ...form, phone: e.target.value })}
              />
            </Form.Group>
            <Form.Group>
              <Form.Label>Skills</Form.Label>
              <Form.Control
                value={form.skills}
                onChange={(e) => setForm({ ...form, skills: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setShow(false)}>
              Cancel
            </Button>
            <Button type="submit">Save</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

import { Alert, Badge, Button, Form, Modal, Spinner, Table } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { mutate, newId, tenantPath } from '@/services/mutations';
import type { TaskTemplate } from '@/types';
import { estimateTaskMinutes, formatDuration } from '@/data/taskRules';
import { PageHeader } from '@/components/ui/PageHeader';
import { COPY } from '@/data/copy';
import { useState, type FormEvent } from 'react';

const blank = (): TaskTemplate => ({
  id: '',
  name: '',
  category: 'Cleaning',
  description: '',
  baseMinutes: 30,
  common: true,
  scalesWithBeds: false,
  scalesWithBaths: false,
  petsExtraMinutes: 0,
  hotTubExtraMinutes: 0,
  gardenExtraMinutes: 0,
});

export default function TasksPage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const { canManageTasks, canDelete } = usePermissions();
  const [show, setShow] = useState(false);
  const [form, setForm] = useState<TaskTemplate>(blank());
  const [editing, setEditing] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  if (!canManageTasks()) {
    return <Alert variant="warning">You do not have permission to manage the task library.</Alert>;
  }

  const sampleProp = data.properties[0];

  function openNew() {
    setForm(blank());
    setEditing(false);
    setShow(true);
  }

  function openEdit(t: TaskTemplate) {
    setForm({ ...t });
    setEditing(true);
    setShow(true);
  }

  async function save(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    const id = editing ? form.id : newId('task');
    const next = { ...form, id };
    await mutate(tenantPath(user.tenantId, 'taskTemplates', id), next, 'save_task', 'set', () => {
      setData((d) => {
        const exists = d.taskTemplates.some((t) => t.id === id);
        return {
          ...d,
          taskTemplates: exists
            ? d.taskTemplates.map((t) => (t.id === id ? next : t))
            : [...d.taskTemplates, next],
        };
      });
    });
    setShow(false);
  }

  async function remove(id: string) {
    if (!user || !canDelete()) return;
    if (!confirm('Delete this task template?')) return;
    await mutate(tenantPath(user.tenantId, 'taskTemplates', id), null, 'delete_task', 'remove', () => {
      setData((d) => ({ ...d, taskTemplates: d.taskTemplates.filter((t) => t.id !== id) }));
    });
  }

  return (
    <div>
      <PageHeader
        title={COPY.taskList}
        subtitle="Base times scale with beds, baths, pets, and amenities."
        actions={
          <Button size="sm" onClick={openNew}>
            Add task
          </Button>
        }
      />
      <div className="ops-card table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Name</th>
              <th>Category</th>
              <th>Base min</th>
              <th>Sample ETA</th>
              <th>Common</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {data.taskTemplates.map((t) => (
              <tr key={t.id}>
                <td>
                  <strong>{t.name}</strong>
                  {t.description && <div className="small text-muted">{t.description}</div>}
                </td>
                <td>{t.category}</td>
                <td>{t.baseMinutes != null ? formatDuration(t.baseMinutes) : '—'}</td>
                <td>
                  {sampleProp ? (
                    <Badge bg="light" text="dark">
                      {formatDuration(estimateTaskMinutes(t, sampleProp))} @ {sampleProp.name}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td>{t.common ? 'Yes' : 'No'}</td>
                <td className="text-end text-nowrap">
                  <Button size="sm" variant="outline-primary" className="me-1" onClick={() => openEdit(t)}>
                    Edit
                  </Button>
                  {canDelete() && (
                    <Button size="sm" variant="outline-danger" onClick={() => void remove(t.id)}>
                      Delete
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
            <Modal.Title>{editing ? 'Edit task' : 'New task'}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Name</Form.Label>
              <Form.Control
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Category</Form.Label>
              <Form.Control
                value={form.category}
                onChange={(e) => setForm({ ...form, category: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Description</Form.Label>
              <Form.Control
                value={form.description ?? ''}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Base minutes</Form.Label>
              <Form.Control
                type="number"
                value={form.baseMinutes ?? 30}
                onChange={(e) => setForm({ ...form, baseMinutes: Number(e.target.value) })}
              />
            </Form.Group>
            <div className="d-flex flex-wrap gap-3 mb-2">
              <Form.Check
                label="Common (turnover set)"
                checked={!!form.common}
                onChange={(e) => setForm({ ...form, common: e.target.checked })}
              />
              <Form.Check
                label="Scales with beds"
                checked={!!form.scalesWithBeds}
                onChange={(e) => setForm({ ...form, scalesWithBeds: e.target.checked })}
              />
              <Form.Check
                label="Scales with baths"
                checked={!!form.scalesWithBaths}
                onChange={(e) => setForm({ ...form, scalesWithBaths: e.target.checked })}
              />
            </div>
            <RowExtras form={form} setForm={setForm} />
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

function RowExtras({
  form,
  setForm,
}: {
  form: TaskTemplate;
  setForm: (t: TaskTemplate) => void;
}) {
  return (
    <div className="row g-2">
      <div className="col-4">
        <Form.Label className="small">Pets extra</Form.Label>
        <Form.Control
          type="number"
          value={form.petsExtraMinutes ?? 0}
          onChange={(e) => setForm({ ...form, petsExtraMinutes: Number(e.target.value) })}
        />
      </div>
      <div className="col-4">
        <Form.Label className="small">Hot tub extra</Form.Label>
        <Form.Control
          type="number"
          value={form.hotTubExtraMinutes ?? 0}
          onChange={(e) => setForm({ ...form, hotTubExtraMinutes: Number(e.target.value) })}
        />
      </div>
      <div className="col-4">
        <Form.Label className="small">Garden extra</Form.Label>
        <Form.Control
          type="number"
          value={form.gardenExtraMinutes ?? 0}
          onChange={(e) => setForm({ ...form, gardenExtraMinutes: Number(e.target.value) })}
        />
      </div>
    </div>
  );
}

import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Alert, Button, Form, Spinner } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, newId, tenantPath } from '@/services/mutations';
import { estimateTaskMinutes } from '@/data/taskRules';
import type { WorkLog } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';

export default function LogWorkPage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [propertyId, setPropertyId] = useState('');
  const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
  const [notes, setNotes] = useState('');
  const [flag, setFlag] = useState('');
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [saving, setSaving] = useState(false);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const property = data.properties.find((p) => p.id === propertyId) ?? data.properties[0];
  const activePropertyId = propertyId || property?.id || '';

  function toggleTask(id: string) {
    setSelectedTasks((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user || !activePropertyId || selectedTasks.length === 0) return;
    setSaving(true);
    const prop = data.properties.find((p) => p.id === activePropertyId);
    const created: WorkLog[] = [];

    for (const taskId of selectedTasks) {
      const template = data.taskTemplates.find((t) => t.id === taskId);
      if (!template) continue;
      const id = newId('log');
      const est = estimateTaskMinutes(template, prop);
      const log: WorkLog = {
        id,
        propertyId: activePropertyId,
        taskId: template.id,
        taskName: template.name,
        taskCategory: template.category,
        date,
        notes: notes || undefined,
        flag: flag || undefined,
        loggedBy: user.username,
        estimatedMinutes: est,
        actualMinutes: est,
        createdAt: new Date().toISOString(),
      };
      created.push(log);
      await mutate(tenantPath(user.tenantId, 'workLogs', id), log, 'create_log', 'set');
    }

    setData((d) => ({ ...d, workLogs: [...d.workLogs, ...created] }));
    setSaving(false);
    navigate('/logs');
  }

  return (
    <div>
      <Link to="/logs" className="small text-muted">
        ← Work logs
      </Link>
      <PageHeader
        title="Confirm work done"
        subtitle="Log one or more tasks for a property (also used outside the schedule)."
      />
      <Form onSubmit={onSubmit} className="ops-card p-3 p-md-4 border-0">
        <Form.Group className="mb-3">
          <Form.Label>Property</Form.Label>
          <Form.Select
            value={activePropertyId}
            onChange={(e) => setPropertyId(e.target.value)}
            required
          >
            {data.properties
              .filter((p) => !p.archived)
              .map((p) => (
                <option key={p.id} value={p.id}>
                  {p.name} ({p.town})
                </option>
              ))}
          </Form.Select>
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Date</Form.Label>
          <Form.Control type="date" value={date} onChange={(e) => setDate(e.target.value)} />
        </Form.Group>
        <Form.Label>Tasks completed</Form.Label>
        <div className="mb-3 border rounded p-2" style={{ maxHeight: 240, overflow: 'auto' }}>
          {data.taskTemplates.map((t) => {
            const est = estimateTaskMinutes(t, property);
            return (
              <Form.Check
                key={t.id}
                type="checkbox"
                className="mb-1"
                label={`${t.name} (~${est} min)`}
                checked={selectedTasks.includes(t.id)}
                onChange={() => toggleTask(t.id)}
              />
            );
          })}
        </div>
        {selectedTasks.length === 0 && (
          <Alert variant="light" className="border">
            Select one or more tasks.
          </Alert>
        )}
        <Form.Group className="mb-3">
          <Form.Label>Notes</Form.Label>
          <Form.Control as="textarea" rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
        </Form.Group>
        <Form.Group className="mb-3">
          <Form.Label>Flag (optional)</Form.Label>
          <Form.Select value={flag} onChange={(e) => setFlag(e.target.value)}>
            <option value="">None</option>
            <option value="issue">Issue</option>
            <option value="follow_up">Follow up</option>
            <option value="damage">Damage</option>
          </Form.Select>
        </Form.Group>
        <Button type="submit" disabled={saving || selectedTasks.length === 0}>
          {saving ? 'Saving…' : 'Confirm & log'}
        </Button>
      </Form>
    </div>
  );
}

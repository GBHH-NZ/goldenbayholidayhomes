import { useMemo, useState, type FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { Alert, Badge, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, newId, tenantPath } from '@/services/mutations';
import type { ScheduledTask } from '@/types';
import { estimateTaskMinutes } from '@/data/taskRules';

export default function SchedulePage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const [selected, setSelected] = useState<ScheduledTask | null>(null);
  const [creating, setCreating] = useState<{ date: string } | null>(null);
  const [form, setForm] = useState({
    propertyId: '',
    taskId: '',
    assignedTo: '',
    priority: 'normal',
    notes: '',
  });

  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? id;

  const events = useMemo(
    () =>
      data.scheduledTasks
        .filter((t) => t.status !== 'cancelled')
        .map((t) => ({
          id: t.id,
          title: `${t.taskName} · ${propName(t.propertyId)}`,
          start: t.scheduledDate,
          allDay: true,
          backgroundColor:
            t.status === 'completed'
              ? '#6c757d'
              : t.overdue || t.priority === 'high'
                ? '#b33a3a'
                : '#1a5f4a',
          borderColor: 'transparent',
          extendedProps: { task: t },
        })),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [data.scheduledTasks, data.properties]
  );

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  function onEventClick(arg: EventClickArg) {
    setSelected(arg.event.extendedProps.task as ScheduledTask);
  }

  function onSelect(arg: DateSelectArg) {
    setForm({
      propertyId: data.properties[0]?.id ?? '',
      taskId: data.taskTemplates.find((t) => t.common)?.id ?? data.taskTemplates[0]?.id ?? '',
      assignedTo: user?.username ?? '',
      priority: 'normal',
      notes: '',
    });
    setCreating({ date: arg.startStr.slice(0, 10) });
  }

  async function createTask(e: FormEvent) {
    e.preventDefault();
    if (!user || !creating) return;
    const template = data.taskTemplates.find((t) => t.id === form.taskId);
    const property = data.properties.find((p) => p.id === form.propertyId);
    if (!template || !property) return;
    const id = newId('sched');
    const next: ScheduledTask = {
      id,
      propertyId: form.propertyId,
      taskId: template.id,
      taskName: template.name,
      scheduledDate: creating.date,
      priority: form.priority,
      status: 'pending',
      assignedTo: form.assignedTo,
      notes: form.notes || undefined,
      estimatedMinutes: estimateTaskMinutes(template, property),
      overdue: false,
    };
    await mutate(tenantPath(user.tenantId, 'scheduledTasks', id), next, 'create_sched', 'set', () => {
      setData((d) => ({ ...d, scheduledTasks: [...d.scheduledTasks, next] }));
    });
    setCreating(null);
  }

  async function completeTask(task: ScheduledTask) {
    if (!user) return;
    const updated: ScheduledTask = { ...task, status: 'completed', overdue: false };
    await mutate(
      tenantPath(user.tenantId, 'scheduledTasks', task.id),
      updated,
      'complete_sched',
      'set',
      () => {
        setData((d) => ({
          ...d,
          scheduledTasks: d.scheduledTasks.map((t) => (t.id === task.id ? updated : t)),
        }));
      }
    );
    const logId = newId('log');
    const template = data.taskTemplates.find((t) => t.id === task.taskId);
    const log = {
      id: logId,
      propertyId: task.propertyId,
      taskId: task.taskId,
      taskName: task.taskName,
      taskCategory: template?.category,
      date: new Date().toISOString().slice(0, 10),
      loggedBy: user.username,
      estimatedMinutes: task.estimatedMinutes,
      actualMinutes: task.estimatedMinutes,
      notes: task.notes,
      createdAt: new Date().toISOString(),
    };
    await mutate(tenantPath(user.tenantId, 'workLogs', logId), log, 'log_from_sched', 'set', () => {
      setData((d) => ({ ...d, workLogs: [...d.workLogs, log] }));
    });
    setSelected(null);
  }

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-0">Schedule</h1>
          <p className="text-muted small mb-0">Click a day to add a task · click an event to complete</p>
        </div>
        <Badge bg="light" text="dark">
          {data.scheduledTasks.filter((t) => t.status === 'pending').length} pending
        </Badge>
      </div>
      <div className="ops-card p-2">
        <FullCalendar
          plugins={[dayGridPlugin, timeGridPlugin, interactionPlugin]}
          initialView="dayGridMonth"
          headerToolbar={{
            left: 'prev,next today',
            center: 'title',
            right: 'dayGridMonth,timeGridWeek',
          }}
          height="auto"
          selectable
          selectMirror
          events={events}
          eventClick={onEventClick}
          select={onSelect}
        />
      </div>

      <Modal show={!!selected} onHide={() => setSelected(null)} centered>
        <Modal.Header closeButton>
          <Modal.Title>Scheduled task</Modal.Title>
        </Modal.Header>
        {selected && (
          <Modal.Body>
            <p className="mb-1">
              <strong>{selected.taskName}</strong>
            </p>
            <p className="text-muted small">
              {propName(selected.propertyId)} · {selected.scheduledDate}
              <br />
              Assigned: {selected.assignedTo || '—'} · Est. {selected.estimatedMinutes ?? '—'} min
              <br />
              Status: {selected.status}
              {selected.overdue && (
                <Badge bg="danger" className="ms-2">
                  Overdue
                </Badge>
              )}
            </p>
            {selected.notes && <Alert variant="light">{selected.notes}</Alert>}
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
          {selected && selected.status !== 'completed' && (
            <Button onClick={() => void completeTask(selected)}>Mark complete & log</Button>
          )}
        </Modal.Footer>
      </Modal>

      <Modal show={!!creating} onHide={() => setCreating(null)} centered>
        <Form onSubmit={createTask}>
          <Modal.Header closeButton>
            <Modal.Title>Schedule for {creating?.date}</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form.Group className="mb-2">
              <Form.Label>Property</Form.Label>
              <Form.Select
                value={form.propertyId}
                onChange={(e) => setForm({ ...form, propertyId: e.target.value })}
                required
              >
                {data.properties
                  .filter((p) => !p.archived)
                  .map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Task</Form.Label>
              <Form.Select
                value={form.taskId}
                onChange={(e) => setForm({ ...form, taskId: e.target.value })}
                required
              >
                {data.taskTemplates.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.name}
                  </option>
                ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Assign to</Form.Label>
              <Form.Select
                value={form.assignedTo}
                onChange={(e) => setForm({ ...form, assignedTo: e.target.value })}
              >
                {data.employees
                  .filter((e) => e.active !== false)
                  .map((e) => (
                    <option key={e.id} value={e.username}>
                      {e.displayName || e.username}
                    </option>
                  ))}
              </Form.Select>
            </Form.Group>
            <Form.Group className="mb-2">
              <Form.Label>Priority</Form.Label>
              <Form.Select
                value={form.priority}
                onChange={(e) => setForm({ ...form, priority: e.target.value })}
              >
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </Form.Select>
            </Form.Group>
            <Form.Group>
              <Form.Label>Notes</Form.Label>
              <Form.Control
                value={form.notes}
                onChange={(e) => setForm({ ...form, notes: e.target.value })}
              />
            </Form.Group>
          </Modal.Body>
          <Modal.Footer>
            <Button variant="secondary" onClick={() => setCreating(null)}>
              Cancel
            </Button>
            <Button type="submit">Create</Button>
          </Modal.Footer>
        </Form>
      </Modal>
    </div>
  );
}

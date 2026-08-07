import { useMemo, useState, type FormEvent } from 'react';
import FullCalendar from '@fullcalendar/react';
import dayGridPlugin from '@fullcalendar/daygrid';
import timeGridPlugin from '@fullcalendar/timegrid';
import interactionPlugin from '@fullcalendar/interaction';
import type { EventClickArg, DateSelectArg } from '@fullcalendar/core';
import { Alert, Button, Form, Modal, Spinner } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, newId, tenantPath } from '@/services/mutations';
import type { JobType, ScheduledTask } from '@/types';
import { estimateTaskMinutes, formatDuration } from '@/data/taskRules';
import { completeScheduledTask, isTaskOverdue } from '@/services/taskCompletion';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { CompleteTaskModal, type CompleteTaskResult } from '@/components/ui/CompleteTaskModal';
import { isAdminRole, staffLabel } from '@/services/permissions';
import { COPY, JOB_TYPE_LABELS, jobTypeLabel } from '@/data/copy';

const JOB_ORDER: JobType[] = ['cleaner', 'maintenance', 'manager', 'other'];

export default function SchedulePage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const [selected, setSelected] = useState<ScheduledTask | null>(null);
  const [completing, setCompleting] = useState<ScheduledTask | null>(null);
  const [creating, setCreating] = useState<{ date: string } | null>(null);
  const [busy, setBusy] = useState(false);
  const [form, setForm] = useState({
    propertyId: '',
    taskId: '',
    assignedTo: '',
    priority: 'normal',
    notes: '',
  });

  const isManager = isAdminRole(user?.role) || user?.role === 'demo_admin';
  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? id;

  const employeesByJob = useMemo(() => {
    const active = data.employees.filter((e) => e.active !== false);
    return JOB_ORDER.map((jt) => ({
      jobType: jt,
      people: active.filter((e) => (e.jobType || 'other') === jt),
    })).filter((g) => g.people.length > 0);
  }, [data.employees]);

  const events = useMemo(() => {
    const tasks = isManager
      ? data.scheduledTasks
      : data.scheduledTasks.filter(
          (t) => t.assignedTo?.toLowerCase() === user?.username.toLowerCase()
        );
    return tasks
      .filter((t) => t.status !== 'cancelled')
      .map((t) => ({
        id: t.id,
        title: `${t.taskName} · ${propName(t.propertyId)}`,
        start: t.scheduledDate,
        allDay: true,
        backgroundColor:
          t.status === 'completed'
            ? '#5a6a72'
            : isTaskOverdue(t) || t.priority === 'high'
              ? '#c4784a'
              : '#1a5f6e',
        borderColor: 'transparent',
        extendedProps: { task: t },
      }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.scheduledTasks, data.properties, isManager, user?.username]);

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
    if (!isManager) return;
    setForm({
      propertyId: data.properties[0]?.id ?? '',
      taskId: data.taskTemplates.find((t) => t.common)?.id ?? data.taskTemplates[0]?.id ?? '',
      assignedTo: data.employees.find((e) => e.role === 'employee')?.username ?? user?.username ?? '',
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

  function startComplete() {
    if (!selected) return;
    setCompleting(selected);
    setSelected(null);
  }

  async function onConfirmComplete(result: CompleteTaskResult) {
    if (!user || !completing) return;
    setBusy(true);
    try {
      await completeScheduledTask({
        tenantId: user.tenantId,
        username: user.username,
        task: completing,
        templates: data.taskTemplates,
        setData,
        notes: result.notes,
        flag: result.flag,
        photoDataUrl: result.photoDataUrl,
      });
      setCompleting(null);
    } finally {
      setBusy(false);
    }
  }

  const openCount = data.scheduledTasks.filter(
    (t) =>
      t.status !== 'completed' &&
      t.status !== 'cancelled' &&
      (isManager || t.assignedTo?.toLowerCase() === user?.username.toLowerCase())
  ).length;

  const assigneeLabel = (username?: string) => {
    if (!username) return '—';
    const emp = data.employees.find((e) => e.username?.toLowerCase() === username.toLowerCase());
    return staffLabel(emp?.displayName, emp?.jobType, username);
  };

  return (
    <div>
      <PageHeader
        title={isManager ? COPY.schedule : COPY.mySchedule}
        subtitle={
          isManager
            ? 'Click a day to assign work · click an event to mark done'
            : 'Your assigned tasks — mark done here or on My day'
        }
        actions={<StatusBadge status="pending" label={`${openCount} open`} />}
      />
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
          selectable={isManager}
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
              Assigned: {assigneeLabel(selected.assignedTo)} · Est.{' '}
              {selected.estimatedMinutes != null
                ? formatDuration(selected.estimatedMinutes)
                : '—'}
              <br />
              Status: {selected.status}
              {isTaskOverdue(selected) && (
                <span className="ms-2">
                  <StatusBadge status="overdue" />
                </span>
              )}
            </p>
            {selected.notes && <Alert variant="light">{selected.notes}</Alert>}
            {selected.completionPhotoUrl && (
              <img src={selected.completionPhotoUrl} alt="" className="completion-thumb mb-2" />
            )}
            {selected.completedBy && (
              <p className="small text-success mb-0">
                Done by {assigneeLabel(selected.completedBy)}
                {selected.completedAt ? ` · ${new Date(selected.completedAt).toLocaleString()}` : ''}
              </p>
            )}
          </Modal.Body>
        )}
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setSelected(null)}>
            Close
          </Button>
          {selected && selected.status !== 'completed' && (
            <Button variant="success" onClick={startComplete}>
              {COPY.markDone}
            </Button>
          )}
        </Modal.Footer>
      </Modal>

      <CompleteTaskModal
        task={completing}
        propertyName={completing ? propName(completing.propertyId) : undefined}
        busy={busy}
        onHide={() => setCompleting(null)}
        onConfirm={(r) => void onConfirmComplete(r)}
      />

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
                      {p.name} ({p.town})
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
                {employeesByJob.map((g) => (
                  <optgroup key={g.jobType} label={JOB_TYPE_LABELS[g.jobType] ?? jobTypeLabel(g.jobType)}>
                    {g.people.map((e) => (
                      <option key={e.id} value={e.username}>
                        {e.displayName || e.username}
                      </option>
                    ))}
                  </optgroup>
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

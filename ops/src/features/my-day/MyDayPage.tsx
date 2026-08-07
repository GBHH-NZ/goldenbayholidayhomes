import { useMemo, useState } from 'react';
import { Alert, Col, Row, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantData } from '@/contexts/TenantDataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { TaskRow } from '@/components/ui/TaskRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { CompleteTaskModal, type CompleteTaskResult } from '@/components/ui/CompleteTaskModal';
import {
  completeScheduledTask,
  isTaskOpen,
  isTaskOverdue,
  todayIso,
} from '@/services/taskCompletion';
import type { ScheduledTask } from '@/types';
import { COPY } from '@/data/copy';

export default function MyDayPage() {
  const { user } = useAuth();
  const { data, isLoading, setData } = useTenantData();
  const [pending, setPending] = useState<ScheduledTask | null>(null);
  const [busy, setBusy] = useState(false);

  const today = todayIso();

  const propOf = (id: string) => data.properties.find((p) => p.id === id);

  const mine = useMemo(() => {
    if (!user) return [];
    return data.scheduledTasks
      .filter((t) => t.assignedTo?.toLowerCase() === user.username.toLowerCase())
      .filter((t) => isTaskOpen(t) && t.scheduledDate <= today)
      .sort((a, b) => {
        const ao = isTaskOverdue(a) ? 0 : 1;
        const bo = isTaskOverdue(b) ? 0 : 1;
        if (ao !== bo) return ao - bo;
        const townA = propOf(a.propertyId)?.town || '';
        const townB = propOf(b.propertyId)?.town || '';
        if (townA !== townB) return townA.localeCompare(townB);
        return a.scheduledDate.localeCompare(b.scheduledDate) || (a.taskName || '').localeCompare(b.taskName || '');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data.scheduledTasks, data.properties, user, today]);

  const doneToday = useMemo(() => {
    if (!user) return [];
    return data.scheduledTasks.filter(
      (t) =>
        t.assignedTo?.toLowerCase() === user.username.toLowerCase() &&
        t.status === 'completed' &&
        (t.completedAt?.slice(0, 10) === today || t.scheduledDate === today)
    );
  }, [data.scheduledTasks, user, today]);

  async function onConfirm(result: CompleteTaskResult) {
    if (!user || !pending) return;
    setBusy(true);
    try {
      await completeScheduledTask({
        tenantId: user.tenantId,
        username: user.username,
        task: pending,
        templates: data.taskTemplates,
        setData,
        notes: result.notes,
        flag: result.flag,
        photoDataUrl: result.photoDataUrl,
      });
      setPending(null);
    } finally {
      setBusy(false);
    }
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const overdueCount = mine.filter(isTaskOverdue).length;

  return (
    <div className="staff-surface">
      <PageHeader
        title={COPY.myDay}
        subtitle={`Kia ora ${user?.username} — mark each job done when you finish.`}
      />

      <Row className="g-3 mb-4">
        <Col xs={4}>
          <StatCard label="Open today" value={mine.length} />
        </Col>
        <Col xs={4}>
          <StatCard label="Overdue" value={overdueCount} tone={overdueCount ? 'warning' : 'default'} />
        </Col>
        <Col xs={4}>
          <StatCard label="Done today" value={doneToday.length} tone="success" />
        </Col>
      </Row>

      {overdueCount > 0 && (
        <Alert variant="warning" className="border-0">
          {overdueCount} overdue — do these first when you can.
        </Alert>
      )}

      <div className="ops-card overflow-hidden mb-4">
        <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
          To do · by town
        </div>
        {mine.length === 0 ? (
          <EmptyState
            icon="bi-check2-circle"
            title="All clear for now"
            detail="No open jobs assigned to you through today."
          />
        ) : (
          mine.map((t) => {
            const prop = propOf(t.propertyId);
            return (
              <TaskRow
                key={t.id}
                task={t}
                propertyName={prop?.name ?? t.propertyId}
                town={prop?.town}
                staffMode
                onComplete={(task) => setPending(task)}
                completing={busy && pending?.id === t.id}
              />
            );
          })
        )}
      </div>

      {doneToday.length > 0 && (
        <div className="ops-card overflow-hidden">
          <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
            Done today
          </div>
          {doneToday.map((t) => {
            const prop = propOf(t.propertyId);
            return (
              <TaskRow
                key={t.id}
                task={t}
                propertyName={prop?.name ?? t.propertyId}
                town={prop?.town}
              />
            );
          })}
        </div>
      )}

      <CompleteTaskModal
        task={pending}
        propertyName={pending ? propOf(pending.propertyId)?.name : undefined}
        busy={busy}
        onHide={() => setPending(null)}
        onConfirm={(r) => void onConfirm(r)}
      />
    </div>
  );
}

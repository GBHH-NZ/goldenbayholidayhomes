import { useMemo, useState } from 'react';
import { Alert, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantData } from '@/contexts/TenantDataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { TaskRow } from '@/components/ui/TaskRow';
import { EmptyState } from '@/components/ui/EmptyState';
import { StatCard } from '@/components/ui/StatCard';
import { Col, Row } from 'react-bootstrap';
import {
  completeScheduledTask,
  isTaskOpen,
  isTaskOverdue,
  todayIso,
} from '@/services/taskCompletion';
import type { ScheduledTask } from '@/types';

export default function MyDayPage() {
  const { user } = useAuth();
  const { data, isLoading, setData } = useTenantData();
  const [busyId, setBusyId] = useState<string | null>(null);

  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? id;
  const today = todayIso();

  const mine = useMemo(() => {
    if (!user) return [];
    return data.scheduledTasks
      .filter((t) => t.assignedTo?.toLowerCase() === user.username.toLowerCase())
      .filter((t) => isTaskOpen(t) && t.scheduledDate <= today)
      .sort((a, b) => {
        const ao = isTaskOverdue(a) ? 0 : 1;
        const bo = isTaskOverdue(b) ? 0 : 1;
        if (ao !== bo) return ao - bo;
        return a.scheduledDate.localeCompare(b.scheduledDate) || (a.taskName || '').localeCompare(b.taskName || '');
      });
  }, [data.scheduledTasks, user, today]);

  const doneToday = useMemo(() => {
    if (!user) return [];
    return data.scheduledTasks.filter(
      (t) =>
        t.assignedTo?.toLowerCase() === user.username.toLowerCase() &&
        t.status === 'completed' &&
        (t.completedAt?.slice(0, 10) === today || t.scheduledDate === today)
    );
  }, [data.scheduledTasks, user, today]);

  async function onComplete(task: ScheduledTask) {
    if (!user) return;
    setBusyId(task.id);
    try {
      await completeScheduledTask({
        tenantId: user.tenantId,
        username: user.username,
        task,
        templates: data.taskTemplates,
        setData,
      });
    } finally {
      setBusyId(null);
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
    <div>
      <PageHeader
        title="My day"
        subtitle={`Hi ${user?.username} — confirm each task when it’s done. Managers see completions live.`}
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
          You have {overdueCount} overdue task{overdueCount === 1 ? '' : 's'}. Complete those first when you can.
        </Alert>
      )}

      <div className="ops-card overflow-hidden mb-4">
        <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
          To do
        </div>
        {mine.length === 0 ? (
          <EmptyState
            icon="bi-check2-circle"
            title="All clear for now"
            detail="No open tasks assigned to you through today."
          />
        ) : (
          mine.map((t) => (
            <TaskRow
              key={t.id}
              task={t}
              propertyName={propName(t.propertyId)}
              onComplete={onComplete}
              completing={busyId === t.id}
            />
          ))
        )}
      </div>

      {doneToday.length > 0 && (
        <div className="ops-card overflow-hidden">
          <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
            Completed today
          </div>
          {doneToday.map((t) => (
            <TaskRow key={t.id} task={t} propertyName={propName(t.propertyId)} />
          ))}
        </div>
      )}
    </div>
  );
}

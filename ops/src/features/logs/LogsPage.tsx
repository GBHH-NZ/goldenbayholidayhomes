import { Link } from 'react-router-dom';
import { Button, Form, Spinner, Table } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { mutate, tenantPath } from '@/services/mutations';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { formatDuration } from '@/data/taskRules';
import { COPY } from '@/data/copy';
import { staffLabel } from '@/services/permissions';

export default function LogsPage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const { canDelete } = usePermissions();
  const [flagOnly, setFlagOnly] = useState(false);

  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? id;

  const rows = useMemo(() => {
    return [...data.workLogs]
      .filter((l) => !l.deleted)
      .filter((l) => (flagOnly ? Boolean(l.flag) : true))
      .sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id));
  }, [data.workLogs, flagOnly]);

  async function softDelete(id: string) {
    if (!user || !canDelete()) return;
    const log = data.workLogs.find((l) => l.id === id);
    if (!log) return;
    const next = { ...log, deleted: true };
    await mutate(tenantPath(user.tenantId, 'workLogs', id), next, 'delete_log', 'set', () => {
      setData((d) => ({
        ...d,
        workLogs: d.workLogs.map((l) => (l.id === id ? next : l)),
      }));
    });
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader
        title={COPY.activity}
        subtitle="Confirmed activity from My day and manual logs."
        actions={
          <Link to="/logs/new" className="btn btn-primary btn-sm">
            {COPY.logWork}
          </Link>
        }
      />
      <Form.Check
        type="switch"
        className="mb-3"
        label="Flagged only"
        checked={flagOnly}
        onChange={(e) => setFlagOnly(e.target.checked)}
      />
      <div className="ops-card table-responsive">
        <Table hover className="mb-0 align-middle">
          <thead>
            <tr>
              <th>Date</th>
              <th>Task</th>
              <th>Property</th>
              <th>By</th>
              <th>Minutes</th>
              <th>Flag</th>
              <th />
            </tr>
          </thead>
          <tbody>
            {rows.map((l) => {
              const emp = data.employees.find(
                (e) => e.username?.toLowerCase() === l.loggedBy?.toLowerCase()
              );
              return (
                <tr key={l.id}>
                  <td>{l.date}</td>
                  <td>
                    <div className="d-flex gap-2 align-items-start">
                      {l.photoDataUrl && (
                        <img src={l.photoDataUrl} alt="" className="completion-thumb flex-shrink-0" />
                      )}
                      <div>
                        {l.taskName}
                        {l.notes && <div className="small text-muted">{l.notes}</div>}
                      </div>
                    </div>
                  </td>
                  <td>{propName(l.propertyId)}</td>
                  <td>{staffLabel(emp?.displayName, emp?.jobType, l.loggedBy)}</td>
                  <td>
                    {l.actualMinutes != null ? formatDuration(l.actualMinutes) : '—'}
                    {l.estimatedMinutes != null && (
                      <span className="text-muted small"> / {formatDuration(l.estimatedMinutes)} est</span>
                    )}
                  </td>
                  <td>{l.flag ? <StatusBadge status={l.flag} /> : '—'}</td>
                  <td className="text-end">
                    {canDelete() && (
                      <Button size="sm" variant="outline-danger" onClick={() => void softDelete(l.id)}>
                        Delete
                      </Button>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

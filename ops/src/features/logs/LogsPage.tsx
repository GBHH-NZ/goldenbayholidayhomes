import { Link } from 'react-router-dom';
import { Badge, Button, Form, Spinner, Table } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { mutate, tenantPath } from '@/services/mutations';

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
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <h1 className="h3 mb-0">Work logs</h1>
        <Link to="/logs/new" className="btn btn-primary btn-sm">
          Log work
        </Link>
      </div>
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
            {rows.map((l) => (
              <tr key={l.id}>
                <td>{l.date}</td>
                <td>
                  {l.taskName}
                  {l.notes && <div className="small text-muted">{l.notes}</div>}
                </td>
                <td>{propName(l.propertyId)}</td>
                <td>{l.loggedBy}</td>
                <td>
                  {l.actualMinutes ?? '—'}
                  {l.estimatedMinutes != null && (
                    <span className="text-muted small"> / {l.estimatedMinutes} est</span>
                  )}
                </td>
                <td>
                  {l.flag ? (
                    <Badge bg="warning" text="dark">
                      {l.flag}
                    </Badge>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="text-end">
                  {canDelete() && (
                    <Button size="sm" variant="outline-danger" onClick={() => void softDelete(l.id)}>
                      Delete
                    </Button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </div>
    </div>
  );
}

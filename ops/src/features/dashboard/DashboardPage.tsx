import { useMemo } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Col, ListGroup, Row, Spinner } from 'react-bootstrap';
import { useAuth } from '@/contexts/AuthContext';
import { useTenantData } from '@/contexts/TenantDataContext';
import { isAdminRole } from '@/services/permissions';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatCard } from '@/components/ui/StatCard';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { EmptyState } from '@/components/ui/EmptyState';
import { isTaskOpen, isTaskOverdue, todayIso } from '@/services/taskCompletion';
import { estimatePropertyTurnoverMinutes } from '@/data/taskRules';

export default function DashboardPage() {
  const { user } = useAuth();
  const { data, isLoading } = useTenantData();
  const today = todayIso();

  const completedToday = useMemo(
    () =>
      [...data.scheduledTasks]
        .filter(
          (t) =>
            t.status === 'completed' &&
            (t.completedAt?.slice(0, 10) === today ||
              (!t.completedAt && t.scheduledDate === today))
        )
        .sort((a, b) => (b.completedAt || '').localeCompare(a.completedAt || '')),
    [data.scheduledTasks, today]
  );

  if (user && !isAdminRole(user.role) && user.role !== 'demo_admin') {
    return <Navigate to="/my-day" replace />;
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? id;
  const activeProps = data.properties.filter((p) => !p.archived);
  const overdue = data.scheduledTasks.filter(isTaskOverdue);
  const pendingToday = data.scheduledTasks.filter(
    (t) => t.scheduledDate === today && isTaskOpen(t)
  );

  return (
    <div>
      <PageHeader
        title="Operations overview"
        subtitle="Live view of staff completions, overdue work, and property load."
        actions={
          <>
            <Link className="btn btn-outline-primary btn-sm" to="/schedule">
              Schedule
            </Link>
            <Link className="btn btn-primary btn-sm" to="/logs/new">
              Log work
            </Link>
          </>
        }
      />

      <Row className="g-3 mb-4">
        <Col xs={6} md={3}>
          <StatCard label="Properties" value={activeProps.length} to="/properties" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard label="Due today" value={pendingToday.length} to="/schedule" />
        </Col>
        <Col xs={6} md={3}>
          <StatCard
            label="Overdue"
            value={overdue.length}
            to="/schedule"
            tone={overdue.length ? 'warning' : 'default'}
          />
        </Col>
        <Col xs={6} md={3}>
          <StatCard label="Completed today" value={completedToday.length} tone="success" />
        </Col>
      </Row>

      <Row className="g-3 mb-4">
        <Col lg={6}>
          <div className="ops-card h-100">
            <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
              Staff completions today
            </div>
            {completedToday.length === 0 ? (
              <EmptyState
                icon="bi-people"
                title="No completions yet"
                detail="When staff mark tasks complete on My day, they appear here."
              />
            ) : (
              <div className="px-3">
                {completedToday.slice(0, 10).map((t) => (
                  <div key={t.id} className="feed-item">
                    <div className="d-flex justify-content-between gap-2 flex-wrap">
                      <span>
                        <strong>{t.completedBy || t.assignedTo || 'Staff'}</strong> completed{' '}
                        <strong>{t.taskName}</strong> @ {propName(t.propertyId)}
                      </span>
                      <span className="small text-muted text-nowrap">
                        {t.completedAt
                          ? new Date(t.completedAt).toLocaleTimeString([], {
                              hour: '2-digit',
                              minute: '2-digit',
                            })
                          : t.scheduledDate}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </Col>
        <Col lg={6}>
          <div className="ops-card h-100">
            <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
              Overdue / at risk
            </div>
            <ListGroup variant="flush">
              {overdue.slice(0, 8).map((t) => (
                <ListGroup.Item
                  key={t.id}
                  className="d-flex justify-content-between align-items-start gap-2"
                >
                  <span>
                    <strong>{t.taskName}</strong>
                    <div className="small text-muted">
                      {propName(t.propertyId)} · {t.assignedTo || 'Unassigned'}
                    </div>
                  </span>
                  <StatusBadge status="overdue" label={t.scheduledDate} />
                </ListGroup.Item>
              ))}
              {overdue.length === 0 && (
                <ListGroup.Item className="text-muted">Nothing overdue.</ListGroup.Item>
              )}
            </ListGroup>
          </div>
        </Col>
      </Row>

      <div className="ops-card">
        <div className="px-3 py-2 border-bottom fw-semibold" style={{ background: 'var(--foam)' }}>
          Est. turnover minutes (common tasks × property profile)
        </div>
        <div className="table-responsive">
          <table className="table mb-0 align-middle">
            <thead>
              <tr>
                <th>Property</th>
                <th>Town</th>
                <th>Beds / baths</th>
                <th>Tier</th>
                <th>Est. minutes</th>
              </tr>
            </thead>
            <tbody>
              {activeProps.slice(0, 8).map((p) => (
                <tr key={p.id}>
                  <td>
                    <Link to={`/properties/${p.id}`}>{p.name}</Link>
                  </td>
                  <td>{p.town}</td>
                  <td>
                    {p.bedrooms}/{p.bathrooms}
                  </td>
                  <td>
                    <span className="property-chip">{p.cleaningTier}</span>
                  </td>
                  <td>{estimatePropertyTurnoverMinutes(data.taskTemplates, p)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

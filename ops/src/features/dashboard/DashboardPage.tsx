import { Link } from 'react-router-dom';
import { Alert, Card, Col, Row, Spinner, Badge, ListGroup } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { estimatePropertyTurnoverMinutes } from '@/data/taskRules';

export default function DashboardPage() {
  const { data, isLoading, isStale } = useTenantData();

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" variant="primary" />
      </div>
    );
  }

  const activeProps = data.properties.filter((p) => !p.archived);
  const overdue = data.scheduledTasks.filter(
    (t) => t.overdue || (t.status === 'pending' && t.scheduledDate < new Date().toISOString().slice(0, 10))
  );
  const pendingToday = data.scheduledTasks.filter(
    (t) => t.scheduledDate === new Date().toISOString().slice(0, 10) && t.status !== 'completed'
  );
  const flagged = data.workLogs.filter((l) => l.flag && !l.deleted);
  const recentLogs = [...data.workLogs]
    .filter((l) => !l.deleted)
    .sort((a, b) => b.date.localeCompare(a.date))
    .slice(0, 5);

  const propName = (id: string) => data.properties.find((p) => p.id === id)?.name ?? id;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-3 flex-wrap gap-2">
        <div>
          <h1 className="h3 mb-0">Dashboard</h1>
          <p className="text-muted mb-0 small">Golden Bay holiday home operations</p>
        </div>
        <div className="d-flex gap-2">
          <Link className="btn btn-outline-primary btn-sm" to="/logs/new">
            Log work
          </Link>
          <Link className="btn btn-primary btn-sm" to="/schedule">
            Schedule
          </Link>
        </div>
      </div>

      {isStale && <Alert variant="warning">Showing cached / offline data.</Alert>}

      <Row className="g-3 mb-4">
        {[
          { label: 'Properties', value: activeProps.length, to: '/properties' },
          { label: 'Due today', value: pendingToday.length, to: '/schedule' },
          { label: 'Overdue', value: overdue.length, to: '/schedule' },
          { label: 'Flagged logs', value: flagged.length, to: '/logs' },
        ].map((s) => (
          <Col key={s.label} xs={6} md={3}>
            <Card as={Link} to={s.to} className="ops-card ops-stat text-decoration-none text-dark h-100">
              <div className="stat-value">{s.value}</div>
              <div className="text-muted small">{s.label}</div>
            </Card>
          </Col>
        ))}
      </Row>

      <Row className="g-3">
        <Col lg={6}>
          <Card className="ops-card h-100">
            <Card.Header className="bg-white fw-semibold">Overdue / at risk</Card.Header>
            <ListGroup variant="flush">
              {overdue.slice(0, 8).map((t) => (
                <ListGroup.Item key={t.id} className="d-flex justify-content-between">
                  <span>
                    <strong>{t.taskName}</strong> · {propName(t.propertyId)}
                  </span>
                  <Badge bg="danger">{t.scheduledDate}</Badge>
                </ListGroup.Item>
              ))}
              {overdue.length === 0 && (
                <ListGroup.Item className="text-muted">Nothing overdue.</ListGroup.Item>
              )}
            </ListGroup>
          </Card>
        </Col>
        <Col lg={6}>
          <Card className="ops-card h-100">
            <Card.Header className="bg-white fw-semibold">Recent work logs</Card.Header>
            <ListGroup variant="flush">
              {recentLogs.map((l) => (
                <ListGroup.Item key={l.id}>
                  <div className="d-flex justify-content-between">
                    <span>
                      {l.taskName} · {propName(l.propertyId)}
                    </span>
                    <span className="text-muted small">{l.date}</span>
                  </div>
                  {l.flag && (
                    <Badge bg="warning" text="dark" className="mt-1">
                      {l.flag}
                    </Badge>
                  )}
                </ListGroup.Item>
              ))}
            </ListGroup>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="ops-card">
            <Card.Header className="bg-white fw-semibold">
              Est. turnover minutes (common tasks × property profile)
            </Card.Header>
            <Card.Body className="p-0">
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
                        <td>{p.cleaningTier}</td>
                        <td>{estimatePropertyTurnoverMinutes(data.taskTemplates, p)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

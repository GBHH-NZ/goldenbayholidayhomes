import { Alert, Badge, Card, ListGroup, Spinner } from 'react-bootstrap';
import { useMemo } from 'react';
import { useTenantData } from '@/contexts/TenantDataContext';
import { PageHeader } from '@/components/ui/PageHeader';
import { COPY } from '@/data/copy';

interface Issue {
  severity: 'error' | 'warning' | 'info';
  message: string;
}

export default function IntegrityPage() {
  const { data, isLoading } = useTenantData();

  const issues = useMemo(() => {
    const list: Issue[] = [];
    const propIds = new Set(data.properties.map((p) => p.id));

    for (const t of data.scheduledTasks) {
      if (!propIds.has(t.propertyId)) {
        list.push({
          severity: 'error',
          message: `Scheduled task ${t.id} references missing property ${t.propertyId}`,
        });
      }
      if (!t.assignedTo) {
        list.push({ severity: 'warning', message: `Task ${t.taskName} on ${t.scheduledDate} has no assignee` });
      }
      if (t.status === 'pending' && t.scheduledDate < new Date().toISOString().slice(0, 10)) {
        list.push({
          severity: 'warning',
          message: `Overdue pending: ${t.taskName} @ ${t.scheduledDate}`,
        });
      }
    }

    for (const l of data.workLogs.filter((x) => !x.deleted)) {
      if (!propIds.has(l.propertyId)) {
        list.push({
          severity: 'error',
          message: `Work log ${l.id} references missing property ${l.propertyId}`,
        });
      }
    }

    for (const p of data.properties.filter((x) => !x.archived)) {
      if (p.latitude == null || p.longitude == null) {
        list.push({ severity: 'info', message: `${p.name} has no map coordinates` });
      }
      if (!p.bedrooms || !p.bathrooms) {
        list.push({
          severity: 'warning',
          message: `${p.name} missing bedrooms/bathrooms (affects ETA)`,
        });
      }
    }

    const usernames = new Set(data.employees.map((e) => e.username.toLowerCase()));
    if (usernames.size !== data.employees.length) {
      list.push({ severity: 'error', message: 'Duplicate employee usernames detected' });
    }

    if (data.taskTemplates.length === 0) {
      list.push({ severity: 'error', message: 'No task templates in library' });
    }

    return list;
  }, [data]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const errors = issues.filter((i) => i.severity === 'error').length;
  const warnings = issues.filter((i) => i.severity === 'warning').length;

  return (
    <div>
      <PageHeader title={COPY.dataHealth} subtitle="Quick checks for missing links and odd records." />
      <div className="d-flex gap-2 mb-3">
        <Badge bg="danger">{errors} errors</Badge>
        <Badge bg="warning" text="dark">
          {warnings} warnings
        </Badge>
        <Badge bg="info">{issues.length - errors - warnings} info</Badge>
      </div>
      {issues.length === 0 ? (
        <Alert variant="success">No issues found.</Alert>
      ) : (
        <Card className="ops-card">
          <ListGroup variant="flush">
            {issues.map((issue, i) => (
              <ListGroup.Item key={i} className="d-flex gap-2">
                <Badge
                  bg={
                    issue.severity === 'error'
                      ? 'danger'
                      : issue.severity === 'warning'
                        ? 'warning'
                        : 'info'
                  }
                  text={issue.severity === 'warning' ? 'dark' : undefined}
                >
                  {issue.severity}
                </Badge>
                <span>{issue.message}</span>
              </ListGroup.Item>
            ))}
          </ListGroup>
        </Card>
      )}
    </div>
  );
}

import { Badge, Button, Card, Form, ListGroup, Spinner } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, tenantPath } from '@/services/mutations';
import type { ChecklistItem } from '@/types';
import { PageHeader } from '@/components/ui/PageHeader';

export default function ChecklistsPage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  async function toggle(item: ChecklistItem) {
    if (!user) return;
    const next: ChecklistItem = item.completed
      ? { ...item, completed: false, completedAt: undefined, completedBy: undefined }
      : {
          ...item,
          completed: true,
          completedAt: new Date().toISOString().slice(0, 10),
          completedBy: user.username,
        };
    await mutate(tenantPath(user.tenantId, 'checklists', item.id), next, 'toggle_checklist', 'set', () => {
      setData((d) => ({
        ...d,
        checklists: d.checklists.map((c) => (c.id === item.id ? next : c)),
      }));
    });
  }

  const byCategory = data.checklists.reduce<Record<string, ChecklistItem[]>>((acc, item) => {
    (acc[item.category] ??= []).push(item);
    return acc;
  }, {});

  return (
    <div>
      <PageHeader
        title="Ops checklists"
        subtitle="Turnover, safety, and inventory reminders stored in tenant data."
      />
      <div className="row g-3">
        {Object.entries(byCategory).map(([category, items]) => (
          <div className="col-md-6" key={category}>
            <Card className="ops-card h-100 border-0">
              <Card.Header className="border-0 fw-semibold" style={{ background: 'var(--foam)' }}>
                {category}
              </Card.Header>
              <ListGroup variant="flush">
                {items.map((item) => (
                  <ListGroup.Item key={item.id} className="d-flex gap-2 align-items-start">
                    <Form.Check
                      className="mt-1"
                      checked={!!item.completed}
                      onChange={() => void toggle(item)}
                    />
                    <div className="flex-grow-1">
                      <div className={item.completed ? 'text-decoration-line-through text-muted' : ''}>
                        {item.title}
                      </div>
                      {item.description && <div className="small text-muted">{item.description}</div>}
                      <div className="small mt-1">
                        {item.dueLabel && (
                          <Badge bg="light" text="dark" className="me-1">
                            Due: {item.dueLabel}
                          </Badge>
                        )}
                        {item.completed && (
                          <span className="text-muted">
                            Done {item.completedAt} by {item.completedBy}
                          </span>
                        )}
                      </div>
                    </div>
                    {!item.completed && (
                      <Button size="sm" variant="outline-primary" onClick={() => void toggle(item)}>
                        Done
                      </Button>
                    )}
                  </ListGroup.Item>
                ))}
              </ListGroup>
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

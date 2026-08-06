import { Link } from 'react-router-dom';
import { Button, Card, Form, Spinner } from 'react-bootstrap';
import { useMemo, useState } from 'react';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { mutate, tenantPath } from '@/services/mutations';
import { estimatePropertyTurnoverMinutes } from '@/data/taskRules';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';

export default function PropertiesPage() {
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const { canDelete } = usePermissions();
  const [q, setQ] = useState('');
  const [showArchived, setShowArchived] = useState(false);

  const filtered = useMemo(() => {
    return data.properties
      .filter((p) => (showArchived ? true : !p.archived))
      .filter((p) => {
        const hay = `${p.name} ${p.town} ${p.address}`.toLowerCase();
        return hay.includes(q.toLowerCase());
      })
      .sort((a, b) => a.name.localeCompare(b.name));
  }, [data.properties, q, showArchived]);

  async function archive(id: string) {
    if (!user || !canDelete()) return;
    const prop = data.properties.find((p) => p.id === id);
    if (!prop) return;
    const next = { ...prop, archived: true, updatedAt: new Date().toISOString() };
    await mutate(tenantPath(user.tenantId, 'properties', id), next, 'archive_property', 'set', () => {
      setData((d) => ({
        ...d,
        properties: d.properties.map((p) => (p.id === id ? next : p)),
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
        title="Properties"
        subtitle="House profiles drive task volume and estimated completion time."
        actions={
          <Link to="/properties/new" className="btn btn-primary btn-sm">
            Add property
          </Link>
        }
      />
      <div className="d-flex gap-3 mb-3 flex-wrap align-items-center">
        <Form.Control
          style={{ maxWidth: 280 }}
          placeholder="Search…"
          value={q}
          onChange={(e) => setQ(e.target.value)}
        />
        <Form.Check
          type="switch"
          label="Show archived"
          checked={showArchived}
          onChange={(e) => setShowArchived(e.target.checked)}
        />
      </div>
      <div className="row g-3">
        {filtered.map((p) => (
          <div className="col-md-6 col-xl-4" key={p.id}>
            <Card className="ops-card h-100 border-0">
              <Card.Body>
                <div className="d-flex justify-content-between gap-2">
                  <Card.Title className="h5 mb-1">
                    <Link to={`/properties/${p.id}`} className="text-decoration-none text-primary">
                      {p.name}
                    </Link>
                  </Card.Title>
                  {p.archived && <StatusBadge status="cancelled" label="Archived" />}
                </div>
                <Card.Text className="text-muted small mb-2">
                  {p.town} · {p.address}
                </Card.Text>
                <div className="small mb-2">
                  {p.bedrooms} bed · {p.bathrooms} bath · {p.maxGuests} guests
                  {p.petsAllowed ? ' · pets' : ''}
                </div>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="property-chip">
                    ~{estimatePropertyTurnoverMinutes(data.taskTemplates, p)} min turnover
                  </span>
                  <span className="property-chip">{p.cleaningTier}</span>
                </div>
              </Card.Body>
              {canDelete() && !p.archived && (
                <Card.Footer className="bg-white border-0 pt-0">
                  <Button size="sm" variant="outline-danger" onClick={() => void archive(p.id)}>
                    Archive
                  </Button>
                </Card.Footer>
              )}
            </Card>
          </div>
        ))}
      </div>
    </div>
  );
}

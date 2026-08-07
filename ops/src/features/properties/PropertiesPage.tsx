import { Link } from 'react-router-dom';
import { Button, Card, Form, Spinner } from 'react-bootstrap';
import { useMemo, useState, type CSSProperties } from 'react';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { usePermissions } from '@/hooks/usePermissions';
import { mutate, tenantPath } from '@/services/mutations';
import { estimatePropertyTurnoverMinutes, formatDuration } from '@/data/taskRules';
import { PageHeader } from '@/components/ui/PageHeader';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { COPY } from '@/data/copy';

function propertyThumbStyle(lat?: number, lng?: number): CSSProperties {
  const h = Math.abs(Math.round(((lat ?? -40.8) * 47 + (lng ?? 172.8) * 83) % 360));
  return {
    background: `linear-gradient(145deg, hsl(${h} 38% 58%), hsl(${(h + 48) % 360} 32% 78%))`,
  };
}

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
        title={COPY.properties}
        subtitle="Profiles drive how long each job is expected to take."
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
            <Card className="ops-card h-100 border-0 overflow-hidden">
              <div className="property-thumb" style={propertyThumbStyle(p.latitude, p.longitude)} />
              <Card.Body>
                <div className="d-flex justify-content-between gap-2 align-items-start">
                  <Card.Title className="h5 mb-1">
                    <Link to={`/properties/${p.id}`} className="text-decoration-none text-primary">
                      {p.name}
                    </Link>
                  </Card.Title>
                  {p.archived && <StatusBadge status="cancelled" label="Archived" />}
                </div>
                <div className="mb-2">
                  {p.town && <span className="property-chip me-1">{p.town}</span>}
                  <span className="small text-muted">{p.address}</span>
                </div>
                <div className="small mb-2">
                  {p.bedrooms} bed · {p.bathrooms} bath · {p.maxGuests} guests
                  {p.petsAllowed ? ' · pets' : ''}
                </div>
                <div className="d-flex justify-content-between align-items-center flex-wrap gap-2">
                  <span className="property-chip">
                    ~{formatDuration(estimatePropertyTurnoverMinutes(data.taskTemplates, p))} turnover
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

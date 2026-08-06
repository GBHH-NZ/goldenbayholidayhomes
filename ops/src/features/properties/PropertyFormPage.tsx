import { useEffect, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { Alert, Button, Col, Form, Row, Spinner } from 'react-bootstrap';
import { useTenantData } from '@/contexts/TenantDataContext';
import { useAuth } from '@/contexts/AuthContext';
import { mutate, newId, tenantPath } from '@/services/mutations';
import type { CleaningTier, Property } from '@/types';
import { MapPicker } from '@/components/MapPicker';
import { estimatePropertyTurnoverMinutes } from '@/data/taskRules';

const empty: Property = {
  id: '',
  name: '',
  address: '',
  town: 'Pohara',
  bedrooms: 2,
  bathrooms: 1,
  maxGuests: 4,
  petsAllowed: false,
  cleaningTier: 'standard',
  approximateSqm: 90,
  hasHotTub: false,
  hasPool: false,
  hasGarden: true,
  linenIncluded: true,
  status: 'active',
  archived: false,
  latitude: -40.85,
  longitude: 172.8,
};

export default function PropertyFormPage() {
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const { data, isLoading, setData } = useTenantData();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [form, setForm] = useState<Property>(empty);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!isNew && data.properties.length) {
      const found = data.properties.find((p) => p.id === id);
      if (found) setForm(found);
    }
  }, [id, isNew, data.properties]);

  function set<K extends keyof Property>(key: K, value: Property[K]) {
    setForm((f) => ({ ...f, [key]: value }));
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!user) return;
    if (!form.name.trim()) {
      setError('Name is required');
      return;
    }
    setSaving(true);
    setError('');
    const propertyId = isNew ? newId('prop') : form.id;
    const next: Property = {
      ...form,
      id: propertyId,
      updatedAt: new Date().toISOString(),
    };
    await mutate(tenantPath(user.tenantId, 'properties', propertyId), next, 'save_property', 'set', () => {
      setData((d) => {
        const exists = d.properties.some((p) => p.id === propertyId);
        return {
          ...d,
          properties: exists
            ? d.properties.map((p) => (p.id === propertyId ? next : p))
            : [...d.properties, next],
        };
      });
    });
    setSaving(false);
    navigate('/properties');
  }

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  const eta = estimatePropertyTurnoverMinutes(data.taskTemplates, form);

  return (
    <div>
      <div className="mb-3">
        <Link to="/properties" className="small">
          ← Properties
        </Link>
        <h1 className="h3 mt-1">{isNew ? 'New property' : form.name}</h1>
      </div>
      {error && <Alert variant="danger">{error}</Alert>}
      <Form onSubmit={onSubmit} className="ops-card p-3 p-md-4">
        <Row className="g-3">
          <Col md={6}>
            <Form.Group>
              <Form.Label>Name</Form.Label>
              <Form.Control value={form.name} onChange={(e) => set('name', e.target.value)} required />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Town</Form.Label>
              <Form.Control value={form.town ?? ''} onChange={(e) => set('town', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={3}>
            <Form.Group>
              <Form.Label>Cleaning tier</Form.Label>
              <Form.Select
                value={form.cleaningTier}
                onChange={(e) => set('cleaningTier', e.target.value as CleaningTier)}
              >
                <option value="standard">Standard</option>
                <option value="deep">Deep</option>
                <option value="premium">Premium</option>
              </Form.Select>
            </Form.Group>
          </Col>
          <Col md={8}>
            <Form.Group>
              <Form.Label>Address</Form.Label>
              <Form.Control value={form.address ?? ''} onChange={(e) => set('address', e.target.value)} />
            </Form.Group>
          </Col>
          <Col md={4}>
            <Form.Group>
              <Form.Label>Approx. m²</Form.Label>
              <Form.Control
                type="number"
                value={form.approximateSqm ?? ''}
                onChange={(e) => set('approximateSqm', Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col xs={4}>
            <Form.Group>
              <Form.Label>Bedrooms</Form.Label>
              <Form.Control
                type="number"
                min={0}
                value={form.bedrooms ?? 0}
                onChange={(e) => set('bedrooms', Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col xs={4}>
            <Form.Group>
              <Form.Label>Bathrooms</Form.Label>
              <Form.Control
                type="number"
                min={0}
                step={0.5}
                value={form.bathrooms ?? 0}
                onChange={(e) => set('bathrooms', Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col xs={4}>
            <Form.Group>
              <Form.Label>Max guests</Form.Label>
              <Form.Control
                type="number"
                min={1}
                value={form.maxGuests ?? 1}
                onChange={(e) => set('maxGuests', Number(e.target.value))}
              />
            </Form.Group>
          </Col>
          <Col xs={12} className="d-flex flex-wrap gap-3">
            <Form.Check
              label="Pets allowed"
              checked={!!form.petsAllowed}
              onChange={(e) => set('petsAllowed', e.target.checked)}
            />
            <Form.Check
              label="Hot tub"
              checked={!!form.hasHotTub}
              onChange={(e) => set('hasHotTub', e.target.checked)}
            />
            <Form.Check
              label="Pool"
              checked={!!form.hasPool}
              onChange={(e) => set('hasPool', e.target.checked)}
            />
            <Form.Check
              label="Garden"
              checked={!!form.hasGarden}
              onChange={(e) => set('hasGarden', e.target.checked)}
            />
            <Form.Check
              label="Linen included"
              checked={!!form.linenIncluded}
              onChange={(e) => set('linenIncluded', e.target.checked)}
            />
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Access notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.accessNotes ?? ''}
                onChange={(e) => set('accessNotes', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col md={6}>
            <Form.Group>
              <Form.Label>Wi‑Fi notes</Form.Label>
              <Form.Control
                as="textarea"
                rows={2}
                value={form.wifiNotes ?? ''}
                onChange={(e) => set('wifiNotes', e.target.value)}
              />
            </Form.Group>
          </Col>
          <Col xs={12}>
            <Form.Label>Location (click or drag pin)</Form.Label>
            <MapPicker
              latitude={form.latitude}
              longitude={form.longitude}
              onChange={(lat, lng) => {
                set('latitude', lat);
                set('longitude', lng);
              }}
            />
            <div className="small text-muted mt-1">
              {form.latitude?.toFixed(5)}, {form.longitude?.toFixed(5)}
            </div>
          </Col>
          <Col xs={12}>
            <Alert variant="light" className="border mb-0">
              Estimated common-task turnover: <strong>{eta} minutes</strong> (from beds, baths,
              tier, pets, amenities).
            </Alert>
          </Col>
        </Row>
        <div className="mt-4 d-flex gap-2">
          <Button type="submit" disabled={saving}>
            {saving ? 'Saving…' : 'Save'}
          </Button>
          <Link to="/properties" className="btn btn-outline-secondary">
            Cancel
          </Link>
        </div>
      </Form>
    </div>
  );
}

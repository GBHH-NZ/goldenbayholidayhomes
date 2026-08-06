import { Card, Col, Row, Spinner } from 'react-bootstrap';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  LineChart,
  Line,
} from 'recharts';
import { useMemo } from 'react';
import { useTenantData } from '@/contexts/TenantDataContext';
import { PageHeader } from '@/components/ui/PageHeader';

const COLORS = ['#1a5f6e', '#2a7a8c', '#c4784a', '#5a6a72', '#0c2c3a', '#d4cbb8'];

export default function ReportsPage() {
  const { data, isLoading } = useTenantData();

  const byCategory = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of data.workLogs.filter((x) => !x.deleted)) {
      const key = l.taskCategory || 'Other';
      map.set(key, (map.get(key) || 0) + 1);
    }
    return [...map.entries()].map(([name, value]) => ({ name, value }));
  }, [data.workLogs]);

  const minutesByProperty = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of data.workLogs.filter((x) => !x.deleted)) {
      const name = data.properties.find((p) => p.id === l.propertyId)?.name ?? l.propertyId;
      map.set(name, (map.get(name) || 0) + (l.actualMinutes || 0));
    }
    return [...map.entries()]
      .map(([name, minutes]) => ({ name, minutes }))
      .sort((a, b) => b.minutes - a.minutes)
      .slice(0, 8);
  }, [data.workLogs, data.properties]);

  const logsPerDay = useMemo(() => {
    const map = new Map<string, number>();
    for (const l of data.workLogs.filter((x) => !x.deleted)) {
      map.set(l.date, (map.get(l.date) || 0) + 1);
    }
    return [...map.entries()]
      .map(([date, count]) => ({ date, count }))
      .sort((a, b) => a.date.localeCompare(b.date))
      .slice(-14);
  }, [data.workLogs]);

  if (isLoading) {
    return (
      <div className="text-center py-5">
        <Spinner animation="border" />
      </div>
    );
  }

  return (
    <div>
      <PageHeader title="Reports" subtitle="Workload and completion trends." />
      <Row className="g-3">
        <Col lg={4}>
          <Card className="ops-card h-100 border-0">
            <Card.Header className="border-0 fw-semibold" style={{ background: 'var(--foam)' }}>
              Work by category
            </Card.Header>
            <Card.Body style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={byCategory} dataKey="value" nameKey="name" outerRadius={90} label>
                    {byCategory.map((_, i) => (
                      <Cell key={i} fill={COLORS[i % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col lg={8}>
          <Card className="ops-card h-100 border-0">
            <Card.Header className="border-0 fw-semibold" style={{ background: 'var(--foam)' }}>
              Minutes logged by property
            </Card.Header>
            <Card.Body style={{ height: 280 }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={minutesByProperty}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" tick={{ fontSize: 11 }} interval={0} angle={-20} textAnchor="end" height={60} />
                  <YAxis />
                  <Tooltip />
                  <Bar dataKey="minutes" fill="#1a5f6e" />
                </BarChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
        <Col xs={12}>
          <Card className="ops-card border-0">
            <Card.Header className="border-0 fw-semibold" style={{ background: 'var(--foam)' }}>
              Work logs per day (recent)
            </Card.Header>
            <Card.Body style={{ height: 260 }}>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={logsPerDay}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" tick={{ fontSize: 11 }} />
                  <YAxis allowDecimals={false} />
                  <Tooltip />
                  <Line type="monotone" dataKey="count" stroke="#c4784a" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </Card.Body>
          </Card>
        </Col>
      </Row>
    </div>
  );
}

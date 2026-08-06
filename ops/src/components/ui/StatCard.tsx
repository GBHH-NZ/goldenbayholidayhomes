import { Link } from 'react-router-dom';

interface StatCardProps {
  label: string;
  value: number | string;
  to?: string;
  tone?: 'default' | 'warning' | 'success';
}

export function StatCard({ label, value, to, tone = 'default' }: StatCardProps) {
  const toneClass =
    tone === 'warning' ? 'border-warning' : tone === 'success' ? 'border-success' : '';

  const inner = (
    <div className={`ops-card ops-stat h-100 ${toneClass}`}>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );

  if (to) {
    return (
      <Link to={to} className="text-decoration-none text-dark d-block h-100">
        {inner}
      </Link>
    );
  }
  return inner;
}

type StatusKind =
  | 'pending'
  | 'in_progress'
  | 'completed'
  | 'overdue'
  | 'cancelled'
  | 'flagged'
  | 'issue'
  | 'damage'
  | 'follow_up'
  | string;

const LABELS: Record<string, string> = {
  pending: 'Pending',
  in_progress: 'In progress',
  completed: 'Completed',
  overdue: 'Overdue',
  cancelled: 'Cancelled',
  flagged: 'Flagged',
  issue: 'Issue',
  damage: 'Damage',
  follow_up: 'Follow up',
};

interface StatusBadgeProps {
  status: StatusKind;
  label?: string;
}

export function StatusBadge({ status, label }: StatusBadgeProps) {
  const key = (status || 'pending').toLowerCase().replace(/\s+/g, '_');
  const className = ['pending', 'in_progress', 'completed', 'overdue', 'cancelled', 'flagged', 'issue', 'damage', 'follow_up'].includes(
    key
  )
    ? key
    : 'pending';

  return <span className={`status-badge ${className}`}>{label ?? LABELS[key] ?? status}</span>;
}

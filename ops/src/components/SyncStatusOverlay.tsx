import { Badge } from 'react-bootstrap';
import { useSyncStatus } from '@/hooks/useSyncStatus';

export function SyncStatusOverlay() {
  const { status, details, pendingCount } = useSyncStatus();

  if (status === 'synced' && pendingCount === 0 && !details.includes('cached')) {
    return null;
  }

  const variant =
    status === 'synced' ? 'success' : status === 'syncing' ? 'info' : status === 'error' ? 'warning' : 'secondary';

  return (
    <div className="sync-overlay">
      <Badge bg={variant} className="px-3 py-2 shadow">
        {status === 'syncing' && <span className="spinner-border spinner-border-sm me-2" />}
        {status}
        {details ? ` · ${details}` : ''}
        {pendingCount > 0 && status !== 'offline' ? ` · ${pendingCount} pending` : ''}
      </Badge>
    </div>
  );
}

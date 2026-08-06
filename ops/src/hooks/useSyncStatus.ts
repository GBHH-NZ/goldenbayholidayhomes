import { useEffect, useState } from 'react';
import type { SyncStatus } from '@/types';
import { syncManager } from '@/services/syncManager';

export function useSyncStatus() {
  const [status, setStatus] = useState<SyncStatus>(syncManager.syncStatus);
  const [details, setDetails] = useState('');
  const [pendingCount, setPendingCount] = useState(0);

  useEffect(() => {
    return syncManager.subscribe((s, d, count) => {
      setStatus(s);
      setDetails(d);
      setPendingCount(count);
    });
  }, []);

  return { status, details, pendingCount };
}

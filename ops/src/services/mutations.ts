import { getAdapters } from '@/adapters/createAdapters';
import { applyOptimisticCacheUpdate } from './offlineCache';
import { syncManager } from './syncManager';
import type { WriteMethod } from '@/types';

export async function mutate(
  path: string,
  data: unknown,
  type: string,
  method: WriteMethod = 'set',
  onOptimistic?: () => void
): Promise<void> {
  await applyOptimisticCacheUpdate(path, data, method);
  onOptimistic?.();

  const { data: adapter } = getAdapters();
  const isOnline = navigator.onLine && adapter.isConnected();

  if (isOnline) {
    syncManager.updateSyncStatus('syncing', 'Saving...');
    try {
      await adapter.write(path, data, method);
      syncManager.updateSyncStatus('synced');
    } catch {
      syncManager.enqueue({ type, path, data, method });
      syncManager.updateSyncStatus('offline', 'Saved locally, will sync later');
    }
  } else {
    syncManager.enqueue({ type, path, data, method });
    syncManager.updateSyncStatus('offline', 'Saved locally, will sync later');
  }
}

export function tenantPath(tenantId: string, collection: string, id?: string | number): string {
  return id != null
    ? `tenants/${tenantId}/${collection}/${id}`
    : `tenants/${tenantId}/${collection}`;
}

export function newId(prefix: string): string {
  return `${prefix}_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 7)}`;
}

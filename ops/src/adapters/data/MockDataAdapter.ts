import type { DataAdapter, DataListener, ConnectionListener } from './types';
import { EMPTY_TENANT_DATA } from './types';
import type { TenantData, WriteMethod } from '@/types';
import { createSeedTenantData } from '@/data/seed';

function deepClone<T>(v: T): T {
  return JSON.parse(JSON.stringify(v)) as T;
}

function parsePath(path: string): { tenantId: string; collection: keyof TenantData; id?: string } | null {
  const parts = path.split('/').filter(Boolean);
  // tenants/{tenantId}/{collection}[/{id}]
  if (parts[0] !== 'tenants' || parts.length < 3) return null;
  const tenantId = parts[1]!;
  const collection = parts[2] as keyof TenantData;
  const id = parts[3];
  return { tenantId, collection, id };
}

/**
 * In-memory tenant store seeded with Golden Bay demo data.
 * Writes mutate the store and notify subscribers (Firebase-shaped paths).
 */
export class MockDataAdapter implements DataAdapter {
  readonly mode = 'mock' as const;
  private store = new Map<string, TenantData>();
  private listeners = new Map<string, Set<DataListener>>();
  private connectionListeners = new Set<ConnectionListener>();
  private connected = true;

  loadTenant(tenantId: string): Promise<TenantData> {
    if (!this.store.has(tenantId)) {
      this.store.set(tenantId, createSeedTenantData(tenantId));
    }
    return Promise.resolve(deepClone(this.store.get(tenantId)!));
  }

  subscribe(tenantId: string, listener: DataListener): () => void {
    if (!this.listeners.has(tenantId)) this.listeners.set(tenantId, new Set());
    this.listeners.get(tenantId)!.add(listener);

    void this.loadTenant(tenantId).then((data) => listener(data));

    return () => {
      this.listeners.get(tenantId)?.delete(listener);
    };
  }

  subscribeConnection(listener: ConnectionListener): () => void {
    this.connectionListeners.add(listener);
    listener(this.connected);
    return () => this.connectionListeners.delete(listener);
  }

  isConnected(): boolean {
    return this.connected && navigator.onLine;
  }

  /** Test helper / offline simulation */
  setConnected(connected: boolean) {
    this.connected = connected;
    this.connectionListeners.forEach((l) => l(connected && navigator.onLine));
  }

  async write(path: string, data: unknown, method: WriteMethod = 'set'): Promise<void> {
    // Simulate brief network latency
    await new Promise((r) => setTimeout(r, 40));

    if (!this.isConnected()) {
      throw new Error('Mock backend offline');
    }

    const parsed = parsePath(path);
    if (!parsed) throw new Error(`Invalid path: ${path}`);

    const { tenantId, collection, id } = parsed;
    const tenant = this.store.get(tenantId) ?? createSeedTenantData(tenantId);
    if (!this.store.has(tenantId)) this.store.set(tenantId, tenant);

    if (collection === 'deletedTasks') {
      if (method === 'remove' && id) {
        delete tenant.deletedTasks[id];
      } else if (id) {
        tenant.deletedTasks[id] = data;
      } else if (method === 'set' && data && typeof data === 'object') {
        tenant.deletedTasks = data as Record<string, unknown>;
      }
    } else {
      const listKey = collection as Exclude<keyof TenantData, 'deletedTasks'>;
      const list = tenant[listKey] as Array<{ id: string }>;

      if (!Array.isArray(list)) {
        throw new Error(`Unknown collection: ${String(collection)}`);
      }

      if (method === 'remove' && id) {
        (tenant as unknown as Record<string, unknown>)[listKey] = list.filter((item) => item.id !== id);
      } else if (id) {
        const idx = list.findIndex((item) => item.id === id);
        if (method === 'update' && idx >= 0) {
          list[idx] = { ...list[idx], ...(data as object), id };
        } else {
          const row = { ...(data as object), id } as { id: string };
          if (idx >= 0) list[idx] = row;
          else list.push(row);
        }
      } else if (method === 'set' && Array.isArray(data)) {
        (tenant as unknown as Record<string, unknown>)[listKey] = data;
      }
    }

    this.store.set(tenantId, tenant);
    this.notify(tenantId);
  }

  getEmployeesSnapshot(tenantId: string) {
    return this.store.get(tenantId)?.employees ?? createSeedTenantData(tenantId).employees;
  }

  private notify(tenantId: string) {
    const data = deepClone(this.store.get(tenantId) ?? EMPTY_TENANT_DATA());
    this.listeners.get(tenantId)?.forEach((l) => l(data));
  }
}

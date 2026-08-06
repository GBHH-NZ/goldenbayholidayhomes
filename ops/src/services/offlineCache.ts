import { openDB, type DBSchema, type IDBPDatabase } from 'idb';
import type { TenantCollection, TenantData, WriteMethod } from '@/types';
import { TENANT_COLLECTIONS } from '@/adapters/data/types';

interface OpsCacheDB extends DBSchema {
  tenantData: {
    key: string;
    value: {
      data: unknown;
      updatedAt: string;
    };
  };
}

const DB_NAME = 'gbhh-ops-cache';
const DB_VERSION = 1;

let dbPromise: Promise<IDBPDatabase<OpsCacheDB>> | null = null;

function getDb(): Promise<IDBPDatabase<OpsCacheDB>> {
  if (!dbPromise) {
    dbPromise = openDB<OpsCacheDB>(DB_NAME, DB_VERSION, {
      upgrade(db) {
        if (!db.objectStoreNames.contains('tenantData')) {
          db.createObjectStore('tenantData');
        }
      },
    });
  }
  return dbPromise;
}

function cacheKey(tenantId: string, collection: TenantCollection): string {
  return `tenant/${tenantId}/${collection}`;
}

export async function saveToCache(
  tenantId: string,
  collection: TenantCollection,
  data: unknown
): Promise<void> {
  const db = await getDb();
  await db.put('tenantData', { data, updatedAt: new Date().toISOString() }, cacheKey(tenantId, collection));
}

export async function loadFromCache<T>(
  tenantId: string,
  collection: TenantCollection
): Promise<T | null> {
  const db = await getDb();
  const entry = await db.get('tenantData', cacheKey(tenantId, collection));
  return entry ? (entry.data as T) : null;
}

export async function loadAllTenantData(tenantId: string): Promise<Partial<TenantData>> {
  const result: Partial<TenantData> = {};
  await Promise.all(
    TENANT_COLLECTIONS.map(async (col) => {
      const data = await loadFromCache(tenantId, col);
      if (data !== null) {
        (result as Record<string, unknown>)[col] = data;
      }
    })
  );
  return result;
}

export async function clearTenantCache(tenantId: string): Promise<void> {
  const db = await getDb();
  const keys = await db.getAllKeys('tenantData');
  const tenantPrefix = `tenant/${tenantId}/`;
  await Promise.all(
    keys.filter((k) => String(k).startsWith(tenantPrefix)).map((k) => db.delete('tenantData', k))
  );
}

export function parseCollectionFromPath(
  path: string
): { tenantId: string; collection: TenantCollection; id?: string } | null {
  const match = path.match(/^tenants\/([^/]+)\/([^/]+)(?:\/([^/]+))?/);
  if (!match) return null;
  const collection = match[2] as TenantCollection;
  if (!TENANT_COLLECTIONS.includes(collection)) return null;
  return { tenantId: match[1]!, collection, id: match[3] };
}

export async function applyOptimisticCacheUpdate(
  path: string,
  data: unknown,
  method: WriteMethod
): Promise<void> {
  const parsed = parseCollectionFromPath(path);
  if (!parsed) return;
  const { tenantId, collection, id } = parsed;

  if (collection === 'deletedTasks') {
    const current = (await loadFromCache<Record<string, unknown>>(tenantId, collection)) || {};
    if (method === 'remove' && id) delete current[id];
    else if (id) current[id] = data;
    else if (data && typeof data === 'object') Object.assign(current, data);
    await saveToCache(tenantId, collection, current);
    return;
  }

  const list = (await loadFromCache<Array<{ id: string }>>(tenantId, collection)) || [];
  if (method === 'remove' && id) {
    await saveToCache(
      tenantId,
      collection,
      list.filter((item) => item.id !== id)
    );
  } else if (id) {
    const idx = list.findIndex((item) => item.id === id);
    const row = { ...(typeof data === 'object' && data ? data : {}), id } as { id: string };
    if (method === 'update' && idx >= 0) {
      list[idx] = { ...list[idx], ...row };
    } else if (idx >= 0) {
      list[idx] = row;
    } else {
      list.push(row);
    }
    await saveToCache(tenantId, collection, list);
  } else if (Array.isArray(data)) {
    await saveToCache(tenantId, collection, data);
  }
}
